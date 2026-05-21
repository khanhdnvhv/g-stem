import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  Calendar, Download, Info, RefreshCw, AlertTriangle,
  CheckCircle2, ChevronDown, Layers, Clock,
} from "lucide-react";
import {
  tenantsByType, STEM_PROGRAMS,
  basePeriodsBySchool, PERIOD_TIMES, MORNING_PERIODS, AFTERNOON_PERIODS,
  type STEMScheduleEntry, type StemProgram, type BasePeriod,
} from "../../mock-data/index";
import { getStoredEntries } from "../../../lib/schedule-store";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { ProgramBadge } from "../ui/badges";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  TKB TOÀN TRƯỜNG — 2-layer viewer                               */
/*  Lớp 1 (nền xám): TKB import từ K12Online/VnEdu                 */
/*  Lớp 2 (màu):    Tiết STEM (CT1–CT4) gắn lên TKB nền            */
/*  CT5 KHÔNG xuất hiện ở đây — chỉ dùng Booking phòng (AD-03)     */
/*  BR-03: CT1/CT2 = chính khóa (T1-5), CT3 = buổi 2 (T6-8)        */
/* ================================================================ */

const WEEKDAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
const ALL_PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

type LayerMode = "all" | "base" | "stem";

export function STEMSchedulePlanner() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const stemEntries = useMemo(
    () => getStoredEntries(tenantId).filter((e) => e.programCode !== "CT5"),
    [tenantId],
  );
  const baseEntries = useMemo(
    () => basePeriodsBySchool(tenantId),
    [tenantId],
  );

  const [classFilter, setClassFilter] = useState<string>(searchParams.get("class") ?? "all");
  const [layerMode, setLayerMode] = useState<LayerMode>("all");
  const [showLegend, setShowLegend] = useState(false);

  /* ── Distinct class list (from base TKB) ────────────────────── */
  const classes = useMemo(
    () => Array.from(new Set(baseEntries.map((e) => e.className))).sort(),
    [baseEntries],
  );

  const filteredStem = classFilter === "all"
    ? stemEntries
    : stemEntries.filter((e) => e.className === classFilter);

  const filteredBase = classFilter === "all"
    ? baseEntries
    : baseEntries.filter((e) => e.className === classFilter);

  /* ── Build lookup maps ───────────────────────────────────────── */
  // stemGrid[weekday][period] = STEMScheduleEntry[]
  const stemGrid = useMemo(() => {
    const g: Record<number, Record<number, STEMScheduleEntry[]>> = {};
    for (let w = 1; w <= 5; w++) { g[w] = {}; for (const p of ALL_PERIODS) g[w][p] = []; }
    filteredStem.forEach((e) => { if (g[e.weekday]?.[e.period] !== undefined) g[e.weekday][e.period].push(e); });
    return g;
  }, [filteredStem]);

  // baseGrid[weekday][period] = BasePeriod[]
  const baseGrid = useMemo(() => {
    const g: Record<number, Record<number, BasePeriod[]>> = {};
    for (let w = 1; w <= 5; w++) { g[w] = {}; for (const p of ALL_PERIODS) g[w][p] = []; }
    filteredBase.forEach((e) => { if (g[e.weekday]?.[e.period] !== undefined) g[e.weekday][e.period].push(e); });
    return g;
  }, [filteredBase]);

  /* ── Conflict detection: STEM entry placed on a filled base slot ─ */
  const conflictSet = useMemo(() => {
    const conflicts = new Set<string>();
    filteredStem.forEach((se) => {
      const baseCell = baseGrid[se.weekday]?.[se.period] ?? [];
      // Only flag conflict if SAME class has both a base period AND a STEM period at same slot
      const sameClassBase = baseCell.filter((bp) => bp.className === se.className);
      if (sameClassBase.length > 0) {
        conflicts.add(`${se.weekday}-${se.period}-${se.className}`);
      }
    });
    return conflicts;
  }, [filteredStem, baseGrid]);

  /* ── KPIs ───────────────────────────────────────────────────── */
  const totalStemPeriods = filteredStem.length;
  const conflictCount = conflictSet.size;
  const classesCoveredCount = new Set(filteredStem.map((e) => e.className)).size;
  const ct5Count = getStoredEntries(tenantId).filter((e) => e.programCode === "CT5").length;

  /* ── Program distribution (exclude CT5) ─────────────────────── */
  const byProgram: Partial<Record<StemProgram, number>> = {};
  filteredStem.forEach((e) => { byProgram[e.programCode] = (byProgram[e.programCode] ?? 0) + 1; });

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Calendar}
        title="Thời khóa biểu Toàn trường"
        subtitle="TKB nền K12Online + lớp tiết STEM gắn phía trên. CT5 quản lý qua Booking phòng."
        accentColor="#990803"
        actions={
          <>
            <button
              onClick={() => toast.info("Đang đồng bộ lại TKB từ K12Online…")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <RefreshCw className="w-4 h-4" /> Đồng bộ K12
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Download className="w-4 h-4" /> Xuất PDF
            </button>
            <Link
              to="/school/stem-slots"
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500, textDecoration: "none" }}
            >
              <Layers className="w-4 h-4" /> Xếp tiết STEM
            </Link>
          </>
        }
      />

      {/* Sync status banner */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
            Đã đồng bộ từ K12Online
          </span>
          <span className="text-xs text-green-600/70 dark:text-green-500">
            · Lần cuối: 18/05/2026 lúc 06:00 · {classes.length} lớp · {baseEntries.length} tiết nền
          </span>
        </div>
        <span className="text-xs text-muted-foreground">Nguồn: k12online.vn · THCS Nguyễn Du</span>
      </div>

      {/* Conflict warning */}
      {conflictCount > 0 && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              Phát hiện {conflictCount} xung đột
            </p>
            <p className="text-xs text-amber-600/80 mt-0.5">
              Tiết STEM đang đè lên tiết học nền cùng lớp cùng thời điểm. Kiểm tra phần ô được viền đỏ.
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Calendar} label="Tiết STEM/tuần" value={totalStemPeriods} color="#2563eb" subtitle="CT1–CT4" />
        <KpiCard icon={Layers} label="Lớp có STEM" value={classesCoveredCount} color="#16a34a" subtitle={`/ ${classes.length} lớp`} />
        <KpiCard icon={AlertTriangle} label="Xung đột" value={conflictCount} color={conflictCount > 0 ? "#f59e0b" : "#16a34a"} subtitle={conflictCount > 0 ? "Cần xem lại" : "Không có"} />
        <KpiCard icon={Info} label="CLB CT5 (booking)" value={ct5Count} color="#7c3aed" subtitle="Xem Booking phòng" />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Layer toggle */}
        <div className="flex items-center rounded-lg border border-border overflow-hidden bg-card">
          {(["all", "base", "stem"] as LayerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setLayerMode(m)}
              className="px-3 py-1.5 transition-colors"
              style={{
                fontSize: "12px",
                fontWeight: layerMode === m ? 700 : 500,
                background: layerMode === m ? "#990803" : undefined,
                color: layerMode === m ? "#fff" : undefined,
              }}
            >
              {m === "all" ? "Tất cả" : m === "base" ? "TKB nền" : "STEM"}
            </button>
          ))}
        </div>

        {/* Class filter */}
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-1.5 bg-card border border-border rounded-lg outline-none text-foreground"
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          <option value="all">Tất cả lớp</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Legend toggle */}
        <button
          onClick={() => setShowLegend((v) => !v)}
          className="flex items-center gap-1 px-3 py-1.5 bg-card border border-border rounded-lg hover:bg-secondary"
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          Chú thích <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showLegend ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-x-5 gap-y-2">
          <span className="flex items-center gap-1.5 text-xs text-foreground">
            <span className="w-5 h-4 rounded bg-secondary border border-border inline-block" />
            TKB nền (K12Online)
          </span>
          <span className="flex items-center gap-1.5 text-xs text-foreground">
            <span className="w-5 h-4 rounded inline-block" style={{ background: "#3b82f620", borderLeft: "3px solid #3b82f6" }} />
            CT1 / CT2 — Chính khóa (T1–5)
          </span>
          <span className="flex items-center gap-1.5 text-xs text-foreground">
            <span className="w-5 h-4 rounded inline-block" style={{ background: "#22c55e20", borderLeft: "3px solid #22c55e" }} />
            CT3 — Buổi 2 (T6–8)
          </span>
          <span className="flex items-center gap-1.5 text-xs text-foreground">
            <span className="w-5 h-4 rounded inline-block" style={{ background: "#f59e0b20", borderLeft: "3px solid #f59e0b" }} />
            CT4 — Tăng cường (T1–8)
          </span>
          <span className="flex items-center gap-1.5 text-xs text-foreground">
            <span className="w-5 h-4 rounded border-2 border-red-500 inline-block" />
            ⚠ Xung đột STEM ↔ TKB nền
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-5 h-4 rounded inline-block" style={{ background: "#7c3aed20", borderLeft: "3px solid #7c3aed" }} />
            CT5 — Không xếp TKB (chỉ booking phòng)
          </span>
        </div>
      )}

      {/* Morning/Afternoon separator + Grid */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="bg-secondary/60">
                <th className="px-3 py-2.5 text-left w-[90px]" style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted-foreground)" }}>
                  Tiết
                </th>
                {WEEKDAYS.map((d) => (
                  <th key={d} className="px-2 py-2.5 text-left min-w-[150px]" style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted-foreground)" }}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_PERIODS.map((p) => {
                const isMorning = MORNING_PERIODS.includes(p);
                const isFirstAfternoon = p === AFTERNOON_PERIODS[0];

                return (
                  <>
                    {/* Separator row between morning and afternoon */}
                    {isFirstAfternoon && (
                      <tr key="separator">
                        <td colSpan={6} className="px-3 py-1.5 bg-secondary/30 border-y border-dashed border-border">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-semibold">Buổi chiều (Tiết 6–8)</span>
                            <span>· CT3 chính khóa · CT4 tăng cường · CLB có thể booking phòng</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {p === 1 && (
                      <tr key="morning-header">
                        <td colSpan={6} className="px-3 py-1 bg-secondary/20 border-b border-dashed border-border">
                          <span className="text-xs font-semibold text-muted-foreground">Buổi sáng (Tiết 1–5) · CT1 & CT2 chính khóa</span>
                        </td>
                      </tr>
                    )}
                    <tr key={p} className="border-t border-border hover:bg-secondary/10 transition-colors">
                      {/* Period label */}
                      <td className={`px-3 py-1.5 text-center align-top ${isMorning ? "bg-blue-50/50 dark:bg-blue-950/10" : "bg-green-50/50 dark:bg-green-950/10"}`}>
                        <div className="font-bold text-foreground" style={{ fontSize: "13px" }}>T{p}</div>
                        <div className="text-muted-foreground" style={{ fontSize: "9.5px" }}>{PERIOD_TIMES[p]}</div>
                      </td>

                      {/* Day cells */}
                      {WEEKDAYS.map((_, wdi) => {
                        const wd = wdi + 1;
                        const stemCells = (layerMode === "base") ? [] : (stemGrid[wd]?.[p] ?? []);
                        const baseCells = (layerMode === "stem") ? [] : (baseGrid[wd]?.[p] ?? []);

                        return (
                          <td key={wd} className="px-1 py-1 align-top cursor-pointer" onClick={() => navigate(`/school/stem-slots?weekday=${wd}&period=${p}`)}>
                            <div className="space-y-0.5">
                              {/* Base TKB entries (gray) */}
                              {baseCells.map((bp) => {
                                const isConflict = conflictSet.has(`${wd}-${p}-${bp.className}`);
                                return (
                                  <div
                                    key={bp.id}
                                    className={`px-1.5 py-1 rounded text-foreground transition-opacity cursor-default ${
                                      isConflict ? "ring-2 ring-red-400" : ""
                                    }`}
                                    style={{ background: "var(--secondary)", fontSize: "10px" }}
                                    title={`${bp.className} · ${bp.subject} · ${bp.teacherName}`}
                                  >
                                    <div className="font-semibold truncate" style={{ fontSize: "10px" }}>
                                      {classFilter === "all" ? `${bp.className} — ` : ""}{bp.subject}
                                    </div>
                                    <div className="text-muted-foreground truncate" style={{ fontSize: "9px" }}>
                                      {bp.teacherName.split(" ").slice(-2).join(" ")} · K12
                                    </div>
                                    {isConflict && (
                                      <div className="flex items-center gap-0.5 mt-0.5">
                                        <AlertTriangle className="w-2.5 h-2.5 text-red-500" />
                                        <span className="text-red-500" style={{ fontSize: "8px", fontWeight: 700 }}>Xung đột STEM</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {/* STEM entries (colored by CT) */}
                              {stemCells.map((se) => {
                                const meta = STEM_PROGRAMS[se.programCode];
                                const isConflict = conflictSet.has(`${wd}-${p}-${se.className}`);
                                return (
                                  <div
                                    key={se.id}
                                    onClick={(ev) => { ev.stopPropagation(); navigate(`/school/stem-slots?weekday=${wd}&period=${p}`); }}
                                    className={`px-1.5 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                                      isConflict ? "ring-2 ring-red-400" : ""
                                    }`}
                                    style={{
                                      background: meta.color + "18",
                                      borderLeft: `3px solid ${meta.color}`,
                                    }}
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      {classFilter === "all" && (
                                        <span className="font-bold truncate" style={{ fontSize: "10px" }}>{se.className}</span>
                                      )}
                                      <ProgramBadge code={se.programCode} size="xs" />
                                    </div>
                                    <div className="truncate" style={{ fontSize: "10px", fontWeight: 500 }}>
                                      {se.subject}
                                    </div>
                                    <div className="text-muted-foreground truncate" style={{ fontSize: "9px" }}>
                                      {se.roomName} · {se.teacherName.split(" ").slice(-2).join(" ")}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CT5 info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[#7c3aed]/30 bg-[#7c3aed]/5">
        <Info className="w-4 h-4 text-[#7c3aed] shrink-0 mt-0.5" />
        <div className="flex-1 flex items-center justify-between gap-4">
          <p className="text-sm text-foreground">
            <span className="font-semibold">CT5 — CLB & Ngoại khóa</span> không có tiết TKB cố định.
            {ct5Count > 0 && ` Hiện có ${ct5Count} buổi CT5 đang dùng Booking phòng.`}
          </p>
          <Link
            to="/school/rooms/booking"
            className="shrink-0 text-xs font-semibold text-[#7c3aed] underline underline-offset-2 hover:opacity-80 whitespace-nowrap"
          >
            Xem Booking phòng →
          </Link>
        </div>
      </div>

      {/* Program distribution */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground mb-3">Phân bổ tiết STEM theo chương trình (tuần)</p>
        <div className="flex flex-wrap gap-2">
          {(["CT1", "CT2", "CT3", "CT4"] as StemProgram[]).map((code) => (
            <span
              key={code}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border"
              style={{ fontSize: "12px" }}
            >
              <ProgramBadge code={code} size="xs" />
              <strong>{byProgram[code] ?? 0}</strong> tiết
              <span className="text-muted-foreground text-xs">
                {code === "CT1" || code === "CT2" ? "chính khóa" : code === "CT3" ? "buổi 2" : "tăng cường"}
              </span>
            </span>
          ))}
          {ct5Count > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[#7c3aed]" style={{ fontSize: "12px" }}>
              CT5 · {ct5Count} buổi (booking)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default STEMSchedulePlanner;
