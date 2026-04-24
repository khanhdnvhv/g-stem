import { useMemo } from "react";
import {
  TrendingUp, DollarSign, Package, Download, Users,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { orders, stemPackages, tenants } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatVNDCompact } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  DISTRIBUTOR REVENUE REPORTS                                      */
/* ================================================================ */

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear().toString().slice(2)}`;
}

export function RevenueReports() {
  const { user } = useAuth();
  const myOrders = user?.tenantType === "distributor"
    ? orders.filter((o) => o.distributorTenantId === user.tenantId)
    : orders;

  const delivered = myOrders.filter((o) => o.status === "delivered");
  const totalRevenue = delivered.reduce((s, o) => s + o.totalVND, 0);
  const deliveredCount = delivered.length;
  const avgOrderValue = deliveredCount ? totalRevenue / deliveredCount : 0;
  const uniqueSchools = new Set(myOrders.map((o) => o.fromTenantId)).size;

  const monthly = useMemo(() => {
    const m = new Map<string, { revenue: number; orders: number }>();
    myOrders.forEach((o) => {
      const k = monthKey(o.createdAt);
      const prev = m.get(k) || { revenue: 0, orders: 0 };
      m.set(k, { revenue: prev.revenue + o.totalVND, orders: prev.orders + 1 });
    });
    return Array.from(m.entries()).sort().slice(-8).map(([month, v]) => ({
      month,
      revenue: Math.round(v.revenue / 1_000_000),
      orders: v.orders,
    }));
  }, [myOrders]);

  const byPackage = useMemo(() => {
    return stemPackages.map((p) => {
      const count = myOrders.filter((o) => o.items.some((i) => i.packageId === p.id)).length;
      const revenue = myOrders
        .flatMap((o) => o.items.filter((i) => i.packageId === p.id).map((i) => i.quantity * i.unitPrice))
        .reduce((s, v) => s + v, 0);
      return {
        name: p.name,
        orders: count,
        revenue: Math.round(revenue / 1_000_000),
      };
    });
  }, [myOrders]);

  const topSchools = useMemo(() => {
    const m = new Map<string, number>();
    myOrders.forEach((o) => {
      m.set(o.fromTenantId, (m.get(o.fromTenantId) || 0) + o.totalVND);
    });
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([tid, revenue]) => ({
        school: tenants.find((t) => t.id === tid)?.name || tid,
        revenue: Math.round(revenue / 1_000_000),
      }));
  }, [myOrders]);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={TrendingUp}
        title="Báo cáo Doanh thu"
        subtitle="Theo dõi doanh số, trích xuất số liệu kinh doanh định kỳ."
        actions={
          <button
            onClick={() => toast.info("Xuất PDF báo cáo doanh thu cho Ban Giám đốc")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Download className="w-4 h-4" />
            Xuất PDF
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign} label="Doanh thu đã giao" value={formatVNDCompact(totalRevenue)} color="#990803" change="+28%" trend="up" />
        <KpiCard icon={Package} label="Đơn hoàn tất" value={deliveredCount} color="#16a34a" subtitle={`${myOrders.length} tổng`} />
        <KpiCard icon={TrendingUp} label="Đơn TB" value={formatVNDCompact(avgOrderValue)} color="#0891b2" />
        <KpiCard icon={Users} label="Trường khách hàng" value={uniqueSchools} color="#c8a84e" />
      </div>

      {/* Revenue + Orders chart */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          Doanh thu & Số đơn theo tháng
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={monthly}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#990803" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#990803" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(v: number, name: string) =>
                name === "revenue" ? `${v.toLocaleString()} triệu` : `${v} đơn`
              }
            />
            <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#990803" fill="url(#revGrad)" strokeWidth={2} name="Doanh thu" />
            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#c8a84e" strokeWidth={2} dot={{ r: 3 }} name="Đơn" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Doanh thu theo gói (triệu VND)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byPackage}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#c8a84e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Top 5 trường đóng góp doanh thu
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topSchools} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="school" width={140} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} triệu`} />
              <Bar dataKey="revenue" fill="#2e86de" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default RevenueReports;
