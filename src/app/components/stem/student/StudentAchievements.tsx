import {
  Sparkles, Trophy, Award, Bot, Target, CheckCircle2,
  TrendingUp, BarChart3, BookOpen, Lock,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";

/* ================================================================ */
/*  STUDENT ACHIEVEMENTS — chỉ hiển thị CT trường đã mua           */
/* ================================================================ */

/* Chỉ hiện CT trường đã mua — thay đổi mảng này theo từng trường */
const PURCHASED_PROGRAMS = [
  { code:"CT1", label:"CT1 – Tích hợp",   color:"#990803", diem:7.8, desc:"Tích hợp môn học"  },
  { code:"CT3", label:"CT3 – Tăng cường", color:"#7c3aed", diem:8.5, desc:"Lập trình & Sáng tạo" },
  { code:"CT4", label:"CT4 – Robotics",   color:"#f59e0b", diem:7.2, desc:"Robotics / AI / IoT" },
];

/* ─── Badges — chỉ liên quan CT đã mua ──────────────────────────── */
interface Badge {
  id: string; label: string; description: string;
  icon: string; color: string; earned: boolean;
}

const BADGES: Badge[] = [
  { id:"B1", label:"Người khám phá",     description:"Hoàn thành 5 bài CT1 đầu tiên",          icon:"🔍", color:"#64748b", earned:true  },
  { id:"B2", label:"Nhà sáng tạo STEM",  description:"Tạo sản phẩm STEM đầu tiên (CT3)",        icon:"💡", color:"#990803", earned:true  },
  { id:"B3", label:"Lập trình viên nhí", description:"Hoàn thành khóa Lập trình Scratch (CT3)", icon:"💻", color:"#7c3aed", earned:true  },
  { id:"B4", label:"Master Robotic",     description:"Lập trình 3 con robot thành công (CT4)",  icon:"🤖", color:"#f59e0b", earned:true  },
  { id:"B5", label:"Nhà toán học nhí",   description:"Đạt 9.0 ở tất cả bài kiểm tra Toán CT1", icon:"🔢", color:"#990803", earned:true  },
  { id:"B6", label:"Học sinh chăm chỉ",  description:"Hoàn thành bài đúng hạn 10 tuần liên tiếp", icon:"📅", color:"#2563eb", earned:false },
  { id:"B7", label:"Leader nhóm",        description:"Dẫn dắt nhóm hoàn thành 3 dự án STEM",   icon:"👑", color:"#c8a84e", earned:false },
  { id:"B8", label:"Siêu sao STEM",      description:"Điểm trung bình đạt trên 9.0",            icon:"⭐", color:"#f59e0b", earned:false },
];

/* ─── Skills ─────────────────────────────────────────────────────── */
const SKILLS = [
  { skill:"Sáng tạo",           value:85 },
  { skill:"Tư duy phản biện",   value:72 },
  { skill:"Hợp tác",            value:80 },
  { skill:"Giao tiếp",          value:75 },
  { skill:"Giải quyết vấn đề",  value:68 },
  { skill:"Tư duy kỹ sư",       value:78 },
];

/* ─── Tooltip tùy chỉnh cho bar chart ───────────────────────────── */
function CustomBarTooltip({ active, payload }: { active?: boolean; payload?: { payload: typeof PURCHASED_PROGRAMS[0]; value: number }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background:"#fff", border:`1.5px solid ${d.color}40`, borderRadius:10, padding:"10px 14px", fontSize:12, boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
      <div style={{ fontWeight:800, color:d.color, marginBottom:4 }}>{d.label}</div>
      <div style={{ color:"#374151" }}>{d.desc}</div>
      <div style={{ fontSize:16, fontWeight:900, color:d.color, marginTop:4 }}>{d.diem.toFixed(1)} / 10</div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */
export function StudentAchievements() {
  const earnedBadges  = BADGES.filter(b => b.earned);
  const strongest     = SKILLS.reduce((a, b) => a.value > b.value ? a : b);
  const weakest       = SKILLS.reduce((a, b) => a.value < b.value ? a : b);
  const bestProgram   = PURCHASED_PROGRAMS.reduce((a, b) => a.diem > b.diem ? a : b);
  const needsWork     = PURCHASED_PROGRAMS.reduce((a, b) => a.diem < b.diem ? a : b);

  // Tổng bài hoàn thành từ các CT đã mua
  const totalLessonsDone = 18 + 18 + 11 + 16 + 8 + 1 + 8; // CT1 (4 khóa) + CT3 (2 khóa) + CT4 (1 khóa)

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Sparkles}
        title="Thành tích của tôi"
        subtitle="Huy hiệu, chứng chỉ và phân tích năng lực học tập từ AI-Buddy."
        accentColor="#c8a84e"
        badge={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#990803]/15 text-[#990803] rounded" style={{ fontSize:"11px", fontWeight:600 }}>
            <Bot className="w-3 h-3" /> AI-Buddy phân tích
          </span>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Trophy}    label="Huy hiệu đạt được" value={`${earnedBadges.length}/${BADGES.length}`} color="#c8a84e" />
        <KpiCard icon={Award}     label="Chứng chỉ STEM"    value={1}                color="#16a34a" />
        <KpiCard icon={BookOpen}  label="Bài đã hoàn thành" value={totalLessonsDone} color="#990803" />
        <KpiCard icon={TrendingUp} label="Xếp hạng lớp"     value="5/32"             color="#990803" change="↑3" trend="up" />
      </div>

      {/* CT đã đăng ký — chip row */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", padding:"12px 16px", background:"#f9fafb", borderRadius:12, border:"1px solid #e5e7eb" }}>
        <span style={{ fontSize:12, color:"#6b7280", fontWeight:600 }}>Chương trình đã đăng ký:</span>
        {PURCHASED_PROGRAMS.map(p => (
          <span key={p.code} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, fontWeight:700, color:p.color, background:p.color+"15", padding:"5px 12px", borderRadius:99, border:`1px solid ${p.color}25` }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:p.color, display:"inline-block" }} />
            {p.label}
          </span>
        ))}
        <span style={{ fontSize:11, color:"#9ca3af", marginLeft:"auto" }}>CT2, CT5 — chưa đăng ký</span>
      </div>

      {/* AI-Buddy analysis */}
      <div className="bg-gradient-to-br from-[#990803]/10 to-[#990803]/5 rounded-xl border border-[#990803]/30 p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#990803]/20 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-[#990803]" />
          </div>
          <div className="flex-1">
            <p className="text-foreground" style={{ fontSize:"14px", fontWeight:700 }}>AI-Buddy nhận xét</p>
            <p className="text-muted-foreground mt-1" style={{ fontSize:"12.5px", lineHeight:1.7 }}>
              Điểm mạnh nhất của em là{" "}
              <strong style={{ color: bestProgram.color }}>{bestProgram.label}</strong>{" "}
              ({bestProgram.diem.toFixed(1)}/10) — xuất sắc! Năng lực cá nhân nổi bật là{" "}
              <strong className="text-[#990803]">{strongest.skill}</strong> ({strongest.value}%).{" "}
              Em nên dành thêm thời gian luyện tập{" "}
              <strong style={{ color: needsWork.color }}>{needsWork.label}</strong>{" "}
              ({needsWork.diem.toFixed(1)}/10) và cải thiện kỹ năng{" "}
              <strong className="text-[#d4183d]">{weakest.skill}</strong> ({weakest.value}%).{" "}
              Để đạt huy hiệu <strong>"Siêu sao STEM"</strong>, em cần nâng điểm TB lên 9.0 trong kỳ tới!
            </p>
          </div>
        </div>
      </div>

      {/* Radar + Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize:"14px", fontWeight:600 }}>
            <Target className="w-4 h-4 inline mr-1.5" /> 6 năng lực cốt lõi STEM
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={SKILLS}>
              <PolarGrid stroke="rgba(0,0,0,0.1)" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize:11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize:10 }} />
              <Radar name="Của em" dataKey="value" stroke="#990803" fill="#990803" fillOpacity={0.35} />
              <Tooltip formatter={(v: number) => `${v}%`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart — chỉ CT đã mua */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize:"14px", fontWeight:600 }}>
            <BarChart3 className="w-4 h-4 inline mr-1.5" /> Điểm TB theo chương trình đã đăng ký
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={PURCHASED_PROGRAMS} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.07)" vertical={false} />
              <XAxis dataKey="code" tick={{ fontSize:12, fontWeight:700 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill:"rgba(0,0,0,0.04)" }} />
              <Bar dataKey="diem" radius={[8, 8, 0, 0]}>
                {PURCHASED_PROGRAMS.map((p, i) => (
                  <Cell key={i} fill={p.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div style={{ marginTop:12, display:"flex", flexWrap:"wrap", gap:12 }}>
            {PURCHASED_PROGRAMS.map(p => (
              <div key={p.code} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ display:"inline-block", width:10, height:10, borderRadius:3, background:p.color }} />
                <span style={{ fontSize:11, fontWeight:700, color:p.color }}>{p.code}</span>
                <span style={{ fontSize:12, fontWeight:900, color:"#111827" }}>{p.diem.toFixed(1)}</span>
              </div>
            ))}
            <span style={{ fontSize:11, color:"#9ca3af", marginLeft:"auto", alignSelf:"center" }}>/ 10 điểm</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="mb-4" style={{ fontSize:"14px", fontWeight:600 }}>
          <Trophy className="w-4 h-4 inline mr-1.5" />
          Huy hiệu STEM ({earnedBadges.length}/{BADGES.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {BADGES.map(b => (
            <div key={b.id} style={{
              textAlign:"center", padding:"16px 12px", borderRadius:12,
              border: b.earned ? `1.5px solid ${b.color}40` : "1.5px dashed #e5e7eb",
              background: b.earned ? `linear-gradient(135deg,${b.color}08,transparent)` : "#fafafa",
              opacity: b.earned ? 1 : 0.65,
              transition:"transform .15s, box-shadow .15s",
            }}
              onMouseEnter={e => { if (b.earned) { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 4px 14px ${b.color}25`; } }}
              onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}>
              <div style={{ fontSize:32, marginBottom:6 }}>
                {b.earned ? b.icon : <Lock style={{ width:24, height:24, color:"#d1d5db", display:"inline" }} />}
              </div>
              <p style={{ fontSize:"11.5px", fontWeight:700, color: b.earned ? b.color : "#9ca3af" }}>
                {b.label}
              </p>
              <p style={{ fontSize:"10px", color:"#9ca3af", marginTop:4, lineHeight:1.4 }}>
                {b.description}
              </p>
              {b.earned && (
                <CheckCircle2 style={{ width:14, height:14, color:"#16a34a", display:"block", margin:"8px auto 0" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentAchievements;
