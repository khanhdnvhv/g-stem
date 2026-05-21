import type { StemRole } from "../../AuthContext";

/* ================================================================ */
/*  TYPES                                                           */
/* ================================================================ */
export type AccountStatus = "active" | "locked" | "pending";

export interface Account {
  id: string;
  code: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  gender?: "male" | "female" | "other";
  role: StemRole;
  orgId: string;
  status: AccountStatus;
  lastLogin: string | null;
  createdAt: string;
  roleAssignedAt?: string;
  roleAssignedBy?: string;
  manualNote?: string;
}

/* ================================================================ */
/*  ACTIVITY LOG                                                    */
/* ================================================================ */
export type ActivityAction = "login" | "logout" | "password_change" | "content_change" | "other";

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  login:           "Đăng nhập",
  logout:          "Đăng xuất",
  password_change: "Đổi mật khẩu",
  content_change:  "Thay đổi nội dung",
  other:           "Khác",
};

export interface ActivityLog {
  id: string;
  time: string;
  action: ActivityAction;
  ip: string;
  device: string;
}

export const MOCK_ACTIVITY_LOGS: Record<string, ActivityLog[]> = {
  "ACC-001": [
    { id: "al1",  time: "2026-05-20T07:00:00Z", action: "login",           ip: "103.28.12.5",   device: "Chrome 124 / Windows 10" },
    { id: "al2",  time: "2026-05-19T16:55:00Z", action: "logout",          ip: "103.28.12.5",   device: "Chrome 124 / Windows 10" },
    { id: "al3",  time: "2026-05-19T08:30:00Z", action: "login",           ip: "103.28.12.5",   device: "Chrome 124 / Windows 10" },
    { id: "al4",  time: "2026-05-18T14:10:00Z", action: "content_change",  ip: "103.28.12.5",   device: "Chrome 124 / Windows 10" },
    { id: "al5",  time: "2026-05-18T09:00:00Z", action: "login",           ip: "103.28.12.5",   device: "Edge 122 / Windows 10" },
    { id: "al6",  time: "2026-05-17T17:00:00Z", action: "logout",          ip: "103.28.12.5",   device: "Edge 122 / Windows 10" },
    { id: "al7",  time: "2026-05-10T11:20:00Z", action: "password_change", ip: "103.28.12.5",   device: "Chrome 124 / Windows 10" },
    { id: "al8",  time: "2026-04-28T08:00:00Z", action: "login",           ip: "14.177.98.22",  device: "Safari 17 / macOS" },
  ],
  "ACC-002": [
    { id: "al9",  time: "2026-05-19T14:30:00Z", action: "login",          ip: "113.160.5.88",  device: "Chrome 124 / Windows 11" },
    { id: "al10", time: "2026-05-19T11:00:00Z", action: "content_change", ip: "113.160.5.88",  device: "Chrome 124 / Windows 11" },
    { id: "al11", time: "2026-05-18T08:00:00Z", action: "login",          ip: "113.160.5.88",  device: "Firefox 125 / Windows 11" },
    { id: "al12", time: "2026-05-17T17:30:00Z", action: "logout",         ip: "113.160.5.88",  device: "Firefox 125 / Windows 11" },
    { id: "al13", time: "2026-05-05T10:00:00Z", action: "password_change",ip: "113.160.5.88",  device: "Chrome 124 / Windows 11" },
  ],
  "ACC-010": [
    { id: "al14", time: "2026-05-20T07:30:00Z", action: "login",          ip: "27.75.220.11",  device: "Chrome 124 / macOS" },
    { id: "al15", time: "2026-05-19T12:00:00Z", action: "content_change", ip: "27.75.220.11",  device: "Chrome 124 / macOS" },
    { id: "al16", time: "2026-05-19T09:00:00Z", action: "login",          ip: "27.75.220.11",  device: "Chrome 124 / macOS" },
    { id: "al17", time: "2026-05-18T17:00:00Z", action: "logout",         ip: "27.75.220.11",  device: "Chrome 124 / macOS" },
    { id: "al18", time: "2026-05-15T08:00:00Z", action: "login",          ip: "27.75.220.45",  device: "Safari 17 / iOS 17" },
    { id: "al19", time: "2026-05-01T11:30:00Z", action: "password_change",ip: "27.75.220.11",  device: "Chrome 124 / macOS" },
  ],
  "ACC-020": [
    { id: "al20", time: "2026-05-17T14:00:00Z", action: "login",          ip: "118.70.88.3",   device: "Chrome 124 / Windows 10" },
    { id: "al21", time: "2026-05-17T13:00:00Z", action: "content_change", ip: "118.70.88.3",   device: "Chrome 124 / Windows 10" },
    { id: "al22", time: "2026-05-16T08:30:00Z", action: "login",          ip: "118.70.88.3",   device: "Chrome 124 / Windows 10" },
    { id: "al23", time: "2026-05-15T17:00:00Z", action: "logout",         ip: "118.70.88.3",   device: "Chrome 124 / Windows 10" },
  ],
};

/* ================================================================ */
/*  ACCOUNT CHANGE LOG                                              */
/* ================================================================ */
export interface AccountChangeLog {
  id: string;
  time: string;
  admin: string;
  action: string;
  field: string;
  before: string;
  after: string;
}

export const MOCK_ACCOUNT_CHANGE_LOGS: Record<string, AccountChangeLog[]> = {
  "ACC-001": [
    { id: "acl1", time: "2026-05-10T09:00:00Z", admin: "system",               action: "Tự đổi mật khẩu",   field: "Mật khẩu",     before: "***",                  after: "*** (mới)" },
    { id: "acl2", time: "2025-06-01T10:00:00Z", admin: "superadmin@geleximco.vn", action: "Cập nhật thông tin",field: "Số điện thoại", before: "0901000000",          after: "0912345678" },
    { id: "acl3", time: "2024-01-10T08:00:00Z", admin: "system",               action: "Tạo tài khoản",      field: "—",             before: "—",                    after: "Khởi tạo" },
  ],
  "ACC-002": [
    { id: "acl4", time: "2026-03-15T11:00:00Z", admin: "khang@geleximco-stem.vn", action: "Đổi vai trò",      field: "Vai trò",       before: "Xem Toàn ngành",      after: "Cơ quan QL" },
    { id: "acl5", time: "2025-05-20T09:00:00Z", admin: "khang@geleximco-stem.vn", action: "Cập nhật thông tin",field: "Ngày sinh",    before: "—",                    after: "15/03/1978" },
    { id: "acl6", time: "2024-02-01T00:00:00Z", admin: "system",               action: "Tạo tài khoản",      field: "—",             before: "—",                    after: "Khởi tạo" },
  ],
  "ACC-005": [
    { id: "acl7", time: "2026-04-01T08:30:00Z", admin: "khang@geleximco-stem.vn", action: "Khoá tài khoản",  field: "Trạng thái",    before: "Đang hoạt động",      after: "Đã khoá" },
    { id: "acl8", time: "2024-03-01T00:00:00Z", admin: "system",               action: "Tạo tài khoản",      field: "—",             before: "—",                    after: "Khởi tạo" },
  ],
  "ACC-010": [
    { id: "acl9",  time: "2025-12-01T10:00:00Z", admin: "khang@geleximco-stem.vn", action: "Đổi vai trò",    field: "Vai trò",       before: "Quản lý Trường",      after: "Hiệu trưởng" },
    { id: "acl10", time: "2025-09-10T09:00:00Z", admin: "khang@geleximco-stem.vn", action: "Cập nhật thông tin", field: "SĐT",       before: "0911111111",          after: "0987001010" },
    { id: "acl11", time: "2024-08-01T00:00:00Z", admin: "system",               action: "Tạo tài khoản",      field: "—",           before: "—",                    after: "Khởi tạo (đồng bộ K12)" },
  ],
  "ACC-021": [
    { id: "acl12", time: "2026-04-10T09:00:00Z", admin: "khang@geleximco-stem.vn", action: "Khoá tài khoản", field: "Trạng thái",   before: "Đang hoạt động",      after: "Đã khoá" },
    { id: "acl13", time: "2024-09-05T00:00:00Z", admin: "system",               action: "Tạo tài khoản",      field: "—",           before: "—",                    after: "Khởi tạo" },
  ],
};

/* ================================================================ */
/*  ROLE DISPLAY CONFIG                                             */
/* ================================================================ */
export const ROLE_DISPLAY: Record<StemRole, { label: string; color: string; bg: string; group: string }> = {
  system_admin:       { label: "Quản trị HT",    color: "#581c87", bg: "#f3e8ff", group: "Quản trị Hệ thống" },
  authority_admin:    { label: "Cơ quan QL",      color: "#1e40af", bg: "#dbeafe", group: "Cơ quan QL" },
  authority_viewer:   { label: "Xem Toàn ngành",  color: "#1d4ed8", bg: "#eff6ff", group: "Cơ quan QL" },
  school_principal:   { label: "Hiệu trưởng",     color: "#0e7490", bg: "#cffafe", group: "Quản lý Trường" },
  school_admin:       { label: "Quản lý Trường",  color: "#0369a1", bg: "#e0f2fe", group: "Quản lý Trường" },
  school_itadmin:     { label: "Quản trị CNTT",   color: "#0f766e", bg: "#ccfbf1", group: "Quản lý Trường" },
  teacher:            { label: "Giáo viên",        color: "#6d28d9", bg: "#ede9fe", group: "Giáo viên" },
  student:            { label: "Học sinh",         color: "#15803d", bg: "#dcfce7", group: "Học sinh" },
  supplier_admin:     { label: "Admin NCC",        color: "#92400e", bg: "#fef3c7", group: "NCC" },
  supplier_content:   { label: "Biên soạn",        color: "#b45309", bg: "#fef9c3", group: "NCC" },
  supplier_sales:     { label: "Kinh doanh",       color: "#c2410c", bg: "#fff7ed", group: "NCC" },
  supplier_warranty:  { label: "Bảo hành",         color: "#9a3412", bg: "#ffedd5", group: "NCC" },
  distributor_admin:  { label: "Admin Đại lý",     color: "#065f46", bg: "#d1fae5", group: "Đại lý" },
  distributor_sales:  { label: "Sales Đại lý",     color: "#047857", bg: "#ecfdf5", group: "Đại lý" },
  distributor_finance:{ label: "Tài chính Đại lý", color: "#064e3b", bg: "#d1fae5", group: "Đại lý" },
};

export const ROLE_FILTER_GROUPS: Record<string, StemRole[]> = {
  "Học sinh":            ["student"],
  "Giáo viên":           ["teacher"],
  "Quản lý Trường":      ["school_principal", "school_admin", "school_itadmin"],
  "Cơ quan QL":          ["authority_admin", "authority_viewer"],
  "NCC":                 ["supplier_admin", "supplier_content", "supplier_sales", "supplier_warranty"],
  "Quản trị Hệ thống":   ["system_admin"],
};

export const STATUS_DISPLAY: Record<AccountStatus, { label: string; color: string; bg: string; dot: string }> = {
  active:  { label: "Đang hoạt động",  color: "#15803d", bg: "#dcfce7", dot: "#15803d" },
  locked:  { label: "Đã khoá",         color: "#dc2626", bg: "#fee2e2", dot: "#dc2626" },
  pending: { label: "Chờ kích hoạt",   color: "#b45309", bg: "#fef3c7", dot: "#d97706" },
};

/* ================================================================ */
/*  MOCK ACCOUNTS                                                   */
/* ================================================================ */
export const MOCK_ACCOUNTS: Account[] = [
  // Quản trị hệ thống
  { id: "ACC-001", code: "SYS-001", name: "Vũ Minh Khang",       email: "khang@geleximco-stem.vn",       role: "system_admin",     orgId: "NCC-01",    status: "active",  lastLogin: "2026-05-20T07:00:00Z", createdAt: "2024-01-10T00:00:00Z" },

  // Cơ quan QL — Sở GD
  { id: "ACC-002", code: "CQ-001",  name: "Nguyễn Văn Hùng",     email: "nvhung@sogdhn.edu.vn",          role: "authority_admin",  orgId: "SGD-HN",    status: "active",  lastLogin: "2026-05-19T14:30:00Z", createdAt: "2024-02-01T00:00:00Z" },
  { id: "ACC-003", code: "CQ-002",  name: "Phạm Thị Mai",         email: "ptmai@sogdhn.edu.vn",           role: "authority_viewer", orgId: "SGD-HN",    status: "active",  lastLogin: "2026-05-18T10:00:00Z", createdAt: "2024-02-10T00:00:00Z" },
  { id: "ACC-004", code: "CQ-003",  name: "Trần Thị Lan",         email: "ttlan@sogdhcm.edu.vn",          role: "authority_admin",  orgId: "SGD-HCM",   status: "active",  lastLogin: "2026-05-20T08:15:00Z", createdAt: "2024-02-15T00:00:00Z" },
  { id: "ACC-005", code: "CQ-004",  name: "Lê Quang Sơn",         email: "lqson@sogdhcm.edu.vn",          role: "authority_viewer", orgId: "SGD-HCM",   status: "locked",  lastLogin: "2026-04-01T09:00:00Z", createdAt: "2024-03-01T00:00:00Z" },
  { id: "ACC-006", code: "CQ-005",  name: "Lê Minh Tài",          email: "lmtai@sogddn.edu.vn",           role: "authority_admin",  orgId: "SGD-DN",    status: "active",  lastLogin: "2026-05-17T11:30:00Z", createdAt: "2024-10-01T00:00:00Z" },
  { id: "ACC-007", code: "CQ-006",  name: "Phạm Thị Thu",         email: "ptthu@sogdhue.edu.vn",          role: "authority_admin",  orgId: "SGD-HUE",   status: "locked",  lastLogin: "2026-01-10T08:00:00Z", createdAt: "2024-05-20T00:00:00Z" },

  // Quản lý Trường
  { id: "ACC-010", code: "HT-001",  name: "Trần Thị Nga",         email: "nga.tran@thcsbavi.edu.vn",      role: "school_principal", orgId: "TR-HN-01",  status: "active",  lastLogin: "2026-05-20T07:30:00Z", createdAt: "2024-08-01T00:00:00Z" },
  { id: "ACC-011", code: "QL-001",  name: "Lê Minh Châu",         email: "chau.le@thcsbavi.edu.vn",       role: "school_admin",     orgId: "TR-HN-01",  status: "active",  lastLogin: "2026-05-19T15:00:00Z", createdAt: "2024-08-05T00:00:00Z" },
  { id: "ACC-012", code: "HT-002",  name: "Hoàng Văn An",         email: "an.hoang@thpthadong.edu.vn",    role: "school_principal", orgId: "TR-HN-02",  status: "active",  lastLogin: "2026-05-19T08:00:00Z", createdAt: "2024-08-15T00:00:00Z" },
  { id: "ACC-013", code: "QL-002",  name: "Nguyễn Thu Hà",        email: "ha.ng@thpthadong.edu.vn",       role: "school_admin",     orgId: "TR-HN-02",  status: "active",  lastLogin: "2026-05-20T07:45:00Z", createdAt: "2024-08-20T00:00:00Z" },
  { id: "ACC-014", code: "HT-003",  name: "Lâm Thị Hồng",         email: "hong.lam@thptlhp.edu.vn",      role: "school_principal", orgId: "TR-HCM-01", status: "active",  lastLogin: "2026-05-20T07:00:00Z", createdAt: "2024-08-20T00:00:00Z" },
  { id: "ACC-015", code: "CNTT-01", name: "Đinh Văn Quang",       email: "quang.dinh@thptlhp.edu.vn",    role: "school_itadmin",   orgId: "TR-HCM-01", status: "active",  lastLogin: "2026-05-20T08:15:00Z", createdAt: "2024-09-01T00:00:00Z" },

  // Giáo viên
  { id: "ACC-020", code: "GV-001",  name: "Nguyễn Hùng",          email: "hung.ng@thcsbavi.edu.vn",       role: "teacher",          orgId: "TR-HN-01",  status: "active",  lastLogin: "2026-05-17T14:00:00Z", createdAt: "2024-09-01T00:00:00Z" },
  { id: "ACC-021", code: "GV-002",  name: "Phạm Thị Lan",         email: "lan.pham@thcsbavi.edu.vn",      role: "teacher",          orgId: "TR-HN-01",  status: "locked",  lastLogin: "2026-04-10T10:00:00Z", createdAt: "2024-09-05T00:00:00Z" },
  { id: "ACC-022", code: "GV-003",  name: "Trần Đức Minh",        email: "minh.tran@thpthadong.edu.vn",   role: "teacher",          orgId: "TR-HN-02",  status: "active",  lastLogin: "2026-05-19T13:30:00Z", createdAt: "2024-09-10T00:00:00Z" },
  { id: "ACC-023", code: "GV-004",  name: "Võ Thị Minh",          email: "vtminh@thptlhp.edu.vn",         role: "teacher",          orgId: "TR-HCM-01", status: "active",  lastLogin: "2026-05-20T06:45:00Z", createdAt: "2024-09-15T00:00:00Z" },
  { id: "ACC-024", code: "GV-005",  name: "Ngô Minh Tuấn",        email: "tuan.ngo@thptlhp.edu.vn",       role: "teacher",          orgId: "TR-HCM-01", status: "active",  lastLogin: "2026-05-19T15:45:00Z", createdAt: "2024-09-20T00:00:00Z" },
  { id: "ACC-025", code: "GV-006",  name: "Phan Văn Khoa",        email: "khoa.phan@thcsnd.edu.vn",       role: "teacher",          orgId: "TR-DN-01",  status: "pending", lastLogin: null,                    createdAt: "2026-04-15T00:00:00Z" },
  { id: "ACC-026", code: "GV-007",  name: "Huỳnh Văn Thanh",      email: "hvthanh@thptpct.edu.vn",        role: "teacher",          orgId: "TR-DN-02",  status: "active",  lastLogin: "2026-05-16T09:00:00Z", createdAt: "2024-10-05T00:00:00Z" },
  { id: "ACC-027", code: "GV-008",  name: "Dương Văn Hải",        email: "dvhai@tieuhoacuu.edu.vn",       role: "teacher",          orgId: "TR-HUE-01", status: "locked",  lastLogin: "2026-01-08T10:00:00Z", createdAt: "2024-10-15T00:00:00Z" },

  // Học sinh
  { id: "ACC-030", code: "HS-001",  name: "Đỗ Anh Tuấn",          email: "tuan.do@thcsbavi.edu.vn",       role: "student",          orgId: "TR-HN-01",  status: "active",  lastLogin: "2026-05-19T07:30:00Z", createdAt: "2024-09-01T00:00:00Z" },
  { id: "ACC-031", code: "HS-002",  name: "Vũ Thị Hoa",           email: "hoa.vu@thcsbavi.edu.vn",        role: "student",          orgId: "TR-HN-01",  status: "active",  lastLogin: "2026-05-18T11:00:00Z", createdAt: "2024-09-01T00:00:00Z" },
  { id: "ACC-032", code: "HS-003",  name: "Trần Văn Đức",         email: "duc.tran@thcsbavi.edu.vn",      role: "student",          orgId: "TR-HN-01",  status: "locked",  lastLogin: "2026-03-05T08:00:00Z", createdAt: "2024-09-01T00:00:00Z" },
  { id: "ACC-033", code: "HS-004",  name: "Lê Thị Tuyết",         email: "tuyet.le@thpthadong.edu.vn",    role: "student",          orgId: "TR-HN-02",  status: "active",  lastLogin: "2026-05-20T06:30:00Z", createdAt: "2024-09-15T00:00:00Z" },
  { id: "ACC-034", code: "HS-005",  name: "Phạm Trung Hiếu",      email: "hieu.pham@thpthadong.edu.vn",   role: "student",          orgId: "TR-HN-02",  status: "active",  lastLogin: "2026-05-19T16:00:00Z", createdAt: "2024-09-15T00:00:00Z" },
  { id: "ACC-035", code: "HS-006",  name: "Hà Thị Ngọc",          email: "ngoc.ha@thptlhp.edu.vn",        role: "student",          orgId: "TR-HCM-01", status: "active",  lastLogin: "2026-05-20T06:00:00Z", createdAt: "2024-09-20T00:00:00Z" },
  { id: "ACC-036", code: "HS-007",  name: "Bùi Đức Thắng",        email: "thang.bui@thptlhp.edu.vn",      role: "student",          orgId: "TR-HCM-01", status: "locked",  lastLogin: "2026-04-01T10:00:00Z", createdAt: "2024-09-20T00:00:00Z" },
  { id: "ACC-037", code: "HS-008",  name: "Trương Quốc Bảo",      email: "bao.truong@thcsnd.edu.vn",      role: "student",          orgId: "TR-DN-01",  status: "pending", lastLogin: null,                    createdAt: "2026-03-01T00:00:00Z" },
  { id: "ACC-038", code: "HS-009",  name: "Nguyễn Thị Phương",    email: "phuong.ng@thptpct.edu.vn",      role: "student",          orgId: "TR-DN-02",  status: "active",  lastLogin: "2026-05-15T09:00:00Z", createdAt: "2024-10-05T00:00:00Z" },
  { id: "ACC-039", code: "HS-010",  name: "Võ Quốc Hưng",         email: "hung.vo@thcsltk.edu.vn",        role: "student",          orgId: "TR-DN-03",  status: "pending", lastLogin: null,                    createdAt: "2026-04-01T00:00:00Z" },

  // NCC
  { id: "ACC-040", code: "NCC-A01", name: "Phạm Thu Hương",        email: "thuhuong@nexta.edu.vn",         role: "supplier_admin",   orgId: "NCC-02",    status: "active",  lastLogin: "2026-05-19T10:00:00Z", createdAt: "2024-07-01T00:00:00Z" },
  { id: "ACC-041", code: "NCC-C01", name: "Đinh Văn Toàn",         email: "toan.dinh@nexta.edu.vn",        role: "supplier_content", orgId: "NCC-02",    status: "active",  lastLogin: "2026-05-18T14:00:00Z", createdAt: "2024-07-10T00:00:00Z" },
  { id: "ACC-042", code: "NCC-A02", name: "Lê Quang Minh",         email: "qminh@phuongnam.edu.vn",        role: "supplier_admin",   orgId: "NCC-03",    status: "pending", lastLogin: null,                    createdAt: "2025-01-15T00:00:00Z" },
  { id: "ACC-043", code: "NCC-C02", name: "Hoàng Thị Bích",        email: "bich.hoang@geleximco-stem.vn",  role: "supplier_content", orgId: "NCC-01",    status: "active",  lastLogin: "2026-05-20T08:00:00Z", createdAt: "2024-01-15T00:00:00Z" },
  { id: "ACC-044", code: "NCC-S01", name: "Lâm Văn Cường",         email: "cuong.lam@geleximco-stem.vn",   role: "supplier_sales",   orgId: "NCC-01",    status: "active",  lastLogin: "2026-05-19T17:00:00Z", createdAt: "2024-02-01T00:00:00Z" },
  { id: "ACC-045", code: "NCC-W01", name: "Đặng Thị Hà",           email: "ha.dang@geleximco-stem.vn",     role: "supplier_warranty",orgId: "NCC-01",    status: "active",  lastLogin: "2026-05-18T09:30:00Z", createdAt: "2024-03-01T00:00:00Z" },

  // Thêm pending
  { id: "ACC-050", code: "HS-011",  name: "Nguyễn Thu Thảo",       email: "thao.nguyen@thcsngt.edu.vn",   role: "student",          orgId: "TR-HN-04",  status: "pending", lastLogin: null,                    createdAt: "2026-05-01T00:00:00Z" },
  { id: "ACC-051", code: "GV-009",  name: "Trần Minh Đạt",         email: "dat.tran@tieuhoacuu.edu.vn",   role: "teacher",          orgId: "TR-HUE-01", status: "pending", lastLogin: null,                    createdAt: "2026-04-20T00:00:00Z" },
];
