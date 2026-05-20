import type { StemProgram } from "./types";
import { tenantsByType } from "./tenants";

export interface SchoolClass {
  id: string;
  name: string;
  grade: number;
  schoolId: string;
  academicYear: string;
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  studentCount: number;
  stemTeacherId: string;
  stemTeacherName: string;
  stemPrograms: StemProgram[];
  weeklySTEMPeriods: number;
  roomId: string;
  roomName: string;
  avgSTEMScore: number;
}

const GRADE_CLASSES = [
  { grade: 6, classes: ["6A", "6B", "6C", "6D"] },
  { grade: 7, classes: ["7A", "7B", "7C", "7D"] },
  { grade: 8, classes: ["8A", "8B", "8C"] },
  { grade: 9, classes: ["9A", "9B", "9C"] },
];

const HOMEROOM_TEACHERS = [
  { id: "U-HRT-01", name: "Nguyễn Thị Bích Loan" },
  { id: "U-HRT-02", name: "Trần Văn Minh" },
  { id: "U-HRT-03", name: "Lê Thị Thanh Hà" },
  { id: "U-HRT-04", name: "Phạm Quốc Tuấn" },
  { id: "U-HRT-05", name: "Vũ Thị Ngọc Anh" },
  { id: "U-HRT-06", name: "Đặng Hữu Phước" },
  { id: "U-HRT-07", name: "Bùi Thị Kim Ngân" },
  { id: "U-HRT-08", name: "Hoàng Văn Long" },
  { id: "U-HRT-09", name: "Phan Thị Thu Trang" },
  { id: "U-HRT-10", name: "Nguyễn Minh Hoàng" },
  { id: "U-HRT-11", name: "Cao Thị Phương Linh" },
  { id: "U-HRT-12", name: "Đinh Văn Cường" },
  { id: "U-HRT-13", name: "Dương Thị Lan Anh" },
  { id: "U-HRT-14", name: "Lý Quang Vinh" },
];

const STEM_TEACHERS = [
  { id: "U-TCH-01", name: "Phạm Anh Tuấn" },
  { id: "U-TCH-02", name: "Nguyễn Thị Lan" },
  { id: "U-TCH-03", name: "Trần Văn Hùng" },
  { id: "U-TCH-04", name: "Lê Minh Trang" },
  { id: "U-TCH-05", name: "Vũ Thanh Hương" },
  { id: "U-TCH-06", name: "Đặng Tuấn Anh" },
  { id: "U-TCH-07", name: "Bùi Thu Hà" },
  { id: "U-TCH-08", name: "Nguyễn Văn Dũng" },
];

const ROOMS = ["P-STEM-01", "P-STEM-02", "P-ROBOT"];
const ROOM_NAMES = ["Phòng STEM 1", "Phòng STEM 2", "Phòng Robotic"];
const ALL_PROGRAMS: StemProgram[] = ["CT1", "CT2", "CT3", "CT4", "CT5"];

export const schoolClasses: SchoolClass[] = [];

const school = tenantsByType.school[0];

let idx = 0;
for (const gradeInfo of GRADE_CLASSES) {
  for (const cls of gradeInfo.classes) {
    const classId = `${school.id}-C${String(idx + 1).padStart(2, "0")}`;
    const programs: StemProgram[] = [
      ALL_PROGRAMS[idx % 5],
      ALL_PROGRAMS[(idx + 2) % 5],
    ];
    schoolClasses.push({
      id: classId,
      name: `Lớp ${cls}`,
      grade: gradeInfo.grade,
      schoolId: school.id,
      academicYear: "2025-2026",
      homeroomTeacherId: HOMEROOM_TEACHERS[idx % HOMEROOM_TEACHERS.length].id,
      homeroomTeacherName: HOMEROOM_TEACHERS[idx % HOMEROOM_TEACHERS.length].name,
      studentCount: 36 + (idx % 5),
      stemTeacherId: STEM_TEACHERS[idx % STEM_TEACHERS.length].id,
      stemTeacherName: STEM_TEACHERS[idx % STEM_TEACHERS.length].name,
      stemPrograms: programs,
      weeklySTEMPeriods: 2 + (idx % 2),
      roomId: ROOMS[idx % ROOMS.length],
      roomName: ROOM_NAMES[idx % ROOMS.length],
      avgSTEMScore: 6.8 + (idx * 0.15) % 2.0,
    });
    idx++;
  }
}

export function classesBySchool(schoolId: string): SchoolClass[] {
  return schoolClasses.filter((c) => c.schoolId === schoolId);
}
