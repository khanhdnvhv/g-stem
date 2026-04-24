import { useState } from "react";
import {
  Users,
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Target,
  Plus,
  BarChart3,
  FileText,
  UserPlus,
  Star,
  PlayCircle,
  Flame,
  Calendar,
  ClipboardCheck,
  MessageCircle,
  Eye,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  mockCourses,
  monthlyLearningData,
  departmentCompletionData,
  categoryDistribution,
  subsidiaryStats,
} from "./mock-data";
import { useAuth } from "./AuthContext";

// ====================================================
// ADMIN DASHBOARD
// ====================================================
function AdminDashboard() {
  const { user } = useAuth();
  const [hoveredKpi, setHoveredKpi] = useState<number | null>(null);
  const [chartPeriod, setChartPeriod] = useState<"12" | "6">("12");

  const kpiCards = [
    { label: "Tổng nhân sự", value: "3,090", change: "+128", trend: "up" as const, icon: Users, color: "#990803", bg: "#99080310" },
    { label: "Khóa học hoạt động", value: "156", change: "+12", trend: "up" as const, icon: BookOpen, color: "#990803", bg: "#99080310" },
    { label: "Tổng giờ học (năm)", value: "24,510", change: "+18.5%", trend: "up" as const, icon: Clock, color: "#2e86de", bg: "#2e86de10" },
    { label: "Tỷ lệ hoàn thành", value: "83.2%", change: "-1.2%", trend: "down" as const, icon: Award, color: "#27ae60", bg: "#27ae6010" },
  ];

  const quickActions = [
    { label: "Tạo khóa học", icon: Plus, color: "#990803", to: "/courses" },
    { label: "Thêm nhân sự", icon: UserPlus, color: "#2e86de", to: "/employees" },
    { label: "Xem báo cáo", icon: BarChart3, color: "#c8a84e", to: "/reports" },
    { label: "Xuất dữ liệu", icon: FileText, color: "#27ae60", to: "/reports" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-foreground">Tổng quan Hệ thống</h1>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
            Xin chào, <span style={{ fontWeight: 500 }}>{user?.name}</span>. Dữ liệu cập nhật lúc 09/03/2026.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg hover:shadow-md transition-all hover:-translate-y-0.5"
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              <action.icon className="w-3.5 h-3.5" style={{ color: action.color }} />
              <span className="hidden sm:inline">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => (
          <div
            key={kpi.label}
            className={`bg-card rounded-xl border border-border p-5 transition-all duration-200 cursor-default ${
              hoveredKpi === idx ? "shadow-lg -translate-y-0.5" : "hover:shadow-md"
            }`}
            onMouseEnter={() => setHoveredKpi(idx)}
            onMouseLeave={() => setHoveredKpi(null)}
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                  kpi.trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                }`}
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                {kpi.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-foreground" style={{ fontSize: "28px", fontWeight: 700, lineHeight: 1.2 }}>{kpi.value}</p>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Learning Hours Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground">Thống kê Giờ học theo tháng</h3>
              <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Năm 2025-2026</p>
            </div>
            <select value={chartPeriod} onChange={(e) => setChartPeriod(e.target.value as "12" | "6")} className="px-3 py-1.5 bg-secondary rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "13px" }}>
              <option value="12">12 tháng gần nhất</option>
              <option value="6">6 tháng gần nhất</option>
            </select>
          </div>
          <MonthlyLearningChart period={chartPeriod} />
          <div className="flex items-center justify-center gap-6 mt-2">
            <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-[#990803] rounded" /><span className="text-muted-foreground" style={{ fontSize: "11px" }}>Giờ học</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-[#c8a84e] rounded" /><span className="text-muted-foreground" style={{ fontSize: "11px" }}>Hoàn thành</span></div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-4">Phân bổ theo Danh mục</h3>
          <CategoryDonutChart />
          <div className="space-y-2 mt-2">
            {categoryDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{item.name}</span>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 600 }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Performance & Subsidiary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-4">Tỷ lệ hoàn thành theo Phòng ban</h3>
          <div className="space-y-3">
            {departmentCompletionData.map((dept) => (
              <div key={dept.name} className="flex items-center gap-3">
                <span className="text-muted-foreground w-[70px] shrink-0 text-right" style={{ fontSize: "12px" }}>{dept.name}</span>
                <div className="flex-1 h-5 bg-secondary/50 rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${dept.completion}%`,
                      backgroundColor: dept.completion >= 90 ? "#27ae60" : dept.completion >= 80 ? "#990803" : dept.completion >= 75 ? "#f39c12" : "#e74c3c",
                    }}
                  />
                </div>
                <span style={{ fontSize: "12px", fontWeight: 600, minWidth: "36px" }}>{dept.completion}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-4">Thống kê theo Công ty thành viên</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Công ty</th>
                  <th className="text-right py-2.5 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Nhân sự</th>
                  <th className="text-right py-2.5 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Khóa học</th>
                  <th className="text-right py-2.5 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Hoàn thành</th>
                </tr>
              </thead>
              <tbody>
                {subsidiaryStats.map((sub) => (
                  <tr key={sub.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3" style={{ fontSize: "13px", fontWeight: 500 }}>{sub.name}</td>
                    <td className="text-right py-3 text-muted-foreground" style={{ fontSize: "13px" }}>{sub.employees.toLocaleString()}</td>
                    <td className="text-right py-3 text-muted-foreground" style={{ fontSize: "13px" }}>{sub.courses}</td>
                    <td className="text-right py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${
                        sub.avgCompletion >= 85 ? "bg-green-50 text-green-600" :
                        sub.avgCompletion >= 75 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-500"
                      }`} style={{ fontSize: "12px", fontWeight: 500 }}>{sub.avgCompletion}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Courses & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Khóa học Nổi bật</h3>
            <Link to="/courses" className="flex items-center gap-1 text-[#c8a84e] hover:underline" style={{ fontSize: "13px", fontWeight: 500 }}>
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {mockCourses.slice(0, 4).map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group">
                <img src={course.thumbnail} alt={course.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate group-hover:text-[#c8a84e] transition-colors" style={{ fontSize: "14px", fontWeight: 500 }}>{course.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{course.instructor}</span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{course.enrolledCount} học viên</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 max-w-[200px] h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#990803]" style={{ width: `${course.completionRate}%` }} />
                    </div>
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{course.completionRate}%</span>
                  </div>
                </div>
                {course.mandatory && (
                  <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded shrink-0" style={{ fontSize: "11px", fontWeight: 500 }}>Bắt buộc</span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-4">Cảnh báo & Nhắc nhở</h3>
          <div className="space-y-3">
            <AlertCard bg="bg-red-50" icon={<AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />} title="45 chứng chỉ sắp hết hạn" desc="Chứng chỉ An toàn LĐ cần gia hạn trước 20/04/2026" linkTo="/certificates" linkColor="#990803" linkText="Xem chi tiết →" />
            <AlertCard bg="bg-yellow-50" icon={<Target className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />} title="KPI Q1/2026 chưa đạt" desc="Khối Kỹ thuật: tỷ lệ hoàn thành 75% (mục tiêu 85%)" linkTo="/reports" linkColor="#c8a84e" linkText="Xem báo cáo →" />
            <AlertCard bg="bg-green-50" icon={<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />} title="Onboarding Q1 hoàn tất" desc="128 nhân viên mới đã hoàn thành chương trình hội nhập" />
            <AlertCard bg="bg-blue-50" icon={<BookOpen className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />} title="3 khóa học mới chờ duyệt" desc="Cần phê duyệt nội dung trước khi xuất bản" linkTo="/courses" linkColor="#2e86de" linkText="Duyệt ngay →" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// INSTRUCTOR DASHBOARD
// ====================================================
function InstructorDashboard() {
  const { user } = useAuth();

  const myCourses = [
    { id: "C004", title: "Marketing số & Truyền thông Thương hiệu", students: 312, completion: 71, rating: 4.5, newSubmissions: 8, thumbnail: mockCourses[3]?.thumbnail },
    { id: "IC01", title: "SEO Nâng cao cho Bất động sản", students: 85, completion: 62, rating: 4.3, newSubmissions: 3, thumbnail: mockCourses[2]?.thumbnail },
    { id: "IC02", title: "Content Marketing B2B", students: 128, completion: 78, rating: 4.7, newSubmissions: 5, thumbnail: mockCourses[4]?.thumbnail },
  ];

  const kpiCards = [
    { label: "Khóa học giảng dạy", value: "3", change: "+1 khóa mới", trend: "up" as const, icon: BookOpen, color: "#990803", bg: "#99080310" },
    { label: "Tổng học viên", value: "525", change: "+42 tuần này", trend: "up" as const, icon: Users, color: "#2e86de", bg: "#2e86de10" },
    { label: "Đánh giá trung bình", value: "4.5", change: "+0.2", trend: "up" as const, icon: Star, color: "#c8a84e", bg: "#c8a84e15" },
    { label: "Tỷ lệ HT trung bình", value: "70.3%", change: "+3.5%", trend: "up" as const, icon: Award, color: "#27ae60", bg: "#27ae6010" },
  ];

  const recentSubmissions = [
    { student: "Nguyễn Thị Hà", course: "Marketing số", type: "Bài tập", time: "30 phút trước", status: "pending" },
    { student: "Trần Văn Đức", course: "SEO Nâng cao", type: "Bài kiểm tra", time: "2 giờ trước", status: "pending" },
    { student: "Lê Minh Anh", course: "Content Marketing", type: "Bài tập", time: "3 giờ trước", status: "pending" },
    { student: "Phạm Thùy Linh", course: "Marketing số", type: "Dự án cuối khóa", time: "5 giờ trước", status: "pending" },
    { student: "Hoàng Đức Thịnh", course: "Marketing số", type: "Bài kiểm tra", time: "1 ngày trước", status: "graded" },
    { student: "Vũ Thị Ngọc", course: "SEO Nâng cao", type: "Bài tập", time: "1 ngày trước", status: "graded" },
  ];

  const studentEngagement = [
    { week: "T1", active: 320, completed: 45 },
    { week: "T2", active: 345, completed: 52 },
    { week: "T3", active: 310, completed: 48 },
    { week: "T4", active: 380, completed: 65 },
    { week: "T5", active: 420, completed: 78 },
    { week: "T6", active: 450, completed: 85 },
    { week: "T7", active: 410, completed: 72 },
    { week: "T8", active: 480, completed: 92 },
    { week: "T9", active: 525, completed: 105 },
  ];

  const quickActions = [
    { label: "Tạo khóa học", icon: Plus, color: "#990803", to: "/courses" },
    { label: "Quản lý bài kiểm tra", icon: ClipboardCheck, color: "#2e86de", to: "/quizzes" },
    { label: "Diễn đàn", icon: MessageCircle, color: "#c8a84e", to: "/forum" },
    { label: "Lịch giảng dạy", icon: Calendar, color: "#27ae60", to: "/calendar" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-foreground">Bảng điều khiển Giảng viên</h1>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
            Xin chào, <span style={{ fontWeight: 500 }}>{user?.name}</span>. Bạn có <span className="text-[#990803]" style={{ fontWeight: 600 }}>16 bài nộp</span> chờ chấm điểm.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg hover:shadow-md transition-all hover:-translate-y-0.5"
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              <action.icon className="w-3.5 h-3.5" style={{ color: action.color }} />
              <span className="hidden sm:inline">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600" style={{ fontSize: "12px", fontWeight: 500 }}>
                <TrendingUp className="w-3 h-3" />{kpi.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-foreground" style={{ fontSize: "28px", fontWeight: 700, lineHeight: 1.2 }}>{kpi.value}</p>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* My Courses & Student Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* My Courses */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Khóa học của tôi</h3>
            <Link to="/courses" className="flex items-center gap-1 text-[#c8a84e] hover:underline" style={{ fontSize: "13px", fontWeight: 500 }}>
              Quản lý <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {myCourses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group">
                <img src={course.thumbnail} alt={course.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate group-hover:text-[#c8a84e] transition-colors" style={{ fontSize: "14px", fontWeight: 500 }}>{course.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{course.students} học viên</span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "12px" }}>
                      <Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" /> {course.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 max-w-[200px] h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#990803]" style={{ width: `${course.completion}%` }} />
                    </div>
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{course.completion}% HT</span>
                  </div>
                </div>
                {course.newSubmissions > 0 && (
                  <span className="px-2 py-1 bg-[#990803]/10 text-[#990803] rounded-lg shrink-0" style={{ fontSize: "11px", fontWeight: 600 }}>
                    {course.newSubmissions} bài mới
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Student Engagement Mini Chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-1">Học viên hoạt động</h3>
          <p className="text-muted-foreground mb-4" style={{ fontSize: "12px" }}>9 tháng gần nhất</p>
          {(() => {
            const W = 280, H = 180, padL = 40, padR = 10, padT = 10, padB = 25;
            const chartW = W - padL - padR, chartH = H - padT - padB;
            const maxVal = Math.max(...studentEngagement.map(d => d.active));
            const n = studentEngagement.length;
            const xStep = chartW / (n - 1);
            const pts = studentEngagement.map((d, i) => `${padL + i * xStep},${padT + chartH - (d.active / maxVal) * chartH}`).join(' ');
            const area = `M${padL},${padT + chartH} ` + studentEngagement.map((d, i) => `L${padL + i * xStep},${padT + chartH - (d.active / maxVal) * chartH}`).join(' ') + ` L${padL + (n - 1) * xStep},${padT + chartH} Z`;
            return (
              <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
                <defs><linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#990803" stopOpacity="0.15" /><stop offset="100%" stopColor="#990803" stopOpacity="0.02" /></linearGradient></defs>
                {[0, 0.5, 1].map(t => <line key={t} x1={padL} y1={padT + chartH - t * chartH} x2={W - padR} y2={padT + chartH - t * chartH} stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />)}
                {[0, 0.5, 1].map(t => <text key={`l${t}`} x={padL - 6} y={padT + chartH - t * chartH + 4} textAnchor="end" fill="#6b7194" style={{ fontSize: "10px" }}>{Math.round(maxVal * t)}</text>)}
                {studentEngagement.map((d, i) => <text key={d.week} x={padL + i * xStep} y={H - 5} textAnchor="middle" fill="#6b7194" style={{ fontSize: "9px" }}>{d.week}</text>)}
                <path d={area} fill="url(#engGrad)" />
                <polyline points={pts} fill="none" stroke="#990803" strokeWidth={2} strokeLinejoin="round" />
                {studentEngagement.map((d, i) => <circle key={d.week} cx={padL + i * xStep} cy={padT + chartH - (d.active / maxVal) * chartH} r={2.5} fill="#990803" />)}
              </svg>
            );
          })()}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div>
              <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>525</p>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Học viên hiện tại</p>
            </div>
            <div className="text-right">
              <p className="text-green-600" style={{ fontSize: "14px", fontWeight: 600 }}>+28%</p>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>so với tháng trước</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Submissions */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Bài nộp gần đây</h3>
            <span className="px-2.5 py-1 bg-[#990803]/10 text-[#990803] rounded-lg" style={{ fontSize: "12px", fontWeight: 600 }}>
              {recentSubmissions.filter(s => s.status === "pending").length} chờ chấm
            </span>
          </div>
          <div className="space-y-2">
            {recentSubmissions.map((sub, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground shrink-0" style={{ fontSize: "11px", fontWeight: 600 }}>
                  {sub.student.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 500 }}>{sub.student}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{sub.course} • {sub.type}</p>
                </div>
                <span className="text-muted-foreground shrink-0" style={{ fontSize: "11px" }}>{sub.time}</span>
                {sub.status === "pending" ? (
                  <button onClick={() => toast.success(`Đang mở bài chấm điểm "${sub.student}"...`)} className="px-2.5 py-1 bg-[#990803] text-white rounded-md shrink-0 hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "11px", fontWeight: 500 }}>Chấm điểm</button>
                ) : (
                  <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-md shrink-0" style={{ fontSize: "11px", fontWeight: 500 }}>Đã chấm</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructor Alerts */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-4">Nhắc nhở</h3>
          <div className="space-y-3">
            <AlertCard bg="bg-red-50" icon={<AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />} title="16 bài nộp chờ chấm" desc="4 bài đã quá hạn chấm điểm 48h" linkTo="/quizzes" linkColor="#990803" linkText="Chấm ngay →" />
            <AlertCard bg="bg-yellow-50" icon={<Target className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />} title="12 học viên tụt tiến độ" desc="Khóa Marketing số: 12 HV chưa hoàn thành bài tuần 3" linkTo="/courses" linkColor="#c8a84e" linkText="Xem chi tiết →" />
            <AlertCard bg="bg-blue-50" icon={<MessageCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />} title="5 câu hỏi chờ trả lời" desc="Diễn đàn có câu hỏi mới từ học viên" linkTo="/forum" linkColor="#2e86de" linkText="Trả lời →" />
            <AlertCard bg="bg-green-50" icon={<CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />} title="Lớp học ngày mai" desc="Marketing số - Buổi 8, 09:00-11:30, Phòng A1" linkTo="/calendar" linkColor="#27ae60" linkText="Xem lịch →" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// LEARNER DASHBOARD
// ====================================================
function LearnerDashboard() {
  const { user } = useAuth();

  const myStats = {
    enrolled: 5,
    completed: 18,
    totalHours: 150,
    certificates: 5,
    streak: 7,
  };

  const weeklyGoal = { target: 10, achieved: 7.5 };

  const inProgressCourses = [
    { id: "C003", title: "Phân tích Tài chính Doanh nghiệp", progress: 45, lastAccessed: "Hôm nay", nextLesson: "Phân tích dòng tiền", thumbnail: mockCourses[2]?.thumbnail, deadline: "15/03/2026" },
    { id: "C007", title: "Tuân thủ Pháp luật Doanh nghiệp", progress: 88, lastAccessed: "Hôm qua", nextLesson: "Kiểm tra cuối khóa", thumbnail: mockCourses[6]?.thumbnail, deadline: "20/03/2026" },
    { id: "C008", title: "Kỹ năng Teamwork & Giao tiếp Hiệu quả", progress: 60, lastAccessed: "3 ngày trước", nextLesson: "Kỹ năng đàm phán", thumbnail: mockCourses[7]?.thumbnail, deadline: "30/03/2026" },
  ];

  const recentActivities = [
    { action: "Hoàn thành bài học", detail: "Luật Doanh nghiệp 2024 - Tuân thủ PL", time: "2 giờ trước", type: "complete" },
    { action: "Nộp bài kiểm tra", detail: "Phân tích dòng tiền FCF - 60 điểm", time: "Hôm qua", type: "quiz" },
    { action: "Bắt đầu khóa mới", detail: "Kỹ năng Teamwork & Giao tiếp", time: "3 ngày trước", type: "start" },
    { action: "Đạt chứng chỉ", detail: "An toàn Lao động cơ bản", time: "1 tuần trước", type: "cert" },
  ];

  const recommendedCourses = [
    { id: "C001", title: "Kỹ năng Lãnh đạo cho Quản lý Cấp trung", reason: "Phù hợp với lộ trình phát triển", thumbnail: mockCourses[0]?.thumbnail },
    { id: "C005", title: "Quản lý Dự án theo chuẩn PMI", reason: "Đề xuất từ quản lý trực tiếp", thumbnail: mockCourses[4]?.thumbnail },
  ];

  // Streak data: last 28 days
  const streakData = Array.from({ length: 28 }, (_, i) => {
    const active = i >= 21 || (i >= 14 && i < 21 && Math.random() > 0.3) || Math.random() > 0.5;
    return { day: i, active, hours: active ? 0.5 + Math.random() * 2 : 0 };
  });

  const kpiCards = [
    { label: "Khóa đang học", value: String(myStats.enrolled), icon: BookOpen, color: "#990803", bg: "#99080310" },
    { label: "Đã hoàn thành", value: String(myStats.completed), icon: CheckCircle2, color: "#27ae60", bg: "#27ae6010" },
    { label: "Giờ học tích lũy", value: String(myStats.totalHours) + "h", icon: Clock, color: "#2e86de", bg: "#2e86de10" },
    { label: "Chứng chỉ đạt được", value: String(myStats.certificates), icon: Award, color: "#c8a84e", bg: "#c8a84e15" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-foreground">Học tập của tôi</h1>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
            Xin chào, <span style={{ fontWeight: 500 }}>{user?.name}</span>. Bạn đang duy trì chuỗi <span className="text-[#c8a84e]" style={{ fontWeight: 600 }}>{myStats.streak} ngày</span> học liên tục!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/courses" className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg hover:shadow-md transition-all hover:-translate-y-0.5" style={{ fontSize: "12px", fontWeight: 500 }}>
            <BookOpen className="w-3.5 h-3.5 text-[#990803]" /> Khám phá khóa học
          </Link>
          <Link to="/certificates" className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg hover:shadow-md transition-all hover:-translate-y-0.5" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Award className="w-3.5 h-3.5 text-[#c8a84e]" /> Chứng chỉ
          </Link>
          <Link to="/learning-paths" className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg hover:shadow-md transition-all hover:-translate-y-0.5" style={{ fontSize: "12px", fontWeight: 500 }}>
            <GraduationCap className="w-3.5 h-3.5 text-[#27ae60]" /> Lộ trình
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
              <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
            </div>
            <div className="mt-4">
              <p className="text-foreground" style={{ fontSize: "28px", fontWeight: 700, lineHeight: 1.2 }}>{kpi.value}</p>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Learning & Weekly Goal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Continue Learning */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Tiếp tục học tập</h3>
            <Link to="/my-learning" className="flex items-center gap-1 text-[#c8a84e] hover:underline" style={{ fontSize: "13px", fontWeight: 500 }}>
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {inProgressCourses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group">
                <img src={course.thumbnail} alt={course.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate group-hover:text-[#c8a84e] transition-colors" style={{ fontSize: "14px", fontWeight: 500 }}>{course.title}</p>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>
                    Tiếp theo: <span style={{ fontWeight: 500 }}>{course.nextLesson}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 max-w-[200px] h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${course.progress}%`, backgroundColor: course.progress >= 80 ? "#27ae60" : "#990803" }} />
                    </div>
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{course.progress}%</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Hạn: {course.deadline}</span>
                  <div className="mt-1">
                    <PlayCircle className="w-6 h-6 text-[#990803]" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Weekly Goal & Streak */}
        <div className="space-y-4">
          {/* Weekly Goal */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-foreground mb-3">Mục tiêu tuần này</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#f0f0f0" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#990803" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${(weeklyGoal.achieved / weeklyGoal.target) * 213.6} 213.6`}
                    transform="rotate(-90 40 40)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span style={{ fontSize: "16px", fontWeight: 700 }}>{weeklyGoal.achieved}</span>
                  <span className="text-muted-foreground" style={{ fontSize: "9px" }}>/{weeklyGoal.target}h</span>
                </div>
              </div>
              <div className="flex-1">
                <p style={{ fontSize: "13px", fontWeight: 500 }}>{Math.round((weeklyGoal.achieved / weeklyGoal.target) * 100)}% hoàn thành</p>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>Còn {(weeklyGoal.target - weeklyGoal.achieved).toFixed(1)}h để đạt mục tiêu</p>
                <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#990803]" style={{ width: `${(weeklyGoal.achieved / weeklyGoal.target) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-foreground">Chuỗi học tập</h3>
              <div className="flex items-center gap-1 text-[#c8a84e]">
                <Flame className="w-4 h-4" />
                <span style={{ fontSize: "14px", fontWeight: 700 }}>{myStats.streak} ngày</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {streakData.map((d, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-sm"
                  style={{ backgroundColor: d.active ? `rgba(153,8,3,${0.3 + d.hours * 0.2})` : "#f0f0f0" }}
                  title={d.active ? `${d.hours.toFixed(1)}h` : "Không học"}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-muted-foreground" style={{ fontSize: "10px" }}>4 tuần trước</span>
              <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Hôm nay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Recommended */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-4">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {recentActivities.map((act, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  act.type === "complete" ? "bg-green-50" : act.type === "quiz" ? "bg-blue-50" : act.type === "start" ? "bg-purple-50" : "bg-yellow-50"
                }`}>
                  {act.type === "complete" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                   act.type === "quiz" ? <ClipboardCheck className="w-4 h-4 text-blue-500" /> :
                   act.type === "start" ? <PlayCircle className="w-4 h-4 text-purple-500" /> :
                   <Award className="w-4 h-4 text-[#c8a84e]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{act.action}</p>
                  <p className="text-muted-foreground truncate" style={{ fontSize: "12px" }}>{act.detail}</p>
                </div>
                <span className="text-muted-foreground shrink-0" style={{ fontSize: "11px" }}>{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended + Alerts */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-foreground mb-3">Đề xuất cho bạn</h3>
            <div className="space-y-3">
              {recommendedCourses.map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                  <img src={course.thumbnail} alt={course.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  <div className="min-w-0">
                    <p className="text-foreground truncate group-hover:text-[#c8a84e]" style={{ fontSize: "13px", fontWeight: 500 }}>{course.title}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{course.reason}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-foreground mb-3">Nhắc nhở</h3>
            <div className="space-y-3">
              <AlertCard bg="bg-red-50" icon={<AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />} title="Deadline sắp tới" desc="Tuân thủ PL: hoàn thành trước 15/03/2026" linkTo="/my-learning" linkColor="#990803" linkText="Học ngay →" />
              <AlertCard bg="bg-yellow-50" icon={<ClipboardCheck className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />} title="Bài thi chưa đạt" desc="Phân tích dòng tiền FCF: 60/65 điểm. Còn 1 lượt thi" linkTo="/quizzes" linkColor="#c8a84e" linkText="Thi lại →" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// SHARED COMPONENTS
// ====================================================
function AlertCard({ bg, icon, title, desc, linkTo, linkColor, linkText }: {
  bg: string; icon: React.ReactNode; title: string; desc: string; linkTo?: string; linkColor?: string; linkText?: string;
}) {
  return (
    <div className={`flex items-start gap-3 p-3 ${bg} rounded-lg`}>
      {icon}
      <div>
        <p style={{ fontSize: "13px", fontWeight: 500 }}>{title}</p>
        <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>{desc}</p>
        {linkTo && linkText && (
          <Link to={linkTo} className="mt-1 inline-block hover:underline" style={{ fontSize: "11px", fontWeight: 500, color: linkColor }}>{linkText}</Link>
        )}
      </div>
    </div>
  );
}

function MonthlyLearningChart({ period = "12" }: { period?: string }) {
  const data = period === "6" ? monthlyLearningData.slice(-6) : monthlyLearningData;
  const W = 560, H = 240, padL = 50, padR = 20, padT = 10, padB = 30;
  const chartW = W - padL - padR, chartH = H - padT - padB;
  const maxH = Math.max(...data.map(d => d.hours));
  const maxC = Math.max(...data.map(d => d.completions));
  const n = data.length;
  const xStep = chartW / (n - 1);
  const hoursPoints = data.map((d, i) => `${padL + i * xStep},${padT + chartH - (d.hours / maxH) * chartH}`).join(' ');
  const compPoints = data.map((d, i) => `${padL + i * xStep},${padT + chartH - (d.completions / maxC) * chartH}`).join(' ');
  const hoursArea = `M${padL},${padT + chartH} ` + data.map((d, i) => `L${padL + i * xStep},${padT + chartH - (d.hours / maxH) * chartH}`).join(' ') + ` L${padL + (n - 1) * xStep},${padT + chartH} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#990803" stopOpacity="0.15" /><stop offset="100%" stopColor="#990803" stopOpacity="0.02" /></linearGradient></defs>
      {yTicks.map(t => <line key={`g${t}`} x1={padL} y1={padT + chartH - t * chartH} x2={W - padR} y2={padT + chartH - t * chartH} stroke="rgba(0,0,0,0.06)" strokeDasharray="3 3" />)}
      {yTicks.map(t => <text key={`y${t}`} x={padL - 8} y={padT + chartH - t * chartH + 4} textAnchor="end" fill="#6b7194" style={{ fontSize: "11px" }}>{Math.round(maxH * t)}</text>)}
      {data.map((d, i) => <text key={d.month} x={padL + i * xStep} y={H - 5} textAnchor="middle" fill="#6b7194" style={{ fontSize: "11px" }}>{d.month}</text>)}
      <path d={hoursArea} fill="url(#hoursGradient)" />
      <polyline points={hoursPoints} fill="none" stroke="#990803" strokeWidth={2.5} strokeLinejoin="round" />
      {data.map((d, i) => <circle key={`h${d.month}`} cx={padL + i * xStep} cy={padT + chartH - (d.hours / maxH) * chartH} r={3} fill="#990803" />)}
      <polyline points={compPoints} fill="none" stroke="#c8a84e" strokeWidth={2} strokeLinejoin="round" strokeDasharray="6 3" />
      {data.map((d, i) => <circle key={`c${d.month}`} cx={padL + i * xStep} cy={padT + chartH - (d.completions / maxC) * chartH} r={3} fill="#c8a84e" />)}
    </svg>
  );
}

function CategoryDonutChart() {
  const total = categoryDistribution.reduce((sum, d) => sum + d.value, 0);
  const cx = 90, cy = 90, outerR = 80, innerR = 50, gap = 2;
  let cumulative = 0;
  return (
    <div className="flex justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        {categoryDistribution.map((item) => {
          const startAngle = (cumulative / total) * 360 - 90;
          cumulative += item.value;
          const endAngle = (cumulative / total) * 360 - 90;
          const gapAngle = (gap / outerR) * (180 / Math.PI);
          const s = ((startAngle + gapAngle / 2) * Math.PI) / 180;
          const e = ((endAngle - gapAngle / 2) * Math.PI) / 180;
          const largeArc = e - s > Math.PI ? 1 : 0;
          const d = [
            `M ${cx + outerR * Math.cos(s)} ${cy + outerR * Math.sin(s)}`,
            `A ${outerR} ${outerR} 0 ${largeArc} 1 ${cx + outerR * Math.cos(e)} ${cy + outerR * Math.sin(e)}`,
            `L ${cx + innerR * Math.cos(e)} ${cy + innerR * Math.sin(e)}`,
            `A ${innerR} ${innerR} 0 ${largeArc} 0 ${cx + innerR * Math.cos(s)} ${cy + innerR * Math.sin(s)}`,
            'Z',
          ].join(' ');
          return <path key={item.name} d={d} fill={item.color} className="hover:opacity-80 transition-opacity cursor-pointer" />;
        })}
        <text x="90" y="86" textAnchor="middle" fill="#1a1d2e" style={{ fontSize: "22px", fontWeight: 700 }}>100%</text>
        <text x="90" y="104" textAnchor="middle" fill="#6b7194" style={{ fontSize: "11px" }}>Tổng phân bổ</text>
      </svg>
    </div>
  );
}

// ====================================================
// MAIN EXPORT - ROLE ROUTER
// ====================================================
export function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  // Dashboard legacy variants — Phase 1 dùng legacyRole để render
  // đúng style cho 3 nhóm (admin / instructor / learner). Phase 3-7
  // sẽ thay bằng dashboard riêng cho từng phân hệ STEM.
  switch (user.legacyRole) {
    case "admin":
      return <AdminDashboard />;
    case "instructor":
      return <InstructorDashboard />;
    case "learner":
      return <LearnerDashboard />;
    default:
      return <AdminDashboard />;
  }
}