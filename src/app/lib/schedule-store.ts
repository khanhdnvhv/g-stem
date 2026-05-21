import { scheduleEntries, type STEMScheduleEntry } from "../components/mock-data/index";

const KEY = "gstem_schedule_entries";

export function getStoredEntries(schoolId: string): STEMScheduleEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const all: STEMScheduleEntry[] = JSON.parse(raw);
      return all.filter((e) => e.schoolId === schoolId);
    }
  } catch {
    // fall through to mock data
  }
  return scheduleEntries.filter((e) => e.schoolId === schoolId);
}

export function saveEntries(schoolId: string, entries: STEMScheduleEntry[]): void {
  try {
    // Merge: keep other schools' entries, replace this school's
    let all: STEMScheduleEntry[] = [];
    const raw = localStorage.getItem(KEY);
    if (raw) {
      all = (JSON.parse(raw) as STEMScheduleEntry[]).filter((e) => e.schoolId !== schoolId);
    }
    localStorage.setItem(KEY, JSON.stringify([...all, ...entries]));
  } catch {
    // ignore write failures (private browsing, quota)
  }
}
