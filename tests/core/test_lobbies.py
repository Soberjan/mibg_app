import os

from core.hostess import Hostess

def test_lobbies():
    h = Hostess()

    lobby1_id = h.create_lobby()
    lobby = h.lobbies[lobby1_id]

    lobby.add_player('vasya', 'player')
    balance1_id = list(lobby.balances.keys())[0]
    player1_id = list(lobby.players.keys())[0]
    lobby.balances[balance1_id].money = 100
    lobby.add_player('petya', 'player')

    save_dir = '/home/soberjan/PythonProjects/mibg_app/tests/testing_lobbies/'

    save_path = '/home/soberjan/PythonProjects/mibg_app/tests/testing_lobbies/' + lobby1_id + '.json'
    lobby.save_state(save_dir)

    lobby2_id = h.create_lobby()
    lobby2 = h.lobbies[lobby2_id]
    lobby2.load_state(save_path)

    assert lobby2.balances[balance1_id].money == 100
    print(lobby2.players)
    assert lobby2.players[player1_id].name == 'vasya'

    os.remove(save_path)

