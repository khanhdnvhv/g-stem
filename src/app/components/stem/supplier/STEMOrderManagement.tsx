import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Receipt, Plus, Search, Eye, Check, X, Download,
  TrendingUp, Clock, Truck, Package as PackageIcon, FileText,
  ArrowRight,
} from "lucide-react";
import { tenants, tenantsByType, stemPackages } from "../../mock-data/index";
import type { Order, OrderStatus, OrderItem } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { OrderStatusBadge, ORDER_STATUS_LIST, ORDER_STATUS_META, TierBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatVND, formatRelative, formatVNDCompact } from "../ui/format";
import { toast } from "@/app/lib/toast";
import { useOperations } from "@/app/lib/OperationsContext";

/* ================================================================ */
/*  STEM ORDER MANAGEMENT — quản lý đơn hàng (V1: trực tiếp NCC)     */
/* ================================================================ */

function tenantName(id: string) {
  return tenants.find((t) => t.id === id)?.name || id;
}
function pkgName(id: string) {
  return stemPackages.find((p) => p.id === id)?.name || id;
}

/* ── Dialog nhập lý do từ chối ── */
function RejectReasonDialog({ order, onClose, onConfirm }: {
  order: Order; onClose: () => void; onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const valid = reason.trim().length >= 10;
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border">
          <h2 style={{ fontSize: "15px", fontWeight: 700 }}>Từ chối đơn {order.orderNo}</h2>
        </div>
        <div className="px-5 py-4 space-y-2">
          <p className="text-muted-foreground" style={{ fontSize: "12.5px" }}>
            Đơn sẽ chuyển sang trạng thái "Đã huỷ". Nhập lý do để trường/đại lý nắm rõ.
          </p>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            placeholder="VD: Gói đã ngừng bán, cần chọn gói thay thế..."
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none resize-none"
            style={{ fontSize: "12.5px" }} />
          {reason.length > 0 && !valid && (
            <p className="text-orange-500" style={{ fontSize: "11px" }}>Lý do tối thiểu 10 ký tự</p>
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border bg-secondary/20">
          <button onClick={onClose}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary" style={{ fontSize: "12.5px" }}>
            Hủy
          </button>
          <button onClick={() => valid && onConfirm(reason.trim())} disabled={!valid}
            className="px-4 py-1.5 bg-destructive text-white rounded-lg hover:opacity-90 disabled:opacity-40"
            style={{ fontSize: "12.5px", fontWeight: 600 }}>
            Xác nhận từ chối
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Form tạo đơn thủ công ── */
function CreateOrderDialog({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (input: { fromTenantId: string; items: OrderItem[]; totalVND: number; note?: string }) => void;
}) {
  const [schoolId, setSchoolId] = useState("");
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");

  const togglePkg = (pkgId: string) => setSelections((prev) => {
    if (prev[pkgId] !== undefined) {
      const n = { ...prev }; delete n[pkgId]; return n;
    }
    return { ...prev, [pkgId]: 1 };
  });
  const setQty = (pkgId: string, qty: number) =>
    setSelections((prev) => ({ ...prev, [pkgId]: Math.max(1, qty) }));

  const items: OrderItem[] = Object.entries(selections).map(([packageId, quantity]) => {
    const pkg = stemPackages.find((p) => p.id === packageId)!;
    return { packageId, quantity, unitPrice: pkg.priceVND };
  });
  const totalVND = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const valid = !!schoolId && items.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[88vh] overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
          <Receipt className="w-5 h-5 text-[#990803]" />
          <h2 className="flex-1" style={{ fontSize: "15px", fontWeight: 700 }}>Tạo đơn hàng thủ công</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div>
            <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
              Trường mua <span className="text-[#990803]">*</span>
            </label>
            <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "13px" }}>
              <option value="">-- Chọn trường --</option>
              {tenantsByType.school.map((s) => (
                <option key={s.id} value={s.id}>{s.name} · {s.province}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
              Gói STEM <span className="text-[#990803]">*</span> (chọn ≥ 1)
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {stemPackages.filter((p) => (p.status ?? "active") === "active").map((pkg) => {
                const sel = selections[pkg.id] !== undefined;
                return (
                  <div key={pkg.id}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${sel ? "border-[#990803]/40 bg-[#990803]/5" : "border-border"}`}>
                    <button onClick={() => togglePkg(pkg.id)}
                      className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${sel ? "bg-[#990803] border-[#990803]" : "border-border"}`}>
                      {sel && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{pkg.name}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{formatVND(pkg.priceVND)}</p>
                    </div>
                    {sel && (
                      <input type="number" min={1} value={selections[pkg.id]}
                        onChange={(e) => setQty(pkg.id, Number(e.target.value))}
                        className="w-14 px-1.5 py-1 bg-card border border-border rounded text-center" style={{ fontSize: "12px" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>Ghi chú</label>
            <input value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Thanh toán qua ngân sách xã hội hóa..."
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none" style={{ fontSize: "12.5px" }} />
          </div>
          {items.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/5 rounded-lg">
              <span style={{ fontSize: "12.5px", fontWeight: 600 }}>Tổng giá trị</span>
              <span className="text-[#990803]" style={{ fontSize: "16px", fontWeight: 800 }}>{formatVND(totalVND)}</span>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border bg-secondary/20">
          <button onClick={onClose}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary" style={{ fontSize: "12.5px" }}>
            Hủy
          </button>
          <button onClick={() => valid && onCreate({ fromTenantId: schoolId, items, totalVND, note: note.trim() || undefined })}
            disabled={!valid}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] disabled:opacity-40"
            style={{ fontSize: "12.5px", fontWeight: 600 }}>
            <Plus className="w-3.5 h-3.5" /> Tạo đơn
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Dialog chi tiết đơn ── */
function OrderDetailDialog({ order, onClose, onApprove, onReject, onAdvance, onGotoContract }: {
  order: Order;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onAdvance: () => void;
  onGotoContract: (contractId: string) => void;
}) {
  const buyer = tenants.find((t) => t.id === order.fromTenantId);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 style={{ fontSize: "17px", fontWeight: 700 }}>{order.orderNo}</h2>
              <OrderStatusBadge status={order.status} size="md" />
            </div>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>Tạo {formatRelative(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-secondary/50 rounded-lg p-3">
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Trường mua</p>
            <p style={{ fontSize: "13px", fontWeight: 600 }}>{buyer?.name || "—"}</p>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>{buyer?.province} · {buyer?.district}</p>
          </div>

          {/* Liên kết hợp đồng */}
          {order.contractId && (
            <button onClick={() => onGotoContract(order.contractId!)}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-[#0891b2]/5 border border-[#0891b2]/25 rounded-lg hover:bg-[#0891b2]/10 transition-colors">
              <FileText className="w-4 h-4 text-[#0891b2] shrink-0" />
              <span className="flex-1 text-left" style={{ fontSize: "12.5px", fontWeight: 500 }}>
                Hợp đồng liên kết: {order.contractId}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0891b2]" />
            </button>
          )}

          <div>
            <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>HẠNG MỤC</p>
            <div className="space-y-1.5">
              {order.items.map((it, i) => {
                const pkg = stemPackages.find((p) => p.id === it.packageId);
                return (
                  <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <PackageIcon className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p style={{ fontSize: "13px", fontWeight: 500 }}>{pkgName(it.packageId)}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {pkg && <TierBadge tier={pkg.tier} size="xs" />}
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                          SL: {it.quantity} × {formatVND(it.unitPrice)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[#990803]" style={{ fontSize: "14px", fontWeight: 700 }}>
                      {formatVND(it.quantity * it.unitPrice)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/5 rounded-lg p-4 flex items-center justify-between">
            <span style={{ fontSize: "14px", fontWeight: 600 }}>Tổng giá trị</span>
            <span className="text-[#990803]" style={{ fontSize: "20px", fontWeight: 800 }}>{formatVND(order.totalVND)}</span>
          </div>

          {order.note && (
            <div className="border-l-4 border-[#c8a84e] pl-3 py-1 bg-[#c8a84e]/5">
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Ghi chú</p>
              <p style={{ fontSize: "12px" }}>{order.note}</p>
            </div>
          )}
        </div>

        {/* Actions theo trạng thái */}
        <div className="p-4 border-t border-border flex items-center gap-2 justify-end">
          {order.status === "pending" && (
            <>
              <button onClick={onReject}
                className="px-3 py-2 border border-border rounded-lg hover:bg-secondary flex items-center gap-1.5"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <X className="w-4 h-4" /> Từ chối
              </button>
              <button onClick={onApprove}
                className="px-3 py-2 bg-[#16a34a] text-white rounded-lg hover:bg-[#15803d] flex items-center gap-1.5"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <Check className="w-4 h-4" /> Duyệt đơn
              </button>
            </>
          )}
          {order.status === "approved" && (
            <button onClick={onAdvance}
              className="px-3 py-2 bg-[#7c3aed] text-white rounded-lg hover:opacity-90 flex items-center gap-1.5"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Truck className="w-4 h-4" /> Bắt đầu giao hàng
            </button>
          )}
          {order.status === "delivering" && (
            <button onClick={onAdvance}
              className="px-3 py-2 bg-[#16a34a] text-white rounded-lg hover:bg-[#15803d] flex items-center gap-1.5"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Check className="w-4 h-4" /> Xác nhận đã giao
            </button>
          )}
          {order.status === "delivered" && order.contractId && (
            <button onClick={() => onGotoContract(order.contractId!)}
              className="px-3 py-2 bg-[#0891b2] text-white rounded-lg hover:opacity-90 flex items-center gap-1.5"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <FileText className="w-4 h-4" /> Vào hợp đồng cấp License
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function STEMOrderManagement() {
  const navigate = useNavigate();
  const { orders, approveOrder, rejectOrder, advanceOrderDelivery, createOrder } = useOperations();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const selected = orders.find((o) => o.id === selectedId) ?? null;
  const rejecting = orders.find((o) => o.id === rejectingId) ?? null;

  const filtered = useMemo(() => orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!o.orderNo.toLowerCase().includes(s) && !tenantName(o.fromTenantId).toLowerCase().includes(s)) return false;
    }
    return true;
  }), [orders, statusFilter, search]);

  const totalRevenue = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.totalVND, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const delivering = orders.filter((o) => o.status === "delivering").length;

  /* Handlers */
  const handleApprove = (orderId: string) => {
    const contract = approveOrder(orderId);
    if (contract) toast.success(`Đã duyệt đơn — sinh hợp đồng nháp ${contract.contractNo}`);
    setSelectedId(null);
  };
  const handleReject = (orderId: string, reason: string) => {
    rejectOrder(orderId, reason);
    toast.info("Đã từ chối đơn hàng");
    setRejectingId(null);
    setSelectedId(null);
  };
  const handleAdvance = (orderId: string) => {
    advanceOrderDelivery(orderId);
    toast.success("Đã cập nhật trạng thái giao hàng");
  };
  const handleCreate = (input: { fromTenantId: string; items: OrderItem[]; totalVND: number; note?: string }) => {
    const order = createOrder({ ...input, toTenantId: "T-SUP-01" });
    toast.success(`Đã tạo đơn ${order.orderNo}`);
    setCreateOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Receipt}
        title="Quản lý Đơn hàng STEM"
        subtitle="Tiếp nhận và kiểm soát trạng thái đơn mua gói STEM — V1: trường mua trực tiếp NCC"
        actions={
          <>
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602]"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Tạo đơn thủ công
            </button>
            <button onClick={() => toast.info("Xuất Excel danh sách đơn hàng")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Receipt} label="Tổng đơn hàng" value={orders.length} color="#990803"
          subtitle={`${orders.filter((o) => o.status === "delivered").length} đã hoàn tất`} />
        <KpiCard icon={Clock} label="Chờ duyệt" value={pending}
          change={`${pending} mới`} trend={pending > 0 ? "up" : "flat"} color="#f59e0b" />
        <KpiCard icon={Truck} label="Đang giao" value={delivering} color="#7c3aed"
          subtitle="Đã duyệt, chờ giao đến trường" />
        <KpiCard icon={TrendingUp} label="Doanh thu đã giao" value={formatVNDCompact(totalRevenue)}
          change="+18%" trend="up" color="#16a34a" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn, trường..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none" style={{ fontSize: "13px" }} />
        </div>
        <button onClick={() => setStatusFilter("all")}
          className={`px-3 py-2 rounded-lg border ${statusFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
          style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả ({orders.length})
        </button>
        {ORDER_STATUS_LIST.map((st) => {
          const meta = ORDER_STATUS_META[st];
          const count = orders.filter((o) => o.status === st).length;
          const isActive = statusFilter === st;
          return (
            <button key={st} onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-lg border ${isActive ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"}`}
              style={{ fontSize: "12px", fontWeight: 500, ...(isActive ? { backgroundColor: meta.color } : {}) }}>
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              <th className="px-4 py-2.5">Mã đơn</th>
              <th className="px-4 py-2.5">Trường mua</th>
              <th className="px-4 py-2.5">Hợp đồng</th>
              <th className="px-4 py-2.5">Gói</th>
              <th className="px-4 py-2.5 text-right">Giá trị</th>
              <th className="px-4 py-2.5">Trạng thái</th>
              <th className="px-4 py-2.5">Tạo lúc</th>
              <th className="px-4 py-2.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((o) => {
              const firstItem = o.items[0];
              const pkg = firstItem ? stemPackages.find((p) => p.id === firstItem.packageId) : null;
              return (
                <tr key={o.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono" style={{ fontSize: "12px", fontWeight: 600 }}>{o.orderNo}</span>
                  </td>
                  <td className="px-4 py-3" style={{ fontSize: "12.5px" }}>{tenantName(o.fromTenantId)}</td>
                  <td className="px-4 py-3" style={{ fontSize: "11.5px" }}>
                    {o.contractId
                      ? <button onClick={() => navigate(`/supplier/contracts/${o.contractId}`)}
                          className="text-[#0891b2] hover:underline font-mono">{o.contractId}</button>
                      : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {pkg && <TierBadge tier={pkg.tier} size="xs" />}
                      <span className="text-muted-foreground" style={{ fontSize: "11px" }}>SL {firstItem?.quantity}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-[#990803]" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    {formatVNDCompact(o.totalVND)}
                  </td>
                  <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>
                    {formatRelative(o.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelectedId(o.id)}
                      className="p-1.5 hover:bg-secondary rounded" title="Xem chi tiết">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
            Không có đơn hàng nào khớp bộ lọc.
          </div>
        )}
      </div>

      {selected && (
        <OrderDetailDialog
          order={selected}
          onClose={() => setSelectedId(null)}
          onApprove={() => handleApprove(selected.id)}
          onReject={() => { setRejectingId(selected.id); }}
          onAdvance={() => handleAdvance(selected.id)}
          onGotoContract={(cid) => { setSelectedId(null); navigate(`/supplier/contracts/${cid}`); }}
        />
      )}

      {rejecting && (
        <RejectReasonDialog
          order={rejecting}
          onClose={() => setRejectingId(null)}
          onConfirm={(reason) => handleReject(rejecting.id, reason)}
        />
      )}

      {createOpen && (
        <CreateOrderDialog onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}

export default STEMOrderManagement;
