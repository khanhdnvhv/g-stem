import { useState } from "react";
import { Link } from "react-router";
import {
  BookOpen, Search, Plus, TrendingUp, Calendar, Users, CheckCircle2,
  Clock, AlertTriangle, ShoppingBag, ChevronRight,
} from "lucide-react";
import {
  coursesBySchool, tenantsByType,
  type SchoolCourse,
} from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  COURSE LIST (School) — Khóa STEM đã mua                          */
/* ================================================================ */

const PROGRAM_COLORS: Record<string, { color: string; bg: string }> = {
  CT1: { color: "#7c3aed", bg: "#7c3aed15" },
  CT2: { color: "#2563eb", bg: "#2563eb15" },
  CT3: { color: "#16a34a", bg: "#16a34a15" },
  CT4: { color: "#ea580c", bg: "#ea580c15" },
  CT5: { color: "#dc2626", bg: "#dc262615" },
};

const TIER_META: Record<string, { label: string; color: string; bg: string }> = {
  minimum:  { label: "Cơ bản",     color: "#64748b", bg: "#64748b15" },
  basic:    { label: "Tiêu chuẩn", color: "#0891b2", bg: "#0891b215" },
  advanced: { label: "Nâng cao",   color: "#7c3aed", bg: "#7c3aed15" },
  premium:  { label: "Premium",    color: "#c8a84e", bg: "#c8a84e15" },
};

function ProgramChip({ code }: { code: string }) {
  const meta = PROGRAM_COLORS[code] ?? { color: "#64748b", bg: "#64748b15" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md"
      style={{ fontSize: "10px", fontWeight: 700, color: meta.color, backgroundColor: meta.bg }}
    >
      {code}
    </span>
  );
}

function TierChip({ tier }: { tier: string }) {
  const meta = TIER_META[tier] ?? { label: tier, color: "#64748b", bg: "#64748b15" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md"
      style={{ fontSize: "10px", fontWeight: 600, color: meta.color, backgroundColor: meta.bg }}
    >
      {meta.label}
    </span>
  );
}

function StatusChip({ status }: { status: SchoolCourse["status"] }) {
  const meta = {
    active:    { label: "Đang hoạt động", color: "#16a34a", bg: "#16a34a15" },
    expired:   { label: "Đã hết hạn",     color: "#dc2626", bg: "#dc262615" },
    suspended: { label: "Tạm dừng",       color: "#f59e0b", bg: "#f59e0b15" },
  }[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
      style={{ fontSize: "10px", fontWeight: 600, color: meta.color, backgroundColor: meta.bg }}
    >
      {status === "active" && <CheckCircle2 className="w-3 h-3" />}
      {status === "expired" && <AlertTriangle className="w-3 h-3" />}
      {meta.label}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

function isExpiringSoon(dateStr: string, days = 60) {
  return new Date(dateStr).getTime() - Date.now() < days * 86400_000 && new Date(dateStr).getTime() > Date.now();
}

export function CourseList() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const courses = coursesBySchool(tenantId);

  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all");
  const [search, setSearch] = useState("");

  // KPI
  const activeCourses = courses.filter((c) => c.status === "active");
  const totalLessons = activeCourses.reduce((s, c) => s + c.totalLessons, 0);
  const completedLessons = activeCourses.reduce((s, c) => s + c.completedLessons, 0);
  const avgCompletion = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const expiringCount = activeCourses.filter((c) => isExpiringSoon(c.expiryDate, 60)).length;

  // Filter
  const filtered = courses.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!c.programName.toLowerCase().includes(s) && !c.subject.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const activeCourseList = filtered.filter((c) => c.status === "active" || c.status === "suspended");
  const expiredCourseList = filtered.filter((c) => c.status === "expired");

  return (
    <div className="space-y-5">
      {/* ── PageHeader ── */}
      <PageHeader
        icon={BookOpen}
        title="Khóa STEM đã mua"
        subtitle="Danh sách gói học liệu đang sử dụng và lịch sử mua hàng."
        accentColor="#2563eb"
        actions={
          <Link
            to="/school/purchase"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <ShoppingBag className="w-4 h-4" /> Mua thêm khóa học
          </Link>
        }
      />

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={BookOpen}       label="Khóa đang hoạt động" value={activeCourses.length}  color="#2563eb" />
        <KpiCard icon={Users}          label="Tổng bài học"         value={totalLessons}           color="#7c3aed" />
        <KpiCard icon={TrendingUp}     label="Hoàn thành TB"        value={`${avgCompletion}%`}    color="#16a34a" />
        <KpiCard icon={AlertTriangle}  label="Sắp hết hạn (60 ngày)" value={expiringCount}        color="#f59e0b" />
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm chương trình, môn học..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-[#2563eb]"
            style={{ fontSize: "13px" }}
          />
        </div>
        <div className="flex gap-1 p-1 bg-secondary rounded-xl">
          {(["all", "active", "expired"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontSize: "12.5px", fontWeight: 600 }}
            >
              {f === "all" ? "Tất cả" : f === "active" ? "Đang hoạt động" : "Đã hết hạn"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Active Course Cards Grid ── */}
      {activeCourseList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeCourseList.map((course) => {
            const completionPct = course.totalLessons > 0
              ? Math.round((course.completedLessons / course.totalLessons) * 100)
              : 0;
            const seatPct = course.licenseSeats > 0
              ? Math.round((course.seatsUsed / course.licenseSeats) * 100)
              : 0;
            const lowSeats = seatPct >= 90;
            const soonExpiry = isExpiringSoon(course.expiryDate, 60);

            return (
              <div
                key={course.id}
                className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition-all"
              >
                {/* Header badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <ProgramChip code={course.programCode} />
                  <TierChip tier={course.packageTier} />
                  <StatusChip status={course.status} />
                  {soonExpiry && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ fontSize: "10px", fontWeight: 600, color: "#f59e0b", backgroundColor: "#f59e0b15" }}>
                      <Clock className="w-3 h-3" /> Sắp hết hạn
                    </span>
                  )}
                </div>

                {/* Title */}
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700 }}>{course.programName}</h3>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>
                    {course.subject} · Khối {course.grade}
                  </p>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>Tiến độ bài học</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a" }}>{completionPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${completionPct}%`,
                        backgroundColor: completionPct >= 80 ? "#16a34a" : completionPct >= 50 ? "#2563eb" : "#f59e0b",
                      }}
                    />
                  </div>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10.5px" }}>
                    {course.completedLessons}/{course.totalLessons} bài
                  </p>
                </div>

                {/* License seats */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>Sử dụng license</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: lowSeats ? "#dc2626" : "#64748b" }}>
                      {seatPct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${seatPct}%`,
                        backgroundColor: seatPct >= 90 ? "#dc2626" : seatPct >= 70 ? "#f59e0b" : "#2563eb",
                      }}
                    />
                  </div>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10.5px" }}>
                    {course.seatsUsed}/{course.licenseSeats} chỗ
                  </p>
                </div>

                {lowSeats && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="text-red-600 dark:text-red-400" style={{ fontSize: "11px", fontWeight: 600 }}>
                      License sắp đầy — còn {course.licenseSeats - course.seatsUsed} chỗ
                    </span>
                  </div>
                )}

                {/* Dates */}
                <div className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}>
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(course.purchaseDate)} → {formatDate(course.expiryDate)}
                </div>

                {/* Classes count */}
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center bg-secondary">
                    <Users className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
                    {course.assignedClasses.length} lớp được phân bổ
                  </span>
                </div>

                {/* Footer actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border mt-auto">
                  <Link
                    to={`/school/courses/${course.id}/assign`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#2563eb]/10 text-[#2563eb] rounded-lg hover:bg-[#2563eb]/20 transition-colors"
                    style={{ fontSize: "12px", fontWeight: 600 }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Phân bổ cho lớp
                  </Link>
                  <button
                    onClick={() => toast.info(`Chi tiết khóa học: ${course.programName} — ${course.packageTier}`)}
                    className="flex items-center justify-center gap-1 px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground" style={{ fontSize: "14px" }}>Không tìm thấy khóa học nào</p>
        </div>
      )}

      {/* ── Expired Courses Section ── */}
      {expiredCourseList.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            <span style={{ fontSize: "13px", fontWeight: 700 }}>Khóa học đã hết hạn ({expiredCourseList.length})</span>
          </div>
          <div className="divide-y divide-border">
            {expiredCourseList.map((course) => (
              <div key={course.id} className="px-5 py-3 flex items-center justify-between gap-4 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                  <ProgramChip code={course.programCode} />
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600 }}>{course.programName}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                      Hết hạn: {formatDate(course.expiryDate)} · {course.subject} · Khối {course.grade}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toast.info(`Yêu cầu gia hạn khóa học: ${course.programName}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#2563eb]/30 text-[#2563eb] rounded-lg hover:bg-[#2563eb]/10 transition-colors shrink-0"
                  style={{ fontSize: "12px", fontWeight: 600 }}
                >
                  <TrendingUp className="w-3.5 h-3.5" /> Gia hạn
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseList;
