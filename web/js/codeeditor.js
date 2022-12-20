import { Component, html, Tag } from "./componentforge.js";

export default class CodeEditor extends Component {
  editor = null;
  constructor() {
    const _props = {
      value: `
      //Type your code here....`,
      language: "javascript",
      theme: "vs-dark",

      lineNumbers: "on",
      roundedSelection: true,
      scrollBeyondLastLine: false,
      readOnly: false,
    };
    super(true, _props);
  }

  get Code() {
    return this.editor.getValue() || "";
  }

  ComponentDidMount() {
    this.Init();
  }

  ComponentDidReceiedProps(attribute, oldValue, attrValue) {
    console.warn(attribute, attrValue);
    if (attribute === "value") this.editor.setValue(attrValue);
    else
      this.editor.updateOptions({
        attribute: attrValue,
      });
  }

  async Init() {
    await this.loadScript(
      "loader",
      "https://unpkg.com/monaco-editor@latest/min/vs/loader.js"
    );
    require.config({
      paths: { vs: "https://unpkg.com/monaco-editor@latest/min/vs" },
    });

    // Before loading vs/editor/editor.main, define a global MonacoEnvironment that overwrites
    // the default worker url location (used when creating WebWorkers). The problem here is that
    // HTML5 does not allow cross-domain web workers, so we need to proxy the instantiation of
    // a web worker through a same-domain script
    window.MonacoEnvironment = {
      getWorkerUrl: function (workerId, label) {
        return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
         self.MonacoEnvironment = {
           baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
         };
         importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js');`)}`;
      },
    };

    require(["vs/editor/editor.main"], () => {
      this.editor = monaco.editor.create(
        this.root.querySelector(".monaco-editor-container"),
        {
          ...this.props
        }
      );
    });
  }

  Template() {
    return html`
      <div>
        <div class="monaco-editor-container" style="height:600px">
          code editor
        </div>
      </div>
    `;
  }

  Style() {
    return html` <link
        rel="stylesheet"
        href="https://microsoft.github.io/monaco-editor/node_modules/monaco-editor/min/vs/editor/editor.main.css"
      />
      <style>
        .monaco-editor-container {
          height: "1000px";
        }
      </style>`;
  }
}

Tag("code-editor", CodeEditor);
