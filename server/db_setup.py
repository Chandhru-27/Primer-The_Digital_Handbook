import psycopg2
from psycopg2 import pool
import os
from dotenv import load_dotenv
from schema import SCHEMA_LIST
from contextlib import contextmanager

load_dotenv()

postgreSQL_pool = None

def initialize_connection_pool():
    """Create connection pool in a global pool variable"""
    global postgreSQL_pool
    try:
        postgreSQL_pool = pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=20,
            host=os.getenv('PG_HOST'),
            database=os.getenv('PG_DB'),
            user=os.getenv('PG_USER'),
            password=os.getenv('PG_PASSWORD'),
            port=os.getenv('PG_PORT'),
            sslmode='disable' 
        )
        print("Connection pool created succesuccessfully")
    except psycopg2.Error as e:
        print(f"Error initializing connection pool: {e}")

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = postgreSQL_pool.getconn()
    try:
        yield conn
    finally:
        postgreSQL_pool.putconn(conn=conn)

def initialize_database_and_create_tables():
    """Create all tables on startup"""
    with get_db_connection() as conn:
        cur = conn.cursor()
        try:
            for create_table in SCHEMA_LIST:
                cur.execute(create_table)
            conn.commit()
            print("All tables created successfully or already exists")
        except psycopg2.Error as e:
            print(f"Database error: {e}")
            conn.rollback()
        finally:
            cur.close()