import { useState, useMemo } from "react";
import {
  GraduationCap, Plus, Calendar, Users, Award, Play,
  PlayCircle, FileText, CheckCircle2, TrendingUp, Video,
  Download, BookOpen,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { STEM_PROGRAMS, STEM_IMAGES } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "sonner";

/* ================================================================ */
/*  TEACHER TRAINING PROGRAM (Supplier)                              */
/*  NCC điều phối chương trình tập huấn đồng hành 5 năm cho GV       */
/* ================================================================ */

interface TrainingCourse {
  id: string;
  year: number;
  module: number;
  title: string;
  program: StemProgram;
  type: "online" | "offline" | "hybrid";
  durationHours: number;
  enrolled: number;
  completed: number;
  nextSession: string;
  status: "upcoming" | "running" | "completed" | "archived";
}

function generateCourses(): TrainingCourse[] {
  const list: TrainingCourse[] = [];
  const programs: StemProgram[] = ["CT1", "CT2", "CT3", "CT4", "CT5"];
  const titles = [
    "Cơ bản CT1 — Tích hợp STEM vào môn học",
    "Nâng cao CT2 — Thiết kế bài liên môn",
    "CT3 Đổi mới sáng tạo — Project-based Learning",
    "CT4 Robotic Arduino cho giáo viên",
    "CT4 AI for Teacher — Teachable Machine",
    "CT5 Hướng dẫn HS làm NCKH",
    "Đánh giá học sinh theo năng lực STEM",
    "Công cụ số hỗ trợ tiết học STEM",
    "IoT trong phòng học thông minh",
    "Kỹ năng dẫn CLB STEM cho HS",
    "Tập huấn an toàn phòng Lab",
    "Phương pháp đánh giá rubric STEM",
  ];
  const types: TrainingCourse["type"][] = ["online", "offline", "hybrid"];
  const statuses: TrainingCourse["status"][] = ["running", "upcoming", "completed", "running", "archived"];
  let idx = 1;
  for (let year = 1; year <= 5; year++) {
    for (let m = 0; m < 3; m++) {
      const p = programs[(year - 1 + m) % 5];
      list.push({
        id: `TC-${String(idx).padStart(3, "0")}`,
        year, module: m + 1,
        title: titles[idx - 1] || `Module ${idx}`,
        program: p,
        type: types[idx % 3],
        durationHours: 8 + (idx * 3) % 24,
        enrolled: 120 + (idx * 47) % 600,
        completed: 80 + (idx * 31) % 450,
        nextSession: `2026-${String(4 + (idx % 3)).padStart(2, "0")}-${String(5 + (idx % 20)).padStart(2, "0")}`,
        status: statuses[idx % statuses.length],
      });
      idx++;
      if (idx > 12) break;
    }
    if (idx > 12) break;
  }
  return list;
}

const TYPE_META = {
  online:  { label: "Online",  color: "#0891b2", icon: Video },
  offline: { label: "Offline", color: "#c8a84e", icon: Users },
  hybrid:  { label: "Hybrid",  color: "#7c3aed", icon: PlayCircle },
} as const;

const STATUS_META = {
  upcoming:  { label: "Sắp mở",     color: "#0891b2" },
  running:   { label: "Đang diễn ra", color: "#16a34a" },
  completed: { label: "Hoàn tất",    color: "#64748b" },
  archived:  { label: "Lưu trữ",     color: "#94a3b8" },
} as const;

export function TeacherTrainingProgram() {
  const [courses] = useState(generateCourses());
  const [yearFilter, setYearFilter] = useState<number | "all">("all");

  const filtered = useMemo(() =>
    yearFilter === "all" ? courses : courses.filter((c) => c.year === yearFilter),
    [courses, yearFilter]
  );

  const totalEnrolled = courses.reduce((s, c) => s + c.enrolled, 0);
  const totalCompleted = courses.reduce((s, c) => s + c.completed, 0);
  const running = courses.filter((c) => c.status === "running").length;
  const completionRate = Math.round((totalCompleted / totalEnrolled) * 100);

  // By year chart
  const byYear = [1, 2, 3, 4, 5].map((y) => {
    const yearCourses = courses.filter((c) => c.year === y);
    return {
      year: `Năm ${y}`,
      enrolled: yearCourses.reduce((s, c) => s + c.enrolled, 0),
      completed: yearCourses.reduce((s, c) => s + c.completed, 0),
    };
  });

  return (
    <div className="space-y-5">
      <PageHeader
        icon={GraduationCap}
        title="Chương trình Tập huấn Giáo viên"
        subtitle="Điều phối chương trình đồng hành 5 năm — 15 module × 5 chương trình STEM cho hệ thống giáo viên toàn mạng lưới."
        accentColor="#990803"
        badge={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#c8a84e]/15 text-[#c8a84e] rounded" style={{ fontSize: "11px", fontWeight: 600 }}>
            <Award className="w-3 h-3" /> Đồng hành 5 năm
          </span>
        }
        actions={
          <>
            <button onClick={() => toast.info("Xuất báo cáo tập huấn cho Sở GD&ĐT")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Báo cáo
            </button>
            <button onClick={() => toast.success("Tạo module tập huấn mới")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Tạo module
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={BookOpen} label="Tổng module" value={courses.length} color="#990803" />
        <KpiCard icon={Users} label="GV đã đăng ký" value={totalEnrolled.toLocaleString()} color="#2563eb" change="+12%" trend="up" />
        <KpiCard icon={CheckCircle2} label="Đã hoàn thành" value={totalCompleted.toLocaleString()} color="#16a34a" subtitle={`${completionRate}% completion rate`} />
        <KpiCard icon={Play} label="Đang triển khai" value={running} color="#c8a84e" />
      </div>

      {/* 5-year progress */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          <Calendar className="w-4 h-4 inline mr-1.5" />
          Chương trình Đồng hành 5 năm
        </h3>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((y) => {
            const yearCourses = courses.filter((c) => c.year === y);
            const yearDone = yearCourses.filter((c) => c.status === "completed").length;
            const pct = yearCourses.length ? Math.round((yearDone / yearCourses.length) * 100) : 0;
            const isCurrentYear = y === 2;
            return (
              <div key={y} className="flex-1 relative">
                <div className={`h-14 rounded-lg overflow-hidden border-2 ${
                  isCurrentYear ? "border-[#c8a84e]" : "border-transparent"
                }`}
                  style={{
                    background: "linear-gradient(90deg, #16a34a " + pct + "%, #e5e7eb " + pct + "%)",
                  }}>
                  <div className="h-full flex items-center justify-center flex-col text-white">
                    <span style={{ fontSize: "13px", fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>Năm {y}</span>
                    <span style={{ fontSize: "10.5px", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                      {yearDone}/{yearCourses.length} · {pct}%
                    </span>
                  </div>
                </div>
                {isCurrentYear && (
                  <span className="absolute -top-2 -right-1 px-1.5 py-0.5 bg-[#c8a84e] text-white rounded shadow-sm" style={{ fontSize: "9px", fontWeight: 700 }}>
                    HIỆN TẠI
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Enrollment by year */}
        <div className="bg-card rounded-xl border border-border p-4 lg:col-span-2">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Đăng ký & Hoàn thành theo năm</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="enrolled" fill="#2563eb" name="Đăng ký" radius={[6, 6, 0, 0]} />
              <Bar dataKey="completed" fill="#16a34a" name="Hoàn thành" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <TrendingUp className="w-4 h-4 inline mr-1.5" /> Tóm tắt
          </h3>
          <div className="space-y-3">
            {[
              { label: "GV hoàn thành CT1-CT2", value: "82%", color: "#16a34a" },
              { label: "GV đạt chứng chỉ Robotic", value: "64%", color: "#dc2626" },
              { label: "GV dẫn dắt NCKH CT5", value: "28%", color: "#059669" },
              { label: "Hài lòng chương trình", value: "4.7★", color: "#c8a84e" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="text-muted-foreground" style={{ fontSize: "11.5px" }}>{r.label}</span>
                <strong style={{ color: r.color, fontSize: "14px" }}>{r.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Year filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>Theo năm:</span>
        <button onClick={() => setYearFilter("all")}
          className={`px-3 py-1.5 rounded-lg border ${yearFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
          style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả
        </button>
        {[1, 2, 3, 4, 5].map((y) => (
          <button key={y} onClick={() => setYearFilter(y)}
            className={`px-3 py-1.5 rounded-lg border ${yearFilter === y ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
            style={{ fontSize: "12px", fontWeight: 500 }}>
            Năm {y}
          </button>
        ))}
      </div>

      {/* Courses grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((c) => {
          const tMeta = TYPE_META[c.type];
          const sMeta = STATUS_META[c.status];
          const TIcon = tMeta.icon;
          const completion = Math.round((c.completed / c.enrolled) * 100);
          return (
            <div key={c.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all">
              <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${STEM_PROGRAMS[c.program].color}25, ${STEM_PROGRAMS[c.program].color}08)` }}>
                <img src={STEM_IMAGES[(c.year + c.module) % STEM_IMAGES.length]} alt=""
                  className="w-full h-full object-cover opacity-40" />
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                  <span className="px-2 py-0.5 bg-white/90 rounded text-foreground" style={{ fontSize: "10px", fontWeight: 700 }}>
                    Năm {c.year} · Module {c.module}
                  </span>
                  <ProgramBadge code={c.program} size="xs" />
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-white"
                    style={{ fontSize: "9.5px", fontWeight: 700, backgroundColor: tMeta.color }}>
                    <TIcon className="w-2.5 h-2.5" /> {tMeta.label}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1 mb-1">
                  <span className="px-1.5 py-0.5 rounded" style={{
                    fontSize: "10px", fontWeight: 600,
                    color: sMeta.color, backgroundColor: sMeta.color + "15",
                  }}>
                    {sMeta.label}
                  </span>
                </div>
                <h3 className="text-foreground line-clamp-2" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                  {c.title}
                </h3>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "11px" }}>
                  {c.durationHours}h · bắt đầu {c.nextSession}
                </p>

                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                      {c.completed}/{c.enrolled} GV hoàn thành
                    </span>
                    <strong style={{ fontSize: "10.5px" }}>{completion}%</strong>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-[#16a34a]" style={{ width: `${completion}%` }} />
                  </div>
                </div>

                <div className="mt-3 flex gap-1.5">
                  <button onClick={() => toast.info(`Chi tiết ${c.title}`)}
                    className="flex-1 px-2 py-1.5 border border-border rounded hover:bg-secondary flex items-center justify-center gap-1"
                    style={{ fontSize: "11px", fontWeight: 500 }}>
                    <FileText className="w-3 h-3" /> Chi tiết
                  </button>
                  <button onClick={() => toast.info(`Danh sách GV đăng ký`)}
                    className="flex-1 px-2 py-1.5 bg-[#990803] text-white rounded hover:opacity-90 flex items-center justify-center gap-1"
                    style={{ fontSize: "11px", fontWeight: 500 }}>
                    <Users className="w-3 h-3" /> {c.enrolled} GV
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TeacherTrainingProgram;
