import { tenantsByType } from "./tenants";

/* ================================================================ */
/*  BASE TIMETABLE — TKB nền import từ K12Online/VnEdu              */
/*  Đây là TKB tổng (non-STEM) đã đồng bộ từ hệ thống bên ngoài.  */
/*  STEM Platform gắn tiết STEM lên trên lưới này.                  */
/* ================================================================ */

export interface BasePeriod {
  id: string;
  classId: string;
  className: string;
  subject: string;
  teacherName: string;
  weekday: number;  // 1=Thứ 2 … 6=Thứ 7
  period: number;   // 1-8
  schoolId: string;
  source: "k12online" | "vnedu" | "manual";
}

/* ── Khung giờ chuẩn ─────────────────────────────────────────── */
export const PERIOD_TIMES: Record<number, string> = {
  1: "7:00–7:45",
  2: "7:50–8:35",
  3: "8:40–9:25",
  4: "9:30–10:15",
  5: "10:20–11:05",
  6: "13:00–13:45",
  7: "13:50–14:35",
  8: "14:40–15:25",
};

export const MORNING_PERIODS = [1, 2, 3, 4, 5];   // chính khóa
export const AFTERNOON_PERIODS = [6, 7, 8];         // buổi 2

/* ── Dữ liệu môn học cho từng khối ─────────────────────────────── */
const SUBJECTS_BY_GRADE: Record<number, string[]> = {
  6: ["Toán", "Ngữ văn", "Tiếng Anh", "KHTN", "Lịch sử & ĐL", "GDCD", "Công nghệ", "Tin học", "Thể dục", "Âm nhạc", "Mĩ thuật"],
  7: ["Toán", "Ngữ văn", "Tiếng Anh", "KHTN", "Lịch sử & ĐL", "GDCD", "Công nghệ", "Tin học", "Thể dục", "Âm nhạc"],
  8: ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lý", "Hóa học", "Sinh học", "Lịch sử", "Địa lý", "GDCD", "Công nghệ", "Tin học", "Thể dục"],
  9: ["Toán", "Ngữ văn", "Tiếng Anh", "Vật lý", "Hóa học", "Sinh học", "Lịch sử", "Địa lý", "GDCD", "Công nghệ", "Tin học", "Thể dục"],
};

const TEACHERS_BY_SUBJECT: Record<string, string> = {
  "Toán": "GV Trần Minh Khoa",
  "Ngữ văn": "GV Nguyễn Thị Hoa",
  "Tiếng Anh": "GV Lê Anh Khoa",
  "KHTN": "GV Vũ Thị Hương",
  "Vật lý": "GV Phạm Văn Đức",
  "Hóa học": "GV Bùi Thị Lan",
  "Sinh học": "GV Đặng Minh Tuấn",
  "Lịch sử": "GV Hoàng Thị Mai",
  "Địa lý": "GV Lý Quang Huy",
  "Lịch sử & ĐL": "GV Hoàng Thị Mai",
  "GDCD": "GV Phan Thu Hằng",
  "Công nghệ": "GV Cao Văn Toàn",
  "Tin học": "GV Nguyễn Quang Vinh",
  "Thể dục": "GV Trịnh Hoàng Nam",
  "Âm nhạc": "GV Đinh Thị Phương",
  "Mĩ thuật": "GV Dương Thị Thảo",
};

/* ── Layout TKB mẫu mỗi ngày (periods filled per weekday) ────────
   true  = có tiết học  (buổi sáng thường có T1-T5 kín,
                         buổi chiều thưa hơn — để trống cho STEM/CLB)
   false = trống                                                     */
const DAY_LAYOUT: Record<number, Record<number, boolean>> = {
  1: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true,  7: false, 8: false },
  2: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 7: true,  8: false },
  3: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true,  7: true,  8: false },
  4: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: false, 7: false, 8: false },
  5: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true,  7: true,  8: true  },
};

export const basePeriods: BasePeriod[] = [];

const school = tenantsByType.school[0];

/* Danh sách lớp — đồng bộ với school-classes.ts */
const CLASS_LIST = [
  { id: `${school.id}-C01`, name: "Lớp 6A", grade: 6 },
  { id: `${school.id}-C02`, name: "Lớp 6B", grade: 6 },
  { id: `${school.id}-C03`, name: "Lớp 6C", grade: 6 },
  { id: `${school.id}-C04`, name: "Lớp 6D", grade: 6 },
  { id: `${school.id}-C05`, name: "Lớp 7A", grade: 7 },
  { id: `${school.id}-C06`, name: "Lớp 7B", grade: 7 },
  { id: `${school.id}-C07`, name: "Lớp 7C", grade: 7 },
  { id: `${school.id}-C08`, name: "Lớp 7D", grade: 7 },
  { id: `${school.id}-C09`, name: "Lớp 8A", grade: 8 },
  { id: `${school.id}-C10`, name: "Lớp 8B", grade: 8 },
  { id: `${school.id}-C11`, name: "Lớp 8C", grade: 8 },
  { id: `${school.id}-C12`, name: "Lớp 9A", grade: 9 },
  { id: `${school.id}-C13`, name: "Lớp 9B", grade: 9 },
  { id: `${school.id}-C14`, name: "Lớp 9C", grade: 9 },
];

let bpIdx = 0;
for (const cls of CLASS_LIST) {
  const subjects = SUBJECTS_BY_GRADE[cls.grade];
  for (let weekday = 1; weekday <= 5; weekday++) {
    const layout = DAY_LAYOUT[weekday];
    let subjectIdx = (bpIdx + weekday * 3) % subjects.length;
    for (let period = 1; period <= 8; period++) {
      if (!layout[period]) continue;
      const subject = subjects[subjectIdx % subjects.length];
      basePeriods.push({
        id: `BP-${String(bpIdx + 1).padStart(5, "0")}`,
        classId: cls.id,
        className: cls.name,
        subject,
        teacherName: TEACHERS_BY_SUBJECT[subject] ?? "GV chủ nhiệm",
        weekday,
        period,
        schoolId: school.id,
        source: "k12online",
      });
      subjectIdx++;
      bpIdx++;
    }
  }
}

export function basePeriodsBySchool(schoolId: string): BasePeriod[] {
  return basePeriods.filter((b) => b.schoolId === schoolId);
}

export function basePeriodsByClass(classId: string): BasePeriod[] {
  return basePeriods.filter((b) => b.classId === classId);
}

/** Kiểm tra ô (classId, weekday, period) có tiết nền không */
export function hasBaseConflict(classId: string, weekday: number, period: number): BasePeriod | undefined {
  return basePeriods.find((b) => b.classId === classId && b.weekday === weekday && b.period === period);
}
