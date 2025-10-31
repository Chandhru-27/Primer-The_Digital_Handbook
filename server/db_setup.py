import psycopg2
import os
from dotenv import load_dotenv
from schema import SCHEMA_LIST
# Load environment variables
load_dotenv()

def initialize_database_and_create_tables():
    conn = None
    cur = None
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host=os.getenv('PG_HOST'),
            database=os.getenv('PG_DB'),
            user=os.getenv('PG_USER'),
            password=os.getenv('PG_PASSWORD'),
            port=os.getenv('PG_PORT'),
            sslmode='disable'
        )

        cur = conn.cursor()

        for create_table in SCHEMA_LIST:
            cur.execute(create_table)

        # Commit the changes
        conn.commit()

        print("All tables created successfully or already exist.")

    except psycopg2.Error as e:
        print("Database error:", e)

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
