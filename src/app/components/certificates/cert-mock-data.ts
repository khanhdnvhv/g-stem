import { SUBSIDIARIES, DEPARTMENTS, CATEGORIES } from "../mock-data";
import type { CertRecord, CertApproval, VerificationLog, IssuanceRule, CertTemplate } from "./CertPreview";
import { DEFAULT_TEMPLATES } from "./CertPreview";

// ── Generate 40 Certificate Records ──
const STUDENT_NAMES = [
  "Trần Văn Hùng", "Nguyễn Thị Lan", "Phạm Minh Tuấn", "Lê Hoàng Vũ",
  "Võ Thị Hạnh", "Hoàng Văn Đạt", "Đỗ Thị Mai", "Bùi Xuân Trường",
  "Nguyễn Văn An", "Trần Thị Bích", "Lê Văn Cường", "Phạm Thị Dương",
  "Vũ Hoàng Dũng", "Đặng Thị Hồng", "Đinh Văn Phú", "Trần Thanh Hoa",
  "Lê Minh Khôi", "Phạm Văn Long", "Nguyễn Thị Ngọc", "Hoàng Văn Phong",
  "Trịnh Thị Quỳnh", "Ngô Đức Rạng", "Phan Văn Sơn", "Hà Thị Tâm",
  "Đoàn Văn Uy", "Lý Thị Vân", "Cao Xuân Yên", "Tạ Hữu Bằng",
  "Lương Minh Châu", "Mai Thị Diễm", "Trương Quốc Đạt", "Kiều Thị Giang",
  "Dương Văn Hải", "Châu Thị Kim", "Huỳnh Đức Lâm", "Thái Thị Mỹ",
  "La Văn Nhật", "Quách Thị Oanh", "Bạch Hoàng Phúc", "Tô Thị Quyên",
];

const COURSE_NAMES = [
  "Kỹ năng Lãnh đạo cho Quản lý Cấp trung",
  "An toàn Lao động trong Xây dựng & Khai khoáng",
  "Tuân thủ Pháp luật Doanh nghiệp",
  "Onboarding - Chào mừng Thành viên mới",
  "Phân tích Tài chính Doanh nghiệp",
  "Marketing số & Truyền thông Thương hiệu",
  "Quản trị Rủi ro & Kiểm soát Nội bộ",
  "Quản lý Dự án BĐS & Hạ tầng",
  "Chuyển đổi số Doanh nghiệp",
  "An toàn Mỏ & Vận hành Khai thác",
  "Kỹ năng Giao tiếp & Thuyết trình",
  "Nghiệp vụ Ngân hàng Bán lẻ",
  "Phòng chống Rửa tiền (AML)",
  "Vận hành Nhà máy Điện Thăng Long",
  "ESG & Phát triển Bền vững",
  "ISO 9001:2015 - Quản lý Chất lượng",
];

const STATUSES: CertRecord["status"][] = ["issued", "issued", "issued", "issued", "pending", "issued", "expired", "issued", "issued", "revoked"];

export const MOCK_CERT_RECORDS: CertRecord[] = STUDENT_NAMES.map((name, i) => {
  const completedDate = new Date(2025, 6 + Math.floor(i / 5), 1 + (i * 3) % 28);
  const issuedDate = new Date(completedDate.getTime() + 86400000);
  const expiryDate = new Date(issuedDate.getTime() + 365 * 86400000);
  const course = COURSE_NAMES[i % COURSE_NAMES.length];
  const cat = CATEGORIES[i % CATEGORIES.length];
  return {
    id: `CERT-${String(i + 1).padStart(4, "0")}`,
    certificateNo: `GXC-${2026}-${String(i + 1).padStart(5, "0")}`,
    studentId: `U${String(100 + i).padStart(3, "0")}`,
    studentName: name,
    courseName: course,
    courseId: `C${String(i + 1).padStart(3, "0")}`,
    category: cat,
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    subsidiary: SUBSIDIARIES[i % SUBSIDIARIES.length],
    score: 70 + Math.floor(Math.random() * 30),
    passingScore: 70,
    completedAt: completedDate.toISOString().split("T")[0],
    issuedAt: issuedDate.toISOString().split("T")[0],
    expiryDate: expiryDate.toISOString().split("T")[0],
    status: STATUSES[i % STATUSES.length],
    templateId: DEFAULT_TEMPLATES[i % DEFAULT_TEMPLATES.length].id,
    downloadCount: Math.floor(Math.random() * 15),
    verificationUrl: `https://lms.geleximco.vn/verify/GXC-2026-${String(i + 1).padStart(5, "0")}`,
  };
});

// ── 12 Pending Approvals ──
export const MOCK_APPROVALS: CertApproval[] = [
  { id: "PA01", studentId: "U201", studentName: "Trần Văn Hùng", department: "Ban Kỹ thuật - Vận hành", subsidiary: "Khoáng sản Geleximco", courseId: "C002", courseName: "An toàn Lao động trong Xây dựng & Khai khoáng", score: 85, completedAt: "2026-03-08", requestedAt: "2026-03-09", conditions: [{ label: "Hoàn thành 100%", met: true }, { label: "Điểm ≥ 70%", met: true }, { label: "GV xác nhận", met: true }], instructorApproved: true, instructorName: "Hoàng Thị Lan", status: "pending" },
  { id: "PA02", studentId: "U202", studentName: "Nguyễn Thị Lan", department: "Khối Quản trị Rủi ro", subsidiary: "Ngân hàng TMCP An Bình (ABBank)", courseId: "C007", courseName: "Quản trị Rủi ro & Kiểm soát Nội bộ", score: 92, completedAt: "2026-03-07", requestedAt: "2026-03-08", conditions: [{ label: "Hoàn thành 100%", met: true }, { label: "Điểm ≥ 80%", met: true }, { label: "GV xác nhận", met: false }], instructorApproved: null, instructorName: "Phạm Anh Tuấn", status: "pending" },
  { id: "PA03", studentId: "U203", studentName: "Phạm Minh Tuấn", department: "Ban Kinh doanh BĐS", subsidiary: "BĐS Geleximco - KĐT Lê Trọng Tấn", courseId: "C008", courseName: "Quản lý Dự án BĐS & Hạ tầng", score: 78, completedAt: "2026-03-06", requestedAt: "2026-03-07", conditions: [{ label: "Hoàn thành 100%", met: true }, { label: "Điểm ≥ 70%", met: true }, { label: "GV xác nhận", met: true }], instructorApproved: true, instructorName: "Lê Hoàng Nam", status: "pending" },
  { id: "PA04", studentId: "U204", studentName: "Lê Hoàng Vũ", department: "Ban Vận hành Nhà máy Điện", subsidiary: "Nhiệt điện Thăng Long", courseId: "C014", courseName: "Vận hành Nhà máy Điện Thăng Long", score: 88, completedAt: "2026-03-05", requestedAt: "2026-03-06", conditions: [{ label: "Hoàn thành 100%", met: true }, { label: "Điểm ≥ 75%", met: true }, { label: "Thi certification", met: true }, { label: "GV xác nhận", met: true }], instructorApproved: true, instructorName: "Đỗ Minh Châu", status: "pending" },
  { id: "PA05", studentId: "U205", studentName: "Võ Thị Hạnh", department: "Marketing", subsidiary: "Tập đoàn Geleximco", courseId: "C006", courseName: "Marketing số & Truyền thông Thương hiệu", score: 91, completedAt: "2026-03-04", requestedAt: "2026-03-05", conditions: [{ label: "Hoàn thành 100%", met: true }, { label: "Điểm ≥ 70%", met: true }], instructorApproved: true, instructorName: "Ngô Thị Mai", status: "pending" },
  { id: "PA06", studentId: "U206", studentName: "Hoàng Văn Đạt", department: "IT & Công nghệ", subsidiary: "Tập đoàn Geleximco", courseId: "C009", courseName: "Chuyển đổi số Doanh nghiệp", score: 95, completedAt: "2026-03-03", requestedAt: "2026-03-04", conditions: [{ label: "Hoàn thành 100%", met: true }, { label: "Điểm ≥ 80%", met: true }, { label: "GV xác nhận", met: true }], instructorApproved: true, instructorName: "Đỗ Minh Châu", status: "pending" },
  { id: "PA07", studentId: "U207", studentName: "Đỗ Thị Mai", department: "Kế toán - Tài chính", subsidiary: "Chứng khoán An Bình (ABS)", courseId: "C005", courseName: "Phân tích Tài chính Doanh nghiệp", score: 82, completedAt: "2026-03-02", requestedAt: "2026-03-03", conditions: [{ label: "Hoàn thành 100%", met: true }, { label: "Điểm ≥ 70%", met: true }, { label: "GV xác nhận", met: false }], instructorApproved: null, instructorName: "Trần Thị Hương", status: "pending" },
  { id: "PA08", studentId: "U208", studentName: "Bùi Xuân Trường", department: "Phân xưởng Sản xuất", subsidiary: "Xi măng Thăng Long", courseId: "C016", courseName: "ISO 9001:2015 - Quản lý Chất lượng", score: 76, completedAt: "2026-03-01", requestedAt: "2026-03-02", conditions: [{ label: "Hoàn thành 100%", met: true }, { label: "Điểm ≥ 70%", met: true }, { label: "GV xác nhận", met: true }], instructorApproved: true, instructorName: "Hoàng Thị Lan", status: "pending" },
  { id: "PA09", studentId: "U209", studentName: "Nguyễn Văn An", department: "Khối Ngân hàng Bán lẻ", subsidiary: "Ngân hàng TMCP An Bình (ABBank)", courseId: "C013", courseName: "Phòng chống Rửa tiền (AML)", score: 89, completedAt: "2026-02-28", requestedAt: "2026-03-01", conditions: [{ label: "Hoàn thành 100%", met: true }, { label: "Điểm ≥ 80%", met: true }, { label: "Thi certification", met: true }], instructorApproved: true, instructorName: "Phạm Anh Tuấn", status: "pending" },
  { id: "PA10", studentId: "U210", studentName: "Trần Thị Bích", department: "Ban An toàn Mỏ & Lao động", subsidiary: "Khoáng sản Geleximco", courseId: "C010", courseName: "An toàn Mỏ & Vận hành Khai thác", score: 84, completedAt: "2026-02-27", requestedAt: "2026-02-28", conditions: [{ label: "Hoàn thành 100%", met: true }, { label: "Điểm ≥ 75%", met: true }, { label: "GV xác nhận", met: true }, { label: "Thực hành tại hiện trường", met: true }], instructorApproved: true, instructorName: "Lê Hoàng Nam", status: "pending" },
  { id: "PA11", studentId: "U211", studentName: "Lê Văn Cường", department: "Ban Chiến lược & Phát triển", subsidiary: "Tập đoàn Geleximco", courseId: "C015", courseName: "ESG & Phát triển Bền vững", score: 87, completedAt: "2026-02-26", requestedAt: "2026-02-27", conditions: [{ label: "Hoàn thành 100%", met: true }, { label: "Điểm ≥ 70%", met: true }], instructorApproved: true, instructorName: "Ngô Thị Mai", status: "pending" },
  { id: "PA12", studentId: "U212", studentName: "Phạm Thị Dương", department: "Nhân sự", subsidiary: "Bảo hiểm AAA", courseId: "C001", courseName: "Kỹ năng Lãnh đạo cho Quản lý Cấp trung", score: 93, completedAt: "2026-02-25", requestedAt: "2026-02-26", conditions: [{ label: "Hoàn thành 100%", met: true }, { label: "Điểm ≥ 80%", met: true }, { label: "GV xác nhận", met: true }], instructorApproved: true, instructorName: "Hoàng Thị Lan", status: "pending" },
];

// ── 15 Verification Logs ──
export const MOCK_VERIFY_LOGS: VerificationLog[] = [
  { id: "VL01", certificateNo: "GXC-2026-00001", studentName: "Trần Văn Hùng", verifiedAt: "2026-03-11 09:15", source: "qr", result: "valid", ipAddress: "113.160.xx.xx" },
  { id: "VL02", certificateNo: "GXC-2026-00003", studentName: "Phạm Minh Tuấn", verifiedAt: "2026-03-11 08:42", source: "web", result: "valid", ipAddress: "42.112.xx.xx" },
  { id: "VL03", certificateNo: "GXC-2026-00007", studentName: "Bùi Xuân Trường", verifiedAt: "2026-03-10 16:30", source: "api", result: "expired", ipAddress: "api.partner.vn" },
  { id: "VL04", certificateNo: "GXC-2026-00005", studentName: "Võ Thị Hạnh", verifiedAt: "2026-03-10 14:15", source: "qr", result: "valid", ipAddress: "115.73.xx.xx" },
  { id: "VL05", certificateNo: "GXC-FAKE-99999", studentName: "N/A", verifiedAt: "2026-03-10 11:00", source: "web", result: "not_found", ipAddress: "203.205.xx.xx" },
  { id: "VL06", certificateNo: "GXC-2026-00010", studentName: "Hoàng Văn Phong", verifiedAt: "2026-03-09 15:45", source: "qr", result: "revoked", ipAddress: "14.232.xx.xx" },
  { id: "VL07", certificateNo: "GXC-2026-00002", studentName: "Nguyễn Thị Lan", verifiedAt: "2026-03-09 10:20", source: "web", result: "valid", ipAddress: "113.161.xx.xx" },
  { id: "VL08", certificateNo: "GXC-2026-00008", studentName: "Nguyễn Văn An", verifiedAt: "2026-03-08 09:00", source: "api", result: "valid", ipAddress: "api.abbank.vn" },
  { id: "VL09", certificateNo: "GXC-2026-00012", studentName: "Trương Quốc Đạt", verifiedAt: "2026-03-08 08:15", source: "qr", result: "valid", ipAddress: "171.243.xx.xx" },
  { id: "VL10", certificateNo: "GXC-2026-00015", studentName: "Huỳnh Đức Lâm", verifiedAt: "2026-03-07 16:40", source: "web", result: "valid", ipAddress: "123.16.xx.xx" },
  { id: "VL11", certificateNo: "GXC-2026-00004", studentName: "Lê Hoàng Vũ", verifiedAt: "2026-03-07 11:30", source: "qr", result: "valid", ipAddress: "118.69.xx.xx" },
  { id: "VL12", certificateNo: "GXC-FAKE-88888", studentName: "N/A", verifiedAt: "2026-03-06 14:00", source: "web", result: "not_found", ipAddress: "195.88.xx.xx" },
  { id: "VL13", certificateNo: "GXC-2026-00020", studentName: "Hoàng Văn Phong", verifiedAt: "2026-03-06 09:45", source: "api", result: "valid", ipAddress: "api.linkedin.com" },
  { id: "VL14", certificateNo: "GXC-2026-00006", studentName: "Hoàng Văn Đạt", verifiedAt: "2026-03-05 13:20", source: "qr", result: "valid", ipAddress: "113.22.xx.xx" },
  { id: "VL15", certificateNo: "GXC-2026-00009", studentName: "Trần Thị Bích", verifiedAt: "2026-03-05 10:00", source: "web", result: "valid", ipAddress: "42.113.xx.xx" },
];

// ── 8 Issuance Rules ──
export const MOCK_ISSUANCE_RULES: IssuanceRule[] = [
  { id: "IR01", courseName: "An toàn Lao động trong Xây dựng & Khai khoáng", category: "An toàn Xây dựng & Công trường", templateId: "T1", templateName: "Geleximco Classic", conditions: { completionRequired: true, minScore: 70, certExamRequired: true, instructorApproval: true }, validity: "1year", renewalPolicy: "retake_exam", approvalWorkflow: "instructor", codeFormat: "GXC-ATLD-{YYYY}-{SEQ:5}", emailNotify: true, isActive: true },
  { id: "IR02", courseName: "Quản trị Rủi ro & Kiểm soát Nội bộ", category: "Quản trị Rủi ro & Kiểm soát Nội bộ", templateId: "T3", templateName: "Elegant Gold", conditions: { completionRequired: true, minScore: 80, certExamRequired: true, instructorApproval: true }, validity: "2year", renewalPolicy: "retake_course", approvalWorkflow: "director", codeFormat: "GXC-QTRR-{YYYY}-{SEQ:5}", emailNotify: true, isActive: true },
  { id: "IR03", courseName: "Onboarding - Chào mừng Thành viên mới", category: "Onboarding & Văn hóa Tập đoàn", templateId: "T4", templateName: "Minimal Clean", conditions: { completionRequired: true, minScore: 60, certExamRequired: false, instructorApproval: false }, validity: "permanent", renewalPolicy: "none", approvalWorkflow: "auto", codeFormat: "GXC-OB-{YYYY}-{SEQ:5}", emailNotify: true, isActive: true },
  { id: "IR04", courseName: "Phân tích Tài chính Doanh nghiệp", category: "Tài chính & Kế toán Doanh nghiệp", templateId: "T2", templateName: "Modern Professional", conditions: { completionRequired: true, minScore: 75, certExamRequired: true, instructorApproval: true }, validity: "2year", renewalPolicy: "retake_exam", approvalWorkflow: "manager", codeFormat: "GXC-TC-{YYYY}-{SEQ:5}", emailNotify: true, isActive: true },
  { id: "IR05", courseName: "Kỹ năng Lãnh đạo cho Quản lý Cấp trung", category: "Kỹ năng Lãnh đạo & Quản trị", templateId: "T3", templateName: "Elegant Gold", conditions: { completionRequired: true, minScore: 80, certExamRequired: true, instructorApproval: true }, validity: "2year", renewalPolicy: "retake_course", approvalWorkflow: "director", codeFormat: "GXC-LD-{YYYY}-{SEQ:5}", emailNotify: true, isActive: true },
  { id: "IR06", courseName: "Chuyển đổi số Doanh nghiệp", category: "CNTT & Chuyển đổi số", templateId: "T2", templateName: "Modern Professional", conditions: { completionRequired: true, minScore: 70, certExamRequired: false, instructorApproval: true }, validity: "1year", renewalPolicy: "auto", approvalWorkflow: "instructor", codeFormat: "GXC-CDS-{YYYY}-{SEQ:5}", emailNotify: true, isActive: true },
  { id: "IR07", courseName: "Phòng chống Rửa tiền (AML)", category: "Nghiệp vụ Ngân hàng & Tín dụng", templateId: "T1", templateName: "Geleximco Classic", conditions: { completionRequired: true, minScore: 85, certExamRequired: true, instructorApproval: true }, validity: "1year", renewalPolicy: "retake_exam", approvalWorkflow: "manager", codeFormat: "GXC-AML-{YYYY}-{SEQ:5}", emailNotify: true, isActive: true },
  { id: "IR08", courseName: "ISO 9001:2015 - Quản lý Chất lượng", category: "Quản lý Chất lượng (ISO/QC)", templateId: "T1", templateName: "Geleximco Classic", conditions: { completionRequired: true, minScore: 75, certExamRequired: true, instructorApproval: true }, validity: "1year", renewalPolicy: "retake_exam", approvalWorkflow: "manager", codeFormat: "GXC-ISO-{YYYY}-{SEQ:5}", emailNotify: true, isActive: false },
];

// ── Statistics by month ──
export const MONTHLY_ISSUED = [
  { month: "T10/25", count: 42 },
  { month: "T11/25", count: 58 },
  { month: "T12/25", count: 67 },
  { month: "T01/26", count: 89 },
  { month: "T02/26", count: 75 },
  { month: "T03/26", count: 34 },
];

// ── Statistics by subsidiary ──
export const SUBSIDIARY_CERT_STATS = [
  { name: "Tập đoàn Geleximco", count: 186, short: "Holding" },
  { name: "ABBank", count: 142, short: "ABBank" },
  { name: "Khoáng sản Geleximco", count: 68, short: "Khoáng sản" },
  { name: "Xi măng Thăng Long", count: 54, short: "Xi măng" },
  { name: "Nhiệt điện Thăng Long", count: 47, short: "Nhiệt điện" },
  { name: "BĐS Lê Trọng Tấn", count: 38, short: "BĐS LTT" },
  { name: "Bảo hiểm AAA", count: 32, short: "AAA" },
  { name: "Khác", count: 75, short: "Khác" },
];
