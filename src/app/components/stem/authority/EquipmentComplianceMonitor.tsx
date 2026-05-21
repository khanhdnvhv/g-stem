import { useMemo, useState } from "react";
import {
  ClipboardCheck, CheckCircle2, AlertTriangle, Wrench, Download, X,
  Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
  Filter,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { equipment, tenantsByType } from "./authority-data";
import { PageHeader, KpiCard, SelectDown } from "./authority-ui";
import { toast } from "sonner";

/* ================================================================ */
/*  EQUIPMENT COMPLIANCE MONITOR (Authority)                        */
/* ================================================================ */

const STATUS_LABELS: Record<string, string> = {
  ok:      "Hoạt động tốt",
  warning: "Cần kiểm tra",
  broken:  "Hỏng hóc",
  missing: "Thất lạc",
};
const STATUS_COLORS: Record<string, string> = {
  ok: "#16a34a", warning: "#f59e0b", broken: "#dc2626", missing: "#64748b",
};
const TIERS        = ["THCS", "THPT", "Tiểu học", "Mầm non", "THPT Nghề"];
const SCHOOL_YEARS = ["2023-2024", "2024-2025", "2025-2026"];
const PAGE_SIZE    = 8;

type SortKey = "school" | "district" | "total" | "ok" | "broken" | "compliancePct";
type SortDir = "asc" | "desc";

/* ------------------------------------------------------------------ */
/*  SortIcon                                                            */
/* ------------------------------------------------------------------ */
function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
  return sortDir === "asc"
    ? <ChevronUp className="w-3 h-3 text-[#7c3aed]" />
    : <ChevronDown className="w-3 h-3 text-[#7c3aed]" />;
}

const thBase  = "px-4 py-2.5 select-none cursor-pointer hover:text-foreground transition-colors";
const thInner = "flex items-center gap-1";

/* ================================================================ */
/*  MAIN COMPONENT                                                    */
/* ================================================================ */
export function EquipmentComplianceMonitor() {
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [filterTier, setFilterTier]         = useState("all");
  const [filterStatus, setFilterStatus]     = useState("all");
  const [filterYear, setFilterYear]         = useState("all");
  const [search, setSearch]                 = useState("");
  const [sortKey, setSortKey]               = useState<SortKey>("compliancePct");
  const [sortDir, setSortDir]               = useState<SortDir>("asc");
  const [page, setPage]                     = useState(1);

  const districts = useMemo(
    () => Array.from(new Set(tenantsByType.school.map((s) => s.district).filter(Boolean))).sort() as string[],
    []
  );

  const schoolNames = useMemo(
    () => tenantsByType.school.map((s) => s.name).sort(),
    []
  );

  function toggleSort(col: SortKey) {
    if (sortKey === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(col); setSortDir("asc"); }
    setPage(1);
  }

  const filteredSchools = useMemo(() => {
    return tenantsByType.school.filter((s) => {
      if (filterDistrict !== "all" && s.district !== filterDistrict) return false;
      if (filterTier !== "all" && !(s.gradeLevels ?? []).includes(filterTier)) return false;
      return true;
    });
  }, [filterDistrict, filterTier]);

  const filteredEquipment = useMemo(() => {
    const schoolIds = new Set(filteredSchools.map((s) => s.id));
    return equipment.filter((e) => {
      if (!schoolIds.has(e.schoolId)) return false;
      if (filterStatus !== "all" && e.status !== filterStatus) return false;
      return true;
    });
  }, [filteredSchools, filterStatus]);

  const schoolStats = useMemo(() => {
    const schoolIds = new Set(filteredSchools.map((s) => s.id));
    const allEq = equipment.filter((e) => schoolIds.has(e.schoolId));
    return filteredSchools.map((s) => {
      const eq     = allEq.filter((e) => e.schoolId === s.id);
      const ok     = eq.filter((e) => e.status === "ok").length;
      const broken = eq.filter((e) => e.status === "broken" || e.status === "missing").length;
      return {
        school: s.name, district: s.district ?? "",
        tier: s.gradeLevels?.[0] || "THCS",
        total: eq.length, ok, broken,
        compliancePct: eq.length ? Math.round((ok / eq.length) * 100) : 0,
      };
    });
  }, [filteredSchools]);

  const tableData = useMemo(() => {
    let list = [...schoolStats];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.school.toLowerCase().includes(q) || s.district.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [schoolStats, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(tableData.length / PAGE_SIZE));
  const pageData   = tableData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalEquipment = filteredEquipment.length;
  const totalOk        = filteredEquipment.filter((e) => e.status === "ok").length;
  const avgCompliance  = totalEquipment ? Math.round((totalOk / totalEquipment) * 100) : 0;

  const byStatus = useMemo(() => {
    const m: Record<string, number> = { ok: 0, warning: 0, broken: 0, missing: 0 };
    filteredEquipment.forEach((e) => { if (m[e.status] !== undefined) m[e.status]++; });
    return Object.entries(m).map(([key, value]) => ({
      name: STATUS_LABELS[key], value, fill: STATUS_COLORS[key],
    }));
  }, [filteredEquipment]);

  const byTier = useMemo(() => {
    const m = new Map<string, { ok: number; notOk: number }>();
    schoolStats.forEach((s) => {
      const prev = m.get(s.tier) || { ok: 0, notOk: 0 };
      m.set(s.tier, { ok: prev.ok + s.ok, notOk: prev.notOk + (s.total - s.ok) });
    });
    return Array.from(m.entries()).map(([tier, v]) => ({ tier, ...v }));
  }, [schoolStats]);

  const activeFilters = [filterDistrict, filterTier, filterStatus, filterYear].filter((f) => f !== "all").length;

  function clearFilters() {
    setFilterDistrict("all"); setFilterTier("all");
    setFilterStatus("all"); setFilterYear("all");
    setSearch(""); setPage(1);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ClipboardCheck}
        title="Giám sát Tình trạng Thiết bị"
        subtitle="Số lượng, tình trạng sử dụng và tỷ lệ đạt chuẩn/chưa đạt chuẩn tại các trường trực thuộc."
        accentColor="#7c3aed"
        actions={
          <button onClick={() => toast.success("Xuất báo cáo giám sát thiết bị cho Sở GD&ĐT")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        }
      />

      {/* ── Filters ── */}
      <div className="bg-card rounded-xl border border-border p-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "12px" }}>
            <Filter className="w-3.5 h-3.5" />
            <span style={{ fontWeight: 600 }}>Bộ lọc</span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm tên trường / quận huyện..."
              className="pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg outline-none"
              style={{ fontSize: "12px", minWidth: "220px" }} />
          </div>

          <SelectDown value={filterYear} label="Năm học"
            onChange={(v) => { setFilterYear(v); setPage(1); }}
            options={[{ value: "all", label: "Tất cả" }, ...SCHOOL_YEARS.map((y) => ({ value: y, label: y }))]}
          />
          <SelectDown value={filterDistrict} label="Quận/huyện" searchable
            onChange={(v) => { setFilterDistrict(v); setPage(1); }}
            options={[{ value: "all", label: "Tất cả" }, ...districts.map((d) => ({ value: d, label: d }))]}
          />
          <SelectDown value={filterTier} label="Cấp học"
            onChange={(v) => { setFilterTier(v); setPage(1); }}
            options={[{ value: "all", label: "Tất cả" }, ...TIERS.map((t) => ({ value: t, label: t }))]}
          />
          <SelectDown value={filterStatus} label="Tình trạng"
            onChange={(v) => { setFilterStatus(v); setPage(1); }}
            options={[{ value: "all", label: "Tất cả" }, ...Object.entries(STATUS_LABELS).map(([k, l]) => ({ value: k, label: l }))]}
          />

          {(activeFilters > 0 || search) && (
            <button onClick={clearFilters}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
              style={{ fontSize: "12px" }}>
              <X className="w-3.5 h-3.5" /> Xóa bộ lọc{activeFilters > 0 && ` (${activeFilters})`}
            </button>
          )}
        </div>
      </div>

      {/* ── KPI ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={ClipboardCheck} label="Tổng thiết bị"   value={totalEquipment.toLocaleString()} color="#7c3aed" subtitle="Đang lọc" />
        <KpiCard icon={CheckCircle2}   label="Đạt chuẩn"       value={`${avgCompliance}%`} color="#16a34a" change="+2%" trend="up" />
        <KpiCard icon={AlertTriangle}  label="Hỏng / Thất lạc" value={filteredEquipment.filter((e) => e.status === "broken" || e.status === "missing").length} color="#dc2626" />
        <KpiCard icon={Wrench}         label="Cần kiểm tra"    value={filteredEquipment.filter((e) => e.status === "warning").length} color="#f59e0b" />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Phân bổ thiết bị theo tình trạng</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" cx="50%" cy="50%"
                innerRadius={50} outerRadius={85} paddingAngle={3}
                label={(e) => `${e.value}`}>
                {byStatus.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {byStatus.map((s) => (
              <div key={s.name} className="flex items-center gap-2" style={{ fontSize: "11px" }}>
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: s.fill }} />
                <span className="flex-1 text-muted-foreground">{s.name}</span>
                <strong>{s.value}</strong>
                <span className="text-muted-foreground">
                  ({totalEquipment ? Math.round((s.value / totalEquipment) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>So sánh theo cấp học</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byTier}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="ok"    stackId="a" fill="#16a34a" name="Đạt chuẩn" />
              <Bar dataKey="notOk" stackId="a" fill="#dc2626" name="Chưa đạt" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
            <AlertTriangle className="w-4 h-4 inline mr-1.5 text-[#dc2626]" />
            Danh sách trường — tình trạng thiết bị
          </h3>
          <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{tableData.length} trường</span>
        </div>

        <table className="w-full">
          <thead className="bg-secondary/30 text-left text-muted-foreground text-xs font-semibold">
            <tr>
              <th className={thBase} onClick={() => toggleSort("school")}>
                <div className={thInner}>Trường <SortIcon col="school" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th className={thBase} onClick={() => toggleSort("district")}>
                <div className={thInner}>Quận/huyện <SortIcon col="district" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th className={thBase + " text-right"} onClick={() => toggleSort("total")}>
                <div className={thInner + " justify-end"}>Tổng TB <SortIcon col="total" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th className={thBase + " text-right"} onClick={() => toggleSort("ok")}>
                <div className={thInner + " justify-end"}>Đạt chuẩn <SortIcon col="ok" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th className={thBase + " text-right"} onClick={() => toggleSort("broken")}>
                <div className={thInner + " justify-end"}>Chưa đạt <SortIcon col="broken" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th className={thBase} onClick={() => toggleSort("compliancePct")}>
                <div className={thInner}>Tỷ lệ <SortIcon col="compliancePct" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border" style={{ fontSize: "13px" }}>
            {pageData.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Không có dữ liệu</td></tr>
            ) : pageData.map((s) => (
              <tr key={s.school} className="hover:bg-secondary/50">
                <td className="px-4 py-3" style={{ fontWeight: 500 }}>{s.school}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.district}</td>
                <td className="px-4 py-3 text-right">{s.total}</td>
                <td className="px-4 py-3 text-right text-[#16a34a]" style={{ fontWeight: 600 }}>{s.ok}</td>
                <td className="px-4 py-3 text-right text-[#dc2626]" style={{ fontWeight: 600 }}>{s.broken}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full" style={{
                        width: `${s.compliancePct}%`,
                        backgroundColor: s.compliancePct >= 70 ? "#16a34a" : s.compliancePct >= 50 ? "#c8a84e" : "#dc2626",
                      }} />
                    </div>
                    <span style={{ fontSize: "11.5px", fontWeight: 600 }}>{s.compliancePct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-muted-foreground" style={{ fontSize: "12px" }}>
              Trang {page} / {totalPages} · {tableData.length} trường
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p); return acc;
                }, [])
                .map((p, i) => p === "..." ? (
                  <span key={`e${i}`} className="px-1 text-muted-foreground" style={{ fontSize: "12px" }}>…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p as number)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium ${page === p ? "bg-[#7c3aed] text-white" : "hover:bg-secondary text-foreground"}`}>
                    {p}
                  </button>
                ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EquipmentComplianceMonitor;
