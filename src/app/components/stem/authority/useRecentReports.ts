import { useState, useCallback } from "react";

export interface RecentReport {
  id: string;
  name: string;
  templateCode: string;
  generatedAt: string;
  scope: string;
  period: string;
}

const MAX = 10;

function key(userId: string) {
  return `recentReports_${userId}`;
}

function load(userId: string): RecentReport[] {
  try {
    const raw = localStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as RecentReport[]) : [];
  } catch {
    return [];
  }
}

function save(userId: string, reports: RecentReport[]) {
  try {
    localStorage.setItem(key(userId), JSON.stringify(reports));
  } catch {}
}

export function useRecentReports(userId: string) {
  const [reports, setReports] = useState<RecentReport[]>(() => load(userId));

  const addReport = useCallback(
    (entry: Omit<RecentReport, "id" | "generatedAt">) => {
      setReports(prev => {
        const next: RecentReport = {
          ...entry,
          id: `DL-${Date.now()}`,
          generatedAt: new Date().toISOString(),
        };
        const updated = [next, ...prev.filter(r => r.name !== entry.name)].slice(0, MAX);
        save(userId, updated);
        return updated;
      });
    },
    [userId],
  );

  return { reports, addReport };
}
