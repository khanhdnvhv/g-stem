import { useState, useMemo } from "react";
import {
  ArrowLeft, ArrowRight, Brain, CheckCircle, Save, Send, Star,
  FileText, Paperclip, Building2, ChevronDown,
  MessageSquare, Sparkles, Eye, RotateCcw, Copy,
} from "lucide-react";
import {
  MOCK_SUBMISSIONS, MOCK_RUBRICS, FEEDBACK_TEMPLATES, STATUS_CONFIG,
  getLetterGrade, getLetterColor,
  type GradingSubmission, type Rubric,
} from "./mock-data";
import { gradeEssay, AIGradingPanel as AIResultPanel, type AIGradingResult } from "../exam/AIGrading";

interface GradingPanelProps {
  submissionId: string | null;
  onBack: () => void;
  isAdmin: boolean;
}

const QUICK_GRADES = [
  { letter: "A", label: "Xuất sắc", min: 90, color: "#16a34a" },
  { letter: "B", label: "Tốt", min: 80, color: "#65a30d" },
  { letter: "C", label: "Khá", min: 70, color: "#eab308" },
  { letter: "D", label: "Đạt", min: 60, color: "#f97316" },
  { letter: "F", label: "Chưa đạt", min: 0, color: "#dc2626" },
];

export function GradingPanel({ submissionId, onBack, isAdmin }: GradingPanelProps) {
  const submissions = MOCK_SUBMISSIONS.filter(s => s.status !== "draft");
  const currentIdx = submissions.findIndex(s => s.id === submissionId);
  const sub = currentIdx >= 0 ? submissions[currentIdx] : submissions[0];

  const [score, setScore] = useState<number>(sub?.score ?? 0);
  const [feedback, setFeedback] = useState(sub?.feedback ?? "");
  const [rubricScores, setRubricScores] = useState<Record<string, number>>(sub?.rubricScores || {});
  const [showAI, setShowAI] = useState(false);
  const [aiApplied, setAiApplied] = useState(false);
  const [aiResult, setAiResult] = useState<AIGradingResult | null>(null);
  const [gradeStatus, setGradeStatus] = useState<"pass" | "fail" | "resubmit">("pass");
  const [saved, setSaved] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [navIdx, setNavIdx] = useState(currentIdx >= 0 ? currentIdx : 0);

  const activeSub = submissions[navIdx] || sub;
  const rubric = MOCK_RUBRICS.find(r => r.id === activeSub?.rubricId) || MOCK_RUBRICS[0];

  // Calculate rubric total
  const rubricTotal = useMemo(() => {
    if (!rubric) return 0;
    return rubric.criteria.reduce((sum, c) => sum + (rubricScores[c.id] || 0), 0);
  }, [rubric, rubricScores]);

  const rubricPercentage = rubric ? Math.round((rubricTotal / rubric.totalMaxScore) * 100) : 0;

  const handleRubricScore = (criteriaId: string, value: number) => {
    setRubricScores(prev => ({ ...prev, [criteriaId]: value }));
    // Auto update total score
    const newTotal = rubric!.criteria.reduce((sum, c) =>
      sum + (c.id === criteriaId ? value : (rubricScores[c.id] || 0)), 0);
    setScore(Math.round((newTotal / rubric!.totalMaxScore) * 100));
  };

  const handleQuickGrade = (min: number) => {
    const val = min + Math.floor(Math.random() * 8);
    setScore(Math.min(100, val));
    if (min >= 60) setGradeStatus("pass");
    else setGradeStatus("fail");
  };

  const handleApplyAI = () => {
    if (aiResult) {
      setScore(aiResult.score);
      setAiApplied(true);
      setFeedback(prev => prev + (prev ? "\n" : "") + `[AI] ${aiResult.feedback}`);
      if (aiResult.suggestions.length > 0) {
        setFeedback(prev => prev + "\n" + aiResult.suggestions.map(s => `• ${s}`).join("\n"));
      }
    }
  };

  const handleRunAI = () => {
    if (activeSub?.essayContent) {
      const result = gradeEssay(
        activeSub.essayContent,
        activeSub.assignmentTitle,
        activeSub.maxScore,
        activeSub.tags,
      );
      setAiResult(result);
      setShowAI(true);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const navigateTo = (idx: number) => {
    if (idx >= 0 && idx < submissions.length) {
      setNavIdx(idx);
      const s = submissions[idx];
      setScore(s.score ?? 0);
      setFeedback(s.feedback ?? "");
      setRubricScores(s.rubricScores || {});
      setAiApplied(false);
      setShowAI(false);
    }
  };

  if (!activeSub) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="w-12 h-12 text-gray-300 mb-3" />
        <p className="text-gray-500" style={{ fontSize: "15px", fontWeight: 500 }}>Chưa chọn bài nộp</p>
        <p className="text-gray-400 mt-1" style={{ fontSize: "13px" }}>Chọn một bài từ tab "Chờ chấm" để bắt đầu</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors cursor-pointer"
          style={{ fontSize: "13px", fontWeight: 500 }}
        >
          ← Quay lại hàng đợi
        </button>
      </div>
    );
  }

  const sc = STATUS_CONFIG[activeSub.status];

  return (
    <div className="space-y-3">
      {/* Navigation header */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-gray-500 hover:text-[#990803] transition-colors cursor-pointer"
          style={{ fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <div className="flex items-center gap-2">
          <span className="text-gray-400" style={{ fontSize: "12px" }}>
            Bài {navIdx + 1} / {submissions.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => navigateTo(navIdx - 1)}
              disabled={navIdx <= 0}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigateTo(navIdx + 1)}
              disabled={navIdx >= submissions.length - 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {saved && (
          <span className="text-green-600 flex items-center gap-1" style={{ fontSize: "12px", fontWeight: 500 }}>
            <CheckCircle className="w-3.5 h-3.5" /> Đã lưu
          </span>
        )}
      </div>

      {/* Split View */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* LEFT: Submission View */}
        <div className="xl:col-span-7 space-y-3">
          {/* Student Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ fontSize: "13px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}
              >
                {activeSub.studentAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-800" style={{ fontSize: "15px", fontWeight: 600 }}>{activeSub.studentName}</span>
                  <span className="text-gray-400" style={{ fontSize: "11px" }}>({activeSub.studentId})</span>
                  <span
                    className="px-1.5 py-0.5 rounded-full"
                    style={{ fontSize: "10px", fontWeight: 600, color: sc.color, backgroundColor: sc.bg }}
                  >
                    {sc.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-gray-400" style={{ fontSize: "11.5px" }}>
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{activeSub.subsidiary}</span>
                  <span>|</span>
                  <span>{activeSub.department}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-400" style={{ fontSize: "10.5px" }}>Khóa học</p>
                <p className="text-gray-700" style={{ fontSize: "12.5px", fontWeight: 500 }}>{activeSub.courseName}</p>
              </div>
              <div>
                <p className="text-gray-400" style={{ fontSize: "10.5px" }}>Bài tập</p>
                <p className="text-gray-700" style={{ fontSize: "12.5px", fontWeight: 500 }}>{activeSub.assignmentTitle}</p>
              </div>
              <div>
                <p className="text-gray-400" style={{ fontSize: "10.5px" }}>Thời gian nộp</p>
                <p className="text-gray-700" style={{ fontSize: "12.5px" }}>{activeSub.submittedAt}</p>
              </div>
              <div>
                <p className="text-gray-400" style={{ fontSize: "10.5px" }}>Hạn nộp</p>
                <p className={activeSub.isOverdue ? "text-red-500" : "text-gray-700"} style={{ fontSize: "12.5px" }}>
                  {activeSub.dueDate} {activeSub.isOverdue && "(Quá hạn)"}
                </p>
              </div>
            </div>
          </div>

          {/* Essay Content */}
          {activeSub.essayContent && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-700 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                  <FileText className="w-4 h-4 text-[#990803]" /> Nội dung bài tự luận
                </h3>
                <span className="text-gray-400" style={{ fontSize: "11px" }}>{activeSub.wordCount} từ</span>
              </div>
              <div
                className="bg-gray-50 rounded-lg p-4 text-gray-700 leading-relaxed max-h-80 overflow-y-auto"
                style={{ fontSize: "13px", whiteSpace: "pre-wrap" }}
              >
                {activeSub.essayContent}
              </div>
            </div>
          )}

          {/* File Attachments */}
          {activeSub.fileCount > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
                <Paperclip className="w-4 h-4 text-[#990803]" /> File đính kèm ({activeSub.fileCount})
              </h3>
              <div className="space-y-2">
                {activeSub.fileNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#990803]/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#990803]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 truncate" style={{ fontSize: "12.5px", fontWeight: 500 }}>{name}</p>
                      <p className="text-gray-400" style={{ fontSize: "10.5px" }}>{(120 + i * 85).toFixed(0)} KB</p>
                    </div>
                    <button onClick={() => { import("sonner").then(m => m.toast.info("Đang xem file đính kèm...")); }} className="text-[#990803] hover:underline cursor-pointer" style={{ fontSize: "12px" }}>
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous submission */}
          {activeSub.previousSubmissionId && (
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-3 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-orange-700" style={{ fontSize: "12px" }}>
                Đây là bài nộp lại. Bài trước: <span style={{ fontWeight: 600 }}>{activeSub.previousSubmissionId}</span>
              </span>
              <button onClick={() => { import("sonner").then(m => m.toast.info("Đang mở bài nộp trước...")); }} className="ml-auto text-orange-600 hover:underline cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
                Xem bài trước
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: Grading Form */}
        <div className="xl:col-span-5 space-y-3">
          {/* Score display */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>Điểm số</h3>
              <div
                className="px-2.5 py-1 rounded-lg"
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: getLetterColor(getLetterGrade(score)),
                  backgroundColor: getLetterColor(getLetterGrade(score)) + "15",
                }}
              >
                {score}<span className="text-gray-400" style={{ fontSize: "13px" }}>/{activeSub.maxScore}</span>
                <span className="ml-1.5" style={{ fontSize: "14px" }}>{getLetterGrade(score)}</span>
              </div>
            </div>

            {/* Score input */}
            <div className="flex items-center gap-3 mb-3">
              <input
                type="range"
                min={0}
                max={100}
                value={score}
                onChange={e => setScore(parseInt(e.target.value))}
                className="flex-1 accent-[#990803]"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={e => setScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                style={{ fontSize: "14px", fontWeight: 600 }}
              />
            </div>

            {/* Quick grades */}
            <div className="flex gap-1.5">
              {QUICK_GRADES.map(g => (
                <button
                  key={g.letter}
                  onClick={() => handleQuickGrade(g.min)}
                  className="flex-1 py-1.5 rounded-lg border border-gray-200 hover:border-current transition-colors cursor-pointer text-center"
                  style={{ fontSize: "11px", fontWeight: 600, color: g.color }}
                  title={g.label}
                >
                  {g.letter}
                </button>
              ))}
            </div>
          </div>

          {/* Rubric Scoring */}
          {rubric && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-700 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                  <Star className="w-4 h-4 text-[#c8a84e]" /> Rubric: {rubric.name.length > 25 ? rubric.name.slice(0, 25) + "..." : rubric.name}
                </h3>
                <span className="text-gray-400" style={{ fontSize: "11px" }}>
                  {rubricTotal}/{rubric.totalMaxScore} ({rubricPercentage}%)
                </span>
              </div>

              <div className="space-y-3">
                {rubric.criteria.map(criteria => {
                  const currentScore = rubricScores[criteria.id] || 0;
                  const percentage = Math.round((currentScore / criteria.maxScore) * 100);
                  return (
                    <div key={criteria.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>
                          {criteria.name}
                          <span className="text-gray-400 ml-1" style={{ fontWeight: 400 }}>({criteria.weight}%)</span>
                        </span>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: percentage >= 70 ? "#16a34a" : percentage >= 50 ? "#eab308" : "#dc2626",
                          }}
                        >
                          {currentScore}/{criteria.maxScore}
                        </span>
                      </div>
                      <p className="text-gray-400 mb-2" style={{ fontSize: "10.5px" }}>{criteria.description}</p>

                      {/* Level buttons */}
                      <div className="flex gap-1">
                        {criteria.levels.map(level => {
                          const midScore = Math.round((level.minScore + level.maxScore) / 2);
                          const isActive = currentScore >= level.minScore && currentScore <= level.maxScore;
                          return (
                            <button
                              key={level.label}
                              onClick={() => handleRubricScore(criteria.id, midScore)}
                              className={`flex-1 py-1 px-1 rounded text-center transition-all cursor-pointer border ${
                                isActive
                                  ? "border-[#990803] bg-[#990803]/10 text-[#990803]"
                                  : "border-gray-200 text-gray-500 hover:border-gray-300"
                              }`}
                              style={{ fontSize: "9.5px", fontWeight: isActive ? 600 : 400 }}
                              title={level.description}
                            >
                              {level.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Fine-tune slider */}
                      <input
                        type="range"
                        min={0}
                        max={criteria.maxScore}
                        value={currentScore}
                        onChange={e => handleRubricScore(criteria.id, parseInt(e.target.value))}
                        className="w-full mt-1.5 accent-[#990803]"
                        style={{ height: "4px" }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Suggestion */}
          {activeSub.assignmentType === "essay" && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-purple-700 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                  <Brain className="w-4 h-4" /> Gợi ý AI
                </h3>
                {activeSub.aiScore && !aiApplied && (
                  <span className="text-purple-600" style={{ fontSize: "18px", fontWeight: 700 }}>{activeSub.aiScore}/100</span>
                )}
              </div>

              {!showAI || !aiResult ? (
                <button
                  onClick={handleRunAI}
                  className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  style={{ fontSize: "12px", fontWeight: 500 }}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Phân tích bài viết bằng AI
                </button>
              ) : (
                <div className="space-y-3">
                  {/* Real AI Result Panel from exam/AIGrading.tsx */}
                  <AIResultPanel result={aiResult} />

                  {/* Apply / Dismiss */}
                  {!aiApplied ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleApplyAI}
                        className="flex-1 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer flex items-center justify-center gap-1"
                        style={{ fontSize: "12px", fontWeight: 500 }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Áp dụng điểm AI ({aiResult.score})
                      </button>
                      <button
                        onClick={() => { setShowAI(false); setAiResult(null); }}
                        className="px-3 py-1.5 bg-white border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 cursor-pointer"
                        style={{ fontSize: "12px" }}
                      >
                        Bỏ qua
                      </button>
                    </div>
                  ) : (
                    <p className="text-green-600 flex items-center gap-1" style={{ fontSize: "11px", fontWeight: 500 }}>
                      <CheckCircle className="w-3.5 h-3.5" /> Đã áp dụng điểm AI — {aiResult.score}/{activeSub.maxScore}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Feedback */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-700 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                <MessageSquare className="w-4 h-4 text-[#990803]" /> Nhận xét
              </h3>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="text-[#c8a84e] hover:underline cursor-pointer flex items-center gap-1"
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                Mẫu nhận xét <ChevronDown className={`w-3 h-3 transition-transform ${showTemplates ? "rotate-180" : ""}`} />
              </button>
            </div>

            {showTemplates && (
              <div className="mb-2 bg-gray-50 rounded-lg p-2 space-y-1 max-h-36 overflow-y-auto">
                {FEEDBACK_TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setFeedback(prev => prev + (prev ? "\n" : "") + t)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-white text-gray-600 transition-colors cursor-pointer flex items-center gap-1.5"
                    style={{ fontSize: "11px" }}
                  >
                    <Copy className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="truncate">{t}</span>
                  </button>
                ))}
              </div>
            )}

            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Nhập nhận xét chi tiết cho học viên..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20 resize-none"
              style={{ fontSize: "12.5px", minHeight: "80px" }}
              rows={4}
            />
          </div>

          {/* Grade Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-700 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Kết quả</h3>
            <div className="flex gap-2">
              {[
                { key: "pass", label: "Đạt", color: "#16a34a", bg: "#f0fdf4" },
                { key: "fail", label: "Chưa đạt", color: "#dc2626", bg: "#fef2f2" },
                { key: "resubmit", label: "Yêu cầu nộp lại", color: "#f97316", bg: "#fff7ed" },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => setGradeStatus(s.key as any)}
                  className={`flex-1 py-2 rounded-lg border-2 transition-all cursor-pointer text-center ${
                    gradeStatus === s.key
                      ? `border-current`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{
                    fontSize: "12px",
                    fontWeight: gradeStatus === s.key ? 600 : 400,
                    color: gradeStatus === s.key ? s.color : "#6b7280",
                    backgroundColor: gradeStatus === s.key ? s.bg : "transparent",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Save className="w-4 h-4" /> Lưu nháp
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-[#990803] text-white rounded-xl hover:bg-[#7a0602] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              style={{ fontSize: "13px", fontWeight: 600 }}
            >
              <Send className="w-4 h-4" /> Gửi điểm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}