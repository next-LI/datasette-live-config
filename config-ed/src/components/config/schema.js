export const unitSchema = {
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

export const querySchema = {
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
    "title": "Allow access only to these users",
    "description": "By default, databases are readable by everyone. Use this to grant access to only a specific set of users. Enter the JSON describing users with permission to this resource as defined in the datasette documentation.",
  },
  "allow_sql": {
    "type": "string",
    "title": "Allow SQL access only to these users",
    "description": "This is similar to the above field, but this controls the ability of users to include this database in a cross-database SQL query. (This field also expects JSON.)",
  },
};

const pluginsSchema = {
  "plugins": {
    "type": "string",
    "title": "Plugin configuration",
    "description": "JSON representing all the plugin configs. Use this with caution!",
  },
}

export const tableSchema = {
  "type": "object",
  "title": "Table",
  // "descriptions": "Table within this database to configure",
  "properties": {
    "_name": {
      "title": "Name",
      "description": "Enter the name of the table to configure",
      "type": "string",
    },
    "title": {
      "title": "Title",
      "description": "An alternate name to show for this table.",
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
      // "default": [],
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

export const dbSchema = {
  "title": "Database",
  // "description": "Database to configure",
  "type": "object",
  "properties": {
    "_name": {
      "title": "Name",
      "description": "Enter the name of a database to configure.",
      "type": "string",
    },
    "title": {
      "title": "Title",
      "description": "An alternate name to show for this database.",
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
};

export const metaSchema = {
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
    ...pluginsSchema,

    "databases": {
      "title": "Databases",
      "description": "This lets you control database settings for tables, queries, units, and various display and analysis related options. If you don't see any databases, it's because no databases are currently configured. You add a database configuration by clicking the plus button.",
      "type": "array",
      "items": dbSchema,
    },
  },
};

export function db_to_metadata_obj(db) {
  delete db["_name"];
  console.log('---')
  console.log('this is form to db')

  Object.keys(db || {}).forEach((key) => {
    if (key === "allow" || key === "allow_sql") {
      if (!db[key]) {
        delete db[key];
      } else {
        try {
          db[key] = JSON.parse(db[key]);
        } catch(e) {
          console.error("Error on key:", key, "parsing data:", db[key]); 
        }
      }
    }
  });

  const kvtables = {};
  const tables = db["tables"] || [];
  tables.forEach((table) => {
    const table_name = table["_name"];
    delete table["_name"];
    kvtables[table_name] = table;

    const queries = table["queries"] || {};
    console.log('276:', table[queries])
    Object.keys(queries).forEach((query_name) => {
      console.log('278', queries)
      // const query_name = query["_name"];
      if (!table["queries"]) table["queries"] = {};
      console.log('281', query_name);
      // table["queries"][query_name] = query;
      Object.assign(table['queries'], {query_name:queries[query_name]})
    });
    // queries.forEach((query) => {
    //   let query_name = query["_name"];
    //   if (!table["queries"]) table["queries"] = {};
    //   console.log(query_name);
    //   // table["queries"][query_name] = query;
    //   Object.assign(table['queries'], {query_name:query})
    //   console.log("this should be k,v")
    //   console.log(table)
    // });

    const units = table["units"] || [];
    units.forEach((unit) => {
      if (!table["units"]) table["units"] = {};
      table["units"][unit["_name"]] = unit["_value"];
    });

    // attach the table via key->value
    if (!db["tables"]) {
      db["tables"] = {};
    }
  });
  if (Object.keys(kvtables).length) {
    db["tables"] = kvtables;
  }
  console.log(db)
  console.log('---')
  return db;
}

/**
 * Take a metadata that conforms to the above schema (which uses arrays
 * of objects for databases, tables, queries, and units, and turns them
 * into the datasette-expected key->value object notation so that it can
 * be used by Datasette internally. This should be called before we push
 * the config to the endpoint.
 */
export function to_metadata_obj(data) {
  /* clone the object, we're going to mutate it */
  const metadata = Object.assign([], data);

  /**
   * Copy non databases keys over
   * At some point, maybe anything not inside the schema as a specific
   * type should go across as stringified?
   */
  Object.keys(data || {}).forEach((key) => {
    if (key === "allow" || key === "allow_sql" || key === "plugins") {
      if (!data[key]) {
        delete metadata[key];
      } else {
        try {
          metadata[key] = JSON.parse(data[key]);
        } catch(e) {
          console.error("Error on key:", key, "parsing data:", data[key]); 
        }
      }
    }
    else if (key === "databases") {
      metadata["databases"] = {};
    }
    else {
      metadata[key] = data[key];
    }
  });

  /* Iterate over databases converting inner objects */
  (data["databases"] || []).forEach((db, index) => {
    const db_name = db["_name"];
    db_to_metadata_obj(db);
    metadata["databases"][db_name] = db;
  });
  return metadata;
}


export function db_to_metadata_arrays(db) {
  const flat_tables = [];

  Object.keys(db || {}).forEach((key) => {
    if (key === "allow" || key === "allow_sql") {
      db[key] = JSON.stringify(db[key]);
      return;
    }
  });

  const tables = db["tables"] || {};
  console.log('this is getting the data from the db to config')
  console.log('***')
  console.log(db)
  Object.keys(tables).forEach((table_name) => {
    const table = tables[table_name];
    table["_name"] = table_name;

    const flat_queries = [];
    const queries = table["queries"] || {};
    Object.keys(queries).forEach((query_name) => {
      console.log(query_name)
      const query = queries[query_name];
      query["_name"] = query_name;
      flat_queries.push(query);
    });
    if (flat_queries.length) {
      table["queries"] = flat_queries;
    }

    const flat_units = [];
    const units = table["units"] || {};
    Object.keys(units).forEach((unit_name) => {
      flat_units.push({
        "_name": unit_name,
        "_value": units[unit_name],
      });
    });
    if (flat_units.length) {
      table["units"] = flat_units;
    }

    flat_tables.push(table);
  });

  if (flat_tables.length) {
    db["tables"] = flat_tables;
  }
  console.log('***')
  return db;
}

/**
 * This is the opposite operation as to_metadata_obj. This takes
 * existing configuration data, as it's being used inside Datasette
 * (which is a key-value based data structure) and turns it into the
 * array-of-objects based representation required by
 * the schema validation/UI.
 */
export function to_metadata_arrays(metadata) {
  const data = {"databases": []};

  /* Get non-databases keys */
  Object.keys(metadata || {}).forEach((key) => {
    if (key === "allow" || key === "allow_sql" || key === "plugins") {
      data[key] = JSON.stringify(metadata[key]);
      return;
    }
    else if (key !== "databases") {
      data[key] = metadata[key];
      return;
    }
  });

  /* Capture all databases to the array */
  Object.keys(metadata.databases || {}).forEach((db_name) => {
    const db = metadata.databases[db_name];
    db["_name"] = db_name;
    db_to_metadata_arrays(db);
    data["databases"].push(db);
  });

  return data;
}


/**
 * Modified version of to_metadata_arrays for canned_queries
 */
export function array_to_obj(data) {
  const metadata = {}
  /* clone the object, we're going to mutate it */
  Object.entries(data || {}).forEach(([key,value])=>{
    metadata[value["_name"]] = value;
  });

  return metadata;
}

export function obj_to_array(data) {
  const metadata = Object.entries(data).map((e) => ( e[1] ));

  return metadata
}
