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
            RETURNING balance_id
        """
        cur.execute(update_loan_status_query,
                    (loan_id, )
                    )
        balance_id = cur.fetchone()['balance_id']
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    print('closing loan')

    msg = {
        "res": "ok",
        "type": "loan_closed",
        "balance_id": balance_id,
        "id": loan_id
    }
    for socket in hostess.sockets[lobby_id].values():
        await socket.send_json(msg)

@router.post('/lobby/{lobby_id}/give_deposit')
async def give_deposit(
        lobby_id: int,
        borrower_balance_id: int,
        deposit_sum: int,
        deposit_interest: int,
        deposit_time: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        give_credit_query = """
            INSERT INTO deposit (lobby_id, balance_id, ends_at, sum, interest, state)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, balance_id
        """
        ends_at = dt.datetime.now() + dt.timedelta(seconds=deposit_time)
        cur.execute(give_credit_query,
                    (lobby_id, borrower_balance_id, ends_at, deposit_sum, deposit_interest, "active"))
        res = cur.fetchone()
        msg = {
            "res": "ok",
            "type": "deposit_given",
            "deposit_sum": deposit_sum,
            "interest": deposit_interest,
            "id": res['id'],
            "balance_id": res['balance_id'],
            "ends_at": ends_at.isoformat()
        }
        print('giving deposit')
        for socket in hostess.sockets[lobby_id].values():
            print('sending shit')
            await socket.send_json(msg)

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)

@router.post('/lobby/{lobby_id}/close_deposit')
async def close_deposit(
        lobby_id: int,
        deposit_id: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        update_deposit_status_query = """
            UPDATE deposit 
            SET state='closed'
            WHERE id=%s
            RETURNING balance_id
        """
        cur.execute(update_deposit_status_query,
                    (deposit_id, )
                    )
        balance_id = cur.fetchone()['balance_id']
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    print('closing deposit')

    msg = {
        "res": "ok",
        "type": "deposit_closed",
        "balance_id": balance_id,
        "id": deposit_id
    }
    for socket in hostess.sockets[lobby_id].values():
        await socket.send_json(msg)

@router.get('/lobby/{lobby_id}/finance/get_loans_and_deposits')
async def get_loans(
        lobby_id: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_loans_query = """
            SELECT *
            FROM loan 
            WHERE (state = 'active' or state='frozen') AND lobby_id=%s
        """
        cur.execute(get_loans_query, (lobby_id,))
        loans_res = cur.fetchall()

        get_deposits_query = """
            SELECT *
            FROM deposit
            WHERE (state = 'active' or state='frozen') AND lobby_id=%s
        """
        cur.execute(get_deposits_query, (lobby_id,))
        deposits_res = cur.fetchall()

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    loans = {}
    for loan in loans_res:
        loans[loan['id']] = dict(loan)
        loans[loan['id']]['ends_at'] = loans[loan['id']]['ends_at'].isoformat();

    deposits = {}
    for deposit in deposits_res:
        deposits[deposit['id']] = dict(deposit)
        deposits[deposit['id']]['ends_at'] = deposits[deposit['id']]['ends_at'].isoformat();

    msg = {
        "res": "ok",
        "loans": loans,
        "deposits": deposits
    }
    return msg
