// ============================================================
// QUẢN LÝ PHÒNG HỌC & LỊCH GIẢNG DẠY — Mock Data & Types
// Geleximco LMS — Classroom & Session Management
// ============================================================

export type RoomType = "physical" | "virtual" | "hybrid";
export type RoomStatus = "available" | "occupied" | "maintenance" | "reserved";
export type SessionStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface Equipment {
  id: string;
  name: string;
  icon: string;
}

export interface Classroom {
  id: string;
  name: string;
  type: RoomType;
  location: string;
  subsidiary: string;
  floor: string;
  capacity: number;
  equipment: Equipment[];
  status: RoomStatus;
  imageColor: string;
  description: string;
  hourlyRate?: number; // VNĐ/giờ cho phòng thuê ngoài
}

export interface TrainingSession {
  id: string;
  title: string;
  courseName: string;
  roomId: string;
  instructorName: string;
  instructorAvatar: string;
  date: string;           // DD/MM/YYYY
  dayOfWeek: number;      // 0=CN, 1=T2,...
  startTime: string;      // HH:MM
  endTime: string;
  status: SessionStatus;
  enrolledCount: number;
  maxCapacity: number;
  color: string;
  subsidiary: string;
  notes?: string;
}

export interface Attendee {
  id: string;
  name: string;
  department: string;
  subsidiary: string;
  status: AttendanceStatus;
  checkInTime?: string;
  notes?: string;
}

// ─── Equipment catalog ───

export const EQUIPMENT_CATALOG: Equipment[] = [
  { id: "EQ01", name: "Máy chiếu", icon: "📽️" },
  { id: "EQ02", name: "Bảng trắng", icon: "📋" },
  { id: "EQ03", name: "Webcam HD", icon: "📷" },
  { id: "EQ04", name: "Micro không dây", icon: "🎤" },
  { id: "EQ05", name: "Hệ thống âm thanh", icon: "🔊" },
  { id: "EQ06", name: "Màn hình LED", icon: "🖥️" },
  { id: "EQ07", name: "Máy tính bàn", icon: "💻" },
  { id: "EQ08", name: "Camera ghi hình", icon: "🎥" },
  { id: "EQ09", name: "Hệ thống Zoom Room", icon: "📹" },
  { id: "EQ10", name: "Bảng tương tác", icon: "✍️" },
];

const eq = (ids: string[]) => EQUIPMENT_CATALOG.filter(e => ids.includes(e.id));

// ─── Configs ───

export const ROOM_TYPE_CONFIG: Record<RoomType, { label: string; color: string; icon: string }> = {
  physical: { label: "Phòng học vật lý", color: "#2563eb", icon: "🏢" },
  virtual: { label: "Phòng học ảo", color: "#7c3aed", icon: "🌐" },
  hybrid: { label: "Phòng hybrid", color: "#0891b2", icon: "🔄" },
};

export const ROOM_STATUS_CONFIG: Record<RoomStatus, { label: string; color: string; bg: string }> = {
  available: { label: "Sẵn sàng", color: "#16a34a", bg: "#16a34a12" },
  occupied: { label: "Đang sử dụng", color: "#dc2626", bg: "#dc262612" },
  maintenance: { label: "Bảo trì", color: "#f59e0b", bg: "#f59e0b12" },
  reserved: { label: "Đã đặt", color: "#2563eb", bg: "#2563eb12" },
};

export const SESSION_STATUS_CONFIG: Record<SessionStatus, { label: string; color: string; bg: string }> = {
  scheduled: { label: "Đã lên lịch", color: "#2563eb", bg: "#2563eb12" },
  in_progress: { label: "Đang diễn ra", color: "#16a34a", bg: "#16a34a12" },
  completed: { label: "Hoàn thành", color: "#64748b", bg: "#64748b12" },
  cancelled: { label: "Đã hủy", color: "#dc2626", bg: "#dc262612" },
};

export const ATTENDANCE_STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string; icon: string }> = {
  present: { label: "Có mặt", color: "#16a34a", bg: "#16a34a12", icon: "✓" },
  late: { label: "Đến muộn", color: "#f59e0b", bg: "#f59e0b12", icon: "⏰" },
  absent: { label: "Vắng", color: "#dc2626", bg: "#dc262612", icon: "✗" },
  excused: { label: "Có phép", color: "#7c3aed", bg: "#7c3aed12", icon: "📝" },
};

// ─── Mock Classrooms ───

export const CLASSROOMS: Classroom[] = [
  {
    id: "R01", name: "Hội trường Geleximco", type: "hybrid",
    location: "Tòa nhà VP Tập đoàn, Tầng 3", subsidiary: "VP Tập đoàn", floor: "Tầng 3",
    capacity: 200, equipment: eq(["EQ01", "EQ04", "EQ05", "EQ06", "EQ08", "EQ09"]),
    status: "occupied", imageColor: "#990803",
    description: "Hội trường lớn nhất tập đoàn, trang bị hệ thống hội nghị truyền hình.",
  },
  {
    id: "R02", name: "Phòng Đào tạo A1", type: "physical",
    location: "Tòa nhà VP Tập đoàn, Tầng 5", subsidiary: "VP Tập đoàn", floor: "Tầng 5",
    capacity: 40, equipment: eq(["EQ01", "EQ02", "EQ04", "EQ05"]),
    status: "available", imageColor: "#c8a84e",
    description: "Phòng đào tạo tiêu chuẩn cho các lớp dưới 40 người.",
  },
  {
    id: "R03", name: "Phòng Đào tạo A2", type: "physical",
    location: "Tòa nhà VP Tập đoàn, Tầng 5", subsidiary: "VP Tập đoàn", floor: "Tầng 5",
    capacity: 40, equipment: eq(["EQ01", "EQ02", "EQ04", "EQ05"]),
    status: "reserved", imageColor: "#2563eb",
    description: "Phòng đào tạo tiêu chuẩn song song với A1.",
  },
  {
    id: "R04", name: "Lab CNTT", type: "physical",
    location: "Tòa nhà VP Tập đoàn, Tầng 6", subsidiary: "VP Tập đoàn", floor: "Tầng 6",
    capacity: 30, equipment: eq(["EQ01", "EQ07", "EQ06", "EQ10"]),
    status: "available", imageColor: "#16a34a",
    description: "Phòng thực hành CNTT với 30 máy tính.",
  },
  {
    id: "R05", name: "Phòng họp VIP", type: "hybrid",
    location: "Tòa nhà VP Tập đoàn, Tầng 18", subsidiary: "VP Tập đoàn", floor: "Tầng 18",
    capacity: 20, equipment: eq(["EQ01", "EQ03", "EQ04", "EQ05", "EQ06", "EQ09"]),
    status: "available", imageColor: "#7c3aed",
    description: "Phòng họp cao cấp dành cho đào tạo lãnh đạo.",
  },
  {
    id: "R06", name: "Phòng ĐT ABBank — HN", type: "physical",
    location: "Trụ sở ABBank, Tầng 4", subsidiary: "ABBank", floor: "Tầng 4",
    capacity: 60, equipment: eq(["EQ01", "EQ02", "EQ04", "EQ05", "EQ06"]),
    status: "occupied", imageColor: "#ea580c",
    description: "Phòng đào tạo chính của ABBank tại Hà Nội.",
  },
  {
    id: "R07", name: "Phòng ĐT ABBank — HCM", type: "hybrid",
    location: "Chi nhánh ABBank HCM, Tầng 3", subsidiary: "ABBank", floor: "Tầng 3",
    capacity: 50, equipment: eq(["EQ01", "EQ03", "EQ04", "EQ05", "EQ09"]),
    status: "available", imageColor: "#0891b2",
    description: "Phòng đào tạo hybrid ABBank tại TP.HCM.",
  },
  {
    id: "R08", name: "Phòng An toàn — Construction", type: "physical",
    location: "VP Geleximco Construction", subsidiary: "Construction", floor: "Tầng 2",
    capacity: 80, equipment: eq(["EQ01", "EQ02", "EQ05", "EQ08"]),
    status: "maintenance", imageColor: "#65a30d",
    description: "Phòng đào tạo an toàn lao động chuyên dụng.",
  },
  {
    id: "R09", name: "Zoom Room — Chính", type: "virtual",
    location: "Online — Zoom Enterprise", subsidiary: "VP Tập đoàn", floor: "—",
    capacity: 500, equipment: eq(["EQ09"]),
    status: "available", imageColor: "#2563eb",
    description: "Phòng học ảo chính trên Zoom Enterprise, capacity 500.",
  },
  {
    id: "R10", name: "MS Teams Room — A", type: "virtual",
    location: "Online — Microsoft Teams", subsidiary: "VP Tập đoàn", floor: "—",
    capacity: 300, equipment: eq(["EQ09"]),
    status: "available", imageColor: "#7c3aed",
    description: "Phòng học ảo Microsoft Teams với tính năng breakout rooms.",
  },
  {
    id: "R11", name: "Phòng ĐT Mining", type: "physical",
    location: "VP Geleximco Mining, Quảng Ninh", subsidiary: "Mining", floor: "Tầng 1",
    capacity: 35, equipment: eq(["EQ01", "EQ02", "EQ05"]),
    status: "available", imageColor: "#f97316",
    description: "Phòng đào tạo tại Quảng Ninh cho khối khai thác.",
  },
  {
    id: "R12", name: "Phòng ĐT Hospitality", type: "physical",
    location: "Geleximco Hospitality, Hà Nội", subsidiary: "Hospitality", floor: "Tầng 2",
    capacity: 25, equipment: eq(["EQ01", "EQ02", "EQ04", "EQ08"]),
    status: "reserved", imageColor: "#d946ef",
    description: "Phòng đào tạo dịch vụ khách sạn.",
  },
];

// ─── Mock Sessions (week of 09/03/2026 — 15/03/2026) ───

export const TRAINING_SESSIONS: TrainingSession[] = [
  {
    id: "TS01", title: "Digital Transformation cho Quản lý", courseName: "Chuyển đổi số",
    roomId: "R01", instructorName: "PGS.TS Nguyễn Văn Hùng", instructorAvatar: "NVH",
    date: "10/03/2026", dayOfWeek: 2, startTime: "08:30", endTime: "11:30",
    status: "completed", enrolledCount: 85, maxCapacity: 200, color: "#990803", subsidiary: "VP Tập đoàn",
  },
  {
    id: "TS02", title: "AML/CFT Compliance — Q1", courseName: "Phòng chống Rửa tiền",
    roomId: "R06", instructorName: "TS. Trần Thị Mai", instructorAvatar: "TTM",
    date: "10/03/2026", dayOfWeek: 2, startTime: "14:00", endTime: "17:00",
    status: "completed", enrolledCount: 55, maxCapacity: 60, color: "#2563eb", subsidiary: "ABBank",
  },
  {
    id: "TS03", title: "PMP Exam Prep — Module 3", courseName: "PMP Preparation",
    roomId: "R02", instructorName: "Lê Quốc Vương", instructorAvatar: "LQV",
    date: "11/03/2026", dayOfWeek: 3, startTime: "09:00", endTime: "12:00",
    status: "completed", enrolledCount: 15, maxCapacity: 40, color: "#c8a84e", subsidiary: "Geleximco Land",
  },
  {
    id: "TS04", title: "An toàn Lao động nâng cao", courseName: "ATLĐ & PCCC",
    roomId: "R08", instructorName: "Phạm Đức Mạnh", instructorAvatar: "PDM",
    date: "11/03/2026", dayOfWeek: 3, startTime: "08:00", endTime: "16:30",
    status: "completed", enrolledCount: 65, maxCapacity: 80, color: "#dc2626", subsidiary: "Construction",
    notes: "Bao gồm thực hành PCCC buổi chiều",
  },
  {
    id: "TS05", title: "Data Analytics cho HR", courseName: "HR Analytics",
    roomId: "R09", instructorName: "TS. Đỗ Thanh Hương", instructorAvatar: "DTH",
    date: "12/03/2026", dayOfWeek: 4, startTime: "09:00", endTime: "11:00",
    status: "in_progress", enrolledCount: 120, maxCapacity: 500, color: "#7c3aed", subsidiary: "VP Tập đoàn",
    notes: "Phòng ảo Zoom — tất cả đơn vị",
  },
  {
    id: "TS06", title: "IT Security Awareness", courseName: "Bảo mật Thông tin",
    roomId: "R04", instructorName: "Ngô Trung Kiên", instructorAvatar: "NTK",
    date: "12/03/2026", dayOfWeek: 4, startTime: "14:00", endTime: "16:30",
    status: "scheduled", enrolledCount: 28, maxCapacity: 30, color: "#0891b2", subsidiary: "VP Tập đoàn",
  },
  {
    id: "TS07", title: "Leadership Essentials", courseName: "Lãnh đạo Cơ bản",
    roomId: "R05", instructorName: "CEO Nguyễn Quốc Hiệp", instructorAvatar: "NQH",
    date: "12/03/2026", dayOfWeek: 4, startTime: "08:30", endTime: "10:30",
    status: "in_progress", enrolledCount: 18, maxCapacity: 20, color: "#990803", subsidiary: "VP Tập đoàn",
    notes: "Chỉ dành cho quản lý cấp cao",
  },
  {
    id: "TS08", title: "HRBP Module 2 — Strategic HR", courseName: "HRBP",
    roomId: "R03", instructorName: "Vũ Thị Phương", instructorAvatar: "VTP",
    date: "13/03/2026", dayOfWeek: 5, startTime: "09:00", endTime: "12:00",
    status: "scheduled", enrolledCount: 20, maxCapacity: 40, color: "#16a34a", subsidiary: "ABBank",
  },
  {
    id: "TS09", title: "ESG & Phát triển Bền vững", courseName: "ESG Awareness",
    roomId: "R10", instructorName: "TS. Hoàng Đức Em", instructorAvatar: "HDE",
    date: "13/03/2026", dayOfWeek: 5, startTime: "14:00", endTime: "16:00",
    status: "scheduled", enrolledCount: 180, maxCapacity: 300, color: "#65a30d", subsidiary: "VP Tập đoàn",
    notes: "Phòng ảo MS Teams — toàn tập đoàn",
  },
  {
    id: "TS10", title: "Code of Conduct Refresher", courseName: "Quy tắc Ứng xử",
    roomId: "R01", instructorName: "Phó TGĐ Nhân sự", instructorAvatar: "PTG",
    date: "13/03/2026", dayOfWeek: 5, startTime: "08:30", endTime: "10:00",
    status: "scheduled", enrolledCount: 150, maxCapacity: 200, color: "#c8a84e", subsidiary: "VP Tập đoàn",
  },
  {
    id: "TS11", title: "Dịch vụ Khách hàng Xuất sắc", courseName: "Customer Excellence",
    roomId: "R12", instructorName: "Trần Thị Bình", instructorAvatar: "TTB",
    date: "14/03/2026", dayOfWeek: 6, startTime: "09:00", endTime: "12:00",
    status: "scheduled", enrolledCount: 22, maxCapacity: 25, color: "#d946ef", subsidiary: "Hospitality",
  },
  {
    id: "TS12", title: "An toàn Khai thác Mỏ — Q1", courseName: "AT Mỏ",
    roomId: "R11", instructorName: "Lý Văn Minh", instructorAvatar: "LVM",
    date: "14/03/2026", dayOfWeek: 6, startTime: "07:30", endTime: "11:30",
    status: "scheduled", enrolledCount: 30, maxCapacity: 35, color: "#f97316", subsidiary: "Mining",
  },
  {
    id: "TS13", title: "AML Advanced — Case Studies", courseName: "Phòng chống Rửa tiền",
    roomId: "R07", instructorName: "TS. Trần Thị Mai", instructorAvatar: "TTM",
    date: "14/03/2026", dayOfWeek: 6, startTime: "13:30", endTime: "16:30",
    status: "scheduled", enrolledCount: 42, maxCapacity: 50, color: "#2563eb", subsidiary: "ABBank",
  },
  {
    id: "TS14", title: "PDPA — Bảo vệ Dữ liệu", courseName: "Bảo vệ DLCN",
    roomId: "R09", instructorName: "Ngô Trung Kiên", instructorAvatar: "NTK",
    date: "15/03/2026", dayOfWeek: 0, startTime: "09:00", endTime: "11:00",
    status: "cancelled", enrolledCount: 0, maxCapacity: 500, color: "#64748b", subsidiary: "VP Tập đoàn",
    notes: "Dời sang tuần sau do giảng viên nghỉ",
  },
];

// ─── Mock Attendees ───

export function getSessionAttendees(sessionId: string): Attendee[] {
  const names = [
    "Nguyễn Văn An", "Trần Thị Bình", "Lê Minh Cường", "Phạm Thị Dung",
    "Hoàng Đức Em", "Vũ Thị Phương", "Đỗ Quốc Gia", "Bùi Thị Hà",
    "Ngô Trung Kiên", "Dương Thị Lan", "Lý Văn Minh", "Tạ Thị Ngọc",
    "Hồ Đình Phú", "Mai Thị Quỳnh", "Đinh Xuân Sơn", "Trịnh Thị Tâm",
    "Chu Văn Uy", "Phan Thị Vân", "Đặng Anh Vũ", "Lương Thị Yến",
  ];
  const depts = ["Phòng Kinh doanh", "Phòng Kỹ thuật", "Phòng Nhân sự", "Phòng Tài chính", "Phòng Marketing", "Phòng IT"];
  const subs = ["VP Tập đoàn", "Geleximco Land", "ABBank", "Construction"];
  const statuses: AttendanceStatus[] = [
    "present", "present", "present", "present", "present",
    "present", "present", "late", "present", "absent",
    "present", "present", "excused", "present", "present",
    "late", "present", "present", "absent", "present",
  ];

  const seed = sessionId.charCodeAt(2) || 0;
  const count = 10 + (seed % 11);

  return names.slice(0, count).map((name, i) => ({
    id: `ATT-${sessionId}-${i}`,
    name,
    department: depts[i % depts.length],
    subsidiary: subs[i % subs.length],
    status: statuses[i],
    checkInTime: statuses[i] === "present" ? `08:${(25 + i).toString().padStart(2, "0")}` :
                 statuses[i] === "late" ? `09:${(5 + i * 3).toString().padStart(2, "0")}` : undefined,
    notes: statuses[i] === "excused" ? "Đã xin phép trước" : statuses[i] === "absent" ? "Không thông báo" : undefined,
  }));
}

// ─── Helpers ───

export function getRoomById(id: string): Classroom | undefined {
  return CLASSROOMS.find(r => r.id === id);
}

export function getSessionsByRoom(roomId: string): TrainingSession[] {
  return TRAINING_SESSIONS.filter(s => s.roomId === roomId);
}

export function getSessionsByDay(dayOfWeek: number): TrainingSession[] {
  return TRAINING_SESSIONS.filter(s => s.dayOfWeek === dayOfWeek);
}

export function getRoomStats() {
  return {
    total: CLASSROOMS.length,
    physical: CLASSROOMS.filter(r => r.type === "physical").length,
    virtual: CLASSROOMS.filter(r => r.type === "virtual").length,
    hybrid: CLASSROOMS.filter(r => r.type === "hybrid").length,
    available: CLASSROOMS.filter(r => r.status === "available").length,
    totalCapacity: CLASSROOMS.reduce((s, r) => s + r.capacity, 0),
    sessionsThisWeek: TRAINING_SESSIONS.filter(s => s.status !== "cancelled").length,
    totalEnrolled: TRAINING_SESSIONS.filter(s => s.status !== "cancelled").reduce((s, t) => s + t.enrolledCount, 0),
  };
}

export const DAYS_OF_WEEK = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
export const WEEK_DATES = ["15/03", "09/03", "10/03", "11/03", "12/03", "13/03", "14/03"];
export const TIME_SLOTS = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
