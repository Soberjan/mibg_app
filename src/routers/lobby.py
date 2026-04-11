from typing import Annotated
import secrets

from fastapi import APIRouter, Cookie, HTTPException, Request, Query, Depends, Response, WebSocket
from fastapi.templating import Jinja2Templates
from starlette.templating import _TemplateResponse

from ..dependencies import get_hostess, get_templates
from ..core.lobby import Lobby
from ..core.hostess import Hostess

router = APIRouter(tags=["Lobby"])

@router.get('/lobby/{lobby_id}')
async def lobby_page(
        lobby_id: int,
        request: Request,
        templates: Jinja2Templates = Depends(get_templates)
    ) -> _TemplateResponse:

    return templates.TemplateResponse(
            request=request,
            name='lobby.html',
            context={"lobbyId": lobby_id}
            )

@router.post('/lobby/{lobby_id}/get_status')
async def get_status(
        lobby_id: int,
        client_key: Annotated[str | None, Cookie()] = None,
        hostess: Hostess = Depends(get_hostess)
    ):

    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()

        lobby_status_query = """
            SELECT status
            FROM lobby
            WHERE id = %s
        """
        cur.execute(lobby_status_query, (lobby_id,))
        lobby_status = cur.fetchone()['status']

        player_id_query = """
            SELECT player_id
            FROM client
            WHERE key=%s AND lobby_id=%s
        """
        cur.execute(player_id_query, (client_key, lobby_id,))
        player_id = cur.fetchone()

        if player_id is None:
            player_status = 'new'
        else:
            player_status_query = """
                SELECT status
                FROM player
                WHERE id=%s
            """
            cur.execute(player_status_query, (player_id,))
            player_status = cur.fetchone()['status']
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    return {'status': 'ok', 'lobby_status': lobby_status, 'player_status': player_status}

@router.get('/lobby/{lobby_id}/get_state')
async def get_state(
        lobby_id: int,
        client_key: Annotated[str | None, Cookie()] = None,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()

        lobby_query = """
            SELECT *
            FROM lobby
            WHERE id=%s
        """
        cur.execute(lobby_query, (client_key, lobby_id,))
        lobby = dict(cur.fetchone())

        player_id_query = """
            SELECT player_id
            FROM client
            WHERE key=%s AND lobby_id=%s
        """
        cur.execute(player_id_query, (client_key, lobby_id,))
        local_player_id = cur.fetchone()['player_id']

        lobby_owner = lobby['owner_id'] == local_player_id

        balance_id_query = """
            SELECT *
            FROM balance
            WHERE lobby_id=%s
        """
        cur.execute(balance_id_query, (lobby_id,))
        res = cur.fetchall()
        balances = {}

        gov_balance_id = None
        bank_balance_id = None
        for b in res:
            b_dict = dict(b)
            b_dict['lobbyId'] = b_dict['lobby_id']
            b_dict.pop('lobby_id')
            balances[b['id']] = b_dict
            if b['type'] == 'gov':
                gov_balance_id = b['id']
            elif b['type'] == 'bank':
                bank_balance_id = b['id']

        personal_balance_id_query = """
            SELECT balance_id
            FROM player_balance
            JOIN balance ON player_balance.balance_id=balance.id
            WHERE player_id=%s AND type='personal'
        """
        cur.execute(personal_balance_id_query, (local_player_id,))
        personal_balance_id = cur.fetchone()['balance_id']

        players_query = """
            SELECT *
            FROM player
            WHERE lobby_id=%s
        """
        cur.execute(players_query, (lobby_id,))
        res = cur.fetchall()
        players = {}
        for p in res:
            p_dict = dict(p)
            p_dict['lobbyId'] = p_dict['lobby_id']
            p_dict.pop('lobby_id')
            players[p['id']] = p_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get state because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    state = {
        "lobbyOwner": lobby_owner,
        "lobbyStatus": lobby['status'],
        "localPlayerId": local_player_id,
        "personalBalanceId": personal_balance_id,
        "govBalanceId": gov_balance_id,
        "bankBalanceId": bank_balance_id,
        "players": players,
        "balances": balances
    }

    return {'status': 'ok', 'state': state}

@router.post('/lobby/{lobby_id}/register_player')
async def register_player(
        lobby_id: int,
        name: str,
        client_key: Annotated[str | None, Cookie()] = None,
        hostess: Hostess = Depends(get_hostess),
        ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()

        player_id_query = """
            SELECT player_id
            FROM client
            WHERE key=%s AND lobby_id=%s
        """
        cur.execute(player_id_query, (client_key, lobby_id,))
        player_id = cur.fetchone()['player_id']

        register_player_query = """
            UPDATE player
            SET name=%s, status=%s
            WHERE id=%s
        """
        cur.execute(register_player_query, (name, 'registered', player_id,))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get state because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    for ws in lobby.sockets.values():
        await ws.send_json({'type': 'player_registered', 'player_id': player_id, 'name': name})

    return {
        "status": "ok",
    }

@router.get('/lobby/{lobby_id}/get_players')
async def get_players(
        lobby_id: int,
        hostess: Hostess = Depends(get_hostess),
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        players_query = """
            SELECT *
            FROM player
            WHERE lobby_id=%s
        """
        cur.execute(players_query, (lobby_id,))
        res = cur.fetchall()
        players = {}
        for p in res:
            p_dict = dict(p)
            p_dict['lobbyId'] = p_dict['lobby_id']
            p_dict.pop('lobby_id')
            players[p['id']] = p_dict
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get state because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    response = {"status": "ok", "players": players}
    return response

@router.put('/lobby/{lobby_id}/send_money')
async def send_money(
        lobby_id: int,
        sender_id: int,
        receiver_id: int,
        amount: int,
        hostess: Hostess = Depends(get_hostess),
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_money_query = """
            SELECT money
            FROM balance
            WHERE id=%s
            FOR NO KEY UPDATE
        """
        cur.execute(get_money_query, (sender_id,))
        sender_money = cur.fetchone()['money']
        cur.execute(get_money_query, (receiver_id,))
        receiver_money = cur.fetchone()['money']

        sender_money -= amount
        if sender_money < 0:
            conn.rollback()
            raise HTTPException(status_code=500, detail=f"Sender doesn't have enough money")
        receiver_money += amount
        update_money_query = """
            UPDATE balance SET money=%s
            WHERE id=%s
        """
        cur.execute(update_money_query, (sender_money, sender_id,))
        cur.execute(update_money_query, (receiver_money, receiver_id,))
        
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't send money because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    response = {
        'sender_id': sender_id,
        'sender_money': sender_money,
        'receiver_id': receiver_id,
        'receiver_money': receiver_money

    }

    for ws in lobby.sockets.values():
        await ws.send_json({'type': 'money_changed', 'result': response})

    return {'status': 'ok', 'result': response}

@router.post('/lobby/{lobby_id}/start_voting')
async def start_voting(
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    try:
        lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    if player_id != lobby.owner_id:
        raise HTTPException(status_code=500, detail=f"Only lobby owner can start voting")

    lobby.status = 'voting'
    lobby.voter.start_voting_round()

@router.post('/lobby/{lobby_id}/vote')
async def vote(
        lobby_id: int,
        voter_id: int,
        elected_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    try:
        lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    try:
        lobby.voter.vote(voter_id, elected_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voting error {e}")

    return {'status': 'ok', 'info': 'further instructions will be sent via socket'}

@router.post('/lobby/{lobby_id}/choose_banker')
async def choose_banker(
        lobby_id: int,
        voter_id: int,
        elected_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    try:
        lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    # try:
    lobby.choose_banker(voter_id, elected_id)
    # except Exception as e:
        # raise HTTPException(status_code=500, detail=f"Banker error {e}")

    for socket in lobby.sockets.values():
        msg = {'type': 'banker_chosen', 'banker_id': elected_id}
        await socket.send_json(msg)

    return {'status': 'ok'}

@router.post('/lobby/{lobby_id}/start_game')
async def start_game(
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    try:
        lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    lobby.status = 'game'

    for socket in lobby.sockets.values():
        msg = {'type': 'start_game'}
        await socket.send_json(msg)

    return {'status': 'ok'}

@router.get('/lobby/{lobby_id}/has_voted')
async def has_voted(
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    try:
        lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    has_voted = player_id in lobby.voter.voted_players_ids

    return {'status': 'ok', 'has_voted': has_voted}

@router.get('/lobby/{lobby_id}/is_free')
async def is_free(
        lobby_id: int,
        role: str,
        client_key: Annotated[str | None, Cookie()] = None,
        hostess: Hostess = Depends(get_hostess)
    ):
    if lobby_id != -1:
        raise HTTPException(status_code=500, detail=f"Only lobby_id -1 get execute this endpoint")

    try:
        lobby: Lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    for player_id in lobby.sockets.keys():
        if lobby.players[player_id].role == role:
            print(f'role {role} already picked')
            return {'status': 'ok', 'free': False}

    print(f'role {role} is free')
    return {'status': 'ok', 'free': True}

@router.post('/lobby/{lobby_id}/assign_client_key')
async def assign_client_key(
    lobby_id: int,
    role: str,
    response: Response,
    client_key: Annotated[str | None, Cookie()] = None,
    hostess: Hostess = Depends(get_hostess),
):
    try:
        lobby: Lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    if client_key is None:
        client_key = secrets.token_hex()
        response.set_cookie(
            key="client_key",
            value=client_key,
            httponly=True,
            samesite="lax",
        )

    if client_key not in hostess.clients.keys():
        print('added client key to clients')
        hostess.clients[client_key] = {}

    player_id = None
    for player in lobby.players.values():
        if role == player.role.value:
            player_id = player.id
    print(lobby.players)
    print(player_id)

    hostess.clients[client_key][lobby_id] = player_id

    return {
        'status': 'ok',
    }
