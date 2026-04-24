import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  PlayCircle,
  FileText,
  CheckCircle2,
  Lock,
  Download,
  Share2,
  MessageCircle,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { mockCourses } from "./mock-data";
import type { Course } from "./mock-data";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { useConfirm } from "./ConfirmDialog";
import { CourseFormModal } from "./CourseFormModal";
import { copyToClipboard } from "../utils/clipboard";

const mockModules = [
  { id: 1, title: "Giới thiệu tổng quan", duration: "45 phút", type: "video", completed: true, locked: false },
  { id: 2, title: "Khung năng lực lãnh đạo", duration: "60 phút", type: "video", completed: true, locked: false },
  { id: 3, title: "Ra quyết định chiến lược", duration: "90 phút", type: "video", completed: true, locked: false },
  { id: 4, title: "Bài tập tình huống #1", duration: "30 phút", type: "quiz", completed: false, locked: false },
  { id: 5, title: "Giao tiếp lãnh đạo", duration: "75 phút", type: "video", completed: false, locked: false },
  { id: 6, title: "Quản lý hiệu suất đội nhóm", duration: "80 phút", type: "video", completed: false, locked: true },
  { id: 7, title: "Tài liệu tham khảo", duration: "—", type: "document", completed: false, locked: true },
  { id: 8, title: "Kiểm tra cuối khóa", duration: "60 phút", type: "quiz", completed: false, locked: true },
];

const mockReviews = [
  { id: 1, user: "Trần Thị Hương", role: "Trưởng phòng Nhân sự", rating: 5, date: "15/01/2026", comment: "Khóa học rất hữu ích cho công việc quản lý. Giảng viên trình bày rõ ràng, có nhiều case study thực tế từ các doanh nghiệp Việt Nam.", likes: 12 },
  { id: 2, user: "Lê Hoàng Nam", role: "Chuyên viên Tài chính", rating: 4, date: "10/01/2026", comment: "Nội dung tốt, bài tập thực hành giúp áp dụng ngay vào công việc. Mong có thêm phần về quản lý tài chính dự án.", likes: 8 },
  { id: 3, user: "Đỗ Minh Châu", role: "Giám đốc CNTT", rating: 5, date: "05/01/2026", comment: "Xuất sắc! Đặc biệt phần Ra quyết định chiến lược rất hay. Đã áp dụng ngay cho team IT.", likes: 15 },
];

export function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const baseCourse = mockCourses.find((c) => c.id === id) || mockCourses[0];
  const [course, setCourse] = useState<Course>(baseCourse);
  const completedModules = mockModules.filter((m) => m.completed).length;
  const progress = Math.round((completedModules / mockModules.length) * 100);
  const [activeTab, setActiveTab] = useState<"content" | "reviews" | "students">("content");
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(true);
  const [likedReviews, setLikedReviews] = useState<Set<number>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);

  // Related courses (same category, different id)
  const relatedCourses = mockCourses.filter((c) => c.id !== course.id).slice(0, 3);

  const isAdmin = user?.role === "admin";
  const isInstructor = user?.role === "instructor";
  const canManage = isAdmin || isInstructor;

  // Mock student list for instructor/admin
  const mockStudents = [
    { name: "Nguyễn Thị Hà", progress: 85, lastActive: "Hôm nay", score: 88 },
    { name: "Trần Văn Đức", progress: 72, lastActive: "Hôm qua", score: 75 },
    { name: "Lê Minh Anh", progress: 60, lastActive: "3 ngày trước", score: 68 },
    { name: "Phạm Thùy Linh", progress: 45, lastActive: "1 tuần trước", score: null },
    { name: "Hoàng Đức Thịnh", progress: 92, lastActive: "Hôm nay", score: 95 },
  ];

  const handleShare = () => {
    const url = window.location.href;
    copyToClipboard(url).then((ok) => {
      if (ok) toast.success("Đã sao chép link khóa học vào clipboard!");
      else toast.info(`Link khóa học: ${url}`);
    });
  };

  const handleDownload = () => {
    toast.success("Đang chuẩn bị tải tài liệu khóa học...");
  };

  const toggleLikeReview = (reviewId: number) => {
    setLikedReviews(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) next.delete(reviewId); else next.add(reviewId);
      return next;
    });
  };

  const handleEnroll = () => {
    setIsEnrolled(true);
    toast.success("Đã đăng ký khóa học thành công!");
  };

  const handleEditSubmit = (updated: Course) => {
    setCourse(updated);
    toast.success(`Đã cập nhật khóa học "${updated.title}"`);
  };

  const handleDeleteCourse = async () => {
    const confirmed = await confirm({
      title: "Xóa khóa học",
      message: `Bạn có chắc muốn xóa khóa học "${course.title}"? Hành động này không thể hoàn tác. Tất cả dữ liệu học viên, tiến độ và đánh giá liên quan sẽ bị mất.`,
      confirmLabel: "Xóa khóa học",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (confirmed) {
      toast.success(`Đã xóa khóa học "${course.title}"`);
      navigate("/courses");
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link to="/courses" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors" style={{ fontSize: "13px" }}>
          <ArrowLeft className="w-4 h-4" /> Khóa học
        </Link>
        <span className="text-muted-foreground/40" style={{ fontSize: "13px" }}>/</span>
        <span className="text-foreground truncate" style={{ fontSize: "13px" }}>{course.title}</span>
      </div>

      {/* Hero Section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="relative h-48 sm:h-64">
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#990803]/90 via-[#990803]/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[#c8a84e] text-[#990803] rounded" style={{ fontSize: "11px", fontWeight: 600 }}>
                {course.category}
              </span>
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
                <span className="px-2 py-0.5 rounded bg-red-500/80 text-white" style={{ fontSize: "11px", fontWeight: 500 }}>
                  Bắt buộc
                </span>
              )}
            </div>
            <h1 className="text-white" style={{ fontSize: "24px" }}>{course.title}</h1>
            <p className="text-white/70 mt-1" style={{ fontSize: "14px" }}>Giảng viên: {course.instructor} • {course.subsidiary}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-foreground mb-3">Mô tả khóa học</h3>
            <p className="text-muted-foreground" style={{ fontSize: "14px", lineHeight: 1.7 }}>
              {course.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {course.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 bg-secondary rounded-lg text-muted-foreground" style={{ fontSize: "12px" }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md transition-colors ${
                activeTab === "content" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontSize: "13px", fontWeight: 500 }}
              onClick={() => setActiveTab("content")}
            >
              <BookOpen className="w-4 h-4" /> Nội dung ({mockModules.length})
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md transition-colors ${
                activeTab === "reviews" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontSize: "13px", fontWeight: 500 }}
              onClick={() => setActiveTab("reviews")}
            >
              <MessageCircle className="w-4 h-4" /> Đánh giá ({mockReviews.length})
            </button>
            {(isAdmin || isInstructor) && (
              <button
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md transition-colors ${
                  activeTab === "students" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontSize: "13px", fontWeight: 500 }}
                onClick={() => setActiveTab("students")}
              >
                <Users className="w-4 h-4" /> Học viên ({mockStudents.length})
              </button>
            )}
          </div>

          {activeTab === "content" ? (
            /* Modules */
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-foreground">Nội dung khóa học</h3>
                <span className="text-muted-foreground" style={{ fontSize: "13px" }}>
                  {completedModules}/{mockModules.length} bài học
                </span>
              </div>
              <div className="space-y-2">
                {mockModules.map((module, idx) => (
                  <div key={module.id}>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        module.completed ? "border-green-200 bg-green-50/50" :
                        module.locked ? "border-border bg-secondary/30 opacity-60" : "border-border hover:bg-secondary/50 cursor-pointer"
                      }`}
                      onClick={() => !module.locked && setExpandedModule(expandedModule === module.id ? null : module.id)}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: module.completed ? "#27ae6020" : module.locked ? "#e8ebf2" : "#99080310",
                        }}
                      >
                        {module.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : module.locked ? (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <span style={{ fontSize: "12px", fontWeight: 600 }} className="text-[#990803]">{idx + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={module.completed ? "text-green-700" : module.locked ? "text-muted-foreground" : "text-foreground"}
                          style={{ fontSize: "14px", fontWeight: 500 }}
                        >
                          {module.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{module.duration}</span>
                          <span className={`px-1.5 py-0 rounded text-muted-foreground ${module.type === "quiz" ? "bg-yellow-50" : module.type === "document" ? "bg-blue-50" : "bg-secondary"}`} style={{ fontSize: "10px" }}>
                            {module.type === "video" ? "Video" : module.type === "quiz" ? "Kiểm tra" : "Tài liệu"}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {module.type === "video" ? (
                          <PlayCircle className="w-5 h-5 text-muted-foreground" />
                        ) : module.type === "quiz" ? (
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <Download className="w-5 h-5 text-muted-foreground" />
                        )}
                        {!module.locked && (
                          expandedModule === module.id ?
                            <ChevronUp className="w-4 h-4 text-muted-foreground" /> :
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    {expandedModule === module.id && !module.locked && (
                      <div className="ml-11 mt-1 p-3 bg-secondary/30 rounded-lg border border-border/50">
                        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
                          {module.type === "video" && `Bài giảng video ${module.duration} về ${module.title.toLowerCase()}. Có thể tua lại và xem nhiều lần.`}
                          {module.type === "quiz" && `Bài kiểm tra gồm 15 câu hỏi trắc nghiệm. Điểm đạt tối thiểu: 70%.`}
                          {module.type === "document" && `Bộ tài liệu tham khảo bổ sung cho khóa học.`}
                        </p>
                        {!module.completed && (
                          <button onClick={() => toast.info(module.type === "video" ? `Đang mở bài giảng: ${module.title}` : module.type === "quiz" ? `Đang mở bài kiểm tra: ${module.title}` : `Đang tải: ${module.title}`)} className="mt-2 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                            {module.type === "video" ? "Xem bài giảng" : module.type === "quiz" ? "Làm bài kiểm tra" : "Tải tài liệu"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "reviews" ? (
            /* Reviews */
            <div className="space-y-4">
              {/* Rating Summary */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-foreground" style={{ fontSize: "48px", fontWeight: 700, lineHeight: 1 }}>{course.rating}</p>
                    <div className="flex items-center gap-0.5 mt-1 justify-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= Math.round(course.rating) ? "text-[#c8a84e] fill-[#c8a84e]" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>{mockReviews.length} đánh giá</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = mockReviews.filter((r) => r.rating === stars).length;
                      const pct = mockReviews.length > 0 ? (count / mockReviews.length) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-muted-foreground w-6 text-right" style={{ fontSize: "12px" }}>{stars}</span>
                          <Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" />
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[#c8a84e]" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-muted-foreground w-8" style={{ fontSize: "12px" }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Review List */}
              {mockReviews.map((review) => (
                <div key={review.id} className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#990803] to-[#b82020] text-white flex items-center justify-center" style={{ fontSize: "13px", fontWeight: 600 }}>
                        {review.user.split(" ").slice(-2).map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: 500 }}>{review.user}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{review.role} • {review.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= review.rating ? "text-[#c8a84e] fill-[#c8a84e]" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-muted-foreground" style={{ fontSize: "14px", lineHeight: 1.6 }}>
                    {review.comment}
                  </p>
                  <div className="mt-3 flex items-center gap-4">
                    <button onClick={() => toggleLikeReview(review.id)} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                      <ThumbsUp className="w-3.5 h-3.5" /> Hữu ích ({likedReviews.has(review.id) ? review.likes + 1 : review.likes})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Students */
            <div className="space-y-4">
              {/* Student List */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-foreground mb-4">Danh sách học viên</h3>
                <div className="space-y-2">
                  {mockStudents.map((student) => (
                    <div key={student.name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#990803] to-[#b82020] text-white flex items-center justify-center" style={{ fontSize: "13px", fontWeight: 600 }}>
                          {student.name.split(" ").slice(-2).map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p style={{ fontSize: "14px", fontWeight: 500 }}>{student.name}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Tiến độ: {student.progress}% • Hoạt động gần đây: {student.lastActive}</p>
                        </div>
                      </div>
                      {student.score !== null && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" />
                          <span style={{ fontSize: "12px", fontWeight: 500 }}>{student.score}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Related Courses */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="text-foreground mb-4">Khóa học Liên quan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedCourses.map((rc) => (
                <Link
                  key={rc.id}
                  to={`/courses/${rc.id}`}
                  className="group rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img src={rc.thumbnail} alt={rc.title} className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="p-3">
                    <p className="text-[#c8a84e]" style={{ fontSize: "10px", fontWeight: 500 }}>{rc.category}</p>
                    <p className="text-foreground mt-0.5 line-clamp-2 group-hover:text-[#990803] transition-colors" style={{ fontSize: "13px", fontWeight: 500 }}>{rc.title}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" />
                      <span style={{ fontSize: "11px", fontWeight: 500 }}>{rc.rating}</span>
                      <span className="text-muted-foreground" style={{ fontSize: "11px" }}>• {rc.duration}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Progress Card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h4 className="text-foreground mb-4">{isEnrolled ? "Tiến độ học tập" : "Đăng ký Khóa học"}</h4>
            {isEnrolled ? (
              <>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e8ebf2" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="50" fill="none" stroke="#990803" strokeWidth="10"
                      strokeDasharray={`${progress * 3.14} ${314 - progress * 3.14}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-foreground" style={{ fontSize: "28px", fontWeight: 700 }}>{progress}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
                    {completedModules} / {mockModules.length} bài học hoàn thành
                  </p>
                </div>
                <Link to={`/courses/${course.id}/learn`} className="w-full mt-4 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors flex items-center justify-center gap-1.5" style={{ fontSize: "14px" }}>
                  <PlayCircle className="w-4 h-4" />
                  Tiếp tục học
                </Link>
              </>
            ) : (
              <>
                <div className="text-center py-4">
                  <BookOpen className="w-10 h-10 text-[#990803]/30 mx-auto mb-2" />
                  <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Bạn chưa đăng ký khóa học này</p>
                </div>
                <button onClick={handleEnroll} className="w-full mt-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer" style={{ fontSize: "14px" }}>
                  <BookOpen className="w-4 h-4" />
                  Đăng ký Khóa học
                </button>
              </>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h4 className="text-foreground">Thông tin khóa học</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: "13px" }}>
                  <Clock className="w-4 h-4" /> Thời lượng
                </span>
                <span style={{ fontSize: "13px", fontWeight: 500 }}>{course.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: "13px" }}>
                  <BookOpen className="w-4 h-4" /> Bài học
                </span>
                <span style={{ fontSize: "13px", fontWeight: 500 }}>{course.totalLessons} bài</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: "13px" }}>
                  <Users className="w-4 h-4" /> Học viên
                </span>
                <span style={{ fontSize: "13px", fontWeight: 500 }}>{course.enrolledCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: "13px" }}>
                  <Star className="w-4 h-4" /> Đánh giá
                </span>
                <span className="flex items-center gap-1" style={{ fontSize: "13px", fontWeight: 500 }}>
                  {course.rating} <Star className="w-3.5 h-3.5 text-[#c8a84e] fill-[#c8a84e]" />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: "13px" }}>
                  <Award className="w-4 h-4" /> Chứng chỉ
                </span>
                <span className="text-green-600" style={{ fontSize: "13px", fontWeight: 500 }}>Có cấp</span>
              </div>
            </div>
          </div>

          {/* Instructor Card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h4 className="text-foreground mb-4">Giảng viên</h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#990803] to-[#b82020] text-white flex items-center justify-center" style={{ fontSize: "14px", fontWeight: 600 }}>
                {course.instructor.split(" ").slice(-2).map((n) => n[0]).join("")}
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 500 }}>{course.instructor}</p>
                <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{course.subsidiary}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center pt-3 border-t border-border">
              <div>
                <p className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>8</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Khóa học</p>
              </div>
              <div>
                <p className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>2,450</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Học viên</p>
              </div>
              <div>
                <p className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>4.8</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Rating</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
              style={{ fontSize: "13px" }}
            >
              <Share2 className="w-4 h-4" /> Chia sẻ
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
              style={{ fontSize: "13px" }}
            >
              <Download className="w-4 h-4" /> Tải tài liệu
            </button>
          </div>

          {/* Admin/Instructor Actions */}
          {canManage && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                style={{ fontSize: "13px" }}
              >
                <Pencil className="w-4 h-4" /> Chỉnh sửa
              </button>
              <button
                onClick={handleDeleteCourse}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                style={{ fontSize: "13px" }}
              >
                <Trash2 className="w-4 h-4" /> Xóa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <CourseFormModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        editCourse={course}
      />
    </div>
  );
}