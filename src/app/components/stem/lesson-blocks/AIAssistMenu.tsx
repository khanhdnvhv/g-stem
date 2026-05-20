/* ================================================================ */
/*  AI ASSIST MENU — Trợ lý AI cho LessonEditor / ResearchProject     */
/*  5 actions:                                                        */
/*   1. Tạo nội dung mẫu cho phase (template per CT × phase)         */
/*   2. Đề xuất video YouTube phù hợp                                */
/*   3. Sinh quiz từ nội dung đã có                                  */
/*   4. Tìm bài tương tự trong Ngân hàng                             */
/*   5. Map với bài SGK liên quan                                    */
/* ================================================================ */

import { useState, useMemo } from "react";
import {
  X, Wand2, Sparkles, Loader2, Check, ArrowLeft,
  Lightbulb, Youtube, HelpCircle, BookOpenCheck, Layers,
  Plus, Eye, ExternalLink,
} from "lucide-react";
import { Link } from "react-router";
import {
  STEM_PROGRAMS, lessons,
  type StemProgram, type BlockType,
} from "../../mock-data/index";
import { ProgramBadge } from "../ui/badges";
import { getDefaultBlockContent } from "./BlockComponents";

export interface AIGeneratedBlock {
  type: BlockType;
  content: unknown;
}

interface AIAssistMenuProps {
  open: boolean;
  onClose: () => void;
  programCode: StemProgram;
  activePhaseId: string;
  activePhaseLabel: string;
  activePhaseColor: string;
  grade: string;
  subject?: string;
  /** Blocks hiện có ở phase này — dùng cho action 3 (sinh quiz) */
  existingPhaseBlocks: Array<{ type: string; content: unknown }>;
  onInsertBlocks: (blocks: AIGeneratedBlock[]) => void;
  /** Action 5: trigger SGK picker dialog ở parent */
  onRequestSGKMap?: () => void;
}

type ActionId = "generate" | "video" | "quiz" | "similar" | "sgk";

const ACTIONS: Array<{
  id: ActionId;
  icon: typeof Lightbulb;
  label: string;
  description: string;
  color: string;
}> = [
  { id: "generate", icon: Lightbulb,    label: "Tạo nội dung mẫu",       description: "Sinh 2-4 block khởi tạo cho phase hiện tại theo CT của bạn.",         color: "#7c3aed" },
  { id: "video",    icon: Youtube,      label: "Đề xuất video YouTube",  description: "Tìm video YouTube phù hợp với chủ đề + bậc học.",                    color: "#dc2626" },
  { id: "quiz",     icon: HelpCircle,   label: "Sinh quiz từ nội dung",  description: "Đọc text/heading hiện có → tạo 3-5 câu hỏi trắc nghiệm.",            color: "#c8a84e" },
  { id: "similar",  icon: BookOpenCheck, label: "Tìm bài tương tự",      description: "Lọc bài trong Ngân hàng cùng CT + khối — tham khảo + duplicate.",   color: "#0891b2" },
  { id: "sgk",      icon: Layers,       label: "Map bài SGK",            description: "Mở SGK picker đã lọc theo khối + môn của bài giảng.",                color: "#2563eb" },
];

/* ================================================================ */
/*  TEMPLATE GENERATOR — per (CT × phase × subject)                  */
/* ================================================================ */
function generatePhaseTemplate(
  ct: StemProgram,
  phaseId: string,
  subject?: string,
): AIGeneratedBlock[] {
  const subj = subject ?? "STEM";

  /* CT1 — Tích hợp trong môn học (4 phase 5512) */
  if (ct === "CT1") {
    if (phaseId === "warmup") return [
      { type: "heading", content: { text: `Tình huống thực tế trong ${subj}`, level: 2 } },
      { type: "text",    content: `Mở đầu bằng 1 câu hỏi mở: "Em đã bao giờ gặp tình huống ... trong cuộc sống?" Khuyến khích HS chia sẻ ví dụ cá nhân.` },
      { type: "video",   content: { url: "", caption: `Video minh hoạ ${subj} thực tế — 2-3 phút`, durationSec: 180 } },
    ];
    if (phaseId === "knowledge") return [
      { type: "heading", content: { text: `Kiến thức trọng tâm`, level: 2 } },
      { type: "text",    content: `Định nghĩa khái niệm chính. Đưa công thức/định luật.\n\nVí dụ minh hoạ:\n• VD1: ...\n• VD2: ...` },
      { type: "image",   content: { url: "", caption: "Sơ đồ minh hoạ khái niệm" } },
    ];
    if (phaseId === "practice") return [
      { type: "heading", content: { text: "Luyện tập áp dụng", level: 2 } },
      { type: "text",    content: "Bài tập 1: Áp dụng công thức/định luật ở mức cơ bản\nBài tập 2: Vận dụng vào tình huống thực tế" },
      { type: "quiz",    content: getDefaultBlockContent("quiz") },
    ];
    if (phaseId === "apply") return [
      { type: "heading", content: { text: "Vận dụng STEM thực tế", level: 2 } },
      { type: "text",    content: `Đặt vấn đề: ${subj} có thể giải quyết bài toán nào trong cuộc sống hàng ngày?` },
    ];
  }

  /* CT2 — Liên môn (subject-roles bắt buộc) */
  if (ct === "CT2") {
    if (phaseId === "warmup") return [
      { type: "heading", content: { text: "Tình huống liên môn", level: 2 } },
      { type: "text",    content: "Đưa ra 1 vấn đề thực tế cần kiến thức từ nhiều môn để giải quyết. VD: 'Thiết kế cầu giấy chịu lực' cần Toán + Vật lý + Kỹ thuật." },
    ];
    if (phaseId === "knowledge") return [
      { type: "heading",       content: { text: "Kiến thức từ các môn liên quan", level: 2 } },
      { type: "subject-roles", content: getDefaultBlockContent("subject-roles") },
      { type: "text",          content: "Mỗi môn đóng góp gì vào việc giải quyết vấn đề? GV phân tích vai trò của từng môn." },
    ];
    if (phaseId === "practice") return [
      { type: "heading",         content: { text: "Thực hành tích hợp", level: 2 } },
      { type: "group-activity", content: getDefaultBlockContent("group-activity") },
    ];
    if (phaseId === "apply") return [
      { type: "heading", content: { text: "Đánh giá sản phẩm tích hợp", level: 2 } },
      { type: "rubric",  content: getDefaultBlockContent("rubric") },
    ];
  }

  /* CT3 — Đổi mới sáng tạo */
  if (ct === "CT3") {
    if (phaseId === "explore") return [
      { type: "heading", content: { text: "Khám phá vấn đề thực tế", level: 2 } },
      { type: "text",    content: "Đặt câu hỏi mở: 'Vấn đề nào trong cuộc sống quanh em đang cần một giải pháp sáng tạo?'\n\nKhuyến khích HS quan sát và thảo luận." },
      { type: "image",   content: { url: "", caption: "Ảnh tình huống/vấn đề thực tế" } },
    ];
    if (phaseId === "knowledge") return [
      { type: "heading", content: { text: "Kiến thức nền cần có", level: 2 } },
      { type: "text",    content: "Liệt kê KT cơ bản HS cần biết để sáng tạo:\n• Khái niệm 1: ...\n• Kỹ thuật 2: ...\n• Vật liệu 3: ..." },
    ];
    if (phaseId === "create") return [
      { type: "heading",         content: { text: "Hoạt động sáng tạo và tạo mẫu", level: 2 } },
      { type: "group-activity", content: getDefaultBlockContent("group-activity") },
      { type: "text",            content: "Mỗi nhóm: brainstorm 3 ý tưởng → chọn 1 → vẽ phác thảo → làm prototype." },
    ];
    if (phaseId === "showcase") return [
      { type: "heading", content: { text: "Trình bày sản phẩm và phản hồi đồng đẳng", level: 2 } },
      { type: "text",    content: "Mỗi nhóm trình bày 3 phút:\n• Vấn đề muốn giải quyết\n• Giải pháp sáng tạo\n• Cách hoạt động\n\nCác nhóm khác đặt câu hỏi và đề xuất cải thiện." },
      { type: "rubric",  content: getDefaultBlockContent("rubric") },
    ];
  }

  /* CT4 — Robotic, AI, IoT */
  if (ct === "CT4") {
    if (phaseId === "warmup") return [
      { type: "heading", content: { text: "Demo sản phẩm hoàn thiện", level: 2 } },
      { type: "video",   content: { url: "", caption: "Video demo robot/AI/IoT hoàn thành — kích thích sự tò mò", durationSec: 120 } },
      { type: "text",    content: "Câu hỏi: 'Sản phẩm này hoạt động dựa trên nguyên lý gì? Em có thể tự làm được không?'" },
    ];
    if (phaseId === "theory") return [
      { type: "heading", content: { text: "Lý thuyết & Nguyên lý", level: 2 } },
      { type: "text",    content: "Giới thiệu các khái niệm công nghệ + thuật toán cốt lõi cần dùng trong phase Lắp ráp." },
      { type: "image",   content: { url: "", caption: "Sơ đồ khối hệ thống / Thuật toán" } },
    ];
    if (phaseId === "build") return [
      { type: "heading",      content: { text: "Lắp ráp & Lập trình", level: 2 } },
      { type: "image",        content: { url: "", caption: "Sơ đồ kết nối phần cứng (Fritzing/breadboard)" } },
      { type: "safety-notes", content: getDefaultBlockContent("safety-notes") },
      { type: "code",         content: getDefaultBlockContent("code") },
    ];
    if (phaseId === "debug") return [
      { type: "heading", content: { text: "Test & Debug", level: 2 } },
      { type: "text",    content: "Quy trình debug:\n1. Kiểm tra kết nối phần cứng (đa số lỗi ở đây!)\n2. Verify code biên dịch không lỗi\n3. Thêm Serial.println() để in trạng thái\n4. Test từng module riêng biệt" },
    ];
    if (phaseId === "evaluate") return [
      { type: "heading",         content: { text: "Đánh giá sản phẩm", level: 2 } },
      { type: "rubric",          content: getDefaultBlockContent("rubric") },
      { type: "group-activity", content: getDefaultBlockContent("group-activity") },
    ];
  }

  /* CT5 — NCKH (8 phase research) */
  if (ct === "CT5") {
    if (phaseId === "rq") return [
      { type: "heading",            content: { text: "Câu hỏi nghiên cứu", level: 2 } },
      { type: "research-question",  content: getDefaultBlockContent("research-question") },
      { type: "text",                content: "Lý do chọn câu hỏi: ...\nÝ nghĩa khoa học và thực tiễn: ..." },
    ];
    if (phaseId === "lit") return [
      { type: "heading",  content: { text: "Tổng quan tài liệu", level: 2 } },
      { type: "text",     content: "Các nghiên cứu liên quan đã tìm được:\n1. ...\n2. ...\n\nKhoảng trống nghiên cứu (research gap) còn lại: ..." },
      { type: "citation", content: getDefaultBlockContent("citation") ?? { format: "APA", citations: [] } },
    ];
    if (phaseId === "hypothesis") return [
      { type: "heading",    content: { text: "Giả thuyết nghiên cứu", level: 2 } },
      { type: "hypothesis", content: { ifClause: "Nếu thay đổi [biến độc lập]", thenClause: "thì [biến phụ thuộc] sẽ thay đổi theo hướng X", reasoning: "Dựa trên cơ sở lý thuyết Y", variables: { independent: "[biến mà ta thay đổi]", dependent: "[biến mà ta đo]", controlled: ["Yếu tố không đổi 1", "Yếu tố không đổi 2"] } } },
    ];
    if (phaseId === "method") return [
      { type: "heading", content: { text: "Phương pháp nghiên cứu", level: 2 } },
      { type: "text",    content: "Phương pháp: Thực nghiệm so sánh có nhóm đối chứng.\n\nQuy trình:\n1. Chuẩn bị mẫu (số lượng, đặc điểm)\n2. Thiết lập điều kiện thí nghiệm\n3. Đo đạc và ghi nhận số liệu (lần đo, công cụ)\n4. Phân tích thống kê" },
    ];
    if (phaseId === "data") return [
      { type: "heading",   content: { text: "Thu thập dữ liệu", level: 2 } },
      { type: "data-table", content: { columns: [{ id: "c1", name: "Lần đo", unit: "" }, { id: "c2", name: "Biến A", unit: "cm" }, { id: "c3", name: "Biến B", unit: "g" }], rows: [{ c1: 1, c2: "", c3: "" }, { c1: 2, c2: "", c3: "" }, { c1: 3, c2: "", c3: "" }], caption: "Bảng 1: Số liệu thu thập thực nghiệm" } },
    ];
    if (phaseId === "analysis") return [
      { type: "heading", content: { text: "Phân tích dữ liệu", level: 2 } },
      { type: "chart",   content: getDefaultBlockContent("chart") },
      { type: "text",    content: "Quan sát từ biểu đồ:\n• Xu hướng: ...\n• Tương quan: ...\n• Có sự khác biệt có ý nghĩa thống kê (p < 0.05)? ..." },
    ];
    if (phaseId === "conclusion") return [
      { type: "heading", content: { text: "Kết luận và đề xuất", level: 2 } },
      { type: "text",    content: "Kết luận về giả thuyết: [chấp nhận/bác bỏ] vì ...\n\nÝ nghĩa của kết quả: ...\n\nĐề xuất ứng dụng thực tế: ...\n\nHướng nghiên cứu tiếp theo: ..." },
    ];
    if (phaseId === "report") return [
      { type: "heading",  content: { text: "Báo cáo nghiên cứu", level: 2 } },
      { type: "text",     content: "Cấu trúc báo cáo NCKH chuẩn:\n1. Tóm tắt (Abstract) — 200-300 từ\n2. Đặt vấn đề\n3. Tổng quan tài liệu\n4. Phương pháp\n5. Kết quả\n6. Thảo luận\n7. Kết luận\n8. Tài liệu tham khảo" },
      { type: "citation", content: getDefaultBlockContent("citation") ?? { format: "APA", citations: [] } },
    ];
  }

  /* Fallback */
  return [
    { type: "heading", content: { text: "Nội dung mới", level: 2 } },
    { type: "text",    content: "Bắt đầu nhập nội dung..." },
  ];
}

/* ================================================================ */
/*  Action 2 — Suggest YouTube video                                 */
/* ================================================================ */
const YT_SUGGESTIONS: Record<StemProgram, Array<{ url: string; caption: string }>> = {
  CT1: [
    { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", caption: "Phương pháp dạy STEM tích hợp môn — chia sẻ từ GV THCS" },
    { url: "https://www.youtube.com/watch?v=qpzAfWB97KY", caption: "Khám phá Vật lý qua thí nghiệm đơn giản" },
  ],
  CT2: [
    { url: "https://www.youtube.com/watch?v=8KkKuTCFvzI", caption: "Bài học liên môn Toán-Lý: Đòn bẩy thực tế" },
    { url: "https://www.youtube.com/watch?v=PJxYwsTtAFc", caption: "STEM liên môn: Năng lượng tái tạo từ pin chanh" },
  ],
  CT3: [
    { url: "https://www.youtube.com/watch?v=l5UfhqcfV2k", caption: "20 ý tưởng STEM sáng tạo cho HS Việt Nam" },
    { url: "https://www.youtube.com/watch?v=u_NPgWzkBdU", caption: "Project-Based Learning — Phương pháp dạy CT3" },
  ],
  CT4: [
    { url: "https://www.youtube.com/watch?v=fJeRgQq8ZeI", caption: "Arduino UNO cơ bản — Bài 1 (mạch LED nhấp nháy)" },
    { url: "https://www.youtube.com/watch?v=GO4Bh9V2X1U", caption: "Teachable Machine — Train AI nhận dạng vật trong 5 phút" },
    { url: "https://www.youtube.com/watch?v=zJ7_DRA2pZo", caption: "Cảm biến siêu âm HC-SR04 + Arduino — Robot né vật cản" },
  ],
  CT5: [
    { url: "https://www.youtube.com/watch?v=DRyDP5g3-eI", caption: "Cách viết câu hỏi nghiên cứu KHKT cho HS THCS/THPT" },
    { url: "https://www.youtube.com/watch?v=PAd5Lg0Inio", caption: "Hội thi Khoa học Kỹ thuật quốc gia 2024 — Highlights" },
  ],
};

/* ================================================================ */
/*  Action 3 — Sinh quiz từ nội dung                                 */
/* ================================================================ */
function generateQuizFromContent(
  blocks: Array<{ type: string; content: unknown }>,
): AIGeneratedBlock[] {
  /* Extract text từ heading + text blocks */
  const texts = blocks
    .filter((b) => b.type === "heading" || b.type === "text")
    .map((b) => {
      const c = b.content as any;
      if (typeof c === "string") return c;
      if (c && typeof c === "object" && "text" in c) return c.text;
      return "";
    })
    .filter(Boolean);

  if (texts.length === 0) return [];

  /* Templates: 3 generic questions based on content */
  const firstText = texts[0]?.slice(0, 60) ?? "nội dung";
  return [
    {
      type: "quiz",
      content: {
        questionType: "single",
        question: `Theo nội dung bài, ý chính của "${firstText}..." là gì?`,
        options: [
          { id: "A", text: "Đáp án A — tham khảo nội dung phần đầu", correct: true },
          { id: "B", text: "Đáp án B — sai lệch một phần", correct: false },
          { id: "C", text: "Đáp án C — đối lập với nội dung", correct: false },
          { id: "D", text: "Đáp án D — không liên quan", correct: false },
        ],
        explanation: "GV sửa lại đáp án + giải thích sau khi gen.",
        difficulty: "easy",
        timeLimitSec: 60,
      },
    },
    {
      type: "quiz",
      content: {
        questionType: "multi",
        question: "Những yếu tố nào liên quan đến nội dung bài học? (chọn nhiều)",
        options: [
          { id: "A", text: "Yếu tố 1 (liên quan)",      correct: true  },
          { id: "B", text: "Yếu tố 2 (liên quan)",      correct: true  },
          { id: "C", text: "Yếu tố 3 (không liên quan)", correct: false },
          { id: "D", text: "Yếu tố 4 (không liên quan)", correct: false },
        ],
        explanation: "GV sửa lại danh sách yếu tố cho phù hợp.",
        difficulty: "medium",
        timeLimitSec: 90,
      },
    },
    {
      type: "quiz",
      content: {
        questionType: "true_false",
        question: `Phát biểu sau ĐÚNG hay SAI: "${firstText.slice(0, 80)}..."`,
        options: [
          { id: "T", text: "Đúng", correct: true },
          { id: "F", text: "Sai",  correct: false },
        ],
        explanation: "GV xác nhận lại đáp án đúng/sai sau khi gen.",
        difficulty: "easy",
        timeLimitSec: 30,
      },
    },
  ];
}

/* ================================================================ */
/*  Main component                                                   */
/* ================================================================ */
export function AIAssistMenu({
  open, onClose, programCode, activePhaseId, activePhaseLabel, activePhaseColor,
  grade, subject, existingPhaseBlocks, onInsertBlocks, onRequestSGKMap,
}: AIAssistMenuProps) {
  const [activeAction, setActiveAction] = useState<ActionId | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewBlocks, setPreviewBlocks] = useState<AIGeneratedBlock[]>([]);

  const programMeta = STEM_PROGRAMS[programCode];

  /* Action handlers */
  const runAction = async (actionId: ActionId) => {
    setActiveAction(actionId);
    setLoading(true);
    setPreviewBlocks([]);
    /* Mock AI latency */
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 700));

    if (actionId === "generate") {
      const tpl = generatePhaseTemplate(programCode, activePhaseId, subject);
      setPreviewBlocks(tpl);
    } else if (actionId === "video") {
      const suggestions = YT_SUGGESTIONS[programCode] ?? [];
      setPreviewBlocks(suggestions.map((s) => ({ type: "video" as BlockType, content: { url: s.url, caption: s.caption, durationSec: 0 } })));
    } else if (actionId === "quiz") {
      const generated = generateQuizFromContent(existingPhaseBlocks);
      setPreviewBlocks(generated);
    }
    /* similar + sgk handled separately */
    setLoading(false);
  };

  const handleClose = () => {
    setActiveAction(null);
    setLoading(false);
    setPreviewBlocks([]);
    onClose();
  };

  const handleConfirm = () => {
    if (previewBlocks.length > 0) {
      onInsertBlocks(previewBlocks);
    }
    handleClose();
  };

  /* Action 4: tìm bài tương tự */
  const similarLessons = useMemo(() => {
    return lessons
      .filter((l) => {
        if (l.programCode !== programCode) return false;
        /* match grade level (e.g. "THCS 8" → "THCS") */
        const lessonTier = l.gradeLevel.split(" ")[0];
        const myTier = grade.split(" ")[0];
        return lessonTier === myTier;
      })
      .slice(0, 5);
  }, [programCode, grade]);

  if (!open) return null;

  /* ── Action sub-panel ── */
  if (activeAction) {
    const action = ACTIONS.find((a) => a.id === activeAction)!;
    const ActionIcon = action.icon;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-gradient-to-r from-[#7c3aed]/5 to-transparent">
            <button onClick={() => { setActiveAction(null); setPreviewBlocks([]); setLoading(false); }}
              className="p-1 rounded hover:bg-secondary text-muted-foreground shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white"
              style={{ backgroundColor: action.color }}>
              <ActionIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 style={{ fontSize: "15px", fontWeight: 700 }}>{action.label}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ProgramBadge code={programCode} size="xs" />
                <span className="px-1.5 py-0.5 rounded text-white" style={{ fontSize: "10px", fontWeight: 600, backgroundColor: activePhaseColor }}>
                  {activePhaseLabel}
                </span>
                <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>· {grade}</span>
              </div>
            </div>
            <button onClick={handleClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-10 h-10 text-[#7c3aed] animate-spin" />
                <p className="text-muted-foreground" style={{ fontSize: "12.5px" }}>
                  AI đang xử lý...
                </p>
                <p className="text-muted-foreground italic" style={{ fontSize: "11px" }}>
                  Đang phân tích {programMeta.shortName} × {activePhaseLabel} × {subject ?? "bài giảng"}
                </p>
              </div>
            ) : activeAction === "similar" ? (
              /* === Action 4: Tìm bài tương tự === */
              <div>
                <p className="text-muted-foreground mb-3" style={{ fontSize: "12px", lineHeight: 1.5 }}>
                  {similarLessons.length > 0
                    ? `Tìm thấy ${similarLessons.length} bài cùng ${programCode} + bậc ${grade.split(" ")[0]} trong Ngân hàng Nội dung.`
                    : `Không có bài nào cùng ${programCode} + ${grade.split(" ")[0]} trong Ngân hàng.`}
                </p>
                <div className="space-y-2">
                  {similarLessons.map((l) => (
                    <div key={l.id} className="flex items-start gap-3 p-3 bg-card border border-border rounded-lg hover:border-[#0891b2]/40 transition-colors">
                      <img src={l.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: "12.5px", fontWeight: 600, lineHeight: 1.4 }}>{l.title}</p>
                        <p className="text-muted-foreground mt-0.5 line-clamp-2" style={{ fontSize: "11px", lineHeight: 1.45 }}>{l.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <ProgramBadge code={l.programCode} size="xs" />
                          <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{l.gradeLevel}</span>
                          <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>· {l.durationMinutes}p</span>
                        </div>
                      </div>
                      <Link to={`/supplier/content/library/${l.id}`} onClick={handleClose}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-border bg-card rounded hover:bg-secondary shrink-0"
                        style={{ fontSize: "10.5px", fontWeight: 500 }}>
                        <Eye className="w-3 h-3" /> Xem
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ) : previewBlocks.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground" style={{ fontSize: "12px" }}>
                Không có nội dung để gen. {activeAction === "quiz" && "Cần có ≥ 1 block text/heading trước."}
              </p>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#7c3aed]" />
                  <p style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    Sẽ chèn {previewBlocks.length} block vào "{activePhaseLabel}"
                  </p>
                </div>
                <div className="space-y-2">
                  {previewBlocks.map((blk, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-2 bg-secondary/30 border border-border rounded-lg">
                      <span className="px-1.5 py-0.5 bg-[#7c3aed]/15 text-[#7c3aed] rounded shrink-0" style={{ fontSize: "9.5px", fontWeight: 700 }}>
                        #{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#7c3aed]" style={{ fontSize: "10.5px", fontWeight: 700 }}>
                          {BLOCK_LABELS[blk.type] ?? blk.type}
                        </p>
                        <p className="text-muted-foreground mt-0.5 line-clamp-2" style={{ fontSize: "11px", lineHeight: 1.4 }}>
                          {summarizeContent(blk.content)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-secondary/20">
            <button onClick={handleClose}
              className="px-3 py-1.5 border border-border bg-card rounded-md hover:bg-secondary"
              style={{ fontSize: "12px" }}>
              Hủy
            </button>
            {!loading && previewBlocks.length > 0 && activeAction !== "similar" && (
              <button onClick={handleConfirm}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#7c3aed] text-white rounded-md hover:bg-[#6d28d9]"
                style={{ fontSize: "12px", fontWeight: 600 }}>
                <Plus className="w-3.5 h-3.5" /> Chèn {previewBlocks.length} block
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Main menu ── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-gradient-to-r from-[#7c3aed]/10 to-[#990803]/5">
          <div className="w-9 h-9 rounded-full bg-[#7c3aed] text-white flex items-center justify-center shrink-0">
            <Wand2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 style={{ fontSize: "15px", fontWeight: 700 }}>AI Trợ lý biên soạn</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ProgramBadge code={programCode} size="xs" />
              <span className="px-1.5 py-0.5 rounded text-white" style={{ fontSize: "10px", fontWeight: 600, backgroundColor: activePhaseColor }}>
                {activePhaseLabel}
              </span>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions list */}
        <div className="p-3 space-y-2">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.id}
                onClick={() => {
                  if (action.id === "sgk") {
                    handleClose();
                    onRequestSGKMap?.();
                    return;
                  }
                  runAction(action.id);
                }}
                className="w-full flex items-start gap-3 p-3 rounded-xl border border-border hover:border-[#7c3aed]/40 hover:bg-secondary/40 transition-all text-left">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: action.color + "20" }}>
                  <Icon className="w-4 h-4" style={{ color: action.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "12.5px", fontWeight: 600 }}>{action.label}</p>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px", lineHeight: 1.4 }}>{action.description}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-border bg-secondary/20 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#7c3aed]" />
          <p className="text-muted-foreground italic" style={{ fontSize: "10.5px" }}>
            AI gen kết quả dựa trên CT + phase + môn — luôn review và sửa trước khi dùng.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Block label lookup (avoid circular import với BlockComponents.tsx) ── */
const BLOCK_LABELS: Record<string, string> = {
  heading: "Tiêu đề", text: "Đoạn văn", image: "Hình ảnh", video: "Video",
  quiz: "Câu hỏi", code: "Đoạn code", attachment: "File đính kèm",
  "subject-roles": "Phân vai môn", "group-activity": "Hoạt động nhóm",
  rubric: "Rubric", "safety-notes": "Lưu ý an toàn",
  "research-question": "Câu hỏi NC", hypothesis: "Giả thuyết",
  "data-table": "Bảng dữ liệu", chart: "Biểu đồ", citation: "Trích dẫn",
};

function summarizeContent(content: unknown): string {
  if (typeof content === "string") return content.slice(0, 100);
  if (content && typeof content === "object") {
    const c = content as Record<string, unknown>;
    if ("text" in c) return String(c.text).slice(0, 100);
    if ("question" in c) return String(c.question).slice(0, 100);
    if ("caption" in c) return String(c.caption).slice(0, 100);
    if ("mainQuestion" in c) return String(c.mainQuestion).slice(0, 100);
    if ("ifClause" in c) return `Nếu ${String(c.ifClause).slice(0, 50)}...`;
    if ("goal" in c) return String(c.goal).slice(0, 100);
    if ("code" in c) return String(c.code).slice(0, 80);
    if ("notes" in c && Array.isArray(c.notes)) return (c.notes as string[]).join(" · ").slice(0, 100);
    if ("rows" in c && Array.isArray(c.rows)) return `${(c.rows as unknown[]).length} dòng dữ liệu`;
    if ("criteria" in c && Array.isArray(c.criteria)) return `${(c.criteria as unknown[]).length} tiêu chí`;
    if ("citations" in c && Array.isArray(c.citations)) return `${(c.citations as unknown[]).length} trích dẫn`;
    if ("url" in c) return c.url ? `URL: ${String(c.url).slice(0, 80)}` : "Chưa có URL";
    if ("fileName" in c) return String(c.fileName);
  }
  return "(nội dung sẽ điền sau khi gen)";
}

export default AIAssistMenu;
