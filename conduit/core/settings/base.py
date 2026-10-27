from pydantic import Extra, computed_field
from pydantic_settings import BaseSettings


class AppEnvTypes:
    """
    Available application environments.
    """

    production = "prod"
    development = "dev"
    testing = "test"


class BaseAppSettings(BaseSettings):
    """
    Base application setting class.
    """

    app_env: str = AppEnvTypes.production

    database_url: str = "sqlite:///./local_database.db"

    # Legacy postgres fields kept for backward compatibility (optional).
    postgres_host: str = ""
    postgres_port: int = 5432
    postgres_user: str = ""
    postgres_password: str = ""
    postgres_db: str = ""

    jwt_secret_key: str = "changeme"
    jwt_token_expiration_minutes: int = 60 * 24 * 7  # one week.
    jwt_algorithm: str = "HS256"

    class Config:
        env_file = ".env"
        extra = Extra.ignore

    @computed_field  # type: ignore
    @property
    def sql_db_uri(self) -> str:
        url = self.database_url
        # Convert sync driver URLs to async equivalents.
        if url.startswith("sqlite:"):
            if "///." in url or "//." in url:
                from pathlib import Path
                root_dir = Path(__file__).resolve().parents[3]
                rel_path = url.split("sqlite://", 1)[1].lstrip("/")
                db_path = (root_dir / rel_path).resolve().as_posix()
                return f"sqlite+aiosqlite:///{db_path}"
            return url.replace("sqlite:", "sqlite+aiosqlite:", 1)
        if url.startswith("postgresql:"):
            return url.replace("postgresql:", "postgresql+asyncpg:", 1)
        if url.startswith("postgres:"):
            return url.replace("postgres:", "postgresql+asyncpg:", 1)
        return url

    @computed_field  # type: ignore
    @property
    def sqlalchemy_engine_props(self) -> dict:
        return dict(url=self.sql_db_uri)
