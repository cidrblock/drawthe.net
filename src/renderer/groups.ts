import type { AnySelection } from "./d3-types";
import { textPositions } from "./process";
import type { DiagramConfig, GroupMap } from "./types";

export function drawGroups(svg: AnySelection, diagram: DiagramConfig, groups: GroupMap): void {
  const xBand = diagram.xBand!;
  const yBand = diagram.yBand!;

  for (const key of Object.keys(groups)) {
    const group = groups[key];
    svg
      .append("rect")
      .attr("x", group.x1 as number)
      .attr("y", group.y1 as number)
      .attr("rx", xBand.bandwidth() * 0.05)
      .attr("ry", yBand.bandwidth() * 0.05)
      .attr("width", group.width as number)
      .attr("height", group.height as number)
      .attr("fill", (group.fill || "orange") as string)
      .style("stroke", (group.stroke || "orange") as string)
      .style("stroke-dasharray", (group.strokeDashArray || [0, 0]) as string)
      .style("stroke-width", group.strokeWidth || 1);

    if (group.name) {
      const fontSize = (group.fontSize as number) + 2;
      const textLocation = textPositions(
        group.x1 as number,
        group.y1 as number,
        group.x2 as number,
        group.y2 as number,
        fontSize
      )[group.textLocation || "topLeft"];

      svg
        .append("text")
        .attr("class", "groupLabel")
        .text(group.name)
        .attr("transform", `translate(${textLocation.x},${textLocation.y})rotate(${textLocation.rotate})`)
        .attr("text-anchor", textLocation.textAnchor)
        .attr("dominant-baseline", "central")
        .style("font-size", `${group.fontSize}px`)
        .attr("fill", group.color || "orange");
    }
  }
}
