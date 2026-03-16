import pytest
from dotenv import load_dotenv

from config import Config

@pytest.fixture
def config():
    load_dotenv()
    Config.init()
    return Config
