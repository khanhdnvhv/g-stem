import { useState, useMemo } from "react";
import {
  FileText, Download, Search, CheckCircle2, AlertTriangle,
  XCircle, BarChart3, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, Eye, X, Filter,
} from "lucide-react";
import { useNavigate } from "react-router";
import { PageHeader, KpiCard, SelectDown } from "./authority-ui";
import { useAuth } from "./authority-ui";
import { useRecentReports } from "./useRecentReports";

const ACCENT = "#7c3aed";
const PAGE_SIZE = 10;

type Status = "compliant" | "partial" | "non-compliant";

interface RawRow {
  id: string; name: string; level: string; district: string;
  csvc: boolean; giaoVien: boolean; chuongTrinh: boolean; baoCao: boolean;
  lastUpdate: string; stemPackage: string; schoolYear: string;
  tenantId?: string;
}

interface Row extends RawRow {
  score: number;
  status: Status;
}

// TT38 score computed from 3 real criteria (CSVC 35 + GV 35 + Chương trình 30 = 100)
// Small per-school variance via id hash for realistic spread
function enrich(r: RawRow): Row {
  const hash  = r.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 12;
  const base  = (r.csvc ? 35 : 0) + (r.giaoVien ? 35 : 0) + (r.chuongTrinh ? 30 : 0);
  const delta = (r.csvc && r.giaoVien && r.chuongTrinh) ? hash % 10 : (hash % 10) - 4;
  const score = Math.max(10, Math.min(100, base + delta));
  const status: Status = score >= 80 ? "compliant" : score >= 60 ? "partial" : "non-compliant";
  return { ...r, score, status };
}

const LEVELS = ["TH", "THCS", "THPT", "MN"] as const;

const LEVEL_LABEL: Record<string, string> = {
  TH: "Tiểu học", THCS: "THCS", THPT: "THPT", MN: "Mầm non",
};


const RAW: RawRow[] = [
  { id:"S001", name:"THCS Ba Vì",         level:"THCS", district:"Ba Vì",        csvc:true,  giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2026-04-15", stemPackage:"CT3", schoolYear:"2025-2026", tenantId:"T-SCH-01" },
  { id:"S002", name:"THPT Đống Đa",       level:"THPT", district:"Đống Đa",      csvc:true,  giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2026-04-20", stemPackage:"CT5", schoolYear:"2025-2026", tenantId:"T-SCH-02" },
  { id:"S004", name:"THCS Cầu Giấy",      level:"THCS", district:"Cầu Giấy",     csvc:true,  giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2026-04-25", stemPackage:"CT2", schoolYear:"2025-2026", tenantId:"T-SCH-03" },
  { id:"S005", name:"THPT Hoàn Kiếm",     level:"THPT", district:"Hoàn Kiếm",    csvc:true,  giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2026-04-18", stemPackage:"CT5", schoolYear:"2025-2026", tenantId:"T-SCH-04" },
  { id:"S007", name:"THCS Thanh Xuân",    level:"THCS", district:"Thanh Xuân",   csvc:true,  giaoVien:true,  chuongTrinh:false, baoCao:true,  lastUpdate:"2026-04-12", stemPackage:"CT2", schoolYear:"2025-2026" },
  { id:"S010", name:"THPT Hai Bà Trưng",  level:"THPT", district:"Hai Bà Trưng", csvc:true,  giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2026-04-22", stemPackage:"CT3", schoolYear:"2025-2026" },
  { id:"S012", name:"THCS Bắc Từ Liêm",  level:"THCS", district:"Bắc Từ Liêm",  csvc:true,  giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2026-04-08", stemPackage:"CT2", schoolYear:"2025-2026" },
  { id:"S013", name:"THPT Tây Hồ",        level:"THPT", district:"Tây Hồ",       csvc:true,  giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2026-04-30", stemPackage:"CT3", schoolYear:"2025-2026" },
  { id:"S020", name:"TH Cầu Giấy",        level:"TH",   district:"Cầu Giấy",     csvc:true,  giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2026-04-10", stemPackage:"CT2", schoolYear:"2025-2026" },
  { id:"S021", name:"TH Đống Đa",         level:"TH",   district:"Đống Đa",      csvc:true,  giaoVien:false, chuongTrinh:true,  baoCao:true,  lastUpdate:"2026-04-05", stemPackage:"CT1", schoolYear:"2025-2026" },
  { id:"S022", name:"MN Hoàn Kiếm",       level:"MN",   district:"Hoàn Kiếm",    csvc:true,  giaoVien:false, chuongTrinh:false, baoCao:true,  lastUpdate:"2026-03-28", stemPackage:"CT1", schoolYear:"2025-2026" },
  { id:"S023", name:"MN Thanh Xuân",      level:"MN",   district:"Thanh Xuân",   csvc:false, giaoVien:false, chuongTrinh:false, baoCao:false, lastUpdate:"2026-03-15", stemPackage:"CT1", schoolYear:"2025-2026" },
  { id:"S003", name:"THCS Sóc Sơn",       level:"THCS", district:"Sóc Sơn",      csvc:true,  giaoVien:false, chuongTrinh:true,  baoCao:true,  lastUpdate:"2025-10-10", stemPackage:"CT1", schoolYear:"2024-2025" },
  { id:"S006", name:"THCS Long Biên",     level:"THCS", district:"Long Biên",    csvc:false, giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2025-09-28", stemPackage:"CT1", schoolYear:"2024-2025" },
  { id:"S008", name:"THPT Gia Lâm",       level:"THPT", district:"Gia Lâm",      csvc:false, giaoVien:false, chuongTrinh:false, baoCao:false, lastUpdate:"2025-08-15", stemPackage:"CT1", schoolYear:"2024-2025" },
  { id:"S009", name:"THCS Nam Từ Liêm",   level:"THCS", district:"Nam Từ Liêm",  csvc:true,  giaoVien:false, chuongTrinh:true,  baoCao:false, lastUpdate:"2025-10-20", stemPackage:"CT2", schoolYear:"2024-2025" },
  { id:"S011", name:"THCS Hoàng Mai",     level:"THCS", district:"Hoàng Mai",    csvc:false, giaoVien:false, chuongTrinh:true,  baoCao:true,  lastUpdate:"2025-09-10", stemPackage:"CT1", schoolYear:"2024-2025" },
  { id:"S014", name:"THCS Hà Đông",       level:"THCS", district:"Hà Đông",      csvc:true,  giaoVien:false, chuongTrinh:false, baoCao:true,  lastUpdate:"2025-10-05", stemPackage:"CT1", schoolYear:"2024-2025" },
  { id:"S024", name:"TH Hà Đông",         level:"TH",   district:"Hà Đông",      csvc:false, giaoVien:false, chuongTrinh:true,  baoCao:true,  lastUpdate:"2025-09-05", stemPackage:"CT1", schoolYear:"2024-2025" },
  { id:"S025", name:"MN Long Biên",       level:"MN",   district:"Long Biên",    csvc:true,  giaoVien:false, chuongTrinh:false, baoCao:false, lastUpdate:"2025-09-20", stemPackage:"CT1", schoolYear:"2024-2025" },
  { id:"S015", name:"THPT Đan Phượng",    level:"THPT", district:"Đan Phượng",   csvc:true,  giaoVien:true,  chuongTrinh:false, baoCao:false, lastUpdate:"2025-09-28", stemPackage:"CT2", schoolYear:"2024-2025" },
  { id:"S001", name:"THCS Ba Vì",         level:"THCS", district:"Ba Vì",        csvc:true,  giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2024-04-10", stemPackage:"CT3", schoolYear:"2023-2024" },
  { id:"S002", name:"THPT Đống Đa",       level:"THPT", district:"Đống Đa",      csvc:true,  giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2024-04-18", stemPackage:"CT5", schoolYear:"2023-2024" },
  { id:"S005", name:"THPT Hoàn Kiếm",     level:"THPT", district:"Hoàn Kiếm",    csvc:true,  giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2024-04-15", stemPackage:"CT5", schoolYear:"2023-2024" },
  { id:"S007", name:"THCS Thanh Xuân",    level:"THCS", district:"Thanh Xuân",   csvc:true,  giaoVien:false, chuongTrinh:true,  baoCao:true,  lastUpdate:"2024-03-20", stemPackage:"CT2", schoolYear:"2023-2024" },
  { id:"S010", name:"THPT Hai Bà Trưng",  level:"THPT", district:"Hai Bà Trưng", csvc:true,  giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2024-04-20", stemPackage:"CT3", schoolYear:"2023-2024" },
  { id:"S002", name:"THPT Đống Đa",       level:"THPT", district:"Đống Đa",      csvc:true,  giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2023-04-15", stemPackage:"CT5", schoolYear:"2022-2023" },
  { id:"S004", name:"THCS Cầu Giấy",      level:"THCS", district:"Cầu Giấy",     csvc:true,  giaoVien:false, chuongTrinh:true,  baoCao:true,  lastUpdate:"2023-03-10", stemPackage:"CT2", schoolYear:"2022-2023" },
  { id:"S010", name:"THPT Hai Bà Trưng",  level:"THPT", district:"Hai Bà Trưng", csvc:true,  giaoVien:false, chuongTrinh:true,  baoCao:false, lastUpdate:"2023-03-20", stemPackage:"CT3", schoolYear:"2022-2023" },
  { id:"S013", name:"THPT Tây Hồ",        level:"THPT", district:"Tây Hồ",       csvc:true,  giaoVien:true,  chuongTrinh:true,  baoCao:true,  lastUpdate:"2023-04-05", stemPackage:"CT3", schoolYear:"2022-2023" },
];

const DATA: Row[] = RAW.map(enrich);

const STATUS_CFG: Record<Status, { label: string; color: string; bg: string; border: string; Icon: typeof CheckCircle2 }> = {
  compliant:       { label: "Đạt chuẩn",  color: "#15803d", bg: "#dcfce7", border: "#bbf7d0", Icon: CheckCircle2 },
  partial:         { label: "Đạt 1 phần", color: "#b45309", bg: "#fef3c7", border: "#fde68a", Icon: AlertTriangle },
  "non-compliant": { label: "Chưa đạt",   color: "#b91c1c", bg: "#fee2e2", border: "#fecaca", Icon: XCircle },
};

const LEVEL_COLOR: Record<string, { color: string; bg: string }> = {
  TH:   { color: "#15803d", bg: "#dcfce7" },
  THCS: { color: "#1d4ed8", bg: "#dbeafe" },
  THPT: { color: "#374151", bg: "#f1f5f9" },
  MN:   { color: "#0891b2", bg: "#cffafe" },
};

function Tick({ ok }: { ok: boolean }) {
  return ok
    ? <CheckCircle2 className="w-4 h-4 mx-auto text-green-500" />
    : <XCircle className="w-4 h-4 mx-auto text-red-400" />;
}

function exportCSV(rows: Row[], scope: string) {
  const yn = (v: boolean) => v ? "Đạt" : "Chưa đạt";
  const sl: Record<Status, string> = { compliant:"Đạt chuẩn", partial:"Đạt 1 phần", "non-compliant":"Chưa đạt" };
  const lines = [
    ["Mã","Tên trường","Cấp học","Quận/Huyện","Gói STEM","Điểm TT38","CSVC","GV đào tạo","Chương trình","Báo cáo","Kết quả","Năm học","Cập nhật"].join(","),
    ...rows.map(d => [d.id,`"${d.name}"`,d.level,d.district,d.stemPackage,`${d.score}%`,yn(d.csvc),yn(d.giaoVien),yn(d.chuongTrinh),yn(d.baoCao),sl[d.status],d.schoolYear,d.lastUpdate].join(",")),
  ];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿"+lines.join("\n")], { type:"text/csv;charset=utf-8;" }));
  a.download = `BaoCao_TT38_${scope}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

export function AuthorityReportTT38() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const scope = user?.province ?? "Toàn quốc";
  const { addReport } = useRecentReports(user?.id ?? "anon");

  const [search,         setSearch]         = useState("");
  const [status,         setStatus]         = useState<Status | "all">("all");
  const [district,       setDistrict]       = useState("all");
  const [year,           setYear]           = useState("2025-2026");
  const [level,          setLevel]          = useState("all");
  const [criteriaFilter, setCriteriaFilter] = useState<Set<string>>(new Set());
  const [page,           setPage]           = useState(1);
  const [sort,           setSort]           = useState<{ key: keyof Row; dir: "asc" | "desc" }>({ key: "score", dir: "desc" });

  const toggleSort = (key: keyof Row) =>
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc" }));

  const toggleCriteria = (key: string) => {
    setCriteriaFilter(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    setPage(1);
  };

  const districts   = useMemo(() => Array.from(new Set(DATA.map(d => d.district))).sort(), []);
  const schoolYears = useMemo(() => Array.from(new Set(DATA.map(d => d.schoolYear))).sort().reverse(), []);

  // base: tất cả filter trừ status — dùng cho KPI + chart
  const base = useMemo(() => DATA.filter(d => {
    if (search   && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.district.toLowerCase().includes(search.toLowerCase())) return false;
    if (district !== "all" && d.district !== district) return false;
    if (year     !== "all" && d.schoolYear !== year)   return false;
    if (level    !== "all" && d.level !== level)       return false;
    return true;
  }), [search, district, year, level]);

  const total     = base.length;
  const nOk       = base.filter(d => d.status === "compliant").length;
  const nPartial  = base.filter(d => d.status === "partial").length;
  const nFail     = base.filter(d => d.status === "non-compliant").length;
  const avgScore  = total ? Math.round(base.reduce((s,d) => s+d.score, 0) / total) : 0;
  const pctOk     = total ? Math.round(nOk / total * 100) : 0;

  // 3 tiêu chí TT38 thực sự (baoCao là trạng thái nộp báo cáo, không phải tiêu chí chấm điểm)
  const criteriaData = useMemo(() => [
    { key: "csvc",        label: "Cơ sở vật chất",        weight: "35%", fail: base.filter(d => !d.csvc).length },
    { key: "giaoVien",    label: "Giáo viên đào tạo",      weight: "35%", fail: base.filter(d => !d.giaoVien).length },
    { key: "chuongTrinh", label: "Chương trình giảng dạy", weight: "30%", fail: base.filter(d => !d.chuongTrinh).length },
  ].sort((a, b) => b.fail - a.fail), [base]);

  const rows = useMemo(() => {
    let r = status === "all" ? base : base.filter(d => d.status === status);
    if (criteriaFilter.size > 0)
      r = r.filter(d => [...criteriaFilter].some(k => !d[k as keyof Row]));
    return r;
  }, [base, status, criteriaFilter]);

  const sortedRows = useMemo(() => [...rows].sort((a, b) => {
    const va = a[sort.key], vb = b[sort.key];
    if (typeof va === "string" && typeof vb === "string")
      return sort.dir === "asc" ? va.localeCompare(vb, "vi") : vb.localeCompare(va, "vi");
    if (typeof va === "boolean") return sort.dir === "asc" ? Number(va) - Number(vb) : Number(vb) - Number(va);
    return sort.dir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
  }), [rows, sort]);

  const maxPage   = Math.ceil(sortedRows.length / PAGE_SIZE) || 1;
  const pageRows  = sortedRows.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const go        = (fn: () => void) => { fn(); setPage(1); };
  const hasFilter = district !== "all" || year !== "all" || level !== "all" || !!search || criteriaFilter.size > 0;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <PageHeader
        icon={FileText}
        title={`Báo cáo TT38 — ${scope}`}
        subtitle={`Thông tư 38/2023/TT-BGDĐT · Năm học ${year !== "all" ? year : "tất cả"} · ${total} trường`}
        accentColor={ACCENT}
        actions={
          <button
            onClick={() => {
              exportCSV(rows, scope);
              addReport({ name:`Báo cáo TT38 — ${scope}`, templateCode:"TT38-2023", scope: user?.province ? "province" : "national", period: year !== "all" ? year : "2025-2026" });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ background: ACCENT }}
          >
            <Download className="w-4 h-4" /> Xuất CSV
          </button>
        }
      />

      {/* ── 4 KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={CheckCircle2}  label="Đạt chuẩn TT38"   value={nOk}          color="#15803d" subtitle={`${pctOk}% tổng số trường`} />
        <KpiCard icon={AlertTriangle} label="Đạt một phần"      value={nPartial}     color="#b45309" subtitle="cần cải thiện" />
        <KpiCard icon={XCircle}       label="Chưa đạt chuẩn"   value={nFail}        color="#b91c1c" subtitle="ưu tiên hỗ trợ" />
        <KpiCard icon={BarChart3}     label="Điểm TB toàn Sở"  value={`${avgScore}%`} color={ACCENT} subtitle="CSVC 35% · GV 35% · CT 30%" />
      </div>

      {/* ── Overview strip ── */}
      <div className="bg-card border border-border rounded-xl px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Label + bar */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Tổng quan tuân thủ TT38</p>
            <div className="flex h-3 rounded-full overflow-hidden bg-secondary">
              {nOk      > 0 && <div style={{ flex: nOk,      background: "#22c55e" }} />}
              {nPartial > 0 && <div style={{ flex: nPartial, background: "#f59e0b", marginLeft: 1 }} />}
              {nFail    > 0 && <div style={{ flex: nFail,    background: "#ef4444", marginLeft: 1 }} />}
            </div>
          </div>
          {/* Legend items inline */}
          <div className="flex items-center gap-5 shrink-0">
            {[
              { label:"Đạt chuẩn",  n: nOk,     dot:"#22c55e", color:"#15803d" },
              { label:"Đạt 1 phần", n: nPartial, dot:"#f59e0b", color:"#b45309" },
              { label:"Chưa đạt",   n: nFail,    dot:"#ef4444", color:"#b91c1c" },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.dot }} />
                <span className="text-xs text-muted-foreground">{r.label}</span>
                <span className="text-sm font-bold tabular-nums" style={{ color: r.color }}>{r.n}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  · {total ? Math.round(r.n/total*100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Criteria weakness chart ── */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-semibold text-sm text-foreground">Tiêu chí chưa đạt — cần hỗ trợ</p>
            <p className="text-xs text-muted-foreground mt-0.5">Click vào tiêu chí để lọc bảng bên dưới</p>
          </div>
          {criteriaFilter.size > 0 && (
            <button onClick={() => { setCriteriaFilter(new Set()); setPage(1); }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5">
              <X className="w-3.5 h-3.5" /> Bỏ lọc
            </button>
          )}
        </div>
        <div className="space-y-3">
          {criteriaData.map(({ key, label, weight, fail }) => {
            const pct = total ? Math.round(fail / total * 100) : 0;
            const barColor = pct >= 30 ? "#ef4444" : pct >= 10 ? "#f59e0b" : "#22c55e";
            const textColor = pct >= 30 ? "#b91c1c" : pct >= 10 ? "#b45309" : "#15803d";
            const active = criteriaFilter.has(key);
            return (
              <div key={key} onClick={() => toggleCriteria(key)}
                className="rounded-lg p-2.5 -mx-2.5 cursor-pointer transition-colors hover:bg-secondary/60"
                style={active ? { background: "color-mix(in srgb, var(--secondary) 80%, transparent)", outline: `2px solid ${barColor}`, borderRadius: 8 } : {}}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {active && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: barColor }} />}
                    <span className="text-sm font-medium" style={{ color: active ? textColor : "var(--foreground)" }}>{label}</span>
                    <span className="text-xs text-muted-foreground">({weight})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground tabular-nums">{fail} trường</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: textColor, minWidth: 38, textAlign:"right" }}>{pct}%</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: barColor, opacity: active ? 1 : 0.7, minWidth: pct > 0 ? 6 : 0 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-card border border-border rounded-xl p-3">
        <div className="flex flex-wrap items-center gap-2.5">

          {/* Status tabs */}
          <div className="flex items-center gap-0.5 bg-secondary/70 rounded-lg p-0.5">
            {([
              { id:"all"           as const, label:"Tất cả",    n:total,    bg:ACCENT    },
              { id:"compliant"     as const, label:"Đạt chuẩn", n:nOk,      bg:"#15803d" },
              { id:"partial"       as const, label:"Đạt 1 phần",n:nPartial, bg:"#b45309" },
              { id:"non-compliant" as const, label:"Chưa đạt",  n:nFail,    bg:"#b91c1c" },
            ]).map(t => (
              <button key={t.id} onClick={() => go(() => setStatus(t.id))}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap"
                style={status === t.id
                  ? { background: t.bg, color:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,.18)" }
                  : { color:"var(--muted-foreground)" }}>
                {t.label}
                <span className="tabular-nums rounded-full px-1.5"
                  style={{ fontSize:10,
                    background: status===t.id ? "rgba(255,255,255,.22)" : "var(--border)",
                    color: status===t.id ? "#fff" : "var(--muted-foreground)" }}>
                  {t.n}
                </span>
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-border hidden md:block" />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Tìm trường..." value={search}
              onChange={e => go(() => setSearch(e.target.value))}
              className="pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg outline-none focus:border-[#7c3aed] transition-colors"
              style={{ fontSize:12, minWidth:150 }} />
          </div>

          <SelectDown label="Năm học" value={year} onChange={v => go(() => setYear(v))}
            options={[{ value:"all", label:"Tất cả" }, ...schoolYears.map(y => ({ value:y, label:y }))]} />

          <SelectDown label="Quận/Huyện" value={district} onChange={v => go(() => setDistrict(v))}
            options={[{ value:"all", label:"Tất cả" }, ...districts.map(d => ({ value:d, label:d }))]} />

          {/* Level chips */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {(["all",...LEVELS] as const).map(l => (
              <button key={l} onClick={() => go(() => setLevel(l))}
                className="px-2.5 py-0.5 rounded-full border text-xs font-medium transition-all whitespace-nowrap"
                style={level===l
                  ? { background:ACCENT, borderColor:ACCENT, color:"#fff" }
                  : { borderColor:"var(--border)", color:"var(--muted-foreground)" }}>
                {l==="all" ? "Tất cả" : LEVEL_LABEL[l]}
              </button>
            ))}
          </div>

          {criteriaFilter.size > 0 && (
            <>
              <div className="h-4 w-px bg-border hidden md:block" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-muted-foreground">Tiêu chí:</span>
                {criteriaData.filter(c => criteriaFilter.has(c.key)).map(c => {
                  const pct = total ? Math.round(c.fail / total * 100) : 0;
                  const col = pct >= 30 ? "#b91c1c" : pct >= 10 ? "#b45309" : "#15803d";
                  const bg  = pct >= 30 ? "#fee2e2" : pct >= 10 ? "#fef3c7" : "#dcfce7";
                  return (
                    <button key={c.key} onClick={() => toggleCriteria(c.key)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors"
                      style={{ color: col, background: bg, borderColor: col + "44" }}>
                      {c.label} <X className="w-3 h-3 ml-0.5" />
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {hasFilter && (
            <button onClick={() => { setDistrict("all"); setYear("2025-2026"); setLevel("all"); setSearch(""); setCriteriaFilter(new Set()); setPage(1); }}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" /> Đặt lại
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Table header info */}
        <div className="px-4 py-2.5 border-b border-border bg-secondary/30 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">{rows.length}</strong> trường
            {rows.length !== total && <span className="ml-1">· lọc từ {total}</span>}
          </p>
          <p className="text-xs text-muted-foreground">Trang {page}/{maxPage}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/40 text-left text-xs font-semibold text-muted-foreground">
              <tr>
                {([
                  { key: "name",        label: "Trường",      align: "left",   sortable: true  },
                  { key: "level",       label: "Cấp học",     align: "left",   sortable: true  },
                  { key: "district",    label: "Quận/Huyện",  align: "left",   sortable: true  },
                  { key: "score",       label: "Điểm TT38",   align: "center", sortable: true  },
                  { key: "csvc",        label: "CSVC",        align: "center", sortable: false },
                  { key: "giaoVien",    label: "GV đào tạo",  align: "center", sortable: false },
                  { key: "chuongTrinh", label: "Chương trình",align: "center", sortable: false },
                  { key: "status",      label: "Kết quả",     align: "center", sortable: true  },
                  { key: "lastUpdate",  label: "Cập nhật",    align: "right",  sortable: true  },
                ] as { key: keyof Row; label: string; align: string; sortable: boolean }[]).map(col => (
                  <th key={col.key}
                    onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                    className={`px-${col.align === "center" ? "3" : "4"} py-3 ${col.sortable ? "cursor-pointer select-none hover:text-foreground" : ""} transition-colors whitespace-nowrap text-${col.align}`}>
                    <span className="inline-flex items-center gap-1 justify-center">
                      {col.label}
                      {col.sortable && (sort.key === col.key
                        ? (sort.dir === "asc" ? <ChevronUp className="w-3 h-3 text-[#7c3aed]" /> : <ChevronDown className="w-3 h-3 text-[#7c3aed]" />)
                        : <ChevronsUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </span>
                  </th>
                ))}
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-14 text-center text-sm text-muted-foreground">
                    Không có kết quả phù hợp
                  </td>
                </tr>
              ) : pageRows.map(d => {
                const cfg = STATUS_CFG[d.status];
                const lvl = LEVEL_COLOR[d.level] ?? { color:"#374151", bg:"#f3f4f6" };
                const scoreColor = d.score >= 80 ? "#15803d" : d.score >= 60 ? "#b45309" : "#b91c1c";
                const { Icon } = cfg;
                return (
                  <tr key={`${d.id}-${d.schoolYear}`} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-sm">{d.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.stemPackage} · {d.schoolYear}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold"
                        style={{ color: lvl.color, background: lvl.bg }}>{d.level}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{d.district}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-base font-bold tabular-nums" style={{ color: scoreColor }}>{d.score}%</span>
                    </td>
                    <td className="px-3 py-3"><Tick ok={d.csvc} /></td>
                    <td className="px-3 py-3"><Tick ok={d.giaoVien} /></td>
                    <td className="px-3 py-3"><Tick ok={d.chuongTrinh} /></td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                        style={{ color:cfg.color, background:cfg.bg, borderColor:cfg.border }}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground whitespace-nowrap">{d.lastUpdate}</td>
                    <td className="px-3 py-3">
                      {d.tenantId ? (
                        <button
                          onClick={() => navigate(`/authority/schools/${d.tenantId}`)}
                          className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                          title="Xem chi tiết">
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

        {maxPage > 1 && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, rows.length)} / {rows.length} trường
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 bg-secondary rounded-lg text-xs font-medium">{page}/{maxPage}</span>
              <button onClick={() => setPage(p => Math.min(maxPage,p+1))} disabled={page===maxPage}
                className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
