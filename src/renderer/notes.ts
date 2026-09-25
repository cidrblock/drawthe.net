import showdown from "showdown";
import { select } from "d3";
import type { AnySelection } from "./d3-types";
import { toEntries } from "./d3-types";
import type { DiagramConfig, NoteMap } from "./types";

// Inlined from showdown-prettify (BSD-2-Clause, https://github.com/showdownjs/prettify-extension)
// rather than depending on the npm package, which bundles its own nested copy of showdown
// and silently registers the extension on that copy instead of ours.
showdown.extension("prettify", () => [
  {
    type: "output",
    filter: (source: string) =>
      source.replace(/(<pre[^>]*>)?[\n\s]?<code([^>]*)>/gi, (match, pre, codeClass) =>
        pre ? `<pre class="prettyprint linenums"><code${codeClass}>` : ` <code class="prettyprint">`
      )
  }
]);

const xAlignStyles: Record<string, { textAlign: string; alignItems: string }> = {
  left: { textAlign: "left", alignItems: "flex-start" },
  right: { textAlign: "right", alignItems: "flex-end" },
  center: { textAlign: "center", alignItems: "center" }
};

const yAlignStyles: Record<string, { justifyContent: string }> = {
  top: { justifyContent: "flex-start" },
  center: { justifyContent: "center" },
  bottom: { justifyContent: "flex-end" }
};

export function drawNotes(svg: AnySelection, diagram: DiagramConfig, notes: NoteMap): void {
  const converter = new showdown.Converter({ extensions: ["prettify"] });
  converter.setOption("prefixHeaderId", "notes-");
  converter.setOption("tables", "true");

  const xBand = diagram.xBand!;
  const yBand = diagram.yBand!;

  const notesSelection = svg.selectAll("notes").data(toEntries(notes)).enter();

  const notesg = notesSelection
    .append("g")
    .attr("transform", (d: any) => `translate(${d.value.x1},${d.value.y1})`);

  notesg
    .append("rect")
    .attr("rx", (d: any) => d.value.rx)
    .attr("ry", (d: any) => d.value.ry)
    .attr("width", (d: any) => d.value.width)
    .attr("height", (d: any) => d.value.height)
    .attr("id", (d: any) => d.key)
    .attr("fill", (d: any) => d.value.fill || "red")
    .style("stroke", (d: any) => d.value.stroke || "red");

  const isHeadless = svg.node()?.parentElement?.parentElement?.getAttribute("data-render-target") === "node";
  if (isHeadless) {
    notesg.each(function (this: SVGGElement, d: any) {
      const lineHeight = Math.max(12, Math.min(yBand.bandwidth() * 0.125, xBand.bandwidth() * 0.125));
      const text = String(d.value.text || "Missing text in note");
      const textElement = select(this)
        .append("text")
        .attr("class", "noteText")
        .attr("fill", d.value.color || "white")
        .attr("font-size", lineHeight)
        .attr("x", d.value.padding)
        .attr("y", d.value.padding + lineHeight);
      text.split("\n").forEach((line, index) => {
        textElement
          .append("tspan")
          .attr("x", d.value.padding)
          .attr("dy", index === 0 ? 0 : lineHeight)
          .text(line.replace(/^#+\s*/, ""));
      });
    });
    return;
  }

  notesg
    .append("foreignObject")
    .attr("width", (d: any) => `${d.value.width}px`)
    .attr("height", (d: any) => `${d.value.height}px`)
    .append("xhtml:div")
    .style("width", (d: any) => `${d.value.width}px`)
    .style("height", (d: any) => `${d.value.height}px`)
    .style("font-size", `${Math.min(yBand.bandwidth() * 0.125, xBand.bandwidth() * 0.125)}px`)
    .style("display", "flex")
    .style("padding", (d: any) => `${d.value.padding}px`)
    .attr("class", "notes")
    .style("color", (d: any) => d.value.color || "white")
    .style("flex-direction", (d: any) => d.value.flexDirection || "column")
    .style("align-items", (d: any) => d.value.alignItems || xAlignStyles[d.value.xAlign].alignItems)
    .style("justify-content", (d: any) => d.value.justifyContent || yAlignStyles[d.value.yAlign].justifyContent)
    .style("text-align", (d: any) => d.value.textAlign || xAlignStyles[d.value.xAlign].textAlign)
    .html((d: any) => converter.makeHtml(d.value.text || "Missing text in note"));
}
