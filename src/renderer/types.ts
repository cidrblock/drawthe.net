// Shared types for the drawthe.net YAML -> SVG rendering engine.
// The DSL is intentionally loose (YAML documents merge free-form style attributes via
// anchors), so entity types describe the known/used fields but allow additional
// unknown properties to flow through untouched.
import type { ScaleBand } from "d3";

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface DiagramConfig {
  fill?: string;
  aspectRatio?: string;
  rows?: number;
  columns?: number;
  groupPadding?: number;
  gridLines?: boolean;
  gridPaddingInner?: number;
  iconTextRatio?: number;
  iconLabelFontSize?: number;
  connectionLabelFontSize?: number;
  margins?: Margins;
  // Computed during rendering.
  height?: number;
  width?: number;
  x?: number;
  y?: number;
  xBand?: ScaleBand<number>;
  yBand?: ScaleBand<number>;
  [key: string]: unknown;
}

export interface TitleConfig {
  text?: string;
  subText?: string;
  author?: string;
  company?: string;
  date?: string;
  version?: number | string;
  color?: string;
  stroke?: string;
  fill?: string;
  type?: "box" | "bar";
  heightPercentage?: number;
  logoUrl?: string;
  logoFill?: string;
  // Computed during rendering.
  height?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  width?: number;
  [key: string]: unknown;
}

export interface IconMetadata {
  url?: string;
  errorText?: string;
  [key: string]: unknown;
}

export interface IconEntity {
  x?: number | string;
  y?: number | string;
  w?: number;
  h?: number;
  xAlign?: "left" | "right" | "center";
  yAlign?: "top" | "center" | "bottom";
  textLocation?: string;
  text?: string;
  labelFontSize?: number;
  icon?: string;
  iconFamily?: string;
  iconUrl?: string;
  iconFill?: string;
  iconStroke?: string;
  iconStrokeWidth?: number | string;
  preserveWhite?: boolean;
  replaceWhite?: string;
  fill?: string;
  stroke?: string;
  color?: string;
  strokeDashArray?: string | number[];
  url?: string;
  metadata?: IconMetadata;
  // Computed during rendering.
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  centerX?: number;
  centerY?: number;
  rx?: number;
  ry?: number;
  padding?: number;
  iconPaddingX?: number;
  iconPaddingY?: number;
  fontSize?: number;
  textPosition?: TextPosition;
  [key: string]: unknown;
}

export interface NoteEntity {
  x?: number | string;
  y?: number | string;
  w?: number;
  h?: number;
  xAlign?: "left" | "right" | "center";
  yAlign?: "top" | "center" | "bottom";
  flexDirection?: string;
  text?: string;
  fill?: string;
  stroke?: string;
  color?: string;
  // Computed during rendering.
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  centerX?: number;
  centerY?: number;
  rx?: number;
  ry?: number;
  padding?: number;
  iconPaddingX?: number;
  iconPaddingY?: number;
  [key: string]: unknown;
}

export interface GroupEntity {
  name?: string;
  members: string[];
  padding?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
  fill?: string;
  stroke?: string;
  color?: string;
  strokeDashArray?: string | number[];
  strokeWidth?: number;
  textLocation?: string;
  /** Requested label size in px; shrunk if the label would not fit its side. */
  fontSize?: number;
  // Computed during rendering.
  frame?: boolean;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  label?: GroupLabel;
  [key: string]: unknown;
}

export interface GroupLabel {
  text: string;
  fontSize: number;
  x: number;
  y: number;
  rotate: number;
  textAnchor: "start" | "middle" | "end";
}

export interface ConnectionEntity {
  endpoints: [string, string];
  curve?: string;
  label?: string;
  labelFontSize?: number;
  labelPosition?: "start" | "middle" | "end";
  labels?: ConnectionLabel[];
  color?: string;
  stroke?: string;
  strokeDashArray?: string | number[];
  strokeWidth?: number;
  [key: string]: unknown;
}

export interface ConnectionLabel {
  text: string;
  fontSize?: number;
  position?: "start" | "middle" | "end";
}

export type IconMap = Record<string, IconEntity>;
export type NoteMap = Record<string, NoteEntity>;
export type GroupMap = Record<string, GroupEntity>;

export interface DiagramDocument {
  diagram?: DiagramConfig;
  title?: TitleConfig;
  icons?: IconMap;
  notes?: NoteMap;
  groups?: GroupMap;
  connections?: ConnectionEntity[];
  [key: string]: unknown;
}

export interface TextPosition {
  x: number;
  y: number;
  textAnchor: "start" | "middle" | "end";
  rotate: number;
}
