"""python file to hold database schema"""

CREATE_TYPE_GENDER_ENUM = """
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
        CREATE TYPE gender_enum AS ENUM ('Male', 'Female', 'Other');
    END IF;
END$$;
"""

CREATE_HANDBOOK_UNIQUE_CONSTRAINT = """
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'uk_user_field'
    ) THEN
        ALTER TABLE personal_handbook
        ADD CONSTRAINT uk_user_field UNIQUE (user_id, field_name);
    END IF;
END$$;
"""

CREATE_TABLE_USERS = """
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        phone VARCHAR(20),
        age INTEGER,
        gender gender_enum,
        profile_pic VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
"""

CREATE_TABLE_PERSONAL_HANDBOOK = """
    CREATE TABLE IF NOT EXISTS personal_handbook (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        field_name VARCHAR(100) NOT NULL,     
        field_value TEXT NOT NULL,          
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
"""

CREATE_TABLE_SOCIAL_LINKS = """
    CREATE TABLE IF NOT EXISTS social_links (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        platform_name VARCHAR(100),
        username VARCHAR(100),
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, domain)
    );
"""

CREATE_TABLE_VAULT_PASSWORDS = """
    CREATE TABLE IF NOT EXISTS vault_passwords (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
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
    CREATE_HANDBOOK_UNIQUE_CONSTRAINT,
    CREATE_TYPE_GENDER_ENUM,
    CREATE_TABLE_USERS, 
    CREATE_TABLE_PERSONAL_HANDBOOK,
    CREATE_TABLE_SOCIAL_LINKS,
    CREATE_TABLE_VAULT,
    CREATE_TABLE_VAULT_PASSWORDS,
    CREATE_TABLE_TOKEN_BLOCKLIST
]