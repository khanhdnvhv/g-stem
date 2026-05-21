import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft, Building2, School, Package, Edit2, AlertTriangle,
  Play, Pause, Search, X, Users, BarChart2, Plus, Trash2,
  History, TrendingUp, Check, Loader2, Lock, Eye, BookOpen,
  MapPin, Phone, Mail, Calendar, Hash, Briefcase,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { toast } from "@/app/lib/toast";
import { formatDate, formatDateTime } from "../ui/format";
import { OrganizationCreateDrawer } from "./OrganizationCreateDrawer";
import type { OrgType, OrgStatus, Organization, NccPermission } from "./org-data";
import {
  MOCK_ORGS, ORG_DETAILS, MOCK_ORG_USERS, MOCK_NCC_PERMISSIONS,
  MOCK_NCC_ACTIVITY, MOCK_CHANGE_LOGS, USER_ROLE_LABELS, PROVINCES_VN,
} from "./org-data";

/* ================================================================ */
/*  CONSTANTS & HELPERS                                              */
/* ================================================================ */
const TYPE_CFG: Record<OrgType, { label: string; color: string; bg: string; icon: typeof Building2 }> = {
  so_gd:  { label: "Sở GD",     color: "#1e40af", bg: "#dbeafe", icon: Building2 },
  truong: { label: "Trường học", color: "#0e7490", bg: "#cffafe", icon: School   },
  ncc:    { label: "NCC",        color: "#6d28d9", bg: "#ede9fe", icon: Package   },
};

const STATUS_CFG: Record<OrgStatus, { label: string; color: string; bg: string; dot: string }> = {
  active:    { label: "Đang hoạt động", color: "#15803d", bg: "#dcfce7", dot: "#15803d" },
  suspended: { label: "Tạm ngừng",      color: "#dc2626", bg: "#fee2e2", dot: "#dc2626" },
  trial:     { label: "Dùng thử",       color: "#b45309", bg: "#fef3c7", dot: "#d97706" },
};

const NCC_TYPE_LABELS: Record<string, string> = {
  content: "Nội dung",
  device:  "Thiết bị",
  both:    "Nội dung & Thiết bị",
};

function TypeBadge({ type }: { type: OrgType }) {
  const c = TYPE_CFG[type];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ color: c.color, backgroundColor: c.bg }}>
      <c.icon className="w-3 h-3" /> {c.label}
    </span>
  );
}

function StatusBadge({ status }: { status: OrgStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ color: c.color, backgroundColor: c.bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {c.label}
    </span>
  );
}

const inputCls = "w-full bg-background border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1e40af] transition-colors";
const selectCls = inputCls + " cursor-pointer";

/* ================================================================ */
/*  INFO ROW                                                         */
/* ================================================================ */
function InfoRow({ icon: Icon, label, value, isLink, linkTo, editing, editNode }: {
  icon?: typeof Building2; label: string; value?: string; isLink?: boolean; linkTo?: string;
  editing?: boolean; editNode?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 py-3 border-b border-border/60 last:border-0">
      <div className="flex items-start gap-2 w-44 shrink-0 pt-0.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />}
        <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{label}</span>
      </div>
      <div className="flex-1">
        {editing && editNode ? (
          editNode
        ) : isLink && linkTo ? (
          <Link to={linkTo} className="text-[#1e40af] hover:underline font-medium" style={{ fontSize: "13px" }}>{value || "—"}</Link>
        ) : (
          <span className="font-medium" style={{ fontSize: "13px" }}>{value || "—"}</span>
        )}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  SUSPEND MODAL                                                   */
/* ================================================================ */
function SuspendModal({ org, onClose, onConfirm }: {
  org: Organization; onClose: () => void; onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const children = MOCK_ORGS.filter((o) => o.parentId === org.id);
  const affectedUsers = org.type === "so_gd"
    ? org.userCount + children.reduce((s, c) => s + c.userCount, 0)
    : org.userCount;

  const submit = () => {
    if (!reason.trim()) { toast.error("Vui lòng nhập lý do đình chỉ"); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm(reason);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground" style={{ fontSize: "16px" }}>Xác nhận đình chỉ tổ chức</h2>
            <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
              Bạn sắp đình chỉ <strong>{org.name}</strong>.
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1" style={{ fontSize: "13px" }}>
          {org.type === "so_gd" && children.length > 0 && (
            <p className="text-red-700 font-medium">
              ⚠ Toàn bộ {children.length} trường trực thuộc cũng sẽ bị ảnh hưởng.
            </p>
          )}
          <p className="text-red-600">
            <strong>{affectedUsers.toLocaleString("vi-VN")} người dùng</strong> sẽ không thể đăng nhập cho đến khi tổ chức được kích hoạt lại.
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-[12px] font-medium">
            Lý do đình chỉ <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do đình chỉ tổ chức..."
            rows={3}
            className={inputCls + " resize-none"}
            autoFocus
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-secondary hover:bg-secondary/70 rounded-xl transition-colors font-medium"
            style={{ fontSize: "13px" }}>
            Huỷ
          </button>
          <button onClick={submit} disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ fontSize: "13px" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />}
            Xác nhận đình chỉ
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  REACTIVATE MODAL                                                 */
/* ================================================================ */
function ReactivateModal({ org, onClose, onConfirm }: {
  org: Organization; onClose: () => void; onConfirm: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const submit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onConfirm(); }, 600);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <Play className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold" style={{ fontSize: "16px" }}>Kích hoạt lại</h2>
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Kích hoạt lại <strong>{org.name}</strong>?</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-secondary hover:bg-secondary/70 rounded-xl transition-colors font-medium"
            style={{ fontSize: "13px" }}>
            Huỷ
          </button>
          <button onClick={submit} disabled={loading}
            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ fontSize: "13px" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Kích hoạt lại
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  CHANGE LOG TAB                                                  */
/* ================================================================ */
function ChangeLogTab({ orgId }: { orgId: string }) {
  const logs = MOCK_CHANGE_LOGS[orgId] ?? [];
  if (!logs.length) {
    return (
      <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-16 gap-3">
        <History className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-muted-foreground text-sm">Chưa có lịch sử thay đổi</p>
      </div>
    );
  }
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <table className="w-full">
        <thead className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
          <tr>
            <th className="px-4 py-2.5 text-left">Thời gian</th>
            <th className="px-4 py-2.5 text-left">Người thực hiện</th>
            <th className="px-4 py-2.5 text-left">Hành động</th>
            <th className="px-4 py-2.5 text-left">Trường thay đổi</th>
            <th className="px-4 py-2.5 text-left">Nội dung</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-[12.5px]">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDateTime(log.time)}</td>
              <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{log.actor}</td>
              <td className="px-4 py-3 font-medium">{log.action}</td>
              <td className="px-4 py-3 text-muted-foreground">{log.field}</td>
              <td className="px-4 py-3">
                {log.before !== "—" ? (
                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-[11px] line-through">{log.before}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[11px]">{log.after}</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px]">{log.after}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================ */
/*  SỞ GD — TAB 1: THÔNG TIN CHUNG                                  */
/* ================================================================ */
function SoGdInfoTab({ org, details, onSaved }: {
  org: Organization;
  details: ReturnType<typeof getDetails>;
  onSaved: (d: Partial<ReturnType<typeof getDetails>>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...details, province: details.province ?? org.province });

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSaved(form);
      setEditing(false);
      toast.success("Đã lưu thay đổi thông tin tổ chức");
    }, 700);
  };

  const cancel = () => { setForm({ ...details }); setEditing(false); };

  const field = (key: keyof typeof form, label: string, icon: typeof Building2, type = "text") => (
    <InfoRow icon={icon} label={label} value={form[key] as string}
      editing={editing}
      editNode={
        <input type={type} value={form[key] as string}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className={inputCls} />
      }
    />
  );

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Thông tin tổ chức</p>
            <InfoRow icon={Building2} label="Tên Sở" value={org.name} />
            <InfoRow icon={Hash}      label="Mã Sở"  value={org.code} />
            <InfoRow icon={MapPin}    label="Tỉnh/thành" value={org.province}
              editing={editing}
              editNode={
                <select value={form.province ?? ""} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                  className={selectCls}>
                  {PROVINCES_VN.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              }
            />
            {field("address", "Địa chỉ", MapPin)}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Đầu mối liên hệ</p>
            {field("contactName",  "Họ tên đầu mối",  Users)}
            {field("contactEmail", "Email đầu mối",   Mail, "email")}
            {field("contactPhone", "Số điện thoại",   Phone)}
            <InfoRow icon={Calendar} label="Ngày tạo"           value={formatDate(org.createdAt)} />
            <InfoRow icon={Calendar} label="Cập nhật cuối"      value={details.updatedAt ? formatDate(details.updatedAt) : "—"} />
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-border flex items-center gap-2">
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1e40af] text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa thông tin
            </button>
          ) : (
            <>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Lưu thay đổi
              </button>
              <button onClick={cancel}
                className="px-4 py-2 bg-secondary hover:bg-secondary/70 rounded-lg transition-colors"
                style={{ fontSize: "13px" }}>
                Huỷ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  SỞ GD — TAB 2: TRƯỜNG TRỰC THUỘC                               */
/* ================================================================ */
function SchoolsTab({ parentId }: { parentId: string }) {
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState<OrgStatus | "all">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const schools = useMemo(() =>
    MOCK_ORGS.filter((o) => o.type === "truong" && o.parentId === parentId)
      .filter((o) => {
        if (statusF !== "all" && o.status !== statusF) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!o.name.toLowerCase().includes(q) && !o.code.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
  [parentId, search, statusF]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm trường..."
            className="bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-[13px] outline-none focus:border-[#1e40af] transition-colors w-full" />
          {search && <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>}
        </div>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value as OrgStatus | "all")}
          className="bg-card border border-border rounded-lg px-3 py-2 text-[13px] cursor-pointer outline-none focus:border-[#1e40af]">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="suspended">Tạm ngừng</option>
          <option value="trial">Dùng thử</option>
        </select>
        <button onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#1e40af] text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ fontSize: "13px", fontWeight: 500 }}>
          <Plus className="w-4 h-4" /> Thêm Trường mới
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
            <tr>
              <th className="px-4 py-2.5 text-left">Tên Trường</th>
              <th className="px-4 py-2.5 text-left">Mã</th>
              <th className="px-4 py-2.5 text-left">Bậc học</th>
              <th className="px-4 py-2.5 text-left">Trạng thái</th>
              <th className="px-4 py-2.5 text-right">Số người dùng</th>
              <th className="px-4 py-2.5 text-left">Ngày tạo</th>
              <th className="px-4 py-2.5 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-[12.5px]">
            {schools.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted-foreground py-12 text-sm">Không tìm thấy trường nào</td></tr>
            ) : schools.map((s) => (
              <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/admin/organizations/${s.id}`} className="font-medium hover:text-[#990803] transition-colors">
                    {s.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-muted-foreground text-[11px]">{s.code}</td>
                <td className="px-4 py-3 text-muted-foreground">{ORG_DETAILS[s.id]?.educationLevel ?? "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>{s.userCount.toLocaleString("vi-VN")}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(s.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link to={`/admin/organizations/${s.id}`}
                    className="flex items-center gap-1 text-[#1e40af] hover:underline text-[12px]">
                    <Eye className="w-3.5 h-3.5" /> Xem
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OrganizationCreateDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSuccess={() => {}} />
    </div>
  );
}

/* ================================================================ */
/*  SỞ GD — TAB 3: NCC ĐƯỢC PHÉP                                   */
/* ================================================================ */
function AddNccModal({ existingIds, onAdd, onClose }: {
  existingIds: string[]; onAdd: (ncc: NccPermission) => void; onClose: () => void;
}) {
  const all = MOCK_ORGS.filter((o) => o.type === "ncc" && !existingIds.includes(o.id));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold" style={{ fontSize: "15px" }}>Thêm NCC được phép</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        {all.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-6">Tất cả NCC đã được cấp quyền</p>
        ) : (
          <div className="space-y-2">
            {all.map((ncc) => {
              const det = ORG_DETAILS[ncc.id];
              const nccType = det?.nccType ?? "content";
              return (
                <button key={ncc.id}
                  onClick={() => onAdd({ nccId: ncc.id, nccName: ncc.name, nccType, grantedAt: new Date().toISOString() })}
                  className="w-full flex items-center justify-between p-3 bg-secondary hover:bg-secondary/70 rounded-xl transition-colors text-left">
                  <div>
                    <p className="font-medium text-[13px]">{ncc.name}</p>
                    <p className="text-muted-foreground text-[11px]">{NCC_TYPE_LABELS[nccType]} · {ncc.code}</p>
                  </div>
                  <Plus className="w-4 h-4 text-[#1e40af]" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function NccPermissionsTab({ orgId }: { orgId: string }) {
  const [perms, setPerms] = useState<NccPermission[]>(() => MOCK_NCC_PERMISSIONS[orgId] ?? []);
  const [showAdd, setShowAdd] = useState(false);

  const revoke = (nccId: string) => {
    setPerms((p) => p.filter((x) => x.nccId !== nccId));
    toast.success("Đã thu hồi quyền NCC");
  };

  const add = (ncc: NccPermission) => {
    setPerms((p) => [...p, ncc]);
    setShowAdd(false);
    toast.success(`Đã cấp quyền cho ${ncc.nccName}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#1e40af] text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ fontSize: "13px", fontWeight: 500 }}>
          <Plus className="w-4 h-4" /> Thêm NCC
        </button>
      </div>

      {perms.length === 0 ? (
        <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-16 gap-3">
          <Package className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">Chưa có NCC nào được cấp quyền</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
              <tr>
                <th className="px-4 py-2.5 text-left">Tên NCC</th>
                <th className="px-4 py-2.5 text-left">Loại</th>
                <th className="px-4 py-2.5 text-left">Ngày cấp quyền</th>
                <th className="px-4 py-2.5 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-[12.5px]">
              {perms.map((p) => (
                <tr key={p.nccId} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/admin/organizations/${p.nccId}`} className="font-medium hover:text-[#990803] transition-colors">{p.nccName}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded-full text-[11px] font-medium">
                      {NCC_TYPE_LABELS[p.nccType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.grantedAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => revoke(p.nccId)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 text-[12px] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Thu hồi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <AddNccModal existingIds={perms.map((p) => p.nccId)} onAdd={add} onClose={() => setShowAdd(false)} />}
    </div>
  );
}

/* ================================================================ */
/*  SỞ GD — TAB 4: THỐNG KÊ                                        */
/* ================================================================ */
function StatsTab({ org }: { org: Organization }) {
  const children = MOCK_ORGS.filter((o) => o.parentId === org.id);
  const totalUsers = org.userCount + children.reduce((s, c) => s + c.userCount, 0);
  const nccCount = (MOCK_NCC_PERMISSIONS[org.id] ?? []).length;

  const chartData = useMemo(() => {
    const months = ["T6/24","T7/24","T8/24","T9/24","T10/24","T11/24","T12/24","T1/25","T2/25","T3/25","T4/25","T5/25"];
    const base = Math.round(totalUsers * 0.4);
    return months.map((month, i) => ({
      month,
      "Học sinh": Math.round(base * 0.7 + base * 0.3 * (i / 11) + Math.random() * 50),
      "Giáo viên": Math.round(base * 0.2 + base * 0.05 * (i / 11) + Math.random() * 20),
      "Quản lý": Math.round(base * 0.05 + Math.random() * 5),
    }));
  }, [totalUsers]);

  const kpis = [
    { label: "Tổng số Trường",      value: children.length,                  color: "#0e7490", icon: School   },
    { label: "Tổng người dùng",     value: totalUsers.toLocaleString("vi-VN"), color: "#1e40af", icon: Users    },
    { label: "NCC đang hoạt động",  value: nccCount,                          color: "#6d28d9", icon: Package  },
    { label: "Trường đang hoạt động", value: children.filter((c) => c.status === "active").length, color: "#15803d", icon: TrendingUp },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: color + "18" }}>
              <Icon className="w-4.5 h-4.5" style={{ color, width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{label}</p>
              <p style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1.2 }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-muted-foreground" />
          <p className="font-semibold" style={{ fontSize: "14px" }}>Tăng trưởng người dùng (12 tháng gần nhất)</p>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="Học sinh"  stroke="#0e7490" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Giáo viên" stroke="#1e40af" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Quản lý"   stroke="#6d28d9" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TRƯỜNG — TAB 1: THÔNG TIN CHUNG                                */
/* ================================================================ */
function TruongInfoTab({ org, details, onSaved }: {
  org: Organization;
  details: ReturnType<typeof getDetails>;
  onSaved: (d: Partial<typeof details>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...details });
  const parentOrg = org.parentId ? MOCK_ORGS.find((o) => o.id === org.parentId) : null;

  const save = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); onSaved(form); setEditing(false); toast.success("Đã lưu thay đổi"); }, 700);
  };
  const cancel = () => { setForm({ ...details }); setEditing(false); };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Thông tin Trường</p>
            <InfoRow icon={School}  label="Tên Trường" value={org.name} />
            <InfoRow icon={Hash}    label="Mã Trường"  value={org.code} />
            <InfoRow icon={BookOpen} label="Bậc học"
              value={form.educationLevel}
              editing={editing}
              editNode={
                <select value={form.educationLevel ?? ""} onChange={(e) => setForm((f) => ({ ...f, educationLevel: e.target.value }))}
                  className={selectCls}>
                  {["Mầm non","Tiểu học","THCS","THPT"].map((l) => <option key={l}>{l}</option>)}
                </select>
              }
            />
            <InfoRow icon={Building2} label="Sở GD cha"
              value={parentOrg?.name}
              isLink={!!parentOrg}
              linkTo={parentOrg ? `/admin/organizations/${parentOrg.id}` : undefined}
            />
            <InfoRow icon={MapPin} label="Tỉnh/thành" value={org.province}
              editing={editing}
              editNode={
                <select value={form.province ?? org.province ?? ""} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                  className={selectCls}>
                  {PROVINCES_VN.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              }
            />
            <InfoRow icon={MapPin} label="Địa chỉ" value={form.address}
              editing={editing}
              editNode={<input value={form.address ?? ""} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className={inputCls} />}
            />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Đầu mối liên hệ</p>
            <InfoRow icon={Users}  label="Họ tên" value={form.contactName}
              editing={editing}
              editNode={<input value={form.contactName ?? ""} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} className={inputCls} />}
            />
            <InfoRow icon={Mail}   label="Email" value={form.contactEmail}
              editing={editing}
              editNode={<input type="email" value={form.contactEmail ?? ""} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} className={inputCls} />}
            />
            <InfoRow icon={Phone}  label="Số điện thoại" value={form.contactPhone}
              editing={editing}
              editNode={<input value={form.contactPhone ?? ""} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} className={inputCls} />}
            />
            <InfoRow icon={Calendar} label="Ngày tạo"     value={formatDate(org.createdAt)} />
            <InfoRow icon={Calendar} label="Cập nhật cuối" value={details.updatedAt ? formatDate(details.updatedAt) : "—"} />
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-border flex items-center gap-2">
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0e7490] text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa thông tin
            </button>
          ) : (
            <>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Lưu thay đổi
              </button>
              <button onClick={cancel}
                className="px-4 py-2 bg-secondary hover:bg-secondary/70 rounded-lg transition-colors"
                style={{ fontSize: "13px" }}>
                Huỷ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TRƯỜNG — TAB 2: NGƯỜI DÙNG                                     */
/* ================================================================ */
function UsersTab({ orgId }: { orgId: string }) {
  const allUsers = MOCK_ORG_USERS[orgId] ?? [];
  const [roleF, setRoleF] = useState("all");
  const [statusF, setStatusF] = useState("all");

  const filtered = allUsers.filter((u) => {
    if (roleF !== "all" && u.role !== roleF) return false;
    if (statusF !== "all" && u.status !== statusF) return false;
    return true;
  });

  const roleCounts = allUsers.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  const roleColors: Record<string, string> = {
    school_principal: "#1e40af", school_admin: "#0e7490", teacher: "#6d28d9", student: "#15803d",
  };

  return (
    <div className="space-y-3">
      {/* Role summary chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(USER_ROLE_LABELS).map(([role, label]) => (
          <span key={role} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium border border-border bg-card">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: roleColors[role] }} />
            {label}: <strong>{roleCounts[role] ?? 0}</strong>
          </span>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={roleF} onChange={(e) => setRoleF(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-[13px] cursor-pointer outline-none focus:border-[#1e40af]">
          <option value="all">Tất cả vai trò</option>
          {Object.entries(USER_ROLE_LABELS).map(([r, l]) => <option key={r} value={r}>{l}</option>)}
        </select>
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-[13px] cursor-pointer outline-none focus:border-[#1e40af]">
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="locked">Đã khoá</option>
        </select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
            <tr>
              <th className="px-4 py-2.5 text-left">Họ tên</th>
              <th className="px-4 py-2.5 text-left">Email</th>
              <th className="px-4 py-2.5 text-left">Vai trò</th>
              <th className="px-4 py-2.5 text-left">Trạng thái</th>
              <th className="px-4 py-2.5 text-left">Đăng nhập cuối</th>
              <th className="px-4 py-2.5 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-[12.5px]">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted-foreground py-12 text-sm">
                {allUsers.length === 0 ? "Chưa có dữ liệu người dùng mẫu" : "Không tìm thấy người dùng"}
              </td></tr>
            ) : filtered.map((u) => (
              <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{ backgroundColor: roleColors[u.role] + "18", color: roleColors[u.role] }}>
                    {USER_ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.status === "active"
                    ? <span className="flex items-center gap-1 text-green-700 text-[11px] font-medium"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />Hoạt động</span>
                    : <span className="flex items-center gap-1 text-red-600 text-[11px] font-medium"><Lock className="w-3 h-3" />Đã khoá</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDateTime(u.lastLogin)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 text-[#1e40af] text-[12px] hover:underline"
                      onClick={() => toast.info(`Xem hồ sơ: ${u.name}`)}>
                      <Eye className="w-3.5 h-3.5" /> Hồ sơ
                    </button>
                    <button className="flex items-center gap-1 text-red-600 text-[12px] hover:underline"
                      onClick={() => toast.warning(`${u.status === "active" ? "Khoá" : "Mở khoá"}: ${u.name}`)}>
                      <Lock className="w-3.5 h-3.5" /> {u.status === "active" ? "Khoá" : "Mở khoá"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  NCC — TAB 1: THÔNG TIN CHUNG                                   */
/* ================================================================ */
function NccInfoTab({ org, details, onSaved }: {
  org: Organization;
  details: ReturnType<typeof getDetails>;
  onSaved: (d: Partial<typeof details>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...details });

  const save = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); onSaved(form); setEditing(false); toast.success("Đã lưu thay đổi"); }, 700);
  };
  const cancel = () => { setForm({ ...details }); setEditing(false); };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Thông tin NCC</p>
            <InfoRow icon={Package}   label="Tên NCC"  value={org.name} />
            <InfoRow icon={Hash}      label="Mã NCC"   value={org.code} />
            <InfoRow icon={Briefcase} label="Loại NCC"
              value={NCC_TYPE_LABELS[form.nccType ?? "content"]}
              editing={editing}
              editNode={
                <select value={form.nccType ?? "content"} onChange={(e) => setForm((f) => ({ ...f, nccType: e.target.value as "content"|"device"|"both" }))}
                  className={selectCls}>
                  <option value="content">Nội dung</option>
                  <option value="device">Thiết bị</option>
                  <option value="both">Nội dung & Thiết bị</option>
                </select>
              }
            />
            <InfoRow icon={Hash} label="Mã số thuế" value={form.taxCode}
              editing={editing}
              editNode={<input value={form.taxCode ?? ""} onChange={(e) => setForm((f) => ({ ...f, taxCode: e.target.value }))} className={inputCls} />}
            />
            <InfoRow icon={MapPin} label="Địa chỉ" value={form.address}
              editing={editing}
              editNode={<input value={form.address ?? ""} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} className={inputCls} />}
            />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Liên hệ & Pháp lý</p>
            <InfoRow icon={Users}  label="Người đại diện" value={form.legalRepName}
              editing={editing}
              editNode={<input value={form.legalRepName ?? ""} onChange={(e) => setForm((f) => ({ ...f, legalRepName: e.target.value }))} className={inputCls} />}
            />
            <InfoRow icon={Briefcase} label="Chức vụ" value={form.legalRepTitle}
              editing={editing}
              editNode={<input value={form.legalRepTitle ?? ""} onChange={(e) => setForm((f) => ({ ...f, legalRepTitle: e.target.value }))} className={inputCls} />}
            />
            <InfoRow icon={Mail}   label="Email đầu mối" value={form.contactEmail}
              editing={editing}
              editNode={<input type="email" value={form.contactEmail ?? ""} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} className={inputCls} />}
            />
            <InfoRow icon={Phone}  label="Số điện thoại" value={form.contactPhone}
              editing={editing}
              editNode={<input value={form.contactPhone ?? ""} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} className={inputCls} />}
            />
            <InfoRow icon={Calendar} label="Ngày tạo"     value={formatDate(org.createdAt)} />
            <InfoRow icon={Calendar} label="Cập nhật cuối" value={details.updatedAt ? formatDate(details.updatedAt) : "—"} />
          </div>
        </div>

        {/* Ghi chú nội bộ (full width) */}
        <div className="mt-4 pt-4 border-t border-border/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Ghi chú nội bộ</p>
          {editing ? (
            <textarea value={form.internalNote ?? ""} rows={3}
              onChange={(e) => setForm((f) => ({ ...f, internalNote: e.target.value }))}
              className={inputCls + " resize-none"} />
          ) : (
            <p className="text-[13px] text-foreground">{form.internalNote || <span className="text-muted-foreground italic">Chưa có ghi chú</span>}</p>
          )}
        </div>

        <div className="pt-4 mt-2 border-t border-border flex items-center gap-2">
          {!editing ? (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#6d28d9] text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa thông tin
            </button>
          ) : (
            <>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-70"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Lưu thay đổi
              </button>
              <button onClick={cancel}
                className="px-4 py-2 bg-secondary hover:bg-secondary/70 rounded-lg transition-colors"
                style={{ fontSize: "13px" }}>
                Huỷ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  NCC — TAB 2: HOẠT ĐỘNG                                         */
/* ================================================================ */
function NccActivityTab({ orgId }: { orgId: string }) {
  const activity = MOCK_NCC_ACTIVITY[orgId];
  if (!activity) return <p className="text-muted-foreground text-sm text-center py-8">Không có dữ liệu</p>;

  const kpis = [
    { label: "Chương trình đã đăng", value: activity.programs,  color: "#1e40af", icon: BookOpen },
    { label: "Học liệu đã tải lên",  value: activity.materials, color: "#0e7490", icon: TrendingUp },
    { label: "Trường đã mua nội dung", value: activity.schools,  color: "#15803d", icon: School   },
    { label: "Báo cáo vi phạm",       value: activity.violations, color: activity.violations > 0 ? "#dc2626" : "#6b7280", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 relative"
              style={{ backgroundColor: color + "18" }}>
              <Icon className="w-4.5 h-4.5" style={{ color, width: 18, height: 18 }} />
              {label === "Báo cáo vi phạm" && value > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{value}</span>
              )}
            </div>
            <div>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{label}</p>
              <p style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1.2, color: label === "Báo cáo vi phạm" && value > 0 ? "#dc2626" : undefined }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="font-semibold" style={{ fontSize: "13px" }}>Sở GD đã cấp quyền truy cập</p>
        </div>
        <table className="w-full">
          <thead className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
            <tr>
              <th className="px-4 py-2.5 text-left">Tên Sở GD</th>
              <th className="px-4 py-2.5 text-left">Ngày cấp quyền</th>
              <th className="px-4 py-2.5 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-[12.5px]">
            {activity.soPermissions.length === 0 ? (
              <tr><td colSpan={3} className="text-center text-muted-foreground py-8 text-sm">Chưa có Sở GD nào cấp quyền</td></tr>
            ) : activity.soPermissions.map((s) => (
              <tr key={s.soId} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/admin/organizations/${s.soId}`} className="font-medium hover:text-[#990803] transition-colors">{s.soName}</Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(s.grantedAt)}</td>
                <td className="px-4 py-3">
                  <Link to={`/admin/organizations/${s.soId}`} className="flex items-center gap-1 text-[#1e40af] text-[12px] hover:underline">
                    <Eye className="w-3.5 h-3.5" /> Xem Sở
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  HELPER to get + merge details                                   */
/* ================================================================ */
function getDetails(orgId: string) {
  return ORG_DETAILS[orgId] ?? {};
}

/* ================================================================ */
/*  MAIN COMPONENT                                                  */
/* ================================================================ */
export function OrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const org = MOCK_ORGS.find((o) => o.id === id);

  const [orgStatus, setOrgStatus] = useState<OrgStatus>(() => org?.status ?? "active");
  const [details, setDetails] = useState(() => getDetails(id ?? ""));
  const [activeTab, setActiveTab] = useState(0);
  const [showSuspend, setShowSuspend] = useState(false);
  const [showReactivate, setShowReactivate] = useState(false);

  // Reset tab when navigating between orgs
  useEffect(() => { setActiveTab(0); setDetails(getDetails(id ?? "")); }, [id]);

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Building2 className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Không tìm thấy tổ chức</p>
        <button onClick={() => navigate("/admin/organizations")}
          className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/70 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </button>
      </div>
    );
  }

  const typeCfg = TYPE_CFG[org.type];

  const tabs = org.type === "so_gd"
    ? ["Thông tin chung", "Trường trực thuộc", "NCC được phép", "Thống kê", "Lịch sử thay đổi"]
    : org.type === "truong"
    ? ["Thông tin chung", "Người dùng", "Lịch sử thay đổi"]
    : ["Thông tin chung", "Hoạt động", "Lịch sử thay đổi"];

  const handleSuspendConfirm = (_reason: string) => {
    setOrgStatus("suspended");
    setShowSuspend(false);
    toast.success(`Đã đình chỉ ${org.name}`);
  };

  const handleReactivateConfirm = () => {
    setOrgStatus("active");
    setShowReactivate(false);
    toast.success(`Đã kích hoạt lại ${org.name}`);
  };

  const mergedOrg = { ...org, status: orgStatus };

  return (
    <div className="space-y-5">
      {/* ===== HEADER ===== */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2">
            <button
              onClick={() => navigate("/admin/organizations")}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontSize: "13px" }}>
              <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: typeCfg.color + "18" }}>
                <typeCfg.icon className="w-5 h-5" style={{ color: typeCfg.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-bold text-foreground" style={{ fontSize: "22px" }}>{org.name}</h1>
                  <span className="text-muted-foreground font-mono" style={{ fontSize: "12px" }}>{org.code}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <TypeBadge type={org.type} />
                  <StatusBadge status={orgStatus} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:mt-6">
            {orgStatus !== "suspended" ? (
              <button onClick={() => setShowSuspend(true)}
                className="flex items-center gap-1.5 px-3 py-2 border border-red-300 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <Pause className="w-4 h-4" /> Đình chỉ
              </button>
            ) : (
              <button onClick={() => setShowReactivate(true)}
                className="flex items-center gap-1.5 px-3 py-2 border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <Play className="w-4 h-4" /> Kích hoạt lại
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== TABS NAV ===== */}
      <div className="flex gap-0.5 bg-secondary/50 rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg transition-colors font-medium ${
              activeTab === i ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontSize: "13px" }}>
            {tab}
          </button>
        ))}
      </div>

      {/* ===== TAB CONTENT ===== */}
      {org.type === "so_gd" && (
        <>
          {activeTab === 0 && <SoGdInfoTab org={mergedOrg} details={details} onSaved={(d) => setDetails((p) => ({ ...p, ...d }))} />}
          {activeTab === 1 && <SchoolsTab parentId={org.id} />}
          {activeTab === 2 && <NccPermissionsTab orgId={org.id} />}
          {activeTab === 3 && <StatsTab org={mergedOrg} />}
          {activeTab === 4 && <ChangeLogTab orgId={org.id} />}
        </>
      )}
      {org.type === "truong" && (
        <>
          {activeTab === 0 && <TruongInfoTab org={mergedOrg} details={details} onSaved={(d) => setDetails((p) => ({ ...p, ...d }))} />}
          {activeTab === 1 && <UsersTab orgId={org.id} />}
          {activeTab === 2 && <ChangeLogTab orgId={org.id} />}
        </>
      )}
      {org.type === "ncc" && (
        <>
          {activeTab === 0 && <NccInfoTab org={mergedOrg} details={details} onSaved={(d) => setDetails((p) => ({ ...p, ...d }))} />}
          {activeTab === 1 && <NccActivityTab orgId={org.id} />}
          {activeTab === 2 && <ChangeLogTab orgId={org.id} />}
        </>
      )}

      {/* ===== MODALS ===== */}
      {showSuspend && (
        <SuspendModal org={mergedOrg} onClose={() => setShowSuspend(false)} onConfirm={handleSuspendConfirm} />
      )}
      {showReactivate && (
        <ReactivateModal org={mergedOrg} onClose={() => setShowReactivate(false)} onConfirm={handleReactivateConfirm} />
      )}
    </div>
  );
}
