# datasette-live-config

Datasette plugin allowing live editing of configuration (`metadata.json` and `--plugin-secret`) with no server restarts required.

## Installation

    python setup.py install

## Usage

This plugin adds a "Configuration editor" entry to the menu, which leads to `/-/live-config` interface.

## How it works (IMPORTANT)

This plugin requires a [forked version](https://github.com/next-LI/datasette) of Datasette containing a new hook that doesn't exist upstream (yet!):


    get_metadata(
        datasette, key, database, table, fallback
    )

The hook allows plugins to provide configuration to Datasette dynamically, which is what the `live-config` plugin is doing: reading configuration from a database, merging them together with any local configurations and providing it to Datasette.

This allows for a nearly fully dynamic system that you might expect with other web frameworks. The only limitation is importing new databases, but dynamic imports are supported by a separate, but related plugin that we also developed called [csv-importer](https://github.comom/next-LI/datasette-csv-importer).
