# datasette-config-editor

Datasette plugin allowing live (no server restart necessary) editing of configuration.

## Installation

    python setup.py install

## Usage

This plugin adds a "Configuration editor" entry to the menu, which leads to `/-/config-editor` interface.

*NOTE:* This plugin requires a forked version of Datasette containing the live-configuration hook patch: [next-LI/datasette](https://github.com/next-LI/datasette).
