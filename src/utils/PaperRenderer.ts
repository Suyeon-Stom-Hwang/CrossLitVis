import * as d3 from "d3";
import type { PaperNode, PaperNoteNode } from "../types/VisNode";
import {
  calcNoteWidth,
  getPaperColor,
  getPaperTitleColor,
} from "./StyleManager";

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

        gEnter
          .append("rect")
          .attr("width", (d) => calcNoteWidth(d.title, 12))
          .attr("height", 60)
          .attr("rx", 10)
          .attr("ry", 10)
          .attr("x", (d) => -calcNoteWidth(d.title, 12) / 2)
          .attr("y", -30)
          .attr("fill", getPaperColor())
          .attr(
            "class",
            "drop-shadow-xl hover:stroke-3 hover:stroke-black transition-stroke duration-200 cursor-pointer"
          );

        gEnter
          .append("text")
          .attr("class", "drop-shadow-xl")
          .attr("y", 5)
          .attr("text-anchor", "middle")
          .attr("font-size", 12)
          .attr("fill", getPaperTitleColor())
          .style("pointer-events", "none")
          .text((d) => d.title);

        return gEnter;
      },
      (update) => {
        update
          .attr("transform", (d) => `translate(${d.x},${d.y})`)
          .select("circle")
          .attr("fill", getPaperColor());
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

        gEnter
          .append("rect")
          .attr("class", "opacity-80 stroke-2 stroke-gray-300")
          .attr("width", (d) => calcNoteWidth(d.note, 16))
          .attr("height", 25)
          .attr("rx", 5)
          .attr("ry", 5)
          .attr("x", (d) => -calcNoteWidth(d.note, 16) / 2)
          .attr("y", 30)
          .attr("fill", (d) => d.color);

        gEnter
          .append("text")
          .attr("y", 46)
          .attr("text-anchor", "middle")
          .attr("font-size", 12)
          .style("pointer-events", "none")
          .attr("fill", "#fff")
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
          .attr("width", (d) => calcNoteWidth(d.note, 16))
          .attr("x", (d) => -calcNoteWidth(d.note, 16) / 2);

        return update;
      },
      (exit) => exit.remove()
    );

  svg.selectAll<SVGGElement, PaperNoteNode>("g.paperNote").raise();
}
