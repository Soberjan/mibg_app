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

    hostess.sockets.setdefault(lobby_id, {})[player_id] = websocket

    while True:
        try:
            data = await websocket.receive_json()
        except WebSocketDisconnect:
            print(f"player {player_id} disconnected")
            hostess.sockets[lobby_id].pop(player_id, None)
            break

        if data['type'] == "ping":
            await websocket.send_json({"type": "pong", "sentAt": data.get("sentAt")})
            continue
