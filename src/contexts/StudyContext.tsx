import { createContext, useContext, useMemo, useState, ReactNode, useCallback } from "react";

export interface StudyContextValue {
  grade: number | null;
  subjectId: string | null;
  subjectName: string | null;
  topicTitle: string | null;
  setStudyContext: (ctx: Partial<Omit<StudyContextValue, "setStudyContext" | "clearTopic">>) => void;
  clearTopic: () => void;
}

const StudyCtx = createContext<StudyContextValue | undefined>(undefined);

export const StudyProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState({
    grade: null as number | null,
    subjectId: null as string | null,
    subjectName: null as string | null,
    topicTitle: null as string | null,
  });

  const setStudyContext = useCallback((ctx: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...ctx }));
  }, []);

  const clearTopic = useCallback(() => {
    setState((prev) => ({ ...prev, topicTitle: null }));
  }, []);

  const value = useMemo(
    () => ({ ...state, setStudyContext, clearTopic }),
    [state, setStudyContext, clearTopic]
  );

  return <StudyCtx.Provider value={value}>{children}</StudyCtx.Provider>;
};

export const useStudyContext = () => {
  const ctx = useContext(StudyCtx);
  if (!ctx) throw new Error("useStudyContext must be used within StudyProvider");
  return ctx;
};
