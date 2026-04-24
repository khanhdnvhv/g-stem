/* ================================================================ */
/*  MOCK DATA TYPES — Geleximco STEM Platform                        */
/*  Nguồn: docs/data-model.md                                        */
/* ================================================================ */

export type TenantType = "supplier" | "distributor" | "school" | "authority";

export type StemRole =
  | "supplier_admin" | "supplier_content" | "supplier_sales" | "supplier_warranty"
  | "distributor_admin" | "distributor_sales" | "distributor_finance"
  | "school_principal" | "school_admin" | "school_itadmin"
  | "authority_admin" | "authority_viewer"
  | "teacher" | "student"
  | "system_admin";

/** Mã 5 chương trình STEM */
export type StemProgram = "CT1" | "CT2" | "CT3" | "CT4" | "CT5";

/** Gói phòng STEM — 3 tier */
export type StemPackageTier = "minimum" | "basic" | "advanced";

/* ================================================================ */
/*  Tenant                                                           */
/* ================================================================ */
export interface Tenant {
  id: string;
  type: TenantType;
  name: string;
  code: string;
  province?: string;
  district?: string;
  address?: string;
  logo?: string;
  contactEmail?: string;
  contactPhone?: string;
  licenseQuota: number;
  licenseUsed: number;
  storageQuotaGB: number;
  storageUsedGB: number;
  active: boolean;
  onboardedAt: string;
  parentTenantId?: string;
  /** Chỉ áp dụng cho school — cấp học */
  gradeLevels?: string[];
  /** Chỉ áp dụng cho distributor — phạm vi phủ */
  coverageProvinces?: string[];
}

/* ================================================================ */
/*  StemProgram meta                                                 */
/* ================================================================ */
export interface StemProgramMeta {
  code: StemProgram;
  name: string;
  shortName: string;
  description: string;
  color: string;
  supportedGrades: string[];
  supportedSubjects: string[];
}

/* ================================================================ */
/*  StemPackage                                                      */
/* ================================================================ */
export interface EquipmentSpec {
  category: string;
  name: string;
  quantity: number;
  unitPriceVND: number;
  specs?: string;
}
export interface SoftwareSpec {
  name: string;
  version: string;
  licenseType: "per_user" | "per_device" | "site";
  seats: number;
}
export interface StemPackage {
  id: string;
  tier: StemPackageTier;
  name: string;
  description: string;
  priceVND: number;
  includedEquipment: EquipmentSpec[];
  includedSoftware: SoftwareSpec[];
  supportedGrades: string[];
  supportedPrograms: StemProgram[];
  demoVideoUrl?: string;
  thumbnails: string[];
  configuration: {
    infrastructure: string[];
    smartDevices: string[];
    furniture: string[];
    decoration: string[];
  };
  active: boolean;
  publishedAt: string;
}

/* ================================================================ */
/*  Equipment & Warranty                                             */
/* ================================================================ */
export type EquipmentStatus = "ok" | "warning" | "broken" | "missing";
export interface Equipment {
  id: string;
  name: string;
  serial: string;
  category: string;
  packageId: string;
  schoolId: string;
  location: string;
  status: EquipmentStatus;
  purchasedAt: string;
  warrantyEndsAt: string;
  lastCheckedBy?: string;
  lastCheckedAt?: string;
  usageHours?: number;
  qrCode?: string;
}

export type WarrantyStatus =
  | "new" | "accepted" | "awaiting_part"
  | "in_progress" | "resolved" | "rejected" | "closed";
export interface WarrantyTicket {
  id: string;
  ticketNo: string;
  equipmentId: string;
  schoolId: string;
  reportedBy: string;
  reportedAt: string;
  issue: string;
  photos: string[];
  status: WarrantyStatus;
  assignedTo?: string;
  slaDueAt?: string;
  resolutionNote?: string;
  history: { at: string; by: string; status: WarrantyStatus; note?: string }[];
}

/* ================================================================ */
/*  Orders & Contracts                                               */
/* ================================================================ */
export type OrderStatus =
  | "draft" | "pending" | "approved"
  | "delivering" | "delivered" | "cancelled";
export interface OrderItem {
  packageId: string;
  quantity: number;
  unitPrice: number;
}
export interface Order {
  id: string;
  orderNo: string;
  /** Bên mua */
  fromTenantId: string;
  /** Bên bán (supplier hoặc distributor trung gian) */
  toTenantId: string;
  /** Đại lý môi giới (có thể trống nếu mua trực tiếp) */
  distributorTenantId?: string;
  items: OrderItem[];
  totalVND: number;
  status: OrderStatus;
  createdAt: string;
  createdBy: string;
  deliveredAt?: string;
  contractId?: string;
  note?: string;
}

export interface ContractMilestone {
  title: string;
  dueAt: string;
  done: boolean;
}
export interface Contract {
  id: string;
  contractNo: string;
  supplierId: string;
  distributorId?: string;
  schoolId: string;
  signedAt: string;
  totalVND: number;
  status: "draft" | "signed" | "active" | "expired" | "terminated";
  milestones: ContractMilestone[];
  attachments: string[];
  commissionPct?: number;
}

/* ================================================================ */
/*  License                                                          */
/* ================================================================ */
export type LicenseType = "per_user" | "per_device" | "site";
export interface License {
  id: string;
  licenseKey: string;
  type: LicenseType;
  productName: string;
  seats: number;
  seatsUsed: number;
  tenantId: string;
  issuedAt: string;
  expiresAt: string;
  revokedAt?: string;
}

/* ================================================================ */
/*  Kho ảo                                                           */
/* ================================================================ */
export interface VirtualStockMovement {
  id: string;
  at: string;
  tenantId: string;
  packageId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  orderId?: string;
  note?: string;
}
export interface VirtualStockBalance {
  tenantId: string;
  packageId: string;
  openingQty: number;
  inQty: number;
  outQty: number;
  closingQty: number;
}

/* ================================================================ */
/*  Commission                                                       */
/* ================================================================ */
export interface CommissionRecord {
  id: string;
  period: string;
  supplierId: string;
  distributorId: string;
  baseRevenueVND: number;
  commissionPct: number;
  commissionVND: number;
  status: "pending" | "reconciled" | "paid" | "disputed";
  attachment?: string;
}

/* ================================================================ */
/*  Schedule                                                         */
/* ================================================================ */
export interface STEMScheduleEntry {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  programCode: StemProgram;
  subject: string;
  roomId: string;
  roomName: string;
  weekday: number; // 1-7, 1=Thứ 2
  period: number;  // 1-10
  dateFrom: string;
  dateTo: string;
  isClub?: boolean;
  note?: string;
}

/* ================================================================ */
/*  Lessons                                                          */
/* ================================================================ */
export interface Lesson {
  id: string;
  title: string;
  description: string;
  programCode: StemProgram;
  gradeLevel: string;
  subject: string;
  sgkMapping?: string;
  durationMinutes: number;
  resourceUrls: string[];
  thumbnail: string;
  createdBy: string;
  createdAt: string;
}

/* ================================================================ */
/*  STEMExam                                                         */
/* ================================================================ */
export interface STEMExam {
  id: string;
  name: string;
  level: "school" | "district" | "province" | "national";
  gradeLevel: string;
  programCodes: StemProgram[];
  openAt: string;
  closeAt: string;
  durationMinutes: number;
  questionCount: number;
  organiser: string;
  status: "upcoming" | "open" | "closed" | "graded";
  totalParticipants?: number;
}

/* ================================================================ */
/*  Authority                                                        */
/* ================================================================ */
export interface AuthorityReport {
  id: string;
  name: string;
  templateCode: string;
  generatedAt: string;
  scope: "district" | "province" | "national";
  period: string;
  fileUrl: string;
  generatedBy: string;
}

export interface ProvinceSnapshot {
  province: string;
  districts: number;
  schools: number;
  teachers: number;
  students: number;
  stemCoveragePct: number;
  equipmentCompliancePct: number;
  avgStemScore: number;
}

export interface ProcurementEntry {
  id: string;
  year: number;
  province: string;
  schoolTier: "Mầm non" | "Tiểu học" | "THCS" | "THPT" | "THPT Nghề";
  fundingSource: "Ngân sách" | "Học phí" | "Xã hội hóa";
  amountVND: number;
  packageId: string;
}

/* ================================================================ */
/*  Danh mục dùng chung                                              */
/* ================================================================ */
export interface CatalogItem {
  id: string;
  catalog: "subject" | "grade" | "school" | "skill" | "program";
  code: string;
  name: string;
  parentCode?: string;
  metadata?: Record<string, unknown>;
}

/* ================================================================ */
/*  Data Sync                                                        */
/* ================================================================ */
export interface DataSyncRecord {
  id: string;
  source: "NEdu" | "VNeID" | "ERP" | "CRM";
  direction: "in" | "out";
  entity: string;
  count: number;
  startedAt: string;
  finishedAt?: string;
  status: "queued" | "running" | "done" | "error";
  quality4D: {
    dung: boolean;    // Đúng
    du: boolean;      // Đủ
    sach: boolean;    // Sạch
    song: boolean;    // Sống
  };
  note?: string;
}

/* ================================================================ */
/*  Notification (kế thừa)                                           */
/* ================================================================ */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "deadline";
  time: string;
  read: boolean;
}
