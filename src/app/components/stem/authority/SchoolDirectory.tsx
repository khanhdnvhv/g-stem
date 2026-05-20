import { useState, useMemo } from "react";
import {
  School as SchoolIcon, Search, Filter, Eye, MapPin,
  GraduationCap, Users, Boxes, Download,
} from "lucide-react";
import {
  tenantsByType, equipmentBySchool, scheduleEntries,
} from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  SCHOOL DIRECTORY (Authority) — Danh bạ trường trực thuộc         */
/* ================================================================ */

interface SchoolSummary {
  id: string;
  name: string;
  code: string;
  province: string;
  district: string;
  tier: string;
  studentsCount: number;
  teachersCount: number;
  equipmentCount: number;
  equipmentCompliancePct: number;
  stemCoveragePct: number;
  avgScore: number;
  lastSync: string;
}

function buildSchoolSummary(): SchoolSummary[] {
  return tenantsByType.school.map((s, i) => {
    const eq = equipmentBySchool(s.id);
    const eqOk = eq.filter((e) => e.status === "ok").length;
    const schedule = scheduleEntries.filter((sc) => sc.schoolId === s.id);
    return {
      id: s.id,
      name: s.name,
      code: s.code,
      province: s.province || "—",
      district: s.district || "—",
      tier: s.gradeLevels?.[0] || "THCS",
      studentsCount: 600 + (i * 73) % 1800,
      teachersCount: 40 + (i * 7) % 80,
      equipmentCount: eq.length,
      equipmentCompliancePct: eq.length ? Math.round((eqOk / eq.length) * 100) : 0,
      stemCoveragePct: 55 + (i * 13) % 40,
      avgScore: 6.5 + ((i * 11) % 35) / 10,
      lastSync: new Date(Date.now() - (i + 1) * 86400_000 * 3).toISOString(),
    };
  });
}

export function SchoolDirectory() {
  const { user } = useAuth();
  const [schools] = useState(buildSchoolSummary());
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState<string | "all">("all");
  const [tierFilter, setTierFilter] = useState<string | "all">("all");

  const districts = Array.from(new Set(schools.map((s) => s.district)));
  const tiers = Array.from(new Set(schools.map((s) => s.tier)));

  const filtered = schools.filter((s) => {
    if (districtFilter !== "all" && s.district !== districtFilter) return false;
    if (tierFilter !== "all" && s.tier !== tierFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalStudents = schools.reduce((s, sc) => s + sc.studentsCount, 0);
  const totalTeachers = schools.reduce((s, sc) => s + sc.teachersCount, 0);
  const avgCoverage = Math.round(schools.reduce((s, sc) => s + sc.stemCoveragePct, 0) / schools.length);
  const avgCompliance = Math.round(schools.reduce((s, sc) => s + sc.equipmentCompliancePct, 0) / schools.length);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={SchoolIcon}
        title={`Danh bạ trường trực thuộc — ${user?.province || "Hà Nội"}`}
        subtitle="Danh sách các trường học triển khai STEM trên địa bàn, đồng bộ từ CSDL ngành giáo dục."
        accentColor="#7c3aed"
        actions={
          <button onClick={() => toast.info("Xuất Excel danh sách trường với đầy đủ chỉ số")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Xuất danh sách
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={SchoolIcon} label="Tổng trường" value={schools.length} color="#7c3aed" />
        <KpiCard icon={Users} label="Học sinh" value={totalStudents.toLocaleString()} color="#0891b2" />
        <KpiCard icon={GraduationCap} label="Giáo viên" value={totalTeachers.toLocaleString()} color="#2563eb" />
        <KpiCard icon={Boxes} label="Bao phủ STEM TB" value={`${avgCoverage}%`} color="#16a34a" subtitle={`Thiết bị chuẩn: ${avgCompliance}%`} />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm trường / mã..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }} />
        </div>
        <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg outline-none"
          style={{ fontSize: "12px", fontWeight: 500 }}>
          <option value="all">Tất cả quận/huyện</option>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg outline-none"
          style={{ fontSize: "12px", fontWeight: 500 }}>
          <option value="all">Tất cả cấp học</option>
          {tiers.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <tr>
                <th className="px-4 py-2.5">Mã / Tên trường</th>
                <th className="px-4 py-2.5">Địa bàn</th>
                <th className="px-4 py-2.5">Cấp</th>
                <th className="px-4 py-2.5 text-right">HS</th>
                <th className="px-4 py-2.5 text-right">GV</th>
                <th className="px-4 py-2.5 text-right">Thiết bị</th>
                <th className="px-4 py-2.5">Đạt chuẩn</th>
                <th className="px-4 py-2.5">Bao phủ STEM</th>
                <th className="px-4 py-2.5">Điểm TB</th>
                <th className="px-4 py-2.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/50">
                  <td className="px-4 py-3">
                    <p style={{ fontWeight: 500 }}>{s.name}</p>
                    <p className="font-mono text-muted-foreground" style={{ fontSize: "10.5px" }}>{s.code}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>
                    <MapPin className="w-3 h-3 inline mr-0.5" />
                    {s.district}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-1.5 py-0.5 bg-secondary rounded" style={{ fontSize: "10.5px" }}>{s.tier}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{s.studentsCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{s.teachersCount}</td>
                  <td className="px-4 py-3 text-right">{s.equipmentCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full"
                          style={{
                            width: `${s.equipmentCompliancePct}%`,
                            backgroundColor: s.equipmentCompliancePct >= 70 ? "#16a34a" : s.equipmentCompliancePct >= 50 ? "#c8a84e" : "#dc2626",
                          }} />
                      </div>
                      <span style={{ fontSize: "11px", fontWeight: 600 }}>{s.equipmentCompliancePct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{
                      fontSize: "11.5px", fontWeight: 600,
                      color: s.stemCoveragePct >= 75 ? "#16a34a" : s.stemCoveragePct >= 50 ? "#c8a84e" : "#dc2626",
                    }}>{s.stemCoveragePct}%</span>
                  </td>
                  <td className="px-4 py-3" style={{
                    fontSize: "13px", fontWeight: 700,
                    color: s.avgScore >= 8 ? "#16a34a" : s.avgScore >= 6.5 ? "#c8a84e" : "#dc2626",
                  }}>
                    {s.avgScore.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toast.info(`Xem chi tiết ${s.name}`)}
                      className="p-1.5 hover:bg-secondary rounded">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SchoolDirectory;
