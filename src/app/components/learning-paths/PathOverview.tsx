import { useState } from "react";
import {
  Route, Users, BookOpen, Clock, TrendingUp, Award, AlertCircle,
  CheckCircle2, Target, ArrowUpRight, Building2, Zap, BarChart3,
} from "lucide-react";
import { mockPathsFull, mockEnrollments, mockAssignments, mockPathAnalytics } from "./mock-data";
import type { LearningPathFull } from "./types";

// Mini SVG bar chart
function MiniBarChart({ data, height = 60, color = "#990803" }: { data: number[]; height?: number; color?: string }) {
  const max = Math.max(...data, 1);
  const barW = 100 / data.length;
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height }}>
      {data.map((v, i) => {
        const h = (v / max) * (height - 4);
        return (
          <rect
            key={i}
            x={i * barW + barW * 0.15}
            y={height - h}
            width={barW * 0.7}
            height={h}
            rx={1.5}
            fill={color}
            opacity={0.7 + (i / data.length) * 0.3}
          />
        );
      })}
    </svg>
  );
}

// Donut chart
function DonutChart({ segments, size = 100 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = 36;
  const cx = 50;
  const cy = 50;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dashLen = pct * circ;
        const el = (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none" stroke={seg.color} strokeWidth={12}
            strokeDasharray={`${dashLen} ${circ - dashLen}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        offset += dashLen;
        return el;
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="currentColor" style={{ fontSize: "14px", fontWeight: 700 }}>{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7194" style={{ fontSize: "6px" }}>lộ trình</text>
    </svg>
  );
}

export function PathOverview({ onNavigateTab }: { onNavigateTab: (tab: string) => void }) {
  const activePaths = mockPathsFull.filter(p => p.status === "active");
  const draftPaths = mockPathsFull.filter(p => p.status === "draft");
  const totalEnrolled = mockPathsFull.reduce((s, p) => s + p.enrolledCount, 0);
  const avgCompletion = Math.round(activePaths.reduce((s, p) => s + p.completionRate, 0) / (activePaths.length || 1));
  const mandatoryPaths = activePaths.filter(p => p.mandatory);
  const overdueEnrollments = mockEnrollments.filter(e => e.status === "overdue");
  const completedEnrollments = mockEnrollments.filter(e => e.status === "completed");
  const monthlyData = mockPathAnalytics.monthlyEnrollments.map(m => m.count);
  const completionData = mockPathAnalytics.completionTrend.map(m => m.rate);

  const statCards = [
    { label: "Lộ trình Hoạt động", value: activePaths.length, icon: Route, color: "#990803", bg: "#99080310" },
    { label: "Tổng Học viên", value: totalEnrolled.toLocaleString(), icon: Users, color: "#2e86de", bg: "#2e86de10" },
    { label: "TB Hoàn thành", value: `${avgCompletion}%`, icon: Target, color: "#27ae60", bg: "#27ae6010" },
    { label: "Chứng chỉ đã cấp", value: completedEnrollments.length.toLocaleString(), icon: Award, color: "#c8a84e", bg: "#c8a84e10" },
    { label: "Bắt buộc", value: mandatoryPaths.length, icon: AlertCircle, color: "#e74c3c", bg: "#e74c3c10" },
    { label: "Bản nháp", value: draftPaths.length, icon: Clock, color: "#8b5cf6", bg: "#8b5cf610" },
  ];

  const topPaths = [...activePaths].sort((a, b) => b.enrolledCount - a.enrolledCount).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{s.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Enrollment Trend */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>Xu hướng Ghi danh</h3>
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>12 tháng gần nhất</p>
            </div>
            <div className="flex items-center gap-1 text-green-600" style={{ fontSize: "12px" }}>
              <TrendingUp className="w-3.5 h-3.5" /> +24% so với quý trước
            </div>
          </div>
          <MiniBarChart data={monthlyData} height={80} color="#990803" />
          <div className="flex justify-between mt-2">
            {mockPathAnalytics.monthlyEnrollments.map((m, i) => (
              <span key={i} className="text-muted-foreground" style={{ fontSize: "9px" }}>{m.month}</span>
            ))}
          </div>
        </div>

        {/* Path Status Distribution */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-4" style={{ fontSize: "15px", fontWeight: 600 }}>Phân bổ Lộ trình</h3>
          <div className="flex items-center justify-center mb-4">
            <DonutChart
              size={120}
              segments={[
                { value: activePaths.length, color: "#27ae60", label: "Hoạt động" },
                { value: draftPaths.length, color: "#f59e0b", label: "Bản nháp" },
                { value: mockPathsFull.filter(p => p.status === "archived").length || 1, color: "#6b7280", label: "Lưu trữ" },
              ]}
            />
          </div>
          <div className="space-y-2">
            {[
              { label: "Hoạt động", count: activePaths.length, color: "#27ae60" },
              { label: "Bản nháp", count: draftPaths.length, color: "#f59e0b" },
              { label: "Bắt buộc", count: mandatoryPaths.length, color: "#e74c3c" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{item.label}</span>
                </div>
                <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Paths */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>Lộ trình Phổ biến nhất</h3>
            <button
              onClick={() => onNavigateTab("list")}
              className="text-[#990803] hover:underline cursor-pointer"
              style={{ fontSize: "12px" }}
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-3">
            {topPaths.map((path, i) => (
              <div key={path.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ fontSize: "12px", fontWeight: 700, background: i === 0 ? "#c8a84e" : "#990803" }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 500 }}>{path.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{path.enrolledCount} học viên</span>
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{path.completionRate}% hoàn thành</span>
                  </div>
                </div>
                <div className="w-16">
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#990803]" style={{ width: `${path.completionRate}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Trend Line */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>Tỷ lệ Hoàn thành</h3>
            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700" style={{ fontSize: "11px", fontWeight: 500 }}>
              {completionData[completionData.length - 1]}% hiện tại
            </span>
          </div>
          {/* SVG Line Chart */}
          <svg viewBox="0 0 300 80" className="w-full" style={{ height: 80 }}>
            <defs>
              <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#990803" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#990803" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area */}
            <path
              d={`M0,${80 - (completionData[0] / 100) * 70} ${completionData.map((v, i) => `L${(i / (completionData.length - 1)) * 300},${80 - (v / 100) * 70}`).join(" ")} L300,80 L0,80 Z`}
              fill="url(#compGrad)"
            />
            {/* Line */}
            <polyline
              points={completionData.map((v, i) => `${(i / (completionData.length - 1)) * 300},${80 - (v / 100) * 70}`).join(" ")}
              fill="none" stroke="#990803" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            {/* Dots */}
            {completionData.map((v, i) => (
              <circle
                key={i}
                cx={(i / (completionData.length - 1)) * 300}
                cy={80 - (v / 100) * 70}
                r={2.5} fill="white" stroke="#990803" strokeWidth="1.5"
              />
            ))}
          </svg>
          <div className="flex justify-between mt-2">
            {mockPathAnalytics.completionTrend.map((m, i) => (
              <span key={i} className="text-muted-foreground" style={{ fontSize: "9px" }}>{m.month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>Phân công Gần đây</h3>
          <button
            onClick={() => onNavigateTab("assignments")}
            className="text-[#990803] hover:underline cursor-pointer"
            style={{ fontSize: "12px" }}
          >
            Quản lý Phân công
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Lộ trình", "Đối tượng", "Người phân công", "Deadline", "Tiến độ"].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockAssignments.slice(0, 5).map(a => {
                const pct = a.enrolledCount > 0 ? Math.round((a.completedCount / a.enrolledCount) * 100) : 0;
                return (
                  <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <p className="text-foreground truncate max-w-[200px]" style={{ fontSize: "13px", fontWeight: 500 }}>{a.pathTitle}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{a.assignedTo.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground" style={{ fontSize: "12px" }}>{a.assignedBy}</td>
                    <td className="py-2.5 px-3 text-muted-foreground" style={{ fontSize: "12px" }}>{a.deadline}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#990803]" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Zap, label: "Tạo Lộ trình mới", desc: "Xây dựng từ đầu hoặc từ template", tab: "builder", color: "#990803" },
          { icon: Users, label: "Phân công Đào tạo", desc: "Gán lộ trình cho phòng ban/đơn vị", tab: "assignments", color: "#2e86de" },
          { icon: BarChart3, label: "Xem Phân tích", desc: "Thống kê chi tiết về hiệu quả", tab: "analytics", color: "#27ae60" },
        ].map((action, i) => (
          <button
            key={i}
            onClick={() => onNavigateTab(action.tab)}
            className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:shadow-md transition-all text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${action.color}10` }}>
              <action.icon className="w-5 h-5" style={{ color: action.color }} />
            </div>
            <div className="flex-1">
              <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{action.label}</p>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{action.desc}</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}
