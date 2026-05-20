import { useMemo } from "react";
import {
  BarChart3, Download, TrendingUp, GraduationCap, Users, Award,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { scheduleEntries, tenantsByType, STEM_PROGRAMS } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  SCHOOL STEM EFFECTIVENESS REPORT                                */
/* ================================================================ */

export function SchoolSTEMEffectivenessReport() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const entries = scheduleEntries.filter((e) => e.schoolId === tenantId);

  // Mock score theo chương trình
  const programScores = useMemo(() =>
    (Object.keys(STEM_PROGRAMS) as Array<keyof typeof STEM_PROGRAMS>).map((k) => {
      const p = STEM_PROGRAMS[k];
      const count = entries.filter((e) => e.programCode === k).length;
      return {
        code: k,
        name: p.shortName,
        tiet: count,
        diem: 6 + ((k.charCodeAt(0) * 7) % 35) / 10,
        fill: p.color,
      };
    }), [entries]);

  const monthlyCompletion = useMemo(() => {
    return [
      { month: "T11/25", completion: 72, attendance: 88 },
      { month: "T12/25", completion: 78, attendance: 90 },
      { month: "T1/26",  completion: 81, attendance: 91 },
      { month: "T2/26",  completion: 85, attendance: 92 },
      { month: "T3/26",  completion: 88, attendance: 94 },
      { month: "T4/26",  completion: 91, attendance: 95 },
    ];
  }, []);

  const skillsRadar = useMemo(() => ([
    { skill: "Sáng tạo", value: 82 },
    { skill: "Tư duy phản biện", value: 78 },
    { skill: "Hợp tác", value: 85 },
    { skill: "Giao tiếp", value: 80 },
    { skill: "Giải quyết vấn đề", value: 76 },
    { skill: "Tư duy kỹ sư", value: 72 },
  ]), []);

  const totalLessons = entries.length;
  const totalClasses = new Set(entries.map((e) => e.classId)).size;
  const totalTeachers = new Set(entries.map((e) => e.teacherId)).size;
  const avgDiem = (programScores.reduce((s, p) => s + p.diem, 0) / programScores.length).toFixed(1);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={BarChart3}
        title="Báo cáo Hiệu quả STEM"
        subtitle="Theo dõi kết quả học tập, điểm thi STEM của HS và hiệu quả triển khai tại trường."
        accentColor="#2563eb"
        actions={
          <button onClick={() => toast.info("Xuất báo cáo theo chuẩn Thông tư Bộ GD&ĐT")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={BarChart3} label="Tiết STEM/tuần" value={totalLessons} color="#2563eb" />
        <KpiCard icon={GraduationCap} label="Giáo viên triển khai" value={totalTeachers} color="#7c3aed" />
        <KpiCard icon={Users} label="Lớp có STEM" value={totalClasses} color="#c8a84e" />
        <KpiCard icon={TrendingUp} label="Điểm STEM TB" value={avgDiem} change="+0.4" trend="up" color="#16a34a" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Điểm STEM trung bình theo chương trình
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={programScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="code" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => v.toFixed(2)} />
              <Bar dataKey="diem" radius={[6, 6, 0, 0]}>
                {programScores.map((p, i) => (
                  <Bar key={i} fill={p.fill} dataKey="diem" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-2">
            {programScores.map((p) => (
              <div key={p.code} className="flex items-center gap-1.5" style={{ fontSize: "11px" }}>
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: p.fill }} />
                <span>{p.code}: {p.tiet} tiết</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Tỷ lệ hoàn thành & Chuyên cần theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="completion" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4 }} name="Hoàn thành" />
              <Line type="monotone" dataKey="attendance" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} name="Chuyên cần" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-foreground mb-3 flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
          <Award className="w-4 h-4 text-[#c8a84e]" />
          6 năng lực cốt lõi STEM phát triển (radar)
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={skillsRadar}>
            <PolarGrid stroke="rgba(0,0,0,0.1)" />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar name="Trung bình trường" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.35} />
            <Tooltip formatter={(v: number) => `${v}%`} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SchoolSTEMEffectivenessReport;
