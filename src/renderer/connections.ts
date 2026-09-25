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
  const defaultConnectionLabelFontSize = Math.min(xBand.bandwidth() / 8, yBand.bandwidth() / 8);

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
    const connectionLabelFontSize = connection.labelFontSize || defaultConnectionLabelFontSize;
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

    // draw the path between the points
    svg
      .append("path")
      .datum(data)
      .attr("id", pathName)
      .style("stroke", (connection.stroke || "orange") as string)
      .style("fill", "none")
      .style("stroke-dasharray", (connection.strokeDashArray || [0, 0]) as string)
      .style("stroke-width", connection.strokeWidth || 1)
      .attr(
        "d",
        d3
          .line<{ x: number; y: number }>()
          .curve(curve as d3.CurveFactory)
          .x((d) => d.x)
          .y((d) => d.y)
      );

    const labels = connection.labels || (connection.label ? [{
      text: connection.label,
      fontSize: connection.labelFontSize,
      position: connection.labelPosition
    }] : []);
    labels.forEach((label) => {
      const position = label.position || "middle";
      const endpointOffset = startOffset + dxOffset;
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
        .style("font-size", `${label.fontSize || connectionLabelFontSize}px`)
        .attr("dy", -1)
        .append("textPath")
        .style("text-anchor", position === "start" ? "start" : position === "end" ? "end" : "middle")
        .attr("startOffset", labelOffset)
        .attr("xlink:href", `#${pathName}`)
        .text(label.text);
      });

    // in these we enter the 2nd node in a different direction
    if (curve === d3.curveStepBefore) {
      startOffset = xBand.bandwidth() / 2;
    } else if (curve === d3.curveStepAfter) {
      startOffset = yBand.bandwidth() / 2;
    }

    if (firstLabel) {
      svg
        .append("text")
        .attr("class", "connectionLabel")
        .style("fill", connection.color || "orange")
        .style("font-size", `${connectionLabelFontSize}px`)
        .attr("dy", connectionLabelFontSize)
        .append("textPath")
        .style("text-anchor", "start")
        .attr("startOffset", `${startOffset + dxOffset}px`)
        .attr("xlink:href", `#${pathName}`)
        .text(firstLabel);
    }
    if (secondLabel) {
      svg
        .append("text")
        .attr("class", "connectionLabel")
        .style("fill", connection.color || "orange")
        .style("font-size", `${connectionLabelFontSize}px`)
        .attr("dy", connectionLabelFontSize)
        .append("textPath")
        .style("text-anchor", "end")
        .attr("startOffset", `calc(100% - ${startOffset + dxOffset}px)`)
        .attr("xlink:href", `#${pathName}`)
        .text(secondLabel);
    }
  });
}
