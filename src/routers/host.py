from typing import Annotated
import random
import secrets

from fastapi import APIRouter, HTTPException, Depends, Cookie, Response

from ..dependencies import get_hostess
from ..core.hostess import Hostess

router = APIRouter(tags=["Hostess"])

@router.post('/hostess/create_lobby')
async def create_lobby(hostess: Hostess = Depends(get_hostess)):
    try:
        lobby_id = hostess.create_lobby()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't create lobby because {e}")
    return {'status': 'ok', 'lobby_id': lobby_id}

@router.post('/hostess/join_lobby')
async def join_lobby(
    lobby_id: int,
    response: Response,
    client_key: Annotated[str | None, Cookie()] = None,
    hostess: Hostess = Depends(get_hostess),
):
    # try:
    #     lobby = hostess.get_lobby(lobby_id)
    #     if lobby == None:
    #         return
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    if client_key is None:
        client_key = secrets.token_hex()
        response.set_cookie(
            key="client_key",
            value=client_key,
            httponly=True,
            samesite="lax",
        )

    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_player_id_query = """
            SELECT player_id FROM client WHERE key = %s AND lobby_id = %s
        """
        cur.execute(
            get_player_id_query,
            (client_key, lobby_id,)
        )
        player_id = cur.fetchone()
        if player_id is not None:
            return {
                'status': 'ok'
            }

        # if lobby['status'] != 'registration':
        #     raise HTTPException(
        #         status_code=403,
        #         detail="You can't join the lobby since game started."
        #     )

        coin = random.randint(1, 2)
        if coin == 1:
            role = 'jobless'
            initial_balance = '1700'
        else:
            role = 'marketer'
            initial_balance = '2200'

        player_insert = """
            INSERT INTO player (lobby_id, name, role, influence)
            VALUES (%s, %s, %s, 0)
            RETURNING id
        """
        cur.execute(player_insert, (str(lobby_id), 'dood', role))
        player_id = cur.fetchone()['id']

        balance_insert = """
            INSERT INTO balance (lobby_id, money, type)
            VALUES (%s, %s, %s)
            RETURNING id
        """
        cur.execute(balance_insert, (str(lobby_id), initial_balance, 'personal'))
        balance_id = cur.fetchone()['id']
        player_balance_insert = """
            INSERT INTO player_balance (player_id, balance_id)
            VALUES (%s, %s)
        """
        cur.execute(player_balance_insert, (str(player_id), str(balance_id)))

        client_insert = """
            INSERT INTO client (key, lobby_id, player_id)
            VALUES (%s, %s, %s)
            RETURNING id
        """
        cur.execute(client_insert, (client_key, str(lobby_id), str(player_id)))

        cur.execute('UPDATE lobby SET owner_id=%s WHERE id=%s AND owner_id IS NULL', (player_id, lobby_id,))
        conn.commit()
    except Exception as e:
        raise Exception
    finally:
         hostess.database.pool.putconn(conn)

    return {
        'status': 'ok'
    }


@router.post('/hostess/confirm_join')
async def confirm_join(
    lobby_id: int,
    player_id: int,
    hostess: Hostess = Depends(get_hostess)
):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_player_query = """
            SELECT *
            FROM player
            WHERE id=%s
        """
        cur.execute(get_player_query, (player_id,))
        player = cur.fetchone()

        p_dict = dict(player)
        p_dict['lobbyId'] = p_dict['lobby_id']
        p_dict.pop('lobby_id')
        get_balance_ids_query = """
            SELECT balance_id
            FROM player_balance
            WHERE player_id=%s
        """
        cur.execute(get_balance_ids_query, (player['id'],))
        balances = cur.fetchall()
        p_dict['balanceIds'] = [b['balance_id'] for b in balances]

        get_balance_query = """
            WITH p_bs AS (
                SELECT balance_id
                FROM player_balance
                WHERE player_id=%s
            )
            SELECT *
            FROM balance
            WHERE type='personal' AND id IN (SELECT * FROM p_bs)
        """
        cur.execute(get_balance_query, (player_id,))
        balance = dict(cur.fetchone())
        b_dict = dict(balance)
        b_dict['lobbyId'] = b_dict['lobby_id']
        b_dict.pop('lobby_id')
        get_owner_query = """
            SELECT player_id
            FROM player_balance
            WHERE balance_id=%s
        """
        cur.execute(get_owner_query, (balance['id'],))
        owner_id = cur.fetchone()['player_id']
        b_dict['ownerId'] = owner_id

        msg = {
            "type": "other_player_joined",
            "player": p_dict,
            "balance": b_dict
        }

        conn.commit()
        for p_id, socket in hostess.sockets[lobby_id].items():
            if p_id == player_id:
                continue
            try:
                await socket.send_json(msg)
            except Exception as e:
                print(f'couldn\'t send message because {e} happened')
    except Exception as e:
        print(f'socket exception {e}')
    finally:
        hostess.database.pool.putconn(conn)
