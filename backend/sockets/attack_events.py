def register_events(socketio):
    @socketio.on("connect")
    def handle_connect():
        print("[Socket.IO] Client connected")

    @socketio.on("disconnect")
    def handle_disconnect():
        print("[Socket.IO] Client disconnected")

    @socketio.on("join_session")
    def handle_join(data):
        from flask_socketio import join_room
        session_id = data.get("sessionId", "")
        if session_id:
            join_room(session_id)
            print(f"[Socket.IO] Client joined session {session_id}")

    @socketio.on("start_attack")
    def handle_start_attack(data):
        import threading
        attack_type = data.get("attack_type")
        password = data.get("password", "")
        session_id = data.get("session_id", "")

        if not attack_type or not password or not session_id:
            socketio.emit("attack_error", {"message": "Missing parameters"}, room=session_id)
            return

        def run_attack():
            if attack_type == "dictionary":
                from services.dictionary_service import run_dictionary_attack
                run_dictionary_attack(password, session_id, socketio)
            elif attack_type == "hybrid":
                from services.hybrid_service import run_hybrid_attack
                run_hybrid_attack(password, session_id, socketio)
            elif attack_type == "bruteforce":
                from services.bruteforce_service import run_bruteforce_simulation
                run_bruteforce_simulation(password, session_id, socketio)

        thread = threading.Thread(target=run_attack, daemon=True)
        thread.start()

    @socketio.on("stop_attack")
    def handle_stop(data):
        session_id = data.get("session_id", "")
        # Set a cancellation flag that attack threads check
        from services.dictionary_service import cancel_flags
        cancel_flags[session_id] = True
