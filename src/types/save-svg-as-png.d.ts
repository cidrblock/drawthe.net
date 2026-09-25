declare module "save-svg-as-png" {
  export interface SaveSvgAsPngOptions {
    scale?: number;
    backgroundColor?: string;
    [key: string]: unknown;
  }
  export function saveSvgAsPng(svg: SVGElement, fileName: string, options?: SaveSvgAsPngOptions): void;
  export function svgAsPngUri(svg: SVGElement, options?: SaveSvgAsPngOptions): Promise<string>;
}
