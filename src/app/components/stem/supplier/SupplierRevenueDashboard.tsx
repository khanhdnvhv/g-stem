import { useMemo } from "react";
import {
  TrendingUp, DollarSign, Handshake, School as SchoolIcon,
  Package, Download,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { orders, tenants, stemPackages, commissionRecords } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatVND, formatVNDCompact } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  SUPPLIER REVENUE DASHBOARD — tổng hợp doanh thu + KPI NCC       */
/* ================================================================ */

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear().toString().slice(2)}`;
}

export function SupplierRevenueDashboard() {
  const deliveredOrders = useMemo(() => orders.filter((o) => o.status === "delivered"), []);

  const totalRevenue = deliveredOrders.reduce((s, o) => s + o.totalVND, 0);
  const pendingRevenue = orders.filter((o) => o.status === "approved" || o.status === "delivering")
    .reduce((s, o) => s + o.totalVND, 0);
  const totalSchools = new Set(orders.map((o) => o.fromTenantId)).size;
  const totalDistributors = new Set(orders.map((o) => o.distributorTenantId).filter(Boolean)).size;

  // Doanh thu theo tháng
  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const k = monthKey(o.createdAt);
      map.set(k, (map.get(k) || 0) + o.totalVND);
    });
    return Array.from(map.entries())
      .sort()
      .slice(-6)
      .map(([month, revenue]) => ({ month, revenue: Math.round(revenue / 1_000_000) }));
  }, []);

  // Doanh thu theo gói (pie)
  const revenueByPackage = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      o.items.forEach((it) => {
        map.set(it.packageId, (map.get(it.packageId) || 0) + it.quantity * it.unitPrice);
      });
    });
    return stemPackages.map((p) => ({
      name: p.name,
      value: Math.round((map.get(p.id) || 0) / 1_000_000),
      fill:
        p.tier === "minimum" ? "#94a3b8"
        : p.tier === "basic"  ? "#2e86de"
        : "#c8a84e",
    }));
  }, []);

  // Top đại lý theo doanh số
  const topDistributors = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      if (o.distributorTenantId) {
        map.set(o.distributorTenantId, (map.get(o.distributorTenantId) || 0) + o.totalVND);
      }
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tid, rev]) => ({
        distributor: tenants.find((t) => t.id === tid)?.name || tid,
        revenue: Math.round(rev / 1_000_000),
      }));
  }, []);

  const totalCommission = commissionRecords.reduce((s, c) => s + c.commissionVND, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={TrendingUp}
        title="Dashboard Doanh thu NCC"
        subtitle="Tổng hợp KPI kinh doanh, phân phối, hoa hồng và xuất báo cáo tài chính."
        actions={
          <button
            onClick={() => toast.info("Xuất báo cáo P&L cho ban lãnh đạo")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Download className="w-4 h-4" />
            Xuất P&L
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign} label="Doanh thu đã giao" value={formatVNDCompact(totalRevenue)} color="#990803" change="+23%" trend="up" />
        <KpiCard icon={Package} label="Đơn pending + delivering" value={formatVNDCompact(pendingRevenue)} color="#f59e0b" subtitle="chưa ghi nhận doanh thu" />
        <KpiCard icon={SchoolIcon} label="Trường đã đặt hàng" value={totalSchools} color="#2563eb" />
        <KpiCard icon={Handshake} label="Hoa hồng đại lý (YTD)" value={formatVNDCompact(totalCommission)} color="#c8a84e" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 lg:col-span-2">
          <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Doanh thu theo tháng (triệu VND)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} triệu`} />
              <Line type="monotone" dataKey="revenue" stroke="#990803" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Phân bổ theo gói
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={revenueByPackage}
                dataKey="value"
                cx="50%" cy="50%"
                innerRadius={45} outerRadius={80}
                paddingAngle={3}
                label={(e) => `${e.value}`}
              >
                {revenueByPackage.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} triệu`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {revenueByPackage.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: d.fill }} />
                <span className="text-muted-foreground truncate flex-1" style={{ fontSize: "11px" }}>{d.name}</span>
                <span className="text-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top distributors */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          Top đại lý theo doanh số (triệu VND)
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={topDistributors} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="distributor" type="category" width={200} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => `${v.toLocaleString()} triệu`} />
            <Bar dataKey="revenue" fill="#c8a84e" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SupplierRevenueDashboard;
