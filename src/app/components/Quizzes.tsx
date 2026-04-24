import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  ClipboardCheck, Clock, Target, CheckCircle2, XCircle, PlayCircle, RotateCcw,
  Search, Trophy, FileText, ChevronLeft, ChevronRight, ChevronDown,
  Shield, ShieldCheck, Eye, Star, Zap, Brain, BarChart3, TrendingUp,
  Award, Calendar, Users, BookOpen, Filter, SlidersHorizontal,
  ArrowUpDown, Sparkles, GraduationCap, AlertCircle, Timer, Layers,
  PieChart, Hash, Flag, Lock, Unlock, Bookmark, Download, Video, CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router";
import { useAuth } from "./AuthContext";
import { MOCK_EXAMS, EXAM_TYPE_CONFIG, DIFFICULTY_CONFIG, MOCK_ATTEMPTS, getExamQuestions } from "./exam/types";
import type { Exam, ExamStatus } from "./exam/types";
import { ExamTaking } from "./exam/ExamTaking";
import { ExamResults } from "./exam/ExamResults";
import { QuestionBank } from "./exam/QuestionBank";
import { ExamCreator } from "./exam/ExamCreator";
import { ExamStatistics } from "./exam/ExamStatistics";
import { ExamHistory } from "./exam/ExamHistory";
import { ProctoringDashboard } from "./exam/ProctoringDashboard";
import { ExamScheduling } from "./exam/ExamScheduling";

const STATUS_CONFIG: Record<ExamStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  not_started: { label: "Chưa bắt đầu", color: "#6b7280", bg: "#6b728010", icon: Clock },
  in_progress: { label: "Đang làm", color: "#3b82f6", bg: "#3b82f610", icon: PlayCircle },
  submitted: { label: "Đã nộp", color: "#8b5cf6", bg: "#8b5cf610", icon: CheckCircle2 },
  passed: { label: "Đạt", color: "#22c55e", bg: "#22c55e10", icon: Trophy },
  failed: { label: "Chưa đạt", color: "#ef4444", bg: "#ef444410", icon: XCircle },
  grading: { label: "Đang chấm", color: "#f59e0b", bg: "#f59e0b10", icon: Timer },
};

export function Quizzes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState<"dueDate" | "title" | "difficulty">("dueDate");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"exams" | "questionbank" | "statistics" | "history" | "proctoring" | "scheduling" | "certificates">("exams");
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Read tab from URL search params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["exams", "questionbank", "statistics", "history", "proctoring", "scheduling", "certificates"].includes(tabParam)) {
      setActiveTab(tabParam as typeof activeTab);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = useCallback((tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === "exams") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  }, [setSearchParams]);

  // Scroll indicators for tab bar
  const updateScrollIndicators = useCallback(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    updateScrollIndicators();
    el.addEventListener("scroll", updateScrollIndicators);
    const ro = new ResizeObserver(updateScrollIndicators);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollIndicators);
      ro.disconnect();
    };
  }, [updateScrollIndicators]);

  const scrollTabs = (dir: "left" | "right") => {
    const el = tabScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  // Modal states
  const [previewExam, setPreviewExam] = useState<Exam | null>(null);
  const [takingExam, setTakingExam] = useState<Exam | null>(null);
  const [resultsExam, setResultsExam] = useState<Exam | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<string, any>>({});
  const [examTimeSpent, setExamTimeSpent] = useState(0);
  const [examFlagged, setExamFlagged] = useState<string[]>([]);
  const [examConfidence, setExamConfidence] = useState<Record<string, number>>({});
  const [examTabSwitches, setExamTabSwitches] = useState(0);
  const [examQTimes, setExamQTimes] = useState<Record<string, number>>({});
  const [showCreator, setShowCreator] = useState(false);

  const isAdmin = user?.role === "admin";
  const isInstructor = user?.role === "instructor";

  // ── Filter & Sort ──
  const filtered = useMemo(() => {
    let list = MOCK_EXAMS.filter(e => {
      const matchSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.courseName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = selectedStatus === "all" || e.status === selectedStatus;
      const matchType = selectedType === "all" || e.type === selectedType;
      const matchDiff = selectedDifficulty === "all" || e.difficulty === selectedDifficulty;
      return matchSearch && matchStatus && matchType && matchDiff;
    });
    list.sort((a, b) => {
      if (sortBy === "dueDate") return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return (["easy", "medium", "hard", "expert"].indexOf(a.difficulty)) - (["easy", "medium", "hard", "expert"].indexOf(b.difficulty));
    });
    return list;
  }, [searchQuery, selectedStatus, selectedType, selectedDifficulty, sortBy]);

  // ── Stats ──
  const stats = useMemo(() => {
    const total = MOCK_EXAMS.length;
    const passed = MOCK_EXAMS.filter(e => e.status === "passed").length;
    const failed = MOCK_EXAMS.filter(e => e.status === "failed").length;
    const pending = MOCK_EXAMS.filter(e => e.status === "not_started" || e.status === "in_progress").length;
    const avgScore = MOCK_EXAMS.filter(e => e.bestScore !== null).reduce((acc, e) => acc + (e.bestScore || 0), 0) /
      (MOCK_EXAMS.filter(e => e.bestScore !== null).length || 1);
    const totalAttempts = MOCK_EXAMS.reduce((s, e) => s + (e.totalAttempts || 0), 0);
    return { total, passed, failed, pending, avgScore, totalAttempts };
  }, []);

  // ── Handlers ──
  const handleStartExam = (exam: Exam) => {
    setPreviewExam(null);
    setTakingExam(exam);
  };

  const handleExamSubmit = (answers: Record<string, any>, timeSpent: number, flagged: string[], confidence: Record<string, number>, tabSwitches: number, qTimes: Record<string, number>) => {
    setExamAnswers(answers);
    setExamTimeSpent(timeSpent);
    setExamFlagged(flagged);
    setExamConfidence(confidence);
    setExamTabSwitches(tabSwitches);
    setExamQTimes(qTimes);
    setResultsExam(takingExam);
    setTakingExam(null);
  };

  // ── Exam Taking View ──
  if (takingExam) {
    return <ExamTaking exam={takingExam} onSubmit={handleExamSubmit} onExit={() => setTakingExam(null)} />;
  }

  // ── Results View ──
  if (resultsExam) {
    return (
      <div className="space-y-6">
        <ExamResults
          exam={resultsExam}
          answers={examAnswers}
          timeSpent={examTimeSpent}
          flagged={examFlagged}
          confidence={examConfidence}
          tabSwitches={examTabSwitches}
          questionTimes={examQTimes}
          onRetry={() => { setTakingExam(resultsExam); setResultsExam(null); }}
          onBack={() => setResultsExam(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#990803] to-[#7a0602] flex items-center justify-center shadow-lg shadow-[#990803]/20">
              <ClipboardCheck className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-foreground">
              {isAdmin ? "Quản lý Kiểm tra & Đề thi" : isInstructor ? "Kiểm tra & Chấm điểm" : "Trung tâm Kiểm tra"}
            </h1>
          </div>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
            {isAdmin
              ? `${stats.total} đề thi • ${stats.totalAttempts.toLocaleString()} lượt thi • Tỷ lệ đạt: ${stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%`
              : "Đa dạng hình thức: Trắc nghiệm, Case Study, Tự luận, Nối cặp, Sắp xếp, Ma trận"}
          </p>
        </div>
        {(isAdmin || isInstructor) && (
          <button onClick={() => setShowCreator(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#990803] to-[#7a0602] text-white rounded-xl hover:shadow-lg hover:shadow-[#990803]/20 transition-all cursor-pointer shrink-0" style={{ fontSize: "14px", fontWeight: 500 }}>
            <Sparkles className="w-4 h-4" /> Tạo đề thi mới
          </button>
        )}
      </div>

      {/* ── TAB NAVIGATION (Admin/Instructor) — Scrollable ── */}
      {(isAdmin || isInstructor) && (
        <div className="relative">
          {canScrollLeft && (
            <button onClick={() => scrollTabs("left")} className="absolute left-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-r from-card via-card/95 to-transparent rounded-l-xl cursor-pointer">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <div ref={tabScrollRef} className="flex items-center gap-1 bg-card rounded-xl border border-border p-1 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
            {([
              { key: "exams" as const, label: "Đề thi", icon: ClipboardCheck, count: stats.total },
              { key: "questionbank" as const, label: "Ngân hàng Câu hỏi", icon: Layers, count: 20 },
              { key: "statistics" as const, label: "Thống kê", icon: BarChart3, count: 0 },
              { key: "history" as const, label: "Lịch sử", icon: FileText, count: 0 },
              { key: "proctoring" as const, label: "Giám sát", icon: Video, count: 0 },
              { key: "scheduling" as const, label: "Lịch thi", icon: CalendarDays, count: 0 },
              { key: "certificates" as const, label: "Chứng chỉ", icon: Award, count: 0 },
            ]).map(tab => (
              <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-3 md:px-4 py-2.5 rounded-lg cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                  activeTab === tab.key ? "bg-[#990803] text-white shadow-sm" : "text-muted-foreground hover:bg-secondary"
                }`} style={{ fontSize: "13px", fontWeight: 500 }}>
                <tab.icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.count > 0 && <span className={`px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"}`} style={{ fontSize: "10px", fontWeight: 700 }}>{tab.count}</span>}
              </button>
            ))}
          </div>
          {canScrollRight && (
            <button onClick={() => scrollTabs("right")} className="absolute right-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-l from-card via-card/95 to-transparent rounded-r-xl cursor-pointer">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {/* ── TAB NAVIGATION (Learner) ── */}
      {!isAdmin && !isInstructor && (
        <div className="flex items-center gap-1 bg-card rounded-xl border border-border p-1">
          {([
            { key: "exams" as const, label: "Đề thi", icon: ClipboardCheck },
            { key: "history" as const, label: "Lịch sử thi", icon: Clock },
            { key: "scheduling" as const, label: "Lịch thi", icon: CalendarDays },
          ]).map(tab => (
            <button key={tab.key} onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer transition-all flex-1 justify-center ${
                activeTab === tab.key ? "bg-[#990803] text-white shadow-sm" : "text-muted-foreground hover:bg-secondary"
              }`} style={{ fontSize: "13px", fontWeight: 500 }}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* ── QUESTION BANK TAB ── */}
      {(isAdmin || isInstructor) && activeTab === "questionbank" && <QuestionBank />}

      {/* ── STATISTICS TAB ── */}
      {(isAdmin || isInstructor) && activeTab === "statistics" && <ExamStatistics />}

      {/* ── HISTORY TAB ── */}
      {(isAdmin || isInstructor) && activeTab === "history" && <ExamHistory />}

      {/* ── HISTORY TAB (Learner) ── */}
      {!isAdmin && !isInstructor && activeTab === "history" && <ExamHistory />}

      {/* ── PROCTORING TAB ── */}
      {(isAdmin || isInstructor) && activeTab === "proctoring" && <ProctoringDashboard />}

      {/* ── SCHEDULING TAB ── */}
      {activeTab === "scheduling" && <ExamScheduling />}

      {/* ── CERTIFICATES TAB — Redirect to full module ── */}
      {(isAdmin || isInstructor) && activeTab === "certificates" && (
        <div className="bg-gradient-to-br from-[#990803]/5 via-white to-[#c8a84e]/5 rounded-2xl border border-[#990803]/10 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>Module Chứng chỉ đã được nâng cấp</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto" style={{ fontSize: "13px" }}>
            Hệ thống Quản lý Chứng chỉ đã được chuyển sang module riêng với đầy đủ tính năng: Quản lý phôi, Cấu hình cấp, Phê duyệt, Xác thực, Báo cáo nâng cao và hơn thế nữa.
          </p>
          <button
            onClick={() => navigate("/certificates")}
            className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-[#990803] text-white rounded-xl hover:bg-[#990803]/90 transition-colors cursor-pointer shadow-lg shadow-[#990803]/20"
            style={{ fontSize: "14px", fontWeight: 600 }}
          >
            <Award className="w-4 h-4" /> Đi đến Quản lý Chứng chỉ <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── EXAMS TAB ── */}
      {activeTab === "exams" && <>

      {/* ── STATS DASHBOARD ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Tổng đề thi", value: stats.total, icon: ClipboardCheck, color: "#990803", sub: "đề" },
          { label: "Đã đạt", value: stats.passed, icon: Trophy, color: "#22c55e", sub: "bài" },
          { label: "Chưa đạt", value: stats.failed, icon: XCircle, color: "#ef4444", sub: "bài" },
          { label: "Chờ thi", value: stats.pending, icon: Clock, color: "#f59e0b", sub: "bài" },
          { label: "Điểm TB", value: `${Math.round(stats.avgScore)}%`, icon: Target, color: "#c8a84e", sub: "" },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110" style={{ background: `${stat.color}10` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              {stat.sub && <span className="text-muted-foreground/50" style={{ fontSize: "10px" }}>{stat.sub}</span>}
            </div>
            <p className="text-foreground" style={{ fontSize: "24px", fontWeight: 800 }}>{stat.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── SEARCH & FILTERS ── */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" placeholder="Tìm kiếm đề thi, khóa học..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-xl border border-border focus:ring-2 focus:ring-[#990803]/10 focus:border-[#990803]/30 focus:outline-none transition-all"
              style={{ fontSize: "13px" }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 bg-secondary rounded-xl border border-border text-foreground/70 cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Trạng thái</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2.5 bg-secondary rounded-xl border border-border text-foreground/70 cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Loại đề</option>
              {Object.entries(EXAM_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
            <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2.5 bg-secondary rounded-xl border border-border text-foreground/70 cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Độ khó</option>
              {Object.entries(DIFFICULTY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-secondary rounded-xl border border-border text-foreground/70 cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="dueDate">Sắp xếp: Hạn nộp</option>
              <option value="title">Sắp xếp: Tên</option>
              <option value="difficulty">Sắp xếp: Độ khó</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── EXAM CARDS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(exam => {
          const status = STATUS_CONFIG[exam.status];
          const type = EXAM_TYPE_CONFIG[exam.type];
          const diff = DIFFICULTY_CONFIG[exam.difficulty];
          const StatusIcon = status.icon;
          const dueDate = new Date(exam.dueDate);
          const isOverdue = dueDate < new Date() && exam.status !== "passed" && exam.status !== "submitted";
          const canStart = exam.status === "not_started" || exam.status === "in_progress" || (exam.status === "failed" && exam.attemptsUsed < exam.maxAttempts);

          return (
            <div key={exam.id} className="bg-card rounded-2xl border border-border hover:shadow-lg hover:border-[#990803]/10 transition-all overflow-hidden group">
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${type.color}, ${diff.color})` }} />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: type.color, background: type.bg }}>{type.icon} {type.label}</span>
                  <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: status.color, background: status.bg }}><StatusIcon className="w-3 h-3" /> {status.label}</span>
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: diff.color, background: diff.bg }}>{"★".repeat(diff.stars)} {diff.label}</span>
                  {exam.proctoringEnabled && (
                    <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-green-50 text-green-600" style={{ fontSize: "10px", fontWeight: 600 }}><Shield className="w-3 h-3" /> Proctored</span>
                  )}
                </div>

                <h3 className="text-foreground mb-1 group-hover:text-[#990803] transition-colors" style={{ fontSize: "15px", fontWeight: 600, lineHeight: 1.4 }}>{exam.title}</h3>
                <p className="text-muted-foreground mb-4" style={{ fontSize: "12px" }}>{exam.courseName}</p>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { v: exam.totalQuestions, l: "Câu hỏi" },
                    { v: exam.duration > 0 ? `${exam.duration}'` : "∞", l: "Phút" },
                    { v: `${exam.passingScore}%`, l: "Chuẩn đạt" },
                    { v: `${exam.attemptsUsed}/${exam.maxAttempts}`, l: "Lần thi" },
                  ].map(s => (
                    <div key={s.l} className="text-center p-2 bg-secondary rounded-lg">
                      <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>{s.v}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{s.l}</p>
                    </div>
                  ))}
                </div>

                {exam.bestScore !== null && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Điểm cao nhất</span>
                      <span className={exam.bestScore >= exam.passingScore ? "text-green-500" : "text-red-500"} style={{ fontSize: "12px", fontWeight: 700 }}>{exam.bestScore}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${exam.bestScore}%`, background: exam.bestScore >= exam.passingScore ? "linear-gradient(90deg, #22c55e, #16a34a)" : "linear-gradient(90deg, #ef4444, #dc2626)" }} />
                    </div>
                  </div>
                )}

                {exam.avgScore !== undefined && (
                  <div className="flex items-center gap-4 mb-4 text-muted-foreground" style={{ fontSize: "10px" }}>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {exam.totalAttempts?.toLocaleString()} lượt thi</span>
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" /> TB: {exam.avgScore}%</span>
                    <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Đạt: {exam.passRate}%</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center">
                      <span className="text-white" style={{ fontSize: "8px", fontWeight: 700 }}>{exam.createdByAvatar}</span>
                    </div>
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{exam.createdBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverdue ? (
                      <span className="flex items-center gap-1 text-red-500" style={{ fontSize: "10px", fontWeight: 600 }}><AlertCircle className="w-3 h-3" /> Quá hạn</span>
                    ) : (
                      <span className="text-muted-foreground" style={{ fontSize: "10px" }}><Calendar className="w-3 h-3 inline mr-1" />{dueDate.toLocaleDateString("vi-VN")}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button onClick={() => setPreviewExam(exam)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-border rounded-xl text-foreground/70 hover:bg-secondary cursor-pointer transition-all" style={{ fontSize: "12px", fontWeight: 500 }}>
                    <Eye className="w-3.5 h-3.5" /> Chi tiết
                  </button>
                  {canStart ? (
                    <button onClick={() => handleStartExam(exam)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-[#990803] to-[#7a0602] text-white rounded-xl hover:shadow-lg hover:shadow-[#990803]/20 cursor-pointer transition-all" style={{ fontSize: "12px", fontWeight: 600 }}>
                      <PlayCircle className="w-3.5 h-3.5" />
                      {exam.status === "in_progress" ? "Tiếp tục" : exam.status === "failed" ? "Thi lại" : "Bắt đầu"}
                    </button>
                  ) : exam.status === "passed" && exam.showResults ? (
                    <button onClick={() => {
                      setExamAnswers({});
                      setExamTimeSpent(exam.avgCompletionTime ? exam.avgCompletionTime * 60 : 0);
                      setExamFlagged([]);
                      setExamConfidence({});
                      setExamTabSwitches(0);
                      setExamQTimes({});
                      setResultsExam(exam);
                    }} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-green-50 text-green-600 border border-green-200 rounded-xl hover:bg-green-100 cursor-pointer transition-all" style={{ fontSize: "12px", fontWeight: 500 }}>
                      <BarChart3 className="w-3.5 h-3.5" /> Xem kết quả
                    </button>
                  ) : (
                    <button disabled className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-secondary text-muted-foreground rounded-xl cursor-not-allowed" style={{ fontSize: "12px" }}>
                      <Lock className="w-3.5 h-3.5" /> Đã nộp
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <ClipboardCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground" style={{ fontSize: "15px", fontWeight: 500 }}>Không tìm thấy đề thi</p>
          <p className="text-muted-foreground/70 mt-1" style={{ fontSize: "13px" }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}

      </>}

      {/* ── EXAM PREVIEW MODAL ── */}
      {previewExam && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewExam(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#990803] to-[#7a0602] flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 600 }}>{previewExam.title}</h2>
                    <p className="text-gray-400" style={{ fontSize: "12px" }}>{previewExam.courseName}</p>
                  </div>
                </div>
                <button onClick={() => setPreviewExam(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                {(() => { const t = EXAM_TYPE_CONFIG[previewExam.type]; return <span className="px-3 py-1 rounded-full" style={{ fontSize: "11px", fontWeight: 600, color: t.color, background: t.bg }}>{t.icon} {t.label}</span>; })()}
                {(() => { const d = DIFFICULTY_CONFIG[previewExam.difficulty]; return <span className="px-3 py-1 rounded-full" style={{ fontSize: "11px", fontWeight: 600, color: d.color, background: d.bg }}>{"★".repeat(d.stars)} {d.label}</span>; })()}
                {previewExam.proctoringEnabled && <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-600" style={{ fontSize: "11px", fontWeight: 600 }}><ShieldCheck className="w-3 h-3" /> Giám sát trực tuyến</span>}
              </div>

              <p className="text-gray-600" style={{ fontSize: "13px", lineHeight: 1.7 }}>{previewExam.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Số câu", value: previewExam.totalQuestions, icon: Hash },
                  { label: "Thời gian", value: previewExam.duration > 0 ? `${previewExam.duration} phút` : "Không giới hạn", icon: Clock },
                  { label: "Tổng điểm", value: previewExam.totalPoints, icon: Target },
                  { label: "Điểm đạt", value: `${previewExam.passingScore}%`, icon: Award },
                ].map(i => (
                  <div key={i.label} className="p-3 bg-gray-50 rounded-xl text-center">
                    <i.icon className="w-4 h-4 text-[#990803] mx-auto mb-1" />
                    <p className="text-gray-800" style={{ fontSize: "16px", fontWeight: 700 }}>{i.value}</p>
                    <p className="text-gray-400" style={{ fontSize: "10px" }}>{i.label}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-gray-700 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Cấu trúc đề thi</h4>
                <div className="space-y-2">
                  {previewExam.sections.map((section, sIdx) => (
                    <div key={section.id} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-[#990803] text-white flex items-center justify-center" style={{ fontSize: "12px", fontWeight: 700 }}>{sIdx + 1}</div>
                      <div className="flex-1">
                        <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>{section.title}</p>
                        {section.description && <p className="text-gray-400" style={{ fontSize: "11px" }}>{section.description}</p>}
                      </div>
                      <span className="text-gray-400" style={{ fontSize: "11px" }}>{section.questions.length} câu</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-gray-700 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Hướng dẫn</h4>
                <div className="space-y-1.5">
                  {previewExam.instructions.map((inst, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#c8a84e] mt-0.5 shrink-0" />
                      <p className="text-gray-500" style={{ fontSize: "12px", lineHeight: 1.5 }}>{inst}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Quay lại câu trước", enabled: previewExam.allowBacktrack, icon: RotateCcw },
                  { label: "Máy tính", enabled: previewExam.allowCalculator, icon: Hash },
                  { label: "Ghi chú nháp", enabled: previewExam.allowNotepad, icon: FileText },
                  { label: "Webcam bắt buộc", enabled: previewExam.webcamRequired, icon: Eye },
                  { label: "Anti-cheat", enabled: previewExam.antiCheat, icon: Shield },
                  { label: "Xem giải thích", enabled: previewExam.showExplanation, icon: BookOpen },
                ].map(f => (
                  <div key={f.label} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${f.enabled ? "bg-green-50" : "bg-gray-50"}`}>
                    {f.enabled ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-gray-300" />}
                    <span className={f.enabled ? "text-green-700" : "text-gray-400"} style={{ fontSize: "11px" }}>{f.label}</span>
                  </div>
                ))}
              </div>

              {previewExam.attemptsUsed > 0 && (
                <div>
                  <h4 className="text-gray-700 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Lịch sử thi</h4>
                  <div className="space-y-2">
                    {MOCK_ATTEMPTS.filter(a => a.examId === previewExam.id).map((attempt, aIdx) => (
                      <div key={attempt.id} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${attempt.passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                        <span className={attempt.passed ? "text-green-600" : "text-red-500"} style={{ fontSize: "11px", fontWeight: 600 }}>Lần {aIdx + 1}</span>
                        <span className={attempt.passed ? "text-green-700" : "text-red-600"} style={{ fontSize: "16px", fontWeight: 800 }}>{attempt.percentage}%</span>
                        <span className="text-gray-400 ml-auto" style={{ fontSize: "10px" }}>{new Date(attempt.startedAt).toLocaleDateString("vi-VN")} • {Math.round(attempt.timeSpent / 60)} phút</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 rounded-b-2xl flex justify-between">
              <button onClick={() => setPreviewExam(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer" style={{ fontSize: "14px" }}>Đóng</button>
              {(previewExam.status === "not_started" || previewExam.status === "in_progress" || (previewExam.status === "failed" && previewExam.attemptsUsed < previewExam.maxAttempts)) && (
                <button onClick={() => handleStartExam(previewExam)} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#990803] to-[#7a0602] text-white rounded-xl hover:shadow-lg hover:shadow-[#990803]/20 cursor-pointer transition-all" style={{ fontSize: "14px", fontWeight: 600 }}>
                  <PlayCircle className="w-4 h-4" />
                  {previewExam.status === "in_progress" ? "Tiếp tục thi" : previewExam.status === "failed" ? "Thi lại" : "Bắt đầu thi"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── EXAM CREATOR MODAL ── */}
      {showCreator && (
        <ExamCreator
          onClose={() => setShowCreator(false)}
          onSave={(exam) => {
            setShowCreator(false);
          }}
        />
      )}
    </div>
  );
}