import { useMemo } from "react";
import {
  Landmark, School as SchoolIcon, Users, GraduationCap,
  TrendingUp, ClipboardCheck, Download, AlertTriangle,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { provinceSnapshots, authorityReports } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatNumberCompact, formatRelative } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  REGIONAL EDUCATION DASHBOARD — Dashboard toàn ngành GDPT        */
/* ================================================================ */

export function RegionalEducationDashboard() {
  const { user } = useAuth();
  const myProvince = user?.province || "Hà Nội";

  // Snapshot của tỉnh hiện tại
  const snapshot = useMemo(
    () => provinceSnapshots.find((p) => p.province === myProvince) || provinceSnapshots[0],
    [myProvince]
  );

  // Top 10 tỉnh — so sánh
  const topProvinces = useMemo(
    () => [...provinceSnapshots].sort((a, b) => b.stemCoveragePct - a.stemCoveragePct).slice(0, 10),
    []
  );

  // Chất lượng STEM 12 tháng qua (mock)
  const monthlyQuality = [
    { month: "T5", coverage: 62, quality: 7.1 },
    { month: "T6", coverage: 64, quality: 7.2 },
    { month: "T7", coverage: 65, quality: 7.3 },
    { month: "T8", coverage: 68, quality: 7.5 },
    { month: "T9", coverage: 70, quality: 7.6 },
    { month: "T10", coverage: 72, quality: 7.7 },
    { month: "T11", coverage: 73, quality: 7.7 },
    { month: "T12", coverage: 75, quality: 7.8 },
    { month: "T1/26", coverage: 77, quality: 7.9 },
    { month: "T2/26", coverage: 79, quality: 8.0 },
    { month: "T3/26", coverage: 80, quality: 8.1 },
    { month: "T4/26", coverage: snapshot.stemCoveragePct, quality: snapshot.avgStemScore },
  ];

  // Phân bổ khối trường (mock)
  const schoolTiers = [
    { name: "Mầm non", value: 820, fill: "#0891b2" },
    { name: "Tiểu học", value: 1050, fill: "#16a34a" },
    { name: "THCS", value: 580, fill: "#c8a84e" },
    { name: "THPT", value: 340, fill: "#7c3aed" },
    { name: "THPT Nghề", value: 60, fill: "#dc2626" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Landmark}
        title={`Dashboard Toàn ngành — ${myProvince}`}
        subtitle={`${user?.name} · ${user?.tenantName}. Dữ liệu cập nhật từ CSDL ngành giáo dục.`}
        accentColor="#7c3aed"
        actions={
          <button onClick={() => toast.info("Xuất báo cáo toàn cảnh cho Ban chỉ đạo")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Xuất toàn cảnh
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={SchoolIcon} label="Tổng số trường" value={formatNumberCompact(snapshot.schools)} color="#7c3aed" subtitle={`${snapshot.districts} quận/huyện`} />
        <KpiCard icon={GraduationCap} label="Giáo viên" value={formatNumberCompact(snapshot.teachers)} color="#2563eb" change="+3.2%" trend="up" />
        <KpiCard icon={Users} label="Học sinh" value={formatNumberCompact(snapshot.students)} color="#0891b2" />
        <KpiCard icon={TrendingUp} label="Bao phủ STEM" value={`${snapshot.stemCoveragePct}%`} color="#16a34a" change="+4%" trend="up" subtitle="Số trường triển khai" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={ClipboardCheck} label="Thiết bị đạt chuẩn" value={`${snapshot.equipmentCompliancePct}%`} color="#c8a84e" />
        <KpiCard icon={TrendingUp} label="Điểm STEM TB" value={snapshot.avgStemScore.toFixed(1)} color="#990803" change="+0.3" trend="up" />
        <KpiCard icon={AlertTriangle} label="Trường dưới 50% bao phủ" value={
          Math.round(snapshot.schools * (1 - snapshot.stemCoveragePct / 100) * 0.3)
        } color="#dc2626" />
        <KpiCard icon={Download} label="Báo cáo Thông tư đã xuất" value={authorityReports.length} color="#64748b" />
      </div>

      {/* Chart row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 lg:col-span-2">
          <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Chỉ số STEM theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyQuality}>
              <defs>
                <linearGradient id="covGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} domain={[50, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[6, 10]} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area yAxisId="left" type="monotone" dataKey="coverage" stroke="#7c3aed" fill="url(#covGrad)" strokeWidth={2} name="Bao phủ (%)" />
              <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#c8a84e" strokeWidth={2} dot={{ r: 3 }} name="Điểm TB" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Phân bổ khối trường
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={schoolTiers} dataKey="value" cx="50%" cy="50%"
                innerRadius={40} outerRadius={75} paddingAngle={3}>
                {schoolTiers.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {schoolTiers.map((t) => (
              <div key={t.name} className="flex items-center gap-1.5" style={{ fontSize: "11px" }}>
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: t.fill }} />
                <span className="flex-1 text-muted-foreground truncate">{t.name}</span>
                <strong>{formatNumberCompact(t.value)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top provinces */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          Top 10 tỉnh/thành phố — Bao phủ STEM (%)
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topProvinces} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} />
            <YAxis type="category" dataKey="province" width={130} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => `${v}%`} />
            <Bar dataKey="stemCoveragePct" radius={[0, 6, 6, 0]}>
              {topProvinces.map((p, i) => (
                <Cell key={i}
                  fill={p.province === myProvince ? "#7c3aed" : "#0891b2"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent reports */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
            Báo cáo gần đây
          </h3>
        </div>
        <div className="divide-y divide-border">
          {authorityReports.slice(0, 5).map((r) => (
            <div key={r.id} className="p-3 flex items-center gap-3 hover:bg-secondary/50">
              <div className="flex-1">
                <p style={{ fontSize: "13px", fontWeight: 500 }}>{r.name}</p>
                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                  {r.scope} · {r.period} · xuất {formatRelative(r.generatedAt)}
                </p>
              </div>
              <button onClick={() => toast.info(`Tải ${r.name}`)}
                className="p-1.5 hover:bg-secondary rounded" title="Tải xuống">
                <Download className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RegionalEducationDashboard;
