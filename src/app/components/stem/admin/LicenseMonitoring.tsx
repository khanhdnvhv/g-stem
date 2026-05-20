import { useMemo } from "react";
import {
  FileBadge, KeyRound, AlertTriangle, TrendingUp, Download, CheckCircle2,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { licenses, tenants } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { TenantBadge } from "../ui/badges";
import { formatRelative } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  LICENSE MONITORING (Admin) — giám sát license toàn platform      */
/* ================================================================ */

export function LicenseMonitoring() {
  const active = licenses.filter((l) => !l.revokedAt).length;
  const revoked = licenses.length - active;
  const totalSeats = licenses.reduce((s, l) => s + l.seats, 0);
  const usedSeats = licenses.reduce((s, l) => s + l.seatsUsed, 0);

  const expiringSoon = licenses.filter(
    (l) => !l.revokedAt && new Date(l.expiresAt).getTime() - Date.now() < 90 * 86400_000
  ).length;

  const byProduct = useMemo(() => {
    const m = new Map<string, number>();
    licenses.forEach((l) => m.set(l.productName, (m.get(l.productName) || 0) + l.seats));
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, []);

  const byType = useMemo(() => {
    const m: Record<string, number> = { per_user: 0, per_device: 0, site: 0 };
    licenses.forEach((l) => m[l.type]++);
    return [
      { name: "Per user", value: m.per_user, fill: "#0891b2" },
      { name: "Per device", value: m.per_device, fill: "#f59e0b" },
      { name: "Site license", value: m.site, fill: "#7c3aed" },
    ];
  }, []);

  // Top tenants by license usage
  const topTenants = useMemo(() => {
    const m = new Map<string, number>();
    licenses.forEach((l) => m.set(l.tenantId, (m.get(l.tenantId) || 0) + l.seatsUsed));
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tid, used]) => {
      const t = tenants.find((x) => x.id === tid);
      return { tenant: t?.name || tid, type: t?.type, used };
    });
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={FileBadge}
        title="Giám sát License toàn Platform"
        subtitle="Dung lượng lưu trữ, hạn mức tài nguyên và số lượng giấy phép active trên toàn bộ tenant."
        accentColor="#e74c3c"
        actions={
          <button onClick={() => toast.info("Xuất báo cáo license quý cho phòng tài chính")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={CheckCircle2} label="License hoạt động" value={active.toLocaleString()} color="#16a34a" change="+5%" trend="up" />
        <KpiCard icon={KeyRound} label="Seats sử dụng" value={`${usedSeats.toLocaleString()}/${totalSeats.toLocaleString()}`}
          color="#0891b2" subtitle={`${Math.round(usedSeats / totalSeats * 100)}% utilization`} />
        <KpiCard icon={AlertTriangle} label="Sắp hết hạn ≤ 90 ngày" value={expiringSoon} color="#f59e0b" />
        <KpiCard icon={TrendingUp} label="Đã thu hồi" value={revoked} color="#64748b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Tổng seats theo sản phẩm</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byProduct}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#e74c3c" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Phân bổ theo loại license</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byType} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {byType.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {byType.map((d) => (
              <div key={d.name} className="flex items-center gap-2" style={{ fontSize: "11px" }}>
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: d.fill }} />
                <span className="flex-1 text-muted-foreground">{d.name}</span>
                <strong>{d.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Top 8 tenant sử dụng license nhiều nhất</h3>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={topTenants} layout="vertical" margin={{ left: 120 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="tenant" width={180} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="used" fill="#e74c3c" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default LicenseMonitoring;
