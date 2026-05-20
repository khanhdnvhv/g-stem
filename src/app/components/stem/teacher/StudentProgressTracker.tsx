import { useState } from "react";
import {
  Users, TrendingUp, AlertCircle, Award, Eye,
  Search, BarChart3, PenTool,
} from "lucide-react";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { ProgramBadge } from "../ui/badges";
import type { StemProgram } from "../../mock-data/index";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  STUDENT PROGRESS TRACKER (Teacher)                              */
/*  Theo dõi tiến độ học tập và điểm số của HS trong lớp phụ trách   */
/* ================================================================ */

interface StudentProgress {
  id: string;
  name: string;
  className: string;
  initials: string;
  programs: StemProgram[];
  practiceScore: number;    // 0-10
  examScore: number;        // 0-10
  participation: number;    // 0-100
  completedLessons: number;
  totalLessons: number;
  trend: "up" | "down" | "flat";
}

function buildProgress(): StudentProgress[] {
  const names = [
    "Lê Hoàng Nam", "Phạm Thu Trang", "Nguyễn Quang Huy",
    "Vũ Khánh Linh", "Trần Minh Đức", "Đỗ Ngọc Anh",
    "Hoàng Phương Mai", "Bùi Gia Bảo", "Lý Quang Minh",
    "Nguyễn Thúy Hằng", "Phan Trọng Nghĩa", "Đinh Yến Nhi",
  ];
  const programs: StemProgram[] = ["CT1", "CT2", "CT3", "CT4"];
  const trends: StudentProgress["trend"][] = ["up", "up", "up", "flat", "flat", "down"];

  return names.map((name, i) => ({
    id: `U-STU-${String(i + 1).padStart(3, "0")}`,
    name,
    className: "Lớp 8A",
    initials: name.split(" ").map((w) => w[0]).slice(-2).join(""),
    programs: [programs[i % programs.length], programs[(i + 1) % programs.length]],
    practiceScore: 6 + ((i * 7) % 40) / 10,
    examScore: 5.5 + ((i * 11) % 45) / 10,
    participation: 65 + (i * 3) % 35,
    completedLessons: 10 + (i * 2) % 15,
    totalLessons: 24,
    trend: trends[i % trends.length],
  }));
}

export function StudentProgressTracker() {
  const [students] = useState(buildProgress());
  const [search, setSearch] = useState("");

  const filtered = students.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const strugglingCount = students.filter((s) => s.examScore < 6).length;
  const excellingCount = students.filter((s) => s.examScore >= 8.5).length;
  const avgPractice = (students.reduce((s, st) => s + st.practiceScore, 0) / students.length).toFixed(1);
  const avgExam = (students.reduce((s, st) => s + st.examScore, 0) / students.length).toFixed(1);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Users}
        title="Theo dõi tiến độ học sinh"
        subtitle="Danh sách lớp phụ trách, theo dõi điểm số thực hành, điểm thi STEM và mức độ tham gia."
        accentColor="#0891b2"
        actions={
          <button onClick={() => toast.info("Xuất bảng điểm gửi phụ huynh")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0891b2] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <BarChart3 className="w-4 h-4" /> Xuất bảng điểm
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users} label="Học sinh phụ trách" value={students.length} color="#0891b2" />
        <KpiCard icon={TrendingUp} label="Điểm thực hành TB" value={avgPractice} color="#16a34a" />
        <KpiCard icon={Award} label="Xuất sắc (≥8.5)" value={excellingCount} color="#c8a84e" />
        <KpiCard icon={AlertCircle} label="Cần hỗ trợ (<6)" value={strugglingCount} color="#dc2626" trend="down" />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm học sinh..."
          className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
          style={{ fontSize: "13px" }} />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              <th className="px-4 py-2.5">Học sinh</th>
              <th className="px-4 py-2.5">Chương trình</th>
              <th className="px-4 py-2.5">Bài học</th>
              <th className="px-4 py-2.5">Thực hành</th>
              <th className="px-4 py-2.5">Điểm thi</th>
              <th className="px-4 py-2.5">Chuyên cần</th>
              <th className="px-4 py-2.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
            {filtered.map((s) => {
              const pct = Math.round((s.completedLessons / s.totalLessons) * 100);
              const isStrugggling = s.examScore < 6;
              const isExcelling = s.examScore >= 8.5;
              return (
                <tr key={s.id} className="hover:bg-secondary/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0" style={{
                        fontSize: "11px", fontWeight: 700,
                        background: isExcelling
                          ? "linear-gradient(145deg, #c8a84e, #a0832e)"
                          : isStrugggling
                          ? "linear-gradient(145deg, #dc2626, #991b1b)"
                          : "linear-gradient(145deg, #16a34a, #0f5132)",
                      }}>{s.initials}</div>
                      <div>
                        <p style={{ fontWeight: 500 }}>{s.name}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{s.className}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {s.programs.map((p) => <ProgramBadge key={p} code={p} size="xs" />)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: "11.5px", fontWeight: 500 }}>{s.completedLessons}/{s.totalLessons}</span>
                      <div className="w-14 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-[#16a34a]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{
                    fontSize: "13px", fontWeight: 700,
                    color: s.practiceScore >= 8 ? "#16a34a" : s.practiceScore >= 6.5 ? "#c8a84e" : "#dc2626",
                  }}>{s.practiceScore.toFixed(1)}</td>
                  <td className="px-4 py-3" style={{
                    fontSize: "13px", fontWeight: 700,
                    color: s.examScore >= 8 ? "#16a34a" : s.examScore >= 6.5 ? "#c8a84e" : "#dc2626",
                  }}>{s.examScore.toFixed(1)}</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>{s.participation}%</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toast.info(`Chấm điểm ${s.name}`)}
                      className="p-1.5 hover:bg-secondary rounded" title="Chấm điểm">
                      <PenTool className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => toast.info(`Xem chi tiết ${s.name}`)}
                      className="p-1.5 hover:bg-secondary rounded ml-1" title="Chi tiết">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentProgressTracker;
