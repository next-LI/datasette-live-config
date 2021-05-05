from datasette import hookimpl
from datasette.utils.asgi import Response, Forbidden
from starlette.requests import Request
import os
import sqlite_utils
import sqlite3


import json
import os

from datasette import hookimpl
from datasette.database import Database as DS_Database


DEFAULT_DBPATH="."
DB_NAME="live_config"
TABLE_NAME=DB_NAME


@hookimpl
def permission_allowed(actor, action):
    return True
    if action == "live-config" and actor and actor.get("id") == "root":
        print("!!!!! PERMISSION ALLOWED")
        return True


@hookimpl
def register_routes():
    return [
        (r"^/-/live-config$", live_config),
    ]


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


def get_metadata_from_db(database_name, table_name):
    print(f"get_metadata_from_db({database_name}, {table_name})")
    database_path = os.path.join(DEFAULT_DBPATH, f"{DB_NAME}.db")
    db = sqlite_utils.Database(sqlite3.connect(database_path))
    try:
        configs = db[TABLE_NAME]
    except Exception as e:
        print(f"!!! Error loading table: {e}")
        return {}

    if not database_name and not table_name:
        print("NONONONONONONONONO")
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
    print("results", results)
    if not results:
        return {}
    for row in results:
        print("row:", row, "data:", type(row["data"]))
        if "data" not in row:
            return {}
        return json.loads(row["data"])
    return {}


def update_config(database_name, table_name, data):
    # TODO: validate JSON?
    assert isinstance(data, str)
    database_path = os.path.join(DEFAULT_DBPATH, f"{DB_NAME}.db")
    db = sqlite_utils.Database(sqlite3.connect(database_path))
    configs = db[TABLE_NAME]
    configs.insert({
        "database_name": database_name,
        "table_name": table_name,
        "data": data,
    }, pk=("database_name", "table_name"), replace=True)
    return configs


async def live_config(scope, receive, datasette, request):
    # TODO: get database name/table name
    database_name = None
    table_name = None
    if request.method != "POST":
        # TODO: Decide if we use this or pull saved config
        metadata = datasette.metadata()
        return Response.html(
            await datasette.render_template(
                "config_editor.html", {
                    "database": database_name,
                    "table": table_name,
                    "configJSON": json.dumps(metadata)
                }, request=request
            )
        )

    formdata = await request.post_vars()
    update_config(database_name, table_name, formdata["config"])
    metadata = datasette.metadata()
    return Response.html(
        await datasette.render_template(
            "config_editor.html", {
                "database": None,
                "table": None,
                "message": "Configuration updated successfully!",
                "status": "success",
                "configJSON": json.dumps(metadata),
            }, request=request
        )
    )


# This does the actual configuration lookup. This gets called when something
# requests metadata/config or uses plugin_config.
# TODO: it doesn't seem like this function gets called with table anything
# but None, so every function using configuration is getting it from the
# global metadata structure. i'm thinking that we probably want to construct
# the global metadata structure from queries for configurations in our
# database with table set. this way users can permission out on the table
# level, which leads to another TODO: permissioning (maybe use `allow`?)
@hookimpl
def get_metadata(datasette, key, database, table, fallback):
    print(f"get_metadata database={database} table={table} key={key} fallback={fallback}")
    if not datasette:
        print("No datasette!")
        return {}

    return get_metadata_from_db(database, table)
    # databases = metadata.get("databases") or {}
    # if database and not table:
    #     return databases.get(database)
    # if database and table:
    #     return databases.get(database, {}).get(table, {})
    # return metadata

