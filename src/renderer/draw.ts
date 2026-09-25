import { scaleBand, select, zoom, type ZoomTransform } from "d3";
import { drawConnections } from "./connections";
import type { AnySelection } from "./d3-types";
import { drawGridLines } from "./gridlines";
import { drawGroups } from "./groups";
import type { IconLoader } from "./icon-loader";
import { drawIcons } from "./icons";
import { drawNotes } from "./notes";
import {
  findGroupCollisions,
  isVisibleGroup,
  marginBox,
  processConnections,
  processEntities,
  processGroups
} from "./process";
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

export interface DrawResult {
  /** Non-fatal issues encountered while rendering, e.g. an `icon`/`iconFamily` that couldn't be loaded. */
  warnings: string[];
}

/** Renders a parsed drawthe.net YAML document into the given render target. */
export async function draw(doc: DiagramDocument, options: DrawOptions): Promise<DrawResult> {
  const { target, iconLoader } = options;
  const warnings: string[] = [];

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

  const inset: Margins = { top: 0, right: 0, bottom: 0, left: 0 };
  const buildBands = (): void => {
    diagram.xBand = scaleBand<number>()
      .domain(Array.from(Array(diagram.columns as number).keys()))
      .rangeRound([(diagram.x as number) + inset.left, (diagram.width as number) + (diagram.x as number) - inset.right])
      .paddingInner(diagram.gridPaddingInner as number);

    diagram.yBand = scaleBand<number>()
      .domain(Array.from(Array(diagram.rows as number).keys()).reverse())
      .rangeRound([(diagram.y as number) + inset.top, (diagram.height as number) + (diagram.y as number) - inset.bottom])
      .paddingInner(diagram.gridPaddingInner as number);
  };

  // remove any previously rendered diagram from this target
  const containerSelection = select(target.container);
  containerSelection.select("svg").remove();

  const svgRoot = containerSelection
    .append("svg")
    .attr("width", parentBox.width)
    .attr("height", parentBox.height)
    .style("background-color", diagram.fill as string);
  svgRoot
    .append("rect")
    .attr("width", parentBox.width)
    .attr("height", parentBox.height)
    .attr("fill", diagram.fill as string);
  const svg: AnySelection = svgRoot.call(
      zoom<SVGSVGElement, unknown>().on("zoom", (event: { transform: ZoomTransform }) => {
        svg.attr("transform", event.transform.toString());
      })
    )
    .append("g")
    .attr(
      "transform",
      `translate(${(parentBox.width - svgWidth) / 2},${(parentBox.height - svgHeight) / 2})`
    );

  connections = processConnections(connections, groups);

  // Group frames extend beyond their members, so shrink the grid until every
  // visible frame (including margins) fits the area above the title.
  const area = { x1: 0, y1: 0, x2: svgWidth, y2: (diagram.y as number) + (diagram.height as number) };
  for (let pass = 0; pass < 6; pass++) {
    buildBands();
    notes = processEntities(diagram, notes);
    icons = processEntities(diagram, icons);
    groups = processGroups(groups, diagram, icons);
    const visible = Object.values(groups).filter(isVisibleGroup).map((group) => marginBox(group, diagram));
    if (visible.length === 0) {
      break;
    }
    const overflow: Margins = {
      top: area.y1 - Math.min(...visible.map((box) => box.y1)),
      right: Math.max(...visible.map((box) => box.x2)) - area.x2,
      bottom: Math.max(...visible.map((box) => box.y2)) - area.y2,
      left: area.x1 - Math.min(...visible.map((box) => box.x1))
    };
    if (Math.max(overflow.top, overflow.right, overflow.bottom, overflow.left) <= 0.5) {
      break;
    }
    for (const side of ["top", "right", "bottom", "left"] as const) {
      inset[side] += Math.max(0, overflow[side]);
    }
  }
  warnings.push(...findGroupCollisions(groups, icons));

  drawTitle(svg, diagram, title);
  drawGridLines(svg, diagram);
  drawGroups(svg, diagram, groups);
  drawConnections(svg, diagram, connections, icons, notes);
  await drawIcons(svg, diagram, icons, diagram.iconTextRatio as number, iconLoader, warnings);
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

  return { warnings };
}
