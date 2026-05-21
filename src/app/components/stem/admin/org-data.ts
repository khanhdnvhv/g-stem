export type OrgType = "so_gd" | "truong" | "ncc";
export type OrgStatus = "active" | "suspended" | "trial";

export interface Organization {
  id: string;
  code: string;
  name: string;
  type: OrgType;
  status: OrgStatus;
  province?: string;
  parentId?: string;
  userCount: number;
  childCount: number;
  createdAt: string;
}

export const MOCK_ORGS: Organization[] = [
  // Sở GD
  { id: "SGD-HN",  code: "SGD-HN",  name: "Sở GD&ĐT Hà Nội",         type: "so_gd", status: "active",    province: "Hà Nội",           userCount: 3200, childCount: 5, createdAt: "2024-02-01T00:00:00Z" },
  { id: "SGD-HCM", code: "SGD-HCM", name: "Sở GD&ĐT TP.HCM",          type: "so_gd", status: "active",    province: "TP. Hồ Chí Minh",  userCount: 4100, childCount: 4, createdAt: "2024-02-15T00:00:00Z" },
  { id: "SGD-DN",  code: "SGD-DN",  name: "Sở GD&ĐT Đà Nẵng",         type: "so_gd", status: "trial",     province: "Đà Nẵng",          userCount: 1200, childCount: 3, createdAt: "2024-10-01T00:00:00Z" },
  { id: "SGD-HUE", code: "SGD-HUE", name: "Sở GD&ĐT Thừa Thiên Huế",  type: "so_gd", status: "suspended", province: "Thừa Thiên Huế",   userCount: 780,  childCount: 1, createdAt: "2024-05-20T00:00:00Z" },
  // Trường — Hà Nội
  { id: "TR-HN-01", code: "THCS-BAVI",  name: "Trường THCS Ba Vì",            type: "truong", status: "active",    province: "Hà Nội",           parentId: "SGD-HN",  userCount: 312,  childCount: 0, createdAt: "2024-08-01T00:00:00Z" },
  { id: "TR-HN-02", code: "THPT-HD",    name: "Trường THPT Hà Đông",           type: "truong", status: "active",    province: "Hà Nội",           parentId: "SGD-HN",  userCount: 543,  childCount: 0, createdAt: "2024-08-15T00:00:00Z" },
  { id: "TR-HN-03", code: "TH-CG",      name: "Trường Tiểu học Cầu Giấy",      type: "truong", status: "active",    province: "Hà Nội",           parentId: "SGD-HN",  userCount: 450,  childCount: 0, createdAt: "2024-09-01T00:00:00Z" },
  { id: "TR-HN-04", code: "THCS-NT",    name: "Trường THCS Nguyễn Trãi",       type: "truong", status: "active",    province: "Hà Nội",           parentId: "SGD-HN",  userCount: 388,  childCount: 0, createdAt: "2024-09-10T00:00:00Z" },
  { id: "TR-HN-05", code: "MN-HM",      name: "Trường Mầm non Hoa Mai",        type: "truong", status: "trial",     province: "Hà Nội",           parentId: "SGD-HN",  userCount: 110,  childCount: 0, createdAt: "2024-09-15T00:00:00Z" },
  // Trường — TP.HCM
  { id: "TR-HCM-01", code: "THPT-LHP",  name: "Trường THPT Lê Hồng Phong",    type: "truong", status: "active",    province: "TP. Hồ Chí Minh", parentId: "SGD-HCM", userCount: 620,  childCount: 0, createdAt: "2024-08-20T00:00:00Z" },
  { id: "TR-HCM-02", code: "THCS-TDN",  name: "Trường THCS Trần Đại Nghĩa",   type: "truong", status: "active",    province: "TP. Hồ Chí Minh", parentId: "SGD-HCM", userCount: 512,  childCount: 0, createdAt: "2024-09-05T00:00:00Z" },
  { id: "TR-HCM-03", code: "TH-LQD",    name: "Trường Tiểu học Lê Quý Đôn",   type: "truong", status: "active",    province: "TP. Hồ Chí Minh", parentId: "SGD-HCM", userCount: 320,  childCount: 0, createdAt: "2024-09-12T00:00:00Z" },
  { id: "TR-HCM-04", code: "THPT-CNN",  name: "Trường THPT Chuyên Ngoại ngữ", type: "truong", status: "suspended", province: "TP. Hồ Chí Minh", parentId: "SGD-HCM", userCount: 430,  childCount: 0, createdAt: "2024-09-20T00:00:00Z" },
  // Trường — Đà Nẵng
  { id: "TR-DN-01", code: "THCS-ND-DN", name: "Trường THCS Nguyễn Du",         type: "truong", status: "active", province: "Đà Nẵng",         parentId: "SGD-DN",  userCount: 362,  childCount: 0, createdAt: "2024-10-01T00:00:00Z" },
  { id: "TR-DN-02", code: "THPT-PCT",   name: "Trường THPT Phan Châu Trinh",   type: "truong", status: "active", province: "Đà Nẵng",         parentId: "SGD-DN",  userCount: 490,  childCount: 0, createdAt: "2024-10-05T00:00:00Z" },
  { id: "TR-DN-03", code: "THCS-LTK",   name: "Trường THCS Lý Thường Kiệt",   type: "truong", status: "trial",  province: "Đà Nẵng",         parentId: "SGD-DN",  userCount: 318,  childCount: 0, createdAt: "2024-10-10T00:00:00Z" },
  // Trường — Huế
  { id: "TR-HUE-01", code: "TH-ACUU",   name: "Trường Tiểu học An Cựu",       type: "truong", status: "suspended", province: "Thừa Thiên Huế", parentId: "SGD-HUE", userCount: 210, childCount: 0, createdAt: "2024-10-15T00:00:00Z" },
  // Trường — không có Sở trong hệ thống
  { id: "TR-QN-01",  code: "THCS-DX",   name: "Trường THCS Duy Xuyên",        type: "truong", status: "active", province: "Quảng Nam",  userCount: 255, childCount: 0, createdAt: "2024-10-20T00:00:00Z" },
  { id: "TR-KH-01",  code: "THPTN-NT",  name: "Trường THPT Nghề Nha Trang",   type: "truong", status: "active", province: "Khánh Hòa",  userCount: 290, childCount: 0, createdAt: "2024-11-01T00:00:00Z" },
  // NCC
  { id: "NCC-01", code: "GLX-STEM", name: "Geleximco STEM",              type: "ncc", status: "active", userCount: 48, childCount: 0, createdAt: "2024-01-10T00:00:00Z" },
  { id: "NCC-02", code: "NXT-EDU",  name: "Nexta Education",             type: "ncc", status: "active", userCount: 22, childCount: 0, createdAt: "2024-07-01T00:00:00Z" },
  { id: "NCC-03", code: "PNS-EDU",  name: "Công ty CP Phương Nam STEM",  type: "ncc", status: "trial",  userCount: 8,  childCount: 0, createdAt: "2025-01-15T00:00:00Z" },
];

/* ================================================================ */
/*  EXTENDED DETAIL TYPES                                           */
/* ================================================================ */

export interface OrgDetails {
  address?: string;
  province?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  updatedAt?: string;
  // Trường
  educationLevel?: string;
  // NCC
  nccType?: "content" | "device" | "both";
  taxCode?: string;
  legalRepName?: string;
  legalRepTitle?: string;
  internalNote?: string;
}

export const ORG_DETAILS: Record<string, OrgDetails> = {
  "SGD-HN":  { address: "35 Lê Duẩn, Đống Đa, Hà Nội", contactName: "Nguyễn Văn Hùng", contactEmail: "nvhung@sogdhn.edu.vn", contactPhone: "0912345678", updatedAt: "2025-03-15T10:30:00Z" },
  "SGD-HCM": { address: "120 Nguyễn Đình Chiểu, Quận 3, TP.HCM", contactName: "Trần Thị Lan", contactEmail: "ttlan@sogdhcm.edu.vn", contactPhone: "0987654321", updatedAt: "2025-04-01T08:00:00Z" },
  "SGD-DN":  { address: "48 Lê Duẩn, Hải Châu, Đà Nẵng", contactName: "Lê Minh Tài", contactEmail: "lmtai@sogddn.edu.vn", contactPhone: "0905123456", updatedAt: "2025-02-20T14:00:00Z" },
  "SGD-HUE": { address: "12 Lê Lợi, TP. Huế, Thừa Thiên Huế", contactName: "Phạm Thị Thu", contactEmail: "ptthu@sogdhue.edu.vn", contactPhone: "0935678901", updatedAt: "2025-01-10T09:00:00Z" },
  "TR-HN-01":  { address: "Xã Tản Lĩnh, Ba Vì, Hà Nội", contactName: "Đỗ Văn Nam", contactEmail: "dvnam@thcsbavi.edu.vn", contactPhone: "0912001001", educationLevel: "THCS", updatedAt: "2025-02-01T00:00:00Z" },
  "TR-HN-02":  { address: "Phường Yên Nghĩa, Hà Đông, Hà Nội", contactName: "Nguyễn Thị Hoa", contactEmail: "nthoa@thpthadong.edu.vn", contactPhone: "0912002002", educationLevel: "THPT", updatedAt: "2025-02-05T00:00:00Z" },
  "TR-HN-03":  { address: "Cầu Giấy, Hà Nội", contactName: "Trần Văn Bình", contactEmail: "tvbinh@tieuhoccaugiay.edu.vn", contactPhone: "0912003003", educationLevel: "Tiểu học", updatedAt: "2025-03-10T00:00:00Z" },
  "TR-HN-04":  { address: "Nguyễn Trãi, Hà Đông, Hà Nội", contactName: "Lê Thị Hằng", contactEmail: "lthang@thcsngt.edu.vn", contactPhone: "0912004004", educationLevel: "THCS", updatedAt: "2025-01-20T00:00:00Z" },
  "TR-HN-05":  { address: "Hoa Mai, Cầu Giấy, Hà Nội", contactName: "Phạm Văn Đức", contactEmail: "pvduc@mamnon.edu.vn", contactPhone: "0912005005", educationLevel: "Mầm non", updatedAt: "2025-01-15T00:00:00Z" },
  "TR-HCM-01": { address: "235 Nguyễn Văn Cừ, Quận 5, TP.HCM", contactName: "Võ Thị Minh", contactEmail: "vtminh@thptlhp.edu.vn", contactPhone: "0901001001", educationLevel: "THPT", updatedAt: "2025-03-01T00:00:00Z" },
  "TR-HCM-02": { address: "50 Trần Đại Nghĩa, Bình Thạnh, TP.HCM", contactName: "Nguyễn Văn Long", contactEmail: "nvlong@thcstdn.edu.vn", contactPhone: "0901002002", educationLevel: "THCS", updatedAt: "2025-02-28T00:00:00Z" },
  "TR-HCM-03": { address: "12 Lê Quý Đôn, Quận 3, TP.HCM", contactName: "Trần Minh Châu", contactEmail: "tmchau@thlqd.edu.vn", contactPhone: "0901003003", educationLevel: "Tiểu học", updatedAt: "2025-02-10T00:00:00Z" },
  "TR-HCM-04": { address: "15 Đinh Tiên Hoàng, Quận 1, TP.HCM", contactName: "Lê Văn Tuấn", contactEmail: "lvtuan@thptnn.edu.vn", contactPhone: "0901004004", educationLevel: "THPT", updatedAt: "2025-01-05T00:00:00Z" },
  "TR-DN-01":  { address: "200 Nguyễn Du, Hải Châu, Đà Nẵng", contactName: "Phan Thị Oanh", contactEmail: "ptoanh@thcsnd.edu.vn", contactPhone: "0905001001", educationLevel: "THCS", updatedAt: "2025-03-05T00:00:00Z" },
  "TR-DN-02":  { address: "Phan Châu Trinh, Hải Châu, Đà Nẵng", contactName: "Huỳnh Văn Thanh", contactEmail: "hvthanh@thptpct.edu.vn", contactPhone: "0905002002", educationLevel: "THPT", updatedAt: "2025-03-12T00:00:00Z" },
  "TR-DN-03":  { address: "Lý Thường Kiệt, Thanh Khê, Đà Nẵng", contactName: "Nguyễn Thị Phương", contactEmail: "ntphuong@thcsltk.edu.vn", contactPhone: "0905003003", educationLevel: "THCS", updatedAt: "2025-02-25T00:00:00Z" },
  "TR-HUE-01": { address: "An Cựu, TP. Huế", contactName: "Dương Văn Hải", contactEmail: "dvhai@tieuhoacuu.edu.vn", contactPhone: "0935001001", educationLevel: "Tiểu học", updatedAt: "2025-01-08T00:00:00Z" },
  "TR-QN-01":  { address: "Duy Xuyên, Quảng Nam", contactName: "Lê Thị Lan", contactEmail: "ltlan@thcsduxxuyen.edu.vn", contactPhone: "0923001001", educationLevel: "THCS", updatedAt: "2025-02-18T00:00:00Z" },
  "TR-KH-01":  { address: "Nha Trang, Khánh Hòa", contactName: "Trần Văn Sơn", contactEmail: "tvson@thptn.edu.vn", contactPhone: "0931001001", educationLevel: "THPT", updatedAt: "2025-02-22T00:00:00Z" },
  "NCC-01": { address: "Tòa nhà Geleximco, 36 Hoàng Cầu, Đống Đa, Hà Nội", contactName: "Vũ Minh Khang", contactEmail: "khang@geleximco-stem.vn", contactPhone: "0912999888", nccType: "both", taxCode: "0101234567", legalRepName: "Nguyễn Anh Tuấn", legalRepTitle: "Tổng Giám Đốc", internalNote: "Đối tác chiến lược, ưu tiên cao", updatedAt: "2025-04-10T00:00:00Z" },
  "NCC-02": { address: "24 Bà Triệu, Hoàn Kiếm, Hà Nội", contactName: "Phạm Thu Hương", contactEmail: "thuhuong@nexta.edu.vn", contactPhone: "0908777666", nccType: "content", taxCode: "0107654321", legalRepName: "Trần Đình Dũng", legalRepTitle: "Giám Đốc", internalNote: "Chuyên nội dung STEM K-12", updatedAt: "2025-03-20T00:00:00Z" },
  "NCC-03": { address: "120 Bạch Đằng, Hải Châu, Đà Nẵng", contactName: "Lê Quang Minh", contactEmail: "qminh@phuongnam.edu.vn", contactPhone: "0935111222", nccType: "device", taxCode: "0400123456", legalRepName: "Lê Quang Minh", legalRepTitle: "Giám Đốc", internalNote: "NCC mới, đang thử nghiệm robotics", updatedAt: "2025-01-20T00:00:00Z" },
};

/* ================================================================ */
/*  ORG USERS (Trường)                                              */
/* ================================================================ */
export type UserRole = "student" | "teacher" | "school_admin" | "school_principal";

export interface OrgUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "locked";
  lastLogin: string;
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  student: "Học sinh",
  teacher: "Giáo viên",
  school_admin: "Quản lý Trường",
  school_principal: "Hiệu trưởng",
};

export const MOCK_ORG_USERS: Record<string, OrgUser[]> = {
  "TR-HN-01": [
    { id: "u001", name: "Trần Thị Nga",    email: "nga.tran@thcsbavi.edu.vn",   role: "school_principal", status: "active", lastLogin: "2025-05-18T08:30:00Z" },
    { id: "u002", name: "Lê Minh Châu",    email: "chau.le@thcsbavi.edu.vn",    role: "school_admin",     status: "active", lastLogin: "2025-05-19T09:00:00Z" },
    { id: "u003", name: "Nguyễn Hùng",     email: "hung.ng@thcsbavi.edu.vn",    role: "teacher",          status: "active", lastLogin: "2025-05-17T14:00:00Z" },
    { id: "u004", name: "Phạm Thị Lan",    email: "lan.pham@thcsbavi.edu.vn",   role: "teacher",          status: "locked", lastLogin: "2025-04-10T10:00:00Z" },
    { id: "u005", name: "Đỗ Anh Tuấn",     email: "tuan.do@thcsbavi.edu.vn",    role: "student",          status: "active", lastLogin: "2025-05-19T07:30:00Z" },
    { id: "u006", name: "Vũ Thị Hoa",      email: "hoa.vu@thcsbavi.edu.vn",     role: "student",          status: "active", lastLogin: "2025-05-18T11:00:00Z" },
    { id: "u007", name: "Trần Văn Đức",    email: "duc.tran@thcsbavi.edu.vn",   role: "student",          status: "locked", lastLogin: "2025-03-05T08:00:00Z" },
  ],
  "TR-HN-02": [
    { id: "u008", name: "Hoàng Văn An",    email: "an.hoang@thpthadong.edu.vn",  role: "school_principal", status: "active", lastLogin: "2025-05-19T08:00:00Z" },
    { id: "u009", name: "Nguyễn Thu Hà",   email: "ha.ng@thpthadong.edu.vn",     role: "school_admin",     status: "active", lastLogin: "2025-05-20T07:45:00Z" },
    { id: "u010", name: "Trần Đức Minh",   email: "minh.tran@thpthadong.edu.vn", role: "teacher",          status: "active", lastLogin: "2025-05-19T13:30:00Z" },
    { id: "u011", name: "Lê Thị Tuyết",    email: "tuyet.le@thpthadong.edu.vn",  role: "student",          status: "active", lastLogin: "2025-05-20T06:30:00Z" },
    { id: "u012", name: "Phạm Trung Hiếu", email: "hieu.pham@thpthadong.edu.vn", role: "student",          status: "active", lastLogin: "2025-05-19T16:00:00Z" },
  ],
  "TR-HCM-01": [
    { id: "u013", name: "Lâm Thị Hồng",   email: "hong.lam@thptlhp.edu.vn",   role: "school_principal", status: "active", lastLogin: "2025-05-20T07:00:00Z" },
    { id: "u014", name: "Đinh Văn Quang",  email: "quang.dinh@thptlhp.edu.vn", role: "school_admin",     status: "active", lastLogin: "2025-05-20T08:15:00Z" },
    { id: "u015", name: "Ngô Minh Tuấn",   email: "tuan.ngo@thptlhp.edu.vn",   role: "teacher",          status: "active", lastLogin: "2025-05-19T15:45:00Z" },
    { id: "u016", name: "Hà Thị Ngọc",    email: "ngoc.ha@thptlhp.edu.vn",    role: "student",          status: "active", lastLogin: "2025-05-20T06:00:00Z" },
    { id: "u017", name: "Bùi Đức Thắng",  email: "thang.bui@thptlhp.edu.vn",  role: "student",          status: "locked", lastLogin: "2025-04-01T10:00:00Z" },
  ],
  "TR-DN-01": [
    { id: "u018", name: "Phan Văn Khoa",   email: "khoa.phan@thcsnd.edu.vn",   role: "school_principal", status: "active", lastLogin: "2025-05-18T09:00:00Z" },
    { id: "u019", name: "Võ Thị Mai",      email: "mai.vo@thcsnd.edu.vn",      role: "teacher",          status: "active", lastLogin: "2025-05-17T11:00:00Z" },
    { id: "u020", name: "Trương Quốc Bảo", email: "bao.truong@thcsnd.edu.vn",  role: "student",          status: "active", lastLogin: "2025-05-19T07:00:00Z" },
  ],
};

/* ================================================================ */
/*  NCC PERMISSIONS (Sở GD)                                         */
/* ================================================================ */
export interface NccPermission {
  nccId: string;
  nccName: string;
  nccType: "content" | "device" | "both";
  grantedAt: string;
}

export const MOCK_NCC_PERMISSIONS: Record<string, NccPermission[]> = {
  "SGD-HN":  [
    { nccId: "NCC-01", nccName: "Geleximco STEM",             nccType: "both",    grantedAt: "2024-03-01T00:00:00Z" },
    { nccId: "NCC-02", nccName: "Nexta Education",            nccType: "content", grantedAt: "2024-06-15T00:00:00Z" },
  ],
  "SGD-HCM": [
    { nccId: "NCC-01", nccName: "Geleximco STEM",             nccType: "both",    grantedAt: "2024-03-01T00:00:00Z" },
  ],
  "SGD-DN":  [
    { nccId: "NCC-01", nccName: "Geleximco STEM",             nccType: "both",    grantedAt: "2024-10-15T00:00:00Z" },
    { nccId: "NCC-03", nccName: "Công ty CP Phương Nam STEM", nccType: "device",  grantedAt: "2025-02-01T00:00:00Z" },
  ],
  "SGD-HUE": [],
};

/* ================================================================ */
/*  NCC ACTIVITY                                                    */
/* ================================================================ */
export interface NccActivity {
  programs: number;
  materials: number;
  schools: number;
  violations: number;
  soPermissions: { soId: string; soName: string; grantedAt: string }[];
}

export const MOCK_NCC_ACTIVITY: Record<string, NccActivity> = {
  "NCC-01": {
    programs: 12, materials: 145, schools: 38, violations: 0,
    soPermissions: [
      { soId: "SGD-HN",  soName: "Sở GD&ĐT Hà Nội",           grantedAt: "2024-03-01T00:00:00Z" },
      { soId: "SGD-HCM", soName: "Sở GD&ĐT TP.HCM",            grantedAt: "2024-03-01T00:00:00Z" },
      { soId: "SGD-DN",  soName: "Sở GD&ĐT Đà Nẵng",           grantedAt: "2024-10-15T00:00:00Z" },
    ],
  },
  "NCC-02": {
    programs: 5, materials: 63, schools: 12, violations: 2,
    soPermissions: [
      { soId: "SGD-HN",  soName: "Sở GD&ĐT Hà Nội",           grantedAt: "2024-06-15T00:00:00Z" },
    ],
  },
  "NCC-03": {
    programs: 2, materials: 18, schools: 3, violations: 0,
    soPermissions: [
      { soId: "SGD-DN",  soName: "Sở GD&ĐT Đà Nẵng",           grantedAt: "2025-02-01T00:00:00Z" },
    ],
  },
};

/* ================================================================ */
/*  CHANGE LOGS                                                     */
/* ================================================================ */
export interface ChangeLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  field: string;
  before: string;
  after: string;
}

export const MOCK_CHANGE_LOGS: Record<string, ChangeLog[]> = {
  "SGD-HN": [
    { id: "cl1", time: "2025-03-15T10:30:00Z", actor: "admin@platform.vn",  action: "Cập nhật thông tin", field: "Địa chỉ",       before: "34 Lê Duẩn, Đống Đa",    after: "35 Lê Duẩn, Đống Đa, Hà Nội" },
    { id: "cl2", time: "2025-01-20T09:00:00Z", actor: "admin@platform.vn",  action: "Cập nhật thông tin", field: "Email đầu mối", before: "lienhe@sogdhn.edu.vn",    after: "nvhung@sogdhn.edu.vn" },
    { id: "cl3", time: "2024-07-01T14:30:00Z", actor: "admin@platform.vn",  action: "Cấp quyền NCC",      field: "NCC được phép", before: "—",                       after: "Nexta Education (content)" },
    { id: "cl4", time: "2024-03-01T08:00:00Z", actor: "admin@platform.vn",  action: "Kích hoạt",          field: "Trạng thái",    before: "Dùng thử",                after: "Đang hoạt động" },
    { id: "cl5", time: "2024-02-01T00:00:00Z", actor: "system",             action: "Tạo mới",             field: "—",             before: "—",                       after: "Khởi tạo" },
  ],
  "SGD-HCM": [
    { id: "cl6", time: "2025-04-01T08:00:00Z", actor: "admin@platform.vn",  action: "Cập nhật thông tin", field: "Người đầu mối", before: "Nguyễn Văn A",            after: "Trần Thị Lan" },
    { id: "cl7", time: "2024-03-01T08:00:00Z", actor: "admin@platform.vn",  action: "Kích hoạt",          field: "Trạng thái",    before: "Dùng thử",                after: "Đang hoạt động" },
    { id: "cl8", time: "2024-02-15T00:00:00Z", actor: "system",             action: "Tạo mới",             field: "—",             before: "—",                       after: "Khởi tạo" },
  ],
  "SGD-DN": [
    { id: "cl9",  time: "2025-02-01T00:00:00Z", actor: "admin@platform.vn", action: "Cấp quyền NCC",      field: "NCC được phép", before: "—",                       after: "Phương Nam STEM (device)" },
    { id: "cl10", time: "2024-10-01T00:00:00Z", actor: "system",            action: "Tạo mới",             field: "—",             before: "—",                       after: "Khởi tạo (dùng thử)" },
  ],
  "SGD-HUE": [
    { id: "cl11", time: "2025-01-10T09:00:00Z", actor: "admin@platform.vn", action: "Đình chỉ",           field: "Trạng thái",    before: "Đang hoạt động",          after: "Tạm ngừng" },
    { id: "cl12", time: "2024-08-01T00:00:00Z", actor: "admin@platform.vn", action: "Kích hoạt",          field: "Trạng thái",    before: "Dùng thử",                after: "Đang hoạt động" },
    { id: "cl13", time: "2024-05-20T00:00:00Z", actor: "system",            action: "Tạo mới",             field: "—",             before: "—",                       after: "Khởi tạo" },
  ],
  "TR-HN-01": [
    { id: "cl14", time: "2025-02-01T00:00:00Z", actor: "admin@platform.vn", action: "Cập nhật thông tin", field: "Địa chỉ",       before: "Ba Vì, Hà Nội",           after: "Xã Tản Lĩnh, Ba Vì, Hà Nội" },
    { id: "cl15", time: "2024-08-01T00:00:00Z", actor: "system",            action: "Tạo mới",             field: "—",             before: "—",                       after: "Khởi tạo" },
  ],
  "TR-HCM-04": [
    { id: "cl16", time: "2025-01-15T09:00:00Z", actor: "admin@platform.vn", action: "Đình chỉ",           field: "Trạng thái",    before: "Đang hoạt động",          after: "Tạm ngừng" },
    { id: "cl17", time: "2024-09-20T00:00:00Z", actor: "system",            action: "Tạo mới",             field: "—",             before: "—",                       after: "Khởi tạo" },
  ],
  "NCC-01": [
    { id: "cl18", time: "2025-04-10T00:00:00Z", actor: "admin@platform.vn", action: "Cập nhật thông tin", field: "Ghi chú nội bộ",before: "Đối tác mới",             after: "Đối tác chiến lược, ưu tiên cao" },
    { id: "cl19", time: "2024-03-01T00:00:00Z", actor: "admin@platform.vn", action: "Kích hoạt",          field: "Trạng thái",    before: "Dùng thử",                after: "Đang hoạt động" },
    { id: "cl20", time: "2024-01-10T00:00:00Z", actor: "system",            action: "Tạo mới",             field: "—",             before: "—",                       after: "Khởi tạo" },
  ],
  "NCC-02": [
    { id: "cl21", time: "2025-03-20T00:00:00Z", actor: "admin@platform.vn", action: "Cập nhật thông tin", field: "Loại NCC",      before: "Nội dung & Thiết bị",     after: "Nội dung" },
    { id: "cl22", time: "2024-07-01T00:00:00Z", actor: "system",            action: "Tạo mới",             field: "—",             before: "—",                       after: "Khởi tạo" },
  ],
  "NCC-03": [
    { id: "cl23", time: "2025-01-20T00:00:00Z", actor: "admin@platform.vn", action: "Cập nhật thông tin", field: "Ghi chú",       before: "—",                       after: "Đang thử nghiệm robotics" },
    { id: "cl24", time: "2025-01-15T00:00:00Z", actor: "system",            action: "Tạo mới",             field: "—",             before: "—",                       after: "Khởi tạo (dùng thử)" },
  ],
};

export const PROVINCES_VN = [
  "An Giang","Bà Rịa - Vũng Tàu","Bắc Giang","Bắc Kạn","Bạc Liêu","Bắc Ninh","Bến Tre","Bình Định","Bình Dương","Bình Phước","Bình Thuận",
  "Cà Mau","Cần Thơ","Cao Bằng","Đà Nẵng","Đắk Lắk","Đắk Nông","Điện Biên","Đồng Nai","Đồng Tháp","Gia Lai","Hà Giang","Hà Nam",
  "Hà Nội","Hà Tĩnh","Hải Dương","Hải Phòng","Hậu Giang","Hòa Bình","Hưng Yên","Khánh Hòa","Kiên Giang","Kon Tum","Lai Châu","Lâm Đồng",
  "Lạng Sơn","Lào Cai","Long An","Nam Định","Nghệ An","Ninh Bình","Ninh Thuận","Phú Thọ","Phú Yên","Quảng Bình","Quảng Nam","Quảng Ngãi",
  "Quảng Ninh","Quảng Trị","Sóc Trăng","Sơn La","Tây Ninh","Thái Bình","Thái Nguyên","Thanh Hóa","Thừa Thiên Huế","Tiền Giang",
  "TP. Hồ Chí Minh","Trà Vinh","Tuyên Quang","Vĩnh Long","Vĩnh Phúc","Yên Bái",
];
