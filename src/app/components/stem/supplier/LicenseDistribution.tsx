import { useState } from "react";
import {
  KeyRound, Search, Download, Plus, X, RefreshCw,
  CheckCircle2, AlertTriangle, Copy, Ban,
} from "lucide-react";
import { licenses, tenants } from "../../mock-data/index";
import type { License } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { TenantBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatRelative } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  LICENSE DISTRIBUTION — phát và thu hồi license phần mềm STEM    */
/* ================================================================ */

function tenantName(id: string) { return tenants.find((t) => t.id === id)?.name || id; }
function tenantType(id: string) { return tenants.find((t) => t.id === id)?.type; }

function LicenseRow({ lic }: { lic: License }) {
  const t = tenants.find((t) => t.id === lic.tenantId);
  const now = Date.now();
  const isExpiring = !lic.revokedAt && new Date(lic.expiresAt).getTime() - now < 90 * 86400_000;
  const isRevoked = !!lic.revokedAt;
  const seatsUsagePct = lic.seats > 0 ? Math.round((lic.seatsUsed / lic.seats) * 100) : 0;
  return (
    <tr className="hover:bg-secondary/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>
            {lic.licenseKey}
          </span>
          <button
            onClick={() => { navigator.clipboard?.writeText(lic.licenseKey); toast.success("Đã copy license key"); }}
            className="opacity-60 hover:opacity-100"
            title="Copy"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </td>
      <td className="px-4 py-3 text-foreground" style={{ fontSize: "12.5px", fontWeight: 500 }}>
        {lic.productName}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {t && <TenantBadge type={t.type} size="xs" />}
          <span className="text-foreground truncate max-w-[180px]" style={{ fontSize: "12px" }}>
            {tenantName(lic.tenantId)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className="px-1.5 py-0.5 rounded"
          style={{
            fontSize: "10px", fontWeight: 600,
            color: lic.type === "site" ? "#7c3aed" : lic.type === "per_user" ? "#0891b2" : "#f59e0b",
            backgroundColor: lic.type === "site" ? "#7c3aed15" : lic.type === "per_user" ? "#0891b215" : "#f59e0b15",
          }}
        >
          {lic.type === "per_user" ? "Per user" : lic.type === "per_device" ? "Per device" : "Site"}
        </span>
      </td>
      <td className="px-4 py-3">
        {lic.seats > 0 ? (
          <div>
            <p style={{ fontSize: "12px", fontWeight: 500 }}>
              {lic.seatsUsed}/{lic.seats}
            </p>
            <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full"
                style={{
                  width: `${seatsUsagePct}%`,
                  backgroundColor: seatsUsagePct > 90 ? "#dc2626" : seatsUsagePct > 70 ? "#f59e0b" : "#16a34a",
                }}
              />
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Không giới hạn</span>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>
        {formatRelative(lic.expiresAt)}
      </td>
      <td className="px-4 py-3">
        {isRevoked ? (
          <span className="inline-flex items-center gap-1 text-[#dc2626]" style={{ fontSize: "11px", fontWeight: 600 }}>
            <Ban className="w-3 h-3" /> Đã thu hồi
          </span>
        ) : isExpiring ? (
          <span className="inline-flex items-center gap-1 text-[#f59e0b]" style={{ fontSize: "11px", fontWeight: 600 }}>
            <AlertTriangle className="w-3 h-3" /> Sắp hết hạn
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[#16a34a]" style={{ fontSize: "11px", fontWeight: 600 }}>
            <CheckCircle2 className="w-3 h-3" /> Hoạt động
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => toast.info(`Gia hạn license ${lic.licenseKey}`)}
          className="p-1.5 hover:bg-secondary rounded"
          title="Gia hạn"
        >
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        {!isRevoked && (
          <button
            onClick={() => toast.error(`Thu hồi license ${lic.licenseKey}`)}
            className="p-1.5 hover:bg-secondary rounded ml-1"
            title="Thu hồi"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </td>
    </tr>
  );
}

export function LicenseDistribution() {
  const [search, setSearch] = useState("");
  const [tenantTypeFilter, setTenantTypeFilter] = useState<"all" | "school" | "distributor">("all");

  const filtered = licenses.filter((l) => {
    if (tenantTypeFilter !== "all" && tenantType(l.tenantId) !== tenantTypeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !l.licenseKey.toLowerCase().includes(s) &&
        !l.productName.toLowerCase().includes(s) &&
        !tenantName(l.tenantId).toLowerCase().includes(s)
      ) return false;
    }
    return true;
  });

  const active = licenses.filter((l) => !l.revokedAt).length;
  const totalSeats = licenses.reduce((s, l) => s + l.seats, 0);
  const usedSeats = licenses.reduce((s, l) => s + l.seatsUsed, 0);
  const expiringSoon = licenses.filter(
    (l) => !l.revokedAt && new Date(l.expiresAt).getTime() - Date.now() < 90 * 86400_000
  ).length;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={KeyRound}
        title="Phát & Thu hồi License"
        subtitle="Phân bổ giấy phép phần mềm cho tài khoản / thiết bị / tenant; quản lý vòng đời license."
        actions={
          <>
            <button
              onClick={() => toast.success("Phát 30 license tự động cho tenant đơn hàng vừa duyệt")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Plus className="w-4 h-4" />
              Phát license
            </button>
            <button
              onClick={() => toast.info("Xuất danh sách license đang hoạt động")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Download className="w-4 h-4" />
              Xuất Excel
            </button>
          </>
        }
      />

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={KeyRound} label="License đang hoạt động" value={active.toLocaleString()} color="#16a34a" />
        <KpiCard icon={CheckCircle2} label="Seats đã sử dụng" value={`${usedSeats}/${totalSeats}`} color="#0891b2" subtitle={`${Math.round((usedSeats / totalSeats) * 100)}% utilization`} />
        <KpiCard icon={AlertTriangle} label="Sắp hết hạn (≤ 90 ngày)" value={expiringSoon} color="#f59e0b" trend="up" />
        <KpiCard icon={Ban} label="Đã thu hồi" value={licenses.length - active} color="#64748b" />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm license key / sản phẩm / tenant..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }}
          />
        </div>
        {(["all", "school", "distributor"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTenantTypeFilter(k)}
            className={`px-3 py-2 rounded-lg border ${
              tenantTypeFilter === k ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"
            }`}
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            {k === "all" ? "Tất cả" : k === "school" ? "Trường" : "Đại lý"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <tr>
                <th className="px-4 py-2.5">License key</th>
                <th className="px-4 py-2.5">Sản phẩm</th>
                <th className="px-4 py-2.5">Tenant</th>
                <th className="px-4 py-2.5">Loại</th>
                <th className="px-4 py-2.5">Seats</th>
                <th className="px-4 py-2.5">Hết hạn</th>
                <th className="px-4 py-2.5">Trạng thái</th>
                <th className="px-4 py-2.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.slice(0, 40).map((lic) => <LicenseRow key={lic.id} lic={lic} />)}
            </tbody>
          </table>
        </div>
        {filtered.length > 40 && (
          <div className="p-3 border-t border-border text-center text-muted-foreground" style={{ fontSize: "12px" }}>
            Hiển thị 40/{filtered.length}. Lọc thêm để thu hẹp kết quả.
          </div>
        )}
      </div>
    </div>
  );
}

export default LicenseDistribution;
