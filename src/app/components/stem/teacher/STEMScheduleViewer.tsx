import { useMemo } from "react";
import { Calendar, Download, Info } from "lucide-react";
import { scheduleEntries, STEM_PROGRAMS } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { toast } from "sonner";

/* ================================================================ */
/*  STEM SCHEDULE VIEWER (Teacher/Student) — weekly calendar cá nhân */
/* ================================================================ */

const WEEKDAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

interface Props {
  forRole?: "teacher" | "student";
}

export function STEMScheduleViewer({ forRole = "teacher" }: Props) {
  const { user } = useAuth();
  const myId = user?.id || "U-TCH-01";

  const mine = useMemo(() => {
    if (forRole === "teacher") return scheduleEntries.filter((s) => s.teacherId === myId);
    // Student: lấy theo lớp đầu tiên (mock)
    return scheduleEntries.filter((s) => s.classId.endsWith("-C3")).slice(0, 12);
  }, [forRole, myId]);

  const grid: Record<number, Record<number, typeof mine>> = {};
  for (let w = 1; w <= 6; w++) {
    grid[w] = {};
    for (const p of PERIODS) grid[w][p] = [];
  }
  mine.forEach((e) => grid[e.weekday]?.[e.period]?.push(e));

  const totalLessons = mine.length;
  const distinctPrograms = Array.from(new Set(mine.map((e) => e.programCode)));

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Calendar}
        title={forRole === "teacher" ? "Thời khóa biểu Giảng dạy" : "Thời khóa biểu STEM"}
        subtitle={forRole === "teacher"
          ? "Tự động cập nhật các tiết STEM đã được trường phân bổ cho bạn."
          : "Theo dõi lịch học cá nhân, các tiết STEM được nhà trường bố trí."}
        accentColor="#0891b2"
        actions={
          <button onClick={() => toast.info("Xuất lịch dạng ICS để đồng bộ lịch cá nhân")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Xuất ICS
          </button>
        }
      />

      {/* Summary */}
      <div className="bg-gradient-to-br from-[#0891b2]/5 to-[#7c3aed]/5 rounded-xl border border-border p-4 flex items-center gap-3 flex-wrap">
        <Info className="w-5 h-5 text-[#0891b2] shrink-0" />
        <div className="flex-1">
          <p style={{ fontSize: "13px", fontWeight: 600 }}>
            {totalLessons} tiết STEM/tuần · {distinctPrograms.length} chương trình
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {distinctPrograms.map((p) => <ProgramBadge key={p} code={p} showName size="sm" />)}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2.5 text-left text-muted-foreground w-20" style={{ fontSize: "11px", fontWeight: 600 }}>Tiết</th>
                {WEEKDAYS.map((d) => (
                  <th key={d} className="px-3 py-2.5 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((p) => (
                <tr key={p} className="border-t border-border">
                  <td className="px-3 py-2 bg-secondary/30 text-center">
                    <div className="font-semibold" style={{ fontSize: "13px" }}>T{p}</div>
                    <div className="text-muted-foreground" style={{ fontSize: "9.5px" }}>
                      {7 + Math.floor(p / 2)}:{p % 2 === 1 ? "00" : "45"}
                    </div>
                  </td>
                  {WEEKDAYS.map((_, wdi) => {
                    const wd = wdi + 1;
                    const cell = grid[wd]?.[p] || [];
                    return (
                      <td key={wd} className="px-1 py-1 align-top min-w-[140px]">
                        {cell.map((e) => {
                          const meta = STEM_PROGRAMS[e.programCode];
                          return (
                            <div key={e.id}
                              className="p-2 rounded mb-1"
                              style={{
                                backgroundColor: meta.color + "15",
                                borderLeft: `3px solid ${meta.color}`,
                              }}>
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span style={{ fontSize: "11px", fontWeight: 700 }}>{e.className}</span>
                                <ProgramBadge code={e.programCode} size="xs" />
                              </div>
                              <p style={{ fontSize: "11px", fontWeight: 500 }}>{e.subject}</p>
                              <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
                                {e.roomName}{e.isClub && " · CLB"}
                              </p>
                            </div>
                          );
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default STEMScheduleViewer;
