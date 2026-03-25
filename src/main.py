from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv
from fastapi.templating import Jinja2Templates

from config import Config
load_dotenv()
Config.init()
from routers import host, home, player_sockets
from core.hostess import Hostess
from database.database import Database

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
