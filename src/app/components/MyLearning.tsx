import { useState } from "react";
import { Link } from "react-router";
import {
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  Star,
  PlayCircle,
  Trophy,
  Target,
  Flame,
  ChevronRight,
  BarChart3,
  Users,
  ClipboardCheck,
  MessageCircle,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { mockCourses } from "./mock-data";
import { useAuth } from "./AuthContext";

// ================================================================
// LEARNER MY-LEARNING (full personal learning hub)
// ================================================================
function LearnerMyLearning() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"in-progress" | "completed" | "mandatory">("in-progress");

  const myEnrolled = [
    { ...mockCourses[2], myProgress: 45, lastAccessed: "Hôm nay", nextLesson: "Phân tích dòng tiền", deadline: "15/03/2026" },
    { ...mockCourses[6], myProgress: 88, lastAccessed: "Hôm qua", nextLesson: "Kiểm tra cuối khóa", deadline: "20/03/2026" },
    { ...mockCourses[7], myProgress: 60, lastAccessed: "3 ngày trước", nextLesson: "Kỹ năng đàm phán", deadline: "30/03/2026" },
    { ...mockCourses[1], myProgress: 100, lastAccessed: "2 tuần trước", nextLesson: "", deadline: "" },
    { ...mockCourses[5], myProgress: 100, lastAccessed: "1 tháng trước", nextLesson: "", deadline: "" },
  ];

  const myStats = {
    totalCourses: 5,
    completedCourses: 2,
    inProgress: 3,
    totalHours: 150,
    certificates: 5,
    streak: 7,
    mandatory: { total: 3, completed: 1 },
  };

  const weeklyGoal = { target: 10, achieved: 7.5 };

  const recentActivities = [
    { action: "Hoàn thành bài học", detail: "Luật Doanh nghiệp 2024 - Tuân thủ PL", time: "2 giờ trước", type: "complete" },
    { action: "Nộp bài kiểm tra", detail: "Phân tích dòng tiền FCF - 60 điểm", time: "Hôm qua", type: "quiz" },
    { action: "Bắt đầu bài mới", detail: "Kỹ năng Teamwork & Giao tiếp", time: "3 ngày trước", type: "start" },
    { action: "Đạt chứng chỉ", detail: "An toàn Lao động cơ bản", time: "1 tuần trước", type: "cert" },
    { action: "Xem video", detail: "Giao tiếp hiệu quả trong team", time: "1 tuần trước", type: "start" },
  ];

  const inProgress = myEnrolled.filter((c) => c.myProgress < 100);
  const completed = myEnrolled.filter((c) => c.myProgress === 100);
  const mandatory = myEnrolled.filter((c) => c.mandatory);

  const streakData = Array.from({ length: 28 }, (_, i) => {
    const active = i >= 21 || (i >= 14 && i < 21 && Math.random() > 0.3) || Math.random() > 0.5;
    return { active, hours: active ? 0.5 + Math.random() * 2 : 0 };
  });

  const currentList = activeTab === "in-progress" ? inProgress : activeTab === "completed" ? completed : mandatory;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground">Học tập của tôi</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
          Xin chào <span style={{ fontWeight: 500 }}>{user?.name}</span> — {user?.department}, {user?.subsidiary}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Đang học", value: myStats.inProgress, icon: PlayCircle, color: "#990803" },
          { label: "Hoàn thành", value: myStats.completedCourses, icon: Trophy, color: "#27ae60" },
          { label: "Bắt buộc", value: `${myStats.mandatory.completed}/${myStats.mandatory.total}`, icon: AlertTriangle, color: "#e74c3c" },
          { label: "Giờ học", value: myStats.totalHours, icon: Clock, color: "#c8a84e" },
          { label: "Chứng chỉ", value: myStats.certificates, icon: Award, color: "#8e44ad" },
          { label: "Streak", value: `${myStats.streak} ngày`, icon: Flame, color: "#e74c3c" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center hover:shadow-md transition-shadow">
            <stat.icon className="w-5 h-5 mx-auto" style={{ color: stat.color }} />
            <p className="text-foreground mt-2" style={{ fontSize: "22px", fontWeight: 700 }}>{stat.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Continue Learning Banner */}
      {inProgress.length > 0 && (
        <Link
          to={`/courses/${inProgress[0].id}`}
          className="block bg-gradient-to-r from-[#990803] to-[#b82020] rounded-xl p-5 text-white hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0">
              <img src={inProgress[0].thumbnail} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <PlayCircle className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/60" style={{ fontSize: "11px", fontWeight: 500 }}>TIẾP TỤC HỌC</p>
              <p className="text-white truncate mt-0.5" style={{ fontSize: "15px", fontWeight: 500 }}>{inProgress[0].title}</p>
              <p className="text-white/60 mt-0.5" style={{ fontSize: "12px" }}>
                Bài tiếp theo: {inProgress[0].nextLesson} • {inProgress[0].myProgress}% hoàn thành
                {inProgress[0].deadline && ` • Hạn: ${inProgress[0].deadline}`}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            {[
              { id: "in-progress" as const, label: `Đang học (${inProgress.length})` },
              { id: "mandatory" as const, label: `Bắt buộc (${mandatory.length})` },
              { id: "completed" as const, label: `Hoàn thành (${completed.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                className={`flex-1 py-2 rounded-md transition-colors cursor-pointer ${
                  activeTab === tab.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontSize: "13px", fontWeight: 500 }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {currentList.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="bg-card rounded-xl border border-border p-4 flex gap-4 hover:shadow-md transition-all group"
              >
                <div className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  {course.myProgress < 100 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </div>
                  )}
                  {course.myProgress === 100 && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 500 }}>{course.category}</span>
                    {course.mandatory && (
                      <span className="px-1.5 py-0.5 bg-red-50 text-red-500 rounded" style={{ fontSize: "10px", fontWeight: 500 }}>Bắt buộc</span>
                    )}
                  </div>
                  <h4 className="mt-0.5 text-foreground truncate group-hover:text-[#990803]">{course.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-muted-foreground" style={{ fontSize: "12px" }}>
                    <span>{course.instructor}</span>
                    <span>•</span>
                    <span><Calendar className="w-3 h-3 inline mr-0.5" />{course.lastAccessed}</span>
                    {course.deadline && (
                      <>
                        <span>•</span>
                        <span className="text-red-500">Hạn: {course.deadline}</span>
                      </>
                    )}
                  </div>
                  {course.myProgress < 100 && course.nextLesson && (
                    <p className="text-muted-foreground mt-1" style={{ fontSize: "11px" }}>
                      Tiếp: <span style={{ fontWeight: 500 }}>{course.nextLesson}</span>
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${course.myProgress === 100 ? "bg-green-500" : "bg-[#990803]"}`}
                        style={{ width: `${course.myProgress}%` }}
                      />
                    </div>
                    <span className={course.myProgress === 100 ? "text-green-600" : "text-muted-foreground"} style={{ fontSize: "12px", fontWeight: 600 }}>
                      {course.myProgress}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {currentList.length === 0 && (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <Trophy className="w-10 h-10 text-muted-foreground mx-auto" />
                <p className="mt-2" style={{ fontSize: "14px", fontWeight: 500 }}>
                  {activeTab === "completed" ? "Chưa có khóa học hoàn thành" : "Không có khóa học nào"}
                </p>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
                  <Link to="/courses" className="text-[#990803] hover:underline">Khám phá khóa học →</Link>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Weekly Goal */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-foreground">Mục tiêu Tuần</h4>
              <Target className="w-5 h-5 text-[#c8a84e]" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-foreground" style={{ fontSize: "32px", fontWeight: 700 }}>{weeklyGoal.achieved}</span>
              <span className="text-muted-foreground pb-1" style={{ fontSize: "14px" }}>/ {weeklyGoal.target} giờ</span>
            </div>
            <div className="mt-3 h-3 bg-secondary rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#990803] to-[#c8a84e]" style={{ width: `${(weeklyGoal.achieved / weeklyGoal.target) * 100}%` }} />
            </div>
            <p className="text-muted-foreground mt-2" style={{ fontSize: "12px" }}>
              Còn {(weeklyGoal.target - weeklyGoal.achieved).toFixed(1)} giờ để đạt mục tiêu tuần này
            </p>
          </div>

          {/* Streak Calendar */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-foreground">Chuỗi Học tập</h4>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-[#e74c3c]" />
                <span className="text-[#e74c3c]" style={{ fontSize: "14px", fontWeight: 700 }}>{myStats.streak}</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
                <div key={d} className="text-center text-muted-foreground" style={{ fontSize: "10px" }}>{d}</div>
              ))}
              {streakData.map((d, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-sm"
                  style={{ backgroundColor: d.active ? `rgba(153,8,3,${0.3 + d.hours * 0.2})` : "#f0f0f0" }}
                  title={d.active ? `${d.hours.toFixed(1)} giờ` : "Không hoạt động"}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Ít</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-secondary" />
                <div className="w-3 h-3 rounded-sm bg-[#990803]/40" />
                <div className="w-3 h-3 rounded-sm bg-[#990803]" />
              </div>
              <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Nhiều</span>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="text-foreground mb-4">Hoạt động Gần đây</h4>
            <div className="space-y-4">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    activity.type === "complete" ? "bg-green-100" :
                    activity.type === "quiz" ? "bg-blue-100" :
                    activity.type === "cert" ? "bg-purple-100" : "bg-yellow-100"
                  }`}>
                    {activity.type === "complete" ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> :
                     activity.type === "quiz" ? <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" /> :
                     activity.type === "cert" ? <Award className="w-3.5 h-3.5 text-purple-600" /> :
                     <PlayCircle className="w-3.5 h-3.5 text-yellow-600" />}
                  </div>
                  <div className="min-w-0">
                    <p style={{ fontSize: "13px", fontWeight: 500 }}>{activity.action}</p>
                    <p className="text-muted-foreground truncate" style={{ fontSize: "12px" }}>{activity.detail}</p>
                    <p className="text-muted-foreground/60 mt-0.5" style={{ fontSize: "11px" }}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended */}
          <div className="bg-gradient-to-br from-[#990803] to-[#b82020] rounded-xl p-5 text-white">
            <h4 style={{ fontSize: "15px", fontWeight: 600 }}>Gợi ý cho bạn</h4>
            <p className="text-white/60 mt-1" style={{ fontSize: "12px" }}>Dựa trên lộ trình phát triển của bạn</p>
            <div className="mt-4 space-y-2">
              {["AI trong Quản trị DN", "Design Thinking", "Data-Driven Decision Making"].map(name => (
                <Link key={name} to="/courses" className="flex items-center gap-2 p-2.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <BookOpen className="w-4 h-4 text-[#c8a84e]" />
                  <span style={{ fontSize: "12px" }}>{name}</span>
                  <ChevronRight className="w-3 h-3 ml-auto text-white/40" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// INSTRUCTOR MY-LEARNING (personal learning + teaching overview)
// ================================================================
function InstructorMyLearning() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"learning" | "teaching">("teaching");

  const myTeachingCourses = [
    { id: "C004", title: "Marketing số & Truyền thông Thương hiệu", students: 312, completion: 71, rating: 4.5, pendingGrades: 8, thumbnail: mockCourses[3]?.thumbnail },
    { id: "IC01", title: "SEO Nâng cao cho Bất động sản", students: 85, completion: 62, rating: 4.3, pendingGrades: 3, thumbnail: mockCourses[2]?.thumbnail },
    { id: "IC02", title: "Content Marketing B2B", students: 128, completion: 78, rating: 4.7, pendingGrades: 5, thumbnail: mockCourses[4]?.thumbnail },
  ];

  const myLearningCourses = [
    { ...mockCourses[0], myProgress: 72, lastAccessed: "Hôm qua", nextLesson: "Giao tiếp chiến lược" },
    { ...mockCourses[6], myProgress: 90, lastAccessed: "3 ngày trước", nextLesson: "Kiểm tra cuối khóa" },
  ];

  const teachingStats = {
    totalStudents: 525,
    avgCompletion: 70.3,
    avgRating: 4.5,
    pendingGrades: 16,
    questionsToAnswer: 5,
    upcomingClasses: 2,
  };

  const personalStats = {
    completedCourses: 28,
    totalHours: 220,
    certificates: 7,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground">Học tập & Giảng dạy</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
          <span style={{ fontWeight: 500 }}>{user?.name}</span> — {user?.position}, {user?.subsidiary}
        </p>
      </div>

      {/* Dual stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Học viên", value: teachingStats.totalStudents, icon: Users, color: "#990803" },
          { label: "HT trung bình", value: `${teachingStats.avgCompletion}%`, icon: TrendingUp, color: "#27ae60" },
          { label: "Đánh giá TB", value: teachingStats.avgRating, icon: Star, color: "#c8a84e" },
          { label: "Chờ chấm", value: teachingStats.pendingGrades, icon: ClipboardCheck, color: "#e74c3c" },
          { label: "Khóa hoàn thành", value: personalStats.completedCourses, icon: Trophy, color: "#2e86de" },
          { label: "Chứng chỉ", value: personalStats.certificates, icon: Award, color: "#8e44ad" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center hover:shadow-md transition-shadow">
            <stat.icon className="w-5 h-5 mx-auto" style={{ color: stat.color }} />
            <p className="text-foreground mt-2" style={{ fontSize: "22px", fontWeight: 700 }}>{stat.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1">
        <button
          className={`flex-1 py-2 rounded-md transition-colors cursor-pointer ${activeTab === "teaching" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          style={{ fontSize: "13px", fontWeight: 500 }}
          onClick={() => setActiveTab("teaching")}
        >
          Giảng dạy ({myTeachingCourses.length} khóa)
        </button>
        <button
          className={`flex-1 py-2 rounded-md transition-colors cursor-pointer ${activeTab === "learning" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          style={{ fontSize: "13px", fontWeight: 500 }}
          onClick={() => setActiveTab("learning")}
        >
          Học tập cá nhân ({myLearningCourses.length} khóa)
        </button>
      </div>

      {activeTab === "teaching" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {myTeachingCourses.map(course => (
              <div key={course.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <img src={course.thumbnail} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-foreground truncate">{course.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-muted-foreground" style={{ fontSize: "12px" }}>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.students} HV</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" /> {course.rating}</span>
                      <span>{course.completion}% hoàn thành</span>
                    </div>
                  </div>
                  {course.pendingGrades > 0 && (
                    <span className="px-3 py-1.5 bg-[#990803]/10 text-[#990803] rounded-lg shrink-0" style={{ fontSize: "12px", fontWeight: 600 }}>
                      {course.pendingGrades} bài chờ chấm
                    </span>
                  )}
                </div>
                <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#990803]" style={{ width: `${course.completion}%` }} />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Link to={`/courses/${course.id}`} className="px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors" style={{ fontSize: "12px" }}>
                    Quản lý khóa học
                  </Link>
                  <Link to="/quizzes" className="px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors" style={{ fontSize: "12px" }}>
                    Bài kiểm tra
                  </Link>
                  <Link to="/forum" className="px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors" style={{ fontSize: "12px" }}>
                    Diễn đàn
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Right sidebar: teaching alerts */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h4 className="text-foreground mb-3">Cần xử lý</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <ClipboardCheck className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500 }}>{teachingStats.pendingGrades} bài nộp chờ chấm</p>
                    <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>4 bài đã quá hạn 48h</p>
                    <Link to="/quizzes" className="text-[#990803] mt-1 inline-block hover:underline" style={{ fontSize: "11px", fontWeight: 500 }}>Chấm ngay →</Link>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <MessageCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500 }}>{teachingStats.questionsToAnswer} câu hỏi mới</p>
                    <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>Từ học viên trên diễn đàn</p>
                    <Link to="/forum" className="text-[#2e86de] mt-1 inline-block hover:underline" style={{ fontSize: "11px", fontWeight: 500 }}>Trả lời →</Link>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500 }}>{teachingStats.upcomingClasses} lớp sắp tới</p>
                    <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>Marketing số - Buổi 8, ngày mai</p>
                    <Link to="/calendar" className="text-[#27ae60] mt-1 inline-block hover:underline" style={{ fontSize: "11px", fontWeight: 500 }}>Xem lịch →</Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h4 className="text-foreground mb-3">Thống kê nhanh</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground" style={{ fontSize: "12px" }}>HV mới tuần này</span>
                  <span className="text-green-600" style={{ fontSize: "13px", fontWeight: 600 }}>+42</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Bài nộp tuần này</span>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>28</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Điểm TB tuần này</span>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>78.5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Tỷ lệ bỏ học</span>
                  <span className="text-green-600" style={{ fontSize: "13px", fontWeight: 600 }}>-1.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {myLearningCourses.map(course => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="bg-card rounded-xl border border-border p-4 flex gap-4 hover:shadow-md transition-all group"
              >
                <div className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0">
                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 500 }}>{course.category}</span>
                  <h4 className="mt-0.5 text-foreground truncate group-hover:text-[#990803]">{course.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-muted-foreground" style={{ fontSize: "12px" }}>
                    <span>{course.instructor}</span>
                    <span>•</span>
                    <span>{course.lastAccessed}</span>
                  </div>
                  <p className="text-muted-foreground mt-1" style={{ fontSize: "11px" }}>Tiếp: <span style={{ fontWeight: 500 }}>{course.nextLesson}</span></p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#990803]" style={{ width: `${course.myProgress}%` }} />
                    </div>
                    <span className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{course.myProgress}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h4 className="text-foreground mb-3">Học tập cá nhân</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Khóa đã hoàn thành</span>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>{personalStats.completedCourses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Tổng giờ học</span>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>{personalStats.totalHours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Chứng chỉ</span>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>{personalStats.certificates}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================
// ADMIN MY-LEARNING (personal development)
// ================================================================
function AdminMyLearning() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"in-progress" | "completed">("in-progress");

  const myEnrolled = [
    { ...mockCourses[0], myProgress: 67, lastAccessed: "Hôm nay", nextLesson: "Bài tập tình huống #1" },
    { ...mockCourses[4], myProgress: 30, lastAccessed: "3 ngày trước", nextLesson: "Sprint Planning" },
    { ...mockCourses[7], myProgress: 100, lastAccessed: "2 tuần trước", nextLesson: "" },
    { ...mockCourses[6], myProgress: 100, lastAccessed: "1 tháng trước", nextLesson: "" },
  ];

  const myStats = { totalCourses: 42, completedCourses: 35, inProgress: 2, totalHours: 380, certificates: 12, streak: 14 };
  const weeklyGoal = { target: 5, achieved: 3.5 };
  const inProgress = myEnrolled.filter(c => c.myProgress < 100);
  const completed = myEnrolled.filter(c => c.myProgress === 100);
  const currentList = activeTab === "in-progress" ? inProgress : completed;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground">Phát triển Cá nhân</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
          <span style={{ fontWeight: 500 }}>{user?.name}</span> — {user?.position}, {user?.subsidiary}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Tổng khóa học", value: myStats.totalCourses, icon: BookOpen, color: "#990803" },
          { label: "Đã hoàn thành", value: myStats.completedCourses, icon: Trophy, color: "#27ae60" },
          { label: "Đang học", value: myStats.inProgress, icon: PlayCircle, color: "#2e86de" },
          { label: "Giờ học", value: myStats.totalHours, icon: Clock, color: "#c8a84e" },
          { label: "Chứng chỉ", value: myStats.certificates, icon: Award, color: "#8e44ad" },
          { label: "Streak", value: `${myStats.streak} ngày`, icon: Flame, color: "#e74c3c" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center hover:shadow-md transition-shadow">
            <stat.icon className="w-5 h-5 mx-auto" style={{ color: stat.color }} />
            <p className="text-foreground mt-2" style={{ fontSize: "22px", fontWeight: 700 }}>{stat.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {inProgress.length > 0 && (
        <Link to={`/courses/${inProgress[0].id}`} className="block bg-gradient-to-r from-[#990803] to-[#b82020] rounded-xl p-5 text-white hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0">
              <img src={inProgress[0].thumbnail} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <PlayCircle className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/60" style={{ fontSize: "11px", fontWeight: 500 }}>TIẾP TỤC HỌC</p>
              <p className="text-white truncate mt-0.5" style={{ fontSize: "15px", fontWeight: 500 }}>{inProgress[0].title}</p>
              <p className="text-white/60 mt-0.5" style={{ fontSize: "12px" }}>Tiếp: {inProgress[0].nextLesson} • {inProgress[0].myProgress}%</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <button className={`flex-1 py-2 rounded-md transition-colors cursor-pointer ${activeTab === "in-progress" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`} style={{ fontSize: "13px", fontWeight: 500 }} onClick={() => setActiveTab("in-progress")}>Đang học ({inProgress.length})</button>
            <button className={`flex-1 py-2 rounded-md transition-colors cursor-pointer ${activeTab === "completed" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`} style={{ fontSize: "13px", fontWeight: 500 }} onClick={() => setActiveTab("completed")}>Đã hoàn thành ({completed.length})</button>
          </div>
          <div className="space-y-3">
            {currentList.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`} className="bg-card rounded-xl border border-border p-4 flex gap-4 hover:shadow-md transition-all group">
                <div className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0">
                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                  {course.myProgress === 100 ? (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center"><Trophy className="w-6 h-6 text-white drop-shadow-md" /></div>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><PlayCircle className="w-8 h-8 text-white" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 500 }}>{course.category}</span>
                  <h4 className="mt-0.5 text-foreground truncate group-hover:text-[#990803]">{course.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-muted-foreground" style={{ fontSize: "12px" }}>
                    <span>{course.instructor}</span><span>•</span><span>{course.lastAccessed}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${course.myProgress === 100 ? "bg-green-500" : "bg-[#990803]"}`} style={{ width: `${course.myProgress}%` }} />
                    </div>
                    <span className={course.myProgress === 100 ? "text-green-600" : "text-muted-foreground"} style={{ fontSize: "12px", fontWeight: 600 }}>{course.myProgress}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-foreground">Mục tiêu Tuần</h4>
              <Target className="w-5 h-5 text-[#c8a84e]" />
            </div>
            <div className="flex items-end gap-3">
              <span className="text-foreground" style={{ fontSize: "32px", fontWeight: 700 }}>{weeklyGoal.achieved}</span>
              <span className="text-muted-foreground pb-1" style={{ fontSize: "14px" }}>/ {weeklyGoal.target} giờ</span>
            </div>
            <div className="mt-3 h-3 bg-secondary rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#990803] to-[#c8a84e]" style={{ width: `${(weeklyGoal.achieved / weeklyGoal.target) * 100}%` }} />
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#990803] to-[#b82020] rounded-xl p-5 text-white">
            <h4 style={{ fontSize: "15px", fontWeight: 600 }}>Phát triển lãnh đạo</h4>
            <p className="text-white/60 mt-1" style={{ fontSize: "12px" }}>Khóa học gợi ý cho cấp quản lý</p>
            <div className="mt-4 space-y-2">
              {["Chiến lược Doanh nghiệp 2026", "Digital Transformation Leader", "ESG & Phát triển Bền vững"].map(name => (
                <Link key={name} to="/courses" className="flex items-center gap-2 p-2.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <BookOpen className="w-4 h-4 text-[#c8a84e]" /><span style={{ fontSize: "12px" }}>{name}</span>
                  <ChevronRight className="w-3 h-3 ml-auto text-white/40" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// MAIN EXPORT
// ================================================================
export function MyLearning() {
  const { user } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case "admin": return <AdminMyLearning />;
    case "instructor": return <InstructorMyLearning />;
    case "learner": return <LearnerMyLearning />;
    default: return <LearnerMyLearning />;
  }
}
