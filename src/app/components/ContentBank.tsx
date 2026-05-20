import { useState, useMemo, useRef, useEffect } from "react";
import {
  FileText, Search, FolderOpen, Image, Video, File,
  Download, Eye, Edit, Copy, Star, Clock, BookOpen,
  Upload, Trash2, MoreVertical, X, Check,
  Grid3X3, List, Link2, Share2,
  Headphones, AlertCircle, CheckCircle2,
  ArrowLeft, Layers, Lock, Unlock, SquareCheck, Square,
  Play, Archive,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { useConfirm } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { FileUploadZone } from "./shared/FileUploadZone";
import { ContentPreview } from "./shared/ContentPreview";
import { toast } from "@/app/lib/toast";

// ─── Types ───
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: "document" | "video" | "quiz" | "slide" | "image" | "template" | "audio" | "scorm";
  category: string;
  courseLinked: string | null;
  author: string;
  authorRole: "admin" | "instructor" | "learner";
  size: string;
  duration?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  downloads: number;
  usedInCourses: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  status: "published" | "draft" | "archived" | "pending";
  isShared: boolean;
  isLocked: boolean;
}

interface ContentFolder {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

// ─── Config ───
export const TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string; bg: string; label: string }> = {
  document: { icon: FileText, color: "#2563eb", bg: "#2563eb10", label: "Tài liệu" },
  video: { icon: Video, color: "#dc2626", bg: "#dc262610", label: "Video" },
  quiz: { icon: BookOpen, color: "#7c3aed", bg: "#7c3aed10", label: "Câu hỏi" },
  slide: { icon: File, color: "#ea580c", bg: "#ea580c10", label: "Slide" },
  image: { icon: Image, color: "#16a34a", bg: "#16a34a10", label: "Hình ảnh" },
  template: { icon: Copy, color: "#0891b2", bg: "#0891b210", label: "Mẫu" },
  audio: { icon: Headphones, color: "#a855f7", bg: "#a855f710", label: "Audio" },
  scorm: { icon: Layers, color: "#c8a84e", bg: "#c8a84e10", label: "SCORM" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: "Đã xuất bản", color: "#16a34a", bg: "#16a34a10" },
  draft: { label: "Bản nháp", color: "#6b7280", bg: "#6b728010" },
  archived: { label: "Lưu trữ", color: "#9ca3af", bg: "#9ca3af10" },
  pending: { label: "Chờ duyệt", color: "#ea580c", bg: "#ea580c10" },
};

const CATEGORIES = [
  "Kỹ năng lãnh đạo", "An toàn lao động", "Tài chính & Kế toán",
  "Marketing & Truyền thông", "Quản lý dự án", "Onboarding",
  "Tuân thủ & Pháp luật", "Kỹ năng mềm", "CNTT & Chuyển đổi số",
  "Bất động sản", "Năng lượng tái tạo", "ESG & Bền vững",
];

const FOLDERS: ContentFolder[] = [
  { id: "all", name: "Tất cả nội dung", icon: "📁", count: 0, color: "#6b7280" },
  { id: "my", name: "Nội dung của tôi", icon: "👤", count: 0, color: "#990803" },
  { id: "shared", name: "Được chia sẻ", icon: "🔗", count: 0, color: "#2563eb" },
  { id: "quiz_bank", name: "Ngân hàng Câu hỏi", icon: "📝", count: 0, color: "#7c3aed" },
  { id: "media", name: "Thư viện Media", icon: "🎬", count: 0, color: "#dc2626" },
  { id: "templates", name: "Mẫu & Templates", icon: "📋", count: 0, color: "#0891b2" },
];

// ─── Mock Data ───
export const INITIAL_CONTENT: ContentItem[] = [
  { id: "CB01", title: "Bộ slide Kỹ năng Lãnh đạo 2026", description: "Bộ slide đào tạo kỹ năng lãnh đạo toàn diện cho cấp quản lý trung gian, bao gồm 120 slide có animation và case study thực tế từ Geleximco.", type: "slide", category: "Kỹ năng lãnh đạo", courseLinked: "Kỹ năng Lãnh đạo", author: "TS. Nguyễn Văn Hùng", authorRole: "instructor", size: "45.2 MB", version: 3, createdAt: "2025-11-15", updatedAt: "2026-03-01", downloads: 342, usedInCourses: 3, rating: 4.9, ratingCount: 67, tags: ["Leadership", "Quản lý", "DISC"], status: "published", isShared: true, isLocked: false },
  { id: "CB02", title: "Video: Tình huống lãnh đạo thực tế", description: "Series 8 video tình huống lãnh đạo thực tế được quay tại các đơn vị Geleximco, có phụ đề tiếng Việt.", type: "video", category: "Kỹ năng lãnh đạo", courseLinked: "Kỹ năng Lãnh đạo", author: "TS. Nguyễn Văn Hùng", authorRole: "instructor", size: "1.8 GB", duration: "3h 20p", version: 2, createdAt: "2025-12-10", updatedAt: "2026-02-15", downloads: 189, usedInCourses: 2, rating: 4.7, ratingCount: 45, tags: ["Video", "Case study", "Tình huống"], status: "published", isShared: true, isLocked: false },
  { id: "CB03", title: "Bộ 200 câu hỏi trắc nghiệm An toàn LĐ", description: "Ngân hàng 200 câu hỏi trắc nghiệm An toàn Lao động phân theo 5 cấp độ, bao gồm hình ảnh minh họa và giải thích đáp án.", type: "quiz", category: "An toàn lao động", courseLinked: "An toàn Lao động", author: "KS. Trần Minh Đức", authorRole: "instructor", size: "12.5 MB", version: 5, createdAt: "2025-09-20", updatedAt: "2026-03-10", downloads: 567, usedInCourses: 4, rating: 4.8, ratingCount: 123, tags: ["Quiz", "ATLĐ", "Trắc nghiệm", "Xây dựng"], status: "published", isShared: true, isLocked: false },
  { id: "CB04", title: "Infographic: Quy trình xử lý sự cố ATLĐ", description: "Bộ 10 infographic mô tả quy trình xử lý sự cố an toàn lao động tại công trường.", type: "image", category: "An toàn lao động", courseLinked: "An toàn Lao động", author: "KS. Trần Minh Đức", authorRole: "instructor", size: "28 MB", version: 2, createdAt: "2026-01-05", updatedAt: "2026-02-20", downloads: 234, usedInCourses: 2, rating: 4.6, ratingCount: 38, tags: ["Infographic", "ATLĐ", "Quy trình"], status: "published", isShared: true, isLocked: false },
  { id: "CB05", title: "Bộ slide Digital Marketing cho BĐS", description: "Slide đào tạo chiến lược digital marketing chuyên sâu cho lĩnh vực bất động sản, cập nhật xu hướng 2026.", type: "slide", category: "Marketing & Truyền thông", courseLinked: "Marketing số", author: "ThS. Phạm Anh Tuấn", authorRole: "instructor", size: "24.5 MB", version: 4, createdAt: "2025-10-15", updatedAt: "2026-03-08", downloads: 278, usedInCourses: 2, rating: 4.8, ratingCount: 56, tags: ["Digital", "Marketing", "BĐS", "SEO"], status: "published", isShared: true, isLocked: false },
  { id: "CB06", title: "Video: Chiến lược Content Marketing", description: "Video hướng dẫn xây dựng chiến lược content marketing từ A-Z cho doanh nghiệp.", type: "video", category: "Marketing & Truyền thông", courseLinked: "Marketing số", author: "ThS. Phạm Anh Tuấn", authorRole: "instructor", size: "450 MB", duration: "1h 45p", version: 1, createdAt: "2026-02-10", updatedAt: "2026-02-10", downloads: 156, usedInCourses: 1, rating: 4.6, ratingCount: 34, tags: ["Content", "Video", "Strategy"], status: "published", isShared: true, isLocked: false },
  { id: "CB07", title: "Bộ 150 câu hỏi Phân tích Tài chính", description: "Ngân hàng câu hỏi phân tích tài chính bao gồm FCF, DCF, ratio analysis với Excel workbook đi kèm.", type: "quiz", category: "Tài chính & Kế toán", courseLinked: "Phân tích Tài chính", author: "ThS. Lê Thị Thu Hà", authorRole: "instructor", size: "8.2 MB", version: 3, createdAt: "2025-11-01", updatedAt: "2026-03-05", downloads: 345, usedInCourses: 2, rating: 4.9, ratingCount: 78, tags: ["Quiz", "Tài chính", "Excel", "FCF"], status: "published", isShared: true, isLocked: false },
  { id: "CB08", title: "Template báo cáo kết quả đào tạo", description: "Bộ template báo cáo kết quả đào tạo chuẩn Geleximco, sử dụng cho tất cả đơn vị thành viên.", type: "template", category: "Quản lý dự án", courseLinked: null, author: "Nguyễn Văn Minh", authorRole: "admin", size: "3.5 MB", version: 2, createdAt: "2025-12-01", updatedAt: "2026-01-15", downloads: 890, usedInCourses: 0, rating: 4.5, ratingCount: 45, tags: ["Template", "Report", "Báo cáo"], status: "published", isShared: true, isLocked: false },
  { id: "CB09", title: "Bộ SCORM: Onboarding Geleximco", description: "Gói SCORM 2004 cho chương trình Onboarding nhân viên mới, tương thích LMS.", type: "scorm", category: "Onboarding", courseLinked: "Onboarding", author: "Đỗ Minh Châu", authorRole: "admin", size: "125 MB", duration: "2h 30p", version: 1, createdAt: "2026-01-20", updatedAt: "2026-01-20", downloads: 456, usedInCourses: 1, rating: 4.4, ratingCount: 29, tags: ["SCORM", "Onboarding", "E-learning"], status: "published", isShared: true, isLocked: false },
  { id: "CB10", title: "Podcast: Trò chuyện cùng CEO Geleximco", description: "Series audio phỏng vấn lãnh đạo cấp cao về chiến lược và tầm nhìn doanh nghiệp.", type: "audio", category: "Kỹ năng lãnh đạo", courseLinked: null, author: "Nguyễn Văn Minh", authorRole: "admin", size: "95 MB", duration: "1h 10p", version: 1, createdAt: "2026-02-28", updatedAt: "2026-02-28", downloads: 123, usedInCourses: 0, rating: 4.7, ratingCount: 19, tags: ["Podcast", "CEO", "Chiến lược"], status: "published", isShared: true, isLocked: false },
  { id: "CB11", title: "Bộ câu hỏi Tuân thủ Pháp luật DN", description: "120 câu hỏi trắc nghiệm về Luật Doanh nghiệp, Luật Lao động, ESG compliance.", type: "quiz", category: "Tuân thủ & Pháp luật", courseLinked: "Tuân thủ Pháp luật", author: "LS. Nguyễn Thị Lan", authorRole: "instructor", size: "5.8 MB", version: 2, createdAt: "2025-12-15", updatedAt: "2026-03-02", downloads: 412, usedInCourses: 2, rating: 4.7, ratingCount: 56, tags: ["Quiz", "Pháp luật", "Compliance"], status: "published", isShared: true, isLocked: false },
  { id: "CB12", title: "Tài liệu hướng dẫn QLDA theo PMI", description: "Tài liệu tham khảo về quản lý dự án theo chuẩn PMI/PMP với case study BĐS.", type: "document", category: "Quản lý dự án", courseLinked: "Quản lý Dự án PMI", author: "PMP. Hoàng Đình Nam", authorRole: "instructor", size: "18 MB", version: 2, createdAt: "2026-01-10", updatedAt: "2026-02-25", downloads: 198, usedInCourses: 1, rating: 4.6, ratingCount: 33, tags: ["QLDA", "PMI", "PMP"], status: "published", isShared: true, isLocked: false },
  // Draft & Pending
  { id: "CB13", title: "[Nháp] Slide Kỹ năng Teamwork Nâng cao", description: "Đang xây dựng bộ slide teamwork nâng cao cho khóa mới Q2/2026.", type: "slide", category: "Kỹ năng mềm", courseLinked: null, author: "ThS. Vũ Minh Châu", authorRole: "instructor", size: "15 MB", version: 1, createdAt: "2026-03-08", updatedAt: "2026-03-12", downloads: 0, usedInCourses: 0, rating: 0, ratingCount: 0, tags: ["Teamwork", "Draft"], status: "draft", isShared: false, isLocked: false },
  { id: "CB14", title: "[Chờ duyệt] Bộ câu hỏi Cybersecurity", description: "50 câu hỏi trắc nghiệm về an ninh mạng cho nhân viên IT.", type: "quiz", category: "CNTT & Chuyển đổi số", courseLinked: null, author: "Dr. Trần Hùng", authorRole: "admin", size: "4.2 MB", version: 1, createdAt: "2026-03-11", updatedAt: "2026-03-11", downloads: 0, usedInCourses: 0, rating: 0, ratingCount: 0, tags: ["Cybersecurity", "IT", "Quiz"], status: "pending", isShared: false, isLocked: false },
  { id: "CB15", title: "[Chờ duyệt] Video: Văn hóa Geleximco", description: "Video giới thiệu văn hóa doanh nghiệp Geleximco cho nhân viên mới.", type: "video", category: "Onboarding", courseLinked: null, author: "Vũ Thị Mai", authorRole: "learner", size: "320 MB", duration: "25p", version: 1, createdAt: "2026-03-12", updatedAt: "2026-03-12", downloads: 0, usedInCourses: 0, rating: 0, ratingCount: 0, tags: ["Văn hóa", "Onboarding"], status: "pending", isShared: false, isLocked: false },
  { id: "CB16", title: "Tài liệu AI trong Quản trị DN", description: "Hướng dẫn ứng dụng AI/ML trong quản trị doanh nghiệp hiện đại.", type: "document", category: "CNTT & Chuyển đổi số", courseLinked: null, author: "Đỗ Minh Châu", authorRole: "admin", size: "22 MB", version: 1, createdAt: "2026-03-05", updatedAt: "2026-03-10", downloads: 67, usedInCourses: 0, rating: 4.5, ratingCount: 12, tags: ["AI", "ML", "Quản trị"], status: "published", isShared: true, isLocked: true },
];

function getInitials(name: string) {
  const clean = name.replace(/^(KS\.|TS\.|ThS\.|PMP\.|LS\.|Dr\.)\s*/, "");
  const parts = clean.split(" ");
  return parts.length >= 2 ? (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
}

// ─── Main Component ───
export function ContentBank() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const role = user?.role || "learner";
  const isAdmin = role === "admin";
  const isInstructor = role === "instructor";
  const userName = user?.name || "Bạn";

  // State
  const [content, setContent] = useState<ContentItem[]>(INITIAL_CONTENT);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "rating" | "name">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const bulkMode = isAdmin && selectedIds.size > 0;

  // Upload form
  const [uploadForm, setUploadForm] = useState({
    title: "", description: "", type: "document" as ContentItem["type"],
    category: CATEGORIES[0], courseLinked: "", tags: "", status: "draft" as ContentItem["status"],
  });

  // Derived
  const filtered = useMemo(() => {
    let items = content.filter(item => {
      const q = search.toLowerCase();
      const matchSearch = !q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.tags.some(t => t.toLowerCase().includes(q));
      const matchType = typeFilter === "all" || item.type === typeFilter;
      const matchCat = categoryFilter === "all" || item.category === categoryFilter;
      const matchStatus = statusFilter === "all" || item.status === statusFilter;

      // Folder filter
      if (selectedFolder === "my") return matchSearch && matchType && matchCat && matchStatus && item.author === userName;
      if (selectedFolder === "shared") return matchSearch && matchType && matchCat && matchStatus && item.isShared;
      if (selectedFolder === "quiz_bank") return matchSearch && matchCat && matchStatus && item.type === "quiz";
      if (selectedFolder === "media") return matchSearch && matchCat && matchStatus && (item.type === "video" || item.type === "audio" || item.type === "image");
      if (selectedFolder === "templates") return matchSearch && matchCat && matchStatus && item.type === "template";

      // Learner: only published & shared
      if (role === "learner") return matchSearch && matchType && matchCat && item.status === "published" && item.isShared;

      return matchSearch && matchType && matchCat && matchStatus;
    });

    items.sort((a, b) => {
      if (sortBy === "popular") return b.downloads - a.downloads;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "name") return a.title.localeCompare(b.title, "vi");
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return items;
  }, [content, search, typeFilter, categoryFilter, statusFilter, sortBy, selectedFolder, role, userName]);

  // Stats
  const totalPublished = content.filter(c => c.status === "published").length;
  const totalQuiz = content.filter(c => c.type === "quiz").length;
  const pendingCount = content.filter(c => c.status === "pending").length;
  const totalDownloads = content.reduce((s, c) => s + c.downloads, 0);
  const totalUsedInCourses = content.reduce((s, c) => s + c.usedInCourses, 0);

  // Folder counts
  const folderCounts = useMemo(() => ({
    all: content.length,
    my: content.filter(c => c.author === userName).length,
    shared: content.filter(c => c.isShared).length,
    quiz_bank: content.filter(c => c.type === "quiz").length,
    media: content.filter(c => ["video", "audio", "image"].includes(c.type)).length,
    templates: content.filter(c => c.type === "template").length,
  }), [content, userName]);

  // ─── Actions ───
  const updateItem = (id: string, changes: Partial<ContentItem>) => {
    setContent(prev => prev.map(c => c.id === id ? { ...c, ...changes } : c));
    if (selectedItem?.id === id) setSelectedItem(prev => prev ? { ...prev, ...changes } : null);
  };

  const handleUpload = () => {
    if (!uploadForm.title.trim()) { toast.error("Vui lòng nhập tiêu đề"); return; }
    const newItem: ContentItem = {
      id: `CB_${Date.now()}`,
      title: uploadForm.title,
      description: uploadForm.description,
      type: uploadForm.type,
      category: uploadForm.category,
      courseLinked: uploadForm.courseLinked || null,
      author: userName,
      authorRole: role as "admin" | "instructor" | "learner",
      size: "0 MB",
      version: 1,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      downloads: 0,
      usedInCourses: 0,
      rating: 0,
      ratingCount: 0,
      tags: uploadForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      status: isAdmin ? uploadForm.status : "pending",
      isShared: false,
      isLocked: false,
    };
    setContent(prev => [newItem, ...prev]);
    setShowUploadModal(false);
    setUploadForm({ title: "", description: "", type: "document", category: CATEGORIES[0], courseLinked: "", tags: "", status: "draft" });
    toast.success(isAdmin ? "Đã tạo nội dung mới" : "Đã gửi nội dung để phê duyệt!");
  };

  const handleEditSave = () => {
    if (!editingItem) return;
    updateItem(editingItem.id, {
      title: editingItem.title,
      description: editingItem.description,
      category: editingItem.category,
      courseLinked: editingItem.courseLinked,
      tags: editingItem.tags,
      updatedAt: new Date().toISOString().split("T")[0],
    });
    setEditingItem(null);
    toast.success("Đã cập nhật nội dung");
  };

  const handleDelete = async (item: ContentItem) => {
    const ok = await confirm({
      title: "Xóa nội dung",
      message: `Bạn có chắc muốn xóa "${item.title}"? ${item.usedInCourses > 0 ? `Nội dung này đang được sử dụng trong ${item.usedInCourses} khóa học.` : ""}`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setContent(prev => prev.filter(c => c.id !== item.id));
      if (selectedItem?.id === item.id) setSelectedItem(null);
      toast.success("Đã xóa nội dung");
    }
  };

  const handleApprove = (item: ContentItem) => {
    updateItem(item.id, { status: "published", isShared: true });
    toast.success(`Đã phê duyệt "${item.title}"`);
  };

  const handleReject = async (item: ContentItem) => {
    const ok = await confirm({
      title: "Từ chối nội dung",
      message: `Từ chối "${item.title}" của ${item.author}? Nội dung sẽ chuyển về trạng thái nháp.`,
      confirmLabel: "Từ chối",
      variant: "warning",
    });
    if (ok) {
      updateItem(item.id, { status: "draft" });
      toast.success("Đã từ chối nội dung");
    }
  };

  const handleToggleLock = (item: ContentItem) => {
    updateItem(item.id, { isLocked: !item.isLocked });
    toast.success(item.isLocked ? "Đã mở khóa nội dung" : "Đã khóa nội dung");
  };

  const handleToggleShare = (item: ContentItem) => {
    updateItem(item.id, { isShared: !item.isShared });
    toast.success(item.isShared ? "Đã hủy chia sẻ" : "Đã chia sẻ nội dung");
  };

  const handlePublish = (item: ContentItem) => {
    updateItem(item.id, { status: "published" });
    toast.success("Đã xuất bản nội dung");
  };

  const handleArchive = async (item: ContentItem) => {
    const ok = await confirm({
      title: "Lưu trữ nội dung",
      message: `Chuyển "${item.title}" sang lưu trữ? Nội dung sẽ không hiển thị với học viên.`,
      confirmLabel: "Lưu trữ",
      variant: "warning",
    });
    if (ok) {
      updateItem(item.id, { status: "archived", isShared: false });
      toast.success("Đã lưu trữ nội dung");
    }
  };

  const handleDownload = (item: ContentItem) => {
    updateItem(item.id, { downloads: item.downloads + 1 });
    toast.success(`Đang tải "${item.title}"...`);
  };

  const handleDuplicate = (item: ContentItem) => {
    const dup: ContentItem = {
      ...item,
      id: `CB_${Date.now()}`,
      title: `[Bản sao] ${item.title}`,
      author: userName,
      authorRole: role as "admin" | "instructor" | "learner",
      status: "draft",
      isShared: false,
      downloads: 0,
      usedInCourses: 0,
      version: 1,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setContent(prev => [dup, ...prev]);
    toast.success("Đã tạo bản sao");
  };

  const canEdit = (item: ContentItem) => isAdmin || (item.author === userName && !item.isLocked);
  const canDelete = (item: ContentItem) => isAdmin || (item.author === userName && item.status !== "published");

  // ─── Bulk Operations ───
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelectedIds(new Set(filtered.map(i => i.id)));
  const deselectAll = () => setSelectedIds(new Set());
  const selectedItems = content.filter(c => selectedIds.has(c.id));

  const bulkApprove = () => {
    const pending = selectedItems.filter(i => i.status === "pending");
    if (pending.length === 0) { toast.error("Không có nội dung nào chờ duyệt"); return; }
    setContent(prev => prev.map(c => selectedIds.has(c.id) && c.status === "pending" ? { ...c, status: "published", isShared: true } : c));
    toast.success(`Đã phê duyệt ${pending.length} nội dung`);
    deselectAll();
  };

  const bulkDelete = async () => {
    const ok = await confirm({
      title: "Xóa hàng loạt",
      message: `Bạn có chắc muốn xóa ${selectedIds.size} nội dung đã chọn?`,
      confirmLabel: `Xóa ${selectedIds.size} mục`,
      variant: "danger",
    });
    if (ok) {
      setContent(prev => prev.filter(c => !selectedIds.has(c.id)));
      toast.success(`Đã xóa ${selectedIds.size} nội dung`);
      deselectAll();
    }
  };

  const bulkShare = () => {
    setContent(prev => prev.map(c => selectedIds.has(c.id) && c.status === "published" ? { ...c, isShared: true } : c));
    toast.success(`Đã chia sẻ ${selectedIds.size} nội dung`);
    deselectAll();
  };

  const bulkArchive = async () => {
    const ok = await confirm({
      title: "Lưu trữ hàng loạt",
      message: `Chuyển ${selectedIds.size} nội dung sang lưu trữ?`,
      confirmLabel: "Lưu trữ",
      variant: "warning",
    });
    if (ok) {
      setContent(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, status: "archived", isShared: false } : c));
      toast.success(`Đã lưu trữ ${selectedIds.size} nội dung`);
      deselectAll();
    }
  };

  // ─── Detail View ───
  if (selectedItem) {
    const tc = TYPE_CONFIG[selectedItem.type] || TYPE_CONFIG.document;
    const sc = STATUS_CONFIG[selectedItem.status];
    const TIcon = tc.icon;
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedItem(null)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" style={{ fontSize: "13px" }}>
          <ArrowLeft className="w-4 h-4" /> Quay lại Ngân hàng Nội dung
        </button>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Color bar */}
          <div className="h-1.5" style={{ backgroundColor: tc.color }} />
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tc.bg }}>
                <TIcon className="w-7 h-7" style={{ color: tc.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: tc.color, backgroundColor: tc.bg }}>{tc.label}</span>
                  <span className="px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: sc.color, backgroundColor: sc.bg }}>{sc.label}</span>
                  {selectedItem.isLocked && <span className="flex items-center gap-0.5 text-orange-500" style={{ fontSize: "10px" }}><Lock className="w-3 h-3" /> Đã khóa</span>}
                  <span className="text-muted-foreground" style={{ fontSize: "10px" }}>v{selectedItem.version}</span>
                </div>
                <h2 className="text-foreground">{selectedItem.title}</h2>
                <p className="text-muted-foreground mt-2" style={{ fontSize: "14px", lineHeight: 1.7 }}>{selectedItem.description}</p>
              </div>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
              {[
                { label: "Tác giả", value: selectedItem.author },
                { label: "Danh mục", value: selectedItem.category },
                { label: "Dung lượng", value: `${selectedItem.size}${selectedItem.duration ? ` • ${selectedItem.duration}` : ""}` },
                { label: "Khóa học", value: selectedItem.courseLinked || "Không liên kết" },
                { label: "Ngày tạo", value: new Date(selectedItem.createdAt).toLocaleDateString("vi-VN") },
                { label: "Cập nhật", value: new Date(selectedItem.updatedAt).toLocaleDateString("vi-VN") },
                { label: "Lượt tải", value: selectedItem.downloads.toLocaleString() },
                { label: "Dùng trong", value: `${selectedItem.usedInCourses} khóa học` },
              ].map(m => (
                <div key={m.label} className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{m.label}</p>
                  <p className="text-foreground mt-0.5" style={{ fontSize: "12px", fontWeight: 500 }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Rating & Stats */}
            <div className="flex items-center gap-4 mt-4 py-3 border-y border-border">
              {selectedItem.rating > 0 && (
                <span className="flex items-center gap-1 text-[#c8a84e]" style={{ fontSize: "13px", fontWeight: 600 }}>
                  <Star className="w-4 h-4 fill-[#c8a84e]" /> {selectedItem.rating} ({selectedItem.ratingCount})
                </span>
              )}
              <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "13px" }}><Download className="w-4 h-4" /> {selectedItem.downloads} tải</span>
              <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "13px" }}><BookOpen className="w-4 h-4" /> {selectedItem.usedInCourses} khóa</span>
              {selectedItem.isShared && <span className="flex items-center gap-1 text-[#16a34a]" style={{ fontSize: "12px" }}><Share2 className="w-3.5 h-3.5" /> Đã chia sẻ</span>}
            </div>

            {/* Tags */}
            {selectedItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedItem.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "10px" }}>#{t}</span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-5">
              {selectedItem.status === "published" && (
                <button onClick={() => handleDownload(selectedItem)} className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
                  <Download className="w-4 h-4" /> Tải xuống
                </button>
              )}
              {canEdit(selectedItem) && (
                <button onClick={() => setEditingItem(selectedItem)} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-secondary cursor-pointer" style={{ fontSize: "13px" }}>
                  <Edit className="w-4 h-4" /> Chỉnh sửa
                </button>
              )}
              {(isAdmin || isInstructor) && (
                <button onClick={() => handleDuplicate(selectedItem)} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-secondary cursor-pointer" style={{ fontSize: "13px" }}>
                  <Copy className="w-4 h-4" /> Tạo bản sao
                </button>
              )}
              {(isAdmin || isInstructor) && selectedItem.status === "published" && (
                <button onClick={() => handleToggleShare(selectedItem)} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-secondary cursor-pointer" style={{ fontSize: "13px" }}>
                  <Share2 className="w-4 h-4" /> {selectedItem.isShared ? "Hủy chia sẻ" : "Chia sẻ"}
                </button>
              )}
              {isAdmin && (
                <button onClick={() => handleToggleLock(selectedItem)} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-secondary cursor-pointer" style={{ fontSize: "13px" }}>
                  {selectedItem.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />} {selectedItem.isLocked ? "Mở khóa" : "Khóa"}
                </button>
              )}
              {isAdmin && selectedItem.status === "pending" && (
                <>
                  <button onClick={() => handleApprove(selectedItem)} className="flex items-center gap-2 px-4 py-2.5 bg-[#16a34a] text-white rounded-lg hover:bg-[#16a34a]/90 cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
                    <Check className="w-4 h-4" /> Phê duyệt
                  </button>
                  <button onClick={() => handleReject(selectedItem)} className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 cursor-pointer" style={{ fontSize: "13px" }}>
                    <X className="w-4 h-4" /> Từ chối
                  </button>
                </>
              )}
              {isAdmin && selectedItem.status === "draft" && (
                <button onClick={() => handlePublish(selectedItem)} className="flex items-center gap-2 px-4 py-2.5 bg-[#2563eb] text-white rounded-lg hover:bg-[#2563eb]/90 cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
                  <CheckCircle2 className="w-4 h-4" /> Xuất bản
                </button>
              )}
              {selectedItem.status !== "archived" && (isAdmin || isInstructor) && (
                <button onClick={() => handleArchive(selectedItem)} className="flex items-center gap-2 px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg cursor-pointer" style={{ fontSize: "13px" }}>
                  <FolderOpen className="w-4 h-4" /> Lưu trữ
                </button>
              )}
              {canDelete(selectedItem) && (
                <button onClick={() => handleDelete(selectedItem)} className="flex items-center gap-2 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer" style={{ fontSize: "13px" }}>
                  <Trash2 className="w-4 h-4" /> Xóa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Inline Preview */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Play className="w-4 h-4 text-[#990803]" /> Xem trước nội dung
            </h3>
            <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{tc.label}</span>
          </div>
          <ContentPreview type={selectedItem.type} title={selectedItem.title} inline />
        </div>

        {/* Version history */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Lịch sử phiên bản</h3>
          <div className="space-y-2">
            {Array.from({ length: selectedItem.version }, (_, i) => selectedItem.version - i).map(v => (
              <div key={v} className={`flex items-center gap-3 p-3 rounded-lg ${v === selectedItem.version ? "bg-[#990803]/5 border border-[#990803]/10" : "bg-secondary/30"}`}>
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center" style={{ fontSize: "11px", fontWeight: 700 }}>v{v}</div>
                <div className="flex-1">
                  <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{v === selectedItem.version ? "Phiên bản hiện tại" : `Phiên bản ${v}`}</span>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{selectedItem.author} • {v === selectedItem.version ? new Date(selectedItem.updatedAt).toLocaleDateString("vi-VN") : "..."}</p>
                </div>
                {v === selectedItem.version && <span className="px-2 py-0.5 bg-[#16a34a]/10 text-[#16a34a] rounded" style={{ fontSize: "9px", fontWeight: 600 }}>Hiện tại</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── List View ───
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-[#990803]" />
            <h1 className="text-foreground">Ngân hàng Nội dung</h1>
          </div>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
            {isAdmin ? "Quản lý toàn bộ nội dung đào tạo: tài liệu, câu hỏi, media" :
             isInstructor ? "Quản lý nội dung giảng dạy và ngân hàng câu hỏi" :
             "Khám phá tài liệu đào tạo và học liệu chia sẻ"}
          </p>
        </div>
        {(isAdmin || isInstructor) && (
          <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors shrink-0 cursor-pointer" style={{ fontSize: "14px" }}>
            <Upload className="w-4 h-4" /> Tải lên nội dung
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Đã xuất bản", value: totalPublished, icon: CheckCircle2, color: "#16a34a" },
          { label: "Ngân hàng CH", value: totalQuiz, icon: BookOpen, color: "#7c3aed" },
          { label: "Lượt tải", value: totalDownloads.toLocaleString(), icon: Download, color: "#2563eb" },
          { label: "Dùng trong KH", value: totalUsedInCourses, icon: Link2, color: "#c8a84e" },
          ...(isAdmin ? [{ label: "Chờ duyệt", value: pendingCount, icon: Clock, color: "#ea580c" }] : [{ label: "Tổng nội dung", value: content.length, icon: FolderOpen, color: "#990803" }]),
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + "10" }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>{stat.value}</p>
              <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending banner (admin) */}
      {isAdmin && pendingCount > 0 && (
        <div className="bg-[#ea580c]/5 border border-[#ea580c]/15 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#ea580c]" />
            <span className="text-[#ea580c]" style={{ fontSize: "13px", fontWeight: 500 }}>{pendingCount} nội dung đang chờ phê duyệt</span>
          </div>
          <button onClick={() => setStatusFilter("pending")} className="px-3 py-1.5 bg-[#ea580c]/10 text-[#ea580c] rounded-lg hover:bg-[#ea580c]/20 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>Xem & Duyệt</button>
        </div>
      )}

      {/* Main content area with sidebar */}
      <div className="flex gap-4">
        {/* Sidebar folders */}
        {(isAdmin || isInstructor) && (
          <div className="w-52 shrink-0 hidden lg:block">
            <div className="bg-card rounded-xl border border-border p-2 space-y-0.5 sticky top-4">
              <p className="px-3 py-1 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase" }}>Thư mục</p>
              {FOLDERS.map(f => (
                <button key={f.id} onClick={() => setSelectedFolder(f.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${selectedFolder === f.id ? "bg-[#990803]/10 text-[#990803]" : "text-foreground hover:bg-secondary"}`}
                  style={{ fontSize: "12px" }}>
                  <span>{f.icon}</span>
                  <span className="flex-1 truncate" style={{ fontWeight: selectedFolder === f.id ? 600 : 400 }}>{f.name}</span>
                  <span className="text-muted-foreground shrink-0" style={{ fontSize: "10px" }}>{folderCounts[f.id as keyof typeof folderCounts] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Tìm nội dung, tag..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "12px" }} />
              </div>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "12px" }}>
                <option value="all">Tất cả loại</option>
                {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "12px" }}>
                <option value="all">Tất cả danh mục</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {(isAdmin || isInstructor) && (
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "12px" }}>
                  <option value="all">Tất cả trạng thái</option>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              )}
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="px-3 py-2 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "12px" }}>
                <option value="recent">Mới nhất</option>
                <option value="popular">Phổ biến</option>
                <option value="rating">Đánh giá</option>
                <option value="name">Tên A-Z</option>
              </select>
              <div className="flex items-center border border-border rounded-lg overflow-hidden ml-auto">
                <button onClick={() => setViewMode("list")} className={`p-2 cursor-pointer ${viewMode === "list" ? "bg-[#990803] text-white" : "text-muted-foreground hover:bg-secondary"}`}><List className="w-3.5 h-3.5" /></button>
                <button onClick={() => setViewMode("grid")} className={`p-2 cursor-pointer ${viewMode === "grid" ? "bg-[#990803] text-white" : "text-muted-foreground hover:bg-secondary"}`}><Grid3X3 className="w-3.5 h-3.5" /></button>
              </div>
              <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{filtered.length} kết quả</span>
            </div>
          </div>

          {/* Content items */}
          {filtered.length === 0 ? (
            <EmptyState variant={search ? "search" : "empty"} title="Không tìm thấy nội dung" message={search ? `Không có kết quả cho "${search}"` : "Chưa có nội dung nào phù hợp"}
              action={search ? { label: "Xóa bộ lọc", onClick: () => { setSearch(""); setTypeFilter("all"); setCategoryFilter("all"); setStatusFilter("all"); } } : undefined} />
          ) : viewMode === "list" ? (
            <div className="space-y-2">
              {filtered.map(item => (
                <ContentListRow key={item.id} item={item} isAdmin={isAdmin} isInstructor={isInstructor} userName={userName}
                  contextMenuId={contextMenuId} setContextMenuId={setContextMenuId}
                  selected={selectedIds.has(item.id)} onToggleSelect={() => toggleSelect(item.id)}
                  onView={() => setSelectedItem(item)} onEdit={() => setEditingItem(item)}
                  onDelete={() => handleDelete(item)} onDuplicate={() => handleDuplicate(item)}
                  onDownload={() => handleDownload(item)} onApprove={() => handleApprove(item)}
                  onReject={() => handleReject(item)} onToggleShare={() => handleToggleShare(item)}
                  onPublish={() => handlePublish(item)} onPreview={() => setPreviewItem(item)} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(item => (
                <ContentGridCard key={item.id} item={item} isAdmin={isAdmin}
                  onView={() => setSelectedItem(item)} onDownload={() => handleDownload(item)}
                  onApprove={() => handleApprove(item)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <ModalOverlay onClose={() => setShowUploadModal(false)}>
          <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-[#990803]/5 to-transparent rounded-t-2xl">
            <div className="flex items-center gap-2"><Upload className="w-5 h-5 text-[#990803]" /><h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>Tải lên nội dung mới</h3></div>
            <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-secondary rounded-lg cursor-pointer"><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Tiêu đề <span className="text-red-500">*</span></label>
              <input type="text" value={uploadForm.title} onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Nhập tiêu đề nội dung..." className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px" }} />
            </div>
            <div>
              <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Mô tả</label>
              <textarea value={uploadForm.description} onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Mô tả nội dung..." className="w-full p-3 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" rows={3} style={{ fontSize: "13px", resize: "vertical" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Loại nội dung</label>
                <select value={uploadForm.type} onChange={e => setUploadForm(p => ({ ...p, type: e.target.value as ContentItem["type"] }))}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }}>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Danh mục</label>
                <select value={uploadForm.category} onChange={e => setUploadForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Khóa học liên kết</label>
                <input type="text" value={uploadForm.courseLinked} onChange={e => setUploadForm(p => ({ ...p, courseLinked: e.target.value }))}
                  placeholder="VD: Kỹ năng Lãnh đạo" className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
              </div>
              {isAdmin && (
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Trạng thái</label>
                  <select value={uploadForm.status} onChange={e => setUploadForm(p => ({ ...p, status: e.target.value as ContentItem["status"] }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }}>
                    <option value="draft">Bản nháp</option>
                    <option value="published">Xuất bản ngay</option>
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Tags</label>
              <input type="text" value={uploadForm.tags} onChange={e => setUploadForm(p => ({ ...p, tags: e.target.value }))}
                placeholder="VD: Leadership, Quiz, Video (phân cách bằng dấu phẩy)" className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
            </div>
            {/* Drag & Drop Upload Zone */}
            <FileUploadZone maxSizeMB={500} maxFiles={5} />
          </div>
          <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
            <button onClick={() => setShowUploadModal(false)} className="px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
            <button onClick={handleUpload} className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
              <Upload className="w-4 h-4" /> {isAdmin ? "Tạo nội dung" : "Gửi phê duyệt"}
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <ModalOverlay onClose={() => setEditingItem(null)}>
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>Chỉnh sửa nội dung</h3>
            <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-secondary rounded-lg cursor-pointer"><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Tiêu đề</label>
              <input type="text" value={editingItem.title} onChange={e => setEditingItem(p => p ? { ...p, title: e.target.value } : null)}
                className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px" }} />
            </div>
            <div>
              <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Mô tả</label>
              <textarea value={editingItem.description} onChange={e => setEditingItem(p => p ? { ...p, description: e.target.value } : null)}
                className="w-full p-3 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" rows={3} style={{ fontSize: "13px", resize: "vertical" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Danh mục</label>
                <select value={editingItem.category} onChange={e => setEditingItem(p => p ? { ...p, category: e.target.value } : null)}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Khóa học liên kết</label>
                <input type="text" value={editingItem.courseLinked || ""} onChange={e => setEditingItem(p => p ? { ...p, courseLinked: e.target.value || null } : null)}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
              </div>
            </div>
            <div>
              <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Tags</label>
              <input type="text" value={editingItem.tags.join(", ")} onChange={e => setEditingItem(p => p ? { ...p, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) } : null)}
                className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
            <button onClick={() => setEditingItem(null)} className="px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
            <button onClick={handleEditSave} className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
              <Check className="w-4 h-4" /> Lưu thay đổi
            </button>
          </div>
        </ModalOverlay>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <ContentPreview type={previewItem.type} title={previewItem.title} onClose={() => setPreviewItem(null)} />
      )}

      {/* Bulk Action Bar (Admin) */}
      {bulkMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border border-border rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={deselectAll} className="p-1 rounded hover:bg-secondary cursor-pointer"><X className="w-4 h-4 text-muted-foreground" /></button>
            <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{selectedIds.size} đã chọn</span>
            <button onClick={selectAll} className="text-[#990803] hover:underline cursor-pointer" style={{ fontSize: "11px" }}>Chọn tất cả ({filtered.length})</button>
          </div>
          <div className="w-px h-6 bg-border" />
          <button onClick={bulkApprove} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16a34a] text-white rounded-lg hover:bg-[#16a34a]/90 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Check className="w-3.5 h-3.5" /> Duyệt
          </button>
          <button onClick={bulkShare} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] text-white rounded-lg hover:bg-[#2563eb]/90 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Share2 className="w-3.5 h-3.5" /> Chia sẻ
          </button>
          <button onClick={bulkArchive} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg hover:bg-secondary cursor-pointer" style={{ fontSize: "12px" }}>
            <Archive className="w-3.5 h-3.5" /> Lưu trữ
          </button>
          <button onClick={bulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Trash2 className="w-3.5 h-3.5" /> Xóa
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Reusable Modal Overlay ───
function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ─── Content List Row ───
function ContentListRow({ item, isAdmin, isInstructor, userName, contextMenuId, setContextMenuId,
  selected, onToggleSelect,
  onView, onEdit, onDelete, onDuplicate, onDownload, onApprove, onReject, onToggleShare, onPublish, onPreview }: {
  item: ContentItem; isAdmin: boolean; isInstructor: boolean; userName: string;
  contextMenuId: string | null; setContextMenuId: (id: string | null) => void;
  selected: boolean; onToggleSelect: () => void;
  onView: () => void; onEdit: () => void; onDelete: () => void; onDuplicate: () => void;
  onDownload: () => void; onApprove: () => void; onReject: () => void; onToggleShare: () => void; onPublish: () => void;
  onPreview: () => void;
}) {
  const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.document;
  const sc = STATUS_CONFIG[item.status];
  const TIcon = tc.icon;
  const canEdit = isAdmin || (item.author === userName && !item.isLocked);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuOpen = contextMenuId === item.id;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setContextMenuId(null);
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen, setContextMenuId]);

  return (
    <div className={`bg-card rounded-xl border p-4 hover:shadow-sm transition-all group ${selected ? "border-[#990803]/30 bg-[#990803]/[0.02]" : item.status === "pending" ? "border-[#ea580c]/20 bg-[#ea580c]/[0.02]" : item.status === "draft" ? "border-border/50 opacity-80" : "border-border"}`}>
      <div className="flex items-center gap-3">
        {/* Checkbox (admin only) */}
        {isAdmin && (
          <button onClick={e => { e.stopPropagation(); onToggleSelect(); }} className="shrink-0 cursor-pointer p-0.5">
            {selected ? <SquareCheck className="w-4.5 h-4.5 text-[#990803]" /> : <Square className="w-4.5 h-4.5 text-muted-foreground/30 group-hover:text-muted-foreground/60" />}
          </button>
        )}
        <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 cursor-pointer" style={{ backgroundColor: tc.bg }} onClick={onView}>
          <TIcon className="w-5 h-5" style={{ color: tc.color }} />
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{item.title}</h4>
            {item.status !== "published" && <span className="px-1.5 py-0.5 rounded shrink-0" style={{ fontSize: "9px", fontWeight: 600, color: sc.color, backgroundColor: sc.bg }}>{sc.label}</span>}
            {item.isLocked && <Lock className="w-3 h-3 text-orange-400 shrink-0" />}
          </div>
          <div className="flex items-center gap-3 text-muted-foreground mt-0.5 flex-wrap" style={{ fontSize: "11px" }}>
            <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 500, color: tc.color, backgroundColor: tc.bg }}>{tc.label}</span>
            <span>{item.category}</span>
            <span>•</span>
            <span>{item.author}</span>
            <span>•</span>
            <span>{item.size}</span>
            {item.duration && <><span>•</span><span>{item.duration}</span></>}
            {item.courseLinked && <><span>•</span><span className="text-[#990803]">{item.courseLinked}</span></>}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-muted-foreground" style={{ fontSize: "11px" }}>
          {item.rating > 0 && <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" /> {item.rating}</span>}
          <span className="flex items-center gap-0.5"><Download className="w-3 h-3" /> {item.downloads}</span>
          {item.isShared && <Share2 className="w-3.5 h-3.5 text-[#16a34a]" />}
          <span className="text-muted-foreground/50" style={{ fontSize: "9px" }}>v{item.version}</span>
        </div>
        {/* Quick actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); onPreview(); }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer" title="Xem trước"><Play className="w-3.5 h-3.5" /></button>
          {item.status === "published" && (
            <button onClick={e => { e.stopPropagation(); onDownload(); }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer" title="Tải"><Download className="w-3.5 h-3.5" /></button>
          )}
          {isAdmin && item.status === "pending" && (
            <button onClick={e => { e.stopPropagation(); onApprove(); }} className="p-1.5 rounded-lg hover:bg-green-50 text-[#16a34a] cursor-pointer" title="Duyệt"><Check className="w-3.5 h-3.5" /></button>
          )}
        </div>
        {/* Context menu */}
        {(isAdmin || isInstructor || item.author === userName) && (
          <div ref={menuRef} className="relative shrink-0">
            <button onClick={e => { e.stopPropagation(); setContextMenuId(menuOpen ? null : item.id); }}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-card rounded-xl border border-border shadow-xl z-20 py-1">
                <button onClick={() => { setContextMenuId(null); onView(); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left cursor-pointer" style={{ fontSize: "12px" }}><Eye className="w-3.5 h-3.5 text-muted-foreground" /> Xem chi tiết</button>
                {canEdit && <button onClick={() => { setContextMenuId(null); onEdit(); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left cursor-pointer" style={{ fontSize: "12px" }}><Edit className="w-3.5 h-3.5 text-muted-foreground" /> Chỉnh sửa</button>}
                <button onClick={() => { setContextMenuId(null); onDuplicate(); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left cursor-pointer" style={{ fontSize: "12px" }}><Copy className="w-3.5 h-3.5 text-muted-foreground" /> Tạo bản sao</button>
                {(isAdmin || isInstructor) && item.status === "published" && (
                  <button onClick={() => { setContextMenuId(null); onToggleShare(); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left cursor-pointer" style={{ fontSize: "12px" }}><Share2 className="w-3.5 h-3.5 text-muted-foreground" /> {item.isShared ? "Hủy chia sẻ" : "Chia sẻ"}</button>
                )}
                {isAdmin && item.status === "draft" && (
                  <button onClick={() => { setContextMenuId(null); onPublish(); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-left cursor-pointer text-[#2563eb]" style={{ fontSize: "12px" }}><CheckCircle2 className="w-3.5 h-3.5" /> Xuất bản</button>
                )}
                {isAdmin && item.status === "pending" && (
                  <>
                    <div className="border-t border-border my-0.5" />
                    <button onClick={() => { setContextMenuId(null); onApprove(); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-green-50 text-left cursor-pointer text-[#16a34a]" style={{ fontSize: "12px" }}><Check className="w-3.5 h-3.5" /> Phê duyệt</button>
                    <button onClick={() => { setContextMenuId(null); onReject(); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-left cursor-pointer text-red-500" style={{ fontSize: "12px" }}><X className="w-3.5 h-3.5" /> Từ chối</button>
                  </>
                )}
                {(isAdmin || (item.author === userName && item.status !== "published")) && (
                  <>
                    <div className="border-t border-border my-0.5" />
                    <button onClick={() => { setContextMenuId(null); onDelete(); }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-left cursor-pointer text-red-600" style={{ fontSize: "12px" }}><Trash2 className="w-3.5 h-3.5" /> Xóa</button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Content Grid Card ───
function ContentGridCard({ item, isAdmin, onView, onDownload, onApprove }: {
  item: ContentItem; isAdmin: boolean; onView: () => void; onDownload: () => void; onApprove: () => void;
}) {
  const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.document;
  const sc = STATUS_CONFIG[item.status];
  const TIcon = tc.icon;
  return (
    <div onClick={onView} className={`bg-card rounded-xl border overflow-hidden hover:shadow-md transition-all cursor-pointer ${item.status === "pending" ? "border-[#ea580c]/20" : "border-border"}`}>
      <div className="h-1.5" style={{ backgroundColor: tc.color + "30" }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: tc.bg }}>
            <TIcon className="w-5 h-5" style={{ color: tc.color }} />
          </div>
          <div className="flex items-center gap-1">
            {item.status !== "published" && <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: sc.color, backgroundColor: sc.bg }}>{sc.label}</span>}
            {item.isShared && <Share2 className="w-3 h-3 text-[#16a34a]" />}
          </div>
        </div>
        <h4 className="text-foreground line-clamp-2" style={{ fontSize: "12px", fontWeight: 600 }}>{item.title}</h4>
        <p className="text-muted-foreground mt-1 line-clamp-2" style={{ fontSize: "10px" }}>{item.description}</p>
        <div className="flex items-center gap-2 mt-2 text-muted-foreground" style={{ fontSize: "10px" }}>
          <span className="truncate">{item.author}</span>
          <span>•</span>
          <span>{item.category}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.slice(0, 3).map(t => <span key={t} className="px-1.5 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "9px" }}>#{t}</span>)}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-muted-foreground" style={{ fontSize: "10px" }}>
          {item.rating > 0 ? <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-[#c8a84e] fill-[#c8a84e]" /> {item.rating}</span> : <span />}
          <span>{item.downloads} tải</span>
          <span>{item.size}</span>
        </div>
        {isAdmin && item.status === "pending" && (
          <button onClick={e => { e.stopPropagation(); onApprove(); }}
            className="w-full mt-3 py-2 bg-[#16a34a] text-white rounded-lg hover:bg-[#16a34a]/90 cursor-pointer" style={{ fontSize: "11px", fontWeight: 600 }}>Phê duyệt</button>
        )}
      </div>
    </div>
  );
}
