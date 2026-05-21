import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft, KeyRound, Lock, Unlock, ShieldCheck, X, AlertTriangle,
  Check, User, Building2, School, Package, History, Edit2, Save,
  Phone, Calendar, Hash, UserSquare2, Mail, FileText, Shield,
  ChevronRight, Search,
} from "lucide-react";
import { toast } from "@/app/lib/toast";
import { formatDate, formatDateTime } from "../ui/format";
import type { OrgType } from "./org-data";
import { MOCK_ORGS } from "./org-data";
import type { Account, AccountStatus, ActivityAction } from "./account-data";
import {
  MOCK_ACCOUNTS, ROLE_DISPLAY, STATUS_DISPLAY,
  MOCK_ACTIVITY_LOGS, MOCK_ACCOUNT_CHANGE_LOGS,
  ACTIVITY_ACTION_LABELS,
} from "./account-data";
import type { StemRole } from "../../AuthContext";

/* ================================================================ */
/*  CONSTANTS & HELPERS                                             */
/* ================================================================ */
const ALL_ROLES: StemRole[] = [
  "system_admin",
  "authority_admin", "authority_viewer",
  "school_principal", "school_admin", "school_itadmin",
  "teacher", "student",
  "supplier_admin", "supplier_content", "supplier_sales", "supplier_warranty",
];

const ORG_TYPE_CFG: Record<OrgType, { label: string; color: string; bg: string; icon: typeof Building2 }> = {
  so_gd:  { label: "Sở GD",  color: "#1e40af", bg: "#dbeafe", icon: Building2 },
  truong: { label: "Trường", color: "#0e7490", bg: "#cffafe", icon: School    },
  ncc:    { label: "NCC",    color: "#6d28d9", bg: "#ede9fe", icon: Package   },
};

const ACTION_COLOR: Record<ActivityAction, string> = {
  login:           "#15803d",
  logout:          "#6b7280",
  password_change: "#d97706",
  content_change:  "#2563eb",
  other:           "#6b7280",
};

function initials(name: string) {
  const parts = name.trim().split(" ");
  return parts.slice(-2).map((p) => p[0]).join("").toUpperCase();
}

function relativeTime(iso: string | null) {
  if (!iso) return "Chưa đăng nhập";
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Vừa xong";
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hôm qua";
  if (days < 30) return `${days} ngày trước`;
  return `${Math.floor(days / 30)} tháng trước`;
}

const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1e40af] transition-colors";

/* ================================================================ */
/*  MODAL: ĐẶT LẠI MẬT KHẨU                                       */
/* ================================================================ */
function ResetPasswordModal({ account, onClose }: { account: Account; onClose: () => void }) {
  const handleConfirm = () => {
    toast.success(`Đã gửi email đặt lại mật khẩu đến ${account.email}`);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[15px]">Đặt lại mật khẩu</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <p className="text-[13px] text-muted-foreground">
          Hệ thống sẽ gửi email đặt lại mật khẩu đến địa chỉ sau:
        </p>
        <div className="bg-secondary rounded-xl px-4 py-3 flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="font-mono text-[13px] font-medium">{account.email}</span>
        </div>
        <p className="text-[12px] text-muted-foreground">
          Người dùng sẽ nhận được link đặt lại mật khẩu có hiệu lực trong 24 giờ.
        </p>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/70 rounded-xl transition-colors font-medium text-[13px]">
            Huỷ
          </button>
          <button onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-[#1e40af] text-white hover:opacity-90 rounded-xl transition-opacity font-medium text-[13px]">
            Gửi email
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  MODAL: KHOÁ / MỞ KHOÁ                                         */
/* ================================================================ */
function LockModal({ account, onConfirm, onClose }: {
  account: Account; onConfirm: (reason: string) => void; onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const isLocking = account.status !== "locked";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[15px]">
            {isLocking ? "Khoá tài khoản" : "Mở khoá tài khoản"}
          </h2>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <p className="text-[13px] text-muted-foreground">
          Tài khoản: <strong className="text-foreground">{account.name}</strong>
        </p>
        {isLocking && (
          <>
            <div>
              <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">
                Lý do khoá <span className="text-red-500">*</span>
              </label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                rows={3} placeholder="Nhập lý do khoá tài khoản..."
                className={inputCls + " resize-none"} />
            </div>
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-800">
                Người dùng sẽ bị đăng xuất ngay lập tức và không thể đăng nhập cho đến khi được mở khoá.
              </p>
            </div>
          </>
        )}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/70 rounded-xl transition-colors font-medium text-[13px]">
            Huỷ
          </button>
          <button
            onClick={() => { if (isLocking && !reason.trim()) return; onConfirm(reason); }}
            disabled={isLocking && !reason.trim()}
            className={`flex-1 px-4 py-2 rounded-xl transition-opacity font-medium text-[13px] text-white
              ${isLocking ? "bg-red-600 hover:opacity-90 disabled:opacity-40" : "bg-green-600 hover:opacity-90"}`}>
            {isLocking ? "Khoá tài khoản" : "Mở khoá"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  MODAL: ĐỔI VAI TRÒ                                            */
/* ================================================================ */
function ChangeRoleModal({ account, onSave, onClose }: {
  account: Account; onSave: (role: StemRole, reason: string) => void; onClose: () => void;
}) {
  const [selected, setSelected] = useState<StemRole>(account.role);
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[15px]">Đổi vai trò tài khoản</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-muted-foreground">Vai trò hiện tại:</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
            style={{ color: ROLE_DISPLAY[account.role].color, backgroundColor: ROLE_DISPLAY[account.role].bg }}>
            {ROLE_DISPLAY[account.role].label}
          </span>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">
            Vai trò mới <span className="text-red-500">*</span>
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-xl p-1.5">
            {ALL_ROLES.filter((r) => r !== account.role).map((r) => {
              const d = ROLE_DISPLAY[r];
              return (
                <button key={r} onClick={() => setSelected(r)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left
                    ${selected === r ? "ring-2 ring-[#1e40af]" : "hover:bg-secondary"}`}
                  style={{ backgroundColor: selected === r ? d.bg + "80" : undefined }}>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ color: d.color, backgroundColor: d.bg }}>{d.label}</span>
                  {selected === r && <Check className="w-3.5 h-3.5" style={{ color: d.color }} />}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">
            Lý do thay đổi <span className="text-red-500">*</span>
          </label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)}
            rows={2} placeholder="Nhập lý do thay đổi vai trò..."
            className={inputCls + " resize-none"} />
        </div>
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-800">
            Phiên đăng nhập hiện tại của người dùng sẽ bị huỷ ngay khi lưu.
          </p>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/70 rounded-xl transition-colors font-medium text-[13px]">
            Huỷ
          </button>
          <button
            onClick={() => { if (selected !== account.role && reason.trim()) onSave(selected, reason); }}
            disabled={selected === account.role || !reason.trim()}
            className="flex-1 px-4 py-2 bg-[#1e40af] text-white hover:opacity-90 disabled:opacity-40 rounded-xl transition-opacity font-medium text-[13px]">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TAB 1: THÔNG TIN CÁ NHÂN                                       */
/* ================================================================ */
function TabPersonalInfo({ account, onUpdate }: {
  account: Account; onUpdate: (patch: Partial<Account>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    name:   account.name,
    phone:  account.phone  ?? "",
    dob:    account.dob    ?? "",
    gender: account.gender ?? "" as "" | "male" | "female" | "other",
    code:   account.code,
  });

  const handleSave = () => {
    onUpdate({ name: draft.name, phone: draft.phone || undefined, dob: draft.dob || undefined, gender: draft.gender || undefined, code: draft.code });
    setEditing(false);
    toast.success("Đã lưu thông tin cá nhân");
  };
  const handleCancel = () => {
    setDraft({ name: account.name, phone: account.phone ?? "", dob: account.dob ?? "", gender: account.gender ?? "" as "", code: account.code });
    setEditing(false);
  };

  const rows: { icon: typeof User; label: string; node: React.ReactNode }[] = [
    {
      icon: User, label: "Họ tên",
      node: editing
        ? <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className={inputCls} />
        : <span className="font-medium">{account.name}</span>,
    },
    {
      icon: Mail, label: "Email",
      node: <span className="font-mono text-[12px] text-muted-foreground">{account.email} <span className="text-[11px] italic">(Chỉ đọc)</span></span>,
    },
    {
      icon: Phone, label: "Số điện thoại",
      node: editing
        ? <input value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} placeholder="0912345678" className={inputCls} />
        : <span>{account.phone ?? <span className="text-muted-foreground italic">Chưa cập nhật</span>}</span>,
    },
    {
      icon: Calendar, label: "Ngày sinh",
      node: editing
        ? <input type="date" value={draft.dob} onChange={(e) => setDraft((d) => ({ ...d, dob: e.target.value }))} className={inputCls} />
        : <span>{account.dob ? formatDate(account.dob) : <span className="text-muted-foreground italic">Chưa cập nhật</span>}</span>,
    },
    {
      icon: UserSquare2, label: "Giới tính",
      node: editing
        ? (
          <select value={draft.gender} onChange={(e) => setDraft((d) => ({ ...d, gender: e.target.value as "" | "male" | "female" | "other" }))} className={inputCls + " cursor-pointer"}>
            <option value="">Chưa xác định</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        )
        : <span>{{ male: "Nam", female: "Nữ", other: "Khác" }[account.gender ?? ""] ?? <span className="text-muted-foreground italic">Chưa cập nhật</span>}</span>,
    },
    {
      icon: Hash, label: "Mã định danh",
      node: editing
        ? <input value={draft.code} onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))} className={inputCls} />
        : <span className="font-mono text-[12px]">{account.code}</span>,
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[14px]">Thông tin cá nhân</h3>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/70 rounded-lg transition-colors text-[12px]">
            <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
          </button>
        )}
      </div>
      <div className="space-y-0 divide-y divide-border/60">
        {rows.map(({ icon: Icon, label, node }) => (
          <div key={label} className="flex gap-3 py-3">
            <div className="flex items-start gap-2 w-40 shrink-0 pt-1.5">
              <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground text-[12px]">{label}</span>
            </div>
            <div className="flex-1 pt-1 text-[13px]">{node}</div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <button onClick={handleCancel}
            className="px-4 py-2 bg-secondary hover:bg-secondary/70 rounded-xl transition-colors font-medium text-[13px]">
            Huỷ
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1e40af] text-white hover:opacity-90 rounded-xl transition-opacity font-medium text-[13px]">
            <Save className="w-3.5 h-3.5" /> Lưu thay đổi
          </button>
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  TAB 2: PHÂN QUYỀN & TỔ CHỨC                                    */
/* ================================================================ */
function TabRolesOrg({ account, onChangeRole }: {
  account: Account; onChangeRole: () => void;
}) {
  const roleCfg = ROLE_DISPLAY[account.role];
  const org     = MOCK_ORGS.find((o) => o.id === account.orgId);
  const orgCfg  = org ? ORG_TYPE_CFG[org.type] : null;

  return (
    <div className="space-y-4">
      {/* Vai trò */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[14px]">Vai trò & Quyền hạn</h3>
          <button onClick={onChangeRole}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/70 rounded-lg transition-colors text-[12px]">
            <ShieldCheck className="w-3.5 h-3.5" /> Đổi vai trò
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full text-[13px] font-semibold"
            style={{ color: roleCfg.color, backgroundColor: roleCfg.bg }}>
            {roleCfg.label}
          </span>
          <span className="text-[12px] text-muted-foreground">Nhóm: {roleCfg.group}</span>
        </div>
        <div className="space-y-0 divide-y divide-border/60">
          {[
            { label: "Ngày gán vai trò", value: account.roleAssignedAt ? formatDate(account.roleAssignedAt) : formatDate(account.createdAt) },
            { label: "Người thực hiện gán", value: account.roleAssignedBy ?? "system (đồng bộ tự động)" },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-3 py-3">
              <span className="text-muted-foreground text-[12px] w-44 shrink-0">{label}</span>
              <span className="text-[13px]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tổ chức */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold text-[14px] mb-4">Tổ chức</h3>
        {org && orgCfg ? (
          <div className="space-y-0 divide-y divide-border/60">
            <div className="flex gap-3 py-3">
              <span className="text-muted-foreground text-[12px] w-44 shrink-0">Tổ chức</span>
              <Link to={`/admin/organizations/${org.id}`}
                className="flex items-center gap-2 text-[13px] hover:text-[#1e40af] transition-colors">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0"
                  style={{ color: orgCfg.color, backgroundColor: orgCfg.bg }}>{orgCfg.label}</span>
                <span className="font-medium">{org.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </div>
            {org.province && (
              <div className="flex gap-3 py-3">
                <span className="text-muted-foreground text-[12px] w-44 shrink-0">Tỉnh/Thành</span>
                <span className="text-[13px]">{org.province}</span>
              </div>
            )}
            <div className="flex gap-3 py-3">
              <span className="text-muted-foreground text-[12px] w-44 shrink-0">Mã tổ chức</span>
              <span className="font-mono text-[12px]">{org.code}</span>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-[13px] italic">Không thuộc tổ chức nào</p>
        )}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TAB 3: LỊCH SỬ HOẠT ĐỘNG                                      */
/* ================================================================ */
function TabActivity({ accountId }: { accountId: string }) {
  const [actionF, setActionF] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const logs = MOCK_ACTIVITY_LOGS[accountId] ?? [];

  const filtered = useMemo(() => logs.filter((l) => {
    if (actionF && l.action !== actionF) return false;
    if (dateFrom && l.time < dateFrom) return false;
    if (dateTo   && l.time > dateTo + "T23:59:59Z") return false;
    return true;
  }), [logs, actionF, dateFrom, dateTo]);

  const filterCls = "bg-card border border-border rounded-lg px-3 py-2 text-[12px] outline-none focus:border-[#1e40af] transition-colors";

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-3 flex flex-wrap gap-2 items-center">
        <select value={actionF} onChange={(e) => setActionF(e.target.value)} className={filterCls + " cursor-pointer"}>
          <option value="">Tất cả hành động</option>
          {(Object.entries(ACTIVITY_ACTION_LABELS) as [ActivityAction, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          Từ
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={filterCls} />
          đến
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={filterCls} />
        </div>
        {(actionF || dateFrom || dateTo) && (
          <button onClick={() => { setActionF(""); setDateFrom(""); setDateTo(""); }}
            className="text-muted-foreground hover:text-foreground text-[12px] underline">
            Xoá bộ lọc
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-muted-foreground">
            <History className="w-8 h-8 opacity-20" />
            <p className="text-[13px]">Không có dữ liệu lịch sử</p>
          </div>
        ) : (
          <table className="w-full text-[12.5px]">
            <thead className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Thời gian</th>
                <th className="px-4 py-2.5 text-left">Hành động</th>
                <th className="px-4 py-2.5 text-left">Địa chỉ IP</th>
                <th className="px-4 py-2.5 text-left">Thiết bị / Trình duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(log.time)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ color: ACTION_COLOR[log.action], backgroundColor: ACTION_COLOR[log.action] + "18" }}>
                      {ACTIVITY_ACTION_LABELS[log.action]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{log.ip}</td>
                  <td className="px-4 py-3 text-muted-foreground">{log.device}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TAB 4: NHẬT KÝ THAY ĐỔI TÀI KHOẢN                            */
/* ================================================================ */
function TabChangeLogs({ accountId }: { accountId: string }) {
  const logs = MOCK_ACCOUNT_CHANGE_LOGS[accountId] ?? [];

  return (
    <div className="bg-card rounded-xl border border-border overflow-x-auto">
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-2 text-muted-foreground">
          <FileText className="w-8 h-8 opacity-20" />
          <p className="text-[13px]">Chưa có thay đổi nào được ghi nhận</p>
        </div>
      ) : (
        <table className="w-full text-[12.5px]">
          <thead className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
            <tr>
              <th className="px-4 py-2.5 text-left">Thời gian</th>
              <th className="px-4 py-2.5 text-left">SysAdmin</th>
              <th className="px-4 py-2.5 text-left">Hành động</th>
              <th className="px-4 py-2.5 text-left">Nội dung thay đổi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">{formatDateTime(log.time)}</td>
                <td className="px-4 py-3 font-mono text-[11px]">{log.admin}</td>
                <td className="px-4 py-3 font-medium">{log.action}</td>
                <td className="px-4 py-3">
                  {log.field !== "—" ? (
                    <span className="text-[12px]">
                      <span className="font-medium text-muted-foreground">{log.field}:</span>{" "}
                      <span className="line-through text-red-500/70">{log.before}</span>
                      {" → "}
                      <span className="text-green-700 font-medium">{log.after}</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">{log.after}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ================================================================ */
/*  MAIN: ACCOUNT DETAIL                                           */
/* ================================================================ */
type TabKey = "info" | "roles" | "activity" | "changelog";

const TABS: { key: TabKey; label: string; icon: typeof User }[] = [
  { key: "info",      label: "Thông tin cá nhân",       icon: User        },
  { key: "roles",     label: "Phân quyền & Tổ chức",   icon: Shield      },
  { key: "activity",  label: "Lịch sử hoạt động",       icon: History     },
  { key: "changelog", label: "Nhật ký thay đổi",        icon: FileText    },
];

export function AccountDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);
  const [tab, setTab] = useState<TabKey>("info");
  const [modal, setModal] = useState<"reset" | "lock" | "role" | null>(null);

  const account = useMemo(() => accounts.find((a) => a.id === id), [accounts, id]);

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
        <User className="w-12 h-12 opacity-20" />
        <p className="text-[14px]">Không tìm thấy tài khoản</p>
        <button onClick={() => navigate("/admin/accounts")}
          className="flex items-center gap-1.5 text-[13px] text-[#1e40af] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách
        </button>
      </div>
    );
  }

  const roleCfg   = ROLE_DISPLAY[account.role];
  const statusCfg = STATUS_DISPLAY[account.status];
  const avatarBg  = roleCfg.color + "22";
  const ini       = initials(account.name);

  const patchAccount = (patch: Partial<Account>) =>
    setAccounts((prev) => prev.map((a) => a.id === id ? { ...a, ...patch } : a));

  const handleLock = (reason: string) => {
    const next: AccountStatus = account.status === "locked" ? "active" : "locked";
    patchAccount({ status: next });
    toast.success(`${next === "locked" ? "Đã khoá" : "Đã mở khoá"} tài khoản ${account.name}`);
    if (reason) toast.info(`Lý do: ${reason}`);
    setModal(null);
  };

  const handleChangeRole = (role: StemRole, reason: string) => {
    patchAccount({ role, roleAssignedAt: new Date().toISOString(), roleAssignedBy: "khang@geleximco-stem.vn" });
    toast.success(`Đã đổi vai trò ${account.name} → ${ROLE_DISPLAY[role].label}`);
    toast.info(`Lý do: ${reason}`);
    setModal(null);
  };

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => navigate("/admin/accounts")}
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Danh sách tài khoản
      </button>

      {/* Header card */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xl"
            style={{ backgroundColor: avatarBg, color: roleCfg.color }}>
            {ini}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-[18px] leading-tight mb-1">{account.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold"
                style={{ color: roleCfg.color, backgroundColor: roleCfg.bg }}>
                {roleCfg.label}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[12px] font-semibold"
                style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusCfg.dot }} />
                {statusCfg.label}
              </span>
              <span className="text-muted-foreground text-[12px]">
                Đăng nhập cuối: {relativeTime(account.lastLogin)}
              </span>
            </div>
            <p className="text-muted-foreground font-mono text-[11px] mt-1">{account.code} · {account.email}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <button onClick={() => setModal("reset")}
              className="flex items-center gap-1.5 px-3 py-2 bg-secondary hover:bg-secondary/70 rounded-lg transition-colors text-[12px] font-medium">
              <KeyRound className="w-3.5 h-3.5" /> Đặt lại mật khẩu
            </button>
            <button onClick={() => setModal("lock")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-[12px] font-medium
                ${account.status === "locked"
                  ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                  : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"}`}>
              {account.status === "locked"
                ? <><Unlock className="w-3.5 h-3.5" /> Mở khoá</>
                : <><Lock   className="w-3.5 h-3.5" /> Khoá</>}
            </button>
            <button onClick={() => setModal("role")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1e40af] text-white hover:opacity-90 rounded-lg transition-opacity text-[12px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Đổi vai trò
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap
              ${tab === key
                ? "border-[#1e40af] text-[#1e40af]"
                : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "info"      && <TabPersonalInfo account={account} onUpdate={patchAccount} />}
      {tab === "roles"     && <TabRolesOrg account={account} onChangeRole={() => setModal("role")} />}
      {tab === "activity"  && <TabActivity accountId={account.id} />}
      {tab === "changelog" && <TabChangeLogs accountId={account.id} />}

      {/* Modals */}
      {modal === "reset" && <ResetPasswordModal account={account} onClose={() => setModal(null)} />}
      {modal === "lock"  && <LockModal account={account} onConfirm={handleLock} onClose={() => setModal(null)} />}
      {modal === "role"  && <ChangeRoleModal account={account} onSave={handleChangeRole} onClose={() => setModal(null)} />}
    </div>
  );
}
