import { useState } from "react";
import "./App.css";
import CrossLitVis from "./components/CrossLitVis";
import type { Action, BlockAddAction } from "./utils/ActionHandler";

function App() {
  const [action, setAction] = useState<Action | undefined>(undefined);

  return (
    <div className="flex flex-row items-center justify-center h-full">
      <CrossLitVis path="/sample.json" action={action} />
      <div className="flex flex-col gap-2">
        <button
          className="bg-blue-600 text-white text-sm font-bold px-3 rounded w-fit h-9 whitespace-nowrap justify-center"
          onClick={() => {
            setAction({
              type: "block_add",
              payload: {
                paperId: "lit_5",
                sectionId: "sec_4",
                content: "New note content",
              },
            } as BlockAddAction);
          }}
        >
          add new note
        </button>
        <button
          className="bg-blue-600 text-white text-sm font-bold px-3 rounded w-fit h-9 whitespace-nowrap justify-center"
          onClick={() => {
            setAction({
              type: "create_subsection",
              payload: {
                blockIds: ["lit_9", "lit_10"],
                parentSectionId: "sec_1",
                subsectionId: "sec_6",
                subsectionTitle: "Computer Vision Applications",
                insertPosition: 3,
              },
            });
          }}
        >
          create subsection
        </button>
        <button
          className="bg-blue-600 text-white text-sm font-bold px-3 rounded w-fit h-9 whitespace-nowrap justify-center"
          onClick={() => {
            setAction({
              type: "create_subsection",
              payload: {
                blockIds: ["lit_9", "lit_10"],
                parentSectionId: "root",
                subsectionId: "sec_7",
                subsectionTitle: "Computer Vision Applications",
                insertPosition: 3,
              },
            });
          }}
        >
          create section
        </button>
      </div>
    </div>
  );
}

export default App;
