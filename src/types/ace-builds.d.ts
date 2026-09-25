// ace-builds ships types for the package root ("ace-builds") but not for its
// prebuilt submodule bundles used to avoid Vite/webpack worker-loading friction.
declare module "ace-builds/src-noconflict/ace" {
  import ace from "ace-builds";
  export default ace;
}
declare module "ace-builds/src-noconflict/mode-yaml";
