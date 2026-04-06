from typing import Annotated

from fastapi import APIRouter, Cookie, HTTPException, Request, Query, Depends, Response, WebSocket
from fastapi.templating import Jinja2Templates
from starlette.templating import _TemplateResponse

from ..dependencies import get_hostess, get_templates
from ..core.lobby import Lobby
from ..core.hostess import Hostess

router = APIRouter(tags=["Lobby"])

@router.get('/lobby/{lobby_id}')
async def lobby_page(
        lobby_id: int,
        request: Request,
        templates: Jinja2Templates = Depends(get_templates)
    ) -> _TemplateResponse:

    print('niger')

    return templates.TemplateResponse(
            request=request,
            name='lobby.html',
            context={"lobbyId": lobby_id}
            )

@router.post('/lobby/{lobby_id}/get_status')
async def get_status(
        lobby_id: int,
        client_key: Annotated[str | None, Cookie()] = None,
        hostess: Hostess = Depends(get_hostess)
    ):
    try:
        lobby: Lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    player_status = ""
    if client_key not in hostess.clients or lobby_id not in hostess.clients[client_key].keys():
        player_status = "new"
    else:
        player_id = hostess.clients[client_key][lobby_id]
        player = lobby.players[player_id]
        player_status = player.status

    return {'status': 'ok', 'lobby_status': lobby.status, 'player_status': player_status}

@router.get('/lobby/{lobby_id}/get_state')
async def get_state(
        lobby_id: int,
        client_key: Annotated[str | None, Cookie()] = None,
        hostess: Hostess = Depends(get_hostess)
    ):
    try:
        lobby: Lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    try:
        player_id = hostess.clients[client_key][lobby_id]
    except Exception as e:
        raise HTTPException(status_code=403, detail=f"Couldn't get player_id because {e}")

    lobby_owner = lobby.owner_id == player_id
    personal_balance_id = lobby.players[player_id].get_personal_balance().id

    players = {}
    for player in lobby.players.values():
        players[player.id] = player.to_dict()

    balances = {}
    for balance in lobby.balances.values():
        balances[balance.id] = balance.to_dict()

    state = {
        "lobbyOwner": lobby_owner,
        "lobbyStatus": lobby.status,
        "localPlayerId": player_id,
        "personalBalanceId": personal_balance_id,
        "players": players,
        "balances": balances
    }

    return {'status': 'ok', 'state': state}

@router.post('/lobby/{lobby_id}/register_player')
async def register_player(
        lobby_id: int,
        name: str,
        client_key: Annotated[str | None, Cookie()] = None,
        hostess: Hostess = Depends(get_hostess),
        ):
    try:
        lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    try:
        player_id = hostess.clients[client_key][lobby_id]
    except Exception as e:
        raise HTTPException(status_code=403, detail=f"Couldn't get player_id because {e}")

    player = lobby.players[player_id]
    player.name = name
    player.status = "registered"
    player.update_db_entry()

    for ws in lobby.sockets.values():
        await ws.send_json({'type': 'player_registered', 'player_id': player_id, 'name': name})

    return {
        "status": "ok",
    }

@router.get('/lobby/{lobby_id}/get_players')
async def get_players(
        lobby_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):

    try:
        lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

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

@router.put('/lobby/{lobby_id}/send_money')
async def send_money(
        lobby_id: int,
        sender_id: int,
        receiver_id: int,
        amount: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    try:
        lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    lobby.send_money(sender_id, receiver_id, amount)
    response = {
        'sender_id': sender_id,
        'receiver_id': receiver_id,
        'sender_money': lobby.balances[sender_id].money,
        'receiver_money': lobby.balances[receiver_id].money
    }

    for ws in lobby.sockets.values():
        await ws.send_json({'type': 'money_changed', 'result': response})

    return {'status': 'ok', 'result': response}

@router.post('/lobby/{lobby_id}/start_voting')
async def start_voting(
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    try:
        lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    if player_id != lobby.owner_id:
        raise HTTPException(status_code=500, detail=f"Only lobby owner can start voting")

    lobby.status = 'voting'
    lobby.voter.start_voting_round()

@router.post('/lobby/{lobby_id}/vote')
async def vote(
        lobby_id: int,
        voter_id: int,
        elected_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    try:
        lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    try:
        lobby.voter.vote(voter_id, elected_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voting error {e}")

    return {'status': 'ok', 'info': 'further instructions will be sent via socket'}

@router.post('/lobby/{lobby_id}/choose_banker')
async def choose_banker(
        lobby_id: int,
        voter_id: int,
        elected_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    try:
        lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    # try:
    lobby.choose_banker(voter_id, elected_id)
    # except Exception as e:
        # raise HTTPException(status_code=500, detail=f"Banker error {e}")

    for socket in lobby.sockets.values():
        msg = {'type': 'banker_chosen', 'banker_id': elected_id}
        await socket.send_json(msg)

    return {'status': 'ok'}

@router.post('/lobby/{lobby_id}/start_game')
async def start_game(
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    try:
        lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    try:
        lobby.start_game()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't start game because {e}")

    for socket in lobby.sockets.values():
        msg = {'type': 'start_game'}
        await socket.send_json(msg)

    return {'status': 'ok'}
