import datetime as dt

from fastapi import APIRouter, HTTPException, Depends

from ...dependencies import get_hostess
from ...core.hostess import Hostess
from ...core.lobby import Timer, end_term

router = APIRouter(tags=["Lobby"])

@router.post('/lobby/{lobby_id}/start_voting')
async def start_voting(
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        add_election_query = """
            INSERT INTO election (lobby_id, round, status)
            VALUES (%s, %s, %s)
        """
        cur.execute(add_election_query, (lobby_id, 1, 'voting'))

        update_lobby_status_query = """
            UPDATE lobby
            SET status='voting'
            WHERE id=%s
        """
        cur.execute(update_lobby_status_query, (lobby_id,))

        change_role = """
            UPDATE player
            SET role='jobless'
            WHERE lobby_id = %s AND role=%s
        """
        cur.execute(change_role, (lobby_id, 'banker'))
        cur.execute(change_role, (lobby_id, 'politician'))

        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    msg = {
        'type': 'start_voting_round',
        'voting_round': '1',
        'lobby_id': lobby_id
    }
    for socket in hostess.sockets[lobby_id].values():
        await socket.send_json(msg)

@router.post('/lobby/{lobby_id}/vote')
async def vote(
        lobby_id: int,
        voter_id: int,
        elected_id: int,
        hostess: Hostess = Depends(get_hostess),
    ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        insert_query = """
            WITH el_id AS (
                SELECT id, round
                FROM election
                WHERE lobby_id=%s AND status='voting'
            )
            INSERT INTO vote (voted_id, elected_id, election_id, round)
            VALUES (%s, %s, (SELECT id FROM el_id), (SELECT round FROM el_id))
        """
        cur.execute(insert_query, (str(lobby_id), str(voter_id), str(elected_id)))

        get_votes_query = """
            WITH el_id AS (
                SELECT id, round
                FROM election
                WHERE lobby_id=%s AND status='voting'
            )
            SELECT elected_id
            FROM vote
            WHERE election_id=(SELECT id FROM el_id) AND round=(SELECT round FROM el_id)
        """
        cur.execute(get_votes_query, (lobby_id,))
        el_ids = cur.fetchall()

        players_query = """
            SELECT id
            FROM player
            WHERE lobby_id=%s
        """
        cur.execute(players_query, (str(lobby_id),))
        player_ids = cur.fetchall()

        print(el_ids)
        print(player_ids)
        if len(el_ids) == len(player_ids):
            print('started to finish voting')
            voting_result = {}
            for el_id in el_ids:
                voting_result[el_id['elected_id']] = voting_result.get(el_id['elected_id'], 0) + 1
            voting_sorted = sorted(
                voting_result.items(), 
                key=lambda item: item[1], 
                reverse=True
            )

            if voting_sorted[0][1] == voting_sorted[1][1]:
                update_round_query = """
                    UPDATE election
                    SET round=round+1
                    WHERE lobby_id=%s AND status='voting'
                    RETURNING round
                """
                cur.execute(update_round_query, (lobby_id,))
                voting_round = cur.fetchone()['round']

                msg = {
                    'type': 'start_voting_round',
                    'voting_round': voting_round
                }
            else:
                update_role_query = """
                    UPDATE player
                    SET role='politician'
                    WHERE id=%s
                """
                cur.execute(update_role_query, (voting_sorted[0][0],))

                update_owner_query = """
                    UPDATE lobby
                    SET owner_id=%s
                    WHERE id=%s
                """
                cur.execute(update_owner_query, (voting_sorted[0][0], lobby_id))

                update_status = """
                    UPDATE lobby
                    SET status=%s
                    WHERE id=%s
                """
                cur.execute(update_status, ('choosing_banker', lobby_id))

                end_voting = """
                    UPDATE election
                    SET status='ended'
                    WHERE lobby_id=%s AND status='voting'
                """
                cur.execute(end_voting, (lobby_id,))

                change_gov_owner_query = """
                    WITH gov_id AS (
                        SELECT id
                        FROM balance
                        WHERE type='gov' AND lobby_id=%s
                    )
                    UPDATE player_balance
                    SET player_id=%s
                    WHERE balance_id=(SELECT id FROM gov_id)
                """
                cur.execute(change_gov_owner_query, (lobby_id, voting_sorted[0][0]))

                lobby = hostess.lobbies[lobby_id]
                end_term_timer = Timer(end_term, [hostess.sockets[lobby_id].values()], dt.datetime.now(), dt.timedelta(minutes=10))
                lobby.timers.append(end_term_timer)

                print('appending timers to lobby')
                print(f'timer {end_term_timer} starts at {end_term_timer.ends_at}')

                update_end_term = """
                    UPDATE lobby
                    SET term_ends_at=%s
                    WHERE id=%s
                """
                cur.execute(update_end_term, (end_term_timer.ends_at.isoformat(), lobby_id))

                msg = {
                    'type': 'end_voting',
                    'winner_id': voting_sorted[0][0],
                    'term_ends_at': end_term_timer.ends_at.isoformat()
                }

            print(msg)
            for socket in hostess.sockets[lobby_id].values():
                await socket.send_json(msg)
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    return {'status': 'ok', 'info': 'further instructions will be sent via socket'}

@router.post('/lobby/{lobby_id}/choose_banker')
async def choose_banker(
        lobby_id: int,
        voter_id: int,
        elected_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):

    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        choose_banker_query = """
            WITH pol_id AS (
                SELECT id
                FROM player
                WHERE id=%s AND role='politician'
            )
            UPDATE player
            SET role='banker'
            WHERE id=%s AND (SELECT * FROM pol_id) IS NOT NULL
        """
        cur.execute(choose_banker_query, (voter_id, elected_id))
        change_bank_owner_query = """
            WITH bank_id AS (
                SELECT id
                FROM balance
                WHERE type='bank' AND lobby_id=%s
            )
            UPDATE player_balance
            SET player_id=%s
            WHERE balance_id=(SELECT id FROM bank_id)
        """
        cur.execute(change_bank_owner_query, (lobby_id, elected_id))
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    for socket in hostess.sockets[lobby_id].values():
        msg = {'type': 'banker_chosen', 'banker_id': elected_id}
        await socket.send_json(msg)

    return {'status': 'ok'}

@router.get('/lobby/{lobby_id}/has_voted')
async def has_voted(
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    conn = hostess.database.pool.getconn()
    try:
        cur = conn.cursor()
        choose_banker_query = """
            WITH el_id AS (
                SELECT id
                FROM election
                WHERE lobby_id=%s AND status='voting'
            )
            SELECT id
            FROM vote
            WHERE election_id=(SELECT id FROM el_id) AND voted_id=%s
        """
        cur.execute(choose_banker_query, (lobby_id, player_id))
        voted_id = cur.fetchone()
        get_round = """
            SELECT round
            FROM election
            WHERE lobby_id=%s AND status='voting'
        """
        cur.execute(get_round, (lobby_id, ))
        voting_round = cur.fetchone()['round']
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)

    has_voted = voted_id is None

    return {'status': 'ok', 'has_voted': has_voted, 'voting_round': voting_round}
