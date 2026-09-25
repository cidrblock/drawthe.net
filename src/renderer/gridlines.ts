import { axisBottom, axisLeft } from "d3";
import type { AnySelection } from "./d3-types";
import type { DiagramConfig } from "./types";

export function drawGridLines(svg: AnySelection, diagram: DiagramConfig): void {
  if (!diagram.gridLines) {
    return;
  }
  const xBand = diagram.xBand!;
  const yBand = diagram.yBand!;
  // the grid may be inset from the drawing area to make room for group frames
  const [x, xEnd] = xBand.range();
  const [y, yEnd] = yBand.range();
  const width = xEnd - x;
  const height = yEnd - y;

  // X gridlines
  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${height + y})`)
    .call(
      axisBottom(xBand)
        .tickSize(-height)
        .tickFormat(() => "")
        .ticks(diagram.columns as number)
    );

  // Y gridlines (yBand positions are already absolute)
  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${x},0)`)
    .call(
      axisLeft(yBand)
        .tickSize(-width)
        .tickFormat(() => "")
        .ticks(diagram.rows as number)
    );

  // X axis (hidden, kept for tick alignment)
  svg
    .append("g")
    .attr("transform", `translate(0,${height + y})`)
    .attr("class", "axisNone")
    .call(axisBottom(xBand));

  // Y axis (hidden, kept for tick alignment)
  svg
    .append("g")
    .attr("transform", `translate(${x},0)`)
    .attr("class", "axisNone")
    .call(axisLeft(yBand));
}
