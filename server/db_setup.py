import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    # Connect to PostgreSQL
    conn = psycopg2.connect(
        host=os.getenv('PG_HOST'),
        database=os.getenv('PG_DB'),
        user=os.getenv('PG_USER'),
        password=os.getenv('PG_PASSWORD'),
        port=os.getenv('PG_PORT')
    )

    cur = conn.cursor()

    # 1. USERS TABLE
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        );
    """)

    # 2. PERSONAL INFORMATION TABLE
    cur.execute("""
        CREATE TABLE IF NOT EXISTS personal_info (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            profile_pic VARCHAR(255),
            name VARCHAR(100),
            profession VARCHAR(100),
            city VARCHAR(100),
            state VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 3. SOCIAL LINKS TABLE
    cur.execute("""
        CREATE TABLE IF NOT EXISTS social_links (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            platform_name VARCHAR(100),
            profile_link VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 4. VAULT TABLE
    cur.execute("""
        CREATE TABLE IF NOT EXISTS vault (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            domain VARCHAR(100),
            account_name VARCHAR(100),
            pin_or_password VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 5. VAULT PASSWORD TABLE
    cur.execute("""
        CREATE TABLE IF NOT EXISTS vault_passwords (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            vault_password VARCHAR(255) NOT NULL,
            set_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    #Must call conn.commit() as a function
    conn.commit()

    print("All tables created successfully or already exist.")

except psycopg2.Error as e:
    print("Database error:", e)

finally:
    if conn:
        cur.close()
        conn.close()
