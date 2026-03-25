from fastapi import APIRouter, HTTPException, Request, Query, Depends, WebSocket
from fastapi.templating import Jinja2Templates
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
    print('created lobby')
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

@router.post('/hostess/add_player')
async def add_player(
        lobby_id: int,
        name: str,
        hostess: Hostess = Depends(get_hostess),
        ):

    if lobby_id not in hostess.lobbies.keys():
        raise HTTPException(status_code=500, detail=f"Lobby with id {lobby_id} does not exist")

    lobby: Lobby = hostess.lobbies[lobby_id]
    player_id = lobby.add_player(name, "jobless")
    player = lobby.players[player_id]

    balances = {}
    for balance in player.balances.values():
        balances[balance.id] = {
            'id': balance.id,
            'type': balance.type,
            'money': balance.money
        }

    player_dict = {
        "id": player.id,
        "name": player.name,
        "role": player.role.value,
        "balances": balances
    }

    response = {
        "status": "ok",
        "player": player_dict
    }
    return response

@router.get('/hostess/get_players')
async def get_players(
        lobby_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):

    if lobby_id not in hostess.lobbies.keys():
        raise HTTPException(status_code=500, detail=f"Lobby with id {lobby_id} does not exist")

    lobby: Lobby = hostess.lobbies[lobby_id]
    players_dict = {}
    for player in lobby.players.values():
        balances = {}
        for balance in player.balances.values():
            balances[balance.id] = {
                'id': balance.id,
                'type': balance.type,
                'money': balance.money
            }
        response = {
            "status": "ok",
            "id": player.id,
            "name": player.name,
            "role": player.role.value,
            "balances": balances
        }

        players_dict[player.id] = response

    if len(players_dict) == 0:
        response = {"status": "no players yet"}
        return response

    response = {"status": "ok", "players": players_dict}
    return response
