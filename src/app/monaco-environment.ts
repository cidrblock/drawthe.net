import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import YamlWorker from "./yaml.worker?worker";

type MonacoWorkerEnvironment = typeof globalThis & {
  MonacoEnvironment: {
    getWorker: (_workerId: string, label: string) => Worker;
  };
};

(globalThis as MonacoWorkerEnvironment).MonacoEnvironment = {
  getWorker(_workerId, label) {
    switch (label) {
      case "yaml":
        return new YamlWorker();
      case "editorWorkerService":
        return new EditorWorker();
      default:
        throw new Error(`Unknown Monaco worker label: ${label}`);
    }
  }
};