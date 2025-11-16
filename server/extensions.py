from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
from cryptography.fernet import Fernet
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os

load_dotenv()

# global bcrypt instance 
bcrypt = Bcrypt()

# Global fernet instance
fernet = Fernet(os.getenv('FERNET_KEY'))

# Global rate limiter config
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["5 per minute"]
)