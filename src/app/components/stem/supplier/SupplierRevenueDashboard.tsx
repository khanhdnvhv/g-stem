import { useState, useMemo } from "react";
import {
  TrendingUp, DollarSign, Handshake, School as SchoolIcon,
  Package, Download, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine,
} from "recharts";
import { tenants, stemPackages, commissionRecords } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatVND, formatVNDCompact } from "../ui/format";
import { toast } from "@/app/lib/toast";
import { useOperations } from "@/app/lib/OperationsContext";

/* ================================================================ */
/*  SUPPLIER REVENUE DASHBOARD — tổng hợp doanh thu + KPI NCC       */
/* ================================================================ */

type Period = "3m" | "6m" | "ytd" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  "3m": "3 tháng gần nhất",
  "6m": "6 tháng gần nhất",
  "ytd": "Năm nay (YTD)",
  "all": "Tất cả",
};

const COMMISSION_STATUS_META = {
  pending:     { label: "Chờ đối soát", bg: "#f59e0b15", text: "#d97706" },
  reconciled:  { label: "Đã đối soát",  bg: "#0891b215", text: "#0891b2" },
  paid:        { label: "Đã thanh toán", bg: "#16a34a15", text: "#16a34a" },
  disputed:    { label: "Tranh chấp",   bg: "#ef444415", text: "#dc2626" },
} as const;

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear().toString().slice(2)}`;
}

function sliceByPeriod(period: Period) {
  if (period === "3m") return -3;
  if (period === "6m") return -6;
  if (period === "ytd") return -12;
  return undefined;
}

export function SupplierRevenueDashboard() {
  const { orders } = useOperations();
  const [period, setPeriod] = useState<Period>("6m");
  const [commissionOpen, setCommissionOpen] = useState(false);

  const deliveredOrders = useMemo(() => orders.filter((o) => o.status === "delivered"), [orders]);

  const totalRevenue    = deliveredOrders.reduce((s, o) => s + o.totalVND, 0);
  const pendingRevenue  = orders
    .filter((o) => o.status === "approved" || o.status === "delivering")
    .reduce((s, o) => s + o.totalVND, 0);
  const totalSchools    = new Set(orders.map((o) => o.fromTenantId)).size;
  const totalCommission = commissionRecords.reduce((s, c) => s + c.commissionVND, 0);

  /* ── Monthly time-series, period-aware ── */
  const monthlyData = useMemo(() => {
    const map = new Map<string, { revenue: number; orders: number }>();
    orders.forEach((o) => {
      const k = monthKey(o.createdAt);
      const cur = map.get(k) ?? { revenue: 0, orders: 0 };
      map.set(k, { revenue: cur.revenue + o.totalVND, orders: cur.orders + 1 });
    });
    const all = Array.from(map.entries())
      .sort()
      .map(([month, d]) => ({
        month,
        revenue: Math.round(d.revenue / 1_000_000),
        orders: d.orders,
        target: Math.round((d.revenue / 1_000_000) * 1.15), // 15% growth target
      }));
    const n = sliceByPeriod(period);
    return n ? all.slice(n) : all;
  }, [period, orders]);

  /* ── Revenue by package (pie) ── */
  const revenueByPackage = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      o.items.forEach((it) => {
        map.set(it.packageId, (map.get(it.packageId) || 0) + it.quantity * it.unitPrice);
      });
    });
    return stemPackages
      .map((p) => ({
        name: p.name,
        value: Math.round((map.get(p.id) || 0) / 1_000_000),
        fill: p.tier === "minimum" ? "#94a3b8" : p.tier === "basic" ? "#2e86de" : "#c8a84e",
      }))
      .filter((d) => d.value > 0);
  }, [orders]);

  /* ── Top distributors ── */
  const topDistributors = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      if (o.distributorTenantId)
        map.set(o.distributorTenantId, (map.get(o.distributorTenantId) || 0) + o.totalVND);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tid, rev]) => ({
        distributor: tenants.find((t) => t.id === tid)?.name ?? tid,
        revenue: Math.round(rev / 1_000_000),
      }));
  }, [orders]);

  /* ── Commission records enriched ── */
  const enrichedCommission = useMemo(() =>
    commissionRecords.map((c) => ({
      ...c,
      distributorName: tenants.find((t) => t.id === c.distributorId)?.name ?? c.distributorId,
    })),
  []);

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
            <Download className="w-4 h-4" /> Xuất P&L
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign} label="Doanh thu đã giao" value={formatVNDCompact(totalRevenue)}  color="#990803" change="+23%" trend="up" />
        <KpiCard icon={Package}    label="Đơn pending/delivering" value={formatVNDCompact(pendingRevenue)} color="#f59e0b" subtitle="chưa ghi nhận" />
        <KpiCard icon={SchoolIcon} label="Trường đã đặt hàng" value={totalSchools}  color="#2563eb" />
        <KpiCard icon={Handshake}  label="Hoa hồng đại lý (YTD)" value={formatVNDCompact(totalCommission)} color="#c8a84e" />
      </div>

      {/* Period filter */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>Kỳ báo cáo:</span>
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg border transition-all ${period === p ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Line chart with target */}
        <div className="bg-card rounded-xl border border-border p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
              Doanh thu theo tháng (triệu VND)
            </h3>
            <div className="flex items-center gap-3" style={{ fontSize: "11px" }}>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-[#990803]" /> Thực tế</span>
              <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5 bg-[#c8a84e] border-dashed" style={{ borderStyle: "dashed" }} /> Mục tiêu +15%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number, name: string) => [`${v.toLocaleString()} triệu`, name === "revenue" ? "Thực tế" : "Mục tiêu"]} />
              <Line type="monotone" dataKey="revenue" stroke="#990803" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="revenue" />
              <Line type="monotone" dataKey="target" stroke="#c8a84e" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="target" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Phân bổ theo gói
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={revenueByPackage} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} label={(e) => `${e.value}`}>
                {revenueByPackage.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} triệu`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {revenueByPackage.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: d.fill }} />
                <span className="text-muted-foreground truncate flex-1" style={{ fontSize: "11px" }}>{d.name}</span>
                <span className="text-foreground shrink-0" style={{ fontSize: "11px", fontWeight: 600 }}>{d.value}M</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top distributors bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          Top đại lý theo doanh số (triệu VND)
        </h3>
        <ResponsiveContainer width="100%" height={Math.max(140, topDistributors.length * 40)}>
          <BarChart data={topDistributors} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="distributor" type="category" width={200} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => `${v.toLocaleString()} triệu`} />
            <Bar dataKey="revenue" fill="#c8a84e" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Commission records — collapsible */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setCommissionOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Handshake className="w-4 h-4 text-[#c8a84e]" />
            <span style={{ fontSize: "14px", fontWeight: 600 }}>Bảng đối soát hoa hồng đại lý</span>
            <span className="px-2 py-0.5 bg-[#c8a84e]/10 text-[#c8a84e] rounded-full" style={{ fontSize: "11px", fontWeight: 700 }}>
              {enrichedCommission.length} bản ghi
            </span>
          </div>
          {commissionOpen
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {commissionOpen && (
          <div className="border-t border-border overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                <tr>
                  <th className="px-4 py-2.5 text-left">Kỳ</th>
                  <th className="px-4 py-2.5 text-left">Đại lý</th>
                  <th className="px-4 py-2.5 text-right">DT cơ sở</th>
                  <th className="px-4 py-2.5 text-right">Tỷ lệ %</th>
                  <th className="px-4 py-2.5 text-right">Hoa hồng</th>
                  <th className="px-4 py-2.5 text-center">Trạng thái</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
                {enrichedCommission.map((c) => {
                  const sm = COMMISSION_STATUS_META[c.status];
                  return (
                    <tr key={c.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-2.5 font-mono text-muted-foreground" style={{ fontSize: "11px" }}>{c.period}</td>
                      <td className="px-4 py-2.5" style={{ fontWeight: 500 }}>{c.distributorName}</td>
                      <td className="px-4 py-2.5 text-right">{formatVNDCompact(c.baseRevenueVND)}</td>
                      <td className="px-4 py-2.5 text-right text-[#c8a84e]" style={{ fontWeight: 600 }}>{c.commissionPct}%</td>
                      <td className="px-4 py-2.5 text-right text-[#990803]" style={{ fontWeight: 700 }}>{formatVNDCompact(c.commissionVND)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="px-2 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 600, backgroundColor: sm.bg, color: sm.text }}>
                          {sm.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => toast.info(`Xem chi tiết hoa hồng ${c.period}`)}
                          className="text-[#990803] hover:underline"
                          style={{ fontSize: "11px", fontWeight: 500 }}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-secondary/30 border-t border-border">
                <tr>
                  <td colSpan={4} className="px-4 py-2.5 text-right text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                    TỔNG HOA HỒNG
                  </td>
                  <td className="px-4 py-2.5 text-right text-[#c8a84e]" style={{ fontSize: "14px", fontWeight: 700 }}>
                    {formatVND(totalCommission)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SupplierRevenueDashboard;
