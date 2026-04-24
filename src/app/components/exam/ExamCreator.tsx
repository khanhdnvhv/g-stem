import { useState, useMemo } from "react";
import {
  X, ChevronLeft, ChevronRight, Check, Plus, Trash2, Search,
  Settings, FileText, Layers, Eye, Shield, Clock, Target, Hash,
  Award, Sparkles, GripVertical, ArrowUpDown, Brain, Zap,
  BookOpen, Camera, Monitor, Lock, Unlock, Shuffle, RotateCcw,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Save,
  Copy, Lightbulb, Users, Calendar, Tag,
} from "lucide-react";
import type { ExamQuestion, QuestionType, DifficultyLevel, ExamType, ExamSection, Exam } from "./types";
import { QUESTION_BANK, QUESTION_TYPE_CONFIG, DIFFICULTY_CONFIG, EXAM_TYPE_CONFIG } from "./types";
import { useConfirm } from "../ConfirmDialog";

interface ExamCreatorProps {
  onClose: () => void;
  onSave: (exam: Partial<Exam>) => void;
  editExam?: Exam | null;
}

const STEPS = [
  { key: "basic", label: "Thông tin cơ bản", icon: FileText },
  { key: "settings", label: "Cài đặt thi", icon: Settings },
  { key: "questions", label: "Chọn câu hỏi", icon: Layers },
  { key: "review", label: "Xem lại & Lưu", icon: Eye },
] as const;

const MOCK_COURSES = [
  { id: "C001", name: "Kỹ năng Lãnh đạo cho Quản lý Cấp trung" },
  { id: "C002", name: "An toàn Lao động trong Xây dựng & Khai khoáng" },
  { id: "C003", name: "Phân tích Tài chính Doanh nghiệp" },
  { id: "C004", name: "Chuyển đổi số trong Doanh nghiệp" },
  { id: "C005", name: "Quản lý Dự án theo chuẩn PMI" },
  { id: "C006", name: "ESG & Phát triển Bền vững" },
  { id: "C007", name: "Kỹ năng Giao tiếp & Thuyết trình" },
  { id: "C008", name: "Văn hóa Doanh nghiệp Geleximco" },
];

export function ExamCreator({ onClose, onSave, editExam }: ExamCreatorProps) {
  const confirm = useConfirm();
  const [step, setStep] = useState(0);

  // Step 1: Basic Info
  const [title, setTitle] = useState(editExam?.title || "");
  const [subtitle, setSubtitle] = useState(editExam?.subtitle || "");
  const [courseId, setCourseId] = useState(editExam?.courseId || "");
  const [examType, setExamType] = useState<ExamType>(editExam?.type || "quiz");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(editExam?.difficulty || "medium");
  const [description, setDescription] = useState(editExam?.description || "");
  const [category, setCategory] = useState(editExam?.category || "");
  const [tags, setTags] = useState<string[]>(editExam?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [dueDate, setDueDate] = useState(editExam?.dueDate || "2026-04-30");

  // Step 2: Settings
  const [duration, setDuration] = useState(editExam?.duration || 30);
  const [passingScore, setPassingScore] = useState(editExam?.passingScore || 70);
  const [maxAttempts, setMaxAttempts] = useState(editExam?.maxAttempts || 2);
  const [shuffleQuestions, setShuffleQuestions] = useState(editExam?.shuffleQuestions ?? true);
  const [shuffleOptions, setShuffleOptions] = useState(editExam?.shuffleOptions ?? true);
  const [allowBacktrack, setAllowBacktrack] = useState(editExam?.allowBacktrack ?? true);
  const [allowCalculator, setAllowCalculator] = useState(editExam?.allowCalculator ?? false);
  const [allowNotepad, setAllowNotepad] = useState(editExam?.allowNotepad ?? true);
  const [showResults, setShowResults] = useState(editExam?.showResults ?? true);
  const [showExplanation, setShowExplanation] = useState(editExam?.showExplanation ?? true);
  const [proctoringEnabled, setProctoringEnabled] = useState(editExam?.proctoringEnabled ?? false);
  const [webcamRequired, setWebcamRequired] = useState(editExam?.webcamRequired ?? false);
  const [antiCheat, setAntiCheat] = useState(editExam?.antiCheat ?? false);
  const [instructions, setInstructions] = useState<string[]>(
    editExam?.instructions || ["Đọc kỹ đề trước khi làm bài.", "Hệ thống tự động nộp bài khi hết giờ."]
  );

  // Step 3: Questions
  const [sections, setSections] = useState<{ id: string; title: string; description: string; questionIds: string[] }[]>(
    editExam?.sections.map(s => ({ id: s.id, title: s.title, description: s.description || "", questionIds: [...s.questions] }))
    || [{ id: "S1", title: "Phần I: Câu hỏi", description: "", questionIds: [] }]
  );
  const [qSearch, setQSearch] = useState("");
  const [qFilterType, setQFilterType] = useState<string>("all");
  const [qFilterDiff, setQFilterDiff] = useState<string>("all");
  const [qFilterCat, setQFilterCat] = useState<string>("all");
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  // AI generation
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiDiff, setAiDiff] = useState<DifficultyLevel>("medium");
  const [aiGenerating, setAiGenerating] = useState(false);

  const allSelectedIds = useMemo(() => new Set(sections.flatMap(s => s.questionIds)), [sections]);
  const totalQuestions = allSelectedIds.size;
  const totalPoints = useMemo(
    () => [...allSelectedIds].reduce((sum, id) => sum + (QUESTION_BANK.find(q => q.id === id)?.points || 0), 0),
    [allSelectedIds]
  );

  const categories = useMemo(() => [...new Set(QUESTION_BANK.map(q => q.category))].sort(), []);

  const filteredQuestions = useMemo(() => {
    return QUESTION_BANK.filter(q => {
      const matchSearch = q.question.toLowerCase().includes(qSearch.toLowerCase()) || q.id.toLowerCase().includes(qSearch.toLowerCase());
      const matchType = qFilterType === "all" || q.type === qFilterType;
      const matchDiff = qFilterDiff === "all" || q.difficulty === qFilterDiff;
      const matchCat = qFilterCat === "all" || q.category === qFilterCat;
      return matchSearch && matchType && matchDiff && matchCat;
    });
  }, [qSearch, qFilterType, qFilterDiff, qFilterCat]);

  const courseName = MOCK_COURSES.find(c => c.id === courseId)?.name || "";

  // Handlers
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const addSection = () => {
    const id = `S${sections.length + 1}`;
    setSections([...sections, { id, title: `Phần ${sections.length + 1}`, description: "", questionIds: [] }]);
    setActiveSectionIdx(sections.length);
  };

  const removeSection = async (idx: number) => {
    if (sections.length <= 1) return;
    const s = sections[idx];
    const ok = await confirm({
      title: "Xóa phần thi?",
      message: `Bạn có chắc muốn xóa phần "${s?.title || ""}" với ${s?.questionIds.length || 0} câu hỏi?`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setSections(sections.filter((_, i) => i !== idx));
      if (activeSectionIdx >= sections.length - 1) setActiveSectionIdx(Math.max(0, sections.length - 2));
    }
  };

  const toggleQuestion = (qId: string) => {
    setSections(prev => prev.map((s, i) => {
      if (i !== activeSectionIdx) return s;
      const has = s.questionIds.includes(qId);
      return { ...s, questionIds: has ? s.questionIds.filter(id => id !== qId) : [...s.questionIds, qId] };
    }));
  };

  const addInstruction = () => setInstructions([...instructions, ""]);
  const removeInstruction = (idx: number) => setInstructions(instructions.filter((_, i) => i !== idx));
  const updateInstruction = (idx: number, val: string) => setInstructions(instructions.map((v, i) => i === idx ? val : v));

  const handleAIGenerate = () => {
    setAiGenerating(true);
    setTimeout(() => {
      // Mock: pick random questions matching criteria
      const matching = QUESTION_BANK.filter(q => !allSelectedIds.has(q.id));
      const selected = matching.slice(0, Math.min(aiCount, matching.length)).map(q => q.id);
      setSections(prev => prev.map((s, i) =>
        i === activeSectionIdx ? { ...s, questionIds: [...new Set([...s.questionIds, ...selected])] } : s
      ));
      setAiGenerating(false);
      setShowAIPanel(false);
    }, 1500);
  };

  const canNext = () => {
    if (step === 0) return title.trim().length > 0 && courseId.length > 0;
    if (step === 1) return duration >= 0 && passingScore > 0 && maxAttempts > 0;
    if (step === 2) return totalQuestions > 0;
    return true;
  };

  const handleSave = () => {
    const exam: Partial<Exam> = {
      title, subtitle, courseId, courseName, type: examType, difficulty, description, category,
      tags, dueDate, duration, passingScore, maxAttempts,
      shuffleQuestions, shuffleOptions, allowBacktrack, allowCalculator, allowNotepad,
      showResults, showExplanation, proctoringEnabled, webcamRequired, antiCheat,
      instructions,
      sections: sections.map(s => ({
        id: s.id, title: s.title, description: s.description, questions: s.questionIds,
      })),
      totalQuestions,
      totalPoints,
      estimatedTime: Math.round(totalQuestions * 2.5),
      status: "not_started" as const,
      attemptsUsed: 0,
      bestScore: null,
      createdBy: "Admin",
      createdByAvatar: "AD",
    };
    onSave(exam);
  };

  const ToggleSwitch = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <label className="flex items-center justify-between py-2 cursor-pointer group">
      <span className="text-gray-600 group-hover:text-gray-800 transition-colors" style={{ fontSize: "13px" }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-10 h-5.5 rounded-full transition-all duration-200 relative cursor-pointer ${value ? "bg-[#990803]" : "bg-gray-200"}`}
      >
        <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all duration-200 absolute top-0.5 ${value ? "left-5" : "left-0.5"}`} />
      </button>
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#990803] to-[#7a0602] flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 600 }}>
                {editExam ? "Chỉnh sửa Đề thi" : "Tạo Đề thi mới"}
              </h2>
              <p className="text-gray-400" style={{ fontSize: "12px" }}>
                {totalQuestions} câu hỏi • {totalPoints} điểm
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-50 bg-gray-50/50 shrink-0">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <button
                onClick={() => i <= step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all w-full cursor-pointer ${
                  i === step ? "bg-[#990803] text-white shadow-sm" :
                  i < step ? "bg-green-50 text-green-600" : "text-gray-400"
                }`}
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 mx-1 shrink-0" />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Info */}
          {step === 0 && (
            <div className="space-y-5 max-w-3xl mx-auto">
              <div>
                <label className="text-gray-600 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>Tên đề thi *</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:border-[#990803]/30 focus:outline-none"
                  style={{ fontSize: "14px" }} placeholder="VD: Kiểm tra Năng lực Lãnh đạo Q2/2026" />
              </div>
              <div>
                <label className="text-gray-600 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>Phụ đề</label>
                <input value={subtitle} onChange={e => setSubtitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:border-[#990803]/30 focus:outline-none"
                  style={{ fontSize: "13px" }} placeholder="Mô tả ngắn gọn..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>Khóa học liên kết *</label>
                  <select value={courseId} onChange={e => setCourseId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer focus:ring-2 focus:ring-[#990803]/10 focus:border-[#990803]/30 focus:outline-none"
                    style={{ fontSize: "13px" }}>
                    <option value="">Chọn khóa học...</option>
                    {MOCK_COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-600 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>Danh mục</label>
                  <input value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:border-[#990803]/30 focus:outline-none"
                    style={{ fontSize: "13px" }} placeholder="VD: Kỹ năng Lãnh đạo" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>Loại đề thi</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(EXAM_TYPE_CONFIG) as [ExamType, typeof EXAM_TYPE_CONFIG[ExamType]][]).map(([key, cfg]) => (
                      <button key={key} onClick={() => setExamType(key)}
                        className={`px-3 py-2 rounded-lg border-2 transition-all cursor-pointer text-center ${
                          examType === key ? "border-[#990803] bg-[#990803]/5" : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <span style={{ fontSize: "16px" }}>{cfg.icon}</span>
                        <p style={{ fontSize: "10px", fontWeight: 500 }} className={examType === key ? "text-[#990803]" : "text-gray-500"}>{cfg.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>Độ khó</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.entries(DIFFICULTY_CONFIG) as [DifficultyLevel, typeof DIFFICULTY_CONFIG[DifficultyLevel]][]).map(([key, cfg]) => (
                      <button key={key} onClick={() => setDifficulty(key)}
                        className={`px-3 py-2 rounded-lg border-2 transition-all cursor-pointer text-center ${
                          difficulty === key ? "border-[#990803] bg-[#990803]/5" : "border-gray-200 hover:border-gray-300"
                        }`}>
                        <span style={{ fontSize: "12px", color: cfg.color }}>{"★".repeat(cfg.stars)}</span>
                        <p style={{ fontSize: "10px", fontWeight: 500 }} className={difficulty === key ? "text-[#990803]" : "text-gray-500"}>{cfg.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-gray-600 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>Mô tả đề thi</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:border-[#990803]/30 focus:outline-none resize-none"
                  style={{ fontSize: "13px" }} placeholder="Mô tả chi tiết về đề thi..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>Hạn nộp</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer focus:ring-2 focus:ring-[#990803]/10 focus:border-[#990803]/30 focus:outline-none"
                    style={{ fontSize: "13px" }} />
                </div>
                <div>
                  <label className="text-gray-600 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 500 }}>Tags</label>
                  <div className="flex gap-2">
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:border-[#990803]/30 focus:outline-none"
                      style={{ fontSize: "12px" }} placeholder="Thêm tag..." />
                    <button onClick={addTag} className="px-3 py-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 cursor-pointer">
                      <Plus className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map(t => (
                        <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-[#990803]/5 text-[#990803] rounded-full" style={{ fontSize: "11px" }}>
                          {t}
                          <button onClick={() => setTags(tags.filter(x => x !== t))} className="hover:text-red-600 cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Settings */}
          {step === 1 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Core settings */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
                  <Settings className="w-4 h-4 text-[#990803]" /> Cài đặt chính
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-500 mb-1 block" style={{ fontSize: "11px" }}>Thời gian (phút)</label>
                    <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={0}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:outline-none"
                      style={{ fontSize: "14px" }} />
                    <p className="text-gray-400 mt-1" style={{ fontSize: "10px" }}>0 = không giới hạn</p>
                  </div>
                  <div>
                    <label className="text-gray-500 mb-1 block" style={{ fontSize: "11px" }}>Điểm đạt (%)</label>
                    <input type="number" value={passingScore} onChange={e => setPassingScore(Number(e.target.value))} min={0} max={100}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:outline-none"
                      style={{ fontSize: "14px" }} />
                  </div>
                  <div>
                    <label className="text-gray-500 mb-1 block" style={{ fontSize: "11px" }}>Số lần thi tối đa</label>
                    <input type="number" value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))} min={1} max={99}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:outline-none"
                      style={{ fontSize: "14px" }} />
                  </div>
                </div>
              </div>

              {/* Toggle settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-gray-800 mb-3 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
                    <Shuffle className="w-4 h-4 text-[#990803]" /> Quy tắc thi
                  </h3>
                  <div className="space-y-1">
                    <ToggleSwitch value={shuffleQuestions} onChange={setShuffleQuestions} label="Trộn thứ tự câu hỏi" />
                    <ToggleSwitch value={shuffleOptions} onChange={setShuffleOptions} label="Trộn đáp án" />
                    <ToggleSwitch value={allowBacktrack} onChange={setAllowBacktrack} label="Cho phép quay lại câu trước" />
                    <ToggleSwitch value={showResults} onChange={setShowResults} label="Hiện kết quả sau thi" />
                    <ToggleSwitch value={showExplanation} onChange={setShowExplanation} label="Hiện giải thích" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-gray-800 mb-3 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
                      <Hash className="w-4 h-4 text-[#990803]" /> Công cụ hỗ trợ
                    </h3>
                    <div className="space-y-1">
                      <ToggleSwitch value={allowCalculator} onChange={setAllowCalculator} label="Máy tính" />
                      <ToggleSwitch value={allowNotepad} onChange={setAllowNotepad} label="Ghi chú nháp" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-gray-800 mb-3 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
                      <Shield className="w-4 h-4 text-[#990803]" /> Chống gian lận
                    </h3>
                    <div className="space-y-1">
                      <ToggleSwitch value={proctoringEnabled} onChange={v => { setProctoringEnabled(v); if (!v) { setWebcamRequired(false); setAntiCheat(false); } }} label="Giám sát trực tuyến" />
                      {proctoringEnabled && (
                        <>
                          <ToggleSwitch value={webcamRequired} onChange={setWebcamRequired} label="Yêu cầu webcam" />
                          <ToggleSwitch value={antiCheat} onChange={setAntiCheat} label="Phát hiện chuyển tab" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-800 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
                    <BookOpen className="w-4 h-4 text-[#990803]" /> Hướng dẫn thi
                  </h3>
                  <button onClick={addInstruction} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "11px" }}>
                    <Plus className="w-3 h-3" /> Thêm
                  </button>
                </div>
                <div className="space-y-2">
                  {instructions.map((inst, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center shrink-0" style={{ fontSize: "10px", fontWeight: 700, color: "#990803" }}>{i + 1}</span>
                      <input value={inst} onChange={e => updateInstruction(i, e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:outline-none"
                        style={{ fontSize: "12px" }} placeholder="Hướng dẫn..." />
                      {instructions.length > 1 && (
                        <button onClick={() => removeInstruction(i)} className="p-1 text-gray-300 hover:text-red-400 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Questions */}
          {step === 2 && (
            <div className="flex gap-5 h-full">
              {/* Left: Sections */}
              <div className="w-72 shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>Các phần</h3>
                  <button onClick={addSection} className="flex items-center gap-1 px-2.5 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "11px" }}>
                    <Plus className="w-3 h-3" /> Thêm
                  </button>
                </div>
                {sections.map((s, i) => (
                  <div key={s.id}
                    onClick={() => setActiveSectionIdx(i)}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      activeSectionIdx === i ? "border-[#990803] bg-[#990803]/5" : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                      <input
                        value={s.title}
                        onChange={e => setSections(prev => prev.map((sec, j) => j === i ? { ...sec, title: e.target.value } : sec))}
                        onClick={e => e.stopPropagation()}
                        className="bg-transparent text-gray-800 focus:outline-none w-full"
                        style={{ fontSize: "13px", fontWeight: 600 }}
                      />
                      {sections.length > 1 && (
                        <button onClick={e => { e.stopPropagation(); removeSection(i); }} className="p-1 text-gray-300 hover:text-red-400 cursor-pointer">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400" style={{ fontSize: "11px" }}>{s.questionIds.length} câu</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 600 }}>
                        {s.questionIds.reduce((sum, id) => sum + (QUESTION_BANK.find(q => q.id === id)?.points || 0), 0)} đ
                      </span>
                    </div>
                  </div>
                ))}

                {/* Summary */}
                <div className="p-4 bg-gradient-to-br from-[#990803] to-[#7a0602] rounded-xl text-white mt-4">
                  <p style={{ fontSize: "10px", opacity: 0.7 }}>TỔNG KẾT</p>
                  <p style={{ fontSize: "22px", fontWeight: 800 }}>{totalQuestions} <span style={{ fontSize: "12px", fontWeight: 400 }}>câu hỏi</span></p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#c8a84e" }}>{totalPoints} điểm</p>
                  <p style={{ fontSize: "10px", opacity: 0.7, marginTop: 4 }}>~{Math.round(totalQuestions * 2.5)} phút ước tính</p>
                </div>

                {/* AI Panel trigger */}
                <button onClick={() => setShowAIPanel(!showAIPanel)}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl text-purple-700 hover:shadow-md cursor-pointer transition-all"
                  style={{ fontSize: "12px", fontWeight: 500 }}>
                  <Sparkles className="w-4 h-4" /> AI Gợi ý câu hỏi
                </button>

                {showAIPanel && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                    <p className="text-purple-800" style={{ fontSize: "12px", fontWeight: 600 }}>AI Auto-Select</p>
                    <input value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="Chủ đề (VD: leadership)"
                      className="w-full px-3 py-2 bg-white rounded-lg border border-purple-200 focus:outline-none" style={{ fontSize: "12px" }} />
                    <div className="flex gap-2">
                      <input type="number" value={aiCount} onChange={e => setAiCount(Number(e.target.value))} min={1} max={20}
                        className="w-16 px-2 py-2 bg-white rounded-lg border border-purple-200 focus:outline-none" style={{ fontSize: "12px" }} />
                      <select value={aiDiff} onChange={e => setAiDiff(e.target.value as DifficultyLevel)}
                        className="flex-1 px-2 py-2 bg-white rounded-lg border border-purple-200 cursor-pointer" style={{ fontSize: "12px" }}>
                        {Object.entries(DIFFICULTY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    <button onClick={handleAIGenerate} disabled={aiGenerating}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer disabled:opacity-50"
                      style={{ fontSize: "12px", fontWeight: 500 }}>
                      {aiGenerating ? <><RotateCcw className="w-3.5 h-3.5 animate-spin" /> Đang tạo...</> : <><Sparkles className="w-3.5 h-3.5" /> Gợi ý</>}
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Question bank picker */}
              <div className="flex-1 space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={qSearch} onChange={e => setQSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:outline-none"
                      style={{ fontSize: "12px" }} placeholder="Tìm câu hỏi..." />
                  </div>
                  <select value={qFilterType} onChange={e => setQFilterType(e.target.value)}
                    className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer" style={{ fontSize: "11px" }}>
                    <option value="all">Tất cả loại</option>
                    {Object.entries(QUESTION_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                  <select value={qFilterDiff} onChange={e => setQFilterDiff(e.target.value)}
                    className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer" style={{ fontSize: "11px" }}>
                    <option value="all">Tất cả độ khó</option>
                    {Object.entries(DIFFICULTY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <select value={qFilterCat} onChange={e => setQFilterCat(e.target.value)}
                    className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer" style={{ fontSize: "11px" }}>
                    <option value="all">Tất cả danh mục</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                  {filteredQuestions.map(q => {
                    const isInSection = sections[activeSectionIdx]?.questionIds.includes(q.id);
                    const isInOther = !isInSection && allSelectedIds.has(q.id);
                    const typeCfg = QUESTION_TYPE_CONFIG[q.type];
                    const diffCfg = DIFFICULTY_CONFIG[q.difficulty];

                    return (
                      <div key={q.id}
                        onClick={() => !isInOther && toggleQuestion(q.id)}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          isInSection ? "border-[#990803] bg-[#990803]/5" :
                          isInOther ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed" :
                          "border-gray-200 hover:border-[#990803]/20 hover:shadow-sm"
                        }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                            isInSection ? "border-[#990803] bg-[#990803]" : "border-gray-300"
                          }`}>
                            {isInSection && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: typeCfg.color, background: `${typeCfg.color}15` }}>
                                {typeCfg.icon} {typeCfg.label}
                              </span>
                              <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: diffCfg.color, background: diffCfg.bg }}>
                                {"★".repeat(diffCfg.stars)} {diffCfg.label}
                              </span>
                              <span className="text-gray-300" style={{ fontSize: "9px" }}>{q.id}</span>
                              <span className="text-[#c8a84e]" style={{ fontSize: "10px", fontWeight: 700 }}>{q.points}đ</span>
                              {isInOther && <span className="text-orange-500" style={{ fontSize: "9px" }}>Đã ở phần khác</span>}
                            </div>
                            <p className="text-gray-700 truncate" style={{ fontSize: "12px" }}>{q.question}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-gray-400" style={{ fontSize: "10px" }}>{q.category}</span>
                              <span className="text-gray-300" style={{ fontSize: "10px" }}>•</span>
                              <span className="text-gray-400" style={{ fontSize: "10px" }}><Clock className="w-2.5 h-2.5 inline" /> ~{q.timeEstimate}s</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredQuestions.length === 0 && (
                    <div className="text-center py-8">
                      <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-gray-400" style={{ fontSize: "13px" }}>Không tìm thấy câu hỏi phù hợp</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 3 && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="bg-gradient-to-br from-[#990803] to-[#7a0602] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: 700 }}>{title || "Chưa đặt tên"}</h2>
                    {subtitle && <p style={{ fontSize: "12px", opacity: 0.7 }}>{subtitle}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Câu hỏi", value: totalQuestions, icon: Hash },
                    { label: "Tổng điểm", value: totalPoints, icon: Target },
                    { label: "Thời gian", value: duration > 0 ? `${duration} phút` : "∞", icon: Clock },
                    { label: "Điểm đạt", value: `${passingScore}%`, icon: Award },
                  ].map(s => (
                    <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                      <s.icon className="w-4 h-4 mx-auto mb-1 opacity-70" />
                      <p style={{ fontSize: "18px", fontWeight: 800 }}>{s.value}</p>
                      <p style={{ fontSize: "10px", opacity: 0.6 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                  <h3 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>Thông tin chung</h3>
                  {[
                    { label: "Loại đề", value: EXAM_TYPE_CONFIG[examType]?.icon + " " + EXAM_TYPE_CONFIG[examType]?.label },
                    { label: "Độ khó", value: DIFFICULTY_CONFIG[difficulty]?.label },
                    { label: "Khóa học", value: courseName || "Chưa chọn" },
                    { label: "Hạn nộp", value: new Date(dueDate).toLocaleDateString("vi-VN") },
                    { label: "Số lần thi", value: `${maxAttempts} lần` },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-gray-400" style={{ fontSize: "12px" }}>{r.label}</span>
                      <span className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{r.value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                  <h3 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>Cài đặt</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Trộn câu hỏi", on: shuffleQuestions },
                      { label: "Trộn đáp án", on: shuffleOptions },
                      { label: "Quay lại câu", on: allowBacktrack },
                      { label: "Máy tính", on: allowCalculator },
                      { label: "Ghi chú", on: allowNotepad },
                      { label: "Giám sát", on: proctoringEnabled },
                      { label: "Webcam", on: webcamRequired },
                      { label: "Anti-cheat", on: antiCheat },
                    ].map(f => (
                      <div key={f.label} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${f.on ? "bg-green-50" : "bg-gray-50"}`}>
                        {f.on ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-gray-300" />}
                        <span className={f.on ? "text-green-700" : "text-gray-400"} style={{ fontSize: "10px" }}>{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sections preview */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-gray-800 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Cấu trúc đề thi</h3>
                <div className="space-y-2">
                  {sections.map((s, i) => (
                    <div key={s.id} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#990803] text-white flex items-center justify-center" style={{ fontSize: "11px", fontWeight: 700 }}>{i + 1}</span>
                          <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>{s.title}</span>
                        </div>
                        <span className="text-gray-400" style={{ fontSize: "11px" }}>
                          {s.questionIds.length} câu • {s.questionIds.reduce((sum, id) => sum + (QUESTION_BANK.find(q => q.id === id)?.points || 0), 0)} điểm
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {s.questionIds.map(id => {
                          const q = QUESTION_BANK.find(x => x.id === id);
                          if (!q) return null;
                          return (
                            <span key={id} className="px-2 py-0.5 rounded-full bg-white border border-gray-200" style={{ fontSize: "10px" }}>
                              <span style={{ color: QUESTION_TYPE_CONFIG[q.type].color }}>{QUESTION_TYPE_CONFIG[q.type].icon}</span> {id} ({q.points}đ)
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Validation */}
              {totalQuestions === 0 && (
                <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <p className="text-amber-700" style={{ fontSize: "13px" }}>Chưa chọn câu hỏi nào. Quay lại bước 3 để thêm câu hỏi.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-100 cursor-pointer transition-all"
            style={{ fontSize: "13px" }}>
            <ChevronLeft className="w-4 h-4" /> {step > 0 ? "Quay lại" : "Hủy"}
          </button>
          <div className="flex gap-2">
            {step === 3 ? (
              <button onClick={handleSave} disabled={totalQuestions === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#990803] to-[#7a0602] text-white rounded-xl hover:shadow-lg hover:shadow-[#990803]/20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: "13px", fontWeight: 600 }}>
                <Save className="w-4 h-4" /> {editExam ? "Cập nhật" : "Tạo đề thi"}
              </button>
            ) : (
              <button onClick={() => setStep(step + 1)} disabled={!canNext()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#990803] to-[#7a0602] text-white rounded-xl hover:shadow-lg hover:shadow-[#990803]/20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: "13px", fontWeight: 600 }}>
                Tiếp theo <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}