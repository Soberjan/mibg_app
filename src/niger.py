from psycopg2 import connect
from psycopg2.pool import SimpleConnectionPool
from psycopg2.extras import RealDictCursor, RealDictRow
from psycopg2 import sql

pool = SimpleConnectionPool(
    1, 20,
    user='mibg_admin',
    password='12345',
    host='localhost',
    dbname='mibg_base',
    cursor_factory=RealDictCursor
)

# con = pool.getconn()
#
# cur = con.cursor()

# cur.execute('select * from player where id = 1 OR id = 2')
# res: RealDictRow = cur.fetchone()
# print(dict(res))


conn = pool.getconn()
try:
    cur = conn.cursor()
    personal_balance_id_query = """
        SELECT balance_id
        FROM player_balance
        JOIN balance ON player_balance.balance_id=balance.id
        WHERE player_id=%s AND type='personal'
    """
    cur.execute(personal_balance_id_query, (11,))

    status = cur.fetchone()
    print(status)
    conn.commit()

except Exception as e:
    print(f"{e}")
finally:
    pool.putconn(conn)

