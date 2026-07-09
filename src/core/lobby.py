import inspect
import asyncio
import datetime as dt

class Timer:
    def __init__(self, f, f_params, starts_at, duration):
        self.f = f
        self.f_params = f_params
        self.starts_at = starts_at
        self.duration = duration
        self.ends_at = starts_at + duration

class Lobby():
    def __init__(self):
        self.timers = []
        self.paused = False
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
                    if inspect.iscoroutinefunction(t.f):
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
