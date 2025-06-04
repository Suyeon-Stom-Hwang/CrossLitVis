import { useRef, useEffect, useState, Fragment } from "react";
import * as d3 from "d3";
import { Popover, PopoverPanel, Transition } from "@headlessui/react";

import { useGroupContext } from "../contexts/GroupContext";
import PaperPopup from "./PaperPopup";
import GroupPopup from "./GroupPopup";
import NoteEditingPopup from "./NoteEditingPopup";
import { highlightGroup } from "../utils/StyleManager";
import * as PaperRenderer from "../utils/PaperRenderer";
import * as GroupRenderer from "../utils/GroupRenderer";

import type { PopupType } from "../types/Popup";
import type {
  VisNodeBase,
  PaperNode,
  PaperNoteNode,
  GroupNoteNode,
  GroupBubbleNode,
} from "../types/VisNode";
import { useNodeManager } from "../contexts/NodeManagerContext";

function calcNoteWidth(text: string, fontSize: number = 8): number {
  return (text.length * fontSize) / 2 + 20;
}

/* ── 컴포넌트 ── */
export default function Graph() {
  const groupCtx = useGroupContext();
  const visNodesCtx = useNodeManager();

  const [highlihtedGroup, setHighlightedGroup] = useState<string | null>(null);

  const W = 1000,
    H = 1000;

  const svgRef = useRef<SVGSVGElement | null>(null);

  const [popup, setPopup] = useState<{
    show: boolean;
    x: number;
    y: number;
    id: string;
    type: PopupType;
  }>({
    show: false,
    x: 0,
    y: 0,
    id: "",
    type: "none",
  });

  useEffect(() => {
    const svg = d3.select(svgRef.current).attr("width", W).attr("height", H);
    const paperDrag = d3
      .drag<SVGGElement, PaperNode>()
      .on("start", function (event) {
        closePopups();
        (this as any)._start = d3.pointer(event, svg.node());
        d3.select(this).raise().select("circle").attr("stroke", "black");
      })
      .on("drag", function (event, d) {
        // Clamp x and y to stay within SVG bounds
        const rw = calcNoteWidth(d.title, 12) / 2;
        const rh = 30;
        const minX = rw,
          maxX = W - rw;
        const minY = rh,
          maxY = H - rh;
        d.x = Math.max(minX, Math.min(event.x, maxX));
        d.y = Math.max(minY, Math.min(event.y, maxY));
        d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
        visNodesCtx.updateNodePosition(d.id, d.x, d.y);
      })
      .on("end", function (event, d) {
        d3.select(this).select("circle").attr("stroke", null);

        const [sx, sy] = (this as any)._start as [number, number];
        const [ex, ey] = d3.pointer(event, svg.node());
        if (Math.hypot(ex - sx, ey - sy) < 6) {
          openPopup(
            "paper",
            event.sourceEvent.clientX,
            event.sourceEvent.clientY,
            d.refId
          );
        }
      });

    const groupNoteDrag = d3
      .drag<SVGGElement, GroupNoteNode>()
      .on("start", function (event) {
        closePopups();
        (this as any)._start = d3.pointer(event, svg.node());
      })
      .on("drag", function (event, d) {
        d3.select(this).attr("transform", `translate(${event.x},${event.y})`);
        visNodesCtx.updateNodePosition(d.id, event.x, event.y);
      })
      .on("end", function (event) {
        const [sx, sy] = (this as any)._start as [number, number];
        const [ex, ey] = d3.pointer(event, svg.node());
        if (Math.hypot(ex - sx, ey - sy) < 6) {
          event.preventDefault();
        }
      });

    GroupRenderer.renderGroupBubblePath(
      svg,
      visNodesCtx.nodes.groupBubbleNodes,
      (event, d) => {
        const group = groupCtx.getGroupById(d.refId);
        if (group) {
          openPopup("group", event.clientX, event.clientY, group.id);
          event.stopPropagation();
        }
        setHighlightedGroup(d.refId);
      }
    );

    PaperRenderer.renderPapers(svg, visNodesCtx.nodes.paperNodes, paperDrag);

    const handleDoubleClick = (event: MouseEvent, d: PaperNoteNode) => {
      const paperNode = visNodesCtx.getNodeByRefId(
        d.refId,
        "paper"
      ) as PaperNode;
      if (paperNode) {
        if (svgRef.current) {
          const rect = svgRef.current.getBoundingClientRect();
          const width = calcNoteWidth(d.note, 16);
          openPopup(
            "paperNote",
            rect.left + paperNode.x - width / 2 - 10,
            rect.top + paperNode.y + 15,
            d.refId
          );
        }
        event.stopPropagation();
      }
    };

    PaperRenderer.renderPaperNotes(
      svg,
      visNodesCtx.nodes.paperNoteNodes,
      handleDoubleClick
    );

    GroupRenderer.renderGroupTitles(svg, visNodesCtx.nodes.groupTitleNodes);
    GroupRenderer.renderGroupNotes(
      svg,
      visNodesCtx.nodes.groupNoteNodes,
      groupNoteDrag
    );

    /** 빈 곳(svg 자체) 클릭 → 팝업 닫기 */
    svg.on("click", function (event) {
      if (event.target === this) {
        closePopups();
      }
      setHighlightedGroup(null);
    });
  }, [groupCtx.getGroupById, visNodesCtx]);

  useEffect(() => {
    if (!highlihtedGroup) {
      d3.selectAll<SVGPathElement, GroupBubbleNode>("path.bubble")
        .transition()
        .duration(200)
        .attr("opacity", 0.5)
        .attr("stroke-width", 1);
      d3.selectAll<SVGGElement, VisNodeBase>("g.node")
        .transition()
        .duration(200)
        .attr("opacity", 1)
        .select("circle")
        .attr("stroke-width", 1);
    } else {
      highlightGroup(highlihtedGroup);
    }
  }, [highlihtedGroup]);

  const openPopup = (type: PopupType, x: number, y: number, id: string) => {
    setPopup({
      show: true,
      x,
      y,
      id,
      type,
    });
  };

  const closePopups = () => {
    setPopup((prev) => ({
      ...prev,
      show: false,
    }));
  };

  return (
    <>
      <svg ref={svgRef} style={{ border: "1px solid #ccc" }} />

      <Popover
        as="div"
        className="fixed z-50"
        style={{ top: popup.y, left: popup.x }}
      >
        <Transition
          as={Fragment}
          show={popup.show}
          enter="transition ease-out duration-100 "
          enterFrom="opacity-0 scale-95 "
          enterTo="opacity-100 scale-100 "
          leave="transition ease-out duration-100 "
          leaveFrom="opacity-100 scale-100 "
          leaveTo="opacity-0 scale-95 "
        >
          <PopoverPanel
            static
            className="rounded-xl bg-gray-100 p-3 shadow-lg opacity-80 hover:opacity-100 transition-all duration-200 "
          >
            {popup.type === "paper" ? (
              <PaperPopup paperId={popup.id} onClose={() => closePopups()} />
            ) : popup.type === "group" ? (
              <GroupPopup groupId={popup.id} onClose={() => closePopups()} />
            ) : popup.type === "paperNote" ? (
              <NoteEditingPopup
                id={popup.id}
                onClose={() => closePopups()}
                type="paperNote"
              />
            ) : null}
          </PopoverPanel>
        </Transition>
      </Popover>
    </>
  );
}
