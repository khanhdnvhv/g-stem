import React from "react";
import {
  ArrowLeft, ArrowRight, Send, Clock, Star, CheckCircle,
  AlertCircle, ClipboardList, Save, Timer, Shield, Gift,
  ChevronLeft, ChevronRight, Eye,
} from "lucide-react";
import {
  MOCK_SURVEYS, CATEGORY_CONFIG,
  type Survey, type SurveyQuestion,
} from "./mock-data";
import { toast } from "sonner";

interface SurveyTakeProps {
  surveyId: string;
  onBack: () => void;
}

export function SurveyTake({ surveyId, onBack }: SurveyTakeProps) {
  const survey = MOCK_SURVEYS.find(s => s.id === surveyId && s.status === "active");
  const [currentQ, setCurrentQ] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string | string[] | number>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [savedDraft, setSavedDraft] = React.useState(false);
  const [startTime] = React.useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  const [viewMode, setViewMode] = React.useState<"step" | "all">("step");

  // Timer
  React.useEffect(() => {
    const iv = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [startTime]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec}s`;
  };

  if (!survey) {
    return (
      <div className="text-center py-16">
        <ClipboardList className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400" style={{ fontSize: "15px", fontWeight: 500 }}>Khảo sát không khả dụng</p>
        <p className="text-gray-300 mt-1" style={{ fontSize: "12px" }}>Khảo sát đã đóng hoặc không tồn tại</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-[#990803] text-white rounded-lg cursor-pointer" style={{ fontSize: "13px" }}>Quay lại</button>
      </div>
    );
  }

  const questions = survey.questions;
  const question = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;
  const catCfg = CATEGORY_CONFIG[survey.category];
  const answeredCount = questions.filter(q => {
    const ans = answers[q.id];
    if (ans === undefined || ans === null) return false;
    if (typeof ans === "string" && !ans.trim()) return false;
    if (Array.isArray(ans) && ans.length === 0) return false;
    return true;
  }).length;

  // Estimated time
  const avgMin = survey.avgCompletionMinutes || 8;
  const remainingEst = Math.max(0, Math.round(avgMin * 60 * ((questions.length - answeredCount) / questions.length)));
  const pointsReward = questions.length >= 5 ? 20 : 10;

  const setAnswer = (qId: string, value: string | string[] | number) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const toggleMultiple = (qId: string, option: string) => {
    const current = (answers[qId] as string[]) || [];
    const updated = current.includes(option) ? current.filter(o => o !== option) : [...current, option];
    setAnswer(qId, updated);
  };

  const canProceed = () => {
    if (!question.required) return true;
    const ans = answers[question.id];
    if (ans === undefined || ans === null) return false;
    if (typeof ans === "string" && !ans.trim()) return false;
    if (Array.isArray(ans) && ans.length === 0) return false;
    return true;
  };

  const handleSaveDraft = () => {
    setSavedDraft(true);
    toast.success("Đã lưu bản nháp. Bạn có thể quay lại hoàn thành sau.");
    setTimeout(() => setSavedDraft(false), 3000);
  };

  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-gray-800 mb-2" style={{ fontSize: "22px", fontWeight: 700 }}>Cảm ơn bạn đã tham gia!</h2>
        <p className="text-gray-500 mb-4" style={{ fontSize: "14px" }}>
          Phản hồi cho khảo sát "{survey.title}" đã được ghi nhận thành công.
          {survey.isAnonymous && " Câu trả lời của bạn được bảo mật ẩn danh."}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <Timer className="w-4 h-4 text-blue-500" />
              <span className="text-gray-700" style={{ fontSize: "16px", fontWeight: 700 }}>{formatTime(elapsedSeconds)}</span>
            </div>
            <p className="text-gray-400" style={{ fontSize: "11px" }}>Thời gian</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-gray-700" style={{ fontSize: "16px", fontWeight: 700 }}>{answeredCount}/{questions.length}</span>
            </div>
            <p className="text-gray-400" style={{ fontSize: "11px" }}>Đã trả lời</p>
          </div>
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <Gift className="w-4 h-4 text-[#c8a84e]" />
              <span className="text-[#c8a84e]" style={{ fontSize: "16px", fontWeight: 700 }}>+{pointsReward}</span>
            </div>
            <p className="text-gray-400" style={{ fontSize: "11px" }}>Điểm thưởng</p>
          </div>
        </div>

        <button onClick={onBack} className="px-6 py-2.5 bg-[#990803] text-white rounded-xl hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "14px", fontWeight: 600 }}>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 cursor-pointer" style={{ fontSize: "12px" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
          </button>
          <div className="flex items-center gap-2">
            {/* Timer */}
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg">
              <Timer className="w-3 h-3 text-gray-400" />
              <span className="text-gray-500" style={{ fontSize: "11px", fontFamily: "monospace" }}>{formatTime(elapsedSeconds)}</span>
            </div>
            {/* Remaining estimate */}
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
              <Clock className="w-3 h-3 text-blue-400" />
              <span className="text-blue-500" style={{ fontSize: "11px" }}>~{Math.ceil(remainingEst / 60)}p còn lại</span>
            </div>
            {/* Save draft */}
            <button onClick={handleSaveDraft} className={`px-2.5 py-1 rounded-lg cursor-pointer flex items-center gap-1 ${savedDraft ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`} style={{ fontSize: "11px", fontWeight: 500 }}>
              {savedDraft ? <><CheckCircle className="w-3 h-3" /> Đã lưu</> : <><Save className="w-3 h-3" /> Lưu nháp</>}
            </button>
            {/* View toggle */}
            <div className="flex gap-0.5 bg-gray-100 p-0.5 rounded-lg">
              <button onClick={() => setViewMode("step")} className={`px-2 py-1 rounded cursor-pointer ${viewMode === "step" ? "bg-white shadow-sm text-gray-700" : "text-gray-400"}`} style={{ fontSize: "10px", fontWeight: 500 }}>Từng câu</button>
              <button onClick={() => setViewMode("all")} className={`px-2 py-1 rounded cursor-pointer ${viewMode === "all" ? "bg-white shadow-sm text-gray-700" : "text-gray-400"}`} style={{ fontSize: "10px", fontWeight: 500 }}>Tất cả</button>
            </div>
          </div>
        </div>

        {/* Survey info card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: catCfg.color, backgroundColor: catCfg.bg }}>{catCfg.label}</span>
            {survey.isAnonymous && <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 flex items-center gap-1" style={{ fontSize: "10px", fontWeight: 500 }}><Shield className="w-3 h-3" /> Ẩn danh</span>}
            <span className="ml-auto px-2 py-0.5 bg-[#c8a84e]/10 text-[#c8a84e] rounded-full flex items-center gap-1" style={{ fontSize: "10px", fontWeight: 600 }}><Gift className="w-3 h-3" /> +{pointsReward} điểm</span>
          </div>
          <h2 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 700 }}>{survey.title}</h2>
          <p className="text-gray-400 mt-0.5" style={{ fontSize: "12px" }}>{survey.description}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-gray-500" style={{ fontSize: "12px", fontWeight: 500 }}>
            {viewMode === "step" ? `Câu ${currentQ + 1}/${questions.length}` : `${answeredCount}/${questions.length} đã trả lời`}
          </span>
          <span className="text-gray-400" style={{ fontSize: "11px" }}>{Math.round(viewMode === "step" ? progress : (answeredCount / questions.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#990803] to-[#c8a84e] transition-all duration-300" style={{ width: `${viewMode === "step" ? progress : (answeredCount / questions.length) * 100}%` }} />
        </div>
        {/* Question dots */}
        {viewMode === "step" && (
          <div className="flex items-center gap-1 mt-2 justify-center flex-wrap">
            {questions.map((q, i) => {
              const hasAnswer = (() => {
                const ans = answers[q.id];
                if (ans === undefined || ans === null) return false;
                if (typeof ans === "string" && !ans.trim()) return false;
                if (Array.isArray(ans) && ans.length === 0) return false;
                return true;
              })();
              return (
                <button key={q.id} onClick={() => setCurrentQ(i)} className={`w-6 h-6 rounded-full cursor-pointer transition-all flex items-center justify-center ${i === currentQ ? "bg-[#990803] text-white scale-110" : hasAnswer ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400 hover:bg-gray-300"}`} style={{ fontSize: "9px", fontWeight: 600 }}>
                  {hasAnswer && i !== currentQ ? <CheckCircle className="w-3 h-3" /> : i + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* VIEW: Step by step */}
      {viewMode === "step" && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <div className="flex items-start gap-3 mb-4">
              <span className="w-8 h-8 rounded-full bg-[#990803] text-white flex items-center justify-center shrink-0" style={{ fontSize: "13px", fontWeight: 700 }}>{currentQ + 1}</span>
              <div>
                <p className="text-gray-800" style={{ fontSize: "15px", fontWeight: 600, lineHeight: 1.5 }}>
                  {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </p>
              </div>
            </div>
            <div className="ml-11">
              <QuestionInput question={question} answers={answers} setAnswer={setAnswer} toggleMultiple={toggleMultiple} />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))} disabled={currentQ === 0} className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1.5 disabled:opacity-30" style={{ fontSize: "13px" }}>
              <ChevronLeft className="w-4 h-4" /> Câu trước
            </button>
            {currentQ < questions.length - 1 ? (
              <button onClick={() => setCurrentQ(prev => Math.min(questions.length - 1, prev + 1))} disabled={!canProceed()} className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center gap-1.5 disabled:opacity-50" style={{ fontSize: "13px", fontWeight: 600 }}>
                Câu tiếp <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!canProceed()} className="px-6 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center gap-1.5 disabled:opacity-50" style={{ fontSize: "13px", fontWeight: 600 }}>
                <Send className="w-4 h-4" /> Gửi khảo sát
              </button>
            )}
          </div>
        </>
      )}

      {/* VIEW: All questions */}
      {viewMode === "all" && (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-[#990803] text-white flex items-center justify-center shrink-0" style={{ fontSize: "12px", fontWeight: 700 }}>{i + 1}</span>
                <p className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.5 }}>
                  {q.text}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </p>
              </div>
              <div className="ml-10">
                <QuestionInput question={q} answers={answers} setAnswer={setAnswer} toggleMultiple={toggleMultiple} />
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <button onClick={handleSubmit} className="px-6 py-2.5 bg-[#990803] text-white rounded-xl hover:bg-[#7a0602] cursor-pointer flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Send className="w-4 h-4" /> Gửi khảo sát ({answeredCount}/{questions.length} đã trả lời)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  QUESTION INPUT COMPONENT                                         */
/* ================================================================ */
function QuestionInput({ question, answers, setAnswer, toggleMultiple }: {
  question: SurveyQuestion;
  answers: Record<string, string | string[] | number>;
  setAnswer: (qId: string, value: string | string[] | number) => void;
  toggleMultiple: (qId: string, option: string) => void;
}) {
  return (
    <>
      {/* RATING */}
      {question.type === "rating" && (
        <div className="flex gap-2">
          {Array.from({ length: question.ratingMax || 5 }, (_, i) => {
            const isSelected = (answers[question.id] as number) >= i + 1;
            return (
              <button key={i} onClick={() => setAnswer(question.id, i + 1)} className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all cursor-pointer flex-1" style={{ borderColor: isSelected ? "#c8a84e" : "#e5e7eb", backgroundColor: isSelected ? "#c8a84e12" : "white" }}>
                <Star className="w-6 h-6 transition-colors" style={{ color: isSelected ? "#c8a84e" : "#d1d5db", fill: isSelected ? "#c8a84e" : "none" }} />
                <span className="text-gray-400" style={{ fontSize: "10px" }}>{question.ratingLabels?.[i] || `${i + 1} sao`}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* SINGLE CHOICE */}
      {question.type === "single" && question.options && (
        <div className="space-y-2">
          {question.options.map(opt => {
            const isSelected = answers[question.id] === opt;
            return (
              <button key={opt} onClick={() => setAnswer(question.id, opt)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${isSelected ? "border-[#990803] bg-[#990803]/5" : "border-gray-200 hover:border-gray-300"}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-[#990803]" : "border-gray-300"}`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#990803]" />}
                </div>
                <span className={isSelected ? "text-[#990803]" : "text-gray-600"} style={{ fontSize: "13.5px", fontWeight: isSelected ? 600 : 400 }}>{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* MULTIPLE CHOICE */}
      {question.type === "multiple" && question.options && (
        <div className="space-y-2">
          {question.options.map(opt => {
            const selected = (answers[question.id] as string[]) || [];
            const isSelected = selected.includes(opt);
            return (
              <button key={opt} onClick={() => toggleMultiple(question.id, opt)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${isSelected ? "border-[#990803] bg-[#990803]/5" : "border-gray-200 hover:border-gray-300"}`}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-[#990803] bg-[#990803]" : "border-gray-300"}`}>
                  {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className={isSelected ? "text-[#990803]" : "text-gray-600"} style={{ fontSize: "13.5px", fontWeight: isSelected ? 600 : 400 }}>{opt}</span>
              </button>
            );
          })}
          <p className="text-gray-300" style={{ fontSize: "10px" }}>Chọn nhiều đáp án</p>
        </div>
      )}

      {/* TEXT */}
      {question.type === "text" && (
        <textarea value={(answers[question.id] as string) || ""} onChange={e => setAnswer(question.id, e.target.value)} placeholder={question.placeholder || "Nhập câu trả lời..."} rows={4} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:border-[#990803]/30 resize-none" style={{ fontSize: "13.5px", lineHeight: 1.6 }} />
      )}

      {/* NPS */}
      {question.type === "nps" && (
        <div>
          <div className="flex gap-1.5">
            {Array.from({ length: 11 }, (_, i) => {
              const isSelected = answers[question.id] === i;
              const color = i <= 6 ? "#dc2626" : i <= 8 ? "#f59e0b" : "#16a34a";
              return (
                <button key={i} onClick={() => setAnswer(question.id, i)} className="flex-1 py-3 rounded-lg border-2 transition-all cursor-pointer" style={{ borderColor: isSelected ? color : "#e5e7eb", backgroundColor: isSelected ? color + "15" : "white", color: isSelected ? color : "#6b7280", fontSize: "14px", fontWeight: isSelected ? 700 : 500 }}>
                  {i}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-red-400" style={{ fontSize: "10px" }}>Hoàn toàn không</span>
            <span className="text-green-500" style={{ fontSize: "10px" }}>Chắc chắn có</span>
          </div>
        </div>
      )}

      {/* MATRIX */}
      {question.type === "matrix" && question.matrixRows && question.matrixColumns && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-2" style={{ fontSize: "11px" }} />
                {question.matrixColumns.map(col => (
                  <th key={col} className="text-center py-2 px-2 text-gray-500" style={{ fontSize: "11px", fontWeight: 500 }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {question.matrixRows.map(row => (
                <tr key={row} className="border-t border-gray-100">
                  <td className="py-3 pr-4 text-gray-600" style={{ fontSize: "12.5px" }}>{row}</td>
                  {question.matrixColumns!.map(col => {
                    const key = `${question.id}_${row}`;
                    const isSelected = answers[key] === col;
                    return (
                      <td key={col} className="text-center py-3 px-2">
                        <button onClick={() => setAnswer(key, col)} className={`w-5 h-5 rounded-full border-2 mx-auto flex items-center justify-center cursor-pointer transition-colors ${isSelected ? "border-[#990803] bg-[#990803]" : "border-gray-300 hover:border-gray-400"}`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
