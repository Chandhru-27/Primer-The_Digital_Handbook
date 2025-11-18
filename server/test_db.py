
# import psycopg2
# import os
# from dotenv import load_dotenv

# load_dotenv()
# conn = psycopg2.connect(
#     host=os.getenv('PG_HOST'),
#     database=os.getenv('PG_DB'),
#     user=os.getenv('PG_USER'),
#     password=os.getenv('PG_PASSWORD'),
#     port=os.getenv('PG_PORT')
# )
# cur = conn.cursor()
# cur.execute("SELECT user_id, vault_password FROM vault_passwords;")
# for row in cur.fetchall():
#     print(row)
# cur.close()
# conn.close()

from cryptography.fernet import Fernet

fernet_key = Fernet.generate_key()
print(fernet_key.decode())