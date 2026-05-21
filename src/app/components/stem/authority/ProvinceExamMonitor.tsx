import { useMemo, useState } from "react";
import {
  ClipboardList, Download, Users, TrendingUp, Award,
  AlertTriangle, CheckCircle2, Clock, Search,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, LineChart, Line, Legend,
} from "recharts";
import { useAuth } from "./authority-ui";
import { PageHeader, KpiCard } from "./authority-ui";
import { toast } from "sonner";

/* ================================================================ */
/*  PROVINCE EXAM MONITOR — Giám sát Kỳ thi STEM toàn tỉnh          */
/* ================================================================ */

const ACCENT = "#7c3aed";

/* ── Mock: tổng hợp kỳ thi theo trường ── */
interface SchoolExamSummary {
  schoolId: string;
  schoolName: string;
  district: string;
  tier: "Mầm non" | "Tiểu học" | "THCS" | "THPT" | "THPT Nghề";
  totalExams: number;
  participated: number;
  avgScore: number;
  passRate: number;
  lastExamDate: string;
  status: "active" | "no-exam";
}

const SCHOOL_EXAM_DATA: SchoolExamSummary[] = [
  { schoolId:"T-SCH-01", schoolName:"THCS Cầu Giấy",             district:"Cầu Giấy",    tier:"THCS",      totalExams:24, participated:312, avgScore:8.2, passRate:94, lastExamDate:"2026-05-10", status:"active" },
  { schoolId:"T-SCH-02", schoolName:"THPT Chu Văn An",            district:"Tây Hồ",     tier:"THPT",      totalExams:18, participated:498, avgScore:8.5, passRate:96, lastExamDate:"2026-05-12", status:"active" },
  { schoolId:"T-SCH-03", schoolName:"Tiểu học Đống Đa",           district:"Đống Đa",    tier:"Tiểu học",  totalExams:30, participated:640, avgScore:8.0, passRate:91, lastExamDate:"2026-05-08", status:"active" },
  { schoolId:"T-SCH-04", schoolName:"THCS Hai Bà Trưng",          district:"Hai Bà Trưng",tier:"THCS",     totalExams:20, participated:275, avgScore:7.6, passRate:85, lastExamDate:"2026-05-09", status:"active" },
  { schoolId:"T-SCH-05", schoolName:"THPT Lý Thường Kiệt",        district:"Hoàn Kiếm",  tier:"THPT",      totalExams:15, participated:420, avgScore:8.8, passRate:97, lastExamDate:"2026-05-11", status:"active" },
  { schoolId:"T-SCH-06", schoolName:"Tiểu học Kim Liên",          district:"Đống Đa",    tier:"Tiểu học",  totalExams:28, participated:580, avgScore:7.8, passRate:88, lastExamDate:"2026-05-07", status:"active" },
  { schoolId:"T-SCH-07", schoolName:"THCS Thanh Xuân",            district:"Thanh Xuân", tier:"THCS",      totalExams:22, participated:290, avgScore:7.4, passRate:82, lastExamDate:"2026-05-05", status:"active" },
  { schoolId:"T-SCH-08", schoolName:"THPT Nguyễn Huệ",            district:"Hà Đông",    tier:"THPT",      totalExams:12, participated:310, avgScore:7.1, passRate:79, lastExamDate:"2026-04-28", status:"active" },
  { schoolId:"T-SCH-09", schoolName:"Tiểu học Mê Linh A",         district:"Mê Linh",    tier:"Tiểu học",  totalExams:8,  participated:140, avgScore:6.5, passRate:68, lastExamDate:"2026-04-20", status:"active" },
  { schoolId:"T-SCH-10", schoolName:"THCS Sóc Sơn",               district:"Sóc Sơn",    tier:"THCS",      totalExams:6,  participated:85,  avgScore:6.1, passRate:61, lastExamDate:"2026-04-15", status:"active" },
  { schoolId:"T-SCH-11", schoolName:"Tiểu học Phúc Thọ B",        district:"Phúc Thọ",   tier:"Tiểu học",  totalExams:4,  participated:60,  avgScore:5.8, passRate:55, lastExamDate:"2026-03-30", status:"active" },
  { schoolId:"T-SCH-12", schoolName:"THPT Nghề Đông Anh",         district:"Đông Anh",   tier:"THPT Nghề", totalExams:3,  participated:45,  avgScore:5.5, passRate:48, lastExamDate:"2026-03-25", status:"active" },
  { schoolId:"T-SCH-13", schoolName:"Tiểu học Thường Tín C",      district:"Thường Tín", tier:"Tiểu học",  totalExams:0,  participated:0,   avgScore:0,   passRate:0,  lastExamDate:"—",          status:"no-exam" },
  { schoolId:"T-SCH-14", schoolName:"THCS Ba Vì",                 district:"Ba Vì",      tier:"THCS",      totalExams:0,  participated:0,   avgScore:0,   passRate:0,  lastExamDate:"—",          status:"no-exam" },
  { schoolId:"T-SCH-15", schoolName:"Mầm non Đan Phượng",         district:"Đan Phượng", tier:"Mầm non",   totalExams:0,  participated:0,   avgScore:0,   passRate:0,  lastExamDate:"—",          status:"no-exam" },
];

/* ── Mock: kỳ thi đang & sắp diễn ra ── */
interface UpcomingExam {
  id: string;
  title: string;
  program: string;
  schoolName: string;
  district: string;
  examDate: string;
  participants: number;
  status: "ongoing" | "scheduled" | "completed";
}

const UPCOMING_EXAMS: UpcomingExam[] = [
  { id:"EX-001", title:"KT Học kỳ 2 — Toán STEM",          program:"CT1", schoolName:"THCS Cầu Giấy",       district:"Cầu Giấy",    examDate:"2026-05-18", participants:312, status:"ongoing" },
  { id:"EX-002", title:"KT Học kỳ 2 — Khoa học TN STEM",   program:"CT1", schoolName:"THPT Chu Văn An",     district:"Tây Hồ",     examDate:"2026-05-18", participants:498, status:"ongoing" },
  { id:"EX-003", title:"KT Cuối kỳ — Robotics & AI",       program:"CT4", schoolName:"THCS Hai Bà Trưng",   district:"Hai Bà Trưng",examDate:"2026-05-19", participants:275, status:"scheduled" },
  { id:"EX-004", title:"KT Giữa kỳ — Sáng tạo STEM",       program:"CT3", schoolName:"THPT Lý Thường Kiệt", district:"Hoàn Kiếm",  examDate:"2026-05-20", participants:420, status:"scheduled" },
  { id:"EX-005", title:"KT Cuối chương — Liên môn STEM",   program:"CT2", schoolName:"Tiểu học Đống Đa",    district:"Đống Đa",    examDate:"2026-05-21", participants:640, status:"scheduled" },
  { id:"EX-006", title:"KT Học kỳ 2 — Nghiên cứu KH",      program:"CT5", schoolName:"THPT Nguyễn Huệ",     district:"Hà Đông",    examDate:"2026-05-15", participants:310, status:"completed" },
  { id:"EX-007", title:"KT Cuối kỳ — Toán STEM",           program:"CT1", schoolName:"Tiểu học Kim Liên",   district:"Đống Đa",    examDate:"2026-05-14", participants:580, status:"completed" },
];

/* ── Mock: trend điểm TB theo tháng × chương trình ── */
const SCORE_TREND = [
  { month: "T1",  ct1: 7.2, ct2: 7.0, ct3: 6.8, ct4: 7.1 },
  { month: "T2",  ct1: 7.3, ct2: 7.1, ct3: 6.9, ct4: 7.2 },
  { month: "T3",  ct1: 7.5, ct2: 7.3, ct3: 7.0, ct4: 7.4 },
  { month: "T4",  ct1: 7.6, ct2: 7.4, ct3: 7.2, ct4: 7.5 },
  { month: "T5",  ct1: 7.8, ct2: 7.5, ct3: 7.3, ct4: 7.6 },
];

/* ── Score distribution ── */
const SCORE_DIST = [
  { range: "< 5.0",   count: 87,  fill: "#dc2626" },
  { range: "5.0–6.4", count: 234, fill: "#f97316" },
  { range: "6.5–7.9", count: 892, fill: "#c8a84e" },
  { range: "8.0–8.9", count: 1240,fill: "#2563eb" },
  { range: "9.0–10",  count: 647, fill: "#16a34a" },
];

type Tab = "overview" | "schools" | "upcoming" | "trend";

const PROGRAM_COLORS: Record<string, string> = {
  CT1: "#7c3aed", CT2: "#2563eb", CT3: "#16a34a", CT4: "#c8a84e", CT5: "#0891b2",
};

const STATUS_CFG = {
  ongoing:   { label: "Đang diễn ra", color: "#16a34a", bg: "#f0fdf4" },
  scheduled: { label: "Sắp diễn ra",  color: "#2563eb", bg: "#eff6ff" },
  completed: { label: "Hoàn thành",   color: "#64748b", bg: "#f8fafc" },
};

export function ProvinceExamMonitor() {
  const { user } = useAuth();
  const myProvince = user?.province || "Hà Nội";
  const [tab, setTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("Tất cả");

  const tiers = ["Tất cả", "Tiểu học", "THCS", "THPT", "THPT Nghề", "Mầm non"];

  const activeSchools = SCHOOL_EXAM_DATA.filter((s) => s.status === "active");
  const noExamSchools = SCHOOL_EXAM_DATA.filter((s) => s.status === "no-exam");
  const totalParticipated = activeSchools.reduce((s, x) => s + x.participated, 0);
  const avgScore = activeSchools.length
    ? (activeSchools.reduce((s, x) => s + x.avgScore * x.participated, 0) / totalParticipated).toFixed(1)
    : "0";
  const avgPassRate = activeSchools.length
    ? Math.round(activeSchools.reduce((s, x) => s + x.passRate, 0) / activeSchools.length)
    : 0;

  const filteredSchools = useMemo(() => {
    return SCHOOL_EXAM_DATA.filter((s) => {
      const matchSearch = s.schoolName.toLowerCase().includes(search.toLowerCase()) ||
                          s.district.toLowerCase().includes(search.toLowerCase());
      const matchTier = tierFilter === "Tất cả" || s.tier === tierFilter;
      return matchSearch && matchTier;
    }).sort((a, b) => b.avgScore - a.avgScore);
  }, [search, tierFilter]);

  const ongoingCount = UPCOMING_EXAMS.filter((e) => e.status === "ongoing").length;
  const scheduledCount = UPCOMING_EXAMS.filter((e) => e.status === "scheduled").length;

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview",  label: "Tổng quan" },
    { id: "schools",   label: "Theo trường" },
    { id: "upcoming",  label: `Lịch kỳ thi (${ongoingCount + scheduledCount})` },
    { id: "trend",     label: "Xu hướng điểm" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ClipboardList}
        title={`Giám sát Kỳ thi STEM — ${myProvince}`}
        subtitle="Theo dõi tất cả kỳ thi STEM đang diễn ra, kết quả và tỷ lệ tham gia toàn tỉnh"
        accentColor={ACCENT}
        actions={
          <button
            onClick={() => toast.info("Xuất báo cáo kỳ thi toàn tỉnh")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white hover:opacity-90"
            style={{ background: ACCENT, fontSize: "13px", fontWeight: 500 }}
          >
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={CheckCircle2}   label="Trường có kỳ thi"        value={activeSchools.length}            color="#16a34a" subtitle={`${noExamSchools.length} trường chưa tổ chức`} />
        <KpiCard icon={Users}          label="Lượt thi (HK này)"       value={totalParticipated.toLocaleString()} color="#2563eb" change="+12%" trend="up" />
        <KpiCard icon={Award}          label="Điểm STEM TB toàn tỉnh"  value={avgScore}                        color={ACCENT}   change="+0.4" trend="up" />
        <KpiCard icon={TrendingUp}     label="Tỷ lệ đạt (≥ 5.0)"      value={`${avgPassRate}%`}               color="#c8a84e" />
      </div>

      {/* Alert: schools with no exam */}
      {noExamSchools.length > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-orange-200 bg-orange-50">
          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-800">
              {noExamSchools.length} trường chưa tổ chức kỳ thi STEM trong học kỳ này
            </p>
            <p className="text-xs text-orange-600 mt-0.5">
              {noExamSchools.map((s) => s.schoolName).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={
              tab === t.id
                ? { background: "#fff", color: ACCENT, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                : { color: "var(--muted-foreground)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Tổng quan ── */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Score distribution */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-foreground font-semibold mb-3" style={{ fontSize: "14px" }}>
              Phân phối điểm thi toàn tỉnh
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={SCORE_DIST} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="range" style={{ fontSize: 11 }} />
                <YAxis style={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, "Số lượt thi"]} />
                <Bar dataKey="count" name="Số lượt thi" radius={[4, 4, 0, 0]}>
                  {SCORE_DIST.map((entry) => (
                    <Cell key={entry.range} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top 5 trường */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-foreground font-semibold mb-3" style={{ fontSize: "14px" }}>
              Top 5 trường — Điểm STEM TB cao nhất
            </h3>
            <div className="space-y-3">
              {[...activeSchools].sort((a, b) => b.avgScore - a.avgScore).slice(0, 5).map((s, i) => (
                <div key={s.schoolId} className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: i === 0 ? "#fef3c7" : i === 1 ? "#f1f5f9" : i === 2 ? "#fef9c3" : "#f3f4f6",
                      color: i === 0 ? "#d97706" : i === 1 ? "#64748b" : i === 2 ? "#c8a84e" : "#6b7280",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{s.schoolName}</span>
                      <span className="text-sm font-bold ml-2" style={{ color: ACCENT }}>{s.avgScore.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${s.avgScore * 10}%`, background: ACCENT }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{s.passRate}% đạt</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">Trường cần hỗ trợ (điểm TB &lt; 6.5)</h4>
              <div className="space-y-2">
                {activeSchools.filter((s) => s.avgScore < 6.5).map((s) => (
                  <div key={s.schoolId} className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-100">
                    <div>
                      <p className="text-sm font-medium text-red-800">{s.schoolName}</p>
                      <p className="text-xs text-red-600">{s.district} · {s.tier}</p>
                    </div>
                    <span className="text-sm font-bold text-red-600">{s.avgScore.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tổng hợp theo tier */}
          <div className="bg-card border border-border rounded-xl p-4 lg:col-span-2">
            <h3 className="text-foreground font-semibold mb-3" style={{ fontSize: "14px" }}>
              Kết quả thi theo cấp học
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Cấp học", "Số trường", "Tổng lượt thi", "Điểm TB", "Tỷ lệ đạt", "Số kỳ thi"].map((h) => (
                      <th key={h} className="text-left py-2 px-4 text-muted-foreground text-xs font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {(["Tiểu học", "THCS", "THPT", "THPT Nghề", "Mầm non"] as const).map((tier) => {
                    const schools = activeSchools.filter((s) => s.tier === tier);
                    if (!schools.length) return null;
                    const totalPart = schools.reduce((s, x) => s + x.participated, 0);
                    const avgS = (schools.reduce((s, x) => s + x.avgScore * x.participated, 0) / totalPart).toFixed(1);
                    const avgP = Math.round(schools.reduce((s, x) => s + x.passRate, 0) / schools.length);
                    const totalEx = schools.reduce((s, x) => s + x.totalExams, 0);
                    return (
                      <tr key={tier} className="border-b border-border/50 hover:bg-muted/40">
                        <td className="py-2.5 px-4 font-medium">{tier}</td>
                        <td className="py-2.5 px-4">{schools.length}</td>
                        <td className="py-2.5 px-4">{totalPart.toLocaleString()}</td>
                        <td className="py-2.5 px-4 font-semibold" style={{ color: Number(avgS) >= 8 ? "#16a34a" : Number(avgS) >= 7 ? ACCENT : "#dc2626" }}>
                          {avgS}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ color: avgP >= 90 ? "#16a34a" : avgP >= 75 ? "#2563eb" : "#dc2626", background: avgP >= 90 ? "#f0fdf4" : avgP >= 75 ? "#eff6ff" : "#fef2f2" }}>
                            {avgP}%
                          </span>
                        </td>
                        <td className="py-2.5 px-4">{totalEx}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Theo trường ── */}
      {tab === "schools" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm trường hoặc quận/huyện..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm w-64 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {tiers.map((t) => (
                <button key={t}
                  onClick={() => setTierFilter(t)}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                  style={tierFilter === t ? { background: "#fff", color: ACCENT, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" } : { color: "var(--muted-foreground)" }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {["Trường", "Quận/Huyện", "Cấp", "Số kỳ thi", "Lượt thi", "Điểm TB", "Tỷ lệ đạt", "Kỳ thi gần nhất", "Trạng thái"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-4 text-muted-foreground text-xs font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filteredSchools.map((s) => (
                  <tr key={s.schoolId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 font-medium">{s.schoolName}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{s.district}</td>
                    <td className="py-2.5 px-4">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted">{s.tier}</span>
                    </td>
                    <td className="py-2.5 px-4">{s.status === "no-exam" ? "—" : s.totalExams}</td>
                    <td className="py-2.5 px-4">{s.status === "no-exam" ? "—" : s.participated.toLocaleString()}</td>
                    <td className="py-2.5 px-4">
                      {s.status === "no-exam" ? "—" : (
                        <span className="font-semibold" style={{ color: s.avgScore >= 8 ? "#16a34a" : s.avgScore >= 6.5 ? "#2563eb" : "#dc2626" }}>
                          {s.avgScore.toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {s.status === "no-exam" ? "—" : (
                        <span className="text-xs font-medium" style={{ color: s.passRate >= 90 ? "#16a34a" : s.passRate >= 70 ? "#2563eb" : "#dc2626" }}>
                          {s.passRate}%
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground text-xs">{s.lastExamDate}</td>
                    <td className="py-2.5 px-4">
                      {s.status === "no-exam" ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 font-medium">
                          <AlertTriangle className="w-3 h-3" /> Chưa thi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Hoạt động
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSchools.length === 0 && (
              <div className="py-10 text-center text-muted-foreground text-sm">
                Không tìm thấy trường phù hợp
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Lịch kỳ thi ── */}
      {tab === "upcoming" && (
        <div className="space-y-4">
          {(["ongoing", "scheduled", "completed"] as const).map((statusKey) => {
            const exams = UPCOMING_EXAMS.filter((e) => e.status === statusKey);
            if (!exams.length) return null;
            const cfg = STATUS_CFG[statusKey];
            return (
              <div key={statusKey}>
                <div className="flex items-center gap-2 mb-3">
                  {statusKey === "ongoing"   && <Clock className="w-4 h-4" style={{ color: cfg.color }} />}
                  {statusKey === "scheduled" && <Clock className="w-4 h-4" style={{ color: cfg.color }} />}
                  {statusKey === "completed" && <CheckCircle2 className="w-4 h-4" style={{ color: cfg.color }} />}
                  <h3 className="font-semibold" style={{ fontSize: "14px", color: cfg.color }}>{cfg.label} ({exams.length})</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exams.map((exam) => (
                    <div key={exam.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                        style={{ background: PROGRAM_COLORS[exam.program] || ACCENT }}
                      >
                        {exam.program}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{exam.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{exam.schoolName} · {exam.district}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {exam.examDate}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" /> {exam.participants.toLocaleString()} học sinh
                          </span>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                        style={{ color: cfg.color, background: cfg.bg }}>
                        {cfg.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab: Xu hướng điểm ── */}
      {tab === "trend" && (
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-foreground font-semibold mb-1" style={{ fontSize: "14px" }}>
              Điểm STEM TB theo chương trình — 5 tháng gần nhất
            </h3>
            <p className="text-muted-foreground mb-4" style={{ fontSize: "12px" }}>
              So sánh điểm TB của 4 chương trình CT1–CT4 qua các kỳ thi trong tỉnh
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={SCORE_TREND} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" style={{ fontSize: 11 }} />
                <YAxis domain={[6, 9]} tickFormatter={(v) => `${v}`} style={{ fontSize: 11 }} />
                <Tooltip formatter={(v, name) => [v, name as string]} />
                <Legend />
                <Line type="monotone" dataKey="ct1" name="CT1 — Tích hợp nội môn" stroke={PROGRAM_COLORS.CT1} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="ct2" name="CT2 — Liên môn"          stroke={PROGRAM_COLORS.CT2} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="ct3" name="CT3 — Đổi mới sáng tạo"  stroke={PROGRAM_COLORS.CT3} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="ct4" name="CT4 — Robotics & AI"      stroke={PROGRAM_COLORS.CT4} strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { prog: "CT1", label: "Tích hợp nội môn",  score: 7.8, change: "+0.6", color: PROGRAM_COLORS.CT1 },
              { prog: "CT2", label: "Liên môn",           score: 7.5, change: "+0.5", color: PROGRAM_COLORS.CT2 },
              { prog: "CT3", label: "Đổi mới sáng tạo",  score: 7.3, change: "+0.5", color: PROGRAM_COLORS.CT3 },
              { prog: "CT4", label: "Robotics & AI",      score: 7.6, change: "+0.5", color: PROGRAM_COLORS.CT4 },
            ].map((p) => (
              <div key={p.prog} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ background: p.color }}>{p.prog}</span>
                  <span className="text-xs text-muted-foreground">{p.label}</span>
                </div>
                <p className="text-2xl font-bold" style={{ color: p.color }}>{p.score}</p>
                <p className="text-xs text-green-600 font-medium mt-1">{p.change} so với HK trước</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
