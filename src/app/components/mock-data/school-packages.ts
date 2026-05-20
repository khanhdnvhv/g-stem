import type { SchoolPackage } from "./types";

/* ================================================================ */
/*  SCHOOL PACKAGES — Gắn gói cho trường (V1 Direct Sales)          */
/*  Mỗi record = 1 lần NCC gắn 1 gói cho 1 trường cụ thể            */
/* ================================================================ */

export const schoolPackages: SchoolPackage[] = [
  {
    id: "SP-001",
    packageId: "PKG-BAS",
    schoolTenantId: "T-SCH-01",
    assignedBy: "U-SUP-01",
    startDate: "2025-09-01",
    notes: "Triển khai đầu năm học 2025-2026. Lắp đặt hoàn thành trước khai giảng.",
    status: "active",
    createdAt: "2025-08-15T09:00:00Z",
  },
  {
    id: "SP-002",
    packageId: "PKG-ADV",
    schoolTenantId: "T-SCH-02",
    assignedBy: "U-SUP-01",
    startDate: "2025-09-01",
    notes: "Gói nâng cao cho trường THPT trọng điểm. Bao gồm đào tạo GV 5 ngày.",
    status: "active",
    createdAt: "2025-08-20T10:30:00Z",
  },
  {
    id: "SP-003",
    packageId: "PKG-MIN",
    schoolTenantId: "T-SCH-03",
    assignedBy: "U-SUP-01",
    startDate: "2026-01-15",
    notes: "Gói tối thiểu — trường vùng sâu, hỗ trợ từ chương trình xã hội hóa.",
    status: "active",
    createdAt: "2025-12-10T14:00:00Z",
  },
  {
    id: "SP-004",
    packageId: "PKG-BAS",
    schoolTenantId: "T-SCH-04",
    assignedBy: "U-SUP-01",
    startDate: "2025-09-01",
    status: "active",
    createdAt: "2025-08-25T08:00:00Z",
  },
  {
    id: "SP-005",
    packageId: "PKG-MIN",
    schoolTenantId: "T-SCH-05",
    assignedBy: "U-SUP-01",
    startDate: "2024-09-01",
    status: "expired",
    createdAt: "2024-08-10T11:00:00Z",
  },
];

/** Lấy tất cả SchoolPackage của 1 gói */
export function schoolPackagesByPackage(packageId: string): SchoolPackage[] {
  return schoolPackages.filter((sp) => sp.packageId === packageId);
}

/** Lấy tất cả SchoolPackage của 1 trường */
export function schoolPackagesBySchool(schoolTenantId: string): SchoolPackage[] {
  return schoolPackages.filter((sp) => sp.schoolTenantId === schoolTenantId);
}
