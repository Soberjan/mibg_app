from fastapi import APIRouter, HTTPException, Depends

from ...dependencies import get_hostess
from ...core.hostess import Hostess

router = APIRouter(tags=["Lobby"])

@router.post('/lobby/{lobby_id}/buy_luxury')
async def buy_luxury(
        lobby_id: int,
        buyer_id: int,
        luxury_id: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_luxury_price = """
            SELECT price, influence
            FROM luxury
            WHERE id=%s
        """
        cur.execute(get_luxury_price, (luxury_id,))
        res = cur.fetchone()
        price = res['price']
        influence = res['influence']
        get_money_query = """
            SELECT money
            FROM balance
            WHERE id=%s
        """
        cur.execute(get_money_query, (buyer_id,))
        buyer_money = cur.fetchone()['money']
        if buyer_money < price:
            raise HTTPException(status_code=500, detail=f"Buyer doesn't have enough money")

        add_luxury_query = """
            INSERT INTO balance_luxury(balance_id, luxury_id)
            VALUES (%s, %s)
        """
        cur.execute(add_luxury_query, (buyer_id, luxury_id))

        get_player_id = """
            SELECT player_id
            FROM player_balance
            WHERE balance_id=%s
        """
        cur.execute(get_player_id, (buyer_id,))
        player_id = cur.fetchone()['player_id']

        update_influence = """
            UPDATE player
            SET influence=influence+%s
            WHERE id=%s
        """
        cur.execute(update_influence, (influence, player_id))

        update_money_query = """
            UPDATE balance SET money=money-%s
            WHERE id = %s
            RETURNING money
        """
        cur.execute(update_money_query, (price, buyer_id))
        buyer_money = cur.fetchone()['money']

        update_bank_money_query = """
            UPDATE balance SET money=money+%s
            WHERE lobby_id=%s AND type='bank'
            RETURNING money, id
        """
        cur.execute(update_bank_money_query, (price, lobby_id))
        bank_data = cur.fetchone()
        msg = {
            'sender_id': buyer_id,
            'sender_money': buyer_money,
            'receiver_id': bank_data['id'],
            'receiver_money': bank_data['money']
        }

        for socket in hostess.sockets[lobby_id].values():
            await socket.send_json({'type': 'money_changed', 'result': msg})

        for socket in hostess.sockets[lobby_id].values():
            await socket.send_json({'type': 'influence_updated', 'player_id': player_id, 'influence': influence})

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    return {'status': 'ok'}
