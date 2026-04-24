import { useState } from "react";
import {
  BookOpen, Search, PlayCircle, CheckCircle2, Clock,
  Filter, Bookmark,
} from "lucide-react";
import { lessons, STEM_PROGRAMS } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "sonner";

/* ================================================================ */
/*  STUDENT LESSON PLAYER — danh sách bài + player modal            */
/* ================================================================ */

export function StudentLessonPlayer() {
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<StemProgram | "all">("all");
  const [playingLesson, setPlayingLesson] = useState<string | null>(null);

  // Mock: học sinh đã hoàn tất 5 bài đầu
  const completedIds = new Set(lessons.slice(0, 5).map((l) => l.id));
  const bookmarkedIds = new Set(lessons.slice(3, 7).map((l) => l.id));

  const filtered = lessons.filter((l) => {
    if (programFilter !== "all" && l.programCode !== programFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!l.title.toLowerCase().includes(s) && !l.subject.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <PageHeader
        icon={BookOpen}
        title="Bài giảng STEM"
        subtitle="Truy cập và học các bài giảng STEM đã được phân bổ. Tương tác, làm bài tập và theo dõi tiến độ."
        accentColor="#2563eb"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={BookOpen} label="Tổng bài giảng" value={lessons.length} color="#2563eb" />
        <KpiCard icon={CheckCircle2} label="Đã hoàn thành" value={completedIds.size} color="#16a34a" />
        <KpiCard icon={Bookmark} label="Đã bookmark" value={bookmarkedIds.size} color="#c8a84e" />
        <KpiCard icon={Clock} label="Tổng thời lượng" value={`${lessons.reduce((s, l) => s + l.durationMinutes, 0)}p`} color="#7c3aed" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm bài giảng..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }} />
        </div>
        <button onClick={() => setProgramFilter("all")}
          className={`px-3 py-2 rounded-lg border ${programFilter === "all" ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-card border-border hover:bg-secondary"}`}
          style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả
        </button>
        {(Object.keys(STEM_PROGRAMS) as StemProgram[]).map((code) => {
          const p = STEM_PROGRAMS[code];
          const active = programFilter === code;
          return (
            <button key={code} onClick={() => setProgramFilter(code)}
              className={`px-3 py-2 rounded-lg border ${active ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"}`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(active ? { backgroundColor: p.color } : {}),
              }}>
              {code}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((l) => {
          const done = completedIds.has(l.id);
          const bookmarked = bookmarkedIds.has(l.id);
          return (
            <div key={l.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all">
              <div className="h-36 bg-secondary overflow-hidden relative cursor-pointer"
                onClick={() => setPlayingLesson(l.id)}>
                <img src={l.thumbnail} alt={l.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <ProgramBadge code={l.programCode} size="md" />
                </div>
                {done && (
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#16a34a] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-foreground line-clamp-2" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {l.title}
                </h3>
                <p className="text-muted-foreground mt-1 line-clamp-2" style={{ fontSize: "11.5px" }}>
                  {l.description}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "11px" }}>
                    <Clock className="w-3 h-3" />
                    {l.durationMinutes}p · {l.subject}
                  </div>
                  <button
                    onClick={() => toast.success(bookmarked ? "Bỏ lưu" : "Đã lưu bài giảng")}
                    className="p-1 hover:bg-secondary rounded"
                    title="Bookmark"
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-[#c8a84e] text-[#c8a84e]" : "text-muted-foreground"}`} />
                  </button>
                </div>
                <button
                  onClick={() => setPlayingLesson(l.id)}
                  className="mt-3 w-full px-3 py-2 rounded-lg flex items-center justify-center gap-1.5"
                  style={{
                    fontSize: "12px", fontWeight: 500,
                    backgroundColor: done ? "#16a34a15" : "#2563eb",
                    color: done ? "#16a34a" : "white",
                  }}
                >
                  {done ? <><CheckCircle2 className="w-3.5 h-3.5" /> Đã học — Xem lại</>
                    : <><PlayCircle className="w-3.5 h-3.5" /> Bắt đầu học</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Player modal */}
      {playingLesson && (() => {
        const lesson = lessons.find((l) => l.id === playingLesson);
        if (!lesson) return null;
        return (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPlayingLesson(null)}>
            <div className="bg-card rounded-2xl border border-border w-full max-w-4xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative aspect-video bg-black rounded-t-2xl overflow-hidden">
                <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => toast.info("Bài giảng sẽ phát video thật khi tích hợp backend")}
                    className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <PlayCircle className="w-12 h-12 text-[#2563eb]" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <ProgramBadge code={lesson.programCode} size="md" showName />
                  <span className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
                    {lesson.subject} · {lesson.gradeLevel} · {lesson.durationMinutes}p
                  </span>
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: 700 }}>{lesson.title}</h2>
                <p className="text-muted-foreground mt-2" style={{ fontSize: "13px", lineHeight: 1.6 }}>
                  {lesson.description}
                </p>
                {lesson.sgkMapping && (
                  <p className="mt-2 text-[#2563eb]" style={{ fontSize: "12px" }}>
                    📖 {lesson.sgkMapping}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => { toast.success(`Đã đánh dấu hoàn thành bài ${lesson.title}`); setPlayingLesson(null); }}
                    className="flex-1 px-4 py-2 bg-[#16a34a] text-white rounded-lg hover:opacity-90"
                    style={{ fontSize: "13px", fontWeight: 500 }}>
                    <CheckCircle2 className="w-4 h-4 inline mr-1" /> Đã hoàn thành
                  </button>
                  <button onClick={() => setPlayingLesson(null)}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
                    style={{ fontSize: "13px", fontWeight: 500 }}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default StudentLessonPlayer;
