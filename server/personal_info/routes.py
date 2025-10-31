from flask import Blueprint, request, jsonify
import psycopg2
import os
from dotenv import load_dotenv
from flask_jwt_extended import jwt_required, get_jwt_identity

load_dotenv()

personal_bp = Blueprint('personal_info', __name__, url_prefix='/personal')

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('PG_HOST'),
        database=os.getenv('PG_DB'),
        user=os.getenv('PG_USER'),
        password=os.getenv('PG_PASSWORD'),
        port=os.getenv('PG_PORT')
    )

# 1. Create  personal info (user_id required)
@personal_bp.route('/save', methods=['POST'])
@jwt_required()
def save_personal_info():
    user_id = get_jwt_identity()
    data = request.json  # From frontend, can be passed after sign up
    profile_pic = data.get('profile_pic')
    name = data.get('name')
    profession = data.get('profession')
    city = data.get('city')
    state = data.get('state')

    conn = get_db_connection()
    cur = conn.cursor()
    # Check if entry exists, then update, else insert
    cur.execute("SELECT id FROM personal_info WHERE user_id=%s;", (user_id,))
    exists = cur.fetchone()
    if exists:
        cur.execute("""
            UPDATE personal_info SET profile_pic=%s, name=%s, profession=%s, city=%s, state=%s
            WHERE user_id=%s;
        """, (profile_pic, name, profession, city, state, user_id))
        conn.commit()
        msg = "Profile updated!"
    else:
        cur.execute("""
            INSERT INTO personal_info (user_id, profile_pic, name, profession, city, state)
            VALUES (%s, %s, %s, %s, %s, %s);
        """, (user_id, profile_pic, name, profession, city, state))
        conn.commit()
        msg = "Profile created!"
    cur.close()
    conn.close()
    return jsonify({"message": msg})

# 2. Get personal info
@personal_bp.route('/me', methods=['GET'])
@jwt_required()
def get_personal_info(user_id):
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT profile_pic, name, profession, city, state FROM personal_info WHERE user_id=%s;", (user_id,))
    info = cur.fetchone()
    cur.close()
    conn.close()
    if info:
        keys = ['profile_pic', 'name', 'profession', 'city', 'state']
        return jsonify(dict(zip(keys, info)))
    else:
        return jsonify({"error": "No profile info found"}), 404

@personal_bp.route('/update', methods=['POST'])
@jwt_required()
def update_personal_info():
    user_id = get_jwt_identity()
    data = request.json
    profile_pic = data.get('profile_pic')
    name = data.get('name')
    profession = data.get('profession')
    city = data.get('city')
    state = data.get('state')

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE personal_info SET profile_pic=%s, name=%s, profession=%s, city=%s, state=%s
        WHERE user_id=%s
    """, (profile_pic, name, profession, city, state, user_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Profile updated!"})
