import {
  createContext,
  useEffect,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Group } from "../types/Group";

type GroupContextType = {
  // Group 관련
  groups: Group[];
  rootGroup: Group;
  addGroup: (group: Group) => void;
  removeGroup: (id: string) => void;
  getGroupById: (id: string) => Group | undefined;
  getGroupByPaperId: (paperId: string) => Group | undefined;
  updateGroup: (group: Group) => void;
  removePaperFromGroup: (paperId: string, groupId: string) => void;
  updateGroupTitle: (groupId: string, title: string) => void;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);
export const GroupProvider = ({
  path,
  children,
}: {
  path?: string;
  children: ReactNode;
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [rootGroup, setRootGroup] = useState<Group>({
    id: "root",
    title: "root",
    color: "fff",
    note: undefined,
    parentGroupId: "root",
    subGroupIds: [],
    paperIds: [],
  });

  useEffect(() => {
    if (path) {
      console.log("Loading papers and groups data from:", path);
      fetch(path)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (!data) return;
          data.groups.forEach((group: Group) => {
            group.parentGroupId = group.parentGroupId || "root";
          });
          setGroups(data.groups || []);
          setRootGroup((prevRootGroup) => ({
            ...prevRootGroup,
            subGroupIds: (data.groups || [])
              .filter((grp: Group) => grp.parentGroupId === "root")
              .map((grp: Group) => grp.id),
          }));
        })
        .catch((error) => {
          console.error("Error loading literature data:", error);
        });
    }
  }, [path]);

  // Group 관련
  const addGroup = (group: Group) => {
    setGroups((prev) =>
      prev
        .map((g) => {
          if (g.id === group.parentGroupId) {
            return {
              ...g,
              subGroupIds: [...g.subGroupIds, group.id],
            };
          } else {
            return g;
          }
        })
        .concat([group])
    );

    if (group.parentGroupId === "root") {
      // If the group is a root group, add it to the rootGroup's subGroupIds
      setRootGroup((prevRootGroup) => ({
        ...prevRootGroup,
        subGroupIds: [...prevRootGroup.subGroupIds, group.id],
      }));
    }
  };

  const removeGroup = useCallback(
    (id: string) => {
      const group = groups.find((g) => g.id === id);
      if (!group) {
        console.error(`Group with ID ${id} not found.`);
        return;
      }

      if (group.parentGroupId === "root") {
        setRootGroup((prevRootGroup) => ({
          ...prevRootGroup,
          subGroupIds: prevRootGroup.subGroupIds
            .filter((gid) => gid !== id)
            .concat(group.subGroupIds),
        }));
      }
      setGroups((prev) => prev.filter((group) => group.id !== id));
    },
    [groups]
  );

  const updateGroup = (group: Group) => {
    if (group.id === "root") {
      setRootGroup({ ...group });
    } else {
      setGroups((prev) =>
        prev.map((g) => (g.id === group.id ? { ...g, ...group } : g))
      );
    }
  };

  const getGroupById = useCallback(
    (id: string): Group | undefined => {
      return id === "root"
        ? rootGroup
        : groups.find((group) => group.id === id);
    },
    [groups, rootGroup]
  );

  const getGroupByPaperId = useCallback(
    (paperId: string): Group | undefined => {
      return groups.find((group) => group.paperIds.includes(paperId));
    },
    [groups]
  );

  const removePaperFromGroup = (paperId: string, groupId: string) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              paperIds: group.paperIds.filter((id) => id !== paperId),
            }
          : group
      )
    );
  };

  const updateGroupTitle = (groupId: string, title: string) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId ? { ...group, title } : group
      )
    );
  };

  return (
    <GroupContext.Provider
      value={{
        // Group 관련
        groups,
        rootGroup,
        addGroup,
        removeGroup,
        getGroupById,
        getGroupByPaperId,
        updateGroup,
        removePaperFromGroup,
        updateGroupTitle,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroupContext = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
};
