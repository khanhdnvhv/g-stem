import type { VirtualStockMovement, VirtualStockBalance, CommissionRecord } from "./types";
import { tenantsByType } from "./tenants";
import { stemPackages } from "./packages";

/* ================================================================ */
/*  VIRTUAL INVENTORY & COMMISSION                                   */
/* ================================================================ */

const distributors = tenantsByType.distributor;

export const stockMovements: VirtualStockMovement[] = [];
let idx = 1;
for (const d of distributors) {
  for (const pkg of stemPackages) {
    // 3 movement IN, 4 OUT
    for (let i = 0; i < 3; i++) {
      stockMovements.push({
        id: `MV-${String(idx).padStart(5, "0")}`,
        at: new Date(Date.now() - (30 - idx) * 86400_000).toISOString(),
        tenantId: d.id,
        packageId: pkg.id,
        type: "in",
        quantity: 10,
        note: "NCC nhập kho ảo",
      });
      idx++;
    }
    for (let i = 0; i < 4; i++) {
      stockMovements.push({
        id: `MV-${String(idx).padStart(5, "0")}`,
        at: new Date(Date.now() - (20 - i) * 86400_000).toISOString(),
        tenantId: d.id,
        packageId: pkg.id,
        type: "out",
        quantity: 1 + (idx % 3),
        orderId: `ORD-${String(idx % 30 + 1).padStart(4, "0")}`,
        note: "Giao theo đơn hàng trường",
      });
      idx++;
    }
  }
}

export function stockBalance(tenantId: string): VirtualStockBalance[] {
  return stemPackages.map((pkg) => {
    const moves = stockMovements.filter(
      (m) => m.tenantId === tenantId && m.packageId === pkg.id
    );
    const inQty = moves.filter((m) => m.type === "in").reduce((s, m) => s + m.quantity, 0);
    const outQty = moves.filter((m) => m.type === "out").reduce((s, m) => s + m.quantity, 0);
    return {
      tenantId,
      packageId: pkg.id,
      openingQty: 5,
      inQty,
      outQty,
      closingQty: 5 + inQty - outQty,
    };
  });
}

/* ================================================================ */
/*  COMMISSION RECORDS                                               */
/* ================================================================ */
export const commissionRecords: CommissionRecord[] = [];
let rIdx = 1;
for (const d of distributors) {
  for (let q = 1; q <= 4; q++) {
    const baseRevenueVND = (d.id === "T-DIS-01" ? 3.2 : d.id === "T-DIS-02" ? 2.1 : 1.4) * 1_000_000_000 * (1 + q * 0.15);
    const commissionPct = 8 + (rIdx % 4);
    commissionRecords.push({
      id: `COM-${String(rIdx).padStart(4, "0")}`,
      period: `2026-Q${q}`,
      supplierId: "T-SUP-01",
      distributorId: d.id,
      baseRevenueVND,
      commissionPct,
      commissionVND: baseRevenueVND * (commissionPct / 100),
      status: q < 2 ? "paid" : q === 2 ? "reconciled" : q === 3 ? "pending" : "disputed",
      attachment: q < 3 ? `/files/commission-${rIdx}.pdf` : undefined,
    });
    rIdx++;
  }
}
