import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  GraduationCap, Mail, Phone, Award, BookOpen, Calendar, BarChart3,
  ArrowLeft, Star, TrendingUp, CheckCircle2, FileText, Target, Layers,
  ChevronRight,
} from "lucide-react";
import { tenantsByType } from "../../mock-data/index";
import { getStoredEntries } from "../../../lib/schedule-store";
import type { StemProgram } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { ProgramBadge } from "../ui/badges";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  STUDENT PROFILE — Chi tiết học sinh STEM                         */
/* ================================================================ */

const STUDENT_NAMES = [
  "Nguyễn Văn An", "Trần Thị Bích", "Lê Hoàng Cường", "Phạm Minh Đức",
  "Vũ Thị Lan", "Đặng Quốc Hùng", "Bùi Anh Khoa", "Hoàng Thị Mai",
  "Phan Văn Nam", "Nguyễn Thu Phương", "Cao Minh Quân", "Đinh Thị Hoa",
  "Lý Văn Sơn", "Dương Thị Thanh", "Trịnh Hoàng Uy", "Ngô Thị Vân",
  "Hồ Minh Xuyên", "Châu Thị Yến", "Đỗ Hoàng Zung", "Trương Thị Ánh",
];

const CLASSES = ["6A", "6B", "6C", "6D", "7A", "7B", "7C", "7D", "8A", "8B", "8C", "9A", "9B", "9C"];

const GRADE_MAP: Record<string, string> = {
  "6A": "Lớp 6", "6B": "Lớp 6", "6C": "Lớp 6", "6D": "Lớp 6",
  "7A": "Lớp 7", "7B": "Lớp 7", "7C": "Lớp 7", "7D": "Lớp 7",
  "8A": "Lớp 8", "8B": "Lớp 8", "8C": "Lớp 8",
  "9A": "Lớp 9", "9B": "Lớp 9", "9C": "Lớp 9",
};

const GENDERS = ["Nam", "Nữ"];

const PROGRAMS_LIST: StemProgram[] = ["CT1", "CT2", "CT3", "CT4", "CT5"];

const LICENSE_PRODUCTS = [
  "Geleximco STEM Studio",
  "Robotic Programming IDE",
  "AI-Buddy Tutor",
  "Geleximco STEM Explorer",
  "IoT Platform",
];

interface StudentDetail {
  id: string;
  name: string;
  className: string;
  grade: string;
  gender: string;
  birthDate: string;
  enrollYear: number;
  parentName: string;
  parentPhone: string;
  avatarInitials: string;
  avatarColor: string;
  attendance: number;
  avgStemScore: number;
  completedLessons: number;
  certificatesCount: number;
  assignedLicenses: { product: string; program: StemProgram; expiresAt: string }[];
  stemScores: Record<StemProgram, { midterm: number; final: number; avg: number }>;
}

const AVATAR_COLORS = [
  "linear-gradient(145deg, #16a34a, #166534)",
  "linear-gradient(145deg, #990803, #7a0602)",
  "linear-gradient(145deg, #7c3aed, #5b21b6)",
  "linear-gradient(145deg, #0891b2, #0e7490)",
  "linear-gradient(145deg, #dc2626, #b91c1c)",
];

function buildStudent(index: number): StudentDetail {
  const name = STUDENT_NAMES[index % STUDENT_NAMES.length];
  const className = CLASSES[index % CLASSES.length];
  const grade = GRADE_MAP[className] ?? "Lớp 7";
  const seed = index + 1;

  // Generate pseudo-random but stable scores
  const stemScores: Record<StemProgram, { midterm: number; final: number; avg: number }> = {} as never;
  PROGRAMS_LIST.forEach((p, pi) => {
    const midterm = parseFloat((5.5 + ((seed * 17 + pi * 7) % 45) / 10).toFixed(1));
    const final = parseFloat((5.5 + ((seed * 13 + pi * 11) % 45) / 10).toFixed(1));
    stemScores[p] = { midterm, final, avg: parseFloat(((midterm + final) / 2).toFixed(1)) };
  });

  const avgScore = parseFloat(
    (PROGRAMS_LIST.reduce((s, p) => s + stemScores[p].avg, 0) / PROGRAMS_LIST.length).toFixed(1)
  );

  const licenseCount = 1 + (index % 3);
  const assignedLicenses = Array.from({ length: licenseCount }, (_, li) => ({
    product: LICENSE_PRODUCTS[(index + li) % LICENSE_PRODUCTS.length],
    program: PROGRAMS_LIST[(index + li) % PROGRAMS_LIST.length],
    expiresAt: `202${7 + (index % 2)}-08-31`,
  }));

  return {
    id: `U-STU-${String(index + 1).padStart(2, "0")}`,
    name,
    className: `Lớp ${className}`,
    grade,
    gender: GENDERS[index % 2],
    birthDate: `20${12 - (parseInt(className[0]) - 6)}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 28) + 1).padStart(2, "0")}`,
    enrollYear: 2024 - (parseInt(className[0]) - 6),
    parentName: `Phụ huynh của ${name}`,
    parentPhone: `098${(2000000 + index * 9876).toString().slice(0, 7)}`,
    avatarInitials: name.split(" ").map((w) => w[0]).slice(-2).join(""),
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    attendance: 75 + (seed * 3 % 25),
    avgStemScore: avgScore,
    completedLessons: 8 + ((seed * 7) % 20),
    certificatesCount: index % 3 === 0 ? 0 : 1 + (index % 2),
    assignedLicenses,
    stemScores,
  };
}

function ScoreCell({ value }: { value: number }) {
  const color = value >= 8 ? "#16a34a" : value >= 6.5 ? "#f59e0b" : "#dc2626";
  return (
    <span style={{ color, fontWeight: 700, fontSize: "13px" }}>
      {value.toFixed(1)}
    </span>
  );
}

export function StudentProfile() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  // Parse from "U-STU-01" → index 0
  const rawMatch = id?.match(/U-STU-0*(\d+)/);
  const rawIndex = rawMatch ? parseInt(rawMatch[1], 10) - 1 : -1;
  const isValid = rawIndex >= 0 && rawIndex < STUDENT_NAMES.length;
  const [student] = useState(() => isValid ? buildStudent(rawIndex) : null);

  if (!student) {
    return (
      <div className="space-y-5">
        <Link
          to="/school/students"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          style={{ fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-semibold">Không tìm thấy học sinh</p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
            Mã học sinh <span className="font-mono">{id}</span> không tồn tại.
          </p>
          <Link
            to="/school/students"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#990803] text-white rounded-lg"
            style={{ fontSize: "13px" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang học sinh
          </Link>
        </div>
      </div>
    );
  }

  // Filter schedule entries matching student's class pattern
  const classPattern = student.className.replace("Lớp ", "");
  const studentSchedule = getStoredEntries(tenantId).filter(
    (s) => s.className.includes(classPattern)
  ).slice(0, 10);

  return (
    <div className="space-y-5">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link
          to="/school/students"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          style={{ fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Danh sách học sinh
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-foreground" style={{ fontSize: "13px" }}>{student.name}</span>
      </div>

      <PageHeader
        icon={GraduationCap}
        title="Hồ sơ Học sinh"
        subtitle={`${student.name} · ${student.className}`}
        accentColor="#990803"
        actions={
          <button
            onClick={() => toast.info(`Xuất hồ sơ học sinh ${student.name}`)}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <FileText className="w-4 h-4" />
            Xuất hồ sơ
          </button>
        }
      />

      {/* Hero */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shrink-0 select-none"
            style={{ fontSize: "22px", fontWeight: 800, background: student.avatarColor }}
          >
            {student.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-foreground" style={{ fontSize: "20px", fontWeight: 800 }}>
              {student.name}
            </h1>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "13px" }}>
              {student.className} · {student.grade} · Niên khóa {student.enrollYear}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              <span className="inline-flex items-center gap-1 text-muted-foreground" style={{ fontSize: "12.5px" }}>
                <Phone className="w-3.5 h-3.5 text-[#2563eb]" />
                Phụ huynh: <a href={`tel:${student.parentPhone}`} className="hover:text-[#990803] font-medium">{student.parentPhone}</a>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                Mã: {student.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left col-span-2 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Thông tin học sinh */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              <FileText className="w-4 h-4 text-[#2563eb]" />
              Thông tin học sinh
            </h2>
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs text-muted-foreground">Ngày sinh</dt>
                <dd className="text-sm font-semibold text-foreground mt-0.5">
                  {new Date(student.birthDate).toLocaleDateString("vi-VN")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Giới tính</dt>
                <dd className="text-sm font-semibold text-foreground mt-0.5">{student.gender}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Lớp</dt>
                <dd className="text-sm font-semibold text-foreground mt-0.5">{student.className}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Khối</dt>
                <dd className="text-sm font-semibold text-foreground mt-0.5">{student.grade}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Niên khóa</dt>
                <dd className="text-sm font-semibold text-foreground mt-0.5">{student.enrollYear}–{student.enrollYear + 4}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Tình trạng</dt>
                <dd className="text-sm font-semibold text-[#16a34a] flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đang học
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">Phụ huynh</dt>
                <dd className="text-sm font-semibold text-foreground flex items-center gap-2 mt-0.5">
                  {student.parentName}
                  <a href={`tel:${student.parentPhone}`} className="text-muted-foreground hover:text-[#990803] flex items-center gap-1" style={{ fontSize: "12px", fontWeight: 400 }}>
                    <Phone className="w-3 h-3" />
                    {student.parentPhone}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Lịch sử học STEM */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              <Calendar className="w-4 h-4 text-[#2563eb]" />
              Lịch sử học STEM
            </h2>
            {studentSchedule.length === 0 ? (
              <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Chưa có dữ liệu tiết học.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                    <tr>
                      <th className="px-3 py-2">Tiết</th>
                      <th className="px-3 py-2">Thứ</th>
                      <th className="px-3 py-2">Chương trình</th>
                      <th className="px-3 py-2">Phòng học</th>
                      <th className="px-3 py-2">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
                    {studentSchedule.map((s) => (
                      <tr key={s.id} className="hover:bg-secondary/50">
                        <td className="px-3 py-2 text-muted-foreground">Tiết {s.period}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {["", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"][s.weekday] ?? `T${s.weekday + 1}`}
                        </td>
                        <td className="px-3 py-2">
                          <ProgramBadge code={s.programCode} size="xs" />
                        </td>
                        <td className="px-3 py-2 text-muted-foreground" style={{ fontSize: "11px" }}>{s.roomName}</td>
                        <td className="px-3 py-2">
                          {s.isClub ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#7c3aed]/10 text-[#7c3aed]" style={{ fontSize: "10px", fontWeight: 600 }}>
                              CLB
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Kết quả học tập STEM */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              <BarChart3 className="w-4 h-4 text-[#2563eb]" />
              Kết quả học tập STEM
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                  <tr>
                    <th className="px-3 py-2">Chương trình</th>
                    <th className="px-3 py-2 text-center">Giữa kỳ</th>
                    <th className="px-3 py-2 text-center">Cuối kỳ</th>
                    <th className="px-3 py-2 text-center">TB</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
                  {PROGRAMS_LIST.map((p) => {
                    const s = student.stemScores[p];
                    return (
                      <tr key={p} className="hover:bg-secondary/50">
                        <td className="px-3 py-2">
                          <ProgramBadge code={p} size="xs" showName />
                        </td>
                        <td className="px-3 py-2 text-center"><ScoreCell value={s.midterm} /></td>
                        <td className="px-3 py-2 text-center"><ScoreCell value={s.final} /></td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className="px-2 py-0.5 rounded-md font-bold"
                            style={{
                              fontSize: "13px",
                              color: s.avg >= 8 ? "#16a34a" : s.avg >= 6.5 ? "#f59e0b" : "#dc2626",
                              backgroundColor: s.avg >= 8 ? "#16a34a18" : s.avg >= 6.5 ? "#f59e0b18" : "#dc262618",
                            }}
                          >
                            {s.avg.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Progress stats */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard icon={Target} label="Chuyên cần" value={`${student.attendance}%`} color="#16a34a" />
            <KpiCard icon={TrendingUp} label="Điểm TB STEM" value={student.avgStemScore.toFixed(1)} color="#2563eb" />
            <KpiCard icon={BookOpen} label="Bài đã học" value={student.completedLessons} color="#7c3aed" />
            <KpiCard icon={Award} label="Chứng chỉ" value={student.certificatesCount} color="#c8a84e" />
          </div>

          {/* License đang sử dụng */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              <Layers className="w-4 h-4 text-[#2563eb]" />
              License đang sử dụng
            </h2>
            {student.assignedLicenses.length === 0 ? (
              <p className="text-muted-foreground" style={{ fontSize: "12.5px" }}>Chưa có license được cấp.</p>
            ) : (
              <div className="space-y-2">
                {student.assignedLicenses.map((lic, i) => (
                  <div key={i} className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-foreground" style={{ fontSize: "12.5px", fontWeight: 600 }}>{lic.product}</p>
                      <ProgramBadge code={lic.program} size="xs" />
                    </div>
                    <p className="text-muted-foreground mt-1 flex items-center gap-1" style={{ fontSize: "11px" }}>
                      <CheckCircle2 className="w-3 h-3 text-[#16a34a]" />
                      Hạn: {new Date(lic.expiresAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <h2 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 700 }}>Thao tác nhanh</h2>
            <Link
              to={`/school/schedule?class=${encodeURIComponent(classPattern)}`}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-secondary text-left"
              style={{ fontSize: "13px" }}
            >
              <Calendar className="w-4 h-4 text-[#2563eb]" />
              Xem TKB
            </Link>
            <Link
              to="/school/license-assign"
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-secondary text-left"
              style={{ fontSize: "13px" }}
            >
              <Layers className="w-4 h-4 text-[#16a34a]" />
              Gán license
            </Link>
            <button
              onClick={() => toast.info(`Đang xuất hồ sơ học sinh ${student.name}...`)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-secondary text-left"
              style={{ fontSize: "13px" }}
            >
              <FileText className="w-4 h-4 text-[#7c3aed]" />
              Xuất hồ sơ
            </button>
            <button
              onClick={() => toast.info(`Nhắn tin đến phụ huynh của ${student.name}`)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#990803] text-white hover:opacity-90"
              style={{ fontSize: "13px" }}
            >
              <Mail className="w-4 h-4" />
              Nhắn tin phụ huynh
            </button>
          </div>

          {/* Thành tích */}
          {student.certificatesCount > 0 && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <h2 className="flex items-center gap-2 text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
                <Star className="w-4 h-4 text-[#c8a84e]" />
                Thành tích STEM
              </h2>
              {Array.from({ length: student.certificatesCount }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#c8a84e] shrink-0" />
                  <span className="text-foreground" style={{ fontSize: "12.5px" }}>
                    Chứng chỉ STEM Geleximco Level {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Suppress unused warnings */}
      {user && null}
    </div>
  );
}

export default StudentProfile;
