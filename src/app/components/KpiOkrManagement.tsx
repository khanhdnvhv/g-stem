import { useState } from "react";
import {
  Target, TrendingUp, Users, Building2, Search, Filter,
  ChevronRight, CheckCircle, AlertTriangle, Clock,
  Award, BookOpen, BarChart3, Star, Zap, ArrowUp,
  ArrowDown, Minus, Eye, Edit, Plus, Calendar,
  Activity, Layers, GitBranch, Flag,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface OKR {
  id: string;
  title: string;
  type: "company" | "department" | "individual";
  owner: string;
  ownerInitials: string;
  subsidiary: string;
  department: string;
  period: string;
  progress: number;
  status: "on-track" | "at-risk" | "behind" | "completed";
  keyResults: KeyResult[];
  linkedTraining: LinkedTraining[];
}

interface KeyResult {
  id: string;
  title: string;
  metric: string;
  target: number;
  current: number;
  unit: string;
  trend: "up" | "down" | "flat";
}

interface LinkedTraining {
  courseId: string;
  title: string;
  completion: number;
  impact: "high" | "medium" | "low";
}

// ─── Mock Data ───
const OKRS: OKR[] = [
  {
    id: "OKR01", title: "Nâng cao Năng lực Chuyển đổi số Tập đoàn",
    type: "company", owner: "BLD Tập đoàn", ownerInitials: "TĐ",
    subsidiary: "VP Tập đoàn", department: "Chiến lược", period: "Q1/2026",
    progress: 72, status: "on-track",
    keyResults: [
      { id: "KR01a", title: "80% nhân sự hoàn thành khóa Digital Literacy", metric: "Tỷ lệ hoàn thành", target: 80, current: 68, unit: "%", trend: "up" },
      { id: "KR01b", title: "Triển khai AI/ML tại 10/14 đơn vị", metric: "Đơn vị triển khai", target: 10, current: 7, unit: "đơn vị", trend: "up" },
      { id: "KR01c", title: "Giảm 30% thời gian xử lý quy trình", metric: "Thời gian giảm", target: 30, current: 22, unit: "%", trend: "up" },
    ],
    linkedTraining: [
      { courseId: "C01", title: "AI & Machine Learning Thực hành", completion: 78, impact: "high" },
      { courseId: "C02", title: "Digital Literacy cho Quản lý", completion: 85, impact: "high" },
      { courseId: "C03", title: "Power BI & Data Analytics", completion: 62, impact: "medium" },
    ],
  },
  {
    id: "OKR02", title: "Xây dựng Đội ngũ Lãnh đạo Kế cận",
    type: "company", owner: "CHRO Tập đoàn", ownerInitials: "HR",
    subsidiary: "VP Tập đoàn", department: "Nhân sự", period: "Q1/2026",
    progress: 65, status: "at-risk",
    keyResults: [
      { id: "KR02a", title: "50 Talent Pool hoàn thành Leadership Program", metric: "Số lượng hoàn thành", target: 50, current: 28, unit: "người", trend: "up" },
      { id: "KR02b", title: "Đánh giá 360° đạt trên 4.0/5.0", metric: "Điểm đánh giá TB", target: 4.0, current: 3.6, unit: "điểm", trend: "flat" },
      { id: "KR02c", title: "100% HLV nội bộ được certification", metric: "Tỷ lệ certification", target: 100, current: 75, unit: "%", trend: "up" },
    ],
    linkedTraining: [
      { courseId: "C04", title: "Kỹ năng Lãnh đạo 4.0", completion: 56, impact: "high" },
      { courseId: "C05", title: "Executive Coaching Program", completion: 42, impact: "high" },
      { courseId: "C06", title: "Change Management", completion: 70, impact: "medium" },
    ],
  },
  {
    id: "OKR03", title: "Đảm bảo 100% Compliance Đào tạo Bắt buộc",
    type: "department", owner: "Phạm Đức Mạnh", ownerInitials: "PM",
    subsidiary: "Xây dựng Geleximco", department: "An toàn", period: "Q1/2026",
    progress: 88, status: "on-track",
    keyResults: [
      { id: "KR03a", title: "100% công nhân đạt chứng chỉ ATLĐ", metric: "Tỷ lệ đạt", target: 100, current: 92, unit: "%", trend: "up" },
      { id: "KR03b", title: "0 vụ tai nạn nghiêm trọng", metric: "Số vụ tai nạn", target: 0, current: 0, unit: "vụ", trend: "flat" },
      { id: "KR03c", title: "Giảm 50% vi phạm ATLĐ", metric: "Tỷ lệ giảm", target: 50, current: 45, unit: "%", trend: "up" },
    ],
    linkedTraining: [
      { courseId: "C07", title: "An toàn Lao động Công trường", completion: 95, impact: "high" },
      { courseId: "C08", title: "Phòng cháy Chữa cháy", completion: 90, impact: "high" },
    ],
  },
  {
    id: "OKR04", title: "Nâng cao Chất lượng Dịch vụ Khách hàng ABBank",
    type: "department", owner: "Trần Thị Hương", ownerInitials: "TH",
    subsidiary: "ABBank", department: "Dịch vụ KH", period: "Q1/2026",
    progress: 55, status: "behind",
    keyResults: [
      { id: "KR04a", title: "NPS đạt 70+", metric: "NPS Score", target: 70, current: 52, unit: "điểm", trend: "up" },
      { id: "KR04b", title: "100% GDV đạt chứng chỉ CX", metric: "Tỷ lệ đạt", target: 100, current: 58, unit: "%", trend: "up" },
      { id: "KR04c", title: "Giảm 40% complaint", metric: "Tỷ lệ giảm", target: 40, current: 18, unit: "%", trend: "down" },
    ],
    linkedTraining: [
      { courseId: "C09", title: "Customer Experience Excellence", completion: 48, impact: "high" },
      { courseId: "C10", title: "Kỹ năng Giao tiếp Nâng cao", completion: 65, impact: "medium" },
    ],
  },
  {
    id: "OKR05", title: "Hoàn thành Chương trình Phát triển Cá nhân",
    type: "individual", owner: "Nguyễn Minh Anh", ownerInitials: "MA",
    subsidiary: "Geleximco Land", department: "Marketing", period: "Q1/2026",
    progress: 82, status: "on-track",
    keyResults: [
      { id: "KR05a", title: "Hoàn thành 5 khóa trong IDP", metric: "Khóa hoàn thành", target: 5, current: 4, unit: "khóa", trend: "up" },
      { id: "KR05b", title: "Đạt Google Ads Certification", metric: "Certification", target: 1, current: 1, unit: "cert", trend: "flat" },
      { id: "KR05c", title: "Mentor 2 junior marketers", metric: "Mentee", target: 2, current: 2, unit: "người", trend: "flat" },
    ],
    linkedTraining: [
      { courseId: "C11", title: "Digital Marketing & Social Media", completion: 92, impact: "high" },
      { courseId: "C12", title: "Design Thinking Workshop", completion: 100, impact: "medium" },
    ],
  },
  {
    id: "OKR06", title: "Triển khai ESG Reporting Framework",
    type: "company", owner: "Lê Quốc Vương", ownerInitials: "LV",
    subsidiary: "Geleximco Land", department: "Chiến lược", period: "Q1/2026",
    progress: 45, status: "behind",
    keyResults: [
      { id: "KR06a", title: "14/14 đơn vị báo cáo ESG", metric: "Đơn vị", target: 14, current: 6, unit: "đơn vị", trend: "up" },
      { id: "KR06b", title: "50 ESG Champion được đào tạo", metric: "Người được đào tạo", target: 50, current: 22, unit: "người", trend: "up" },
      { id: "KR06c", title: "Carbon footprint baseline hoàn thành", metric: "Tiến độ", target: 100, current: 40, unit: "%", trend: "up" },
    ],
    linkedTraining: [
      { courseId: "C13", title: "ESG & Báo cáo Phát triển Bền vững", completion: 55, impact: "high" },
    ],
  },
];

const STATUS_CONFIG = {
  "on-track": { label: "Đúng tiến độ", color: "#16a34a", bg: "#16a34a10", icon: CheckCircle },
  "at-risk": { label: "Có rủi ro", color: "#ea580c", bg: "#ea580c10", icon: AlertTriangle },
  behind: { label: "Chậm tiến độ", color: "#ef4444", bg: "#ef444410", icon: Clock },
  completed: { label: "Hoàn thành", color: "#2563eb", bg: "#2563eb10", icon: CheckCircle },
};

const TYPE_CONFIG = {
  company: { label: "Tập đoàn", color: "#990803", bg: "#99080310", icon: Building2 },
  department: { label: "Phòng ban", color: "#2563eb", bg: "#2563eb10", icon: Layers },
  individual: { label: "Cá nhân", color: "#16a34a", bg: "#16a34a10", icon: Users },
};

const IMPACT_COLOR = {
  high: "#ef4444",
  medium: "#ea580c",
  low: "#6b7280",
};

export function KpiOkrManagement() {
  const { user } = useAuth();
  const role = user?.role || "learner";
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [tab, setTab] = useState<"okrs" | "alignment" | "impact">("okrs");
  const [selectedOkr, setSelectedOkr] = useState<OKR | null>(null);

  const filtered = OKRS.filter(o => {
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.owner.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "all" && o.type !== filterType) return false;
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    return true;
  });

  const avgProgress = Math.round(OKRS.reduce((s, o) => s + o.progress, 0) / OKRS.length);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Quản lý KPI & OKR</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Liên kết đào tạo với mục tiêu hiệu suất — theo dõi OKR từ Tập đoàn đến Cá nhân
          </p>
        </div>
        {role === "admin" && (
          <button onClick={() => { import("sonner").then(m => m.toast.info("Mở form tạo OKR mới...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Tạo OKR mới
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Tổng OKR", value: OKRS.length, icon: Target, color: "#990803" },
          { label: "Tiến độ TB", value: `${avgProgress}%`, icon: TrendingUp, color: "#c8a84e" },
          { label: "Đúng tiến độ", value: OKRS.filter(o => o.status === "on-track").length, icon: CheckCircle, color: "#16a34a" },
          { label: "Có rủi ro", value: OKRS.filter(o => o.status === "at-risk" || o.status === "behind").length, icon: AlertTriangle, color: "#ef4444" },
          { label: "Khóa liên kết", value: OKRS.reduce((s, o) => s + o.linkedTraining.length, 0), icon: BookOpen, color: "#2563eb" },
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

      {/* Overall Progress Gauge */}
      <div className="bg-gradient-to-r from-[#990803]/5 via-[#c8a84e]/5 to-transparent rounded-xl border border-[#990803]/10 p-4">
        <div className="flex items-center gap-6">
          <ProgressGauge value={avgProgress} label="Tiến độ Tổng thể" />
          <div className="flex-1 grid grid-cols-3 gap-3">
            {(Object.entries(TYPE_CONFIG) as [string, typeof TYPE_CONFIG.company][]).map(([key, cfg]) => {
              const items = OKRS.filter(o => o.type === key);
              const avg = items.length > 0 ? Math.round(items.reduce((s, o) => s + o.progress, 0) / items.length) : 0;
              return (
                <div key={key} className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    <span className="text-gray-600" style={{ fontSize: "11px", fontWeight: 600 }}>{cfg.label}</span>
                  </div>
                  <div className="flex items-end gap-1.5">
                    <span style={{ fontSize: "22px", fontWeight: 700, color: cfg.color }}>{avg}%</span>
                    <span className="text-gray-300 mb-1" style={{ fontSize: "10px" }}>{items.length} OKRs</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${avg}%`, backgroundColor: cfg.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200">
        {[
          { id: "okrs" as const, label: "Danh sách OKR", icon: Target },
          { id: "alignment" as const, label: "Cây Liên kết", icon: GitBranch },
          { id: "impact" as const, label: "Tác động Đào tạo", icon: Zap },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "okrs" && (
        <div className="space-y-2">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm OKR, người phụ trách..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả cấp</option>
              {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <span className="text-gray-400 ml-auto" style={{ fontSize: "11px" }}>{filtered.length} OKR</span>
          </div>

          {/* OKR Cards */}
          {filtered.map(okr => {
            const stCfg = STATUS_CONFIG[okr.status];
            const tyCfg = TYPE_CONFIG[okr.type];
            const StIcon = stCfg.icon;
            return (
              <div key={okr.id} onClick={() => setSelectedOkr(okr)} className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: tyCfg.bg }}>
                    <tyCfg.icon className="w-5 h-5" style={{ color: tyCfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: tyCfg.color, backgroundColor: tyCfg.bg }}>{tyCfg.label}</span>
                      <span className="px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>
                        <StIcon className="w-2.5 h-2.5" /> {stCfg.label}
                      </span>
                      <span className="text-gray-300" style={{ fontSize: "9px" }}>{okr.period}</span>
                    </div>
                    <h4 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>{okr.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-gray-400" style={{ fontSize: "11px" }}>
                      <span className="flex items-center gap-0.5">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ fontSize: "6px", fontWeight: 700, backgroundColor: tyCfg.color }}>{okr.ownerInitials}</div>
                        {okr.owner}
                      </span>
                      <span>• {okr.subsidiary}</span>
                      <span>• {okr.keyResults.length} KR</span>
                      <span>• {okr.linkedTraining.length} khóa đào tạo</span>
                    </div>

                    {/* Key Results mini */}
                    <div className="mt-2 space-y-1">
                      {okr.keyResults.map(kr => {
                        const pct = Math.min(100, (kr.current / kr.target) * 100);
                        const TrendIcon = kr.trend === "up" ? ArrowUp : kr.trend === "down" ? ArrowDown : Minus;
                        const trendColor = kr.trend === "up" ? "#16a34a" : kr.trend === "down" ? "#ef4444" : "#6b7280";
                        return (
                          <div key={kr.id} className="flex items-center gap-2">
                            <span className="w-44 text-gray-500 truncate shrink-0" style={{ fontSize: "11px" }}>{kr.title.slice(0, 35)}...</span>
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? "#16a34a" : pct >= 50 ? "#ea580c" : "#ef4444" }} />
                            </div>
                            <span className="w-12 text-right text-gray-500 shrink-0" style={{ fontSize: "10px", fontWeight: 600 }}>{kr.current}/{kr.target}</span>
                            <TrendIcon className="w-3 h-3 shrink-0" style={{ color: trendColor }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progress circle */}
                  <div className="shrink-0">
                    <MiniProgressCircle value={okr.progress} color={stCfg.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "alignment" && <AlignmentTree okrs={OKRS} />}
      {tab === "impact" && <TrainingImpact okrs={OKRS} />}

      {/* Detail Modal */}
      {selectedOkr && <OkrDetailModal okr={selectedOkr} role={role} onClose={() => setSelectedOkr(null)} />}
    </div>
  );
}

// ─── Progress Gauge (large) ───
function ProgressGauge({ value, label }: { value: number; label: string }) {
  const R = 42, C = Math.PI * 2 * R;
  const offset = C - (value / 100) * C;
  const color = value >= 70 ? "#16a34a" : value >= 50 ? "#ea580c" : "#ef4444";
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={R} fill="none" stroke="#f3f4f6" strokeWidth="6" />
        <circle cx="48" cy="48" r={R} fill="none" stroke={color} strokeWidth="6" strokeDasharray={`${C}`} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 48 48)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{ fontSize: "22px", fontWeight: 700, color }}>{value}%</span>
        <span className="text-gray-400" style={{ fontSize: "8px" }}>{label}</span>
      </div>
    </div>
  );
}

// ─── Mini Progress Circle ───
function MiniProgressCircle({ value, color }: { value: number; color: string }) {
  const R = 22, C = Math.PI * 2 * R;
  const offset = C - (value / 100) * C;
  return (
    <div className="relative w-14 h-14">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={R} fill="none" stroke="#f3f4f6" strokeWidth="4" />
        <circle cx="28" cy="28" r={R} fill="none" stroke={color} strokeWidth="4" strokeDasharray={`${C}`} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 28 28)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ fontSize: "13px", fontWeight: 700, color }}>{value}%</span>
      </div>
    </div>
  );
}

// ─── Alignment Tree ───
function AlignmentTree({ okrs }: { okrs: OKR[] }) {
  const companyOkrs = okrs.filter(o => o.type === "company");
  const deptOkrs = okrs.filter(o => o.type === "department");
  const indOkrs = okrs.filter(o => o.type === "individual");

  return (
    <div className="space-y-3">
      <p className="text-gray-500" style={{ fontSize: "12px" }}>Cây liên kết OKR: Tập đoàn → Phòng ban → Cá nhân</p>
      
      {/* Visual Tree */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <svg width="100%" height="300" viewBox="0 0 700 300" preserveAspectRatio="xMidYMid meet">
          {/* Level labels */}
          <text x="15" y="35" fill="#990803" style={{ fontSize: "10px", fontWeight: 700 }}>TẬP ĐOÀN</text>
          <text x="15" y="135" fill="#2563eb" style={{ fontSize: "10px", fontWeight: 700 }}>PHÒNG BAN</text>
          <text x="15" y="235" fill="#16a34a" style={{ fontSize: "10px", fontWeight: 700 }}>CÁ NHÂN</text>

          {/* Company level nodes */}
          {companyOkrs.map((o, i) => {
            const x = 120 + i * 200;
            const y = 40;
            const stColor = STATUS_CONFIG[o.status].color;
            return (
              <g key={o.id}>
                <rect x={x} y={y - 15} width="160" height="30" rx="8" fill="#990803" opacity="0.1" stroke="#990803" strokeWidth="1" />
                <circle cx={x + 8} cy={y} r="4" fill={stColor} />
                <text x={x + 16} y={y + 1} fill="#990803" dominantBaseline="central" style={{ fontSize: "8px", fontWeight: 600 }}>{o.title.slice(0, 22)}...</text>
                <text x={x + 140} y={y + 1} textAnchor="end" fill={stColor} dominantBaseline="central" style={{ fontSize: "9px", fontWeight: 700 }}>{o.progress}%</text>
                {/* Lines to dept */}
                {deptOkrs.map((d, di) => {
                  const dx = 120 + di * 200;
                  return <line key={d.id} x1={x + 80} y1={y + 15} x2={dx + 80} y2={120} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 2" />;
                })}
              </g>
            );
          })}

          {/* Department level nodes */}
          {deptOkrs.map((o, i) => {
            const x = 120 + i * 200;
            const y = 140;
            const stColor = STATUS_CONFIG[o.status].color;
            return (
              <g key={o.id}>
                <rect x={x} y={y - 15} width="160" height="30" rx="8" fill="#2563eb" opacity="0.1" stroke="#2563eb" strokeWidth="1" />
                <circle cx={x + 8} cy={y} r="4" fill={stColor} />
                <text x={x + 16} y={y + 1} fill="#2563eb" dominantBaseline="central" style={{ fontSize: "8px", fontWeight: 600 }}>{o.title.slice(0, 22)}...</text>
                <text x={x + 140} y={y + 1} textAnchor="end" fill={stColor} dominantBaseline="central" style={{ fontSize: "9px", fontWeight: 700 }}>{o.progress}%</text>
                {/* Lines to individual */}
                {indOkrs.map((ind) => {
                  const ix = 120 + 0 * 200;
                  return <line key={ind.id} x1={x + 80} y1={y + 15} x2={ix + 80} y2={220} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 2" />;
                })}
              </g>
            );
          })}

          {/* Individual level nodes */}
          {indOkrs.map((o, i) => {
            const x = 120 + i * 200;
            const y = 240;
            const stColor = STATUS_CONFIG[o.status].color;
            return (
              <g key={o.id}>
                <rect x={x} y={y - 15} width="160" height="30" rx="8" fill="#16a34a" opacity="0.1" stroke="#16a34a" strokeWidth="1" />
                <circle cx={x + 8} cy={y} r="4" fill={stColor} />
                <text x={x + 16} y={y + 1} fill="#16a34a" dominantBaseline="central" style={{ fontSize: "8px", fontWeight: 600 }}>{o.title.slice(0, 22)}...</text>
                <text x={x + 140} y={y + 1} textAnchor="end" fill={stColor} dominantBaseline="central" style={{ fontSize: "9px", fontWeight: 700 }}>{o.progress}%</text>
              </g>
            );
          })}

          {/* Legend */}
          {[
            { label: "Đúng tiến độ", color: "#16a34a" },
            { label: "Có rủi ro", color: "#ea580c" },
            { label: "Chậm tiến độ", color: "#ef4444" },
          ].map((l, i) => (
            <g key={i}>
              <circle cx={500} cy={265 + i * 14} r="3" fill={l.color} />
              <text x={508} y={265 + i * 14} dominantBaseline="central" fill="#6b7280" style={{ fontSize: "8px" }}>{l.label}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Training Impact Tab ───
function TrainingImpact({ okrs }: { okrs: OKR[] }) {
  const allTraining = okrs.flatMap(o => o.linkedTraining.map(t => ({ ...t, okrTitle: o.title, okrProgress: o.progress })));
  const highImpact = allTraining.filter(t => t.impact === "high");
  const avgCompletion = Math.round(allTraining.reduce((s, t) => s + t.completion, 0) / allTraining.length);

  return (
    <div className="space-y-3">
      {/* Correlation Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Tương quan: Hoàn thành Đào tạo ↔ Tiến độ OKR</h3>
        <CorrelationChart okrs={okrs} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* High Impact Courses */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Zap className="w-4 h-4 inline text-[#ef4444] mr-1" />
            Khóa đào tạo Tác động Cao ({highImpact.length})
          </h3>
          <div className="space-y-2">
            {highImpact.map((t, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <BookOpen className="w-3.5 h-3.5 text-[#990803] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{t.title}</p>
                  <p className="text-gray-400 truncate" style={{ fontSize: "10px" }}>→ {t.okrTitle}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#990803]" style={{ width: `${t.completion}%` }} />
                  </div>
                  <span className="text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>{t.completion}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KPI Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Tổng hợp KPI Đào tạo-Hiệu suất</h3>
          <div className="space-y-3">
            {[
              { label: "TB hoàn thành Đào tạo", value: `${avgCompletion}%`, target: "80%", status: avgCompletion >= 70 ? "good" : "warn" },
              { label: "TB tiến độ OKR", value: `${Math.round(okrs.reduce((s, o) => s + o.progress, 0) / okrs.length)}%`, target: "75%", status: "warn" },
              { label: "Hệ số tương quan", value: "0.78", target: ">0.70", status: "good" },
              { label: "ROI đào tạo", value: "3.2x", target: ">2.5x", status: "good" },
            ].map((kpi, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-600" style={{ fontSize: "12px" }}>{kpi.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400" style={{ fontSize: "10px" }}>Mục tiêu: {kpi.target}</span>
                  <span className="px-2 py-0.5 rounded" style={{
                    fontSize: "12px", fontWeight: 700,
                    color: kpi.status === "good" ? "#16a34a" : "#ea580c",
                    backgroundColor: kpi.status === "good" ? "#16a34a10" : "#ea580c10",
                  }}>{kpi.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Correlation Scatter Chart ───
function CorrelationChart({ okrs }: { okrs: OKR[] }) {
  const W = 520, H = 200, pL = 50, pR = 20, pT = 15, pB = 30;
  const cW = W - pL - pR, cH = H - pT - pB;
  const points = okrs.map(o => {
    const trainAvg = o.linkedTraining.length > 0 ? Math.round(o.linkedTraining.reduce((s, t) => s + t.completion, 0) / o.linkedTraining.length) : 0;
    return { x: trainAvg, y: o.progress, label: o.title.slice(0, 15), status: o.status };
  });

  return (
    <svg width="100%" height="200" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Grid */}
      {[0, 25, 50, 75, 100].map(v => {
        const y = pT + cH - (v / 100) * cH;
        const x = pL + (v / 100) * cW;
        return (
          <g key={v}>
            <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
            <line x1={x} y1={pT} x2={x} y2={H - pB} stroke="#f3f4f6" strokeWidth="0.5" />
            <text x={pL - 5} y={y} textAnchor="end" dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "8px" }}>{v}%</text>
            <text x={x} y={H - pB + 14} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "8px" }}>{v}%</text>
          </g>
        );
      })}
      {/* Trend line */}
      <line x1={pL} y1={pT + cH} x2={W - pR} y2={pT} stroke="#c8a84e" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
      {/* Points */}
      {points.map((p, i) => {
        const px = pL + (p.x / 100) * cW;
        const py = pT + cH - (p.y / 100) * cH;
        const color = STATUS_CONFIG[p.status].color;
        return (
          <g key={i}>
            <circle cx={px} cy={py} r="6" fill={color} opacity="0.2" />
            <circle cx={px} cy={py} r="4" fill={color} />
            <text x={px} y={py - 10} textAnchor="middle" fill="#6b7280" style={{ fontSize: "7px" }}>{p.label}</text>
          </g>
        );
      })}
      {/* Axis labels */}
      <text x={W / 2} y={H - 2} textAnchor="middle" fill="#6b7280" style={{ fontSize: "9px" }}>Hoàn thành Đào tạo (%)</text>
      <text x={8} y={H / 2} textAnchor="middle" dominantBaseline="central" fill="#6b7280" style={{ fontSize: "9px" }} transform={`rotate(-90 8 ${H / 2})`}>Tiến độ OKR (%)</text>
    </svg>
  );
}

// ─── OKR Detail Modal ───
function OkrDetailModal({ okr, role, onClose }: { okr: OKR; role: string; onClose: () => void }) {
  const stCfg = STATUS_CONFIG[okr.status];
  const tyCfg = TYPE_CONFIG[okr.type];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: tyCfg.bg }}>
              <tyCfg.icon className="w-6 h-6" style={{ color: tyCfg.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: tyCfg.color, backgroundColor: tyCfg.bg }}>{tyCfg.label}</span>
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                <span className="text-gray-300" style={{ fontSize: "9px" }}>{okr.period}</span>
              </div>
              <h3 className="text-gray-800 mt-0.5" style={{ fontSize: "16px", fontWeight: 700 }}>{okr.title}</h3>
              <p className="text-gray-400" style={{ fontSize: "11px" }}>{okr.owner} — {okr.subsidiary} / {okr.department}</p>
            </div>
            <MiniProgressCircle value={okr.progress} color={stCfg.color} />
          </div>

          {/* Key Results */}
          <h4 className="text-gray-600 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Key Results ({okr.keyResults.length})</h4>
          <div className="space-y-2 mb-4">
            {okr.keyResults.map(kr => {
              const pct = Math.min(100, (kr.current / kr.target) * 100);
              const barColor = pct >= 80 ? "#16a34a" : pct >= 50 ? "#ea580c" : "#ef4444";
              const TrendIcon = kr.trend === "up" ? ArrowUp : kr.trend === "down" ? ArrowDown : Minus;
              const trendColor = kr.trend === "up" ? "#16a34a" : kr.trend === "down" ? "#ef4444" : "#6b7280";
              return (
                <div key={kr.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{kr.title}</span>
                    <div className="flex items-center gap-1.5">
                      <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
                      <span style={{ fontSize: "12px", fontWeight: 700, color: barColor }}>{kr.current}{kr.unit !== "%" && kr.unit !== "điểm" ? "" : ""}/{kr.target} {kr.unit}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                  </div>
                  <p className="text-right text-gray-400 mt-0.5" style={{ fontSize: "9px" }}>{pct.toFixed(0)}%</p>
                </div>
              );
            })}
          </div>

          {/* Linked Training */}
          <h4 className="text-gray-600 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Khóa đào tạo Liên kết ({okr.linkedTraining.length})</h4>
          <div className="space-y-1.5 mb-4">
            {okr.linkedTraining.map(t => (
              <div key={t.courseId} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <BookOpen className="w-3.5 h-3.5 text-[#990803] shrink-0" />
                <span className="flex-1 text-gray-700" style={{ fontSize: "12px" }}>{t.title}</span>
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: IMPACT_COLOR[t.impact], backgroundColor: IMPACT_COLOR[t.impact] + "10" }}>
                  {t.impact === "high" ? "Tác động Cao" : t.impact === "medium" ? "Trung bình" : "Thấp"}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#990803]" style={{ width: `${t.completion}%` }} />
                  </div>
                  <span className="text-gray-500 w-8 text-right" style={{ fontSize: "10px", fontWeight: 600 }}>{t.completion}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            {role === "admin" && (
              <button onClick={() => { import("sonner").then(m => m.toast.info("Mở form chỉnh sửa OKR...")); }} className="flex-1 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center justify-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                <Edit className="w-4 h-4" /> Chỉnh sửa OKR
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "13px" }}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}