import threading
from flask import Blueprint, request, jsonify

attack_bp = Blueprint("attack", __name__)


def _launch_attack(attack_type, password, session_id):
    """Launch an attack in a background thread via Socket.IO."""
    from app import socketio

    def run():
        if attack_type == "dictionary":
            from services.dictionary_service import run_dictionary_attack
            run_dictionary_attack(password, session_id, socketio)
        elif attack_type == "hybrid":
            from services.hybrid_service import run_hybrid_attack
            run_hybrid_attack(password, session_id, socketio)
        elif attack_type == "bruteforce":
            from services.bruteforce_service import run_bruteforce_simulation
            run_bruteforce_simulation(password, session_id, socketio)

    thread = threading.Thread(target=run, daemon=True)
    thread.start()


@attack_bp.route("/dictionary", methods=["POST"])
def dictionary_attack():
    data = request.get_json(force=True)
    password = data.get("password", "")
    session_id = data.get("sessionId", "")

    if not password or not session_id:
        return jsonify({"error": "password and sessionId are required"}), 400

    _launch_attack("dictionary", password, session_id)
    return jsonify({"message": "Dictionary attack started", "sessionId": session_id})


@attack_bp.route("/hybrid", methods=["POST"])
def hybrid_attack():
    data = request.get_json(force=True)
    password = data.get("password", "")
    session_id = data.get("sessionId", "")

    if not password or not session_id:
        return jsonify({"error": "password and sessionId are required"}), 400

    _launch_attack("hybrid", password, session_id)
    return jsonify({"message": "Hybrid attack started", "sessionId": session_id})


@attack_bp.route("/bruteforce", methods=["POST"])
def bruteforce_attack():
    data = request.get_json(force=True)
    password = data.get("password", "")
    session_id = data.get("sessionId", "")

    if not password or not session_id:
        return jsonify({"error": "password and sessionId are required"}), 400

    _launch_attack("bruteforce", password, session_id)
    return jsonify({"message": "Brute force simulation started", "sessionId": session_id})
