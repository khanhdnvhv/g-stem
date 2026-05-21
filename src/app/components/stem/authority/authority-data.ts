/**
 * authority-data.ts — All data and types for the Authority module.
 * Completely self-contained: no imports from outside this folder.
 */

/* ================================================================ */
/*  TYPES                                                            */
/* ================================================================ */

export type EquipmentStatus = "ok" | "warning" | "broken" | "missing";
export type StemProgram = "CT1" | "CT2" | "CT3" | "CT4" | "CT5";
export type StemPackageTier = "minimum" | "basic" | "advanced";
export type TenantType = "supplier" | "distributor" | "school" | "authority";

export interface StemProgramMeta {
  code: StemProgram;
  name: string;
  shortName: string;
  description: string;
  color: string;
  supportedGrades: string[];
  supportedSubjects: string[];
}

export interface Tenant {
  id: string; type: TenantType; name: string; code: string;
  province?: string; district?: string; address?: string;
  contactEmail?: string; contactPhone?: string;
  licenseQuota: number; licenseUsed: number;
  storageQuotaGB: number; storageUsedGB: number;
  active: boolean; onboardedAt: string; parentTenantId?: string;
  gradeLevels?: string[]; coverageProvinces?: string[];
}

export interface Equipment {
  id: string; name: string; serial: string; category: string;
  packageId: string; schoolId: string; location: string;
  status: EquipmentStatus; purchasedAt: string; warrantyEndsAt: string;
  lastCheckedBy?: string; lastCheckedAt?: string; usageHours?: number; qrCode?: string;
}

export interface ProvinceSnapshot {
  province: string; districts: number; schools: number;
  teachers: number; students: number; stemCoveragePct: number;
  equipmentCompliancePct: number; avgStemScore: number;
}

export interface ProcurementEntry {
  id: string; year: number; province: string;
  schoolTier: "Mầm non" | "Tiểu học" | "THCS" | "THPT" | "THPT Nghề";
  fundingSource: "Ngân sách" | "Học phí" | "Xã hội hóa";
  costCategory: "Thiết bị" | "Phần mềm / Giấy phép" | "Cơ sở vật chất" | "Đào tạo GV" | "Vận hành / Bảo trì";
  amountVND: number; packageId: string;
  schoolId?: string; schoolName?: string; district?: string;
}

export interface DataSyncRecord {
  id: string; source: "NEdu" | "VNeID" | "ERP" | "CRM";
  direction: "in" | "out"; entity: string; count: number;
  startedAt: string; finishedAt?: string;
  status: "queued" | "running" | "done" | "error";
  quality4D: { dung: boolean; du: boolean; sach: boolean; song: boolean };
  note?: string;
}

export interface CatalogItem {
  id: string; catalog: "subject" | "grade" | "school" | "skill" | "program" | "subjectGroup";
  code: string; name: string; parentCode?: string; metadata?: Record<string, unknown>;
}

export interface AuthorityReport {
  id: string; name: string; templateCode: string; generatedAt: string;
  scope: "district" | "province" | "national"; period: string;
  fileUrl: string; generatedBy: string;
}

export type ExamType = "KT 15 phút" | "KT cuối chương" | "KT giữa kỳ" | "KT học kỳ 1" | "KT học kỳ 2" | "KT cuối kỳ";

export interface StudentResult {
  id: string; studentName: string; className: string; subject: string;
  examType: ExamType; chapterName: string; setLabel: string; score: number;
  correctCount: number; totalCount: number; submittedAt: string; teacherName: string;
}

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
  weekday: number;
  period: number;
  dateFrom: string;
  dateTo: string;
  isClub?: boolean;
  note?: string;
}

/* ================================================================ */
/*  CONSTANTS                                                        */
/* ================================================================ */

export const STEM_PROGRAMS: Record<StemProgram, StemProgramMeta> = {
  CT1: { code:"CT1", name:"STEM Tích hợp nội môn", shortName:"Tích hợp nội môn", description:"Giảng dạy từng môn theo hướng thực tiễn, ứng dụng sáng tạo.", color:"#64748b", supportedGrades:["Mầm non","Tiểu học","THCS","THPT","THPT Nghề"], supportedSubjects:["Toán","Lý","Hóa","Sinh","Tin","Công nghệ","Tiếng Việt","Khoa học"] },
  CT2: { code:"CT2", name:"STEM Liên môn", shortName:"Liên môn", description:"Vận dụng kiến thức liên môn để giải quyết vấn đề thực tiễn.", color:"#0891b2", supportedGrades:["THCS","THPT"], supportedSubjects:["Toán","Lý","Hóa","Sinh","Tin","Công nghệ"] },
  CT3: { code:"CT3", name:"STEM Đổi mới sáng tạo", shortName:"Đổi mới sáng tạo", description:"Hoạt động sáng tạo, làm sản phẩm cụ thể.", color:"#7c3aed", supportedGrades:["Tiểu học","THCS","THPT"], supportedSubjects:["CLB Sáng tạo","Ngoại khóa","Làm sản phẩm"] },
  CT4: { code:"CT4", name:"STEM Robotic · AI · Trải nghiệm", shortName:"Robotic / AI", description:"STEM định hướng đổi mới sáng tạo: Robotic, AI, Trải nghiệm.", color:"#dc2626", supportedGrades:["THCS","THPT","THPT Nghề"], supportedSubjects:["Robotic","AI","Lập trình","IoT"] },
  CT5: { code:"CT5", name:"STEM Nghiên cứu khoa học", shortName:"Nghiên cứu khoa học", description:"Tập trung nghiên cứu khoa học độc lập.", color:"#059669", supportedGrades:["THCS","THPT"], supportedSubjects:["NCKH","Dự án Nghiên cứu"] },
};

export const SCHOOL_TIERS = ["Mầm non","Tiểu học","THCS","THPT","THPT Nghề"] as const;
export const FUNDING_SOURCES = ["Ngân sách","Học phí","Xã hội hóa"] as const;
export const COST_CATEGORIES = ["Thiết bị","Phần mềm / Giấy phép","Cơ sở vật chất","Đào tạo GV","Vận hành / Bảo trì"] as const;
export const MINISTRY_REPORT_TEMPLATES = [
  { code:"TT38-2023", name:"Thông tư 38/2023 — Báo cáo thiết bị dạy học" },
  { code:"TT32-2020", name:"Thông tư 32/2020 — Chương trình GDPT tổng thể" },
  { code:"CV1014",    name:"Công văn 1014 — Triển khai giáo dục STEM" },
  { code:"TT26-2020", name:"Thông tư 26/2020 — Đánh giá HS trung học" },
  { code:"BC-STEM-Q", name:"Báo cáo triển khai STEM theo quý" },
];

/* ================================================================ */
/*  TENANTS                                                          */
/* ================================================================ */

const _tenants: Tenant[] = [
  { id:"T-SUP-01", type:"supplier", name:"Geleximco STEM", code:"GLX-STEM", address:"36 Hoàng Cầu, Đống Đa, Hà Nội", contactEmail:"hello@geleximco-stem.vn", contactPhone:"024 3883 0000", licenseQuota:500_000, licenseUsed:187_430, storageQuotaGB:50_000, storageUsedGB:12_450, active:true, onboardedAt:"2024-01-10T00:00:00Z" },
  { id:"T-DIS-01", type:"distributor", name:"Đại lý Giáo dục ABC", code:"DL-ABC", address:"123 Cầu Giấy, Hà Nội", coverageProvinces:["Hà Nội","Bắc Ninh","Hưng Yên","Hải Phòng"], contactEmail:"contact@abc-edu.vn", contactPhone:"024 3868 1111", licenseQuota:50_000, licenseUsed:12_800, storageQuotaGB:500, storageUsedGB:120, active:true, onboardedAt:"2024-03-15T00:00:00Z", parentTenantId:"T-SUP-01" },
  { id:"T-DIS-02", type:"distributor", name:"Công ty CP Giáo dục Phương Nam", code:"DL-PN", address:"45 Nguyễn Văn Linh, Q.7, TP.HCM", coverageProvinces:["TP.HCM","Bình Dương","Đồng Nai","Vũng Tàu","Long An"], contactEmail:"lienhe@phuongnam-edu.vn", contactPhone:"028 5415 2222", licenseQuota:40_000, licenseUsed:8_200, storageQuotaGB:400, storageUsedGB:95, active:true, onboardedAt:"2024-04-20T00:00:00Z", parentTenantId:"T-SUP-01" },
  { id:"T-DIS-03", type:"distributor", name:"Trung tâm Phân phối Miền Trung", code:"DL-MT", address:"88 Nguyễn Văn Linh, Đà Nẵng", coverageProvinces:["Đà Nẵng","Quảng Nam","Quảng Ngãi","Huế","Khánh Hòa"], contactEmail:"mt@stem-mientrung.vn", contactPhone:"0236 3888 333", licenseQuota:25_000, licenseUsed:4_450, storageQuotaGB:250, storageUsedGB:60, active:true, onboardedAt:"2024-06-10T00:00:00Z", parentTenantId:"T-SUP-01" },
  { id:"T-SCH-01", type:"school", name:"Trường THCS Ba Vì", code:"THCS-BAVI", province:"Hà Nội", district:"Ba Vì", gradeLevels:["THCS"], licenseQuota:500, licenseUsed:312, storageQuotaGB:50, storageUsedGB:18, active:true, onboardedAt:"2024-08-01T00:00:00Z" },
  { id:"T-SCH-02", type:"school", name:"Trường THPT Hà Đông", code:"THPT-HD", province:"Hà Nội", district:"Hà Đông", gradeLevels:["THPT"], licenseQuota:800, licenseUsed:543, storageQuotaGB:80, storageUsedGB:29, active:true, onboardedAt:"2024-08-15T00:00:00Z" },
  { id:"T-SCH-03", type:"school", name:"Trường Tiểu học Cầu Giấy", code:"TH-CG", province:"Hà Nội", district:"Cầu Giấy", gradeLevels:["Tiểu học"], licenseQuota:700, licenseUsed:450, storageQuotaGB:60, storageUsedGB:22, active:true, onboardedAt:"2024-09-01T00:00:00Z" },
  { id:"T-SCH-04", type:"school", name:"Trường THCS Nguyễn Trãi", code:"THCS-NT", province:"Hà Nội", district:"Thanh Xuân", gradeLevels:["THCS"], licenseQuota:600, licenseUsed:388, storageQuotaGB:60, storageUsedGB:25, active:true, onboardedAt:"2024-09-10T00:00:00Z" },
  { id:"T-SCH-05", type:"school", name:"Trường Mầm non Hoa Mai", code:"MN-HM", province:"Hà Nội", district:"Ba Đình", gradeLevels:["Mầm non"], licenseQuota:200, licenseUsed:110, storageQuotaGB:20, storageUsedGB:7, active:true, onboardedAt:"2024-09-15T00:00:00Z" },
  { id:"T-SCH-06", type:"school", name:"Trường THPT Lê Hồng Phong", code:"THPT-LHP", province:"TP.HCM", district:"Q.5", gradeLevels:["THPT"], licenseQuota:900, licenseUsed:620, storageQuotaGB:90, storageUsedGB:35, active:true, onboardedAt:"2024-08-20T00:00:00Z" },
  { id:"T-SCH-07", type:"school", name:"Trường THCS Trần Đại Nghĩa", code:"THCS-TDN", province:"TP.HCM", district:"Q.1", gradeLevels:["THCS"], licenseQuota:700, licenseUsed:512, storageQuotaGB:70, storageUsedGB:30, active:true, onboardedAt:"2024-09-05T00:00:00Z" },
  { id:"T-SCH-08", type:"school", name:"Trường Tiểu học Lê Quý Đôn", code:"TH-LQD", province:"TP.HCM", district:"Q.3", gradeLevels:["Tiểu học"], licenseQuota:500, licenseUsed:320, storageQuotaGB:50, storageUsedGB:18, active:true, onboardedAt:"2024-09-12T00:00:00Z" },
  { id:"T-SCH-09", type:"school", name:"Trường THPT Chuyên Ngoại ngữ", code:"THPT-CNN", province:"TP.HCM", district:"Q.7", gradeLevels:["THPT"], licenseQuota:600, licenseUsed:430, storageQuotaGB:60, storageUsedGB:23, active:true, onboardedAt:"2024-09-20T00:00:00Z" },
  { id:"T-SCH-10", type:"school", name:"Trường THCS Nguyễn Du", code:"THCS-ND-DN", province:"Đà Nẵng", district:"Hải Châu", gradeLevels:["THCS"], licenseQuota:550, licenseUsed:362, storageQuotaGB:55, storageUsedGB:20, active:true, onboardedAt:"2024-10-01T00:00:00Z" },
  { id:"T-SCH-11", type:"school", name:"Trường THPT Phan Châu Trinh", code:"THPT-PCT", province:"Đà Nẵng", district:"Sơn Trà", gradeLevels:["THPT"], licenseQuota:700, licenseUsed:490, storageQuotaGB:70, storageUsedGB:28, active:true, onboardedAt:"2024-10-05T00:00:00Z" },
  { id:"T-SCH-12", type:"school", name:"Trường THCS Lý Thường Kiệt", code:"THCS-LTK", province:"Đà Nẵng", district:"Thanh Khê", gradeLevels:["THCS"], licenseQuota:500, licenseUsed:318, storageQuotaGB:50, storageUsedGB:18, active:true, onboardedAt:"2024-10-10T00:00:00Z" },
  { id:"T-SCH-13", type:"school", name:"Trường Tiểu học An Cựu", code:"TH-ACUU", province:"Thừa Thiên Huế", district:"TP Huế", gradeLevels:["Tiểu học"], licenseQuota:350, licenseUsed:210, storageQuotaGB:35, storageUsedGB:12, active:true, onboardedAt:"2024-10-15T00:00:00Z" },
  { id:"T-SCH-14", type:"school", name:"Trường THCS Duy Xuyên", code:"THCS-DX", province:"Quảng Nam", district:"Duy Xuyên", gradeLevels:["THCS"], licenseQuota:400, licenseUsed:255, storageQuotaGB:40, storageUsedGB:15, active:true, onboardedAt:"2024-10-20T00:00:00Z" },
  { id:"T-SCH-15", type:"school", name:"Trường THPT Nghề Nha Trang", code:"THPTN-NT", province:"Khánh Hòa", district:"TP Nha Trang", gradeLevels:["THPT Nghề"], licenseQuota:450, licenseUsed:290, storageQuotaGB:45, storageUsedGB:18, active:true, onboardedAt:"2024-11-01T00:00:00Z" },
  { id:"T-AUT-01", type:"authority", name:"Sở GD&ĐT Hà Nội", code:"SGD-HN", province:"Hà Nội", address:"23 Quang Trung, Hoàn Kiếm, Hà Nội", contactEmail:"vanthu@hanoi.edu.vn", licenseQuota:10_000, licenseUsed:3_200, storageQuotaGB:1000, storageUsedGB:320, active:true, onboardedAt:"2024-02-01T00:00:00Z" },
  { id:"T-AUT-02", type:"authority", name:"Sở GD&ĐT TP.HCM", code:"SGD-HCM", province:"TP.HCM", address:"66-68 Lê Thánh Tôn, Q.1, TP.HCM", contactEmail:"vanthu@hcm.edu.vn", licenseQuota:12_000, licenseUsed:4_100, storageQuotaGB:1200, storageUsedGB:410, active:true, onboardedAt:"2024-02-15T00:00:00Z" },
];

export const tenantsByType = {
  supplier:    _tenants.filter(t => t.type === "supplier"),
  distributor: _tenants.filter(t => t.type === "distributor"),
  school:      _tenants.filter(t => t.type === "school"),
  authority:   _tenants.filter(t => t.type === "authority"),
};

/* ================================================================ */
/*  EQUIPMENT                                                        */
/* ================================================================ */

const EQUIPMENT_CATALOG = [
  { category:"Robotic",  name:"Robot Mbot",               pkg:"PKG-BAS" },
  { category:"Robotic",  name:"Robot Lego SPIKE",          pkg:"PKG-ADV" },
  { category:"Robotic",  name:"Cánh tay robot",            pkg:"PKG-ADV" },
  { category:"AI",       name:"Workstation GPU",           pkg:"PKG-ADV" },
  { category:"IoT",      name:"Kit cảm biến IoT",          pkg:"PKG-ADV" },
  { category:"In 3D",    name:"Máy in 3D EDU",             pkg:"PKG-BAS" },
  { category:"In 3D",    name:"Máy in 3D Resin",           pkg:"PKG-ADV" },
  { category:"Laser",    name:"Máy cắt laser CO2",         pkg:"PKG-ADV" },
  { category:"Drone",    name:"Drone giáo dục",            pkg:"PKG-ADV" },
  { category:"VR",       name:"Meta Quest VR",             pkg:"PKG-ADV" },
  { category:"Điện tử",  name:"Arduino Starter Kit",       pkg:"PKG-BAS" },
  { category:"Lab",      name:"Kính hiển vi điện tử",      pkg:"PKG-BAS" },
  { category:"Hiển thị", name:'Smart TV 65"',              pkg:"PKG-BAS" },
  { category:"Hiển thị", name:'Interactive Board 86"',     pkg:"PKG-ADV" },
  { category:"Cơ bản",   name:"Bộ dụng cụ khoa học",      pkg:"PKG-MIN" },
  { category:"Cơ bản",   name:"Bộ lắp ghép cơ khí sơ cấp",pkg:"PKG-MIN" },
];

const STATUS_POOL: { status: EquipmentStatus; weight: number }[] = [
  { status:"ok", weight:80 }, { status:"warning", weight:10 },
  { status:"broken", weight:7 }, { status:"missing", weight:3 },
];

function weightedPick(seed: number): EquipmentStatus {
  const total = STATUS_POOL.reduce((s,p) => s + p.weight, 0);
  const pick = seed % total;
  let acc = 0;
  for (const p of STATUS_POOL) { acc += p.weight; if (pick < acc) return p.status; }
  return "ok";
}

const _equipmentList: Equipment[] = [];
let _eqIdx = 1;
for (const school of tenantsByType.school) {
  const count = 13 + (_eqIdx % 3);
  for (let i = 0; i < count; i++) {
    const cat = EQUIPMENT_CATALOG[(_eqIdx + i) % EQUIPMENT_CATALOG.length];
    _equipmentList.push({
      id: `EQ-${String(_eqIdx).padStart(4,"0")}`,
      name: cat.name, serial: `SN-${String(_eqIdx).padStart(6,"0")}`,
      category: cat.category, packageId: cat.pkg, schoolId: school.id,
      location: `Phòng STEM ${(_eqIdx % 3) + 1}`,
      status: weightedPick(_eqIdx * 7 + i * 13),
      purchasedAt: `2024-${String((_eqIdx % 12)+1).padStart(2,"0")}-10T00:00:00Z`,
      warrantyEndsAt: `2027-${String((_eqIdx % 12)+1).padStart(2,"0")}-10T00:00:00Z`,
      lastCheckedBy: "U-TCH-01",
      lastCheckedAt: `2026-04-${String((_eqIdx % 28)+1).padStart(2,"0")}T08:00:00Z`,
      usageHours: (_eqIdx * 23) % 500,
      qrCode: `https://stem.geleximco.vn/qr/EQ-${_eqIdx}`,
    });
    _eqIdx++;
  }
}

export const equipment = _equipmentList;
export function equipmentBySchool(schoolId: string): Equipment[] {
  return equipment.filter(e => e.schoolId === schoolId);
}

/* ================================================================ */
/*  PROVINCE SNAPSHOTS                                               */
/* ================================================================ */

export const provinceSnapshots: ProvinceSnapshot[] = [
  { province: "Hà Nội",            districts: 30, schools: 2850, teachers: 79000, students: 2_150_000, stemCoveragePct: 71, equipmentCompliancePct: 68, avgStemScore: 7.8 },
  { province: "TP.HCM",            districts: 24, schools: 2400, teachers: 76000, students: 1_980_000, stemCoveragePct: 84, equipmentCompliancePct: 77, avgStemScore: 8.1 },
  { province: "Đà Nẵng",           districts:  8, schools:  410, teachers: 12800, students:   320_000, stemCoveragePct: 76, equipmentCompliancePct: 72, avgStemScore: 7.9 },
  { province: "Thừa Thiên Huế",    districts:  9, schools:  480, teachers:  9600, students:   220_000, stemCoveragePct: 58, equipmentCompliancePct: 54, avgStemScore: 7.2 },
  { province: "Quảng Nam",         districts: 18, schools:  920, teachers: 15300, students:   330_000, stemCoveragePct: 52, equipmentCompliancePct: 48, avgStemScore: 7.0 },
  { province: "Khánh Hòa",         districts:  9, schools:  570, teachers: 11200, students:   250_000, stemCoveragePct: 61, equipmentCompliancePct: 57, avgStemScore: 7.4 },
  { province: "Bình Dương",        districts:  9, schools:  610, teachers: 14500, students:   390_000, stemCoveragePct: 79, equipmentCompliancePct: 73, avgStemScore: 7.9 },
  { province: "Đồng Nai",          districts: 11, schools:  780, teachers: 16700, students:   430_000, stemCoveragePct: 68, equipmentCompliancePct: 64, avgStemScore: 7.6 },
  { province: "Hải Phòng",         districts: 15, schools:  860, teachers: 17200, students:   420_000, stemCoveragePct: 73, equipmentCompliancePct: 70, avgStemScore: 7.7 },
  { province: "Bắc Ninh",          districts:  8, schools:  520, teachers: 11000, students:   240_000, stemCoveragePct: 66, equipmentCompliancePct: 63, avgStemScore: 7.5 },
];

/* ================================================================ */
/*  PROCUREMENT ENTRIES                                              */
/* ================================================================ */

function pickCategory(seed: number): ProcurementEntry["costCategory"] {
  const r = seed % 20;
  if (r < 9)  return "Thiết bị";
  if (r < 13) return "Phần mềm / Giấy phép";
  if (r < 16) return "Cơ sở vật chất";
  if (r < 19) return "Đào tạo GV";
  return "Vận hành / Bảo trì";
}

const CATEGORY_RATIO: Record<ProcurementEntry["costCategory"], number> = {
  "Thiết bị":               1.0,
  "Phần mềm / Giấy phép":   0.44,
  "Cơ sở vật chất":         0.33,
  "Đào tạo GV":             0.27,
  "Vận hành / Bảo trì":     0.18,
};

export const procurementEntries: ProcurementEntry[] = [];
let _pidx = 1;
for (const prov of provinceSnapshots.slice(0, 6)) {
  for (const year of [2024, 2025, 2026]) {
    for (const tier of SCHOOL_TIERS) {
      for (const src of FUNDING_SOURCES) {
        const cat = pickCategory(_pidx);
        procurementEntries.push({
          id: `PR-${String(_pidx).padStart(5, "0")}`,
          year,
          province: prov.province,
          schoolTier: tier,
          fundingSource: src,
          costCategory: cat,
          amountVND:
            (0.3 + (_pidx % 7) / 10) *
            (tier === "THPT" ? 4_500_000_000 : tier === "THCS" ? 3_200_000_000 : tier === "Tiểu học" ? 1_800_000_000 : tier === "Mầm non" ? 800_000_000 : 2_500_000_000) *
            (src === "Ngân sách" ? 1 : src === "Học phí" ? 0.4 : 0.6) *
            CATEGORY_RATIO[cat],
          packageId: _pidx % 3 === 0 ? "PKG-ADV" : _pidx % 2 === 0 ? "PKG-BAS" : "PKG-MIN",
        });
        _pidx++;
      }
    }
  }
}

/* ================================================================ */
/*  SCHOOL PROCUREMENT ENTRIES                                       */
/* ================================================================ */

const TIER_BASE: Record<string, number> = {
  "Mầm non":   480_000_000,
  "Tiểu học": 1_350_000_000,
  "THCS":     1_600_000_000,
  "THPT":     3_200_000_000,
  "THPT Nghề":1_800_000_000,
};

export const schoolProcurementEntries: ProcurementEntry[] = [];
let _sidx = 1;
for (const school of tenantsByType.school) {
  const tier = (school as { gradeLevels?: string[] }).gradeLevels?.[0] ?? "THCS";
  const tierBase = TIER_BASE[tier] ?? 1_000_000_000;
  for (const year of [2024, 2025, 2026]) {
    for (const src of FUNDING_SOURCES) {
      const multiplier = 0.7 + (_sidx % 6) * 0.1;
      const srcRatio = src === "Ngân sách" ? 1 : src === "Học phí" ? 0.4 : 0.3;
      const yoyFactor = year === 2024 ? 0.9 : year === 2025 ? 0.95 : 1;
      const cat = pickCategory(_sidx);
      schoolProcurementEntries.push({
        id: `SPR-${String(_sidx).padStart(5, "0")}`,
        year,
        province: (school as { province?: string }).province ?? "Hà Nội",
        district: (school as { district?: string }).district,
        schoolTier: tier as ProcurementEntry["schoolTier"],
        fundingSource: src,
        costCategory: cat,
        amountVND: Math.round(tierBase * multiplier * srcRatio * yoyFactor * CATEGORY_RATIO[cat]),
        packageId: _sidx % 3 === 0 ? "PKG-ADV" : _sidx % 2 === 0 ? "PKG-BAS" : "PKG-MIN",
        schoolId: school.id,
        schoolName: school.name,
      });
      _sidx++;
    }
  }
}

/* ================================================================ */
/*  AUTHORITY REPORTS — Cấp Bộ                                      */
/* ================================================================ */

export const authorityReports: AuthorityReport[] = [
  {
    id: "RPT-0001",
    name: "Báo cáo triển khai STEM toàn quốc — Q1/2026",
    templateCode: "BC-STEM-Q",
    generatedAt: new Date(Date.now() - 14 * 86400_000).toISOString(),
    scope: "national",
    period: "Q1/2026",
    fileUrl: "/reports/BC-STEM-Q1-2026.pdf",
    generatedBy: "U-AUT-03",
  },
  {
    id: "RPT-0002",
    name: "Tổng hợp TT38/2023 — Thiết bị dạy học 63 tỉnh",
    templateCode: "TT38-2023",
    generatedAt: new Date(Date.now() - 28 * 86400_000).toISOString(),
    scope: "national",
    period: "Năm học 2025-2026",
    fileUrl: "/reports/TT38-2023-toan-quoc.pdf",
    generatedBy: "U-AUT-03",
  },
  {
    id: "RPT-0003",
    name: "Công văn 1014 — Tổng hợp kế hoạch STEM các Sở",
    templateCode: "CV1014",
    generatedAt: new Date(Date.now() - 35 * 86400_000).toISOString(),
    scope: "national",
    period: "Q4/2025",
    fileUrl: "/reports/CV1014-tong-hop.pdf",
    generatedBy: "U-AUT-01",
  },
  {
    id: "RPT-0004",
    name: "Phân tích hiệu quả STEM — Top 10 tỉnh dẫn đầu",
    templateCode: "BC-ANALYTICS",
    generatedAt: new Date(Date.now() - 45 * 86400_000).toISOString(),
    scope: "national",
    period: "Q4/2025",
    fileUrl: "/reports/BC-ANALYTICS-top10.pdf",
    generatedBy: "U-AUT-03",
  },
  {
    id: "RPT-0005",
    name: "Báo cáo ngân sách đầu tư thiết bị STEM — 2025",
    templateCode: "BC-NGAN-SACH",
    generatedAt: new Date(Date.now() - 60 * 86400_000).toISOString(),
    scope: "national",
    period: "Năm 2025",
    fileUrl: "/reports/BC-ngansach-2025.pdf",
    generatedBy: "U-AUT-01",
  },
];

/* ================================================================ */
/*  SO REPORTS — Cấp Sở                                             */
/* ================================================================ */

export const soReports: AuthorityReport[] = [
  {
    id: "SO-RPT-001",
    name: "Báo cáo STEM Q1/2026 — Sở GD&ĐT Hà Nội",
    templateCode: "BC-STEM-Q",
    generatedAt: new Date(Date.now() - 7 * 86400_000).toISOString(),
    scope: "province",
    period: "Q1/2026",
    fileUrl: "/reports/HN-STEM-Q1-2026.pdf",
    generatedBy: "U-AUT-02",
  },
  {
    id: "SO-RPT-002",
    name: "TT38/2023 — Kiểm kê thiết bị 30 quận/huyện Hà Nội",
    templateCode: "TT38-2023",
    generatedAt: new Date(Date.now() - 21 * 86400_000).toISOString(),
    scope: "province",
    period: "Năm học 2025-2026",
    fileUrl: "/reports/HN-TT38-2025-2026.pdf",
    generatedBy: "U-AUT-02",
  },
  {
    id: "SO-RPT-003",
    name: "Kế hoạch triển khai STEM — Báo cáo CV1014 Hà Nội",
    templateCode: "CV1014",
    generatedAt: new Date(Date.now() - 30 * 86400_000).toISOString(),
    scope: "province",
    period: "Q4/2025",
    fileUrl: "/reports/HN-CV1014-Q4-2025.pdf",
    generatedBy: "U-AUT-02",
  },
  {
    id: "SO-RPT-004",
    name: "Hiệu suất STEM theo quận/huyện — Hà Nội Q4/2025",
    templateCode: "BC-QUAN-HUYEN",
    generatedAt: new Date(Date.now() - 42 * 86400_000).toISOString(),
    scope: "district",
    period: "Q4/2025",
    fileUrl: "/reports/HN-district-STEM-Q4-2025.pdf",
    generatedBy: "U-AUT-02",
  },
  {
    id: "SO-RPT-005",
    name: "Danh sách trường chưa đạt TT38 — cần can thiệp",
    templateCode: "BC-CAN-THIEP",
    generatedAt: new Date(Date.now() - 55 * 86400_000).toISOString(),
    scope: "district",
    period: "Năm học 2025-2026",
    fileUrl: "/reports/HN-truong-chua-dat-TT38.pdf",
    generatedBy: "U-AUT-02",
  },
];

/* ================================================================ */
/*  CATALOGS                                                         */
/* ================================================================ */

export const catalogs: CatalogItem[] = [
  { id:"CAT-SUB-1",  catalog:"subject", code:"SUB-1",  name:"Toán" },
  { id:"CAT-SUB-2",  catalog:"subject", code:"SUB-2",  name:"Ngữ văn" },
  { id:"CAT-SUB-3",  catalog:"subject", code:"SUB-3",  name:"Tiếng Anh" },
  { id:"CAT-SUB-4",  catalog:"subject", code:"SUB-4",  name:"Lý" },
  { id:"CAT-SUB-5",  catalog:"subject", code:"SUB-5",  name:"Hóa" },
  { id:"CAT-SUB-6",  catalog:"subject", code:"SUB-6",  name:"Sinh" },
  { id:"CAT-SUB-7",  catalog:"subject", code:"SUB-7",  name:"Tin học" },
  { id:"CAT-SUB-8",  catalog:"subject", code:"SUB-8",  name:"Công nghệ" },
  { id:"CAT-GRA-1",  catalog:"grade",   code:"GRA-1",  name:"Mầm non" },
  { id:"CAT-GRA-2",  catalog:"grade",   code:"GRA-2",  name:"Tiểu học 1" },
  { id:"CAT-GRA-3",  catalog:"grade",   code:"GRA-3",  name:"THCS 6" },
  { id:"CAT-GRA-4",  catalog:"grade",   code:"GRA-4",  name:"THCS 7" },
  { id:"CAT-GRA-5",  catalog:"grade",   code:"GRA-5",  name:"THCS 8" },
  { id:"CAT-GRA-6",  catalog:"grade",   code:"GRA-6",  name:"THCS 9" },
  { id:"CAT-GRA-7",  catalog:"grade",   code:"GRA-7",  name:"THPT 10" },
  { id:"CAT-GRA-8",  catalog:"grade",   code:"GRA-8",  name:"THPT 11" },
  { id:"CAT-GRA-9",  catalog:"grade",   code:"GRA-9",  name:"THPT 12" },
  { id:"CAT-SG-1",   catalog:"subjectGroup", code:"SG-STEM",  name:"STEM" },
  { id:"CAT-SG-2",   catalog:"subjectGroup", code:"SG-SOC",   name:"Xã hội" },
  { id:"CAT-SG-3",   catalog:"subjectGroup", code:"SG-LANG",  name:"Ngoại ngữ" },
  { id:"CAT-SKILL-1",catalog:"skill",   code:"SK-CREA", name:"Sáng tạo" },
  { id:"CAT-SKILL-2",catalog:"skill",   code:"SK-CRIT", name:"Tư duy phản biện" },
  { id:"CAT-SKILL-3",catalog:"skill",   code:"SK-COLL", name:"Hợp tác" },
  { id:"CAT-SKILL-4",catalog:"skill",   code:"SK-COMM", name:"Giao tiếp" },
  { id:"CAT-SKILL-5",catalog:"skill",   code:"SK-PROB", name:"Giải quyết vấn đề" },
];

/* ================================================================ */
/*  DATA SYNC RECORDS                                                */
/* ================================================================ */

const _SOURCES = ["NEdu", "VNeID", "ERP", "CRM"] as const;
const _ENTITIES = [
  "students", "teachers", "schools", "equipment",
  "licenses", "orders", "exam-results", "procurement",
];
const _STATUSES: DataSyncRecord["status"][] = ["queued", "running", "done", "error"];

export const dataSyncRecords: DataSyncRecord[] = Array.from({ length: 20 }, (_, i) => {
  const source = _SOURCES[i % _SOURCES.length];
  const status = _STATUSES[i % _STATUSES.length];
  const startedAt = new Date(Date.now() - (20 - i) * 3600_000).toISOString();
  const finishedAt = status === "done" || status === "error"
    ? new Date(Date.parse(startedAt) + 15 * 60_000).toISOString()
    : undefined;
  return {
    id: `DSR-${String(i + 1).padStart(4, "0")}`,
    source,
    direction: i % 2 === 0 ? "out" : "in",
    entity: _ENTITIES[i % _ENTITIES.length],
    count: 100 + (i * 37) % 9000,
    startedAt,
    finishedAt,
    status,
    quality4D: {
      dung: status !== "error",
      du: status === "done",
      sach: status === "done" && i % 4 !== 0,
      song: status === "running" || status === "done",
    },
    note: status === "error" ? "Trùng khóa định danh VNeID" : undefined,
  };
});

/* ================================================================ */
/*  SCHEDULE ENTRIES                                                 */
/* ================================================================ */

const _PROGRAMS: StemProgram[] = ["CT1", "CT2", "CT3", "CT4", "CT5"];
const _SCHED_SUBJECTS = ["Toán", "Lý", "Hóa", "Sinh", "Tin học", "Công nghệ", "Robotic", "AI"];

const _CLASSES_PER_SCHOOL = [
  { id: "C1", name: "Lớp 6A" },
  { id: "C2", name: "Lớp 7A" },
  { id: "C3", name: "Lớp 8A" },
  { id: "C4", name: "Lớp 9A" },
];

const _ROOMS = [
  { id: "R-STEM-1", name: "Phòng STEM 1" },
  { id: "R-STEM-2", name: "Phòng STEM 2" },
];

export const scheduleEntries: STEMScheduleEntry[] = [];
let _schIdx = 1;
for (const school of tenantsByType.school) {
  for (const cls of _CLASSES_PER_SCHOOL) {
    for (let weekday = 1; weekday <= 5; weekday++) {
      if ((_schIdx + weekday) % 3 === 0) continue;
      const program = _PROGRAMS[_schIdx % _PROGRAMS.length];
      scheduleEntries.push({
        id: `SCH-${String(_schIdx).padStart(5, "0")}`,
        schoolId: school.id,
        classId: `${school.id}-${cls.id}`,
        className: cls.name,
        teacherId: `U-TCH-${String((_schIdx % 10) + 1).padStart(2, "0")}`,
        teacherName: `GV STEM ${(_schIdx % 10) + 1}`,
        programCode: program,
        subject: _SCHED_SUBJECTS[_schIdx % _SCHED_SUBJECTS.length],
        roomId: _ROOMS[_schIdx % 2].id,
        roomName: _ROOMS[_schIdx % 2].name,
        weekday,
        period: (_schIdx % 6) + 1,
        dateFrom: "2026-03-01T00:00:00Z",
        dateTo: "2026-06-30T00:00:00Z",
        isClub: _schIdx % 11 === 0,
      });
      _schIdx++;
    }
  }
}

/* ================================================================ */
/*  MOCK EXAM RESULTS, gradeLabel, fmt                               */
/* ================================================================ */

export const MOCK_RESULTS: StudentResult[] = [
  /* Toán STEM · Khối 7 */
  { id:"r01", studentName:"Nguyễn Văn An",   className:"7A1", subject:"Toán STEM", examType:"KT 15 phút",     chapterName:"Chương 1: Số nguyên",         setLabel:"Bộ đề 1", score:9.0, correctCount:9,  totalCount:10, submittedAt:"2026-01-15T08:20:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r02", studentName:"Trần Thị Bình",   className:"7A1", subject:"Toán STEM", examType:"KT 15 phút",     chapterName:"Chương 1: Số nguyên",         setLabel:"Bộ đề 1", score:7.0, correctCount:7,  totalCount:10, submittedAt:"2026-01-15T08:22:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r03", studentName:"Lê Hoàng Cường",  className:"7A1", subject:"Toán STEM", examType:"KT 15 phút",     chapterName:"Chương 1: Số nguyên",         setLabel:"Bộ đề 1", score:6.0, correctCount:6,  totalCount:10, submittedAt:"2026-01-15T08:24:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r04", studentName:"Phạm Minh Đức",   className:"7A2", subject:"Toán STEM", examType:"KT 15 phút",     chapterName:"Chương 1: Số nguyên",         setLabel:"Bộ đề 1", score:8.0, correctCount:8,  totalCount:10, submittedAt:"2026-01-15T09:10:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r05", studentName:"Hoàng Thị Hà",    className:"7A2", subject:"Toán STEM", examType:"KT 15 phút",     chapterName:"Chương 1: Số nguyên",         setLabel:"Bộ đề 1", score:5.0, correctCount:5,  totalCount:10, submittedAt:"2026-01-15T09:12:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r06", studentName:"Nguyễn Văn An",   className:"7A1", subject:"Toán STEM", examType:"KT cuối chương", chapterName:"Chương 2: Hình học phẳng",    setLabel:"Bộ đề 1", score:8.5, correctCount:17, totalCount:20, submittedAt:"2026-03-10T08:32:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r07", studentName:"Trần Thị Bình",   className:"7A1", subject:"Toán STEM", examType:"KT cuối chương", chapterName:"Chương 2: Hình học phẳng",    setLabel:"Bộ đề 1", score:7.0, correctCount:14, totalCount:20, submittedAt:"2026-03-10T08:38:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r08", studentName:"Lê Hoàng Cường",  className:"7A1", subject:"Toán STEM", examType:"KT cuối chương", chapterName:"Chương 2: Hình học phẳng",    setLabel:"Bộ đề 1", score:9.0, correctCount:18, totalCount:20, submittedAt:"2026-03-10T08:41:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r09", studentName:"Phạm Minh Đức",   className:"7A2", subject:"Toán STEM", examType:"KT cuối chương", chapterName:"Chương 2: Hình học phẳng",    setLabel:"Bộ đề 2", score:5.5, correctCount:11, totalCount:20, submittedAt:"2026-03-10T09:10:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r10", studentName:"Hoàng Thị Hà",    className:"7A2", subject:"Toán STEM", examType:"KT cuối chương", chapterName:"Chương 2: Hình học phẳng",    setLabel:"Bộ đề 2", score:4.0, correctCount:8,  totalCount:20, submittedAt:"2026-03-10T09:15:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r11", studentName:"Nguyễn Văn An",   className:"7A1", subject:"Toán STEM", examType:"KT cuối kỳ",     chapterName:"",                            setLabel:"Bộ đề 1", score:8.0, correctCount:32, totalCount:40, submittedAt:"2026-05-05T08:00:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r12", studentName:"Trần Thị Bình",   className:"7A1", subject:"Toán STEM", examType:"KT cuối kỳ",     chapterName:"",                            setLabel:"Bộ đề 1", score:6.5, correctCount:26, totalCount:40, submittedAt:"2026-05-05T08:05:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r13", studentName:"Lê Hoàng Cường",  className:"7A1", subject:"Toán STEM", examType:"KT cuối kỳ",     chapterName:"",                            setLabel:"Bộ đề 1", score:9.5, correctCount:38, totalCount:40, submittedAt:"2026-05-05T08:10:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r14", studentName:"Phạm Minh Đức",   className:"7A2", subject:"Toán STEM", examType:"KT cuối kỳ",     chapterName:"",                            setLabel:"Bộ đề 1", score:5.0, correctCount:20, totalCount:40, submittedAt:"2026-05-05T09:00:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r15", studentName:"Hoàng Thị Hà",    className:"7A2", subject:"Toán STEM", examType:"KT cuối kỳ",     chapterName:"",                            setLabel:"Bộ đề 1", score:7.5, correctCount:30, totalCount:40, submittedAt:"2026-05-05T09:05:00Z", teacherName:"Phạm Anh Tuấn" },
  /* Khoa học Tự nhiên STEM · Khối 6 */
  { id:"r16", studentName:"Trần Văn Mạnh",   className:"6A1", subject:"Khoa học Tự nhiên STEM", examType:"KT cuối chương", chapterName:"Chương 1: Axit – Bazơ – Muối", setLabel:"Bộ đề 1", score:8.0, correctCount:16, totalCount:20, submittedAt:"2026-03-12T08:30:00Z", teacherName:"Nguyễn Thị Lan" },
  { id:"r17", studentName:"Lê Ngọc Nhi",     className:"6A1", subject:"Khoa học Tự nhiên STEM", examType:"KT cuối chương", chapterName:"Chương 1: Axit – Bazơ – Muối", setLabel:"Bộ đề 1", score:9.5, correctCount:19, totalCount:20, submittedAt:"2026-03-12T08:35:00Z", teacherName:"Nguyễn Thị Lan" },
  { id:"r18", studentName:"Phạm Quang Ổn",   className:"6A1", subject:"Khoa học Tự nhiên STEM", examType:"KT cuối chương", chapterName:"Chương 1: Axit – Bazơ – Muối", setLabel:"Bộ đề 1", score:6.5, correctCount:13, totalCount:20, submittedAt:"2026-03-12T08:42:00Z", teacherName:"Nguyễn Thị Lan" },
  { id:"r19", studentName:"Hoàng Bảo Phúc",  className:"6A2", subject:"Khoa học Tự nhiên STEM", examType:"KT cuối chương", chapterName:"Chương 1: Axit – Bazơ – Muối", setLabel:"Bộ đề 2", score:7.0, correctCount:14, totalCount:20, submittedAt:"2026-03-12T09:05:00Z", teacherName:"Nguyễn Thị Lan" },
  { id:"r20", studentName:"Vũ Minh Quân",    className:"6A2", subject:"Khoa học Tự nhiên STEM", examType:"KT cuối chương", chapterName:"Chương 1: Axit – Bazơ – Muối", setLabel:"Bộ đề 2", score:5.0, correctCount:10, totalCount:20, submittedAt:"2026-03-12T09:12:00Z", teacherName:"Nguyễn Thị Lan" },
  { id:"r21", studentName:"Trần Văn Mạnh",   className:"6A1", subject:"Khoa học Tự nhiên STEM", examType:"KT cuối kỳ", chapterName:"", setLabel:"Bộ đề 1", score:8.5, correctCount:34, totalCount:40, submittedAt:"2026-05-06T08:00:00Z", teacherName:"Nguyễn Thị Lan" },
  { id:"r22", studentName:"Lê Ngọc Nhi",     className:"6A1", subject:"Khoa học Tự nhiên STEM", examType:"KT cuối kỳ", chapterName:"", setLabel:"Bộ đề 1", score:9.0, correctCount:36, totalCount:40, submittedAt:"2026-05-06T08:05:00Z", teacherName:"Nguyễn Thị Lan" },
  { id:"r23", studentName:"Hoàng Bảo Phúc",  className:"6A2", subject:"Khoa học Tự nhiên STEM", examType:"KT cuối kỳ", chapterName:"", setLabel:"Bộ đề 1", score:6.0, correctCount:24, totalCount:40, submittedAt:"2026-05-06T09:00:00Z", teacherName:"Nguyễn Thị Lan" },
  /* Lý STEM · Khối 8 */
  { id:"r24", studentName:"Trần Minh Zên",   className:"8A1", subject:"Lý STEM", examType:"KT 15 phút",     chapterName:"Chương 1: Chuyển động cơ học", setLabel:"Bộ đề 1", score:8.0, correctCount:8,  totalCount:10, submittedAt:"2026-03-18T08:20:00Z", teacherName:"Lê Minh Trang" },
  { id:"r25", studentName:"Lê Thị Ánh",      className:"8A1", subject:"Lý STEM", examType:"KT 15 phút",     chapterName:"Chương 1: Chuyển động cơ học", setLabel:"Bộ đề 1", score:6.0, correctCount:6,  totalCount:10, submittedAt:"2026-03-18T08:22:00Z", teacherName:"Lê Minh Trang" },
  { id:"r26", studentName:"Phạm Đức Bảo",    className:"8A1", subject:"Lý STEM", examType:"KT 15 phút",     chapterName:"Chương 1: Chuyển động cơ học", setLabel:"Bộ đề 1", score:9.0, correctCount:9,  totalCount:10, submittedAt:"2026-03-18T08:25:00Z", teacherName:"Lê Minh Trang" },
  { id:"r27", studentName:"Hoàng Thị Cẩm",   className:"8A2", subject:"Lý STEM", examType:"KT 15 phút",     chapterName:"Chương 1: Chuyển động cơ học", setLabel:"Bộ đề 1", score:5.0, correctCount:5,  totalCount:10, submittedAt:"2026-03-18T09:00:00Z", teacherName:"Lê Minh Trang" },
  { id:"r28", studentName:"Vũ Ngọc Dương",   className:"8A2", subject:"Lý STEM", examType:"KT 15 phút",     chapterName:"Chương 1: Chuyển động cơ học", setLabel:"Bộ đề 1", score:7.0, correctCount:7,  totalCount:10, submittedAt:"2026-03-18T09:05:00Z", teacherName:"Lê Minh Trang" },
  /* Hóa STEM · Khối 9 */
  { id:"r29", studentName:"Trần Anh Sơn",    className:"9A1", subject:"Hóa STEM", examType:"KT cuối chương", chapterName:"Chương 1: Axit – Bazơ – Muối", setLabel:"Bộ đề 1", score:7.5, correctCount:15, totalCount:20, submittedAt:"2026-03-15T08:30:00Z", teacherName:"Vũ Thanh Hương" },
  { id:"r30", studentName:"Lê Bích Thủy",    className:"9A1", subject:"Hóa STEM", examType:"KT cuối chương", chapterName:"Chương 1: Axit – Bazơ – Muối", setLabel:"Bộ đề 1", score:6.0, correctCount:12, totalCount:20, submittedAt:"2026-03-15T08:38:00Z", teacherName:"Vũ Thanh Hương" },
  { id:"r31", studentName:"Phạm Văn Ước",    className:"9A1", subject:"Hóa STEM", examType:"KT cuối chương", chapterName:"Chương 1: Axit – Bazơ – Muối", setLabel:"Bộ đề 1", score:4.5, correctCount:9,  totalCount:20, submittedAt:"2026-03-15T08:45:00Z", teacherName:"Vũ Thanh Hương" },
  { id:"r32", studentName:"Hoàng Ngọc Việt", className:"9A2", subject:"Hóa STEM", examType:"KT cuối chương", chapterName:"Chương 1: Axit – Bazơ – Muối", setLabel:"Bộ đề 1", score:9.0, correctCount:18, totalCount:20, submittedAt:"2026-03-15T09:10:00Z", teacherName:"Vũ Thanh Hương" },
  { id:"r33", studentName:"Đỗ Phương Vy",    className:"9A2", subject:"Hóa STEM", examType:"KT cuối chương", chapterName:"Chương 1: Axit – Bazơ – Muối", setLabel:"Bộ đề 1", score:8.0, correctCount:16, totalCount:20, submittedAt:"2026-03-15T09:15:00Z", teacherName:"Vũ Thanh Hương" },
  /* Toán STEM · Khối 7 — KT giữa kỳ */
  { id:"r34", studentName:"Nguyễn Văn An",   className:"7A1", subject:"Toán STEM", examType:"KT giữa kỳ", chapterName:"", setLabel:"Bộ đề 1", score:8.5, correctCount:17, totalCount:20, submittedAt:"2026-02-20T08:10:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r35", studentName:"Trần Thị Bình",   className:"7A1", subject:"Toán STEM", examType:"KT giữa kỳ", chapterName:"", setLabel:"Bộ đề 1", score:7.0, correctCount:14, totalCount:20, submittedAt:"2026-02-20T08:15:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r36", studentName:"Phạm Minh Đức",   className:"7A2", subject:"Toán STEM", examType:"KT giữa kỳ", chapterName:"", setLabel:"Bộ đề 1", score:5.5, correctCount:11, totalCount:20, submittedAt:"2026-02-20T09:05:00Z", teacherName:"Phạm Anh Tuấn" },
  { id:"r37", studentName:"Hoàng Thị Hà",    className:"7A2", subject:"Toán STEM", examType:"KT giữa kỳ", chapterName:"", setLabel:"Bộ đề 1", score:9.0, correctCount:18, totalCount:20, submittedAt:"2026-02-20T09:10:00Z", teacherName:"Phạm Anh Tuấn" },
  /* Khoa học Tự nhiên STEM · Khối 6 — KT học kỳ 1 */
  { id:"r38", studentName:"Trần Văn Mạnh",   className:"6A1", subject:"Khoa học Tự nhiên STEM", examType:"KT học kỳ 1", chapterName:"", setLabel:"Bộ đề 1", score:8.0, correctCount:32, totalCount:40, submittedAt:"2026-01-10T08:00:00Z", teacherName:"Nguyễn Thị Lan" },
  { id:"r39", studentName:"Lê Ngọc Nhi",     className:"6A1", subject:"Khoa học Tự nhiên STEM", examType:"KT học kỳ 1", chapterName:"", setLabel:"Bộ đề 1", score:9.0, correctCount:36, totalCount:40, submittedAt:"2026-01-10T08:06:00Z", teacherName:"Nguyễn Thị Lan" },
  { id:"r40", studentName:"Hoàng Bảo Phúc",  className:"6A2", subject:"Khoa học Tự nhiên STEM", examType:"KT học kỳ 1", chapterName:"", setLabel:"Bộ đề 1", score:6.5, correctCount:26, totalCount:40, submittedAt:"2026-01-10T09:00:00Z", teacherName:"Nguyễn Thị Lan" },
  /* Lý STEM · Khối 8 — KT học kỳ 2 */
  { id:"r41", studentName:"Trần Minh Zên",   className:"8A1", subject:"Lý STEM", examType:"KT học kỳ 2", chapterName:"", setLabel:"Bộ đề 1", score:7.5, correctCount:30, totalCount:40, submittedAt:"2026-05-10T08:00:00Z", teacherName:"Lê Minh Trang" },
  { id:"r42", studentName:"Lê Thị Ánh",      className:"8A1", subject:"Lý STEM", examType:"KT học kỳ 2", chapterName:"", setLabel:"Bộ đề 1", score:6.0, correctCount:24, totalCount:40, submittedAt:"2026-05-10T08:08:00Z", teacherName:"Lê Minh Trang" },
  { id:"r43", studentName:"Hoàng Thị Cẩm",   className:"8A2", subject:"Lý STEM", examType:"KT học kỳ 2", chapterName:"", setLabel:"Bộ đề 1", score:8.5, correctCount:34, totalCount:40, submittedAt:"2026-05-10T09:00:00Z", teacherName:"Lê Minh Trang" },
];

export function gradeLabel(score: number): { label: string; color: string } {
  if (score >= 8.5) return { label: "Giỏi",       color: "#16a34a" };
  if (score >= 7.0) return { label: "Khá",        color: "#0891b2" };
  if (score >= 5.0) return { label: "Trung bình", color: "#f59e0b" };
  return               { label: "Yếu/Kém",    color: "#e11d48" };
}

export function fmt(iso: string) {
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2,"0")}/${(d.getMonth()+1).toString().padStart(2,"0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}
