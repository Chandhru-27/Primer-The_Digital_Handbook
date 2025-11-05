from flask import Flask
from config import SECRET_KEY
import os
from dotenv import load_dotenv
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from db_setup import initialize_connection_pool, initialize_database_and_create_tables
load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

    # cookie configuration
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_COOKIE_SECURE'] = False 
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False  
    app.config["JWT_COOKIE_SAMESITE"] = "Lax"
    app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
    app.config['JWT_REFRESH_COOKIE_PATH'] = '/'

    # Expiration times from .env
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 1600))
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 604800))

    jwt = JWTManager(app)

    # CORS config for endpoint access
    CORS(
        app,
         resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}},
        origins=["http://localhost:5173"],
        supports_credentials=True,  
        allow_headers=[
            "Content-Type",
            "Authorization",
            "X-Requested-With"  
        ],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    )
    # Import and register blueprints (avoids circular imports)
    from auth.routes import auth_bp
    from personal_info.routes import personal_bp
    from social_links.routes import social_bp
    from vault.routes import vault_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(personal_bp)
    app.register_blueprint(social_bp)
    app.register_blueprint(vault_bp)

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
    app.run(debug=True, host="localhost", port=5000)

