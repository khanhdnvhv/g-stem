import { Link } from "react-router";
import {
  LayoutDashboard, Receipt, Warehouse, TrendingUp, Users, ChevronRight,
  FileText, Percent, Handshake, ShoppingBag,
} from "lucide-react";
import {
  orders, contracts, commissionRecords, stockBalance, tenantsByType,
} from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { OrderStatusBadge, TierBadge } from "../ui/badges";
import { formatVNDCompact, formatRelative } from "../ui/format";
import { stemPackages } from "../../mock-data/index";

/* ================================================================ */
/*  DISTRIBUTOR DASHBOARD                                           */
/* ================================================================ */

export function DistributorDashboard() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "distributor" ? user.tenantId : tenantsByType.distributor[0].id;

  const myOrders = orders.filter((o) => o.distributorTenantId === tenantId);
  const myContracts = contracts.filter((c) => c.distributorId === tenantId);
  const myCommission = commissionRecords.filter((c) => c.distributorId === tenantId);
  const myBalances = stockBalance(tenantId);

  const revenue = myOrders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.totalVND, 0);
  const activeCustomers = new Set(myOrders.map((o) => o.fromTenantId)).size;
  const pendingOrders = myOrders.filter((o) => o.status === "pending").length;
  const activeContracts = myContracts.filter((c) => c.status === "active").length;
  const totalCommission = myCommission.reduce((s, c) => s + c.commissionVND, 0);

  const recentOrders = [...myOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  const lowStockItems = myBalances.filter((b) => b.closingQty < 5);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard Đại lý"
        subtitle={`Xin chào, ${user?.name}. Tổng quan kinh doanh của ${user?.tenantName}.`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={TrendingUp} label="Doanh thu đã giao" value={formatVNDCompact(revenue)} change="+28%" trend="up" color="#990803" />
        <KpiCard icon={Receipt} label="Đơn chờ duyệt" value={pendingOrders} color="#f59e0b" trend={pendingOrders > 0 ? "up" : "flat"} />
        <KpiCard icon={Users} label="Trường khách hàng" value={activeCustomers} color="#2563eb" />
        <KpiCard icon={Percent} label="Hoa hồng (YTD)" value={formatVNDCompact(totalCommission)} color="#c8a84e" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={FileText} label="Hợp đồng đang active" value={activeContracts} color="#16a34a" />
        <KpiCard icon={Warehouse} label="Tồn kho ảo" value={myBalances.reduce((s, b) => s + b.closingQty, 0)} color="#0891b2" subtitle={`${lowStockItems.length} mặt hàng sắp hết`} />
        <KpiCard icon={ShoppingBag} label="Đơn hoàn tất" value={myOrders.filter((o) => o.status === "delivered").length} color="#16a34a" />
        <KpiCard icon={Handshake} label="Sản phẩm phân phối" value={stemPackages.filter((p) => p.active).length} color="#c8a84e" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Receipt className="w-4 h-4" />
              Đơn hàng gần đây
            </h3>
            <Link to="/distributor/orders" className="text-[#990803] flex items-center gap-1" style={{ fontSize: "12px" }}>
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.map((o) => {
              const pkg = stemPackages.find((p) => p.id === o.items[0]?.packageId);
              const school = tenantsByType.school.find((t) => t.id === o.fromTenantId);
              return (
                <Link key={o.id} to="/distributor/orders" className="block p-3 hover:bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-muted-foreground" style={{ fontSize: "11px" }}>{o.orderNo}</span>
                        <OrderStatusBadge status={o.status} size="xs" />
                      </div>
                      <p className="text-foreground truncate mt-0.5" style={{ fontSize: "12.5px", fontWeight: 500 }}>
                        {school?.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {pkg && <TierBadge tier={pkg.tier} size="xs" />}
                        <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                          {formatRelative(o.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[#990803]" style={{ fontSize: "13px", fontWeight: 700 }}>
                      {formatVNDCompact(o.totalVND)}
                    </span>
                  </div>
                </Link>
              );
            })}
            {recentOrders.length === 0 && (
              <div className="p-6 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
                Chưa có đơn hàng nào.
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Warehouse className="w-4 h-4" />
              Tồn kho ảo
            </h3>
            <Link to="/distributor/inventory" className="text-[#990803] flex items-center gap-1" style={{ fontSize: "12px" }}>
              Chi tiết kho <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {myBalances.map((b) => {
              const pkg = stemPackages.find((p) => p.id === b.packageId);
              const low = b.closingQty < 5;
              return (
                <div key={b.packageId} className="p-3 flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      {pkg && <TierBadge tier={pkg.tier} size="xs" />}
                      <span style={{ fontSize: "12.5px", fontWeight: 500 }}>{pkg?.name}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
                      Nhập {b.inQty} · Xuất {b.outQty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: "18px", fontWeight: 800, color: low ? "#dc2626" : "#0891b2" }}>
                      {b.closingQty}
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: "10px" }}>tồn cuối</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#c8a84e]/5 to-[#990803]/5 rounded-xl border border-border p-4">
        <p className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Thao tác nhanh</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { to: "/distributor/sales-app", icon: ShoppingBag, label: "Sales App — báo giá" },
            { to: "/distributor/customers", icon: Users, label: "CRM Khách hàng" },
            { to: "/distributor/commission", icon: Percent, label: "Đối soát hoa hồng" },
            { to: "/distributor/revenue", icon: TrendingUp, label: "Báo cáo doanh thu" },
          ].map((q) => (
            <Link
              key={q.to} to={q.to}
              className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border hover:shadow-md transition-all"
              style={{ fontSize: "12.5px", fontWeight: 500 }}
            >
              <q.icon className="w-4 h-4 text-[#990803]" />
              {q.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DistributorDashboard;
