import { useState } from "react";
import {
  Download,
  Calendar,
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  Award,
  Filter,
  FileText,
} from "lucide-react";
import {
  monthlyLearningData,
  departmentCompletionData,
  categoryDistribution,
  subsidiaryStats,
} from "./mock-data";
import { useAuth } from "./AuthContext";
import { toast } from "@/app/lib/toast";
import { exportToCSV } from "./ExportManager";

const engagementData = [
  { month: "T1", activeUsers: 1850, loginRate: 72, avgTime: 45 },
  { month: "T2", activeUsers: 1920, loginRate: 75, avgTime: 48 },
  { month: "T3", activeUsers: 2050, loginRate: 78, avgTime: 52 },
  { month: "T4", activeUsers: 2180, loginRate: 80, avgTime: 55 },
  { month: "T5", activeUsers: 2350, loginRate: 82, avgTime: 58 },
  { month: "T6", activeUsers: 2480, loginRate: 85, avgTime: 62 },
];

const skillRadarData = [
  { skill: "Lãnh đạo", A: 85, B: 70 },
  { skill: "Kỹ thuật", A: 70, B: 90 },
  { skill: "Giao tiếp", A: 80, B: 75 },
  { skill: "Pháp luật", A: 92, B: 85 },
  { skill: "An toàn", A: 88, B: 95 },
  { skill: "CNTT", A: 75, B: 80 },
];

const topCourses = [
  { name: "Tuân thủ Pháp luật DN", enrolled: 1240, completion: 88 },
  { name: "Onboarding", enrolled: 890, completion: 95 },
  { name: "Kỹ năng Teamwork", enrolled: 678, completion: 82 },
  { name: "An toàn Lao động", enrolled: 520, completion: 92 },
  { name: "Marketing số", enrolled: 312, completion: 71 },
];

// Helper: build SVG area chart
function CustomAreaChart({ data }: { data: typeof engagementData }) {
  const W = 480, H = 260, padL = 55, padR = 15, padT = 15, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxUsers = Math.max(...data.map(d => d.activeUsers));
  const n = data.length;
  const xStep = chartW / (n - 1);
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const usersPoints = data.map((d, i) =>
    `${padL + i * xStep},${padT + chartH - (d.activeUsers / maxUsers) * chartH}`
  );
  const loginPoints = data.map((d, i) =>
    `${padL + i * xStep},${padT + chartH - (d.loginRate / 100) * chartH}`
  );

  const usersArea = `M${padL},${padT + chartH} ` + usersPoints.map((p, i) => (i === 0 ? `L${p}` : `L${p}`)).join(' ') + ` L${padL + (n - 1) * xStep},${padT + chartH} Z`;
  const loginArea = `M${padL},${padT + chartH} ` + loginPoints.map((p, i) => (i === 0 ? `L${p}` : `L${p}`)).join(' ') + ` L${padL + (n - 1) * xStep},${padT + chartH} Z`;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {yTicks.map(t => {
        const y = padT + chartH - t * chartH;
        return <line key={`ag-${t}`} x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />;
      })}
      {yTicks.map(t => {
        const y = padT + chartH - t * chartH;
        return <text key={`al-${t}`} x={padL - 8} y={y + 4} textAnchor="end" fill="#6b7194" style={{ fontSize: "10px" }}>{Math.round(maxUsers * t)}</text>;
      })}
      {data.map((d, i) => (
        <text key={`ax-${d.month}`} x={padL + i * xStep} y={H - 8} textAnchor="middle" fill="#6b7194" style={{ fontSize: "11px" }}>{d.month}</text>
      ))}
      <path d={usersArea} fill="#99080320" />
      <polyline points={usersPoints.join(' ')} fill="none" stroke="#990803" strokeWidth={2} strokeLinejoin="round" />
      <path d={loginArea} fill="#c8a84e20" />
      <polyline points={loginPoints.join(' ')} fill="none" stroke="#c8a84e" strokeWidth={2} strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={`au-${d.month}`} cx={padL + i * xStep} cy={padT + chartH - (d.activeUsers / maxUsers) * chartH} r={3} fill="#990803" />
      ))}
      {data.map((d, i) => (
        <circle key={`ar-${d.month}`} cx={padL + i * xStep} cy={padT + chartH - (d.loginRate / 100) * chartH} r={3} fill="#c8a84e" />
      ))}
    </svg>
  );
}

// Helper: build SVG radar chart
function CustomRadarChart({ data }: { data: typeof skillRadarData }) {
  const W = 360, H = 300;
  const cx = W / 2, cy = H / 2 - 5, R = 100;
  const n = data.length;
  const levels = [0.25, 0.5, 0.75, 1];

  const angleFor = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const gridLines = levels.map(level => {
    const pts = Array.from({ length: n }, (_, i) => {
      const a = angleFor(i);
      return `${cx + R * level * Math.cos(a)},${cy + R * level * Math.sin(a)}`;
    }).join(' ');
    return <polygon key={`rg-${level}`} points={pts} fill="none" stroke="rgba(0,0,0,0.08)" />;
  });

  const axisLines = Array.from({ length: n }, (_, i) => {
    const a = angleFor(i);
    return <line key={`ra-${i}`} x1={cx} y1={cy} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)} stroke="rgba(0,0,0,0.08)" />;
  });

  const labels = data.map((d, i) => {
    const a = angleFor(i);
    const lx = cx + (R + 18) * Math.cos(a);
    const ly = cy + (R + 18) * Math.sin(a);
    return <text key={`rl-${d.skill}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill="#6b7194" style={{ fontSize: "11px" }}>{d.skill}</text>;
  });

  const ptsA = data.map((d, i) => {
    const a = angleFor(i);
    const r = (d.A / 100) * R;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');

  const ptsB = data.map((d, i) => {
    const a = angleFor(i);
    const r = (d.B / 100) * R;
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
  }).join(' ');

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {gridLines}
      {axisLines}
      {labels}
      <polygon points={ptsA} fill="#99080333" stroke="#990803" strokeWidth={1.5} />
      <polygon points={ptsB} fill="#c8a84e33" stroke="#c8a84e" strokeWidth={1.5} />
      {/* Legend */}
      <rect x={W / 2 - 80} y={H - 22} width={10} height={10} fill="#990803" opacity={0.5} rx={2} />
      <text x={W / 2 - 65} y={H - 13} fill="#6b7194" style={{ fontSize: "11px" }}>Mục tiêu</text>
      <rect x={W / 2 + 10} y={H - 22} width={10} height={10} fill="#c8a84e" opacity={0.5} rx={2} />
      <text x={W / 2 + 25} y={H - 13} fill="#6b7194" style={{ fontSize: "11px" }}>Thực tế</text>
    </svg>
  );
}

// Helper: build SVG grouped bar chart
function CustomBarChart({ data }: { data: typeof departmentCompletionData }) {
  const W = 560, H = 280, padL = 45, padR = 15, padT = 10, padB = 45;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = data.length;
  const groupW = chartW / n;
  const barW = groupW * 0.3;
  const gap = 3;
  const maxVal = Math.max(...data.map(d => Math.max(d.completion, d.enrolled)));
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {yTicks.map(t => {
        const y = padT + chartH - t * chartH;
        return <line key={`bg-${t}`} x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />;
      })}
      {yTicks.map(t => {
        const y = padT + chartH - t * chartH;
        return <text key={`bl-${t}`} x={padL - 6} y={y + 4} textAnchor="end" fill="#6b7194" style={{ fontSize: "10px" }}>{Math.round(maxVal * t)}</text>;
      })}
      {data.map((d, i) => {
        const groupX = padL + i * groupW + groupW / 2;
        const h1 = (d.completion / maxVal) * chartH;
        const h2 = (d.enrolled / maxVal) * chartH;
        return (
          <g key={`bar-${d.name}`}>
            <rect x={groupX - barW - gap / 2} y={padT + chartH - h1} width={barW} height={h1} fill="#990803" rx={3} />
            <rect x={groupX + gap / 2} y={padT + chartH - h2} width={barW} height={h2} fill="#c8a84e" rx={3} />
            <text x={groupX} y={H - padB + 16} textAnchor="middle" fill="#6b7194" style={{ fontSize: "10px" }}>{d.name}</text>
          </g>
        );
      })}
      {/* Legend */}
      <rect x={W / 2 - 120} y={H - 14} width={10} height={10} fill="#990803" rx={2} />
      <text x={W / 2 - 105} y={H - 5} fill="#6b7194" style={{ fontSize: "10px" }}>Hoàn thành (%)</text>
      <rect x={W / 2 + 20} y={H - 14} width={10} height={10} fill="#c8a84e" rx={2} />
      <text x={W / 2 + 35} y={H - 5} fill="#6b7194" style={{ fontSize: "10px" }}>Đăng ký</text>
    </svg>
  );
}

export function Reports() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("year");
  const [activeReportTab, setActiveReportTab] = useState<"overview" | "engagement" | "skills">("overview");

  const isInstructor = user?.role === "instructor";

  // Instructor-specific data
  const instructorCourseStats = [
    { name: "Marketing số", enrolled: 312, completion: 71, avgScore: 78, dropRate: 8 },
    { name: "SEO Nâng cao", enrolled: 85, completion: 62, avgScore: 72, dropRate: 12 },
    { name: "Content Marketing B2B", enrolled: 128, completion: 78, avgScore: 82, dropRate: 5 },
  ];

  const instructorStudentPerformance = [
    { range: "90-100", count: 45, pct: 18 },
    { range: "80-89", count: 85, pct: 34 },
    { range: "70-79", count: 67, pct: 27 },
    { range: "60-69", count: 35, pct: 14 },
    { range: "<60", count: 18, pct: 7 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-foreground">{isInstructor ? "Báo cáo Giảng dạy" : "Báo cáo & Phân tích"}</h1>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
            {isInstructor ? "Thống kê hiệu quả giảng dạy và tiến độ học viên" : "Phân tích chi tiết hiệu quả đào tạo toàn tập đoàn"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-secondary rounded-lg border-0"
            style={{ fontSize: "13px" }}
          >
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "13px" }}
            onClick={() => exportToCSV(
              subsidiaryStats.map(s => ({ name: s.name, employees: s.employees, courses: s.courses, avgCompletion: s.avgCompletion })),
              "geleximco-bao-cao-dao-tao",
              [{ key: "name", label: "Công ty" }, { key: "employees", label: "Nhân sự" }, { key: "courses", label: "Khóa học" }, { key: "avgCompletion", label: "Tỷ lệ HT (%)" }]
            )}>
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1">
        {[
          { id: "overview" as const, label: "Tổng quan" },
          { id: "engagement" as const, label: "Mức độ tham gia" },
          { id: "skills" as const, label: "Năng lực" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`flex-1 py-2 rounded-md transition-colors ${
              activeReportTab === tab.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontSize: "13px", fontWeight: 500 }}
            onClick={() => setActiveReportTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(isInstructor ? [
          { label: "Tổng học viên", value: "525", sub: "+42 tuần này", icon: Users, color: "#990803" },
          { label: "Tỷ lệ hoàn thành TB", value: "70.3%", sub: "+3.5% so với quý trước", icon: Award, color: "#27ae60" },
          { label: "Điểm trung bình", value: "77.3", sub: "Tăng 2.1 điểm", icon: TrendingUp, color: "#c8a84e" },
          { label: "Tỷ lệ bỏ học", value: "8.3%", sub: "Giảm 1.2%", icon: Users, color: "#2e86de" },
        ] : [
          { label: "Tổng khóa hoàn thành", value: "2,847", sub: "+342 so với năm trước", icon: BookOpen, color: "#990803" },
          { label: "Tổng giờ đào tạo", value: "24,510h", sub: "Trung bình 7.9h/người", icon: Clock, color: "#c8a84e" },
          { label: "Chứng chỉ cấp mới", value: "1,256", sub: "+28% so với năm trước", icon: Award, color: "#27ae60" },
          { label: "NV tích cực", value: "2,480", sub: "85% tổng nhân sự", icon: Users, color: "#2e86de" },
        ]).map((card) => (
          <div key={card.label} className="bg-card rounded-xl border border-border p-5">
            <card.icon className="w-5 h-5" style={{ color: card.color }} />
            <p className="text-foreground mt-3" style={{ fontSize: "24px", fontWeight: 700 }}>{card.value}</p>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>{card.label}</p>
            <p className="text-green-600 mt-1" style={{ fontSize: "11px" }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isInstructor ? (
          <>
            {/* Instructor: My Course Performance */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-foreground mb-1">Hiệu quả theo Khóa học</h3>
              <p className="text-muted-foreground mb-4" style={{ fontSize: "13px" }}>Thống kê chi tiết từng khóa giảng dạy</p>
              <div className="space-y-4">
                {instructorCourseStats.map((course) => (
                  <div key={course.name} className="p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize: "13px", fontWeight: 500 }}>{course.name}</span>
                      <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{course.enrolled} HV</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Hoàn thành</p>
                        <p className={`${course.completion >= 75 ? "text-green-600" : "text-yellow-600"}`} style={{ fontSize: "14px", fontWeight: 600 }}>{course.completion}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Điểm TB</p>
                        <p style={{ fontSize: "14px", fontWeight: 600 }}>{course.avgScore}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Bỏ học</p>
                        <p className={`${course.dropRate > 10 ? "text-red-500" : "text-green-600"}`} style={{ fontSize: "14px", fontWeight: 600 }}>{course.dropRate}%</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#990803]" style={{ width: `${course.completion}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor: Score Distribution */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-foreground mb-1">Phân bổ Điểm Học viên</h3>
              <p className="text-muted-foreground mb-4" style={{ fontSize: "13px" }}>Tổng hợp tất cả khóa học</p>
              <div className="space-y-3">
                {instructorStudentPerformance.map((row) => (
                  <div key={row.range} className="flex items-center gap-3">
                    <span className="text-muted-foreground w-12 shrink-0 text-right" style={{ fontSize: "12px" }}>{row.range}</span>
                    <div className="flex-1 h-6 bg-secondary/50 rounded overflow-hidden">
                      <div className="h-full rounded transition-all" style={{
                        width: `${row.pct}%`,
                        backgroundColor: row.range === "90-100" ? "#27ae60" : row.range === "80-89" ? "#2e86de" : row.range === "70-79" ? "#c8a84e" : row.range === "60-69" ? "#f39c12" : "#e74c3c",
                      }} />
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 600, minWidth: "40px" }}>{row.count} HV</span>
                    <span className="text-muted-foreground" style={{ fontSize: "11px", minWidth: "30px" }}>{row.pct}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Tổng học viên được đánh giá</span>
                <span style={{ fontSize: "14px", fontWeight: 600 }}>250</span>
              </div>
            </div>
          </>
        ) : (
          <>
        {/* User Engagement */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-1">Mức độ Tham gia</h3>
          <p className="text-muted-foreground mb-4" style={{ fontSize: "13px" }}>Người dùng hoạt động và tỷ lệ đăng nhập</p>
          <CustomAreaChart data={engagementData} />
          <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-[#990803] rounded" /><span className="text-muted-foreground" style={{ fontSize: "11px" }}>NV hoạt động</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-[#c8a84e] rounded" /><span className="text-muted-foreground" style={{ fontSize: "11px" }}>Tỷ lệ login (%)</span></div>
          </div>
        </div>

        {/* Skill Radar */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-1">Đánh giá Năng lực theo Lĩnh vực</h3>
          <p className="text-muted-foreground mb-4" style={{ fontSize: "13px" }}>So sánh mục tiêu (A) vs thực tế (B)</p>
          <CustomRadarChart data={skillRadarData} />
        </div>
          </>
        )}
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Department Bar */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-4">Hiệu quả Đào tạo theo Phòng ban</h3>
          <CustomBarChart data={departmentCompletionData} />
        </div>

        {/* Top Courses */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-4">Top Khóa học Phổ biến</h3>
          <div className="space-y-4">
            {topCourses.map((course, idx) => (
              <div key={course.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded flex items-center justify-center text-white"
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        backgroundColor: idx === 0 ? "#c8a84e" : idx === 1 ? "#990803" : "#6b7194",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 500 }}>{course.name}</span>
                  </div>
                  <span className="text-muted-foreground shrink-0" style={{ fontSize: "12px" }}>{course.enrolled}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${course.completion}%`,
                        backgroundColor: idx === 0 ? "#c8a84e" : "#990803",
                      }}
                    />
                  </div>
                  <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{course.completion}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subsidiary comparison */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground">So sánh Hiệu quả giữa các Công ty Thành viên</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 cursor-pointer" style={{ fontSize: "12px" }}
            onClick={() => exportToCSV(
              subsidiaryStats.map(s => ({ name: s.name, employees: s.employees, courses: s.courses, avgCompletion: s.avgCompletion })),
              "geleximco-so-sanh-ctv",
              [{ key: "name", label: "Công ty" }, { key: "employees", label: "Nhân sự" }, { key: "courses", label: "Khóa học" }, { key: "avgCompletion", label: "Tỷ lệ HT (%)" }]
            )}>
            <FileText className="w-3.5 h-3.5" /> Xuất Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 pr-4 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Công ty thành viên</th>
                <th className="text-right py-2.5 px-4 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Nhân sự</th>
                <th className="text-right py-2.5 px-4 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Khóa học</th>
                <th className="text-right py-2.5 px-4 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Tỷ lệ HT</th>
                <th className="text-left py-2.5 pl-4 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Tiến độ</th>
              </tr>
            </thead>
            <tbody>
              {subsidiaryStats.map((sub) => (
                <tr key={sub.name} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="py-3 pr-4" style={{ fontSize: "13px", fontWeight: 500 }}>{sub.name}</td>
                  <td className="text-right py-3 px-4 text-muted-foreground" style={{ fontSize: "13px" }}>{sub.employees.toLocaleString()}</td>
                  <td className="text-right py-3 px-4 text-muted-foreground" style={{ fontSize: "13px" }}>{sub.courses}</td>
                  <td className="text-right py-3 px-4">
                    <span
                      className={`${
                        sub.avgCompletion >= 85 ? "text-green-600" :
                        sub.avgCompletion >= 75 ? "text-yellow-600" : "text-red-500"
                      }`}
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      {sub.avgCompletion}%
                    </span>
                  </td>
                  <td className="py-3 pl-4">
                    <div className="w-full max-w-[200px] h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${sub.avgCompletion}%`,
                          backgroundColor: sub.avgCompletion >= 85 ? "#27ae60" : sub.avgCompletion >= 75 ? "#f39c12" : "#e74c3c",
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}