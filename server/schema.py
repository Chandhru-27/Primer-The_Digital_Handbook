"""python file to hold database schema"""

CREATE_TABLE_USERS = """
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    );
"""

CREATE_TABLE_PERSONAL_INFO = """
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
"""

CREATE_TABLE_SOCIAL_LINKS = """
    CREATE TABLE IF NOT EXISTS social_links (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        platform_name VARCHAR(100),
        profile_link VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
"""

CREATE_TABLE_VAULT = """
    CREATE TABLE IF NOT EXISTS vault (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        domain VARCHAR(100),
        account_name VARCHAR(100),
        pin_or_password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
"""

CREATE_TABLE_VAULT_PASSWORDS = """
    CREATE TABLE IF NOT EXISTS vault_passwords (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        vault_password VARCHAR(255) NOT NULL,
        set_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
"""

CREATE_TABLE_TOKEN_BLOCKLIST = """
    CREATE TABLE IF NOT EXISTS token_blocklist (
    jti TEXT PRIMARY KEY,
    token_type TEXT,
    user_id INTEGER,
    revoked_at TIMESTAMP DEFAULT now()
    );
"""

SCHEMA_LIST = [
    CREATE_TABLE_USERS, 
    CREATE_TABLE_PERSONAL_INFO, 
    CREATE_TABLE_SOCIAL_LINKS,
    CREATE_TABLE_VAULT,
    CREATE_TABLE_VAULT_PASSWORDS,
    CREATE_TABLE_TOKEN_BLOCKLIST
]