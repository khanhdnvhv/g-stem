import { useState, useMemo } from "react";
import {
  Newspaper, Search, Eye, Tag,
  TrendingUp, FileText, Bell, BookOpen, Plus,
} from "lucide-react";
import { PageHeader, KpiCard } from "./authority-ui";
import { toast } from "sonner";

const ACCENT = "#7c3aed";

type NewsCategory = "policy" | "research" | "trend" | "announcement";
type NewsStatus   = "published" | "draft";

interface NewsItem {
  id:          string;
  title:       string;
  category:    NewsCategory;
  status:      NewsStatus;
  author:      string;
  publishedAt: string;
  views:       number;
  summary:     string;
  tags:        string[];
}

const CAT_CFG: Record<NewsCategory, { label: string; color: string; icon: typeof FileText }> = {
  policy:       { label: "Chính sách",     color: "#dc2626", icon: FileText },
  research:     { label: "Nghiên cứu",     color: "#2563eb", icon: BookOpen },
  trend:        { label: "Xu hướng",       color: "#7c3aed", icon: TrendingUp },
  announcement: { label: "Thông báo",      color: "#c8a84e", icon: Bell },
};

const INITIAL_NEWS: NewsItem[] = [
  {
    id: "N001",
    title: "Thông tư 38/2023: Chuẩn hóa khung chương trình STEM cho bậc THCS, THPT",
    category: "policy", status: "published", author: "Bộ GD&ĐT",
    publishedAt: "2026-05-10", views: 12400,
    summary: "Thông tư quy định chi tiết 5 chương trình STEM chuẩn (CT1–CT5), yêu cầu về cơ sở vật chất phòng lab và tỷ lệ giáo viên được đào tạo tối thiểu 80% trước khi triển khai.",
    tags: ["Thông tư", "CT1-CT5", "THCS", "THPT"],
  },
  {
    id: "N002",
    title: "Xu hướng tích hợp AI vào giảng dạy STEM: Kinh nghiệm từ Singapore và Phần Lan",
    category: "trend", status: "published", author: "Vụ Giáo dục Trung học",
    publishedAt: "2026-05-08", views: 8750,
    summary: "Báo cáo khảo sát 15 quốc gia dẫn đầu về STEM cho thấy tích hợp AI trong giảng dạy tăng mức độ tương tác của học sinh lên 45% và cải thiện điểm thi thực hành 28%.",
    tags: ["AI", "EdTech", "Quốc tế", "Xu hướng"],
  },
  {
    id: "N003",
    title: "Kết quả khảo sát Hiệu quả STEM năm học 2024–2025: 73% trường đạt chuẩn",
    category: "research", status: "published", author: "Viện Khoa học Giáo dục VN",
    publishedAt: "2026-05-05", views: 6320,
    summary: "Sau 2 năm triển khai, 73% trường có gói STEM đạt chuẩn năng lực theo Thông tư 38. Tỉ lệ học sinh hoàn thành CT1 đạt 89%, CT4 (Robotics) còn thấp ở 61%.",
    tags: ["Khảo sát", "Báo cáo", "2024-2025", "Hiệu quả"],
  },
  {
    id: "N004",
    title: "Thông báo: Nộp báo cáo tổng kết STEM năm học 2025–2026 trước ngày 30/6",
    category: "announcement", status: "published", author: "Vụ Kế hoạch - Tài chính",
    publishedAt: "2026-05-15", views: 15600,
    summary: "Các Sở GD&ĐT cần hoàn thiện và nộp báo cáo tổng kết năm học STEM theo mẫu BM-STEM-2026 trước ngày 30/6/2026 qua Cổng thông tin Bộ GD&ĐT.",
    tags: ["Thông báo", "Báo cáo", "Deadline", "Sở GD&ĐT"],
  },
  {
    id: "N005",
    title: "Phương pháp Project-Based Learning trong STEM: Hướng dẫn thực hành cho Giáo viên",
    category: "research", status: "published", author: "ĐH Sư phạm Hà Nội",
    publishedAt: "2026-04-28", views: 4890,
    summary: "Tài liệu hướng dẫn chi tiết 6 bước triển khai PBL trong tiết học STEM, kèm 12 giáo án mẫu đã được thử nghiệm tại 30 trường THCS trên toàn quốc.",
    tags: ["PBL", "Giáo viên", "Phương pháp", "THCS"],
  },
  {
    id: "N006",
    title: "Chính sách hỗ trợ kinh phí trang bị phòng Lab STEM cho trường vùng khó khăn 2026",
    category: "policy", status: "published", author: "Bộ GD&ĐT",
    publishedAt: "2026-04-20", views: 9100,
    summary: "Bộ GD&ĐT phân bổ 450 tỷ đồng hỗ trợ 800 trường vùng khó khăn trang bị gói phòng Lab STEM tối thiểu. Thủ tục đề xuất nộp trước 15/5/2026.",
    tags: ["Chính sách", "Ngân sách", "Vùng khó khăn", "2026"],
  },
  {
    id: "N007",
    title: "Tích hợp Thực tế Ảo (VR/AR) vào phòng lab STEM: Thí điểm tại 50 trường THPT",
    category: "trend", status: "published", author: "Viện Nghiên cứu Edtech",
    publishedAt: "2026-04-15", views: 7230,
    summary: "Chương trình thí điểm VR/AR tại 50 trường THPT cho kết quả học sinh hiểu khái niệm trừu tượng nhanh hơn 40%, tăng động lực học tập đáng kể.",
    tags: ["VR/AR", "Công nghệ", "THPT", "Thí điểm"],
  },
  {
    id: "N008",
    title: "Dự thảo: Quy định mới về đánh giá năng lực STEM học sinh — Lấy ý kiến đến 31/5",
    category: "policy", status: "draft", author: "Vụ Giáo dục Trung học",
    publishedAt: "2026-05-16", views: 0,
    summary: "Dự thảo đề xuất bộ tiêu chí đánh giá 5 năng lực lõi STEM (Tư duy logic, Sáng tạo, Kỹ thuật, Hợp tác, Giao tiếp) thay thế hình thức thi trắc nghiệm đơn thuần.",
    tags: ["Dự thảo", "Đánh giá", "Năng lực", "2026"],
  },
];

type FilterTab = "all" | NewsCategory;

export function AuthorityNews() {
  const [news] = useState<NewsItem[]>(INITIAL_NEWS);
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const published = news.filter(n => n.status === "published");
  const drafts    = news.filter(n => n.status === "draft");
  const totalViews = published.reduce((s, n) => s + n.views, 0);

  const filtered = useMemo(() => news.filter((n) => {
    const matchTab    = tab === "all" || n.category === tab;
    const matchSearch = !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchTab && matchSearch;
  }), [news, tab, search]);

  const TABS: { id: FilterTab; label: string }[] = [
    { id: "all",          label: "Tất cả" },
    { id: "policy",       label: "Chính sách" },
    { id: "research",     label: "Nghiên cứu" },
    { id: "trend",        label: "Xu hướng" },
    { id: "announcement", label: "Thông báo" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Newspaper}
        title="Tin tức & Xu hướng Giáo dục"
        subtitle="Cập nhật chính sách Bộ GD&ĐT, nghiên cứu giáo dục và xu hướng công nghệ Edtech mới nhất"
        accentColor={ACCENT}
        actions={
          <button
            onClick={() => toast.info("Soạn bài viết mới")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white hover:opacity-90"
            style={{ background: ACCENT, fontSize: "13px", fontWeight: 500 }}
          >
            <Plus className="w-4 h-4" /> Đăng bài mới
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Newspaper}  label="Đã đăng"       value={published.length} color={ACCENT} />
        <KpiCard icon={Eye}        label="Lượt xem"       value={`${(totalViews / 1000).toFixed(1)}K`} color="#2563eb" />
        <KpiCard icon={FileText}   label="Bản nháp"       value={drafts.length}    color="#c8a84e" subtitle="chờ xuất bản" />
        <KpiCard icon={Bell}       label="Thông báo mới"  value={news.filter(n => n.category === "announcement" && n.status === "published").length} color="#dc2626" />
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-muted rounded-xl p-1 flex-wrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={tab === t.id
                ? { background: "#fff", color: ACCENT, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                : { color: "var(--muted-foreground)" }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm bài viết, thẻ tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm w-60 focus:outline-none focus:ring-2"
          />
        </div>
      </div>

      {/* News list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm bg-card border border-border rounded-xl">
            Không có bài viết nào
          </div>
        )}
        {filtered.map((item) => {
          const catCfg = CAT_CFG[item.category];
          const CatIcon = catCfg.icon;
          return (
            <div key={item.id}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => toast.info(`Xem bài: ${item.title}`)}
            >
              <div className="flex items-start gap-4">
                {/* Category icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: catCfg.color + "15" }}>
                  <CatIcon className="w-5 h-5" style={{ color: catCfg.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                        style={{ background: catCfg.color }}>{catCfg.label}</span>
                      {item.status === "draft" && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Bản nháp
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                      {item.status === "published" && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.views.toLocaleString()}
                        </span>
                      )}
                      <span>{item.publishedAt}</span>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-gray-900 leading-snug mb-1.5">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{item.summary}</p>

                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-[11px] text-muted-foreground">
                      <span className="font-medium text-gray-600">{item.author}</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                          <Tag className="w-2.5 h-2.5" />{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
