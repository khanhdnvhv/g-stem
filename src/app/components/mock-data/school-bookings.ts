import type { StemProgram } from "./types";
import { tenantsByType } from "./tenants";

export interface RoomBooking {
  id: string;
  roomId: string;
  roomName: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  programCode: StemProgram;
  date: string;
  period: number;
  weekday: number;
  status: "approved" | "pending" | "cancelled";
  purpose: string;
  note?: string;
  createdAt: string;
}

const school = tenantsByType.school[0];

const TEACHERS = [
  { id: "U-TCH-01", name: "Phạm Anh Tuấn" },
  { id: "U-TCH-02", name: "Nguyễn Thị Lan" },
  { id: "U-TCH-03", name: "Trần Văn Hùng" },
  { id: "U-TCH-04", name: "Lê Minh Trang" },
  { id: "U-TCH-05", name: "Vũ Thanh Hương" },
];

const CLASSES = [
  { id: "C01", name: "Lớp 6A" },
  { id: "C02", name: "Lớp 6B" },
  { id: "C03", name: "Lớp 7A" },
  { id: "C04", name: "Lớp 7B" },
  { id: "C05", name: "Lớp 8A" },
  { id: "C06", name: "Lớp 8B" },
  { id: "C07", name: "Lớp 9A" },
];

const ROOMS = [
  { id: "R-STEM-1", name: "Phòng STEM 1" },
  { id: "R-STEM-2", name: "Phòng STEM 2" },
  { id: "R-STEM-3", name: "Phòng Robotic" },
];

const PROGRAMS: StemProgram[] = ["CT1", "CT2", "CT3", "CT4", "CT5"];

const PURPOSES = [
  "Dạy học chương trình STEM",
  "Ôn tập trước kỳ thi",
  "Thực hành dự án nhóm",
  "Câu lạc bộ Robotics",
  "Thi thử Robotic cấp trường",
  "Buổi học bổ trợ",
];

const STATUSES: RoomBooking["status"][] = ["approved", "approved", "approved", "pending", "cancelled"];

export const roomBookings: RoomBooking[] = [];

const baseDate = new Date("2026-05-01");

let idx = 0;
for (let day = 0; day < 30; day++) {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + day);
  const weekday = date.getDay() || 7;
  if (weekday > 5) continue;

  const count = 3 + (day % 3);
  for (let j = 0; j < count; j++) {
    const teacher = TEACHERS[idx % TEACHERS.length];
    const cls = CLASSES[idx % CLASSES.length];
    const room = ROOMS[idx % ROOMS.length];
    const programCode = PROGRAMS[idx % PROGRAMS.length];
    // BR-03: CT1/CT2 → T1-5, CT3 → T6-8, CT4/CT5 → any
    let period: number;
    if (programCode === "CT1" || programCode === "CT2") {
      period = 1 + (j % 5);
    } else if (programCode === "CT3") {
      period = 6 + (j % 3);
    } else {
      period = 1 + (j % 8);
    }
    roomBookings.push({
      id: `BK-${String(idx + 1).padStart(4, "0")}`,
      roomId: room.id,
      roomName: room.name,
      schoolId: school.id,
      teacherId: teacher.id,
      teacherName: teacher.name,
      classId: `${school.id}-${cls.id}`,
      className: cls.name,
      programCode,
      date: date.toISOString().slice(0, 10),
      period,
      weekday,
      status: STATUSES[idx % STATUSES.length],
      purpose: PURPOSES[idx % PURPOSES.length],
      note: idx % 5 === 0 ? "Cần chuẩn bị thêm bộ kit" : undefined,
      createdAt: new Date(date.getTime() - 86400000 * 3).toISOString(),
    });
    idx++;
  }
}

export function bookingsByRoom(roomId: string): RoomBooking[] {
  return roomBookings.filter((b) => b.roomId === roomId);
}

export function bookingsBySchool(schoolId: string): RoomBooking[] {
  return roomBookings.filter((b) => b.schoolId === schoolId);
}
