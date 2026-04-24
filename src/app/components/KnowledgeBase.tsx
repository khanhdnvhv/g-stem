import { useState } from "react";
import {
  BookMarked, Search, Plus, Edit, Trash2, Eye, Clock, Star,
  ChevronRight, FolderTree, FileText, Tag, ThumbsUp, MessageCircle,
  Lock, Globe, Users, Building2, Bookmark, BookmarkCheck,
  ArrowUp, ArrowDown, Filter, TrendingUp, Award, History,
  ChevronDown, ExternalLink,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { EmptyState } from "./EmptyState";

// ─── Types ───
interface WikiArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  subcategory: string;
  author: string;
  authorRole: "admin" | "instructor" | "learner";
  authorInitials: string;
  subsidiary: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  pinned: boolean;
  bookmarked: boolean;
  visibility: "public" | "internal" | "restricted";
  status: "published" | "draft" | "review";
  version: number;
}

interface WikiCategory {
  id: string;
  name: string;
  icon: string;
  articleCount: number;
  color: string;
}

// ─── Mock Data ───
const CATEGORIES: WikiCategory[] = [
  { id: "cat1", name: "Quy trình & Quy định", icon: "📋", articleCount: 45, color: "#990803" },
  { id: "cat2", name: "Hướng dẫn Nghiệp vụ", icon: "📖", articleCount: 78, color: "#2563eb" },
  { id: "cat3", name: "Chính sách Nhân sự", icon: "👥", articleCount: 32, color: "#7c3aed" },
  { id: "cat4", name: "Công nghệ & IT", icon: "💻", articleCount: 56, color: "#0891b2" },
  { id: "cat5", name: "Kiến thức Chuyên ngành", icon: "🎓", articleCount: 124, color: "#16a34a" },
  { id: "cat6", name: "Best Practices", icon: "⭐", articleCount: 67, color: "#c8a84e" },
  { id: "cat7", name: "FAQ & Troubleshooting", icon: "❓", articleCount: 89, color: "#ea580c" },
  { id: "cat8", name: "Onboarding & Hội nhập", icon: "🚀", articleCount: 23, color: "#ec4899" },
];

const ARTICLES: WikiArticle[] = [
  {
    id: "W01", title: "Quy trình Phê duyệt Khóa học Mới", summary: "Hướng dẫn chi tiết quy trình đề xuất, xây dựng và phê duyệt khóa học đào tạo nội bộ tại Geleximco.",
    content: "", category: "Quy trình & Quy định", subcategory: "Đào tạo", author: "Nguyễn Văn Minh", authorRole: "admin", authorInitials: "NM",
    subsidiary: "VP Tập đoàn", createdAt: "15/01/2026", updatedAt: "10/03/2026", views: 2340, likes: 189, comments: 23,
    tags: ["Quy trình", "Khóa học", "Phê duyệt"], pinned: true, bookmarked: true, visibility: "public", status: "published", version: 5,
  },
  {
    id: "W02", title: "Hướng dẫn Sử dụng Hệ thống LMS Geleximco", summary: "Tài liệu hướng dẫn toàn diện cách sử dụng hệ thống quản lý đào tạo cho cả 3 vai trò: Admin, Giảng viên, Học viên.",
    content: "", category: "Hướng dẫn Nghiệp vụ", subcategory: "LMS", author: "Đỗ Thanh Hương", authorRole: "admin", authorInitials: "TH",
    subsidiary: "VP Tập đoàn", createdAt: "01/01/2026", updatedAt: "12/03/2026", views: 5670, likes: 456, comments: 67,
    tags: ["LMS", "Hướng dẫn", "Người dùng"], pinned: true, bookmarked: false, visibility: "public", status: "published", version: 12,
  },
  {
    id: "W03", title: "Chính sách Đào tạo & Phát triển Nhân sự 2026", summary: "Chính sách toàn diện về đào tạo bắt buộc, tự nguyện, ngân sách, và quyền lợi nhân sự khi tham gia đào tạo.",
    content: "", category: "Chính sách Nhân sự", subcategory: "Đào tạo", author: "Trần Thị Lan", authorRole: "admin", authorInitials: "TL",
    subsidiary: "VP Tập đoàn", createdAt: "05/01/2026", updatedAt: "01/03/2026", views: 3890, likes: 312, comments: 45,
    tags: ["Chính sách", "Đào tạo", "Nhân sự"], pinned: false, bookmarked: true, visibility: "public", status: "published", version: 3,
  },
  {
    id: "W04", title: "Cài đặt VPN và Bảo mật Máy tính Công ty", summary: "Hướng dẫn step-by-step cài đặt VPN, cấu hình bảo mật, và các quy tắc an ninh mạng doanh nghiệp.",
    content: "", category: "Công nghệ & IT", subcategory: "Bảo mật", author: "Ngô Trung Kiên", authorRole: "instructor", authorInitials: "NK",
    subsidiary: "Technology", createdAt: "20/02/2026", updatedAt: "08/03/2026", views: 1890, likes: 167, comments: 34,
    tags: ["VPN", "Bảo mật", "IT"], pinned: false, bookmarked: false, visibility: "internal", status: "published", version: 4,
  },
  {
    id: "W05", title: "Phương pháp Phân tích Tín dụng Doanh nghiệp", summary: "Kiến thức chuyên sâu về phân tích tín dụng, đánh giá rủi ro, và ra quyết định cho vay doanh nghiệp.",
    content: "", category: "Kiến thức Chuyên ngành", subcategory: "Ngân hàng", author: "Phạm Thị Hoa", authorRole: "instructor", authorInitials: "PH",
    subsidiary: "ABBank", createdAt: "10/02/2026", updatedAt: "05/03/2026", views: 1230, likes: 98, comments: 18,
    tags: ["Tín dụng", "Phân tích", "Ngân hàng"], pinned: false, bookmarked: false, visibility: "internal", status: "published", version: 2,
  },
  {
    id: "W06", title: "Best Practices: Quản lý Dự án BĐS", summary: "Tổng hợp best practices từ các dự án BĐS thành công của Geleximco, bao gồm KĐT An Khánh, Lê Trọng Tấn.",
    content: "", category: "Best Practices", subcategory: "BĐS", author: "Lê Quốc Vương", authorRole: "instructor", authorInitials: "LV",
    subsidiary: "Geleximco Land", createdAt: "25/01/2026", updatedAt: "28/02/2026", views: 2100, likes: 234, comments: 41,
    tags: ["BĐS", "Dự án", "Best Practices"], pinned: false, bookmarked: false, visibility: "public", status: "published", version: 3,
  },
  {
    id: "W07", title: "FAQ: Các Câu hỏi Thường gặp về Chế độ Bảo hiểm", summary: "Tổng hợp câu hỏi và trả lời thường gặp về BHXH, BHYT, BHTN và các chế độ phúc lợi tại Geleximco.",
    content: "", category: "FAQ & Troubleshooting", subcategory: "Nhân sự", author: "Bùi Thị Hà", authorRole: "admin", authorInitials: "BH",
    subsidiary: "Insurance", createdAt: "15/02/2026", updatedAt: "10/03/2026", views: 4560, likes: 389, comments: 78,
    tags: ["FAQ", "Bảo hiểm", "Phúc lợi"], pinned: false, bookmarked: false, visibility: "public", status: "published", version: 8,
  },
  {
    id: "W08", title: "Chương trình Onboarding cho Nhân viên Mới 2026", summary: "Hướng dẫn chi tiết chương trình hội nhập 30-60-90 ngày dành cho nhân viên mới tại tất cả đơn vị.",
    content: "", category: "Onboarding & Hội nhập", subcategory: "Nhân sự", author: "Đỗ Thanh Hương", authorRole: "admin", authorInitials: "TH",
    subsidiary: "VP Tập đoàn", createdAt: "01/01/2026", updatedAt: "05/03/2026", views: 3450, likes: 278, comments: 56,
    tags: ["Onboarding", "30-60-90", "Hội nhập"], pinned: true, bookmarked: false, visibility: "public", status: "published", version: 6,
  },
  {
    id: "W09", title: "[Nháp] Quy trình Đánh giá Năng lực 360°", summary: "Bản nháp quy trình đánh giá năng lực 360 độ áp dụng cho quản lý cấp trung trở lên.",
    content: "", category: "Quy trình & Quy định", subcategory: "Đánh giá", author: "Nguyễn Văn Minh", authorRole: "admin", authorInitials: "NM",
    subsidiary: "VP Tập đoàn", createdAt: "10/03/2026", updatedAt: "12/03/2026", views: 45, likes: 5, comments: 2,
    tags: ["360°", "Đánh giá", "Năng lực"], pinned: false, bookmarked: false, visibility: "restricted", status: "draft", version: 1,
  },
  {
    id: "W10", title: "[Chờ duyệt] Hướng dẫn SEO cho Website BĐS", summary: "Chia sẻ kinh nghiệm tối ưu SEO cho các trang web bất động sản của tập đoàn.",
    content: "", category: "Kiến thức Chuyên ngành", subcategory: "Marketing", author: "Phạm Anh Tuấn", authorRole: "instructor", authorInitials: "PT",
    subsidiary: "BĐS Geleximco", createdAt: "11/03/2026", updatedAt: "11/03/2026", views: 23, likes: 3, comments: 1,
    tags: ["SEO", "BĐS", "Marketing"], pinned: false, bookmarked: false, visibility: "public", status: "review", version: 1,
  },
];

const VISIBILITY_CONFIG = {
  public: { label: "Công khai", icon: Globe, color: "#16a34a" },
  internal: { label: "Nội bộ", icon: Building2, color: "#2563eb" },
  restricted: { label: "Hạn chế", icon: Lock, color: "#ea580c" },
};

const STATUS_CONFIG = {
  published: { label: "Đã xuất bản", color: "#16a34a", bg: "#16a34a10" },
  draft: { label: "Bản nháp", color: "#6b7280", bg: "#6b728010" },
  review: { label: "Chờ duyệt", color: "#ea580c", bg: "#ea580c10" },
};

export function KnowledgeBase() {
  const { user } = useAuth();
  const role = user?.role || "learner";
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "likes">("recent");
  const [articles, setArticles] = useState(ARTICLES);
  const [showEditor, setShowEditor] = useState(false);

  const toggleBookmark = (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, bookmarked: !a.bookmarked } : a));
  };

  const filtered = articles.filter(a => {
    if (role === "learner" && a.status !== "published") return false;
    if (role === "instructor" && a.status === "draft" && a.author !== user?.name) return false;
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (selectedCategory && a.category !== selectedCategory) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }).sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (sortBy === "popular") return b.views - a.views;
    if (sortBy === "likes") return b.likes - a.likes;
    return 0;
  });

  const totalArticles = articles.filter(a => a.status === "published").length;
  const totalViews = articles.reduce((s, a) => s + a.views, 0);
  const reviewCount = articles.filter(a => a.status === "review").length;

  if (selectedArticle) {
    return <ArticleView article={selectedArticle} role={role} onBack={() => setSelectedArticle(null)} onBookmark={toggleBookmark} onSelectArticle={setSelectedArticle} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Wiki Nội bộ</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            {role === "admin" ? "Quản lý tri thức toàn Tập đoàn — 514 bài viết" :
             role === "instructor" ? "Chia sẻ kiến thức chuyên môn với đồng nghiệp" :
             "Tra cứu kiến thức, quy trình và hướng dẫn"}
          </p>
        </div>
        {(role === "admin" || role === "instructor") && (
          <button onClick={() => setShowEditor(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Tạo bài viết
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#990803]/10 flex items-center justify-center"><FileText className="w-4 h-4 text-[#990803]" /></div>
          <div><p className="text-[#990803]" style={{ fontSize: "18px", fontWeight: 700 }}>{totalArticles}</p><p className="text-gray-400" style={{ fontSize: "10px" }}>Bài viết</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><Eye className="w-4 h-4 text-blue-500" /></div>
          <div><p className="text-blue-600" style={{ fontSize: "18px", fontWeight: 700 }}>{(totalViews / 1000).toFixed(1)}K</p><p className="text-gray-400" style={{ fontSize: "10px" }}>Lượt xem</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#c8a84e]/10 flex items-center justify-center"><FolderTree className="w-4 h-4 text-[#c8a84e]" /></div>
          <div><p className="text-[#c8a84e]" style={{ fontSize: "18px", fontWeight: 700 }}>{CATEGORIES.length}</p><p className="text-gray-400" style={{ fontSize: "10px" }}>Danh mục</p></div>
        </div>
        {role === "admin" ? (
          <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center"><Clock className="w-4 h-4 text-orange-500" /></div>
            <div><p className="text-orange-600" style={{ fontSize: "18px", fontWeight: 700 }}>{reviewCount}</p><p className="text-gray-400" style={{ fontSize: "10px" }}>Chờ duyệt</p></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center"><ThumbsUp className="w-4 h-4 text-green-500" /></div>
            <div><p className="text-green-600" style={{ fontSize: "18px", fontWeight: 700 }}>{articles.reduce((s, a) => s + a.likes, 0).toLocaleString()}</p><p className="text-gray-400" style={{ fontSize: "10px" }}>Lượt thích</p></div>
          </div>
        )}
      </div>

      {/* Categories Grid */}
      <div>
        <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Danh mục</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
              className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all hover:shadow-md ${selectedCategory === cat.name ? "border-[#990803] bg-[#990803]/5 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
            >
              <span style={{ fontSize: "20px" }}>{cat.icon}</span>
              <p className="text-gray-600 mt-1 line-clamp-1" style={{ fontSize: "10px", fontWeight: 500 }}>{cat.name}</p>
              <p className="text-gray-300" style={{ fontSize: "9px" }}>{cat.articleCount} bài</p>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm bài viết, tag..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
        </div>
        {role === "admin" && (
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
            <option value="review">Chờ duyệt</option>
          </select>
        )}
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
          <option value="recent">Mới nhất</option>
          <option value="popular">Xem nhiều nhất</option>
          <option value="likes">Thích nhiều nhất</option>
        </select>
        {selectedCategory && (
          <button onClick={() => setSelectedCategory(null)} className="px-2 py-1 bg-[#990803]/10 text-[#990803] rounded-full flex items-center gap-1 cursor-pointer" style={{ fontSize: "11px", fontWeight: 500 }}>
            {selectedCategory} <span className="text-[#990803]/50">✕</span>
          </button>
        )}
        <span className="text-gray-400 ml-auto" style={{ fontSize: "11px" }}>{filtered.length} kết quả</span>
      </div>

      {/* Article List */}
      <div className="space-y-2">
        {filtered.map(article => {
          const visCfg = VISIBILITY_CONFIG[article.visibility];
          const stCfg = STATUS_CONFIG[article.status];
          const VisIcon = visCfg.icon;
          return (
            <div key={article.id} onClick={() => setSelectedArticle(article)} className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${article.pinned ? "border-[#c8a84e]/40 bg-[#c8a84e]/3" : "border-gray-200"}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {article.pinned && <span className="px-1.5 py-0.5 bg-[#c8a84e]/10 text-[#c8a84e] rounded" style={{ fontSize: "9px", fontWeight: 600 }}>📌 Ghim</span>}
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                    <span className="flex items-center gap-0.5 text-gray-400" style={{ fontSize: "9px" }}><VisIcon className="w-2.5 h-2.5" style={{ color: visCfg.color }} /> {visCfg.label}</span>
                    <span className="text-gray-300" style={{ fontSize: "9px" }}>v{article.version}</span>
                  </div>
                  <h4 className="text-gray-800 hover:text-[#990803] transition-colors" style={{ fontSize: "14px", fontWeight: 600 }}>{article.title}</h4>
                  <p className="text-gray-400 mt-0.5 line-clamp-1" style={{ fontSize: "12px" }}>{article.summary}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: "11px" }}>
                      <div className="w-4 h-4 rounded-full bg-[#990803] text-white flex items-center justify-center" style={{ fontSize: "7px", fontWeight: 700 }}>{article.authorInitials}</div>
                      {article.author}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400" style={{ fontSize: "11px" }}>{article.category}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-400" style={{ fontSize: "11px" }}>Cập nhật: {article.updatedAt}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button onClick={e => { e.stopPropagation(); toggleBookmark(article.id); }} className="p-1 cursor-pointer">
                    {article.bookmarked ? <BookmarkCheck className="w-4 h-4 text-[#c8a84e]" /> : <Bookmark className="w-4 h-4 text-gray-200 hover:text-gray-400" />}
                  </button>
                  <div className="flex items-center gap-2.5 text-gray-400" style={{ fontSize: "10px" }}>
                    <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {article.views.toLocaleString()}</span>
                    <span className="flex items-center gap-0.5"><ThumbsUp className="w-3 h-3" /> {article.likes}</span>
                    <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3" /> {article.comments}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {article.tags.slice(0, 3).map(t => (
                      <span key={t} className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded" style={{ fontSize: "8px" }}>#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          variant={search ? "search" : "empty"}
          title="Không tìm thấy bài viết nào"
          message={search ? `Không có kết quả cho "${search}"` : "Chưa có bài viết nào trong danh mục này"}
          action={search ? { label: "Xóa bộ lọc", onClick: () => { setSearch(""); setFilterStatus("all"); } } : undefined}
        />
      )}

      {/* Editor Modal */}
      {showEditor && <EditorModal onClose={() => setShowEditor(false)} />}
    </div>
  );
}

// ─── Article View ───
function ArticleView({ article, role, onBack, onBookmark, onSelectArticle }: { article: WikiArticle; role: string; onBack: () => void; onBookmark: (id: string) => void; onSelectArticle: (a: WikiArticle) => void }) {
  const [liked, setLiked] = useState(false);
  const visCfg = VISIBILITY_CONFIG[article.visibility];
  const VisIcon = visCfg.icon;
  const stCfg = STATUS_CONFIG[article.status];

  // Fake content sections
  const sections = [
    { title: "1. Giới thiệu", content: "Bài viết này cung cấp thông tin chi tiết về " + article.title.toLowerCase() + ". Nội dung được xây dựng dựa trên kinh nghiệm thực tế tại Tập đoàn Geleximco và các đơn vị thành viên." },
    { title: "2. Phạm vi Áp dụng", content: "Áp dụng cho toàn bộ 14 công ty thành viên và 6,610 nhân sự thuộc Tập đoàn Geleximco. Các đơn vị có thể tùy chỉnh theo đặc thù riêng nhưng phải tuân thủ nguyên tắc chung." },
    { title: "3. Nội dung Chi tiết", content: "3.1. Bước đầu tiên là xác định nhu cầu và mục tiêu cụ thể. Cần phân tích kỹ lưỡng dữ liệu hiện tại và đối chiếu với tiêu chuẩn của ngành.\n\n3.2. Tiếp theo, lập kế hoạch triển khai với timeline rõ ràng, phân công trách nhiệm và KPIs đo lường.\n\n3.3. Thực hiện và giám sát tiến độ thường xuyên, điều chỉnh kịp thời khi cần thiết." },
    { title: "4. Lưu ý Quan trọng", content: "• Cần sự phối hợp chặt chẽ giữa các phòng ban liên quan\n• Báo cáo tiến độ định kỳ cho cấp quản lý\n• Tuân thủ đầy đủ quy định pháp luật hiện hành\n• Lưu trữ hồ sơ đầy đủ theo quy định" },
  ];

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1 text-gray-500 hover:text-[#990803] cursor-pointer" style={{ fontSize: "13px" }}>
        <ChevronRight className="w-4 h-4 rotate-180" /> Quay lại
      </button>

      {/* Article header */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {article.pinned && <span className="px-1.5 py-0.5 bg-[#c8a84e]/10 text-[#c8a84e] rounded" style={{ fontSize: "10px", fontWeight: 600 }}>📌 Ghim</span>}
          <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
          <span className="flex items-center gap-0.5" style={{ fontSize: "10px", color: visCfg.color }}><VisIcon className="w-3 h-3" /> {visCfg.label}</span>
          <span className="text-gray-300" style={{ fontSize: "10px" }}>v{article.version}</span>
          <span className="text-gray-300" style={{ fontSize: "10px" }}>{article.category} / {article.subcategory}</span>
        </div>
        <h1 className="text-gray-800" style={{ fontSize: "22px", fontWeight: 700 }}>{article.title}</h1>
        <p className="text-gray-500 mt-1" style={{ fontSize: "14px" }}>{article.summary}</p>

        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#990803] text-white flex items-center justify-center" style={{ fontSize: "9px", fontWeight: 700 }}>{article.authorInitials}</div>
            <div>
              <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{article.author}</p>
              <p className="text-gray-400" style={{ fontSize: "10px" }}>{article.subsidiary}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-400 ml-auto" style={{ fontSize: "11px" }}>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {article.updatedAt}</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {article.views.toLocaleString()}</span>
            <span className="flex items-center gap-1"><History className="w-3.5 h-3.5" /> {article.version} phiên bản</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3">
          <button onClick={() => setLiked(!liked)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${liked ? "border-blue-200 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`} style={{ fontSize: "12px" }}>
            <ThumbsUp className="w-3.5 h-3.5" /> {liked ? article.likes + 1 : article.likes}
          </button>
          <button onClick={() => onBookmark(article.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${article.bookmarked ? "border-[#c8a84e]/30 bg-[#c8a84e]/10 text-[#c8a84e]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`} style={{ fontSize: "12px" }}>
            {article.bookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            {article.bookmarked ? "Đã lưu" : "Lưu"}
          </button>
          {(role === "admin" || article.author === "Phạm Anh Tuấn") && (
            <button onClick={() => { import("sonner").then(m => m.toast.info("Mở trình chỉnh sửa bài viết...")); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px" }}>
              <Edit className="w-3.5 h-3.5" /> Chỉnh sửa
            </button>
          )}
          {role === "admin" && article.status === "review" && (
            <button onClick={() => { import("sonner").then(m => m.toast.success(`Đã phê duyệt "${article.title}"`)); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer ml-auto" style={{ fontSize: "12px", fontWeight: 600 }}>Phê duyệt</button>
          )}
        </div>
      </div>

      {/* Article content */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="space-y-5">
          {sections.map((s, i) => (
            <div key={i}>
              <h3 className="text-gray-700 mb-2" style={{ fontSize: "15px", fontWeight: 600 }}>{s.title}</h3>
              <div className="text-gray-600 whitespace-pre-line" style={{ fontSize: "13px", lineHeight: "1.7" }}>{s.content}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags + Related */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map(t => (
              <span key={t} className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-100" style={{ fontSize: "11px" }}>#{t}</span>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Bài viết Liên quan</h3>
          <div className="space-y-1.5">
            {ARTICLES.filter(a => a.id !== article.id && a.category === article.category && a.status === "published").slice(0, 3).map(a => (
              <div key={a.id} onClick={() => onSelectArticle(a)} className="text-gray-500 hover:text-[#990803] cursor-pointer" style={{ fontSize: "12px" }}>
                <ChevronRight className="w-3 h-3 inline mr-1" />{a.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Editor Modal ───
function EditorModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <h3 className="text-gray-800 flex items-center gap-2" style={{ fontSize: "16px", fontWeight: 700 }}>
            <Edit className="w-5 h-5 text-[#990803]" /> Tạo bài viết Wiki
          </h3>
          <div className="space-y-3 mt-4">
            <div>
              <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Tiêu đề *</label>
              <input className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} placeholder="VD: Hướng dẫn Quy trình..." />
            </div>
            <div>
              <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Tóm tắt</label>
              <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20 resize-none" style={{ fontSize: "13px" }} rows={2} placeholder="Mô tả ngắn gọn nội dung bài viết..." />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Danh mục</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
                  {CATEGORIES.map(c => <option key={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Phạm vi</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
                  <option>Công khai</option><option>Nội bộ</option><option>Hạn chế</option>
                </select>
              </div>
              <div>
                <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Tags</label>
                <input className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none" style={{ fontSize: "12px" }} placeholder="VD: Quy trình, HR" />
              </div>
            </div>
            <div>
              <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Nội dung *</label>
              <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20 resize-none" style={{ fontSize: "13px", fontFamily: "monospace" }} rows={10} placeholder="Viết nội dung bài viết ở đây... (Hỗ trợ Markdown)" />
              <p className="text-gray-300 mt-1" style={{ fontSize: "10px" }}>Hỗ trợ Markdown: **bold**, *italic*, # Heading, - List...</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
            <button onClick={() => { import("sonner").then(m => m.toast.info("Đã lưu bản nháp!")); }} className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 cursor-pointer" style={{ fontSize: "13px" }}>Lưu nháp</button>
            <button onClick={() => { import("sonner").then(m => m.toast.success("Đã gửi duyệt & xuất bản bài viết!")); }} className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer ml-auto" style={{ fontSize: "13px", fontWeight: 600 }}>Gửi duyệt & Xuất bản</button>
          </div>
        </div>
      </div>
    </div>
  );
}