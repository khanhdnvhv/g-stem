/* ================================================================ */
/*  ATTACHMENT SLOTS PANEL — 9 slot chuẩn theo Excel Bộ GD&ĐT         */
/*  Thay thế "Tài liệu Giáo viên" URL list tự do                     */
/* ================================================================ */

import { useState } from "react";
import {
  Calendar, BookOpen, FileText, Presentation, Video, PlayCircle,
  ClipboardList, Boxes, GraduationCap, Upload, Download, Eye,
  CheckCircle2, AlertTriangle, X,
} from "lucide-react";
import {
  ATTACHMENT_SLOT_TEMPLATES,
  type AttachmentSlotType,
  type AttachmentSlotTemplate,
} from "../../mock-data/index";
import { toast } from "@/app/lib/toast";

/* ── Icon registry ── */
const ICON_REGISTRY: Record<string, typeof FileText> = {
  Calendar,
  BookOpen,
  FileText,
  Presentation,
  Video,
  PlayCircle,
  ClipboardList,
  Boxes,
  GraduationCap,
};

/* ── Type cho 1 slot instance (file đã upload) ── */
export interface AttachmentInstance {
  slotType: AttachmentSlotType;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedAt?: string;
}

interface AttachmentSlotsPanelProps {
  attachments: AttachmentInstance[];
  onChange: (next: AttachmentInstance[]) => void;
  /** Khi true: hiển thị summary thay vì panel đầy đủ */
  compact?: boolean;
}

/* ── Mock file names per slot for quick demo ── */
const MOCK_FILES_PER_SLOT: Partial<Record<AttachmentSlotType, { name: string; size: string }>> = {
  organization_plan:     { name: "ke-hoach-to-chuc-T11-2026.docx",  size: "2.1 MB" },
  teacher_training_doc:  { name: "tai-lieu-boi-duong-GV.pdf",       size: "4.8 MB" },
  lesson_plan:           { name: "ke-hoach-bai-day.docx",           size: "1.4 MB" },
  pptx:                  { name: "bai-giang.pptx",                  size: "12.3 MB" },
  teacher_video:         { name: "video-huong-dan-GV.mp4",          size: "85 MB" },
  student_video:         { name: "video-huong-dan-HS.mp4",          size: "62 MB" },
  student_worksheet:     { name: "phieu-hoc-tap.pdf",               size: "0.9 MB" },
  exercises_assessment:  { name: "de-kiem-tra-mo-rong.pdf",         size: "1.7 MB" },
};

export function AttachmentSlotsPanel({ attachments, onChange, compact }: AttachmentSlotsPanelProps) {
  const [expandedSlots, setExpandedSlots] = useState<Set<AttachmentSlotType>>(new Set());

  /* ── Helper: find/create instance for slot ── */
  const getInstance = (slotType: AttachmentSlotType): AttachmentInstance =>
    attachments.find((a) => a.slotType === slotType) ?? { slotType };

  const updateInstance = (slotType: AttachmentSlotType, patch: Partial<AttachmentInstance>) => {
    const existing = attachments.find((a) => a.slotType === slotType);
    if (existing) {
      onChange(attachments.map((a) => a.slotType === slotType ? { ...a, ...patch } : a));
    } else {
      onChange([...attachments, { slotType, ...patch }]);
    }
  };

  const removeInstance = (slotType: AttachmentSlotType) => {
    onChange(attachments.map((a) =>
      a.slotType === slotType ? { slotType } : a
    ));
  };

  const handleMockUpload = (tmpl: AttachmentSlotTemplate) => {
    const mock = MOCK_FILES_PER_SLOT[tmpl.type];
    if (!mock) {
      toast.info(`Upload ${tmpl.shortLabel}...`);
      return;
    }
    updateInstance(tmpl.type, {
      fileName: mock.name,
      fileSize: mock.size,
      fileUrl: `https://mock.geleximco-stem.com/files/${mock.name}`,
      uploadedAt: new Date().toISOString(),
    });
    toast.success(`Đã upload "${mock.name}"`);
  };

  const toggleExpand = (slotType: AttachmentSlotType) =>
    setExpandedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slotType)) next.delete(slotType);
      else next.add(slotType);
      return next;
    });

  /* ── Stats ── */
  const requiredSlots = ATTACHMENT_SLOT_TEMPLATES.filter((s) => s.required);
  const requiredUploaded = requiredSlots.filter((s) => {
    const inst = attachments.find((a) => a.slotType === s.type);
    return inst?.fileUrl;
  }).length;
  const totalUploaded = ATTACHMENT_SLOT_TEMPLATES.filter((s) => {
    const inst = attachments.find((a) => a.slotType === s.type);
    return inst?.fileUrl;
  }).length;

  /* ── Compact mode — chỉ hiện summary ── */
  if (compact) {
    return (
      <div className="bg-card border border-border rounded-xl p-3">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-3.5 h-3.5 text-[#0891b2]" />
          <p style={{ fontSize: "12px", fontWeight: 600 }}>Tài liệu kèm theo</p>
          <span className="ml-auto text-muted-foreground" style={{ fontSize: "11px" }}>
            {totalUploaded}/9
          </span>
        </div>
        {requiredUploaded < requiredSlots.length && (
          <div className="flex items-center gap-1.5 text-orange-500" style={{ fontSize: "11px" }}>
            <AlertTriangle className="w-3 h-3" />
            <span>Thiếu {requiredSlots.length - requiredUploaded} tài liệu bắt buộc</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-gradient-to-r from-[#0891b2]/5 to-transparent">
        <FileText className="w-4 h-4 text-[#0891b2]" />
        <div className="flex-1">
          <p style={{ fontSize: "13px", fontWeight: 600 }}>Tài liệu kèm theo (9 loại chuẩn Bộ GD&ĐT)</p>
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
            Phù hợp Excel "Học liệu, thiết bị" — 4 loại bắt buộc (★).
          </p>
        </div>
        <div className="text-right">
          <p style={{ fontSize: "13px", fontWeight: 700 }}>
            <span className={totalUploaded === 9 ? "text-[#16a34a]" : ""}>{totalUploaded}</span>
            <span className="text-muted-foreground">/9</span>
          </p>
          <p className={`${requiredUploaded === requiredSlots.length ? "text-[#16a34a]" : "text-orange-500"}`} style={{ fontSize: "10px", fontWeight: 600 }}>
            {requiredUploaded}/{requiredSlots.length} bắt buộc
          </p>
        </div>
      </div>

      {/* Required warning */}
      {requiredUploaded < requiredSlots.length && (
        <div className="px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-700">
          <div className="flex items-center gap-2" style={{ fontSize: "11.5px" }}>
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <p className="text-orange-700 dark:text-orange-300">
              Còn thiếu <strong>{requiredSlots.length - requiredUploaded}</strong> tài liệu bắt buộc trước khi gửi duyệt.
            </p>
          </div>
        </div>
      )}

      {/* 9 slot list */}
      <div className="divide-y divide-border">
        {ATTACHMENT_SLOT_TEMPLATES.map((tmpl) => {
          const Icon = ICON_REGISTRY[tmpl.icon] ?? FileText;
          const inst = getInstance(tmpl.type);
          const hasFile = !!inst.fileUrl;
          const isExpanded = expandedSlots.has(tmpl.type);

          return (
            <div key={tmpl.type}>
              <div className="flex items-start gap-3 px-4 py-2.5 hover:bg-secondary/30 transition-colors">
                {/* Order + Icon */}
                <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                  <span className="text-muted-foreground" style={{ fontSize: "10px", fontWeight: 700 }}>{tmpl.order}</span>
                  <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: tmpl.color + "20" }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: tmpl.color }} />
                  </div>
                </div>

                {/* Label + Desc */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p style={{ fontSize: "12.5px", fontWeight: 600 }}>{tmpl.shortLabel}</p>
                    {tmpl.required && (
                      <span className="text-[#990803]" title="Bắt buộc" style={{ fontSize: "13px", lineHeight: 1 }}>★</span>
                    )}
                    {tmpl.autoGenerated && (
                      <span className="px-1.5 py-0.5 bg-secondary text-muted-foreground rounded" style={{ fontSize: "9px", fontWeight: 600 }}>
                        AUTO
                      </span>
                    )}
                    <div className="flex gap-0.5 ml-auto">
                      {tmpl.forUsers.map((u) => (
                        <span key={u} className="px-1 py-0.5 bg-secondary text-muted-foreground rounded" style={{ fontSize: "9px", fontWeight: 600 }}>
                          {u}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => toggleExpand(tmpl.type)}
                    className="text-muted-foreground hover:text-foreground mt-0.5 text-left"
                    style={{ fontSize: "10.5px" }}>
                    {isExpanded ? "▼" : "▶"} {tmpl.description}
                  </button>

                  {/* File info */}
                  {hasFile ? (
                    <div className="mt-1.5 flex items-center gap-2 p-1.5 bg-[#16a34a]/5 border border-[#16a34a]/20 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                      <span className="flex-1 truncate" style={{ fontSize: "11px", fontWeight: 500 }}>{inst.fileName}</span>
                      <span className="text-muted-foreground shrink-0" style={{ fontSize: "10px" }}>{inst.fileSize}</span>
                      <button onClick={() => toast.info(`Xem trước ${inst.fileName}`)} title="Xem trước"
                        className="p-0.5 text-muted-foreground hover:text-foreground">
                        <Eye className="w-3 h-3" />
                      </button>
                      <button onClick={() => toast.success(`Tải về ${inst.fileName}`)} title="Tải về"
                        className="p-0.5 text-muted-foreground hover:text-foreground">
                        <Download className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeInstance(tmpl.type)} title="Xóa"
                        className="p-0.5 text-muted-foreground hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : tmpl.autoGenerated ? (
                    <div className="mt-1 text-muted-foreground italic" style={{ fontSize: "10.5px" }}>
                      Auto-gen từ "Thiết bị cần thiết" của bài
                    </div>
                  ) : (
                    <div className="mt-1.5 flex items-center gap-2">
                      <button onClick={() => handleMockUpload(tmpl)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-card border border-border rounded hover:bg-secondary"
                        style={{ fontSize: "10.5px", fontWeight: 500 }}>
                        <Upload className="w-3 h-3" /> Upload
                      </button>
                      <span className="text-muted-foreground" style={{ fontSize: "10px" }}>
                        Accepted: {tmpl.acceptedTypes.join(", ")}
                      </span>
                      {tmpl.required && (
                        <span className="ml-auto text-orange-500" style={{ fontSize: "10px", fontWeight: 600 }}>
                          ⚠️ Bắt buộc
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded description */}
              {isExpanded && (
                <div className="px-14 py-2 bg-secondary/30 border-t border-border" style={{ fontSize: "11px", lineHeight: 1.5 }}>
                  <p className="text-foreground">{tmpl.label}</p>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground" style={{ fontSize: "10.5px" }}>
                    <span>Người dùng: {tmpl.forUsers.join(", ")}</span>
                    <span>·</span>
                    <span>Định dạng: {tmpl.acceptedTypes.join(", ")}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AttachmentSlotsPanel;
