import { useState, useMemo } from "react";
import {
  Users, Plus, Search, Eye, Pause, Play, Mail, ShieldCheck,
  Download, Filter, KeyRound,
} from "lucide-react";
import {
  demoAccounts, roleLabelsMap, tenantTypeLabelsMap,
} from "../../AuthContext";
import type { StemRole, TenantType } from "../../AuthContext";
import { tenants } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { TenantBadge } from "../ui/badges";
import { toast } from "sonner";

/* ================================================================ */
/*  USER MANAGEMENT (Admin) — Toàn bộ users trên Platform            */
/* ================================================================ */

// Generate more users by variating base demo accounts
function generateAllUsers() {
  const surnames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Đỗ", "Bùi", "Đặng", "Ngô"];
  const givenNames = ["An", "Bảo", "Châu", "Dũng", "Hà", "Hương", "Khang", "Linh", "Minh", "Nga", "Phúc", "Quân", "Sơn", "Thảo", "Trang", "Việt", "Xuân", "Yến"];
  const all = [...demoAccounts];
  let idx = 100;
  for (const t of tenants) {
    const nUsers = t.type === "school" ? 6 : t.type === "distributor" ? 4 : 3;
    const rolePool: StemRole[] =
      t.type === "school" ? ["school_principal", "school_admin", "school_itadmin", "teacher", "teacher", "student"]
      : t.type === "distributor" ? ["distributor_admin", "distributor_sales", "distributor_sales", "distributor_finance"]
      : t.type === "authority" ? ["authority_admin", "authority_viewer", "authority_viewer"]
      : ["supplier_admin", "supplier_content", "supplier_sales", "supplier_warranty"];
    for (let i = 0; i < nUsers; i++) {
      const name = `${surnames[idx % surnames.length]} ${givenNames[(idx + 3) % givenNames.length]} ${givenNames[(idx + 7) % givenNames.length]}`;
      all.push({
        id: `U-GEN-${idx}`,
        name,
        email: `user${idx}@${t.code.toLowerCase()}.vn`,
        password: "stem@123",
        avatar: "",
        tenantId: t.id,
        tenantName: t.name,
        tenantType: t.type,
        role: rolePool[i % rolePool.length],
        legacyRole: "learner",
        position: roleLabelsMap[rolePool[i % rolePool.length]].label,
        initials: name.split(" ").slice(-2).map((s) => s[0]).join(""),
        vneidVerified: idx % 3 !== 0,
        province: t.province,
        district: t.district,
      });
      idx++;
    }
  }
  return all;
}

export function UserManagementAdmin() {
  const [users] = useState(generateAllUsers());
  const [search, setSearch] = useState("");
  const [tenantTypeFilter, setTenantTypeFilter] = useState<TenantType | "all">("all");
  const [roleFilter, setRoleFilter] = useState<StemRole | "all">("all");

  const filtered = useMemo(() => users.filter((u) => {
    if (tenantTypeFilter !== "all" && u.tenantType !== tenantTypeFilter) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) &&
          !u.tenantName.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [users, tenantTypeFilter, roleFilter, search]);

  const vneidCount = users.filter((u) => u.vneidVerified).length;
  const roleStats = useMemo(() => {
    const stats: Record<string, number> = {};
    users.forEach((u) => { stats[u.role] = (stats[u.role] || 0) + 1; });
    return stats;
  }, [users]);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Users}
        title="Người dùng toàn hệ thống"
        subtitle="Quản lý tài khoản trên mọi tenant — tìm kiếm, reset password, gán role, khóa/mở tài khoản."
        accentColor="#e74c3c"
        actions={
          <>
            <button onClick={() => toast.info("Xuất CSV toàn bộ users")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Xuất CSV
            </button>
            <button onClick={() => toast.success("Tạo user mới + gán tenant")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#e74c3c] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Tạo user
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users} label="Tổng users" value={users.length.toLocaleString()} color="#e74c3c" subtitle={`Trên ${tenants.length} tenant`} />
        <KpiCard icon={ShieldCheck} label="Đã xác thực VNeID" value={vneidCount} color="#16a34a" subtitle={`${Math.round(vneidCount / users.length * 100)}%`} />
        <KpiCard icon={KeyRound} label="Roles khác nhau" value={Object.keys(roleStats).length} color="#7c3aed" />
        <KpiCard icon={Filter} label="User mới (30d)" value={18} color="#c8a84e" trend="up" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên / email / tenant..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }} />
        </div>
        <select value={tenantTypeFilter} onChange={(e) => setTenantTypeFilter(e.target.value as any)}
          className="px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả loại tenant</option>
          {(["supplier", "distributor", "school", "authority"] as TenantType[]).map((t) => (
            <option key={t} value={t}>{tenantTypeLabelsMap[t].label}</option>
          ))}
        </select>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả role</option>
          {Object.keys(roleLabelsMap).map((r) => (
            <option key={r} value={r}>{roleLabelsMap[r as StemRole].label} ({roleStats[r] || 0})</option>
          ))}
        </select>
      </div>

      <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
        Hiển thị {filtered.length}/{users.length}
      </p>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <tr>
                <th className="px-4 py-2.5">User</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Tenant</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">VNeID</th>
                <th className="px-4 py-2.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
              {filtered.slice(0, 50).map((u) => {
                const role = roleLabelsMap[u.role];
                return (
                  <tr key={u.id} className="hover:bg-secondary/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0" style={{
                          fontSize: "11px", fontWeight: 700,
                          background: "linear-gradient(145deg, #990803, #7a0602)",
                        }}>{u.initials}</div>
                        <div>
                          <p style={{ fontWeight: 500 }}>{u.name}</p>
                          <p className="text-muted-foreground font-mono" style={{ fontSize: "10.5px" }}>{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground" style={{ fontSize: "11px" }}>{u.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <TenantBadge type={u.tenantType} size="xs" />
                        <span className="truncate max-w-[150px]" style={{ fontSize: "11.5px" }}>{u.tenantName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded" style={{
                        fontSize: "10.5px", fontWeight: 600,
                        color: role.color, backgroundColor: role.bg,
                      }}>
                        {role.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.vneidVerified ? (
                        <span className="inline-flex items-center gap-0.5 text-[#16a34a]" style={{ fontSize: "11px", fontWeight: 600 }}>
                          <ShieldCheck className="w-3 h-3" /> Xác thực
                        </span>
                      ) : (
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => toast.info(`Xem profile ${u.name}`)} className="p-1.5 hover:bg-secondary rounded" title="Xem">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => toast.info(`Reset password ${u.email}`)} className="p-1.5 hover:bg-secondary rounded ml-1" title="Reset password">
                        <KeyRound className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => toast.info(`Email ${u.email}`)} className="p-1.5 hover:bg-secondary rounded ml-1" title="Email">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => toast.warning(`Tạm khóa ${u.name}`)} className="p-1.5 hover:bg-secondary rounded ml-1" title="Tạm khóa">
                        <Pause className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && (
          <div className="p-3 border-t border-border text-center text-muted-foreground" style={{ fontSize: "12px" }}>
            Hiển thị 50/{filtered.length}. Thu hẹp bộ lọc để xem hết.
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagementAdmin;
