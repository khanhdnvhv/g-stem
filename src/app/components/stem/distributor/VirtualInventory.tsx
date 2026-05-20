import { useState, useMemo } from "react";
import {
  Warehouse, ArrowDownToLine, ArrowUpFromLine, TrendingDown,
  Boxes, Info,
} from "lucide-react";
import {
  stemPackages, stockMovements, stockBalance, tenantsByType,
} from "../../mock-data/index";
import type { StemPackage } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { TierBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatDateTime } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  VIRTUAL INVENTORY — Kho ảo đại lý                                */
/*  Tự động trừ tồn khi phát sinh đơn hàng giao cho trường           */
/* ================================================================ */

function StockCard({ pkg, opening, inQty, outQty, closing }: {
  pkg: StemPackage; opening: number; inQty: number; outQty: number; closing: number;
}) {
  const lowStock = closing < 5;
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{pkg.name}</p>
          <TierBadge tier={pkg.tier} size="xs" />
        </div>
        {lowStock && (
          <span className="text-[#dc2626] inline-flex items-center gap-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>
            <TrendingDown className="w-3 h-3" /> Sắp hết
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Đầu kỳ</p>
          <p style={{ fontSize: "16px", fontWeight: 700 }}>{opening}</p>
        </div>
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Nhập</p>
          <p style={{ fontSize: "16px", fontWeight: 700, color: "#16a34a" }}>+{inQty}</p>
        </div>
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Xuất</p>
          <p style={{ fontSize: "16px", fontWeight: 700, color: "#dc2626" }}>-{outQty}</p>
        </div>
        <div className="border-l border-border pl-2">
          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Tồn cuối</p>
          <p style={{ fontSize: "20px", fontWeight: 800, color: lowStock ? "#dc2626" : "#0891b2" }}>
            {closing}
          </p>
        </div>
      </div>
    </div>
  );
}

export function VirtualInventory() {
  const { user } = useAuth();
  const [expandedPkg, setExpandedPkg] = useState<string | null>(null);

  const tenantId = user?.tenantType === "distributor" ? user.tenantId : tenantsByType.distributor[0].id;
  const balances = useMemo(() => stockBalance(tenantId), [tenantId]);

  const myMovements = useMemo(
    () => stockMovements.filter((m) => m.tenantId === tenantId).sort(
      (a, b) => b.at.localeCompare(a.at)
    ),
    [tenantId]
  );

  const totalIn = balances.reduce((s, b) => s + b.inQty, 0);
  const totalOut = balances.reduce((s, b) => s + b.outQty, 0);
  const totalClosing = balances.reduce((s, b) => s + b.closingQty, 0);
  const lowStockCount = balances.filter((b) => b.closingQty < 5).length;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Warehouse}
        title="Kho ảo (Virtual Inventory)"
        subtitle='Cơ chế "kho ảo" tự động trừ tồn khi phát sinh đơn hàng giao cho trường — không cần vận hành kho vật lý.'
        actions={
          <button
            onClick={() => toast.info("Đặt mua bổ sung tồn kho ảo từ NCC")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <ArrowDownToLine className="w-4 h-4" />
            Đặt nhập kho
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Boxes} label="Tồn kho hiện tại" value={totalClosing} color="#0891b2" />
        <KpiCard icon={ArrowDownToLine} label="Đã nhập (kỳ này)" value={totalIn} color="#16a34a" trend="up" />
        <KpiCard icon={ArrowUpFromLine} label="Đã xuất (kỳ này)" value={totalOut} color="#dc2626" />
        <KpiCard icon={TrendingDown} label="Mặt hàng sắp hết" value={lowStockCount} color="#f59e0b" trend={lowStockCount > 0 ? "up" : "flat"} />
      </div>

      {/* Stock cards per package */}
      <div>
        <h2 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          Tồn kho theo gói STEM
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {balances.map((b) => {
            const pkg = stemPackages.find((p) => p.id === b.packageId);
            if (!pkg) return null;
            return (
              <StockCard
                key={b.packageId}
                pkg={pkg}
                opening={b.openingQty}
                inQty={b.inQty}
                outQty={b.outQty}
                closing={b.closingQty}
              />
            );
          })}
        </div>
      </div>

      {/* Movement log */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
            Lịch sử xuất/nhập kho ảo
          </h3>
          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
            {myMovements.length} bản ghi
          </span>
        </div>
        <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
          {myMovements.slice(0, 30).map((m) => {
            const pkg = stemPackages.find((p) => p.id === m.packageId);
            const isIn = m.type === "in";
            return (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: isIn ? "#16a34a15" : "#dc262615" }}
                >
                  {isIn ? (
                    <ArrowDownToLine className="w-4 h-4 text-[#16a34a]" />
                  ) : (
                    <ArrowUpFromLine className="w-4 h-4 text-[#dc2626]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "12.5px", fontWeight: 500 }}>
                      {isIn ? "Nhập" : "Xuất"} {pkg?.name}
                    </span>
                    {pkg && <TierBadge tier={pkg.tier} size="xs" />}
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                    {m.note || (m.orderId ? `Đơn hàng ${m.orderId}` : "—")}
                  </p>
                </div>
                <div className="text-right">
                  <p style={{
                    fontSize: "14px", fontWeight: 700,
                    color: isIn ? "#16a34a" : "#dc2626",
                  }}>
                    {isIn ? "+" : "-"}{m.quantity}
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
                    {formatDateTime(m.at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#0891b2]/5 to-[#c8a84e]/5 rounded-xl border border-border p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#0891b2] shrink-0 mt-0.5" />
        <div>
          <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
            Về cơ chế kho ảo
          </p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "12px", lineHeight: 1.6 }}>
            Kho ảo cho phép đại lý quản lý "hàng hóa" chỉ trên hệ thống — không vận hành kho vật lý.
            Khi trường đặt hàng qua đại lý, hệ thống tự động trừ tồn; khi NCC phát đồ, tự động cộng tồn.
            Đại lý chỉ cần ký hợp đồng B2B và đối soát hoa hồng với NCC.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VirtualInventory;
