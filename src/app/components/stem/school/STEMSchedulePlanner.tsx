import { useState, useMemo } from "react";
import {
  Calendar, Plus, ChevronLeft, ChevronRight, Download, Info,
} from "lucide-react";
import { scheduleEntries, tenantsByType, STEM_PROGRAMS } from "../../mock-data/index";
import type { STEMScheduleEntry, StemProgram } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "sonner";

/* ================================================================ */
/*  STEM SCHEDULE PLANNER (School) — lưới thời khóa biểu STEM       */
/* ================================================================ */

const WEEKDAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

interface CellEntry {
  entry: STEMScheduleEntry;
}

export function STEMSchedulePlanner() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const schoolEntries = useMemo(() =>
    scheduleEntries.filter((e) => e.schoolId === tenantId), [tenantId]);

  const [weekOffset, setWeekOffset] = useState(0);
  const [classFilter, setClassFilter] = useState<string | "all">("all");

  const classes = Array.from(new Set(schoolEntries.map((e) => e.className)));

  const filtered = classFilter === "all"
    ? schoolEntries
    : schoolEntries.filter((e) => e.className === classFilter);

  // Build grid[weekday][period] = entries
  const grid: Record<number, Record<number, STEMScheduleEntry[]>> = {};
  for (let w = 1; w <= 6; w++) {
    grid[w] = {};
    for (const p of PERIODS) grid[w][p] = [];
  }
  filtered.forEach((e) => {
    if (grid[e.weekday] && grid[e.weekday][e.period]) {
      grid[e.weekday][e.period].push(e);
    }
  });

  // Distribution by program
  const byProgram: Record<StemProgram, number> = { CT1: 0, CT2: 0, CT3: 0, CT4: 0, CT5: 0 };
  filtered.forEach((e) => { byProgram[e.programCode]++; });

  const clubCount = filtered.filter((e) => e.isClub).length;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Calendar}
        title="Thời khóa biểu STEM"
        subtitle="Sắp xếp tiết học STEM và CLB STEM ngoại khóa cho toàn trường theo tuần."
        accentColor="#2563eb"
        actions={
          <>
            <button onClick={() => toast.info("Xuất thời khóa biểu PDF cho giáo viên")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Xuất PDF
            </button>
            <button onClick={() => toast.success("Thêm tiết STEM mới — chọn lớp, GV, phòng, chương trình")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Thêm tiết
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Calendar} label="Tổng tiết STEM/tuần" value={filtered.length} color="#2563eb" />
        <KpiCard icon={Info} label="CLB ngoại khóa" value={clubCount} color="#7c3aed" />
        <KpiCard icon={Info} label="Lớp có STEM" value={classes.length} color="#16a34a" />
        <KpiCard icon={Info} label="Phòng STEM dùng" value={new Set(filtered.map((e) => e.roomId)).size} color="#c8a84e" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-1.5 hover:bg-secondary rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3" style={{ fontSize: "12.5px", fontWeight: 600 }}>
            Tuần {weekOffset === 0 ? "hiện tại" : weekOffset > 0 ? `+${weekOffset}` : weekOffset}
          </span>
          <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-1.5 hover:bg-secondary rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg outline-none"
          style={{ fontSize: "12px", fontWeight: 500 }}>
          <option value="all">Tất cả lớp</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2.5 text-left text-muted-foreground w-20" style={{ fontSize: "11px", fontWeight: 600 }}>Tiết</th>
                {WEEKDAYS.map((d) => (
                  <th key={d} className="px-3 py-2.5 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                    {d}
                  </th>
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
                    const cellEntries = grid[wd]?.[p] || [];
                    return (
                      <td key={wd} className="px-1 py-1 align-top min-w-[140px]">
                        <div className="space-y-1">
                          {cellEntries.map((e) => {
                            const meta = STEM_PROGRAMS[e.programCode];
                            return (
                              <div
                                key={e.id}
                                onClick={() => toast.info(`${e.className} — ${e.subject} — ${e.teacherName}`)}
                                className="p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity"
                                style={{
                                  backgroundColor: meta.color + "15",
                                  borderLeft: `3px solid ${meta.color}`,
                                }}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span style={{ fontSize: "10.5px", fontWeight: 700 }}>{e.className}</span>
                                  <ProgramBadge code={e.programCode} size="xs" />
                                </div>
                                <p className="truncate" style={{ fontSize: "10px", fontWeight: 500 }}>{e.subject}</p>
                                <p className="text-muted-foreground truncate" style={{ fontSize: "9px" }}>
                                  {e.roomName} · {e.teacherName.split(" ").slice(-2).join(" ")}
                                </p>
                                {e.isClub && (
                                  <span className="inline-block mt-0.5 px-1 rounded bg-[#7c3aed]/20 text-[#7c3aed]" style={{ fontSize: "8px", fontWeight: 700 }}>
                                    CLB
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#2563eb]/5 to-[#7c3aed]/5 rounded-xl border border-border p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#2563eb] shrink-0 mt-0.5" />
        <div>
          <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>Phân bổ theo chương trình STEM</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            {(Object.keys(byProgram) as StemProgram[]).map((code) => (
              <span key={code} className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-card border border-border" style={{ fontSize: "11.5px" }}>
                <ProgramBadge code={code} size="xs" />
                <strong>{byProgram[code]}</strong> tiết
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default STEMSchedulePlanner;
