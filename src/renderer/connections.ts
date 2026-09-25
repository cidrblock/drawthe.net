import * as d3 from "d3";
import type { AnySelection } from "./d3-types";
import type { ConnectionEntity, DiagramConfig, IconMap, NoteMap } from "./types";

export function drawConnections(
  svg: AnySelection,
  diagram: DiagramConfig,
  connections: ConnectionEntity[],
  icons: IconMap,
  notes: NoteMap
): void {
  const xBand = diagram.xBand!;
  const yBand = diagram.yBand!;
  const defaultConnectionLabelFontSize =
    diagram.connectionLabelFontSize ?? Math.min(xBand.bandwidth() / 8, yBand.bandwidth() / 8);

  connections.forEach((connection, index) => {
    let endpoints = connection.endpoints.map((device) => device.split(":")[0]);

    let data = endpoints.map((thing) => {
      if (icons[thing]) {
        return { x: icons[thing].centerX as number, y: icons[thing].centerY as number };
      }
      return { x: notes[thing].centerX as number, y: notes[thing].centerY as number };
    });

    let angleRadians = Math.atan2(data[1].y - data[0].y, data[1].x - data[0].x);
    let angleDegrees = (angleRadians * 180) / Math.PI;

    // first, get all the paths going left to right & recompute
    if (angleDegrees >= 90 || angleDegrees < -90) {
      connection.endpoints = [connection.endpoints[1], connection.endpoints[0]];
      endpoints = endpoints.reverse();
      data = data.reverse();
      angleRadians = Math.atan2(data[1].y - data[0].y, data[1].x - data[0].x);
      angleDegrees = (angleRadians * 180) / Math.PI;
      if (connection.curve === "curveStepAfter") {
        connection.curve = "curveStepBefore";
      } else if (connection.curve === "curveStepBefore") {
        connection.curve = "curveStepAfter";
      }
    }

    const curve = (connection.curve && (d3 as Record<string, unknown>)[connection.curve]) || d3.curveLinear;
    const connectionLabelFontSize = connection.labelFontSize ?? defaultConnectionLabelFontSize;
    const labels = connection.labels || (connection.label ? [{
      text: connection.label,
      fontSize: connection.labelFontSize,
      position: connection.labelPosition,
      side: connection.labelSide
    }] : []);
    const lineStyle = connection.lineStyle ?? "solid";
    const dashArray = connection.strokeDashArray ?? {
      solid: undefined,
      dashed: "8,5",
      dotted: "2,4",
      dashDot: "8,4,2,4",
      double: undefined
    }[lineStyle];
    const dashPattern = Array.isArray(dashArray) ? dashArray.join(",") : dashArray;
    const isDouble = lineStyle === "double";
    const requestedStrokeWidth = connection.strokeWidth ?? (isDouble ? 4 : 1);
    const doubleGap = requestedStrokeWidth * 0.25;
    const strokeWidth = requestedStrokeWidth;
    let dxOffset = 3;
    const firstLabel = connection.endpoints[0].split(":")[1];
    const secondLabel = connection.endpoints[1].split(":")[1];
    const pathName = `path${index}`;

    let startOffset = 0;
    if (curve === d3.curveStepBefore) {
      startOffset = yBand.bandwidth() / 2;
    }
    if (curve === d3.curveStepAfter) {
      startOffset = xBand.bandwidth() / 2;
    }
    if (curve === d3.curveStep) {
      startOffset = xBand.bandwidth() / 2;
    }
    if (curve === d3.curveLinear) {
      // find the angle from the center to the corner
      const c2cRadians = Math.atan2(yBand.bandwidth() - yBand.bandwidth() / 2, xBand.bandwidth() - xBand.bandwidth() / 2);
      const c2cDegrees = (c2cRadians * 180) / Math.PI;
      const A = Math.abs(c2cDegrees - Math.abs(angleDegrees));
      let C = 90 - c2cDegrees;
      if (Math.abs(angleDegrees) > C) {
        C = 90 - C;
      }
      const B = 180 - (A + C);
      const b = Math.sqrt(Math.pow(xBand.bandwidth() / 2, 2) + Math.pow(yBand.bandwidth() / 2, 2));
      const c = (Math.sin((C * Math.PI) / 180) * b) / Math.sin((B * Math.PI) / 180);
      startOffset = Math.abs(c);
      // add a little padding if we're leaning in
      if (angleDegrees < 0 && angleDegrees > -c2cDegrees) {
        dxOffset = connectionLabelFontSize * 0.6;
      }
      if (angleDegrees > c2cDegrees && angleDegrees < 90) {
        dxOffset = connectionLabelFontSize * 0.6;
      }
    }

    const pathData = d3
      .line<{ x: number; y: number }>()
      .curve(curve as d3.CurveFactory)
      .x((d) => d.x)
      .y((d) => d.y)(data);

    if (isDouble) {
      const maskId = `doubleMask${index}`;
      const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
      defs
        .append("mask")
        .attr("id", maskId)
        .attr("maskUnits", "userSpaceOnUse")
        .attr("mask-type", "luminance")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", (diagram.x as number) + (diagram.width as number) + 20)
        .attr("height", (diagram.y as number) + (diagram.height as number) + 20)
        .append("path")
        .attr("d", pathData as string)
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", strokeWidth)
        .attr("stroke-dasharray", dashPattern || null);
      defs.select(`#${maskId}`)
        .append("path")
        .attr("d", pathData as string)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", doubleGap)
        .attr("stroke-dasharray", dashPattern || null);
      svg
        .append("path")
        .attr("id", pathName)
        .attr("d", pathData as string)
        .style("stroke", (connection.stroke || "orange") as string)
        .style("fill", "none")
        .style("stroke-width", strokeWidth)
        .attr("mask", `url(#${maskId})`);
    } else {
      svg
        .append("path")
        .datum(data)
        .attr("id", pathName)
        .style("stroke", (connection.stroke || "orange") as string)
        .style("fill", "none")
        .style("stroke-dasharray", dashPattern || "")
        .attr("stroke-linecap", lineStyle === "dotted" ? "round" : null)
        .style("stroke-width", strokeWidth)
        .attr("d", pathData);
    }

    labels.forEach((label) => {
      const position = label.position || "middle";
      const endpointOffset = startOffset + dxOffset;
      const fontSize = label.fontSize ?? connectionLabelFontSize;
      const labelPathName = `${pathName}-label-${position}-${labels.indexOf(label)}`;
      addOffsetPath(
        svg,
        labelPathName,
        data,
        curve,
        strokeWidth / 2 + fontSize / 2 + 2,
        label.side ?? "over"
      );
      const labelOffset =
        position === "start"
          ? `${endpointOffset}px`
          : position === "end"
            ? `calc(100% - ${endpointOffset}px)`
            : "50%";
      svg
        .append("text")
        .attr("class", "connectionLabel")
        .style("fill", connection.color || "orange")
        .style("font-size", `${fontSize}px`)
        .attr("dominant-baseline", "central")
        .append("textPath")
        .style("text-anchor", position === "start" ? "start" : position === "end" ? "end" : "middle")
        .attr("startOffset", labelOffset)
        .attr("xlink:href", `#${labelPathName}`)
        .text(label.text);
    });

    // in these we enter the 2nd node in a different direction
    if (curve === d3.curveStepBefore) {
      startOffset = xBand.bandwidth() / 2;
    } else if (curve === d3.curveStepAfter) {
      startOffset = yBand.bandwidth() / 2;
    }

    if (firstLabel) {
      const labelPathName = `${pathName}-endpoint-start`;
      addOffsetPath(
        svg,
        labelPathName,
        data,
        curve,
        strokeWidth / 2 + connectionLabelFontSize / 2 + 2,
        connection.endpointLabelSide ?? "over"
      );
      svg
        .append("text")
        .attr("class", "connectionLabel")
        .style("fill", connection.color || "orange")
        .style("font-size", `${connectionLabelFontSize}px`)
        .attr("dominant-baseline", "central")
        .append("textPath")
        .style("text-anchor", "start")
        .attr("startOffset", `${startOffset + dxOffset}px`)
        .attr("xlink:href", `#${labelPathName}`)
        .text(firstLabel);
    }
    if (secondLabel) {
      const labelPathName = `${pathName}-endpoint-end`;
      addOffsetPath(
        svg,
        labelPathName,
        data,
        curve,
        strokeWidth / 2 + connectionLabelFontSize / 2 + 2,
        connection.endpointLabelSide ?? "over"
      );
      svg
        .append("text")
        .attr("class", "connectionLabel")
        .style("fill", connection.color || "orange")
        .style("font-size", `${connectionLabelFontSize}px`)
        .attr("dominant-baseline", "central")
        .append("textPath")
        .style("text-anchor", "end")
        .attr("startOffset", `calc(100% - ${startOffset + dxOffset}px)`)
        .attr("xlink:href", `#${labelPathName}`)
        .text(secondLabel);
    }
  });
}

type Point = { x: number; y: number };

interface SamplingContext {
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void;
  quadraticCurveTo(x1: number, y1: number, x: number, y: number): void;
  closePath(): void;
}

function addOffsetPath(
  svg: AnySelection,
  id: string,
  data: Point[],
  curve: unknown,
  distance: number,
  side: "over" | "under"
): void {
  const points = sampleCurve(data, curve);
  const offsetPoints = offsetPolyline(points, distance, side);
  const pathData = offsetPoints.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join("");
  const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
  defs.append("path").attr("id", id).attr("d", pathData).attr("fill", "none");
}

function sampleCurve(data: Point[], curve: unknown): Point[] {
  const points: Point[] = [];
  let current: Point = { x: 0, y: 0 };
  const context: SamplingContext = {
    moveTo(x, y) {
      current = { x, y };
      points.push(current);
    },
    lineTo(x, y) {
      current = { x, y };
      points.push(current);
    },
    bezierCurveTo(x1, y1, x2, y2, x, y) {
      const start = current;
      for (let step = 1; step <= 16; step++) {
        const t = step / 16;
        const inverse = 1 - t;
        current = {
          x: inverse ** 3 * start.x + 3 * inverse ** 2 * t * x1 + 3 * inverse * t ** 2 * x2 + t ** 3 * x,
          y: inverse ** 3 * start.y + 3 * inverse ** 2 * t * y1 + 3 * inverse * t ** 2 * y2 + t ** 3 * y
        };
        points.push(current);
      }
    },
    quadraticCurveTo(x1, y1, x, y) {
      const start = current;
      for (let step = 1; step <= 16; step++) {
        const t = step / 16;
        const inverse = 1 - t;
        current = {
          x: inverse ** 2 * start.x + 2 * inverse * t * x1 + t ** 2 * x,
          y: inverse ** 2 * start.y + 2 * inverse * t * y1 + t ** 2 * y
        };
        points.push(current);
      }
    },
    closePath() {
      if (points.length > 0) points.push(points[0]);
    }
  };
  d3.line<Point>()
    .curve(curve as d3.CurveFactory)
    .x((point) => point.x)
    .y((point) => point.y)
    .context(context as unknown as CanvasRenderingContext2D)(data);
  return points;
}

function offsetPolyline(points: Point[], distance: number, side: "over" | "under"): Point[] {
  if (points.length < 2) return points;
  const direction = side === "over" ? 1 : -1;
  return points.map((point, index) => {
    const previous = points[Math.max(0, index - 1)];
    const next = points[Math.min(points.length - 1, index + 1)];
    const tangentX = next.x - previous.x;
    const tangentY = next.y - previous.y;
    const length = Math.hypot(tangentX, tangentY) || 1;
    return {
      x: point.x + direction * (tangentY / length) * distance,
      y: point.y - direction * (tangentX / length) * distance
    };
  });
}
