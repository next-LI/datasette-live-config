import { h, Component } from "preact";
import Form from "react-jsonschema-form";
import {
  metaSchema, dbSchema, to_metadata_arrays, to_metadata_obj,
  db_to_metadata_arrays, db_to_metadata_obj,
} from "./schema.js";
import {
  metaUiSchema, dbUiSchema
} from "./uiSchema.js";


/**
 * This pulls the JSON that we're storing as schema.json
 */
function getFormData(database_name) {
  const rawJSON = document.getElementById('config-data').innerHTML;
  // This is key-value, as expected by datasette
  if (!database_name || database_name === "global") {
    return to_metadata_arrays(JSON.parse(rawJSON))
  }
  const db_flat = db_to_metadata_arrays(JSON.parse(rawJSON))
  db_flat["_name"] = database_name;
  return db_flat;
}


/**
 * Gets the datasette "base_url" setting, which is actually
 * not a URL, but a path prefix, e.g., /datasette
 */
function get_base_url() {
  // we can set it via a script in the template...
  if (window.DATASETTE_BASE_URL) {
    return window.DATASETTE_BASE_URL;
  }
  // we can pull it from the URL, by assuming the first
  // path part should be the DB name, live_permissions
  const parts = window.location.pathname.split("/")
  // no path prefix, return blank not a slash
  if (parts[0] == '-') {
    return '';
  }
  let already_seen = false;
  const prefix = parts.map((part) => {
    if (already_seen || (part === '-')) {
      already_seen = true;
      return null;
    }
    return part;
  }).filter(x=>x).join("/");
  if (!prefix || !prefix.length) {
    return '';
  }
  return `/${prefix}`;
}


let formRef, msgRef;

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      status: null,
      message: null,
      database_name: null,
    };
  }

  handleSubmit(metadata, csrftoken, submit_url, database_name) {
    const metadataString = JSON.stringify(metadata);
    const data = new URLSearchParams({
      "csrftoken": csrftoken,
      "config": metadataString,
    });
    document.getElementById('config-data').innerHTML = metadataString;
    fetch(submit_url, {
      method: 'post',
      body: data,
    })
    .then((resp) => {
      const ok = resp.status === 200;
      this.setState({
        status: ok ? "success" : "failure",
        message: ok ? "Configuration has been successfully updated!" : `Failure: ${resp.statusText}`,
        database_name: ok ? database_name : null,
      });
      setTimeout(() => {
        this.setState({
          status: null,
          message: null,
        });
      }, 5000);
    }).catch((e) => console.error);
  }

  showMessage() {
    setTimeout(() => {
      /* Scroll to top of page where info box is */
      window.scroll({ top: 0, left: 0, behavior: "smooth"});
    }, 250);
    const base_url = get_base_url();
    let goMsg = `Go to ${this.state.database_name} →`;
    let goUrl = `${base_url}/${this.state.database_name}`;
    if (this.state.database_name === "global") {
      goMsg = `Go to the home page →`;
      goUrl = `${base_url}/`;
    }
    return (
      <div id="update-message" ref={(el) => {msgRef = el;}}
          class={this.state.status}>
        {this.state.message}
        {this.state.database_name &&
          <p>
            <a href={goUrl}>{ goMsg }</a>
          </p>
        }
      </div>
    );
  }

  getSchema(database_name) {
    if (!database_name || database_name === "global") {
      return metaSchema;
    }
    return dbSchema;
  }

  getUiSchema(database_name) {
    if (!database_name || database_name === "global") {
      return metaUiSchema;
    }
    return dbUiSchema;
  }

  render(props) {
    const formData = getFormData(props.database_name);
    return (
      <div class="editor-widget">
        { this.state.message && this.showMessage() }
        <Form schema={this.getSchema(props.database_name)}
          uiSchema={this.getUiSchema(props.database_name)}
          formData={formData}
          onSubmit={(data, e) => {
            const copied_formData = Object.assign({},...data.formData);
            let metadata = null;
            if (!props.database_name || props.database_name === "global") {
              metadata = to_metadata_obj(copied_formData);
            } else {
              metadata = db_to_metadata_obj(copied_formData);
              // Name chaning is not supported currently
              delete metadata["_name"];
            }
            this.handleSubmit(metadata, props.csrftoken, props.submit_url, props.database_name);
          }}
          onError={(data, e) => {
            console.error("Datasette Config Error", data, e);
          }} ref={(form) => {formRef = form;}}
        >
          <div>
            <input type="submit" value="Save" />
          </div>
        </Form>
      </div>
    );
  }
}
