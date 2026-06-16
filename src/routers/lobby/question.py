from fastapi import APIRouter, HTTPException, Depends

from ...dependencies import get_hostess
from ...core.hostess import Hostess

router = APIRouter(tags=["Lobby"])

@router.post('/lobby/{lobby_id}/ask_question')
async def ask_question(
        lobby_id: int,
        asker_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_owner_query = """
            SELECT owner_id
            FROM lobby
            WHERE id=%s
        """

        cur.execute(get_owner_query, (lobby_id,))
        owner_id = cur.fetchone()['owner_id']
        if owner_id != asker_id:
            return {"status": "not ok", "reason": "you are not the owner"}

        get_player_role = """
            SELECT role
            FROM player
            WHERE id=%s
        """
        cur.execute(get_player_role, (player_id,))
        role = cur.fetchone()['role']
        if role == 'jobless':
            role = 'worker'
        
        get_random_question = """
            SELECT question.id, question.type, question.role, question.text, question.answer, question.reward, question.reward_type
            FROM lobby_question
            JOIN question on lobby_question.question_id = question.id
            WHERE lobby_question.lobby_id=%s AND asked=FALSE AND role=%s
            ORDER BY RANDOM()
            LIMIT 1
        """

        cur.execute(get_random_question, (lobby_id, role))
        question = cur.fetchone()
        if question is None:
            update_asked = """
                UPDATE lobby_question
                SET asked=FALSE
                WHERE lobby_id=%s AND role=%s
            """
            cur.execute(update_asked, (lobby_id, role))
            cur.execute(get_random_question, (lobby_id, role))
            question = cur.fetchone()
        set_asked = """
            UPDATE lobby_question
            SET asked=TRUE
            WHERE question_id=%s
        """
        cur.execute(set_asked, (question['id'],))

        update_player_state = """
            UPDATE player
            SET status=%s
            WHERE id=%s
        """
        answerer_state = 'asked_' + str(question['id']);
        approver_state = 'approve_' + str(question['id']);
        cur.execute(update_player_state, (answerer_state, player_id))
        cur.execute(update_player_state, (approver_state, owner_id))
        print('shit2')

        player_question_query = """
            INSERT INTO player_question(player_id, question_id)
            VALUES (%s, %s)
        """
        cur.execute(player_question_query, (player_id, question['id']))

        msg = {
            'type': 'question_asked',
            'player_id': player_id,
            'asker_id': owner_id,
            'answererState': answerer_state,
            'approverState': approver_state,
            'question': question
        }

        # отправлять ток кому надо
        for socket in hostess.sockets[lobby_id].values():
            await socket.send_json(msg)
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    return {'status': 'ok'}

@router.post('/lobby/{lobby_id}/approve_answer')
async def approve_answer(
        lobby_id: int,
        asker_id: int,
        question_id: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_owner_query = """
            SELECT owner_id
            FROM lobby
            WHERE id=%s
        """

        cur.execute(get_owner_query, (lobby_id,))
        owner_id = cur.fetchone()['owner_id']
        if owner_id != asker_id:
            return {"status": "not ok", "reason": "you are not the owner"}

        get_question = """
            SELECT *
            FROM question
            WHERE id=%s
        """
        cur.execute(get_question, (question_id,))
        question = cur.fetchone()
        print('niger1')

        get_player_id = """
            SELECT player_id
            FROM player_question
            WHERE question_id = %s
        """
        cur.execute(get_player_id, (question_id,))
        player_id = cur.fetchone()['player_id']
        print('niger2')

        if question['reward_type'] == 'influence':
            update_balance = """
                UPDATE player 
                SET influence = influence+%s
                WHERE id=%s
            """
            cur.execute(update_balance, (question['reward'], player_id))

        if question['reward_type'] == 'money':
            get_balance_id = """
                SELECT balance_id
                FROM player_balance
                WHERE player_id=%s
            """
            cur.execute(get_balance_id, (player_id,))
            balance_id = cur.fetchone()['balance_id']
            print('niger3')
            update_balance = """
                UPDATE balance
                SET money = money+%s
                WHERE id=%s
            """
            cur.execute(update_balance, (question['reward'], balance_id))
            update_gov_balance = """
                UPDATE balance
                SET money = money-%s
                WHERE lobby_id=%s AND type='gov'
            """
            cur.execute(update_gov_balance, (question['reward'], lobby_id,))

        delete_row = """
            DELETE FROM player_question
            WHERE question_id=%s
        """
        cur.execute(delete_row, (question_id,))

        update_player_state = """
            UPDATE player
            SET status=%s
            WHERE id=%s
        """
        cur.execute(update_player_state, ('game', player_id))
        cur.execute(update_player_state, ('game', owner_id))

        msg = {
            'type': 'question_approved',
            'asker_id': asker_id,
            'player_id': player_id,
            'question': question
        }

        # отправлять ток кому надо
        for socket in hostess.sockets[lobby_id].values():
            await socket.send_json(msg)
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    return {'status': 'ok'}

@router.post('/lobby/{lobby_id}/disapprove_answer')
async def disapprove_answer(
        lobby_id: int,
        asker_id: int,
        question_id: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_owner_query = """
            SELECT owner_id
            FROM lobby
            WHERE id=%s
        """

        cur.execute(get_owner_query, (lobby_id,))
        owner_id = cur.fetchone()['owner_id']
        if owner_id != asker_id:
            return {"status": "not ok", "reason": "you are not the owner"}

        get_question = """
            SELECT *
            FROM question
            WHERE id=%s
        """
        cur.execute(get_question, (question_id,))
        question = cur.fetchone()

        get_player_id = """
            SELECT player_id
            FROM player_question
            WHERE question_id = %s
        """
        cur.execute(get_player_id, (question_id,))
        player_id = cur.fetchone()['player_id']

        if question['reward_type'] == 'influence':
            update_balance = """
                UPDATE player 
                SET influence = influence-%s
                WHERE id=%s
            """
            cur.execute(update_balance, (question['reward'], player_id))

        if question['reward_type'] == 'money':
            update_balance = """
                UPDATE balance
                SET money = money-%s
                WHERE owner_id=%s
            """
            cur.execute(update_balance, (question['reward'], player_id))
            update_gov_balance = """
                UPDATE balance
                SET money = money+%s
                WHERE lobby_id=%s AND type='gov'
            """
            cur.execute(update_gov_balance, (question['reward'], lobby_id,))

        delete_row = """
            DELETE FROM player_question
            WHERE question_id=%s
        """
        cur.execute(delete_row, (question_id,))

        update_player_state = """
            UPDATE player
            SET status=%s
            WHERE id=%s
        """

        cur.execute(update_player_state, ('game', player_id))
        cur.execute(update_player_state, ('game', owner_id))

        msg = {
            'type': 'question_disapproved',
            'askerId': asker_id,
            'playerId': player_id,
            'question': question
        }

        # отправлять ток кому надо
        for socket in hostess.sockets[lobby_id].values():
            await socket.send_json(msg)
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    return {'status': 'ok'}

@router.get('/lobby/{lobby_id}/get_question')
async def get_question(
        lobby_id: int,
        question_id: int,
        hostess: Hostess = Depends(get_hostess)
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        get_question = """
            SELECT *
            FROM question
            WHERE id=%s
        """

        cur.execute(get_question, (question_id,))
        question = cur.fetchone()
        msg = {
            'status': 'ok',
            'question': question
        }
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    return msg
