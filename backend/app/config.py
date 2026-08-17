import json

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Adaptive Signal Intelligence"
    api_v1_prefix: str = "/api/v1"
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_database: str = "adaptive_signal_intelligence"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5174"]
    density_low_max: float = 20.0
    density_medium_max: float = 40.0

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if value is None:
            return ["http://localhost:5173", "http://localhost:5174"]
        if isinstance(value, str):
            value = value.strip()
            if not value:
                return ["http://localhost:5173", "http://localhost:5174"]
            if value.startswith("["):
                return json.loads(value)
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


settings = Settings()
