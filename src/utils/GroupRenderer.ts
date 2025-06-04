import * as d3 from "d3";
import type {
  GroupBubbleNode,
  GroupNoteNode,
  GroupTitleNode,
} from "../types/VisNode";
import { calcNoteWidth, getGroupColor } from "./StyleManager";

export function renderGroupBubblePath(
  svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
  groupBubbleNodes: GroupBubbleNode[],
  onClick: (event: MouseEvent, d: GroupBubbleNode) => void
) {
  /** g.node 그룹 */
  svg
    .selectAll<SVGPathElement, GroupBubbleNode>("path.bubble")
    .data(groupBubbleNodes, (d) => d.id)
    .join(
      (enter) => {
        const path = enter
          .append("path")
          .attr("class", "bubble cursor-pointer")
          .attr("d", (d) => d.path.toString())
          .attr("fill", (d) => getGroupColor(d.depth))
          .attr("opacity", 0.5)
          .attr("stroke", "#000")
          .attr("filter", (d) => {
            return `drop-shadow(0 0 4px ${d3
              .color(getGroupColor(d.depth))
              ?.formatRgb()}`;
          })
          .on("click", function (event, d) {
            onClick(event, d);
          })
          .on("mouseenter", function () {
            d3.selectAll<SVGPathElement, GroupBubbleNode>("path.bubble")
              .transition()
              .duration(200)
              .attr("opacity", 0.2)
              .attr("stroke-width", 1);

            d3.select(this)
              .transition()
              .duration(200)
              .attr("stroke-width", 6)
              .attr("opacity", 0.7);
          })
          .on("mouseleave", function () {
            d3.selectAll<SVGPathElement, GroupBubbleNode>("path.bubble")
              .transition()
              .duration(200)
              .attr("opacity", 0.5)
              .attr("stroke-width", 1);

            d3.select(this)
              .transition()
              .duration(200)
              .attr("stroke-width", 1)
              .attr("opacity", 0.5);
          });
        return path;
      },
      (update) => {
        update
          .attr("d", (d) => d.path.toString())
          .attr("fill", (d) => getGroupColor(d.depth));
        return update;
      },
      (exit) => exit.remove()
    );
  svg.selectAll<SVGPathElement, GroupBubbleNode>("path.bubble").raise();
}

export function renderGroupTitles(
  svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
  groupTitleNodes: GroupTitleNode[]
) {
  svg
    .selectAll<SVGGElement, GroupTitleNode>("g.groupTitle")
    .data(groupTitleNodes, (d: GroupTitleNode) => d.id)
    .join(
      (enter) => {
        const gEnter = enter
          .append("g")
          .attr("class", "groupTitle drop-shadow-xs")
          .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

        gEnter
          .append("rect")
          .attr("class", "opacity-80 stroke-2 stroke-gray-300")
          .attr("width", (d) => calcNoteWidth(d.title, 16))
          .attr("height", 34)
          .attr("rx", 5)
          .attr("ry", 5)
          .attr("x", (d) => -calcNoteWidth(d.title, 16) / 2)
          .attr("y", -300)
          .attr("fill", (d) => d.color);

        gEnter
          .append("text")
          .attr("y", -280)
          .attr("text-anchor", "middle")
          .attr("font-size", 16)
          .style("pointer-events", "none")
          .attr("fill", "#fff")
          .text((d) => d.title);

        return gEnter;
      },
      (update) => {
        update
          .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
          .select("text")
          .text((d) => d.title);

        update
          .select("rect")
          .attr("width", (d) => calcNoteWidth(d.title, 16))
          .attr("x", (d) => -calcNoteWidth(d.title, 16) / 2);
        return update;
      },
      (exit) => exit.remove()
    );

  svg.selectAll<SVGGElement, GroupTitleNode>("g.groupTitle").raise();
}

export function renderGroupNotes(
  svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
  groupNoteNodes: GroupNoteNode[],
  groupNoteDrag: d3.DragBehavior<
    SVGGElement,
    GroupNoteNode,
    GroupNoteNode | d3.SubjectPosition
  >
) {
  svg
    .selectAll<SVGGElement, GroupNoteNode>("g.groupNote")
    .data(groupNoteNodes, (d: GroupNoteNode) => d.id)
    .join(
      (enter) => {
        const gEnter = enter
          .append("g")
          .attr("class", "groupNote drop-shadow-xl")
          .attr("transform", (d) => `translate(${d.x}, ${d.y})`)
          .call(groupNoteDrag);

        gEnter
          .append("rect")
          .attr("class", "opacity-80 stroke-2 stroke-gray-300")
          .attr("width", (d) => calcNoteWidth(d.note, 16))
          .attr("height", 34)
          .attr("rx", 5)
          .attr("ry", 5)
          .attr("x", (d) => -calcNoteWidth(d.note, 16) / 2)
          .attr("y", 30)
          .attr("fill", (d) => d.color);

        gEnter
          .append("text")
          .attr("y", 55)
          .attr("text-anchor", "middle")
          .attr("font-size", 16)
          .style("pointer-events", "none")
          .attr("fill", "#fff")
          .text((d) => d.note);

        return gEnter;
      },
      (update) => {
        update.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
        update.select("text").text((d) => d.note);

        update
          .select("rect")
          .attr("width", (d) => calcNoteWidth(d.note, 16))
          .attr("x", (d) => -calcNoteWidth(d.note, 16) / 2);
        return update;
      },
      (exit) => exit.remove()
    );
  svg.selectAll<SVGGElement, GroupNoteNode>("g.groupNote").raise();
}
