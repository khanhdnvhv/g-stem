/* ================================================================ */
/*  CT TEMPLATES — Cấu hình editor theo từng chương trình STEM       */
/*  Nguồn: docs/CT-Programs-Specification.md                         */
/*  Cấu trúc phase, metadata fields, block availability per CT      */
/* ================================================================ */

import type { StemProgram } from "./types";

/* ── Phase definition (4/5/8 phase tuỳ CT) ── */
export interface Phase {
  id: string;
  label: string;
  color: string;
  hint: string;
  targetMin: number;
}

/* ── Metadata field — render động trong settings panel ── */
export type MetadataFieldType =
  | "text" | "textarea" | "number"
  | "select" | "multi-select"
  | "subject-picker" | "subject-multi-picker"
  | "sgk-picker" | "sgk-multi-picker"
  | "device-picker"
  | "ct4-module-picker" | "ct5-topic-picker"
  | "competency-picker"
  | "grade-picker";

export interface MetadataField {
  id: string;
  label: string;
  type: MetadataFieldType;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  helper?: string;
}

/* ── BlockType union (7 cũ + 9 mới) ── */
export type BlockType =
  // Chung cho mọi CT
  | "heading" | "text" | "image" | "video" | "quiz" | "code" | "attachment"
  // CT-specific
  | "subject-roles"      // CT2
  | "group-activity"     // CT3, CT4, CT5
  | "rubric"             // CT3, CT4, CT5
  | "safety-notes"       // CT4
  | "research-question"  // CT5
  | "data-table"         // CT5
  | "chart"              // CT5
  | "citation"           // CT5
  | "hypothesis";        // CT5

/* ── CT Template chính ── */
export interface CTTemplate {
  code: StemProgram;
  fullName: string;
  shortName: string;
  description: string;
  targetTeacher: string;
  scheduleSlot: "main" | "session2" | "club_extra";
  defaultDuration: number;
  phases: Phase[];
  metadataFields: MetadataField[];
  mandatoryBlocks: BlockType[];
  availableBlocks: BlockType[];
  groupActivityRequired: boolean;
  sgkMappingRequired: boolean;
  rubricComplexity: "simple" | "medium" | "detailed" | "research_grade";
  /** Editor component — "lesson" hoặc "research" */
  editorVariant: "lesson" | "research";
}

/* ── 4 phase chuẩn 5512 (CT1, CT2) ── */
const PHASES_5512_STANDARD: Phase[] = [
  { id: "warmup",     label: "Khởi động",      color: "#f59e0b", hint: "Tình huống kích thích — câu hỏi thực tế, video ngắn.",        targetMin: 7  },
  { id: "knowledge",  label: "Kiến thức mới",  color: "#0891b2", hint: "Lý thuyết cô đọng — sơ đồ, ví dụ minh hoạ.",                  targetMin: 12 },
  { id: "practice",   label: "Luyện tập",      color: "#16a34a", hint: "Áp dụng kiến thức vào bài tập.",                              targetMin: 18 },
  { id: "apply",      label: "Vận dụng STEM",  color: "#990803", hint: "Kết nối thực tế — bài toán thực tiễn, ứng dụng STEM.",       targetMin: 8  },
];

/* ── 4 phase CT2 — phase Thực hành tích hợp dài hơn ── */
const PHASES_CT2: Phase[] = [
  { id: "warmup",     label: "Khởi động liên môn",      color: "#f59e0b", hint: "Tình huống thực tế đa môn.",                          targetMin: 7   },
  { id: "knowledge",  label: "Kiến thức liên môn",      color: "#0891b2", hint: "KT từng môn liên quan đến chủ đề.",                   targetMin: 18  },
  { id: "practice",   label: "Thực hành tích hợp",      color: "#16a34a", hint: "Vận dụng KT đa môn — phase chính, dài nhất.",        targetMin: 30  },
  { id: "apply",      label: "Đánh giá sản phẩm",       color: "#990803", hint: "Trình bày sản phẩm tích hợp.",                        targetMin: 10  },
];

/* ── 4 phase CT3 — đổi tên emphasis sáng tạo ── */
const PHASES_CT3: Phase[] = [
  { id: "explore",    label: "Khám phá vấn đề",     color: "#f59e0b", hint: "Đặt vấn đề thực tế, kích thích sáng tạo.",                targetMin: 7  },
  { id: "knowledge",  label: "Kiến thức nền",       color: "#0891b2", hint: "KT tối thiểu cần để giải quyết.",                         targetMin: 12 },
  { id: "create",     label: "Sáng tạo & Tạo mẫu",  color: "#7c3aed", hint: "Prototyping — phase chính, làm việc nhóm.",              targetMin: 20 },
  { id: "showcase",   label: "Trình bày & Phản hồi", color: "#990803", hint: "Show-and-tell, nhận góp ý đồng đẳng.",                  targetMin: 6  },
];

/* ── 5 phase CT4 — thêm Test/Debug ── */
const PHASES_CT4: Phase[] = [
  { id: "warmup",     label: "Khởi động",           color: "#f59e0b", hint: "Demo robot/AI/IoT đã hoàn thành.",                       targetMin: 8  },
  { id: "theory",     label: "Lý thuyết",           color: "#0891b2", hint: "Kiến thức công nghệ + thuật toán.",                      targetMin: 12 },
  { id: "build",      label: "Lắp ráp & Lập trình", color: "#7c3aed", hint: "Hardware + Code — phase chính.",                         targetMin: 40 },
  { id: "debug",      label: "Test & Debug",        color: "#c8a84e", hint: "Chạy thử, sửa lỗi, tối ưu.",                              targetMin: 20 },
  { id: "evaluate",   label: "Đánh giá",            color: "#990803", hint: "Demo sản phẩm + reflection.",                            targetMin: 10 },
];

/* ── 8 phase CT5 — theo PP NCKH ── */
const PHASES_CT5_RESEARCH: Phase[] = [
  { id: "rq",         label: "Câu hỏi nghiên cứu",  color: "#1e3a8a", hint: "Đặt câu hỏi tốt, narrow scope.",                          targetMin: 0 },
  { id: "lit",        label: "Tổng quan tài liệu",  color: "#2563eb", hint: "Đọc, tổng hợp tài liệu sẵn có.",                          targetMin: 0 },
  { id: "hypothesis", label: "Giả thuyết",          color: "#0891b2", hint: "Đề xuất giả thuyết có thể kiểm chứng.",                   targetMin: 0 },
  { id: "method",     label: "Phương pháp",         color: "#16a34a", hint: "Thiết kế thí nghiệm/khảo sát.",                           targetMin: 0 },
  { id: "data",       label: "Thu thập dữ liệu",    color: "#c8a84e", hint: "Thực hiện thí nghiệm, ghi nhận số liệu.",                targetMin: 0 },
  { id: "analysis",   label: "Phân tích",           color: "#ea580c", hint: "Xử lý số liệu, vẽ chart, kiểm định giả thuyết.",         targetMin: 0 },
  { id: "conclusion", label: "Kết luận",            color: "#990803", hint: "Trả lời câu hỏi NC, đưa ra kiến nghị.",                  targetMin: 0 },
  { id: "report",     label: "Báo cáo / Poster",    color: "#7c3aed", hint: "Viết báo cáo, làm poster, đăng bài.",                    targetMin: 0 },
];

/* ── Block availability per CT ── */
const COMMON_BLOCKS: BlockType[] = ["heading", "text", "image", "video", "quiz", "attachment"];

/* ── CT_TEMPLATES — main export ── */
export const CT_TEMPLATES: Record<StemProgram, CTTemplate> = {
  CT1: {
    code: "CT1",
    fullName: "GD STEM tích hợp trong môn học",
    shortName: "Tích hợp môn",
    description: "Dạy bài học của môn học theo phương thức STEM. Không thay đổi nội dung môn — chỉ thay phương pháp dạy.",
    targetTeacher: "Giáo viên các môn học",
    scheduleSlot: "main",
    defaultDuration: 45,
    phases: PHASES_5512_STANDARD,
    metadataFields: [
      { id: "subject",      label: "Môn học",       type: "subject-picker", required: true, helper: "Chọn 1 môn duy nhất" },
      { id: "sgkBook",      label: "Bài SGK",       type: "sgk-picker",     required: true, helper: "Bài học của Bộ GD&ĐT" },
      { id: "competencies", label: "Năng lực",      type: "competency-picker", required: true, helper: "Thường 2-3 năng lực" },
    ],
    mandatoryBlocks: [],
    availableBlocks: [...COMMON_BLOCKS, "code"],
    groupActivityRequired: false,
    sgkMappingRequired: true,
    rubricComplexity: "simple",
    editorVariant: "lesson",
  },

  CT2: {
    code: "CT2",
    fullName: "GD STEM tích hợp liên môn",
    shortName: "Liên môn",
    description: "Dạy chủ đề tích hợp liên môn — môn chủ đạo + môn tích hợp. Vận dụng kiến thức từ nhiều môn để giải quyết vấn đề thực tiễn.",
    targetTeacher: "Giáo viên nhóm môn",
    scheduleSlot: "main",
    defaultDuration: 90,
    phases: PHASES_CT2,
    metadataFields: [
      { id: "drivingSubject",     label: "Môn chủ đạo",    type: "subject-picker",       required: true },
      { id: "integratedSubjects", label: "Môn tích hợp",   type: "subject-multi-picker", required: true, helper: "1-4 môn khác" },
      { id: "topic",              label: "Chủ đề tích hợp", type: "text",                required: true, placeholder: "VD: Năng lượng tái tạo" },
      { id: "sgkBooks",           label: "Bài SGK liên quan", type: "sgk-multi-picker", required: false },
      { id: "competencies",       label: "Năng lực",       type: "competency-picker",    required: true, helper: "Thường 3-4 năng lực" },
    ],
    mandatoryBlocks: ["subject-roles"],
    availableBlocks: [...COMMON_BLOCKS, "subject-roles", "group-activity", "rubric"],
    groupActivityRequired: false,
    sgkMappingRequired: true,
    rubricComplexity: "medium",
    editorVariant: "lesson",
  },

  CT3: {
    code: "CT3",
    fullName: "GD STEM tăng cường định hướng đổi mới, sáng tạo",
    shortName: "Đổi mới sáng tạo",
    description: "Coi như môn học dạy buổi 2 — vận dụng kiến thức để tạo sản phẩm sáng tạo. Không gắn SGK cụ thể.",
    targetTeacher: "Giáo viên nhà trường",
    scheduleSlot: "session2",
    defaultDuration: 45,
    phases: PHASES_CT3,
    metadataFields: [
      { id: "activityName",     label: "Tên hoạt động",       type: "text",       required: true, placeholder: "VD: Thiết kế xe đua bằng năng lượng gió" },
      { id: "domain",           label: "Lĩnh vực",            type: "select",     required: true,
        options: [
          { value: "stem_art",    label: "STEM Art" },
          { value: "tin_hoc",     label: "Tin học sáng tạo" },
          { value: "khoa_hoc_vl", label: "Khoa học vật lý" },
          { value: "co_khi",      label: "Cơ khí" },
          { value: "sinh_hoc",    label: "Sinh học ứng dụng" },
          { value: "khac",        label: "Khác" },
        ],
      },
      { id: "finalProduct",     label: "Sản phẩm cuối dự kiến", type: "text",     required: true, placeholder: "VD: Mô hình xe chạy ≥ 3m, có thể điều khiển hướng" },
      { id: "studentsPerGroup", label: "Số HS/nhóm",          type: "number",     required: true, helper: "Default 3-5" },
      { id: "competencies",     label: "Năng lực",            type: "competency-picker", required: true, helper: "4-5 năng lực" },
    ],
    mandatoryBlocks: ["group-activity", "rubric"],
    availableBlocks: [...COMMON_BLOCKS, "code", "group-activity", "rubric"],
    groupActivityRequired: true,
    sgkMappingRequired: false,
    rubricComplexity: "detailed",
    editorVariant: "lesson",
  },

  CT4: {
    code: "CT4",
    fullName: "GD STEM Robotic, AI, IoT",
    shortName: "Robotic / AI / IoT",
    description: "Chương trình công nghệ chuyên sâu — 4 module: Robotics 1, AI, IoT, Robotics+AI. Yêu cầu phần cứng cụ thể + lưu ý an toàn.",
    targetTeacher: "GV tin học + GV có khả năng",
    scheduleSlot: "club_extra",
    defaultDuration: 90,
    phases: PHASES_CT4,
    metadataFields: [
      { id: "module",           label: "Module chính",     type: "ct4-module-picker", required: true },
      { id: "language",         label: "Ngôn ngữ lập trình", type: "select",         required: true,
        options: [
          { value: "scratch",    label: "Scratch" },
          { value: "block",      label: "Block-based (mBlock)" },
          { value: "arduino_c",  label: "Arduino C/C++" },
          { value: "python",     label: "Python" },
        ],
      },
      { id: "requiredHardware", label: "Phần cứng cần",    type: "device-picker",     required: true, helper: "Arduino UNO, HC-SR04, ..." },
      { id: "safetyNotes",      label: "Lưu ý an toàn",    type: "textarea",          required: true, placeholder: "An toàn điện, an toàn pin, an toàn dụng cụ..." },
      { id: "competencies",     label: "Năng lực",         type: "competency-picker", required: true, helper: "Nặng GQVĐ + Kỹ sư" },
    ],
    mandatoryBlocks: ["code", "safety-notes", "group-activity"],
    availableBlocks: [...COMMON_BLOCKS, "code", "safety-notes", "group-activity", "rubric"],
    groupActivityRequired: true,
    sgkMappingRequired: false,
    rubricComplexity: "detailed",
    editorVariant: "lesson",
  },

  CT5: {
    code: "CT5",
    fullName: "STEM Trải nghiệm / Nghiên cứu khoa học",
    shortName: "NCKH",
    description: "Đề tài nghiên cứu dài hạn 3 tháng – 2 năm. Dành cho HS năng khiếu, dự thi KH-KT cấp tỉnh/quốc gia.",
    targetTeacher: "GV hướng dẫn nghiên cứu",
    scheduleSlot: "club_extra",
    defaultDuration: 0,
    phases: PHASES_CT5_RESEARCH,
    metadataFields: [
      { id: "topicCode",         label: "Chủ đề NCKH",          type: "ct5-topic-picker",  required: true },
      { id: "leadStudent",       label: "HS dẫn đầu",           type: "text",              required: true, placeholder: "Tên HS năng khiếu" },
      { id: "mentorTeacher",     label: "GV hướng dẫn",         type: "text",              required: true },
      { id: "expectedDuration",  label: "Thời gian dự kiến",    type: "select",            required: true,
        options: [
          { value: "3m",  label: "3 tháng" },
          { value: "6m",  label: "6 tháng" },
          { value: "1y",  label: "1 năm" },
          { value: "2y",  label: "2 năm" },
        ],
      },
      { id: "researchQuestion",  label: "Câu hỏi nghiên cứu",   type: "textarea",          required: true, placeholder: "Câu hỏi chính cần trả lời..." },
      { id: "hypothesis",        label: "Giả thuyết",           type: "textarea",          required: false, placeholder: "Nếu... thì... vì..." },
      { id: "methodology",       label: "Phương pháp",          type: "textarea",          required: false, placeholder: "Thí nghiệm / Khảo sát / Mô phỏng..." },
      { id: "competencies",      label: "Năng lực",             type: "competency-picker", required: true, helper: "Đầy đủ 6 năng lực" },
    ],
    mandatoryBlocks: ["research-question", "group-activity"],
    availableBlocks: [
      ...COMMON_BLOCKS, "code",
      "research-question", "hypothesis", "data-table", "chart", "citation",
      "group-activity", "rubric",
    ],
    groupActivityRequired: true,
    sgkMappingRequired: false,
    rubricComplexity: "research_grade",
    editorVariant: "research",
  },
};

/* ── 6 năng lực cốt lõi STEM ── */
export type Competency = "sang_tao" | "phan_bien" | "hop_tac" | "giao_tiep" | "gqvd" | "ky_su";

export const COMPETENCY_META: Record<Competency, { label: string; description: string; color: string }> = {
  sang_tao:  { label: "Sáng tạo",  description: "Creative thinking — tạo ý tưởng, sản phẩm mới",  color: "#7c3aed" },
  phan_bien: { label: "Phản biện", description: "Critical thinking — đánh giá, phân tích",        color: "#dc2626" },
  hop_tac:   { label: "Hợp tác",   description: "Collaboration — làm việc nhóm hiệu quả",         color: "#0891b2" },
  giao_tiep: { label: "Giao tiếp", description: "Communication — trình bày, tranh luận",          color: "#16a34a" },
  gqvd:      { label: "GQVĐ",      description: "Problem solving — giải quyết vấn đề",            color: "#c8a84e" },
  ky_su:     { label: "Kỹ sư",     description: "Engineering mindset — thiết kế, prototype",     color: "#990803" },
};

export const COMPETENCY_LIST: Competency[] = ["sang_tao", "phan_bien", "hop_tac", "giao_tiep", "gqvd", "ky_su"];

/* ── Helper: lookup ── */
export function getCTTemplate(code: StemProgram): CTTemplate {
  return CT_TEMPLATES[code];
}
