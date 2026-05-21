import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  Shield, Users, Check, X, LayoutGrid, Diff, Info,
  Building2, School, Package, ChevronRight,
} from "lucide-react";
import { PageHeader } from "../ui/PageHeader";
import { formatDate } from "../ui/format";
import { MOCK_ACCOUNTS, ROLE_DISPLAY, STATUS_DISPLAY } from "./account-data";
import { MOCK_ORGS } from "./org-data";
import {
  SYSTEM_ROLES, ROLE_CONFIG_MAP, MODULES, PERM_MATRIX,
  ACTION_LABELS, ACTIONS, getAccountCount,
} from "./role-data";
import type { RoleKey, Action } from "./role-data";
import type { OrgType } from "./org-data";

/* ================================================================ */
/*  HELPERS                                                         */
/* ================================================================ */
const ORG_CFG: Record<OrgType, { label: string; color: string; bg: string }> = {
  so_gd:  { label: "Sở GD",  color: "#1e40af", bg: "#dbeafe" },
  truong: { label: "Trường", color: "#0e7490", bg: "#cffafe" },
  ncc:    { label: "NCC",    color: "#6d28d9", bg: "#ede9fe" },
};

function initials(name: string) {
  return name.trim().split(" ").slice(-2).map((p) => p[0]).join("").toUpperCase();
}

function relativeTime(iso: string | null) {
  if (!iso) return "Chưa đăng nhập";
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "Vừa xong";
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d} ngày trước` : `${Math.floor(d / 30)} tháng trước`;
}

/* ================================================================ */
/*  TAB: DANH SÁCH TÀI KHOẢN                                       */
/* ================================================================ */
function AccountsTab({ roleKey }: { roleKey: RoleKey }) {
  const config   = ROLE_CONFIG_MAP[roleKey];
  const orgMap   = useMemo(() => Object.fromEntries(MOCK_ORGS.map((o) => [o.id, o])), []);

  const accounts = useMemo(
    () => MOCK_ACCOUNTS.filter((a) => (config.stemRoles as string[]).includes(a.role)),
    [config.stemRoles]
  );

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <Users className="w-10 h-10 opacity-20" />
        <p className="text-[13px]">Chưa có tài khoản nào với vai trò này</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12.5px]">
        <thead className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
          <tr>
            <th className="px-4 py-2.5 text-left">Họ tên</th>
            <th className="px-4 py-2.5 text-left">Tổ chức</th>
            <th className="px-4 py-2.5 text-left">Trạng thái</th>
            <th className="px-4 py-2.5 text-left">Đăng nhập cuối</th>
            <th className="px-4 py-2.5 text-left">Ngày tạo</th>
            <th className="px-4 py-2.5 text-right" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {accounts.map((acc) => {
            const roleCfg   = ROLE_DISPLAY[acc.role];
            const statusCfg = STATUS_DISPLAY[acc.status];
            const org       = orgMap[acc.orgId];
            const orgCfg    = org ? ORG_CFG[org.type] : null;
            const bgColor   = roleCfg.color + "22";

            return (
              <tr key={acc.id} className="hover:bg-secondary/30 transition-colors">
                {/* Họ tên */}
                <td className="px-4 py-3">
                  <Link to={`/admin/accounts/${acc.id}`}
                    className="flex items-center gap-2 hover:text-[#1e40af] transition-colors">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-semibold text-[10px]"
                      style={{ backgroundColor: bgColor, color: roleCfg.color }}>
                      {initials(acc.name)}
                    </div>
                    <div>
                      <p className="font-medium leading-tight">{acc.name}</p>
                      <p className="text-muted-foreground text-[10px] font-mono">{acc.code}</p>
                    </div>
                  </Link>
                </td>

                {/* Tổ chức */}
                <td className="px-4 py-3">
                  {org && orgCfg ? (
                    <div className="flex items-center gap-1.5 max-w-[160px]">
                      <span className="px-1 py-0.5 rounded text-[9px] font-semibold shrink-0"
                        style={{ color: orgCfg.color, backgroundColor: orgCfg.bg }}>
                        {orgCfg.label}
                      </span>
                      <span className="truncate text-[11.5px]">{org.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                {/* Trạng thái */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ color: statusCfg.color, backgroundColor: statusCfg.bg }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusCfg.dot }} />
                    {statusCfg.label}
                  </span>
                </td>

                {/* Đăng nhập cuối */}
                <td className="px-4 py-3 text-muted-foreground text-[11.5px]">
                  {relativeTime(acc.lastLogin)}
                </td>

                {/* Ngày tạo */}
                <td className="px-4 py-3 text-muted-foreground text-[11.5px]">
                  {formatDate(acc.createdAt)}
                </td>

                {/* Link chi tiết */}
                <td className="px-4 py-3 text-right">
                  <Link to={`/admin/accounts/${acc.id}`}
                    className="p-1 hover:bg-secondary rounded transition-colors inline-flex">
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================ */
/*  TAB: DANH SÁCH QUYỀN                                           */
/* ================================================================ */
function PermissionsTab({ roleKey }: { roleKey: RoleKey }) {
  const [diffMode, setDiffMode] = useState(false);

  const perms        = PERM_MATRIX[roleKey];
  const studentPerms = PERM_MATRIX["student"];

  const visibleModules = diffMode
    ? MODULES.filter((m) => ACTIONS.some((a) => perms[m.key][a] !== studentPerms[m.key][a]))
    : MODULES;

  return (
    <div className="space-y-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-3 text-[11.5px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-green-700" />
            </div>
            Được phép
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center">
              <X className="w-2.5 h-2.5 text-red-400" />
            </div>
            Không được phép
          </span>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-0.5 bg-secondary rounded-lg p-1">
          <button onClick={() => setDiffMode(false)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11.5px] font-medium transition-colors
              ${!diffMode ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <LayoutGrid className="w-3 h-3" /> Tất cả
          </button>
          <button onClick={() => setDiffMode(true)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11.5px] font-medium transition-colors
              ${diffMode ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <Diff className="w-3 h-3" /> Khác biệt
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {visibleModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <Diff className="w-8 h-8 opacity-20" />
            <p className="text-[13px]">Phân quyền giống hệt vai trò Học sinh</p>
          </div>
        ) : (
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-secondary/50 text-muted-foreground text-[10.5px] font-semibold">
                <th className="px-4 py-2.5 text-left sticky left-0 bg-secondary/50">Phân hệ chức năng</th>
                {ACTIONS.map((a) => (
                  <th key={a} className="px-3 py-2.5 text-center w-24">{ACTION_LABELS[a]}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleModules.map((mod) => {
                const row    = perms[mod.key];
                const hasAny = ACTIONS.some((a) => row[a]);
                return (
                  <tr key={mod.key}
                    className={`transition-colors hover:bg-secondary/30 ${!hasAny ? "opacity-55" : ""}`}>
                    <td className="px-4 py-2.5 font-medium text-[12px] sticky left-0 bg-card">{mod.label}</td>
                    {ACTIONS.map((a: Action) => (
                      <td key={a} className="px-3 py-2.5">
                        <div className="flex items-center justify-center">
                          {row[a] ? (
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-700" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center">
                              <X className="w-2.5 h-2.5 text-red-400" />
                            </div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-0 border-t border-border">
        {ACTIONS.map((action, i) => {
          const allowed = MODULES.filter((m) => perms[m.key][action]).length;
          const config  = ROLE_CONFIG_MAP[roleKey];
          return (
            <div key={action}
              className={`px-4 py-3 text-center ${i < 3 ? "border-r border-border" : ""} bg-secondary/20`}>
              <p className="text-muted-foreground text-[10px] mb-0.5">{ACTION_LABELS[action]}</p>
              <p className="font-bold text-[15px]" style={{ color: config.color }}>{allowed}</p>
              <p className="text-muted-foreground text-[9.5px]">/ {MODULES.length}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  MAIN                                                            */
/* ================================================================ */
type TabKey = "accounts" | "permissions";

export function RolesPermissionsAdmin() {
  const [selectedRole, setSelectedRole] = useState<RoleKey>("student");
  const [tab, setTab] = useState<TabKey>("accounts");

  const config = ROLE_CONFIG_MAP[selectedRole];
  const Icon   = config.icon;
  const count  = getAccountCount(selectedRole);

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Shield}
        title="Vai trò & Phân quyền"
        subtitle="6 vai trò cố định V1 — chọn vai trò để xem tài khoản được phân quyền và ma trận quyền hạn."
        accentColor="#1e40af"
      />

      {/* Banner */}
      <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-blue-800">
          Phân quyền V1 được cố định theo thiết kế hệ thống.
          Tính năng tuỳ chỉnh vai trò sẽ được mở trong phiên bản <strong>V2</strong>.
        </p>
      </div>

      {/* Master-detail layout */}
      <div className="flex gap-4 items-start">

        {/* ===== LEFT PANEL: Role list ===== */}
        <div className="w-52 shrink-0 bg-card rounded-xl border border-border overflow-hidden sticky top-4">
          <div className="px-3 py-2.5 border-b border-border">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Vai trò hệ thống</p>
          </div>
          <div className="py-1">
            {SYSTEM_ROLES.map((role) => {
              const RIcon    = role.icon;
              const rCount   = getAccountCount(role.key);
              const isActive = selectedRole === role.key;
              return (
                <button key={role.key}
                  onClick={() => { setSelectedRole(role.key); setTab("accounts"); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors
                    ${isActive ? "bg-[#1e40af]/8" : "hover:bg-secondary"}`}>
                  {/* Left accent bar */}
                  <div className={`w-0.5 h-8 rounded-full shrink-0 transition-colors
                    ${isActive ? "" : "bg-transparent"}`}
                    style={{ backgroundColor: isActive ? role.color : "transparent" }} />

                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isActive ? role.bg : "var(--secondary)" }}>
                    <RIcon className="w-3.5 h-3.5"
                      style={{ color: isActive ? role.color : "var(--muted-foreground)" }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[12.5px] leading-tight truncate font-medium
                      ${isActive ? "" : "text-muted-foreground"}`}
                      style={{ color: isActive ? role.color : undefined }}>
                      {role.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{rCount} tài khoản</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== RIGHT PANEL: Detail ===== */}
        <div className="flex-1 min-w-0 bg-card rounded-xl border border-border overflow-hidden">

          {/* Role header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: config.bg }}>
              <Icon className="w-5 h-5" style={{ color: config.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-[16px]">{config.label}</h2>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-secondary rounded text-[10px] font-medium text-muted-foreground">
                  <Shield className="w-2.5 h-2.5" /> Hệ thống
                </span>
              </div>
              <p className="text-muted-foreground text-[12px] truncate">{config.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-[18px]" style={{ color: config.color }}>
                {count.toLocaleString("vi-VN")}
              </p>
              <p className="text-muted-foreground text-[10.5px]">tài khoản</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {([
              { key: "accounts",    label: "Danh sách tài khoản", icon: Users   },
              { key: "permissions", label: "Danh sách quyền",      icon: Shield  },
            ] as { key: TabKey; label: string; icon: typeof Users }[]).map(({ key, label, icon: TIcon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-5 py-3 text-[13px] font-medium border-b-2 transition-colors
                  ${tab === key
                    ? "border-[#1e40af] text-[#1e40af]"
                    : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <TIcon className="w-3.5 h-3.5" />
                {label}
                {key === "accounts" && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold ml-0.5"
                    style={{ color: config.color, backgroundColor: config.bg }}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "accounts"    && <AccountsTab    roleKey={selectedRole} />}
          {tab === "permissions" && <PermissionsTab roleKey={selectedRole} />}
        </div>
      </div>
    </div>
  );
}

export default RolesPermissionsAdmin;
