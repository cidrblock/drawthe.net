import { axisBottom, axisLeft } from "d3";
import type { AnySelection } from "./d3-types";
import type { DiagramConfig } from "./types";

export function drawGridLines(svg: AnySelection, diagram: DiagramConfig): void {
  if (!diagram.gridLines) {
    return;
  }
  const xBand = diagram.xBand!;
  const yBand = diagram.yBand!;
  const height = diagram.height as number;
  const width = diagram.width as number;
  const x = diagram.x as number;
  const y = diagram.y as number;

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

  // Y gridlines
  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${x},${y})`)
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
