import os


DEFAULT_DBPATH="."
DB_NAME="live_config"
TABLE_NAME=DB_NAME


def get_db_path(datasette):
    config = datasette.plugin_config("datasette-live-config") or {}
    default_db_path = config.get("db_path", DEFAULT_DBPATH)
    return os.path.join(default_db_path, f"{DB_NAME}.db")



