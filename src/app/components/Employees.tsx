import { useState, useMemo, useRef } from "react";
import {
  Search, Users, RefreshCw, CheckCircle2, AlertTriangle, Clock,
  Building2, Briefcase, Grid3X3, List, ChevronLeft, ChevronRight,
  Eye, BookOpen, Award, X, Download, Upload, Database,
  Wifi, WifiOff, Zap, Calendar, History,
  TrendingUp, Shield, UserCheck, UserX, UserPlus, RotateCw,
  ExternalLink, Settings, Activity, Mail, FileText, Play,
  Pause, ArrowUp, ArrowDown, Filter, MoreVertical, Copy,
  GitBranch, Bell, Lock, Unlock, Edit3, Trash2, Info,
  ChevronDown, Check, BarChart3, Layers,
} from "lucide-react";
import { toast } from "@/app/lib/toast";
import { exportToCSV } from "./ExportManager";
import { mockEmployees, DEPARTMENTS, SUBSIDIARIES } from "./mock-data";
import type { User } from "./mock-data";
import { EmptyState } from "./EmptyState";

// ============================================
// TYPES
// ============================================
interface SyncLog {
  id: string;
  timestamp: string;
  type: "auto" | "manual" | "webhook";
  status: "success" | "warning" | "error";
  source: string;
  stats: { added: number; updated: number; deactivated: number; unchanged: number; errors: number };
  duration: string;
  triggeredBy: string;
  details?: string;
}

interface HRConnection {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error";
  lastSync: string;
  nextSync: string;
  syncFrequency: string;
  endpoint: string;
  authMethod: string;
  totalRecords: number;
  mappedFields: number;
  uptime: number;
  avgDuration: string;
  lastError?: string;
  syncRules: { name: string; enabled: boolean; description: string }[];
}

interface SyncChange {
  id: string;
  timestamp: string;
  employeeId: string;
  employeeName: string;
  changeType: "added" | "updated" | "deactivated" | "reactivated";
  field?: string;
  oldValue?: string;
  newValue?: string;
  source: string;
  autoActions: string[];
}

// ============================================
// MOCK DATA
// ============================================
const hrConnections: HRConnection[] = [
  {
    id: "HR01", name: "Geleximco HRM", type: "REST API", status: "connected",
    lastSync: "11/03/2026 08:30", nextSync: "11/03/2026 14:30", syncFrequency: "Mỗi 6 giờ",
    endpoint: "https://hrm.geleximco.vn/api/v2", authMethod: "OAuth 2.0 + API Key",
    totalRecords: 3760, mappedFields: 8, uptime: 99.7, avgDuration: "2m 08s",
    syncRules: [
      { name: "Auto-create LMS account", enabled: true, description: "Tự động tạo tài khoản LMS khi có nhân sự mới" },
      { name: "Auto-enroll Onboarding", enabled: true, description: "Ghi danh khóa Onboarding & Văn hóa TD cho NS mới" },
      { name: "Auto-deactivate on resign", enabled: true, description: "Vô hiệu hóa tài khoản khi NS nghỉ việc" },
      { name: "Notify on dept change", enabled: true, description: "Thông báo cho Manager khi NS chuyển phòng ban" },
      { name: "Auto-assign mandatory courses", enabled: true, description: "Ghi danh khóa bắt buộc theo phòng ban mới" },
      { name: "Sync avatar from HRM", enabled: false, description: "Đồng bộ ảnh đại diện từ HRM sang LMS" },
    ],
  },
  {
    id: "HR02", name: "ABBank HCM", type: "SFTP", status: "connected",
    lastSync: "11/03/2026 06:00", nextSync: "12/03/2026 06:00", syncFrequency: "Hàng ngày 06:00",
    endpoint: "sftp://hr.abbank.vn/exports", authMethod: "SSH Key + IP Whitelist",
    totalRecords: 2850, mappedFields: 8, uptime: 98.5, avgDuration: "1m 45s",
    syncRules: [
      { name: "Auto-create LMS account", enabled: true, description: "Tự động tạo tài khoản LMS khi có nhân sự mới" },
      { name: "Auto-enroll AML training", enabled: true, description: "Ghi danh khóa Chống rửa tiền cho tất cả NS mới" },
      { name: "Auto-deactivate on resign", enabled: true, description: "Vô hiệu hóa tài khoản khi NS nghỉ việc" },
      { name: "Role mapping by job level", enabled: true, description: "Ánh xạ vai trò LMS từ cấp bậc nhân sự" },
    ],
  },
  {
    id: "HR03", name: "Active Directory", type: "LDAP", status: "connected",
    lastSync: "11/03/2026 09:00", nextSync: "11/03/2026 13:00", syncFrequency: "Mỗi 4 giờ",
    endpoint: "ldap://ad.geleximco.local", authMethod: "Kerberos + Service Account",
    totalRecords: 6610, mappedFields: 5, uptime: 99.9, avgDuration: "0m 48s",
    syncRules: [
      { name: "SSO integration", enabled: true, description: "Đăng nhập LMS bằng tài khoản AD (Single Sign-On)" },
      { name: "Group → Role mapping", enabled: true, description: "Ánh xạ AD Group → LMS Role" },
      { name: "Auto-disable on AD lock", enabled: true, description: "Khóa LMS khi tài khoản AD bị disable" },
    ],
  },
];

const syncLogs: SyncLog[] = [
  { id: "SL01", timestamp: "11/03/2026 08:30", type: "auto", status: "success", source: "Geleximco HRM", stats: { added: 12, updated: 45, deactivated: 3, unchanged: 6550, errors: 0 }, duration: "2m 15s", triggeredBy: "Hệ thống (Auto)", details: "Đồng bộ thành công 6,610 bản ghi. 12 nhân sự mới đã được tạo tài khoản LMS và ghi danh Onboarding." },
  { id: "SL02", timestamp: "11/03/2026 06:00", type: "auto", status: "success", source: "ABBank HCM", stats: { added: 5, updated: 28, deactivated: 1, unchanged: 2816, errors: 0 }, duration: "1m 42s", triggeredBy: "Hệ thống (Auto)", details: "File CSV nhận qua SFTP, parse thành công. 5 NS mới từ chi nhánh TP.HCM." },
  { id: "SL03", timestamp: "10/03/2026 14:22", type: "manual", status: "warning", source: "Geleximco HRM", stats: { added: 8, updated: 32, deactivated: 2, unchanged: 6560, errors: 3 }, duration: "3m 08s", triggeredBy: "Nguyễn Hoàng Admin", details: "3 lỗi: Trùng email (2), thiếu phòng ban (1). Các bản ghi lỗi được skip, cần xử lý thủ công." },
  { id: "SL04", timestamp: "10/03/2026 08:30", type: "auto", status: "success", source: "Geleximco HRM", stats: { added: 3, updated: 18, deactivated: 0, unchanged: 6589, errors: 0 }, duration: "2m 01s", triggeredBy: "Hệ thống (Auto)" },
  { id: "SL05", timestamp: "09/03/2026 20:00", type: "webhook", status: "success", source: "Active Directory", stats: { added: 15, updated: 0, deactivated: 0, unchanged: 6595, errors: 0 }, duration: "0m 45s", triggeredBy: "Webhook (AD)", details: "15 tài khoản AD mới được tạo → auto-create 15 tài khoản LMS." },
  { id: "SL06", timestamp: "09/03/2026 08:30", type: "auto", status: "error", source: "ABBank HCM", stats: { added: 0, updated: 0, deactivated: 0, unchanged: 0, errors: 1 }, duration: "0m 12s", triggeredBy: "Hệ thống (Auto)", details: "Connection timeout: SFTP server không phản hồi sau 30s. Đã retry 3 lần. Cần kiểm tra firewall ABBank." },
  { id: "SL07", timestamp: "08/03/2026 14:00", type: "manual", status: "success", source: "Geleximco HRM", stats: { added: 22, updated: 67, deactivated: 5, unchanged: 6516, errors: 0 }, duration: "3m 52s", triggeredBy: "Trần Thị Lan HR", details: "Đợt đồng bộ lớn: 22 NS mới (đợt tuyển dụng Q1), 5 NS nghỉ việc đã vô hiệu hóa tài khoản LMS." },
  { id: "SL08", timestamp: "08/03/2026 06:00", type: "auto", status: "success", source: "ABBank HCM", stats: { added: 2, updated: 15, deactivated: 1, unchanged: 2830, errors: 0 }, duration: "1m 38s", triggeredBy: "Hệ thống (Auto)" },
  { id: "SL09", timestamp: "07/03/2026 20:00", type: "webhook", status: "success", source: "Active Directory", stats: { added: 3, updated: 8, deactivated: 0, unchanged: 6592, errors: 0 }, duration: "0m 32s", triggeredBy: "Webhook (AD)" },
  { id: "SL10", timestamp: "07/03/2026 08:30", type: "auto", status: "success", source: "Geleximco HRM", stats: { added: 1, updated: 12, deactivated: 0, unchanged: 6594, errors: 0 }, duration: "1m 55s", triggeredBy: "Hệ thống (Auto)" },
  { id: "SL11", timestamp: "06/03/2026 14:30", type: "manual", status: "success", source: "Geleximco HRM", stats: { added: 0, updated: 0, deactivated: 8, unchanged: 6602, errors: 0 }, duration: "1m 20s", triggeredBy: "Nguyễn Hoàng Admin", details: "Đợt cleanup: vô hiệu hóa 8 tài khoản NS đã nghỉ việc trước đó." },
  { id: "SL12", timestamp: "06/03/2026 06:00", type: "auto", status: "warning", source: "ABBank HCM", stats: { added: 3, updated: 20, deactivated: 0, unchanged: 2825, errors: 2 }, duration: "2m 05s", triggeredBy: "Hệ thống (Auto)", details: "2 lỗi: Trùng mã nhân viên. Đã skip và log lại." },
];

const syncChanges: SyncChange[] = [
  { id: "SC01", timestamp: "11/03/2026 08:30", employeeId: "E001", employeeName: "Nguyễn Văn An", changeType: "added", source: "Geleximco HRM", autoActions: ["Tạo tài khoản LMS", "Ghi danh Onboarding", "Gửi email chào mừng"] },
  { id: "SC02", timestamp: "11/03/2026 08:30", employeeId: "E002", employeeName: "Trần Thị Bình", changeType: "updated", field: "department", oldValue: "Ban Kinh doanh BĐS", newValue: "Ban Marketing BĐS", source: "Geleximco HRM", autoActions: ["Cập nhật nhóm học viên", "Ghi danh khóa Marketing nâng cao"] },
  { id: "SC03", timestamp: "11/03/2026 08:30", employeeId: "E003", employeeName: "Lê Hoàng Cường", changeType: "updated", field: "position", oldValue: "Chuyên viên", newValue: "Phó Phòng", source: "Geleximco HRM", autoActions: ["Gợi ý lộ trình Quản lý cấp trung", "Nâng quyền xem báo cáo"] },
  { id: "SC04", timestamp: "11/03/2026 08:30", employeeId: "E004", employeeName: "Phạm Minh Đức", changeType: "deactivated", source: "Geleximco HRM", autoActions: ["Vô hiệu hóa tài khoản", "Thu hồi chứng chỉ chưa cấp", "Lưu trữ lịch sử học tập"] },
  { id: "SC05", timestamp: "11/03/2026 08:30", employeeId: "E005", employeeName: "Hoàng Thị Em", changeType: "added", source: "Geleximco HRM", autoActions: ["Tạo tài khoản LMS", "Ghi danh Onboarding", "Gửi email chào mừng"] },
  { id: "SC06", timestamp: "11/03/2026 08:30", employeeId: "E006", employeeName: "Vũ Đức Phú", changeType: "updated", field: "subsidiary", oldValue: "KĐT Lê Trọng Tấn", newValue: "KĐT An Khánh", source: "Geleximco HRM", autoActions: ["Chuyển đơn vị", "Ghi danh khóa tuân thủ KĐT An Khánh", "Thu hồi quyền KĐT LTT"] },
  { id: "SC07", timestamp: "11/03/2026 06:00", employeeId: "E007", employeeName: "Đỗ Thanh Giang", changeType: "added", source: "ABBank HCM", autoActions: ["Tạo tài khoản LMS", "Ghi danh AML Training", "Ghi danh Onboarding ABBank"] },
  { id: "SC08", timestamp: "11/03/2026 06:00", employeeId: "E008", employeeName: "Ngô Hải Hà", changeType: "updated", field: "position", oldValue: "GDV", newValue: "Kiểm soát viên", source: "ABBank HCM", autoActions: ["Ghi danh khóa Kiểm soát Nội bộ", "Cập nhật role LMS"] },
  { id: "SC09", timestamp: "10/03/2026 14:22", employeeId: "E009", employeeName: "Bùi Văn Khoa", changeType: "reactivated", source: "Geleximco HRM", autoActions: ["Kích hoạt lại tài khoản", "Khôi phục lịch sử học tập", "Ghi danh khóa bắt buộc hiện hành"] },
  { id: "SC10", timestamp: "10/03/2026 14:22", employeeId: "E010", employeeName: "Mai Thị Lan", changeType: "updated", field: "department", oldValue: "Khối Ngân hàng Bán lẻ", newValue: "Khối Quản trị Rủi ro", source: "Geleximco HRM", autoActions: ["Cập nhật nhóm", "Ghi danh khóa Quản trị Rủi ro nâng cao"] },
  { id: "SC11", timestamp: "08/03/2026 14:00", employeeId: "E011", employeeName: "Trương Minh Nam", changeType: "added", source: "Geleximco HRM", autoActions: ["Tạo tài khoản LMS", "Ghi danh An toàn Mỏ", "Ghi danh Onboarding"] },
  { id: "SC12", timestamp: "08/03/2026 14:00", employeeId: "E012", employeeName: "Lý Thị Oanh", changeType: "deactivated", source: "Geleximco HRM", autoActions: ["Vô hiệu hóa tài khoản", "Lưu trữ chứng chỉ", "Lưu trữ lịch sử"] },
];

const roleLabels: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: "Quản trị viên", color: "#e74c3c", bg: "#e74c3c10" },
  manager: { label: "Quản lý", color: "#990803", bg: "#99080310" },
  instructor: { label: "Giảng viên", color: "#c8a84e", bg: "#c8a84e15" },
  learner: { label: "Học viên", color: "#2e86de", bg: "#2e86de10" },
};

// Stable sync status (seeded by employee id hash so it's deterministic)
const syncStatusMap: Record<string, "synced" | "pending" | "error"> = {};
mockEmployees.forEach((e, i) => {
  syncStatusMap[e.id] = i % 25 === 0 ? "error" : i % 12 === 0 ? "pending" : "synced";
});

type ActiveTab = "overview" | "employees" | "changes" | "logs" | "connections" | "rules";

// ============================================
// SVG CHARTS
// ============================================
function SyncActivityChart({ logs }: { logs: SyncLog[] }) {
  // Group by day last 7 days
  const days = ["05/03", "06/03", "07/03", "08/03", "09/03", "10/03", "11/03"];
  const data = days.map(day => {
    const dayLogs = logs.filter(l => l.timestamp.startsWith(day));
    return {
      day,
      added: dayLogs.reduce((a, b) => a + b.stats.added, 0),
      updated: dayLogs.reduce((a, b) => a + b.stats.updated, 0),
      deactivated: dayLogs.reduce((a, b) => a + b.stats.deactivated, 0),
      errors: dayLogs.reduce((a, b) => a + b.stats.errors, 0),
      total: dayLogs.length,
    };
  });
  const maxVal = Math.max(...data.map(d => d.added + d.updated + d.deactivated), 1);
  const W = 360, H = 140, pad = { t: 10, r: 10, b: 26, l: 35 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const barW = cW / days.length * 0.7;
  const gap = cW / days.length;

  return (
    <svg width={W} height={H} className="w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {[0, 0.5, 1].map(f => (
        <g key={f}>
          <line x1={pad.l} y1={pad.t + cH * (1 - f)} x2={W - pad.r} y2={pad.t + cH * (1 - f)} stroke="currentColor" className="text-border" strokeWidth="0.5" strokeDasharray="2,2" />
          <text x={pad.l - 4} y={pad.t + cH * (1 - f) + 3} textAnchor="end" fill="currentColor" className="text-muted-foreground" style={{ fontSize: "8px" }}>{Math.round(maxVal * f)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = pad.l + i * gap + gap * 0.15;
        const addH = (d.added / maxVal) * cH;
        const updH = (d.updated / maxVal) * cH;
        const deaH = (d.deactivated / maxVal) * cH;
        let y = pad.t + cH;
        return (
          <g key={i}>
            <rect x={x} y={y - addH} width={barW * 0.3} height={addH} rx="2" fill="#27ae60" opacity="0.85" />
            <rect x={x + barW * 0.33} y={y - updH} width={barW * 0.3} height={updH} rx="2" fill="#2e86de" opacity="0.85" />
            <rect x={x + barW * 0.66} y={y - deaH} width={barW * 0.3} height={deaH} rx="2" fill="#e74c3c" opacity="0.85" />
            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fill="currentColor" className="text-muted-foreground" style={{ fontSize: "9px" }}>{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
}

function RoleDistributionChart() {
  const roleCounts = {
    admin: mockEmployees.filter(e => e.role === "admin").length,
    manager: mockEmployees.filter(e => e.role === "manager").length,
    instructor: mockEmployees.filter(e => e.role === "instructor").length,
    learner: mockEmployees.filter(e => e.role === "learner").length,
  };
  const total = Object.values(roleCounts).reduce((a, b) => a + b, 0);
  const entries = [
    { key: "learner", label: "Học viên", count: roleCounts.learner, color: "#2e86de" },
    { key: "instructor", label: "Giảng viên", count: roleCounts.instructor, color: "#c8a84e" },
    { key: "manager", label: "Quản lý", count: roleCounts.manager, color: "#990803" },
    { key: "admin", label: "Admin", count: roleCounts.admin, color: "#e74c3c" },
  ];
  const cx = 60, cy = 60, r = 48, innerR = 30;
  let cum = -90;

  return (
    <div className="flex items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {entries.map(e => {
          const angle = (e.count / total) * 360;
          if (angle === 0) return null;
          const start = cum; cum += angle;
          const end = cum;
          const sR = (start * Math.PI) / 180;
          const eR = (end * Math.PI) / 180;
          const la = angle > 180 ? 1 : 0;
          const d = `M${cx + r * Math.cos(sR)},${cy + r * Math.sin(sR)} A${r},${r} 0 ${la},1 ${cx + r * Math.cos(eR)},${cy + r * Math.sin(eR)} L${cx + innerR * Math.cos(eR)},${cy + innerR * Math.sin(eR)} A${innerR},${innerR} 0 ${la},0 ${cx + innerR * Math.cos(sR)},${cy + innerR * Math.sin(sR)} Z`;
          return <path key={e.key} d={d} fill={e.color} opacity="0.85" />;
        })}
        <circle cx={cx} cy={cy} r={innerR - 2} fill="currentColor" className="text-card" />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="currentColor" className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>{total}</text>
      </svg>
      <div className="flex-1 space-y-1.5">
        {entries.map(e => (
          <div key={e.key} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: e.color }} />
            <span className="text-muted-foreground flex-1" style={{ fontSize: "11px" }}>{e.label}</span>
            <span className="text-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>{e.count}</span>
            <span className="text-muted-foreground" style={{ fontSize: "10px" }}>({Math.round(e.count / total * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function Employees() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedSub, setSelectedSub] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [syncStatusFilter, setSyncStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState("11/03/2026 08:30");
  const [selectedLog, setSelectedLog] = useState<SyncLog | null>(null);
  const [selectedConn, setSelectedConn] = useState<HRConnection | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [logFilter, setLogFilter] = useState({ source: "all", type: "all", status: "all" });
  const [changeFilter, setChangeFilter] = useState({ type: "all", source: "all" });
  const [sortField, setSortField] = useState<"name" | "subsidiary" | "coursesCompleted" | "totalHours">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [connRules, setConnRules] = useState<Record<string, Record<string, boolean>>>(() => {
    const m: Record<string, Record<string, boolean>> = {};
    hrConnections.forEach(c => { m[c.id] = {}; c.syncRules.forEach(r => { m[c.id][r.name] = r.enabled; }); });
    return m;
  });
  const perPage = 12;
  const tabRef = useRef<HTMLDivElement>(null);

  // Sync simulation
  const handleSync = () => {
    setIsSyncing(true);
    setSyncProgress(0);
    const iv = setInterval(() => {
      setSyncProgress(p => {
        if (p >= 100) { clearInterval(iv); return 100; }
        return p + Math.random() * 15 + 5;
      });
    }, 400);
    setTimeout(() => {
      clearInterval(iv);
      setSyncProgress(100);
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
        setLastSyncTime(new Date().toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }));
        toast.success("Đồng bộ nhân sự hoàn tất! 6,610 bản ghi đã được cập nhật.");
      }, 500);
    }, 4000);
  };

  // Filters & sort
  const filtered = useMemo(() => {
    return mockEmployees.filter(e => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.position.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
      const matchDept = selectedDept === "all" || e.department === selectedDept;
      const matchSub = selectedSub === "all" || e.subsidiary === selectedSub;
      const matchRole = selectedRole === "all" || e.role === selectedRole;
      const matchSync = syncStatusFilter === "all" || syncStatusMap[e.id] === syncStatusFilter;
      return matchSearch && matchDept && matchSub && matchRole && matchSync;
    }).sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "name") return a.name.localeCompare(b.name) * dir;
      if (sortField === "subsidiary") return a.subsidiary.localeCompare(b.subsidiary) * dir;
      return ((a[sortField] as number) - (b[sortField] as number)) * dir;
    });
  }, [searchQuery, selectedDept, selectedSub, selectedRole, syncStatusFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const syncStats = useMemo(() => ({
    total: mockEmployees.length,
    synced: Object.values(syncStatusMap).filter(s => s === "synced").length,
    pending: Object.values(syncStatusMap).filter(s => s === "pending").length,
    error: Object.values(syncStatusMap).filter(s => s === "error").length,
  }), []);

  const filteredLogs = useMemo(() => syncLogs.filter(l => {
    return (logFilter.source === "all" || l.source === logFilter.source) &&
      (logFilter.type === "all" || l.type === logFilter.type) &&
      (logFilter.status === "all" || l.status === logFilter.status);
  }), [logFilter]);

  const filteredChanges = useMemo(() => syncChanges.filter(c => {
    return (changeFilter.type === "all" || c.changeType === changeFilter.type) &&
      (changeFilter.source === "all" || c.source === changeFilter.source);
  }), [changeFilter]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };
  const toggleSelect = (id: string) => {
    setSelectedItems(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleSelectAll = () => {
    if (selectedItems.size === paginated.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(paginated.map(e => e.id)));
  };

  const SyncStatusBadge = ({ status }: { status: string }) => {
    if (status === "synced") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600" style={{ fontSize: "10px", fontWeight: 500 }}><CheckCircle2 className="w-3 h-3" /> Đã đồng bộ</span>;
    if (status === "pending") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600" style={{ fontSize: "10px", fontWeight: 500 }}><Clock className="w-3 h-3" /> Chờ xử lý</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-500" style={{ fontSize: "10px", fontWeight: 500 }}><AlertTriangle className="w-3 h-3" /> Lỗi</span>;
  };

  const tabs: { key: ActiveTab; label: string; icon: typeof Users; badge?: string }[] = [
    { key: "overview", label: "Tổng quan", icon: Activity },
    { key: "employees", label: "Nhân sự", icon: Users, badge: mockEmployees.length.toLocaleString() },
    { key: "changes", label: "Thay đổi", icon: GitBranch, badge: syncChanges.length.toString() },
    { key: "logs", label: "Lịch sử Sync", icon: History, badge: syncLogs.length.toString() },
    { key: "connections", label: "Kết nối HR", icon: Database, badge: hrConnections.length.toString() },
    { key: "rules", label: "Quy tắc", icon: Settings },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-foreground flex items-center gap-2" style={{ fontSize: "22px", fontWeight: 700 }}>
            <RefreshCw className="w-6 h-6 text-[#990803]" />
            Đồng bộ Nhân sự
          </h1>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
            Đồng bộ một chiều HRM → LMS • {syncStats.total.toLocaleString()} nhân sự • 3 nguồn kết nối
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Đồng bộ gần nhất</p>
            <p className="text-foreground flex items-center gap-1" style={{ fontSize: "12px", fontWeight: 600 }}>
              <CheckCircle2 className="w-3 h-3 text-green-500" /> {lastSyncTime}
            </p>
          </div>
          <button onClick={handleSync} disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${isSyncing ? "bg-[#990803]/60 text-white/80" : "bg-[#990803] text-white hover:bg-[#990803]/90 shadow-sm hover:shadow-md"}`}
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
          </button>
        </div>
      </div>

      {/* Sync Progress Banner */}
      {isSyncing && (
        <div className="bg-[#990803]/5 border border-[#990803]/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <RefreshCw className="w-5 h-5 text-[#990803] animate-spin" />
            <div className="flex-1">
              <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>Đang đồng bộ dữ liệu từ 3 nguồn...</p>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                {syncProgress < 30 ? "Kết nối tới Geleximco HRM..." : syncProgress < 60 ? "Đang xử lý ABBank HCM..." : syncProgress < 90 ? "Đồng bộ Active Directory..." : "Hoàn tất xử lý..."}
              </p>
            </div>
            <span className="text-[#990803]" style={{ fontSize: "14px", fontWeight: 700 }}>{Math.min(Math.round(syncProgress), 100)}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#990803] to-[#c8a84e] rounded-full transition-all duration-300" style={{ width: `${Math.min(syncProgress, 100)}%` }} />
          </div>
          <div className="flex items-center gap-4 mt-2">
            {hrConnections.map((c, i) => (
              <div key={c.id} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${syncProgress > (i + 1) * 30 ? "bg-green-500" : "bg-yellow-400 animate-pulse"}`} />
                <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <div ref={tabRef} className="flex overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 shrink-0 border-b-2 transition-colors cursor-pointer ${activeTab === tab.key ? "border-[#990803] text-[#990803]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              style={{ fontSize: "13px", fontWeight: activeTab === tab.key ? 600 : 400 }}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && <span className={`ml-1 px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-[#990803]/10 text-[#990803]" : "bg-secondary text-muted-foreground"}`} style={{ fontSize: "10px", fontWeight: 600 }}>{tab.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ========== OVERVIEW ========== */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
            {[
              { icon: Users, label: "Tổng NS", value: syncStats.total.toLocaleString(), color: "#990803", bg: "bg-[#990803]/10" },
              { icon: UserCheck, label: "Đã sync", value: syncStats.synced.toLocaleString(), color: "#27ae60", bg: "bg-green-50" },
              { icon: Clock, label: "Chờ xử lý", value: syncStats.pending.toString(), color: "#f39c12", bg: "bg-yellow-50" },
              { icon: AlertTriangle, label: "Lỗi", value: syncStats.error.toString(), color: "#e74c3c", bg: "bg-red-50" },
              { icon: Database, label: "Nguồn HR", value: "3", color: "#8e44ad", bg: "bg-purple-50" },
              { icon: RefreshCw, label: "Sync/tuần", value: "42", color: "#2e86de", bg: "bg-blue-50" },
              { icon: UserPlus, label: "NS mới (T3)", value: "67", color: "#16a085", bg: "bg-teal-50" },
              { icon: TrendingUp, label: "Uptime TB", value: "99.4%", color: "#c8a84e", bg: "bg-[#c8a84e]/10" },
            ].map((c, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-3">
                <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center mb-2`}>
                  <c.icon className="w-4 h-4" style={{ color: c.color }} />
                </div>
                <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>{c.value}</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{c.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sync Activity Chart */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-foreground mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>
                <BarChart3 className="w-4 h-4 inline mr-1.5 text-[#990803]" />
                Hoạt động Đồng bộ 7 ngày
              </h3>
              <div className="flex items-center gap-4 mb-3">
                {[{ label: "Thêm mới", color: "#27ae60" }, { label: "Cập nhật", color: "#2e86de" }, { label: "Vô hiệu", color: "#e74c3c" }].map(l => (
                  <div key={l.label} className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                    <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{l.label}</span>
                  </div>
                ))}
              </div>
              <SyncActivityChart logs={syncLogs} />
            </div>

            {/* Role Distribution */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
                <Shield className="w-4 h-4 inline mr-1.5 text-[#990803]" />
                Phân bổ Vai trò LMS
              </h3>
              <RoleDistributionChart />
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                  Vai trò LMS được ánh xạ tự động từ <code className="px-1 py-0.5 bg-secondary rounded" style={{ fontSize: "10px" }}>job_level</code> trong HRM.
                  Admin có thể override thủ công tại mục Phân quyền.
                </p>
              </div>
            </div>
          </div>

          {/* Flow + Subsidiary distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
                <Zap className="w-4 h-4 inline mr-1.5 text-[#c8a84e]" />
                Luồng Đồng bộ Dữ liệu
              </h3>
              <div className="space-y-3">
                {[
                  { step: 1, title: "Hệ thống HRM (Nguồn)", desc: "Geleximco HRM, ABBank HCM, Active Directory", icon: Database, color: "#2e86de" },
                  { step: 2, title: "Kết nối & Xác thực", desc: "REST API (OAuth 2.0), SFTP (SSH Key), LDAP (Kerberos)", icon: Wifi, color: "#8e44ad" },
                  { step: 3, title: "Xử lý & Mapping", desc: "Validate, deduplicate, ánh xạ 8 trường dữ liệu", icon: Settings, color: "#f39c12" },
                  { step: 4, title: "LMS Geleximco", desc: "Tạo/cập nhật tài khoản, phân quyền, ghi danh tự động", icon: BookOpen, color: "#990803" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: item.color }}><item.icon className="w-4 h-4" /></div>
                      {i < 3 && <div className="w-0.5 h-4 bg-border mt-1" />}
                    </div>
                    <div>
                      <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>Bước {item.step}: {item.title}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
                <Building2 className="w-4 h-4 inline mr-1.5 text-[#990803]" />
                Phân bổ theo Đơn vị ({SUBSIDIARIES.length})
              </h3>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                {SUBSIDIARIES.map(sub => {
                  const count = mockEmployees.filter(e => e.subsidiary === sub).length;
                  return (
                    <div key={sub} className="flex items-center gap-2 p-1.5 hover:bg-secondary/30 rounded-lg transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-foreground truncate" style={{ fontSize: "11px", fontWeight: 500 }}>{sub.replace("Tập đoàn Geleximco", "VP Tập đoàn").replace("Ngân hàng TMCP An Bình (ABBank)", "ABBank").replace("BĐS Geleximco - ", "")}</p>
                          <span className="text-muted-foreground shrink-0 ml-2" style={{ fontSize: "10px" }}>{count}</span>
                        </div>
                        <div className="h-1 bg-secondary rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-[#990803] rounded-full" style={{ width: `${(count / mockEmployees.length) * 100 * 2.5}%` }} />
                        </div>
                      </div>
                      <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Auto-actions grid */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Zap className="w-4 h-4 inline mr-1.5 text-[#c8a84e]" />
              Hành động Tự động khi Đồng bộ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: UserPlus, title: "Nhân sự mới", desc: "Tạo tài khoản LMS → Ghi danh Onboarding → Gửi email chào mừng → Thông báo Manager", color: "#27ae60" },
                { icon: RotateCw, title: "Chuyển phòng ban", desc: "Cập nhật nhóm học viên → Ghi danh khóa bắt buộc mới → Thông báo Manager mới", color: "#2e86de" },
                { icon: TrendingUp, title: "Thăng chức", desc: "Gợi ý lộ trình đào tạo mới → Nâng quyền LMS nếu cần → Ghi danh khóa Leadership", color: "#c8a84e" },
                { icon: Building2, title: "Chuyển đơn vị", desc: "Cập nhật đơn vị → Ghi danh khóa tuân thủ mới → Thu hồi quyền đơn vị cũ", color: "#8e44ad" },
                { icon: UserX, title: "Nghỉ việc", desc: "Vô hiệu hóa tài khoản → Thu hồi chứng chỉ pending → Lưu trữ lịch sử học tập", color: "#e74c3c" },
                { icon: Shield, title: "Đổi vai trò", desc: "Cập nhật role LMS → Điều chỉnh quyền → Ghi danh/thu hồi khóa theo role mới", color: "#990803" },
              ].map((a, i) => (
                <div key={i} className="p-3.5 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${a.color}15` }}>
                      <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                    </div>
                    <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{a.title}</span>
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== EMPLOYEES ========== */}
      {activeTab === "employees" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" placeholder="Tìm tên, email, chức vụ, mã NS..."
                  value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none text-foreground" style={{ fontSize: "13px" }} />
              </div>
              <select value={selectedSub} onChange={e => { setSelectedSub(e.target.value); setPage(1); }}
                className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "13px" }}>
                <option value="all">Toàn tập đoàn</option>
                {SUBSIDIARIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={selectedRole} onChange={e => { setSelectedRole(e.target.value); setPage(1); }}
                className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "13px" }}>
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Quản trị viên</option>
                <option value="manager">Quản lý</option>
                <option value="instructor">Giảng viên</option>
                <option value="learner">Học viên</option>
              </select>
              <select value={syncStatusFilter} onChange={e => { setSyncStatusFilter(e.target.value); setPage(1); }}
                className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "13px" }}>
                <option value="all">Trạng thái sync</option>
                <option value="synced">✓ Đã đồng bộ</option>
                <option value="pending">⏳ Chờ xử lý</option>
                <option value="error">⚠ Lỗi</option>
              </select>
              <div className="flex gap-1">
                <button onClick={() => setViewMode("table")} className={`p-2.5 rounded-lg cursor-pointer ${viewMode === "table" ? "bg-[#990803] text-white" : "bg-input-background text-muted-foreground"}`}><List className="w-4 h-4" /></button>
                <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-lg cursor-pointer ${viewMode === "grid" ? "bg-[#990803] text-white" : "bg-input-background text-muted-foreground"}`}><Grid3X3 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Bulk actions */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
              Hiển thị <span className="text-foreground" style={{ fontWeight: 600 }}>{filtered.length}</span> nhân sự
              {selectedItems.size > 0 && <span className="ml-2 px-2 py-0.5 bg-[#990803]/10 text-[#990803] rounded-full" style={{ fontSize: "10px", fontWeight: 600 }}>{selectedItems.size} đã chọn</span>}
            </p>
            <div className="flex items-center gap-2">
              {selectedItems.size > 0 && (
                <>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#990803] text-white rounded-lg cursor-pointer" style={{ fontSize: "11px", fontWeight: 500 }}
                    onClick={handleSync}>
                    <RefreshCw className="w-3 h-3" /> Re-sync ({selectedItems.size})
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground rounded-lg cursor-pointer" style={{ fontSize: "11px", fontWeight: 500 }}
                    onClick={() => { const items = employees.filter(e => selectedItems.has(e.id)); exportToCSV(items as unknown as Record<string, unknown>[], "employees-selected"); }}>
                    <Download className="w-3 h-3" /> Export
                  </button>
                </>
              )}
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground rounded-lg cursor-pointer hover:bg-secondary/80" style={{ fontSize: "11px", fontWeight: 500 }}
                onClick={() => exportToCSV(employees as unknown as Record<string, unknown>[], "employees-all")}>
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
          </div>

          {/* Table View */}
          {viewMode === "table" ? (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="w-10 px-3 py-3">
                        <input type="checkbox" checked={selectedItems.size === paginated.length && paginated.length > 0}
                          onChange={toggleSelectAll} className="w-3.5 h-3.5 rounded accent-[#990803] cursor-pointer" />
                      </th>
                      {[
                        { key: "name", label: "Nhân sự", sortable: true },
                        { key: "subsidiary", label: "Đơn vị / Phòng ban", sortable: true },
                        { key: "role", label: "Vai trò", sortable: false },
                        { key: "sync", label: "Sync", sortable: false },
                        { key: "coursesCompleted", label: "Khóa học", sortable: true },
                        { key: "totalHours", label: "Giờ học", sortable: true },
                        { key: "certs", label: "CC", sortable: false },
                        { key: "action", label: "", sortable: false },
                      ].map(col => (
                        <th key={col.key}
                          className={`text-left px-3 py-3 text-muted-foreground ${col.sortable ? "cursor-pointer hover:text-foreground" : ""}`}
                          style={{ fontSize: "11px", fontWeight: 500 }}
                          onClick={() => col.sortable && toggleSort(col.key as any)}>
                          <span className="flex items-center gap-1">
                            {col.label}
                            {col.sortable && sortField === col.key && (sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(emp => {
                      const role = roleLabels[emp.role];
                      const status = syncStatusMap[emp.id];
                      const initials = emp.name.split(" ").slice(-2).map(n => n[0]).join("");
                      return (
                        <tr key={emp.id} className={`border-b border-border/50 hover:bg-secondary/20 transition-colors cursor-pointer ${selectedItems.has(emp.id) ? "bg-[#990803]/5" : ""}`}
                          onClick={() => setSelectedEmployee(emp)}>
                          <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={selectedItems.has(emp.id)} onChange={() => toggleSelect(emp.id)}
                              className="w-3.5 h-3.5 rounded accent-[#990803] cursor-pointer" />
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#990803] to-[#b82020] text-white flex items-center justify-center shrink-0" style={{ fontSize: "10px", fontWeight: 600 }}>{initials}</div>
                              <div>
                                <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{emp.name}</p>
                                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{emp.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <p className="text-foreground" style={{ fontSize: "11px" }}>{emp.subsidiary.replace("Tập đoàn Geleximco", "VP Tập đoàn").replace("Ngân hàng TMCP An Bình (ABBank)", "ABBank").replace("BĐS Geleximco - ", "")}</p>
                            <p className="text-muted-foreground truncate max-w-[140px]" style={{ fontSize: "10px" }}>{emp.department}</p>
                          </td>
                          <td className="px-3 py-3">
                            <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 500, color: role.color, background: role.bg }}>{role.label}</span>
                          </td>
                          <td className="px-3 py-3"><SyncStatusBadge status={status} /></td>
                          <td className="px-3 py-3 text-center text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{emp.coursesCompleted}</td>
                          <td className="px-3 py-3 text-center text-muted-foreground" style={{ fontSize: "12px" }}>{emp.totalHours}h</td>
                          <td className="px-3 py-3 text-center text-foreground" style={{ fontSize: "12px" }}>{emp.certifications}</td>
                          <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                            <button className="p-1.5 hover:bg-secondary rounded-lg cursor-pointer" onClick={() => setSelectedEmployee(emp)}>
                              <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map(emp => {
                const initials = emp.name.split(" ").slice(-2).map(n => n[0]).join("");
                const role = roleLabels[emp.role];
                const status = syncStatusMap[emp.id];
                return (
                  <div key={emp.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEmployee(emp)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#990803] to-[#b82020] text-white flex items-center justify-center" style={{ fontSize: "13px", fontWeight: 600 }}>{initials}</div>
                      <SyncStatusBadge status={status} />
                    </div>
                    <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{emp.name}</h4>
                    <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>{emp.position}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 500, color: role.color, background: role.bg }}>{role.label}</span>
                    <div className="space-y-1 mt-2.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "11px" }}><Building2 className="w-3 h-3" /><span className="truncate">{emp.subsidiary.replace("Tập đoàn Geleximco", "VP TĐ").replace("Ngân hàng TMCP An Bình (ABBank)", "ABBank")}</span></div>
                      <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "11px" }}><Briefcase className="w-3 h-3" /><span className="truncate">{emp.department}</span></div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-2 text-center">
                      <div><p className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>{emp.coursesCompleted}</p><p className="text-muted-foreground" style={{ fontSize: "9px" }}>Khóa</p></div>
                      <div><p className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>{emp.totalHours}</p><p className="text-muted-foreground" style={{ fontSize: "9px" }}>Giờ</p></div>
                      <div><p className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>{emp.certifications}</p><p className="text-muted-foreground" style={{ fontSize: "9px" }}>CC</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {filtered.length === 0 && (
            <EmptyState
              variant="search"
              title="Không tìm thấy nhân sự"
              message={searchQuery ? `Không có kết quả cho "${searchQuery}". Thử thay đổi từ khóa hoặc bỏ bớt bộ lọc.` : "Không có nhân sự nào phù hợp với bộ lọc hiện tại."}
              action={{ label: "Xóa bộ lọc", onClick: () => { setSearchQuery(""); setSelectedDept("all"); setSelectedSub("all"); setSelectedRole("all"); setSyncStatusFilter("all"); } }}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Trang {page}/{totalPages} • {filtered.length} kết quả</p>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40 cursor-pointer" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="w-4 h-4" /></button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 5) p = i + 1;
                  else if (page <= 3) p = i + 1;
                  else if (page >= totalPages - 2) p = totalPages - 4 + i;
                  else p = page - 2 + i;
                  return <button key={p} className={`w-8 h-8 rounded-lg cursor-pointer ${p === page ? "bg-[#990803] text-white" : "hover:bg-secondary"}`} style={{ fontSize: "12px" }} onClick={() => setPage(p)}>{p}</button>;
                })}
                <button className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40 cursor-pointer" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== CHANGES ========== */}
      {activeTab === "changes" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={changeFilter.type} onChange={e => setChangeFilter(p => ({ ...p, type: e.target.value }))}
              className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "13px" }}>
              <option value="all">Tất cả loại thay đổi</option>
              <option value="added">Thêm mới</option>
              <option value="updated">Cập nhật</option>
              <option value="deactivated">Vô hiệu hóa</option>
              <option value="reactivated">Kích hoạt lại</option>
            </select>
            <select value={changeFilter.source} onChange={e => setChangeFilter(p => ({ ...p, source: e.target.value }))}
              className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "13px" }}>
              <option value="all">Tất cả nguồn</option>
              <option value="Geleximco HRM">Geleximco HRM</option>
              <option value="ABBank HCM">ABBank HCM</option>
              <option value="Active Directory">Active Directory</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredChanges.map(ch => {
              const typeConfig = {
                added: { icon: UserPlus, color: "#27ae60", bg: "bg-green-50", label: "Thêm mới" },
                updated: { icon: Edit3, color: "#2e86de", bg: "bg-blue-50", label: "Cập nhật" },
                deactivated: { icon: UserX, color: "#e74c3c", bg: "bg-red-50", label: "Vô hiệu" },
                reactivated: { icon: UserCheck, color: "#16a085", bg: "bg-teal-50", label: "Kích hoạt lại" },
              }[ch.changeType];
              return (
                <div key={ch.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl ${typeConfig.bg} flex items-center justify-center shrink-0`}>
                      <typeConfig.icon className="w-4 h-4" style={{ color: typeConfig.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{ch.employeeName}</span>
                        <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 500, color: typeConfig.color, background: `${typeConfig.color}10` }}>{typeConfig.label}</span>
                        <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{ch.timestamp}</span>
                      </div>
                      {ch.field && (
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{ch.field}:</span>
                          {ch.oldValue && <span className="px-1.5 py-0.5 bg-red-50 text-red-500 rounded line-through" style={{ fontSize: "11px" }}>{ch.oldValue}</span>}
                          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>→</span>
                          {ch.newValue && <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded" style={{ fontSize: "11px" }}>{ch.newValue}</span>}
                        </div>
                      )}
                      {ch.autoActions.length > 0 && (
                        <div className="mt-2 flex items-start gap-1.5">
                          <Zap className="w-3 h-3 text-[#c8a84e] mt-0.5 shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {ch.autoActions.map((a, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-[#c8a84e]/10 text-[#c8a84e] rounded" style={{ fontSize: "10px" }}>{a}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <p className="text-muted-foreground mt-1" style={{ fontSize: "10px" }}>Nguồn: {ch.source} • ID: {ch.employeeId}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========== LOGS ========== */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          {/* Log filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select value={logFilter.source} onChange={e => setLogFilter(p => ({ ...p, source: e.target.value }))}
              className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "13px" }}>
              <option value="all">Tất cả nguồn</option>
              <option value="Geleximco HRM">Geleximco HRM</option>
              <option value="ABBank HCM">ABBank HCM</option>
              <option value="Active Directory">Active Directory</option>
            </select>
            <select value={logFilter.type} onChange={e => setLogFilter(p => ({ ...p, type: e.target.value }))}
              className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "13px" }}>
              <option value="all">Tất cả loại</option>
              <option value="auto">Tự động</option>
              <option value="manual">Thủ công</option>
              <option value="webhook">Webhook</option>
            </select>
            <select value={logFilter.status} onChange={e => setLogFilter(p => ({ ...p, status: e.target.value }))}
              className="px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer" style={{ fontSize: "13px" }}>
              <option value="all">Tất cả trạng thái</option>
              <option value="success">Thành công</option>
              <option value="warning">Cảnh báo</option>
              <option value="error">Lỗi</option>
            </select>
            <p className="text-muted-foreground self-center ml-auto" style={{ fontSize: "12px" }}>{filteredLogs.length} bản ghi</p>
          </div>

          {/* Log summary */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Tổng sync", value: syncLogs.length, color: "#990803" },
              { label: "Thành công", value: syncLogs.filter(l => l.status === "success").length, color: "#27ae60" },
              { label: "Cảnh báo", value: syncLogs.filter(l => l.status === "warning").length, color: "#f39c12" },
              { label: "Lỗi", value: syncLogs.filter(l => l.status === "error").length, color: "#e74c3c" },
            ].map((s, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-3 text-center">
                <p style={{ fontSize: "20px", fontWeight: 700, color: s.color }}>{s.value}</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Log list */}
          <div className="space-y-2">
            {filteredLogs.map(log => {
              const totalAffected = log.stats.added + log.stats.updated + log.stats.deactivated;
              return (
                <div key={log.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setSelectedLog(log)}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${log.status === "success" ? "bg-green-50" : log.status === "warning" ? "bg-yellow-50" : "bg-red-50"}`}>
                      {log.status === "success" ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4" style={{ color: log.status === "warning" ? "#f39c12" : "#e74c3c" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{log.source}</span>
                        <span className={`px-2 py-0.5 rounded-full ${log.type === "auto" ? "bg-blue-50 text-blue-600" : log.type === "manual" ? "bg-purple-50 text-purple-600" : "bg-teal-50 text-teal-600"}`} style={{ fontSize: "10px", fontWeight: 500 }}>
                          {log.type === "auto" ? "Tự động" : log.type === "manual" ? "Thủ công" : "Webhook"}
                        </span>
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{log.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {log.stats.added > 0 && <span className="text-green-600" style={{ fontSize: "11px" }}>+{log.stats.added} thêm</span>}
                        {log.stats.updated > 0 && <span className="text-blue-600" style={{ fontSize: "11px" }}>{log.stats.updated} cập nhật</span>}
                        {log.stats.deactivated > 0 && <span className="text-orange-500" style={{ fontSize: "11px" }}>{log.stats.deactivated} vô hiệu</span>}
                        {log.stats.errors > 0 && <span className="text-red-500" style={{ fontSize: "11px" }}>{log.stats.errors} lỗi</span>}
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>• {log.duration}</span>
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>• {log.triggeredBy}</span>
                      </div>
                      {log.details && <p className="text-muted-foreground mt-1 truncate" style={{ fontSize: "11px" }}>{log.details}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========== CONNECTIONS ========== */}
      {activeTab === "connections" && (
        <div className="space-y-4">
          {hrConnections.map(conn => (
            <div key={conn.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${conn.status === "connected" ? "bg-green-50" : "bg-red-50"}`}>
                      {conn.status === "connected" ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
                    </div>
                    <div>
                      <h4 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>{conn.name}</h4>
                      <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{conn.type} • {conn.authMethod}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full ${conn.status === "connected" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`} style={{ fontSize: "11px", fontWeight: 500 }}>
                      {conn.status === "connected" ? "● Đã kết nối" : "○ Ngắt"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                  {[
                    { label: "Endpoint", value: conn.endpoint, span: true },
                    { label: "Tổng bản ghi", value: conn.totalRecords.toLocaleString() },
                    { label: "Trường mapped", value: `${conn.mappedFields}/8` },
                    { label: "Lần sync cuối", value: conn.lastSync },
                    { label: "Sync tiếp theo", value: conn.nextSync },
                    { label: "Tần suất", value: conn.syncFrequency },
                    { label: "Uptime", value: `${conn.uptime}%` },
                    { label: "TB thời lượng", value: conn.avgDuration },
                  ].map((f, i) => (
                    <div key={i} className={`p-2.5 bg-secondary/30 rounded-lg ${i === 0 ? "col-span-2 sm:col-span-3 lg:col-span-6" : ""}`}>
                      <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{f.label}</p>
                      <p className={`text-foreground ${i === 0 ? "truncate" : ""}`} style={{ fontSize: i === 0 ? "11px" : "12px", fontWeight: 600 }}>{f.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}
                    onClick={handleSync}><RefreshCw className="w-3.5 h-3.5" /> Đồng bộ ngay</button>
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}
                    onClick={() => setSelectedConn(conn)}><Settings className="w-3.5 h-3.5" /> Chi tiết & Quy tắc</button>
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}
                    onClick={() => toast.success(`Kết nối ${conn.name} hoạt động bình thường!`)}>
                    <Activity className="w-3.5 h-3.5" /> Test kết nối</button>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-[#990803]/5 border border-[#990803]/10 rounded-xl p-5">
            <h4 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Shield className="w-4 h-4 inline mr-1.5 text-[#990803]" />
              Nguyên tắc Đồng bộ Nhân sự
            </h4>
            <div className="space-y-2">
              {[
                "Dữ liệu đồng bộ MỘT CHIỀU từ HRM → LMS (chỉ đọc, không ghi ngược).",
                "LMS KHÔNG lưu trữ dữ liệu nhạy cảm (lương, CCCD, TKNH, địa chỉ nhà).",
                "Chỉ đồng bộ 8 trường cần thiết cho đào tạo: ID, Tên, Email, Đơn vị, Phòng ban, Chức vụ, Cấp bậc, Ngày vào.",
                "Mọi thay đổi nhân sự phải thực hiện trên HRM gốc, LMS tự động cập nhật theo lịch sync.",
                "Tài khoản LMS bị vô hiệu hóa tự động khi NS nghỉ việc trên HRM, lịch sử học tập được lưu trữ.",
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#990803] mt-0.5 shrink-0" />
                  <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{n}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== RULES ========== */}
      {activeTab === "rules" && (
        <div className="space-y-5">
          {/* Mapping table */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Layers className="w-4 h-4 inline mr-1.5 text-[#990803]" />
              Ánh xạ Trường Dữ liệu HRM → LMS
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Trường HRM</th>
                    <th className="text-center px-2 py-2.5 text-muted-foreground" style={{ fontSize: "11px" }}>→</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Trường LMS</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Kiểu</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Bắt buộc</th>
                    <th className="text-left px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Mục đích trong LMS</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { from: "employee_id", to: "user.id", type: "String", required: true, purpose: "Định danh duy nhất, khóa chính" },
                    { from: "full_name", to: "user.name", type: "String", required: true, purpose: "Hiển thị tên học viên trên LMS" },
                    { from: "work_email", to: "user.email", type: "Email", required: true, purpose: "Đăng nhập SSO, nhận thông báo đào tạo" },
                    { from: "department_name", to: "user.department", type: "String", required: true, purpose: "Phân nhóm học viên, ghi danh theo phòng ban" },
                    { from: "company_name", to: "user.subsidiary", type: "String", required: true, purpose: "Phân quyền nội dung theo đơn vị" },
                    { from: "position_title", to: "user.position", type: "String", required: false, purpose: "Gợi ý lộ trình đào tạo phù hợp" },
                    { from: "job_level", to: "user.role", type: "Enum", required: true, purpose: "Ánh xạ vai trò: admin/instructor/learner" },
                    { from: "hire_date", to: "user.joinDate", type: "Date", required: false, purpose: "Trigger Onboarding tự động khi mới vào" },
                  ].map((r, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/20">
                      <td className="px-4 py-2.5"><code className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded" style={{ fontSize: "11px" }}>{r.from}</code></td>
                      <td className="px-2 py-2.5 text-center text-muted-foreground">→</td>
                      <td className="px-4 py-2.5"><code className="px-1.5 py-0.5 bg-[#990803]/5 text-[#990803] rounded" style={{ fontSize: "11px" }}>{r.to}</code></td>
                      <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px" }}>{r.type}</td>
                      <td className="px-4 py-2.5">{r.required ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <span className="text-muted-foreground" style={{ fontSize: "11px" }}>—</span>}</td>
                      <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px" }}>{r.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role mapping rules */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Shield className="w-4 h-4 inline mr-1.5 text-[#990803]" />
              Quy tắc Ánh xạ Vai trò (job_level → LMS Role)
            </h3>
            <div className="space-y-2">
              {[
                { level: "C-Level, Director, VP", role: "admin", label: "Quản trị viên", color: "#e74c3c", desc: "Toàn quyền quản trị hệ thống LMS" },
                { level: "Manager, Trưởng phòng, Phó phòng", role: "manager", label: "Quản lý", color: "#990803", desc: "Xem báo cáo đào tạo phòng ban, phê duyệt đăng ký" },
                { level: "Chuyên gia, Giảng viên nội bộ", role: "instructor", label: "Giảng viên", color: "#c8a84e", desc: "Tạo/quản lý khóa học, chấm điểm, tạo đề thi" },
                { level: "Nhân viên, Chuyên viên, Thực tập", role: "learner", label: "Học viên", color: "#2e86de", desc: "Học tập, làm bài kiểm tra, nhận chứng chỉ" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-xl">
                  <div className="flex-1">
                    <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{r.level}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="px-2.5 py-1 rounded-full shrink-0" style={{ fontSize: "11px", fontWeight: 600, color: r.color, background: `${r.color}10` }}>{r.label}</span>
                  <p className="text-muted-foreground flex-1 hidden lg:block" style={{ fontSize: "11px" }}>{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sync rules per connection */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Settings className="w-4 h-4 inline mr-1.5 text-[#990803]" />
              Quy tắc Tự động theo Nguồn Kết nối
            </h3>
            <div className="space-y-4">
              {hrConnections.map(conn => (
                <div key={conn.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-[#990803]" />
                    <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{conn.name}</h4>
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>({conn.type})</span>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    {conn.syncRules.map((rule, i) => {
                      const enabled = connRules[conn.id]?.[rule.name] ?? rule.enabled;
                      return (
                        <div key={i} className="flex items-center gap-3 p-2.5 bg-secondary/20 rounded-lg">
                          <button
                            onClick={() => setConnRules(prev => ({ ...prev, [conn.id]: { ...prev[conn.id], [rule.name]: !enabled } }))}
                            className={`w-9 h-5 rounded-full transition-colors cursor-pointer ${enabled ? "bg-[#990803]" : "bg-gray-300"}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
                          </button>
                          <div className="flex-1">
                            <p className={`${enabled ? "text-foreground" : "text-muted-foreground"}`} style={{ fontSize: "12px", fontWeight: 500 }}>{rule.name}</p>
                            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{rule.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conflict resolution */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
              <AlertTriangle className="w-4 h-4 inline mr-1.5 text-[#f39c12]" />
              Xử lý Xung đột Dữ liệu
            </h3>
            <div className="space-y-2">
              {[
                { scenario: "Trùng email giữa 2 nguồn", resolution: "Ưu tiên nguồn có hire_date mới nhất, log cảnh báo cho Admin", priority: "Cao" },
                { scenario: "Trùng employee_id", resolution: "Merge dữ liệu, ưu tiên nguồn chính (Geleximco HRM)", priority: "Cao" },
                { scenario: "Phòng ban không tồn tại trên LMS", resolution: "Tạo mới phòng ban, thông báo Admin review", priority: "Trung bình" },
                { scenario: "Email không hợp lệ", resolution: "Skip bản ghi, log lỗi, gửi thông báo cho HR", priority: "Thấp" },
                { scenario: "Đơn vị không tồn tại", resolution: "Map vào 'Chưa phân loại', thông báo Admin", priority: "Trung bình" },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-secondary/20 rounded-lg">
                  <span className={`px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${c.priority === "Cao" ? "bg-red-50 text-red-500" : c.priority === "Trung bình" ? "bg-yellow-50 text-yellow-600" : "bg-blue-50 text-blue-600"}`} style={{ fontSize: "9px", fontWeight: 600 }}>{c.priority}</span>
                  <div>
                    <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{c.scenario}</p>
                    <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>{c.resolution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== DETAIL MODAL: Employee ========== */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedEmployee(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#990803] to-[#b82020] p-5 text-white relative shrink-0">
              <button className="absolute top-4 right-4 p-1 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer" onClick={() => setSelectedEmployee(null)}><X className="w-4 h-4 text-white" /></button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#c8a84e] flex items-center justify-center text-[#3a1200] shadow-lg" style={{ fontSize: "18px", fontWeight: 700 }}>
                  {selectedEmployee.name.split(" ").slice(-2).map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{selectedEmployee.name}</h3>
                  <p className="text-white/70" style={{ fontSize: "13px" }}>{selectedEmployee.position}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-white/20" style={{ fontSize: "10px", fontWeight: 500 }}>{roleLabels[selectedEmployee.role].label}</span>
                    <SyncStatusBadge status={syncStatusMap[selectedEmployee.id]} />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon: BookOpen, value: selectedEmployee.coursesCompleted, label: "Khóa học", color: "#990803" },
                  { icon: Clock, value: selectedEmployee.totalHours, label: "Giờ học", color: "#c8a84e" },
                  { icon: Award, value: selectedEmployee.certifications, label: "Chứng chỉ", color: "#27ae60" },
                ].map((s, i) => (
                  <div key={i} className="p-3 bg-secondary/50 rounded-xl">
                    <s.icon className="w-4 h-4 mx-auto" style={{ color: s.color }} />
                    <p className="text-foreground mt-1" style={{ fontSize: "20px", fontWeight: 700 }}>{s.value}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-foreground mb-2 flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
                  <RefreshCw className="w-3.5 h-3.5 text-[#990803]" /> Thông tin Đồng bộ từ HRM
                </h4>
                {[
                  { icon: Mail, label: "Email", value: selectedEmployee.email },
                  { icon: Building2, label: "Đơn vị", value: selectedEmployee.subsidiary },
                  { icon: Briefcase, label: "Phòng ban", value: selectedEmployee.department },
                  { icon: Calendar, label: "Ngày gia nhập", value: selectedEmployee.joinDate },
                  { icon: FileText, label: "Mã NS (HRM)", value: selectedEmployee.id },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: "12px" }}><item.icon className="w-3.5 h-3.5" /> {item.label}</span>
                    <span className="text-foreground text-right max-w-[55%] truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Sync history for this employee */}
              <div>
                <h4 className="text-foreground mb-2 flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
                  <History className="w-3.5 h-3.5 text-[#990803]" /> Lịch sử Thay đổi
                </h4>
                <div className="space-y-2">
                  {[
                    { time: "11/03/2026 08:30", action: "Đồng bộ thành công", detail: "Không có thay đổi", status: "success" as const },
                    { time: "08/03/2026 14:00", action: "Cập nhật chức vụ", detail: `${selectedEmployee.position}`, status: "success" as const },
                    { time: selectedEmployee.joinDate, action: "Tạo tài khoản LMS", detail: "Auto-create từ HRM + Ghi danh Onboarding", status: "success" as const },
                  ].map((h, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-secondary/30 rounded-lg">
                      <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>{h.action}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{h.detail} • {h.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-secondary/30 rounded-xl p-3.5">
                <p className="text-muted-foreground mb-1" style={{ fontSize: "10px", fontWeight: 500 }}>NGUỒN DỮ LIỆU</p>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#990803]" />
                  <div>
                    <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>Geleximco HRM → LMS</p>
                    <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Sync lần cuối: {lastSyncTime} • Dữ liệu chỉ đọc</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t border-border shrink-0">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#990803] text-white rounded-xl hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }} onClick={handleSync}>
                <RefreshCw className="w-3.5 h-3.5" /> Đồng bộ lại
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}
                onClick={() => toast.info(`Đang mở hồ sơ ${selectedEmployee?.name} trên hệ thống HRM...`)}>
                <ExternalLink className="w-3.5 h-3.5" /> Xem trên HRM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== DETAIL MODAL: Log ========== */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <div>
                <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>Chi tiết Lần Đồng bộ</h3>
                <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{selectedLog.timestamp} • {selectedLog.source}</p>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer" onClick={() => setSelectedLog(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center gap-3">
                {selectedLog.status === "success" ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <AlertTriangle className="w-6 h-6" style={{ color: selectedLog.status === "warning" ? "#f39c12" : "#e74c3c" }} />}
                <div>
                  <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>{selectedLog.status === "success" ? "Thành công" : selectedLog.status === "warning" ? "Hoàn thành với cảnh báo" : "Lỗi"}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Thời lượng: {selectedLog.duration} • {selectedLog.triggeredBy}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Thêm mới", value: selectedLog.stats.added, color: "#27ae60", icon: UserPlus },
                  { label: "Cập nhật", value: selectedLog.stats.updated, color: "#2e86de", icon: Edit3 },
                  { label: "Vô hiệu", value: selectedLog.stats.deactivated, color: "#e67e22", icon: UserX },
                  { label: "Lỗi", value: selectedLog.stats.errors, color: "#e74c3c", icon: AlertTriangle },
                ].map((s, i) => (
                  <div key={i} className="p-3 bg-secondary/30 rounded-xl text-center">
                    <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
                    <p style={{ fontSize: "20px", fontWeight: 700, color: s.value > 0 ? s.color : undefined }} className={s.value === 0 ? "text-muted-foreground" : ""}>{s.value}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-secondary/30 rounded-xl text-center">
                <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{selectedLog.stats.unchanged.toLocaleString()}</p>
                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Bản ghi không thay đổi</p>
              </div>

              {selectedLog.details && (
                <div className="bg-secondary/20 rounded-xl p-4 border-l-3 border-[#990803]">
                  <p className="text-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>Chi tiết</p>
                  <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{selectedLog.details}</p>
                </div>
              )}

              <div className="space-y-2">
                {[
                  { label: "Nguồn", value: selectedLog.source },
                  { label: "Loại", value: selectedLog.type === "auto" ? "Tự động (Scheduled)" : selectedLog.type === "manual" ? "Thủ công (Manual)" : "Webhook (Event-driven)" },
                  { label: "Thời gian bắt đầu", value: selectedLog.timestamp },
                  { label: "Thời lượng", value: selectedLog.duration },
                  { label: "Thực hiện bởi", value: selectedLog.triggeredBy },
                  { label: "Tổng bản ghi xử lý", value: (selectedLog.stats.added + selectedLog.stats.updated + selectedLog.stats.deactivated + selectedLog.stats.unchanged + selectedLog.stats.errors).toLocaleString() },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{r.label}</span>
                    <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t border-border shrink-0">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}
                onClick={() => setSelectedLog(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== DETAIL MODAL: Connection ========== */}
      {selectedConn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedConn(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>{selectedConn.name}</h3>
                  <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{selectedConn.type} • {selectedConn.authMethod}</p>
                </div>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer" onClick={() => setSelectedConn(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Endpoint", value: selectedConn.endpoint },
                  { label: "Xác thực", value: selectedConn.authMethod },
                  { label: "Tổng bản ghi", value: selectedConn.totalRecords.toLocaleString() },
                  { label: "Trường mapped", value: `${selectedConn.mappedFields}/8` },
                  { label: "Uptime", value: `${selectedConn.uptime}%` },
                  { label: "TB thời lượng", value: selectedConn.avgDuration },
                  { label: "Sync cuối", value: selectedConn.lastSync },
                  { label: "Sync tiếp", value: selectedConn.nextSync },
                ].map((f, i) => (
                  <div key={i} className="p-2.5 bg-secondary/30 rounded-lg">
                    <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{f.label}</p>
                    <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{f.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Quy tắc Đồng bộ</h4>
                <div className="space-y-1.5">
                  {selectedConn.syncRules.map((rule, i) => {
                    const enabled = connRules[selectedConn.id]?.[rule.name] ?? rule.enabled;
                    return (
                      <div key={i} className="flex items-center gap-3 p-2.5 bg-secondary/20 rounded-lg">
                        <button onClick={() => setConnRules(prev => ({ ...prev, [selectedConn.id]: { ...prev[selectedConn.id], [rule.name]: !enabled } }))}
                          className={`w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${enabled ? "bg-[#990803]" : "bg-gray-300"}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
                        </button>
                        <div className="flex-1">
                          <p className={enabled ? "text-foreground" : "text-muted-foreground"} style={{ fontSize: "12px", fontWeight: 500 }}>{rule.name}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{rule.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t border-border shrink-0">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#990803] text-white rounded-xl hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}
                onClick={handleSync}>
                <RefreshCw className="w-3.5 h-3.5" /> Đồng bộ ngay
              </button>
              <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-secondary text-foreground rounded-xl cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}
                onClick={() => setSelectedConn(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
