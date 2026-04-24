import { useState, useMemo } from "react";
import {
  Building2, BarChart3, TrendingUp, Clock, Users, AlertTriangle,
  ChevronDown, ChevronRight, Award, Target, Zap, Eye,
} from "lucide-react";
import {
  MOCK_SUBSIDIARY_STATS, MOCK_INSTRUCTOR_METRICS, MOCK_SUBMISSIONS,
  GRADING_COURSES, type SubsidiaryGradeStats,
} from "./mock-data";

// ─── Custom SVG Charts ───

function SubsidiaryBarChart({ data }: { data: { name: string; avg: number; passRate: number }[] }) {
  const barH = 22, gap = 5;
  const totalH = data.length * (barH + gap);
  const maxAvg = 100;

  return (
    <svg viewBox={`0 0 480 ${totalH + 5}`} className="w-full" style={{ height: Math.max(totalH + 5, 200) }}>
      {data.map((d, i) => {
        const y = i * (barH + gap);
        const barW1 = (d.avg / maxAvg) * 200;
        const barW2 = (d.passRate / 100) * 200;
        const c1 = d.avg >= 75 ? "#22c55e" : d.avg >= 60 ? "#eab308" : "#ef4444";
        const shortName = d.name.replace("Tap doan ", "").replace("BDS Geleximco - ", "").replace("Ngan hang TMCP An Binh ", "");
        return (
          <g key={d.name}>
            <text x="0" y={y + barH / 2 + 4} fill="#6b7280" fontSize="9" textAnchor="start">
              {shortName.length > 16 ? shortName.slice(0, 14) + "..." : shortName}
            </text>
            {/* Avg score bar */}
            <rect x="115" y={y} width={barW1} height={barH / 2 - 1} rx="2" fill={c1} opacity="0.8" />
            <text x={120 + barW1} y={y + barH / 2 - 2} fill={c1} fontSize="8" fontWeight="700">{d.avg}</text>
            {/* Pass rate bar */}
            <rect x="115" y={y + barH / 2 + 1} width={barW2} height={barH / 2 - 1} rx="2" fill="#3b82f6" opacity="0.5" />
            <text x={120 + barW2} y={y + barH} fill="#3b82f6" fontSize="8" fontWeight="600">{d.passRate}%</text>
          </g>
        );
      })}
    </svg>
  );
}

function MonthlyTrendChart({ stats }: { stats: SubsidiaryGradeStats[] }) {
  const months = ["T10", "T11", "T12", "T01", "T02", "T03"];
  const w = 380, h = 150, pad = 35;
  // Pick top 5 subsidiaries
  const top5 = stats.slice(0, 5);
  const colors = ["#990803", "#c8a84e", "#3b82f6", "#22c55e", "#8b5cf6"];

  return (
    <svg viewBox={`0 0 ${w} ${h + 25}`} className="w-full h-44">
      {[0, 0.5, 1].map(r => (
        <g key={r}>
          <line x1={pad} y1={h - r * (h - 20)} x2={w - 5} y2={h - r * (h - 20)} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4,4" />
          <text x={pad - 4} y={h - r * (h - 20) + 4} textAnchor="end" fill="#9ca3af" fontSize="8">{Math.round(r * 100)}</text>
        </g>
      ))}
      {months.map((m, i) => (
        <text key={m} x={pad + (i / 5) * (w - pad - 10)} y={h + 14} textAnchor="middle" fill="#6b7280" fontSize="8">{m}</text>
      ))}
      {top5.map((sub, si) => {
        const points = sub.monthlyTrend.map((v, i) => ({
          x: pad + (i / 5) * (w - pad - 10),
          y: h - (v / 100) * (h - 20),
        }));
        const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
        return (
          <g key={sub.subsidiary}>
            <path d={d} fill="none" stroke={colors[si]} strokeWidth="1.5" strokeLinejoin="round" opacity="0.7" />
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="2" fill={colors[si]} />
            ))}
          </g>
        );
      })}
      {/* Legend */}
      {top5.map((sub, si) => {
        const shortName = sub.subsidiary.replace("Tap doan ", "").replace("BDS Geleximco - ", "").replace("Ngan hang TMCP An Binh ", "");
        return (
          <g key={sub.subsidiary + "_legend"}>
            <rect x={pad + si * 70} y={h + 18} width="8" height="4" rx="1" fill={colors[si]} />
            <text x={pad + si * 70 + 11} y={h + 22} fill="#6b7280" fontSize="7">
              {shortName.length > 8 ? shortName.slice(0, 7) + ".." : shortName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function EnterpriseGradeView() {
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [period, setPeriod] = useState("month");

  // KPIs
  const totalGraded = MOCK_SUBSIDIARY_STATS.reduce((s, v) => s + v.totalGraded, 0);
  const totalPending = MOCK_SUBSIDIARY_STATS.reduce((s, v) => s + v.pendingCount, 0);
  const avgScore = Math.round(MOCK_SUBSIDIARY_STATS.reduce((s, v) => s + v.avgScore, 0) / MOCK_SUBSIDIARY_STATS.length * 10) / 10;
  const avgPassRate = Math.round(MOCK_SUBSIDIARY_STATS.reduce((s, v) => s + v.passRate, 0) / MOCK_SUBSIDIARY_STATS.length * 10) / 10;

  // Sort by avg
  const sortedStats = useMemo(() =>
    [...MOCK_SUBSIDIARY_STATS].sort((a, b) => b.avgScore - a.avgScore),
    []
  );

  // Alerts
  const alerts = useMemo(() => {
    const list: { type: "danger" | "warning" | "info"; message: string }[] = [];
    MOCK_SUBSIDIARY_STATS.forEach(s => {
      if (s.avgScore < 60) list.push({ type: "danger", message: `${s.subsidiary.replace("BDS Geleximco - ", "")} có điểm TB ${s.avgScore} — dưới ngưỡng Đạt` });
      if (s.pendingCount > 15) list.push({ type: "warning", message: `${s.subsidiary.replace("BDS Geleximco - ", "")} còn ${s.pendingCount} bài chưa chấm` });
    });
    MOCK_INSTRUCTOR_METRICS.forEach(m => {
      if (m.pendingCount > 15) list.push({ type: "warning", message: `GV ${m.name} có ${m.pendingCount} bài pending chưa chấm` });
    });
    return list;
  }, []);

  return (
    <div className="space-y-4">
      {/* Period filter */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400" style={{ fontSize: "12px" }}>Dữ liệu tổng hợp toàn Tập đoàn Geleximco (14 đơn vị thành viên)</p>
        <div className="flex gap-1">
          {[
            { key: "month", label: "Tháng này" },
            { key: "quarter", label: "Quý này" },
            { key: "year", label: "Năm nay" },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                period === p.key ? "bg-[#990803] text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
              style={{ fontSize: "11px", fontWeight: 500 }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Mega Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Tổng bài đã chấm", value: totalGraded.toLocaleString(), icon: BarChart3, color: "#990803", bg: "linear-gradient(135deg, #990803, #c8102e)" },
          { label: "Điểm TB Tập đoàn", value: avgScore, icon: Target, color: "#c8a84e", bg: "linear-gradient(135deg, #c8a84e, #e0c068)" },
          { label: "Tỷ lệ Đạt", value: `${avgPassRate}%`, icon: Award, color: "#22c55e", bg: "linear-gradient(135deg, #22c55e, #4ade80)" },
          { label: "Bài chờ chấm", value: totalPending, icon: Clock, color: "#f59e0b", bg: "linear-gradient(135deg, #f59e0b, #fbbf24)" },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-xl p-4 text-white" style={{ background: kpi.bg }}>
              <Icon className="w-5 h-5 mb-2 opacity-80" />
              <p style={{ fontSize: "24px", fontWeight: 700 }}>{kpi.value}</p>
              <p className="opacity-80" style={{ fontSize: "11.5px" }}>{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subsidiary Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Building2 className="w-4 h-4 text-[#990803]" /> So sánh 14 Đơn vị Thành viên
          </h3>
          <div className="flex gap-4 mb-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 rounded bg-green-500" />
              <span className="text-gray-400" style={{ fontSize: "10px" }}>Điểm TB</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 rounded bg-blue-400" />
              <span className="text-gray-400" style={{ fontSize: "10px" }}>Tỷ lệ Đạt</span>
            </div>
          </div>
          <SubsidiaryBarChart data={sortedStats.map(s => ({ name: s.subsidiary, avg: s.avgScore, passRate: s.passRate }))} />
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <TrendingUp className="w-4 h-4 text-[#c8a84e]" /> Xu hướng Điểm theo Tháng (Top 5)
          </h3>
          <MonthlyTrendChart stats={sortedStats} />
        </div>
      </div>

      {/* Alert Panel */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <AlertTriangle className="w-4 h-4 text-orange-500" /> Cảnh báo ({alerts.length})
          </h3>
          <div className="space-y-1.5">
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  a.type === "danger" ? "bg-red-50" : a.type === "warning" ? "bg-orange-50" : "bg-blue-50"
                }`}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: a.type === "danger" ? "#dc2626" : a.type === "warning" ? "#f97316" : "#3b82f6" }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: a.type === "danger" ? "#991b1b" : a.type === "warning" ? "#9a3412" : "#1e3a5f",
                  }}
                >
                  {a.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subsidiary Detail Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-gray-700" style={{ fontSize: "14px", fontWeight: 600 }}>Chi tiết từng Đơn vị</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]" style={{ fontSize: "12px" }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500">
                <th className="text-left py-2.5 px-4" style={{ fontWeight: 600 }}>Đơn vị thành viên</th>
                <th className="text-center py-2.5 px-2" style={{ fontWeight: 600 }}>Đã chấm</th>
                <th className="text-center py-2.5 px-2" style={{ fontWeight: 600 }}>Chờ chấm</th>
                <th className="text-center py-2.5 px-2" style={{ fontWeight: 600 }}>Điểm TB</th>
                <th className="text-center py-2.5 px-2" style={{ fontWeight: 600 }}>Tỷ lệ Đạt</th>
                <th className="text-center py-2.5 px-2" style={{ fontWeight: 600 }}>Tổng HV</th>
                <th className="text-left py-2.5 px-2" style={{ fontWeight: 600 }}>Khóa tốt nhất</th>
                <th className="text-center py-2.5 px-2" style={{ fontWeight: 600 }}>Xu hướng</th>
                <th className="text-center py-2.5 px-2" style={{ fontWeight: 600 }}></th>
              </tr>
            </thead>
            <tbody>
              {sortedStats.map(stat => {
                const isExpanded = expandedSub === stat.subsidiary;
                const trend = stat.monthlyTrend;
                const trendUp = trend[trend.length - 1] > trend[trend.length - 2];
                const shortName = stat.subsidiary
                  .replace("Tap doan ", "")
                  .replace("BDS Geleximco - ", "")
                  .replace("Ngan hang TMCP An Binh ", "");

                return (
                  <tr
                    key={stat.subsidiary}
                    className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer ${isExpanded ? "bg-gray-50/30" : ""}`}
                    onClick={() => setExpandedSub(isExpanded ? null : stat.subsidiary)}
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#990803] shrink-0" />
                        <span className="text-gray-700" style={{ fontWeight: 500 }}>{shortName}</span>
                      </div>
                    </td>
                    <td className="text-center py-2.5 px-2 text-gray-700" style={{ fontWeight: 600 }}>{stat.totalGraded}</td>
                    <td className="text-center py-2.5 px-2">
                      <span style={{ fontWeight: 600, color: stat.pendingCount > 15 ? "#dc2626" : stat.pendingCount > 8 ? "#f97316" : "#22c55e" }}>
                        {stat.pendingCount}
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-2">
                      <span
                        className="px-2 py-0.5 rounded"
                        style={{
                          fontWeight: 700,
                          color: stat.avgScore >= 75 ? "#16a34a" : stat.avgScore >= 60 ? "#eab308" : "#dc2626",
                          backgroundColor: stat.avgScore >= 75 ? "#f0fdf4" : stat.avgScore >= 60 ? "#fefce8" : "#fef2f2",
                        }}
                      >
                        {stat.avgScore}
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-2">
                      <span style={{ fontWeight: 600, color: stat.passRate >= 85 ? "#16a34a" : stat.passRate >= 70 ? "#eab308" : "#dc2626" }}>
                        {stat.passRate}%
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-2 text-gray-600">{stat.totalStudents}</td>
                    <td className="py-2.5 px-2 text-gray-600">
                      {stat.topCourse.length > 20 ? stat.topCourse.slice(0, 18) + "..." : stat.topCourse}
                    </td>
                    <td className="text-center py-2.5 px-2">
                      <span
                        className="flex items-center justify-center gap-0.5"
                        style={{ color: trendUp ? "#16a34a" : "#dc2626", fontSize: "11px", fontWeight: 600 }}
                      >
                        {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                        {trendUp ? "+" : "-"}{Math.abs(trend[trend.length - 1] - trend[trend.length - 2])}
                      </span>
                    </td>
                    <td className="text-center py-2.5 px-2">
                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructor Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          <Users className="w-4 h-4 text-[#c8a84e]" /> Hiệu suất Giảng viên
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {MOCK_INSTRUCTOR_METRICS.map(m => (
            <div key={m.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                  style={{ fontSize: "11px", fontWeight: 700, background: "linear-gradient(145deg, #c8a84e, #a08738)" }}
                >
                  {m.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{m.name}</p>
                  <p className="text-gray-400 truncate" style={{ fontSize: "10px" }}>{m.department}</p>
                </div>
                <span className="text-[#c8a84e]" style={{ fontSize: "12px", fontWeight: 600 }}>★ {m.rating}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-gray-700" style={{ fontSize: "14px", fontWeight: 700 }}>{m.totalGraded}</p>
                  <p className="text-gray-400" style={{ fontSize: "9px" }}>Đã chấm</p>
                </div>
                <div className="text-center">
                  <p style={{ fontSize: "14px", fontWeight: 700, color: m.pendingCount > 10 ? "#dc2626" : "#22c55e" }}>{m.pendingCount}</p>
                  <p className="text-gray-400" style={{ fontSize: "9px" }}>Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-700" style={{ fontSize: "14px", fontWeight: 700 }}>{m.avgGradingTimeMinutes}p</p>
                  <p className="text-gray-400" style={{ fontSize: "9px" }}>TB thời gian</p>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400" style={{ fontSize: "10px" }}>Consistency</span>
                  <span className="text-gray-600" style={{ fontSize: "10px", fontWeight: 600 }}>{m.consistencyScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${m.consistencyScore}%`,
                      backgroundColor: m.consistencyScore >= 85 ? "#22c55e" : m.consistencyScore >= 70 ? "#eab308" : "#ef4444",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
