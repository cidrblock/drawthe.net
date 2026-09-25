import type { AnySelection } from "./d3-types";
import type { DiagramConfig, GroupMap } from "./types";

export function drawGroups(svg: AnySelection, diagram: DiagramConfig, groups: GroupMap): void {
  const xBand = diagram.xBand!;
  const yBand = diagram.yBand!;

  const groupKeys = Object.keys(groups)
    .filter((key) => groups[key].frame)
    .sort(
      (left, right) => (groups[right].width || 0) * (groups[right].height || 0) - (groups[left].width || 0) * (groups[left].height || 0)
    );

  for (const key of groupKeys) {
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

    const label = group.label;
    if (label) {
      svg
        .append("text")
        .attr("class", "groupLabel")
        .text(label.text)
        .attr("transform", `translate(${label.x},${label.y})rotate(${label.rotate})`)
        .attr("text-anchor", label.textAnchor)
        .attr("dominant-baseline", "central")
        .style("font-size", `${label.fontSize}px`)
        .attr("fill", group.color || "orange");
    }
  }
}
