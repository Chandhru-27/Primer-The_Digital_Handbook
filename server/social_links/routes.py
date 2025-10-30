from flask import Blueprint, request, jsonify
import psycopg2
import os
from dotenv import load_dotenv

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
def add_social_link():
    data = request.json
    user_id = data.get('user_id')
    platform_name = data.get('platform_name')
    profile_link = data.get('profile_link')

    if not user_id or not platform_name or not profile_link:
        return jsonify({"error": "Missing fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO social_links (user_id, platform_name, profile_link)
        VALUES (%s, %s, %s)
    """, (user_id, platform_name, profile_link))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Social link added!"}), 201

# Get all social links for a user
@social_bp.route('/<int:user_id>', methods=['GET'])
def get_social_links(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, platform_name, profile_link
        FROM social_links
        WHERE user_id=%s
    """, (user_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    links = [{"id": r[0], "platform_name": r[1], "profile_link": r[2]} for r in rows]
    return jsonify(links)

# Delete a specific social link by ID for a user
@social_bp.route('/delete/<int:link_id>', methods=['DELETE'])
def delete_social_link(link_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM social_links WHERE id=%s", (link_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Social link deleted!"})


@social_bp.route('/update/<int:link_id>', methods=['POST'])
def update_social_link(link_id):
    data = request.json
    platform_name = data.get('platform_name')
    profile_link = data.get('profile_link')

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE social_links SET platform_name=%s, profile_link=%s WHERE id=%s
    """, (platform_name, profile_link, link_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Social link updated!"})
