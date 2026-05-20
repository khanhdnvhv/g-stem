/* ================================================================ */
/*  INSTALL CAMPAIGNS — Chiến dịch cài đặt bộ cài phần mềm           */
/*  Gắn contractId + licenseId thực (truy nguồn)                      */
/* ================================================================ */

import type { InstallCampaign } from "./types";
import { contracts } from "./orders-contracts";
import { licenses } from "./licenses";
import { equipment } from "./equipment";

const SOFTWARE_CATALOG = [
  { name: "Geleximco STEM Studio",     version: "3.2.1" },
  { name: "Robotic Programming IDE",   version: "2.5.0" },
  { name: "IoT Platform",              version: "1.8.4" },
  { name: "Geleximco STEM Explorer",   version: "4.0.2" },
  { name: "Geleximco STEM Tutor",      version: "2.1.0" },
];

const STATUSES: InstallCampaign["status"][] = [
  "running", "completed", "running", "paused", "completed", "failed", "draft", "running",
];

export const installCampaigns: InstallCampaign[] = Array.from({ length: 8 }, (_, i) => {
  const sw = SOFTWARE_CATALOG[i % SOFTWARE_CATALOG.length];
  const contract = contracts[i % contracts.length];
  /* License cùng trường với hợp đồng */
  const license = licenses.find(
    (l) => l.tenantId === contract.schoolId && l.productName === sw.name,
  ) ?? licenses.find((l) => l.tenantId === contract.schoolId);
  /* Thiết bị mục tiêu — của trường trong hợp đồng */
  const schoolEquipment = equipment
    .filter((e) => e.schoolId === contract.schoolId)
    .slice(0, 5 + (i % 8));
  const targetCount = Math.max(schoolEquipment.length, 8 + (i * 5) % 40);
  const status = STATUSES[i % STATUSES.length];
  const completedCount =
    status === "completed" ? targetCount
    : status === "draft" ? 0
    : status === "failed" ? Math.floor(targetCount * 0.6)
    : Math.floor(targetCount * (0.3 + (i % 5) / 10));
  const failedCount = status === "failed" ? Math.floor(targetCount * 0.15) : (i % 4 === 0 ? 1 : 0);

  return {
    id: `CMP-${String(i + 1).padStart(4, "0")}`,
    name: `Triển khai ${sw.name} — ${contract.contractNo}`,
    softwareName: sw.name,
    version: sw.version,
    contractId: contract.id,
    licenseId: license?.id,
    targetEquipmentIds: schoolEquipment.map((e) => e.id),
    targetCount,
    completedCount,
    failedCount,
    status,
    createdAt: new Date(Date.now() - (8 - i) * 6 * 86400_000).toISOString(),
  };
});

export function campaignsByContract(contractId: string): InstallCampaign[] {
  return installCampaigns.filter((c) => c.contractId === contractId);
}
