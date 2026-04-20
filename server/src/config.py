import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 900))
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 604800))
    DATABASE_URL = os.getenv("DATABASE_URL", "")
    CALENDLY_WEBHOOK_SECRET = os.getenv("CALENDLY_WEBHOOK_SECRET", "")
    CALENDLY_CLIENT_ID = os.getenv("CALENDLY_CLIENT_ID", "").strip()
    CALENDLY_CLIENT_SECRET = os.getenv("CALENDLY_CLIENT_SECRET", "").strip()
    CALENDLY_REDIRECT_URI = os.getenv("CALENDLY_REDIRECT_URI", "http://localhost:3000/auth/cal/callback").strip()
    CALENDLY_WEBHOOK_URL = os.getenv("CALENDLY_WEBHOOK_URL", "").strip()
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
