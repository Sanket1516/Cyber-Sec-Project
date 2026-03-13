import time
from config import HYBRID_TOP_COUNT, PROGRESS_INTERVAL_MS
from utils.mutations import generate_mutations


def run_hybrid_attack(password: str, session_id: str, socketio):
    """
    Take the top N most common passwords from the dataset,
    apply mutations, and check against the target password.
    """
    from app import get_db
    from services.dictionary_service import cancel_flags

    cancel_flags.pop(session_id, None)
    db = get_db()
    collection = db.passwords

    start_time = time.time()

    # Fetch top passwords sorted by line_number (lower = more common)
    top_passwords = list(
        collection.find({}, {"password": 1, "_id": 0})
        .sort("line_number", 1)
        .limit(HYBRID_TOP_COUNT)
    )

    if not top_passwords:
        socketio.emit("attack_complete", {
            "attack_type": "hybrid",
            "found": False,
            "match": None,
            "attempts": 0,
            "elapsed_ms": 0,
            "message": "No passwords loaded in database.",
        }, room=session_id)
        return

    # Estimate total mutations per word (~230 mutations each)
    est_mutations_per_word = 230
    total_estimated = len(top_passwords) * est_mutations_per_word

    attempts = 0
    last_emit = 0
    throttle = PROGRESS_INTERVAL_MS / 1000

    for doc in top_passwords:
        base_word = doc["password"]

        if cancel_flags.get(session_id):
            socketio.emit("attack_complete", {
                "attack_type": "hybrid",
                "found": False,
                "match": None,
                "attempts": attempts,
                "elapsed_ms": int((time.time() - start_time) * 1000),
                "message": "Attack cancelled",
            }, room=session_id)
            cancel_flags.pop(session_id, None)
            return

        for mutation in generate_mutations(base_word):
            attempts += 1
            now = time.time()

            if now - last_emit >= throttle:
                percent = min(99, round((attempts / total_estimated) * 100, 1))
                socketio.emit("attack_progress", {
                    "attack_type": "hybrid",
                    "attempts": attempts,
                    "total": total_estimated,
                    "percent": percent,
                    "current_word": mutation[:30],
                    "rate": int(attempts / max(now - start_time, 0.001)),
                    "elapsed_ms": int((now - start_time) * 1000),
                }, room=session_id)
                last_emit = now

            if mutation == password:
                elapsed = int((time.time() - start_time) * 1000)
                socketio.emit("attack_complete", {
                    "attack_type": "hybrid",
                    "found": True,
                    "match": mutation,
                    "base_word": base_word,
                    "attempts": attempts,
                    "elapsed_ms": elapsed,
                    "message": f"Password found via mutation of '{base_word}'!",
                }, room=session_id)
                return

    elapsed = int((time.time() - start_time) * 1000)
    socketio.emit("attack_complete", {
        "attack_type": "hybrid",
        "found": False,
        "match": None,
        "attempts": attempts,
        "elapsed_ms": elapsed,
        "message": "Password not found via hybrid mutations",
    }, room=session_id)
