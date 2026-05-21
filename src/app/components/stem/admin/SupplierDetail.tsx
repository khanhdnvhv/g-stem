import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  Factory, ArrowLeft, Edit2, Ban, RotateCcw, Save, X,
  Building2, AlertTriangle, Plus, Eye, Lock, Clock,
  CheckCircle, ChevronRight,
} from "lucide-react";
import { formatDate, formatRelative } from "../ui/format";
import {
  MOCK_ORGS, ORG_DETAILS, MOCK_NCC_ACTIVITY, MOCK_CHANGE_LOGS,
} from "./org-data";
import { MOCK_ACCOUNTS, ROLE_DISPLAY, STATUS_DISPLAY } from "./account-data";
import { toast } from "@/app/lib/toast";
import { NccSuspendModal } from "./NccSuspendModal";

/* ================================================================ */
/*  CONSTANTS                                                       */
/* ================================================================ */
type NccType = "content" | "device" | "both";

const NCC_TYPE_CFG: Record<NccType, { label: string; color: string; bg: string }> = {
  content: { label: "Nội dung",         color: "#1d4ed8", bg: "#dbeafe" },
  device:  { label: "Thiết bị",         color: "#c2410c", bg: "#ffedd5" },
  both:    { label: "Nội dung & Thiết bị", color: "#7c3aed", bg: "#ede9fe" },
};

const STATUS_CFG = {
  active:    { label: "Đang hoạt động", color: "#15803d", bg: "#dcfce7", dot: "#15803d" },
  suspended: { label: "Tạm ngừng",      color: "#dc2626", bg: "#fee2e2", dot: "#dc2626" },
  trial:     { label: "Dùng thử",       color: "#b45309", bg: "#fef3c7", dot: "#d97706" },
};

type OrgStatus = "active" | "suspended" | "trial";

function getInitials(name: string) {
  return name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  return local.slice(0, 3) + "***@" + domain;
}

const FIELD = "w-full px-3 py-2 border border-border rounded-lg bg-background text-[13px] focus:outline-none focus:ring-2 focus:ring-[#92400e]/30 focus:border-[#92400e]";
const LABEL = "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block";

/* ================================================================ */
/*  TAB 1: THÔNG TIN CHUNG                                         */
/* ================================================================ */
interface InfoDraft {
  name: string; nccType: NccType; taxCode: string; address: string;
  legalRepName: string; legalRepTitle: string; contactEmail: string;
  contactPhone: string; internalNote: string;
}

function TabInfo({ nccId }: { nccId: string }) {
  const org     = MOCK_ORGS.find((o) => o.id === nccId)!;
  const details = ORG_DETAILS[nccId] ?? {};

  const initial: InfoDraft = {
    name:          org.name,
    nccType:       (details.nccType ?? "content") as NccType,
    taxCode:       details.taxCode ?? "",
    address:       details.address ?? "",
    legalRepName:  details.legalRepName ?? "",
    legalRepTitle: details.legalRepTitle ?? "",
    contactEmail:  details.contactEmail ?? "",
    contactPhone:  details.contactPhone ?? "",
    internalNote:  details.internalNote ?? "",
  };

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft]         = useState<InfoDraft>(initial);

  const set = (k: keyof InfoDraft, v: string) => setDraft((p) => ({ ...p, [k]: v }));

  const save = () => { setIsEditing(false); toast.success("Đã lưu thông tin NCC"); };
  const cancel = () => { setDraft(initial); setIsEditing(false); };

  const ROW = "grid grid-cols-3 gap-4 py-3 border-b border-border/60 last:border-0 items-start";
  const VAL = "col-span-2 text-[13px]";

  const VIEW = (value: string, italic?: boolean) => (
    <span className={`${italic ? "italic text-muted-foreground" : ""}`}>{value || "—"}</span>
  );

  return (
    <div className="p-5 space-y-4">
      {/* Edit bar */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-muted-foreground">
          {isEditing ? "Đang chỉnh sửa — thay đổi chưa được lưu" : `Cập nhật lần cuối: ${details.updatedAt ? formatDate(details.updatedAt) : "—"}`}
        </p>
        {isEditing ? (
          <div className="flex gap-2">
            <button onClick={cancel}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-[12.5px] hover:bg-secondary transition-colors">
              <X className="w-3.5 h-3.5" /> Huỷ
            </button>
            <button onClick={save}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold text-white transition-colors"
              style={{ backgroundColor: "#92400e" }}>
              <Save className="w-3.5 h-3.5" /> Lưu thay đổi
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-[12.5px] hover:bg-secondary transition-colors">
            <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl divide-y divide-border/60">
        {/* Tên NCC */}
        <div className={ROW + " px-4"}>
          <label className={LABEL + " col-span-1 pt-0.5"}>Tên NCC</label>
          <div className={VAL}>
            {isEditing
              ? <input className={FIELD} value={draft.name} onChange={(e) => set("name", e.target.value)} />
              : VIEW(draft.name)}
          </div>
        </div>

        {/* Mã NCC */}
        <div className={ROW + " px-4"}>
          <label className={LABEL + " col-span-1 pt-0.5"}>Mã NCC</label>
          <div className={VAL}>
            <span className="font-mono text-[13px]">{org.code}</span>
            <span className="ml-2 text-[11px] text-muted-foreground">(không thể thay đổi)</span>
          </div>
        </div>

        {/* Loại NCC */}
        <div className={ROW + " px-4"}>
          <label className={LABEL + " col-span-1 pt-0.5"}>Loại NCC</label>
          <div className={VAL}>
            {isEditing ? (
              <div className="flex gap-3">
                {(["content","device","both"] as NccType[]).map((t) => {
                  const cfg = NCC_TYPE_CFG[t];
                  return (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer text-[12.5px]">
                      <input type="radio" name="nccType" value={t}
                        checked={draft.nccType === t}
                        onChange={() => set("nccType", t)}
                        className="accent-[#92400e]" />
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{ color: cfg.color, backgroundColor: cfg.bg }}>{cfg.label}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ color: NCC_TYPE_CFG[draft.nccType].color, backgroundColor: NCC_TYPE_CFG[draft.nccType].bg }}>
                {NCC_TYPE_CFG[draft.nccType].label}
              </span>
            )}
          </div>
        </div>

        {/* Mã số thuế */}
        <div className={ROW + " px-4"}>
          <label className={LABEL + " col-span-1 pt-0.5"}>Mã số thuế</label>
          <div className={VAL}>
            {isEditing
              ? <input className={FIELD} value={draft.taxCode} onChange={(e) => set("taxCode", e.target.value)} placeholder="10 chữ số" />
              : <span className="font-mono">{VIEW(draft.taxCode)}</span>}
          </div>
        </div>

        {/* Địa chỉ */}
        <div className={ROW + " px-4"}>
          <label className={LABEL + " col-span-1 pt-0.5"}>Địa chỉ</label>
          <div className={VAL}>
            {isEditing
              ? <input className={FIELD} value={draft.address} onChange={(e) => set("address", e.target.value)} />
              : VIEW(draft.address)}
          </div>
        </div>

        {/* Người đại diện */}
        <div className={ROW + " px-4"}>
          <label className={LABEL + " col-span-1 pt-0.5"}>Người đại diện</label>
          <div className={VAL}>
            {isEditing ? (
              <div className="flex gap-2">
                <input className={FIELD} value={draft.legalRepName} onChange={(e) => set("legalRepName", e.target.value)} placeholder="Họ và tên" />
                <input className={FIELD} value={draft.legalRepTitle} onChange={(e) => set("legalRepTitle", e.target.value)} placeholder="Chức vụ" />
              </div>
            ) : (
              <span>{draft.legalRepName || "—"}{draft.legalRepTitle ? ` — ${draft.legalRepTitle}` : ""}</span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className={ROW + " px-4"}>
          <label className={LABEL + " col-span-1 pt-0.5"}>Email liên hệ</label>
          <div className={VAL}>
            {isEditing
              ? <input type="email" className={FIELD} value={draft.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
              : VIEW(draft.contactEmail)}
          </div>
        </div>

        {/* SĐT */}
        <div className={ROW + " px-4"}>
          <label className={LABEL + " col-span-1 pt-0.5"}>Số điện thoại</label>
          <div className={VAL}>
            {isEditing
              ? <input type="tel" className={FIELD} value={draft.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
              : VIEW(draft.contactPhone)}
          </div>
        </div>

        {/* Ghi chú nội bộ */}
        <div className={ROW + " px-4"}>
          <label className={LABEL + " col-span-1 pt-0.5"}>
            Ghi chú nội bộ
            <span className="ml-1 text-[9px] normal-case font-normal text-muted-foreground/70">(ẩn với NCC)</span>
          </label>
          <div className={VAL}>
            {isEditing
              ? <textarea className={FIELD + " resize-none"} rows={3} value={draft.internalNote}
                  onChange={(e) => set("internalNote", e.target.value)} />
              : VIEW(draft.internalNote, true)}
          </div>
        </div>

        {/* Ngày onboard */}
        <div className={ROW + " px-4"}>
          <label className={LABEL + " col-span-1 pt-0.5"}>Ngày onboard</label>
          <div className={VAL}>
            <span>{formatDate(org.createdAt)}</span>
            <span className="ml-2 text-[11px] text-muted-foreground">(không thể thay đổi)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TAB 2: HOẠT ĐỘNG & NỘI DUNG                                    */
/* ================================================================ */
interface SoPerm { soId: string; soName: string; grantedAt: string; }

function GrantSoModal({ existing, onGrant, onClose }: {
  existing: SoPerm[]; onGrant: (so: { soId: string; soName: string }) => void; onClose: () => void;
}) {
  const soList = MOCK_ORGS.filter((o) => o.type === "so_gd" && !existing.find((e) => e.soId === o.id));
  const [selected, setSelected] = useState<string>("");

  const handleConfirm = () => {
    const so = soList.find((s) => s.id === selected);
    if (!so) return;
    onGrant({ soId: so.id, soName: so.name });
    toast.success(`Đã cấp quyền cho ${so.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="font-semibold text-[14px]">Cấp quyền thêm Sở GD&ĐT</p>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {soList.length === 0 ? (
          <p className="text-[13px] text-muted-foreground italic text-center py-4">
            Tất cả Sở GD&ĐT đã được cấp quyền.
          </p>
        ) : (
          <div className="space-y-2">
            {soList.map((so) => (
              <label key={so.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors
                  ${selected === so.id ? "border-[#92400e] bg-[#92400e]/5" : "border-border hover:bg-secondary/40"}`}>
                <input type="radio" name="grantSo" value={so.id}
                  checked={selected === so.id} onChange={() => setSelected(so.id)}
                  className="accent-[#92400e]" />
                <div>
                  <p className="text-[13px] font-medium">{so.name}</p>
                  {so.province && <p className="text-[11px] text-muted-foreground">{so.province}</p>}
                </div>
              </label>
            ))}
          </div>
        )}

        {soList.length > 0 && (
          <div className="flex gap-2 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2 border border-border rounded-lg text-[13px] hover:bg-secondary transition-colors">
              Huỷ
            </button>
            <button onClick={handleConfirm} disabled={!selected}
              className="flex-1 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-40 transition-colors"
              style={{ backgroundColor: "#92400e" }}>
              Cấp quyền
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TabActivity({ nccId }: { nccId: string }) {
  const activity = MOCK_NCC_ACTIVITY[nccId];
  const [perms, setPerms] = useState<SoPerm[]>(activity?.soPermissions ?? []);
  const [grantModal, setGrantModal] = useState(false);

  const revoke = (soId: string) => {
    setPerms((p) => p.filter((s) => s.soId !== soId));
    toast.info("Đã thu hồi quyền truy cập");
  };

  const grant = (so: { soId: string; soName: string }) => {
    setPerms((p) => [...p, { soId: so.soId, soName: so.soName, grantedAt: new Date().toISOString() }]);
  };

  const kpi = [
    { label: "Chương trình STEM",     value: activity?.programs ?? 0,   color: "#6d28d9" },
    { label: "Học liệu tải lên",      value: activity?.materials ?? 0,  color: "#0e7490" },
    { label: "Trường đang dùng",      value: activity?.schools ?? 0,    color: "#15803d" },
    { label: "Vi phạm đang chờ",      value: activity?.violations ?? 0, color: "#dc2626", alert: true },
  ];

  return (
    <>
      {grantModal && <GrantSoModal existing={perms} onGrant={grant} onClose={() => setGrantModal(false)} />}

      <div className="p-5 space-y-5">
        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-3">
          {kpi.map(({ label, value, color, alert }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-muted-foreground text-[11px]">{label}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-bold text-[24px]" style={{ color }}>{value}</p>
                {alert && value > 0 && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sở permissions table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div>
              <p className="font-semibold text-[13px]">Sở GD&ĐT đã cấp quyền</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">NCC có thể cung cấp nội dung cho trường thuộc các Sở này</p>
            </div>
            <button onClick={() => setGrantModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold text-white"
              style={{ backgroundColor: "#92400e" }}>
              <Plus className="w-3.5 h-3.5" /> Cấp quyền thêm Sở
            </button>
          </div>

          {perms.length === 0 ? (
            <div className="py-10 flex flex-col items-center text-muted-foreground gap-2">
              <Building2 className="w-8 h-8 opacity-25" />
              <p className="text-[12.5px]">Chưa cấp quyền cho Sở nào</p>
            </div>
          ) : (
            <table className="w-full text-[12.5px]">
              <thead className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
                <tr>
                  <th className="px-4 py-2.5 text-left">Tên Sở GD&ĐT</th>
                  <th className="px-4 py-2.5 text-left">Tỉnh / Thành phố</th>
                  <th className="px-4 py-2.5 text-left">Ngày cấp quyền</th>
                  <th className="px-4 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {perms.map((p) => {
                  const so = MOCK_ORGS.find((o) => o.id === p.soId);
                  return (
                    <tr key={p.soId} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-2.5 font-medium">{p.soName}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{so?.province ?? "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{formatDate(p.grantedAt)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => revoke(p.soId)}
                          className="text-[11.5px] text-red-500 hover:underline font-medium">
                          Thu hồi quyền
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

/* ================================================================ */
/*  TAB 3: TÀI KHOẢN ADMIN NCC                                     */
/* ================================================================ */
function AddAccountDrawer({ nccId, nccName, open, onClose }: {
  nccId: string; nccName: string; open: boolean; onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Đã tạo tài khoản Admin cho "${name}"`);
      setName(""); setEmail(""); setPhone("");
      onClose();
    }, 800);
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-[440px] bg-card border-l border-border z-50 flex flex-col shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <p className="font-semibold text-[14px]">Thêm tài khoản Admin NCC</p>
            <p className="text-[11px] text-muted-foreground">{nccName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Pre-filled readonly fields */}
          <div className="bg-secondary/40 rounded-xl px-4 py-3 space-y-1.5 text-[12.5px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổ chức</span>
              <span className="font-medium">{nccName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vai trò mặc định</span>
              <span className="font-medium text-[#92400e]">Admin NCC</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={LABEL}>Họ và tên <span className="text-red-500">*</span></label>
            <input className={FIELD} value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên đầy đủ" />
          </div>
          <div className="space-y-1.5">
            <label className={LABEL}>Email <span className="text-red-500">*</span></label>
            <input type="email" className={FIELD} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@company.vn" />
          </div>
          <div className="space-y-1.5">
            <label className={LABEL}>Số điện thoại</label>
            <input type="tel" className={FIELD} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxx" />
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-[12px] text-amber-800">
            Tài khoản sẽ nhận email kích hoạt. Mật khẩu tạm thời được gửi tự động.
          </div>
        </form>

        <div className="flex gap-3 px-5 py-4 border-t border-border shrink-0">
          <button onClick={onClose} className="flex-1 py-2 border border-border rounded-lg text-[13px] hover:bg-secondary transition-colors">Huỷ</button>
          <button onClick={handleSubmit} disabled={!name.trim() || !email.trim() || submitting}
            className="flex-1 py-2 rounded-lg text-[13px] font-semibold text-white disabled:opacity-40 transition-colors"
            style={{ backgroundColor: "#92400e" }}>
            {submitting ? "Đang tạo…" : "Tạo tài khoản"}
          </button>
        </div>
      </div>
    </>
  );
}

function TabAccounts({ nccId, nccName }: { nccId: string; nccName: string }) {
  const NCC_ROLES = ["supplier_admin","supplier_content","supplier_sales","supplier_warranty"];
  const accounts = MOCK_ACCOUNTS.filter((a) => a.orgId === nccId && NCC_ROLES.includes(a.role));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [locked, setLocked] = useState<Set<string>>(new Set());

  const handleLock = (id: string, name: string) => {
    setLocked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    toast.info(locked.has(id) ? `Đã mở khoá ${name}` : `Đã khoá ${name}`);
  };

  return (
    <>
      <AddAccountDrawer nccId={nccId} nccName={nccName} open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="p-5 space-y-3">
        <div className="flex justify-end">
          <button onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-semibold text-white"
            style={{ backgroundColor: "#92400e" }}>
            <Plus className="w-3.5 h-3.5" /> Thêm tài khoản Admin
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {accounts.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-muted-foreground gap-2">
              <Lock className="w-8 h-8 opacity-20" />
              <p className="text-[12.5px]">Chưa có tài khoản Admin nào</p>
            </div>
          ) : (
            <table className="w-full text-[12.5px]">
              <thead className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
                <tr>
                  <th className="px-4 py-2.5 text-left">Họ tên</th>
                  <th className="px-4 py-2.5 text-left">Email</th>
                  <th className="px-4 py-2.5 text-left">Vai trò</th>
                  <th className="px-4 py-2.5 text-left">Trạng thái</th>
                  <th className="px-4 py-2.5 text-left">Đăng nhập cuối</th>
                  <th className="px-4 py-2.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accounts.map((acc) => {
                  const isLocked = locked.has(acc.id) || acc.status === "locked";
                  const statusCfg = isLocked ? STATUS_DISPLAY.locked : STATUS_DISPLAY[acc.status];
                  const roleCfg  = ROLE_DISPLAY[acc.role];
                  return (
                    <tr key={acc.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-2.5 font-medium">{acc.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground font-mono text-[11px]">{maskEmail(acc.email)}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
                          style={{ color: roleCfg.color, backgroundColor: roleCfg.bg }}>
                          {roleCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
                          style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusCfg.dot }} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {acc.lastLogin ? formatRelative(acc.lastLogin) : "Chưa đăng nhập"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Link to={`/admin/accounts/${acc.id}`}
                            className="flex items-center gap-1 text-[11.5px] text-blue-600 hover:underline">
                            <Eye className="w-3 h-3" /> Hồ sơ
                          </Link>
                          <button onClick={() => handleLock(acc.id, acc.name)}
                            className={`flex items-center gap-1 text-[11.5px] font-medium hover:underline ${isLocked ? "text-green-600" : "text-red-500"}`}>
                            <Lock className="w-3 h-3" />
                            {isLocked ? "Mở khoá" : "Khoá"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

/* ================================================================ */
/*  TAB 4: LỊCH SỬ THAY ĐỔI                                       */
/* ================================================================ */
function TabChangelog({ nccId }: { nccId: string }) {
  const logs = MOCK_CHANGE_LOGS[nccId] ?? [];

  return (
    <div className="p-5">
      {logs.length === 0 ? (
        <div className="py-12 flex flex-col items-center text-muted-foreground gap-2">
          <Clock className="w-8 h-8 opacity-20" />
          <p className="text-[12.5px]">Chưa có lịch sử thay đổi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id}
              className="flex items-start gap-3 bg-card border border-border rounded-xl px-4 py-3">
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[12.5px]">{log.action}</span>
                  {log.field !== "—" && (
                    <span className="text-[11.5px] text-muted-foreground">· {log.field}</span>
                  )}
                </div>
                {log.before !== "—" && (
                  <div className="flex items-center gap-2 mt-1 text-[11.5px]">
                    <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 font-mono">{log.before}</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-700 font-mono">{log.after}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                  <span>{formatDate(log.time)}</span>
                  <span>·</span>
                  <span className="font-mono">{log.actor}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  MAIN                                                            */
/* ================================================================ */
type TabKey = "info" | "activity" | "accounts" | "changelog";

const TABS: { key: TabKey; label: string }[] = [
  { key: "info",      label: "Thông tin chung" },
  { key: "activity",  label: "Hoạt động & Nội dung" },
  { key: "accounts",  label: "Tài khoản Admin NCC" },
  { key: "changelog", label: "Lịch sử thay đổi" },
];

export function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab]           = useState<TabKey>("info");
  const [status, setStatus]     = useState<OrgStatus | null>(null);
  const [suspendModal, setSuspendModal] = useState(false);

  const org     = MOCK_ORGS.find((o) => o.id === id && o.type === "ncc");
  const details = id ? ORG_DETAILS[id] : undefined;
  const activity = id ? MOCK_NCC_ACTIVITY[id] : undefined;

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
        <Factory className="w-12 h-12 opacity-20" />
        <p className="text-[15px] font-medium">Không tìm thấy NCC</p>
        <Link to="/admin/suppliers" className="text-[13px] text-[#92400e] hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  const currentStatus = (status ?? org.status) as OrgStatus;
  const statusCfg     = STATUS_CFG[currentStatus];
  const nccType       = (details?.nccType ?? "content") as NccType;
  const typeCfg       = NCC_TYPE_CFG[nccType];
  const initials      = getInitials(org.name);

  const handleSuspendConfirm = (reason: string) => {
    setSuspendModal(false);
    setStatus("suspended");
    toast.info(`Đã đình chỉ ${org.name} — ${reason.slice(0, 50)}${reason.length > 50 ? "…" : ""}`);
  };

  const handleActivate = () => {
    setStatus("active");
    toast.success(`Đã kích hoạt lại ${org.name}`);
  };

  const canSuspend = currentStatus === "active" || currentStatus === "trial";
  const violationCount = activity?.violations ?? 0;

  return (
    <>
    {suspendModal && (
      <NccSuspendModal
        nccName={org.name}
        onConfirm={handleSuspendConfirm}
        onClose={() => setSuspendModal(false)}
      />
    )}
    <div className="space-y-5">
      {/* Back link */}
      <Link to="/admin/suppliers"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Danh sách NCC
      </Link>

      {/* Header card */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ backgroundColor: "#92400e" }}>
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-[18px] font-bold">{org.name}</h1>
                  <span className="font-mono text-[11.5px] text-muted-foreground">{org.code}</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
                    style={{ color: typeCfg.color, backgroundColor: typeCfg.bg }}>
                    {typeCfg.label}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
                    style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusCfg.dot }} />
                    {statusCfg.label}
                  </span>
                  {violationCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-red-100 text-red-600">
                      <AlertTriangle className="w-3 h-3" /> {violationCount} vi phạm chờ
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-[11.5px] text-muted-foreground flex-wrap">
                  {details?.contactEmail && <span>{details.contactEmail}</span>}
                  {details?.contactPhone && <span>{details.contactPhone}</span>}
                  <span>Onboard: {formatDate(org.createdAt)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setTab("info")}
                  className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-[12.5px] hover:bg-secondary transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                </button>
                <button
                  onClick={canSuspend ? () => setSuspendModal(true) : handleActivate}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors ${
                    canSuspend
                      ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                      : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                  }`}>
                  {canSuspend
                    ? <><Ban className="w-3.5 h-3.5" /> Đình chỉ</>
                    : <><RotateCcw className="w-3.5 h-3.5" /> Kích hoạt lại</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-3 text-[13px] font-medium border-b-2 whitespace-nowrap transition-colors
                ${tab === key
                  ? "border-[#92400e] text-[#92400e]"
                  : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {label}
              {key === "activity" && violationCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                  {violationCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "info"      && <TabInfo nccId={org.id} />}
        {tab === "activity"  && <TabActivity nccId={org.id} />}
        {tab === "accounts"  && <TabAccounts nccId={org.id} nccName={org.name} />}
        {tab === "changelog" && <TabChangelog nccId={org.id} />}
      </div>
    </div>
    </>
  );
}
