import type { RenderTarget } from "./render-target";

/** Renders into a real element on the page, sized by its CSS layout box. */
export function createBrowserRenderTarget(container: HTMLElement): RenderTarget {
  return {
    container,
    getBoundingBox() {
      const box = container.getBoundingClientRect();
      return { width: box.width, height: box.height };
    },
    setBackground(color: string) {
      container.style.background = color;
    }
  };
}
