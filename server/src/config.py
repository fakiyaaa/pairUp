import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 900))
    JWT_REFRESH_TOKEN_EXPIRES = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES", 604800))
    DATABASE_URL = os.getenv("DATABASE_URL", "")
    CAL_WEBHOOK_SECRET = os.getenv("CAL_WEBHOOK_SECRET", "")
    CAL_CLIENT_ID = os.getenv("CAL_CLIENT_ID", "").strip()
    CAL_CLIENT_SECRET = os.getenv("CAL_CLIENT_SECRET", "").strip()
    CAL_REDIRECT_URI = os.getenv("CAL_REDIRECT_URI", "http://localhost:3000/auth/cal/callback").strip()
    CAL_WEBHOOK_URL = os.getenv("CAL_WEBHOOK_URL", "").strip()
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
