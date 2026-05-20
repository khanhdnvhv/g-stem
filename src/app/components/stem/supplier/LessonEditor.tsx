/* ================================================================ */
/*  LESSON EDITOR — Block-based editor động per CT (CT1-CT5)         */
/*  Routes:                                                          */
/*   /supplier/content/authoring/new?ct=CT4&grade=THCS%208&...      */
/*   /supplier/content/authoring/:lessonId                          */
/*   /supplier/content/authoring/research/new?ct=CT5&...            */
/* ================================================================ */

import { useState, useMemo, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft, Settings, Eye, Save, Plus, GripVertical, Trash2,
  BookOpen, FileText, Video, Image as ImageIcon, Code2, HelpCircle,
  Upload, Circle, Wand2, CheckSquare, Square, Clock, Layers, Send,
  Target, Award, Cpu, AlertTriangle, Users, ClipboardList, Microscope,
  TrendingUp, Quote, BarChart3, Sparkles,
} from "lucide-react";
import {
  STEM_PROGRAMS, GRADE_LEVELS, SUBJECTS, CT_TEMPLATES, COMPETENCY_LIST,
  COMPETENCY_META, CT4_MODULES, CT5_TOPICS, DEVICES,
  type StemProgram, type BlockType, type Competency, type MetadataField,
  type DeviceEntry,
} from "../../mock-data/index";
import { ProgramBadge } from "../ui/badges";
import { toast } from "@/app/lib/toast";
import { renderEditableBlock, getDefaultBlockContent } from "../lesson-blocks/BlockComponents";
import { AttachmentSlotsPanel, type AttachmentInstance } from "../lesson-blocks/AttachmentSlotsPanel";
import { ValidationDialog } from "../lesson-blocks/ValidationDialog";
import { SGKPickerDialog } from "../lesson-blocks/SGKPickerDialog";
import { AIAssistMenu, type AIGeneratedBlock } from "../lesson-blocks/AIAssistMenu";
import { AutoSaveIndicator } from "../lesson-blocks/AutoSaveIndicator";
import { LessonPreviewModal } from "../lesson-blocks/LessonPreviewModal";
import { validateLessonDraft, type LessonValidationResult } from "@/app/lib/ct-utils";
import { useAutoSave } from "@/app/lib/useAutoSave";
import { useBlockDragDrop } from "@/app/lib/useBlockDragDrop";
import { findSGKLesson, STUDIO_LESSONS } from "../../mock-data/index";

/* ================================================================ */
/*  Block metadata — 16 loại                                         */
/* ================================================================ */
const BLOCK_META: Record<BlockType, { label: string; icon: typeof FileText; color: string }> = {
  // Existing 7
  heading:           { label: "Tiêu đề",          icon: BookOpen,      color: "#990803" },
  text:              { label: "Đoạn văn",         icon: FileText,      color: "#0891b2" },
  video:             { label: "Video",            icon: Video,         color: "#dc2626" },
  image:             { label: "Hình ảnh",         icon: ImageIcon,     color: "#16a34a" },
  quiz:              { label: "Câu hỏi",          icon: HelpCircle,    color: "#c8a84e" },
  code:              { label: "Đoạn code",        icon: Code2,         color: "#7c3aed" },
  attachment:        { label: "File đính kèm",    icon: Upload,        color: "#64748b" },
  // 9 New blocks (placeholder render in S3-S6)
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
  content: unknown;     // String backward compat + object cho block đầy đủ
  phaseId: string;
}

type LessonStatus = "draft" | "review" | "published";

const STATUS_META: Record<LessonStatus, { label: string; color: string; bg: string }> = {
  draft:     { label: "Nháp",       color: "#64748b", bg: "#64748b20" },
  review:    { label: "Chờ duyệt",  color: "#f59e0b", bg: "#f59e0b20" },
  published: { label: "Đã publish", color: "#16a34a", bg: "#16a34a20" },
};

/* ================================================================ */
/*  Mock draft loader — giữ backward compat với D1-D8                */
/* ================================================================ */
interface DraftMeta {
  title: string;
  program: StemProgram;
  grade: string;
  subject: string;
  durationMinutes: number;
  /* CT-specific extras */
  drivingSubject?: string;
  integratedSubjects?: string[];
  topic?: string;
  module?: string;
  ct5TopicCode?: string;
}

const DRAFT_META: Record<string, DraftMeta> = {
  new: { title: "Bài giảng STEM mới", program: "CT2", grade: "THCS 8", subject: "Toán", durationMinutes: 45 },
  D1: { title: "Lập trình robot né vật cản — Bài 3", program: "CT4", grade: "THCS 8", subject: "Công nghệ", durationMinutes: 45, module: "robotics_1" },
  D2: { title: "Đòn bẩy và công cơ học — Liên môn Toán-Lý", program: "CT2", grade: "THCS 8", subject: "Vật lý", durationMinutes: 45, drivingSubject: "Lý", integratedSubjects: ["Toán", "Công nghệ"], topic: "Đòn bẩy và công cơ học" },
  D3: { title: "NCKH: Nghiên cứu lọc nước từ thực vật", program: "CT5", grade: "THPT 11", subject: "Hóa học", durationMinutes: 60, ct5TopicCode: "T01" },
  D5: { title: "Cầu giấy chịu lực — Kỹ thuật tải trọng", program: "CT2", grade: "THCS 7", subject: "Toán", durationMinutes: 45, drivingSubject: "Toán", integratedSubjects: ["Mỹ thuật", "Công nghệ"], topic: "Cầu giấy chịu lực" },
  D7: { title: "Phân tích chất dinh dưỡng bằng smartphone", program: "CT5", grade: "THPT 12", subject: "Sinh học", durationMinutes: 90, ct5TopicCode: "T04" },
  D8: { title: "Nhà thông minh Arduino — Mô đun 1", program: "CT4", grade: "THCS 9", subject: "Tin học", durationMinutes: 45, module: "iot" },
};

const DRAFT_BLOCKS: Record<string, Block[]> = {
  D1: [
    { id: "B1", type: "heading", content: "Khởi động — Robot gặp chướng ngại vật?", phaseId: "warmup" },
    { id: "B2", type: "video", content: "Video demo robot né vật cản thực tế (2 phút)", phaseId: "warmup" },
    { id: "B3", type: "heading", content: "Cảm biến siêu âm HC-SR04 hoạt động thế nào?", phaseId: "theory" },
    { id: "B4", type: "text", content: "Cảm biến phát sóng âm tần số 40kHz, đo thời gian phản hồi để tính khoảng cách tới vật.", phaseId: "theory" },
    { id: "B5", type: "code", content: `int d = sonar.ping_cm();\nif (d < 20) turnLeft();\nelse moveForward();`, phaseId: "build" },
    { id: "B6", type: "safety-notes", content: "An toàn pin Li-Po: không sạc qua đêm. Kiểm tra dây trước khi cấp nguồn.", phaseId: "build" },
    { id: "B7", type: "quiz", content: "Nếu cảm biến đo được 15 cm, robot sẽ làm gì?", phaseId: "evaluate" },
  ],
  D2: [
    { id: "B1", type: "text", content: "Quan sát: kéo vật nặng bằng ròng rọc cố định và động — lực nào nhỏ hơn?", phaseId: "warmup" },
    { id: "B2", type: "heading", content: "Định nghĩa Đòn bẩy", phaseId: "knowledge" },
    { id: "B3", type: "text", content: "Đòn bẩy là thanh cứng có thể quay quanh một điểm tựa (O). F₁·d₁ = F₂·d₂.", phaseId: "knowledge" },
    { id: "B4", type: "subject-roles", content: "Phân vai môn", phaseId: "knowledge" },
  ],
  new: [],
};

/* ================================================================ */
/*  Main component                                                   */
/* ================================================================ */
export function LessonEditor() {
  const { lessonId = "new" } = useParams<{ lessonId: string }>();
  const [searchParams] = useSearchParams();

  /* ── Init từ query params (khi đến từ wizard) ── */
  const draftKey = lessonId in DRAFT_META ? lessonId : "new";
  const meta0 = DRAFT_META[draftKey];

  // Wizard query params override
  const ctFromParams = searchParams.get("ct") as StemProgram | null;
  const gradeFromParams = searchParams.get("grade");
  const subjectFromParams = searchParams.get("subject");
  const moduleFromParams = searchParams.get("module");
  const topicFromParams = searchParams.get("topic");

  const initCt = ctFromParams ?? meta0.program;
  const initTemplate = CT_TEMPLATES[initCt];
  const initGrade = gradeFromParams ?? meta0.grade;
  const initSubject = subjectFromParams ?? meta0.subject;
  const initTitle = lessonId === "new" && ctFromParams
    ? `Bài giảng ${initTemplate.shortName} mới`
    : meta0.title;
  const initDuration = lessonId === "new" && ctFromParams
    ? initTemplate.defaultDuration || 45
    : meta0.durationMinutes;

  /* ── State ── */
  const [title, setTitle] = useState(initTitle);
  const [program, setProgram] = useState<StemProgram>(initCt);
  const [grade, setGrade] = useState(initGrade);
  const [subject, setSubject] = useState(initSubject);
  const [duration, setDuration] = useState(initDuration);

  /* CT-specific metadata state (key-value) */
  const [ctMetadata, setCtMetadata] = useState<Record<string, unknown>>(() => {
    /* Step 1: nếu lessonId match STUDIO_LESSONS → dùng ctMetadata có sẵn */
    const studioLesson = STUDIO_LESSONS.find((l) => l.id === lessonId);
    if (studioLesson?.ctMetadata) {
      return { ...studioLesson.ctMetadata } as Record<string, unknown>;
    }

    /* Step 2: bài mới — build từ template + query params */
    const base: Record<string, unknown> = { type: initCt };
    if (initCt === "CT1") { base.subject = initSubject; }
    if (initCt === "CT2") {
      base.drivingSubject = meta0.drivingSubject ?? initSubject;
      base.integratedSubjects = meta0.integratedSubjects ?? [];
      base.topic = meta0.topic ?? "";
    }
    if (initCt === "CT3") {
      base.activityName = "";
      base.domain = "khac";
      base.finalProduct = "";
      base.studentsPerGroup = 4;
    }
    if (initCt === "CT4") {
      base.module = moduleFromParams ?? meta0.module ?? "robotics_1";
      base.language = "block";
      base.requiredHardware = [];
      base.safetyNotes = "";
    }
    if (initCt === "CT5") {
      base.topicCode = topicFromParams ?? meta0.ct5TopicCode ?? "";
      base.leadStudent = "";
      base.mentorTeacher = "";
      base.expectedDuration = "6m";
      base.researchQuestion = "";
      base.expectedOutputs = [];
    }
    return base;
  });

  /* Learning objectives */
  const [objKnowledge, setObjKnowledge] = useState("");
  const [objSkills, setObjSkills] = useState("");
  const [objAttitude, setObjAttitude] = useState("");
  const [competencies, setCompetencies] = useState<Competency[]>([]);

  /* Required devices */
  const [requiredDevices, setRequiredDevices] = useState<Array<{ deviceId: string; qty: number }>>([]);
  const [showDevicePicker, setShowDevicePicker] = useState(false);

  /* Attachments — 9 slot chuẩn */
  const [attachments, setAttachments] = useState<AttachmentInstance[]>([]);

  /* Status (workflow draft → review → published) */
  const [status, setStatus] = useState<LessonStatus>(() => {
    const studioLesson = STUDIO_LESSONS.find((l) => l.id === lessonId);
    return studioLesson?.status ?? "draft";
  });

  /* Validation dialog state */
  const [validationResult, setValidationResult] = useState<LessonValidationResult | null>(null);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);

  /* AI Assist menu state */
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  /* Global SGK dialog state (cho AI action 5) */
  const [aiSgkDialogOpen, setAiSgkDialogOpen] = useState(false);

  /* Preview modal */
  const [previewOpen, setPreviewOpen] = useState(false);

  /* Blocks — phải khai báo TRƯỚC autoSaveData/handlers (TDZ) */
  const [blocks, setBlocks] = useState<Block[]>(DRAFT_BLOCKS[draftKey] ?? []);
  const template = CT_TEMPLATES[program];
  const [activePhase, setActivePhase] = useState<string>(template.phases[0].id);
  const [showSettings, setShowSettings] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [showObjectives, setShowObjectives] = useState(true);

  /* Update activePhase when CT changes */
  useEffect(() => {
    const phases = CT_TEMPLATES[program].phases;
    if (!phases.find((p) => p.id === activePhase)) {
      setActivePhase(phases[0].id);
    }
  }, [program, activePhase]);

  /* ── Derived ── */
  const phaseBlocks = useMemo(
    () => blocks.filter((b) => b.phaseId === activePhase),
    [blocks, activePhase],
  );

  const phase = template.phases.find((p) => p.id === activePhase) ?? template.phases[0];
  const availableBlockTypes = template.availableBlocks;
  const mandatoryBlockTypes = template.mandatoryBlocks;

  /* Mandatory block check — warn if missing */
  const missingMandatoryBlocks = useMemo(() =>
    mandatoryBlockTypes.filter((bt) => !blocks.some((b) => b.type === bt)),
  [blocks, mandatoryBlockTypes]);

  /* ── Auto-save: debounce 30s sau mỗi thay đổi ── */
  const autoSaveData = useMemo(() => ({
    title, program, grade, subject, duration, ctMetadata,
    objKnowledge, objSkills, objAttitude, competencies,
    requiredDevices, attachments, blocks, status,
  }), [title, program, grade, subject, duration, ctMetadata,
       objKnowledge, objSkills, objAttitude, competencies,
       requiredDevices, attachments, blocks, status]);

  const { status: autoSaveStatus, lastSavedAt } = useAutoSave({
    data: autoSaveData,
    debounceMs: 30000,
    onSave: async () => {
      /* Mock save — in real app: API call */
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

  const handleAISGKConfirm = (refs: string[]) => {
    /* Bind theo CT — CT1 single, CT2 multi */
    if (program === "CT1") {
      setCtMetadata((m) => ({ ...m, sgkBook: refs[0] ?? "" }));
    } else if (program === "CT2") {
      setCtMetadata((m) => ({ ...m, sgkBooks: refs }));
    }
    toast.success(`Đã liên kết ${refs.length} bài SGK`);
  };

  const handleSubmitClick = () => {
    const result = validateLessonDraft({
      title,
      programCode: program,
      ctMetadata,
      blocks: blocks.map((b) => ({ type: b.type })),
      attachments: attachments.map((a) => ({ slotType: a.slotType, fileUrl: a.fileUrl })),
      competencies,
    });
    setValidationResult(result);
    setValidationDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    setStatus("review");
    toast.success(`Đã gửi bài giảng "${title}" để duyệt publish`);
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

  /* Reorder blocks trong cùng phase */
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

  const updateMetadata = (key: string, value: unknown) =>
    setCtMetadata((m) => ({ ...m, [key]: value }));

  const addDevice = (d: DeviceEntry) => {
    if (requiredDevices.find((x) => x.deviceId === d.id)) return;
    setRequiredDevices((prev) => [...prev, { deviceId: d.id, qty: 1 }]);
  };
  const removeDevice = (id: string) => setRequiredDevices((prev) => prev.filter((x) => x.deviceId !== id));
  const setDeviceQty = (id: string, qty: number) =>
    setRequiredDevices((prev) => prev.map((x) => x.deviceId === id ? { ...x, qty: Math.max(1, qty) } : x));

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 60px)" }}>

      {/* ============ Top bar ============ */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-2.5 flex items-center gap-2">
        <Link to="/supplier/content/authoring"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          style={{ fontSize: "12px" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Studio
        </Link>
        <span className="text-muted-foreground">/</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 bg-transparent text-foreground outline-none font-semibold min-w-0"
          style={{ fontSize: "14px" }}
        />
        <div className="flex items-center gap-1.5 shrink-0">
          <ProgramBadge code={program} size="xs" />
          <span className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "10.5px" }}>{grade}</span>
          {duration > 0 && (
            <span className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "10.5px" }}>{duration}p</span>
          )}
          {template.editorVariant === "research" && (
            <span className="px-2 py-0.5 bg-[#059669]/15 text-[#059669] rounded" style={{ fontSize: "10.5px", fontWeight: 700 }}>
              NCKH
            </span>
          )}
          <span className="px-2 py-0.5 rounded"
            style={{ fontSize: "10.5px", fontWeight: 700, color: STATUS_META[status].color, backgroundColor: STATUS_META[status].bg }}>
            {STATUS_META[status].label}
          </span>
        </div>
        <div className="hidden md:block shrink-0 pl-1 border-l border-border ml-1">
          <AutoSaveIndicator status={autoSaveStatus} lastSavedAt={lastSavedAt} />
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <button onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-md border transition-colors ${
              showSettings ? "bg-secondary border-border" : "border-transparent hover:bg-secondary"
            }`}
            title="Cài đặt bài giảng">
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
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#990803] text-white rounded-md hover:opacity-90"
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
        programCode={program}
        activePhaseId={activePhase}
        activePhaseLabel={phase.label}
        activePhaseColor={phase.color}
        grade={grade}
        subject={
          program === "CT2"
            ? (ctMetadata.drivingSubject as string | undefined) ?? subject
            : (ctMetadata.subject as string | undefined) ?? subject
        }
        existingPhaseBlocks={phaseBlocks}
        onInsertBlocks={handleAIInsertBlocks}
        onRequestSGKMap={() => setAiSgkDialogOpen(true)}
      />

      <SGKPickerDialog
        open={aiSgkDialogOpen}
        onClose={() => setAiSgkDialogOpen(false)}
        mode={program === "CT1" ? "single" : "multi"}
        initialGrade={grade}
        initialSubject={
          program === "CT2"
            ? (ctMetadata.drivingSubject as string | undefined) ?? subject
            : (ctMetadata.subject as string | undefined) ?? subject
        }
        selectedRefs={
          program === "CT1"
            ? (ctMetadata.sgkBook ? [ctMetadata.sgkBook as string] : [])
            : (ctMetadata.sgkBooks as string[] | undefined) ?? []
        }
        onConfirm={handleAISGKConfirm}
      />

      <LessonPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={title}
        programCode={program}
        grade={grade}
        subject={subject}
        durationMinutes={duration}
        phases={template.phases}
        blocks={blocks}
        objectives={{ knowledge: objKnowledge, skills: objSkills, attitude: objAttitude }}
        competencies={competencies}
        requiredDevices={requiredDevices}
      />

      {/* ============ Body: 3-col layout ============ */}
      <div className="flex-1 grid"
        style={{
          gridTemplateColumns: showSettings ? "220px 1fr 280px" : "220px 1fr",
          minHeight: "calc(100vh - 112px)",
        }}>

        {/* ─── Phase sidebar (dynamic per CT) ─── */}
        <div className="border-r border-border bg-card/50 p-3 space-y-2 overflow-y-auto">
          <p className="text-muted-foreground mb-3" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em" }}>
            {template.phases.length} GIAI ĐOẠN — {template.shortName.toUpperCase()}
          </p>
          {template.phases.map((ph) => {
            const cnt = blocks.filter((b) => b.phaseId === ph.id).length;
            const isActive = ph.id === activePhase;
            return (
              <button key={ph.id} onClick={() => setActivePhase(ph.id)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                  isActive ? "text-white border-transparent" : "border-border bg-card hover:bg-secondary text-foreground"
                }`}
                style={isActive ? { backgroundColor: ph.color } : {}}>
                <div className="flex items-center justify-between mb-0.5">
                  <span style={{ fontSize: "12px", fontWeight: 700 }}>{ph.label}</span>
                  <span className={`px-1.5 py-0.5 rounded ${isActive ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"}`}
                    style={{ fontSize: "10px", fontWeight: 600 }}>
                    {cnt}b
                  </span>
                </div>
                {ph.targetMin > 0 && (
                  <div className={`flex items-center gap-1 ${isActive ? "text-white/75" : "text-muted-foreground"}`}
                    style={{ fontSize: "10.5px" }}>
                    <Clock className="w-3 h-3" />
                    ~{ph.targetMin}p
                  </div>
                )}
              </button>
            );
          })}

          {/* AI Assist — mở menu 5 actions */}
          <button onClick={() => setAiMenuOpen(true)}
            className="mt-4 w-full flex items-center gap-2 p-2.5 bg-gradient-to-br from-[#7c3aed]/10 to-[#990803]/5 rounded-lg border border-[#7c3aed]/30 hover:border-[#7c3aed]/60 hover:shadow-md transition-all text-left">
            <div className="w-7 h-7 rounded-md bg-[#7c3aed] text-white flex items-center justify-center shrink-0">
              <Wand2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#7c3aed]" style={{ fontSize: "11px", fontWeight: 700 }}>AI Trợ lý</p>
              <p className="text-muted-foreground" style={{ fontSize: "10px", lineHeight: 1.35 }}>
                5 actions hỗ trợ <strong style={{ color: phase.color }}>{phase.label}</strong>
              </p>
            </div>
          </button>

          {/* Mandatory block warnings */}
          {missingMandatoryBlocks.length > 0 && (
            <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
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
          )}
        </div>

        {/* ─── Editor canvas ─── */}
        <div className="p-4 space-y-3 overflow-y-auto">

          {/* === Section: Mục tiêu bài học === */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <button onClick={() => setShowObjectives((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#990803]" />
                <span style={{ fontSize: "13px", fontWeight: 600 }}>Mục tiêu bài học</span>
                <span className="px-1.5 py-0.5 bg-[#990803]/10 text-[#990803] rounded" style={{ fontSize: "9.5px", fontWeight: 700 }}>
                  Chuẩn 5512
                </span>
              </div>
              <Plus className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showObjectives ? "rotate-45" : ""}`} />
            </button>
            {showObjectives && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ObjectiveField label="Kiến thức" value={objKnowledge} onChange={setObjKnowledge}
                    placeholder="HS hiểu/biết được..." />
                  <ObjectiveField label="Kỹ năng" value={objSkills} onChange={setObjSkills}
                    placeholder="HS làm được, vận dụng được..." />
                  <ObjectiveField label="Thái độ" value={objAttitude} onChange={setObjAttitude}
                    placeholder="HS có thái độ tích cực với..." />
                  <div>
                    <label className="block text-muted-foreground mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>
                      <Award className="w-3 h-3 inline mr-0.5" />
                      Năng lực phát triển ({competencies.length}/6)
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                      {COMPETENCY_LIST.map((c) => {
                        const m = COMPETENCY_META[c];
                        const active = competencies.includes(c);
                        return (
                          <button key={c} onClick={() => toggleCompetency(c)}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md border transition-all ${
                              active ? "border-transparent text-white" : "border-border bg-card hover:bg-secondary"
                            }`}
                            style={{ fontSize: "11px", fontWeight: 500, ...(active ? { backgroundColor: m.color } : {}) }}>
                            {active && <CheckSquare className="w-3 h-3" />}
                            {!active && <Square className="w-3 h-3 text-muted-foreground" />}
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* === Section: Thiết bị cần thiết === */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#0891b2]" />
                <span style={{ fontSize: "13px", fontWeight: 600 }}>Thiết bị cần thiết</span>
                {requiredDevices.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-[#0891b2]/10 text-[#0891b2] rounded-full" style={{ fontSize: "10px", fontWeight: 700 }}>
                    {requiredDevices.length}
                  </span>
                )}
              </div>
              <button onClick={() => setShowDevicePicker((v) => !v)}
                className="flex items-center gap-1 px-2.5 py-1 border border-border bg-card rounded-md hover:bg-secondary"
                style={{ fontSize: "11px", fontWeight: 500 }}>
                <Plus className="w-3 h-3" /> Thêm thiết bị
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
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: phase.color }} />
            <h2 style={{ fontSize: "15px", fontWeight: 700 }}>{phase.label}</h2>
            {phase.targetMin > 0 && (
              <span className="text-muted-foreground" style={{ fontSize: "12.5px" }}>· ~{phase.targetMin} phút</span>
            )}
            <span className="text-muted-foreground hidden lg:block" style={{ fontSize: "11.5px", fontStyle: "italic" }}>
              {phase.hint}
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
                    dragProps["data-dragging"] ? "opacity-50" : "border-border hover:border-[#990803]/30"
                  }`}>
                  {/* Drop indicator */}
                  {isHover && dnd.hoverPosition === "before" && (
                    <div className="absolute -top-1 left-0 right-0 h-0.5 bg-[#990803] rounded-full z-10" />
                  )}
                  {isHover && dnd.hoverPosition === "after" && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#990803] rounded-full z-10" />
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
                  Chưa có nội dung cho giai đoạn <strong>{phase.label}</strong>.
                </p>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "11.5px" }}>{phase.hint}</p>
              </div>
            )}
          </div>

          {/* === Block picker — dynamic per CT === */}
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
                      {isMandatory && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#16a34a] rounded-full" title="Bắt buộc" />
                      )}
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
                className="mt-2.5 text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontSize: "11px" }}>
                Đóng
              </button>
            </div>
          ) : (
            <button onClick={() => setShowPicker(true)}
              className="w-full py-2.5 border-2 border-dashed rounded-xl hover:border-[#990803]/50 hover:bg-[#990803]/5 transition-colors flex items-center justify-center gap-1.5 text-muted-foreground hover:text-[#990803]"
              style={{ borderColor: "#d1d5db", fontSize: "12.5px" }}>
              <Plus className="w-4 h-4" /> Thêm block vào giai đoạn <strong className="ml-0.5">{phase.label}</strong>
            </button>
          )}

          {/* === AttachmentSlotsPanel — 9 slot chuẩn === */}
          <div className="mt-6">
            <AttachmentSlotsPanel attachments={attachments} onChange={setAttachments} />
          </div>
        </div>

        {/* ─── Settings panel (dynamic metadata fields per CT) ─── */}
        {showSettings && (
          <div className="border-l border-border bg-card/30 p-4 space-y-4 overflow-y-auto">
            <p style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.07em" }} className="text-muted-foreground">
              CÀI ĐẶT BÀI GIẢNG
            </p>

            {/* CT picker */}
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>CHƯƠNG TRÌNH</label>
              <select value={program} onChange={(e) => setProgram(e.target.value as StemProgram)}
                className="w-full px-2 py-1.5 bg-card border border-border rounded-md" style={{ fontSize: "12px" }}>
                {(Object.keys(STEM_PROGRAMS) as StemProgram[]).map((c) => (
                  <option key={c} value={c}>{c} · {STEM_PROGRAMS[c].shortName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>KHỐI LỚP</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)}
                className="w-full px-2 py-1.5 bg-card border border-border rounded-md" style={{ fontSize: "12px" }}>
                {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* Common: Môn học (chỉ cho CT1) → handled in dynamic fields */}
            {/* Common: Subject - chung cho display */}
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>MÔN HỌC (tag)</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}
                className="w-full px-2 py-1.5 bg-card border border-border rounded-md" style={{ fontSize: "12px" }}>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>THỜI LƯỢNG (phút)</label>
              <input type="number" min={0} step={5} value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 45)}
                disabled={template.editorVariant === "research"}
                className="w-full px-2 py-1.5 bg-card border border-border rounded-md disabled:opacity-50" style={{ fontSize: "12px" }} />
              {template.editorVariant === "research" && (
                <p className="text-muted-foreground mt-1" style={{ fontSize: "10px" }}>
                  CT5 NCKH dài hạn — không tính theo phút.
                </p>
              )}
            </div>

            {/* === CT-specific metadata fields (dynamic) === */}
            <div className="border-t border-border pt-3">
              <p className="text-muted-foreground mb-2.5" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em" }}>
                METADATA {program} <Sparkles className="w-3 h-3 inline" />
              </p>
              <div className="space-y-3">
                {template.metadataFields
                  .filter((f) => f.id !== "competencies") // already in objectives
                  .map((field) => (
                    <DynamicMetadataField
                      key={field.id}
                      field={field}
                      value={ctMetadata[field.id]}
                      onChange={(v) => updateMetadata(field.id, v)}
                      grade={grade}
                      subject={
                        program === "CT2"
                          ? (ctMetadata.drivingSubject as string | undefined) ?? subject
                          : subject
                      }
                    />
                  ))}
              </div>
            </div>

            {/* Block type checklist */}
            <div className="border-t border-border pt-3">
              <label className="block text-muted-foreground mb-2" style={{ fontSize: "10px", fontWeight: 600 }}>
                LOẠI BLOCK ĐÃ DÙNG
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
                      <span className="flex-1" style={{ fontSize: "11px", color: used ? "inherit" : "#94a3b8" }}>{bm.label}</span>
                      {isMandatory && (
                        <span className="px-1 py-0 bg-[#16a34a]/15 text-[#16a34a] rounded" style={{ fontSize: "8.5px", fontWeight: 700 }}>★</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phase progress */}
            <div className="border-t border-border pt-3">
              <label className="block text-muted-foreground mb-2" style={{ fontSize: "10px", fontWeight: 600 }}>
                TIẾN ĐỘ {template.phases.length} GIAI ĐOẠN
              </label>
              <div className="space-y-2">
                {template.phases.map((ph) => {
                  const cnt = blocks.filter((b) => b.phaseId === ph.id).length;
                  return (
                    <div key={ph.id}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <div className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: cnt > 0 ? ph.color : "#e2e8f0" }} />
                        <span className="flex-1 truncate" style={{ fontSize: "11px" }}>{ph.label}</span>
                        <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{cnt} block</span>
                      </div>
                      <div className="ml-4 h-1 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(cnt / 3, 1) * 100}%`, backgroundColor: ph.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  Sub-components                                                   */
/* ================================================================ */

function ObjectiveField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="block text-muted-foreground mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full px-2 py-1.5 bg-card border border-border rounded-md outline-none focus:border-[#990803]/40 resize-none"
        style={{ fontSize: "11.5px" }}
      />
    </div>
  );
}

/* BlockContentRenderer removed — replaced by renderEditableBlock() from BlockComponents.tsx */

/* ── Dynamic metadata field renderer ── */
function DynamicMetadataField({ field, value, onChange, grade, subject }: {
  field: MetadataField; value: unknown; onChange: (v: unknown) => void;
  grade?: string; subject?: string;
}) {
  const [sgkDialogOpen, setSgkDialogOpen] = useState(false);
  const baseClass = "w-full px-2 py-1.5 bg-card border border-border rounded-md outline-none focus:border-[#990803]/40";
  const labelEl = (
    <label className="block text-muted-foreground mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>
      {field.label.toUpperCase()}
      {field.required && <span className="text-[#990803] ml-0.5">*</span>}
    </label>
  );

  switch (field.type) {
    case "text":
      return (
        <div>
          {labelEl}
          <input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder} className={baseClass} style={{ fontSize: "12px" }} />
          {field.helper && <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10px" }}>{field.helper}</p>}
        </div>
      );
    case "textarea":
      return (
        <div>
          {labelEl}
          <textarea value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder} rows={3}
            className={`${baseClass} resize-none`} style={{ fontSize: "11.5px", lineHeight: 1.45 }} />
          {field.helper && <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10px" }}>{field.helper}</p>}
        </div>
      );
    case "number":
      return (
        <div>
          {labelEl}
          <input type="number" value={(value as number) ?? 0} onChange={(e) => onChange(Number(e.target.value))}
            className={baseClass} style={{ fontSize: "12px" }} />
          {field.helper && <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10px" }}>{field.helper}</p>}
        </div>
      );
    case "select":
      return (
        <div>
          {labelEl}
          <select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}
            className={baseClass} style={{ fontSize: "12px" }}>
            <option value="">-- Chọn --</option>
            {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      );
    case "subject-picker":
      return (
        <div>
          {labelEl}
          <select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}
            className={baseClass} style={{ fontSize: "12px" }}>
            <option value="">-- Chọn môn --</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      );
    case "subject-multi-picker": {
      const selected = (value as string[]) ?? [];
      return (
        <div>
          {labelEl}
          <div className="flex flex-wrap gap-1 mb-1">
            {selected.map((s) => (
              <span key={s} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#0891b2]/10 text-[#0891b2] rounded" style={{ fontSize: "10.5px", fontWeight: 500 }}>
                {s}
                <button onClick={() => onChange(selected.filter((x) => x !== s))} className="hover:text-destructive">
                  ×
                </button>
              </span>
            ))}
          </div>
          <select value="" onChange={(e) => {
            if (e.target.value && !selected.includes(e.target.value)) {
              onChange([...selected, e.target.value]);
            }
          }} className={baseClass} style={{ fontSize: "12px" }}>
            <option value="">-- Thêm môn tích hợp --</option>
            {SUBJECTS.filter((s) => !selected.includes(s)).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {field.helper && <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10px" }}>{field.helper}</p>}
        </div>
      );
    }
    case "sgk-picker": {
      const ref = (value as string) ?? "";
      const decoded = ref ? ref.split("/") : [];
      const resolved = ref && decoded[0] ? findSGKLesson(decoded[0], decoded[2] ?? "") : null;
      const displayText = resolved
        ? `${resolved.book.subject} ${resolved.book.grade} · ${resolved.lesson.name}`
        : ref || "";
      return (
        <div>
          {labelEl}
          <button onClick={() => setSgkDialogOpen(true)}
            className="w-full px-2 py-1.5 border border-dashed border-border rounded-md hover:bg-secondary transition-colors flex items-center gap-1.5"
            style={{ fontSize: "11.5px" }}>
            <Layers className="w-3.5 h-3.5 text-[#2563eb]" />
            <span className={`flex-1 text-left truncate ${ref ? "" : "text-muted-foreground"}`}>
              {ref ? `📖 ${displayText}` : "Chọn bài SGK..."}
            </span>
          </button>
          {field.helper && <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10px" }}>{field.helper}</p>}
          <SGKPickerDialog
            open={sgkDialogOpen}
            onClose={() => setSgkDialogOpen(false)}
            mode="single"
            initialGrade={grade}
            initialSubject={subject}
            selectedRefs={ref ? [ref] : []}
            onConfirm={(refs) => onChange(refs[0] ?? "")}
          />
        </div>
      );
    }
    case "sgk-multi-picker": {
      const selected = (value as string[]) ?? [];
      return (
        <div>
          {labelEl}
          {selected.length > 0 && (
            <div className="space-y-0.5 mb-1">
              {selected.map((ref, i) => {
                const decoded = ref.split("/");
                const resolved = findSGKLesson(decoded[0] ?? "", decoded[2] ?? "");
                const text = resolved
                  ? `${resolved.book.subject} · ${resolved.lesson.name}`
                  : ref;
                return (
                  <div key={i} className="flex items-center gap-1 px-1.5 py-1 bg-secondary/50 rounded" style={{ fontSize: "10.5px" }}>
                    <Layers className="w-3 h-3 text-[#2563eb]" />
                    <span className="flex-1 truncate">{text}</span>
                    <button onClick={() => onChange(selected.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={() => setSgkDialogOpen(true)}
            className="w-full px-2 py-1.5 border border-dashed border-border rounded-md hover:bg-secondary"
            style={{ fontSize: "11.5px" }}>
            <Plus className="w-3 h-3 inline" /> Thêm bài SGK ({selected.length} đã chọn)
          </button>
          <SGKPickerDialog
            open={sgkDialogOpen}
            onClose={() => setSgkDialogOpen(false)}
            mode="multi"
            initialGrade={grade}
            initialSubject={subject}
            selectedRefs={selected}
            onConfirm={(refs) => onChange(refs)}
          />
        </div>
      );
    }
    case "ct4-module-picker": {
      const moduleId = (value as string) ?? "";
      const mod = CT4_MODULES.find((m) => m.id === moduleId);
      return (
        <div>
          {labelEl}
          <select value={moduleId} onChange={(e) => onChange(e.target.value)}
            className={baseClass} style={{ fontSize: "12px" }}>
            <option value="">-- Chọn module --</option>
            {CT4_MODULES.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {mod && (
            <p className="text-muted-foreground mt-1" style={{ fontSize: "10.5px", lineHeight: 1.4 }}>
              {mod.description}
            </p>
          )}
        </div>
      );
    }
    case "ct5-topic-picker": {
      const topicId = (value as string) ?? "";
      const topic = CT5_TOPICS.find((t) => t.id === topicId);
      return (
        <div>
          {labelEl}
          <select value={topicId} onChange={(e) => onChange(e.target.value)}
            className={baseClass} style={{ fontSize: "12px" }}>
            <option value="">-- Chọn chủ đề --</option>
            {CT5_TOPICS.map((t) => <option key={t.id} value={t.id}>{t.id} — {t.name}</option>)}
          </select>
          {topic && (
            <div className="mt-1.5 p-2 bg-[#059669]/5 border border-[#059669]/15 rounded-md">
              <p className="text-[#059669] mb-0.5" style={{ fontSize: "10.5px", fontWeight: 600 }}>{topic.field}</p>
              <p className="text-muted-foreground" style={{ fontSize: "10.5px", lineHeight: 1.4 }}>{topic.description}</p>
            </div>
          )}
        </div>
      );
    }
    case "device-picker": {
      const devices = (value as string[]) ?? [];
      return (
        <div>
          {labelEl}
          {devices.length > 0 ? (
            <div className="space-y-0.5 mb-1">
              {devices.map((d, i) => (
                <div key={i} className="flex items-center gap-1 px-1.5 py-1 bg-secondary/50 rounded" style={{ fontSize: "10.5px" }}>
                  <Cpu className="w-3 h-3 text-muted-foreground" />
                  <span className="flex-1 truncate">{d}</span>
                  <button onClick={() => onChange(devices.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive">
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
            ⚙️ Sử dụng "Thiết bị cần thiết" trong canvas thay vì panel này.
          </p>
        </div>
      );
    }
    default:
      return null;
  }
}

export default LessonEditor;
