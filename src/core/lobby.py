import json
import uuid
from enum import Enum
from typing import List

from .balance import Balance
from .player import Player

class Balance_type(Enum):
    player = "player"
    gov = "go"
    bank = "bank"


class Lobby:
    def __init__(self, lobby_id: str) -> None:
        self.id = lobby_id
        self.players = {}
        self.balances = {}

    def add_player(self, name: str, role: str, player_id: str | None = None, balances: List[Balance] | None = None):
        if player_id is None:
            player_id = uuid.uuid1().hex
        if balances is None:
            balances = [self.add_balance("player")]

        p = Player(player_id, role, name, balances)

        self.players[player_id] = p

    def add_balance(
        self, balance_type: str, balance_id: str = "", money: int = 0
    ) -> Balance:
        if balance_id == "":
            balance_id = uuid.uuid1().hex
        b = Balance(balance_id, balance_type, money)
        self.balances[balance_id] = b
        return b

    def save_state(self, path: str):
        file_path = path + str(self.id) + ".json"
        with open(file_path, "w+") as f:
            players_dict = {key: val.to_dict() for key, val in self.players.items()}
            balances_dict = {key: val.to_dict() for key, val in self.balances.items()}
            d = {"id": self.id, "players": players_dict, "balances": balances_dict}
            json.dump(d, f)

    def load_state(self, path: str):
        with open(path, "r") as f:
            lobby_dict = json.load(f)
            for balance_dict in lobby_dict["balances"].values():
                self.add_balance(
                    balance_type=balance_dict["type"],
                    balance_id=balance_dict["id"],
                    money=balance_dict["money"]
                )

            for player_dict in lobby_dict["players"].values():
                player_balances = [
                    self.balances[b_id] for b_id in player_dict["balance_ids"]
                ]
                self.add_player(
                    role=player_dict["role"],
                    name=player_dict["name"],
                    player_id=player_dict["id"],
                    balances=player_balances,
                )


if __name__ == "__main__":
    a = uuid.uuid1()
    print(a)
    print(a.int, a.hex, a.urn)
    print(type(a))
