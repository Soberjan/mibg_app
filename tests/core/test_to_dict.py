from core.player import Player
from core.balance import Balance

def test_to_dict():
    balance1 = Balance('1', 'player')
    balance2 = Balance('2', 'bank')
    balance3 = Balance('3', 'player')
    players = {'1' : Player('1', 'niger', 'faggot', [balance1, balance2]), '2' : Player('2', 'gay', 'rrrr', [balance3])}

    players_dict = {key : val.to_dict() for key, val in players.items()}
    assert players_dict['1']['id'] == '1'
    assert players_dict['1']['name'] == 'niger'
    assert players_dict['1']['role'] == 'faggot'
    assert players_dict['1']['balance_ids'] == ['1', '2']

    balance1_dict = balance1.to_dict()
    assert balance1_dict['id'] == '1'
    assert balance1_dict['type'] == 'player'
