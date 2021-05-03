const unitSchema = {
  "type": "object",
  "properties": {
    /* We're gonna convert this one to a simple object key (string) => value (string) format */
    "_name": {
      "title": "Column name",
      "description": "Enter the column name to set unit for.",
      "type": "string",
    },
    "_value": {
      "title": "Unit",
      "description": "Enter a unit the values in the column should be displayed as. A full list of values can be foud here: https://github.com/hgrecco/pint/blob/master/pint/default_en.txt",
      "type": "string",
    }
  },
  //"required": ["_name", "_value"],
};

const querySchema = {
  "type": "object",
  "properties": {
    /* Any object with a _name and no _value key, gets turned into an object
     * where the _name is the parent key containing the object otherwise described
     * below. This is true for all the schema with the exception of unitSchema.
     **/
    "_name": {
      "title": "Name",
      "description": "Enter a descriptive name for this canned query.",
      "type": "string",
    },
    "sql": {
      "type": "string",
      "title": "Canned query SQL",
      "examples": [
        "select neighborhood, facet_cities.name, state\nfrom facetable\n  join facet_cities on facetable.city_id = facet_cities.id\nwhere neighborhood like '%' || :text || '%'\norder by neighborhood",
        "select  'fixtures' as database, * from  [fixtures].sqlite_master union select  'extra_database' as database, * from  [extra_database].sqlite_master",
      ],
    },
    "fragment": {
      "type": "string",
      "title": "Fragment string",
      "description": "Some plugins accept additional config via the URL hash, this sets the default hash 'fragment' to use",
    },
    "title": {
      "title": "Friendly name",
      "description": "Optional display name of canned query. This can be 'friendlier' than the query name above and can include quotes, spaces, etc.",
      "type": "string",
    },
    "description": {
      "title": "Description",
      "description": "Optional description of canned query",
      "type": "string",
    }
  },
  //"required": ["_name", "sql"],
};

const allowSchema = {
  "allow": {
    "type": "string",
    "description": "The JSON describing users with permission to this resource",
  },
  "allow_sql": {
    "type": "string",
    "description": "The JSON describing users with SQL-access permission to this resource",
  },
};

const tableSchema = {
  "type": "object",
  "title": "Table #{{idx}}",
  // "descriptions": "Table within this database to configure",
  "properties": {
    "_name": {
      "title": "Name",
      "description": "Enter the name of the table to configure",
      "type": "string",
    },
    "description_html": {
      "title": "Table description",
      "description": "Enter a description of the table to show users. This may contain HTML.",
      "type": "string",
    },
    "license": {
      "title": "license",
      "type": "string",
      "examples": [
        "CC BY 3.0 US", "Copyright Company Name. All rights reserved."
      ],
    },
    "license_url": {
      "title": "License URL",
      "description": "A URL to the full license terms, if applicable.",
      "type": "string",
      "examples": [
        "https://creativecommons.org/licenses/by/3.0/us/",
      ]
    },

    ...allowSchema,

    "hidden": {
      "title": "Hidden?",
      "description": "tables can be hidden using this option.",
      "type": "boolean",
      "default": false,
    },

    "label_column": {
      "title": "Label column",
      "description": "Enter the name of the column to use as the link to the individual record page. By default the first column, which is the CSV row number, will be used. Set this to override this default.",
      "type": "string",
    },

    "size": {
      "title": "Page size",
      "description": "How many table records to display per page.",
      "type": "number",
      "default": 10,
    },

    "sort": {
      "title": "Default sort column (ascending)",
      "type": "string",
    },
    "sort_desc": {
      "title": "Default sort column (descending)",
      "description": "Can't use with default ascending sort",
      "type": "string",
    },

    "sortable_columns": {
      "title": "Sortable columns",
      "description": "If used, any columns not in this list will not be sortable",
      "type": "array",
      "items": {
        "title": "Column name",
        "type": "string",
      },
      "default": [],
    },

    "facets": {
      "title": "Facets",
      "description": "List of columns to enable faceting on",
      "type": "array",
      "items": {
        "title": "Column name",
        "type": "string",
      }
    },

    "units": {
      "type": "array",
      "title": "Column units",
      "items": unitSchema
    },

    "queries": {
      "type": "array",
      "title": "Canned queries",
      "items": querySchema,
    }
  },
  //"required": ["_name"],
};

const schema = {
  "type": "object",
  "properties": {
    "title": {
      "title": "Home page title",
      "type": "string",
    },
    "description_html": {
      "title": "Home page description",
      "description": "Enter a description to show on the home page. This may contain HTML.",
      "type": "string",
    },
    ...allowSchema,
    
    "databases": {
      "title": "Databases",
      "description": "This lets you control database settings for tables, queries, units, and various display and analysis related options. If you don't see any databases, it's because no databases are currently configured. You add a database configuration by clicking the plus button.",
      "type": "array",
      "items": {
        "title": "Database #{{idx}}",
        // "description": "Database to configure",
        "type": "object",
        "properties": {
          "_name": {
            "title": "Name",
            "description": "Enter the name of a database to configure.",
            "type": "string",
          },
          "source": {
            "title": "Source",
            "description": "Where this data came from?",
            "type": "string",
          },
          "source_url": {
            "title": "Source URL",
            "description": "URL to info about source",
            "type": "string",
            "examples": ["https://example.tld"],
          },
          "description": {
            "title": "Database description",
            "description": "Enter a description of the database to show users. This may contain HTML.",
            "type": "string",
          },
          ...allowSchema,
          "tables": {
            "title": "Tables",
            "description": "Add or select a database table to configure",
            "type": "array",
            "items": tableSchema
          },
        },
        //"required": ["_name"],
      },
    },
  },
};

/**
 * Take a metadata that conforms to the above schema (which uses arrays
 * of objects for databases, tables, queries, and units, and turns them
 * into the datasette-expected key->value object notation so that it can
 * be used by Datasette internally. This should be called before we push
 * the config to the endpoint.
 */
function to_metadata_obj(data) {
  const metadata = {"databases": {}};

  /* Copy non databases keys over */
  Object.keys(data).forEach((key) => {
    if (key === "allow" || key === "allow_sql") {
      metadata[key] = JSON.parse(data[key]);
    }
    else if (key !== "databases") {
      metadata[key] = data[key];
    }
  });

  databases = data["databases"] || [];

  databases.forEach((db, index) => {
    const db_name = db["_name"];
    delete db["_name"];
    metadata["databases"][db_name] = db;

    const tables = db["tables"] || [];
    metadata["databases"][db_name]["tables"] = {};
    tables.forEach((table) => {
      const table_name = table["_name"];
      delete table["_name"];

      const queries = table["queries"] || [];
      table["queries"] = {};
      queries.forEach((query) => {
        query_name = query["_name"];
        table["queries"][query_name] = query;
      });

      const units = table["units"] || [];
      table["units"] = {};
      units.forEach((unit) => {
        table["units"][unit["_name"]] = unit["_value"];
      });
    });
  });
  return metadata;
}

/**
 * This is the opposite operation as to_metadata_obj. This takes
 * existing configuration data, as it's being used inside Datasette
 * (which is a key-value based data structure) and turns it into the
 * array-of-objects based representation required by
 * the schema validation/UI.
 */
function to_metadata_arrays(metadata) {
  console.log("DATASETTE KV METADATA", metadata)
  window.METADATA = metadata;
  const data = {"databases": []};

  /* Get non-databases keys */
  Object.keys(metadata).forEach((key) => {
    if (key === "allow" || key === "allow_sql") {
      data[key] = JSON.stringify(metadata[key]);
      return;
    }
    if (key !== "databases") {
      data[key] = metadata[key];
      return;
    }
  });

  /* Capture all databases to the array */
  Object.keys(metadata.databases).forEach((db_name) => {
    const db = metadata.databases[db_name];
    db["_name"] = db_name;

    const flat_tables = [];
    const tables = db["tables"] || {};
    console.log("tables", tables);
    Object.keys(tables).forEach((table_name) => {
      console.log("table_name", table_name);
      const table = tables[table_name];
      table["_name"] = table_name;

      const flat_queries = [];
      const queries = table["queries"] || {};
      Object.keys(queries).forEach((query_name) => {
        console.log("Converting query", query_name);
        const query = queries[query_name];
        query["_name"] = query_name;
        flat_queries.push(query);
      });
      table["queries"] = flat_queries;

      const flat_units = [];
      const units = table["units"] || {};
      Object.keys(units).forEach((unit_name) => {
        console.log("Converting unit", unit_name);
        flat_units.push({
          "_name": unit_name,
          "_value": units[unit_name],
        });
      });
      table["units"] = flat_units;

      flat_tables.push(table);
    });

    db["tables"] = flat_tables;
    console.log("Pushing db", db);
    data["databases"].push(db);
  });

  return data;
}

window.NEXTLI_DATASETTE_CONFIG = {
  schema, tableSchema, querySchema, unitSchema, to_metadata_obj, to_metadata_arrays
};