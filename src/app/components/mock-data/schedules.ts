import type { STEMScheduleEntry, StemProgram } from "./types";
import { tenantsByType } from "./tenants";

/* ================================================================ */
/*  STEM SCHEDULE — ~300 entries                                     */
/* ================================================================ */

const schools = tenantsByType.school;
const PROGRAMS: StemProgram[] = ["CT1", "CT2", "CT3", "CT4", "CT5"];
const SUBJECTS = ["Toán", "Lý", "Hóa", "Sinh", "Tin học", "Công nghệ", "Robotic", "AI"];

const CLASSES_PER_SCHOOL = [
  { id: "C1", name: "Lớp 6A" },
  { id: "C2", name: "Lớp 7A" },
  { id: "C3", name: "Lớp 8A" },
  { id: "C4", name: "Lớp 9A" },
];

const ROOMS = [
  { id: "R-STEM-1", name: "Phòng STEM 1" },
  { id: "R-STEM-2", name: "Phòng STEM 2" },
];

export const scheduleEntries: STEMScheduleEntry[] = [];

let idx = 1;
for (const school of schools) {
  for (const cls of CLASSES_PER_SCHOOL) {
    for (let weekday = 1; weekday <= 5; weekday++) {
      // Mỗi lớp có 1-2 tiết STEM/tuần
      if ((weekday + idx) % 3 === 0) continue;
      const program = PROGRAMS[idx % PROGRAMS.length];
      scheduleEntries.push({
        id: `SCH-${String(idx).padStart(5, "0")}`,
        schoolId: school.id,
        classId: `${school.id}-${cls.id}`,
        className: cls.name,
        teacherId: `U-TCH-${String((idx % 10) + 1).padStart(2, "0")}`,
        teacherName: `GV STEM ${(idx % 10) + 1}`,
        programCode: program,
        subject: SUBJECTS[idx % SUBJECTS.length],
        roomId: ROOMS[idx % 2].id,
        roomName: ROOMS[idx % 2].name,
        weekday,
        period: (idx % 6) + 1,
        dateFrom: "2026-03-01T00:00:00Z",
        dateTo: "2026-06-30T00:00:00Z",
        isClub: idx % 11 === 0,
      });
      idx++;
    }
  }
}
