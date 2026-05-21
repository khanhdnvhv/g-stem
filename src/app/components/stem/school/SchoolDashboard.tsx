import { useMemo } from "react";
import { Link } from "react-router";
import {
  LayoutDashboard, Wrench, Calendar, Users, ChevronRight,
  KeyRound, TrendingUp, AlertTriangle, AlertCircle, Info,
  DoorOpen, GraduationCap, BookMarked,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  classesBySchool, roomsBySchool, licensesByTenant, ticketsBySchool,
  STEM_PROGRAMS, tenantsByType,
} from "../../mock-data/index";
import { getStoredEntries } from "../../../lib/schedule-store";
import type { StemProgram } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { ProgramBadge, WarrantyStatusBadge } from "../ui/badges";
import { formatRelative } from "../ui/format";

/* ================================================================ */
/*  SCHOOL DASHBOARD — bảng tổng chỉ huy cho Hiệu Trưởng           */
/*  Spec: FINAL_QL-Truong-HieuTruong.md §4 Module A [3.1]          */
/* ================================================================ */

const MONTH_NAMES = [
  "Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
  "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12",
];
const CT_COLORS: Record<StemProgram, string> = {
  CT1: "#2563eb", CT2: "#16a34a", CT3: "#7c3aed", CT4: "#dc2626", CT5: "#c8a84e",
};
const CT_KEYS = Object.keys(STEM_PROGRAMS) as StemProgram[];
const WEEKDAYS = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6"];
const ALL_PERIODS = [1,2,3,4,5,6,7,8];
const DONUT_COLORS = ["#16a34a","#2563eb","#94a3b8"];

export function SchoolDashboard() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  /* ── Raw data ───────────────────────────────────────────── */
  const classes   = useMemo(() => classesBySchool(tenantId), [tenantId]);
  const rooms     = useMemo(() => roomsBySchool(tenantId), [tenantId]);
  const licenses  = useMemo(() => licensesByTenant(tenantId), [tenantId]);
  const tickets   = useMemo(() => ticketsBySchool(tenantId), [tenantId]);
  const stemEntries = useMemo(
    () => getStoredEntries(tenantId),
    [tenantId],
  );

  /* ── KPI computations ───────────────────────────────────── */
  const totalStudents = useMemo(() => classes.reduce((s, c) => s + c.studentCount, 0), [classes]);
  const totalSeats    = useMemo(() => licenses.reduce((s, l) => s + l.seats, 0), [licenses]);
  const usedSeats     = useMemo(() => licenses.reduce((s, l) => s + l.seatsUsed, 0), [licenses]);
  const licFillPct    = totalSeats > 0 ? Math.round(usedSeats / totalSeats * 100) : 0;
  const studentActPct = totalStudents > 0 ? Math.min(100, Math.round(usedSeats / totalStudents * 100)) : 0;

  const activeRooms      = useMemo(() => rooms.filter((r) => r.status === "active").length, [rooms]);
  const maintenanceRooms = useMemo(() => rooms.filter((r) => r.status === "maintenance").length, [rooms]);

  const activeTeachers = useMemo(() => new Set(stemEntries.map((e) => e.teacherId)).size, [stemEntries]);
  const totalTeachers  = 8;

  const weeklyPlan  = useMemo(() => classes.reduce((s, c) => s + c.weeklySTEMPeriods, 0), [classes]);
  const stemThisWeek = useMemo(
    () => stemEntries.filter((e) => e.weekday >= 1 && e.weekday <= 5).length,
    [stemEntries],
  );
  const schedPct = weeklyPlan > 0 ? Math.round(stemThisWeek / weeklyPlan * 100) : 100;

  const expiringLicenses = useMemo(
    () => licenses.filter((l) => !l.revokedAt &&
      new Date(l.expiresAt).getTime() - Date.now() < 30 * 86_400_000),
    [licenses],
  );
  const openTickets = useMemo(
    () => tickets.filter((t) => !["resolved","closed","rejected"].includes(t.status)).length,
    [tickets],
  );

  /* ── Chart data: CT1-CT5 stacked bar by month ───────────── */
  const ctChartData = useMemo(() => {
    const monthly: Record<string, Record<string,number>> = {};
    stemEntries.forEach((e) => {
      const m = MONTH_NAMES[new Date(e.dateFrom).getMonth()];
      if (!monthly[m]) monthly[m] = { month: m, CT1:0, CT2:0, CT3:0, CT4:0, CT5:0 };
      monthly[m][e.programCode] = (monthly[m][e.programCode] ?? 0) + 1;
    });
    return Object.values(monthly).sort(
      (a, b) => MONTH_NAMES.indexOf(a.month as string) - MONTH_NAMES.indexOf(b.month as string),
    );
  }, [stemEntries]);

  /* ── Chart data: room heatmap 5×8 ──────────────────────── */
  const heatmap = useMemo(() => {
    const g: Record<number,Record<number,number>> = {};
    for (let w = 1; w <= 5; w++) { g[w] = {}; for (const p of ALL_PERIODS) g[w][p] = 0; }
    stemEntries.forEach((e) => { if (g[e.weekday]?.[e.period] !== undefined) g[e.weekday][e.period]++; });
    return g;
  }, [stemEntries]);

  /* ── Chart data: HS completion donut ───────────────────── */
  const donutData = useMemo(() => {
    const complete   = classes.filter((c) => c.avgSTEMScore >= 7).reduce((s,c)=>s+c.studentCount,0);
    const inProgress = classes.filter((c) => c.avgSTEMScore >= 5 && c.avgSTEMScore < 7).reduce((s,c)=>s+c.studentCount,0);
    const notStarted = Math.max(0, totalStudents - complete - inProgress);
    return [
      { name: "Hoàn thành", value: complete },
      { name: "Đang học",   value: inProgress },
      { name: "Chưa bắt đầu", value: notStarted },
    ];
  }, [classes, totalStudents]);

  /* ── Chart data: license expiry timeline ───────────────── */
  const expiryChart = useMemo(() => {
    const map: Record<string,number> = {};
    licenses.filter((l) => !l.revokedAt).forEach((l) => {
      const d   = new Date(l.expiresAt);
      const key = `T${d.getMonth()+1}/${String(d.getFullYear()).slice(2)}`;
      map[key]  = (map[key] ?? 0) + l.seats;
    });
    return Object.entries(map).map(([month, seats]) => ({ month, seats }))
      .sort((a,b) => a.month.localeCompare(b.month)).slice(0, 8);
  }, [licenses]);

  /* ── Today's schedule ───────────────────────────────────── */
  const todayWeekday   = new Date().getDay() || 7;
  const todaySchedule  = stemEntries.filter((s) => s.weekday === todayWeekday).sort((a,b) => a.period - b.period);

  /* ── Heatmap cell color ──────────────────────────────────── */
  const heatColor = (n: number) =>
    n === 0 ? "bg-secondary text-muted-foreground"
    : n === 1 ? "bg-blue-100 text-blue-800"
    : n === 2 ? "bg-blue-300 text-blue-900"
    : "bg-blue-500 text-white";

  return (
    <div className="space-y-5">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard Trường học"
        subtitle={`Xin chào, ${user?.name}. ${user?.tenantName} — tổng quan toàn trường`}
        accentColor="#990803"
      />

      {/* ── Alert Panel ──────────────────────────────────────── */}
      <div className="space-y-2">
        {expiringLicenses.length > 0 && (
          <Link to="/school/licenses"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800 hover:opacity-90 transition-opacity"
            style={{ textDecoration:"none" }}>
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="flex-1 text-red-700 dark:text-red-400" style={{ fontSize:"13px", fontWeight:600 }}>
              KHẨN: {expiringLicenses.length} license sắp hết hạn trong 30 ngày
            </span>
            <span className="text-red-600 text-xs">Gia hạn ngay →</span>
          </Link>
        )}
        {openTickets > 0 && (
          <Link to="/school/warranty"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 hover:opacity-90 transition-opacity"
            style={{ textDecoration:"none" }}>
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="flex-1 text-amber-700 dark:text-amber-400" style={{ fontSize:"13px", fontWeight:600 }}>
              CẢNH BÁO: {openTickets} thiết bị đang chờ bảo hành
            </span>
            <span className="text-amber-600 text-xs">Xem →</span>
          </Link>
        )}
        {maintenanceRooms > 0 && (
          <Link to="/school/rooms"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 hover:opacity-90 transition-opacity"
            style={{ textDecoration:"none" }}>
            <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
            <span className="flex-1 text-yellow-800 dark:text-yellow-300" style={{ fontSize:"13px", fontWeight:600 }}>
              LƯU Ý: {maintenanceRooms} phòng STEM đang bảo trì
            </span>
            <span className="text-yellow-700 text-xs">Kiểm tra →</span>
          </Link>
        )}
        <Link to="/school/teachers"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 hover:opacity-90 transition-opacity"
          style={{ textDecoration:"none" }}>
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="flex-1 text-blue-700 dark:text-blue-400" style={{ fontSize:"13px", fontWeight:600 }}>
            THÔNG TIN: Kiểm tra tiến độ tập huấn Mức B của giáo viên
          </span>
          <span className="text-blue-600 text-xs">Xem →</span>
        </Link>
      </div>

      {/* ── 5 KPI Cards (row 1) ──────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Link to="/school/students" style={{ textDecoration:"none", display:"block" }}>
          <KpiCard icon={Users} label="HS có license"
            value={usedSeats} color={studentActPct < 80 ? "#f59e0b" : "#2563eb"}
            subtitle={`/ ${totalStudents} HS (${studentActPct}%)`}
          />
        </Link>
        <Link to="/school/teachers" style={{ textDecoration:"none", display:"block" }}>
          <KpiCard icon={GraduationCap} label="GV dạy STEM"
            value={activeTeachers} color={activeTeachers < Math.round(totalTeachers*0.7) ? "#f59e0b" : "#0891b2"}
            subtitle={`/ ${totalTeachers} GV`}
          />
        </Link>
        <Link to="/school/rooms" style={{ textDecoration:"none", display:"block" }}>
          <KpiCard icon={DoorOpen} label="Phòng STEM"
            value={`${activeRooms}/${rooms.length}`}
            color={maintenanceRooms > 0 ? "#f59e0b" : "#16a34a"}
            subtitle={maintenanceRooms > 0 ? `${maintenanceRooms} đang bảo trì` : "Tất cả hoạt động"}
          />
        </Link>
        <Link to="/school/licenses" style={{ textDecoration:"none", display:"block" }}>
          <KpiCard icon={KeyRound} label="License pool"
            value={`${licFillPct}%`}
            color={licFillPct > 90 || expiringLicenses.length > 0 ? "#dc2626" : "#c8a84e"}
            subtitle={`${usedSeats}/${totalSeats} seats`}
          />
        </Link>
        <Link to="/school/schedule" style={{ textDecoration:"none", display:"block" }}>
          <KpiCard icon={Calendar} label="Tiết STEM/tuần"
            value={stemThisWeek}
            color={schedPct < 80 ? "#f59e0b" : "#7c3aed"}
            subtitle={`/ ${weeklyPlan} kế hoạch (${schedPct}%)`}
          />
        </Link>
      </div>

      {/* ── Charts row 1: CT stacked bar + Room heatmap ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CT1-CT5 stacked bar */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-foreground mb-3" style={{ fontSize:"14px", fontWeight:600 }}>
            Tiến độ CT1-CT5 theo tháng
          </h3>
          {ctChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ctChartData} margin={{ top:0, right:4, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize:10 }} />
                <YAxis tick={{ fontSize:10 }} />
                <Tooltip contentStyle={{ fontSize:"11px" }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize:"10px" }} />
                {CT_KEYS.map((ct) => (
                  <Bar key={ct} dataKey={ct} stackId="a" fill={CT_COLORS[ct]} name={STEM_PROGRAMS[ct].name} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
              Chưa có dữ liệu tiết STEM
            </div>
          )}
        </div>

        {/* Room heatmap */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-foreground mb-3" style={{ fontSize:"14px", fontWeight:600 }}>
            Bản đồ sử dụng phòng STEM (số tiết/slot)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-center" style={{ fontSize:"11px" }}>
              <thead>
                <tr>
                  <th className="p-1 text-muted-foreground font-normal w-12">Tiết</th>
                  {WEEKDAYS.map((d) => (
                    <th key={d} className="p-1 text-muted-foreground font-semibold">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_PERIODS.map((p) => (
                  <tr key={p}>
                    <td className="p-1 text-muted-foreground" style={{ fontWeight:600 }}>T{p}</td>
                    {[1,2,3,4,5].map((w) => {
                      const n = heatmap[w]?.[p] ?? 0;
                      return (
                        <td key={w} className="p-0.5">
                          <div className={`rounded ${heatColor(n)} flex items-center justify-center`}
                            style={{ height:"22px", minWidth:"30px" }}>
                            {n > 0 ? n : ""}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Charts row 2: HS donut + License timeline ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* HS completion donut */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-foreground mb-3" style={{ fontSize:"14px", fontWeight:600 }}>
            Tiến độ học STEM của học sinh
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" nameKey="name" paddingAngle={2}>
                {donutData.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v} HS`, ""]} contentStyle={{ fontSize:"11px" }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize:"11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* License expiry timeline */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-foreground mb-3" style={{ fontSize:"14px", fontWeight:600 }}>
            License hết hạn theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={expiryChart} margin={{ top:0, right:4, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize:10 }} />
              <YAxis tick={{ fontSize:10 }} />
              <Tooltip contentStyle={{ fontSize:"11px" }} formatter={(v:number) => [`${v} seats`,""]} />
              <Bar dataKey="seats" fill="#f59e0b" name="Seats hết hạn" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Today's schedule + Recent tickets ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize:"14px", fontWeight:600 }}>
              <Calendar className="w-4 h-4" /> Tiết STEM hôm nay
            </h3>
            <Link to="/school/schedule" className="text-[#990803] flex items-center gap-1" style={{ fontSize:"12px" }}>
              Lịch tuần <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border max-h-[280px] overflow-y-auto">
            {todaySchedule.slice(0,6).map((s) => (
              <div key={s.id} className="p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0"
                  style={{ fontSize:"12px", fontWeight:700 }}>
                  T{s.period}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize:"12.5px", fontWeight:600 }}>{s.className} — {s.subject}</p>
                  <p className="text-muted-foreground" style={{ fontSize:"11px" }}>{s.teacherName} · {s.roomName}</p>
                </div>
                <ProgramBadge code={s.programCode} size="xs" />
              </div>
            ))}
            {todaySchedule.length === 0 && (
              <div className="p-6 text-center text-muted-foreground" style={{ fontSize:"12px" }}>
                Không có tiết STEM hôm nay.
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize:"14px", fontWeight:600 }}>
              <Wrench className="w-4 h-4" /> Sự cố thiết bị gần đây
            </h3>
            <Link to="/school/warranty" className="text-[#990803] flex items-center gap-1" style={{ fontSize:"12px" }}>
              Tất cả <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border max-h-[280px] overflow-y-auto">
            {tickets.slice(0,6).map((t) => (
              <div key={t.id} className="p-3">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-mono text-muted-foreground" style={{ fontSize:"11px" }}>{t.ticketNo}</span>
                  <WarrantyStatusBadge status={t.status} size="xs" />
                </div>
                <p className="text-foreground line-clamp-1" style={{ fontSize:"12.5px", fontWeight:500 }}>{t.issue}</p>
                <p className="text-muted-foreground" style={{ fontSize:"10.5px" }}>{formatRelative(t.reportedAt)}</p>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="p-6 text-center text-muted-foreground" style={{ fontSize:"12px" }}>Không có sự cố.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Shortcuts ────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#990803]/5 to-[#2563eb]/5 rounded-xl border border-border p-4">
        <p className="text-foreground mb-3" style={{ fontSize:"13px", fontWeight:600 }}>Thao tác nhanh</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { to:"/school/stem-slots",      icon:Calendar,   label:"Xếp tiết STEM" },
            { to:"/school/license-assign",  icon:KeyRound,   label:"Gán License" },
            { to:"/school/warranty",        icon:Wrench,     label:"Tạo yêu cầu bảo hành" },
            { to:"/school/reports",         icon:TrendingUp, label:"Xem báo cáo" },
          ].map((q) => (
            <Link key={q.to} to={q.to}
              className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border hover:shadow-md transition-all"
              style={{ fontSize:"12.5px", fontWeight:500, textDecoration:"none", color:"inherit" }}>
              <q.icon className="w-4 h-4 text-[#990803]" />
              {q.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SchoolDashboard;
