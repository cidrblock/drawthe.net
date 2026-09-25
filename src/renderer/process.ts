import type { ScaleBand } from "d3";
import { max as d3max, min as d3min } from "d3";
import type {
  ConnectionEntity,
  DiagramConfig,
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

/** Computes each group's bounding box from its (possibly nested) member icons. */
export function processGroups(groups: GroupMap, diagram: DiagramConfig, icons: IconMap): GroupMap {
  const xBand = diagram.xBand as ScaleBand<number>;
  const yBand = diagram.yBand as ScaleBand<number>;

  for (const key of Object.keys(groups)) {
    const group = groups[key];
    group.maxDepth = 1;
    let additionalMembers: string[] = [];
    for (let i = group.members.length - 1; i >= 0; i--) {
      if (!icons[group.members[i]]) {
        const result = diveOne(group.members[i], groups, 1);
        additionalMembers = additionalMembers.concat(result.members);
        if (result.depth > group.maxDepth) {
          group.maxDepth = result.depth;
        }
        group.members.splice(i, 1);
      }
      group.members = group.members.concat(additionalMembers);
    }

    const xpad = (xBand.step() - xBand.bandwidth()) * (diagram.groupPadding as number) * group.maxDepth;
    const ypad = (yBand.step() - yBand.bandwidth()) * (diagram.groupPadding as number) * group.maxDepth;
    group.x1 = (xBand(d3min(group.members, (d) => Number(icons[d].x)) as number) as number) - xpad;
    group.y1 = (yBand(d3max(group.members, (d) => Number(icons[d].y)) as number) as number) - ypad;
    group.x2 = d3max(group.members, (d) => (icons[d].x2 as number) + xpad) as number;
    group.y2 = d3max(group.members, (d) => (icons[d].y2 as number) + ypad) as number;
    group.width = (group.x2 as number) - (group.x1 as number);
    group.height = (group.y2 as number) - (group.y1 as number);
    group.fontSize = Math.min(xpad / group.maxDepth, ypad / group.maxDepth) - 2;
  }
  return groups;
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
