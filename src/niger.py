import inspect

import asyncio
import datetime as dt

class Timer:
    def __init__(self, f, f_params, starts_at, duration, task):
        self.f = f
        self.f_params = f_params
        self.starts_at = starts_at
        self.duration = duration
        self.ends_at = starts_at + duration

class Lobby():
    def __init__(self):
        self.timers = []
        self.paused = True
        self.sleep_time = 0.5
        pass
    
    async def update(self):
        while True:
            now = dt.datetime.now()
            if self.paused:
                await asyncio.sleep(self.sleep_time)
                continue

            for t in self.timers:
                if t.ends_at <= now:
                    if inspect.iscoroutinefunction(f):
                        asyncio.create_task(t.f(*t.f_params))
                    else:
                        t.f(*t.f_params)
                    self.timers.remove(t)

            await asyncio.sleep(self.sleep_time)

    def pause(self):
        self.pause_time = dt.datetime.now()
        self.paused = True

    def unpause(self):
        self.unpause_time = dt.datetime.now()
        self.paused = False

        for t in self.timers:
            t.ends_at += self.unpause_time - self.pause_time



def f(a, b):
    pass

async def g(a):
    pass

loan_time=10
ends_at = dt.datetime.now() + dt.timedelta(seconds=loan_time)
print(str(ends_at))
# start_time = dt.datetime.now()
# timer1 = 30.
# timer2 = 15.
# end_time_1 = start_time + dt.timedelta(seconds=timer1)
# end_time_2 = start_time + dt.timedelta(seconds=timer2)
# # task = asyncio.create_task(timeout(1))
# niger = timeout(10)
# asyncio.run(niger)
# print(niger)
# print(start_time, end_time_1, end_time_2)
#
#
#
#
#
#
# conn = connect(user='mibg_admin', password='12345', host='localhost', dbname='mibg_base')
# cur = conn.cursor()
# cur.execute("SELECT * FROM server_state")
# t = cur.fetchone()
# print(t)
# # print(cur.fetchone())
