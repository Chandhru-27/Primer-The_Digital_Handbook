from flask import Blueprint, request, jsonify
import psycopg2
import os
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import re
import datetime
from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    get_jwt_identity,
    get_jwt,
    create_access_token, 
    create_refresh_token, 
    set_refresh_cookies,
    set_access_cookies,
    unset_jwt_cookies,
)

load_dotenv()

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# email validation
def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if re.fullmatch(pattern, email):
        return True
    else:
        return False
    
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('PG_HOST'),
        database=os.getenv('PG_DB'),
        user=os.getenv('PG_USER'),
        password=os.getenv('PG_PASSWORD'),
        port=os.getenv('PG_PORT')
    )

# check token blocklist
def is_token_revoked(jti):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM token_blocklist WHERE jti=%s;", (jti,))
    exists = cur.fetchone() is not None
    cur.close()
    conn.close()
    
    return exists

def add_token_to_blocklist(jti, token_type, user_id=None):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO token_blocklist (jti, token_type, user_id, revoked_at) VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING;",
        (jti, token_type, user_id, datetime.utcnow())
    )
    conn.commit()
    cur.close()
    conn.close()


# for signup with password hashing
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not password or not email:
        return jsonify({"error": "All credentials required"}), 400
    
    if len(password) < 8: 
        return jsonify({"error": "Password must be at least 8 characters long"}), 400

    if not is_valid_email(email=email):
        return jsonify({"error": "Invalid Email"}), 400

    hashed_password = generate_password_hash(password)
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO users (username,email, password) VALUES (%s, %s, %s) RETURNING id;",
            (username, email, hashed_password)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return jsonify({"error": "Username or email already exists"}), 400
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({"message": "User created!", "user_id": user_id}), 201
  
#for sign in
@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, password FROM users WHERE username=%s;", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid username or password"}), 401
    user_id, pw_hash = user
    if not check_password_hash(pw_hash, password):
        return jsonify({"error": "Invalid username or password"}), 401

    # create and assign tokens
    access_token = create_access_token(identity=user_id, fresh=True)
    refresh_token = create_refresh_token(identity=user_id)

    from flask_jwt_extended import decode_token
    decoded_refresh_token = decode_token(refresh_token).get('jti')
    add_token_to_blocklist(jti=decoded_refresh_token, token_type='refresh', user_id=user_id)


    response = jsonify({"message": "Login successful"})

    set_access_cookies(response=response, encoded_access_token=access_token)
    set_refresh_cookies(response=response, decoded_refresh_token=refresh_token)

    return response, 200

# use refresh token to get access token
@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh_access_token():
    identity = get_jwt_identity()
    jti = get_jwt()['jti']

    if is_token_revoked(jti=jti):
        return jsonify({"message": "Token revoked"}), 401
    
    new_access_token = create_access_token(identity=identity)
    response = jsonify({"message" : "Access token refreshed"})
    set_access_cookies(response=response, encoded_access_token=new_access_token)
    
    return response,200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jwt = get_jwt()
    jti = jwt['jti']
    identity = get_jwt_identity()

    add_token_to_blocklist(jti=jti, token_type="access", user_id=identity)

    response = jsonify({"message": "Logout successful"})
    unset_jwt_cookies(response=response)

    return response,200

