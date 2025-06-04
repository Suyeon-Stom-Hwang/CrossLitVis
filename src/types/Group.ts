export interface Group {
  id: string;
  title: string;
  color: string;
  note: string | undefined;
  parentGroupId: string | "root";
  subGroupIds: string[];
  paperIds: string[];
}
