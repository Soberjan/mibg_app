import datetime as dt

from ..database.database import Database


class Hostess:
    def __init__(self, database: Database) -> None:
        self.database = database
        self.clients = {}
        self.sockets = {}

    def create_lobby(self):
        lobby_id = self.database.insert_entry('lobby', ['status', 'started_at'], ['registration', dt.datetime.now().isoformat()])
        if lobby_id == None:
            return

        balance_id = self.database.insert_entry(
            'balance', 
            ['lobby_id', 'money', 'type'],
            [lobby_id, '20000', 'gov']
        )

        if balance_id == None:
            return

        for i in range(1, 166):
            self.database.insert_entry(
                'lobby_question',
                ['lobby_id', 'question_id', 'asked'],
                [str(lobby_id), str(i), str(False)]
             )

        for i in range(1, 10):
            self.database.insert_entry(
                'property',
                ['tile_number', 'lobby_id', 'owner_id', 'price', 'level', 'income'],
                [str(i), str(lobby_id), str(balance_id), '200', '1', '50']
             )
        for i in range(10, 18):
            self.database.insert_entry(
                'property',
                ['tile_number', 'lobby_id', 'owner_id', 'price', 'level', 'income'],
                [str(i), str(lobby_id), str(balance_id), '100', '1', '50']
             )

        for i in range(10, 18):
            self.database.insert_entry(
                'property',
                ['tile_number', 'lobby_id', 'owner_id', 'price', 'level', 'income'],
                [str(i), str(lobby_id), str(balance_id), '100', '1', '50']
             )

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
            return dict(res)
