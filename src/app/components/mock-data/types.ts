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

/** Vòng đời gói */
export type PackageStatus = "draft" | "waiting_approval" | "active" | "discontinued";

/** Loại gói: catalog cố định vs custom cho 1 trường */
export type PackageType = "template" | "custom";

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
  /** NCC sở hữu gói này — AD-04: mỗi NCC chỉ thấy gói của mình */
  supplierTenantId: string;
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
  /** Vòng đời — nếu undefined thì coi như "active" (backward compat) */
  status?: PackageStatus;
  packageType?: PackageType;
  /** Chỉ khi packageType = "custom" */
  targetSchoolId?: string;
  /** Chi tiết giá (tách từ priceVND) */
  equipmentCostVND?: number;
  installationFeeVND?: number;
  trainingDays?: number;
  warrantyMonths?: number;
  /** Nội dung kèm theo */
  contentLessonIds?: string[];
  teacherDocUrls?: string[];
  /** Approval metadata */
  createdBy?: string;
  approvedBy?: string;
  rejectionNote?: string;
  submittedAt?: string;
}

/* ================================================================ */
/*  SchoolPackage — Gắn gói cho trường (V1 direct sales)            */
/* ================================================================ */
export interface SchoolPackage {
  id: string;
  packageId: string;
  schoolTenantId: string;
  /** userId NCC staff thực hiện gắn */
  assignedBy: string;
  startDate: string;
  notes?: string;
  status: "active" | "expired" | "cancelled";
  createdAt: string;
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
  /** Lý do chấm dứt hợp đồng sớm (BR-OP-11) */
  terminationReason?: string;
}

/* ================================================================ */
/*  License                                                          */
/* ================================================================ */
export type LicenseType = "per_user" | "per_device" | "site";
export type LicenseStatus = "active" | "expiring" | "expired" | "revoked";
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
  /** Truy nguồn — license cấp theo hợp đồng/đơn nào (BR-OP-03) */
  contractId?: string;
  orderId?: string;
  /** Trạng thái tường minh — nếu undefined thì suy ra từ revokedAt/expiresAt */
  status?: LicenseStatus;
}

/* ================================================================ */
/*  InstallCampaign — Chiến dịch cài đặt bộ cài phần mềm             */
/*  Nguồn: docs/Operations-Business-Analysis.md §5                   */
/* ================================================================ */
export type CampaignStatus = "draft" | "running" | "completed" | "failed" | "paused";
export interface InstallCampaign {
  id: string;
  name: string;
  softwareName: string;
  version: string;
  /** Truy nguồn — campaign thuộc hợp đồng nào */
  contractId?: string;
  /** License kích hoạt phần mềm (BR-OP-06) */
  licenseId?: string;
  /** Thiết bị mục tiêu (BR-OP-05) */
  targetEquipmentIds: string[];
  targetCount: number;
  completedCount: number;
  failedCount: number;
  status: CampaignStatus;
  createdAt: string;
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
  /** ID câu hỏi từ EXAM_QUESTIONS — kỳ thi tạo qua wizard */
  questionIds?: string[];
  /** Điểm đạt (thang 10) */
  passingScore?: number;
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

/* ================================================================ */
/*  LESSON V2 — Schema mới hỗ trợ 5 CT đầy đủ                        */
/*  Nguồn: docs/CT-Programs-Specification.md §13                     */
/*  Coexist với `Lesson` cũ — backward compat                        */
/* ================================================================ */

/* ── CT-specific metadata (discriminated union) ── */
export interface CT1Meta {
  type: "CT1";
  subject: string;          // 1 môn duy nhất
  sgkBook?: string;         // SGK ref encoded (VD "TOAN-8-KNTT/C1/L1.2")
}

export interface CT2Meta {
  type: "CT2";
  drivingSubject: string;
  integratedSubjects: string[];
  topic: string;
  sgkBooks?: string[];
}

export interface CT3Meta {
  type: "CT3";
  activityName: string;
  domain: "stem_art" | "tin_hoc" | "khoa_hoc_vl" | "co_khi" | "sinh_hoc" | "khac";
  finalProduct: string;
  studentsPerGroup: number;
}

export interface CT4Meta {
  type: "CT4";
  module: "robotics_1" | "ai" | "iot" | "robotics_ai";
  language: "scratch" | "block" | "arduino_c" | "python";
  requiredHardware: string[];   // VD ["Arduino UNO", "HC-SR04"]
  safetyNotes: string;
}

export interface CT5Meta {
  type: "CT5";
  topicCode: string;            // VD "T01"
  leadStudent: string;          // tên HS
  mentorTeacher: string;        // tên GV
  expectedDuration: "3m" | "6m" | "1y" | "2y";
  researchQuestion: string;
  hypothesis?: string;
  methodology?: string;
  expectedOutputs: Array<"paper" | "poster" | "competition" | "real_product">;
  fiveYearPlan?: Array<{ year: number; goal: string }>;
}

export type CTMetadata = CT1Meta | CT2Meta | CT3Meta | CT4Meta | CT5Meta;

/* ── Block content shapes ── */
export interface LessonBlock {
  id: string;
  type: string;              // BlockType — tham chiếu ct-templates
  phaseId: string;           // ID phase (warmup / knowledge / build / rq / ...)
  order: number;
  content: unknown;          // shape phụ thuộc block type
}

/* ── Attachment slot instance ── */
export interface LessonAttachment {
  slotType: string;         // AttachmentSlotType
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

/* ── Learning objectives — 4 mục tiêu chuẩn 5512 ── */
export interface LearningObjectives {
  knowledge: string;        // Kiến thức
  skills: string;           // Kỹ năng
  attitude: string;         // Thái độ
  competencies: string[];   // Năng lực — tham chiếu Competency
}

/* ── LessonV2 — schema chính ── */
export interface LessonV2 {
  id: string;
  title: string;
  description: string;
  programCode: StemProgram;
  gradeLevel: string;       // VD "THCS 8"
  durationMinutes: number;
  thumbnail: string;
  status: "draft" | "review" | "published" | "researching" | "completed";
  ctMetadata: CTMetadata;
  objectives?: LearningObjectives;
  requiredDevices?: Array<{ deviceId: string; qty: number }>;
  blocks: LessonBlock[];
  attachments: LessonAttachment[];
  createdBy: string;
  createdAt: string;
  publishedAt?: string;
  lastSavedAt?: string;
  version?: number;
}
