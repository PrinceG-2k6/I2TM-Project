from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Adaptive Signal Intelligence"
    api_v1_prefix: str = "/api/v1"
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "adaptive_signal_intelligence"
    cors_origins: list[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
