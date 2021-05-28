import { h, Component } from "preact";
import Form from "react-jsonschema-form";
import {
  metaSchema, dbSchema, to_metadata_arrays, to_metadata_obj,
  db_to_metadata_arrays, db_to_metadata_obj,
} from "./schema.js";

/**
 * This pulls the JSON that we're storing as schema.json
 */
function getConfigData() {
  const rawJSON = document.getElementById('config-data').innerHTML;
  const keyValueData = JSON.parse(rawJSON);
  const arrayData = to_metadata_arrays(keyValueData);
  return arrayData;
}


let formRef, msgRef;

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      status: null,
      message: null,
    };
  }

  handleSubmit(metadata, csrftoken, submit_url) {
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
      this.setState({
        status: "success",
        message: "Configuration has been successfully updated!",
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
    return (
      <div id="update-message" ref={(el) => {msgRef = el;}}
          class={this.state.status}>
        {this.state.message}
      </div>
    );
  }

  getSchema(database_name) {
    if (!database_name || database_name === "global") {
      return metaSchema;
    }
    return dbSchema;
  }

  getMetadata(formData, database_name) {
    const copied_formData = Object.assign({},...data.formData);
    if (!database_name || database_name === "global") {
      return to_metadata_obj(copied_formData);
    }
    return db_to_metadata_arrays(copied_formData);
  }

  render(props) {
    const formData = getConfigData();
    return (
      <div class="editor-widget">
        { this.state.message && this.showMessage() }
        <Form schema={this.getSchema(props.database_name)} formData={formData}
          onSubmit={(data, e) => {
            const copied_formData = Object.assign({},...data.formData);
            let metadata = null;
            if (!database_name || database_name === "global") {
              metadata = to_metadata_obj(copied_formData);
            } else {
              metadata = db_to_metadata_obj(copied_formData);
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
