from flask import Flask, request, jsonify, g
import mysql.connector
import time
import logging

app = Flask(__name__)

# -----------------------------------------
# Logging (important for production)
# -----------------------------------------
logging.basicConfig(level=logging.INFO)

# -----------------------------------------
# MySQL Config
# -----------------------------------------
dbconfig = {
    "host": "kaluajee.mysql.pythonanywhere-services.com",
    "user": "kaluajee",
    "password": "sud@1995",
    "database": "kaluajee$TrackIt"
}

# -----------------------------------------
# DB Connection (per request)
# -----------------------------------------
def get_db():
    if 'db' not in g:
        g.db = mysql.connector.connect(**dbconfig)
    return g.db

@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db', None)
    if db is not None:
        db.close()

# -----------------------------------------
# Helper: Get active session
# -----------------------------------------
def get_active_session(bus_id):
    conn = get_db()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute("""
            SELECT id FROM tracking_sessions
            WHERE bus_id=%s AND is_active=1
            LIMIT 1
        """, (bus_id,))
        result = cur.fetchone()

        if result:
            return result["id"]

        # Create new session
        cur.execute("""
            INSERT INTO tracking_sessions (bus_id, date, is_active)
            VALUES (%s, CURDATE(), 1)
        """, (bus_id,))
        conn.commit()

        return cur.lastrowid

    finally:
        cur.close()

# -----------------------------------------
# 1. Send location
# -----------------------------------------
@app.route('/location/update', methods=['POST'])
def update_location():
    try:
        data = request.get_json()

        bus_id = int(data['bus_id'])
        user_id = data['user_id']
        lat = float(data['latitude'])
        lng = float(data['longitude'])
        timestamp = int(data.get('timestamp', time.time()))

    except Exception as e:
        return jsonify({"error": f"Invalid input: {str(e)}"}), 400

    try:
        session_id = get_active_session(bus_id)

        conn = get_db()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO locations 
            (bus_id, session_id, user_id, latitude, longitude, timestamp)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (bus_id, session_id, user_id, lat, lng, timestamp))

        conn.commit()

        return jsonify({"status": "success"})

    except Exception as e:
        logging.error(f"Update Error: {str(e)}")
        return jsonify({"error": "Database error"}), 500

    finally:
        cur.close()

# -----------------------------------------
# 2. Get full session
# -----------------------------------------
@app.route('/tracking/session/<int:bus_id>', methods=['GET'])
def get_session(bus_id):
    try:
        session_id = get_active_session(bus_id)

        conn = get_db()
        cur = conn.cursor()

        cur.execute("""
            SELECT latitude, longitude, timestamp
            FROM locations
            WHERE bus_id=%s AND session_id=%s
            ORDER BY timestamp
        """, (bus_id, session_id))

        rows = cur.fetchall()

        parsed = [
            {"latitude": r[0], "longitude": r[1], "timestamp": r[2]}
            for r in rows
        ]

        return jsonify({
            "session_id": session_id,
            "locations": parsed,
            "last_timestamp": parsed[-1]["timestamp"] if parsed else None
        })

    except Exception as e:
        logging.error(f"Session Fetch Error: {str(e)}")
        return jsonify({"error": "Failed to fetch session"}), 500

    finally:
        cur.close()

# -----------------------------------------
# 3. Incremental updates
# -----------------------------------------
@app.route('/location/updates', methods=['GET'])
def get_updates():
    try:
        bus_id = int(request.args.get('bus_id'))
        since = int(request.args.get('since', 0))
    except:
        return jsonify({"error": "Invalid parameters"}), 400

    try:
        session_id = get_active_session(bus_id)

        conn = get_db()
        cur = conn.cursor()

        cur.execute("""
            SELECT latitude, longitude, timestamp
            FROM locations
            WHERE bus_id=%s AND session_id=%s AND timestamp > %s
            ORDER BY timestamp
        """, (bus_id, session_id, since))

        rows = cur.fetchall()

        parsed = [
            {"latitude": r[0], "longitude": r[1], "timestamp": r[2]}
            for r in rows
        ]

        return jsonify({
            "locations": parsed,
            "last_timestamp": parsed[-1]["timestamp"] if parsed else since
        })

    except Exception as e:
        logging.error(f"Update Fetch Error: {str(e)}")
        return jsonify({"error": "Failed to fetch updates"}), 500

    finally:
        cur.close()

# -----------------------------------------
# 4. Reset session
# -----------------------------------------
@app.route('/tracking/reset', methods=['POST'])
def reset_session():
    try:
        data = request.get_json()
        bus_id = int(data['bus_id'])
    except:
        return jsonify({"error": "Invalid input"}), 400

    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("""
            UPDATE tracking_sessions
            SET is_active=0
            WHERE bus_id=%s AND is_active=1
        """, (bus_id,))

        cur.execute("""
            INSERT INTO tracking_sessions (bus_id, date, is_active)
            VALUES (%s, CURDATE(), 1)
        """, (bus_id,))

        conn.commit()

        return jsonify({"status": "new session started"})

    except Exception as e:
        logging.error(f"Reset Error: {str(e)}")
        return jsonify({"error": "Failed to reset session"}), 500

    finally:
        cur.close()

# -----------------------------------------
# Health check
# -----------------------------------------
@app.route('/')
def index():
    return jsonify({"status": "running"}), 200

# -----------------------------------------
# Error handlers
# -----------------------------------------
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed"}), 405