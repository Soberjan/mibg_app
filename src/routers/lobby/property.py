from fastapi import APIRouter, HTTPException, Depends

from ...dependencies import get_hostess
from ...core.hostess import Hostess

router = APIRouter(tags=["Lobby"])

@router.post('/lobby/{lobby_id}/give_property')
async def give_property(
        lobby_id: int,
        player_id: int,
        new_owner_id: int,
        property_id: int,
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

        old_owner = """
            SELECT owner_id
            FROM property
            WHERE id=%s
        """
        cur.execute(old_owner, (property_id,))
        old_owner_id = cur.fetchone()['owner_id']

        update_owner = """
            UPDATE property
            SET owner_id=%s
            WHERE id=%s
            RETURNING *
        """
        cur.execute(update_owner, (new_owner_id, property_id))
        prop = dict(cur.fetchone())
        prop['ownerId'] = prop['owner_id']
        prop.pop('owner_id')
        prop['tileNumber'] = prop['tile_number']
        prop.pop('tile_number')
        prop['lobbyId'] = prop['lobby_id']
        prop.pop('lobby_id')

        msg = {
            'type': 'give_property',
            'oldOwnerId': old_owner_id,
            'property': prop,
        }

        for socket in hostess.sockets[lobby_id].values():
            await socket.send_json(msg)

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    return {'status': 'ok'}

@router.post('/lobby/{lobby_id}/upgrade_property')
async def upgrade_property(
        lobby_id: int,
        player_id: int,
        property_id: int,
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

        upgrade_property = """
            UPDATE property
            SET level=2, income=income*2
            WHERE id=%s AND level=1
            RETURNING *
        """
        cur.execute(upgrade_property, (property_id,))
        res = cur.fetchone()
        if not res:
            return {'status': 'not ok', 'detail': 'already upgraded'}

        prop = dict(res)
        prop['ownerId'] = prop['owner_id']
        prop.pop('owner_id')
        prop['tileNumber'] = prop['tile_number']
        prop.pop('tile_number')
        prop['lobbyId'] = prop['lobby_id']
        prop.pop('lobby_id')

        msg = {
            'type': 'give_property',
            'property': prop
        }

        for socket in hostess.sockets[lobby_id].values():
            await socket.send_json(msg)

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    return {'status': 'ok'}
