import {
  Sparkles, Trophy, Award, Target, CheckCircle2,
  TrendingUp, BarChart3, BookOpen, Info,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { STEM_PROGRAMS } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";

/* ================================================================ */
/*  STUDENT ACHIEVEMENTS — AI-Buddy phân tích hồ sơ cá nhân         */
/* ================================================================ */

interface Badge {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
}

const BADGES: Badge[] = [
  { id: "B1", label: "Người khám phá",        description: "Hoàn thành 5 bài CT1 đầu tiên", icon: "🔍", color: "#64748b", earned: true },
  { id: "B2", label: "Nhà liên môn",          description: "Áp dụng kiến thức 2 bộ môn",   icon: "🔗", color: "#0891b2", earned: true },
  { id: "B3", label: "Nhà sáng tạo STEM",     description: "Tạo sản phẩm CT3 đầu tiên",    icon: "💡", color: "#7c3aed", earned: true },
  { id: "B4", label: "Master Robotic",        description: "Lập trình 3 con robot thành công", icon: "🤖", color: "#dc2626", earned: true },
  { id: "B5", label: "Tư duy Nghiên cứu",     description: "Hoàn thành đề tài NCKH CT5",   icon: "🧪", color: "#059669", earned: false },
  { id: "B6", label: "AI Whisperer",          description: "Huấn luyện 1 mô hình AI",      icon: "🧠", color: "#2563eb", earned: true },
  { id: "B7", label: "Leader nhóm",           description: "Dẫn dắt nhóm 3 dự án",         icon: "👑", color: "#c8a84e", earned: false },
  { id: "B8", label: "Siêu sao STEM",         description: "Điểm TB trên 9.0",             icon: "⭐", color: "#f59e0b", earned: false },
];

export function StudentAchievements() {
  const earnedBadges = BADGES.filter((b) => b.earned);

  // Điểm theo chương trình
  const byProgram = (Object.keys(STEM_PROGRAMS) as StemProgram[]).map((k) => ({
    code: k,
    name: STEM_PROGRAMS[k].shortName,
    diem: 6.5 + ((k.charCodeAt(0) * 13) % 30) / 10,
    fill: STEM_PROGRAMS[k].color,
  }));

  // 6 năng lực
  const skills = [
    { skill: "Sáng tạo", value: 85 },
    { skill: "Tư duy phản biện", value: 72 },
    { skill: "Hợp tác", value: 80 },
    { skill: "Giao tiếp", value: 75 },
    { skill: "Giải quyết vấn đề", value: 68 },
    { skill: "Tư duy kỹ sư", value: 78 },
  ];

  const strongest = skills.reduce((a, b) => (a.value > b.value ? a : b));
  const weakest = skills.reduce((a, b) => (a.value < b.value ? a : b));

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Sparkles}
        title="Thành tích của tôi"
        subtitle="Huy hiệu, chứng chỉ và phân tích năng lực học tập cá nhân."
        accentColor="#c8a84e"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Trophy} label="Huy hiệu đạt được" value={`${earnedBadges.length}/${BADGES.length}`} color="#c8a84e" />
        <KpiCard icon={Award} label="Chứng chỉ STEM" value={2} color="#16a34a" />
        <KpiCard icon={BookOpen} label="Bài đã hoàn thành" value={14} color="#2563eb" />
        <KpiCard icon={TrendingUp} label="Xếp hạng lớp" value="5/32" color="#990803" change="↑3" trend="up" />
      </div>

      {/* Phân tích học tập */}
      <div className="bg-gradient-to-br from-[#2563eb]/8 to-[#c8a84e]/5 rounded-xl border border-[#2563eb]/20 p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#2563eb]/15 flex items-center justify-center shrink-0">
            <Info className="w-6 h-6 text-[#2563eb]" />
          </div>
          <div className="flex-1">
            <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>Phân tích học tập</p>
            <p className="text-muted-foreground mt-1" style={{ fontSize: "12.5px", lineHeight: 1.6 }}>
              Điểm mạnh lớn nhất của bạn là <strong className="text-[#2563eb]">{strongest.skill}</strong> ({strongest.value}%).
              Bạn đã hoàn thành tốt các bài CT1 và đạt chứng chỉ CT3. Hãy tập trung cải thiện kỹ năng{" "}
              <strong className="text-[#dc2626]">{weakest.skill}</strong> ({weakest.value}%) bằng cách làm thêm bài tập thực hành nhóm.
              Để đạt "Siêu sao STEM", cần nâng điểm TB từ 8.3 → 9.0 trong kỳ tới.
            </p>
          </div>
        </div>
      </div>

      {/* Radar + Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Target className="w-4 h-4 inline mr-1.5" /> 6 năng lực cốt lõi STEM
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={skills}>
              <PolarGrid stroke="rgba(0,0,0,0.1)" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Của tôi" dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.35} />
              <Tooltip formatter={(v: number) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <BarChart3 className="w-4 h-4 inline mr-1.5" /> Điểm TB theo chương trình
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byProgram}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="code" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => v.toFixed(2)} />
              <Bar dataKey="diem" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-2">
            {byProgram.map((p) => (
              <div key={p.code} className="flex items-center gap-1.5" style={{ fontSize: "11px" }}>
                <ProgramBadge code={p.code as StemProgram} size="xs" />
                <strong>{p.diem.toFixed(1)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          <Trophy className="w-4 h-4 inline mr-1.5" />
          Huy hiệu STEM ({earnedBadges.length}/{BADGES.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {BADGES.map((b) => (
            <div key={b.id}
              className={`text-center p-3 rounded-lg border transition-all ${
                b.earned ? "border-[#c8a84e] bg-gradient-to-br from-[#c8a84e]/5 to-transparent" : "border-dashed border-border bg-secondary/30 opacity-60"
              }`}>
              <div className="text-3xl mb-1">{b.earned ? b.icon : "🔒"}</div>
              <p style={{ fontSize: "11.5px", fontWeight: 700, color: b.earned ? b.color : undefined }}>
                {b.label}
              </p>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10.5px" }}>
                {b.description}
              </p>
              {b.earned && (
                <CheckCircle2 className="w-3.5 h-3.5 mx-auto mt-1 text-[#16a34a]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentAchievements;
