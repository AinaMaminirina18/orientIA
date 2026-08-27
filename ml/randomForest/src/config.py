import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "ORIENT’IA")
    APP_VERSION: str = os.getenv("APP_VERSION", "0.1.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Clé principale et clé de secours (fallback)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_API_KEY_BACKUP: str = os.getenv("GROQ_API_KEY_BACKUP", "")
    
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "")

settings = Settings() 
