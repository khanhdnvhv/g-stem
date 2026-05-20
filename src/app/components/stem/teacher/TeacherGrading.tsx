import { useState, useMemo } from "react";
import {
  PenTool, Search, CheckCircle2, Clock, AlertCircle, X,
  ChevronDown, BarChart3, Users, FileText, Star,
  TrendingUp, TrendingDown, Minus, Filter, Send,
  BookOpen, Calendar,
} from "lucide-react";
import { scheduleEntries, STEM_PROGRAMS } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { ProgramBadge } from "../ui/badges";
import { toast } from "@/app/lib/toast";
import type { StemProgram } from "../../mock-data/types";

/* ================================================================ */
/*  TYPES                                                            */
/* ================================================================ */

type GradeStatus = "pending" | "grading" | "graded" | "returned";

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  studentInitials: string;
  className: string;
  classId: string;
  assignmentTitle: string;
  assignmentId: string;
  programCode: StemProgram;
  subject: string;
  submittedAt: string;
  status: GradeStatus;
  score: number | null;      // null = chưa chấm
  maxScore: number;
  feedback: string;
  type: "practice" | "project" | "exam" | "report";
}

/* ================================================================ */
/*  MOCK DATA                                                        */
/* ================================================================ */

const STUDENT_NAMES = [
  "Lê Hoàng Nam", "Phạm Thu Trang", "Nguyễn Quang Huy",
  "Vũ Khánh Linh", "Trần Minh Đức", "Đỗ Ngọc Anh",
  "Hoàng Phương Mai", "Bùi Gia Bảo", "Lý Quang Minh",
  "Nguyễn Thúy Hằng", "Phan Trọng Nghĩa", "Đinh Yến Nhi",
  "Cao Thanh Bình", "Lưu Thị Lan", "Trịnh Văn Đạt",
];

const ASSIGNMENTS = [
  { id: "ASG-01", title: "Bài thực hành: Mô hình Toán học thực tiễn", type: "practice" as const, program: "CT1" as StemProgram, subject: "Toán" },
  { id: "ASG-02", title: "Dự án: Thiết kế STEM liên môn", type: "project" as const, program: "CT2" as StemProgram, subject: "Toán" },
  { id: "ASG-03", title: "Báo cáo: Kết quả Câu lạc bộ STEM", type: "report" as const, program: "CT3" as StemProgram, subject: "Đổi mới sáng tạo" },
  { id: "ASG-04", title: "Bài tập: Lập trình Robot cơ bản", type: "practice" as const, program: "CT4" as StemProgram, subject: "Robotic" },
  { id: "ASG-05", title: "Kiểm tra giữa kỳ: Toán STEM liên môn", type: "exam" as const, program: "CT2" as StemProgram, subject: "Toán" },
];

const CLASS_LIST = [
  { id: "C1", name: "Lớp 6A" },
  { id: "C2", name: "Lớp 7A" },
  { id: "C3", name: "Lớp 8A" },
  { id: "C4", name: "Lớp 9A" },
];

const STATUSES: GradeStatus[] = ["graded", "pending", "grading", "graded", "returned", "pending", "graded"];

function buildSubmissions(teacherId: string): Submission[] {
  const result: Submission[] = [];
  let i = 0;
  for (const cls of CLASS_LIST) {
    const count = cls.id === "C3" ? 5 : cls.id === "C2" ? 4 : 3;
    for (let s = 0; s < count; s++) {
      const student = STUDENT_NAMES[(i + s) % STUDENT_NAMES.length];
      const asg = ASSIGNMENTS[(i + s) % ASSIGNMENTS.length];
      const status = STATUSES[(i + s) % STATUSES.length];
      const score = status === "graded" || status === "returned"
        ? Math.round((6.5 + ((i + s) * 7) % 35) * 10) / 10
        : null;
      const daysAgo = (i + s) % 5;
      const submittedDate = new Date();
      submittedDate.setDate(submittedDate.getDate() - daysAgo);

      result.push({
        id: `SUB-${String(i + s + 1).padStart(4, "0")}`,
        studentId: `U-STU-${String((i + s) % 30 + 1).padStart(3, "0")}`,
        studentName: student,
        studentInitials: student.split(" ").map((w) => w[0]).slice(-2).join(""),
        className: cls.name,
        classId: `${teacherId}-${cls.id}`,
        assignmentTitle: asg.title,
        assignmentId: asg.id,
        programCode: asg.program,
        subject: asg.subject,
        submittedAt: submittedDate.toISOString(),
        status,
        score,
        maxScore: 10,
        feedback: status === "returned" ? "Bài làm tốt, cần bổ sung phần kết luận." : "",
        type: asg.type,
      });
    }
    i += count;
  }
  return result;
}

/* ================================================================ */
/*  STATUS CONFIG                                                    */
/* ================================================================ */

const STATUS_CONFIG: Record<GradeStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending:  { label: "Chờ chấm",   color: "#f59e0b", bg: "#fef9e7", icon: Clock },
  grading:  { label: "Đang chấm",  color: "#3b82f6", bg: "#eff6ff", icon: PenTool },
  graded:   { label: "Đã chấm",    color: "#22c55e", bg: "#f0fdf4", icon: CheckCircle2 },
  returned: { label: "Đã trả",     color: "#059669", bg: "#ecfdf5", icon: Send },
};

const TYPE_CONFIG: Record<Submission["type"], { label: string; icon: typeof FileText }> = {
  practice: { label: "Thực hành", icon: BookOpen },
  project:  { label: "Dự án",    icon: Users },
  exam:     { label: "Kiểm tra", icon: AlertCircle },
  report:   { label: "Báo cáo",  icon: FileText },
};

/* ================================================================ */
/*  GRADE MODAL                                                      */
/* ================================================================ */

function GradeModal({
  submission,
  onSave,
  onClose,
}: {
  submission: Submission;
  onSave: (id: string, score: number, feedback: string) => void;
  onClose: () => void;
}) {
  const [score, setScore] = useState<string>(submission.score !== null ? String(submission.score) : "");
  const [feedback, setFeedback] = useState(submission.feedback);
  const meta = STEM_PROGRAMS[submission.programCode];

  const scoreNum = parseFloat(score);
  const scoreValid = !isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= submission.maxScore;

  const quickFeedbacks = [
    "Bài làm đạt yêu cầu, cần trình bày rõ hơn.",
    "Kết quả tốt, cần bổ sung phần kết luận.",
    "Xuất sắc! Bài làm logic và sáng tạo.",
    "Chưa đạt — cần xem lại phần lý thuyết và nộp lại.",
    "Có ý tưởng hay, cần hoàn thiện phần thực nghiệm.",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 pt-5 pb-4 relative"
          style={{
            background: `linear-gradient(135deg, ${meta.color}dd, ${meta.color}88)`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
            style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)" }}
          >
            <PenTool className="w-3 h-3 text-white" />
            <span className="text-white font-bold" style={{ fontSize: "10px" }}>Chấm điểm</span>
          </div>
          <p className="text-white/80" style={{ fontSize: "11px" }}>
            {submission.className} · {submission.studentName}
          </p>
          <h3 className="text-white font-extrabold leading-tight mt-1" style={{ fontSize: "15px" }}>
            {submission.assignmentTitle}
          </h3>
        </div>

        <div className="p-5 space-y-4">
          {/* Score entry */}
          <div>
            <label className="block font-semibold text-foreground mb-2" style={{ fontSize: "12px" }}>
              Điểm số (0 – {submission.maxScore})
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max={submission.maxScore}
                step="0.5"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-28 px-3 py-2.5 rounded-xl border-2 text-center font-bold text-xl outline-none transition-colors"
                style={{
                  fontSize: "22px",
                  borderColor: scoreValid ? meta.color : score ? "#ef4444" : "var(--border)",
                  color: scoreValid
                    ? scoreNum >= 8 ? "#22c55e" : scoreNum >= 6.5 ? "#f59e0b" : "#ef4444"
                    : "var(--foreground)",
                }}
                placeholder="0-10"
              />
              <div className="flex-1">
                {/* Quick score buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {[10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6, 5].map((v) => (
                    <button
                      key={v}
                      onClick={() => setScore(String(v))}
                      className="px-2 py-1 rounded-lg border text-xs font-semibold transition-all"
                      style={{
                        background: score === String(v) ? meta.color : "transparent",
                        color: score === String(v) ? "white" : "var(--foreground)",
                        borderColor: score === String(v) ? meta.color : "var(--border)",
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {scoreValid && (
                  <p
                    className="mt-1 font-semibold"
                    style={{
                      fontSize: "11px",
                      color: scoreNum >= 8 ? "#22c55e" : scoreNum >= 6.5 ? "#f59e0b" : "#ef4444",
                    }}
                  >
                    {scoreNum >= 8 ? "Xuất sắc / Giỏi" : scoreNum >= 6.5 ? "Khá" : scoreNum >= 5 ? "Trung bình" : "Chưa đạt"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block font-semibold text-foreground mb-2" style={{ fontSize: "12px" }}>
              Nhận xét & Phản hồi
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary/30 outline-none resize-none focus:border-[#0891b2] transition-colors"
              style={{ fontSize: "12.5px", minHeight: 80 }}
              placeholder="Nhận xét về bài làm của học sinh..."
            />
            {/* Quick feedback chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickFeedbacks.slice(0, 3).map((fb, i) => (
                <button
                  key={i}
                  onClick={() => setFeedback(fb)}
                  className="px-2 py-0.5 rounded-full border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                  style={{ fontSize: "10px" }}
                >
                  {fb.length > 32 ? fb.slice(0, 32) + "…" : fb}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={() => {
              if (!scoreValid) { toast.error("Vui lòng nhập điểm hợp lệ (0–10)"); return; }
              onSave(submission.id, scoreNum, feedback);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl text-white font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-1.5"
            style={{ background: meta.color, fontSize: "13px" }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Lưu điểm &amp; Trả bài
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold bg-secondary text-foreground hover:bg-secondary/70 transition-colors"
            style={{ fontSize: "13px" }}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  MAIN COMPONENT                                                   */
/* ================================================================ */

export function TeacherGrading() {
  const { user } = useAuth();
  const myId = user?.id || "U-TCH-01";

  const [submissions, setSubmissions] = useState<Submission[]>(() => buildSubmissions(myId));
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<GradeStatus | "all">("all");
  const [classFilter, setClassFilter]   = useState("all");
  const [programFilter, setProgramFilter] = useState<StemProgram | "all">("all");
  const [gradingEntry, setGradingEntry] = useState<Submission | null>(null);

  /* ── KPIs ── */
  const pending  = submissions.filter((s) => s.status === "pending").length;
  const grading  = submissions.filter((s) => s.status === "grading").length;
  const graded   = submissions.filter((s) => s.status === "graded" || s.status === "returned").length;
  const avgScore = useMemo(() => {
    const scored = submissions.filter((s) => s.score !== null);
    if (!scored.length) return 0;
    return Math.round((scored.reduce((sum, s) => sum + (s.score ?? 0), 0) / scored.length) * 10) / 10;
  }, [submissions]);

  /* ── Distinct classes from submissions ── */
  const classes = useMemo(
    () => Array.from(new Set(submissions.map((s) => s.className))).sort(),
    [submissions]
  );

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (classFilter !== "all" && s.className !== classFilter) return false;
      if (programFilter !== "all" && s.programCode !== programFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !s.studentName.toLowerCase().includes(q) &&
          !s.assignmentTitle.toLowerCase().includes(q) &&
          !s.className.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [submissions, statusFilter, classFilter, programFilter, search]);

  /* ── Grade distribution for chart ── */
  const gradeDistribution = useMemo(() => {
    const scored = submissions.filter((s) => s.score !== null);
    const buckets = [
      { label: "< 5",    min: 0,  max: 4.9,  count: 0, color: "#ef4444" },
      { label: "5–6.4",  min: 5,  max: 6.4,  count: 0, color: "#f59e0b" },
      { label: "6.5–7.9",min: 6.5,max: 7.9,  count: 0, color: "#3b82f6" },
      { label: "8–8.9",  min: 8,  max: 8.9,  count: 0, color: "#22c55e" },
      { label: "9–10",   min: 9,  max: 10,   count: 0, color: "#059669" },
    ];
    for (const s of scored) {
      const sc = s.score ?? 0;
      const b = buckets.find((b) => sc >= b.min && sc <= b.max);
      if (b) b.count++;
    }
    return buckets;
  }, [submissions]);

  /* ── Save grade handler ── */
  function handleSaveGrade(id: string, score: number, feedback: string) {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, score, feedback, status: "returned" as GradeStatus }
          : s
      )
    );
    toast.success("Đã lưu điểm và trả bài cho học sinh");
  }

  const maxDist = Math.max(...gradeDistribution.map((b) => b.count), 1);

  /* ──────────────────────────────────────────────── */

  return (
    <>
      <div className="space-y-5">

        {/* ── Page header ── */}
        <PageHeader
          icon={PenTool}
          title="Chấm điểm & Đánh giá"
          subtitle="Xem danh sách bài nộp, nhập điểm, phản hồi và trả bài cho học sinh trong lớp phụ trách."
          accentColor="#990803"
          actions={
            <div className="flex items-center gap-2">
              {pending > 0 && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600 font-semibold" style={{ fontSize: "12px" }}>
                    {pending} bài chờ chấm
                  </span>
                </div>
              )}
            </div>
          }
        />

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            icon={Clock}
            label="Chờ chấm"
            value={pending}
            color="#f59e0b"
            subtitle="bài nộp chưa chấm"
          />
          <KpiCard
            icon={PenTool}
            label="Đang chấm"
            value={grading}
            color="#3b82f6"
            subtitle="bài đang xử lý"
          />
          <KpiCard
            icon={CheckCircle2}
            label="Đã hoàn thành"
            value={graded}
            color="#22c55e"
            subtitle="đã chấm + trả bài"
          />
          <KpiCard
            icon={Star}
            label="Điểm TB"
            value={avgScore}
            color="#990803"
            subtitle="trung bình lớp"
          />
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Grade distribution */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontSize: "13px" }}>
              <BarChart3 className="w-4 h-4 text-[#990803]" />
              Phân bổ điểm số
            </h3>
            <div className="space-y-3">
              {gradeDistribution.map((b) => (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-right font-medium text-foreground" style={{ fontSize: "11px" }}>
                    {b.label}
                  </span>
                  <div className="flex-1 bg-secondary rounded-full h-6 overflow-hidden">
                    <div
                      className="h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{
                        width: b.count > 0 ? `${(b.count / maxDist) * 100}%` : "0%",
                        background: b.color,
                        minWidth: b.count > 0 ? 28 : 0,
                      }}
                    >
                      {b.count > 0 && (
                        <span className="text-white font-bold" style={{ fontSize: "10px" }}>
                          {b.count}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="w-8 shrink-0 text-muted-foreground text-right" style={{ fontSize: "10.5px" }}>
                    {b.count > 0
                      ? `${Math.round((b.count / submissions.filter((s) => s.score !== null).length) * 100)}%`
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status breakdown */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2" style={{ fontSize: "13px" }}>
              <Filter className="w-4 h-4 text-[#990803]" />
              Trạng thái bài nộp
            </h3>
            <div className="space-y-3">
              {(Object.entries(STATUS_CONFIG) as [GradeStatus, typeof STATUS_CONFIG[GradeStatus]][]).map(
                ([status, cfg]) => {
                  const count = submissions.filter((s) => s.status === status).length;
                  const pct = submissions.length > 0 ? (count / submissions.length) * 100 : 0;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={status}
                      className="flex items-center gap-2.5 cursor-pointer group"
                      onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className="font-medium group-hover:text-foreground transition-colors"
                            style={{
                              fontSize: "11.5px",
                              color: statusFilter === status ? "var(--foreground)" : "var(--muted-foreground)",
                              fontWeight: statusFilter === status ? 700 : 500,
                            }}
                          >
                            {cfg.label}
                          </span>
                          <span className="font-bold text-foreground" style={{ fontSize: "12px" }}>
                            {count}
                          </span>
                        </div>
                        <div className="bg-secondary rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%`, background: cfg.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* ── Filters + Search ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm học sinh, bài tập..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-card outline-none focus:border-[#990803] transition-colors"
              style={{ fontSize: "13px" }}
            />
          </div>

          {/* Class filter */}
          <div className="relative">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-card outline-none cursor-pointer"
              style={{ fontSize: "12.5px" }}
            >
              <option value="all">Tất cả lớp</option>
              {classes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Program filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(["all", "CT1", "CT2", "CT3", "CT4"] as const).map((code) => {
              const meta = code !== "all" ? STEM_PROGRAMS[code] : null;
              const active = programFilter === code;
              return (
                <button
                  key={code}
                  onClick={() => setProgramFilter(code)}
                  className="px-2.5 py-1 rounded-full transition-all"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    background: active ? (meta?.color || "#64748b") : `${meta?.color || "#64748b"}10`,
                    color: active ? "white" : (meta?.color || "#64748b"),
                    border: `1px solid ${(meta?.color || "#64748b")}40`,
                  }}
                >
                  {code === "all" ? "Tất cả" : code}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Submissions table ── */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="font-semibold text-foreground" style={{ fontSize: "13px" }}>
              Danh sách bài nộp
              <span className="ml-2 text-muted-foreground font-normal" style={{ fontSize: "11.5px" }}>
                ({filtered.length} kết quả)
              </span>
            </span>
            {(statusFilter !== "all" || classFilter !== "all" || programFilter !== "all" || search) && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setClassFilter("all");
                  setProgramFilter("all");
                  setSearch("");
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/70 transition-colors"
                style={{ fontSize: "11px" }}
              >
                <X className="w-3 h-3" /> Xóa lọc
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 700 }}>
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  {["Học sinh", "Bài tập", "Chương trình", "Nộp lúc", "Trạng thái", "Điểm", "Thao tác"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-3 py-2.5 text-left text-muted-foreground"
                        style={{ fontSize: "11px", fontWeight: 600 }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
                      Không có kết quả phù hợp.
                    </td>
                  </tr>
                ) : (
                  filtered.map((sub, i) => {
                    const cfg = STATUS_CONFIG[sub.status];
                    const StatusIcon = cfg.icon;
                    const TypeIcon = TYPE_CONFIG[sub.type].icon;
                    const submittedDate = new Date(sub.submittedAt);
                    const daysAgo = Math.floor((Date.now() - submittedDate.getTime()) / 86400000);
                    const score = sub.score;
                    const scoreColor = score === null ? "#64748b" : score >= 8 ? "#22c55e" : score >= 6.5 ? "#f59e0b" : "#ef4444";

                    return (
                      <tr
                        key={sub.id}
                        className="border-t border-border/50 hover:bg-secondary/20 transition-colors"
                        style={{ background: i % 2 === 1 ? "rgba(0,0,0,0.01)" : undefined }}
                      >
                        {/* Student */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                              style={{ fontSize: "10px", background: `${STEM_PROGRAMS[sub.programCode].color}cc` }}
                            >
                              {sub.studentInitials}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground" style={{ fontSize: "12px" }}>
                                {sub.studentName}
                              </p>
                              <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                                {sub.className}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Assignment */}
                        <td className="px-3 py-2.5 max-w-[220px]">
                          <div className="flex items-start gap-1.5">
                            <TypeIcon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-foreground leading-tight" style={{ fontSize: "11.5px" }}>
                                {sub.assignmentTitle.length > 40
                                  ? sub.assignmentTitle.slice(0, 40) + "…"
                                  : sub.assignmentTitle}
                              </p>
                              <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
                                {TYPE_CONFIG[sub.type].label} · {sub.subject}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Program */}
                        <td className="px-3 py-2.5">
                          <ProgramBadge code={sub.programCode} size="xs" />
                        </td>

                        {/* Submitted */}
                        <td className="px-3 py-2.5">
                          <p className="text-foreground" style={{ fontSize: "11.5px" }}>
                            {daysAgo === 0 ? "Hôm nay" : daysAgo === 1 ? "Hôm qua" : `${daysAgo} ngày trước`}
                          </p>
                          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
                            {submittedDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2.5">
                          <div
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
                          >
                            <StatusIcon className="w-3 h-3" style={{ color: cfg.color }} />
                            <span className="font-semibold" style={{ fontSize: "10px", color: cfg.color }}>
                              {cfg.label}
                            </span>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-3 py-2.5">
                          {score !== null ? (
                            <div className="flex items-center gap-1">
                              <span
                                className="font-extrabold"
                                style={{ fontSize: "16px", color: scoreColor }}
                              >
                                {score}
                              </span>
                              <span className="text-muted-foreground" style={{ fontSize: "10px" }}>
                                /{sub.maxScore}
                              </span>
                              {score >= 8 ? (
                                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                              ) : score < 6.5 ? (
                                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                              ) : (
                                <Minus className="w-3.5 h-3.5 text-amber-500" />
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground" style={{ fontSize: "12px" }}>—</span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => setGradingEntry(sub)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-semibold transition-opacity hover:opacity-80"
                            style={{
                              fontSize: "11px",
                              background: sub.status === "graded" || sub.status === "returned"
                                ? "#64748b"
                                : "#990803",
                            }}
                          >
                            <PenTool className="w-3 h-3" />
                            {sub.status === "graded" || sub.status === "returned" ? "Sửa" : "Chấm"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Info footer ── */}
        <div
          className="flex items-start gap-2 rounded-xl border px-4 py-3 text-muted-foreground"
          style={{ fontSize: "11px", background: "rgba(0,0,0,0.02)", borderColor: "rgba(0,0,0,0.07)" }}
        >
          <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            Điểm số được lưu vào hệ thống và thông báo tự động cho học sinh. Khi trả bài, học sinh
            nhận thông báo qua ứng dụng. Điểm STEM tính vào kết quả học kỳ theo trọng số trường quy định.
          </span>
        </div>
      </div>

      {/* ── Grade modal ── */}
      {gradingEntry && (
        <GradeModal
          submission={gradingEntry}
          onSave={handleSaveGrade}
          onClose={() => setGradingEntry(null)}
        />
      )}
    </>
  );
}

export default TeacherGrading;
