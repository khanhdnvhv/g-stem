import { useState, useEffect, useMemo, useRef } from "react";
import {
  Building2, School, Package, ChevronDown, ChevronRight,
  MoreHorizontal, Search, X, Eye, Edit, Pause, Play,
  LayoutList, Network, Users, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown,
  Plus, Calendar,
} from "lucide-react";
import { Link } from "react-router";
import { PageHeader } from "../ui/PageHeader";
import { toast } from "@/app/lib/toast";
import { formatDate } from "../ui/format";
import { OrganizationCreateDrawer } from "./OrganizationCreateDrawer";
import type { OrgType, OrgStatus, Organization } from "./org-data";
import { MOCK_ORGS, PROVINCES_VN } from "./org-data";

/* ================================================================ */
/*  TYPES                                                            */
/* ================================================================ */
type ViewMode = "table" | "tree";
type SortField = "name" | "createdAt" | "userCount";
type SortDir = "asc" | "desc";

/* ================================================================ */
/*  HELPERS                                                          */
/* ================================================================ */
const TYPE_CFG: Record<OrgType, { label: string; color: string; bg: string; icon: typeof Building2 }> = {
  so_gd:  { label: "Sở GD",    color: "#1e40af", bg: "#dbeafe", icon: Building2 },
  truong: { label: "Trường học", color: "#0e7490", bg: "#cffafe", icon: School   },
  ncc:    { label: "NCC",       color: "#6d28d9", bg: "#ede9fe", icon: Package   },
};

const STATUS_CFG: Record<OrgStatus, { label: string; color: string; bg: string; dot: string }> = {
  active:    { label: "Đang hoạt động", color: "#15803d", bg: "#dcfce7", dot: "#15803d" },
  suspended: { label: "Tạm ngừng",      color: "#dc2626", bg: "#fee2e2", dot: "#dc2626" },
  trial:     { label: "Dùng thử",       color: "#b45309", bg: "#fef3c7", dot: "#d97706" },
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

function highlight(text: string, query: string) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/* ================================================================ */
/*  ACTION MENU                                                      */
/* ================================================================ */
function ActionMenu({ org, onClose }: { org: Organization; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [onClose]);
  return (
    <div ref={ref}
      className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150"
      onClick={(e) => e.stopPropagation()}>
      <Link to={`/admin/organizations/${org.id}`}
        className="flex items-center gap-2 px-3 py-2 hover:bg-secondary text-[13px] transition-colors"
        onClick={onClose}>
        <Eye className="w-3.5 h-3.5 text-muted-foreground" /> Xem chi tiết
      </Link>
      <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-[13px] transition-colors text-left"
        onClick={() => { toast.info(`Chỉnh sửa: ${org.name}`); onClose(); }}>
        <Edit className="w-3.5 h-3.5 text-muted-foreground" /> Chỉnh sửa
      </button>
      <div className="border-t border-border my-1" />
      <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary text-[13px] transition-colors text-left"
        onClick={() => {
          toast.warning(org.status === "active" ? `Đình chỉ: ${org.name}` : `Kích hoạt: ${org.name}`);
          onClose();
        }}>
        {org.status === "active"
          ? <><Pause className="w-3.5 h-3.5 text-red-500" /> <span className="text-red-600">Đình chỉ</span></>
          : <><Play  className="w-3.5 h-3.5 text-green-600" /> <span className="text-green-700">Kích hoạt lại</span></>}
      </button>
    </div>
  );
}

/* ================================================================ */
/*  TABLE VIEW                                                       */
/* ================================================================ */
const PAGE_SIZE = 15;

function TableView({ orgs, loading, searchQ }: { orgs: Organization[]; loading: boolean; searchQ: string }) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const parentMap = useMemo(() => Object.fromEntries(MOCK_ORGS.map((o) => [o.id, o.name])), []);

  const sorted = useMemo(() => {
    return [...orgs].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name, "vi");
      else if (sortField === "userCount") cmp = a.userCount - b.userCount;
      else if (sortField === "createdAt") cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [orgs, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
          <thead className="bg-secondary/50 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              {["Tên tổ chức","Mã","Loại","Đơn vị cha","Tỉnh/thành","Trạng thái","Người dùng","Đơn vị con","Ngày tạo",""].map((h, i) => (
                <th key={i} className="px-3 py-2.5 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-3 py-3"><div className="h-3 bg-secondary rounded w-36" /></td>
                <td className="px-3 py-3"><div className="h-3 bg-secondary rounded w-20" /></td>
                <td className="px-3 py-3"><div className="h-5 bg-secondary rounded w-20" /></td>
                <td className="px-3 py-3"><div className="h-3 bg-secondary rounded w-28" /></td>
                <td className="px-3 py-3"><div className="h-3 bg-secondary rounded w-20" /></td>
                <td className="px-3 py-3"><div className="h-5 bg-secondary rounded w-24" /></td>
                <td className="px-3 py-3"><div className="h-3 bg-secondary rounded w-12" /></td>
                <td className="px-3 py-3"><div className="h-3 bg-secondary rounded w-8" /></td>
                <td className="px-3 py-3"><div className="h-3 bg-secondary rounded w-20" /></td>
                <td className="px-3 py-3"><div className="h-5 bg-secondary rounded w-6" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!sorted.length) {
    return (
      <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-16 gap-3">
        <Search className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-muted-foreground text-sm">Không tìm thấy tổ chức nào phù hợp</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary/50 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              <th className="px-3 py-2.5 text-left">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort("name")}>
                  Tên tổ chức <SortIcon f="name" />
                </button>
              </th>
              <th className="px-3 py-2.5 text-left">Mã</th>
              <th className="px-3 py-2.5 text-left">Loại</th>
              <th className="px-3 py-2.5 text-left">Đơn vị cha</th>
              <th className="px-3 py-2.5 text-left">Tỉnh/thành</th>
              <th className="px-3 py-2.5 text-left">Trạng thái</th>
              <th className="px-3 py-2.5 text-left">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort("userCount")}>
                  Người dùng <SortIcon f="userCount" />
                </button>
              </th>
              <th className="px-3 py-2.5 text-left">Đơn vị con</th>
              <th className="px-3 py-2.5 text-left">
                <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort("createdAt")}>
                  Ngày tạo <SortIcon f="createdAt" />
                </button>
              </th>
              <th className="px-3 py-2.5 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
            {pageItems.map((org) => (
              <tr key={org.id} className="hover:bg-secondary/40 transition-colors">
                <td className="px-3 py-3 max-w-[200px]">
                  <Link to={`/admin/organizations/${org.id}`}
                    className="font-medium hover:text-[#990803] transition-colors truncate block">
                    {highlight(org.name, searchQ)}
                  </Link>
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground" style={{ fontSize: "11px" }}>
                  {highlight(org.code, searchQ)}
                </td>
                <td className="px-3 py-3"><TypeBadge type={org.type} /></td>
                <td className="px-3 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>
                  {org.parentId ? parentMap[org.parentId] ?? "—" : "—"}
                </td>
                <td className="px-3 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>
                  {org.type === "ncc" ? "—" : (org.province ?? "—")}
                </td>
                <td className="px-3 py-3"><StatusBadge status={org.status} /></td>
                <td className="px-3 py-3 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {org.userCount.toLocaleString("vi-VN")}
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {org.type === "so_gd" ? org.childCount : "—"}
                </td>
                <td className="px-3 py-3 text-muted-foreground">{formatDate(org.createdAt)}</td>
                <td className="px-3 py-3 text-right">
                  <div className="relative inline-block">
                    <button
                      className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                      onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === org.id ? null : org.id); }}
                    >
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                    {openMenu === org.id && (
                      <ActionMenu org={org} onClose={() => setOpenMenu(null)} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1" style={{ fontSize: "12px" }}>
        <span className="text-muted-foreground">
          Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)} trong {sorted.length.toLocaleString("vi-VN")} kết quả
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-7 h-7 rounded-lg transition-colors ${p === currentPage ? "bg-[#990803] text-white" : "hover:bg-secondary text-muted-foreground"}`}
              style={{ fontSize: "12px", fontWeight: p === currentPage ? 600 : 400 }}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TREE VIEW                                                        */
/* ================================================================ */
function TreeRow({ org, depth = 0, searchQ, children }: {
  org: Organization; depth?: number; searchQ: string; children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(depth === 0);
  const [openMenu, setOpenMenu] = useState(false);
  const cfg = TYPE_CFG[org.type];
  const hasChildren = !!children;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-secondary/50 rounded-lg transition-colors group"
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        {hasChildren ? (
          <button onClick={() => setOpen((v) => !v)} className="p-0.5 rounded hover:bg-secondary transition-colors shrink-0">
            {open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <cfg.icon className="w-4 h-4 shrink-0" style={{ color: cfg.color }} />
        <Link to={`/admin/organizations/${org.id}`}
          className="flex-1 min-w-0 font-medium hover:text-[#990803] transition-colors truncate"
          style={{ fontSize: "13px" }}>
          {highlight(org.name, searchQ)}
        </Link>
        <StatusBadge status={org.status} />
        <span className="text-muted-foreground flex items-center gap-1 shrink-0" style={{ fontSize: "11px" }}>
          <Users className="w-3 h-3" /> {org.userCount.toLocaleString("vi-VN")}
        </span>
        <span className="text-muted-foreground shrink-0" style={{ fontSize: "11px" }}>{org.code}</span>
        <div className="relative shrink-0">
          <button
            className="p-1 hover:bg-secondary rounded opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); setOpenMenu((v) => !v); }}>
            <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {openMenu && <ActionMenu org={org} onClose={() => setOpenMenu(false)} />}
        </div>
      </div>
      {hasChildren && open && <div>{children}</div>}
    </div>
  );
}

function TreeView({ orgs, loading, searchQ, expandAll }: { orgs: Organization[]; loading: boolean; searchQ: string; expandAll: boolean | null }) {
  const soGdOrgs = useMemo(() => orgs.filter((o) => o.type === "so_gd"), [orgs]);
  const truongOrgs = useMemo(() => orgs.filter((o) => o.type === "truong"), [orgs]);
  const nccOrgs  = useMemo(() => orgs.filter((o) => o.type === "ncc"),  [orgs]);
  const allTruong = useMemo(() => MOCK_ORGS.filter((o) => o.type === "truong"), []);

  const [expandedSo, setExpandedSo] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (expandAll === null) return;
    const next: Record<string, boolean> = {};
    soGdOrgs.forEach((s) => { next[s.id] = expandAll; });
    setExpandedSo(next);
  }, [expandAll, soGdOrgs]);

  if (loading) {
    return <div className="bg-card rounded-xl border border-border p-6 space-y-3">
      {[1,2,3,4].map((i) => <div key={i} className="h-8 bg-secondary rounded-lg animate-pulse" />)}
    </div>;
  }

  // When searching: flat list with highlights
  if (searchQ) {
    const all = [...soGdOrgs, ...truongOrgs, ...nccOrgs];
    if (!all.length) return (
      <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-16 gap-3">
        <Search className="w-8 h-8 text-muted-foreground/40" />
        <p className="text-muted-foreground text-sm">Không tìm thấy tổ chức nào phù hợp</p>
      </div>
    );
    return (
      <div className="bg-card rounded-xl border border-border p-3 space-y-0.5">
        {all.map((org) => <TreeRow key={org.id} org={org} searchQ={searchQ} />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tree: Sở GD → Trường */}
      <div className="bg-card rounded-xl border border-border p-3">
        {soGdOrgs.length === 0 && truongOrgs.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">Không có Sở GD / Trường học nào</p>
        )}
        {soGdOrgs.map((so) => {
          const children = allTruong.filter((t) => t.parentId === so.id && orgs.some((o) => o.id === t.id));
          const isOpen = expandedSo[so.id] ?? true;
          return (
            <div key={so.id}>
              <div className="flex items-center gap-2 py-2 px-3 hover:bg-secondary/50 rounded-lg transition-colors group">
                <button onClick={() => setExpandedSo((p) => ({ ...p, [so.id]: !isOpen }))}
                  className="p-0.5 rounded hover:bg-secondary transition-colors shrink-0">
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <Building2 className="w-4 h-4 shrink-0 text-blue-700" />
                <Link to={`/admin/organizations/${so.id}`}
                  className="flex-1 min-w-0 font-semibold hover:text-[#990803] transition-colors truncate"
                  style={{ fontSize: "13px" }}>
                  {highlight(so.name, searchQ)}
                </Link>
                <StatusBadge status={so.status} />
                <span className="text-muted-foreground flex items-center gap-1 shrink-0 text-[11px]">
                  <Users className="w-3 h-3" /> {so.userCount.toLocaleString("vi-VN")}
                </span>
                <span className="text-muted-foreground text-[11px] shrink-0">{so.code}</span>
                <div className="relative shrink-0">
                  <ActionMenuTrigger org={so} />
                </div>
              </div>
              {isOpen && children.map((tr) => (
                <div key={tr.id}
                  className="flex items-center gap-2 py-2 hover:bg-secondary/40 rounded-lg transition-colors group"
                  style={{ paddingLeft: "36px" }}>
                  <School className="w-4 h-4 shrink-0 text-cyan-600" />
                  <Link to={`/admin/organizations/${tr.id}`}
                    className="flex-1 min-w-0 hover:text-[#990803] transition-colors truncate"
                    style={{ fontSize: "13px" }}>
                    {highlight(tr.name, searchQ)}
                  </Link>
                  <StatusBadge status={tr.status} />
                  <span className="text-muted-foreground flex items-center gap-1 shrink-0 text-[11px]">
                    <Users className="w-3 h-3" /> {tr.userCount.toLocaleString("vi-VN")}
                  </span>
                  <span className="text-muted-foreground text-[11px] shrink-0">{tr.code}</span>
                  <div className="relative shrink-0"><ActionMenuTrigger org={tr} /></div>
                </div>
              ))}
            </div>
          );
        })}
        {/* Trường không thuộc Sở nào trong hệ thống */}
        {truongOrgs.filter((t) => !t.parentId || !soGdOrgs.find((s) => s.id === t.parentId)).length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider px-3 pb-1">Chưa phân cấp Sở</p>
            {truongOrgs.filter((t) => !t.parentId || !soGdOrgs.find((s) => s.id === t.parentId)).map((tr) => (
              <div key={tr.id}
                className="flex items-center gap-2 py-2 px-3 hover:bg-secondary/40 rounded-lg transition-colors group">
                <span className="w-5 shrink-0" />
                <School className="w-4 h-4 shrink-0 text-cyan-600" />
                <Link to={`/admin/organizations/${tr.id}`}
                  className="flex-1 min-w-0 hover:text-[#990803] transition-colors truncate"
                  style={{ fontSize: "13px" }}>
                  {tr.name}
                </Link>
                <StatusBadge status={tr.status} />
                <span className="text-muted-foreground flex items-center gap-1 shrink-0 text-[11px]">
                  <Users className="w-3 h-3" /> {tr.userCount.toLocaleString("vi-VN")}
                </span>
                <span className="text-muted-foreground text-[11px] shrink-0">{tr.province}</span>
                <div className="relative shrink-0"><ActionMenuTrigger org={tr} /></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NCC flat list */}
      {nccOrgs.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-3">
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider px-1 pb-2">Nhà Cung Cấp</p>
          {nccOrgs.map((ncc) => (
            <div key={ncc.id}
              className="flex items-center gap-2 py-2 px-3 hover:bg-secondary/40 rounded-lg transition-colors group">
              <Package className="w-4 h-4 shrink-0 text-violet-600" />
              <Link to={`/admin/organizations/${ncc.id}`}
                className="flex-1 min-w-0 font-medium hover:text-[#990803] transition-colors truncate"
                style={{ fontSize: "13px" }}>
                {highlight(ncc.name, searchQ)}
              </Link>
              <StatusBadge status={ncc.status} />
              <span className="text-muted-foreground flex items-center gap-1 shrink-0 text-[11px]">
                <Users className="w-3 h-3" /> {ncc.userCount.toLocaleString("vi-VN")}
              </span>
              <span className="font-mono text-muted-foreground text-[11px] shrink-0">{ncc.code}</span>
              <div className="relative shrink-0"><ActionMenuTrigger org={ncc} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionMenuTrigger({ org }: { org: Organization }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="p-1 hover:bg-secondary rounded opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}>
        <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      {open && <ActionMenu org={org} onClose={() => setOpen(false)} />}
    </>
  );
}

/* ================================================================ */
/*  MAIN                                                             */
/* ================================================================ */
export function OrganizationManagement() {
  const [searchInput, setSearchInput]   = useState("");
  const [searchQ, setSearchQ]           = useState("");
  const [typeFilter, setTypeFilter]     = useState<OrgType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<OrgStatus | "all">("all");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");
  const [view, setView]                 = useState<ViewMode>("table");
  const [loading, setLoading]           = useState(true);
  const [expandAll, setExpandAll]       = useState<boolean | null>(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);

  // Skeleton on mount
  useEffect(() => { const t = setTimeout(() => setLoading(false), 600); return () => clearTimeout(t); }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchQ(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filtered = useMemo(() => {
    return MOCK_ORGS.filter((o) => {
      if (typeFilter !== "all" && o.type !== typeFilter) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (provinceFilter && o.type !== "ncc" && o.province !== provinceFilter) return false;
      if (dateFrom && o.createdAt < dateFrom) return false;
      if (dateTo && o.createdAt > dateTo + "T23:59:59Z") return false;
      if (searchQ) {
        const q = searchQ.toLowerCase();
        if (!o.name.toLowerCase().includes(q) && !o.code.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [typeFilter, statusFilter, provinceFilter, dateFrom, dateTo, searchQ]);

  const resetFilters = () => {
    setSearchInput(""); setSearchQ("");
    setTypeFilter("all"); setStatusFilter("all");
    setProvinceFilter(""); setDateFrom(""); setDateTo("");
  };

  const kpi = useMemo(() => ({
    soGd:   MOCK_ORGS.filter((o) => o.type === "so_gd").length,
    truong: MOCK_ORGS.filter((o) => o.type === "truong").length,
    ncc:    MOCK_ORGS.filter((o) => o.type === "ncc").length,
    active: MOCK_ORGS.filter((o) => o.status === "active").length,
  }), []);

  const inputCls = "bg-card border border-border rounded-lg px-3 py-2 outline-none focus:border-[#990803] transition-colors text-foreground";
  const selectCls = inputCls + " cursor-pointer";

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Building2}
        title="Quản lý Tổ chức"
        subtitle="Quản lý Sở GD, Trường học và Nhà cung cấp trên nền tảng. Xem theo bảng phẳng hoặc cây phân cấp."
        accentColor="#1e40af"
        actions={
          <button onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1e40af] text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Thêm tổ chức
          </button>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Sở GD", value: kpi.soGd,   color: "#1e40af", icon: Building2 },
          { label: "Trường học", value: kpi.truong, color: "#0e7490", icon: School   },
          { label: "NCC",    value: kpi.ncc,    color: "#6d28d9", icon: Package   },
          { label: "Đang hoạt động", value: kpi.active, color: "#15803d", icon: Users },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: color + "15" }}>
              <Icon className="w-4.5 h-4.5" style={{ color, width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{label}</p>
              <p style={{ fontSize: "20px", fontWeight: 700, lineHeight: 1.2 }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-end">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên hoặc mã đơn vị"
              className={inputCls + " pl-9 w-full"}
              style={{ fontSize: "13px" }} />
            {searchInput && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => { setSearchInput(""); setSearchQ(""); }}>
                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          {/* Type */}
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as OrgType | "all")}
            className={selectCls} style={{ fontSize: "13px" }}>
            <option value="all">Tất cả loại</option>
            <option value="so_gd">Sở GD</option>
            <option value="truong">Trường học</option>
            <option value="ncc">NCC</option>
          </select>
          {/* Status */}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrgStatus | "all")}
            className={selectCls} style={{ fontSize: "13px" }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="suspended">Tạm ngừng</option>
            <option value="trial">Dùng thử</option>
          </select>
          {/* Province */}
          <select value={provinceFilter} onChange={(e) => setProvinceFilter(e.target.value)}
            className={selectCls} style={{ fontSize: "13px" }}>
            <option value="">Tất cả tỉnh/thành</option>
            {PROVINCES_VN.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className={inputCls} style={{ fontSize: "13px" }} />
          <span className="text-muted-foreground text-sm">—</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className={inputCls} style={{ fontSize: "13px" }} />
          <button onClick={() => toast.info(`Tìm kiếm: "${searchQ || "(tất cả)"}"`)}
            className="px-4 py-2 bg-[#1e40af] text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            Tìm kiếm
          </button>
          <button onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 bg-secondary hover:bg-secondary/70 rounded-lg transition-colors text-muted-foreground"
            style={{ fontSize: "13px" }}>
            <RotateCcw className="w-3.5 h-3.5" /> Xoá bộ lọc
          </button>
        </div>
      </div>

      {/* View toggle + tree controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          <button onClick={() => setView("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${view === "table" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            style={{ fontSize: "12px", fontWeight: 500 }}>
            <LayoutList className="w-3.5 h-3.5" /> Bảng phẳng
          </button>
          <button onClick={() => setView("tree")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${view === "tree" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            style={{ fontSize: "12px", fontWeight: 500 }}>
            <Network className="w-3.5 h-3.5" /> Cây phân cấp
          </button>
        </div>
        {view === "tree" && !searchQ && (
          <div className="flex items-center gap-1">
            <button onClick={() => setExpandAll(true)}
              className="px-3 py-1.5 bg-secondary hover:bg-secondary/70 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontSize: "12px" }}>
              Mở rộng tất cả
            </button>
            <button onClick={() => setExpandAll(false)}
              className="px-3 py-1.5 bg-secondary hover:bg-secondary/70 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontSize: "12px" }}>
              Thu gọn tất cả
            </button>
          </div>
        )}
        <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
          {filtered.length} / {MOCK_ORGS.length} tổ chức
        </p>
      </div>

      {/* Content */}
      {view === "table"
        ? <TableView orgs={filtered} loading={loading} searchQ={searchQ} />
        : <TreeView  orgs={filtered} loading={loading} searchQ={searchQ} expandAll={expandAll} />
      }

      <OrganizationCreateDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
}
