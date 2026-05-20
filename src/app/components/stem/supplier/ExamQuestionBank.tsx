/* ================================================================ */
/*  EXAM QUESTION BANK — Ngân hàng câu hỏi kỳ thi STEM               */
/*  Route: /supplier/exams/questions                                  */
/*  Quản lý EXAM_QUESTIONS — list, filter, thêm/sửa/xóa (local state) */
/* ================================================================ */

import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  HelpCircle, ArrowLeft, Plus, Search, Pencil, Trash2,
  X, Save, CheckCircle2, Circle,
} from "lucide-react";
import {
  STEM_PROGRAMS, EXAM_QUESTIONS, QUESTION_DIFFICULTY_META,
  type StemProgram, type ExamQuestion, type QuestionType, type QuestionDifficulty,
  type ExamQuestionOption,
} from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { toast } from "@/app/lib/toast";

/* ── Form dialog thêm/sửa câu hỏi ── */
function QuestionFormDialog({
  question, onClose, onSave,
}: {
  question: ExamQuestion | null;   // null = thêm mới
  onClose: () => void;
  onSave: (q: ExamQuestion) => void;
}) {
  const isNew = !question;
  const [content, setContent] = useState(question?.content ?? "");
  const [programCode, setProgramCode] = useState<StemProgram>(question?.programCode ?? "CT1");
  const [type, setType] = useState<QuestionType>(question?.type ?? "single");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>(question?.difficulty ?? "medium");
  const [points, setPoints] = useState(question?.points ?? 1);
  const [options, setOptions] = useState<ExamQuestionOption[]>(
    question?.options ?? [
      { id: "A", text: "Đáp án A", correct: true },
      { id: "B", text: "Đáp án B", correct: false },
      { id: "C", text: "Đáp án C", correct: false },
      { id: "D", text: "Đáp án D", correct: false },
    ],
  );
  const [explanation, setExplanation] = useState(question?.explanation ?? "");

  const updateOption = (i: number, patch: Partial<ExamQuestionOption>) => {
    const next = [...options];
    next[i] = { ...next[i], ...patch };
    if (type === "single" && patch.correct) {
      next.forEach((o, idx) => { if (idx !== i) o.correct = false; });
    }
    setOptions(next);
  };

  const changeType = (t: QuestionType) => {
    setType(t);
    if (t === "true_false") {
      setOptions([
        { id: "T", text: "Đúng", correct: true },
        { id: "F", text: "Sai", correct: false },
      ]);
    } else if (options.length < 3) {
      setOptions([
        { id: "A", text: "Đáp án A", correct: true },
        { id: "B", text: "Đáp án B", correct: false },
        { id: "C", text: "Đáp án C", correct: false },
        { id: "D", text: "Đáp án D", correct: false },
      ]);
    }
  };

  const contentValid = content.trim().length >= 10;
  const hasCorrect = options.some((o) => o.correct);
  const formValid = contentValid && hasCorrect;

  const handleSave = () => {
    if (!formValid) return;
    onSave({
      id: question?.id ?? `Q-NEW-${Date.now()}`,
      content: content.trim(),
      type, programCode, difficulty, points,
      options,
      explanation: explanation.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-xl max-h-[88vh] overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border">
          <HelpCircle className="w-5 h-5 text-[#c8a84e]" />
          <h2 className="flex-1" style={{ fontSize: "15px", fontWeight: 700 }}>
            {isNew ? "Thêm câu hỏi mới" : "Sửa câu hỏi"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* Nội dung */}
          <div>
            <label className="block text-muted-foreground mb-1" style={{ fontSize: "11.5px", fontWeight: 600 }}>
              Nội dung câu hỏi <span className="text-[#990803]">*</span>
            </label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              rows={2} placeholder="Nhập câu hỏi..."
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none resize-none"
              style={{ fontSize: "12.5px" }} />
            {content.length > 0 && !contentValid && (
              <p className="text-orange-500 mt-1" style={{ fontSize: "11px" }}>Nội dung tối thiểu 10 ký tự</p>
            )}
          </div>

          {/* CT + Type + Difficulty + Points */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>Chương trình</label>
              <select value={programCode} onChange={(e) => setProgramCode(e.target.value as StemProgram)}
                className="w-full px-2 py-1.5 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }}>
                {(Object.keys(STEM_PROGRAMS) as StemProgram[]).map((c) => (
                  <option key={c} value={c}>{c} · {STEM_PROGRAMS[c].shortName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>Loại câu hỏi</label>
              <select value={type} onChange={(e) => changeType(e.target.value as QuestionType)}
                className="w-full px-2 py-1.5 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }}>
                <option value="single">Một đáp án</option>
                <option value="multi">Nhiều đáp án</option>
                <option value="true_false">Đúng / Sai</option>
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>Độ khó</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                className="w-full px-2 py-1.5 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }}>
                {(Object.keys(QUESTION_DIFFICULTY_META) as QuestionDifficulty[]).map((d) => (
                  <option key={d} value={d}>{QUESTION_DIFFICULTY_META[d].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>Điểm</label>
              <input type="number" min={1} max={10} value={points}
                onChange={(e) => setPoints(Number(e.target.value) || 1)}
                className="w-full px-2 py-1.5 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }} />
            </div>
          </div>

          {/* Đáp án */}
          <div>
            <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "11.5px", fontWeight: 600 }}>
              Đáp án {!hasCorrect && <span className="text-orange-500">— cần đánh dấu ít nhất 1 đáp án đúng</span>}
            </label>
            <div className="space-y-1.5">
              {options.map((o, i) => (
                <div key={o.id} className="flex items-center gap-1.5">
                  <button onClick={() => updateOption(i, { correct: !o.correct })}
                    className={`shrink-0 w-5 h-5 rounded flex items-center justify-center border-2 ${
                      o.correct ? "bg-[#16a34a] border-[#16a34a]" : "border-border bg-card"
                    }`}>
                    {o.correct ? <CheckCircle2 className="w-3 h-3 text-white" /> : <Circle className="w-3 h-3 text-transparent" />}
                  </button>
                  <span className="font-mono text-muted-foreground shrink-0 w-5" style={{ fontSize: "10.5px", fontWeight: 600 }}>{o.id}.</span>
                  <input value={o.text} onChange={(e) => updateOption(i, { text: e.target.value })}
                    readOnly={type === "true_false"}
                    className="flex-1 px-2 py-1 bg-card border border-border rounded outline-none" style={{ fontSize: "11.5px" }} />
                  {type !== "true_false" && options.length > 2 && (
                    <button onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {type !== "true_false" && options.length < 6 && (
                <button onClick={() => setOptions([...options, {
                  id: String.fromCharCode(65 + options.length), text: `Đáp án ${String.fromCharCode(65 + options.length)}`, correct: false,
                }])}
                  className="text-muted-foreground hover:text-foreground" style={{ fontSize: "11px" }}>
                  <Plus className="w-3 h-3 inline mr-0.5" /> Thêm đáp án
                </button>
              )}
            </div>
          </div>

          {/* Giải thích */}
          <div>
            <label className="block text-muted-foreground mb-1" style={{ fontSize: "11.5px", fontWeight: 600 }}>
              Giải thích (tùy chọn)
            </label>
            <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)}
              rows={2} placeholder="Giải thích đáp án đúng..."
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none resize-none"
              style={{ fontSize: "11.5px" }} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-secondary/20">
          <button onClick={onClose}
            className="px-3 py-1.5 border border-border bg-card rounded-md hover:bg-secondary" style={{ fontSize: "12px" }}>
            Hủy
          </button>
          <button onClick={handleSave} disabled={!formValid}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#c8a84e] text-white rounded-md hover:opacity-90 disabled:opacity-40"
            style={{ fontSize: "12px", fontWeight: 600 }}>
            <Save className="w-3.5 h-3.5" /> {isNew ? "Thêm câu hỏi" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export function ExamQuestionBank() {
  const [questions, setQuestions] = useState<ExamQuestion[]>(EXAM_QUESTIONS);
  const [ctFilter, setCtFilter] = useState<StemProgram | "all">("all");
  const [typeFilter, setTypeFilter] = useState<QuestionType | "all">("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExamQuestion | null>(null);

  const filtered = useMemo(() => questions.filter((q) => {
    if (ctFilter !== "all" && q.programCode !== ctFilter) return false;
    if (typeFilter !== "all" && q.type !== typeFilter) return false;
    if (search && !q.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [questions, ctFilter, typeFilter, search]);

  const handleSaveQuestion = (q: ExamQuestion) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((x) => x.id === q.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = q;
        return next;
      }
      return [q, ...prev];
    });
    setFormOpen(false);
    setEditing(null);
    toast.success(editing ? "Đã lưu câu hỏi" : "Đã thêm câu hỏi mới");
  };

  const [deleteTarget, setDeleteTarget] = useState<ExamQuestion | null>(null);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
    toast.info("Đã xóa câu hỏi");
    setDeleteTarget(null);
  };

  const TYPE_LABEL: Record<QuestionType, string> = {
    single: "1 đáp án", multi: "Nhiều đáp án", true_false: "Đúng/Sai",
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2" style={{ fontSize: "12px" }}>
        <Link to="/supplier/exams"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Hệ sinh thái Kỳ thi
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">Ngân hàng câu hỏi</span>
      </div>

      <PageHeader
        icon={HelpCircle}
        title="Ngân hàng Câu hỏi Kỳ thi"
        subtitle="Quản lý kho câu hỏi STEM CT1–CT5 — dùng chung cho mọi kỳ thi cấp trường."
        accentColor="#c8a84e"
        actions={
          <button onClick={() => { setEditing(null); setFormOpen(true); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#c8a84e] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Thêm câu hỏi
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={HelpCircle} label="Tổng câu hỏi" value={questions.length} color="#c8a84e" />
        <KpiCard icon={CheckCircle2} label="Câu dễ" value={questions.filter((q) => q.difficulty === "easy").length} color="#16a34a" />
        <KpiCard icon={CheckCircle2} label="Câu TB" value={questions.filter((q) => q.difficulty === "medium").length} color="#c8a84e" />
        <KpiCard icon={CheckCircle2} label="Câu khó" value={questions.filter((q) => q.difficulty === "hard").length} color="#dc2626" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm câu hỏi..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none" style={{ fontSize: "13px" }} />
        </div>
        <select value={ctFilter} onChange={(e) => setCtFilter(e.target.value as StemProgram | "all")}
          className="px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả CT</option>
          {(Object.keys(STEM_PROGRAMS) as StemProgram[]).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as QuestionType | "all")}
          className="px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả loại</option>
          <option value="single">Một đáp án</option>
          <option value="multi">Nhiều đáp án</option>
          <option value="true_false">Đúng/Sai</option>
        </select>
        <span className="text-muted-foreground ml-auto" style={{ fontSize: "12px" }}>
          {filtered.length}/{questions.length} câu
        </span>
      </div>

      {/* Question list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="py-12 text-center bg-card rounded-xl border border-dashed border-border">
            <HelpCircle className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Không có câu hỏi phù hợp</p>
          </div>
        ) : filtered.map((q) => {
          const dm = QUESTION_DIFFICULTY_META[q.difficulty];
          return (
            <div key={q.id} className="bg-card rounded-xl border border-border p-3 hover:shadow-sm transition-all group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "13px", fontWeight: 500, lineHeight: 1.45 }}>{q.content}</p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <ProgramBadge code={q.programCode} size="xs" />
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9.5px", fontWeight: 600, color: dm.color, backgroundColor: dm.color + "15" }}>
                      {dm.label}
                    </span>
                    <span className="px-1.5 py-0.5 bg-secondary text-muted-foreground rounded" style={{ fontSize: "9.5px", fontWeight: 600 }}>
                      {TYPE_LABEL[q.type]}
                    </span>
                    <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{q.points} điểm · {q.options.length} đáp án</span>
                    <span className="font-mono text-muted-foreground" style={{ fontSize: "10px" }}>{q.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => { setEditing(q); setFormOpen(true); }}
                    className="p-1.5 hover:bg-secondary rounded" title="Sửa">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => setDeleteTarget(q)}
                    className="p-1.5 hover:bg-secondary rounded" title="Xóa">
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {formOpen && (
        <QuestionFormDialog
          question={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSave={handleSaveQuestion}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa câu hỏi"
        message="Câu hỏi này sẽ bị xóa khỏi ngân hàng. Hành động không thể hoàn tác."
        itemName={deleteTarget?.content}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default ExamQuestionBank;
