import logging

from pydantic import computed_field
from sqlalchemy import NullPool

from conduit.core.settings.app import AppSettings


class TestAppSettings(AppSettings):
    """
    Test application settings.
    """

    debug: bool = True

    title: str = "[TEST] Conduit API"

    logging_level: int = logging.DEBUG

    class Config(AppSettings.Config):
        env_file = ".env.test"

    @computed_field  # type: ignore
    @property
    def sqlalchemy_engine_props(self) -> dict:
        props = dict(
            url=self.sql_db_uri,
            echo=False,
            poolclass=NullPool,
        )
        if not str(self.sql_db_uri).startswith("sqlite"):
            props["isolation_level"] = "AUTOCOMMIT"
        return props
