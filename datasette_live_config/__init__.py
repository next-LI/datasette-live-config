from datasette import hookimpl
import functools
import json
import os
import sqlite_utils
import sqlite3

from .common import get_db_path, TABLE_NAME
from .views import register_routes # noqa


@hookimpl
def permission_allowed(actor, action):
    if action == "live-config" and actor and actor.get("id") == "root":
        return True


@hookimpl
def menu_links(datasette, actor):
    async def inner():
        allowed = await datasette.permission_allowed(
            actor, "live-config", default=False
        )
        if allowed:
            return [{
                "href": datasette.urls.path("/-/live-config"),
                "label": "Configuration editor"
            }]
    return inner


@hookimpl
def database_actions(datasette, actor, database):
    async def inner_database_actions():
        allowed = await datasette.permission_allowed(
            actor, "live-config", database, default=False
        )
        if allowed:
            return [{
                "href": datasette.urls.path(f"/-/live-config/{database}?meta_in_db=true"),
                "label": "Edit database configuration",
            }]
    return inner_database_actions


@functools.lru_cache(maxsize=128)
def get_live_config_db(datasette):
    database_path = get_db_path(datasette)
    db = sqlite_utils.Database(sqlite3.connect(database_path))
    return db


@functools.lru_cache(maxsize=128)
def get_datasette_db(datasette, db_name):
    db = sqlite_utils.Database(datasette.databases[db_name].connect())
    return db


def get_metadata_from_db(datasette, database_name, table_name):
    db = get_live_config_db(datasette)
    try:
        configs = db[TABLE_NAME]
    except Exception:
        return {}

    if not database_name and not table_name:
        results = configs.rows_where(
            "database_name is null and table_name is null", limit=1
        )
    elif database_name and not table_name:
        results = configs.rows_where(
            "database_name=? and table_name is null", [database_name], limit=1
        )
    else:
        results = configs.rows_where(
            "database_name=? and table_name=?", [
                database_name, table_name
            ], limit=1
        )

    if not results:
        return {}
    for row in results:
        if "data" not in row:
            return {}
        return json.loads(row["data"])
    return {}


# shared with datasette:app.py (Datasette._metadata_recursive_update)
def _metadata_recursive_update(orig, updated):
    if not isinstance(orig, dict) or not isinstance(updated, dict):
        return orig

    for key, upd_value in updated.items():
        if isinstance(upd_value, dict) and isinstance(orig.get(key), dict):
            orig[key] = _metadata_recursive_update(
                orig[key], upd_value
            )
        else:
            orig[key] = upd_value
    return orig


def update_from_db_metadata(metadata, datasette, database, table):
    """
    Update the global metadata using data found inside a database's
    __metadata table. Anything found in the table will be merged (if it's a dict)
    into the global meta or, if it's not a dict, will override the corresponding
    value.

    This mutates the provided metadata dict object (and also return it for chaining).
    """
    for db_name in datasette.databases:
        db = get_datasette_db(datasette, db_name)
        if "__metadata" not in db.table_names():
            continue
        meta_table = db["__metadata"]
        # some basic bootstrapping here ....
        if "databases" not in metadata:
            metadata["databases"] = {}
        if db_name not in metadata["databases"]:
            metadata["databases"][db_name] = {}
        for row in meta_table.rows:
            key = row.get("key")
            row_value = row.get("value")
            obj_value = json.loads(row_value)
            if isinstance(obj_value, dict):
                if key not in metadata["databases"][db_name]:
                    metadata["databases"][db_name][key] = {}
                _metadata_recursive_update(
                    metadata["databases"][db_name][key], obj_value
                )
            elif obj_value:
                metadata["databases"][db_name][key] = obj_value
    return metadata


# This lives as a separate function so we can profile it easily
def run_get_metadata(datasette, key, database, table):
    metadata = get_metadata_from_db(datasette, "global", "global")
    update_from_db_metadata(metadata, datasette, database, table)
    return metadata


# This does the actual configuration lookup. This gets called when something
# requests metadata/config or uses plugin_config.
# TODO: it doesn't seem like this function gets called with table anything
# but None, so every function using configuration is getting it from the
# global metadata structure. i'm thinking that we probably want to construct
# the global metadata structure from queries for configurations in our
# database with table set. this way users can permission out on the table
# level, which leads to another
@hookimpl
def get_metadata(datasette, key, database, table):
    return run_get_metadata(datasette, key, database, table)
