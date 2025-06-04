import { useCallback, useState } from "react";

import ConfirmableInput from "./ConfirmableInput";
import { useGroupContext } from "../contexts/GroupContext";
import type { PopupType } from "../types/Popup";
import { usePaperContext } from "../contexts/PaperContext";
import type { Paper } from "../types/Paper";
import type { Group } from "../types/Group";

export default function NoteEditingPopup({
  id,
  onClose,
  type,
}: {
  id: string;
  onClose: () => void;
  type: PopupType;
}) {
  const groupCtx = useGroupContext();
  const paperCtx = usePaperContext();

  const reference =
    type === "paperNote"
      ? paperCtx.getPaperById(id)
      : type === "groupNote"
      ? groupCtx.getGroupById(id)
      : undefined;

  if (reference === undefined) {
    return (
      <div>
        {`Invalid type for NotePopup. Expected 'paperNote' or 'groupNote', but received: ${type}`}
      </div>
    );
  }

  const [note, setNote] = useState(reference.note ?? "");

  const updateNote = useCallback(() => {
    if (type === "paperNote") {
      reference.note = note || "";
      paperCtx.updatePaper(reference as Paper);
    } else if (type === "groupNote") {
      reference.note = note || "";
      groupCtx.updateGroup(reference as Group);
    }
  }, [reference, paperCtx, groupCtx]);

  return (
    <div className="flex flex-col gap-2">
      <ConfirmableInput
        title=""
        value={note}
        onChange={setNote}
        onConfirm={() => {
          updateNote();
          onClose();
        }}
        onCancel={() => {
          setNote(reference.note ?? "");
          onClose();
        }}
        placeholder="Enter notes"
      />
    </div>
  );
}
