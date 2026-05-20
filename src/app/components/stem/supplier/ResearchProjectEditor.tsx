/* ================================================================ */
/*  RESEARCH PROJECT EDITOR (CT5) — Editor riêng cho Nghiên cứu KH   */
/*  Routes:                                                           */
/*    /supplier/content/authoring/research/new?ct=CT5&...            */
/*    /supplier/content/authoring/research/:lessonId                  */
/*  Khác LessonEditor:                                                */
/*   - 8 phase NCKH vertical timeline (thay grid)                    */
/*   - Settings không có "thời lượng phút"                           */
/*   - Có Plan 5 năm UI                                              */
/*   - Có Câu hỏi NC + Giả thuyết + Phương pháp ở canvas             */
/* ================================================================ */

import { useState, useMemo, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft, Settings, Eye, Save, Plus, GripVertical, Trash2,
  Microscope, FileText, AlertTriangle, Wand2, CheckSquare, Square, Send,
  Target, Award, Cpu, ClipboardList, ChevronDown, ChevronUp, CalendarRange,
  Quote, TrendingUp, BarChart3, BookOpen, Video, Image as ImageIcon,
  Code2, HelpCircle, Upload, Layers, Users, Sparkles,
} from "lucide-react";
import {
  CT_TEMPLATES, CT5_TOPICS, COMPETENCY_LIST, COMPETENCY_META,
  STEM_PROGRAMS, DEVICES,
  type BlockType, type Competency, type DeviceEntry,
} from "../../mock-data/index";
import { ProgramBadge } from "../ui/badges";
import { toast } from "@/app/lib/toast";
import { renderEditableBlock, getDefaultBlockContent } from "../lesson-blocks/BlockComponents";
import { AttachmentSlotsPanel, type AttachmentInstance } from "../lesson-blocks/AttachmentSlotsPanel";
import { ValidationDialog } from "../lesson-blocks/ValidationDialog";
import { AIAssistMenu, type AIGeneratedBlock } from "../lesson-blocks/AIAssistMenu";
import { AutoSaveIndicator } from "../lesson-blocks/AutoSaveIndicator";
import { LessonPreviewModal } from "../lesson-blocks/LessonPreviewModal";
import { validateLessonDraft, type LessonValidationResult } from "@/app/lib/ct-utils";
import { useAutoSave } from "@/app/lib/useAutoSave";
import { useBlockDragDrop } from "@/app/lib/useBlockDragDrop";

/* ================================================================ */
/*  Block metadata — 16 loại (sync với LessonEditor)                 */
/* ================================================================ */
const BLOCK_META: Record<BlockType, { label: string; icon: typeof FileText; color: string }> = {
  heading:           { label: "Tiêu đề",          icon: BookOpen,      color: "#990803" },
  text:              { label: "Đoạn văn",         icon: FileText,      color: "#0891b2" },
  video:             { label: "Video",            icon: Video,         color: "#dc2626" },
  image:             { label: "Hình ảnh",         icon: ImageIcon,     color: "#16a34a" },
  quiz:              { label: "Câu hỏi",          icon: HelpCircle,    color: "#c8a84e" },
  code:              { label: "Đoạn code",        icon: Code2,         color: "#7c3aed" },
  attachment:        { label: "File đính kèm",    icon: Upload,        color: "#64748b" },
  "subject-roles":   { label: "Phân vai môn",     icon: Layers,        color: "#0891b2" },
  "group-activity":  { label: "Hoạt động nhóm",   icon: Users,         color: "#7c3aed" },
  rubric:            { label: "Rubric",           icon: ClipboardList, color: "#c8a84e" },
  "safety-notes":    { label: "Lưu ý an toàn",    icon: AlertTriangle, color: "#dc2626" },
  "research-question": { label: "Câu hỏi NC",     icon: Microscope,    color: "#1e3a8a" },
  hypothesis:        { label: "Giả thuyết",       icon: TrendingUp,    color: "#0891b2" },
  "data-table":      { label: "Bảng dữ liệu",     icon: BarChart3,     color: "#c8a84e" },
  chart:             { label: "Biểu đồ",          icon: BarChart3,     color: "#ea580c" },
  citation:          { label: "Trích dẫn",        icon: Quote,         color: "#64748b" },
};

interface Block {
  id: string;
  type: BlockType;
  content: unknown;
  phaseId: string;
}

type ProjectStatus = "draft" | "review" | "researching" | "data_collection" | "writing" | "published" | "completed";

const STATUS_META: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  draft:            { label: "Nháp",            color: "#94a3b8", bg: "#94a3b820" },
  review:           { label: "Chờ duyệt",       color: "#f59e0b", bg: "#f59e0b20" },
  researching:      { label: "Đang nghiên cứu", color: "#7c3aed", bg: "#7c3aed20" },
  data_collection:  { label: "Thu thập dữ liệu", color: "#0891b2", bg: "#0891b220" },
  writing:          { label: "Đang viết báo cáo", color: "#c8a84e", bg: "#c8a84e20" },
  published:        { label: "Đã công bố",      color: "#16a34a", bg: "#16a34a20" },
  completed:        { label: "Hoàn tất",        color: "#64748b", bg: "#64748b20" },
};

/* ================================================================ */
/*  Mock draft loader                                                */
/* ================================================================ */
const DRAFT_RESEARCH: Record<string, {
  title: string; topicCode: string; grade: string;
  leadStudent: string; mentorTeacher: string;
  researchQuestion: string; hypothesis: string; methodology: string;
  expectedDuration: "3m" | "6m" | "1y" | "2y";
  status: ProjectStatus;
}> = {
  D3: {
    title: "NCKH: Nghiên cứu lọc nước từ thực vật",
    topicCode: "T01", grade: "THPT 11",
    leadStudent: "Nguyễn Văn An",
    mentorTeacher: "Cô Trần Thị Hoa",
    researchQuestion: "Loại thực vật nào trong môi trường địa phương có khả năng lọc nước tốt nhất?",
    hypothesis: "Vỏ chuối + lục bình có khả năng lọc nước tốt hơn rau muống vì có cấu trúc xơ dày hơn.",
    methodology: "Thực nghiệm so sánh — đo TDS, độ đục, vi sinh trước/sau lọc.",
    expectedDuration: "6m",
    status: "data_collection",
  },
  D7: {
    title: "Phân tích chất dinh dưỡng bằng smartphone",
    topicCode: "T04", grade: "THPT 12",
    leadStudent: "Lê Minh Hằng",
    mentorTeacher: "Thầy Phạm Văn Đức",
    researchQuestion: "Có thể dùng smartphone camera để đánh giá hàm lượng chất dinh dưỡng cơ bản trong rau quả không?",
    hypothesis: "Sử dụng deep learning trên ảnh smartphone có thể phân loại độ tươi/dinh dưỡng với accuracy ≥ 70%.",
    methodology: "Train mô hình computer vision phân loại + đối chiếu với phương pháp chuẩn (HPLC).",
    expectedDuration: "1y",
    status: "researching",
  },
};

/* ================================================================ */
/*  Main component                                                   */
/* ================================================================ */
export function ResearchProjectEditor() {
  const { lessonId = "new" } = useParams<{ lessonId: string }>();
  const [searchParams] = useSearchParams();

  const meta0 = DRAFT_RESEARCH[lessonId];

  const topicFromParams = searchParams.get("topic");
  const gradeFromParams = searchParams.get("grade");
  const initTopicCode = topicFromParams ?? meta0?.topicCode ?? "";
  const initTopic = CT5_TOPICS.find((t) => t.id === initTopicCode);

  /* ── State ── */
  const [title, setTitle] = useState(meta0?.title ?? (initTopic ? `NCKH: ${initTopic.name}` : "Đề tài NCKH mới"));
  const [grade, setGrade] = useState(gradeFromParams ?? meta0?.grade ?? "THPT 11");
  const [topicCode, setTopicCode] = useState(initTopicCode);
  const [leadStudent, setLeadStudent] = useState(meta0?.leadStudent ?? "");
  const [mentorTeacher, setMentorTeacher] = useState(meta0?.mentorTeacher ?? "");
  const [expectedDuration, setExpectedDuration] = useState<"3m" | "6m" | "1y" | "2y">(meta0?.expectedDuration ?? "6m");
  const [status, setStatus] = useState<ProjectStatus>(meta0?.status ?? "draft");

  /* Research-specific metadata */
  const [researchQuestion, setResearchQuestion] = useState(meta0?.researchQuestion ?? "");
  const [hypothesis, setHypothesis] = useState(meta0?.hypothesis ?? "");
  const [methodology, setMethodology] = useState(meta0?.methodology ?? "");
  const [expectedOutputs, setExpectedOutputs] = useState<string[]>([]);

  /* Plan 5 năm */
  const [showFiveYearPlan, setShowFiveYearPlan] = useState(false);
  const [fiveYearPlan, setFiveYearPlan] = useState<Array<{ year: number; goal: string }>>([
    { year: 1, goal: "Lớp 8: Bắt đầu CLB STEM, khảo sát sở thích nghiên cứu" },
    { year: 2, goal: "Lớp 9: Đề tài nhỏ — học phương pháp NCKH" },
    { year: 3, goal: "Lớp 10: Đề tài cấp trường, viết bài báo cấp trường" },
    { year: 4, goal: "Lớp 11: Đề tài hiện tại — dự thi cấp tỉnh" },
    { year: 5, goal: "Lớp 12: Mở rộng đề tài, dự thi quốc gia/quốc tế" },
  ]);

  /* Competencies — CT5 mặc định cả 6 */
  const [competencies, setCompetencies] = useState<Competency[]>([...COMPETENCY_LIST]);

  /* Required devices */
  const [requiredDevices, setRequiredDevices] = useState<Array<{ deviceId: string; qty: number }>>([]);
  const [showDevicePicker, setShowDevicePicker] = useState(false);

  /* Attachments */
  const [attachments, setAttachments] = useState<AttachmentInstance[]>([]);

  /* Validation dialog state */
  const [validationResult, setValidationResult] = useState<LessonValidationResult | null>(null);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);

  /* AI Assist menu state */
  const [aiMenuOpen, setAiMenuOpen] = useState(false);

  /* Preview modal */
  const [previewOpen, setPreviewOpen] = useState(false);

  /* Blocks — khai báo TRƯỚC autoSaveData/handlers (TDZ) */
  const template = CT_TEMPLATES.CT5;
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activePhase, setActivePhase] = useState<string>(template.phases[0].id);
  const [showSettings, setShowSettings] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!template.phases.find((p) => p.id === activePhase)) {
      setActivePhase(template.phases[0].id);
    }
  }, [activePhase, template]);

  const phaseBlocks = useMemo(
    () => blocks.filter((b) => b.phaseId === activePhase),
    [blocks, activePhase],
  );

  const phase = template.phases.find((p) => p.id === activePhase) ?? template.phases[0];
  const availableBlockTypes = template.availableBlocks;
  const mandatoryBlockTypes = template.mandatoryBlocks;

  const missingMandatoryBlocks = useMemo(() =>
    mandatoryBlockTypes.filter((bt) => !blocks.some((b) => b.type === bt)),
  [blocks, mandatoryBlockTypes]);

  const topic = CT5_TOPICS.find((t) => t.id === topicCode);

  /* Auto-save */
  const autoSaveData = useMemo(() => ({
    title, grade, topicCode, leadStudent, mentorTeacher, expectedDuration,
    status, researchQuestion, hypothesis, methodology, expectedOutputs,
    fiveYearPlan, competencies, requiredDevices, attachments, blocks,
  }), [title, grade, topicCode, leadStudent, mentorTeacher, expectedDuration,
       status, researchQuestion, hypothesis, methodology, expectedOutputs,
       fiveYearPlan, competencies, requiredDevices, attachments, blocks]);

  const { status: autoSaveStatus, lastSavedAt } = useAutoSave({
    data: autoSaveData,
    debounceMs: 30000,
    onSave: async () => {
      await new Promise((r) => setTimeout(r, 600));
    },
  });

  const handleAIInsertBlocks = (aiBlocks: AIGeneratedBlock[]) => {
    const newBlocks: Block[] = aiBlocks.map((b, idx) => ({
      id: `B-AI-${Date.now()}-${idx}`,
      type: b.type,
      content: b.content,
      phaseId: activePhase,
    }));
    setBlocks((prev) => [...prev, ...newBlocks]);
    toast.success(`AI đã chèn ${aiBlocks.length} block vào ${template.phases.find(p => p.id === activePhase)?.label}`);
  };

  const handleSubmitClick = () => {
    const result = validateLessonDraft({
      title,
      programCode: "CT5",
      ctMetadata: {
        topicCode,
        leadStudent,
        mentorTeacher,
        expectedDuration,
        researchQuestion,
        hypothesis,
        methodology,
        expectedOutputs,
      },
      blocks: blocks.map((b) => ({ type: b.type })),
      attachments: attachments.map((a) => ({ slotType: a.slotType, fileUrl: a.fileUrl })),
      competencies,
    });
    setValidationResult(result);
    setValidationDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    toast.success(`Đã gửi đề tài "${title}" để duyệt`);
  };

  /* ── Handlers ── */
  const addBlock = (type: BlockType) => {
    setBlocks([...blocks, {
      id: `B${Date.now()}`, type, phaseId: activePhase,
      content: getDefaultBlockContent(type),
    }]);
    setShowPicker(false);
    toast.success(`Đã thêm ${BLOCK_META[type].label}`);
  };

  const removeBlock = (id: string) => setBlocks(blocks.filter((b) => b.id !== id));
  const updateBlockContent = (id: string, newContent: unknown) =>
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, content: newContent } : b));

  const handleReorderPhase = (reorderedPhase: Block[]) => {
    const otherPhases = blocks.filter((b) => b.phaseId !== activePhase);
    setBlocks([...otherPhases, ...reorderedPhase]);
  };

  const dnd = useBlockDragDrop({
    items: phaseBlocks,
    getKey: (b) => b.id,
    onReorder: handleReorderPhase,
  });

  const toggleCompetency = (c: Competency) =>
    setCompetencies((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const toggleOutput = (o: string) =>
    setExpectedOutputs((prev) => prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]);

  const updateYearPlan = (year: number, goal: string) =>
    setFiveYearPlan((prev) => prev.map((y) => y.year === year ? { ...y, goal } : y));

  const addDevice = (d: DeviceEntry) => {
    if (requiredDevices.find((x) => x.deviceId === d.id)) return;
    setRequiredDevices((prev) => [...prev, { deviceId: d.id, qty: 1 }]);
  };
  const removeDevice = (id: string) => setRequiredDevices((prev) => prev.filter((x) => x.deviceId !== id));
  const setDeviceQty = (id: string, qty: number) =>
    setRequiredDevices((prev) => prev.map((x) => x.deviceId === id ? { ...x, qty: Math.max(1, qty) } : x));

  const sm = STATUS_META[status];
  const DURATION_LABELS: Record<typeof expectedDuration, string> = {
    "3m": "3 tháng", "6m": "6 tháng", "1y": "1 năm", "2y": "2 năm",
  };

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 60px)" }}>

      {/* ============ Top bar — research-specific ============ */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-2.5 flex items-center gap-2">
        <Link to="/supplier/content/authoring"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground shrink-0"
          style={{ fontSize: "12px" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Studio
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="px-1.5 py-0.5 bg-[#059669]/15 text-[#059669] rounded shrink-0" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em" }}>
          NCKH
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 bg-transparent text-foreground outline-none font-semibold min-w-0"
          style={{ fontSize: "14px" }}
        />
        <div className="flex items-center gap-1.5 shrink-0">
          <ProgramBadge code="CT5" size="xs" />
          <span className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "10.5px" }}>{grade}</span>
          <span className="px-2 py-0.5 rounded" style={{ fontSize: "10.5px", color: "#c8a84e", backgroundColor: "#c8a84e20", fontWeight: 600 }}>
            {DURATION_LABELS[expectedDuration]}
          </span>
          <span className="px-2 py-0.5 rounded" style={{ fontSize: "10.5px", fontWeight: 700, color: sm.color, backgroundColor: sm.bg }}>
            {sm.label}
          </span>
        </div>
        <div className="hidden md:block shrink-0 pl-1 border-l border-border ml-1">
          <AutoSaveIndicator status={autoSaveStatus} lastSavedAt={lastSavedAt} />
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <button onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-md border transition-colors ${showSettings ? "bg-secondary border-border" : "border-transparent hover:bg-secondary"}`}
            title="Cài đặt">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-border rounded-md hover:bg-secondary"
            style={{ fontSize: "12px" }}>
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button onClick={() => toast.success(`Đã lưu nháp "${title}"`)}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-border rounded-md hover:bg-secondary"
            style={{ fontSize: "12px" }}>
            <Save className="w-3.5 h-3.5" /> Lưu
          </button>
          <button onClick={handleSubmitClick}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#059669] text-white rounded-md hover:opacity-90"
            style={{ fontSize: "12px", fontWeight: 600 }}>
            <Send className="w-3.5 h-3.5" /> Gửi duyệt
          </button>
        </div>
      </div>

      <ValidationDialog
        open={validationDialogOpen}
        result={validationResult}
        onClose={() => setValidationDialogOpen(false)}
        onConfirmSubmit={handleConfirmSubmit}
        lessonTitle={title}
      />

      <AIAssistMenu
        open={aiMenuOpen}
        onClose={() => setAiMenuOpen(false)}
        programCode="CT5"
        activePhaseId={activePhase}
        activePhaseLabel={phase.label}
        activePhaseColor={phase.color}
        grade={grade}
        subject={topic?.field}
        existingPhaseBlocks={phaseBlocks}
        onInsertBlocks={handleAIInsertBlocks}
      />

      <LessonPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={title}
        programCode="CT5"
        grade={grade}
        subject={topic?.field}
        durationMinutes={0}
        phases={template.phases}
        blocks={blocks}
        competencies={competencies}
        requiredDevices={requiredDevices}
      />

      {/* ============ Body: 3-col layout ============ */}
      <div className="flex-1 grid"
        style={{
          gridTemplateColumns: showSettings ? "260px 1fr 300px" : "260px 1fr",
          minHeight: "calc(100vh - 112px)",
        }}>

        {/* ─── Phase sidebar — VERTICAL TIMELINE 8 phase ─── */}
        <div className="border-r border-border bg-card/50 p-3 overflow-y-auto">
          <p className="text-muted-foreground mb-3 flex items-center gap-1.5" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em" }}>
            <Microscope className="w-3 h-3" />
            8 PHASE NGHIÊN CỨU
          </p>

          {/* Timeline */}
          <div className="relative space-y-0">
            {/* Vertical line */}
            <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />

            {template.phases.map((ph, idx) => {
              const cnt = blocks.filter((b) => b.phaseId === ph.id).length;
              const isActive = ph.id === activePhase;
              const hasContent = cnt > 0;

              return (
                <button key={ph.id} onClick={() => setActivePhase(ph.id)}
                  className={`relative w-full text-left py-1.5 transition-all hover:bg-secondary/40 rounded-md ${isActive ? "bg-secondary/60" : ""}`}>
                  <div className="flex items-center gap-2.5 pl-1.5 pr-2">
                    <div
                      className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        hasContent ? "text-white" : isActive ? "border-2" : "bg-secondary text-muted-foreground"
                      }`}
                      style={{
                        backgroundColor: hasContent || isActive ? ph.color : undefined,
                        borderColor: isActive && !hasContent ? ph.color : undefined,
                      }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: isActive && !hasContent ? ph.color : undefined }}>
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate" style={{ fontSize: "11.5px", fontWeight: isActive ? 700 : 500, color: isActive ? ph.color : undefined }}>
                        {ph.label}
                      </p>
                      <p className="text-muted-foreground truncate" style={{ fontSize: "9.5px" }}>
                        {cnt > 0 ? `${cnt} block` : "Chưa có nội dung"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* AI Assist — mở menu 5 actions */}
          <button onClick={() => setAiMenuOpen(true)}
            className="mt-4 w-full flex items-center gap-2 p-2.5 bg-gradient-to-br from-[#7c3aed]/10 to-[#059669]/5 rounded-lg border border-[#7c3aed]/30 hover:border-[#7c3aed]/60 hover:shadow-md transition-all text-left">
            <div className="w-7 h-7 rounded-md bg-[#7c3aed] text-white flex items-center justify-center shrink-0">
              <Wand2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#7c3aed]" style={{ fontSize: "11px", fontWeight: 700 }}>AI Trợ lý NCKH</p>
              <p className="text-muted-foreground" style={{ fontSize: "10px", lineHeight: 1.35 }}>
                Template <strong style={{ color: phase.color }}>{phase.label}</strong> + sinh quiz + tìm tương tự
              </p>
            </div>
          </button>

          {/* Topic info */}
          {topic && (
            <div className="mt-3 p-2 bg-[#059669]/5 border border-[#059669]/20 rounded-lg">
              <p className="text-[#059669] mb-0.5" style={{ fontSize: "9.5px", fontWeight: 700, letterSpacing: "0.04em" }}>
                CHỦ ĐỀ NCKH
              </p>
              <p style={{ fontSize: "11px", fontWeight: 600, lineHeight: 1.3 }}>{topic.name}</p>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "9.5px" }}>{topic.field}</p>
            </div>
          )}
        </div>

        {/* ─── Editor canvas ─── */}
        <div className="p-4 space-y-3 overflow-y-auto">

          {/* === Section: Research metadata at top === */}
          <div className="bg-card rounded-xl border border-[#1e3a8a]/30 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1e3a8a]/5 border-b border-border">
              <Microscope className="w-4 h-4 text-[#1e3a8a]" />
              <span style={{ fontSize: "13px", fontWeight: 600 }}>Thông tin đề tài</span>
              <span className="ml-auto text-muted-foreground" style={{ fontSize: "10.5px" }}>
                Lead: <strong>{leadStudent || "—"}</strong> · Mentor: <strong>{mentorTeacher || "—"}</strong>
              </span>
            </div>
            <div className="p-4 space-y-3">
              {/* Research question */}
              <div>
                <label className="flex items-center gap-1.5 mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>
                  <span className="text-[#1e3a8a]">🔬</span> CÂU HỎI NGHIÊN CỨU
                  <span className="text-[#990803]">*</span>
                </label>
                <textarea value={researchQuestion} onChange={(e) => setResearchQuestion(e.target.value)}
                  rows={2} placeholder="Câu hỏi chính cần trả lời..."
                  className="w-full px-2 py-1.5 bg-input-background border border-border rounded-md outline-none focus:border-[#1e3a8a]/40 resize-none"
                  style={{ fontSize: "12px", fontStyle: "italic", lineHeight: 1.5 }} />
              </div>

              {/* Hypothesis + Methodology side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>
                    <span className="text-[#0891b2]">📐</span> GIẢ THUYẾT
                  </label>
                  <textarea value={hypothesis} onChange={(e) => setHypothesis(e.target.value)}
                    rows={2} placeholder="Nếu... thì... vì..."
                    className="w-full px-2 py-1.5 bg-input-background border border-border rounded-md outline-none focus:border-[#0891b2]/40 resize-none"
                    style={{ fontSize: "11.5px", lineHeight: 1.45 }} />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>
                    <span className="text-[#16a34a]">🔬</span> PHƯƠNG PHÁP
                  </label>
                  <textarea value={methodology} onChange={(e) => setMethodology(e.target.value)}
                    rows={2} placeholder="Thí nghiệm / Khảo sát / Mô phỏng..."
                    className="w-full px-2 py-1.5 bg-input-background border border-border rounded-md outline-none focus:border-[#16a34a]/40 resize-none"
                    style={{ fontSize: "11.5px", lineHeight: 1.45 }} />
                </div>
              </div>

              {/* Expected outputs */}
              <div>
                <label className="flex items-center gap-1.5 mb-1.5" style={{ fontSize: "11px", fontWeight: 600 }}>
                  <span className="text-[#c8a84e]">🎯</span> ĐẦU RA DỰ KIẾN
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "paper", label: "📄 Bài báo KH",   color: "#990803" },
                    { id: "poster", label: "🖼️ Poster",       color: "#0891b2" },
                    { id: "competition", label: "🏆 Hội thi KH-KT", color: "#c8a84e" },
                    { id: "real_product", label: "📦 Sản phẩm thực", color: "#16a34a" },
                  ].map((o) => {
                    const active = expectedOutputs.includes(o.id);
                    return (
                      <button key={o.id} onClick={() => toggleOutput(o.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-all ${
                          active ? "text-white border-transparent" : "border-border bg-card hover:bg-secondary"
                        }`}
                        style={{ fontSize: "11px", fontWeight: 500, ...(active ? { backgroundColor: o.color } : {}) }}>
                        {active && <CheckSquare className="w-3 h-3" />}
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* === Section: Plan 5 năm === */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button onClick={() => setShowFiveYearPlan((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-[#c8a84e]" />
                <span style={{ fontSize: "13px", fontWeight: 600 }}>Kế hoạch 5 năm</span>
                <span className="px-1.5 py-0.5 bg-[#c8a84e]/15 text-[#c8a84e] rounded" style={{ fontSize: "9.5px", fontWeight: 700 }}>
                  HS năng khiếu
                </span>
              </div>
              {showFiveYearPlan ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {showFiveYearPlan && (
              <div className="px-4 pb-4 border-t border-border pt-3">
                <p className="text-muted-foreground mb-3" style={{ fontSize: "11px", lineHeight: 1.5 }}>
                  Định hướng nghiên cứu dài hạn cho HS năng khiếu — Lớp 8 → Lớp 12.
                </p>
                <div className="relative">
                  <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />
                  <div className="space-y-2">
                    {fiveYearPlan.map((y) => (
                      <div key={y.year} className="flex items-start gap-2.5 pl-1">
                        <div className="relative z-10 w-6 h-6 rounded-full bg-[#c8a84e] text-white flex items-center justify-center shrink-0"
                          style={{ fontSize: "10px", fontWeight: 700 }}>
                          {y.year}
                        </div>
                        <input value={y.goal} onChange={(e) => updateYearPlan(y.year, e.target.value)}
                          placeholder={`Mục tiêu năm ${y.year}...`}
                          className="flex-1 px-2 py-1.5 bg-card border border-border rounded outline-none focus:border-[#c8a84e]/40"
                          style={{ fontSize: "11.5px" }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* === Section: Thiết bị cần === */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#0891b2]" />
                <span style={{ fontSize: "13px", fontWeight: 600 }}>Thiết bị & Vật tư nghiên cứu</span>
                {requiredDevices.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-[#0891b2]/10 text-[#0891b2] rounded-full" style={{ fontSize: "10px", fontWeight: 700 }}>
                    {requiredDevices.length}
                  </span>
                )}
              </div>
              <button onClick={() => setShowDevicePicker((v) => !v)}
                className="flex items-center gap-1 px-2.5 py-1 border border-border bg-card rounded-md hover:bg-secondary"
                style={{ fontSize: "11px", fontWeight: 500 }}>
                <Plus className="w-3 h-3" /> Thêm
              </button>
            </div>
            {requiredDevices.length > 0 && (
              <div className="px-4 py-2 divide-y divide-border">
                {requiredDevices.map((d) => {
                  const dev = DEVICES.find((x) => x.id === d.deviceId);
                  if (!dev) return null;
                  return (
                    <div key={d.deviceId} className="flex items-center gap-2 py-1.5">
                      <span className="flex-1 truncate" style={{ fontSize: "12px" }}>{dev.name}</span>
                      <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{dev.category}</span>
                      <input type="number" min={1} value={d.qty}
                        onChange={(e) => setDeviceQty(d.deviceId, Number(e.target.value))}
                        className="w-14 px-1.5 py-0.5 bg-card border border-border rounded text-center"
                        style={{ fontSize: "11.5px" }} />
                      <button onClick={() => removeDevice(d.deviceId)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {showDevicePicker && (
              <div className="px-4 py-3 border-t border-border bg-secondary/30 max-h-48 overflow-y-auto">
                <div className="space-y-1">
                  {DEVICES.filter((d) => d.active).map((d) => {
                    const added = requiredDevices.find((x) => x.deviceId === d.id);
                    return (
                      <button key={d.id} onClick={() => !added && addDevice(d)} disabled={!!added}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left ${
                          added ? "opacity-50 cursor-default" : "hover:bg-card cursor-pointer"
                        }`}>
                        <span className="flex-1 truncate" style={{ fontSize: "11.5px" }}>{d.name}</span>
                        <span className="text-muted-foreground shrink-0" style={{ fontSize: "10px" }}>{d.category}</span>
                        {added && <CheckSquare className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* === Phase header === */}
          <div className="flex items-center gap-2 pt-2 pb-1.5 border-b border-border">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: phase.color, fontSize: "11px", fontWeight: 700 }}>
              {template.phases.findIndex((p) => p.id === phase.id) + 1}
            </div>
            <h2 style={{ fontSize: "15px", fontWeight: 700 }}>{phase.label}</h2>
            <span className="text-muted-foreground hidden lg:block ml-2" style={{ fontSize: "11.5px", fontStyle: "italic" }}>
              {phase.hint}
            </span>
            <span className="ml-auto text-muted-foreground" style={{ fontSize: "10.5px" }}>
              {phaseBlocks.length} block trong phase này
            </span>
          </div>

          {/* === Block list === */}
          <div className="space-y-2">
            {phaseBlocks.map((b, idx) => {
              const meta = BLOCK_META[b.type];
              const Icon = meta.icon;
              const isMandatory = mandatoryBlockTypes.includes(b.type);
              const dragProps = dnd.getDragProps(b);
              const isHover = dnd.hoverTargetId === b.id;
              return (
                <div key={b.id}
                  {...dragProps}
                  className={`relative bg-card rounded-xl border p-3 transition-all group ${
                    dragProps["data-dragging"] ? "opacity-50" : "border-border hover:border-[#059669]/30"
                  }`}>
                  {isHover && dnd.hoverPosition === "before" && (
                    <div className="absolute -top-1 left-0 right-0 h-0.5 bg-[#059669] rounded-full z-10" />
                  )}
                  {isHover && dnd.hoverPosition === "after" && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#059669] rounded-full z-10" />
                  )}
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing mt-1" title="Kéo để sắp xếp lại">
                      <GripVertical className="w-4 h-4" />
                    </span>
                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: meta.color + "18" }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>#{idx + 1}</span>
                        <span className="px-1.5 py-0.5 rounded"
                          style={{ fontSize: "9.5px", fontWeight: 600, color: meta.color, backgroundColor: meta.color + "18" }}>
                          {meta.label}
                        </span>
                        {isMandatory && (
                          <span className="px-1 py-0.5 bg-[#16a34a]/15 text-[#16a34a] rounded" style={{ fontSize: "9px", fontWeight: 700 }}>
                            Bắt buộc ✓
                          </span>
                        )}
                      </div>
                      {renderEditableBlock(b.type, b.content, (next) => updateBlockContent(b.id, next))}
                    </div>
                    <button onClick={() => removeBlock(b.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity mt-1 shrink-0"
                      title="Xóa block">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {phaseBlocks.length === 0 && (
              <div className="bg-card rounded-xl border border-dashed p-8 text-center"
                style={{ borderColor: phase.color + "40" }}>
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: phase.color + "15" }}>
                  <Plus className="w-6 h-6" style={{ color: phase.color }} />
                </div>
                <p className="text-muted-foreground" style={{ fontSize: "12.5px" }}>
                  Chưa có nội dung cho <strong>{phase.label}</strong>.
                </p>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "11.5px", lineHeight: 1.4 }}>
                  {phase.hint}
                </p>
              </div>
            )}
          </div>

          {/* === Block picker === */}
          {showPicker ? (
            <div className="bg-card rounded-xl border border-border p-3">
              <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>
                CHỌN LOẠI BLOCK CHO <span style={{ color: phase.color }}>{phase.label.toUpperCase()}</span> ({availableBlockTypes.length} loại):
              </p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5">
                {availableBlockTypes.map((t) => {
                  const bm = BLOCK_META[t];
                  const BIcon = bm.icon;
                  const isMandatory = mandatoryBlockTypes.includes(t);
                  return (
                    <button key={t} onClick={() => addBlock(t)}
                      className="relative flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-secondary transition-colors border border-border">
                      {isMandatory && <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#16a34a] rounded-full" title="Bắt buộc" />}
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: bm.color + "18" }}>
                        <BIcon className="w-4 h-4" style={{ color: bm.color }} />
                      </div>
                      <span style={{ fontSize: "10.5px", textAlign: "center" }}>{bm.label}</span>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setShowPicker(false)}
                className="mt-2.5 text-muted-foreground hover:text-foreground"
                style={{ fontSize: "11px" }}>
                Đóng
              </button>
            </div>
          ) : (
            <button onClick={() => setShowPicker(true)}
              className="w-full py-2.5 border-2 border-dashed rounded-xl hover:border-[#059669]/50 hover:bg-[#059669]/5 transition-colors flex items-center justify-center gap-1.5 text-muted-foreground hover:text-[#059669]"
              style={{ borderColor: "#d1d5db", fontSize: "12.5px" }}>
              <Plus className="w-4 h-4" /> Thêm block vào <strong className="ml-0.5">{phase.label}</strong>
            </button>
          )}

          {/* AttachmentSlotsPanel */}
          <div className="mt-6">
            <AttachmentSlotsPanel attachments={attachments} onChange={setAttachments} />
          </div>
        </div>

        {/* ─── Settings panel — research-specific ─── */}
        {showSettings && (
          <div className="border-l border-border bg-card/30 p-4 space-y-4 overflow-y-auto">
            <p style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.07em" }} className="text-muted-foreground">
              CÀI ĐẶT ĐỀ TÀI NCKH
            </p>

            {/* Status */}
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>TRẠNG THÁI</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-2 py-1.5 bg-card border border-border rounded-md" style={{ fontSize: "12px" }}>
                {(Object.keys(STATUS_META) as ProjectStatus[]).map((s) =>
                  <option key={s} value={s}>{STATUS_META[s].label}</option>
                )}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>CHỦ ĐỀ NCKH</label>
              <select value={topicCode} onChange={(e) => setTopicCode(e.target.value)}
                className="w-full px-2 py-1.5 bg-card border border-border rounded-md" style={{ fontSize: "11.5px" }}>
                <option value="">-- Chọn chủ đề --</option>
                {CT5_TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>{t.id} — {t.name}</option>
                ))}
              </select>
              {topic && (
                <div className="mt-1.5 p-2 bg-[#059669]/5 border border-[#059669]/15 rounded">
                  <p className="text-[#059669]" style={{ fontSize: "10px", fontWeight: 700 }}>{topic.field}</p>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10.5px", lineHeight: 1.4 }}>{topic.description}</p>
                </div>
              )}
            </div>

            {/* Khối */}
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>KHỐI LỚP</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)}
                className="w-full px-2 py-1.5 bg-card border border-border rounded-md" style={{ fontSize: "12px" }}>
                {["THCS 6", "THCS 7", "THCS 8", "THCS 9", "THPT 10", "THPT 11", "THPT 12"].map((g) =>
                  <option key={g} value={g}>{g}</option>
                )}
              </select>
            </div>

            {/* Lead student */}
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>HS DẪN ĐẦU <span className="text-[#990803]">*</span></label>
              <input value={leadStudent} onChange={(e) => setLeadStudent(e.target.value)}
                placeholder="Tên HS năng khiếu"
                className="w-full px-2 py-1.5 bg-card border border-border rounded-md" style={{ fontSize: "12px" }} />
            </div>

            {/* Mentor */}
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>GV HƯỚNG DẪN <span className="text-[#990803]">*</span></label>
              <input value={mentorTeacher} onChange={(e) => setMentorTeacher(e.target.value)}
                placeholder="Tên GV"
                className="w-full px-2 py-1.5 bg-card border border-border rounded-md" style={{ fontSize: "12px" }} />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>THỜI GIAN DỰ KIẾN</label>
              <div className="grid grid-cols-4 gap-1">
                {(["3m", "6m", "1y", "2y"] as const).map((d) => (
                  <button key={d} onClick={() => setExpectedDuration(d)}
                    className={`px-1 py-1.5 rounded border transition-all ${expectedDuration === d ? "bg-[#c8a84e] text-white border-[#c8a84e]" : "bg-card border-border hover:bg-secondary"}`}
                    style={{ fontSize: "10.5px", fontWeight: 500 }}>
                    {DURATION_LABELS[d]}
                  </button>
                ))}
              </div>
            </div>

            {/* Competencies */}
            <div className="border-t border-border pt-3">
              <label className="text-muted-foreground mb-1.5 flex items-center gap-1" style={{ fontSize: "10px", fontWeight: 600 }}>
                <Award className="w-3 h-3" /> NĂNG LỰC ({competencies.length}/6)
              </label>
              <div className="space-y-1">
                {COMPETENCY_LIST.map((c) => {
                  const m = COMPETENCY_META[c];
                  const active = competencies.includes(c);
                  return (
                    <button key={c} onClick={() => toggleCompetency(c)}
                      className={`w-full flex items-center gap-1.5 px-2 py-1 rounded border transition-all ${
                        active ? "border-transparent text-white" : "border-border bg-card hover:bg-secondary"
                      }`}
                      style={{ fontSize: "10.5px", fontWeight: 500, ...(active ? { backgroundColor: m.color } : {}) }}>
                      {active ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3 text-muted-foreground" />}
                      <span className="text-left">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Block usage */}
            <div className="border-t border-border pt-3">
              <label className="block text-muted-foreground mb-2" style={{ fontSize: "10px", fontWeight: 600 }}>
                BLOCK ĐÃ DÙNG
              </label>
              <div className="space-y-1.5">
                {availableBlockTypes.map((t) => {
                  const bm = BLOCK_META[t];
                  const used = blocks.some((b) => b.type === t);
                  const isMandatory = mandatoryBlockTypes.includes(t);
                  const BIcon = bm.icon;
                  return (
                    <div key={t} className="flex items-center gap-2">
                      {used
                        ? <CheckSquare className="w-3.5 h-3.5 shrink-0" style={{ color: bm.color }} />
                        : <Square className="w-3.5 h-3.5 shrink-0 text-muted-foreground/40" />}
                      <BIcon className="w-3 h-3 shrink-0" style={{ color: used ? bm.color : "#94a3b8" }} />
                      <span className="flex-1 truncate" style={{ fontSize: "11px", color: used ? "inherit" : "#94a3b8" }}>{bm.label}</span>
                      {isMandatory && (
                        <span className="px-1 bg-[#16a34a]/15 text-[#16a34a] rounded" style={{ fontSize: "8.5px", fontWeight: 700 }}>★</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phase progress */}
            <div className="border-t border-border pt-3">
              <label className="block text-muted-foreground mb-2" style={{ fontSize: "10px", fontWeight: 600 }}>
                TIẾN ĐỘ 8 PHASE
              </label>
              <div className="space-y-1.5">
                {template.phases.map((ph, idx) => {
                  const cnt = blocks.filter((b) => b.phaseId === ph.id).length;
                  const isActive = ph.id === activePhase;
                  return (
                    <button key={ph.id} onClick={() => setActivePhase(ph.id)}
                      className={`w-full text-left ${isActive ? "bg-secondary/60 -mx-1 px-1 py-0.5 rounded" : ""}`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: cnt > 0 ? ph.color : "#e2e8f0" }} />
                        <span className="flex-1 truncate" style={{ fontSize: "10.5px", fontWeight: isActive ? 700 : 500 }}>
                          {idx + 1}. {ph.label}
                        </span>
                        <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{cnt}b</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mandatory warnings */}
            {missingMandatoryBlocks.length > 0 && (
              <div className="border-t border-border pt-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
                  <div className="flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                    <span className="text-orange-600 dark:text-orange-400" style={{ fontSize: "10px", fontWeight: 700 }}>
                      THIẾU BLOCK BẮT BUỘC
                    </span>
                  </div>
                  <ul className="space-y-0.5" style={{ fontSize: "10px" }}>
                    {missingMandatoryBlocks.map((bt) => (
                      <li key={bt} className="text-orange-700 dark:text-orange-300">• {BLOCK_META[bt].label}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResearchProjectEditor;
