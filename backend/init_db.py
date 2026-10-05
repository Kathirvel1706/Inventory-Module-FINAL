import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def init_postgres_db():
    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password="postgres",
            host="localhost",
            port=5432
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM pg_database WHERE datname='garment_inventory'")
        exists = cur.fetchone()
        if not exists:
            cur.execute("CREATE DATABASE garment_inventory")
            print("Database 'garment_inventory' created successfully.")
        else:
            print("Database 'garment_inventory' already exists.")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error initializing postgres database: {e}")

if __name__ == "__main__":
    init_postgres_db()
