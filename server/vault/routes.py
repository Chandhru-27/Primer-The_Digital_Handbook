from flask import Blueprint, request, jsonify
import psycopg2
import os
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from flask_jwt_extended import jwt_required, get_jwt_identity

load_dotenv()

vault_bp = Blueprint('vault', __name__, url_prefix='/vault')

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('PG_HOST'),
        database=os.getenv('PG_DB'),
        user=os.getenv('PG_USER'),
        password=os.getenv('PG_PASSWORD'),
        port=os.getenv('PG_PORT')
    )

# 1. Set or update vault password (only one per user)
@vault_bp.route('/set_password', methods=['POST'])
@jwt_required()
def set_vault_password():
    user_id = get_jwt_identity()
    data = request.json
    vault_password = data.get('vault_password')
    
    if not user_id or not vault_password:
        return jsonify({"error": "user_id and vault_password required"}), 400
    
    hashed_password = generate_password_hash(vault_password)

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO vault_passwords (user_id, vault_password)
        VALUES (%s, %s)
        ON CONFLICT (user_id)
        DO UPDATE SET vault_password = EXCLUDED.vault_password;
    """, (user_id, hashed_password))

    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Vault password set/updated!"})

#  Add a vault entry (e.g., for google.com, etc.)
@vault_bp.route('/add', methods=['POST'])
@jwt_required()
def add_vault_entry():
    user_id = get_jwt_identity()
    data = request.json
    domain = data.get('domain')
    account_name = data.get('account_name')
    pin_or_password = data.get('pin_or_password')
    notes = data.get('notes')

    if not user_id or not domain or not account_name or not pin_or_password:
        return jsonify({"error": "All fields required"}), 400
    
    conn = get_db_connection()
    cur = conn.cursor()
    url = data.get('url')
    cur.execute("""
        INSERT INTO vault (user_id, domain, account_name, pin_or_password, url, notes)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (user_id, domain)
        DO UPDATE SET
            account_name = EXCLUDED.account_name,
            pin_or_password = EXCLUDED.pin_or_password,
            url = EXCLUDED.url,
            notes = EXCLUDED.notes;
    """, (user_id, domain, account_name, pin_or_password, url, notes))

    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Vault entry added/updated!"}), 201

# 3. List all vault domains (no passwords shown)
@vault_bp.route('/get-vault', methods=['GET'])
@jwt_required()
def get_vault_entries():
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, domain, account_name, url, notes FROM vault WHERE user_id=%s
    """, (user_id,))
    entries = [{"id": r[0], "domain": r[1], "account_name": r[2], "url": r[3], "notes": r[4]} for r in cur.fetchall()]
    cur.close()
    conn.close()
    return jsonify(entries)

@vault_bp.route('/unlock-vault', methods=['POST'])
@jwt_required()
def unlock_vault():
    user_id = get_jwt_identity()
    data = request.json
    vault_password = data.get('vault_password')
    
    if not vault_password:
        return jsonify({"error": "Vault password is required"}), 400
    
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT vault_password FROM vault_passwords WHERE user_id=%s", (user_id,))
    result = cur.fetchone()

    if not result or not check_password_hash(result[0], vault_password):
        cur.close()
        conn.close()
        return jsonify({"error": "Invalid vault password"}), 401

    cur.close()
    conn.close()
    return jsonify({"message": "vault unlocked"}), 201

# 4. Get pin/password for a specific account (vault password check required)
@vault_bp.route('/view', methods=['POST'])
@jwt_required()
def view_vault_password():
    user_id = get_jwt_identity()
    data = request.json
    vault_password = data.get('vault_password')
    entry_id = data.get('entry_id')

    if not user_id or not vault_password or not entry_id:
        return jsonify({"error": "Missing fields"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
  
    cur.execute("SELECT vault_password FROM vault_passwords WHERE user_id=%s", (user_id,))
    result = cur.fetchone()

    if not result or not check_password_hash(result[0], vault_password):
        cur.close()
        conn.close()
        return jsonify({"error": "Invalid vault password"}), 401
    
    cur.execute("SELECT domain, account_name, pin_or_password, url, notes FROM vault WHERE id=%s AND user_id=%s",
                (entry_id, user_id))
    entry = cur.fetchone()
    cur.close()
    conn.close()
    if entry:
        return jsonify({
            "domain": entry[0],
            "account_name": entry[1],
            "pin_or_password": entry[2],
            "url": entry[3],
            "notes": entry[4]
        })
    else:
        return jsonify({"error": "No entry found"}), 404

# 5. Delete a vault entry
@vault_bp.route('/delete/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def delete_vault_entry(entry_id):
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT user_id FROM vault WHERE id=%s", (entry_id,))
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return jsonify({"error": "Vault entry not found"}), 404

    if row[0] != int(user_id):
        cur.close()
        conn.close()
        return jsonify({"error": "Unauthorized to delete this entry"}), 403

    cur.execute("DELETE FROM vault WHERE id=%s", (entry_id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Vault entry deleted!"})

@vault_bp.route('/update/<int:entry_id>', methods=['POST'])
@jwt_required()
def update_vault_entry(entry_id):
    user_id = get_jwt_identity()
    data = request.json
    domain = data.get('domain')
    account_name = data.get('account_name')
    pin_or_password = data.get('pin_or_password')
    url = data.get('url')
    notes = data.get('notes')

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT user_id FROM vault WHERE id=%s", (entry_id,))
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return jsonify({"error": "Vault entry not found"}), 404

    if row[0] != int(user_id):
        cur.close()
        conn.close()
        return jsonify({"error": "Unauthorized to update this entry"}), 403

    cur.execute("""
        UPDATE vault
        SET
            domain = COALESCE(%s, domain),
            account_name = COALESCE(%s, account_name),
            pin_or_password = COALESCE(%s, pin_or_password),
            url = COALESCE(%s, url),
            notes = COALESCE(%s, notes)
        WHERE id = %s AND user_id = %s;
    """, (domain, account_name, pin_or_password, url, notes, entry_id, user_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Vault entry updated!"})
