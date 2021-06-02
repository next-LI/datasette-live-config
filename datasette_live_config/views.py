import json
import os

from datasette import hookimpl
from datasette.utils.asgi import Response, Forbidden
import sqlite3
import sqlite_utils


DEFAULT_DBPATH="."
DB_NAME="live_config"
TABLE_NAME=DB_NAME


@hookimpl
def register_routes():
    return [
        (r"^/-/live-config$", live_config),
        (r"^/-/live-config/(?P<database_name>.*)$", live_config),
    ]


def update_live_config_db(database_name, table_name, data):
    assert database_name and table_name, "Database and table names blank!"
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
    configs.create_index([
        "database_name", "table_name",
    ], unique=True)
    return configs


def update_db_metadata(ds_database, db_meta):
    db = sqlite_utils.Database(sqlite3.connect(ds_database.path))
    for key, value in db_meta.items():
        db["__metadata"].insert({
            "key": key,
            "value": json.dumps(value),
        }, pk="key", alter=True, replace=True)


async def live_config(scope, receive, datasette, request):
    submit_url = request.path
    database_name = request.url_vars.get("database_name", "global")
    meta_in_db = True if request.args.get("meta_in_db") else False
    if meta_in_db:
        submit_url += '?meta_in_db=true'
    table_name = "global"
    perm_args = ()
    if database_name:
        perm_args = (database_name,)
    if not await datasette.permission_allowed(
        request.actor, "live-config", *perm_args,
        default=False
    ):
        raise Forbidden("Permission denied for live-config")


    if request.method != "POST":
        # TODO: Decide if we use this or pull saved config
        metadata = datasette.metadata()
        if database_name and database_name != "global":
            metadata = metadata["databases"].get(database_name, {})
        return Response.html(
            await datasette.render_template(
                "config_editor.html", {
                    "database_name": database_name,
                    "configJSON": json.dumps(metadata),
                    "submit_url": submit_url,
                }, request=request
            )
        )

    formdata = await request.post_vars()
    if meta_in_db and database_name in datasette.databases:
        db_meta = json.loads(formdata["config"])
        update_db_metadata(datasette.databases[database_name], db_meta)
    else:
        update_live_config_db(database_name, table_name, formdata["config"])
    metadata = datasette.metadata()
    if database_name != "global":
        metadata = metadata["databases"][database_name]
    return Response.html(
        await datasette.render_template(
            "config_editor.html", {
                "database_name": database_name,
                "message": "Configuration updated successfully!",
                "status": "success",
                "configJSON": json.dumps(metadata),
                "submit_url": submit_url,
            }, request=request
        )
    )
