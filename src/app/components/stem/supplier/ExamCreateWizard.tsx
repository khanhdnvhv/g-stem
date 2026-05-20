/* ================================================================ */
/*  EXAM CREATE WIZARD — Tạo kỳ thi STEM cấp trường (3 bước)         */
/*  Bước 1: Thông tin chung · Bước 2: Cấu hình · Bước 3: Chọn câu hỏi */
/* ================================================================ */

import { useState, useMemo } from "react";
import {
  X, ChevronLeft, ChevronRight, CheckCircle2, ClipboardCheck,
  Circle, CheckSquare, Square,
} from "lucide-react";
import {
  STEM_PROGRAMS, EXAM_QUESTIONS, QUESTION_DIFFICULTY_META,
  type StemProgram, type STEMExam, type ExamQuestion,
} from "../../mock-data/index";
import { ProgramBadge } from "../ui/badges";

interface ExamCreateWizardProps {
  open: boolean;
  onClose: () => void;
  onCreate: (exam: STEMExam) => void;
}

const GRADE_OPTIONS = [
  "Tiểu học 3", "Tiểu học 4", "Tiểu học 5",
  "THCS 6", "THCS 7", "THCS 8", "THCS 9",
  "THPT 10", "THPT 11", "THPT 12", "THPT Nghề",
];

export function ExamCreateWizard({ open, onClose, onCreate }: ExamCreateWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  /* Step 1 */
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("THCS 8");
  const [organiser, setOrganiser] = useState("");

  /* Step 2 */
  const [programCodes, setProgramCodes] = useState<StemProgram[]>([]);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [openAt, setOpenAt] = useState("");
  const [passingScore, setPassingScore] = useState(5);

  /* Step 3 */
  const [selectedQ, setSelectedQ] = useState<Set<string>>(new Set());

  const reset = () => {
    setStep(1); setName(""); setGradeLevel("THCS 8"); setOrganiser("");
    setProgramCodes([]); setDurationMinutes(45); setOpenAt(""); setPassingScore(5);
    setSelectedQ(new Set());
  };

  const handleClose = () => { reset(); onClose(); };

  /* Filtered questions theo CT đã chọn */
  const availableQuestions = useMemo(() => {
    if (programCodes.length === 0) return EXAM_QUESTIONS;
    return EXAM_QUESTIONS.filter((q) => programCodes.includes(q.programCode));
  }, [programCodes]);

  const selectedQuestions = EXAM_QUESTIONS.filter((q) => selectedQ.has(q.id));
  const totalPoints = selectedQuestions.reduce((s, q) => s + q.points, 0);

  /* Validation per step */
  const step1Valid = name.trim().length >= 5 && organiser.trim().length >= 3;
  const step2Valid = programCodes.length > 0 && durationMinutes >= 15 && !!openAt;
  const step3Valid = selectedQ.size >= 3;
  const canNext = step === 1 ? step1Valid : step === 2 ? step2Valid : step3Valid;

  const toggleProgram = (c: StemProgram) =>
    setProgramCodes((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const toggleQuestion = (id: string) =>
    setSelectedQ((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleFinish = () => {
    const open0 = new Date(openAt);
    const close0 = new Date(open0.getTime() + durationMinutes * 60000);
    const newExam: STEMExam = {
      id: `EX-NEW-${Date.now()}`,
      name: name.trim(),
      level: "school",
      gradeLevel,
      programCodes,
      openAt: open0.toISOString(),
      closeAt: close0.toISOString(),
      durationMinutes,
      questionCount: selectedQ.size,
      organiser: organiser.trim(),
      status: "upcoming",
      questionIds: Array.from(selectedQ),
      passingScore,
    };
    onCreate(newExam);
    handleClose();
  };

  const goNext = () => {
    if (!canNext) return;
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
    else handleFinish();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-gradient-to-r from-[#990803]/5 to-transparent">
          <div className="w-9 h-9 rounded-full bg-[#990803] text-white flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 style={{ fontSize: "16px", fontWeight: 700 }}>Tạo kỳ thi STEM mới</h2>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
              Kỳ thi cấp trường — đa chương trình CT1–CT5
            </p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-5 py-3 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => {
              const labels = ["Thông tin chung", "Cấu hình", "Chọn câu hỏi"];
              const isActive = step === s;
              const isDone = step > s;
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isDone ? "bg-[#16a34a] text-white" : isActive ? "bg-[#990803] text-white" : "bg-secondary text-muted-foreground"
                  }`} style={{ fontSize: "12px", fontWeight: 700 }}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: "11.5px", fontWeight: isActive ? 700 : 500 }}>Bước {s}</p>
                    <p className="text-muted-foreground truncate" style={{ fontSize: "10px" }}>{labels[s - 1]}</p>
                  </div>
                  {s < 3 && <div className={`h-px flex-1 ${isDone ? "bg-[#16a34a]" : "bg-border"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                  Tên kỳ thi <span className="text-[#990803]">*</span>
                </label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Kiểm tra CT4 Robotic — Giữa kỳ 2"
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none focus:border-[#990803]"
                  style={{ fontSize: "13px" }} />
                {name.length > 0 && name.trim().length < 5 && (
                  <p className="text-orange-500 mt-1" style={{ fontSize: "11px" }}>Tên kỳ thi tối thiểu 5 ký tự</p>
                )}
              </div>
              <div>
                <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                  Khối lớp <span className="text-[#990803]">*</span>
                </label>
                <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "13px" }}>
                  {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                  Đơn vị tổ chức <span className="text-[#990803]">*</span>
                </label>
                <input value={organiser} onChange={(e) => setOrganiser(e.target.value)}
                  placeholder="VD: Trường THPT Lê Hồng Phong"
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none focus:border-[#990803]"
                  style={{ fontSize: "13px" }} />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
                  Chương trình STEM <span className="text-[#990803]">*</span> (chọn ≥ 1)
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STEM_PROGRAMS) as StemProgram[]).map((c) => {
                    const active = programCodes.includes(c);
                    const p = STEM_PROGRAMS[c];
                    return (
                      <button key={c} onClick={() => toggleProgram(c)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                          active ? "text-white border-transparent" : "border-border bg-card hover:bg-secondary"
                        }`}
                        style={{ fontSize: "12px", fontWeight: 500, ...(active ? { backgroundColor: p.color } : {}) }}>
                        {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {c} · {p.shortName}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                    Thời lượng (phút) <span className="text-[#990803]">*</span>
                  </label>
                  <input type="number" min={15} max={300} value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value) || 45)}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none" style={{ fontSize: "13px" }} />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                    Điểm đạt (thang 10)
                  </label>
                  <input type="number" min={1} max={10} step={0.5} value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value) || 5)}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none" style={{ fontSize: "13px" }} />
                </div>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                  Thời gian mở thi <span className="text-[#990803]">*</span>
                </label>
                <input type="datetime-local" value={openAt} onChange={(e) => setOpenAt(e.target.value)}
                  className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none" style={{ fontSize: "13px" }} />
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
                  Chọn câu hỏi từ ngân hàng ({availableQuestions.length} câu phù hợp CT đã chọn)
                </p>
                <span className="px-2 py-0.5 bg-[#990803]/10 text-[#990803] rounded" style={{ fontSize: "11px", fontWeight: 700 }}>
                  {selectedQ.size} câu · {totalPoints} điểm
                </span>
              </div>
              {selectedQ.size > 0 && selectedQ.size < 3 && (
                <p className="text-orange-500" style={{ fontSize: "11px" }}>Chọn tối thiểu 3 câu hỏi</p>
              )}
              <div className="max-h-80 overflow-y-auto space-y-1.5 rounded-lg border border-border bg-secondary/20 p-2">
                {availableQuestions.map((q: ExamQuestion) => {
                  const sel = selectedQ.has(q.id);
                  const dm = QUESTION_DIFFICULTY_META[q.difficulty];
                  return (
                    <button key={q.id} onClick={() => toggleQuestion(q.id)}
                      className={`w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-lg border transition-all ${
                        sel ? "bg-[#990803]/5 border-[#990803]/30" : "bg-card border-border hover:bg-secondary/50"
                      }`}>
                      <div className={`w-4 h-4 rounded shrink-0 mt-0.5 flex items-center justify-center border-2 ${
                        sel ? "bg-[#990803] border-[#990803]" : "border-border"
                      }`}>
                        {sel && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: "11.5px", fontWeight: sel ? 600 : 400, lineHeight: 1.4 }}>{q.content}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <ProgramBadge code={q.programCode} size="xs" />
                          <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9.5px", fontWeight: 600, color: dm.color, backgroundColor: dm.color + "15" }}>
                            {dm.label}
                          </span>
                          <span className="text-muted-foreground" style={{ fontSize: "10px" }}>
                            {q.type === "single" ? "1 đáp án" : q.type === "multi" ? "Nhiều đáp án" : "Đúng/Sai"} · {q.points}đ
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border bg-secondary/20">
          <button onClick={step > 1 ? () => setStep((s) => (s - 1) as 1 | 2 | 3) : handleClose}
            className="flex items-center gap-1 px-3 py-1.5 border border-border bg-card rounded-md hover:bg-secondary"
            style={{ fontSize: "12px" }}>
            <ChevronLeft className="w-3.5 h-3.5" />
            {step > 1 ? "Quay lại" : "Hủy"}
          </button>
          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Bước {step}/3</span>
          <button onClick={goNext} disabled={!canNext}
            className="flex items-center gap-1 px-4 py-1.5 bg-[#990803] text-white rounded-md hover:bg-[#7a0602] disabled:opacity-40"
            style={{ fontSize: "12px", fontWeight: 600 }}>
            {step < 3 ? "Tiếp theo" : "Tạo kỳ thi"}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamCreateWizard;
