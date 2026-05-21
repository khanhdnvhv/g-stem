import { useMemo, useState } from "react";
import {
  BarChart2, TrendingUp, Award, Download, Activity, MapPin, Building2,
  Filter, X, Search,
} from "lucide-react";
import { SelectDown, PageHeader, KpiCard } from "./authority-ui";
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Legend, ReferenceLine, Area, AreaChart,
} from "recharts";
import { provinceSnapshots } from "./authority-data";
import { useAuth } from "./authority-ui";
import { toast } from "sonner";

const ACCENT = "#7c3aed";

const SCHOOL_YEARS = ["2023-2024", "2024-2025", "2025-2026"] as const;
type SchoolYear = typeof SCHOOL_YEARS[number];
const TIER_LIST = ["Mầm non", "Tiểu học", "THCS", "THPT", "THPT Nghề"] as const;
const ALL_PROVINCES = [
  "Hà Nội", "TP.HCM", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
  "An Giang", "Bà Rịa-Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
  "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
  "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
  "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
  "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên",
  "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị",
  "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên",
  "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang",
  "Vĩnh Long", "Vĩnh Phúc", "Yên Bái",
];
const HN_DISTRICTS = [
  "Hoàn Kiếm", "Ba Đình", "Tây Hồ", "Đống Đa", "Cầu Giấy",
  "Thanh Xuân", "Hai Bà Trưng", "Long Biên", "Nam Từ Liêm",
  "Bắc Từ Liêm", "Hoàng Mai", "Hà Đông", "Thường Tín", "Mê Linh", "Sóc Sơn",
];
type CovStatus = "all" | "excellent" | "good" | "weak";
const COV_STATUS_LIST: { id: CovStatus; label: string; color: string; bg: string }[] = [
  { id: "excellent", label: "≥80% Xuất sắc",     color: "#16a34a", bg: "#f0fdf4" },
  { id: "good",      label: "50–79% Tốt",         color: "#2563eb", bg: "#eff6ff" },
  { id: "weak",      label: "<50% Cần cải thiện", color: "#dc2626", bg: "#fef2f2" },
];
function matchStatus(coverage: number, status: CovStatus) {
  if (status === "all")       return true;
  if (status === "excellent") return coverage >= 80;
  if (status === "good")      return coverage >= 50 && coverage < 80;
  return coverage < 50;
}

const YEAR_COV_FACTOR: Record<SchoolYear, number> = {
  "2023-2024": 0.88,
  "2024-2025": 0.94,
  "2025-2026": 1.00,
};

// Xu hướng 12 tháng — dùng cho cả Sở (hanoi) và Bộ (top 5)
const TREND_DATA = [
  { month: "T5/25",  hanoi: 62, hcm: 78, danang: 70, binhduong: 73, haiphong: 66, national: 67 },
  { month: "T6/25",  hanoi: 64, hcm: 79, danang: 71, binhduong: 74, haiphong: 67, national: 67 },
  { month: "T7/25",  hanoi: 65, hcm: 79, danang: 72, binhduong: 75, haiphong: 68, national: 68 },
  { month: "T8/25",  hanoi: 67, hcm: 80, danang: 73, binhduong: 76, haiphong: 69, national: 68 },
  { month: "T9/25",  hanoi: 68, hcm: 81, danang: 74, binhduong: 77, haiphong: 70, national: 69 },
  { month: "T10/25", hanoi: 69, hcm: 82, danang: 74, binhduong: 77, haiphong: 71, national: 69 },
  { month: "T11/25", hanoi: 70, hcm: 83, danang: 75, binhduong: 78, haiphong: 71, national: 70 },
  { month: "T12/25", hanoi: 70, hcm: 83, danang: 75, binhduong: 78, haiphong: 72, national: 70 },
  { month: "T1/26",  hanoi: 71, hcm: 84, danang: 76, binhduong: 79, haiphong: 72, national: 71 },
  { month: "T2/26",  hanoi: 71, hcm: 84, danang: 76, binhduong: 79, haiphong: 73, national: 71 },
  { month: "T3/26",  hanoi: 71, hcm: 84, danang: 76, binhduong: 79, haiphong: 73, national: 71 },
  { month: "T4/26",  hanoi: 71, hcm: 84, danang: 76, binhduong: 79, haiphong: 73, national: 71 },
];

// Ranking quận/huyện Hà Nội — chỉ dùng cho Sở
const DISTRICT_RANKING = [
  { district: "Hoàn Kiếm",    coverage: 96, score: 8.6, schools: 28 },
  { district: "Ba Đình",      coverage: 94, score: 8.5, schools: 35 },
  { district: "Tây Hồ",      coverage: 91, score: 8.3, schools: 31 },
  { district: "Đống Đa",     coverage: 89, score: 8.2, schools: 52 },
  { district: "Cầu Giấy",    coverage: 87, score: 8.1, schools: 44 },
  { district: "Thanh Xuân",  coverage: 85, score: 8.0, schools: 40 },
  { district: "Hai Bà Trưng", coverage: 82, score: 7.9, schools: 48 },
  { district: "Long Biên",   coverage: 79, score: 7.8, schools: 56 },
  { district: "Nam Từ Liêm",  coverage: 75, score: 7.6, schools: 49 },
  { district: "Bắc Từ Liêm",  coverage: 72, score: 7.5, schools: 51 },
  { district: "Hoàng Mai",   coverage: 68, score: 7.4, schools: 63 },
  { district: "Hà Đông",     coverage: 65, score: 7.3, schools: 72 },
  { district: "Thường Tín",  coverage: 51, score: 6.9, schools: 85 },
  { district: "Mê Linh",     coverage: 46, score: 6.6, schools: 78 },
  { district: "Sóc Sơn",     coverage: 40, score: 6.3, schools: 92 },
];

const TIER_METRICS = [
  { tier: "Mầm non",   coverage: 55, compliance: 48, score: 7.1, schools: 820  },
  { tier: "Tiểu học",  coverage: 68, compliance: 64, score: 7.5, schools: 1050 },
  { tier: "THCS",      coverage: 78, compliance: 74, score: 7.9, schools: 580  },
  { tier: "THPT",      coverage: 84, compliance: 80, score: 8.2, schools: 340  },
  { tier: "THPT Nghề", coverage: 71, compliance: 67, score: 7.7, schools: 60   },
];

// Cấp học toàn quốc — dùng cho Bộ
const NATIONAL_TIER_METRICS = [
  { tier: "Mầm non",   coverage: 48, compliance: 41, score: 6.9, schools: 15200 },
  { tier: "Tiểu học",  coverage: 62, compliance: 58, score: 7.3, schools: 18400 },
  { tier: "THCS",      coverage: 71, compliance: 66, score: 7.7, schools: 10800 },
  { tier: "THPT",      coverage: 78, compliance: 73, score: 8.0, schools: 5200  },
  { tier: "THPT Nghề", coverage: 65, compliance: 60, score: 7.5, schools: 1100  },
];

type SoTab = "district" | "tier" | "trend";
type BoTab = "province" | "trend" | "tier";

/* ================================================================ */
/*  ADVANCED ANALYTICS                                               */
/* ================================================================ */
export function AdvancedAnalytics() {
  const { user } = useAuth();

  // Sở: có province; Bộ: không có province
  const isSo = !!user?.province;
  const myProvince = user?.province ?? "";

  const [soTab, setSoTab] = useState<SoTab>("district");
  const [boTab, setBoTab] = useState<BoTab>("province");

  const [schoolYear,       setSchoolYear]       = useState<SchoolYear>("2025-2026");
  const [selectedTiers,    setSelectedTiers]    = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [search,           setSearch]           = useState("");
  const [selectedStatus,   setSelectedStatus]   = useState<CovStatus>("all");

  const toggleTier = (t: string) =>
    setSelectedTiers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const resetFilters = () => {
    setSchoolYear("2025-2026"); setSelectedTiers([]);
    setSelectedDistrict("all"); setSelectedProvince("all");
    setSearch(""); setSelectedStatus("all");
  };

  const handleExport = () => {
    const BOM = "﻿";
    let rows: string[][];
    let filename: string;

    if (isSo) {
      if (soTab === "district") {
        rows = [
          ["STT", "Quận/Huyện", "Bao phủ STEM (%)", "Điểm STEM TB", "Số trường"],
          ...DISTRICT_RANKING.map((d, i) => [String(i + 1), d.district, String(d.coverage), String(d.score), String(d.schools)]),
        ];
        filename = `Analytics_${myProvince.replace(/\s/g, "_")}_Quan_Huyen.csv`;
      } else if (soTab === "tier") {
        rows = [
          ["Cấp học", "Số trường", "Bao phủ STEM (%)", "Thiết bị đạt chuẩn (%)", "Điểm STEM TB"],
          ...TIER_METRICS.map((t) => [t.tier, String(t.schools), String(t.coverage), String(t.compliance), String(t.score)]),
        ];
        filename = `Analytics_${myProvince.replace(/\s/g, "_")}_Cap_hoc.csv`;
      } else {
        rows = [
          ["Tháng", myProvince, "TB toàn quốc"],
          ...TREND_DATA.map((d) => [d.month, String(d[dataKey as keyof typeof d] ?? ""), String(d.national)]),
        ];
        filename = `Analytics_${myProvince.replace(/\s/g, "_")}_Xu_huong.csv`;
      }
    } else {
      if (boTab === "province") {
        rows = [
          ["Hạng", "Tỉnh/Thành", "Bao phủ STEM (%)", "Thiết bị đạt chuẩn (%)", "Điểm STEM TB", "Số trường"],
          ...ranked.map((p, i) => [String(i + 1), p.province, String(p.stemCoveragePct), String(p.equipmentCompliancePct), String(p.avgStemScore), String(p.schools)]),
        ];
        filename = "Analytics_Toan_quoc_Bang_xep_hang.csv";
      } else if (boTab === "trend") {
        rows = [
          ["Tháng", "TP.HCM", "Bình Dương", "Đà Nẵng", "Hải Phòng", "Hà Nội", "TB quốc gia"],
          ...TREND_DATA.map((d) => [d.month, String(d.hcm), String(d.binhduong), String(d.danang), String(d.haiphong), String(d.hanoi), String(d.national)]),
        ];
        filename = "Analytics_Toan_quoc_Xu_huong.csv";
      } else {
        rows = [
          ["Cấp học", "Số trường", "Bao phủ STEM (%)", "Thiết bị đạt chuẩn (%)", "Điểm STEM TB"],
          ...NATIONAL_TIER_METRICS.map((t) => [t.tier, String(t.schools), String(t.coverage), String(t.compliance), String(t.score)]),
        ];
        filename = "Analytics_Toan_quoc_Cap_hoc.csv";
      }
    }

    const csv = BOM + rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${filename}`);
  };

  const ranked = useMemo(
    () => [...provinceSnapshots].sort((a, b) => b.stemCoveragePct - a.stemCoveragePct),
    []
  );
  const avgCoverage = Math.round(ranked.reduce((s, p) => s + p.stemCoveragePct, 0) / ranked.length);
  const mySnap = ranked.find((p) => p.province === myProvince) ?? ranked[0];
  const myRank = ranked.findIndex((p) => p.province === myProvince) + 1;

  // KPI cho Bộ
  const topProvince = ranked[0];
  const weakProvinces = ranked.filter((p) => p.stemCoveragePct < 60).length;
  const totalSchools = ranked.reduce((s, p) => s + p.schools, 0);

  // KPI cho Sở
  const topDistrict = DISTRICT_RANKING[0];
  const weakDistricts = DISTRICT_RANKING.filter((d) => d.coverage < 50).length;

  const dataKey = myProvince === "Hà Nội" ? "hanoi"
    : myProvince === "TP.HCM" ? "hcm"
    : myProvince === "Đà Nẵng" ? "danang"
    : myProvince === "Bình Dương" ? "binhduong"
    : myProvince === "Hải Phòng" ? "haiphong"
    : "hanoi";

  const yf = YEAR_COV_FACTOR[schoolYear];

  const filteredDistricts = useMemo(() => {
    const q = search.toLowerCase();
    return DISTRICT_RANKING
      .filter(d => selectedDistrict === "all" || d.district === selectedDistrict)
      .filter(d => !q || d.district.toLowerCase().includes(q))
      .map(d => ({
        ...d,
        coverage: Math.min(100, Math.round(d.coverage * yf)),
        score: Math.round(d.score * (0.95 + yf * 0.05) * 10) / 10,
      }))
      .filter(d => matchStatus(d.coverage, selectedStatus));
  }, [selectedDistrict, search, selectedStatus, yf]);

  const filteredTierMetrics = useMemo(() => {
    return TIER_METRICS
      .filter(t => selectedTiers.length === 0 || selectedTiers.includes(t.tier))
      .map(t => ({
        ...t,
        coverage: Math.min(100, Math.round(t.coverage * yf)),
        compliance: Math.min(100, Math.round(t.compliance * yf)),
        score: Math.round(t.score * (0.95 + yf * 0.05) * 10) / 10,
      }))
      .filter(t => matchStatus(Math.min(100, Math.round(t.coverage)), selectedStatus));
  }, [selectedTiers, selectedStatus, yf]);

  const filteredNationalTier = useMemo(() => {
    return NATIONAL_TIER_METRICS
      .filter(t => selectedTiers.length === 0 || selectedTiers.includes(t.tier))
      .map(t => ({
        ...t,
        coverage: Math.min(100, Math.round(t.coverage * yf)),
        compliance: Math.min(100, Math.round(t.compliance * yf)),
        score: Math.round(t.score * (0.95 + yf * 0.05) * 10) / 10,
      }))
      .filter(t => matchStatus(Math.min(100, Math.round(t.coverage)), selectedStatus));
  }, [selectedTiers, selectedStatus, yf]);

  const filteredProvinces = useMemo(() => {
    const q = search.toLowerCase();
    return ranked
      .filter(p => selectedProvince === "all" || p.province === selectedProvince)
      .filter(p => !q || p.province.toLowerCase().includes(q))
      .map(p => ({
        ...p,
        stemCoveragePct: Math.min(100, Math.round(p.stemCoveragePct * yf)),
        equipmentCompliancePct: Math.min(100, Math.round(p.equipmentCompliancePct * yf)),
        avgStemScore: Math.round(p.avgStemScore * (0.95 + yf * 0.05) * 10) / 10,
      }))
      .filter(p => matchStatus(p.stemCoveragePct, selectedStatus));
  }, [ranked, selectedProvince, search, selectedStatus, yf]);

  const hasActiveFilter = schoolYear !== "2025-2026" || selectedTiers.length > 0
    || selectedDistrict !== "all" || selectedProvince !== "all"
    || search !== "" || selectedStatus !== "all";

  return (
    <div className="space-y-5">
      <PageHeader
        icon={BarChart2}
        title={isSo ? `Analytics Nâng cao — ${myProvince}` : "Analytics Nâng cao — Toàn quốc"}
        subtitle={
          isSo
            ? "Phân tích quận/huyện · Cấp học · Xu hướng tỉnh · Vị trí toàn quốc"
            : "So sánh tỉnh/thành · Xu hướng STEM · Phân tích cấp học quốc gia"
        }
        accentColor={ACCENT}
        actions={
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white hover:opacity-90"
            style={{ background: ACCENT, fontSize: "13px", fontWeight: 500 }}
          >
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        }
      />

      {/* ── KPI Row ── */}
      {isSo ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon={Award}      label="Xếp hạng toàn quốc"    value={`#${myRank}/${ranked.length}`}           color={ACCENT}    subtitle="Bao phủ STEM" />
          <KpiCard icon={TrendingUp} label="Bao phủ STEM tỉnh"     value={`${mySnap.stemCoveragePct}%`}             color="#16a34a"   change={`+${mySnap.stemCoveragePct - avgCoverage}%`} trend="up" subtitle={`TB quốc gia ${avgCoverage}%`} />
          <KpiCard icon={MapPin}     label="Quận dẫn đầu"          value={topDistrict.district}                     color="#2563eb"   subtitle={`${topDistrict.coverage}% bao phủ`} />
          <KpiCard icon={Activity}   label="Quận cần can thiệp"    value={weakDistricts}                            color="#dc2626"   subtitle="Dưới 50% bao phủ" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon={TrendingUp} label="Bao phủ TB toàn quốc"  value={`${avgCoverage}%`}                        color={ACCENT}    subtitle={`${ranked.length} tỉnh/thành`} />
          <KpiCard icon={Award}      label="Tỉnh dẫn đầu"          value={topProvince.province}                     color="#16a34a"   subtitle={`${topProvince.stemCoveragePct}% bao phủ`} />
          <KpiCard icon={Activity}   label="Tỉnh cần can thiệp"    value={weakProvinces}                            color="#dc2626"   subtitle="Dưới 60% bao phủ" />
          <KpiCard icon={Building2}  label="Tổng số trường"        value={totalSchools.toLocaleString()}            color="#2563eb"   subtitle="Toàn quốc" />
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="bg-card border border-border rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "12px" }}>
          <Filter className="w-3.5 h-3.5" />
          <span style={{ fontWeight: 600 }}>Bộ lọc</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isSo ? "Tìm quận/huyện..." : "Tìm tỉnh/thành..."}
            className="pl-7 pr-3 py-1.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-violet-400 transition-colors"
            style={{ fontSize: "12px", width: "170px" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Năm học */}
        <SelectDown
          label="Năm học"
          value={schoolYear}
          onChange={(v) => setSchoolYear(v as SchoolYear)}
          options={SCHOOL_YEARS.map(y => ({ value: y, label: y }))}
        />

        {/* Tỉnh/TP — Bộ only */}
        {!isSo && (
          <SelectDown
            label="Tỉnh/TP"
            value={selectedProvince}
            onChange={setSelectedProvince}
            options={[{ value: "all", label: "Tất cả (63 tỉnh/TP)" }, ...ALL_PROVINCES.map(p => ({ value: p, label: p }))]}
          />
        )}

        {/* Quận/Huyện — Sở only */}
        {isSo && (
          <SelectDown
            label="Quận/Huyện"
            value={selectedDistrict}
            onChange={setSelectedDistrict}
            options={[{ value: "all", label: "Tất cả" }, ...HN_DISTRICTS.map(d => ({ value: d, label: d }))]}
          />
        )}

        <span className="text-border select-none">|</span>

        {/* Cấp học chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span style={{ fontSize: "11px" }} className="text-muted-foreground">Cấp học</span>
          {TIER_LIST.map(tier => (
            <button key={tier} onClick={() => toggleTier(tier)}
              className={`px-2 py-0.5 rounded-full border transition-all ${
                selectedTiers.includes(tier)
                  ? "bg-[#7c3aed] border-[#7c3aed] text-white shadow-sm"
                  : "border-border text-muted-foreground hover:border-[#7c3aed] hover:text-[#7c3aed]"
              }`}
              style={{ fontSize: "11px", fontWeight: 500 }}>
              {tier}
            </button>
          ))}
        </div>

        <span className="text-border select-none">|</span>

        {/* Mức bao phủ chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span style={{ fontSize: "11px" }} className="text-muted-foreground">Mức độ</span>
          {COV_STATUS_LIST.map(s => (
            <button key={s.id} onClick={() => setSelectedStatus(prev => prev === s.id ? "all" : s.id)}
              className="px-2 py-0.5 rounded-full border transition-all"
              style={
                selectedStatus === s.id
                  ? { background: s.color, borderColor: s.color, color: "#fff", fontSize: "11px", fontWeight: 500 }
                  : { borderColor: "var(--border)", color: "var(--muted-foreground)", fontSize: "11px", fontWeight: 500 }
              }>
              {s.label}
            </button>
          ))}
        </div>

        {hasActiveFilter && (
          <button onClick={resetFilters}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors ml-auto"
            style={{ fontSize: "12px" }}>
            <X className="w-3.5 h-3.5" /> Đặt lại
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      {isSo ? <SoTabs tab={soTab} setTab={setSoTab} /> : <BoTabs tab={boTab} setTab={setBoTab} />}

      {/* ── Content ── */}
      {isSo ? (
        <>
          {soTab === "district" && <DistrictTab myProvince={myProvince} districts={filteredDistricts} />}
          {soTab === "tier"     && <TierTab metrics={filteredTierMetrics} title={`Phân tích cấp học — ${myProvince}`} />}
          {soTab === "trend"    && <SoTrendTab myProvince={myProvince} avgCoverage={avgCoverage} mySnap={mySnap} />}
        </>
      ) : (
        <>
          {boTab === "province" && <ProvinceTab ranked={filteredProvinces} myProvince="" avgCoverage={avgCoverage} />}
          {boTab === "trend"    && <BoTrendTab avgCoverage={avgCoverage} />}
          {boTab === "tier"     && <TierTab metrics={filteredNationalTier} title="Phân tích cấp học — Toàn quốc" />}
        </>
      )}
    </div>
  );
}

/* ── Tab bars ── */
function SoTabs({ tab, setTab }: { tab: SoTab; setTab: (t: SoTab) => void }) {
  const tabs: { id: SoTab; label: string }[] = [
    { id: "district", label: "Ranking quận/huyện" },
    { id: "tier",     label: "Phân tích cấp học" },
    { id: "trend",    label: "Xu hướng tỉnh" },
  ];
  return <TabBar tabs={tabs} active={tab} onChange={setTab} />;
}

function BoTabs({ tab, setTab }: { tab: BoTab; setTab: (t: BoTab) => void }) {
  const tabs: { id: BoTab; label: string }[] = [
    { id: "province", label: "So sánh tỉnh/thành" },
    { id: "trend",    label: "Xu hướng 12 tháng" },
    { id: "tier",     label: "Phân tích cấp học" },
  ];
  return <TabBar tabs={tabs} active={tab} onChange={setTab} />;
}

function TabBar<T extends string>({ tabs, active, onChange }: { tabs: { id: T; label: string }[]; active: T; onChange: (t: T) => void }) {
  return (
    <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={
            active === t.id
              ? { background: "#fff", color: ACCENT, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
              : { color: "var(--muted-foreground)" }
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ================================================================ */
/*  TAB: Ranking quận/huyện (Sở only)                               */
/* ================================================================ */
function DistrictTab({ myProvince, districts }: { myProvince: string; districts: typeof DISTRICT_RANKING }) {
  const weakList = districts.filter((d) => d.coverage < 50);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-foreground font-semibold mb-3" style={{ fontSize: "14px" }}>
          Bao phủ STEM theo quận/huyện — {myProvince}
        </h3>
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={districts} layout="vertical" margin={{ left: 90, right: 50 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} style={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="district" width={90} style={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}%`, "Bao phủ STEM"]} />
            <ReferenceLine x={50} stroke="#dc2626" strokeDasharray="4 4"
              label={{ value: "Ngưỡng 50%", position: "top", fontSize: 10, fill: "#dc2626" }} />
            <Bar dataKey="coverage" radius={[0, 4, 4, 0]}
              fill={ACCENT}
              label={{ position: "right", formatter: (v: number) => `${v}%`, fontSize: 10, fill: "#64748b" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-foreground font-semibold mb-3" style={{ fontSize: "14px" }}>
          Điểm STEM TB theo quận/huyện
        </h3>
        <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 420 }}>
          {districts.map((d, i) => (
            <div key={d.district} className="flex items-center gap-3 py-2 border-b border-border/50">
              <span className="w-6 text-center text-xs font-bold text-muted-foreground">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{d.district}</span>
                  <span className="text-sm font-bold ml-2"
                    style={{ color: d.score >= 8 ? "#16a34a" : d.score >= 7.5 ? "#2563eb" : "#dc2626" }}>
                    {d.score.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all"
                      style={{ width: `${d.coverage}%`, background: d.coverage >= 80 ? "#16a34a" : d.coverage >= 50 ? ACCENT : "#dc2626" }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{d.coverage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {weakList.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground font-semibold" style={{ fontSize: "14px" }}>
              Quận/huyện cần can thiệp (bao phủ &lt; 50%)
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
              {weakList.length} quận/huyện
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {weakList.map((d) => (
              <div key={d.district} className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-red-600">{d.coverage}%</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{d.district}</p>
                  <p className="text-xs text-gray-500">{d.schools} trường · Điểm TB {d.score.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  TAB: Xu hướng tỉnh (Sở) — chỉ tỉnh mình + TB quốc gia          */
/* ================================================================ */
function SoTrendTab({ myProvince, avgCoverage, mySnap }: {
  myProvince: string;
  avgCoverage: number;
  mySnap: typeof provinceSnapshots[0];
}) {
  const dataKey = myProvince === "Hà Nội" ? "hanoi"
    : myProvince === "TP.HCM" ? "hcm"
    : myProvince === "Đà Nẵng" ? "danang"
    : myProvince === "Bình Dương" ? "binhduong"
    : myProvince === "Hải Phòng" ? "haiphong"
    : "hanoi";

  const start = TREND_DATA[0][dataKey as keyof typeof TREND_DATA[0]] as number;
  const end   = TREND_DATA[TREND_DATA.length - 1][dataKey as keyof typeof TREND_DATA[0]] as number;
  const growth = end - start;

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-foreground font-semibold mb-1" style={{ fontSize: "14px" }}>
          Xu hướng bao phủ STEM — {myProvince} (12 tháng)
        </h3>
        <p className="text-muted-foreground mb-4" style={{ fontSize: "12px" }}>
          Tiến độ triển khai STEM so với trung bình toàn quốc
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={TREND_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="soGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={ACCENT} stopOpacity={0.15} />
                <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" style={{ fontSize: 11 }} />
            <YAxis domain={[55, 90]} tickFormatter={(v) => `${v}%`} style={{ fontSize: 11 }} />
            <Tooltip formatter={(v, name) => [`${v}%`, name]} />
            <Legend />
            <ReferenceLine y={avgCoverage} stroke="#94a3b8" strokeDasharray="4 4"
              label={{ value: `TB QG ${avgCoverage}%`, position: "right", fontSize: 10, fill: "#94a3b8" }} />
            <Area type="monotone" dataKey={dataKey} name={myProvince}
              stroke={ACCENT} strokeWidth={2.5} fill="url(#soGrad)" dot={false} />
            <Line type="monotone" dataKey="national" name="TB toàn quốc"
              stroke="#94a3b8" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Tăng trưởng bao phủ (12 tháng)", value: `+${growth}%`,      sub: `${start}% → ${end}%`,          color: "#16a34a" },
          { label: "Tốc độ tăng TB / tháng",          value: `+${(growth / 12).toFixed(2)}%`, sub: "đều qua các tháng",  color: "#2563eb" },
          { label: "So với TB quốc gia",               value: `+${mySnap.stemCoveragePct - avgCoverage}%`, sub: `${myProvince} ${mySnap.stemCoveragePct}% vs QG ${avgCoverage}%`, color: ACCENT },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted-foreground mb-2" style={{ fontSize: "12px" }}>{stat.label}</p>
            <p className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TAB: Xu hướng 12 tháng (Bộ) — top 5 tỉnh                       */
/* ================================================================ */
function BoTrendTab({ avgCoverage }: { avgCoverage: number }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-foreground font-semibold mb-1" style={{ fontSize: "14px" }}>
          Xu hướng bao phủ STEM — Top 5 tỉnh/thành (12 tháng)
        </h3>
        <p className="text-muted-foreground mb-4" style={{ fontSize: "12px" }}>
          Theo dõi tiến độ triển khai STEM của các tỉnh dẫn đầu
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={TREND_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" style={{ fontSize: 11 }} />
            <YAxis domain={[55, 90]} tickFormatter={(v) => `${v}%`} style={{ fontSize: 11 }} />
            <Tooltip formatter={(v, name) => [`${v}%`, name]} />
            <Legend />
            <ReferenceLine y={avgCoverage} stroke="#94a3b8" strokeDasharray="4 4"
              label={{ value: `TB ${avgCoverage}%`, position: "right", fontSize: 10, fill: "#94a3b8" }} />
            <Line type="monotone" dataKey="hcm"       name="TP.HCM"     stroke="#16a34a" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="binhduong" name="Bình Dương" stroke="#c8a84e" strokeWidth={2}   dot={false} strokeDasharray="5 3" />
            <Line type="monotone" dataKey="danang"    name="Đà Nẵng"    stroke="#2563eb" strokeWidth={2}   dot={false} strokeDasharray="5 3" />
            <Line type="monotone" dataKey="haiphong"  name="Hải Phòng"  stroke="#0891b2" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
            <Line type="monotone" dataKey="hanoi"     name="Hà Nội"     stroke={ACCENT}  strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Tỉnh tăng trưởng nhanh nhất", value: "Bình Dương", sub: "+6% trong 12 tháng", color: "#16a34a" },
          { label: "TB tăng trưởng toàn quốc",    value: "+4%",        sub: "so với cùng kỳ năm ngoái", color: "#2563eb" },
          { label: "Dự báo cuối năm 2026",         value: "~75%",       sub: "nếu giữ đà hiện tại", color: ACCENT },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-muted-foreground mb-2" style={{ fontSize: "12px" }}>{stat.label}</p>
            <p className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TAB: So sánh / Vị trí toàn quốc (dùng cho cả Sở và Bộ)         */
/* ================================================================ */
function ProvinceTab({ ranked, myProvince, avgCoverage }: {
  ranked: typeof provinceSnapshots;
  myProvince: string;
  avgCoverage: number;
}) {
  const isSo = !!myProvince;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-foreground font-semibold mb-3" style={{ fontSize: "14px" }}>
          Bao phủ STEM — Top 10 tỉnh/thành
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={ranked} layout="vertical" margin={{ left: 80, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} style={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="province" width={80} style={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}%`, "Bao phủ STEM"]} />
            <ReferenceLine x={avgCoverage} stroke="#dc2626" strokeDasharray="4 4"
              label={{ value: `TB ${avgCoverage}%`, position: "top", fontSize: 10, fill: "#dc2626" }} />
            <Bar dataKey="stemCoveragePct" radius={[0, 4, 4, 0]}
              fill={ACCENT}
              label={{ position: "right", formatter: (v: number) => `${v}%`, fontSize: 10, fill: "#64748b" }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-foreground font-semibold mb-1" style={{ fontSize: "14px" }}>
          Thiết bị đạt chuẩn vs Điểm STEM TB
        </h3>
        <p className="text-muted-foreground mb-3" style={{ fontSize: "12px" }}>
          Tương quan giữa tỷ lệ thiết bị chuẩn và chất lượng học STEM
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="equipmentCompliancePct" name="Thiết bị đạt chuẩn" unit="%" style={{ fontSize: 11 }}
              label={{ value: "Thiết bị đạt chuẩn (%)", position: "insideBottom", offset: -10, fontSize: 11 }} />
            <YAxis dataKey="avgStemScore" name="Điểm STEM TB" domain={[6.5, 8.5]} style={{ fontSize: 11 }}
              label={{ value: "Điểm TB", angle: -90, position: "insideLeft", fontSize: 11 }} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }}
              content={({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0].payload as typeof provinceSnapshots[0];
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-2 shadow text-xs">
                    <p className="font-semibold">{d.province}</p>
                    <p>Thiết bị: {d.equipmentCompliancePct}%</p>
                    <p>Điểm STEM: {d.avgStemScore}</p>
                  </div>
                );
              }}
            />
            <Scatter data={ranked} fill={ACCENT} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 lg:col-span-2">
        <h3 className="text-foreground font-semibold mb-3" style={{ fontSize: "14px" }}>
          {isSo ? "Bảng xếp hạng toàn quốc — vị trí của tỉnh bạn" : "Bảng xếp hạng toàn quốc"}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Hạng", "Tỉnh/Thành", "Bao phủ STEM", "Thiết bị đạt chuẩn", "Điểm TB", "Số trường"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-4 text-muted-foreground text-xs font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ fontSize: "13px" }}>
              {ranked.map((p, i) => (
                <tr key={p.province}
                  className="border-b border-border/50 hover:bg-muted/40 transition-colors"
                  style={p.province === myProvince ? { background: "#7c3aed0d" } : undefined}
                >
                  <td className="py-2.5 px-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                      style={{
                        background: i === 0 ? "#fef3c7" : i === 1 ? "#f1f5f9" : i === 2 ? "#fef3c7" : "transparent",
                        color: i === 0 ? "#d97706" : i === 1 ? "#64748b" : i === 2 ? "#c8a84e" : "#374151",
                      }}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-medium" style={{ color: p.province === myProvince ? ACCENT : undefined }}>
                    {p.province}
                    {p.province === myProvince && (
                      <span className="ml-1 text-xs font-normal" style={{ color: ACCENT }}>(Tỉnh bạn)</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${p.stemCoveragePct}%`, background: ACCENT }} />
                      </div>
                      <span className="w-10 text-right font-medium">{p.stemCoveragePct}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right">{p.equipmentCompliancePct}%</td>
                  <td className="py-2.5 px-4 text-right font-semibold"
                    style={{ color: p.avgStemScore >= 8 ? "#16a34a" : p.avgStemScore >= 7.5 ? "#2563eb" : "#dc2626" }}>
                    {p.avgStemScore.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-muted-foreground">{p.schools.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TAB: Phân tích cấp học (dùng cho cả Sở và Bộ, khác data)        */
/* ================================================================ */
function TierTab({ metrics, title }: { metrics: typeof TIER_METRICS; title: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-foreground font-semibold mb-3" style={{ fontSize: "14px" }}>
          Bao phủ STEM & Thiết bị theo cấp học
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={metrics} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tier" style={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} style={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => [`${v}%`]} />
            <Legend />
            <Bar dataKey="coverage"   name="Bao phủ STEM (%)"       fill={ACCENT}   radius={[4, 4, 0, 0]} />
            <Bar dataKey="compliance" name="Thiết bị đạt chuẩn (%)" fill="#16a34a"  radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-foreground font-semibold mb-3" style={{ fontSize: "14px" }}>
          Điểm STEM TB theo cấp học
        </h3>
        <div className="space-y-4">
          {metrics.map((t) => (
            <div key={t.tier}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{t.tier}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{t.schools.toLocaleString()} trường</span>
                  <span className="text-sm font-bold"
                    style={{ color: t.score >= 8 ? "#16a34a" : t.score >= 7.5 ? "#2563eb" : "#c8a84e" }}>
                    {t.score.toFixed(1)} / 10
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all"
                  style={{ width: `${t.score * 10}%`, background: t.score >= 8 ? "#16a34a" : t.score >= 7.5 ? ACCENT : "#c8a84e" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 lg:col-span-2">
        <h3 className="text-foreground font-semibold mb-3" style={{ fontSize: "14px" }}>
          Tóm tắt theo cấp học — {title.split("—")[1]?.trim()}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Cấp học", "Số trường", "Bao phủ STEM", "Thiết bị đạt chuẩn", "Điểm STEM TB", "Đánh giá"].map((h) => (
                  <th key={h} className="text-left py-2.5 px-4 text-muted-foreground text-xs font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ fontSize: "13px" }}>
              {metrics.map((t) => {
                const status = t.coverage >= 80
                  ? { label: "Tốt",         color: "#16a34a", bg: "#f0fdf4" }
                  : t.coverage >= 60
                  ? { label: "Trung bình",  color: ACCENT,    bg: "#f5f3ff" }
                  : { label: "Cần cải thiện", color: "#dc2626", bg: "#fef2f2" };
                return (
                  <tr key={t.tier} className="border-b border-border/50 hover:bg-muted/40">
                    <td className="py-2.5 px-4 font-medium">{t.tier}</td>
                    <td className="py-2.5 px-4">{t.schools.toLocaleString()}</td>
                    <td className="py-2.5 px-4">{t.coverage}%</td>
                    <td className="py-2.5 px-4">{t.compliance}%</td>
                    <td className="py-2.5 px-4 font-semibold">{t.score.toFixed(1)}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ color: status.color, background: status.bg }}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
