class Balance:
    def __init__(self, balance_id: str, balance_type: str, money: int = 0) -> None:
        self.id = balance_id
        self.type = balance_type
        self.money = money
    
    def to_dict(self):
        balance_dict = self.__dict__.copy()
        return balance_dict
