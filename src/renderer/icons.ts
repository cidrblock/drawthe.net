import type { AnySelection } from "./d3-types";
import { toEntries } from "./d3-types";
import type { IconLoader } from "./icon-loader";
import { textPositions } from "./process";
import type { DiagramConfig, IconMap, IconMetadata } from "./types";

export async function drawIcons(
  svg: AnySelection,
  diagram: DiagramConfig,
  icons: IconMap,
  iconTextRatio: number,
  iconLoader: IconLoader,
  warnings: string[]
): Promise<void> {
  const xBand = diagram.xBand!;
  const yBand = diagram.yBand!;

  const cells = svg
    .selectAll("cells")
    .data(toEntries(icons))
    .enter()
    .append("g")
    .attr("id", (d: any) => d.key)
    .attr("transform", (d: any) => `translate(${xBand(d.value.x)},${yBand(d.value.y)})`)
    .on("mouseenter", handleMouseOver)
    .on("mouseleave", () => handleMouseOut(svg))
    .each(function (this: SVGGElement, d: any) {
      if (d.value.metadata) {
        (this as any).style.cursor = "pointer";
      }
    });

  cells
    .append("rect")
    .attr("rx", (d: any) => d.value.rx)
    .attr("ry", (d: any) => d.value.ry)
    .attr("width", (d: any) => d.value.width)
    .attr("height", (d: any) => d.value.height)
    .attr("fill", (d: any) => d.value.fill || "orange")
    .style("stroke", (d: any) => d.value.stroke || "orange")
    .style("stroke-dasharray", (d: any) => d.value.strokeDashArray || [0, 0]);

  cells
    .append("text")
    .attr("class", "iconLabel")
    .text((d: any) => d.value.text || d.key)
    .each(function (this: SVGTextElement, d: any) {
      d.value.fontSize = Math.floor(
        Math.min((d.value.width * 0.9) / this.getComputedTextLength() * 12, (d.value.height / 2) * iconTextRatio)
      );
      d.value.textPosition = textPositions(0, 0, d.value.width, d.value.height, d.value.fontSize + 2)[
        d.value.textLocation
      ];
      if (d.value.url) {
        const url = d.value.url;
        this.addEventListener("click", () => window.open(url));
        this.style.cursor = "pointer";
        this.style.textDecoration = "underline";
      }
    })
    .style("font-size", (d: any) => `${d.value.fontSize}px`)
    .attr("id", (d: any) => `${d.key}-text`)
    .attr(
      "transform",
      (d: any) => `translate(${d.value.textPosition.x},${d.value.textPosition.y})rotate(${d.value.textPosition.rotate})`
    )
    .attr("fill", (d: any) => d.value.color || "orange")
    .attr("text-anchor", (d: any) => d.value.textPosition.textAnchor)
    .attr("dominant-baseline", "central");

  const iconLoads: Promise<void>[] = [];

  cells.each(function (this: SVGGElement, d: any) {
    const cellText = this.querySelector("text.iconLabel") as SVGTextElement;
    const fontSize = Math.ceil(d.value.fontSize);
    let x = d.value.width * d.value.iconPaddingX;
    let y = d.value.height * d.value.iconPaddingY;
    let width = d.value.width * (1 - 2 * d.value.iconPaddingX);
    let height = d.value.height * (1 - 2 * d.value.iconPaddingY);

    if (d.value.textLocation.startsWith("top")) {
      y += fontSize;
      height = (d.value.height - fontSize) * (1 - 2 * d.value.iconPaddingY);
    } else if (d.value.textLocation.startsWith("left")) {
      x += fontSize;
      width = (d.value.width - fontSize) * (1 - 2 * d.value.iconPaddingX);
    } else if (d.value.textLocation.startsWith("right")) {
      width = (d.value.width - fontSize) * (1 - 2 * d.value.iconPaddingX);
    } else if (d.value.textLocation.startsWith("bottom")) {
      height = (d.value.height - fontSize) * (1 - 2 * d.value.iconPaddingY);
    }

    const iconLoad = iconLoader
      .load(d.value.iconFamily, d.value.icon)
      .then((iconSvg) => {
        iconSvg.setAttribute("x", String(x));
        iconSvg.setAttribute("y", String(y));
        iconSvg.setAttribute("width", String(width));
        iconSvg.setAttribute("height", String(height));

        const paths = iconSvg.getElementsByTagName("path");
        for (let i = 0; i < paths.length; i++) {
          const path = paths[i];
          if (d.value.preserveWhite && path.getAttribute("fill") === "#fff") {
            // intentionally left unchanged, matching the original app's no-op branch
          } else if (d.value.iconFill && path.getAttribute("fill") !== "none") {
            path.setAttribute("fill", d.value.iconFill);
          }
          if (d.value.iconStroke && path.getAttribute("stroke") !== "none") {
            path.setAttribute("stroke", d.value.iconStroke);
          }
          if (d.value.iconStrokeWidth && path.getAttribute("stroke-width")) {
            path.setAttribute("stroke-width", String(d.value.iconStrokeWidth));
          }
        }
        this.insertBefore(iconSvg.cloneNode(true), cellText);
      })
      .catch((error) => {
        warnings.push(
          `Icon not found for "${d.key}": family="${d.value.iconFamily}" icon="${d.value.icon}" (${error instanceof Error ? error.message : String(error)})`
        );
        insertMissingIconPlaceholder(this, cellText, x, y, width, height);
      });
    iconLoads.push(iconLoad);
  });

  await Promise.all(iconLoads);


  function handleMouseOver(this: SVGGElement, _event: MouseEvent, d: any): void {
    if (d.value.metadata && d.value.metadata.url) {
      const url = resolveMetadataUrl(d.value.metadata.url, d.key, d.value);
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw Object.assign(new Error(`HTTP ${response.status}`), { status: response.status, statusText: response.statusText });
          }
          return response.json();
        })
        .then((json) => {
          const metadata = { ...json, ...d.value.metadata };
          delete metadata.url;
          delete metadata.errorText;
          mouseOver(d, metadata);
        })
        .catch((error) => {
          const metadata: IconMetadata = { ...d.value.metadata };
          delete metadata.url;
          if (d.value.metadata.errorText) {
            metadata.note = d.value.metadata.errorText;
            delete metadata.errorText;
          } else {
            metadata.status = error.status ?? "error";
            metadata.statusText = error.statusText ?? String(error.message ?? error);
          }
          mouseOver(d, metadata);
        });
    } else if (d.value.metadata) {
      mouseOver(d, d.value.metadata);
    }
  }

  function mouseOver(d: any, metadata: Record<string, unknown> | undefined): void {
    if (!metadata) {
      return;
    }
    const length = Object.keys(metadata).length;
    let justifyContent = "flex-start";
    svg
      .append("foreignObject")
      .attr("id", `t${d.value.x}-${d.value.y}`)
      .attr("class", "mouseOver")
      .attr("x", () => {
        if (d.value.x2 + d.value.width * 2 < diagram.width!) {
          return d.value.x2;
        }
        justifyContent = "flex-end";
        return d.value.x1 - d.value.width * 3;
      })
      .attr("y", () => d.value.centerY - length * d.value.fontSize)
      .append("xhtml:div")
      .attr("class", "metadata")
      .style("width", () => `${d.value.width * 3}px`)
      .style("height", () => length * d.value.fontSize)
      .style("justify-content", () => justifyContent)
      .style("font-size", () => `${d.value.fontSize}px`)
      .html(() => {
        let text = "<table>";
        for (const key of Object.keys(metadata)) {
          text += `<tr><td>${key}:&nbsp</td><td>${metadata[key]}</td></tr>`;
        }
        text += "</table>";
        return text;
      });
  }

  function handleMouseOut(target: AnySelection): void {
    target.selectAll(".mouseOver").remove();
  }
}

/** Visible marker for an icon that failed to load, so a bad `icon`/`iconFamily` is obvious rather than silently missing. */
function insertMissingIconPlaceholder(
  cell: SVGGElement,
  before: Node,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const ns = "http://www.w3.org/2000/svg";
  const doc = cell.ownerDocument;
  const group = doc.createElementNS(ns, "g");

  const rect = doc.createElementNS(ns, "rect");
  rect.setAttribute("x", String(x));
  rect.setAttribute("y", String(y));
  rect.setAttribute("width", String(width));
  rect.setAttribute("height", String(height));
  rect.setAttribute("fill", "none");
  rect.setAttribute("stroke", "red");
  rect.setAttribute("stroke-dasharray", "4,2");
  group.appendChild(rect);

  const mark = doc.createElementNS(ns, "text");
  mark.setAttribute("x", String(x + width / 2));
  mark.setAttribute("y", String(y + height / 2));
  mark.setAttribute("text-anchor", "middle");
  mark.setAttribute("dominant-baseline", "central");
  mark.setAttribute("fill", "red");
  mark.setAttribute("font-size", String(Math.min(width, height) * 0.5));
  mark.textContent = "?";
  group.appendChild(mark);

  cell.insertBefore(group, before);
}

function resolveMetadataUrl(template: string, key: string, value: Record<string, unknown>): string {
  const replacements = template.match(/{{\s*[\w.]+\s*}}/g);
  if (!replacements) {
    return template;
  }
  let url = template;
  replacements.forEach((replacement) => {
    const inner = replacement.match(/[\w.]+/)?.[0] ?? "";
    url = url.replace(replacement, inner === "key" ? key : String(value[inner]));
  });
  return url;
}

