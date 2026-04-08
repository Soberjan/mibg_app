import asyncio

from ..enums.enums import PlayerRole

class Voter:
    def __init__(self, lobby):
        self.lobby = lobby
        self.status = 'idle'
        self.vote_time = 30
        self.voting_round = 0
        self.voted_players_ids = []
        self.vote_count = {}
        self.timeout_task: asyncio.Task | None = None

    async def vote_timeout(self, sleep_time):
        await asyncio.sleep(sleep_time)

        if self.status == 'voting':
            self.start_voting_round()

    def start_voting_round(self):
        if self.timeout_task != None:
            self.timeout_task.cancel()
        self.timeout_task = asyncio.create_task(self.vote_timeout(self.vote_time))

        self.voted_players_ids = []
        self.vote_count = {}
        self.status = 'voting'
        self.voting_round += 1

        msg = {
            'type': 'start_voting_round',
            'voting_round': self.voting_round,
            'lobby_id': self.lobby.id
        }
        self.lobby.notify_sockets(msg)

    def vote(self, voter_id, elected_id):
        if voter_id in self.voted_players_ids:
            raise Exception

        self.voted_players_ids.append(voter_id)
        self.vote_count[elected_id] = self.vote_count.get(elected_id, 0) + 1
        if len(self.voted_players_ids) == len(self.lobby.players):
            self.end_vote()

    def end_vote(self):
        result = sorted(self.vote_count.items(), key=lambda item: item[1], reverse=True)
        if result[0][1] == result[1][1]:
            self.start_voting_round()
            return

        self.voting_round = 0
        self.voted_players_ids = []
        self.vote_count = {}
        self.status = 'idle'

        self.lobby.players[result[0][0]].role = PlayerRole('politician')
        balance = None
        for b in self.lobby.balances.values():
            if b.type == "gov":
                balance = b
        if balance is not None:
            self.lobby.players[result[0][0]].balances[balance.id] = balance
            self.lobby.balances[balance.id].owner_id = result[0][0]
            self.lobby.balances[balance.id].update_db_entry()
        self.lobby.players[result[0][0]].update_db_entry()

        self.lobby.status = 'choosing_banker'

        msg = {
            'type': 'end_voting',
            'winner_id': result[0][0],
        }
        self.lobby.notify_sockets(msg)
