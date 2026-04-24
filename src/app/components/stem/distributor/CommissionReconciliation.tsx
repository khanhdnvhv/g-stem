import { useState } from "react";
import {
  Receipt, Check, X, Eye, Download, DollarSign, Clock, AlertTriangle,
} from "lucide-react";
import { commissionRecords, tenants } from "../../mock-data/index";
import type { CommissionRecord } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatVND, formatVNDCompact } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  COMMISSION RECONCILIATION — đối soát hoa hồng                    */
/* ================================================================ */

const STATUS_META: Record<CommissionRecord["status"], { label: string; color: string }> = {
  pending:    { label: "Chờ xác nhận", color: "#f59e0b" },
  reconciled: { label: "Đã đối soát",  color: "#0891b2" },
  paid:       { label: "Đã thanh toán", color: "#16a34a" },
  disputed:   { label: "Đang tranh chấp", color: "#dc2626" },
};

export function CommissionReconciliation() {
  const { user } = useAuth();

  const myRecords = user?.tenantType === "distributor"
    ? commissionRecords.filter((c) => c.distributorId === user.tenantId)
    : commissionRecords;

  const [statusFilter, setStatusFilter] = useState<CommissionRecord["status"] | "all">("all");
  const filtered = myRecords.filter((r) => statusFilter === "all" || r.status === statusFilter);

  const totalCommission = myRecords.reduce((s, r) => s + r.commissionVND, 0);
  const paidCommission = myRecords.filter((r) => r.status === "paid").reduce((s, r) => s + r.commissionVND, 0);
  const pendingCommission = myRecords.filter((r) => r.status === "pending" || r.status === "reconciled")
    .reduce((s, r) => s + r.commissionVND, 0);
  const disputedCount = myRecords.filter((r) => r.status === "disputed").length;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Receipt}
        title="Đối soát Hoa hồng"
        subtitle="Tiếp nhận, kiểm tra và xác nhận biên bản đối soát doanh thu từ NCC để nhận chiết khấu, hoa hồng."
        actions={
          <button
            onClick={() => toast.success("Xuất bảng đối soát quý cho phòng kế toán")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Download className="w-4 h-4" />
            Xuất đối soát
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={DollarSign} label="Tổng hoa hồng (YTD)" value={formatVNDCompact(totalCommission)} color="#c8a84e" change="+24%" trend="up" />
        <KpiCard icon={Check} label="Đã nhận" value={formatVNDCompact(paidCommission)} color="#16a34a" />
        <KpiCard icon={Clock} label="Chờ đối soát" value={formatVNDCompact(pendingCommission)} color="#f59e0b" />
        <KpiCard icon={AlertTriangle} label="Tranh chấp" value={disputedCount} color="#dc2626" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-2 rounded-lg border ${
            statusFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"
          }`}
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          Tất cả ({myRecords.length})
        </button>
        {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map((k) => {
          const count = myRecords.filter((r) => r.status === k).length;
          const meta = STATUS_META[k];
          return (
            <button
              key={k}
              onClick={() => setStatusFilter(k)}
              className={`px-3 py-2 rounded-lg border ${
                statusFilter === k ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"
              }`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(statusFilter === k ? { backgroundColor: meta.color } : {}),
              }}
            >
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              <th className="px-4 py-2.5">Mã</th>
              <th className="px-4 py-2.5">Kỳ</th>
              <th className="px-4 py-2.5">Từ NCC</th>
              <th className="px-4 py-2.5 text-right">Doanh thu gốc</th>
              <th className="px-4 py-2.5 text-center">%</th>
              <th className="px-4 py-2.5 text-right">Hoa hồng</th>
              <th className="px-4 py-2.5">Trạng thái</th>
              <th className="px-4 py-2.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
            {filtered.map((r) => {
              const meta = STATUS_META[r.status];
              const supplier = tenants.find((t) => t.id === r.supplierId);
              return (
                <tr key={r.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-4 py-3 font-mono" style={{ fontSize: "11px", fontWeight: 600 }}>{r.id}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-secondary rounded font-mono" style={{ fontSize: "11px" }}>
                      {r.period}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{supplier?.name}</td>
                  <td className="px-4 py-3 text-right">{formatVNDCompact(r.baseRevenueVND)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-1.5 py-0.5 bg-[#c8a84e]/15 text-[#c8a84e] rounded" style={{ fontSize: "11px", fontWeight: 600 }}>
                      {r.commissionPct}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#990803]" style={{ fontWeight: 700 }}>
                    {formatVND(r.commissionVND)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded" style={{
                      fontSize: "11px", fontWeight: 600,
                      color: meta.color, backgroundColor: meta.color + "15",
                    }}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {r.attachment && (
                        <button
                          onClick={() => toast.info(`Tải biên bản đối soát ${r.id}`)}
                          className="p-1.5 hover:bg-secondary rounded"
                          title="Tải biên bản"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                      {r.status === "pending" && (
                        <>
                          <button
                            onClick={() => toast.success(`Xác nhận đối soát ${r.id}`)}
                            className="p-1.5 hover:bg-[#16a34a]/10 rounded"
                            title="Xác nhận"
                          >
                            <Check className="w-4 h-4 text-[#16a34a]" />
                          </button>
                          <button
                            onClick={() => toast.error(`Đánh dấu tranh chấp ${r.id}`)}
                            className="p-1.5 hover:bg-[#dc2626]/10 rounded"
                            title="Tranh chấp"
                          >
                            <X className="w-4 h-4 text-[#dc2626]" />
                          </button>
                        </>
                      )}
                    </div>
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

export default CommissionReconciliation;
