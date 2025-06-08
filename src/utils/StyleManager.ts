import * as d3 from "d3";

import type {
  GroupBubbleNode,
  GroupNoteNode,
  GroupTitleNode,
  PaperNode,
  PaperNoteNode,
} from "../types/VisNode";
import type { Group } from "../types/Group";

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

export function highlightGroup(
  groupId: string,
  getGroupById: (id: string) => Group | undefined
) {
  const group = getGroupById(groupId);
  if (!group) return;

  const isInGroup = (paperId: string, group: Group) => {
    let inGroup = group.paperIds.includes(paperId);
    if (inGroup) return true;

    for (const subGroupId of group.subGroupIds) {
      const subGroup = getGroupById(subGroupId);
      if (subGroup && isInGroup(paperId, subGroup)) {
        return true;
      }
    }

    return false;
  };

  d3.selectAll<SVGPathElement, GroupBubbleNode>("path.bubble")
    .transition()
    .duration(200)
    .attr("opacity", (d) => (d.refId === group.id ? 0.7 : 0.2))
    .attr("stroke-width", (d) => (d.refId === group.id ? 6 : 1));

  d3.selectAll<SVGGElement, PaperNode>("g.node")
    .transition()
    .duration(200)
    .attr("opacity", (d) => (isInGroup(d.refId, group) ? 1 : 0.2))
    .select("rect")
    .attr("stroke-width", (d) => (isInGroup(d.refId, group) ? 3 : 1.5))
    .attr("filter", (d) =>
      group.paperIds.includes(d.refId)
        ? "drop-shadow(0 2px 10px rgba(0, 0, 0, 0.2))"
        : null
    );

  d3.selectAll<SVGGElement, PaperNoteNode>("g.paperNote")
    .transition()
    .duration(200)
    .attr("opacity", (d) => (isInGroup(d.refId, group) ? 1 : 0.2));

  d3.selectAll<SVGGElement, GroupNoteNode>("g.groupNote")
    .transition()
    .duration(200)
    .attr("opacity", (d) => (d.refId === group.id ? 1 : 0.2))
    .select("rect")
    .attr("stroke-width", (d) => (d.refId === group.id ? 3 : 1));

  d3.selectAll<SVGGElement, GroupTitleNode>("g.groupTitle")
    .transition()
    .duration(200)
    .attr("opacity", (d) => (d.refId === group.id ? 1 : 0.2))
    .select("rect")
    .attr("stroke-width", (d) => (d.refId === group.id ? 3 : 1));
}

export function resetHighlight() {
  d3.selectAll<SVGPathElement, GroupBubbleNode>("path.bubble")
    .transition()
    .duration(200)
    .attr("opacity", 0.5)
    .attr("stroke-width", 1);

  d3.selectAll<SVGGElement, PaperNode>("g.node")
    .transition()
    .duration(200)
    .attr("opacity", 1)
    .select("rect")
    .attr("stroke-width", 1.5)
    .attr("filter", null);

  d3.selectAll<SVGGElement, PaperNoteNode>("g.paperNote")
    .transition()
    .duration(200)
    .attr("opacity", 1);

  d3.selectAll<SVGGElement, GroupNoteNode>("g.groupNote")
    .transition()
    .duration(200)
    .attr("opacity", 1)
    .select("rect")
    .attr("stroke-width", 2);

  d3.selectAll<SVGGElement, GroupTitleNode>("g.groupTitle")
    .transition()
    .duration(200)
    .attr("opacity", 1)
    .select("rect")
    .attr("stroke-width", 2);
}
