import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, Shield, Users, Check, X, LayoutGrid, Diff,
} from "lucide-react";
import { SYSTEM_ROLES, ROLE_CONFIG_MAP, MODULES, PERM_MATRIX, ACTION_LABELS, getAccountCount } from "./role-data";
import type { RoleKey, Action } from "./role-data";

/* ================================================================ */
/*  HELPERS                                                         */
/* ================================================================ */
const ACTIONS: Action[] = ["view", "create", "edit", "delete"];

function PermCell({ allowed }: { allowed: boolean }) {
  return (
    <div className="flex items-center justify-center">
      {allowed ? (
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-100">
          <Check className="w-3.5 h-3.5 text-green-700" />
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-50">
          <X className="w-3 h-3 text-red-400" />
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  ROLE DETAIL                                                     */
/* ================================================================ */
export function RoleDetail() {
  const { roleKey } = useParams<{ roleKey: string }>();
  const navigate = useNavigate();
  const [diffMode, setDiffMode] = useState(false);

  const config = roleKey ? ROLE_CONFIG_MAP[roleKey as RoleKey] : null;

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
        <Shield className="w-12 h-12 opacity-20" />
        <p className="text-[14px]">Không tìm thấy vai trò</p>
        <button onClick={() => navigate("/admin/roles")}
          className="flex items-center gap-1.5 text-[13px] text-[#1e40af] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
        </button>
      </div>
    );
  }

  const Icon  = config.icon;
  const count = getAccountCount(config.key);
  const perms = PERM_MATRIX[config.key];
  const studentPerms = PERM_MATRIX["student"];

  // Filtered modules for diff mode: show modules that differ from student in at least 1 action
  const visibleModules = diffMode
    ? MODULES.filter((m) =>
        ACTIONS.some((a) => perms[m.key][a] !== studentPerms[m.key][a])
      )
    : MODULES;

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={() => navigate("/admin/roles")}
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Vai trò & Phân quyền
      </button>

      {/* Header card */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: config.bg }}>
            <Icon className="w-7 h-7" style={{ color: config.color }} />
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-bold text-[20px] leading-tight">{config.label}</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary rounded text-[11px] font-medium text-muted-foreground">
                <Shield className="w-3 h-3" /> Hệ thống
              </span>
            </div>
            <p className="text-muted-foreground text-[13px] mb-2">{config.description}</p>
            <div className="flex items-center gap-1.5 text-[13px]">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-semibold" style={{ color: config.color }}>
                {count.toLocaleString("vi-VN")}
              </span>
              <span className="text-muted-foreground">tài khoản đang dùng vai trò này</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ma trận phân quyền */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Table header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div>
            <h2 className="font-semibold text-[14px]">Ma trận phân quyền</h2>
            <p className="text-muted-foreground text-[11.5px] mt-0.5">
              {visibleModules.length} phân hệ · 4 hành động
            </p>
          </div>

          {/* Toggle view mode */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setDiffMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors
                ${!diffMode ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <LayoutGrid className="w-3.5 h-3.5" /> Xem theo phân hệ
            </button>
            <button
              onClick={() => setDiffMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors
                ${diffMode ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Diff className="w-3.5 h-3.5" /> Xem khác biệt
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 py-2 border-b border-border/60 bg-secondary/30 flex items-center gap-4 text-[11.5px] text-muted-foreground">
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
          {diffMode && config.key !== "student" && (
            <span className="text-[11px] italic">
              Hiển thị {visibleModules.length} phân hệ khác với vai trò Học sinh
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {visibleModules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Diff className="w-8 h-8 opacity-20" />
              <p className="text-[13px]">Vai trò này có phân quyền giống hệt Học sinh</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50 text-muted-foreground text-[11px] font-semibold">
                  <th className="px-5 py-3 text-left sticky left-0 bg-secondary/50 w-56">
                    Phân hệ chức năng
                  </th>
                  {ACTIONS.map((a) => (
                    <th key={a} className="px-4 py-3 text-center w-28">
                      {ACTION_LABELS[a]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-[13px]">
                {visibleModules.map((mod, idx) => {
                  const row = perms[mod.key];
                  const hasAny = ACTIONS.some((a) => row[a]);
                  return (
                    <tr key={mod.key}
                      className={`transition-colors ${hasAny ? "hover:bg-secondary/30" : "hover:bg-secondary/20 opacity-60"}`}
                      style={{ backgroundColor: idx % 2 === 0 ? undefined : "var(--secondary)" + "30" }}>
                      <td className="px-5 py-3 sticky left-0 bg-card font-medium text-[12.5px]">
                        {mod.label}
                      </td>
                      {ACTIONS.map((a) => (
                        <td key={a} className="px-4 py-3">
                          <PermCell allowed={row[a]} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACTIONS.map((action) => {
          const allowed = MODULES.filter((m) => perms[m.key][action]).length;
          return (
            <div key={action} className="bg-card rounded-xl border border-border p-4 text-center">
              <p className="text-muted-foreground text-[11px] mb-1">{ACTION_LABELS[action]}</p>
              <p className="text-[22px] font-bold leading-tight" style={{ color: config.color }}>
                {allowed}
              </p>
              <p className="text-muted-foreground text-[10px]">/ {MODULES.length} phân hệ</p>
            </div>
          );
        })}
      </div>

      {/* All roles link */}
      <div className="bg-secondary/40 rounded-xl p-4">
        <p className="text-[12px] text-muted-foreground mb-3 font-medium">So sánh nhanh với vai trò khác</p>
        <div className="flex flex-wrap gap-2">
          {SYSTEM_ROLES.filter((r) => r.key !== config.key).map((r) => {
            const RIcon = r.icon;
            return (
              <a key={r.key} href={`/admin/roles/${r.key}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-secondary transition-colors text-[12px]">
                <RIcon className="w-3.5 h-3.5" style={{ color: r.color }} />
                {r.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RoleDetail;
