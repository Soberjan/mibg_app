from typing import Dict

from ..database.database import Database

from .lobby import Lobby

class Hostess:
    def __init__(self, database: Database) -> None:
        self.lobbies: Dict[int, Lobby] = {}
        self.database = database
        self.clients = {}

    def create_lobby(self):
        lobby_id = self.database.insert_entry('lobby', ['status'], ['registration'])
        if lobby_id == None:
            return

        balance_id = self.database.insert_entry(
            'balance', 
            ['lobby_id', 'money', 'type'],
            [lobby_id, '20000', 'gov']
        )
        if balance_id == None:
            return
        self.database.insert_entry(
            'player_balance', 
            ['balance_id', 'player_id'],
            # как пометить, что владельца нет?
            [balance_id, '1']
        )

        balance_id = self.database.insert_entry(
            'balance', 
            ['lobby_id', 'money', 'type'],
            [lobby_id, '10000', 'bank']
        )
        if balance_id == None:
            return
        self.database.insert_entry(
            'player_balance',
            ['balance_id', 'player_id'],
            # как пометить, что владельца нет?
            [balance_id, '1']
        )
        return lobby_id

    def get_lobby(self, lobby_id):
        query = """
        SELECT *
        FROM lobby
        WHERE id = %s
        """
        res = self.database.execute_query(query, (str(lobby_id),))
        if res != None:
            return dict(res[0])
