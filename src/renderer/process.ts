import type { ScaleBand } from "d3";
import type {
  ConnectionEntity,
  DiagramConfig,
  GroupEntity,
  GroupLabel,
  GroupMap,
  IconEntity,
  IconMap,
  NoteEntity,
  NoteMap,
  TextPosition
} from "./types";

/** Positioning fields shared by icons and notes, computed by {@link processEntities}. */
interface Positioned {
  x?: number | string;
  y?: number | string;
  w?: number;
  h?: number;
  xAlign?: string;
  yAlign?: string;
  textLocation?: string;
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

/**
 * Resolves each entity's grid coordinates (including relative `+N`/`-N` offsets
 * from the previous entity) into pixel geometry using the diagram's bands.
 */
export function processEntities<T extends Positioned>(
  diagram: DiagramConfig,
  entities: Record<string, T>
): Record<string, T> {
  const defaults = { xAlign: "left", yAlign: "top", textLocation: "bottomMiddle" };
  const xBand = diagram.xBand as ScaleBand<number>;
  const yBand = diagram.yBand as ScaleBand<number>;
  let previous: Positioned = {};

  for (const key of Object.keys(entities)) {
    const entity: Positioned = Object.assign({}, defaults, entities[key]);
    entities[key] = entity as T;
    entity.w = entity.w || 1;
    entity.h = entity.h || 1;

    entity.x = resolveAxis(entity.x, previous.x);
    entity.x1 = xBand(entity.x as number) ?? 0;

    entity.y = resolveAxis(entity.y, previous.y);
    entity.y1 = yBand(entity.y as number) ?? 0;

    entity.width = xBand.bandwidth() + ((entity.w - 1) * xBand.step());
    entity.height = yBand.bandwidth() + ((entity.h - 1) * yBand.step());
    entity.x2 = entity.x1 + entity.width;
    entity.y2 = entity.y1 + entity.height;
    entity.centerX = entity.x1 + entity.width / 2;
    entity.centerY = entity.y1 + entity.height / 2;
    entity.rx = xBand.bandwidth() * 0.05;
    entity.ry = yBand.bandwidth() * 0.05;
    entity.padding = Math.min(yBand.bandwidth() * 0.05, xBand.bandwidth() * 0.05);
    entity.iconPaddingX = 0.05;
    entity.iconPaddingY = 0.05;

    previous = entity;
  }
  return entities;
}

/** Resolves an axis value that may be absolute, `+N`/`-N` relative to the previous entity, or omitted. */
function resolveAxis(value: number | string | undefined, previous: number | string | undefined): number {
  if (value === undefined) {
    return Number(previous);
  }
  const str = value.toString();
  if (str.startsWith("+")) {
    return parseInt(String(previous), 10) + parseInt(str.split("+")[1], 10);
  }
  if (str.startsWith("-")) {
    return parseInt(String(previous), 10) - parseInt(str.split("-")[1], 10);
  }
  return Number(value);
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

interface DiveResult {
  members: string[];
  depth: number;
}

function diveOne(entry: string, groups: GroupMap, depth: number): DiveResult {
  const answer: string[] = [];
  const group = groups[entry];
  if (group) {
    for (let i = 0; i < group.members.length; i++) {
      if (groups[group.members[i]]) {
        const result = diveOne(group.members[i], groups, depth);
        answer.push(...result.members);
        depth = result.depth;
      } else {
        answer.push(group.members[i]);
        if (i === 0) {
          depth += 1;
        }
      }
    }
  } else {
    answer.push(entry);
  }
  return { members: answer, depth };
}

function dive(connection: ConnectionEntity, groups: GroupMap): ConnectionEntity[] {
  const additionalConnections: ConnectionEntity[] = [];
  const endpoints = connection.endpoints.map((device) => device.split(":")[0]);
  const labels = connection.endpoints.map((device) => device.split(":")[1]);
  const starters = groups[endpoints[0]] ? diveOne(endpoints[0], groups, 1).members : [endpoints[0]];
  const enders = groups[endpoints[1]] ? diveOne(endpoints[1], groups, 1).members : [endpoints[1]];

  starters.forEach((starter) => {
    enders.forEach((ender) => {
      const c1 = `${starter}:${labels[0] || ""}`;
      const c2 = `${ender}:${labels[1] || ""}`;
      const expanded = clone(connection);
      expanded.endpoints = [c1, c2];
      additionalConnections.push(expanded);
    });
  });
  return additionalConnections;
}

/** Expands any connection endpoints that reference a group into one connection per member. */
export function processConnections(
  connections: ConnectionEntity[],
  groups: GroupMap
): ConnectionEntity[] {
  let additionalConnections: ConnectionEntity[] = [];
  for (let i = connections.length - 1; i >= 0; i--) {
    const endpoints = connections[i].endpoints.map((device) => device.split(":")[0]);
    if (groups[endpoints[0]] || groups[endpoints[1]]) {
      additionalConnections = additionalConnections.concat(dive(connections[i], groups));
      connections.splice(i, 1);
    }
  }
  return connections.concat(additionalConnections);
}

type Side = "top" | "right" | "bottom" | "left";
type Sides = Record<Side, number>;

export interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Label band thickness as a multiple of the font size (a line box with a quarter-em clearance each side). */
const LABEL_BAND_RATIO = 1.5;
/** Conservative average glyph advance for sans-serif text, as a multiple of the font size. */
const CHAR_WIDTH_RATIO = 0.6;

const LABEL_ANCHORS: Record<string, { side?: Side; along: "start" | "middle" | "end" }> = {
  topLeft: { side: "top", along: "start" },
  topMiddle: { side: "top", along: "middle" },
  topRight: { side: "top", along: "end" },
  bottomLeft: { side: "bottom", along: "start" },
  bottomMiddle: { side: "bottom", along: "middle" },
  bottomRight: { side: "bottom", along: "end" },
  leftTop: { side: "left", along: "start" },
  leftMiddle: { side: "left", along: "middle" },
  leftBottom: { side: "left", along: "end" },
  rightTop: { side: "right", along: "start" },
  rightMiddle: { side: "right", along: "middle" },
  rightBottom: { side: "right", along: "end" },
  center: { along: "middle" }
};

function sideValues(group: GroupEntity, prefix: "padding" | "margin", fallback: number, unit: number): Sides {
  const all = (group[prefix] as number | undefined) ?? fallback;
  const get = (side: Side): number =>
    ((group[`${prefix}${side[0].toUpperCase()}${side.slice(1)}`] as number | undefined) ?? all) * unit;
  return { top: get("top"), right: get("right"), bottom: get("bottom"), left: get("left") };
}

/** Padding and margin unit: the smaller grid gap, so equal values are equal in pixels on both axes. */
function spacingUnit(diagram: DiagramConfig): number {
  const xBand = diagram.xBand as ScaleBand<number>;
  const yBand = diagram.yBand as ScaleBand<number>;
  return Math.min(xBand.step() - xBand.bandwidth(), yBand.step() - yBand.bandwidth());
}

function union(boxes: Box[]): Box {
  return {
    x1: Math.min(...boxes.map((box) => box.x1)),
    y1: Math.min(...boxes.map((box) => box.y1)),
    x2: Math.max(...boxes.map((box) => box.x2)),
    y2: Math.max(...boxes.map((box) => box.y2))
  };
}

/** The group's frame expanded by its margins; the space a parent must reserve for it. */
export function marginBox(group: GroupEntity, diagram: DiagramConfig): Box {
  const margin = sideValues(group, "margin", 0, spacingUnit(diagram));
  return {
    x1: (group.x1 as number) - margin.left,
    y1: (group.y1 as number) - margin.top,
    x2: (group.x2 as number) + margin.right,
    y2: (group.y2 as number) + margin.bottom
  };
}

/**
 * Lays out groups with a box model, children before parents:
 * content box (member icons + child margin boxes) -> padding -> frame.
 * The label lives in the padding band on its side; that band grows to fit
 * the label, and the font shrinks so the label never exceeds its side.
 * Groups with the same members and padding share one frame (e.g. one box
 * labelled in several places), so the layout runs twice to agree on it.
 */
export function processGroups(groups: GroupMap, diagram: DiagramConfig, icons: IconMap): GroupMap {
  const yBand = diagram.yBand as ScaleBand<number>;
  const unit = spacingUnit(diagram);
  // same scale as icon labels (icons.ts caps text at half the cell height * iconTextRatio)
  const defaultFontSize = (yBand.bandwidth() * ((diagram.iconTextRatio as number) ?? 0.33)) / 2;
  const shared = new Map<string, Sides>();
  let done = new Set<string>();
  const visiting = new Set<string>();

  const layout = (key: string): void => {
    const group = groups[key];
    if (done.has(key) || visiting.has(key)) {
      return;
    }
    visiting.add(key);
    const children = group.members.filter((member) => groups[member] && member !== key);
    children.forEach(layout);
    visiting.delete(key);
    done.add(key);

    const boxes: Box[] = [
      ...group.members
        .filter((member) => icons[member])
        .map((member) => icons[member] as Box),
      ...children.filter((child) => groups[child].frame).map((child) => marginBox(groups[child], diagram))
    ];
    if (boxes.length === 0) {
      group.frame = false;
      return;
    }
    const content = union(boxes);
    const pad = sideValues(group, "padding", (diagram.groupPadding as number) ?? 0.33, unit);
    const basePad = { ...pad };
    const name = group.name === undefined || group.name === null || group.color === "none" ? "" : String(group.name);
    const anchor = LABEL_ANCHORS[group.textLocation || "topLeft"] || LABEL_ANCHORS.topLeft;
    const vertical = anchor.side === "left" || anchor.side === "right";

    let fontSize = 0;
    if (name) {
      const sideLength = vertical
        ? content.y2 - content.y1 + pad.top + pad.bottom
        : content.x2 - content.x1 + pad.left + pad.right;
      // label length (chars * advance) plus half-em insets at both ends must fit the side
      const fitted = sideLength / (name.length * CHAR_WIDTH_RATIO + 1);
      fontSize = Math.min((group.fontSize as number | undefined) ?? defaultFontSize, fitted);
      if (anchor.side) {
        pad[anchor.side] = Math.max(pad[anchor.side], fontSize * LABEL_BAND_RATIO);
      }
    }

    const shareKey = `${JSON.stringify([...group.members].sort())}|${JSON.stringify(basePad)}`;
    const agreed = shared.get(shareKey);
    for (const side of ["top", "right", "bottom", "left"] as const) {
      pad[side] = Math.max(pad[side], agreed?.[side] ?? 0);
    }
    shared.set(shareKey, { ...pad });

    const frame: Box = {
      x1: content.x1 - pad.left,
      y1: content.y1 - pad.top,
      x2: content.x2 + pad.right,
      y2: content.y2 + pad.bottom
    };
    Object.assign(group, frame, { width: frame.x2 - frame.x1, height: frame.y2 - frame.y1, frame: true });
    group.label = name ? { text: name, fontSize, ...labelPosition(frame, pad, anchor, fontSize) } : undefined;
  };

  for (let pass = 0; pass < 2; pass++) {
    done = new Set<string>();
    Object.keys(groups).forEach(layout);
  }
  return groups;
}

function labelPosition(
  frame: Box,
  pad: Sides,
  anchor: { side?: Side; along: "start" | "middle" | "end" },
  fontSize: number
): Omit<GroupLabel, "text" | "fontSize"> {
  const inset = fontSize / 2;
  const centerX = (frame.x1 + frame.x2) / 2;
  const centerY = (frame.y1 + frame.y2) / 2;
  const horizontal = { start: frame.x1 + inset, middle: centerX, end: frame.x2 - inset }[anchor.along];
  const textAnchor = anchor.along;
  switch (anchor.side) {
    case "top":
      return { x: horizontal, y: frame.y1 + pad.top / 2, rotate: 0, textAnchor };
    case "bottom":
      return { x: horizontal, y: frame.y2 - pad.bottom / 2, rotate: 0, textAnchor };
    case "left": {
      // rotated -90: text reads upward, so "start" sits at the bottom
      const y = { start: frame.y1 + inset, middle: centerY, end: frame.y2 - inset }[anchor.along];
      const flipped = { start: "end", middle: "middle", end: "start" } as const;
      return { x: frame.x1 + pad.left / 2, y, rotate: -90, textAnchor: flipped[anchor.along] };
    }
    case "right": {
      const y = { start: frame.y1 + inset, middle: centerY, end: frame.y2 - inset }[anchor.along];
      return { x: frame.x2 - pad.right / 2, y, rotate: 90, textAnchor };
    }
    default:
      return { x: centerX, y: centerY, rotate: 0, textAnchor: "middle" };
  }
}

/** True when a group draws anything: a label, a fill, or a stroke. */
export function isVisibleGroup(group: GroupEntity): boolean {
  return Boolean(group.frame) && (Boolean(group.label) || group.fill !== "none" || group.stroke !== "none");
}

/** Reports visible groups whose frames partially overlap (neither nested, containing the other, nor sharing members). */
export function findGroupCollisions(groups: GroupMap, icons: IconMap): string[] {
  const contents = new Map<string, { groups: Set<string>; icons: Set<string> }>();
  const collect = (key: string, seen: Set<string>, into: { groups: Set<string>; icons: Set<string> }): void => {
    for (const member of groups[key].members) {
      if (groups[member] && !seen.has(member)) {
        seen.add(member);
        into.groups.add(member);
        collect(member, seen, into);
      } else if (icons[member]) {
        into.icons.add(member);
      }
    }
  };
  for (const key of Object.keys(groups)) {
    const into = { groups: new Set<string>(), icons: new Set<string>() };
    collect(key, new Set([key]), into);
    contents.set(key, into);
  }

  const keys = Object.keys(groups).filter((key) => isVisibleGroup(groups[key]));
  const warnings: string[] = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const [a, b] = [keys[i], keys[j]];
      const [ca, cb] = [contents.get(a)!, contents.get(b)!];
      if (ca.groups.has(b) || cb.groups.has(a) || [...ca.icons].some((icon) => cb.icons.has(icon))) {
        continue;
      }
      const [ga, gb] = [groups[a] as Box, groups[b] as Box];
      // corner-defined groups legitimately enclose others without listing them
      const contains = (outer: Box, inner: Box): boolean =>
        outer.x1 <= inner.x1 && outer.y1 <= inner.y1 && outer.x2 >= inner.x2 && outer.y2 >= inner.y2;
      if (contains(ga, gb) || contains(gb, ga)) {
        continue;
      }
      const overlapX = Math.min(ga.x2, gb.x2) - Math.max(ga.x1, gb.x1);
      const overlapY = Math.min(ga.y2, gb.y2) - Math.max(ga.y1, gb.y1);
      if (overlapX > 0.5 && overlapY > 0.5) {
        warnings.push(`Groups "${groups[a].name || a}" and "${groups[b].name || b}" overlap; move their members apart.`);
      }
    }
  }
  return warnings;
}

export function textPositions(x1: number, y1: number, x2: number, y2: number, fontSize: number): Record<string, TextPosition> {
  return {
    topLeft: { x: x1 + fontSize / 4, y: y1 + fontSize / 2, textAnchor: "start", rotate: 0 },
    topMiddle: { x: (x2 - x1) / 2 + x1, y: y1 + fontSize / 2, textAnchor: "middle", rotate: 0 },
    topRight: { x: x2 - fontSize / 4, y: y1 + fontSize / 2, textAnchor: "end", rotate: 0 },

    leftTop: { x: x1 + fontSize / 2, y: y1 + fontSize / 4, textAnchor: "end", rotate: -90 },
    leftMiddle: { x: x1 + fontSize / 2, y: y1 + (y2 - y1) / 2, textAnchor: "middle", rotate: -90 },
    leftBottom: { x: x1 + fontSize / 2, y: y2 - fontSize / 4, textAnchor: "start", rotate: -90 },

    rightTop: { x: x2 - fontSize / 2, y: y1 + fontSize / 4, textAnchor: "start", rotate: 90 },
    rightMiddle: { x: x2 - fontSize / 2, y: y1 + (y2 - y1) / 2, textAnchor: "middle", rotate: 90 },
    rightBottom: { x: x2 - fontSize / 2, y: y2 - fontSize / 4, textAnchor: "end", rotate: 90 },

    bottomLeft: { x: x1 + fontSize / 4, y: y2 - fontSize / 2, textAnchor: "start", rotate: 0 },
    bottomMiddle: { x: (x2 - x1) / 2 + x1, y: y2 - fontSize / 2, textAnchor: "middle", rotate: 0 },
    bottomRight: { x: x2 - fontSize / 4, y: y2 - fontSize / 2, textAnchor: "end", rotate: 0 },

    center: { x: (x2 - x1) / 2 + x1, y: y1 + (y2 - y1) / 2, textAnchor: "middle", rotate: 0 }
  };
}

// Re-exported so draw.ts/notes.ts can share the same map type without importing from icons.ts.
export type { NoteEntity, NoteMap, IconEntity, IconMap };
