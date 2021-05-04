from datasette import hookimpl
from datasette.utils.asgi import Response, Forbidden
from starlette.requests import Request
import os
import sqlite_utils


import json
import os

from datasette import hookimpl
from datasette.database import Database as DS_Database


DEFAULT_DBPATH="data"
DB_NAME="live_config"
TABLE_NAME=DB_NAME


@hookimpl
def permission_allowed(actor, action):
    if action == "live-config" and actor and actor.get("id") == "root":
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


def create_database(datasette):
    database_path = os.path.join(DEFAULT_DBPATH, f"{DB_NAME}.db")
    print("creating database", database_path)
    db = sqlite_utils.Database(database_path)
    if TABLE_NAME not in db:
        db[TABLE_NAME].create({
            "database_name": str,
            "table_name": str,
            "data": str,
        }, pk=("database_name", "table_name"))
    return db


def get_or_create_database(datasette):
    if DB_NAME not in datasette.databases:
        return create_database(datasette)
    database_path = os.path.join(DEFAULT_DBPATH, f"{DB_NAME}.db")
    return sqlite_utils.Database(database_path)


def get_metadata_from_db(db, database, table):
    if not database and not table:
        results = db[TABLE_NAME].rows_where(
            "database_name is null and table_name is null", limit=1
        )
    elif database and not table:
        results = db[TABLE_NAME].rows_where(
            "database_name=? and table_name is null", [database], limit=1
        )
    else:
        results = db[TABLE_NAME].rows_where(
            "database_name=? and table_name=?", [database, table], limit=1
        )
    if not results:
        return {}
    for row in results:
        print("row:", row, "data:", type(row["data"]))
        if "data" not in row:
            return {}
        return json.loads(row["data"])
    return {}


def save_metadata(datasette, database, table, data):
    db = get_or_create_database(datasette)
    return db[TABLE_NAME].insert({
        "database_name": database,
        "table_name": table,
        "data": data if isinstance(data, str) else json.dumps(data),
    }, pk=(database, table), replace=True)


async def live_config(scope, receive, datasette, request):
    # TODO: get database name/table name
    # metadata = get_metadata_from_db(db, None, None)
    if request.method != "POST":
        # TODO: Decide if we use this or pull saved config
        metadata = datasette.metadata()
        return Response.html(
            await datasette.render_template(
                "config_editor.html", {
                    "database": None,
                    "table": None,
                    "configJSON": json.dumps(metadata)
                }, request=request
            )
        )

    formdata = await request.post_vars()
    save_metadata(datasette, None, None, formdata["config"])
    metadata = datasette.metadata()
    return Response.html(
        await datasette.render_template(
            "config_editor.html", {
                "database": None,
                "table": None,
                "message": "Configuration updated successfully!",
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

    db = get_or_create_database(datasette)
    return get_metadata_from_db(db, database, table)
    # databases = metadata.get("databases") or {}
    # if database and not table:
    #     return databases.get(database)
    # if database and table:
    #     return databases.get(database, {}).get(table, {})
    # return metadata

