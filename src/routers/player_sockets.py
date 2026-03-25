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
            for p_id, socket in lobby.sockets.items():
                if p_id == data['player_id']:
                    continue
                player = lobby.players[data['player_id']]
                balance = lobby.get_balance(p_id)
                await socket.send_json({
                    "type": "other_player_joined",
                    "player_name": player.name,
                    "player_id": p_id,
                    "player_role": player.role.value,
                    "assigned_balance_id": balance.id,
                    "money": 0
                })

        if data['type'] == 'vote':
            pass
        if data['type'] == 'send_money':
            pass

