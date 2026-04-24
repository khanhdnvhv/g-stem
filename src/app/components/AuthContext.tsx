import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

/* ================================================================ */
/*  GELEXIMCO STEM PLATFORM — Authentication Context                 */
/*  Hỗ trợ 4 loại tenant × 15 StemRole theo kế hoạch chuyển đổi       */
/*  Ref: docs/STEM-Transformation-Plan.md §10, docs/permission-matrix */
/* ================================================================ */

export type TenantType = "supplier" | "distributor" | "school" | "authority";

export type StemRole =
  | "supplier_admin" | "supplier_content" | "supplier_sales" | "supplier_warranty"
  | "distributor_admin" | "distributor_sales" | "distributor_finance"
  | "school_principal" | "school_admin" | "school_itadmin"
  | "authority_admin" | "authority_viewer"
  | "teacher" | "student"
  | "system_admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  /** Tổ chức người dùng trực thuộc */
  tenantId: string;
  tenantName: string;
  tenantType: TenantType;
  /** Vai trò nghiệp vụ trong phân hệ STEM */
  role: StemRole;
  /** Giữ trường cũ cho tương thích sidebar 3-role legacy */
  legacyRole: "admin" | "instructor" | "learner";
  position: string;
  initials: string;
  /** Đối tượng đã xác thực qua VNeID hay chưa (giả lập) */
  vneidVerified?: boolean;
  /** Tỉnh/huyện nếu là authority hoặc school */
  province?: string;
  district?: string;
  /** Cấp học của giáo viên/học sinh */
  gradeLevel?: string;
  /** Bộ môn của giáo viên */
  subject?: string;
}

/* ================================================================ */
/*  9 DEMO ACCOUNTS — mỗi account đại diện 1 vai trò nghiệp vụ chính */
/* ================================================================ */
export const demoAccounts: AuthUser[] = [
  {
    id: "U-SUP-01",
    name: "Nguyễn Văn Minh",
    email: "supplier@geleximco-stem.vn",
    password: "stem@123",
    avatar: "",
    tenantId: "T-SUP-01",
    tenantName: "Geleximco STEM (NCC)",
    tenantType: "supplier",
    role: "supplier_admin",
    legacyRole: "admin",
    position: "Giám đốc Vận hành Nền tảng STEM",
    initials: "NM",
    vneidVerified: true,
  },
  {
    id: "U-SUP-02",
    name: "Phạm Thị Hương",
    email: "content@geleximco-stem.vn",
    password: "stem@123",
    avatar: "",
    tenantId: "T-SUP-01",
    tenantName: "Geleximco STEM (NCC)",
    tenantType: "supplier",
    role: "supplier_content",
    legacyRole: "instructor",
    position: "Trưởng nhóm Nội dung & Chương trình",
    initials: "PH",
  },
  {
    id: "U-DIS-01",
    name: "Trần Quang Dũng",
    email: "distributor@abc-edu.vn",
    password: "stem@123",
    avatar: "",
    tenantId: "T-DIS-01",
    tenantName: "Đại lý Giáo dục ABC",
    tenantType: "distributor",
    role: "distributor_admin",
    legacyRole: "admin",
    position: "Giám đốc Đại lý",
    initials: "TD",
  },
  {
    id: "U-DIS-02",
    name: "Lê Hoài Thu",
    email: "sales@abc-edu.vn",
    password: "stem@123",
    avatar: "",
    tenantId: "T-DIS-01",
    tenantName: "Đại lý Giáo dục ABC",
    tenantType: "distributor",
    role: "distributor_sales",
    legacyRole: "instructor",
    position: "Trưởng phòng Kinh doanh",
    initials: "LT",
  },
  {
    id: "U-SCH-01",
    name: "Nguyễn Thị Lan",
    email: "principal@thcs-bavi.edu.vn",
    password: "stem@123",
    avatar: "",
    tenantId: "T-SCH-01",
    tenantName: "Trường THCS Ba Vì",
    tenantType: "school",
    role: "school_principal",
    legacyRole: "admin",
    position: "Hiệu trưởng",
    initials: "NL",
    province: "Hà Nội",
    district: "Ba Vì",
    vneidVerified: true,
  },
  {
    id: "U-TCH-01",
    name: "Phạm Anh Tuấn",
    email: "teacher.toan@thcs-bavi.edu.vn",
    password: "stem@123",
    avatar: "",
    tenantId: "T-SCH-01",
    tenantName: "Trường THCS Ba Vì",
    tenantType: "school",
    role: "teacher",
    legacyRole: "instructor",
    position: "Giáo viên Toán — STEM CT2",
    initials: "PT",
    province: "Hà Nội",
    district: "Ba Vì",
    subject: "Toán",
    vneidVerified: true,
  },
  {
    id: "U-STU-01",
    name: "Lê Hoàng Nam",
    email: "student01@thcs-bavi.edu.vn",
    password: "stem@123",
    avatar: "",
    tenantId: "T-SCH-01",
    tenantName: "Trường THCS Ba Vì",
    tenantType: "school",
    role: "student",
    legacyRole: "learner",
    position: "Học sinh — Lớp 8A",
    initials: "LN",
    province: "Hà Nội",
    district: "Ba Vì",
    gradeLevel: "THCS 8",
    vneidVerified: true,
  },
  {
    id: "U-AUT-01",
    name: "Đỗ Thu Trang",
    email: "doet@hanoi.gov.vn",
    password: "stem@123",
    avatar: "",
    tenantId: "T-AUT-01",
    tenantName: "Sở GD&ĐT Hà Nội",
    tenantType: "authority",
    role: "authority_admin",
    legacyRole: "admin",
    position: "Chuyên viên Phòng Giáo dục Trung học",
    initials: "DT",
    province: "Hà Nội",
    vneidVerified: true,
  },
  {
    id: "U-SYS-01",
    name: "Vũ Minh Khang",
    email: "sysadmin@geleximco-stem.vn",
    password: "stem@123",
    avatar: "",
    tenantId: "T-SUP-01",
    tenantName: "Platform",
    tenantType: "supplier",
    role: "system_admin",
    legacyRole: "admin",
    position: "Kỹ sư Quản trị Hệ thống",
    initials: "VK",
  },
];

/* ================================================================ */
/*  ROLE LABELS & PRESENTATION                                       */
/* ================================================================ */
export const roleLabelsMap: Record<StemRole, { label: string; color: string; bg: string }> = {
  supplier_admin:     { label: "NCC · Quản trị",       color: "#990803", bg: "#99080315" },
  supplier_content:   { label: "NCC · Nội dung",       color: "#7a0602", bg: "#7a060215" },
  supplier_sales:     { label: "NCC · Kinh doanh",     color: "#c8a84e", bg: "#c8a84e15" },
  supplier_warranty:  { label: "NCC · Bảo hành",       color: "#f59e0b", bg: "#f59e0b15" },
  distributor_admin:  { label: "Đại lý · Quản trị",    color: "#c8a84e", bg: "#c8a84e15" },
  distributor_sales:  { label: "Đại lý · Kinh doanh",  color: "#2e86de", bg: "#2e86de15" },
  distributor_finance:{ label: "Đại lý · Tài chính",   color: "#16a34a", bg: "#16a34a15" },
  school_principal:   { label: "Trường · Hiệu trưởng", color: "#2563eb", bg: "#2563eb15" },
  school_admin:       { label: "Trường · Quản trị",    color: "#2563eb", bg: "#2563eb15" },
  school_itadmin:     { label: "Trường · CNTT",        color: "#0891b2", bg: "#0891b215" },
  authority_admin:    { label: "Sở/Bộ GD&ĐT",          color: "#7c3aed", bg: "#7c3aed15" },
  authority_viewer:   { label: "Sở/Bộ · Xem",          color: "#a78bfa", bg: "#a78bfa15" },
  teacher:            { label: "Giáo viên",            color: "#0891b2", bg: "#0891b215" },
  student:            { label: "Học sinh",             color: "#16a34a", bg: "#16a34a15" },
  system_admin:       { label: "Quản trị Nền tảng",    color: "#e74c3c", bg: "#e74c3c15" },
};

export const tenantTypeLabelsMap: Record<TenantType, { label: string; color: string; short: string }> = {
  supplier:    { label: "Nhà cung cấp",      short: "NCC",    color: "#990803" },
  distributor: { label: "Đại lý phân phối",  short: "Đại lý", color: "#c8a84e" },
  school:      { label: "Trường học",        short: "Trường", color: "#2563eb" },
  authority:   { label: "Cơ quan quản lý",   short: "Sở/Bộ",  color: "#7c3aed" },
};

/** Default dashboard route theo tenantType/role */
export function getDefaultRouteForUser(user: AuthUser): string {
  switch (user.role) {
    case "supplier_admin":
    case "supplier_content":
    case "supplier_sales":
    case "supplier_warranty":
      return "/supplier/dashboard";
    case "distributor_admin":
    case "distributor_sales":
    case "distributor_finance":
      return "/distributor/dashboard";
    case "school_principal":
    case "school_admin":
    case "school_itadmin":
      return "/school/dashboard";
    case "authority_admin":
    case "authority_viewer":
      return "/authority/dashboard";
    case "teacher":
      return "/teacher/dashboard";
    case "student":
      return "/student/dashboard";
    case "system_admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
}

/* ================================================================ */
/*  CONTEXT                                                          */
/* ================================================================ */
interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  loginAs: (account: AuthUser) => void;
  loginWithVneID: () => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = "geleximco_stem_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((email: string, password: string) => {
    const found = demoAccounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );
    if (found) {
      setUser(found);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      return { success: true };
    }
    return { success: false, error: "Email hoặc mật khẩu không đúng" };
  }, []);

  const loginAs = useCallback((account: AuthUser) => {
    setUser(account);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  }, []);

  /** Demo đăng nhập bằng VNeID — chọn tài khoản đầu tiên có vneidVerified */
  const loginWithVneID = useCallback(() => {
    const verified = demoAccounts.find((a) => a.vneidVerified);
    if (verified) {
      setUser(verified);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(verified));
      return { success: true };
    }
    return { success: false, error: "Không có tài khoản VNeID hợp lệ" };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, loginAs, loginWithVneID, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
