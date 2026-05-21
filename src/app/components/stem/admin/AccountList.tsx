import { useState, useMemo, useEffect, useRef } from "react";
import {
  Users, Plus, Search, X, MoreHorizontal, Eye, KeyRound,
  Lock, Unlock, ShieldCheck, ArrowUpDown, ArrowUp, ArrowDown,
  RotateCcw, Calendar, Building2, School, Package, Check,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { PageHeader } from "../ui/PageHeader";
import { toast } from "@/app/lib/toast";
import { formatDate } from "../ui/format";
import type { OrgType } from "./org-data";
import { MOCK_ORGS } from "./org-data";
import type { Account, AccountStatus } from "./account-data";
import {
  MOCK_ACCOUNTS, ROLE_DISPLAY, ROLE_FILTER_GROUPS, STATUS_DISPLAY,
} from "./account-data";
import type { StemRole } from "../../AuthContext";
import { AccountCreateDrawer } from "./AccountCreateDrawer";

/* ================================================================ */
/*  HELPERS                                                         */
/* ================================================================ */
function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 0) return email;
  const local = email.slice(0, at);
  const visible = local.slice(0, Math.min(3, local.length));
  return `${visible}***${email.slice(at)}`;
}

function relativeTime(iso: string | null): string {
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

function initials(name: string): string {
  const parts = name.trim().split(" ");
  return parts.slice(-2).map((p) => p[0]).join("").toUpperCase();
}

const ORG_TYPE_CFG: Record<OrgType, { label: string; color: string; bg: string; icon: typeof Building2 }> = {
  so_gd:  { label: "Sở GD",    color: "#1e40af", bg: "#dbeafe", icon: Building2 },
  truong: { label: "Trường",   color: "#0e7490", bg: "#cffafe", icon: School   },
  ncc:    { label: "NCC",      color: "#6d28d9", bg: "#ede9fe", icon: Package   },
};

/* ================================================================ */
/*  ORG SEARCHABLE SELECT                                           */
/* ================================================================ */
function OrgSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = useMemo(() =>
    MOCK_ORGS.filter((o) => !query || o.name.toLowerCase().includes(query.toLowerCase()) || o.code.toLowerCase().includes(query.toLowerCase())),
  [query]);

  const selected = MOCK_ORGS.find((o) => o.id === value);
  const selCfg = selected ? ORG_TYPE_CFG[selected.type] : null;

  return (
    <div ref={ref} className="relative">
      <button type="button"
        onClick={() => { setOpen((v) => !v); setQuery(""); }}
        className="flex items-center justify-between gap-2 bg-card border border-border rounded-lg px-3 py-2 text-[13px] outline-none hover:border-foreground/30 transition-colors min-w-[180px] text-left">
        {selected ? (
          <span className="flex items-center gap-1.5 truncate">
            {selCfg && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0"
              style={{ color: selCfg.color, backgroundColor: selCfg.bg }}>{selCfg.label}</span>}
            <span className="truncate">{selected.name}</span>
          </span>
        ) : (
          <span className="text-muted-foreground">Tất cả tổ chức</span>
        )}
        <span className="text-muted-foreground shrink-0">▾</span>
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-72 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm tổ chức..." className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-[12px] outline-none focus:border-[#1e40af]" />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            <button onClick={() => { onChange(""); setOpen(false); }}
              className={`w-full px-3 py-2 text-left text-[12px] hover:bg-secondary flex items-center gap-2 ${!value ? "text-[#1e40af] font-medium" : "text-muted-foreground"}`}>
              {!value && <Check className="w-3.5 h-3.5" />}
              {value && <span className="w-3.5" />}
              Tất cả tổ chức
            </button>
            {filtered.map((o) => {
              const cfg = ORG_TYPE_CFG[o.type];
              return (
                <button key={o.id} onClick={() => { onChange(o.id); setOpen(false); }}
                  className={`w-full px-3 py-2 text-left hover:bg-secondary flex items-center gap-2 ${value === o.id ? "bg-blue-50" : ""}`}>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0"
                    style={{ color: cfg.color, backgroundColor: cfg.bg }}>{cfg.label}</span>
                  <span className="flex-1 min-w-0 truncate text-[12px]">{o.name}</span>
                  {value === o.id && <Check className="w-3.5 h-3.5 text-[#1e40af] shrink-0" />}
                </button>
              );
            })}
            {filtered.length === 0 && <p className="text-center text-muted-foreground text-[12px] py-4">Không tìm thấy</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  CHANGE ROLE MODAL                                               */
/* ================================================================ */
function ChangeRoleModal({ account, onSave, onClose }: {
  account: Account; onSave: (role: StemRole) => void; onClose: () => void;
}) {
  const [selected, setSelected] = useState<StemRole>(account.role);

  const allRoles: StemRole[] = [
    "system_admin","authority_admin","authority_viewer",
    "school_principal","school_admin","school_itadmin",
    "teacher","student",
    "supplier_admin","supplier_content","supplier_sales","supplier_warranty",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold" style={{ fontSize: "15px" }}>Đổi vai trò</h2>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Tài khoản: <strong className="text-foreground">{account.name}</strong></p>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {allRoles.map((r) => {
            const d = ROLE_DISPLAY[r];
            return (
              <button key={r} onClick={() => setSelected(r)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${selected === r ? "ring-2 ring-[#1e40af]" : "hover:bg-secondary"}`}
                style={{ backgroundColor: selected === r ? d.bg : undefined }}>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ color: d.color, backgroundColor: d.bg }}>{d.label}</span>
                {selected === r && <Check className="w-4 h-4" style={{ color: d.color }} />}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/70 rounded-xl transition-colors font-medium"
            style={{ fontSize: "13px" }}>
            Huỷ
          </button>
          <button onClick={() => onSave(selected)}
            className="flex-1 px-4 py-2 bg-[#1e40af] text-white hover:opacity-90 rounded-xl transition-opacity font-medium"
            style={{ fontSize: "13px" }}>
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  ACTION MENU                                                     */
/* ================================================================ */
function ActionMenu({ account, onLockToggle, onChangeRole, onViewDetail, onClose }: {
  account: Account;
  onLockToggle: () => void;
  onChangeRole: () => void;
  onViewDetail: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [onClose]);

  return (
    <div ref={ref}
      className="absolute right-0 top-full mt-1 w-52 bg-card border border-border rounded-xl shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
      <button className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-secondary text-[12.5px] transition-colors text-left"
        onClick={() => { onViewDetail(account.id); onClose(); }}>
        <Eye className="w-3.5 h-3.5 text-muted-foreground" /> Xem chi tiết
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-secondary text-[12.5px] transition-colors text-left"
        onClick={() => { toast.success(`Đã gửi email đặt lại mật khẩu cho ${account.name}`); onClose(); }}>
        <KeyRound className="w-3.5 h-3.5 text-muted-foreground" /> Đặt lại mật khẩu
      </button>
      <button className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-secondary text-[12.5px] transition-colors text-left"
        onClick={() => { onLockToggle(); onClose(); }}>
        {account.status === "locked"
          ? <><Unlock className="w-3.5 h-3.5 text-green-600" /><span className="text-green-700">Mở khoá tài khoản</span></>
          : <><Lock   className="w-3.5 h-3.5 text-red-500"   /><span className="text-red-600">Khoá tài khoản</span></>}
      </button>
      <div className="border-t border-border/60 my-1" />
      <button className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-secondary text-[12.5px] transition-colors text-left"
        onClick={() => { onChangeRole(); onClose(); }}>
        <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" /> Đổi vai trò
      </button>
    </div>
  );
}

/* ================================================================ */
/*  TABLE                                                           */
/* ================================================================ */
const PAGE_SIZE = 15;
type SortField = "name" | "createdAt";
type SortDir = "asc" | "desc";

function AccountTable({ accounts, loading, onLockToggle, onChangeRole, onViewDetail }: {
  accounts: Account[];
  loading: boolean;
  onLockToggle: (id: string) => void;
  onChangeRole: (id: string, role: StemRole) => void;
  onViewDetail: (id: string) => void;
}) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [changeRoleFor, setChangeRoleFor] = useState<Account | null>(null);

  const orgMap = useMemo(() => Object.fromEntries(MOCK_ORGS.map((o) => [o.id, o])), []);

  const sorted = useMemo(() => {
    return [...accounts].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name, "vi");
      else cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [accounts, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const cur = Math.min(page, totalPages);
  const pageItems = sorted.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  const toggleSort = (f: SortField) => {
    if (sortField === f) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
    setPage(1);
  };

  const SortIcon = ({ f }: { f: SortField }) =>
    sortField !== f ? <ArrowUpDown className="w-3 h-3 opacity-40" /> :
    sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              {["Họ tên","Email","Vai trò","Tổ chức","Trạng thái","Đăng nhập cuối","Ngày tạo",""].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-secondary rounded-full" /><div className="h-3 bg-secondary rounded w-28" /></div></td>
                <td className="px-4 py-3"><div className="h-3 bg-secondary rounded w-32" /></td>
                <td className="px-4 py-3"><div className="h-5 bg-secondary rounded w-20" /></td>
                <td className="px-4 py-3"><div className="h-5 bg-secondary rounded w-28" /></td>
                <td className="px-4 py-3"><div className="h-5 bg-secondary rounded w-24" /></td>
                <td className="px-4 py-3"><div className="h-3 bg-secondary rounded w-20" /></td>
                <td className="px-4 py-3"><div className="h-3 bg-secondary rounded w-20" /></td>
                <td className="px-4 py-3"><div className="h-5 bg-secondary rounded w-5" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!sorted.length) {
    return (
      <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-20 gap-3">
        <Users className="w-10 h-10 text-muted-foreground/30" />
        <p className="text-muted-foreground text-sm">Không tìm thấy tài khoản nào phù hợp</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
            <tr>
              <th className="px-4 py-2.5 text-left">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort("name")}>
                  Họ tên <SortIcon f="name" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-left">Email</th>
              <th className="px-4 py-2.5 text-left">Vai trò</th>
              <th className="px-4 py-2.5 text-left">Tổ chức</th>
              <th className="px-4 py-2.5 text-left">Trạng thái</th>
              <th className="px-4 py-2.5 text-left">Đăng nhập cuối</th>
              <th className="px-4 py-2.5 text-left">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort("createdAt")}>
                  Ngày tạo <SortIcon f="createdAt" />
                </button>
              </th>
              <th className="px-4 py-2.5 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-[12.5px]">
            {pageItems.map((acc) => {
              const roleCfg = ROLE_DISPLAY[acc.role];
              const statusCfg = STATUS_DISPLAY[acc.status];
              const org = orgMap[acc.orgId];
              const orgCfg = org ? ORG_TYPE_CFG[org.type] : null;
              const ini = initials(acc.name);
              const bgColor = roleCfg.color + "22";

              return (
                <tr key={acc.id} className="hover:bg-secondary/30 transition-colors">
                  {/* Họ tên */}
                  <td className="px-4 py-3">
                    <Link to={`/admin/accounts/${acc.id}`}
                      className="flex items-center gap-2 hover:text-[#1e40af] transition-colors text-left">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-semibold text-[11px]"
                        style={{ backgroundColor: bgColor, color: roleCfg.color }}>
                        {ini}
                      </div>
                      <div>
                        <p className="font-medium leading-tight">{acc.name}</p>
                        <p className="text-muted-foreground text-[10px] font-mono">{acc.code}</p>
                      </div>
                    </Link>
                  </td>

                  {/* Email (masked) */}
                  <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">{maskEmail(acc.email)}</td>

                  {/* Vai trò */}
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ color: roleCfg.color, backgroundColor: roleCfg.bg }}>
                      {roleCfg.label}
                    </span>
                  </td>

                  {/* Tổ chức */}
                  <td className="px-4 py-3">
                    {org && orgCfg ? (
                      <Link to={`/admin/organizations/${org.id}`}
                        className="flex items-center gap-1.5 hover:text-[#990803] transition-colors max-w-[180px]">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0"
                          style={{ color: orgCfg.color, backgroundColor: orgCfg.bg }}>
                          {orgCfg.label}
                        </span>
                        <span className="truncate font-medium">{org.name}</span>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Trạng thái */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusCfg.dot }} />
                      {statusCfg.label}
                    </span>
                  </td>

                  {/* Đăng nhập cuối */}
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>
                    {relativeTime(acc.lastLogin)}
                  </td>

                  {/* Ngày tạo */}
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(acc.createdAt)}</td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                        onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === acc.id ? null : acc.id); }}>
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {openMenu === acc.id && (
                        <ActionMenu
                          account={acc}
                          onLockToggle={() => onLockToggle(acc.id)}
                          onChangeRole={() => setChangeRoleFor(acc)}
                          onViewDetail={() => onViewDetail(acc.id)}
                          onClose={() => setOpenMenu(null)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1" style={{ fontSize: "12px" }}>
        <span className="text-muted-foreground">
          Hiển thị {(cur - 1) * PAGE_SIZE + 1}–{Math.min(cur * PAGE_SIZE, sorted.length)} trong {sorted.length.toLocaleString("vi-VN")} tài khoản
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-7 h-7 rounded-lg transition-colors ${p === cur ? "bg-[#1e40af] text-white" : "hover:bg-secondary text-muted-foreground"}`}
              style={{ fontSize: "12px", fontWeight: p === cur ? 600 : 400 }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {changeRoleFor && (
        <ChangeRoleModal
          account={changeRoleFor}
          onSave={(role) => { onChangeRole(changeRoleFor.id, role); setChangeRoleFor(null); }}
          onClose={() => setChangeRoleFor(null)}
        />
      )}
    </div>
  );
}

/* ================================================================ */
/*  MAIN                                                            */
/* ================================================================ */
export function AccountList() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS);
  const [searchInput, setSearchInput] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [roleGroupF, setRoleGroupF] = useState("");
  const [orgF, setOrgF] = useState("");
  const [statusF, setStatusF] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setTimeout(() => setSearchQ(searchInput), 400); return () => clearTimeout(t); }, [searchInput]);

  const filtered = useMemo(() => {
    const rolesToMatch: StemRole[] = roleGroupF ? ROLE_FILTER_GROUPS[roleGroupF] ?? [] : [];
    return accounts.filter((a) => {
      if (rolesToMatch.length > 0 && !rolesToMatch.includes(a.role)) return false;
      if (orgF && a.orgId !== orgF) return false;
      if (statusF && a.status !== statusF) return false;
      if (dateFrom && a.createdAt < dateFrom) return false;
      if (dateTo && a.createdAt > dateTo + "T23:59:59Z") return false;
      if (searchQ) {
        const q = searchQ.toLowerCase();
        if (!a.name.toLowerCase().includes(q) && !a.email.toLowerCase().includes(q) && !a.code.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [accounts, roleGroupF, orgF, statusF, dateFrom, dateTo, searchQ]);

  const kpi = useMemo(() => ({
    total:   accounts.length,
    active:  accounts.filter((a) => a.status === "active").length,
    locked:  accounts.filter((a) => a.status === "locked").length,
    pending: accounts.filter((a) => a.status === "pending").length,
  }), [accounts]);

  const resetFilters = () => {
    setSearchInput(""); setSearchQ(""); setRoleGroupF(""); setOrgF(""); setStatusF(""); setDateFrom(""); setDateTo("");
  };

  const hasFilters = !!(searchQ || roleGroupF || orgF || statusF || dateFrom || dateTo);

  const handleLockToggle = (id: string) => {
    setAccounts((prev) => prev.map((a) => {
      if (a.id !== id) return a;
      const next: AccountStatus = a.status === "locked" ? "active" : "locked";
      toast.success(`${next === "locked" ? "Đã khoá" : "Đã mở khoá"} tài khoản ${a.name}`);
      return { ...a, status: next };
    }));
  };

  const handleChangeRole = (id: string, role: StemRole) => {
    setAccounts((prev) => prev.map((a) => {
      if (a.id !== id) return a;
      toast.success(`Đã đổi vai trò ${a.name} → ${ROLE_DISPLAY[role].label}`);
      return { ...a, role };
    }));
  };

  const handleCreated = (account: Account) => {
    setAccounts((prev) => [account, ...prev]);
  };

  const inputCls = "bg-card border border-border rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1e40af] transition-colors";

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Users}
        title="Danh sách tài khoản"
        subtitle="Quản lý tất cả tài khoản trên nền tảng — tìm kiếm, lọc, khoá và phân quyền."
        accentColor="#1e40af"
        actions={
          <button onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1e40af] text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Thêm tài khoản
          </button>
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Tổng tài khoản",    value: kpi.total,   color: "#1e40af" },
          { label: "Đang hoạt động",    value: kpi.active,  color: "#15803d" },
          { label: "Đã khoá",           value: kpi.locked,  color: "#dc2626" },
          { label: "Chờ kích hoạt",     value: kpi.pending, color: "#b45309" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4">
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{label}</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color, lineHeight: 1.3 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-end">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên, email, mã HS/GV..."
              className={inputCls + " pl-9 w-full"} />
            {searchInput && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => { setSearchInput(""); setSearchQ(""); }}>
                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Vai trò */}
          <select value={roleGroupF} onChange={(e) => setRoleGroupF(e.target.value)}
            className={inputCls + " cursor-pointer"}>
            <option value="">Tất cả vai trò</option>
            {Object.keys(ROLE_FILTER_GROUPS).map((g) => <option key={g} value={g}>{g}</option>)}
          </select>

          {/* Tổ chức */}
          <OrgSelect value={orgF} onChange={setOrgF} />

          {/* Trạng thái */}
          <select value={statusF} onChange={(e) => setStatusF(e.target.value)}
            className={inputCls + " cursor-pointer"}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="locked">Đã khoá</option>
            <option value="pending">Chờ kích hoạt</option>
          </select>
        </div>

        {/* Date range + actions */}
        <div className="flex flex-wrap gap-2 items-center">
          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Ngày tạo từ</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} style={{ fontSize: "13px" }} />
          <span className="text-muted-foreground">—</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputCls} style={{ fontSize: "13px" }} />
          <button onClick={() => toast.info(`Tìm: ${filtered.length} kết quả`)}
            className="px-4 py-2 bg-[#1e40af] text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            Tìm kiếm
          </button>
          {hasFilters && (
            <button onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 bg-secondary hover:bg-secondary/70 rounded-lg transition-colors text-muted-foreground"
              style={{ fontSize: "13px" }}>
              <RotateCcw className="w-3.5 h-3.5" /> Xoá bộ lọc
            </button>
          )}
          <span className="ml-auto text-muted-foreground" style={{ fontSize: "12px" }}>
            {filtered.length} / {accounts.length} tài khoản
          </span>
        </div>
      </div>

      {/* Table */}
      <AccountTable
        accounts={filtered}
        loading={loading}
        onLockToggle={handleLockToggle}
        onChangeRole={handleChangeRole}
        onViewDetail={(id) => navigate(`/admin/accounts/${id}`)}
      />

      {/* Create drawer */}
      <AccountCreateDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
