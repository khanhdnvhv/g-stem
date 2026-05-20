/* ================================================================ */
/*  CT SELECTOR WIZARD — 3-step picker chọn CT/Bậc/Module             */
/*  Mở khi click "Soạn bài mới" trong ContentAuthoringStudio          */
/*  Cuối wizard → navigate đến /supplier/content/authoring/new       */
/*  hoặc /supplier/content/authoring/research/new (CT5)              */
/* ================================================================ */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  X, ChevronLeft, ChevronRight, CheckCircle2, GraduationCap,
  Sparkles, Lightbulb, Cpu, Microscope, BookOpen,
} from "lucide-react";
import {
  STEM_PROGRAMS, CT_TEMPLATES, CT4_MODULES, CT5_TOPICS, SUBJECTS,
  type StemProgram, type CT4Module, type CT5Topic,
} from "../../mock-data/index";
import { ProgramBadge } from "../ui/badges";

/* ── Icon mapping per CT ── */
const CT_ICONS: Record<StemProgram, typeof BookOpen> = {
  CT1: BookOpen,
  CT2: GraduationCap,
  CT3: Sparkles,
  CT4: Cpu,
  CT5: Microscope,
};

/* ── 6 cấp bậc học ── */
const GRADE_TIERS = [
  { id: "Mầm non",    label: "Mầm non",     subgrades: ["Mầm non"] },
  { id: "Tiểu học",   label: "Tiểu học",    subgrades: ["Tiểu học 1", "Tiểu học 2", "Tiểu học 3", "Tiểu học 4", "Tiểu học 5"] },
  { id: "THCS",       label: "THCS",        subgrades: ["THCS 6", "THCS 7", "THCS 8", "THCS 9"] },
  { id: "THPT",       label: "THPT",        subgrades: ["THPT 10", "THPT 11", "THPT 12"] },
  { id: "THPT Nghề",  label: "THPT Nghề",   subgrades: ["THPT Nghề"] },
];

interface WizardState {
  step: 1 | 2 | 3;
  ct: StemProgram | null;
  tier: string;
  grade: string;
  /* CT-specific step 3 */
  subject: string;
  ct4Module: string;
  ct5Topic: string;
}

interface CTSelectorWizardProps {
  open: boolean;
  onClose: () => void;
  /** Pre-select CT — khi mở từ STEMProgramManager đã biết CT */
  initialCT?: StemProgram;
}

export function CTSelectorWizard({ open, onClose, initialCT }: CTSelectorWizardProps) {
  const navigate = useNavigate();
  const [state, setState] = useState<WizardState>({
    step: initialCT ? 2 : 1,
    ct: initialCT ?? null,
    tier: "", grade: "",
    subject: "", ct4Module: "", ct5Topic: "",
  });

  /* Reset state mỗi lần wizard mở — để initialCT áp dụng đúng */
  useEffect(() => {
    if (open) {
      setState({
        step: initialCT ? 2 : 1,
        ct: initialCT ?? null,
        tier: "", grade: "",
        subject: "", ct4Module: "", ct5Topic: "",
      });
    }
  }, [open, initialCT]);

  if (!open) return null;

  const ctTemplate = state.ct ? CT_TEMPLATES[state.ct] : null;

  /* ── Step validation ── */
  const canNext = (() => {
    if (state.step === 1) return !!state.ct;
    if (state.step === 2) return !!state.grade;
    if (state.step === 3) {
      if (!state.ct) return false;
      if (state.ct === "CT1") return !!state.subject;
      if (state.ct === "CT2") return !!state.subject;
      if (state.ct === "CT3") return true; // Tự nhập sau ở editor
      if (state.ct === "CT4") return !!state.ct4Module;
      if (state.ct === "CT5") return !!state.ct5Topic;
    }
    return false;
  })();

  /* ── Suitable grades for CT ── */
  const availableTiers = (() => {
    if (!ctTemplate) return GRADE_TIERS;
    return GRADE_TIERS.filter((t) =>
      STEM_PROGRAMS[ctTemplate.code].supportedGrades.includes(t.id)
    );
  })();

  /* ── Available subjects for CT ── */
  const availableSubjects = (() => {
    if (!state.ct) return SUBJECTS;
    return STEM_PROGRAMS[state.ct].supportedSubjects;
  })();

  /* ── Suitable CT5 topics filtered by grade ── */
  const availableTopics = (() => {
    if (state.ct !== "CT5" || !state.tier) return CT5_TOPICS;
    return CT5_TOPICS.filter((t) => t.suitableGrades.includes(state.tier));
  })();

  /* ── Suitable CT4 modules ── */
  const availableModules = (() => {
    if (state.ct !== "CT4" || !state.tier) return CT4_MODULES;
    return CT4_MODULES.filter((m) => m.suitableGrades.includes(state.tier));
  })();

  /* ── Navigate ── */
  const handleFinish = () => {
    if (!state.ct) return;
    const params = new URLSearchParams({
      ct: state.ct,
      grade: state.grade,
    });
    if (state.subject)   params.set("subject", state.subject);
    if (state.ct4Module) params.set("module", state.ct4Module);
    if (state.ct5Topic)  params.set("topic",  state.ct5Topic);

    onClose();
    if (CT_TEMPLATES[state.ct].editorVariant === "research") {
      navigate(`/supplier/content/authoring/research/new?${params.toString()}`);
    } else {
      navigate(`/supplier/content/authoring/new?${params.toString()}`);
    }
  };

  const goNext = () => {
    if (!canNext) return;
    if (state.step < 3) setState((s) => ({ ...s, step: (s.step + 1) as 1 | 2 | 3 }));
    else handleFinish();
  };

  const goBack = () => {
    if (state.step > 1) setState((s) => ({ ...s, step: (s.step - 1) as 1 | 2 | 3 }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/5">
          <div className="w-9 h-9 rounded-full bg-[#990803] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 style={{ fontSize: "16px", fontWeight: 700 }}>Tạo bài giảng STEM mới</h2>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
              Chọn chương trình STEM và thông tin cơ bản — hệ thống sẽ tạo template phù hợp.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground" title="Đóng">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Stepper ── */}
        <div className="px-5 py-3 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => {
              const isActive = state.step === s;
              const isDone = state.step > s;
              const labels = ["Chọn CT", "Bậc học", "Cụ thể"];
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isDone ? "bg-[#16a34a] text-white" : isActive ? "bg-[#990803] text-white" : "bg-secondary text-muted-foreground"
                    }`}
                    style={{ fontSize: "12px", fontWeight: 700 }}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: "11.5px", fontWeight: isActive ? 700 : 500, color: isActive ? "var(--foreground)" : "var(--muted-foreground)" }}>
                      Bước {s}
                    </p>
                    <p className="text-muted-foreground truncate" style={{ fontSize: "10.5px" }}>{labels[s - 1]}</p>
                  </div>
                  {s < 3 && <div className={`h-px flex-1 ${isDone ? "bg-[#16a34a]" : "bg-border"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* ── STEP 1: Choose CT ── */}
          {state.step === 1 && (
            <div className="space-y-3">
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
                Chọn 1 trong 5 chương trình STEM. Mỗi chương trình có template editor riêng biệt phù hợp với phương pháp dạy.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(Object.keys(CT_TEMPLATES) as StemProgram[]).map((code) => {
                  const tmpl    = CT_TEMPLATES[code];
                  const meta    = STEM_PROGRAMS[code];
                  const Icon    = CT_ICONS[code];
                  const isActive = state.ct === code;
                  return (
                    <button
                      key={code}
                      onClick={() => setState((s) => ({ ...s, ct: code, tier: "", grade: "", subject: "", ct4Module: "", ct5Topic: "" }))}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        isActive
                          ? "border-[#990803] bg-[#990803]/5 shadow-md"
                          : "border-border hover:border-[#990803]/40 hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: meta.color + "20" }}>
                          <Icon className="w-4.5 h-4.5" style={{ color: meta.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <ProgramBadge code={code} size="xs" />
                            <span style={{ fontSize: "12.5px", fontWeight: 600 }}>{tmpl.shortName}</span>
                            {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] ml-auto" />}
                          </div>
                          <p className="text-muted-foreground" style={{ fontSize: "11px", lineHeight: 1.45 }}>
                            {tmpl.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className="px-1.5 py-0.5 bg-secondary text-muted-foreground rounded" style={{ fontSize: "9.5px", fontWeight: 600 }}>
                              {tmpl.phases.length} giai đoạn
                            </span>
                            <span className="px-1.5 py-0.5 bg-secondary text-muted-foreground rounded" style={{ fontSize: "9.5px", fontWeight: 600 }}>
                              {tmpl.defaultDuration > 0 ? `${tmpl.defaultDuration}p` : "3 tháng – 2 năm"}
                            </span>
                            {tmpl.editorVariant === "research" && (
                              <span className="px-1.5 py-0.5 bg-[#7c3aed]/15 text-[#7c3aed] rounded" style={{ fontSize: "9.5px", fontWeight: 700 }}>
                                Nghiên cứu KH
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected CT detail */}
              {ctTemplate && (
                <div className="mt-3 p-3 bg-secondary/40 rounded-lg border border-border">
                  <p className="text-muted-foreground mb-1.5" style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.05em" }}>
                    THÔNG TIN CHI TIẾT
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5" style={{ fontSize: "11.5px" }}>
                    <div>
                      <span className="text-muted-foreground">GV phụ trách:</span>
                      <span className="ml-1.5" style={{ fontWeight: 500 }}>{ctTemplate.targetTeacher}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Slot TKB:</span>
                      <span className="ml-1.5" style={{ fontWeight: 500 }}>
                        {ctTemplate.scheduleSlot === "main" ? "Tiết chính khoá"
                         : ctTemplate.scheduleSlot === "session2" ? "Buổi 2"
                         : "Ngoại khoá / CLB"}
                      </span>
                    </div>
                    {ctTemplate.groupActivityRequired && (
                      <div className="md:col-span-2">
                        <span className="px-1.5 py-0.5 bg-[#7c3aed]/15 text-[#7c3aed] rounded" style={{ fontSize: "10px", fontWeight: 700 }}>
                          ⚠️ Bắt buộc có hoạt động nhóm
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 2: Choose grade ── */}
          {state.step === 2 && (
            <div className="space-y-4">
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
                Chọn bậc học và khối lớp cụ thể cho bài giảng <ProgramBadge code={state.ct!} size="xs" />.
              </p>

              {/* Tier */}
              <div>
                <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>BẬC HỌC</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableTiers.map((t) => {
                    const isActive = state.tier === t.id;
                    return (
                      <button key={t.id}
                        onClick={() => setState((s) => ({ ...s, tier: t.id, grade: "" }))}
                        className={`px-3 py-2.5 rounded-lg border-2 transition-all text-center ${
                          isActive ? "border-[#990803] bg-[#990803]/5" : "border-border hover:bg-secondary"
                        }`}
                        style={{ fontSize: "12.5px", fontWeight: isActive ? 700 : 500 }}>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific class */}
              {state.tier && (
                <div>
                  <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>KHỐI LỚP</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTiers.find((t) => t.id === state.tier)?.subgrades.map((g) => {
                      const isActive = state.grade === g;
                      return (
                        <button key={g}
                          onClick={() => setState((s) => ({ ...s, grade: g }))}
                          className={`px-3 py-1.5 rounded-lg border transition-all ${
                            isActive ? "bg-[#990803] text-white border-[#990803]" : "border-border bg-card hover:bg-secondary"
                          }`}
                          style={{ fontSize: "12px", fontWeight: 500 }}>
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: CT-specific ── */}
          {state.step === 3 && state.ct && (
            <div className="space-y-3">
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
                {state.ct === "CT1" && "Chọn môn học cụ thể — bài giảng sẽ dạy theo phương thức STEM trong tiết học chính của môn."}
                {state.ct === "CT2" && "Chọn môn chủ đạo — môn tích hợp và chủ đề sẽ điền sau ở editor."}
                {state.ct === "CT3" && "Đây là hoạt động đổi mới sáng tạo. Tên hoạt động và sản phẩm cuối sẽ điền ở editor."}
                {state.ct === "CT4" && "Chọn 1 trong 4 module công nghệ. Mỗi module có ngôn ngữ lập trình và phần cứng đặc trưng."}
                {state.ct === "CT5" && "Chọn 1 trong 18 chủ đề nghiên cứu khoa học. Mỗi chủ đề có phương pháp luận đặc trưng."}
              </p>

              {/* CT1 or CT2: Subject picker */}
              {(state.ct === "CT1" || state.ct === "CT2") && (
                <div>
                  <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>
                    {state.ct === "CT2" ? "MÔN CHỦ ĐẠO" : "MÔN HỌC"}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableSubjects.map((sub) => {
                      const isActive = state.subject === sub;
                      return (
                        <button key={sub}
                          onClick={() => setState((s) => ({ ...s, subject: sub }))}
                          className={`px-3 py-2 rounded-lg border-2 transition-all ${
                            isActive ? "border-[#990803] bg-[#990803]/5" : "border-border hover:bg-secondary"
                          }`}
                          style={{ fontSize: "12px", fontWeight: isActive ? 700 : 500 }}>
                          {sub}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CT3: just info */}
              {state.ct === "CT3" && (
                <div className="p-4 bg-[#7c3aed]/5 border border-[#7c3aed]/20 rounded-xl">
                  <Lightbulb className="w-7 h-7 text-[#7c3aed]" />
                  <p className="mt-2" style={{ fontSize: "13px", fontWeight: 600 }}>
                    Hoạt động đổi mới sáng tạo
                  </p>
                  <p className="text-muted-foreground mt-1" style={{ fontSize: "11.5px", lineHeight: 1.5 }}>
                    Khi vào editor, bạn cần điền: <strong>Tên hoạt động</strong>, <strong>Lĩnh vực</strong>, <strong>Sản phẩm cuối dự kiến</strong>, <strong>Số HS/nhóm</strong>.
                    Hoạt động sáng tạo không gắn với SGK — đây là "môn học buổi 2" riêng biệt.
                  </p>
                </div>
              )}

              {/* CT4: Module picker */}
              {state.ct === "CT4" && (
                <div>
                  <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>MODULE CÔNG NGHỆ</p>
                  {availableModules.length === 0 ? (
                    <p className="text-orange-500 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg" style={{ fontSize: "12px" }}>
                      Không có module phù hợp với bậc {state.tier}. Quay lại chọn bậc khác.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableModules.map((mod: CT4Module) => {
                        const isActive = state.ct4Module === mod.id;
                        return (
                          <button key={mod.id}
                            onClick={() => setState((s) => ({ ...s, ct4Module: mod.id }))}
                            className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                              isActive ? "border-[#990803] bg-[#990803]/5" : "border-border hover:bg-secondary/50"
                            }`}>
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: mod.color + "20" }}>
                                <Cpu className="w-4 h-4" style={{ color: mod.color }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p style={{ fontSize: "13px", fontWeight: 600 }}>{mod.name}</p>
                                <p className="text-muted-foreground" style={{ fontSize: "11px", lineHeight: 1.45 }}>{mod.description}</p>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {mod.languages.map((l) => (
                                    <span key={l} className="px-1.5 py-0.5 bg-secondary text-muted-foreground rounded" style={{ fontSize: "9.5px", fontWeight: 600 }}>
                                      {l}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {isActive && <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0 mt-1" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* CT5: Topic picker */}
              {state.ct === "CT5" && (
                <div>
                  <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>
                    CHỦ ĐỀ NCKH ({availableTopics.length} chủ đề phù hợp bậc {state.tier})
                  </p>
                  {availableTopics.length === 0 ? (
                    <p className="text-orange-500 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg" style={{ fontSize: "12px" }}>
                      Không có chủ đề phù hợp. CT5 NCKH chủ yếu cho THCS/THPT.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {availableTopics.map((topic: CT5Topic) => {
                        const isActive = state.ct5Topic === topic.id;
                        return (
                          <button key={topic.id}
                            onClick={() => setState((s) => ({ ...s, ct5Topic: topic.id }))}
                            className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                              isActive ? "border-[#990803] bg-[#990803]/5" : "border-border hover:bg-secondary/50"
                            }`}>
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#059669]/20 flex items-center justify-center shrink-0">
                                <Microscope className="w-4 h-4 text-[#059669]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="font-mono text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>{topic.id}</span>
                                  <p style={{ fontSize: "12.5px", fontWeight: 600 }}>{topic.name}</p>
                                </div>
                                <p className="text-muted-foreground" style={{ fontSize: "11px", lineHeight: 1.45 }}>{topic.description}</p>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  <span className="px-1.5 py-0.5 bg-secondary text-muted-foreground rounded" style={{ fontSize: "9.5px", fontWeight: 600 }}>
                                    {topic.field}
                                  </span>
                                  <span className="px-1.5 py-0.5 bg-[#c8a84e]/20 text-[#c8a84e] rounded" style={{ fontSize: "9.5px", fontWeight: 700 }}>
                                    {topic.estimatedDuration === "3m" ? "3 tháng" : topic.estimatedDuration === "6m" ? "6 tháng" : topic.estimatedDuration === "1y" ? "1 năm" : "2 năm"}
                                  </span>
                                </div>
                              </div>
                              {isActive && <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0 mt-1" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border bg-secondary/20">
          <button onClick={state.step > 1 ? goBack : onClose}
            className="flex items-center gap-1 px-3 py-1.5 border border-border bg-card rounded-md hover:bg-secondary"
            style={{ fontSize: "12px" }}>
            <ChevronLeft className="w-3.5 h-3.5" />
            {state.step > 1 ? "Quay lại" : "Hủy"}
          </button>

          <div className="text-muted-foreground" style={{ fontSize: "11px" }}>
            Bước {state.step}/3
          </div>

          <button onClick={goNext} disabled={!canNext}
            className="flex items-center gap-1 px-4 py-1.5 bg-[#990803] text-white rounded-md hover:bg-[#7a0602] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontSize: "12px", fontWeight: 600 }}>
            {state.step < 3 ? "Tiếp theo" : "Tạo bài giảng"}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CTSelectorWizard;
