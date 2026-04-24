import { useState, useMemo } from "react";
import {
  Clock, Trophy, XCircle, CheckCircle2, Target, BarChart3, Brain,
  TrendingUp, ChevronDown, ChevronRight, Award, Star, Calendar,
  Eye, Flag, Hash, ArrowUpDown, Users, Sparkles, Zap,
  RotateCcw, Filter, Search, BookOpen, AlertCircle, Timer,
} from "lucide-react";
import type { Exam, ExamAttempt, ExamQuestion } from "./types";
import { MOCK_EXAMS, MOCK_ATTEMPTS, QUESTION_BANK, EXAM_TYPE_CONFIG, DIFFICULTY_CONFIG, getExamQuestions } from "./types";

// ── Mock extended attempts for better visualization ──
const EXTENDED_ATTEMPTS: ExamAttempt[] = [
  ...MOCK_ATTEMPTS,
  {
    id: "ATT004", examId: "EX001", startedAt: "2026-03-12T09:30:00", completedAt: "2026-03-12T10:15:00",
    score: 42, totalPoints: 55, percentage: 76, passed: true, timeSpent: 2700,
    answers: {}, flaggedQuestions: ["EQ008", "EQ011"], confidenceLevels: { EQ001: 3, EQ002: 2, EQ008: 1 }, tabSwitches: 0,
    questionTimes: { EQ001: 50, EQ002: 85, EQ003: 20, EQ009: 25, EQ010: 55, EQ012: 50, EQ015: 22, EQ017: 40, EQ019: 48, EQ020: 28, EQ004: 70, EQ005: 130, EQ006: 105, EQ007: 180, EQ013: 80, EQ014: 55, EQ016: 160, EQ018: 65, EQ008: 300, EQ011: 200 },
  },
  {
    id: "ATT005", examId: "EX004", startedAt: "2026-03-10T14:00:00", completedAt: "2026-03-10T14:22:00",
    score: 9, totalPoints: 12, percentage: 75, passed: true, timeSpent: 1320,
    answers: {}, flaggedQuestions: [], confidenceLevels: {}, tabSwitches: 0,
    questionTimes: { EQ010: 65, EQ015: 30, EQ003: 25, EQ017: 40, EQ020: 35, EQ001: 55, EQ009: 30, EQ012: 60 },
  },
  {
    id: "ATT006", examId: "EX006", startedAt: "2026-03-09T16:00:00", completedAt: "2026-03-09T16:18:00",
    score: 11, totalPoints: 13, percentage: 88, passed: true, timeSpent: 1080,
    answers: {}, flaggedQuestions: [], confidenceLevels: {}, tabSwitches: 0,
    questionTimes: { EQ006: 110, EQ014: 65, EQ018: 70, EQ004: 85, EQ016: 150 },
  },
  {
    id: "ATT007", examId: "EX006", startedAt: "2026-03-07T10:00:00", completedAt: "2026-03-07T10:20:00",
    score: 9, totalPoints: 13, percentage: 69, passed: true, timeSpent: 1200,
    answers: {}, flaggedQuestions: ["EQ016"], confidenceLevels: {}, tabSwitches: 0,
    questionTimes: { EQ006: 120, EQ014: 70, EQ018: 80, EQ004: 95, EQ016: 180 },
  },
  {
    id: "ATT008", examId: "EX006", startedAt: "2026-03-04T09:00:00", completedAt: "2026-03-04T09:22:00",
    score: 7, totalPoints: 13, percentage: 54, passed: false, timeSpent: 1320,
    answers: {}, flaggedQuestions: ["EQ006", "EQ016"], confidenceLevels: {}, tabSwitches: 1,
    questionTimes: { EQ006: 140, EQ014: 80, EQ018: 90, EQ004: 100, EQ016: 200 },
  },
];

// ── Progress SVG Chart ──
function ProgressChart({ attempts }: { attempts: ExamAttempt[] }) {
  if (attempts.length === 0) return null;
  const w = 400, h = 160, pad = 40;
  const sorted = [...attempts].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
  const xStep = sorted.length > 1 ? (w - pad * 2) / (sorted.length - 1) : 0;
  const points = sorted.map((a, i) => ({
    x: pad + i * xStep,
    y: pad + (1 - a.percentage / 100) * (h - pad * 2),
    ...a,
  }));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      {/* Grid */}
      {[0, 25, 50, 75, 100].map(v => {
        const y = pad + (1 - v / 100) * (h - pad * 2);
        return (
          <g key={v}>
            <line x1={pad} y1={y} x2={w - 10} y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
            <text x={pad - 5} y={y + 3} textAnchor="end" fill="#9ca3af" fontSize="8">{v}%</text>
          </g>
        );
      })}
      {/* Area fill */}
      {points.length > 1 && (
        <path
          d={`M ${points[0].x} ${h - pad} L ${points.map(p => `${p.x} ${p.y}`).join(" L ")} L ${points[points.length - 1].x} ${h - pad} Z`}
          fill="url(#areaGrad)" opacity="0.3"
        />
      )}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#990803" />
          <stop offset="100%" stopColor="#990803" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Line */}
      {points.length > 1 && (
        <polyline points={points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#990803" strokeWidth="2.5" strokeLinejoin="round" />
      )}
      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill={p.passed ? "#22c55e" : "#ef4444"} stroke="white" strokeWidth="2.5" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" fill={p.passed ? "#22c55e" : "#ef4444"} fontSize="9" fontWeight="700">{p.percentage}%</text>
          <text x={p.x} y={h - 5} textAnchor="middle" fill="#9ca3af" fontSize="7">
            {new Date(p.startedAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Category Strengths ──
function CategoryStrengths({ attempts }: { attempts: ExamAttempt[] }) {
  // Mock category performance
  const catData = useMemo(() => [
    { category: "Kỹ năng Lãnh đạo", correct: 12, total: 15, pct: 80 },
    { category: "Quản trị Rủi ro", correct: 4, total: 8, pct: 50 },
    { category: "Tài chính", correct: 7, total: 10, pct: 70 },
    { category: "Chuyển đổi số", correct: 5, total: 6, pct: 83 },
    { category: "Quản lý Dự án", correct: 6, total: 9, pct: 67 },
    { category: "Kỹ năng Mềm", correct: 3, total: 4, pct: 75 },
    { category: "ESG", correct: 2, total: 4, pct: 50 },
    { category: "An toàn Lao động", correct: 5, total: 5, pct: 100 },
  ], []);

  return (
    <div className="space-y-2.5">
      {catData.map(c => (
        <div key={c.category}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-600 truncate" style={{ fontSize: "11px" }}>{c.category}</span>
            <span style={{ fontSize: "11px", fontWeight: 600, color: c.pct >= 70 ? "#22c55e" : c.pct >= 50 ? "#f59e0b" : "#ef4444" }}>
              {c.correct}/{c.total} ({c.pct}%)
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{
              width: `${c.pct}%`,
              background: c.pct >= 70 ? "linear-gradient(90deg, #22c55e, #16a34a)" : c.pct >= 50 ? "linear-gradient(90deg, #f59e0b, #d97706)" : "linear-gradient(90deg, #ef4444, #dc2626)",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExamHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterResult, setFilterResult] = useState<"all" | "passed" | "failed">("all");
  const [filterExam, setFilterExam] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");
  const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);
  const [selectedExamForChart, setSelectedExamForChart] = useState<string | null>(null);

  // Group attempts by exam
  const examGroups = useMemo(() => {
    const groups: Record<string, { exam: Exam; attempts: ExamAttempt[] }> = {};
    EXTENDED_ATTEMPTS.forEach(a => {
      const exam = MOCK_EXAMS.find(e => e.id === a.examId);
      if (!exam) return;
      if (!groups[a.examId]) groups[a.examId] = { exam, attempts: [] };
      groups[a.examId].attempts.push(a);
    });
    // Sort attempts by date
    Object.values(groups).forEach(g => g.attempts.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()));
    return groups;
  }, []);

  // Filtered and sorted attempts
  const filteredAttempts = useMemo(() => {
    let list = [...EXTENDED_ATTEMPTS];
    if (filterResult === "passed") list = list.filter(a => a.passed);
    if (filterResult === "failed") list = list.filter(a => !a.passed);
    if (filterExam !== "all") list = list.filter(a => a.examId === filterExam);
    if (searchQuery) {
      list = list.filter(a => {
        const exam = MOCK_EXAMS.find(e => e.id === a.examId);
        return exam?.title.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    if (sortBy === "date") list.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    else list.sort((a, b) => b.percentage - a.percentage);
    return list;
  }, [filterResult, filterExam, searchQuery, sortBy]);

  // Overall stats
  const stats = useMemo(() => {
    const total = EXTENDED_ATTEMPTS.length;
    const passed = EXTENDED_ATTEMPTS.filter(a => a.passed).length;
    const avgScore = total > 0 ? Math.round(EXTENDED_ATTEMPTS.reduce((s, a) => s + a.percentage, 0) / total) : 0;
    const totalTime = EXTENDED_ATTEMPTS.reduce((s, a) => s + a.timeSpent, 0);
    const bestScore = Math.max(...EXTENDED_ATTEMPTS.map(a => a.percentage));
    const streak = (() => {
      let s = 0;
      const sorted = [...EXTENDED_ATTEMPTS].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
      for (const a of sorted) { if (a.passed) s++; else break; }
      return s;
    })();
    return { total, passed, failed: total - passed, avgScore, totalTime, bestScore, streak };
  }, []);

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}p`;
    return `${m}p`;
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const fmtDateTime = (d: string) => new Date(d).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  // Chart data for selected exam or all
  const chartAttempts = useMemo(() => {
    if (selectedExamForChart) return EXTENDED_ATTEMPTS.filter(a => a.examId === selectedExamForChart);
    return EXTENDED_ATTEMPTS;
  }, [selectedExamForChart]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-gray-800 flex items-center gap-2" style={{ fontSize: "16px", fontWeight: 600 }}>
          <Clock className="w-5 h-5 text-[#990803]" /> Lịch sử Thi
        </h2>
        <p className="text-gray-400" style={{ fontSize: "12px" }}>Theo dõi tiến trình & cải thiện kết quả qua các lần thi</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Tổng lượt thi", value: stats.total, icon: Hash, color: "#990803" },
          { label: "Đạt", value: stats.passed, icon: Trophy, color: "#22c55e" },
          { label: "Chưa đạt", value: stats.failed, icon: XCircle, color: "#ef4444" },
          { label: "Điểm TB", value: `${stats.avgScore}%`, icon: Target, color: "#c8a84e" },
          { label: "Điểm cao nhất", value: `${stats.bestScore}%`, icon: Star, color: "#8b5cf6" },
          { label: "Chuỗi đạt", value: `${stats.streak}🔥`, icon: Zap, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3.5 hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110" style={{ background: `${s.color}10` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-gray-800" style={{ fontSize: "18px", fontWeight: 800 }}>{s.value}</p>
            <p className="text-gray-400" style={{ fontSize: "10px" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress chart + Category strengths */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-800 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
              <TrendingUp className="w-4 h-4 text-[#990803]" /> Tiến trình điểm số
            </h3>
            <select value={selectedExamForChart || ""} onChange={e => setSelectedExamForChart(e.target.value || null)}
              className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer" style={{ fontSize: "11px" }}>
              <option value="">Tất cả đề thi</option>
              {Object.entries(examGroups).map(([id, g]) => (
                <option key={id} value={id}>{g.exam.title.substring(0, 40)}</option>
              ))}
            </select>
          </div>
          <ProgressChart attempts={chartAttempts} />
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-gray-400" style={{ fontSize: "10px" }}>Đạt</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-gray-400" style={{ fontSize: "10px" }}>Chưa đạt</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Brain className="w-4 h-4 text-[#990803]" /> Năng lực theo Chủ đề
          </h3>
          <CategoryStrengths attempts={EXTENDED_ATTEMPTS} />
        </div>
      </div>

      {/* Exam summary cards */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
          <BookOpen className="w-4 h-4 text-[#990803]" /> Tổng kết theo Đề thi
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(examGroups).map(([examId, { exam, attempts }]) => {
            const best = Math.max(...attempts.map(a => a.percentage));
            const latest = attempts[0];
            const trend = attempts.length >= 2 ? attempts[0].percentage - attempts[1].percentage : 0;

            return (
              <div key={examId} className="p-4 rounded-xl border border-gray-200 hover:border-[#990803]/20 hover:shadow-md transition-all group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full" style={{
                    fontSize: "9px", fontWeight: 600,
                    color: EXAM_TYPE_CONFIG[exam.type].color,
                    background: EXAM_TYPE_CONFIG[exam.type].bg,
                  }}>
                    {EXAM_TYPE_CONFIG[exam.type].icon} {EXAM_TYPE_CONFIG[exam.type].label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full ${latest.passed ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
                    style={{ fontSize: "9px", fontWeight: 600 }}>
                    {latest.passed ? "✓ Đạt" : "✗ Chưa đạt"}
                  </span>
                </div>
                <h4 className="text-gray-800 mb-3 group-hover:text-[#990803] transition-colors truncate" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {exam.title}
                </h4>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-gray-700" style={{ fontSize: "14px", fontWeight: 700 }}>{attempts.length}</p>
                    <p className="text-gray-400" style={{ fontSize: "9px" }}>Lần thi</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-[#990803]" style={{ fontSize: "14px", fontWeight: 700 }}>{best}%</p>
                    <p className="text-gray-400" style={{ fontSize: "9px" }}>Cao nhất</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className={trend >= 0 ? "text-green-600" : "text-red-500"} style={{ fontSize: "14px", fontWeight: 700 }}>
                      {trend >= 0 ? "+" : ""}{trend}%
                    </p>
                    <p className="text-gray-400" style={{ fontSize: "9px" }}>Xu hướng</p>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${best}%`,
                      background: best >= exam.passingScore ? "linear-gradient(90deg, #22c55e, #16a34a)" : "linear-gradient(90deg, #ef4444, #dc2626)",
                    }} />
                  </div>
                  <span className="text-gray-400" style={{ fontSize: "9px" }}>Chuẩn: {exam.passingScore}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed attempt list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-gray-800 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
              <BarChart3 className="w-4 h-4 text-[#c8a84e]" /> Chi tiết Lượt thi
            </h3>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#990803]/20"
                  style={{ fontSize: "11px" }} placeholder="Tìm kiếm..." />
              </div>
              <select value={filterResult} onChange={e => setFilterResult(e.target.value as any)}
                className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer" style={{ fontSize: "11px" }}>
                <option value="all">Tất cả</option>
                <option value="passed">Đạt</option>
                <option value="failed">Chưa đạt</option>
              </select>
              <select value={filterExam} onChange={e => setFilterExam(e.target.value)}
                className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer" style={{ fontSize: "11px" }}>
                <option value="all">Tất cả đề</option>
                {MOCK_EXAMS.map(e => <option key={e.id} value={e.id}>{e.title.substring(0, 30)}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer" style={{ fontSize: "11px" }}>
                <option value="date">Mới nhất</option>
                <option value="score">Điểm cao</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {filteredAttempts.map(attempt => {
            const exam = MOCK_EXAMS.find(e => e.id === attempt.examId);
            if (!exam) return null;
            const isExpanded = expandedAttempt === attempt.id;
            const attemptNum = EXTENDED_ATTEMPTS.filter(a => a.examId === attempt.examId)
              .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
              .findIndex(a => a.id === attempt.id) + 1;

            return (
              <div key={attempt.id} className="hover:bg-gray-50/50 transition-colors">
                <div className="px-5 py-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedAttempt(isExpanded ? null : attempt.id)}>
                  {/* Score circle */}
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                    attempt.passed ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"
                  }`}>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: attempt.passed ? "#22c55e" : "#ef4444" }}>
                      {attempt.percentage}%
                    </span>
                    <span style={{ fontSize: "8px", color: attempt.passed ? "#22c55e" : "#ef4444" }}>
                      {attempt.passed ? "ĐẠT" : "TRƯỢT"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-gray-800 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{exam.title}</h4>
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 shrink-0" style={{ fontSize: "9px", fontWeight: 600 }}>
                        Lần {attemptNum}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: "11px" }}>
                        <Calendar className="w-3 h-3" /> {fmtDateTime(attempt.startedAt)}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: "11px" }}>
                        <Clock className="w-3 h-3" /> {fmtTime(attempt.timeSpent)}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: "11px" }}>
                        <Target className="w-3 h-3" /> {attempt.score}/{attempt.totalPoints} điểm
                      </span>
                      {attempt.flaggedQuestions.length > 0 && (
                        <span className="flex items-center gap-1 text-amber-500" style={{ fontSize: "11px" }}>
                          <Flag className="w-3 h-3" /> {attempt.flaggedQuestions.length} flagged
                        </span>
                      )}
                      {attempt.tabSwitches > 0 && (
                        <span className="flex items-center gap-1 text-red-400" style={{ fontSize: "11px" }}>
                          <AlertCircle className="w-3 h-3" /> {attempt.tabSwitches} tab switch
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="w-24 shrink-0 hidden sm:block">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${attempt.percentage}%`,
                        background: attempt.passed ? "linear-gradient(90deg, #22c55e, #16a34a)" : "linear-gradient(90deg, #ef4444, #dc2626)",
                      }} />
                    </div>
                    <p className="text-gray-300 text-center mt-1" style={{ fontSize: "9px" }}>Chuẩn: {exam.passingScore}%</p>
                  </div>

                  {/* Expand icon */}
                  <div className="shrink-0">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                      {/* Time per question */}
                      <div>
                        <h5 className="text-gray-600 mb-2 flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
                          <Timer className="w-3.5 h-3.5 text-[#990803]" /> Thời gian theo câu hỏi
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(attempt.questionTimes).map(([qId, time]) => {
                            const q = QUESTION_BANK.find(x => x.id === qId);
                            const isSlow = time > (q?.timeEstimate || 60) * 1.5;
                            return (
                              <div key={qId} className={`px-2.5 py-1.5 rounded-lg ${isSlow ? "bg-amber-50 border border-amber-200" : "bg-white border border-gray-200"}`}>
                                <span className="text-gray-500" style={{ fontSize: "9px" }}>{qId}</span>
                                <span className={`ml-1 ${isSlow ? "text-amber-600" : "text-gray-700"}`} style={{ fontSize: "10px", fontWeight: 600 }}>{time}s</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Confidence levels */}
                      {Object.keys(attempt.confidenceLevels).length > 0 && (
                        <div>
                          <h5 className="text-gray-600 mb-2 flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
                            <Brain className="w-3.5 h-3.5 text-[#990803]" /> Mức độ tự tin
                          </h5>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(attempt.confidenceLevels).map(([qId, level]) => (
                              <div key={qId} className="flex items-center gap-1 px-2.5 py-1.5 bg-white rounded-lg border border-gray-200">
                                <span className="text-gray-500" style={{ fontSize: "9px" }}>{qId}</span>
                                <span style={{ fontSize: "10px", color: level >= 3 ? "#22c55e" : level >= 2 ? "#f59e0b" : "#ef4444" }}>
                                  {"★".repeat(level)}{"☆".repeat(3 - level)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Flagged questions */}
                      {attempt.flaggedQuestions.length > 0 && (
                        <div>
                          <h5 className="text-gray-600 mb-2 flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
                            <Flag className="w-3.5 h-3.5 text-amber-500" /> Câu hỏi đã đánh dấu
                          </h5>
                          <div className="flex flex-wrap gap-1.5">
                            {attempt.flaggedQuestions.map(qId => {
                              const q = QUESTION_BANK.find(x => x.id === qId);
                              return (
                                <div key={qId} className="px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                                  <span className="text-amber-700" style={{ fontSize: "10px", fontWeight: 500 }}>
                                    {qId}: {q?.question.substring(0, 50)}...
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Summary row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-200">
                        {[
                          { label: "Điểm", value: `${attempt.score}/${attempt.totalPoints}`, color: attempt.passed ? "#22c55e" : "#ef4444" },
                          { label: "Thời gian", value: fmtTime(attempt.timeSpent), color: "#3b82f6" },
                          { label: "Tab switches", value: `${attempt.tabSwitches}`, color: attempt.tabSwitches > 0 ? "#ef4444" : "#22c55e" },
                          { label: "Flagged", value: `${attempt.flaggedQuestions.length}`, color: "#f59e0b" },
                        ].map(s => (
                          <div key={s.label} className="text-center p-2 bg-white rounded-lg">
                            <p style={{ fontSize: "14px", fontWeight: 700, color: s.color }}>{s.value}</p>
                            <p className="text-gray-400" style={{ fontSize: "9px" }}>{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredAttempts.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500" style={{ fontSize: "14px", fontWeight: 500 }}>Chưa có lượt thi nào</p>
              <p className="text-gray-400 mt-1" style={{ fontSize: "12px" }}>Bắt đầu thi để xem lịch sử tại đây</p>
            </div>
          )}
        </div>
      </div>

      {/* Study recommendations */}
      <div className="bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/5 border border-[#990803]/10 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-gray-800 mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>Gợi ý Ôn tập</h3>
            <div className="space-y-1.5">
              {[
                "📚 Chủ đề 'Quản trị Rủi ro' cần cải thiện (50% accuracy) — Ôn lại module Risk Assessment & Basel III.",
                "⏱️ Câu hỏi Case Study chiếm >40% thời gian — Luyện thêm phân tích tình huống.",
                "🎯 Điểm đang có xu hướng tăng (+12% so với lần đầu) — Tiếp tục duy trì nhịp ôn tập.",
                "🔁 Nên thi lại 'An toàn Lao động' (75% < chuẩn 80%) — Còn 3 lần thi.",
              ].map((tip, i) => (
                <p key={i} className="text-gray-600" style={{ fontSize: "12px", lineHeight: 1.6 }}>{tip}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
