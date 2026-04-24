import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Clock,
  Users,
  BookOpen,
  Plus,
  ChevronDown,
  AlertCircle,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { mockCourses, CATEGORIES, SUBSIDIARIES } from "./mock-data";
import type { Course } from "./mock-data";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { useConfirm } from "./ConfirmDialog";
import { CourseFormModal } from "./CourseFormModal";

export function Courses() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedSubsidiary, setSelectedSubsidiary] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "my">(user?.role === "instructor" ? "my" : "all");
  const [localCourses, setLocalCourses] = useState(mockCourses);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const isAdmin = user?.role === "admin";
  const isInstructor = user?.role === "instructor";
  const isLearner = user?.role === "learner";
  const canManage = isAdmin || isInstructor;

  const myInstructorCourses = isInstructor
    ? localCourses.filter(c => c.instructor.includes("Phạm Anh Tuấn") || c.instructor.includes("Tuấn"))
    : [];

  const myEnrolledIds = ["C003", "C007", "C008"];

  const baseCourses = isInstructor && activeTab === "my"
    ? myInstructorCourses
    : localCourses;

  const filtered = baseCourses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === "all" || c.category === selectedCategory;
    const matchLevel = selectedLevel === "all" || c.level === selectedLevel;
    const matchSub = selectedSubsidiary === "all" || c.subsidiary === selectedSubsidiary;
    return matchSearch && matchCategory && matchLevel && matchSub;
  });

  const pageTitle = isAdmin ? "Quản lý Khóa học" : isInstructor ? "Khóa học" : "Khám phá Khóa học";
  const pageDesc = isAdmin
    ? `${localCourses.length} khóa học đang hoạt động trên toàn tập đoàn`
    : isInstructor
    ? `${myInstructorCourses.length} khóa của bạn • ${localCourses.length} khóa trên hệ thống`
    : `Tìm và đăng ký các khóa học phù hợp với bạn`;

  const openCreate = () => {
    setEditingCourse(null);
    setModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setModalOpen(true);
  };

  const handleDelete = async (course: Course) => {
    const confirmed = await confirm({
      title: "Xóa khóa học",
      message: `Bạn có chắc muốn xóa khóa học "${course.title}"? Hành động này không thể hoàn tác. Tất cả dữ liệu học viên, tiến độ và đánh giá liên quan sẽ bị mất.`,
      confirmLabel: "Xóa khóa học",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (confirmed) {
      setLocalCourses(prev => prev.filter(c => c.id !== course.id));
      toast.success(`Đã xóa khóa học "${course.title}"`);
    }
  };

  const handleFormSubmit = (course: Course) => {
    if (editingCourse) {
      setLocalCourses(prev => prev.map(c => c.id === course.id ? course : c));
      toast.success(`Đã cập nhật khóa học "${course.title}"`);
    } else {
      setLocalCourses(prev => [course, ...prev]);
      toast.success(`Khóa học "${course.title}" đã được tạo thành công!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-foreground">{pageTitle}</h1>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
            {pageDesc}
          </p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors shrink-0 cursor-pointer" style={{ fontSize: "14px" }}>
            <Plus className="w-4 h-4" />
            Tạo khóa học mới
          </button>
        )}
        {isLearner && (
          <Link to="/my-learning" className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors shrink-0" style={{ fontSize: "14px" }}>
            <BookOpen className="w-4 h-4" />
            Khóa đang học ({myEnrolledIds.length})
          </Link>
        )}
      </div>

      {/* Tabs for Instructor */}
      {isInstructor && (
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          <button
            className={`flex-1 py-2 rounded-md transition-colors cursor-pointer ${activeTab === "my" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            style={{ fontSize: "13px", fontWeight: 500 }}
            onClick={() => setActiveTab("my")}
          >
            Khóa học của tôi ({myInstructorCourses.length})
          </button>
          <button
            className={`flex-1 py-2 rounded-md transition-colors cursor-pointer ${activeTab === "all" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            style={{ fontSize: "13px", fontWeight: 500 }}
            onClick={() => setActiveTab("all")}
          >
            Tất cả khóa học
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học, giảng viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              style={{ fontSize: "13px" }}
            />
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
            style={{ fontSize: "13px" }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <button
              className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-card shadow-sm" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-card shadow-sm" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Danh mục</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-input-background rounded-lg border-0"
                style={{ fontSize: "13px" }}
              >
                <option value="all">Tất cả danh mục</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Cấp độ</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 bg-input-background rounded-lg border-0"
                style={{ fontSize: "13px" }}
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="Cơ bản">Cơ bản</option>
                <option value="Trung cấp">Trung cấp</option>
                <option value="Nâng cao">Nâng cao</option>
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Công ty</label>
              <select
                value={selectedSubsidiary}
                onChange={(e) => setSelectedSubsidiary(e.target.value)}
                className="w-full px-3 py-2 bg-input-background rounded-lg border-0"
                style={{ fontSize: "13px" }}
              >
                <option value="all">Toàn tập đoàn</option>
                {SUBSIDIARIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="mt-3" style={{ fontSize: "15px", fontWeight: 500 }}>Không tìm thấy khóa học</p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} canManage={canManage} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((course) => (
            <CourseListItem key={course.id} course={course} canManage={canManage} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <CourseFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingCourse(null); }}
        onSubmit={handleFormSubmit}
        editCourse={editingCourse}
      />
    </div>
  );
}

// ─── Dropdown Menu ───
function ActionMenu({ course, onEdit, onDelete }: { course: Course; onEdit: (c: Course) => void; onDelete: (c: Course) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors cursor-pointer"
      >
        <MoreVertical className="w-4 h-4 text-white" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-card rounded-xl border border-border shadow-xl z-20 py-1 overflow-hidden">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); onEdit(course); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-secondary transition-colors text-left cursor-pointer"
            style={{ fontSize: "13px" }}
          >
            <Pencil className="w-3.5 h-3.5 text-[#c8a84e]" />
            <span>Chỉnh sửa</span>
          </button>
          <div className="border-t border-border my-0.5" />
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); onDelete(course); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-red-50 transition-colors text-left cursor-pointer text-red-600"
            style={{ fontSize: "13px" }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa khóa học</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Grid Card ───
function CourseCard({ course, canManage, onEdit, onDelete }: { course: Course; canManage: boolean; onEdit: (c: Course) => void; onDelete: (c: Course) => void }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group"
    >
      <div className="relative">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span
            className={`px-2 py-0.5 rounded text-white ${
              course.level === "Nâng cao" ? "bg-red-500" :
              course.level === "Trung cấp" ? "bg-yellow-500" : "bg-green-500"
            }`}
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            {course.level}
          </span>
          {course.mandatory && (
            <span className="px-2 py-0.5 rounded bg-[#990803] text-white" style={{ fontSize: "11px", fontWeight: 500 }}>
              Bắt buộc
            </span>
          )}
        </div>
        {/* Action menu for admin/instructor */}
        {canManage && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <ActionMenu course={course} onEdit={onEdit} onDelete={onDelete} />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 500 }}>{course.category}</p>
        <h4 className="mt-1 text-foreground line-clamp-2 group-hover:text-[#990803]" style={{ fontSize: "14px" }}>
          {course.title}
        </h4>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>{course.instructor}</p>
        <div className="flex items-center gap-1 mt-2">
          <Star className="w-3.5 h-3.5 text-[#c8a84e] fill-[#c8a84e]" />
          <span style={{ fontSize: "12px", fontWeight: 500 }}>{course.rating}</span>
          <span className="text-muted-foreground" style={{ fontSize: "12px" }}>({course.enrolledCount})</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "12px" }}>
            <Clock className="w-3.5 h-3.5" /> {course.duration}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "12px" }}>
            <BookOpen className="w-3.5 h-3.5" /> {course.totalLessons} bài
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── List Item ───
function CourseListItem({ course, canManage, onEdit, onDelete }: { course: Course; canManage: boolean; onEdit: (c: Course) => void; onDelete: (c: Course) => void }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all flex gap-4 group">
      <Link to={`/courses/${course.id}`} className="flex gap-4 flex-1 min-w-0">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-24 h-24 rounded-lg object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 500 }}>{course.category}</span>
            {course.mandatory && (
              <span className="px-1.5 py-0.5 bg-red-50 text-red-500 rounded" style={{ fontSize: "10px", fontWeight: 500 }}>Bắt buộc</span>
            )}
          </div>
          <h4 className="mt-1 text-foreground group-hover:text-[#990803] truncate">{course.title}</h4>
          <p className="text-muted-foreground mt-0.5" style={{ fontSize: "13px" }}>{course.instructor} • {course.subsidiary}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-[#c8a84e] fill-[#c8a84e]" />
              <span style={{ fontSize: "12px", fontWeight: 500 }}>{course.rating}</span>
            </div>
            <span className="text-muted-foreground" style={{ fontSize: "12px" }}><Clock className="w-3 h-3 inline mr-1" />{course.duration}</span>
            <span className="text-muted-foreground" style={{ fontSize: "12px" }}><Users className="w-3 h-3 inline mr-1" />{course.enrolledCount}</span>
            <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{course.completionRate}% hoàn thành</span>
          </div>
        </div>
      </Link>
      <div className="shrink-0 flex flex-col items-end justify-between">
        <span
          className={`px-2.5 py-1 rounded-lg ${
            course.level === "Nâng cao" ? "bg-red-50 text-red-500" :
            course.level === "Trung cấp" ? "bg-yellow-50 text-yellow-600" : "bg-green-50 text-green-600"
          }`}
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          {course.level}
        </span>
        {canManage && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(course); }}
              className="p-1.5 rounded-lg hover:bg-[#c8a84e]/10 transition-colors cursor-pointer"
              title="Chỉnh sửa"
            >
              <Pencil className="w-3.5 h-3.5 text-[#c8a84e]" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(course); }}
              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              title="Xóa"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}