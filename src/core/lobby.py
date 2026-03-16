import json
from enum import Enum

from .balance import Balance
from .player import Player
from database.database import Database

class Balance_type(Enum):
    player = "player"
    gov = "go"
    bank = "bank"

class Lobby:
    def __init__(self, state: str, database: Database) -> None:
        self.state = state
        self.players = {}
        self.balances = {}
        self.database: Database = database

    def insert_to_db(self):
        query = """
            INSERT INTO lobby (state) 
            VALUES (%s)
            RETURNING id;
        """
        params = (self.state)

        res = self.database.execute_query(query, params)
        self.id = res[0][0]

    def update_db_entry(self):
        query = """
            UPDATE lobby
            SET state = %s
            WHERE id = %s
        """
        params = (self.state, self.id)
        self.database.execute_query(query, params)

    def add_player(self, name: str, role: str):
        player = Player(name, role, self.id, self.database)
        player.insert_to_db()
        self.players[player.id] = player

    def add_balance(
        self, balance_type: str, owner_id: int, money: int = 0
    ) -> Balance:
        b = Balance(self.id, owner_id, balance_type, self.database, money)
        b.insert_to_db()
        self.balances[b.id] = b
        return b

    def save_state(self):
        self.update_db_entry()
        for player in self.players:
            player.update_db_entry()
        for balance in self.balances:
            balance.update_db_entry()

