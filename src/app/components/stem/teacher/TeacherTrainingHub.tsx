import { useState } from "react";
import {
  Award, PlayCircle, FileText, Download, CheckCircle2,
  Clock, TrendingUp, BookOpen,
} from "lucide-react";
import { STEM_PROGRAMS, STEM_IMAGES } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "sonner";

/* ================================================================ */
/*  TEACHER TRAINING HUB — kho tập huấn + đồng hành 5 năm            */
/* ================================================================ */

interface TrainingModule {
  id: string;
  title: string;
  program: StemProgram;
  year: number;         // Năm 1-5 trong chương trình đồng hành
  type: "video" | "workshop" | "document" | "exam";
  durationMinutes: number;
  progress: number;     // 0-100
  completed: boolean;
  thumbnail: string;
  description: string;
}

function buildModules(): TrainingModule[] {
  const modules: TrainingModule[] = [];
  const types: TrainingModule["type"][] = ["video", "workshop", "document", "exam"];
  const programs: StemProgram[] = ["CT1", "CT2", "CT3", "CT4", "CT5"];
  let idx = 1;
  for (let year = 1; year <= 5; year++) {
    for (let i = 0; i < 3; i++) {
      const program = programs[(year + i) % 5];
      const type = types[idx % types.length];
      const completed = year <= 2 || (year === 3 && i === 0);
      modules.push({
        id: `TM-${idx}`,
        title: `Năm ${year} · Module ${i + 1}: ${STEM_PROGRAMS[program].shortName} — Bài học chuyên sâu`,
        program, year, type,
        durationMinutes: 45 + (idx * 15) % 60,
        progress: completed ? 100 : year === 3 ? 60 : 0,
        completed,
        thumbnail: STEM_IMAGES[idx % STEM_IMAGES.length],
        description: `Hướng dẫn giảng dạy ${STEM_PROGRAMS[program].shortName} cho năm ${year} — tài liệu kèm bài tập thực hành.`,
      });
      idx++;
    }
  }
  return modules;
}

const TYPE_META: Record<TrainingModule["type"], { label: string; icon: typeof PlayCircle; color: string }> = {
  video:    { label: "Video",    icon: PlayCircle, color: "#dc2626" },
  workshop: { label: "Workshop", icon: Award,      color: "#7c3aed" },
  document: { label: "Tài liệu", icon: FileText,   color: "#c8a84e" },
  exam:     { label: "Kiểm tra", icon: CheckCircle2, color: "#16a34a" },
};

export function TeacherTrainingHub() {
  const [modules] = useState(buildModules());
  const [yearFilter, setYearFilter] = useState<number | "all">("all");

  const filtered = yearFilter === "all" ? modules : modules.filter((m) => m.year === yearFilter);

  const completedCount = modules.filter((m) => m.completed).length;
  const progressPct = Math.round((completedCount / modules.length) * 100);
  const currentYear = 3;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Award}
        title="Tập huấn STEM — Đồng hành 5 năm"
        subtitle="Kho tài liệu, video, workshop và bài kiểm tra cho giáo viên STEM theo chương trình 5 năm."
        accentColor="#c8a84e"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Award} label="Module đã hoàn tất" value={`${completedCount}/${modules.length}`} color="#16a34a" subtitle={`${progressPct}% chương trình`} />
        <KpiCard icon={TrendingUp} label="Năm hiện tại" value={`Năm ${currentYear}`} color="#c8a84e" subtitle="Chương trình đồng hành" />
        <KpiCard icon={CheckCircle2} label="Chứng chỉ đã đạt" value={2} color="#7c3aed" />
        <KpiCard icon={Clock} label="Tổng thời lượng" value={`${modules.reduce((s, m) => s + m.durationMinutes, 0)} phút`} color="#0891b2" />
      </div>

      {/* Year progress bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          Tiến độ đồng hành 5 năm
        </h3>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((y) => {
            const yearModules = modules.filter((m) => m.year === y);
            const yearDone = yearModules.filter((m) => m.completed).length;
            const pct = Math.round((yearDone / yearModules.length) * 100);
            return (
              <div key={y} className="flex-1 relative">
                <div className="h-10 bg-secondary rounded-lg overflow-hidden">
                  <div className="h-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct === 100 ? "#16a34a" : pct > 0 ? "#c8a84e" : "transparent",
                    }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{ fontSize: "12px", fontWeight: 700 }}>Năm {y}</span>
                  <span className="ml-2 text-muted-foreground" style={{ fontSize: "11px" }}>
                    {yearDone}/{yearModules.length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Year filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setYearFilter("all")}
          className={`px-3 py-2 rounded-lg border ${
            yearFilter === "all" ? "bg-[#c8a84e] text-white border-[#c8a84e]" : "bg-card border-border hover:bg-secondary"
          }`} style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả ({modules.length})
        </button>
        {[1, 2, 3, 4, 5].map((y) => (
          <button key={y} onClick={() => setYearFilter(y)}
            className={`px-3 py-2 rounded-lg border ${
              yearFilter === y ? "bg-[#c8a84e] text-white border-[#c8a84e]" : "bg-card border-border hover:bg-secondary"
            }`} style={{ fontSize: "12px", fontWeight: 500 }}>
            Năm {y}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((m) => {
          const TypeIcon = TYPE_META[m.type].icon;
          return (
            <div key={m.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all">
              <div className="h-28 relative" style={{ background: `linear-gradient(135deg, ${TYPE_META[m.type].color}22, ${TYPE_META[m.type].color}08)` }}>
                {m.thumbnail && <img src={m.thumbnail} alt={m.title} className="w-full h-full object-cover opacity-70" />}
                <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-white/90 text-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>
                    Năm {m.year}
                  </span>
                  <ProgramBadge code={m.program} size="xs" />
                </div>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-white inline-flex items-center gap-1" style={{
                  fontSize: "10px", fontWeight: 600,
                  backgroundColor: TYPE_META[m.type].color,
                }}>
                  <TypeIcon className="w-3 h-3" /> {TYPE_META[m.type].label}
                </span>
                {m.completed && (
                  <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-[#16a34a] flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-foreground line-clamp-2" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {m.title}
                </h3>
                <p className="text-muted-foreground mt-1 line-clamp-2" style={{ fontSize: "11.5px" }}>
                  {m.description}
                </p>
                <div className="mt-2 flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}>
                  <Clock className="w-3 h-3" /> {m.durationMinutes} phút
                </div>
                {!m.completed && m.progress > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Tiến độ</span>
                      <span style={{ fontSize: "10.5px", fontWeight: 600 }}>{m.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-[#c8a84e]" style={{ width: `${m.progress}%` }} />
                    </div>
                  </div>
                )}
                <button
                  onClick={() => toast.info(`Mở module ${m.title}`)}
                  className="mt-3 w-full px-3 py-2 bg-[#c8a84e] text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-1.5"
                  style={{ fontSize: "12px", fontWeight: 500 }}
                >
                  {m.completed ? <><BookOpen className="w-3.5 h-3.5" /> Ôn lại</>
                    : m.progress > 0 ? <><PlayCircle className="w-3.5 h-3.5" /> Tiếp tục</>
                    : <><Download className="w-3.5 h-3.5" /> Bắt đầu</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TeacherTrainingHub;
