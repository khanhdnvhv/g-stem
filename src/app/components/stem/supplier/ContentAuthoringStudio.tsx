import { useState } from "react";
import { Link } from "react-router";
import {
  Edit, Plus, Clock, CheckCircle2, Layers, Eye, Copy, Pencil, BookOpen,
} from "lucide-react";
import { STEM_PROGRAMS, STUDIO_LESSONS } from "../../mock-data/index";
import type { StemProgram, DraftCard, DraftStatus } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  CONTENT AUTHORING STUDIO — Nhóm theo CT → Khối (Supplier)      */
/* ================================================================ */

type TabFilter = "all" | DraftStatus;

const STATUS_META: Record<DraftStatus, { label: string; bg: string; text: string; dot: string }> = {
  draft:     { label: "Nháp",       bg: "rgba(30,30,40,0.55)",   text: "rgba(255,255,255,0.8)", dot: "#94a3b8" },
  review:    { label: "Chờ duyệt",  bg: "rgba(245,158,11,0.9)",  text: "#fff",                  dot: "#f59e0b" },
  published: { label: "Đã publish", bg: "rgba(22,163,74,0.9)",   text: "#fff",                  dot: "#16a34a" },
};

const CT_COVERS: Record<StemProgram, { from: string; to: string }> = {
  CT1: { from: "#7f0d09", to: "#b8893a" },
  CT2: { from: "#0c6a8c", to: "#103c6e" },
  CT3: { from: "#14622e", to: "#0e3d1d" },
  CT4: { from: "#5520b0", to: "#3b1183" },
  CT5: { from: "#c03610", to: "#7a200b" },
};

// Màu sắc per môn học — giúp phân biệt nhanh
const SUBJECT_COLORS: Record<string, string> = {
  "Toán":       "#2563eb",
  "Vật lý":     "#0891b2",
  "Hóa học":    "#7c3aed",
  "Sinh học":   "#16a34a",
  "Tin học":    "#0369a1",
  "Công nghệ":  "#ea580c",
  "Tự nhiên":   "#059669",
  "STEM":       "#990803",
};

const PHASE_LABELS = ["Khởi động", "Kiến thức", "Thực hành", "Đánh giá"];
const CT_ORDER: StemProgram[]   = ["CT1", "CT2", "CT3", "CT4", "CT5"];
const KHOI_ORDER: string[]      = ["Mầm non", "Tiểu học", "THCS", "THPT"];

const KHOI_META: Record<string, { color: string; bg: string }> = {
  "Mầm non":  { color: "#f59e0b", bg: "#fef3c720" },
  "Tiểu học": { color: "#16a34a", bg: "#dcfce720" },
  "THCS":     { color: "#0891b2", bg: "#cffafe20" },
  "THPT":     { color: "#7c3aed", bg: "#ede9fe20" },
};

function getKhoi(grade: string): string {
  if (grade.startsWith("Mầm non"))  return "Mầm non";
  if (grade.startsWith("Tiểu học")) return "Tiểu học";
  if (grade.startsWith("THCS"))     return "THCS";
  if (grade.startsWith("THPT"))     return "THPT";
  return "Khác";
}

const ALL_LESSONS = STUDIO_LESSONS;

/* ── Lesson card ─────────────────────────────────────────────────── */
function LessonCardItem({ l }: { l: DraftCard }) {
  const sm      = STATUS_META[l.status];
  const cover   = CT_COVERS[l.program];
  const subColor = SUBJECT_COLORS[l.subject] ?? "#64748b";
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col">
      {/* Cover gradient */}
      <div
        className="relative flex flex-col justify-between p-3 pb-0"
        style={{ height: 130, background: `linear-gradient(135deg, ${cover.from} 0%, ${cover.to} 100%)` }}>
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23fff'/%3E%3C/svg%3E\")" }} />

        <div className="relative flex items-center justify-between">
          <span className="px-2 py-0.5 rounded text-white font-bold backdrop-blur-sm"
            style={{ fontSize: "9px", letterSpacing: "0.06em", backgroundColor: subColor + "cc" }}>
            {l.subject.toUpperCase()}
          </span>
          <span className="px-2 py-0.5 rounded-md backdrop-blur-sm"
            style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.07em", backgroundColor: sm.bg, color: sm.text }}>
            {sm.label.toUpperCase()}
          </span>
        </div>

        <div className="relative pb-3">
          <h3 className="text-white line-clamp-2 leading-snug"
            style={{ fontSize: "12.5px", fontWeight: 700, textShadow: "0 1px 4px rgba(0,0,0,0.45)" }}>
            {l.title}
          </h3>
        </div>

        {/* Phase bar */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {PHASE_LABELS.map((ph, i) => (
            <div key={ph} className="flex-1 h-1" title={ph}
              style={{ backgroundColor: i < l.phasesComplete ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.18)" }} />
          ))}
        </div>
      </div>

      {/* Phase labels */}
      <div className="flex px-3 pt-1">
        {PHASE_LABELS.map((ph, i) => (
          <div key={ph} className="flex-1 text-center"
            style={{ fontSize: "8px", fontWeight: 500, color: i < l.phasesComplete ? "#64748b" : "#cbd5e1" }}>
            {ph}
          </div>
        ))}
      </div>

      {/* Meta row: grade + duration + time */}
      <div className="flex items-center gap-1.5 px-3 pt-2">
        <span className="px-2 py-0.5 bg-secondary rounded-md text-muted-foreground" style={{ fontSize: "10.5px" }}>{l.grade}</span>
        <span className="px-2 py-0.5 bg-secondary rounded-md text-muted-foreground" style={{ fontSize: "10.5px" }}>{l.durationMinutes}p</span>
        <span className="ml-auto text-muted-foreground" style={{ fontSize: "10px" }}>{l.updatedAt}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 px-3 pt-2.5 pb-3 mt-auto">
        <Link to={
          l.program === "CT5"
            ? `/supplier/content/authoring/research/${l.id}`
            : `/supplier/content/authoring/${l.id}`
        }
          className={`flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg hover:opacity-90 transition-opacity ${l.program === "CT5" ? "bg-[#059669]" : "bg-[#990803]"}`}
          style={{ fontSize: "11px", fontWeight: 600 }}>
          <Pencil className="w-3 h-3" /> {l.program === "CT5" ? "Nghiên cứu tiếp" : "Soạn tiếp"}
        </Link>
        <div className="ml-auto flex gap-1">
          <button onClick={() => toast.info(`Preview: ${l.title}`)}
            className="w-7 h-7 rounded-lg border border-border hover:bg-secondary flex items-center justify-center transition-colors" title="Preview">
            <Eye className="w-3 h-3 text-muted-foreground" />
          </button>
          <button onClick={() => toast.success("Đã nhân bản bài giảng")}
            className="w-7 h-7 rounded-lg border border-border hover:bg-secondary flex items-center justify-center transition-colors" title="Nhân bản">
            <Copy className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */
import { CTSelectorWizard } from "./CTSelectorWizard";

export function ContentAuthoringStudio() {
  const [tab, setTab] = useState<TabFilter>("all");
  const [wizardOpen, setWizardOpen] = useState(false);

  const filtered = tab === "all" ? ALL_LESSONS : ALL_LESSONS.filter((l) => l.status === tab);

  const counts = {
    draft:     ALL_LESSONS.filter((l) => l.status === "draft").length,
    review:    ALL_LESSONS.filter((l) => l.status === "review").length,
    published: ALL_LESSONS.filter((l) => l.status === "published").length,
    all:       ALL_LESSONS.length,
  };

  const STATS: { icon: typeof Edit; label: string; key: keyof typeof counts; color: string }[] = [
    { icon: Edit,         label: "Bản nháp",   key: "draft",     color: "#990803" },
    { icon: Clock,        label: "Chờ duyệt",  key: "review",    color: "#f59e0b" },
    { icon: CheckCircle2, label: "Đã publish", key: "published", color: "#16a34a" },
    { icon: Layers,       label: "Tổng",       key: "all",       color: "#7c3aed" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Edit}
        title="Studio Biên soạn Bài giảng"
        subtitle="Soạn và quản lý bài giảng STEM CT1–CT5 — nhóm theo Chương trình → Khối lớp → Môn học."
        accentColor="#990803"
        actions={
          <button onClick={() => setWizardOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ fontSize: "13px", fontWeight: 600 }}>
            <Plus className="w-4 h-4" /> Soạn bài mới
          </button>
        }
      />

      <CTSelectorWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />

      {/* Stats */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="grid grid-cols-4 divide-x divide-border">
          {STATS.map(({ icon: Icon, label, key, color }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-3 px-5 py-4 transition-colors hover:bg-secondary/50 ${tab === key ? "bg-secondary/60" : ""}`}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: color + "15" }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="text-left">
                <p style={{ fontSize: "22px", fontWeight: 700, lineHeight: 1, color: tab === key ? color : "inherit" }}>
                  {counts[key]}
                </p>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>{label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1 bg-secondary/40 rounded-lg p-1 w-fit border border-border/50">
        {(["all", "draft", "review", "published"] as const).map((t) => {
          const active = tab === t;
          const label  = t === "all" ? "Tất cả" : STATUS_META[t].label;
          return (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                active ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontSize: "12.5px", fontWeight: active ? 600 : 400 }}>
              {label}
              <span className="px-1.5 py-0.5 rounded-full"
                style={{ fontSize: "10px", fontWeight: 600,
                  backgroundColor: active ? "#990803" : "transparent",
                  color: active ? "#fff" : "#94a3b8" }}>
                {counts[t]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── CT → Khối hierarchy ── */}
      <div className="space-y-8">
        {CT_ORDER.map((ct) => {
          const prog       = STEM_PROGRAMS[ct];
          const cover      = CT_COVERS[ct];
          const ctAll      = ALL_LESSONS.filter((l) => l.program === ct);
          const ctFiltered = filtered.filter((l) => l.program === ct);

          return (
            <div key={ct} className="rounded-2xl border border-border overflow-hidden">
              {/* ── CT header bar ── */}
              <div
                className="px-4 py-3 flex items-center gap-2.5"
                style={{ background: `linear-gradient(135deg, ${cover.from}18 0%, ${cover.to}08 100%)`, borderBottom: `1px solid ${cover.from}25` }}>
                <div className="w-1.5 h-8 rounded-full shrink-0"
                  style={{ background: `linear-gradient(180deg, ${cover.from}, ${cover.to})` }} />
                <ProgramBadge code={ct} size="sm" />
                <div>
                  <span style={{ fontSize: "14px", fontWeight: 700 }}>{prog.shortName}</span>
                  <span className="ml-2 text-muted-foreground" style={{ fontSize: "11.5px" }}>
                    · {ctAll.length} bài giảng
                  </span>
                </div>

                {/* Status chips for this CT */}
                <div className="flex items-center gap-1.5 ml-1">
                  {(["draft", "review", "published"] as DraftStatus[]).map((s) => {
                    const n = ctAll.filter((l) => l.status === s).length;
                    if (!n) return null;
                    return (
                      <span key={s} className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                        style={{ fontSize: "9.5px", fontWeight: 600,
                          backgroundColor: STATUS_META[s].dot + "20", color: STATUS_META[s].dot }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_META[s].dot }} />
                        {n} {STATUS_META[s].label}
                      </span>
                    );
                  })}
                </div>

                <div className="flex-1" />
                <Link to="/supplier/content/authoring/new"
                  className="flex items-center gap-1 px-2.5 py-1.5 border rounded-lg hover:bg-card/80 transition-colors shrink-0 text-muted-foreground hover:text-foreground"
                  style={{ fontSize: "11.5px", borderColor: cover.from + "40" }}>
                  <Plus className="w-3 h-3" /> Soạn mới {ct}
                </Link>
              </div>

              {/* ── Khối sub-sections ── */}
              <div className="p-4 space-y-5">
                {ctFiltered.length === 0 ? (
                  /* Empty state */
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed"
                    style={{ borderColor: cover.from + "35", backgroundColor: cover.from + "06" }}>
                    <BookOpen className="w-4 h-4 shrink-0" style={{ color: cover.from }} />
                    <p className="text-muted-foreground flex-1" style={{ fontSize: "12px" }}>
                      {tab !== "all"
                        ? `Không có bài "${STATUS_META[tab as DraftStatus]?.label}" nào cho ${ct}.`
                        : `Chưa có bài giảng nào cho ${ct}.`}
                    </p>
                    {tab === "all" && (
                      <Link to="/supplier/content/authoring/new"
                        className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-white hover:opacity-90"
                        style={{ fontSize: "11.5px", fontWeight: 600, background: `linear-gradient(135deg, ${cover.from}, ${cover.to})` }}>
                        <Plus className="w-3 h-3" /> Soạn bài đầu tiên
                      </Link>
                    )}
                  </div>
                ) : (
                  KHOI_ORDER.map((khoi) => {
                    const khoiLessons = ctFiltered.filter((l) => getKhoi(l.grade) === khoi);
                    if (!khoiLessons.length) return null;
                    const km = KHOI_META[khoi];

                    return (
                      <div key={khoi}>
                        {/* Khối sub-header */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <span
                            className="px-2.5 py-1 rounded-lg font-semibold"
                            style={{ fontSize: "11.5px", color: km.color, backgroundColor: km.color + "18" }}>
                            {khoi}
                          </span>
                          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                            {khoiLessons.length} bài ·{" "}
                            {/* Unique subjects in this khoi */}
                            {[...new Set(khoiLessons.map((l) => l.subject))].map((s) => (
                              <span key={s}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-white mr-1"
                                style={{ fontSize: "9.5px", fontWeight: 600, backgroundColor: (SUBJECT_COLORS[s] ?? "#64748b") + "cc" }}>
                                {s}
                              </span>
                            ))}
                          </span>
                          <div className="flex-1 h-px" style={{ backgroundColor: km.color + "30" }} />
                        </div>

                        {/* Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                          {khoiLessons.map((l) => <LessonCardItem key={l.id} l={l} />)}
                          {/* Inline + card */}
                          <Link to="/supplier/content/authoring/new"
                            className="rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-2 group hover:scale-[1.01]"
                            style={{ minHeight: 200, borderColor: km.color + "40" }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                              style={{ backgroundColor: km.color + "18" }}>
                              <Plus className="w-5 h-5" style={{ color: km.color }} />
                            </div>
                            <p style={{ fontSize: "11.5px", fontWeight: 600, color: km.color }}>
                              Thêm bài {khoi}
                            </p>
                            <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{ct}</p>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ContentAuthoringStudio;
