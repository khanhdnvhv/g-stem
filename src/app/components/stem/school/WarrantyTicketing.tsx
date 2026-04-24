import { useState, useMemo } from "react";
import {
  Wrench, Plus, Camera, Search, Eye, Clock, X, Upload,
  CheckCircle2, AlertTriangle,
} from "lucide-react";
import { ticketsBySchool, equipmentBySchool, tenantsByType } from "../../mock-data/index";
import type { WarrantyTicket, Equipment } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import {
  WarrantyStatusBadge, WARRANTY_STATUS_META, WARRANTY_STATUS_LIST,
} from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatDateTime, formatRelative } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  WARRANTY TICKETING (School) — trường tạo và theo dõi ticket      */
/* ================================================================ */

function CreateTicketDialog({
  equipment, onClose, onSubmit,
}: {
  equipment: Equipment[]; onClose: () => void;
  onSubmit: (eqId: string, issue: string) => void;
}) {
  const [eqId, setEqId] = useState(equipment[0]?.id || "");
  const [issue, setIssue] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const selectedEq = equipment.find((e) => e.id === eqId);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 style={{ fontSize: "16px", fontWeight: 700 }}>Tạo yêu cầu bảo hành</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>THIẾT BỊ *</label>
            <select
              value={eqId} onChange={(e) => setEqId(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
              style={{ fontSize: "13px" }}
            >
              {equipment.map((e) => (
                <option key={e.id} value={e.id}>{e.name} — {e.serial} — {e.location}</option>
              ))}
            </select>
            {selectedEq && (
              <p className="text-muted-foreground mt-1" style={{ fontSize: "11px" }}>
                {selectedEq.category} · bảo hành đến {selectedEq.warrantyEndsAt.split("T")[0]}
              </p>
            )}
          </div>

          <div>
            <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>MÔ TẢ SỰ CỐ *</label>
            <textarea
              value={issue} onChange={(e) => setIssue(e.target.value)}
              placeholder="Mô tả chi tiết vấn đề gặp phải, hiện tượng, tần suất..."
              className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none resize-none"
              rows={4}
              style={{ fontSize: "13px" }}
            />
          </div>

          <div>
            <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>HÌNH ẢNH (TÙY CHỌN)</label>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {photos.map((p, i) => (
                <div key={i} className="w-20 h-20 rounded bg-secondary flex items-center justify-center relative">
                  <Camera className="w-6 h-6 text-muted-foreground" />
                  <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-[#dc2626] rounded-full flex items-center justify-center text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setPhotos([...photos, `photo-${photos.length + 1}.jpg`])}
                className="w-20 h-20 rounded border-2 border-dashed border-border hover:border-[#2563eb] flex flex-col items-center justify-center text-muted-foreground gap-1"
              >
                <Upload className="w-5 h-5" />
                <span style={{ fontSize: "10px" }}>Thêm ảnh</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 border border-border rounded-lg hover:bg-secondary" style={{ fontSize: "13px", fontWeight: 500 }}>
            Hủy
          </button>
          <button
            disabled={!issue.trim() || !eqId}
            onClick={() => onSubmit(eqId, issue.trim())}
            className="px-4 py-2 bg-[#dc2626] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
}

export function WarrantyTicketing() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const equipment = useMemo(() => equipmentBySchool(tenantId), [tenantId]);
  const [tickets, setTickets] = useState(() => ticketsBySchool(tenantId));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WarrantyTicket["status"] | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<WarrantyTicket | null>(null);

  const filtered = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search && !t.ticketNo.toLowerCase().includes(search.toLowerCase()) &&
      !t.issue.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openCount = tickets.filter((t) => !["resolved", "closed", "rejected"].includes(t.status)).length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved" || t.status === "closed").length;
  const overdueCount = tickets.filter((t) =>
    t.slaDueAt && new Date(t.slaDueAt).getTime() < Date.now() &&
    !["resolved", "closed", "rejected"].includes(t.status)
  ).length;

  const handleCreate = (eqId: string, issue: string) => {
    const newTicket: WarrantyTicket = {
      id: `WT-NEW-${Date.now()}`,
      ticketNo: `WT-2026-NEW-${(tickets.length + 1).toString().padStart(4, "0")}`,
      equipmentId: eqId, schoolId: tenantId,
      reportedBy: user?.id || "U-SCH",
      reportedAt: new Date().toISOString(),
      issue, photos: [],
      status: "new",
      slaDueAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
      history: [{ at: new Date().toISOString(), by: user?.id || "U-SCH", status: "new", note: "Trường tạo ticket" }],
    };
    setTickets([newTicket, ...tickets]);
    toast.success(`Đã gửi ticket ${newTicket.ticketNo} đến NCC. SLA 7 ngày.`);
    setCreateOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Wrench}
        title="Yêu cầu Bảo hành"
        subtitle="Ghi nhận sự cố, hỏng hóc hoặc mất mát thiết bị và gửi yêu cầu bảo hành lên hệ thống NCC."
        accentColor="#2563eb"
        actions={
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#dc2626] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Plus className="w-4 h-4" />
            Báo lỗi thiết bị
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Wrench} label="Tổng ticket" value={tickets.length} color="#2563eb" />
        <KpiCard icon={Clock} label="Đang xử lý" value={openCount} color="#f59e0b" />
        <KpiCard icon={CheckCircle2} label="Đã xử lý" value={resolvedCount} color="#16a34a" />
        <KpiCard icon={AlertTriangle} label="Quá SLA" value={overdueCount} color="#dc2626" trend={overdueCount > 0 ? "up" : "flat"} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã ticket, mô tả..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }}
          />
        </div>
        <button onClick={() => setStatusFilter("all")}
          className={`px-3 py-2 rounded-lg border ${statusFilter === "all" ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-card border-border hover:bg-secondary"}`}
          style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả
        </button>
        {WARRANTY_STATUS_LIST.map((st) => {
          const meta = WARRANTY_STATUS_META[st];
          const count = tickets.filter((t) => t.status === st).length;
          return (
            <button key={st} onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-lg border ${statusFilter === st ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"}`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(statusFilter === st ? { backgroundColor: meta.color } : {}),
              }}>
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {filtered.map((t) => {
          const eq = equipment.find((e) => e.id === t.equipmentId);
          const isSlaOver = t.slaDueAt && new Date(t.slaDueAt).getTime() < Date.now() &&
            !["resolved", "closed", "rejected"].includes(t.status);
          return (
            <div key={t.id} onClick={() => setSelected(t)} className="p-4 hover:bg-secondary/50 cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-muted-foreground" style={{ fontSize: "11px" }}>{t.ticketNo}</span>
                    <WarrantyStatusBadge status={t.status} size="xs" />
                    {isSlaOver && (
                      <span className="inline-flex items-center gap-0.5 text-[#dc2626]" style={{ fontSize: "10px", fontWeight: 600 }}>
                        <AlertTriangle className="w-3 h-3" /> Quá SLA
                      </span>
                    )}
                  </div>
                  <p className="text-foreground mt-1 line-clamp-2" style={{ fontSize: "13px", fontWeight: 500 }}>
                    {t.issue}
                  </p>
                  <p className="text-muted-foreground mt-1" style={{ fontSize: "11px" }}>
                    {eq?.name} · {eq?.serial} · Báo {formatRelative(t.reportedAt)}
                  </p>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground mt-1" />
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
            Chưa có ticket nào.
          </div>
        )}
      </div>

      {createOpen && (
        <CreateTicketDialog equipment={equipment} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 style={{ fontSize: "16px", fontWeight: 700 }}>{selected.ticketNo}</h2>
                <WarrantyStatusBadge status={selected.status} size="md" />
              </div>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>
                Báo {formatRelative(selected.reportedAt)}
                {selected.slaDueAt && ` · SLA: ${formatDateTime(selected.slaDueAt)}`}
              </p>
            </div>
            <div className="p-5 space-y-3">
              <div className="bg-secondary/40 rounded-lg p-3">
                <p className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>SỰ CỐ</p>
                <p className="text-foreground mt-1" style={{ fontSize: "13px" }}>{selected.issue}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>LỊCH SỬ</p>
                <div className="space-y-1.5">
                  {selected.history.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-md">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: WARRANTY_STATUS_META[h.status].color }} />
                      <div className="flex-1">
                        <WarrantyStatusBadge status={h.status} size="xs" />
                        {h.note && <p className="text-foreground mt-0.5" style={{ fontSize: "11.5px" }}>{h.note}</p>}
                      </div>
                      <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{formatDateTime(h.at)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selected.resolutionNote && (
                <div className="border-l-4 border-[#16a34a] pl-3 py-1 bg-[#16a34a]/5">
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Ghi chú xử lý</p>
                  <p className="text-foreground" style={{ fontSize: "12px" }}>{selected.resolutionNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WarrantyTicketing;
