import type { License, LicenseStatus } from "./types";
import { tenants } from "./tenants";
import { contracts } from "./orders-contracts";

/* ================================================================ */
/*  LICENSES — license phân bổ cho schools + distributor             */
/*  Có gắn contractId (truy nguồn) + status tường minh               */
/* ================================================================ */

const PRODUCTS = [
  { name: "Geleximco STEM Explorer",   type: "per_user" as const, seats: 10 },
  { name: "Geleximco STEM Studio",     type: "per_user" as const, seats: 40 },
  { name: "Geleximco STEM Studio Pro", type: "per_user" as const, seats: 80 },
  { name: "Robotic Programming IDE",   type: "per_user" as const, seats: 10 },
  { name: "Robotic Suite",             type: "per_user" as const, seats: 14 },
  { name: "IoT Platform",              type: "per_user" as const, seats: 30 },
  { name: "Geleximco STEM Tutor",      type: "per_user" as const, seats: 80 },
];

const licensedTenants = tenants.filter(
  (t) => t.type === "school" || t.type === "distributor"
);

/** Suy ra status từ revokedAt / expiresAt */
export function deriveLicenseStatus(lic: Pick<License, "revokedAt" | "expiresAt">): LicenseStatus {
  if (lic.revokedAt) return "revoked";
  const now = Date.now();
  const exp = Date.parse(lic.expiresAt);
  if (exp < now) return "expired";
  if (exp - now <= 90 * 86400_000) return "expiring";
  return "active";
}

export const licenses: License[] = [];
let idx = 1;
for (const t of licensedTenants) {
  const n = t.type === "school" ? 12 : 6;
  /* Hợp đồng của trường này — để gắn contractId truy nguồn */
  const tenantContracts = contracts.filter((c) => c.schoolId === t.id);
  for (let i = 0; i < n; i++) {
    const p = PRODUCTS[(idx + i) % PRODUCTS.length];
    const revokedAt = idx % 23 === 0 ? `2026-02-15T00:00:00Z` : undefined;
    const expiresAt = `2027-${String((idx % 12) + 1).padStart(2, "0")}-01T00:00:00Z`;
    const ctr = tenantContracts.length > 0
      ? tenantContracts[i % tenantContracts.length]
      : undefined;
    licenses.push({
      id: `LIC-${String(idx).padStart(5, "0")}`,
      licenseKey: `GLX-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      type: p.type,
      productName: p.name,
      seats: p.seats,
      seatsUsed: p.seats > 0 ? Math.floor(p.seats * (0.4 + (idx % 6) / 10)) : 0,
      tenantId: t.id,
      issuedAt: `2024-${String((idx % 12) + 1).padStart(2, "0")}-01T00:00:00Z`,
      expiresAt,
      revokedAt,
      contractId: ctr?.id,
      status: deriveLicenseStatus({ revokedAt, expiresAt }),
    });
    idx++;
  }
}

export function licensesByTenant(tenantId: string): License[] {
  return licenses.filter((l) => l.tenantId === tenantId);
}

export function licensesByContract(contractId: string): License[] {
  return licenses.filter((l) => l.contractId === contractId);
}
