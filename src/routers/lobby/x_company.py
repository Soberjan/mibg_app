from fastapi import APIRouter, HTTPException, Depends

from ...dependencies import get_hostess
from ...core.hostess import Hostess

router = APIRouter(tags=["Lobby"])

@router.post('/lobby/{lobby_id}/change_branch_owner')
async def change_branch_owner(
        lobby_id: int,
        new_owner_id: int,
        branch_id: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        update_owner = """
            UPDATE branch
            SET owner_id=%s
            WHERE id=%s
            RETURNING *
        """
        cur.execute(update_owner, (new_owner_id, branch_id))
        branch = cur.fetchone()

        for socket in hostess.sockets[lobby_id].values():
            await socket.send_json({'type': 'branch_owner_changed', 'branch': branch})

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    return {'status': 'ok'}
