import asyncio
import datetime as dt
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

from .config import Config

load_dotenv()
Config.init()

from .routers import host, home, player_sockets
from .routers.lobby import (
    lobby,
    test_lobby,
    registration,
    transactions,
    voting,
    finances,
    luxury,
    game_event,
    property as prop,
    question,
    messenger,
    x_company,
)
from .routers.lobby.voting import start_voting

from .core.hostess import Hostess
from .database.database import Database
from .core.lobby import Lobby, Timer


async def heartbeat(app: FastAPI):
    query = """
        UPDATE server_state
        SET heartbeat = NOW()
    """

    while True:
        db = app.state.database
        conn = db.pool.getconn()
        try:
            cur = conn.cursor()
            cur.execute(query)
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            db.pool.putconn(conn)

        await asyncio.sleep(1)


async def restore_server_state(app: FastAPI):
    db = app.state.database
    hostess = app.state.hostess

    conn = db.pool.getconn()
    try:
        cur = conn.cursor()

        last_breath_query = """
            SELECT heartbeat
            FROM server_state
        """
        cur.execute(last_breath_query)

        row = cur.fetchone()
        last_breath = row["heartbeat"]

        death_period = dt.datetime.now() - last_breath

        update_loans_ends_at = """
            UPDATE loan
            SET ends_at = ends_at + %s
            WHERE state = 'active' OR state = 'frozen'
        """
        update_loans_frozen_at = """
            UPDATE loan
            SET frozen_at = frozen_at + %s
            WHERE state = 'frozen' AND frozen_at IS NOT NULL
        """

        cur.execute(update_loans_ends_at, (death_period,))
        cur.execute(update_loans_frozen_at, (death_period,))

        update_deposits_ends_at = """
            UPDATE deposit
            SET ends_at = ends_at + %s
            WHERE state = 'active' OR state = 'frozen'
        """
        update_deposits_frozen_at = """
            UPDATE deposit
            SET frozen_at = frozen_at + %s
            WHERE state = 'frozen' AND frozen_at IS NOT NULL
        """

        cur.execute(update_deposits_ends_at, (death_period,))
        cur.execute(update_deposits_frozen_at, (death_period,))

        update_politician_term = """
            UPDATE lobby
            SET term_ends_at = term_ends_at + %s
            WHERE status NOT IN ('game_ended', 'registration', 'voting', 'choosing_banker')
        """
        update_paused_at = """
            UPDATE lobby
            SET paused_at = paused_at + %s
            WHERE status = 'paused'
        """

        cur.execute(update_politician_term, (death_period,))
        cur.execute(update_paused_at, (death_period,))

        get_lobby = """
            SELECT *
            FROM lobby
            WHERE status != 'game_ended'
        """
        cur.execute(get_lobby)
        lobbies = cur.fetchall()

        conn.commit()

        for lobby_data in lobbies:
            current_lobby = Lobby()
            hostess.lobbies[lobby_data["id"]] = current_lobby
            if lobby_data["id"] == -1:
                continue

            if lobby_data["status"] in ("game", "paused"):
                print(lobby_data)
                term_duration = lobby_data["term_ends_at"] - dt.datetime.now()

                end_term_timer = Timer(
                    start_voting,
                    [lobby_data["id"], hostess],
                    dt.datetime.now(),
                    term_duration,
                )

                current_lobby.timers.append(end_term_timer)

                if lobby_data["status"] == "paused":
                    current_lobby.pause()

            asyncio.create_task(current_lobby.update())

    except Exception:
        conn.rollback()
        raise
    finally:
        db.pool.putconn(conn)


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = Database()
    db.connect()

    app.state.database = db
    app.state.hostess = Hostess(db)
    app.state.templates = Jinja2Templates(directory="src/static/templates/")

    await restore_server_state(app)

    heartbeat_task = asyncio.create_task(heartbeat(app))

    try:
        yield
    finally:
        heartbeat_task.cancel()

        with suppress(asyncio.CancelledError):
            await heartbeat_task

app = FastAPI(lifespan=lifespan)

app.mount("/static", StaticFiles(directory="src/static"), name="static")

app.include_router(host.router)
app.include_router(home.router)
app.include_router(player_sockets.router)
app.include_router(lobby.router)
app.include_router(test_lobby.router)
app.include_router(registration.router)
app.include_router(transactions.router)
app.include_router(voting.router)
app.include_router(finances.router)
app.include_router(luxury.router)
app.include_router(game_event.router)
app.include_router(prop.router)
app.include_router(question.router)
app.include_router(messenger.router)
app.include_router(x_company.router)
