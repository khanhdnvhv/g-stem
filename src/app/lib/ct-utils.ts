/* ================================================================ */
/*  CT UTILS — Helper functions cho 5 CT STEM templates              */
/*  Dùng trong LessonEditor, ResearchProjectEditor, Wizard           */
/* ================================================================ */

import {
  CT_TEMPLATES,
  type Phase,
  type CTTemplate,
  type BlockType,
} from "../components/mock-data/ct-templates";
import {
  ATTACHMENT_SLOT_TEMPLATES,
  REQUIRED_ATTACHMENT_SLOTS,
} from "../components/mock-data/attachment-slots";
import type {
  StemProgram,
  LessonV2,
  LessonAttachment,
} from "../components/mock-data/types";

/* ── Lookup ── */
export function getCTTemplate(code: StemProgram): CTTemplate {
  return CT_TEMPLATES[code];
}

export function getPhasesForCT(code: StemProgram): Phase[] {
  return CT_TEMPLATES[code].phases;
}

export function getBlocksAvailableForCT(code: StemProgram): BlockType[] {
  return CT_TEMPLATES[code].availableBlocks;
}

export function getMandatoryBlocksForCT(code: StemProgram): BlockType[] {
  return CT_TEMPLATES[code].mandatoryBlocks;
}

export function isCTRequiringSGK(code: StemProgram): boolean {
  return CT_TEMPLATES[code].sgkMappingRequired;
}

export function isCTRequiringGroupActivity(code: StemProgram): boolean {
  return CT_TEMPLATES[code].groupActivityRequired;
}

export function isCTUsingResearchEditor(code: StemProgram): boolean {
  return CT_TEMPLATES[code].editorVariant === "research";
}

/* ── Default duration tuỳ CT ── */
export function getDefaultDurationForCT(code: StemProgram): number {
  return CT_TEMPLATES[code].defaultDuration;
}

/* ── Phase lookup by id ── */
export function getPhaseById(code: StemProgram, phaseId: string): Phase | undefined {
  return CT_TEMPLATES[code].phases.find((p) => p.id === phaseId);
}

/* ── Validation ── */
export interface LessonValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export function validateLessonV2(lesson: LessonV2): LessonValidationResult {
  return validateLessonDraft({
    title: lesson.title,
    programCode: lesson.programCode,
    ctMetadata: lesson.ctMetadata,
    blocks: lesson.blocks.map((b) => ({ type: b.type })),
    attachments: lesson.attachments.map((a) => ({ slotType: a.slotType, fileUrl: a.fileUrl })),
    competencies: lesson.objectives?.competencies ?? [],
  });
}

/** Flexible validation — nhận raw input từ editor state */
export interface LessonDraftInput {
  title: string;
  programCode: StemProgram;
  ctMetadata: Record<string, unknown>;
  blocks: Array<{ type: string }>;
  attachments: Array<{ slotType: string; fileUrl?: string }>;
  competencies: string[];
}

export function validateLessonDraft(draft: LessonDraftInput): LessonValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const template = CT_TEMPLATES[draft.programCode];

  // Title
  if (!draft.title || draft.title.trim().length < 3) {
    errors.push("Tiêu đề bài giảng phải ≥ 3 ký tự");
  }

  // Required metadata fields
  for (const field of template.metadataFields) {
    if (!field.required) continue;
    if (field.id === "competencies") continue; // handled separately
    const value = draft.ctMetadata[field.id];
    if (value === undefined || value === null || value === "" ||
        (Array.isArray(value) && value.length === 0)) {
      errors.push(`Thiếu trường bắt buộc: "${field.label}"`);
    }
  }

  // Mandatory blocks
  for (const blockType of template.mandatoryBlocks) {
    const has = draft.blocks.some((b) => b.type === blockType);
    if (!has) {
      warnings.push(`Thiếu block bắt buộc cho ${draft.programCode}: "${blockType}"`);
    }
  }

  // Required attachment slots
  for (const slotType of REQUIRED_ATTACHMENT_SLOTS) {
    const att = draft.attachments.find((a) => a.slotType === slotType);
    if (!att || !att.fileUrl) {
      const tmpl = ATTACHMENT_SLOT_TEMPLATES.find((s) => s.type === slotType);
      warnings.push(`Thiếu tài liệu bắt buộc: "${tmpl?.shortLabel ?? slotType}"`);
    }
  }

  // Competencies
  if (draft.competencies.length === 0) {
    warnings.push("Chưa chọn năng lực cốt lõi sẽ phát triển");
  } else if (draft.competencies.length < 2 && draft.programCode !== "CT1") {
    warnings.push(`Số năng lực hơi ít (${draft.competencies.length}) — ${draft.programCode} thường phát triển 3+ năng lực`);
  }

  return { ok: errors.length === 0, errors, warnings };
}

/* ── Initial state cho bài mới ── */
export function createEmptyLessonV2(
  code: StemProgram,
  grade: string,
  extras?: Partial<LessonV2>
): LessonV2 {
  const template = CT_TEMPLATES[code];
  const defaultMeta = buildDefaultCTMetadata(code);

  return {
    id: `LSN-NEW-${Date.now()}`,
    title: `Bài giảng ${template.shortName} mới`,
    description: "",
    programCode: code,
    gradeLevel: grade,
    durationMinutes: template.defaultDuration,
    thumbnail: "",
    status: "draft",
    ctMetadata: defaultMeta,
    objectives: {
      knowledge: "",
      skills: "",
      attitude: "",
      competencies: [],
    },
    requiredDevices: [],
    blocks: [],
    attachments: [],
    createdBy: "supplier-current-user",
    createdAt: new Date().toISOString(),
    version: 1,
    ...extras,
  };
}

function buildDefaultCTMetadata(code: StemProgram): LessonV2["ctMetadata"] {
  switch (code) {
    case "CT1":
      return { type: "CT1", subject: "", sgkBook: undefined };
    case "CT2":
      return { type: "CT2", drivingSubject: "", integratedSubjects: [], topic: "" };
    case "CT3":
      return { type: "CT3", activityName: "", domain: "khac", finalProduct: "", studentsPerGroup: 4 };
    case "CT4":
      return {
        type: "CT4",
        module: "robotics_1",
        language: "block",
        requiredHardware: [],
        safetyNotes: "",
      };
    case "CT5":
      return {
        type: "CT5",
        topicCode: "",
        leadStudent: "",
        mentorTeacher: "",
        expectedDuration: "6m",
        researchQuestion: "",
        expectedOutputs: [],
      };
  }
}

/* ── Initial attachments — tạo 9 slot trống ── */
export function createDefaultAttachments(): LessonAttachment[] {
  return ATTACHMENT_SLOT_TEMPLATES.map((tmpl) => ({
    slotType: tmpl.type,
  }));
}

/* ── Calculate completion % ── */
export function calculateCompletionPct(lesson: LessonV2): number {
  let total = 0;
  let done = 0;

  // Title (10)
  total += 10;
  if (lesson.title && lesson.title.trim().length >= 3) done += 10;

  // CT metadata required fields (30)
  const template = CT_TEMPLATES[lesson.programCode];
  const reqMetaFields = template.metadataFields.filter((f) => f.required);
  total += 30;
  if (reqMetaFields.length > 0) {
    const filled = reqMetaFields.filter((f) => {
      const v = (lesson.ctMetadata as Record<string, unknown>)[f.id];
      return v !== undefined && v !== null && v !== "" &&
        (!Array.isArray(v) || v.length > 0);
    }).length;
    done += Math.round(30 * (filled / reqMetaFields.length));
  } else {
    done += 30;
  }

  // Objectives (20)
  total += 20;
  if (lesson.objectives) {
    const objFilled = [
      !!lesson.objectives.knowledge,
      !!lesson.objectives.skills,
      !!lesson.objectives.attitude,
      lesson.objectives.competencies.length > 0,
    ].filter(Boolean).length;
    done += Math.round(20 * (objFilled / 4));
  }

  // Blocks per phase (20)
  total += 20;
  const phasesWithBlocks = template.phases.filter((p) =>
    lesson.blocks.some((b) => b.phaseId === p.id)
  ).length;
  done += Math.round(20 * (phasesWithBlocks / template.phases.length));

  // Required attachments (20)
  total += 20;
  if (REQUIRED_ATTACHMENT_SLOTS.length > 0) {
    const filledAtts = REQUIRED_ATTACHMENT_SLOTS.filter((slotType) => {
      const att = lesson.attachments.find((a) => a.slotType === slotType);
      return att && att.fileUrl;
    }).length;
    done += Math.round(20 * (filledAtts / REQUIRED_ATTACHMENT_SLOTS.length));
  } else {
    done += 20;
  }

  return Math.min(100, Math.round((done / total) * 100));
}
