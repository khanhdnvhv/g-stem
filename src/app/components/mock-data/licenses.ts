import type { License } from "./types";
import { tenants } from "./tenants";

/* ================================================================ */
/*  LICENSES — 200 license phân bổ cho schools + distributor         */
/* ================================================================ */

const PRODUCTS = [
  { name: "Geleximco STEM Explorer",   type: "per_device" as const, seats: 10 },
  { name: "Geleximco STEM Studio",     type: "per_user" as const,   seats: 40 },
  { name: "Geleximco STEM Studio Pro", type: "per_user" as const,   seats: 80 },
  { name: "Robotic Programming IDE",   type: "per_device" as const, seats: 10 },
  { name: "Robotic AI Suite",          type: "per_device" as const, seats: 14 },
  { name: "IoT Platform",              type: "site" as const,       seats: 0 },
  { name: "AI-Buddy Tutor",            type: "site" as const,       seats: 0 },
];

const licensedTenants = tenants.filter(
  (t) => t.type === "school" || t.type === "distributor"
);

export const licenses: License[] = [];
let idx = 1;
for (const t of licensedTenants) {
  const n = t.type === "school" ? 12 : 6;
  for (let i = 0; i < n; i++) {
    const p = PRODUCTS[(idx + i) % PRODUCTS.length];
    licenses.push({
      id: `LIC-${String(idx).padStart(5, "0")}`,
      licenseKey: `GLX-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      type: p.type,
      productName: p.name,
      seats: p.seats,
      seatsUsed: p.seats > 0 ? Math.floor(p.seats * (0.4 + (idx % 6) / 10)) : 0,
      tenantId: t.id,
      issuedAt: `2024-${String((idx % 12) + 1).padStart(2, "0")}-01T00:00:00Z`,
      expiresAt: `2027-${String((idx % 12) + 1).padStart(2, "0")}-01T00:00:00Z`,
      revokedAt: idx % 23 === 0 ? `2026-02-15T00:00:00Z` : undefined,
    });
    idx++;
  }
}

export function licensesByTenant(tenantId: string): License[] {
  return licenses.filter((l) => l.tenantId === tenantId);
}
