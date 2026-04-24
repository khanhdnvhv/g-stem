import { useState } from "react";
import {
  Building2, Settings, Users, BookOpen, Award, Shield,
  CheckCircle, XCircle, AlertTriangle, Eye, Edit, Plus,
  BarChart3, TrendingUp, Activity, Globe, Palette,
  Lock, Database, Upload, Download, Search, Filter,
  Zap, Star, Clock, ChevronRight, Layers,
  ToggleLeft, Hash, Server, Wifi,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface Tenant {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  status: "active" | "suspended" | "pending";
  field: string;
  employees: number;
  activeUsers: number;
  courses: number;
  completionRate: number;
  storage: { used: number; limit: number };
  features: string[];
  primaryColor: string;
  subdomain: string;
  adminName: string;
  adminEmail: string;
  createdAt: string;
  lastSync: string;
  monthlyActiveRate: number;
}

interface TenantConfig {
  id: string;
  tenantId: string;
  key: string;
  label: string;
  value: string | boolean | number;
  type: "toggle" | "text" | "number" | "select";
  category: string;
}

// ─── Mock Data ───
const TENANTS: Tenant[] = [
  { id: "T01", name: "Tập đoàn Geleximco", shortName: "VP Tập đoàn", logo: "🏢", status: "active", field: "Holding", employees: 520, activeUsers: 485, courses: 156, completionRate: 88, storage: { used: 45, limit: 100 }, features: ["all"], primaryColor: "#990803", subdomain: "hq", adminName: "Nguyễn Văn Hùng", adminEmail: "hung.nv@geleximco.vn", createdAt: "01/01/2024", lastSync: "12/03/2026 06:00", monthlyActiveRate: 93 },
  { id: "T02", name: "Ngân hàng TMCP An Bình (ABBank)", shortName: "ABBank", logo: "🏦", status: "active", field: "Tài chính - Ngân hàng", employees: 1850, activeUsers: 1620, courses: 142, completionRate: 82, storage: { used: 85, limit: 200 }, features: ["lms", "exam", "cert", "compliance", "idp"], primaryColor: "#00529B", subdomain: "abbank", adminName: "Trần Thị Hương", adminEmail: "huong.tt@abbank.vn", createdAt: "15/01/2024", lastSync: "12/03/2026 06:00", monthlyActiveRate: 87 },
  { id: "T03", name: "BĐS Geleximco - Khu đô thị", shortName: "BĐS KĐT", logo: "🏘️", status: "active", field: "Bất động sản", employees: 680, activeUsers: 580, courses: 68, completionRate: 75, storage: { used: 22, limit: 50 }, features: ["lms", "exam", "cert", "compliance"], primaryColor: "#2d5016", subdomain: "bds-kdt", adminName: "Lê Quốc Vương", adminEmail: "vuong.lq@geleximco-bds.vn", createdAt: "01/02/2024", lastSync: "12/03/2026 06:00", monthlyActiveRate: 85 },
  { id: "T04", name: "Xi măng Thăng Long", shortName: "Xi măng TL", logo: "🏭", status: "active", field: "Sản xuất VLXD", employees: 420, activeUsers: 350, courses: 45, completionRate: 92, storage: { used: 12, limit: 30 }, features: ["lms", "exam", "cert", "compliance"], primaryColor: "#4a5568", subdomain: "ximang", adminName: "Phạm Đức Mạnh", adminEmail: "manh.pd@ximang-tl.vn", createdAt: "15/02/2024", lastSync: "12/03/2026 06:00", monthlyActiveRate: 83 },
  { id: "T05", name: "Thủy điện Xuân Minh", shortName: "Thủy điện XM", logo: "⚡", status: "active", field: "Năng lượng", employees: 280, activeUsers: 220, courses: 38, completionRate: 90, storage: { used: 8, limit: 20 }, features: ["lms", "exam", "cert", "compliance"], primaryColor: "#1a56db", subdomain: "thuydiện", adminName: "Hoàng Minh Tuấn", adminEmail: "tuan.hm@xm-power.vn", createdAt: "01/03/2024", lastSync: "12/03/2026 06:00", monthlyActiveRate: 78 },
  { id: "T06", name: "Hanel", shortName: "Hanel", logo: "💻", status: "active", field: "Công nghệ", employees: 350, activeUsers: 310, courses: 52, completionRate: 85, storage: { used: 18, limit: 40 }, features: ["lms", "exam", "cert", "idp", "gamification"], primaryColor: "#7c2d12", subdomain: "hanel", adminName: "Đỗ Thị Lan", adminEmail: "lan.dt@hanel.vn", createdAt: "15/03/2024", lastSync: "12/03/2026 06:00", monthlyActiveRate: 88 },
  { id: "T07", name: "Khoáng sản Geleximco", shortName: "Khoáng sản", logo: "⛏️", status: "active", field: "Khoáng sản", employees: 190, activeUsers: 145, courses: 32, completionRate: 78, storage: { used: 5, limit: 15 }, features: ["lms", "exam", "cert", "compliance"], primaryColor: "#78350f", subdomain: "khoangsan", adminName: "Bùi Văn Nam", adminEmail: "nam.bv@geleximco-ks.vn", createdAt: "01/04/2024", lastSync: "12/03/2026 06:00", monthlyActiveRate: 76 },
  { id: "T08", name: "BĐS Geleximco - Nghỉ dưỡng", shortName: "BĐS NĐ", logo: "🏨", status: "active", field: "Bất động sản", employees: 310, activeUsers: 260, courses: 55, completionRate: 80, storage: { used: 15, limit: 40 }, features: ["lms", "exam", "cert", "compliance"], primaryColor: "#9f1239", subdomain: "bds-nd", adminName: "Nguyễn Minh Anh", adminEmail: "anh.nm@geleximco-resort.vn", createdAt: "15/04/2024", lastSync: "12/03/2026 06:00", monthlyActiveRate: 83 },
  { id: "T09", name: "Chứng khoán An Bình (ABS)", shortName: "ABS", logo: "📈", status: "active", field: "Tài chính - Chứng khoán", employees: 220, activeUsers: 195, courses: 48, completionRate: 86, storage: { used: 10, limit: 25 }, features: ["lms", "exam", "cert", "compliance", "idp"], primaryColor: "#1e40af", subdomain: "abs", adminName: "Vũ Thị Mai", adminEmail: "mai.vt@abs.vn", createdAt: "01/05/2024", lastSync: "12/03/2026 06:00", monthlyActiveRate: 88 },
  { id: "T10", name: "Du lịch Geleximco", shortName: "Du lịch", logo: "✈️", status: "pending", field: "Du lịch - Dịch vụ", employees: 180, activeUsers: 0, courses: 0, completionRate: 0, storage: { used: 0, limit: 20 }, features: [], primaryColor: "#0d9488", subdomain: "dulich", adminName: "Trần Hoàng Long", adminEmail: "long.th@geleximco-travel.vn", createdAt: "10/03/2026", lastSync: "—", monthlyActiveRate: 0 },
  { id: "T11", name: "Bảo hiểm ABB (ABIC)", shortName: "ABIC", logo: "🛡️", status: "active", field: "Tài chính - Bảo hiểm", employees: 340, activeUsers: 290, courses: 42, completionRate: 81, storage: { used: 14, limit: 30 }, features: ["lms", "exam", "cert", "compliance"], primaryColor: "#0369a1", subdomain: "abic", adminName: "Lý Thị Hồng", adminEmail: "hong.lt@abic.vn", createdAt: "15/05/2024", lastSync: "12/03/2026 06:00", monthlyActiveRate: 85 },
  { id: "T12", name: "Giáo dục Geleximco", shortName: "Giáo dục", logo: "🎓", status: "active", field: "Giáo dục - Đào tạo", employees: 250, activeUsers: 230, courses: 85, completionRate: 94, storage: { used: 25, limit: 50 }, features: ["lms", "exam", "cert", "idp", "gamification", "marketplace"], primaryColor: "#7c3aed", subdomain: "giaoduc", adminName: "Phạm Thị Ngọc", adminEmail: "ngoc.pt@geleximco-edu.vn", createdAt: "01/06/2024", lastSync: "12/03/2026 06:00", monthlyActiveRate: 92 },
  { id: "T13", name: "Nông nghiệp Geleximco", shortName: "Nông nghiệp", logo: "🌾", status: "suspended", field: "Nông nghiệp", employees: 150, activeUsers: 0, courses: 18, completionRate: 65, storage: { used: 3, limit: 10 }, features: ["lms", "exam", "cert"], primaryColor: "#65a30d", subdomain: "nongnghiep", adminName: "Đinh Văn Phúc", adminEmail: "phuc.dv@geleximco-agri.vn", createdAt: "15/06/2024", lastSync: "28/02/2026", monthlyActiveRate: 0 },
  { id: "T14", name: "Hạ tầng Geleximco", shortName: "Hạ tầng", logo: "🛤️", status: "active", field: "Hạ tầng", employees: 270, activeUsers: 225, courses: 35, completionRate: 77, storage: { used: 9, limit: 25 }, features: ["lms", "exam", "cert", "compliance"], primaryColor: "#57534e", subdomain: "hatang", adminName: "Cao Minh Đức", adminEmail: "duc.cm@geleximco-infra.vn", createdAt: "01/07/2024", lastSync: "12/03/2026 06:00", monthlyActiveRate: 83 },
];

const STATUS_CFG = {
  active: { label: "Hoạt động", color: "#16a34a", bg: "#16a34a10" },
  suspended: { label: "Tạm ngưng", color: "#ef4444", bg: "#ef444410" },
  pending: { label: "Chờ kích hoạt", color: "#c8a84e", bg: "#c8a84e10" },
};

const FEATURE_LABELS: Record<string, string> = {
  all: "Toàn bộ", lms: "LMS", exam: "Thi cử", cert: "Chứng chỉ", compliance: "Compliance",
  idp: "IDP", gamification: "Gamification", marketplace: "Marketplace",
};

export function TenantManagement() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"overview" | "tenants" | "comparison" | "config">("overview");
  const [search, setSearch] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const activeTenants = TENANTS.filter(t => t.status === "active").length;
  const totalEmployees = TENANTS.reduce((s, t) => s + t.employees, 0);
  const totalActive = TENANTS.reduce((s, t) => s + t.activeUsers, 0);
  const avgCompletion = Math.round(TENANTS.filter(t => t.status === "active").reduce((s, t) => s + t.completionRate, 0) / activeTenants);
  const totalStorage = TENANTS.reduce((s, t) => s + t.storage.used, 0);
  const totalStorageLimit = TENANTS.reduce((s, t) => s + t.storage.limit, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Quản lý Multi-Tenant</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Quản lý cấu hình, quota, tính năng và dữ liệu cho 14 đơn vị thành viên
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất cấu hình tenant...")); }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Export Config
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.info("Mở form thêm Tenant mới...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Thêm Tenant
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Tenants Active", value: `${activeTenants}/14`, icon: Building2, color: "#990803" },
          { label: "Tổng Nhân sự", value: totalEmployees.toLocaleString(), icon: Users, color: "#2563eb" },
          { label: "Users Active", value: totalActive.toLocaleString(), icon: Activity, color: "#16a34a" },
          { label: "Hoàn thành TB", value: `${avgCompletion}%`, icon: TrendingUp, color: "#c8a84e" },
          { label: "Storage", value: `${totalStorage}/${totalStorageLimit} GB`, icon: Database, color: "#7c3aed" },
          { label: "Lĩnh vực", value: "10", icon: Globe, color: "#ea580c" },
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
        {[
          { id: "overview" as const, label: "Tổng quan", icon: BarChart3 },
          { id: "tenants" as const, label: "Danh sách Tenants", icon: Building2 },
          { id: "comparison" as const, label: "So sánh", icon: Layers },
          { id: "config" as const, label: "Cấu hình Chung", icon: Settings },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab tenants={TENANTS} />}
      {tab === "tenants" && <TenantsListTab tenants={TENANTS} search={search} setSearch={setSearch} onSelect={setSelectedTenant} />}
      {tab === "comparison" && <ComparisonTab tenants={TENANTS} />}
      {tab === "config" && <GlobalConfigTab />}

      {selectedTenant && <TenantDetailModal tenant={selectedTenant} onClose={() => setSelectedTenant(null)} />}
    </div>
  );
}

// ─── Overview Tab ───
function OverviewTab({ tenants }: { tenants: Tenant[] }) {
  const active = tenants.filter(t => t.status === "active");
  const sorted = [...active].sort((a, b) => b.activeUsers - a.activeUsers);
  const maxUsers = Math.max(...sorted.map(t => t.activeUsers));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Active Users by Tenant */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Active Users theo Đơn vị</h3>
          <svg width="100%" height="260" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid meet">
            {sorted.slice(0, 10).map((t, i) => {
              const y = 5 + i * 25;
              const barW = maxUsers > 0 ? (t.activeUsers / maxUsers) * 220 : 0;
              return (
                <g key={t.id}>
                  <text x="5" y={y + 10} dominantBaseline="central" fill="#374151" style={{ fontSize: "8px" }}>{t.logo} {t.shortName}</text>
                  <rect x="110" y={y} width={barW} height="18" rx="3" fill={t.primaryColor} opacity="0.6" />
                  <text x={115 + barW} y={y + 10} dominantBaseline="central" fill={t.primaryColor} style={{ fontSize: "8px", fontWeight: 700 }}>{t.activeUsers.toLocaleString()}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Storage Usage */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Sử dụng Storage (GB)</h3>
          <svg width="100%" height="260" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid meet">
            {active.sort((a, b) => b.storage.used - a.storage.used).slice(0, 10).map((t, i) => {
              const y = 5 + i * 25;
              const pct = t.storage.limit > 0 ? (t.storage.used / t.storage.limit) * 100 : 0;
              const barW = (pct / 100) * 180;
              const color = pct >= 80 ? "#ef4444" : pct >= 60 ? "#ea580c" : "#16a34a";
              return (
                <g key={t.id}>
                  <text x="5" y={y + 10} dominantBaseline="central" fill="#374151" style={{ fontSize: "8px" }}>{t.logo} {t.shortName}</text>
                  <rect x="110" y={y} width="180" height="18" rx="3" fill="#f3f4f6" />
                  <rect x="110" y={y} width={barW} height="18" rx="3" fill={color} opacity="0.6" />
                  <text x="295" y={y + 10} dominantBaseline="central" fill={color} style={{ fontSize: "8px", fontWeight: 700 }}>{t.storage.used}/{t.storage.limit} GB</text>
                  <text x="370" y={y + 10} dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "7px" }}>{Math.round(pct)}%</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Completion Rate Heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Completion Rate & Monthly Active Rate</h3>
        <svg width="100%" height="110" viewBox="0 0 750 110" preserveAspectRatio="xMidYMid meet">
          {tenants.filter(t => t.status === "active").map((t, i) => {
            const x = 5 + i * 60;
            const compH = (t.completionRate / 100) * 50;
            const actH = (t.monthlyActiveRate / 100) * 50;
            const compColor = t.completionRate >= 85 ? "#16a34a" : t.completionRate >= 70 ? "#c8a84e" : "#ef4444";
            return (
              <g key={t.id}>
                <rect x={x} y={55 - compH} width="22" height={compH} rx="3" fill={compColor} opacity="0.6" />
                <rect x={x + 26} y={55 - actH} width="22" height={actH} rx="3" fill="#2563eb" opacity="0.5" />
                <text x={x + 24} y={65} textAnchor="middle" fill="#6b7280" style={{ fontSize: "6px" }}>{t.logo}</text>
                <text x={x + 24} y={75} textAnchor="middle" fill="#374151" style={{ fontSize: "5.5px" }}>{t.shortName.slice(0, 8)}</text>
                <text x={x + 11} y={50 - compH} textAnchor="middle" fill={compColor} style={{ fontSize: "6px", fontWeight: 700 }}>{t.completionRate}%</text>
              </g>
            );
          })}
          <rect x="660" y="10" width="8" height="8" rx="2" fill="#16a34a" opacity="0.6" />
          <text x="672" y="17" fill="#6b7280" style={{ fontSize: "7px" }}>Completion</text>
          <rect x="660" y="24" width="8" height="8" rx="2" fill="#2563eb" opacity="0.5" />
          <text x="672" y="31" fill="#6b7280" style={{ fontSize: "7px" }}>Active Rate</text>
        </svg>
      </div>
    </div>
  );
}

// ─── Tenants List Tab ───
function TenantsListTab({ tenants, search, setSearch, onSelect }: { tenants: Tenant[]; search: string; setSearch: (s: string) => void; onSelect: (t: Tenant) => void }) {
  const filtered = tenants.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.field.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm đơn vị..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
        </div>
        <span className="text-gray-400 ml-auto" style={{ fontSize: "11px" }}>{filtered.length} đơn vị</span>
      </div>
      {filtered.map(t => {
        const stCfg = STATUS_CFG[t.status];
        const storagePct = t.storage.limit > 0 ? Math.round((t.storage.used / t.storage.limit) * 100) : 0;
        return (
          <div key={t.id} onClick={() => onSelect(t)} className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center border-2" style={{ borderColor: t.primaryColor + "30", backgroundColor: t.primaryColor + "08" }}>
                <span style={{ fontSize: "24px" }}>{t.logo}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{t.name}</h4>
                  <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 flex-wrap" style={{ fontSize: "10px" }}>
                  <span>{t.field}</span>
                  <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" /> {t.employees} NV</span>
                  <span className="flex items-center gap-0.5"><Activity className="w-2.5 h-2.5" /> {t.activeUsers} active</span>
                  <span className="flex items-center gap-0.5"><BookOpen className="w-2.5 h-2.5" /> {t.courses} khóa</span>
                  <span className="flex items-center gap-0.5"><Database className="w-2.5 h-2.5" /> {t.storage.used}/{t.storage.limit}GB</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-48">
                    <div className="h-full rounded-full" style={{ width: `${t.completionRate}%`, backgroundColor: t.completionRate >= 85 ? "#16a34a" : t.completionRate >= 70 ? "#c8a84e" : "#ef4444" }} />
                  </div>
                  <span className="text-gray-500" style={{ fontSize: "10px" }}>Completion: <strong>{t.completionRate}%</strong></span>
                  <div className="flex items-center gap-0.5 ml-2">
                    {t.features.slice(0, 5).map(f => (
                      <span key={f} className="px-1 py-0.5 bg-gray-50 text-gray-400 rounded" style={{ fontSize: "7px" }}>{FEATURE_LABELS[f] || f}</span>
                    ))}
                    {t.features.length > 5 && <span className="text-gray-300" style={{ fontSize: "7px" }}>+{t.features.length - 5}</span>}
                  </div>
                </div>
              </div>
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.primaryColor }} />
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Comparison Tab ───
function ComparisonTab({ tenants }: { tenants: Tenant[] }) {
  const active = tenants.filter(t => t.status === "active");
  const metrics = ["employees", "activeUsers", "courses", "completionRate", "monthlyActiveRate"] as const;
  const metricLabels: Record<string, string> = { employees: "Nhân sự", activeUsers: "Active Users", courses: "Khóa học", completionRate: "Completion %", monthlyActiveRate: "Active Rate %" };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 text-left text-gray-500 sticky left-0 bg-gray-50 z-10" style={{ fontSize: "10px", fontWeight: 600 }}>Đơn vị</th>
              <th className="px-3 py-2.5 text-left text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Lĩnh vực</th>
              {metrics.map(m => (
                <th key={m} className="px-3 py-2.5 text-right text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>{metricLabels[m]}</th>
              ))}
              <th className="px-3 py-2.5 text-right text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Storage</th>
              <th className="px-3 py-2.5 text-center text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>Features</th>
            </tr>
          </thead>
          <tbody>
            {active.sort((a, b) => b.completionRate - a.completionRate).map(t => (
              <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 sticky left-0 bg-white z-10">
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontSize: "14px" }}>{t.logo}</span>
                    <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 500 }}>{t.shortName}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-gray-400" style={{ fontSize: "10px" }}>{t.field}</td>
                <td className="px-3 py-2 text-right text-gray-700" style={{ fontSize: "11px", fontWeight: 500 }}>{t.employees.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-gray-700" style={{ fontSize: "11px", fontWeight: 500 }}>{t.activeUsers.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-gray-700" style={{ fontSize: "11px", fontWeight: 500 }}>{t.courses}</td>
                <td className="px-3 py-2 text-right">
                  <span style={{ fontSize: "11px", fontWeight: 700, color: t.completionRate >= 85 ? "#16a34a" : t.completionRate >= 70 ? "#c8a84e" : "#ef4444" }}>{t.completionRate}%</span>
                </td>
                <td className="px-3 py-2 text-right">
                  <span style={{ fontSize: "11px", fontWeight: 600, color: t.monthlyActiveRate >= 85 ? "#16a34a" : "#c8a84e" }}>{t.monthlyActiveRate}%</span>
                </td>
                <td className="px-3 py-2 text-right text-gray-500" style={{ fontSize: "10px" }}>{t.storage.used}/{t.storage.limit}GB</td>
                <td className="px-3 py-2 text-center">
                  <span className="text-gray-400" style={{ fontSize: "10px" }}>{t.features.includes("all") ? "All" : t.features.length}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Global Config Tab ───
function GlobalConfigTab() {
  const configs = [
    { cat: "Hệ thống", items: [
      { key: "max_file_upload", label: "Max File Upload (MB)", value: "100", type: "number" },
      { key: "session_timeout", label: "Session Timeout (phút)", value: "60", type: "number" },
      { key: "enable_2fa", label: "Bắt buộc 2FA", value: true, type: "toggle" },
      { key: "auto_sync_hr", label: "Tự động đồng bộ HR", value: true, type: "toggle" },
    ]},
    { cat: "LMS", items: [
      { key: "default_language", label: "Ngôn ngữ mặc định", value: "Tiếng Việt", type: "select" },
      { key: "enable_gamification", label: "Gamification mặc định", value: true, type: "toggle" },
      { key: "cert_auto_issue", label: "Tự động cấp Chứng chỉ", value: true, type: "toggle" },
      { key: "max_exam_retries", label: "Số lần thi lại tối đa", value: "3", type: "number" },
    ]},
    { cat: "Bảo mật", items: [
      { key: "password_min_length", label: "Mật khẩu tối thiểu (ký tự)", value: "8", type: "number" },
      { key: "ip_whitelist", label: "IP Whitelist", value: false, type: "toggle" },
      { key: "data_retention_days", label: "Lưu trữ dữ liệu (ngày)", value: "365", type: "number" },
      { key: "enable_audit_log", label: "Ghi Audit Log", value: true, type: "toggle" },
    ]},
  ];

  return (
    <div className="space-y-3">
      {configs.map(cat => (
        <div key={cat.cat} className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Settings className="w-3.5 h-3.5 text-[#990803]" /> {cat.cat}
          </h3>
          <div className="space-y-2">
            {cat.items.map(cfg => (
              <div key={cfg.key} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{cfg.label}</p>
                  <p className="font-mono text-gray-300" style={{ fontSize: "9px" }}>{cfg.key}</p>
                </div>
                {cfg.type === "toggle" ? (
                  <div onClick={() => { import("sonner").then(m => m.toast.success(`Đã ${cfg.value ? "tắt" : "bật"} ${cfg.label}`)); }} className={`w-10 h-5 rounded-full cursor-pointer relative ${cfg.value ? "bg-[#16a34a]" : "bg-gray-200"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${cfg.value ? "left-[22px]" : "left-0.5"}`} />
                  </div>
                ) : (
                  <span className="text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200" style={{ fontSize: "12px", fontWeight: 500 }}>{String(cfg.value)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tenant Detail Modal ───
function TenantDetailModal({ tenant, onClose }: { tenant: Tenant; onClose: () => void }) {
  const stCfg = STATUS_CFG[tenant.status];
  const storagePct = tenant.storage.limit > 0 ? Math.round((tenant.storage.used / tenant.storage.limit) * 100) : 0;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center border-2" style={{ borderColor: tenant.primaryColor + "30", backgroundColor: tenant.primaryColor + "08" }}>
              <span style={{ fontSize: "30px" }}>{tenant.logo}</span>
            </div>
            <div>
              <h3 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 700 }}>{tenant.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                <span className="text-gray-400" style={{ fontSize: "10px" }}>{tenant.field}</span>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tenant.primaryColor }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Nhân sự", value: tenant.employees.toLocaleString(), color: "#2563eb" },
              { label: "Active", value: tenant.activeUsers.toLocaleString(), color: "#16a34a" },
              { label: "Khóa học", value: tenant.courses, color: "#c8a84e" },
            ].map((s, i) => (
              <div key={i} className="text-center p-2 bg-gray-50 rounded-lg">
                <p style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>{s.value}</p>
                <p className="text-gray-400" style={{ fontSize: "9px" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-gray-500" style={{ fontSize: "11px" }}>Completion Rate</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: tenant.completionRate >= 85 ? "#16a34a" : "#c8a84e" }}>{tenant.completionRate}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${tenant.completionRate}%`, backgroundColor: tenant.completionRate >= 85 ? "#16a34a" : "#c8a84e" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-gray-500" style={{ fontSize: "11px" }}>Storage ({tenant.storage.used}/{tenant.storage.limit} GB)</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: storagePct >= 80 ? "#ef4444" : "#16a34a" }}>{storagePct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${storagePct}%`, backgroundColor: storagePct >= 80 ? "#ef4444" : "#16a34a" }} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mb-4">
            {[
              { label: "Subdomain", value: `${tenant.subdomain}.lms.geleximco.vn` },
              { label: "Admin", value: `${tenant.adminName} (${tenant.adminEmail})` },
              { label: "Kích hoạt", value: tenant.createdAt },
              { label: "Đồng bộ cuối", value: tenant.lastSync },
            ].map((info, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-500" style={{ fontSize: "11px" }}>{info.label}</span>
                <span className="text-gray-700 text-right" style={{ fontSize: "11px", fontWeight: 500 }}>{info.value}</span>
              </div>
            ))}
          </div>

          <div className="mb-4">
            <p className="text-gray-500 mb-1.5" style={{ fontSize: "11px", fontWeight: 600 }}>Tính năng được bật:</p>
            <div className="flex flex-wrap gap-1">
              {tenant.features.map(f => (
                <span key={f} className="px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 500, color: tenant.primaryColor, backgroundColor: tenant.primaryColor + "10" }}>
                  {FEATURE_LABELS[f] || f}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <button onClick={() => { import("sonner").then(m => m.toast.info("Mở trang cấu hình tenant...")); }} className="flex-1 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center justify-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
              <Edit className="w-4 h-4" /> Cấu hình
            </button>
            <button onClick={onClose} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "13px" }}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}