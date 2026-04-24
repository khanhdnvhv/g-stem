import type { CatalogItem, DataSyncRecord } from "./types";
import { SUBJECTS, GRADE_LEVELS } from "./constants";

/* ================================================================ */
/*  DANH MỤC DÙNG CHUNG                                              */
/* ================================================================ */

export const catalogs: CatalogItem[] = [
  ...SUBJECTS.map((s, i) => ({
    id: `CAT-SUB-${i + 1}`, catalog: "subject" as const,
    code: `SUB-${i + 1}`, name: s,
  })),
  ...GRADE_LEVELS.map((g, i) => ({
    id: `CAT-GRA-${i + 1}`, catalog: "grade" as const,
    code: `GRA-${i + 1}`, name: g,
  })),
  { id: "CAT-SKILL-1", catalog: "skill", code: "SK-CREA", name: "Sáng tạo" },
  { id: "CAT-SKILL-2", catalog: "skill", code: "SK-CRIT", name: "Tư duy phản biện" },
  { id: "CAT-SKILL-3", catalog: "skill", code: "SK-COLL", name: "Hợp tác" },
  { id: "CAT-SKILL-4", catalog: "skill", code: "SK-COMM", name: "Giao tiếp" },
  { id: "CAT-SKILL-5", catalog: "skill", code: "SK-PROB", name: "Giải quyết vấn đề" },
  { id: "CAT-SKILL-6", catalog: "skill", code: "SK-ENG",  name: "Tư duy kỹ sư" },
];

/* ================================================================ */
/*  DATA SYNC RECORDS                                                */
/* ================================================================ */
const SOURCES = ["NEdu", "VNeID", "ERP", "CRM"] as const;
const ENTITIES = [
  "students", "teachers", "schools", "equipment",
  "licenses", "orders", "exam-results", "procurement",
];
const STATUSES: DataSyncRecord["status"][] = ["queued", "running", "done", "error"];

export const dataSyncRecords: DataSyncRecord[] = Array.from({ length: 20 }, (_, i) => {
  const source = SOURCES[i % SOURCES.length];
  const status = STATUSES[i % STATUSES.length];
  const startedAt = new Date(Date.now() - (20 - i) * 3600_000).toISOString();
  const finishedAt = status === "done" || status === "error"
    ? new Date(Date.parse(startedAt) + 15 * 60_000).toISOString()
    : undefined;
  return {
    id: `DSR-${String(i + 1).padStart(4, "0")}`,
    source,
    direction: i % 2 === 0 ? "out" : "in",
    entity: ENTITIES[i % ENTITIES.length],
    count: 100 + (i * 37) % 9000,
    startedAt,
    finishedAt,
    status,
    quality4D: {
      dung: status !== "error",
      du: status === "done",
      sach: status === "done" && i % 4 !== 0,
      song: status === "running" || status === "done",
    },
    note: status === "error" ? "Trùng khóa định danh VNeID" : undefined,
  };
});
