import os
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

class Settings:
    """Holds all application settings."""
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY")
    GOOGLE_MODEL_NAME: str = os.getenv("GOOGLE_MODEL_NAME", "gemini-1.5-flash")
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", 0.6))
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", 2048))
    
    # --- Security & API Tokens ---
    API_AUTH_TOKEN: str = os.getenv("API_AUTH_TOKEN")

settings = Settings()

if not settings.GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not set. Please create a .env file and add it.")

if not settings.API_AUTH_TOKEN:
    raise ValueError("API_AUTH_TOKEN environment variable not set. Please add it to your .env file.")