import { h, Component } from "preact";
import Form from "react-jsonschema-form";
import { metaSchema, tableSchema } from "./schema.js";
//import "./style.scss";

export default class App extends Component {
  render(props) {
    return (
      <div class="editor-widget">
        <h1 style={{ color: props.color }}>Configuration Options</h1>
        <Form schema={metaSchema}
          onChange={(data, e) => {
            console.log("Datasette Config Changed", data, e);
          }}
          onSubmit={(data, e) => {
            console.log("Datasette Config Submitted", data, e);
          }}
          onError={(data, e) => {
            console.log("Datasette Config Error", data, e);
          }} />
      </div>
    );
  }
}
