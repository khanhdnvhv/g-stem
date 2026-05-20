import { useState } from "react";
import {
  UserCheck, Plus, Search, Mail, Phone, Award,
  GraduationCap, Puzzle, BookOpen, Eye,
} from "lucide-react";
import { scheduleEntries, tenantsByType, STEM_PROGRAMS } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  TEACHER MANAGEMENT (School) — quản lý GV STEM của trường         */
/* ================================================================ */

interface TeacherInfo {
  id: string;
  name: string;
  subject: string;
  email: string;
  phone: string;
  classesCount: number;
  stemLessons: number;
  programs: StemProgram[];
  trainingProgress: number;
  certifications: number;
  avatarInitials: string;
}

function buildTeachers(schoolId: string): TeacherInfo[] {
  const subjects = ["Toán", "Lý", "Hóa", "Sinh", "Tin học", "Công nghệ", "Khoa học Tự nhiên", "Tiếng Việt"];
  const names = [
    "Phạm Anh Tuấn", "Nguyễn Thị Lan", "Trần Văn Hùng", "Lê Minh Trang",
    "Vũ Thanh Hương", "Đặng Tuấn Anh", "Bùi Thu Hà", "Nguyễn Văn Dũng",
    "Phan Thị Mai", "Hoàng Gia Bảo",
  ];
  const programs: StemProgram[] = ["CT1", "CT2", "CT3", "CT4", "CT5"];
  const schoolEntries = scheduleEntries.filter((s) => s.schoolId === schoolId);
  return names.slice(0, 8).map((name, i) => {
    const teacherId = `U-TCH-${String(i + 1).padStart(2, "0")}`;
    const myEntries = schoolEntries.filter((s) => s.teacherId === teacherId);
    const myPrograms = Array.from(new Set(myEntries.map((e) => e.programCode)));
    return {
      id: teacherId, name,
      subject: subjects[i % subjects.length],
      email: `gv${i + 1}@thcs-school.edu.vn`,
      phone: `090${(1000000 + i * 12345).toString().slice(0, 7)}`,
      classesCount: new Set(myEntries.map((e) => e.classId)).size || 2 + (i % 3),
      stemLessons: myEntries.length || 3 + i,
      programs: myPrograms.length ? myPrograms : [programs[i % 5]],
      trainingProgress: 40 + (i * 8) % 60,
      certifications: 1 + (i % 3),
      avatarInitials: name.split(" ").map((w) => w[0]).slice(-2).join(""),
    };
  });
}

export function TeacherManagement() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;
  const [teachers] = useState(buildTeachers(tenantId));
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<StemProgram | "all">("all");

  const filtered = teachers.filter((t) => {
    if (programFilter !== "all" && !t.programs.includes(programFilter)) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!t.name.toLowerCase().includes(s) && !t.subject.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const totalLessons = teachers.reduce((s, t) => s + t.stemLessons, 0);
  const avgTraining = Math.round(teachers.reduce((s, t) => s + t.trainingProgress, 0) / teachers.length);
  const totalCerts = teachers.reduce((s, t) => s + t.certifications, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={UserCheck}
        title="Quản lý Giáo viên STEM"
        subtitle="Danh sách giáo viên STEM, phân công chương trình dạy, tiến độ tập huấn và chứng chỉ."
        accentColor="#2563eb"
        actions={
          <button
            onClick={() => toast.success("Thêm giáo viên vào trường và gán license")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Plus className="w-4 h-4" />
            Thêm giáo viên
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={UserCheck} label="Tổng GV STEM" value={teachers.length} color="#2563eb" />
        <KpiCard icon={BookOpen} label="Tiết STEM/tuần" value={totalLessons} color="#7c3aed" />
        <KpiCard icon={GraduationCap} label="Tiến độ tập huấn TB" value={`${avgTraining}%`} color="#c8a84e" />
        <KpiCard icon={Award} label="Chứng chỉ" value={totalCerts} color="#16a34a" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm giáo viên, bộ môn..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }}
          />
        </div>
        <button onClick={() => setProgramFilter("all")}
          className={`px-3 py-2 rounded-lg border ${
            programFilter === "all" ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-card border-border hover:bg-secondary"
          }`} style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả
        </button>
        {(Object.keys(STEM_PROGRAMS) as StemProgram[]).map((code) => {
          const p = STEM_PROGRAMS[code];
          const count = teachers.filter((t) => t.programs.includes(code)).length;
          const active = programFilter === code;
          return (
            <button key={code} onClick={() => setProgramFilter(code)}
              className={`px-3 py-2 rounded-lg border ${active ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"}`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(active ? { backgroundColor: p.color } : {}),
              }}>
              {code} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((t) => (
          <div key={t.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0" style={{
                fontSize: "14px", fontWeight: 700,
                background: "linear-gradient(145deg, #2563eb, #1e40af)",
              }}>
                {t.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-foreground" style={{ fontSize: "13px", fontWeight: 700 }}>{t.name}</h3>
                <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
                  GV {t.subject}
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {t.programs.map((p) => <ProgramBadge key={p} code={p} size="xs" />)}
                </div>
              </div>
              <button onClick={() => toast.info(`Xem hồ sơ ${t.name}`)} className="p-1.5 hover:bg-secondary rounded" title="Chi tiết">
                <Eye className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 py-2 border-y border-border">
              <div className="text-center">
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Lớp</p>
                <p style={{ fontSize: "15px", fontWeight: 700 }}>{t.classesCount}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Tiết/tuần</p>
                <p style={{ fontSize: "15px", fontWeight: 700 }}>{t.stemLessons}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Chứng chỉ</p>
                <p className="text-[#c8a84e]" style={{ fontSize: "15px", fontWeight: 700 }}>{t.certifications}</p>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Tập huấn STEM 5 năm</span>
                <span style={{ fontSize: "11px", fontWeight: 600 }}>{t.trainingProgress}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#c8a84e] to-[#990803]"
                  style={{ width: `${t.trainingProgress}%` }} />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-muted-foreground" style={{ fontSize: "10.5px" }}>
              <a href={`mailto:${t.email}`} className="flex items-center gap-1 hover:text-[#2563eb] truncate">
                <Mail className="w-3 h-3" /> {t.email}
              </a>
              <a href={`tel:${t.phone}`} className="flex items-center gap-1 hover:text-[#2563eb]">
                <Phone className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeacherManagement;
