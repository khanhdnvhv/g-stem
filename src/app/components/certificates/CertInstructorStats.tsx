import { useState } from "react";
import {
  BarChart3, GraduationCap, Award, Users, TrendingUp,
  BookOpen, Target, CheckCircle2, Clock, AlertTriangle,
  ArrowUpRight, Download,
} from "lucide-react";

// ── Mock data for instructor ──
const COURSE_STATS = [
  { id: "C1", course: "An toan Lao dong trong XD & KK", students: 45, certified: 38, rate: 84, avgScore: 82, pending: 3, latestDate: "10/03/2026" },
  { id: "C2", course: "Quan tri Rui ro & Kiem soat NB", students: 32, certified: 28, rate: 88, avgScore: 85, pending: 2, latestDate: "08/03/2026" },
  { id: "C3", course: "Ky nang Lanh dao Quan ly CT", students: 28, certified: 22, rate: 79, avgScore: 78, pending: 4, latestDate: "05/03/2026" },
  { id: "C4", course: "ISO 9001:2015 - Quan ly Chat luong", students: 36, certified: 31, rate: 86, avgScore: 81, pending: 1, latestDate: "12/03/2026" },
  { id: "C5", course: "ESG & Phat trien Ben vung", students: 22, certified: 18, rate: 82, avgScore: 79, pending: 2, latestDate: "09/03/2026" },
];

const MONTHLY_SCORES = [
  { month: "T08", avg: 72, certified: 12 },
  { month: "T09", avg: 75, certified: 15 },
  { month: "T10", avg: 78, certified: 18 },
  { month: "T11", avg: 80, certified: 22 },
  { month: "T12", avg: 82, certified: 25 },
  { month: "T01", avg: 85, certified: 32 },
  { month: "T02", avg: 88, certified: 28 },
  { month: "T03", avg: 86, certified: 14 },
];

const RECENT_CERTS = [
  { student: "Tran Van Hung", course: "An toan Lao dong", score: 85, date: "10/03/2026", status: "approved" },
  { student: "Nguyen Thi Lan", course: "Quan tri Rui ro", score: 92, date: "08/03/2026", status: "pending" },
  { student: "Pham Minh Tuan", course: "Ky nang Lanh dao", score: 78, date: "05/03/2026", status: "approved" },
  { student: "Le Hoang Vu", course: "ISO 9001:2015", score: 88, date: "12/03/2026", status: "approved" },
  { student: "Vo Thi Hanh", course: "An toan Lao dong", score: 91, date: "04/03/2026", status: "approved" },
  { student: "Hoang Van Dat", course: "ESG & Phat trien BV", score: 95, date: "09/03/2026", status: "pending" },
  { student: "Do Thi Mai", course: "Quan tri Rui ro", score: 82, date: "03/03/2026", status: "approved" },
  { student: "Bui Xuan Truong", course: "ISO 9001:2015", score: 76, date: "02/03/2026", status: "approved" },
];

export function CertInstructorStats() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const totalStudents = COURSE_STATS.reduce((s, c) => s + c.students, 0);
  const totalCertified = COURSE_STATS.reduce((s, c) => s + c.certified, 0);
  const totalPending = COURSE_STATS.reduce((s, c) => s + c.pending, 0);
  const overallRate = Math.round((totalCertified / totalStudents) * 100);
  const overallAvg = Math.round(COURSE_STATS.reduce((s, c) => s + c.avgScore, 0) / COURSE_STATS.length);

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Tong hoc vien", value: totalStudents, icon: Users, color: "#990803" },
          { label: "Da dat CC", value: totalCertified, icon: Award, color: "#22c55e" },
          { label: "Cho xac nhan", value: totalPending, icon: Clock, color: "#f59e0b" },
          { label: "Ti le dat", value: `${overallRate}%`, icon: Target, color: "#3b82f6" },
          { label: "Diem TB", value: `${overallAvg}%`, icon: TrendingUp, color: "#c8a84e" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}10` }}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{kpi.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Course breakdown */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>Ti le dat Chung chi theo Khoa</h3>
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất báo cáo thống kê giảng viên...")); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "11px" }}>
            <Download className="w-3 h-3" /> Xuat bao cao
          </button>
        </div>
        <div className="space-y-4">
          {COURSE_STATS.map(cs => {
            const isSelected = selectedCourse === cs.id;
            return (
              <div key={cs.id}>
                <button
                  onClick={() => setSelectedCourse(isSelected ? null : cs.id)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer text-left ${isSelected ? "border-[#990803]/20 bg-[#990803]/3 shadow-sm" : "border-border hover:border-gray-300 hover:shadow-sm"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 500 }}>{cs.course}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                        <strong className="text-green-600">{cs.certified}</strong>/{cs.students} dat CC
                      </span>
                      <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                        Diem TB: <strong className="text-foreground">{cs.avgScore}%</strong>
                      </span>
                      {cs.pending > 0 && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600" style={{ fontSize: "10px", fontWeight: 500 }}>
                          <Clock className="w-2.5 h-2.5" /> {cs.pending} cho duyet
                        </span>
                      )}
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#990803] to-[#c8a84e] transition-all" style={{ width: `${cs.rate}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[#990803]" style={{ fontSize: "22px", fontWeight: 700 }}>{cs.rate}%</p>
                    <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Ti le dat</p>
                  </div>
                </button>

                {/* Expanded detail */}
                {isSelected && (
                  <div className="mt-2 ml-4 p-4 bg-secondary/20 rounded-xl border border-border space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: "Hoan thanh khoa", value: cs.students, color: "#3b82f6" },
                        { label: "Da dat CC", value: cs.certified, color: "#22c55e" },
                        { label: "Khong dat", value: cs.students - cs.certified - cs.pending, color: "#ef4444" },
                        { label: "Cho duyet", value: cs.pending, color: "#f59e0b" },
                      ].map(item => (
                        <div key={item.label} className="bg-card rounded-lg p-3 text-center border border-border">
                          <p style={{ fontSize: "18px", fontWeight: 700, color: item.color }}>{item.value}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{item.label}</p>
                        </div>
                      ))}
                    </div>
                    {/* Score distribution mini */}
                    <div>
                      <p className="text-muted-foreground mb-2" style={{ fontSize: "10px", fontWeight: 600 }}>Phan bo diem (mo phong)</p>
                      <div className="flex items-end gap-1 h-12">
                        {[2, 5, 8, 12, 15, 18, 14, 10, 6, 3].map((v, i) => (
                          <div key={i} className="flex-1 rounded-t" style={{ height: `${(v / 18) * 100}%`, background: i >= 4 ? "#22c55e" : i >= 2 ? "#f59e0b" : "#ef4444", opacity: 0.7 }} />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-muted-foreground" style={{ fontSize: "8px" }}>0%</span>
                        <span className="text-muted-foreground" style={{ fontSize: "8px" }}>50%</span>
                        <span className="text-muted-foreground" style={{ fontSize: "8px" }}>100%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trend charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Average score trend */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 700 }}>Xu huong diem trung binh</h3>
          <svg viewBox="0 0 400 180" className="w-full">
            {[0, 50, 100].map(v => (
              <g key={v}>
                <line x1="30" y1={160 - v * 1.4} x2="390" y2={160 - v * 1.4} stroke="#e5e7eb" strokeWidth="0.5" />
                <text x="0" y={164 - v * 1.4} fill="#9ca3af" fontSize="9">{v}%</text>
              </g>
            ))}
            {(() => {
              const gap = 360 / (MONTHLY_SCORES.length - 1);
              const pathD = MONTHLY_SCORES.map((p, i) => `${i === 0 ? "M" : "L"}${30 + i * gap},${160 - p.avg * 1.4}`).join(" ");
              const areaPath = `M30,160 ` + MONTHLY_SCORES.map((p, i) => `L${30 + i * gap},${160 - p.avg * 1.4}`).join(" ") + ` L${30 + (MONTHLY_SCORES.length - 1) * gap},160 Z`;
              return (
                <>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#990803" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#990803" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#scoreGrad)" />
                  <path d={pathD} fill="none" stroke="#990803" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {MONTHLY_SCORES.map((p, i) => (
                    <g key={i}>
                      <circle cx={30 + i * gap} cy={160 - p.avg * 1.4} r="4" fill="white" stroke="#990803" strokeWidth="2" />
                      <text x={30 + i * gap} y={160 - p.avg * 1.4 - 10} textAnchor="middle" fill="#990803" fontSize="9" fontWeight="600">{p.avg}%</text>
                      <text x={30 + i * gap} y="177" textAnchor="middle" fill="#9ca3af" fontSize="8">{p.month}</text>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </div>

        {/* Monthly certified count */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 700 }}>So luong dat CC theo thang</h3>
          <svg viewBox="0 0 400 180" className="w-full">
            {(() => {
              const maxVal = Math.max(...MONTHLY_SCORES.map(m => m.certified));
              return (
                <>
                  {[0, 0.5, 1].map((pct, i) => (
                    <g key={i}>
                      <line x1="30" y1={160 * (1 - pct)} x2="390" y2={160 * (1 - pct)} stroke="#e5e7eb" strokeWidth="0.5" />
                      <text x="0" y={164 * (1 - pct)} fill="#9ca3af" fontSize="9">{Math.round(maxVal * pct)}</text>
                    </g>
                  ))}
                  {MONTHLY_SCORES.map((m, i) => {
                    const barW = 32;
                    const gap = (360 - barW * MONTHLY_SCORES.length) / (MONTHLY_SCORES.length + 1);
                    const x = 30 + gap + i * (barW + gap);
                    const h = (m.certified / maxVal) * 140;
                    return (
                      <g key={i}>
                        <defs>
                          <linearGradient id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c8a84e" />
                            <stop offset="100%" stopColor="#990803" />
                          </linearGradient>
                        </defs>
                        <rect x={x} y={160 - h} width={barW} height={h} rx="4" fill={`url(#barGrad${i})`} opacity="0.85" />
                        <text x={x + barW / 2} y={160 - h - 5} textAnchor="middle" fill="#990803" fontSize="9" fontWeight="700">{m.certified}</text>
                        <text x={x + barW / 2} y="177" textAnchor="middle" fill="#9ca3af" fontSize="8">{m.month}</text>
                      </g>
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Recent certifications table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>Chung chi gan day</h3>
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{RECENT_CERTS.length} chung chi moi nhat</p>
        </div>
        <div className="divide-y divide-border/50">
          {RECENT_CERTS.map((cert, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/20 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center text-white shrink-0" style={{ fontSize: "10px", fontWeight: 700 }}>
                {cert.student.split(" ").slice(-1)[0][0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{cert.student}</p>
                <p className="text-muted-foreground truncate" style={{ fontSize: "10px" }}>{cert.course}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[#990803]" style={{ fontSize: "14px", fontWeight: 700 }}>{cert.score}%</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full shrink-0 ${cert.status === "approved" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`} style={{ fontSize: "10px", fontWeight: 600 }}>
                {cert.status === "approved" ? "Da duyet" : "Cho duyet"}
              </span>
              <span className="text-muted-foreground shrink-0" style={{ fontSize: "10px" }}>{cert.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}