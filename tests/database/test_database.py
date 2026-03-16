from database.database_fixture import database

def test_insert_entry(database):
    database.insert_entry('lobby', ['state', 'owner_id'], ['active', 2])
    res = database.execute_query("SELECT * FROM lobby")
    assert res[0][1] == 'active'
    assert res[0][2] == 2


