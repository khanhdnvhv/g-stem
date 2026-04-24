import { useState } from "react";
import {
  Eye, EyeOff, AlertTriangle, CheckCircle, XCircle, Info,
  Search, Filter, Download, RefreshCw, ChevronRight,
  FileText, Image, Video, Type, Palette, MousePointer,
  Monitor, Smartphone, Volume2, Keyboard, ZoomIn,
  ArrowUp, ArrowDown, Clock, BarChart3, Shield,
  Layers, Zap, Star, Globe, Accessibility,
  Check, X, AlertCircle, HelpCircle, Play,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface WcagIssue {
  id: string;
  courseId: string;
  courseName: string;
  contentType: "page" | "video" | "quiz" | "document" | "image";
  wcagLevel: "A" | "AA" | "AAA";
  criterion: string;
  criterionCode: string;
  severity: "critical" | "major" | "minor" | "info";
  title: string;
  description: string;
  element: string;
  recommendation: string;
  status: "open" | "fixed" | "ignored" | "in-progress";
  detectedAt: string;
}

interface CourseScore {
  id: string;
  courseName: string;
  subsidiary: string;
  totalIssues: number;
  critical: number;
  major: number;
  minor: number;
  score: number;
  lastScan: string;
  status: "pass" | "warning" | "fail";
}

interface ScanHistory {
  id: string;
  date: string;
  totalPages: number;
  issuesFound: number;
  fixed: number;
  scoreAvg: number;
}

// ─── Mock Data ───
const ISSUES: WcagIssue[] = [
  { id: "WC01", courseId: "C1", courseName: "Kỹ năng Lãnh đạo 4.0", contentType: "image", wcagLevel: "A", criterion: "Non-text Content", criterionCode: "1.1.1", severity: "critical", title: "Thiếu alt text cho hình ảnh", description: "12 hình ảnh trong module 3 không có thuộc tính alt text", element: "<img src='leadership-diagram.png'>", recommendation: "Thêm mô tả alt text có ý nghĩa cho tất cả hình ảnh", status: "open", detectedAt: "12/03/2026" },
  { id: "WC02", courseId: "C2", courseName: "An toàn Lao động Công trường", contentType: "video", wcagLevel: "A", criterion: "Captions (Prerecorded)", criterionCode: "1.2.2", severity: "critical", title: "Video không có phụ đề", description: "5 video hướng dẫn ATLĐ chưa có phụ đề tiếng Việt", element: "<video id='safety-demo-3'>", recommendation: "Thêm phụ đề đồng bộ cho tất cả video đào tạo", status: "in-progress", detectedAt: "11/03/2026" },
  { id: "WC03", courseId: "C3", courseName: "Excel Nâng cao & VBA", contentType: "page", wcagLevel: "AA", criterion: "Contrast (Minimum)", criterionCode: "1.4.3", severity: "major", title: "Tương phản màu không đủ", description: "Text màu #999 trên nền #fff có contrast ratio 2.85:1 (yêu cầu ≥4.5:1)", element: "<p class='hint-text'>", recommendation: "Đổi màu text sang #595959 hoặc đậm hơn", status: "open", detectedAt: "10/03/2026" },
  { id: "WC04", courseId: "C4", courseName: "Phân tích Tài chính", contentType: "quiz", wcagLevel: "A", criterion: "Keyboard", criterionCode: "2.1.1", severity: "critical", title: "Câu hỏi kéo thả không hỗ trợ bàn phím", description: "Quiz drag-and-drop không thể thao tác bằng keyboard", element: "<div class='dnd-zone'>", recommendation: "Thêm phương thức thay thế: click-to-select hoặc keyboard controls", status: "fixed", detectedAt: "08/03/2026" },
  { id: "WC05", courseId: "C1", courseName: "Kỹ năng Lãnh đạo 4.0", contentType: "page", wcagLevel: "A", criterion: "Info and Relationships", criterionCode: "1.3.1", severity: "major", title: "Heading hierarchy không đúng", description: "Nhảy từ H1 sang H4 không qua H2, H3", element: "<h4>Case Study</h4>", recommendation: "Sắp xếp lại heading theo thứ tự H1→H2→H3→H4", status: "open", detectedAt: "12/03/2026" },
  { id: "WC06", courseId: "C5", courseName: "PCCC Cơ bản", contentType: "page", wcagLevel: "AA", criterion: "Resize Text", criterionCode: "1.4.4", severity: "minor", title: "Layout bị vỡ khi zoom 200%", description: "Sidebar che mất nội dung chính khi phóng to 200%", element: "<aside class='course-sidebar'>", recommendation: "Sử dụng responsive layout, ẩn sidebar khi viewport nhỏ", status: "open", detectedAt: "09/03/2026" },
  { id: "WC07", courseId: "C6", courseName: "ESG & Phát triển Bền vững", contentType: "document", wcagLevel: "A", criterion: "Language of Page", criterionCode: "3.1.1", severity: "minor", title: "Thiếu khai báo ngôn ngữ trang", description: "Trang không có thuộc tính lang='vi' trên thẻ html", element: "<html>", recommendation: "Thêm lang='vi' vào thẻ <html>", status: "fixed", detectedAt: "07/03/2026" },
  { id: "WC08", courseId: "C7", courseName: "Digital Marketing", contentType: "image", wcagLevel: "AA", criterion: "Images of Text", criterionCode: "1.4.5", severity: "major", title: "Sử dụng hình ảnh chứa text thay vì HTML text", description: "Infographic chứa text quan trọng dưới dạng ảnh, không selectable/scalable", element: "<img src='marketing-funnel.png'>", recommendation: "Chuyển sang SVG hoặc HTML/CSS, cung cấp text alternative", status: "open", detectedAt: "11/03/2026" },
  { id: "WC09", courseId: "C2", courseName: "An toàn Lao động Công trường", contentType: "page", wcagLevel: "A", criterion: "Parsing", criterionCode: "4.1.1", severity: "minor", title: "HTML không hợp lệ - duplicate IDs", description: "3 elements có cùng id='main-content'", element: "<div id='main-content'>", recommendation: "Đảm bảo mỗi ID là duy nhất trong trang", status: "ignored", detectedAt: "06/03/2026" },
  { id: "WC10", courseId: "C8", courseName: "Onboarding Nhân viên mới", contentType: "page", wcagLevel: "AAA", criterion: "Reading Level", criterionCode: "3.1.5", severity: "info", title: "Mức độ đọc cao hơn phổ thông", description: "Nội dung yêu cầu trình độ đọc trên trung học phổ thông", element: "<section class='policy-text'>", recommendation: "Viết lại bằng ngôn ngữ đơn giản hơn, thêm glossary", status: "open", detectedAt: "10/03/2026" },
  { id: "WC11", courseId: "C9", courseName: "Quản lý Dự án Agile", contentType: "page", wcagLevel: "AA", criterion: "Focus Visible", criterionCode: "2.4.7", severity: "major", title: "Focus indicator không rõ ràng", description: "Khi tab qua các elements, focus outline bị ẩn bởi CSS outline:none", element: "<button class='action-btn'>", recommendation: "Giữ focus ring mặc định hoặc thêm custom focus style rõ ràng", status: "open", detectedAt: "12/03/2026" },
  { id: "WC12", courseId: "C10", courseName: "Compliance Tài chính Ngân hàng", contentType: "quiz", wcagLevel: "A", criterion: "Error Identification", criterionCode: "3.3.1", severity: "major", title: "Thông báo lỗi chỉ dùng màu đỏ", description: "Form validation chỉ đổi màu border, không có text mô tả lỗi", element: "<input class='error'>", recommendation: "Thêm text mô tả lỗi cụ thể, icon cảnh báo, ARIA attributes", status: "open", detectedAt: "11/03/2026" },
];

const COURSE_SCORES: CourseScore[] = [
  { id: "CS01", courseName: "Kỹ năng Lãnh đạo 4.0", subsidiary: "VP Tập đoàn", totalIssues: 8, critical: 1, major: 3, minor: 2, score: 62, lastScan: "12/03/2026", status: "fail" },
  { id: "CS02", courseName: "An toàn Lao động Công trường", subsidiary: "Xi măng TL", totalIssues: 5, critical: 1, major: 1, minor: 2, score: 71, lastScan: "11/03/2026", status: "warning" },
  { id: "CS03", courseName: "Excel Nâng cao & VBA", subsidiary: "ABBank", totalIssues: 3, critical: 0, major: 1, minor: 1, score: 85, lastScan: "10/03/2026", status: "pass" },
  { id: "CS04", courseName: "Phân tích Tài chính", subsidiary: "ABS", totalIssues: 1, critical: 0, major: 0, minor: 0, score: 96, lastScan: "08/03/2026", status: "pass" },
  { id: "CS05", courseName: "PCCC Cơ bản", subsidiary: "Hạ tầng", totalIssues: 4, critical: 0, major: 2, minor: 1, score: 78, lastScan: "09/03/2026", status: "warning" },
  { id: "CS06", courseName: "ESG & Phát triển Bền vững", subsidiary: "VP Tập đoàn", totalIssues: 1, critical: 0, major: 0, minor: 0, score: 95, lastScan: "07/03/2026", status: "pass" },
  { id: "CS07", courseName: "Digital Marketing", subsidiary: "Hanel", totalIssues: 4, critical: 0, major: 2, minor: 1, score: 74, lastScan: "11/03/2026", status: "warning" },
  { id: "CS08", courseName: "Onboarding Nhân viên mới", subsidiary: "VP Tập đoàn", totalIssues: 2, critical: 0, major: 0, minor: 1, score: 90, lastScan: "10/03/2026", status: "pass" },
  { id: "CS09", courseName: "Quản lý Dự án Agile", subsidiary: "Hanel", totalIssues: 3, critical: 0, major: 2, minor: 0, score: 77, lastScan: "12/03/2026", status: "warning" },
  { id: "CS10", courseName: "Compliance Tài chính Ngân hàng", subsidiary: "ABBank", totalIssues: 4, critical: 0, major: 2, minor: 1, score: 73, lastScan: "11/03/2026", status: "warning" },
];

const SCAN_HISTORY: ScanHistory[] = [
  { id: "SH01", date: "T9/25", totalPages: 820, issuesFound: 145, fixed: 110, scoreAvg: 68 },
  { id: "SH02", date: "T10/25", totalPages: 850, issuesFound: 132, fixed: 128, scoreAvg: 72 },
  { id: "SH03", date: "T11/25", totalPages: 890, issuesFound: 118, fixed: 140, scoreAvg: 76 },
  { id: "SH04", date: "T12/25", totalPages: 920, issuesFound: 95, fixed: 115, scoreAvg: 79 },
  { id: "SH05", date: "T1/26", totalPages: 960, issuesFound: 82, fixed: 98, scoreAvg: 82 },
  { id: "SH06", date: "T2/26", totalPages: 1010, issuesFound: 68, fixed: 85, scoreAvg: 84 },
  { id: "SH07", date: "T3/26", totalPages: 1050, issuesFound: 55, fixed: 72, scoreAvg: 86 },
];

const SEV_CFG: Record<string, { color: string; bg: string; label: string; icon: typeof AlertCircle }> = {
  critical: { color: "#ef4444", bg: "#ef444410", label: "Nghiêm trọng", icon: XCircle },
  major: { color: "#ea580c", bg: "#ea580c10", label: "Quan trọng", icon: AlertTriangle },
  minor: { color: "#c8a84e", bg: "#c8a84e10", label: "Nhỏ", icon: AlertCircle },
  info: { color: "#6b7280", bg: "#6b728010", label: "Thông tin", icon: Info },
};

const STATUS_CFG: Record<string, { color: string; label: string }> = {
  open: { color: "#ef4444", label: "Chưa sửa" },
  fixed: { color: "#16a34a", label: "Đã sửa" },
  ignored: { color: "#9ca3af", label: "Bỏ qua" },
  "in-progress": { color: "#2563eb", label: "Đang sửa" },
};

const CONTENT_ICONS: Record<string, typeof FileText> = {
  page: FileText, video: Video, quiz: Keyboard, document: FileText, image: Image,
};

export function AccessibilityChecker() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"dashboard" | "issues" | "courses" | "guidelines">("dashboard");
  const [sevFilter, setSevFilter] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<WcagIssue | null>(null);

  const totalIssues = ISSUES.length;
  const criticalCount = ISSUES.filter(i => i.severity === "critical").length;
  const openCount = ISSUES.filter(i => i.status === "open").length;
  const fixedCount = ISSUES.filter(i => i.status === "fixed").length;
  const avgScore = Math.round(COURSE_SCORES.reduce((s, c) => s + c.score, 0) / COURSE_SCORES.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Accessibility className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Accessibility Checker</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Kiểm tra tuân thủ WCAG 2.1 cho nội dung e-learning — đảm bảo mọi nhân viên đều tiếp cận được
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất báo cáo Accessibility...")); }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.info("Đang quét toàn bộ nội dung e-learning...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Play className="w-4 h-4" /> Quét toàn bộ
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Điểm TB", value: `${avgScore}/100`, icon: Star, color: avgScore >= 80 ? "#16a34a" : "#c8a84e" },
          { label: "Tổng Issues", value: totalIssues, icon: AlertTriangle, color: "#ea580c" },
          { label: "Nghiêm trọng", value: criticalCount, icon: XCircle, color: "#ef4444" },
          { label: "Chưa sửa", value: openCount, icon: AlertCircle, color: "#c8a84e" },
          { label: "Đã sửa", value: fixedCount, icon: CheckCircle, color: "#16a34a" },
          { label: "Khóa học", value: COURSE_SCORES.length, icon: FileText, color: "#2563eb" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "10" }}>
                <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
            </div>
            <p style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>{s.value}</p>
            <p className="text-gray-400" style={{ fontSize: "9px" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200 overflow-x-auto">
        {([
          { id: "dashboard", label: "Dashboard", icon: BarChart3 },
          { id: "issues", label: `Issues (${totalIssues})`, icon: AlertTriangle },
          { id: "courses", label: "Khóa học", icon: FileText },
          { id: "guidelines", label: "WCAG Guidelines", icon: Shield },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab issues={ISSUES} scores={COURSE_SCORES} history={SCAN_HISTORY} />}
      {tab === "issues" && <IssuesTab issues={ISSUES} sevFilter={sevFilter} setSevFilter={setSevFilter} selectedIssue={selectedIssue} setSelectedIssue={setSelectedIssue} />}
      {tab === "courses" && <CoursesTab scores={COURSE_SCORES} />}
      {tab === "guidelines" && <GuidelinesTab />}
    </div>
  );
}

// ─── Dashboard Tab ───
function DashboardTab({ issues, scores, history }: { issues: WcagIssue[]; scores: CourseScore[]; history: ScanHistory[] }) {
  const maxIssues = Math.max(...history.map(h => h.issuesFound));
  const maxScore = 100;

  // Severity distribution
  const sevDist = [
    { sev: "critical", count: issues.filter(i => i.severity === "critical").length, ...SEV_CFG.critical },
    { sev: "major", count: issues.filter(i => i.severity === "major").length, ...SEV_CFG.major },
    { sev: "minor", count: issues.filter(i => i.severity === "minor").length, ...SEV_CFG.minor },
    { sev: "info", count: issues.filter(i => i.severity === "info").length, ...SEV_CFG.info },
  ];

  // WCAG principle distribution
  const principles = [
    { name: "Perceivable", code: "1.x", count: issues.filter(i => i.criterionCode.startsWith("1.")).length, color: "#990803" },
    { name: "Operable", code: "2.x", count: issues.filter(i => i.criterionCode.startsWith("2.")).length, color: "#c8a84e" },
    { name: "Understandable", code: "3.x", count: issues.filter(i => i.criterionCode.startsWith("3.")).length, color: "#2563eb" },
    { name: "Robust", code: "4.x", count: issues.filter(i => i.criterionCode.startsWith("4.")).length, color: "#16a34a" },
  ];
  const maxPrin = Math.max(...principles.map(p => p.count));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Score Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Điểm Accessibility TB theo Tháng</h3>
          <svg width="100%" height="180" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet">
            {[0, 25, 50, 75, 100].map(v => {
              const y = 10 + (1 - v / maxScore) * 130;
              return (
                <g key={v}>
                  <line x1="35" y1={y} x2="380" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
                  <text x="30" y={y} textAnchor="end" dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "7px" }}>{v}</text>
                </g>
              );
            })}
            {/* Area fill */}
            <polygon
              points={[
                ...history.map((h, i) => `${35 + i * 50},${10 + (1 - h.scoreAvg / maxScore) * 130}`),
                `${35 + (history.length - 1) * 50},140`,
                `35,140`,
              ].join(" ")}
              fill="#16a34a" opacity="0.08"
            />
            {/* Score line */}
            <polyline
              points={history.map((h, i) => `${35 + i * 50},${10 + (1 - h.scoreAvg / maxScore) * 130}`).join(" ")}
              fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinejoin="round"
            />
            {/* Data points */}
            {history.map((h, i) => {
              const x = 35 + i * 50;
              const y = 10 + (1 - h.scoreAvg / maxScore) * 130;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="3.5" fill="white" stroke="#16a34a" strokeWidth="2" />
                  <text x={x} y={y - 9} textAnchor="middle" fill="#16a34a" style={{ fontSize: "8px", fontWeight: 700 }}>{h.scoreAvg}</text>
                  <text x={x} y={158} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "7px" }}>{h.date}</text>
                </g>
              );
            })}
            {/* Target line */}
            <line x1="35" y1={10 + (1 - 80 / maxScore) * 130} x2="380" y2={10 + (1 - 80 / maxScore) * 130} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" />
            <text x="382" y={10 + (1 - 80 / maxScore) * 130} fill="#ef4444" style={{ fontSize: "7px" }}>Target: 80</text>
          </svg>
        </div>

        {/* Issues Found vs Fixed */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Issues Phát hiện vs Đã sửa</h3>
          <svg width="100%" height="180" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid meet">
            {[0, 50, 100, 150].map(v => {
              const y = 10 + (1 - v / 150) * 130;
              return (
                <g key={v}>
                  <line x1="35" y1={y} x2="380" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
                  <text x="30" y={y} textAnchor="end" dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "7px" }}>{v}</text>
                </g>
              );
            })}
            {history.map((h, i) => {
              const x = 35 + i * 50;
              const bw = 18;
              const foundH = (h.issuesFound / 150) * 130;
              const fixedH = (h.fixed / 150) * 130;
              return (
                <g key={i}>
                  <rect x={x - bw} y={140 - foundH} width={bw} height={foundH} rx="3" fill="#ef4444" opacity="0.4" />
                  <rect x={x + 2} y={140 - fixedH} width={bw} height={fixedH} rx="3" fill="#16a34a" opacity="0.5" />
                  <text x={x} y={158} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "7px" }}>{h.date}</text>
                </g>
              );
            })}
            <rect x="280" y="5" width="8" height="8" rx="2" fill="#ef4444" opacity="0.4" />
            <text x="292" y="12" fill="#6b7280" style={{ fontSize: "7px" }}>Phát hiện</text>
            <rect x="330" y="5" width="8" height="8" rx="2" fill="#16a34a" opacity="0.5" />
            <text x="342" y="12" fill="#6b7280" style={{ fontSize: "7px" }}>Đã sửa</text>
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Severity Donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Phân bố Mức độ</h3>
          <svg width="100%" height="160" viewBox="0 0 250 160" preserveAspectRatio="xMidYMid meet">
            {(() => {
              const cx = 80, cy = 75, r = 55, inner = 32;
              const total = sevDist.reduce((s, d) => s + d.count, 0);
              let cumAngle = -90;
              return (
                <>
                  {sevDist.map(d => {
                    const angle = (d.count / total) * 360;
                    const startAngle = cumAngle;
                    const endAngle = cumAngle + angle;
                    cumAngle = endAngle;
                    const s1 = { x: cx + r * Math.cos(startAngle * Math.PI / 180), y: cy + r * Math.sin(startAngle * Math.PI / 180) };
                    const e1 = { x: cx + r * Math.cos(endAngle * Math.PI / 180), y: cy + r * Math.sin(endAngle * Math.PI / 180) };
                    const s2 = { x: cx + inner * Math.cos(endAngle * Math.PI / 180), y: cy + inner * Math.sin(endAngle * Math.PI / 180) };
                    const e2 = { x: cx + inner * Math.cos(startAngle * Math.PI / 180), y: cy + inner * Math.sin(startAngle * Math.PI / 180) };
                    const large = angle > 180 ? 1 : 0;
                    return <path key={d.sev} d={`M ${s1.x} ${s1.y} A ${r} ${r} 0 ${large} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${inner} ${inner} 0 ${large} 0 ${e2.x} ${e2.y} Z`} fill={d.color} opacity="0.6" />;
                  })}
                  <text x={cx} y={cy - 2} textAnchor="middle" fill="#374151" style={{ fontSize: "16px", fontWeight: 700 }}>{total}</text>
                  <text x={cx} y={cy + 10} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "7px" }}>issues</text>
                  {/* Legend */}
                  {sevDist.map((d, i) => (
                    <g key={d.sev}>
                      <rect x="165" y={25 + i * 25} width="10" height="10" rx="2" fill={d.color} opacity="0.6" />
                      <text x="180" y={33 + i * 25} fill="#374151" style={{ fontSize: "8px" }}>{d.label}</text>
                      <text x="235" y={33 + i * 25} textAnchor="end" fill={d.color} style={{ fontSize: "9px", fontWeight: 700 }}>{d.count}</text>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </div>

        {/* WCAG Principles */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Issues theo Nguyên tắc WCAG</h3>
          <svg width="100%" height="160" viewBox="0 0 250 160" preserveAspectRatio="xMidYMid meet">
            {principles.map((p, i) => {
              const y = 8 + i * 38;
              const barW = maxPrin > 0 ? (p.count / maxPrin) * 140 : 0;
              return (
                <g key={p.name}>
                  <text x="5" y={y + 8} fill="#374151" style={{ fontSize: "8px", fontWeight: 600 }}>{p.name}</text>
                  <text x="5" y={y + 18} fill="#9ca3af" style={{ fontSize: "6.5px" }}>({p.code})</text>
                  <rect x="80" y={y} width={barW} height="24" rx="5" fill={p.color} opacity="0.45" />
                  <text x={85 + barW} y={y + 12} dominantBaseline="central" fill={p.color} style={{ fontSize: "10px", fontWeight: 700 }}>{p.count}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Course Score Distribution Heatmap */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Phân bố Điểm Khóa học</h3>
          <svg width="100%" height="160" viewBox="0 0 250 160" preserveAspectRatio="xMidYMid meet">
            {scores.sort((a, b) => a.score - b.score).map((c, i) => {
              const x = 10 + (i % 5) * 48;
              const y = 5 + Math.floor(i / 5) * 72;
              const color = c.score >= 85 ? "#16a34a" : c.score >= 70 ? "#c8a84e" : "#ef4444";
              const opacity = 0.3 + (c.score / 100) * 0.5;
              return (
                <g key={c.id}>
                  <rect x={x} y={y} width="44" height="58" rx="6" fill={color} opacity={opacity} />
                  <text x={x + 22} y={y + 22} textAnchor="middle" fill="white" style={{ fontSize: "14px", fontWeight: 700 }}>{c.score}</text>
                  <text x={x + 22} y={y + 36} textAnchor="middle" fill="white" opacity="0.9" style={{ fontSize: "5.5px" }}>{c.courseName.slice(0, 12)}</text>
                  <text x={x + 22} y={y + 48} textAnchor="middle" fill="white" opacity="0.7" style={{ fontSize: "5px" }}>{c.subsidiary}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─── Issues Tab ───
function IssuesTab({ issues, sevFilter, setSevFilter, selectedIssue, setSelectedIssue }: {
  issues: WcagIssue[]; sevFilter: string; setSevFilter: (s: string) => void;
  selectedIssue: WcagIssue | null; setSelectedIssue: (i: WcagIssue | null) => void;
}) {
  const filtered = sevFilter === "all" ? issues : issues.filter(i => i.severity === sevFilter);

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "critical", "major", "minor", "info"].map(s => {
          const count = s === "all" ? issues.length : issues.filter(i => i.severity === s).length;
          const cfg = s === "all" ? { color: "#374151", label: "Tất cả" } : SEV_CFG[s];
          return (
            <button key={s} onClick={() => setSevFilter(s)} className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${sevFilter === s ? "border-current" : "border-gray-200"}`} style={{ fontSize: "11px", fontWeight: sevFilter === s ? 600 : 400, color: cfg.color, backgroundColor: sevFilter === s ? cfg.color + "10" : "white" }}>
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Issues List */}
        <div className="lg:col-span-2 space-y-2">
          {filtered.map(issue => {
            const sev = SEV_CFG[issue.severity];
            const st = STATUS_CFG[issue.status];
            const Icon = CONTENT_ICONS[issue.contentType] || FileText;
            const SevIcon = sev.icon;
            return (
              <div key={issue.id} onClick={() => setSelectedIssue(issue)} className={`bg-white rounded-xl border p-3 cursor-pointer transition-all hover:shadow-md ${selectedIssue?.id === issue.id ? "border-[#990803] ring-1 ring-[#990803]/20" : "border-gray-200"}`}>
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: sev.bg }}>
                    <SevIcon className="w-4 h-4" style={{ color: sev.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <h4 className="text-gray-800" style={{ fontSize: "12px", fontWeight: 600 }}>{issue.title}</h4>
                      <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 700, color: sev.color, backgroundColor: sev.bg }}>{sev.label}</span>
                      <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: st.color, backgroundColor: st.color + "10" }}>{st.label}</span>
                    </div>
                    <p className="text-gray-400 mb-1" style={{ fontSize: "10px" }}>{issue.description}</p>
                    <div className="flex items-center gap-2 text-gray-300" style={{ fontSize: "9px" }}>
                      <span className="flex items-center gap-0.5"><Icon className="w-3 h-3" /> {issue.courseName}</span>
                      <span>WCAG {issue.criterionCode}</span>
                      <span>Level {issue.wcagLevel}</span>
                      <span>{issue.detectedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="space-y-3">
          {selectedIssue ? (
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>Chi tiết Issue</h4>
                <button onClick={() => setSelectedIssue(null)} className="text-gray-300 hover:text-gray-500 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>Tiêu đề</p>
                  <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{selectedIssue.title}</p>
                </div>
                <div>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>WCAG Criterion</p>
                  <p className="text-gray-700" style={{ fontSize: "12px" }}>{selectedIssue.criterionCode} — {selectedIssue.criterion} (Level {selectedIssue.wcagLevel})</p>
                </div>
                <div>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>Mô tả</p>
                  <p className="text-gray-600" style={{ fontSize: "11px" }}>{selectedIssue.description}</p>
                </div>
                <div>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>Element</p>
                  <code className="block bg-gray-50 rounded-lg px-2.5 py-1.5 text-[#990803] border border-gray-100" style={{ fontSize: "10px" }}>{selectedIssue.element}</code>
                </div>
                <div className="p-2.5 bg-green-50 border border-green-100 rounded-lg">
                  <p className="text-green-600 mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>💡 Đề xuất sửa</p>
                  <p className="text-green-700" style={{ fontSize: "11px" }}>{selectedIssue.recommendation}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { import("sonner").then(m => m.toast.success("Đã đánh dấu lỗi đã sửa!")); }} className="flex-1 py-1.5 bg-[#990803] text-white rounded-lg cursor-pointer" style={{ fontSize: "11px", fontWeight: 500 }}>Đánh dấu Đã sửa</button>
                  <button onClick={() => { import("sonner").then(m => m.toast.info("Đã bỏ qua lỗi này.")); }} className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg cursor-pointer" style={{ fontSize: "11px" }}>Bỏ qua</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-gray-400 text-center py-8" style={{ fontSize: "11px" }}>Click một issue để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Courses Tab ───
function CoursesTab({ scores }: { scores: CourseScore[] }) {
  const SCORE_CFG: Record<string, { color: string; label: string }> = {
    pass: { color: "#16a34a", label: "Đạt" },
    warning: { color: "#c8a84e", label: "Cần cải thiện" },
    fail: { color: "#ef4444", label: "Không đạt" },
  };

  return (
    <div className="space-y-3">
      <p className="text-gray-500" style={{ fontSize: "12px" }}>{scores.length} khóa học đã quét — Pass ≥85, Warning ≥70, Fail &lt;70</p>
      <div className="space-y-2">
        {scores.sort((a, b) => a.score - b.score).map(c => {
          const st = SCORE_CFG[c.status];
          return (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                {/* Score circle */}
                <div className="relative w-14 h-14 shrink-0">
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke={st.color} strokeWidth="4" strokeDasharray={`${(c.score / 100) * 150.8} 150.8`} strokeLinecap="round" transform="rotate(-90 28 28)" opacity="0.7" />
                    <text x="28" y="26" textAnchor="middle" dominantBaseline="central" fill={st.color} style={{ fontSize: "14px", fontWeight: 700 }}>{c.score}</text>
                    <text x="28" y="38" textAnchor="middle" fill="#9ca3af" style={{ fontSize: "6px" }}>/100</text>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{c.courseName}</h4>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: st.color, backgroundColor: st.color + "10" }}>{st.label}</span>
                  </div>
                  <p className="text-gray-400 mb-1.5" style={{ fontSize: "10px" }}>📍 {c.subsidiary} • 📅 Quét: {c.lastScan}</p>
                  <div className="flex items-center gap-3" style={{ fontSize: "10px" }}>
                    <span className="text-gray-500">Tổng: <span style={{ fontWeight: 600 }}>{c.totalIssues}</span></span>
                    {c.critical > 0 && <span className="text-red-500">🔴 Nghiêm trọng: {c.critical}</span>}
                    {c.major > 0 && <span className="text-orange-500">🟠 Quan trọng: {c.major}</span>}
                    {c.minor > 0 && <span className="text-amber-500">🟡 Nhỏ: {c.minor}</span>}
                  </div>
                </div>
                <button onClick={() => { import("sonner").then(m => m.toast.info(`Đang quét lại "${c.courseName}"...`)); }} className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "11px" }}>Quét lại</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Guidelines Reference Tab ───
function GuidelinesTab() {
  const guidelines = [
    { principle: "1. Perceivable", color: "#990803", criteria: [
      { code: "1.1.1", name: "Non-text Content", level: "A", desc: "Cung cấp text thay thế cho nội dung không phải text" },
      { code: "1.2.2", name: "Captions", level: "A", desc: "Phụ đề cho audio/video đã thu sẵn" },
      { code: "1.3.1", name: "Info and Relationships", level: "A", desc: "Cấu trúc nội dung truyền tải bằng markup" },
      { code: "1.4.3", name: "Contrast (Minimum)", level: "AA", desc: "Tỉ lệ tương phản ≥4.5:1 cho text bình thường" },
      { code: "1.4.4", name: "Resize Text", level: "AA", desc: "Phóng to text 200% không mất nội dung" },
      { code: "1.4.5", name: "Images of Text", level: "AA", desc: "Dùng text thật thay vì hình ảnh chứa text" },
    ]},
    { principle: "2. Operable", color: "#c8a84e", criteria: [
      { code: "2.1.1", name: "Keyboard", level: "A", desc: "Mọi chức năng hoạt động bằng bàn phím" },
      { code: "2.4.7", name: "Focus Visible", level: "AA", desc: "Focus indicator rõ ràng cho keyboard navigation" },
    ]},
    { principle: "3. Understandable", color: "#2563eb", criteria: [
      { code: "3.1.1", name: "Language of Page", level: "A", desc: "Khai báo ngôn ngữ chính của trang" },
      { code: "3.1.5", name: "Reading Level", level: "AAA", desc: "Nội dung phù hợp trình độ đọc phổ thông" },
      { code: "3.3.1", name: "Error Identification", level: "A", desc: "Mô tả lỗi rõ ràng, không chỉ dùng màu" },
    ]},
    { principle: "4. Robust", color: "#16a34a", criteria: [
      { code: "4.1.1", name: "Parsing", level: "A", desc: "HTML hợp lệ, ID duy nhất" },
    ]},
  ];

  return (
    <div className="space-y-3">
      <p className="text-gray-500" style={{ fontSize: "12px" }}>Tham chiếu nhanh WCAG 2.1 — các tiêu chí liên quan đến e-learning</p>
      {guidelines.map(g => (
        <div key={g.principle} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: g.color + "08", borderBottom: `2px solid ${g.color}20` }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
            <h3 style={{ fontSize: "13px", fontWeight: 600, color: g.color }}>{g.principle}</h3>
            <span className="text-gray-300 ml-auto" style={{ fontSize: "10px" }}>{g.criteria.length} criteria</span>
          </div>
          <div className="divide-y divide-gray-100">
            {g.criteria.map(cr => {
              const issueCount = ISSUES.filter(i => i.criterionCode === cr.code).length;
              return (
                <div key={cr.code} className="px-4 py-2.5 flex items-center gap-3">
                  <code className="px-2 py-0.5 bg-gray-50 rounded text-gray-500 shrink-0" style={{ fontSize: "10px", fontWeight: 600 }}>{cr.code}</code>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700" style={{ fontSize: "11px", fontWeight: 500 }}>{cr.name}</p>
                    <p className="text-gray-400" style={{ fontSize: "10px" }}>{cr.desc}</p>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-white shrink-0" style={{ fontSize: "9px", fontWeight: 700, backgroundColor: cr.level === "A" ? "#16a34a" : cr.level === "AA" ? "#c8a84e" : "#7c3aed" }}>
                    {cr.level}
                  </span>
                  {issueCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-500 shrink-0" style={{ fontSize: "9px", fontWeight: 600 }}>{issueCount} issues</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}