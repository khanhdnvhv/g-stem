import { useState } from "react";
import {
  AlertTriangle, CheckCircle, Clock, ShieldAlert, TrendingDown,
  ChevronRight, ExternalLink,
} from "lucide-react";
import {
  COMPLIANCE_PROGRAMS, PROGRAM_TYPE_CONFIG, RISK_LEVEL_CONFIG,
  FREQUENCY_CONFIG, getComplianceStats,
  type ComplianceProgram,
} from "./mock-data";

interface ComplianceOverviewProps {
  onSelectProgram: (id: string) => void;
}

export function ComplianceOverview({ onSelectProgram }: ComplianceOverviewProps) {
  const stats = getComplianceStats();
  const [sortBy, setSortBy] = useState<"risk" | "rate" | "overdue">("risk");

  const sorted = [...COMPLIANCE_PROGRAMS].sort((a, b) => {
    if (sortBy === "risk") {
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    if (sortBy === "rate") return (a.totalCompliant / a.totalRequired) - (b.totalCompliant / b.totalRequired);
    return b.totalOverdue - a.totalOverdue;
  });

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard
          label="Tỷ lệ Tuân thủ"
          value={`${stats.overallRate}%`}
          color={stats.overallRate >= 80 ? "#16a34a" : stats.overallRate >= 60 ? "#f59e0b" : "#dc2626"}
          sub={`${stats.totalCompliant.toLocaleString()}/${stats.totalRequired.toLocaleString()} nhân viên`}
        />
        <KPICard label="Quá hạn" value={stats.totalOverdue.toLocaleString()} color="#dc2626" sub="cần hành động ngay" icon={<AlertTriangle className="w-4 h-4" />} />
        <KPICard label="Sắp hết hạn" value={stats.totalExpiring.toLocaleString()} color="#f59e0b" sub="trong 30 ngày tới" icon={<Clock className="w-4 h-4" />} />
        <KPICard label="Chương trình" value={COMPLIANCE_PROGRAMS.length.toString()} color="#2563eb" sub={`${stats.criticalPrograms} rủi ro cao`} />
        <KPICard label="Đơn vị" value="14" color="#990803" sub="đang theo dõi" />
      </div>

      {/* Compliance Gauge + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Big Gauge */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center">
          <h3 className="text-gray-700 mb-2 self-start" style={{ fontSize: "14px", fontWeight: 600 }}>Tuân thủ Tổng thể</h3>
          <ComplianceGauge value={stats.overallRate} />
          <div className="flex items-center gap-4 mt-3 w-full">
            <StatusRow color="#16a34a" label="Tuân thủ" value={stats.totalCompliant.toLocaleString()} />
            <StatusRow color="#f59e0b" label="Sắp hạn" value={stats.totalExpiring.toLocaleString()} />
            <StatusRow color="#dc2626" label="Quá hạn" value={stats.totalOverdue.toLocaleString()} />
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700 flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
              <ShieldAlert className="w-4 h-4 text-[#dc2626]" /> Cảnh báo Rủi ro
            </h3>
          </div>
          <div className="space-y-2">
            {COMPLIANCE_PROGRAMS
              .filter(p => p.totalOverdue > 0 || p.riskLevel === "critical")
              .sort((a, b) => b.totalOverdue - a.totalOverdue)
              .slice(0, 5)
              .map(p => {
                const rate = Math.round((p.totalCompliant / p.totalRequired) * 100);
                const rCfg = RISK_LEVEL_CONFIG[p.riskLevel];
                const tCfg = PROGRAM_TYPE_CONFIG[p.type];
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors cursor-pointer"
                    onClick={() => onSelectProgram(p.id)}
                  >
                    <span style={{ fontSize: "18px" }}>{tCfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>{p.shortName}</span>
                        <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "8px", fontWeight: 700, color: rCfg.color, backgroundColor: rCfg.bg }}>
                          {rCfg.label}
                        </span>
                      </div>
                      <p className="text-gray-400" style={{ fontSize: "11px" }}>
                        {p.totalOverdue} quá hạn • {p.totalExpiring} sắp hết hạn • Hạn: {p.nextDeadline}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p style={{ fontSize: "16px", fontWeight: 700, color: rate < 70 ? "#dc2626" : rate < 85 ? "#f59e0b" : "#16a34a" }}>
                        {rate}%
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Programs by Type Chart + Programs List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Type breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Theo Loại chương trình</h3>
          <ProgramTypeChart />
        </div>

        {/* Programs list */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-700" style={{ fontSize: "14px", fontWeight: 600 }}>Tất cả Chương trình Bắt buộc</h3>
            <div className="flex items-center gap-1">
              {(["risk", "rate", "overdue"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-2 py-1 rounded-md cursor-pointer transition-colors ${sortBy === s ? "bg-[#990803]/10 text-[#990803]" : "text-gray-400 hover:text-gray-600"}`}
                  style={{ fontSize: "10px", fontWeight: 600 }}
                >
                  {s === "risk" ? "Rủi ro" : s === "rate" ? "Tỷ lệ" : "Quá hạn"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            {sorted.map(p => {
              const rate = Math.round((p.totalCompliant / p.totalRequired) * 100);
              const tCfg = PROGRAM_TYPE_CONFIG[p.type];
              const rCfg = RISK_LEVEL_CONFIG[p.riskLevel];
              const fCfg = FREQUENCY_CONFIG[p.frequency];
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => onSelectProgram(p.id)}
                >
                  <span style={{ fontSize: "16px" }}>{tCfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-700 truncate" style={{ fontSize: "13px", fontWeight: 500 }}>{p.name}</span>
                      <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "8px", fontWeight: 600, color: rCfg.color, backgroundColor: rCfg.bg }}>
                        {rCfg.label}
                      </span>
                      <span className="text-gray-300" style={{ fontSize: "9px" }}>{fCfg.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-gray-400" style={{ fontSize: "10px" }}>
                      <span>Yêu cầu: {p.requiredBy}</span>
                      <span>Hạn: {p.nextDeadline}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${rate}%`, backgroundColor: rate < 70 ? "#dc2626" : rate < 85 ? "#f59e0b" : "#16a34a" }} />
                        </div>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: rate < 70 ? "#dc2626" : rate < 85 ? "#f59e0b" : "#16a34a" }}>{rate}%</span>
                      </div>
                      <p className="text-gray-300 mt-0.5" style={{ fontSize: "9px" }}>
                        {p.totalCompliant.toLocaleString()}/{p.totalRequired.toLocaleString()}
                      </p>
                    </div>
                    {p.totalOverdue > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 shrink-0" style={{ fontSize: "10px", fontWeight: 700 }}>
                        {p.totalOverdue} quá hạn
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function KPICard({ label, value, color, sub, icon }: { label: string; value: string; color: string; sub: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-400" style={{ fontSize: "11px" }}>{label}</span>
        {icon && <span style={{ color }}>{icon}</span>}
      </div>
      <p style={{ fontSize: "24px", fontWeight: 700, color }}>{value}</p>
      <p className="text-gray-300 mt-0.5" style={{ fontSize: "10px" }}>{sub}</p>
    </div>
  );
}

function StatusRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-gray-400" style={{ fontSize: "10px" }}>{label}</span>
      <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function ComplianceGauge({ value }: { value: number }) {
  const cx = 100, cy = 100, r = 70;
  const sw = 18;
  // Semi-circle: 180 degrees
  const totalArc = Math.PI * r;
  const filledArc = (value / 100) * totalArc;
  const color = value >= 80 ? "#16a34a" : value >= 60 ? "#f59e0b" : "#dc2626";

  return (
    <svg width="200" height="130" viewBox="0 0 200 130">
      {/* Background arc */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#f0f0f0" strokeWidth={sw} strokeLinecap="round"
      />
      {/* Filled arc */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={`${filledArc} ${totalArc}`}
        className="transition-all duration-700"
      />
      {/* Colored tick marks */}
      {[0, 25, 50, 75, 100].map(pct => {
        const angle = Math.PI + (pct / 100) * Math.PI;
        const x1 = cx + (r - sw / 2 - 2) * Math.cos(angle);
        const y1 = cy + (r - sw / 2 - 2) * Math.sin(angle);
        const x2 = cx + (r + sw / 2 + 2) * Math.cos(angle);
        const y2 = cy + (r + sw / 2 + 2) * Math.sin(angle);
        return <line key={pct} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="2" />;
      })}
      {/* Center text */}
      <text x={cx} y={cy - 10} textAnchor="middle" fill={color} style={{ fontSize: "32px", fontWeight: 700 }}>{value}%</text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "10px" }}>Tuân thủ chung</text>
      {/* Scale labels */}
      <text x={cx - r - 5} y={cy + 15} textAnchor="middle" fill="#d1d5db" style={{ fontSize: "9px" }}>0%</text>
      <text x={cx} y={cy - r + 5} textAnchor="middle" fill="#d1d5db" style={{ fontSize: "9px" }}>50%</text>
      <text x={cx + r + 5} y={cy + 15} textAnchor="middle" fill="#d1d5db" style={{ fontSize: "9px" }}>100%</text>
    </svg>
  );
}

function ProgramTypeChart() {
  const typeGroups: Record<string, { count: number; overdue: number; compliantRate: number }> = {};
  COMPLIANCE_PROGRAMS.forEach(p => {
    if (!typeGroups[p.type]) typeGroups[p.type] = { count: 0, overdue: 0, compliantRate: 0 };
    typeGroups[p.type].count++;
    typeGroups[p.type].overdue += p.totalOverdue;
    typeGroups[p.type].compliantRate += Math.round((p.totalCompliant / p.totalRequired) * 100);
  });

  const entries = Object.entries(typeGroups).map(([type, data]) => ({
    type,
    ...data,
    avgRate: Math.round(data.compliantRate / data.count),
  })).sort((a, b) => a.avgRate - b.avgRate);

  return (
    <div className="space-y-3">
      {entries.map(e => {
        const cfg = PROGRAM_TYPE_CONFIG[e.type as keyof typeof PROGRAM_TYPE_CONFIG];
        return (
          <div key={e.type}>
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5">
                <span style={{ fontSize: "14px" }}>{cfg.icon}</span>
                <span className="text-gray-600" style={{ fontSize: "12px" }}>{cfg.label}</span>
              </span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: e.avgRate < 70 ? "#dc2626" : e.avgRate < 85 ? "#f59e0b" : "#16a34a" }}>
                {e.avgRate}%
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${e.avgRate}%`, backgroundColor: cfg.color }} />
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-gray-300" style={{ fontSize: "9px" }}>{e.count} chương trình</span>
              {e.overdue > 0 && <span className="text-red-500" style={{ fontSize: "9px" }}>{e.overdue.toLocaleString()} quá hạn</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
