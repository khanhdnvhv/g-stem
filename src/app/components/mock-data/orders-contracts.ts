import type { Order, Contract, OrderStatus } from "./types";
import { tenantsByType } from "./tenants";
import { stemPackages } from "./packages";

/* ================================================================ */
/*  ORDERS (30) & CONTRACTS (15)                                     */
/* ================================================================ */

const schools = tenantsByType.school;
const distributors = tenantsByType.distributor;
const supplierId = tenantsByType.supplier[0].id;

const ORDER_STATUSES: OrderStatus[] = [
  "draft", "pending", "approved", "delivering", "delivered", "cancelled",
];

export const orders: Order[] = Array.from({ length: 30 }, (_, i) => {
  const school = schools[i % schools.length];
  const distributor = distributors[i % distributors.length];
  const pkg = stemPackages[i % stemPackages.length];
  const qty = (i % 3) + 1;
  const unitPrice = pkg.priceVND;
  const totalVND = unitPrice * qty;
  const status = ORDER_STATUSES[i % ORDER_STATUSES.length];
  const createdAt = new Date(Date.now() - (30 - i) * 5 * 86400_000).toISOString();
  return {
    id: `ORD-${String(i + 1).padStart(4, "0")}`,
    orderNo: `ORD-2026-${String(i + 1).padStart(4, "0")}`,
    fromTenantId: school.id,
    toTenantId: supplierId,
    distributorTenantId: distributor.id,
    items: [{ packageId: pkg.id, quantity: qty, unitPrice }],
    totalVND,
    status,
    createdAt,
    createdBy: "U-SCH-01",
    deliveredAt:
      status === "delivered"
        ? new Date(Date.parse(createdAt) + 14 * 86400_000).toISOString()
        : undefined,
    contractId:
      status === "approved" || status === "delivering" || status === "delivered"
        ? `CTR-${String((i % 15) + 1).padStart(4, "0")}`
        : undefined,
    note: i % 5 === 0 ? "Thanh toán qua ngân sách xã hội hóa" : undefined,
  };
});

export const contracts: Contract[] = Array.from({ length: 15 }, (_, i) => {
  const school = schools[i % schools.length];
  const distributor = distributors[i % distributors.length];
  const pkg = stemPackages[i % stemPackages.length];
  const totalVND = pkg.priceVND * ((i % 3) + 1);
  const signedAt = new Date(Date.now() - (i + 1) * 12 * 86400_000).toISOString();
  return {
    id: `CTR-${String(i + 1).padStart(4, "0")}`,
    contractNo: `CTR-2026-${String(i + 1).padStart(4, "0")}`,
    supplierId,
    distributorId: distributor.id,
    schoolId: school.id,
    signedAt,
    totalVND,
    status: i % 4 === 0 ? "active" : i % 4 === 1 ? "signed" : i % 4 === 2 ? "expired" : "active",
    milestones: [
      { title: "Khảo sát hiện trạng",    dueAt: new Date(Date.parse(signedAt) + 3 * 86400_000).toISOString(),  done: true },
      { title: "Thanh toán đợt 1 (30%)", dueAt: new Date(Date.parse(signedAt) + 7 * 86400_000).toISOString(),  done: true },
      { title: "Giao thiết bị",          dueAt: new Date(Date.parse(signedAt) + 21 * 86400_000).toISOString(), done: i % 3 !== 0 },
      { title: "Lắp đặt & cấu hình",     dueAt: new Date(Date.parse(signedAt) + 25 * 86400_000).toISOString(), done: i % 3 !== 0 },
      { title: "Cài phần mềm + cấp license", dueAt: new Date(Date.parse(signedAt) + 28 * 86400_000).toISOString(), done: i % 3 === 1 },
      { title: "Tập huấn giáo viên",     dueAt: new Date(Date.parse(signedAt) + 35 * 86400_000).toISOString(), done: i % 2 === 0 },
      { title: "Nghiệm thu & thanh toán cuối", dueAt: new Date(Date.parse(signedAt) + 45 * 86400_000).toISOString(), done: i % 5 === 0 },
    ],
    attachments: [`/files/contract-${i + 1}.pdf`],
    commissionPct: 8 + (i % 4),
  };
});

export function ordersByTenant(tenantId: string): Order[] {
  return orders.filter(
    (o) =>
      o.fromTenantId === tenantId ||
      o.toTenantId === tenantId ||
      o.distributorTenantId === tenantId
  );
}
