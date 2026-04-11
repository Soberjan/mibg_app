from typing import Annotated
import random
import secrets

from fastapi import APIRouter, HTTPException, Depends, Cookie, Response

from database import database

from ..dependencies import get_hostess
from ..core.lobby import Lobby
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
    try:
        lobby = hostess.get_lobby(lobby_id)
        if lobby == None:
            return
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

    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_player_id_query = """
            SELECT player_id FROM client WHERE key = %s AND lobby_id = %s
        """
        cur.execute(
            get_player_id_query,
            params=(client_key, lobby_id,)
        )
        hostess.database.execute_query(get_player_id_query, (client_key, str(lobby_id),))
        player_id = cur.fetchone()
        if player_id is not None:
            return {
                'status': 'ok'
            }

        if lobby['status'] != 'registration':
            raise HTTPException(
                status_code=403,
                detail="You can't join the lobby since game started."
            )

        coin = random.randint(1, 2)
        if coin == 1:
            role = 'jobless'
            initial_balance = '1700'
        else:
            role = 'marketer'
            initial_balance = '2200'

        player_insert = """
            INSERT INTO player (lobby_id, name, role)
            VALUES (%s, %s, %s)
            RETURNING id
        """
        player_id = conn.execute(player_insert, (str(lobby_id), 'dood', role)).fetchone()['id']

        balance_insert = """
            INSERT INTO balance (lobby_id, money, type)
            VALUES (%s, %s, %s)
            RETURNING id
        """
        balance_id = conn.execute(balance_insert, (str(lobby_id), initial_balance, 'personal')).fetchone()['id']

        player_balance_insert = """
            INSERT INTO player_balance (player_id, balance_id)
            VALUES (%s, %s)
        """
        conn.execute(player_balance_insert, (str(player_id), str(balance_id)))

        hostess.clients[client_key][lobby_id] = player_id

        client_insert = """
            INSERT INTO client (key, lobby_id, player_id)
            VALUES (%s, %s, %s)
            RETURNING id
        """
        conn.execute(client_insert, (client_key, str(lobby_id), str(player_id)))

        if lobby['owner_id'] == None:
            hostess.database.execute_query('UPDATE lobby SET owner_id=%s WHERE lobby_id=%s', (player_id, lobby_id,))
    except Exception as e:
        raise Exception
    finally:
         hostess.database.pool.putconn(conn)

    return {
        'status': 'ok'
    }
