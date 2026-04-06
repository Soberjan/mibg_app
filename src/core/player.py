from typing import Dict, List

from ..database.database import Database
from .balance import Balance
from ..enums.enums import PlayerRole

class Player:
    def __init__(self, name: str, role: PlayerRole, lobby_id: int, database: Database, status: str = "") -> None:
        self.name: str = name
        self.status: str = status
        self.role: PlayerRole = role
        self.is_registered = False
        self.lobby_id: int = lobby_id
        self.balances: Dict[int, Balance] = {}
        self.database: Database = database

    def get_personal_balance(
            self
            ) -> Balance:
        for b in self.balances.values():
            if b.type == 'personal':
                return b
        raise Exception

    def insert_to_db(self):
        query = """
            INSERT INTO player (role, name, lobby_id) 
            VALUES (%s, %s, %s)
            RETURNING id;
        """
        params = (self.role.value, self.name, self.lobby_id,)

        res = self.database.execute_query(query, params)
        if res != None:
            self.id = res[0][0]

    def update_db_entry(self):
        query = """
            UPDATE player
            SET role=%s, name=%s, lobby_id=%s
            WHERE id = %s
        """
        params = (self.role.value, self.name, self.lobby_id, self.id,)
        self.database.execute_query(query, params)

    def to_dict(self):
        d = self.__dict__.copy()
        d['role'] = self.role.value
        d.pop('balances')
        d.pop('database')
        d.pop('lobby_id')
        d['lobbyId'] = self.lobby_id
        d.pop('is_registered')
        d['isRegistered'] = self.is_registered

        d['balanceIds'] = list(self.balances.keys())

        return d
