import os
from dotenv import load_dotenv

load_dotenv()
PG_USER=os.getenv('PG_USER')
PG_PASSWORD=os.getenv('PG_PASSWORD')
PG_DB=os.getenv('PG_DB')
PG_HOST=os.getenv('PG_HOST')
PG_PORt=os.getenv('PG_PORt')
SECRET_KEY=os.getenv('SECRET_KEY')
