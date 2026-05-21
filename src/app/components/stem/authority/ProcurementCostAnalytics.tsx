import { useCallback, useMemo, useState } from "react";
import {
  TrendingUp, Download, DollarSign, Filter,
  Building2, ChevronDown, ChevronUp, ChevronsUpDown, Search, X,
} from "lucide-react";
import { SelectDown, PageHeader, KpiCard, formatVNDCompact } from "./authority-ui";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LabelList, Cell,
} from "recharts";
import { procurementEntries, schoolProcurementEntries, SCHOOL_TIERS, COST_CATEGORIES } from "./authority-data";
import { useAuth } from "./authority-ui";
import { toast } from "sonner";

const CAT_COLOR: Record<typeof COST_CATEGORIES[number], string> = {
  "Thiết bị":               "#7c3aed",
  "Phần mềm / Giấy phép":   "#2563eb",
  "Cơ sở vật chất":         "#0891b2",
  "Đào tạo GV":             "#16a34a",
  "Vận hành / Bảo trì":     "#c8a84e",
};

const PKG_META: Record<string, { label: string; color: string; bg: string }> = {
  "PKG-ADV": { label: "Nâng cao",  color: "#c8a84e", bg: "rgba(200,168,78,0.12)" },
  "PKG-BAS": { label: "Cơ bản",    color: "#2563eb", bg: "rgba(37,99,235,0.10)"  },
  "PKG-MIN": { label: "Tối thiểu", color: "#64748b", bg: "rgba(100,116,139,0.10)" },
};

const TABLE_COLS = [
  { key: "schoolName",   label: "Tên trường",       align: "left"  },
  { key: "district",     label: "Quận/Huyện",       align: "left"  },
  { key: "tier",         label: "Khối",             align: "left"  },
  { key: "packageId",    label: "Gói STEM",         align: "left"  },
  { key: "dominantCat",  label: "Danh mục chính",   align: "left"  },
  { key: "total",        label: "Tổng (tr VND)",    align: "right" },
] as const;

export function ProcurementCostAnalytics() {
  const { user } = useAuth();
  const isBo       = user?.tenantType === "authority" && !user?.province;
  const myProvince = user?.province ?? null;

  const [year, setYear]                         = useState(2026);
  const [selectedTiers, setTiers]               = useState<string[]>([]);
  const [filterProvince, setFilterProvince]     = useState<string>("all");
  const [schoolSearch, setSchoolSearch]         = useState("");
  const [schoolDistrictFilter, setSchoolDistrict] = useState("all");
  const [schoolSort, setSchoolSort]             = useState<{ key: string; dir: "asc" | "desc" }>({ key: "total", dir: "desc" });

  const toggleSchoolSort = (key: string) =>
    setSchoolSort(prev => ({ key, dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc" }));

  const years = useMemo(
    () => Array.from(new Set(procurementEntries.map(p => p.year))).sort(),
    []
  );
  const provinces = useMemo(
    () => Array.from(new Set(procurementEntries.map(p => p.province))).sort(),
    []
  );
  const activeTiers = useMemo(
    () => selectedTiers.length > 0 ? selectedTiers : [...SCHOOL_TIERS],
    [selectedTiers]
  );

  const toggleFilterTier = (t: string) =>
    setTiers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const provinceFilter = useCallback(
    (p: { province: string }) =>
      myProvince !== null ? p.province === myProvince
        : filterProvince === "all" || p.province === filterProvince,
    [myProvince, filterProvince]
  );

  const filtered = useMemo(
    () => procurementEntries.filter(
      p => p.year === year && provinceFilter(p) && activeTiers.includes(p.schoolTier)
    ),
    [year, provinceFilter, activeTiers]
  );

  const totalAmount = useMemo(
    () => filtered.reduce((s, p) => s + p.amountVND, 0),
    [filtered]
  );

  const yoyChange = useMemo(() => {
    const prevTotal = procurementEntries
      .filter(p => p.year === year - 1 && provinceFilter(p) && activeTiers.includes(p.schoolTier))
      .reduce((s, p) => s + p.amountVND, 0);
    if (!prevTotal) return null;
    const pct = Math.round((totalAmount - prevTotal) / prevTotal * 100);
    return { pct, trend: pct >= 0 ? "up" : "down" } as const;
  }, [year, provinceFilter, activeTiers, totalAmount]);

  const yoyComparison = useMemo(() =>
    years.map(y => ({
      year: `${y}`,
      total: Math.round(
        procurementEntries
          .filter(p => p.year === y && provinceFilter(p))
          .reduce((s, p) => s + p.amountVND, 0) / 1_000_000_000
      ),
    })),
    [years, provinceFilter]
  );

  const byCategory = useMemo(() => {
    const totalMillion = totalAmount / 1_000_000;
    return COST_CATEGORIES.map(cat => {
      const value = Math.round(
        filtered.filter(p => p.costCategory === cat).reduce((s, p) => s + p.amountVND, 0) / 1_000_000
      );
      return {
        name: cat, value,
        pct: totalMillion ? Math.round(value / totalMillion * 100) : 0,
        fill: CAT_COLOR[cat],
      };
    });
  }, [filtered, totalAmount]);

  // Per-school breakdown with dominant package and category
  const schoolRows = useMemo(() => {
    const filteredSchool = schoolProcurementEntries.filter(
      p => p.year === year && provinceFilter(p) && activeTiers.includes(p.schoolTier)
    );

    const map = new Map<string, {
      schoolId: string; schoolName: string; district: string; tier: string;
      pkgAmounts: Record<string, number>;
      catAmounts: Record<string, number>;
      total: number;
    }>();

    for (const p of filteredSchool) {
      const key = p.schoolId!;
      if (!map.has(key)) {
        map.set(key, {
          schoolId: key,
          schoolName: p.schoolName!,
          district: p.district ?? "",
          tier: p.schoolTier,
          pkgAmounts: {},
          catAmounts: Object.fromEntries(COST_CATEGORIES.map(c => [c, 0])),
          total: 0,
        });
      }
      const row = map.get(key)!;
      row.pkgAmounts[p.packageId] = (row.pkgAmounts[p.packageId] ?? 0) + p.amountVND;
      row.catAmounts[p.costCategory] = (row.catAmounts[p.costCategory] ?? 0) + p.amountVND;
      row.total = Math.round(row.total + p.amountVND / 1_000_000);
    }

    return Array.from(map.values()).map(row => {
      const dominantPkg = Object.entries(row.pkgAmounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "PKG-MIN";
      const catSorted   = Object.entries(row.catAmounts).sort((a, b) => b[1] - a[1]);
      const totalCat    = catSorted.reduce((s, [, v]) => s + v, 0);
      const dominantCat = catSorted[0]?.[0] ?? "Thiết bị";
      const dominantCatPct = totalCat > 0 ? Math.round(catSorted[0][1] / totalCat * 100) : 0;
      return {
        schoolId: row.schoolId,
        schoolName: row.schoolName,
        district: row.district,
        tier: row.tier,
        packageId: dominantPkg,
        dominantCat,
        dominantCatPct,
        total: row.total,
      };
    });
  }, [year, provinceFilter, activeTiers]);

  const schoolGrandTotal = useMemo(
    () => schoolRows.reduce((s, r) => s + r.total, 0),
    [schoolRows]
  );
  const schoolCount         = schoolRows.length;
  const avgPerSchoolMillion = schoolCount > 0 ? Math.round(schoolGrandTotal / schoolCount) : 0;

  const schoolDistricts = useMemo(
    () => Array.from(new Set(schoolRows.map(r => r.district).filter(Boolean))).sort((a, b) => a.localeCompare(b, "vi")),
    [schoolRows]
  );

  const hasSchoolFilter = schoolSearch !== "" || schoolDistrictFilter !== "all";

  const resetSchoolFilters = () => {
    setSchoolSearch("");
    setSchoolDistrict("all");
    setTiers([]);
  };

  const filteredSortedSchoolRows = useMemo(() => {
    const q = schoolSearch.trim().toLowerCase();
    let rows = schoolRows.filter(r =>
      (schoolDistrictFilter === "all" || r.district === schoolDistrictFilter) &&
      (!q || r.schoolName.toLowerCase().includes(q) || r.district.toLowerCase().includes(q))
    );
    const { key, dir } = schoolSort;
    rows = [...rows].sort((a, b) => {
      const va: string | number =
        key === "schoolName"  ? a.schoolName  :
        key === "tier"        ? a.tier        :
        key === "district"    ? a.district    :
        key === "packageId"   ? a.packageId   :
        key === "dominantCat" ? a.dominantCat :
        a.total;
      const vb: string | number =
        key === "schoolName"  ? b.schoolName  :
        key === "tier"        ? b.tier        :
        key === "district"    ? b.district    :
        key === "packageId"   ? b.packageId   :
        key === "dominantCat" ? b.dominantCat :
        b.total;
      if (typeof va === "string") return dir === "asc" ? va.localeCompare(vb as string, "vi") : (vb as string).localeCompare(va, "vi");
      return dir === "asc" ? va - (vb as number) : (vb as number) - va;
    });
    return rows;
  }, [schoolRows, schoolSearch, schoolDistrictFilter, schoolSort]);

  const handleExport = useCallback(() => {
    const bom = "﻿";
    const headers = ["Tên trường", "Quận/Huyện", "Khối", "Gói STEM", "Danh mục chính", "Tổng (tr VND)", "Tỷ lệ %"];
    const dataRows = filteredSortedSchoolRows.map(r => [
      r.schoolName, r.district, r.tier,
      PKG_META[r.packageId]?.label ?? r.packageId,
      `${r.dominantCat} ${r.dominantCatPct}%`,
      r.total,
      schoolGrandTotal ? Math.round(r.total / schoolGrandTotal * 100) : 0,
    ]);
    const csv = [headers, ...dataRows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `thong-ke-mua-sam-stem-${year}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất thong-ke-mua-sam-stem-${year}.csv`);
  }, [filteredSortedSchoolRows, schoolGrandTotal, year]);

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <PageHeader
        icon={TrendingUp}
        title="Thống kê Mua sắm STEM"
        subtitle={`Chi phí đầu tư thiết bị STEM theo khối trường × danh mục chi phí${myProvince ? ` tại ${myProvince}` : " toàn quốc"} — làm căn cứ lập dự toán.`}
        accentColor="#7c3aed"
        actions={
          <button onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Xuất dự toán
          </button>
        }
      />

      {/* ── Filter bar ── */}
      <div className="bg-card rounded-xl border border-border p-3 space-y-2.5">
        {/* Row 1 — chart + table filters: Năm, Khối */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "12px" }}>
            <Filter className="w-3.5 h-3.5" />
            <span style={{ fontWeight: 600 }}>Bộ lọc</span>
          </div>

          <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Năm</span>
          <SelectDown
            value={String(year)}
            onChange={v => setYear(Number(v))}
            options={years.map(y => ({ value: String(y), label: `Năm ${y}` }))}
          />

          {isBo && (
            <>
              <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Tỉnh/TP</span>
              <SelectDown
                value={filterProvince}
                onChange={setFilterProvince}
                options={[
                  { value: "all", label: "Tất cả tỉnh/TP" },
                  ...provinces.map(p => ({ value: p, label: p })),
                ]}
              />
            </>
          )}

          <div className="w-px h-5 bg-border mx-1" />

          <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Khối:</span>
          <button
            onClick={() => setTiers([])}
            className={`px-3 py-1 rounded-full border transition-all ${
              selectedTiers.length === 0
                ? "bg-[#7c3aed] border-[#7c3aed] text-white"
                : "border-border text-muted-foreground hover:border-[#7c3aed] hover:text-[#7c3aed]"
            }`}
            style={{ fontSize: "11.5px", fontWeight: 500 }}>
            Tất cả
          </button>
          {SCHOOL_TIERS.map(tier => (
            <button key={tier} onClick={() => toggleFilterTier(tier)}
              className={`px-3 py-1 rounded-full border transition-all ${
                selectedTiers.includes(tier)
                  ? "bg-[#7c3aed] border-[#7c3aed] text-white"
                  : "border-border text-muted-foreground hover:border-[#7c3aed] hover:text-[#7c3aed]"
              }`}
              style={{ fontSize: "11.5px", fontWeight: 500 }}>
              {tier}
            </button>
          ))}
        </div>

        {/* Row 2 — table-only filters: Search, District */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 pt-2 border-t border-border/60">
          <span className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Lọc bảng:</span>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={schoolSearch}
              onChange={e => setSchoolSearch(e.target.value)}
              placeholder="Tìm tên trường..."
              className="pl-8 pr-3 py-1 bg-background border border-border rounded-lg outline-none"
              style={{ fontSize: "12px", minWidth: 180 }}
            />
            {schoolSearch && (
              <button
                onClick={() => setSchoolSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <SelectDown
            value={schoolDistrictFilter}
            onChange={setSchoolDistrict}
            options={[
              { value: "all", label: "Tất cả quận/huyện" },
              ...schoolDistricts.map(d => ({ value: d, label: d })),
            ]}
          />

          {hasSchoolFilter && (
            <button
              onClick={() => { setSchoolSearch(""); setSchoolDistrict("all"); }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Xóa lọc bảng
            </button>
          )}
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          icon={DollarSign}
          label={`Tổng chi STEM ${year}`}
          value={formatVNDCompact(totalAmount)}
          color="#7c3aed"
          change={yoyChange ? `${yoyChange.pct > 0 ? "+" : ""}${yoyChange.pct}%` : undefined}
          trend={yoyChange?.trend}
        />
        <KpiCard
          icon={Building2}
          label="Số trường được đầu tư"
          value={`${schoolCount} trường`}
          color="#0891b2"
        />
        <KpiCard
          icon={TrendingUp}
          label="Chi bình quân / trường"
          value={`${avgPerSchoolMillion.toLocaleString()} tr VND`}
          color="#16a34a"
        />
      </div>

      {/* ── 2-col: YoY chart + Category bars ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* YoY trend */}
        <div className="lg:col-span-3 bg-card rounded-xl border border-border p-4">
          <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Tổng chi theo năm (tỷ VND)</h3>
          <p className="text-muted-foreground mt-0.5 mb-4" style={{ fontSize: "11px" }}>
            Tất cả khối trường{myProvince ? ` · ${myProvince}` : filterProvince !== "all" ? ` · ${filterProvince}` : ""}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={yoyComparison} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => [`${v} tỷ`, "Tổng chi"]}
                contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="total" position="top"
                  style={{ fontSize: 11, fontWeight: 600, fill: "currentColor" }}
                  formatter={(v: number) => `${v}tỷ`} />
                {yoyComparison.map((y, i) => (
                  <Cell key={i} fill={y.year === `${year}` ? "#7c3aed" : "#e2e8f0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category bars */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-4">
          <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Chi phí theo danh mục</h3>
          <p className="text-muted-foreground mt-0.5 mb-4" style={{ fontSize: "11px" }}>
            Năm {year} · Đơn vị: triệu VND
          </p>
          <div className="space-y-3.5">
            {[...byCategory].sort((a, b) => b.value - a.value).map(d => (
              <div key={d.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: d.fill }} />
                    <span style={{ fontSize: "11.5px", fontWeight: 500 }}>{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ fontSize: "11.5px", color: d.fill }}>{d.pct}%</span>
                    <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                      {d.value.toLocaleString()} tr
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${d.pct}%`, backgroundColor: d.fill }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── School table ── */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Danh sách trường — {year}</h3>
          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
            {filteredSortedSchoolRows.length}/{schoolRows.length} trường · Đơn vị: triệu VND
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/40 border-b border-border">
                {TABLE_COLS.map(col => (
                  <th key={col.key}
                    onClick={() => toggleSchoolSort(col.key)}
                    className={`px-4 py-2.5 font-semibold cursor-pointer select-none hover:opacity-80 text-muted-foreground ${col.align === "right" ? "text-right" : "text-left"}`}
                    style={{ fontSize: "11px" }}>
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {schoolSort.key === col.key
                        ? (schoolSort.dir === "desc"
                            ? <ChevronDown className="w-3 h-3 text-[#7c3aed]" />
                            : <ChevronUp className="w-3 h-3 text-[#7c3aed]" />)
                        : <ChevronsUpDown className="w-3 h-3 opacity-30" />
                      }
                    </span>
                  </th>
                ))}
                <th className="text-right px-4 py-2.5 text-muted-foreground font-semibold" style={{ fontSize: "11px" }}>
                  Tỷ lệ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredSortedSchoolRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
                    Không có trường nào khớp bộ lọc
                  </td>
                </tr>
              ) : filteredSortedSchoolRows.map(row => {
                const pct     = schoolGrandTotal ? Math.round(row.total / schoolGrandTotal * 100) : 0;
                const pkg     = PKG_META[row.packageId] ?? PKG_META["PKG-MIN"];
                const catColor = CAT_COLOR[row.dominantCat as typeof COST_CATEGORIES[number]] ?? "#64748b";
                return (
                  <tr key={row.schoolId} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium" style={{ fontSize: "13px" }}>
                      {row.schoolName}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "12px" }}>
                      {row.district}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-full border border-border text-muted-foreground"
                        style={{ fontSize: "11px" }}>
                        {row.tier}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-full font-medium"
                        style={{ fontSize: "11px", color: pkg.color, backgroundColor: pkg.bg }}>
                        {pkg.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: catColor }} />
                        <span style={{ fontSize: "11.5px" }}>{row.dominantCat}</span>
                        <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                          ({row.dominantCatPct}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold" style={{ fontSize: "13px" }}>
                      {row.total.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="inline-block px-1.5 py-0.5 rounded font-medium bg-[#7c3aed]/10 text-[#7c3aed]"
                        style={{ fontSize: "11px" }}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {filteredSortedSchoolRows.length > 0 && (
              <tfoot>
                <tr className="bg-secondary/50 border-t-2 border-border font-semibold">
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }} colSpan={5}>
                    {filteredSortedSchoolRows.length} trường được hiển thị
                  </td>
                  <td className="px-4 py-3 text-right text-[#7c3aed]" style={{ fontSize: "13px" }}>
                    {filteredSortedSchoolRows.reduce((s, r) => s + r.total, 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground" style={{ fontSize: "11px" }}>
                    {schoolGrandTotal
                      ? Math.round(filteredSortedSchoolRows.reduce((s, r) => s + r.total, 0) / schoolGrandTotal * 100)
                      : 0}%
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProcurementCostAnalytics;
