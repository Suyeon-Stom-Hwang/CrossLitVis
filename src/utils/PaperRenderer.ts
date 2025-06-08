import * as d3 from "d3";
import type { PaperNode, PaperNoteNode } from "../types/VisNode";
import { calcNoteWidth } from "./StyleManager";

export function renderPapers(
  svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
  paperNodes: PaperNode[],
  paperDrag: d3.DragBehavior<
    SVGGElement,
    PaperNode,
    PaperNode | d3.SubjectPosition
  >
) {
  svg
    .selectAll<SVGGElement, PaperNode>("g.node")
    .data(paperNodes, (d: PaperNode) => d.id)
    .join(
      (enter) => {
        const gEnter = enter
          .append("g")
          .classed("node", true)
          .attr("transform", (d) => `translate(${d.x},${d.y})`)
          .call(paperDrag);

        const className = {
          rect: "stroke-slate-300 fill-slate-50 hover:stroke-3 hover:stroke-black transition-stroke duration-200 cursor-pointer",
          text: "text-xs fill-gray-900",
        };
        gEnter
          .append("rect")
          .attr("width", (d) => calcNoteWidth(d.title, 12))
          .attr("height", 60)
          .attr("stroke-width", 1.5)
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("x", (d) => -calcNoteWidth(d.title, 12) / 2)
          .attr("y", -30)
          .attr("class", className.rect);

        gEnter
          .append("text")
          .attr("y", 5)
          .attr("text-anchor", "middle")
          .attr("class", className.text)
          .style("pointer-events", "none")
          .text((d) => d.title);

        return gEnter;
      },
      (update) => {
        update.attr("transform", (d) => `translate(${d.x},${d.y})`);

        return update;
      },
      (exit) => exit.remove()
    );

  svg.selectAll<SVGGElement, PaperNode>("g.node").raise();
}

export function renderPaperNotes(
  svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
  paperNoteNodes: PaperNoteNode[],
  onDoubleClick: (event: MouseEvent, d: PaperNoteNode) => void
) {
  svg
    .selectAll<SVGGElement, PaperNoteNode>("g.paperNote")
    .data(paperNoteNodes, (d: PaperNoteNode) => d.id)
    .join(
      (enter) => {
        const gEnter = enter
          .append("g")
          .attr("class", "paperNote drop-shadow-xl")
          .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
          .on("dblclick", onDoubleClick);

        const className = {
          rect: "opacity-80 drop-shadow-2xl fill-amber-100 ",
          text: "text-xs fill-gray-900",
        };

        gEnter
          .append("rect")
          .attr("class", className.rect)
          .attr("width", (d) => calcNoteWidth(d.note, 12))
          .attr("height", 25)
          .attr("rx", 5)
          .attr("ry", 5)
          .attr("x", (d) => -calcNoteWidth(d.note, 12) / 2)
          .attr("y", 35);

        gEnter
          .append("text")
          .attr("y", 51)
          .attr("text-anchor", "middle")
          .attr("class", className.text)
          .style("pointer-events", "none")
          .text((d) => d.note);

        return gEnter;
      },
      (update) => {
        update
          .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
          .select("text")
          .text((d) => d.note);

        update
          .select("rect")
          .attr("width", (d) => calcNoteWidth(d.note, 12))
          .attr("x", (d) => -calcNoteWidth(d.note, 12) / 2);

        return update;
      },
      (exit) => exit.remove()
    );

  svg.selectAll<SVGGElement, PaperNoteNode>("g.paperNote").raise();
}
