import { useState, useMemo } from "react";
import {
  Calendar, Download, ChevronLeft, ChevronRight,
  BookOpen, Users, Clock, MapPin, X, Layers,
  CalendarDays, GraduationCap, Zap, Info,
  RefreshCw, Shield, Sun, Moon,
} from "lucide-react";
import { scheduleEntries, regularEntries, STEM_PROGRAMS } from "../../mock-data/index";
import type { RegularEntry } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { toast } from "@/app/lib/toast";
import type { STEMScheduleEntry, StemProgram } from "../../mock-data/types";

/* ================================================================ */
/*  CONSTANTS                                                        */
/* ================================================================ */

const WEEKDAY_LABELS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const MORNING_PERIODS  = [1, 2, 3, 4, 5, 6];
const AFTERNOON_PERIODS = [7, 8, 9, 10];

const PERIOD_TIME: Record<number, { start: string; end: string }> = {
  1:  { start: "7:00",  end: "7:45"  },
  2:  { start: "7:50",  end: "8:35"  },
  3:  { start: "8:45",  end: "9:30"  },
  4:  { start: "9:35",  end: "10:20" },
  5:  { start: "10:25", end: "11:10" },
  6:  { start: "11:15", end: "12:00" },
  7:  { start: "13:00", end: "13:45" },
  8:  { start: "13:50", end: "14:35" },
  9:  { start: "14:40", end: "15:25" },
  10: { start: "15:30", end: "16:15" },
};

/* BR-03 — CT type → time-of-day rules */
const CT_TYPE_RULES = [
  { codes: ["CT1", "CT2"], label: "Chính khóa", note: "Buổi sáng T1–T6 · đè tiết thường", color: "#0891b2" },
  { codes: ["CT3"],        label: "Buổi 2",     note: "Buổi chiều T7–T10 · tiết bổ sung", color: "#7c3aed" },
  { codes: ["CT4"],        label: "Tăng cường", note: "Linh hoạt sáng hoặc chiều",          color: "#dc2626" },
  { codes: ["CT5"],        label: "CLB / NK",   note: "Không xếp TKB · chỉ booking phòng", color: "#059669" },
];

/* ================================================================ */
/*  DATE HELPERS                                                     */
/* ================================================================ */

function getMondayOfWeek(weekOffset: number): Date {
  const today = new Date();
  const dow = today.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getWeekDates(weekOffset: number): Date[] {
  const monday = getMondayOfWeek(weekOffset);
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
}

function fmtDate(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function fmtWeekRange(dates: Date[]): string {
  const a = dates[0], b = dates[dates.length - 1];
  return `${fmtDate(a)} – ${fmtDate(b)}/${b.getFullYear()}`;
}

function todayWeekday(): number {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
}

/* ================================================================ */
/*  AD-03 SYNC BANNER                                               */
/* ================================================================ */

function SyncBanner() {
  const [syncing, setSyncing] = useState(false);

  function handleSync() {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      toast.success("Đồng bộ thành công từ K12Online (VNPT)");
    }, 1500);
  }

  return (
    <div
      className="rounded-xl border px-4 py-3 flex flex-wrap items-center gap-3"
      style={{ borderColor: "rgba(200,168,78,0.3)", background: "rgba(200,168,78,0.05)" }}
    >
      <Shield className="w-4 h-4 shrink-0" style={{ color: "#c8a84e" }} />
      <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-semibold text-foreground" style={{ fontSize: "12px" }}>
          Đồng bộ từ K12Online (VNPT)
        </span>
        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
          Cập nhật lần cuối: 18/05/2026 06:30
        </span>
        <span
          className="px-1.5 py-px rounded font-semibold"
          style={{ fontSize: "10px", color: "#059669", background: "rgba(5,150,105,0.1)" }}
        >
          ✓ Thành công
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="text-muted-foreground hidden sm:block"
          style={{ fontSize: "10.5px" }}
        >
          AD-03: Chỉ đọc — không ghi ngược K12Online
        </span>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors"
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "#c8a84e",
            borderColor: "rgba(200,168,78,0.4)",
          }}
        >
          <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Đang đồng bộ..." : "Đồng bộ lại"}
        </button>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  BR-03 LEGEND                                                    */
/* ================================================================ */

function BR03Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "10.5px" }}>
        <Info className="w-3 h-3" />
        <span className="font-medium">BR-03:</span>
      </div>
      {CT_TYPE_RULES.map((rule) => (
        <div key={rule.label} className="flex items-center gap-1.5">
          <div
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
            style={{ background: `${rule.color}14`, border: `1px solid ${rule.color}30` }}
          >
            {rule.codes.map((c) => (
              <span
                key={c}
                className="font-bold"
                style={{ fontSize: "9px", color: rule.color }}
              >
                {c}
              </span>
            ))}
          </div>
          <span className="font-medium text-foreground" style={{ fontSize: "10.5px" }}>
            {rule.label}
          </span>
          <span className="text-muted-foreground" style={{ fontSize: "10px" }}>
            — {rule.note}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ================================================================ */
/*  GRID CELL — shows regular (gray) + STEM (colored) entries       */
/* ================================================================ */

function GridCell({
  stemEntries,
  regEntries,
  onStemClick,
}: {
  stemEntries: STEMScheduleEntry[];
  regEntries: RegularEntry[];
  onStemClick: (e: STEMScheduleEntry) => void;
}) {
  const hasSTEM = stemEntries.length > 0;

  if (!hasSTEM && regEntries.length === 0) {
    return <div className="min-h-[52px]" />;
  }

  return (
    <div className="min-h-[52px] p-0.5 space-y-0.5">
      {/* Regular entries (background / overlaid) */}
      {regEntries.map((reg) => (
        <div
          key={reg.id}
          className="px-1.5 py-1 rounded"
          style={{
            background: hasSTEM ? "rgba(100,116,139,0.05)" : "rgba(100,116,139,0.09)",
            border: `1px solid rgba(100,116,139,${hasSTEM ? "0.12" : "0.22"})`,
            borderLeft: `2px solid rgba(100,116,139,${hasSTEM ? "0.2" : "0.45"})`,
            opacity: hasSTEM ? 0.55 : 1,
          }}
        >
          <div className="flex items-center justify-between gap-1">
            <span
              className="font-medium text-muted-foreground truncate"
              style={{ fontSize: "10px" }}
            >
              {reg.className}
            </span>
            {hasSTEM && (
              <span
                className="shrink-0 font-bold rounded px-0.5"
                style={{ fontSize: "7.5px", color: "#64748b", background: "rgba(100,116,139,0.1)" }}
              >
                đè
              </span>
            )}
          </div>
          <p className="text-muted-foreground/70 truncate" style={{ fontSize: "9px" }}>
            {reg.subject}
          </p>
        </div>
      ))}

      {/* STEM entries (on top) */}
      {stemEntries.map((e) => {
        const meta = STEM_PROGRAMS[e.programCode];
        return (
          <button
            key={e.id}
            onClick={() => onStemClick(e)}
            className="w-full text-left px-1.5 py-1 rounded transition-all hover:shadow-sm hover:-translate-y-px"
            style={{
              background: `${meta.color}12`,
              border: `1px solid ${meta.color}28`,
              borderLeft: `3px solid ${meta.color}`,
            }}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold text-foreground truncate" style={{ fontSize: "10.5px" }}>
                {e.className}
              </span>
              <span
                className="shrink-0 px-1 py-px rounded text-white"
                style={{ fontSize: "7.5px", fontWeight: 700, background: meta.color }}
              >
                {e.programCode}
              </span>
            </div>
            <p className="text-foreground/80 truncate" style={{ fontSize: "9.5px" }}>
              {e.subject}
            </p>
            <p className="text-muted-foreground truncate" style={{ fontSize: "9px" }}>
              {e.roomName}
            </p>
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================ */
/*  SCHEDULE GRID — renders morning OR afternoon table section       */
/* ================================================================ */

type GridMap = Record<number, Record<number, STEMScheduleEntry[]>>;
type RegGridMap = Record<number, Record<number, RegularEntry[]>>;

function ScheduleGrid({
  periods,
  stemGrid,
  regGrid,
  weekDates,
  todayWd,
  weekOffset,
  onSelect,
  sectionLabel,
  sectionColor,
  sectionIcon: SectionIcon,
  showOnlyFilled,
}: {
  periods: number[];
  stemGrid: GridMap;
  regGrid: RegGridMap;
  weekDates: Date[];
  todayWd: number;
  weekOffset: number;
  onSelect: (e: STEMScheduleEntry) => void;
  sectionLabel: string;
  sectionColor: string;
  sectionIcon: React.ElementType;
  showOnlyFilled: boolean;
}) {
  const hasStemData = periods.some((p) =>
    Object.values(stemGrid).some((wd) => (wd[p]?.length ?? 0) > 0)
  );
  const hasRegData = periods.some((p) =>
    Object.values(regGrid).some((wd) => (wd[p]?.length ?? 0) > 0)
  );
  if (!hasStemData && !hasRegData) return null;

  const displayPeriods = showOnlyFilled
    ? periods.filter(
        (p) =>
          Object.values(stemGrid).some((wd) => (wd[p]?.length ?? 0) > 0) ||
          Object.values(regGrid).some((wd) => (wd[p]?.length ?? 0) > 0)
      )
    : periods.filter((p) => hasStemData || hasRegData ? true : false);

  if (displayPeriods.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Section label bar */}
      <div
        className="px-4 py-2.5 border-b border-border flex items-center gap-2"
        style={{ background: `${sectionColor}08` }}
      >
        <SectionIcon className="w-3.5 h-3.5 shrink-0" style={{ color: sectionColor }} />
        <span className="font-semibold" style={{ fontSize: "12px", color: sectionColor }}>
          {sectionLabel}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th
                className="border-b border-border bg-secondary/40 sticky left-0 z-10 px-3 py-2.5 text-center"
                style={{ width: 80, fontSize: "11px", fontWeight: 600, color: "var(--muted-foreground)" }}
              >
                Tiết
              </th>
              {WEEKDAY_LABELS.map((label, i) => {
                const date = weekDates[i];
                const today = isToday(date);
                return (
                  <th
                    key={label}
                    className="border-b border-border bg-secondary/40 px-2 py-2.5 text-left"
                    style={{
                      minWidth: 148,
                      background: today ? "rgba(153,8,3,0.06)" : undefined,
                    }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="font-semibold"
                        style={{
                          fontSize: "11px",
                          color: today ? "#990803" : "var(--muted-foreground)",
                        }}
                      >
                        {label}
                      </span>
                      <span
                        className="rounded-md px-1.5 py-0.5 w-fit font-medium"
                        style={{
                          fontSize: "10px",
                          background: today ? "#990803" : "transparent",
                          color: today ? "white" : "var(--muted-foreground)",
                        }}
                      >
                        {fmtDate(date)}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayPeriods.map((p, pi) => (
              <tr
                key={p}
                className="border-t border-border"
                style={{ background: pi % 2 === 1 ? "rgba(0,0,0,0.015)" : undefined }}
              >
                {/* Period label */}
                <td
                  className="px-3 py-2 sticky left-0 z-10 text-center border-r border-border"
                  style={{ background: "var(--secondary)" }}
                >
                  <div className="font-bold text-foreground" style={{ fontSize: "13px" }}>
                    T{p}
                  </div>
                  <div className="text-muted-foreground" style={{ fontSize: "9px" }}>
                    {PERIOD_TIME[p]?.start}
                  </div>
                  <div className="text-muted-foreground" style={{ fontSize: "9px" }}>
                    {PERIOD_TIME[p]?.end}
                  </div>
                </td>

                {/* Day cells */}
                {[1, 2, 3, 4, 5, 6].map((wd) => {
                  const isCurrentDay = weekOffset === 0 && wd === todayWd;
                  return (
                    <td
                      key={wd}
                      className="px-1 py-1 align-top border-r border-border/50 last:border-r-0"
                      style={{
                        background: isCurrentDay ? "rgba(153,8,3,0.04)" : undefined,
                        minWidth: 148,
                      }}
                    >
                      <GridCell
                        stemEntries={stemGrid[wd]?.[p] ?? []}
                        regEntries={regGrid[wd]?.[p] ?? []}
                        onStemClick={onSelect}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  CLB SECTION — CT5 + CT4 CLB (không nằm trong TKB lưới)         */
/* ================================================================ */

function ClbSection({
  entries,
  onSelect,
}: {
  entries: STEMScheduleEntry[];
  onSelect: (e: STEMScheduleEntry) => void;
}) {
  if (entries.length === 0) return null;
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div
        className="px-4 py-2.5 border-b border-border flex items-center gap-2"
        style={{ background: "rgba(5,150,105,0.06)" }}
      >
        <GraduationCap className="w-4 h-4 shrink-0 text-[#059669]" />
        <span className="font-semibold text-[#059669]" style={{ fontSize: "12px" }}>
          CLB · Ngoại khóa — CT5 &amp; CT4-CLB
        </span>
        <span className="text-muted-foreground ml-auto" style={{ fontSize: "10.5px" }}>
          Không xếp TKB · chỉ booking phòng (BR-03 CT5)
        </span>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {entries.map((e) => {
          const meta = STEM_PROGRAMS[e.programCode];
          const wdLabel = WEEKDAY_LABELS[e.weekday - 1] ?? `Thứ ${e.weekday + 1}`;
          return (
            <button
              key={e.id}
              onClick={() => onSelect(e)}
              className="text-left p-3 rounded-xl border transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{
                background: `${meta.color}0d`,
                border: `1px solid ${meta.color}28`,
                borderLeft: `4px solid ${meta.color}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="px-2 py-0.5 rounded-full text-white font-bold"
                  style={{ fontSize: "10px", background: meta.color }}
                >
                  {e.programCode}
                </span>
                <span className="text-muted-foreground" style={{ fontSize: "10px" }}>
                  {wdLabel}
                </span>
              </div>
              <p className="font-bold text-foreground" style={{ fontSize: "13px" }}>
                {e.className}
              </p>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
                {e.subject}
              </p>
              <p
                className="text-muted-foreground mt-1 flex items-center gap-1"
                style={{ fontSize: "10.5px" }}
              >
                <MapPin className="w-3 h-3 shrink-0" />
                {e.roomName}
              </p>
              {e.note && (
                <p
                  className="mt-1.5 font-medium"
                  style={{ fontSize: "10px", color: meta.color, opacity: 0.85 }}
                >
                  {e.note}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TODAY STRIP                                                      */
/* ================================================================ */

function TodayStrip({
  lessons,
  onSelect,
}: {
  lessons: STEMScheduleEntry[];
  onSelect: (e: STEMScheduleEntry) => void;
}) {
  const gridLessons = lessons.filter((e) => e.period > 0);
  if (gridLessons.length === 0) return null;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  function isOngoing(entry: STEMScheduleEntry): boolean {
    const t = PERIOD_TIME[entry.period];
    if (!t) return false;
    const [sh, sm] = t.start.split(":").map(Number);
    const [eh, em] = t.end.split(":").map(Number);
    return nowMin >= sh * 60 + sm && nowMin <= eh * 60 + em;
  }

  function isNext(entry: STEMScheduleEntry): boolean {
    const t = PERIOD_TIME[entry.period];
    if (!t) return false;
    const [sh, sm] = t.start.split(":").map(Number);
    return sh * 60 + sm > nowMin;
  }

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: "linear-gradient(135deg, rgba(153,8,3,0.06), rgba(200,168,78,0.06))",
        borderColor: "rgba(153,8,3,0.18)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-2 h-2 rounded-full bg-[#990803]"
          style={{ animation: "pulse 2s infinite" }}
        />
        <h3 className="font-semibold text-foreground" style={{ fontSize: "13px" }}>
          Lịch dạy hôm nay —{" "}
          <span className="text-[#990803]">{gridLessons.length} tiết</span>
        </h3>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1">
        {gridLessons
          .sort((a, b) => a.period - b.period)
          .map((lesson) => {
            const meta = STEM_PROGRAMS[lesson.programCode];
            const ongoing = isOngoing(lesson);
            const next = !ongoing && isNext(lesson);
            const t = PERIOD_TIME[lesson.period];
            return (
              <button
                key={lesson.id}
                onClick={() => onSelect(lesson)}
                className="shrink-0 rounded-xl text-left transition-all hover:shadow-md hover:-translate-y-0.5 p-3 relative"
                style={{
                  minWidth: 160,
                  maxWidth: 180,
                  background: ongoing ? `${meta.color}22` : `${meta.color}0e`,
                  border: ongoing ? `2px solid ${meta.color}` : `1px solid ${meta.color}28`,
                }}
              >
                {(ongoing || next) && (
                  <span
                    className="absolute -top-2 left-3 px-2 py-0.5 rounded-full text-white"
                    style={{
                      fontSize: "8px",
                      fontWeight: 700,
                      background: ongoing ? meta.color : "#64748b",
                    }}
                  >
                    {ongoing ? "● Đang dạy" : "Tiếp theo"}
                  </span>
                )}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold" style={{ fontSize: "10px", color: meta.color }}>
                    T{lesson.period} · {t?.start}
                  </span>
                  <span
                    className="px-1.5 py-px rounded text-white"
                    style={{ fontSize: "8px", fontWeight: 700, background: meta.color }}
                  >
                    {lesson.programCode}
                  </span>
                </div>
                <p className="font-bold text-foreground leading-tight" style={{ fontSize: "13px" }}>
                  {lesson.className}
                </p>
                <p className="text-muted-foreground leading-tight" style={{ fontSize: "11px" }}>
                  {lesson.subject}
                </p>
                <p className="text-muted-foreground leading-tight mt-0.5" style={{ fontSize: "10px" }}>
                  {lesson.roomName}
                </p>
              </button>
            );
          })}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  LESSON MODAL                                                     */
/* ================================================================ */

function ctTypeLabel(code: StemProgram, isClub?: boolean): string {
  if (isClub) return "CLB / Ngoại khóa";
  if (code === "CT1" || code === "CT2") return "Chính khóa (Buổi sáng)";
  if (code === "CT3") return "Buổi 2 (Buổi chiều)";
  if (code === "CT4") return "Tăng cường";
  if (code === "CT5") return "CLB NCKH";
  return "STEM";
}

function LessonModal({
  entry,
  onClose,
}: {
  entry: STEMScheduleEntry | null;
  onClose: () => void;
}) {
  if (!entry) return null;
  const meta = STEM_PROGRAMS[entry.programCode];
  const time = PERIOD_TIME[entry.period];
  const wdLabel = WEEKDAY_LABELS[entry.weekday - 1] ?? `Thứ ${entry.weekday + 1}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 pt-5 pb-4 relative"
          style={{
            background: `linear-gradient(135deg, ${meta.color}ee, ${meta.color}99)`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* CT type badge */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-3"
            style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)" }}
          >
            <span className="text-white font-bold" style={{ fontSize: "9px" }}>
              {meta.code}
            </span>
            <span className="text-white/80" style={{ fontSize: "9px" }}>
              {ctTypeLabel(entry.programCode, entry.isClub)}
            </span>
          </div>

          <h3 className="text-white font-extrabold text-xl leading-tight">{entry.className}</h3>
          <p className="text-white/80 mt-0.5" style={{ fontSize: "13.5px" }}>{entry.subject}</p>
        </div>

        <div className="p-5 space-y-3">
          {[
            {
              icon: CalendarDays,
              label: "Lịch học",
              value: entry.period > 0
                ? `${wdLabel} · Tiết ${entry.period} (${time?.start} – ${time?.end})`
                : `${wdLabel} · Ngoài TKB lưới`,
            },
            { icon: MapPin,    label: "Phòng học",   value: entry.roomName },
            { icon: BookOpen,  label: "Chương trình", value: meta.name },
            {
              icon: Layers,
              label: "Loại tiết",
              value: ctTypeLabel(entry.programCode, entry.isClub),
            },
            {
              icon: Clock,
              label: "Áp dụng",
              value: `${entry.dateFrom.slice(0, 10)} → ${entry.dateTo.slice(0, 10)}`,
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${meta.color}14` }}
              >
                <Icon className="w-4 h-4" style={{ color: meta.color }} />
              </div>
              <div>
                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                  {label}
                </p>
                <p className="text-foreground font-medium" style={{ fontSize: "13px" }}>
                  {value}
                </p>
              </div>
            </div>
          ))}
          {entry.note && (
            <div
              className="px-3 py-2 rounded-lg"
              style={{ background: `${meta.color}0d`, border: `1px solid ${meta.color}20` }}
            >
              <p className="font-medium" style={{ fontSize: "11.5px", color: meta.color }}>
                {entry.note}
              </p>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button
            className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: meta.color }}
            onClick={() => {
              toast.info(`Mở bài giảng cho ${entry.className} – ${entry.subject}`);
              onClose();
            }}
          >
            Xem bài giảng
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-secondary text-foreground hover:bg-secondary/70 transition-colors"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  MAIN COMPONENT                                                   */
/* ================================================================ */

interface Props {
  forRole?: "teacher" | "student";
}

export function STEMScheduleViewer({ forRole = "teacher" }: Props) {
  const { user } = useAuth();
  const myId = user?.id || "U-TCH-01";

  const [weekOffset, setWeekOffset]       = useState(0);
  const [activeProgs, setActiveProgs]     = useState<Set<StemProgram>>(new Set());
  const [selected, setSelected]           = useState<STEMScheduleEntry | null>(null);
  const [showOnlyFilled, setShowOnlyFilled] = useState(false);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const todayWd   = todayWeekday();

  /* ── Filter STEM entries for this user ── */
  const mine = useMemo(() => {
    if (forRole === "teacher") return scheduleEntries.filter((s) => s.teacherId === myId);
    const studentNum = parseInt(myId.replace(/\D/g, ""), 10) || 3;
    const classSuffix = "-C" + ((studentNum - 1) % 9 + 1);
    return scheduleEntries.filter((s) => s.classId.endsWith(classSuffix));
  }, [forRole, myId]);

  /* ── Regular entries for this teacher (AD-03 import) ── */
  const myRegular = useMemo(
    () => regularEntries.filter((r) => r.teacherId === myId),
    [myId]
  );

  /* ── Apply program filter ── */
  const filtered = useMemo(() => {
    if (activeProgs.size === 0) return mine;
    return mine.filter((e) => activeProgs.has(e.programCode));
  }, [mine, activeProgs]);

  /* ── CLB entries (period=0) → ClbSection, not in grid ── */
  const clbEntries = useMemo(
    () => filtered.filter((e) => e.period === 0 || e.isClub),
    [filtered]
  );

  /* ── Grid entries (period > 0) ── */
  const gridEntries = useMemo(
    () => filtered.filter((e) => e.period > 0 && !e.isClub),
    [filtered]
  );

  /* ── Build STEM grid [weekday][period] ── */
  const stemGrid = useMemo<GridMap>(() => {
    const g: GridMap = {};
    for (let w = 1; w <= 6; w++) {
      g[w] = {};
      for (const p of [...MORNING_PERIODS, ...AFTERNOON_PERIODS]) g[w][p] = [];
    }
    gridEntries.forEach((e) => {
      if (g[e.weekday]?.[e.period] !== undefined) {
        g[e.weekday][e.period].push(e);
      }
    });
    return g;
  }, [gridEntries]);

  /* ── Build Regular grid [weekday][period] ── */
  const regGrid = useMemo<RegGridMap>(() => {
    const g: RegGridMap = {};
    for (let w = 1; w <= 6; w++) {
      g[w] = {};
      for (const p of [...MORNING_PERIODS, ...AFTERNOON_PERIODS]) g[w][p] = [];
    }
    myRegular.forEach((r) => {
      if (g[r.weekday]?.[r.period] !== undefined) {
        g[r.weekday][r.period].push(r);
      }
    });
    return g;
  }, [myRegular]);

  /* ── KPIs ── */
  const gridLessonsCount = mine.filter((e) => e.period > 0 && !e.isClub).length;
  const distinctClasses  = new Set(mine.map((e) => e.classId)).size;
  const distinctProgs    = Array.from(new Set(mine.map((e) => e.programCode)));
  const clubCount        = mine.filter((e) => e.period === 0 || e.isClub).length;

  /* ── Program distribution ── */
  const progCounts = useMemo(
    () =>
      mine.reduce<Record<string, number>>((acc, e) => {
        acc[e.programCode] = (acc[e.programCode] || 0) + 1;
        return acc;
      }, {}),
    [mine]
  );

  /* ── Today's lessons ── */
  const todayLessons = useMemo(
    () => mine.filter((e) => e.weekday === todayWd),
    [mine, todayWd]
  );

  function toggleProg(code: StemProgram) {
    setActiveProgs((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code); else next.add(code);
      return next;
    });
  }

  const weekLabel =
    weekOffset === 0 ? "Tuần này"
    : weekOffset === 1 ? "Tuần sau"
    : weekOffset === -1 ? "Tuần trước"
    : `Tuần ${weekOffset > 0 ? "+" : ""}${weekOffset}`;

  const hasAfternoonData = AFTERNOON_PERIODS.some(
    (p) =>
      Object.values(stemGrid).some((wd) => (wd[p]?.length ?? 0) > 0) ||
      Object.values(regGrid).some((wd) => (wd[p]?.length ?? 0) > 0)
  );

  /* ──────────────────────────────────────────────── */

  return (
    <>
      <div className="space-y-5">

        {/* ── Page header ── */}
        <PageHeader
          icon={Calendar}
          title={forRole === "teacher" ? "Thời khóa biểu Giảng dạy" : "Thời khóa biểu STEM"}
          subtitle={
            forRole === "teacher"
              ? "TKB tổng đồng bộ từ K12Online; tiết STEM overlay theo BR-03. Click tiết để mở bài giảng."
              : "Theo dõi lịch học cá nhân, các tiết STEM được nhà trường bố trí."
          }
          accentColor="#0891b2"
          actions={
            <button
              onClick={() => toast.info("Xuất lịch dạng .ICS để đồng bộ Google Calendar / Outlook")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Download className="w-4 h-4" /> Xuất ICS
            </button>
          }
        />

        {/* ── AD-03 Sync Banner ── */}
        {forRole === "teacher" && <SyncBanner />}

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Tiết STEM/tuần",
              value: gridLessonsCount,
              icon: Calendar,
              color: "#0891b2",
              sub: "tiết chính khóa + tăng cường",
            },
            {
              label: "Lớp phụ trách",
              value: distinctClasses,
              icon: Users,
              color: "#7c3aed",
              sub: "lớp đang dạy",
            },
            {
              label: "Chương trình",
              value: distinctProgs.length,
              icon: Layers,
              color: "#990803",
              sub: "CT STEM khác nhau",
            },
            {
              label: "Hoạt động CLB",
              value: clubCount,
              icon: GraduationCap,
              color: "#059669",
              sub: "CLB & ngoại khóa",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-card rounded-xl border border-border p-4 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
                  {kpi.label}
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${kpi.color}14` }}
                >
                  <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="font-extrabold text-foreground" style={{ fontSize: "28px", lineHeight: 1 }}>
                {kpi.value}
              </p>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "10.5px" }}>
                {kpi.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── Today strip ── */}
        {weekOffset === 0 && (
          <TodayStrip lessons={todayLessons} onSelect={setSelected} />
        )}

        {/* ── Week nav + Program filter ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-4 py-2 bg-card rounded-lg border border-border text-center min-w-[168px]">
              <p className="font-semibold text-foreground" style={{ fontSize: "13px" }}>
                {weekLabel}
              </p>
              <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                {fmtWeekRange(weekDates)}
              </p>
            </div>

            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="px-3 py-1.5 rounded-lg border transition-colors text-[#990803] border-[#990803]/30 hover:bg-[#990803]/5"
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                Tuần này
              </button>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-muted-foreground shrink-0" style={{ fontSize: "11px" }}>
              Lọc:
            </span>
            {Object.values(STEM_PROGRAMS).map((prog) => {
              const active = activeProgs.has(prog.code);
              const count = progCounts[prog.code] || 0;
              return (
                <button
                  key={prog.code}
                  onClick={() => toggleProg(prog.code)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full transition-all"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    background: active ? prog.color : `${prog.color}12`,
                    color: active ? "white" : prog.color,
                    border: `1px solid ${prog.color}40`,
                  }}
                >
                  {prog.code}
                  <span className="opacity-65">({count})</span>
                </button>
              );
            })}
            {activeProgs.size > 0 && (
              <button
                onClick={() => setActiveProgs(new Set())}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-muted-foreground hover:bg-secondary/70 transition-colors"
                style={{ fontSize: "11px" }}
              >
                <X className="w-3 h-3" /> Xóa lọc
              </button>
            )}
            <button
              onClick={() => setShowOnlyFilled((s) => !s)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all"
              style={{
                fontSize: "11px",
                fontWeight: 500,
                background: showOnlyFilled ? "#64748b" : "transparent",
                color: showOnlyFilled ? "white" : "#64748b",
                borderColor: "#64748b40",
              }}
            >
              <Zap className="w-3 h-3" />
              {showOnlyFilled ? "Ẩn trống" : "Ẩn tiết trống"}
            </button>
          </div>
        </div>

        {/* ── BR-03 type legend ── */}
        <div
          className="rounded-xl border px-4 py-3"
          style={{ background: "rgba(0,0,0,0.02)", borderColor: "rgba(0,0,0,0.08)" }}
        >
          <BR03Legend />
        </div>

        {/* ── Morning grid: T1–T6 (CT1/CT2 chính khóa) ── */}
        <ScheduleGrid
          periods={MORNING_PERIODS}
          stemGrid={stemGrid}
          regGrid={regGrid}
          weekDates={weekDates}
          todayWd={todayWd}
          weekOffset={weekOffset}
          onSelect={setSelected}
          sectionLabel="Buổi sáng · T1–T6 · CT1/CT2 Chính khóa"
          sectionColor="#0891b2"
          sectionIcon={Sun}
          showOnlyFilled={showOnlyFilled}
        />

        {/* ── Afternoon grid: T7–T10 (CT3 buổi 2 + CT4 tăng cường) ── */}
        {hasAfternoonData && (
          <ScheduleGrid
            periods={AFTERNOON_PERIODS}
            stemGrid={stemGrid}
            regGrid={regGrid}
            weekDates={weekDates}
            todayWd={todayWd}
            weekOffset={weekOffset}
            onSelect={setSelected}
            sectionLabel="Buổi chiều · T7–T10 · CT3 Buổi 2 / CT4 Tăng cường"
            sectionColor="#7c3aed"
            sectionIcon={Moon}
            showOnlyFilled={showOnlyFilled}
          />
        )}

        {/* ── CLB section (CT5 + CT4-CLB, period=0) ── */}
        <ClbSection entries={clbEntries} onSelect={setSelected} />

        {/* ── Legend row ── */}
        <div className="flex items-center gap-x-5 gap-y-1.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(100,116,139,0.45)" }} />
            <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
              TKB thường (K12Online)
            </span>
          </div>
          {Object.values(STEM_PROGRAMS).map((prog) => (
            <div key={prog.code} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ background: prog.color }} />
              <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                <span className="font-semibold text-foreground">{prog.code}</span>{" "}
                {prog.shortName}
              </span>
            </div>
          ))}
        </div>

        {/* ── Program distribution charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4" style={{ fontSize: "13px" }}>
              Phân bổ chương trình
            </h3>
            <div className="space-y-3">
              {Object.values(STEM_PROGRAMS).map((prog) => {
                const count = progCounts[prog.code] || 0;
                if (count === 0) return null;
                const total = mine.length;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={prog.code} className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 shrink-0 w-28">
                      <div className="w-2 h-2 rounded-full" style={{ background: prog.color }} />
                      <span className="font-semibold" style={{ fontSize: "11px", color: prog.color }}>
                        {prog.code}
                      </span>
                      <span className="text-muted-foreground truncate" style={{ fontSize: "10.5px" }}>
                        {prog.shortName}
                      </span>
                    </div>
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, background: prog.color }}
                      />
                    </div>
                    <div className="text-muted-foreground text-right w-20 shrink-0" style={{ fontSize: "11px" }}>
                      {count} tiết ({Math.round(pct)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-semibold text-foreground mb-4" style={{ fontSize: "13px" }}>
              Phân bổ theo ngày
            </h3>
            <div className="space-y-2.5">
              {WEEKDAY_LABELS.map((label, i) => {
                const wd = i + 1;
                const stemCount = mine.filter((e) => e.weekday === wd && e.period > 0).length;
                const regCount  = myRegular.filter((r) => r.weekday === wd).length;
                const clbCount  = mine.filter((e) => e.weekday === wd && (e.period === 0 || e.isClub)).length;
                const total = stemCount + regCount;
                const maxTotal = Math.max(
                  ...WEEKDAY_LABELS.map((_, j) => {
                    const w = j + 1;
                    return mine.filter((e) => e.weekday === w && e.period > 0).length +
                           myRegular.filter((r) => r.weekday === w).length;
                  })
                );
                const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                const isCurrentDay = wd === todayWd;
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span
                      className="shrink-0 w-12 font-medium"
                      style={{
                        fontSize: "11.5px",
                        color: isCurrentDay ? "#990803" : "var(--foreground)",
                        fontWeight: isCurrentDay ? 700 : 500,
                      }}
                    >
                      {label}
                    </span>
                    <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden flex">
                      {stemCount > 0 && (
                        <div
                          className="h-2"
                          style={{
                            width: maxTotal > 0 ? `${(stemCount / maxTotal) * 100}%` : 0,
                            background: "#0891b2",
                            minWidth: stemCount > 0 ? 3 : 0,
                          }}
                        />
                      )}
                      {regCount > 0 && (
                        <div
                          className="h-2"
                          style={{
                            width: maxTotal > 0 ? `${(regCount / maxTotal) * 100}%` : 0,
                            background: "rgba(100,116,139,0.45)",
                            minWidth: regCount > 0 ? 3 : 0,
                          }}
                        />
                      )}
                    </div>
                    <span className="text-muted-foreground text-right shrink-0 w-20" style={{ fontSize: "11px" }}>
                      {stemCount > 0 || regCount > 0
                        ? `${stemCount} STEM${clbCount > 0 ? ` +${clbCount} CLB` : ""}`
                        : "—"}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center gap-3 pt-1">
                <div className="w-12" />
                <div className="flex items-center gap-3 text-muted-foreground flex-wrap" style={{ fontSize: "10px" }}>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2 rounded-sm inline-block" style={{ background: "#0891b2" }} />
                    STEM
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2 rounded-sm inline-block" style={{ background: "rgba(100,116,139,0.45)" }} />
                    TKB thường
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Info footer ── */}
        <div
          className="flex items-start gap-2 rounded-xl border px-4 py-3 text-muted-foreground"
          style={{ fontSize: "11px", background: "rgba(0,0,0,0.02)", borderColor: "rgba(0,0,0,0.07)" }}
        >
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            <span className="font-medium text-foreground">AD-03:</span>{" "}
            TKB tổng được import 1-chiều từ K12Online/VnEdu — STEM Platform chỉ đọc, không ghi ngược.
            Tiết STEM (màu) overlay lên tiết thường (xám) cùng slot. CT3 chỉ ở buổi chiều; CT5 không
            có slot TKB cố định.
            {forRole === "teacher" && " Trường hợp sai lịch, liên hệ QL trường chỉnh sửa trên K12Online."}
          </span>
        </div>
      </div>

      {/* ── Lesson modal ── */}
      <LessonModal entry={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export default STEMScheduleViewer;
