import random

class Exp:
    def __init__(self) -> None:
        self.a = 1

    def create_shit(self) -> str:
        return str(random.randint(1, 100))
