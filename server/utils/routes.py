from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db_setup import get_db_connection

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()
    print("HIT : dashboard endpoint")
    with get_db_connection() as conn:
        cur = conn.cursor()

        try:
            query = """
                SELECT 
                    u.username,
                    COALESCE(v.vault_count, 0) AS vault_count,
                    COALESCE(s.social_count, 0) AS social_count
                FROM users u
                LEFT JOIN (
                    SELECT user_id, COUNT(*) AS vault_count
                    FROM vault
                    GROUP BY user_id
                ) v ON u.id = v.user_id
                LEFT JOIN (
                    SELECT user_id, COUNT(*) AS social_count
                    FROM social_links
                    GROUP BY user_id
                ) s ON u.id = s.user_id
                WHERE u.id = %s;
            """

            cur.execute(query, (user_id,))
            row = cur.fetchone()

            if not row:
                return jsonify({"error": "User not found"}), 404

            print(row)
            username, vault_count, social_count = row
            
        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 400
        finally:
            cur.close()

    return jsonify({
        "username": username,
        "vault_count": vault_count,
        "social_count": social_count
    }), 200
