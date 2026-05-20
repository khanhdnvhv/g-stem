import type { Tenant } from "./types";

/* ================================================================ */
/*  TENANTS — 1 supplier + 3 distributor + 15 school + 2 authority   */
/* ================================================================ */

export const tenants: Tenant[] = [
  // === SUPPLIER (Geleximco) ===
  {
    id: "T-SUP-01", type: "supplier",
    name: "Geleximco STEM",
    code: "GLX-STEM",
    address: "36 Hoàng Cầu, Đống Đa, Hà Nội",
    contactEmail: "hello@geleximco-stem.vn",
    contactPhone: "024 3883 0000",
    licenseQuota: 500_000, licenseUsed: 187_430,
    storageQuotaGB: 50_000, storageUsedGB: 12_450,
    active: true,
    onboardedAt: "2024-01-10T00:00:00Z",
  },

  // === SUPPLIER 2 (Nexta Education — isolation demo AD-04) ===
  {
    id: "T-SUP-02", type: "supplier",
    name: "Nexta Education",
    code: "NXT-EDU",
    address: "15 Phạm Hùng, Nam Từ Liêm, Hà Nội",
    contactEmail: "contact@nexta-edu.vn",
    contactPhone: "024 3556 8800",
    licenseQuota: 100_000, licenseUsed: 22_450,
    storageQuotaGB: 10_000, storageUsedGB: 1_800,
    active: true,
    onboardedAt: "2024-07-01T00:00:00Z",
  },

  // === DISTRIBUTORS (3) ===
  {
    id: "T-DIS-01", type: "distributor",
    name: "Đại lý Giáo dục ABC",
    code: "DL-ABC",
    address: "123 Cầu Giấy, Hà Nội",
    coverageProvinces: ["Hà Nội", "Bắc Ninh", "Hưng Yên", "Hải Phòng"],
    contactEmail: "contact@abc-edu.vn",
    contactPhone: "024 3868 1111",
    licenseQuota: 50_000, licenseUsed: 12_800,
    storageQuotaGB: 500, storageUsedGB: 120,
    active: true,
    onboardedAt: "2024-03-15T00:00:00Z",
    parentTenantId: "T-SUP-01",
  },
  {
    id: "T-DIS-02", type: "distributor",
    name: "Công ty CP Giáo dục Phương Nam",
    code: "DL-PN",
    address: "45 Nguyễn Văn Linh, Q.7, TP.HCM",
    coverageProvinces: ["TP.HCM", "Bình Dương", "Đồng Nai", "Vũng Tàu", "Long An"],
    contactEmail: "lienhe@phuongnam-edu.vn",
    contactPhone: "028 5415 2222",
    licenseQuota: 40_000, licenseUsed: 8_200,
    storageQuotaGB: 400, storageUsedGB: 95,
    active: true,
    onboardedAt: "2024-04-20T00:00:00Z",
    parentTenantId: "T-SUP-01",
  },
  {
    id: "T-DIS-03", type: "distributor",
    name: "Trung tâm Phân phối Miền Trung",
    code: "DL-MT",
    address: "88 Nguyễn Văn Linh, Đà Nẵng",
    coverageProvinces: ["Đà Nẵng", "Quảng Nam", "Quảng Ngãi", "Huế", "Khánh Hòa"],
    contactEmail: "mt@stem-mientrung.vn",
    contactPhone: "0236 3888 333",
    licenseQuota: 25_000, licenseUsed: 4_450,
    storageQuotaGB: 250, storageUsedGB: 60,
    active: true,
    onboardedAt: "2024-06-10T00:00:00Z",
    parentTenantId: "T-SUP-01",
  },

  // === SCHOOLS (15) ===
  { id: "T-SCH-01", type: "school", name: "Trường THCS Ba Vì",       code: "THCS-BAVI",  province: "Hà Nội",    district: "Ba Vì",     gradeLevels: ["THCS"], licenseQuota: 500, licenseUsed: 312, storageQuotaGB: 50, storageUsedGB: 18, active: true, onboardedAt: "2024-08-01T00:00:00Z" },
  { id: "T-SCH-02", type: "school", name: "Trường THPT Hà Đông",      code: "THPT-HD",    province: "Hà Nội",    district: "Hà Đông",   gradeLevels: ["THPT"], licenseQuota: 800, licenseUsed: 543, storageQuotaGB: 80, storageUsedGB: 29, active: true, onboardedAt: "2024-08-15T00:00:00Z" },
  { id: "T-SCH-03", type: "school", name: "Trường Tiểu học Cầu Giấy", code: "TH-CG",      province: "Hà Nội",    district: "Cầu Giấy",  gradeLevels: ["Tiểu học"], licenseQuota: 700, licenseUsed: 450, storageQuotaGB: 60, storageUsedGB: 22, active: true, onboardedAt: "2024-09-01T00:00:00Z" },
  { id: "T-SCH-04", type: "school", name: "Trường THCS Nguyễn Trãi",  code: "THCS-NT",    province: "Hà Nội",    district: "Thanh Xuân",gradeLevels: ["THCS"], licenseQuota: 600, licenseUsed: 388, storageQuotaGB: 60, storageUsedGB: 25, active: true, onboardedAt: "2024-09-10T00:00:00Z" },
  { id: "T-SCH-05", type: "school", name: "Trường Mầm non Hoa Mai",   code: "MN-HM",      province: "Hà Nội",    district: "Ba Đình",   gradeLevels: ["Mầm non"], licenseQuota: 200, licenseUsed: 110, storageQuotaGB: 20, storageUsedGB: 7, active: true, onboardedAt: "2024-09-15T00:00:00Z" },
  { id: "T-SCH-06", type: "school", name: "Trường THPT Lê Hồng Phong",code: "THPT-LHP",   province: "TP.HCM",    district: "Q.5",       gradeLevels: ["THPT"], licenseQuota: 900, licenseUsed: 620, storageQuotaGB: 90, storageUsedGB: 35, active: true, onboardedAt: "2024-08-20T00:00:00Z" },
  { id: "T-SCH-07", type: "school", name: "Trường THCS Trần Đại Nghĩa",code: "THCS-TDN",  province: "TP.HCM",    district: "Q.1",       gradeLevels: ["THCS"], licenseQuota: 700, licenseUsed: 512, storageQuotaGB: 70, storageUsedGB: 30, active: true, onboardedAt: "2024-09-05T00:00:00Z" },
  { id: "T-SCH-08", type: "school", name: "Trường Tiểu học Lê Quý Đôn",code: "TH-LQD",    province: "TP.HCM",    district: "Q.3",       gradeLevels: ["Tiểu học"], licenseQuota: 500, licenseUsed: 320, storageQuotaGB: 50, storageUsedGB: 18, active: true, onboardedAt: "2024-09-12T00:00:00Z" },
  { id: "T-SCH-09", type: "school", name: "Trường THPT Chuyên Ngoại ngữ",code: "THPT-CNN",province: "TP.HCM",    district: "Q.7",       gradeLevels: ["THPT"], licenseQuota: 600, licenseUsed: 430, storageQuotaGB: 60, storageUsedGB: 23, active: true, onboardedAt: "2024-09-20T00:00:00Z" },
  { id: "T-SCH-10", type: "school", name: "Trường THCS Nguyễn Du",    code: "THCS-ND-DN", province: "Đà Nẵng",   district: "Hải Châu",  gradeLevels: ["THCS"], licenseQuota: 550, licenseUsed: 362, storageQuotaGB: 55, storageUsedGB: 20, active: true, onboardedAt: "2024-10-01T00:00:00Z" },
  { id: "T-SCH-11", type: "school", name: "Trường THPT Phan Châu Trinh",code: "THPT-PCT", province: "Đà Nẵng",   district: "Sơn Trà",   gradeLevels: ["THPT"], licenseQuota: 700, licenseUsed: 490, storageQuotaGB: 70, storageUsedGB: 28, active: true, onboardedAt: "2024-10-05T00:00:00Z" },
  { id: "T-SCH-12", type: "school", name: "Trường THCS Lý Thường Kiệt",code: "THCS-LTK",  province: "Đà Nẵng",   district: "Thanh Khê", gradeLevels: ["THCS"], licenseQuota: 500, licenseUsed: 318, storageQuotaGB: 50, storageUsedGB: 18, active: true, onboardedAt: "2024-10-10T00:00:00Z" },
  { id: "T-SCH-13", type: "school", name: "Trường Tiểu học An Cựu",   code: "TH-ACUU",    province: "Thừa Thiên Huế", district: "TP Huế", gradeLevels: ["Tiểu học"], licenseQuota: 350, licenseUsed: 210, storageQuotaGB: 35, storageUsedGB: 12, active: true, onboardedAt: "2024-10-15T00:00:00Z" },
  { id: "T-SCH-14", type: "school", name: "Trường THCS Duy Xuyên",    code: "THCS-DX",    province: "Quảng Nam", district: "Duy Xuyên", gradeLevels: ["THCS"], licenseQuota: 400, licenseUsed: 255, storageQuotaGB: 40, storageUsedGB: 15, active: true, onboardedAt: "2024-10-20T00:00:00Z" },
  { id: "T-SCH-15", type: "school", name: "Trường THPT Nghề Nha Trang",code: "THPTN-NT",  province: "Khánh Hòa", district: "TP Nha Trang", gradeLevels: ["THPT Nghề"], licenseQuota: 450, licenseUsed: 290, storageQuotaGB: 45, storageUsedGB: 18, active: true, onboardedAt: "2024-11-01T00:00:00Z" },

  // === AUTHORITY (2) ===
  {
    id: "T-AUT-01", type: "authority",
    name: "Sở GD&ĐT Hà Nội",
    code: "SGD-HN",
    province: "Hà Nội",
    address: "23 Quang Trung, Hoàn Kiếm, Hà Nội",
    contactEmail: "vanthu@hanoi.edu.vn",
    licenseQuota: 10_000, licenseUsed: 3_200,
    storageQuotaGB: 1000, storageUsedGB: 320,
    active: true,
    onboardedAt: "2024-02-01T00:00:00Z",
  },
  {
    id: "T-AUT-02", type: "authority",
    name: "Sở GD&ĐT TP.HCM",
    code: "SGD-HCM",
    province: "TP.HCM",
    address: "66-68 Lê Thánh Tôn, Q.1, TP.HCM",
    contactEmail: "vanthu@hcm.edu.vn",
    licenseQuota: 12_000, licenseUsed: 4_100,
    storageQuotaGB: 1200, storageUsedGB: 410,
    active: true,
    onboardedAt: "2024-02-15T00:00:00Z",
  },
];

export const tenantsByType = {
  supplier: tenants.filter((t) => t.type === "supplier"),
  distributor: tenants.filter((t) => t.type === "distributor"),
  school: tenants.filter((t) => t.type === "school"),
  authority: tenants.filter((t) => t.type === "authority"),
};

export function findTenant(id: string): Tenant | undefined {
  return tenants.find((t) => t.id === id);
}
