// ============================================================
// QUẢN LÝ ĐÀO TẠO BẮT BUỘC — Mock Data & Types
// Geleximco LMS — Compliance Training Tracker
// ============================================================

export type ComplianceStatus = "compliant" | "expiring_soon" | "overdue" | "not_started" | "exempt";
export type ProgramType = "safety" | "legal" | "finance" | "it_security" | "ethics" | "industry";
export type Frequency = "annual" | "biannual" | "quarterly" | "one_time";
export type RiskLevel = "critical" | "high" | "medium" | "low";

export interface ComplianceProgram {
  id: string;
  name: string;
  shortName: string;
  type: ProgramType;
  description: string;
  frequency: Frequency;
  requiredBy: string;          // cơ quan yêu cầu
  penaltyNote: string;         // hậu quả nếu không tuân thủ
  validityMonths: number;      // thời hạn hiệu lực (tháng)
  targetSubsidiaries: string[]; // "all" hoặc danh sách ID
  totalRequired: number;
  totalCompliant: number;
  totalExpiring: number;
  totalOverdue: number;
  riskLevel: RiskLevel;
  nextDeadline: string;
  courseId?: string;
}

export interface SubsidiaryCompliance {
  subsidiaryId: string;
  subsidiaryName: string;
  shortName: string;
  programs: {
    programId: string;
    required: number;
    compliant: number;
    expiring: number;
    overdue: number;
    exempt: number;
    rate: number;              // % tuân thủ
  }[];
  overallRate: number;
}

export interface EmployeeCompliance {
  id: string;
  name: string;
  title: string;
  department: string;
  subsidiary: string;
  programId: string;
  status: ComplianceStatus;
  completedDate?: string;
  expiryDate?: string;
  dueDate: string;
  attempts: number;
  score?: number;
}

// ─── Configs ───

export const COMPLIANCE_STATUS_CONFIG: Record<ComplianceStatus, { label: string; color: string; bg: string; icon: string }> = {
  compliant: { label: "Tuân thủ", color: "#16a34a", bg: "#16a34a12", icon: "✓" },
  expiring_soon: { label: "Sắp hết hạn", color: "#f59e0b", bg: "#f59e0b12", icon: "⏰" },
  overdue: { label: "Quá hạn", color: "#dc2626", bg: "#dc262612", icon: "⚠" },
  not_started: { label: "Chưa học", color: "#64748b", bg: "#64748b12", icon: "○" },
  exempt: { label: "Miễn trừ", color: "#94a3b8", bg: "#94a3b812", icon: "—" },
};

export const PROGRAM_TYPE_CONFIG: Record<ProgramType, { label: string; color: string; icon: string }> = {
  safety: { label: "An toàn Lao động", color: "#dc2626", icon: "🛡️" },
  legal: { label: "Pháp luật & Tuân thủ", color: "#7c3aed", icon: "⚖️" },
  finance: { label: "Tài chính & AML", color: "#2563eb", icon: "💰" },
  it_security: { label: "An ninh Thông tin", color: "#0891b2", icon: "🔒" },
  ethics: { label: "Đạo đức & Ứng xử", color: "#16a34a", icon: "🤝" },
  industry: { label: "Chuyên ngành", color: "#ea580c", icon: "🏗️" },
};

export const FREQUENCY_CONFIG: Record<Frequency, { label: string; color: string }> = {
  annual: { label: "Hàng năm", color: "#2563eb" },
  biannual: { label: "6 tháng/lần", color: "#7c3aed" },
  quarterly: { label: "Hàng quý", color: "#ea580c" },
  one_time: { label: "Một lần", color: "#16a34a" },
};

export const RISK_LEVEL_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  critical: { label: "Rất cao", color: "#dc2626", bg: "#dc262615" },
  high: { label: "Cao", color: "#ea580c", bg: "#ea580c12" },
  medium: { label: "Trung bình", color: "#f59e0b", bg: "#f59e0b12" },
  low: { label: "Thấp", color: "#16a34a", bg: "#16a34a12" },
};

// ─── Mock Programs ───

export const COMPLIANCE_PROGRAMS: ComplianceProgram[] = [
  {
    id: "CP01", name: "An toàn Lao động & Phòng cháy Chữa cháy", shortName: "ATLĐ & PCCC",
    type: "safety", description: "Đào tạo bắt buộc theo Luật ATLĐ 2015 và Luật PCCC. Áp dụng cho toàn bộ nhân viên.",
    frequency: "annual", requiredBy: "Bộ Lao động — Thương binh & Xã hội",
    penaltyNote: "Phạt 20-40 triệu/lần vi phạm; Đình chỉ hoạt động nếu tái phạm",
    validityMonths: 12, targetSubsidiaries: ["all"],
    totalRequired: 6610, totalCompliant: 5420, totalExpiring: 480, totalOverdue: 710,
    riskLevel: "critical", nextDeadline: "31/03/2026",
  },
  {
    id: "CP02", name: "Phòng chống Rửa tiền (AML/CFT)", shortName: "AML/CFT",
    type: "finance", description: "Đào tạo bắt buộc theo Luật Phòng chống Rửa tiền 2022 cho khối Ngân hàng & Chứng khoán.",
    frequency: "annual", requiredBy: "Ngân hàng Nhà nước Việt Nam",
    penaltyNote: "Phạt 100-200 triệu; Thu hồi giấy phép hoạt động",
    validityMonths: 12, targetSubsidiaries: ["S03", "S05"],
    totalRequired: 1560, totalCompliant: 1380, totalExpiring: 120, totalOverdue: 60,
    riskLevel: "critical", nextDeadline: "15/03/2026",
  },
  {
    id: "CP03", name: "Bảo mật Thông tin & An ninh Mạng", shortName: "IT Security",
    type: "it_security", description: "Đào tạo nhận thức an ninh thông tin theo ISO 27001 và Luật An ninh Mạng 2018.",
    frequency: "annual", requiredBy: "Bộ Công an — An ninh Mạng",
    penaltyNote: "Phạt 50-100 triệu; Rủi ro rò rỉ dữ liệu nghiêm trọng",
    validityMonths: 12, targetSubsidiaries: ["all"],
    totalRequired: 6610, totalCompliant: 4890, totalExpiring: 620, totalOverdue: 1100,
    riskLevel: "high", nextDeadline: "30/04/2026",
  },
  {
    id: "CP04", name: "Quy tắc Ứng xử & Đạo đức Doanh nghiệp", shortName: "Code of Conduct",
    type: "ethics", description: "Quy tắc ứng xử Geleximco, chính sách chống tham nhũng, xung đột lợi ích.",
    frequency: "annual", requiredBy: "HĐQT Tập đoàn Geleximco",
    penaltyNote: "Kỷ luật nội bộ; Sa thải nếu vi phạm nghiêm trọng",
    validityMonths: 12, targetSubsidiaries: ["all"],
    totalRequired: 6610, totalCompliant: 5980, totalExpiring: 350, totalOverdue: 280,
    riskLevel: "medium", nextDeadline: "30/06/2026",
  },
  {
    id: "CP05", name: "Luật Lao động & Hợp đồng", shortName: "Luật LĐ",
    type: "legal", description: "Cập nhật Bộ luật Lao động 2019, các nghị định mới về HĐLĐ, BHXH, BHYT.",
    frequency: "annual", requiredBy: "Bộ Lao động — Thương binh & Xã hội",
    penaltyNote: "Phạt 5-20 triệu/trường hợp; Tranh chấp lao động",
    validityMonths: 12, targetSubsidiaries: ["all"],
    totalRequired: 2200, totalCompliant: 1850, totalExpiring: 180, totalOverdue: 170,
    riskLevel: "medium", nextDeadline: "31/05/2026",
  },
  {
    id: "CP06", name: "An toàn Vệ sinh Thực phẩm", shortName: "ATVSTP",
    type: "safety", description: "Đào tạo ATVSTP cho khối Hospitality & Agriculture theo Luật ATTP 2010.",
    frequency: "annual", requiredBy: "Bộ Y tế",
    penaltyNote: "Phạt 10-50 triệu; Đình chỉ hoạt động kinh doanh thực phẩm",
    validityMonths: 12, targetSubsidiaries: ["S08", "S09"],
    totalRequired: 930, totalCompliant: 780, totalExpiring: 85, totalOverdue: 65,
    riskLevel: "high", nextDeadline: "28/02/2026",
  },
  {
    id: "CP07", name: "Giấy phép Hành nghề Xây dựng", shortName: "GP Xây dựng",
    type: "industry", description: "Đào tạo & cập nhật chứng chỉ hành nghề xây dựng theo Luật Xây dựng 2014.",
    frequency: "biannual", requiredBy: "Bộ Xây dựng",
    penaltyNote: "Phạt 30-100 triệu; Không được ký HĐ xây dựng",
    validityMonths: 24, targetSubsidiaries: ["S04"],
    totalRequired: 890, totalCompliant: 720, totalExpiring: 95, totalOverdue: 75,
    riskLevel: "high", nextDeadline: "30/04/2026",
  },
  {
    id: "CP08", name: "Bảo vệ Dữ liệu Cá nhân (PDPA)", shortName: "PDPA",
    type: "legal", description: "Đào tạo theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.",
    frequency: "annual", requiredBy: "Bộ Công an",
    penaltyNote: "Phạt 50-100 triệu; Trách nhiệm hình sự nếu rò rỉ dữ liệu",
    validityMonths: 12, targetSubsidiaries: ["all"],
    totalRequired: 6610, totalCompliant: 3200, totalExpiring: 410, totalOverdue: 3000,
    riskLevel: "critical", nextDeadline: "30/06/2026",
  },
  {
    id: "CP09", name: "An toàn Khai thác Mỏ", shortName: "AT Mỏ",
    type: "safety", description: "Đào tạo an toàn khai thác mỏ theo Luật Khoáng sản 2010.",
    frequency: "annual", requiredBy: "Bộ Công Thương",
    penaltyNote: "Phạt 50-200 triệu; Thu hồi giấy phép khai thác",
    validityMonths: 12, targetSubsidiaries: ["S06"],
    totalRequired: 450, totalCompliant: 380, totalExpiring: 35, totalOverdue: 35,
    riskLevel: "high", nextDeadline: "31/03/2026",
  },
  {
    id: "CP10", name: "Đào tạo ESG & Phát triển Bền vững", shortName: "ESG",
    type: "ethics", description: "Nhận thức ESG, báo cáo bền vững, giảm phát thải carbon — yêu cầu từ đối tác quốc tế.",
    frequency: "annual", requiredBy: "Ban ESG Tập đoàn",
    penaltyNote: "Mất điểm ESG rating; Ảnh hưởng đến huy động vốn quốc tế",
    validityMonths: 12, targetSubsidiaries: ["all"],
    totalRequired: 6610, totalCompliant: 2100, totalExpiring: 200, totalOverdue: 4310,
    riskLevel: "medium", nextDeadline: "30/09/2026",
  },
];

// ─── Subsidiary Compliance Matrix ───

const SUBSIDIARIES = [
  { id: "S01", name: "VP Tập đoàn Geleximco", shortName: "VP Tập đoàn" },
  { id: "S02", name: "BĐS Geleximco Land", shortName: "Geleximco Land" },
  { id: "S03", name: "Ngân hàng ABBank", shortName: "ABBank" },
  { id: "S04", name: "Geleximco Construction", shortName: "Construction" },
  { id: "S05", name: "Chứng khoán ABS", shortName: "ABS" },
  { id: "S06", name: "Geleximco Mining", shortName: "Mining" },
  { id: "S07", name: "Geleximco Energy", shortName: "Energy" },
  { id: "S08", name: "Geleximco Agriculture", shortName: "Agriculture" },
  { id: "S09", name: "Geleximco Hospitality", shortName: "Hospitality" },
  { id: "S10", name: "Geleximco Education", shortName: "Education" },
  { id: "S11", name: "Geleximco Logistics", shortName: "Logistics" },
  { id: "S12", name: "Geleximco Technology", shortName: "Technology" },
  { id: "S13", name: "Geleximco Insurance", shortName: "Insurance" },
  { id: "S14", name: "Geleximco Healthcare", shortName: "Healthcare" },
];

// Generate compliance matrix
function generateRate(programId: string, subsidiaryId: string): number {
  // Deterministic pseudo-random based on IDs
  const seed = (programId.charCodeAt(2) * 7 + subsidiaryId.charCodeAt(1) * 13) % 100;
  if (seed < 10) return 45 + seed;
  if (seed < 30) return 60 + (seed % 20);
  if (seed < 60) return 75 + (seed % 15);
  return 85 + (seed % 12);
}

export function getComplianceMatrix(): SubsidiaryCompliance[] {
  return SUBSIDIARIES.map(sub => {
    const programs = COMPLIANCE_PROGRAMS
      .filter(p => p.targetSubsidiaries.includes("all") || p.targetSubsidiaries.includes(sub.id))
      .map(p => {
        const rate = generateRate(p.id, sub.id);
        const required = Math.round(p.totalRequired / (p.targetSubsidiaries.includes("all") ? 14 : p.targetSubsidiaries.length));
        const compliant = Math.round(required * rate / 100);
        const overdue = Math.round(required * (100 - rate) / 100 * 0.6);
        const expiring = Math.round(required * (100 - rate) / 100 * 0.3);
        return {
          programId: p.id,
          required,
          compliant,
          expiring,
          overdue,
          exempt: required - compliant - overdue - expiring,
          rate,
        };
      });

    const overallRate = programs.length > 0
      ? Math.round(programs.reduce((s, p) => s + p.rate, 0) / programs.length)
      : 0;

    return {
      subsidiaryId: sub.id,
      subsidiaryName: sub.name,
      shortName: sub.shortName,
      programs,
      overallRate,
    };
  });
}

// ─── Mock Employee Compliance Data ───

export function getEmployeeCompliance(programId: string): EmployeeCompliance[] {
  const names = [
    "Nguyễn Văn An", "Trần Thị Bình", "Lê Minh Cường", "Phạm Thị Dung", "Hoàng Đức Em",
    "Vũ Thị Phương", "Đỗ Quốc Gia", "Bùi Thị Hà", "Ngô Trung Kiên", "Dương Thị Lan",
    "Lý Văn Minh", "Tạ Thị Ngọc", "Hồ Đình Phú", "Mai Thị Quỳnh", "Đinh Xuân Sơn",
    "Trịnh Thị Tâm", "Chu Văn Uy", "Phan Thị Vân", "Đặng Anh Vũ", "Lương Thị Yến",
  ];
  const depts = ["Phòng Kinh doanh", "Phòng Kỹ thuật", "Phòng Nhân sự", "Phòng Tài chính", "Phòng Marketing", "Phòng IT", "Phòng Pháp chế"];
  const subs = ["VP Tập đoàn", "Geleximco Land", "ABBank", "Construction", "ABS", "Mining"];
  const statuses: ComplianceStatus[] = ["compliant", "compliant", "compliant", "expiring_soon", "overdue", "not_started", "compliant", "compliant", "expiring_soon", "compliant",
    "compliant", "overdue", "compliant", "not_started", "compliant", "compliant", "expiring_soon", "compliant", "overdue", "compliant"];

  return names.map((name, i) => ({
    id: `EMP${(i + 1).toString().padStart(3, "0")}`,
    name,
    title: ["Chuyên viên", "Trưởng phòng", "Nhân viên", "Phó phòng", "Giám sát viên"][i % 5],
    department: depts[i % depts.length],
    subsidiary: subs[i % subs.length],
    programId,
    status: statuses[i],
    completedDate: statuses[i] === "compliant" ? `${(10 + (i % 20)).toString().padStart(2, "0")}/0${1 + (i % 3)}/2026` : undefined,
    expiryDate: statuses[i] === "compliant" ? `${(10 + (i % 20)).toString().padStart(2, "0")}/0${1 + (i % 3)}/2027` : statuses[i] === "expiring_soon" ? `${(15 + (i % 15)).toString().padStart(2, "0")}/03/2026` : undefined,
    dueDate: `${(15 + (i % 15)).toString().padStart(2, "0")}/03/2026`,
    attempts: statuses[i] === "compliant" ? 1 + (i % 2) : statuses[i] === "overdue" ? 2 : 0,
    score: statuses[i] === "compliant" ? 75 + (i % 25) : undefined,
  }));
}

// ─── Helpers ───

export function getComplianceStats() {
  const totalRequired = COMPLIANCE_PROGRAMS.reduce((s, p) => s + p.totalRequired, 0);
  const totalCompliant = COMPLIANCE_PROGRAMS.reduce((s, p) => s + p.totalCompliant, 0);
  const totalOverdue = COMPLIANCE_PROGRAMS.reduce((s, p) => s + p.totalOverdue, 0);
  const totalExpiring = COMPLIANCE_PROGRAMS.reduce((s, p) => s + p.totalExpiring, 0);
  const overallRate = Math.round((totalCompliant / totalRequired) * 100);
  const criticalPrograms = COMPLIANCE_PROGRAMS.filter(p => p.riskLevel === "critical").length;
  return { totalRequired, totalCompliant, totalOverdue, totalExpiring, overallRate, criticalPrograms };
}
