import { MOCK_ACCOUNTS } from "./account-data";
import type { StemRole } from "../../AuthContext";
import {
  GraduationCap, BookOpen, School, Building2, Package, ShieldCheck,
} from "lucide-react";

/* ================================================================ */
/*  ROLE KEYS                                                       */
/* ================================================================ */
export type RoleKey = "student" | "teacher" | "school" | "authority" | "supplier" | "system_admin";

export type Action = "view" | "create" | "edit" | "delete";

export const ACTION_LABELS: Record<Action, string> = {
  view:   "Xem",
  create: "Tạo mới",
  edit:   "Chỉnh sửa",
  delete: "Xoá",
};

export const ACTIONS: Action[] = ["view", "create", "edit", "delete"];

/* ================================================================ */
/*  6 SYSTEM ROLES CONFIG                                           */
/* ================================================================ */
export interface RoleConfig {
  key: RoleKey;
  label: string;
  description: string;
  color: string;
  bg: string;
  icon: typeof GraduationCap;
  stemRoles: StemRole[];
}

export const SYSTEM_ROLES: RoleConfig[] = [
  {
    key:         "student",
    label:       "Học sinh",
    description: "Truy cập học liệu, tham gia lớp học, xem kết quả học tập của bản thân",
    color:       "#15803d",
    bg:          "#dcfce7",
    icon:        GraduationCap,
    stemRoles:   ["student"],
  },
  {
    key:         "teacher",
    label:       "Giáo viên",
    description: "Quản lý lớp học, giao bài, chấm điểm, tạo phòng Zoom",
    color:       "#6d28d9",
    bg:          "#ede9fe",
    icon:        BookOpen,
    stemRoles:   ["teacher"],
  },
  {
    key:         "school",
    label:       "Quản lý Trường",
    description: "Quản lý giáo viên và học sinh trong trường, xem báo cáo trường",
    color:       "#0e7490",
    bg:          "#cffafe",
    icon:        School,
    stemRoles:   ["school_principal", "school_admin", "school_itadmin"],
  },
  {
    key:         "authority",
    label:       "Cơ quan QL",
    description: "Xem báo cáo tổng hợp toàn Sở, chỉ đọc không can thiệp dữ liệu",
    color:       "#1e40af",
    bg:          "#dbeafe",
    icon:        Building2,
    stemRoles:   ["authority_admin", "authority_viewer"],
  },
  {
    key:         "supplier",
    label:       "NCC",
    description: "Đăng tải và quản lý nội dung, thiết bị trong phạm vi tài khoản NCC",
    color:       "#92400e",
    bg:          "#fef3c7",
    icon:        Package,
    stemRoles:   ["supplier_admin", "supplier_content", "supplier_sales", "supplier_warranty"],
  },
  {
    key:         "system_admin",
    label:       "Quản trị Hệ thống",
    description: "Toàn quyền quản trị nền tảng, không bị giới hạn bởi tenant",
    color:       "#581c87",
    bg:          "#f3e8ff",
    icon:        ShieldCheck,
    stemRoles:   ["system_admin"],
  },
];

export const ROLE_CONFIG_MAP = Object.fromEntries(
  SYSTEM_ROLES.map((r) => [r.key, r])
) as Record<RoleKey, RoleConfig>;

/* ================================================================ */
/*  13 FUNCTIONAL MODULES                                           */
/* ================================================================ */
export interface Module {
  key: string;
  label: string;
}

export const MODULES: Module[] = [
  { key: "dashboard",    label: "Dashboard & Báo cáo"          },
  { key: "org",          label: "Quản lý Tổ chức"              },
  { key: "accounts",     label: "Quản lý Tài khoản"            },
  { key: "ncc",          label: "Quản lý NCC"                  },
  { key: "content",      label: "Nội dung học liệu"            },
  { key: "programs",     label: "Chương trình học (CT1–CT5)"   },
  { key: "classes",      label: "Lớp học & Thời khoá biểu"    },
  { key: "zoom",         label: "Phòng học Zoom"               },
  { key: "masterdata",   label: "Danh mục Master Data"         },
  { key: "integrations", label: "Tích hợp hệ thống ngoài"     },
  { key: "audit",        label: "Nhật ký kiểm tra"             },
  { key: "sysconfig",    label: "Cấu hình hệ thống"            },
  { key: "cms",          label: "CMS Public"                   },
];

/* ================================================================ */
/*  PERMISSION MATRIX                                               */
/*  [roleKey][moduleKey][action] = boolean                          */
/* ================================================================ */
type PermRow = Record<Action, boolean>;
type PermMatrix = Record<string, PermRow>;

const DENY: PermRow  = { view: false, create: false, edit: false, delete: false };
const VIEW: PermRow  = { view: true,  create: false, edit: false, delete: false };
const FULL: PermRow  = { view: true,  create: true,  edit: true,  delete: true  };
const VCE: PermRow   = { view: true,  create: true,  edit: true,  delete: false };
const VCS: PermRow   = VCE;

export const PERM_MATRIX: Record<RoleKey, PermMatrix> = {
  student: {
    dashboard:    VIEW,
    org:          DENY,
    accounts:     DENY,
    ncc:          DENY,
    content:      VIEW,
    programs:     VIEW,
    classes:      VIEW,
    zoom:         DENY,
    masterdata:   DENY,
    integrations: DENY,
    audit:        DENY,
    sysconfig:    DENY,
    cms:          DENY,
  },
  teacher: {
    dashboard:    VIEW,
    org:          DENY,
    accounts:     DENY,
    ncc:          DENY,
    content:      VCE,
    programs:     VIEW,
    classes:      VCE,
    zoom:         FULL,
    masterdata:   DENY,
    integrations: DENY,
    audit:        DENY,
    sysconfig:    DENY,
    cms:          DENY,
  },
  school: {
    dashboard:    VIEW,
    org:          VIEW,
    accounts:     VCS,
    ncc:          DENY,
    content:      VIEW,
    programs:     VIEW,
    classes:      FULL,
    zoom:         VIEW,
    masterdata:   DENY,
    integrations: DENY,
    audit:        VIEW,
    sysconfig:    VIEW,
    cms:          DENY,
  },
  authority: {
    dashboard:    VIEW,
    org:          VIEW,
    accounts:     DENY,
    ncc:          DENY,
    content:      DENY,
    programs:     VIEW,
    classes:      DENY,
    zoom:         DENY,
    masterdata:   VIEW,
    integrations: DENY,
    audit:        VIEW,
    sysconfig:    DENY,
    cms:          DENY,
  },
  supplier: {
    dashboard:    VIEW,
    org:          DENY,
    accounts:     DENY,
    ncc:          VCE,
    content:      FULL,
    programs:     FULL,
    classes:      DENY,
    zoom:         DENY,
    masterdata:   DENY,
    integrations: DENY,
    audit:        DENY,
    sysconfig:    DENY,
    cms:          DENY,
  },
  system_admin: {
    dashboard:    FULL,
    org:          FULL,
    accounts:     FULL,
    ncc:          FULL,
    content:      FULL,
    programs:     FULL,
    classes:      FULL,
    zoom:         FULL,
    masterdata:   FULL,
    integrations: FULL,
    audit:        FULL,
    sysconfig:    FULL,
    cms:          FULL,
  },
};

/* ================================================================ */
/*  ACCOUNT COUNT PER ROLE GROUP                                    */
/* ================================================================ */
export function getAccountCount(roleKey: RoleKey): number {
  const cfg = ROLE_CONFIG_MAP[roleKey];
  return MOCK_ACCOUNTS.filter((a) => (cfg.stemRoles as StemRole[]).includes(a.role)).length;
}
