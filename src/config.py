import os

class Config:
    """
    Класс для хранения настроек приложения
    """
    
    db_host = None
    db_name = None
    db_user = None
    db_password = None

    @classmethod
    def init(cls, db_host : str | None= None, db_name : str | None = None, db_user : str | None= None,
                 db_password : str | None = None):
        """
        Функция для инициализации конфига
        Args:
            str(db_host) : хост датабазы
            str(db_name) : имя датабазы
            str(db_user) : юзер датабазы
            str(db_password) : пароль датабазы
        """
        
        cls.db_host = db_host if db_host else os.environ.get('DB_HOST')
        cls.db_name = db_name if db_name else os.environ.get('DB_NAME')
        cls.db_user = db_user if db_user else os.environ.get('DB_USER')
        cls.db_password = db_password if db_password else os.environ.get('DB_PASSWORD')
