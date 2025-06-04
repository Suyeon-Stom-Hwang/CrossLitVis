export interface Paper {
  id: string;
  title: string;
  note: string | undefined;
  author: string;
  year: number;
  groupIds: string[];
  citationIds: string[];
}
