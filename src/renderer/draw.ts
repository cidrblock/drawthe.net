import { scaleBand, select, zoom, type ZoomTransform } from "d3";
import { drawConnections } from "./connections";
import type { AnySelection } from "./d3-types";
import { drawGridLines } from "./gridlines";
import { drawGroups } from "./groups";
import type { IconLoader } from "./icon-loader";
import { drawIcons } from "./icons";
import { drawNotes } from "./notes";
import { processConnections, processEntities, processGroups } from "./process";
import type { RenderTarget } from "./render-target";
import { drawTitle } from "./title";
import type { DiagramConfig, DiagramDocument, Margins, TitleConfig } from "./types";

const DRAWING_DEFAULTS: DiagramConfig = {
  fill: "orange",
  aspectRatio: "1:1",
  rows: 10,
  columns: 10,
  groupPadding: 0.33,
  gridLines: true,
  gridPaddingInner: 0.4,
  iconTextRatio: 0.33,
  margins: { top: 20, right: 20, bottom: 50, left: 20 } as Margins
};

const TITLE_DEFAULTS: TitleConfig = {
  text: "Decent looking diagrams for engineers",
  subText: "More information can be found at http://github.com/cidrblock/dld4e",
  author: "Bradley A. Thornton",
  company: "Self",
  date: new Date().toLocaleDateString(),
  version: 1.01,
  color: "orange",
  stroke: "orange",
  fill: "orange",
  heightPercentage: 6,
  logoUrl: "/images/radial.png",
  logoFill: "orange"
};

export interface DrawOptions {
  target: RenderTarget;
  iconLoader: IconLoader;
}

/** Renders a parsed drawthe.net YAML document into the given render target. */
export function draw(doc: DiagramDocument, options: DrawOptions): void {
  const { target, iconLoader } = options;

  let connections = doc.connections || [];
  let groups = doc.groups || {};
  let notes = doc.notes || {};
  let icons = doc.icons || {};

  const diagram: DiagramConfig = Object.assign({}, DRAWING_DEFAULTS, doc.diagram || {});
  const title: TitleConfig = Object.assign({}, TITLE_DEFAULTS, doc.title || {});

  target.setBackground?.(diagram.fill as string);

  const parentBox = target.getBoundingBox();
  const ratios = (diagram.aspectRatio as string).split(":").map(Number);
  const margins = diagram.margins as Margins;

  const availableHeight = parentBox.height - margins.top - margins.bottom;
  const availableWidth = parentBox.width - margins.left - margins.right;

  let svgHeight: number;
  let svgWidth: number;
  if (availableHeight < availableWidth) {
    svgHeight = availableHeight;
    svgWidth = (svgHeight / ratios[1]) * ratios[0];
  } else if (availableWidth < availableHeight) {
    svgWidth = availableWidth;
    svgHeight = (svgWidth / ratios[0]) * ratios[1];
  } else {
    svgWidth = availableWidth;
    svgHeight = availableHeight;
  }
  // downsize if outside the bounds
  if (svgHeight > availableHeight) {
    svgHeight = availableHeight;
    svgWidth = (svgHeight / ratios[1]) * ratios[0];
  }
  if (svgWidth > availableWidth) {
    svgWidth = availableWidth;
    svgHeight = (svgWidth / ratios[0]) * ratios[1];
  }

  title.height = svgHeight * ((title.heightPercentage as number) / 100);
  diagram.height = svgHeight - title.height;
  diagram.width = (diagram.height / ratios[1]) * ratios[0];
  diagram.x = (svgWidth - diagram.width) / 2;
  diagram.y = svgHeight - title.height - diagram.height;

  diagram.xBand = scaleBand<number>()
    .domain(Array.from(Array(diagram.columns as number).keys()))
    .rangeRound([diagram.x, diagram.width + diagram.x])
    .paddingInner(diagram.gridPaddingInner as number);

  diagram.yBand = scaleBand<number>()
    .domain(Array.from(Array(diagram.rows as number).keys()).reverse())
    .rangeRound([diagram.y, diagram.height + diagram.y])
    .paddingInner(diagram.gridPaddingInner as number);

  // remove any previously rendered diagram from this target
  const containerSelection = select(target.container);
  containerSelection.select("svg").remove();

  const svg: AnySelection = containerSelection
    .append("svg")
    .attr("width", parentBox.width)
    .attr("height", parentBox.height)
    .style("background-color", diagram.fill as string)
    .call(
      zoom<SVGSVGElement, unknown>().on("zoom", (event: { transform: ZoomTransform }) => {
        svg.attr("transform", event.transform.toString());
      })
    )
    .append("g")
    .attr(
      "transform",
      `translate(${(parentBox.width - svgWidth) / 2},${(parentBox.height - svgHeight) / 2})`
    );

  notes = processEntities(diagram, notes);
  icons = processEntities(diagram, icons);
  connections = processConnections(connections, groups);
  groups = processGroups(groups, diagram, icons);

  drawTitle(svg, diagram, title);
  drawGridLines(svg, diagram);
  drawGroups(svg, diagram, groups);
  drawConnections(svg, diagram, connections, icons, notes);
  drawIcons(svg, diagram, icons, diagram.iconTextRatio as number, iconLoader);
  drawNotes(svg, diagram, notes);

  if (typeof PR !== "undefined" && PR) {
    PR.prettyPrint();
  }

  // move all the labels to the front
  for (const className of ["connectionLabel", "groupLabel", "iconLabel"]) {
    svg.selectAll<Element, unknown>(`.${className}`).each(function (this: Element) {
      this.parentNode?.appendChild(this);
    });
  }
}
