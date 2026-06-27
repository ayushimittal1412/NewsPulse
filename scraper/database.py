import sqlite3

DB_NAME = "news_pulse.db"


def get_connection():
    return sqlite3.connect(DB_NAME)


def initialize_database():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""

    CREATE TABLE IF NOT EXISTS clusters(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT,
        article_count INTEGER,
        heat_score REAL
    );

    CREATE TABLE IF NOT EXISTS articles(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        summary TEXT,
        source TEXT,
        url TEXT UNIQUE,
        published TEXT,
        cluster_id INTEGER,
        FOREIGN KEY(cluster_id) REFERENCES clusters(id)
    );

    """)

    conn.commit()
    conn.close()