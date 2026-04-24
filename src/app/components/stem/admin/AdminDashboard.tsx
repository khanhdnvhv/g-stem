import { Link } from "react-router";
import {
  LayoutDashboard, Server, Users, Database, Shield,
  Activity, Plug, KeyRound, ChevronRight, TrendingUp, CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import {
  tenants, tenantsByType, licenses, dataSyncRecords,
} from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { TenantBadge } from "../ui/badges";
import { formatRelative } from "../ui/format";

/* ================================================================ */
/*  ADMIN DASHBOARD — System Administration                          */
/* ================================================================ */

export function AdminDashboard() {
  const { user } = useAuth();

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.active).length;
  const totalLicenses = licenses.length;
  const activeLicenses = licenses.filter((l) => !l.revokedAt).length;

  const storageUsed = tenants.reduce((s, t) => s + t.storageUsedGB, 0);
  const storageQuota = tenants.reduce((s, t) => s + t.storageQuotaGB, 0);

  const syncErrors = dataSyncRecords.filter((r) => r.status === "error").length;

  const topTenants = [...tenants]
    .sort((a, b) => b.licenseUsed - a.licenseUsed).slice(0, 5);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard Platform"
        subtitle={`${user?.name} · System Administrator. Trạng thái toàn bộ hạ tầng Geleximco STEM.`}
        accentColor="#e74c3c"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Server} label="Tenant hoạt động" value={`${activeTenants}/${totalTenants}`} color="#e74c3c" />
        <KpiCard icon={KeyRound} label="License đang dùng" value={activeLicenses.toLocaleString()} color="#16a34a" change="+8%" trend="up" />
        <KpiCard icon={Database} label="Lưu trữ" value={`${storageUsed}/${storageQuota} GB`}
          color="#7c3aed" subtitle={`${Math.round(storageUsed / storageQuota * 100)}% quota`} />
        <KpiCard icon={AlertTriangle} label="Lỗi đồng bộ" value={syncErrors} color="#dc2626" trend={syncErrors > 0 ? "up" : "flat"} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Activity} label="Uptime" value="99.95%" color="#16a34a" />
        <KpiCard icon={Users} label="Users toàn platform" value="12.4k" color="#2563eb" />
        <KpiCard icon={Plug} label="API calls/24h" value="284k" color="#c8a84e" />
        <KpiCard icon={Shield} label="Sự cố bảo mật" value={0} color="#16a34a" />
      </div>

      {/* Tenant breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 style={{ fontSize: "14px", fontWeight: 600 }}>
              <Server className="w-4 h-4 inline mr-1.5" />
              Tenant theo loại
            </h3>
            <Link to="/admin/tenants" className="text-[#990803] flex items-center gap-1" style={{ fontSize: "12px" }}>
              Quản lý <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {(["supplier", "distributor", "school", "authority"] as const).map((t) => (
              <div key={t} className="p-3 flex items-center gap-3">
                <TenantBadge type={t} size="md" />
                <span className="flex-1 text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>
                  {t === "supplier" ? "Nhà cung cấp" : t === "distributor" ? "Đại lý" : t === "school" ? "Trường học" : "Cơ quan QL"}
                </span>
                <span style={{ fontSize: "16px", fontWeight: 700 }}>{tenantsByType[t].length}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 style={{ fontSize: "14px", fontWeight: 600 }}>
              <TrendingUp className="w-4 h-4 inline mr-1.5" />
              Top 5 tenant sử dụng nhiều license
            </h3>
            <Link to="/admin/licenses" className="text-[#990803] flex items-center gap-1" style={{ fontSize: "12px" }}>
              Chi tiết <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {topTenants.map((t) => {
              const usagePct = Math.round((t.licenseUsed / t.licenseQuota) * 100);
              return (
                <div key={t.id} className="p-3">
                  <div className="flex items-center gap-2">
                    <TenantBadge type={t.type} size="xs" />
                    <p className="flex-1 truncate" style={{ fontSize: "12.5px", fontWeight: 500 }}>{t.name}</p>
                    <span style={{ fontSize: "12px", fontWeight: 600 }}>
                      {t.licenseUsed.toLocaleString()}/{t.licenseQuota.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1.5">
                    <div className="h-full" style={{
                      width: `${usagePct}%`,
                      backgroundColor: usagePct > 85 ? "#dc2626" : usagePct > 65 ? "#f59e0b" : "#16a34a",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-gradient-to-br from-[#e74c3c]/5 to-[#990803]/5 rounded-xl border border-border p-4">
        <p className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Thao tác nhanh</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { to: "/admin/tenant-onboarding", icon: Server, label: "Onboarding tenant mới" },
            { to: "/admin/dev-portal", icon: Plug, label: "Dev Portal / API" },
            { to: "/admin/data-lake", icon: Database, label: "Data Lake" },
            { to: "/admin/security", icon: Shield, label: "Cấu hình Bảo mật" },
          ].map((q) => (
            <Link key={q.to} to={q.to}
              className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border hover:shadow-md"
              style={{ fontSize: "12.5px", fontWeight: 500 }}>
              <q.icon className="w-4 h-4 text-[#e74c3c]" />
              {q.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
