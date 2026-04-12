from typing import Annotated
import secrets

from fastapi import APIRouter, Cookie, HTTPException, Request, Query, Depends, Response, WebSocket
from fastapi.templating import Jinja2Templates
from starlette.templating import _TemplateResponse

from ..dependencies import get_hostess, get_templates
from ..core.lobby import Lobby
from ..core.hostess import Hostess

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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get status because {e}")
    finally:
        hostess.database.pool.putconn(conn)
    msg = {
        'type': 'start_voting_round',
        'voting_round': '1',
        'lobby_id': lobby_id
    }
    # Доработать это говно
    lobby.notify_sockets(msg)

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
        vote_query = """
            WITH el_id AS (
                SELECT id, round
                FROM election
                WHERE lobby_id=%s AND status="voting"
            ),
            ins AS (
                INSERT INTO vote (voter_id, elected_id, election_id, round)
                VALUES (%s, %s, (SELECT id FROM el_id), (SELECT round FROM el_id))
            )
            SELECT elected_id
            FROM vote
            WHERE election_id=(SELECT id FROM el_id)
        """
        cur.execute(vote_query, (str(lobby_id), str(voter_id), str(electied_id)))
        el_ids = cur.fetchall()

        players_query = """
            SELECT id
            FROM players
            WHERE lobby_id=%s
        """
        cur.execute(players_query, (str(lobby_id),))
        player_ids = cur.fetchall()

        if len(el_ids) == len(player_ids):
            voting_result = {}
            for el_id in el_ids:
                voting_result[el_id['id']] = voting_result.get(el_id['id'], 0) + 1
            voting_sorted = sorted(voting.items(), key=lambda item: item[1], reverse=True)_

            if voting_sorted[0][1] == voting_sorted[1][1]:
                update_round_query = """
                    UPDATE election
                    SET round=round+1
                    WHERE lobby_id=%s
                    RETURNING round
                """
                cur.execute(update_round_query, (lobby_id,))
                round = cur.fetchone()['round']

                msg = {
                    'type': 'start_voting_round',
                    'round': round
                }
            else:
                msg = {
                    'type': 'end_voting',
                    'winner_id': voting_sorted[0][1]
                }

            # ДОРАБОТАТЬ
            for ws in some_sokcets:
                ws.send_json(msg)
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

    # try:
    lobby.choose_banker(voter_id, elected_id)
    # except Exception as e:
        # raise HTTPException(status_code=500, detail=f"Banker error {e}")

    for socket in lobby.sockets.values():
        msg = {'type': 'banker_chosen', 'banker_id': elected_id}
        await socket.send_json(msg)

    return {'status': 'ok'}

@router.get('/lobby/{lobby_id}/has_voted')
async def has_voted(
        lobby_id: int,
        player_id: int,
        hostess: Hostess = Depends(get_hostess),
        ):
    try:
        lobby = hostess.get_lobby(lobby_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Couldn't get lobby because {e}")

    has_voted = player_id in lobby.voter.voted_players_ids

    return {'status': 'ok', 'has_voted': has_voted}
