from flask import Flask
import os
from dotenv import load_dotenv
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from extensions import limiter
from db_setup import initialize_connection_pool, initialize_database_and_create_tables
from config import DevConfig, ProdConfig

load_dotenv()

def create_app():
    app = Flask(__name__)

    if os.getenv("FLASK_ENV") == "production":
        app.config.from_object(ProdConfig)
    else:
        app.config.from_object(DevConfig)

    # # Key configuration
    # app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    # app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

    # # Cookie configuration
    # app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    # app.config['JWT_COOKIE_SECURE'] = False 
    # app.config['JWT_COOKIE_CSRF_PROTECT'] = False  
    # app.config["JWT_COOKIE_SAMESITE"] = "Lax"
    # app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
    # app.config['JWT_REFRESH_COOKIE_PATH'] = '/'

    # # Expiration times from .env
    # app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 1600))
    # app.config['JWT_REFRESH_TOKEN_EXPIRES'] = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 604800))

    # Global JWT manager instance
    jwt = JWTManager(app)

    # Global config for rate limiter
    limiter.init_app(app=app)

    # CORS config for endpoint access
    # Use configured methods list (not a literal string) and allow headers from config
    CORS(
        app,
        origins=app.config["CORS_ORIGINS"],
        supports_credentials=app.config["CORS_SUPPORTS_CREDENTIALS"],
        allow_headers=app.config["CORS_ALLOW_HEADERS"],
        methods=app.config.get("CORS_METHODS", ["GET", "POST", "OPTIONS"]),
    )
    
    # Import and register blueprints here to avoids circular imports
    from auth.routes import auth_bp
    from personal_info.routes import personal_bp
    from social_links.routes import social_bp
    from vault.routes import vault_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(personal_bp)
    app.register_blueprint(social_bp)
    app.register_blueprint(vault_bp)

    # Security headers configuration
    @app.after_request
    def set_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "font-src 'self'; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        return response

    return app

app = create_app()

@app.route('/')
def home():
    return "Welcome to primer backend!"

if __name__ == "__main__":
    initialize_connection_pool()
    initialize_database_and_create_tables()
    app.run(debug=app.config["DEBUG"], host="localhost", port=5000)

