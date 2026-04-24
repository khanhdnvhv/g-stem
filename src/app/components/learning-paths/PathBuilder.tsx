import { useState } from "react";
import {
  ChevronRight, ChevronLeft, Check, Plus, Trash2, GripVertical,
  BookOpen, Clock, Target, Award, Route, Search, AlertCircle, CheckCircle,
  Sparkles, Save, Eye, Settings2, Users, Milestone, ArrowRight, X,
} from "lucide-react";
import { mockPathsFull, mockTemplates } from "./mock-data";
import { mockCourses, DEPARTMENTS, SUBSIDIARIES, CATEGORIES } from "../mock-data";
import type { PathMilestone } from "./types";
import { useConfirm } from "../ConfirmDialog";

const STEPS = [
  { id: 1, title: "Thông tin cơ bản", icon: Settings2 },
  { id: 2, title: "Cấu trúc & Cột mốc", icon: Milestone },
  { id: 3, title: "Khóa học", icon: BookOpen },
  { id: 4, title: "Xem lại & Xuất bản", icon: Eye },
];

interface PathForm {
  title: string;
  description: string;
  category: string;
  level: string;
  department: string;
  subsidiary: string;
  mandatory: boolean;
  certificateOnCompletion: boolean;
  estimatedWeeks: number;
  tags: string[];
  milestones: PathMilestone[];
  selectedCourseIds: string[];
}

const INITIAL_FORM: PathForm = {
  title: "",
  description: "",
  category: "",
  level: "Cơ bản",
  department: "",
  subsidiary: "",
  mandatory: false,
  certificateOnCompletion: true,
  estimatedWeeks: 4,
  tags: [],
  milestones: [
    { id: "M1", title: "Cột mốc 1", description: "", courseIds: [], order: 1, requiredCompletionRate: 80 },
  ],
  selectedCourseIds: [],
};

export function PathBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<PathForm>(INITIAL_FORM);
  const [tagInput, setTagInput] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [savedDraft, setSavedDraft] = useState(false);
  const [published, setPublished] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const updateForm = (updates: Partial<PathForm>) => setForm(prev => ({ ...prev, ...updates }));

  const addMilestone = () => {
    const newM: PathMilestone = {
      id: `M${form.milestones.length + 1}`,
      title: `Cột mốc ${form.milestones.length + 1}`,
      description: "",
      courseIds: [],
      order: form.milestones.length + 1,
      requiredCompletionRate: 80,
    };
    updateForm({ milestones: [...form.milestones, newM] });
  };

  const updateMilestone = (id: string, updates: Partial<PathMilestone>) => {
    updateForm({
      milestones: form.milestones.map(m => m.id === id ? { ...m, ...updates } : m),
    });
  };

  const confirm = useConfirm();
  const removeMilestone = async (id: string) => {
    const m = form.milestones.find(m => m.id === id);
    const ok = await confirm({
      title: "Xóa cột mốc?",
      message: `Bạn có chắc muốn xóa cột mốc "${m?.title || ""}" và các khóa học liên kết?`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      updateForm({ milestones: form.milestones.filter(m => m.id !== id) });
    }
  };

  const toggleCourse = (courseId: string) => {
    const ids = form.selectedCourseIds.includes(courseId)
      ? form.selectedCourseIds.filter(id => id !== courseId)
      : [...form.selectedCourseIds, courseId];
    updateForm({ selectedCourseIds: ids });
  };

  const assignCourseToMilestone = (milestoneId: string, courseId: string) => {
    updateForm({
      milestones: form.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        const ids = m.courseIds.includes(courseId)
          ? m.courseIds.filter(id => id !== courseId)
          : [...m.courseIds, courseId];
        return { ...m, courseIds: ids };
      }),
    });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      updateForm({ tags: [...form.tags, t] });
      setTagInput("");
    }
  };

  const applyTemplate = (tplId: string) => {
    const tpl = mockTemplates.find(t => t.id === tplId);
    if (tpl) {
      setSelectedTemplate(tplId);
      updateForm({
        title: `${tpl.title} - Tùy chỉnh`,
        category: tpl.category,
        level: tpl.level,
        estimatedWeeks: tpl.estimatedWeeks,
        tags: tpl.tags,
      });
      setShowTemplates(false);
    }
  };

  const filteredCourses = mockCourses.filter(c => {
    const q = courseSearch.toLowerCase();
    return !q || c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

  const isStepValid = (step: number) => {
    if (step === 1) return form.title.length > 0 && form.category.length > 0;
    if (step === 2) return form.milestones.length > 0 && form.milestones.every(m => m.title.length > 0);
    if (step === 3) return form.selectedCourseIds.length > 0;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Template Suggestion Banner */}
      {showTemplates && currentStep === 1 && (
        <div className="bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/5 rounded-xl border border-[#c8a84e]/20 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#c8a84e]" />
              <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>Bắt đầu từ Template</h3>
            </div>
            <button onClick={() => setShowTemplates(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {mockTemplates.map(tpl => (
              <button key={tpl.id} onClick={() => applyTemplate(tpl.id)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${selectedTemplate === tpl.id ? "border-[#990803] bg-[#990803]/5" : "border-border bg-card hover:border-[#c8a84e]/50"}`}>
                <span style={{ fontSize: "20px" }}>{tpl.icon}</span>
                <p className="text-foreground mt-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>{tpl.title}</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{tpl.courseCount} khóa • {tpl.estimatedWeeks} tuần</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => isStepValid(currentStep) && setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  currentStep === step.id
                    ? "bg-[#990803] text-white"
                    : currentStep > step.id
                    ? "bg-green-50 text-green-700"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ fontSize: "11px", fontWeight: 600 }}>
                  {currentStep > step.id ? <Check className="w-3.5 h-3.5" /> : step.id}
                </div>
                <span className="hidden sm:inline" style={{ fontSize: "12px", fontWeight: 500 }}>{step.title}</span>
              </button>
              {i < STEPS.length - 1 && <div className="flex-1 h-0.5 bg-border mx-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card rounded-xl border border-border p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-foreground mb-4" style={{ fontSize: "16px", fontWeight: 600 }}>Thông tin cơ bản</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="lg:col-span-2">
                <label className="text-foreground block mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Tên lộ trình *</label>
                <input type="text" value={form.title} onChange={e => updateForm({ title: e.target.value })}
                  placeholder="VD: Lộ trình Quản lý Cấp trung"
                  className="w-full px-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  style={{ fontSize: "14px" }} />
              </div>
              <div className="lg:col-span-2">
                <label className="text-foreground block mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Mô tả</label>
                <textarea value={form.description} onChange={e => updateForm({ description: e.target.value })}
                  rows={3} placeholder="Mô tả mục tiêu, đối tượng và nội dung chính của lộ trình..."
                  className="w-full px-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                  style={{ fontSize: "13px" }} />
              </div>
              <div>
                <label className="text-foreground block mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Danh mục *</label>
                <select value={form.category} onChange={e => updateForm({ category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
                  <option value="">Chọn danh mục</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-foreground block mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Cấp độ</label>
                <div className="flex gap-2">
                  {["Cơ bản", "Trung cấp", "Nâng cao", "Chuyên gia"].map(lv => (
                    <button key={lv} onClick={() => updateForm({ level: lv })}
                      className={`flex-1 py-2 rounded-lg border transition-all cursor-pointer ${form.level === lv ? "border-[#990803] bg-[#990803]/5 text-[#990803]" : "border-border text-muted-foreground hover:border-[#990803]/30"}`}
                      style={{ fontSize: "12px", fontWeight: 500 }}>
                      {lv}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-foreground block mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Đơn vị thành viên</label>
                <select value={form.subsidiary} onChange={e => updateForm({ subsidiary: e.target.value })}
                  className="w-full px-4 py-2.5 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
                  <option value="">Toàn Tập đoàn</option>
                  {SUBSIDIARIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-foreground block mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Phòng ban</label>
                <select value={form.department} onChange={e => updateForm({ department: e.target.value })}
                  className="w-full px-4 py-2.5 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
                  <option value="">Tất cả phòng ban</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-foreground block mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Thời gian ước tính (tuần)</label>
                <input type="number" value={form.estimatedWeeks} onChange={e => updateForm({ estimatedWeeks: parseInt(e.target.value) || 1 })}
                  min={1} max={52}
                  className="w-full px-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  style={{ fontSize: "13px" }} />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.mandatory} onChange={e => updateForm({ mandatory: e.target.checked })}
                    className="w-4 h-4 accent-[#990803]" />
                  <span className="text-foreground" style={{ fontSize: "13px" }}>Bắt buộc</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.certificateOnCompletion}
                    onChange={e => updateForm({ certificateOnCompletion: e.target.checked })}
                    className="w-4 h-4 accent-[#990803]" />
                  <span className="text-foreground" style={{ fontSize: "13px" }}>Cấp chứng chỉ</span>
                </label>
              </div>
              {/* Tags */}
              <div className="lg:col-span-2">
                <label className="text-foreground block mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map(t => (
                    <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-[#990803]/10 text-[#990803] rounded" style={{ fontSize: "11px" }}>
                      {t}
                      <button onClick={() => updateForm({ tags: form.tags.filter(x => x !== t) })} className="hover:text-red-700 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Nhập tag và Enter"
                    className="flex-1 px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    style={{ fontSize: "12px" }} />
                  <button onClick={addTag} className="px-3 py-2 bg-secondary rounded-lg text-foreground cursor-pointer" style={{ fontSize: "12px" }}>
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Milestones */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>Cấu trúc Cột mốc</h3>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>Chia lộ trình thành các giai đoạn. Mỗi cột mốc có thể chứa nhiều khóa học.</p>
              </div>
              <button onClick={addMilestone}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
                style={{ fontSize: "12px", fontWeight: 500 }}>
                <Plus className="w-4 h-4" /> Thêm cột mốc
              </button>
            </div>

            <div className="space-y-3">
              {form.milestones.map((m, idx) => (
                <div key={m.id} className="border border-border rounded-xl p-4 hover:border-[#990803]/20 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 pt-1">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#990803] to-[#c8a84e] text-white flex items-center justify-center"
                        style={{ fontSize: "12px", fontWeight: 700 }}>{idx + 1}</div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-3">
                        <input type="text" value={m.title}
                          onChange={e => updateMilestone(m.id, { title: e.target.value })}
                          placeholder="Tên cột mốc"
                          className="flex-1 px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                          style={{ fontSize: "13px", fontWeight: 500 }} />
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground shrink-0" style={{ fontSize: "11px" }}>Yêu cầu:</span>
                          <input type="number" value={m.requiredCompletionRate}
                            onChange={e => updateMilestone(m.id, { requiredCompletionRate: parseInt(e.target.value) || 0 })}
                            min={0} max={100}
                            className="w-16 px-2 py-2 bg-input-background rounded-lg border-0 text-center focus:ring-2 focus:ring-primary/20 focus:outline-none"
                            style={{ fontSize: "12px" }} />
                          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>%</span>
                        </div>
                      </div>
                      <input type="text" value={m.description}
                        onChange={e => updateMilestone(m.id, { description: e.target.value })}
                        placeholder="Mô tả (tùy chọn)"
                        className="w-full px-3 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        style={{ fontSize: "12px" }} />
                      {/* Courses in this milestone */}
                      {m.courseIds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.courseIds.map(cid => {
                            const c = mockCourses.find(x => x.id === cid);
                            return c ? (
                              <span key={cid} className="flex items-center gap-1 px-2 py-1 bg-[#990803]/10 text-[#990803] rounded" style={{ fontSize: "11px" }}>
                                <BookOpen className="w-3 h-3" /> {c.title.slice(0, 30)}
                                <button onClick={() => assignCourseToMilestone(m.id, cid)} className="hover:text-red-700 cursor-pointer">
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                    <button onClick={() => removeMilestone(m.id)}
                      className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                      disabled={form.milestones.length <= 1}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Timeline Preview */}
            <div className="bg-secondary/30 rounded-xl p-4">
              <p className="text-muted-foreground mb-3" style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.5px" }}>XEM TRƯỚC LỘ TRÌNH</p>
              <div className="flex items-center">
                {form.milestones.map((m, i) => (
                  <div key={m.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#990803] to-[#c8a84e] text-white flex items-center justify-center"
                        style={{ fontSize: "12px", fontWeight: 700 }}>{i + 1}</div>
                      <p className="text-foreground mt-1 text-center" style={{ fontSize: "11px", fontWeight: 500 }}>{m.title}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{m.courseIds.length} khóa</p>
                    </div>
                    {i < form.milestones.length - 1 && (
                      <div className="flex-1 h-0.5 bg-[#990803]/30 mx-2 relative">
                        <ArrowRight className="w-3 h-3 text-[#990803]/50 absolute right-0 top-1/2 -translate-y-1/2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Course Selection */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>Chọn Khóa học</h3>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>Chọn khóa học và gán vào các cột mốc tương ứng.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={courseSearch} onChange={e => setCourseSearch(e.target.value)}
                placeholder="Tìm khóa học..."
                className="w-full pl-9 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                style={{ fontSize: "13px" }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Available courses */}
              <div className="lg:col-span-2 space-y-2">
                {filteredCourses.map(course => {
                  const isSelected = form.selectedCourseIds.includes(course.id);
                  return (
                    <div key={course.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${isSelected ? "border-[#990803] bg-[#990803]/5" : "border-border hover:border-[#990803]/30"}`}
                      onClick={() => toggleCourse(course.id)}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? "border-[#990803] bg-[#990803]" : "border-gray-300"}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <img src={course.thumbnail} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 500 }}>{course.title}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{course.duration} • {course.totalLessons} bài • {course.category}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground shrink-0" style={{ fontSize: "10px" }}>{course.level}</span>
                    </div>
                  );
                })}
              </div>

              {/* Milestone assignment panel */}
              <div className="space-y-3">
                <div className="bg-secondary/30 rounded-xl p-4 sticky top-4">
                  <p className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
                    Gán vào Cột mốc ({form.selectedCourseIds.length} khóa đã chọn)
                  </p>
                  {form.milestones.map((m, idx) => (
                    <div key={m.id} className="mb-3 last:mb-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#990803] text-white flex items-center justify-center"
                          style={{ fontSize: "10px", fontWeight: 700 }}>{idx + 1}</div>
                        <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{m.title}</span>
                      </div>
                      <div className="ml-7 space-y-1">
                        {form.selectedCourseIds.map(cid => {
                          const c = mockCourses.find(x => x.id === cid);
                          if (!c) return null;
                          const inThisMilestone = m.courseIds.includes(cid);
                          return (
                            <button key={cid} onClick={() => assignCourseToMilestone(m.id, cid)}
                              className={`w-full text-left px-2 py-1.5 rounded transition-all cursor-pointer ${inThisMilestone ? "bg-[#990803]/10 text-[#990803]" : "hover:bg-secondary text-muted-foreground"}`}
                              style={{ fontSize: "11px" }}>
                              <div className="flex items-center gap-1.5">
                                {inThisMilestone && <Check className="w-3 h-3" />}
                                {c.title.slice(0, 35)}{c.title.length > 35 ? "..." : ""}
                              </div>
                            </button>
                          );
                        })}
                        {form.selectedCourseIds.length === 0 && (
                          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Chọn khóa học ở bên trái</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>Xem lại & Xuất bản</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div className="bg-secondary/30 rounded-xl p-4">
                  <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 500 }}>THÔNG TIN CHUNG</p>
                  <h4 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>{form.title || "(Chưa đặt tên)"}</h4>
                  <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>{form.description || "(Chưa có mô tả)"}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-0.5 rounded bg-[#990803]/10 text-[#990803]" style={{ fontSize: "11px" }}>{form.level}</span>
                    <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground" style={{ fontSize: "11px" }}>{form.category || "Chưa phân loại"}</span>
                    {form.mandatory && <span className="px-2 py-0.5 rounded bg-red-50 text-red-700" style={{ fontSize: "11px" }}>Bắt buộc</span>}
                    {form.certificateOnCompletion && <span className="px-2 py-0.5 rounded bg-[#c8a84e]/10 text-[#c8a84e]" style={{ fontSize: "11px" }}>Có chứng chỉ</span>}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-card rounded-xl border border-border p-3 text-center">
                    <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>{form.milestones.length}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Cột mốc</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-3 text-center">
                    <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>{form.selectedCourseIds.length}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Khóa học</p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-3 text-center">
                    <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>{form.estimatedWeeks}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Tuần</p>
                  </div>
                </div>
              </div>

              {/* Timeline Preview */}
              <div className="bg-secondary/30 rounded-xl p-4">
                <p className="text-muted-foreground mb-3" style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.5px" }}>CẤU TRÚC LỘ TRÌNH</p>
                <div className="space-y-0">
                  {form.milestones.map((m, idx) => (
                    <div key={m.id} className="relative">
                      {idx < form.milestones.length - 1 && (
                        <div className="absolute left-[15px] top-[32px] bottom-0 w-0.5 bg-[#990803]/30" />
                      )}
                      <div className="flex items-start gap-3 pb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#990803] to-[#c8a84e] text-white flex items-center justify-center shrink-0 z-10"
                          style={{ fontSize: "11px", fontWeight: 700 }}>{idx + 1}</div>
                        <div>
                          <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{m.title}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{m.courseIds.length} khóa học • Yêu cầu {m.requiredCompletionRate}%</p>
                          {m.courseIds.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {m.courseIds.map(cid => {
                                const c = mockCourses.find(x => x.id === cid);
                                return c ? (
                                  <p key={cid} className="text-muted-foreground" style={{ fontSize: "10px" }}>• {c.title}</p>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Validation warnings */}
            {form.milestones.some(m => m.courseIds.length === 0) && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
                <p className="text-yellow-800" style={{ fontSize: "12px" }}>Một số cột mốc chưa được gán khóa học. Bạn vẫn có thể lưu nháp.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-40 transition-colors cursor-pointer"
          style={{ fontSize: "13px", fontWeight: 500 }}>
          <ChevronLeft className="w-4 h-4" /> Quay lại
        </button>
        <div className="flex gap-2">
          {currentStep === 4 && !published && (
            <button onClick={() => { setSavedDraft(true); import("sonner").then(m => m.toast.success("Đã lưu nháp lộ trình đào tạo!")); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${savedDraft ? "bg-green-50 text-green-600" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Save className="w-4 h-4" /> {savedDraft ? "✓ Đã lưu nháp" : "Lưu nháp"}
            </button>
          )}
          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(s => Math.min(4, s + 1))}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              Tiếp theo <ChevronRight className="w-4 h-4" />
            </button>
          ) : published ? (
            <span className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <CheckCircle className="w-4 h-4" /> Đã xuất bản
            </span>
          ) : (
            <button onClick={() => { setPublished(true); import("sonner").then(m => m.toast.success("Lộ trình đào tạo đã được xuất bản thành công!")); }} className="flex items-center gap-2 px-5 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Route className="w-4 h-4" /> Xuất bản Lộ trình
            </button>
          )}
        </div>
      </div>
    </div>
  );
}