import {
  createContext,
  useEffect,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type {
  GroupBubbleNode,
  GroupNoteNode,
  GroupTitleNode,
  PaperNode,
  PaperNoteNode,
  VisNodeBase,
  VisNodeType,
} from "../types/VisNode";
import { usePaperContext } from "./PaperContext";
import { useGroupContext } from "./GroupContext";
import type { Group } from "../types/Group";
import * as BubbleSets from "bubblesets-js";
import { calcNoteWidth } from "../utils/StyleManager";

type NodeManagerContextType = {
  nodes: {
    paperNodes: PaperNode[];
    paperNoteNodes: PaperNoteNode[];
    groupNoteNodes: GroupNoteNode[];
    groupTitleNodes: GroupTitleNode[];
    groupBubbleNodes: GroupBubbleNode[];
  };
  getNodeByRefId(refId: string, type: VisNodeType): VisNodeBase | undefined;
  updateNodePosition(id: string, x: number, y: number): void;
};

function getBubblePathCenter(path: BubbleSets.PointPath): [number, number] {
  let x = 0;
  let y = 0;

  for (let i = 0; i < path.length; i++) {
    const point = path.get(i);
    x += point.x;
    y += point.y;
  }

  return [x / path.length, y / path.length];
}

function getBubblePathBounds(path: BubbleSets.PointPath): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} {
  let left = Infinity,
    right = -Infinity,
    top = Infinity,
    bottom = -Infinity;

  for (let i = 0; i < path.length; i++) {
    const point = path.get(i);
    left = Math.min(left, point.x);
    right = Math.max(right, point.x);
    top = Math.min(top, point.y);
    bottom = Math.max(bottom, point.y);
  }

  return {
    left,
    right,
    top,
    bottom,
  };
}

const NodeManagerContext = createContext<NodeManagerContextType | undefined>(
  undefined
);
export const VisNodeProvider = ({ children }: { children: ReactNode }) => {
  const paperCtx = usePaperContext();
  const groupCtx = useGroupContext();

  const [paperNodes, setPaperNodes] = useState<PaperNode[]>([]);
  const [paperNoteNodes, setPaperNoteNodes] = useState<PaperNoteNode[]>([]);
  const [groupNoteNodes, setGroupNoteNodes] = useState<GroupNoteNode[]>([]);
  const [groupTitleNodes, setGroupTitleNodes] = useState<GroupTitleNode[]>([]);
  const [groupBubbleNodes, setGroupBubbleNodes] = useState<GroupBubbleNode[]>(
    []
  );

  const getDepth = useCallback(
    (group: Group, depth: number = 0): number => {
      let maxDepth = depth;
      group.subGroupIds.forEach((subGroupId) => {
        const subGroup = groupCtx.getGroupById(subGroupId);
        if (subGroup) {
          const subDepth = getDepth(subGroup, depth + 1);
          maxDepth = Math.max(maxDepth, subDepth);
        }
      });
      return maxDepth;
    },
    [groupCtx.getGroupById]
  );

  const createBubblePath = useCallback(
    (group: Group) => {
      const bubbleSets = new BubbleSets.BubbleSets();
      const depth = getDepth(group);

      const pushPaperNodeIntoBubble = (paperId: string) => {
        const paper = paperCtx.getPaperById(paperId);
        const paperNode = paperNodes.find((node) => node.refId === paperId);
        if (!paperNode || !paper) {
          return;
        }

        const width = calcNoteWidth(paper.title, 12);
        const height = 60;
        const margin = 40 + 60 * depth;

        bubbleSets.pushMember(
          BubbleSets.rect(
            paperNode.x - width / 2 - margin / 2,
            paperNode.y - 30 - margin / 2,
            width + margin,
            height + margin
          )
        );
      };

      group.paperIds.forEach((paperId) => pushPaperNodeIntoBubble(paperId));
      const subGroupIds = [...group.subGroupIds];
      while (subGroupIds.length > 0) {
        const subGroupId = subGroupIds.shift();
        if (!subGroupId) continue;

        const subGroup = groupCtx.getGroupById(subGroupId);
        if (!subGroup) {
          console.error(`Sub-group with ID ${subGroupId} not found.`);
          continue;
        }
        subGroup.paperIds.forEach((paperId) =>
          pushPaperNodeIntoBubble(paperId)
        );
        subGroupIds.push(...subGroup.subGroupIds);
      }

      return {
        path: bubbleSets.compute().sample(10).simplify(0).bSplines().simplify(),
        depth,
      };
    },
    [
      paperNodes,
      paperCtx.getPaperById,
      groupCtx.getGroupById,
      getDepth,
    ]
  );

  useEffect(() => {
    setPaperNodes((prevPaperNodes) => {
      const newPaperNodes = paperCtx.papers
        .filter(
          (paper) => !prevPaperNodes.some((node) => node.refId === paper.id)
        )
        .map(
          (paper) =>
            ({
              id: crypto.randomUUID(),
              refId: paper.id,
              x: Math.random() * 800, // Random position for demo
              y: Math.random() * 800,
              color: groupCtx.getGroupByPaperId(paper.id)?.color ?? "#ccc",
              title: paper.title,
              type: "paper",
            } as PaperNode)
        );

      const updatedPaperNodes = prevPaperNodes
        .filter((node) => paperCtx.getPaperById(node.refId))
        .map((node) => {
          const paper = paperCtx.getPaperById(node.refId);
          const group = groupCtx.getGroupByPaperId(node.refId);
          if (!paper) {
            console.error(`Paper not found for node with refId: ${node.refId}`);
            return node;
          }

          return paper.title !== node.title ||
            (group && group.color !== node.color)
            ? {
                ...node,
                color: group?.color ?? node.color,
                title: paper?.title ?? node.title,
              }
            : node;
        });
      return newPaperNodes.concat(updatedPaperNodes);
    });
  }, [paperCtx.papers, groupCtx.getGroupByPaperId, paperCtx.getPaperById]);

  useEffect(() => {
    setPaperNoteNodes((prevPaperNoteNodes) => {
      const newPaperNotes = paperCtx.papers
        .filter(
          (paper) =>
            paper.note &&
            !prevPaperNoteNodes.some((node) => node.refId === paper.id)
        )
        .map((paper) => {
          const paperNode = paperNodes.find((node) => node.refId === paper.id);
          return {
            id: crypto.randomUUID(),
            refId: paper.id,
            x: paperNode?.x ?? Math.random() * 800,
            y: paperNode?.y ?? Math.random() * 800,
            color: groupCtx.getGroupByPaperId(paper.id)?.color ?? "#fff",
            note: paper.note,
            type: "paperNote",
          } as PaperNoteNode;
        });

      const updatedPaperNotes = prevPaperNoteNodes
        .filter((node) => paperCtx.getPaperById(node.refId)?.note)
        .map((node) => {
          const paper = paperCtx.getPaperById(node.refId);
          const group = groupCtx.getGroupByPaperId(node.refId);
          if (!paper || !paper.note) {
            console.error(`Paper not found for node with refId: ${node.refId}`);
            return node;
          }

          const paperNode = paperNodes.find((node) => node.refId === paper.id);
          return paper.note !== node.note ||
            (group && group.color !== node.color) ||
            (paperNode && (paperNode?.x !== node.x || paperNode?.y !== node.y))
            ? {
                ...node,
                x: paperNode?.x ?? node.x,
                y: paperNode?.y ?? node.y,
                note: paper.note,
                color: group?.color ?? node.color,
              }
            : node;
        });

      return newPaperNotes.concat(updatedPaperNotes);
    });
  }, [
    paperCtx.papers,
    paperNodes,
    groupCtx.getGroupByPaperId,
    paperCtx.getPaperById,
  ]);

  useEffect(() => {
    setGroupBubbleNodes((prevGroupBubbleNodes) => {
      const newGroupBubbles = groupCtx.groups
        .filter(
          (group) =>
            !prevGroupBubbleNodes.some((node) => node.refId === group.id) &&
            group.paperIds.length > 0
        )
        .map((group) => {
          const bubblePath = createBubblePath(group);
          return {
            id: crypto.randomUUID(),
            refId: group.id,
            x: 0,
            y: 0,
            color: group.color ?? "#ccc",
            type: "groupBubble",
            path: bubblePath.path,
            depth: bubblePath.depth,
          } as GroupBubbleNode;
        });

      const updatedGroupBubbles = prevGroupBubbleNodes
        .filter((node) => {
          const group = groupCtx.getGroupById(node.refId);
          return group !== undefined && group.paperIds.length > 0;
        })
        .map((node) => {
          const group = groupCtx.getGroupById(node.refId);
          if (!group) {
            console.error(`Group not found for node with refId: ${node.refId}`);
            return node;
          }

          const bubblePath = createBubblePath(group);
          return {
            ...node,
            color: group.color ?? node.color,
            path: bubblePath.path,
            depth: bubblePath.depth,
          };
        });

      const bubbleNodes = newGroupBubbles.concat(updatedGroupBubbles);
      bubbleNodes.sort((a, b) => b.depth - a.depth);

      return bubbleNodes;
    });
  }, [groupCtx.groups, createBubblePath, groupCtx.getGroupById]);

  useEffect(() => {
    setGroupTitleNodes((prevGroupTitleNodes) => {
      const newGroupTitles = groupCtx.groups
        .filter(
          (group) =>
            !prevGroupTitleNodes.some((node) => node.refId === group.id) &&
            group.paperIds.length > 0
        )
        .map((group) => {
          const groupBubbleNode = groupBubbleNodes.find(
            (node) => node.refId === group.id
          );

          const center =
            groupBubbleNode && getBubblePathCenter(groupBubbleNode.path);

          return {
            id: crypto.randomUUID(),
            refId: group.id,
            x: center ? center[0] : Math.random() * 800, // Random position for demo
            y: center ? center[1] : Math.random() * 800,
            color: group.color,
            type: "groupTitle",
            title: group.title,
          } as GroupTitleNode;
        });

      const updatedGroupTitles = prevGroupTitleNodes
        .filter((node) => {
          const group = groupCtx.getGroupById(node.refId);
          return group !== undefined && group.paperIds.length > 0;
        })
        .map((node) => {
          const group = groupCtx.getGroupById(node.refId);
          if (!group) {
            console.error(`Group not found for node with refId: ${node.refId}`);
            return node;
          }

          const groupBubbleNode = groupBubbleNodes.find(
            (node) => node.refId === group.id
          );

          const center =
            groupBubbleNode && getBubblePathCenter(groupBubbleNode.path);

          return group.title !== node.title ||
            (center && (node.x !== center[0] || node.y !== center[1]))
            ? {
                ...node,
                title: group.title,
                x: center ? center[0] : node.x,
                y: center ? center[1] : node.y,
              }
            : node;
        });

      return newGroupTitles.concat(updatedGroupTitles);
    });
  }, [groupCtx.groups, groupBubbleNodes, groupCtx.getGroupById]);

  useEffect(() => {
    setGroupNoteNodes((prevGroupNoteNodes) => {
      const newGroupNotes = groupCtx.groups
        .filter(
          (group) =>
            group.note &&
            group.paperIds.length > 0 &&
            !prevGroupNoteNodes.some((node) => node.refId === group.id)
        )
        .map((group) => {
          const groupBubbleNode = groupBubbleNodes.find(
            (node) => node.refId === group.id
          );

          const center =
            groupBubbleNode && getBubblePathCenter(groupBubbleNode.path);
          console.log(
            `Creating new group note for group ${group.id} at center: ${center}`
          );
          return {
            id: crypto.randomUUID(),
            refId: group.id,
            x: center ? center[0] : Math.random() * 800, // Random position for demo
            y: center ? center[1] : Math.random() * 800,
            color: group.color ?? "#ccc",
            type: "groupNote",
            note: group.note,
          } as GroupNoteNode;
        });

      const updatedGroupNotes = prevGroupNoteNodes
        .filter((node) => {
          const group = groupCtx.getGroupById(node.refId);
          return group !== undefined && group.paperIds.length > 0 && group.note;
        })
        .map((node) => {
          const group = groupCtx.getGroupById(node.refId);
          if (!group || !group.note) {
            console.error(`Group not found for node with refId: ${node.refId}`);
            return node;
          }

          const groupBubbleNode = groupBubbleNodes.find(
            (node) => node.refId === group.id
          );

          const center =
            groupBubbleNode && getBubblePathCenter(groupBubbleNode.path);

          return group.note !== node.note ||
            (center && (node.x !== center[0] || node.y !== center[1]))
            ? {
                ...node,
                note: group.note,
                x: center ? center[0] : node.x,
                y: center ? center[1] : node.y,
              }
            : node;
        });

      return newGroupNotes.concat(updatedGroupNotes);
    });
  }, [groupCtx.groups, groupBubbleNodes, groupCtx.getGroupById]);

  const getNodeByRefId = useCallback(
    (refId: string, type: VisNodeType): VisNodeBase | undefined => {
      switch (type) {
        case "paper":
          return paperNodes.find(
            (node) => node.refId === refId && node.type === "paper"
          );
        case "paperNote":
          return paperNoteNodes.find(
            (node) => node.refId === refId && node.type === "paperNote"
          );
        case "groupNote":
          return groupNoteNodes.find(
            (node) => node.refId === refId && node.type === "groupNote"
          );
        case "groupTitle":
          return groupTitleNodes.find(
            (node) => node.refId === refId && node.type === "groupTitle"
          );
        case "none":
        default:
          return undefined;
      }
    },
    [paperNodes, paperNoteNodes, groupNoteNodes, groupTitleNodes]
  );

  const updateNodePosition = (id: string, x: number, y: number) => {
    setPaperNodes((prevNodes) =>
      prevNodes.map((node) => (node.id === id ? { ...node, x, y } : node))
    );
  };

  return (
    <NodeManagerContext.Provider
      value={{
        getNodeByRefId,
        updateNodePosition,
        nodes: {
          paperNodes,
          paperNoteNodes,
          groupNoteNodes,
          groupTitleNodes,
          groupBubbleNodes,
        },
      }}
    >
      {children}
    </NodeManagerContext.Provider>
  );
};

export const useNodeManager = () => {
  const context = useContext(NodeManagerContext);
  if (!context) {
    throw new Error("useNodeManager must be used within a VisNodeProvider");
  }
  return context;
};
