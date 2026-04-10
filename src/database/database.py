from typing import List

from psycopg2 import sql
from psycopg2.pool import SimpleConnectionPool
from psycopg2.extras import RealDictCursor
from ..config import Config

class Database():
    """
    Класс для работы с базой данных
    """
    def connect(self, 
                host: str | None = Config.db_host,
                db_name: str | None = Config.db_name, 
                user: str | None= Config.db_user, 
                password: str | None = Config.db_password,
                search_path: str = 'public'):

        """
        Подключаемся к базе данных

        Args:
            host(str): Хост датабазы
            db_name(str): Имя датабазы
            user(str): Юзер датабазы
            password(str): Пароль датабазы
        """
        self.pool = SimpleConnectionPool(
            1, 20,
            user=user,
            password=password,
            host=host,
            dbname=db_name,
            cursor_factory=RealDictCursor,
            options=f"-c search_path={search_path}"
        )
    
    def insert_entry(self, table: str, columns: List[str], values: List[str]):
        """
        Вставить запись в таблицу

        Args:
            table(str): таблица в которую вставляем запись
            columns(List[str]): какие колонки вставляем
            values(List[str]): какие значения вставляем
        """

        query = sql.SQL("""
            INSERT INTO {table} ({columns})
            VALUES ({values})
            RETURNING id;
            """
            ).format(
                    table=sql.Identifier(table),
                    columns=sql.SQL(', ').join(map(sql.Identifier, columns)),
                    values=sql.SQL(', ').join(sql.Placeholder() * len(columns)),
                    )

        conn = self.pool.getconn()
        inserted_id = None
        try:
            cur = conn.cursor()
            cur.execute(query, values)
            inserted_id = cur.fetchone()['id']
            conn.commit()
        except Exception as e:
            print(f"{e}")
        finally:
            self.pool.putconn(conn)
        return inserted_id

    def execute_query(self, query: str, params = None):
        conn = self.pool.getconn()
        cur = conn.cursor()
        if params is None:
            cur.execute(query)
        else:
            cur.execute(query, params)
        conn.commit()

        if cur.description:
            res = cur.fetchall()
        else:
            res = None

        self.pool.putconn(conn)
        return res

