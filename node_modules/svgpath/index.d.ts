declare class SvgPath {
  constructor(path);
  abs(): SvgPath;
  scale(sx: number, sy?: number): SvgPath;
  translate(x: number, y?: number): SvgPath;
  rotate(angle: number, rx?: number, ry?: number): SvgPath;
  skewX(degrees: number): SvgPath;
  skewY(degrees: number): SvgPath;
  matrix(m1: number, m2: number, m3: number, m4: number, m5: number, m6: number): SvgPath;
  transform(string: String): SvgPath;
  unshort(): SvgPath;
  unarc(): SvgPath;
  toString(): String;
  round(precision: number): SvgPath;
  iterate(iterator: (segment, index: number, x: number, y: number) => void, keepLazyStack?: boolean): SvgPath;
}

declare module "svgpath" {
  export = SvgPath;
}
