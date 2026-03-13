import time
from config import DICT_BATCH_SIZE, PROGRESS_INTERVAL_MS

# Cancellation flags keyed by session_id
cancel_flags = {}


def run_dictionary_attack(password: str, session_id: str, socketio):
    """
    Scan the RockYou collection in MongoDB for an exact match.
    Emits progress events via Socket.IO.
    """
    from app import get_db

    cancel_flags.pop(session_id, None)
    db = get_db()
    collection = db.passwords

    start_time = time.time()

    # Get total count for progress calculation
    total = collection.estimated_document_count()
    if total == 0:
        socketio.emit("attack_complete", {
            "attack_type": "dictionary",
            "found": False,
            "match": None,
            "attempts": 0,
            "elapsed_ms": 0,
            "message": "No passwords loaded in database. Please run the dataset loader.",
        }, room=session_id)
        return

    # First, do an indexed lookup to know the answer quickly
    exact_match = collection.find_one({"password": password})
    found = exact_match is not None
    found_at_line = exact_match["line_number"] if found else None

    # Simulate scanning for the visual effect
    attempts = 0
    last_emit = 0
    batch_size = DICT_BATCH_SIZE
    throttle = PROGRESS_INTERVAL_MS / 1000

    cursor = collection.find({}, {"password": 1, "line_number": 1}).sort("line_number", 1).batch_size(batch_size)

    for doc in cursor:
        if cancel_flags.get(session_id):
            socketio.emit("attack_complete", {
                "attack_type": "dictionary",
                "found": False,
                "match": None,
                "attempts": attempts,
                "elapsed_ms": int((time.time() - start_time) * 1000),
                "message": "Attack cancelled",
            }, room=session_id)
            cancel_flags.pop(session_id, None)
            return

        attempts += 1
        now = time.time()

        # Throttle progress emissions
        if now - last_emit >= throttle:
            percent = min(99, round((attempts / total) * 100, 1))
            socketio.emit("attack_progress", {
                "attack_type": "dictionary",
                "attempts": attempts,
                "total": total,
                "percent": percent,
                "current_word": doc["password"][:20],  # Truncate for display
                "rate": int(attempts / max(now - start_time, 0.001)),
                "elapsed_ms": int((now - start_time) * 1000),
            }, room=session_id)
            last_emit = now

        # If we found the password at this position, stop
        if found and doc.get("line_number") == found_at_line:
            elapsed = int((time.time() - start_time) * 1000)
            socketio.emit("attack_complete", {
                "attack_type": "dictionary",
                "found": True,
                "match": password,
                "attempts": attempts,
                "elapsed_ms": elapsed,
                "message": f"Password found in dictionary at position {found_at_line}!",
            }, room=session_id)
            return

    # Not found after full scan
    elapsed = int((time.time() - start_time) * 1000)
    socketio.emit("attack_complete", {
        "attack_type": "dictionary",
        "found": False,
        "match": None,
        "attempts": attempts,
        "elapsed_ms": elapsed,
        "message": "Password not found in dictionary",
    }, room=session_id)
