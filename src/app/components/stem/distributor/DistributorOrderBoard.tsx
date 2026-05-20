import { useState } from "react";
import {
  Receipt, Plus, Eye, TrendingUp, Clock, Truck, CheckCircle2, Ban,
} from "lucide-react";
import { orders, tenants, stemPackages } from "../../mock-data/index";
import type { Order, OrderStatus } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import {
  OrderStatusBadge, ORDER_STATUS_META, TierBadge,
} from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatVND, formatVNDCompact, formatRelative } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  DISTRIBUTOR ORDER BOARD — Kanban đơn hàng của đại lý             */
/* ================================================================ */

function schoolName(id: string) { return tenants.find((t) => t.id === id)?.name || id; }

function OrderCard({ order, onOpen }: { order: Order; onOpen: () => void }) {
  const firstItem = order.items[0];
  const pkg = firstItem ? stemPackages.find((p) => p.id === firstItem.packageId) : null;
  return (
    <div
      onClick={onOpen}
      className="bg-card border border-border rounded-lg p-3 hover:shadow-md cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="font-mono text-muted-foreground" style={{ fontSize: "10.5px" }}>
          {order.orderNo}
        </span>
        {pkg && <TierBadge tier={pkg.tier} size="xs" />}
      </div>
      <p className="text-foreground truncate" style={{ fontSize: "12.5px", fontWeight: 600 }}>
        {schoolName(order.fromTenantId)}
      </p>
      <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
        {firstItem?.quantity} × {pkg?.name || ""}
      </p>
      <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
        <span className="text-[#990803]" style={{ fontSize: "13px", fontWeight: 700 }}>
          {formatVNDCompact(order.totalVND)}
        </span>
        <span className="text-muted-foreground" style={{ fontSize: "10px" }}>
          {formatRelative(order.createdAt)}
        </span>
      </div>
    </div>
  );
}

const BOARD_COLUMNS: OrderStatus[] = ["draft", "pending", "approved", "delivering", "delivered", "cancelled"];

export function DistributorOrderBoard() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<Order | null>(null);

  // Chỉ lấy đơn của đại lý hiện tại
  const myOrders = user?.tenantType === "distributor"
    ? orders.filter((o) => o.distributorTenantId === user.tenantId)
    : orders;

  const byStatus: Record<OrderStatus, Order[]> = {
    draft: [], pending: [], approved: [],
    delivering: [], delivered: [], cancelled: [],
  };
  myOrders.forEach((o) => byStatus[o.status].push(o));

  const totalValue = myOrders.reduce((s, o) => s + o.totalVND, 0);
  const pendingCount = byStatus.pending.length;
  const delivered = byStatus.delivered.length;
  const deliveredValue = byStatus.delivered.reduce((s, o) => s + o.totalVND, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Receipt}
        title="Bảng đơn hàng (Kanban)"
        subtitle="Theo dõi đơn đặt hàng gói giải pháp STEM từ các trường học theo từng giai đoạn"
        actions={
          <button
            onClick={() => toast.success("Tạo đơn hàng mới cho trường khách hàng")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Plus className="w-4 h-4" />
            Tạo đơn mới
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Receipt} label="Tổng đơn của tôi" value={myOrders.length} color="#c8a84e" />
        <KpiCard icon={Clock} label="Chờ duyệt" value={pendingCount} color="#f59e0b" trend={pendingCount > 0 ? "up" : "flat"} />
        <KpiCard icon={CheckCircle2} label="Đã giao thành công" value={delivered} color="#16a34a" subtitle={formatVNDCompact(deliveredValue)} />
        <KpiCard icon={TrendingUp} label="Tổng giá trị" value={formatVNDCompact(totalValue)} color="#990803" />
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {BOARD_COLUMNS.map((st) => {
          const meta = ORDER_STATUS_META[st];
          const items = byStatus[st];
          return (
            <div key={st} className="min-w-[260px] flex-1">
              <div className="flex items-center gap-2 mb-2 px-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                <span className="text-foreground" style={{ fontSize: "12.5px", fontWeight: 600 }}>{meta.label}</span>
                <span className="text-muted-foreground ml-auto" style={{ fontSize: "11px" }}>
                  ({items.length}) · {formatVNDCompact(items.reduce((s, o) => s + o.totalVND, 0))}
                </span>
              </div>
              <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
                {items.map((o) => <OrderCard key={o.id} order={o} onOpen={() => setSelected(o)} />)}
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

      {/* Detail dialog */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 style={{ fontSize: "16px", fontWeight: 700 }}>{selected.orderNo}</h2>
                  <OrderStatusBadge status={selected.status} size="md" />
                </div>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>
                  Tạo {formatRelative(selected.createdAt)}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-secondary rounded">
                <Ban className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Trường mua</p>
                <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
                  {schoolName(selected.fromTenantId)}
                </p>
              </div>
              {selected.items.map((it, i) => {
                const pkg = stemPackages.find((p) => p.id === it.packageId);
                return (
                  <div key={i} className="bg-secondary/40 rounded-lg p-3 flex items-center gap-2">
                    <div className="flex-1">
                      <p style={{ fontSize: "13px", fontWeight: 500 }}>{pkg?.name}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                        {it.quantity} × {formatVND(it.unitPrice)}
                      </p>
                    </div>
                    <span className="text-[#990803]" style={{ fontSize: "13px", fontWeight: 700 }}>
                      {formatVND(it.quantity * it.unitPrice)}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span style={{ fontSize: "13px", fontWeight: 600 }}>Tổng</span>
                <span className="text-[#990803]" style={{ fontSize: "17px", fontWeight: 800 }}>
                  {formatVND(selected.totalVND)}
                </span>
              </div>
            </div>
            <div className="p-4 border-t border-border flex items-center gap-2 justify-end">
              <button
                onClick={() => toast.info(`Xem full chi tiết + tài liệu hợp đồng`)}
                className="px-3 py-2 border border-border rounded-lg hover:bg-secondary flex items-center gap-1.5"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                <Eye className="w-4 h-4" />
                Xem đầy đủ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DistributorOrderBoard;
