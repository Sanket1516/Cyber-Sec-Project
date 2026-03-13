from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from pymongo import MongoClient
from config import MONGODB_URI, DATABASE_NAME

socketio = SocketIO(cors_allowed_origins="*")
mongo_client = None
db = None


def get_db():
    global db
    if db is None:
        raise RuntimeError("Database not initialised – call create_app() first")
    return db


def create_app():
    global mongo_client, db

    app = Flask(__name__)
    CORS(app)

    # MongoDB
    mongo_client = MongoClient(MONGODB_URI)
    db = mongo_client[DATABASE_NAME]

    # Register blueprints
    from routes.analysis_routes import analysis_bp
    from routes.attack_routes import attack_bp
    from routes.cracktime_routes import cracktime_bp
    from routes.visualization_routes import visualization_bp
    from routes.recommendation_routes import recommendation_bp

    app.register_blueprint(analysis_bp, url_prefix="/api")
    app.register_blueprint(attack_bp, url_prefix="/api/attack")
    app.register_blueprint(cracktime_bp, url_prefix="/api")
    app.register_blueprint(visualization_bp, url_prefix="/api")
    app.register_blueprint(recommendation_bp, url_prefix="/api")

    # Health check
    @app.route("/api/health")
    def health():
        return {"status": "ok"}

    # Socket.IO
    socketio.init_app(app, async_mode="threading")

    from sockets.attack_events import register_events
    register_events(socketio)

    return app
