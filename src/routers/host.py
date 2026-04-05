from typing import Annotated
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

@router.get('/hostess/join_lobby')
async def join_lobby(
    lobby_id: int,
    response: Response,
    client_key: Annotated[str | None, Cookie()] = None,
    hostess: Hostess = Depends(get_hostess),
):
    try:
        lobby: Lobby = hostess.get_lobby(lobby_id)
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

    if client_key not in hostess.clients:
        hostess.clients[client_key] = {}

    player_id = hostess.clients[client_key].get(lobby_id)

    if player_id is None and lobby.status != 'registration':
        raise HTTPException(
            status_code=403,
            detail="You can't join the lobby since game started."
        )

    if player_id is None:
        player_id = lobby.add_player('dood', 'jobless')
        hostess.clients[client_key][lobby_id] = player_id

    if lobby.owner_id == None:
        lobby.owner_id = player_id

    return {
        'status': 'ok',
    }
