// ============================================================
// QUẢN LÝ NGÂN SÁCH ĐÀO TẠO — Mock Data & Types
// Geleximco LMS — Training Budget Management
// ============================================================

export interface SubsidiaryBudget {
  id: string;
  subsidiaryName: string;
  shortName: string;
  allocated: number;        // VNĐ
  spent: number;
  committed: number;        // đã cam kết nhưng chưa chi
  employeeCount: number;
  courseCount: number;
  color: string;
}

export interface DepartmentBudget {
  id: string;
  subsidiaryId: string;
  departmentName: string;
  allocated: number;
  spent: number;
  employeeCount: number;
}

export interface MonthlySpend {
  month: string;
  planned: number;
  actual: number;
}

export interface CostItem {
  id: string;
  category: "internal_trainer" | "external_trainer" | "platform" | "material" | "venue" | "certification" | "travel" | "other";
  label: string;
  amount: number;
  percentage: number;
}

export type RequestStatus = "pending" | "approved" | "rejected" | "revision";
export type RequestPriority = "urgent" | "high" | "normal" | "low";

export interface BudgetRequest {
  id: string;
  title: string;
  requestedBy: string;
  department: string;
  subsidiary: string;
  amount: number;
  justification: string;
  status: RequestStatus;
  priority: RequestPriority;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  courseNames: string[];
  employeeCount: number;
}

// ─── Configs ───

export const COST_CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  internal_trainer: { label: "Giảng viên nội bộ", color: "#990803", icon: "👨‍🏫" },
  external_trainer: { label: "Giảng viên bên ngoài", color: "#c8a84e", icon: "🎓" },
  platform: { label: "Nền tảng & Công nghệ", color: "#2563eb", icon: "💻" },
  material: { label: "Tài liệu & Giáo trình", color: "#16a34a", icon: "📚" },
  venue: { label: "Phòng học & Địa điểm", color: "#7c3aed", icon: "🏢" },
  certification: { label: "Chứng chỉ & Thi cử", color: "#ea580c", icon: "🏆" },
  travel: { label: "Di chuyển & Ăn ở", color: "#0891b2", icon: "✈️" },
  other: { label: "Khác", color: "#64748b", icon: "📦" },
};

export const REQUEST_STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Chờ duyệt", color: "#f59e0b", bg: "#f59e0b12" },
  approved: { label: "Đã duyệt", color: "#16a34a", bg: "#16a34a12" },
  rejected: { label: "Từ chối", color: "#dc2626", bg: "#dc262612" },
  revision: { label: "Cần bổ sung", color: "#7c3aed", bg: "#7c3aed12" },
};

export const REQUEST_PRIORITY_CONFIG: Record<RequestPriority, { label: string; color: string }> = {
  urgent: { label: "Cấp bách", color: "#dc2626" },
  high: { label: "Cao", color: "#ea580c" },
  normal: { label: "Bình thường", color: "#2563eb" },
  low: { label: "Thấp", color: "#64748b" },
};

// ─── Mock Data ───

export const TOTAL_ANNUAL_BUDGET = 48_500_000_000; // 48.5 tỷ VNĐ

export const SUBSIDIARY_BUDGETS: SubsidiaryBudget[] = [
  { id: "S01", subsidiaryName: "VP Tập đoàn Geleximco", shortName: "VP Tập đoàn", allocated: 8_200_000_000, spent: 5_640_000_000, committed: 1_200_000_000, employeeCount: 420, courseCount: 45, color: "#990803" },
  { id: "S02", subsidiaryName: "BĐS Geleximco Land", shortName: "Geleximco Land", allocated: 6_800_000_000, spent: 4_350_000_000, committed: 980_000_000, employeeCount: 680, courseCount: 38, color: "#c8a84e" },
  { id: "S03", subsidiaryName: "Ngân hàng ABBank", shortName: "ABBank", allocated: 7_500_000_000, spent: 5_800_000_000, committed: 850_000_000, employeeCount: 1240, courseCount: 52, color: "#2563eb" },
  { id: "S04", subsidiaryName: "Geleximco Construction", shortName: "Construction", allocated: 4_200_000_000, spent: 2_780_000_000, committed: 650_000_000, employeeCount: 890, courseCount: 28, color: "#16a34a" },
  { id: "S05", subsidiaryName: "Chứng khoán An Bình (ABS)", shortName: "ABS", allocated: 3_800_000_000, spent: 2_450_000_000, committed: 520_000_000, employeeCount: 320, courseCount: 22, color: "#7c3aed" },
  { id: "S06", subsidiaryName: "Geleximco Mining", shortName: "Mining", allocated: 2_900_000_000, spent: 1_820_000_000, committed: 480_000_000, employeeCount: 450, courseCount: 18, color: "#ea580c" },
  { id: "S07", subsidiaryName: "Geleximco Energy", shortName: "Energy", allocated: 3_200_000_000, spent: 2_100_000_000, committed: 380_000_000, employeeCount: 380, courseCount: 20, color: "#0891b2" },
  { id: "S08", subsidiaryName: "Geleximco Agriculture", shortName: "Agriculture", allocated: 2_100_000_000, spent: 1_280_000_000, committed: 320_000_000, employeeCount: 520, courseCount: 15, color: "#65a30d" },
  { id: "S09", subsidiaryName: "Geleximco Hospitality", shortName: "Hospitality", allocated: 2_500_000_000, spent: 1_650_000_000, committed: 280_000_000, employeeCount: 410, courseCount: 19, color: "#d946ef" },
  { id: "S10", subsidiaryName: "Geleximco Education", shortName: "Education", allocated: 1_800_000_000, spent: 1_120_000_000, committed: 250_000_000, employeeCount: 280, courseCount: 24, color: "#f43f5e" },
  { id: "S11", subsidiaryName: "Geleximco Logistics", shortName: "Logistics", allocated: 1_600_000_000, spent: 980_000_000, committed: 220_000_000, employeeCount: 350, courseCount: 12, color: "#06b6d4" },
  { id: "S12", subsidiaryName: "Geleximco Technology", shortName: "Technology", allocated: 1_900_000_000, spent: 1_350_000_000, committed: 180_000_000, employeeCount: 240, courseCount: 26, color: "#8b5cf6" },
  { id: "S13", subsidiaryName: "Geleximco Insurance", shortName: "Insurance", allocated: 1_200_000_000, spent: 720_000_000, committed: 180_000_000, employeeCount: 220, courseCount: 10, color: "#f97316" },
  { id: "S14", subsidiaryName: "Geleximco Healthcare", shortName: "Healthcare", allocated: 800_000_000, spent: 460_000_000, committed: 120_000_000, employeeCount: 210, courseCount: 8, color: "#14b8a6" },
];

export const MONTHLY_SPENDING: MonthlySpend[] = [
  { month: "T1", planned: 3_200_000_000, actual: 2_980_000_000 },
  { month: "T2", planned: 3_500_000_000, actual: 3_650_000_000 },
  { month: "T3", planned: 4_800_000_000, actual: 4_200_000_000 },
  { month: "T4", planned: 4_200_000_000, actual: 0 },
  { month: "T5", planned: 4_500_000_000, actual: 0 },
  { month: "T6", planned: 5_200_000_000, actual: 0 },
  { month: "T7", planned: 3_800_000_000, actual: 0 },
  { month: "T8", planned: 3_200_000_000, actual: 0 },
  { month: "T9", planned: 4_600_000_000, actual: 0 },
  { month: "T10", planned: 5_000_000_000, actual: 0 },
  { month: "T11", planned: 3_500_000_000, actual: 0 },
  { month: "T12", planned: 3_000_000_000, actual: 0 },
];

export const COST_BREAKDOWN: CostItem[] = [
  { id: "CB01", category: "external_trainer", label: "Giảng viên bên ngoài", amount: 12_500_000_000, percentage: 26 },
  { id: "CB02", category: "internal_trainer", label: "Giảng viên nội bộ", amount: 8_200_000_000, percentage: 17 },
  { id: "CB03", category: "platform", label: "Nền tảng & Công nghệ", amount: 7_800_000_000, percentage: 16 },
  { id: "CB04", category: "certification", label: "Chứng chỉ & Thi cử", amount: 6_400_000_000, percentage: 13 },
  { id: "CB05", category: "material", label: "Tài liệu & Giáo trình", amount: 4_600_000_000, percentage: 10 },
  { id: "CB06", category: "venue", label: "Phòng học & Địa điểm", amount: 3_800_000_000, percentage: 8 },
  { id: "CB07", category: "travel", label: "Di chuyển & Ăn ở", amount: 3_200_000_000, percentage: 7 },
  { id: "CB08", category: "other", label: "Khác", amount: 2_000_000_000, percentage: 3 },
];

export const BUDGET_REQUESTS: BudgetRequest[] = [
  {
    id: "BR001", title: "Đào tạo Chuyển đổi số cho 200 quản lý",
    requestedBy: "Nguyễn Văn Hùng", department: "Ban Đào tạo", subsidiary: "VP Tập đoàn Geleximco",
    amount: 1_200_000_000, justification: "Chương trình chuyển đổi số là ưu tiên chiến lược 2026. Cần đào tạo 200 quản lý cấp trung về AI, Data Analytics, Digital Transformation.",
    status: "pending", priority: "urgent", createdAt: "10/03/2026",
    courseNames: ["AI & Machine Learning cho Quản lý", "Data-Driven Decision Making", "Digital Transformation Strategy"],
    employeeCount: 200,
  },
  {
    id: "BR002", title: "Chứng chỉ PMP cho Phòng Dự án",
    requestedBy: "Trần Đức Mạnh", department: "Phòng Dự án", subsidiary: "BĐS Geleximco Land",
    amount: 450_000_000, justification: "15 PM cần chứng chỉ PMP theo yêu cầu đối tác và chuẩn quốc tế. Chi phí bao gồm đào tạo, tài liệu, lệ phí thi.",
    status: "pending", priority: "high", createdAt: "08/03/2026",
    courseNames: ["PMP Exam Preparation", "Project Management Professional"],
    employeeCount: 15,
  },
  {
    id: "BR003", title: "Chương trình HRBP cho Khối Nhân sự",
    requestedBy: "Đỗ Thanh Hương", department: "Phòng Nhân sự", subsidiary: "Ngân hàng ABBank",
    amount: 380_000_000, justification: "Chuyển đổi mô hình HR sang HRBP. Đào tạo 20 chuyên viên HR thành HR Business Partner.",
    status: "approved", priority: "high", createdAt: "01/03/2026", reviewedBy: "Phó TGĐ Nhân sự", reviewedAt: "05/03/2026", reviewNotes: "Phê duyệt. Ưu tiên cho ABBank phase 1, mở rộng sang các đơn vị khác trong Q3.",
    courseNames: ["HRBP Essentials", "Strategic HR Management"],
    employeeCount: 20,
  },
  {
    id: "BR004", title: "An toàn Lao động nâng cao — Geleximco Construction",
    requestedBy: "Lê Quốc Vương", department: "Phòng An toàn", subsidiary: "Geleximco Construction",
    amount: 280_000_000, justification: "Đào tạo bắt buộc theo quy định mới của Bộ LĐTBXH. 120 kỹ sư và giám sát cần cập nhật chứng chỉ ATLĐ.",
    status: "approved", priority: "urgent", createdAt: "25/02/2026", reviewedBy: "TGĐ Construction", reviewedAt: "27/02/2026", reviewNotes: "Phê duyệt ngay — yêu cầu pháp lý bắt buộc.",
    courseNames: ["An toàn Lao động & PCCC nâng cao"],
    employeeCount: 120,
  },
  {
    id: "BR005", title: "Executive Education — Stanford GSB",
    requestedBy: "Phạm Văn Tùng", department: "Ban Giám đốc", subsidiary: "VP Tập đoàn Geleximco",
    amount: 2_800_000_000, justification: "Gửi 5 lãnh đạo cấp cao tham gia chương trình Executive Education tại Stanford GSB. Đầu tư chiến lược cho đội ngũ kế cận.",
    status: "revision", priority: "normal", createdAt: "20/02/2026", reviewedBy: "Chủ tịch HĐQT", reviewedAt: "28/02/2026", reviewNotes: "Cần đánh giá lại ROI và so sánh với các chương trình tương đương trong nước. Đề xuất giảm xuống 3 người phase 1.",
    courseNames: ["Stanford Executive Program"],
    employeeCount: 5,
  },
  {
    id: "BR006", title: "Đào tạo Compliance & AML cho ABBank",
    requestedBy: "Nguyễn Thị Mai", department: "Phòng Tuân thủ", subsidiary: "Ngân hàng ABBank",
    amount: 520_000_000, justification: "Đào tạo bắt buộc hàng năm về phòng chống rửa tiền (AML) và tuân thủ pháp luật cho toàn bộ nhân viên ABBank.",
    status: "rejected", priority: "high", createdAt: "15/02/2026", reviewedBy: "CFO ABBank", reviewedAt: "20/02/2026", reviewNotes: "Ngân sách AML đã được phân bổ trong ngân sách Compliance riêng. Không cần bổ sung từ ngân sách đào tạo.",
    courseNames: ["AML/CFT Compliance", "Regulatory Framework for Banking"],
    employeeCount: 1240,
  },
];

// ─── ROI Data ───

export interface ROIMetric {
  label: string;
  value: string;
  trend: "up" | "down" | "stable";
  trendValue: string;
  color: string;
}

export const ROI_METRICS: ROIMetric[] = [
  { label: "ROI Đào tạo", value: "287%", trend: "up", trendValue: "+23%", color: "#16a34a" },
  { label: "Chi phí/Nhân viên", value: "7.34tr", trend: "down", trendValue: "-8%", color: "#2563eb" },
  { label: "Chi phí/Giờ đào tạo", value: "485k", trend: "down", trendValue: "-12%", color: "#c8a84e" },
  { label: "Tỷ lệ hoàn thành", value: "82%", trend: "up", trendValue: "+5%", color: "#990803" },
];

// ─── Helpers ───

export function formatCurrency(amount: number, short = false): string {
  if (short) {
    if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(0)} tr`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
    return String(amount);
  }
  return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
}

export function getTotalSpent(): number {
  return SUBSIDIARY_BUDGETS.reduce((s, b) => s + b.spent, 0);
}

export function getTotalCommitted(): number {
  return SUBSIDIARY_BUDGETS.reduce((s, b) => s + b.committed, 0);
}

export function getRemaining(): number {
  return TOTAL_ANNUAL_BUDGET - getTotalSpent() - getTotalCommitted();
}

export function getPendingRequestCount(): number {
  return BUDGET_REQUESTS.filter(r => r.status === "pending").length;
}

export function getPendingRequestTotal(): number {
  return BUDGET_REQUESTS.filter(r => r.status === "pending").reduce((s, r) => s + r.amount, 0);
}
