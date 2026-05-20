/* ================================================================ */
/*  LESSON PREVIEW MODAL — Render bài giảng ở góc nhìn HS/GV          */
/*  Full-screen modal, readonly mode                                  */
/*  Tabs: "HS view" | "GV view" (GV thấy thêm answer keys/notes)     */
/* ================================================================ */

import { useState } from "react";
import {
  X, Eye, GraduationCap, Users, ChevronLeft, ChevronRight,
  Target, Award, Cpu, Clock, FileText, CheckCircle2,
} from "lucide-react";
import {
  STEM_PROGRAMS, COMPETENCY_META, DEVICES,
  type StemProgram, type BlockType, type Competency,
} from "../../mock-data/index";
import { ProgramBadge } from "../ui/badges";
import { renderEditableBlock } from "./BlockComponents";
import type { Phase } from "../../mock-data/ct-templates";

export interface PreviewBlock {
  id: string;
  type: BlockType;
  content: unknown;
  phaseId: string;
}

interface LessonPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  programCode: StemProgram;
  grade: string;
  subject?: string;
  durationMinutes?: number;
  phases: Phase[];
  blocks: PreviewBlock[];
  objectives?: {
    knowledge: string;
    skills: string;
    attitude: string;
  };
  competencies: Competency[];
  requiredDevices: Array<{ deviceId: string; qty: number }>;
}

type ViewMode = "student" | "teacher";

export function LessonPreviewModal({
  open, onClose, title, programCode, grade, subject, durationMinutes,
  phases, blocks, objectives, competencies, requiredDevices,
}: LessonPreviewModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("student");
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);

  if (!open) return null;

  const programMeta = STEM_PROGRAMS[programCode];
  const activePhase = phases[activePhaseIdx];
  const phaseBlocks = blocks.filter((b) => b.phaseId === activePhase?.id);

  const goPrev = () => setActivePhaseIdx((i) => Math.max(0, i - 1));
  const goNext = () => setActivePhaseIdx((i) => Math.min(phases.length - 1, i + 1));

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card">
        <button onClick={onClose} className="flex items-center gap-1 px-2.5 py-1.5 border border-border bg-card rounded hover:bg-secondary"
          style={{ fontSize: "12px" }}>
          <X className="w-3.5 h-3.5" /> Đóng preview
        </button>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-[#0891b2]" />
          <span style={{ fontSize: "13px", fontWeight: 600 }}>Preview</span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-0.5 bg-secondary rounded-md p-0.5 ml-2">
          {([
            { id: "student", label: "Học sinh", icon: GraduationCap, color: "#16a34a" },
            { id: "teacher", label: "Giáo viên", icon: Users,        color: "#990803" },
          ] as const).map((m) => {
            const MIcon = m.icon;
            const active = viewMode === m.id;
            return (
              <button key={m.id} onClick={() => setViewMode(m.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded ${active ? "bg-card shadow-sm" : "hover:bg-card/50"}`}
                style={{ fontSize: "11.5px", fontWeight: active ? 600 : 400 }}>
                <MIcon className="w-3 h-3" style={{ color: active ? m.color : undefined }} />
                {m.label}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <ProgramBadge code={programCode} size="xs" />
          <span className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "10.5px" }}>{grade}</span>
          {subject && <span className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "10.5px" }}>{subject}</span>}
          {durationMinutes && durationMinutes > 0 && (
            <span className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "10.5px" }}>{durationMinutes}p</span>
          )}
        </div>
      </div>

      {/* Body: phase sidebar + content */}
      <div className="flex-1 overflow-hidden grid" style={{ gridTemplateColumns: "220px 1fr" }}>

        {/* Phase sidebar */}
        <div className="border-r border-border bg-card/40 p-3 overflow-y-auto">
          <p className="text-muted-foreground mb-2.5" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em" }}>
            {phases.length} GIAI ĐOẠN
          </p>
          <div className="space-y-1">
            {phases.map((ph, idx) => {
              const cnt = blocks.filter((b) => b.phaseId === ph.id).length;
              const isActive = idx === activePhaseIdx;
              return (
                <button key={ph.id} onClick={() => setActivePhaseIdx(idx)}
                  className={`w-full text-left p-2 rounded-md transition-colors ${
                    isActive ? "text-white" : "hover:bg-secondary text-foreground"
                  }`}
                  style={isActive ? { backgroundColor: ph.color } : {}}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isActive ? "bg-white/20" : "bg-secondary"
                      }`} style={{ fontSize: "10px", fontWeight: 700 }}>
                        {idx + 1}
                      </span>
                      <span className="truncate" style={{ fontSize: "11.5px", fontWeight: isActive ? 700 : 500 }}>
                        {ph.label}
                      </span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded shrink-0 ${
                      isActive ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
                    }`} style={{ fontSize: "9.5px", fontWeight: 600 }}>
                      {cnt}b
                    </span>
                  </div>
                  {ph.targetMin > 0 && (
                    <p className={`mt-0.5 flex items-center gap-0.5 ${isActive ? "text-white/80" : "text-muted-foreground"}`}
                      style={{ fontSize: "10px" }}>
                      <Clock className="w-2.5 h-2.5" />
                      ~{ph.targetMin}p
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">

            {/* Title + meta — chỉ hiện ở phase 1 */}
            {activePhaseIdx === 0 && (
              <div className="space-y-3 pb-4 border-b border-border">
                <h1 style={{ fontSize: "24px", fontWeight: 800, lineHeight: 1.2 }}>{title}</h1>
                <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: "12px" }}>
                  <span className="text-muted-foreground">Chương trình:</span>
                  <ProgramBadge code={programCode} size="sm" showName />
                  <span className="text-muted-foreground">·</span>
                  <span style={{ fontWeight: 500 }}>{grade}</span>
                  {subject && (<><span className="text-muted-foreground">·</span><span style={{ fontWeight: 500 }}>{subject}</span></>)}
                </div>

                {/* GV view: thêm objectives + competencies + devices */}
                {viewMode === "teacher" && (
                  <>
                    {objectives && (objectives.knowledge || objectives.skills || objectives.attitude) && (
                      <div className="bg-[#990803]/5 border border-[#990803]/20 rounded-lg p-3 mt-3">
                        <p className="text-[#990803] mb-2 flex items-center gap-1.5" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em" }}>
                          <Target className="w-3.5 h-3.5" /> MỤC TIÊU BÀI HỌC (5512)
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ fontSize: "11.5px", lineHeight: 1.5 }}>
                          {objectives.knowledge && (
                            <div>
                              <p className="text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>KIẾN THỨC</p>
                              <p>{objectives.knowledge}</p>
                            </div>
                          )}
                          {objectives.skills && (
                            <div>
                              <p className="text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>KỸ NĂNG</p>
                              <p>{objectives.skills}</p>
                            </div>
                          )}
                          {objectives.attitude && (
                            <div>
                              <p className="text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>THÁI ĐỘ</p>
                              <p>{objectives.attitude}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {competencies.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-muted-foreground flex items-center gap-1" style={{ fontSize: "11px", fontWeight: 600 }}>
                          <Award className="w-3.5 h-3.5" /> Năng lực:
                        </span>
                        {competencies.map((c) => {
                          const m = COMPETENCY_META[c];
                          return (
                            <span key={c} className="px-2 py-0.5 rounded text-white" style={{ fontSize: "10.5px", fontWeight: 600, backgroundColor: m.color }}>
                              {m.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {requiredDevices.length > 0 && (
                      <div className="bg-[#0891b2]/5 border border-[#0891b2]/20 rounded-lg p-3">
                        <p className="text-[#0891b2] mb-1.5 flex items-center gap-1.5" style={{ fontSize: "11px", fontWeight: 700 }}>
                          <Cpu className="w-3.5 h-3.5" /> THIẾT BỊ CẦN ({requiredDevices.length})
                        </p>
                        <ul className="space-y-0.5" style={{ fontSize: "11.5px" }}>
                          {requiredDevices.map((d) => {
                            const dev = DEVICES.find((x) => x.id === d.deviceId);
                            if (!dev) return null;
                            return (
                              <li key={d.deviceId} className="flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-[#16a34a]" />
                                <span>{dev.name}</span>
                                <span className="text-muted-foreground ml-auto">× {d.qty}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Phase header */}
            {activePhase && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: activePhase.color, fontSize: "13px", fontWeight: 700 }}>
                  {activePhaseIdx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 style={{ fontSize: "18px", fontWeight: 700 }}>{activePhase.label}</h2>
                  {activePhase.targetMin > 0 && (
                    <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
                      <Clock className="w-3 h-3 inline mr-0.5" />
                      Khoảng {activePhase.targetMin} phút
                    </p>
                  )}
                </div>
                {viewMode === "teacher" && activePhase.hint && (
                  <span className="text-muted-foreground italic px-3 py-1.5 bg-secondary/40 rounded" style={{ fontSize: "10.5px" }}>
                    💡 {activePhase.hint}
                  </span>
                )}
              </div>
            )}

            {/* Blocks readonly */}
            {phaseBlocks.length === 0 ? (
              <div className="py-12 text-center bg-card border border-dashed border-border rounded-xl">
                <FileText className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground" style={{ fontSize: "12.5px" }}>
                  Chưa có nội dung cho giai đoạn này
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {phaseBlocks.map((b) => (
                  <div key={b.id} className="bg-card border border-border rounded-xl p-4">
                    {renderEditableBlock(b.type, b.content, () => {}, true /* readonly */)}
                  </div>
                ))}
              </div>
            )}

            {/* Phase nav */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button onClick={goPrev} disabled={activePhaseIdx === 0}
                className="flex items-center gap-1 px-3 py-1.5 border border-border bg-card rounded-md hover:bg-secondary disabled:opacity-30"
                style={{ fontSize: "12px" }}>
                <ChevronLeft className="w-3.5 h-3.5" /> Phase trước
              </button>
              <span className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
                {activePhaseIdx + 1} / {phases.length}
              </span>
              <button onClick={goNext} disabled={activePhaseIdx >= phases.length - 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-border bg-card rounded-md hover:bg-secondary disabled:opacity-30"
                style={{ fontSize: "12px" }}>
                Phase tiếp <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LessonPreviewModal;
