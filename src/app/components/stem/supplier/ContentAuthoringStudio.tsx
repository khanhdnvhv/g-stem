import { useState } from "react";
import {
  Edit, Plus, Save, Eye, Trash2, Video, FileText, Image as ImageIcon,
  Code2, HelpCircle, BookOpen, Sparkles, Bot, Upload, GripVertical,
  Layers, Clock, CheckCircle2, Circle,
} from "lucide-react";
import { STEM_PROGRAMS, GRADE_LEVELS, SUBJECTS, STEM_IMAGES } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "sonner";

/* ================================================================ */
/*  CONTENT AUTHORING STUDIO (Supplier) — soạn bài giảng STEM       */
/*  Block-based editor mock: video / text / image / quiz / code     */
/* ================================================================ */

type BlockType = "heading" | "text" | "video" | "image" | "quiz" | "code" | "attachment";

interface Block {
  id: string;
  type: BlockType;
  content: string;
  meta?: string;
}

const BLOCK_META: Record<BlockType, { label: string; icon: typeof FileText; color: string }> = {
  heading:    { label: "Tiêu đề",      icon: BookOpen, color: "#990803" },
  text:       { label: "Đoạn văn",     icon: FileText, color: "#0891b2" },
  video:      { label: "Video",        icon: Video,    color: "#dc2626" },
  image:      { label: "Hình ảnh",     icon: ImageIcon, color: "#16a34a" },
  quiz:       { label: "Câu hỏi",      icon: HelpCircle, color: "#c8a84e" },
  code:       { label: "Đoạn code",    icon: Code2,    color: "#7c3aed" },
  attachment: { label: "File đính kèm", icon: Upload,   color: "#64748b" },
};

const DRAFTS = [
  { id: "D1", title: "Lập trình robot né vật cản — Bài 3", program: "CT4" as StemProgram, updatedAt: "2 giờ trước", status: "draft" },
  { id: "D2", title: "Đòn bẩy và công cơ học — Liên môn Toán-Lý", program: "CT2" as StemProgram, updatedAt: "Hôm qua", status: "draft" },
  { id: "D3", title: "NCKH: Nghiên cứu lọc nước từ thực vật", program: "CT5" as StemProgram, updatedAt: "3 ngày trước", status: "review" },
  { id: "D4", title: "Thiết kế cây xanh thông minh với IoT", program: "CT3" as StemProgram, updatedAt: "1 tuần trước", status: "published" },
];

const STATUS_META = {
  draft:     { label: "Nháp",       color: "#64748b" },
  review:    { label: "Chờ duyệt",  color: "#f59e0b" },
  published: { label: "Đã publish",  color: "#16a34a" },
};

export function ContentAuthoringStudio() {
  const [title, setTitle] = useState("Bài giảng mới");
  const [program, setProgram] = useState<StemProgram>("CT2");
  const [grade, setGrade] = useState("THCS 8");
  const [subject, setSubject] = useState("Toán");
  const [duration, setDuration] = useState(45);
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "B1", type: "heading", content: "1. Khởi động — Tình huống thực tế" },
    { id: "B2", type: "text", content: "Đặt tình huống: Một chiếc xe robot cần di chuyển qua phòng học mà không va chạm với bàn ghế. Làm thế nào để nó biết tránh chướng ngại vật?" },
    { id: "B3", type: "video", content: "Video demo robot né vật cản (3 phút)", meta: "youtube:dQw4w9WgXcQ" },
    { id: "B4", type: "heading", content: "2. Kiến thức mới" },
    { id: "B5", type: "text", content: "Cảm biến siêu âm HC-SR04 phát sóng âm và đo thời gian phản hồi để tính khoảng cách." },
  ]);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: `B${Date.now()}`,
      type,
      content: `${BLOCK_META[type].label} mới — nhập nội dung...`,
    };
    setBlocks([...blocks, newBlock]);
    toast.success(`Đã thêm block ${BLOCK_META[type].label}`);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const aiAssist = () => {
    toast.success("AI-Buddy đã gợi ý bổ sung 3 block mới cho bài giảng");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Edit}
        title="Studio Biên soạn Bài giảng STEM"
        subtitle="Công cụ block-based soạn bài giảng CT1–CT5 — tích hợp AI-Buddy gợi ý, preview trước khi publish."
        accentColor="#990803"
        actions={
          <>
            <button onClick={() => toast.info("Xem trước bài giảng ở chế độ học sinh")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button onClick={() => toast.success(`Đã lưu nháp "${title}"`)}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Save className="w-4 h-4" /> Lưu nháp
            </button>
            <button onClick={() => toast.success("Đã gửi duyệt publish bài giảng")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <CheckCircle2 className="w-4 h-4" /> Gửi duyệt
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Edit} label="Bản nháp của tôi" value={DRAFTS.filter((d) => d.status === "draft").length} color="#990803" />
        <KpiCard icon={Clock} label="Chờ duyệt" value={DRAFTS.filter((d) => d.status === "review").length} color="#f59e0b" />
        <KpiCard icon={CheckCircle2} label="Đã publish (QTD)" value={24} color="#16a34a" />
        <KpiCard icon={Layers} label="Block templates" value={Object.keys(BLOCK_META).length} color="#7c3aed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* === LEFT: My drafts === */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 style={{ fontSize: "13px", fontWeight: 700 }}>Bản nháp của tôi</h3>
            <button onClick={() => toast.info("Tạo bài giảng mới")}
              className="p-1 hover:bg-secondary rounded" title="Tạo mới">
              <Plus className="w-4 h-4 text-[#990803]" />
            </button>
          </div>
          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {DRAFTS.map((d) => {
              const sMeta = STATUS_META[d.status as keyof typeof STATUS_META];
              return (
                <button key={d.id} className="w-full p-3 hover:bg-secondary/50 text-left transition-colors">
                  <div className="flex items-center gap-1 mb-1">
                    <ProgramBadge code={d.program} size="xs" />
                    <span className="px-1.5 py-0.5 rounded" style={{
                      fontSize: "9.5px", fontWeight: 600,
                      color: sMeta.color, backgroundColor: sMeta.color + "15",
                    }}>
                      {sMeta.label}
                    </span>
                  </div>
                  <p className="line-clamp-2" style={{ fontSize: "12px", fontWeight: 500 }}>
                    {d.title}
                  </p>
                  <p className="text-muted-foreground mt-1" style={{ fontSize: "10.5px" }}>
                    {d.updatedAt}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* === MIDDLE: Editor === */}
        <div className="lg:col-span-2 space-y-3">
          {/* Meta */}
          <div className="bg-card rounded-xl border border-border p-4">
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full text-foreground bg-transparent outline-none mb-2 border-b-2 border-transparent focus:border-[#990803] transition-colors"
              style={{ fontSize: "18px", fontWeight: 700 }} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <select value={program} onChange={(e) => setProgram(e.target.value as StemProgram)}
                className="px-2 py-1.5 bg-input-background border border-border rounded-md" style={{ fontSize: "11.5px" }}>
                {(Object.keys(STEM_PROGRAMS) as StemProgram[]).map((c) => (
                  <option key={c} value={c}>{c} · {STEM_PROGRAMS[c].shortName}</option>
                ))}
              </select>
              <select value={grade} onChange={(e) => setGrade(e.target.value)}
                className="px-2 py-1.5 bg-input-background border border-border rounded-md" style={{ fontSize: "11.5px" }}>
                {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className="px-2 py-1.5 bg-input-background border border-border rounded-md" style={{ fontSize: "11.5px" }}>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="number" min={15} step={5} value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 45)}
                className="px-2 py-1.5 bg-input-background border border-border rounded-md" style={{ fontSize: "11.5px" }} />
            </div>
          </div>

          {/* Block toolbar */}
          <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-1 flex-wrap">
            <span className="text-muted-foreground mr-1" style={{ fontSize: "11px", fontWeight: 600 }}>THÊM BLOCK:</span>
            {(Object.keys(BLOCK_META) as BlockType[]).map((t) => {
              const meta = BLOCK_META[t];
              const Icon = meta.icon;
              return (
                <button key={t} onClick={() => addBlock(t)}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-secondary transition-colors"
                  style={{ fontSize: "11px" }}>
                  <Icon className="w-3 h-3" style={{ color: meta.color }} />
                  {meta.label}
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-1">
              <button onClick={aiAssist}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-[#7c3aed] to-[#c8a84e] text-white rounded-md hover:opacity-90"
                style={{ fontSize: "11px", fontWeight: 600 }}>
                <Sparkles className="w-3 h-3" /> AI gợi ý
              </button>
            </div>
          </div>

          {/* Blocks list */}
          <div className="space-y-2">
            {blocks.map((b, idx) => {
              const meta = BLOCK_META[b.type];
              const Icon = meta.icon;
              return (
                <div key={b.id}
                  className="bg-card rounded-xl border border-border p-3 hover:border-[#990803]/30 transition-colors group">
                  <div className="flex items-start gap-2">
                    <button className="text-muted-foreground hover:text-foreground cursor-move mt-1" title="Kéo thả">
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: meta.color + "15" }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-muted-foreground" style={{ fontSize: "10.5px", fontWeight: 600 }}>
                          #{idx + 1}
                        </span>
                        <span className="px-1.5 py-0.5 rounded" style={{
                          fontSize: "9.5px", fontWeight: 600,
                          color: meta.color, backgroundColor: meta.color + "15",
                        }}>
                          {meta.label}
                        </span>
                      </div>
                      {b.type === "heading" ? (
                        <p style={{ fontSize: "15px", fontWeight: 700 }}>{b.content}</p>
                      ) : b.type === "video" ? (
                        <div>
                          <p style={{ fontSize: "12.5px" }}>{b.content}</p>
                          <div className="mt-2 aspect-video bg-secondary rounded-lg flex items-center justify-center">
                            <Video className="w-10 h-10 text-muted-foreground" />
                          </div>
                        </div>
                      ) : b.type === "image" ? (
                        <div>
                          <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>{b.content}</p>
                          <img src={STEM_IMAGES[idx % STEM_IMAGES.length]} alt=""
                            className="mt-2 rounded-lg w-full max-h-48 object-cover" />
                        </div>
                      ) : b.type === "quiz" ? (
                        <div>
                          <p style={{ fontSize: "12.5px", fontWeight: 500 }}>{b.content}</p>
                          {["Đáp án A", "Đáp án B", "Đáp án C"].map((a, i) => (
                            <label key={i} className="flex items-center gap-2 mt-1 p-1.5 bg-secondary/30 rounded">
                              <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                              <span style={{ fontSize: "11.5px" }}>{a}</span>
                            </label>
                          ))}
                        </div>
                      ) : b.type === "code" ? (
                        <pre className="p-2 bg-[#0f1118] text-[#c8a84e] rounded-md overflow-x-auto" style={{ fontSize: "11px", fontFamily: "monospace" }}>
                          {b.content === `${BLOCK_META.code.label} mới — nhập nội dung...` ?
`// Arduino code — điều khiển robot né vật cản
#include <NewPing.h>
NewPing sonar(TRIG_PIN, ECHO_PIN, 200);
void loop() {
  int d = sonar.ping_cm();
  if (d < 20) turn();
  else forward();
}` : b.content}
                        </pre>
                      ) : (
                        <p className="text-foreground" style={{ fontSize: "12.5px", lineHeight: 1.6 }}>
                          {b.content}
                        </p>
                      )}
                    </div>
                    <button onClick={() => removeBlock(b.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                      title="Xóa block">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {blocks.length === 0 && (
              <div className="bg-card rounded-xl border border-dashed border-border p-10 text-center">
                <Layers className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground" style={{ fontSize: "12.5px" }}>
                  Chưa có block nào. Thêm từ thanh công cụ ở trên hoặc bấm AI gợi ý.
                </p>
              </div>
            )}
          </div>

          {/* AI-Buddy hint card */}
          <div className="bg-gradient-to-br from-[#7c3aed]/10 to-[#c8a84e]/5 rounded-xl border border-[#7c3aed]/30 p-4 flex items-start gap-3">
            <Bot className="w-5 h-5 text-[#7c3aed] shrink-0 mt-0.5" />
            <div>
              <p style={{ fontSize: "12.5px", fontWeight: 600 }}>AI-Buddy mẹo soạn bài</p>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "11.5px", lineHeight: 1.5 }}>
                Cấu trúc bài giảng STEM nên có: <strong>Khởi động</strong> (tình huống) → <strong>Kiến thức</strong> (lý thuyết gọn) → <strong>Thực hành</strong> (nhóm 4-6 HS) → <strong>Đánh giá</strong> (quiz + demo sản phẩm). Mỗi phần 10-15 phút cho tiết 45 phút.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentAuthoringStudio;
