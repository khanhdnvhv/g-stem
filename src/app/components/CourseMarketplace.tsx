import { useState } from "react";
import {
  ShoppingBag, Search, Star, Users, Clock, BookOpen,
  Building2, Tag, ArrowRightLeft, Filter, ChevronRight,
  Heart, Eye, MessageCircle, Award, TrendingUp, Zap,
  CheckCircle, Share2, ShoppingCart, Package, BarChart3,
  Globe, DollarSign, ThumbsUp, Gift, Send, Sparkles,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface MarketplaceCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  provider: string;
  providerInitials: string;
  providerSubsidiary: string;
  instructor: string;
  instructorInitials: string;
  rating: number;
  reviews: number;
  students: number;
  duration: string;
  lessons: number;
  price: string;
  priceType: "free" | "internal" | "premium";
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  format: "video" | "mixed" | "workshop" | "self-paced";
  status: "available" | "popular" | "new" | "exclusive";
  adopted: number;
  shared: boolean;
  saved: boolean;
  featured: boolean;
  thumbnail: string;
}

interface ExchangeRequest {
  id: string;
  from: string;
  fromInitials: string;
  to: string;
  toInitials: string;
  courseOffered: string;
  courseRequested: string;
  status: "pending" | "accepted" | "rejected";
  date: string;
}

// ─── Mock Data ───
const COURSES: MarketplaceCourse[] = [
  {
    id: "MKT01", title: "AI & Machine Learning Thực hành",
    description: "Khóa học AI/ML ứng dụng thực tế: chatbot, phân tích dữ liệu tự động, dự báo kinh doanh.",
    category: "Công nghệ", provider: "Dr. Trần Hùng", providerInitials: "TH", providerSubsidiary: "Geleximco Technology",
    instructor: "Dr. Trần Hùng", instructorInitials: "TH",
    rating: 4.8, reviews: 234, students: 890, duration: "16 giờ", lessons: 32,
    price: "Nội bộ", priceType: "internal", tags: ["AI", "ML", "Python"],
    difficulty: "intermediate", format: "mixed", status: "popular",
    adopted: 12, shared: true, saved: false, featured: true,
    thumbnail: "🤖",
  },
  {
    id: "MKT02", title: "Phân tích Rủi ro Tín dụng theo Basel III+",
    description: "Framework phân tích rủi ro mới nhất cho ngành ngân hàng, áp dụng chuẩn quốc tế Basel III+.",
    category: "Tài chính", provider: "Trần Thị Hương", providerInitials: "TH", providerSubsidiary: "ABBank",
    instructor: "Trần Thị Hương", instructorInitials: "TH",
    rating: 4.5, reviews: 134, students: 670, duration: "12 giờ", lessons: 20,
    price: "Nội bộ", priceType: "internal", tags: ["Risk", "Banking", "Basel"],
    difficulty: "advanced", format: "video", status: "available",
    adopted: 3, shared: false, saved: true, featured: false,
    thumbnail: "🏦",
  },
  {
    id: "MKT03", title: "An toàn Lao động Công trường Xây dựng",
    description: "Quy trình ATLĐ toàn diện cho công trường xây dựng: phòng cháy, làm việc trên cao, thiết bị nặng.",
    category: "An toàn", provider: "Phạm Đức Mạnh", providerInitials: "PM", providerSubsidiary: "Xây dựng Geleximco",
    instructor: "Phạm Đức Mạnh", instructorInitials: "PM",
    rating: 4.3, reviews: 210, students: 2100, duration: "8 giờ", lessons: 15,
    price: "Miễn phí", priceType: "free", tags: ["ATLĐ", "ISO 45001", "Xây dựng"],
    difficulty: "beginner", format: "mixed", status: "popular",
    adopted: 14, shared: true, saved: false, featured: true,
    thumbnail: "🦺",
  },
  {
    id: "MKT04", title: "ESG & Báo cáo Phát triển Bền vững",
    description: "GRI Standards, SASB, carbon accounting và chiến lược Net Zero cho doanh nghiệp Việt Nam.",
    category: "Chiến lược", provider: "Lê Quốc Vương", providerInitials: "LV", providerSubsidiary: "Geleximco Land",
    instructor: "Lê Quốc Vương", instructorInitials: "LV",
    rating: 4.5, reviews: 89, students: 320, duration: "12 giờ", lessons: 18,
    price: "500K/đơn vị", priceType: "premium", tags: ["ESG", "GRI", "Sustainability"],
    difficulty: "intermediate", format: "mixed", status: "new",
    adopted: 5, shared: false, saved: false, featured: true,
    thumbnail: "🌱",
  },
  {
    id: "MKT05", title: "Excel & VBA Automation cho Kế toán",
    description: "Power Query, Pivot nâng cao, VBA macro tự động hóa báo cáo tài chính hàng tháng.",
    category: "Nghiệp vụ", provider: "Bùi Thị Hà", providerInitials: "BH", providerSubsidiary: "VP Tập đoàn",
    instructor: "Bùi Thị Hà", instructorInitials: "BH",
    rating: 4.6, reviews: 145, students: 430, duration: "10 giờ", lessons: 22,
    price: "Miễn phí", priceType: "free", tags: ["Excel", "VBA", "Kế toán"],
    difficulty: "intermediate", format: "self-paced", status: "available",
    adopted: 10, shared: true, saved: false, featured: false,
    thumbnail: "📊",
  },
  {
    id: "MKT06", title: "Kỹ năng Đàm phán B2B Nâng cao",
    description: "Phương pháp Harvard, BATNA, ZOPA, xử lý deadlock trong đàm phán thương mại lớn.",
    category: "Kỹ năng mềm", provider: "Đỗ Thanh Hương", providerInitials: "TH", providerSubsidiary: "VP Tập đoàn",
    instructor: "Đỗ Thanh Hương", instructorInitials: "TH",
    rating: 4.9, reviews: 342, students: 1245, duration: "8 giờ", lessons: 14,
    price: "Nội bộ", priceType: "internal", tags: ["Negotiation", "B2B", "Harvard"],
    difficulty: "advanced", format: "workshop", status: "popular",
    adopted: 11, shared: true, saved: false, featured: false,
    thumbnail: "🤝",
  },
  {
    id: "MKT07", title: "Digital Marketing & Social Media",
    description: "Chiến lược Marketing số, quảng cáo Google/Facebook, SEO, content marketing cho BĐS.",
    category: "Marketing", provider: "Phạm Anh Tuấn", providerInitials: "PT", providerSubsidiary: "Geleximco Land",
    instructor: "Phạm Anh Tuấn", instructorInitials: "PT",
    rating: 4.6, reviews: 167, students: 560, duration: "14 giờ", lessons: 24,
    price: "300K/đơn vị", priceType: "premium", tags: ["Digital", "Social Media", "SEO"],
    difficulty: "beginner", format: "video", status: "new",
    adopted: 7, shared: false, saved: false, featured: false,
    thumbnail: "📱",
  },
  {
    id: "MKT08", title: "Quản lý Dự án Agile & Scrum",
    description: "Agile Manifesto, Scrum framework, Kanban, Sprint planning cho dự án xây dựng và CNTT.",
    category: "Quản trị", provider: "Phạm Anh Tuấn", providerInitials: "PT", providerSubsidiary: "Geleximco Land",
    instructor: "Phạm Anh Tuấn", instructorInitials: "PT",
    rating: 4.6, reviews: 312, students: 780, duration: "20 giờ", lessons: 28,
    price: "Nội bộ", priceType: "internal", tags: ["Agile", "Scrum", "PM"],
    difficulty: "intermediate", format: "mixed", status: "available",
    adopted: 9, shared: true, saved: false, featured: false,
    thumbnail: "🏃",
  },
];

const EXCHANGES: ExchangeRequest[] = [
  { id: "EX01", from: "Geleximco Land", fromInitials: "GL", to: "ABBank", toInitials: "AB", courseOffered: "Digital Marketing & Social Media", courseRequested: "Phân tích Rủi ro Tín dụng", status: "pending", date: "10/03/2026" },
  { id: "EX02", from: "VP Tập đoàn", fromInitials: "VP", to: "Xây dựng Geleximco", toInitials: "XD", courseOffered: "Kỹ năng Đàm phán B2B", courseRequested: "An toàn Lao động Công trường", status: "accepted", date: "08/03/2026" },
  { id: "EX03", from: "ABBank", fromInitials: "AB", to: "Geleximco Technology", toInitials: "GT", courseOffered: "Phân tích Rủi ro Tín dụng", courseRequested: "AI & Machine Learning", status: "pending", date: "11/03/2026" },
];

const PRICE_CONFIG = {
  free: { label: "Miễn phí", color: "#16a34a", bg: "#16a34a10" },
  internal: { label: "Nội bộ", color: "#2563eb", bg: "#2563eb10" },
  premium: { label: "Premium", color: "#c8a84e", bg: "#c8a84e10" },
};

const DIFF_CONFIG = {
  beginner: { label: "Cơ bản", color: "#16a34a" },
  intermediate: { label: "Trung cấp", color: "#2563eb" },
  advanced: { label: "Nâng cao", color: "#990803" },
};

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  popular: { label: "🔥 Phổ biến", color: "#ea580c", bg: "#ea580c10" },
  new: { label: "✨ Mới", color: "#2563eb", bg: "#2563eb10" },
  exclusive: { label: "🔒 Độc quyền", color: "#7c3aed", bg: "#7c3aed10" },
  available: { label: "", color: "", bg: "" },
};

export function CourseMarketplace() {
  const { user } = useAuth();
  const role = user?.role || "learner";
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"browse" | "exchanges" | "my-shared" | "analytics">("browse");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");
  const [courses, setCourses] = useState(COURSES);
  const [selectedCourse, setSelectedCourse] = useState<MarketplaceCourse | null>(null);

  const toggleSave = (id: string) => setCourses(prev => prev.map(c => c.id === id ? { ...c, saved: !c.saved } : c));

  const categories = [...new Set(COURSES.map(c => c.category))];
  const filtered = courses.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    if (filterPrice !== "all" && c.priceType !== filterPrice) return false;
    return true;
  });

  const featuredCourses = courses.filter(c => c.featured);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Marketplace Nội bộ</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Khám phá, chia sẻ và trao đổi khóa học giữa 14 đơn vị thành viên Geleximco
          </p>
        </div>
        {(role === "admin" || role === "instructor") && (
          <button onClick={() => { import("sonner").then(m => m.toast.info("Mở danh sách khóa học để chia sẻ...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Share2 className="w-4 h-4" /> Chia sẻ Khóa học
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Khóa trên Marketplace", value: courses.length, icon: Package, color: "#990803" },
          { label: "Đơn vị chia sẻ", value: [...new Set(courses.map(c => c.providerSubsidiary))].length, icon: Building2, color: "#2563eb" },
          { label: "Trao đổi thành công", value: 24, icon: ArrowRightLeft, color: "#16a34a" },
          { label: "Đã áp dụng", value: courses.reduce((s, c) => s + c.adopted, 0), icon: CheckCircle, color: "#c8a84e" },
          { label: "Đánh giá TB", value: (courses.reduce((s, c) => s + c.rating, 0) / courses.length).toFixed(1), icon: Star, color: "#7c3aed" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "10" }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>{s.value}</p>
              <p className="text-gray-400" style={{ fontSize: "10px" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200">
        {[
          { id: "browse" as const, label: "Duyệt Khóa học", icon: ShoppingBag },
          { id: "exchanges" as const, label: "Trao đổi", icon: ArrowRightLeft, count: EXCHANGES.filter(e => e.status === "pending").length },
          { id: "my-shared" as const, label: "Đã chia sẻ", icon: Share2 },
          { id: "analytics" as const, label: "Thống kê", icon: BarChart3 },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
            {"count" in t && t.count ? <span className="px-1.5 py-0.5 bg-[#990803]/10 text-[#990803] rounded-full" style={{ fontSize: "10px" }}>{t.count}</span> : null}
          </button>
        ))}
      </div>

      {tab === "browse" && (
        <div className="space-y-3">
          {/* Featured */}
          {featuredCourses.length > 0 && (
            <div>
              <h3 className="text-gray-600 mb-2 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                <Sparkles className="w-4 h-4 text-[#c8a84e]" /> Nổi bật
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {featuredCourses.map(course => {
                  const pCfg = PRICE_CONFIG[course.priceType];
                  const dCfg = DIFF_CONFIG[course.difficulty];
                  const sBadge = STATUS_BADGE[course.status];
                  return (
                    <div key={course.id} onClick={() => setSelectedCourse(course)} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#c8a84e]/5 rounded-bl-[80px]" />
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize: "28px" }}>{course.thumbnail}</span>
                        <div className="flex items-center gap-1.5">
                          {sBadge.label && <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: sBadge.color, backgroundColor: sBadge.bg }}>{sBadge.label}</span>}
                          <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: pCfg.color, backgroundColor: pCfg.bg }}>{course.price}</span>
                        </div>
                      </div>
                      <h4 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>{course.title}</h4>
                      <p className="text-gray-400 mt-0.5 line-clamp-2" style={{ fontSize: "11px" }}>{course.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-5 h-5 rounded-full bg-[#990803] text-white flex items-center justify-center" style={{ fontSize: "7px", fontWeight: 700 }}>{course.providerInitials}</div>
                        <span className="text-gray-400" style={{ fontSize: "10px" }}>{course.providerSubsidiary}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-gray-400" style={{ fontSize: "10px" }}>
                        <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-[#c8a84e] fill-[#c8a84e]" /> {course.rating}</span>
                        <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" /> {course.students}</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {course.duration}</span>
                        <span style={{ color: dCfg.color, fontWeight: 500 }}>{dCfg.label}</span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-gray-300" style={{ fontSize: "9px" }}>{course.adopted}/14 đơn vị đã áp dụng</span>
                        <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#16a34a]" style={{ width: `${(course.adopted / 14) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm khóa học, tag..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
            </div>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả danh mục</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterPrice} onChange={e => setFilterPrice(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả giá</option>
              {Object.entries(PRICE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <span className="text-gray-400 ml-auto" style={{ fontSize: "11px" }}>{filtered.length} khóa học</span>
          </div>

          {/* Course Grid */}
          <div className="space-y-2">
            {filtered.filter(c => !c.featured).map(course => {
              const pCfg = PRICE_CONFIG[course.priceType];
              const dCfg = DIFF_CONFIG[course.difficulty];
              const sBadge = STATUS_BADGE[course.status];
              return (
                <div key={course.id} onClick={() => setSelectedCourse(course)} className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0" style={{ fontSize: "24px" }}>
                      {course.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        {sBadge.label && <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: sBadge.color, backgroundColor: sBadge.bg }}>{sBadge.label}</span>}
                        <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: pCfg.color, backgroundColor: pCfg.bg }}>{course.price}</span>
                        <span className="text-gray-300" style={{ fontSize: "9px" }}>{course.category}</span>
                        <span style={{ fontSize: "9px", color: dCfg.color, fontWeight: 500 }}>{dCfg.label}</span>
                      </div>
                      <h4 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>{course.title}</h4>
                      <p className="text-gray-400 mt-0.5 line-clamp-1" style={{ fontSize: "12px" }}>{course.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-gray-400" style={{ fontSize: "11px" }}>
                        <span className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-[#990803] text-white flex items-center justify-center" style={{ fontSize: "6px", fontWeight: 700 }}>{course.providerInitials}</div>
                          {course.providerSubsidiary}
                        </span>
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" /> {course.rating} ({course.reviews})</span>
                        <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {course.students}</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {course.duration}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {course.tags.map(t => <span key={t} className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded" style={{ fontSize: "8px" }}>#{t}</span>)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button onClick={e => { e.stopPropagation(); toggleSave(course.id); }} className="p-1 cursor-pointer">
                        <Heart className={`w-4 h-4 ${course.saved ? "text-red-500 fill-red-500" : "text-gray-200 hover:text-red-400"}`} />
                      </button>
                      <span className="text-gray-300" style={{ fontSize: "9px" }}>{course.adopted}/14 đơn vị</span>
                      <div className="h-1 w-14 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#16a34a]" style={{ width: `${(course.adopted / 14) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto" />
              <p className="text-gray-400 mt-2" style={{ fontSize: "13px" }}>Không tìm thấy khóa học nào</p>
            </div>
          )}
        </div>
      )}

      {tab === "exchanges" && (
        <div className="space-y-3">
          <p className="text-gray-500" style={{ fontSize: "12px" }}>Yêu cầu trao đổi khóa học giữa các đơn vị thành viên</p>

          {/* Exchange Flow SVG */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Mạng lưới Trao đổi</h3>
            <ExchangeNetworkChart />
          </div>

          {/* Exchange List */}
          <div className="space-y-2">
            {EXCHANGES.map(ex => {
              const stColor = ex.status === "accepted" ? "#16a34a" : ex.status === "rejected" ? "#ef4444" : "#c8a84e";
              const stLabel = ex.status === "accepted" ? "Đã chấp nhận" : ex.status === "rejected" ? "Từ chối" : "Chờ duyệt";
              return (
                <div key={ex.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-9 h-9 rounded-full bg-[#990803] text-white flex items-center justify-center" style={{ fontSize: "10px", fontWeight: 700 }}>{ex.fromInitials}</div>
                      <div>
                        <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{ex.from}</p>
                        <p className="text-gray-400" style={{ fontSize: "10px" }}>Chia sẻ: {ex.courseOffered}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#c8a84e]">
                      <ArrowRightLeft className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-9 h-9 rounded-full bg-[#2563eb] text-white flex items-center justify-center" style={{ fontSize: "10px", fontWeight: 700 }}>{ex.toInitials}</div>
                      <div>
                        <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{ex.to}</p>
                        <p className="text-gray-400" style={{ fontSize: "10px" }}>Chia sẻ: {ex.courseRequested}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: stColor, backgroundColor: stColor + "10" }}>{stLabel}</span>
                      <p className="text-gray-300 mt-0.5" style={{ fontSize: "9px" }}>{ex.date}</p>
                    </div>
                  </div>
                  {ex.status === "pending" && role === "admin" && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                      <button onClick={() => { import("sonner").then(m => m.toast.success("Đã chấp nhận yêu cầu!")); }} className="px-3 py-1.5 bg-[#16a34a] text-white rounded-lg hover:bg-[#15803d] cursor-pointer flex items-center gap-1" style={{ fontSize: "11px", fontWeight: 600 }}>
                        <CheckCircle className="w-3 h-3" /> Chấp nhận
                      </button>
                      <button onClick={() => { import("sonner").then(m => m.toast.error("Đã từ chối yêu cầu.")); }} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 cursor-pointer" style={{ fontSize: "11px", fontWeight: 600 }}>
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "my-shared" && (
        <div className="space-y-2">
          <p className="text-gray-500 mb-2" style={{ fontSize: "12px" }}>Khóa học do đơn vị bạn chia sẻ lên Marketplace</p>
          {courses.filter(c => c.shared).map(course => (
            <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <span style={{ fontSize: "24px" }}>{course.thumbnail}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{course.title}</h4>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>{course.adopted}/14 đơn vị áp dụng • {course.students} học viên • ⭐ {course.rating}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[#16a34a]" style={{ fontSize: "12px", fontWeight: 600 }}>+{Math.floor(course.students * 0.3)} học viên/tháng</p>
                <p className="text-gray-300" style={{ fontSize: "9px" }}>Xu hướng t��ng</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "analytics" && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Top Khóa học theo Đơn vị Áp dụng</h3>
            <AdoptionChart courses={courses} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Phân bố theo Danh mục</h3>
            <CategoryPieChart courses={courses} />
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal course={selectedCourse} role={role} onClose={() => setSelectedCourse(null)} onToggleSave={toggleSave} />
      )}
    </div>
  );
}

// ─── Exchange Network Chart ───
function ExchangeNetworkChart() {
  const nodes = [
    { id: "VP", label: "VP TĐ", x: 200, y: 80, color: "#990803", r: 22 },
    { id: "GL", label: "Land", x: 80, y: 40, color: "#2563eb", r: 18 },
    { id: "AB", label: "ABBank", x: 320, y: 40, color: "#16a34a", r: 18 },
    { id: "XD", label: "Xây dựng", x: 80, y: 130, color: "#ea580c", r: 18 },
    { id: "GT", label: "Tech", x: 320, y: 130, color: "#7c3aed", r: 18 },
  ];
  const edges = [
    { from: "GL", to: "AB", active: true },
    { from: "VP", to: "XD", active: true },
    { from: "AB", to: "GT", active: true },
    { from: "VP", to: "GL", active: false },
    { from: "VP", to: "AB", active: false },
    { from: "VP", to: "GT", active: false },
  ];

  return (
    <svg width="100%" height="170" viewBox="0 0 400 170" preserveAspectRatio="xMidYMid meet">
      {edges.map((e, i) => {
        const f = nodes.find(n => n.id === e.from)!;
        const t = nodes.find(n => n.id === e.to)!;
        return (
          <line key={i} x1={f.x} y1={f.y} x2={t.x} y2={t.y} stroke={e.active ? "#c8a84e" : "#e5e7eb"} strokeWidth={e.active ? "2" : "1"} strokeDasharray={e.active ? "none" : "4 2"} />
        );
      })}
      {nodes.map(n => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={n.r} fill={n.color} />
          <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fill="white" style={{ fontSize: "8px", fontWeight: 700 }}>{n.label}</text>
        </g>
      ))}
      <text x="200" y="162" textAnchor="middle" fill="#9ca3af" style={{ fontSize: "9px" }}>— Đang trao đổi — - - Đã kết nối</text>
    </svg>
  );
}

// ─── Adoption Bar Chart ───
function AdoptionChart({ courses }: { courses: MarketplaceCourse[] }) {
  const sorted = [...courses].sort((a, b) => b.adopted - a.adopted).slice(0, 6);
  const maxAdopt = Math.max(...sorted.map(c => c.adopted));
  const W = 520, H = 140, pL = 180, pR = 30, pT = 5, pB = 5;
  const cW = W - pL - pR, cH = H - pT - pB;
  const barH = cH / sorted.length - 4;

  return (
    <svg width="100%" height="140" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {sorted.map((c, i) => {
        const y = pT + i * (cH / sorted.length) + 2;
        const w = (c.adopted / maxAdopt) * cW;
        return (
          <g key={c.id}>
            <text x={pL - 5} y={y + barH / 2} textAnchor="end" dominantBaseline="central" fill="#6b7280" style={{ fontSize: "9px" }}>{c.title.slice(0, 30)}{c.title.length > 30 ? "..." : ""}</text>
            <rect x={pL} y={y} width={w} height={barH} rx="3" fill="#990803" opacity={0.7 + (0.3 * (sorted.length - i) / sorted.length)} />
            <text x={pL + w + 4} y={y + barH / 2} dominantBaseline="central" fill="#990803" style={{ fontSize: "10px", fontWeight: 600 }}>{c.adopted}/14</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Category Pie Chart ───
function CategoryPieChart({ courses }: { courses: MarketplaceCourse[] }) {
  const catCounts: Record<string, number> = {};
  courses.forEach(c => { catCounts[c.category] = (catCounts[c.category] || 0) + 1; });
  const entries = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const total = courses.length;
  const colors = ["#990803", "#2563eb", "#16a34a", "#c8a84e", "#7c3aed", "#ea580c", "#ec4899", "#0d9488"];
  const cx = 80, cy = 80, R = 60;
  let startAngle = -Math.PI / 2;

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {entries.map(([cat, count], i) => {
          const angle = (count / total) * Math.PI * 2;
          const endAngle = startAngle + angle;
          const largeArc = angle > Math.PI ? 1 : 0;
          const x1 = cx + R * Math.cos(startAngle);
          const y1 = cy + R * Math.sin(startAngle);
          const x2 = cx + R * Math.cos(endAngle);
          const y2 = cy + R * Math.sin(endAngle);
          const path = `M${cx},${cy} L${x1},${y1} A${R},${R} 0 ${largeArc} 1 ${x2},${y2} Z`;
          startAngle = endAngle;
          return <path key={cat} d={path} fill={colors[i % colors.length]} />;
        })}
        <circle cx={cx} cy={cy} r="30" fill="white" />
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#990803" style={{ fontSize: "16px", fontWeight: 700 }}>{total}</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "8px" }}>khóa học</text>
      </svg>
      <div className="space-y-1.5">
        {entries.map(([cat, count], i) => (
          <div key={cat} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-gray-600" style={{ fontSize: "11px" }}>{cat}</span>
            <span className="text-gray-400" style={{ fontSize: "11px", fontWeight: 600 }}>({count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Course Detail Modal ───
function CourseDetailModal({ course, role, onClose, onToggleSave }: {
  course: MarketplaceCourse; role: string; onClose: () => void; onToggleSave: (id: string) => void;
}) {
  const pCfg = PRICE_CONFIG[course.priceType];
  const dCfg = DIFF_CONFIG[course.difficulty];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <span style={{ fontSize: "36px" }}>{course.thumbnail}</span>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: pCfg.color, backgroundColor: pCfg.bg }}>{course.price}</span>
                <span style={{ fontSize: "9px", color: dCfg.color, fontWeight: 500 }}>{dCfg.label}</span>
                <span className="text-gray-300" style={{ fontSize: "9px" }}>{course.category} • {course.format}</span>
              </div>
              <h3 className="text-gray-800 mt-0.5" style={{ fontSize: "16px", fontWeight: 700 }}>{course.title}</h3>
            </div>
          </div>

          <p className="text-gray-500" style={{ fontSize: "13px", lineHeight: 1.6 }}>{course.description}</p>

          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { label: "Đánh giá", value: `${course.rating}`, color: "#c8a84e" },
              { label: "Học viên", value: `${course.students}`, color: "#2563eb" },
              { label: "Thời lượng", value: course.duration, color: "#990803" },
              { label: "Bài học", value: `${course.lessons}`, color: "#7c3aed" },
            ].map((s, i) => (
              <div key={i} className="text-center p-2 bg-gray-50 rounded-lg">
                <p style={{ fontSize: "15px", fontWeight: 700, color: s.color }}>{s.value}</p>
                <p className="text-gray-400" style={{ fontSize: "9px" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#990803] text-white flex items-center justify-center" style={{ fontSize: "10px", fontWeight: 700 }}>{course.instructorInitials}</div>
            <div>
              <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{course.instructor}</p>
              <p className="text-gray-400" style={{ fontSize: "10px" }}>{course.providerSubsidiary}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {course.tags.map(t => <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full" style={{ fontSize: "10px" }}>#{t}</span>)}
          </div>

          <div className="mt-3 p-3 bg-[#990803]/5 rounded-lg">
            <p className="text-gray-600" style={{ fontSize: "11px", fontWeight: 500 }}>Mức độ áp dụng: {course.adopted}/14 đơn vị ({((course.adopted / 14) * 100).toFixed(0)}%)</p>
            <div className="h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div className="h-full rounded-full bg-[#990803]" style={{ width: `${(course.adopted / 14) * 100}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button onClick={() => { import("sonner").then(m => m.toast.success("Đã áp dụng khóa học cho đơn vị!")); }} className="flex-1 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center justify-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
              <ShoppingCart className="w-4 h-4" /> Áp dụng cho Đơn vị
            </button>
            <button onClick={() => onToggleSave(course.id)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "13px" }}>
              <Heart className={`w-4 h-4 ${course.saved ? "text-red-500 fill-red-500" : ""}`} />
            </button>
          </div>
          <button onClick={onClose} className="w-full mt-2 py-2 text-gray-400 hover:bg-gray-50 rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>Đóng</button>
        </div>
      </div>
    </div>
  );
}