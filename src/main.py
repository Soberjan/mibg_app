from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv
from fastapi.templating import Jinja2Templates

from .config import Config
load_dotenv()
Config.init()
from .routers import host, home, player_sockets
from .routers.lobby import lobby, test_lobby, registration, transactions, voting, finances
from .core.hostess import Hostess
from .database.database import Database

app = FastAPI()

app.mount("/static", StaticFiles(directory="src/static"), name="static")

db = Database()
db.connect()
app.state.database = db

app.state.hostess = Hostess(app.state.database)

app.state.templates = Jinja2Templates(directory='src/static/templates/')

app.include_router(host.router)
app.include_router(home.router)
app.include_router(player_sockets.router)
app.include_router(lobby.router)
app.include_router(test_lobby.router)
app.include_router(registration.router)
app.include_router(transactions.router)
app.include_router(voting.router)
app.include_router(finances.router)

# async def heartbeat():
#     query = """
#         UPDATE server_state
#         SET heartbeat=NOW()
#     """
#     while True:
#         conn = db.pool.getconn()
#         try:
#             cur = conn.cursor()
#             cur.execute(query)`
#         finally:
#             db.pool.putconn(conn)
#         await asyncio.sleep(1.)
#
# @app.on_event("startup")
# async def startup():
#     asyncio.create_task(heartbeat())
#
#     active_loans_query = """
#         SELECT lobby_id, loan_id, start_time 
#         FROM loan
#         JOIN balance ON loan.balance_id = balance.id
#         WHERE state='active'
#     """
#     conn = db.pool.getconn()
#     try:
#         cur = conn.cursor()
#         cur.execute(active_loans_query)
#         loans = cur.fetchall()
#         for loan in loans:
#             print('do shit')
#             `
