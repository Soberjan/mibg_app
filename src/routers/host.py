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
        print(e)
        print('niger')
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

    lobby_owner = False
    if len(lobby.players) == 1:
        lobby_owner = True
        lobby.owner_id = player_id

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
        "balances": balances,
        "lobby_owner": lobby_owner
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

@router.put('/hostess/send_money')
async def send_money(
        lobby_id: int,
        sender_id: int,
        receiver_id: int,
        amount: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    if lobby_id not in hostess.lobbies.keys():
        raise HTTPException(status_code=500, detail=f"Lobby with id {lobby_id} does not exist")
    lobby = hostess.get_lobby(lobby_id)

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

@router.post('/hostess/start_voting')
async def start_voting(
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    if lobby_id not in hostess.lobbies.keys():
        raise HTTPException(status_code=500, detail=f"Lobby with id {lobby_id} does not exist")

    lobby = hostess.get_lobby(lobby_id)

    if player_id != lobby.owner_id:
        raise HTTPException(status_code=500, detail=f"Only lobby owner can start voting")

    lobby.state = 'voting'
    lobby.voter.start_voting_round()

@router.post('/hostess/vote')
async def vote(
        lobby_id: int,
        voter_id: int,
        elected_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    if lobby_id not in hostess.lobbies.keys():
        raise HTTPException(status_code=500, detail=f"Lobby with id {lobby_id} does not exist")
    lobby = hostess.get_lobby(lobby_id)

    try:
        lobby.voter.vote(voter_id, elected_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voting error {e}")

    return {'status': 'ok', 'info': 'further instructions will be sent via socket'}

@router.post('/hostess/choose_banker')
async def choose_banker(
        lobby_id: int,
        voter_id: int,
        elected_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    if lobby_id not in hostess.lobbies.keys():
        raise HTTPException(status_code=500, detail=f"Lobby with id {lobby_id} does not exist")
    lobby = hostess.get_lobby(lobby_id)

    # try:
    lobby.choose_banker(voter_id, elected_id)
    # except Exception as e:
        # raise HTTPException(status_code=500, detail=f"Banker error {e}")
    print('banker chosen')

    for socket in lobby.sockets.values():
        print('niger')
        msg = {'type': 'banker_chosen', 'banker_id': elected_id}
        await socket.send_json(msg)

    return {'status': 'ok'}

@router.post('/hostess/start_game')
async def start_game(
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    if lobby_id not in hostess.lobbies.keys():
        raise HTTPException(status_code=500, detail=f"Lobby with id {lobby_id} does not exist")
    lobby = hostess.get_lobby(lobby_id)

    try:
        lobby.start_game()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't start game because {e}")

    for socket in lobby.sockets.values():
        msg = {'type': 'start_game'}
        await socket.send_json(msg)

    return {'status': 'ok'}
