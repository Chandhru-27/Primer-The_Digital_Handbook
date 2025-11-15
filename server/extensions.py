from flask_bcrypt import Bcrypt
from cryptography.fernet import Fernet
import os

bcrypt = Bcrypt()
fernet = Fernet(os.getenv('FERNET_KEY'))
