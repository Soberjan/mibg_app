from typing import Annotated
import secrets

from fastapi import APIRouter, Cookie, HTTPException, Request, Query, Depends, Response, WebSocket

from ...dependencies import get_hostess
from ...core.hostess import Hostess

router = APIRouter(tags=["Lobby"])

@router.get('/lobby/{lobby_id}/is_free')
async def is_free(
        lobby_id: int,
        role: str,
        client_key: Annotated[str | None, Cookie()] = None,
        hostess: Hostess = Depends(get_hostess)
    ):
    if lobby_id != -1:
        raise HTTPException(status_code=500, detail=f"Only lobby_id -1 get execute this endpoint")

    conn = hostess.database.pool.getconn()
    free = True
    try:
        cur = conn.cursor()

        get_players_query = """
            SELECT *
            FROM player
            WHERE lobby_id=-1
        """
        cur.execute(get_players_query)
        players = cur.fetchall()
        if -1 in hostess.sockets.keys():
            connected_player_ids = hostess.sockets[-1].keys()
            for player in players:
                if player['role'] == role:
                    free = player['id'] not in connected_player_ids
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    return {'status': 'ok', 'free': free}

@router.post('/lobby/{lobby_id}/assign_client_key')
async def assign_client_key(
    lobby_id: int,
    role: str,
    response: Response,
    client_key: Annotated[str | None, Cookie()] = None,
    hostess: Hostess = Depends(get_hostess),
):
    if client_key is None:
        client_key = secrets.token_hex()
        response.set_cookie(
            key="client_key",
            value=client_key,
            httponly=True,
            samesite="lax",
        )

    if client_key not in hostess.clients.keys():
        hostess.clients[client_key] = {}

    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_players_query = """
            SELECT *
            FROM player
            WHERE lobby_id=-1 AND role=%s
        """
        cur.execute(get_players_query, (role,))
        player = cur.fetchone()

        insert_key_query = """
            INSERT INTO client (key, lobby_id, player_id)
            VALUES (%s, %s, %s)
            ON CONFLICT (key, lobby_id)
            DO UPDATE SET player_id = EXCLUDED.player_id;
        """
        cur.execute(insert_key_query, (client_key, lobby_id, player['id']))

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    return {
        'status': 'ok'
    }
