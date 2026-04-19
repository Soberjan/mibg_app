from fastapi import APIRouter, Cookie, HTTPException, Request, Query, Depends, Response, WebSocket

from ...dependencies import get_hostess
from ...core.hostess import Hostess

router = APIRouter(tags=["Lobby"])

@router.post('/lobby/{lobby_id}/give_loan')
async def give_loan(
        lobby_id: int,
        borrower_balance_id: int,
        loan_sum: int,
        loan_interest: int,
        loan_time: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        add_election_query = """
            INSERT INTO credit (balance_id, start_time, duration_time, sum, interest, state)
            VALUES (%s, NOW(), %s, %s, %s, %s)
            RETURING id
        """
        cur.execute(add_election_query,
                    (borrower_balance_id, loan_time, loan_sum, loan_interest, "active"))
        id = cur.fetchone()[0]

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    msg = {
        "res": "ok",
        "type": "loan_given",
        "loan_sum": loan_sum,
        "interest": interest,
        "return_sum": loan_sum * (100. + interest) / 100.,
        "id": id
    }
    for socket in hostess.sockets[lobby_id].values():
        await socket.send_json(msg)

@router.post('/lobby/{lobby_id}/close_loan')
async def give_loan(
        lobby_id: int,
        loan_id: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        update_loan_status_query = """
            UPDATE credit 
            SET status='closed'
            WHERE id=%s
        """
        cur.execute(update_loan_status_query,
                    (loan_id, )
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    msg = {
        "res": "ok",
        "type": "loan_closed",
        "id": id
    }
    for socket in hostess.sockets[lobby_id].values():
        await socket.send_json(msg)
