import type { PointPath } from "bubblesets-js";

export type VisNodeType =
  | "paper"
  | "paperNote"
  | "groupTitle"
  | "groupNote"
  | "groupBubble"
  | "none";

export interface VisNodeBase {
  id: string;
  refId: string;
  x: number;
  y: number;
  color: string;
  type: VisNodeType;
}

export interface PaperNode extends VisNodeBase {
  title: string;
  type: "paper";
}

export interface PaperNoteNode extends VisNodeBase {
  note: string;
  type: "paperNote";
}

export interface GroupTitleNode extends VisNodeBase {
  title: string;
  type: "groupTitle";
}

export interface GroupNoteNode extends VisNodeBase {
  note: string;
  type: "groupNote";
}

export interface GroupBubbleNode extends VisNodeBase {
  path: PointPath;
  depth: number;
  type: "groupBubble";
}

export type VisNode =
  | PaperNode
  | PaperNoteNode
  | GroupTitleNode
  | GroupNoteNode;
