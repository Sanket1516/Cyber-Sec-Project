import time
import math
import random
import string
import hashlib
from config import HARDWARE_SPEEDS, BRUTEFORCE_ANIMATION_SECONDS
from services.cracktime_service import estimate_crack_time, format_duration


def run_bruteforce_simulation(password: str, session_id: str, socketio):
    """
    Simulate a brute force attack. Does NOT actually enumerate all combinations.
    Calculates the keyspace mathematically and runs a visual animation.
    """
    import re
    from services.dictionary_service import cancel_flags

    cancel_flags.pop(session_id, None)

    length = len(password)

    # Determine charset
    charset_size = 0
    chars = ""
    if re.search(r"[a-z]", password):
        charset_size += 26
        chars += string.ascii_lowercase
    if re.search(r"[A-Z]", password):
        charset_size += 26
        chars += string.ascii_uppercase
    if re.search(r"[0-9]", password):
        charset_size += 10
        chars += string.digits
    if re.search(r"[^a-zA-Z0-9]", password):
        charset_size += 33
        chars += string.punctuation
    if not chars:
        chars = string.ascii_lowercase
        charset_size = 26

    estimates = estimate_crack_time(charset_size, length)

    # Use a deterministic "discovery point" based on password hash
    # This gives a consistent experience for the same password
    pw_hash = int(hashlib.sha256(password.encode()).hexdigest(), 16)
    total_combinations = charset_size ** length
    discovery_fraction = (pw_hash % 1000) / 1000  # 0.0 - 0.999

    start_time = time.time()
    animation_duration = BRUTEFORCE_ANIMATION_SECONDS
    interval = 0.1  # Emit every 100ms
    simulated_attempts = 0

    # Emit initial state
    socketio.emit("attack_progress", {
        "attack_type": "bruteforce",
        "attempts": 0,
        "total": total_combinations if total_combinations < 1e15 else None,
        "total_display": str(total_combinations),
        "percent": 0,
        "current_word": "",
        "rate": 0,
        "elapsed_ms": 0,
        "estimates": estimates["estimates"],
    }, room=session_id)

    elapsed = 0
    while elapsed < animation_duration:
        if cancel_flags.get(session_id):
            socketio.emit("attack_complete", {
                "attack_type": "bruteforce",
                "found": False,
                "match": None,
                "attempts": simulated_attempts,
                "elapsed_ms": int(elapsed * 1000),
                "message": "Simulation cancelled",
            }, room=session_id)
            cancel_flags.pop(session_id, None)
            return

        time.sleep(interval)
        elapsed = time.time() - start_time
        progress = min(elapsed / animation_duration, 1.0)
        simulated_attempts = int(progress * total_combinations * discovery_fraction)

        # Generate random candidate for visual effect
        candidate = "".join(random.choices(chars, k=length))

        socketio.emit("attack_progress", {
            "attack_type": "bruteforce",
            "attempts": simulated_attempts,
            "total": total_combinations if total_combinations < 1e15 else None,
            "total_display": str(total_combinations),
            "percent": round(progress * 100, 1),
            "current_word": candidate,
            "rate": int(simulated_attempts / max(elapsed, 0.001)),
            "elapsed_ms": int(elapsed * 1000),
            "estimates": estimates["estimates"],
        }, room=session_id)

    # Animation complete
    elapsed_ms = int((time.time() - start_time) * 1000)
    socketio.emit("attack_complete", {
        "attack_type": "bruteforce",
        "found": False,
        "match": None,
        "attempts": simulated_attempts,
        "elapsed_ms": elapsed_ms,
        "total_combinations": str(total_combinations),
        "estimates": estimates["estimates"],
        "message": f"Brute force would require {estimates['estimates']['cpu']['display']} (CPU) to {estimates['estimates']['cluster']['display']} (GPU Cluster)",
    }, room=session_id)
