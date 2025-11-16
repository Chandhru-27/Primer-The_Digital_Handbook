from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db_setup import get_db_connection


personal_bp = Blueprint('personal_info', __name__, url_prefix='/personal')


@personal_bp.route('/save', methods=['POST'])
@jwt_required()
def save_personal_info():
    """Save user's personal information"""
    user_id = get_jwt_identity()
    data = request.json
    profile_pic = data.get('profile_pic')
    full_name = data.get('full_name')
    age = data.get('age')
    address = data.get('address')

    with get_db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                UPDATE users SET profile_pic=%s, full_name=%s, age=%s, address=%s, updated_at=CURRENT_TIMESTAMP
                WHERE id=%s;
            """, (profile_pic, full_name, age, address, user_id))
            conn.commit()
        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)})
        finally:
            cur.close()
            
    return jsonify({"message": "Profile updated!"})


@personal_bp.route('/me', methods=['GET'])
@jwt_required()
def get_personal_info():
    """Retrieve user's personal information"""
    user_id = get_jwt_identity()
    
    with get_db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("SELECT username, email, full_name, phone, age, gender, profile_pic, address FROM users WHERE id=%s;", (user_id,))
            user_data = cur.fetchone()
        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 400
        finally:
            cur.close()

    if not user_data:
        return jsonify({"error": "User not found"}), 404

    keys = ['username', 'email', 'full_name', 'phone', 'profession', 'gender', 'profile_pic', 'address']

    return jsonify(dict(zip(keys, user_data)))


@personal_bp.route("/handbook", methods=["GET"])
@jwt_required()
def get_personal_handbook():
    """Get user's personal handbook information"""
    user_id = get_jwt_identity()

    with get_db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("SELECT field_name, field_value FROM personal_handbook WHERE user_id = %s", (user_id,))
            rows = cur.fetchall()
        except Exception as e:
            return jsonify({"error": str(e)}), 400
        finally:
            cur.close()
        
    result = [{"field_name": row[0], "field_value": row[1]} for row in rows]

    return jsonify(result), 200


@personal_bp.route("/handbook/update", methods=["POST"])
@jwt_required()
def add_or_update_field():
    """Add or update user's personal handbook fields"""
    user_id = get_jwt_identity()
    data = request.get_json()
    field_name = data.get("field_name")
    field_value = data.get("field_value")

    with get_db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO personal_handbook (user_id, field_name, field_value)
                VALUES (%s, %s, %s)
                ON CONFLICT (user_id, field_name)
                DO UPDATE SET field_value = EXCLUDED.field_value, updated_at = CURRENT_TIMESTAMP;
            """, (user_id, field_name, field_value))
            conn.commit()
        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 400
        finally:
            cur.close()

    return jsonify({"message": f"{field_name} updated successfully"}), 200


@personal_bp.route('/update', methods=['POST'])
@jwt_required()
def update_personal_info():
    """Update user's personal info"""
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
        'address': 'address'
    }

    for key, column in field_mappings.items():
        if key in data and data[key] is not None:
            fields_to_update.append(f"{column}=%s")
            values.append(data[key])

    if not fields_to_update:
        return jsonify({"error": "No valid fields to update"}), 400

    fields_to_update.append("updated_at=CURRENT_TIMESTAMP")
    values.append(user_id)

    with get_db_connection() as conn:
        cur = conn.cursor()
        try:
            query = f"""
                UPDATE users SET {', '.join(fields_to_update)}
                WHERE id=%s
            """
            cur.execute(query, values)
            conn.commit()
        except Exception as e:
            return jsonify({"error": str(e)}), 400
        finally:
            cur.close()
    
    return jsonify({"message": "Profile updated!"})
