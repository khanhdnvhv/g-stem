import { useState, useMemo } from "react";
import {
  BarChart3, TrendingUp, Target, Award, Users, ArrowUp, ArrowDown,
} from "lucide-react";
import { MOCK_SUBMISSIONS, MOCK_GRADEBOOK, GRADING_COURSES, MOCK_INSTRUCTOR_METRICS } from "./mock-data";

interface GradeAnalyticsProps {
  isAdmin: boolean;
}

// ─── Custom SVG Charts ───

function DistributionChart({ data }: { data: { range: string; count: number; color: string }[] }) {
  const maxC = Math.max(...data.map(d => d.count), 1);
  const w = 380, h = 180, pad = 40, barGap = 4;
  const barW = (w - pad - 10) / data.length - barGap;

  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full h-48">
      {[0, 0.25, 0.5, 0.75, 1].map(r => (
        <g key={r}>
          <line x1={pad} y1={h - r * (h - 20)} x2={w} y2={h - r * (h - 20)} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4,4" />
          <text x={pad - 4} y={h - r * (h - 20) + 4} textAnchor="end" fill="#9ca3af" fontSize="9">{Math.round(maxC * r)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = pad + 5 + i * (barW + barGap);
        const barH = (d.count / maxC) * (h - 20);
        return (
          <g key={d.range}>
            <rect x={x} y={h - barH} width={barW} height={barH} rx="3" fill={d.color} opacity="0.85" />
            <text x={x + barW / 2} y={h + 14} textAnchor="middle" fill="#6b7280" fontSize="8">{d.range}</text>
            {d.count > 0 && <text x={x + barW / 2} y={h - barH - 4} textAnchor="middle" fill={d.color} fontSize="9" fontWeight="700">{d.count}</text>}
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ pass, fail }: { pass: number; fail: number }) {
  const total = pass + fail || 1;
  const passP = pass / total;
  const r = 60, cx = 80, cy = 80, stroke = 18;
  const circ = 2 * Math.PI * r;
  const passLen = passP * circ;
  const failLen = circ - passLen;

  return (
    <svg viewBox="0 0 160 160" className="w-36 h-36 mx-auto">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fee2e2" strokeWidth={stroke} />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke="#22c55e" strokeWidth={stroke}
        strokeDasharray={`${passLen} ${failLen}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
      />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#111827" fontSize="22" fontWeight="700">
        {Math.round(passP * 100)}%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#6b7280" fontSize="10">Tỷ lệ Đạt</text>
    </svg>
  );
}

function CourseBarChart({ data }: { data: { name: string; avg: number }[] }) {
  const maxV = Math.max(...data.map(d => d.avg), 100);
  const h = 24;
  const gap = 6;
  const totalH = data.length * (h + gap);

  return (
    <svg viewBox={`0 0 360 ${totalH + 10}`} className="w-full" style={{ height: totalH + 10 }}>
      {data.map((d, i) => {
        const y = i * (h + gap);
        const barW = (d.avg / maxV) * 220;
        const color = d.avg >= 80 ? "#22c55e" : d.avg >= 60 ? "#eab308" : "#ef4444";
        return (
          <g key={d.name}>
            <text x="0" y={y + h / 2 + 4} fill="#6b7280" fontSize="9" textAnchor="start">
              {d.name.length > 18 ? d.name.slice(0, 16) + "..." : d.name}
            </text>
            <rect x="130" y={y + 2} width={barW} height={h - 4} rx="4" fill={color} opacity="0.8" />
            <text x={135 + barW} y={y + h / 2 + 4} fill={color} fontSize="10" fontWeight="700">{d.avg}</text>
          </g>
        );
      })}
    </svg>
  );
}

function TrendLineChart({ data, labels }: { data: number[]; labels: string[] }) {
  const w = 360, h = 140, pad = 30;
  const maxV = Math.max(...data, 100);
  const minV = Math.min(...data, 0);
  const range = maxV - minV || 1;
  const points = data.map((v, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad - 10),
    y: h - 10 - ((v - minV) / range) * (h - 30),
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${h - 10} L ${points[0].x} ${h - 10} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h + 15}`} className="w-full h-40">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#990803" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#990803" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map(r => (
        <g key={r}>
          <line x1={pad} y1={h - 10 - r * (h - 30)} x2={w - 10} y2={h - 10 - r * (h - 30)} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4,4" />
          <text x={pad - 4} y={h - 6 - r * (h - 30)} textAnchor="end" fill="#9ca3af" fontSize="9">{Math.round(minV + r * range)}</text>
        </g>
      ))}
      <path d={areaD} fill="url(#trendGrad)" />
      <path d={pathD} fill="none" stroke="#990803" strokeWidth="2" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#990803" stroke="white" strokeWidth="2" />
          <text x={p.x} y={h + 12} textAnchor="middle" fill="#6b7280" fontSize="8">{labels[i]}</text>
          <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#990803" fontSize="9" fontWeight="600">{data[i]}</text>
        </g>
      ))}
    </svg>
  );
}

export function GradeAnalytics({ isAdmin }: GradeAnalyticsProps) {
  const [courseFilter, setCourseFilter] = useState("all");

  // Compute stats from submissions
  const stats = useMemo(() => {
    const graded = MOCK_SUBMISSIONS.filter(s => s.score !== null);
    const scores = graded.map(s => s.score!);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : 0;
    const sorted = [...scores].sort((a, b) => a - b);
    const median = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
    const min = sorted.length > 0 ? sorted[0] : 0;
    const max = sorted.length > 0 ? sorted[sorted.length - 1] : 0;
    const passCount = scores.filter(s => s >= 60).length;
    const passRate = scores.length > 0 ? Math.round(passCount / scores.length * 1000) / 10 : 0;

    // Std dev
    const variance = scores.length > 0 ? scores.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / scores.length : 0;
    const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;

    return { total: graded.length, avg, median, min, max, passCount, failCount: scores.length - passCount, passRate, stdDev };
  }, []);

  // Distribution data
  const distribution = useMemo(() => {
    const bins = Array.from({ length: 10 }, (_, i) => ({ range: `${i * 10}-${i * 10 + 9}`, count: 0, color: "" }));
    MOCK_SUBMISSIONS.filter(s => s.score !== null).forEach(s => {
      const idx = Math.min(9, Math.floor(s.score! / 10));
      bins[idx].count++;
    });
    bins.forEach((b, i) => {
      b.color = i >= 8 ? "#16a34a" : i >= 6 ? "#84cc16" : i >= 4 ? "#eab308" : i >= 2 ? "#f97316" : "#ef4444";
    });
    return bins;
  }, []);

  // Course avg
  const courseAvgs = useMemo(() => {
    return GRADING_COURSES.map(c => {
      const courseSubs = MOCK_SUBMISSIONS.filter(s => s.courseId === c.id && s.score !== null);
      const avg = courseSubs.length > 0 ? Math.round(courseSubs.reduce((a, b) => a + b.score!, 0) / courseSubs.length) : 0;
      return { name: c.name, avg };
    }).sort((a, b) => b.avg - a.avg);
  }, []);

  // Monthly trend (mock)
  const months = ["T10/25", "T11/25", "T12/25", "T01/26", "T02/26", "T03/26"];
  const trendData = [68, 72, 70, 75, 78, stats.avg];

  // Top/Bottom students
  const topStudents = useMemo(() => {
    return [...MOCK_GRADEBOOK]
      .filter(e => e.average !== null)
      .sort((a, b) => (b.average || 0) - (a.average || 0))
      .slice(0, 5);
  }, []);

  const bottomStudents = useMemo(() => {
    return [...MOCK_GRADEBOOK]
      .filter(e => e.average !== null)
      .sort((a, b) => (a.average || 0) - (b.average || 0))
      .slice(0, 5);
  }, []);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {[
          { label: "Tổng đã chấm", value: stats.total, icon: BarChart3, color: "#3b82f6" },
          { label: "Điểm TB", value: stats.avg, icon: Target, color: "#990803" },
          { label: "Tỷ lệ Đạt", value: `${stats.passRate}%`, icon: Award, color: "#22c55e" },
          { label: "Median", value: stats.median, icon: TrendingUp, color: "#8b5cf6" },
          { label: "Cao nhất", value: stats.max, icon: ArrowUp, color: "#16a34a" },
          { label: "Thấp nhất", value: stats.min, icon: ArrowDown, color: "#dc2626" },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <Icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: kpi.color }} />
              <p style={{ fontSize: "18px", fontWeight: 700, color: kpi.color }}>{kpi.value}</p>
              <p className="text-gray-400" style={{ fontSize: "10.5px" }}>{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Score Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Phân bố Điểm số</h3>
          <DistributionChart data={distribution} />
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="text-gray-400" style={{ fontSize: "10px" }}>Std Dev: {stats.stdDev}</span>
            <span className="text-gray-400" style={{ fontSize: "10px" }}>|</span>
            <span className="text-gray-400" style={{ fontSize: "10px" }}>Đạt: {stats.passCount} | Chưa đạt: {stats.failCount}</span>
          </div>
        </div>

        {/* Pass/Fail Donut + Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Tỷ lệ Đạt / Chưa đạt</h3>
          <div className="flex items-center gap-6">
            <DonutChart pass={stats.passCount} fail={stats.failCount} />
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600 flex-1" style={{ fontSize: "12px" }}>Đạt (≥60)</span>
                <span className="text-green-600" style={{ fontSize: "13px", fontWeight: 700 }}>{stats.passCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-gray-600 flex-1" style={{ fontSize: "12px" }}>Chưa đạt (&lt;60)</span>
                <span className="text-red-500" style={{ fontSize: "13px", fontWeight: 700 }}>{stats.failCount}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400" style={{ fontSize: "11px" }}>Mean</span>
                  <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{stats.avg}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400" style={{ fontSize: "11px" }}>Median</span>
                  <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{stats.median}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400" style={{ fontSize: "11px" }}>Range</span>
                  <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{stats.min} — {stats.max}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Comparison */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Điểm TB theo Khóa học</h3>
          <CourseBarChart data={courseAvgs} />
        </div>

        {/* Trend Line */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Xu hướng Điểm TB 6 tháng</h3>
          <TrendLineChart data={trendData} labels={months} />
        </div>
      </div>

      {/* Top / Bottom Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <ArrowUp className="w-4 h-4 text-green-500" /> Top 5 Học viên Xuất sắc
          </h3>
          <div className="space-y-2">
            {topStudents.map((s, i) => (
              <div key={s.studentId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ fontSize: "10px", fontWeight: 700, backgroundColor: i === 0 ? "#c8a84e" : i === 1 ? "#9ca3af" : i === 2 ? "#b45309" : "#d1d5db" }}
                >
                  {i + 1}
                </span>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ fontSize: "10px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}
                >
                  {s.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate" style={{ fontSize: "12.5px", fontWeight: 500 }}>{s.studentName}</p>
                  <p className="text-gray-400 truncate" style={{ fontSize: "10px" }}>{s.subsidiary}</p>
                </div>
                <span className="text-green-600 shrink-0" style={{ fontSize: "14px", fontWeight: 700 }}>{s.average}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <ArrowDown className="w-4 h-4 text-red-500" /> 5 Học viên Cần Cải thiện
          </h3>
          <div className="space-y-2">
            {bottomStudents.map((s, i) => (
              <div key={s.studentId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 bg-gray-100 shrink-0"
                  style={{ fontSize: "10px", fontWeight: 600 }}
                >
                  {i + 1}
                </span>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ fontSize: "10px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}
                >
                  {s.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate" style={{ fontSize: "12.5px", fontWeight: 500 }}>{s.studentName}</p>
                  <p className="text-gray-400 truncate" style={{ fontSize: "10px" }}>{s.subsidiary}</p>
                </div>
                <span className="text-red-500 shrink-0" style={{ fontSize: "14px", fontWeight: 700 }}>{s.average}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructor Metrics (Admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Users className="w-4 h-4 text-[#c8a84e]" /> Hiệu suất Giảng viên Chấm điểm
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]" style={{ fontSize: "12px" }}>
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left py-2 px-3" style={{ fontWeight: 600 }}>Giảng viên</th>
                  <th className="text-center py-2 px-2" style={{ fontWeight: 600 }}>Đã chấm</th>
                  <th className="text-center py-2 px-2" style={{ fontWeight: 600 }}>TB thời gian</th>
                  <th className="text-center py-2 px-2" style={{ fontWeight: 600 }}>Điểm TB cho</th>
                  <th className="text-center py-2 px-2" style={{ fontWeight: 600 }}>Consistency</th>
                  <th className="text-center py-2 px-2" style={{ fontWeight: 600 }}>TB nhận xét</th>
                  <th className="text-center py-2 px-2" style={{ fontWeight: 600 }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INSTRUCTOR_METRICS.map(m => (
                  <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                          style={{ fontSize: "10px", fontWeight: 700, background: "linear-gradient(145deg, #c8a84e, #a08738)" }}
                        >
                          {m.initials}
                        </div>
                        <div>
                          <p className="text-gray-700" style={{ fontWeight: 500 }}>{m.name}</p>
                          <p className="text-gray-400" style={{ fontSize: "10px" }}>{m.subsidiary.replace("BDS Geleximco - ", "").slice(0, 25)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-2 px-2 text-gray-700" style={{ fontWeight: 600 }}>{m.totalGraded}</td>
                    <td className="text-center py-2 px-2 text-gray-600">{m.avgGradingTimeMinutes} phút</td>
                    <td className="text-center py-2 px-2">
                      <span style={{ fontWeight: 600, color: m.avgScore >= 75 ? "#22c55e" : m.avgScore >= 65 ? "#eab308" : "#ef4444" }}>
                        {m.avgScore}
                      </span>
                    </td>
                    <td className="text-center py-2 px-2">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${m.consistencyScore}%`,
                              backgroundColor: m.consistencyScore >= 85 ? "#22c55e" : m.consistencyScore >= 70 ? "#eab308" : "#ef4444",
                            }}
                          />
                        </div>
                        <span className="text-gray-600" style={{ fontSize: "11px" }}>{m.consistencyScore}%</span>
                      </div>
                    </td>
                    <td className="text-center py-2 px-2 text-gray-600">{m.avgFeedbackLength} ký tự</td>
                    <td className="text-center py-2 px-2">
                      <span className="text-[#c8a84e]" style={{ fontWeight: 600 }}>★ {m.rating}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}