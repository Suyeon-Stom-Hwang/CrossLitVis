import {
  createContext,
  useEffect,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Paper } from "../types/Paper";

type PaperContextType = {
  // Paper 관련
  papers: Paper[];
  addPaper: (paper: Paper) => void;
  removePaper: (id: string) => void;
  updatePaper: (paper: Paper) => void;
  getPaperById: (id: string) => Paper | undefined;
};

const PaperContext = createContext<PaperContextType | undefined>(undefined);
export const PaperProvider = ({
  path,
  children,
}: {
  path?: string;
  children: ReactNode;
}) => {
  const [papers, setPapers] = useState<Paper[]>([]);

  useEffect(() => {
    if (path) {
      console.log("Loading papers and groups data from:", path);
      fetch(path)
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (!data) return;
          setPapers(data.papers || []);
        })
        .catch((error) => {
          console.error("Error loading literature data:", error);
        });
    }
  }, [path]);

  // Paper 관련
  const addPaper = (paper: Paper) => {
    setPapers((prev) => [...prev, paper]);
  };

  const removePaper = (paperId: string) => {
    setPapers((prev) => prev.filter((paper) => paper.id !== paperId));
  };

  const updatePaper = (paper: Paper) => {
    setPapers((prev) =>
      prev.map((p) => (p.id === paper.id ? { ...paper } : p))
    );
  };

  const getPaperById = useCallback(
    (id: string): Paper | undefined => {
      return papers.find((paper) => paper.id === id);
    },
    [papers]
  );

  return (
    <PaperContext.Provider
      value={{
        // Paper 관련
        papers,
        addPaper,
        removePaper,
        updatePaper,
        getPaperById,
      }}
    >
      {children}
    </PaperContext.Provider>
  );
};

export const usePaperContext = () => {
  const context = useContext(PaperContext);
  if (!context) {
    throw new Error("usePaper must be used within a PaperProvider");
  }
  return context;
};
