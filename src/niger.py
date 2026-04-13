hostess = {} # словарь словарей
socket = 'shit'

lobby_id = 1
player_id = 3
hostess.setdefault(lobby_id, {})[player_id] = socket
player_id = 4
hostess.setdefault(lobby_id, {})[player_id] = socket
lobby_id = 2
player_id = 5
hostess.setdefault(lobby_id, {})[player_id] = socket

print(hostess)

