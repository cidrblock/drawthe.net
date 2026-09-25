import type { DiagramDocument } from "../renderer/types";

declare global {
  interface Window {
    /** The currently-parsed diagram doc, shared with the fullscreen popup window (`window.opener.design`). */
    design?: DiagramDocument;
  }
}

export {};
