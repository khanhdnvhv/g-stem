import { useState } from "react";
import { copyToClipboard } from "../../utils/clipboard";
import {
  Award, Download, Eye, Share2, Printer, CheckCircle2,
  AlertTriangle, XCircle, Clock, Calendar, Shield, Copy,
  ExternalLink, ArrowLeft, X, Building2, Target, Hash,
  BookOpen, GraduationCap, Linkedin, Mail, Link2, QrCode,
  TrendingUp, RefreshCw,
} from "lucide-react";
import { MOCK_CERT_RECORDS } from "./cert-mock-data";
import { DEFAULT_TEMPLATES, CertificatePreviewSVG, STATUS_CONFIG } from "./CertPreview";
import type { CertRecord } from "./CertPreview";
import { toast } from "@/app/lib/toast";

export function CertMyCollection() {
  const [selectedCert, setSelectedCert] = useState<CertRecord | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "issued" | "expiring">("all");

  // Learner sees their own certs (mock: first 8)
  const myCerts = MOCK_CERT_RECORDS.slice(0, 8).map((c, i) => ({
    ...c,
    studentName: "Bạn",
    studentId: "current-user",
    // Make some expiring
    status: i === 3 ? "expired" as const : i === 5 ? "pending" as const : c.status,
  }));

  const issuedCount = myCerts.filter(c => c.status === "issued").length;
  const expiringCount = myCerts.filter(c => {
    const exp = new Date(c.expiryDate);
    const now = new Date();
    const soon = new Date(now.getTime() + 90 * 86400000);
    return c.status === "issued" && exp <= soon;
  }).length;

  const filteredCerts = myCerts.filter(c => {
    if (filter === "all") return true;
    if (filter === "issued") return c.status === "issued";
    if (filter === "expiring") {
      const exp = new Date(c.expiryDate);
      const now = new Date();
      const soon = new Date(now.getTime() + 90 * 86400000);
      return c.status === "issued" && exp <= soon;
    }
    return true;
  });

  // ── Detail View ──
  if (selectedCert) {
    const template = DEFAULT_TEMPLATES.find(t => t.id === selectedCert.templateId) || DEFAULT_TEMPLATES[0];
    const stCfg = STATUS_CONFIG[selectedCert.status];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setSelectedCert(null)} className="p-2 hover:bg-secondary rounded-xl transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>{selectedCert.courseName}</h2>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Số: {selectedCert.certificateNo}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowShareModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
              <Share2 className="w-3.5 h-3.5" /> Chia sẻ
            </button>
            <button onClick={() => { import("sonner").then(m => m.toast.info("Đang in chứng chỉ...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
              <Printer className="w-3.5 h-3.5" /> In
            </button>
            <button onClick={() => { import("sonner").then(m => m.toast.success("Đang tải chứng chỉ PDF...")); }} className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>
              <Download className="w-3.5 h-3.5" /> Tải PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-secondary/30 rounded-2xl border border-border p-6">
              <CertificatePreviewSVG
                template={template}
                studentName={selectedCert.studentName}
                courseName={selectedCert.courseName}
                score={selectedCert.score}
                issuedDate={new Date(selectedCert.issuedAt).toLocaleDateString("vi-VN")}
                expiryDate={new Date(selectedCert.expiryDate).toLocaleDateString("vi-VN")}
                certNo={selectedCert.certificateNo}
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Status */}
            <div className="rounded-xl border p-4" style={{ borderColor: `${stCfg.color}30`, background: stCfg.bg }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5" style={{ color: stCfg.color }} />
                <span style={{ fontSize: "14px", fontWeight: 700, color: stCfg.color }}>{stCfg.label}</span>
              </div>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                {selectedCert.status === "issued" ? "Chứng chỉ đang có hiệu lực" :
                 selectedCert.status === "expired" ? "Chứng chỉ đã hết hạn, cần gia hạn" :
                 selectedCert.status === "pending" ? "Đang chờ phê duyệt cấp" : "Chứng chỉ đã bị thu hồi"}
              </p>
            </div>

            {/* Info */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>Chi tiết</h4>
              {[
                { icon: BookOpen, label: "Khóa học", value: selectedCert.courseName },
                { icon: Target, label: "Điểm đạt", value: `${selectedCert.score}%` },
                { icon: Calendar, label: "Ngày cấp", value: new Date(selectedCert.issuedAt).toLocaleDateString("vi-VN") },
                { icon: Clock, label: "Hết hạn", value: new Date(selectedCert.expiryDate).toLocaleDateString("vi-VN") },
                { icon: Hash, label: "Mã CC", value: selectedCert.certificateNo },
                { icon: Building2, label: "Đơn vị", value: selectedCert.subsidiary.length > 25 ? selectedCert.subsidiary.slice(0, 25) + "..." : selectedCert.subsidiary },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{item.label}</p>
                    <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* QR Verify */}
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-green-800" style={{ fontSize: "12px", fontWeight: 600 }}>Xác thực QR</span>
              </div>
              <div className="flex items-center justify-center p-4 bg-white rounded-lg border border-green-100 mb-2">
                <svg viewBox="0 0 80 80" className="w-20 h-20">
                  {/* Simple QR pattern */}
                  <rect width="80" height="80" fill="white" />
                  {[
                    [0,0,24,24], [56,0,24,24], [0,56,24,24],
                    [8,8,8,8], [64,8,8,8], [8,64,8,8],
                    [28,0,4,4], [36,0,4,4], [44,0,4,4],
                    [28,8,4,4], [40,8,4,4],
                    [0,28,4,4], [0,36,4,4], [0,44,4,4],
                    [28,28,4,4], [36,28,4,4], [44,28,4,4],
                    [28,36,4,4], [44,36,4,4],
                    [28,44,4,4], [36,44,4,4], [44,44,4,4],
                    [56,28,4,4], [64,28,4,4], [72,28,4,4],
                    [56,36,4,4], [72,36,4,4],
                    [56,44,4,4], [56,56,4,4], [64,56,4,4],
                    [56,64,4,4], [64,64,4,4], [72,56,4,4],
                  ].map(([x, y, w, h], i) => (
                    <rect key={i} x={x} y={y} width={w} height={h} fill="#374151" />
                  ))}
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <input type="text" value={selectedCert.verificationUrl} readOnly className="flex-1 px-2 py-1.5 bg-white rounded-lg border border-green-200 text-green-700" style={{ fontSize: "9px" }} />
                <button onClick={() => { import("sonner").then(m => m.toast.success("Đã sao chép URL xác thực!")); }} className="p-1.5 bg-white rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
                  <Copy className="w-3 h-3 text-green-600" />
                </button>
              </div>
            </div>

            {/* Share actions */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-2">
              <h4 className="text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Chia sẻ</h4>
              {[
                { icon: Linkedin, label: "Chia sẻ lên LinkedIn", color: "#0077b5" },
                { icon: Mail, label: "Gửi qua Email", color: "#ea4335" },
                { icon: Link2, label: "Sao chép link xác thực", color: "#22c55e" },
              ].map(action => (
                <button key={action.label} onClick={() => { import("sonner").then(m => m.toast.success(action.label)); }} className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer text-left" style={{ fontSize: "12px" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${action.color}12` }}>
                    <action.icon className="w-3.5 h-3.5" style={{ color: action.color }} />
                  </div>
                  <span className="text-foreground" style={{ fontWeight: 500 }}>{action.label}</span>
                </button>
              ))}
            </div>

            {selectedCert.status === "expired" && (
              <button onClick={() => { import("sonner").then(m => m.toast.info("Đang chuyển đến trang đăng ký đào tạo lại...")); }} className="w-full flex items-center justify-center gap-2 py-3 bg-[#c8a84e] text-[#3a1200] rounded-xl hover:bg-[#b89a40] transition-colors cursor-pointer" style={{ fontSize: "13px", fontWeight: 600 }}>
                <RefreshCw className="w-4 h-4" /> Đăng ký đào tạo lại
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Wallet Grid ──
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setFilter(filter === "all" ? "all" : "all")}
          className={`bg-card rounded-xl border p-4 text-left transition-all hover:shadow-md cursor-pointer ${filter === "all" ? "border-[#990803]/30 shadow-sm" : "border-border"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#990803]/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#990803]" />
            </div>
            <div>
              <p className="text-foreground" style={{ fontSize: "24px", fontWeight: 700 }}>{myCerts.length}</p>
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Tổng chứng chỉ</p>
            </div>
          </div>
        </button>
        <button onClick={() => setFilter(filter === "issued" ? "all" : "issued")}
          className={`bg-card rounded-xl border p-4 text-left transition-all hover:shadow-md cursor-pointer ${filter === "issued" ? "border-green-300 shadow-sm" : "border-border"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-foreground" style={{ fontSize: "24px", fontWeight: 700 }}>{issuedCount}</p>
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Hợp lệ</p>
            </div>
          </div>
        </button>
        <button onClick={() => setFilter(filter === "expiring" ? "all" : "expiring")}
          className={`bg-card rounded-xl border p-4 text-left transition-all hover:shadow-md cursor-pointer ${filter === "expiring" ? "border-orange-300 shadow-sm" : "border-border"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-foreground" style={{ fontSize: "24px", fontWeight: 700 }}>{expiringCount}</p>
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Sắp hết hạn</p>
            </div>
          </div>
        </button>
      </div>

      {/* Quick actions */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
          {filteredCerts.length} chứng chỉ
        </p>
        <button onClick={() => { import("sonner").then(m => m.toast.success("Đang tải tất cả chứng chỉ PDF...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>
          <Download className="w-3.5 h-3.5" /> Tải tất cả PDF
        </button>
      </div>

      {/* Certificate Wallet Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCerts.map(cert => {
          const template = DEFAULT_TEMPLATES.find(t => t.id === cert.templateId) || DEFAULT_TEMPLATES[0];
          const stCfg = STATUS_CONFIG[cert.status];
          return (
            <div key={cert.id} onClick={() => setSelectedCert(cert)}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:border-[#990803]/20 hover:-translate-y-1 transition-all cursor-pointer group">
              {/* Mini cert visual */}
              <div className="relative aspect-[1.414/1] p-3" style={{ background: `linear-gradient(135deg, ${template.primaryColor}06, ${template.accentColor}08)` }}>
                <div className="w-full h-full rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
                  <svg className="w-full h-full" viewBox="0 0 200 141" preserveAspectRatio="xMidYMid meet">
                    <rect width="200" height="141" fill="white" />
                    {/* Simplified cert visual */}
                    {template.bgPattern === "border" && (
                      <rect x="4" y="4" width="192" height="133" fill="none" stroke={template.accentColor} strokeWidth="1" opacity="0.5" />
                    )}
                    {template.bgPattern === "gradient" && (
                      <rect x="0" y="0" width="200" height="2" fill={template.accentColor} />
                    )}
                    {template.hasLogo && (
                      <>
                        <circle cx="100" cy="22" r="8" fill={template.primaryColor} opacity="0.1" />
                        <text x="100" y="25" textAnchor="middle" fill={template.primaryColor} fontSize="7" fontWeight="800">G</text>
                      </>
                    )}
                    <text x="100" y="40" textAnchor="middle" fill={template.primaryColor} fontSize="4" letterSpacing="1" fontWeight="600">{template.headerText}</text>
                    <text x="100" y="50" textAnchor="middle" fill={template.primaryColor} fontSize="6" fontWeight="800">{template.subHeaderText}</text>
                    <line x1="65" y1="56" x2="135" y2="56" stroke={template.accentColor} strokeWidth="0.5" />
                    <text x="100" y="64" textAnchor="middle" fill="#9ca3af" fontSize="3.5">Chứng nhận rằng</text>
                    <text x="100" y="75" textAnchor="middle" fill={template.primaryColor} fontSize="7" fontWeight="700">
                      {cert.studentName === "Bạn" ? "Họ và Tên của bạn" : cert.studentName}
                    </text>
                    <text x="100" y="88" textAnchor="middle" fill="#6b7280" fontSize="3">đã hoàn thành khóa đào tạo</text>
                    <text x="100" y="96" textAnchor="middle" fill={template.primaryColor} fontSize="4" fontWeight="600">
                      {cert.courseName.length > 35 ? cert.courseName.slice(0, 35) + "..." : cert.courseName}
                    </text>
                    {template.hasSeal && (
                      <circle cx="100" cy="115" r="7" fill="none" stroke={template.accentColor} strokeWidth="0.5" opacity="0.4" />
                    )}
                    {template.hasQR && (
                      <rect x="176" y="122" width="12" height="12" rx="1" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="0.3" />
                    )}
                  </svg>
                </div>
                {/* Status badge overlay */}
                <div className="absolute top-4 right-4">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, background: "white", border: `1px solid ${stCfg.color}30` }}>
                    {stCfg.label}
                  </span>
                </div>
              </div>

              {/* Card info */}
              <div className="p-4 space-y-2">
                <h4 className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{cert.courseName}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{cert.certificateNo}</span>
                  <span className="text-[#990803]" style={{ fontSize: "12px", fontWeight: 700 }}>{cert.score}%</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: "10px" }}>
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(cert.issuedAt).toLocaleDateString("vi-VN")}</span>
                  <span>&rarr;</span>
                  <span>{new Date(cert.expiryDate).toLocaleDateString("vi-VN")}</span>
                </div>

                {/* Quick actions on hover */}
                <div className="flex gap-1.5 pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); toast.success(`Đang tải PDF chứng chỉ ${cert.certificateNo}...`); }} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "10px" }}>
                    <Download className="w-3 h-3" /> Tải
                  </button>
                  <button onClick={e => { e.stopPropagation(); copyToClipboard(cert.verificationUrl); toast.success("Đã sao chép link chứng chỉ!"); }} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "10px" }}>
                    <Share2 className="w-3 h-3" /> Chia sẻ
                  </button>
                  <button onClick={e => { e.stopPropagation(); setSelectedCert(cert); }} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#990803]/10 hover:bg-[#990803]/20 text-[#990803] transition-colors cursor-pointer" style={{ fontSize: "10px" }}>
                    <Eye className="w-3 h-3" /> Xem
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCerts.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Award className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="mt-3 text-foreground" style={{ fontSize: "15px", fontWeight: 500 }}>Chưa có chứng chỉ nào</p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>Hoàn thành khóa đào tạo để nhận chứng chỉ</p>
        </div>
      )}
    </div>
  );
}