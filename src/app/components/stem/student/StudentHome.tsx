import { Link } from "react-router";
import {
  GraduationCap, Calendar, BookOpen, ClipboardCheck, Award,
  Sparkles, ChevronRight, PlayCircle, Trophy, Bot,
} from "lucide-react";
import { scheduleEntries, lessons, stemExams, STEM_IMAGES } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { ProgramBadge } from "../ui/badges";
import { formatDateTime } from "../ui/format";

/* ================================================================ */
/*  STUDENT HOME — Trang chủ học sinh                               */
/* ================================================================ */

export function StudentHome() {
  const { user } = useAuth();

  // Fake: lấy theo class 8A
  const mySchedule = scheduleEntries.filter((s) => s.classId.endsWith("-C3")).slice(0, 8);
  const todayWeekday = new Date().getDay() || 7;
  const todaySchedule = mySchedule.filter((s) => s.weekday === todayWeekday).sort((a, b) => a.period - b.period);

  const recommendedLessons = lessons.slice(0, 4);
  const upcomingExams = stemExams.filter((e) => e.status === "upcoming" || e.status === "open").slice(0, 2);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-border" style={{
        background: "linear-gradient(135deg, #2563eb, #7c3aed)",
      }}>
        <div className="absolute inset-0 opacity-20">
          <img src={STEM_IMAGES[0]} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative p-6 text-white">
          <p style={{ fontSize: "12px", fontWeight: 500, opacity: 0.85 }}>
            Xin chào {user?.name?.split(" ").slice(-2).join(" ") || "bạn"} 👋
          </p>
          <h1 style={{ fontSize: "24px", fontWeight: 800, lineHeight: 1.3 }}>
            Sẵn sàng cho buổi học STEM hôm nay!
          </h1>
          <p className="mt-2" style={{ fontSize: "13px", opacity: 0.9, maxWidth: "600px" }}>
            {todaySchedule.length > 0
              ? `Bạn có ${todaySchedule.length} tiết STEM hôm nay. Bắt đầu từ tiết ${todaySchedule[0]?.period}.`
              : "Hôm nay không có tiết STEM. Thử ôn lại bài cũ hoặc khám phá bài giảng mới."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link to="/student/lessons"
              className="px-3 py-2 bg-white text-[#2563eb] rounded-lg flex items-center gap-1.5 hover:bg-white/90"
              style={{ fontSize: "12.5px", fontWeight: 600 }}>
              <PlayCircle className="w-4 h-4" /> Vào học ngay
            </Link>
            <Link to="/shared/ai-buddy"
              className="px-3 py-2 bg-white/15 backdrop-blur-sm text-white rounded-lg flex items-center gap-1.5 hover:bg-white/25 border border-white/30"
              style={{ fontSize: "12.5px", fontWeight: 600 }}>
              <Bot className="w-4 h-4" /> Hỏi AI-Buddy
            </Link>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={BookOpen} label="Bài đã học" value={14} color="#16a34a" subtitle="Tuần này: +3 bài" />
        <KpiCard icon={ClipboardCheck} label="Điểm STEM TB" value="8.3" color="#c8a84e" change="+0.4" trend="up" />
        <KpiCard icon={Trophy} label="Huy hiệu" value={5} color="#7c3aed" />
        <KpiCard icon={Award} label="Chứng chỉ" value={2} color="#990803" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lịch hôm nay */}
        <div className="bg-card rounded-xl border border-border lg:col-span-2">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Calendar className="w-4 h-4" /> Lịch hôm nay
            </h3>
            <Link to="/student/schedule" className="text-[#990803] flex items-center gap-1" style={{ fontSize: "12px" }}>
              Xem tuần <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {todaySchedule.length > 0 ? todaySchedule.map((s) => (
              <div key={s.id} className="p-3 flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-[#2563eb]/10 flex items-center justify-center text-[#2563eb] shrink-0" style={{ fontSize: "14px", fontWeight: 700 }}>
                  T{s.period}
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: "13px", fontWeight: 600 }}>{s.subject}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                    {s.teacherName} · {s.roomName}
                  </p>
                </div>
                <ProgramBadge code={s.programCode} size="xs" />
              </div>
            )) : (
              <div className="p-6 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
                Hôm nay không có tiết STEM. Chúc bạn một ngày tốt lành!
              </div>
            )}
          </div>
        </div>

        {/* Exams sắp tới */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
              <ClipboardCheck className="w-4 h-4" /> Kỳ thi sắp tới
            </h3>
            <Link to="/student/exams" className="text-[#990803]" style={{ fontSize: "12px" }}>
              Xem
            </Link>
          </div>
          <div className="divide-y divide-border">
            {upcomingExams.map((e) => (
              <div key={e.id} className="p-3">
                <p className="line-clamp-1" style={{ fontSize: "12.5px", fontWeight: 600 }}>{e.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {e.programCodes.map((c) => <ProgramBadge key={c} code={c} size="xs" />)}
                </div>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "11px" }}>
                  📅 {formatDateTime(e.openAt)}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                  {e.durationMinutes} phút · {e.questionCount} câu
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended lessons */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Sparkles className="w-4 h-4 text-[#c8a84e]" />
            AI-Buddy đề xuất cho bạn
          </h3>
          <Link to="/student/lessons" className="text-[#990803] flex items-center gap-1" style={{ fontSize: "12px" }}>
            Tất cả bài giảng <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {recommendedLessons.map((l) => (
            <Link key={l.id} to="/student/lessons"
              className="bg-secondary/40 rounded-lg border border-border overflow-hidden hover:shadow-md transition-all">
              <div className="h-24 bg-secondary overflow-hidden">
                <img src={l.thumbnail} alt={l.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-2.5">
                <ProgramBadge code={l.programCode} size="xs" />
                <p className="mt-1 line-clamp-2" style={{ fontSize: "12px", fontWeight: 600 }}>{l.title}</p>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10.5px" }}>
                  {l.subject} · {l.durationMinutes}p
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
