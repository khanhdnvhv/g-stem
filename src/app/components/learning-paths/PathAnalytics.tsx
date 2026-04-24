import { useState } from "react";
import {
  TrendingUp, TrendingDown, Users, Target, Clock, BarChart3,
  Building2, AlertTriangle, Download, Filter,
} from "lucide-react";
import { mockPathAnalytics, mockPathsFull, mockEnrollments } from "./mock-data";

// === Custom SVG Charts ===

function BarChartSVG({ data, labelKey, valueKey, valueKey2, color1 = "#990803", color2 = "#c8a84e", height = 180 }: {
  data: Record<string, any>[]; labelKey: string; valueKey: string; valueKey2?: string;
  color1?: string; color2?: string; height?: number;
}) {
  const max = Math.max(...data.map(d => Math.max(d[valueKey], valueKey2 ? d[valueKey2] : 0)), 1);
  const barGroupW = 100 / data.length;
  const hasTwo = !!valueKey2;

  return (
    <div>
      <svg viewBox={`0 0 100 ${height / 2}`} className="w-full" style={{ height }}>
        {data.map((d, i) => {
          const h1 = (d[valueKey] / max) * ((height / 2) - 8);
          const h2 = hasTwo ? (d[valueKey2!] / max) * ((height / 2) - 8) : 0;
          const bw = hasTwo ? barGroupW * 0.35 : barGroupW * 0.6;
          const x1 = i * barGroupW + (hasTwo ? barGroupW * 0.1 : barGroupW * 0.2);
          const x2 = x1 + bw + barGroupW * 0.05;
          return (
            <g key={i}>
              <rect x={x1} y={(height / 2) - h1} width={bw} height={h1} rx={1} fill={color1} opacity={0.85} />
              {hasTwo && <rect x={x2} y={(height / 2) - h2} width={bw} height={h2} rx={1} fill={color2} opacity={0.85} />}
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-muted-foreground text-center flex-1" style={{ fontSize: "9px" }}>
            {d[labelKey].length > 8 ? d[labelKey].slice(0, 7) + "…" : d[labelKey]}
          </span>
        ))}
      </div>
    </div>
  );
}

function LineChartSVG({ data, xKey, yKey, color = "#990803", height = 140, showArea = true }: {
  data: Record<string, any>[]; xKey: string; yKey: string;
  color?: string; height?: number; showArea?: boolean;
}) {
  const values = data.map(d => d[yKey]);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 300;
  const h = height;
  const pad = 4;

  const points = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * (w - 2 * pad),
    y: pad + ((max - d[yKey]) / range) * (h - 2 * pad),
  }));

  const lineStr = points.map(p => `${p.x},${p.y}`).join(" ");
  const areaStr = `${points[0].x},${h} ${lineStr} ${points[points.length - 1].x},${h}`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(pct => (
          <line key={pct} x1={pad} y1={pad + pct * (h - 2 * pad)} x2={w - pad} y2={pad + pct * (h - 2 * pad)}
            stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4,4" />
        ))}
        {showArea && (
          <polygon points={areaStr} fill={color} opacity="0.08" />
        )}
        <polyline points={lineStr} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="white" stroke={color} strokeWidth="2" />
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-muted-foreground" style={{ fontSize: "9px" }}>{d[xKey]}</span>
        ))}
      </div>
    </div>
  );
}

function HorizontalBarChart({ data, height = 24 }: { data: { label: string; value: number; max: number; color: string }[]; height?: number }) {
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-foreground" style={{ fontSize: "12px" }}>{d.label}</span>
            <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{d.value}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(d.value / d.max) * 100}%`, background: d.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PathAnalytics() {
  const [selectedPath, setSelectedPath] = useState("all");
  const analytics = mockPathAnalytics;

  const activePaths = mockPathsFull.filter(p => p.status === "active");
  const totalEnrolled = activePaths.reduce((s, p) => s + p.enrolledCount, 0);
  const avgCompletion = Math.round(activePaths.reduce((s, p) => s + p.completionRate, 0) / (activePaths.length || 1));
  const avgRating = (activePaths.reduce((s, p) => s + p.avgRating, 0) / (activePaths.length || 1)).toFixed(1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>Phân tích Lộ trình Đào tạo</h3>
          <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Dữ liệu tổng hợp từ {activePaths.length} lộ trình đang hoạt động</p>
        </div>
        <div className="flex gap-2">
          <select value={selectedPath} onChange={e => setSelectedPath(e.target.value)}
            className="px-3 py-2 bg-input-background rounded-lg border-0" style={{ fontSize: "12px" }}>
            <option value="all">Tất cả Lộ trình</option>
            {mockPathsFull.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 cursor-pointer" style={{ fontSize: "12px" }}
            onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất báo cáo lộ trình đào tạo...")); }}>
            <Download className="w-3.5 h-3.5" /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Tổng Ghi danh", value: totalEnrolled.toLocaleString(), change: "+24%", up: true, icon: Users, color: "#990803" },
          { label: "TB Hoàn thành", value: `${avgCompletion}%`, change: "+8%", up: true, icon: Target, color: "#27ae60" },
          { label: "TB Thời gian", value: `${analytics.avgCompletionDays}d`, change: "-3d", up: true, icon: Clock, color: "#2e86de" },
          { label: "Đánh giá TB", value: avgRating, change: "+0.2", up: true, icon: BarChart3, color: "#c8a84e" },
          { label: "Lộ trình Rủi ro", value: analytics.dropOffPoints.filter(d => d.dropRate > 20).length.toString(), change: "-1", up: true, icon: AlertTriangle, color: "#e74c3c" },
        ].map((kpi, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{kpi.label}</span>
            </div>
            <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>{kpi.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {kpi.up ? <TrendingUp className="w-3 h-3 text-green-600" /> : <TrendingDown className="w-3 h-3 text-red-600" />}
              <span className="text-green-600" style={{ fontSize: "10px" }}>{kpi.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Enrollments */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Lượt Ghi danh theo Tháng</h4>
          <LineChartSVG data={analytics.monthlyEnrollments} xKey="month" yKey="count" color="#990803" height={160} />
        </div>

        {/* Completion Trend */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Xu hướng Tỷ lệ Hoàn thành</h4>
          <LineChartSVG data={analytics.completionTrend} xKey="month" yKey="rate" color="#27ae60" height={160} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Department Breakdown */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Phân bổ theo Đơn vị</h4>
          <BarChartSVG
            data={analytics.departmentBreakdown}
            labelKey="dept" valueKey="enrolled" valueKey2="completed"
            color1="#990803" color2="#c8a84e"
            height={200}
          />
          <div className="flex items-center gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: "#990803" }} />
              <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Ghi danh</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: "#c8a84e" }} />
              <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Hoàn thành</span>
            </div>
          </div>
        </div>

        {/* Drop-off Analysis */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>Điểm Bỏ dở (Drop-off)</h4>
            <span className="px-2 py-0.5 rounded bg-red-50 text-red-700" style={{ fontSize: "10px", fontWeight: 500 }}>
              {analytics.dropOffPoints.filter(d => d.dropRate > 20).length} cảnh báo
            </span>
          </div>
          <HorizontalBarChart
            data={analytics.dropOffPoints.map(d => ({
              label: d.courseTitle,
              value: d.dropRate,
              max: Math.max(...analytics.dropOffPoints.map(x => x.dropRate)),
              color: d.dropRate > 20 ? "#e74c3c" : d.dropRate > 15 ? "#f59e0b" : "#27ae60",
            }))}
          />
          <div className="mt-4 p-3 bg-red-50/50 rounded-lg border border-red-100">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800" style={{ fontSize: "12px", fontWeight: 500 }}>AI Insight: Điểm bỏ dở cao</p>
                <p className="text-red-600 mt-0.5" style={{ fontSize: "11px" }}>
                  Khóa "Quản lý Dự án theo PMI" có tỷ lệ bỏ dở 28% - cao nhất trong hệ thống. Đề xuất: chia nhỏ nội dung, thêm bài tập thực hành và hỗ trợ mentor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Path Comparison Table */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>So sánh Hiệu quả Lộ trình</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Lộ trình", "Cấp độ", "Học viên", "Hoàn thành", "Đánh giá", "Thời gian", "Hiệu quả"].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activePaths.map(p => {
                const efficiency = Math.round((p.completionRate * p.avgRating) / 5);
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="py-2.5 px-3">
                      <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{p.title}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{p.subsidiary}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground" style={{ fontSize: "10px" }}>{p.level}</span>
                    </td>
                    <td className="py-2.5 px-3 text-foreground" style={{ fontSize: "12px" }}>{p.enrolledCount}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${p.completionRate}%`, background: p.completionRate >= 80 ? "#27ae60" : p.completionRate >= 50 ? "#f59e0b" : "#e74c3c" }} />
                        </div>
                        <span style={{ fontSize: "11px" }}>{p.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[#c8a84e]" style={{ fontSize: "12px", fontWeight: 600 }}>★ {p.avgRating}</span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground" style={{ fontSize: "12px" }}>{p.totalDuration}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${efficiency >= 70 ? "bg-green-500" : efficiency >= 50 ? "bg-yellow-500" : "bg-red-500"}`} />
                        <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{efficiency}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}