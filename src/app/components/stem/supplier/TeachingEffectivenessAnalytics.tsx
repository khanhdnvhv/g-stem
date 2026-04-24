import { useMemo } from "react";
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
import { toast } from "sonner";

/* ================================================================ */
/*  TEACHING EFFECTIVENESS ANALYTICS (Supplier)                     */
/*  Cross-school analytics — hiệu quả giảng dạy toàn mạng lưới      */
/* ================================================================ */

export function TeachingEffectivenessAnalytics() {
  // Mock cross-school metrics
  const byProgram = useMemo(() =>
    (Object.keys(STEM_PROGRAMS) as StemProgram[]).map((k) => {
      const p = STEM_PROGRAMS[k];
      return {
        code: k,
        name: p.shortName,
        lessons: 80 + ((k.charCodeAt(0) * 17) % 120),
        avgScore: 6.8 + ((k.charCodeAt(0) * 11) % 25) / 10,
        engagement: 60 + ((k.charCodeAt(0) * 7) % 35),
        fill: p.color,
      };
    }), []
  );

  const topSchools = [...tenantsByType.school]
    .slice(0, 8)
    .map((t, i) => ({
      school: t.name.length > 25 ? t.name.slice(0, 25) + "..." : t.name,
      lessons: 120 + (i * 37) % 300,
      avgScore: 7 + ((i * 13) % 25) / 10,
    }))
    .sort((a, b) => b.lessons - a.lessons);

  const monthly = [
    { month: "T11/25", lessons: 850, avgScore: 7.5 },
    { month: "T12/25", lessons: 920, avgScore: 7.6 },
    { month: "T1/26", lessons: 1080, avgScore: 7.7 },
    { month: "T2/26", lessons: 1240, avgScore: 7.8 },
    { month: "T3/26", lessons: 1380, avgScore: 7.9 },
    { month: "T4/26", lessons: 1520, avgScore: 8.1 },
  ];

  const skills = [
    { skill: "Sáng tạo",  value: 82 },
    { skill: "Phản biện", value: 75 },
    { skill: "Hợp tác",   value: 85 },
    { skill: "Giao tiếp", value: 78 },
    { skill: "GQVĐ",      value: 73 },
    { skill: "Kỹ sư",     value: 76 },
  ];

  const totalLessons = byProgram.reduce((s, p) => s + p.lessons, 0);
  const avgScore = (byProgram.reduce((s, p) => s + p.avgScore, 0) / byProgram.length).toFixed(2);
  const avgEngagement = Math.round(byProgram.reduce((s, p) => s + p.engagement, 0) / byProgram.length);

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={BookOpen} label="Tiết STEM đã dạy" value={totalLessons.toLocaleString()} color="#990803" change="+18%" trend="up" />
        <KpiCard icon={TrendingUp} label="Điểm TB toàn mạng" value={avgScore} color="#16a34a" change="+0.4" trend="up" />
        <KpiCard icon={Activity} label="Engagement TB" value={`${avgEngagement}%`} color="#2563eb" />
        <KpiCard icon={Users} label="Trường báo cáo" value={tenantsByType.school.length} color="#c8a84e" />
      </div>

      {/* Program + Monthly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Target className="w-4 h-4 inline mr-1.5" />
            Hiệu quả theo chương trình
          </h3>
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

      {/* Trend */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Xu hướng 6 tháng</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" domain={[6, 10]} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="left" type="monotone" dataKey="lessons" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} name="Tiết STEM" />
            <Line yAxisId="right" type="monotone" dataKey="avgScore" stroke="#c8a84e" strokeWidth={2.5} dot={{ r: 3 }} name="Điểm TB" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top schools */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          <BarChart3 className="w-4 h-4 inline mr-1.5" />
          Top trường triển khai nhiều tiết STEM nhất
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topSchools} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="school" width={200} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="lessons" fill="#990803" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Program comparison cards */}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeachingEffectivenessAnalytics;
