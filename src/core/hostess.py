from uuid import uuid1
from typing import Dict

from database.database import Database

from .lobby import Lobby

class Hostess:
    def __init__(self, database: Database) -> None:
        self.lobbies: Dict[int, Lobby] = {}
        self.database = database

    def create_lobby(self):
        lobby = Lobby('active', self.database)
        lobby.insert_to_db()
        self.lobbies[lobby.id] = lobby
        return lobby.id

    def get_lobby(self, lobby_id):
        if lobby_id not in self.lobbies.keys():
            return 'no such lobby'
        return self.lobbies[lobby_id]
