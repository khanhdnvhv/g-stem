import { useState } from "react";
import {
  BarChart3, TrendingUp, Users, BookOpen, Clock, Eye,
  Target, Filter, Download, Calendar, Search,
  ArrowUp, ArrowDown, ChevronRight, Activity,
  Layers, Zap, Award, Star, Brain,
  Building2, UserCheck, MousePointer, Timer,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface CohortData {
  week: string;
  enrolled: number;
  active: number;
  completed: number;
  dropped: number;
}

interface FunnelStep {
  label: string;
  count: number;
  rate: number;
  color: string;
}

interface EngagementMetric {
  subsidiary: string;
  shortName: string;
  logo: string;
  avgSessionMin: number;
  avgCoursesPerUser: number;
  completionRate: number;
  returnRate: number;
  quizScore: number;
}

interface LearnerSegment {
  name: string;
  count: number;
  pct: number;
  color: string;
  description: string;
}

// ─── Mock Data ───
const COHORTS: CohortData[] = [
  { week: "W1 (T1)", enrolled: 820, active: 780, completed: 120, dropped: 15 },
  { week: "W2", enrolled: 820, active: 720, completed: 280, dropped: 35 },
  { week: "W3", enrolled: 820, active: 650, completed: 410, dropped: 58 },
  { week: "W4", enrolled: 820, active: 580, completed: 520, dropped: 85 },
  { week: "W5 (T2)", enrolled: 820, active: 510, completed: 600, dropped: 110 },
  { week: "W6", enrolled: 820, active: 460, completed: 650, dropped: 125 },
  { week: "W7", enrolled: 820, active: 420, completed: 690, dropped: 138 },
  { week: "W8", enrolled: 820, active: 390, completed: 715, dropped: 145 },
  { week: "W9 (T3)", enrolled: 820, active: 365, completed: 730, dropped: 150 },
  { week: "W10", enrolled: 820, active: 345, completed: 742, dropped: 155 },
];

const FUNNEL: FunnelStep[] = [
  { label: "Được gán Khóa học", count: 6610, rate: 100, color: "#990803" },
  { label: "Bắt đầu Học", count: 5540, rate: 83.8, color: "#c8a84e" },
  { label: "Hoàn thành ≥50%", count: 4180, rate: 63.2, color: "#2563eb" },
  { label: "Hoàn thành 100%", count: 3420, rate: 51.7, color: "#7c3aed" },
  { label: "Đạt Kiểm tra", count: 3050, rate: 46.1, color: "#16a34a" },
  { label: "Nhận Chứng chỉ", count: 2780, rate: 42.1, color: "#ea580c" },
];

const ENGAGEMENT: EngagementMetric[] = [
  { subsidiary: "VP Tập đoàn", shortName: "HQ", logo: "🏢", avgSessionMin: 42, avgCoursesPerUser: 3.8, completionRate: 88, returnRate: 82, quizScore: 85 },
  { subsidiary: "ABBank", shortName: "ABB", logo: "🏦", avgSessionMin: 38, avgCoursesPerUser: 3.2, completionRate: 82, returnRate: 78, quizScore: 80 },
  { subsidiary: "BĐS KĐT", shortName: "BĐS", logo: "🏘️", avgSessionMin: 28, avgCoursesPerUser: 2.1, completionRate: 75, returnRate: 65, quizScore: 72 },
  { subsidiary: "Xi măng TL", shortName: "XM", logo: "🏭", avgSessionMin: 45, avgCoursesPerUser: 2.5, completionRate: 92, returnRate: 85, quizScore: 90 },
  { subsidiary: "Thủy điện XM", shortName: "TĐ", logo: "⚡", avgSessionMin: 35, avgCoursesPerUser: 2.0, completionRate: 90, returnRate: 80, quizScore: 88 },
  { subsidiary: "Hanel", shortName: "HNL", logo: "💻", avgSessionMin: 50, avgCoursesPerUser: 4.2, completionRate: 85, returnRate: 88, quizScore: 82 },
  { subsidiary: "Khoáng sản", shortName: "KS", logo: "⛏️", avgSessionMin: 22, avgCoursesPerUser: 1.8, completionRate: 78, returnRate: 60, quizScore: 75 },
  { subsidiary: "BĐS NĐ", shortName: "NĐ", logo: "🏨", avgSessionMin: 30, avgCoursesPerUser: 2.3, completionRate: 80, returnRate: 72, quizScore: 78 },
  { subsidiary: "ABS", shortName: "ABS", logo: "📈", avgSessionMin: 40, avgCoursesPerUser: 3.5, completionRate: 86, returnRate: 80, quizScore: 84 },
  { subsidiary: "ABIC", shortName: "ABC", logo: "🛡️", avgSessionMin: 32, avgCoursesPerUser: 2.4, completionRate: 81, returnRate: 70, quizScore: 79 },
  { subsidiary: "Giáo dục", shortName: "GD", logo: "🎓", avgSessionMin: 55, avgCoursesPerUser: 5.0, completionRate: 94, returnRate: 92, quizScore: 91 },
  { subsidiary: "Hạ tầng", shortName: "HT", logo: "🛤️", avgSessionMin: 25, avgCoursesPerUser: 1.9, completionRate: 77, returnRate: 62, quizScore: 74 },
];

const SEGMENTS: LearnerSegment[] = [
  { name: "Power Learners", count: 660, pct: 10, color: "#16a34a", description: "Học >5 khóa/tháng, completion >90%" },
  { name: "Active Learners", count: 2310, pct: 35, color: "#2563eb", description: "Học 2-5 khóa/tháng, ổn định" },
  { name: "Casual Learners", count: 1980, pct: 30, color: "#c8a84e", description: "Học 1-2 khóa/tháng" },
  { name: "At-Risk", count: 1060, pct: 16, color: "#ea580c", description: "Không hoạt động 2-4 tuần" },
  { name: "Dormant", count: 600, pct: 9, color: "#ef4444", description: "Không hoạt động >1 tháng" },
];

// ─── Time-of-Day Heatmap data (7 days × 24 hours) ───
const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
function heatVal(d: number, h: number): number {
  if (h < 6 || h > 22) return Math.random() * 5;
  if (d >= 5) return Math.random() * 30 + 5; // weekend
  if (h >= 8 && h <= 11) return 60 + Math.random() * 40;
  if (h >= 13 && h <= 17) return 50 + Math.random() * 35;
  if (h === 12) return 30 + Math.random() * 20;
  return 15 + Math.random() * 20;
}

export function LearningAnalytics() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"funnel" | "cohort" | "engagement" | "behavior">("funnel");
  const [period, setPeriod] = useState("Q1-2026");

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Learning Analytics Deep Dive</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Phân tích hành vi học tập chi tiết: funnel, cohort, engagement và behavior patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>
            <option value="Q1-2026">Q1-2026</option>
            <option value="Q4-2025">Q4-2025</option>
            <option value="Q3-2025">Q3-2025</option>
          </select>
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất báo cáo PDF...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Tổng Learners", value: "6,610", icon: Users, color: "#990803", delta: "+5.2%" },
          { label: "Active Rate", value: "72.4%", icon: Activity, color: "#2563eb", delta: "+3.1%" },
          { label: "Avg Session", value: "36 min", icon: Timer, color: "#7c3aed", delta: "+2 min" },
          { label: "Completion", value: "51.7%", icon: Target, color: "#16a34a", delta: "+4.8%" },
          { label: "Avg Score", value: "81.5", icon: Star, color: "#c8a84e", delta: "+1.2" },
          { label: "Cert Issued", value: "2,780", icon: Award, color: "#ea580c", delta: "+12%" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "10" }}>
                <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
              <span className="text-green-500 flex items-center gap-0.5" style={{ fontSize: "9px", fontWeight: 600 }}>
                <ArrowUp className="w-2.5 h-2.5" /> {s.delta}
              </span>
            </div>
            <p style={{ fontSize: "16px", fontWeight: 700, color: s.color }}>{s.value}</p>
            <p className="text-gray-400" style={{ fontSize: "9px" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200 overflow-x-auto">
        {([
          { id: "funnel", label: "Funnel Analysis", icon: Layers },
          { id: "cohort", label: "Cohort Analysis", icon: Users },
          { id: "engagement", label: "Engagement Map", icon: BarChart3 },
          { id: "behavior", label: "Behavior Patterns", icon: MousePointer },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "funnel" && <FunnelTab />}
      {tab === "cohort" && <CohortTab />}
      {tab === "engagement" && <EngagementTab />}
      {tab === "behavior" && <BehaviorTab />}
    </div>
  );
}

// ─── Funnel Tab ───
function FunnelTab() {
  const maxW = 500;
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-4" style={{ fontSize: "13px", fontWeight: 600 }}>Learning Funnel — Toàn Tập đoàn</h3>
        <svg width="100%" height="280" viewBox="0 0 600 280" preserveAspectRatio="xMidYMid meet">
          {FUNNEL.map((step, i) => {
            const y = 5 + i * 44;
            const barW = (step.rate / 100) * maxW;
            const nextRate = FUNNEL[i + 1]?.rate;
            const dropoff = nextRate ? step.rate - nextRate : 0;
            return (
              <g key={step.label}>
                {/* Funnel bar - centered */}
                <rect x={(maxW - barW) / 2 + 50} y={y} width={barW} height="32" rx="4" fill={step.color} opacity="0.55" />
                {/* Label inside */}
                <text x={maxW / 2 + 50} y={y + 12} textAnchor="middle" fill="white" style={{ fontSize: "8px", fontWeight: 700 }}>{step.label}</text>
                <text x={maxW / 2 + 50} y={y + 24} textAnchor="middle" fill="white" style={{ fontSize: "9px", fontWeight: 600 }}>{step.count.toLocaleString()} ({step.rate}%)</text>
                {/* Dropoff indicator */}
                {dropoff > 0 && (
                  <g>
                    <line x1={maxW / 2 + barW / 2 + 55} y1={y + 16} x2={maxW / 2 + barW / 2 + 75} y2={y + 16} stroke="#ef4444" strokeWidth="1" strokeDasharray="3 2" />
                    <text x={maxW / 2 + barW / 2 + 80} y={y + 17} fill="#ef4444" style={{ fontSize: "8px", fontWeight: 600 }}>-{dropoff.toFixed(1)}%</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Drop-off Analysis */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Drop-off Analysis — Điểm mất Learner lớn nhất</h3>
        <div className="space-y-2">
          {[
            { from: "Được gán → Bắt đầu", drop: 16.2, count: 1070, reason: "Chưa nhận thông báo, không biết khóa đã gán", action: "Cải thiện push notification + email reminder" },
            { from: "Bắt đầu → ≥50%", drop: 20.6, count: 1360, reason: "Nội dung quá dài, mất động lực giữa chừng", action: "Chia nhỏ module, thêm microlearning + gamification" },
            { from: "≥50% → 100%", drop: 11.5, count: 760, reason: "Bài kiểm tra khó, học viên bỏ cuối khóa", action: "Thêm quiz luyện tập, cung cấp tài liệu bổ trợ" },
            { from: "100% → Đạt KT", drop: 5.6, count: 370, reason: "Điểm không đạt yêu cầu tối thiểu", action: "Cho phép thi lại, cung cấp review trước thi" },
            { from: "Đạt KT → Chứng chỉ", drop: 4.0, count: 270, reason: "Chưa submit yêu cầu cấp CC", action: "Tự động cấp CC khi đạt điều kiện" },
          ].map((d, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{d.from}</span>
                <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-500" style={{ fontSize: "10px", fontWeight: 700 }}>-{d.drop}% ({d.count.toLocaleString()} người)</span>
              </div>
              <p className="text-gray-400 mb-0.5" style={{ fontSize: "10px" }}>💡 Nguyên nhân: {d.reason}</p>
              <p className="text-[#16a34a]" style={{ fontSize: "10px" }}>✅ Đề xuất: {d.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Cohort Tab ───
function CohortTab() {
  // Retention matrix: week × retention
  const retentionData = COHORTS.map(c => ({
    ...c,
    activeRate: Math.round((c.active / c.enrolled) * 100),
    completedRate: Math.round((c.completed / c.enrolled) * 100),
    droppedRate: Math.round((c.dropped / c.enrolled) * 100),
  }));

  return (
    <div className="space-y-3">
      {/* Cohort Retention Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Cohort Retention — Batch T1/2026 (820 learners)</h3>
        <svg width="100%" height="180" viewBox="0 0 550 180" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(v => {
            const y = 15 + (1 - v / 100) * 130;
            return (
              <g key={v}>
                <line x1="35" y1={y} x2="530" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
                <text x="30" y={y} textAnchor="end" dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "7px" }}>{v}%</text>
              </g>
            );
          })}

          {/* Active line */}
          <polyline
            points={retentionData.map((d, i) => `${35 + i * 55},${15 + (1 - d.activeRate / 100) * 130}`).join(" ")}
            fill="none" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round"
          />
          {/* Completed line */}
          <polyline
            points={retentionData.map((d, i) => `${35 + i * 55},${15 + (1 - d.completedRate / 100) * 130}`).join(" ")}
            fill="none" stroke="#16a34a" strokeWidth="2" strokeLinejoin="round"
          />
          {/* Dropped line */}
          <polyline
            points={retentionData.map((d, i) => `${35 + i * 55},${15 + (1 - d.droppedRate / 100) * 130}`).join(" ")}
            fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="4 2"
          />

          {/* Data points */}
          {retentionData.map((d, i) => (
            <g key={i}>
              <circle cx={35 + i * 55} cy={15 + (1 - d.activeRate / 100) * 130} r="3" fill="#2563eb" />
              <circle cx={35 + i * 55} cy={15 + (1 - d.completedRate / 100) * 130} r="3" fill="#16a34a" />
              <text x={35 + i * 55} y={160} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "6.5px" }}>{d.week}</text>
            </g>
          ))}

          {/* Legend */}
          <rect x="400" y="5" width="8" height="8" rx="2" fill="#2563eb" />
          <text x="412" y="12" fill="#6b7280" style={{ fontSize: "7px" }}>Active</text>
          <rect x="400" y="18" width="8" height="8" rx="2" fill="#16a34a" />
          <text x="412" y="25" fill="#6b7280" style={{ fontSize: "7px" }}>Completed</text>
          <rect x="400" y="31" width="8" height="8" rx="2" fill="#ef4444" />
          <text x="412" y="38" fill="#6b7280" style={{ fontSize: "7px" }}>Dropped</text>
        </svg>
      </div>

      {/* Retention Heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Retention Heatmap — Active Rate theo Tuần</h3>
        <svg width="100%" height="60" viewBox="0 0 550 60" preserveAspectRatio="xMidYMid meet">
          {retentionData.map((d, i) => {
            const x = 10 + i * 54;
            const opacity = d.activeRate / 100;
            const color = d.activeRate >= 70 ? "#16a34a" : d.activeRate >= 50 ? "#c8a84e" : "#ef4444";
            return (
              <g key={i}>
                <rect x={x} y={5} width="50" height="30" rx="4" fill={color} opacity={opacity * 0.7 + 0.1} />
                <text x={x + 25} y={18} textAnchor="middle" fill="white" style={{ fontSize: "9px", fontWeight: 700 }}>{d.activeRate}%</text>
                <text x={x + 25} y={28} textAnchor="middle" fill="white" opacity="0.8" style={{ fontSize: "6px" }}>{d.active}/{d.enrolled}</text>
                <text x={x + 25} y={48} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "6.5px" }}>{d.week}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── Engagement Map Tab ───
function EngagementTab() {
  // Scatter plot: Avg Session vs Completion Rate
  const maxSession = Math.max(...ENGAGEMENT.map(e => e.avgSessionMin));
  const scatterW = 450, scatterH = 220, pL = 40, pR = 20, pT = 15, pB = 25;
  const cW = scatterW - pL - pR;
  const cH = scatterH - pT - pB;

  return (
    <div className="space-y-3">
      {/* Scatter Plot */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Engagement Scatter — Session Time vs Completion Rate</h3>
        <svg width="100%" height={scatterH} viewBox={`0 0 ${scatterW} ${scatterH}`} preserveAspectRatio="xMidYMid meet">
          {/* Axes */}
          <line x1={pL} y1={pT} x2={pL} y2={scatterH - pB} stroke="#e5e7eb" strokeWidth="1" />
          <line x1={pL} y1={scatterH - pB} x2={scatterW - pR} y2={scatterH - pB} stroke="#e5e7eb" strokeWidth="1" />
          {/* Grid */}
          {[0, 25, 50, 75, 100].map(v => {
            const y = pT + (1 - v / 100) * cH;
            return <g key={v}><line x1={pL} y1={y} x2={scatterW - pR} y2={y} stroke="#f3f4f6" strokeWidth="0.5" /><text x={pL - 5} y={y} textAnchor="end" dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "7px" }}>{v}%</text></g>;
          })}
          {[0, 15, 30, 45, 60].map(v => {
            const x = pL + (v / 60) * cW;
            return <text key={v} x={x} y={scatterH - 8} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "7px" }}>{v}m</text>;
          })}
          <text x={scatterW / 2} y={scatterH - 1} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "7px" }}>Avg Session (min)</text>
          {/* Points */}
          {ENGAGEMENT.map((e, i) => {
            const x = pL + (e.avgSessionMin / 60) * cW;
            const y = pT + (1 - e.completionRate / 100) * cH;
            const r = 4 + (e.avgCoursesPerUser / 5) * 8;
            const color = e.completionRate >= 85 ? "#16a34a" : e.completionRate >= 75 ? "#c8a84e" : "#ea580c";
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={r} fill={color} opacity="0.4" stroke={color} strokeWidth="1" />
                <text x={x} y={y - r - 3} textAnchor="middle" fill="#374151" style={{ fontSize: "7px", fontWeight: 600 }}>{e.logo} {e.shortName}</text>
              </g>
            );
          })}
        </svg>
        <p className="text-gray-300 text-center mt-1" style={{ fontSize: "9px" }}>Kích thước bubble = Avg Courses/User • Màu = Completion Rate (xanh ≥85%, vàng ≥75%, cam &lt;75%)</p>
      </div>

      {/* Learner Segments */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Phân khúc Learner</h3>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2">
          {SEGMENTS.map(seg => (
            <div key={seg.name} className="p-3 rounded-xl border" style={{ borderColor: seg.color + "30", backgroundColor: seg.color + "05" }}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{seg.name}</span>
              </div>
              <p style={{ fontSize: "20px", fontWeight: 700, color: seg.color }}>{seg.count.toLocaleString()}</p>
              <p className="text-gray-400" style={{ fontSize: "9px" }}>{seg.pct}% • {seg.description}</p>
            </div>
          ))}
        </div>
        {/* Segment bar */}
        <div className="flex h-4 rounded-full overflow-hidden mt-3">
          {SEGMENTS.map(seg => (
            <div key={seg.name} style={{ width: `${seg.pct}%`, backgroundColor: seg.color, opacity: 0.6 }} title={`${seg.name}: ${seg.pct}%`} />
          ))}
        </div>
      </div>

      {/* Engagement Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2.5 text-left text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Đơn vị</th>
                <th className="px-3 py-2.5 text-right text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Avg Session</th>
                <th className="px-3 py-2.5 text-right text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Courses/User</th>
                <th className="px-3 py-2.5 text-right text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Completion</th>
                <th className="px-3 py-2.5 text-right text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Return Rate</th>
                <th className="px-3 py-2.5 text-right text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Quiz Score</th>
              </tr>
            </thead>
            <tbody>
              {ENGAGEMENT.sort((a, b) => b.completionRate - a.completionRate).map(e => (
                <tr key={e.shortName} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2"><span style={{ fontSize: "11px" }}>{e.logo} {e.subsidiary}</span></td>
                  <td className="px-3 py-2 text-right" style={{ fontSize: "11px", fontWeight: 500 }}>{e.avgSessionMin} min</td>
                  <td className="px-3 py-2 text-right" style={{ fontSize: "11px", fontWeight: 500 }}>{e.avgCoursesPerUser}</td>
                  <td className="px-3 py-2 text-right"><span style={{ fontSize: "11px", fontWeight: 700, color: e.completionRate >= 85 ? "#16a34a" : e.completionRate >= 75 ? "#c8a84e" : "#ea580c" }}>{e.completionRate}%</span></td>
                  <td className="px-3 py-2 text-right"><span style={{ fontSize: "11px", fontWeight: 600, color: e.returnRate >= 80 ? "#16a34a" : "#c8a84e" }}>{e.returnRate}%</span></td>
                  <td className="px-3 py-2 text-right"><span style={{ fontSize: "11px", fontWeight: 600, color: e.quizScore >= 85 ? "#16a34a" : "#c8a84e" }}>{e.quizScore}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Behavior Patterns Tab ───
function BehaviorTab() {
  const cellW = 20, cellH = 18, pL = 25, pT = 20;

  // Content preference data
  const contentPref = [
    { type: "Video", pct: 35, color: "#7c3aed" },
    { type: "Slide", pct: 28, color: "#990803" },
    { type: "Interactive", pct: 18, color: "#ea580c" },
    { type: "Quiz", pct: 12, color: "#2563eb" },
    { type: "Document", pct: 7, color: "#6b7280" },
  ];

  // Device usage
  const devices = [
    { device: "Desktop", pct: 52, color: "#990803" },
    { device: "Mobile", pct: 35, color: "#2563eb" },
    { device: "Tablet", pct: 13, color: "#c8a84e" },
  ];

  return (
    <div className="space-y-3">
      {/* Time-of-Day Heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Learning Activity Heatmap — Giờ × Thứ</h3>
        <svg width="100%" height={pT + 7 * (cellH + 2) + 20} viewBox={`0 0 ${pL + 24 * (cellW + 1) + 30} ${pT + 7 * (cellH + 2) + 20}`} preserveAspectRatio="xMidYMid meet">
          {/* Hour labels */}
          {HOURS.filter(h => h % 2 === 0).map(h => (
            <text key={h} x={pL + h * (cellW + 1) + cellW / 2} y={14} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "6px" }}>{h}h</text>
          ))}
          {/* Day rows */}
          {DAYS.map((day, di) => {
            const y = pT + di * (cellH + 2);
            return (
              <g key={day}>
                <text x={pL - 5} y={y + cellH / 2} textAnchor="end" dominantBaseline="central" fill="#374151" style={{ fontSize: "7px", fontWeight: 500 }}>{day}</text>
                {HOURS.map(h => {
                  const val = heatVal(di, h);
                  const intensity = val / 100;
                  const color = val > 60 ? "#990803" : val > 30 ? "#c8a84e" : val > 10 ? "#2563eb" : "#e5e7eb";
                  return <rect key={h} x={pL + h * (cellW + 1)} y={y} width={cellW} height={cellH} rx="3" fill={color} opacity={Math.max(0.1, intensity * 0.7)} />;
                })}
              </g>
            );
          })}
          {/* Legend */}
          <text x={pL} y={pT + 7 * (cellH + 2) + 12} fill="#9ca3af" style={{ fontSize: "7px" }}>Thấp</text>
          {[0.1, 0.3, 0.5, 0.7, 0.9].map((op, i) => (
            <rect key={i} x={pL + 25 + i * 14} y={pT + 7 * (cellH + 2) + 6} width="12" height="10" rx="2" fill="#990803" opacity={op} />
          ))}
          <text x={pL + 100} y={pT + 7 * (cellH + 2) + 12} fill="#9ca3af" style={{ fontSize: "7px" }}>Cao</text>
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Content Type Preference */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Loại Nội dung Ưa thích</h3>
          <svg width="100%" height="140" viewBox="0 0 300 140" preserveAspectRatio="xMidYMid meet">
            {contentPref.map((c, i) => {
              const y = 5 + i * 26;
              const barW = (c.pct / 35) * 160;
              return (
                <g key={c.type}>
                  <text x="5" y={y + 10} dominantBaseline="central" fill="#374151" style={{ fontSize: "9px" }}>{c.type}</text>
                  <rect x="70" y={y} width={barW} height="20" rx="4" fill={c.color} opacity="0.5" />
                  <text x={75 + barW} y={y + 10} dominantBaseline="central" fill={c.color} style={{ fontSize: "9px", fontWeight: 700 }}>{c.pct}%</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Device Usage */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Thiết bị Sử dụng</h3>
          <svg width="100%" height="140" viewBox="0 0 300 140" preserveAspectRatio="xMidYMid meet">
            {/* Donut chart */}
            {(() => {
              const cx = 80, cy = 65, r = 50, inner = 30;
              let cumAngle = -90;
              return devices.map(d => {
                const angle = (d.pct / 100) * 360;
                const startAngle = cumAngle;
                const endAngle = cumAngle + angle;
                cumAngle = endAngle;
                const start1 = { x: cx + r * Math.cos((startAngle * Math.PI) / 180), y: cy + r * Math.sin((startAngle * Math.PI) / 180) };
                const end1 = { x: cx + r * Math.cos((endAngle * Math.PI) / 180), y: cy + r * Math.sin((endAngle * Math.PI) / 180) };
                const start2 = { x: cx + inner * Math.cos((endAngle * Math.PI) / 180), y: cy + inner * Math.sin((endAngle * Math.PI) / 180) };
                const end2 = { x: cx + inner * Math.cos((startAngle * Math.PI) / 180), y: cy + inner * Math.sin((startAngle * Math.PI) / 180) };
                const largeArc = angle > 180 ? 1 : 0;
                const pathD = `M ${start1.x} ${start1.y} A ${r} ${r} 0 ${largeArc} 1 ${end1.x} ${end1.y} L ${start2.x} ${start2.y} A ${inner} ${inner} 0 ${largeArc} 0 ${end2.x} ${end2.y} Z`;
                const midAngle = ((startAngle + endAngle) / 2 * Math.PI) / 180;
                const labelR = r + 12;
                return (
                  <g key={d.device}>
                    <path d={pathD} fill={d.color} opacity="0.6" />
                    <text x={cx + labelR * Math.cos(midAngle)} y={cy + labelR * Math.sin(midAngle)} textAnchor="middle" dominantBaseline="central" fill={d.color} style={{ fontSize: "7px", fontWeight: 700 }}>{d.pct}%</text>
                  </g>
                );
              });
            })()}
            {/* Legend */}
            {devices.map((d, i) => (
              <g key={d.device}>
                <rect x="180" y={30 + i * 22} width="10" height="10" rx="2" fill={d.color} opacity="0.6" />
                <text x="195" y={38 + i * 22} fill="#374151" style={{ fontSize: "9px" }}>{d.device}</text>
                <text x="260" y={38 + i * 22} fill={d.color} style={{ fontSize: "9px", fontWeight: 700 }}>{d.pct}%</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Learning Path Patterns */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Top Learning Paths — Lộ trình phổ biến nhất</h3>
        <div className="space-y-2">
          {[
            { path: "Onboarding → Compliance → Kỹ năng Mềm → Chuyên môn", users: 1250, avgDays: 45, completion: 78 },
            { path: "Compliance → PCCC → ATLĐ → ESG", users: 980, avgDays: 30, completion: 85 },
            { path: "IT Cơ bản → Excel/VBA → AI & ML → Digital Marketing", users: 620, avgDays: 60, completion: 65 },
            { path: "Lãnh đạo 4.0 → Đàm phán → Quản lý Dự án → Chiến lược", users: 340, avgDays: 90, completion: 72 },
            { path: "Tài chính → Kế toán → Phân tích → Compliance TC", users: 450, avgDays: 75, completion: 80 },
          ].map((lp, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
              <span className="w-6 h-6 rounded-full bg-[#990803]/10 text-[#990803] flex items-center justify-center shrink-0" style={{ fontSize: "10px", fontWeight: 700 }}>#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 truncate" style={{ fontSize: "11px", fontWeight: 500 }}>{lp.path}</p>
                <div className="flex items-center gap-3 text-gray-400 mt-0.5" style={{ fontSize: "10px" }}>
                  <span>👥 {lp.users.toLocaleString()}</span>
                  <span>📅 ~{lp.avgDays} ngày</span>
                  <span style={{ color: lp.completion >= 80 ? "#16a34a" : "#c8a84e" }}>✅ {lp.completion}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}