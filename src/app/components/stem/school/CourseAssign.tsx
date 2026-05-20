import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  BookOpen, ArrowLeft, Users, CheckCircle2, Plus, Minus,
  Save, AlertTriangle, Layers, GraduationCap,
} from "lucide-react";
import {
  coursesBySchool, classesBySchool, tenantsByType,
  type SchoolCourse, type SchoolClass,
} from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { toast } from "@/app/lib/toast";
import { cn } from "../ui/utils";

/* ================================================================ */
/*  COURSE ASSIGN (School) — Phân bổ khóa học cho từng lớp          */
/* ================================================================ */

const PROGRAM_COLORS: Record<string, { color: string; bg: string }> = {
  CT1: { color: "#7c3aed", bg: "#7c3aed15" },
  CT2: { color: "#2563eb", bg: "#2563eb15" },
  CT3: { color: "#16a34a", bg: "#16a34a15" },
  CT4: { color: "#ea580c", bg: "#ea580c15" },
  CT5: { color: "#dc2626", bg: "#dc262615" },
};

const TIER_LABELS: Record<string, string> = {
  minimum:  "Cơ bản",
  basic:    "Tiêu chuẩn",
  advanced: "Nâng cao",
  premium:  "Premium",
};

const GRADE_LIST = [6, 7, 8, 9];

export function CourseAssign() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const courses = coursesBySchool(tenantId);
  const course = courses.find((c) => c.id === id);
  const allClasses = classesBySchool(tenantId);

  const [assignedIds, setAssignedIds] = useState<string[]>(course?.assignedClasses ?? []);
  const [gradeFilter, setGradeFilter] = useState<number | "all">("all");

  // ── 404 ──
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
          <BookOpen className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>
          Không tìm thấy khóa học (ID: {id})
        </p>
        <Link
          to="/school/courses"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90"
          style={{ fontSize: "13px", fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  const programMeta = PROGRAM_COLORS[course.programCode] ?? { color: "#64748b", bg: "#64748b15" };

  // Seat calculations
  const seatsNeeded = assignedIds.reduce((sum, cId) => {
    return sum + (allClasses.find((c) => c.id === cId)?.studentCount ?? 0);
  }, 0);
  const availableSeats = course.licenseSeats - course.seatsUsed;
  const hasConflict = seatsNeeded > availableSeats;

  function toggleClass(classId: string) {
    setAssignedIds((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  }

  function handleSave() {
    if (hasConflict) {
      toast.error(`Không đủ license — cần ${seatsNeeded} chỗ nhưng chỉ còn ${availableSeats} chỗ`);
    } else {
      toast.success(`Đã lưu phân bổ khóa học cho ${assignedIds.length} lớp (${seatsNeeded} học sinh)`);
    }
  }

  const filteredClasses = allClasses.filter((c) =>
    gradeFilter === "all" ? true : c.grade === gradeFilter
  );

  const assignedClasses = allClasses.filter((c) => assignedIds.includes(c.id));

  return (
    <div className="space-y-5">
      {/* ── Back button ── */}
      <Link
        to="/school/courses"
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        style={{ fontSize: "13px", fontWeight: 500 }}
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách khóa học
      </Link>

      {/* ── PageHeader ── */}
      <PageHeader
        icon={BookOpen}
        title={`Phân bổ: ${course.programName}`}
        subtitle="Chọn các lớp học sẽ sử dụng khóa học này."
        accentColor="#2563eb"
        actions={
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg",
              hasConflict
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-[#2563eb] text-white hover:opacity-90"
            )}
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            <Save className="w-4 h-4" />
            {hasConflict ? "Thiếu license — Lưu thay đổi" : "Lưu phân bổ"}
          </button>
        }
      />

      {/* ── Course Summary Banner ── */}
      <div
        className="rounded-xl border p-5"
        style={{ backgroundColor: programMeta.bg, borderColor: programMeta.color + "30" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white"
              style={{ fontSize: "14px", backgroundColor: programMeta.color }}
            >
              {course.programCode}
            </div>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: programMeta.color }}>{course.programName}</h2>
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
                {TIER_LABELS[course.packageTier] ?? course.packageTier} · {course.subject} · Khối {course.grade}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p style={{ fontSize: "22px", fontWeight: 700 }}>{course.licenseSeats}</p>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Tổng chỗ</p>
            </div>
            <div className="text-center">
              <p style={{ fontSize: "22px", fontWeight: 700, color: "#f59e0b" }}>{course.seatsUsed}</p>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Đã dùng</p>
            </div>
            <div className="text-center">
              <p style={{ fontSize: "22px", fontWeight: 700, color: availableSeats < 20 ? "#dc2626" : "#16a34a" }}>
                {availableSeats}
              </p>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Còn trống</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conflict Warning ── */}
      {hasConflict && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-red-600 dark:text-red-400" style={{ fontSize: "13px", fontWeight: 600 }}>
            Không đủ license cho các lớp được chọn — cần <strong>{seatsNeeded}</strong> chỗ nhưng chỉ còn <strong>{availableSeats}</strong> chỗ trống.
          </p>
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Left: All Classes */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2563eb]" />
                <span style={{ fontSize: "14px", fontWeight: 700 }}>Tất cả lớp</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                  {allClasses.length}
                </span>
              </div>
            </div>
            {/* Grade tabs */}
            <div className="flex gap-1 p-0.5 bg-secondary rounded-lg w-fit">
              {(["all", ...GRADE_LIST] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g as number | "all")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all",
                    gradeFilter === g ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                  style={{ fontSize: "11.5px", fontWeight: 600 }}
                >
                  {g === "all" ? "Tất cả" : `Khối ${g}`}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
            {filteredClasses.map((cls) => {
              const isAssigned = assignedIds.includes(cls.id);
              return (
                <label
                  key={cls.id}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors hover:bg-secondary/50",
                    isAssigned && "bg-[#2563eb]/5"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isAssigned}
                    onChange={() => toggleClass(cls.id)}
                    className="w-4 h-4 accent-[#2563eb] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>{cls.name}</span>
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{ fontSize: "10px", fontWeight: 600, color: "#64748b", backgroundColor: "#64748b15" }}
                      >
                        Khối {cls.grade}
                      </span>
                    </div>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                      GVCN: {cls.homeroomTeacherName} · GV STEM: {cls.stemTeacherName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground shrink-0" style={{ fontSize: "12px" }}>
                    <Users className="w-3.5 h-3.5" />
                    <span style={{ fontWeight: 600 }}>{cls.studentCount}</span>
                  </div>
                </label>
              );
            })}
            {filteredClasses.length === 0 && (
              <p className="px-5 py-8 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
                Không có lớp nào
              </p>
            )}
          </div>
        </div>

        {/* Right: Assigned Classes */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
              <span style={{ fontSize: "14px", fontWeight: 700 }}>Lớp đã phân bổ</span>
              <span className="px-2 py-0.5 rounded-full bg-[#16a34a]/10 text-[#16a34a]" style={{ fontSize: "11px", fontWeight: 600 }}>
                {assignedIds.length}
              </span>
            </div>
          </div>

          {/* Summary stats */}
          <div className="px-5 py-3 bg-secondary/30 border-b border-border grid grid-cols-3 gap-3">
            <div className="text-center">
              <p style={{ fontSize: "20px", fontWeight: 700 }}>{assignedClasses.length}</p>
              <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Lớp được chọn</p>
            </div>
            <div className="text-center">
              <p style={{ fontSize: "20px", fontWeight: 700, color: hasConflict ? "#dc2626" : "#2563eb" }}>
                {seatsNeeded}
              </p>
              <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Chỗ cần dùng</p>
            </div>
            <div className="text-center">
              <p style={{ fontSize: "20px", fontWeight: 700, color: availableSeats >= seatsNeeded ? "#16a34a" : "#dc2626" }}>
                {availableSeats}
              </p>
              <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Chỗ còn lại</p>
            </div>
          </div>

          {/* Assigned list */}
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {assignedClasses.length === 0 ? (
              <div className="py-12 text-center">
                <GraduationCap className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
                  Chưa có lớp nào được phân bổ
                </p>
              </div>
            ) : (
              assignedClasses.map((cls) => (
                <div key={cls.id} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>{cls.name}</span>
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{ fontSize: "10px", fontWeight: 600, color: "#64748b", backgroundColor: "#64748b15" }}
                      >
                        Khối {cls.grade}
                      </span>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-1 mt-0.5" style={{ fontSize: "11px" }}>
                      <Users className="w-3 h-3" /> {cls.studentCount} học sinh
                    </p>
                  </div>
                  <button
                    onClick={() => toggleClass(cls.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    title="Bỏ phân bổ"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Seat usage bar */}
          {seatsNeeded > 0 && (
            <div className="px-5 py-3 border-t border-border bg-secondary/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                  Sử dụng license
                </span>
                <span
                  style={{
                    fontSize: "11px", fontWeight: 700,
                    color: hasConflict ? "#dc2626" : "#16a34a",
                  }}
                >
                  {seatsNeeded}/{availableSeats} chỗ
                </span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, availableSeats > 0 ? (seatsNeeded / availableSeats) * 100 : 0)}%`,
                    backgroundColor: hasConflict ? "#dc2626" : seatsNeeded / availableSeats > 0.8 ? "#f59e0b" : "#16a34a",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg",
            hasConflict
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-[#2563eb] text-white hover:opacity-90"
          )}
          style={{ fontSize: "14px", fontWeight: 600 }}
        >
          <Save className="w-4 h-4" />
          {hasConflict ? "Không đủ license — vẫn lưu?" : "Lưu phân bổ"}
        </button>
        <Link
          to="/school/courses"
          className="px-5 py-2.5 border border-border rounded-lg hover:bg-secondary transition-colors"
          style={{ fontSize: "14px", fontWeight: 500 }}
        >
          Hủy
        </Link>
      </div>
    </div>
  );
}

export default CourseAssign;
