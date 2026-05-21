import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import {
  Calendar, Clock, Users, Layers, CheckCircle, AlertCircle, ArrowLeft, Plus,
} from "lucide-react";
import { stemRooms, roomBookings, type STEMRoom, type RoomBooking } from "../../mock-data/index";
import { tenantsByType } from "../../mock-data/index";
import { getStoredEntries } from "../../../lib/schedule-store";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  ROOM BOOKING (School) — Đặt lịch sử dụng phòng STEM             */
/* ================================================================ */

const CLASS_OPTIONS = [
  "6A", "6B", "6C", "6D",
  "7A", "7B", "7C", "7D",
  "8A", "8B", "8C",
  "9A", "9B", "9C",
];

const PROGRAM_OPTIONS = [
  { code: "CT1", name: "CT1 — STEM Tích hợp nội môn" },
  { code: "CT2", name: "CT2 — STEM Liên môn" },
  { code: "CT3", name: "CT3 — STEM Đổi mới sáng tạo" },
  { code: "CT4", name: "CT4 — Robotic / AI" },
  { code: "CT5", name: "CT5 — Nghiên cứu khoa học" },
];

const PURPOSE_OPTIONS = [
  "Dạy học chương trình STEM",
  "Ôn tập trước kỳ thi",
  "Thực hành dự án nhóm",
  "Câu lạc bộ STEM / Robotic",
];

const PERIOD_OPTIONS = Array.from({ length: 8 }, (_, i) => i + 1);

// BR-03: CT1/CT2 = chính khóa (T1-5 only), CT3 = buổi 2 (T6-8 only), CT4/CT5 = any
const CT_PERIOD_RULES: Record<string, { allowed: number[]; hint: string }> = {
  CT1: { allowed: [1,2,3,4,5], hint: "CT1 chỉ xếp tiết 1–5 (buổi sáng chính khóa)" },
  CT2: { allowed: [1,2,3,4,5], hint: "CT2 chỉ xếp tiết 1–5 (buổi sáng chính khóa)" },
  CT3: { allowed: [6,7,8],     hint: "CT3 chỉ xếp tiết 6–8 (buổi chiều)" },
  CT4: { allowed: [1,2,3,4,5,6,7,8], hint: "" },
  CT5: { allowed: [1,2,3,4,5,6,7,8], hint: "" },
};

// Weekdays for the current week (Mon–Fri based on 2026-05-18 = Monday)
function getWeekDays(anchor: string): string[] {
  const date = new Date(anchor);
  const day = date.getDay(); // 0=Sun
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(monday.getDate() + diffToMon);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

const TODAY = "2026-05-18";
const WEEK_DAYS = getWeekDays(TODAY);

const VI_WEEKDAY: Record<number, string> = {
  1: "T2", 2: "T3", 3: "T4", 4: "T5", 5: "T6",
};

function generateBookingRef(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `BK-${num}`;
}

export function RoomBooking() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const [submitted, setSubmitted] = useState(false);
  const [bookingRef] = useState(generateBookingRef);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [viewMode, setViewMode] = useState<"form" | "schedule">("form");

  // Form state
  const [formPeriod, setFormPeriod] = useState("1");
  const [formClass, setFormClass] = useState("");
  const [formProgram, setFormProgram] = useState("");
  const [formPurpose, setFormPurpose] = useState("");
  const [formNote, setFormNote] = useState("");

  // Schedule view
  const [scheduleDate, setScheduleDate] = useState(TODAY);

  // Conflict detection: check static bookings + localStorage schedule entries
  const selectedWeekday = (() => {
    const d = new Date(selectedDate).getDay(); // 0=Sun,1=Mon,...
    return d >= 1 && d <= 5 ? d : 0;
  })();
  const hasConflict =
    selectedRoom !== "" &&
    selectedDate !== "" &&
    formPeriod !== "" &&
    (
      roomBookings.some(
        (b) =>
          b.roomId === selectedRoom &&
          b.date === selectedDate &&
          b.period === Number(formPeriod) &&
          b.status !== "cancelled"
      ) ||
      getStoredEntries(tenantId).some(
        (e) =>
          e.roomId === selectedRoom &&
          e.period === Number(formPeriod) &&
          e.weekday === selectedWeekday
      )
    );

  // BR-03: period must match CT type
  const ctRule = formProgram ? CT_PERIOD_RULES[formProgram] : null;
  const hasPeriodViolation =
    ctRule !== null && formPeriod !== "" && !ctRule.allowed.includes(Number(formPeriod));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Yêu cầu đặt phòng đã được gửi!");
  };

  // Build schedule grid for a given date
  function buildScheduleGrid(date: string) {
    const dayBookings = roomBookings.filter((b) => b.date === date && b.status !== "cancelled");
    // period → roomId → booking
    const grid: Record<number, Record<string, RoomBooking | null>> = {};
    for (let p = 1; p <= 8; p++) {
      grid[p] = {};
      for (const room of stemRooms) {
        grid[p][room.id] = null;
      }
    }
    for (const b of dayBookings) {
      if (grid[b.period] && b.roomId in grid[b.period]) {
        grid[b.period][b.roomId] = b;
      }
    }
    return grid;
  }

  const scheduleGrid = buildScheduleGrid(scheduleDate);

  const inputClass =
    "w-full px-3 py-2.5 bg-card border border-border rounded-lg outline-none focus:border-[#990803] text-foreground transition-colors";
  const inputStyle = { fontSize: "13px" };
  const labelClass = "block text-foreground mb-1";
  const labelStyle = { fontSize: "12px", fontWeight: 600 };

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        icon={Calendar}
        title="Đặt Phòng STEM"
        subtitle="Đặt lịch sử dụng phòng STEM cho tiết học."
        accentColor="#990803"
        actions={
          <Link
            to="/school/rooms"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            style={{ fontSize: "13px" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Danh sách phòng
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg w-fit">
        {(["form", "schedule"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md transition-colors ${
              viewMode === mode
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontSize: "13px", fontWeight: viewMode === mode ? 600 : 400 }}
          >
            {mode === "form" ? (
              <>
                <Plus className="w-4 h-4" />
                Đặt phòng mới
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                Xem lịch phòng
              </>
            )}
          </button>
        ))}
      </div>

      {/* Form View */}
      {viewMode === "form" && (
        <>
          {submitted ? (
            /* Success Card */
            <div className="bg-card border border-border rounded-xl p-8 text-center max-w-md mx-auto">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#16a34a15" }}
              >
                <CheckCircle className="w-8 h-8" style={{ color: "#16a34a" }} />
              </div>
              <h2 className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>
                Yêu cầu đã được gửi!
              </h2>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
                Yêu cầu đặt phòng của bạn đang chờ xét duyệt.
              </p>
              <div
                className="mt-4 px-4 py-3 bg-[#2563eb10] rounded-lg"
                style={{ fontSize: "13px" }}
              >
                <span className="text-muted-foreground">Mã đặt phòng:</span>{" "}
                <strong className="text-[#2563eb]" style={{ fontSize: "16px" }}>
                  {bookingRef}
                </strong>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-5 flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90 mx-auto"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                <Plus className="w-4 h-4" />
                Đặt phòng khác
              </button>
            </div>
          ) : (
            /* Booking Form */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <form onSubmit={onSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 700 }}>
                    Thông tin đặt phòng
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phòng học */}
                    <div>
                      <label className={labelClass} style={labelStyle}>
                        Phòng học <span className="text-[#dc2626]">*</span>
                      </label>
                      <select
                        required
                        value={selectedRoom}
                        onChange={(e) => setSelectedRoom(e.target.value)}
                        className={inputClass}
                        style={inputStyle}
                      >
                        <option value="">-- Chọn phòng --</option>
                        {stemRooms.map((room) => (
                          <option
                            key={room.id}
                            value={room.id}
                            disabled={room.status !== "active"}
                          >
                            {room.name} ({room.code})
                            {room.status !== "active" ? " — Không khả dụng" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Ngày */}
                    <div>
                      <label className={labelClass} style={labelStyle}>
                        Ngày <span className="text-[#dc2626]">*</span>
                      </label>
                      <input
                        required
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={TODAY}
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>

                    {/* Tiết học */}
                    <div>
                      <label className={labelClass} style={labelStyle}>
                        Tiết học <span className="text-[#dc2626]">*</span>
                      </label>
                      <select
                        required
                        value={formPeriod}
                        onChange={(e) => setFormPeriod(e.target.value)}
                        className={`${inputClass} ${hasPeriodViolation ? "border-red-400 focus:border-red-500" : ""}`}
                        style={inputStyle}
                      >
                        {PERIOD_OPTIONS.map((p) => {
                          const allowed = !ctRule || ctRule.allowed.includes(p);
                          return (
                            <option key={p} value={String(p)} disabled={!allowed}>
                              Tiết {p}{!allowed ? " (không hợp lệ)" : ""}
                            </option>
                          );
                        })}
                      </select>
                      {ctRule?.hint && (
                        <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10.5px" }}>
                          {ctRule.hint}
                        </p>
                      )}
                    </div>

                    {/* Lớp học */}
                    <div>
                      <label className={labelClass} style={labelStyle}>
                        Lớp học <span className="text-[#dc2626]">*</span>
                      </label>
                      <select
                        required
                        value={formClass}
                        onChange={(e) => setFormClass(e.target.value)}
                        className={inputClass}
                        style={inputStyle}
                      >
                        <option value="">-- Chọn lớp --</option>
                        {CLASS_OPTIONS.map((cls) => (
                          <option key={cls} value={cls}>
                            Lớp {cls}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Chương trình STEM */}
                    <div>
                      <label className={labelClass} style={labelStyle}>
                        Chương trình STEM <span className="text-[#dc2626]">*</span>
                      </label>
                      <select
                        required
                        value={formProgram}
                        onChange={(e) => setFormProgram(e.target.value)}
                        className={inputClass}
                        style={inputStyle}
                      >
                        <option value="">-- Chọn chương trình --</option>
                        {PROGRAM_OPTIONS.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mục đích sử dụng */}
                    <div>
                      <label className={labelClass} style={labelStyle}>
                        Mục đích sử dụng <span className="text-[#dc2626]">*</span>
                      </label>
                      <select
                        required
                        value={formPurpose}
                        onChange={(e) => setFormPurpose(e.target.value)}
                        className={inputClass}
                        style={inputStyle}
                      >
                        <option value="">-- Chọn mục đích --</option>
                        {PURPOSE_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Ghi chú */}
                  <div>
                    <label className={labelClass} style={labelStyle}>
                      Ghi chú
                    </label>
                    <textarea
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
                      placeholder="Yêu cầu thêm, ghi chú đặc biệt..."
                      rows={3}
                      className={inputClass}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>

                  {/* Period violation warning (BR-03) */}
                  {hasPeriodViolation && ctRule && (
                    <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-800 dark:text-red-300" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                          Vi phạm quy tắc lịch (BR-03)
                        </p>
                        <p className="text-red-700 dark:text-red-400 mt-0.5" style={{ fontSize: "11.5px" }}>
                          {ctRule.hint} — Vui lòng chọn lại tiết học cho phù hợp.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Conflict Warning */}
                  {hasConflict && !hasPeriodViolation && (
                    <div className="flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-800 dark:text-amber-300" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                          Xung đột lịch đặt phòng
                        </p>
                        <p className="text-amber-700 dark:text-amber-400 mt-0.5" style={{ fontSize: "11.5px" }}>
                          Phòng này đã có lịch vào <strong>tiết {formPeriod}</strong> ngày{" "}
                          <strong>{new Date(selectedDate).toLocaleDateString("vi-VN")}</strong>. Vui lòng chọn tiết hoặc ngày khác.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
                      Yêu cầu sẽ được BGH xét duyệt trong vòng 24 giờ.
                    </p>
                    <button
                      type="submit"
                      disabled={hasConflict || hasPeriodViolation}
                      className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg transition-opacity ${
                        hasConflict || hasPeriodViolation
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-[#990803] text-white hover:opacity-90"
                      }`}
                      style={{ fontSize: "13px", fontWeight: 600 }}
                    >
                      <Calendar className="w-4 h-4" />
                      Gửi yêu cầu đặt phòng
                    </button>
                  </div>
                </form>
              </div>

              {/* Sidebar info */}
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-xl p-4">
                  <h4 className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 700 }}>
                    Phòng khả dụng
                  </h4>
                  <div className="space-y-2">
                    {stemRooms.map((room) => (
                      <div key={room.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>
                            {room.name}
                          </p>
                          <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                            {room.code} · {room.capacity} chỗ
                          </p>
                        </div>
                        <span
                          className="px-1.5 py-0.5 rounded-md"
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            color: room.status === "active" ? "#16a34a" : "#f59e0b",
                            backgroundColor: room.status === "active" ? "#16a34a15" : "#f59e0b15",
                          }}
                        >
                          {room.status === "active" ? "Khả dụng" : "Bảo trì"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#2563eb10] border border-[#2563eb30] rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-[#2563eb] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[#2563eb]" style={{ fontSize: "12px", fontWeight: 700 }}>
                        Lưu ý khi đặt phòng
                      </p>
                      <ul className="mt-1.5 space-y-1 text-muted-foreground" style={{ fontSize: "11px" }}>
                        <li>• Đặt phòng trước ít nhất 24 giờ</li>
                        <li>• Mỗi GV tối đa 3 lịch/tuần</li>
                        <li>• Hủy đặt phòng trước 2 tiếng</li>
                        <li>• Bàn giao phòng ngay sau giờ dạy</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Schedule View */}
      {viewMode === "schedule" && (
        <div className="space-y-4">
          {/* Date Selector */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4" style={{ color: "#2563eb" }} />
              <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
                Tuần {new Date(WEEK_DAYS[0]).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} –{" "}
                {new Date(WEEK_DAYS[4]).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {WEEK_DAYS.map((date) => {
                const d = new Date(date);
                const wd = d.getDay();
                const isToday = date === TODAY;
                const isSelected = date === scheduleDate;
                return (
                  <button
                    key={date}
                    onClick={() => setScheduleDate(date)}
                    className={`flex flex-col items-center px-3.5 py-2 rounded-lg border transition-colors ${
                      isSelected
                        ? "bg-[#990803] text-white border-[#990803]"
                        : isToday
                        ? "border-[#2563eb] text-[#2563eb] bg-[#2563eb10]"
                        : "bg-card border-border hover:bg-secondary text-foreground"
                    }`}
                  >
                    <span style={{ fontSize: "10px", fontWeight: 600 }}>{VI_WEEKDAY[wd]}</span>
                    <span style={{ fontSize: "14px", fontWeight: 700 }}>
                      {d.getDate()}
                    </span>
                    {isToday && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-[#2563eb] mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timetable */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: "#2563eb" }} />
              <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 700 }}>
                Lịch sử dụng phòng — {new Date(scheduleDate).toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border">
                    <th
                      className="px-4 py-2.5 text-left text-muted-foreground"
                      style={{ fontSize: "11px", fontWeight: 600, minWidth: "60px" }}
                    >
                      Tiết
                    </th>
                    {stemRooms.map((room) => (
                      <th
                        key={room.id}
                        className="px-3 py-2.5 text-center text-muted-foreground"
                        style={{ fontSize: "11px", fontWeight: 600, minWidth: "130px" }}
                      >
                        {room.name}
                        <div
                          className="text-muted-foreground/60 font-normal mt-0.5"
                          style={{ fontSize: "9.5px" }}
                        >
                          {room.code}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIOD_OPTIONS.map((period) => (
                    <tr key={period} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 text-muted-foreground font-medium" style={{ fontSize: "12px" }}>
                        Tiết {period}
                      </td>
                      {stemRooms.map((room) => {
                        const booking = scheduleGrid[period][room.id];
                        if (!booking) {
                          return (
                            <td key={room.id} className="px-3 py-2 text-center">
                              <span
                                className="inline-block px-2 py-1 rounded bg-secondary/40 text-muted-foreground/50"
                                style={{ fontSize: "10.5px" }}
                              >
                                Trống
                              </span>
                            </td>
                          );
                        }
                        const isApproved = booking.status === "approved";
                        return (
                          <td key={room.id} className="px-3 py-2">
                            <div
                              className="rounded-lg px-2 py-1.5"
                              style={{
                                backgroundColor: isApproved ? "#2563eb15" : "#f59e0b15",
                                borderLeft: `3px solid ${isApproved ? "#2563eb" : "#f59e0b"}`,
                              }}
                            >
                              <p
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  color: isApproved ? "#2563eb" : "#f59e0b",
                                }}
                              >
                                {booking.className}
                              </p>
                              <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
                                {booking.teacherName.split(" ").slice(-1)[0]}
                              </p>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="px-4 py-3 border-t border-border flex items-center gap-4">
              <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Chú thích:</span>
              {[
                { color: "#2563eb", label: "Đã đặt (đã duyệt)" },
                { color: "#f59e0b", label: "Đang chờ duyệt" },
              ].map(({ color, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color + "40", border: `2px solid ${color}` }} />
                  <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{label}</span>
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-secondary/40" />
                <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Trống</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomBooking;
