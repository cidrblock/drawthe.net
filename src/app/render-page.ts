import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/app.css";
import "../styles/notes.css";
import { load } from "js-yaml";
import { draw } from "../renderer/draw";
import { createBrowserIconLoader } from "../renderer/icon-loader-browser";
import { createBrowserRenderTarget } from "../renderer/render-target-browser";
import type { DiagramDocument } from "../renderer/types";

const DB_URL = "https://syg5y0qnyf.execute-api.us-west-2.amazonaws.com/dev/";

const svgContainer = document.getElementById("svg") as HTMLElement;
const target = createBrowserRenderTarget(svgContainer);
const iconLoader = createBrowserIconLoader();

const params = new URLSearchParams(window.location.search);
const docParam = params.get("doc");
const keyParam = params.get("key");

let url: string;
if (docParam) {
  url = `./examples/${docParam}.yaml`;
} else if (keyParam) {
  url = DB_URL + keyParam;
} else {
  throw new Error("Missing required query parameter: doc or key");
}

fetch(url)
  .then((response) => response.text())
  .then((text) => {
    const design = (load(text) || {}) as DiagramDocument;
    draw(design, { target, iconLoader });
    if (design.title?.text) {
      document.title = `drawthe.net: ${design.title.text}`;
    }
  });
