import { Link } from "react-router";
import {
  LayoutDashboard, Boxes, Wrench, Calendar, Users, ChevronRight,
  GraduationCap, KeyRound, ShoppingBag, TrendingUp,
} from "lucide-react";
import {
  equipmentBySchool, ticketsBySchool, scheduleEntries,
  licensesByTenant, stemPackages,
} from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import {
  EquipmentStatusBadge, WarrantyStatusBadge, ProgramBadge,
} from "../ui/badges";
import { formatRelative } from "../ui/format";

/* ================================================================ */
/*  SCHOOL DASHBOARD — tổng quan cho Hiệu trưởng / Quản trị trường  */
/* ================================================================ */

export function SchoolDashboard() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : "T-SCH-01";

  const eq = equipmentBySchool(tenantId);
  const tickets = ticketsBySchool(tenantId);
  const schedules = scheduleEntries.filter((s) => s.schoolId === tenantId);
  const licenses = licensesByTenant(tenantId);

  const eqOk = eq.filter((e) => e.status === "ok").length;
  const eqBroken = eq.filter((e) => e.status === "broken" || e.status === "missing").length;
  const eqCompliance = eq.length ? Math.round((eqOk / eq.length) * 100) : 0;

  const openTickets = tickets.filter((t) => !["resolved", "closed", "rejected"].includes(t.status)).length;

  const teachersCount = new Set(schedules.map((s) => s.teacherId)).size;
  const classesCount = new Set(schedules.map((s) => s.classId)).size;

  const todayWeekday = new Date().getDay() || 7;
  const todaySchedule = schedules.filter((s) => s.weekday === todayWeekday).sort((a, b) => a.period - b.period);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard Trường học"
        subtitle={`Xin chào, ${user?.name}. ${user?.tenantName}`}
        accentColor="#2563eb"
      />

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Boxes} label="Thiết bị STEM" value={eq.length} color="#2563eb" subtitle={`${eqCompliance}% đạt chuẩn`} />
        <KpiCard icon={Wrench} label="Ticket bảo hành mở" value={openTickets} color={openTickets > 0 ? "#f59e0b" : "#16a34a"} />
        <KpiCard icon={Calendar} label="Tiết STEM / tuần" value={schedules.length} color="#7c3aed" subtitle={`${classesCount} lớp`} />
        <KpiCard icon={GraduationCap} label="Giáo viên STEM" value={teachersCount} color="#0891b2" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={KeyRound} label="License đã cấp" value={licenses.length} color="#c8a84e" />
        <KpiCard icon={ShoppingBag} label="Gói đã đầu tư" value={stemPackages.length} color="#990803" subtitle="Tối thiểu → Nâng cao" />
        <KpiCard icon={Users} label="Lớp có tiết STEM" value={classesCount} color="#16a34a" />
        <KpiCard icon={TrendingUp} label="Điểm STEM TB" value="8.3" color="#2563eb" change="+0.4" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Thời khóa biểu hôm nay */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Calendar className="w-4 h-4" />
              Tiết STEM hôm nay
            </h3>
            <Link to="/school/schedule" className="text-[#990803] flex items-center gap-1" style={{ fontSize: "12px" }}>
              Lịch tuần <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border max-h-[360px] overflow-y-auto">
            {todaySchedule.slice(0, 6).map((s) => (
              <div key={s.id} className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-foreground shrink-0" style={{ fontSize: "13px", fontWeight: 700 }}>
                  T{s.period}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "12.5px", fontWeight: 600 }}>{s.className} — {s.subject}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{s.teacherName} · {s.roomName}</p>
                </div>
                <ProgramBadge code={s.programCode} size="xs" />
              </div>
            ))}
            {todaySchedule.length === 0 && (
              <div className="p-6 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
                Không có tiết STEM hôm nay.
              </div>
            )}
          </div>
        </div>

        {/* Ticket + thiết bị hỏng */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Wrench className="w-4 h-4" />
              Sự cố thiết bị gần đây
            </h3>
            <Link to="/school/warranty" className="text-[#990803] flex items-center gap-1" style={{ fontSize: "12px" }}>
              Tất cả <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border max-h-[360px] overflow-y-auto">
            {tickets.slice(0, 6).map((t) => (
              <div key={t.id} className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-mono text-muted-foreground" style={{ fontSize: "11px" }}>{t.ticketNo}</span>
                  <WarrantyStatusBadge status={t.status} size="xs" />
                </div>
                <p className="text-foreground line-clamp-1" style={{ fontSize: "12.5px", fontWeight: 500 }}>{t.issue}</p>
                <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10.5px" }}>{formatRelative(t.reportedAt)}</p>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="p-6 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
                Không có sự cố nào.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Equipment stats */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
          <Boxes className="w-4 h-4 inline mr-1.5" />
          Tình trạng thiết bị STEM
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {(["ok", "warning", "broken", "missing"] as const).map((st) => {
            const count = eq.filter((e) => e.status === st).length;
            return (
              <div key={st} className="bg-secondary/40 rounded-lg p-3 text-center">
                <EquipmentStatusBadge status={st} />
                <p className="mt-2" style={{ fontSize: "22px", fontWeight: 700 }}>{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-gradient-to-br from-[#2563eb]/5 to-[#990803]/5 rounded-xl border border-border p-4">
        <p className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Thao tác nhanh</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { to: "/school/purchase", icon: ShoppingBag, label: "Đặt mua gói STEM" },
            { to: "/school/equipment", icon: Boxes, label: "Kiểm kê thiết bị" },
            { to: "/school/schedule", icon: Calendar, label: "Lên lịch STEM" },
            { to: "/school/reports", icon: TrendingUp, label: "Báo cáo hiệu quả" },
          ].map((q) => (
            <Link key={q.to} to={q.to}
              className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border hover:shadow-md transition-all"
              style={{ fontSize: "12.5px", fontWeight: 500 }}
            >
              <q.icon className="w-4 h-4 text-[#2563eb]" />
              {q.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SchoolDashboard;
