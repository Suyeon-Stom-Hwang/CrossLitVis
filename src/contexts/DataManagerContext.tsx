import { createContext, useCallback, useContext, type ReactNode } from "react";
import { useGroupContext } from "./GroupContext";
import { usePaperContext } from "./PaperContext";
import type { Group } from "../types/Group";

export type DataManagerContextType = {
  deletePaper: (paperId: string) => void;
  mergeGroups: (sourceGroupId: string, targetGroupId: string) => void;
  deleteGroup: (groupId: string) => void;
  movePapersIntoGroup: (paperIds: string[], groupId: string) => void;
  removePapersFromGroup: (paperIds: string[], groupId: string) => void;
  newGroupWithPapers: (
    groupId?: string,
    groupTitle?: string,
    parentGroupId?: string,
    paperIds?: string[]
  ) => void;
  updatePaperTitle?: (paperId: string, title: string) => void;
  updateGroupTitle?: (groupId: string, title: string) => void;
  updatePaperNote: (paperId: string, note: string) => void;
  updateGroupNote?: (groupId: string, note: string) => void;
};

const DataManagerContext = createContext<DataManagerContextType | undefined>(
  undefined
);
export const DataManagerProvider = ({ children }: { children: ReactNode }) => {
  const groupCtx = useGroupContext();
  const paperCtx = usePaperContext();

  const deletePaper = useCallback(
    (paperId: string) => {
      // Remove paper from all groups
      groupCtx.groups.forEach((group) => {
        if (group.paperIds.includes(paperId)) {
          groupCtx.removePaperFromGroup(paperId, group.id);
        }
      });

      paperCtx.removePaper(paperId);
    },
    [groupCtx, paperCtx]
  );

  const mergeGroups = useCallback(
    (sourceGroupId: string, targetGroupId: string) => {
      const sourceGroup = groupCtx.getGroupById(sourceGroupId);
      const targetGroup = groupCtx.getGroupById(targetGroupId);

      if (!sourceGroup || !targetGroup) {
        console.error("Invalid group IDs provided for merging.");
        return;
      }

      sourceGroup.paperIds.forEach((paperId) => {
        const paper = paperCtx.getPaperById(paperId);
        if (!paper) {
          console.error(`Paper with ID ${paperId} not found.`);
          return;
        }

        paper.groupIds = paper.groupIds.filter(
          (id) => id !== sourceGroupId && id !== targetGroupId
        );
        paper.groupIds.push(targetGroupId);
        targetGroup.paperIds.push(paperId);

        paperCtx.updatePaper(paper);
      });

      groupCtx.updateGroup(targetGroup);
      groupCtx.removeGroup(sourceGroupId);
    },
    [groupCtx, paperCtx]
  );

  const deleteGroup = useCallback(
    (groupId: string) => {
      const group = groupCtx.getGroupById(groupId);
      if (!group) {
        console.error(`Group with ID ${groupId} not found.`);
        return;
      }

      group.paperIds.forEach((paperId) => {
        const paper = paperCtx.getPaperById(paperId);
        if (!paper) {
          console.error(`Paper with ID ${paperId} not found.`);
          return;
        }

        paper.groupIds = paper.groupIds.filter((id) => id !== groupId);
        group.parentGroupId !== "root" &&
          paper.groupIds.push(group.parentGroupId);
        paperCtx.updatePaper(paper);
      });

      if (group.subGroupIds.length > 0) {
        group.subGroupIds.forEach((subGroupId) => {
          const subGroup = groupCtx.getGroupById(subGroupId);
          if (!subGroup) {
            console.error(`Sub-group with ID ${subGroupId} not found.`);
            group.subGroupIds = group.subGroupIds.filter(
              (id) => id !== subGroupId
            );
            return;
          }

          subGroup.parentGroupId = group.parentGroupId;
          groupCtx.updateGroup(subGroup);
        });
      }

      if (group.parentGroupId !== "root") {
        const parentGroup = groupCtx.getGroupById(group.parentGroupId);
        if (!parentGroup) {
          console.error(
            `Parent group with ID ${group.parentGroupId} not found.`
          );
          return;
        }
        parentGroup.subGroupIds = parentGroup.subGroupIds.filter(
          (id) => id !== groupId
        );
        parentGroup.subGroupIds.push(...group.subGroupIds);
        parentGroup.paperIds.push(...group.paperIds);
        groupCtx.updateGroup(parentGroup);
      }

      groupCtx.removeGroup(groupId);
    },
    [groupCtx, paperCtx]
  );

  const newGroupWithPapers = useCallback(
    (
      groupId?: string,
      groupTitle?: string,
      parentGroupId?: string,
      paperIds?: string[]
    ) => {
      // Generate a random hex color
      const randomColor =
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0");

      const newId =
        groupId && groupId !== "" && !groupCtx.getGroupById(groupId)
          ? groupId
          : `group-${Date.now()}`;

      const parentId =
        parentGroupId && groupCtx.getGroupById(parentGroupId)
          ? parentGroupId
          : "root";

      const newGroup: Group = {
        id: newId,
        title: groupTitle || "New Group",
        note: undefined,
        color: randomColor,
        parentGroupId: parentId,
        subGroupIds: [],
        paperIds: [],
      };

      paperIds?.forEach((paperId) => {
        const paper = paperCtx.getPaperById(paperId);
        if (paper) {
          newGroup.paperIds.push(paperId);
          paper.groupIds.push(newId);
          paperCtx.updatePaper(paper);
        }
      });
      groupCtx.addGroup(newGroup);
    },
    [
      paperCtx.getPaperById,
      paperCtx.updatePaper,
      groupCtx.addGroup,
      groupCtx.getGroupById,
    ]
  );

  const updatePaperNote = useCallback(
    (paperId: string, note: string) => {
      const paper = paperCtx.getPaperById(paperId);
      if (!paper) {
        console.error(`Paper with ID ${paperId} not found.`);
        return;
      }
      paper.note = note;
      paperCtx.updatePaper(paper);
    },
    [paperCtx.getPaperById, paperCtx.updatePaper]
  );

  const movePapersIntoGroup = useCallback(
    (paperIds: string[], groupId: string) => {
      const group = groupCtx.getGroupById(groupId);
      if (!group) {
        console.error(`Invalid group ID (${groupId}) provided.`);
        return;
      }

      paperIds.forEach((paperId) => {
        const paper = paperCtx.getPaperById(paperId);
        if (!paper) {
          return;
        }

        // Add paper to the new group
        !group.paperIds.includes(paperId) && group.paperIds.push(paperId);
        !paper.groupIds.includes(groupId) && paper.groupIds.push(groupId);
        paperCtx.updatePaper(paper);
      });

      groupCtx.updateGroup(group);
    },
    [
      paperCtx.getPaperById,
      paperCtx.updatePaper,
      groupCtx.getGroupById,
      groupCtx.updateGroup,
    ]
  );

  const removePapersFromGroup = useCallback(
    (paperIds: string[], groupId: string) => {
      const group = groupCtx.getGroupById(groupId);
      if (!group) {
        console.error(`Invalid group ID (${groupId}) provided.`);
        return;
      }

      paperIds.forEach((paperId) => {
        const paper = paperCtx.getPaperById(paperId);
        if (!paper) {
          console.error(`Paper with ID ${paperId} not found.`);
          return;
        }

        // Remove paper from the group
        group.paperIds = group.paperIds.filter((id) => id !== paperId);
        paper.groupIds = paper.groupIds.filter((id) => id !== groupId);
        paperCtx.updatePaper(paper);
      });

      groupCtx.updateGroup(group);
    },
    [
      paperCtx.getPaperById,
      paperCtx.updatePaper,
      groupCtx.getGroupById,
      groupCtx.updateGroup,
    ]
  );

  return (
    <DataManagerContext.Provider
      value={{
        deletePaper,
        mergeGroups,
        deleteGroup,
        movePapersIntoGroup,
        removePapersFromGroup,
        newGroupWithPapers,
        updatePaperNote,
      }}
    >
      {children}
    </DataManagerContext.Provider>
  );
};

export const useDataManager = () => {
  const context = useContext(DataManagerContext);
  if (!context) {
    throw new Error(
      "usePaperManager must be used within a PaperManagerProvider"
    );
  }
  return context;
};
