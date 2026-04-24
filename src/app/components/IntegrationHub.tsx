import { useState } from "react";
import {
  Plug, Search, CheckCircle, XCircle, AlertTriangle, Clock,
  RefreshCw, Settings, Activity, Database, Server, Globe,
  Shield, Zap, ArrowRightLeft, Eye, Edit, Plus,
  Cloud, Lock, Key, Link2, Unlink, BarChart3,
  Upload, Download, TrendingUp, Wifi, WifiOff,
  Building2, Users, BookOpen, Award, Calendar,
  FileText, Mail, Bell, GitBranch, Layers,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface Integration {
  id: string;
  name: string;
  description: string;
  category: "hr" | "erp" | "auth" | "communication" | "storage" | "analytics" | "other";
  icon: string;
  status: "connected" | "disconnected" | "error" | "syncing";
  lastSync: string;
  recordsSynced: number;
  frequency: string;
  apiVersion: string;
  healthScore: number;
  config: { key: string; value: string; sensitive?: boolean }[];
  logs: SyncLog[];
}

interface SyncLog {
  id: string;
  timestamp: string;
  action: string;
  status: "success" | "error" | "warning";
  records: number;
  duration: string;
  details: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: "active" | "inactive";
  lastTriggered: string;
  successRate: number;
}

// ─── Mock Data ───
const INTEGRATIONS: Integration[] = [
  {
    id: "INT01", name: "SAP SuccessFactors (HCM)",
    description: "Đồng bộ nhân sự, tổ chức, lương bổng từ SAP SF. Nguồn dữ liệu chính cho 6,610 nhân sự toàn tập đoàn.",
    category: "hr", icon: "🏢", status: "connected", lastSync: "12/03/2026 09:15",
    recordsSynced: 6610, frequency: "Mỗi 6 giờ", apiVersion: "v2.0", healthScore: 98,
    config: [
      { key: "API Endpoint", value: "https://api.sf.geleximco.vn/odata/v2" },
      { key: "Company ID", value: "GELEXIMCO_PROD" },
      { key: "API Key", value: "sk-***************4f2a", sensitive: true },
      { key: "Sync Mode", value: "Incremental" },
    ],
    logs: [
      { id: "L01", timestamp: "12/03/2026 09:15:33", action: "Full Sync", status: "success", records: 6610, duration: "4m 12s", details: "Đồng bộ thành công. Mới: 12, Cập nhật: 45, Nghỉ việc: 3." },
      { id: "L02", timestamp: "12/03/2026 03:15:10", action: "Incremental Sync", status: "success", records: 58, duration: "0m 45s", details: "58 bản ghi cập nhật." },
      { id: "L03", timestamp: "11/03/2026 21:15:05", action: "Incremental Sync", status: "warning", records: 42, duration: "1m 22s", details: "42 bản ghi. 2 trùng email bị skip." },
    ],
  },
  {
    id: "INT02", name: "Microsoft Azure AD (SSO)",
    description: "Single Sign-On qua Azure AD, đồng bộ danh tính và nhóm bảo mật cho toàn bộ user LMS.",
    category: "auth", icon: "🔐", status: "connected", lastSync: "12/03/2026 09:00",
    recordsSynced: 6610, frequency: "Real-time", apiVersion: "v1.0", healthScore: 100,
    config: [
      { key: "Tenant ID", value: "geleximco.onmicrosoft.com" },
      { key: "Client ID", value: "abc-***-def", sensitive: true },
      { key: "Protocol", value: "SAML 2.0 + OIDC" },
      { key: "MFA", value: "Enabled (Conditional)" },
    ],
    logs: [
      { id: "L04", timestamp: "12/03/2026 09:00:00", action: "Token Refresh", status: "success", records: 1, duration: "0m 01s", details: "SAML token renewed." },
      { id: "L05", timestamp: "12/03/2026 08:45:10", action: "User Login", status: "success", records: 45, duration: "—", details: "45 logins qua SSO trong 1 giờ." },
    ],
  },
  {
    id: "INT03", name: "SAP ERP (Tài chính)",
    description: "Kết nối SAP ERP để đồng bộ ngân sách đào tạo, cost center, PO cho module Budget.",
    category: "erp", icon: "💰", status: "connected", lastSync: "12/03/2026 06:00",
    recordsSynced: 340, frequency: "Hàng ngày 06:00", apiVersion: "RFC/BAPI", healthScore: 92,
    config: [
      { key: "SAP Host", value: "sap-prod.geleximco.vn:8443" },
      { key: "Client", value: "100" },
      { key: "User", value: "LMS_INTEGRATION", sensitive: true },
      { key: "Cost Centers", value: "14 đơn vị × 34 phòng ban" },
    ],
    logs: [
      { id: "L06", timestamp: "12/03/2026 06:00:45", action: "Budget Sync", status: "success", records: 340, duration: "2m 30s", details: "340 cost center records synced. Budget Q1: 8.5 tỷ VNĐ." },
      { id: "L07", timestamp: "11/03/2026 06:00:30", action: "Budget Sync", status: "success", records: 340, duration: "2m 28s", details: "Sync bình thường." },
    ],
  },
  {
    id: "INT04", name: "Microsoft Teams",
    description: "Tích hợp Teams để tự động tạo kênh lớp học, gửi thông báo, và lên lịch meeting.",
    category: "communication", icon: "💬", status: "connected", lastSync: "12/03/2026 09:30",
    recordsSynced: 156, frequency: "Event-driven", apiVersion: "Graph API v1.0", healthScore: 95,
    config: [
      { key: "App ID", value: "teams-lms-***", sensitive: true },
      { key: "Channels Created", value: "156 kênh lớp học" },
      { key: "Bot Name", value: "GelBot LMS" },
      { key: "Notifications", value: "Enabled" },
    ],
    logs: [
      { id: "L08", timestamp: "12/03/2026 09:30:12", action: "Create Channel", status: "success", records: 2, duration: "0m 05s", details: "Tạo 2 kênh mới cho khóa 'Lãnh đạo 4.0 - Lớp C' và 'Excel VBA - Lớp D'." },
    ],
  },
  {
    id: "INT05", name: "AWS S3 (Storage)",
    description: "Lưu trữ file đào tạo, video bài giảng, chứng chỉ PDF trên Amazon S3.",
    category: "storage", icon: "☁️", status: "connected", lastSync: "12/03/2026 09:45",
    recordsSynced: 12450, frequency: "Real-time", apiVersion: "S3 API", healthScore: 100,
    config: [
      { key: "Bucket", value: "geleximco-lms-prod" },
      { key: "Region", value: "ap-southeast-1 (Singapore)" },
      { key: "Total Files", value: "12,450" },
      { key: "Total Size", value: "2.3 TB" },
    ],
    logs: [
      { id: "L09", timestamp: "12/03/2026 09:45:22", action: "Upload", status: "success", records: 5, duration: "0m 12s", details: "5 files uploaded (3 videos, 2 PDFs). Total: 450 MB." },
    ],
  },
  {
    id: "INT06", name: "Google Analytics 4",
    description: "Tracking hành vi học tập: page views, time-on-page, conversion funnels, engagement.",
    category: "analytics", icon: "📊", status: "disconnected", lastSync: "10/03/2026 23:59",
    recordsSynced: 0, frequency: "—", apiVersion: "GA4 Data API", healthScore: 0,
    config: [
      { key: "Property ID", value: "G-XXXXXXXXXX" },
      { key: "Status", value: "Credential expired" },
    ],
    logs: [
      { id: "L10", timestamp: "10/03/2026 23:59:00", action: "Data Pull", status: "error", records: 0, duration: "0m 02s", details: "ERROR: OAuth token expired. Cần re-authenticate." },
    ],
  },
  {
    id: "INT07", name: "Zoom (Virtual Classroom)",
    description: "Tích hợp Zoom để tạo phòng học ảo, recording tự động, và attendance tracking.",
    category: "communication", icon: "📹", status: "error", lastSync: "11/03/2026 14:00",
    recordsSynced: 0, frequency: "Event-driven", apiVersion: "Zoom API v2", healthScore: 35,
    config: [
      { key: "Account ID", value: "geleximco-edu", sensitive: true },
      { key: "Error", value: "Rate limit exceeded (429)" },
    ],
    logs: [
      { id: "L11", timestamp: "11/03/2026 14:00:10", action: "Create Meeting", status: "error", records: 0, duration: "0m 01s", details: "429 Too Many Requests. Rate limit: 100 req/day exceeded." },
      { id: "L12", timestamp: "11/03/2026 13:55:05", action: "Create Meeting", status: "success", records: 1, duration: "0m 03s", details: "Meeting created for 'Leadership Workshop Session 5'." },
    ],
  },
  {
    id: "INT08", name: "SMTP Email (Geleximco)",
    description: "Gửi email thông báo, nhắc nhở deadline, chứng chỉ qua SMTP nội bộ.",
    category: "communication", icon: "📧", status: "connected", lastSync: "12/03/2026 09:50",
    recordsSynced: 450, frequency: "Event-driven", apiVersion: "SMTP/TLS", healthScore: 88,
    config: [
      { key: "SMTP Host", value: "smtp.geleximco.vn:587" },
      { key: "Auth", value: "TLS + OAuth2" },
      { key: "From", value: "lms@geleximco.vn" },
      { key: "Daily Limit", value: "5,000 emails/day" },
    ],
    logs: [
      { id: "L13", timestamp: "12/03/2026 09:50:10", action: "Send Batch", status: "success", records: 45, duration: "0m 08s", details: "45 emails: 30 deadline reminders, 10 cert notifications, 5 welcome." },
    ],
  },
];

const WEBHOOKS: Webhook[] = [
  { id: "WH01", name: "Hoàn thành Khóa học → SAP SF", url: "https://api.sf.geleximco.vn/webhook/course-complete", events: ["course.completed", "cert.issued"], status: "active", lastTriggered: "12/03/2026 09:20", successRate: 99.2 },
  { id: "WH02", name: "Nhân sự mới → Auto-enroll", url: "https://lms.geleximco.vn/api/webhook/new-employee", events: ["employee.created", "employee.transferred"], status: "active", lastTriggered: "12/03/2026 08:30", successRate: 100 },
  { id: "WH03", name: "Deadline alert → Teams", url: "https://teams.webhook.office.com/v1/geleximco/...", events: ["deadline.approaching", "deadline.overdue"], status: "active", lastTriggered: "12/03/2026 07:00", successRate: 97.5 },
  { id: "WH04", name: "Exam completed → Grade sync", url: "https://lms.geleximco.vn/api/webhook/exam-grade", events: ["exam.submitted", "exam.graded"], status: "inactive", lastTriggered: "10/03/2026 15:00", successRate: 95.0 },
];

const CAT_CONFIG = {
  hr: { label: "HRIS / HR", color: "#990803" },
  erp: { label: "ERP", color: "#c8a84e" },
  auth: { label: "Xác thực", color: "#7c3aed" },
  communication: { label: "Giao tiếp", color: "#2563eb" },
  storage: { label: "Lưu trữ", color: "#0d9488" },
  analytics: { label: "Analytics", color: "#ea580c" },
  other: { label: "Khác", color: "#6b7280" },
};

const STATUS_CONFIG = {
  connected: { label: "Đã kết nối", color: "#16a34a", bg: "#16a34a10", icon: CheckCircle },
  disconnected: { label: "Ngắt kết nối", color: "#6b7280", bg: "#6b728010", icon: WifiOff },
  error: { label: "Lỗi", color: "#ef4444", bg: "#ef444410", icon: XCircle },
  syncing: { label: "Đang đồng bộ", color: "#2563eb", bg: "#2563eb10", icon: RefreshCw },
};

export function IntegrationHub() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"integrations" | "webhooks" | "api-keys" | "health">("integrations");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [selectedInt, setSelectedInt] = useState<Integration | null>(null);

  const connected = INTEGRATIONS.filter(i => i.status === "connected").length;
  const errors = INTEGRATIONS.filter(i => i.status === "error").length;
  const avgHealth = Math.round(INTEGRATIONS.filter(i => i.status === "connected").reduce((s, i) => s + i.healthScore, 0) / Math.max(connected, 1));
  const totalRecords = INTEGRATIONS.reduce((s, i) => s + i.recordsSynced, 0);

  const filtered = INTEGRATIONS.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== "all" && i.category !== filterCat) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Plug className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Trung tâm Tích hợp</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Quản lý kết nối SAP, Azure AD, Teams, AWS và các hệ thống bên ngoài
          </p>
        </div>
        <button onClick={() => { import("sonner").then(m => m.toast.info("Mở form thêm kết nối mới...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
          <Plus className="w-4 h-4" /> Thêm Kết nối
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Tổng kết nối", value: INTEGRATIONS.length, icon: Plug, color: "#990803" },
          { label: "Đang hoạt động", value: connected, icon: CheckCircle, color: "#16a34a" },
          { label: "Lỗi", value: errors, icon: XCircle, color: "#ef4444" },
          { label: "Health TB", value: `${avgHealth}%`, icon: Activity, color: "#c8a84e" },
          { label: "Records đồng bộ", value: totalRecords.toLocaleString(), icon: Database, color: "#2563eb" },
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

      {/* Error Banner */}
      {errors > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-100 p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-600" style={{ fontSize: "12px", fontWeight: 600 }}>{errors} kết nối gặp lỗi cần xử lý</p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {INTEGRATIONS.filter(i => i.status === "error" || i.status === "disconnected").map(i => (
                <span key={i.id} onClick={() => setSelectedInt(i)} className="px-2 py-0.5 bg-white border border-red-200 text-red-600 rounded cursor-pointer hover:bg-red-100" style={{ fontSize: "10px" }}>
                  {i.icon} {i.name.split(" (")[0]}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200">
        {[
          { id: "integrations" as const, label: "Kết nối", icon: Plug },
          { id: "webhooks" as const, label: "Webhooks", icon: GitBranch, count: WEBHOOKS.filter(w => w.status === "active").length },
          { id: "api-keys" as const, label: "API Keys", icon: Key },
          { id: "health" as const, label: "Health Monitor", icon: Activity },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
            {"count" in t && t.count ? <span className="px-1.5 py-0.5 bg-[#16a34a]/10 text-[#16a34a] rounded-full" style={{ fontSize: "10px" }}>{t.count}</span> : null}
          </button>
        ))}
      </div>

      {tab === "integrations" && (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kết nối..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả loại</option>
              {Object.entries(CAT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map(int => {
              const stCfg = STATUS_CONFIG[int.status];
              const catCfg = CAT_CONFIG[int.category];
              const StIcon = stCfg.icon;
              return (
                <div key={int.id} onClick={() => setSelectedInt(int)} className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <span style={{ fontSize: "28px" }}>{int.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: catCfg.color, backgroundColor: catCfg.color + "10" }}>{catCfg.label}</span>
                        <span className="px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>
                          <StIcon className="w-2.5 h-2.5" /> {stCfg.label}
                        </span>
                      </div>
                      <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{int.name}</h4>
                      <p className="text-gray-400 mt-0.5 line-clamp-1" style={{ fontSize: "11px" }}>{int.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-gray-400" style={{ fontSize: "10px" }}>
                        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {int.lastSync}</span>
                        <span className="flex items-center gap-0.5"><Database className="w-2.5 h-2.5" /> {int.recordsSynced.toLocaleString()}</span>
                        <span className="flex items-center gap-0.5"><RefreshCw className="w-2.5 h-2.5" /> {int.frequency}</span>
                      </div>
                    </div>
                    {/* Health bar */}
                    {int.status === "connected" && (
                      <div className="shrink-0 text-center">
                        <HealthMini value={int.healthScore} />
                        <p className="text-gray-300 mt-0.5" style={{ fontSize: "8px" }}>Health</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "webhooks" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-500" style={{ fontSize: "12px" }}>Webhooks tự động kích hoạt khi có sự kiện</p>
            <button onClick={() => { import("sonner").then(m => m.toast.info("Mở form tạo Webhook mới...")); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#990803] text-white rounded-lg cursor-pointer" style={{ fontSize: "11px" }}>
              <Plus className="w-3 h-3" /> Tạo Webhook
            </button>
          </div>
          {WEBHOOKS.map(wh => (
            <div key={wh.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${wh.status === "active" ? "bg-green-500" : "bg-gray-300"}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{wh.name}</h4>
                  <p className="text-gray-400 mt-0.5 truncate font-mono" style={{ fontSize: "10px" }}>{wh.url}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {wh.events.map(e => <span key={e} className="px-1.5 py-0.5 bg-[#990803]/5 text-[#990803] rounded" style={{ fontSize: "8px" }}>{e}</span>)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`${wh.status === "active" ? "text-green-600" : "text-gray-400"}`} style={{ fontSize: "11px", fontWeight: 600 }}>
                    {wh.status === "active" ? "Active" : "Inactive"}
                  </p>
                  <p className="text-gray-300 mt-0.5" style={{ fontSize: "9px" }}>Success: {wh.successRate}%</p>
                  <p className="text-gray-300" style={{ fontSize: "9px" }}>Last: {wh.lastTriggered}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "api-keys" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-gray-500" style={{ fontSize: "12px" }}>API Keys cho tích hợp bên thứ ba</p>
            <button onClick={() => { import("sonner").then(m => m.toast.info("Mở form tạo API Key mới...")); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#990803] text-white rounded-lg cursor-pointer" style={{ fontSize: "11px" }}>
              <Plus className="w-3 h-3" /> Tạo API Key
            </button>
          </div>
          {[
            { name: "LMS Public API", key: "pk_live_gel_*****8f2a", created: "01/01/2026", lastUsed: "12/03/2026 09:50", requests: "12,450/day", status: "active" },
            { name: "Mobile App API", key: "pk_live_mob_*****3d1c", created: "15/02/2026", lastUsed: "12/03/2026 09:45", requests: "3,200/day", status: "active" },
            { name: "Report Export API", key: "pk_live_rpt_*****7e9b", created: "01/03/2026", lastUsed: "11/03/2026 17:30", requests: "450/day", status: "active" },
            { name: "Test API Key", key: "pk_test_*****0000", created: "10/03/2026", lastUsed: "—", requests: "0/day", status: "inactive" },
          ].map((apiKey, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#990803]/10 flex items-center justify-center">
                <Key className="w-4 h-4 text-[#990803]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{apiKey.name}</h4>
                  <span className={`px-1.5 py-0.5 rounded ${apiKey.status === "active" ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`} style={{ fontSize: "9px", fontWeight: 600 }}>
                    {apiKey.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-gray-400 font-mono mt-0.5" style={{ fontSize: "11px" }}>{apiKey.key}</p>
              </div>
              <div className="text-right shrink-0 text-gray-400" style={{ fontSize: "10px" }}>
                <p>Requests: {apiKey.requests}</p>
                <p>Last: {apiKey.lastUsed}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "health" && <HealthMonitor integrations={INTEGRATIONS} />}

      {/* Detail Modal */}
      {selectedInt && <IntegrationDetailModal integration={selectedInt} onClose={() => setSelectedInt(null)} />}
    </div>
  );
}

// ─── Health Mini Circle ───
function HealthMini({ value }: { value: number }) {
  const R = 16, C = Math.PI * 2 * R;
  const offset = C - (value / 100) * C;
  const color = value >= 90 ? "#16a34a" : value >= 70 ? "#ea580c" : "#ef4444";
  return (
    <div className="relative w-10 h-10">
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r={R} fill="none" stroke="#f3f4f6" strokeWidth="3" />
        <circle cx="20" cy="20" r={R} fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${C}`} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 20 20)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span style={{ fontSize: "10px", fontWeight: 700, color }}>{value}</span>
      </div>
    </div>
  );
}

// ─── Health Monitor Tab ───
function HealthMonitor({ integrations }: { integrations: Integration[] }) {
  const connected = integrations.filter(i => i.status === "connected");

  // Uptime data (mock last 30 days)
  const uptimeData = Array(30).fill(0).map((_, i) => ({ day: i + 1, uptime: 95 + Math.random() * 5 }));

  return (
    <div className="space-y-3">
      {/* Overall Health */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>System Health Overview</h3>
        <svg width="100%" height="120" viewBox="0 0 600 120" preserveAspectRatio="xMidYMid meet">
          {integrations.map((int, i) => {
            const x = 30 + i * 70;
            const y = 20;
            const color = int.status === "connected" ? (int.healthScore >= 90 ? "#16a34a" : "#ea580c") : int.status === "error" ? "#ef4444" : "#6b7280";
            const barH = int.status === "connected" ? (int.healthScore / 100) * 70 : 5;
            return (
              <g key={int.id}>
                <rect x={x} y={y + 70 - barH} width="50" height={barH} rx="4" fill={color} opacity="0.8" />
                <text x={x + 25} y={y + 70 - barH - 5} textAnchor="middle" fill={color} style={{ fontSize: "9px", fontWeight: 700 }}>{int.status === "connected" ? `${int.healthScore}%` : "—"}</text>
                <text x={x + 25} y={y + 82} textAnchor="middle" fill="#6b7280" style={{ fontSize: "7px" }}>{int.icon}</text>
                <text x={x + 25} y={y + 95} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "6px" }}>{int.name.split(" ")[0]}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Uptime Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Uptime 30 Ngày (Tổng hệ thống)</h3>
        <svg width="100%" height="60" viewBox="0 0 600 60" preserveAspectRatio="xMidYMid meet">
          {uptimeData.map((d, i) => {
            const x = 10 + i * 19.3;
            const color = d.uptime >= 99 ? "#16a34a" : d.uptime >= 97 ? "#ea580c" : "#ef4444";
            return (
              <g key={i}>
                <rect x={x} y={5} width="16" height="35" rx="2" fill={color} opacity={0.3 + (d.uptime - 95) * 0.14} />
                {i % 5 === 0 && <text x={x + 8} y={52} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "7px" }}>{d.day}</text>}
              </g>
            );
          })}
        </svg>
        <div className="flex items-center gap-4 mt-2 text-gray-400" style={{ fontSize: "9px" }}>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full" /> 99%+</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-500 rounded-full" /> 97-99%</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full" /> &lt;97%</span>
          <span className="ml-auto">Uptime TB: 99.4%</span>
        </div>
      </div>

      {/* Per-service status */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Chi tiết Dịch vụ</h3>
        <div className="space-y-1.5">
          {integrations.map(int => {
            const stCfg = STATUS_CONFIG[int.status];
            return (
              <div key={int.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <span style={{ fontSize: "16px" }}>{int.icon}</span>
                <span className="flex-1 text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{int.name}</span>
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                {int.status === "connected" && (
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${int.healthScore}%`, backgroundColor: int.healthScore >= 90 ? "#16a34a" : "#ea580c" }} />
                    </div>
                    <span className="text-gray-500 w-8 text-right" style={{ fontSize: "10px", fontWeight: 600 }}>{int.healthScore}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Integration Detail Modal ───
function IntegrationDetailModal({ integration: int, onClose }: { integration: Integration; onClose: () => void }) {
  const stCfg = STATUS_CONFIG[int.status];
  const catCfg = CAT_CONFIG[int.category];
  const [detailTab, setDetailTab] = useState<"config" | "logs">("config");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <span style={{ fontSize: "32px" }}>{int.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: catCfg.color, backgroundColor: catCfg.color + "10" }}>{catCfg.label}</span>
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
              </div>
              <h3 className="text-gray-800 mt-0.5" style={{ fontSize: "16px", fontWeight: 700 }}>{int.name}</h3>
              <p className="text-gray-400" style={{ fontSize: "12px" }}>{int.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: "Health", value: int.status === "connected" ? `${int.healthScore}%` : "—", color: int.healthScore >= 90 ? "#16a34a" : "#ea580c" },
              { label: "Records", value: int.recordsSynced.toLocaleString(), color: "#2563eb" },
              { label: "Tần suất", value: int.frequency, color: "#7c3aed" },
              { label: "API", value: int.apiVersion, color: "#6b7280" },
            ].map((s, i) => (
              <div key={i} className="text-center p-2 bg-gray-50 rounded-lg">
                <p style={{ fontSize: "14px", fontWeight: 700, color: s.color }}>{s.value}</p>
                <p className="text-gray-400" style={{ fontSize: "9px" }}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-0.5 mb-3">
            {[
              { id: "config" as const, label: "Cấu hình" },
              { id: "logs" as const, label: `Logs (${int.logs.length})` },
            ].map(t => (
              <button key={t.id} onClick={() => setDetailTab(t.id)} className={`px-3 py-1.5 rounded-lg cursor-pointer ${detailTab === t.id ? "bg-[#990803] text-white" : "bg-gray-100 text-gray-500"}`} style={{ fontSize: "12px", fontWeight: detailTab === t.id ? 600 : 400 }}>{t.label}</button>
            ))}
          </div>

          {detailTab === "config" && (
            <div className="space-y-1.5">
              {int.config.map(c => (
                <div key={c.key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-500 w-28 shrink-0" style={{ fontSize: "11px" }}>{c.key}</span>
                  <span className={`flex-1 ${c.sensitive ? "font-mono" : ""} text-gray-700`} style={{ fontSize: "11px", fontWeight: 500 }}>{c.value}</span>
                  {c.sensitive && <Lock className="w-3 h-3 text-gray-300 shrink-0" />}
                </div>
              ))}
            </div>
          )}

          {detailTab === "logs" && (
            <div className="space-y-1.5">
              {int.logs.map(log => {
                const logColor = log.status === "success" ? "#16a34a" : log.status === "error" ? "#ef4444" : "#ea580c";
                return (
                  <div key={log.id} className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: logColor }} />
                      <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 500 }}>{log.action}</span>
                      <span className="text-gray-300 ml-auto" style={{ fontSize: "9px" }}>{log.timestamp}</span>
                    </div>
                    <p className="text-gray-400 pl-3.5" style={{ fontSize: "10px" }}>{log.details}</p>
                    <div className="flex items-center gap-3 pl-3.5 mt-0.5 text-gray-300" style={{ fontSize: "9px" }}>
                      <span>Records: {log.records}</span>
                      <span>Duration: {log.duration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
            {int.status === "connected" && (
              <button onClick={() => { import("sonner").then(m => m.toast.success("Đang đồng bộ dữ liệu...")); }} className="flex-1 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center justify-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                <RefreshCw className="w-4 h-4" /> Đồng bộ Ngay
              </button>
            )}
            {(int.status === "error" || int.status === "disconnected") && (
              <button onClick={() => { import("sonner").then(m => m.toast.success("Đang kết nối lại...")); }} className="flex-1 py-2.5 bg-[#16a34a] text-white rounded-lg hover:bg-[#15803d] cursor-pointer flex items-center justify-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                <Link2 className="w-4 h-4" /> Kết nối lại
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "13px" }}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}