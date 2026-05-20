import { useState, useMemo } from "react";
import {
  Users, BookOpen, TrendingUp, Award, Search,
  ChevronRight, Eye, BarChart3, GraduationCap,
  ArrowLeft, CheckCircle2, AlertCircle, Activity,
  Calendar, Star, Minus,
} from "lucide-react";
import { scheduleEntries, STEM_PROGRAMS } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { ProgramBadge } from "../ui/badges";
import { toast } from "@/app/lib/toast";
import type { StemProgram } from "../../mock-data/types";

/* ================================================================ */
/*  TYPES                                                            */
/* ================================================================ */

interface ClassInfo {
  classId: string;
  className: string;
  programs: StemProgram[];
  totalStudents: number;
  stemSessionsPerWeek: number;
  avgScore: number;
  completionPct: number;
  attendancePct: number;
  trend: "up" | "flat" | "down";
}

interface StudentRow {
  id: string;
  name: string;
  initials: string;
  classId: string;
  practiceScore: number;
  examScore: number;
  completedLessons: number;
  totalLessons: number;
  participation: number;
  trend: "up" | "flat" | "down";
}

/* ================================================================ */
/*  MOCK DATA BUILDERS                                               */
/* ================================================================ */

const STUDENT_NAMES = [
  "Lê Hoàng Nam", "Phạm Thu Trang", "Nguyễn Quang Huy",
  "Vũ Khánh Linh", "Trần Minh Đức", "Đỗ Ngọc Anh",
  "Hoàng Phương Mai", "Bùi Gia Bảo", "Lý Quang Minh",
  "Nguyễn Thúy Hằng", "Phan Trọng Nghĩa", "Đinh Yến Nhi",
  "Cao Thanh Bình", "Lưu Thị Lan", "Trịnh Văn Đạt",
  "Đinh Thị Hoa", "Nguyễn Văn Khải", "Phan Minh Tuấn",
  "Lê Thị Mỹ Linh", "Trần Quang Thái",
];

const TRENDS: StudentRow["trend"][] = ["up", "up", "up", "flat", "flat", "down", "up", "flat"];

function buildStudents(classId: string, count: number, seed: number): StudentRow[] {
  return Array.from({ length: count }, (_, i) => {
    const name = STUDENT_NAMES[(seed + i) % STUDENT_NAMES.length];
    const s = (seed + i) % 31;
    const practice = Math.round((6.0 + (s * 13 % 40) / 10) * 10) / 10;
    const exam = Math.round((5.5 + (s * 11 % 45) / 10) * 10) / 10;
    return {
      id: `U-STU-${String(seed + i + 1).padStart(3, "0")}`,
      name,
      initials: name.split(" ").map((w) => w[0]).slice(-2).join(""),
      classId,
      practiceScore: Math.min(10, practice),
      examScore: Math.min(10, exam),
      completedLessons: 8 + (s % 14),
      totalLessons: 24,
      participation: 65 + (s % 33),
      trend: TRENDS[(seed + i) % TRENDS.length],
    };
  });
}

/* ================================================================ */
/*  CLASS CARD                                                       */
/* ================================================================ */

function ClassCard({
  info,
  onClick,
}: {
  info: ClassInfo;
  onClick: () => void;
}) {
  const maxProg = 4;

  return (
    <button
      onClick={onClick}
      className="bg-card rounded-xl border border-border p-5 text-left transition-all hover:shadow-md hover:-translate-y-0.5 group w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-extrabold text-foreground" style={{ fontSize: "18px" }}>
            {info.className}
          </h3>
          <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
            {info.totalStudents} học sinh · {info.stemSessionsPerWeek} tiết STEM/tuần
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-secondary group-hover:bg-[#0891b2]/10 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#0891b2] transition-colors" />
        </div>
      </div>

      {/* Programs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {info.programs.slice(0, maxProg).map((p) => (
          <ProgramBadge key={p} code={p} size="xs" />
        ))}
        {info.programs.length > maxProg && (
          <span className="px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground" style={{ fontSize: "9.5px" }}>
            +{info.programs.length - maxProg}
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Hoàn thành",    value: `${info.completionPct}%`,    color: "#22c55e" },
          { label: "Điểm TB",       value: info.avgScore.toFixed(1),    color: "#0891b2" },
          { label: "Chuyên cần",    value: `${info.attendancePct}%`,    color: "#c8a84e" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg px-2 py-2 text-center"
            style={{ background: `${stat.color}0d` }}
          >
            <p className="font-extrabold" style={{ fontSize: "16px", color: stat.color }}>
              {stat.value}
            </p>
            <p className="text-muted-foreground" style={{ fontSize: "9.5px" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Completion bar */}
      <div className="bg-secondary rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{
            width: `${info.completionPct}%`,
            background: info.completionPct >= 80
              ? "#22c55e"
              : info.completionPct >= 60
              ? "#f59e0b"
              : "#ef4444",
          }}
        />
      </div>
      <p
        className="text-muted-foreground mt-1 text-right"
        style={{ fontSize: "9.5px" }}
      >
        {info.completionPct}% hoàn thành bài học STEM
      </p>
    </button>
  );
}

/* ================================================================ */
/*  STUDENT TABLE (detail view)                                      */
/* ================================================================ */

function StudentTable({
  students,
  search,
}: {
  students: StudentRow[];
  search: string;
}) {
  const filtered = students.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
        Không tìm thấy học sinh phù hợp.
      </div>
    );
  }

  const TrendIcon = {
    up: TrendingUp,
    flat: Minus,
    down: ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
      <TrendingUp className={className} style={{ ...style, transform: "scaleY(-1)" }} />
    ),
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ minWidth: 650 }}>
        <thead className="bg-secondary/30 border-b border-border">
          <tr>
            {["Học sinh", "Bài học", "Thực hành", "Điểm thi", "Chuyên cần", "Xu hướng", ""].map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-muted-foreground"
                style={{ fontSize: "11px", fontWeight: 600 }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {filtered.map((s, i) => {
            const practiceColor = s.practiceScore >= 8 ? "#22c55e" : s.practiceScore >= 6.5 ? "#f59e0b" : "#ef4444";
            const examColor = s.examScore >= 8 ? "#22c55e" : s.examScore >= 6.5 ? "#f59e0b" : "#ef4444";
            const pct = Math.round((s.completedLessons / s.totalLessons) * 100);
            const TIcon = TrendIcon[s.trend];
            const trendColor = s.trend === "up" ? "#22c55e" : s.trend === "down" ? "#ef4444" : "#64748b";

            return (
              <tr
                key={s.id}
                className="hover:bg-secondary/20 transition-colors"
                style={{ background: i % 2 === 1 ? "rgba(0,0,0,0.01)" : undefined }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                      style={{
                        fontSize: "11px",
                        background: s.examScore >= 8
                          ? "linear-gradient(145deg, #c8a84e, #a0832e)"
                          : s.examScore < 6.5
                          ? "linear-gradient(145deg, #dc2626, #991b1b)"
                          : "linear-gradient(145deg, #0891b2, #0e7490)",
                      }}
                    >
                      {s.initials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground" style={{ fontSize: "12.5px" }}>{s.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground" style={{ fontSize: "11.5px" }}>
                      {s.completedLessons}/{s.totalLessons}
                    </span>
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 75 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold" style={{ fontSize: "15px", color: practiceColor }}>
                    {s.practiceScore.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-bold" style={{ fontSize: "15px", color: examColor }}>
                    {s.examScore.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-foreground" style={{ fontSize: "12.5px" }}>
                    {s.participation}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <TIcon
                    className="w-4 h-4"
                    style={{ color: trendColor }}
                  />
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toast.info(`Xem hồ sơ: ${s.name}`)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-[#0891b2]"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================ */
/*  MAIN COMPONENT                                                   */
/* ================================================================ */

export function TeacherClasses() {
  const { user } = useAuth();
  const myId = user?.id || "U-TCH-01";

  /* ── Build class list from schedule entries ── */
  const classInfoList = useMemo<ClassInfo[]>(() => {
    const mySessions = scheduleEntries.filter((s) => s.teacherId === myId && s.period > 0);
    const classMap: Record<string, { className: string; programs: Set<StemProgram>; count: number }> = {};

    for (const s of mySessions) {
      if (!classMap[s.classId]) {
        classMap[s.classId] = { className: s.className, programs: new Set(), count: 0 };
      }
      classMap[s.classId].programs.add(s.programCode);
      classMap[s.classId].count++;
    }

    return Object.entries(classMap).map(([classId, info], i) => ({
      classId,
      className: info.className,
      programs: Array.from(info.programs),
      totalStudents: 28 + ((i * 5) % 12),
      stemSessionsPerWeek: info.count,
      avgScore: Math.round((6.5 + ((i * 9) % 35) / 10) * 10) / 10,
      completionPct: 60 + ((i * 13) % 35),
      attendancePct: 85 + ((i * 3) % 13),
      trend: (["up", "up", "flat", "down"] as const)[i % 4],
    }));
  }, [myId]);

  /* ── Student data per class ── */
  const studentsByClass = useMemo(() => {
    const map: Record<string, StudentRow[]> = {};
    classInfoList.forEach((cls, i) => {
      map[cls.classId] = buildStudents(cls.classId, cls.totalStudents, i * 20);
    });
    return map;
  }, [classInfoList]);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState("");

  const selectedClass = selectedClassId
    ? classInfoList.find((c) => c.classId === selectedClassId) ?? null
    : null;
  const selectedStudents = selectedClassId ? (studentsByClass[selectedClassId] ?? []) : [];

  /* ── Aggregate KPIs ── */
  const totalStudents = classInfoList.reduce((s, c) => s + c.totalStudents, 0);
  const avgCompletion = classInfoList.length
    ? Math.round(classInfoList.reduce((s, c) => s + c.completionPct, 0) / classInfoList.length)
    : 0;
  const avgScore = classInfoList.length
    ? Math.round((classInfoList.reduce((s, c) => s + c.avgScore, 0) / classInfoList.length) * 10) / 10
    : 0;
  const allPrograms = Array.from(new Set(classInfoList.flatMap((c) => c.programs)));

  /* ──────────────────────────────────────────────── */

  if (selectedClass) {
    const students = selectedStudents;
    const struggling = students.filter((s) => s.examScore < 6.5).length;
    const excelling  = students.filter((s) => s.examScore >= 8).length;
    const avgExam    = students.length
      ? Math.round((students.reduce((s, st) => s + st.examScore, 0) / students.length) * 10) / 10
      : 0;

    return (
      <div className="space-y-5">
        {/* Header with back button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSelectedClassId(null); setStudentSearch(""); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
            style={{ fontSize: "13px" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Tất cả lớp
          </button>
          <div>
            <h1 className="font-extrabold text-foreground" style={{ fontSize: "20px" }}>
              {selectedClass.className}
            </h1>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
              {students.length} học sinh · {selectedClass.stemSessionsPerWeek} tiết STEM/tuần
              {" · "}
              {selectedClass.programs.map((p) => p).join(", ")}
            </p>
          </div>
        </div>

        {/* Class KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={Users}        label="Học sinh"        value={students.length}   color="#0891b2" />
          <KpiCard icon={Star}         label="Điểm TB"          value={avgExam}           color="#c8a84e" subtitle="điểm thi STEM" />
          <KpiCard icon={Award}        label="Xuất sắc (≥8)"   value={excelling}          color="#22c55e" />
          <KpiCard icon={AlertCircle}  label="Cần hỗ trợ (<6.5)" value={struggling}       color="#ef4444" trend={struggling > 3 ? "down" : undefined} />
        </div>

        {/* Programs taught in this class */}
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="font-semibold text-foreground mb-3" style={{ fontSize: "13px" }}>
            Chương trình STEM trong lớp này
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedClass.programs.map((p) => {
              const meta = STEM_PROGRAMS[p];
              return (
                <div
                  key={p}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}28` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.color }} />
                  <span className="font-semibold" style={{ fontSize: "12px", color: meta.color }}>{p}</span>
                  <span className="text-muted-foreground" style={{ fontSize: "11.5px" }}>{meta.shortName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Student search + table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
            <h3 className="font-semibold text-foreground" style={{ fontSize: "13px" }}>
              Danh sách học sinh
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Tìm học sinh..."
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-border bg-card outline-none"
                  style={{ fontSize: "12.5px" }}
                />
              </div>
              <button
                onClick={() => toast.info("Xuất danh sách lớp ra Excel")}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
                style={{ fontSize: "12px" }}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Xuất
              </button>
            </div>
          </div>
          <StudentTable students={selectedStudents} search={studentSearch} />
        </div>
      </div>
    );
  }

  /* ── Class list view ── */
  return (
    <div className="space-y-5">
      <PageHeader
        icon={Users}
        title="Lớp phụ trách"
        subtitle="Các lớp học bạn đang giảng dạy STEM. Click vào lớp để xem danh sách học sinh và tiến độ."
        accentColor="#0891b2"
        actions={
          <button
            onClick={() => toast.info("Xuất báo cáo tổng hợp tất cả lớp")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <BarChart3 className="w-4 h-4" /> Báo cáo
          </button>
        }
      />

      {/* ── Aggregate KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={GraduationCap} label="Tổng lớp phụ trách" value={classInfoList.length}  color="#0891b2" />
        <KpiCard icon={Users}         label="Tổng học sinh"       value={totalStudents}          color="#7c3aed" />
        <KpiCard icon={Activity}      label="Hoàn thành bài học"  value={`${avgCompletion}%`}    color="#22c55e" subtitle="trung bình" />
        <KpiCard icon={Star}          label="Điểm TB"             value={avgScore}               color="#c8a84e" subtitle="điểm thi STEM" />
      </div>

      {/* ── Programs overview ── */}
      <div
        className="rounded-xl border p-4 flex flex-wrap items-center gap-3"
        style={{ background: "rgba(8,145,178,0.04)", borderColor: "rgba(8,145,178,0.2)" }}
      >
        <span className="text-muted-foreground font-medium" style={{ fontSize: "12px" }}>
          Chương trình đang triển khai:
        </span>
        {allPrograms.map((p) => <ProgramBadge key={p} code={p} size="sm" showName />)}
      </div>

      {/* ── Class cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {classInfoList.length > 0 ? (
          classInfoList.map((cls) => (
            <ClassCard
              key={cls.classId}
              info={cls}
              onClick={() => setSelectedClassId(cls.classId)}
            />
          ))
        ) : (
          <div className="col-span-2 py-12 text-center bg-card rounded-xl border border-border">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-semibold" style={{ fontSize: "14px" }}>
              Chưa có lớp phụ trách
            </p>
            <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>
              Lớp sẽ xuất hiện sau khi trường phân công TKB STEM.
            </p>
          </div>
        )}
      </div>

      {/* ── Info footer ── */}
      <div
        className="flex items-start gap-2 rounded-xl border px-4 py-3 text-muted-foreground"
        style={{ fontSize: "11px", background: "rgba(0,0,0,0.02)", borderColor: "rgba(0,0,0,0.07)" }}
      >
        <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Danh sách lớp được đồng bộ từ TKB trường. Click vào lớp để xem từng học sinh và tiến độ học STEM
          chi tiết. Để chấm điểm, sử dụng trang <strong>Chấm điểm</strong> trong menu.
        </span>
      </div>
    </div>
  );
}

export default TeacherClasses;
