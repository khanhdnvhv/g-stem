import React from "react";
import {
  X, Plus, BookOpen, Tag, Image, Check, Upload, ChevronRight, ChevronLeft,
  GripVertical, Trash2, Clock, Users, Award, Calendar, Bell, Target,
  FileText, Video, Headphones, ClipboardList, Settings, Eye, Layers,
  Building2, UserCheck, BookMarked, AlertTriangle, Sparkles, Globe, Monitor, MapPin,
  Save, RotateCcw, Search, Star, Link2, Unlink, ArrowUp, ArrowDown,
  File, Copy, ChevronDown,
} from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CATEGORIES, SUBSIDIARIES, DEPARTMENTS, courseImages } from "./mock-data";
import type { Course } from "./mock-data";
import { useAuth } from "./AuthContext";
import { INITIAL_CONTENT, TYPE_CONFIG } from "./ContentBank";
import type { ContentItem } from "./ContentBank";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════
// Types & Constants
// ═══════════════════════════════════════════════════════════════

export interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (course: Course) => void;
  editCourse?: Course | null;
}

const LEVELS: Course["level"][] = ["Cơ bản", "Trung cấp", "Nâng cao"];

const TRAINING_FORMATS = [
  { id: "online", label: "Trực tuyến (E-learning)", icon: Globe, color: "#2e86de" },
  { id: "offline", label: "Trực tiếp (Classroom)", icon: MapPin, color: "#27ae60" },
  { id: "blended", label: "Kết hợp (Blended)", icon: Monitor, color: "#8e44ad" },
];

const LESSON_TYPES = [
  { id: "video", label: "Video bài giảng", icon: Video, emoji: "🎬" },
  { id: "document", label: "Tài liệu đọc", icon: FileText, emoji: "📄" },
  { id: "quiz", label: "Bài kiểm tra", icon: ClipboardList, emoji: "📝" },
  { id: "audio", label: "Audio / Podcast", icon: Headphones, emoji: "🎧" },
  { id: "assignment", label: "Bài tập thực hành", icon: BookMarked, emoji: "✏️" },
  { id: "slide", label: "Slide trình chiếu", icon: File, emoji: "📊" },
  { id: "scorm", label: "Gói SCORM", icon: Layers, emoji: "📦" },
];

interface LinkedContent {
  id: string;
  title: string;
  type: string;
  size: string;
  author: string;
}

interface LessonItem {
  id: string;
  title: string;
  type: string;
  duration: string;
  linkedContent: LinkedContent | null;
}

interface ModuleItem {
  id: string;
  title: string;
  lessons: LessonItem[];
  expanded: boolean;
}

interface DraftState {
  step: number;
  title: string;
  description: string;
  thumbnail: string;
  objectives: string[];
  category: string;
  subsidiary: string;
  level: Course["level"];
  targetDepts: string[];
  prerequisites: string;
  instructorName: string;
  coInstructors: string;
  duration: string;
  trainingFormat: string;
  modules: ModuleItem[];
  status: Course["status"];
  mandatory: boolean;
  tags: string[];
  startDate: string;
  endDate: string;
  passingScore: number;
  hasCertificate: boolean;
  maxStudents: number;
  autoNotify: boolean;
  allowOffline: boolean;
  requireApproval: boolean;
  savedAt: string;
}

const STEP_LABELS = [
  { num: 1, label: "Thông tin cơ bản", icon: FileText },
  { num: 2, label: "Phân loại & Đối tượng", icon: Target },
  { num: 3, label: "Cấu trúc nội dung", icon: Layers },
  { num: 4, label: "Cài đặt nâng cao", icon: Settings },
  { num: 5, label: "Xem trước", icon: Eye },
];

const DRAFT_KEY = "geleximco_lms_course_draft";
const genId = () => `_${Math.random().toString(36).slice(2, 8)}`;
const DND_MODULE = "MODULE";
const DND_LESSON = "LESSON";

// ═══════════════════════════════════════════════════════════════
// Drag Ref Context — avoids cloneElement on Fragments
// ═══════════════════════════════════════════════════════════════

const DragRefContext = React.createContext<any>(null);
function useDragRef() { return React.useContext(DragRefContext); }

// ═══════════════════════════════════════════════════════════════
// Drag & Drop Components
// ═══════════════════════════════════════════════════════════════

function DraggableModule({
  mod, mIdx, children, moveModule,
}: {
  mod: ModuleItem; mIdx: number; children: React.ReactNode;
  moveModule: (from: number, to: number) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag, preview] = useDrag({
    type: DND_MODULE,
    item: () => ({ idx: mIdx, id: mod.id }),
    collect: (m) => ({ isDragging: m.isDragging() }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: DND_MODULE,
    hover(item: { idx: number; id: string }) {
      if (item.idx === mIdx) return;
      moveModule(item.idx, mIdx);
      item.idx = mIdx;
    },
    collect: (m) => ({ isOver: m.isOver() }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`border rounded-xl overflow-hidden transition-all ${
        isDragging ? "opacity-40 border-[#990803]" : isOver ? "border-[#c8a84e] bg-[#c8a84e]/5" : "border-border bg-secondary/20"
      }`}
    >
      <DragRefContext.Provider value={drag}>
        {children}
      </DragRefContext.Provider>
    </div>
  );
}

function DraggableLesson({
  lesson, lIdx, moduleId, children, moveLesson,
}: {
  lesson: LessonItem; lIdx: number; moduleId: string; children: React.ReactNode;
  moveLesson: (moduleId: string, from: number, to: number) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag, preview] = useDrag({
    type: DND_LESSON,
    item: () => ({ lIdx, moduleId, id: lesson.id }),
    collect: (m) => ({ isDragging: m.isDragging() }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: DND_LESSON,
    hover(item: { lIdx: number; moduleId: string; id: string }) {
      if (item.moduleId !== moduleId || item.lIdx === lIdx) return;
      moveLesson(moduleId, item.lIdx, lIdx);
      item.lIdx = lIdx;
    },
    collect: (m) => ({ isOver: m.isOver() }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
        isDragging ? "opacity-40 border-[#990803] bg-[#990803]/5" : isOver ? "border-[#c8a84e]/50 bg-[#c8a84e]/5" : "bg-card border-border/50"
      }`}
    >
      <DragRefContext.Provider value={drag}>
        {children}
      </DragRefContext.Provider>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ContentBank Picker
// ═══════════════════════════════════════════════════════════════

function ContentBankPicker({
  onSelect, onClose, lessonType,
}: {
  onSelect: (item: ContentItem) => void;
  onClose: () => void;
  lessonType: string;
}) {
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState(lessonType === "assignment" ? "all" : lessonType);

  const published = INITIAL_CONTENT.filter(c => c.status === "published");
  const filtered = published.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q));
    const matchType = typeFilter === "all" || c.type === typeFilter;
    return matchSearch && matchType;
  });

  const typeGroups = [
    { id: "all", label: "Tất cả", count: published.length },
    ...Object.entries(TYPE_CONFIG).map(([id, cfg]) => ({
      id, label: cfg.label, count: published.filter(c => c.type === id).length,
    })).filter(g => g.count > 0),
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-gradient-to-r from-[#c8a84e]/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c8a84e]/10 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-[#c8a84e]" />
            </div>
            <div>
              <h4 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>Gắn nội dung từ ContentBank</h4>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{published.length} nội dung khả dụng</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Search + Type filter */}
        <div className="px-5 py-3 border-b border-border space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm nội dung theo tên, tags..."
              className="w-full pl-9 pr-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#c8a84e]/20 focus:border-[#c8a84e] focus:outline-none"
              style={{ fontSize: "12px" }}
              autoFocus
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {typeGroups.map(g => (
              <button
                key={g.id}
                onClick={() => setTypeFilter(g.id)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  typeFilter === g.id ? "bg-[#c8a84e]/15 text-[#c8a84e]" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                {g.label} ({g.count})
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="mt-2 text-muted-foreground" style={{ fontSize: "13px" }}>Không tìm thấy nội dung phù hợp</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filtered.map(item => {
                const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.document;
                const Icon = cfg.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-[#c8a84e]/40 hover:bg-[#c8a84e]/5 transition-all cursor-pointer text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg }}>
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate group-hover:text-[#c8a84e]" style={{ fontSize: "12px", fontWeight: 500 }}>
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{cfg.label}</span>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{item.size}</span>
                        {item.duration && (
                          <>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{item.duration}</span>
                          </>
                        )}
                        <span className="text-muted-foreground/40">•</span>
                        <span className="text-muted-foreground flex items-center gap-0.5" style={{ fontSize: "10px" }}>
                          <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" /> {item.rating}
                        </span>
                      </div>
                    </div>
                    <div className="text-muted-foreground" style={{ fontSize: "10px" }}>{item.author}</div>
                    <Plus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Auto-save indicator
// ═══════════════════════════════════════════════════════════════

function AutoSaveIndicator({ lastSaved, isSaving }: { lastSaved: string | null; isSaving: boolean }) {
  if (isSaving) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "10px" }}>
        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" /> Đang lưu...
      </span>
    );
  }
  if (lastSaved) {
    return (
      <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "10px" }}>
        <span className="w-2 h-2 rounded-full bg-green-400" /> Đã lưu {lastSaved}
      </span>
    );
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export function CourseFormModal({ open, onClose, onSubmit, editCourse }: CourseFormModalProps) {
  const { user } = useAuth();
  const isEdit = !!editCourse;

  // ── Step ──
  const [step, setStep] = React.useState(1);

  // ── Step 1 ──
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [thumbnail, setThumbnail] = React.useState("");
  const [showThumbPicker, setShowThumbPicker] = React.useState(false);
  const [customThumbUrl, setCustomThumbUrl] = React.useState("");
  const [objectives, setObjectives] = React.useState<string[]>([""]);

  // ── Step 2 ──
  const [category, setCategory] = React.useState("");
  const [subsidiary, setSubsidiary] = React.useState("");
  const [level, setLevel] = React.useState<Course["level"]>("Cơ bản");
  const [targetDepts, setTargetDepts] = React.useState<string[]>([]);
  const [prerequisites, setPrerequisites] = React.useState("");
  const [instructorName, setInstructorName] = React.useState("");
  const [coInstructors, setCoInstructors] = React.useState("");

  // ── Step 3 ──
  const [duration, setDuration] = React.useState("");
  const [trainingFormat, setTrainingFormat] = React.useState("online");
  const [modules, setModules] = React.useState<ModuleItem[]>([
    { id: genId(), title: "Module 1: Giới thiệu", expanded: true, lessons: [{ id: genId(), title: "Bài 1: Tổng quan khóa học", type: "video", duration: "15 phút", linkedContent: null }] },
  ]);
  const [contentPickerFor, setContentPickerFor] = React.useState<{ moduleId: string; lessonId: string; lessonType: string } | null>(null);

  // ── Step 4 ──
  const [status, setStatus] = React.useState<Course["status"]>("draft");
  const [mandatory, setMandatory] = React.useState(false);
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [passingScore, setPassingScore] = React.useState(70);
  const [hasCertificate, setHasCertificate] = React.useState(true);
  const [maxStudents, setMaxStudents] = React.useState(0);
  const [autoNotify, setAutoNotify] = React.useState(true);
  const [allowOffline, setAllowOffline] = React.useState(false);
  const [requireApproval, setRequireApproval] = React.useState(false);

  // ── Auto-save ──
  const [lastSaved, setLastSaved] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasDraft, setHasDraft] = React.useState(false);

  // ── Validation ──
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  // ── Dept search ──
  const [deptSearch, setDeptSearch] = React.useState("");

  // ── Check for existing draft on mount ──
  React.useEffect(() => {
    if (open && !editCourse) {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) setHasDraft(true);
      } catch { /* ignore */ }
    }
  }, [open, editCourse]);

  // ── Auto-save with debounce ──
  const autoSaveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (!open || isEdit) return;
    // Only auto-save if user has typed something
    if (!title.trim() && !description.trim()) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      setIsSaving(true);
      const draft: DraftState = {
        step, title, description, thumbnail, objectives,
        category, subsidiary, level, targetDepts, prerequisites, instructorName, coInstructors,
        duration, trainingFormat, modules, status, mandatory, tags,
        startDate, endDate, passingScore, hasCertificate, maxStudents, autoNotify, allowOffline, requireApproval,
        savedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        const timeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        setLastSaved(timeStr);
      } catch { /* quota exceeded */ }
      setTimeout(() => setIsSaving(false), 300);
    }, 2000);

    return () => { if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current); };
  }, [
    open, isEdit, step, title, description, thumbnail, objectives,
    category, subsidiary, level, targetDepts, prerequisites, instructorName, coInstructors,
    duration, trainingFormat, modules, status, mandatory, tags,
    startDate, endDate, passingScore, hasCertificate, maxStudents, autoNotify, allowOffline, requireApproval,
  ]);

  // ── Populate form (edit mode) ──
  React.useEffect(() => {
    if (open && editCourse) {
      setTitle(editCourse.title);
      setDescription(editCourse.description);
      setThumbnail(editCourse.thumbnail);
      setCategory(editCourse.category);
      setSubsidiary(editCourse.subsidiary);
      setLevel(editCourse.level);
      setDuration(editCourse.duration);
      setStatus(editCourse.status);
      setMandatory(editCourse.mandatory);
      setTags([...editCourse.tags]);
      setInstructorName(editCourse.instructor);
    } else if (open && !editCourse && !hasDraft) {
      resetAll();
    }
  }, [open, editCourse]);

  if (!open) return null;

  // ── Restore draft ──
  function restoreDraft() {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      const d: DraftState = JSON.parse(saved);
      setStep(d.step || 1);
      setTitle(d.title || "");
      setDescription(d.description || "");
      setThumbnail(d.thumbnail || "");
      setObjectives(d.objectives?.length ? d.objectives : [""]);
      setCategory(d.category || "");
      setSubsidiary(d.subsidiary || "");
      setLevel(d.level || "Cơ bản");
      setTargetDepts(d.targetDepts || []);
      setPrerequisites(d.prerequisites || "");
      setInstructorName(d.instructorName || "");
      setCoInstructors(d.coInstructors || "");
      setDuration(d.duration || "");
      setTrainingFormat(d.trainingFormat || "online");
      setModules(d.modules?.length ? d.modules : [{ id: genId(), title: "Module 1: Giới thiệu", expanded: true, lessons: [{ id: genId(), title: "Bài 1: Tổng quan khóa học", type: "video", duration: "15 phút", linkedContent: null }] }]);
      setStatus(d.status || "draft");
      setMandatory(d.mandatory || false);
      setTags(d.tags || []);
      setStartDate(d.startDate || "");
      setEndDate(d.endDate || "");
      setPassingScore(d.passingScore ?? 70);
      setHasCertificate(d.hasCertificate ?? true);
      setMaxStudents(d.maxStudents ?? 0);
      setAutoNotify(d.autoNotify ?? true);
      setAllowOffline(d.allowOffline ?? false);
      setRequireApproval(d.requireApproval ?? false);
      setHasDraft(false);
      toast.success("Đã khôi phục bản nháp tự động");
    } catch { /* ignore */ }
  }

  function discardDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* */ }
    setHasDraft(false);
    resetAll();
  }

  function resetAll() {
    setStep(1);
    setTitle(""); setDescription(""); setThumbnail(""); setShowThumbPicker(false); setCustomThumbUrl("");
    setObjectives([""]);
    setCategory(""); setSubsidiary(""); setLevel("Cơ bản"); setTargetDepts([]); setPrerequisites(""); setInstructorName(""); setCoInstructors("");
    setDuration(""); setTrainingFormat("online");
    setModules([{ id: genId(), title: "Module 1: Giới thiệu", expanded: true, lessons: [{ id: genId(), title: "Bài 1: Tổng quan khóa học", type: "video", duration: "15 phút", linkedContent: null }] }]);
    setStatus("draft"); setMandatory(false); setTags([]); setTagInput("");
    setStartDate(""); setEndDate(""); setPassingScore(70); setHasCertificate(true);
    setMaxStudents(0); setAutoNotify(true); setAllowOffline(false); setRequireApproval(false);
    setErrors({}); setLastSaved(null); setContentPickerFor(null); setDeptSearch("");
  }

  function handleClose() {
    resetAll();
    setHasDraft(false);
    onClose();
  }

  // ── Validation ──
  function validate(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!title.trim()) e.title = "Vui lòng nhập tên khóa học";
      else if (title.trim().length < 5) e.title = "Tên khóa học tối thiểu 5 ký tự";
      if (!description.trim()) e.description = "Vui lòng nhập mô tả";
      else if (description.trim().length < 20) e.description = "Mô tả tối thiểu 20 ký tự";
    }
    if (s === 2) {
      if (!category) e.category = "Vui lòng chọn danh mục";
      if (!subsidiary) e.subsidiary = "Vui lòng chọn công ty áp dụng";
    }
    if (s === 3) {
      if (!duration.trim()) e.duration = "Vui lòng nhập thời lượng";
      if (totalLessonsCount < 1) e.lessons = "Cần ít nhất 1 bài học trong curriculum";
      // Check empty lesson titles
      const emptyLesson = modules.some(m => m.lessons.some(l => !l.title.trim()));
      if (emptyLesson) e.lessonTitle = "Tất cả bài học cần có tiêu đề";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() { if (validate(step)) setStep(Math.min(step + 1, 5)); }
  function goBack() { setErrors({}); setStep(Math.max(step - 1, 1)); }

  const totalLessonsCount = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const linkedContentCount = modules.reduce((sum, m) => sum + m.lessons.filter(l => l.linkedContent).length, 0);

  // ── Submit ──
  function handleSubmit() {
    const thumb = thumbnail || courseImages[Math.floor(Math.random() * courseImages.length)];
    const instrName = instructorName.trim() || (user?.role === "instructor" ? "Phạm Anh Tuấn" : (editCourse?.instructor || "Admin Hệ thống"));

    const course: Course = {
      id: editCourse?.id || `C${String(Date.now()).slice(-6)}`,
      title: title.trim(),
      description: description.trim(),
      thumbnail: thumb,
      category,
      subsidiary,
      instructor: instrName,
      duration: duration.trim(),
      totalLessons: totalLessonsCount || 1,
      enrolledCount: editCourse?.enrolledCount ?? 0,
      completionRate: editCourse?.completionRate ?? 0,
      rating: editCourse?.rating ?? 0,
      level,
      status,
      mandatory,
      createdAt: editCourse?.createdAt || new Date().toISOString().split("T")[0],
      tags,
    };

    onSubmit(course);
    // Clear draft
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* */ }
    handleClose();
  }

  // ── Module/Lesson helpers ──
  function addModule() {
    const idx = modules.length + 1;
    setModules(prev => [...prev, { id: genId(), title: `Module ${idx}: Chủ đề mới`, expanded: true, lessons: [] }]);
  }

  function removeModule(mId: string) {
    if (modules.length <= 1) return;
    setModules(prev => prev.filter(m => m.id !== mId));
  }

  function updateModuleTitle(mId: string, t: string) {
    setModules(prev => prev.map(m => m.id === mId ? { ...m, title: t } : m));
  }

  function toggleModuleExpand(mId: string) {
    setModules(prev => prev.map(m => m.id === mId ? { ...m, expanded: !m.expanded } : m));
  }

  function addLesson(mId: string) {
    setModules(prev => prev.map(m => {
      if (m.id !== mId) return m;
      const idx = m.lessons.length + 1;
      return { ...m, lessons: [...m.lessons, { id: genId(), title: `Bài ${idx}: Nội dung mới`, type: "video", duration: "15 phút", linkedContent: null }] };
    }));
  }

  function removeLesson(mId: string, lId: string) {
    setModules(prev => prev.map(m => m.id === mId ? { ...m, lessons: m.lessons.filter(l => l.id !== lId) } : m));
  }

  function updateLesson(mId: string, lId: string, field: keyof LessonItem, val: any) {
    setModules(prev => prev.map(m =>
      m.id === mId
        ? { ...m, lessons: m.lessons.map(l => l.id === lId ? { ...l, [field]: val } : l) }
        : m
    ));
  }

  // ── DnD: Move Module ──
  function moveModule(fromIdx: number, toIdx: number) {
    setModules(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }

  // ── DnD: Move Lesson within module ──
  function moveLesson(moduleId: string, fromIdx: number, toIdx: number) {
    setModules(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      const lessons = [...m.lessons];
      const [moved] = lessons.splice(fromIdx, 1);
      lessons.splice(toIdx, 0, moved);
      return { ...m, lessons };
    }));
  }

  // ── Move Module up/down buttons (accessibility) ──
  function moveModuleDir(mIdx: number, dir: -1 | 1) {
    const toIdx = mIdx + dir;
    if (toIdx < 0 || toIdx >= modules.length) return;
    moveModule(mIdx, toIdx);
  }

  // ── Link content from ContentBank ──
  function handleContentSelect(item: ContentItem) {
    if (!contentPickerFor) return;
    const linked: LinkedContent = {
      id: item.id,
      title: item.title,
      type: item.type,
      size: item.size,
      author: item.author,
    };
    updateLesson(contentPickerFor.moduleId, contentPickerFor.lessonId, "linkedContent", linked);
    setContentPickerFor(null);
    toast.success(`Đã gắn "${item.title}"`);
  }

  function unlinkContent(mId: string, lId: string) {
    updateLesson(mId, lId, "linkedContent", null);
  }

  // ── Tag helpers ──
  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) { setTags(prev => [...prev, t]); setTagInput(""); }
  }
  function removeTag(tag: string) { setTags(prev => prev.filter(t => t !== tag)); }

  // ── Objectives ──
  function updateObjective(idx: number, val: string) { setObjectives(prev => prev.map((o, i) => i === idx ? val : o)); }
  function addObjective() { if (objectives.length < 8) setObjectives(prev => [...prev, ""]); }
  function removeObjective(idx: number) { if (objectives.length <= 1) return; setObjectives(prev => prev.filter((_, i) => i !== idx)); }

  // ── Dept toggle ──
  function toggleDept(d: string) { setTargetDepts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]); }

  // ── Input class ──
  const inputCls = (field: string) =>
    `w-full px-3 py-2.5 bg-input-background rounded-lg border ${errors[field] ? "border-red-400 ring-2 ring-red-100" : "border-border"} focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803] focus:outline-none transition-colors`;

  const progressPct = (step / 5) * 100;

  const filteredDepts = deptSearch.trim()
    ? DEPARTMENTS.filter(d => d.toLowerCase().includes(deptSearch.toLowerCase()))
    : DEPARTMENTS;

  // ═══ RENDER ═══
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

        <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
          {/* ═══ Draft recovery banner ═══ */}
          {hasDraft && !isEdit && (
            <div className="px-6 py-3 bg-[#c8a84e]/10 border-b border-[#c8a84e]/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#c8a84e]" />
                <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>
                  Bạn có bản nháp chưa hoàn thành. Khôi phục?
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={discardDraft}
                  className="px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  style={{ fontSize: "11px" }}
                >
                  Bỏ qua
                </button>
                <button
                  onClick={restoreDraft}
                  className="px-3 py-1.5 bg-[#c8a84e] text-white rounded-lg hover:bg-[#c8a84e]/90 transition-colors cursor-pointer"
                  style={{ fontSize: "11px", fontWeight: 500 }}
                >
                  Khôi phục bản nháp
                </button>
              </div>
            </div>
          )}

          {/* ═══ Header ═══ */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-[#990803]/5 to-transparent shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#990803]/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#990803]" />
              </div>
              <div>
                <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: "16px", fontWeight: 600 }}>
                  {isEdit ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
                </h3>
                <div className="flex items-center gap-3 mt-0.5">
                  <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
                    Bước {step}/5 — {STEP_LABELS[step - 1].label}
                  </p>
                  {!isEdit && <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />}
                </div>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* ═══ Step indicator ═══ */}
          <div className="px-6 py-3 border-b border-border bg-secondary/20 shrink-0">
            <div className="flex items-center justify-between gap-1">
              {STEP_LABELS.map((s, i) => {
                const done = step > s.num;
                const active = step === s.num;
                return (
                  <React.Fragment key={s.num}>
                    {i > 0 && <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${done ? "bg-[#990803]" : "bg-border"}`} />}
                    <button
                      onClick={() => { if (done) { setErrors({}); setStep(s.num); } }}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all shrink-0 ${
                        active ? "bg-[#990803]/10 text-[#990803]" : done ? "text-[#990803] cursor-pointer hover:bg-[#990803]/5" : "text-muted-foreground"
                      }`}
                      style={{ fontSize: "11px", fontWeight: active ? 600 : 500 }}
                      disabled={!done && !active}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        done ? "bg-[#990803] text-white" : active ? "bg-[#990803]/20 text-[#990803]" : "bg-border text-muted-foreground"
                      }`} style={{ fontSize: "10px", fontWeight: 600 }}>
                        {done ? <Check className="w-3 h-3" /> : s.num}
                      </div>
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* ═══ Progress bar ═══ */}
          <div className="h-1 bg-secondary shrink-0">
            <div className="h-full bg-gradient-to-r from-[#990803] to-[#c8a84e] transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
          </div>

          {/* ═══ Body ═══ */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ scrollbarWidth: "none" }}>

            {/* ─── STEP 1 ─── */}
            {step === 1 && (
              <>
                {/* Thumbnail */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Ảnh bìa khóa học
                  </label>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-40 h-24 rounded-lg border-2 border-dashed border-border overflow-hidden shrink-0 bg-secondary/50 flex items-center justify-center cursor-pointer hover:border-[#990803]/40 transition-colors"
                      onClick={() => setShowThumbPicker(!showThumbPicker)}
                    >
                      {thumbnail ? (
                        <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-2">
                          <Image className="w-6 h-6 text-muted-foreground mx-auto" />
                          <p className="text-muted-foreground mt-1" style={{ fontSize: "10px" }}>Chọn ảnh bìa</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <button type="button" onClick={() => setShowThumbPicker(!showThumbPicker)}
                        className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                        style={{ fontSize: "12px" }}>
                        <Image className="w-3.5 h-3.5" />{showThumbPicker ? "Ẩn thư viện" : "Chọn từ thư viện"}
                      </button>
                      {thumbnail && (
                        <button type="button" onClick={() => setThumbnail("")}
                          className="flex items-center gap-1 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          style={{ fontSize: "11px" }}>
                          <X className="w-3 h-3" /> Xóa ảnh
                        </button>
                      )}
                    </div>
                  </div>
                  {showThumbPicker && (
                    <div className="mt-3 p-3 bg-secondary/30 rounded-xl border border-border space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        {courseImages.map((img, i) => (
                          <button key={i} type="button"
                            onClick={() => { setThumbnail(img); setShowThumbPicker(false); }}
                            className={`relative rounded-lg overflow-hidden h-16 border-2 transition-all cursor-pointer ${
                              thumbnail === img ? "border-[#990803] ring-2 ring-[#990803]/20" : "border-transparent hover:border-[#c8a84e]/50"
                            }`}>
                            <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                            {thumbnail === img && (
                              <div className="absolute inset-0 bg-[#990803]/30 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1.5" style={{ fontSize: "11px", fontWeight: 500 }}>
                          Hoặc nhập URL ảnh tùy chỉnh:
                        </p>
                        <div className="flex gap-2">
                          <input type="url" value={customThumbUrl} onChange={e => setCustomThumbUrl(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (customThumbUrl.trim()) { setThumbnail(customThumbUrl.trim()); setCustomThumbUrl(""); setShowThumbPicker(false); } } }}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-3 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803] focus:outline-none"
                            style={{ fontSize: "12px" }} />
                          <button type="button" onClick={() => { if (customThumbUrl.trim()) { setThumbnail(customThumbUrl.trim()); setCustomThumbUrl(""); setShowThumbPicker(false); } }}
                            className="px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                            <Upload className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Tên khóa học <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={title}
                    onChange={e => { setTitle(e.target.value); if (errors.title) setErrors(prev => { const n = { ...prev }; delete n.title; return n; }); }}
                    placeholder="VD: Kỹ năng Lãnh đạo cho Quản lý Cấp trung"
                    className={inputCls("title")} style={{ fontSize: "13px" }} maxLength={120} />
                  <div className="flex justify-between mt-1">
                    {errors.title ? <p className="text-red-500" style={{ fontSize: "12px" }}>{errors.title}</p> : <span />}
                    <span className={`${title.length > 100 ? "text-yellow-500" : "text-muted-foreground"}`} style={{ fontSize: "11px" }}>{title.length}/120</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Mô tả khóa học <span className="text-red-500">*</span>
                  </label>
                  <textarea value={description}
                    onChange={e => { setDescription(e.target.value); if (errors.description) setErrors(prev => { const n = { ...prev }; delete n.description; return n; }); }}
                    placeholder="Mô tả chi tiết nội dung, mục tiêu, đối tượng và lợi ích của khóa học..."
                    rows={4} className={inputCls("description")} style={{ fontSize: "13px", resize: "vertical" }} maxLength={1000} />
                  <div className="flex justify-between mt-1">
                    {errors.description ? <p className="text-red-500" style={{ fontSize: "12px" }}>{errors.description}</p> : <span />}
                    <span className={`${description.length > 900 ? "text-yellow-500" : "text-muted-foreground"}`} style={{ fontSize: "11px" }}>{description.length}/1000</span>
                  </div>
                </div>

                {/* Objectives */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Mục tiêu học tập <span className="text-muted-foreground" style={{ fontWeight: 400 }}>(tùy chọn)</span>
                  </label>
                  <div className="space-y-2">
                    {objectives.map((obj, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#990803]/10 flex items-center justify-center shrink-0">
                          <span className="text-[#990803]" style={{ fontSize: "10px", fontWeight: 600 }}>{idx + 1}</span>
                        </div>
                        <input type="text" value={obj} onChange={e => updateObjective(idx, e.target.value)}
                          placeholder={`Mục tiêu ${idx + 1}: VD: Hiểu và áp dụng được...`}
                          className="flex-1 px-3 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803] focus:outline-none"
                          style={{ fontSize: "12px" }} />
                        {objectives.length > 1 && (
                          <button type="button" onClick={() => removeObjective(idx)} className="p-1.5 text-muted-foreground hover:text-red-500 cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {objectives.length < 8 && (
                      <button type="button" onClick={addObjective}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[#990803] hover:bg-[#990803]/5 rounded-lg transition-colors cursor-pointer"
                        style={{ fontSize: "12px" }}>
                        <Plus className="w-3.5 h-3.5" /> Thêm mục tiêu ({objectives.length}/8)
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ─── STEP 2 ─── */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                      Danh mục đào tạo <span className="text-red-500">*</span>
                    </label>
                    <select value={category}
                      onChange={e => { setCategory(e.target.value); if (errors.category) setErrors(prev => { const n = { ...prev }; delete n.category; return n; }); }}
                      className={inputCls("category")} style={{ fontSize: "13px" }}>
                      <option value="">— Chọn danh mục —</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="text-red-500 mt-1" style={{ fontSize: "12px" }}>{errors.category}</p>}
                  </div>
                  <div>
                    <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                      Công ty áp dụng <span className="text-red-500">*</span>
                    </label>
                    <select value={subsidiary}
                      onChange={e => { setSubsidiary(e.target.value); if (errors.subsidiary) setErrors(prev => { const n = { ...prev }; delete n.subsidiary; return n; }); }}
                      className={inputCls("subsidiary")} style={{ fontSize: "13px" }}>
                      <option value="">— Chọn công ty —</option>
                      {SUBSIDIARIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.subsidiary && <p className="text-red-500 mt-1" style={{ fontSize: "12px" }}>{errors.subsidiary}</p>}
                  </div>
                </div>

                {/* Level */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Cấp độ khóa học</label>
                  <div className="grid grid-cols-3 gap-2">
                    {LEVELS.map(l => (
                      <button key={l} type="button" onClick={() => setLevel(l)}
                        className={`py-2.5 rounded-lg border transition-all cursor-pointer ${
                          level === l ? "bg-[#990803]/10 border-[#990803]/30 text-[#990803]" : "bg-input-background border-border text-muted-foreground hover:border-[#990803]/30"
                        }`} style={{ fontSize: "13px", fontWeight: 500 }}>
                        {l === "Cơ bản" ? "🟢" : l === "Trung cấp" ? "🟡" : "🔴"} {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instructor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                      <UserCheck className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Giảng viên chính
                    </label>
                    <input type="text" value={instructorName} onChange={e => setInstructorName(e.target.value)}
                      placeholder="VD: TS. Nguyễn Văn A" className={inputCls("instructor")} style={{ fontSize: "13px" }} />
                  </div>
                  <div>
                    <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                      <Users className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Giảng viên phụ / Trợ giảng
                    </label>
                    <input type="text" value={coInstructors} onChange={e => setCoInstructors(e.target.value)}
                      placeholder="Phân cách bằng dấu phẩy" className={inputCls("coInstructor")} style={{ fontSize: "13px" }} />
                  </div>
                </div>

                {/* Target departments with search */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    <Building2 className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                    Phòng ban mục tiêu
                    <span className="text-muted-foreground ml-1" style={{ fontWeight: 400 }}>(tùy chọn)</span>
                    {targetDepts.length > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-[#990803]/10 text-[#990803] rounded-md" style={{ fontSize: "10px", fontWeight: 600 }}>
                        {targetDepts.length} đã chọn
                      </span>
                    )}
                  </label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input type="text" value={deptSearch} onChange={e => setDeptSearch(e.target.value)}
                      placeholder="Tìm phòng ban..." className="w-full pl-9 pr-4 py-2 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803] focus:outline-none"
                      style={{ fontSize: "12px" }} />
                  </div>
                  <div className="max-h-36 overflow-y-auto rounded-lg border border-border p-2 bg-input-background space-y-0.5">
                    {filteredDepts.map(d => (
                      <label key={d} className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                        targetDepts.includes(d) ? "bg-[#990803]/5" : "hover:bg-secondary"
                      }`}>
                        <input type="checkbox" checked={targetDepts.includes(d)} onChange={() => toggleDept(d)}
                          className="accent-[#990803] w-3.5 h-3.5" />
                        <span style={{ fontSize: "12px" }}>{d}</span>
                      </label>
                    ))}
                    {filteredDepts.length === 0 && (
                      <p className="text-muted-foreground text-center py-2" style={{ fontSize: "12px" }}>Không tìm thấy phòng ban</p>
                    )}
                  </div>
                </div>

                {/* Prerequisites */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    <BookMarked className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                    Điều kiện tiên quyết <span className="text-muted-foreground" style={{ fontWeight: 400 }}>(tùy chọn)</span>
                  </label>
                  <textarea value={prerequisites} onChange={e => setPrerequisites(e.target.value)}
                    placeholder="VD: Hoàn thành khóa 'Nhập môn Quản trị' hoặc có kinh nghiệm quản lý từ 1 năm..."
                    rows={2} className={inputCls("prerequisites")} style={{ fontSize: "13px", resize: "none" }} />
                </div>
              </>
            )}

            {/* ─── STEP 3: Cấu trúc nội dung ─── */}
            {step === 3 && (
              <>
                {/* Training format */}
                <div>
                  <label className="block text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 500 }}>
                    Hình thức đào tạo
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TRAINING_FORMATS.map(f => {
                      const Icon = f.icon;
                      const active = trainingFormat === f.id;
                      return (
                        <button key={f.id} type="button" onClick={() => setTrainingFormat(f.id)}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                            active ? "border-[#990803] bg-[#990803]/5" : "border-border hover:border-[#990803]/30 bg-input-background"
                          }`}>
                          <Icon className="w-5 h-5" style={{ color: active ? "#990803" : f.color }} />
                          <span className={active ? "text-[#990803]" : "text-muted-foreground"} style={{ fontSize: "11px", fontWeight: 500 }}>
                            {f.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration + Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                      <Clock className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Tổng thời lượng <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={duration}
                      onChange={e => { setDuration(e.target.value); if (errors.duration) setErrors(prev => { const n = { ...prev }; delete n.duration; return n; }); }}
                      placeholder="VD: 24 giờ" className={inputCls("duration")} style={{ fontSize: "13px" }} />
                    {errors.duration && <p className="text-red-500 mt-1" style={{ fontSize: "12px" }}>{errors.duration}</p>}
                  </div>
                  <div className="px-4 py-3 bg-secondary/50 rounded-lg border border-border">
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Tổng bài học</p>
                    <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 600 }}>{totalLessonsCount}</p>
                  </div>
                  <div className="px-4 py-3 bg-[#c8a84e]/5 rounded-lg border border-[#c8a84e]/20">
                    <p className="text-muted-foreground flex items-center gap-1" style={{ fontSize: "11px" }}>
                      <Link2 className="w-3 h-3" /> Đã gắn nội dung
                    </p>
                    <p className="text-[#c8a84e]" style={{ fontSize: "20px", fontWeight: 600 }}>
                      {linkedContentCount}<span className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 400 }}>/{totalLessonsCount}</span>
                    </p>
                  </div>
                </div>

                {/* Curriculum builder */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-foreground flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                      <Layers className="w-3.5 h-3.5" /> Cấu trúc chương trình
                      <span className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 400 }}>(kéo thả để sắp xếp)</span>
                    </label>
                    <button type="button" onClick={addModule}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
                      style={{ fontSize: "11px" }}>
                      <Plus className="w-3 h-3" /> Thêm module
                    </button>
                  </div>
                  {(errors.lessons || errors.lessonTitle) && (
                    <p className="text-red-500 mb-2" style={{ fontSize: "12px" }}>{errors.lessons || errors.lessonTitle}</p>
                  )}

                  <div className="space-y-3">
                    {modules.map((mod, mIdx) => (
                      <DraggableModule key={mod.id} mod={mod} mIdx={mIdx} moveModule={moveModule}>
                        {/* Module header */}
                        <ModuleHeader
                          mod={mod}
                          mIdx={mIdx}
                          modulesLen={modules.length}
                          onToggle={() => toggleModuleExpand(mod.id)}
                          onTitleChange={(t) => updateModuleTitle(mod.id, t)}
                          onRemove={() => removeModule(mod.id)}
                          onMoveDir={(dir) => moveModuleDir(mIdx, dir)}
                        />

                        {/* Lessons */}
                        {mod.expanded && (
                          <div className="px-3 py-2 space-y-1.5">
                            {mod.lessons.map((lesson, lIdx) => (
                              <DraggableLesson key={lesson.id} lesson={lesson} lIdx={lIdx} moduleId={mod.id} moveLesson={moveLesson}>
                                <LessonRow
                                  lesson={lesson}
                                  moduleId={mod.id}
                                  onTypeChange={(val) => updateLesson(mod.id, lesson.id, "type", val)}
                                  onTitleChange={(val) => updateLesson(mod.id, lesson.id, "title", val)}
                                  onDurationChange={(val) => updateLesson(mod.id, lesson.id, "duration", val)}
                                  onRemove={() => removeLesson(mod.id, lesson.id)}
                                  onLinkContent={() => setContentPickerFor({ moduleId: mod.id, lessonId: lesson.id, lessonType: lesson.type })}
                                  onUnlinkContent={() => unlinkContent(mod.id, lesson.id)}
                                />
                              </DraggableLesson>
                            ))}
                            <button type="button" onClick={() => addLesson(mod.id)}
                              className="flex items-center gap-1.5 w-full px-3 py-2 text-[#990803] hover:bg-[#990803]/5 rounded-lg transition-colors cursor-pointer border border-dashed border-[#990803]/20"
                              style={{ fontSize: "11px" }}>
                              <Plus className="w-3 h-3" /> Thêm bài học
                            </button>
                          </div>
                        )}
                      </DraggableModule>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ─── STEP 4 ─── */}
            {step === 4 && (
              <>
                {/* Status + Mandatory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Trạng thái xuất bản</label>
                    <div className="flex gap-2">
                      {([["draft", "📝 Bản nháp"], ["active", "🚀 Xuất bản"]] as const).map(([val, label]) => (
                        <button key={val} type="button" onClick={() => setStatus(val)}
                          className={`flex-1 py-2.5 rounded-lg border transition-colors cursor-pointer ${
                            status === val
                              ? val === "active" ? "bg-green-50 border-green-300 text-green-700" : "bg-yellow-50 border-yellow-300 text-yellow-700"
                              : "bg-input-background border-border text-muted-foreground hover:border-[#990803]/30"
                          }`} style={{ fontSize: "13px", fontWeight: 500 }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Loại khóa học</label>
                    <button type="button" onClick={() => setMandatory(!mandatory)}
                      className={`w-full py-2.5 rounded-lg border transition-colors cursor-pointer ${
                        mandatory ? "bg-[#990803]/10 border-[#990803]/30 text-[#990803]" : "bg-input-background border-border text-muted-foreground hover:border-[#990803]/30"
                      }`} style={{ fontSize: "13px", fontWeight: 500 }}>
                      {mandatory ? "⚠️ Bắt buộc (Mandatory)" : "📚 Tự chọn (Elective)"}
                    </button>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    <Calendar className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Lịch khai giảng
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground mb-1" style={{ fontSize: "11px" }}>Ngày bắt đầu</p>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        className={inputCls("startDate")} style={{ fontSize: "13px" }} />
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1" style={{ fontSize: "11px" }}>Ngày kết thúc</p>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        className={inputCls("endDate")} style={{ fontSize: "13px" }} />
                    </div>
                  </div>
                </div>

                {/* Assessment & Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                      <Award className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Điểm đạt (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input type="range" value={passingScore} onChange={e => setPassingScore(Number(e.target.value))}
                        min={0} max={100} step={5} className="flex-1 accent-[#990803]" />
                      <span className={`px-2.5 py-1 rounded-md min-w-[3rem] text-center ${
                        passingScore >= 80 ? "bg-green-50 text-green-700" : passingScore >= 50 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
                      }`} style={{ fontSize: "13px", fontWeight: 600 }}>
                        {passingScore}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                      <Users className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Giới hạn học viên
                    </label>
                    <input type="number" value={maxStudents || ""}
                      onChange={e => setMaxStudents(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0 = Không giới hạn" className={inputCls("maxStudents")} style={{ fontSize: "13px" }} min={0} />
                  </div>
                </div>

                {/* Toggle switches */}
                <div className="space-y-2">
                  <label className="block text-foreground mb-1" style={{ fontSize: "13px", fontWeight: 500 }}>Tùy chọn bổ sung</label>
                  {([
                    { label: "Cấp chứng chỉ khi hoàn thành", icon: Award, value: hasCertificate, setter: setHasCertificate, desc: "Tự động cấp chứng chỉ điện tử khi đạt điểm" },
                    { label: "Thông báo tự động", icon: Bell, value: autoNotify, setter: setAutoNotify, desc: "Gửi thông báo nhắc nhở & cập nhật cho học viên" },
                    { label: "Cho phép học offline", icon: Sparkles, value: allowOffline, setter: setAllowOffline, desc: "Học viên có thể tải nội dung để học ngoại tuyến" },
                    { label: "Yêu cầu phê duyệt đăng ký", icon: UserCheck, value: requireApproval, setter: setRequireApproval, desc: "Quản lý phải duyệt trước khi học viên tham gia" },
                  ] as const).map(item => {
                    const Icon = item.icon;
                    return (
                      <button key={item.label} type="button" onClick={() => item.setter(!item.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                          item.value ? "bg-[#990803]/5 border-[#990803]/20" : "bg-input-background border-border hover:border-[#990803]/20"
                        }`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          item.value ? "bg-[#990803]/10" : "bg-secondary"
                        }`}>
                          <Icon className="w-4 h-4" style={{ color: item.value ? "#990803" : "var(--color-muted-foreground)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={item.value ? "text-foreground" : "text-muted-foreground"} style={{ fontSize: "12px", fontWeight: 500 }}>{item.label}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{item.desc}</p>
                        </div>
                        <div className={`w-9 h-5 rounded-full relative transition-colors shrink-0 ${item.value ? "bg-[#990803]" : "bg-border"}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${item.value ? "left-[1.1rem]" : "left-0.5"}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                    <Tag className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Tags / Từ khóa
                  </label>
                  <div className="flex gap-2">
                    <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      placeholder="Nhập tag rồi Enter..." className="flex-1 px-3 py-2.5 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803] focus:outline-none"
                      style={{ fontSize: "13px" }} />
                    <button type="button" onClick={addTag} className="px-3 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Suggested */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Leadership", "Compliance", "Safety", "Digital", "ESG", "Onboarding", "Finance", "ATLĐ"].filter(st => !tags.includes(st)).slice(0, 5).map(st => (
                      <button key={st} type="button" onClick={() => setTags(prev => [...prev, st])}
                        className="px-2 py-1 bg-secondary/50 text-muted-foreground rounded-md hover:bg-[#c8a84e]/10 hover:text-[#c8a84e] transition-colors cursor-pointer"
                        style={{ fontSize: "10px" }}>
                        + {st}
                      </button>
                    ))}
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#c8a84e]/10 text-[#c8a84e] rounded-lg" style={{ fontSize: "12px", fontWeight: 500 }}>
                          <Tag className="w-3 h-3" />{tag}
                          <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-red-500 cursor-pointer"><X className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ─── STEP 5: Preview ─── */}
            {step === 5 && (
              <>
                {/* Card preview */}
                <div className="bg-secondary/30 rounded-xl border border-border overflow-hidden">
                  <div className="relative h-40">
                    {thumbnail ? (
                      <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#990803]/20 to-[#c8a84e]/20 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-[#990803]/30" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-white ${status === "active" ? "bg-green-500" : "bg-yellow-500"}`}
                        style={{ fontSize: "10px", fontWeight: 600 }}>
                        {status === "active" ? "Xuất bản" : "Bản nháp"}
                      </span>
                      {mandatory && <span className="px-2 py-0.5 rounded-md bg-[#990803] text-white" style={{ fontSize: "10px", fontWeight: 600 }}>Bắt buộc</span>}
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-0.5 rounded-md text-white ${level === "Cơ bản" ? "bg-green-500" : level === "Trung cấp" ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ fontSize: "10px", fontWeight: 600 }}>{level}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>{title || "Chưa có tên"}</h4>
                    <p className="text-muted-foreground mt-1 line-clamp-2" style={{ fontSize: "12px" }}>{description || "Chưa có mô tả"}</p>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {([
                    { icon: Target, label: "Danh mục", value: category || "—", color: "#990803" },
                    { icon: Building2, label: "Công ty", value: subsidiary || "—", color: "#2e86de" },
                    { icon: UserCheck, label: "Giảng viên", value: instructorName || (user?.role === "instructor" ? "Phạm Anh Tuấn" : "Admin"), color: "#27ae60" },
                    { icon: Clock, label: "Thời lượng", value: duration || "—", color: "#e67e22" },
                    { icon: Layers, label: "Cấu trúc", value: `${modules.length} module • ${totalLessonsCount} bài`, color: "#8e44ad" },
                    { icon: Globe, label: "Hình thức", value: TRAINING_FORMATS.find(f => f.id === trainingFormat)?.label || "—", color: "#16a085" },
                  ] as const).map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="bg-card rounded-xl border border-border p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                          <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{item.label}</span>
                        </div>
                        <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{item.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Advanced summary */}
                <div className="bg-secondary/30 rounded-xl border border-border p-4 space-y-3">
                  <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>⚙️ Cài đặt nâng cao</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      ["Điểm đạt", `${passingScore}%`],
                      ["Giới hạn", maxStudents > 0 ? `${maxStudents} học viên` : "Không giới hạn"],
                      ["Chứng chỉ", hasCertificate ? "✅ Có" : "❌ Không"],
                      ["Thông báo", autoNotify ? "✅ Bật" : "❌ Tắt"],
                      ["Học offline", allowOffline ? "✅ Cho phép" : "❌ Không"],
                      ["Phê duyệt", requireApproval ? "✅ Yêu cầu" : "❌ Không"],
                    ] as const).map(([label, val]) => (
                      <div key={label}>
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{label}: </span>
                        <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  {startDate && <p className="text-muted-foreground" style={{ fontSize: "11px" }}>📅 Lịch trình: {startDate}{endDate ? ` → ${endDate}` : ""}</p>}
                  {targetDepts.length > 0 && <p className="text-muted-foreground" style={{ fontSize: "11px" }}>🏢 Phòng ban mục tiêu: {targetDepts.join(", ")}</p>}
                </div>

                {/* Objectives */}
                {objectives.filter(o => o.trim()).length > 0 && (
                  <div className="bg-secondary/30 rounded-xl border border-border p-4">
                    <p className="text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 500 }}>🎯 Mục tiêu học tập</p>
                    <ul className="space-y-1">
                      {objectives.filter(o => o.trim()).map((o, i) => (
                        <li key={i} className="flex items-start gap-2" style={{ fontSize: "12px" }}>
                          <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-foreground">{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Curriculum preview */}
                <div className="bg-secondary/30 rounded-xl border border-border p-4">
                  <p className="text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 500 }}>
                    📚 Nội dung chương trình
                    {linkedContentCount > 0 && (
                      <span className="ml-2 text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 400 }}>
                        ({linkedContentCount} nội dung từ ContentBank)
                      </span>
                    )}
                  </p>
                  <div className="space-y-2">
                    {modules.map(mod => (
                      <div key={mod.id}>
                        <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>
                          {mod.title} <span className="text-muted-foreground" style={{ fontWeight: 400 }}>({mod.lessons.length} bài)</span>
                        </p>
                        <ul className="ml-5 mt-0.5 space-y-0.5">
                          {mod.lessons.map(l => {
                            const lt = LESSON_TYPES.find(t => t.id === l.type);
                            return (
                              <li key={l.id} className="text-muted-foreground flex items-center gap-1.5" style={{ fontSize: "11px" }}>
                                <span>{lt?.emoji || "•"}</span> {l.title}
                                <span className="text-muted-foreground/60">({l.duration})</span>
                                {l.linkedContent && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#c8a84e]/10 text-[#c8a84e] rounded" style={{ fontSize: "9px" }}>
                                    <Link2 className="w-2.5 h-2.5" /> {l.linkedContent.title.slice(0, 25)}...
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-[#c8a84e]/10 text-[#c8a84e] rounded-lg" style={{ fontSize: "11px", fontWeight: 500 }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Confirmation */}
                <div className="flex items-start gap-3 p-3 bg-[#990803]/5 rounded-xl border border-[#990803]/20">
                  <AlertTriangle className="w-5 h-5 text-[#990803] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>
                      {isEdit ? "Xác nhận lưu thay đổi" : "Xác nhận tạo khóa học"}
                    </p>
                    <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
                      {isEdit
                        ? "Các thay đổi sẽ được áp dụng ngay lập tức. Học viên đang theo học sẽ nhận được thông báo cập nhật."
                        : status === "active"
                          ? "Khóa học sẽ được xuất bản và hiển thị cho tất cả học viên trong công ty được chỉ định."
                          : "Khóa học sẽ được lưu ở trạng thái bản nháp. Bạn có thể chỉnh sửa và xuất bản sau."}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ═══ Footer ═══ */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/30 shrink-0">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button type="button" onClick={goBack}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  style={{ fontSize: "13px", fontWeight: 500 }}>
                  <ChevronLeft className="w-4 h-4" /> Quay lại
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Save draft manually */}
              {!isEdit && step < 5 && title.trim() && (
                <button type="button"
                  onClick={() => {
                    const draft: DraftState = {
                      step, title, description, thumbnail, objectives,
                      category, subsidiary, level, targetDepts, prerequisites, instructorName, coInstructors,
                      duration, trainingFormat, modules, status, mandatory, tags,
                      startDate, endDate, passingScore, hasCertificate, maxStudents, autoNotify, allowOffline, requireApproval,
                      savedAt: new Date().toISOString(),
                    };
                    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* */ }
                    const timeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                    setLastSaved(timeStr);
                    toast.success("Đã lưu bản nháp");
                  }}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                  style={{ fontSize: "12px", fontWeight: 500 }}>
                  <Save className="w-3.5 h-3.5" /> Lưu nháp
                </button>
              )}
              <button type="button" onClick={handleClose}
                className="px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                Hủy
              </button>
              {step < 5 ? (
                <button type="button" onClick={goNext}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
                  style={{ fontSize: "13px", fontWeight: 500 }}>
                  Tiếp theo <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" onClick={handleSubmit}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
                  style={{ fontSize: "13px", fontWeight: 500 }}>
                  {isEdit ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isEdit ? "Lưu thay đổi" : status === "draft" ? "Lưu bản nháp" : "Xuất bản khóa học"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ContentBank Picker ═══ */}
      {contentPickerFor && (
        <ContentBankPicker
          lessonType={contentPickerFor.lessonType}
          onSelect={handleContentSelect}
          onClose={() => setContentPickerFor(null)}
        />
      )}
    </DndProvider>
  );
}

// ═══════════════════════════════════════════════════════════════
// Sub-components for Module Header & Lesson Row
// ═══════════════════════════════════════════════════════════════

function ModuleHeader({
  mod, mIdx, modulesLen, onToggle, onTitleChange, onRemove, onMoveDir,
}: {
  mod: ModuleItem; mIdx: number; modulesLen: number;
  onToggle: () => void; onTitleChange: (t: string) => void; onRemove: () => void;
  onMoveDir: (dir: -1 | 1) => void;
}) {
  const dragRef = useDragRef();
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary/50">
      <div ref={dragRef} className="cursor-grab active:cursor-grabbing p-0.5">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <button type="button" onClick={onToggle} className="cursor-pointer">
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${mod.expanded ? "rotate-90" : ""}`} />
      </button>
      <input type="text" value={mod.title} onChange={e => onTitleChange(e.target.value)}
        className="flex-1 bg-transparent border-none focus:outline-none text-foreground min-w-0"
        style={{ fontSize: "13px", fontWeight: 500 }} />
      <span className="text-muted-foreground px-2 py-0.5 bg-card rounded-md shrink-0" style={{ fontSize: "10px" }}>
        {mod.lessons.length} bài
      </span>
      {/* Move up/down for accessibility */}
      <div className="flex gap-0.5 shrink-0">
        <button type="button" onClick={() => onMoveDir(-1)} disabled={mIdx === 0}
          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">
          <ArrowUp className="w-3 h-3" />
        </button>
        <button type="button" onClick={() => onMoveDir(1)} disabled={mIdx === modulesLen - 1}
          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed">
          <ArrowDown className="w-3 h-3" />
        </button>
      </div>
      {modulesLen > 1 && (
        <button type="button" onClick={onRemove} className="p-1 text-muted-foreground hover:text-red-500 cursor-pointer">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function LessonRow({
  lesson, moduleId,
  onTypeChange, onTitleChange, onDurationChange, onRemove, onLinkContent, onUnlinkContent,
}: {
  lesson: LessonItem; moduleId: string;
  onTypeChange: (v: string) => void; onTitleChange: (v: string) => void;
  onDurationChange: (v: string) => void; onRemove: () => void;
  onLinkContent: () => void; onUnlinkContent: () => void;
}) {
  const dragRef = useDragRef();
  const lt = LESSON_TYPES.find(t => t.id === lesson.type);
  const [showTypeMenu, setShowTypeMenu] = React.useState(false);

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      {/* Drag handle */}
      <div ref={dragRef} className="cursor-grab active:cursor-grabbing p-0.5 shrink-0">
        <GripVertical className="w-3 h-3 text-muted-foreground/50" />
      </div>

      {/* Type selector */}
      <div className="relative shrink-0">
        <button type="button" onClick={() => setShowTypeMenu(!showTypeMenu)}
          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors"
          title={lt?.label || "Loại bài học"}>
          <span style={{ fontSize: "14px" }}>{lt?.emoji || "📄"}</span>
        </button>
        {showTypeMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowTypeMenu(false)} />
            <div className="absolute left-0 top-full mt-1 w-44 bg-card rounded-xl border border-border shadow-xl z-20 py-1">
              {LESSON_TYPES.map(t => (
                <button key={t.id} type="button"
                  onClick={() => { onTypeChange(t.id); setShowTypeMenu(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary transition-colors cursor-pointer text-left ${
                    lesson.type === t.id ? "bg-[#990803]/5 text-[#990803]" : ""
                  }`} style={{ fontSize: "12px" }}>
                  <span>{t.emoji}</span> {t.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <input type="text" value={lesson.title} onChange={e => onTitleChange(e.target.value)}
          className="w-full bg-transparent border-none focus:outline-none text-foreground"
          style={{ fontSize: "12px" }} />
        {/* Linked content badge */}
        {lesson.linkedContent && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#c8a84e]/10 text-[#c8a84e] rounded" style={{ fontSize: "9px", fontWeight: 500 }}>
              <Link2 className="w-2.5 h-2.5" />
              {lesson.linkedContent.title.slice(0, 30)}{lesson.linkedContent.title.length > 30 ? "..." : ""}
            </span>
            <button type="button" onClick={onUnlinkContent}
              className="p-0.5 text-muted-foreground hover:text-red-500 cursor-pointer" title="Bỏ liên kết">
              <Unlink className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>

      {/* Duration */}
      <input type="text" value={lesson.duration} onChange={e => onDurationChange(e.target.value)}
        className="w-20 px-2 py-1 bg-secondary rounded-md border-none text-muted-foreground text-center focus:outline-none focus:ring-1 focus:ring-[#990803]/20 shrink-0"
        style={{ fontSize: "11px" }} placeholder="15 phút" />

      {/* Link content button */}
      <button type="button" onClick={onLinkContent}
        className={`p-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
          lesson.linkedContent ? "text-[#c8a84e] hover:bg-[#c8a84e]/10" : "text-muted-foreground hover:text-[#c8a84e] hover:bg-[#c8a84e]/5"
        }`}
        title={lesson.linkedContent ? "Thay đổi nội dung" : "Gắn nội dung từ ContentBank"}>
        <Link2 className="w-3.5 h-3.5" />
      </button>

      {/* Remove */}
      <button type="button" onClick={onRemove} className="p-1 text-muted-foreground hover:text-red-500 cursor-pointer shrink-0">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
