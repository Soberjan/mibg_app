from fastapi import APIRouter, HTTPException, Request, Query, Depends, WebSocket

from dependencies import get_hostess
from core.hostess import Hostess

router = APIRouter(tags=["Analytics"])

@router.websocket('/lobby')
async def player_socket(websocket: WebSocket,
                        player_id: int,
                        lobby_id: int,
                        hostess: Hostess = Depends(get_hostess),
                        ):
    await websocket.accept()
    while True:
        data = await websocket.receive_json()
        if data['type'] == 'add_player':
            pass
        if data['type'] == 'vote':
            pass
        if data['type'] == 'send_money':
            pass

