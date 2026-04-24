import type {
  AuthorityReport, ProvinceSnapshot, ProcurementEntry,
} from "./types";
import { MINISTRY_REPORT_TEMPLATES, FUNDING_SOURCES, SCHOOL_TIERS } from "./constants";

/* ================================================================ */
/*  AUTHORITY DATA — Dashboard Sở/Bộ                                 */
/* ================================================================ */

export const provinceSnapshots: ProvinceSnapshot[] = [
  { province: "Hà Nội",            districts: 30, schools: 2850, teachers: 79000, students: 2_150_000, stemCoveragePct: 71, equipmentCompliancePct: 68, avgStemScore: 7.8 },
  { province: "TP.HCM",            districts: 24, schools: 2400, teachers: 76000, students: 1_980_000, stemCoveragePct: 84, equipmentCompliancePct: 77, avgStemScore: 8.1 },
  { province: "Đà Nẵng",           districts:  8, schools:  410, teachers: 12800, students:   320_000, stemCoveragePct: 76, equipmentCompliancePct: 72, avgStemScore: 7.9 },
  { province: "Thừa Thiên Huế",    districts:  9, schools:  480, teachers:  9600, students:   220_000, stemCoveragePct: 58, equipmentCompliancePct: 54, avgStemScore: 7.2 },
  { province: "Quảng Nam",         districts: 18, schools:  920, teachers: 15300, students:   330_000, stemCoveragePct: 52, equipmentCompliancePct: 48, avgStemScore: 7.0 },
  { province: "Khánh Hòa",         districts:  9, schools:  570, teachers: 11200, students:   250_000, stemCoveragePct: 61, equipmentCompliancePct: 57, avgStemScore: 7.4 },
  { province: "Bình Dương",        districts:  9, schools:  610, teachers: 14500, students:   390_000, stemCoveragePct: 79, equipmentCompliancePct: 73, avgStemScore: 7.9 },
  { province: "Đồng Nai",          districts: 11, schools:  780, teachers: 16700, students:   430_000, stemCoveragePct: 68, equipmentCompliancePct: 64, avgStemScore: 7.6 },
  { province: "Hải Phòng",         districts: 15, schools:  860, teachers: 17200, students:   420_000, stemCoveragePct: 73, equipmentCompliancePct: 70, avgStemScore: 7.7 },
  { province: "Bắc Ninh",          districts:  8, schools:  520, teachers: 11000, students:   240_000, stemCoveragePct: 66, equipmentCompliancePct: 63, avgStemScore: 7.5 },
];

/* ================================================================ */
/*  PROCUREMENT — chi phí đầu tư thiết bị                            */
/* ================================================================ */
export const procurementEntries: ProcurementEntry[] = [];
let idx = 1;
for (const prov of provinceSnapshots.slice(0, 6)) {
  for (const year of [2024, 2025, 2026]) {
    for (const tier of SCHOOL_TIERS) {
      for (const src of FUNDING_SOURCES) {
        procurementEntries.push({
          id: `PR-${String(idx).padStart(5, "0")}`,
          year,
          province: prov.province,
          schoolTier: tier,
          fundingSource: src,
          amountVND:
            (0.3 + (idx % 7) / 10) *
            (tier === "THPT" ? 4_500_000_000 : tier === "THCS" ? 3_200_000_000 : tier === "Tiểu học" ? 1_800_000_000 : tier === "Mầm non" ? 800_000_000 : 2_500_000_000) *
            (src === "Ngân sách" ? 1 : src === "Học phí" ? 0.4 : 0.6),
          packageId: idx % 3 === 0 ? "PKG-ADV" : idx % 2 === 0 ? "PKG-BAS" : "PKG-MIN",
        });
        idx++;
      }
    }
  }
}

/* ================================================================ */
/*  AUTHORITY REPORTS                                                */
/* ================================================================ */
export const authorityReports: AuthorityReport[] = MINISTRY_REPORT_TEMPLATES.map((t, i) => ({
  id: `RPT-${String(i + 1).padStart(4, "0")}`,
  name: t.name,
  templateCode: t.code,
  generatedAt: new Date(Date.now() - (i + 1) * 86400_000 * 14).toISOString(),
  scope: i === 0 ? "national" : i < 3 ? "province" : "district",
  period: i % 2 === 0 ? "Q1/2026" : "Q4/2025",
  fileUrl: `/reports/${t.code}-${i + 1}.pdf`,
  generatedBy: "U-AUT-01",
}));
