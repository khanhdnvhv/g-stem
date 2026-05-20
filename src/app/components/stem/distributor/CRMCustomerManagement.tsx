import { useState } from "react";
import {
  Users, Search, Plus, Phone, Mail, MapPin, Star,
  Eye, MessageCircle, TrendingUp, School as SchoolIcon,
} from "lucide-react";
import { tenantsByType, orders, contracts } from "../../mock-data/index";
import type { Tenant } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatVNDCompact, formatDate } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  CRM CUSTOMER MANAGEMENT — danh bạ trường / khách hàng           */
/* ================================================================ */

type SchoolTag = "hot_lead" | "active" | "inactive" | "prospect";
const TAG_META: Record<SchoolTag, { label: string; color: string }> = {
  hot_lead:  { label: "Lead nóng",   color: "#dc2626" },
  active:    { label: "Đang hợp tác", color: "#16a34a" },
  inactive:  { label: "Tạm nghỉ",    color: "#64748b" },
  prospect:  { label: "Tiềm năng",   color: "#7c3aed" },
};

interface CustomerItem {
  school: Tenant;
  orderCount: number;
  totalRevenue: number;
  activeContracts: number;
  lastOrderAt?: string;
  tag: SchoolTag;
  satisfaction: number;
}

function buildCustomerList(distributorId: string): CustomerItem[] {
  const schools = tenantsByType.school;
  return schools.map((school, i) => {
    const myOrders = orders.filter(
      (o) => o.fromTenantId === school.id && o.distributorTenantId === distributorId
    );
    const totalRevenue = myOrders.reduce((s, o) => s + o.totalVND, 0);
    const activeContracts = contracts.filter(
      (c) => c.schoolId === school.id && c.distributorId === distributorId && c.status === "active"
    ).length;
    const lastOrder = myOrders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    const tag: SchoolTag =
      myOrders.length === 0 ? (i % 2 === 0 ? "prospect" : "hot_lead")
      : activeContracts > 0 ? "active"
      : "inactive";
    return {
      school,
      orderCount: myOrders.length,
      totalRevenue,
      activeContracts,
      lastOrderAt: lastOrder?.createdAt,
      tag,
      satisfaction: 3.5 + ((i * 11) % 15) / 10,
    };
  });
}

function CustomerCard({ c, onClick }: { c: CustomerItem; onClick: () => void }) {
  const tagMeta = TAG_META[c.tag];
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-xl border border-border p-4 hover:shadow-md cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-[#2563eb]/10 flex items-center justify-center">
            <SchoolIcon className="w-5 h-5 text-[#2563eb]" />
          </div>
          <div>
            <h3 className="text-foreground" style={{ fontSize: "13px", fontWeight: 700 }}>
              {c.school.name}
            </h3>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
              {c.school.province} · {c.school.district}
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded" style={{
          fontSize: "10px", fontWeight: 600,
          color: tagMeta.color, backgroundColor: tagMeta.color + "15",
        }}>
          {tagMeta.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 py-2 border-y border-border text-center">
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Đơn</p>
          <p style={{ fontSize: "14px", fontWeight: 700 }}>{c.orderCount}</p>
        </div>
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Doanh thu</p>
          <p className="text-[#990803]" style={{ fontSize: "13px", fontWeight: 700 }}>
            {formatVNDCompact(c.totalRevenue)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>HĐ</p>
          <p className="text-[#16a34a]" style={{ fontSize: "14px", fontWeight: 700 }}>{c.activeContracts}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-muted-foreground" style={{ fontSize: "11px" }}>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className="w-3 h-3"
              style={{
                color: s <= Math.round(c.satisfaction) ? "#c8a84e" : "#e5e7eb",
                fill: s <= Math.round(c.satisfaction) ? "#c8a84e" : "none",
              }}
            />
          ))}
          <span className="ml-1">{c.satisfaction.toFixed(1)}</span>
        </div>
        <span>{c.lastOrderAt ? `Đơn gần nhất: ${formatDate(c.lastOrderAt)}` : "Chưa mua"}</span>
      </div>
    </div>
  );
}

export function CRMCustomerManagement() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "distributor" ? user.tenantId : tenantsByType.distributor[0].id;
  const [customers] = useState<CustomerItem[]>(() => buildCustomerList(tenantId));

  const [tagFilter, setTagFilter] = useState<SchoolTag | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CustomerItem | null>(null);

  const filtered = customers.filter((c) => {
    if (tagFilter !== "all" && c.tag !== tagFilter) return false;
    if (search && !c.school.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCustomers = customers.filter((c) => c.tag === "active").length;
  const hotLeads = customers.filter((c) => c.tag === "hot_lead").length;
  const totalRevenue = customers.reduce((s, c) => s + c.totalRevenue, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Users}
        title="CRM — Quản lý Khách hàng"
        subtitle="Lưu trữ, phân loại và quản lý cơ sở dữ liệu trường học, tổ chức giáo dục đang hợp tác."
        actions={
          <button
            onClick={() => toast.success("Thêm trường mới vào pipeline")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Plus className="w-4 h-4" />
            Thêm khách hàng
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users} label="Tổng khách hàng" value={customers.length} color="#c8a84e" />
        <KpiCard icon={SchoolIcon} label="Đang hợp tác" value={activeCustomers} color="#16a34a" />
        <KpiCard icon={TrendingUp} label="Lead nóng" value={hotLeads} color="#dc2626" trend={hotLeads > 0 ? "up" : "flat"} />
        <KpiCard icon={Star} label="Doanh thu khách" value={formatVNDCompact(totalRevenue)} color="#990803" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm trường..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }}
          />
        </div>
        <button
          onClick={() => setTagFilter("all")}
          className={`px-3 py-2 rounded-lg border ${
            tagFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"
          }`}
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          Tất cả
        </button>
        {(Object.keys(TAG_META) as Array<keyof typeof TAG_META>).map((k) => {
          const meta = TAG_META[k];
          const count = customers.filter((c) => c.tag === k).length;
          return (
            <button
              key={k}
              onClick={() => setTagFilter(k)}
              className={`px-3 py-2 rounded-lg border ${
                tagFilter === k ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"
              }`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(tagFilter === k ? { backgroundColor: meta.color } : {}),
              }}
            >
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((c) => <CustomerCard key={c.school.id} c={c} onClick={() => setSelected(c)} />)}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#2563eb]/10 flex items-center justify-center shrink-0">
                  <SchoolIcon className="w-6 h-6 text-[#2563eb]" />
                </div>
                <div>
                  <h2 style={{ fontSize: "17px", fontWeight: 700 }}>{selected.school.name}</h2>
                  <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
                    {selected.school.province} · {selected.school.district}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {selected.school.contactEmail && (
                <a href={`mailto:${selected.school.contactEmail}`} className="flex items-center gap-2 p-2 bg-secondary/40 rounded-md hover:bg-secondary" style={{ fontSize: "12.5px" }}>
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {selected.school.contactEmail}
                </a>
              )}
              {selected.school.contactPhone && (
                <a href={`tel:${selected.school.contactPhone}`} className="flex items-center gap-2 p-2 bg-secondary/40 rounded-md hover:bg-secondary" style={{ fontSize: "12.5px" }}>
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {selected.school.contactPhone}
                </a>
              )}
              {selected.school.address && (
                <div className="flex items-center gap-2 p-2 bg-secondary/40 rounded-md" style={{ fontSize: "12.5px" }}>
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {selected.school.address}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="text-center p-2 bg-secondary/40 rounded-md">
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Đơn hàng</p>
                  <p style={{ fontSize: "16px", fontWeight: 700 }}>{selected.orderCount}</p>
                </div>
                <div className="text-center p-2 bg-secondary/40 rounded-md">
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Doanh thu</p>
                  <p className="text-[#990803]" style={{ fontSize: "14px", fontWeight: 700 }}>
                    {formatVNDCompact(selected.totalRevenue)}
                  </p>
                </div>
                <div className="text-center p-2 bg-secondary/40 rounded-md">
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>HĐ active</p>
                  <p className="text-[#16a34a]" style={{ fontSize: "16px", fontWeight: 700 }}>
                    {selected.activeContracts}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border flex items-center gap-2 justify-end">
              <button
                onClick={() => { toast.info("Chuyển sang chăm sóc KH"); setSelected(null); }}
                className="px-3 py-2 border border-border rounded-lg hover:bg-secondary flex items-center gap-1.5"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                <MessageCircle className="w-4 h-4" />
                Chăm sóc
              </button>
              <button
                onClick={() => { toast.success("Tạo báo giá mới cho trường"); setSelected(null); }}
                className="px-3 py-2 bg-[#990803] text-white rounded-lg flex items-center gap-1.5"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                <Eye className="w-4 h-4" />
                Tạo báo giá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CRMCustomerManagement;
