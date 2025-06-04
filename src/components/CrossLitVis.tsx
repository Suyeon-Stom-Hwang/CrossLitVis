import { GroupProvider } from "../contexts/GroupContext";
import { PaperProvider } from "../contexts/PaperContext";
import { DataManagerProvider } from "../contexts/DataManagerContext";
import { VisNodeProvider } from "../contexts/NodeManagerContext";
import Graph from "./Graph";

export default function CrossLitVis({ path }: { path?: string }) {
  return (
    <PaperProvider path={path}>
      <GroupProvider path={path}>
        <DataManagerProvider>
          <VisNodeProvider>
            <Graph />
          </VisNodeProvider>
        </DataManagerProvider>
      </GroupProvider>
    </PaperProvider>
  );
}
