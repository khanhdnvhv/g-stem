import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  UserCheck, Search, Download, Eye, KeyRound, Bell, ChevronRight,
  GraduationCap, Award, BookOpen,
} from "lucide-react";
import { scheduleEntries, tenantsByType, STEM_PROGRAMS } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  TEACHER MANAGEMENT — bảng danh sách GV STEM                    */
/*  Spec: FINAL §4 Module B [3.3]                                   */
/* ================================================================ */

type LicenseStatus   = "Có" | "Không có" | "Hết hạn";
type TrainingStatus  = "Hoàn thành" | "Đang học" | "Chưa bắt đầu";
type EmployeeStatus  = "active" | "leave" | "resigned";

interface TeacherRow {
  id: string;
  name: string;
  subject: string;
  programs: StemProgram[];
  classes: string[];
  licenseStatus: LicenseStatus;
  trainingStatus: TrainingStatus;
  trainingPct: number;
  status: EmployeeStatus;
  email: string;
  avatarInitials: string;
}

const SUBJECTS = ["Toán","Lý","Hóa","Sinh","Tin học","Công nghệ","Khoa học TN","Tiếng Việt"];
const NAMES = [
  "Phạm Anh Tuấn","Nguyễn Thị Lan","Trần Văn Hùng","Lê Minh Trang",
  "Vũ Thanh Hương","Đặng Tuấn Anh","Bùi Thu Hà","Nguyễn Văn Dũng",
];
const LICENSE_STATUSES: LicenseStatus[] = ["Có","Không có","Hết hạn"];
const TRAINING_STATUSES: TrainingStatus[] = ["Hoàn thành","Đang học","Chưa bắt đầu"];

function buildTeachers(schoolId: string): TeacherRow[] {
  const schoolEntries = scheduleEntries.filter((s) => s.schoolId === schoolId);
  return NAMES.map((name, i) => {
    const teacherId = `U-TCH-${String(i + 1).padStart(2, "0")}`;
    const myEntries = schoolEntries.filter((s) => s.teacherId === teacherId);
    const programs  = Array.from(new Set(myEntries.map((e) => e.programCode))) as StemProgram[];
    const classes   = Array.from(new Set(myEntries.map((e) => e.className)));
    const pct       = 40 + (i * 8) % 60;
    const training: TrainingStatus = pct >= 100 ? "Hoàn thành" : pct >= 40 ? "Đang học" : "Chưa bắt đầu";
    const lic: LicenseStatus = i % 7 === 0 ? "Hết hạn" : i % 5 === 0 ? "Không có" : "Có";
    const st: EmployeeStatus = i % 9 === 0 ? "leave" : "active";
    return {
      id: teacherId, name,
      subject: SUBJECTS[i % SUBJECTS.length],
      programs: programs.length ? programs : [("CT" + ((i % 5) + 1)) as StemProgram],
      classes: classes.length ? classes : [`${6 + (i % 4)}A`],
      licenseStatus: lic,
      trainingStatus: training,
      trainingPct: pct,
      status: st,
      email: `gv${i + 1}@thcs-school.edu.vn`,
      avatarInitials: name.split(" ").map((w) => w[0]).slice(-2).join(""),
    };
  });
}

const LICENSE_BADGE: Record<LicenseStatus, { cls: string; label: string }> = {
  "Có":       { cls: "bg-green-100 text-green-700",   label: "Có license"  },
  "Không có": { cls: "bg-red-100 text-red-700",       label: "Thiếu license" },
  "Hết hạn":  { cls: "bg-amber-100 text-amber-700",   label: "Hết hạn"     },
};
const TRAINING_BADGE: Record<TrainingStatus, { cls: string }> = {
  "Hoàn thành":    { cls: "bg-green-100 text-green-700" },
  "Đang học":      { cls: "bg-blue-100 text-blue-700"   },
  "Chưa bắt đầu": { cls: "bg-gray-100 text-gray-600"   },
};
const STATUS_BADGE: Record<EmployeeStatus, { label: string; cls: string }> = {
  active:   { label: "Đang dạy",  cls: "bg-green-100 text-green-700" },
  leave:    { label: "Nghỉ phép", cls: "bg-amber-100 text-amber-700" },
  resigned: { label: "Đã nghỉ",   cls: "bg-gray-100 text-gray-500"   },
};

export function TeacherManagement() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const tenantId   = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;
  const [teachers] = useState(() => buildTeachers(tenantId));

  const [search,          setSearch]          = useState("");
  const [subjectFilter,   setSubjectFilter]   = useState("all");
  const [programFilter,   setProgramFilter]   = useState<StemProgram | "all">("all");
  const [licenseFilter,   setLicenseFilter]   = useState<LicenseStatus | "all">("all");
  const [trainingFilter,  setTrainingFilter]  = useState<TrainingStatus | "all">("all");
  const [statusFilter,    setStatusFilter]    = useState<EmployeeStatus | "all">("all");

  const subjects = Array.from(new Set(teachers.map((t) => t.subject)));

  const filtered = teachers.filter((t) => {
    if (subjectFilter  !== "all" && t.subject        !== subjectFilter)  return false;
    if (programFilter  !== "all" && !t.programs.includes(programFilter)) return false;
    if (licenseFilter  !== "all" && t.licenseStatus  !== licenseFilter)  return false;
    if (trainingFilter !== "all" && t.trainingStatus !== trainingFilter) return false;
    if (statusFilter   !== "all" && t.status         !== statusFilter)   return false;
    if (search) {
      const s = search.toLowerCase();
      if (!t.name.toLowerCase().includes(s) && !t.subject.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const noLicense    = teachers.filter((t) => t.licenseStatus !== "Có").length;
  const notTrained   = teachers.filter((t) => t.trainingStatus !== "Hoàn thành").length;
  const avgTraining  = Math.round(teachers.reduce((s,t) => s + t.trainingPct, 0) / teachers.length);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={UserCheck}
        title="Quản lý Giáo viên STEM"
        subtitle="Danh sách GV, phân công CT, trạng thái license và tiến độ tập huấn Mức B."
        accentColor="#990803"
        actions={
          <>
            <button
              onClick={() => toast.info("Xuất Excel danh sách GV STEM")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize:"13px", fontWeight:500 }}>
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
            <Link to="/school/license-assign"
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
              style={{ fontSize:"13px", fontWeight:500, textDecoration:"none" }}>
              <KeyRound className="w-4 h-4" /> Gán License
            </Link>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={UserCheck}     label="Tổng GV STEM"        value={teachers.length} color="#2563eb" />
        <KpiCard icon={KeyRound}      label="Thiếu / Hết hạn LIC" value={noLicense}        color={noLicense > 0 ? "#dc2626" : "#16a34a"} />
        <KpiCard icon={BookOpen}      label="Chưa hoàn thành TH"  value={notTrained}       color={notTrained > 0 ? "#f59e0b" : "#16a34a"} />
        <KpiCard icon={GraduationCap} label="Tập huấn TB"          value={`${avgTraining}%`} color="#c8a84e" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm giáo viên, bộ môn..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize:"13px" }} />
        </div>
        <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg outline-none" style={{ fontSize:"12px" }}>
          <option value="all">Tất cả bộ môn</option>
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value as StemProgram | "all")}
          className="px-3 py-2 bg-card border border-border rounded-lg outline-none" style={{ fontSize:"12px" }}>
          <option value="all">Tất cả CT</option>
          {(Object.keys(STEM_PROGRAMS) as StemProgram[]).map((ct) => (
            <option key={ct} value={ct}>{ct}</option>
          ))}
        </select>
        <select value={licenseFilter} onChange={(e) => setLicenseFilter(e.target.value as LicenseStatus | "all")}
          className="px-3 py-2 bg-card border border-border rounded-lg outline-none" style={{ fontSize:"12px" }}>
          <option value="all">License: Tất cả</option>
          {LICENSE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={trainingFilter} onChange={(e) => setTrainingFilter(e.target.value as TrainingStatus | "all")}
          className="px-3 py-2 bg-card border border-border rounded-lg outline-none" style={{ fontSize:"12px" }}>
          <option value="all">Tập huấn: Tất cả</option>
          {TRAINING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as EmployeeStatus | "all")}
          className="px-3 py-2 bg-card border border-border rounded-lg outline-none" style={{ fontSize:"12px" }}>
          <option value="all">Trạng thái: Tất cả</option>
          <option value="active">Đang dạy</option>
          <option value="leave">Nghỉ phép</option>
          <option value="resigned">Đã nghỉ</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground"
              style={{ fontSize:"11px", fontWeight:600 }}>
              <tr>
                <th className="px-4 py-2.5">Giáo viên</th>
                <th className="px-4 py-2.5">Bộ môn</th>
                <th className="px-4 py-2.5">CT phụ trách</th>
                <th className="px-4 py-2.5">Lớp phụ trách</th>
                <th className="px-4 py-2.5">License</th>
                <th className="px-4 py-2.5">Tập huấn</th>
                <th className="px-4 py-2.5">Trạng thái</th>
                <th className="px-4 py-2.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" style={{ fontSize:"12.5px" }}>
              {filtered.map((t) => {
                const lic  = LICENSE_BADGE[t.licenseStatus];
                const trn  = TRAINING_BADGE[t.trainingStatus];
                const stt  = STATUS_BADGE[t.status];
                return (
                  <tr key={t.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#990803] text-white flex items-center justify-center shrink-0"
                          style={{ fontSize:"11px", fontWeight:700 }}>
                          {t.avatarInitials}
                        </div>
                        <div>
                          <p style={{ fontWeight:600 }}>{t.name}</p>
                          <p className="text-muted-foreground" style={{ fontSize:"11px" }}>{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.subject}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {t.programs.map((p) => <ProgramBadge key={p} code={p} size="xs" />)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize:"11.5px" }}>
                      {t.classes.slice(0,3).join(", ")}
                      {t.classes.length > 3 && ` +${t.classes.length - 3}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${lic.cls}`}>
                        {lic.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${trn.cls}`}>
                          {t.trainingStatus}
                        </span>
                        <div className="w-20 h-1 bg-secondary rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-[#c8a84e]" style={{ width:`${t.trainingPct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stt.cls}`}>
                        {stt.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/school/teachers/${t.id}`}
                          className="p-1.5 hover:bg-secondary rounded" title="Xem hồ sơ"
                          style={{ textDecoration:"none" }}>
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </Link>
                        <button onClick={() => navigate("/school/license-assign")}
                          className="p-1.5 hover:bg-secondary rounded" title="Gán license">
                          <KeyRound className="w-4 h-4 text-[#2563eb]" />
                        </button>
                        <button
                          onClick={() => toast.info(`Đã gửi nhắc nhở tập huấn đến ${t.name}`)}
                          className="p-1.5 hover:bg-secondary rounded" title="Nhắc tập huấn">
                          <Bell className="w-4 h-4 text-[#c8a84e]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground" style={{ fontSize:"12px" }}>
            Không có giáo viên khớp điều kiện.
          </div>
        )}
        <div className="px-4 py-2.5 border-t border-border text-muted-foreground bg-secondary/20"
          style={{ fontSize:"11.5px" }}>
          Hiển thị {filtered.length} / {teachers.length} giáo viên
          {noLicense > 0 && (
            <span className="ml-3 text-red-600 font-semibold">
              · {noLicense} GV thiếu / hết hạn license
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeacherManagement;
