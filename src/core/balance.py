from database.database import Database


class Balance:
    def __init__(self, lobby_id: int, owner_id: int, balance_type: str, database: Database, money: int = 0) -> None:
        self.lobby_id = lobby_id
        self.owner_id = owner_id
        self.type = balance_type
        self.money = money
        self.database = database
    
    def insert_to_db(self):
        query = """
            INSERT INTO balance (lobby_id, type, money) 
            VALUES (%s, %s, %s)
            RETURNING id;
        """
        params = (self.lobby_id, self.type, self.money,)

        res = self.database.execute_query(query, params)
        if res != None:
            self.id = res[0][0]

    def update_db_entry(self):
        query = """
            UPDATE balance
            SET lobby_id=%s, type=%s, money=%s
            WHERE id = %s
        """
        params = (self.lobby_id, self.type, self.money, self.id)

        self.database.execute_query(query, params)

    def to_dict(self):
        balance_dict = self.__dict__.copy()
        return balance_dict
