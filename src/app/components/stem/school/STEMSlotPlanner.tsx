import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  Calendar, Plus, Save, Layers, GraduationCap,
  Edit2, Trash2, AlertTriangle, CheckCircle2, X,
  Info, Clock, ArrowRight,
} from "lucide-react";
import {
  scheduleEntries, classesBySchool, stemRooms, tenantsByType,
  basePeriodsBySchool, PERIOD_TIMES, MORNING_PERIODS, AFTERNOON_PERIODS,
  type STEMScheduleEntry, type StemProgram,
} from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { ProgramBadge } from "../ui/badges";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  XẾP TIẾT STEM — editor với BR-03 + BR-02 enforcement            */
/*                                                                   */
/*  BR-03: CT1/CT2 = chính khóa → chỉ T1–5                          */
/*          CT3    = buổi 2     → chỉ T6–8                           */
/*          CT4    = tăng cường → T1–8 (linh hoạt)                  */
/*          CT5    = CLB        → KHÔNG xếp TKB, chỉ booking phòng  */
/*                                                                   */
/*  BR-02: Phòng Tối thiểu → CT1/CT2 only                           */
/*          Phòng Cơ bản    → CT1/CT2/CT3                            */
/*          Phòng Nâng cao  → CT1–CT5 (CT5 vẫn redirect booking)    */
/* ================================================================ */

const WEEKDAY_LABELS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];

/* ── BR-03: period constraints per CT ─────────────────────────── */
const CT_ALLOWED_PERIODS: Record<StemProgram, number[]> = {
  CT1: MORNING_PERIODS,   // T1–5 chính khóa
  CT2: MORNING_PERIODS,   // T1–5 chính khóa
  CT3: AFTERNOON_PERIODS, // T6–8 buổi 2
  CT4: [1, 2, 3, 4, 5, 6, 7, 8], // tăng cường — linh hoạt
  CT5: [],                // không xếp TKB
};

const CT_SLOT_LABEL: Record<StemProgram, string> = {
  CT1: "Chính khóa · Tiết 1–5",
  CT2: "Chính khóa · Tiết 1–5",
  CT3: "Buổi 2 · Tiết 6–8",
  CT4: "Tăng cường · Tiết 1–8",
  CT5: "CLB/Ngoại khóa — booking phòng",
};

const CT_TYPE_COLOR: Record<StemProgram, string> = {
  CT1: "#3b82f6",
  CT2: "#6366f1",
  CT3: "#22c55e",
  CT4: "#f59e0b",
  CT5: "#7c3aed",
};

/* ── BR-02: room tier → allowed CTs ───────────────────────────── */
const TIER_ALLOWED_CTS: Record<string, StemProgram[]> = {
  minimum: ["CT1", "CT2"],
  basic:   ["CT1", "CT2", "CT3"],
  advanced: ["CT1", "CT2", "CT3", "CT4"],
};

const STEM_TEACHERS = [
  { id: "U-TCH-01", name: "Phạm Anh Tuấn" },
  { id: "U-TCH-02", name: "Nguyễn Thị Lan" },
  { id: "U-TCH-03", name: "Trần Văn Hùng" },
  { id: "U-TCH-04", name: "Lê Minh Trang" },
  { id: "U-TCH-05", name: "Vũ Thanh Hương" },
  { id: "U-TCH-06", name: "Đặng Tuấn Anh" },
  { id: "U-TCH-07", name: "Bùi Thu Hà" },
  { id: "U-TCH-08", name: "Nguyễn Văn Dũng" },
];

interface FormState {
  program: StemProgram | "";
  roomId: string;
  classId: string;
  teacherId: string;
  period: number;
}

const EMPTY_FORM: FormState = { program: "", roomId: "", classId: "", teacherId: "", period: 0 };

export function STEMSlotPlanner() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const stemEntries = scheduleEntries.filter((s) => s.schoolId === tenantId);
  const baseEntries = basePeriodsBySchool(tenantId);
  const classes = classesBySchool(tenantId);
  const rooms = stemRooms.filter((r) => r.schoolId === tenantId);

  const [activeWeekday, setActiveWeekday] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const daySchedule = useMemo(
    () => stemEntries
      .filter((s) => s.weekday === activeWeekday && s.programCode !== "CT5")
      .sort((a, b) => a.period - b.period),
    [stemEntries, activeWeekday],
  );

  /* ── Per-day counts for weekday selector ───────────────────── */
  const dayCounts = WEEKDAY_LABELS.map((_, i) =>
    stemEntries.filter((s) => s.weekday === i + 1 && s.programCode !== "CT5").length,
  );

  /* ── KPIs ───────────────────────────────────────────────────── */
  const totalWeekly = stemEntries.filter((s) => s.programCode !== "CT5").length;
  const classesWithStem = new Set(stemEntries.filter(s => s.programCode !== "CT5").map((s) => s.classId)).size;
  const roomsInUse = new Set(stemEntries.map((s) => s.roomId)).size;
  const teachersAssigned = new Set(stemEntries.map((s) => s.teacherId)).size;

  /* ── Conflict detection ─────────────────────────────────────── */
  // 1. Room conflicts: same room + same period on same weekday
  const roomConflicts = useMemo(() => {
    const map = new Map<string, STEMScheduleEntry[]>();
    daySchedule.forEach((e) => {
      const key = `${e.roomId}-${e.period}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return new Set(
      Array.from(map.entries())
        .filter(([, arr]) => arr.length > 1)
        .flatMap(([, arr]) => arr.map((e) => e.id)),
    );
  }, [daySchedule]);

  // 2. Base TKB conflicts: STEM on top of a non-STEM period for same class
  const baseConflicts = useMemo(() => {
    const set = new Set<string>();
    daySchedule.forEach((se) => {
      const hasBase = baseEntries.some(
        (bp) => bp.classId === se.classId && bp.weekday === se.weekday && bp.period === se.period,
      );
      if (hasBase) set.add(se.id);
    });
    return set;
  }, [daySchedule, baseEntries]);

  /* ── Form helpers ───────────────────────────────────────────── */
  const selectedRoom = rooms.find((r) => r.id === form.roomId);
  const roomAllowedCTs: StemProgram[] = selectedRoom
    ? TIER_ALLOWED_CTS[selectedRoom.tier] ?? []
    : (["CT1", "CT2", "CT3", "CT4"] as StemProgram[]);

  const allowedPeriods: number[] = form.program
    ? CT_ALLOWED_PERIODS[form.program as StemProgram] ?? []
    : [];

  /* Validate form for submit */
  const formValid =
    form.program &&
    form.program !== "CT5" &&
    form.roomId &&
    form.classId &&
    form.teacherId &&
    allowedPeriods.includes(form.period);

  /* Check new entry against existing schedule */
  const newEntryConflict = useMemo(() => {
    if (!form.classId || !form.period || !form.roomId || !form.program) return null;

    // Room conflict
    const roomClash = daySchedule.find(
      (e) => e.roomId === form.roomId && e.period === form.period,
    );
    if (roomClash) return `Phòng "${selectedRoom?.name}" đã có tiết ${roomClash.className} · ${roomClash.programCode} tại Tiết ${form.period}`;

    // Base TKB conflict
    const baseClash = baseEntries.find(
      (bp) => bp.classId === form.classId && bp.weekday === activeWeekday && bp.period === form.period,
    );
    if (baseClash) return `Lớp có tiết "${baseClash.subject}" trong TKB nền (K12Online) tại Tiết ${form.period}`;

    return null;
  }, [form, daySchedule, baseEntries, activeWeekday, selectedRoom]);

  function handleSubmit() {
    if (!formValid) return;
    toast.success(
      `Đã thêm tiết ${form.program} · ${classes.find((c) => c.id === form.classId)?.name} · Tiết ${form.period} · ${selectedRoom?.name}`,
    );
    setForm(EMPTY_FORM);
    setShowAddForm(false);
  }

  /* ── Period sections: morning vs afternoon ──────────────────── */
  const morningSessions = daySchedule.filter((e) => MORNING_PERIODS.includes(e.period));
  const afternoonSessions = daySchedule.filter((e) => AFTERNOON_PERIODS.includes(e.period));

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Calendar}
        title="Xếp tiết STEM"
        subtitle="Phân công tiết STEM theo đúng loại chương trình và tầng phòng. CT5 dùng Booking phòng."
        accentColor="#2563eb"
        actions={
          <>
            <button
              onClick={() => toast.success("Đã lưu tất cả thay đổi TKB STEM")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Save className="w-4 h-4" /> Lưu
            </button>
            <button
              onClick={() => { setShowAddForm(true); setForm(EMPTY_FORM); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Plus className="w-4 h-4" /> Thêm tiết
            </button>
          </>
        }
      />

      {/* BR-03 rules summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {(["CT1", "CT2", "CT3", "CT4"] as StemProgram[]).map((ct) => (
          <div
            key={ct}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card"
            style={{ borderLeft: `3px solid ${CT_TYPE_COLOR[ct]}` }}
          >
            <ProgramBadge code={ct} size="sm" />
            <span className="text-xs text-muted-foreground">{CT_SLOT_LABEL[ct]}</span>
          </div>
        ))}
      </div>

      {/* CT5 notice */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#7c3aed]/30 bg-[#7c3aed]/5">
        <Info className="w-4 h-4 text-[#7c3aed] shrink-0" />
        <p className="text-sm text-foreground flex-1">
          <span className="font-semibold">CT5 (CLB/Ngoại khóa)</span> không được xếp TKB cố định —
          chỉ đặt qua Booking phòng theo từng buổi.
        </p>
        <Link
          to="/school/rooms/booking"
          className="flex items-center gap-1 text-xs font-semibold text-[#7c3aed] whitespace-nowrap hover:opacity-80"
        >
          Booking phòng <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Calendar} label="Tiết STEM/tuần" value={totalWeekly} color="#2563eb" subtitle="CT1–CT4" />
        <KpiCard icon={GraduationCap} label="Lớp có STEM" value={classesWithStem} color="#16a34a" />
        <KpiCard icon={Layers} label="Phòng đang dùng" value={roomsInUse} color="#7c3aed" />
        <KpiCard icon={Info} label="GV được phân công" value={teachersAssigned} color="#0891b2" />
      </div>

      {/* Weekday selector */}
      <div className="grid grid-cols-5 gap-2">
        {WEEKDAY_LABELS.map((label, i) => {
          const d = i + 1;
          const isActive = d === activeWeekday;
          return (
            <button
              key={d}
              onClick={() => setActiveWeekday(d)}
              className="flex flex-col items-center py-2.5 px-2 rounded-xl border transition-all"
              style={{
                borderColor: isActive ? "#2563eb" : "var(--border)",
                background: isActive ? "#2563eb" : "var(--card)",
                color: isActive ? "#fff" : "var(--foreground)",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 700 }}>{label}</span>
              <span style={{ fontSize: "10px", opacity: 0.7 }}>{dayCounts[i]} tiết</span>
            </button>
          );
        })}
      </div>

      {/* Day schedule */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Morning section */}
        <div className="px-4 py-2 bg-blue-50/60 dark:bg-blue-950/20 border-b border-border">
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
            Buổi sáng · Tiết 1–5 · CT1 & CT2 chính khóa
          </span>
        </div>
        <ScheduleTable
          entries={morningSessions}
          roomConflicts={roomConflicts}
          baseConflicts={baseConflicts}
          emptyLabel="Chưa có tiết CT1/CT2 sáng nào"
        />

        {/* Afternoon section */}
        <div className="px-4 py-2 bg-green-50/60 dark:bg-green-950/20 border-y border-border">
          <span className="text-xs font-semibold text-green-700 dark:text-green-400">
            Buổi chiều · Tiết 6–8 · CT3 buổi 2 & CT4 tăng cường
          </span>
        </div>
        <ScheduleTable
          entries={afternoonSessions}
          roomConflicts={roomConflicts}
          baseConflicts={baseConflicts}
          emptyLabel="Chưa có tiết CT3/CT4 chiều nào"
        />
      </div>

      {/* Conflict summary */}
      {(roomConflicts.size > 0 || baseConflicts.size > 0) && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {roomConflicts.size > 0 && `${roomConflicts.size} xung đột phòng`}
              {roomConflicts.size > 0 && baseConflicts.size > 0 && " · "}
              {baseConflicts.size > 0 && `${baseConflicts.size} đè lên TKB nền K12`}
            </p>
            <p className="text-xs text-amber-600/80 mt-0.5">
              Các tiết được đánh dấu ⚠ cần xem lại. TKB nền (K12Online) là nguồn ưu tiên (AD-03).
            </p>
          </div>
        </div>
      )}

      {/* Add form panel */}
      {showAddForm && (
        <div className="bg-card border-2 border-[#2563eb]/40 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Thêm tiết STEM mới — {WEEKDAY_LABELS[activeWeekday - 1]}</h3>
            <button
              onClick={() => { setShowAddForm(false); setForm(EMPTY_FORM); }}
              className="p-1 rounded hover:bg-secondary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Step 1: Choose program */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                1. Chọn Chương trình STEM
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(["CT1", "CT2", "CT3", "CT4", "CT5"] as StemProgram[]).map((ct) => {
                  const isCT5 = ct === "CT5";
                  const isDisabledByRoom = form.roomId && !roomAllowedCTs.includes(ct) && !isCT5;
                  const isSelected = form.program === ct;
                  return (
                    <button
                      key={ct}
                      onClick={() => {
                        if (isCT5) { toast.info("CT5 không xếp TKB — hãy dùng Booking phòng"); return; }
                        if (isDisabledByRoom) { toast.warning(`Phòng ${selectedRoom?.tier} không hỗ trợ ${ct} (BR-02)`); return; }
                        setForm((f) => ({ ...f, program: ct, period: 0 }));
                      }}
                      className="flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all"
                      style={{
                        borderColor: isSelected ? CT_TYPE_COLOR[ct] : "var(--border)",
                        background: isSelected ? CT_TYPE_COLOR[ct] + "15" : "var(--background)",
                        opacity: (isCT5 || isDisabledByRoom) ? 0.45 : 1,
                        cursor: (isCT5 || isDisabledByRoom) ? "not-allowed" : "pointer",
                      }}
                    >
                      <ProgramBadge code={ct} size="sm" />
                      <span className="text-center" style={{ fontSize: "9.5px", color: "var(--muted-foreground)", lineHeight: 1.3 }}>
                        {isCT5 ? "Booking phòng" : CT_SLOT_LABEL[ct].split("·")[0].trim()}
                      </span>
                    </button>
                  );
                })}
              </div>
              {form.program && form.program !== "CT5" && (
                <p className="mt-1.5 text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {CT_SLOT_LABEL[form.program as StemProgram]}
                </p>
              )}
            </div>

            {form.program && form.program !== "CT5" && (
              <>
                {/* Step 2: Choose room */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    2. Chọn Phòng STEM
                  </label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {rooms.map((room) => {
                      const allowed = TIER_ALLOWED_CTS[room.tier] ?? [];
                      const compatible = allowed.includes(form.program as StemProgram);
                      const isSelected = form.roomId === room.id;
                      const tierLabel = room.tier === "advanced" ? "Nâng cao" : room.tier === "basic" ? "Cơ bản" : "Tối thiểu";
                      const tierColor = room.tier === "advanced" ? "#c8a84e" : room.tier === "basic" ? "#2563eb" : "#6b7280";
                      return (
                        <button
                          key={room.id}
                          onClick={() => {
                            if (!compatible) { toast.warning(`${room.name} (${tierLabel}) không hỗ trợ ${form.program} (BR-02)`); return; }
                            if (room.status !== "active") { toast.error(`${room.name} đang ${room.status === "maintenance" ? "bảo trì" : "không hoạt động"}`); return; }
                            setForm((f) => ({ ...f, roomId: room.id }));
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl border text-left transition-all"
                          style={{
                            borderColor: isSelected ? "#2563eb" : "var(--border)",
                            background: isSelected ? "#2563eb15" : compatible ? "var(--background)" : "var(--secondary)",
                            opacity: compatible && room.status === "active" ? 1 : 0.45,
                            cursor: compatible && room.status === "active" ? "pointer" : "not-allowed",
                          }}
                        >
                          <div>
                            <div className="font-semibold text-foreground" style={{ fontSize: "12px" }}>{room.name}</div>
                            <div className="text-muted-foreground" style={{ fontSize: "10px" }}>
                              {room.capacity} chỗ · {compatible ? `Hỗ trợ ${form.program}` : `Không hỗ trợ ${form.program}`}
                            </div>
                          </div>
                          <span
                            className="text-xs font-semibold px-1.5 py-0.5 rounded"
                            style={{ background: tierColor + "20", color: tierColor }}
                          >
                            {tierLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Period */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    3. Chọn Tiết học
                    <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                      ({CT_SLOT_LABEL[form.program as StemProgram]})
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => {
                      const isAllowed = allowedPeriods.includes(p);
                      const isSelected = form.period === p;
                      return (
                        <button
                          key={p}
                          onClick={() => {
                            if (!isAllowed) {
                              toast.warning(
                                `${form.program} chỉ được xếp ${CT_SLOT_LABEL[form.program as StemProgram]} (BR-03)`,
                              );
                              return;
                            }
                            setForm((f) => ({ ...f, period: p }));
                          }}
                          className="flex flex-col items-center px-3 py-2 rounded-lg border transition-all"
                          style={{
                            borderColor: isSelected ? "#2563eb" : isAllowed ? "var(--border)" : "var(--border)",
                            background: isSelected ? "#2563eb" : "var(--background)",
                            color: isSelected ? "#fff" : "var(--foreground)",
                            opacity: isAllowed ? 1 : 0.35,
                            cursor: isAllowed ? "pointer" : "not-allowed",
                          }}
                        >
                          <span style={{ fontSize: "12px", fontWeight: 700 }}>T{p}</span>
                          <span style={{ fontSize: "9px", opacity: 0.7 }}>{PERIOD_TIMES[p]?.split("–")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 4: Class + Teacher */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">4. Lớp học</label>
                    <select
                      value={form.classId}
                      onChange={(e) => setForm((f) => ({ ...f, classId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
                    >
                      <option value="">Chọn lớp</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">5. Giáo viên STEM</label>
                    <select
                      value={form.teacherId}
                      onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30"
                    >
                      <option value="">Chọn giáo viên</option>
                      {STEM_TEACHERS.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conflict warning for new entry */}
                {newEntryConflict && (
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">{newEntryConflict}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleSubmit}
                    disabled={!formValid}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity"
                    style={{
                      background: "#2563eb",
                      opacity: formValid ? 1 : 0.45,
                      cursor: formValid ? "pointer" : "not-allowed",
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Thêm tiết STEM
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setForm(EMPTY_FORM); }}
                    className="px-4 py-2 rounded-lg text-sm border border-border text-foreground hover:bg-secondary"
                  >
                    Hủy
                  </button>
                  {!formValid && (
                    <span className="text-xs text-muted-foreground">Điền đủ thông tin ở trên</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-component: schedule table rows ─────────────────────────── */
function ScheduleTable({
  entries,
  roomConflicts,
  baseConflicts,
  emptyLabel,
}: {
  entries: STEMScheduleEntry[];
  roomConflicts: Set<string>;
  baseConflicts: Set<string>;
  emptyLabel: string;
}) {
  if (entries.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-sm text-muted-foreground">{emptyLabel}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-secondary/40 border-b border-border">
          <tr>
            {["Tiết", "Lớp", "GV STEM", "CT", "Phòng", "Trạng thái", ""].map((h) => (
              <th key={h} className="px-3 py-2 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => {
            const hasRoomConflict = roomConflicts.has(e.id);
            const hasBaseConflict = baseConflicts.has(e.id);
            const hasAnyConflict = hasRoomConflict || hasBaseConflict;
            return (
              <tr
                key={e.id}
                className={`border-t border-border ${hasAnyConflict ? "bg-amber-50/50 dark:bg-amber-950/10" : "hover:bg-secondary/20"}`}
              >
                <td className="px-3 py-2">
                  <div className="font-bold text-foreground" style={{ fontSize: "13px" }}>T{e.period}</div>
                  <div className="text-muted-foreground" style={{ fontSize: "9.5px" }}>{PERIOD_TIMES[e.period]}</div>
                </td>
                <td className="px-3 py-2 font-semibold text-foreground" style={{ fontSize: "12px" }}>{e.className}</td>
                <td className="px-3 py-2 text-foreground" style={{ fontSize: "12px" }}>{e.teacherName}</td>
                <td className="px-3 py-2"><ProgramBadge code={e.programCode} size="sm" /></td>
                <td className="px-3 py-2 text-foreground" style={{ fontSize: "12px" }}>{e.roomName}</td>
                <td className="px-3 py-2">
                  {hasAnyConflict ? (
                    <div className="flex flex-col gap-0.5">
                      {hasRoomConflict && (
                        <span className="inline-flex items-center gap-1 text-amber-600" style={{ fontSize: "10px", fontWeight: 600 }}>
                          <AlertTriangle className="w-3 h-3" /> Xung đột phòng
                        </span>
                      )}
                      {hasBaseConflict && (
                        <span className="inline-flex items-center gap-1 text-red-600" style={{ fontSize: "10px", fontWeight: 600 }}>
                          <AlertTriangle className="w-3 h-3" /> Đè TKB K12
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-green-600" style={{ fontSize: "10px", fontWeight: 600 }}>
                      <CheckCircle2 className="w-3 h-3" /> Hợp lệ
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toast.info(`Chỉnh sửa tiết ${e.className} · ${e.programCode} · T${e.period}`)}
                      className="p-1 rounded hover:bg-secondary"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => toast.error(`Đã xóa tiết ${e.className} · ${e.programCode} · T${e.period}`)}
                      className="p-1 rounded hover:bg-secondary"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default STEMSlotPlanner;
