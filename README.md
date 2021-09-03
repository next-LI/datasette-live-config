# datasette-live-config

Datasette plugin allowing live editing of configuration (`metadata.json` and `--plugin-secret`) with no server restarts required.

## Installation

Installing via GitHub is the simplest.

    datasette install git+https://github.com/next-LI/datasette-live-config.git

That's it! You can specify a version, branch or SHA1 by adding an `@` symbol followed by the identifier, e.g.: `@v0.12.7`

## Development

Then basic python module install:

    python setup.py install

If you need to update the JS side of things (dynamic configuration editor or the metadata schema), run this instead:

    (cd config-ed && npm run build) && python setup.py install

## Usage

This plugin adds a "Configuration editor" entry to the menu, which leads to `/-/live-config` interface.

There's two ways to set configuration:
- Globally. These are stored in the `live_config.db` and control things like Datasette overall title, description and also lets you set metadata for DBs and tables.
- Individual DBs. These are stored inside of each database file in the `_metadata` table. These settings are specific to the DB and will allow people with permission only to a specific DB to set metadata for that DB.

It has one optional config using `metadata.yaml` to specify the directory where the `live_config.db` will be stored.

    plugins:
      datasette-live-config:
        db_path: /app/secrets/

Adding the above to your `metadata.yml` will make your configuration DB show up at `/app/secrets/live_config.db`.

By default, the `live_config.db` will be placed in the current working directory that Datasette is ran from (typically this is the same directory as the rest of your other DBs). If you have the `datasette-live-permissions` plugin, permissions will be added to hide this DB from view so that people won't try to edit it manually.

## Permissions

This plugin leverages Datasette's permissioning system to control who can set both global and DB-specific metadata.

For global settings, the `"live-config"` permission is used. This surfaces the "Configuration" link in the drop down menu.

For DB-specific settings the `("live-config", DB_NAME)` permission is used. This surfaces a database action (gear icon next to the DB name on the DB page) that will take users to the DB specific configuration page.

It is suggested you use the `datasette-live-permissions` plugin with this plugin as they are complementary.

## How it works

This plugin requires Datasette version 0.58 and above. It uses the `get_metadata` hook. The hook allows plugins to provide configuration to Datasette dynamically, which is what the `live-config` plugin is doing: reading configuration from a database, merging them together with any local configurations and providing it to Datasette.

This allows for a nearly fully dynamic system that you might expect with other web frameworks. The only limitation is importing new databases, but dynamic imports are supported by a separate, but related plugin that we also developed called [csv-importer](https://github.comom/next-LI/datasette-csv-importer).

The UI is built based on JSON schema of the metadata.json as defined in the Datasette documentation. It can be found in the `config-ed/src/schema.js` file.
