from typing import Annotated
import secrets

from fastapi import APIRouter, Cookie, HTTPException, Request, Query, Depends, Response, WebSocket
from fastapi.templating import Jinja2Templates
from starlette.templating import _TemplateResponse

from ..dependencies import get_hostess, get_templates
from ..core.lobby import Lobby
from ..core.hostess import Hostess

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

    try:
        lobby: Lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    for player_id in lobby.sockets.keys():
        if lobby.players[player_id].role == role:
            print(f'role {role} already picked')
            return {'status': 'ok', 'free': False}

    print(f'role {role} is free')
    return {'status': 'ok', 'free': True}

@router.post('/lobby/{lobby_id}/assign_client_key')
async def assign_client_key(
    lobby_id: int,
    role: str,
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

    if client_key not in hostess.clients.keys():
        print('added client key to clients')
        hostess.clients[client_key] = {}

    player_id = None
    for player in lobby.players.values():
        if role == player.role.value:
            player_id = player.id
    print(lobby.players)
    print(player_id)

    hostess.clients[client_key][lobby_id] = player_id

    return {
        'status': 'ok',
    }
