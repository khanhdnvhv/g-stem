import { Link, useNavigate } from "react-router";
import {
  LayoutDashboard, Calendar, BookOpen, PenTool, Users,
  Award, Lightbulb, Activity, ChevronRight, ClipboardCheck,
} from "lucide-react";
import { scheduleEntries, lessons, stemExams } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { ProgramBadge } from "../ui/badges";
import { formatDateTime, formatRelative } from "../ui/format";

/* ================================================================ */
/*  TEACHER DASHBOARD                                                */
/* ================================================================ */

export function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Lấy tiết cho giáo viên theo id (fallback sang teacher 01)
  const myId = user?.id || "U-TCH-01";
  const mySchedule = scheduleEntries.filter((s) => s.teacherId === myId);
  const myClasses = new Set(mySchedule.map((s) => s.classId));

  const todayWeekday = new Date().getDay() || 7;
  const todaySchedule = mySchedule.filter((s) => s.weekday === todayWeekday).sort((a, b) => a.period - b.period);

  const upcomingExams = stemExams.filter((e) => e.status === "upcoming" || e.status === "open").slice(0, 3);

  const programs = Array.from(new Set(mySchedule.map((s) => s.programCode)));

  return (
    <div className="space-y-5">
      <PageHeader
        icon={LayoutDashboard}
        title={`Xin chào, ${user?.name?.split(" ").slice(-2).join(" ") || "Giáo viên"}!`}
        subtitle={`${user?.position} · ${user?.tenantName}`}
        accentColor="#0891b2"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Calendar} label="Tiết STEM/tuần" value={mySchedule.length} color="#0891b2" />
        <KpiCard icon={Users} label="Lớp phụ trách" value={myClasses.size} color="#7c3aed" />
        <KpiCard icon={PenTool} label="Bài chấm chờ" value={5} color="#f59e0b" trend="up" onClick={() => navigate("/teacher/grading")} />
        <KpiCard icon={Award} label="Chứng chỉ đạt được" value={3} color="#c8a84e" subtitle="Còn 2 cấp độ" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lịch hôm nay */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Calendar className="w-4 h-4" />
              Lịch dạy hôm nay
            </h3>
            <Link to="/teacher/schedule" className="text-[#990803] flex items-center gap-1" style={{ fontSize: "12px" }}>
              Thời khóa biểu <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border max-h-[360px] overflow-y-auto">
            {todaySchedule.length > 0 ? todaySchedule.map((s) => (
              <div key={s.id} className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0891b2]/10 flex items-center justify-center text-[#0891b2] shrink-0" style={{ fontSize: "13px", fontWeight: 700 }}>
                  T{s.period}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "12.5px", fontWeight: 600 }}>{s.className} — {s.subject}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{s.roomName}{s.isClub && " · CLB"}</p>
                </div>
                <ProgramBadge code={s.programCode} size="xs" />
              </div>
            )) : (
              <div className="p-6 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
                Hôm nay không có tiết STEM. Nghỉ ngơi nhé.
              </div>
            )}
          </div>
        </div>

        {/* Kỳ thi sắp tới */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
              <ClipboardCheck className="w-4 h-4" />
              Kỳ thi STEM sắp tới
            </h3>
            <Link to="/teacher/exams" className="text-[#990803] flex items-center gap-1" style={{ fontSize: "12px" }}>
              Tất cả <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingExams.map((e) => (
              <div key={e.id} className="p-3">
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  <span style={{ fontSize: "12.5px", fontWeight: 600 }}>{e.name}</span>
                  {e.programCodes.map((c) => <ProgramBadge key={c} code={c} size="xs" />)}
                </div>
                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                  {e.organiser} · {e.gradeLevel}
                </p>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
                  <Activity className="w-3 h-3 inline mr-1" />
                  Mở: {formatDateTime(e.openAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chương trình đang dạy */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          <BookOpen className="w-4 h-4 inline mr-1.5" />
          Chương trình STEM bạn đang triển khai
        </h3>
        <div className="flex flex-wrap gap-2">
          {programs.length > 0 ? programs.map((p) => <ProgramBadge key={p} code={p} size="md" showName />)
            : <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Chưa được phân công.</p>}
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-gradient-to-br from-[#0891b2]/5 to-[#c8a84e]/5 rounded-xl border border-border p-4">
        <p className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Thao tác nhanh</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { to: "/teacher/lesson-plan-builder", icon: Lightbulb, label: "Soạn giáo án (AI-Buddy)" },
            { to: "/teacher/resources", icon: BookOpen, label: "Kho học liệu" },
            { to: "/teacher/equipment-check", icon: Activity, label: "Check thiết bị" },
            { to: "/teacher/training", icon: Award, label: "Tập huấn 5 năm" },
          ].map((q) => (
            <Link key={q.to} to={q.to}
              className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border hover:shadow-md"
              style={{ fontSize: "12.5px", fontWeight: 500 }}
            >
              <q.icon className="w-4 h-4 text-[#0891b2]" />
              {q.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
