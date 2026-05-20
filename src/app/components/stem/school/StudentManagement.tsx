import { useState } from "react";
import {
  UsersRound, Plus, Search, Upload, ShieldCheck, GraduationCap,
  TrendingUp, Star,
} from "lucide-react";
import { tenantsByType, GRADE_LEVELS } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "@/app/lib/toast";

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
    return {
      id: `U-STU-${String(i + 1).padStart(3, "0")}`,
      name,
      className: cls.name,
      gradeLevel: cls.grade,
      vneidVerified: i % 3 !== 0,
      avgStemScore: 5.5 + ((i * 17) % 45) / 10,
      licensedProducts: 2 + (i % 4),
      completedLessons: 8 + ((i * 7) % 20),
      avatarInitials: name.split(" ").map((w) => w[0]).slice(-2).join(""),
    };
  });
}

export function StudentManagement() {
  const { user } = useAuth();
  const _tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const [students] = useState(buildStudents());
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string | "all">("all");

  const classes = Array.from(new Set(students.map((s) => s.className)));

  const filtered = students.filter((s) => {
    if (classFilter !== "all" && s.className !== classFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const vneidCount = students.filter((s) => s.vneidVerified).length;
  const avgScore = (students.reduce((s, st) => s + st.avgStemScore, 0) / students.length).toFixed(1);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={UsersRound}
        title="Quản lý Học sinh"
        subtitle="Danh sách học sinh, cấp/thu license STEM, theo dõi điểm và tiến độ học tập."
        accentColor="#2563eb"
        actions={
          <>
            <button
              onClick={() => toast.info("Import danh sách học sinh từ Excel")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Upload className="w-4 h-4" />
              Import Excel
            </button>
            <button
              onClick={() => toast.success("Thêm học sinh mới")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Plus className="w-4 h-4" />
              Thêm học sinh
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={UsersRound} label="Tổng học sinh" value={students.length} color="#2563eb" />
        <KpiCard icon={ShieldCheck} label="Đã xác thực VNeID" value={`${vneidCount}/${students.length}`} color="#16a34a" subtitle={`${Math.round(vneidCount / students.length * 100)}% tỷ lệ`} />
        <KpiCard icon={TrendingUp} label="Điểm STEM TB" value={avgScore} color="#c8a84e" change="+0.3" trend="up" />
        <KpiCard icon={Star} label="Lớp có HS STEM" value={classes.length} color="#7c3aed" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm học sinh..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }}
          />
        </div>
        <button onClick={() => setClassFilter("all")}
          className={`px-3 py-2 rounded-lg border ${
            classFilter === "all" ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-card border-border hover:bg-secondary"
          }`} style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả
        </button>
        {classes.map((c) => (
          <button key={c} onClick={() => setClassFilter(c)}
            className={`px-3 py-2 rounded-lg border ${classFilter === c ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-card border-border hover:bg-secondary"}`}
            style={{ fontSize: "12px", fontWeight: 500 }}>
            {c} ({students.filter((s) => s.className === c).length})
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              <th className="px-4 py-2.5">Mã</th>
              <th className="px-4 py-2.5">Họ tên</th>
              <th className="px-4 py-2.5">Lớp</th>
              <th className="px-4 py-2.5">VNeID</th>
              <th className="px-4 py-2.5">Bài học</th>
              <th className="px-4 py-2.5">License</th>
              <th className="px-4 py-2.5">Điểm STEM TB</th>
              <th className="px-4 py-2.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-4 py-3 font-mono" style={{ fontSize: "11px", fontWeight: 600 }}>{s.id}</td>
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
                <td className="px-4 py-3">
                  <span className="px-1.5 py-0.5 bg-secondary rounded" style={{ fontSize: "10.5px", fontWeight: 600 }}>
                    {s.className}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {s.vneidVerified ? (
                    <span className="inline-flex items-center gap-1 text-[#16a34a]" style={{ fontSize: "11px", fontWeight: 600 }}>
                      <ShieldCheck className="w-3.5 h-3.5" /> Đã xác thực
                    </span>
                  ) : (
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Chưa</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>{s.completedLessons} bài</td>
                <td className="px-4 py-3">
                  <span className="px-1.5 py-0.5 bg-[#c8a84e]/15 text-[#c8a84e] rounded" style={{ fontSize: "11px", fontWeight: 600 }}>
                    {s.licensedProducts} ứng dụng
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span style={{
                    fontSize: "13px", fontWeight: 700,
                    color: s.avgStemScore >= 8 ? "#16a34a" : s.avgStemScore >= 6.5 ? "#c8a84e" : "#dc2626",
                  }}>
                    {s.avgStemScore.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toast.info(`Xem hồ sơ ${s.name}`)} className="p-1.5 hover:bg-secondary rounded">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentManagement;
