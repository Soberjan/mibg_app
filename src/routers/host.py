from typing import Annotated
import random
import secrets

from fastapi import APIRouter, HTTPException, Depends, Cookie, Response

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

    query = """
        SELECT player_id FROM client WHERE key = %s AND lobby_id = %s
    """
    res = hostess.database.execute_query(query, (client_key, str(lobby_id),))
    player_id = res['player_id'] if res else None

    if player_id is None and lobby['status'] != 'registration':
        raise HTTPException(
            status_code=403,
            detail="You can't join the lobby since game started."
        )
    
    if player_id is None:
        coin = random.randint(1, 2)
        if coin == 1:
            role = 'jobless'
            initial_balance = '1700'
        else:
            role = 'marketer'
            initial_balance = '2200'

        player_id = hostess.database.insert_entry(
            'player',
            ['lobby_id', 'name', 'role'],
            [str(lobby_id), 'dood', role]
        )
        balance_id = hostess.database.insert_entry(
            'balance',
            ['lobby_id', 'money', 'type'],
            [str(lobby_id), initial_balance, 'personal']
        )
        hostess.database.insert_entry(
            'player_balance',
            ['player_id', 'balance_id'],
            [str(player_id), str(balance_id)]
        )
        hostess.database.insert_entry(
            'client',
            ['key', 'lobby_id', 'player_id'],
            [client_key, str(lobby_id), str(player_id)]
        )

        hostess.clients[client_key][lobby_id] = player_id

    if lobby['owner_id'] == None:
        hostess.database.execute_query('UPDATE lobby SET owner_id=%s WHERE lobby_id=%s', (player_id, lobby_id,))

    return {
        'status': 'ok'
    }
