import { useState, useMemo } from "react";
import {
  GraduationCap, Plus, Calendar, Users, Award, Play,
  PlayCircle, FileText, CheckCircle2, TrendingUp, Video,
  Download, BookOpen, Upload, File, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { STEM_PROGRAMS, STEM_IMAGES } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "@/app/lib/toast";

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
  passed: number;
  nextSession: string;
  status: "upcoming" | "running" | "completed" | "archived";
}

interface CourseMaterial {
  name: string;
  type: "pdf" | "video" | "slides" | "doc";
  size: string;
}

/* Mock materials per course type */
const MATERIAL_TEMPLATES: Record<TrainingCourse["type"], CourseMaterial[]> = {
  online: [
    { name: "Tài liệu học viên.pdf",   type: "pdf",    size: "2.4 MB" },
    { name: "Video hướng dẫn 1.mp4",   type: "video",  size: "85 MB"  },
    { name: "Bài tập thực hành.docx",  type: "doc",    size: "1.1 MB" },
  ],
  offline: [
    { name: "Giáo trình tập huấn.pdf",  type: "pdf",    size: "4.8 MB" },
    { name: "Slide trình bày.pptx",     type: "slides", size: "12 MB"  },
    { name: "Phiếu đánh giá GV.pdf",   type: "pdf",    size: "0.6 MB" },
    { name: "Bài kiểm tra năng lực.docx", type: "doc", size: "0.9 MB" },
  ],
  hybrid: [
    { name: "Tài liệu tự học.pdf",      type: "pdf",    size: "3.2 MB" },
    { name: "Video buổi online.mp4",    type: "video",  size: "120 MB" },
    { name: "Slide offline.pptx",       type: "slides", size: "8 MB"   },
    { name: "Rubric đánh giá.pdf",      type: "pdf",    size: "0.8 MB" },
  ],
};

const MATERIAL_ICONS: Record<CourseMaterial["type"], typeof File> = {
  pdf:    FileText,
  video:  Video,
  slides: FileText,
  doc:    File,
};

const MATERIAL_COLORS: Record<CourseMaterial["type"], string> = {
  pdf:    "#dc2626",
  video:  "#7c3aed",
  slides: "#0891b2",
  doc:    "#2563eb",
};

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
  const types: TrainingCourse["type"][]   = ["online", "offline", "hybrid"];
  const statuses: TrainingCourse["status"][] = ["running", "upcoming", "completed", "running", "archived"];
  let idx = 1;
  for (let year = 1; year <= 5; year++) {
    for (let m = 0; m < 3; m++) {
      const p = programs[(year - 1 + m) % 5];
      const enrolled  = 120 + (idx * 47) % 600;
      const completed = 80  + (idx * 31) % 450;
      list.push({
        id: `TC-${String(idx).padStart(3, "0")}`,
        year, module: m + 1,
        title: titles[idx - 1] || `Module ${idx}`,
        program: p,
        type:    types[idx % 3],
        durationHours: 8 + (idx * 3) % 24,
        enrolled,
        completed,
        passed: Math.round(completed * (0.7 + (idx % 3) * 0.1)),
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
  upcoming:  { label: "Sắp mở",       color: "#0891b2" },
  running:   { label: "Đang diễn ra", color: "#16a34a" },
  completed: { label: "Hoàn tất",     color: "#64748b" },
  archived:  { label: "Lưu trữ",      color: "#94a3b8" },
} as const;

export function TeacherTrainingProgram() {
  const [courses]      = useState(generateCourses());
  const [yearFilter,   setYearFilter]   = useState<number | "all">("all");
  const [ctFilter,     setCtFilter]     = useState<StemProgram | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TrainingCourse["status"] | "all">("all");
  const [expandedMat,  setExpandedMat]  = useState<string | null>(null);

  const filtered = useMemo(() =>
    courses.filter((c) => {
      if (yearFilter   !== "all" && c.year    !== yearFilter)   return false;
      if (ctFilter     !== "all" && c.program !== ctFilter)     return false;
      if (statusFilter !== "all" && c.status  !== statusFilter) return false;
      return true;
    }),
  [courses, yearFilter, ctFilter, statusFilter]);

  const totalEnrolled  = courses.reduce((s, c) => s + c.enrolled, 0);
  const totalCompleted = courses.reduce((s, c) => s + c.completed, 0);
  const totalPassed    = courses.reduce((s, c) => s + c.passed, 0);
  const running        = courses.filter((c) => c.status === "running").length;
  const completionRate = Math.round((totalCompleted / totalEnrolled) * 100);
  const passRate       = Math.round((totalPassed / totalCompleted) * 100);

  const byYear = [1, 2, 3, 4, 5].map((y) => {
    const yc = courses.filter((c) => c.year === y);
    return {
      year:      `Năm ${y}`,
      enrolled:  yc.reduce((s, c) => s + c.enrolled, 0),
      completed: yc.reduce((s, c) => s + c.completed, 0),
      passed:    yc.reduce((s, c) => s + c.passed, 0),
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
        <KpiCard icon={BookOpen}     label="Tổng module"      value={courses.length}                    color="#990803" />
        <KpiCard icon={Users}        label="GV đã đăng ký"   value={totalEnrolled.toLocaleString()}    color="#2563eb" change="+12%" trend="up" />
        <KpiCard icon={CheckCircle2} label="Đã hoàn thành"   value={totalCompleted.toLocaleString()}   color="#16a34a" subtitle={`${completionRate}% completion`} />
        <KpiCard icon={Award}        label="Đạt kiểm tra"    value={totalPassed.toLocaleString()}      color="#c8a84e" subtitle={`${passRate}% pass rate`} />
      </div>

      {/* 5-year progress bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          <Calendar className="w-4 h-4 inline mr-1.5" />
          Chương trình Đồng hành 5 năm
        </h3>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((y) => {
            const yc  = courses.filter((c) => c.year === y);
            const pct = yc.length ? Math.round(yc.filter((c) => c.status === "completed").length / yc.length * 100) : 0;
            const isCurrent = y === 2;
            return (
              <div key={y} className="flex-1 relative">
                <div
                  className={`h-14 rounded-lg overflow-hidden border-2 ${isCurrent ? "border-[#c8a84e]" : "border-transparent"}`}
                  style={{ background: `linear-gradient(90deg, #16a34a ${pct}%, #e5e7eb ${pct}%)` }}
                >
                  <div className="h-full flex items-center justify-center flex-col text-white">
                    <span style={{ fontSize: "13px", fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>Năm {y}</span>
                    <span style={{ fontSize: "10.5px", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>{pct}%</span>
                  </div>
                </div>
                {isCurrent && (
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
        <div className="bg-card rounded-xl border border-border p-4 lg:col-span-2">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Đăng ký · Hoàn thành · Đạt kiểm tra theo năm</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="enrolled"  fill="#2563eb" name="Đăng ký"   radius={[6, 6, 0, 0]} />
              <Bar dataKey="completed" fill="#16a34a" name="Hoàn thành" radius={[6, 6, 0, 0]} />
              <Bar dataKey="passed"    fill="#c8a84e" name="Đạt kiểm tra" radius={[6, 6, 0, 0]} />
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
              { label: "GV dẫn dắt NCKH CT5",  value: "28%", color: "#059669" },
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

      {/* ── Combined filter bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Year */}
        <span className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>Năm:</span>
        {(["all", 1, 2, 3, 4, 5] as const).map((y) => (
          <button key={y} onClick={() => setYearFilter(y)}
            className={`px-2.5 py-1.5 rounded-lg border transition-all ${yearFilter === y ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
            style={{ fontSize: "11px", fontWeight: 500 }}>
            {y === "all" ? "Tất cả" : `Năm ${y}`}
          </button>
        ))}

        <div className="h-5 w-px bg-border" />

        {/* CT */}
        <span className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>CT:</span>
        <button onClick={() => setCtFilter("all")}
          className={`px-2.5 py-1.5 rounded-lg border transition-all ${ctFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
          style={{ fontSize: "11px", fontWeight: 500 }}>
          Tất cả
        </button>
        {(Object.keys(STEM_PROGRAMS) as StemProgram[]).map((code) => {
          const p      = STEM_PROGRAMS[code];
          const active = ctFilter === code;
          return (
            <button key={code} onClick={() => setCtFilter(active ? "all" : code)}
              className={`px-2.5 py-1.5 rounded-lg border transition-all ${active ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"}`}
              style={{ fontSize: "11px", fontWeight: 500, ...(active ? { backgroundColor: p.color } : {}) }}>
              {code}
            </button>
          );
        })}

        <div className="h-5 w-px bg-border" />

        {/* Status */}
        <span className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>Trạng thái:</span>
        {(["all", "running", "upcoming", "completed", "archived"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-2.5 py-1.5 rounded-lg border transition-all ${statusFilter === s ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
            style={{ fontSize: "11px", fontWeight: 500 }}>
            {s === "all" ? "Tất cả" : STATUS_META[s].label}
          </button>
        ))}

        <span className="ml-auto text-muted-foreground" style={{ fontSize: "12px" }}>
          {filtered.length}/{courses.length} module
        </span>
      </div>

      {/* Course cards */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center bg-card rounded-xl border border-border">
          <GraduationCap className="w-10 h-10 mx-auto text-muted-foreground/20 mb-2" />
          <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Không có module phù hợp với bộ lọc hiện tại</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => {
            const tMeta      = TYPE_META[c.type];
            const sMeta      = STATUS_META[c.status];
            const TIcon      = tMeta.icon;
            const completion = Math.round((c.completed / c.enrolled) * 100);
            const passRate   = Math.round((c.passed / c.completed) * 100);
            const materials  = MATERIAL_TEMPLATES[c.type];
            const matOpen    = expandedMat === c.id;

            return (
              <div key={c.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all flex flex-col">
                {/* Cover */}
                <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${STEM_PROGRAMS[c.program].color}25, ${STEM_PROGRAMS[c.program].color}08)` }}>
                  <img src={STEM_IMAGES[(c.year + c.module) % STEM_IMAGES.length]} alt=""
                    className="w-full h-full object-cover opacity-40" />
                  <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                    <span className="px-2 py-0.5 bg-white/90 rounded text-foreground" style={{ fontSize: "10px", fontWeight: 700 }}>
                      Năm {c.year} · Module {c.module}
                    </span>
                    <ProgramBadge code={c.program} size="xs" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-white"
                      style={{ fontSize: "9.5px", fontWeight: 700, backgroundColor: tMeta.color }}>
                      <TIcon className="w-2.5 h-2.5" /> {tMeta.label}
                    </span>
                  </div>
                </div>

                <div className="p-3 flex flex-col flex-1 gap-2">
                  {/* Status + title */}
                  <div>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: sMeta.color, backgroundColor: sMeta.color + "15" }}>
                      {sMeta.label}
                    </span>
                    <h3 className="text-foreground mt-1 line-clamp-2" style={{ fontSize: "12.5px", fontWeight: 600 }}>{c.title}</h3>
                    <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>{c.durationHours}h · bắt đầu {c.nextSession}</p>
                  </div>

                  {/* Completion progress */}
                  <div>
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

                  {/* Pass rate */}
                  <div className="flex items-center justify-between px-2 py-1.5 bg-[#c8a84e]/5 border border-[#c8a84e]/20 rounded-lg">
                    <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Đạt kiểm tra</span>
                    <span className="text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 700 }}>
                      {c.passed} GV · {passRate}%
                    </span>
                  </div>

                  {/* Materials section */}
                  <div className="border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedMat(matOpen ? null : c.id)}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#0891b2]" />
                        <span style={{ fontSize: "11.5px", fontWeight: 600 }}>Tài liệu ({materials.length})</span>
                      </div>
                      {matOpen
                        ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                        : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>

                    {matOpen && (
                      <div className="border-t border-border">
                        <div className="divide-y divide-border">
                          {materials.map((mat, i) => {
                            const MIcon = MATERIAL_ICONS[mat.type];
                            return (
                              <div key={i} className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/30">
                                <MIcon className="w-3.5 h-3.5 shrink-0" style={{ color: MATERIAL_COLORS[mat.type] }} />
                                <span className="flex-1 truncate" style={{ fontSize: "11px", fontWeight: 500 }}>{mat.name}</span>
                                <span className="text-muted-foreground shrink-0" style={{ fontSize: "10px" }}>{mat.size}</span>
                                <button
                                  onClick={() => toast.success(`Tải ${mat.name}`)}
                                  className="p-0.5 text-muted-foreground hover:text-foreground shrink-0"
                                  title="Tải xuống"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        {/* Upload */}
                        <div className="px-3 py-2 border-t border-border">
                          <button
                            onClick={() => toast.info(`Upload tài liệu cho "${c.title}"`)}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-dashed border-[#0891b2]/40 rounded-lg text-[#0891b2] hover:bg-[#0891b2]/5 transition-colors"
                            style={{ fontSize: "11px", fontWeight: 500 }}
                          >
                            <Upload className="w-3 h-3" /> Upload tài liệu
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 mt-auto pt-1">
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
      )}
    </div>
  );
}

export default TeacherTrainingProgram;
