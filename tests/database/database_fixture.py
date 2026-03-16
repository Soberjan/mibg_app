import pytest
from psycopg2.pool import SimpleConnectionPool
from psycopg2 import connect

import os

from database.database import Database

@pytest.fixture
def database(config):
    conn = connect(
            user=config.db_user,
            password=config.db_password,
            host=config.db_host,
            dbname=config.db_name,
           )
    cur = conn.cursor()
    cur.execute("""
                DROP SCHEMA IF EXISTS testing CASCADE;
                CREATE SCHEMA testing;
                """)
    cur.execute('SET search_path to testing;')

    for file in sorted(os.listdir("src/migrations")):
        with open(os.path.join('src/migrations/', file), 'r') as query:
            cur.execute(query.read())
    conn.commit()
    conn.close()

    db = Database()
    db.connect(
            db_name=config.db_name, 
            host=config.db_host, 
            user=config.db_user,
            password=config.db_password,
            search_path='testing'
            )

    
    yield db
    

# @pytest.fixture
# def filled_db(database):
#     for i in range(4):
#         database.insert_entry('students', ['full_name', 'subject', 'grade'], ['Вася', 'русский', 2])
#     database.conn.commit()
#     yield database
