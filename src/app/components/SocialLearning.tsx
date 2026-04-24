import { useState } from "react";
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  ThumbsUp, Send, Image, FileText, Link2, Video,
  TrendingUp, Users, Award, Star, Clock,
  Search, Filter, Plus, ChevronRight, Eye,
  ArrowUp, Flame, Zap, Target, Globe,
  Hash, AtSign, BookOpen, Lightbulb, Sparkles,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface Post {
  id: string;
  author: { name: string; initials: string; role: string; subsidiary: string; avatar: string };
  type: "share" | "article" | "question" | "achievement" | "tip" | "resource";
  content: string;
  title?: string;
  tags: string[];
  attachments?: { type: "image" | "document" | "link" | "video"; name: string }[];
  likes: number;
  comments: number;
  shares: number;
  views: number;
  isLiked: boolean;
  isBookmarked: boolean;
  createdAt: string;
  featured: boolean;
}

interface TrendingTopic {
  tag: string;
  posts: number;
  trend: number;
}

interface TopContributor {
  name: string;
  initials: string;
  subsidiary: string;
  posts: number;
  likes: number;
  badge: string;
}

// ─── Mock Data ───
const POSTS: Post[] = [
  {
    id: "P01", author: { name: "Trần Thị Hương", initials: "TH", role: "Giảng viên", subsidiary: "VP T��p đoàn", avatar: "🎓" },
    type: "article", title: "5 Xu hướng L&D 2026 mà Geleximco nên áp dụng",
    content: "Sau khi nghiên cứu báo cáo LinkedIn Learning 2026, tôi tổng hợp 5 xu hướng quan trọng nhất: (1) AI-Powered Personalization, (2) Skills-based Organization, (3) Microlearning + Spaced Repetition, (4) Peer-to-Peer Learning, (5) Immersive Learning với VR/AR. Đặc biệt xu hướng số 4 rất phù hợp với mô hình đa ngành của Tập đoàn...",
    tags: ["L&D", "AI", "Xu hướng", "2026"], attachments: [{ type: "document", name: "LD-Trends-2026.pdf" }],
    likes: 48, comments: 12, shares: 8, views: 256, isLiked: true, isBookmarked: false, createdAt: "2 giờ trước", featured: true,
  },
  {
    id: "P02", author: { name: "Nguyễn Văn Minh", initials: "NM", role: "Học viên", subsidiary: "ABBank", avatar: "🏦" },
    type: "achievement",
    content: "🎉 Vừa hoàn thành chứng chỉ 'Phân tích Tài chính Nâng cao' với điểm 95/100! Cảm ơn anh Đức Mạnh đã mentor suốt 3 tháng. Khóa học rất bổ ích cho công việc hàng ngày tại ABBank.",
    tags: ["Chứng chỉ", "Tài chính", "ABBank"],
    likes: 72, comments: 18, shares: 3, views: 420, isLiked: false, isBookmarked: true, createdAt: "4 giờ trước", featured: false,
  },
  {
    id: "P03", author: { name: "Phạm Đức Mạnh", initials: "PM", role: "Admin", subsidiary: "Xi măng TL", avatar: "🏭" },
    type: "question",
    content: "Các anh chị ơi, đơn vị em đang triển khai đào tạo ATLĐ cho 800 công nhân, nhiều người không quen dùng máy tính. Có kinh nghiệm gì về blended learning cho nhóm blue-collar workers không ạ? Em đang cân nhắc giữa video ngắn trên mobile vs lớp hands-on.",
    tags: ["ATLĐ", "Blended Learning", "Blue-collar", "Xi măng"],
    likes: 35, comments: 22, shares: 5, views: 310, isLiked: false, isBookmarked: false, createdAt: "6 giờ trước", featured: false,
  },
  {
    id: "P04", author: { name: "Vũ Thị Mai", initials: "VM", role: "Giảng viên", subsidiary: "Hanel", avatar: "💻" },
    type: "tip", title: "Mẹo tạo video e-learning hấp dẫn với budget thấp",
    content: "Chia sẻ workflow mà team mình đang dùng để tạo video đào tạo chất lượng: (1) Script trên Google Docs, (2) Quay bằng smartphone + gimbal Zhiyun, (3) Edit trên CapCut Pro, (4) Thêm subtitle tự động bằng AI. Chi phí gần như 0đ ngoài gimbal 1.5tr.",
    tags: ["Video", "Content", "Tips", "Budget"],
    attachments: [{ type: "video", name: "workflow-demo.mp4" }, { type: "link", name: "capcut.com/pro" }],
    likes: 56, comments: 15, shares: 12, views: 380, isLiked: true, isBookmarked: true, createdAt: "Hôm qua", featured: true,
  },
  {
    id: "P05", author: { name: "Đỗ Thị Lan", initials: "DL", role: "Học viên", subsidiary: "BĐS KĐT", avatar: "🏘️" },
    type: "share",
    content: "Vừa đọc xong cuốn 'Atomic Habits' của James Clear và áp dụng vào lộ trình học tập IDP. Thay vì đặt mục tiêu lớn, mình chia nhỏ: mỗi ngày học 1 microlesson 10 phút. Sau 2 tháng đã hoàn thành 3 khóa! 📚",
    tags: ["IDP", "Habits", "Microlearning"],
    attachments: [{ type: "image", name: "reading-tracker.jpg" }],
    likes: 41, comments: 8, shares: 6, views: 195, isLiked: false, isBookmarked: false, createdAt: "Hôm qua", featured: false,
  },
  {
    id: "P06", author: { name: "Lê Hoàng Anh", initials: "LA", role: "Admin", subsidiary: "ABS", avatar: "📈" },
    type: "resource", title: "Template KPI cho L&D Department — Free Download",
    content: "Mình vừa hoàn thiện bộ template KPI cho phòng Đào tạo, bao gồm: Training Hours per Employee, Cost per Learner, Completion Rate, NPS Score, Skill Gap Reduction. Mỗi KPI có formula, benchmark và dashboard mẫu. Ai cần cứ tải nhé!",
    tags: ["KPI", "Template", "L&D", "Free"],
    attachments: [{ type: "document", name: "LD-KPI-Templates.xlsx" }, { type: "document", name: "KPI-Dashboard.pptx" }],
    likes: 89, comments: 24, shares: 32, views: 680, isLiked: true, isBookmarked: true, createdAt: "2 ngày trước", featured: true,
  },
  {
    id: "P07", author: { name: "Hoàng Minh Tuấn", initials: "HT", role: "Học viên", subsidiary: "Thủy điện XM", avatar: "⚡" },
    type: "achievement",
    content: "🏆 Đội Thủy điện Xuân Mai vừa đạt 100% completion rate cho khóa Compliance An toàn Đập — đơn vị đầu tiên trong Tập đoàn! Cảm ơn anh em đã cùng cố gắng 💪",
    tags: ["Compliance", "Thủy điện", "Achievement"],
    likes: 115, comments: 30, shares: 8, views: 520, isLiked: false, isBookmarked: false, createdAt: "3 ngày trước", featured: false,
  },
  {
    id: "P08", author: { name: "Nguyễn Thu Hà", initials: "NH", role: "Giảng viên", subsidiary: "Giáo dục", avatar: "🎓" },
    type: "article", title: "Gamification trong đào tạo doanh nghiệp: Bài học từ Geleximco",
    content: "Sau 6 tháng triển khai hệ thống gamification, chúng tôi ghi nhận: engagement tăng 35%, completion rate tăng 22%, NPS score tăng từ 6.8 lên 8.2. Bài viết phân tích chi tiết các yếu tố thành công và những sai lầm cần tránh...",
    tags: ["Gamification", "Case Study", "Engagement"],
    likes: 67, comments: 16, shares: 14, views: 450, isLiked: false, isBookmarked: false, createdAt: "3 ngày trước", featured: true,
  },
];

const TRENDING: TrendingTopic[] = [
  { tag: "AI", posts: 28, trend: 45 },
  { tag: "Compliance", posts: 22, trend: 15 },
  { tag: "Microlearning", posts: 18, trend: 30 },
  { tag: "Gamification", posts: 16, trend: 52 },
  { tag: "ESG", posts: 14, trend: 20 },
  { tag: "Leadership", posts: 12, trend: 8 },
  { tag: "Digital", posts: 11, trend: 35 },
  { tag: "KPI", posts: 10, trend: 12 },
];

const TOP_CONTRIBUTORS: TopContributor[] = [
  { name: "Lê Hoàng Anh", initials: "LA", subsidiary: "ABS", posts: 24, likes: 340, badge: "🥇" },
  { name: "Trần Thị Hương", initials: "TH", subsidiary: "VP Tập đoàn", posts: 21, likes: 285, badge: "🥈" },
  { name: "Vũ Thị Mai", initials: "VM", subsidiary: "Hanel", posts: 18, likes: 260, badge: "🥉" },
  { name: "Nguyễn Thu Hà", initials: "NH", subsidiary: "Giáo dục", posts: 15, likes: 220, badge: "⭐" },
  { name: "Phạm Đức Mạnh", initials: "PM", subsidiary: "Xi măng TL", posts: 12, likes: 180, badge: "⭐" },
];

const TYPE_CFG: Record<string, { icon: typeof Lightbulb; color: string; label: string }> = {
  share: { icon: Share2, color: "#2563eb", label: "Chia sẻ" },
  article: { icon: FileText, color: "#990803", label: "Bài viết" },
  question: { icon: MessageCircle, color: "#c8a84e", label: "Hỏi đáp" },
  achievement: { icon: Award, color: "#16a34a", label: "Thành tích" },
  tip: { icon: Lightbulb, color: "#ea580c", label: "Mẹo hay" },
  resource: { icon: BookOpen, color: "#7c3aed", label: "Tài nguyên" },
};

const ATT_ICONS: Record<string, typeof Image> = { image: Image, document: FileText, link: Link2, video: Video };

export function SocialLearning() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"feed" | "trending" | "contributors" | "analytics">("feed");
  const [feedFilter, setFeedFilter] = useState<string>("all");
  const [posts, setPosts] = useState(POSTS);

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };
  const toggleBookmark = (postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Social Learning Hub</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Chia sẻ kiến thức, kinh nghiệm và kết nối với đồng nghiệp trong Tập đoàn
          </p>
        </div>
        <button onClick={() => { import("sonner").then(m => m.toast.info("Mở trình soạn bài viết mới...")); }} className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer self-start" style={{ fontSize: "12px", fontWeight: 500 }}>
          <Plus className="w-4 h-4" /> Đăng bài mới
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Bài viết tuần này", value: "42", icon: FileText, color: "#990803" },
          { label: "Tổng Tương tác", value: "1,280", icon: Heart, color: "#ef4444" },
          { label: "Thành viên Active", value: "385", icon: Users, color: "#2563eb" },
          { label: "Tài nguyên Chia sẻ", value: "68", icon: BookOpen, color: "#7c3aed" },
          { label: "Câu hỏi Đã trả lời", value: "94%", icon: MessageCircle, color: "#16a34a" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "10" }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: s.color }}>{s.value}</p>
              <p className="text-gray-400" style={{ fontSize: "9px" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200 overflow-x-auto">
        {([
          { id: "feed", label: "Bảng tin", icon: Zap },
          { id: "trending", label: "Trending", icon: TrendingUp },
          { id: "contributors", label: "Top Contributors", icon: Award },
          { id: "analytics", label: "Phân tích", icon: Target },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "feed" && <FeedTab posts={posts} filter={feedFilter} setFilter={setFeedFilter} toggleLike={toggleLike} toggleBookmark={toggleBookmark} />}
      {tab === "trending" && <TrendingTab />}
      {tab === "contributors" && <ContributorsTab />}
      {tab === "analytics" && <AnalyticsTab />}
    </div>
  );
}

// ─── Feed Tab ───
function FeedTab({ posts, filter, setFilter, toggleLike, toggleBookmark }: {
  posts: Post[]; filter: string; setFilter: (f: string) => void;
  toggleLike: (id: string) => void; toggleBookmark: (id: string) => void;
}) {
  const filtered = filter === "all" ? posts : posts.filter(p => p.type === filter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-3">
        {/* Compose box */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#990803] to-[#7a0602] text-white flex items-center justify-center shrink-0" style={{ fontSize: "11px", fontWeight: 700 }}>AD</div>
            <input placeholder="Chia sẻ kiến thức, đặt câu hỏi, hoặc đăng tài nguyên..." className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "12px" }} />
          </div>
          <div className="flex items-center gap-2 mt-2 pl-12">
            {[
              { icon: Image, label: "Ảnh", color: "#16a34a" },
              { icon: FileText, label: "Tài liệu", color: "#2563eb" },
              { icon: Video, label: "Video", color: "#ea580c" },
              { icon: Link2, label: "Link", color: "#7c3aed" },
            ].map(a => (
              <button key={a.label} onClick={() => { import("sonner").then(m => m.toast.info(`Đính kèm ${a.label.toLowerCase()}...`)); }} className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "10px", color: a.color }}>
                <a.icon className="w-3.5 h-3.5" /> {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[{ id: "all", label: "Tất cả" }, ...Object.entries(TYPE_CFG).map(([id, cfg]) => ({ id, label: cfg.label }))].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-2.5 py-1 rounded-full border cursor-pointer transition-all ${filter === f.id ? "border-[#990803] bg-[#990803]/10 text-[#990803]" : "border-gray-200 text-gray-400 hover:border-gray-300"}`} style={{ fontSize: "10px", fontWeight: filter === f.id ? 600 : 400 }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {filtered.map(post => {
          const typeCfg = TYPE_CFG[post.type];
          const TypeIcon = typeCfg.icon;
          return (
            <div key={post.id} className={`bg-white rounded-xl border border-gray-200 p-4 ${post.featured ? "ring-1 ring-[#c8a84e]/30" : ""}`}>
              {post.featured && (
                <div className="flex items-center gap-1 mb-2 text-[#c8a84e]" style={{ fontSize: "9px", fontWeight: 600 }}>
                  <Star className="w-3 h-3" /> Bài viết nổi bật
                </div>
              )}
              {/* Header */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center" style={{ fontSize: "16px" }}>{post.author.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-800" style={{ fontSize: "12px", fontWeight: 600 }}>{post.author.name}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: typeCfg.color, backgroundColor: typeCfg.color + "10" }}>{typeCfg.label}</span>
                  </div>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>{post.author.role} • {post.author.subsidiary} • {post.createdAt}</p>
                </div>
                <button onClick={() => { import("sonner").then(m => m.toast.info("Tùy chọn: Chia sẻ, Lưu, Báo cáo")); }} className="p-1 text-gray-300 hover:text-gray-500 cursor-pointer"><MoreHorizontal className="w-4 h-4" /></button>
              </div>

              {/* Content */}
              {post.title && <h3 className="text-gray-800 mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>{post.title}</h3>}
              <p className="text-gray-600 mb-2" style={{ fontSize: "12px", lineHeight: 1.6 }}>{post.content}</p>

              {/* Tags */}
              <div className="flex items-center gap-1 flex-wrap mb-2">
                {post.tags.map(t => (
                  <span key={t} className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded" style={{ fontSize: "9px" }}>#{t}</span>
                ))}
              </div>

              {/* Attachments */}
              {post.attachments && post.attachments.length > 0 && (
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {post.attachments.map((att, ai) => {
                    const AttIcon = ATT_ICONS[att.type] || FileText;
                    return (
                      <div key={ai} className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg border border-gray-100">
                        <AttIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-500" style={{ fontSize: "10px" }}>{att.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-1 text-gray-300 mb-2" style={{ fontSize: "10px" }}>
                <Eye className="w-3 h-3" /> {post.views} lượt xem
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${post.isLiked ? "bg-red-50 text-red-500" : "text-gray-400 hover:bg-gray-50"}`} style={{ fontSize: "11px" }}>
                  <Heart className={`w-3.5 h-3.5 ${post.isLiked ? "fill-current" : ""}`} /> {post.likes}
                </button>
                <button onClick={() => { import("sonner").then(m => m.toast.info("Mở bình luận...")); }} className="flex items-center gap-1 px-3 py-1.5 text-gray-400 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "11px" }}>
                  <MessageCircle className="w-3.5 h-3.5" /> {post.comments}
                </button>
                <button onClick={() => { import("sonner").then(m => m.toast.success("Đã sao chép link bài viết!")); }} className="flex items-center gap-1 px-3 py-1.5 text-gray-400 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "11px" }}>
                  <Share2 className="w-3.5 h-3.5" /> {post.shares}
                </button>
                <button onClick={() => toggleBookmark(post.id)} className={`ml-auto p-1.5 rounded-lg cursor-pointer transition-all ${post.isBookmarked ? "text-[#c8a84e]" : "text-gray-300 hover:text-gray-400"}`}>
                  <Bookmark className={`w-4 h-4 ${post.isBookmarked ? "fill-current" : ""}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sidebar */}
      <div className="space-y-3">
        {/* Trending Topics */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h4 className="text-gray-600 mb-2 flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
            <Flame className="w-3.5 h-3.5 text-[#ea580c]" /> Trending Topics
          </h4>
          <div className="space-y-1.5">
            {TRENDING.slice(0, 6).map((t, i) => (
              <div key={t.tag} onClick={() => { import("sonner").then(m => m.toast.info(`Xem bài viết về #${t.tag}`)); }} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                <span className="text-gray-300" style={{ fontSize: "10px", fontWeight: 600 }}>#{i + 1}</span>
                <div className="flex-1">
                  <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 500 }}>#{t.tag}</span>
                  <p className="text-gray-300" style={{ fontSize: "9px" }}>{t.posts} bài</p>
                </div>
                <span className="text-green-500 flex items-center" style={{ fontSize: "9px", fontWeight: 600 }}>
                  <ArrowUp className="w-2.5 h-2.5" /> {t.trend}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h4 className="text-gray-600 mb-2 flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
            <Award className="w-3.5 h-3.5 text-[#c8a84e]" /> Top Contributors
          </h4>
          <div className="space-y-1.5">
            {TOP_CONTRIBUTORS.map(c => (
              <div key={c.name} onClick={() => { import("sonner").then(m => m.toast.info(`Xem hồ sơ: ${c.name}`)); }} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                <span style={{ fontSize: "14px" }}>{c.badge}</span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#990803] to-[#7a0602] text-white flex items-center justify-center" style={{ fontSize: "9px", fontWeight: 700 }}>{c.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate" style={{ fontSize: "11px", fontWeight: 500 }}>{c.name}</p>
                  <p className="text-gray-300" style={{ fontSize: "9px" }}>{c.subsidiary} • {c.posts} bài • {c.likes} ❤️</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Topics */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h4 className="text-gray-600 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Gợi ý Chủ đề</h4>
          <div className="flex flex-wrap gap-1">
            {["AI trong HR", "ESG Reporting", "Soft Skills", "Remote Work", "Data Analytics", "Change Management", "Innovation", "Wellbeing"].map(t => (
              <span key={t} onClick={() => { import("sonner").then(m => m.toast.info(`Tìm kiếm: #${t}`)); }} className="px-2 py-1 bg-gray-50 text-gray-500 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100" style={{ fontSize: "10px" }}>#{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Trending Tab ───
function TrendingTab() {
  const maxPosts = Math.max(...TRENDING.map(t => t.posts));
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Trending Topics — 7 ngày qua</h3>
        <svg width="100%" height="220" viewBox="0 0 500 220" preserveAspectRatio="xMidYMid meet">
          {TRENDING.map((t, i) => {
            const y = 5 + i * 26;
            const barW = (t.posts / maxPosts) * 280;
            const colors = ["#990803", "#c8a84e", "#2563eb", "#16a34a", "#7c3aed", "#ea580c", "#0d9488", "#6b7280"];
            const color = colors[i % colors.length];
            return (
              <g key={t.tag}>
                <text x="5" y={y + 10} dominantBaseline="central" fill="#374151" style={{ fontSize: "9px", fontWeight: 500 }}>#{t.tag}</text>
                <rect x="80" y={y} width={barW} height="20" rx="4" fill={color} opacity="0.45" />
                <text x={85 + barW} y={y + 10} dominantBaseline="central" fill={color} style={{ fontSize: "9px", fontWeight: 700 }}>{t.posts}</text>
                <text x={115 + barW} y={y + 10} dominantBaseline="central" fill="#16a34a" style={{ fontSize: "8px" }}>↑{t.trend}%</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Word cloud simulation */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Tag Cloud</h3>
        <div className="flex flex-wrap gap-2 justify-center py-4">
          {TRENDING.concat([
            { tag: "Python", posts: 8, trend: 10 },
            { tag: "Scrum", posts: 7, trend: 5 },
            { tag: "OKR", posts: 6, trend: 15 },
            { tag: "Coaching", posts: 9, trend: 20 },
            { tag: "ATLĐ", posts: 13, trend: 8 },
            { tag: "Finance", posts: 5, trend: 3 },
          ]).map(t => {
            const size = 10 + (t.posts / 28) * 16;
            const colors = ["#990803", "#c8a84e", "#2563eb", "#16a34a", "#7c3aed", "#ea580c", "#0d9488"];
            const color = colors[Math.floor(Math.random() * colors.length)];
            return (
              <span key={t.tag} onClick={() => { import("sonner").then(m => m.toast.info(`Xem bài viết: #${t.tag}`)); }} className="cursor-pointer hover:opacity-70 transition-opacity" style={{ fontSize: `${size}px`, fontWeight: t.posts > 15 ? 700 : 500, color, opacity: 0.5 + (t.posts / 28) * 0.5 }}>
                #{t.tag}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Contributors Tab ───
function ContributorsTab() {
  return (
    <div className="space-y-3">
      <p className="text-gray-500" style={{ fontSize: "12px" }}>Bảng xếp hạng người đóng góp kiến thức tháng 3/2026</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TOP_CONTRIBUTORS.slice(0, 3).map((c, i) => {
          const colors = ["#c8a84e", "#9ca3af", "#b45309"];
          return (
            <div key={c.name} className="bg-white rounded-xl border border-gray-200 p-4 text-center" style={{ borderTopWidth: "3px", borderTopColor: colors[i] }}>
              <span style={{ fontSize: "32px" }}>{c.badge}</span>
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#990803] to-[#7a0602] text-white flex items-center justify-center mx-auto mt-2 mb-1" style={{ fontSize: "16px", fontWeight: 700 }}>{c.initials}</div>
              <h4 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>{c.name}</h4>
              <p className="text-gray-400" style={{ fontSize: "10px" }}>{c.subsidiary}</p>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div>
                  <p className="text-[#990803]" style={{ fontSize: "16px", fontWeight: 700 }}>{c.posts}</p>
                  <p className="text-gray-400" style={{ fontSize: "9px" }}>Bài viết</p>
                </div>
                <div>
                  <p className="text-[#ef4444]" style={{ fontSize: "16px", fontWeight: 700 }}>{c.likes}</p>
                  <p className="text-gray-400" style={{ fontSize: "9px" }}>Likes</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full leaderboard */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2.5 text-left text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>#</th>
              <th className="px-4 py-2.5 text-left text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Thành viên</th>
              <th className="px-4 py-2.5 text-right text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Bài viết</th>
              <th className="px-4 py-2.5 text-right text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Likes</th>
              <th className="px-4 py-2.5 text-right text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Impact Score</th>
            </tr>
          </thead>
          <tbody>
            {TOP_CONTRIBUTORS.map((c, i) => (
              <tr key={c.name} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2.5"><span style={{ fontSize: "14px" }}>{c.badge}</span></td>
                <td className="px-4 py-2.5">
                  <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{c.name}</p>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>{c.subsidiary}</p>
                </td>
                <td className="px-4 py-2.5 text-right" style={{ fontSize: "12px", fontWeight: 600 }}>{c.posts}</td>
                <td className="px-4 py-2.5 text-right text-red-400" style={{ fontSize: "12px", fontWeight: 600 }}>{c.likes}</td>
                <td className="px-4 py-2.5 text-right text-[#990803]" style={{ fontSize: "12px", fontWeight: 700 }}>{Math.round(c.posts * 2.5 + c.likes * 0.3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Analytics Tab ───
function AnalyticsTab() {
  // Post type distribution
  const typeDist = Object.entries(TYPE_CFG).map(([type, cfg]) => ({
    type, ...cfg, count: POSTS.filter(p => p.type === type).length,
  }));
  const maxType = Math.max(...typeDist.map(t => t.count));

  // Weekly engagement
  const weeks = ["W1 T2", "W2 T2", "W3 T2", "W4 T2", "W1 T3", "W2 T3"];
  const engagementData = [180, 220, 195, 260, 310, 280];
  const maxEng = Math.max(...engagementData);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Post Type Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Phân bố Loại Bài viết</h3>
          <svg width="100%" height="160" viewBox="0 0 350 160" preserveAspectRatio="xMidYMid meet">
            {typeDist.map((t, i) => {
              const y = 5 + i * 25;
              const barW = maxType > 0 ? (t.count / maxType) * 160 : 0;
              return (
                <g key={t.type}>
                  <text x="5" y={y + 10} dominantBaseline="central" fill="#374151" style={{ fontSize: "9px" }}>{t.label}</text>
                  <rect x="80" y={y} width={barW} height="20" rx="4" fill={t.color} opacity="0.5" />
                  <text x={85 + barW} y={y + 10} dominantBaseline="central" fill={t.color} style={{ fontSize: "9px", fontWeight: 700 }}>{t.count}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Weekly Engagement */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Tương tác theo Tuần</h3>
          <svg width="100%" height="160" viewBox="0 0 350 160" preserveAspectRatio="xMidYMid meet">
            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
              const y = 10 + (1 - r) * 110;
              return (
                <g key={i}>
                  <line x1="30" y1={y} x2="330" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
                  <text x="25" y={y} textAnchor="end" dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "7px" }}>{Math.round(maxEng * r)}</text>
                </g>
              );
            })}
            {/* Area */}
            <polygon
              points={[
                ...engagementData.map((v, i) => `${30 + i * 60},${10 + (1 - v / maxEng) * 110}`),
                `${30 + (engagementData.length - 1) * 60},120`,
                `30,120`,
              ].join(" ")}
              fill="#990803" opacity="0.08"
            />
            <polyline
              points={engagementData.map((v, i) => `${30 + i * 60},${10 + (1 - v / maxEng) * 110}`).join(" ")}
              fill="none" stroke="#990803" strokeWidth="2" strokeLinejoin="round"
            />
            {engagementData.map((v, i) => (
              <g key={i}>
                <circle cx={30 + i * 60} cy={10 + (1 - v / maxEng) * 110} r="3" fill="white" stroke="#990803" strokeWidth="1.5" />
                <text x={30 + i * 60} y={135} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "7px" }}>{weeks[i]}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Top Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Top 5 Bài viết — Engagement cao nhất</h3>
        <div className="space-y-2">
          {[...POSTS].sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)).slice(0, 5).map((p, i) => {
            const total = p.likes + p.comments + p.shares;
            return (
              <div key={p.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-[#990803]/10 text-[#990803] flex items-center justify-center shrink-0" style={{ fontSize: "10px", fontWeight: 700 }}>#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate" style={{ fontSize: "11px", fontWeight: 500 }}>{p.title || p.content.slice(0, 60) + "..."}</p>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>{p.author.name} • {p.author.subsidiary}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-400 shrink-0" style={{ fontSize: "10px" }}>
                  <span>❤️ {p.likes}</span>
                  <span>💬 {p.comments}</span>
                  <span>🔗 {p.shares}</span>
                  <span className="text-[#990803]" style={{ fontWeight: 700 }}>{total}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}