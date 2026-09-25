import type { AnySelection } from "./d3-types";
import type { DiagramConfig, TitleConfig } from "./types";

export function drawTitle(svg: AnySelection, drawing: DiagramConfig, title: TitleConfig): void {
  const heightPercentage = title.heightPercentage as number;
  if (!(heightPercentage > 0)) {
    return;
  }

  const axisPadding = 20;
  const drawingX = drawing.x as number;
  const drawingHeight = drawing.height as number;
  const drawingY = drawing.y as number;
  const drawingWidth = drawing.width as number;
  const titleHeight = title.height as number;

  title.x1 = drawingX - axisPadding;
  title.y1 = drawingHeight + drawingY + axisPadding;
  title.x2 = drawingX + drawingWidth + axisPadding;
  title.y2 = (title.y1 as number) + titleHeight + axisPadding;
  title.width = (title.x2 as number) - (title.x1 as number);

  const titleWidth = title.width as number;

  const titleBox = svg.append("g").attr("transform", `translate(${title.x1},${title.y1})`);

  if (title.type === "bar") {
    titleBox
      .append("line")
      .attr("stroke", title.stroke as string)
      .attr("x2", titleWidth)
      .attr("fill", title.fill as string);
  } else {
    titleBox
      .append("rect")
      .attr("fill", title.fill as string)
      .attr("stroke", title.stroke as string)
      .attr("width", titleWidth)
      .attr("height", titleHeight);
  }

  const padding = titleHeight * 0.025;
  const titleInner = titleBox.append("g").attr("transform", `translate(${padding},${padding})`);

  const logo = titleInner.append("g");
  logo
    .append("rect")
    .attr("width", titleHeight - 2 * padding)
    .attr("height", titleHeight - 2 * padding)
    .attr("fill", title.logoFill as string);
  logo
    .append("svg:image")
    .attr("width", titleHeight - 2 * padding)
    .attr("height", titleHeight - 2 * padding)
    .attr("xlink:href", title.logoUrl as string);

  titleInner
    .append("text")
    .attr("x", titleHeight)
    .attr("y", (titleHeight * 2) / 5)
    .attr("dominant-baseline", "middle")
    .style("fill", title.color as string)
    .style("font-size", titleHeight * 0.5 + "px")
    .text(title.text as string);

  titleInner
    .append("text")
    .attr("x", titleHeight)
    .attr("y", (titleHeight * 4) / 5)
    .attr("dominant-baseline", "middle")
    .style("fill", title.color as string)
    .style("font-size", titleHeight * 0.25 + "px")
    .text(title.subText as string);

  appendLabeledField(titleInner, titleWidth, titleHeight, padding, 1 / 8, "Author:", title.author, title.color);
  appendLabeledField(titleInner, titleWidth, titleHeight, padding, 3 / 8, "Company:", title.company, title.color);
  appendLabeledField(titleInner, titleWidth, titleHeight, padding, 5 / 8, "Date:", title.date, title.color);
  appendLabeledField(titleInner, titleWidth, titleHeight, padding, 7 / 8, "Version:", title.version, title.color);
}

function appendLabeledField(
  titleInner: AnySelection,
  titleWidth: number,
  titleHeight: number,
  padding: number,
  yRatio: number,
  label: string,
  value: unknown,
  color: unknown
): void {
  titleInner
    .append("text")
    .attr("x", titleWidth - titleWidth / 5)
    .attr("y", titleHeight * yRatio)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "end")
    .style("fill", color as string)
    .style("font-size", titleHeight * 0.25 + "px")
    .style("font-weight", "bold")
    .text(label);

  titleInner
    .append("text")
    .attr("x", titleWidth - titleWidth / 5 + 2 * padding)
    .attr("y", titleHeight * yRatio)
    .attr("dominant-baseline", "middle")
    .style("fill", color as string)
    .style("font-size", titleHeight * 0.25 + "px")
    .text(value as string);
}
