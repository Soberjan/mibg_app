from database.database import Database
from .balance import Balance
from enums.enums import PlayerRole

from typing import List

class Player:
    def __init__(self, name: str, role: PlayerRole, lobby_id: int, database: Database) -> None:
        self.name: str = name
        self.role: PlayerRole = role
        self.lobby_id: int = lobby_id
        self.database: Database = database

    def insert_to_db(self):
        query = """
            INSERT INTO player (role, name, lobby_id) 
            VALUES (%s, %s, %s)
            RETURNING id;
        """
        params = (self.role.value, self.name, self.lobby_id,)

        res = self.database.execute_query(query, params)
        self.id = res[0][0]

    def update_db_entry(self):
        query = """
            UPDATE player
            SET role=%s, name=%s, lobby_id=%s
            WHERE id = %s
        """
        params = (self.role.value, self.name, self.lobby_id, self.id,)
        self.database.execute_query(query, params)

