import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router";
import {
  BookOpen, ArrowLeft, Users, CheckCircle2, Minus,
  ChevronDown, ChevronUp, Save, AlertTriangle, Layers,
  GraduationCap, Search, UserCheck,
} from "lucide-react";
import {
  coursesBySchool, classesBySchool, tenantsByType,
  type SchoolClass,
} from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { toast } from "@/app/lib/toast";
import { cn } from "../ui/utils";

/* ================================================================ */
/*  COURSE ASSIGN — Phân bổ khóa học cho lớp / từng học sinh        */
/* ================================================================ */

const PROGRAM_COLORS: Record<string, { color: string; bg: string }> = {
  CT1: { color: "#7c3aed", bg: "#7c3aed15" },
  CT2: { color: "#2563eb", bg: "#2563eb15" },
  CT3: { color: "#16a34a", bg: "#16a34a15" },
  CT4: { color: "#ea580c", bg: "#ea580c15" },
  CT5: { color: "#dc2626", bg: "#dc262615" },
};

const TIER_LABELS: Record<string, string> = {
  minimum: "Cơ bản",
  basic: "Tiêu chuẩn",
  advanced: "Nâng cao",
  premium: "Premium",
};

const GRADE_LIST = [6, 7, 8, 9];

interface StudentRow { id: string; name: string; }

const STUDENT_NAMES = [
  "Lê Hoàng Nam", "Phạm Thu Trang", "Nguyễn Quang Huy", "Vũ Khánh Linh",
  "Trần Minh Đức", "Đỗ Ngọc Anh", "Hoàng Phương Mai", "Bùi Gia Bảo",
  "Lý Quang Minh", "Nguyễn Thúy Hằng", "Phan Trọng Nghĩa", "Đinh Yến Nhi",
  "Vương Tấn Phát", "Tô Hải Đăng", "Chu Khánh My", "Nguyễn Tuấn Kiệt",
  "Phạm Khánh Linh", "Lê Bảo Ngọc", "Trần Anh Thư", "Hoàng Minh Quân",
  "Nguyễn Đức Khải", "Vũ Phương Anh", "Lê Minh Khoa", "Phạm Hồng Nhung",
  "Đặng Quốc Cường", "Bùi Thị Lan", "Trịnh Hữu Đạt", "Ngô Thu Hà",
  "Mai Xuân Trường", "Dương Khánh Chi", "Lê Văn Tùng", "Phạm Ngọc Diệp",
  "Trần Tiến Dũng", "Nguyễn Hà Trang", "Lưu Thành Vinh", "Vũ Minh Châu",
  "Đào Thị Hoa", "Phan Hoàng Anh", "Lê Thị Kim Chi", "Nguyễn Văn Lộc",
];

function buildClassStudents(cls: SchoolClass): StudentRow[] {
  const seed = cls.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Array.from({ length: cls.studentCount }, (_, i) => ({
    id: `${cls.id}-STU-${String(i + 1).padStart(3, "0")}`,
    name: STUDENT_NAMES[(seed + i) % STUDENT_NAMES.length],
  }));
}

function ClassCheckbox({
  classState,
  onChange,
}: {
  classState: "all" | "partial" | "none";
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = classState === "partial";
  }, [classState]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={classState !== "none"}
      onChange={onChange}
      className="w-4 h-4 accent-[#990803] cursor-pointer shrink-0"
    />
  );
}

export function CourseAssign() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const allClasses = classesBySchool(tenantId);
  const courses = coursesBySchool(tenantId);
  const course = courses.find((c) => c.id === id);

  // Pre-compute student list per class (deterministic, no side effects)
  const classStudentsMap: Record<string, StudentRow[]> = {};
  for (const cls of allClasses) classStudentsMap[cls.id] = buildClassStudents(cls);

  // classId → selected studentId[]
  const [selectedStudents, setSelectedStudents] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    for (const classId of course?.assignedClasses ?? []) {
      const cls = allClasses.find((c) => c.id === classId);
      if (cls) init[classId] = buildClassStudents(cls).map((s) => s.id);
    }
    return init;
  });

  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [gradeFilter, setGradeFilter] = useState<number | "all">("all");
  const [studentSearch, setStudentSearch] = useState<Record<string, string>>({});

  // Derived
  const seatsNeeded = Object.values(selectedStudents).reduce((sum, arr) => sum + arr.length, 0);
  const availableSeats = course ? course.licenseSeats - course.seatsUsed : 0;
  const hasConflict = seatsNeeded > availableSeats;
  const assignedClassIds = Object.keys(selectedStudents);
  const assignedClasses = allClasses.filter((c) => assignedClassIds.includes(c.id));

  function getClassState(cls: SchoolClass): "all" | "partial" | "none" {
    const students = classStudentsMap[cls.id] ?? [];
    const sel = selectedStudents[cls.id] ?? [];
    if (sel.length === 0) return "none";
    if (sel.length >= students.length) return "all";
    return "partial";
  }

  function toggleClass(cls: SchoolClass) {
    const state = getClassState(cls);
    setSelectedStudents((prev) => {
      const next = { ...prev };
      if (state === "all") delete next[cls.id];
      else next[cls.id] = (classStudentsMap[cls.id] ?? []).map((s) => s.id);
      return next;
    });
  }

  function toggleStudent(classId: string, studentId: string) {
    setSelectedStudents((prev) => {
      const current = prev[classId] ?? [];
      const next = current.includes(studentId)
        ? current.filter((sid) => sid !== studentId)
        : [...current, studentId];
      const result = { ...prev };
      if (next.length === 0) delete result[classId];
      else result[classId] = next;
      return result;
    });
  }

  function toggleExpand(classId: string) {
    setExpandedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  }

  function removeClassAll(classId: string) {
    setSelectedStudents((prev) => {
      const next = { ...prev };
      delete next[classId];
      return next;
    });
  }

  function handleSave() {
    if (hasConflict) {
      toast.error(`Không đủ license — cần ${seatsNeeded} chỗ nhưng chỉ còn ${availableSeats} chỗ`);
    } else {
      toast.success(`Đã lưu phân bổ cho ${assignedClassIds.length} lớp — ${seatsNeeded} học sinh`);
    }
  }

  const filteredClasses = allClasses.filter((c) =>
    gradeFilter === "all" ? true : c.grade === gradeFilter
  );

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
          className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
          style={{ fontSize: "13px", fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  const programMeta = PROGRAM_COLORS[course.programCode] ?? { color: "#64748b", bg: "#64748b15" };

  return (
    <div className="space-y-5">
      <Link
        to="/school/courses"
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        style={{ fontSize: "13px", fontWeight: 500 }}
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách khóa học
      </Link>

      <PageHeader
        icon={BookOpen}
        title={`Phân bổ: ${course.programName}`}
        subtitle="Chọn cả lớp hoặc từng học sinh cụ thể sẽ sử dụng khóa học này."
        accentColor="#990803"
        actions={
          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg",
              hasConflict
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-[#990803] text-white hover:opacity-90"
            )}
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            <Save className="w-4 h-4" />
            {hasConflict ? "Thiếu license — Lưu thay đổi" : "Lưu phân bổ"}
          </button>
        }
      />

      {/* Course Summary Banner */}
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
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: programMeta.color }}>
                {course.programName}
              </h2>
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

      {hasConflict && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-red-600 dark:text-red-400" style={{ fontSize: "13px", fontWeight: 600 }}>
            Không đủ license — cần <strong>{seatsNeeded}</strong> chỗ nhưng chỉ còn{" "}
            <strong>{availableSeats}</strong> chỗ trống.
          </p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* LEFT: Class list with expandable student rows */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2563eb]" />
                <span style={{ fontSize: "14px", fontWeight: 700 }}>Tất cả lớp</span>
                <span
                  className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                  style={{ fontSize: "11px", fontWeight: 600 }}
                >
                  {allClasses.length}
                </span>
              </div>
              <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}>
                <UserCheck className="w-3.5 h-3.5" /> Nhấn để chọn từng HS
              </span>
            </div>
            <div className="flex gap-1 p-0.5 bg-secondary rounded-lg w-fit">
              {(["all", ...GRADE_LIST] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g as number | "all")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all",
                    gradeFilter === g
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  style={{ fontSize: "11.5px", fontWeight: 600 }}
                >
                  {g === "all" ? "Tất cả" : `Khối ${g}`}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {filteredClasses.map((cls) => {
              const state = getClassState(cls);
              const isExpanded = expandedClasses.has(cls.id);
              const students = classStudentsMap[cls.id] ?? [];
              const selCount = (selectedStudents[cls.id] ?? []).length;
              const search = studentSearch[cls.id] ?? "";
              const visibleStudents = search
                ? students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
                : students;

              return (
                <div key={cls.id}>
                  {/* Class row */}
                  <div
                    className={cn(
                      "flex items-center gap-3 px-5 py-3 transition-colors",
                      state !== "none" ? "bg-[#990803]/5" : "hover:bg-secondary/50"
                    )}
                  >
                    <ClassCheckbox classState={state} onChange={() => toggleClass(cls)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>{cls.name}</span>
                        <span
                          className="px-1.5 py-0.5 rounded"
                          style={{ fontSize: "10px", fontWeight: 600, color: "#64748b", backgroundColor: "#64748b15" }}
                        >
                          Khối {cls.grade}
                        </span>
                        {state === "partial" && (
                          <span
                            className="px-1.5 py-0.5 rounded"
                            style={{ fontSize: "10px", fontWeight: 700, color: "#f59e0b", backgroundColor: "#f59e0b15" }}
                          >
                            {selCount}/{students.length} HS
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                        GVCN: {cls.homeroomTeacherName} · GV STEM: {cls.stemTeacherName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "12px" }}>
                        <Users className="w-3.5 h-3.5" />
                        <span style={{ fontWeight: 600 }}>{cls.studentCount}</span>
                      </div>
                      <button
                        onClick={() => toggleExpand(cls.id)}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-lg border transition-all",
                          isExpanded
                            ? "border-[#990803]/40 bg-[#990803]/10 text-[#990803]"
                            : "border-border text-muted-foreground hover:border-[#990803]/40 hover:text-[#990803]"
                        )}
                        style={{ fontSize: "11px", fontWeight: 600 }}
                        title="Chọn từng học sinh"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        {isExpanded
                          ? <ChevronUp className="w-3 h-3" />
                          : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded: student picker */}
                  {isExpanded && (
                    <div className="border-t border-border bg-secondary/20">
                      {/* Search */}
                      <div className="px-4 pt-2.5 pb-1.5">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                              setStudentSearch((prev) => ({ ...prev, [cls.id]: e.target.value }))
                            }
                            placeholder={`Tìm học sinh trong ${cls.name}...`}
                            className="w-full pl-8 pr-3 py-1.5 bg-card border border-border rounded-lg outline-none focus:border-[#990803]"
                            style={{ fontSize: "12px" }}
                          />
                        </div>
                      </div>
                      {/* Bulk actions */}
                      <div className="px-4 pb-2 flex items-center gap-3">
                        <button
                          onClick={() =>
                            setSelectedStudents((prev) => ({
                              ...prev,
                              [cls.id]: students.map((s) => s.id),
                            }))
                          }
                          className="text-[#990803] hover:underline"
                          style={{ fontSize: "11px", fontWeight: 600 }}
                        >
                          Chọn tất cả
                        </button>
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>·</span>
                        <button
                          onClick={() => removeClassAll(cls.id)}
                          className="text-muted-foreground hover:text-foreground hover:underline"
                          style={{ fontSize: "11px" }}
                        >
                          Bỏ chọn tất cả
                        </button>
                        <span className="ml-auto text-muted-foreground" style={{ fontSize: "11px" }}>
                          {selCount}/{students.length} HS đã chọn
                        </span>
                      </div>
                      {/* Student rows */}
                      <div className="max-h-52 overflow-y-auto divide-y divide-border/40">
                        {visibleStudents.map((student) => {
                          const isSelected = (selectedStudents[cls.id] ?? []).includes(student.id);
                          return (
                            <label
                              key={student.id}
                              className={cn(
                                "flex items-center gap-3 px-7 py-2 cursor-pointer transition-colors hover:bg-secondary/60",
                                isSelected && "bg-[#990803]/5"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleStudent(cls.id, student.id)}
                                className="w-3.5 h-3.5 accent-[#990803] cursor-pointer shrink-0"
                              />
                              <span style={{ fontSize: "12.5px" }}>{student.name}</span>
                            </label>
                          );
                        })}
                        {visibleStudents.length === 0 && (
                          <p
                            className="px-7 py-4 text-center text-muted-foreground"
                            style={{ fontSize: "12px" }}
                          >
                            Không tìm thấy học sinh
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredClasses.length === 0 && (
              <p className="px-5 py-8 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
                Không có lớp nào
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: Assignment summary */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
              <span style={{ fontSize: "14px", fontWeight: 700 }}>Đã phân bổ</span>
              <span
                className="px-2 py-0.5 rounded-full bg-[#16a34a]/10 text-[#16a34a]"
                style={{ fontSize: "11px", fontWeight: 600 }}
              >
                {assignedClassIds.length} lớp
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="px-5 py-3 bg-secondary/30 border-b border-border grid grid-cols-3 gap-3">
            <div className="text-center">
              <p style={{ fontSize: "20px", fontWeight: 700 }}>{assignedClasses.length}</p>
              <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Lớp được chọn</p>
            </div>
            <div className="text-center">
              <p style={{ fontSize: "20px", fontWeight: 700, color: hasConflict ? "#dc2626" : "#2563eb" }}>
                {seatsNeeded}
              </p>
              <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Học sinh phân bổ</p>
            </div>
            <div className="text-center">
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: availableSeats >= seatsNeeded ? "#16a34a" : "#dc2626",
                }}
              >
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
              assignedClasses.map((cls) => {
                const state = getClassState(cls);
                const selCount = (selectedStudents[cls.id] ?? []).length;
                const totalCount = classStudentsMap[cls.id]?.length ?? cls.studentCount;
                return (
                  <div
                    key={cls.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>{cls.name}</span>
                        <span
                          className="px-1.5 py-0.5 rounded"
                          style={{ fontSize: "10px", fontWeight: 600, color: "#64748b", backgroundColor: "#64748b15" }}
                        >
                          Khối {cls.grade}
                        </span>
                        {state === "all" ? (
                          <span
                            className="px-1.5 py-0.5 rounded"
                            style={{ fontSize: "10px", fontWeight: 700, color: "#16a34a", backgroundColor: "#16a34a15" }}
                          >
                            Toàn lớp
                          </span>
                        ) : (
                          <span
                            className="px-1.5 py-0.5 rounded"
                            style={{ fontSize: "10px", fontWeight: 700, color: "#f59e0b", backgroundColor: "#f59e0b15" }}
                          >
                            {selCount}/{totalCount} HS
                          </span>
                        )}
                      </div>
                      <p
                        className="text-muted-foreground flex items-center gap-1 mt-0.5"
                        style={{ fontSize: "11px" }}
                      >
                        <Users className="w-3 h-3" /> {selCount} học sinh được phân bổ
                      </p>
                    </div>
                    <button
                      onClick={() => removeClassAll(cls.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors shrink-0"
                      title="Bỏ phân bổ tất cả"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
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
                    fontSize: "11px",
                    fontWeight: 700,
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
                    backgroundColor: hasConflict
                      ? "#dc2626"
                      : seatsNeeded / availableSeats > 0.8
                      ? "#f59e0b"
                      : "#16a34a",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg",
            hasConflict
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-[#990803] text-white hover:opacity-90"
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
