import { useState } from "react";
import {
  Star, ThumbsUp, ThumbsDown, MessageCircle, Filter, Search,
  ChevronDown, BarChart3, Users, TrendingUp, Award, Flag,
  CheckCircle2, Clock, BookOpen, Send, X, ArrowUpDown, Heart,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { mockCourses } from "./mock-data";

interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userInitials: string;
  userDept: string;
  userSubsidiary: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  createdAt: string;
  helpful: number;
  notHelpful: number;
  instructorReply?: { text: string; date: string };
  verified: boolean;
  tags: string[];
}

const mockReviews: Review[] = [
  {
    id: "RV001", courseId: "C001", userId: "U010", userName: "Hoàng Thị Lan", userInitials: "HL",
    userDept: "Ban Pháp chế & Tuân thủ", userSubsidiary: "Tập đoàn Geleximco",
    rating: 5, title: "Khóa học xuất sắc, rất thực tiễn",
    content: "Nội dung khóa học rất sát với thực tế quản lý tại Geleximco. Các case study được xây dựng từ tình huống thực tế của ABBank và Geleximco Land giúp tôi áp dụng ngay vào công việc.",
    pros: ["Case study thực tế từ Geleximco", "Giảng viên kinh nghiệm sâu", "Tài liệu PDF chi tiết"],
    cons: ["Thời lượng hơi dài cho người bận"],
    createdAt: "08/03/2026", helpful: 24, notHelpful: 1, verified: true,
    tags: ["Thực tiễn", "Case Study"],
    instructorReply: { text: "Cảm ơn bạn Lan! Rất vui khi khóa học hữu ích. Phiên bản 2.0 sẽ có thêm micro-learning modules phù hợp người bận.", date: "09/03/2026" },
  },
  {
    id: "RV002", courseId: "C001", userId: "U015", userName: "Nguyễn Thanh Tùng", userInitials: "NT",
    userDept: "Khối Quản trị Rủi ro", userSubsidiary: "Chứng khoán An Bình (ABS)",
    rating: 4, title: "Tốt nhưng cần thêm bài tập thực hành",
    content: "Phần lý thuyết rất chắc chắn, giảng viên trình bày dễ hiểu. Tuy nhiên, tôi mong muốn có thêm nhiều bài tập tình huống và simulation hơn để rèn luyện kỹ năng ra quyết định.",
    pros: ["Lý thuyết vững chắc", "Video chất lượng cao", "Quiz hữu ích"],
    cons: ["Ít bài tập thực hành", "Thiếu simulation/roleplay"],
    createdAt: "06/03/2026", helpful: 18, notHelpful: 3, verified: true,
    tags: ["Lý thuyết tốt", "Cần thực hành"],
  },
  {
    id: "RV003", courseId: "C001", userId: "U022", userName: "Trần Thị Hương", userInitials: "TH",
    userDept: "Ban Nhân sự Tập đoàn", userSubsidiary: "Tập đoàn Geleximco",
    rating: 5, title: "Đúng những gì quản lý cấp trung cần",
    content: "Là người làm HR, tôi thấy khóa học này address đúng pain point của cán bộ quản lý tại Geleximco. Đặc biệt phần 'Giao tiếp chiến lược' và 'Quản lý hiệu suất đội nhóm' rất thực tế.",
    pros: ["Đúng nhu cầu thực tế", "Phù hợp văn hóa Geleximco", "Module Giao tiếp chiến lược rất hay"],
    cons: [],
    createdAt: "05/03/2026", helpful: 32, notHelpful: 0, verified: true,
    tags: ["Phù hợp", "Giao tiếp"],
  },
  {
    id: "RV004", courseId: "C003", userId: "U031", userName: "Đào Mạnh Kháng", userInitials: "DK",
    userDept: "Khối Ngân hàng Doanh nghiệp", userSubsidiary: "Ngân hàng TMCP An Bình (ABBank)",
    rating: 4, title: "Kiến thức phân tích tài chính chuyên sâu",
    content: "Khóa học giúp tôi hệ thống hóa kiến thức phân tích tài chính. Phần đánh giá dòng tiền FCF và mô hình DCF rất chi tiết và có thể áp dụng trực tiếp vào thẩm định tín dụng tại ABBank.",
    pros: ["Chuyên sâu về DCF/FCF", "Áp dụng được ngay", "Bài tập Excel thực tế"],
    cons: ["Cần kiến thức nền tài chính"],
    createdAt: "04/03/2026", helpful: 15, notHelpful: 2, verified: true,
    tags: ["Chuyên sâu", "Tài chính"],
  },
  {
    id: "RV005", courseId: "C002", userId: "U045", userName: "Lê Văn Hải", userInitials: "LH",
    userDept: "Ban An toàn Mỏ & Lao động", userSubsidiary: "Khoáng sản Geleximco",
    rating: 5, title: "Bắt buộc phải học — rất cần thiết!",
    content: "Khóa An toàn Lao động này không chỉ là requirement mà thực sự giúp tôi nhận ra nhiều rủi ro tiềm ẩn tại công trường. Video mô phỏng tai nạn rất trực quan và gây ấn tượng mạnh.",
    pros: ["Video mô phỏng chân thực", "Kiến thức cập nhật quy chuẩn mới", "Quiz kiểm tra hiểu biết tốt"],
    cons: [],
    createdAt: "03/03/2026", helpful: 41, notHelpful: 0, verified: true,
    tags: ["An toàn", "Bắt buộc", "Trực quan"],
  },
  {
    id: "RV006", courseId: "C003", userId: "U055", userName: "Phạm Quốc Bảo", userInitials: "PB",
    userDept: "Ban Vận hành Nhà máy Điện", userSubsidiary: "Nhiệt điện Thăng Long",
    rating: 3, title: "Nội dung tốt nhưng UX cần cải thiện",
    content: "Kiến thức chuyên môn rất tốt. Tuy nhiên, một số video bị buffer và tài liệu PDF không tải được trên mobile. Mong team IT khắc phục sớm.",
    pros: ["Nội dung chuyên môn tốt", "Giảng viên nhiệt tình"],
    cons: ["Video bị buffer", "PDF không tải trên mobile", "Thiếu subtitle"],
    createdAt: "02/03/2026", helpful: 8, notHelpful: 5, verified: true,
    tags: ["UX cần cải thiện"],
    instructorReply: { text: "Cảm ơn feedback! Team IT đã ghi nhận và đang fix issue buffer video. Phiên bản mobile sẽ được cập nhật trong tuần tới.", date: "03/03/2026" },
  },
];

const ratingDistribution = [
  { stars: 5, count: 156, pct: 52 },
  { stars: 4, count: 89, pct: 30 },
  { stars: 3, count: 35, pct: 12 },
  { stars: 2, count: 12, pct: 4 },
  { stars: 1, count: 6, pct: 2 },
];

const StarRating = ({ rating, size = 14, interactive = false, onRate }: { rating: number; size?: number; interactive?: boolean; onRate?: (r: number) => void }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${interactive ? "cursor-pointer" : ""} transition-colors`}
          style={{ width: size, height: size }}
          fill={(interactive ? hover || rating : rating) >= s ? "#c8a84e" : "transparent"}
          stroke={(interactive ? hover || rating : rating) >= s ? "#c8a84e" : "#d1d5db"}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate?.(s)}
        />
      ))}
    </div>
  );
};

export function CourseReviews() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isInstructor = user?.role === "instructor";

  const [selectedCourse, setSelectedCourse] = useState("all");
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState<"newest" | "helpful" | "highest" | "lowest">("newest");
  const [searchQ, setSearchQ] = useState("");
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newPros, setNewPros] = useState("");
  const [newCons, setNewCons] = useState("");
  const [extraReviews, setExtraReviews] = useState<Review[]>([]);
  const [helpfulVotes, setHelpfulVotes] = useState<Set<string>>(new Set());
  const [notHelpfulVotes, setNotHelpfulVotes] = useState<Set<string>>(new Set());
  const [replyingToReview, setReplyingToReview] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [instructorReplies, setInstructorReplies] = useState<Record<string, { text: string; date: string }>>({});
  const [reportedReviews, setReportedReviews] = useState<Set<string>>(new Set());

  const allReviews = [...mockReviews, ...extraReviews];

  const filtered = allReviews
    .filter((r) => {
      if (selectedCourse !== "all" && r.courseId !== selectedCourse) return false;
      if (filterRating > 0 && r.rating !== filterRating) return false;
      if (searchQ) {
        const q = searchQ.toLowerCase();
        return r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q) || r.userName.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "helpful") return b.helpful - a.helpful;
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return 0; // newest — mock data already ordered
    });

  const avgRating = 4.5;
  const totalReviews = allReviews.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>Đánh giá & Nhận xét Khóa học</h1>
          <p className="text-gray-500 mt-1" style={{ fontSize: "13px" }}>
            {isAdmin ? "Quản lý đánh giá từ học viên toàn Tập đoàn" : isInstructor ? "Xem đánh giá từ học viên về khóa học của bạn" : "Xem và viết đánh giá khóa học"}
          </p>
        </div>
        {!isAdmin && !isInstructor && (
          <button onClick={() => setShowWriteReview(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer shadow-sm" style={{ fontSize: "13px", fontWeight: 500 }}>
            <MessageCircle className="w-4 h-4" /> Viết đánh giá
          </button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Average Rating Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-[#c8a84e] mb-2" style={{ fontSize: "48px", fontWeight: 700 }}>{avgRating}</div>
          <StarRating rating={avgRating} size={20} />
          <p className="text-gray-500 mt-2" style={{ fontSize: "13px" }}>{totalReviews} đánh giá</p>
          <div className="mt-4 space-y-1.5">
            {ratingDistribution.map((rd) => (
              <div key={rd.stars} className="flex items-center gap-2">
                <span className="text-gray-500 shrink-0" style={{ fontSize: "11px", width: "12px" }}>{rd.stars}</span>
                <Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e] shrink-0" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#c8a84e] rounded-full transition-all" style={{ width: `${rd.pct}%` }} />
                </div>
                <span className="text-gray-400 shrink-0" style={{ fontSize: "10px", width: "28px" }}>{rd.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>Thống kê nhanh</h3>
          {[
            { label: "Tỷ lệ hài lòng (4-5 sao)", value: "82%", icon: ThumbsUp, color: "#27ae60" },
            { label: "Đánh giá mới (tháng này)", value: "+47", icon: TrendingUp, color: "#2e86de" },
            { label: "Khóa học được đánh giá", value: "89/156", icon: BookOpen, color: "#c8a84e" },
            { label: "Trả lời từ giảng viên", value: "76%", icon: MessageCircle, color: "#990803" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + "10" }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="flex-1"><p className="text-gray-500" style={{ fontSize: "11px" }}>{stat.label}</p></div>
              <span className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Top Rated Courses */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h3 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>Khóa học được đánh giá cao</h3>
          {mockCourses.slice(0, 4).map((course, i) => (
            <div key={course.id} className="flex items-center gap-3">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? "bg-[#c8a84e] text-white" : "bg-gray-100 text-gray-500"}`} style={{ fontSize: "10px", fontWeight: 700 }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{course.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <StarRating rating={course.rating} size={10} />
                  <span className="text-gray-400" style={{ fontSize: "10px" }}>({course.enrolledCount})</span>
                </div>
              </div>
              <span className="text-[#c8a84e] shrink-0" style={{ fontSize: "13px", fontWeight: 600 }}>{course.rating}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Tìm kiếm đánh giá..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#990803]/30" style={{ fontSize: "13px" }} />
          </div>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer" style={{ fontSize: "12px" }}>
            <option value="all">Tất cả khóa học</option>
            {mockCourses.slice(0, 6).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <div className="flex items-center gap-1">
            {[0, 5, 4, 3, 2, 1].map((r) => (
              <button key={r} onClick={() => setFilterRating(r)}
                className={`px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${filterRating === r ? "bg-[#c8a84e]/15 text-[#c8a84e]" : "text-gray-500 hover:bg-gray-100"}`}
                style={{ fontSize: "11px", fontWeight: 500 }}>
                {r === 0 ? "Tất cả" : <span className="flex items-center gap-0.5">{r}<Star className="w-3 h-3 fill-current" /></span>}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer" style={{ fontSize: "12px" }}>
            <option value="newest">Mới nhất</option>
            <option value="helpful">Hữu ích nhất</option>
            <option value="highest">Điểm cao nhất</option>
            <option value="lowest">Điểm thấp nhất</option>
          </select>
        </div>
      </div>

      {/* Write Review Modal */}
      {showWriteReview && (
        <div className="bg-white rounded-xl border-2 border-[#990803]/20 p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 600 }}>Viết đánh giá</h3>
            <button onClick={() => setShowWriteReview(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <div>
            <p className="text-gray-600 mb-2" style={{ fontSize: "12px", fontWeight: 500 }}>Đánh giá của bạn</p>
            <StarRating rating={newRating} size={28} interactive onRate={setNewRating} />
          </div>
          <input type="text" placeholder="Tiêu đề đánh giá..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/30" style={{ fontSize: "13px" }} />
          <textarea placeholder="Chia sẻ trải nghiệm của bạn..." value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/30 resize-none" style={{ fontSize: "13px" }} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-green-600 mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>Ưu điểm</p>
              <input type="text" placeholder="VD: Case study thực tế..." value={newPros} onChange={(e) => setNewPros(e.target.value)}
                className="w-full px-3 py-2 border border-green-200 rounded-lg bg-green-50/50 focus:outline-none focus:ring-1 focus:ring-green-300" style={{ fontSize: "12px" }} />
            </div>
            <div>
              <p className="text-red-500 mb-1" style={{ fontSize: "11px", fontWeight: 600 }}>Nhược điểm</p>
              <input type="text" placeholder="VD: Thời lượng hơi dài..." value={newCons} onChange={(e) => setNewCons(e.target.value)}
                className="w-full px-3 py-2 border border-red-200 rounded-lg bg-red-50/50 focus:outline-none focus:ring-1 focus:ring-red-300" style={{ fontSize: "12px" }} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowWriteReview(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
            <button onClick={() => {
              if (!newRating || !newTitle.trim() || !newContent.trim()) {
                import("sonner").then(m => m.toast.error("Vui lòng chọn sao, nhập tiêu đề và nội dung."));
                return;
              }
              const userName = user?.name || "Bạn";
              const newReview: Review = {
                id: `RV_${Date.now()}`,
                courseId: selectedCourse !== "all" ? selectedCourse : "C001",
                userId: user?.id || "U999",
                userName,
                userInitials: userName.split(" ").slice(-2).map(n => n[0]).join(""),
                userDept: user?.department || "Phòng ban",
                userSubsidiary: user?.subsidiary || "Geleximco",
                rating: newRating,
                title: newTitle.trim(),
                content: newContent.trim(),
                pros: newPros ? newPros.split(",").map(s => s.trim()).filter(Boolean) : [],
                cons: newCons ? newCons.split(",").map(s => s.trim()).filter(Boolean) : [],
                createdAt: new Date().toLocaleDateString("vi-VN"),
                helpful: 0,
                notHelpful: 0,
                verified: true,
                tags: [],
              };
              setExtraReviews(prev => [newReview, ...prev]);
              setShowWriteReview(false);
              setNewRating(0);
              setNewTitle("");
              setNewContent("");
              setNewPros("");
              setNewCons("");
              import("sonner").then(m => m.toast.success("Đã gửi đánh giá thành công!"));
            }} className="flex items-center gap-2 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
              <Send className="w-4 h-4" /> Gửi đánh giá
            </button>
          </div>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-4">
        <p className="text-gray-500" style={{ fontSize: "12px", fontWeight: 500 }}>{filtered.length} đánh giá</p>
        {filtered.map((review) => {
          const course = mockCourses.find((c) => c.id === review.courseId);
          return (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#990803] to-[#7a0602] text-white flex items-center justify-center shrink-0" style={{ fontSize: "12px", fontWeight: 700 }}>{review.userInitials}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{review.userName}</span>
                    {review.verified && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 rounded" style={{ fontSize: "9px", fontWeight: 600 }}>
                        <CheckCircle2 className="w-2.5 h-2.5" /> Đã xác nhận
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400" style={{ fontSize: "11px" }}>{review.userDept} — {review.userSubsidiary}</p>
                </div>
                <div className="text-right shrink-0">
                  <StarRating rating={review.rating} size={14} />
                  <p className="text-gray-400 mt-1" style={{ fontSize: "10px" }}>{review.createdAt}</p>
                </div>
              </div>

              {/* Course ref */}
              {course && (
                <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-gray-50 rounded-lg">
                  <BookOpen className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-500 truncate" style={{ fontSize: "11px" }}>{course.title}</span>
                </div>
              )}

              {/* Content */}
              <h4 className="text-gray-800 mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>{review.title}</h4>
              <p className="text-gray-600" style={{ fontSize: "13px", lineHeight: 1.7 }}>{review.content}</p>

              {/* Pros/Cons */}
              {(review.pros.length > 0 || review.cons.length > 0) && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {review.pros.length > 0 && (
                    <div className="space-y-1">
                      {review.pros.map((p, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <ThumbsUp className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-gray-600" style={{ fontSize: "11px" }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {review.cons.length > 0 && (
                    <div className="space-y-1">
                      {review.cons.map((c, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <ThumbsDown className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                          <span className="text-gray-600" style={{ fontSize: "11px" }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tags */}
              {review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {review.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded" style={{ fontSize: "10px", fontWeight: 500 }}>{tag}</span>
                  ))}
                </div>
              )}

              {/* Instructor Reply */}
              {review.instructorReply && (
                <div className="mt-3 ml-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-[#c8a84e] text-white flex items-center justify-center" style={{ fontSize: "8px", fontWeight: 700 }}>GV</div>
                    <span className="text-[#990803]" style={{ fontSize: "11px", fontWeight: 600 }}>Phản hồi giảng viên</span>
                    <span className="text-gray-400" style={{ fontSize: "10px" }}>{review.instructorReply.date}</span>
                  </div>
                  <p className="text-gray-600" style={{ fontSize: "12px", lineHeight: 1.6 }}>{review.instructorReply.text}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => {
                  setHelpfulVotes(prev => {
                    const next = new Set(prev);
                    if (next.has(review.id)) next.delete(review.id); else { next.add(review.id); setNotHelpfulVotes(p => { const n2 = new Set(p); n2.delete(review.id); return n2; }); }
                    return next;
                  });
                }} className={`flex items-center gap-1.5 cursor-pointer ${helpfulVotes.has(review.id) ? "text-green-600" : "text-gray-400 hover:text-green-600"}`} style={{ fontSize: "11px" }}>
                  <ThumbsUp className="w-3.5 h-3.5" /> Hữu ích ({review.helpful + (helpfulVotes.has(review.id) ? 1 : 0)})
                </button>
                <button onClick={() => {
                  setNotHelpfulVotes(prev => {
                    const next = new Set(prev);
                    if (next.has(review.id)) next.delete(review.id); else { next.add(review.id); setHelpfulVotes(p => { const n2 = new Set(p); n2.delete(review.id); return n2; }); }
                    return next;
                  });
                }} className={`flex items-center gap-1.5 cursor-pointer ${notHelpfulVotes.has(review.id) ? "text-red-500" : "text-gray-400 hover:text-red-400"}`} style={{ fontSize: "11px" }}>
                  <ThumbsDown className="w-3.5 h-3.5" /> ({review.notHelpful + (notHelpfulVotes.has(review.id) ? 1 : 0)})
                </button>
                <button onClick={() => {
                  setReportedReviews(prev => {
                    const next = new Set(prev);
                    if (next.has(review.id)) next.delete(review.id); else next.add(review.id);
                    return next;
                  });
                  if (!reportedReviews.has(review.id)) {
                    import("sonner").then(m => m.toast.warning("Đã gửi báo cáo đánh giá vi phạm."));
                  }
                }} className={`flex items-center gap-1.5 cursor-pointer ${reportedReviews.has(review.id) ? "text-red-500" : "text-gray-400 hover:text-gray-600"}`} style={{ fontSize: "11px" }}>
                  <Flag className={`w-3.5 h-3.5 ${reportedReviews.has(review.id) ? "fill-red-500" : ""}`} /> {reportedReviews.has(review.id) ? "Đã báo cáo" : "Báo cáo"}
                </button>
                {(isAdmin || isInstructor) && !review.instructorReply && !instructorReplies[review.id] && (
                  <button onClick={() => { setReplyingToReview(review.id); setReplyText(""); }} className="flex items-center gap-1.5 text-[#990803] hover:text-[#7a0602] cursor-pointer ml-auto" style={{ fontSize: "11px", fontWeight: 500 }}>
                    <MessageCircle className="w-3.5 h-3.5" /> Trả lời
                  </button>
                )}
              </div>

              {/* Instructor reply form */}
              {replyingToReview === review.id && (
                <div className="mt-3 ml-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-[#c8a84e] text-white flex items-center justify-center" style={{ fontSize: "8px", fontWeight: 700 }}>GV</div>
                    <span className="text-[#990803]" style={{ fontSize: "11px", fontWeight: 600 }}>Phản hồi giảng viên</span>
                  </div>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập phản hồi cho đánh giá này..."
                    rows={2}
                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#990803]/20 resize-none bg-white"
                    style={{ fontSize: "12px" }}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => setReplyingToReview(null)} className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg cursor-pointer" style={{ fontSize: "11px" }}>Hủy</button>
                    <button onClick={() => {
                      if (!replyText.trim()) return;
                      setInstructorReplies(prev => ({ ...prev, [review.id]: { text: replyText.trim(), date: "13/03/2026" } }));
                      setReplyingToReview(null);
                      setReplyText("");
                      import("sonner").then(m => m.toast.success("Đã gửi phản hồi!"));
                    }} className="px-3 py-1.5 bg-[#990803] text-white rounded-lg cursor-pointer hover:bg-[#7a0602] disabled:opacity-50" style={{ fontSize: "11px", fontWeight: 600 }} disabled={!replyText.trim()}>
                      Gửi phản hồi
                    </button>
                  </div>
                </div>
              )}

              {/* Show submitted instructor reply */}
              {instructorReplies[review.id] && !review.instructorReply && (
                <div className="mt-3 ml-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-[#c8a84e] text-white flex items-center justify-center" style={{ fontSize: "8px", fontWeight: 700 }}>GV</div>
                    <span className="text-[#990803]" style={{ fontSize: "11px", fontWeight: 600 }}>Phản hồi giảng viên</span>
                    <span className="text-gray-400" style={{ fontSize: "10px" }}>{instructorReplies[review.id].date}</span>
                  </div>
                  <p className="text-gray-600" style={{ fontSize: "12px", lineHeight: 1.6 }}>{instructorReplies[review.id].text}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}