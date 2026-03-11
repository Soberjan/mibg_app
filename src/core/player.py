from .balance import Balance

from typing import List

class Player:
    def __init__(self, player_id: str, name: str, role: str, balances: List[Balance]) -> None:
        self.id: str = player_id
        self.name: str = name
        self.role: str = role
        self.balances: List[Balance] = balances

    def to_dict(self):
        player_dict = self.__dict__.copy()
        player_dict['balance_ids'] = [balance.id for balance in self.balances]
        player_dict.pop('balances')
        return player_dict

