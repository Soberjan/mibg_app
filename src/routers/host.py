from fastapi import APIRouter, HTTPException, Request, Query, Depends, WebSocket
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from starlette.templating import _TemplateResponse

from dependencies import get_hostess, get_templates
from core.lobby import Lobby
from core.hostess import Hostess

router = APIRouter(tags=["Analytics"])

@router.post('/hostess/create_lobby')
async def create_lobby(hostess: Hostess = Depends(get_hostess)):
    try:
        lobby_id = hostess.create_lobby()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't create lobby because {e}")
    return {'status': 'ok', 'lobby_id': lobby_id}

@router.get('/hostess/join_lobby')
async def join_lobby(
        request: Request,
        lobby_id: int,
        hostess: Hostess = Depends(get_hostess),
        templates: Jinja2Templates = Depends(get_templates)
        ) -> _TemplateResponse:

    if lobby_id not in hostess.lobbies.keys():
        raise HTTPException(status_code=500, detail=f"Lobby with id {lobby_id} does not exist")

    return templates.TemplateResponse(
            request=request,
            name='lobby.html',
            context={"lobby_id": lobby_id}
            )

@router.get('/hostess/add_player')
async def add_player(
        request: Request,
        lobby_id: int,
        name: str,
        hostess: Hostess = Depends(get_hostess),
        templates: Jinja2Templates = Depends(get_templates)
        ):

    if lobby_id not in hostess.lobbies.keys():
        raise HTTPException(status_code=500, detail=f"Lobby with id {lobby_id} does not exist")

    lobby: Lobby = hostess.lobbies[lobby_id]
    player_id = lobby.add_player(name, "jobless")

    response = {"status": "ok", "player_id": player_id}
    return response

