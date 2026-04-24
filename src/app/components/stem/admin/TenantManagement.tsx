import { useState } from "react";
import {
  Server, Plus, Search, Eye, Pause, Play, Download,
  KeyRound, HardDrive,
} from "lucide-react";
import { tenants } from "../../mock-data/index";
import type { Tenant, TenantType } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { TenantBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatRelative, formatDate } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  TENANT MANAGEMENT (Admin) — quản lý 4 loại tenant                */
/* ================================================================ */

export function TenantManagementAdmin() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TenantType | "all">("all");

  const filtered = tenants.filter((t) => {
    if (typeFilter !== "all" && t.type !== typeFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) &&
        !t.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const active = tenants.filter((t) => t.active).length;
  const totalLicenses = tenants.reduce((s, t) => s + t.licenseUsed, 0);
  const totalStorage = tenants.reduce((s, t) => s + t.storageUsedGB, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Server}
        title="Quản lý Tenant (Multi-tenancy)"
        subtitle="Khởi tạo và quản lý không gian làm việc độc lập cho từng đại lý, trường học, cơ quan quản lý trên cùng hạ tầng."
        accentColor="#e74c3c"
        actions={
          <button onClick={() => toast.info("Mở wizard onboarding tenant mới")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#e74c3c] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Onboarding tenant
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Server} label="Tổng tenant" value={tenants.length} color="#e74c3c" subtitle={`${active} active`} />
        <KpiCard icon={KeyRound} label="License đang dùng" value={totalLicenses.toLocaleString()} color="#16a34a" />
        <KpiCard icon={HardDrive} label="Storage" value={`${totalStorage} GB`} color="#7c3aed" />
        <KpiCard icon={Plus} label="Tenant mới (30 ngày)" value={3} color="#c8a84e" trend="up" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tenant / mã..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }} />
        </div>
        <button onClick={() => setTypeFilter("all")}
          className={`px-3 py-2 rounded-lg border ${typeFilter === "all" ? "bg-[#e74c3c] text-white border-[#e74c3c]" : "bg-card border-border hover:bg-secondary"}`}
          style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả
        </button>
        {(["supplier", "distributor", "school", "authority"] as TenantType[]).map((t) => {
          const count = tenants.filter((x) => x.type === t).length;
          return (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-lg border ${typeFilter === t ? "bg-[#e74c3c] text-white border-[#e74c3c]" : "bg-card border-border hover:bg-secondary"}`}
              style={{ fontSize: "12px", fontWeight: 500 }}>
              {t === "supplier" ? "NCC" : t === "distributor" ? "Đại lý" : t === "school" ? "Trường" : "Sở/Bộ"} ({count})
            </button>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              <th className="px-4 py-2.5">Tenant</th>
              <th className="px-4 py-2.5">Mã</th>
              <th className="px-4 py-2.5">Loại</th>
              <th className="px-4 py-2.5">License</th>
              <th className="px-4 py-2.5">Storage</th>
              <th className="px-4 py-2.5">Trạng thái</th>
              <th className="px-4 py-2.5">Khởi tạo</th>
              <th className="px-4 py-2.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
            {filtered.map((t) => {
              const licPct = Math.round((t.licenseUsed / t.licenseQuota) * 100);
              const stgPct = Math.round((t.storageUsedGB / t.storageQuotaGB) * 100);
              return (
                <tr key={t.id} className="hover:bg-secondary/50">
                  <td className="px-4 py-3">
                    <p style={{ fontWeight: 500 }}>{t.name}</p>
                    {t.province && <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{t.province}</p>}
                  </td>
                  <td className="px-4 py-3 font-mono" style={{ fontSize: "11px" }}>{t.code}</td>
                  <td className="px-4 py-3"><TenantBadge type={t.type} size="xs" /></td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: "11.5px", fontWeight: 500 }}>{t.licenseUsed.toLocaleString()}/{t.licenseQuota.toLocaleString()}</p>
                    <div className="w-20 h-1 bg-secondary rounded-full overflow-hidden mt-0.5">
                      <div className="h-full bg-[#16a34a]" style={{ width: `${licPct}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: "11.5px" }}>{t.storageUsedGB}/{t.storageQuotaGB} GB</p>
                    <div className="w-20 h-1 bg-secondary rounded-full overflow-hidden mt-0.5">
                      <div className="h-full" style={{
                        width: `${stgPct}%`,
                        backgroundColor: stgPct > 85 ? "#dc2626" : stgPct > 65 ? "#f59e0b" : "#7c3aed",
                      }} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {t.active ? (
                      <span className="inline-flex items-center gap-0.5 text-[#16a34a]" style={{ fontSize: "11px", fontWeight: 600 }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" /> Paused
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11px" }}>{formatDate(t.onboardedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toast.info(`Xem chi tiết ${t.name}`)} className="p-1.5 hover:bg-secondary rounded">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => toast.warning(`${t.active ? "Tạm dừng" : "Kích hoạt"} ${t.name}`)}
                      className="p-1.5 hover:bg-secondary rounded ml-1">
                      {t.active ? <Pause className="w-4 h-4 text-muted-foreground" /> : <Play className="w-4 h-4 text-[#16a34a]" />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TenantManagementAdmin;
