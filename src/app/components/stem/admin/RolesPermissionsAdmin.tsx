import { useState } from "react";
import {
  Shield, Plus, Pencil, Copy, Trash2, Check, X,
  Users, Lock,
} from "lucide-react";
import { roleLabelsMap } from "../../AuthContext";
import type { StemRole } from "../../AuthContext";
import { PERMISSIONS } from "../../permissions";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "sonner";

/* ================================================================ */
/*  ROLES & PERMISSIONS (Admin) — RBAC Matrix manager               */
/* ================================================================ */

const NAMESPACES = [
  { key: "/supplier",    label: "NCC" },
  { key: "/distributor", label: "Đại lý" },
  { key: "/school",      label: "Trường" },
  { key: "/authority",   label: "Sở/Bộ" },
  { key: "/teacher",     label: "GV" },
  { key: "/student",     label: "HS" },
  { key: "/admin",       label: "Admin" },
  { key: "/shared",      label: "Chung" },
];

function hasAccess(role: StemRole, namespace: string): "full" | "partial" | "none" {
  const perms = PERMISSIONS[role] || [];
  if (perms.includes("*")) return "full";
  const matchFull = perms.some((p) => p === namespace);
  if (matchFull) return "full";
  const matchPartial = perms.some((p) => p.startsWith(namespace + "/"));
  return matchPartial ? "partial" : "none";
}

export function RolesPermissionsAdmin() {
  const [selectedRole, setSelectedRole] = useState<StemRole>("school_principal");
  const roles = Object.keys(roleLabelsMap) as StemRole[];
  const roleInfo = roleLabelsMap[selectedRole];
  const rolePerms = PERMISSIONS[selectedRole] || [];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Shield}
        title="Vai trò & Phân quyền (RBAC)"
        subtitle="Ma trận phân quyền 15 StemRole × 8 namespace. Tạo role mới, sao chép, điều chỉnh permissions chi tiết."
        accentColor="#e74c3c"
        actions={
          <>
            <button onClick={() => toast.success(`Sao chép role ${roleInfo.label}`)}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Copy className="w-4 h-4" /> Sao chép
            </button>
            <button onClick={() => toast.success("Tạo role tùy chỉnh")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#e74c3c] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Tạo role mới
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Shield} label="Roles hệ thống" value={roles.length} color="#e74c3c" />
        <KpiCard icon={Lock} label="Namespace" value={NAMESPACES.length} color="#7c3aed" />
        <KpiCard icon={Users} label="Role có user" value={roles.length - 1} color="#16a34a" />
        <KpiCard icon={Pencil} label="Custom roles" value={0} color="#c8a84e" subtitle="Chưa tạo role tùy chỉnh" />
      </div>

      {/* Matrix */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Ma trận phân quyền 15 × 8</h3>
          <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
            <span className="inline-block w-3 h-3 bg-[#16a34a] rounded-sm mr-1 align-middle" /> Full access
            <span className="inline-block w-3 h-3 bg-[#f59e0b] rounded-sm mr-1 ml-3 align-middle" /> Partial
            <span className="inline-block w-3 h-3 bg-secondary border border-border rounded-sm mr-1 ml-3 align-middle" /> Denied
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left sticky left-0 bg-secondary/30 z-10 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>Role</th>
                {NAMESPACES.map((n) => (
                  <th key={n.key} className="px-3 py-2 text-center text-muted-foreground" style={{ fontSize: "10.5px", fontWeight: 600 }}>
                    {n.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {roles.map((r) => {
                const info = roleLabelsMap[r];
                const active = selectedRole === r;
                return (
                  <tr key={r} onClick={() => setSelectedRole(r)}
                    className={`cursor-pointer ${active ? "bg-[#e74c3c]/5" : "hover:bg-secondary/30"}`}>
                    <td className="px-3 py-2 sticky left-0 bg-inherit">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded" style={{
                          fontSize: "10.5px", fontWeight: 600,
                          color: info.color, backgroundColor: info.bg,
                        }}>
                          {info.label}
                        </span>
                      </div>
                    </td>
                    {NAMESPACES.map((n) => {
                      const acc = hasAccess(r, n.key);
                      return (
                        <td key={n.key} className="px-3 py-2 text-center">
                          <div className="inline-flex items-center justify-center w-6 h-6 rounded" style={{
                            backgroundColor: acc === "full" ? "#16a34a" : acc === "partial" ? "#f59e0b" : "var(--secondary)",
                            border: acc === "none" ? "1px solid var(--border)" : "none",
                          }}>
                            {acc === "full" && <Check className="w-3.5 h-3.5 text-white" />}
                            {acc === "partial" && <span className="text-white" style={{ fontSize: "10px", fontWeight: 700 }}>½</span>}
                            {acc === "none" && <X className="w-3 h-3 text-muted-foreground" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role detail panel */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-[#e74c3c]" />
          <h3 style={{ fontSize: "15px", fontWeight: 700 }}>
            Chi tiết: {roleInfo.label}
          </h3>
          <span className="ml-auto text-muted-foreground font-mono" style={{ fontSize: "11px" }}>{selectedRole}</span>
        </div>
        <p className="text-muted-foreground mb-4" style={{ fontSize: "12px" }}>
          Danh sách path prefix mà role này được phép truy cập. <code className="bg-secondary px-1 rounded font-mono">*</code> nghĩa là toàn quyền.
        </p>
        <div className="flex flex-wrap gap-2">
          {rolePerms.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary rounded-md font-mono"
              style={{ fontSize: "11.5px" }}>
              <Check className="w-3 h-3 text-[#16a34a]" />
              {p}
            </span>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2">
          <button onClick={() => toast.info(`Sửa permissions role ${roleInfo.label}`)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#e74c3c] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Pencil className="w-4 h-4" /> Sửa permissions
          </button>
          <button onClick={() => toast.info(`Xem users có role ${roleInfo.label}`)}
            className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Users className="w-4 h-4" /> Xem users có role này
          </button>
          {!["system_admin", "supplier_admin", "distributor_admin", "school_principal", "authority_admin", "teacher", "student"].includes(selectedRole) && (
            <button onClick={() => toast.error(`Xóa role ${roleInfo.label}`)}
              className="flex items-center gap-1.5 px-3 py-2 border border-[#dc2626]/30 text-[#dc2626] rounded-lg hover:bg-[#dc2626]/5 ml-auto"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Trash2 className="w-4 h-4" /> Xóa role
            </button>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#e74c3c]/5 to-[#c8a84e]/5 rounded-xl border border-border p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-[#e74c3c] shrink-0 mt-0.5" />
        <div>
          <p style={{ fontSize: "13px", fontWeight: 600 }}>Quy tắc phân quyền</p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "12px", lineHeight: 1.6 }}>
            RBAC matrix lưu trong <code className="bg-secondary px-1 rounded font-mono">permissions.ts</code>.
            Khi sửa quyền của role, mọi user có role đó sẽ bị ảnh hưởng ngay lập tức ở lần load trang tiếp theo.
            Nên log mọi thay đổi permission vào Audit Log để kiểm toán.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RolesPermissionsAdmin;
