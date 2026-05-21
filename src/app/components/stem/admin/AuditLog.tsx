import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Download, X, ChevronUp, ChevronDown, ChevronsUpDown,
  User, Shield, Plus, RefreshCw, LogIn, LogOut, KeyRound, FileDown,
  Settings, Trash2, Pencil, MonitorSmartphone, AlertCircle, CheckCircle,
} from "lucide-react";

/* ================================================================ */
/*  TYPES                                                            */
/* ================================================================ */

type ActionType = "create" | "update" | "delete" | "login" | "logout" | "assign_role" | "export" | "config_change";
type ModuleType = "organization" | "account" | "supplier" | "catalog" | "integration" | "security" | "cms";
type SortDir = "asc" | "desc";

interface DiffField { field: string; label: string; before: string; after: string; }

interface LogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorEmail: string;
  actorAvatar: string;
  role: string;
  action: ActionType;
  module: ModuleType;
  targetName: string;
  targetId: string;
  ip: string;
  orgName: string;
  orgId: string;
  diff?: DiffField[];
  loginSuccess?: boolean;
  userAgent?: string;
}

/* ================================================================ */
/*  MOCK DATA                                                        */
/* ================================================================ */

const ORGS = [
  { id: "ORG-01", name: "Sở GD&ĐT Hà Nội" },
  { id: "ORG-02", name: "Sở GD&ĐT TP.HCM" },
  { id: "ORG-03", name: "Sở GD&ĐT Đà Nẵng" },
  { id: "ORG-04", name: "Geleximco STEM (Platform)" },
];

const ACTORS = [
  { name: "Nguyễn Văn Minh",  email: "minh.nv@geleximco.edu.vn",  avatar: "NM", role: "SysAdmin",       orgId: "ORG-04" },
  { name: "Trần Thị Lan",     email: "lan.tt@sohanoi.edu.vn",      avatar: "TL", role: "Quản trị Sở",   orgId: "ORG-01" },
  { name: "Lê Quang Hùng",    email: "hung.lq@sohcm.edu.vn",       avatar: "LH", role: "Quản trị Sở",   orgId: "ORG-02" },
  { name: "Phạm Minh Tuấn",   email: "tuan.pm@geleximco.edu.vn",   avatar: "PT", role: "SysAdmin",       orgId: "ORG-04" },
  { name: "Đỗ Thu Hương",     email: "huong.dt@sodanang.edu.vn",   avatar: "DH", role: "Quản trị Sở",   orgId: "ORG-03" },
  { name: "Vũ Thành Long",    email: "long.vt@geleximco.edu.vn",   avatar: "VL", role: "Quản trị NCC",  orgId: "ORG-04" },
];

const MODULES: ModuleType[] = ["organization","account","supplier","catalog","integration","security","cms"];
const ACTIONS: ActionType[] = ["create","update","delete","login","logout","assign_role","export","config_change"];

const SAMPLE_DIFFS: Record<ActionType, DiffField[] | undefined> = {
  create: [
    { field: "name",   label: "Tên tổ chức", before: "",              after: "Trường THPT Chu Văn An" },
    { field: "code",   label: "Mã",          before: "",              after: "CVA-HN" },
    { field: "status", label: "Trạng thái",  before: "",              after: "Hoạt động" },
  ],
  update: [
    { field: "email",  label: "Email",       before: "old@school.vn", after: "new@school.vn" },
    { field: "phone",  label: "Điện thoại",  before: "0243 123 456",  after: "0243 999 888" },
  ],
  delete: [
    { field: "name",   label: "Tên",         before: "Nhà cung cấp XYZ", after: "" },
    { field: "status", label: "Trạng thái",  before: "Hoạt động",        after: "[đã xoá mềm]" },
  ],
  assign_role: [
    { field: "role",   label: "Vai trò",     before: "Giáo viên",     after: "Quản trị Trường" },
  ],
  config_change: [
    { field: "mfa",    label: "Bắt buộc MFA", before: "Tắt",          after: "Bật" },
    { field: "session_ttl", label: "Session TTL", before: "30 phút",   after: "60 phút" },
  ],
  login:   undefined,
  logout:  undefined,
  export:  undefined,
};

const TARGET_NAMES: Record<ModuleType, string[]> = {
  organization: ["Trường THPT Chu Văn An", "Sở GD Hà Nội", "Phòng GD Cầu Giấy"],
  account:      ["Nguyễn Thị Hoa (GV)", "Trần Văn Bình (HS)", "Lê Quang Nam (QTHT)"],
  supplier:     ["Công ty TNHH STEM Việt", "NCC Robot & Coding", "Edu Tech Solutions"],
  catalog:      ["Cấp THPT", "Môn Vật lý", "Sách Toán 10"],
  integration:  ["Kết nối VNeID", "API CSDL Quốc gia", "SSO Sở GD"],
  security:     ["Chính sách mật khẩu", "Cấu hình MFA", "Whitelist IP"],
  cms:          ["Bài giảng Robot Cơ bản", "Video STEM Lớp 6", "Đề thi HK1"],
};

function makeId(prefix: string, n: number) { return `${prefix}-${String(n).padStart(5,"0")}`; }

function generateLogs(): LogEntry[] {
  const entries: LogEntry[] = [];
  const now = Date.now();
  for (let i = 0; i < 120; i++) {
    const actor = ACTORS[i % ACTORS.length];
    const action = ACTIONS[i % ACTIONS.length];
    const module = MODULES[i % MODULES.length];
    const targets = TARGET_NAMES[module];
    const target = targets[i % targets.length];
    const org = ORGS.find(o => o.id === actor.orgId)!;
    const isLogin = action === "login" || action === "logout";
    entries.push({
      id: makeId("LOG", i + 1),
      timestamp: new Date(now - i * 2_700_000 - Math.random() * 600_000).toISOString(),
      actorName: actor.name,
      actorEmail: actor.email,
      actorAvatar: actor.avatar,
      role: actor.role,
      action,
      module,
      targetName: isLogin ? actor.name : target,
      targetId: isLogin ? makeId("USR", (i % 10) + 1) : makeId(module.slice(0,3).toUpperCase(), (i % 20) + 1),
      ip: `10.${(i % 5) + 1}.${(i % 20) + 1}.${(i % 200) + 10}`,
      orgName: org.name,
      orgId: org.id,
      diff: SAMPLE_DIFFS[action],
      loginSuccess: isLogin ? i % 7 !== 0 : undefined,
      userAgent: isLogin ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0" : undefined,
    });
  }
  return entries;
}

const ALL_LOGS = generateLogs();

/* ================================================================ */
/*  CONFIG                                                           */
/* ================================================================ */

const ACTION_CFG: Record<ActionType, { label: string; icon: typeof User; bg: string; text: string }> = {
  create:        { label: "Tạo mới",          icon: Plus,           bg: "bg-green-100 dark:bg-green-900/30",  text: "text-green-700 dark:text-green-400" },
  update:        { label: "Cập nhật",          icon: Pencil,         bg: "bg-yellow-100 dark:bg-yellow-900/30",text: "text-yellow-700 dark:text-yellow-500" },
  delete:        { label: "Xoá mềm",           icon: Trash2,         bg: "bg-red-100 dark:bg-red-900/30",      text: "text-red-700 dark:text-red-400" },
  login:         { label: "Đăng nhập",         icon: LogIn,          bg: "bg-slate-100 dark:bg-slate-800",     text: "text-slate-600 dark:text-slate-400" },
  logout:        { label: "Đăng xuất",         icon: LogOut,         bg: "bg-slate-100 dark:bg-slate-800",     text: "text-slate-600 dark:text-slate-400" },
  assign_role:   { label: "Gán vai trò",        icon: KeyRound,       bg: "bg-purple-100 dark:bg-purple-900/30",text: "text-purple-700 dark:text-purple-400" },
  export:        { label: "Xuất dữ liệu",      icon: FileDown,       bg: "bg-blue-100 dark:bg-blue-900/30",    text: "text-blue-700 dark:text-blue-400" },
  config_change: { label: "Thay đổi cấu hình", icon: Settings,       bg: "bg-orange-100 dark:bg-orange-900/30",text: "text-orange-700 dark:text-orange-500" },
};

const MODULE_CFG: Record<ModuleType, string> = {
  organization: "Tổ chức",
  account:      "Tài khoản",
  supplier:     "Nhà cung cấp",
  catalog:      "Danh mục",
  integration:  "Tích hợp",
  security:     "Bảo mật",
  cms:          "CMS",
};

/* ================================================================ */
/*  HELPERS                                                          */
/* ================================================================ */

function fmtTs(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" }),
    time: d.toLocaleTimeString("vi-VN", { hour:"2-digit", minute:"2-digit", second:"2-digit" }),
  };
}

function avatarBg(initials: string) {
  const colors = ["bg-red-500","bg-blue-500","bg-emerald-500","bg-purple-500","bg-amber-500","bg-cyan-500"];
  const i = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % colors.length;
  return colors[i];
}

function addDays(date: Date, days: number) {
  const d = new Date(date); d.setDate(d.getDate() + days); return d;
}

function isoDate(d: Date) { return d.toISOString().slice(0,10); }

/* ================================================================ */
/*  SUB-COMPONENTS                                                   */
/* ================================================================ */

function ActionBadge({ action }: { action: ActionType }) {
  const c = ACTION_CFG[action];
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <Icon size={11} /> {c.label}
    </span>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold shrink-0 ${avatarBg(initials)}`}>
      {initials}
    </span>
  );
}

function SortIcon({ col, sortCol, sortDir }: { col: string; sortCol: string; sortDir: SortDir }) {
  if (col !== sortCol) return <ChevronsUpDown size={12} className="text-muted-foreground/40" />;
  return sortDir === "asc" ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />;
}

/* ── Drawer ── */
function DetailDrawer({ entry, onClose }: { entry: LogEntry; onClose: () => void }) {
  const ts = fmtTs(entry.timestamp);
  const isLoginAction = entry.action === "login" || entry.action === "logout";
  const isExport = entry.action === "export";

  // close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full z-50 w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div>
            <p className="text-xs text-muted-foreground font-mono">{entry.id}</p>
            <h2 className="text-base font-semibold mt-0.5">Chi tiết nhật ký</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Basic info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Thời gian", value: `${ts.date} ${ts.time}` },
              { label: "Địa chỉ IP", value: entry.ip },
              { label: "Module", value: MODULE_CFG[entry.module] },
              { label: "Hành động", value: <ActionBadge action={entry.action} /> },
              { label: "Đối tượng", value: entry.targetName },
              { label: "ID đối tượng", value: <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{entry.targetId}</code> },
              { label: "Tổ chức", value: entry.orgName },
            ].map(r => (
              <div key={r.label} className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">{r.label}</p>
                <div className="font-medium text-sm">{r.value}</div>
              </div>
            ))}
          </div>

          {/* Actor */}
          <div className="border border-border rounded-lg p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Người thực hiện</p>
            <div className="flex items-center gap-3">
              <Avatar initials={entry.actorAvatar} />
              <div>
                <p className="font-medium text-sm">{entry.actorName}</p>
                <p className="text-xs text-muted-foreground">{entry.actorEmail}</p>
                <span className="inline-block mt-1 text-xs bg-muted px-2 py-0.5 rounded-full">{entry.role}</span>
              </div>
            </div>
          </div>

          {/* Login metadata */}
          {isLoginAction && (
            <div className="border border-border rounded-lg p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thông tin phiên đăng nhập</p>
              <div className="flex items-center gap-2">
                {entry.loginSuccess
                  ? <CheckCircle size={16} className="text-green-500" />
                  : <AlertCircle size={16} className="text-red-500" />}
                <span className={`text-sm font-medium ${entry.loginSuccess ? "text-green-600" : "text-red-600"}`}>
                  {entry.loginSuccess ? "Đăng nhập thành công" : "Đăng nhập thất bại"}
                </span>
              </div>
              {entry.userAgent && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MonitorSmartphone size={12} /> User Agent</p>
                  <p className="text-xs font-mono bg-muted p-2 rounded break-all">{entry.userAgent}</p>
                </div>
              )}
            </div>
          )}

          {/* Export info */}
          {isExport && (
            <div className="border border-border rounded-lg p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Thông tin xuất dữ liệu</p>
              <p className="text-sm text-muted-foreground">Module <strong>{MODULE_CFG[entry.module]}</strong> — file được xuất và tải về máy người dùng.</p>
            </div>
          )}

          {/* Diff */}
          {!isLoginAction && !isExport && entry.diff && entry.diff.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">So sánh thay đổi</p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium w-1/4">Trường</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium w-[37.5%]">Giá trị cũ</th>
                    <th className="px-3 py-2 text-left text-muted-foreground font-medium w-[37.5%]">Giá trị mới</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {entry.diff.map(d => (
                    <tr key={d.field}>
                      <td className="px-3 py-2 font-medium">{d.label}</td>
                      <td className="px-3 py-2">
                        {d.before
                          ? <span className="inline-block bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded font-mono">{d.before}</span>
                          : <span className="text-muted-foreground italic">—</span>}
                      </td>
                      <td className="px-3 py-2">
                        {d.after
                          ? <span className="inline-block bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded font-mono">{d.after}</span>
                          : <span className="text-muted-foreground italic">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* No diff & not login */}
          {!isLoginAction && !isExport && (!entry.diff || entry.diff.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">Không có dữ liệu thay đổi chi tiết.</p>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Export Modal ── */
function ExportModal({ onClose }: { onClose: () => void }) {
  const [format, setFormat] = useState<"excel" | "pdf">("excel");
  const today = new Date();
  const [from, setFrom] = useState(isoDate(addDays(today, -30)));
  const [to, setTo]     = useState(isoDate(today));
  const [loading, setLoading] = useState(false);

  const maxFrom = isoDate(addDays(new Date(to), -90));
  const diffDays = Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
  const rangeOk = diffDays >= 0 && diffDays <= 92;

  async function handleExport() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onClose();
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md pointer-events-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-base">Xuất nhật ký kiểm tra</h2>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"><X size={17} /></button>
          </div>

          <div className="p-5 space-y-4">
            {/* Format */}
            <div>
              <p className="text-sm font-medium mb-2">Định dạng xuất</p>
              <div className="flex gap-3">
                {(["excel","pdf"] as const).map(f => (
                  <label key={f} className={`flex-1 flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition-colors ${format === f ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"}`}>
                    <input type="radio" className="sr-only" checked={format === f} onChange={() => setFormat(f)} />
                    <span className="text-lg">{f === "excel" ? "📊" : "📄"}</span>
                    <div>
                      <p className="text-sm font-medium">{f === "excel" ? "Excel (.xlsx)" : "PDF"}</p>
                      <p className="text-xs text-muted-foreground">{f === "excel" ? "Phù hợp phân tích" : "Phù hợp in ấn"}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div>
              <p className="text-sm font-medium mb-2">Khoảng thời gian <span className="text-muted-foreground font-normal">(tối đa 3 tháng)</span></p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Từ ngày</label>
                  <input type="date" value={from} min={maxFrom} max={to}
                    onChange={e => setFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Đến ngày</label>
                  <input type="date" value={to} min={from} max={isoDate(today)}
                    onChange={e => setTo(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              {!rangeOk && (
                <p className="text-xs text-red-500 mt-1.5">Khoảng thời gian tối đa là 3 tháng (92 ngày).</p>
              )}
              {rangeOk && (
                <p className="text-xs text-muted-foreground mt-1.5">Khoảng {diffDays} ngày được chọn.</p>
              )}
            </div>

            <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              Dữ liệu audit log được lưu tối thiểu 24 tháng theo Nghị định 53/2022/NĐ-CP.
            </p>
          </div>

          <div className="flex justify-end gap-2 px-5 py-4 border-t border-border">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">Huỷ</button>
            <button onClick={handleExport} disabled={!rangeOk || loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
              {loading ? "Đang xuất..." : `Xuất ${format === "excel" ? "Excel" : "PDF"}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================================================================ */
/*  MAIN                                                             */
/* ================================================================ */

const PAGE_SIZE = 25;

export function AuditLogAdmin() {
  const [search,        setSearch]        = useState("");
  const [actionFilter,  setActionFilter]  = useState<ActionType | "all">("all");
  const [moduleFilter,  setModuleFilter]  = useState<ModuleType | "all">("all");
  const [orgFilter,     setOrgFilter]     = useState<string>("all");
  const today = new Date();
  const [dateFrom, setDateFrom] = useState(isoDate(addDays(today, -7)));
  const [dateTo,   setDateTo]   = useState(isoDate(today));
  const [sortDir,  setSortDir]  = useState<SortDir>("desc");
  const [page,     setPage]     = useState(1);
  const [selected, setSelected] = useState<LogEntry | null>(null);
  const [showExport, setShowExport] = useState(false);

  const filtered = useMemo(() => {
    const fromTs = new Date(dateFrom).getTime();
    const toTs   = new Date(dateTo).getTime() + 86399999;
    return ALL_LOGS
      .filter(l => {
        const t = new Date(l.timestamp).getTime();
        if (t < fromTs || t > toTs) return false;
        if (actionFilter !== "all" && l.action !== actionFilter) return false;
        if (moduleFilter !== "all" && l.module !== moduleFilter) return false;
        if (orgFilter !== "all" && l.orgId !== orgFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!l.actorName.toLowerCase().includes(q) && !l.actorEmail.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const diff = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        return sortDir === "asc" ? diff : -diff;
      });
  }, [search, actionFilter, moduleFilter, orgFilter, dateFrom, dateTo, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function reset() {
    setSearch(""); setActionFilter("all"); setModuleFilter("all"); setOrgFilter("all");
    setDateFrom(isoDate(addDays(today, -7))); setDateTo(isoDate(today)); setPage(1);
  }

  function toggleSort() {
    setSortDir(d => d === "desc" ? "asc" : "desc");
    setPage(1);
  }

  const inputCls = "px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Nhật ký kiểm tra</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Ghi lại toàn bộ hành động quan trọng — chỉ đọc, không thể xoá. Lưu tối thiểu 24 tháng theo Nghị định 53/2022/NĐ-CP.
          </p>
        </div>
        <button onClick={() => setShowExport(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors shrink-0">
          <Download size={15} /> Xuất dữ liệu
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm theo tên hoặc email người thực hiện..."
              className={`w-full pl-8 ${inputCls}`} />
          </div>

          {/* Action */}
          <select value={actionFilter} onChange={e => { setActionFilter(e.target.value as any); setPage(1); }}
            className={inputCls}>
            <option value="all">Tất cả hành động</option>
            {(Object.keys(ACTION_CFG) as ActionType[]).map(a => (
              <option key={a} value={a}>{ACTION_CFG[a].label}</option>
            ))}
          </select>

          {/* Module */}
          <select value={moduleFilter} onChange={e => { setModuleFilter(e.target.value as any); setPage(1); }}
            className={inputCls}>
            <option value="all">Tất cả module</option>
            {(Object.keys(MODULE_CFG) as ModuleType[]).map(m => (
              <option key={m} value={m}>{MODULE_CFG[m]}</option>
            ))}
          </select>

          {/* Org */}
          <select value={orgFilter} onChange={e => { setOrgFilter(e.target.value); setPage(1); }}
            className={inputCls}>
            <option value="all">Tất cả tổ chức</option>
            {ORGS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Date range */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">Từ</span>
            <input type="date" value={dateFrom} max={dateTo}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              className={`${inputCls} text-xs`} />
            <span className="text-xs text-muted-foreground">đến</span>
            <input type="date" value={dateTo} min={dateFrom} max={isoDate(today)}
              onChange={e => { setDateTo(e.target.value); setPage(1); }}
              className={`${inputCls} text-xs`} />
          </div>

          <button onClick={reset}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors ml-auto">
            <RefreshCw size={12} /> Reset filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span> bản ghi
            {filtered.length !== ALL_LOGS.length && ` / ${ALL_LOGS.length} tổng`}
          </p>
          <p className="text-xs text-muted-foreground">Trang {page}/{totalPages}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="py-3 px-4 text-left">
                  <button onClick={toggleSort}
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Thời gian <SortIcon col="time" sortCol="time" sortDir={sortDir} />
                  </button>
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Người thực hiện</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Vai trò</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Hành động</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Module</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Đối tượng</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground">Địa chỉ IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageData.map(l => {
                const ts = fmtTs(l.timestamp);
                return (
                  <tr key={l.id} onClick={() => setSelected(l)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer">
                    <td className="py-3 px-4">
                      <p className="text-xs font-mono text-foreground">{ts.time}</p>
                      <p className="text-xs text-muted-foreground">{ts.date}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Avatar initials={l.actorAvatar} />
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{l.actorName}</p>
                          <p className="text-xs text-muted-foreground truncate">{l.actorEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{l.role}</span>
                    </td>
                    <td className="py-3 px-4"><ActionBadge action={l.action} /></td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{MODULE_CFG[l.module]}</td>
                    <td className="py-3 px-4">
                      <p className="text-sm truncate max-w-40">{l.targetName}</p>
                      <p className="text-xs font-mono text-muted-foreground">{l.targetId}</p>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{l.ip}</td>
                  </tr>
                );
              })}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-sm text-muted-foreground">
                    Không có bản ghi nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted disabled:opacity-40 transition-colors">
              ← Trước
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const pg = totalPages <= 7 ? i + 1 : i < 3 ? i + 1 : i === 3 ? page : totalPages - 2 + (i - 4);
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs transition-colors ${pg === page ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}>
                    {pg}
                  </button>
                );
              })}
            </div>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted disabled:opacity-40 transition-colors">
              Tiếp →
            </button>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selected && <DetailDrawer entry={selected} onClose={() => setSelected(null)} />}

      {/* Export modal */}
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
    </div>
  );
}

export default AuditLogAdmin;
