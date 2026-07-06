from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Node.js backend base URL
    NODE_API_URL: str = "http://localhost:3000/api"

    # LLM provider: "groq" (free, fast) or "openai"
    LLM_PROVIDER: str = "groq"

    # Groq — free tier, uses Llama 3 (recommended for learning)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    # OpenAI — paid, swap LLM_PROVIDER to "openai" to use
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Local sentence-transformer model for embeddings (auto-downloaded on first run)
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Chroma vector DB path (local persistent storage)
    CHROMA_DB_PATH: str = "./chroma_db"

    # Service port
    PORT: int = 8000

    model_config = {"env_file": ".env"}


settings = Settings()
