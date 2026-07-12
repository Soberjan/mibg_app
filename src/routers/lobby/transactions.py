from fastapi import APIRouter, Cookie, HTTPException, Request, Query, Depends, Response, WebSocket

from ...dependencies import get_hostess
from ...core.hostess import Hostess

import datetime as dt

router = APIRouter(tags=["Lobby"])

@router.put('/lobby/{lobby_id}/send_money')
async def send_money(
        lobby_id: int,
        sender_id: int,
        receiver_id: int,
        amount: int,
        hostess: Hostess = Depends(get_hostess),
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_politician_personal = """
            SELECT b.id
            FROM player_balance pb
                JOIN player p ON p.id = pb.player_id
                JOIN balance b ON b.id = pb.balance_id
            WHERE p.lobby_id = %s AND p.role = 'politician' AND b.type = 'personal'
        """
        cur.execute(get_politician_personal, (lobby_id,))
        politician_personal = cur.fetchone()['id']
        if politician_personal == sender_id or politician_personal == receiver_id:
            return 'politicians balance is frozen'

        get_money_query = """
            SELECT money
            FROM balance
            WHERE id=%s
            FOR NO KEY UPDATE
        """
        cur.execute(get_money_query, (sender_id,))
        sender_money = cur.fetchone()['money']
        cur.execute(get_money_query, (receiver_id,))
        receiver_money = cur.fetchone()['money']

        sender_money -= amount
        if sender_money < 0:
            conn.rollback()
            raise HTTPException(status_code=500, detail=f"Sender doesn't have enough money")
        receiver_money += amount
        update_money_query = """
            UPDATE balance SET money=%s
            WHERE id=%s
        """
        cur.execute(update_money_query, (sender_money, sender_id,))
        cur.execute(update_money_query, (receiver_money, receiver_id,))

        add_transaction_history = """
            INSERT INTO transaction_history(lobby_id, sent_from, sent_to, sent_at, money)
            VALUES (%s, %s, %s, NOW(), %s)
        """
        cur.execute(add_transaction_history, (lobby_id, sender_id, receiver_id, amount))

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't send money because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    response = {
        'sender_id': sender_id,
        'sender_money': sender_money,
        'receiver_id': receiver_id,
        'receiver_money': receiver_money,
        'money': amount,
        'sent_at': dt.datetime.now().isoformat()
    }

    for socket in hostess.sockets[lobby_id].values():
        await socket.send_json({'type': 'money_changed', 'result': response})

    return {'status': 'ok'}
