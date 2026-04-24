import { useState, useMemo } from "react";
import {
  Receipt, Plus, Search, Filter, Eye, Check, X, Download,
  TrendingUp, Clock, CheckCircle2, Truck, Package as PackageIcon,
} from "lucide-react";
import { orders, tenants, stemPackages } from "../../mock-data/index";
import type { Order, OrderStatus } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { OrderStatusBadge, ORDER_STATUS_LIST, ORDER_STATUS_META, TierBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatVND, formatRelative, formatVNDCompact } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  STEM ORDER MANAGEMENT — quản lý đơn hàng                         */
/*  Tiếp nhận, kiểm soát trạng thái đơn hàng từ kênh phân phối/trường */
/* ================================================================ */

function tenantName(id: string) {
  return tenants.find((t) => t.id === id)?.name || id;
}
function pkgName(id: string) {
  return stemPackages.find((p) => p.id === id)?.name || id;
}

interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}
function OrderDetailDialog({ order, onClose, onApprove, onReject }: OrderDetailProps) {
  const buyer = tenants.find((t) => t.id === order.fromTenantId);
  const distributor = order.distributorTenantId
    ? tenants.find((t) => t.id === order.distributorTenantId)
    : null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-foreground" style={{ fontSize: "17px", fontWeight: 700 }}>
                {order.orderNo}
              </h2>
              <OrderStatusBadge status={order.status} size="md" />
            </div>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>
              Tạo {formatRelative(order.createdAt)}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Bên mua</p>
              <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
                {buyer?.name || "—"}
              </p>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
                {buyer?.province} · {buyer?.district}
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Đại lý môi giới</p>
              <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
                {distributor?.name || "Trực tiếp từ NCC"}
              </p>
            </div>
          </div>

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
            <span className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>Tổng giá trị</span>
            <span className="text-[#990803]" style={{ fontSize: "20px", fontWeight: 800 }}>
              {formatVND(order.totalVND)}
            </span>
          </div>

          {order.note && (
            <div className="border-l-4 border-[#c8a84e] pl-3 py-1 bg-[#c8a84e]/5">
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Ghi chú</p>
              <p className="text-foreground" style={{ fontSize: "12px" }}>{order.note}</p>
            </div>
          )}
        </div>

        {order.status === "pending" && (
          <div className="p-4 border-t border-border flex items-center gap-2 justify-end">
            <button
              onClick={onReject}
              className="px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-1.5"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <X className="w-4 h-4" />
              Từ chối
            </button>
            <button
              onClick={onApprove}
              className="px-3 py-2 bg-[#16a34a] text-white rounded-lg hover:bg-[#15803d] transition-colors flex items-center gap-1.5"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Check className="w-4 h-4" />
              Duyệt đơn
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function STEMOrderManagement() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !o.orderNo.toLowerCase().includes(s) &&
          !tenantName(o.fromTenantId).toLowerCase().includes(s)
        ) return false;
      }
      return true;
    });
  }, [statusFilter, search]);

  const totalRevenue = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.totalVND, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const delivering = orders.filter((o) => o.status === "delivering").length;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Receipt}
        title="Quản lý Đơn hàng STEM"
        subtitle="Tiếp nhận và kiểm soát trạng thái đơn mua gói STEM từ kênh phân phối hoặc trường học"
        actions={
          <>
            <button
              onClick={() => toast.info("Tạo đơn hàng thủ công cho trường không có tài khoản")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Plus className="w-4 h-4" />
              Tạo đơn thủ công
            </button>
            <button
              onClick={() => toast.info("Xuất Excel danh sách đơn hàng")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Download className="w-4 h-4" />
              Xuất Excel
            </button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={Receipt} label="Tổng đơn hàng"
          value={orders.length}
          color="#990803"
          subtitle={`${orders.filter((o) => o.status === "delivered").length} đã hoàn tất`}
        />
        <KpiCard
          icon={Clock} label="Chờ duyệt"
          value={pending}
          change={`${pending} mới`} trend={pending > 0 ? "up" : "flat"}
          color="#f59e0b"
        />
        <KpiCard
          icon={Truck} label="Đang giao"
          value={delivering}
          color="#7c3aed"
          subtitle="Đã duyệt, chờ giao đến trường"
        />
        <KpiCard
          icon={TrendingUp} label="Doanh thu đã giao"
          value={formatVNDCompact(totalRevenue)}
          change="+18%" trend="up"
          color="#16a34a"
        />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn, trường..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }}
          />
        </div>
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-2 rounded-lg border ${
            statusFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"
          }`}
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          Tất cả ({orders.length})
        </button>
        {ORDER_STATUS_LIST.map((st) => {
          const meta = ORDER_STATUS_META[st];
          const count = orders.filter((o) => o.status === st).length;
          const isActive = statusFilter === st;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-lg border ${isActive ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"}`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(isActive ? { backgroundColor: meta.color } : {}),
              }}
            >
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              <th className="px-4 py-2.5">Mã đơn</th>
              <th className="px-4 py-2.5">Trường mua</th>
              <th className="px-4 py-2.5">Đại lý</th>
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
                    <span className="font-mono text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>
                      {o.orderNo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground" style={{ fontSize: "12.5px" }}>
                    {tenantName(o.fromTenantId)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>
                    {o.distributorTenantId ? tenantName(o.distributorTenantId) : "Trực tiếp"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {pkg && <TierBadge tier={pkg.tier} size="xs" />}
                      <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                        SL {firstItem?.quantity}
                      </span>
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
                    <button
                      onClick={() => setSelected(o)}
                      className="p-1.5 hover:bg-secondary rounded"
                      title="Xem chi tiết"
                    >
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
          onClose={() => setSelected(null)}
          onApprove={() => { toast.success(`Đã duyệt đơn ${selected.orderNo}`); setSelected(null); }}
          onReject={() => { toast.error(`Đã từ chối đơn ${selected.orderNo}`); setSelected(null); }}
        />
      )}
    </div>
  );
}

export default STEMOrderManagement;
