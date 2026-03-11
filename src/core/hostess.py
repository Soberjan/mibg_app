from uuid import uuid1
from typing import Dict

from .lobby import Lobby

class Hostess:
    def __init__(self) -> None:
        self.lobbies: Dict[str, Lobby] = {}

    def create_lobby(self):
        lobby_id = uuid1().hex
        lobby = Lobby(lobby_id)
        self.lobbies[lobby_id] = lobby
        return lobby_id

    def read_lobby(self):
        lobby_id = uuid1().hex
        lobby = Lobby(lobby_id)
        self.lobbies[lobby_id] = lobby
        return lobby_id

_hostess = Hostess()
def get_hostess():
    return _hostess
