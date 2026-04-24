import { Link } from "react-router";
import {
  LayoutDashboard, Receipt, Wrench, KeyRound, Boxes,
  TrendingUp, ChevronRight, Users, School as SchoolIcon,
  Handshake, CheckCircle2,
} from "lucide-react";
import {
  orders, warrantyTickets, licenses, tenantsByType, stemPackages,
} from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import {
  OrderStatusBadge, WarrantyStatusBadge, TierBadge,
} from "../ui/badges";
import { formatVNDCompact, formatRelative } from "../ui/format";

/* ================================================================ */
/*  SUPPLIER DASHBOARD — Dashboard chính cho NCC                    */
/* ================================================================ */

export function SupplierDashboard() {
  const { user } = useAuth();

  const revenue = orders.filter((o) => o.status === "delivered")
    .reduce((s, o) => s + o.totalVND, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const activeTickets = warrantyTickets.filter((t) =>
    ["new", "accepted", "in_progress", "awaiting_part"].includes(t.status)
  ).length;
  const totalLicensesActive = licenses.filter((l) => !l.revokedAt).length;

  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentTickets = [...warrantyTickets].sort((a, b) => b.reportedAt.localeCompare(a.reportedAt)).slice(0, 5);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard Nhà cung cấp"
        subtitle={`Xin chào, ${user?.name}. Dữ liệu cập nhật lúc ${new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}.`}
      />

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={TrendingUp} label="Doanh thu đã giao" value={formatVNDCompact(revenue)} change="+23%" trend="up" color="#990803" />
        <KpiCard icon={Receipt} label="Đơn chờ duyệt" value={pendingOrders} color="#f59e0b" trend={pendingOrders > 0 ? "up" : "flat"} />
        <KpiCard icon={Wrench} label="Ticket bảo hành đang xử lý" value={activeTickets} color="#7c3aed" />
        <KpiCard icon={KeyRound} label="License đang hoạt động" value={totalLicensesActive.toLocaleString()} color="#16a34a" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={SchoolIcon} label="Trường đã mua" value={new Set(orders.map((o) => o.fromTenantId)).size} color="#2563eb" />
        <KpiCard icon={Handshake} label="Đại lý hoạt động" value={tenantsByType.distributor.length} color="#c8a84e" />
        <KpiCard icon={Boxes} label="Gói STEM đang phát hành" value={stemPackages.filter((p) => p.active).length} color="#0891b2" />
        <KpiCard icon={Users} label="Users tất cả tenant" value="12.4k" color="#990803" subtitle="Tăng 8% MoM" />
      </div>

      {/* Two panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent orders */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Receipt className="w-4 h-4" />
              Đơn hàng gần đây
            </h3>
            <Link to="/supplier/orders" className="text-[#990803] flex items-center gap-1" style={{ fontSize: "12px" }}>
              Xem tất cả
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.map((o) => {
              const pkg = stemPackages.find((p) => p.id === o.items[0]?.packageId);
              const school = tenantsByType.school.find((t) => t.id === o.fromTenantId);
              return (
                <Link
                  key={o.id}
                  to="/supplier/orders"
                  className="block p-3 hover:bg-secondary/50 transition-colors"
                >
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
          </div>
        </div>

        {/* Warranty tickets */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Wrench className="w-4 h-4" />
              Ticket bảo hành mới
            </h3>
            <Link to="/supplier/warranty" className="text-[#990803] flex items-center gap-1" style={{ fontSize: "12px" }}>
              Xem hàng đợi
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentTickets.map((t) => {
              const school = tenantsByType.school.find((s) => s.id === t.schoolId);
              return (
                <Link
                  key={t.id}
                  to="/supplier/warranty"
                  className="block p-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-muted-foreground" style={{ fontSize: "11px" }}>{t.ticketNo}</span>
                        <WarrantyStatusBadge status={t.status} size="xs" />
                      </div>
                      <p className="text-foreground mt-0.5 line-clamp-1" style={{ fontSize: "12.5px", fontWeight: 500 }}>
                        {t.issue}
                      </p>
                      <p className="text-muted-foreground mt-0.5 truncate" style={{ fontSize: "10.5px" }}>
                        {school?.name} · {formatRelative(t.reportedAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-gradient-to-br from-[#990803]/5 to-[#c8a84e]/5 rounded-xl border border-border p-4">
        <p className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Thao tác nhanh</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { to: "/supplier/packages", icon: Boxes, label: "Danh mục gói" },
            { to: "/supplier/programs", icon: CheckCircle2, label: "Chương trình CT1–CT5" },
            { to: "/supplier/revenue", icon: TrendingUp, label: "Báo cáo doanh thu" },
            { to: "/supplier/licenses", icon: KeyRound, label: "License đang dùng" },
          ].map((q) => (
            <Link
              key={q.to}
              to={q.to}
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

export default SupplierDashboard;
