import { useState, useMemo } from "react";
import {
  Library, Search, Download, Bookmark, BookmarkCheck, Eye,
  FileText, Video, Image, File, Headphones, Star, Clock,
  Upload, Trash2,
  Grid3X3, List, ThumbsUp, MessageCircle,
  BookOpen, FolderOpen,
  X, Check,
  ArrowLeft, AlertCircle,
  Heart, Layers, SquareCheck, Square,
  Play,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { useConfirm } from "./ConfirmDialog";
import { EmptyState } from "./EmptyState";
import { FileUploadZone } from "./shared/FileUploadZone";
import { ContentPreview } from "./shared/ContentPreview";
import { toast } from "@/app/lib/toast";

// ─── Types ───
interface Resource {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "video" | "audio" | "ebook" | "slide" | "infographic" | "template";
  category: string;
  subsidiary: string;
  author: string;
  authorRole: "admin" | "instructor" | "learner";
  size: string;
  duration?: string;
  uploadDate: string;
  downloads: number;
  views: number;
  likes: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  featured: boolean;
  bookmarked: boolean;
  approved: boolean;
  comments: ResourceComment[];
}

interface ResourceComment {
  id: string;
  author: string;
  authorRole: "admin" | "instructor" | "learner";
  content: string;
  createdAt: string;
  likes: number;
}

interface Collection {
  id: string;
  name: string;
  count: number;
  icon: string;
}

// ─── Config ───
const TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string; bg: string; label: string }> = {
  pdf: { icon: FileText, color: "#e74c3c", bg: "#e74c3c10", label: "PDF" },
  video: { icon: Video, color: "#2563eb", bg: "#2563eb10", label: "Video" },
  audio: { icon: Headphones, color: "#7c3aed", bg: "#7c3aed10", label: "Audio" },
  ebook: { icon: BookOpen, color: "#16a34a", bg: "#16a34a10", label: "E-Book" },
  slide: { icon: File, color: "#ea580c", bg: "#ea580c10", label: "Slide" },
  infographic: { icon: Image, color: "#0891b2", bg: "#0891b210", label: "Infographic" },
  template: { icon: FolderOpen, color: "#c8a84e", bg: "#c8a84e10", label: "Template" },
};

const CATEGORIES = [
  "Quản trị & Lãnh đạo", "Tài chính & Kế toán", "Marketing & Truyền thông",
  "Công nghệ Thông tin", "Nhân sự & Phát triển", "Bất động sản",
  "Pháp luật & Tuân thủ", "Kỹ năng mềm", "An toàn Lao động", "ESG & Bền vững",
];

const COLLECTIONS: Collection[] = [
  { id: "all", name: "Tất cả", count: 0, icon: "📚" },
  { id: "bookmarked", name: "Đã lưu", count: 0, icon: "🔖" },
  { id: "featured", name: "Nổi bật", count: 0, icon: "⭐" },
  { id: "recent", name: "Xem gần đây", count: 0, icon: "🕐" },
  { id: "trending", name: "Xu hướng", count: 0, icon: "🔥" },
];

function getInitials(name: string) {
  const clean = name.replace(/^(KS\.|TS\.|ThS\.|PMP\.|LS\.|Dr\.)\s*/, "");
  const parts = clean.split(" ");
  return parts.length >= 2 ? (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
}

// ─── Mock Data ───
const INITIAL_RESOURCES: Resource[] = [
  { id: "R01", title: "Chiến lược Phát triển Tập đoàn Geleximco 2026-2030", description: "Tài liệu nội bộ về tầm nhìn và chiến lược phát triển 5 năm tới của Tập đoàn, bao gồm phân tích thị trường, lộ trình tăng trưởng và mục tiêu ESG.", type: "pdf", category: "Quản trị & Lãnh đạo", subsidiary: "VP Tập đoàn", author: "Nguyễn Văn Minh", authorRole: "admin", size: "15.2 MB", uploadDate: "2026-01-05", downloads: 1240, views: 3560, likes: 892, rating: 4.9, ratingCount: 156, tags: ["Chiến lược", "Tập đoàn", "2026-2030"], featured: true, bookmarked: false, approved: true, comments: [
    { id: "rc1", author: "Trần Thị Hương", authorRole: "learner", content: "Tài liệu rất chi tiết, đặc biệt phần phân tích SWOT cho từng lĩnh vực!", createdAt: "2026-01-10", likes: 15 },
    { id: "rc2", author: "Đỗ Minh Châu", authorRole: "admin", content: "Đề nghị tất cả quản lý cấp trung đọc kỹ chapter 3 về Digital Transformation roadmap.", createdAt: "2026-01-12", likes: 23 },
  ] },
  { id: "R02", title: "Hướng dẫn Digital Marketing cho BĐS", description: "Bộ video hướng dẫn chiến lược marketing số cho lĩnh vực bất động sản, cập nhật xu hướng 2026 với AI-generated content và virtual tours.", type: "video", category: "Marketing & Truyền thông", subsidiary: "BĐS Geleximco", author: "Phạm Anh Tuấn", authorRole: "instructor", size: "1.2 GB", duration: "4h 30p", uploadDate: "2026-02-10", downloads: 567, views: 2340, likes: 456, rating: 4.7, ratingCount: 89, tags: ["Marketing", "BĐS", "Digital"], featured: true, bookmarked: false, approved: true, comments: [] },
  { id: "R03", title: "Phân tích Tài chính Nâng cao — Excel Templates", description: "Bộ template Excel phân tích tài chính doanh nghiệp có hướng dẫn chi tiết: DCF, FCF, ratio analysis, financial modeling.", type: "template", category: "Tài chính & Kế toán", subsidiary: "ABBank", author: "ThS. Lê Thị Thu Hà", authorRole: "instructor", size: "8.5 MB", uploadDate: "2026-02-15", downloads: 890, views: 1850, likes: 345, rating: 4.8, ratingCount: 67, tags: ["Excel", "Tài chính", "Template", "DCF"], featured: true, bookmarked: false, approved: true, comments: [
    { id: "rc3", author: "Lê Hoàng Nam", authorRole: "learner", content: "Template DCF rất hữu ích! Đã áp dụng cho phân tích dự án BĐS An Khánh.", createdAt: "2026-02-20", likes: 8 },
  ] },
  { id: "R04", title: "E-Book: Kỹ năng Lãnh đạo Thế kỷ 21", description: "Sách điện tử về kỹ năng lãnh đạo hiện đại dành cho quản lý cấp trung, bao gồm DISC, EQ, và Servant Leadership.", type: "ebook", category: "Kỹ năng mềm", subsidiary: "VP Tập đoàn", author: "Nguyễn Văn Minh", authorRole: "admin", size: "22 MB", uploadDate: "2026-01-20", downloads: 1560, views: 4200, likes: 987, rating: 4.9, ratingCount: 234, tags: ["Lãnh đạo", "E-Book", "Kỹ năng mềm", "DISC"], featured: false, bookmarked: false, approved: true, comments: [] },
  { id: "R05", title: "Infographic: Quy trình Onboarding Geleximco", description: "Infographic tổng hợp quy trình hội nhập nhân viên mới toàn tập đoàn, từ ngày đầu đến tuần thứ 12.", type: "infographic", category: "Nhân sự & Phát triển", subsidiary: "VP Tập đoàn", author: "Trần Thị Hương", authorRole: "learner", size: "5.6 MB", uploadDate: "2026-03-01", downloads: 430, views: 1650, likes: 267, rating: 4.6, ratingCount: 45, tags: ["Onboarding", "HR", "Quy trình"], featured: false, bookmarked: false, approved: true, comments: [] },
  { id: "R06", title: "Podcast: Xu hướng ESG trong Bất động sản", description: "Tập podcast thảo luận về xu hướng ESG và phát triển bền vững trong ngành BĐS Việt Nam 2026.", type: "audio", category: "ESG & Bền vững", subsidiary: "Energy", author: "Hoàng Đức Em", authorRole: "instructor", size: "85 MB", duration: "45p", uploadDate: "2026-03-08", downloads: 234, views: 890, likes: 178, rating: 4.5, ratingCount: 34, tags: ["ESG", "Podcast", "BĐS", "Bền vững"], featured: false, bookmarked: false, approved: true, comments: [] },
  { id: "R07", title: "Slide: Luật Doanh nghiệp 2024 — Cập nhật", description: "Bộ slide cập nhật các thay đổi quan trọng của Luật Doanh nghiệp mới nhất, so sánh với phiên bản cũ.", type: "slide", category: "Pháp luật & Tuân thủ", subsidiary: "VP Tập đoàn", author: "LS. Nguyễn Thị Lan", authorRole: "instructor", size: "12 MB", uploadDate: "2026-02-25", downloads: 678, views: 2100, likes: 456, rating: 4.7, ratingCount: 78, tags: ["Luật", "Doanh nghiệp", "2024", "Compliance"], featured: false, bookmarked: false, approved: true, comments: [] },
  { id: "R08", title: "Video: An toàn Lao động — Xây dựng", description: "Video đào tạo an toàn lao động tại công trường xây dựng: nhận diện rủi ro, sử dụng PPE, xử lý sự cố.", type: "video", category: "An toàn Lao động", subsidiary: "Xi măng Thăng Long", author: "KS. Trần Minh Đức", authorRole: "instructor", size: "650 MB", duration: "2h 15p", uploadDate: "2026-03-12", downloads: 345, views: 1200, likes: 210, rating: 4.4, ratingCount: 56, tags: ["ATLĐ", "Xây dựng", "Video", "PPE"], featured: false, bookmarked: false, approved: true, comments: [] },
  { id: "R09", title: "Template: Kế hoạch Dự án BĐS", description: "Template lập kế hoạch dự án bất động sản từ A-Z: feasibility study, timeline, budget, risk register.", type: "template", category: "Bất động sản", subsidiary: "BĐS Lê Trọng Tấn", author: "PMP. Hoàng Đình Nam", authorRole: "instructor", size: "4.2 MB", uploadDate: "2026-03-05", downloads: 189, views: 780, likes: 134, rating: 4.5, ratingCount: 29, tags: ["Template", "BĐS", "Dự án", "QLDA"], featured: false, bookmarked: false, approved: true, comments: [] },
  { id: "R10", title: "E-Book: Cybersecurity cho Doanh nghiệp", description: "Hướng dẫn toàn diện về an ninh mạng dành cho nhân viên: phishing, password, data protection, incident response.", type: "ebook", category: "Công nghệ Thông tin", subsidiary: "VP Tập đoàn", author: "Đỗ Minh Châu", authorRole: "admin", size: "18 MB", uploadDate: "2026-02-28", downloads: 456, views: 1340, likes: 289, rating: 4.6, ratingCount: 52, tags: ["Cybersecurity", "IT", "E-Book", "Security"], featured: false, bookmarked: false, approved: true, comments: [] },
  { id: "R11", title: "[Chờ duyệt] Hướng dẫn Nghiệp vụ Bảo hiểm", description: "Tài liệu hướng dẫn nghiệp vụ bảo hiểm cơ bản cho nhân viên mới tại Bảo hiểm AAA.", type: "pdf", category: "Tài chính & Kế toán", subsidiary: "Bảo hiểm AAA", author: "Bùi Thị Hà", authorRole: "learner", size: "9.8 MB", uploadDate: "2026-03-11", downloads: 0, views: 12, likes: 0, rating: 0, ratingCount: 0, tags: ["Bảo hiểm", "Nghiệp vụ"], featured: false, bookmarked: false, approved: false, comments: [] },
  { id: "R12", title: "[Chờ duyệt] Tips Giao tiếp Khách hàng VIP", description: "Chia sẻ kinh nghiệm giao tiếp với khách hàng cao cấp trong lĩnh vực BĐS cao cấp và hospitality.", type: "pdf", category: "Kỹ năng mềm", subsidiary: "BĐS An Khánh", author: "Dương Thị Lan", authorRole: "learner", size: "3.2 MB", uploadDate: "2026-03-12", downloads: 0, views: 5, likes: 0, rating: 0, ratingCount: 0, tags: ["Giao tiếp", "Khách hàng", "VIP"], featured: false, bookmarked: false, approved: false, comments: [] },
  { id: "R13", title: "Slide: AI & Machine Learning cơ bản", description: "Bộ slide giới thiệu về AI và Machine Learning cho người không chuyên, ứng dụng trong quản trị.", type: "slide", category: "Công nghệ Thông tin", subsidiary: "VP Tập đoàn", author: "Đỗ Minh Châu", authorRole: "admin", size: "35 MB", uploadDate: "2026-03-03", downloads: 312, views: 1100, likes: 198, rating: 4.7, ratingCount: 41, tags: ["AI", "ML", "Slide", "CĐS"], featured: true, bookmarked: false, approved: true, comments: [] },
  { id: "R14", title: "Video: Kỹ năng Thuyết trình Chuyên nghiệp", description: "Khóa mini 5 video về kỹ năng thuyết trình: cấu trúc, thiết kế slide, body language, Q&A handling.", type: "video", category: "Kỹ năng mềm", subsidiary: "VP Tập đoàn", author: "ThS. Vũ Minh Châu", authorRole: "instructor", size: "980 MB", duration: "3h 10p", uploadDate: "2026-02-18", downloads: 478, views: 1780, likes: 356, rating: 4.8, ratingCount: 72, tags: ["Thuyết trình", "Kỹ năng mềm", "Video"], featured: false, bookmarked: false, approved: true, comments: [] },
];

// ─── Main Component ───
export function ResourceLibrary() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const role = user?.role || "learner";
  const isAdmin = role === "admin";
  const isInstructor = role === "instructor";
  const userName = user?.name || "Bạn";

  // State
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending">("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "rating" | "downloads">("recent");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [likedResources, setLikedResources] = useState<Set<string>>(new Set());
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState<Record<string, number>>({});
  const [recentlyViewed, setRecentlyViewed] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const bulkMode = isAdmin && selectedIds.size > 0;

  // Upload form
  const [uploadForm, setUploadForm] = useState({
    title: "", description: "", type: "pdf" as Resource["type"],
    category: CATEGORIES[0], subsidiary: "VP Tập đoàn", tags: "",
  });

  // Toggle bookmark
  const toggleBookmark = (id: string) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, bookmarked: !r.bookmarked } : r));
    const res = resources.find(r => r.id === id);
    if (res) toast(res.bookmarked ? "Đã bỏ lưu tài liệu" : "Đã lưu tài liệu");
    if (selectedResource?.id === id) setSelectedResource(prev => prev ? { ...prev, bookmarked: !prev.bookmarked } : null);
  };

  const toggleLike = (id: string) => {
    setLikedResources(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); setResources(p => p.map(r => r.id === id ? { ...r, likes: r.likes - 1 } : r)); }
      else { n.add(id); setResources(p => p.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r)); }
      return n;
    });
  };

  const handleRating = (resourceId: string, rating: number) => {
    setUserRating(prev => ({ ...prev, [resourceId]: rating }));
    setResources(prev => prev.map(r => {
      if (r.id !== resourceId) return r;
      const newCount = r.ratingCount + (userRating[resourceId] ? 0 : 1);
      const newRating = Math.round(((r.rating * r.ratingCount + rating) / newCount) * 10) / 10;
      return { ...r, rating: Math.min(5, newRating), ratingCount: newCount };
    }));
    toast.success(`Đã đánh giá ${rating}/5 sao`);
  };

  // Filter
  const filtered = useMemo(() => {
    let items = resources.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)) || r.author.toLowerCase().includes(q);
      const matchType = filterType === "all" || r.type === filterType;
      const matchCat = filterCat === "all" || r.category === filterCat;
      const matchStatus = filterStatus === "all" || (filterStatus === "approved" && r.approved) || (filterStatus === "pending" && !r.approved);

      if (role === "learner" && !r.approved) return false;

      if (selectedCollection === "bookmarked") return matchSearch && matchType && matchCat && r.bookmarked;
      if (selectedCollection === "featured") return matchSearch && matchType && matchCat && r.featured && r.approved;
      if (selectedCollection === "recent") return matchSearch && matchType && matchCat && recentlyViewed.has(r.id);
      if (selectedCollection === "trending") return matchSearch && matchType && matchCat && r.approved && r.views > 1000;

      return matchSearch && matchType && matchCat && matchStatus;
    });

    items.sort((a, b) => {
      if (sortBy === "popular") return b.views - a.views;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "downloads") return b.downloads - a.downloads;
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    });
    return items;
  }, [resources, search, filterType, filterCat, filterStatus, sortBy, selectedCollection, role, recentlyViewed]);

  // Stats
  const totalApproved = resources.filter(r => r.approved).length;
  const totalDownloads = resources.reduce((s, r) => s + r.downloads, 0);
  const pendingCount = resources.filter(r => !r.approved).length;
  const bookmarkedCount = resources.filter(r => r.bookmarked).length;
  const avgRating = resources.filter(r => r.rating > 0).length > 0 ? (resources.filter(r => r.rating > 0).reduce((s, r) => s + r.rating, 0) / resources.filter(r => r.rating > 0).length).toFixed(1) : "0";

  // Collection counts
  const collectionCounts = useMemo(() => ({
    all: role === "learner" ? resources.filter(r => r.approved).length : resources.length,
    bookmarked: resources.filter(r => r.bookmarked).length,
    featured: resources.filter(r => r.featured && r.approved).length,
    recent: recentlyViewed.size,
    trending: resources.filter(r => r.approved && r.views > 1000).length,
  }), [resources, recentlyViewed, role]);

  // Actions
  const handleDownload = (item: Resource) => {
    setResources(prev => prev.map(r => r.id === item.id ? { ...r, downloads: r.downloads + 1 } : r));
    toast.success(`Đang tải "${item.title}"...`);
  };

  const handleApprove = (item: Resource) => {
    setResources(prev => prev.map(r => r.id === item.id ? { ...r, approved: true } : r));
    if (selectedResource?.id === item.id) setSelectedResource(prev => prev ? { ...prev, approved: true } : null);
    toast.success(`Đã phê duyệt "${item.title}"`);
  };

  const handleReject = async (item: Resource) => {
    const ok = await confirm({
      title: "Từ chối tài liệu",
      message: `Từ chối "${item.title}" của ${item.author}?`,
      confirmLabel: "Từ chối",
      variant: "warning",
    });
    if (ok) {
      setResources(prev => prev.filter(r => r.id !== item.id));
      if (selectedResource?.id === item.id) setSelectedResource(null);
      toast.success("Đã từ chối tài liệu");
    }
  };

  const handleDelete = async (item: Resource) => {
    const ok = await confirm({
      title: "Xóa tài liệu",
      message: `Bạn có chắc muốn xóa "${item.title}"?`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setResources(prev => prev.filter(r => r.id !== item.id));
      if (selectedResource?.id === item.id) setSelectedResource(null);
      toast.success("Đã xóa tài liệu");
    }
  };

  const handleToggleFeatured = (item: Resource) => {
    setResources(prev => prev.map(r => r.id === item.id ? { ...r, featured: !r.featured } : r));
    if (selectedResource?.id === item.id) setSelectedResource(prev => prev ? { ...prev, featured: !prev.featured } : null);
    toast.success(item.featured ? "Đã bỏ nổi bật" : "Đã đánh dấu nổi bật");
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedResource) return;
    const comment: ResourceComment = {
      id: `rc_${Date.now()}`,
      author: userName,
      authorRole: role as "admin" | "instructor" | "learner",
      content: newComment.trim(),
      createdAt: new Date().toISOString().split("T")[0],
      likes: 0,
    };
    setResources(prev => prev.map(r => r.id === selectedResource.id ? { ...r, comments: [...r.comments, comment] } : r));
    setSelectedResource(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null);
    setNewComment("");
    toast.success("Đã thêm bình luận");
  };

  // ─── Bulk Operations ───
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const selectAll = () => setSelectedIds(new Set(filtered.map(r => r.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const bulkApprove = () => {
    const pending = resources.filter(r => selectedIds.has(r.id) && !r.approved);
    if (pending.length === 0) { toast.error("Không có tài liệu chờ duyệt"); return; }
    setResources(prev => prev.map(r => selectedIds.has(r.id) && !r.approved ? { ...r, approved: true } : r));
    toast.success(`Đã phê duyệt ${pending.length} tài liệu`);
    deselectAll();
  };

  const bulkDelete = async () => {
    const ok = await confirm({ title: "Xóa hàng loạt", message: `Xóa ${selectedIds.size} tài liệu?`, confirmLabel: `Xóa ${selectedIds.size} mục`, variant: "danger" });
    if (ok) {
      setResources(prev => prev.filter(r => !selectedIds.has(r.id)));
      toast.success(`Đã xóa ${selectedIds.size} tài liệu`);
      deselectAll();
    }
  };

  const bulkFeature = () => {
    setResources(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, featured: true } : r));
    toast.success(`Đã đánh dấu nổi bật ${selectedIds.size} tài liệu`);
    deselectAll();
  };

  const handleUpload = () => {
    if (!uploadForm.title.trim()) { toast.error("Vui lòng nhập tiêu đề"); return; }
    const newRes: Resource = {
      id: `R_${Date.now()}`,
      title: uploadForm.title,
      description: uploadForm.description,
      type: uploadForm.type,
      category: uploadForm.category,
      subsidiary: uploadForm.subsidiary,
      author: userName,
      authorRole: role as "admin" | "instructor" | "learner",
      size: "0 MB",
      uploadDate: new Date().toISOString().split("T")[0],
      downloads: 0, views: 0, likes: 0, rating: 0, ratingCount: 0,
      tags: uploadForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      featured: false, bookmarked: false,
      approved: isAdmin,
      comments: [],
    };
    setResources(prev => [newRes, ...prev]);
    setShowUploadModal(false);
    setUploadForm({ title: "", description: "", type: "pdf", category: CATEGORIES[0], subsidiary: "VP Tập đoàn", tags: "" });
    toast.success(isAdmin ? "Đã tải lên tài liệu" : "Đã gửi tài liệu để phê duyệt!");
  };

  const viewResource = (item: Resource) => {
    setSelectedResource(item);
    setRecentlyViewed(prev => new Set([...prev, item.id]));
    setResources(prev => prev.map(r => r.id === item.id ? { ...r, views: r.views + 1 } : r));
  };

  // ─── Detail View ───
  if (selectedResource) {
    const tc = TYPE_CONFIG[selectedResource.type];
    const TIcon = tc.icon;
    const isLiked = likedResources.has(selectedResource.id);
    const currentRating = userRating[selectedResource.id] || 0;

    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedResource(null)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" style={{ fontSize: "13px" }}>
          <ArrowLeft className="w-4 h-4" /> Quay lại Thư viện
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="h-1.5" style={{ backgroundColor: tc.color }} />
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tc.bg }}>
                    <TIcon className="w-7 h-7" style={{ color: tc.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: tc.color, backgroundColor: tc.bg }}>{tc.label}</span>
                      {!selectedResource.approved && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded" style={{ fontSize: "10px", fontWeight: 600 }}>Chờ duyệt</span>}
                      {selectedResource.featured && <span className="flex items-center gap-0.5 text-[#c8a84e]" style={{ fontSize: "10px", fontWeight: 600 }}><Star className="w-3 h-3 fill-[#c8a84e]" /> Nổi bật</span>}
                    </div>
                    <h2 className="text-foreground">{selectedResource.title}</h2>
                    <p className="text-muted-foreground mt-2" style={{ fontSize: "14px", lineHeight: 1.7 }}>{selectedResource.description}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {selectedResource.tags.map(t => <span key={t} className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "10px" }}>#{t}</span>)}
                </div>

                {/* Stats bar */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border flex-wrap">
                  <button onClick={() => toggleLike(selectedResource.id)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${isLiked ? "text-[#e74c3c]" : "text-muted-foreground hover:text-[#e74c3c]"}`} style={{ fontSize: "13px" }}>
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-[#e74c3c]" : ""}`} /> {selectedResource.likes + (isLiked ? 0 : 0)}
                  </button>
                  <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "13px" }}><Eye className="w-4 h-4" /> {selectedResource.views.toLocaleString()}</span>
                  <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "13px" }}><Download className="w-4 h-4" /> {selectedResource.downloads.toLocaleString()}</span>
                  <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "13px" }}><MessageCircle className="w-4 h-4" /> {selectedResource.comments.length}</span>
                  <button onClick={() => toggleBookmark(selectedResource.id)}
                    className={`flex items-center gap-1 transition-colors cursor-pointer ${selectedResource.bookmarked ? "text-[#c8a84e]" : "text-muted-foreground hover:text-[#c8a84e]"}`} style={{ fontSize: "13px" }}>
                    {selectedResource.bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />} Lưu
                  </button>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedResource.approved && (
                    <button onClick={() => handleDownload(selectedResource)} className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
                      <Download className="w-4 h-4" /> Tải xuống
                    </button>
                  )}
                  {isAdmin && !selectedResource.approved && (
                    <>
                      <button onClick={() => handleApprove(selectedResource)} className="flex items-center gap-2 px-4 py-2.5 bg-[#16a34a] text-white rounded-lg hover:bg-[#16a34a]/90 cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
                        <Check className="w-4 h-4" /> Phê duyệt
                      </button>
                      <button onClick={() => handleReject(selectedResource)} className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 cursor-pointer" style={{ fontSize: "13px" }}>
                        <X className="w-4 h-4" /> Từ chối
                      </button>
                    </>
                  )}
                  {isAdmin && selectedResource.approved && (
                    <button onClick={() => handleToggleFeatured(selectedResource)} className="flex items-center gap-2 px-3 py-2.5 border border-border rounded-lg hover:bg-secondary cursor-pointer" style={{ fontSize: "13px" }}>
                      <Star className={`w-4 h-4 ${selectedResource.featured ? "fill-[#c8a84e] text-[#c8a84e]" : ""}`} /> {selectedResource.featured ? "Bỏ nổi bật" : "Đánh dấu nổi bật"}
                    </button>
                  )}
                  {(isAdmin || selectedResource.author === userName) && (
                    <button onClick={() => handleDelete(selectedResource)} className="flex items-center gap-2 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer" style={{ fontSize: "13px" }}>
                      <Trash2 className="w-4 h-4" /> Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Inline Preview */}
            {["video", "audio", "slide", "infographic", "pdf", "ebook"].includes(selectedResource.type) && (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                  <h3 className="text-foreground flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
                    <Play className="w-4 h-4 text-[#990803]" /> Xem trước
                  </h3>
                </div>
                <ContentPreview type={selectedResource.type === "infographic" ? "image" : selectedResource.type === "ebook" ? "document" : selectedResource.type} title={selectedResource.title} inline />
              </div>
            )}

            {/* Comments */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Bình luận ({selectedResource.comments.length})</h3>
              {selectedResource.comments.length === 0 ? (
                <EmptyState variant="empty" title="Chưa có bình luận" message="Hãy là người đầu tiên chia sẻ nhận xét!" compact />
              ) : (
                <div className="space-y-3 mb-4">
                  {selectedResource.comments.map(c => {
                    const cLiked = likedComments.has(c.id);
                    return (
                      <div key={c.id} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${c.authorRole === "admin" ? "bg-[#990803]" : c.authorRole === "instructor" ? "bg-[#c8a84e]" : "bg-gray-400"}`}
                          style={{ fontSize: "10px", fontWeight: 700 }}>{getInitials(c.author)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{c.author}</span>
                            <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{new Date(c.createdAt).toLocaleDateString("vi-VN")}</span>
                          </div>
                          <p className="text-foreground" style={{ fontSize: "13px", lineHeight: 1.6 }}>{c.content}</p>
                          <button onClick={() => { setLikedComments(prev => { const n = new Set(prev); if (n.has(c.id)) n.delete(c.id); else n.add(c.id); return n; }); }}
                            className={`flex items-center gap-1 mt-1.5 cursor-pointer transition-colors ${cLiked ? "text-[#e74c3c]" : "text-muted-foreground hover:text-[#e74c3c]"}`} style={{ fontSize: "11px" }}>
                            <ThumbsUp className={`w-3 h-3 ${cLiked ? "fill-[#e74c3c]" : ""}`} /> {c.likes + (cLiked ? 1 : 0)}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Add comment */}
              <div className="flex items-start gap-3 pt-3 border-t border-border">
                <div className="w-8 h-8 rounded-full bg-[#990803] flex items-center justify-center text-white shrink-0" style={{ fontSize: "10px", fontWeight: 700 }}>{getInitials(userName)}</div>
                <div className="flex-1">
                  <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Viết bình luận..."
                    className="w-full p-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" rows={2} style={{ fontSize: "13px", resize: "vertical" }} />
                  <div className="flex justify-end mt-1.5">
                    <button disabled={!newComment.trim()} onClick={handleAddComment}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 disabled:opacity-50 cursor-pointer" style={{ fontSize: "12px" }}>
                      <MessageCircle className="w-3.5 h-3.5" /> Gửi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Meta */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>Thông tin</h4>
              {[
                { label: "Tác giả", value: selectedResource.author },
                { label: "Đơn vị", value: selectedResource.subsidiary },
                { label: "Danh mục", value: selectedResource.category },
                { label: "Dung lượng", value: `${selectedResource.size}${selectedResource.duration ? ` • ${selectedResource.duration}` : ""}` },
                { label: "Ngày tải lên", value: new Date(selectedResource.uploadDate).toLocaleDateString("vi-VN") },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{m.label}</span>
                  <span className="text-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>{m.value}</span>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h4 className="text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Đánh giá</h4>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-foreground" style={{ fontSize: "28px", fontWeight: 700 }}>{selectedResource.rating || "—"}</span>
                <div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(selectedResource.rating) ? "fill-[#c8a84e] text-[#c8a84e]" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{selectedResource.ratingCount} đánh giá</p>
                </div>
              </div>
              {/* User rating */}
              <p className="text-muted-foreground mb-1.5" style={{ fontSize: "11px" }}>Đánh giá của bạn:</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => handleRating(selectedResource.id, s)} className="cursor-pointer p-0.5">
                    <Star className={`w-5 h-5 transition-colors ${s <= currentRating ? "fill-[#c8a84e] text-[#c8a84e]" : "text-gray-200 hover:text-[#c8a84e]"}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Related */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h4 className="text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Tài liệu liên quan</h4>
              <div className="space-y-2">
                {resources.filter(r => r.id !== selectedResource.id && r.approved && r.category === selectedResource.category).slice(0, 3).map(r => {
                  const rtc = TYPE_CONFIG[r.type];
                  return (
                    <div key={r.id} onClick={() => viewResource(r)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary cursor-pointer">
                      <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: rtc.bg }}>
                        <rtc.icon className="w-3.5 h-3.5" style={{ color: rtc.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate" style={{ fontSize: "11px", fontWeight: 500 }}>{r.title}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{r.author}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Library View ───
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Library className="w-6 h-6 text-[#990803]" />
            <h1 className="text-foreground">Thư viện Học liệu</h1>
          </div>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
            {isAdmin ? "Quản lý toàn bộ tài liệu đào tạo của Tập đoàn" : isInstructor ? "Chia sẻ tài liệu giảng dạy và tham khảo" : "Khám phá tài liệu học tập và tham khảo"}
          </p>
        </div>
        {(isAdmin || isInstructor) && (
          <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors shrink-0 cursor-pointer" style={{ fontSize: "14px" }}>
            <Upload className="w-4 h-4" /> Tải lên tài liệu
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Tài liệu", value: totalApproved, icon: FileText, color: "#990803" },
          { label: "Lượt tải", value: totalDownloads.toLocaleString(), icon: Download, color: "#2563eb" },
          { label: "Đánh giá TB", value: avgRating, icon: Star, color: "#c8a84e" },
          ...(isAdmin
            ? [{ label: "Chờ duyệt", value: pendingCount, icon: Clock, color: "#ea580c" }]
            : [{ label: "Đã lưu", value: bookmarkedCount, icon: Bookmark, color: "#c8a84e" }]),
          { label: "Thể loại", value: Object.keys(TYPE_CONFIG).length, icon: Layers, color: "#7c3aed" },
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

      {/* Pending banner */}
      {isAdmin && pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-amber-700" style={{ fontSize: "13px", fontWeight: 500 }}>{pendingCount} tài liệu đang chờ phê duyệt</span>
          </div>
          <button onClick={() => setFilterStatus("pending")} className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>Xem & Duyệt</button>
        </div>
      )}

      {/* Main area with sidebar */}
      <div className="flex gap-4">
        {/* Collections sidebar */}
        <div className="w-48 shrink-0 hidden lg:block">
          <div className="bg-card rounded-xl border border-border p-2 space-y-0.5 sticky top-4">
            <p className="px-3 py-1 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase" }}>Bộ sưu tập</p>
            {COLLECTIONS.map(c => (
              <button key={c.id} onClick={() => setSelectedCollection(c.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${selectedCollection === c.id ? "bg-[#990803]/10 text-[#990803]" : "text-foreground hover:bg-secondary"}`}
                style={{ fontSize: "12px" }}>
                <span>{c.icon}</span>
                <span className="flex-1 truncate" style={{ fontWeight: selectedCollection === c.id ? 600 : 400 }}>{c.name}</span>
                <span className="text-muted-foreground shrink-0" style={{ fontSize: "10px" }}>{collectionCounts[c.id as keyof typeof collectionCounts] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tài liệu, tag, tác giả..."
                  className="w-full pl-9 pr-4 py-2 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "12px" }} />
              </div>
              <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "12px" }}>
                <option value="all">Tất cả loại</option>
                {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-2 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "12px" }}>
                <option value="all">Tất cả lĩnh vực</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {isAdmin && (
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)} className="px-3 py-2 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "12px" }}>
                  <option value="all">Tất cả trạng thái</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="pending">Chờ duyệt</option>
                </select>
              )}
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="px-3 py-2 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "12px" }}>
                <option value="recent">Mới nhất</option>
                <option value="popular">Nhiều xem nhất</option>
                <option value="downloads">Nhiều tải nhất</option>
                <option value="rating">Đánh giá cao</option>
              </select>
              <div className="flex items-center border border-border rounded-lg overflow-hidden ml-auto">
                <button onClick={() => setViewMode("grid")} className={`p-2 cursor-pointer ${viewMode === "grid" ? "bg-[#990803] text-white" : "text-muted-foreground hover:bg-secondary"}`}><Grid3X3 className="w-3.5 h-3.5" /></button>
                <button onClick={() => setViewMode("list")} className={`p-2 cursor-pointer ${viewMode === "list" ? "bg-[#990803] text-white" : "text-muted-foreground hover:bg-secondary"}`}><List className="w-3.5 h-3.5" /></button>
              </div>
              <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{filtered.length} kết quả</span>
            </div>
          </div>

          {/* Featured section */}
          {selectedCollection === "all" && !search && filterType === "all" && filterCat === "all" && (
            <div className="bg-gradient-to-r from-[#990803]/5 via-[#c8a84e]/5 to-transparent rounded-xl border border-[#990803]/10 p-4">
              <h3 className="text-foreground flex items-center gap-1.5 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
                <Star className="w-4 h-4 text-[#c8a84e]" /> Tài liệu Nổi bật
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                {resources.filter(r => r.featured && r.approved).map(r => {
                  const rtc = TYPE_CONFIG[r.type];
                  return (
                    <div key={r.id} onClick={() => viewResource(r)}
                      className="bg-card rounded-lg border border-border p-3 hover:shadow-sm cursor-pointer transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: rtc.bg }}>
                          <rtc.icon className="w-4 h-4" style={{ color: rtc.color }} />
                        </div>
                        <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: rtc.color, backgroundColor: rtc.bg }}>{rtc.label}</span>
                      </div>
                      <h4 className="text-foreground line-clamp-2" style={{ fontSize: "12px", fontWeight: 600 }}>{r.title}</h4>
                      <div className="flex items-center gap-2 mt-2 text-muted-foreground" style={{ fontSize: "10px" }}>
                        {r.rating > 0 && <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-[#c8a84e] fill-[#c8a84e]" /> {r.rating}</span>}
                        <span>{r.downloads.toLocaleString()} tải</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resource items */}
          {filtered.length === 0 ? (
            <EmptyState variant={search ? "search" : "empty"} title="Không tìm thấy tài liệu" message={search ? `Không có kết quả cho "${search}"` : "Chưa có tài liệu nào phù hợp"}
              action={search ? { label: "Xóa bộ lọc", onClick: () => { setSearch(""); setFilterType("all"); setFilterCat("all"); setFilterStatus("all"); } } : undefined} />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(r => (
                <ResourceCard key={r.id} resource={r} isAdmin={isAdmin} isLiked={likedResources.has(r.id)}
                  selected={selectedIds.has(r.id)} onToggleSelect={() => toggleSelect(r.id)}
                  onView={() => viewResource(r)} onBookmark={() => toggleBookmark(r.id)} onLike={() => toggleLike(r.id)}
                  onDownload={() => handleDownload(r)} onApprove={() => handleApprove(r)} onPreview={() => setPreviewResource(r)} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(r => (
                <ResourceListRow key={r.id} resource={r} isAdmin={isAdmin} isLiked={likedResources.has(r.id)}
                  selected={selectedIds.has(r.id)} onToggleSelect={() => toggleSelect(r.id)}
                  onView={() => viewResource(r)} onBookmark={() => toggleBookmark(r.id)} onLike={() => toggleLike(r.id)}
                  onDownload={() => handleDownload(r)} onApprove={() => handleApprove(r)} onReject={() => handleReject(r)}
                  onDelete={() => handleDelete(r)} onPreview={() => setPreviewResource(r)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-[#990803]/5 to-transparent rounded-t-2xl">
              <div className="flex items-center gap-2"><Upload className="w-5 h-5 text-[#990803]" /><h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>Tải lên Tài liệu</h3></div>
              <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-secondary rounded-lg cursor-pointer"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-4">
              {!isAdmin && (
                <div className="p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-blue-700" style={{ fontSize: "11px" }}>Tài liệu sẽ được gửi đến Admin để phê duyệt trước khi xuất bản trong thư viện.</p>
                </div>
              )}
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Tiêu đề <span className="text-red-500">*</span></label>
                <input type="text" value={uploadForm.title} onChange={e => setUploadForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Nhập tiêu đề tài liệu..." className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px" }} />
              </div>
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Mô tả</label>
                <textarea value={uploadForm.description} onChange={e => setUploadForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Mô tả nội dung tài liệu..." className="w-full p-3 bg-input-background rounded-lg border border-border focus:outline-none" rows={3} style={{ fontSize: "13px", resize: "vertical" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Loại tài liệu</label>
                  <select value={uploadForm.type} onChange={e => setUploadForm(p => ({ ...p, type: e.target.value as Resource["type"] }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }}>
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Lĩnh vực</label>
                  <select value={uploadForm.category} onChange={e => setUploadForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Tags</label>
                <input type="text" value={uploadForm.tags} onChange={e => setUploadForm(p => ({ ...p, tags: e.target.value }))}
                  placeholder="VD: Excel, Template, Tài chính (phân cách dấu phẩy)" className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
              </div>
              <FileUploadZone maxSizeMB={500} maxFiles={5} />
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
              <button onClick={handleUpload} className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
                <Upload className="w-4 h-4" /> {isAdmin ? "Tải lên" : "Gửi phê duyệt"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewResource && (
        <ContentPreview
          type={previewResource.type === "infographic" ? "image" : previewResource.type === "ebook" ? "document" : previewResource.type}
          title={previewResource.title}
          onClose={() => setPreviewResource(null)}
        />
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
          <button onClick={bulkFeature} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c8a84e] text-white rounded-lg hover:bg-[#c8a84e]/90 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Star className="w-3.5 h-3.5" /> Nổi bật
          </button>
          <button onClick={bulkDelete} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Trash2 className="w-3.5 h-3.5" /> Xóa
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Resource Card (Grid) ───
function ResourceCard({ resource: r, isAdmin, isLiked, selected, onToggleSelect, onView, onBookmark, onLike, onDownload, onApprove, onPreview }: {
  resource: Resource; isAdmin: boolean; isLiked: boolean;
  selected: boolean; onToggleSelect: () => void;
  onView: () => void; onBookmark: () => void; onLike: () => void; onDownload: () => void; onApprove: () => void; onPreview: () => void;
}) {
  const tc = TYPE_CONFIG[r.type];
  const TIcon = tc.icon;
  return (
    <div className={`bg-card rounded-xl border overflow-hidden hover:shadow-md transition-all group ${selected ? "border-[#990803]/30 bg-[#990803]/[0.02]" : !r.approved ? "border-amber-200" : "border-border"}`}>
      <div className="h-1.5" style={{ backgroundColor: tc.color + "30" }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <button onClick={e => { e.stopPropagation(); onToggleSelect(); }} className="shrink-0 cursor-pointer p-0.5">
                {selected ? <SquareCheck className="w-4 h-4 text-[#990803]" /> : <Square className="w-4 h-4 text-muted-foreground/20 group-hover:text-muted-foreground/50" />}
              </button>
            )}
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: tc.bg }}>
              <TIcon className="w-4 h-4" style={{ color: tc.color }} />
            </div>
            <div>
              <span style={{ fontSize: "9px", fontWeight: 600, color: tc.color }}>{tc.label}</span>
              {r.featured && <Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e] inline ml-1" />}
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {!r.approved && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded" style={{ fontSize: "8px", fontWeight: 600 }}>Chờ duyệt</span>}
            <button onClick={e => { e.stopPropagation(); onPreview(); }} className="p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" title="Xem trước">
              <Play className="w-3.5 h-3.5 text-muted-foreground/30 hover:text-[#990803]" />
            </button>
            <button onClick={e => { e.stopPropagation(); onBookmark(); }} className="p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              {r.bookmarked ? <BookmarkCheck className="w-3.5 h-3.5 text-[#c8a84e]" /> : <Bookmark className="w-3.5 h-3.5 text-muted-foreground/30 hover:text-[#c8a84e]" />}
            </button>
          </div>
        </div>

        <div className="cursor-pointer" onClick={onView}>
          <h4 className="text-foreground line-clamp-2 group-hover:text-[#990803] transition-colors" style={{ fontSize: "12px", fontWeight: 600 }}>{r.title}</h4>
          <p className="text-muted-foreground mt-1 line-clamp-2" style={{ fontSize: "10px" }}>{r.description}</p>
          <p className="text-muted-foreground mt-1.5" style={{ fontSize: "10px" }}>{r.author} • {r.subsidiary}</p>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {r.tags.slice(0, 2).map(t => <span key={t} className="px-1.5 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "9px" }}>#{t}</span>)}
          {r.tags.length > 2 && <span className="text-muted-foreground" style={{ fontSize: "9px" }}>+{r.tags.length - 2}</span>}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-muted-foreground" style={{ fontSize: "10px" }}>
          <div className="flex items-center gap-2">
            {r.rating > 0 && <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-[#c8a84e] fill-[#c8a84e]" /> {r.rating}</span>}
            <span className="flex items-center gap-0.5"><Download className="w-2.5 h-2.5" /> {r.downloads}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={e => { e.stopPropagation(); onLike(); }} className={`cursor-pointer ${isLiked ? "text-[#e74c3c]" : "hover:text-[#e74c3c]"}`}>
              <Heart className={`w-3 h-3 ${isLiked ? "fill-[#e74c3c]" : ""}`} />
            </button>
            <span>{r.likes}</span>
          </div>
        </div>

        {isAdmin && !r.approved && (
          <button onClick={e => { e.stopPropagation(); onApprove(); }}
            className="w-full mt-3 py-2 bg-[#16a34a] text-white rounded-lg hover:bg-[#16a34a]/90 cursor-pointer" style={{ fontSize: "11px", fontWeight: 600 }}>Phê duyệt</button>
        )}
      </div>
    </div>
  );
}

// ─── Resource List Row ───
function ResourceListRow({ resource: r, isAdmin, isLiked, selected, onToggleSelect, onView, onBookmark, onLike, onDownload, onApprove, onReject, onDelete, onPreview }: {
  resource: Resource; isAdmin: boolean; isLiked: boolean;
  selected: boolean; onToggleSelect: () => void;
  onView: () => void; onBookmark: () => void; onLike: () => void; onDownload: () => void;
  onApprove: () => void; onReject: () => void; onDelete: () => void; onPreview: () => void;
}) {
  const tc = TYPE_CONFIG[r.type];
  const TIcon = tc.icon;
  return (
    <div className={`bg-card rounded-xl border p-4 flex items-center gap-3 hover:shadow-sm transition-all group ${selected ? "border-[#990803]/30 bg-[#990803]/[0.02]" : !r.approved ? "border-amber-200" : "border-border"}`}>
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
          <h4 className="text-foreground truncate group-hover:text-[#990803] transition-colors" style={{ fontSize: "13px", fontWeight: 600 }}>{r.title}</h4>
          {!r.approved && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded shrink-0" style={{ fontSize: "8px", fontWeight: 600 }}>Chờ duyệt</span>}
          {r.featured && <Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e] shrink-0" />}
        </div>
        <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>{r.category} • {r.author} • {r.subsidiary} • {r.size}{r.duration ? ` • ${r.duration}` : ""}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0 text-muted-foreground" style={{ fontSize: "11px" }}>
        {r.rating > 0 && <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" /> {r.rating}</span>}
        <span className="flex items-center gap-0.5"><Download className="w-3 h-3" /> {r.downloads}</span>
        <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {r.views}</span>
        <button onClick={e => { e.stopPropagation(); onLike(); }} className={`cursor-pointer flex items-center gap-0.5 ${isLiked ? "text-[#e74c3c]" : "hover:text-[#e74c3c]"}`}>
          <Heart className={`w-3 h-3 ${isLiked ? "fill-[#e74c3c]" : ""}`} /> {r.likes}
        </button>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={e => { e.stopPropagation(); onPreview(); }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-[#990803] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" title="Xem trước">
          <Play className="w-4 h-4" />
        </button>
        <button onClick={e => { e.stopPropagation(); onBookmark(); }} className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
          {r.bookmarked ? <BookmarkCheck className="w-4 h-4 text-[#c8a84e]" /> : <Bookmark className="w-4 h-4 text-muted-foreground/30" />}
        </button>
        {r.approved && (
          <button onClick={e => { e.stopPropagation(); onDownload(); }} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
            <Download className="w-4 h-4" />
          </button>
        )}
        {isAdmin && !r.approved && (
          <>
            <button onClick={e => { e.stopPropagation(); onApprove(); }} className="px-2.5 py-1 bg-[#16a34a] text-white rounded-lg hover:bg-[#16a34a]/90 cursor-pointer" style={{ fontSize: "10px", fontWeight: 600 }}>Duyệt</button>
            <button onClick={e => { e.stopPropagation(); onReject(); }} className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 cursor-pointer" style={{ fontSize: "10px", fontWeight: 600 }}>Từ chối</button>
          </>
        )}
        {isAdmin && r.approved && (
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
