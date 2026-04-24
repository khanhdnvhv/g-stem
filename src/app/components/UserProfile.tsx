import { useState } from "react";
import { Link } from "react-router";
import {
  User, Mail, Phone, Building2, Briefcase, Shield, Award, BookOpen,
  Clock, TrendingUp, Star, Target, Flame, Trophy, Calendar, Edit,
  Camera, GraduationCap, BarChart3, Users, MessageCircle, Heart,
  CheckCircle, Zap, FileText, Video, ChevronRight, PenTool,
} from "lucide-react";
import { useAuth, roleLabelsMap } from "./AuthContext";

// ─── Mock profile data per role ───
const ADMIN_STATS = {
  totalUsers: 6610, totalCourses: 156, avgCompletion: 83.2, activeSessions: 1240,
  newUsersMonth: 128, coursesCreated: 12, reportsGenerated: 45, pendingApprovals: 7,
  systemUptime: "99.7%", storageUsed: "2.4 TB / 5 TB",
  recentActions: [
    { action: "Phê duyệt khóa học 'ESG & Phát triển Bền vững'", time: "30 phút trước", icon: "✅" },
    { action: "Xuất báo cáo Q1/2026 cho Ban Giám đốc", time: "2 giờ trước", icon: "📊" },
    { action: "Cập nhật quyền truy cập cho 5 đơn vị mới", time: "5 giờ trước", icon: "🔐" },
    { action: "Tạo lộ trình đào tạo 'Onboarding 2026'", time: "1 ngày trước", icon: "🛤️" },
    { action: "Duyệt 3 chứng chỉ mới cho phòng Kỹ thuật", time: "1 ngày trước", icon: "🎓" },
  ],
};

const INSTRUCTOR_STATS = {
  totalStudents: 525, totalCourses: 3, avgRating: 4.5, completionRate: 70.3,
  pendingGrading: 16, forumReplies: 89, hoursTeaching: 156, certificates: 2,
  topCourses: [
    { name: "Marketing số & Truyền thông", students: 312, rating: 4.5, completion: 71 },
    { name: "SEO Nâng cao cho BĐS", students: 85, rating: 4.3, completion: 62 },
    { name: "Content Marketing B2B", students: 128, rating: 4.7, completion: 78 },
  ],
  recentActions: [
    { action: "Chấm 5 bài kiểm tra Marketing số", time: "1 giờ trước", icon: "📝" },
    { action: "Trả lời 3 câu hỏi trên diễn đàn", time: "3 giờ trước", icon: "💬" },
    { action: "Cập nhật nội dung bài giảng tuần 5", time: "Hôm qua", icon: "📖" },
    { action: "Tạo bài kiểm tra SEO nâng cao", time: "2 ngày trước", icon: "📋" },
  ],
};

const LEARNER_STATS = {
  enrolled: 5, completed: 18, totalHours: 150, certificates: 5,
  currentStreak: 7, longestStreak: 15, avgScore: 82.5, rank: 156,
  totalXP: 4850, level: 4, levelName: "Tích cực",
  skills: [
    { name: "Tài chính", level: 75 },
    { name: "Marketing", level: 45 },
    { name: "Lãnh đạo", level: 30 },
    { name: "Pháp luật", level: 60 },
    { name: "Kỹ năng mềm", level: 55 },
    { name: "CNTT", level: 40 },
  ],
  recentActions: [
    { action: "Hoàn thành bài học: Luật DN 2024", time: "2 giờ trước", icon: "✅" },
    { action: "Nộp bài kiểm tra: Phân tích FCF", time: "Hôm qua", icon: "📝" },
    { action: "Bắt đầu khóa: Teamwork & Giao tiếp", time: "3 ngày trước", icon: "▶️" },
    { action: "Đạt chứng chỉ: An toàn Lao động", time: "1 tuần trước", icon: "🎓" },
  ],
};

export function UserProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "skills">("overview");
  if (!user) return null;

  const role = user.legacyRole;
  const roleInfo = roleLabelsMap[user.role];

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-[#990803] to-[#7a0602] rounded-xl p-5 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-5" style={{ fontSize: "120px" }}>
          {role === "admin" ? "👨‍💼" : role === "instructor" ? "👨‍🏫" : "🎓"}
        </div>
        <div className="flex items-center gap-5 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white border-3 border-[#c8a84e]/50" style={{ fontSize: "28px", fontWeight: 700 }}>
              {user.initials}
            </div>
            <button onClick={() => { import("sonner").then(m => m.toast.info("Chọn ảnh đại diện mới...")); }} className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#c8a84e] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#b09740]">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          {/* Info */}
          <div className="flex-1">
            <h2 style={{ fontSize: "22px", fontWeight: 700 }}>{user.name}</h2>
            <p className="text-white/70" style={{ fontSize: "13px" }}>{user.position}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, backgroundColor: roleInfo.bg, color: roleInfo.color }}>
                {roleInfo.label}
              </span>
              <span className="flex items-center gap-1 text-white/60" style={{ fontSize: "11px" }}>
                <Building2 className="w-3 h-3" /> {user.subsidiary}
              </span>
              <span className="flex items-center gap-1 text-white/60" style={{ fontSize: "11px" }}>
                <Briefcase className="w-3 h-3" /> {user.department}
              </span>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-white/50" style={{ fontSize: "10px" }}>Email</p>
            <p className="text-white/80" style={{ fontSize: "12px" }}>{user.email}</p>
            <p className="text-white/50 mt-1" style={{ fontSize: "10px" }}>Mã NV</p>
            <p className="text-white/80" style={{ fontSize: "12px" }}>{user.id}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0.5">
          {[
            { id: "overview" as const, label: "Tổng quan" },
            { id: "activity" as const, label: "Hoạt động" },
            { id: "skills" as const, label: role === "admin" ? "Hệ thống" : role === "instructor" ? "Khóa học" : "Kỹ năng" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all ${activeTab === tab.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              style={{ fontSize: "13px", fontWeight: activeTab === tab.id ? 600 : 400 }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on role + tab */}
      {role === "admin" && <AdminProfile tab={activeTab} />}
      {role === "instructor" && <InstructorProfile tab={activeTab} />}
      {role === "learner" && <LearnerProfile tab={activeTab} />}
    </div>
  );
}

// ─── Admin Profile ───
function AdminProfile({ tab }: { tab: string }) {
  const s = ADMIN_STATS;
  if (tab === "overview") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard icon={Users} label="Nhân sự" value={s.totalUsers.toLocaleString()} color="#990803" />
            <KPICard icon={BookOpen} label="Khóa học" value={s.totalCourses.toString()} color="#2563eb" />
            <KPICard icon={TrendingUp} label="HT trung bình" value={`${s.avgCompletion}%`} color="#16a34a" />
            <KPICard icon={Zap} label="Sessions/tháng" value={s.activeSessions.toLocaleString()} color="#c8a84e" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Thống kê Quản trị</h3>
            <AdminStatsChart />
          </div>
        </div>
        <div className="space-y-4">
          <QuickLinks role="admin" />
          <SystemInfo uptime={s.systemUptime} storage={s.storageUsed} pending={s.pendingApprovals} />
        </div>
      </div>
    );
  }
  if (tab === "activity") return <ActivityList actions={s.recentActions} />;
  return <SystemDashboard stats={s} />;
}

// ─── Instructor Profile ───
function InstructorProfile({ tab }: { tab: string }) {
  const s = INSTRUCTOR_STATS;
  if (tab === "overview") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard icon={Users} label="Học viên" value={s.totalStudents.toString()} color="#990803" />
            <KPICard icon={Star} label="Đánh giá TB" value={s.avgRating.toString()} color="#c8a84e" />
            <KPICard icon={PenTool} label="Chờ chấm" value={s.pendingGrading.toString()} color="#ea580c" />
            <KPICard icon={Clock} label="Giờ giảng" value={`${s.hoursTeaching}h`} color="#2563eb" />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Hiệu suất Giảng dạy</h3>
            <TeachingPerformanceChart courses={s.topCourses} />
          </div>
        </div>
        <div className="space-y-4">
          <QuickLinks role="instructor" />
          <TeachingHighlights replies={s.forumReplies} certs={s.certificates} />
        </div>
      </div>
    );
  }
  if (tab === "activity") return <ActivityList actions={s.recentActions} />;
  return <CourseOverview courses={s.topCourses} />;
}

// ─── Learner Profile ───
function LearnerProfile({ tab }: { tab: string }) {
  const s = LEARNER_STATS;
  if (tab === "overview") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard icon={BookOpen} label="Đang học" value={s.enrolled.toString()} color="#990803" />
            <KPICard icon={CheckCircle} label="Hoàn thành" value={s.completed.toString()} color="#16a34a" />
            <KPICard icon={Clock} label="Tổng giờ" value={`${s.totalHours}h`} color="#2563eb" />
            <KPICard icon={Award} label="Chứng chỉ" value={s.certificates.toString()} color="#c8a84e" />
          </div>
          {/* Level + XP */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-700" style={{ fontSize: "14px", fontWeight: 600 }}>Level & XP</h3>
              <Link to="/gamification" className="text-[#990803] flex items-center gap-1 hover:underline" style={{ fontSize: "11px", fontWeight: 500 }}>
                Gamification <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <LevelBadge level={s.level} name={s.levelName} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-500" style={{ fontSize: "11px" }}>Level {s.level} — {s.levelName}</span>
                  <span className="text-[#c8a84e]" style={{ fontSize: "12px", fontWeight: 600 }}>{s.totalXP.toLocaleString()} XP</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#990803] to-[#c8a84e] rounded-full" style={{ width: "60%" }} />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: "10px" }}>
                    <Flame className="w-3 h-3 text-orange-500" /> Chuỗi {s.currentStreak} ngày
                  </span>
                  <span className="text-gray-400" style={{ fontSize: "10px" }}>Xếp hạng #{s.rank}/6,610</span>
                </div>
              </div>
            </div>
          </div>
          {/* Skills radar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Bản đồ Kỹ năng</h3>
            <SkillsRadar skills={s.skills} />
          </div>
        </div>
        <div className="space-y-4">
          <QuickLinks role="learner" />
          <LearnerHighlights avgScore={s.avgScore} streak={s.currentStreak} longestStreak={s.longestStreak} />
        </div>
      </div>
    );
  }
  if (tab === "activity") return <ActivityList actions={s.recentActions} />;
  return <SkillsDetail skills={s.skills} />;
}

// ─── Shared Components ───

function KPICard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3.5">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "10" }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        <div>
          <p style={{ fontSize: "18px", fontWeight: 700, color }}>{value}</p>
          <p className="text-gray-400" style={{ fontSize: "10px" }}>{label}</p>
        </div>
      </div>
    </div>
  );
}

function QuickLinks({ role }: { role: string }) {
  const links = role === "admin" ? [
    { to: "/reports", icon: BarChart3, label: "Báo cáo", color: "#990803" },
    { to: "/approvals", icon: CheckCircle, label: "Phê duyệt", color: "#ea580c" },
    { to: "/employees", icon: Users, label: "Nhân sự", color: "#2563eb" },
    { to: "/settings", icon: Shield, label: "Cài đặt", color: "#7c3aed" },
  ] : role === "instructor" ? [
    { to: "/grading", icon: PenTool, label: "Chấm điểm", color: "#990803" },
    { to: "/courses", icon: BookOpen, label: "Khóa học", color: "#2563eb" },
    { to: "/forum", icon: MessageCircle, label: "Diễn đàn", color: "#16a34a" },
    { to: "/mentoring", icon: Heart, label: "Mentoring", color: "#c8a84e" },
  ] : [
    { to: "/my-learning", icon: GraduationCap, label: "Học tập", color: "#990803" },
    { to: "/certificates", icon: Award, label: "Chứng chỉ", color: "#c8a84e" },
    { to: "/gamification", icon: Trophy, label: "Gamification", color: "#7c3aed" },
    { to: "/idp", icon: Target, label: "Phát triển", color: "#16a34a" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-gray-700 mb-2.5" style={{ fontSize: "13px", fontWeight: 600 }}>Truy cập nhanh</h3>
      <div className="grid grid-cols-2 gap-2">
        {links.map(l => (
          <Link key={l.to} to={l.to} className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all">
            <l.icon className="w-4 h-4" style={{ color: l.color }} />
            <span className="text-gray-600" style={{ fontSize: "11px", fontWeight: 500 }}>{l.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ActivityList({ actions }: { actions: { action: string; time: string; icon: string }[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Hoạt động gần đây</h3>
      <div className="space-y-2">
        {actions.map((a, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <span style={{ fontSize: "18px" }}>{a.icon}</span>
            <div className="flex-1">
              <p className="text-gray-700" style={{ fontSize: "13px" }}>{a.action}</p>
              <p className="text-gray-400" style={{ fontSize: "11px" }}>{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemInfo({ uptime, storage, pending }: { uptime: string; storage: string; pending: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-gray-700 mb-2.5" style={{ fontSize: "13px", fontWeight: 600 }}>Thông tin Hệ thống</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
          <span className="text-gray-400" style={{ fontSize: "11px" }}>Uptime</span>
          <span className="text-green-600" style={{ fontSize: "12px", fontWeight: 600 }}>{uptime}</span>
        </div>
        <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
          <span className="text-gray-400" style={{ fontSize: "11px" }}>Dung lượng</span>
          <span className="text-gray-600" style={{ fontSize: "12px", fontWeight: 500 }}>{storage}</span>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <span className="text-gray-400" style={{ fontSize: "11px" }}>Chờ duyệt</span>
          <span className="text-amber-600" style={{ fontSize: "12px", fontWeight: 600 }}>{pending}</span>
        </div>
      </div>
    </div>
  );
}

function TeachingHighlights({ replies, certs }: { replies: number; certs: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-gray-700 mb-2.5" style={{ fontSize: "13px", fontWeight: 600 }}>Điểm nhấn</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
          <MessageCircle className="w-4 h-4 text-blue-500" />
          <span className="text-gray-600" style={{ fontSize: "12px" }}>{replies} trả lời diễn đàn</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
          <Award className="w-4 h-4 text-green-600" />
          <span className="text-gray-600" style={{ fontSize: "12px" }}>{certs} chứng chỉ giảng viên</span>
        </div>
      </div>
    </div>
  );
}

function LearnerHighlights({ avgScore, streak, longestStreak }: { avgScore: number; streak: number; longestStreak: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-gray-700 mb-2.5" style={{ fontSize: "13px", fontWeight: 600 }}>Điểm nhấn</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
          <span className="text-gray-600 flex items-center gap-1.5" style={{ fontSize: "12px" }}><BarChart3 className="w-3.5 h-3.5 text-blue-500" /> Điểm TB</span>
          <span className="text-blue-600" style={{ fontSize: "13px", fontWeight: 600 }}>{avgScore}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
          <span className="text-gray-600 flex items-center gap-1.5" style={{ fontSize: "12px" }}><Flame className="w-3.5 h-3.5 text-orange-500" /> Chuỗi hiện tại</span>
          <span className="text-orange-600" style={{ fontSize: "13px", fontWeight: 600 }}>{streak} ngày</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
          <span className="text-gray-600 flex items-center gap-1.5" style={{ fontSize: "12px" }}><Trophy className="w-3.5 h-3.5 text-purple-500" /> Kỷ lục chuỗi</span>
          <span className="text-purple-600" style={{ fontSize: "13px", fontWeight: 600 }}>{longestStreak} ngày</span>
        </div>
      </div>
    </div>
  );
}

// ─── SVG Charts ───

function AdminStatsChart() {
  const data = [
    { month: "T10", users: 5800, courses: 120, completion: 78 },
    { month: "T11", users: 5950, courses: 128, completion: 80 },
    { month: "T12", users: 6100, courses: 135, completion: 79 },
    { month: "T1", users: 6280, courses: 142, completion: 81 },
    { month: "T2", users: 6450, courses: 148, completion: 82 },
    { month: "T3", users: 6610, courses: 156, completion: 83 },
  ];
  const W = 500, H = 160, pL = 40, pR = 10, pT = 10, pB = 24;
  const cW = W - pL - pR, cH = H - pT - pB;
  const maxU = Math.max(...data.map(d => d.users));

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {[0, 0.5, 1].map(t => (
        <g key={t}>
          <line x1={pL} y1={pT + cH * (1 - t)} x2={W - pR} y2={pT + cH * (1 - t)} stroke="#f0f0f0" />
          <text x={pL - 4} y={pT + cH * (1 - t) + 4} textAnchor="end" fill="#d1d5db" style={{ fontSize: "8px" }}>{Math.round(maxU * t)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = pL + (i / (data.length - 1)) * cW;
        const y = pT + cH - (d.users / maxU) * cH;
        const bw = 24;
        return (
          <g key={d.month}>
            <rect x={x - bw / 2} y={y} width={bw} height={pT + cH - y} rx="3" fill="#990803" opacity="0.15" />
            <rect x={x - bw / 2} y={y} width={bw} height={pT + cH - y} rx="3" fill="url(#adminGrad)" />
            <circle cx={x} cy={y} r="3" fill="#990803" />
            <text x={x} y={H - 4} textAnchor="middle" fill="#d1d5db" style={{ fontSize: "9px" }}>{d.month}</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#990803" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#990803" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TeachingPerformanceChart({ courses }: { courses: { name: string; students: number; rating: number; completion: number }[] }) {
  const W = 500, H = 120, pL = 120, pR = 30;
  const barH = 24, gap = 12;
  const maxStudents = Math.max(...courses.map(c => c.students));

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {courses.map((c, i) => {
        const y = i * (barH + gap);
        const barW = (c.students / maxStudents) * (W - pL - pR);
        return (
          <g key={c.name}>
            <text x={pL - 8} y={y + barH / 2 + 1} textAnchor="end" dominantBaseline="central" fill="#6b7280" style={{ fontSize: "10px" }}>
              {c.name.length > 18 ? c.name.slice(0, 18) + "..." : c.name}
            </text>
            <rect x={pL} y={y + 2} width={W - pL - pR} height={barH - 4} rx="4" fill="#f3f4f6" />
            <rect x={pL} y={y + 2} width={barW} height={barH - 4} rx="4" fill="#990803" opacity="0.8" />
            <text x={pL + barW + 6} y={y + barH / 2 + 1} dominantBaseline="central" fill="#6b7280" style={{ fontSize: "9px" }}>
              {c.students} HV • ⭐{c.rating} • {c.completion}% HT
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LevelBadge({ level, name }: { level: number; name: string }) {
  const s = 60, cx = 30, cy = 30, r = 24, sw = 5;
  const circ = 2 * Math.PI * r;
  const fill = (60 / 100) * circ;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth={sw} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#990803" strokeWidth={sw}
        strokeDasharray={`${fill} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
      <text x={cx} y={cy - 2} textAnchor="middle" fill="#990803" style={{ fontSize: "18px", fontWeight: 700 }}>{level}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "7px" }}>LEVEL</text>
    </svg>
  );
}

function SkillsRadar({ skills }: { skills: { name: string; level: number }[] }) {
  const cx = 150, cy = 120, R = 90;
  const n = skills.length;
  const angles = skills.map((_, i) => (Math.PI * 2 * i) / n - Math.PI / 2);

  const rings = [25, 50, 75, 100];
  const pts = skills.map((s, i) => ({
    x: cx + (s.level / 100) * R * Math.cos(angles[i]),
    y: cy + (s.level / 100) * R * Math.sin(angles[i]),
  }));
  const polyStr = pts.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <svg width="100%" height="240" viewBox="0 0 300 240" preserveAspectRatio="xMidYMid meet">
      {rings.map(r => {
        const rr = (r / 100) * R;
        const polyPts = angles.map(a => `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`).join(" ");
        return <polygon key={r} points={polyPts} fill="none" stroke="#f0f0f0" />;
      })}
      {angles.map((a, i) => (
        <g key={i}>
          <line x1={cx} y1={cy} x2={cx + R * Math.cos(a)} y2={cy + R * Math.sin(a)} stroke="#f0f0f0" />
          <text
            x={cx + (R + 16) * Math.cos(a)}
            y={cy + (R + 16) * Math.sin(a)}
            textAnchor="middle" dominantBaseline="central"
            fill="#6b7280" style={{ fontSize: "10px" }}
          >
            {skills[i].name}
          </text>
        </g>
      ))}
      <polygon points={polyStr} fill="#990803" fillOpacity="0.15" stroke="#990803" strokeWidth="2" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#990803" stroke="white" strokeWidth="2" />
      ))}
    </svg>
  );
}

function SystemDashboard({ stats }: { stats: typeof ADMIN_STATS }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Tổng quan Hệ thống</h3>
        <div className="space-y-2.5">
          {[
            { label: "Nhân sự mới (tháng)", value: `+${stats.newUsersMonth}`, color: "#990803" },
            { label: "Khóa học đã tạo", value: stats.coursesCreated.toString(), color: "#2563eb" },
            { label: "Báo cáo đã xuất", value: stats.reportsGenerated.toString(), color: "#16a34a" },
            { label: "Uptime", value: stats.systemUptime, color: "#c8a84e" },
            { label: "Lưu trữ", value: stats.storageUsed, color: "#7c3aed" },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-gray-500" style={{ fontSize: "12px" }}>{item.label}</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <ActivityList actions={stats.recentActions} />
    </div>
  );
}

function CourseOverview({ courses }: { courses: typeof INSTRUCTOR_STATS.topCourses }) {
  return (
    <div className="space-y-3">
      {courses.map(c => (
        <div key={c.name} className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-gray-700" style={{ fontSize: "14px", fontWeight: 600 }}>{c.name}</h4>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-[#990803]" style={{ fontSize: "18px", fontWeight: 700 }}>{c.students}</p>
              <p className="text-gray-400" style={{ fontSize: "10px" }}>Học viên</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-[#c8a84e]" style={{ fontSize: "18px", fontWeight: 700 }}>{c.rating}</p>
              <p className="text-gray-400" style={{ fontSize: "10px" }}>Đánh giá</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-[#16a34a]" style={{ fontSize: "18px", fontWeight: 700 }}>{c.completion}%</p>
              <p className="text-gray-400" style={{ fontSize: "10px" }}>Hoàn thành</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillsDetail({ skills }: { skills: typeof LEARNER_STATS.skills }) {
  return (
    <div className="space-y-3">
      {skills.map(s => (
        <div key={s.name} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>{s.name}</h4>
            <span className="text-[#990803]" style={{ fontSize: "14px", fontWeight: 700 }}>{s.level}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{
              width: `${s.level}%`,
              background: s.level >= 70 ? "linear-gradient(90deg, #16a34a, #22c55e)" :
                         s.level >= 50 ? "linear-gradient(90deg, #c8a84e, #d4b86a)" :
                         "linear-gradient(90deg, #990803, #cc1a14)"
            }} />
          </div>
          <p className="text-gray-400 mt-1" style={{ fontSize: "10px" }}>
            {s.level >= 70 ? "Thành thạo" : s.level >= 50 ? "Trung bình" : "Cần cải thiện"}
          </p>
        </div>
      ))}
    </div>
  );
}