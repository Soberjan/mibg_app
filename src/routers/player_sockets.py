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

        if data['type'] == 'player_joined':
            conn = hostess.database.pool.getconn()
            try:
                cur = conn.cursor()
                get_player_query = """
                    SELECT *
                    FROM player
                    WHERE id=%s
                """
                cur.execute(get_player_query, (player_id,))
                player = cur.fetchone()

                p_dict = dict(player)
                p_dict['lobbyId'] = p_dict['lobby_id']
                p_dict.pop('lobby_id')
                get_balance_ids_query = """
                    SELECT balance_id
                    FROM player_balance
                    WHERE player_id=%s
                """
                cur.execute(get_balance_ids_query, (player['id'],))
                balances = cur.fetchall()
                p_dict['balanceIds'] = [b['balance_id'] for b in balances]

                get_balance_query = """
                    WITH p_bs AS (
                        SELECT balance_id
                        FROM player_balance
                        WHERE player_id=%s
                    )
                    SELECT *
                    FROM balance
                    WHERE type='personal' AND id IN (SELECT * FROM p_bs)
                """
                cur.execute(get_balance_query, (player_id,))
                balance = dict(cur.fetchone())
                b_dict = dict(balance)
                b_dict['lobbyId'] = b_dict['lobby_id']
                b_dict.pop('lobby_id')
                get_owner_query = """
                    SELECT player_id
                    FROM player_balance
                    WHERE balance_id=%s
                """
                cur.execute(get_owner_query, (balance['id'],))
                owner_id = cur.fetchone()['player_id']
                b_dict['ownerId'] = owner_id

                response = {
                    "type": "other_player_joined",
                    "player": p_dict,
                    "balance": b_dict 
                }

                conn.commit()
                for p_id, socket in hostess.sockets[lobby_id].items():
                    if p_id == data['player_id']:
                        continue
                    try:
                        await socket.send_json(response)
                    except Exception as e:
                        print(f'couldn\'t send message because {e} happened')
            except Exception as e:
                print(f'socket exception {e}')
            finally:
                hostess.database.pool.putconn(conn)

