import { useState, useMemo, useRef, useEffect } from "react";
import {
  MessageCircle, Search, Plus, Pin, Eye, Heart,
  MessageSquare, CheckCircle2, HelpCircle, FileText,
  Megaphone, BookOpen, X, Send, Pencil, Trash2,
  MoreVertical, Lock, Flag, Bookmark, Award,
  ArrowLeft, Users,
} from "lucide-react";
import { mockForumPosts } from "./mock-data";
import type { ForumPost } from "./mock-data";
import { useAuth } from "./AuthContext";
import { useConfirm } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { toast } from "sonner";

// ─── Extended Types ───
interface Reply {
  id: string;
  author: string;
  authorRole: string;
  role: "admin" | "instructor" | "learner";
  content: string;
  createdAt: string;
  likes: number;
  isBestAnswer: boolean;
  editedAt?: string;
}

interface ExtendedPost extends ForumPost {
  isLocked: boolean;
  reportCount: number;
  replyList: Reply[];
  editedAt?: string;
}

// ─── Config ───
const categoryConfig: Record<ForumPost["category"], { label: string; icon: typeof HelpCircle; color: string; bg: string }> = {
  question: { label: "Hỏi đáp", icon: HelpCircle, color: "#2e86de", bg: "#2e86de10" },
  discussion: { label: "Thảo luận", icon: MessageCircle, color: "#c8a84e", bg: "#c8a84e15" },
  announcement: { label: "Thông báo", icon: Megaphone, color: "#990803", bg: "#99080310" },
  resource: { label: "Tài liệu", icon: FileText, color: "#27ae60", bg: "#27ae6010" },
};

const roleBadge: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: "Admin", color: "#990803", bg: "#99080310" },
  instructor: { label: "Giảng viên", color: "#c8a84e", bg: "#c8a84e15" },
  learner: { label: "Học viên", color: "#2e86de", bg: "#2e86de10" },
};

function getRole(authorRole: string): "admin" | "instructor" | "learner" {
  if (authorRole.includes("Giám đốc") || authorRole.includes("Quản trị")) return "admin";
  if (authorRole.includes("Giảng viên") || authorRole.includes("KS.") || authorRole.includes("TS.") || authorRole.includes("ThS.") || authorRole.includes("PMP")) return "instructor";
  return "learner";
}

function getInitials(name: string) {
  const parts = name.replace(/^(KS\.|TS\.|ThS\.|PMP\.|LS\.)\s*/, "").split(" ");
  return parts.length >= 2 ? (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date("2026-03-13T10:00:00");
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} ngày trước`;
  return d.toLocaleDateString("vi-VN");
}

// ─── Build initial data ───
function buildInitialPosts(): ExtendedPost[] {
  const REPLIES_MAP: Record<string, Reply[]> = {
    F001: [
      { id: "r1", author: "Đỗ Minh Châu", authorRole: "Giám đốc CNTT", role: "admin", content: "Rất hay! Mình đã áp dụng DISC cho team IT và thấy hiệu quả rõ rệt. Điểm quan trọng là phải hiểu profile từng thành viên trước khi giao việc. Ví dụ người D (Dominance) thích thử thách, giao task khó; người S (Steadiness) cần ổn định, giao task dài hạn.", createdAt: "2026-03-06T09:30:00", likes: 15, isBestAnswer: false },
      { id: "r2", author: "Ngô Thị Mai", authorRole: "Trưởng phòng Kinh doanh", role: "learner", content: "Đồng ý với anh Châu! Bên Kinh doanh mình cũng dùng DISC để phân nhóm sale team, hiệu quả tăng 20% sau 3 tháng. Đặc biệt hữu ích khi ghép cặp mentor-mentee.", createdAt: "2026-03-06T14:15:00", likes: 8, isBestAnswer: false },
      { id: "r3", author: "Nguyễn Văn Minh", authorRole: "Giám đốc Đào tạo", role: "admin", content: "Các anh chị có thể tham khảo thêm tài liệu DISC trong phần Resources của khóa Lãnh đạo. Mình sẽ tổ chức 1 buổi workshop chuyên đề DISC vào tháng 4 cho các quản lý cấp trung. Ai quan tâm đăng ký nhé!", createdAt: "2026-03-07T10:00:00", likes: 22, isBestAnswer: true },
      { id: "r4", author: "Trần Thị Hương", authorRole: "Trưởng phòng Nhân sự", role: "learner", content: "Cảm ơn mọi người! Workshop DISC sẽ rất bổ ích. Mình sẽ đề xuất Ban Nhân sự tổ chức đánh giá DISC cho tất cả quản lý trong Q2/2026.", createdAt: "2026-03-08T08:45:00", likes: 5, isBestAnswer: false },
    ],
    F002: [
      { id: "r5", author: "Phạm Đức Mạnh", authorRole: "Giảng viên ATLĐ", role: "instructor", content: "Cập nhật quan trọng: Nghị định mới yêu cầu tất cả đơn vị phải huấn luyện lại ATLĐ trước 30/06/2026. File template báo cáo mới đính kèm trong bài viết.", createdAt: "2026-03-04T11:00:00", likes: 18, isBestAnswer: false },
      { id: "r6", author: "Vũ Thị Mai", authorRole: "Chuyên viên HR", role: "learner", content: "Đã download tài liệu. Rất cần thiết cho các công trường. Anh Đức có thể share thêm checklist kiểm tra hàng ngày không ạ?", createdAt: "2026-03-05T09:20:00", likes: 6, isBestAnswer: false },
      { id: "r7", author: "KS. Trần Minh Đức", authorRole: "Giảng viên An toàn", role: "instructor", content: "Đã upload checklist kiểm tra ATLĐ hàng ngày (phiên bản 2026) trong phần Tài liệu bổ sung của khóa An toàn Lao động. Các bạn tải về và áp dụng nhé!", createdAt: "2026-03-06T15:30:00", likes: 12, isBestAnswer: true },
    ],
    F003: [
      { id: "r8", author: "ThS. Lê Thị Thu Hà", authorRole: "Giảng viên Tài chính", role: "instructor", content: "FCF = EBIT(1-t) + Depreciation - CapEx - ΔWC. Bước quan trọng nhất là xác định chính xác CapEx maintenance vs growth. Mình sẽ có buổi Q&A riêng vào thứ 6 tuần này.", createdAt: "2026-03-08T10:00:00", likes: 9, isBestAnswer: true },
      { id: "r9", author: "Lê Hoàng Nam", authorRole: "Chuyên viên Tài chính", role: "learner", content: "Cảm ơn cô Hà! Vậy khi phân tích cho ngành BĐS, CapEx có bao gồm chi phí phát triển dự án không ạ?", createdAt: "2026-03-08T14:30:00", likes: 3, isBestAnswer: false },
      { id: "r10", author: "ThS. Lê Thị Thu Hà", authorRole: "Giảng viên Tài chính", role: "instructor", content: "Đúng rồi, với ngành BĐS thì chi phí phát triển dự án thuộc CapEx. Cần phân biệt rõ maintenance CapEx (duy trì) và growth CapEx (phát triển mới). Chi tiết trong slide 45-50 của bài giảng.", createdAt: "2026-03-09T09:00:00", likes: 7, isBestAnswer: false },
    ],
    F004: [
      { id: "r11", author: "Phạm Anh Tuấn", authorRole: "Trưởng nhóm Marketing", role: "learner", content: "Tổng hợp 5 xu hướng chính: (1) AI-generated content, (2) Virtual Property Tours, (3) Hyper-local SEO, (4) Video-first social, (5) Green marketing. Mời mọi người thảo luận thêm!", createdAt: "2026-03-02T10:00:00", likes: 15, isBestAnswer: false },
      { id: "r12", author: "Ngô Thị Mai", authorRole: "Trưởng phòng Kinh doanh", role: "learner", content: "Virtual Tour đang hot! KĐT Lê Trọng Tấn đã triển khai thử và conversion rate tăng 35% so với ảnh tĩnh. Mình recommend các dự án khác cũng nên áp dụng.", createdAt: "2026-03-03T16:45:00", likes: 11, isBestAnswer: false },
    ],
    F005: [
      { id: "r13", author: "Hoàng Đình Nam", authorRole: "Giảng viên QLDA", role: "instructor", content: "Lưu ý: Mock exam sẽ gồm 180 câu, 4 giờ. Format giống y thi thật. Các bạn nên hoàn thành hết bài tập QLDA trước khi thi.", createdAt: "2026-03-07T11:00:00", likes: 8, isBestAnswer: false },
    ],
    F006: [
      { id: "r14", author: "Hoàng Thị Lan", authorRole: "Trưởng Ban Pháp chế", role: "learner", content: "Tips #1: Tập trung vào Luật Doanh nghiệp 2020 và Bộ luật Lao động 2019. 60% câu hỏi nằm trong 2 luật này.", createdAt: "2026-03-01T09:00:00", likes: 14, isBestAnswer: false },
      { id: "r15", author: "LS. Nguyễn Thị Lan", authorRole: "Giảng viên Pháp luật", role: "instructor", content: "Bổ sung: Đề thi năm nay có thêm phần ESG compliance mới. Các bạn xem thêm Chapter 12 trong giáo trình. Mình sẽ upload đề thi mẫu vào LMS tuần sau.", createdAt: "2026-03-02T14:00:00", likes: 10, isBestAnswer: true },
    ],
  };

  return mockForumPosts.map(p => ({
    ...p,
    isLocked: false,
    reportCount: 0,
    replyList: REPLIES_MAP[p.id] || [],
  }));
}

// ─── Main Component ───
export function Forum() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const role = user?.role || "learner";
  const isAdmin = role === "admin";
  const isInstructor = role === "instructor";
  const userName = user?.name || "Bạn";

  // State
  const [posts, setPosts] = useState<ExtendedPost[]>(buildInitialPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());

  // New post form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<ForumPost["category"]>("question");
  const [newTags, setNewTags] = useState("");
  const [newCourseName, setNewCourseName] = useState("");

  // Reply
  const [replyText, setReplyText] = useState("");

  // Edit post
  const [editingPost, setEditingPost] = useState<{ id: string; title: string; content: string; tags: string } | null>(null);

  // Edit reply
  const [editingReply, setEditingReply] = useState<{ postId: string; replyId: string; content: string } | null>(null);

  const selectedPost = selectedPostId ? posts.find(p => p.id === selectedPostId) || null : null;

  // Filtered & sorted
  const filtered = useMemo(() => {
    let result = posts.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.author.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
      const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (sortBy === "popular") return b.views - a.views;
      if (sortBy === "most_replies") return b.replyList.length - a.replyList.length;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [posts, searchQuery, selectedCategory, sortBy]);

  // Stats
  const totalPosts = posts.length;
  const totalReplies = posts.reduce((s, p) => s + p.replyList.length, 0);
  const resolvedCount = posts.filter(p => p.isResolved).length;
  const activeUsers = new Set([...posts.map(p => p.author), ...posts.flatMap(p => p.replyList.map(r => r.author))]).size;

  // ─── Actions ───
  const updatePost = (id: string, changes: Partial<ExtendedPost>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p));
  };

  const toggleLikePost = (postId: string) => {
    setLikedPosts(prev => { const n = new Set(prev); if (n.has(postId)) n.delete(postId); else n.add(postId); return n; });
  };
  const toggleLikeReply = (replyId: string) => {
    setLikedReplies(prev => { const n = new Set(prev); if (n.has(replyId)) n.delete(replyId); else n.add(replyId); return n; });
  };
  const toggleBookmark = (postId: string) => {
    setBookmarkedPosts(prev => {
      const n = new Set(prev);
      if (n.has(postId)) { n.delete(postId); toast("Đã bỏ lưu bài viết"); }
      else { n.add(postId); toast.success("Đã lưu bài viết"); }
      return n;
    });
  };

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newContent.trim()) { toast.error("Vui lòng nhập tiêu đề và nội dung"); return; }
    // Only admin can create announcements
    const finalCategory = newCategory === "announcement" && !isAdmin ? "discussion" : newCategory;
    const newPost: ExtendedPost = {
      id: `FP_${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      author: userName,
      authorRole: isAdmin ? "Quản trị viên" : isInstructor ? "Giảng viên" : "Học viên",
      authorAvatar: "",
      courseId: null,
      courseName: newCourseName || null,
      category: finalCategory,
      createdAt: new Date().toISOString(),
      lastReplyAt: new Date().toISOString(),
      tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
      views: 1, likes: 0, replies: 0,
      isPinned: false, isResolved: false,
      isLocked: false, reportCount: 0,
      replyList: [],
    };
    setPosts(prev => [newPost, ...prev]);
    setShowNewPost(false); setNewTitle(""); setNewContent(""); setNewTags(""); setNewCourseName("");
    toast.success("Đã đăng bài viết thành công!");
  };

  const handleEditPost = () => {
    if (!editingPost || !editingPost.title.trim() || !editingPost.content.trim()) { toast.error("Vui lòng nhập tiêu đề và nội dung"); return; }
    updatePost(editingPost.id, {
      title: editingPost.title,
      content: editingPost.content,
      tags: editingPost.tags.split(",").map(t => t.trim()).filter(Boolean),
      editedAt: new Date().toISOString(),
    });
    setEditingPost(null);
    toast.success("Đã cập nhật bài viết");
  };

  const handleDeletePost = async (post: ExtendedPost) => {
    const confirmed = await confirm({
      title: "Xóa bài viết",
      message: `Bạn có chắc muốn xóa bài viết "${post.title}"? Tất cả ${post.replyList.length} câu trả lời sẽ bị xóa theo.`,
      confirmLabel: "Xóa bài viết",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (confirmed) {
      setPosts(prev => prev.filter(p => p.id !== post.id));
      if (selectedPostId === post.id) setSelectedPostId(null);
      toast.success("Đã xóa bài viết");
    }
  };

  const handleTogglePin = (post: ExtendedPost) => {
    updatePost(post.id, { isPinned: !post.isPinned });
    toast.success(post.isPinned ? "Đã bỏ ghim bài viết" : "Đã ghim bài viết lên đầu");
  };

  const handleToggleLock = async (post: ExtendedPost) => {
    if (!post.isLocked) {
      const confirmed = await confirm({
        title: "Khóa thảo luận",
        message: `Khóa bài viết "${post.title}"? Không ai có thể trả lời thêm.`,
        confirmLabel: "Khóa",
        cancelLabel: "Hủy",
        variant: "warning",
      });
      if (!confirmed) return;
    }
    updatePost(post.id, { isLocked: !post.isLocked });
    toast.success(post.isLocked ? "Đã mở khóa thảo luận" : "Đã khóa thảo luận");
  };

  const handleToggleResolved = (post: ExtendedPost) => {
    updatePost(post.id, { isResolved: !post.isResolved });
    toast.success(post.isResolved ? "Đã bỏ đánh dấu giải quyết" : "Đã đánh dấu đã giải quyết");
  };

  const handleReport = (post: ExtendedPost) => {
    updatePost(post.id, { reportCount: post.reportCount + 1 });
    toast.success("Đã báo cáo bài viết. Admin sẽ xem xét.");
  };

  // Reply actions
  const handleReply = () => {
    if (!replyText.trim() || !selectedPost) return;
    if (selectedPost.isLocked) { toast.error("Bài viết đã bị khóa, không thể trả lời"); return; }
    const newReply: Reply = {
      id: `r_${Date.now()}`,
      author: userName,
      authorRole: isAdmin ? "Quản trị viên" : isInstructor ? "Giảng viên" : "Học viên",
      role: role as "admin" | "instructor" | "learner",
      content: replyText.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isBestAnswer: false,
    };
    updatePost(selectedPost.id, {
      replyList: [...selectedPost.replyList, newReply],
      lastReplyAt: new Date().toISOString(),
      replies: selectedPost.replies + 1,
    });
    setReplyText("");
    toast.success("Đã gửi trả lời!");
  };

  const handleMarkBestAnswer = (postId: string, replyId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    updatePost(postId, {
      replyList: post.replyList.map(r => ({ ...r, isBestAnswer: r.id === replyId ? !r.isBestAnswer : false })),
      isResolved: true,
    });
    toast.success("Đã đánh dấu câu trả lời tốt nhất");
  };

  const handleDeleteReply = async (postId: string, replyId: string) => {
    const confirmed = await confirm({
      title: "Xóa trả lời",
      message: "Bạn có chắc muốn xóa câu trả lời này?",
      confirmLabel: "Xóa",
      cancelLabel: "Hủy",
      variant: "danger",
    });
    if (confirmed) {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      updatePost(postId, {
        replyList: post.replyList.filter(r => r.id !== replyId),
        replies: Math.max(0, post.replies - 1),
      });
      toast.success("Đã xóa trả lời");
    }
  };

  const handleEditReply = () => {
    if (!editingReply || !editingReply.content.trim()) return;
    const post = posts.find(p => p.id === editingReply.postId);
    if (!post) return;
    updatePost(editingReply.postId, {
      replyList: post.replyList.map(r => r.id === editingReply.replyId ? { ...r, content: editingReply.content, editedAt: new Date().toISOString() } : r),
    });
    setEditingReply(null);
    toast.success("Đã cập nhật trả lời");
  };

  const canEditPost = (post: ExtendedPost) => isAdmin || post.author === userName;
  const canDeletePost = (post: ExtendedPost) => isAdmin || post.author === userName;
  const canDeleteReply = (reply: Reply) => isAdmin || reply.author === userName;
  const canEditReply = (reply: Reply) => isAdmin || reply.author === userName;
  const canMarkBest = isAdmin || isInstructor;

  // ─── Post Detail View ───
  if (selectedPost) {
    const cat = categoryConfig[selectedPost.category];
    const CatIcon = cat.icon;
    const postLiked = likedPosts.has(selectedPost.id);
    const postLikeCount = selectedPost.likes + (postLiked ? 1 : 0);
    const postRole = getRole(selectedPost.authorRole);
    const badge = roleBadge[postRole];

    return (
      <div className="space-y-6">
        {/* Back */}
        <button onClick={() => { setSelectedPostId(null); setReplyText(""); }}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          style={{ fontSize: "13px" }}>
          <ArrowLeft className="w-4 h-4" /> Quay lại diễn đàn
        </button>

        {/* Post */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#990803] to-[#7a0602] flex items-center justify-center text-white shrink-0"
              style={{ fontSize: "14px", fontWeight: 700 }}>{getInitials(selectedPost.author)}</div>
            <div className="flex-1 min-w-0">
              {/* Author row */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{selectedPost.author}</span>
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: badge.color, backgroundColor: badge.bg }}>{badge.label}</span>
                <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{selectedPost.authorRole}</span>
                <span className="text-muted-foreground" style={{ fontSize: "11px" }}>• {timeAgo(selectedPost.createdAt)}</span>
                {selectedPost.editedAt && <span className="text-muted-foreground" style={{ fontSize: "10px" }}>(đã sửa)</span>}
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ fontSize: "11px", fontWeight: 500, color: cat.color, backgroundColor: cat.bg }}>
                  <CatIcon className="w-3 h-3" /> {cat.label}
                </span>
                {selectedPost.isPinned && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#c8a84e]/15 text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 500 }}><Pin className="w-3 h-3" /> Ghim</span>
                )}
                {selectedPost.isResolved && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#27ae60]/10 text-[#27ae60]" style={{ fontSize: "11px", fontWeight: 500 }}><CheckCircle2 className="w-3 h-3" /> Đã giải quyết</span>
                )}
                {selectedPost.isLocked && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-500" style={{ fontSize: "11px", fontWeight: 500 }}><Lock className="w-3 h-3" /> Đã khóa</span>
                )}
                {selectedPost.courseName && (
                  <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}><BookOpen className="w-3 h-3" /> {selectedPost.courseName}</span>
                )}
                {isAdmin && selectedPost.reportCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-orange-50 text-orange-500" style={{ fontSize: "11px", fontWeight: 500 }}><Flag className="w-3 h-3" /> {selectedPost.reportCount} báo cáo</span>
                )}
              </div>

              <h2 className="text-foreground mb-3">{selectedPost.title}</h2>
              <p className="text-foreground whitespace-pre-wrap" style={{ fontSize: "14px", lineHeight: "1.8" }}>{selectedPost.content}</p>

              {/* Tags */}
              {selectedPost.tags.length > 0 && (
                <div className="flex items-center gap-1.5 mt-4">
                  {selectedPost.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "11px" }}>#{tag}</span>
                  ))}
                </div>
              )}

              {/* Actions bar */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border flex-wrap">
                <button onClick={() => toggleLikePost(selectedPost.id)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${postLiked ? "text-[#e74c3c]" : "text-muted-foreground hover:text-[#e74c3c]"}`} style={{ fontSize: "13px" }}>
                  <Heart className={`w-4 h-4 ${postLiked ? "fill-[#e74c3c]" : ""}`} /> {postLikeCount}
                </button>
                <span className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "13px" }}><Eye className="w-4 h-4" /> {selectedPost.views}</span>
                <span className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "13px" }}><MessageSquare className="w-4 h-4" /> {selectedPost.replyList.length}</span>
                <button onClick={() => toggleBookmark(selectedPost.id)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${bookmarkedPosts.has(selectedPost.id) ? "text-[#c8a84e]" : "text-muted-foreground hover:text-[#c8a84e]"}`} style={{ fontSize: "13px" }}>
                  <Bookmark className={`w-4 h-4 ${bookmarkedPosts.has(selectedPost.id) ? "fill-[#c8a84e]" : ""}`} /> Lưu
                </button>

                <div className="ml-auto flex items-center gap-1.5">
                  {canEditPost(selectedPost) && (
                    <button onClick={() => setEditingPost({ id: selectedPost.id, title: selectedPost.title, content: selectedPost.content, tags: selectedPost.tags.join(", ") })}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                      <Pencil className="w-3.5 h-3.5" /> Sửa
                    </button>
                  )}
                  {(isAdmin || isInstructor) && (
                    <button onClick={() => handleToggleResolved(selectedPost)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-muted-foreground hover:text-[#27ae60] hover:bg-green-50 rounded-lg transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> {selectedPost.isResolved ? "Bỏ giải quyết" : "Đã giải quyết"}
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button onClick={() => handleTogglePin(selectedPost)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-muted-foreground hover:text-[#c8a84e] hover:bg-[#c8a84e]/10 rounded-lg transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                        <Pin className="w-3.5 h-3.5" /> {selectedPost.isPinned ? "Bỏ ghim" : "Ghim"}
                      </button>
                      <button onClick={() => handleToggleLock(selectedPost)}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-muted-foreground hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                        <Lock className="w-3.5 h-3.5" /> {selectedPost.isLocked ? "Mở khóa" : "Khóa"}
                      </button>
                    </>
                  )}
                  {canDeletePost(selectedPost) && (
                    <button onClick={() => handleDeletePost(selectedPost)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  )}
                  {!isAdmin && !canEditPost(selectedPost) && (
                    <button onClick={() => handleReport(selectedPost)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-muted-foreground hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                      <Flag className="w-3.5 h-3.5" /> Báo cáo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div>
          <h3 className="text-foreground mb-4" style={{ fontSize: "15px", fontWeight: 600 }}>{selectedPost.replyList.length} trả lời</h3>
          {selectedPost.replyList.length === 0 ? (
            <EmptyState variant="empty" title="Chưa có trả lời" message="Hãy là người đầu tiên trả lời bài viết này" compact />
          ) : (
            <div className="space-y-3">
              {/* Best answer first */}
              {[...selectedPost.replyList].sort((a, b) => (b.isBestAnswer ? 1 : 0) - (a.isBestAnswer ? 1 : 0)).map(reply => {
                const rLiked = likedReplies.has(reply.id);
                const rBadge = roleBadge[reply.role] || roleBadge.learner;
                const isEditing = editingReply?.replyId === reply.id;

                return (
                  <div key={reply.id} className={`bg-card rounded-xl border p-5 ${reply.isBestAnswer ? "border-[#27ae60] ring-1 ring-[#27ae60]/20" : "border-border"}`}>
                    {reply.isBestAnswer && (
                      <div className="flex items-center gap-1.5 mb-3 text-[#27ae60]" style={{ fontSize: "11px", fontWeight: 600 }}>
                        <Award className="w-4 h-4" /> Câu trả lời tốt nhất
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 ${reply.role === "admin" ? "bg-[#990803]" : reply.role === "instructor" ? "bg-[#c8a84e]" : "bg-gray-400"}`}
                        style={{ fontSize: "11px", fontWeight: 700 }}>{getInitials(reply.author)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{reply.author}</span>
                          <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: rBadge.color, backgroundColor: rBadge.bg }}>{rBadge.label}</span>
                          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{reply.authorRole}</span>
                          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>• {timeAgo(reply.createdAt)}</span>
                          {reply.editedAt && <span className="text-muted-foreground" style={{ fontSize: "10px" }}>(đã sửa)</span>}
                        </div>

                        {isEditing ? (
                          <div className="mt-2 space-y-2">
                            <textarea value={editingReply.content} onChange={e => setEditingReply(prev => prev ? { ...prev, content: e.target.value } : null)}
                              className="w-full p-3 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" rows={3} style={{ fontSize: "13px", resize: "vertical" }} />
                            <div className="flex gap-2">
                              <button onClick={handleEditReply} className="px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "12px" }}>Lưu</button>
                              <button onClick={() => setEditingReply(null)} className="px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 cursor-pointer" style={{ fontSize: "12px" }}>Hủy</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-foreground mt-1" style={{ fontSize: "14px", lineHeight: "1.7" }}>{reply.content}</p>
                        )}

                        {!isEditing && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <button onClick={() => toggleLikeReply(reply.id)}
                              className={`flex items-center gap-1 transition-colors cursor-pointer ${rLiked ? "text-[#e74c3c]" : "text-muted-foreground hover:text-[#e74c3c]"}`} style={{ fontSize: "12px" }}>
                              <Heart className={`w-3.5 h-3.5 ${rLiked ? "fill-[#e74c3c]" : ""}`} /> {reply.likes + (rLiked ? 1 : 0)}
                            </button>
                            {canMarkBest && selectedPost.category === "question" && (
                              <button onClick={() => handleMarkBestAnswer(selectedPost.id, reply.id)}
                                className={`flex items-center gap-1 transition-colors cursor-pointer ${reply.isBestAnswer ? "text-[#27ae60]" : "text-muted-foreground hover:text-[#27ae60]"}`} style={{ fontSize: "12px" }}>
                                <Award className="w-3.5 h-3.5" /> {reply.isBestAnswer ? "Bỏ chọn" : "Chọn tốt nhất"}
                              </button>
                            )}
                            {canEditReply(reply) && (
                              <button onClick={() => setEditingReply({ postId: selectedPost.id, replyId: reply.id, content: reply.content })}
                                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                                <Pencil className="w-3 h-3" /> Sửa
                              </button>
                            )}
                            {canDeleteReply(reply) && (
                              <button onClick={() => handleDeleteReply(selectedPost.id, reply.id)}
                                className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
                                <Trash2 className="w-3 h-3" /> Xóa
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reply input */}
        {!selectedPost.isLocked ? (
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#990803] flex items-center justify-center text-white shrink-0"
                style={{ fontSize: "11px", fontWeight: 700 }}>{getInitials(userName)}</div>
              <div className="flex-1">
                <textarea placeholder="Viết trả lời..." value={replyText} onChange={e => setReplyText(e.target.value)}
                  className="w-full p-3 bg-input-background rounded-lg border-0 resize-none focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  style={{ fontSize: "14px" }} rows={3} />
                <div className="flex items-center justify-end mt-2">
                  <button disabled={!replyText.trim()} onClick={handleReply}
                    className="flex items-center gap-2 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors disabled:opacity-50 cursor-pointer"
                    style={{ fontSize: "13px" }}>
                    <Send className="w-4 h-4" /> Gửi trả lời
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-secondary/50 rounded-xl border border-border p-4 text-center">
            <Lock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Bài viết đã bị khóa. Không thể trả lời thêm.</p>
          </div>
        )}
      </div>
    );
  }

  // ─── Forum List View ───
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-[#990803]" />
            <h1 className="text-foreground">Diễn đàn Thảo luận</h1>
          </div>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
            Trao đổi, hỏi đáp và chia sẻ kinh nghiệm học tập trong toàn tập đoàn
          </p>
        </div>
        <button onClick={() => setShowNewPost(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors shrink-0 cursor-pointer"
          style={{ fontSize: "14px" }}>
          <Plus className="w-4 h-4" /> Bài viết mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Bài viết", value: totalPosts, icon: MessageCircle, color: "#990803" },
          { label: "Trả lời", value: totalReplies, icon: MessageSquare, color: "#2e86de" },
          { label: "Đã giải quyết", value: resolvedCount, icon: CheckCircle2, color: "#27ae60" },
          { label: "Thành viên", value: activeUsers, icon: Users, color: "#c8a84e" },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + "10" }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{stat.value}</p>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Tìm bài viết, tác giả, tag..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              style={{ fontSize: "13px" }} />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { value: "all", label: "Tất cả" },
              ...Object.entries(categoryConfig).map(([key, val]) => ({ value: key, label: val.label })),
            ].map(cat => (
              <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${selectedCategory === cat.value ? "bg-[#990803] text-white" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                style={{ fontSize: "12px" }}>
                {cat.label}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground shrink-0"
            style={{ fontSize: "13px" }}>
            <option value="latest">Mới nhất</option>
            <option value="popular">Phổ biến nhất</option>
            <option value="most_replies">Nhiều trả lời</option>
          </select>
        </div>
      </div>

      {/* Hot topics */}
      {posts.some(p => p.isPinned) && (
        <div className="bg-gradient-to-r from-[#990803]/5 via-[#c8a84e]/5 to-transparent rounded-xl border border-[#990803]/10 p-4">
          <h3 className="text-foreground mb-2 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Pin className="w-4 h-4 text-[#c8a84e]" /> Bài viết được ghim
          </h3>
          <div className="space-y-2">
            {posts.filter(p => p.isPinned).slice(0, 3).map(post => {
              const cat = categoryConfig[post.category];
              return (
                <div key={post.id} onClick={() => setSelectedPostId(post.id)}
                  className="flex items-center gap-3 p-2.5 bg-card rounded-lg border border-border hover:shadow-sm cursor-pointer transition-all">
                  <cat.icon className="w-4 h-4 shrink-0" style={{ color: cat.color }} />
                  <span className="text-foreground truncate flex-1" style={{ fontSize: "13px", fontWeight: 500 }}>{post.title}</span>
                  <span className="text-muted-foreground shrink-0" style={{ fontSize: "11px" }}>{post.replyList.length} trả lời</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Posts list */}
      {filtered.length === 0 ? (
        <EmptyState variant="search" title="Không tìm thấy bài viết" message="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc" />
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} isAdmin={isAdmin} userName={userName}
              isLiked={likedPosts.has(post.id)}
              isBookmarked={bookmarkedPosts.has(post.id)}
              onView={() => setSelectedPostId(post.id)}
              onLike={() => toggleLikePost(post.id)}
              onBookmark={() => toggleBookmark(post.id)}
              onPin={() => handleTogglePin(post)}
              onLock={() => handleToggleLock(post)}
              onDelete={() => handleDeletePost(post)}
              onReport={() => handleReport(post)}
            />
          ))}
        </div>
      )}

      <div className="text-center text-muted-foreground" style={{ fontSize: "11px" }}>
        {filtered.length} / {totalPosts} bài viết
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowNewPost(false)}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-[#990803]/5 to-transparent rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#990803]" />
                <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>Tạo bài viết mới</h3>
              </div>
              <button onClick={() => setShowNewPost(false)} className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Tiêu đề <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Nhập tiêu đề bài viết..." value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803] focus:outline-none" style={{ fontSize: "13px" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Danh mục</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value as ForumPost["category"])}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }}>
                    <option value="question">Hỏi đáp</option>
                    <option value="discussion">Thảo luận</option>
                    <option value="resource">Tài liệu</option>
                    {isAdmin && <option value="announcement">Thông báo</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Khóa học liên quan</label>
                  <input type="text" placeholder="VD: Kỹ năng Lãnh đạo" value={newCourseName} onChange={e => setNewCourseName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
                </div>
              </div>
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Nội dung <span className="text-red-500">*</span></label>
                <textarea placeholder="Nhập nội dung bài viết..." value={newContent} onChange={e => setNewContent(e.target.value)}
                  className="w-full p-3 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:outline-none"
                  style={{ fontSize: "13px", resize: "vertical" }} rows={5} />
              </div>
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Tags</label>
                <input type="text" placeholder="VD: Leadership, Team, DISC (phân cách bằng dấu phẩy)" value={newTags} onChange={e => setNewTags(e.target.value)}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <button onClick={() => setShowNewPost(false)} className="px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
              <button onClick={handleCreatePost}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer" style={{ fontSize: "13px" }}>
                <Send className="w-4 h-4" /> Đăng bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingPost(null)}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>Chỉnh sửa bài viết</h3>
              <button onClick={() => setEditingPost(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Tiêu đề</label>
                <input type="text" value={editingPost.title} onChange={e => setEditingPost(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px" }} />
              </div>
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Nội dung</label>
                <textarea value={editingPost.content} onChange={e => setEditingPost(prev => prev ? { ...prev, content: e.target.value } : null)}
                  className="w-full p-3 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px", resize: "vertical" }} rows={5} />
              </div>
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Tags</label>
                <input type="text" value={editingPost.tags} onChange={e => setEditingPost(prev => prev ? { ...prev, tags: e.target.value } : null)}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <button onClick={() => setEditingPost(null)} className="px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
              <button onClick={handleEditPost}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer" style={{ fontSize: "13px" }}>
                <Pencil className="w-4 h-4" /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Post Card Component ───
function PostCard({ post, isAdmin, userName, isLiked, isBookmarked, onView, onLike, onBookmark, onPin, onLock, onDelete, onReport }: {
  post: ExtendedPost; isAdmin: boolean; userName: string;
  isLiked: boolean; isBookmarked: boolean;
  onView: () => void; onLike: () => void; onBookmark: () => void;
  onPin: () => void; onLock: () => void; onDelete: () => void; onReport: () => void;
}) {
  const cat = categoryConfig[post.category];
  const CatIcon = cat.icon;
  const postRole = getRole(post.authorRole);
  const badge = roleBadge[postRole];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = post.author === userName;
  const bestAnswer = post.replyList.find(r => r.isBestAnswer);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div className={`bg-card rounded-xl border p-5 hover:shadow-md transition-all group ${post.isLocked ? "opacity-75" : ""} ${post.isPinned ? "border-[#c8a84e]/30 bg-[#c8a84e]/[0.02]" : "border-border"}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 cursor-pointer ${postRole === "admin" ? "bg-[#990803]" : postRole === "instructor" ? "bg-[#c8a84e]" : "bg-gray-400"}`}
          style={{ fontSize: "12px", fontWeight: 700 }} onClick={onView}>{getInitials(post.author)}</div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
          {/* Tags row */}
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 500, color: cat.color, backgroundColor: cat.bg }}>
              <CatIcon className="w-3 h-3" /> {cat.label}
            </span>
            {post.isPinned && <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#c8a84e]/15 text-[#c8a84e]" style={{ fontSize: "10px", fontWeight: 500 }}><Pin className="w-3 h-3" /> Ghim</span>}
            {post.isResolved && <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#27ae60]/10 text-[#27ae60]" style={{ fontSize: "10px", fontWeight: 500 }}><CheckCircle2 className="w-3 h-3" /></span>}
            {post.isLocked && <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-400" style={{ fontSize: "10px" }}><Lock className="w-3 h-3" /></span>}
            {post.courseName && <span className="flex items-center gap-0.5 text-muted-foreground" style={{ fontSize: "10px" }}><BookOpen className="w-3 h-3" /> {post.courseName}</span>}
            {isAdmin && post.reportCount > 0 && <span className="flex items-center gap-0.5 text-orange-500" style={{ fontSize: "10px" }}><Flag className="w-3 h-3" /> {post.reportCount}</span>}
          </div>

          <h4 className="text-foreground group-hover:text-[#990803] transition-colors" style={{ fontSize: "14px", fontWeight: 600 }}>{post.title}</h4>
          <p className="text-muted-foreground mt-0.5 line-clamp-2" style={{ fontSize: "13px", lineHeight: 1.5 }}>{post.content}</p>

          {/* Best answer preview */}
          {bestAnswer && (
            <div className="mt-2 p-2 bg-[#27ae60]/5 rounded-lg border border-[#27ae60]/10 flex items-start gap-2">
              <Award className="w-3.5 h-3.5 text-[#27ae60] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[#27ae60]" style={{ fontSize: "10px", fontWeight: 600 }}>{bestAnswer.author}: </span>
                <span className="text-foreground line-clamp-1" style={{ fontSize: "11px" }}>{bestAnswer.content}</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4 mt-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{post.author}</span>
              <span className="px-1 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: badge.color, backgroundColor: badge.bg }}>{badge.label}</span>
            </div>
            <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{timeAgo(post.createdAt)}</span>
            <div className="flex items-center gap-3 ml-auto">
              <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}>
                <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-[#e74c3c] text-[#e74c3c]" : ""}`} /> {post.likes + (isLiked ? 1 : 0)}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}><Eye className="w-3.5 h-3.5" /> {post.views}</span>
              <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}><MessageSquare className="w-3.5 h-3.5" /> {post.replyList.length}</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {post.tags.slice(0, 4).map(tag => (
                <span key={tag} className="px-1.5 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "10px" }}>#{tag}</span>
              ))}
              {post.tags.length > 4 && <span className="text-muted-foreground" style={{ fontSize: "10px" }}>+{post.tags.length - 4}</span>}
            </div>
          )}
        </div>

        {/* Context menu */}
        <div ref={menuRef} className="relative shrink-0">
          <button onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-card rounded-xl border border-border shadow-xl z-20 py-1 overflow-hidden">
              <button onClick={() => { setMenuOpen(false); onView(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-secondary transition-colors text-left cursor-pointer" style={{ fontSize: "12px" }}>
                <Eye className="w-3.5 h-3.5 text-muted-foreground" /> Xem chi tiết
              </button>
              <button onClick={() => { setMenuOpen(false); onBookmark(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-secondary transition-colors text-left cursor-pointer" style={{ fontSize: "12px" }}>
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "text-[#c8a84e] fill-[#c8a84e]" : "text-muted-foreground"}`} />
                {isBookmarked ? "Bỏ lưu" : "Lưu bài viết"}
              </button>
              {isAdmin && (
                <>
                  <div className="border-t border-border my-0.5" />
                  <button onClick={() => { setMenuOpen(false); onPin(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-secondary transition-colors text-left cursor-pointer" style={{ fontSize: "12px" }}>
                    <Pin className="w-3.5 h-3.5 text-[#c8a84e]" /> {post.isPinned ? "Bỏ ghim" : "Ghim bài viết"}
                  </button>
                  <button onClick={() => { setMenuOpen(false); onLock(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-secondary transition-colors text-left cursor-pointer" style={{ fontSize: "12px" }}>
                    <Lock className="w-3.5 h-3.5 text-orange-500" /> {post.isLocked ? "Mở khóa" : "Khóa thảo luận"}
                  </button>
                </>
              )}
              {(isAdmin || isOwner) && (
                <>
                  <div className="border-t border-border my-0.5" />
                  <button onClick={() => { setMenuOpen(false); onDelete(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-50 transition-colors text-left cursor-pointer text-red-600" style={{ fontSize: "12px" }}>
                    <Trash2 className="w-3.5 h-3.5" /> Xóa bài viết
                  </button>
                </>
              )}
              {!isAdmin && !isOwner && (
                <>
                  <div className="border-t border-border my-0.5" />
                  <button onClick={() => { setMenuOpen(false); onReport(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-orange-50 transition-colors text-left cursor-pointer text-orange-500" style={{ fontSize: "12px" }}>
                    <Flag className="w-3.5 h-3.5" /> Báo cáo
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
