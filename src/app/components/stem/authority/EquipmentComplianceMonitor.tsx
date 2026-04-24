import { useMemo } from "react";
import {
  ClipboardCheck, CheckCircle2, AlertTriangle, Wrench, Download,
  TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { equipment, tenantsByType } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { EquipmentStatusBadge } from "../ui/badges";
import { toast } from "sonner";

/* ================================================================ */
/*  EQUIPMENT COMPLIANCE MONITOR (Authority)                        */
/*  Tỷ lệ đạt chuẩn / chưa đạt chuẩn theo khối trường, quận/huyện   */
/* ================================================================ */

export function EquipmentComplianceMonitor() {
  // Build per-school stats
  const schoolStats = useMemo(() => {
    return tenantsByType.school.map((s) => {
      const eq = equipment.filter((e) => e.schoolId === s.id);
      const ok = eq.filter((e) => e.status === "ok").length;
      const broken = eq.filter((e) => e.status === "broken" || e.status === "missing").length;
      return {
        school: s.name, district: s.district, tier: s.gradeLevels?.[0] || "THCS",
        total: eq.length, ok, broken,
        compliancePct: eq.length ? Math.round((ok / eq.length) * 100) : 0,
      };
    });
  }, []);

  // Distribution of equipment by status
  const byStatus = useMemo(() => {
    const m: Record<string, number> = { ok: 0, warning: 0, broken: 0, missing: 0 };
    equipment.forEach((e) => m[e.status]++);
    return [
      { name: "Hoạt động tốt", value: m.ok, fill: "#16a34a" },
      { name: "Cần kiểm tra", value: m.warning, fill: "#f59e0b" },
      { name: "Hỏng hóc", value: m.broken, fill: "#dc2626" },
      { name: "Thất lạc", value: m.missing, fill: "#64748b" },
    ];
  }, []);

  // By school tier
  const byTier = useMemo(() => {
    const m = new Map<string, { ok: number; notOk: number }>();
    schoolStats.forEach((s) => {
      const prev = m.get(s.tier) || { ok: 0, notOk: 0 };
      m.set(s.tier, {
        ok: prev.ok + s.ok,
        notOk: prev.notOk + (s.total - s.ok),
      });
    });
    return Array.from(m.entries()).map(([tier, v]) => ({ tier, ...v }));
  }, [schoolStats]);

  const totalEquipment = equipment.length;
  const totalOk = equipment.filter((e) => e.status === "ok").length;
  const avgCompliance = Math.round((totalOk / totalEquipment) * 100);

  const underperforming = [...schoolStats]
    .sort((a, b) => a.compliancePct - b.compliancePct).slice(0, 5);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ClipboardCheck}
        title="Giám sát Tình trạng Thiết bị"
        subtitle="Số lượng, giá trị, tình trạng sử dụng và tỷ lệ đạt chuẩn/chưa đạt chuẩn tại các trường trực thuộc."
        accentColor="#7c3aed"
        actions={
          <button onClick={() => toast.success("Xuất báo cáo giám sát thiết bị cho Sở GD&ĐT")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={ClipboardCheck} label="Tổng thiết bị" value={totalEquipment.toLocaleString()} color="#7c3aed" subtitle="Toàn tỉnh" />
        <KpiCard icon={CheckCircle2} label="Đạt chuẩn" value={`${avgCompliance}%`} color="#16a34a" change="+2%" trend="up" />
        <KpiCard icon={AlertTriangle} label="Hỏng / Thất lạc" value={equipment.filter((e) => e.status === "broken" || e.status === "missing").length} color="#dc2626" />
        <KpiCard icon={Wrench} label="Cần kiểm tra" value={equipment.filter((e) => e.status === "warning").length} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Phân bổ thiết bị theo tình trạng
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" cx="50%" cy="50%"
                innerRadius={50} outerRadius={85} paddingAngle={3}
                label={(e) => `${e.value}`}>
                {byStatus.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {byStatus.map((s) => (
              <div key={s.name} className="flex items-center gap-2" style={{ fontSize: "11px" }}>
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: s.fill }} />
                <span className="flex-1 text-muted-foreground">{s.name}</span>
                <strong>{s.value}</strong>
                <span className="text-muted-foreground">({Math.round((s.value / totalEquipment) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            So sánh theo cấp học
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byTier}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="ok" stackId="a" fill="#16a34a" name="Đạt chuẩn" radius={[0, 0, 0, 0]} />
              <Bar dataKey="notOk" stackId="a" fill="#dc2626" name="Chưa đạt" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Underperforming schools */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
            <AlertTriangle className="w-4 h-4 inline mr-1.5 text-[#dc2626]" />
            Trường cần hỗ trợ — tỷ lệ thiết bị đạt chuẩn thấp nhất
          </h3>
        </div>
        <table className="w-full">
          <thead className="bg-secondary/30 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              <th className="px-4 py-2">Trường</th>
              <th className="px-4 py-2">Quận/huyện</th>
              <th className="px-4 py-2 text-right">Tổng TB</th>
              <th className="px-4 py-2 text-right">Đạt chuẩn</th>
              <th className="px-4 py-2 text-right">Chưa đạt</th>
              <th className="px-4 py-2">Tỷ lệ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
            {underperforming.map((s) => (
              <tr key={s.school} className="hover:bg-secondary/50">
                <td className="px-4 py-3" style={{ fontWeight: 500 }}>{s.school}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.district}</td>
                <td className="px-4 py-3 text-right">{s.total}</td>
                <td className="px-4 py-3 text-right text-[#16a34a]" style={{ fontWeight: 600 }}>{s.ok}</td>
                <td className="px-4 py-3 text-right text-[#dc2626]" style={{ fontWeight: 600 }}>{s.broken}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full"
                        style={{ width: `${s.compliancePct}%`,
                          backgroundColor: s.compliancePct >= 70 ? "#16a34a" : s.compliancePct >= 50 ? "#c8a84e" : "#dc2626" }} />
                    </div>
                    <span style={{ fontSize: "11.5px", fontWeight: 600 }}>{s.compliancePct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EquipmentComplianceMonitor;
