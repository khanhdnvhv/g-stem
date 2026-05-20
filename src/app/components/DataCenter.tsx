import { useState } from "react";
import {
  Database, Upload, Download, FileText, Search, Filter,
  CheckCircle, XCircle, AlertTriangle, Clock, RefreshCw,
  Plus, Eye, Trash2, Play, Pause, Calendar,
  ArrowUp, ArrowDown, BarChart3, Activity, Layers,
  FileSpreadsheet, File, Archive, Settings, Zap,
  Users, BookOpen, Award, Building2, Shield,
  TrendingUp, Hash, Table, FolderOpen, Send,
} from "lucide-react";
import { toast } from "@/app/lib/toast";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface ImportJob {
  id: string;
  name: string;
  type: "csv" | "excel" | "json" | "api";
  target: string;
  status: "completed" | "running" | "failed" | "queued" | "scheduled";
  records: number;
  errors: number;
  createdAt: string;
  completedAt: string;
  createdBy: string;
  fileSize: string;
  mappingRules: number;
}

interface ExportJob {
  id: string;
  name: string;
  format: "csv" | "excel" | "pdf" | "json";
  source: string;
  status: "completed" | "running" | "failed" | "scheduled";
  records: number;
  fileSize: string;
  createdAt: string;
  scheduleCron: string;
  lastRun: string;
  createdBy: string;
}

interface DataTemplate {
  id: string;
  name: string;
  description: string;
  type: "import" | "export";
  format: string;
  columns: number;
  usage: number;
  category: string;
}

// ─── Mock Data ───
const IMPORT_JOBS: ImportJob[] = [
  { id: "IMP01", name: "Đồng bộ Nhân sự Q1/2026", type: "excel", target: "Nhân sự", status: "completed", records: 6610, errors: 3, createdAt: "12/03/2026 06:00", completedAt: "12/03/2026 06:04", createdBy: "Hệ thống (Auto)", fileSize: "4.2 MB", mappingRules: 28 },
  { id: "IMP02", name: "Import Khóa học ABBank 2026", type: "csv", target: "Khóa học", status: "completed", records: 24, errors: 0, createdAt: "11/03/2026 14:30", completedAt: "11/03/2026 14:31", createdBy: "Trần Thị Hương", fileSize: "156 KB", mappingRules: 15 },
  { id: "IMP03", name: "Import Điểm thi ATLĐ Đợt 3", type: "excel", target: "Điểm thi", status: "running", records: 450, errors: 0, createdAt: "12/03/2026 09:45", completedAt: "—", createdBy: "Phạm Đức Mạnh", fileSize: "780 KB", mappingRules: 12 },
  { id: "IMP04", name: "Import Chứng chỉ ngoại ngữ", type: "csv", target: "Chứng chỉ", status: "failed", records: 0, errors: 15, createdAt: "11/03/2026 10:00", completedAt: "11/03/2026 10:01", createdBy: "Nguyễn Minh Anh", fileSize: "45 KB", mappingRules: 8 },
  { id: "IMP05", name: "API Sync SAP Budget", type: "api", target: "Ngân sách", status: "scheduled", records: 0, errors: 0, createdAt: "12/03/2026 18:00", completedAt: "—", createdBy: "Hệ thống (Auto)", fileSize: "—", mappingRules: 22 },
  { id: "IMP06", name: "Import Đánh giá 360°", type: "json", target: "IDP", status: "queued", records: 0, errors: 0, createdAt: "12/03/2026 10:00", completedAt: "—", createdBy: "Lê Quốc Vương", fileSize: "1.2 MB", mappingRules: 18 },
];

const EXPORT_JOBS: ExportJob[] = [
  { id: "EXP01", name: "Báo cáo Hoàn thành Đào tạo Tháng 3", format: "excel", source: "Khóa học + Nhân sự", status: "completed", records: 6610, fileSize: "8.5 MB", createdAt: "12/03/2026 08:00", scheduleCron: "—", lastRun: "12/03/2026 08:02", createdBy: "Admin" },
  { id: "EXP02", name: "Danh sách Chứng chỉ hết hạn", format: "csv", source: "Chứng chỉ", status: "completed", records: 128, fileSize: "45 KB", createdAt: "12/03/2026 07:00", scheduleCron: "—", lastRun: "12/03/2026 07:00", createdBy: "Admin" },
  { id: "EXP03", name: "Weekly Compliance Report", format: "pdf", source: "Compliance", status: "scheduled", records: 0, fileSize: "—", createdAt: "Auto", scheduleCron: "Thứ 2, 07:00", lastRun: "10/03/2026 07:00", createdBy: "Hệ thống" },
  { id: "EXP04", name: "Monthly KPI Dashboard", format: "excel", source: "KPI & OKR", status: "scheduled", records: 0, fileSize: "—", createdAt: "Auto", scheduleCron: "Ngày 1, 06:00", lastRun: "01/03/2026 06:00", createdBy: "Hệ thống" },
  { id: "EXP05", name: "Export Audit Log Q1", format: "json", source: "Audit Log", status: "running", records: 15400, fileSize: "—", createdAt: "12/03/2026 09:50", scheduleCron: "—", lastRun: "—", createdBy: "Admin" },
  { id: "EXP06", name: "SAP SF Grade Sync", format: "json", source: "Điểm thi", status: "scheduled", records: 0, fileSize: "—", createdAt: "Auto", scheduleCron: "Hàng ngày, 22:00", lastRun: "11/03/2026 22:00", createdBy: "Hệ thống" },
];

const DATA_TEMPLATES: DataTemplate[] = [
  { id: "T01", name: "Mẫu Import Nhân sự", description: "Đồng bộ MSNV, họ tên, email, đơn vị, phòng ban, chức vụ", type: "import", format: "Excel (.xlsx)", columns: 28, usage: 45, category: "Nhân sự" },
  { id: "T02", name: "Mẫu Import Khóa học", description: "Tên, danh mục, thời lượng, giảng viên, đơn vị áp dụng", type: "import", format: "CSV (.csv)", columns: 15, usage: 22, category: "Khóa học" },
  { id: "T03", name: "Mẫu Import Điểm thi", description: "MSNV, mã bài thi, điểm, thời gian, ghi chú", type: "import", format: "Excel (.xlsx)", columns: 12, usage: 38, category: "Thi cử" },
  { id: "T04", name: "Mẫu Import Chứng chỉ", description: "MSNV, loại CC, ngày cấp, ngày hết hạn, đơn vị cấp", type: "import", format: "CSV (.csv)", columns: 8, usage: 15, category: "Chứng chỉ" },
  { id: "T05", name: "Mẫu Export Báo cáo Tổng hợp", description: "Báo cáo hoàn thành theo đơn vị, phòng ban, danh mục", type: "export", format: "Excel (.xlsx)", columns: 35, usage: 60, category: "Báo cáo" },
  { id: "T06", name: "Mẫu Export SAP Integration", description: "Format tương thích SAP SF API cho grade sync", type: "export", format: "JSON", columns: 22, usage: 180, category: "Tích hợp" },
];

const STATUS_CFG = {
  completed: { label: "Hoàn thành", color: "#16a34a", bg: "#16a34a10", icon: CheckCircle },
  running: { label: "Đang xử lý", color: "#2563eb", bg: "#2563eb10", icon: RefreshCw },
  failed: { label: "Thất bại", color: "#ef4444", bg: "#ef444410", icon: XCircle },
  queued: { label: "Chờ xử lý", color: "#c8a84e", bg: "#c8a84e10", icon: Clock },
  scheduled: { label: "Lên lịch", color: "#7c3aed", bg: "#7c3aed10", icon: Calendar },
};

const TYPE_ICONS: Record<string, { icon: typeof FileText; color: string }> = {
  csv: { icon: FileText, color: "#16a34a" },
  excel: { icon: FileSpreadsheet, color: "#2563eb" },
  json: { icon: Hash, color: "#ea580c" },
  pdf: { icon: File, color: "#ef4444" },
  api: { icon: Zap, color: "#7c3aed" },
};

export function DataCenter() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"import" | "export" | "templates" | "history">("import");
  const [search, setSearch] = useState("");

  const totalImport = IMPORT_JOBS.reduce((s, j) => s + (j.status === "completed" ? j.records : 0), 0);
  const totalExport = EXPORT_JOBS.reduce((s, j) => s + (j.status === "completed" ? j.records : 0), 0);
  const failedJobs = IMPORT_JOBS.filter(j => j.status === "failed").length + EXPORT_JOBS.filter(j => j.status === "failed").length;
  const scheduledJobs = IMPORT_JOBS.filter(j => j.status === "scheduled").length + EXPORT_JOBS.filter(j => j.status === "scheduled").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Trung tâm Dữ liệu</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Import CSV/Excel, export báo cáo, scheduled jobs và quản lý mẫu dữ liệu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { import("sonner").then(m => m.toast.info("Mở wizard tạo Export mới...")); }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Export Mới
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.info("Mở wizard Import dữ liệu...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Upload className="w-4 h-4" /> Import Mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Records Imported", value: totalImport.toLocaleString(), icon: Upload, color: "#990803" },
          { label: "Records Exported", value: totalExport.toLocaleString(), icon: Download, color: "#2563eb" },
          { label: "Jobs Lỗi", value: failedJobs, icon: XCircle, color: "#ef4444" },
          { label: "Scheduled Jobs", value: scheduledJobs, icon: Calendar, color: "#7c3aed" },
          { label: "Templates", value: DATA_TEMPLATES.length, icon: Layers, color: "#c8a84e" },
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

      {/* Data Flow Visualization */}
      <div className="bg-gradient-to-r from-[#990803]/5 via-transparent to-[#2563eb]/5 rounded-xl border border-gray-200 p-4">
        <DataFlowChart imports={IMPORT_JOBS} exports={EXPORT_JOBS} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200">
        {[
          { id: "import" as const, label: "Import", icon: Upload, count: IMPORT_JOBS.length },
          { id: "export" as const, label: "Export", icon: Download, count: EXPORT_JOBS.length },
          { id: "templates" as const, label: "Mẫu Dữ liệu", icon: Layers, count: DATA_TEMPLATES.length },
          { id: "history" as const, label: "Lịch sử", icon: Activity },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
            {"count" in t && t.count ? <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full" style={{ fontSize: "10px" }}>{t.count}</span> : null}
          </button>
        ))}
      </div>

      {tab === "import" && <ImportTab jobs={IMPORT_JOBS} search={search} setSearch={setSearch} />}
      {tab === "export" && <ExportTab jobs={EXPORT_JOBS} search={search} setSearch={setSearch} />}
      {tab === "templates" && <TemplatesTab templates={DATA_TEMPLATES} />}
      {tab === "history" && <HistoryTab imports={IMPORT_JOBS} exports={EXPORT_JOBS} />}
    </div>
  );
}

// ─── Data Flow Chart ───
function DataFlowChart({ imports, exports }: { imports: ImportJob[]; exports: ExportJob[] }) {
  const sources = [
    { name: "CSV/Excel", count: imports.filter(i => i.type === "csv" || i.type === "excel").length, color: "#16a34a" },
    { name: "API", count: imports.filter(i => i.type === "api").length, color: "#7c3aed" },
    { name: "JSON", count: imports.filter(i => i.type === "json").length, color: "#ea580c" },
  ];
  const targets = ["Nhân sự", "Khóa học", "Điểm thi", "Chứng chỉ", "Ngân sách", "IDP"];
  const exportTargets = [
    { name: "Excel", count: exports.filter(e => e.format === "excel").length, color: "#2563eb" },
    { name: "CSV", count: exports.filter(e => e.format === "csv").length, color: "#16a34a" },
    { name: "PDF", count: exports.filter(e => e.format === "pdf").length, color: "#ef4444" },
    { name: "JSON/API", count: exports.filter(e => e.format === "json").length, color: "#ea580c" },
  ];

  return (
    <svg width="100%" height="120" viewBox="0 0 700 120" preserveAspectRatio="xMidYMid meet">
      {/* Import sources */}
      <text x="10" y="12" fill="#990803" style={{ fontSize: "9px", fontWeight: 700 }}>IMPORT</text>
      {sources.map((s, i) => {
        const y = 25 + i * 30;
        return (
          <g key={s.name}>
            <rect x="10" y={y} width="80" height="22" rx="6" fill={s.color} opacity="0.1" stroke={s.color} strokeWidth="0.5" />
            <text x="50" y={y + 13} textAnchor="middle" fill={s.color} style={{ fontSize: "8px", fontWeight: 600 }}>{s.name} ({s.count})</text>
            <line x1="90" y1={y + 11} x2="200" y2={60} stroke={s.color} strokeWidth="0.5" opacity="0.4" />
          </g>
        );
      })}
      {/* LMS Center */}
      <rect x="200" y="30" width="120" height="60" rx="12" fill="#990803" opacity="0.05" stroke="#990803" strokeWidth="1" />
      <text x="260" y="55" textAnchor="middle" fill="#990803" style={{ fontSize: "10px", fontWeight: 700 }}>GELEXIMCO LMS</text>
      <text x="260" y="68" textAnchor="middle" fill="#990803" opacity="0.5" style={{ fontSize: "7px" }}>{targets.join(" • ")}</text>
      {/* Export targets */}
      <text x="400" y="12" fill="#2563eb" style={{ fontSize: "9px", fontWeight: 700 }}>EXPORT</text>
      {exportTargets.map((s, i) => {
        const y = 20 + i * 25;
        return (
          <g key={s.name}>
            <line x1="320" y1={60} x2="400" y2={y + 11} stroke={s.color} strokeWidth="0.5" opacity="0.4" />
            <rect x="400" y={y} width="80" height="22" rx="6" fill={s.color} opacity="0.1" stroke={s.color} strokeWidth="0.5" />
            <text x="440" y={y + 13} textAnchor="middle" fill={s.color} style={{ fontSize: "8px", fontWeight: 600 }}>{s.name} ({s.count})</text>
          </g>
        );
      })}
      {/* Scheduled indicator */}
      <text x="560" y="50" fill="#7c3aed" style={{ fontSize: "8px", fontWeight: 600 }}>⏰ Scheduled</text>
      {[
        "Weekly Compliance",
        "Monthly KPI",
        "Daily SAP Sync",
      ].map((name, i) => (
        <g key={i}>
          <rect x="530" y={58 + i * 18} width="130" height="14" rx="4" fill="#7c3aed" opacity="0.05" stroke="#7c3aed" strokeWidth="0.3" />
          <text x="595" y={67 + i * 18} textAnchor="middle" fill="#7c3aed" style={{ fontSize: "6px" }}>{name}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Import Tab ───
function ImportTab({ jobs, search, setSearch }: { jobs: ImportJob[]; search: string; setSearch: (s: string) => void }) {
  const filtered = jobs.filter(j => !search || j.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm import job..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
        </div>
      </div>
      {filtered.map(job => {
        const stCfg = STATUS_CFG[job.status];
        const tyCfg = TYPE_ICONS[job.type] || TYPE_ICONS.csv;
        const StIcon = stCfg.icon;
        const TyIcon = tyCfg.icon;
        return (
          <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: tyCfg.color + "10" }}>
                <TyIcon className="w-5 h-5" style={{ color: tyCfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{job.name}</h4>
                  <span className="px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>
                    <StIcon className="w-2.5 h-2.5" /> {stCfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: "10px" }}>
                  <span>→ {job.target}</span>
                  <span>{job.type.toUpperCase()}</span>
                  <span>{job.fileSize}</span>
                  <span>{job.createdBy}</span>
                </div>
                {job.status === "completed" && (
                  <div className="flex items-center gap-3 mt-1 text-gray-400" style={{ fontSize: "10px" }}>
                    <span className="text-green-600 flex items-center gap-0.5"><CheckCircle className="w-2.5 h-2.5" /> {job.records.toLocaleString()} records</span>
                    {job.errors > 0 && <span className="text-red-500 flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" /> {job.errors} lỗi</span>}
                    <span>{job.completedAt}</span>
                    <span>{job.mappingRules} mapping rules</span>
                  </div>
                )}
                {job.status === "failed" && (
                  <div className="mt-1 px-2 py-1 bg-red-50 rounded text-red-600" style={{ fontSize: "10px" }}>
                    ❌ {job.errors} lỗi: Format không hợp lệ. Kiểm tra lại cột "Ngày cấp" (DD/MM/YYYY).
                  </div>
                )}
                {job.status === "running" && (
                  <div className="mt-1.5">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2563eb] rounded-full animate-pulse" style={{ width: "65%" }} />
                    </div>
                    <p className="text-gray-300 mt-0.5" style={{ fontSize: "9px" }}>Đang xử lý... ~65%</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {job.status === "completed" && <button onClick={() => toast.info(`Xem chi tiết import: ${job.name}`)} className="p-1.5 text-gray-300 hover:text-[#990803] cursor-pointer"><Eye className="w-3.5 h-3.5" /></button>}
                {job.status === "failed" && <button onClick={() => toast.info(`Đang retry import: ${job.name}...`)} className="p-1.5 text-gray-300 hover:text-[#2563eb] cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /></button>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Export Tab ───
function ExportTab({ jobs, search, setSearch }: { jobs: ExportJob[]; search: string; setSearch: (s: string) => void }) {
  const filtered = jobs.filter(j => !search || j.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm export job..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
        </div>
      </div>
      {filtered.map(job => {
        const stCfg = STATUS_CFG[job.status];
        const fmtCfg = TYPE_ICONS[job.format] || TYPE_ICONS.csv;
        const StIcon = stCfg.icon;
        const FmtIcon = fmtCfg.icon;
        return (
          <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: fmtCfg.color + "10" }}>
                <FmtIcon className="w-5 h-5" style={{ color: fmtCfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{job.name}</h4>
                  <span className="px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>
                    <StIcon className="w-2.5 h-2.5" /> {stCfg.label}
                  </span>
                  <span className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded" style={{ fontSize: "8px" }}>{job.format.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: "10px" }}>
                  <span>Nguồn: {job.source}</span>
                  {job.status === "completed" && <span>{job.records.toLocaleString()} records • {job.fileSize}</span>}
                  <span>{job.createdBy}</span>
                </div>
                {job.scheduleCron !== "—" && (
                  <div className="mt-1 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5 text-[#7c3aed]" />
                    <span className="text-[#7c3aed]" style={{ fontSize: "10px" }}>Lịch: {job.scheduleCron}</span>
                    <span className="text-gray-300 ml-1" style={{ fontSize: "9px" }}>Lần cuối: {job.lastRun}</span>
                  </div>
                )}
                {job.status === "running" && (
                  <div className="mt-1.5">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2563eb] rounded-full animate-pulse" style={{ width: "40%" }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {job.status === "completed" && <button onClick={() => toast.success(`Đang tải file export: ${job.name}`)} className="p-1.5 text-gray-300 hover:text-[#16a34a] cursor-pointer"><Download className="w-3.5 h-3.5" /></button>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Templates Tab ───
function TemplatesTab({ templates }: { templates: DataTemplate[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-gray-500" style={{ fontSize: "12px" }}>Mẫu dữ liệu sẵn có cho import/export</p>
        <button onClick={() => { import("sonner").then(m => m.toast.info("Mở form tạo mẫu dữ liệu...")); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#990803] text-white rounded-lg cursor-pointer" style={{ fontSize: "11px" }}>
          <Plus className="w-3 h-3" /> Tạo Mẫu
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.type === "import" ? "bg-[#990803]/10" : "bg-[#2563eb]/10"}`}>
                {t.type === "import" ? <Upload className="w-5 h-5 text-[#990803]" /> : <Download className="w-5 h-5 text-[#2563eb]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{t.name}</h4>
                  <span className={`px-1.5 py-0.5 rounded ${t.type === "import" ? "bg-[#990803]/10 text-[#990803]" : "bg-[#2563eb]/10 text-[#2563eb]"}`} style={{ fontSize: "8px", fontWeight: 600 }}>
                    {t.type === "import" ? "Import" : "Export"}
                  </span>
                </div>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>{t.description}</p>
                <div className="flex items-center gap-3 mt-1 text-gray-400" style={{ fontSize: "10px" }}>
                  <span>{t.format}</span>
                  <span>{t.columns} cột</span>
                  <span>{t.category}</span>
                  <span>Đã dùng: {t.usage} lần</span>
                </div>
              </div>
              <button onClick={() => toast.success(`Đang tải mẫu: ${t.name}`)} className="p-1.5 text-gray-300 hover:text-[#990803] cursor-pointer"><Download className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── History Tab ───
function HistoryTab({ imports, exports }: { imports: ImportJob[]; exports: ExportJob[] }) {
  const all = [
    ...imports.filter(i => i.status === "completed" || i.status === "failed").map(i => ({
      type: "import" as const, name: i.name, status: i.status, records: i.records, time: i.completedAt, by: i.createdBy, errors: i.errors,
    })),
    ...exports.filter(e => e.status === "completed" || e.status === "failed").map(e => ({
      type: "export" as const, name: e.name, status: e.status, records: e.records, time: e.lastRun, by: e.createdBy, errors: 0,
    })),
  ].sort((a, b) => b.time.localeCompare(a.time));

  // Weekly summary
  const weekData = [
    { day: "T2", imports: 12, exports: 8 },
    { day: "T3", imports: 8, exports: 15 },
    { day: "T4", imports: 15, exports: 10 },
    { day: "T5", imports: 6, exports: 12 },
    { day: "T6", imports: 20, exports: 18 },
    { day: "T7", imports: 3, exports: 5 },
    { day: "CN", imports: 1, exports: 2 },
  ];
  const maxW = Math.max(...weekData.map(d => Math.max(d.imports, d.exports)));

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Hoạt động Tuần này</h3>
        <svg width="100%" height="100" viewBox="0 0 500 100" preserveAspectRatio="xMidYMid meet">
          {weekData.map((d, i) => {
            const x = 30 + i * 65;
            const impH = maxW > 0 ? (d.imports / maxW) * 55 : 0;
            const expH = maxW > 0 ? (d.exports / maxW) * 55 : 0;
            return (
              <g key={i}>
                <rect x={x} y={65 - impH} width="22" height={impH} rx="3" fill="#990803" opacity="0.7" />
                <rect x={x + 26} y={65 - expH} width="22" height={expH} rx="3" fill="#2563eb" opacity="0.7" />
                <text x={x + 24} y={80} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "8px" }}>{d.day}</text>
                {d.imports > 0 && <text x={x + 11} y={62 - impH} textAnchor="middle" fill="#990803" style={{ fontSize: "7px", fontWeight: 600 }}>{d.imports}</text>}
                {d.exports > 0 && <text x={x + 37} y={62 - expH} textAnchor="middle" fill="#2563eb" style={{ fontSize: "7px", fontWeight: 600 }}>{d.exports}</text>}
              </g>
            );
          })}
          <rect x="420" y="20" width="8" height="8" rx="2" fill="#990803" opacity="0.7" />
          <text x="432" y="27" fill="#6b7280" style={{ fontSize: "8px" }}>Import</text>
          <rect x="420" y="34" width="8" height="8" rx="2" fill="#2563eb" opacity="0.7" />
          <text x="432" y="41" fill="#6b7280" style={{ fontSize: "8px" }}>Export</text>
        </svg>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Lịch sử Gần đây</h3>
        <div className="space-y-1.5">
          {all.map((item, i) => {
            const isImport = item.type === "import";
            const stColor = item.status === "completed" ? "#16a34a" : "#ef4444";
            return (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className={`w-6 h-6 rounded flex items-center justify-center ${isImport ? "bg-[#990803]/10" : "bg-[#2563eb]/10"}`}>
                  {isImport ? <Upload className="w-3 h-3 text-[#990803]" /> : <Download className="w-3 h-3 text-[#2563eb]" />}
                </div>
                <span className="flex-1 text-gray-600 truncate" style={{ fontSize: "12px" }}>{item.name}</span>
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stColor, backgroundColor: stColor + "10" }}>
                  {item.status === "completed" ? `✓ ${item.records.toLocaleString()}` : `✗ ${item.errors} lỗi`}
                </span>
                <span className="text-gray-300 w-28 text-right shrink-0" style={{ fontSize: "9px" }}>{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}