from flask import Blueprint, request, jsonify
import psycopg2
import os
from dotenv import load_dotenv
from flask_jwt_extended import jwt_required, get_jwt_identity
load_dotenv()

social_bp = Blueprint('social_links', __name__, url_prefix='/social')

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('PG_HOST'),
        database=os.getenv('PG_DB'),
        user=os.getenv('PG_USER'),
        password=os.getenv('PG_PASSWORD'),
        port=os.getenv('PG_PORT')
    )

# Add a social media link for user
@social_bp.route('/add', methods=['POST'])
@jwt_required()
def add_social_link():
    user_id = get_jwt_identity()
    data = request.json
    platform_name = data.get('platform_name')
    username = data.get('username')
    profile_link = data.get('profile_link')

    if not user_id or not platform_name or not profile_link:
        return jsonify({"error": "Missing fields"}), 400

    if profile_link and not profile_link.startswith(('http://', 'https://')):
        profile_link = 'https://' + profile_link

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO social_links (user_id, platform_name, username, profile_link)
        VALUES (%s, %s, %s, %s)
    """, (user_id, platform_name, username, profile_link))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Social link added!"}), 201

# Get all social links for a user
@social_bp.route('/get-social', methods=['GET'])
@jwt_required()
def get_social_links():
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, platform_name, username, profile_link
        FROM social_links
        WHERE user_id=%s
    """, (user_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    links = [{"id": r[0], "platform_name": r[1], "username": r[2], "profile_link": r[3]} for r in rows]
    return jsonify(links)

# Delete a specific social link by ID for a user
@social_bp.route('/delete/<int:link_id>', methods=['DELETE'])
@jwt_required()
def delete_social_link(link_id):
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT user_id FROM social_links WHERE id=%s", (link_id,))
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return jsonify({"error": "Social link not found"}), 404

    if row[0] != int(user_id):
        cur.close()
        conn.close()
        return jsonify({"error": "Unauthorized to delete this link"}), 403

    cur.execute("DELETE FROM social_links WHERE id=%s", (link_id,))
    conn.commit()
    cur.close()
    conn.close()

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

    # Normalize URL - add https:// if missing
    if profile_link and not profile_link.startswith(('http://', 'https://')):
        profile_link = 'https://' + profile_link

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT user_id FROM social_links WHERE id=%s", (link_id,))
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return jsonify({"error": "Social link not found"}), 404

    if row[0] != int(user_id):
        cur.close()
        conn.close()
        return jsonify({"error": "Unauthorized to update this link"}), 403

    cur.execute("""
        UPDATE social_links SET platform_name=%s, username=%s, profile_link=%s WHERE id=%s
    """, (platform_name, username, profile_link, link_id))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "Social link updated!"})
