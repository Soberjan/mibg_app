from uuid import uuid1
from typing import Dict

from ..database.database import Database

from .lobby import Lobby

class Hostess:
    def __init__(self, database: Database) -> None:
        self.lobbies: Dict[int, Lobby] = {}
        self.database = database
        self.clients = {}

    def create_lobby(self):
        lobby = Lobby('registration', self.database)
        self.lobbies[lobby.id] = lobby
        return lobby.id

    def get_lobby(self, lobby_id):
        if lobby_id not in self.lobbies.keys():
            e = Exception()
            e.add_note('no such lobby')
            raise e
        return self.lobbies[lobby_id]
