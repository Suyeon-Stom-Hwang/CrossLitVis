import * as d3 from "d3";

import type {
  GroupBubbleNode,
  GroupNoteNode,
  GroupTitleNode,
} from "../types/VisNode";

export function calcNoteWidth(text: string, fontSize: number = 8): number {
  return (text.length * fontSize) / 2 + 20;
}

export function getGroupColor(depth: number): string {
  const colors = [
    "#FFDDC1", // Light Orange
    "#C1E1FF", // Light Blue
    "#D1C1FF", // Light Purple
    "#C1FFC1", // Light Green
    "#FFC1C1", // Light Red
  ];
  return colors[depth % colors.length];
}

export function getPaperColor(): string {
  return "#e0f2fe"; // Light Purple for papers
}

export function getPaperTitleColor(): string {
  return "#111827"; // White for paper titles
}

export function highlightGroup(groupId: string) {
  d3.selectAll<SVGPathElement, GroupBubbleNode>("path.bubble")
    .transition()
    .duration(200)
    .attr("opacity", (d) => (d.refId === groupId ? 0.7 : 0.2))
    .attr("stroke-width", (d) => (d.refId === groupId ? 6 : 1));

  // d3.selectAll<SVGGElement, PaperNode>("g.node")
  //   .transition()
  //   .duration(200)
  //   .attr("opacity", (d) => (d.paper.groupIds.includes(groupId) ? 1 : 0.2))
  //   .select("circle")
  //   .attr("stroke-width", (d) => (d.paper.groupIds.includes(groupId) ? 3 : 1));

  d3.selectAll<SVGGElement, GroupNoteNode>("g.groupNote")
    .transition()
    .duration(200)
    .attr("opacity", (d) => (d.refId === groupId ? 1 : 0.2))
    .select("rect")
    .attr("stroke-width", (d) => (d.refId === groupId ? 3 : 1));

  d3.selectAll<SVGGElement, GroupTitleNode>("g.groupTitle")
    .transition()
    .duration(200)
    .attr("opacity", (d) => (d.refId === groupId ? 1 : 0.2))
    .select("rect")
    .attr("stroke-width", (d) => (d.refId === groupId ? 3 : 1));
}
