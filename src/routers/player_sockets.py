from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from ..dependencies import get_hostess_ws
from ..core.hostess import Hostess

router = APIRouter(tags=["Sockets"])

@router.websocket('/lobby')
async def player_socket(
        websocket: WebSocket,
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess_ws),
    ):
    await websocket.accept()
    lobby = hostess.get_lobby(lobby_id)
    lobby.sockets[player_id] = websocket

    while True:
        try:
            data = await websocket.receive_json()
        except WebSocketDisconnect:
            print(f"player {player_id} disconnected")
            lobby.sockets.pop(player_id, None)
            break

        if data['type'] == 'player_joined':
            player = lobby.players[data['player_id']]

            balances = {}
            for balance in player.balances.values():
                balances[balance.id] = balance.to_dict()

            player_dict = player.to_dict()

            response = {
                "type": "other_player_joined",
                "player": player_dict,
                "balances": balances
            }

            for p_id, socket in lobby.sockets.items():
                if p_id == data['player_id']:
                    continue
                try:
                    await socket.send_json(response)
                except Exception as e:
                    print(f'couldn\'t send message because {e} happened')
