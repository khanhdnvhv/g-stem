import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  UserCheck, Mail, Phone, Award, BookOpen, Calendar, BarChart3,
  GraduationCap, ArrowLeft, ChevronRight, Edit2, Puzzle, FileText, Target,
} from "lucide-react";
import { scheduleEntries, tenantsByType, STEM_PROGRAMS } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { ProgramBadge } from "../ui/badges";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  TEACHER PROFILE — Chi tiết giáo viên STEM                        */
/* ================================================================ */

const NAMES = [
  "Phạm Anh Tuấn", "Nguyễn Thị Lan", "Trần Văn Hùng", "Lê Minh Trang",
  "Vũ Thanh Hương", "Đặng Tuấn Anh", "Bùi Thu Hà", "Nguyễn Văn Dũng",
  "Phan Thị Mai", "Hoàng Gia Bảo",
];
const SUBJECTS = [
  "Toán", "Lý", "Hóa", "Sinh", "Tin học",
  "Công nghệ", "Khoa học Tự nhiên", "Tiếng Việt", "Vật lý", "Hóa học",
];
const DEGREES = [
  "Cử nhân sư phạm", "Thạc sĩ sư phạm",
  "Cử nhân + chứng chỉ STEM", "Thạc sĩ CNTT",
];
const CERTIFICATIONS = [
  ["STEM Geleximco Level 1"],
  ["STEM Geleximco Level 1", "STEM Geleximco Level 2"],
  ["STEM Geleximco Level 1", "Google Certified Educator"],
  ["STEM Geleximco Level 1", "STEM Geleximco Level 2", "Robotics Coach"],
];

const TRAINING_MILESTONES = [
  "Tập huấn CT1 cơ bản",
  "Tập huấn CT2 liên môn",
  "Thực hành Robotic cơ bản",
  "Chứng chỉ Geleximco Level 1",
  "Tập huấn AI & IoT nâng cao",
];

const WEEKDAY_LABELS = ["", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

interface TeacherDetail {
  id: string;
  name: string;
  subject: string;
  degree: string;
  email: string;
  phone: string;
  joinedDate: string;
  experienceYears: number;
  classesCount: number;
  stemLessons: number;
  programs: StemProgram[];
  trainingProgress: number;
  certifications: string[];
  avatarInitials: string;
  avatarColor: string;
}

const AVATAR_COLORS = [
  "linear-gradient(145deg, #2563eb, #1e40af)",
  "linear-gradient(145deg, #7c3aed, #5b21b6)",
  "linear-gradient(145deg, #0891b2, #0e7490)",
  "linear-gradient(145deg, #16a34a, #166534)",
  "linear-gradient(145deg, #c8a84e, #a16207)",
  "linear-gradient(145deg, #dc2626, #b91c1c)",
];

function buildTeacher(schoolId: string, index: number): TeacherDetail {
  const name = NAMES[index % NAMES.length];
  const teacherId = `U-TCH-${String(index + 1).padStart(2, "0")}`;
  const schoolEntries = scheduleEntries.filter(
    (s) => s.schoolId === schoolId && s.teacherId === teacherId
  );
  const programs = Array.from(new Set(schoolEntries.map((e) => e.programCode))) as StemProgram[];
  const allPrograms: StemProgram[] = ["CT1", "CT2", "CT3", "CT4", "CT5"];

  return {
    id: teacherId,
    name,
    subject: SUBJECTS[index % SUBJECTS.length],
    degree: DEGREES[index % DEGREES.length],
    email: `gv${index + 1}@thcs-school.edu.vn`,
    phone: `090${(1000000 + index * 12345).toString().slice(0, 7)}`,
    joinedDate: `20${18 + (index % 7)}-09-01`,
    experienceYears: 3 + (index % 12),
    classesCount: new Set(schoolEntries.map((e) => e.classId)).size || 2 + (index % 3),
    stemLessons: schoolEntries.length || 3 + index,
    programs: programs.length ? programs : [allPrograms[index % 5]],
    trainingProgress: 40 + (index * 8) % 60,
    certifications: CERTIFICATIONS[index % CERTIFICATIONS.length],
    avatarInitials: name.split(" ").map((w) => w[0]).slice(-2).join(""),
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
  };
}

export function TeacherProfile() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  // Parse index from "U-TCH-01" → 0
  const rawIndex = id ? parseInt(id.replace("U-TCH-", ""), 10) - 1 : -1;
  const isValid = rawIndex >= 0 && rawIndex < NAMES.length;
  const [teacher] = useState(() => isValid ? buildTeacher(tenantId, rawIndex) : null);

  if (!teacher) {
    return (
      <div className="space-y-5">
        <Link
          to="/school/teachers"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          style={{ fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-semibold">Không tìm thấy giáo viên</p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
            Mã giáo viên <span className="font-mono">{id}</span> không tồn tại.
          </p>
        </div>
      </div>
    );
  }

  const teacherSchedule = scheduleEntries.filter(
    (s) => s.schoolId === tenantId && s.teacherId === teacher.id
  );
  const completedMilestones = Math.ceil((teacher.trainingProgress / 100) * TRAINING_MILESTONES.length);

  return (
    <div className="space-y-5">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/school/teachers"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          style={{ fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Danh sách giáo viên
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-foreground" style={{ fontSize: "13px" }}>{teacher.name}</span>
      </div>

      <PageHeader
        icon={UserCheck}
        title="Hồ sơ Giáo viên STEM"
        subtitle={`${teacher.name} · GV ${teacher.subject}`}
        accentColor="#2563eb"
        actions={
          <button
            onClick={() => toast.info(`Chỉnh sửa hồ sơ ${teacher.name}`)}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Edit2 className="w-4 h-4" />
            Chỉnh sửa
          </button>
        }
      />

      {/* Hero Section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-white shrink-0 select-none"
            style={{ fontSize: "22px", fontWeight: 800, background: teacher.avatarColor }}
          >
            {teacher.avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-foreground" style={{ fontSize: "20px", fontWeight: 800 }}>
              {teacher.name}
            </h1>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "13px" }}>
              GV {teacher.subject} · {teacher.degree} · {teacher.experienceYears} năm kinh nghiệm
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {/* Programs */}
              {teacher.programs.map((p) => <ProgramBadge key={p} code={p} size="sm" showName />)}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {/* Certifications */}
              {teacher.certifications.map((cert, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#c8a84e]/12 text-[#c8a84e]"
                  style={{ fontSize: "10.5px", fontWeight: 600 }}
                >
                  <Award className="w-3 h-3" />
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left col-span-2 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Thông tin cá nhân */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              <FileText className="w-4 h-4 text-[#2563eb]" />
              Thông tin cá nhân
            </h2>
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="text-sm font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                  <a href={`mailto:${teacher.email}`} className="hover:text-[#2563eb] truncate">{teacher.email}</a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Điện thoại</dt>
                <dd className="text-sm font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                  <a href={`tel:${teacher.phone}`} className="hover:text-[#2563eb]">{teacher.phone}</a>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Ngày vào trường</dt>
                <dd className="text-sm font-semibold text-foreground mt-0.5">
                  {new Date(teacher.joinedDate).toLocaleDateString("vi-VN")}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Kinh nghiệm</dt>
                <dd className="text-sm font-semibold text-foreground mt-0.5">{teacher.experienceYears} năm</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Bằng cấp</dt>
                <dd className="text-sm font-semibold text-foreground mt-0.5">{teacher.degree}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Mã giáo viên</dt>
                <dd className="text-sm font-mono font-semibold text-foreground mt-0.5">{teacher.id}</dd>
              </div>
            </dl>
          </div>

          {/* Phân công giảng dạy */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              <Calendar className="w-4 h-4 text-[#2563eb]" />
              Phân công giảng dạy
            </h2>
            {teacherSchedule.length === 0 ? (
              <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
                Chưa có tiết dạy được phân công trong dữ liệu mẫu.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                    <tr>
                      <th className="px-3 py-2">Lớp</th>
                      <th className="px-3 py-2">Chương trình</th>
                      <th className="px-3 py-2">Bộ môn</th>
                      <th className="px-3 py-2">Thứ</th>
                      <th className="px-3 py-2">Tiết</th>
                      <th className="px-3 py-2">Phòng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
                    {teacherSchedule.slice(0, 12).map((s) => (
                      <tr key={s.id} className="hover:bg-secondary/50">
                        <td className="px-3 py-2 font-semibold">{s.className}</td>
                        <td className="px-3 py-2">
                          <ProgramBadge code={s.programCode} size="xs" />
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{s.subject}</td>
                        <td className="px-3 py-2 text-muted-foreground">{WEEKDAY_LABELS[s.weekday] ?? `T${s.weekday + 1}`}</td>
                        <td className="px-3 py-2 text-muted-foreground">Tiết {s.period}</td>
                        <td className="px-3 py-2 text-muted-foreground" style={{ fontSize: "11px" }}>{s.roomName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tiến độ tập huấn */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              <Target className="w-4 h-4 text-[#2563eb]" />
              Tiến độ tập huấn
            </h2>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Hoàn thành chương trình tập huấn 5 năm</span>
                <span style={{ fontSize: "14px", fontWeight: 700 }}>{teacher.trainingProgress}%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${teacher.trainingProgress}%`,
                    background: "linear-gradient(90deg, #c8a84e, #990803)",
                  }}
                />
              </div>
            </div>
            <ul className="space-y-2 mt-2">
              {TRAINING_MILESTONES.map((m, i) => {
                const done = i < completedMilestones;
                return (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-[#16a34a]" : "bg-secondary"}`}
                      style={{ fontSize: "10px" }}
                    >
                      {done ? <span className="text-white">✓</span> : <span className="text-muted-foreground">{i + 1}</span>}
                    </span>
                    <span
                      className={done ? "text-foreground" : "text-muted-foreground"}
                      style={{ fontSize: "12.5px" }}
                    >
                      {m}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard icon={BookOpen} label="Tiết STEM" value={teacher.stemLessons} color="#2563eb" />
            <KpiCard icon={GraduationCap} label="Số lớp" value={teacher.classesCount} color="#7c3aed" />
            <KpiCard icon={Award} label="Chứng chỉ" value={teacher.certifications.length} color="#c8a84e" />
            <KpiCard icon={BarChart3} label="Tập huấn" value={`${teacher.trainingProgress}%`} color="#16a34a" />
          </div>

          {/* Chương trình phụ trách */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h2 className="flex items-center gap-2 text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              <Puzzle className="w-4 h-4 text-[#2563eb]" />
              Chương trình phụ trách
            </h2>
            <div className="space-y-2">
              {teacher.programs.map((code) => {
                const meta = STEM_PROGRAMS[code];
                return (
                  <div key={code} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <ProgramBadge code={code} size="sm" showName />
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                      {meta.supportedGrades.slice(0, 2).join(", ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-2">
            <h2 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 700 }}>Thao tác nhanh</h2>
            <button
              onClick={() => toast.info(`Nhắn tin cho ${teacher.name}`)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-secondary text-left"
              style={{ fontSize: "13px" }}
            >
              <Mail className="w-4 h-4 text-[#2563eb]" />
              Nhắn tin
            </button>
            <button
              onClick={() => toast.info(`Xem thời khóa biểu của ${teacher.name}`)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-secondary text-left"
              style={{ fontSize: "13px" }}
            >
              <Calendar className="w-4 h-4 text-[#7c3aed]" />
              Xem TKB
            </button>
            <button
              onClick={() => toast.info(`Gán thêm lớp cho ${teacher.name}`)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#2563eb] text-white hover:opacity-90"
              style={{ fontSize: "13px" }}
            >
              <UserCheck className="w-4 h-4" />
              Gán thêm lớp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherProfile;
