from typing import Dict
import asyncio

from .voter import Voter

from .balance import Balance
from .player import Player
from ..enums.enums import PlayerRole
from ..database.database import Database

class Lobby:
    def __init__(self, status: str, database: Database) -> None:
        self.database: Database = database
        self.owner_id = None
        self.status = status
        self.id = self.insert_to_db()
        self.players: Dict[int, Player] = {}
        self.balances: Dict[int, Balance] = {}
        self.sockets = {}
        self.voter: Voter = Voter(self)

    def notify_sockets(self, msg):
        for socket in self.sockets.values():
            asyncio.create_task(socket.send_json(msg))

    def insert_to_db(self):
        query = """
            INSERT INTO lobby (status) 
            VALUES (%s)
            RETURNING id;
        """
        params = (self.status,)

        res = self.database.execute_query(query, params)
        if res != None:
            return res[0][0]
        else:
            raise Exception


    def update_db_entry(self):
        query = """
            UPDATE lobby
            SET state = %s
            WHERE id = %s
        """
        params = (self.status, self.id,)
        self.database.execute_query(query, params)

    def add_player(self, name: str, role: str):
        try:
            player_role = PlayerRole(role)
        except ValueError:
            raise ValueError

        player = Player(name, player_role, self.id, self.database, "joined")
        player.insert_to_db()
        self.players[player.id] = player
        balance = self.add_balance('personal', player.id, 500)
        player.balances[balance.id] = balance
        self.balances[balance.id] = balance

        query = """
            INSERT INTO player_balance (player_id, balance_id)
            VALUES (%s, %s)
            RETURNING id
        """
        params = (player.id, balance.id,)
        self.database.execute_query(query, params)

        return player.id

    def add_balance(
        self, balance_type: str, owner_id: int, money: int = 0
    ) -> Balance:
        b = Balance(self.id, owner_id, balance_type, self.database, money)
        b.insert_to_db()
        self.balances[b.id] = b
        return b

    def send_money(
        self,
        sender_id: int,
        receiver_id: int,
        amount: int
    ):
        sender_balance = self.balances[sender_id]
        receiver_balance = self.balances[receiver_id]

        if amount > sender_balance.money:
            raise Exception

        sender_balance.money -= amount
        sender_balance.update_db_entry()
        
        receiver_balance.money += amount
        receiver_balance.update_db_entry()

    def save_state(self):
        self.update_db_entry()
        for _, player in self.players.items():
            player.update_db_entry()
        for _, balance in self.balances.items():
            balance.update_db_entry()

    def choose_banker(self, voter_id, elected_id):
        if self.players[voter_id].role.value != 'politician':
            e = Exception()
            e.add_note('you can only chooes banker if you are politician')
            raise e

        self.players[elected_id].role = PlayerRole('banker') # сделать работу с инамами красивее
        self.players[elected_id].update_db_entry()
        print('yeah, updated shit')

        return 'successs'

    def start_game(self):
        msg = {'type': 'start_game'}
        self.notify_sockets(msg)

    def current_state(self):
        return {'state': self.status}
