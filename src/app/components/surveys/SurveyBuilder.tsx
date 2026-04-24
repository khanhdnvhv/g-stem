import React from "react";
import {
  ArrowLeft, Plus, Trash2, GripVertical, Copy, Save, Send,
  Star, CheckSquare, Circle, AlignLeft, BarChart3, LayoutGrid,
  ChevronDown, ChevronUp, Eye, Settings, CheckCircle, EyeOff,
  FileText, Users, Calendar, Shield, Clock, Sparkles, Wand2,
  AlertCircle, Target,
} from "lucide-react";
import {
  CATEGORY_CONFIG, QUESTION_TYPE_CONFIG, SURVEY_TEMPLATES,
  type SurveyQuestion, type QuestionType, type SurveyCategory,
} from "./mock-data";
import { useConfirm } from "../ConfirmDialog";
import { toast } from "sonner";

interface SurveyBuilderProps {
  onBack: () => void;
}

const QUESTION_TYPE_ICONS: Record<QuestionType, React.ElementType> = {
  rating: Star,
  single: Circle,
  multiple: CheckSquare,
  text: AlignLeft,
  nps: BarChart3,
  matrix: LayoutGrid,
};

const defaultQuestion = (type: QuestionType, idx: number): SurveyQuestion => ({
  id: `NEW_Q${idx}_${Date.now()}`,
  type,
  text: "",
  required: true,
  ...(type === "rating" && { ratingMax: 5, ratingLabels: ["Rất kém", "Kém", "Bình thường", "Tốt", "Xuất sắc"] }),
  ...(type === "single" && { options: ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3"] }),
  ...(type === "multiple" && { options: ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3"] }),
  ...(type === "text" && { placeholder: "Nhập câu trả lời..." }),
  ...(type === "matrix" && { matrixRows: ["Tiêu chí 1", "Tiêu chí 2"], matrixColumns: ["Rất kém", "Kém", "TB", "Tốt", "Rất tốt"] }),
});

export function SurveyBuilder({ onBack }: SurveyBuilderProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState<SurveyCategory>("post_course");
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [questions, setQuestions] = React.useState<SurveyQuestion[]>([defaultQuestion("rating", 1)]);
  const [expandedQ, setExpandedQ] = React.useState<string | null>(questions[0]?.id || null);
  const [saved, setSaved] = React.useState(false);
  const [showAddType, setShowAddType] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<"questions" | "settings" | "preview">("questions");
  const [published, setPublished] = React.useState(false);
  const [targetAudience, setTargetAudience] = React.useState("Toàn bộ nhân sự Geleximco");
  const [startDate, setStartDate] = React.useState("2026-03-15");
  const [endDate, setEndDate] = React.useState("2026-03-31");
  const [showAISuggest, setShowAISuggest] = React.useState(false);
  const [aiLoading, setAiLoading] = React.useState(false);

  const addQuestion = (type: QuestionType) => {
    const newQ = defaultQuestion(type, questions.length + 1);
    setQuestions(prev => [...prev, newQ]);
    setExpandedQ(newQ.id);
    setShowAddType(false);
  };

  const confirm = useConfirm();

  const removeQuestion = async (id: string) => {
    const q = questions.find(q => q.id === id);
    const ok = await confirm({
      title: "Xóa câu hỏi khảo sát?",
      message: `Bạn có chắc muốn xóa câu hỏi "${q?.text?.slice(0, 60) || ""}"?`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setQuestions(prev => prev.filter(q => q.id !== id));
      if (expandedQ === id) setExpandedQ(null);
    }
  };

  const duplicateQuestion = (id: string) => {
    const idx = questions.findIndex(q => q.id === id);
    if (idx < 0) return;
    const clone = { ...questions[idx], id: `CLONE_${Date.now()}`, text: questions[idx].text + " (bản sao)" };
    const newArr = [...questions];
    newArr.splice(idx + 1, 0, clone);
    setQuestions(newArr);
    setExpandedQ(clone.id);
  };

  const updateQ = (id: string, updates: Partial<SurveyQuestion>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const moveQuestion = (id: string, dir: -1 | 1) => {
    const idx = questions.findIndex(q => q.id === id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= questions.length) return;
    const arr = [...questions];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setQuestions(arr);
  };

  const updateOption = (qId: string, optIdx: number, value: string) => {
    const q = questions.find(q => q.id === qId);
    if (!q?.options) return;
    const opts = [...q.options];
    opts[optIdx] = value;
    updateQ(qId, { options: opts });
  };

  const addOption = (qId: string) => {
    const q = questions.find(q => q.id === qId);
    if (!q?.options) return;
    updateQ(qId, { options: [...q.options, `Lựa chọn ${q.options.length + 1}`] });
  };

  const removeOption = (qId: string, optIdx: number) => {
    const q = questions.find(q => q.id === qId);
    if (!q?.options || q.options.length <= 2) return;
    updateQ(qId, { options: q.options.filter((_, i) => i !== optIdx) });
  };

  const handleSave = () => { setSaved(true); toast.success("Đã lưu bản nháp khảo sát"); setTimeout(() => setSaved(false), 2000); };
  const handlePublish = () => { setPublished(true); toast.success("Đã xuất bản khảo sát thành công!"); };

  // AI Suggest Questions
  const handleAISuggest = () => {
    setAiLoading(true);
    setShowAISuggest(false);
    setTimeout(() => {
      const aiQuestions: SurveyQuestion[] = [
        { id: `AI_Q_${Date.now()}_1`, type: "rating", text: "Mức độ áp dụng kiến thức vào công việc thực tế", required: true, ratingMax: 5, ratingLabels: ["Rất thấp", "Thấp", "Trung bình", "Cao", "Rất cao"] },
        { id: `AI_Q_${Date.now()}_2`, type: "nps", text: "Bạn có giới thiệu chương trình đào tạo này cho đồng nghiệp không?", required: true },
        { id: `AI_Q_${Date.now()}_3`, type: "text", text: "Bạn có góp ý gì để cải thiện chương trình đào tạo?", required: false, placeholder: "Chia sẻ ý kiến của bạn..." },
      ];
      setQuestions(prev => [...prev, ...aiQuestions]);
      setAiLoading(false);
      toast.success(`AI đã gợi ý thêm ${aiQuestions.length} câu hỏi`);
    }, 1500);
  };

  // Validation
  const validationErrors = React.useMemo(() => {
    const errors: string[] = [];
    if (!title.trim()) errors.push("Chưa nhập tiêu đề khảo sát");
    if (questions.length === 0) errors.push("Chưa có câu hỏi nào");
    questions.forEach((q, i) => {
      if (!q.text.trim()) errors.push(`Câu ${i + 1}: Chưa có nội dung`);
    });
    return errors;
  }, [title, questions]);

  const requiredCount = questions.filter(q => q.required).length;
  const estMinutes = Math.max(3, Math.round(questions.length * 1.5));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div>
            <h2 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>Tạo khảo sát mới</h2>
            <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: "12px" }}>
              <span>{questions.length} câu hỏi</span>
              <span>•</span>
              <span>{requiredCount} bắt buộc</span>
              <span>•</span>
              <span>~{estMinutes} phút hoàn thành</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Suggest */}
          <button onClick={handleAISuggest} disabled={aiLoading} className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 cursor-pointer flex items-center gap-1.5 disabled:opacity-50" style={{ fontSize: "12px", fontWeight: 500 }}>
            {aiLoading ? <div className="w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            {aiLoading ? "Đang tạo..." : "AI Gợi ý"}
          </button>
          <button onClick={handleSave} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
            {saved ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Đã lưu</> : <><Save className="w-3.5 h-3.5" /> Lưu nháp</>}
          </button>
          <button onClick={handlePublish} disabled={validationErrors.length > 0} className={`px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${published ? "bg-green-600 text-white" : "bg-[#990803] text-white hover:bg-[#7a0602]"}`} style={{ fontSize: "12px", fontWeight: 600 }}>
            {published ? <><CheckCircle className="w-3.5 h-3.5" /> Đã xuất bản</> : <><Send className="w-3.5 h-3.5" /> Xuất bản</>}
          </button>
        </div>
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && activeSection === "questions" && (
        <div className="bg-amber-50 rounded-lg border border-amber-100 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-700" style={{ fontSize: "11px", fontWeight: 600 }}>Cần hoàn thiện trước khi xuất bản</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {validationErrors.map((err, i) => (
              <span key={i} className="text-amber-600" style={{ fontSize: "10px" }}>• {err}</span>
            ))}
          </div>
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: "questions" as const, label: "Câu hỏi", count: questions.length, icon: FileText },
          { id: "settings" as const, label: "Cài đặt", icon: Settings },
          { id: "preview" as const, label: "Xem trước", icon: Eye },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSection(tab.id)} className={`flex items-center gap-1.5 px-4 py-2 border-b-2 transition-all cursor-pointer ${activeSection === tab.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: activeSection === tab.id ? 600 : 400 }}>
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label} {tab.count !== undefined && <span className="text-gray-400 ml-0.5">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* ─── SETTINGS TAB ─── */}
      {activeSection === "settings" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className="text-gray-600 mb-1 block" style={{ fontSize: "12px", fontWeight: 500 }}>Tiêu đề khảo sát *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nhập tiêu đề khảo sát..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#990803]/20" style={{ fontSize: "14px" }} />
            </div>
            <div>
              <label className="text-gray-600 mb-1 block" style={{ fontSize: "12px", fontWeight: 500 }}>Danh mục</label>
              <select value={category} onChange={e => setCategory(e.target.value as SurveyCategory)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 cursor-pointer focus:outline-none" style={{ fontSize: "13px" }}>
                {(Object.keys(CATEGORY_CONFIG) as SurveyCategory[]).map(cat => (
                  <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-gray-600 mb-1 block" style={{ fontSize: "12px", fontWeight: 500 }}>Mô tả</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả mục đích khảo sát..." rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#990803]/20 resize-none" style={{ fontSize: "13px" }} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div>
              <label className="text-gray-600 mb-1 block" style={{ fontSize: "12px", fontWeight: 500 }}>Đối tượng</label>
              <input value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none" style={{ fontSize: "13px" }} />
            </div>
            <div>
              <label className="text-gray-600 mb-1 block" style={{ fontSize: "12px", fontWeight: 500 }}>Ngày bắt đầu</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none cursor-pointer" style={{ fontSize: "13px" }} />
            </div>
            <div>
              <label className="text-gray-600 mb-1 block" style={{ fontSize: "12px", fontWeight: 500 }}>Ngày kết thúc</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none cursor-pointer" style={{ fontSize: "13px" }} />
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>Khảo sát ẩn danh</p>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>Không lưu thông tin người trả lời</p>
              </div>
            </div>
            <button onClick={() => setIsAnonymous(!isAnonymous)} className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${isAnonymous ? "bg-[#990803]" : "bg-gray-200"}`}>
              <div className="absolute w-4 h-4 rounded-full bg-white shadow-sm top-0.5 transition-all" style={{ left: isAnonymous ? "22px" : "2px" }} />
            </button>
          </div>
          {/* Summary */}
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-blue-600 mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>Thông tin tóm tắt</p>
            <div className="flex items-center gap-4">
              <span className="text-blue-500 flex items-center gap-1" style={{ fontSize: "11px" }}><FileText className="w-3 h-3" /> {questions.length} câu hỏi</span>
              <span className="text-blue-500 flex items-center gap-1" style={{ fontSize: "11px" }}><Target className="w-3 h-3" /> {requiredCount} bắt buộc</span>
              <span className="text-blue-500 flex items-center gap-1" style={{ fontSize: "11px" }}><Clock className="w-3 h-3" /> ~{estMinutes} phút</span>
              <span className="text-blue-500 flex items-center gap-1" style={{ fontSize: "11px" }}><Users className="w-3 h-3" /> {targetAudience}</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── QUESTIONS TAB ─── */}
      {activeSection === "questions" && (
        <div className="space-y-2">
          {questions.map((q, idx) => {
            const TypeIcon = QUESTION_TYPE_ICONS[q.type];
            const typeCfg = QUESTION_TYPE_CONFIG[q.type];
            const isExpanded = expandedQ === q.id;

            return (
              <div key={q.id} className={`bg-white rounded-xl border transition-all ${isExpanded ? "border-[#990803]/30 shadow-sm" : "border-gray-200"}`}>
                <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={() => setExpandedQ(isExpanded ? null : q.id)}>
                  <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0" style={{ fontSize: "11px", fontWeight: 600 }}>{idx + 1}</span>
                  <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: "#99080312" }}>
                    <TypeIcon className="w-3.5 h-3.5" style={{ color: "#990803" }} />
                  </div>
                  <span className={`flex-1 truncate ${q.text ? "text-gray-700" : "text-gray-300 italic"}`} style={{ fontSize: "13px", fontWeight: q.text ? 500 : 400 }}>
                    {q.text || "Câu hỏi chưa có nội dung..."}
                  </span>
                  <span className="text-gray-300 px-1.5 py-0.5 rounded bg-gray-50 shrink-0" style={{ fontSize: "10px" }}>{typeCfg.label}</span>
                  {q.required && <span className="text-red-400 shrink-0" style={{ fontSize: "10px" }}>Bắt buộc</span>}
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 space-y-3">
                    <div>
                      <label className="text-gray-500 mb-1 block" style={{ fontSize: "11px" }}>Nội dung câu hỏi *</label>
                      <input value={q.text} onChange={e => updateQ(q.id, { text: e.target.value })} placeholder="Nhập câu hỏi..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
                    </div>

                    {(q.type === "single" || q.type === "multiple") && q.options && (
                      <div>
                        <label className="text-gray-500 mb-1 block" style={{ fontSize: "11px" }}>Lựa chọn</label>
                        <div className="space-y-1.5">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              {q.type === "single" ? <Circle className="w-4 h-4 text-gray-300 shrink-0" /> : <CheckSquare className="w-4 h-4 text-gray-300 shrink-0" />}
                              <input value={opt} onChange={e => updateOption(q.id, oi, e.target.value)} className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "12.5px" }} />
                              <button onClick={() => removeOption(q.id, oi)} className="p-1 text-gray-300 hover:text-red-500 cursor-pointer" disabled={q.options!.length <= 2}><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                          <button onClick={() => addOption(q.id)} className="text-[#990803] hover:underline cursor-pointer flex items-center gap-1" style={{ fontSize: "12px" }}><Plus className="w-3 h-3" /> Thêm lựa chọn</button>
                        </div>
                      </div>
                    )}

                    {q.type === "rating" && (
                      <div>
                        <label className="text-gray-500 mb-1 block" style={{ fontSize: "11px" }}>Thang điểm: 1 — {q.ratingMax || 5}</label>
                        <div className="flex gap-1">
                          {Array.from({ length: q.ratingMax || 5 }, (_, i) => (
                            <div key={i} className="flex-1 text-center p-2 bg-gray-50 rounded-lg">
                              <Star className="w-4 h-4 text-[#c8a84e] mx-auto mb-0.5" />
                              <span className="text-gray-400" style={{ fontSize: "9px" }}>{q.ratingLabels?.[i] || `${i + 1} sao`}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {q.type === "nps" && (
                      <div>
                        <label className="text-gray-500 mb-1 block" style={{ fontSize: "11px" }}>Net Promoter Score (0-10)</label>
                        <div className="flex gap-1">
                          {Array.from({ length: 11 }, (_, i) => (
                            <div key={i} className="flex-1 text-center py-2 rounded-lg" style={{ backgroundColor: i <= 6 ? "#dc262612" : i <= 8 ? "#f59e0b12" : "#16a34a12", color: i <= 6 ? "#dc2626" : i <= 8 ? "#f59e0b" : "#16a34a", fontSize: "11px", fontWeight: 600 }}>{i}</div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-1 text-gray-300" style={{ fontSize: "9px" }}>
                          <span>Phản đối (0-6)</span>
                          <span>Trung lập (7-8)</span>
                          <span>Ủng hộ (9-10)</span>
                        </div>
                      </div>
                    )}

                    {q.type === "text" && (
                      <div>
                        <label className="text-gray-500 mb-1 block" style={{ fontSize: "11px" }}>Placeholder</label>
                        <input value={q.placeholder || ""} onChange={e => updateQ(q.id, { placeholder: e.target.value })} className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 focus:outline-none" style={{ fontSize: "12px" }} />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={q.required} onChange={e => updateQ(q.id, { required: e.target.checked })} className="accent-[#990803]" />
                        <span className="text-gray-500" style={{ fontSize: "11px" }}>Bắt buộc</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveQuestion(q.id, -1)} disabled={idx === 0} className="p-1.5 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 cursor-pointer disabled:opacity-30" title="Lên"><ChevronUp className="w-3 h-3" /></button>
                        <button onClick={() => moveQuestion(q.id, 1)} disabled={idx === questions.length - 1} className="p-1.5 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 cursor-pointer disabled:opacity-30" title="Xuống"><ChevronDown className="w-3 h-3" /></button>
                        <button onClick={() => duplicateQuestion(q.id)} className="p-1.5 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 cursor-pointer" title="Nhân bản"><Copy className="w-3 h-3" /></button>
                        <button onClick={() => removeQuestion(q.id)} className="p-1.5 rounded border border-red-200 text-red-400 hover:bg-red-50 cursor-pointer" title="Xóa"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add question button */}
          <div className="relative">
            <button onClick={() => setShowAddType(!showAddType)} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-[#990803]/30 hover:text-[#990803] transition-colors cursor-pointer flex items-center justify-center gap-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Thêm câu hỏi
            </button>
            {showAddType && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-30 p-2 grid grid-cols-3 gap-1.5 w-80">
                {(Object.keys(QUESTION_TYPE_CONFIG) as QuestionType[]).map(type => {
                  const cfg = QUESTION_TYPE_CONFIG[type];
                  const Icon = QUESTION_TYPE_ICONS[type];
                  return (
                    <button key={type} onClick={() => addQuestion(type)} className="flex flex-col items-center gap-1 p-3 rounded-lg border border-gray-100 hover:border-[#990803]/30 hover:bg-[#990803]/5 transition-colors cursor-pointer">
                      <Icon className="w-4 h-4 text-[#990803]" />
                      <span className="text-gray-600" style={{ fontSize: "11px", fontWeight: 500 }}>{cfg.label}</span>
                      <span className="text-gray-300" style={{ fontSize: "9px" }}>{cfg.description}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── PREVIEW TAB ─── */}
      {activeSection === "preview" && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#990803]/5 to-transparent rounded-xl border border-[#990803]/10 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-[#990803]" />
              <span className="text-[#990803]" style={{ fontSize: "12px", fontWeight: 600 }}>Chế độ xem trước — Đây là giao diện học viên sẽ thấy</span>
            </div>
          </div>

          {/* Preview card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: CATEGORY_CONFIG[category].color, backgroundColor: CATEGORY_CONFIG[category].bg }}>
                {CATEGORY_CONFIG[category].label}
              </span>
              {isAnonymous && <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 flex items-center gap-1" style={{ fontSize: "10px" }}><Shield className="w-3 h-3" /> Ẩn danh</span>}
            </div>
            <h2 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>{title || "Tiêu đề khảo sát"}</h2>
            <p className="text-gray-400 mt-1" style={{ fontSize: "13px" }}>{description || "Mô tả khảo sát..."}</p>
            <div className="flex items-center gap-4 mt-3 text-gray-300" style={{ fontSize: "11px" }}>
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {questions.length} câu hỏi</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{estMinutes} phút</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {targetAudience}</span>
            </div>
          </div>

          {/* Preview questions */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#990803] to-[#c8a84e]" style={{ width: "14%" }} />
          </div>

          {questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className="w-7 h-7 rounded-full bg-[#990803] text-white flex items-center justify-center shrink-0" style={{ fontSize: "12px", fontWeight: 700 }}>{i + 1}</span>
                <p className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1.5 }}>
                  {q.text || "(Câu hỏi chưa có nội dung)"}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </p>
              </div>
              <div className="ml-10 opacity-60 pointer-events-none">
                {q.type === "rating" && (
                  <div className="flex gap-2">
                    {Array.from({ length: q.ratingMax || 5 }, (_, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border-2 border-gray-200">
                        <Star className="w-5 h-5 text-gray-300" />
                        <span className="text-gray-300" style={{ fontSize: "9px" }}>{q.ratingLabels?.[i] || `${i + 1}`}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(q.type === "single" || q.type === "multiple") && q.options && (
                  <div className="space-y-1.5">
                    {q.options.map(opt => (
                      <div key={opt} className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200">
                        <div className={`w-4 h-4 ${q.type === "single" ? "rounded-full" : "rounded"} border-2 border-gray-300`} />
                        <span className="text-gray-500" style={{ fontSize: "12px" }}>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}
                {q.type === "text" && (
                  <div className="px-3 py-2.5 border-2 border-gray-200 rounded-xl text-gray-300" style={{ fontSize: "12px" }}>{q.placeholder || "Nhập câu trả lời..."}</div>
                )}
                {q.type === "nps" && (
                  <div className="flex gap-1">
                    {Array.from({ length: 11 }, (_, i) => (
                      <div key={i} className="flex-1 py-2 rounded-lg border-2 border-gray-200 text-center text-gray-400" style={{ fontSize: "11px" }}>{i}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
