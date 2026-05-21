import { useMemo, useState } from "react";
import {
  KeyRound, Download, AlertTriangle, CheckCircle2,
  Users, Search, TrendingUp, Clock, ShieldCheck,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useAuth } from "./authority-ui";
import { PageHeader, KpiCard } from "./authority-ui";
import { toast } from "sonner";

/* ================================================================ */
/*  PROVINCE LICENSE OVERVIEW — Giám sát License & Tài khoản tỉnh   */
/* ================================================================ */

const ACCENT = "#7c3aed";

/* ── Types ── */
interface SchoolLicenseSummary {
  schoolId:      string;
  schoolName:    string;
  district:      string;
  tier:          string;
  package:       string;
  licenseQuota:  number;
  licenseUsed:   number;
  teachers:      number;
  students:      number;
  expiresAt:     string;
  status:        "ok" | "warning" | "critical" | "expired";
  onboardedAt:   string;
}

/* ── Mock dữ liệu license theo trường trong tỉnh ── */
const SCHOOL_LICENSE_DATA: SchoolLicenseSummary[] = [
  { schoolId:"T-SCH-01", schoolName:"THCS Cầu Giấy",              district:"Cầu Giấy",     tier:"THCS",      package:"STEM Studio Pro",  licenseQuota:500, licenseUsed:480, teachers:28, students:452, expiresAt:"2027-08-31", status:"warning",  onboardedAt:"2024-09-01" },
  { schoolId:"T-SCH-02", schoolName:"THPT Chu Văn An",             district:"Tây Hồ",      tier:"THPT",      package:"STEM Studio Pro",  licenseQuota:800, licenseUsed:543, teachers:42, students:501, expiresAt:"2027-08-31", status:"ok",       onboardedAt:"2024-08-15" },
  { schoolId:"T-SCH-03", schoolName:"Tiểu học Đống Đa",            district:"Đống Đa",     tier:"Tiểu học",  package:"STEM Explorer",    licenseQuota:700, licenseUsed:450, teachers:35, students:415, expiresAt:"2026-12-31", status:"warning",  onboardedAt:"2024-09-05" },
  { schoolId:"T-SCH-04", schoolName:"THCS Hai Bà Trưng",           district:"Hai Bà Trưng",tier:"THCS",      package:"STEM Studio",      licenseQuota:600, licenseUsed:388, teachers:31, students:357, expiresAt:"2027-08-31", status:"ok",       onboardedAt:"2024-09-10" },
  { schoolId:"T-SCH-05", schoolName:"THPT Lý Thường Kiệt",         district:"Hoàn Kiếm",   tier:"THPT",      package:"STEM Studio Pro",  licenseQuota:600, licenseUsed:430, teachers:38, students:392, expiresAt:"2027-08-31", status:"ok",       onboardedAt:"2024-08-20" },
  { schoolId:"T-SCH-06", schoolName:"Tiểu học Kim Liên",           district:"Đống Đa",     tier:"Tiểu học",  package:"STEM Explorer",    licenseQuota:500, licenseUsed:320, teachers:29, students:291, expiresAt:"2026-09-30", status:"warning",  onboardedAt:"2024-09-12" },
  { schoolId:"T-SCH-07", schoolName:"THCS Thanh Xuân",             district:"Thanh Xuân",  tier:"THCS",      package:"STEM Studio",      licenseQuota:600, licenseUsed:388, teachers:30, students:358, expiresAt:"2027-08-31", status:"ok",       onboardedAt:"2024-09-10" },
  { schoolId:"T-SCH-08", schoolName:"THPT Nguyễn Huệ",             district:"Hà Đông",     tier:"THPT",      package:"STEM Studio",      licenseQuota:800, licenseUsed:620, teachers:44, students:576, expiresAt:"2027-08-31", status:"ok",       onboardedAt:"2024-08-20" },
  { schoolId:"T-SCH-09", schoolName:"Tiểu học Mê Linh A",          district:"Mê Linh",     tier:"Tiểu học",  package:"STEM Explorer",    licenseQuota:350, licenseUsed:210, teachers:22, students:188, expiresAt:"2026-06-30", status:"critical", onboardedAt:"2024-10-15" },
  { schoolId:"T-SCH-10", schoolName:"THCS Sóc Sơn",                district:"Sóc Sơn",     tier:"THCS",      package:"STEM Explorer",    licenseQuota:400, licenseUsed:255, teachers:24, students:231, expiresAt:"2026-06-30", status:"critical", onboardedAt:"2024-10-20" },
  { schoolId:"T-SCH-11", schoolName:"Tiểu học Phúc Thọ B",         district:"Phúc Thọ",    tier:"Tiểu học",  package:"STEM Explorer",    licenseQuota:300, licenseUsed:80,  teachers:18, students:62,  expiresAt:"2026-04-30", status:"expired",  onboardedAt:"2024-11-01" },
  { schoolId:"T-SCH-12", schoolName:"THPT Nghề Đông Anh",          district:"Đông Anh",    tier:"THPT Nghề", package:"STEM Studio",      licenseQuota:450, licenseUsed:290, teachers:26, students:264, expiresAt:"2027-08-31", status:"ok",       onboardedAt:"2024-11-01" },
  { schoolId:"T-SCH-13", schoolName:"Mầm non Hoa Mai",             district:"Ba Đình",     tier:"Mầm non",   package:"STEM Explorer",    licenseQuota:200, licenseUsed:110, teachers:15, students:95,  expiresAt:"2027-03-31", status:"ok",       onboardedAt:"2024-09-15" },
  { schoolId:"T-SCH-14", schoolName:"THCS Ba Vì",                  district:"Ba Vì",       tier:"THCS",      package:"STEM Explorer",    licenseQuota:500, licenseUsed:312, teachers:28, students:284, expiresAt:"2027-08-31", status:"ok",       onboardedAt:"2024-08-01" },
  { schoolId:"T-SCH-15", schoolName:"Tiểu học Thường Tín C",       district:"Thường Tín",  tier:"Tiểu học",  package:"STEM Explorer",    licenseQuota:350, licenseUsed:45,  teachers:12, students:33,  expiresAt:"2026-03-31", status:"expired",  onboardedAt:"2024-11-20" },
];

const PRODUCT_DIST = [
  { name: "STEM Explorer",   value: 7,  fill: "#2563eb" },
  { name: "STEM Studio",     value: 4,  fill: ACCENT },
  { name: "STEM Studio Pro", value: 4,  fill: "#16a34a" },
];

const LICENSE_BY_TIER = [
  { tier: "Tiểu học",  quota: 2400, used: 1215, schools: 5 },
  { tier: "THCS",      quota: 2600, used: 1823, schools: 5 },
  { tier: "THPT",      quota: 2200, used: 1593, schools: 3 },
  { tier: "THPT Nghề", quota: 450,  used: 290,  schools: 1 },
  { tier: "Mầm non",   quota: 200,  used: 110,  schools: 1 },
];

const STATUS_CFG = {
  ok:       { label: "Bình thường",  color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2 },
  warning:  { label: "Sắp hết hạn", color: "#d97706", bg: "#fffbeb", icon: Clock },
  critical: { label: "Hết hạn <90d",color: "#dc2626", bg: "#fef2f2", icon: AlertTriangle },
  expired:  { label: "Đã hết hạn",  color: "#6b7280", bg: "#f9fafb", icon: AlertTriangle },
};

type Tab = "overview" | "schools" | "accounts" | "alerts";

export function ProvinceLicenseOverview() {
  const { user } = useAuth();
  const myProvince = user?.province || "Hà Nội";
  const [tab, setTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");

  const totalQuota  = SCHOOL_LICENSE_DATA.reduce((s, x) => s + x.licenseQuota, 0);
  const totalUsed   = SCHOOL_LICENSE_DATA.reduce((s, x) => s + x.licenseUsed, 0);
  const totalTeachers = SCHOOL_LICENSE_DATA.reduce((s, x) => s + x.teachers, 0);
  const totalStudents = SCHOOL_LICENSE_DATA.reduce((s, x) => s + x.students, 0);
  const alertSchools = SCHOOL_LICENSE_DATA.filter((s) => s.status !== "ok").length;
  const usageRate = Math.round((totalUsed / totalQuota) * 100);

  const filtered = useMemo(() => {
    return SCHOOL_LICENSE_DATA.filter((s) => {
      const matchSearch = s.schoolName.toLowerCase().includes(search.toLowerCase()) ||
                          s.district.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "Tất cả" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const statusOptions = [
    { key: "Tất cả",  label: "Tất cả" },
    { key: "ok",      label: "Bình thường" },
    { key: "warning", label: "Sắp hết hạn" },
    { key: "critical",label: "Nguy cấp" },
    { key: "expired", label: "Đã hết hạn" },
  ];

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview",  label: "Tổng quan" },
    { id: "schools",   label: "License theo trường" },
    { id: "accounts",  label: "Tài khoản GV & HS" },
    { id: "alerts",    label: `Cảnh báo (${alertSchools})` },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={KeyRound}
        title={`License & Tài khoản — ${myProvince}`}
        subtitle="Giám sát license phần mềm STEM và tài khoản giáo viên/học sinh toàn tỉnh"
        accentColor={ACCENT}
        actions={
          <button
            onClick={() => toast.info("Xuất báo cáo license toàn tỉnh")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white hover:opacity-90"
            style={{ background: ACCENT, fontSize: "13px", fontWeight: 500 }}
          >
            <Download className="w-4 h-4" /> Xuất báo cáo
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={KeyRound}     label="Tổng license đã cấp"   value={totalQuota.toLocaleString()}       color={ACCENT}    subtitle={`${totalUsed.toLocaleString()} đang dùng (${usageRate}%)`} />
        <KpiCard icon={Users}        label="Giáo viên"              value={totalTeachers.toLocaleString()}    color="#2563eb"   change="+8%" trend="up" />
        <KpiCard icon={TrendingUp}   label="Học sinh"               value={totalStudents.toLocaleString()}    color="#16a34a"   change="+12%" trend="up" />
        <KpiCard icon={AlertTriangle}label="Trường cần xử lý"       value={alertSchools}                     color="#dc2626"   subtitle="Hết hạn hoặc sắp hết" />
      </div>

      {/* Alert banner */}
      {alertSchools > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">
              {SCHOOL_LICENSE_DATA.filter(s => s.status === "expired").length} trường hết hạn license ·{" "}
              {SCHOOL_LICENSE_DATA.filter(s => s.status === "critical").length} trường hết hạn trong 90 ngày ·{" "}
              {SCHOOL_LICENSE_DATA.filter(s => s.status === "warning").length} trường cần gia hạn sớm
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
          {/* Usage bar by tier */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-foreground font-semibold mb-3" style={{ fontSize: "14px" }}>
              Sử dụng license theo cấp học
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={LICENSE_BY_TIER} layout="vertical" margin={{ left: 70, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" style={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="tier" width={70} style={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="quota" name="Hạn mức"      fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                <Bar dataKey="used"  name="Đang sử dụng" fill={ACCENT}  radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie: product distribution */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-foreground font-semibold mb-3" style={{ fontSize: "14px" }}>
              Phân bổ theo gói phần mềm
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={PRODUCT_DIST} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {PRODUCT_DIST.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, name) => [`${v} trường`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            {/* Usage summary */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tổng license đã cấp</span>
                <span className="font-semibold">{totalQuota.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Đang sử dụng</span>
                <span className="font-semibold" style={{ color: ACCENT }}>{totalUsed.toLocaleString()} ({usageRate}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                <div className="h-2 rounded-full transition-all" style={{ width: `${usageRate}%`, background: usageRate > 90 ? "#dc2626" : usageRate > 75 ? "#d97706" : ACCENT }} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Chưa sử dụng</span>
                <span className="font-semibold text-muted-foreground">{(totalQuota - totalUsed).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Summary table by tier */}
          <div className="bg-card border border-border rounded-xl p-4 lg:col-span-2">
            <h3 className="text-foreground font-semibold mb-3" style={{ fontSize: "14px" }}>
              Tổng hợp theo cấp học
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Cấp học", "Số trường", "License hạn mức", "Đang dùng", "Tỷ lệ", "Giáo viên", "Học sinh"].map((h) => (
                      <th key={h} className="text-left py-2 px-4 text-muted-foreground text-xs font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {LICENSE_BY_TIER.map((t) => {
                    const rate = Math.round((t.used / t.quota) * 100);
                    const schools = SCHOOL_LICENSE_DATA.filter(s => s.tier === t.tier);
                    const tv = schools.reduce((s, x) => s + x.teachers, 0);
                    const hs = schools.reduce((s, x) => s + x.students, 0);
                    return (
                      <tr key={t.tier} className="border-b border-border/50 hover:bg-muted/40">
                        <td className="py-2.5 px-4 font-medium">{t.tier}</td>
                        <td className="py-2.5 px-4">{t.schools}</td>
                        <td className="py-2.5 px-4">{t.quota.toLocaleString()}</td>
                        <td className="py-2.5 px-4">{t.used.toLocaleString()}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full" style={{ width: `${rate}%`, background: rate > 90 ? "#dc2626" : ACCENT }} />
                            </div>
                            <span className="text-xs font-medium" style={{ color: rate > 90 ? "#dc2626" : "#374151" }}>{rate}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">{tv}</td>
                        <td className="py-2.5 px-4">{hs.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: License theo trường ── */}
      {tab === "schools" && (
        <div className="space-y-4">
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
              {statusOptions.map((s) => (
                <button key={s.key}
                  onClick={() => setStatusFilter(s.key)}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                  style={statusFilter === s.key ? { background: "#fff", color: ACCENT, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" } : { color: "var(--muted-foreground)" }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {["Trường", "Quận/Huyện", "Cấp", "Gói phần mềm", "License", "Sử dụng", "GV", "HS", "Hết hạn", "Trạng thái"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-4 text-muted-foreground text-xs font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.map((s) => {
                  const cfg = STATUS_CFG[s.status];
                  const rate = Math.round((s.licenseUsed / s.licenseQuota) * 100);
                  return (
                    <tr key={s.schoolId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-4 font-medium">{s.schoolName}</td>
                      <td className="py-2.5 px-4 text-muted-foreground text-xs">{s.district}</td>
                      <td className="py-2.5 px-4">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted">{s.tier}</span>
                      </td>
                      <td className="py-2.5 px-4 text-xs">{s.package}</td>
                      <td className="py-2.5 px-4 text-xs">{s.licenseQuota.toLocaleString()}</td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 bg-gray-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${Math.min(rate, 100)}%`, background: rate > 90 ? "#dc2626" : ACCENT }} />
                          </div>
                          <span className="text-xs font-medium">{rate}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center">{s.teachers}</td>
                      <td className="py-2.5 px-4 text-center">{s.students.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-xs text-muted-foreground">{s.expiresAt}</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ color: cfg.color, background: cfg.bg }}>
                          {s.status === "ok" && <CheckCircle2 className="w-3 h-3" />}
                          {s.status !== "ok" && <AlertTriangle className="w-3 h-3" />}
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-10 text-center text-muted-foreground text-sm">Không tìm thấy trường phù hợp</div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Tài khoản GV & HS ── */}
      {tab === "accounts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Teacher accounts */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-foreground font-semibold" style={{ fontSize: "14px" }}>Tài khoản Giáo viên</h3>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>Toàn tỉnh — {totalTeachers} tài khoản</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: "#eff6ff", color: "#2563eb" }}>
                <ShieldCheck className="w-3 h-3" />
                {Math.round(totalTeachers * 0.82)} VNeID verified
              </div>
            </div>

            <div className="space-y-3">
              {SCHOOL_LICENSE_DATA.slice(0, 8).map((s) => (
                <div key={s.schoolId} className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: ACCENT }}>
                      {s.schoolName.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.schoolName}</p>
                      <p className="text-xs text-muted-foreground">{s.district}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{s.teachers}</p>
                      <p className="text-xs text-muted-foreground">giáo viên</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium" style={{ color: "#16a34a" }}>{Math.round(s.teachers * 0.82)} ✓</p>
                      <p className="text-xs text-muted-foreground">VNeID</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2">
              {[
                { label: "Tổng GV",         value: totalTeachers, color: "#374151" },
                { label: "VNeID xác thực",  value: Math.round(totalTeachers * 0.82), color: "#16a34a" },
                { label: "Chưa xác thực",   value: Math.round(totalTeachers * 0.18), color: "#dc2626" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Student accounts */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-foreground font-semibold" style={{ fontSize: "14px" }}>Tài khoản Học sinh</h3>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>Toàn tỉnh — {totalStudents.toLocaleString()} tài khoản</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                <ShieldCheck className="w-3 h-3" />
                {Math.round(totalStudents * 0.91).toLocaleString()} active
              </div>
            </div>

            <div className="space-y-3">
              {SCHOOL_LICENSE_DATA.slice(0, 8).map((s) => (
                <div key={s.schoolId} className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: "#16a34a" }}>
                      {s.schoolName.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.schoolName}</p>
                      <p className="text-xs text-muted-foreground">{s.district}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{s.students.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">học sinh</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium" style={{ color: "#16a34a" }}>{Math.round(s.students * 0.91).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">active</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-2">
              {[
                { label: "Tổng HS",        value: totalStudents.toLocaleString(), color: "#374151" },
                { label: "Đang active",    value: Math.round(totalStudents * 0.91).toLocaleString(), color: "#16a34a" },
                { label: "Không active",   value: Math.round(totalStudents * 0.09).toLocaleString(), color: "#dc2626" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Cảnh báo ── */}
      {tab === "alerts" && (
        <div className="space-y-4">
          {(["expired", "critical", "warning"] as const).map((statusKey) => {
            const schools = SCHOOL_LICENSE_DATA.filter((s) => s.status === statusKey);
            if (!schools.length) return null;
            const cfg = STATUS_CFG[statusKey];
            const Icon = cfg.icon;
            return (
              <div key={statusKey}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  <h3 className="font-semibold" style={{ fontSize: "14px", color: cfg.color }}>
                    {cfg.label} ({schools.length} trường)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {schools.map((s) => {
                    const rate = Math.round((s.licenseUsed / s.licenseQuota) * 100);
                    return (
                      <div key={s.schoolId} className="bg-card border rounded-xl p-4 flex gap-4"
                        style={{ borderColor: cfg.color + "40" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: cfg.bg }}>
                          <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{s.schoolName}</p>
                          <p className="text-xs text-muted-foreground mb-2">{s.district} · {s.tier} · {s.package}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span>Hết hạn: <span className="font-medium" style={{ color: cfg.color }}>{s.expiresAt}</span></span>
                            <span>Sử dụng: <span className="font-medium">{rate}%</span></span>
                            <span>GV: {s.teachers} · HS: {s.students}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => toast.info(`Gửi yêu cầu gia hạn cho ${s.schoolName}`)}
                          className="text-xs px-3 py-1.5 rounded-lg border font-medium flex-shrink-0 self-center hover:opacity-80 transition-opacity"
                          style={{ borderColor: cfg.color, color: cfg.color }}
                        >
                          Gia hạn
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {alertSchools === 0 && (
            <div className="py-16 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-muted-foreground">Tất cả license đang trong trạng thái bình thường</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
