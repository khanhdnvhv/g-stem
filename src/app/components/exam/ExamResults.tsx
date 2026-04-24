import { useState, useMemo } from "react";
import {
  Trophy, XCircle, CheckCircle2, Clock, Target, BarChart3, Brain, TrendingUp,
  ChevronDown, ChevronRight, Lightbulb, Award, Star, Zap, ArrowLeft,
  Download, Share2, RotateCcw, Eye, Flag, Shield, PieChart, Users,
  Sparkles, BookOpen, Hash, ArrowUpDown, MessageSquare,
} from "lucide-react";
import type { Exam, ExamQuestion, DifficultyLevel, ExamAttempt } from "./types";
import { DIFFICULTY_CONFIG, QUESTION_TYPE_CONFIG, QUESTION_BANK, getExamQuestions } from "./types";
import { gradeEssay, AIGradingPanel } from "./AIGrading";

interface ExamResultsProps {
  exam: Exam;
  answers: Record<string, any>;
  timeSpent: number;
  flagged: string[];
  confidence: Record<string, number>;
  tabSwitches: number;
  questionTimes: Record<string, number>;
  onRetry: () => void;
  onBack: () => void;
}

export function ExamResults({ exam, answers, timeSpent, flagged, confidence, tabSwitches, questionTimes, onRetry, onBack }: ExamResultsProps) {
  const questions = useMemo(() => getExamQuestions(exam), [exam]);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedQ, setExpandedQ] = useState<Set<string>>(new Set());
  const [reviewFilter, setReviewFilter] = useState<"all" | "correct" | "wrong" | "flagged">("all");

  // ── Calculate Score ──
  const results = useMemo(() => {
    let correct = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const questionResults: { q: ExamQuestion; correct: boolean; userAnswer: any; earnedPts: number }[] = [];

    questions.forEach(q => {
      totalPoints += q.points;
      let isCorrect = false;

      if (q.type === "single_choice" || q.type === "true_false") {
        const ans = answers[q.id];
        isCorrect = Array.isArray(ans) && ans.length === 1 && q.correctAnswers?.includes(ans[0]) || false;
      } else if (q.type === "multiple_choice") {
        const ans: number[] = answers[q.id] || [];
        isCorrect = q.correctAnswers ? ans.length === q.correctAnswers.length && q.correctAnswers.every(a => ans.includes(a)) : false;
      } else if (q.type === "fill_blank" && q.blanks) {
        const ans = answers[q.id] || {};
        isCorrect = q.blanks.every(b => {
          const userVal = (ans[b.id] || "").toLowerCase().trim();
          return userVal === b.answer.toLowerCase() || (b.alternatives || []).some(alt => alt.toLowerCase() === userVal);
        });
      } else if (q.type === "ordering" && q.correctOrder) {
        const ans: number[] = answers[q.id] || [];
        isCorrect = ans.length === q.correctOrder.length && ans.every((v, i) => v === q.correctOrder![i]);
      } else if (q.type === "matching" && q.matchingPairs) {
        const ans = answers[q.id] || {};
        isCorrect = q.matchingPairs.every(p => ans[p.id] === p.id);
      } else if (q.type === "matrix" && q.matrixCorrect) {
        const ans = answers[q.id] || {};
        isCorrect = Object.entries(q.matrixCorrect).every(([k, v]) => ans[k] === v);
      } else if (q.type === "case_study" && q.subQuestions) {
        // Partial scoring for case study
        let subEarned = 0;
        q.subQuestions.forEach(sq => {
          const subAns = (answers[q.id] || {})[sq.id];
          if (sq.type === "single_choice" && sq.correctAnswers) {
            if (subAns === sq.correctAnswers[0]) subEarned += sq.points;
          } else if (sq.type === "multiple_choice" && sq.correctAnswers) {
            const a = subAns || [];
            if (Array.isArray(a) && a.length === sq.correctAnswers.length && sq.correctAnswers.every((ca: number) => a.includes(ca))) subEarned += sq.points;
          } else if (sq.type === "short_answer" && subAns && typeof subAns === "string" && subAns.trim().length > 20) {
            subEarned += Math.round(sq.points * 0.7); // Partial credit for essay
          }
        });
        const pts = subEarned;
        isCorrect = pts >= q.points * 0.7;
        questionResults.push({ q, correct: isCorrect, userAnswer: answers[q.id], earnedPts: pts });
        if (isCorrect) correct++;
        earnedPoints += pts;
        return;
      } else if (q.type === "short_answer") {
        // Auto partial credit for essay
        const ans = (answers[q.id] || "").trim();
        const pts = ans.length > 100 ? Math.round(q.points * 0.7) : ans.length > 20 ? Math.round(q.points * 0.4) : 0;
        questionResults.push({ q, correct: pts > q.points * 0.5, userAnswer: ans, earnedPts: pts });
        if (pts > q.points * 0.5) correct++;
        earnedPoints += pts;
        return;
      }

      const pts = isCorrect ? q.points : 0;
      if (isCorrect) correct++;
      earnedPoints += pts;
      questionResults.push({ q, correct: isCorrect, userAnswer: answers[q.id], earnedPts: pts });
    });

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= exam.passingScore;

    return { correct, total: questions.length, earnedPoints, totalPoints, percentage, passed, questionResults };
  }, [questions, answers, exam.passingScore]);

  // ── Category breakdown ──
  const categoryStats = useMemo(() => {
    const map: Record<string, { total: number; correct: number; points: number; earned: number }> = {};
    results.questionResults.forEach(r => {
      const cat = r.q.category;
      if (!map[cat]) map[cat] = { total: 0, correct: 0, points: 0, earned: 0 };
      map[cat].total++;
      if (r.correct) map[cat].correct++;
      map[cat].points += r.q.points;
      map[cat].earned += r.earnedPts;
    });
    return Object.entries(map).map(([cat, stats]) => ({ category: cat, ...stats, pct: Math.round((stats.earned / stats.points) * 100) }));
  }, [results]);

  // ── Difficulty breakdown ──
  const diffStats = useMemo(() => {
    const map: Record<string, { total: number; correct: number }> = {};
    results.questionResults.forEach(r => {
      const d = r.q.difficulty;
      if (!map[d]) map[d] = { total: 0, correct: 0 };
      map[d].total++;
      if (r.correct) map[d].correct++;
    });
    return map;
  }, [results]);

  // ── Time analysis ──
  const avgTimePerQ = Math.round(timeSpent / questions.length);
  const slowestQ = useMemo(() => {
    let max = 0; let maxQ: ExamQuestion | null = null;
    Object.entries(questionTimes).forEach(([id, t]) => { if (t > max) { max = t; maxQ = QUESTION_BANK.find(q => q.id === id) || null; } });
    return { question: maxQ, time: max };
  }, [questionTimes]);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    if (m > 0) return `${m}p ${sec}s`;
    return `${sec}s`;
  };

  // ── Percentile (mock) ──
  const percentile = results.percentage >= 90 ? 95 : results.percentage >= 80 ? 82 : results.percentage >= 70 ? 65 : results.percentage >= 60 ? 45 : 25;

  // ── Filtered questions ──
  const filteredResults = results.questionResults.filter(r => {
    if (reviewFilter === "correct") return r.correct;
    if (reviewFilter === "wrong") return !r.correct;
    if (reviewFilter === "flagged") return flagged.includes(r.q.id);
    return true;
  });

  const toggleQ = (id: string) => setExpandedQ(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  // ── Radar data for SVG ──
  const radarCategories = categoryStats.slice(0, 6);
  const radarPoints = radarCategories.map((c, i) => {
    const angle = (Math.PI * 2 * i) / radarCategories.length - Math.PI / 2;
    const r = (c.pct / 100) * 80;
    return { x: 100 + r * Math.cos(angle), y: 100 + r * Math.sin(angle) };
  });
  const radarPath = radarPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-gray-500 hover:text-[#990803] transition-colors cursor-pointer" style={{ fontSize: "13px" }}>
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
      </button>

      {/* ── HERO SCORE CARD ── */}
      <div className={`relative overflow-hidden rounded-2xl border-2 p-8 ${results.passed ? "border-green-300 bg-gradient-to-br from-green-50 via-white to-emerald-50" : "border-red-300 bg-gradient-to-br from-red-50 via-white to-orange-50"}`}>
        {/* Decorative circles */}
        <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full ${results.passed ? "bg-green-100/30" : "bg-red-100/30"}`} />
        <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full ${results.passed ? "bg-emerald-100/20" : "bg-orange-100/20"}`} />

        <div className="relative flex flex-col lg:flex-row items-center gap-8">
          {/* Score circle */}
          <div className="relative">
            <svg className="w-40 h-40" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="70" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle cx="80" cy="80" r="70" fill="none"
                stroke={results.passed ? "#22c55e" : "#ef4444"}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${results.percentage * 4.4} 440`}
                className="-rotate-90 origin-center"
                style={{ transition: "stroke-dasharray 1.5s ease-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={results.passed ? "text-green-600" : "text-red-500"} style={{ fontSize: "40px", fontWeight: 800 }}>{results.percentage}%</span>
              <span className="text-gray-400" style={{ fontSize: "11px" }}>{results.earnedPoints}/{results.totalPoints} điểm</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
              {results.passed ? (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-green-100 rounded-full">
                  <Trophy className="w-5 h-5 text-green-600" />
                  <span className="text-green-700" style={{ fontSize: "15px", fontWeight: 700 }}>ĐẠT — Xuất sắc!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-red-100 rounded-full">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-600" style={{ fontSize: "15px", fontWeight: 700 }}>CHƯA ĐẠT</span>
                </div>
              )}
            </div>
            <h2 className="text-gray-800 mb-1" style={{ fontSize: "20px", fontWeight: 700 }}>{exam.title}</h2>
            <p className="text-gray-400 mb-4" style={{ fontSize: "13px" }}>{exam.courseName}</p>

            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: CheckCircle2, label: "Đúng", value: `${results.correct}/${results.total}`, color: "#22c55e" },
                { icon: Clock, label: "Thời gian", value: fmtTime(timeSpent), color: "#3b82f6" },
                { icon: Target, label: "Điểm chuẩn", value: `${exam.passingScore}%`, color: "#f59e0b" },
                { icon: Users, label: "Percentile", value: `Top ${100 - percentile}%`, color: "#8b5cf6" },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-xl border border-gray-100">
                  <s.icon className="w-4 h-4 shrink-0" style={{ color: s.color }} />
                  <div>
                    <p className="text-gray-800" style={{ fontSize: "14px", fontWeight: 700 }}>{s.value}</p>
                    <p className="text-gray-400" style={{ fontSize: "10px" }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ANALYTICS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-[#990803]" />
            <h3 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>Phân tích theo Danh mục</h3>
          </div>
          <div className="space-y-3">
            {categoryStats.map(cat => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-600" style={{ fontSize: "12px" }}>{cat.category}</span>
                  <span className="text-gray-500" style={{ fontSize: "11px" }}>{cat.correct}/{cat.total} • {cat.pct}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${cat.pct}%`,
                      background: cat.pct >= 80 ? "linear-gradient(90deg, #22c55e, #16a34a)" : cat.pct >= 60 ? "linear-gradient(90deg, #f59e0b, #d97706)" : "linear-gradient(90deg, #ef4444, #dc2626)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#990803]" />
            <h3 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>Biểu đồ Năng lực</h3>
          </div>
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-48 h-48">
              {/* Grid circles */}
              {[20, 40, 60, 80].map(r => (
                <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4 4" />
              ))}
              {/* Axis lines */}
              {radarCategories.map((_, i) => {
                const angle = (Math.PI * 2 * i) / radarCategories.length - Math.PI / 2;
                return <line key={i} x1="100" y1="100" x2={100 + 80 * Math.cos(angle)} y2={100 + 80 * Math.sin(angle)} stroke="#e5e7eb" strokeWidth="0.5" />;
              })}
              {/* Data polygon */}
              {radarPoints.length > 2 && (
                <>
                  <path d={radarPath} fill="#99080320" stroke="#990803" strokeWidth="2" />
                  {radarPoints.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="#990803" />
                  ))}
                </>
              )}
              {/* Labels */}
              {radarCategories.map((c, i) => {
                const angle = (Math.PI * 2 * i) / radarCategories.length - Math.PI / 2;
                const lx = 100 + 95 * Math.cos(angle);
                const ly = 100 + 95 * Math.sin(angle);
                return (
                  <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                    fill="#6b7280" style={{ fontSize: "6px" }}>
                    {c.category.length > 10 ? c.category.slice(0, 10) + "…" : c.category}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-[#c8a84e]" />
            <h3 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>Theo Mức độ Khó</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["easy", "medium", "hard", "expert"] as DifficultyLevel[]).map(d => {
              const dc = DIFFICULTY_CONFIG[d];
              const stat = diffStats[d] || { total: 0, correct: 0 };
              const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
              return (
                <div key={d} className="p-3 rounded-xl border border-gray-100" style={{ background: dc.bg }}>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ color: dc.color, fontSize: "11px", fontWeight: 600 }}>{"★".repeat(dc.stars)} {dc.label}</span>
                    <span style={{ color: dc.color, fontSize: "18px", fontWeight: 800 }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: dc.color, transition: "width 1s" }} />
                  </div>
                  <p className="text-gray-400 mt-1" style={{ fontSize: "10px" }}>{stat.correct}/{stat.total} câu đúng</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Analysis */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#3b82f6]" />
            <h3 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>Phân tích Thời gian</h3>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-blue-600" style={{ fontSize: "20px", fontWeight: 800 }}>{fmtTime(timeSpent)}</p>
                <p className="text-blue-400" style={{ fontSize: "10px" }}>Tổng thời gian</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-blue-600" style={{ fontSize: "20px", fontWeight: 800 }}>{fmtTime(avgTimePerQ)}</p>
                <p className="text-blue-400" style={{ fontSize: "10px" }}>TB mỗi câu</p>
              </div>
            </div>
            {/* Time bar chart */}
            <div className="flex items-end gap-0.5 h-20">
              {questions.map((q, i) => {
                const t = questionTimes[q.id] || 0;
                const maxT = Math.max(...Object.values(questionTimes), 1);
                const h = Math.max(4, (t / maxT) * 100);
                const isCorrect = results.questionResults[i]?.correct;
                return (
                  <div key={q.id} className="flex-1 flex flex-col items-center gap-0.5" title={`Câu ${i + 1}: ${fmtTime(t)}`}>
                    <div className="w-full rounded-t" style={{ height: `${h}%`, background: isCorrect ? "#22c55e" : "#ef4444", minHeight: "3px", transition: "height 0.5s" }} />
                    <span className="text-gray-300" style={{ fontSize: "7px" }}>{i + 1}</span>
                  </div>
                );
              })}
            </div>
            {slowestQ.question && (
              <p className="text-gray-400" style={{ fontSize: "11px" }}>
                ⏱️ Câu lâu nhất: <span className="text-gray-600" style={{ fontWeight: 500 }}>{slowestQ.question.question.slice(0, 40)}...</span> ({fmtTime(slowestQ.time)})
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Proctoring Report ── */}
      {exam.proctoringEnabled && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-green-500" />
            <h3 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>Báo cáo Giám sát</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-3 rounded-xl ${tabSwitches === 0 ? "bg-green-50" : "bg-red-50"}`}>
              <p className={tabSwitches === 0 ? "text-green-600" : "text-red-500"} style={{ fontSize: "20px", fontWeight: 800 }}>{tabSwitches}</p>
              <p className={tabSwitches === 0 ? "text-green-400" : "text-red-400"} style={{ fontSize: "10px" }}>Lần chuyển tab</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <p className="text-green-600" style={{ fontSize: "20px", fontWeight: 800 }}>✓</p>
              <p className="text-green-400" style={{ fontSize: "10px" }}>Webcam hoạt động</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <p className="text-green-600" style={{ fontSize: "20px", fontWeight: 800 }}>0</p>
              <p className="text-green-400" style={{ fontSize: "10px" }}>Phát hiện bất thường</p>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Recommendation ── */}
      <div className="bg-gradient-to-r from-[#990803]/5 via-white to-[#c8a84e]/5 rounded-2xl border border-[#990803]/10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#c8a84e]" />
          <h3 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>Gợi ý cải thiện từ AI</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categoryStats.filter(c => c.pct < 80).slice(0, 4).map(cat => (
            <div key={cat.category} className="flex items-start gap-2.5 p-3 bg-white rounded-xl border border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-[#990803]/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-[#990803]" />
              </div>
              <div>
                <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{cat.category}</p>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>Kết quả: {cat.pct}% — Cần ôn tập thêm {cat.total - cat.correct} chủ đề</p>
              </div>
            </div>
          ))}
          {categoryStats.every(c => c.pct >= 80) && (
            <div className="flex items-center gap-2.5 p-3 bg-green-50 rounded-xl border border-green-100 col-span-2">
              <Award className="w-5 h-5 text-green-500" />
              <p className="text-green-600" style={{ fontSize: "13px", fontWeight: 500 }}>Xuất sắc! Bạn đã nắm vững tất cả các danh mục. Hãy thử thách ở cấp độ cao hơn!</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Question Review ── */}
      {exam.showExplanation && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#990803]" />
              <h3 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>Xem lại Đáp án</h3>
            </div>
            <div className="flex gap-1">
              {(["all", "correct", "wrong", "flagged"] as const).map(f => (
                <button key={f} onClick={() => setReviewFilter(f)}
                  className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${reviewFilter === f ? "bg-[#990803] text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  style={{ fontSize: "11px", fontWeight: 500 }}
                >
                  {f === "all" ? `Tất cả (${results.total})` : f === "correct" ? `Đúng (${results.correct})` : f === "wrong" ? `Sai (${results.total - results.correct})` : `Flag (${flagged.length})`}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {filteredResults.map((r, idx) => {
              const expanded = expandedQ.has(r.q.id);
              const tc = QUESTION_TYPE_CONFIG[r.q.type];
              const dc = DIFFICULTY_CONFIG[r.q.difficulty];
              return (
                <div key={r.q.id} className={`${r.correct ? "" : "bg-red-50/30"}`}>
                  <button onClick={() => toggleQ(r.q.id)} className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50/50 cursor-pointer transition-colors">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${r.correct ? "bg-green-100" : "bg-red-100"}`}>
                      {r.correct ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 truncate" style={{ fontSize: "13px", fontWeight: 500 }}>{r.q.question.slice(0, 80)}{r.q.question.length > 80 ? "..." : ""}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span style={{ fontSize: "9px", color: tc.color, fontWeight: 600 }}>{tc.label}</span>
                        <span style={{ fontSize: "9px", color: dc.color }}>{dc.label}</span>
                        <span className="text-gray-300" style={{ fontSize: "9px" }}>{r.earnedPts}/{r.q.points}đ</span>
                        {flagged.includes(r.q.id) && <Flag className="w-2.5 h-2.5 text-red-400" />}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  {expanded && (
                    <div className="px-5 pb-4 pl-16">
                      {/* Show correct answer */}
                      {r.q.options && (r.q.type === "single_choice" || r.q.type === "multiple_choice" || r.q.type === "true_false") && (
                        <div className="space-y-1.5 mb-3">
                          {r.q.options.map((opt, oIdx) => {
                            const isCorrectAnswer = r.q.correctAnswers?.includes(oIdx);
                            const isUserAnswer = Array.isArray(r.userAnswer) && r.userAnswer.includes(oIdx);
                            return (
                              <div key={oIdx} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                isCorrectAnswer && isUserAnswer ? "bg-green-50 border border-green-200" :
                                isCorrectAnswer ? "bg-green-50 border border-green-200" :
                                isUserAnswer ? "bg-red-50 border border-red-200" :
                                "bg-gray-50"
                              }`}>
                                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                                  isCorrectAnswer ? "bg-green-500" : isUserAnswer ? "bg-red-500" : "bg-gray-200"
                                }`}>
                                  {isCorrectAnswer ? <CheckCircle2 className="w-3 h-3 text-white" /> :
                                   isUserAnswer ? <XCircle className="w-3 h-3 text-white" /> :
                                   <span className="text-gray-400" style={{ fontSize: "9px" }}>{String.fromCharCode(65 + oIdx)}</span>}
                                </div>
                                <span className={`${isCorrectAnswer ? "text-green-700" : isUserAnswer ? "text-red-600" : "text-gray-500"}`} style={{ fontSize: "12px" }}>{opt}</span>
                                {isCorrectAnswer && <span className="ml-auto text-green-500" style={{ fontSize: "9px", fontWeight: 600 }}>✓ Đáp án đúng</span>}
                                {isUserAnswer && !isCorrectAnswer && <span className="ml-auto text-red-400" style={{ fontSize: "9px", fontWeight: 600 }}>✗ Bạn chọn</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {/* Explanation */}
                      {r.q.explanation && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-blue-600" style={{ fontSize: "11px", fontWeight: 600 }}>Giải thích</span>
                          </div>
                          <p className="text-blue-700" style={{ fontSize: "12px", lineHeight: 1.6 }}>{r.q.explanation}</p>
                        </div>
                      )}
                      {/* AI Auto-Grading for essay/short answer */}
                      {r.q.type === "short_answer" && typeof r.userAnswer === "string" && r.userAnswer.trim().length > 0 && (
                        <div className="mt-3">
                          <AIGradingPanel result={gradeEssay(r.userAnswer, r.q.question, r.q.points, r.q.tags, r.q.explanation)} />
                        </div>
                      )}
                      {/* Time & confidence */}
                      <div className="flex items-center gap-4 mt-2">
                        {questionTimes[r.q.id] && (
                          <span className="text-gray-400" style={{ fontSize: "10px" }}>⏱️ {fmtTime(questionTimes[r.q.id])}</span>
                        )}
                        {confidence[r.q.id] && (
                          <span className="text-gray-400" style={{ fontSize: "10px" }}>
                            {["", "😰 Đoán", "🤔 Không chắc", "🙂 Khá chắc", "😊 Rất chắc"][confidence[r.q.id]]}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex items-center justify-center gap-3 pb-6">
        <button onClick={onBack}
          className="px-6 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
          style={{ fontSize: "14px" }}
        >
          Về danh sách
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer"
          style={{ fontSize: "14px" }}
          onClick={() => { import("sonner").then(m => m.toast.success("Đang tải PDF kết quả bài thi...")); }}
        >
          <Download className="w-4 h-4" /> Tải PDF
        </button>
        {!results.passed && exam.attemptsUsed < exam.maxAttempts && (
          <button onClick={onRetry}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#990803] text-white rounded-xl hover:bg-[#7a0602] cursor-pointer transition-colors"
            style={{ fontSize: "14px", fontWeight: 600 }}
          >
            <RotateCcw className="w-4 h-4" /> Thi lại
          </button>
        )}
      </div>
    </div>
  );
}