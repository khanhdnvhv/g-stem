import { useState, useMemo } from "react";
import {
  Award, BookOpen, Clock, CheckCircle, AlertTriangle, FileText,
  TrendingUp, ArrowUp, ArrowDown, ChevronRight, Eye, MessageSquare,
} from "lucide-react";
import {
  MOCK_SUBMISSIONS, STATUS_CONFIG, getLetterGrade, getLetterColor,
  GRADING_COURSES, type GradingSubmission,
} from "./mock-data";
import { toast } from "@/app/lib/toast";

// Simulate learner's own submissions (first 12 from mock data)
function getMySubmissions(): GradingSubmission[] {
  return MOCK_SUBMISSIONS.slice(0, 12).map(s => ({
    ...s,
    studentName: "Lê Hoàng Nam",
    studentId: "E103",
    studentAvatar: "LN",
    subsidiary: "Ngân hàng TMCP An Bình (ABBank)",
    department: "Khối Ngân hàng Bán lẻ",
  }));
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = (score / max) * 100;
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#eab308" : "#dc2626";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span style={{ fontSize: "13px", fontWeight: 700, color, minWidth: "45px", textAlign: "right" }}>
        {score}/{max}
      </span>
    </div>
  );
}

export function LearnerGrades() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState("all");

  const mySubs = useMemo(() => getMySubmissions(), []);

  const filtered = useMemo(() => {
    if (filterCourse === "all") return mySubs;
    return mySubs.filter(s => s.courseId === filterCourse);
  }, [mySubs, filterCourse]);

  // Stats
  const gradedSubs = mySubs.filter(s => s.score !== null);
  const avgScore = gradedSubs.length > 0
    ? Math.round(gradedSubs.reduce((s, v) => s + v.score!, 0) / gradedSubs.length * 10) / 10
    : 0;
  const pendingCount = mySubs.filter(s => s.status === "pending" || s.status === "late").length;
  const passCount = gradedSubs.filter(s => s.score! >= 60).length;
  const passRate = gradedSubs.length > 0 ? Math.round(passCount / gradedSubs.length * 100) : 0;
  const bestScore = gradedSubs.length > 0 ? Math.max(...gradedSubs.map(s => s.score!)) : 0;

  // SVG mini chart — score trend
  const trendData = gradedSubs.slice(0, 8).map(s => s.score!);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Điểm TB", value: avgScore, icon: TrendingUp, color: "#990803", bg: "#990803" },
          { label: "Tỷ lệ Đạt", value: `${passRate}%`, icon: Award, color: "#22c55e", bg: "#22c55e" },
          { label: "Chờ chấm", value: pendingCount, icon: Clock, color: "#f59e0b", bg: "#f59e0b" },
          { label: "Điểm cao nhất", value: bestScore, icon: ArrowUp, color: "#3b82f6", bg: "#3b82f6" },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="rounded-xl p-4 text-white" style={{ background: `linear-gradient(135deg, ${kpi.bg}, ${kpi.bg}dd)` }}>
              <Icon className="w-5 h-5 mb-1.5 opacity-80" />
              <p style={{ fontSize: "22px", fontWeight: 700 }}>{kpi.value}</p>
              <p className="opacity-80" style={{ fontSize: "11px" }}>{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Score Trend Mini Chart */}
      {trendData.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Xu hướng Điểm số của bạn</h3>
          <svg viewBox="0 0 360 100" className="w-full h-24">
            <defs>
              <linearGradient id="learnerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#990803" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#990803" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 0.5, 1].map(r => (
              <line key={r} x1="30" y1={90 - r * 80} x2="350" y2={90 - r * 80} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4,4" />
            ))}
            {(() => {
              const points = trendData.map((v, i) => ({
                x: 30 + (i / (trendData.length - 1)) * 320,
                y: 90 - ((v - 30) / 70) * 80,
              }));
              const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
              const areaD = `${pathD} L ${points[points.length - 1].x} 90 L ${points[0].x} 90 Z`;
              return (
                <>
                  <path d={areaD} fill="url(#learnerGrad)" />
                  <path d={pathD} fill="none" stroke="#990803" strokeWidth="2" strokeLinejoin="round" />
                  {points.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="4" fill="#990803" stroke="white" strokeWidth="2" />
                      <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#990803" fontSize="9" fontWeight="600">{trendData[i]}</text>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center justify-between">
        <select
          value={filterCourse}
          onChange={e => setFilterCourse(e.target.value)}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none"
          style={{ fontSize: "12px" }}
        >
          <option value="all">Tất cả khóa học</option>
          {GRADING_COURSES.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <span className="text-gray-400" style={{ fontSize: "12px" }}>
          {filtered.length} bài nộp • {gradedSubs.length} đã có điểm
        </span>
      </div>

      {/* Submissions List */}
      <div className="space-y-2">
        {filtered.map(sub => {
          const sc = STATUS_CONFIG[sub.status];
          const isExpanded = expandedId === sub.id;
          const letter = sub.percentage !== null ? getLetterGrade(sub.percentage) : null;

          return (
            <div key={sub.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-all">
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : sub.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Course icon */}
                  <div className="w-10 h-10 rounded-lg bg-[#990803]/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-[#990803]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-gray-800" style={{ fontSize: "13.5px", fontWeight: 600 }}>
                        {sub.assignmentTitle}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded-full"
                        style={{ fontSize: "10px", fontWeight: 600, color: sc.color, backgroundColor: sc.bg }}
                      >
                        {sc.label}
                      </span>
                    </div>
                    <p className="text-gray-400" style={{ fontSize: "11.5px" }}>
                      {sub.courseName.length > 40 ? sub.courseName.slice(0, 38) + "..." : sub.courseName}
                    </p>

                    {/* Score bar */}
                    {sub.score !== null && (
                      <div className="mt-2">
                        <ScoreBar score={sub.score} max={sub.maxScore} />
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-2 mt-1.5 text-gray-400" style={{ fontSize: "11px" }}>
                      <span>Nộp: {sub.submittedAt}</span>
                      {sub.gradedAt && (
                        <>
                          <span className="text-gray-300">|</span>
                          <span>Chấm: {sub.gradedAt}</span>
                        </>
                      )}
                      {sub.gradedBy && (
                        <>
                          <span className="text-gray-300">|</span>
                          <span>GV: {sub.gradedBy}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Score badge */}
                  <div className="shrink-0 text-right">
                    {sub.score !== null ? (
                      <div>
                        <span
                          className="inline-block px-2.5 py-1 rounded-lg"
                          style={{
                            fontSize: "18px",
                            fontWeight: 700,
                            color: getLetterColor(letter!),
                            backgroundColor: getLetterColor(letter!) + "15",
                          }}
                        >
                          {letter}
                        </span>
                        <p style={{ fontSize: "11px", color: getLetterColor(letter!), fontWeight: 600, marginTop: "2px" }}>
                          {sub.score}/{sub.maxScore}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-300" style={{ fontSize: "13px" }}>
                        <Clock className="w-5 h-5" />
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 text-gray-300 mt-1 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </div>
              </div>

              {/* Expanded: feedback */}
              {isExpanded && sub.feedback && (
                <div className="px-4 pb-4 pt-0">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#c8a84e]" />
                      <span className="text-gray-600" style={{ fontSize: "12px", fontWeight: 600 }}>Nhận xét của Giảng viên</span>
                    </div>
                    <p className="text-gray-600" style={{ fontSize: "12.5px", lineHeight: 1.6 }}>{sub.feedback}</p>
                  </div>

                  {/* Appeal button if low score */}
                  {sub.score !== null && sub.score < 60 && sub.status === "graded" && (
                    <button
                      className="mt-2 px-3 py-1.5 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer flex items-center gap-1.5"
                      style={{ fontSize: "12px", fontWeight: 500 }}
                      onClick={e => {
                        e.stopPropagation();
                        toast.success("Khiếu nại đã được gửi. Admin và giảng viên sẽ xem xét.");
                      }}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Khiếu nại điểm
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400" style={{ fontSize: "14px", fontWeight: 500 }}>Chưa có bài nộp nào</p>
          </div>
        )}
      </div>
    </div>
  );
}