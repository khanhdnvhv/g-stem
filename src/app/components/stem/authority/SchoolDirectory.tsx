import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  School as SchoolIcon, Search, Eye, MapPin,
  GraduationCap, Users, Boxes, Download,
  ChevronUp, ChevronDown, ChevronsUpDown,
  CheckCircle2, AlertTriangle, XCircle, Filter, X,
} from "lucide-react";
import { SelectDown, PageHeader, KpiCard } from "./authority-ui";
import {
  tenantsByType, equipmentBySchool, scheduleEntries,
} from "./authority-data";
import { useAuth } from "./authority-ui";
function exportCSV(rows: SchoolSummary[], title: string) {
  const tt38Label: Record<SchoolSummary["tt38Status"], string> = {
    dat: "Thiết bị đạt chuẩn", can_cai_thien: "Cần cải thiện", chua_dat: "Chưa đạt chuẩn",
  };
  const header = ["Mã","Tên trường","Tỉnh/Thành","Quận/Huyện","Cấp học","Gói STEM",
    "Học sinh","Giáo viên","Thiết bị đạt chuẩn (%)","Bao phủ STEM (%)","Điểm TB","Tình trạng thiết bị","Đồng bộ lần cuối"];
  const lines = [
    header.join(","),
    ...rows.map(s => [
      s.code, `"${s.name}"`, s.province, s.district, s.tier, `"${s.stemPackage}"`,
      s.studentsCount, s.teachersCount, s.equipmentCompliancePct, s.stemCoveragePct,
      s.avgScore.toFixed(1), tt38Label[s.tt38Status], s.lastSync.slice(0, 10),
    ].join(",")),
  ];
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

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
  tt38Status: "dat" | "can_cai_thien" | "chua_dat";
  stemPackage: string;
  schoolYear: string;
}

function buildSchoolSummary(): SchoolSummary[] {
  return tenantsByType.school.map((s, i) => {
    const eq = equipmentBySchool(s.id);
    const eqOk = eq.filter((e) => e.status === "ok").length;
    const compliancePct = eq.length ? Math.round((eqOk / eq.length) * 100) : 0;
    const coveragePct = 55 + (i * 13) % 40;
    const packages = ["CT1", "CT2", "CT3", "CT4", "CT5"];
    return {
      id: s.id,
      name: s.name,
      code: s.code,
      province: s.province || "Hà Nội",
      district: s.district || "—",
      tier: s.gradeLevels?.[0] || "THCS",
      studentsCount: 600 + (i * 73) % 1800,
      teachersCount: 40 + (i * 7) % 80,
      equipmentCount: eq.length,
      equipmentCompliancePct: compliancePct,
      stemCoveragePct: coveragePct,
      avgScore: 6.5 + ((i * 11) % 35) / 10,
      lastSync: new Date(Date.now() - (i + 1) * 86400_000 * 3).toISOString(),
      tt38Status: compliancePct >= 70 ? "dat" : compliancePct >= 50 ? "can_cai_thien" : "chua_dat",
      stemPackage: packages[i % packages.length],
      schoolYear: i % 3 === 0 ? "2024-2025" : "2025-2026",
    };
  });
}

type SortKey = "name" | "studentsCount" | "teachersCount" | "equipmentCompliancePct" | "stemCoveragePct" | "avgScore";
type SortDir = "asc" | "desc";

const TT38_OPTIONS = [
  { value: "all",           label: "Tất cả" },
  { value: "dat",           label: "Thiết bị đạt chuẩn (≥70%)" },
  { value: "can_cai_thien", label: "Cần cải thiện (50–69%)" },
  { value: "chua_dat",      label: "Chưa đạt chuẩn (<50%)" },
] as const;

function TT38Badge({ status }: { status: SchoolSummary["tt38Status"] }) {
  if (status === "dat")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200" style={{ fontSize: "11px", fontWeight: 600 }}>
        <CheckCircle2 className="w-3 h-3" /> Thiết bị đạt chuẩn
      </span>
    );
  if (status === "can_cai_thien")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200" style={{ fontSize: "11px", fontWeight: 600 }}>
        <AlertTriangle className="w-3 h-3" /> Cần cải thiện
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200" style={{ fontSize: "11px", fontWeight: 600 }}>
      <XCircle className="w-3 h-3" /> Chưa đạt chuẩn
    </span>
  );
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
  return sortDir === "asc"
    ? <ChevronUp className="w-3 h-3 text-[#7c3aed]" />
    : <ChevronDown className="w-3 h-3 text-[#7c3aed]" />;
}

const PAGE_SIZE = 8;

export function SchoolDirectory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [schools] = useState(buildSchoolSummary());

  const isSo = !!user?.province;
  const [search, setSearch]             = useState("");
  const [provinceFilter, setProvince]   = useState<string>(user?.province ?? "all");
  const [districtFilter, setDistrict]   = useState<string>("all");
  const [tierFilter, setTierFilter]     = useState<string>("all");
  const [tt38Filter, setTt38Filter]     = useState<string>("all");
  const [yearFilter, setYearFilter]     = useState<string>("all");
  const [sortKey, setSortKey]           = useState<SortKey>("name");
  const [sortDir, setSortDir]           = useState<SortDir>("asc");
  const [page, setPage]                 = useState(1);

  const provinces   = useMemo(() => Array.from(new Set(schools.map((s) => s.province))).sort(), [schools]);
  const districts   = useMemo(() => {
    const src = provinceFilter === "all" ? schools : schools.filter(s => s.province === provinceFilter);
    return Array.from(new Set(src.map((s) => s.district).filter(d => d !== "—"))).sort();
  }, [schools, provinceFilter]);
  const tiers       = useMemo(() => Array.from(new Set(schools.map((s) => s.tier))).sort(), [schools]);
  const schoolYears = useMemo(() => Array.from(new Set(schools.map((s) => s.schoolYear))).sort().reverse(), [schools]);

  function handleProvinceChange(v: string) {
    setProvince(v);
    setDistrict("all");
    setPage(1);
  }

  function toggleSort(col: SortKey) {
    if (sortKey === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(col); setSortDir("asc"); }
    setPage(1);
  }

  const filtered = useMemo(() => {
    let list = schools.filter((s) => {
      if (provinceFilter !== "all" && s.province !== provinceFilter) return false;
      if (districtFilter !== "all" && s.district !== districtFilter) return false;
      if (tierFilter !== "all" && s.tier !== tierFilter) return false;
      if (tt38Filter !== "all" && s.tt38Status !== tt38Filter) return false;
      if (yearFilter !== "all" && s.schoolYear !== yearFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.code.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      const aVal = a[sortKey], bVal = b[sortKey];
      const cmp = typeof aVal === "string"
        ? aVal.localeCompare(bVal as string, "vi")
        : (aVal as number) - (bVal as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [schools, provinceFilter, districtFilter, tierFilter, tt38Filter, yearFilter, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // KPIs — scope theo tỉnh nếu là Sở
  const scopedSchools  = isSo ? schools.filter(s => s.province === user!.province) : schools;
  const totalStudents  = scopedSchools.reduce((s, sc) => s + sc.studentsCount, 0);
  const totalTeachers  = scopedSchools.reduce((s, sc) => s + sc.teachersCount, 0);
  const avgCoverage    = scopedSchools.length ? Math.round(scopedSchools.reduce((s, sc) => s + sc.stemCoveragePct, 0) / scopedSchools.length) : 0;
  const datCount       = scopedSchools.filter(s => s.tt38Status === "dat").length;
  const chuaDatCount   = scopedSchools.filter(s => s.tt38Status === "chua_dat").length;

  const thCls = "px-4 py-2.5 cursor-pointer select-none hover:text-foreground transition-colors";
  const thInner = "flex items-center gap-1";

  return (
    <div className="space-y-5">
      <PageHeader
        icon={SchoolIcon}
        title={`Danh bạ trường trực thuộc — ${user?.province || "Toàn quốc"}`}
        subtitle="Danh sách các trường học triển khai STEM, đồng bộ từ CSDL ngành giáo dục. Click cột để sắp xếp."
        accentColor="#7c3aed"
        actions={
          <button
            onClick={() => exportCSV(filtered, `DanhSachTruong_${user?.province ?? "ToanQuoc"}`)}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Xuất danh sách
          </button>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border p-5" style={{ background: "#faf5ff", borderColor: "#e9d5ff" }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "#ede9fe" }}>
            <SchoolIcon className="w-5 h-5" style={{ color: "#7c3aed" }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: "#7c3aed" }}>{scopedSchools.length}</p>
          <p className="text-sm font-medium mt-0.5" style={{ color: "#7c3aed" }}>Tổng trường</p>
          <p className="text-xs mt-1" style={{ color: "#7c3aed99" }}>{isSo ? user!.province : "Toàn quốc"}</p>
        </div>
        <div className="rounded-xl border p-5" style={{ background: "#f0f9ff", borderColor: "#bae6fd" }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "#e0f2fe" }}>
            <Users className="w-5 h-5" style={{ color: "#0891b2" }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: "#0891b2" }}>{totalStudents.toLocaleString()}</p>
          <p className="text-sm font-medium mt-0.5" style={{ color: "#0891b2" }}>Học sinh</p>
          <p className="text-xs mt-1" style={{ color: "#0891b299" }}>đang học STEM</p>
        </div>
        <div className="rounded-xl border p-5" style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "#dbeafe" }}>
            <GraduationCap className="w-5 h-5" style={{ color: "#2563eb" }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: "#2563eb" }}>{totalTeachers.toLocaleString()}</p>
          <p className="text-sm font-medium mt-0.5" style={{ color: "#2563eb" }}>Giáo viên</p>
          <p className="text-xs mt-1" style={{ color: "#2563eb99" }}>giảng dạy STEM</p>
        </div>
        <div className="rounded-xl border p-5" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: "#dcfce7" }}>
            <Boxes className="w-5 h-5" style={{ color: "#16a34a" }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: "#16a34a" }}>{avgCoverage}%</p>
          <p className="text-sm font-medium mt-0.5" style={{ color: "#16a34a" }}>Bao phủ STEM TB</p>
          <p className="text-xs mt-1" style={{ color: "#16a34a99" }}>Thiết bị đạt chuẩn: {datCount} | Chưa đạt: {chuaDatCount}</p>
        </div>
      </div>

      {/* TT38 Status chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {TT38_OPTIONS.map(opt => (
          <button key={opt.value}
            onClick={() => { setTt38Filter(opt.value); setPage(1); }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition-colors ${
              tt38Filter === opt.value
                ? "bg-[#7c3aed] border-[#7c3aed] text-white"
                : "bg-card border-border text-muted-foreground hover:border-[#7c3aed] hover:text-[#7c3aed]"
            }`}
            style={{ fontSize: "12px", fontWeight: 500 }}>
            {opt.value === "dat"           && <CheckCircle2 className="w-3 h-3" />}
            {opt.value === "can_cai_thien" && <AlertTriangle className="w-3 h-3" />}
            {opt.value === "chua_dat"      && <XCircle className="w-3 h-3" />}
            {opt.label}
            {opt.value !== "all" && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                {scopedSchools.filter(s => s.tt38Status === opt.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "12px" }}>
            <Filter className="w-3.5 h-3.5" />
            <span style={{ fontWeight: 600 }}>Bộ lọc</span>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm tên trường / mã..."
              className="pl-8 pr-3 py-1 bg-background border border-border rounded-lg outline-none"
              style={{ fontSize: "12px", minWidth: "180px" }} />
          </div>

          {!isSo && (
            <SelectDown
              value={provinceFilter}
              onChange={handleProvinceChange}
              label="Tỉnh/TP"
              searchable
              options={[
                { value: "all", label: "Tất cả" },
                ...provinces.map(p => ({ value: p, label: p })),
              ]}
            />
          )}

          <SelectDown
            value={districtFilter}
            onChange={(v) => { setDistrict(v); setPage(1); }}
            disabled={provinceFilter === "all"}
            label="Quận/Huyện"
            searchable
            options={[
              { value: "all", label: "Tất cả" },
              ...districts.map(d => ({ value: d, label: d })),
            ]}
          />

          <SelectDown
            value={tierFilter}
            onChange={(v) => { setTierFilter(v); setPage(1); }}
            label="Cấp học"
            options={[
              { value: "all", label: "Tất cả" },
              ...tiers.map(t => ({ value: t, label: t })),
            ]}
          />

          <SelectDown
            value={yearFilter}
            onChange={(v) => { setYearFilter(v); setPage(1); }}
            label="Năm học"
            options={[
              { value: "all", label: "Tất cả" },
              ...schoolYears.map(y => ({ value: y, label: y })),
            ]}
          />

          {(search || provinceFilter !== "all" || districtFilter !== "all" || tierFilter !== "all" || tt38Filter !== "all" || yearFilter !== "all") && (
            <button
              onClick={() => { setSearch(""); handleProvinceChange("all"); setTierFilter("all"); setTt38Filter("all"); setYearFilter("all"); }}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors ml-auto"
              style={{ fontSize: "12px" }}>
              <X className="w-3.5 h-3.5" /> Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-secondary/30">
          <span className="text-muted-foreground" style={{ fontSize: "12px" }}>
            Hiển thị <strong className="text-foreground">{filtered.length}</strong> trường
            {filtered.length !== scopedSchools.length && ` (lọc từ ${scopedSchools.length})`}
          </span>
          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
            Trang {page}/{totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground text-xs font-semibold">
              <tr>
                <th className={thCls} onClick={() => toggleSort("name")}>
                  <div className={thInner}>Tên trường <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} /></div>
                </th>
                <th className="px-4 py-2.5">Địa bàn</th>
                <th className="px-4 py-2.5">Gói STEM</th>
                <th className={thCls + " text-right"} onClick={() => toggleSort("studentsCount")}>
                  <div className={thInner + " justify-end"}>HS <SortIcon col="studentsCount" sortKey={sortKey} sortDir={sortDir} /></div>
                </th>
                <th className={thCls + " text-right"} onClick={() => toggleSort("teachersCount")}>
                  <div className={thInner + " justify-end"}>GV <SortIcon col="teachersCount" sortKey={sortKey} sortDir={sortDir} /></div>
                </th>
                <th className={thCls} onClick={() => toggleSort("equipmentCompliancePct")}>
                  <div className={thInner}>Thiết bị đạt chuẩn <SortIcon col="equipmentCompliancePct" sortKey={sortKey} sortDir={sortDir} /></div>
                </th>
                <th className={thCls} onClick={() => toggleSort("stemCoveragePct")}>
                  <div className={thInner}>Bao phủ STEM <SortIcon col="stemCoveragePct" sortKey={sortKey} sortDir={sortDir} /></div>
                </th>
                <th className={thCls} onClick={() => toggleSort("avgScore")}>
                  <div className={thInner}>Điểm TB <SortIcon col="avgScore" sortKey={sortKey} sortDir={sortDir} /></div>
                </th>
                <th className="px-4 py-2.5">Trạng thái</th>
                <th className="px-4 py-2.5 text-right">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" style={{ fontSize: "13px" }}>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
                    Không có trường nào phù hợp bộ lọc.
                  </td>
                </tr>
              ) : pageData.map((s, idx) => {
                const globalIdx = (page - 1) * PAGE_SIZE + idx;
                return (
                  <tr key={s.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3">
                      <p style={{ fontSize: "13px", fontWeight: 600 }}>{s.name}</p>
                      <p className="font-mono text-muted-foreground" style={{ fontSize: "11px" }}>{s.code}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
                        <MapPin className="w-3 h-3 inline mr-0.5" />{s.province}
                      </p>
                      {s.district !== "—" && (
                        <p className="text-muted-foreground/70" style={{ fontSize: "11px" }}>{s.district}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-[#7c3aed]/10 text-[#7c3aed] rounded-full" style={{ fontSize: "11px", fontWeight: 600 }}>
                        {s.stemPackage}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">{s.studentsCount.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right">{s.teachersCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{
                              width: `${s.equipmentCompliancePct}%`,
                              backgroundColor: s.equipmentCompliancePct >= 70 ? "#16a34a"
                                : s.equipmentCompliancePct >= 50 ? "#c8a84e" : "#dc2626",
                            }} />
                        </div>
                        <span style={{
                          fontSize: "13px", fontWeight: 700,
                          color: s.equipmentCompliancePct >= 70 ? "#16a34a"
                            : s.equipmentCompliancePct >= 50 ? "#c8a84e" : "#dc2626",
                        }}>{s.equipmentCompliancePct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full rounded-full"
                            style={{
                              width: `${s.stemCoveragePct}%`,
                              backgroundColor: s.stemCoveragePct >= 75 ? "#16a34a"
                                : s.stemCoveragePct >= 50 ? "#0891b2" : "#c8a84e",
                            }} />
                        </div>
                        <span style={{
                          fontSize: "13px", fontWeight: 700,
                          color: s.stemCoveragePct >= 75 ? "#16a34a"
                            : s.stemCoveragePct >= 50 ? "#0891b2" : "#c8a84e",
                        }}>{s.stemCoveragePct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{
                      fontSize: "13px", fontWeight: 700,
                      color: s.avgScore >= 8 ? "#16a34a" : s.avgScore >= 6.5 ? "#c8a84e" : "#dc2626",
                    }}>
                      {s.avgScore.toFixed(1)}
                    </td>
                    <td className="px-4 py-3">
                      <TT38Badge status={s.tt38Status} />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => navigate(`/authority/schools/${s.id}`)}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                        title="Xem chi tiết">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-muted-foreground" style={{ fontSize: "12px" }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} trường
            </span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(1)}
                className="px-2 py-1 rounded border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ fontSize: "11px" }}>«</button>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-2.5 py-1 rounded border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ fontSize: "12px" }}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-2.5 py-1 rounded border transition-colors ${
                      p === page
                        ? "border-[#7c3aed] bg-[#7c3aed] text-white"
                        : "border-border hover:bg-secondary"
                    }`}
                    style={{ fontSize: "12px" }}>{p}</button>
                );
              })}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-2.5 py-1 rounded border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ fontSize: "12px" }}>›</button>
              <button disabled={page === totalPages} onClick={() => setPage(totalPages)}
                className="px-2 py-1 rounded border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ fontSize: "11px" }}>»</button>
            </div>
          </div>
        )}
      </div>

      {/* Summary footer */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Thiết bị đạt chuẩn (≥70%)",  count: scopedSchools.filter(s => s.tt38Status === "dat").length,           color: "#16a34a", bg: "#dcfce7" },
          { label: "Cần cải thiện (50–69%)",      count: scopedSchools.filter(s => s.tt38Status === "can_cai_thien").length, color: "#c8a84e", bg: "#fef9c3" },
          { label: "Chưa đạt chuẩn (<50%)",       count: scopedSchools.filter(s => s.tt38Status === "chua_dat").length,      color: "#dc2626", bg: "#fee2e2" },
        ].map(row => (
          <div key={row.label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: row.bg }}>
              <span style={{ fontSize: "16px", fontWeight: 800, color: row.color }}>{row.count}</span>
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: row.color }}>{row.label}</p>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                {scopedSchools.length ? Math.round((row.count / scopedSchools.length) * 100) : 0}% tổng số trường
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SchoolDirectory;
