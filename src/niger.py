# from psycopg2 import connect
# from psycopg2.pool import SimpleConnectionPool
# from psycopg2.extras import RealDictCursor, RealDictRow
# from psycopg2 import sql
#
# pool = SimpleConnectionPool(
#     1, 20,
#     user='mibg_admin',
#     password='12345',
#     host='localhost',
#     dbname='mibg_base',
#     cursor_factory=RealDictCursor
# )
#
# # con = pool.getconn()
# #
# # cur = con.cursor()
#
# # cur.execute('select * from player where id = 1 OR id = 2')
# # res: RealDictRow = cur.fetchone()
# # print(dict(res))
#
# values = ['game']
#
# query = sql.SQL("""
#     INSERT INTO {table} ({columns})
#     VALUES ({values})
#     RETURNING id;
#     """
#     ).format(
#             table=sql.Identifier('lobby'),
#             columns=sql.SQL(', ').join(map(sql.Identifier, ['status'])),
#             values=sql.SQL(', ').join(sql.Placeholder() * len(values)),
#             )
#
# conn = pool.getconn()
# try:
#     cur = conn.cursor()
#     cur.execute(query, values)
#     inserted_id = cur.fetchone()
#     print(inserted_id['id'])
#     conn.commit()
#
# except Exception as e:
#     print(f"{e}")
# finally:
#     pool.putconn(conn)

import secrets

key = secrets.token_hex()
print(key)
print(len(key))
