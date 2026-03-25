from fastapi import APIRouter, HTTPException, Request, Query, Depends, WebSocket

from dependencies import get_hostess_ws
from core.hostess import Hostess

router = APIRouter(tags=["Analytics"])

@router.websocket('/lobby')
async def player_socket(
        websocket: WebSocket,
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess_ws),
        ):
    print("entered websocket endpoint", lobby_id, player_id)
    await websocket.accept()
    lobby = hostess.get_lobby(lobby_id)
    lobby.sockets[player_id] = websocket

    while True:
        data = await websocket.receive_json()
        if data['type'] == 'player_joined':
            player = lobby.players[data['player_id']]

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
            }
            print(player_dict)

            response = {
                "type": "other_player_joined",
                "player": player_dict
            }

            for p_id, socket in lobby.sockets.items():
                if p_id == data['player_id']:
                    continue
                await socket.send_json(response)

        if data['type'] == 'vote':
            pass
        if data['type'] == 'send_money':
            pass

