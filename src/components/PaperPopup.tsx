import { useCallback, useEffect, useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

import GroupItem from "./GroupItem";
import { usePaperContext } from "../contexts/PaperContext";
import ConfirmableInput from "./ConfirmableInput";
import { useGroupContext } from "../contexts/GroupContext";
import { useDataManager } from "../contexts/DataManagerContext";

export default function PaperPopup({
  paperId,
  onClose,
}: {
  paperId: string;
  onClose: () => void;
}) {
  const paperCtx = usePaperContext();
  const groupCtx = useGroupContext();
  const dataManager = useDataManager();

  const paper = paperCtx.getPaperById(paperId);

  const [isEditing, setIsEditing] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [note, setNote] = useState(paper?.note ?? "");

  const handleClick = useCallback(
    (groupId: string) => {
      const clickedGroup = groupCtx.getGroupById(groupId); // Ensure the group exists
      if (!clickedGroup || !paper) {
        console.error(`Group(${groupId}) or paper(${paperId}) not found`);
        return;
      }

      if (paper.groupIds.includes(groupId)) {
        paper.groupIds = paper.groupIds.filter((id) => id !== groupId);
        clickedGroup.paperIds = clickedGroup.paperIds.filter(
          (id) => id !== paper.id
        );
      } else {
        paper.groupIds.push(groupId);
        clickedGroup.paperIds.push(paper.id);
      }
      groupCtx.updateGroup(clickedGroup);
      paperCtx.updatePaper(paper);
    },
    [paper, paperCtx, groupCtx]
  );

  const addNote = useCallback(() => {
    if (paper) {
      paper.note = note ?? "";
      paperCtx.updatePaper(paper);
    }
  }, [paper, note, paperCtx]);

  useEffect(() => {
    setIsEditing(false);
    setNewGroupTitle("");
    setNote(paper?.note ?? "");
  }, [paper, paperCtx]);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text font-semibold text-gray-800 mb-1">{paper?.title}</h3>
      <ConfirmableInput
        title="Notes"
        value={note}
        onChange={setNote}
        onConfirm={() => addNote()}
        onCancel={() => setNote(paper?.note ?? "")}
        placeholder="Enter notes"
      />
      <div className="flex flex-row gap-2">
        <span className="text-gray-500 shrink-0 text w-14 text-left">
          Groups
        </span>
        <div className="flex flex-col">
          {groupCtx.getGroupById("root")?.subGroupIds.map((groupId) => (
            <GroupItem
              key={groupId}
              groupId={groupId} // If GroupItem expects sectionId, you may want to rename this prop to groupId in GroupItem as well
              onClick={handleClick}
              paperId={paperId}
            />
          ))}
          {isEditing ? (
            <ConfirmableInput
              value={newGroupTitle}
              placeholder="Enter group title"
              onChange={setNewGroupTitle}
              onConfirm={() => {
                if (newGroupTitle.trim() !== "") {
                  dataManager.newGroupWithPapers(
                    undefined,
                    newGroupTitle,
                    undefined,
                    [paperId]
                  );
                }
                setNewGroupTitle("");
                setIsEditing(false);
              }}
              onCancel={() => {
                setNewGroupTitle("");
                setIsEditing(false);
              }}
            />
          ) : (
            <button
              className="flex flex-row gap-2 h-6 w-fit pr-2 py-2 hover:bg-gray-200 rounded-full transition-all duration-100 items-center cursor-pointer"
              onClick={() => {
                setIsEditing(true);
                setNewGroupTitle("");
              }}
            >
              <div className="bg-gray-300 p-1 ring-2 ring-gray-50 rounded-full size-5 whitespace-nowrap justify-center">
                <PlusIcon className="size-3 stroke-4 stroke-gray-600" />
              </div>
              <span className="text-sm text-gray-800 font-semibold items-center">
                Add New Group
              </span>
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <button
          className="bg-green-600 text-white text-sm font-bold px-3 rounded w-fit h-9 whitespace-nowrap justify-center"
          onClick={() => {
            dataManager.deletePaper(paperId);
            onClose();
          }}
        >
          Delete Paper
        </button>
        <button
          className="bg-cyan-800 text-white text-sm font-bold px-3 rounded w-fit h-9 whitespace-nowrap justify-center"
          onClick={() => onClose()}
        >
          Close
        </button>
      </div>
    </div>
  );
}
