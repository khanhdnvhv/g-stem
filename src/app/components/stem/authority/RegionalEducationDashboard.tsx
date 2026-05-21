import { useState, useMemo, useRef, useEffect } from "react";
import {
  Landmark, School as SchoolIcon, Users, GraduationCap,
  TrendingUp, TrendingDown, ClipboardCheck, Download, AlertTriangle,
  Filter, CheckCircle2, X, ChevronDown, Search,
} from "lucide-react";
import { SelectDown, formatNumberCompact, formatRelative, PageHeader } from "./authority-ui";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart,
  PieChart, Pie, Cell, ScatterChart, Scatter, ReferenceLine,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { provinceSnapshots } from "./authority-data";
import { useRecentReports } from "./useRecentReports";
import { useAuth } from "./authority-ui";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";
import { VietnamChoropleth } from "./VietnamChoropleth";

/* ------------------------------------------------------------------ */
/*  SEARCHABLE SELECT                                                   */
/* ------------------------------------------------------------------ */
interface SearchableSelectProps {
  label: string;
  value: string;
  allLabel: string;
  options: string[];
  onChange: (v: string) => void;
}

function SearchableSelect({ label, value, allLabel, options, onChange }: SearchableSelectProps) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const ref                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(
    () => options.filter(o => o.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  );

  const displayValue = value === "all" ? allLabel : value;

  return (
    <div className="flex items-center gap-1.5" ref={ref}>
      <span style={{ fontSize: "12px" }} className="text-muted-foreground whitespace-nowrap">{label}</span>
      <div className="relative">
        <button
          onClick={() => { setOpen(o => !o); setQuery(""); }}
          className={`flex items-center gap-1 border rounded-lg px-2 py-1 bg-background transition-colors ${
            value !== "all"
              ? "border-[#7c3aed] text-[#7c3aed]"
              : "border-border text-foreground hover:border-[#7c3aed]"
          }`}
          style={{ fontSize: "12px", minWidth: "120px" }}>
          <span className="flex-1 truncate text-left" style={{ maxWidth: "150px" }}>{displayValue}</span>
          <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-lg"
            style={{ minWidth: "200px", maxWidth: "260px" }}>
            {/* Search input */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-xs bg-secondary/50 rounded-lg focus:outline-none"
                />
              </div>
            </div>
            {/* Options list */}
            <div className="overflow-y-auto" style={{ maxHeight: "220px" }}>
              <button
                onClick={() => { onChange("all"); setOpen(false); setQuery(""); }}
                className={`w-full text-left px-3 py-1.5 hover:bg-secondary/70 transition-colors ${
                  value === "all" ? "text-[#7c3aed] font-medium" : "text-muted-foreground"
                }`}
                style={{ fontSize: "12px" }}>
                {allLabel}
              </button>
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-muted-foreground text-center" style={{ fontSize: "11px" }}>
                  Không tìm thấy
                </p>
              ) : (
                filtered.map(opt => (
                  <button key={opt}
                    onClick={() => { onChange(opt); setOpen(false); setQuery(""); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-secondary/70 transition-colors ${
                      value === opt ? "text-[#7c3aed] font-medium bg-[#7c3aed]/5" : "text-foreground"
                    }`}
                    style={{ fontSize: "12px" }}>
                    {opt}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  STAT CARD                                                           */
/* ------------------------------------------------------------------ */
interface StatCardProps {
  icon: LucideIcon; label: string; value: string | number;
  change?: string; trend?: "up" | "down";
  color?: string; subtitle?: string; spark?: Array<{ v: number }>;
}

function StatCard({ icon: Icon, label, value, change, trend, color = "#7c3aed", subtitle, spark }: StatCardProps) {
  const bg = color + "15";
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex flex-col">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {change && (
          <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${
            trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
          }`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </span>
        )}
      </div>
      <p className="text-foreground mt-3" style={{ fontSize: "22px", fontWeight: 700, lineHeight: 1.2 }}>{value}</p>
      <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>{label}</p>
      {subtitle && <p className="text-muted-foreground/60 mt-0.5" style={{ fontSize: "10px" }}>{subtitle}</p>}
      {spark && (
        <div className="h-9 mt-2 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark}>
              <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                           */
/* ------------------------------------------------------------------ */
const SCHOOL_YEARS = ["2023-2024", "2024-2025", "2025-2026"] as const;
type SchoolYear = (typeof SCHOOL_YEARS)[number];
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
  "Hoàn Kiếm", "Ba Đình", "Đống Đa", "Hai Bà Trưng", "Hoàng Mai",
  "Long Biên", "Cầu Giấy", "Thanh Xuân", "Tây Hồ", "Nam Từ Liêm",
  "Bắc Từ Liêm", "Hà Đông", "Sơn Tây", "Ba Vì", "Chương Mỹ",
  "Đan Phượng", "Đông Anh", "Gia Lâm", "Hoài Đức", "Mê Linh",
  "Mỹ Đức", "Phú Xuyên", "Phúc Thọ", "Quốc Oai", "Sóc Sơn",
  "Thạch Thất", "Thanh Oai", "Thanh Trì", "Thường Tín", "Ứng Hòa",
];

/* ------------------------------------------------------------------ */
/*  DISTRICT DATA — mock cho cấp Sở                                    */
/* ------------------------------------------------------------------ */
interface DistrictStat {
  name: string;
  schools: number;
  stemCoverage: number;    // %
  tt38Compliance: number;  // %
  avgScore: number;
  type: "noi_thanh" | "ngoai_thanh";
}

const HN_DISTRICT_STATS: DistrictStat[] = [
  { name: "Hoàn Kiếm",   schools: 28,  stemCoverage: 94, tt38Compliance: 89, avgScore: 8.4, type: "noi_thanh" },
  { name: "Ba Đình",     schools: 35,  stemCoverage: 91, tt38Compliance: 86, avgScore: 8.2, type: "noi_thanh" },
  { name: "Cầu Giấy",   schools: 52,  stemCoverage: 88, tt38Compliance: 82, avgScore: 8.1, type: "noi_thanh" },
  { name: "Đống Đa",    schools: 61,  stemCoverage: 86, tt38Compliance: 80, avgScore: 7.9, type: "noi_thanh" },
  { name: "Tây Hồ",     schools: 31,  stemCoverage: 84, tt38Compliance: 78, avgScore: 7.8, type: "noi_thanh" },
  { name: "Thanh Xuân", schools: 47,  stemCoverage: 82, tt38Compliance: 76, avgScore: 7.7, type: "noi_thanh" },
  { name: "Hai Bà Trưng",schools: 55, stemCoverage: 80, tt38Compliance: 75, avgScore: 7.7, type: "noi_thanh" },
  { name: "Nam Từ Liêm",schools: 44,  stemCoverage: 78, tt38Compliance: 73, avgScore: 7.6, type: "noi_thanh" },
  { name: "Hoàng Mai",  schools: 68,  stemCoverage: 75, tt38Compliance: 70, avgScore: 7.5, type: "noi_thanh" },
  { name: "Long Biên",  schools: 59,  stemCoverage: 73, tt38Compliance: 68, avgScore: 7.4, type: "noi_thanh" },
  { name: "Bắc Từ Liêm",schools: 48, stemCoverage: 71, tt38Compliance: 66, avgScore: 7.3, type: "noi_thanh" },
  { name: "Hà Đông",    schools: 74,  stemCoverage: 70, tt38Compliance: 65, avgScore: 7.3, type: "noi_thanh" },
  { name: "Đông Anh",   schools: 82,  stemCoverage: 65, tt38Compliance: 60, avgScore: 7.1, type: "ngoai_thanh" },
  { name: "Gia Lâm",    schools: 71,  stemCoverage: 62, tt38Compliance: 57, avgScore: 7.0, type: "ngoai_thanh" },
  { name: "Thanh Trì",  schools: 53,  stemCoverage: 60, tt38Compliance: 55, avgScore: 6.9, type: "ngoai_thanh" },
  { name: "Hoài Đức",   schools: 64,  stemCoverage: 57, tt38Compliance: 52, avgScore: 6.8, type: "ngoai_thanh" },
  { name: "Mê Linh",    schools: 58,  stemCoverage: 54, tt38Compliance: 50, avgScore: 6.7, type: "ngoai_thanh" },
  { name: "Đan Phượng", schools: 41,  stemCoverage: 52, tt38Compliance: 48, avgScore: 6.7, type: "ngoai_thanh" },
  { name: "Sơn Tây",    schools: 46,  stemCoverage: 50, tt38Compliance: 46, avgScore: 6.6, type: "ngoai_thanh" },
  { name: "Thạch Thất", schools: 55,  stemCoverage: 48, tt38Compliance: 44, avgScore: 6.5, type: "ngoai_thanh" },
  { name: "Chương Mỹ",  schools: 76,  stemCoverage: 46, tt38Compliance: 42, avgScore: 6.5, type: "ngoai_thanh" },
  { name: "Thanh Oai",  schools: 48,  stemCoverage: 44, tt38Compliance: 40, avgScore: 6.4, type: "ngoai_thanh" },
  { name: "Thường Tín", schools: 52,  stemCoverage: 42, tt38Compliance: 38, avgScore: 6.3, type: "ngoai_thanh" },
  { name: "Quốc Oai",   schools: 44,  stemCoverage: 40, tt38Compliance: 37, avgScore: 6.3, type: "ngoai_thanh" },
  { name: "Phúc Thọ",   schools: 39,  stemCoverage: 38, tt38Compliance: 35, avgScore: 6.2, type: "ngoai_thanh" },
  { name: "Sóc Sơn",    schools: 66,  stemCoverage: 36, tt38Compliance: 33, avgScore: 6.2, type: "ngoai_thanh" },
  { name: "Ba Vì",      schools: 91,  stemCoverage: 33, tt38Compliance: 30, avgScore: 6.1, type: "ngoai_thanh" },
  { name: "Mỹ Đức",     schools: 57,  stemCoverage: 31, tt38Compliance: 28, avgScore: 6.0, type: "ngoai_thanh" },
  { name: "Phú Xuyên",  schools: 61,  stemCoverage: 29, tt38Compliance: 26, avgScore: 5.9, type: "ngoai_thanh" },
  { name: "Ứng Hòa",    schools: 54,  stemCoverage: 27, tt38Compliance: 24, avgScore: 5.9, type: "ngoai_thanh" },
];


function districtColor(pct: number) {
  if (pct >= 75) return "#16a34a";
  if (pct >= 60) return "#65a30d";
  if (pct >= 45) return "#ca8a04";
  if (pct >= 30) return "#d97706";
  return "#dc2626";
}

/* ------------------------------------------------------------------ */
/*  SCHOOL-LEVEL MOCK DATA — theo quận/huyện                           */
/* ------------------------------------------------------------------ */
interface SchoolStat {
  name: string;
  tier: "MN" | "TH" | "THCS" | "THPT";
  stemCoverage: number;
  tt38Compliance: number;
  avgScore: number;
}

const SCHOOLS_BY_DISTRICT_STATS: Record<string, SchoolStat[]> = {
  "Hoàn Kiếm": [
    { name: "THPT Trần Phú",         tier: "THPT", stemCoverage: 98, tt38Compliance: 95, avgScore: 8.8 },
    { name: "THCS Nguyễn Du",        tier: "THCS", stemCoverage: 96, tt38Compliance: 92, avgScore: 8.6 },
    { name: "TH Hoàn Kiếm",          tier: "TH",   stemCoverage: 94, tt38Compliance: 90, avgScore: 8.4 },
    { name: "THCS Trưng Vương",      tier: "THCS", stemCoverage: 92, tt38Compliance: 88, avgScore: 8.3 },
    { name: "TH Đinh Tiên Hoàng",    tier: "TH",   stemCoverage: 91, tt38Compliance: 86, avgScore: 8.2 },
    { name: "MN Bông Sen",           tier: "MN",   stemCoverage: 89, tt38Compliance: 84, avgScore: 8.0 },
  ],
  "Ba Đình": [
    { name: "THPT Phan Đình Phùng",  tier: "THPT", stemCoverage: 95, tt38Compliance: 91, avgScore: 8.6 },
    { name: "THCS Giảng Võ",         tier: "THCS", stemCoverage: 93, tt38Compliance: 88, avgScore: 8.4 },
    { name: "TH Ngọc Hà",            tier: "TH",   stemCoverage: 91, tt38Compliance: 85, avgScore: 8.2 },
    { name: "THCS Thăng Long",       tier: "THCS", stemCoverage: 88, tt38Compliance: 82, avgScore: 8.0 },
    { name: "TH Kim Mã",             tier: "TH",   stemCoverage: 86, tt38Compliance: 80, avgScore: 7.9 },
    { name: "MN Ba Đình",            tier: "MN",   stemCoverage: 84, tt38Compliance: 78, avgScore: 7.8 },
  ],
  "Ba Vì": [
    { name: "THPT Ba Vì",            tier: "THPT", stemCoverage: 42, tt38Compliance: 38, avgScore: 6.4 },
    { name: "THCS Tản Đà",           tier: "THCS", stemCoverage: 38, tt38Compliance: 34, avgScore: 6.2 },
    { name: "THCS Phú Châu",         tier: "THCS", stemCoverage: 34, tt38Compliance: 30, avgScore: 6.1 },
    { name: "TH Ba Vì",              tier: "TH",   stemCoverage: 30, tt38Compliance: 27, avgScore: 6.0 },
    { name: "TH Tây Đằng",           tier: "TH",   stemCoverage: 27, tt38Compliance: 24, avgScore: 5.9 },
    { name: "MN Hoa Ban",            tier: "MN",   stemCoverage: 23, tt38Compliance: 20, avgScore: 5.8 },
  ],
  "Đông Anh": [
    { name: "THPT Đông Anh",         tier: "THPT", stemCoverage: 72, tt38Compliance: 68, avgScore: 7.4 },
    { name: "THCS Uy Nỗ",            tier: "THCS", stemCoverage: 68, tt38Compliance: 63, avgScore: 7.2 },
    { name: "THCS Đông Anh",         tier: "THCS", stemCoverage: 65, tt38Compliance: 60, avgScore: 7.1 },
    { name: "TH Tiên Dương",         tier: "TH",   stemCoverage: 62, tt38Compliance: 57, avgScore: 7.0 },
    { name: "TH Đông Anh",           tier: "TH",   stemCoverage: 58, tt38Compliance: 53, avgScore: 6.8 },
    { name: "MN Nguyên Khê",         tier: "MN",   stemCoverage: 54, tt38Compliance: 49, avgScore: 6.7 },
  ],
};

function generateSchoolsForDistrict(districtName: string): SchoolStat[] {
  const dist = HN_DISTRICT_STATS.find(d => d.name === districtName);
  const base  = dist ? dist.stemCoverage : 60;
  const tiers: Array<{ name: string; tier: SchoolStat["tier"] }> = [
    { name: `THPT ${districtName}`,    tier: "THPT" },
    { name: `THCS ${districtName} 1`,  tier: "THCS" },
    { name: `THCS ${districtName} 2`,  tier: "THCS" },
    { name: `TH ${districtName} 1`,    tier: "TH"   },
    { name: `TH ${districtName} 2`,    tier: "TH"   },
    { name: `MN ${districtName}`,      tier: "MN"   },
  ];
  return tiers.map((t, i) => ({
    ...t,
    stemCoverage:   Math.max(5,  Math.min(99, base + 8 - i * 3 + (i % 2 === 0 ? 2 : -1))),
    tt38Compliance: Math.max(5,  Math.min(99, base + 4 - i * 3 + (i % 2 === 0 ? 1 : -2))),
    avgScore:       Math.max(5,  Math.min(10, +(dist ? dist.avgScore + 0.3 - i * 0.1 : 7.0).toFixed(1))),
  }));
}

function getSchoolStats(districtName: string): SchoolStat[] {
  return SCHOOLS_BY_DISTRICT_STATS[districtName] ?? generateSchoolsForDistrict(districtName);
}

const TIER_COLORS: Record<SchoolStat["tier"], string> = {
  THPT: "#7c3aed", THCS: "#2563eb", TH: "#0891b2", MN: "#16a34a",
};

// Maps SchoolStat tier code → ALL_SCHOOL_TIERS name
const TIER_NAME_MAP: Record<string, string> = {
  THPT: "THPT", THCS: "THCS", TH: "Tiểu học", MN: "Mầm non",
};

/* ------------------------------------------------------------------ */
/*  DISTRICT COVERAGE PANEL — thay thế heatmap cho cấp Sở             */
/* ------------------------------------------------------------------ */
type PanelMetric = "stemCoverage" | "tt38Compliance" | "avgScore";

interface DistrictPanelProps {
  province: string;
  selectedDistrict: string;
  onClearDistrict: () => void;
  selectedSchool?: string;
  onClearSchool?: () => void;
}

function DistrictCoveragePanel({ province, selectedDistrict, onClearDistrict, selectedSchool, onClearSchool }: DistrictPanelProps) {
  const [metric, setMetric] = useState<PanelMetric>("stemCoverage");
  const [showAll, setShowAll] = useState(false);

  const isSchoolView  = selectedDistrict !== "all";
  const isSingleSchool = isSchoolView && !!selectedSchool && selectedSchool !== "all";

  /* ── District view data ── */
  const districtSorted  = [...HN_DISTRICT_STATS].sort((a, b) => b[metric] - a[metric]);
  const districtDisplay = showAll ? districtSorted : districtSorted.slice(0, 15);
  const above70  = HN_DISTRICT_STATS.filter(d => d.stemCoverage >= 70).length;
  const below40  = HN_DISTRICT_STATS.filter(d => d.stemCoverage < 40).length;
  const avgCov   = Math.round(HN_DISTRICT_STATS.reduce((s, d) => s + d.stemCoverage, 0) / HN_DISTRICT_STATS.length);

  /* ── School view data ── */
  const schoolStats  = isSchoolView ? getSchoolStats(selectedDistrict) : [];
  const schoolSorted = [...schoolStats].sort((a, b) => b[metric] - a[metric]);
  const schoolAbove70 = schoolStats.filter(s => s.stemCoverage >= 70).length;
  const schoolAvgCov  = schoolStats.length
    ? Math.round(schoolStats.reduce((s, d) => s + d.stemCoverage, 0) / schoolStats.length) : 0;

  const MetricToggle = () => (
    <div className="flex items-center gap-1 bg-secondary/60 rounded-lg p-0.5">
      {(["stemCoverage", "tt38Compliance", "avgScore"] as const).map(m => (
        <button key={m} onClick={() => setMetric(m)}
          className={`px-2.5 py-1 rounded-md transition-all ${
            metric === m ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          style={{ fontSize: "11px", fontWeight: 500 }}>
          {m === "stemCoverage" ? "Bao phủ" : m === "tt38Compliance" ? "TT38" : "Điểm TB"}
        </button>
      ))}
    </div>
  );

  const BarRow = ({
    rank, name, badge, val, color, rightLabel,
  }: {
    rank: number; name: string; badge?: React.ReactNode;
    val: number; color: string; rightLabel: string;
  }) => {
    const pct = metric === "avgScore" ? (val / 10) * 100 : val;
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-right flex-shrink-0"
          style={{ fontSize: "10px", width: 16 }}>{rank}</span>
        <div className="flex items-center gap-1 flex-shrink-0" style={{ width: 146 }}>
          <span style={{ fontSize: "11.5px", fontWeight: 500 }} className="truncate">{name}</span>
          {badge}
        </div>
        <div className="flex-1 h-5 bg-secondary rounded-md overflow-hidden">
          <div className="h-full rounded-md flex items-center px-1.5 transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color + "cc" }}>
            {pct > 18 && (
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff" }}>
                {metric === "avgScore" ? val.toFixed(1) : `${val}%`}
              </span>
            )}
          </div>
        </div>
        {pct <= 18 && (
          <span style={{ fontSize: "10.5px", fontWeight: 700, color, minWidth: 32, flexShrink: 0 }}>
            {metric === "avgScore" ? val.toFixed(1) : `${val}%`}
          </span>
        )}
        <span className="text-muted-foreground flex-shrink-0" style={{ fontSize: "10px", minWidth: 52, textAlign: "right" }}>
          {rightLabel}
        </span>
      </div>
    );
  };

  const Legend = () => (
    <div className="mt-3 flex items-center gap-3 flex-wrap pt-3 border-t border-border">
      {[
        { label: "≥ 75% Xuất sắc",       color: "#16a34a" },
        { label: "60–74% Tốt",            color: "#65a30d" },
        { label: "45–59% Trung bình",     color: "#ca8a04" },
        { label: "< 45% Cần can thiệp",   color: "#dc2626" },
      ].map(leg => (
        <span key={leg.label} className="flex items-center gap-1"
          style={{ fontSize: "10.5px", color: "var(--muted-foreground)" }}>
          <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: leg.color }} />
          {leg.label}
        </span>
      ))}
    </div>
  );

  /* ══════════════════════════ SCHOOL VIEW ══════════════════════════ */
  if (isSchoolView) {
    const visibleSchools = isSingleSchool
      ? schoolSorted.filter(s => s.name === selectedSchool)
      : schoolSorted;

    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
          <div>
            {/* Breadcrumb back */}
            {isSingleSchool ? (
              <button onClick={onClearSchool}
                className="flex items-center gap-1 text-[#7c3aed] hover:opacity-75 transition-opacity mb-1.5"
                style={{ fontSize: "11px", fontWeight: 500 }}>
                <span>←</span>
                <span>Quay lại danh sách trường — {selectedDistrict}</span>
              </button>
            ) : (
              <button onClick={onClearDistrict}
                className="flex items-center gap-1 text-[#7c3aed] hover:opacity-75 transition-opacity mb-1.5"
                style={{ fontSize: "11px", fontWeight: 500 }}>
                <span>←</span>
                <span>Quay lại danh sách Quận/Huyện</span>
              </button>
            )}
            <h3 style={{ fontSize: "14px", fontWeight: 600 }}>
              {isSingleSchool
                ? `Chi tiết Trường — ${selectedSchool}`
                : `Hiệu suất STEM theo Trường — ${selectedDistrict}`}
            </h3>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
              {isSingleSchool ? (
                <>
                  {selectedDistrict} · TB quận: <strong className="text-foreground">{schoolAvgCov}%</strong>
                </>
              ) : (
                <>
                  {schoolStats.length} trường · TB quận: <strong className="text-foreground">{schoolAvgCov}%</strong>
                  · Đạt ≥70%: <strong className="text-green-600">{schoolAbove70}</strong>
                  · Chưa đạt: <strong className="text-red-500">{schoolStats.length - schoolAbove70}</strong>
                </>
              )}
            </p>
          </div>
          <MetricToggle />
        </div>

        <div className="space-y-1.5">
          {visibleSchools.map((s, i) => {
            const val   = s[metric];
            const color = metric === "avgScore"
              ? (val >= 7.5 ? "#16a34a" : val >= 6.5 ? "#ca8a04" : "#dc2626")
              : districtColor(val as number);
            const tierBadge = (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold flex-shrink-0"
                style={{ background: TIER_COLORS[s.tier] + "20", color: TIER_COLORS[s.tier] }}>
                {s.tier}
              </span>
            );
            return (
              <BarRow key={s.name} rank={i + 1} name={s.name} badge={tierBadge}
                val={val as number} color={color} rightLabel="" />
            );
          })}
        </div>

        {/* Tier legend */}
        <div className="mt-3 flex items-center gap-3 flex-wrap pt-3 border-t border-border">
          {(["THPT", "THCS", "TH", "MN"] as const).map(tier => (
            <span key={tier} className="flex items-center gap-1"
              style={{ fontSize: "10.5px", color: "var(--muted-foreground)" }}>
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: TIER_COLORS[tier] }} />
              {tier === "MN" ? "Mầm non" : tier === "TH" ? "Tiểu học" : tier}
            </span>
          ))}
          <span className="ml-auto text-[10.5px] text-muted-foreground/60">
            Màu bar = mức độ đạt chuẩn
          </span>
        </div>
      </div>
    );
  }

  /* ══════════════════════════ DISTRICT VIEW ══════════════════════════ */
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 600 }}>
            Hiệu suất STEM theo Quận/Huyện — {province}
          </h3>
          <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
            {HN_DISTRICT_STATS.length} quận/huyện · TB toàn Sở: <strong className="text-foreground">{avgCov}%</strong>
            · Đạt ≥70%: <strong className="text-green-600">{above70}</strong>
            · Cần can thiệp: <strong className="text-red-500">{below40}</strong>
            <span className="ml-2 text-muted-foreground/60">· Chọn quận/huyện để xem theo trường</span>
          </p>
        </div>
        <MetricToggle />
      </div>

      <div className="space-y-1.5">
        {districtDisplay.map((d, i) => {
          const val   = d[metric];
          const color = metric === "avgScore"
            ? (val >= 7.5 ? "#16a34a" : val >= 6.5 ? "#ca8a04" : "#dc2626")
            : districtColor(val as number);
          const typeBadge = d.type === "ngoai_thanh" ? (
            <span className="text-[9px] text-muted-foreground/60 flex-shrink-0">(ngoại)</span>
          ) : null;
          return (
            <BarRow key={d.name} rank={i + 1} name={d.name} badge={typeBadge}
              val={val as number} color={color} rightLabel={`${d.schools} trường`} />
          );
        })}
      </div>

      {HN_DISTRICT_STATS.length > 15 && (
        <button onClick={() => setShowAll(v => !v)}
          className="mt-3 w-full text-center text-muted-foreground hover:text-foreground py-1.5 border border-dashed border-border rounded-lg transition-colors"
          style={{ fontSize: "12px" }}>
          {showAll ? "Thu gọn ▲" : `Xem thêm ${HN_DISTRICT_STATS.length - 15} quận/huyện ▼`}
        </button>
      )}

      <Legend />
    </div>
  );
}

const DISTRICTS_BY_PROVINCE: Record<string, string[]> = {
  "Hà Nội":    HN_DISTRICTS,
  "TP.HCM":    ["Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 7", "Quận 10", "Quận 12", "Bình Thạnh", "Gò Vấp", "Phú Nhuận", "Tân Bình", "Tân Phú", "Bình Tân", "Thủ Đức", "Hóc Môn", "Củ Chi", "Bình Chánh", "Nhà Bè", "Cần Giờ"],
  "Đà Nẵng":  ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ", "Hòa Vang"],
  "Hải Phòng": ["Hồng Bàng", "Lê Chân", "Ngô Quyền", "Kiến An", "Hải An", "Đồ Sơn", "Dương Kinh", "An Dương", "An Lão", "Kiến Thụy", "Tiên Lãng", "Vĩnh Bảo", "Thủy Nguyên"],
  "Bắc Ninh":  ["TP. Bắc Ninh", "Từ Sơn", "Tiên Du", "Yên Phong", "Quế Võ", "Lương Tài", "Gia Bình", "Thuận Thành"],
  "Bình Dương":["TP. Thủ Dầu Một", "Thuận An", "Dĩ An", "Tân Uyên", "Bến Cát", "Bàu Bàng", "Dầu Tiếng", "Phú Giáo"],
  "Đồng Nai":  ["TP. Biên Hòa", "Long Khánh", "Nhơn Trạch", "Long Thành", "Trảng Bom", "Thống Nhất", "Cẩm Mỹ", "Vĩnh Cửu", "Định Quán", "Tân Phú", "Xuân Lộc"],
  "Khánh Hòa": ["TP. Nha Trang", "Cam Ranh", "Cam Lâm", "Ninh Hòa", "Khánh Vĩnh", "Khánh Sơn", "Vạn Ninh", "Diên Khánh"],
};

function getDistricts(province: string): string[] {
  return DISTRICTS_BY_PROVINCE[province] ?? Array.from({ length: 5 }, (_, i) => `${province} - Huyện ${i + 1}`);
}

const SCHOOLS_BY_DISTRICT: Record<string, string[]> = {
  "Hoàn Kiếm":  ["THPT Trần Phú", "THCS Nguyễn Du", "TH Hoàn Kiếm", "MN Bông Sen"],
  "Ba Đình":    ["THPT Phan Đình Phùng", "THCS Giảng Võ", "TH Ngọc Hà", "MN Ba Đình"],
  "Đống Đa":    ["THPT Việt Đức", "THCS Phương Mai", "TH Kim Liên", "TH Đống Đa"],
  "Cầu Giấy":   ["THPT Cầu Giấy", "THCS Cầu Giấy", "TH Nghĩa Đô", "MN Mai Dịch"],
  "Thanh Xuân": ["THPT Khương Đình", "THCS Thanh Xuân", "TH Khương Đình", "MN Thanh Xuân"],
  "Hải Châu":   ["THPT Phan Châu Trinh", "THCS Nguyễn Huệ", "TH Hải Châu", "MN Bạch Đằng"],
  "Quận 1":     ["THPT Lê Quý Đôn", "THCS Minh Đức", "TH Đinh Tiên Hoàng", "MN Quận 1"],
};

function getSchools(district: string): string[] {
  return SCHOOLS_BY_DISTRICT[district] ?? [
    `THPT ${district}`, `THCS ${district}`, `TH ${district} 1`, `TH ${district} 2`, `MN ${district}`,
  ];
}

const MONTHLY_BY_YEAR: Record<SchoolYear, Array<{ month: string; coverage: number; quality: number }>> = {
  "2023-2024": [
    { month: "T9/23",  coverage: 52, quality: 6.8 }, { month: "T10/23", coverage: 54, quality: 6.9 },
    { month: "T11/23", coverage: 55, quality: 7.0 }, { month: "T12/23", coverage: 56, quality: 7.0 },
    { month: "T1/24",  coverage: 57, quality: 7.1 }, { month: "T2/24",  coverage: 58, quality: 7.1 },
    { month: "T3/24",  coverage: 60, quality: 7.1 }, { month: "T4/24",  coverage: 62, quality: 7.2 },
  ],
  "2024-2025": [
    { month: "T9/24",  coverage: 62, quality: 7.2 }, { month: "T10/24", coverage: 64, quality: 7.3 },
    { month: "T11/24", coverage: 65, quality: 7.4 }, { month: "T12/24", coverage: 66, quality: 7.5 },
    { month: "T1/25",  coverage: 67, quality: 7.5 }, { month: "T2/25",  coverage: 68, quality: 7.6 },
    { month: "T3/25",  coverage: 69, quality: 7.7 }, { month: "T4/25",  coverage: 70, quality: 7.7 },
  ],
  "2025-2026": [
    { month: "T9/25",  coverage: 65, quality: 7.2 }, { month: "T10/25", coverage: 67, quality: 7.4 },
    { month: "T11/25", coverage: 68, quality: 7.5 }, { month: "T12/25", coverage: 70, quality: 7.6 },
    { month: "T1/26",  coverage: 72, quality: 7.7 }, { month: "T2/26",  coverage: 74, quality: 7.8 },
    { month: "T3/26",  coverage: 76, quality: 7.9 }, { month: "T4/26",  coverage: 71, quality: 7.8 },
  ],
};

const YEAR_COV_FACTOR: Record<SchoolYear, number> = {
  "2023-2024": 0.84, "2024-2025": 0.92, "2025-2026": 1.0,
};
const YEAR_SCORE_FACTOR: Record<SchoolYear, number> = {
  "2023-2024": 0.91, "2024-2025": 0.95, "2025-2026": 1.0,
};

const ALL_SCHOOL_TIERS = [
  { name: "Mầm non",   value: 820,  fill: "#0891b2", teachers: 8200,  students: 142000 },
  { name: "Tiểu học",  value: 1050, fill: "#16a34a", teachers: 28000, students: 680000 },
  { name: "THCS",      value: 580,  fill: "#c8a84e", teachers: 21000, students: 520000 },
  { name: "THPT",      value: 340,  fill: "#7c3aed", teachers: 18000, students: 420000 },
  { name: "THPT Nghề", value: 60,   fill: "#dc2626", teachers: 3800,  students: 88000  },
];

const NATIONAL_SNAPSHOT = {
  province: "Toàn quốc", districts: 63,
  schools: 50_000, teachers: 1_200_000, students: 23_000_000,
  stemCoveragePct: 62, equipmentCompliancePct: 58, avgStemScore: 7.4,
};

/* ------------------------------------------------------------------ */
/*  HEATMAP — chữ S (CSS grid, đặt tọa độ col/row theo hình Việt Nam)  */
/* ------------------------------------------------------------------ */
interface ProvinceHeat {
  name: string; short: string;
  col: number; row: number;
  coverage: number; score: number;
}

// 34 tỉnh/thành sau sáp nhập, hiệu lực 12/6/2025
const HEATMAP_GRID: ProvinceHeat[] = [
  // ── Miền Bắc ──
  { name: "Tuyên Quang",       short: "T.Quang",  col: 1, row: 1,  coverage: 33, score: 6.0 }, // Hà Giang + Tuyên Quang
  { name: "Cao Bằng",          short: "C.Bằng",   col: 2, row: 1,  coverage: 32, score: 6.0 },
  { name: "Lai Châu",          short: "L.Châu",   col: 3, row: 1,  coverage: 24, score: 5.7 },
  { name: "Lào Cai",           short: "L.Cai",    col: 4, row: 1,  coverage: 40, score: 6.4 }, // + Yên Bái
  { name: "Thái Nguyên",       short: "T.Nguyên", col: 5, row: 1,  coverage: 60, score: 7.1 }, // + Bắc Kạn
  { name: "Điện Biên",         short: "Đ.Biên",   col: 6, row: 1,  coverage: 25, score: 5.7 },
  { name: "Lạng Sơn",          short: "L.Sơn",    col: 7, row: 1,  coverage: 44, score: 6.5 },
  { name: "Sơn La",            short: "Sơn La",   col: 8, row: 1,  coverage: 30, score: 5.9 },
  { name: "Phú Thọ",           short: "Phú Thọ",  col: 4, row: 2,  coverage: 58, score: 7.0 }, // + Hòa Bình + Vĩnh Phúc
  { name: "Bắc Ninh",          short: "B.Ninh",   col: 5, row: 2,  coverage: 76, score: 7.7 }, // + Bắc Giang
  { name: "Quảng Ninh",        short: "Q.Ninh",   col: 6, row: 2,  coverage: 76, score: 7.7 },
  { name: "Hà Nội",            short: "Hà Nội",   col: 5, row: 3,  coverage: 91, score: 8.2 },
  { name: "Hải Phòng",         short: "H.Phòng",  col: 6, row: 3,  coverage: 78, score: 7.8 }, // + Hải Dương
  { name: "Hưng Yên",          short: "H.Yên",    col: 5, row: 4,  coverage: 65, score: 7.3 }, // + Thái Bình
  { name: "Ninh Bình",         short: "N.Bình",   col: 5, row: 5,  coverage: 63, score: 7.1 }, // + Hà Nam + Nam Định
  // ── Miền Trung ──
  { name: "Thanh Hóa",         short: "Th.Hóa",   col: 6, row: 5,  coverage: 55, score: 6.9 },
  { name: "Nghệ An",           short: "Nghệ An",  col: 6, row: 6,  coverage: 52, score: 6.8 },
  { name: "Hà Tĩnh",           short: "Hà Tĩnh",  col: 7, row: 7,  coverage: 50, score: 6.7 },
  { name: "Quảng Trị",         short: "Q.Trị",    col: 7, row: 8,  coverage: 45, score: 6.5 }, // + Quảng Bình
  { name: "Huế",               short: "Huế",      col: 6, row: 9,  coverage: 72, score: 7.5 },
  { name: "Đà Nẵng",           short: "Đà Nẵng",  col: 7, row: 9,  coverage: 83, score: 8.0 }, // + Quảng Nam
  { name: "Quảng Ngãi",        short: "Q.Ngãi",   col: 7, row: 10, coverage: 40, score: 6.3 }, // + Kon Tum
  { name: "Gia Lai",           short: "Gia Lai",  col: 6, row: 10, coverage: 46, score: 6.5 }, // + Bình Định
  { name: "Đắk Lắk",          short: "Đ.Lắk",   col: 6, row: 11, coverage: 44, score: 6.4 }, // + Phú Yên
  { name: "Khánh Hòa",         short: "K.Hòa",   col: 7, row: 11, coverage: 56, score: 6.9 }, // + Ninh Thuận
  { name: "Lâm Đồng",          short: "L.Đồng",  col: 6, row: 12, coverage: 46, score: 6.5 }, // + Đắk Nông + Bình Thuận
  // ── Miền Nam ──
  { name: "Đồng Nai",          short: "Đ.Nai",   col: 5, row: 13, coverage: 60, score: 7.0 }, // + Bình Phước
  { name: "Tây Ninh",          short: "T.Ninh",  col: 4, row: 13, coverage: 52, score: 6.8 }, // + Long An
  { name: "TP. Hồ Chí Minh",   short: "TP.HCM",  col: 5, row: 14, coverage: 87, score: 8.1 }, // + Bình Dương + BRVT
  { name: "Đồng Tháp",         short: "Đ.Tháp",  col: 4, row: 14, coverage: 50, score: 6.7 }, // + Tiền Giang
  { name: "An Giang",          short: "An Gian", col: 3, row: 14, coverage: 44, score: 6.5 }, // + Kiên Giang
  { name: "Vĩnh Long",         short: "V.Long",  col: 4, row: 15, coverage: 47, score: 6.6 }, // + Bến Tre + Trà Vinh
  { name: "Cần Thơ",           short: "Cần Thơ", col: 4, row: 16, coverage: 66, score: 7.3 }, // + Sóc Trăng + Hậu Giang
  { name: "Cà Mau",            short: "Cà Mau",  col: 3, row: 16, coverage: 35, score: 6.2 }, // + Bạc Liêu
];

function coverageColor(pct: number): string {
  if (pct >= 80) return "#15803d";
  if (pct >= 65) return "#16a34a";
  if (pct >= 55) return "#65a30d";
  if (pct >= 45) return "#ca8a04";
  if (pct >= 35) return "#d97706";
  return "#dc2626";
}

function coverageBg(pct: number): string {
  if (pct >= 80) return "#dcfce7";
  if (pct >= 65) return "#d1fae5";
  if (pct >= 55) return "#ecfccb";
  if (pct >= 45) return "#fef9c3";
  if (pct >= 35) return "#fef3c7";
  return "#fee2e2";
}

interface ProvinceHeatmapProps {
  onSelectProvince: (name: string) => void;
  selectedProvince: string;
}

function ProvinceHeatmap({ onSelectProvince, selectedProvince }: ProvinceHeatmapProps) {
  const [hovered, setHovered] = useState<ProvinceHeat | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const avgCoverage = Math.round(HEATMAP_GRID.reduce((s, p) => s + p.coverage, 0) / HEATMAP_GRID.length);
  const above70 = HEATMAP_GRID.filter(p => p.coverage >= 70).length;
  const below40 = HEATMAP_GRID.filter(p => p.coverage < 40).length;

  // cell: 54×30px, gap: 2px → step 56×32
  const CELL_W = 54, CELL_H = 30, GAP = 2;
  const COLS = 8, ROWS = 20;

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 600 }}>
            Heatmap Bao phủ STEM — 63 Tỉnh/Thành phố
          </h3>
          <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
            Click vào tỉnh để lọc toàn bộ dashboard theo tỉnh đó
          </p>
        </div>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-green-700" />≥ 80% ({above70} tỉnh)</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-lime-600" />65–79%</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-amber-500" />45–64%</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-red-500" />{"< 45%"} ({below40} tỉnh)</span>
          </div>
          <div className="text-right">TB toàn quốc: <strong className="text-foreground">{avgCoverage}%</strong></div>
        </div>
      </div>

      {/* S-shape grid */}
      <div className="flex justify-center overflow-x-auto">
        <div className="relative" style={{
          width:  COLS * (CELL_W + GAP),
          height: ROWS * (CELL_H + GAP),
          flexShrink: 0,
        }}>
          {HEATMAP_GRID.map((p) => {
            const isSelected = selectedProvince === p.name;
            const bg  = coverageBg(p.coverage);
            const col = coverageColor(p.coverage);
            const x = (p.col - 1) * (CELL_W + GAP);
            const y = (p.row - 1) * (CELL_H + GAP);
            return (
              <button
                key={p.name}
                onClick={() => onSelectProvince(isSelected ? "all" : p.name)}
                onMouseEnter={(e) => {
                  setHovered(p);
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  setTooltipPos({ x: rect.right + 8, y: rect.top });
                }}
                onMouseLeave={() => setHovered(null)}
                className="absolute flex flex-col items-center justify-center rounded transition-all hover:brightness-95 hover:scale-105 hover:z-10"
                style={{
                  left: x, top: y,
                  width: CELL_W, height: CELL_H,
                  background: bg,
                  border: `1.5px solid ${isSelected ? "#7c3aed" : col + "80"}`,
                  boxShadow: isSelected ? `0 0 0 2px #7c3aed, 0 2px 8px rgba(124,58,237,0.3)` : undefined,
                  zIndex: isSelected ? 10 : undefined,
                }}
              >
                <span style={{ fontSize: "7.5px", fontWeight: 700, color: col, lineHeight: 1, letterSpacing: "-0.3px" }}>
                  {p.short}
                </span>
                <span style={{ fontSize: "9.5px", fontWeight: 800, color: col, lineHeight: 1.3 }}>
                  {p.coverage}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tooltip portal */}
      {hovered && (
        <div className="fixed z-50 pointer-events-none"
          style={{ left: tooltipPos.x, top: tooltipPos.y, transform: "translateY(-25%)" }}>
          <div className="bg-gray-900 text-white rounded-xl px-3 py-2.5 shadow-2xl border border-white/10"
            style={{ fontSize: "12px", minWidth: 170 }}>
            <div className="font-semibold mb-1.5 text-white">{hovered.name}</div>
            <div className="space-y-0.5">
              <div className="flex justify-between gap-6">
                <span className="text-gray-400">Bao phủ STEM</span>
                <span className="font-bold" style={{ color: coverageColor(hovered.coverage) }}>
                  {hovered.coverage}%
                </span>
              </div>
              <div className="flex justify-between gap-6">
                <span className="text-gray-400">Điểm TB</span>
                <span className="font-bold text-white">{hovered.score.toFixed(1)}</span>
              </div>
            </div>
            <div className="mt-2 pt-1.5 border-t border-white/10 text-[10px] text-gray-500">
              Click để lọc dashboard theo tỉnh này
            </div>
          </div>
        </div>
      )}

      {/* Gradient legend */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Thấp</span>
        <div className="flex-1 h-2 rounded-full" style={{
          background: "linear-gradient(to right, #dc2626, #d97706, #ca8a04, #65a30d, #16a34a, #15803d)"
        }} />
        <span className="text-[10px] text-muted-foreground">Cao</span>
      </div>
    </div>
  );
}

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
}) => {
  if (percent < 0.06) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + r * Math.sin(-midAngle * (Math.PI / 180));
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 10, fontWeight: 700 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

function getReportBadge(scope: string) {
  if (scope === "national") return { label: "Toàn quốc", bg: "#dbeafe", color: "#2563eb" };
  if (scope === "province") return { label: "Tỉnh/Thành", bg: "#dcfce7", color: "#16a34a" };
  return { label: "Quận/Huyện", bg: "#fef3c7", color: "#d97706" };
}

type ChartMode = "both" | "coverage" | "quality";

/* ================================================================ */
/*  MAIN COMPONENT                                                    */
/* ================================================================ */
export function RegionalEducationDashboard() {
  const { user } = useAuth();
  const isBo         = user?.tenantType === "authority" && !user?.province;
  const myProvince   = user?.province || "";
  const { reports: activeReports, addReport } = useRecentReports(user?.id ?? "anon");

  const [schoolYear,       setSchoolYear]       = useState<SchoolYear>("2025-2026");
  const [selectedTiers,    setSelectedTiers]    = useState<string[]>([]);
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedSchool,   setSelectedSchool]   = useState("all");
  const [chartMode,        setChartMode]        = useState<ChartMode>("both");
  const [distChartMetric,  setDistChartMetric]  = useState<"stemCoverage" | "tt38Compliance" | "scoreScaled">("stemCoverage");

  const toggleTier = (tier: string) =>
    setSelectedTiers(prev => prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]);

  const handleProvinceChange = (v: string) => {
    setSelectedProvince(v); setSelectedDistrict("all"); setSelectedSchool("all");
  };
  const handleDistrictChange = (v: string) => {
    setSelectedDistrict(v); setSelectedSchool("all");
  };

  const resetFilters = () => {
    setSchoolYear("2025-2026"); setSelectedTiers([]);
    setSelectedProvince("all"); setSelectedDistrict("all"); setSelectedSchool("all");
  };

  const hasActiveFilter = schoolYear !== "2025-2026" || selectedTiers.length > 0
    || selectedProvince !== "all" || selectedDistrict !== "all" || selectedSchool !== "all";

  /* ---- Cascade options ---- */
  const districtOptions = useMemo(() => {
    const prov = isBo ? selectedProvince : myProvince;
    return prov && prov !== "all" ? getDistricts(prov) : [];
  }, [isBo, selectedProvince, myProvince]);

  const schoolOptions = useMemo(
    () => selectedDistrict !== "all" ? getSchools(selectedDistrict) : [],
    [selectedDistrict]
  );

  const showDistrictFilter = isBo ? selectedProvince !== "all" : true;
  const showSchoolFilter   = selectedDistrict !== "all";

  /* ---- Snapshot ---- */
  const snapshot = useMemo(() => {
    const prov = isBo ? selectedProvince : myProvince;
    if (prov && prov !== "all")
      return provinceSnapshots.find(p => p.province === prov) ?? NATIONAL_SNAPSHOT;
    return NATIONAL_SNAPSHOT;
  }, [isBo, myProvince, selectedProvince]);

  const activeTiers = useMemo(
    () => selectedTiers.length === 0 ? ALL_SCHOOL_TIERS : ALL_SCHOOL_TIERS.filter(t => selectedTiers.includes(t.name)),
    [selectedTiers]
  );

  const tierRatio = activeTiers.reduce((s, t) => s + t.value, 0) /
    ALL_SCHOOL_TIERS.reduce((s, t) => s + t.value, 0) || 1;

  const displayStats = useMemo(() => {
    /* Cấp trường: luôn là 1 trường, mock giáo viên & học sinh */
    if (selectedSchool !== "all") {
      const seed = selectedSchool.length % 5;
      return { schools: 1, teachers: 28 + seed * 4, students: 420 + seed * 120 };
    }

    /* Cấp quận/huyện: chia đều số trường/gv/hs của tỉnh theo số quận */
    if (selectedDistrict !== "all") {
      const distCount  = Math.max(districtOptions.length, 1);
      const distIdx    = districtOptions.indexOf(selectedDistrict);
      const variation  = 1 + (distIdx % 3) * 0.12;
      return {
        schools:  Math.round(snapshot.schools  / distCount * variation * tierRatio),
        teachers: Math.round(snapshot.teachers / distCount * variation * tierRatio),
        students: Math.round(snapshot.students / distCount * variation * tierRatio),
      };
    }

    /* Cấp tỉnh hoặc toàn quốc: dùng snapshot */
    return {
      schools:  Math.round(snapshot.schools  * tierRatio),
      teachers: Math.round(snapshot.teachers * tierRatio),
      students: Math.round(snapshot.students * tierRatio),
    };
  }, [selectedSchool, selectedDistrict, districtOptions, snapshot, tierRatio]);

  const { schools: filteredSchools, teachers: filteredTeachers, students: filteredStudents } = displayStats;

  const monthlyData   = MONTHLY_BY_YEAR[schoolYear];
  // Spark dùng số liệu từ snapshot thực (Hà Nội hoặc toàn quốc)
  const baseSchools   = snapshot.schools;
  const baseTeachers  = snapshot.teachers;
  const baseStudents  = snapshot.students;
  const schoolSpark   = monthlyData.map((_, i) => ({ v: Math.round(baseSchools  * (0.94 + i * 0.008)) }));
  const teacherSpark  = monthlyData.map((_, i) => ({ v: Math.round(baseTeachers * (0.96 + i * 0.005)) }));
  const studentSpark  = monthlyData.map((_, i) => ({ v: Math.round(baseStudents * (0.97 + i * 0.004)) }));
  const coverageSpark = monthlyData.map(d => ({ v: d.coverage }));

  const topProvinces = useMemo(
    () => [...provinceSnapshots]
      .sort((a, b) => b.stemCoveragePct - a.stemCoveragePct)
      .slice(0, 10)
      .map(p => ({ ...p, scoreScaled: +(p.avgStemScore * 10).toFixed(1) })),
    []
  );

  const highlightProvince = isBo ? (selectedProvince !== "all" ? selectedProvince : "") : myProvince;
  const dashboardTitle    = isBo ? "Dashboard Toàn quốc" : `Dashboard Sở GD&ĐT — ${myProvince}`;

  /* Breadcrumb */
  const breadcrumb = [
    selectedProvince !== "all" && selectedProvince,
    selectedDistrict !== "all" && selectedDistrict,
    selectedSchool   !== "all" && selectedSchool,
  ].filter(Boolean) as string[];

  const locationSubtitle = breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1] : (isBo ? "Toàn quốc" : myProvince);

  /* ---- Sở-level district KPIs (only used when !isBo) ---- */
  const districtAbove70  = HN_DISTRICT_STATS.filter(d => d.stemCoverage >= 70).length;
  const districtBelow40  = HN_DISTRICT_STATS.filter(d => d.stemCoverage < 40).length;
  const districtAvgCov   = Math.round(HN_DISTRICT_STATS.reduce((s, d) => s + d.stemCoverage, 0) / HN_DISTRICT_STATS.length);
  const districtTT38Good = HN_DISTRICT_STATS.filter(d => d.tt38Compliance >= 60).length;

  const filteredMonthlyData = useMemo(() => {
    const base = MONTHLY_BY_YEAR[schoolYear];
    const distStat = selectedDistrict !== "all"
      ? HN_DISTRICT_STATS.find(d => d.name === selectedDistrict) : null;
    const covScale   = distStat ? distStat.stemCoverage / districtAvgCov : 1;
    const scoreScale = distStat ? distStat.avgScore / (snapshot.avgStemScore || 7.5) : 1;
    const tierScale  = selectedTiers.length > 0 ? 0.65 + tierRatio * 0.35 : 1;
    if (covScale === 1 && scoreScale === 1 && tierScale === 1) return base;
    return base.map(d => ({
      ...d,
      coverage: Math.min(100, Math.max(20, Math.round(d.coverage * covScale * tierScale))),
      quality:  Math.min(10,  Math.max(5,  +(d.quality * scoreScale).toFixed(1))),
    }));
  }, [schoolYear, selectedDistrict, selectedTiers, districtAvgCov, snapshot.avgStemScore, tierRatio]);

  const contextCoverage = useMemo(() => {
    if (selectedSchool !== "all") {
      const stats = getSchoolStats(selectedDistrict);
      const school = stats.find(s => s.name === selectedSchool);
      return school ? school.stemCoverage : districtAvgCov;
    }
    if (selectedDistrict !== "all") {
      const dist = HN_DISTRICT_STATS.find(d => d.name === selectedDistrict);
      return dist ? dist.stemCoverage : districtAvgCov;
    }
    return districtAvgCov;
  }, [selectedSchool, selectedDistrict, districtAvgCov]);

  const contextScore = useMemo(() => {
    if (selectedSchool !== "all") {
      const stats = getSchoolStats(selectedDistrict);
      const school = stats.find(s => s.name === selectedSchool);
      return school ? school.avgScore : snapshot.avgStemScore;
    }
    if (selectedDistrict !== "all") {
      const dist = HN_DISTRICT_STATS.find(d => d.name === selectedDistrict);
      return dist ? dist.avgScore : snapshot.avgStemScore;
    }
    return snapshot.avgStemScore;
  }, [selectedSchool, selectedDistrict, snapshot.avgStemScore]);

  const contextLabel = selectedSchool !== "all"
    ? selectedSchool
    : selectedDistrict !== "all" ? selectedDistrict : "toàn Sở";

  const handleExport = () => {
    let rows: string[][];
    let filename: string;
    const province = isBo ? (selectedProvince !== "all" ? selectedProvince : "Toàn quốc") : myProvince;
    const safe = (s: string) => s.replace(/,/g, " ");

    if (!isBo && selectedDistrict !== "all" && selectedSchool !== "all") {
      // Cấp trường
      const stats = getSchoolStats(selectedDistrict);
      const school = stats.find(s => s.name === selectedSchool) ?? stats[0];
      rows = [
        ["Trường", "Quận/Huyện", "Khối", "Bao phủ STEM (%)", "TT38 (%)", "Điểm TB", "Năm học"],
        school
          ? [safe(school.name), safe(selectedDistrict), school.tier,
             String(school.stemCoverage), String(school.tt38Compliance), String(school.avgScore), schoolYear]
          : [],
      ];
      filename = `BaoCao_${schoolYear}_${selectedDistrict}_${selectedSchool}.csv`;
    } else if (!isBo && selectedDistrict !== "all") {
      // Cấp quận — danh sách trường
      const stats = getSchoolStats(selectedDistrict);
      rows = [
        ["STT", "Trường", "Khối", "Bao phủ STEM (%)", "TT38 (%)", "Điểm TB"],
        ...stats.map((s, i) => [
          String(i + 1), safe(s.name), s.tier,
          String(s.stemCoverage), String(s.tt38Compliance), String(s.avgScore),
        ]),
      ];
      filename = `BaoCao_${schoolYear}_${province}_${selectedDistrict}.csv`;
    } else {
      // Cấp Sở / Bộ — danh sách quận hoặc tỉnh
      const data = isBo
        ? HEATMAP_GRID.map((p, i) => [String(i + 1), safe(p.name), String(p.coverage), String(p.score.toFixed(1))])
        : HN_DISTRICT_STATS.map((d, i) => [
            String(i + 1), safe(d.name), String(d.schools),
            String(d.stemCoverage), String(d.tt38Compliance), String(d.avgScore),
            d.type === "noi_thanh" ? "Nội thành" : "Ngoại thành",
          ]);
      const header = isBo
        ? ["STT", "Tỉnh/Thành phố", "Bao phủ STEM (%)", "Điểm TB"]
        : ["STT", "Quận/Huyện", "Số trường", "Bao phủ STEM (%)", "TT38 (%)", "Điểm TB", "Phân loại"];
      rows = [header, ...data];
      filename = isBo
        ? `BaoCao_${schoolYear}_Toan_quoc.csv`
        : `BaoCao_${schoolYear}_So_${province}.csv`;
    }

    const BOM = "﻿"; // UTF-8 BOM để Excel hiển thị tiếng Việt
    const csv = BOM + rows.filter(r => r.length > 0).map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất ${filename}`);
    const scope = isBo ? "national" : selectedSchool !== "all" ? "district" : selectedDistrict !== "all" ? "district" : "province";
    addReport({ name: filename.replace(".csv", ""), templateCode: "BC-EXPORT", scope, period: schoolYear });
  };

  const downloadReport = (r: { id: string; name: string; templateCode: string; scope: string; period: string }) => {
    const loc    = isBo ? "Toan_quoc" : myProvince.replace(/\s/g, "_");
    const period = r.period.replace(/\//g, "-").replace(/\s/g, "_");
    const BOM    = "﻿";
    const safe   = (s: string) => s.replace(/,/g, " ");
    let rows: string[][];

    switch (r.templateCode) {
      case "TT38-2023": {
        rows = [
          ["STT", "Quận/Huyện", "Số trường", "Trường đạt TT38 (%)", "Thiết bị đạt chuẩn (%)", "Phân loại"],
          ...HN_DISTRICT_STATS.map((d, i) => [
            String(i + 1), safe(d.name), String(d.schools),
            String(d.tt38Compliance),
            String(Math.round(d.tt38Compliance * 0.95)),
            d.tt38Compliance >= 60 ? "Đạt" : "Chưa đạt",
          ]),
        ];
        break;
      }
      case "CV1014": {
        rows = [
          ["STT", "Quận/Huyện", "Số trường đăng ký", "Đã triển khai", "Tỉ lệ (%)", "Ghi chú"],
          ...HN_DISTRICT_STATS.map((d, i) => [
            String(i + 1), safe(d.name),
            String(d.schools),
            String(Math.round(d.schools * d.stemCoverage / 100)),
            String(d.stemCoverage),
            d.stemCoverage >= 70 ? "Đúng tiến độ" : "Cần đôn đốc",
          ]),
        ];
        break;
      }
      case "BC-CAN-THIEP": {
        const schools = HN_DISTRICT_STATS.flatMap(d =>
          getSchoolStats(d.name)
            .filter(s => s.tt38Compliance < 60)
            .map(s => ({ ...s, district: d.name }))
        );
        rows = [
          ["STT", "Trường", "Quận/Huyện", "Khối", "TT38 (%)", "Bao phủ STEM (%)", "Mức độ"],
          ...schools.map((s, i) => [
            String(i + 1), safe(s.name), safe(s.district), s.tier,
            String(s.tt38Compliance), String(s.stemCoverage),
            s.tt38Compliance < 40 ? "Cần can thiệp ngay" : "Theo dõi",
          ]),
        ];
        break;
      }
      default: { // BC-STEM-Q, BC-QUAN-HUYEN, ...
        rows = [
          ["STT", "Quận/Huyện", "Số trường", "Bao phủ STEM (%)", "TT38 (%)", "Điểm TB STEM", "Xếp loại"],
          ...HN_DISTRICT_STATS
            .sort((a, b) => b.stemCoverage - a.stemCoverage)
            .map((d, i) => [
              String(i + 1), safe(d.name), String(d.schools),
              String(d.stemCoverage), String(d.tt38Compliance), String(d.avgScore),
              d.stemCoverage >= 75 ? "Xuất sắc" : d.stemCoverage >= 60 ? "Tốt" : d.stemCoverage >= 45 ? "Trung bình" : "Yếu",
            ]),
        ];
      }
    }

    const filename = `${r.templateCode}_${period}_${loc}.csv`;
    const csv = BOM + rows.map(r2 => r2.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Đã tải: ${filename}`);
    addReport({ name: r.name, templateCode: r.templateCode, scope: r.scope, period: r.period });
  };

  const displayTiers = useMemo(() => {
    // Derive tier from school name prefix (works regardless of mock data naming)
    const tierFromName = (name: string): string | null => {
      if (/^THPT\b/.test(name)) return "THPT";
      if (/^THCS\b/.test(name)) return "THCS";
      if (/^TH\b/.test(name))   return "Tiểu học";
      if (/^MN\b/.test(name))   return "Mầm non";
      return null;
    };

    // Single school: show only that school's tier
    if (selectedSchool !== "all" && selectedDistrict !== "all") {
      const tierName = tierFromName(selectedSchool);
      if (tierName) {
        const base = ALL_SCHOOL_TIERS.find(t => t.name === tierName);
        return base ? [{ ...base, value: 1 }] : activeTiers;
      }
    }
    // District: count schools by tier using dropdown names
    if (selectedDistrict !== "all") {
      const schools = getSchools(selectedDistrict);
      const counts: Record<string, number> = {};
      schools.forEach(name => {
        const tier = tierFromName(name);
        if (tier) counts[tier] = (counts[tier] || 0) + 1;
      });
      const result = activeTiers
        .filter(t => counts[t.name])
        .map(t => ({ ...t, value: counts[t.name] }));
      return result.length > 0 ? result : activeTiers;
    }
    return activeTiers;
  }, [activeTiers, selectedDistrict, selectedSchool]);

  const districtChartData = useMemo(() => {
    const yCov   = YEAR_COV_FACTOR[schoolYear];
    const yScore = YEAR_SCORE_FACTOR[schoolYear];
    const tScale = selectedTiers.length > 0 ? 0.6 + tierRatio * 0.4 : 1;

    // District selected (kể cả khi đã chọn trường): show tất cả trường, opacity xử lý ở Cell
    if (selectedDistrict !== "all") {
      const stats = getSchoolStats(selectedDistrict);
      return [...stats]
        .filter(s => selectedTiers.length === 0 || selectedTiers.includes(TIER_NAME_MAP[s.tier]))
        .sort((a, b) => b.stemCoverage - a.stemCoverage)
        .slice(0, 10)
        .map(s => ({
          name: s.name,
          stemCoverage: Math.min(100, Math.round(s.stemCoverage * yCov * tScale)),
          scoreScaled:  +(s.avgScore * yScore * 10).toFixed(1),
          tier: s.tier,
          type: "noi_thanh" as const,
        }));
    }

    // Mặc định: top 10 quận/huyện
    return [...HN_DISTRICT_STATS]
      .sort((a, b) => b.stemCoverage - a.stemCoverage)
      .slice(0, 10)
      .map(d => ({
        ...d,
        stemCoverage:    Math.min(100, Math.round(d.stemCoverage * yCov * tScale)),
        tt38Compliance:  Math.min(100, Math.round(d.tt38Compliance * yCov * tScale)),
        scoreScaled:     +(d.avgScore * yScore * 10).toFixed(1),
        tier: undefined as SchoolStat["tier"] | undefined,
      }));
  }, [schoolYear, selectedTiers, tierRatio, selectedDistrict, selectedSchool]);

  const scatterData = useMemo(() => {
    const yCov   = YEAR_COV_FACTOR[schoolYear];
    const tScale = selectedTiers.length > 0 ? 0.6 + tierRatio * 0.4 : 1;
    return HN_DISTRICT_STATS.map(d => ({
      name:     d.name,
      x:        Math.min(100, Math.round(d.stemCoverage   * yCov * tScale)),
      y:        Math.min(100, Math.round(d.tt38Compliance * yCov * tScale)),
      schools:  d.schools,
      type:     d.type,
    }));
  }, [schoolYear, selectedTiers, tierRatio]);

  const scatterAvgX = Math.round(scatterData.reduce((s, d) => s + d.x, 0) / scatterData.length);
  const scatterAvgY = Math.round(scatterData.reduce((s, d) => s + d.y, 0) / scatterData.length);

  const CHART_GRID = <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />;
  const X_AXIS     = <XAxis dataKey="month" tick={{ fontSize: 11 }} />;

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <PageHeader
        icon={Landmark}
        title={dashboardTitle}
        subtitle={`${user?.name} · ${user?.tenantName}. Dữ liệu cập nhật từ CSDL ngành giáo dục.`}
        accentColor="#7c3aed"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-100"
              style={{ fontSize: "12px" }}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đồng bộ 08:30 · 18/05/2026</span>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#7c3aed] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" />
              {isBo ? "Xuất toàn cảnh" : "Xuất báo cáo Sở"}
            </button>
          </div>
        }
      />

      {/* ── Filter bar ── */}
      <div className="bg-card rounded-xl border border-border p-3 space-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "12px" }}>
            <Filter className="w-3.5 h-3.5" />
            <span style={{ fontWeight: 600 }}>Bộ lọc</span>
          </div>

          {/* Năm học */}
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: "12px" }} className="text-muted-foreground whitespace-nowrap">Năm học</span>
            <SelectDown
              value={schoolYear}
              onChange={(v) => setSchoolYear(v as SchoolYear)}
              options={SCHOOL_YEARS.map(y => ({ value: y, label: y }))}
            />
          </div>

          {/* Tỉnh/TP — searchable (Bộ only) */}
          {isBo && (
            <SearchableSelect
              label="Tỉnh/TP"
              value={selectedProvince}
              allLabel="Tất cả (63 tỉnh/TP)"
              options={ALL_PROVINCES}
              onChange={handleProvinceChange}
            />
          )}

          {/* Quận/Huyện */}
          {showDistrictFilter && districtOptions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: "12px" }} className="text-muted-foreground whitespace-nowrap">Quận/Huyện</span>
              <SelectDown
                value={selectedDistrict}
                onChange={handleDistrictChange}
                options={[
                  { value: "all", label: "Tất cả" },
                  ...districtOptions.map(d => ({ value: d, label: d })),
                ]}
              />
            </div>
          )}

          {/* Trường — searchable */}
          {showSchoolFilter && (
            <SearchableSelect
              label="Trường"
              value={selectedSchool}
              allLabel="Tất cả"
              options={schoolOptions}
              onChange={setSelectedSchool}
            />
          )}

          <span className="text-border select-none">|</span>

          {/* Khối chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span style={{ fontSize: "11px" }} className="text-muted-foreground">Khối</span>
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

          {hasActiveFilter && (
            <button onClick={resetFilters}
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors ml-auto"
              style={{ fontSize: "12px" }}>
              <X className="w-3.5 h-3.5" /> Đặt lại
            </button>
          )}
        </div>

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className="flex items-center gap-1" style={{ fontSize: "11px" }}>
            <span className="text-muted-foreground">Đang xem:</span>
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-muted-foreground">›</span>}
                <span className="px-2 py-0.5 bg-[#7c3aed]/10 text-[#7c3aed] rounded-full font-medium">{item}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── KPI Row 1 ── */}
      {isBo ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={SchoolIcon} label="Tổng số trường" value={formatNumberCompact(filteredSchools)}
            color="#7c3aed" subtitle={locationSubtitle} spark={schoolSpark} />
          <StatCard icon={GraduationCap} label="Giáo viên" value={formatNumberCompact(filteredTeachers)}
            color="#2563eb" change="+3.2%" trend="up" spark={teacherSpark} />
          <StatCard icon={Users} label="Học sinh" value={formatNumberCompact(filteredStudents)}
            color="#0891b2" spark={studentSpark} />
          <StatCard icon={TrendingUp} label="Bao phủ STEM" value={`${snapshot.stemCoveragePct}%`}
            color="#16a34a" change="+4%" trend="up" subtitle="Số trường triển khai" spark={coverageSpark} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={SchoolIcon} label="Tổng số trường" value={formatNumberCompact(filteredSchools)}
            color="#7c3aed" subtitle={myProvince} spark={schoolSpark} />
          <StatCard icon={GraduationCap} label="Quận/Huyện quản lý" value={HN_DISTRICT_STATS.length}
            color="#2563eb" subtitle={`${districtAbove70} quận/huyện đạt ≥ 70%`} />
          <StatCard icon={TrendingUp} label={`Bao phủ STEM — ${contextLabel}`} value={`${contextCoverage}%`}
            color="#16a34a" change="+5%" trend="up" subtitle="Trung bình các quận/huyện" spark={coverageSpark} />
          <StatCard icon={Users} label="Học sinh" value={formatNumberCompact(filteredStudents)}
            color="#0891b2" spark={studentSpark} />
        </div>
      )}

      {/* ── KPI Row 2 ── */}
      {isBo ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={ClipboardCheck} label="Thiết bị đạt chuẩn"
            value={`${snapshot.equipmentCompliancePct}%`} color="#c8a84e" />
          <StatCard icon={TrendingUp} label="Điểm STEM TB"
            value={snapshot.avgStemScore.toFixed(1)} color="#990803" change="+0.3" trend="up" />
          <StatCard icon={AlertTriangle} label="Trường dưới 50% bao phủ"
            value={Math.round(filteredSchools * (1 - snapshot.stemCoveragePct / 100) * 0.3)} color="#dc2626" />
          <StatCard icon={Download} label="Báo cáo Thông tư đã xuất"
            value={activeReports.length} color="#64748b" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={ClipboardCheck} label="Quận/Huyện đạt chuẩn TT38"
            value={`${districtTT38Good}/${HN_DISTRICT_STATS.length}`}
            color="#c8a84e" subtitle="≥ 60% trường đạt chuẩn" />
          <StatCard icon={TrendingUp} label={`Điểm STEM TB — ${contextLabel}`}
            value={contextScore.toFixed(1)} color="#990803" change="+0.4" trend="up" />
          <StatCard icon={AlertTriangle} label="Quận/Huyện cần can thiệp"
            value={districtBelow40} color="#dc2626"
            subtitle="Bao phủ STEM < 40%" />
          <StatCard icon={Download} label="Báo cáo đã xuất"
            value={activeReports.length} color="#64748b" />
        </div>
      )}

      {/* ── Heatmap / District panel ── */}
      {isBo ? (
        <VietnamChoropleth
          data={HEATMAP_GRID.map(p => ({ name: p.name, coverage: p.coverage, score: p.score }))}
          selectedProvince={selectedProvince}
          onSelectProvince={handleProvinceChange}
        />
      ) : (
        <DistrictCoveragePanel
          province={myProvince || "Hà Nội"}
          selectedDistrict={selectedDistrict}
          onClearDistrict={() => handleDistrictChange("all")}
          selectedSchool={selectedSchool}
          onClearSchool={() => setSelectedSchool("all")}
        />
      )}

      {/* ── Chart row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Chỉ số STEM theo tháng — {schoolYear}</h3>
            <div className="flex items-center gap-1 bg-secondary/60 rounded-lg p-0.5">
              {(["both", "coverage", "quality"] as ChartMode[]).map(mode => (
                <button key={mode} onClick={() => setChartMode(mode)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    chartMode === mode ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ fontSize: "11px", fontWeight: 500 }}>
                  {mode === "both" ? "Cả hai" : mode === "coverage" ? "Bao phủ" : "Điểm TB"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            {chartMode === "both" ? (
              <ComposedChart data={filteredMonthlyData}>
                <defs>
                  <linearGradient id="covGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {CHART_GRID}{X_AXIS}<Tooltip />
                {/* domain [40,100]: coverage 65-76 → 42-60% từ dưới (giữa chart) */}
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} domain={[40, 100]}
                  tickFormatter={v => `${v}%`} />
                {/* domain [5,8]: quality 7.x → 60-90% từ dưới (phần trên chart) */}
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[5, 8]}
                  tickFormatter={v => v.toFixed(1)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area yAxisId="left" type="monotone" dataKey="coverage" stroke="#7c3aed"
                  fill="url(#covGrad)" strokeWidth={2} name="Bao phủ (%)" />
                <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#c8a84e"
                  strokeWidth={2.5} dot={{ r: 3, fill: "#c8a84e" }} name="Điểm TB" />
              </ComposedChart>
            ) : chartMode === "coverage" ? (
              <AreaChart data={filteredMonthlyData}>
                <defs>
                  <linearGradient id="covGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                {CHART_GRID}{X_AXIS}<Tooltip />
                <YAxis tick={{ fontSize: 11 }} domain={[50, 100]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="coverage" stroke="#7c3aed"
                  fill="url(#covGrad2)" strokeWidth={2} name="Bao phủ (%)" />
              </AreaChart>
            ) : (
              <LineChart data={filteredMonthlyData}>
                {CHART_GRID}{X_AXIS}<Tooltip />
                <YAxis tick={{ fontSize: 11 }} domain={[6, 10]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="quality" stroke="#c8a84e"
                  strokeWidth={2} dot={{ r: 4 }} name="Điểm STEM TB" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Phân bổ khối trường</h3>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={displayTiers} dataKey="value" cx="50%" cy="50%"
                innerRadius={36} outerRadius={72} paddingAngle={3}
                labelLine={false} label={renderPieLabel}>
                {displayTiers.map((d, i) => <Cell key={i} fill={d.fill} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatNumberCompact(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {displayTiers.map(t => {
              const total = displayTiers.reduce((s, x) => s + x.value, 0);
              const pct   = total > 0 ? Math.round(t.value / total * 100) : 0;
              return (
                <div key={t.name} className="flex items-center gap-1.5" style={{ fontSize: "11px" }}>
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: t.fill }} />
                  <span className="flex-1 text-muted-foreground truncate">{t.name}</span>
                  <span className="text-muted-foreground/50 mr-0.5">{pct}%</span>
                  <strong>{formatNumberCompact(t.value)}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Top provinces / Top districts ── */}
      {isBo ? (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Top 10 tỉnh/thành phố — Bao phủ STEM & Điểm trung bình
          </h3>
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={topProvinces} layout="vertical" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <YAxis type="category" dataKey="province" width={130} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v: number, name: string) =>
                  name === "Điểm TB (×10)" ? [`${(v / 10).toFixed(1)}`, "Điểm STEM TB"] : [`${v}%`, name]
                }
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="stemCoveragePct" name="Bao phủ (%)" radius={[0, 4, 4, 0]} maxBarSize={14}>
                {topProvinces.map((p, i) => (
                  <Cell key={i} fill={p.province === highlightProvince ? "#7c3aed" : "#818cf8"} />
                ))}
              </Bar>
              <Bar dataKey="scoreScaled" name="Điểm TB (×10)" radius={[0, 4, 4, 0]} maxBarSize={14}>
                {topProvinces.map((p, i) => (
                  <Cell key={i} fill={p.province === highlightProvince ? "#c8a84e" : "#fbbf24"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : selectedDistrict !== "all" ? (
        /* ── Drill-down: top trường trong quận ── */
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 600 }}>
                {selectedSchool !== "all" ? `Chi tiết trường — ${selectedSchool}` : `Top trường — ${selectedDistrict}`}
              </h3>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
                {selectedSchool !== "all" ? selectedDistrict : `Sắp xếp theo ${distChartMetric === "stemCoverage" ? "bao phủ STEM" : distChartMetric === "tt38Compliance" ? "tuân thủ TT38" : "điểm TB"}`}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-secondary/60 rounded-lg p-0.5">
              {(["stemCoverage", "tt38Compliance", "scoreScaled"] as const).map(m => (
                <button key={m} onClick={() => setDistChartMetric(m)}
                  className={`px-2.5 py-1 rounded-md transition-all ${distChartMetric === m ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  style={{ fontSize: "11px", fontWeight: 500 }}>
                  {m === "stemCoverage" ? "Bao phủ %" : m === "tt38Compliance" ? "TT38 %" : "Điểm TB"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={districtChartData} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} domain={distChartMetric === "scoreScaled" ? [50, 100] : [0, 100]}
                tickFormatter={v => distChartMetric === "scoreScaled" ? (v / 10).toFixed(1) : `${v}`} />
              <YAxis type="category" dataKey="name" width={115} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => distChartMetric === "scoreScaled" ? [`${(v / 10).toFixed(1)}`, "Điểm STEM TB"] : distChartMetric === "tt38Compliance" ? [`${v}%`, "Tuân thủ TT38"] : [`${v}%`, "Bao phủ STEM"]} />
              <Bar dataKey={distChartMetric} radius={[0, 4, 4, 0]} maxBarSize={22}
                label={(props: { x: number; y: number; width: number; height: number; value: number }) => {
                  const { x, y, width, height, value } = props;
                  const txt = distChartMetric === "scoreScaled" ? (value / 10).toFixed(1) : `${value}%`;
                  return width < 24
                    ? <text x={x + width + 4} y={y + height / 2} fill="var(--foreground)" textAnchor="start" dominantBaseline="central" style={{ fontSize: "10px", fontWeight: 700 }}>{txt}</text>
                    : <text x={x + width - 6} y={y + height / 2} fill="white" textAnchor="end" dominantBaseline="central" style={{ fontSize: "10px", fontWeight: 700 }}>{txt}</text>;
                }}>
                {districtChartData.map((d, i) => {
                  const rawVal = distChartMetric === "scoreScaled" ? (d as any).scoreScaled / 10 : (d as any)[distChartMetric] as number;
                  const color  = distChartMetric === "scoreScaled" ? (rawVal >= 7.5 ? "#16a34a" : rawVal >= 6.5 ? "#ca8a04" : "#dc2626") : districtColor(rawVal);
                  return <Cell key={i} fill={color} fillOpacity={selectedSchool !== "all" && d.name !== selectedSchool ? 0.3 : 1} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-muted-foreground mt-2 flex items-center gap-4 flex-wrap" style={{ fontSize: "10.5px" }}>
            {selectedSchool !== "all"
              ? <span>■ <span style={{ fontWeight: 600 }}>Đang xem</span> &nbsp;<span style={{ opacity: 0.4 }}>■ Các trường khác</span></span>
              : <span>Màu theo mức hiệu suất · Chọn trường để xem chi tiết</span>}
          </p>
        </div>
      ) : (
        /* ── Ranking compact: top 5 tốt / 5 cần can thiệp ── */
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Xếp hạng Quận/Huyện — {myProvince}</h3>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
                {HN_DISTRICT_STATS.length} quận/huyện · Chọn để xem trường
              </p>
            </div>
            <div className="flex items-center gap-1 bg-secondary/60 rounded-lg p-0.5">
              {(["stemCoverage", "tt38Compliance", "scoreScaled"] as const).map(m => (
                <button key={m} onClick={() => setDistChartMetric(m)}
                  className={`px-2.5 py-1 rounded-md transition-all ${distChartMetric === m ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  style={{ fontSize: "11px", fontWeight: 500 }}>
                  {m === "stemCoverage" ? "Bao phủ" : m === "tt38Compliance" ? "TT38" : "Điểm TB"}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const yCov   = YEAR_COV_FACTOR[schoolYear];
            const yScore = YEAR_SCORE_FACTOR[schoolYear];
            const tScale = selectedTiers.length > 0 ? 0.6 + tierRatio * 0.4 : 1;
            const ranked = [...HN_DISTRICT_STATS].map(d => ({
              name:    d.name,
              schools: d.schools,
              val: distChartMetric === "scoreScaled"
                ? +(d.avgScore * yScore)
                : distChartMetric === "tt38Compliance"
                ? Math.min(100, Math.round(d.tt38Compliance * yCov * tScale))
                : Math.min(100, Math.round(d.stemCoverage   * yCov * tScale)),
            })).sort((a, b) => b.val - a.val);

            const top5  = ranked.slice(0, 5);
            const bot5  = [...ranked].reverse().slice(0, 5);
            const maxVal = distChartMetric === "scoreScaled" ? 10 : 100;

            const RankRow = ({ d, rank, good }: { d: typeof top5[0]; rank: number; good: boolean }) => {
              const label  = distChartMetric === "scoreScaled" ? d.val.toFixed(1) : `${d.val}%`;
              const color  = good
                ? (d.val >= (distChartMetric === "scoreScaled" ? 7.5 : 75) ? "#16a34a" : "#65a30d")
                : (d.val < (distChartMetric === "scoreScaled" ? 6.5 : 45) ? "#dc2626" : "#f59e0b");
              return (
                <button
                  onClick={() => setSelectedDistrict(d.name)}
                  className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                >
                  <span className="text-muted-foreground shrink-0" style={{ fontSize: "10px", width: 14, textAlign: "right" }}>{rank}</span>
                  <span className="shrink-0 font-medium truncate group-hover:text-violet-600 transition-colors" style={{ fontSize: "12px", width: 100 }}>{d.name}</span>
                  <div className="flex-1 h-4 rounded-md overflow-hidden" style={{ background: "var(--muted)" }}>
                    <div className="h-full rounded-md transition-all duration-500"
                      style={{ width: `${(d.val / maxVal) * 100}%`, background: color, opacity: 0.85 }} />
                  </div>
                  <span className="shrink-0 font-semibold" style={{ fontSize: "11px", width: 36, textAlign: "right", color }}>{label}</span>
                  <span className="shrink-0 text-muted-foreground" style={{ fontSize: "10px", width: 48, textAlign: "right" }}>{d.schools} trường</span>
                </button>
              );
            };

            return (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="flex items-center gap-1.5 mb-2 font-semibold" style={{ fontSize: "11.5px", color: "#15803d" }}>
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" />Dẫn đầu
                  </p>
                  <div className="space-y-0.5">
                    {top5.map((d, i) => <RankRow key={d.name} d={d} rank={i + 1} good={true} />)}
                  </div>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 mb-2 font-semibold" style={{ fontSize: "11.5px", color: "#b91c1c" }}>
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500" />Cần can thiệp
                  </p>
                  <div className="space-y-0.5">
                    {bot5.map((d, i) => <RankRow key={d.name} d={d} rank={HN_DISTRICT_STATS.length - i} good={false} />)}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Recent reports ── */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Báo cáo gần đây</h3>
          <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{activeReports.length} báo cáo</span>
        </div>
        <div className="divide-y divide-border">
          {activeReports.slice(0, 5).map(r => {
            const badge = getReportBadge(r.scope);
            return (
              <div key={r.id} className="p-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{r.name}</p>
                    <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                    {r.period} · xuất {formatRelative(r.generatedAt)}
                  </p>
                </div>
                <button onClick={() => downloadReport(r)}
                  className="p-1.5 hover:bg-secondary rounded flex-shrink-0" title="Tải xuống CSV">
                  <Download className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RegionalEducationDashboard;
