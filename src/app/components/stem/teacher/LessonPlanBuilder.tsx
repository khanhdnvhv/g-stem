import { useState } from "react";
import {
  Lightbulb, Sparkles, Bot, BookOpen, Save, Send,
  Plus, X, Wand2, CheckCircle2, GraduationCap,
} from "lucide-react";
import { STEM_PROGRAMS, GRADE_LEVELS, SUBJECTS } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { toast } from "sonner";

/* ================================================================ */
/*  LESSON PLAN BUILDER — tích hợp AI-Buddy gợi ý soạn giáo án      */
/* ================================================================ */

const AI_SUGGESTIONS_BY_PROGRAM: Record<StemProgram, string[]> = {
  CT1: [
    "Đo chu vi lớp học bằng thước dây, tính diện tích",
    "Quan sát chu trình nước tại khu vực nhà trường",
    "Tìm và phân loại 5 vật liệu quen thuộc theo tính chất",
  ],
  CT2: [
    "Kết hợp Toán-Lý giải bài toán đòn bẩy trong đời sống",
    "Ứng dụng kiến thức Hóa-Sinh phân tích pH nước giếng",
    "Mô hình hóa Toán học cho chuyển động đều",
  ],
  CT3: [
    "Thiết kế mô hình thu gom rác thông minh bằng cảm biến",
    "Làm đồ chơi khoa học từ vật liệu tái chế",
    "Dự án cộng đồng: trồng cây thủy canh tại lớp",
  ],
  CT4: [
    "Lập trình robot né vật cản sử dụng cảm biến siêu âm",
    "Huấn luyện AI phân loại ảnh hoa quả (Teachable Machine)",
    "IoT: hệ thống tưới cây tự động với Arduino + cảm biến độ ẩm",
  ],
  CT5: [
    "Đề tài NCKH: Nghiên cứu hiệu quả lọc nước từ thực vật địa phương",
    "Đề tài NCKH: Vật liệu cách nhiệt thân thiện môi trường",
    "Đề tài NCKH: Giảm tiếng ồn sân trường bằng thiết kế kiến trúc",
  ],
};

export function LessonPlanBuilder() {
  const [title, setTitle] = useState("");
  const [program, setProgram] = useState<StemProgram>("CT2");
  const [grade, setGrade] = useState("THCS 8");
  const [subject, setSubject] = useState("Toán");
  const [duration, setDuration] = useState(45);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const programMeta = STEM_PROGRAMS[program];

  const addItem = (field: "objectives" | "activities" | "materials", value: string) => {
    if (!value.trim()) return;
    const setter = field === "objectives" ? setObjectives : field === "activities" ? setActivities : setMaterials;
    const current = field === "objectives" ? objectives : field === "activities" ? activities : materials;
    setter([...current, value.trim()]);
  };

  const applyAiSuggestion = (suggestion: string) => {
    setTitle(suggestion);
    toast.success("AI-Buddy đã gợi ý tiêu đề. Tiếp tục điền mục tiêu và hoạt động.");
    setShowSuggestions(false);
  };

  const handleSave = () => {
    toast.success(`Đã lưu giáo án "${title}" vào ngăn nháp.`);
  };
  const handleSubmit = () => {
    toast.success(`Đã gửi giáo án đến tổ bộ môn để duyệt.`);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PageHeader
        icon={Lightbulb}
        title="Soạn Giáo án — AI-Buddy hỗ trợ"
        subtitle="Công cụ soạn giáo án STEM với gợi ý từ AI theo chương trình CT1–CT5 và mapping SGK Bộ GD&ĐT."
        accentColor="#7c3aed"
        badge={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#7c3aed]/15 text-[#7c3aed] rounded" style={{ fontSize: "11px", fontWeight: 600 }}>
            <Bot className="w-3 h-3" /> AI-Buddy v1.5
          </span>
        }
        actions={
          <>
            <button onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Sparkles className="w-4 h-4" /> Gợi ý từ AI
            </button>
            <button onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Save className="w-4 h-4" /> Lưu nháp
            </button>
          </>
        }
      />

      {showSuggestions && (
        <div className="bg-gradient-to-br from-[#7c3aed]/10 to-[#2563eb]/5 rounded-xl border border-[#7c3aed]/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-5 h-5 text-[#7c3aed]" />
            <p style={{ fontSize: "13px", fontWeight: 700 }}>
              AI-Buddy gợi ý 3 ý tưởng cho {programMeta.name}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {AI_SUGGESTIONS_BY_PROGRAM[program].map((s, i) => (
              <button key={i} onClick={() => applyAiSuggestion(s)}
                className="p-3 bg-card border border-border rounded-lg text-left hover:shadow-md transition-all">
                <div className="flex items-start gap-2">
                  <Wand2 className="w-4 h-4 text-[#7c3aed] shrink-0 mt-0.5" />
                  <p style={{ fontSize: "12px" }}>{s}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Meta info */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div>
          <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>TIÊU ĐỀ BÀI HỌC *</label>
          <input
            value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Lập trình robot né vật cản..."
            className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>CHƯƠNG TRÌNH</label>
            <select value={program} onChange={(e) => setProgram(e.target.value as StemProgram)}
              className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
              style={{ fontSize: "12.5px" }}>
              {(Object.keys(STEM_PROGRAMS) as StemProgram[]).map((c) => (
                <option key={c} value={c}>{c} · {STEM_PROGRAMS[c].shortName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>CẤP HỌC</label>
            <select value={grade} onChange={(e) => setGrade(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
              style={{ fontSize: "12.5px" }}>
              {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>BỘ MÔN</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
              style={{ fontSize: "12.5px" }}>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>THỜI LƯỢNG (PHÚT)</label>
            <input type="number" min={15} max={180} step={15} value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 45)}
              className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
              style={{ fontSize: "12.5px" }} />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <ProgramBadge code={program} size="md" showName />
          <span className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
            · {grade} · {subject} · {duration} phút
          </span>
        </div>
      </div>

      {/* Objectives */}
      <Section title="Mục tiêu bài học" items={objectives} setItems={setObjectives}
        addItem={(v) => addItem("objectives", v)}
        aiHint={`VD: Học sinh ${program === "CT4" ? "hiểu nguyên lý cảm biến siêu âm và lập trình cơ bản" : "hiểu và vận dụng kiến thức vào bài toán thực tế"}`} />

      {/* Activities */}
      <Section title="Các hoạt động" items={activities} setItems={setActivities}
        addItem={(v) => addItem("activities", v)}
        aiHint="VD: 1. Giới thiệu tình huống (10p); 2. Chia nhóm lắp ráp (20p); 3. Trình bày (15p)"
        numbered />

      {/* Materials */}
      <Section title="Thiết bị & học liệu" items={materials} setItems={setMaterials}
        addItem={(v) => addItem("materials", v)}
        aiHint="VD: Robot Mbot × 6, laptop tra cứu × 3, bút màu, giấy A3..." />

      {/* Actions */}
      <div className="sticky bottom-4 flex items-center gap-2">
        <button onClick={handleSave}
          className="flex-1 px-4 py-3 bg-card border border-border rounded-lg hover:bg-secondary flex items-center justify-center gap-2"
          style={{ fontSize: "13px", fontWeight: 500 }}>
          <Save className="w-4 h-4" /> Lưu nháp
        </button>
        <button onClick={handleSubmit}
          disabled={!title}
          className="flex-1 px-4 py-3 bg-[#7c3aed] text-white rounded-lg hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
          style={{ fontSize: "13px", fontWeight: 600 }}>
          <Send className="w-4 h-4" /> Gửi giáo án duyệt
        </button>
      </div>
    </div>
  );
}

function Section({
  title, items, setItems, addItem, aiHint, numbered,
}: {
  title: string; items: string[]; setItems: (v: string[]) => void;
  addItem: (v: string) => void; aiHint: string; numbered?: boolean;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{title}</h3>
        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{items.length} mục</span>
      </div>
      <div className="space-y-1.5 mb-3">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-secondary/40 rounded-lg group">
            {numbered ? (
              <span className="w-6 h-6 rounded-full bg-[#7c3aed] text-white flex items-center justify-center shrink-0" style={{ fontSize: "11px", fontWeight: 700 }}>
                {idx + 1}
              </span>
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#7c3aed] shrink-0" />
            )}
            <span className="flex-1" style={{ fontSize: "12.5px" }}>{it}</span>
            <button onClick={() => setItems(items.filter((_, i) => i !== idx))}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground p-3 italic" style={{ fontSize: "11.5px" }}>
            <Bot className="w-3.5 h-3.5 inline mr-1" /> AI gợi ý: {aiHint}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)}
          placeholder="Thêm mới..."
          onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { addItem(draft); setDraft(""); } }}
          className="flex-1 px-3 py-1.5 bg-input-background border border-border rounded-lg outline-none"
          style={{ fontSize: "12.5px" }} />
        <button onClick={() => { if (draft.trim()) { addItem(draft); setDraft(""); } }}
          className="px-3 py-1.5 bg-[#7c3aed] text-white rounded-lg hover:opacity-90 flex items-center gap-1"
          style={{ fontSize: "12px", fontWeight: 500 }}>
          <Plus className="w-3.5 h-3.5" /> Thêm
        </button>
      </div>
    </div>
  );
}

export default LessonPlanBuilder;
