import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Shield, Users, Search, ChevronDown, Check, X, Lock, Unlock, Eye, Edit,
  Trash2, Plus, Building2, AlertTriangle, Copy, Download, Upload,
  Clock, Hash, UserPlus, UserMinus, Settings, Activity, GitBranch,
  Zap, Brain, BarChart3, Filter, ChevronRight, RefreshCw, Info,
  ShieldCheck, ShieldAlert, ShieldOff, Globe, Monitor, Smartphone,
  KeyRound, History, ArrowLeftRight, Layers, Star, TrendingUp,
  AlertCircle, CheckCircle2, XCircle, Sparkles, FileText, Target,
  Cpu, ChevronUp, ToggleLeft, ToggleRight, Award, Timer, Calendar,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { SUBSIDIARIES, DEPARTMENTS } from "./mock-data";
import { useConfirm } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";

// ════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ════════════════════════════════════════════════════════════

interface ModulePermission {
  module: string;
  moduleId: string;
  icon: any;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  approve: boolean;
  manage: boolean;
}

interface RoleConfig {
  id: string;
  role: string;
  label: string;
  description: string;
  userCount: number;
  color: string;
  level: number; // hierarchy level 1=highest
  inheritsFrom: string | null;
  isSystem: boolean; // cannot be deleted
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: ModulePermission[];
  restrictions: {
    ipWhitelist: string[];
    allowedHours: { from: string; to: string } | null;
    maxSessions: number;
    require2FA: boolean;
    sessionTimeout: number; // minutes
    allowMobile: boolean;
    allowedSubsidiaries: string[]; // empty = all
  };
}

interface UserAssignment {
  id: string;
  name: string;
  email: string;
  initials: string;
  subsidiary: string;
  department: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
  tempExpiry: string | null; // null = permanent
  isActive: boolean;
  lastLogin: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  details: string;
  severity: "info" | "warning" | "critical";
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: "authentication" | "session" | "access" | "compliance";
  value: string;
  options?: string[];
}

type TabId = "overview" | "matrix" | "roles" | "users" | "security" | "audit";

// ════════════════════════════════════════════════════════════
// MOCK DATA
// ════════════════════════════════════════════════════════════

const ALL_MODULES: { id: string; name: string; icon: any }[] = [
  { id: "dashboard", name: "Tổng quan & Dashboard", icon: BarChart3 },
  { id: "courses", name: "Quản lý Khóa học", icon: Eye },
  { id: "employees", name: "Quản lý Nhân sự", icon: Users },
  { id: "subsidiaries", name: "Quản lý Đơn vị", icon: Building2 },
  { id: "reports", name: "Báo cáo & Thống kê", icon: FileText },
  { id: "permissions", name: "Phân quyền", icon: Shield },
  { id: "certificates", name: "Chứng chỉ", icon: Award },
  { id: "settings", name: "Cài đặt Hệ thống", icon: Settings },
  { id: "quizzes", name: "Bài kiểm tra", icon: Target },
  { id: "forum", name: "Diễn đàn", icon: Users },
  { id: "content", name: "Kho Nội dung", icon: FileText },
  { id: "budget", name: "Ngân sách Đào tạo", icon: TrendingUp },
  { id: "compliance", name: "Tuân thủ & Pháp chế", icon: ShieldCheck },
  { id: "gamification", name: "Gamification", icon: Star },
  { id: "messaging", name: "Tin nhắn", icon: Globe },
  { id: "events", name: "Sự kiện Đào tạo", icon: Calendar },
  { id: "ai", name: "AI & Đề xuất", icon: Brain },
  { id: "integration", name: "Tích hợp & API", icon: Cpu },
];

const makePerm = (moduleId: string, v: boolean, c: boolean, e: boolean, d: boolean, ex: boolean, ap: boolean, m: boolean): ModulePermission => {
  const mod = ALL_MODULES.find(mm => mm.id === moduleId)!;
  return { module: mod.name, moduleId, icon: mod.icon, view: v, create: c, edit: e, delete: d, export: ex, approve: ap, manage: m };
};

const allTrue = (id: string) => makePerm(id, true, true, true, true, true, true, true);
const allFalse = (id: string) => makePerm(id, false, false, false, false, false, false, false);

const INITIAL_ROLES: RoleConfig[] = [
  {
    id: "R1", role: "super_admin", label: "Super Admin", description: "Toàn quyền quản trị hệ thống LMS trên toàn Tập đoàn Geleximco",
    userCount: 3, color: "#990803", level: 1, inheritsFrom: null, isSystem: true, isActive: true,
    createdAt: "2025-01-15", updatedAt: "2026-03-10",
    permissions: ALL_MODULES.map(m => allTrue(m.id)),
    restrictions: { ipWhitelist: ["10.0.0.0/8", "172.16.0.0/12"], allowedHours: null, maxSessions: 5, require2FA: true, sessionTimeout: 480, allowMobile: true, allowedSubsidiaries: [] },
  },
  {
    id: "R2", role: "admin_subsidiary", label: "Admin Đơn vị", description: "Quản trị LMS tại đơn vị thành viên, quản lý khóa học và nhân sự đơn vị",
    userCount: 14, color: "#e67e22", level: 2, inheritsFrom: "R1", isSystem: true, isActive: true,
    createdAt: "2025-01-15", updatedAt: "2026-03-08",
    permissions: [
      makePerm("dashboard", true, false, false, false, true, false, false),
      makePerm("courses", true, true, true, false, true, true, false),
      makePerm("employees", true, true, true, false, true, false, false),
      makePerm("subsidiaries", true, false, false, false, false, false, false),
      makePerm("reports", true, false, false, false, true, false, false),
      allFalse("permissions"),
      makePerm("certificates", true, true, true, false, true, true, false),
      allFalse("settings"),
      makePerm("quizzes", true, true, true, false, true, true, false),
      makePerm("forum", true, true, true, true, false, false, true),
      makePerm("content", true, true, true, false, true, true, false),
      makePerm("budget", true, false, false, false, true, false, false),
      makePerm("compliance", true, true, true, false, true, true, false),
      makePerm("gamification", true, false, false, false, false, false, false),
      makePerm("messaging", true, true, true, false, false, false, false),
      makePerm("events", true, true, true, false, true, true, false),
      makePerm("ai", true, false, false, false, false, false, false),
      allFalse("integration"),
    ],
    restrictions: { ipWhitelist: [], allowedHours: { from: "07:00", to: "22:00" }, maxSessions: 3, require2FA: true, sessionTimeout: 240, allowMobile: true, allowedSubsidiaries: [] },
  },
  {
    id: "R3", role: "dept_manager", label: "Trưởng phòng", description: "Quản lý đào tạo cấp phòng ban, phê duyệt yêu cầu, xem báo cáo đơn vị",
    userCount: 68, color: "#27ae60", level: 3, inheritsFrom: "R2", isSystem: false, isActive: true,
    createdAt: "2025-03-01", updatedAt: "2026-02-28",
    permissions: [
      makePerm("dashboard", true, false, false, false, true, false, false),
      makePerm("courses", true, false, false, false, false, true, false),
      makePerm("employees", true, false, false, false, true, false, false),
      allFalse("subsidiaries"), allFalse("reports"), allFalse("permissions"),
      makePerm("certificates", true, false, false, false, true, true, false),
      allFalse("settings"),
      makePerm("quizzes", true, false, false, false, false, true, false),
      makePerm("forum", true, true, true, false, false, false, false),
      makePerm("content", true, false, false, false, false, true, false),
      makePerm("budget", true, false, false, false, true, true, false),
      makePerm("compliance", true, false, false, false, true, true, false),
      makePerm("gamification", true, false, false, false, false, false, false),
      makePerm("messaging", true, true, true, false, false, false, false),
      makePerm("events", true, false, false, false, false, true, false),
      allFalse("ai"), allFalse("integration"),
    ],
    restrictions: { ipWhitelist: [], allowedHours: { from: "07:00", to: "20:00" }, maxSessions: 2, require2FA: false, sessionTimeout: 180, allowMobile: true, allowedSubsidiaries: [] },
  },
  {
    id: "R4", role: "instructor", label: "Giảng viên", description: "Quản lý khóa học phụ trách, chấm bài, xem báo cáo lớp học",
    userCount: 48, color: "#c8a84e", level: 3, inheritsFrom: "R2", isSystem: true, isActive: true,
    createdAt: "2025-01-15", updatedAt: "2026-03-05",
    permissions: [
      makePerm("dashboard", true, false, false, false, false, false, false),
      makePerm("courses", true, true, true, false, false, false, false),
      allFalse("employees"), allFalse("subsidiaries"),
      makePerm("reports", true, false, false, false, true, false, false),
      allFalse("permissions"),
      makePerm("certificates", true, false, false, false, false, false, false),
      allFalse("settings"),
      makePerm("quizzes", true, true, true, false, true, false, false),
      makePerm("forum", true, true, true, false, false, false, true),
      makePerm("content", true, true, true, false, true, false, false),
      allFalse("budget"),
      makePerm("compliance", true, false, false, false, false, false, false),
      allFalse("gamification"),
      makePerm("messaging", true, true, true, false, false, false, false),
      makePerm("events", true, true, true, false, false, false, false),
      allFalse("ai"), allFalse("integration"),
    ],
    restrictions: { ipWhitelist: [], allowedHours: null, maxSessions: 2, require2FA: false, sessionTimeout: 240, allowMobile: true, allowedSubsidiaries: [] },
  },
  {
    id: "R5", role: "mentor", label: "Mentor/Coach", description: "Hướng dẫn, theo dõi tiến độ mentee, đánh giá năng lực",
    userCount: 32, color: "#8b5cf6", level: 4, inheritsFrom: "R4", isSystem: false, isActive: true,
    createdAt: "2025-06-01", updatedAt: "2026-02-15",
    permissions: [
      makePerm("dashboard", true, false, false, false, false, false, false),
      makePerm("courses", true, false, false, false, false, false, false),
      makePerm("employees", true, false, false, false, false, false, false),
      allFalse("subsidiaries"), allFalse("reports"), allFalse("permissions"), allFalse("certificates"), allFalse("settings"),
      allFalse("quizzes"),
      makePerm("forum", true, true, true, false, false, false, false),
      allFalse("content"), allFalse("budget"), allFalse("compliance"), allFalse("gamification"),
      makePerm("messaging", true, true, true, false, false, false, false),
      allFalse("events"), allFalse("ai"), allFalse("integration"),
    ],
    restrictions: { ipWhitelist: [], allowedHours: null, maxSessions: 2, require2FA: false, sessionTimeout: 120, allowMobile: true, allowedSubsidiaries: [] },
  },
  {
    id: "R6", role: "learner", label: "Học viên", description: "Truy cập khóa học, làm bài kiểm tra, xem chứng chỉ cá nhân",
    userCount: 6445, color: "#2e86de", level: 5, inheritsFrom: null, isSystem: true, isActive: true,
    createdAt: "2025-01-15", updatedAt: "2026-03-12",
    permissions: [
      makePerm("dashboard", true, false, false, false, false, false, false),
      makePerm("courses", true, false, false, false, false, false, false),
      allFalse("employees"), allFalse("subsidiaries"), allFalse("reports"), allFalse("permissions"),
      makePerm("certificates", true, false, false, false, true, false, false),
      allFalse("settings"),
      makePerm("quizzes", true, false, false, false, false, false, false),
      makePerm("forum", true, true, true, false, false, false, false),
      allFalse("content"), allFalse("budget"),
      makePerm("compliance", true, false, false, false, false, false, false),
      makePerm("gamification", true, false, false, false, false, false, false),
      makePerm("messaging", true, true, false, false, false, false, false),
      makePerm("events", true, false, false, false, false, false, false),
      allFalse("ai"), allFalse("integration"),
    ],
    restrictions: { ipWhitelist: [], allowedHours: null, maxSessions: 1, require2FA: false, sessionTimeout: 60, allowMobile: true, allowedSubsidiaries: [] },
  },
  {
    id: "R7", role: "auditor", label: "Kiểm soát viên", description: "Chỉ quyền xem và xuất báo cáo, không được chỉnh sửa bất kỳ dữ liệu nào",
    userCount: 8, color: "#6b7280", level: 2, inheritsFrom: null, isSystem: false, isActive: true,
    createdAt: "2025-09-01", updatedAt: "2026-01-20",
    permissions: ALL_MODULES.map(m => makePerm(m.id, true, false, false, false, true, false, false)),
    restrictions: { ipWhitelist: ["10.0.0.0/8"], allowedHours: { from: "08:00", to: "18:00" }, maxSessions: 1, require2FA: true, sessionTimeout: 60, allowMobile: false, allowedSubsidiaries: [] },
  },
  {
    id: "R8", role: "external_partner", label: "Đối tác Ngoài", description: "Truy cập hạn chế cho đối tác, khách hàng bên ngoài tập đoàn",
    userCount: 12, color: "#f59e0b", level: 6, inheritsFrom: null, isSystem: false, isActive: false,
    createdAt: "2025-11-01", updatedAt: "2026-01-10",
    permissions: [
      allFalse("dashboard"),
      makePerm("courses", true, false, false, false, false, false, false),
      allFalse("employees"), allFalse("subsidiaries"), allFalse("reports"), allFalse("permissions"),
      makePerm("certificates", true, false, false, false, false, false, false),
      allFalse("settings"), allFalse("quizzes"),
      makePerm("forum", true, false, false, false, false, false, false),
      allFalse("content"), allFalse("budget"), allFalse("compliance"), allFalse("gamification"),
      allFalse("messaging"), allFalse("events"), allFalse("ai"), allFalse("integration"),
    ],
    restrictions: { ipWhitelist: [], allowedHours: { from: "09:00", to: "17:00" }, maxSessions: 1, require2FA: false, sessionTimeout: 30, allowMobile: false, allowedSubsidiaries: [] },
  },
];

const NAMES = [
  "Nguyễn Văn Hùng", "Trần Thị Lan", "Phạm Minh Tuấn", "Lê Thị Hương", "Hoàng Đức Anh",
  "Võ Thị Hạnh", "Bùi Xuân Trường", "Đỗ Thanh Hải", "Nguyễn Thị Mai", "Trần Quốc Đạt",
  "Phạm Văn Long", "Lê Minh Châu", "Hoàng Thị Ngọc", "Vũ Đình Khoa", "Nguyễn Hải Yến",
  "Trần Văn Bình", "Phạm Thị Dung", "Lê Hoàng Nam", "Ngô Thị Thủy", "Đặng Văn Phong",
];

const genInitials = (n: string) => n.split(" ").map(w => w[0]).join("").slice(-2).toUpperCase();

const MOCK_USERS: UserAssignment[] = NAMES.map((name, i) => ({
  id: `U${String(i + 1).padStart(3, "0")}`,
  name,
  email: `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").split(" ").reverse().join(".")}@geleximco.vn`,
  initials: genInitials(name),
  subsidiary: SUBSIDIARIES[i % SUBSIDIARIES.length],
  department: DEPARTMENTS[i % DEPARTMENTS.length],
  roleId: ["R1", "R2", "R2", "R3", "R3", "R4", "R4", "R4", "R5", "R5", "R6", "R6", "R6", "R6", "R6", "R7", "R7", "R6", "R6", "R8"][i],
  assignedAt: `2025-${String((i % 12) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
  assignedBy: i < 3 ? "Hệ thống" : NAMES[Math.max(0, i - 3)],
  tempExpiry: i === 19 ? "2026-06-30" : i === 9 ? "2026-04-15" : null,
  isActive: i !== 19,
  lastLogin: `2026-03-${String(13 - (i % 5)).padStart(2, "0")} ${String(8 + (i % 10)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
}));

const MOCK_AUDIT: AuditEntry[] = [
  { id: "A01", timestamp: "2026-03-13 09:15", user: "Nguyễn Văn Hùng", action: "Cập nhật quyền", target: "Vai trò: Admin Đơn vị", details: "Bật quyền 'Phê duyệt' cho module Chứng chỉ", severity: "warning" },
  { id: "A02", timestamp: "2026-03-12 16:42", user: "Nguyễn Văn Hùng", action: "Gán vai trò", target: "Đặng Văn Phong", details: "Gán vai trò 'Đối tác Ngoài' (tạm thời đến 30/06/2026)", severity: "info" },
  { id: "A03", timestamp: "2026-03-12 14:30", user: "Trần Thị Lan", action: "Tạo vai trò mới", target: "Mentor/Coach", details: "Tạo vai trò mới kế thừa từ Giảng viên", severity: "warning" },
  { id: "A04", timestamp: "2026-03-11 11:20", user: "Nguyễn Văn Hùng", action: "Thay đổi chính sách", target: "Yêu cầu 2FA", details: "Bật xác thực 2 lớp cho vai trò Kiểm soát viên", severity: "critical" },
  { id: "A05", timestamp: "2026-03-11 09:00", user: "Hệ thống", action: "Thu hồi quyền tạm", target: "Ngô Thị Thủy", details: "Tự động thu hồi quyền tạm thời đã hết hạn", severity: "info" },
  { id: "A06", timestamp: "2026-03-10 15:45", user: "Phạm Minh Tuấn", action: "Xuất cấu hình", target: "Toàn bộ ma trận phân quyền", details: "Export Excel cấu hình phân quyền 8 vai trò", severity: "info" },
  { id: "A07", timestamp: "2026-03-10 10:15", user: "Nguyễn Văn Hùng", action: "Vô hiệu hóa vai trò", target: "Đối tác Ngoài", details: "Tạm ngưng vai trò 'Đối tác Ngoài' - chờ review", severity: "critical" },
  { id: "A08", timestamp: "2026-03-09 14:20", user: "Trần Thị Lan", action: "Cập nhật IP whitelist", target: "Kiểm soát viên", details: "Thêm dải IP 10.0.0.0/8 vào whitelist", severity: "warning" },
  { id: "A09", timestamp: "2026-03-08 08:30", user: "Hệ thống", action: "Phát hiện bất thường", target: "Session monitoring", details: "3 phiên đăng nhập đồng thời từ IP khác nhau cho user admin", severity: "critical" },
  { id: "A10", timestamp: "2026-03-07 16:00", user: "Lê Thị Hương", action: "Clone vai trò", target: "Trưởng phòng → Phó phòng", details: "Nhân bản vai trò Trưởng phòng thành Phó phòng (bỏ quyền phê duyệt)", severity: "info" },
];

const MOCK_POLICIES: SecurityPolicy[] = [
  { id: "P01", name: "Xác thực 2 lớp (2FA)", description: "Yêu cầu xác thực 2 lớp khi đăng nhập cho vai trò quản trị", enabled: true, category: "authentication", value: "Bắt buộc cho Admin & Kiểm soát viên" },
  { id: "P02", name: "Độ mạnh Mật khẩu", description: "Yêu cầu tối thiểu về độ phức tạp mật khẩu", enabled: true, category: "authentication", value: "Tối thiểu 12 ký tự, chữ hoa + số + ký tự đặc biệt", options: ["8 ký tự cơ bản", "12 ký tự nâng cao", "16 ký tự nghiêm ngặt"] },
  { id: "P03", name: "Thời gian hết phiên", description: "Tự động đăng xuất sau thời gian không hoạt động", enabled: true, category: "session", value: "Theo cấu hình từng vai trò (30-480 phút)" },
  { id: "P04", name: "Giới hạn phiên đồng thời", description: "Số phiên đăng nhập đồng thời tối đa cho mỗi tài khoản", enabled: true, category: "session", value: "Theo vai trò (1-5 phiên)" },
  { id: "P05", name: "IP Whitelist", description: "Chỉ cho phép truy cập từ các dải IP được phê duyệt", enabled: true, category: "access", value: "Áp dụng cho Super Admin & Kiểm soát viên" },
  { id: "P06", name: "Giờ truy cập", description: "Giới hạn khung giờ được phép đăng nhập", enabled: true, category: "access", value: "Tùy chỉnh theo vai trò" },
  { id: "P07", name: "Khóa tài khoản sau đăng nhập sai", description: "Tự động khóa tài khoản sau N lần nhập sai mật khẩu", enabled: true, category: "authentication", value: "Khóa 30 phút sau 5 lần sai", options: ["3 lần", "5 lần", "10 lần"] },
  { id: "P08", name: "Đổi mật khẩu định kỳ", description: "Yêu cầu đổi mật khẩu theo chu kỳ", enabled: true, category: "compliance", value: "90 ngày cho admin, 180 ngày cho user", options: ["30 ngày", "60 ngày", "90 ngày", "180 ngày"] },
  { id: "P09", name: "Audit Trail bắt buộc", description: "Ghi log tất cả thao tác thay đổi phân quyền", enabled: true, category: "compliance", value: "Lưu trữ 365 ngày, không thể tắt" },
  { id: "P10", name: "Truy cập từ thiết bị di động", description: "Cho phép hoặc giới hạn đăng nhập từ mobile", enabled: true, category: "access", value: "Cho phép tất cả trừ Kiểm soát viên & Đối tác ngoài" },
];

// ════════════════════════════════════════════════════════════
// AI SUGGESTIONS
// ════════════════════════════════════════════════════════════

interface AISuggestion {
  id: string;
  type: "risk" | "optimize" | "conflict" | "anomaly";
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  affectedRole: string;
  recommendation: string;
}

const AI_SUGGESTIONS: AISuggestion[] = [
  { id: "AI01", type: "risk", severity: "high", title: "Quyền xóa quá rộng cho Super Admin", description: "3 Super Admin có quyền xóa trên toàn bộ 18 modules. Đề xuất áp dụng nguyên tắc 4 mắt (dual approval) cho thao tác xóa.", affectedRole: "Super Admin", recommendation: "Thêm yêu cầu phê duyệt kép cho thao tác xóa ở các module nhạy cảm" },
  { id: "AI02", type: "conflict", severity: "high", title: "Xung đột phân quyền phát hiện", description: "Vai trò 'Kiểm soát viên' có quyền Export tất cả dữ liệu nhưng không có IP whitelist cho một số module nhạy cảm.", affectedRole: "Kiểm soát viên", recommendation: "Giới hạn quyền Export chỉ cho các module không chứa dữ liệu nhạy cảm, hoặc thêm IP restriction" },
  { id: "AI03", type: "optimize", severity: "medium", title: "68 Trưởng phòng chưa sử dụng quyền Phê duyệt Ngân sách", description: "Trong 30 ngày qua, 52/68 trưởng phòng chưa thực hiện bất kỳ phê duyệt ngân sách nào.", affectedRole: "Trưởng phòng", recommendation: "Review lại quyền Phê duyệt Ngân sách, có thể chuyển về chỉ Approve cho phòng ban liên quan" },
  { id: "AI04", type: "anomaly", severity: "medium", title: "Vai trò 'Đối tác Ngoài' đang bị vô hiệu hóa", description: "12 user được gán vai trò này nhưng vai trò đang tắt. Có thể gây ảnh hưởng đến truy cập đào tạo đối tác.", affectedRole: "Đối tác Ngoài", recommendation: "Kích hoạt lại vai trò hoặc chuyển user sang vai trò phù hợp" },
  { id: "AI05", type: "optimize", severity: "low", title: "Có thể tối ưu cấu trúc kế thừa vai trò", description: "Vai trò 'Mentor/Coach' kế thừa từ 'Giảng viên' nhưng chỉ sử dụng 30% quyền. Nên tạo vai trò độc lập.", affectedRole: "Mentor/Coach", recommendation: "Tạo vai trò Mentor riêng biệt với bộ quyền tối thiểu cần thiết" },
  { id: "AI06", type: "risk", severity: "medium", title: "Session timeout quá dài cho Admin Đơn vị", description: "Session timeout 240 phút (4 giờ) cho 14 Admin Đơn vị tạo rủi ro bảo mật nếu quên đăng xuất.", affectedRole: "Admin Đơn vị", recommendation: "Giảm session timeout xuống 120 phút và bật auto-lock sau 15 phút idle" },
];

// ════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ════════════════════════════════════════════════════════════

function PermToggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      className={`inline-flex w-7 h-7 rounded-lg items-center justify-center transition-all ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-110"} ${value ? "bg-green-100" : "bg-gray-100"}`}
    >
      {value ? <Check className="w-3.5 h-3.5 text-green-600" /> : <X className="w-3.5 h-3.5 text-gray-300" />}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, color, subtitle }: { icon: any; label: string; value: string | number; color: string; subtitle?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}12` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{value}</p>
      <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{label}</p>
      {subtitle && <p className="text-muted-foreground mt-0.5" style={{ fontSize: "9px" }}>{subtitle}</p>}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const cfg: Record<string, { bg: string; color: string; label: string }> = {
    high: { bg: "#ef444415", color: "#ef4444", label: "Cao" },
    medium: { bg: "#f59e0b15", color: "#f59e0b", label: "TB" },
    low: { bg: "#22c55e15", color: "#22c55e", label: "Thấp" },
    critical: { bg: "#ef444415", color: "#ef4444", label: "Nghiêm trọng" },
    warning: { bg: "#f59e0b15", color: "#f59e0b", label: "Cảnh báo" },
    info: { bg: "#3b82f615", color: "#3b82f6", label: "Thông tin" },
  };
  const c = cfg[severity] || cfg.info;
  return (
    <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════

export function Permissions() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const isAdmin = user?.role === "admin";

  // ── State ──
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [roles, setRoles] = useState<RoleConfig[]>(INITIAL_ROLES);
  const [users, setUsers] = useState<UserAssignment[]>(MOCK_USERS);
  const [policies, setPolicies] = useState<SecurityPolicy[]>(MOCK_POLICIES);
  const [auditEntries] = useState<AuditEntry[]>(MOCK_AUDIT);

  // Overview
  const [showAISuggestions, setShowAISuggestions] = useState(true);

  // Matrix
  const [matrixSelectedRole, setMatrixSelectedRole] = useState("R1");
  const [matrixEditing, setMatrixEditing] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareRoleId, setCompareRoleId] = useState("R6");

  // Roles
  const [roleSearch, setRoleSearch] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleConfig | null>(null);

  // Users
  const [userSearch, setUserSearch] = useState("");
  const [userSubFilter, setUserSubFilter] = useState("all");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [simulateUserId, setSimulateUserId] = useState<string | null>(null);

  // Security
  const [secCategoryFilter, setSecCategoryFilter] = useState("all");

  // Audit
  const [auditSearch, setAuditSearch] = useState("");
  const [auditSeverityFilter, setAuditSeverityFilter] = useState("all");

  // ── Computed ──
  const totalUsers = roles.reduce((s, r) => s + r.userCount, 0);
  const activeRoles = roles.filter(r => r.isActive).length;
  const totalPermissions = roles.reduce((s, r) => s + r.permissions.reduce((ps, p) => ps + (p.view ? 1 : 0) + (p.create ? 1 : 0) + (p.edit ? 1 : 0) + (p.delete ? 1 : 0) + (p.export ? 1 : 0) + (p.approve ? 1 : 0) + (p.manage ? 1 : 0), 0), 0);
  const riskScore = useMemo(() => {
    let score = 85;
    const highs = AI_SUGGESTIONS.filter(s => s.severity === "high").length;
    score -= highs * 8;
    const meds = AI_SUGGESTIONS.filter(s => s.severity === "medium").length;
    score -= meds * 3;
    return Math.max(0, Math.min(100, score));
  }, []);

  const matrixRole = roles.find(r => r.id === matrixSelectedRole) || roles[0];
  const compareRole = roles.find(r => r.id === compareRoleId);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = userSearch.toLowerCase();
      const matchQ = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
      const matchSub = userSubFilter === "all" || u.subsidiary === userSubFilter;
      const matchRole = userRoleFilter === "all" || u.roleId === userRoleFilter;
      return matchQ && matchSub && matchRole;
    });
  }, [users, userSearch, userSubFilter, userRoleFilter]);

  const filteredAudit = useMemo(() => {
    return auditEntries.filter(a => {
      const q = auditSearch.toLowerCase();
      const matchQ = !q || a.user.toLowerCase().includes(q) || a.action.toLowerCase().includes(q) || a.target.toLowerCase().includes(q);
      const matchSev = auditSeverityFilter === "all" || a.severity === auditSeverityFilter;
      return matchQ && matchSev;
    });
  }, [auditEntries, auditSearch, auditSeverityFilter]);

  const filteredPolicies = useMemo(() => {
    return policies.filter(p => secCategoryFilter === "all" || p.category === secCategoryFilter);
  }, [policies, secCategoryFilter]);

  // ── Handlers ──
  const togglePermission = (moduleId: string, action: keyof ModulePermission) => {
    if (!matrixEditing) return;
    setRoles(prev => prev.map(r => {
      if (r.id !== matrixSelectedRole) return r;
      return {
        ...r,
        permissions: r.permissions.map(p => {
          if (p.moduleId !== moduleId) return p;
          return { ...p, [action]: !p[action as keyof ModulePermission] };
        }),
      };
    }));
  };

  const handleTogglePolicy = async (policyId: string) => {
    const pol = policies.find(p => p.id === policyId);
    if (!pol) return;
    if (pol.enabled) {
      const ok = await confirm({ title: "Tắt chính sách bảo mật?", message: `Bạn có chắc muốn tắt "${pol.name}"? Điều này có thể ảnh hưởng đến bảo mật hệ thống.`, variant: "warning", confirmLabel: "Tắt chính sách" });
      if (!ok) return;
    }
    setPolicies(prev => prev.map(p => p.id === policyId ? { ...p, enabled: !p.enabled } : p));
    import("sonner").then(m => m.toast.success(pol.enabled ? `Đã tắt: ${pol.name}` : `Đã bật: ${pol.name}`));
  };

  const handleDeleteRole = async (roleId: string) => {
    const r = roles.find(ro => ro.id === roleId);
    if (!r || r.isSystem) return;
    const ok = await confirm({
      title: "Xóa vai trò?",
      message: `Xóa vai trò "${r.label}" sẽ ảnh hưởng ${r.userCount} người dùng. Hành động này không thể hoàn tác.`,
      variant: "danger",
      confirmLabel: "Xóa vai trò",
      requireTyping: r.label,
    });
    if (!ok) return;
    setRoles(prev => prev.filter(ro => ro.id !== roleId));
    import("sonner").then(m => m.toast.success(`Đã xóa vai trò: ${r.label}`));
  };

  const handleCloneRole = (roleId: string) => {
    const source = roles.find(r => r.id === roleId);
    if (!source) return;
    const newRole: RoleConfig = {
      ...source,
      id: `R${Date.now()}`,
      label: `${source.label} (Copy)`,
      role: `${source.role}_copy`,
      isSystem: false,
      userCount: 0,
      createdAt: "2026-03-13",
      updatedAt: "2026-03-13",
      permissions: source.permissions.map(p => ({ ...p })),
      restrictions: { ...source.restrictions, ipWhitelist: [...source.restrictions.ipWhitelist], allowedSubsidiaries: [...source.restrictions.allowedSubsidiaries] },
    };
    setRoles(prev => [...prev, newRole]);
    import("sonner").then(m => m.toast.success(`Đã nhân bản vai trò: ${source.label}`));
  };

  const handleToggleRoleActive = async (roleId: string) => {
    const r = roles.find(ro => ro.id === roleId);
    if (!r) return;
    const action = r.isActive ? "Vô hiệu hóa" : "Kích hoạt";
    const ok = await confirm({
      title: `${action} vai trò?`,
      message: `${action} vai trò "${r.label}" ảnh hưởng ${r.userCount} người dùng.`,
      variant: r.isActive ? "warning" : "info",
      confirmLabel: action,
    });
    if (!ok) return;
    setRoles(prev => prev.map(ro => ro.id === roleId ? { ...ro, isActive: !ro.isActive } : ro));
    import("sonner").then(m => m.toast.success(`Đã ${action.toLowerCase()} vai trò: ${r.label}`));
  };

  // ── TABS ──
  const TABS: { id: TabId; label: string; icon: any }[] = [
    { id: "overview", label: "Tổng quan", icon: BarChart3 },
    { id: "matrix", label: "Ma trận Quyền", icon: Layers },
    { id: "roles", label: "Quản lý Vai trò", icon: Shield },
    { id: "users", label: "Gán quyền User", icon: Users },
    { id: "security", label: "Chính sách Bảo mật", icon: Lock },
    { id: "audit", label: "Nhật ký", icon: History },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>Phân quyền Hệ thống</h1>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
            Quản lý vai trò, quyền truy cập và chính sách bảo mật cho toàn bộ LMS Geleximco
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => import("sonner").then(m => m.toast.success("Đang xuất cấu hình phân quyền..."))} className="flex items-center gap-1.5 px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
            <Download className="w-3.5 h-3.5" /> Xuất cấu hình
          </button>
          <button onClick={() => import("sonner").then(m => m.toast.info("Chức năng import đang phát triển"))} className="flex items-center gap-1.5 px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
            <Upload className="w-3.5 h-3.5" /> Nhập cấu hình
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-800" style={{ fontSize: "13px", fontWeight: 600 }}>Lưu ý bảo mật quan trọng</p>
          <p className="text-amber-700 mt-0.5" style={{ fontSize: "12px" }}>
            Thay đổi phân quyền ảnh hưởng toàn bộ <strong>{totalUsers.toLocaleString()}</strong> người dùng trên <strong>14 đơn vị</strong>. Mọi thay đổi đều được ghi nhật ký audit.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/30 rounded-xl p-1 border border-border overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "bg-card shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground border border-transparent"}`}
            style={{ fontSize: "12px", fontWeight: activeTab === tab.id ? 600 : 400 }}
          >
            <tab.icon className="w-3.5 h-3.5" style={activeTab === tab.id ? { color: "#990803" } : {}} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 1: TỔNG QUAN */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            <StatCard icon={Users} label="Tổng người dùng" value={totalUsers.toLocaleString()} color="#990803" />
            <StatCard icon={Shield} label="Vai trò đang hoạt động" value={activeRoles} color="#22c55e" subtitle={`/ ${roles.length} vai trò`} />
            <StatCard icon={Layers} label="Tổng quyền được cấp" value={totalPermissions} color="#3b82f6" />
            <StatCard icon={KeyRound} label="Module quản lý" value={ALL_MODULES.length} color="#8b5cf6" />
            <StatCard icon={ShieldCheck} label="Chính sách bảo mật" value={policies.filter(p => p.enabled).length} color="#c8a84e" subtitle={`/ ${policies.length} chính sách`} />
            <StatCard icon={Activity} label="Điểm An ninh" value={`${riskScore}/100`} color={riskScore >= 80 ? "#22c55e" : riskScore >= 60 ? "#f59e0b" : "#ef4444"} subtitle={riskScore >= 80 ? "Tốt" : riskScore >= 60 ? "Trung bình" : "Cần cải thiện"} />
          </div>

          {/* 2 columns: Distribution + Risk Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Role Distribution Donut */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Phân bổ người dùng theo vai trò</h4>
              <div className="flex items-center gap-6">
                <svg viewBox="0 0 140 140" className="w-36 h-36 shrink-0">
                  {(() => {
                    const data = roles.filter(r => r.isActive).map(r => ({ value: r.userCount, color: r.color, label: r.label }));
                    const total = data.reduce((s, d) => s + d.value, 0);
                    let cum = -90;
                    return data.map((d, i) => {
                      const angle = (d.value / total) * 360;
                      if (angle < 0.5) { cum += angle; return null; }
                      const sr = (cum * Math.PI) / 180;
                      const er = ((cum + angle) * Math.PI) / 180;
                      const la = angle > 180 ? 1 : 0;
                      const r1 = 58, r2 = 35;
                      const path = `M${70 + r1 * Math.cos(sr)},${70 + r1 * Math.sin(sr)} A${r1},${r1} 0 ${la},1 ${70 + r1 * Math.cos(er)},${70 + r1 * Math.sin(er)} L${70 + r2 * Math.cos(er)},${70 + r2 * Math.sin(er)} A${r2},${r2} 0 ${la},0 ${70 + r2 * Math.cos(sr)},${70 + r2 * Math.sin(sr)} Z`;
                      cum += angle;
                      return <path key={i} d={path} fill={d.color} opacity="0.85" />;
                    });
                  })()}
                  <text x="70" y="67" textAnchor="middle" fill="#374151" fontSize="18" fontWeight="700">{totalUsers.toLocaleString()}</text>
                  <text x="70" y="82" textAnchor="middle" fill="#9ca3af" fontSize="8">người dùng</text>
                </svg>
                <div className="flex-1 space-y-1.5">
                  {roles.filter(r => r.isActive).map(r => (
                    <div key={r.id} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: r.color }} />
                      <span className="text-foreground flex-1 truncate" style={{ fontSize: "11px" }}>{r.label}</span>
                      <span className="text-foreground shrink-0" style={{ fontSize: "11px", fontWeight: 600 }}>{r.userCount.toLocaleString()}</span>
                      <span className="text-muted-foreground shrink-0" style={{ fontSize: "9px" }}>({Math.round((r.userCount / totalUsers) * 100)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security Score Gauge */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Điểm An ninh Hệ thống</h4>
              <div className="flex items-center gap-6">
                <svg viewBox="0 0 140 90" className="w-40 shrink-0">
                  <path d="M15,80 A55,55 0 0,1 125,80" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
                  <path d="M15,80 A55,55 0 0,1 125,80" fill="none" stroke={riskScore >= 80 ? "#22c55e" : riskScore >= 60 ? "#f59e0b" : "#ef4444"} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(riskScore / 100) * 173} 173`} />
                  <text x="70" y="72" textAnchor="middle" fill="#374151" fontSize="26" fontWeight="700">{riskScore}</text>
                  <text x="70" y="86" textAnchor="middle" fill="#9ca3af" fontSize="9">/100</text>
                </svg>
                <div className="flex-1 space-y-2">
                  {[
                    { label: "Xác thực 2FA", ok: true },
                    { label: "IP Whitelist", ok: true },
                    { label: "Session Timeout", ok: true },
                    { label: "Nguyên tắc tối thiểu quyền", ok: false },
                    { label: "Phân tách nhiệm vụ (SoD)", ok: false },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      {item.ok ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                      <span className={item.ok ? "text-green-700" : "text-amber-700"} style={{ fontSize: "11px" }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Permission Heatmap */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Heatmap Ma trận Quyền (Tổng quan tất cả vai trò)</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-2 py-2 text-left text-muted-foreground sticky left-0 bg-card" style={{ fontSize: "10px", fontWeight: 500, minWidth: 140 }}>Module</th>
                    {roles.filter(r => r.isActive).map(r => (
                      <th key={r.id} className="px-1 py-2 text-center" style={{ fontSize: "9px", fontWeight: 600, color: r.color, minWidth: 56 }}>{r.label.length > 8 ? r.label.slice(0, 8) + ".." : r.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_MODULES.map(mod => (
                    <tr key={mod.id} className="border-t border-border/30">
                      <td className="px-2 py-1.5 sticky left-0 bg-card" style={{ fontSize: "10px" }}>{mod.name.length > 22 ? mod.name.slice(0, 22) + ".." : mod.name}</td>
                      {roles.filter(r => r.isActive).map(r => {
                        const perm = r.permissions.find(p => p.moduleId === mod.id);
                        if (!perm) return <td key={r.id} className="px-1 py-1.5 text-center"><div className="w-full h-5 bg-gray-50 rounded" /></td>;
                        const count = [perm.view, perm.create, perm.edit, perm.delete, perm.export, perm.approve, perm.manage].filter(Boolean).length;
                        const intensity = count / 7;
                        const bg = count === 0 ? "#f9fafb" : count === 7 ? `${r.color}30` : `${r.color}${Math.round(intensity * 25).toString(16).padStart(2, "0")}`;
                        return (
                          <td key={r.id} className="px-1 py-1.5 text-center">
                            <div className="w-full h-5 rounded flex items-center justify-center" style={{ background: bg }}>
                              <span style={{ fontSize: "9px", fontWeight: 600, color: count === 0 ? "#d1d5db" : r.color }}>{count}/7</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Suggestions */}
          {showAISuggestions && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>AI Phân tích & Đề xuất Bảo mật</h4>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Phát hiện {AI_SUGGESTIONS.length} vấn đề cần xem xét</p>
                  </div>
                </div>
                <button onClick={() => setShowAISuggestions(false)} className="text-muted-foreground hover:text-foreground cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                {AI_SUGGESTIONS.map(s => {
                  const typeIcon: Record<string, any> = { risk: ShieldAlert, conflict: AlertTriangle, optimize: Zap, anomaly: AlertCircle };
                  const typeColor: Record<string, string> = { risk: "#ef4444", conflict: "#f59e0b", optimize: "#3b82f6", anomaly: "#8b5cf6" };
                  const Icon = typeIcon[s.type] || Info;
                  const color = typeColor[s.type] || "#6b7280";
                  return (
                    <div key={s.id} className="bg-white/80 rounded-lg p-3.5 border border-white">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}12` }}>
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{s.title}</span>
                            <SeverityBadge severity={s.severity} />
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-muted-foreground" style={{ fontSize: "9px" }}>{s.affectedRole}</span>
                          </div>
                          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{s.description}</p>
                          <div className="mt-2 flex items-start gap-1.5">
                            <Sparkles className="w-3 h-3 text-purple-500 mt-0.5 shrink-0" />
                            <p className="text-purple-700" style={{ fontSize: "11px", fontWeight: 500 }}>{s.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Role Hierarchy Tree */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Sơ đồ Kế thừa Vai trò</h4>
            <div className="flex items-start gap-4 overflow-x-auto pb-2">
              {(() => {
                const levels = [1, 2, 3, 4, 5, 6];
                return levels.map(level => {
                  const lvRoles = roles.filter(r => r.level === level && r.isActive);
                  if (lvRoles.length === 0) return null;
                  return (
                    <div key={level} className="flex flex-col items-center gap-2 min-w-[120px]">
                      <span className="text-muted-foreground px-2 py-0.5 bg-secondary rounded" style={{ fontSize: "9px", fontWeight: 500 }}>Cấp {level}</span>
                      {lvRoles.map(r => (
                        <div key={r.id} className="px-3 py-2 rounded-lg border-2 text-center w-full" style={{ borderColor: r.color, background: `${r.color}08` }}>
                          <p style={{ fontSize: "11px", fontWeight: 600, color: r.color }}>{r.label}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{r.userCount} người</p>
                        </div>
                      ))}
                      {level < 6 && roles.some(r => r.level === level + 1 && r.isActive) && (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 2: MA TRẬN QUYỀN */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeTab === "matrix" && (
        <div className="space-y-5">
          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={matrixSelectedRole}
                onChange={e => setMatrixSelectedRole(e.target.value)}
                className="px-3 py-2 bg-input-background rounded-lg border-0 text-foreground cursor-pointer"
                style={{ fontSize: "12px" }}
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.label} ({r.userCount} người)</option>
                ))}
              </select>
              <button
                onClick={() => setMatrixEditing(!matrixEditing)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${matrixEditing ? "bg-green-100 text-green-700" : "bg-secondary text-foreground"}`}
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                {matrixEditing ? <><Unlock className="w-3.5 h-3.5" /> Đang sửa</> : <><Lock className="w-3.5 h-3.5" /> Chỉ xem</>}
              </button>
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${compareMode ? "bg-blue-100 text-blue-700" : "bg-secondary text-foreground"}`}
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" /> {compareMode ? "Tắt so sánh" : "So sánh"}
              </button>
              {compareMode && (
                <select
                  value={compareRoleId}
                  onChange={e => setCompareRoleId(e.target.value)}
                  className="px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 text-blue-700 cursor-pointer"
                  style={{ fontSize: "12px" }}
                >
                  {roles.filter(r => r.id !== matrixSelectedRole).map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              )}
            </div>
            {matrixEditing && (
              <button
                onClick={() => { setMatrixEditing(false); import("sonner").then(m => m.toast.success("Đã lưu thay đổi phân quyền")); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
                style={{ fontSize: "12px", fontWeight: 600 }}
              >
                <Check className="w-3.5 h-3.5" /> Lưu thay đổi
              </button>
            )}
          </div>

          {/* Role info header */}
          <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${matrixRole.color}15` }}>
                <Shield className="w-5 h-5" style={{ color: matrixRole.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>{matrixRole.label}</h3>
                  {!matrixRole.isActive && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded" style={{ fontSize: "9px", fontWeight: 600 }}>Vô hiệu</span>}
                  {matrixRole.isSystem && <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded" style={{ fontSize: "9px", fontWeight: 500 }}>Hệ thống</span>}
                </div>
                <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{matrixRole.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-secondary rounded-lg text-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>
                <Users className="w-3 h-3 inline mr-1" /> {matrixRole.userCount.toLocaleString()} người
              </span>
              {compareMode && compareRole && (
                <span className="px-3 py-1.5 rounded-lg text-blue-700" style={{ fontSize: "11px", fontWeight: 500, background: "#3b82f615" }}>
                  <ArrowLeftRight className="w-3 h-3 inline mr-1" /> vs {compareRole.label}
                </span>
              )}
            </div>
          </div>

          {/* Permission Matrix Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/30 border-b border-border">
                    <th className="px-4 py-3 text-left text-muted-foreground sticky left-0 bg-secondary/30 z-10" style={{ fontSize: "11px", fontWeight: 600, minWidth: 180 }}>Module</th>
                    {["Xem", "Tạo mới", "Sửa", "Xóa", "Xuất", "Phê duyệt", "Quản lý"].map(h => (
                      <th key={h} className="px-2 py-3 text-center text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600, minWidth: 64 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixRole.permissions.map((perm, idx) => {
                    const comparePerm = compareMode && compareRole ? compareRole.permissions.find(p => p.moduleId === perm.moduleId) : null;
                    const ModIcon = perm.icon;
                    return (
                      <tr key={perm.moduleId} className={`border-t border-border/30 ${idx % 2 === 0 ? "" : "bg-secondary/10"}`}>
                        <td className="px-4 py-2.5 sticky left-0 z-10" style={{ background: idx % 2 === 0 ? "var(--card)" : undefined }}>
                          <div className="flex items-center gap-2">
                            <ModIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{perm.module}</span>
                          </div>
                        </td>
                        {(["view", "create", "edit", "delete", "export", "approve", "manage"] as const).map(action => {
                          const val = perm[action] as boolean;
                          const cmpVal = comparePerm ? (comparePerm[action] as boolean) : null;
                          const isDiff = compareMode && cmpVal !== null && val !== cmpVal;
                          return (
                            <td key={action} className="px-2 py-2.5 text-center" style={isDiff ? { background: "#fef3c720" } : {}}>
                              <div className="flex items-center justify-center gap-1">
                                <PermToggle value={val} onChange={() => togglePermission(perm.moduleId, action)} disabled={!matrixEditing} />
                                {compareMode && cmpVal !== null && isDiff && (
                                  <span className="inline-flex w-5 h-5 rounded items-center justify-center" style={{ background: cmpVal ? "#22c55e15" : "#ef444415" }}>
                                    {cmpVal ? <Check className="w-2.5 h-2.5 text-green-500" /> : <X className="w-2.5 h-2.5 text-red-400" />}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Simulate box */}
          <div className="bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/5 rounded-xl border border-[#990803]/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[#990803]" />
              <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>Mô phỏng Quyền truy cập</h4>
            </div>
            <p className="text-muted-foreground mb-3" style={{ fontSize: "11px" }}>Chọn một user để xem chính xác quyền mà người đó có trong hệ thống</p>
            <div className="flex gap-2 flex-wrap">
              <select
                value={simulateUserId || ""}
                onChange={e => setSimulateUserId(e.target.value || null)}
                className="px-3 py-2 bg-white rounded-lg border border-border text-foreground cursor-pointer flex-1 min-w-[200px]"
                style={{ fontSize: "12px" }}
              >
                <option value="">Chọn người dùng...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.department}</option>)}
              </select>
              {simulateUserId && (() => {
                const su = users.find(u => u.id === simulateUserId);
                const sr = su ? roles.find(r => r.id === su.roleId) : null;
                if (!su || !sr) return null;
                return (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-border">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ background: sr.color, fontSize: "8px", fontWeight: 700 }}>{su.initials}</div>
                    <span style={{ fontSize: "11px", fontWeight: 500 }}>{su.name}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: sr.color, background: `${sr.color}15` }}>{sr.label}</span>
                    {su.tempExpiry && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded" style={{ fontSize: "9px" }}><Timer className="w-2.5 h-2.5 inline" /> Hết {su.tempExpiry}</span>}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 3: QUẢN LÝ VAI TRÒ */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeTab === "roles" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={roleSearch}
                onChange={e => setRoleSearch(e.target.value)}
                placeholder="Tìm kiếm vai trò..."
                className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none"
                style={{ fontSize: "13px" }}
              />
            </div>
            <button
              onClick={() => {
                const newRole: RoleConfig = {
                  id: `R${Date.now()}`, role: "new_role", label: "Vai trò mới", description: "Mô tả vai trò mới",
                  userCount: 0, color: "#6b7280", level: 4, inheritsFrom: null, isSystem: false, isActive: true,
                  createdAt: "2026-03-13", updatedAt: "2026-03-13",
                  permissions: ALL_MODULES.map(m => allFalse(m.id)),
                  restrictions: { ipWhitelist: [], allowedHours: null, maxSessions: 2, require2FA: false, sessionTimeout: 120, allowMobile: true, allowedSubsidiaries: [] },
                };
                setRoles(prev => [...prev, newRole]);
                import("sonner").then(m => m.toast.success("Đã tạo vai trò mới. Hãy cấu hình quyền ở tab Ma trận."));
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              <Plus className="w-4 h-4" /> Tạo vai trò mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {roles.filter(r => !roleSearch || r.label.toLowerCase().includes(roleSearch.toLowerCase()) || r.description.toLowerCase().includes(roleSearch.toLowerCase())).map(role => {
              const permCount = role.permissions.reduce((s, p) => s + [p.view, p.create, p.edit, p.delete, p.export, p.approve, p.manage].filter(Boolean).length, 0);
              const maxPerm = ALL_MODULES.length * 7;
              return (
                <div key={role.id} className={`bg-card rounded-xl border-2 p-4 transition-all hover:shadow-md ${role.isActive ? "border-border" : "border-red-200 opacity-70"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${role.color}15` }}>
                        <Shield className="w-5 h-5" style={{ color: role.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{role.label}</h5>
                          {role.isSystem && <Lock className="w-3 h-3 text-gray-400" />}
                          {!role.isActive && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded" style={{ fontSize: "8px", fontWeight: 600 }}>TẮT</span>}
                        </div>
                        <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{role.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-secondary/30 rounded-lg p-2 text-center">
                      <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 700 }}>{role.userCount.toLocaleString()}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "9px" }}>Người dùng</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-2 text-center">
                      <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 700 }}>{permCount}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "9px" }}>Quyền / {maxPerm}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-2 text-center">
                      <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 700 }}>Cấp {role.level}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "9px" }}>Phân cấp</p>
                    </div>
                  </div>

                  {/* Permission bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Mức quyền</span>
                      <span className="text-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>{Math.round((permCount / maxPerm) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(permCount / maxPerm) * 100}%`, background: role.color }} />
                    </div>
                  </div>

                  {/* Restrictions badges */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {role.restrictions.require2FA && <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded" style={{ fontSize: "9px" }}>2FA</span>}
                    {role.restrictions.ipWhitelist.length > 0 && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded" style={{ fontSize: "9px" }}>IP Whitelist</span>}
                    {role.restrictions.allowedHours && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded" style={{ fontSize: "9px" }}>{role.restrictions.allowedHours.from}-{role.restrictions.allowedHours.to}</span>}
                    {!role.restrictions.allowMobile && <span className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded" style={{ fontSize: "9px" }}>Cấm Mobile</span>}
                    <span className="px-1.5 py-0.5 bg-gray-50 text-gray-600 rounded" style={{ fontSize: "9px" }}>Timeout: {role.restrictions.sessionTimeout}p</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-3 border-t border-border/50">
                    <button onClick={() => { setMatrixSelectedRole(role.id); setActiveTab("matrix"); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer" style={{ fontSize: "10px", fontWeight: 500 }}>
                      <Layers className="w-3 h-3" /> Ma trận
                    </button>
                    <button onClick={() => handleCloneRole(role.id)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer" style={{ fontSize: "10px", fontWeight: 500 }}>
                      <Copy className="w-3 h-3" /> Nhân bản
                    </button>
                    <button onClick={() => handleToggleRoleActive(role.id)} className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${role.isActive ? "bg-amber-50 hover:bg-amber-100 text-amber-700" : "bg-green-50 hover:bg-green-100 text-green-700"}`} style={{ fontSize: "10px", fontWeight: 500 }}>
                      {role.isActive ? <><ShieldOff className="w-3 h-3" /> Tắt</> : <><ShieldCheck className="w-3 h-3" /> Bật</>}
                    </button>
                    {!role.isSystem && (
                      <button onClick={() => handleDeleteRole(role.id)} className="flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer" style={{ fontSize: "10px", fontWeight: 500 }}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 4: GÁN QUYỀN USER */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeTab === "users" && (
        <div className="space-y-5">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Tìm theo tên, email, phòng ban..."
                className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none"
                style={{ fontSize: "13px" }}
              />
            </div>
            <select value={userSubFilter} onChange={e => setUserSubFilter(e.target.value)} className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả đơn vị</option>
              {SUBSIDIARIES.map(s => <option key={s} value={s}>{s.length > 30 ? s.slice(0, 30) + "..." : s}</option>)}
            </select>
            <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả vai trò</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
            <button
              onClick={() => import("sonner").then(m => m.toast.info("Tính năng gán hàng loạt đang phát triển"))}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
              style={{ fontSize: "12px", fontWeight: 600 }}
            >
              <UserPlus className="w-4 h-4" /> Gán vai trò
            </button>
          </div>

          {/* Summary badges */}
          <div className="flex gap-2 flex-wrap">
            {roles.map(r => {
              const count = users.filter(u => u.roleId === r.id).length;
              return (
                <button
                  key={r.id}
                  onClick={() => setUserRoleFilter(userRoleFilter === r.id ? "all" : r.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border ${userRoleFilter === r.id ? "border-current" : "border-transparent bg-secondary/50 hover:bg-secondary"}`}
                  style={userRoleFilter === r.id ? { color: r.color, background: `${r.color}10`, borderColor: `${r.color}40` } : { fontSize: "11px" }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                  <span style={{ fontSize: "11px", fontWeight: 500 }}>{r.label}</span>
                  <span className="px-1.5 py-0.5 bg-white/50 rounded" style={{ fontSize: "9px", fontWeight: 700 }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* User Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{filteredUsers.length}/{users.length} người dùng</p>
            </div>
            <div className="divide-y divide-border/30">
              {filteredUsers.length === 0 && <EmptyState variant="search" compact />}
              {filteredUsers.map(u => {
                const r = roles.find(ro => ro.id === u.roleId);
                return (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: r?.color || "#6b7280", fontSize: "10px", fontWeight: 700 }}>
                      {u.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{u.name}</span>
                        {u.tempExpiry && <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded flex items-center gap-0.5" style={{ fontSize: "9px" }}><Timer className="w-2.5 h-2.5" /> Tạm đến {u.tempExpiry}</span>}
                        {!u.isActive && <span className="px-1.5 py-0.5 bg-red-50 text-red-600 rounded" style={{ fontSize: "9px" }}>Vô hiệu</span>}
                      </div>
                      <p className="text-muted-foreground truncate" style={{ fontSize: "11px" }}>{u.email} &bull; {u.department}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{u.subsidiary.length > 35 ? u.subsidiary.slice(0, 35) + "..." : u.subsidiary}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-1 rounded-lg" style={{ fontSize: "11px", fontWeight: 600, color: r?.color, background: `${r?.color}12` }}>
                        {r?.label}
                      </span>
                      <p className="text-muted-foreground mt-1" style={{ fontSize: "9px" }}>Login: {u.lastLogin.slice(5)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { setSimulateUserId(u.id); setActiveTab("matrix"); }}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors cursor-pointer" title="Mô phỏng quyền"
                      >
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={async () => {
                          const ok = await confirm({ title: "Thu hồi quyền?", message: `Thu hồi vai trò "${r?.label}" khỏi ${u.name}?`, variant: "warning", confirmLabel: "Thu hồi" });
                          if (ok) {
                            setUsers(prev => prev.map(uu => uu.id === u.id ? { ...uu, roleId: "R6" } : uu));
                            import("sonner").then(m => m.toast.success(`Đã chuyển ${u.name} về vai trò Học viên`));
                          }
                        }}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Thu hồi quyền"
                      >
                        <UserMinus className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 5: CHÍNH SÁCH BẢO MẬT */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeTab === "security" && (
        <div className="space-y-5">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "all", label: "Tất cả", icon: Shield },
              { id: "authentication", label: "Xác thực", icon: KeyRound },
              { id: "session", label: "Phiên đăng nhập", icon: Clock },
              { id: "access", label: "Kiểm soát Truy cập", icon: Lock },
              { id: "compliance", label: "Tuân thủ", icon: ShieldCheck },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSecCategoryFilter(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${secCategoryFilter === cat.id ? "bg-[#990803] text-white" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
                style={{ fontSize: "12px", fontWeight: secCategoryFilter === cat.id ? 600 : 400 }}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Policies list */}
          <div className="space-y-3">
            {filteredPolicies.map(policy => {
              const catIcons: Record<string, any> = { authentication: KeyRound, session: Clock, access: Lock, compliance: ShieldCheck };
              const catColors: Record<string, string> = { authentication: "#8b5cf6", session: "#3b82f6", access: "#ef4444", compliance: "#22c55e" };
              const Icon = catIcons[policy.category] || Shield;
              const color = catColors[policy.category] || "#6b7280";
              return (
                <div key={policy.id} className={`bg-card rounded-xl border p-4 transition-all ${policy.enabled ? "border-border" : "border-red-200 opacity-70"}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}12` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h5 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{policy.name}</h5>
                        <span className={`px-1.5 py-0.5 rounded ${policy.enabled ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`} style={{ fontSize: "9px", fontWeight: 600 }}>
                          {policy.enabled ? "Đang bật" : "Đã tắt"}
                        </span>
                      </div>
                      <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{policy.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Settings className="w-3 h-3 text-muted-foreground" />
                        <span className="text-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>{policy.value}</span>
                      </div>
                      {policy.options && (
                        <div className="mt-2 flex gap-1.5 flex-wrap">
                          {policy.options.map(opt => (
                            <span key={opt} className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "10px" }}>{opt}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleTogglePolicy(policy.id)}
                      className="shrink-0 cursor-pointer"
                      title={policy.enabled ? "Tắt chính sách" : "Bật chính sách"}
                    >
                      {policy.enabled ? (
                        <ToggleRight className="w-8 h-8 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Role Security Comparison */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>So sánh Cấu hình Bảo mật theo Vai trò</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500, minWidth: 120 }}>Vai trò</th>
                    <th className="px-3 py-2 text-center text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>2FA</th>
                    <th className="px-3 py-2 text-center text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>IP Whitelist</th>
                    <th className="px-3 py-2 text-center text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Giờ truy cập</th>
                    <th className="px-3 py-2 text-center text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Max phiên</th>
                    <th className="px-3 py-2 text-center text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Timeout</th>
                    <th className="px-3 py-2 text-center text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Mobile</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.filter(r => r.isActive).map((r, idx) => (
                    <tr key={r.id} className={`border-t border-border/30 ${idx % 2 !== 0 ? "bg-secondary/10" : ""}`}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                          <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{r.label}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {r.restrictions.require2FA ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-300 mx-auto" />}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {r.restrictions.ipWhitelist.length > 0 ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-300 mx-auto" />}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span style={{ fontSize: "11px" }}>{r.restrictions.allowedHours ? `${r.restrictions.allowedHours.from}-${r.restrictions.allowedHours.to}` : "24/7"}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span style={{ fontSize: "11px", fontWeight: 600 }}>{r.restrictions.maxSessions}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span style={{ fontSize: "11px" }}>{r.restrictions.sessionTimeout}p</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {r.restrictions.allowMobile ? <Smartphone className="w-4 h-4 text-green-500 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* TAB 6: NHẬT KÝ */}
      {/* ═══════════════════════════════════════════════════ */}
      {activeTab === "audit" && (
        <div className="space-y-5">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                placeholder="Tìm theo người thực hiện, hành động, đối tượng..."
                className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none"
                style={{ fontSize: "13px" }}
              />
            </div>
            <select value={auditSeverityFilter} onChange={e => setAuditSeverityFilter(e.target.value)} className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả mức độ</option>
              <option value="info">Thông tin</option>
              <option value="warning">Cảnh báo</option>
              <option value="critical">Nghiêm trọng</option>
            </select>
            <button onClick={() => import("sonner").then(m => m.toast.success("Đang xuất nhật ký..."))} className="flex items-center gap-1.5 px-3 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
              <Download className="w-3.5 h-3.5" /> Xuất log
            </button>
          </div>

          {/* Stats mini */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-blue-800" style={{ fontSize: "18px", fontWeight: 700 }}>{auditEntries.filter(a => a.severity === "info").length}</p>
                <p className="text-blue-600" style={{ fontSize: "10px" }}>Thông tin</p>
              </div>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-amber-800" style={{ fontSize: "18px", fontWeight: 700 }}>{auditEntries.filter(a => a.severity === "warning").length}</p>
                <p className="text-amber-600" style={{ fontSize: "10px" }}>Cảnh báo</p>
              </div>
            </div>
            <div className="bg-red-50 rounded-xl p-3 flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-red-800" style={{ fontSize: "18px", fontWeight: 700 }}>{auditEntries.filter(a => a.severity === "critical").length}</p>
                <p className="text-red-600" style={{ fontSize: "10px" }}>Nghiêm trọng</p>
              </div>
            </div>
          </div>

          {/* Audit timeline */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50">
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{filteredAudit.length}/{auditEntries.length} bản ghi</p>
            </div>
            <div className="divide-y divide-border/30">
              {filteredAudit.length === 0 && <EmptyState variant="search" compact />}
              {filteredAudit.map((entry, idx) => {
                const sevConfig: Record<string, { icon: any; color: string; bg: string }> = {
                  info: { icon: Info, color: "#3b82f6", bg: "#3b82f612" },
                  warning: { icon: AlertTriangle, color: "#f59e0b", bg: "#f59e0b12" },
                  critical: { icon: ShieldAlert, color: "#ef4444", bg: "#ef444412" },
                };
                const sc = sevConfig[entry.severity] || sevConfig.info;
                const SevIcon = sc.icon;
                return (
                  <div key={entry.id} className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: sc.bg }}>
                      <SevIcon className="w-4 h-4" style={{ color: sc.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{entry.action}</span>
                        <SeverityBadge severity={entry.severity} />
                      </div>
                      <p className="text-foreground" style={{ fontSize: "11px" }}>
                        <span className="text-muted-foreground">Đối tượng:</span> {entry.target}
                      </p>
                      <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>{entry.details}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-muted-foreground flex items-center gap-1" style={{ fontSize: "10px" }}>
                          <Users className="w-3 h-3" /> {entry.user}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1" style={{ fontSize: "10px" }}>
                          <Clock className="w-3 h-3" /> {entry.timestamp}
                        </span>
                      </div>
                    </div>
                    <button className="px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer shrink-0" style={{ fontSize: "10px" }}>
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
