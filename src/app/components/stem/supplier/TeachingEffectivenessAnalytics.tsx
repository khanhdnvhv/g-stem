import { useState, useMemo } from "react";
import {
  BarChart3, TrendingUp, Download, Award, Users, Target,
  BookOpen, Activity,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { STEM_PROGRAMS, tenantsByType } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  TEACHING EFFECTIVENESS ANALYTICS (Supplier)                     */
/*  Cross-school analytics — hiệu quả giảng dạy toàn mạng lưới      */
/* ================================================================ */

type Period = "T11/25-T4/26" | "T5/25-T10/25" | "2025";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "T11/25-T4/26", label: "T11/25 – T4/26 (hiện tại)" },
  { value: "T5/25-T10/25", label: "T5/25 – T10/25" },
  { value: "2025",         label: "Cả năm 2025" },
];

const MONTHLY_BY_PERIOD: Record<Period, { month: string; lessons: number; avgScore: number }[]> = {
  "T11/25-T4/26": [
    { month: "T11/25", lessons: 850,  avgScore: 7.5 },
    { month: "T12/25", lessons: 920,  avgScore: 7.6 },
    { month: "T1/26",  lessons: 1080, avgScore: 7.7 },
    { month: "T2/26",  lessons: 1240, avgScore: 7.8 },
    { month: "T3/26",  lessons: 1380, avgScore: 7.9 },
    { month: "T4/26",  lessons: 1520, avgScore: 8.1 },
  ],
  "T5/25-T10/25": [
    { month: "T5/25",  lessons: 680,  avgScore: 7.1 },
    { month: "T6/25",  lessons: 720,  avgScore: 7.2 },
    { month: "T7/25",  lessons: 510,  avgScore: 7.0 },
    { month: "T8/25",  lessons: 490,  avgScore: 7.0 },
    { month: "T9/25",  lessons: 760,  avgScore: 7.3 },
    { month: "T10/25", lessons: 810,  avgScore: 7.4 },
  ],
  "2025": [
    { month: "T1/25",  lessons: 430,  avgScore: 6.9 },
    { month: "T2/25",  lessons: 380,  avgScore: 6.8 },
    { month: "T3/25",  lessons: 510,  avgScore: 7.0 },
    { month: "T4/25",  lessons: 560,  avgScore: 7.1 },
    { month: "T5/25",  lessons: 680,  avgScore: 7.1 },
    { month: "T6/25",  lessons: 720,  avgScore: 7.2 },
    { month: "T7/25",  lessons: 510,  avgScore: 7.0 },
    { month: "T8/25",  lessons: 490,  avgScore: 7.0 },
    { month: "T9/25",  lessons: 760,  avgScore: 7.3 },
    { month: "T10/25", lessons: 810,  avgScore: 7.4 },
    { month: "T11/25", lessons: 850,  avgScore: 7.5 },
    { month: "T12/25", lessons: 920,  avgScore: 7.6 },
  ],
};

export function TeachingEffectivenessAnalytics() {
  const [ctFilter, setCtFilter]           = useState<StemProgram | "all">("all");
  const [provinceFilter, setProvinceFilter] = useState<string>("all");
  const [period, setPeriod]               = useState<Period>("T11/25-T4/26");

  const provinces = useMemo(() =>
    Array.from(new Set(tenantsByType.school.map((t) => t.province ?? ""))).filter(Boolean),
  []);

  /* ── Per-program metrics, filtered ── */
  const byProgram = useMemo(() =>
    (Object.keys(STEM_PROGRAMS) as StemProgram[])
      .filter((k) => ctFilter === "all" || k === ctFilter)
      .map((k) => {
        const p = STEM_PROGRAMS[k];
        return {
          code: k,
          name: p.shortName,
          lessons:     80 + ((k.charCodeAt(2) * 17) % 120),
          avgScore:    6.8 + ((k.charCodeAt(2) * 11) % 25) / 10,
          engagement:  60 + ((k.charCodeAt(2) * 7) % 35),
          fill: p.color,
        };
      }),
  [ctFilter]);

  /* ── Top schools, filtered by province ── */
  const topSchools = useMemo(() => {
    const src = provinceFilter === "all"
      ? tenantsByType.school
      : tenantsByType.school.filter((t) => t.province === provinceFilter);
    return src.slice(0, 8).map((t, i) => ({
      school:   t.name.length > 25 ? t.name.slice(0, 25) + "…" : t.name,
      lessons:  120 + (i * 37) % 300,
      avgScore: 7 + ((i * 13) % 25) / 10,
    })).sort((a, b) => b.lessons - a.lessons);
  }, [provinceFilter]);

  const monthly = MONTHLY_BY_PERIOD[period];

  const skills = [
    { skill: "Sáng tạo",  value: 82 },
    { skill: "Phản biện", value: 75 },
    { skill: "Hợp tác",   value: 85 },
    { skill: "Giao tiếp", value: 78 },
    { skill: "GQVĐ",      value: 73 },
    { skill: "Kỹ sư",     value: 76 },
  ];

  const totalLessons   = byProgram.reduce((s, p) => s + p.lessons, 0);
  const avgScore       = byProgram.length
    ? (byProgram.reduce((s, p) => s + p.avgScore, 0) / byProgram.length).toFixed(2)
    : "—";
  const avgEngagement  = byProgram.length
    ? Math.round(byProgram.reduce((s, p) => s + p.engagement, 0) / byProgram.length)
    : 0;
  const schoolCount    = provinceFilter === "all"
    ? tenantsByType.school.length
    : tenantsByType.school.filter((t) => t.province === provinceFilter).length;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={BarChart3}
        title="Phân tích Hiệu quả Giảng dạy"
        subtitle="Dữ liệu cross-school về mức độ tương tác, kết quả học/thi STEM và hiệu quả triển khai thực tế tại các điểm trường."
        accentColor="#990803"
        actions={
          <button onClick={() => toast.success("Xuất báo cáo cho ban lãnh đạo")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        }
      />

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-card rounded-xl border border-border">
        {/* CT filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-muted-foreground shrink-0" style={{ fontSize: "11.5px", fontWeight: 600 }}>CT:</span>
          <button
            onClick={() => setCtFilter("all")}
            className={`px-2.5 py-1 rounded-lg border transition-all ${ctFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-secondary border-border hover:bg-secondary/80"}`}
            style={{ fontSize: "11px", fontWeight: 500 }}
          >
            Tất cả
          </button>
          {(Object.keys(STEM_PROGRAMS) as StemProgram[]).map((code) => {
            const p = STEM_PROGRAMS[code];
            const active = ctFilter === code;
            return (
              <button
                key={code}
                onClick={() => setCtFilter(active ? "all" : code)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${active ? "text-white border-transparent" : "bg-secondary border-border hover:bg-secondary/80"}`}
                style={{ fontSize: "11px", fontWeight: 500, ...(active ? { backgroundColor: p.color } : {}) }}
              >
                {code}
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-border" />

        {/* Province filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground shrink-0" style={{ fontSize: "11.5px", fontWeight: 600 }}>Tỉnh/TP:</span>
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="px-2.5 py-1 bg-secondary border border-border rounded-lg"
            style={{ fontSize: "11px" }}
          >
            <option value="all">Tất cả ({tenantsByType.school.length} trường)</option>
            {provinces.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="h-5 w-px bg-border" />

        {/* Period filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground shrink-0" style={{ fontSize: "11.5px", fontWeight: 600 }}>Kỳ:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="px-2.5 py-1 bg-secondary border border-border rounded-lg"
            style={{ fontSize: "11px" }}
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs — reactive to filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={BookOpen}  label="Tiết STEM đã dạy"  value={totalLessons.toLocaleString()} color="#990803" change="+18%" trend="up" />
        <KpiCard icon={TrendingUp} label="Điểm TB toàn mạng" value={avgScore}                       color="#16a34a" change="+0.4" trend="up" />
        <KpiCard icon={Activity}  label="Engagement TB"      value={`${avgEngagement}%`}             color="#2563eb" />
        <KpiCard icon={Users}     label="Trường báo cáo"     value={schoolCount}                     color="#c8a84e" />
      </div>

      {ctFilter !== "all" && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#990803]/5 border border-[#990803]/20 rounded-lg">
          <ProgramBadge code={ctFilter} size="sm" />
          <span className="text-muted-foreground" style={{ fontSize: "12px" }}>
            Đang lọc theo chương trình {ctFilter} — {STEM_PROGRAMS[ctFilter].name}
          </span>
          <button onClick={() => setCtFilter("all")} className="ml-auto text-[#990803]" style={{ fontSize: "11px", fontWeight: 500 }}>
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Program + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Target className="w-4 h-4 inline mr-1.5" />
            Hiệu quả theo chương trình
          </h3>
          {byProgram.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground" style={{ fontSize: "12px" }}>Không có dữ liệu</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byProgram}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                <XAxis dataKey="code" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="lessons" fill="#990803" name="Số tiết" radius={[6, 6, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#c8a84e" strokeWidth={2.5} dot={{ r: 4 }} name="Điểm TB" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Award className="w-4 h-4 inline mr-1.5" />
            6 năng lực cốt lõi toàn mạng
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={skills}>
              <PolarGrid stroke="rgba(0,0,0,0.1)" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Trung bình" dataKey="value" stroke="#990803" fill="#990803" fillOpacity={0.3} />
              <Tooltip formatter={(v: number) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend — period-aware */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          Xu hướng: {PERIOD_OPTIONS.find((o) => o.value === period)?.label}
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" domain={[6, 10]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="left"  type="monotone" dataKey="lessons"  stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} name="Tiết STEM" />
            <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#c8a84e" strokeWidth={2.5} dot={{ r: 3 }} name="Điểm TB" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top schools — province-aware */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          <BarChart3 className="w-4 h-4 inline mr-1.5" />
          Top trường triển khai nhiều tiết STEM nhất
          {provinceFilter !== "all" && (
            <span className="ml-2 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 400 }}>
              — {provinceFilter}
            </span>
          )}
        </h3>
        {topSchools.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground" style={{ fontSize: "12px" }}>Không có dữ liệu</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, topSchools.length * 36)}>
            <BarChart data={topSchools} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="school" width={200} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="lessons" fill="#990803" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Program cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {byProgram.map((p) => (
          <div key={p.code} className="bg-card rounded-xl border border-border p-3">
            <ProgramBadge code={p.code as StemProgram} size="md" showName />
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Tiết</span>
                <strong style={{ fontSize: "12px" }}>{p.lessons}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Điểm TB</span>
                <strong style={{ fontSize: "12px", color: p.fill }}>{p.avgScore.toFixed(1)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Engagement</span>
                <strong style={{ fontSize: "12px" }}>{p.engagement}%</strong>
              </div>
              <div className="mt-1.5">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.engagement}%`, backgroundColor: p.fill }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeachingEffectivenessAnalytics;
