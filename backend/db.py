import sqlite3

DB_NAME = "posts.db"

def get_connection():
    return sqlite3.connect(DB_NAME)

def init_db() -> None:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            userId INTEGER NOT NULL
        )
    """)
    conn.commit()
    conn.close()