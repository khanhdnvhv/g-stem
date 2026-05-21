import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  UsersRound, Search, GraduationCap, BookOpen,
  Calendar, Layers, Target, Filter, UserCheck,
} from "lucide-react";
import { classesBySchool, tenantsByType, type SchoolClass } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { ProgramBadge } from "../ui/badges";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  CLASS MANAGEMENT (School Principal) — Quản lý lớp học STEM       */
/* ================================================================ */

export function ClassManagement() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;
  const classes = classesBySchool(tenantId);

  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | "all">("all");
  const [assignDialog, setAssignDialog] = useState<{ open: boolean; className: string } | null>(null);
  const navigate = useNavigate();

  const filtered = classes.filter((cls) => {
    if (gradeFilter !== "all" && cls.grade !== gradeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !cls.name.toLowerCase().includes(s) &&
        !cls.homeroomTeacherName.toLowerCase().includes(s) &&
        !cls.stemTeacherName.toLowerCase().includes(s)
      )
        return false;
    }
    return true;
  });

  const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);
  const stemIntensive = classes.filter((c) => c.weeklySTEMPeriods >= 3).length;
  const avgScore =
    classes.length > 0
      ? (classes.reduce((sum, c) => sum + c.avgSTEMScore, 0) / classes.length).toFixed(1)
      : "0.0";

  // STEM teacher → class count mapping
  const stemTeacherMap: Record<string, { name: string; count: number }> = {};
  for (const cls of classes) {
    if (!stemTeacherMap[cls.stemTeacherId]) {
      stemTeacherMap[cls.stemTeacherId] = { name: cls.stemTeacherName, count: 0 };
    }
    stemTeacherMap[cls.stemTeacherId].count++;
  }
  const stemTeachers = Object.entries(stemTeacherMap).sort((a, b) => b[1].count - a[1].count);

  const GRADE_TABS: Array<{ label: string; value: number | "all" }> = [
    { label: "Tất cả", value: "all" },
    { label: "Lớp 6", value: 6 },
    { label: "Lớp 7", value: 7 },
    { label: "Lớp 8", value: 8 },
    { label: "Lớp 9", value: 9 },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        icon={UsersRound}
        title="Quản lý Lớp học"
        subtitle="Danh sách lớp, phân công giáo viên STEM và theo dõi tiến độ."
        accentColor="#990803"
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          icon={UsersRound}
          label="Tổng số lớp"
          value={classes.length}
          color="#2563eb"
        />
        <KpiCard
          icon={GraduationCap}
          label="Tổng học sinh"
          value={totalStudents.toLocaleString("vi-VN")}
          color="#7c3aed"
        />
        <KpiCard
          icon={Calendar}
          label="Lớp ≥ 3 tiết STEM/tuần"
          value={stemIntensive}
          subtitle={`/ ${classes.length} lớp`}
          color="#c8a84e"
        />
        <KpiCard
          icon={Target}
          label="Điểm TB STEM toàn trường"
          value={avgScore}
          color="#16a34a"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm lớp, GVCN, GV STEM..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-[#990803]"
            style={{ fontSize: "13px" }}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {GRADE_TABS.map((tab) => (
            <button
              key={String(tab.value)}
              onClick={() => setGradeFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                gradeFilter === tab.value
                  ? "bg-[#990803] text-white border-[#990803]"
                  : "bg-card border-border hover:bg-secondary text-foreground"
              }`}
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                {[
                  "Lớp",
                  "Sĩ số",
                  "GVCN",
                  "GV STEM",
                  "CT STEM",
                  "Khóa STEM đang học",
                  "Tiết/tuần",
                  "Phòng học",
                  "Điểm TB",
                  "Thao tác",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-muted-foreground whitespace-nowrap"
                    style={{ fontSize: "11px", fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
                    Không tìm thấy lớp nào.
                  </td>
                </tr>
              ) : (
                filtered.map((cls) => {
                  const isHighScore = cls.avgSTEMScore >= 8.0;
                  return (
                    <tr
                      key={cls.id}
                      className={`border-b border-border last:border-0 hover:bg-secondary/30 transition-colors ${
                        isHighScore ? "bg-green-50/40 dark:bg-green-950/10" : ""
                      }`}
                    >
                      {/* Lớp */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: "#2563eb15" }}
                          >
                            <BookOpen className="w-3.5 h-3.5" style={{ color: "#2563eb" }} />
                          </div>
                          <div>
                            <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
                              {cls.name}
                            </p>
                            <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                              {cls.academicYear}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Sĩ số */}
                      <td className="px-4 py-3">
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>{cls.studentCount}</span>
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}> HS</span>
                      </td>
                      {/* GVCN */}
                      <td className="px-4 py-3">
                        <p className="text-foreground whitespace-nowrap" style={{ fontSize: "12.5px" }}>
                          {cls.homeroomTeacherName}
                        </p>
                      </td>
                      {/* GV STEM */}
                      <td className="px-4 py-3">
                        <p className="text-foreground whitespace-nowrap" style={{ fontSize: "12.5px" }}>
                          {cls.stemTeacherName}
                        </p>
                      </td>
                      {/* CT STEM */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {cls.stemPrograms.map((p) => (
                            <ProgramBadge key={p} code={p} size="xs" />
                          ))}
                        </div>
                      </td>
                      {/* Khóa STEM đang học */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(cls.stemPrograms.length > 0 ? cls.stemPrograms.slice(0, 2) : ["CT1"]).map((p) => (
                            <ProgramBadge key={p} code={p} size="xs" />
                          ))}
                        </div>
                      </td>
                      {/* Tiết/tuần */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md`}
                          style={{
                            fontSize: "11.5px",
                            fontWeight: 600,
                            color: cls.weeklySTEMPeriods >= 3 ? "#16a34a" : "#2563eb",
                            backgroundColor: cls.weeklySTEMPeriods >= 3 ? "#16a34a15" : "#2563eb15",
                          }}
                        >
                          <Layers className="w-3 h-3" />
                          {cls.weeklySTEMPeriods} tiết
                        </span>
                      </td>
                      {/* Phòng học */}
                      <td className="px-4 py-3">
                        <p className="text-muted-foreground whitespace-nowrap" style={{ fontSize: "12px" }}>
                          {cls.roomName}
                        </p>
                      </td>
                      {/* Điểm TB */}
                      <td className="px-4 py-3">
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: isHighScore ? "#16a34a" : cls.avgSTEMScore >= 7.0 ? "#f59e0b" : "#dc2626",
                          }}
                        >
                          {cls.avgSTEMScore.toFixed(1)}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            title="Phân công GV"
                            onClick={() => setAssignDialog({ open: true, className: cls.name })}
                            className="inline-flex items-center gap-1 px-2 py-1.5 bg-[#2563eb15] text-[#2563eb] rounded-lg hover:bg-[#990803] hover:text-white transition-colors"
                            style={{ fontSize: "11.5px", fontWeight: 500 }}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Xem TKB"
                            onClick={() => navigate(`/school/schedule?class=${encodeURIComponent(cls.name)}`)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 bg-secondary text-foreground rounded-lg hover:bg-border transition-colors"
                            style={{ fontSize: "11.5px", fontWeight: 500 }}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Table footer summary */}
        <div className="px-4 py-2 border-t border-border bg-secondary/20 flex items-center gap-2">
          <span className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
            Hiển thị {filtered.length} / {classes.length} lớp
          </span>
          {gradeFilter !== "all" && (
            <button
              onClick={() => setGradeFilter("all")}
              className="text-[#2563eb] hover:underline"
              style={{ fontSize: "11.5px" }}
            >
              Xem tất cả
            </button>
          )}
        </div>
      </div>

      {/* Assignment Dialog */}
      {assignDialog?.open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setAssignDialog(null)}
        >
          <div
            className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "16px", fontWeight: 700 }}>
              Phân công GV STEM — {assignDialog.className}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-muted-foreground block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                  Chương trình STEM
                </label>
                <select
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg"
                  style={{ fontSize: "13px" }}
                >
                  <option>CT1 — Toán học Sáng tạo</option>
                  <option>CT2 — STEM Liên môn</option>
                  <option>CT3 — Tăng cường thực hành</option>
                  <option>CT4 — Robotics & AI</option>
                  <option>CT5 — CLB Sáng tạo</option>
                </select>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                  Giáo viên phụ trách
                </label>
                <select
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg"
                  style={{ fontSize: "13px" }}
                >
                  <option>Phạm Anh Tuấn (CT1, CT2)</option>
                  <option>Nguyễn Thị Lan (CT1)</option>
                  <option>Trần Văn Hùng (CT2, CT3)</option>
                  <option>Lê Minh Trang (CT3)</option>
                  <option>Vũ Thanh Hương (CT4, CT5)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setAssignDialog(null)}
                className="px-4 py-2 border border-border bg-card rounded-lg"
                style={{ fontSize: "13px" }}
              >
                Huỷ
              </button>
              <button
                onClick={() => {
                  toast.success(`Đã lưu phân công cho ${assignDialog.className}`);
                  setAssignDialog(null);
                }}
                className="px-4 py-2 bg-[#990803] text-white rounded-lg"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                Lưu phân công
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEM Teacher Assignment Summary */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-4 h-4" style={{ color: "#2563eb" }} />
          <h2 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
            Phân công GV STEM
          </h2>
          <span className="text-muted-foreground" style={{ fontSize: "12px" }}>
            — {stemTeachers.length} giáo viên phụ trách {classes.length} lớp
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {stemTeachers.map(([id, info]) => (
            <div key={id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  background: "linear-gradient(145deg, #990803, #7a0602)",
                }}
              >
                {info.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(-2)
                  .join("")}
              </div>
              <div className="min-w-0">
                <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 600 }}>
                  {info.name}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                  {info.count} lớp
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ClassManagement;
