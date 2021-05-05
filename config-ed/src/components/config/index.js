import { h, Component } from "preact";
import Form from "react-jsonschema-form";
import {
  metaSchema, tableSchema, to_metadata_arrays, to_metadata_obj
} from "./schema.js";
//import "./style.scss";

/**
 * This pulls the JSON that we're storing as schema.json
 */
function getConfigData() {
  const rawJSON = document.getElementById('config-data').innerHTML;
  console.log("rawJSON", rawJSON)
  const keyValueData = JSON.parse(rawJSON);
  console.log("keyValueData", keyValueData);
  const arrayData = to_metadata_arrays(keyValueData);
  console.log("arrayData", arrayData);
  return arrayData;
}


function handleSubmit(metadata) {
  const data = new URLSearchParams({
    "csrftoken": "{{ csrftoken() }}",
    "config": JSON.stringify(metadata),
  });
  fetch("/-/live-config", {
    method: 'post',
    body: data,
  })
  .then((resp) => {
    console.log("window.resp", resp);
    window.resp = resp;
  }).catch((e) => console.error);
}


let formRef;

export default class App extends Component {
  render(props) {
    const formData = getConfigData();
    return (
      <div class="editor-widget">
        <Form schema={metaSchema} formData={formData}
          onChange={(data, e) => {
            console.log("Datasette Config Changed", data, e);
          }}
          onSubmit={(data, e) => {
            console.log("Datasette Config Submitted", data, e);
            const metadata = to_metadata_obj(data.formData);
            console.log("metadata", metadata);
            handleSubmit(metadata);
          }}
          onError={(data, e) => {
            console.log("Datasette Config Error", data, e);
          }} ref={(form) => {formRef = form;}} />
        <button onClick={() => {formRef.submit()}}>{"Save"}</button>
      </div>
    );
  }
}
