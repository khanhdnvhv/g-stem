import { useState } from "react";
import {
  BarChart3, Search, Plus, Download, Eye, Clock, Star,
  FileText, PieChart, TrendingUp, Users, Building2, BookOpen,
  Award, Target, Calendar, Filter, Settings, Copy, Trash2,
  ChevronRight, ChevronDown, GripVertical, Check, Save,
  Maximize2, Table, LayoutGrid, ArrowUpDown, RefreshCw,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { useConfirm } from "./ConfirmDialog";

// ─── Types ───
interface ReportWidget {
  id: string;
  type: "kpi" | "bar" | "line" | "pie" | "table" | "heatmap";
  title: string;
  w: 1 | 2 | 3 | 4;
  h: 1 | 2;
  data?: any;
}

interface SavedReport {
  id: string;
  name: string;
  description: string;
  type: "dashboard" | "tabular" | "comparison";
  widgets: number;
  creator: string;
  createdAt: string;
  updatedAt: string;
  shared: boolean;
  scheduled: boolean;
  scheduleFreq?: string;
  views: number;
  tags: string[];
}

// ─── Mock Data ───
const SAVED_REPORTS: SavedReport[] = [
  { id: "RPT01", name: "Báo cáo Tổng hợp Q1/2026", description: "Tổng hợp KPIs đào tạo toàn tập đoàn quý 1/2026", type: "dashboard", widgets: 8, creator: "Nguyễn Văn Minh", createdAt: "01/01/2026", updatedAt: "10/03/2026", shared: true, scheduled: true, scheduleFreq: "Hàng tháng", views: 156, tags: ["Q1", "Tổng hợp", "Tập đoàn"] },
  { id: "RPT02", name: "So sánh Hiệu suất 14 Đơn vị", description: "So sánh tỷ lệ hoàn thành, giờ học, chi phí giữa các đơn vị thành viên", type: "comparison", widgets: 6, creator: "Nguyễn Văn Minh", createdAt: "15/02/2026", updatedAt: "08/03/2026", shared: true, scheduled: false, views: 89, tags: ["Đơn vị", "So sánh", "Hiệu suất"] },
  { id: "RPT03", name: "Chi tiết Khóa học Marketing số", description: "Phân tích chi tiết hiệu quả khóa Marketing số & Truyền thông", type: "tabular", widgets: 5, creator: "Phạm Anh Tuấn", createdAt: "20/02/2026", updatedAt: "12/03/2026", shared: false, scheduled: false, views: 34, tags: ["Marketing", "Chi tiết", "Khóa học"] },
  { id: "RPT04", name: "Ngân sách Đào tạo YTD", description: "Theo dõi ngân sách đào tạo từ đầu năm theo từng đơn vị và danh mục", type: "dashboard", widgets: 7, creator: "Nguyễn Văn Minh", createdAt: "01/02/2026", updatedAt: "11/03/2026", shared: true, scheduled: true, scheduleFreq: "Hàng tuần", views: 112, tags: ["Ngân sách", "YTD", "Chi phí"] },
  { id: "RPT05", name: "Compliance Training Status", description: "Trạng thái đào tạo bắt buộc theo đơn vị, phòng ban, cá nhân", type: "tabular", widgets: 4, creator: "Đỗ Thanh Hương", createdAt: "05/03/2026", updatedAt: "12/03/2026", shared: true, scheduled: true, scheduleFreq: "Hàng ngày", views: 201, tags: ["Compliance", "Bắt buộc", "Trạng thái"] },
  { id: "RPT06", name: "Learner Engagement Analysis", description: "Phân tích mức độ tương tác, thời gian học, completion rate theo nhóm nhân sự", type: "dashboard", widgets: 9, creator: "Nguyễn Văn Minh", createdAt: "10/01/2026", updatedAt: "09/03/2026", shared: false, scheduled: false, views: 67, tags: ["Engagement", "Learner", "Analytics"] },
];

const WIDGET_TYPES: { type: ReportWidget["type"]; label: string; icon: typeof BarChart3; color: string }[] = [
  { type: "kpi", label: "KPI Card", icon: Target, color: "#990803" },
  { type: "bar", label: "Bar Chart", icon: BarChart3, color: "#2563eb" },
  { type: "line", label: "Line Chart", icon: TrendingUp, color: "#16a34a" },
  { type: "pie", label: "Pie Chart", icon: PieChart, color: "#c8a84e" },
  { type: "table", label: "Data Table", icon: Table, color: "#7c3aed" },
  { type: "heatmap", label: "Heatmap", icon: LayoutGrid, color: "#ea580c" },
];

const DATA_SOURCES = [
  "Tỷ lệ hoàn thành khóa học", "Giờ học trung bình", "Số lượng đăng ký",
  "Điểm kiểm tra trung bình", "Tỷ lệ Compliance", "Chi phí đào tạo",
  "NPS / Satisfaction Score", "Số chứng chỉ cấp", "Tỷ lệ bỏ học",
  "Thời gian phản hồi GV", "ROI Đào tạo", "Active Learners",
];

const DIMENSIONS = [
  "Theo tháng", "Theo quý", "Theo công ty thành viên", "Theo phòng ban",
  "Theo danh mục đào tạo", "Theo giảng viên", "Theo khóa học", "Theo lĩnh vực",
];

const REPORT_TYPE_CONFIG = {
  dashboard: { label: "Dashboard", color: "#990803", bg: "#99080310" },
  tabular: { label: "Bảng dữ liệu", color: "#2563eb", bg: "#2563eb10" },
  comparison: { label: "So sánh", color: "#16a34a", bg: "#16a34a10" },
};

export function ReportBuilder() {
  const { user } = useAuth();
  const role = user?.role || "learner";
  const [tab, setTab] = useState<"saved" | "builder">("saved");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);

  const filtered = SAVED_REPORTS.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "all" && r.type !== filterType) return false;
    if (role === "learner" && !r.shared) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Tạo Báo cáo</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            {role === "admin" ? "Tạo báo cáo tùy chỉnh kéo-thả widgets cho toàn Tập đoàn" :
             role === "instructor" ? "Tạo báo cáo hiệu quả giảng dạy" :
             "Xem báo cáo tiến độ học tập cá nhân"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200">
        {[
          { id: "saved" as const, label: "Báo cáo đã lưu", count: filtered.length },
          { id: "builder" as const, label: "Tạo mới", icon: Plus },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            {"icon" in t && t.icon && <t.icon className="w-3.5 h-3.5" />}
            {t.label}
            {"count" in t && <span className="px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-400" style={{ fontSize: "10px" }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === "saved" ? (
        <SavedReportsView reports={filtered} search={search} setSearch={setSearch} filterType={filterType} setFilterType={setFilterType} role={role} onSelect={setSelectedReport} onEdit={() => setTab("builder")} />
      ) : (
        <ReportBuilderCanvas role={role} />
      )}

      {/* Report Preview Modal */}
      {selectedReport && <ReportPreviewModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </div>
  );
}

// ─── Saved Reports View ───
function SavedReportsView({ reports, search, setSearch, filterType, setFilterType, role, onSelect, onEdit }: {
  reports: SavedReport[]; search: string; setSearch: (s: string) => void; filterType: string; setFilterType: (s: string) => void; role: string; onSelect: (r: SavedReport) => void; onEdit: () => void;
}) {
  const { user } = useAuth();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm báo cáo..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả loại</option>
          {Object.entries(REPORT_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {reports.map(report => {
          const tCfg = REPORT_TYPE_CONFIG[report.type];
          return (
            <div key={report.id} onClick={() => onSelect(report)} className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: tCfg.color, backgroundColor: tCfg.bg }}>{tCfg.label}</span>
                <div className="flex items-center gap-1">
                  {report.scheduled && <Clock className="w-3 h-3 text-green-500" title={`Tự động: ${report.scheduleFreq}`} />}
                  {report.shared && <Users className="w-3 h-3 text-blue-400" title="Đã chia sẻ" />}
                </div>
              </div>
              <h4 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>{report.name}</h4>
              <p className="text-gray-400 mt-0.5 line-clamp-2" style={{ fontSize: "11px" }}>{report.description}</p>

              <div className="flex items-center gap-2 mt-3 text-gray-400" style={{ fontSize: "10px" }}>
                <span>{report.widgets} widgets</span>
                <span>•</span>
                <span>{report.creator}</span>
                <span>•</span>
                <span>Cập nhật: {report.updatedAt}</span>
              </div>

              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                <div className="flex gap-1">
                  {report.tags.slice(0, 2).map(t => (
                    <span key={t} className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded" style={{ fontSize: "8px" }}>#{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-gray-400" style={{ fontSize: "10px" }}><Eye className="w-3 h-3" /> {report.views}</span>
                  {(role === "admin" || report.creator === user?.name) && (
                    <button onClick={e => { e.stopPropagation(); onEdit(); }} className="p-1 hover:bg-gray-100 rounded cursor-pointer"><Settings className="w-3 h-3 text-gray-300" /></button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Create new card */}
        {(role === "admin" || role === "instructor") && (
          <button onClick={onEdit} className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-6 cursor-pointer hover:border-[#990803]/30 hover:bg-[#990803]/3 transition-all flex flex-col items-center justify-center gap-2 min-h-[180px]">
            <Plus className="w-8 h-8 text-gray-300" />
            <span className="text-gray-400" style={{ fontSize: "13px", fontWeight: 500 }}>Tạo báo cáo mới</span>
            <span className="text-gray-300" style={{ fontSize: "11px" }}>Kéo-thả widgets tùy chỉnh</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Report Builder Canvas ───
function ReportBuilderCanvas({ role }: { role: string }) {
  const confirm = useConfirm();
  const [widgets, setWidgets] = useState<ReportWidget[]>([
    { id: "w1", type: "kpi", title: "Tổng Nhân sự", w: 1, h: 1 },
    { id: "w2", type: "kpi", title: "Tỷ lệ Hoàn thành", w: 1, h: 1 },
    { id: "w3", type: "kpi", title: "Giờ học TB", w: 1, h: 1 },
    { id: "w4", type: "kpi", title: "Chi phí/người", w: 1, h: 1 },
    { id: "w5", type: "bar", title: "Hoàn thành theo Đơn vị", w: 2, h: 2 },
    { id: "w6", type: "pie", title: "Phân bổ Danh mục", w: 1, h: 2 },
    { id: "w7", type: "line", title: "Xu hướng Giờ học", w: 2, h: 1 },
    { id: "w8", type: "table", title: "Top 10 Khóa học", w: 2, h: 1 },
  ]);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [reportName, setReportName] = useState("Báo cáo tùy chỉnh mới");

  const removeWidget = async (id: string) => {
    const widget = widgets.find(w => w.id === id);
    const ok = await confirm({
      title: "Xóa widget?",
      message: `Bạn có chắc muốn xóa widget "${widget?.title || ""}" khỏi báo cáo?`,
      confirmLabel: "Xóa",
      variant: "warning",
    });
    if (ok) {
      setWidgets(prev => prev.filter(w => w.id !== id));
      import("sonner").then(m => m.toast.success("Đã xóa widget"));
    }
  };

  const addWidget = (type: ReportWidget["type"]) => {
    const newId = `w${Date.now()}`;
    const defaults: Record<string, Partial<ReportWidget>> = {
      kpi: { w: 1, h: 1, title: "KPI mới" },
      bar: { w: 2, h: 2, title: "Bar Chart mới" },
      line: { w: 2, h: 1, title: "Line Chart mới" },
      pie: { w: 1, h: 2, title: "Pie Chart mới" },
      table: { w: 2, h: 1, title: "Table mới" },
      heatmap: { w: 2, h: 2, title: "Heatmap mới" },
    };
    setWidgets(prev => [...prev, { id: newId, type, ...defaults[type] } as ReportWidget]);
    setShowAddWidget(false);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 flex-wrap">
        <input value={reportName} onChange={e => setReportName(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20 flex-1 max-w-sm" style={{ fontSize: "13px", fontWeight: 600 }} />
        <button onClick={() => setShowAddWidget(!showAddWidget)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
          <Plus className="w-3.5 h-3.5" /> Thêm Widget
        </button>
        <button onClick={() => { import("sonner").then(m => m.toast.info("Đang làm mới dữ liệu...")); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "12px" }}>
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới dữ liệu
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => { import("sonner").then(m => m.toast.success(`Đã lưu báo cáo "${reportName}"`)); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Save className="w-3.5 h-3.5" /> Lưu
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất báo cáo PDF...")); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Download className="w-3.5 h-3.5" /> Xuất PDF
          </button>
        </div>
      </div>

      {/* Widget Palette */}
      {showAddWidget && (
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <p className="text-gray-600 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Chọn loại Widget</p>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
            {WIDGET_TYPES.map(wt => (
              <button key={wt.type} onClick={() => addWidget(wt.type)} className="p-3 rounded-xl border border-gray-200 hover:border-[#990803]/30 hover:bg-[#990803]/3 cursor-pointer transition-all text-center">
                <wt.icon className="w-6 h-6 mx-auto" style={{ color: wt.color }} />
                <p className="text-gray-600 mt-1" style={{ fontSize: "10px", fontWeight: 500 }}>{wt.label}</p>
              </button>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-500 mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>Nguồn dữ liệu</p>
              <div className="flex flex-wrap gap-1">
                {DATA_SOURCES.map(ds => (
                  <span key={ds} onClick={() => { import("sonner").then(m => m.toast.info(`Nguồn dữ liệu: ${ds}`)); }} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full border border-gray-100 cursor-pointer hover:bg-[#990803]/5 hover:text-[#990803] hover:border-[#990803]/20 transition-colors" style={{ fontSize: "9px" }}>{ds}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>Chiều phân tích</p>
              <div className="flex flex-wrap gap-1">
                {DIMENSIONS.map(d => (
                  <span key={d} onClick={() => { import("sonner").then(m => m.toast.info(`Chiều dữ liệu: ${d}`)); }} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full border border-gray-100 cursor-pointer hover:bg-[#990803]/5 hover:text-[#990803] hover:border-[#990803]/20 transition-colors" style={{ fontSize: "9px" }}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Grid */}
      <div className="grid grid-cols-4 gap-3 auto-rows-[120px]">
        {widgets.map(widget => (
          <WidgetCard key={widget.id} widget={widget} onRemove={() => removeWidget(widget.id)} />
        ))}
      </div>
    </div>
  );
}

// ─── Widget Card ───
function WidgetCard({ widget, onRemove }: { widget: ReportWidget; onRemove: () => void }) {
  const wCfg = WIDGET_TYPES.find(w => w.type === widget.type);
  if (!wCfg) return null;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all relative group`} style={{ gridColumn: `span ${widget.w}`, gridRow: `span ${widget.h}` }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <GripVertical className="w-3 h-3 text-gray-200 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
          <wCfg.icon className="w-3.5 h-3.5" style={{ color: wCfg.color }} />
          <span className="text-gray-600" style={{ fontSize: "11px", fontWeight: 600 }}>{widget.title}</span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => { import("sonner").then(m => m.toast.info("Cài đặt widget...")); }} className="p-0.5 hover:bg-gray-100 rounded cursor-pointer"><Settings className="w-3 h-3 text-gray-300" /></button>
          <button onClick={() => { import("sonner").then(m => m.toast.info("Phóng to widget...")); }} className="p-0.5 hover:bg-gray-100 rounded cursor-pointer"><Maximize2 className="w-3 h-3 text-gray-300" /></button>
          <button onClick={onRemove} className="p-0.5 hover:bg-red-50 rounded cursor-pointer"><Trash2 className="w-3 h-3 text-gray-300 hover:text-red-400" /></button>
        </div>
      </div>

      {/* Widget Content */}
      {widget.type === "kpi" && <KPIWidget title={widget.title} />}
      {widget.type === "bar" && <BarWidget />}
      {widget.type === "line" && <LineWidget />}
      {widget.type === "pie" && <PieWidget />}
      {widget.type === "table" && <TableWidget />}
      {widget.type === "heatmap" && <HeatmapWidget />}
    </div>
  );
}

// ─── SVG Mini Widgets ───

function KPIWidget({ title }: { title: string }) {
  const values: Record<string, { value: string; change: string; up: boolean }> = {
    "Tổng Nhân sự": { value: "6,610", change: "+128", up: true },
    "Tỷ lệ Hoàn thành": { value: "83.2%", change: "-1.2%", up: false },
    "Giờ học TB": { value: "24.5h", change: "+3.2h", up: true },
    "Chi phí/người": { value: "2.8M", change: "-5%", up: true },
  };
  const v = values[title] || { value: "—", change: "N/A", up: true };
  return (
    <div className="flex flex-col justify-center h-[calc(100%-30px)]">
      <p className="text-gray-800" style={{ fontSize: "28px", fontWeight: 700, lineHeight: 1.1 }}>{v.value}</p>
      <p className={`mt-1 ${v.up ? "text-green-600" : "text-red-500"}`} style={{ fontSize: "11px", fontWeight: 500 }}>
        {v.up ? "↑" : "↓"} {v.change}
      </p>
    </div>
  );
}

function BarWidget() {
  const data = [
    { name: "ABBank", value: 87 }, { name: "BĐS", value: 82 }, { name: "Energy", value: 78 },
    { name: "Cement", value: 91 }, { name: "Tech", value: 75 }, { name: "Insurance", value: 84 },
  ];
  const W = 320, H = 150, pL = 55, pR = 10, pT = 5, pB = 20;
  const bH = (H - pT - pB) / data.length - 4;
  const maxV = 100;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {data.map((d, i) => {
        const y = pT + i * (bH + 4);
        const bW = ((d.value / maxV) * (W - pL - pR));
        return (
          <g key={d.name}>
            <text x={pL - 4} y={y + bH / 2 + 1} textAnchor="end" dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "9px" }}>{d.name}</text>
            <rect x={pL} y={y} width={W - pL - pR} height={bH} rx="3" fill="#f3f4f6" />
            <rect x={pL} y={y} width={bW} height={bH} rx="3" fill={d.value >= 85 ? "#16a34a" : d.value >= 80 ? "#990803" : "#ea580c"} opacity="0.8" />
            <text x={pL + bW + 4} y={y + bH / 2 + 1} dominantBaseline="central" fill="#6b7280" style={{ fontSize: "8px" }}>{d.value}%</text>
          </g>
        );
      })}
    </svg>
  );
}

function LineWidget() {
  const data = [120, 145, 132, 168, 155, 190, 178, 210, 198, 225, 215, 240];
  const W = 320, H = 80, pL = 5, pR = 5, pT = 5, pB = 5;
  const cW = W - pL - pR, cH = H - pT - pB;
  const maxV = Math.max(...data);
  const pts = data.map((v, i) => `${pL + (i / (data.length - 1)) * cW},${pT + cH - (v / maxV) * cH}`).join(" ");
  const area = `M${pL},${pT + cH} ` + data.map((v, i) => `L${pL + (i / (data.length - 1)) * cW},${pT + cH - (v / maxV) * cH}`).join(" ") + ` L${pL + cW},${pT + cH} Z`;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="rbLineGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#990803" stopOpacity="0.2" /><stop offset="100%" stopColor="#990803" stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill="url(#rbLineGrad)" />
      <polyline points={pts} fill="none" stroke="#990803" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function PieWidget() {
  const slices = [
    { value: 25, color: "#990803" }, { value: 20, color: "#2563eb" },
    { value: 18, color: "#c8a84e" }, { value: 15, color: "#16a34a" },
    { value: 12, color: "#7c3aed" }, { value: 10, color: "#ea580c" },
  ];
  const labels = ["Quản trị", "Tài chính", "Marketing", "IT", "Kỹ năng", "ATLĐ"];
  const cx = 70, cy = 70, outerR = 60, innerR = 35;
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  let cum = 0;
  return (
    <div className="flex items-center h-[calc(100%-30px)]">
      <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
        {slices.map((sl, i) => {
          const startAngle = (cum / total) * 360 - 90;
          cum += sl.value;
          const endAngle = (cum / total) * 360 - 90;
          const s = (startAngle * Math.PI) / 180;
          const e = (endAngle * Math.PI) / 180;
          const lg = e - s > Math.PI ? 1 : 0;
          const d = [
            `M ${cx + outerR * Math.cos(s)} ${cy + outerR * Math.sin(s)}`,
            `A ${outerR} ${outerR} 0 ${lg} 1 ${cx + outerR * Math.cos(e)} ${cy + outerR * Math.sin(e)}`,
            `L ${cx + innerR * Math.cos(e)} ${cy + innerR * Math.sin(e)}`,
            `A ${innerR} ${innerR} 0 ${lg} 0 ${cx + innerR * Math.cos(s)} ${cy + innerR * Math.sin(s)}`,
            'Z',
          ].join(' ');
          return <path key={i} d={d} fill={sl.color} />;
        })}
      </svg>
      <div className="ml-2 space-y-1">
        {slices.map((sl, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sl.color }} />
            <span className="text-gray-500" style={{ fontSize: "8px" }}>{labels[i]} {sl.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableWidget() {
  const rows = [
    { name: "Kỹ năng Lãnh đạo", enrolled: 456, completion: "87%", rating: "4.8" },
    { name: "Marketing số", enrolled: 312, completion: "71%", rating: "4.5" },
    { name: "Tài chính DN", enrolled: 234, completion: "65%", rating: "4.3" },
    { name: "An toàn LĐ", enrolled: 890, completion: "92%", rating: "4.1" },
  ];
  return (
    <div className="overflow-x-auto h-[calc(100%-30px)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-1.5 text-gray-400" style={{ fontSize: "9px", fontWeight: 600 }}>Khóa học</th>
            <th className="text-right py-1.5 text-gray-400" style={{ fontSize: "9px", fontWeight: 600 }}>Đăng ký</th>
            <th className="text-right py-1.5 text-gray-400" style={{ fontSize: "9px", fontWeight: 600 }}>HT</th>
            <th className="text-right py-1.5 text-gray-400" style={{ fontSize: "9px", fontWeight: 600 }}>Rating</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.name} className="border-b border-gray-50">
              <td className="py-1.5 text-gray-600" style={{ fontSize: "10px" }}>{r.name}</td>
              <td className="text-right py-1.5 text-gray-500" style={{ fontSize: "10px" }}>{r.enrolled}</td>
              <td className="text-right py-1.5 text-gray-500" style={{ fontSize: "10px" }}>{r.completion}</td>
              <td className="text-right py-1.5 text-[#c8a84e]" style={{ fontSize: "10px" }}>{r.rating}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HeatmapWidget() {
  const rows = 5, cols = 7;
  const cellW = 30, cellH = 20, gap = 2;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${cols * (cellW + gap)} ${rows * (cellH + gap) + 15}`} preserveAspectRatio="xMidYMid meet">
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => {
          const val = Math.random();
          const opacity = 0.1 + val * 0.9;
          return <rect key={`${r}-${c}`} x={c * (cellW + gap)} y={r * (cellH + gap)} width={cellW} height={cellH} rx="3" fill="#990803" opacity={opacity} />;
        })
      )}
    </svg>
  );
}

// ─── Report Preview Modal ───
function ReportPreviewModal({ report, onClose }: { report: SavedReport; onClose: () => void }) {
  const tCfg = REPORT_TYPE_CONFIG[report.type];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: tCfg.color, backgroundColor: tCfg.bg }}>{tCfg.label}</span>
          {report.scheduled && <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded" style={{ fontSize: "10px" }}>⏰ {report.scheduleFreq}</span>}
          {report.shared && <span className="px-2 py-0.5 bg-blue-50 text-blue-500 rounded" style={{ fontSize: "10px" }}>Chia sẻ</span>}
        </div>
        <h3 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>{report.name}</h3>
        <p className="text-gray-500 mt-1" style={{ fontSize: "13px" }}>{report.description}</p>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="p-2.5 bg-gray-50 rounded-lg">
            <p className="text-gray-400" style={{ fontSize: "10px" }}>Tạo bởi</p>
            <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{report.creator}</p>
          </div>
          <div className="p-2.5 bg-gray-50 rounded-lg">
            <p className="text-gray-400" style={{ fontSize: "10px" }}>Widgets</p>
            <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{report.widgets} widgets</p>
          </div>
          <div className="p-2.5 bg-gray-50 rounded-lg">
            <p className="text-gray-400" style={{ fontSize: "10px" }}>Cập nhật</p>
            <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{report.updatedAt}</p>
          </div>
          <div className="p-2.5 bg-gray-50 rounded-lg">
            <p className="text-gray-400" style={{ fontSize: "10px" }}>Lượt xem</p>
            <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{report.views}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {report.tags.map(t => <span key={t} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full border border-gray-100" style={{ fontSize: "10px" }}>#{t}</span>)}
        </div>

        <div className="flex items-center gap-2 mt-4">
          <button onClick={() => { onClose(); import("sonner").then(m => m.toast.info(`Đang mở báo cáo: ${report.name}`)); }} className="flex-1 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center justify-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Eye className="w-4 h-4" /> Mở báo cáo
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất PDF...")); }} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center gap-1.5" style={{ fontSize: "13px" }}>
            <Download className="w-4 h-4" /> Xuất PDF
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đã sao chép link báo cáo!")); }} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "13px" }}>
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <button onClick={onClose} className="w-full mt-2 py-2 text-gray-400 hover:bg-gray-50 rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>Đóng</button>
      </div>
    </div>
  );
}