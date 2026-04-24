import { useAuth } from "./AuthContext";
import { EmptyState } from "./EmptyState";
import { useState } from "react";
import {
  FileText, Search, Shield, Clock, Users, Eye, Filter,
  AlertTriangle, CheckCircle, XCircle, Activity, Download,
  Lock, Unlock, Edit, Trash2, Plus, LogIn, LogOut,
  Settings, BookOpen, Award, Database, Server,
  TrendingUp, BarChart3, Globe, Monitor, RefreshCw,
  ChevronRight, Calendar, Building2, User, Bell,
} from "lucide-react";

// ─── Types ───
interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  userInitials: string;
  userRole: "admin" | "instructor" | "learner";
  subsidiary: string;
  action: string;
  actionType: "create" | "update" | "delete" | "login" | "logout" | "view" | "export" | "approve" | "reject" | "assign" | "system";
  module: string;
  target: string;
  details: string;
  ipAddress: string;
  device: string;
  severity: "info" | "warning" | "critical" | "success";
  sessionId: string;
}

// ─── Mock Data ───
const AUDIT_ENTRIES: AuditEntry[] = [
  {
    id: "AL001", timestamp: "12/03/2026 09:45:12", user: "Nguyễn Văn Minh", userInitials: "NM", userRole: "admin",
    subsidiary: "VP Tập đoàn", action: "Cập nhật phân quyền", actionType: "update", module: "Phân quyền",
    target: "Role: Giảng viên", details: "Thêm quyền 'Quản lý câu hỏi thi' cho vai trò Giảng viên tại ABBank",
    ipAddress: "192.168.1.45", device: "Chrome / Windows 11", severity: "warning", sessionId: "SES-4521",
  },
  {
    id: "AL002", timestamp: "12/03/2026 09:30:05", user: "Đỗ Thanh Hương", userInitials: "TH", userRole: "instructor",
    subsidiary: "VP Tập đoàn", action: "Tạo khóa học mới", actionType: "create", module: "Khóa học",
    target: "Kỹ năng Lãnh đạo 4.0", details: "Tạo khóa học mới với 24 bài giảng, 8 bài kiểm tra, hạn hoàn thành 30/06/2026",
    ipAddress: "192.168.1.102", device: "Safari / macOS 16", severity: "info", sessionId: "SES-4518",
  },
  {
    id: "AL003", timestamp: "12/03/2026 09:15:33", user: "SYSTEM", userInitials: "SY", userRole: "admin",
    subsidiary: "Hệ thống", action: "Đồng bộ nhân sự tự động", actionType: "system", module: "HR Sync",
    target: "14 đơn vị thành viên", details: "Đồng bộ thành công 6,610 nhân sự. Mới: 12, Cập nhật: 45, Nghỉ việc: 3.",
    ipAddress: "10.0.0.1", device: "System / Cron Job", severity: "success", sessionId: "SES-SYS-001",
  },
  {
    id: "AL004", timestamp: "12/03/2026 08:55:21", user: "Ngô Trung Kiên", userInitials: "NK", userRole: "admin",
    subsidiary: "VP Tập đoàn", action: "Xuất báo cáo nhạy cảm", actionType: "export", module: "Báo cáo",
    target: "Báo cáo Lương & KPI 2025", details: "Xuất file Excel chứa dữ liệu lương 6,610 nhân sự toàn tập đoàn",
    ipAddress: "192.168.1.88", device: "Chrome / Windows 11", severity: "critical", sessionId: "SES-4515",
  },
  {
    id: "AL005", timestamp: "12/03/2026 08:45:10", user: "Trần Thị Hương", userInitials: "TH", userRole: "instructor",
    subsidiary: "ABBank", action: "Phê duyệt chứng chỉ", actionType: "approve", module: "Chứng chỉ",
    target: "25 chứng chỉ hoàn thành", details: "Phê duyệt chứng chỉ hoàn thành khóa 'Phân tích Rủi ro Tín dụng' cho 25 học viên ABBank",
    ipAddress: "10.20.1.55", device: "Edge / Windows 11", severity: "info", sessionId: "SES-4512",
  },
  {
    id: "AL006", timestamp: "12/03/2026 08:30:44", user: "Phạm Anh Tuấn", userInitials: "PT", userRole: "instructor",
    subsidiary: "Geleximco Land", action: "Xóa bài kiểm tra", actionType: "delete", module: "Kiểm tra",
    target: "Quiz: Design Thinking Pre-test", details: "Xóa bài kiểm tra có 15 câu hỏi. Lý do: Cập nhật nội dung mới.",
    ipAddress: "10.30.2.10", device: "Chrome / macOS 16", severity: "warning", sessionId: "SES-4510",
  },
  {
    id: "AL007", timestamp: "12/03/2026 08:15:02", user: "Lê Minh Đức", userInitials: "MD", userRole: "learner",
    subsidiary: "ABBank", action: "Đăng nhập thất bại", actionType: "login", module: "Xác thực",
    target: "Account: le.minhduc@abbank.com.vn", details: "3 lần đăng nhập sai mật khẩu liên tiếp. Tài khoản bị khóa tạm 15 phút.",
    ipAddress: "10.20.1.112", device: "Chrome / Android 15", severity: "critical", sessionId: "SES-FAIL-003",
  },
  {
    id: "AL008", timestamp: "12/03/2026 08:00:00", user: "SYSTEM", userInitials: "SY", userRole: "admin",
    subsidiary: "Hệ thống", action: "Backup database", actionType: "system", module: "Bảo trì",
    target: "Database Production", details: "Backup tự động hoàn tất: 23.4 GB. Lưu trữ: AWS S3 geleximco-lms-backup.",
    ipAddress: "10.0.0.1", device: "System / Cron Job", severity: "success", sessionId: "SES-SYS-002",
  },
  {
    id: "AL009", timestamp: "11/03/2026 17:30:15", user: "Nguyễn Văn Minh", userInitials: "NM", userRole: "admin",
    subsidiary: "VP Tập đoàn", action: "Cấu hình hệ thống", actionType: "update", module: "Cài đặt",
    target: "Email SMTP Settings", details: "Cập nhật SMTP server từ smtp.old.vn sang smtp.geleximco.vn",
    ipAddress: "192.168.1.45", device: "Chrome / Windows 11", severity: "warning", sessionId: "SES-4501",
  },
  {
    id: "AL010", timestamp: "11/03/2026 16:45:30", user: "Phạm Đức Mạnh", userInitials: "PM", userRole: "instructor",
    subsidiary: "Xây dựng Geleximco", action: "Upload tài liệu", actionType: "create", module: "Thư viện",
    target: "ATLĐ_Mua_Mua_Bao_2026.pdf", details: "Upload tài liệu 12.5 MB vào thư viện An toàn lao động. Visibility: Toàn tập đoàn.",
    ipAddress: "10.40.1.30", device: "Firefox / Ubuntu 24", severity: "info", sessionId: "SES-4498",
  },
  {
    id: "AL011", timestamp: "11/03/2026 15:20:18", user: "SYSTEM", userInitials: "SY", userRole: "admin",
    subsidiary: "Hệ thống", action: "Phát hiện bất thường", actionType: "system", module: "Bảo mật",
    target: "IP: 103.45.67.89", details: "Phát hiện 50 request/phút từ IP lạ. Đã tự động block và gửi cảnh báo admin.",
    ipAddress: "103.45.67.89", device: "Unknown / Bot", severity: "critical", sessionId: "SES-SEC-001",
  },
  {
    id: "AL012", timestamp: "11/03/2026 14:10:05", user: "Bùi Thị Hà", userInitials: "BH", userRole: "instructor",
    subsidiary: "VP Tập đoàn", action: "Chấm bài tự luận", actionType: "update", module: "Chấm điểm",
    target: "12 bài tự luận Excel VBA", details: "Chấm 12 bài tự luận khóa Excel VBA. Điểm TB: 7.8/10. AI suggest: 3 bài cần review.",
    ipAddress: "192.168.1.150", device: "Chrome / Windows 11", severity: "info", sessionId: "SES-4490",
  },
];

const ACTION_ICONS: Record<string, { icon: typeof Edit; color: string }> = {
  create: { icon: Plus, color: "#16a34a" },
  update: { icon: Edit, color: "#2563eb" },
  delete: { icon: Trash2, color: "#ef4444" },
  login: { icon: LogIn, color: "#7c3aed" },
  logout: { icon: LogOut, color: "#6b7280" },
  view: { icon: Eye, color: "#0d9488" },
  export: { icon: Download, color: "#ea580c" },
  approve: { icon: CheckCircle, color: "#16a34a" },
  reject: { icon: XCircle, color: "#ef4444" },
  assign: { icon: Users, color: "#2563eb" },
  system: { icon: Server, color: "#64748b" },
};

const SEVERITY_CONFIG = {
  info: { label: "Info", color: "#2563eb", bg: "#2563eb10", icon: Activity },
  warning: { label: "Cảnh báo", color: "#ea580c", bg: "#ea580c10", icon: AlertTriangle },
  critical: { label: "Nghiêm trọng", color: "#ef4444", bg: "#ef444410", icon: Shield },
  success: { label: "Thành công", color: "#16a34a", bg: "#16a34a10", icon: CheckCircle },
};

const ROLE_COLORS = {
  admin: { color: "#990803", bg: "#99080310" },
  instructor: { color: "#2563eb", bg: "#2563eb10" },
  learner: { color: "#16a34a", bg: "#16a34a10" },
};

export function AuditLog() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterAction, setFilterAction] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [tab, setTab] = useState<"timeline" | "analytics" | "security">("timeline");
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const modules = [...new Set(AUDIT_ENTRIES.map(e => e.module))];
  const filtered = AUDIT_ENTRIES.filter(e => {
    if (search && !e.action.toLowerCase().includes(search.toLowerCase()) && !e.user.toLowerCase().includes(search.toLowerCase()) && !e.details.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSeverity !== "all" && e.severity !== filterSeverity) return false;
    if (filterAction !== "all" && e.actionType !== filterAction) return false;
    if (filterModule !== "all" && e.module !== filterModule) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Nhật ký Hệ thống</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Theo dõi toàn bộ hoạt động, bảo mật và audit trail hệ thống LMS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất file CSV nhật ký...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "12px" }}>
            <Download className="w-4 h-4" /> Xuất CSV
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.info("Đã làm mới dữ liệu nhật ký!")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <RefreshCw className="w-4 h-4" /> Làm mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Hôm nay", value: AUDIT_ENTRIES.filter(e => e.timestamp.startsWith("12/03")).length, icon: Activity, color: "#990803" },
          { label: "Cảnh báo", value: AUDIT_ENTRIES.filter(e => e.severity === "warning").length, icon: AlertTriangle, color: "#ea580c" },
          { label: "Nghiêm trọng", value: AUDIT_ENTRIES.filter(e => e.severity === "critical").length, icon: Shield, color: "#ef4444" },
          { label: "Hệ thống", value: AUDIT_ENTRIES.filter(e => e.actionType === "system").length, icon: Server, color: "#64748b" },
          { label: "Users active", value: [...new Set(AUDIT_ENTRIES.map(e => e.user))].length, icon: Users, color: "#2563eb" },
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

      {/* Critical Alerts */}
      {AUDIT_ENTRIES.filter(e => e.severity === "critical").length > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-100 p-3">
          <h3 className="text-red-600 mb-2 flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
            <Shield className="w-4 h-4" /> Cảnh báo Bảo mật
          </h3>
          <div className="space-y-1.5">
            {AUDIT_ENTRIES.filter(e => e.severity === "critical").map(e => (
              <div key={e.id} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-red-100">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-gray-700 flex-1" style={{ fontSize: "11px" }}>{e.action}: {e.details.slice(0, 80)}...</span>
                <span className="text-gray-400 shrink-0" style={{ fontSize: "9px" }}>{e.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200">
        {[
          { id: "timeline" as const, label: "Timeline", icon: Clock },
          { id: "analytics" as const, label: "Phân tích", icon: BarChart3 },
          { id: "security" as const, label: "Bảo mật", icon: Shield },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "timeline" && (
        <div className="space-y-2">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm hoạt động, người dùng..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
            </div>
            <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả mức độ</option>
              {Object.entries(SEVERITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả hành động</option>
              {Object.keys(ACTION_ICONS).map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả module</option>
              {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="text-gray-400 ml-auto" style={{ fontSize: "11px" }}>{filtered.length} bản ghi</span>
          </div>

          {/* Timeline entries */}
          <div className="relative">
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gray-200" />
            {filtered.map(entry => {
              const actCfg = ACTION_ICONS[entry.actionType];
              const sevCfg = SEVERITY_CONFIG[entry.severity];
              const roleCfg = ROLE_COLORS[entry.userRole];
              const ActIcon = actCfg.icon;
              const isExpanded = expandedEntry === entry.id;
              return (
                <div key={entry.id} className="relative pl-12 pb-3">
                  {/* Timeline dot */}
                  <div className="absolute left-[15px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center z-10" style={{ backgroundColor: actCfg.color }}>
                    <ActIcon className="w-2 h-2 text-white" />
                  </div>

                  <div onClick={() => setExpandedEntry(isExpanded ? null : entry.id)} className="bg-white rounded-xl border border-gray-200 p-3 cursor-pointer hover:shadow-sm transition-all">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: sevCfg.color, backgroundColor: sevCfg.bg }}>{sevCfg.label}</span>
                          <span className="px-1.5 py-0.5 rounded bg-gray-50 text-gray-500" style={{ fontSize: "8px", fontWeight: 500 }}>{entry.module}</span>
                          <span className="text-gray-300" style={{ fontSize: "9px" }}>{entry.actionType}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0" style={{ fontSize: "6px", fontWeight: 700, backgroundColor: entry.user === "SYSTEM" ? "#64748b" : roleCfg.color }}>{entry.userInitials}</div>
                          <span className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{entry.user}</span>
                          <span className="text-gray-400" style={{ fontSize: "12px" }}>{entry.action}</span>
                        </div>

                        <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>{entry.target}</p>

                        {isExpanded && (
                          <div className="mt-2 p-2.5 bg-gray-50 rounded-lg space-y-1">
                            <p className="text-gray-600" style={{ fontSize: "11px", lineHeight: 1.6 }}>{entry.details}</p>
                            <div className="flex items-center gap-3 text-gray-400 pt-1" style={{ fontSize: "10px" }}>
                              <span className="flex items-center gap-0.5"><Globe className="w-2.5 h-2.5" /> {entry.ipAddress}</span>
                              <span className="flex items-center gap-0.5"><Monitor className="w-2.5 h-2.5" /> {entry.device}</span>
                              <span className="flex items-center gap-0.5"><Building2 className="w-2.5 h-2.5" /> {entry.subsidiary}</span>
                              <span className="flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" /> {entry.sessionId}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-gray-400" style={{ fontSize: "10px" }}>{entry.timestamp}</p>
                        <ChevronRight className={`w-3 h-3 text-gray-300 mt-1 ml-auto transition-transform ${isExpanded ? "rotate-90" : ""}`} />
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
              title="Không tìm thấy bản ghi nào"
              message={search ? `Không có kết quả cho "${search}"` : "Chưa có bản ghi audit nào"}
              action={search ? { label: "Xóa bộ lọc", onClick: () => setSearch("") } : undefined}
            />
          )}
        </div>
      )}

      {tab === "analytics" && <AuditAnalytics entries={AUDIT_ENTRIES} />}
      {tab === "security" && <SecurityTab entries={AUDIT_ENTRIES} />}
    </div>
  );
}

// ─── Analytics Tab ───
function AuditAnalytics({ entries }: { entries: AuditEntry[] }) {
  // Actions by type
  const actionCounts: Record<string, number> = {};
  entries.forEach(e => { actionCounts[e.actionType] = (actionCounts[e.actionType] || 0) + 1; });
  const actionEntries = Object.entries(actionCounts).sort((a, b) => b[1] - a[1]);
  const maxAction = Math.max(...actionEntries.map(a => a[1]));

  // Activity by hour
  const hourData = Array(24).fill(0);
  entries.forEach(e => {
    const h = parseInt(e.timestamp.split(" ")[1].split(":")[0]);
    hourData[h]++;
  });
  const maxHour = Math.max(...hourData);

  // Module usage
  const moduleCounts: Record<string, number> = {};
  entries.forEach(e => { moduleCounts[e.module] = (moduleCounts[e.module] || 0) + 1; });
  const moduleEntries = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-3">
      {/* Activity heatmap by hour */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Hoạt động theo Giờ (Hôm nay)</h3>
        <svg width="100%" height="80" viewBox="0 0 600 80" preserveAspectRatio="xMidYMid meet">
          {hourData.map((count, h) => {
            const x = 30 + (h / 23) * 540;
            const barH = maxHour > 0 ? (count / maxHour) * 50 : 0;
            const opacity = count > 0 ? 0.3 + (count / maxHour) * 0.7 : 0.05;
            return (
              <g key={h}>
                <rect x={x - 8} y={60 - barH} width="16" height={barH} rx="2" fill="#990803" opacity={opacity} />
                <text x={x} y={72} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "7px" }}>{h}h</text>
                {count > 0 && <text x={x} y={55 - barH} textAnchor="middle" fill="#990803" style={{ fontSize: "7px", fontWeight: 600 }}>{count}</text>}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Actions by type */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Phân bố Hành động</h3>
          <div className="space-y-1.5">
            {actionEntries.map(([type, count]) => {
              const cfg = ACTION_ICONS[type];
              const Icon = cfg.icon;
              return (
                <div key={type} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.color }} />
                  <span className="w-16 text-gray-500 shrink-0" style={{ fontSize: "11px" }}>{type}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(count / maxAction) * 100}%`, backgroundColor: cfg.color }} />
                  </div>
                  <span className="text-gray-500 w-6 text-right shrink-0" style={{ fontSize: "11px", fontWeight: 600 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module usage */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Hoạt động theo Module</h3>
          <div className="space-y-1.5">
            {moduleEntries.map(([mod, count], i) => {
              const colors = ["#990803", "#2563eb", "#16a34a", "#c8a84e", "#7c3aed", "#ea580c", "#0d9488", "#ec4899"];
              return (
                <div key={mod} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                  <span className="flex-1 text-gray-600" style={{ fontSize: "11px" }}>{mod}</span>
                  <span className="text-gray-500" style={{ fontSize: "11px", fontWeight: 600 }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Severity distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Phân bố Mức độ</h3>
        <div className="grid grid-cols-4 gap-3">
          {(Object.entries(SEVERITY_CONFIG) as [string, typeof SEVERITY_CONFIG.info][]).map(([key, cfg]) => {
            const count = entries.filter(e => e.severity === key).length;
            const pct = ((count / entries.length) * 100).toFixed(0);
            return (
              <div key={key} className="text-center p-3 rounded-lg" style={{ backgroundColor: cfg.bg }}>
                <cfg.icon className="w-5 h-5 mx-auto" style={{ color: cfg.color }} />
                <p className="mt-1" style={{ fontSize: "20px", fontWeight: 700, color: cfg.color }}>{count}</p>
                <p className="text-gray-400" style={{ fontSize: "10px" }}>{cfg.label} ({pct}%)</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Security Tab ───
function SecurityTab({ entries }: { entries: AuditEntry[] }) {
  const criticalEntries = entries.filter(e => e.severity === "critical" || e.severity === "warning");
  const loginFails = entries.filter(e => e.actionType === "login" && e.details.includes("thất bại"));

  return (
    <div className="space-y-3">
      {/* Security Score */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="35" fill="none" stroke="#e5e7eb" strokeWidth="5" />
              <circle cx="40" cy="40" r="35" fill="none" stroke="#16a34a" strokeWidth="5" strokeDasharray={`${(87 / 100) * 220} 220`} strokeLinecap="round" className="rotate-[-90deg] origin-center" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#16a34a" }}>87</span>
              <span className="text-gray-400" style={{ fontSize: "8px" }}>/ 100</span>
            </div>
          </div>
          <div>
            <h3 className="text-gray-700" style={{ fontSize: "15px", fontWeight: 700 }}>Điểm Bảo mật: Tốt</h3>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: "12px" }}>Hệ thống đang hoạt động bình thường. 2 cảnh báo cần xử lý.</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded" style={{ fontSize: "10px", fontWeight: 500 }}>SSL: OK</span>
              <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded" style={{ fontSize: "10px", fontWeight: 500 }}>Firewall: ON</span>
              <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded" style={{ fontSize: "10px", fontWeight: 500 }}>2FA: Enabled</span>
              <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded" style={{ fontSize: "10px", fontWeight: 500 }}>Alerts: 2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Sự kiện Bảo mật Gần đây</h3>
        <div className="space-y-2">
          {criticalEntries.map(e => {
            const sevCfg = SEVERITY_CONFIG[e.severity];
            const SevIcon = sevCfg.icon;
            return (
              <div key={e.id} className="p-3 rounded-lg border" style={{ borderColor: sevCfg.color + "20", backgroundColor: sevCfg.bg }}>
                <div className="flex items-start gap-2">
                  <SevIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: sevCfg.color }} />
                  <div className="flex-1">
                    <p style={{ fontSize: "12px", fontWeight: 600, color: sevCfg.color }}>{e.action}</p>
                    <p className="text-gray-500 mt-0.5" style={{ fontSize: "11px" }}>{e.details}</p>
                    <div className="flex items-center gap-3 mt-1 text-gray-400" style={{ fontSize: "10px" }}>
                      <span>{e.user}</span>
                      <span>{e.ipAddress}</span>
                      <span>{e.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Phiên Đăng nhập Đang hoạt động</h3>
        <div className="space-y-1.5">
          {[
            { user: "Nguyễn Văn Minh", ip: "192.168.1.45", device: "Chrome / Win 11", since: "08:00", role: "admin" as const },
            { user: "Đỗ Thanh Hương", ip: "192.168.1.102", device: "Safari / macOS", since: "08:15", role: "instructor" as const },
            { user: "Ngô Trung Kiên", ip: "192.168.1.88", device: "Chrome / Win 11", since: "08:30", role: "admin" as const },
            { user: "Trần Thị Hương", ip: "10.20.1.55", device: "Edge / Win 11", since: "08:45", role: "instructor" as const },
            { user: "Phạm Anh Tuấn", ip: "10.30.2.10", device: "Chrome / macOS", since: "09:00", role: "instructor" as const },
          ].map((session, i) => {
            const rCfg = ROLE_COLORS[session.role];
            return (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ fontSize: "7px", fontWeight: 700, backgroundColor: rCfg.color }}>
                  {session.user.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 500 }}>{session.user}</span>
                <span className="text-gray-400 ml-auto" style={{ fontSize: "10px" }}>{session.ip}</span>
                <span className="text-gray-300" style={{ fontSize: "10px" }}>{session.device}</span>
                <span className="text-gray-400" style={{ fontSize: "10px" }}>từ {session.since}</span>
                <button onClick={() => { import("sonner").then(m => m.toast.success("Đã kết thúc phiên đăng nhập!")); }} className="px-2 py-0.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer" style={{ fontSize: "9px" }}>Kết thúc</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}