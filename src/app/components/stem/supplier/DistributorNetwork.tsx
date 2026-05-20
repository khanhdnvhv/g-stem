import { useState } from "react";
import {
  Handshake, Plus, Search, Eye, MapPin, Mail, Phone,
  TrendingUp, Receipt, Percent, Users, Download,
} from "lucide-react";
import {
  tenantsByType, orders, commissionRecords,
} from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatVND, formatVNDCompact } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  DISTRIBUTOR NETWORK (Supplier view) — mạng lưới đại lý          */
/* ================================================================ */

export function DistributorNetwork() {
  const [search, setSearch] = useState("");

  const rows = tenantsByType.distributor.map((t) => {
    const myOrders = orders.filter((o) => o.distributorTenantId === t.id);
    const delivered = myOrders.filter((o) => o.status === "delivered");
    const revenue = delivered.reduce((s, o) => s + o.totalVND, 0);
    const myCommission = commissionRecords.filter((c) => c.distributorId === t.id)
      .reduce((s, c) => s + c.commissionVND, 0);
    const customers = new Set(myOrders.map((o) => o.fromTenantId)).size;
    return {
      tenant: t,
      orderCount: myOrders.length,
      deliveredCount: delivered.length,
      revenue,
      commission: myCommission,
      customers,
    };
  });

  const filtered = rows.filter((r) =>
    !search || r.tenant.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalCommission = rows.reduce((s, r) => s + r.commission, 0);
  const totalCustomers = rows.reduce((s, r) => s + r.customers, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Handshake}
        title="Mạng lưới Đại lý"
        subtitle="Quản lý kênh phân phối — thêm đại lý mới, theo dõi KPI, đối soát hoa hồng."
        accentColor="#990803"
        actions={
          <>
            <button onClick={() => toast.info("Xuất báo cáo mạng lưới đại lý")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Xuất báo cáo
            </button>
            <button onClick={() => toast.success("Mời đại lý mới tham gia mạng lưới")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Mời đại lý mới
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Handshake} label="Đại lý active" value={rows.length} color="#990803" />
        <KpiCard icon={Users} label="Trường phục vụ" value={totalCustomers} color="#2563eb" />
        <KpiCard icon={TrendingUp} label="Doanh thu qua đại lý" value={formatVNDCompact(totalRevenue)} color="#16a34a" change="+24%" trend="up" />
        <KpiCard icon={Percent} label="Tổng hoa hồng (YTD)" value={formatVNDCompact(totalCommission)} color="#c8a84e" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm đại lý..."
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
          style={{ fontSize: "13px" }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((r) => (
          <div key={r.tenant.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[#c8a84e]/15 flex items-center justify-center shrink-0">
                <Handshake className="w-6 h-6 text-[#c8a84e]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-foreground truncate" style={{ fontSize: "14px", fontWeight: 700 }}>
                  {r.tenant.name}
                </h3>
                <p className="font-mono text-muted-foreground" style={{ fontSize: "10.5px" }}>{r.tenant.code}</p>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "11px" }}>
                  <MapPin className="w-3 h-3 inline mr-0.5" />
                  {r.tenant.coverageProvinces?.slice(0, 2).join(", ")}
                  {(r.tenant.coverageProvinces?.length || 0) > 2 && ` +${r.tenant.coverageProvinces!.length - 2}`}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 py-3 border-y border-border">
              <div className="text-center">
                <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Đơn hoàn tất</p>
                <p className="text-[#16a34a]" style={{ fontSize: "16px", fontWeight: 700 }}>{r.deliveredCount}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Trường KH</p>
                <p style={{ fontSize: "16px", fontWeight: 700 }}>{r.customers}</p>
              </div>
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Doanh thu</span>
                <span className="text-[#990803]" style={{ fontSize: "13px", fontWeight: 700 }}>
                  {formatVNDCompact(r.revenue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Hoa hồng</span>
                <span className="text-[#c8a84e]" style={{ fontSize: "13px", fontWeight: 700 }}>
                  {formatVNDCompact(r.commission)}
                </span>
              </div>
            </div>

            <div className="mt-3 flex gap-1.5">
              <a href={`mailto:${r.tenant.contactEmail}`}
                className="flex-1 px-2 py-1.5 border border-border rounded hover:bg-secondary flex items-center justify-center gap-1"
                style={{ fontSize: "11px", fontWeight: 500 }}>
                <Mail className="w-3 h-3" /> Email
              </a>
              <button onClick={() => toast.info(`Xem chi tiết ${r.tenant.name}`)}
                className="flex-1 px-2 py-1.5 bg-[#990803] text-white rounded hover:opacity-90 flex items-center justify-center gap-1"
                style={{ fontSize: "11px", fontWeight: 500 }}>
                <Eye className="w-3 h-3" /> Chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DistributorNetwork;
