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

@personal_bp.route('/save', methods=['POST'])
@jwt_required()
def save_personal_info():
    user_id = get_jwt_identity()
    data = request.json
    profile_pic = data.get('profile_pic')
    full_name = data.get('full_name')
    age = data.get('age')
    city = data.get('city')
    state = data.get('state')

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE users SET profile_pic=%s, full_name=%s, age=%s, city=%s, state=%s, updated_at=CURRENT_TIMESTAMP
        WHERE id=%s;
    """, (profile_pic, full_name, age, city, state, user_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Profile updated!"})


@personal_bp.route('/me', methods=['GET'])
@jwt_required()
def get_personal_info():
    user_id = get_jwt_identity()
    print(user_id)
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT username, email, full_name, phone, age, gender, profile_pic, city, state FROM users WHERE id=%s;", (user_id,))
    user_data = cur.fetchone()

    cur.close()
    conn.close()

    if not user_data:
        return jsonify({"error": "User not found"}), 404

    keys = ['username', 'email', 'full_name', 'phone', 'profession', 'gender', 'profile_pic', 'city', 'state']
    return jsonify(dict(zip(keys, user_data)))

@personal_bp.route("/handbook", methods=["GET"])
@jwt_required()
def get_personal_handbook():
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT field_name, field_value FROM personal_handbook WHERE user_id = %s", (user_id,))
    rows = cur.fetchall()

    result = [{"field_name": row[0], "field_value": row[1]} for row in rows]

    cur.close()
    conn.close()
    return jsonify(result), 200

@personal_bp.route("/handbook/update", methods=["POST"])
@jwt_required()
def add_or_update_field():
    user_id = get_jwt_identity()
    data = request.get_json()
    field_name = data.get("field_name")
    field_value = data.get("field_value")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO personal_handbook (user_id, field_name, field_value)
        VALUES (%s, %s, %s)
        ON CONFLICT (user_id, field_name)
        DO UPDATE SET field_value = EXCLUDED.field_value, updated_at = CURRENT_TIMESTAMP;
    """, (user_id, field_name, field_value))
    conn.commit()
    cursor.close()

    return jsonify({"message": f"{field_name} updated successfully"}), 200

@personal_bp.route('/update', methods=['POST'])
@jwt_required()
def update_personal_info():
    user_id = get_jwt_identity()
    data = request.json

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    fields_to_update = []
    values = []

    field_mappings = {
        'profile_pic': 'profile_pic',
        'full_name': 'full_name',
        'phone': 'phone',
        'age': 'age',
        'gender': 'gender',
        'city': 'city',
        'state': 'state'
    }

    for key, column in field_mappings.items():
        if key in data and data[key] is not None:
            fields_to_update.append(f"{column}=%s")
            values.append(data[key])

    if not fields_to_update:
        return jsonify({"error": "No valid fields to update"}), 400

    fields_to_update.append("updated_at=CURRENT_TIMESTAMP")
    values.append(user_id)

    conn = get_db_connection()
    cur = conn.cursor()
    query = f"""
        UPDATE users SET {', '.join(fields_to_update)}
        WHERE id=%s
    """
    cur.execute(query, values)
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Profile updated!"})
