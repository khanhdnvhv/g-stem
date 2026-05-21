import { useState } from "react";
import { Link } from "react-router";
import {
  UsersRound, Search, ShieldCheck, GraduationCap,
  Star, XCircle, BookOpen, KeyRound,
} from "lucide-react";
import { tenantsByType } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";


/* ================================================================ */
/*  STUDENT MANAGEMENT (School) — quản lý học sinh                  */
/* ================================================================ */

interface StudentInfo {
  id: string;
  name: string;
  className: string;
  gradeLevel: string;
  vneidVerified: boolean;
  avgStemScore: number;
  licensedProducts: number;
  completedLessons: number;
  avatarInitials: string;
  stemProgressPct: number;
  licenseStatus: "Có" | "Không có" | "Hết hạn";
  status: "Đang học" | "Chuyển trường" | "Thôi học";
}

function buildStudents(): StudentInfo[] {
  const names = [
    "Lê Hoàng Nam", "Phạm Thu Trang", "Nguyễn Quang Huy", "Vũ Khánh Linh",
    "Trần Minh Đức", "Đỗ Ngọc Anh", "Hoàng Phương Mai", "Bùi Gia Bảo",
    "Lý Quang Minh", "Nguyễn Thúy Hằng", "Phan Trọng Nghĩa", "Đinh Yến Nhi",
    "Vương Tấn Phát", "Tô Hải Đăng", "Chu Khánh My", "Nguyễn Tuấn Kiệt",
    "Phạm Khánh Linh", "Lê Bảo Ngọc", "Trần Anh Thư", "Hoàng Minh Quân",
  ];
  const classes = [
    { name: "Lớp 6A", grade: "THCS 6" },
    { name: "Lớp 7A", grade: "THCS 7" },
    { name: "Lớp 8A", grade: "THCS 8" },
    { name: "Lớp 9A", grade: "THCS 9" },
  ];
  return names.map((name, i) => {
    const cls = classes[i % classes.length];
    const completedLessons = 8 + ((i * 7) % 20);
    const licenseStatus: StudentInfo["licenseStatus"] =
      i % 6 === 0 ? "Hết hạn" : i % 4 === 0 ? "Không có" : "Có";
    const status: StudentInfo["status"] =
      i % 15 === 0 ? "Chuyển trường" : i % 11 === 0 ? "Thôi học" : "Đang học";
    return {
      id: `U-STU-${String(i + 1).padStart(3, "0")}`,
      name,
      className: cls.name,
      gradeLevel: cls.grade,
      vneidVerified: i % 3 !== 0,
      avgStemScore: 5.5 + ((i * 17) % 45) / 10,
      licensedProducts: 2 + (i % 4),
      completedLessons,
      avatarInitials: name.split(" ").map((w) => w[0]).slice(-2).join(""),
      stemProgressPct: Math.min(100, Math.round(completedLessons / 28 * 100)),
      licenseStatus,
      status,
    };
  });
}

export function StudentManagement() {
  const { user } = useAuth();
  const _tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const [students] = useState(buildStudents());
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string | "all">("all");
  const [gradeFilter, setGradeFilter] = useState<string | "all">("all");
  const [licenseFilter, setLicenseFilter] = useState<string>("Tất cả");
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả");

  const classes = Array.from(new Set(students.map((s) => s.className)));
  const gradeLevels = Array.from(new Set(students.map((s) => s.gradeLevel)));

  const filtered = students.filter((s) => {
    if (classFilter !== "all" && s.className !== classFilter) return false;
    if (gradeFilter !== "all" && s.gradeLevel !== gradeFilter) return false;
    if (licenseFilter !== "Tất cả" && s.licenseStatus !== licenseFilter) return false;
    if (statusFilter !== "Tất cả" && s.status !== statusFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const vneidCount = students.filter((s) => s.vneidVerified).length;
  const avgScore = (students.reduce((s, st) => s + st.avgStemScore, 0) / students.length).toFixed(1);
  const noLicenseCount = students.filter((s) => s.licenseStatus === "Không có").length;
  const notStartedCount = students.filter((s) => s.stemProgressPct === 0).length;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={UsersRound}
        title="Quản lý Học sinh"
        subtitle="Danh sách học sinh, cấp/thu license STEM, theo dõi điểm và tiến độ học tập."
        accentColor="#990803"
        actions={
          <Link
            to="/school/license-assign"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <KeyRound className="w-4 h-4" />
            Gán License
          </Link>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={UsersRound} label="Tổng học sinh" value={students.length} color="#2563eb" />
        <KpiCard
          icon={XCircle}
          label="Chưa có License"
          value={noLicenseCount}
          color="#dc2626"
          subtitle={`/ ${students.length} HS`}
        />
        <KpiCard
          icon={BookOpen}
          label="Chưa bắt đầu STEM"
          value={notStartedCount}
          color="#c8a84e"
          subtitle="tiến độ 0%"
        />
        <KpiCard
          icon={Star}
          label="Điểm STEM TB"
          value={avgScore}
          color="#16a34a"
          change="+0.3"
          trend="up"
        />
      </div>

      {/* Filter bar */}
      <div className="space-y-2">
        {/* Row 1: search + class tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm học sinh..."
              className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-[#990803]"
              style={{ fontSize: "13px" }}
            />
          </div>
          <button onClick={() => setClassFilter("all")}
            className={`px-3 py-2 rounded-lg border ${
              classFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"
            }`} style={{ fontSize: "12px", fontWeight: 500 }}>
            Tất cả lớp
          </button>
          {classes.map((c) => (
            <button key={c} onClick={() => setClassFilter(c)}
              className={`px-3 py-2 rounded-lg border ${classFilter === c ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
              style={{ fontSize: "12px", fontWeight: 500 }}>
              {c} ({students.filter((s) => s.className === c).length})
            </button>
          ))}
        </div>

        {/* Row 2: grade + license + status filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bậc học */}
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-[#990803]"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            <option value="all">Tất cả bậc học</option>
            {gradeLevels.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {/* License status */}
          <select
            value={licenseFilter}
            onChange={(e) => setLicenseFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-[#990803]"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            {["Tất cả", "Có", "Không có", "Hết hạn"].map((opt) => (
              <option key={opt} value={opt}>License: {opt}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-[#990803]"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            {["Tất cả", "Đang học", "Chuyển trường", "Thôi học"].map((opt) => (
              <option key={opt} value={opt}>Trạng thái: {opt}</option>
            ))}
          </select>

          {(gradeFilter !== "all" || licenseFilter !== "Tất cả" || statusFilter !== "Tất cả") && (
            <button
              onClick={() => { setGradeFilter("all"); setLicenseFilter("Tất cả"); setStatusFilter("Tất cả"); }}
              className="px-3 py-2 rounded-lg border border-border bg-card hover:bg-secondary text-muted-foreground"
              style={{ fontSize: "12px" }}
            >
              Xóa bộ lọc
            </button>
          )}

          <span className="text-muted-foreground ml-auto" style={{ fontSize: "11.5px" }}>
            {filtered.length} / {students.length} học sinh
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <tr>
                <th className="px-4 py-2.5 whitespace-nowrap">Mã</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Họ tên</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Lớp</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Bậc học</th>
                <th className="px-4 py-2.5 whitespace-nowrap">VNeID</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Bài học</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Tiến độ STEM</th>
                <th className="px-4 py-2.5 whitespace-nowrap">License</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Trạng thái</th>
                <th className="px-4 py-2.5 whitespace-nowrap">Điểm STEM TB</th>
                <th className="px-4 py-2.5 text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
                    Không tìm thấy học sinh nào.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-secondary/50 transition-colors">
                    {/* Mã */}
                    <td className="px-4 py-3 font-mono" style={{ fontSize: "11px", fontWeight: 600 }}>{s.id}</td>

                    {/* Họ tên */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0" style={{
                          fontSize: "11px", fontWeight: 700,
                          background: "linear-gradient(145deg, #16a34a, #0f5132)",
                        }}>
                          {s.avatarInitials}
                        </div>
                        <span style={{ fontWeight: 500 }}>{s.name}</span>
                      </div>
                    </td>

                    {/* Lớp */}
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 bg-secondary rounded" style={{ fontSize: "10.5px", fontWeight: 600 }}>
                        {s.className}
                      </span>
                    </td>

                    {/* Bậc học */}
                    <td className="px-4 py-3">
                      <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{s.gradeLevel}</span>
                    </td>

                    {/* VNeID */}
                    <td className="px-4 py-3">
                      {s.vneidVerified ? (
                        <span className="inline-flex items-center gap-1 text-[#16a34a]" style={{ fontSize: "11px", fontWeight: 600 }}>
                          <ShieldCheck className="w-3.5 h-3.5" /> Đã xác thực
                        </span>
                      ) : (
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Chưa</span>
                      )}
                    </td>

                    {/* Bài học */}
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>{s.completedLessons} bài</td>

                    {/* Tiến độ STEM */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.stemProgressPct}%`,
                              backgroundColor: s.stemProgressPct >= 80 ? "#16a34a" : s.stemProgressPct >= 50 ? "#2563eb" : "#c8a84e",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 600, minWidth: "30px", textAlign: "right" }}>
                          {s.stemProgressPct}%
                        </span>
                      </div>
                    </td>

                    {/* License badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          s.licenseStatus === "Có"
                            ? "bg-green-100 text-green-700"
                            : s.licenseStatus === "Không có"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                        style={{ fontSize: "11px", fontWeight: 600 }}
                      >
                        {s.licenseStatus}
                      </span>
                    </td>

                    {/* Trạng thái badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          s.status === "Đang học"
                            ? "bg-green-100 text-green-700"
                            : s.status === "Chuyển trường"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                        style={{ fontSize: "11px", fontWeight: 600 }}
                      >
                        {s.status}
                      </span>
                    </td>

                    {/* Điểm STEM TB */}
                    <td className="px-4 py-3">
                      <span style={{
                        fontSize: "13px", fontWeight: 700,
                        color: s.avgStemScore >= 8 ? "#16a34a" : s.avgStemScore >= 6.5 ? "#c8a84e" : "#dc2626",
                      }}>
                        {s.avgStemScore.toFixed(1)}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="px-4 py-3 text-right">
                      <Link to={`/school/students/${s.id}`} className="p-1.5 hover:bg-secondary rounded inline-flex" title="Xem hồ sơ học sinh">
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentManagement;
