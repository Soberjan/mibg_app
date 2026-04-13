from typing import Annotated

from fastapi import APIRouter, Cookie, HTTPException, Request, Query, Depends, Response, WebSocket

from ...dependencies import get_hostess
from ...core.hostess import Hostess

router = APIRouter(tags=["Lobby"])

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

    for socket in hostess.sockets[lobby_id].values():
        await socket.send_json({'type': 'player_registered', 'player_id': player_id, 'name': name})

    return {
        "status": "ok",
    }
