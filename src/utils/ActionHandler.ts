import type { DataManagerContextType } from "../contexts/DataManagerContext";

export type ActionType =
  | "block_add"
  | "block_split"
  | "move_to_named_section"
  | "create_subsection"
  | "move_blocks_between_sections";
export type ActionPayload =
  | BlockAddPayload
  | BlockSplitPayload
  | MoveToNamedSectionPayload
  | CreateSubsectionPayload
  | MoveBlocksBetweenSectionsPayload;

export interface Action {
  type: ActionType;
  payload: ActionPayload;
}

export interface BlockAddPayload {
  paperId: string;
  sectionId: string;
  content: string;
}

export interface BlockAddAction extends Action {
  type: "block_add";
  payload: BlockAddPayload;
}

export interface BlockSplitPayload {
  originalBlockId: string;
  newBlockIds: string[];
  splitPosition: number;
}

export interface BlockSplitAction extends Action {
  type: "block_split";
  payload: BlockAddPayload;
}

export interface MoveToNamedSectionPayload {
  blockIds: string[];
  fromSectionId: string;
  toSectionId: string;
  sectionTitle: string;
}

export interface MoveToNamedSectionAction extends Action {
  type: "move_to_named_section";
  payload: MoveToNamedSectionPayload;
}

export interface CreateSubsectionPayload {
  blockIds: string[];
  parentSectionId: string;
  subsectionId: string;
  subsectionTitle: string;
  insertPosition: number;
}

export interface CreateSubsectionAction extends Action {
  type: "create_subsection";
  payload: CreateSubsectionPayload;
}

export interface MoveBlocksBetweenSectionsPayload {
  blockIds: string[];
  fromSectionId: string;
  toSectionId: string;
}

export interface MoveBlocksBetweenSectionsAction extends Action {
  type: "move_blocks_between_sections";
  payload: MoveBlocksBetweenSectionsPayload;
}

export function handleAction(
  action: Action,
  dataManager: DataManagerContextType
): void {
  switch (action.type) {
    case "block_add":
      handleBlockAdd(action.payload as BlockAddPayload, dataManager);
      break;
    case "block_split":
      handleBlockSplit(action.payload as BlockSplitPayload, dataManager);
      break;
    case "move_to_named_section":
      handleMoveToNamedSection(
        action.payload as MoveToNamedSectionPayload,
        dataManager
      );
      break;
    case "create_subsection":
      handleCreateSubsection(
        action.payload as CreateSubsectionPayload,
        dataManager
      );
      break;
    case "move_blocks_between_sections":
      handleMoveBlocksBetweenSections(
        action.payload as MoveBlocksBetweenSectionsPayload,
        dataManager
      );
      break;
    default:
      console.warn("Unknown action type:", action.type);
  }
}

function handleBlockAdd(
  payload: BlockAddPayload,
  dataManager: DataManagerContextType
): void {
  const { paperId, sectionId: groupId, content: note } = payload;
  // Implement logic to add a block to the specified section in the paper
  console.log(`Adding block to paper ${paperId} in section ${groupId}:`, note);

  dataManager.movePapersIntoGroup([paperId], groupId);
  dataManager.updatePaperNote(paperId, note);
}

function handleBlockSplit(
  payload: BlockSplitPayload,
  dataManager: DataManagerContextType
): void {
  const { originalBlockId, newBlockIds, splitPosition } = payload;
  // Implement logic to split a block into multiple blocks
  console.log(
    `Splitting block ${originalBlockId} into ${newBlockIds.join(
      ", "
    )} at position ${splitPosition}`
  );
  // This would typically involve updating the paper's structure
}

function handleMoveToNamedSection(
  payload: MoveToNamedSectionPayload,
  dataManager: DataManagerContextType
): void {
  const { blockIds, fromSectionId, toSectionId, sectionTitle } = payload;
  // Implement logic to move blocks to a named section
  console.log(
    `Moving blocks ${blockIds.join(
      ", "
    )} from section ${fromSectionId} to section ${toSectionId} titled "${sectionTitle}"`
  );
  // This would typically involve updating the paper's structure
  dataManager.removePapersFromGroup(
    blockIds, // Assuming the first block's paperId is used for the move
    fromSectionId
  );
  dataManager.movePapersIntoGroup(
    blockIds, // Assuming the first block's paperId is used for the move
    toSectionId
  );
}

function handleCreateSubsection(
  payload: CreateSubsectionPayload,
  dataManager: DataManagerContextType
): void {
  const {
    blockIds,
    parentSectionId,
    subsectionId,
    subsectionTitle,
    insertPosition,
  } = payload;

  // Implement logic to create a subsection with the specified blocks
  console.log(
    `Creating subsection ${subsectionId} titled "${subsectionTitle}" in section ${parentSectionId} at position ${insertPosition} with blocks ${blockIds.join(
      ", "
    )}`
  );

  // This would typically involve updating the paper's structure
  dataManager.newGroupWithPapers(
    subsectionId,
    subsectionTitle,
    parentSectionId,
    blockIds
  );
}

function handleMoveBlocksBetweenSections(
  payload: MoveBlocksBetweenSectionsPayload,
  dataManager: DataManagerContextType
): void {
  const { blockIds, fromSectionId, toSectionId } = payload;
  // Implement logic to move blocks between sections
  console.log(
    `Moving blocks ${blockIds.join(
      ", "
    )} from section ${fromSectionId} to section ${toSectionId}`
  );
  // This would typically involve updating the paper's structure
}
