import { Fragment, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Popover, PopoverPanel, Transition } from "@headlessui/react";

import { useGroupContext } from "../contexts/GroupContext";
import { useNodeManager } from "../contexts/NodeManagerContext";
import PaperPopup from "./PaperPopup";
import GroupPopup from "./GroupPopup";
import NoteEditingPopup from "./NoteEditingPopup";
import {
  calcNoteWidth,
  highlightGroup,
  resetHighlight,
} from "../utils/StyleManager";
import * as PaperRenderer from "../utils/PaperRenderer";
import * as GroupRenderer from "../utils/GroupRenderer";
import { handleAction, type Action } from "../utils/ActionHandler";

import type { PopupType } from "../types/Popup";
import type { GroupNoteNode, PaperNode, PaperNoteNode } from "../types/VisNode";
import { useDataManager } from "../contexts/DataManagerContext";

interface GraphProps {
  action?: Action;
  onAction?: (action: any) => void;
}

/* ── 컴포넌트 ── */
export default function Graph({ action }: GraphProps) {
  const groupCtx = useGroupContext();
  const nodeManager = useNodeManager();
  const dataManager = useDataManager();

  const [highlihtedGroup, setHighlightedGroup] = useState<string | null>(null);
  const [requestedAction, setRequestedAction] = useState<Action | null>(null);

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
        d3.select(this).raise().select("rect").attr("stroke", "black");
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
        nodeManager.updateNodePosition(d.id, d.x, d.y);
      })
      .on("end", function (event, d) {
        d3.select(this).select("rect").attr("stroke", null);

        const [sx, sy] = (this as any)._start as [number, number];
        const [ex, ey] = d3.pointer(event, svg.node());
        if (Math.hypot(ex - sx, ey - sy) < 2) {
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
        nodeManager.updateNodePosition(d.id, event.x, event.y);
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
      nodeManager.nodes.groupBubbleNodes,
      (event, d) => {
        const group = groupCtx.getGroupById(d.refId);
        if (group) {
          openPopup("group", event.clientX, event.clientY, group.id);
          event.stopPropagation();
        }
        setHighlightedGroup(d.refId);
      },
      (_, d) => {
        setHighlightedGroup(d.refId);
      },
      (_, d) => {
        setHighlightedGroup(null);
      }
    );

    PaperRenderer.renderPapers(svg, nodeManager.nodes.paperNodes, paperDrag);

    const handleDoubleClick = (event: MouseEvent, d: PaperNoteNode) => {
      const paperNode = nodeManager.getNodeByRefId(
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
      nodeManager.nodes.paperNoteNodes,
      handleDoubleClick
    );

    GroupRenderer.renderGroupTitles(svg, nodeManager.nodes.groupTitleNodes);
    GroupRenderer.renderGroupNotes(
      svg,
      nodeManager.nodes.groupNoteNodes,
      groupNoteDrag
    );

    /** 빈 곳(svg 자체) 클릭 → 팝업 닫기 */
    svg.on("click", function (event) {
      if (event.target === this) {
        closePopups();
      }
      setHighlightedGroup(null);
    });
  }, [groupCtx.getGroupById, nodeManager]);

  useEffect(() => {
    if (!highlihtedGroup) {
      resetHighlight();
    } else {
      highlightGroup(highlihtedGroup, groupCtx.getGroupById);
    }
  }, [highlihtedGroup, groupCtx.getGroupById]);

  useEffect(() => {
    if (action) {
      setRequestedAction(action);
    }
  }, [action]);

  useEffect(() => {
    if (requestedAction) {
      handleAction(requestedAction, dataManager);
      setRequestedAction(null);
    }
  }, [requestedAction, dataManager]);

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
