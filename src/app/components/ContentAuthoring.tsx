import { useState } from "react";
import {
  FileText, Plus, Edit, Trash2, Eye, Search, Filter,
  CheckCircle, Clock, AlertTriangle, XCircle,
  BookOpen, Video, Image, Mic, Code, Type,
  Layers, Copy, Download, Upload, Play, Pause,
  Layout, Grid3X3, List, BarChart3, Users,
  Star, Zap, Globe, Lock, Settings,
  ChevronRight, ArrowRight, RefreshCw, Save,
  Monitor, Smartphone, Tablet,
} from "lucide-react";
import { toast } from "@/app/lib/toast";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface ContentItem {
  id: string;
  title: string;
  type: "lesson" | "quiz" | "video" | "interactive" | "document" | "scorm";
  status: "published" | "draft" | "review" | "archived";
  author: string;
  course: string;
  category: string;
  lastModified: string;
  version: number;
  duration: string;
  views: number;
  rating: number;
  language: string;
  slides: number;
  mediaCount: number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  type: string;
  thumbnail: string;
  usage: number;
  category: string;
}

// ─── Mock Data ───
const CONTENT_ITEMS: ContentItem[] = [
  { id: "C01", title: "Kỹ năng Lãnh đạo 4.0 - Bài 1: Tư duy Chiến lược", type: "lesson", status: "published", author: "Trần Thị Hương", course: "Kỹ năng Lãnh đạo 4.0", category: "Lãnh đạo", lastModified: "12/03/2026", version: 3, duration: "25 phút", views: 1840, rating: 4.8, language: "vi", slides: 18, mediaCount: 4 },
  { id: "C02", title: "An toàn Lao động - Video Thực hành Công trường", type: "video", status: "published", author: "Phạm Đức Mạnh", course: "ATLĐ Công trường", category: "Compliance", lastModified: "11/03/2026", version: 2, duration: "12 phút", views: 3200, rating: 4.6, language: "vi", slides: 0, mediaCount: 1 },
  { id: "C03", title: "Excel VBA - Bài tập Tương tác Macro", type: "interactive", status: "published", author: "Nguyễn Minh Anh", course: "Excel & VBA", category: "IT", lastModified: "10/03/2026", version: 5, duration: "35 phút", views: 2150, rating: 4.9, language: "vi", slides: 0, mediaCount: 8 },
  { id: "C04", title: "Digital Marketing - Quiz Tổng hợp", type: "quiz", status: "review", author: "Lê Quốc Vương", course: "Digital Marketing", category: "Marketing", lastModified: "12/03/2026", version: 1, duration: "20 phút", views: 0, rating: 0, language: "vi", slides: 0, mediaCount: 0 },
  { id: "C05", title: "Phòng cháy Chữa cháy - SCORM Package", type: "scorm", status: "published", author: "Hoàng Minh Tuấn", course: "PCCC", category: "Compliance", lastModified: "08/03/2026", version: 1, duration: "45 phút", views: 890, rating: 4.3, language: "vi", slides: 25, mediaCount: 12 },
  { id: "C06", title: "Customer Experience - Tài liệu Tham khảo", type: "document", status: "draft", author: "Trần Thị Hương", course: "CX Excellence", category: "Dịch vụ KH", lastModified: "11/03/2026", version: 1, duration: "—", views: 0, rating: 0, language: "vi", slides: 0, mediaCount: 2 },
  { id: "C07", title: "ESG & Phát triển Bền vững - Module 1", type: "lesson", status: "draft", author: "Vũ Thị Mai", course: "ESG", category: "Chiến lược", lastModified: "10/03/2026", version: 1, duration: "30 phút", views: 0, rating: 0, language: "vi", slides: 22, mediaCount: 6 },
  { id: "C08", title: "AI & ML - Lab Thực hành Python", type: "interactive", status: "published", author: "Đỗ Thị Lan", course: "AI & ML Thực hành", category: "Công nghệ", lastModified: "09/03/2026", version: 4, duration: "50 phút", views: 1280, rating: 4.7, language: "en", slides: 0, mediaCount: 5 },
  { id: "C09", title: "Kỹ năng Đàm phán - Bài giảng Audio", type: "video", status: "review", author: "Nguyễn Minh Anh", course: "Kỹ năng Mềm", category: "Kỹ năng mềm", lastModified: "12/03/2026", version: 1, duration: "18 phút", views: 0, rating: 0, language: "vi", slides: 0, mediaCount: 1 },
  { id: "C10", title: "Luật Lao động 2025 - Cập nhật", type: "document", status: "archived", author: "Phạm Đức Mạnh", course: "Pháp luật LĐ", category: "Pháp luật", lastModified: "01/01/2026", version: 2, duration: "—", views: 560, rating: 4.1, language: "vi", slides: 0, mediaCount: 0 },
];

const TEMPLATES: Template[] = [
  { id: "TM01", name: "Bài giảng Slide chuẩn", description: "Template slide với header/body/quiz chuẩn Geleximco", type: "lesson", thumbnail: "📊", usage: 85, category: "Bài giảng" },
  { id: "TM02", name: "Video Bài giảng", description: "Template video với intro/content/outro branding", type: "video", thumbnail: "🎬", usage: 42, category: "Video" },
  { id: "TM03", name: "Bài tập Tương tác", description: "Drag-drop, fill-in, matching exercises", type: "interactive", thumbnail: "🎮", usage: 28, category: "Tương tác" },
  { id: "TM04", name: "Quiz/Kiểm tra", description: "MCQ, True/False, Short answer template", type: "quiz", thumbnail: "📝", usage: 65, category: "Kiểm tra" },
  { id: "TM05", name: "Case Study", description: "Scenario-based learning với decision trees", type: "interactive", thumbnail: "🔍", usage: 18, category: "Case Study" },
  { id: "TM06", name: "Microlearning Card", description: "Nội dung ngắn 3-5 phút, mobile-friendly", type: "lesson", thumbnail: "📱", usage: 35, category: "Microlearning" },
];

const STATUS_CFG = {
  published: { label: "Đã xuất bản", color: "#16a34a", bg: "#16a34a10", icon: CheckCircle },
  draft: { label: "Nháp", color: "#c8a84e", bg: "#c8a84e10", icon: Clock },
  review: { label: "Chờ duyệt", color: "#2563eb", bg: "#2563eb10", icon: Eye },
  archived: { label: "Lưu trữ", color: "#6b7280", bg: "#6b728010", icon: Lock },
};

const TYPE_CFG: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  lesson: { icon: BookOpen, color: "#990803", label: "Bài giảng" },
  video: { icon: Video, color: "#7c3aed", label: "Video" },
  interactive: { icon: Zap, color: "#ea580c", label: "Tương tác" },
  quiz: { icon: FileText, color: "#2563eb", label: "Quiz" },
  document: { icon: FileText, color: "#6b7280", label: "Tài liệu" },
  scorm: { icon: Code, color: "#16a34a", label: "SCORM" },
};

export function ContentAuthoring() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"content" | "editor" | "templates" | "media">("content");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editorContent, setEditorContent] = useState<ContentItem | null>(null);

  const published = CONTENT_ITEMS.filter(c => c.status === "published").length;
  const totalViews = CONTENT_ITEMS.reduce((s, c) => s + c.views, 0);
  const avgRating = +(CONTENT_ITEMS.filter(c => c.rating > 0).reduce((s, c) => s + c.rating, 0) / CONTENT_ITEMS.filter(c => c.rating > 0).length).toFixed(1);
  const pendingReview = CONTENT_ITEMS.filter(c => c.status === "review").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Edit className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Content Authoring Studio</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Tạo, chỉnh sửa và quản lý nội dung e-learning cho toàn hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { import("sonner").then(m => m.toast.info("Mở dialog Import SCORM...")); }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Upload className="w-4 h-4" /> Import SCORM
          </button>
          <button onClick={() => { setEditorContent(null); setTab("editor"); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Tạo Nội dung
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Tổng Nội dung", value: CONTENT_ITEMS.length, icon: Layers, color: "#990803" },
          { label: "Đã xuất bản", value: published, icon: CheckCircle, color: "#16a34a" },
          { label: "Chờ duyệt", value: pendingReview, icon: Eye, color: "#2563eb" },
          { label: "Tổng Lượt xem", value: totalViews.toLocaleString(), icon: BarChart3, color: "#7c3aed" },
          { label: "Rating TB", value: avgRating, icon: Star, color: "#c8a84e" },
          { label: "Templates", value: TEMPLATES.length, icon: Grid3X3, color: "#ea580c" },
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

      {/* Content Type Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Phân bố Loại Nội dung & Views</h3>
        <ContentDistributionChart items={CONTENT_ITEMS} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200 overflow-x-auto">
        {[
          { id: "content" as const, label: "Thư viện", icon: Layers },
          { id: "editor" as const, label: "Trình soạn thảo", icon: Edit },
          { id: "templates" as const, label: "Templates", icon: Grid3X3 },
          { id: "media" as const, label: "Thư viện Media", icon: Image },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "content" && <ContentLibraryTab items={CONTENT_ITEMS} search={search} setSearch={setSearch} filterType={filterType} setFilterType={setFilterType} filterStatus={filterStatus} setFilterStatus={setFilterStatus} onEdit={(c) => { setEditorContent(c); setTab("editor"); }} />}
      {tab === "editor" && <EditorTab content={editorContent} />}
      {tab === "templates" && <TemplatesTab templates={TEMPLATES} />}
      {tab === "media" && <MediaLibraryTab />}
    </div>
  );
}

// ─── Content Distribution Chart ───
function ContentDistributionChart({ items }: { items: ContentItem[] }) {
  const types = Object.keys(TYPE_CFG);
  const typeCounts = types.map(t => ({ type: t, count: items.filter(i => i.type === t).length, views: items.filter(i => i.type === t).reduce((s, i) => s + i.views, 0), ...TYPE_CFG[t] }));
  const maxViews = Math.max(...typeCounts.map(t => t.views));

  return (
    <svg width="100%" height="80" viewBox="0 0 600 80" preserveAspectRatio="xMidYMid meet">
      {typeCounts.map((t, i) => {
        const x = 10 + i * 95;
        const barH = maxViews > 0 ? (t.views / maxViews) * 45 : 0;
        return (
          <g key={t.type}>
            <rect x={x} y={50 - barH} width="70" height={barH} rx="4" fill={t.color} opacity="0.5" />
            <text x={x + 35} y={46 - barH} textAnchor="middle" fill={t.color} style={{ fontSize: "8px", fontWeight: 700 }}>{t.views.toLocaleString()}</text>
            <text x={x + 35} y={62} textAnchor="middle" fill="#6b7280" style={{ fontSize: "7px", fontWeight: 600 }}>{t.label}</text>
            <text x={x + 35} y={73} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "7px" }}>{t.count} items</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Content Library Tab ───
function ContentLibraryTab({ items, search, setSearch, filterType, setFilterType, filterStatus, setFilterStatus, onEdit }: {
  items: ContentItem[]; search: string; setSearch: (s: string) => void;
  filterType: string; setFilterType: (s: string) => void;
  filterStatus: string; setFilterStatus: (s: string) => void;
  onEdit: (c: ContentItem) => void;
}) {
  const filtered = items.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "all" && c.type !== filterType) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm nội dung..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả loại</option>
          {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="text-gray-400 ml-auto" style={{ fontSize: "11px" }}>{filtered.length} items</span>
      </div>

      {filtered.map(c => {
        const stCfg = STATUS_CFG[c.status];
        const tyCfg = TYPE_CFG[c.type];
        const StIcon = stCfg.icon;
        const TyIcon = tyCfg.icon;
        return (
          <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: tyCfg.color + "10" }}>
                <TyIcon className="w-5 h-5" style={{ color: tyCfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{c.title}</h4>
                  <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: tyCfg.color, backgroundColor: tyCfg.color + "10" }}>{tyCfg.label}</span>
                  <span className="px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ fontSize: "8px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>
                    <StIcon className="w-2 h-2" /> {stCfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: "10px" }}>
                  <span>📚 {c.course}</span>
                  <span>👤 {c.author}</span>
                  <span>⏱ {c.duration}</span>
                  <span>v{c.version}</span>
                  <span>{c.lastModified}</span>
                  {c.views > 0 && <span>👁 {c.views.toLocaleString()}</span>}
                  {c.rating > 0 && <span style={{ color: "#c8a84e" }}>★ {c.rating}</span>}
                  {c.slides > 0 && <span>📄 {c.slides} slides</span>}
                  {c.mediaCount > 0 && <span>🎞 {c.mediaCount} media</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => onEdit(c)} className="p-1.5 text-gray-300 hover:text-[#990803] cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                <button onClick={() => toast.info(`Xem trước: ${c.title}`)} className="p-1.5 text-gray-300 hover:text-[#2563eb] cursor-pointer"><Eye className="w-3.5 h-3.5" /></button>
                <button onClick={() => toast.success(`Đã tạo bản sao: ${c.title}`)} className="p-1.5 text-gray-300 hover:text-gray-500 cursor-pointer"><Copy className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Editor Tab ───
function EditorTab({ content }: { content: ContentItem | null }) {
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const isNew = !content;
  const title = content?.title || "Nội dung mới";

  return (
    <div className="space-y-3">
      {/* Editor Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-0">
            <input defaultValue={title} placeholder="Tiêu đề nội dung..." className="w-full text-gray-800 bg-transparent focus:outline-none" style={{ fontSize: "16px", fontWeight: 700 }} />
          </div>
          <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
            {(["desktop", "tablet", "mobile"] as const).map(d => {
              const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
              return (
                <button key={d} onClick={() => setPreviewDevice(d)} className={`p-1.5 rounded cursor-pointer ${previewDevice === d ? "bg-[#990803]/10 text-[#990803]" : "text-gray-300 hover:text-gray-500"}`}>
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          <button onClick={() => { import("sonner").then(m => m.toast.info("Đang mở preview nội dung...")); }} className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "11px" }}>
            <Eye className="w-3 h-3" /> Xem trước
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đã lưu nội dung!")); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "11px" }}>
            <Save className="w-3 h-3" /> Lưu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Editor Canvas */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Formatting Toolbar */}
          <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-200 flex-wrap">
            {["H1", "H2", "H3", "B", "I", "U"].map(btn => (
              <button key={btn} className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded cursor-pointer" style={{ fontSize: "11px", fontWeight: btn.length <= 2 ? 700 : 400 }}>{btn}</button>
            ))}
            <div className="w-px h-5 bg-gray-200 mx-1" />
            {[List, Image, Video, Code, Globe].map((Icon, i) => (
              <button key={i} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded cursor-pointer">
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* Canvas Area */}
          <div className={`p-6 min-h-[400px] ${previewDevice === "mobile" ? "max-w-sm mx-auto" : previewDevice === "tablet" ? "max-w-xl mx-auto" : ""}`}>
            {isNew ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-[#990803]/10 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-[#990803]" />
                </div>
                <h3 className="text-gray-700 mb-1" style={{ fontSize: "16px", fontWeight: 600 }}>Bắt đầu Tạo Nội dung</h3>
                <p className="text-gray-400 mb-4" style={{ fontSize: "13px" }}>Chọn một template hoặc bắt đầu từ trang trống</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-w-lg mx-auto">
                  {[
                    { icon: "📊", label: "Slide Bài giảng", desc: "Từ template chuẩn" },
                    { icon: "🎬", label: "Video Bài giảng", desc: "Upload hoặc record" },
                    { icon: "🎮", label: "Tương tác", desc: "Drag-drop, matching" },
                    { icon: "📝", label: "Quiz", desc: "MCQ, True/False" },
                    { icon: "📄", label: "Tài liệu", desc: "PDF, Word upload" },
                    { icon: "📦", label: "Import SCORM", desc: "SCORM 1.2 / 2004" },
                  ].map((opt, i) => (
                    <button key={i} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 text-center cursor-pointer transition-all">
                      <span style={{ fontSize: "24px" }}>{opt.icon}</span>
                      <p className="text-gray-700 mt-1" style={{ fontSize: "11px", fontWeight: 600 }}>{opt.label}</p>
                      <p className="text-gray-400" style={{ fontSize: "9px" }}>{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#990803]/5 rounded-xl p-4">
                  <h2 className="text-[#990803]" style={{ fontSize: "18px", fontWeight: 700 }}>{content.title}</h2>
                  <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>{content.course} • {content.category} • v{content.version}</p>
                </div>
                {/* Mock slide blocks */}
                {[
                  { type: "text", content: "Trong thời đại chuyển đổi số, kỹ năng lãnh đạo không chỉ dừng lại ở việc quản lý con người..." },
                  { type: "image", content: "📊 [Biểu đồ: Mô hình Leadership 4.0]" },
                  { type: "text", content: "Bốn trụ cột của Lãnh đạo 4.0:\n1. Digital Mindset\n2. Agile Leadership\n3. Data-Driven Decision\n4. People Empowerment" },
                  { type: "quiz", content: "❓ Quiz: Yếu tố nào KHÔNG thuộc Lãnh đạo 4.0?\nA. Digital Mindset ○\nB. Micromanagement ●\nC. Agile Leadership ○\nD. People Empowerment ○" },
                ].map((block, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${block.type === "quiz" ? "border-[#2563eb]/30 bg-[#2563eb]/5" : block.type === "image" ? "border-[#7c3aed]/30 bg-[#7c3aed]/5 text-center" : "border-gray-200 bg-white"}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-gray-300" style={{ fontSize: "8px" }}>Block {i + 1}</span>
                      <span className="text-gray-200" style={{ fontSize: "8px" }}>• {block.type}</span>
                    </div>
                    <p className="text-gray-600 whitespace-pre-line" style={{ fontSize: "12px" }}>{block.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Properties */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h4 className="text-gray-600 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Thuộc tính</h4>
            <div className="space-y-2">
              {[
                { label: "Loại", value: content ? TYPE_CFG[content.type].label : "—" },
                { label: "Khóa học", value: content?.course || "—" },
                { label: "Danh mục", value: content?.category || "—" },
                { label: "Ngôn ngữ", value: content?.language?.toUpperCase() || "VI" },
                { label: "Thời lượng", value: content?.duration || "—" },
                { label: "Phiên bản", value: content ? `v${content.version}` : "v1" },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-400" style={{ fontSize: "10px" }}>{p.label}</span>
                  <span className="text-gray-600" style={{ fontSize: "10px", fontWeight: 500 }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h4 className="text-gray-600 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Thêm Block</h4>
            <div className="grid grid-cols-2 gap-1">
              {[
                { icon: Type, label: "Text" },
                { icon: Image, label: "Hình ảnh" },
                { icon: Video, label: "Video" },
                { icon: Mic, label: "Audio" },
                { icon: Code, label: "Code" },
                { icon: FileText, label: "Quiz" },
              ].map((b, i) => (
                <button key={i} className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer text-gray-500" style={{ fontSize: "10px" }}>
                  <b.icon className="w-3 h-3" /> {b.label}
                </button>
              ))}
            </div>
          </div>

          {content && (
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <h4 className="text-gray-600 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Thống kê</h4>
              <div className="space-y-1.5">
                {[
                  { label: "Lượt xem", value: content.views.toLocaleString() },
                  { label: "Rating", value: content.rating > 0 ? `★ ${content.rating}` : "—" },
                  { label: "Media files", value: content.mediaCount },
                  { label: "Slides", value: content.slides > 0 ? content.slides : "—" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-gray-400" style={{ fontSize: "10px" }}>{s.label}</span>
                    <span className="text-gray-600" style={{ fontSize: "10px", fontWeight: 600 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Templates Tab ───
function TemplatesTab({ templates }: { templates: Template[] }) {
  return (
    <div className="space-y-3">
      <p className="text-gray-500" style={{ fontSize: "12px" }}>Chọn template để bắt đầu tạo nội dung nhanh</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map(t => (
          <div key={t.id} onClick={() => { import("sonner").then(m => m.toast.info(`Chọn template: ${t.name}`)); }} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="text-center mb-3">
              <span style={{ fontSize: "40px" }}>{t.thumbnail}</span>
            </div>
            <h4 className="text-gray-800 text-center mb-1" style={{ fontSize: "13px", fontWeight: 600 }}>{t.name}</h4>
            <p className="text-gray-400 text-center mb-2" style={{ fontSize: "11px" }}>{t.description}</p>
            <div className="flex items-center justify-between">
              <span className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded" style={{ fontSize: "9px" }}>{t.category}</span>
              <span className="text-gray-300" style={{ fontSize: "9px" }}>Đã dùng: {t.usage} lần</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Media Library Tab ───
function MediaLibraryTab() {
  const mediaItems = [
    { id: "M01", name: "leadership-banner.jpg", type: "image", size: "2.4 MB", uploadedBy: "Trần Thị Hương", date: "12/03/2026", usedIn: 5 },
    { id: "M02", name: "safety-training.mp4", type: "video", size: "145 MB", uploadedBy: "Phạm Đức Mạnh", date: "11/03/2026", usedIn: 3 },
    { id: "M03", name: "geleximco-logo.svg", type: "image", size: "12 KB", uploadedBy: "Admin", date: "01/01/2024", usedIn: 156 },
    { id: "M04", name: "excel-vba-demo.mp4", type: "video", size: "82 MB", uploadedBy: "Nguyễn Minh Anh", date: "10/03/2026", usedIn: 2 },
    { id: "M05", name: "compliance-handbook.pdf", type: "document", size: "5.8 MB", uploadedBy: "Phạm Đức Mạnh", date: "08/03/2026", usedIn: 8 },
    { id: "M06", name: "onboarding-audio.mp3", type: "audio", size: "18 MB", uploadedBy: "Lê Quốc Vương", date: "05/03/2026", usedIn: 1 },
    { id: "M07", name: "esg-infographic.png", type: "image", size: "1.2 MB", uploadedBy: "Vũ Thị Mai", date: "10/03/2026", usedIn: 2 },
    { id: "M08", name: "ai-lab-screen.mp4", type: "video", size: "210 MB", uploadedBy: "Đỗ Thị Lan", date: "09/03/2026", usedIn: 4 },
  ];

  const totalSize = "484 MB";
  const typeIcons: Record<string, { icon: string; color: string }> = {
    image: { icon: "🖼️", color: "#7c3aed" },
    video: { icon: "🎬", color: "#2563eb" },
    document: { icon: "📄", color: "#6b7280" },
    audio: { icon: "🎵", color: "#ea580c" },
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-gray-500" style={{ fontSize: "12px" }}>Tổng: {mediaItems.length} files • {totalSize}</p>
        <button onClick={() => { import("sonner").then(m => m.toast.info("Mở dialog upload media...")); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#990803] text-white rounded-lg cursor-pointer" style={{ fontSize: "11px" }}>
          <Upload className="w-3 h-3" /> Upload
        </button>
      </div>
      {mediaItems.map(m => {
        const tIcon = typeIcons[m.type] || typeIcons.document;
        return (
          <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <span style={{ fontSize: "18px" }}>{tIcon.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{m.name}</h4>
              <div className="flex items-center gap-2 text-gray-400" style={{ fontSize: "10px" }}>
                <span>{m.type}</span>
                <span>{m.size}</span>
                <span>{m.uploadedBy}</span>
                <span>{m.date}</span>
                <span>Dùng: {m.usedIn} nơi</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => toast.info(`Xem trước: ${m.name}`)} className="p-1.5 text-gray-300 hover:text-[#990803] cursor-pointer"><Eye className="w-3.5 h-3.5" /></button>
              <button onClick={() => toast.success(`Đang tải: ${m.name}`)} className="p-1.5 text-gray-300 hover:text-[#2563eb] cursor-pointer"><Download className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}