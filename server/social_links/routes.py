from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from db_setup import get_db_connection


social_bp = Blueprint('social_links', __name__, url_prefix='/social')


@social_bp.route('/add', methods=['POST'])
@jwt_required()
def add_social_link():
    """Add a social media link to the user's social vault"""
    user_id = get_jwt_identity()
    data = request.json
    platform_name = data.get('platform_name')
    username = data.get('username')
    profile_link = data.get('profile_link')

    if not user_id or not platform_name or not profile_link:
        return jsonify({"error": "Missing fields"}), 400

    if profile_link and not profile_link.startswith(('http://', 'https://')):
        profile_link = 'https://' + profile_link

    with get_db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO social_links (user_id, platform_name, username, profile_link)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, (user_id, platform_name, username, profile_link))
            
            new_id = cur.fetchone()[0]
            conn.commit()

            new_link = {
                "id": new_id,
                "platform_name": platform_name,
                "username": username,
                "profile_link": profile_link
            }

        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 400
        finally:
            cur.close()

    return jsonify(new_link), 201


@social_bp.route('/get-social', methods=['GET'])
@jwt_required()
def get_social_links():
    """Get all social links for a user"""
    user_id = get_jwt_identity()

    with get_db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT id, platform_name, username, profile_link
                FROM social_links
                WHERE user_id=%s
            """, (user_id,))
            rows = cur.fetchall()
        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 400
        finally:
            cur.close()

    links = [{"id": r[0], "platform_name": r[1], "username": r[2], "profile_link": r[3]} for r in rows]

    return jsonify(links)


@social_bp.route('/delete/<int:link_id>', methods=['DELETE'])
@jwt_required()
def delete_social_link(link_id):
    """Delete a specific social link by ID for a user"""
    user_id = get_jwt_identity()

    with get_db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("SELECT user_id FROM social_links WHERE id=%s", (link_id,))
            row = cur.fetchone()

            if not row:
                cur.close()
                return jsonify({"error": "Social link not found"}), 404

            if row[0] != int(user_id):
                cur.close()
                return jsonify({"error": "Unauthorized to delete this link"}), 403

            cur.execute("DELETE FROM social_links WHERE id=%s", (link_id,))
            conn.commit()
        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 400
        finally:
            cur.close()
    
    return jsonify({"message": "Social link deleted!"})


@social_bp.route('/update/<int:link_id>', methods=['POST'])
@jwt_required()
def update_social_link(link_id):
    user_id = get_jwt_identity()
    data = request.json
    platform_name = data.get('platform_name')
    username = data.get('username')
    profile_link = data.get('profile_link')

    if not platform_name or not profile_link:
        return jsonify({"error": "Platform name and profile link are required"}), 400

    if profile_link and not profile_link.startswith(('http://', 'https://')):
        profile_link = 'https://' + profile_link

    with get_db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("SELECT user_id FROM social_links WHERE id=%s", (link_id,))
            row = cur.fetchone()

            if not row:
                cur.close()
                conn.rollback()
                return jsonify({"error": "Social link not found"}), 404

            if row[0] != int(user_id):
                cur.close()
                conn.rollback()
                return jsonify({"error": "Unauthorized to update this link"}), 403

            cur.execute("""
                UPDATE social_links
                SET
                    platform_name = COALESCE(%s, platform_name),
                    username = COALESCE(%s, username),
                    profile_link = COALESCE(%s, profile_link)
                WHERE id = %s
            """, (platform_name, username, profile_link, link_id))
            conn.commit()
        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 400
        finally:           
            cur.close()

    return jsonify({"message": "Social link updated!"})
