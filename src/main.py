import os
import sys

from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

from routers import host
from config import Config

load_dotenv()
Config.init()
# app = FastAPI()
# app.include_router(host.router)
# templates = Jinja2Templates(directory='src/templates/')

from database.database import Database
db = Database()

# @app.get('/')
# def lobby_page(request: Request):
#     return templates.TemplateResponse(request=request, name='lobby.html')
#
# @app.get('/player')
# def player_page(request: Request):
#     return templates.TemplateResponse(request=request, name='player.html')
