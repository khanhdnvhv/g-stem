import type { AuthUser, StemRole } from "./AuthContext";

/* ================================================================ */
/*  RBAC MATRIX — Geleximco STEM Platform                           */
/*  Danh sách prefix route mà role được phép truy cập.               */
/*  "*" nghĩa là toàn quyền.                                         */
/*  Ref: docs/permission-matrix.md                                   */
/* ================================================================ */

export const PERMISSIONS: Record<StemRole, string[]> = {
  supplier_admin: [
    "/supplier",
    "/shared",
    // read-only sang phân hệ khác để quản trị chéo
    "/distributor/customers",
    "/school",
  ],
  supplier_content: [
    "/supplier/content",
    "/supplier/programs",
    "/supplier/exams",
    "/supplier/training",
    "/supplier/media",
    "/supplier/dashboard",
    "/shared",
  ],
  supplier_sales: [
    "/supplier/orders",
    "/supplier/schools",
    "/supplier/distributors",
    "/supplier/revenue",
    "/supplier/dashboard",
    "/distributor",
    "/school",
    "/shared",
  ],
  supplier_warranty: [
    "/supplier/warranty",
    "/supplier/licenses",
    "/supplier/software",
    "/supplier/dashboard",
    "/school/equipment",
    "/shared",
  ],
  distributor_admin: [
    "/distributor",
    "/school/purchase",
    "/shared",
  ],
  distributor_sales: [
    "/distributor/orders",
    "/distributor/customers",
    "/distributor/customer-care",
    "/distributor/sales-app",
    "/distributor/contracts",
    "/distributor/dashboard",
    "/shared",
  ],
  distributor_finance: [
    "/distributor/revenue",
    "/distributor/commission",
    "/distributor/inventory",
    "/distributor/dashboard",
    "/shared",
  ],
  school_principal: [
    "/school",
    "/teacher/schedule",
    "/student",
    "/shared",
  ],
  school_admin: [
    "/school/purchase",
    "/school/equipment",
    "/school/warranty",
    "/school/licenses",
    "/school/teachers",
    "/school/students",
    "/school/dashboard",
    "/school/reports",
    "/shared",
  ],
  school_itadmin: [
    "/school/equipment",
    "/school/warranty",
    "/school/licenses",
    "/school/dashboard",
    "/shared",
  ],
  authority_admin: [
    "/authority",
    "/school",
    "/shared",
  ],
  authority_viewer: [
    "/authority/dashboard",
    "/authority/schools",
    "/authority/equipment-compliance",
    "/authority/procurement",
    "/authority/reports",
    "/school",
    "/shared",
  ],
  teacher: [
    "/teacher",
    "/school/students",
    "/student",
    "/shared",
  ],
  student: [
    "/student",
    "/shared",
  ],
  system_admin: ["*"],
};

/** Kiểm tra user có quyền truy cập path không */
export function can(user: AuthUser | null, path: string): boolean {
  if (!user) return false;
  const perms = PERMISSIONS[user.role] ?? [];
  return perms.some((p) => p === "*" || path.startsWith(p));
}

/** Trả về danh sách namespace prefix top-level mà user thấy */
export function allowedNamespaces(user: AuthUser | null): string[] {
  if (!user) return [];
  const perms = PERMISSIONS[user.role] ?? [];
  if (perms.includes("*")) {
    return ["/supplier", "/distributor", "/school", "/authority", "/teacher", "/student", "/admin", "/shared"];
  }
  const namespaces = new Set<string>();
  perms.forEach((p) => {
    const seg = p.split("/")[1];
    if (seg) namespaces.add("/" + seg);
  });
  return Array.from(namespaces);
}
