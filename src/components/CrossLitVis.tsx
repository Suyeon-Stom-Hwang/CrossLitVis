import Graph from "./Graph";
import { DataManagerProvider } from "../contexts/DataManagerContext";
import { GroupProvider } from "../contexts/GroupContext";
import { PaperProvider } from "../contexts/PaperContext";
import { VisNodeProvider } from "../contexts/NodeManagerContext";
import { type Action } from "../utils/ActionHandler";

interface CrossLitVisProps {
  path?: string;
  action?: Action;
  onAction?: (action: any) => void;
}

export default function CrossLitVis({
  path,
  action,
  onAction,
}: CrossLitVisProps) {
  return (
    <PaperProvider path={path}>
      <GroupProvider path={path}>
        <DataManagerProvider>
          <VisNodeProvider>
            <Graph action={action} onAction={onAction} />
          </VisNodeProvider>
        </DataManagerProvider>
      </GroupProvider>
    </PaperProvider>
  );
}
