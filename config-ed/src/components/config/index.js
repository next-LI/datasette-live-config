import { h, Component } from "preact";
import Form from "react-jsonschema-form";
import {
  metaSchema, tableSchema, to_metadata_arrays, to_metadata_obj
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

  handleSubmit(metadata, csrftoken) {
    const data = new URLSearchParams({
      "csrftoken": csrftoken,
      "config": JSON.stringify(metadata),
    });
    fetch("/-/live-config", {
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

  render(props) {
    return (
      <div class="editor-widget">
        { this.state.message && this.showMessage() }
        <Form schema={metaSchema} formData={getConfigData()}
          /*
          onChange={(data, e) => {
          }}
          */
          onSubmit={(data, e) => {
            const metadata = to_metadata_obj(data.formData);
            this.handleSubmit(metadata, props.csrftoken);
          }}
          onError={(data, e) => {
            console.error("Datasette Config Error", data, e);
          }} ref={(form) => {formRef = form;}} />
        <button onClick={() => {formRef.submit()}}>{"Save"}</button>
      </div>
    );
  }
}
