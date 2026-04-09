from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv
from fastapi.templating import Jinja2Templates

from .config import Config
load_dotenv()
Config.init()
from .routers import host, home, player_sockets, lobby
from .core.hostess import Hostess
from .core.lobby import Lobby
from .core.player import Player
from .core.balance import Balance
from .database.database import Database
from .enums import enums

app = FastAPI()

app.mount("/static", StaticFiles(directory="src/static"), name="static")

db = Database()
db.connect()
app.state.database = db

app.state.hostess = Hostess(app.state.database)

l = Lobby('game', db, False)

p1 = Player('sasha', enums.PlayerRole('politician'), -1, db)
p1.id = -1
p1.is_registered = True
p2 = Player('petya', enums.PlayerRole('banker'), -1, db)
p2.is_registered = True
p2.id = -2
p3 = Player('vasya', enums.PlayerRole('jobless'), -1, db)
p3.is_registered = True
p3.id = -3

b1 = Balance(-1, -1, 'personal', db, 1700)
b1.id = -1
b1.owner_id = -1
b2 = Balance(-1, -2, 'personal', db, 1700)
b2.id = -2
b2.owner_id = -2
b3 = Balance(-1, -3, 'personal', db, 1700)
b3.id = -3
b3.owner_id = -3
b4 = Balance(-1, -4, 'gov', db, 20000)
b4.id = -4
b4.owner_id = -1
b5 = Balance(-1, -5, 'bank', db, 10000)
b5.id = -5
b5.owner_id = -2

p1.balances[-1] = b1
p1.balances[-4] = b4
p2.balances[-2] = b2
p2.balances[-5] = b5
p3.balances[-3] = b3

l.balances[-1] = b1
l.balances[-2] = b2
l.balances[-3] = b3
l.balances[-4] = b4
l.balances[-5] = b5

l.players[-1] = p1
l.players[-2] = p2
l.players[-3] = p3

app.state.hostess.lobbies[-1] = l

app.state.templates = Jinja2Templates(directory='src/static/templates/')

app.include_router(host.router)
app.include_router(home.router)
app.include_router(lobby.router)
app.include_router(player_sockets.router)
