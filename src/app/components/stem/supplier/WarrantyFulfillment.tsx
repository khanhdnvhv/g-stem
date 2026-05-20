import { useState, useMemo, type DragEvent } from "react";
import { useNavigate } from "react-router";
import {
  Wrench, Search, Plus, Clock, AlertTriangle, CheckCircle2, X,
  UserPlus, ArrowRight, ArrowLeft, Package as PackageIcon, Ban, ShieldAlert,
  ShieldCheck, FileText, ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { equipment, tenants, tenantsByType } from "../../mock-data/index";
import type { WarrantyTicket, WarrantyStatus, Contract, Tenant } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import {
  WarrantyStatusBadge, WARRANTY_STATUS_LIST, WARRANTY_STATUS_META, TenantBadge,
} from "../ui/badges";
import { formatRelative, formatDateTime } from "../ui/format";
import { toast } from "@/app/lib/toast";
import { useOperations } from "@/app/lib/OperationsContext";
import type { AdvanceTicketInput } from "@/app/lib/OperationsContext";

/* ================================================================ */
/*  WARRANTY FULFILLMENT — NCC điều phối bảo hành (store)            */
/*  2 cấp: Danh bạ trường → Board bảo hành từng trường               */
/* ================================================================ */

const TECHNICIANS = [
  { id: "U-SUP-WR-01", name: "Trần Văn Kỹ" },
  { id: "U-SUP-WR-02", name: "Lê Thị Thuật" },
  { id: "U-SUP-WR-03", name: "Phạm Văn Viên" },
];
function ktvName(id?: string) {
  return id ? (TECHNICIANS.find((k) => k.id === id)?.name ?? id) : "—";
}

const OPEN_STATUSES: WarrantyStatus[] = ["new", "accepted", "awaiting_part", "in_progress"];
const DONE_STATUSES: WarrantyStatus[] = ["resolved", "closed"];

function ticketInfo(t: WarrantyTicket) {
  const eq = equipment.find((e) => e.id === t.equipmentId);
  const school = tenants.find((tn) => tn.id === t.schoolId);
  const warrantyExpired = eq ? new Date(eq.warrantyEndsAt).getTime() < Date.now() : false;
  return { eq, school, warrantyExpired };
}
function isOverdue(t: WarrantyTicket) {
  return !!t.slaDueAt && new Date(t.slaDueAt).getTime() < Date.now()
    && !DONE_STATUSES.includes(t.status) && t.status !== "rejected";
}

/* ── Hạn bảo hành suy ra từ hợp đồng (BH 24 tháng từ ngày ký) ─────── */
const WARRANTY_MONTHS = 24;
const MONTH_MS = 30.44 * 86400_000;
interface WarrantyInfo {
  state: "active" | "expiring" | "expired" | "pending" | "terminated";
  label: string;
  color: string;
  endAt?: number;
}
function contractWarranty(c: Contract): WarrantyInfo {
  if (c.status === "terminated") return { state: "terminated", label: "HĐ đã chấm dứt", color: "#dc2626" };
  if (!c.signedAt) return { state: "pending", label: "Chưa kích hoạt BH", color: "#64748b" };
  const endAt = new Date(c.signedAt).getTime() + WARRANTY_MONTHS * MONTH_MS;
  const monthsLeft = Math.round((endAt - Date.now()) / MONTH_MS);
  if (monthsLeft < 0)  return { state: "expired",  label: "Hết hạn BH",            color: "#dc2626", endAt };
  if (monthsLeft <= 3) return { state: "expiring", label: `Sắp hết BH · ${monthsLeft}th`, color: "#f59e0b", endAt };
  return { state: "active", label: `Còn BH · ${monthsLeft}th`, color: "#16a34a", endAt };
}
function fmtDate(ms: number) {
  return new Date(ms).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/* ── Máy trạng thái — hành động khả dụng theo status ──────────────── */
interface ActionDef {
  next: WarrantyStatus;
  label: string;
  color: string;
  icon: LucideIcon;
  needsKtv?: boolean;
  needsResolution?: boolean;
  needsReason?: boolean;
}
function actionsFor(status: WarrantyStatus): ActionDef[] {
  switch (status) {
    case "new":
      return [
        { next: "accepted",  label: "Tiếp nhận",     color: "#0891b2", icon: UserPlus },
        { next: "rejected",  label: "Từ chối",       color: "#dc2626", icon: Ban, needsReason: true },
      ];
    case "accepted":
      return [
        { next: "in_progress",   label: "Cử KTV xử lý",  color: "#7c3aed", icon: ArrowRight, needsKtv: true },
        { next: "awaiting_part", label: "Chờ phụ kiện",  color: "#f59e0b", icon: Clock, needsReason: true },
      ];
    case "awaiting_part":
      return [
        { next: "in_progress",   label: "Có phụ kiện — xử lý", color: "#7c3aed", icon: ArrowRight, needsKtv: true },
      ];
    case "in_progress":
      return [
        { next: "resolved",      label: "Hoàn tất xử lý",  color: "#16a34a", icon: CheckCircle2, needsResolution: true },
        { next: "awaiting_part", label: "Cần chờ phụ kiện", color: "#f59e0b", icon: Clock, needsReason: true },
      ];
    case "resolved":
      return [{ next: "closed", label: "Đóng ticket", color: "#64748b", icon: CheckCircle2 }];
    case "rejected":
      return [{ next: "closed", label: "Đóng ticket", color: "#64748b", icon: CheckCircle2 }];
    case "closed":
      return [];
  }
}

/* ── Thẻ ticket trên Kanban ──────────────────────────────────────── */
function TicketCard({ ticket, onOpen, draggable, onDragStart, onDragEnd }: {
  ticket: WarrantyTicket;
  onOpen: () => void;
  draggable?: boolean;
  onDragStart?: (e: DragEvent) => void;
  onDragEnd?: () => void;
}) {
  const { eq, warrantyExpired } = ticketInfo(ticket);
  const slaOver = isOverdue(ticket);
  return (
    <div onClick={onOpen}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-card border border-border rounded-lg p-3 hover:shadow-md transition-all ${
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      }`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="font-mono text-muted-foreground" style={{ fontSize: "10.5px" }}>{ticket.ticketNo}</span>
        <div className="flex items-center gap-1.5">
          {warrantyExpired && (
            <span className="inline-flex items-center gap-0.5 text-[#dc2626]" style={{ fontSize: "10px", fontWeight: 600 }}
              title="Thiết bị đã hết hạn bảo hành">
              <ShieldAlert className="w-3 h-3" /> Hết BH
            </span>
          )}
          {slaOver && (
            <span className="inline-flex items-center gap-0.5 text-[#dc2626]" style={{ fontSize: "10px", fontWeight: 600 }}>
              <AlertTriangle className="w-3 h-3" /> Quá SLA
            </span>
          )}
        </div>
      </div>
      <p className="text-foreground line-clamp-2" style={{ fontSize: "12.5px", fontWeight: 500 }}>{ticket.issue}</p>
      <div className="mt-2 flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "11px" }}>
        <PackageIcon className="w-3 h-3" /> {eq?.name || "—"}
      </div>
      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
        <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{formatRelative(ticket.reportedAt)}</span>
        {ticket.assignedTo && (
          <span className="text-foreground" style={{ fontSize: "10px" }}>KTV: {ktvName(ticket.assignedTo)}</span>
        )}
      </div>
    </div>
  );
}

/* ── Board Kanban 7 cột — hỗ trợ kéo-thả ─────────────────────────── */
function KanbanBoard({ tickets, onOpen, onDropTransition }: {
  tickets: WarrantyTicket[];
  onOpen: (id: string) => void;
  onDropTransition: (ticket: WarrantyTicket, action: ActionDef) => void;
}) {
  const byStatus = useMemo(() => {
    const map: Record<WarrantyStatus, WarrantyTicket[]> = {
      new: [], accepted: [], awaiting_part: [], in_progress: [],
      resolved: [], rejected: [], closed: [],
    };
    tickets.forEach((t) => map[t.status].push(t));
    return map;
  }, [tickets]);

  const [dragging, setDragging] = useState<WarrantyTicket | null>(null);
  const validTargets = useMemo(
    () => dragging ? new Set(actionsFor(dragging.status).map((a) => a.next)) : new Set<WarrantyStatus>(),
    [dragging],
  );

  return (
    <div>
      {dragging && (
        <p className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0891b2]/10 text-[#0891b2]"
          style={{ fontSize: "11.5px", fontWeight: 600 }}>
          <ArrowRight className="w-3.5 h-3.5" /> Thả vào cột được tô sáng để chuyển trạng thái
        </p>
      )}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {WARRANTY_STATUS_LIST.map((st) => {
          const meta = WARRANTY_STATUS_META[st];
          const items = byStatus[st];
          const isValid  = !!dragging && validTargets.has(st);
          const isDimmed = !!dragging && !isValid && dragging.status !== st;
          return (
            <div key={st}
              onDragOver={(e) => { if (isValid) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; } }}
              onDrop={(e) => {
                e.preventDefault();
                if (!isValid || !dragging) return;
                const action = actionsFor(dragging.status).find((a) => a.next === st);
                const dragged = dragging;
                setDragging(null);
                if (action) onDropTransition(dragged, action);
              }}
              className={`min-w-[232px] flex-1 transition-opacity ${isDimmed ? "opacity-40" : ""}`}>
              <div className="flex items-center gap-2 mb-2 px-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                <span className="text-foreground" style={{ fontSize: "12.5px", fontWeight: 600 }}>{meta.label}</span>
                <span className="text-muted-foreground ml-auto" style={{ fontSize: "11px" }}>({items.length})</span>
              </div>
              <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1 rounded-lg transition-all"
                style={isValid
                  ? { boxShadow: `inset 0 0 0 2px ${meta.color}`, backgroundColor: meta.color + "0d", padding: "6px" }
                  : undefined}>
                {items.map((t) => (
                  <TicketCard key={t.id} ticket={t} onOpen={() => onOpen(t.id)}
                    draggable={actionsFor(t.status).length > 0}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", t.id);
                      setDragging(t);
                    }}
                    onDragEnd={() => setDragging(null)}
                  />
                ))}
                {items.length === 0 && (
                  isValid ? (
                    <div className="text-center py-6 border border-dashed rounded-lg"
                      style={{ fontSize: "11px", color: meta.color, borderColor: meta.color, fontWeight: 600 }}>
                      Thả vào đây
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg"
                      style={{ fontSize: "11px" }}>
                      Trống
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Dialog chi tiết + chuyển trạng thái ─────────────────────────── */
function TicketDetailDialog({ ticket, initialAction, onClose, onAdvance }: {
  ticket: WarrantyTicket;
  initialAction?: WarrantyStatus;
  onClose: () => void;
  onAdvance: (next: WarrantyStatus, opts: AdvanceTicketInput) => void;
}) {
  const { eq, school, warrantyExpired } = ticketInfo(ticket);
  const actions = actionsFor(ticket.status);
  const [pending, setPending] = useState<ActionDef | null>(
    () => initialAction ? actions.find((a) => a.next === initialAction) ?? null : null,
  );
  const [note, setNote] = useState("");
  const [ktvId, setKtvId] = useState(ticket.assignedTo ?? "");

  const startAction = (a: ActionDef) => {
    setPending(a);
    setNote("");
    setKtvId(ticket.assignedTo ?? "");
  };

  const confirm = () => {
    if (!pending) return;
    if (pending.needsKtv && !ktvId) { toast.error("Hãy chọn kỹ thuật viên"); return; }
    if (pending.needsReason && note.trim().length < 5) { toast.error("Hãy nhập lý do (tối thiểu 5 ký tự)"); return; }
    if (pending.needsResolution && note.trim().length < 5) { toast.error("Hãy nhập ghi chú xử lý"); return; }

    const opts: AdvanceTicketInput = {};
    if (pending.needsKtv) opts.assignedTo = ktvId;
    if (pending.needsResolution) { opts.resolutionNote = note.trim(); opts.note = "Hoàn tất xử lý"; }
    else opts.note = note.trim() || pending.label;
    onAdvance(pending.next, opts);
  };

  return (
    <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
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
          {warrantyExpired && (
            <div className="flex items-start gap-2 p-3 bg-[#dc2626]/8 border border-[#dc2626]/25 rounded-lg">
              <ShieldAlert className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
                <strong className="text-[#dc2626]">Hết hạn bảo hành</strong> — thiết bị bảo hành đến{" "}
                {eq && formatDateTime(eq.warrantyEndsAt)}. Sự cố này có thể bị từ chối hoặc tính phí sửa chữa.
              </p>
            </div>
          )}

          <div>
            <p className="text-muted-foreground mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>MÔ TẢ SỰ CỐ</p>
            <p className="text-foreground bg-secondary/40 rounded-lg p-3" style={{ fontSize: "13px" }}>{ticket.issue}</p>
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

          {ticket.assignedTo && (
            <div className="flex items-center gap-2" style={{ fontSize: "12px" }}>
              <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Kỹ thuật viên phụ trách:</span>
              <span className="text-foreground" style={{ fontWeight: 600 }}>{ktvName(ticket.assignedTo)}</span>
            </div>
          )}

          <div>
            <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>LỊCH SỬ</p>
            <div className="space-y-1.5">
              {ticket.history.map((h, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-md">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: WARRANTY_STATUS_META[h.status].color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <WarrantyStatusBadge status={h.status} size="xs" />
                      <span className="text-muted-foreground font-mono" style={{ fontSize: "10px" }}>{h.by}</span>
                    </div>
                    {h.note && <p className="text-foreground mt-0.5" style={{ fontSize: "11.5px" }}>{h.note}</p>}
                  </div>
                  <span className="text-muted-foreground shrink-0" style={{ fontSize: "10px" }}>{formatDateTime(h.at)}</span>
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

        {/* Hành động */}
        <div className="p-4 border-t border-border">
          {ticket.status === "closed" ? (
            <p className="text-center text-muted-foreground" style={{ fontSize: "12px" }}>
              Ticket đã đóng — không còn thao tác.
            </p>
          ) : !pending ? (
            <div className="flex items-center gap-2 justify-end flex-wrap">
              {actions.map((a) => (
                <button key={a.next} onClick={() => startAction(a)}
                  className="px-3 py-2 text-white rounded-lg hover:opacity-90 flex items-center gap-1.5"
                  style={{ fontSize: "13px", fontWeight: 500, backgroundColor: a.color }}>
                  <a.icon className="w-4 h-4" /> {a.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                <pending.icon className="w-4 h-4" style={{ color: pending.color }} />
                <span>{pending.label}</span>
              </div>

              {pending.needsKtv && (
                <div>
                  <label className="block mb-1 text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>
                    Kỹ thuật viên <span className="text-[#dc2626]">*</span>
                  </label>
                  <select value={ktvId} onChange={(e) => setKtvId(e.target.value)}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "13px" }}>
                    <option value="">-- Chọn kỹ thuật viên --</option>
                    {TECHNICIANS.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block mb-1 text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>
                  {pending.needsResolution ? "Ghi chú xử lý" : pending.needsReason ? "Lý do" : "Ghi chú"}
                  {(pending.needsReason || pending.needsResolution) && <span className="text-[#dc2626]"> *</span>}
                </label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                  placeholder={pending.needsResolution ? "Mô tả cách khắc phục..." : pending.needsReason ? "Nêu lý do cụ thể..." : "Ghi chú thêm (không bắt buộc)"}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg resize-none" style={{ fontSize: "13px" }} />
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setPending(null)}
                  className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary" style={{ fontSize: "12.5px" }}>
                  Hủy
                </button>
                <button onClick={confirm}
                  className="px-4 py-1.5 text-white rounded-lg hover:opacity-90" style={{ fontSize: "12.5px", fontWeight: 600, backgroundColor: pending.color }}>
                  Xác nhận
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Dialog tạo ticket thủ công ──────────────────────────────────── */
function CreateTicketDialog({ lockedSchoolId, onClose, onCreate }: {
  lockedSchoolId?: string;
  onClose: () => void;
  onCreate: (input: { equipmentId: string; schoolId: string; issue: string }) => void;
}) {
  const [schoolId, setSchoolId] = useState(lockedSchoolId ?? "");
  const [equipmentId, setEquipmentId] = useState("");
  const [issue, setIssue] = useState("");

  const schoolEquipment = useMemo(
    () => schoolId ? equipment.filter((e) => e.schoolId === schoolId) : [],
    [schoolId],
  );
  const canSubmit = schoolId && equipmentId && issue.trim().length >= 5;
  const lockedSchool = lockedSchoolId ? tenants.find((t) => t.id === lockedSchoolId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
          <Wrench className="w-5 h-5 text-[#990803]" />
          <h2 className="flex-1" style={{ fontSize: "15px", fontWeight: 700 }}>Tạo ticket bảo hành</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
            Tạo ticket thay cho trường chưa có tài khoản hoặc báo lỗi qua điện thoại.
          </p>
          <div>
            <label className="block mb-1 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>
              Trường học <span className="text-[#dc2626]">*</span>
            </label>
            {lockedSchool ? (
              <div className="w-full px-3 py-2 bg-secondary/40 border border-border rounded-lg" style={{ fontSize: "13px" }}>
                {lockedSchool.name}
              </div>
            ) : (
              <select value={schoolId} onChange={(e) => { setSchoolId(e.target.value); setEquipmentId(""); }}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "13px" }}>
                <option value="">-- Chọn trường --</option>
                {tenantsByType.school.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
          </div>
          <div>
            <label className="block mb-1 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>
              Thiết bị <span className="text-[#dc2626]">*</span>
            </label>
            <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} disabled={!schoolId}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg disabled:opacity-50" style={{ fontSize: "13px" }}>
              <option value="">{schoolId ? "-- Chọn thiết bị --" : "Chọn trường trước"}</option>
              {schoolEquipment.map((e) => <option key={e.id} value={e.id}>{e.name} · {e.serial}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>
              Mô tả sự cố <span className="text-[#dc2626]">*</span>
            </label>
            <textarea value={issue} onChange={(e) => setIssue(e.target.value)} rows={3}
              placeholder="Mô tả chi tiết hiện tượng lỗi..."
              className="w-full px-3 py-2 bg-card border border-border rounded-lg resize-none" style={{ fontSize: "13px" }} />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border bg-secondary/20">
          <button onClick={onClose}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary" style={{ fontSize: "12.5px" }}>
            Hủy
          </button>
          <button onClick={() => canSubmit && onCreate({ equipmentId, schoolId, issue: issue.trim() })}
            disabled={!canSubmit}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] disabled:opacity-40"
            style={{ fontSize: "12.5px", fontWeight: 600 }}>
            <Plus className="w-3.5 h-3.5" /> Tạo ticket
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── CẤP 1 — Danh bạ trường ──────────────────────────────────────── */
interface SchoolRow {
  school: Tenant;
  tickets: WarrantyTicket[];
  open: number;
  overdue: number;
  done: number;
  contracts: Contract[];
  warranties: WarrantyInfo[];
}

function SchoolDirectory({ rows, onPick }: {
  rows: SchoolRow[];
  onPick: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {rows.map((r) => {
        const wActive   = r.warranties.filter((w) => w.state === "active").length;
        const wExpiring = r.warranties.filter((w) => w.state === "expiring").length;
        const wExpired  = r.warranties.filter((w) => w.state === "expired").length;
        return (
          <button key={r.school.id} onClick={() => onPick(r.school.id)}
            className="text-left bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-[#990803]/40 transition-all">
            <div className="flex items-start gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <TenantBadge type={r.school.type} size="xs" />
                  {r.overdue > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[#dc2626]" style={{ fontSize: "10px", fontWeight: 700 }}>
                      <AlertTriangle className="w-3 h-3" /> {r.overdue} quá SLA
                    </span>
                  )}
                </div>
                <p className="text-foreground truncate" style={{ fontSize: "13.5px", fontWeight: 600 }}>{r.school.name}</p>
                <p className="text-muted-foreground truncate" style={{ fontSize: "11px" }}>
                  {r.school.province} · {r.school.district}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>

            {/* Thống kê ticket */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-secondary/40 rounded-lg p-2 text-center">
                <p className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>{r.tickets.length}</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Tổng ticket</p>
              </div>
              <div className="bg-[#7c3aed]/8 rounded-lg p-2 text-center">
                <p className="text-[#7c3aed]" style={{ fontSize: "16px", fontWeight: 700 }}>{r.open}</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Đang mở</p>
              </div>
              <div className="bg-[#16a34a]/8 rounded-lg p-2 text-center">
                <p className="text-[#16a34a]" style={{ fontSize: "16px", fontWeight: 700 }}>{r.done}</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Đã xử lý</p>
              </div>
            </div>

            {/* Ngữ cảnh bảo hành theo hợp đồng */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border" style={{ fontSize: "10.5px" }}>
              <span className="text-muted-foreground inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {r.contracts.length} hợp đồng:
              </span>
              {wActive > 0 && (
                <span className="inline-flex items-center gap-0.5" style={{ color: "#16a34a", fontWeight: 600 }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" /> {wActive} còn hạn
                </span>
              )}
              {wExpiring > 0 && (
                <span className="inline-flex items-center gap-0.5" style={{ color: "#f59e0b", fontWeight: 600 }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> {wExpiring} sắp hết
                </span>
              )}
              {wExpired > 0 && (
                <span className="inline-flex items-center gap-0.5" style={{ color: "#dc2626", fontWeight: 600 }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" /> {wExpired} hết hạn
                </span>
              )}
              {r.contracts.length === 0 && (
                <span className="text-muted-foreground italic">chưa có hợp đồng</span>
              )}
            </div>
          </button>
        );
      })}
      {rows.length === 0 && (
        <div className="md:col-span-2 xl:col-span-3 text-center py-12 text-muted-foreground" style={{ fontSize: "12px" }}>
          <Wrench className="w-7 h-7 mx-auto mb-2 opacity-40" />
          Không có trường nào phù hợp.
        </div>
      )}
    </div>
  );
}

/* ── CẤP 2 — Board bảo hành của một trường ───────────────────────── */
function SchoolBoard({ row, onBack, onOpenTicket, onCreate, onGotoContract, onDropTransition }: {
  row: SchoolRow;
  onBack: () => void;
  onOpenTicket: (id: string) => void;
  onCreate: () => void;
  onGotoContract: (id: string) => void;
  onDropTransition: (ticket: WarrantyTicket, action: ActionDef) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    if (!search) return row.tickets;
    const s = search.toLowerCase();
    return row.tickets.filter((t) =>
      t.ticketNo.toLowerCase().includes(s) || t.issue.toLowerCase().includes(s));
  }, [row.tickets, search]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <button onClick={onBack}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-2" style={{ fontSize: "12px" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Tất cả trường
        </button>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <TenantBadge type={row.school.type} size="sm" />
              <h1 className="text-foreground" style={{ fontSize: "19px", fontWeight: 700 }}>{row.school.name}</h1>
            </div>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12.5px" }}>
              {row.school.province} · {row.school.district} — điều phối bảo hành thiết bị STEM của trường.
            </p>
          </div>
          <button onClick={onCreate}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602]"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Tạo ticket cho trường
          </button>
        </div>
      </div>

      {/* Ngữ cảnh hợp đồng & hạn bảo hành */}
      <div>
        <p className="text-muted-foreground mb-2 flex items-center gap-1.5" style={{ fontSize: "11.5px", fontWeight: 600 }}>
          <ShieldCheck className="w-3.5 h-3.5" /> HỢP ĐỒNG & HẠN BẢO HÀNH
        </p>
        {row.contracts.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-3 text-muted-foreground" style={{ fontSize: "12px" }}>
            Trường chưa có hợp đồng nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {row.contracts.map((c) => {
              const w = contractWarranty(c);
              return (
                <button key={c.id} onClick={() => onGotoContract(c.id)}
                  className="text-left bg-card border border-border rounded-lg p-3 hover:border-[#0891b2]/50 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-foreground inline-flex items-center gap-1" style={{ fontSize: "12px", fontWeight: 700 }}>
                      <FileText className="w-3 h-3 text-[#0891b2]" /> {c.contractNo}
                    </span>
                    <span className="px-1.5 py-0.5 rounded" style={{
                      fontSize: "9.5px", fontWeight: 700, color: w.color, backgroundColor: w.color + "1a",
                    }}>
                      {w.label}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1" style={{ fontSize: "10.5px" }}>
                    {w.endAt ? `Bảo hành đến ${fmtDate(w.endAt)}` : "Hợp đồng chưa kích hoạt bảo hành"}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* KPIs trường */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Wrench} label="Tổng ticket" value={row.tickets.length} color="#990803" />
        <KpiCard icon={Clock} label="Đang xử lý" value={row.open} color="#7c3aed" />
        <KpiCard icon={AlertTriangle} label="Quá SLA" value={row.overdue} color="#dc2626"
          trend={row.overdue > 0 ? "up" : "flat"} />
        <KpiCard icon={CheckCircle2} label="Đã xử lý" value={row.done} color="#16a34a" />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm ticket trong trường..."
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none" style={{ fontSize: "13px" }} />
      </div>

      <KanbanBoard tickets={filtered} onOpen={onOpenTicket} onDropTransition={onDropTransition} />
    </div>
  );
}

/* ── Trang chính ─────────────────────────────────────────────────── */
export function WarrantyFulfillment() {
  const navigate = useNavigate();
  const { tickets, contracts, createTicket, advanceTicket } = useOperations();
  const [activeSchoolId, setActiveSchoolId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<WarrantyStatus | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const closeDetail = () => { setSelectedId(null); setSelectedAction(null); };

  const selected = selectedId ? tickets.find((t) => t.id === selectedId) ?? null : null;

  /* Gom ticket + hợp đồng theo trường */
  const schoolRows = useMemo<SchoolRow[]>(() => {
    const schoolIds = Array.from(new Set(tickets.map((t) => t.schoolId)));
    return schoolIds.map((sid) => {
      const school = tenants.find((t) => t.id === sid)!;
      const sTickets = tickets.filter((t) => t.schoolId === sid);
      const sContracts = contracts.filter((c) => c.schoolId === sid);
      return {
        school,
        tickets: sTickets,
        open: sTickets.filter((t) => OPEN_STATUSES.includes(t.status)).length,
        overdue: sTickets.filter(isOverdue).length,
        done: sTickets.filter((t) => DONE_STATUSES.includes(t.status)).length,
        contracts: sContracts,
        warranties: sContracts.map(contractWarranty),
      };
    }).filter((r) => r.school)
      .sort((a, b) => b.overdue - a.overdue || b.open - a.open);
  }, [tickets, contracts]);

  const filteredRows = useMemo(() => {
    if (!search) return schoolRows;
    const s = search.toLowerCase();
    return schoolRows.filter((r) => r.school.name.toLowerCase().includes(s));
  }, [schoolRows, search]);

  const activeRow = activeSchoolId ? schoolRows.find((r) => r.school.id === activeSchoolId) ?? null : null;

  /* KPIs tổng */
  const overdueTotal = tickets.filter(isOverdue).length;
  const openTotal = tickets.filter((t) => OPEN_STATUSES.includes(t.status)).length;
  const doneTotal = tickets.filter((t) => DONE_STATUSES.includes(t.status)).length;

  const handleAdvance = (next: WarrantyStatus, opts: AdvanceTicketInput) => {
    if (!selected) return;
    advanceTicket(selected.id, next, opts);
    toast.success(`Ticket ${selected.ticketNo} → ${WARRANTY_STATUS_META[next].label}`);
    closeDetail();
  };

  /* Kéo-thả ticket: cần thông tin → mở form; không → chuyển ngay */
  const handleDropTransition = (ticket: WarrantyTicket, action: ActionDef) => {
    const needsInput = action.needsKtv || action.needsReason || action.needsResolution;
    if (needsInput) {
      setSelectedId(ticket.id);
      setSelectedAction(action.next);
    } else {
      advanceTicket(ticket.id, action.next, { note: action.label });
      toast.success(`Ticket ${ticket.ticketNo} → ${WARRANTY_STATUS_META[action.next].label}`);
    }
  };

  const handleCreate = (input: { equipmentId: string; schoolId: string; issue: string }) => {
    const t = createTicket(input);
    toast.success(`Đã tạo ticket ${t.ticketNo}`);
    setCreateOpen(false);
  };

  return (
    <div className="space-y-5">
      {activeRow ? (
        <SchoolBoard
          row={activeRow}
          onBack={() => setActiveSchoolId(null)}
          onOpenTicket={setSelectedId}
          onCreate={() => setCreateOpen(true)}
          onGotoContract={(id) => navigate(`/supplier/contracts/${id}`)}
          onDropTransition={handleDropTransition}
        />
      ) : (
        <>
          <PageHeader
            icon={Wrench}
            title="Điều phối Bảo hành"
            subtitle="Quản lý bảo hành theo từng trường — chọn một trường để xem hàng đợi xử lý và hạn bảo hành theo hợp đồng."
            accentColor="#990803"
            actions={
              <button onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <Plus className="w-4 h-4" /> Tạo ticket thủ công
              </button>
            }
          />

          {/* KPIs tổng */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Wrench} label="Tổng ticket" value={tickets.length} color="#990803" />
            <KpiCard icon={Clock} label="Đang xử lý" value={openTotal} color="#7c3aed" />
            <KpiCard icon={AlertTriangle} label="Quá SLA" value={overdueTotal} color="#dc2626"
              trend={overdueTotal > 0 ? "up" : "flat"} />
            <KpiCard icon={CheckCircle2} label="Đã xử lý" value={doneTotal} color="#16a34a" />
          </div>

          {/* Search trường */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm trường học..."
              className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none" style={{ fontSize: "13px" }} />
          </div>

          <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
            {filteredRows.length} trường có ticket bảo hành — sắp xếp theo mức độ ưu tiên (quá SLA, đang mở).
          </p>

          <SchoolDirectory rows={filteredRows} onPick={setActiveSchoolId} />
        </>
      )}

      {selected && (
        <TicketDetailDialog
          key={selected.id + (selectedAction ?? "")}
          ticket={selected}
          initialAction={selectedAction ?? undefined}
          onClose={closeDetail}
          onAdvance={handleAdvance}
        />
      )}
      {createOpen && (
        <CreateTicketDialog
          lockedSchoolId={activeSchoolId ?? undefined}
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

export default WarrantyFulfillment;
