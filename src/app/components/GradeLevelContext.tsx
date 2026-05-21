import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

/* ================================================================
   GRADE LEVEL CONTEXT
   Lưu cấp học học sinh đang demo — dùng toàn cục cho mọi trang
   (StudentHome, Schedule, Lessons, Exams, Achievements…)
   ================================================================ */

export type GradeLevel = "mamnon" | "tieuhoc" | "thcs" | "thpt";

export const GRADE_LEVEL_META: Record<GradeLevel, {
  label: string; age: string; emoji: string; color: string; bg: string; short: string;
}> = {
  mamnon:  { label: "Mầm Non",  age: "3–5 tuổi",   emoji: "🌈", color: "#FF6B35", bg: "#FFF0E6", short: "MN"  },
  tieuhoc: { label: "Tiểu Học", age: "6–10 tuổi",  emoji: "⭐", color: "#2563EB", bg: "#DBEAFE", short: "TH"  },
  thcs:    { label: "THCS",     age: "11–14 tuổi", emoji: "🚀", color: "#7c3aed", bg: "#EDE9FE", short: "THCS"},
  thpt:    { label: "THPT",     age: "15–18 tuổi", emoji: "🎓", color: "#1E40AF", bg: "#DBEAFE", short: "THPT"},
};

interface GradeLevelContextType {
  level: GradeLevel;
  setLevel: (l: GradeLevel) => void;
  meta: typeof GRADE_LEVEL_META[GradeLevel];
}

const GradeLevelContext = createContext<GradeLevelContextType>({
  level: "thcs",
  setLevel: () => {},
  meta: GRADE_LEVEL_META.thcs,
});

export function GradeLevelProvider({ children }: { children: ReactNode }) {
  const [level, setLevelState] = useState<GradeLevel>("thcs");

  const setLevel = useCallback((l: GradeLevel) => {
    setLevelState(l);
  }, []);

  return (
    <GradeLevelContext.Provider value={{ level, setLevel, meta: GRADE_LEVEL_META[level] }}>
      {children}
    </GradeLevelContext.Provider>
  );
}

export function useGradeLevel() {
  return useContext(GradeLevelContext);
}
