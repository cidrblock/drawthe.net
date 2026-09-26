import "./monaco-environment";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import { configureMonacoYaml } from "monaco-yaml";
import "monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js";
import "../../node_modules/monaco-editor/min/vs/editor/editor.main.css";
import diagramSchema from "../editor/diagram.schema.json";

configureMonacoYaml(monaco, {
  validate: true,
  completion: true,
  schemas: [
    {
      uri: "inmemory://drawthe.net/diagram.schema.json",
      fileMatch: ["inmemory://drawthe.net/diagram.yaml"],
      schema: diagramSchema
    }
  ]
});

export interface YamlDiagnostic {
  severity: "error" | "warning" | "info";
  message: string;
  lineNumber?: number;
  column?: number;
}

export function createYamlEditor(
  container: HTMLElement,
  onDiagnosticsChanged: (diagnostics: YamlDiagnostic[]) => void
): monaco.editor.IStandaloneCodeEditor {
  const model = monaco.editor.createModel(
    "",
    "yaml",
    monaco.Uri.parse("inmemory://drawthe.net/diagram.yaml")
  );
  monaco.editor.onDidChangeMarkers((resources) => {
    if (resources.some((resource) => resource.toString() === model.uri.toString())) {
      onDiagnosticsChanged(
        monaco.editor.getModelMarkers({ resource: model.uri }).map((marker) => ({
          severity: marker.severity === monaco.MarkerSeverity.Error ? "error" :
            marker.severity === monaco.MarkerSeverity.Warning ? "warning" : "info",
          message: marker.message,
          lineNumber: marker.startLineNumber,
          column: marker.startColumn
        }))
      );
    }
  });
  queueMicrotask(() => onDiagnosticsChanged([]));
  return monaco.editor.create(container, {
    automaticLayout: true,
    minimap: { enabled: false },
    overviewRulerLanes: 0,
    model
  });
}