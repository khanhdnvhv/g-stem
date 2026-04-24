import { useState, useMemo, useRef, useCallback } from "react";
import {
  Award, Download, Eye, Printer, Share2, Search, Filter, CheckCircle2,
  XCircle, Clock, Calendar, Users, Building2, FileText, Sparkles,
  ChevronDown, ChevronRight, ArrowLeft, RefreshCw, Settings,
  Palette, Layout, Type, Image, Shield, Star, Trophy, Zap,
  Mail, Send, Copy, ExternalLink, QrCode, Stamp,
  GraduationCap, BookOpen, Target, TrendingUp, Hash,
} from "lucide-react";
import { MOCK_EXAMS } from "./types";
import { SUBSIDIARIES, DEPARTMENTS } from "../mock-data";
import { toast } from "sonner";

// ── Types ──
interface CertificateRecord {
  id: string;
  examId: string;
  examTitle: string;
  examType: string;
  studentId: string;
  studentName: string;
  department: string;
  subsidiary: string;
  score: number;
  passingScore: number;
  completedAt: string;
  issuedAt: string;
  expiryDate: string;
  certificateNo: string;
  status: "issued" | "pending" | "expired" | "revoked";
  templateId: string;
  templateName: string;
  downloadCount: number;
  verificationUrl: string;
}

interface CertTemplate {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  style: "classic" | "modern" | "elegant" | "minimal";
  hasQR: boolean;
  hasSeal: boolean;
  hasLogo: boolean;
  bgPattern: string;
}

const STATUS_CONFIG = {
  issued: { label: "Đã cấp", color: "#22c55e", bg: "#22c55e15", icon: CheckCircle2 },
  pending: { label: "Chờ cấp", color: "#f59e0b", bg: "#f59e0b15", icon: Clock },
  expired: { label: "Hết hạn", color: "#6b7280", bg: "#6b728015", icon: XCircle },
  revoked: { label: "Thu hồi", color: "#ef4444", bg: "#ef444415", icon: XCircle },
};

// ── Templates ──
const CERT_TEMPLATES: CertTemplate[] = [
  { id: "T1", name: "Geleximco Classic", description: "Mẫu chứng chỉ truyền thống", primaryColor: "#990803", accentColor: "#c8a84e", style: "classic", hasQR: true, hasSeal: true, hasLogo: true, bgPattern: "border" },
  { id: "T2", name: "Modern Professional", description: "Mẫu hiện đại, chuyên nghiệp", primaryColor: "#1e293b", accentColor: "#3b82f6", style: "modern", hasQR: true, hasSeal: false, hasLogo: true, bgPattern: "gradient" },
  { id: "T3", name: "Elegant Gold", description: "Mẫu sang trọng viền vàng", primaryColor: "#1a1a2e", accentColor: "#c8a84e", style: "elegant", hasQR: true, hasSeal: true, hasLogo: true, bgPattern: "ornate" },
  { id: "T4", name: "Minimal Clean", description: "Mẫu tối giản", primaryColor: "#374151", accentColor: "#990803", style: "minimal", hasQR: false, hasSeal: false, hasLogo: true, bgPattern: "none" },
];

// ── Mock Certificate Data ──
function generateMockCertificates(): CertificateRecord[] {
  const names = [
    "Trần Văn Hùng", "Nguyễn Thị Lan", "Phạm Minh Tuấn", "Lê Hoàng Vũ",
    "Võ Thị Hạnh", "Hoàng Văn Đạt", "Đỗ Thị Mai", "Bùi Xuân Trường",
    "Nguyễn Văn An", "Trần Thị Bích", "Lê Văn Cường", "Phạm Thị Dương",
    "Vũ Hoàng Dũng", "Đặng Thị Hồng", "Đinh Văn Phú", "Trần Thanh Hoa",
    "Lê Minh Khôi", "Phạm Văn Long", "Nguyễn Thị Ngọc", "Hoàng Văn Phong",
  ];
  const statuses: CertificateRecord["status"][] = ["issued", "issued", "issued", "pending", "issued", "expired", "issued", "issued", "pending", "issued"];

  return names.map((name, i) => {
    const exam = MOCK_EXAMS[i % MOCK_EXAMS.length];
    const score = 70 + Math.floor(Math.random() * 30);
    const completedDate = new Date(2026, 0, 15 + i * 3);
    const issuedDate = new Date(completedDate.getTime() + 86400000);
    const expiryDate = new Date(issuedDate.getTime() + 365 * 86400000);

    return {
      id: `CERT-${String(i + 1).padStart(4, "0")}`,
      examId: exam.id,
      examTitle: exam.title,
      examType: exam.type,
      studentId: `U${String(100 + i).padStart(3, "0")}`,
      studentName: name,
      department: DEPARTMENTS[i % DEPARTMENTS.length],
      subsidiary: SUBSIDIARIES[i % SUBSIDIARIES.length],
      score,
      passingScore: exam.passingScore,
      completedAt: completedDate.toISOString().split("T")[0],
      issuedAt: issuedDate.toISOString().split("T")[0],
      expiryDate: expiryDate.toISOString().split("T")[0],
      certificateNo: `GXC-${2026}-${String(i + 1).padStart(5, "0")}`,
      status: statuses[i % statuses.length],
      templateId: CERT_TEMPLATES[i % CERT_TEMPLATES.length].id,
      templateName: CERT_TEMPLATES[i % CERT_TEMPLATES.length].name,
      downloadCount: Math.floor(Math.random() * 10),
      verificationUrl: `https://lms.geleximco.vn/verify/GXC-2026-${String(i + 1).padStart(5, "0")}`,
    };
  });
}

const MOCK_CERTIFICATES = generateMockCertificates();

// ── Certificate Preview ──
function CertificatePreview({ cert, template }: { cert: CertificateRecord; template: CertTemplate }) {
  return (
    <div className="relative bg-white rounded-xl overflow-hidden shadow-xl" style={{ aspectRatio: "1.414/1" }}>
      {/* Background pattern */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 566" preserveAspectRatio="xMidYMid slice">
        {/* Outer border */}
        <rect x="0" y="0" width="800" height="566" fill="white" />
        {template.bgPattern === "border" && (
          <>
            <rect x="15" y="15" width="770" height="536" fill="none" stroke={template.accentColor} strokeWidth="3" />
            <rect x="20" y="20" width="760" height="526" fill="none" stroke={template.accentColor} strokeWidth="1" opacity="0.4" />
            {/* Corner ornaments */}
            {[[30, 30], [770, 30], [30, 536], [770, 536]].map(([cx, cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r="8" fill="none" stroke={template.accentColor} strokeWidth="1.5" />
                <circle cx={cx} cy={cy} r="3" fill={template.accentColor} />
              </g>
            ))}
          </>
        )}
        {template.bgPattern === "gradient" && (
          <>
            <defs>
              <linearGradient id="bg-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={template.primaryColor} stopOpacity="0.03" />
                <stop offset="100%" stopColor={template.accentColor} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="800" height="566" fill="url(#bg-grad)" />
            <rect x="0" y="0" width="800" height="6" fill={template.accentColor} />
          </>
        )}
        {template.bgPattern === "ornate" && (
          <>
            <rect x="20" y="20" width="760" height="526" fill="none" stroke={template.accentColor} strokeWidth="2" />
            {/* Decorative top/bottom borders */}
            <path d="M100,20 Q400,50 700,20" fill="none" stroke={template.accentColor} strokeWidth="1" opacity="0.3" />
            <path d="M100,546 Q400,516 700,546" fill="none" stroke={template.accentColor} strokeWidth="1" opacity="0.3" />
          </>
        )}

        {/* Logo placeholder */}
        {template.hasLogo && (
          <g>
            <circle cx="400" cy="75" r="28" fill={template.primaryColor} opacity="0.1" />
            <text x="400" y="80" textAnchor="middle" fill={template.primaryColor} fontSize="18" fontWeight="800">G</text>
          </g>
        )}

        {/* Title */}
        <text x="400" y="125" textAnchor="middle" fill={template.primaryColor} fontSize="14" fontWeight="600" letterSpacing="4">TẬP ĐOÀN GELEXIMCO</text>
        <text x="400" y="165" textAnchor="middle" fill={template.primaryColor} fontSize="28" fontWeight="800">CHỨNG CHỈ ĐÀO TẠO</text>
        <text x="400" y="188" textAnchor="middle" fill={template.accentColor} fontSize="11" letterSpacing="2">TRAINING CERTIFICATE</text>

        {/* Divider */}
        <line x1="250" y1="205" x2="550" y2="205" stroke={template.accentColor} strokeWidth="1" />
        <circle cx="400" cy="205" r="3" fill={template.accentColor} />

        {/* Awarded to */}
        <text x="400" y="235" textAnchor="middle" fill="#6b7280" fontSize="11">Chứng nhận</text>
        <text x="400" y="275" textAnchor="middle" fill={template.primaryColor} fontSize="26" fontWeight="700">{cert.studentName}</text>
        <line x1="200" y1="285" x2="600" y2="285" stroke={template.accentColor} strokeWidth="0.5" />

        {/* Description */}
        <text x="400" y="315" textAnchor="middle" fill="#6b7280" fontSize="11">Đã hoàn thành xuất sắc khóa đào tạo</text>
        <text x="400" y="340" textAnchor="middle" fill={template.primaryColor} fontSize="14" fontWeight="600">"{cert.examTitle}"</text>
        <text x="400" y="365" textAnchor="middle" fill="#9ca3af" fontSize="10">Kết quả: {cert.score}% | Đạt chuẩn: {cert.passingScore}% | Công ty: {cert.subsidiary.length > 30 ? cert.subsidiary.slice(0, 30) + "..." : cert.subsidiary}</text>

        {/* Date & Certificate No */}
        <text x="400" y="400" textAnchor="middle" fill="#6b7280" fontSize="10">
          Ngày cấp: {new Date(cert.issuedAt).toLocaleDateString("vi-VN")} | Hiệu lực đến: {new Date(cert.expiryDate).toLocaleDateString("vi-VN")}
        </text>
        <text x="400" y="420" textAnchor="middle" fill={template.accentColor} fontSize="10" fontWeight="600">Số: {cert.certificateNo}</text>

        {/* Signatures */}
        <g>
          <line x1="120" y1="490" x2="300" y2="490" stroke="#d1d5db" strokeWidth="0.5" />
          <text x="210" y="505" textAnchor="middle" fill="#6b7280" fontSize="9">Giám đốc Đào tạo</text>
          <text x="210" y="480" textAnchor="middle" fill={template.primaryColor} fontSize="12" fontWeight="600" fontStyle="italic">Nguyễn Văn Minh</text>
        </g>
        <g>
          <line x1="500" y1="490" x2="680" y2="490" stroke="#d1d5db" strokeWidth="0.5" />
          <text x="590" y="505" textAnchor="middle" fill="#6b7280" fontSize="9">TGĐ Tập đoàn</text>
          <text x="590" y="480" textAnchor="middle" fill={template.primaryColor} fontSize="12" fontWeight="600" fontStyle="italic">Vũ Văn Tiền</text>
        </g>

        {/* Seal */}
        {template.hasSeal && (
          <g transform="translate(400,470)">
            <circle r="25" fill="none" stroke={template.accentColor} strokeWidth="1.5" opacity="0.5" />
            <circle r="20" fill="none" stroke={template.accentColor} strokeWidth="0.5" opacity="0.3" />
            <text textAnchor="middle" y="4" fill={template.accentColor} fontSize="8" fontWeight="700" opacity="0.5">SEAL</text>
          </g>
        )}

        {/* QR Code placeholder */}
        {template.hasQR && (
          <g transform="translate(730,500)">
            <rect x="-20" y="-20" width="40" height="40" rx="4" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="0.5" />
            <text textAnchor="middle" y="4" fill="#9ca3af" fontSize="7" fontWeight="600">QR</text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ── Main Component ──
export function CertificateGenerator() {
  const [certificates] = useState(MOCK_CERTIFICATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [examFilter, setExamFilter] = useState("all");
  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CertTemplate>(CERT_TEMPLATES[0]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const filtered = useMemo(() => {
    return certificates.filter(c => {
      const matchSearch = c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.certificateNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.examTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchExam = examFilter === "all" || c.examId === examFilter;
      return matchSearch && matchStatus && matchExam;
    });
  }, [certificates, searchQuery, statusFilter, examFilter]);

  const stats = useMemo(() => ({
    total: certificates.length,
    issued: certificates.filter(c => c.status === "issued").length,
    pending: certificates.filter(c => c.status === "pending").length,
    expired: certificates.filter(c => c.status === "expired").length,
    avgScore: Math.round(certificates.reduce((s, c) => s + c.score, 0) / (certificates.length || 1)),
    totalDownloads: certificates.reduce((s, c) => s + c.downloadCount, 0),
  }), [certificates]);

  // ── Detail / Preview ──
  if (selectedCert) {
    const template = CERT_TEMPLATES.find(t => t.id === selectedCert.templateId) || CERT_TEMPLATES[0];
    const statusCfg = STATUS_CONFIG[selectedCert.status];
    const StatusIcon = statusCfg.icon;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedCert(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-foreground">Chứng chỉ: {selectedCert.studentName}</h2>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full" style={{ fontSize: "11px", fontWeight: 600, color: statusCfg.color, background: statusCfg.bg }}>
                <StatusIcon className="w-3 h-3" /> {statusCfg.label}
              </span>
            </div>
            <p className="text-gray-500" style={{ fontSize: "12px" }}>Số: {selectedCert.certificateNo}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { import("sonner").then(m => m.toast.info("Đang in chứng chỉ...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
              <Printer className="w-3.5 h-3.5 text-gray-500" /> In
            </button>
            <button onClick={() => { import("sonner").then(m => m.toast.success("Đã sao chép link chia sẻ chứng chỉ!")); }} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
              <Share2 className="w-3.5 h-3.5 text-gray-500" /> Chia sẻ
            </button>
            <button onClick={() => { import("sonner").then(m => m.toast.success("Đang tải chứng chỉ PDF...")); }} className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#990803] to-[#7a0602] text-white rounded-xl hover:shadow-lg transition-all cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>
              <Download className="w-3.5 h-3.5" /> Tải PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
              <CertificatePreview cert={selectedCert} template={template} />
            </div>

            {/* Template selector */}
            <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Mẫu chứng chỉ</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CERT_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setSelectedTemplate(t)}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${selectedCert.templateId === t.id ? "border-[#990803] bg-[#990803]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="w-full aspect-[1.414/1] rounded-lg mb-2 overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.primaryColor}15, ${t.accentColor}15)` }}>
                      <div className="w-full h-full flex items-center justify-center">
                        <Award className="w-6 h-6" style={{ color: t.primaryColor }} />
                      </div>
                    </div>
                    <p className="text-gray-800 truncate" style={{ fontSize: "11px", fontWeight: 600 }}>{t.name}</p>
                    <p className="text-gray-400" style={{ fontSize: "9px" }}>{t.style}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
              <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Thông tin chứng chỉ</h3>
              {[
                { icon: GraduationCap, label: "Học viên", value: selectedCert.studentName },
                { icon: Building2, label: "Công ty", value: selectedCert.subsidiary.length > 25 ? selectedCert.subsidiary.slice(0, 25) + "..." : selectedCert.subsidiary },
                { icon: BookOpen, label: "Phòng ban", value: selectedCert.department },
                { icon: Target, label: "Điểm đạt", value: `${selectedCert.score}% (Yêu cầu: ${selectedCert.passingScore}%)` },
                { icon: Calendar, label: "Hoàn thành", value: new Date(selectedCert.completedAt).toLocaleDateString("vi-VN") },
                { icon: Calendar, label: "Ngày cấp", value: new Date(selectedCert.issuedAt).toLocaleDateString("vi-VN") },
                { icon: Clock, label: "Hết hạn", value: new Date(selectedCert.expiryDate).toLocaleDateString("vi-VN") },
                { icon: Hash, label: "Số chứng chỉ", value: selectedCert.certificateNo },
                { icon: Download, label: "Lượt tải", value: `${selectedCert.downloadCount} lần` },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-400" style={{ fontSize: "10px" }}>{item.label}</p>
                    <p className="text-gray-800 truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Verification */}
            <div className="bg-green-50 rounded-2xl border border-green-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-green-800" style={{ fontSize: "13px", fontWeight: 600 }}>Xác thực</span>
              </div>
              <p className="text-green-700 mb-2" style={{ fontSize: "11px" }}>Chứng chỉ có thể xác thực qua QR code hoặc link:</p>
              <div className="flex items-center gap-2">
                <input type="text" value={selectedCert.verificationUrl} readOnly
                  className="flex-1 px-2 py-1.5 bg-white rounded-lg border border-green-200 text-green-700" style={{ fontSize: "10px" }} />
                <button onClick={() => { import("sonner").then(m => m.toast.success("Đã sao chép URL xác thực!")); }} className="p-1.5 bg-white rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
                  <Copy className="w-3.5 h-3.5 text-green-600" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
              <h3 style={{ fontSize: "14px", fontWeight: 600 }} className="mb-3">Thao tác</h3>
              {[
                { icon: Mail, label: "Gửi email cho học viên", color: "#3b82f6" },
                { icon: Send, label: "Gửi cho quản lý trực tiếp", color: "#8b5cf6" },
                { icon: RefreshCw, label: "Cấp lại chứng chỉ", color: "#f59e0b" },
                { icon: XCircle, label: "Thu hồi chứng chỉ", color: "#ef4444" },
              ].map(action => (
                <button key={action.label}
                  onClick={() => { import("sonner").then(m => m.toast.success(action.label)); }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-left"
                  style={{ fontSize: "12px" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${action.color}12` }}>
                    <action.icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                  </div>
                  <span className="text-gray-700" style={{ fontWeight: 500 }}>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main List ──
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Tổng chứng chỉ", value: stats.total, icon: Award, color: "#990803" },
          { label: "Đã cấp", value: stats.issued, icon: CheckCircle2, color: "#22c55e" },
          { label: "Chờ cấp", value: stats.pending, icon: Clock, color: "#f59e0b" },
          { label: "Hết hạn", value: stats.expired, icon: XCircle, color: "#6b7280" },
          { label: "Điểm TB", value: `${stats.avgScore}%`, icon: Target, color: "#c8a84e" },
          { label: "Lượt tải", value: stats.totalDownloads, icon: Download, color: "#3b82f6" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3.5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${stat.color}12` }}>
                <stat.icon className="w-4.5 h-4.5" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-gray-800" style={{ fontSize: "22px", fontWeight: 800 }}>{stat.value}</p>
            <p className="text-gray-400" style={{ fontSize: "11px" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Auto-generation info */}
      <div className="bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/5 rounded-xl border border-[#990803]/10 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#990803]/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#990803]" />
          </div>
          <div>
            <h3 className="text-[#990803]" style={{ fontSize: "13px", fontWeight: 700 }}>Tự động cấp chứng chỉ</h3>
            <p className="text-gray-600 mt-0.5" style={{ fontSize: "12px" }}>
              Hệ thống tự động tạo và gửi chứng chỉ PDF khi học viên đạt bài thi certification. Chứng chỉ bao gồm QR code xác thực,
              chữ ký số, và được gửi qua email trong vòng 24h. Hỗ trợ 4 mẫu thiết kế tùy chỉnh.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm học viên, số chứng chỉ, đề thi..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:outline-none"
              style={{ fontSize: "13px" }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Trạng thái</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={examFilter} onChange={e => setExamFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Đề thi</option>
              {MOCK_EXAMS.filter(e => e.type === "certification").map(e => <option key={e.id} value={e.id}>{e.title.slice(0, 30)}</option>)}
            </select>
            <button onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
              style={{ fontSize: "12px", fontWeight: 500 }}>
              <Palette className="w-3.5 h-3.5" /> Mẫu
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#990803] to-[#7a0602] text-white rounded-xl hover:shadow-lg hover:shadow-[#990803]/20 transition-all cursor-pointer"
              style={{ fontSize: "12px", fontWeight: 600 }}
              onClick={() => toast.success(`Đang xuất tất cả ${filtered.length} chứng chỉ...`)}>
              <Download className="w-3.5 h-3.5" /> Xuất tất cả
            </button>
          </div>
        </div>
      </div>

      {/* Template selector dropdown */}
      {showTemplateSelector && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Chọn mẫu mặc định</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CERT_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => { setSelectedTemplate(t); setShowTemplateSelector(false); }}
                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${selectedTemplate.id === t.id ? "border-[#990803] bg-[#990803]/5" : "border-gray-200 hover:border-gray-300"}`}>
                <div className="w-full aspect-[1.414/1] rounded-lg mb-2" style={{ background: `linear-gradient(135deg, ${t.primaryColor}15, ${t.accentColor}15)` }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <Award className="w-8 h-8" style={{ color: t.primaryColor }} />
                  </div>
                </div>
                <p className="text-gray-800" style={{ fontSize: "12px", fontWeight: 600 }}>{t.name}</p>
                <p className="text-gray-400" style={{ fontSize: "10px" }}>{t.description}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: t.primaryColor }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: t.accentColor }} />
                  {t.hasQR && <span className="text-gray-400" style={{ fontSize: "9px" }}>QR</span>}
                  {t.hasSeal && <span className="text-gray-400" style={{ fontSize: "9px" }}>Seal</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results count + view toggle */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500" style={{ fontSize: "12px" }}>{filtered.length} chứng chỉ</p>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(["list", "grid"] as const).map(v => (
            <button key={v} onClick={() => setViewMode(v)}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${viewMode === v ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`}
              style={{ fontSize: "11px", fontWeight: 500 }}>
              {v === "list" ? "Danh sách" : "Lưới"}
            </button>
          ))}
        </div>
      </div>

      {/* List view */}
      {viewMode === "list" && (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map(cert => {
            const statusCfg = STATUS_CONFIG[cert.status];
            const StatusIcon = statusCfg.icon;
            return (
              <div key={cert.id} onClick={() => setSelectedCert(cert)}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                {/* Certificate icon */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-gray-800 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{cert.studentName}</h4>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0" style={{ fontSize: "10px", fontWeight: 600, color: statusCfg.color, background: statusCfg.bg }}>
                      <StatusIcon className="w-3 h-3" /> {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-gray-500 truncate" style={{ fontSize: "11px" }}>{cert.examTitle}</p>
                  <div className="flex items-center gap-3 mt-1 text-gray-400" style={{ fontSize: "10px" }}>
                    <span>{cert.certificateNo}</span>
                    <span>&bull;</span>
                    <span>{cert.subsidiary.length > 20 ? cert.subsidiary.slice(0, 20) + "..." : cert.subsidiary}</span>
                    <span>&bull;</span>
                    <span>Điểm: {cert.score}%</span>
                    <span>&bull;</span>
                    <span>Cấp: {new Date(cert.issuedAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={e => { e.stopPropagation(); setSelectedCert(cert); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Xem">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); toast.success(`Đang tải PDF chứng chỉ ${cert.certificateNo}...`); }} className="p-2 hover:bg-[#990803]/10 rounded-lg transition-colors cursor-pointer" title="Tải PDF">
                    <Download className="w-3.5 h-3.5 text-[#990803]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grid view */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(cert => {
            const statusCfg = STATUS_CONFIG[cert.status];
            const StatusIcon = statusCfg.icon;
            const template = CERT_TEMPLATES.find(t => t.id === cert.templateId) || CERT_TEMPLATES[0];
            return (
              <div key={cert.id} onClick={() => setSelectedCert(cert)}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-[#990803]/10 transition-all cursor-pointer group">
                {/* Mini certificate preview */}
                <div className="aspect-[1.414/1] bg-gray-50 p-3">
                  <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200" style={{ background: `linear-gradient(135deg, ${template.primaryColor}08, ${template.accentColor}08)` }}>
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${template.primaryColor}15` }}>
                        <span style={{ fontSize: "8px", fontWeight: 800, color: template.primaryColor }}>G</span>
                      </div>
                      <span className="text-gray-400" style={{ fontSize: "7px", letterSpacing: "1px" }}>CHỨNG CHỈ ĐÀO TẠO</span>
                      <span className="text-gray-800 text-center" style={{ fontSize: "9px", fontWeight: 700 }}>{cert.studentName}</span>
                      <div className="w-8 h-px bg-gray-200 my-0.5" />
                      <span className="text-gray-500 text-center truncate w-full" style={{ fontSize: "6px" }}>{cert.examTitle}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-gray-800 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{cert.studentName}</h4>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0" style={{ fontSize: "9px", fontWeight: 600, color: statusCfg.color, background: statusCfg.bg }}>
                      <StatusIcon className="w-3 h-3" /> {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-gray-500 truncate" style={{ fontSize: "11px" }}>{cert.examTitle}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-400" style={{ fontSize: "10px" }}>{cert.certificateNo}</span>
                    <span className="text-[#990803]" style={{ fontSize: "11px", fontWeight: 700 }}>{cert.score}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}