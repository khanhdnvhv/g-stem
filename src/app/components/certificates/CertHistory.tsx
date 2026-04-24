import { useState, useMemo } from "react";
import {
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, BookOpen,
  Clock, Award, Filter, Search, Calendar, Download,
  ChevronDown, ArrowUpRight, Target, Shield,
} from "lucide-react";

// ── Timeline events ──
const ALL_EVENTS = [
  { id: "H01", date: "2026-03-10", type: "issued", title: "Chung chi An toan Lao dong trong XD & KK", detail: "Cap tu dong sau khi dat 85% bai thi certification. Duoc GV Hoang Thi Lan xac nhan.", certNo: "GXC-ATLD-2026-00012", course: "An toan Lao dong trong XD & KK", score: 85, validity: "1 nam", expiryDate: "2027-03-10" },
  { id: "H02", date: "2026-02-15", type: "issued", title: "Chung chi Ky nang Lanh dao cho QL Cap trung", detail: "Duoc phe duyet boi BGD Tap doan. Qua trinh xet duyet 5 ngay.", certNo: "GXC-LD-2026-00089", course: "Ky nang Lanh dao cho QL Cap trung", score: 92, validity: "2 nam", expiryDate: "2028-02-15" },
  { id: "H03", date: "2026-01-20", type: "renewed", title: "Gia han CC Phong chong Rua tien (AML)", detail: "Thi lai dat 90%. Gia han them 1 nam tu 20/01/2026.", certNo: "GXC-AML-2026-00045", course: "Phong chong Rua tien (AML)", score: 90, validity: "1 nam", expiryDate: "2027-01-20" },
  { id: "H04", date: "2025-12-10", type: "issued", title: "Chung chi Onboarding - Chao mung Thanh vien moi", detail: "Hoan thanh khoa chao mung. Cap tu dong khong can phe duyet.", certNo: "GXC-OB-2025-00234", course: "Onboarding", score: 95, validity: "Vinh vien", expiryDate: "" },
  { id: "H05", date: "2025-11-01", type: "expiring", title: "CC Phong chong Rua tien sap het han", detail: "Con 30 ngay. Can thi lai de gia han. Dang ky thi lai tai muc 'Lich thi'.", certNo: "GXC-AML-2025-00045", course: "Phong chong Rua tien (AML)", score: 82, validity: "1 nam", expiryDate: "2025-12-01" },
  { id: "H06", date: "2025-09-15", type: "issued", title: "Chung chi Quan tri Rui ro & Kiem soat NB", detail: "Phe duyet boi Giam doc khoi. Yeu cau thi certification va GV xac nhan.", certNo: "GXC-QTRR-2025-00156", course: "Quan tri Rui ro & Kiem soat NB", score: 88, validity: "2 nam", expiryDate: "2027-09-15" },
  { id: "H07", date: "2025-08-01", type: "expired", title: "CC ISO 9001:2015 da het han", detail: "Hieu luc 1 nam. Can dao tao lai va thi certification moi.", certNo: "GXC-ISO-2024-00156", course: "ISO 9001:2015 - Quan ly Chat luong", score: 76, validity: "1 nam", expiryDate: "2025-08-01" },
  { id: "H08", date: "2025-06-20", type: "renewed", title: "Gia han CC An toan Mo & Van hanh Khai thac", detail: "Thi lai dat 90%. Gia han them 1 nam. Ket qua duoc GV xac nhan.", certNo: "GXC-ATM-2025-00078", course: "An toan Mo & Van hanh Khai thac", score: 90, validity: "1 nam", expiryDate: "2026-06-20" },
  { id: "H09", date: "2025-05-10", type: "issued", title: "Chung chi Phan tich Tai chinh Doanh nghiep", detail: "Hoan thanh khoa hoc va dat yeu cau thi. Phe duyet boi Quan ly truc tiep.", certNo: "GXC-TC-2025-00067", course: "Phan tich Tai chinh DN", score: 83, validity: "2 nam", expiryDate: "2027-05-10" },
  { id: "H10", date: "2025-03-15", type: "issued", title: "Chung chi Marketing so & Truyen thong TH", detail: "Cap tu dong sau khi hoan thanh 100% va dat diem >=70%.", certNo: "GXC-MKT-2025-00034", course: "Marketing so & Truyen thong TH", score: 87, validity: "2 nam", expiryDate: "2027-03-15" },
  { id: "H11", date: "2025-01-08", type: "expired", title: "CC Chuyen doi so DN da het han", detail: "Hieu luc 1 nam. Lien he phong Dao tao de dang ky khoa moi.", certNo: "GXC-CDS-2024-00112", course: "Chuyen doi so DN", score: 74, validity: "1 nam", expiryDate: "2025-01-08" },
  { id: "H12", date: "2024-11-20", type: "issued", title: "Chung chi Chuyen doi so Doanh nghiep", detail: "Hoan thanh khoa va duoc GV xac nhan nang luc thuc te.", certNo: "GXC-CDS-2024-00112", course: "Chuyen doi so DN", score: 74, validity: "1 nam", expiryDate: "2025-11-20" },
];

type EventType = "all" | "issued" | "expiring" | "expired" | "renewed";

const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  issued: { color: "#22c55e", bg: "#22c55e10", icon: CheckCircle2, label: "Da cap" },
  expiring: { color: "#f59e0b", bg: "#f59e0b10", icon: AlertTriangle, label: "Sap het han" },
  expired: { color: "#ef4444", bg: "#ef444410", icon: XCircle, label: "Het han" },
  renewed: { color: "#3b82f6", bg: "#3b82f610", icon: RefreshCw, label: "Gia han" },
};

export function CertHistory() {
  const [typeFilter, setTypeFilter] = useState<EventType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return ALL_EVENTS.filter(evt => {
      const matchType = typeFilter === "all" || evt.type === typeFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || evt.title.toLowerCase().includes(q) || evt.certNo.toLowerCase().includes(q) || evt.course.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [typeFilter, searchQuery]);

  // Summary stats
  const stats = useMemo(() => ({
    total: ALL_EVENTS.filter(e => e.type === "issued" || e.type === "renewed").length,
    active: ALL_EVENTS.filter(e => (e.type === "issued" || e.type === "renewed") && e.expiryDate && new Date(e.expiryDate) > new Date()).length + ALL_EVENTS.filter(e => e.type === "issued" && !e.expiryDate).length,
    expiring: ALL_EVENTS.filter(e => e.type === "expiring").length,
    expired: ALL_EVENTS.filter(e => e.type === "expired").length,
    renewed: ALL_EVENTS.filter(e => e.type === "renewed").length,
  }), []);

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Tong nhan", value: stats.total, icon: Award, color: "#990803", filter: "all" as EventType },
          { label: "Dang hieu luc", value: stats.active, icon: CheckCircle2, color: "#22c55e", filter: "issued" as EventType },
          { label: "Sap het han", value: stats.expiring, icon: AlertTriangle, color: "#f59e0b", filter: "expiring" as EventType },
          { label: "Da het han", value: stats.expired, icon: XCircle, color: "#ef4444", filter: "expired" as EventType },
          { label: "Da gia han", value: stats.renewed, icon: RefreshCw, color: "#3b82f6", filter: "renewed" as EventType },
        ].map(card => (
          <button
            key={card.label}
            onClick={() => setTypeFilter(typeFilter === card.filter ? "all" : card.filter)}
            className={`bg-card rounded-xl border p-3.5 text-left transition-all cursor-pointer hover:shadow-md ${typeFilter === card.filter && card.filter !== "all" ? `border-2 shadow-sm` : "border-border"}`}
            style={typeFilter === card.filter && card.filter !== "all" ? { borderColor: card.color } : {}}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${card.color}10` }}>
                <card.icon className="w-3.5 h-3.5" style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>{card.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{card.label}</p>
          </button>
        ))}
      </div>

      {/* Search & filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tim theo ten chung chi, ma so, khoa hoc..."
            className="w-full pl-10 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none"
            style={{ fontSize: "13px" }}
          />
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
          {([
            { value: "all" as EventType, label: "Tat ca" },
            { value: "issued" as EventType, label: "Da cap", color: "#22c55e" },
            { value: "renewed" as EventType, label: "Gia han", color: "#3b82f6" },
            { value: "expiring" as EventType, label: "Sap het", color: "#f59e0b" },
            { value: "expired" as EventType, label: "Het han", color: "#ef4444" },
          ]).map(opt => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${typeFilter === opt.value ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              style={{ fontSize: "11px", fontWeight: typeFilter === opt.value ? 600 : 400 }}
            >
              {opt.color && <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ background: opt.color }} />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
            Dong thoi gian Chung chi
          </h3>
          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{filtered.length} su kien</span>
        </div>

        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

          <div className="space-y-5">
            {filtered.map(evt => {
              const cfg = TYPE_CONFIG[evt.type] || TYPE_CONFIG.issued;
              const Icon = cfg.icon;
              const isExpanded = expandedId === evt.id;
              const dateStr = new Date(evt.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

              return (
                <div key={evt.id} className="relative">
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10"
                    style={{ background: cfg.bg, border: `2px solid ${cfg.color}` }}
                  >
                    <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                  </div>

                  {/* Event card */}
                  <div
                    className={`rounded-xl border transition-all ${isExpanded ? "border-[#990803]/15 shadow-md bg-card" : "border-border bg-secondary/30 hover:shadow-sm"}`}
                  >
                    {/* Main row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : evt.id)}
                      className="w-full p-4 text-left cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{evt.title}</h4>
                            <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: cfg.color, background: cfg.bg }}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{evt.detail}</p>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Ma: <strong className="text-foreground font-mono">{evt.certNo}</strong></span>
                            {evt.score && (
                              <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Diem: <strong className="text-[#990803]">{evt.score}%</strong></span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{dateStr}</span>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t border-border">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                          <DetailCard icon={BookOpen} label="Khoa hoc" value={evt.course} />
                          <DetailCard icon={Target} label="Diem dat" value={`${evt.score}%`} />
                          <DetailCard icon={Clock} label="Hieu luc" value={evt.validity} />
                          <DetailCard icon={Calendar} label="Het han" value={evt.expiryDate ? new Date(evt.expiryDate).toLocaleDateString("vi-VN") : "Vinh vien"} />
                        </div>

                        {/* Expiry status bar */}
                        {evt.expiryDate && (
                          <div className="mt-3">
                            {(() => {
                              const now = new Date();
                              const expiry = new Date(evt.expiryDate);
                              const issued = new Date(evt.date);
                              const totalDays = Math.max(1, (expiry.getTime() - issued.getTime()) / 86400000);
                              const elapsed = Math.max(0, (now.getTime() - issued.getTime()) / 86400000);
                              const remaining = Math.max(0, (expiry.getTime() - now.getTime()) / 86400000);
                              const pct = Math.min(100, (elapsed / totalDays) * 100);
                              const isValid = remaining > 0;
                              const barColor = remaining > 90 ? "#22c55e" : remaining > 30 ? "#f59e0b" : "#ef4444";
                              return (
                                <div className="p-3 bg-secondary/30 rounded-lg">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Tien do hieu luc</span>
                                    <span style={{ fontSize: "10px", fontWeight: 600, color: barColor }}>
                                      {isValid ? `Con ${Math.round(remaining)} ngay` : "Da het han"}
                                    </span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {(evt.type === "issued" || evt.type === "renewed") && (
                            <>
                              <button onClick={() => { import("sonner").then(m => m.toast.success("Đang tải PDF chứng chỉ...")); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer" style={{ fontSize: "11px", fontWeight: 600 }}>
                                <Download className="w-3 h-3" /> Tai PDF
                              </button>
                              <button onClick={() => { import("sonner").then(m => m.toast.success("Chứng chỉ hợp lệ và đang có hiệu lực!")); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "11px" }}>
                                <Shield className="w-3 h-3" /> Xac thuc
                              </button>
                              <button onClick={() => { import("sonner").then(m => m.toast.success("Đã sao chép link chia sẻ chứng chỉ!")); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "11px" }}>
                                <ArrowUpRight className="w-3 h-3" /> Chia se
                              </button>
                            </>
                          )}
                          {evt.type === "expiring" && (
                            <button onClick={() => { import("sonner").then(m => m.toast.info("Đang chuyển đến trang đăng ký thi lại...")); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer" style={{ fontSize: "11px", fontWeight: 600 }}>
                              <RefreshCw className="w-3 h-3" /> Dang ky thi lai
                            </button>
                          )}
                          {evt.type === "expired" && (
                            <button onClick={() => { import("sonner").then(m => m.toast.info("Đang chuyển đến trang đăng ký đào tạo lại...")); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c8a84e] text-[#3a1200] rounded-lg hover:bg-[#b89a40] transition-colors cursor-pointer" style={{ fontSize: "11px", fontWeight: 600 }}>
                              <BookOpen className="w-3 h-3" /> Dang ky dao tao lai
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="mt-3 text-foreground" style={{ fontSize: "14px", fontWeight: 500 }}>Khong tim thay su kien nao</p>
            <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>Thu thay doi bo loc hoac tu khoa tim kiem</p>
          </div>
        )}
      </div>

      {/* Renewal reminder */}
      {stats.expiring > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-amber-800" style={{ fontSize: "13px", fontWeight: 700 }}>Nhac nho Gia han</h4>
            <p className="text-amber-700 mt-0.5" style={{ fontSize: "12px" }}>
              Ban co <strong>{stats.expiring}</strong> chung chi sap het han. Hay dang ky thi lai hoac dao tao lai de duy tri hieu luc chung chi.
            </p>
            <button onClick={() => { import("sonner").then(m => m.toast.info("Đang hiển thị danh sách chứng chỉ cần gia hạn...")); }} className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors cursor-pointer" style={{ fontSize: "11px", fontWeight: 600 }}>
              <RefreshCw className="w-3 h-3" /> Xem chung chi can gia han
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-3 bg-secondary/30 rounded-lg">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <span className="text-muted-foreground" style={{ fontSize: "9px" }}>{label}</span>
      </div>
      <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{value}</p>
    </div>
  );
}