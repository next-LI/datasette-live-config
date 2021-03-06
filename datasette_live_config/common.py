import os


DEFAULT_DBPATH="."
DB_NAME="live_config"
TABLE_NAME=DB_NAME
BLOCKED_DB_ACTIONS = [
    "live_permissions", "live_config", "surveys",
    "_internal", "_memory",
]


def get_db_path(datasette):
    config = datasette._metadata_local.get("datasette-live-config") or {}
    default_db_path = config.get("db_path", DEFAULT_DBPATH)
    return os.path.join(default_db_path, f"{DB_NAME}.db")



