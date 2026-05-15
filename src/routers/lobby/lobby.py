from typing import Annotated
import datetime as dt

from fastapi import APIRouter, Cookie, HTTPException, Request, Query, Depends, Response, WebSocket
from fastapi.templating import Jinja2Templates
from starlette.templating import _TemplateResponse

from ...dependencies import get_hostess, get_templates
from ...core.hostess import Hostess

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
            cur.execute(player_status_query, (player_id['player_id'],))
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
        cur.execute(lobby_query, (lobby_id,))
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
            get_owner_query = """
                SELECT player_id
                FROM player_balance
                WHERE balance_id=%s
            """
            cur.execute(get_owner_query, (b['id'],))
            owner_id = cur.fetchone()['player_id']
            b_dict['ownerId'] = owner_id
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
            get_balance_ids_query = """
                SELECT balance_id
                FROM player_balance
                WHERE player_id=%s
            """
            cur.execute(get_balance_ids_query, (p['id'],))
            balance_ids = cur.fetchall()
            p_dict['balanceIds'] = [b['balance_id'] for b in balance_ids]
            players[p['id']] = p_dict

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get state because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    state = {
        "lobbyOwner": lobby_owner,
        "startedAt": lobby['started_at'],
        "lobbyStatus": lobby['status'],
        "localPlayerId": local_player_id,
        "personalBalanceId": personal_balance_id,
        "govBalanceId": gov_balance_id,
        "bankBalanceId": bank_balance_id,
        "players": players,
        "balances": balances
    }

    return {'status': 'ok', 'state': state}

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

@router.post('/lobby/{lobby_id}/start_game')
async def start_game(
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        update_status_query = """
            UPDATE lobby
            SET status='game'
            WHERE id=%s AND owner_id=%s
            RETURNING id
        """
        cur.execute(update_status_query, (lobby_id, player_id))
        res_id = cur.fetchone()
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get state because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    if not res_id:
        return {'status': 'bad', 'info': 'you are not allowed to start game or whatever'}

    for socket in hostess.sockets[lobby_id].values():
        msg = {'type': 'start_game'}
        await socket.send_json(msg)

    return {'status': 'ok'}

@router.post('/lobby/{lobby_id}/pause')
async def pause(
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess)
        ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        pause_lobby_query = """
            UPDATE lobby
            SET status='paused', paused_at=NOW()
            WHERE id=%s AND owner_id=%s AND status='game'
            RETURNING id
        """
        cur.execute(pause_lobby_query, (lobby_id, player_id))
        res_id = cur.fetchone()
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get state because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    if not res_id:
        return {'status': 'bad', 'info': 'you are not allowed to start game or whatever'}

    for socket in hostess.sockets[lobby_id].values():
        msg = {'type': 'game_paused'}
        await socket.send_json(msg)

    return {'status': 'ok'}

@router.post('/lobby/{lobby_id}/resume')
async def resume(
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess)
        ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        pause_lobby_query = """
            UPDATE lobby
            SET status='game'
            WHERE id=%s AND owner_id=%s AND status='paused'
            RETURNING id, paused_at, started_at
        """
        cur.execute(pause_lobby_query, (lobby_id, player_id))
        res = cur.fetchone()

        pause_duration = dt.datetime.now() - res['paused_at']
        started_at = res['started_at'] + pause_duration

        update_started_at_query = """
            UPDATE lobby
            SET started_at = %s
            WHERE id=%s AND owner_id=%s
        """
        cur.execute(update_started_at_query, (started_at, lobby_id, player_id))
        update_loan_timers = """
            UPDATE loan
            SET ends_at = ends_at + %s
            WHERE lobby_id=%s AND state != 'closed'
            RETURNING id, ends_at
        """
        cur.execute(update_loan_timers, (pause_duration, lobby_id))
        res = cur.fetchall()
        loans = {}
        for r in res:
            r['ends_at'] = r['ends_at'].isoformat()
            loans[r['id']] = r

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get state because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    for socket in hostess.sockets[lobby_id].values():
        msg = {'type': 'game_resumed', 'started_at': started_at.isoformat(), 'loans': loans}
        await socket.send_json(msg)

    return {'status': 'ok'}
