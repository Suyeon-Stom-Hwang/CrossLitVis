import { Checkbox } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";

import { useGroupContext } from "../contexts/GroupContext";
import { useEffect, useState } from "react";
import { usePaperContext } from "../contexts/PaperContext";

export default function GroupItem({
  groupId,
  onClick,
  paperId,
}: {
  groupId: string;
  onClick: (groupId: string) => void;
  paperId: string;
}) {
  const paperCtx = usePaperContext();
  const groupCtx = useGroupContext();

  const paper = paperCtx.getPaperById(paperId); // Ensure paper is of type Paper
  const group = groupCtx.getGroupById(groupId); // If you have getGroupById, use that instead]
  const [enabled, setEnabled] = useState(paper?.groupIds.includes(groupId));

  useEffect(() => {
    if (paper) {
      setEnabled(paper.groupIds.includes(groupId));
    }
  }, [paper, groupId]);

  return (
    <div className="flex flex-col text-sm ">
      {group && (
        <>
          <div className="flex flex-row gap-2 min-w-30 h-6 items-center">
            <Checkbox
              checked={enabled}
              onChange={() => {
                onClick(groupId);
                setEnabled((prev) => !prev);
              }}
              className="group size-5 rounded-md bg-gray-300 p-1 ring-2 ring-gray-50 ring-inset focus:not-data-focus:outline-none data-checked:bg-white data-checked:ring-gray-300 data-focus:outline data-focus:outline-offset-2 data-focus:outline-white"
            >
              <CheckIcon className="hidden size-3 stroke-4 stroke-gray-600 group-data-checked:block" />
            </Checkbox>
            <h4 className="text-sm text-gray-800 font-semibold">
              {group.title}
            </h4>
          </div>
          {group.subGroupIds.length > 0 && (
            <div className="flex flex-col ml-6">
              {group.subGroupIds.map((subGroupId) => (
                <GroupItem
                  key={subGroupId}
                  groupId={subGroupId}
                  onClick={onClick}
                  paperId={paperId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
