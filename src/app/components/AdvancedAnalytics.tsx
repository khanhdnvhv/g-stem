import { useState, useMemo } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Users, BookOpen, Clock,
  Award, Target, Building2, Filter, Download, Calendar, ArrowRight,
  ChevronDown, Eye, Zap, Brain, Flame, Star, CheckCircle2,
  AlertTriangle, FileText,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { SUBSIDIARIES } from "./mock-data";

// SVG Mini Charts
function MiniBarChart({ data, height = 60, color = "#990803" }: { data: number[]; height?: number; color?: string }) {
  const max = Math.max(...data, 1);
  const w = 200;
  const barW = w / data.length - 2;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      {data.map((v, i) => {
        const h = (v / max) * (height - 4);
        return <rect key={i} x={i * (barW + 2) + 1} y={height - h - 2} width={barW} height={h} rx={2} fill={color} opacity={0.8 + (i / data.length) * 0.2} />;
      })}
    </svg>
  );
}

function MiniLineChart({ data, height = 50, color = "#990803" }: { data: number[]; height?: number; color?: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - 4 - ((v - min) / range) * (height - 8)}`).join(" ");
  const areaPoints = `0,${height} ${points} ${w},${height}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      <polygon points={areaPoints} fill={color} opacity={0.1} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * w} cy={height - 4 - ((v - min) / range) * (height - 8)} r={i === data.length - 1 ? 3 : 0} fill={color} />
      ))}
    </svg>
  );
}

function DonutChart({ segments, size = 120 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  let cumAngle = -90;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => {
        const angle = (seg.value / total) * 360;
        const startRad = (cumAngle * Math.PI) / 180;
        const endRad = ((cumAngle + angle) * Math.PI) / 180;
        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);
        const largeArc = angle > 180 ? 1 : 0;
        cumAngle += angle;
        return <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`} fill={seg.color} opacity={0.85} />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.6} fill="white" />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#374151" style={{ fontSize: "16px", fontWeight: 700 }}>{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "8px" }}>Tổng</text>
    </svg>
  );
}

function HeatmapGrid({ data, labels }: { data: number[][]; labels: { rows: string[]; cols: string[] } }) {
  const max = Math.max(...data.flat(), 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ fontSize: "9px" }}>
        <thead>
          <tr>
            <th className="p-1 text-left text-gray-400" style={{ fontWeight: 500 }} />
            {labels.cols.map((col) => <th key={col} className="p-1 text-center text-gray-400" style={{ fontWeight: 500, minWidth: "32px" }}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={ri}>
              <td className="p-1 text-gray-500 text-right pr-2" style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{labels.rows[ri]}</td>
              {row.map((val, ci) => {
                const intensity = val / max;
                return (
                  <td key={ci} className="p-0.5">
                    <div className="w-full aspect-square rounded-sm flex items-center justify-center"
                      style={{ backgroundColor: `rgba(153, 8, 3, ${intensity * 0.8 + 0.05})`, color: intensity > 0.5 ? "white" : "#666", fontSize: "8px", fontWeight: 600 }}>
                      {val}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdvancedAnalytics() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("quarter");
  const [selectedSubsidiary, setSelectedSubsidiary] = useState("all");

  const monthlyHours = [1200, 1450, 1680, 1520, 1890, 2100, 2350, 2180, 2450, 2600, 2800, 3100];
  const monthlyCompletions = [120, 145, 168, 152, 189, 210, 235, 218, 245, 260, 280, 310];
  const monthlyEnrollments = [280, 320, 350, 310, 420, 480, 510, 460, 520, 580, 620, 680];
  const satisfactionScores = [78, 80, 82, 81, 83, 85, 84, 86, 87, 88, 89, 90];

  const subsidiaryPerformance = [
    { name: "Tập đoàn Geleximco", employees: 420, enrolled: 380, completed: 310, hours: 4200, satisfaction: 92 },
    { name: "ABBank", employees: 1800, enrolled: 1650, completed: 1200, hours: 18500, satisfaction: 88 },
    { name: "ABS", employees: 280, enrolled: 250, completed: 195, hours: 2800, satisfaction: 86 },
    { name: "Bảo hiểm AAA", employees: 350, enrolled: 310, completed: 240, hours: 3200, satisfaction: 84 },
    { name: "Xi măng Thăng Long", employees: 850, enrolled: 780, completed: 620, hours: 8500, satisfaction: 90 },
    { name: "Khoáng sản Geleximco", employees: 620, enrolled: 580, completed: 480, hours: 6200, satisfaction: 91 },
    { name: "Nhiệt điện Thăng Long", employees: 450, enrolled: 420, completed: 350, hours: 4800, satisfaction: 87 },
  ];

  const categoryPerformance = [
    { name: "Kỹ năng Lãnh đạo", courses: 12, enrolled: 820, completion: 78, satisfaction: 4.8 },
    { name: "An toàn Lao động", courses: 8, enrolled: 1520, completion: 92, satisfaction: 4.6 },
    { name: "Nghiệp vụ NH", courses: 15, enrolled: 680, completion: 72, satisfaction: 4.5 },
    { name: "CNTT & CĐS", courses: 10, enrolled: 450, completion: 68, satisfaction: 4.7 },
    { name: "ESG & PTBV", courses: 5, enrolled: 280, completion: 85, satisfaction: 4.4 },
    { name: "Tuân thủ PL", courses: 7, enrolled: 920, completion: 88, satisfaction: 4.3 },
  ];

  const heatmapData = [
    [45, 32, 28, 15, 8, 52, 48],
    [38, 42, 35, 22, 12, 45, 40],
    [25, 28, 30, 18, 10, 35, 32],
    [55, 48, 42, 28, 15, 60, 55],
    [42, 38, 35, 20, 8, 48, 45],
  ];
  const heatmapLabels = {
    rows: ["06-09h", "09-12h", "12-15h", "15-18h", "18-21h"],
    cols: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>Phân tích Nâng cao</h1>
          <p className="text-gray-500 mt-1" style={{ fontSize: "13px" }}>
            Analytics chuyên sâu cho quản trị đào tạo toàn Tập đoàn Geleximco
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
            {(["week", "month", "quarter", "year"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${period === p ? "bg-white shadow-sm text-[#990803]" : "text-gray-500"}`}
                style={{ fontSize: "11px", fontWeight: 500 }}>
                {p === "week" ? "Tuần" : p === "month" ? "Tháng" : p === "quarter" ? "Quý" : "Năm"}
              </button>
            ))}
          </div>
          <select value={selectedSubsidiary} onChange={(e) => setSelectedSubsidiary(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white cursor-pointer" style={{ fontSize: "12px" }}>
            <option value="all">Toàn Tập đoàn</option>
            {SUBSIDIARIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px" }}
            onClick={() => toast.success("Đang xuất báo cáo phân tích nâng cao...")}>
            <Download className="w-3.5 h-3.5" /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng giờ học", value: "24,510", change: "+18.5%", up: true, icon: Clock, color: "#990803", sparkline: monthlyHours },
          { label: "Hoàn thành", value: "2,532", change: "+22.3%", up: true, icon: CheckCircle2, color: "#27ae60", sparkline: monthlyCompletions },
          { label: "Đăng ký mới", value: "5,820", change: "+15.8%", up: true, icon: Users, color: "#2e86de", sparkline: monthlyEnrollments },
          { label: "Hài lòng", value: "89%", change: "+3.2%", up: true, icon: Star, color: "#c8a84e", sparkline: satisfactionScores },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                <span className="text-gray-500" style={{ fontSize: "11px" }}>{kpi.label}</span>
              </div>
              <span className={`flex items-center gap-0.5 ${kpi.up ? "text-green-600" : "text-red-500"}`} style={{ fontSize: "10px", fontWeight: 600 }}>
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {kpi.change}
              </span>
            </div>
            <p className="text-gray-800 mb-2" style={{ fontSize: "22px", fontWeight: 700 }}>{kpi.value}</p>
            <MiniLineChart data={kpi.sparkline} height={32} color={kpi.color} />
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-gray-800 mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Xu hướng Học tập theo Tháng</h3>
          <MiniBarChart data={monthlyHours} height={120} color="#990803" />
          <div className="flex items-center justify-between mt-2">
            {["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"].map((m) => (
              <span key={m} className="text-gray-400" style={{ fontSize: "9px" }}>{m}</span>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1.5 text-gray-500" style={{ fontSize: "11px" }}>
              <div className="w-2 h-2 rounded-full bg-[#990803]" /> Giờ học (ngàn)
            </span>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-gray-800 mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Phân bố theo Danh mục</h3>
          <div className="flex items-center gap-6">
            <DonutChart segments={[
              { value: 25, color: "#990803", label: "Lãnh đạo" },
              { value: 30, color: "#2e86de", label: "An toàn" },
              { value: 18, color: "#c8a84e", label: "Nghiệp vụ NH" },
              { value: 12, color: "#27ae60", label: "CNTT" },
              { value: 8, color: "#8b5cf6", label: "ESG" },
              { value: 7, color: "#f97316", label: "Khác" },
            ]} size={130} />
            <div className="flex-1 space-y-2">
              {categoryPerformance.map((cat) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <div className="w-24 truncate"><span className="text-gray-600" style={{ fontSize: "10px" }}>{cat.name}</span></div>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#990803] rounded-full" style={{ width: `${cat.completion}%` }} />
                  </div>
                  <span className="text-gray-500 shrink-0" style={{ fontSize: "10px", fontWeight: 600 }}>{cat.completion}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subsidiary Performance Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-gray-800 mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Hiệu suất theo Đơn vị Thành viên</h3>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: "12px" }}>
            <thead>
              <tr className="border-b border-gray-200">
                {["Đơn vị", "Nhân sự", "Đã đăng ký", "Hoàn thành", "Giờ học", "Tỷ lệ", "Hài lòng"].map((h) => (
                  <th key={h} className="py-2 px-3 text-left text-gray-500" style={{ fontWeight: 600, fontSize: "11px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subsidiaryPerformance.map((sub) => {
                const completionRate = Math.round((sub.completed / sub.enrolled) * 100);
                const enrollRate = Math.round((sub.enrolled / sub.employees) * 100);
                return (
                  <tr key={sub.name} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 px-3">
                      <span className="text-gray-700" style={{ fontWeight: 500 }}>{sub.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{sub.employees.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{sub.enrolled.toLocaleString()}</span>
                        <span className="text-gray-400" style={{ fontSize: "10px" }}>({enrollRate}%)</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{sub.completed.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-gray-600">{sub.hours.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${completionRate}%`, backgroundColor: completionRate >= 85 ? "#22c55e" : completionRate >= 70 ? "#f59e0b" : "#ef4444" }} />
                        </div>
                        <span style={{ fontWeight: 600, color: completionRate >= 85 ? "#22c55e" : completionRate >= 70 ? "#f59e0b" : "#ef4444", fontSize: "11px" }}>{completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" />
                        <span className="text-gray-600" style={{ fontWeight: 500 }}>{sub.satisfaction}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Learning Heatmap */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-gray-800 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Heatmap Giờ học (Tuần)</h3>
          <p className="text-gray-400 mb-3" style={{ fontSize: "11px" }}>Số lượng lượt học theo khung giờ và ngày trong tuần</p>
          <HeatmapGrid data={heatmapData} labels={heatmapLabels} />
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-400" style={{ fontSize: "9px" }}>Ít</span>
            <div className="flex items-center gap-0.5">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => (
                <div key={o} className="w-4 h-2 rounded-sm" style={{ backgroundColor: `rgba(153, 8, 3, ${o})` }} />
              ))}
            </div>
            <span className="text-gray-400" style={{ fontSize: "9px" }}>Nhiều</span>
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
            <AlertTriangle className="w-4 h-4 text-orange-500" /> Cảnh báo & Rủi ro
          </h3>
          <div className="space-y-3">
            {[
              { level: "high", title: "85 nhân sự chưa hoàn thành ATLĐ bắt buộc", detail: "Deadline: 31/03/2026 — Khoáng sản GX, Xi măng TL", icon: AlertTriangle },
              { level: "medium", title: "Tỷ lệ dropout tăng 12% tại Nhiệt điện TL", detail: "Khóa Vận hành Nhà máy — cần review nội dung", icon: TrendingDown },
              { level: "medium", title: "3 giảng viên chưa phản hồi đánh giá", detail: "Quá hạn 7 ngày — cần nhắc nhở", icon: Clock },
              { level: "low", title: "Chứng chỉ An toàn sắp hết hạn (45 người)", detail: "Hạn: 30/04/2026 — cần gia hạn hoặc thi lại", icon: Award },
              { level: "info", title: "Khóa mới 'ESG cho Lãnh đạo' đang chờ duyệt", detail: "Đã submit 3 ngày — cần review", icon: FileText },
            ].map((alert, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${alert.level === "high" ? "border-red-200 bg-red-50" : alert.level === "medium" ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-gray-50"}`}>
                <alert.icon className={`w-4 h-4 shrink-0 mt-0.5 ${alert.level === "high" ? "text-red-500" : alert.level === "medium" ? "text-orange-500" : "text-gray-400"}`} />
                <div>
                  <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{alert.title}</p>
                  <p className="text-gray-400 mt-0.5" style={{ fontSize: "10px" }}>{alert.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}