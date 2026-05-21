import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  FileText, Download, Search, CheckCircle2, Clock, XCircle,
  BarChart3, Users, Package, MapPin, Eye, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, Mail,
} from "lucide-react";
import { PageHeader, SelectDown } from "./authority-ui";
import { useAuth } from "./authority-ui";
import { useRecentReports } from "./useRecentReports";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

const ACCENT = "#7c3aed";
const PAGE_SIZE = 10;

// deployed   : ≥ 3 CT active
// in-progress: 1–2 CT active
// contacted  : 0 CT, budget > 0 (đã ký kết / chuẩn bị)
// not-reached: 0 CT, budget = 0 (chưa tiếp cận)
type DeployStatus = "deployed" | "in-progress" | "contacted" | "not-reached";

interface SchoolCV1014 {
  id: string;
  tenantId?: string;
  name: string;
  district: string;
  level: string;
  ct1: boolean; ct2: boolean; ct3: boolean; ct4: boolean; ct5: boolean;
  deployedPrograms: number;
  students: number;
  stemTeachers: number;
  budget: number; // triệu đồng
  deployDate: string;
  schoolYear: string;
}

function deriveStatus(d: SchoolCV1014): DeployStatus {
  const ctCount = [d.ct1, d.ct2, d.ct3, d.ct4, d.ct5].filter(Boolean).length;
  if (ctCount >= 3) return "deployed";
  if (ctCount >= 1) return "in-progress";
  if (d.budget > 0) return "contacted";
  return "not-reached";
}

const DATA: SchoolCV1014[] = [
  { id:"S001", tenantId:"T-SCH-01", name:"THCS Ba Vì",        district:"Ba Vì",        level:"THCS", ct1:true,  ct2:true,  ct3:false, ct4:true,  ct5:false, deployedPrograms:3, students:1200, stemTeachers:12, budget:450,  deployDate:"2023-09", schoolYear:"2023-2024" },
  { id:"S002", tenantId:"T-SCH-02", name:"THPT Đống Đa",      district:"Đống Đa",      level:"THPT", ct1:true,  ct2:true,  ct3:true,  ct4:true,  ct5:true,  deployedPrograms:5, students:1850, stemTeachers:18, budget:890,  deployDate:"2022-09", schoolYear:"2022-2023" },
  { id:"S003", name:"THCS Sóc Sơn",      district:"Sóc Sơn",      level:"THCS", ct1:true,  ct2:false, ct3:false, ct4:false, ct5:false, deployedPrograms:1, students:980,  stemTeachers:8,  budget:180,  deployDate:"2024-02", schoolYear:"2024-2025" },
  { id:"S004", tenantId:"T-SCH-03", name:"THCS Cầu Giấy",     district:"Cầu Giấy",     level:"THCS", ct1:true,  ct2:true,  ct3:false, ct4:false, ct5:false, deployedPrograms:2, students:1450, stemTeachers:15, budget:320,  deployDate:"2023-02", schoolYear:"2022-2023" },
  { id:"S005", tenantId:"T-SCH-04", name:"THPT Hoàn Kiếm",    district:"Hoàn Kiếm",    level:"THPT", ct1:true,  ct2:true,  ct3:true,  ct4:true,  ct5:false, deployedPrograms:4, students:1750, stemTeachers:16, budget:720,  deployDate:"2023-08", schoolYear:"2023-2024" },
  { id:"S006", name:"THCS Long Biên",    district:"Long Biên",    level:"THCS", ct1:true,  ct2:false, ct3:false, ct4:false, ct5:false, deployedPrograms:1, students:920,  stemTeachers:6,  budget:160,  deployDate:"2024-09", schoolYear:"2024-2025" },
  { id:"S007", name:"THCS Thanh Xuân",   district:"Thanh Xuân",   level:"THCS", ct1:true,  ct2:true,  ct3:false, ct4:false, ct5:false, deployedPrograms:2, students:1320, stemTeachers:11, budget:280,  deployDate:"2023-09", schoolYear:"2023-2024" },
  { id:"S008", name:"THPT Gia Lâm",      district:"Gia Lâm",      level:"THPT", ct1:false, ct2:false, ct3:false, ct4:false, ct5:false, deployedPrograms:0, students:1400, stemTeachers:4,  budget:0,    deployDate:"—",       schoolYear:"2025-2026" },
  { id:"S009", name:"THCS Nam Từ Liêm",  district:"Nam Từ Liêm",  level:"THCS", ct1:true,  ct2:false, ct3:false, ct4:false, ct5:false, deployedPrograms:1, students:1050, stemTeachers:7,  budget:200,  deployDate:"2024-08", schoolYear:"2024-2025" },
  { id:"S010", name:"THPT Hai Bà Trưng", district:"Hai Bà Trưng", level:"THPT", ct1:true,  ct2:true,  ct3:true,  ct4:false, ct5:false, deployedPrograms:3, students:1620, stemTeachers:14, budget:530,  deployDate:"2023-03", schoolYear:"2022-2023" },
  { id:"S011", name:"THCS Hoàng Mai",    district:"Hoàng Mai",    level:"THCS", ct1:false, ct2:false, ct3:false, ct4:false, ct5:false, deployedPrograms:0, students:890,  stemTeachers:3,  budget:0,    deployDate:"—",       schoolYear:"2025-2026" },
  { id:"S012", name:"THCS Bắc Từ Liêm", district:"Bắc Từ Liêm", level:"THCS", ct1:true,  ct2:true,  ct3:false, ct4:false, ct5:false, deployedPrograms:2, students:1180, stemTeachers:10, budget:290,  deployDate:"2023-09", schoolYear:"2023-2024" },
  { id:"S013", name:"THPT Tây Hồ",      district:"Tây Hồ",       level:"THPT", ct1:true,  ct2:true,  ct3:true,  ct4:false, ct5:true,  deployedPrograms:4, students:1680, stemTeachers:17, budget:760,  deployDate:"2023-01", schoolYear:"2022-2023" },
  { id:"S014", name:"THCS Hà Đông",     district:"Hà Đông",      level:"THCS", ct1:true,  ct2:false, ct3:false, ct4:false, ct5:false, deployedPrograms:1, students:1100, stemTeachers:9,  budget:210,  deployDate:"2024-09", schoolYear:"2024-2025" },
  { id:"S015", name:"THPT Đan Phượng",  district:"Đan Phượng",   level:"THPT", ct1:false, ct2:false, ct3:false, ct4:false, ct5:false, deployedPrograms:0, students:1050, stemTeachers:5,  budget:80,   deployDate:"—",       schoolYear:"2025-2026" },
];

const STATUS_CFG: Record<DeployStatus, { label: string; color: string; bg: string; border: string; icon: typeof CheckCircle2 }> = {
  "deployed":     { label: "Đã triển khai",  color: "#15803d", bg: "#dcfce7", border: "#bbf7d0", icon: CheckCircle2 },
  "in-progress":  { label: "Đang triển khai", color: "#b45309", bg: "#fef3c7", border: "#fde68a", icon: Clock },
  "contacted":    { label: "Đã tiếp cận",    color: "#1d4ed8", bg: "#dbeafe", border: "#bfdbfe", icon: Mail },
  "not-reached":  { label: "Chưa tiếp cận",  color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb", icon: XCircle },
};

const LEVEL_CFG: Record<string, { color: string; bg: string }> = {
  THCS: { color: "#1d4ed8", bg: "#dbeafe" },
  THPT: { color: "#0f172a", bg: "#e2e8f0" },
  TH:   { color: "#15803d", bg: "#dcfce7" },
  MN:   { color: "#0891b2", bg: "#cffafe" },
};

const STATUS_TAB_CFG: Record<DeployStatus | "all", { activeColor: string; activeBg: string }> = {
  "all":          { activeColor: "#fff", activeBg: ACCENT },
  "deployed":     { activeColor: "#fff", activeBg: "#15803d" },
  "in-progress":  { activeColor: "#fff", activeBg: "#b45309" },
  "contacted":    { activeColor: "#fff", activeBg: "#1d4ed8" },
  "not-reached":  { activeColor: "#fff", activeBg: "#6b7280" },
};

function CTDot({ active }: { active: boolean }) {
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${active ? "bg-green-500" : "bg-gray-200"}`} />
  );
}

function exportCSV(rows: SchoolCV1014[], scope: string) {
  const header = ["Mã","Tên trường","Cấp học","Quận/Huyện","Trạng thái","CT1","CT2","CT3","CT4","CT5","CT đã TK","GV STEM","Ngân sách (M)","Ngày TK","Năm học"];
  const toYN = (v: boolean) => v ? "Có" : "Không";
  const lines = [
    header.join(","),
    ...rows.map(d => [
      d.id, `"${d.name}"`, d.level, d.district, STATUS_CFG[deriveStatus(d)].label,
      toYN(d.ct1), toYN(d.ct2), toYN(d.ct3), toYN(d.ct4), toYN(d.ct5),
      d.deployedPrograms, d.stemTeachers, d.budget, d.deployDate, d.schoolYear,
    ].join(",")),
  ];
  const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = `BaoCao_CV1014_${scope}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type SortKey = keyof SchoolCV1014 | "status";

export function AuthorityReportCV1014() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const isSo       = !!user?.province;
  const scopeLabel = user?.province ?? "Toàn quốc";
  const { addReport } = useRecentReports(user?.id ?? "anon");

  const [search,         setSearch]         = useState("");
  const [filterStatus,   setFilterStatus]   = useState<DeployStatus | "all">("all");
  const [filterDistrict, setFilterDistrict] = useState("all");
  const [filterYear,     setFilterYear]     = useState("all");
  const [page,           setPage]           = useState(1);
  const [sort,           setSort]           = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  const toggleSort = (key: SortKey) =>
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc" }));

  const districts   = useMemo(() => Array.from(new Set(DATA.map(d => d.district))).sort(), []);
  const schoolYears = useMemo(() => Array.from(new Set(DATA.map(d => d.schoolYear))).sort().reverse(), []);

  const baseFiltered = useMemo(() => DATA.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.district.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterDistrict !== "all" && d.district !== filterDistrict) return false;
    if (filterYear !== "all" && d.schoolYear !== filterYear) return false;
    return true;
  }), [search, filterDistrict, filterYear]);

  const chartData = useMemo(() => {
    const n = baseFiltered.length;
    const pct = (count: number) => n > 0 ? Math.round(count / n * 100) : 0;
    return [
      { ct: "CT1 (STEM Cơ bản)",  schools: baseFiltered.filter(d => d.ct1).length, pct: pct(baseFiltered.filter(d => d.ct1).length) },
      { ct: "CT2 (Liên môn)",     schools: baseFiltered.filter(d => d.ct2).length, pct: pct(baseFiltered.filter(d => d.ct2).length) },
      { ct: "CT3 (CLB Sáng tạo)", schools: baseFiltered.filter(d => d.ct3).length, pct: pct(baseFiltered.filter(d => d.ct3).length) },
      { ct: "CT4 (Robotics/AI)",  schools: baseFiltered.filter(d => d.ct4).length, pct: pct(baseFiltered.filter(d => d.ct4).length) },
      { ct: "CT5 (NCKH)",         schools: baseFiltered.filter(d => d.ct5).length, pct: pct(baseFiltered.filter(d => d.ct5).length) },
    ];
  }, [baseFiltered]);

  const deployed    = baseFiltered.filter(d => deriveStatus(d) === "deployed").length;
  const inProgress  = baseFiltered.filter(d => deriveStatus(d) === "in-progress").length;
  const contacted   = baseFiltered.filter(d => deriveStatus(d) === "contacted").length;
  const notReached  = baseFiltered.filter(d => deriveStatus(d) === "not-reached").length;
  const total       = baseFiltered.length;

  const totalBudget     = baseFiltered.reduce((s, d) => s + d.budget, 0);
  const totalStudents   = baseFiltered
    .filter(d => { const s = deriveStatus(d); return s === "deployed" || s === "in-progress"; })
    .reduce((s, d) => s + d.students, 0);
  const totalCTDeployed = baseFiltered.reduce((s, d) => s + [d.ct1, d.ct2, d.ct3, d.ct4, d.ct5].filter(Boolean).length, 0);
  const totalCTPossible = total * 5;
  const stemCoveragePct = totalCTPossible > 0 ? Math.round(totalCTDeployed / totalCTPossible * 100) : 0;

  const filtered = useMemo(
    () => filterStatus === "all" ? baseFiltered : baseFiltered.filter(d => deriveStatus(d) === filterStatus),
    [baseFiltered, filterStatus]
  );

  const STATUS_ORDER: Record<DeployStatus, number> = { "deployed": 0, "in-progress": 1, "contacted": 2, "not-reached": 3 };

  const sortedFiltered = useMemo(() => [...filtered].sort((a, b) => {
    if (sort.key === "status") {
      const diff = STATUS_ORDER[deriveStatus(a)] - STATUS_ORDER[deriveStatus(b)];
      return sort.dir === "asc" ? diff : -diff;
    }
    const va = a[sort.key as keyof SchoolCV1014], vb = b[sort.key as keyof SchoolCV1014];
    if (typeof va === "string" && typeof vb === "string")
      return sort.dir === "asc" ? va.localeCompare(vb, "vi") : vb.localeCompare(va, "vi");
    if (typeof va === "boolean") return sort.dir === "asc" ? Number(va) - Number(vb) : Number(vb) - Number(va);
    return sort.dir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
  }), [filtered, sort]);

  const totalPages = Math.ceil(sortedFiltered.length / PAGE_SIZE);
  const paginated  = sortedFiltered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage  = (fn: () => void) => { fn(); setPage(1); };

  const STATUS_TABS: { id: DeployStatus | "all"; label: string; count: number }[] = [
    { id: "all",         label: "Tất cả",          count: total },
    { id: "deployed",    label: "Đã triển khai",   count: deployed },
    { id: "in-progress", label: "Đang triển khai", count: inProgress },
    { id: "contacted",   label: "Đã tiếp cận",     count: contacted },
    { id: "not-reached", label: "Chưa tiếp cận",   count: notReached },
  ];

  const SortIcon = ({ k }: { k: SortKey }) =>
    sort.key === k
      ? (sort.dir === "asc" ? <ChevronUp className="w-3 h-3 text-[#7c3aed]" /> : <ChevronDown className="w-3 h-3 text-[#7c3aed]" />)
      : <ChevronsUpDown className="w-3 h-3 opacity-30" />;

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        icon={FileText}
        title={`Báo cáo Triển khai STEM theo CV1014 — ${scopeLabel}`}
        subtitle="Công văn 1014/BGDĐT-GDTrH — Theo dõi tiến độ triển khai 5 chương trình STEM tại các trường"
        accentColor={ACCENT}
        actions={
          <button
            onClick={() => {
              exportCSV(filtered, scopeLabel);
              addReport({
                name: `Báo cáo CV1014 — ${scopeLabel}`,
                templateCode: "CV1014",
                scope: isSo ? "province" : "national",
                period: filterYear !== "all" ? filterYear : "2025-2026",
              });
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity"
            style={{ background: ACCENT }}
          >
            <Download className="w-4 h-4" /> Xuất CSV
          </button>
        }
      />

      {/* Context banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">
          CV1014/BGDĐT-GDTrH — 5 chương trình STEM cần triển khai:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {["CT1: STEM Cơ bản", "CT2: Liên môn", "CT3: CLB Sáng tạo", "CT4: Robotics/AI", "CT5: Nghiên cứu KH"].map(item => (
            <p key={item} className="text-xs text-blue-800">{item}</p>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="rounded-xl border p-4" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "#dcfce7" }}>
            <CheckCircle2 className="w-5 h-5" style={{ color: "#15803d" }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: "#15803d" }}>{deployed}</p>
          <p className="text-sm font-medium mt-0.5" style={{ color: "#15803d" }}>Đã triển khai</p>
          <p className="text-xs mt-1 text-green-600/60">{total > 0 ? Math.round(deployed / total * 100) : 0}% tổng số</p>
        </div>
        <div className="rounded-xl border p-4" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "#fef3c7" }}>
            <Clock className="w-5 h-5" style={{ color: "#b45309" }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: "#b45309" }}>{inProgress}</p>
          <p className="text-sm font-medium mt-0.5" style={{ color: "#b45309" }}>Đang triển khai</p>
          <p className="text-xs mt-1 text-amber-600/60">cần theo dõi</p>
        </div>
        <div className="rounded-xl border p-4" style={{ background: "#faf5ff", borderColor: "#e9d5ff" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "#ede9fe" }}>
            <Users className="w-5 h-5" style={{ color: ACCENT }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: ACCENT }}>{(totalStudents / 1000).toFixed(1)}K</p>
          <p className="text-sm font-medium mt-0.5" style={{ color: ACCENT }}>Học sinh tham gia STEM</p>
          <p className="text-xs mt-1" style={{ color: `${ACCENT}60` }}>trong các trường triển khai</p>
        </div>
        <div className="rounded-xl border p-4" style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "#dbeafe" }}>
            <Package className="w-5 h-5" style={{ color: "#2563eb" }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: "#2563eb" }}>{(totalBudget / 1000).toFixed(1)} tỷ</p>
          <p className="text-sm font-medium mt-0.5" style={{ color: "#2563eb" }}>Tổng ngân sách</p>
          <p className="text-xs mt-1 text-blue-600/60">đồng đã đầu tư</p>
        </div>
        <div className="rounded-xl border p-4" style={{ background: "#f0fdfa", borderColor: "#99f6e4" }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: "#ccfbf1" }}>
            <BarChart3 className="w-5 h-5" style={{ color: "#0d9488" }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: "#0d9488" }}>{stemCoveragePct}%</p>
          <p className="text-sm font-medium mt-0.5" style={{ color: "#0d9488" }}>Bao phủ STEM</p>
          <p className="text-xs mt-1" style={{ color: "#0d948880" }}>{totalCTDeployed}/{totalCTPossible} CT-trường</p>
        </div>
      </div>

      {/* Progress bar tổng quan */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Tổng quan triển khai — {total} trường</span>
            {isSo && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border"
                style={{ background: "#ede9fe", color: "#6d28d9", borderColor: "#c4b5fd" }}>
                <MapPin className="w-3 h-3" />{scopeLabel}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{total > 0 ? Math.round(deployed / total * 100) : 0}% đã triển khai</span>
        </div>
        <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
          <div style={{ width: `${total > 0 ? deployed / total * 100 : 0}%`,   background: "#22c55e" }} className="rounded-l-full" />
          <div style={{ width: `${total > 0 ? inProgress / total * 100 : 0}%`, background: "#f59e0b" }} />
          <div style={{ width: `${total > 0 ? contacted / total * 100 : 0}%`,  background: "#3b82f6" }} />
          <div style={{ width: `${total > 0 ? notReached / total * 100 : 0}%`, background: "#9ca3af" }} className="rounded-r-full" />
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Đã triển khai ({deployed})</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Đang triển khai ({inProgress})</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Đã tiếp cận ({contacted})</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />Chưa tiếp cận ({notReached})</span>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-sm mb-4">Tỷ lệ triển khai theo chương trình CT1–CT5</h3>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={chartData} barSize={36} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="ct" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, total || 1]} allowDecimals={false} />
            <Tooltip
              formatter={(v: number, _: string, props: { payload: { pct: number } }) =>
                [`${v} trường (${props.payload.pct}% tổng số)`, ""]
              }
            />
            <Bar dataKey="schools" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="pct"
                position="top"
                formatter={(v: number) => `${v}%`}
                style={{ fontSize: 11, fontWeight: 700, fill: "#374151" }}
              />
              {chartData.map((_, i) => (
                <Cell key={i} fill={["#16a34a", "#2563eb", "#7c3aed", "#d97706", "#dc2626"][i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 bg-muted rounded-xl p-1">
          {STATUS_TABS.map(t => {
            const isActive = filterStatus === t.id;
            const cfg = STATUS_TAB_CFG[t.id];
            return (
              <button
                key={t.id}
                onClick={() => resetPage(() => setFilterStatus(t.id))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={isActive
                  ? { background: cfg.activeBg, color: cfg.activeColor, boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }
                  : { color: "var(--muted-foreground)" }}
              >
                {t.label}
                <span className="text-[11px] px-1.5 py-px rounded-full font-semibold"
                  style={isActive
                    ? { background: "rgba(255,255,255,0.22)", color: "#fff" }
                    : { background: "var(--border)", color: "var(--muted-foreground)" }}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        <SelectDown
          value={filterDistrict}
          onChange={v => resetPage(() => setFilterDistrict(v))}
          options={[
            { value: "all", label: "Tất cả quận/huyện" },
            ...districts.map(d => ({ value: d, label: d })),
          ]}
        />

        <SelectDown
          value={filterYear}
          onChange={v => resetPage(() => setFilterYear(v))}
          options={[
            { value: "all", label: "Tất cả năm học" },
            ...schoolYears.map(y => ({ value: y, label: `Năm học ${y}` })),
          ]}
        />

        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm trường, quận/huyện..."
            value={search}
            onChange={e => resetPage(() => setSearch(e.target.value))}
            className="pl-9 pr-4 py-1.5 rounded-lg border border-border bg-card text-sm w-56 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full" style={{ fontSize: "12.5px" }}>
          <thead>
            <tr className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground">
              {([
                { key: "name",         label: "Trường",     align: "left",   sortable: true  },
                { key: "level",        label: "Cấp học",    align: "left",   sortable: true  },
                { key: "district",     label: "Quận/Huyện", align: "left",   sortable: true  },
                { key: "ct1",          label: "CT1",        align: "center", sortable: false },
                { key: "ct2",          label: "CT2",        align: "center", sortable: false },
                { key: "ct3",          label: "CT3",        align: "center", sortable: false },
                { key: "ct4",          label: "CT4",        align: "center", sortable: false },
                { key: "ct5",          label: "CT5",        align: "center", sortable: false },
                { key: "students",     label: "Học sinh",   align: "center", sortable: true  },
                { key: "stemTeachers", label: "GV STEM",    align: "center", sortable: true  },
                { key: "budget",       label: "Ngân sách",  align: "center", sortable: true  },
                { key: "status",       label: "Trạng thái", align: "center", sortable: true  },
              ] as { key: SortKey; label: string; align: string; sortable: boolean }[]).map(col => (
                <th key={col.key}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                  className={`px-4 py-2.5 ${col.sortable ? "cursor-pointer select-none hover:text-foreground" : ""} transition-colors whitespace-nowrap text-${col.align}`}>
                  <span className={`inline-flex items-center gap-1 ${col.align === "center" ? "justify-center" : ""}`}>
                    {col.label}
                    {col.sortable && <SortIcon k={col.key} />}
                  </span>
                </th>
              ))}
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border" style={{ fontSize: "13px" }}>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-14 text-center text-muted-foreground text-sm">
                  Không có kết quả phù hợp
                </td>
              </tr>
            ) : paginated.map(d => {
              const status = deriveStatus(d);
              const cfg    = STATUS_CFG[status];
              const lvl    = LEVEL_CFG[d.level] ?? { color: "#374151", bg: "#f3f4f6" };
              const Icon   = cfg.icon;
              return (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground" style={{ fontSize: "13px" }}>{d.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.deployedPrograms} CT · từ {d.deployDate}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ color: lvl.color, background: lvl.bg }}>
                      {d.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{d.district}</td>
                  <td className="px-4 py-3 text-center"><CTDot active={d.ct1} /></td>
                  <td className="px-4 py-3 text-center"><CTDot active={d.ct2} /></td>
                  <td className="px-4 py-3 text-center"><CTDot active={d.ct3} /></td>
                  <td className="px-4 py-3 text-center"><CTDot active={d.ct4} /></td>
                  <td className="px-4 py-3 text-center"><CTDot active={d.ct5} /></td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{d.students.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center font-medium">{d.stemTeachers}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {d.budget > 0 ? `${d.budget}M` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-semibold text-xs"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      <Icon className="w-3 h-3" />{cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {d.tenantId ? (
                      <button
                        onClick={() => navigate(`/authority/schools/${d.tenantId}`)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="p-1.5 inline-flex text-muted-foreground/30 cursor-not-allowed" title="Chưa onboarding vào hệ thống">
                        <Eye className="w-4 h-4" />
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {filtered.length === 0 ? "Không có kết quả" : `Hiển thị ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} / ${filtered.length} trường`}
          {" · "}Dữ liệu cập nhật đến 2026-05-18
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-lg bg-muted font-medium">Trang {page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
