import { useState, useMemo } from "react";
import {
  Wrench, Search, Plus, Clock, AlertTriangle, CheckCircle2, X,
  UserPlus, ArrowRight, Package as PackageIcon,
} from "lucide-react";
import { warrantyTickets, equipment, tenants } from "../../mock-data/index";
import type { WarrantyTicket, WarrantyStatus } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import {
  WarrantyStatusBadge, WARRANTY_STATUS_LIST, WARRANTY_STATUS_META,
} from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatRelative, formatDateTime } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  WARRANTY FULFILLMENT — Supplier điều phối bảo hành               */
/*  Kanban 7 cột theo status                                         */
/* ================================================================ */

function ticketInfo(t: WarrantyTicket) {
  const eq = equipment.find((e) => e.id === t.equipmentId);
  const school = tenants.find((tn) => tn.id === t.schoolId);
  return { eq, school };
}

function TicketCard({ ticket, onOpen }: { ticket: WarrantyTicket; onOpen: () => void }) {
  const { eq, school } = ticketInfo(ticket);
  const slaDiff = ticket.slaDueAt ? new Date(ticket.slaDueAt).getTime() - Date.now() : 0;
  const isSlaOver = slaDiff < 0 && !["resolved", "closed", "rejected"].includes(ticket.status);
  return (
    <div
      onClick={onOpen}
      className="bg-card border border-border rounded-lg p-3 hover:shadow-md cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="font-mono text-muted-foreground" style={{ fontSize: "10.5px" }}>
          {ticket.ticketNo}
        </span>
        {isSlaOver && (
          <span className="inline-flex items-center gap-0.5 text-[#dc2626]" style={{ fontSize: "10px", fontWeight: 600 }}>
            <AlertTriangle className="w-3 h-3" /> Quá SLA
          </span>
        )}
      </div>
      <p className="text-foreground line-clamp-2" style={{ fontSize: "12.5px", fontWeight: 500 }}>
        {ticket.issue}
      </p>
      <div className="mt-2 flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "11px" }}>
        <PackageIcon className="w-3 h-3" />
        {eq?.name || "—"}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "10.5px" }}>
        <span className="truncate max-w-[160px]">{school?.name}</span>
      </div>
      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
        <span className="text-muted-foreground" style={{ fontSize: "10px" }}>
          {formatRelative(ticket.reportedAt)}
        </span>
        {ticket.assignedTo && (
          <span className="text-foreground" style={{ fontSize: "10px" }}>
            KTV: {ticket.assignedTo.slice(-3)}
          </span>
        )}
      </div>
    </div>
  );
}

function TicketDetailDialog({
  ticket, onClose, onAdvance,
}: {
  ticket: WarrantyTicket; onClose: () => void;
  onAdvance: (status: WarrantyStatus) => void;
}) {
  const { eq, school } = ticketInfo(ticket);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 style={{ fontSize: "17px", fontWeight: 700 }}>{ticket.ticketNo}</h2>
              <WarrantyStatusBadge status={ticket.status} size="md" />
            </div>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
              Báo lỗi {formatRelative(ticket.reportedAt)}
              {ticket.slaDueAt && ` · SLA đến ${formatDateTime(ticket.slaDueAt)}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-muted-foreground mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>MÔ TẢ SỰ CỐ</p>
            <p className="text-foreground bg-secondary/40 rounded-lg p-3" style={{ fontSize: "13px" }}>
              {ticket.issue}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/40 rounded-lg p-3">
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Thiết bị</p>
              <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{eq?.name || "—"}</p>
              <p className="text-muted-foreground mt-0.5 font-mono" style={{ fontSize: "11px" }}>{eq?.serial}</p>
            </div>
            <div className="bg-secondary/40 rounded-lg p-3">
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Trường</p>
              <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{school?.name}</p>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
                {school?.province} · {school?.district}
              </p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>LỊCH SỬ</p>
            <div className="space-y-1.5">
              {ticket.history.map((h, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-md">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: WARRANTY_STATUS_META[h.status].color }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <WarrantyStatusBadge status={h.status} size="xs" />
                      <span className="text-muted-foreground font-mono" style={{ fontSize: "10px" }}>
                        {h.by}
                      </span>
                    </div>
                    {h.note && <p className="text-foreground mt-0.5" style={{ fontSize: "11.5px" }}>{h.note}</p>}
                  </div>
                  <span className="text-muted-foreground" style={{ fontSize: "10px" }}>
                    {formatDateTime(h.at)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {ticket.resolutionNote && (
            <div className="border-l-4 border-[#16a34a] pl-3 py-1 bg-[#16a34a]/5">
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Ghi chú xử lý</p>
              <p className="text-foreground" style={{ fontSize: "12px" }}>{ticket.resolutionNote}</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex items-center gap-2 justify-end">
          {ticket.status === "new" && (
            <button
              onClick={() => onAdvance("accepted")}
              className="px-3 py-2 bg-[#0891b2] text-white rounded-lg hover:opacity-90 flex items-center gap-1.5"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <UserPlus className="w-4 h-4" />
              Tiếp nhận
            </button>
          )}
          {ticket.status === "accepted" && (
            <button
              onClick={() => onAdvance("in_progress")}
              className="px-3 py-2 bg-[#7c3aed] text-white rounded-lg hover:opacity-90 flex items-center gap-1.5"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <ArrowRight className="w-4 h-4" />
              Cử KTV xử lý
            </button>
          )}
          {ticket.status === "in_progress" && (
            <button
              onClick={() => onAdvance("resolved")}
              className="px-3 py-2 bg-[#16a34a] text-white rounded-lg hover:opacity-90 flex items-center gap-1.5"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <CheckCircle2 className="w-4 h-4" />
              Đánh dấu hoàn tất
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function WarrantyFulfillment() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<WarrantyTicket | null>(null);
  const [tickets, setTickets] = useState(warrantyTickets);

  const filtered = useMemo(() => {
    if (!search) return tickets;
    const s = search.toLowerCase();
    return tickets.filter((t) =>
      t.ticketNo.toLowerCase().includes(s) ||
      t.issue.toLowerCase().includes(s)
    );
  }, [tickets, search]);

  const byStatus: Record<WarrantyStatus, WarrantyTicket[]> = {
    new: [], accepted: [], awaiting_part: [], in_progress: [],
    resolved: [], rejected: [], closed: [],
  };
  filtered.forEach((t) => byStatus[t.status].push(t));

  const overdueCount = tickets.filter((t) =>
    t.slaDueAt &&
    new Date(t.slaDueAt).getTime() < Date.now() &&
    !["resolved", "closed", "rejected"].includes(t.status)
  ).length;

  const handleAdvance = (status: WarrantyStatus) => {
    if (!selected) return;
    setTickets((prev) => prev.map((t) =>
      t.id === selected.id
        ? {
            ...t,
            status,
            history: [
              ...t.history,
              { at: new Date().toISOString(), by: "U-SUP-WR-01", status, note: `Chuyển trạng thái` },
            ],
          }
        : t
    ));
    toast.success(`Ticket ${selected.ticketNo} → ${WARRANTY_STATUS_META[status].label}`);
    setSelected(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Wrench}
        title="Điều phối Bảo hành"
        subtitle="Tiếp nhận báo lỗi, cử kỹ thuật viên, theo dõi SLA, đóng ticket"
        actions={
          <button
            onClick={() => toast.info("Tạo ticket thủ công cho trường không có tài khoản")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Plus className="w-4 h-4" />
            Tạo ticket thủ công
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Wrench} label="Tổng ticket" value={tickets.length} color="#990803" />
        <KpiCard icon={Clock} label="Đang xử lý" value={byStatus.in_progress.length + byStatus.awaiting_part.length} color="#7c3aed" />
        <KpiCard icon={AlertTriangle} label="Quá SLA" value={overdueCount} color="#dc2626" trend={overdueCount > 0 ? "up" : "flat"} />
        <KpiCard icon={CheckCircle2} label="Đã xử lý" value={byStatus.resolved.length + byStatus.closed.length} color="#16a34a" />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo mã ticket, mô tả..."
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
          style={{ fontSize: "13px" }}
        />
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {WARRANTY_STATUS_LIST.map((st) => {
          const meta = WARRANTY_STATUS_META[st];
          const items = byStatus[st];
          return (
            <div key={st} className="min-w-[260px] flex-1">
              <div className="flex items-center gap-2 mb-2 px-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                <span className="text-foreground" style={{ fontSize: "12.5px", fontWeight: 600 }}>{meta.label}</span>
                <span className="text-muted-foreground ml-auto" style={{ fontSize: "11px" }}>({items.length})</span>
              </div>
              <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
                {items.map((t) => (
                  <TicketCard key={t.id} ticket={t} onOpen={() => setSelected(t)} />
                ))}
                {items.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg" style={{ fontSize: "11px" }}>
                    Trống
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <TicketDetailDialog
          ticket={selected}
          onClose={() => setSelected(null)}
          onAdvance={handleAdvance}
        />
      )}
    </div>
  );
}

export default WarrantyFulfillment;
