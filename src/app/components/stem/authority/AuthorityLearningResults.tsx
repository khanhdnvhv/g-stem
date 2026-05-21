import { useMemo, useState } from "react";
import {
  GraduationCap, Download, TrendingUp, Award, Search, Users,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { useAuth } from "./authority-ui";
import { PageHeader, KpiCard } from "./authority-ui";
import { toast } from "sonner";

/* ================================================================ */
/*  AUTHORITY LEARNING RESULTS — Theo dõi Kết quả Học tập toàn tỉnh */
/* ================================================================ */

const ACCENT = "#7c3aed";

interface SchoolLearning {
  schoolId:       string;
  schoolName:     string;
  district:       string;
  tier:           string;
  students:       number;
  completionRate: number;  // % bài học hoàn thành
  avgScore:       number;
  passRate:       number;
  activeRate:     number;  // % học sinh đăng nhập tuần này
  topSubject:     string;
  weakSubject:    string;
}

const SCHOOL_LEARNING: SchoolLearning[] = [
  { schoolId:"S01", schoolName:"THCS Cầu Giấy",          district:"Cầu Giấy",     tier:"THCS",      students:452, completionRate:88, avgScore:8.2, passRate:94, activeRate:79, topSubject:"Toán STEM",    weakSubject:"Lý STEM" },
  { schoolId:"S02", schoolName:"THPT Chu Văn An",         district:"Tây Hồ",      tier:"THPT",      students:501, completionRate:91, avgScore:8.5, passRate:96, activeRate:84, topSubject:"CT4 Robotic",  weakSubject:"CT5 NCKH" },
  { schoolId:"S03", schoolName:"Tiểu học Đống Đa",        district:"Đống Đa",     tier:"Tiểu học",  students:415, completionRate:82, avgScore:8.0, passRate:91, activeRate:72, topSubject:"Toán STEM",    weakSubject:"Tin học STEM" },
  { schoolId:"S04", schoolName:"THCS Hai Bà Trưng",       district:"Hai Bà Trưng",tier:"THCS",      students:357, completionRate:76, avgScore:7.6, passRate:85, activeRate:65, topSubject:"Khoa học TN",  weakSubject:"Hóa STEM" },
  { schoolId:"S05", schoolName:"THPT Lý Thường Kiệt",     district:"Hoàn Kiếm",   tier:"THPT",      students:392, completionRate:93, avgScore:8.8, passRate:97, activeRate:88, topSubject:"CT5 NCKH",    weakSubject:"CT3 Sáng tạo" },
  { schoolId:"S06", schoolName:"Tiểu học Kim Liên",       district:"Đống Đa",     tier:"Tiểu học",  students:291, completionRate:79, avgScore:7.8, passRate:88, activeRate:68, topSubject:"Toán STEM",    weakSubject:"Công nghệ STEM" },
  { schoolId:"S07", schoolName:"THCS Thanh Xuân",         district:"Thanh Xuân",  tier:"THCS",      students:358, completionRate:73, avgScore:7.4, passRate:82, activeRate:62, topSubject:"Sinh STEM",    weakSubject:"CT3 Sáng tạo" },
  { schoolId:"S08", schoolName:"THPT Nguyễn Huệ",         district:"Hà Đông",     tier:"THPT",      students:576, completionRate:71, avgScore:7.1, passRate:79, activeRate:58, topSubject:"Lý STEM",      weakSubject:"CT4 AI" },
  { schoolId:"S09", schoolName:"Tiểu học Mê Linh A",      district:"Mê Linh",     tier:"Tiểu học",  students:188, completionRate:55, avgScore:6.5, passRate:68, activeRate:44, topSubject:"Toán STEM",    weakSubject:"Tin học STEM" },
  { schoolId:"S10", schoolName:"THCS Sóc Sơn",            district:"Sóc Sơn",     tier:"THCS",      students:231, completionRate:50, avgScore:6.1, passRate:61, activeRate:38, topSubject:"Toán STEM",    weakSubject:"Hóa STEM" },
  { schoolId:"S11", schoolName:"Tiểu học Phúc Thọ B",     district:"Phúc Thọ",    tier:"Tiểu học",  students:62,  completionRate:42, avgScore:5.8, passRate:55, activeRate:30, topSubject:"Toán STEM",    weakSubject:"Khoa học TN" },
  { schoolId:"S12", schoolName:"THPT Nghề Đông Anh",      district:"Đông Anh",    tier:"THPT Nghề", students:264, completionRate:67, avgScore:6.8, passRate:75, activeRate:55, topSubject:"CT4 Robotic",  weakSubject:"Lý STEM" },
  { schoolId:"S13", schoolName:"Mầm non Hoa Mai",         district:"Ba Đình",     tier:"Mầm non",   students:95,  completionRate:72, avgScore:7.2, passRate:80, activeRate:60, topSubject:"Toán STEM",    weakSubject:"—" },
  { schoolId:"S14", schoolName:"THCS Ba Vì",              district:"Ba Vì",       tier:"THCS",      students:284, completionRate:68, avgScore:7.0, passRate:78, activeRate:56, topSubject:"Sinh STEM",    weakSubject:"CT2 Liên môn" },
  { schoolId:"S15", schoolName:"Tiểu học Thường Tín C",   district:"Thường Tín",  tier:"Tiểu học",  students:33,  completionRate:38, avgScore:5.5, passRate:48, activeRate:25, topSubject:"Toán STEM",    weakSubject:"Tin học STEM" },
];

const MONTHLY_TREND = [
  { month: "T1", completion: 62, avgScore: 7.1, active: 55 },
  { month: "T2", completion: 65, avgScore: 7.2, active: 58 },
  { month: "T3", completion: 68, avgScore: 7.4, active: 61 },
  { month: "T4", completion: 71, avgScore: 7.5, active: 64 },
  { month: "T5", completion: 74, avgScore: 7.6, active: 66 },
];

const SUBJECT_PERF = [
  { subject: "Toán STEM",     avgScore: 7.8, completion: 82 },
  { subject: "Lý STEM",       avgScore: 7.4, completion: 75 },
  { subject: "Hóa STEM",      avgScore: 7.1, completion: 71 },
  { subject: "Sinh STEM",     avgScore: 7.6, completion: 79 },
  { subject: "CT4 Robotic",   avgScore: 7.9, completion: 84 },
  { subject: "CT5 NCKH",      avgScore: 8.1, completion: 88 },
  { subject: "CT3 Sáng tạo",  avgScore: 7.3, completion: 73 },
];

type Tab = "overview" | "schools" | "subjects";

export function AuthorityLearningResults() {
  const { user } = useAuth();
  const myProvince = user?.province || "Hà Nội";
  const [tab, setTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"avgScore" | "completionRate" | "activeRate">("avgScore");

  const totalStudents   = SCHOOL_LEARNING.reduce((s, x) => s + x.students, 0);
  const avgCompletion   = Math.round(SCHOOL_LEARNING.reduce((s, x) => s + x.completionRate, 0) / SCHOOL_LEARNING.length);
  const avgScore        = (SCHOOL_LEARNING.reduce((s, x) => s + x.avgScore * x.students, 0) / totalStudents).toFixed(1);
  const avgActive       = Math.round(SCHOOL_LEARNING.reduce((s, x) => s + x.activeRate, 0) / SCHOOL_LEARNING.length);
  const weakSchools     = SCHOOL_LEARNING.filter((s) => s.completionRate < 55).length;

  const filtered = useMemo(() => {
    return SCHOOL_LEARNING
      .filter((s) =>
        !search ||
        s.schoolName.toLowerCase().includes(search.toLowerCase()) ||
        s.district.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [search, sortBy]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview",  label: "Tổng quan" },
    { id: "schools",   label: "Theo trường" },
    { id: "subjects",  label: "Theo môn học" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={GraduationCap}
        title={`Kết quả Học tập STEM — ${myProvince}`}
        subtitle="Theo dõi tiến độ học tập, tỷ lệ hoàn thành bài học và kết quả của học sinh toàn tỉnh"
        accentColor={ACCENT}
        actions={
          <button
            onClick={() => toast.info("Xuất báo cáo kết quả học tập")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white hover:opacity-90"
            style={{ background: ACCENT, fontSize: "13px", fontWeight: 500 }}
          >
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users}        label="Học sinh tham gia"       value={totalStudents.toLocaleString()} color={ACCENT}   />
        <KpiCard icon={TrendingUp}   label="Tỷ lệ hoàn thành bài học" value={`${avgCompletion}%`}          color="#2563eb"  change="+12%" trend="up" />
        <KpiCard icon={Award}        label="Điểm trung bình toàn tỉnh" value={avgScore}                    color="#16a34a"  change="+0.5" trend="up" />
        <KpiCard icon={GraduationCap}label="Học sinh active tuần này"  value={`${avgActive}%`}             color="#c8a84e"  subtitle={`${weakSchools} trường < 55%`} />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={tab === t.id
              ? { background: "#fff", color: ACCENT, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
              : { color: "var(--muted-foreground)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Tổng quan ── */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly trend */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold mb-1" style={{ fontSize: "14px" }}>Xu hướng học tập 5 tháng</h3>
            <p className="text-muted-foreground mb-4" style={{ fontSize: "12px" }}>Tỷ lệ hoàn thành & điểm TB theo tháng</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={MONTHLY_TREND}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" style={{ fontSize: 11 }} />
                <YAxis yAxisId="left" domain={[40, 100]} tickFormatter={v => `${v}%`} style={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" domain={[6, 9]} style={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left"  type="monotone" dataKey="completion" name="Hoàn thành (%)" stroke={ACCENT}    strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="left"  type="monotone" dataKey="active"     name="Active (%)"     stroke="#0891b2"  strokeWidth={2} dot={{ r: 4 }} strokeDasharray="4 3" />
                <Line yAxisId="right" type="monotone" dataKey="avgScore"   name="Điểm TB"        stroke="#16a34a"  strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top & bottom schools */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold mb-3" style={{ fontSize: "14px" }}>Top 5 — Hoàn thành bài học cao nhất</h3>
            <div className="space-y-2 mb-4">
              {[...SCHOOL_LEARNING].sort((a,b) => b.completionRate - a.completionRate).slice(0,5).map((s, i) => (
                <div key={s.schoolId} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-muted-foreground text-center">{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium truncate">{s.schoolName}</span>
                      <span className="text-xs font-bold ml-2" style={{ color: ACCENT }}>{s.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${s.completionRate}%`, background: ACCENT }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3">
              <h3 className="font-semibold mb-3" style={{ fontSize: "13px", color: "#dc2626" }}>Cần hỗ trợ — Hoàn thành &lt; 55%</h3>
              <div className="space-y-2">
                {SCHOOL_LEARNING.filter(s => s.completionRate < 55).map((s) => (
                  <div key={s.schoolId} className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-100">
                    <div>
                      <p className="text-xs font-semibold text-red-800">{s.schoolName}</p>
                      <p className="text-xs text-red-500">{s.district} · {s.activeRate}% active</p>
                    </div>
                    <span className="text-sm font-bold text-red-600">{s.completionRate}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* By tier summary */}
          <div className="bg-card border border-border rounded-xl p-4 lg:col-span-2">
            <h3 className="font-semibold mb-3" style={{ fontSize: "14px" }}>Kết quả theo cấp học</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Cấp học", "Số trường", "Học sinh", "Hoàn thành bài học", "Điểm TB", "Tỷ lệ đạt", "Học sinh active"].map(h => (
                      <th key={h} className="text-left py-2 px-4 text-muted-foreground text-xs font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {["Tiểu học","THCS","THPT","THPT Nghề","Mầm non"].map((tier) => {
                    const schools = SCHOOL_LEARNING.filter(s => s.tier === tier);
                    if (!schools.length) return null;
                    const hs = schools.reduce((s,x) => s+x.students, 0);
                    const comp = Math.round(schools.reduce((s,x) => s+x.completionRate,0)/schools.length);
                    const score = (schools.reduce((s,x) => s+x.avgScore*x.students,0)/hs).toFixed(1);
                    const pass  = Math.round(schools.reduce((s,x) => s+x.passRate,0)/schools.length);
                    const active= Math.round(schools.reduce((s,x) => s+x.activeRate,0)/schools.length);
                    return (
                      <tr key={tier} className="border-b border-border/50 hover:bg-muted/40">
                        <td className="py-2.5 px-4 font-medium">{tier}</td>
                        <td className="py-2.5 px-4">{schools.length}</td>
                        <td className="py-2.5 px-4">{hs.toLocaleString()}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full" style={{ width:`${comp}%`, background: comp>=80?"#16a34a":ACCENT }} />
                            </div>
                            <span className="text-xs font-medium">{comp}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-semibold" style={{ color: Number(score)>=8?"#16a34a":Number(score)>=7?ACCENT:"#dc2626" }}>{score}</td>
                        <td className="py-2.5 px-4">{pass}%</td>
                        <td className="py-2.5 px-4">{active}%</td>
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
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Tìm trường hoặc quận/huyện..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm w-64 focus:outline-none focus:ring-2 focus:ring-purple-200" />
            </div>
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {([
                { key: "avgScore",       label: "Điểm TB" },
                { key: "completionRate", label: "Hoàn thành" },
                { key: "activeRate",     label: "Active" },
              ] as const).map((s) => (
                <button key={s.key} onClick={() => setSortBy(s.key)}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                  style={sortBy === s.key ? { background:"#fff", color:ACCENT, boxShadow:"0 1px 3px rgba(0,0,0,0.1)" } : { color:"var(--muted-foreground)" }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {["#","Trường","Quận/Huyện","Cấp","Học sinh","Hoàn thành","Điểm TB","Tỷ lệ đạt","Active","Môn mạnh nhất"].map(h => (
                    <th key={h} className="text-left py-2.5 px-4 text-muted-foreground text-xs font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.map((s, i) => (
                  <tr key={s.schoolId} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2.5 px-4 text-muted-foreground text-xs">{i+1}</td>
                    <td className="py-2.5 px-4 font-medium">{s.schoolName}</td>
                    <td className="py-2.5 px-4 text-muted-foreground text-xs">{s.district}</td>
                    <td className="py-2.5 px-4"><span className="text-xs px-1.5 py-0.5 rounded bg-muted">{s.tier}</span></td>
                    <td className="py-2.5 px-4">{s.students.toLocaleString()}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width:`${s.completionRate}%`, background: s.completionRate>=80?"#16a34a":s.completionRate>=60?ACCENT:"#dc2626" }} />
                        </div>
                        <span className="text-xs font-medium">{s.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-semibold" style={{ color: s.avgScore>=8?"#16a34a":s.avgScore>=7?ACCENT:"#dc2626" }}>{s.avgScore.toFixed(1)}</td>
                    <td className="py-2.5 px-4 text-xs">{s.passRate}%</td>
                    <td className="py-2.5 px-4 text-xs">{s.activeRate}%</td>
                    <td className="py-2.5 px-4 text-xs text-muted-foreground">{s.topSubject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Theo môn học ── */}
      {tab === "subjects" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold mb-3" style={{ fontSize: "14px" }}>Điểm TB theo môn / chương trình</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={SUBJECT_PERF} layout="vertical" margin={{ left: 100, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0,10]} style={{ fontSize:11 }} />
                <YAxis type="category" dataKey="subject" width={100} style={{ fontSize:11 }} />
                <Tooltip formatter={v => [`${v}`, "Điểm TB"]} />
                <Bar dataKey="avgScore" name="Điểm TB" fill={ACCENT} radius={[0,4,4,0]}
                  label={{ position:"right", formatter:(v:number)=>v.toFixed(1), fontSize:10, fill:"#64748b" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold mb-3" style={{ fontSize: "14px" }}>Tỷ lệ hoàn thành theo môn / chương trình</h3>
            <div className="space-y-4">
              {[...SUBJECT_PERF].sort((a,b) => b.completion - a.completion).map((s) => (
                <div key={s.subject}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{s.subject}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Điểm: <span className="font-semibold text-foreground">{s.avgScore.toFixed(1)}</span></span>
                      <span className="text-sm font-bold" style={{ color: s.completion>=85?"#16a34a":s.completion>=70?ACCENT:"#dc2626" }}>{s.completion}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all"
                      style={{ width:`${s.completion}%`, background: s.completion>=85?"#16a34a":s.completion>=70?ACCENT:"#dc2626" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
