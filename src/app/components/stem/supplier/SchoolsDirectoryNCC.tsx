import { useState, useMemo } from "react";
import {
  School as SchoolIcon, Search, Eye, Download, MapPin,
  GraduationCap, Users, Boxes, DollarSign, TrendingUp,
} from "lucide-react";
import {
  tenantsByType, equipmentBySchool, orders, contracts,
} from "../../mock-data/index";
import type { Tenant } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatVNDCompact } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  SCHOOLS DIRECTORY (Supplier view) — Danh bạ trường mua STEM     */
/* ================================================================ */

interface SchoolRow {
  tenant: Tenant;
  studentsEst: number;
  equipmentCount: number;
  activeContracts: number;
  totalSpendVND: number;
  lastOrderAt?: string;
}

function buildData(): SchoolRow[] {
  return tenantsByType.school.map((t, i) => {
    const eq = equipmentBySchool(t.id);
    const myOrders = orders.filter((o) => o.fromTenantId === t.id);
    const myContracts = contracts.filter((c) => c.schoolId === t.id);
    const totalSpend = myContracts.reduce((s, c) => s + c.totalVND, 0);
    const last = myOrders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return {
      tenant: t,
      studentsEst: 600 + (i * 73) % 1800,
      equipmentCount: eq.length,
      activeContracts: myContracts.filter((c) => c.status === "active").length,
      totalSpendVND: totalSpend,
      lastOrderAt: last?.createdAt,
    };
  });
}

export function SchoolsDirectoryNCC() {
  const [rows] = useState(buildData());
  const [search, setSearch] = useState("");
  const [provinceFilter, setProvinceFilter] = useState<string | "all">("all");

  const provinces = Array.from(new Set(rows.map((r) => r.tenant.province || "")));

  const filtered = useMemo(() => rows.filter((r) => {
    if (provinceFilter !== "all" && r.tenant.province !== provinceFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.tenant.name.toLowerCase().includes(q) && !r.tenant.code.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [rows, search, provinceFilter]);

  const totalSpend = rows.reduce((s, r) => s + r.totalSpendVND, 0);
  const activeCustomers = rows.filter((r) => r.activeContracts > 0).length;
  const totalStudents = rows.reduce((s, r) => s + r.studentsEst, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={SchoolIcon}
        title="Danh bạ Trường học"
        subtitle="Tất cả trường học đã mua gói STEM từ Geleximco — xem doanh thu, hợp đồng, thiết bị đã cấp."
        accentColor="#990803"
        actions={
          <button onClick={() => toast.success("Xuất Excel danh bạ trường")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={SchoolIcon} label="Trường khách hàng" value={rows.length} color="#990803" subtitle={`${activeCustomers} đang active`} />
        <KpiCard icon={Users} label="Học sinh thụ hưởng" value={totalStudents.toLocaleString()} color="#2563eb" />
        <KpiCard icon={DollarSign} label="Doanh thu cộng dồn" value={formatVNDCompact(totalSpend)} color="#c8a84e" change="+18%" trend="up" />
        <KpiCard icon={MapPin} label="Tỉnh/thành phủ" value={provinces.length} color="#16a34a" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm trường / mã..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }} />
        </div>
        <select value={provinceFilter} onChange={(e) => setProvinceFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả tỉnh/TP</option>
          {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              <th className="px-4 py-2.5">Trường</th>
              <th className="px-4 py-2.5">Địa bàn</th>
              <th className="px-4 py-2.5 text-right">Học sinh</th>
              <th className="px-4 py-2.5 text-right">Thiết bị</th>
              <th className="px-4 py-2.5 text-right">HĐ active</th>
              <th className="px-4 py-2.5 text-right">Doanh thu</th>
              <th className="px-4 py-2.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
            {filtered.map((r) => (
              <tr key={r.tenant.id} className="hover:bg-secondary/50">
                <td className="px-4 py-3">
                  <p style={{ fontWeight: 500 }}>{r.tenant.name}</p>
                  <p className="font-mono text-muted-foreground" style={{ fontSize: "10.5px" }}>{r.tenant.code}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>
                  <MapPin className="w-3 h-3 inline mr-0.5" />
                  {r.tenant.district}, {r.tenant.province}
                </td>
                <td className="px-4 py-3 text-right">{r.studentsEst.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{r.equipmentCount}</td>
                <td className="px-4 py-3 text-right">
                  {r.activeContracts > 0 ? (
                    <span className="px-1.5 py-0.5 bg-[#16a34a]/15 text-[#16a34a] rounded" style={{ fontSize: "11px", fontWeight: 600 }}>
                      {r.activeContracts}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-[#990803]" style={{ fontWeight: 600 }}>
                  {formatVNDCompact(r.totalSpendVND)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toast.info(`Xem chi tiết ${r.tenant.name}`)} className="p-1.5 hover:bg-secondary rounded">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SchoolsDirectoryNCC;
