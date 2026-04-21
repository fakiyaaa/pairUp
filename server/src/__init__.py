from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from src.config import Config
from src.db import init_db, close_db
from src.routes.auth import auth_bp
from src.routes.profiles import profiles_bp
from src.routes.sessions import sessions_bp
from src.routes.webhooks import webhooks_bp
from src.routes.cal_oauth import cal_oauth_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    frontend_origin = app.config["FRONTEND_URL"]
    allowed_origins = {
        frontend_origin,
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    }
    CORS(app, origins=list(allowed_origins), supports_credentials=True)
    JWTManager(app)

    init_db(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(profiles_bp, url_prefix="/profiles")
    app.register_blueprint(sessions_bp, url_prefix="/sessions")
    app.register_blueprint(webhooks_bp, url_prefix="/webhooks")
    app.register_blueprint(cal_oauth_bp, url_prefix="/auth/cal")

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app
