from flask import Flask 
from config import SECRET_KEY

def create_app():
    app=Flask(__name__)
    app.config['SECRET_KEY']=SECRET_KEY

    #importing blueprnts
    from auth.routes import auth_bp
    from personal_info.routes import personal_bp
    from social_links.routes import social_bp
    from vault.routes import vault_bp

    #registering blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(personal_bp)
    app.register_blueprint(social_bp)
    app.register_blueprint(vault_bp)

    return app
app=create_app()

@app.route('/')
def home():
    return "welcome to vault app page!"


if __name__ == "__main__":
    app.run(debug=True)