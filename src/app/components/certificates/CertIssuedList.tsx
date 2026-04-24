import { useState, useMemo } from "react";
import {
  Search, Eye, Download, Award, CheckCircle2, Clock, XCircle,
  Building2, Calendar, Target, Hash, Shield, Copy, Mail,
  Send, RefreshCw, ArrowLeft, Printer, Share2, Filter,
  Grid3X3, List, ChevronDown, MoreVertical, X,
  BookOpen, GraduationCap, ExternalLink,
} from "lucide-react";
import { MOCK_CERT_RECORDS } from "./cert-mock-data";
import { DEFAULT_TEMPLATES, CertificatePreviewSVG, CertMiniPreview, STATUS_CONFIG } from "./CertPreview";
import type { CertRecord } from "./CertPreview";
import { SUBSIDIARIES } from "../mock-data";
import { useAuth } from "../AuthContext";
import { useConfirm } from "../ConfirmDialog";
import { EmptyState } from "../EmptyState";

export function CertIssuedList() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const confirm = useConfirm();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subsidiaryFilter, setSubsidiaryFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCert, setSelectedCert] = useState<CertRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return MOCK_CERT_RECORDS.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || c.studentName.toLowerCase().includes(q) || c.certificateNo.toLowerCase().includes(q) || c.courseName.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchSub = subsidiaryFilter === "all" || c.subsidiary === subsidiaryFilter;
      return matchSearch && matchStatus && matchSub;
    });
  }, [searchQuery, statusFilter, subsidiaryFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(c => c.id)));
  };

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
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>{selectedCert.studentName}</h2>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full" style={{ fontSize: "11px", fontWeight: 600, color: stCfg.color, background: stCfg.bg }}>
                {stCfg.label}
              </span>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Số: {selectedCert.certificateNo}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { import("sonner").then(m => m.toast.info("Đang in chứng chỉ...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
              <Printer className="w-3.5 h-3.5" /> In
            </button>
            <button onClick={() => { import("sonner").then(m => m.toast.success("Đã sao chép link chia sẻ chứng chỉ!")); }} className="flex items-center gap-1.5 px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
              <Share2 className="w-3.5 h-3.5" /> Chia sẻ
            </button>
            <button onClick={() => { import("sonner").then(m => m.toast.success("Đang tải chứng chỉ PDF...")); }} className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>
              <Download className="w-3.5 h-3.5" /> Tải PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Preview */}
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

          {/* Info Panel */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>Thông tin chứng chỉ</h4>
              {[
                { icon: GraduationCap, label: "Học viên", value: selectedCert.studentName },
                { icon: Building2, label: "Đơn vị", value: selectedCert.subsidiary.length > 28 ? selectedCert.subsidiary.slice(0, 28) + "..." : selectedCert.subsidiary },
                { icon: BookOpen, label: "Phòng ban", value: selectedCert.department },
                { icon: Target, label: "Điểm đạt", value: `${selectedCert.score}% (Yêu cầu: ${selectedCert.passingScore}%)` },
                { icon: Calendar, label: "Hoàn thành", value: new Date(selectedCert.completedAt).toLocaleDateString("vi-VN") },
                { icon: Calendar, label: "Ngày cấp", value: new Date(selectedCert.issuedAt).toLocaleDateString("vi-VN") },
                { icon: Clock, label: "Hết hạn", value: new Date(selectedCert.expiryDate).toLocaleDateString("vi-VN") },
                { icon: Hash, label: "Số CC", value: selectedCert.certificateNo },
                { icon: Download, label: "Lượt tải", value: `${selectedCert.downloadCount} lần` },
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

            {/* Verification */}
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-green-800" style={{ fontSize: "12px", fontWeight: 600 }}>Xác thực</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="text" value={selectedCert.verificationUrl} readOnly className="flex-1 px-2 py-1.5 bg-white rounded-lg border border-green-200 text-green-700" style={{ fontSize: "10px" }} />
                <button onClick={() => { import("sonner").then(m => m.toast.success("Đã sao chép URL xác thực!")); }} className="p-1.5 bg-white rounded-lg border border-green-200 hover:bg-green-100 transition-colors cursor-pointer">
                  <Copy className="w-3.5 h-3.5 text-green-600" />
                </button>
              </div>
            </div>

            {/* Admin actions */}
            {isAdmin && (
              <div className="bg-card rounded-xl border border-border p-4 space-y-1.5">
                <h4 className="text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Thao tác</h4>
                {[
                  { icon: Mail, label: "Gửi email cho học viên", color: "#3b82f6" },
                  { icon: Send, label: "Gửi cho quản lý trực tiếp", color: "#8b5cf6" },
                  { icon: RefreshCw, label: "Cấp lại chứng chỉ", color: "#f59e0b" },
                  { icon: XCircle, label: "Thu hồi chứng chỉ", color: "#ef4444" },
                ].map(action => (
                  <button key={action.label} onClick={() => { import("sonner").then(m => m.toast.success(action.label)); }} className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer text-left" style={{ fontSize: "12px" }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${action.color}12` }}>
                      <action.icon className="w-3 h-3" style={{ color: action.color }} />
                    </div>
                    <span className="text-foreground" style={{ fontWeight: 500 }}>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main List ──
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm học viên, mã chứng chỉ, khóa học..."
              className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px" }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Trạng thái</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={subsidiaryFilter} onChange={e => setSubsidiaryFilter(e.target.value)} className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer max-w-[180px]" style={{ fontSize: "12px" }}>
              <option value="all">Đơn vị</option>
              {SUBSIDIARIES.map(s => <option key={s} value={s}>{s.length > 25 ? s.slice(0, 25) + "..." : s}</option>)}
            </select>
            <div className="flex gap-0.5 bg-secondary rounded-lg p-0.5">
              {(["list", "grid"] as const).map(v => (
                <button key={v} onClick={() => setViewMode(v)} className={`px-2.5 py-1.5 rounded-md cursor-pointer transition-all ${viewMode === v ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`} style={{ fontSize: "11px" }}>
                  {v === "list" ? <List className="w-3.5 h-3.5" /> : <Grid3X3 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}
              onClick={() => { import("sonner").then(m => m.toast.success(`Đang xuất ${filtered.length} chứng chỉ...`)); }}>
              <Download className="w-3.5 h-3.5" /> Xuất
            </button>
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="bg-[#990803]/5 rounded-xl border border-[#990803]/10 p-3 flex items-center gap-3 flex-wrap">
          <span className="text-[#990803]" style={{ fontSize: "12px", fontWeight: 600 }}>Đã chọn {selectedIds.size} chứng chỉ</span>
          <div className="flex gap-2 flex-wrap">
            <button className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer" style={{ fontSize: "11px" }}
              onClick={() => { import("sonner").then(m => m.toast.success(`Đang cấp lại ${selectedIds.size} chứng chỉ...`)); }}>Cấp lại</button>
            <button className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer" style={{ fontSize: "11px" }}
              onClick={async () => {
                const ok = await confirm({
                  title: `Thu hồi ${selectedIds.size} chứng chỉ?`,
                  message: `Bạn có chắc muốn thu hồi ${selectedIds.size} chứng chỉ đã chọn? Chứng chỉ sẽ chuyển sang trạng thái "Đã thu hồi" và link xác thực sẽ không còn hiệu lực.`,
                  confirmLabel: "Thu hồi",
                  variant: "danger",
                });
                if (ok) {
                  import("sonner").then(m => m.toast.success(`Đã thu hồi ${selectedIds.size} chứng chỉ`));
                  setSelectedIds(new Set());
                }
              }}>Thu hồi</button>
            <button className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer" style={{ fontSize: "11px" }}
              onClick={() => { import("sonner").then(m => m.toast.success(`Đang xuất PDF ${selectedIds.size} chứng chỉ...`)); }}>Xuất PDF</button>
            <button className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer" style={{ fontSize: "11px" }}
              onClick={() => { import("sonner").then(m => m.toast.success(`Đã gửi email ${selectedIds.size} chứng chỉ`)); setSelectedIds(new Set()); }}>Gửi email</button>
          </div>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto p-1 hover:bg-white rounded cursor-pointer">
            <X className="w-3.5 h-3.5 text-[#990803]" />
          </button>
        </div>
      )}

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{filtered.length} chứng chỉ</p>
        {isAdmin && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={selectedIds.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-[#990803]" />
            <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Chọn tất cả</span>
          </label>
        )}
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-card rounded-xl border border-border divide-y divide-border/50">
          {filtered.map(cert => {
            const stCfg = STATUS_CONFIG[cert.status];
            return (
              <div key={cert.id} className="flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors cursor-pointer" onClick={() => setSelectedCert(cert)}>
                {isAdmin && (
                  <input type="checkbox" checked={selectedIds.has(cert.id)} onChange={(e) => { e.stopPropagation(); toggleSelect(cert.id); }} onClick={e => e.stopPropagation()} className="w-3.5 h-3.5 rounded accent-[#990803] cursor-pointer shrink-0" />
                )}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h4 className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{cert.studentName}</h4>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0" style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color, background: stCfg.bg }}>
                      {stCfg.label}
                    </span>
                  </div>
                  <p className="text-muted-foreground truncate" style={{ fontSize: "11px" }}>{cert.courseName}</p>
                  <div className="flex items-center gap-3 mt-1 text-muted-foreground flex-wrap" style={{ fontSize: "10px" }}>
                    <span>{cert.certificateNo}</span>
                    <span>&bull;</span>
                    <span>{cert.subsidiary.length > 20 ? cert.subsidiary.slice(0, 20) + "..." : cert.subsidiary}</span>
                    <span>&bull;</span>
                    <span>Điểm: {cert.score}%</span>
                    <span>&bull;</span>
                    <span>Cấp: {new Date(cert.issuedAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={e => { e.stopPropagation(); setSelectedCert(cert); }} className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer" title="Xem">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); import("sonner").then(m => m.toast.success(`Đang tải PDF chứng chỉ ${cert.certificateNo}...`)); }} className="p-2 hover:bg-[#990803]/10 rounded-lg transition-colors cursor-pointer" title="Tải PDF">
                    <Download className="w-3.5 h-3.5 text-[#990803]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(cert => {
            const stCfg = STATUS_CONFIG[cert.status];
            const template = DEFAULT_TEMPLATES.find(t => t.id === cert.templateId) || DEFAULT_TEMPLATES[0];
            return (
              <div key={cert.id} onClick={() => setSelectedCert(cert)}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-[#990803]/10 transition-all cursor-pointer group">
                <div className="aspect-[1.414/1] bg-secondary/20 p-3">
                  <CertMiniPreview template={template} />
                </div>
                <div className="p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{cert.studentName}</h4>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, background: stCfg.bg }}>
                      {stCfg.label}
                    </span>
                  </div>
                  <p className="text-muted-foreground truncate" style={{ fontSize: "11px" }}>{cert.courseName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{cert.certificateNo}</span>
                    <span className="text-[#990803]" style={{ fontSize: "11px", fontWeight: 700 }}>{cert.score}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <EmptyState
          variant={searchQuery ? "search" : "empty"}
          title="Không tìm thấy chứng chỉ"
          message={searchQuery ? `Không có kết quả cho "${searchQuery}"` : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"}
          action={searchQuery ? { label: "Xóa bộ lọc", onClick: () => { setSearchQuery(""); setStatusFilter("all"); setSubsidiaryFilter("all"); } } : undefined}
        />
      )}
    </div>
  );
}