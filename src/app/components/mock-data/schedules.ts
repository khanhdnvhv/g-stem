import type { STEMScheduleEntry, StemProgram } from "./types";
import { tenantsByType } from "./tenants";

/* ================================================================ */
/*  TYPES                                                            */
/* ================================================================ */

/**
 * Tiết học thông thường (non-STEM) import từ K12Online / VnEdu.
 * Per AD-03: TKB tổng được import 1-chiều từ K12/VnEdu vào STEM Platform.
 */
export interface RegularEntry {
  id: string;
  teacherId: string;
  classId: string;
  className: string;
  subject: string;
  weekday: number;  // 1=Thứ 2 … 6=Thứ 7
  period: number;   // 1-10
  source: "k12online" | "vnEdu";
  syncedAt: string; // ISO timestamp
}

/* ================================================================ */
/*  STEM SCHEDULE — generic (all teachers / all schools)             */
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
  { id: "R-STEM-3", name: "Phòng Robotic" },
];

export const scheduleEntries: STEMScheduleEntry[] = [];

let idx = 1;
for (const school of schools) {
  for (const cls of CLASSES_PER_SCHOOL) {
    for (let weekday = 1; weekday <= 5; weekday++) {
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
        roomId: ROOMS[idx % ROOMS.length].id,
        roomName: ROOMS[idx % ROOMS.length].name,
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

/* ================================================================ */
/*  Phạm Anh Tuấn (U-TCH-01) — GV Toán, THCS Ba Vì                 */
/*                                                                   */
/*  Theo BR-03:                                                      */
/*  • CT1/CT2 = chính khóa → buổi sáng T1-T6, đè lên tiết Toán     */
/*  • CT3     = buổi 2     → buổi chiều T7-T10, tiết bổ sung        */
/*  • CT4     = tăng cường → linh hoạt sáng hoặc chiều              */
/*  • CT5     = CLB        → KHÔNG xếp TKB, chỉ booking phòng       */
/* ================================================================ */

const SCH_BAVI = schools[0]?.id || "SCH-001";
const SYNC_AT  = "2026-05-18T06:30:00Z";

/* ── STEM entries ── */
const TCH01_STEM: Omit<STEMScheduleEntry, "id">[] = [

  /* Thứ 2 — CT1 chính khóa buổi sáng (T2, T3) */
  { schoolId: SCH_BAVI, classId: `${SCH_BAVI}-C2`, className: "Lớp 7A",  teacherId: "U-TCH-01", teacherName: "Phạm Anh Tuấn", programCode: "CT1", subject: "Toán", roomId: "R-STEM-1", roomName: "Phòng STEM 1", weekday: 1, period: 2, dateFrom: "2026-03-01T00:00:00Z", dateTo: "2026-06-30T00:00:00Z" },
  { schoolId: SCH_BAVI, classId: `${SCH_BAVI}-C3`, className: "Lớp 8A",  teacherId: "U-TCH-01", teacherName: "Phạm Anh Tuấn", programCode: "CT1", subject: "Toán", roomId: "R-STEM-2", roomName: "Phòng STEM 2", weekday: 1, period: 4, dateFrom: "2026-03-01T00:00:00Z", dateTo: "2026-06-30T00:00:00Z" },

  /* Thứ 3 — CT2 chính khóa buổi sáng (T1, T3) */
  { schoolId: SCH_BAVI, classId: `${SCH_BAVI}-C4`, className: "Lớp 9A",  teacherId: "U-TCH-01", teacherName: "Phạm Anh Tuấn", programCode: "CT2", subject: "Toán", roomId: "R-STEM-1", roomName: "Phòng STEM 1", weekday: 2, period: 1, dateFrom: "2026-03-01T00:00:00Z", dateTo: "2026-06-30T00:00:00Z" },
  { schoolId: SCH_BAVI, classId: `${SCH_BAVI}-C1`, className: "Lớp 6A",  teacherId: "U-TCH-01", teacherName: "Phạm Anh Tuấn", programCode: "CT1", subject: "Toán", roomId: "R-STEM-2", roomName: "Phòng STEM 2", weekday: 2, period: 4, dateFrom: "2026-03-01T00:00:00Z", dateTo: "2026-06-30T00:00:00Z" },

  /* Thứ 4 — CT3 buổi 2 chiều (T7, T8) — BUỔI 2, KHÔNG phải sáng */
  { schoolId: SCH_BAVI, classId: `${SCH_BAVI}-C2`, className: "Lớp 7A",  teacherId: "U-TCH-01", teacherName: "Phạm Anh Tuấn", programCode: "CT3", subject: "Toán", roomId: "R-STEM-1", roomName: "Phòng STEM 1", weekday: 3, period: 7, dateFrom: "2026-03-01T00:00:00Z", dateTo: "2026-06-30T00:00:00Z" },
  { schoolId: SCH_BAVI, classId: `${SCH_BAVI}-C3`, className: "Lớp 8A",  teacherId: "U-TCH-01", teacherName: "Phạm Anh Tuấn", programCode: "CT3", subject: "Đổi mới sáng tạo", roomId: "R-STEM-2", roomName: "Phòng STEM 2", weekday: 3, period: 8, dateFrom: "2026-03-01T00:00:00Z", dateTo: "2026-06-30T00:00:00Z" },

  /* Thứ 5 — CT1 sáng (T1, T4) + CT4 tăng cường sáng (T3) */
  { schoolId: SCH_BAVI, classId: `${SCH_BAVI}-C4`, className: "Lớp 9A",  teacherId: "U-TCH-01", teacherName: "Phạm Anh Tuấn", programCode: "CT1", subject: "Toán", roomId: "R-STEM-1", roomName: "Phòng STEM 1", weekday: 4, period: 1, dateFrom: "2026-03-01T00:00:00Z", dateTo: "2026-06-30T00:00:00Z" },
  { schoolId: SCH_BAVI, classId: `${SCH_BAVI}-C1`, className: "Lớp 6A",  teacherId: "U-TCH-01", teacherName: "Phạm Anh Tuấn", programCode: "CT4", subject: "Robotic", roomId: "R-STEM-3", roomName: "Phòng Robotic", weekday: 4, period: 3, dateFrom: "2026-03-01T00:00:00Z", dateTo: "2026-06-30T00:00:00Z" },
  { schoolId: SCH_BAVI, classId: `${SCH_BAVI}-C2`, className: "Lớp 7A",  teacherId: "U-TCH-01", teacherName: "Phạm Anh Tuấn", programCode: "CT2", subject: "Toán", roomId: "R-STEM-1", roomName: "Phòng STEM 1", weekday: 4, period: 5, dateFrom: "2026-03-01T00:00:00Z", dateTo: "2026-06-30T00:00:00Z" },

  /* Thứ 6 — CT2 sáng (T2) + CT4 chiều (T8 tăng cường) */
  { schoolId: SCH_BAVI, classId: `${SCH_BAVI}-C4`, className: "Lớp 9A",  teacherId: "U-TCH-01", teacherName: "Phạm Anh Tuấn", programCode: "CT2", subject: "Toán", roomId: "R-STEM-1", roomName: "Phòng STEM 1", weekday: 5, period: 2, dateFrom: "2026-03-01T00:00:00Z", dateTo: "2026-06-30T00:00:00Z" },
  { schoolId: SCH_BAVI, classId: `${SCH_BAVI}-C3`, className: "Lớp 8A",  teacherId: "U-TCH-01", teacherName: "Phạm Anh Tuấn", programCode: "CT4", subject: "AI & Lập trình", roomId: "R-STEM-3", roomName: "Phòng Robotic", weekday: 5, period: 8, dateFrom: "2026-03-01T00:00:00Z", dateTo: "2026-06-30T00:00:00Z" },

  /* CT5 — CLB/ngoại khóa, isClub=true, period dùng 0 để filter riêng */
  /* Những entries này SẼ KHÔNG hiện trong grid — chỉ hiện ở CLB section */
  { schoolId: SCH_BAVI, classId: `${SCH_BAVI}-C1`, className: "Lớp 6A",  teacherId: "U-TCH-01", teacherName: "Phạm Anh Tuấn", programCode: "CT5", subject: "Nghiên cứu khoa học", roomId: "R-STEM-2", roomName: "Phòng STEM 2", weekday: 5, period: 0, dateFrom: "2026-03-01T00:00:00Z", dateTo: "2026-06-30T00:00:00Z", isClub: true, note: "CLB NCKH — Thứ 6, 15:00-17:00" },
  { schoolId: SCH_BAVI, classId: `${SCH_BAVI}-C3`, className: "Lớp 8A",  teacherId: "U-TCH-01", teacherName: "Phạm Anh Tuấn", programCode: "CT5", subject: "Nghiên cứu khoa học", roomId: "R-STEM-2", roomName: "Phòng STEM 2", weekday: 6, period: 0, dateFrom: "2026-03-01T00:00:00Z", dateTo: "2026-06-30T00:00:00Z", isClub: true, note: "CLB NCKH — Thứ 7, 8:00-10:00" },

  /* CT4 CLB — Thứ 7 buổi chiều */
  { schoolId: SCH_BAVI, classId: `${SCH_BAVI}-C4`, className: "Lớp 9A",  teacherId: "U-TCH-01", teacherName: "Phạm Anh Tuấn", programCode: "CT4", subject: "Robotic nâng cao", roomId: "R-STEM-3", roomName: "Phòng Robotic", weekday: 6, period: 0, dateFrom: "2026-03-01T00:00:00Z", dateTo: "2026-06-30T00:00:00Z", isClub: true, note: "CLB Robotic — Thứ 7, 13:00-15:00" },
];

let stemIdx = 5000;
for (const entry of TCH01_STEM) {
  scheduleEntries.push({ ...entry, id: `SCH-TCH01-${String(stemIdx++).padStart(4, "0")}` });
}

/* ── Regular (non-STEM) entries for U-TCH-01 — từ K12Online ── */
/* Theo AD-03: import 1-chiều, STEM Platform là consumer          */
export const regularEntries: RegularEntry[] = [

  /* Thứ 2 */
  { id: "REG-101", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C2`, className: "Lớp 7A", subject: "Toán", weekday: 1, period: 1, source: "k12online", syncedAt: SYNC_AT },
  // period 2 → CT1 STEM overlay (chính khóa - cùng tiết)
  { id: "REG-102", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C2`, className: "Lớp 7A", subject: "Toán", weekday: 1, period: 2, source: "k12online", syncedAt: SYNC_AT },
  { id: "REG-103", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C1`, className: "Lớp 6A", subject: "Toán", weekday: 1, period: 3, source: "k12online", syncedAt: SYNC_AT },
  // period 4 → CT1 STEM overlay (chính khóa - cùng tiết, Lớp 8A)
  { id: "REG-104", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C3`, className: "Lớp 8A", subject: "Toán", weekday: 1, period: 4, source: "k12online", syncedAt: SYNC_AT },
  { id: "REG-105", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C4`, className: "Lớp 9A", subject: "Toán", weekday: 1, period: 6, source: "k12online", syncedAt: SYNC_AT },

  /* Thứ 3 */
  // period 1 → CT2 STEM overlay (chính khóa - cùng tiết, Lớp 9A)
  { id: "REG-201", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C4`, className: "Lớp 9A", subject: "Toán", weekday: 2, period: 1, source: "k12online", syncedAt: SYNC_AT },
  { id: "REG-202", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C2`, className: "Lớp 7A", subject: "Toán", weekday: 2, period: 2, source: "k12online", syncedAt: SYNC_AT },
  { id: "REG-203", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C3`, className: "Lớp 8A", subject: "Toán", weekday: 2, period: 3, source: "k12online", syncedAt: SYNC_AT },
  // period 4 → CT1 STEM overlay (chính khóa - cùng tiết, Lớp 6A)
  { id: "REG-204", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C1`, className: "Lớp 6A", subject: "Toán", weekday: 2, period: 4, source: "k12online", syncedAt: SYNC_AT },
  { id: "REG-205", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C4`, className: "Lớp 9A", subject: "Toán", weekday: 2, period: 6, source: "k12online", syncedAt: SYNC_AT },

  /* Thứ 4 — buổi sáng regular (không có STEM sáng), buổi chiều CT3 bổ sung */
  { id: "REG-301", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C1`, className: "Lớp 6A", subject: "Toán", weekday: 3, period: 2, source: "k12online", syncedAt: SYNC_AT },
  { id: "REG-302", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C4`, className: "Lớp 9A", subject: "Toán", weekday: 3, period: 4, source: "k12online", syncedAt: SYNC_AT },
  { id: "REG-303", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C2`, className: "Lớp 7A", subject: "Toán", weekday: 3, period: 5, source: "k12online", syncedAt: SYNC_AT },
  // T7, T8 là CT3 buổi 2 — KHÔNG có regular (tiết bổ sung của STEM)

  /* Thứ 5 */
  // period 1 → CT1 STEM overlay (chính khóa, Lớp 9A)
  { id: "REG-401", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C4`, className: "Lớp 9A", subject: "Toán", weekday: 4, period: 1, source: "k12online", syncedAt: SYNC_AT },
  { id: "REG-402", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C1`, className: "Lớp 6A", subject: "Toán", weekday: 4, period: 2, source: "k12online", syncedAt: SYNC_AT },
  // period 3 → CT4 tăng cường overlay (Lớp 6A - Robotic)
  { id: "REG-403", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C1`, className: "Lớp 6A", subject: "Tin học", weekday: 4, period: 3, source: "k12online", syncedAt: SYNC_AT },
  // period 5 → CT2 STEM overlay (chính khóa, Lớp 7A)
  { id: "REG-404", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C2`, className: "Lớp 7A", subject: "Toán", weekday: 4, period: 5, source: "k12online", syncedAt: SYNC_AT },
  { id: "REG-405", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C3`, className: "Lớp 8A", subject: "Toán", weekday: 4, period: 6, source: "k12online", syncedAt: SYNC_AT },

  /* Thứ 6 */
  { id: "REG-501", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C3`, className: "Lớp 8A", subject: "Toán", weekday: 5, period: 1, source: "k12online", syncedAt: SYNC_AT },
  // period 2 → CT2 STEM overlay (chính khóa, Lớp 9A)
  { id: "REG-502", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C4`, className: "Lớp 9A", subject: "Toán", weekday: 5, period: 2, source: "k12online", syncedAt: SYNC_AT },
  { id: "REG-503", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C2`, className: "Lớp 7A", subject: "Toán", weekday: 5, period: 4, source: "k12online", syncedAt: SYNC_AT },
  { id: "REG-504", teacherId: "U-TCH-01", classId: `${SCH_BAVI}-C1`, className: "Lớp 6A", subject: "Toán", weekday: 5, period: 5, source: "k12online", syncedAt: SYNC_AT },
  // period 8 chiều → CT4 tăng cường (Lớp 8A), không có regular đây

  /* Thứ 7 — không có regular, chỉ CLB (CT4/CT5) */
];
