import { useCallback, useEffect, useState } from "react";
import ConfirmableInput from "./ConfirmableInput";
import { useGroupContext } from "../contexts/GroupContext";
import { useDataManager } from "../contexts/DataManagerContext";

export default function GroupPopup({
  groupId,
  onClose,
}: {
  groupId: string;
  onClose: () => void;
}) {
  const groupCtx = useGroupContext();
  const dataManager = useDataManager();

  const group = groupCtx.getGroupById(groupId);

  const [note, setNote] = useState(group?.note ?? "");
  const [title, setTitle] = useState(group?.title ?? "");

  const addNote = useCallback(() => {
    if (group) {
      group.note = note ?? "";
      groupCtx.updateGroup(group);
    }
  }, [group, note, groupCtx]);

  useEffect(() => {
    setNote(group?.note ?? "");
    setTitle(group?.title ?? "");
  }, [group, groupCtx]);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text font-semibold text-gray-800 mb-1">
        {group?.title || "Untitled Group"}
      </h3>
      <ConfirmableInput
        title="Title"
        value={title}
        onChange={setTitle}
        onConfirm={() => groupCtx.updateGroupTitle(groupId, title)}
        onCancel={() => setTitle(groupCtx.getGroupById(groupId)?.title || "")}
        placeholder="Enter title"
      />
      <ConfirmableInput
        title="Notes"
        value={note}
        onChange={setNote}
        onConfirm={() => addNote()}
        onCancel={() => setNote(group?.note ?? "")}
        placeholder="Enter notes"
      />
      <div className="flex flex-row gap-2 items-center">
        <button
          className="bg-green-600 text-white text-sm font-bold px-3 rounded w-fit h-9 whitespace-nowrap justify-center"
          onClick={() => {
            dataManager.deleteGroup(groupId);
            onClose();
          }}
        >
          Delete Group
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
