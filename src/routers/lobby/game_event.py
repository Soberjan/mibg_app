from fastapi import APIRouter, HTTPException, Depends

from ...dependencies import get_hostess
from ...core.hostess import Hostess

router = APIRouter(tags=["Lobby"])

@router.post('/lobby/{lobby_id}/start_personal_event')
async def start_personal_event(
        lobby_id: int,
        player_id: int,
        receiver_id: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_owner_id = """
            SELECT owner_id
            FROM lobby
            WHERE id=%s
        """
        cur.execute(get_owner_id, (lobby_id,))
        owner_id = cur.fetchone()['owner_id']
        if player_id != owner_id:
            return {'status': 'not ok', 'detail': 'you are not the owner'}

        get_random_event = """
            SELECT *
            FROM event
            WHERE type='personal'
            ORDER BY RANDOM()
            LIMIT 1
        """
        cur.execute(get_random_event)
        res = cur.fetchone()

        await hostess.sockets[lobby_id][receiver_id].send_json({'type': 'start_event', 'description': res['description'], 'effect': res['effect']})

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    return {'status': 'ok'}

@router.post('/lobby/{lobby_id}/start_global_event')
async def start_global_event(
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_owner_id = """
            SELECT owner_id
            FROM lobby
            WHERE id=%s
        """
        cur.execute(get_owner_id, (lobby_id,))
        owner_id = cur.fetchone()['owner_id']
        if player_id != owner_id:
            return {'status': 'not ok', 'detail': 'you are not the owner'}

        get_random_event = """
            SELECT *
            FROM event 
            WHERE type='global'
            ORDER BY RANDOM()
            LIMIT 1
        """
        cur.execute(get_random_event)
        res = cur.fetchone()

        for socket in hostess.sockets[lobby_id].values():
            await socket.send_json({'type': 'start_event', 'description': res['description'], 'effect': res['effect']})

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    return {'status': 'ok'}
