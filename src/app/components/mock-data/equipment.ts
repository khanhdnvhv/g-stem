import type { Equipment, EquipmentStatus } from "./types";
import { tenantsByType } from "./tenants";

/* ================================================================ */
/*  EQUIPMENT — 200 thiết bị phân bổ cho 15 trường                   */
/* ================================================================ */

const schools = tenantsByType.school;

const EQUIPMENT_CATALOG: { category: string; name: string; pkg: string }[] = [
  { category: "Robotic",  name: "Robot Mbot",                        pkg: "PKG-BAS" },
  { category: "Robotic",  name: "Robot Lego SPIKE",                  pkg: "PKG-ADV" },
  { category: "Robotic",  name: "Cánh tay robot",                    pkg: "PKG-ADV" },
  { category: "AI",       name: "Workstation GPU",                   pkg: "PKG-ADV" },
  { category: "IoT",      name: "Kit cảm biến IoT",                  pkg: "PKG-ADV" },
  { category: "In 3D",    name: "Máy in 3D EDU",                     pkg: "PKG-BAS" },
  { category: "In 3D",    name: "Máy in 3D Resin",                   pkg: "PKG-ADV" },
  { category: "Laser",    name: "Máy cắt laser CO2",                 pkg: "PKG-ADV" },
  { category: "Drone",    name: "Drone giáo dục",                    pkg: "PKG-ADV" },
  { category: "VR",       name: "Meta Quest VR",                     pkg: "PKG-ADV" },
  { category: "Điện tử",  name: "Arduino Starter Kit",                pkg: "PKG-BAS" },
  { category: "Lab",      name: "Kính hiển vi điện tử",              pkg: "PKG-BAS" },
  { category: "Hiển thị", name: "Smart TV 65\"",                      pkg: "PKG-BAS" },
  { category: "Hiển thị", name: "Interactive Board 86\"",             pkg: "PKG-ADV" },
  { category: "Cơ bản",   name: "Bộ dụng cụ khoa học",               pkg: "PKG-MIN" },
  { category: "Cơ bản",   name: "Bộ lắp ghép cơ khí sơ cấp",         pkg: "PKG-MIN" },
];

const STATUS_POOL: { status: EquipmentStatus; weight: number }[] = [
  { status: "ok",      weight: 80 },
  { status: "warning", weight: 10 },
  { status: "broken",  weight: 7 },
  { status: "missing", weight: 3 },
];

function weightedPick<T>(pool: { item: T; weight: number }[], seed: number): T {
  const total = pool.reduce((s, p) => s + p.weight, 0);
  const pick = seed % total;
  let acc = 0;
  for (const p of pool) {
    acc += p.weight;
    if (pick < acc) return p.item;
  }
  return pool[0].item;
}

const equipmentList: Equipment[] = [];
let idx = 1;
for (const school of schools) {
  const count = 13 + (idx % 3); // 13-15 thiết bị mỗi trường → ~200
  for (let i = 0; i < count; i++) {
    const cat = EQUIPMENT_CATALOG[(idx + i) % EQUIPMENT_CATALOG.length];
    const status = weightedPick(
      STATUS_POOL.map((s) => ({ item: s.status, weight: s.weight })),
      idx * 7 + i * 13
    );
    equipmentList.push({
      id: `EQ-${String(idx).padStart(4, "0")}`,
      name: cat.name,
      serial: `SN-${String(idx).padStart(6, "0")}`,
      category: cat.category,
      packageId: cat.pkg,
      schoolId: school.id,
      location: `Phòng STEM ${(idx % 3) + 1}`,
      status,
      purchasedAt: `2024-${String((idx % 12) + 1).padStart(2, "0")}-10T00:00:00Z`,
      warrantyEndsAt: `2027-${String((idx % 12) + 1).padStart(2, "0")}-10T00:00:00Z`,
      lastCheckedBy: "U-TCH-01",
      lastCheckedAt: `2026-04-${String((idx % 28) + 1).padStart(2, "0")}T08:00:00Z`,
      usageHours: (idx * 23) % 500,
      qrCode: `https://stem.geleximco.vn/qr/EQ-${idx}`,
    });
    idx++;
  }
}

export const equipment = equipmentList;

export function equipmentBySchool(schoolId: string): Equipment[] {
  return equipment.filter((e) => e.schoolId === schoolId);
}
