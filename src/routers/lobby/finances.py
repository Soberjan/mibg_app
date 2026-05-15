import datetime as dt

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
        give_credit_query = """
            INSERT INTO loan (lobby_id, balance_id, ends_at, sum, interest, state)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, balance_id
        """
        ends_at = dt.datetime.now() + dt.timedelta(seconds=loan_time)
        cur.execute(give_credit_query,
                    (lobby_id, borrower_balance_id, ends_at, loan_sum, loan_interest, "active"))
        res = cur.fetchone()
        msg = {
            "res": "ok",
            "type": "loan_given",
            "loan_sum": loan_sum,
            "interest": loan_interest,
            "id": res['id'],
            "balance_id": res['balance_id'],
            "ends_at": ends_at.isoformat()
        }
        print('giving loan')
        for socket in hostess.sockets[lobby_id].values():
            print('sending shit')
            await socket.send_json(msg)

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)

@router.post('/lobby/{lobby_id}/close_loan')
async def close_loan(
        lobby_id: int,
        loan_id: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        update_loan_status_query = """
            UPDATE loan 
            SET state='closed'
            WHERE id=%s
        """
        cur.execute(update_loan_status_query,
                    (loan_id, )
                    )
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    print('closing loan')

    msg = {
        "res": "ok",
        "type": "loan_closed",
        "id": loan_id
    }
    for socket in hostess.sockets[lobby_id].values():
        await socket.send_json(msg)

@router.get('/lobby/{lobby_id}/finance/get_loans')
async def get_loans(
        lobby_id: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_loans_query = """
            WITH balance_ids AS (
                SELECT id
                FROM balance
                WHERE lobby_id=%s
            )
            SELECT *
            FROM loan 
            WHERE state = 'active' AND balance_id IN (SELECT id FROM balance_ids)
        """
        cur.execute(get_loans_query, (lobby_id,))
        res = cur.fetchall()

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    loans = {}
    for loan in res:
        loans[loan['id']] = dict(loan)
        loans[loan['id']]['ends_at'] = loans[loan['id']]['ends_at'].isoformat();

    msg = {
        "res": "ok",
        "loans": loans
    }
    return msg
