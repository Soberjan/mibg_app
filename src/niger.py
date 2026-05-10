import asyncio
from psycopg2 import connect

class Timer:
    def __init__(self, time_left):
        self.paused = False
        self.time_left = time_left

class Lobby:
    def __init__(self):
        self.timers = []
        self.start_time = 1


    def loop(self):
        while True:
            for timer in self.timers():
                if not self.paused:
                    timer.tick()
            asyncio.sleep(0.05)

l = Lobby()
timer = Timer(2)
timer2 = Timer(3)


conn = connect(user='mibg_admin', password='12345', host='localhost', dbname='mibg_base')
cur = conn.cursor()
cur.execute("SELECT * FROM loan")
t = cur.fetchone()[2]
print(t)
print(t.__dict__)
print(cur.fetchone())
