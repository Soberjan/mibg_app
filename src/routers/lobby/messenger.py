from fastapi import APIRouter, HTTPException, Depends

from ...dependencies import get_hostess
from ...core.hostess import Hostess

router = APIRouter(tags=["Lobby"])

@router.post('/lobby/{lobby_id}/send_message')
async def send_message(
        lobby_id: int,
        sent_from: int,
        sent_to: int,
        text: str,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        insert_message = """
            INSERT INTO message(lobby_id, sent_from, sent_to, text, sent_at)
            VALUES(%s, %s, %s, %s, NOW())
            RETURNING *
        """
        cur.execute(insert_message, (lobby_id, sent_from, sent_to, text))
        msg = cur.fetchone()
        msg['sent_at'] = msg['sent_at'].isoformat()

        for socket in hostess.sockets[lobby_id].values():
            await socket.send_json({'type': 'message_sent', 'msg': msg})

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    return {'status': 'ok'}
