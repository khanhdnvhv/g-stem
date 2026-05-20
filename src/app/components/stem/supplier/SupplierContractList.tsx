import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  FileText, Plus, Search, Download,
  CheckCircle2, Clock, AlertTriangle, XCircle, ExternalLink,
} from "lucide-react";
import { tenants, tenantsByType } from "../../mock-data/index";
import type { Contract } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { useOperations } from "@/app/lib/OperationsContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { TenantBadge } from "../ui/badges";
import { formatRelative, formatVND } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  SUPPLIER CONTRACT LIST — Danh sách Hợp đồng (Supplier)          */
/* ================================================================ */

const STATUS_META: Record<
  Contract["status"],
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  draft:      { label: "Bản nháp",        color: "#64748b", icon: Clock },
  signed:     { label: "Đã ký",           color: "#0891b2", icon: CheckCircle2 },
  active:     { label: "Đang hiệu lực",   color: "#16a34a", icon: CheckCircle2 },
  expired:    { label: "Hết hạn",         color: "#f59e0b", icon: AlertTriangle },
  terminated: { label: "Đã kết thúc",     color: "#dc2626", icon: XCircle },
};

function tenantName(id: string) { return tenants.find((t) => t.id === id)?.name ?? id; }
function tenantType(id: string) { return tenants.find((t) => t.id === id)?.type; }

export function SupplierContractList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { contracts } = useOperations();
  const myTenantId = user?.tenantId ?? tenantsByType.supplier[0]?.id ?? "T-SUP-01";

  const myContracts = useMemo(
    () => contracts.filter((c) => c.supplierId === myTenantId),
    [contracts, myTenantId],
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Contract["status"] | "all">("all");

  const filtered = useMemo(() => myContracts.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !c.contractNo.toLowerCase().includes(q) &&
        !tenantName(c.schoolId).toLowerCase().includes(q)
      ) return false;
    }
    return true;
  }), [myContracts, search, statusFilter]);

  const activeCount  = myContracts.filter((c) => c.status === "active").length;
  const expiredCount = myContracts.filter((c) => c.status === "expired").length;
  const totalValue   = myContracts.reduce((s, c) => s + c.totalVND, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={FileText}
        title="Danh sách Hợp đồng"
        subtitle="Toàn bộ hợp đồng STEM ký với đại lý và trường học — theo dõi mốc, giá trị và trạng thái."
        accentColor="#990803"
        actions={
          <>
            <button onClick={() => toast.info("Xuất danh sách hợp đồng ra Excel")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
            <button onClick={() => { toast.info("Hợp đồng được sinh tự động khi duyệt đơn hàng"); navigate("/supplier/orders"); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Tạo từ đơn hàng
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={FileText}      label="Tổng hợp đồng"     value={myContracts.length} color="#990803" />
        <KpiCard icon={CheckCircle2}  label="Đang hiệu lực"     value={activeCount}        color="#16a34a" />
        <KpiCard icon={AlertTriangle} label="Hết hạn"           value={expiredCount}       color="#f59e0b" />
        <KpiCard icon={FileText}      label="Tổng giá trị"
          value={`${(totalValue / 1_000_000_000).toFixed(1)}B`}  color="#c8a84e" subtitle="VND" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm số HĐ / tên trường..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }} />
        </div>
        {(["all", ...Object.keys(STATUS_META)] as Array<"all" | Contract["status"]>).map((s) => (
          <button key={s}
            onClick={() => setStatusFilter(s as "all" | Contract["status"])}
            className={`px-3 py-2 rounded-lg border ${
              statusFilter === s
                ? "bg-[#990803] text-white border-[#990803]"
                : "bg-card border-border hover:bg-secondary"
            }`}
            style={{ fontSize: "12px", fontWeight: 500 }}>
            {s === "all" ? "Tất cả" : STATUS_META[s as Contract["status"]].label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground"
              style={{ fontSize: "11px", fontWeight: 600 }}>
              <tr>
                <th className="px-4 py-2.5">Số HĐ</th>
                <th className="px-4 py-2.5">Trường học</th>
                <th className="px-4 py-2.5">Đại lý</th>
                <th className="px-4 py-2.5">Ngày ký</th>
                <th className="px-4 py-2.5 text-right">Giá trị</th>
                <th className="px-4 py-2.5">Tiến độ mốc</th>
                <th className="px-4 py-2.5">Trạng thái</th>
                <th className="px-4 py-2.5 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => {
                const meta = STATUS_META[c.status];
                const Icon = meta.icon;
                const done = c.milestones.filter((m) => m.done).length;
                const pct  = Math.round((done / c.milestones.length) * 100);
                const tt   = tenantType(c.schoolId);
                return (
                  <tr key={c.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-foreground"
                        style={{ fontSize: "12px", fontWeight: 700 }}>
                        {c.contractNo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {tt && <TenantBadge type={tt} size="xs" />}
                        <span className="text-foreground truncate max-w-[160px]" style={{ fontSize: "12px" }}>
                          {tenantName(c.schoolId)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>
                      {c.distributorId
                        ? tenantName(c.distributorId)
                        : <span className="italic">Trực tiếp</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>
                      {c.signedAt ? formatRelative(c.signedAt) : <span className="italic">Chưa ký</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-[#990803]"
                      style={{ fontSize: "13px", fontWeight: 700 }}>
                      {formatVND(c.totalVND)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden min-w-[60px]">
                          <div className="h-full bg-[#16a34a] rounded-full"
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span style={{ fontSize: "10.5px", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {done}/{c.milestones.length}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
                        style={{
                          fontSize: "10.5px", fontWeight: 600,
                          color: meta.color, backgroundColor: meta.color + "18",
                        }}>
                        <Icon className="w-3 h-3" /> {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/supplier/contracts/${c.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-border rounded hover:bg-secondary"
                        style={{ fontSize: "11.5px", fontWeight: 500 }}>
                        <ExternalLink className="w-3 h-3" /> Chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground"
                    style={{ fontSize: "12px" }}>
                    Không tìm thấy hợp đồng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SupplierContractList;
