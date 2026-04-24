import React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  BookOpen,
  Video,
  Wrench,
  FileText,
  AlertTriangle,
  X,
  List,
  Grid3X3,
  Columns3,
  User,
} from "lucide-react";
import { mockTrainingEvents } from "./mock-data";
import type { TrainingEvent } from "./mock-data";
import { useAuth } from "./AuthContext";

// ════════════════════════════════════════════════════════════
// CONFIG
// ════════════════════════════════════════════════════════════

const typeConfig: Record<TrainingEvent["type"], { label: string; icon: typeof BookOpen; color: string }> = {
  class: { label: "Lớp học", icon: BookOpen, color: "#990803" },
  exam: { label: "Kỳ thi", icon: FileText, color: "#f39c12" },
  workshop: { label: "Workshop", icon: Wrench, color: "#27ae60" },
  webinar: { label: "Webinar", icon: Video, color: "#2e86de" },
  deadline: { label: "Deadline", icon: AlertTriangle, color: "#e74c3c" },
};

const DAYS_VI_FULL = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const MONTHS_VI = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

// Additional events for richer weekly view
const EXTRA_WEEKLY_EVENTS: TrainingEvent[] = [
  { id: "EW01", title: "Digital Transformation cho Lãnh đạo", description: "Chuyển đổi số trong quản trị doanh nghiệp hiện đại", courseId: null, type: "class", startDate: "2026-03-09", endDate: "2026-03-09", startTime: "08:30", endTime: "11:30", location: "Hội trường Geleximco - Tầng 12", instructor: "PGS.TS Nguyễn Văn Hùng", maxParticipants: 60, currentParticipants: 45, subsidiary: "Tập đoàn Geleximco", color: "#ef4444" },
  { id: "EW02", title: "An toàn Lao động nâng cao", description: "Đào tạo chuyên sâu an toàn cho khối sản xuất", courseId: null, type: "workshop", startDate: "2026-03-10", endDate: "2026-03-10", startTime: "08:00", endTime: "16:30", location: "Phòng An toàn - NM Xi măng", instructor: "Lê Quốc Vương", maxParticipants: 40, currentParticipants: 15, subsidiary: "Xi măng Thăng Long", color: "#ef4444" },
  { id: "EW03", title: "PMP Exam Prep — Module 5", description: "Quản lý phạm vi & lịch trình dự án", courseId: null, type: "class", startDate: "2026-03-10", endDate: "2026-03-10", startTime: "09:00", endTime: "12:00", location: "Phòng Đào tạo B3 - Tầng 6", instructor: "Phạm Đức Mạnh", maxParticipants: 80, currentParticipants: 65, subsidiary: "BĐS Geleximco - KĐT Lê Trọng Tấn", color: "#8b5cf6" },
  { id: "EW04", title: "Leadership Essentials", description: "Kỹ năng lãnh đạo cốt lõi cho quản lý mới", courseId: null, type: "class", startDate: "2026-03-11", endDate: "2026-03-11", startTime: "08:30", endTime: "10:30", location: "Phòng họp VIP - Tầng 10", instructor: "TS. Đỗ Thanh Hương", maxParticipants: 120, currentParticipants: 95, subsidiary: "Tập đoàn Geleximco", color: "#22c55e" },
  { id: "EW05", title: "Data Analytics cho HR", description: "Phân tích dữ liệu nhân sự bằng Power BI", courseId: null, type: "webinar", startDate: "2026-03-11", endDate: "2026-03-11", startTime: "09:00", endTime: "11:00", location: "Zoom Room — Meeting ID: 845...", instructor: "Vũ Thị Phương", maxParticipants: 40, currentParticipants: 20, subsidiary: "Tập đoàn Geleximco", color: "#3b82f6" },
  { id: "EW06", title: "Code of Conduct Refresher", description: "Cập nhật Bộ quy tắc ứng xử Tập đoàn 2026", courseId: null, type: "class", startDate: "2026-03-12", endDate: "2026-03-12", startTime: "08:30", endTime: "10:00", location: "Hội trường G... - Tầng 3", instructor: "Phó TGĐ Nhân sự", maxParticipants: 200, currentParticipants: 150, subsidiary: "Tập đoàn Geleximco", color: "#6b7280" },
  { id: "EW07", title: "HRBP Module 2 — Strategic HR", description: "Vai trò HR Business Partner chiến lược", courseId: null, type: "class", startDate: "2026-03-12", endDate: "2026-03-12", startTime: "09:00", endTime: "12:00", location: "Phòng Đào tạo A2 - Tầng 8", instructor: "Lý Văn Minh", maxParticipants: 35, currentParticipants: 30, subsidiary: "Tập đoàn Geleximco", color: "#c8a84e" },
  { id: "EW08", title: "Dịch vụ Khách hàng Xuất sắc", description: "Nâng cao trải nghiệm khách hàng tại ABBank", courseId: null, type: "class", startDate: "2026-03-13", endDate: "2026-03-13", startTime: "09:00", endTime: "12:00", location: "Phòng ĐT Hội sở ABBank", instructor: "Trần Thị Bình", maxParticipants: 25, currentParticipants: 22, subsidiary: "Ngân hàng TMCP An Bình (ABBank)", color: "#22c55e" },
  { id: "EW09", title: "PDPA — Bảo vệ Dữ liệu Cá nhân", description: "Tuân thủ quy định bảo vệ dữ liệu cá nhân", courseId: null, type: "webinar", startDate: "2026-03-13", endDate: "2026-03-13", startTime: "09:00", endTime: "11:00", location: "Zoom Room", instructor: "Ngô Trung Kiên", maxParticipants: 80, currentParticipants: 62, subsidiary: "Tập đoàn Geleximco", color: "#8b5cf6" },
  { id: "EW10", title: "An toàn Khai thác Mỏ — Nâng cao", description: "Quy trình an toàn khai thác mỏ nâng cao", courseId: null, type: "workshop", startDate: "2026-03-13", endDate: "2026-03-13", startTime: "07:30", endTime: "11:30", location: "Phòng ĐT Mỏ - Quảng Ninh", instructor: "KS. Lê Hoàng", maxParticipants: 30, currentParticipants: 28, subsidiary: "Khoáng sản Geleximco", color: "#ef4444" },
  { id: "EW11", title: "AML/CFT Compliance Training", description: "Đào tạo phòng chống rửa tiền cho ABBank", courseId: null, type: "class", startDate: "2026-03-09", endDate: "2026-03-09", startTime: "14:00", endTime: "17:00", location: "Phòng ĐT ABBank - Tầng 5", instructor: "TS. Trần Thị Mai", maxParticipants: 60, currentParticipants: 55, subsidiary: "Ngân hàng TMCP An Bình (ABBank)", color: "#3b82f6" },
  { id: "EW12", title: "IT Security Awareness", description: "Nâng cao nhận thức bảo mật thông tin", courseId: null, type: "webinar", startDate: "2026-03-11", endDate: "2026-03-11", startTime: "14:00", endTime: "16:30", location: "Lab CNTT - Tầng 7", instructor: "Ngô Trung Kiên", maxParticipants: 30, currentParticipants: 28, subsidiary: "Tập đoàn Geleximco", color: "#6b7280" },
  { id: "EW13", title: "ESG & Phát triển Bền vững", description: "Chiến lược ESG cho doanh nghiệp Việt Nam", courseId: null, type: "class", startDate: "2026-03-12", endDate: "2026-03-12", startTime: "14:00", endTime: "16:00", location: "MS Teams Room — HN01", instructor: "TS. Hoàng Đức Em", maxParticipants: 300, currentParticipants: 180, subsidiary: "Tập đoàn Geleximco", color: "#22c55e" },
  { id: "EW14", title: "AML Advanced — Case Study", description: "Phân tích tình huống rửa tiền thực tế", courseId: null, type: "class", startDate: "2026-03-14", endDate: "2026-03-14", startTime: "13:30", endTime: "16:30", location: "Phòng ĐT ABBank - Tầng 5", instructor: "TS. Trần Thị Mai", maxParticipants: 50, currentParticipants: 42, subsidiary: "Ngân hàng TMCP An Bình (ABBank)", color: "#990803" },
];

const ALL_EVENTS = [...mockTrainingEvents, ...EXTRA_WEEKLY_EVENTS];

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }

function getWeekDates(baseDate: Date): Date[] {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return dd;
  });
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getEventsForDate(date: string): TrainingEvent[] {
  return ALL_EVENTS.filter(ev => {
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    const d = new Date(date);
    return d >= new Date(start.toDateString()) && d <= new Date(end.toDateString());
  });
}

// Refined event style palette — vibrant border, subtle gradient bg
interface EventStyle {
  bgFrom: string;
  bgTo: string;
  border: string;
  text: string;
  subText: string;
  badge: string;
  badgeTxt: string;
  iconBg: string;
}

const EVENT_STYLES: Record<string, EventStyle> = {
  "#990803": { bgFrom: "#fef2f2", bgTo: "#fee2e2", border: "#990803", text: "#7f1d1d", subText: "#991b1b", badge: "#fee2e2", badgeTxt: "#990803", iconBg: "#fecaca" },
  "#ef4444": { bgFrom: "#fef2f2", bgTo: "#fecaca", border: "#ef4444", text: "#7f1d1d", subText: "#b91c1c", badge: "#fecaca", badgeTxt: "#991b1b", iconBg: "#fca5a5" },
  "#e74c3c": { bgFrom: "#fef2f2", bgTo: "#fecaca", border: "#e74c3c", text: "#7f1d1d", subText: "#b91c1c", badge: "#fecaca", badgeTxt: "#991b1b", iconBg: "#fca5a5" },
  "#f39c12": { bgFrom: "#fffbeb", bgTo: "#fef3c7", border: "#f39c12", text: "#78350f", subText: "#92400e", badge: "#fef3c7", badgeTxt: "#92400e", iconBg: "#fde68a" },
  "#c8a84e": { bgFrom: "#fffbeb", bgTo: "#fef3c7", border: "#c8a84e", text: "#78350f", subText: "#92400e", badge: "#fef3c7", badgeTxt: "#78350f", iconBg: "#fde68a" },
  "#27ae60": { bgFrom: "#f0fdf4", bgTo: "#dcfce7", border: "#27ae60", text: "#14532d", subText: "#166534", badge: "#dcfce7", badgeTxt: "#166534", iconBg: "#bbf7d0" },
  "#22c55e": { bgFrom: "#f0fdf4", bgTo: "#dcfce7", border: "#22c55e", text: "#14532d", subText: "#166534", badge: "#dcfce7", badgeTxt: "#166534", iconBg: "#bbf7d0" },
  "#2e86de": { bgFrom: "#eff6ff", bgTo: "#dbeafe", border: "#2e86de", text: "#1e3a8a", subText: "#1e40af", badge: "#dbeafe", badgeTxt: "#1e40af", iconBg: "#bfdbfe" },
  "#3b82f6": { bgFrom: "#eff6ff", bgTo: "#dbeafe", border: "#3b82f6", text: "#1e3a8a", subText: "#1e40af", badge: "#dbeafe", badgeTxt: "#1e40af", iconBg: "#93c5fd" },
  "#8b5cf6": { bgFrom: "#f5f3ff", bgTo: "#ede9fe", border: "#8b5cf6", text: "#4c1d95", subText: "#5b21b6", badge: "#ede9fe", badgeTxt: "#6d28d9", iconBg: "#c4b5fd" },
  "#8e44ad": { bgFrom: "#faf5ff", bgTo: "#f3e8ff", border: "#8e44ad", text: "#581c87", subText: "#6b21a8", badge: "#f3e8ff", badgeTxt: "#7c3aed", iconBg: "#d8b4fe" },
  "#6b7280": { bgFrom: "#f9fafb", bgTo: "#f3f4f6", border: "#6b7280", text: "#1f2937", subText: "#374151", badge: "#e5e7eb", badgeTxt: "#4b5563", iconBg: "#d1d5db" },
};

function getEventStyle(color: string): EventStyle {
  return EVENT_STYLES[color] || { bgFrom: "#f9fafb", bgTo: "#f3f4f6", border: color, text: "#374151", subText: "#6b7280", badge: "#e5e7eb", badgeTxt: "#4b5563", iconBg: "#d1d5db" };
}

// ════════════════════════════════════════════════════════════
// WEEKLY TIME GRID VIEW — REDESIGNED
// ════════════════════════════════════════════════════════════

const HOUR_START = 7;
const HOUR_END = 18;
const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
const HOUR_HEIGHT = 90; // taller for better readability
const COL_WIDTH_CLASS = "minmax(0, 1fr)";

function WeeklyTimeGrid({
  weekDates,
  todayStr,
  onEventClick,
}: {
  weekDates: Date[];
  todayStr: string;
  onEventClick: (ev: TrainingEvent) => void;
}) {
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const currentHour = 10;
  const currentMinute = 30;
  const currentTimeY = ((currentHour - HOUR_START) + currentMinute / 60) * HOUR_HEIGHT;
  const todayColIndex = weekDates.findIndex(d => formatDateStr(d) === todayStr);

  React.useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollTop = HOUR_HEIGHT * 0.5;
    }
  }, []);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      {/* ─── Day Headers ─── */}
      <div
        className="grid border-b-2 border-border/60 bg-gradient-to-b from-secondary/40 to-secondary/10"
        style={{ gridTemplateColumns: `64px repeat(7, 1fr)` }}
      >
        {/* time col spacer */}
        <div className="border-r border-border/40 flex items-end justify-center pb-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground/40" />
        </div>
        {weekDates.map((d, i) => {
          const dateStr = formatDateStr(d);
          const isToday = dateStr === todayStr;
          const dayOfWeek = d.getDay();
          const dayLabel = DAYS_VI_FULL[dayOfWeek];
          const dayNum = d.getDate();
          const eventsCount = getEventsForDate(dateStr).filter(e => e.type !== "deadline").length;
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          return (
            <div
              key={i}
              className={`py-3.5 px-1 text-center border-r border-border/30 last:border-r-0 relative transition-all ${isToday ? "bg-[#990803]/[0.04]" : ""}`}
            >
              {/* Today accent line */}
              {isToday && <div className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-[#990803]" />}
              <p
                className={`${isToday ? "text-[#990803]" : isWeekend ? "text-muted-foreground/60" : "text-muted-foreground"}`}
                style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.02em" }}
              >
                {dayLabel.toUpperCase()}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span
                  className={`inline-flex items-center justify-center ${isToday ? "text-white" : "text-foreground"}`}
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    ...(isToday
                      ? { background: "#990803", borderRadius: "10px", width: "36px", height: "36px" }
                      : {}),
                  }}
                >
                  {dayNum}
                </span>
              </div>
              {eventsCount > 0 && (
                <div className="mt-1 flex justify-center">
                  <span
                    className={`px-1.5 py-0.5 rounded-full ${isToday ? "bg-[#990803]/10 text-[#990803]" : "bg-secondary text-muted-foreground"}`}
                    style={{ fontSize: "8px", fontWeight: 700 }}
                  >
                    {eventsCount} sự kiện
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Time Grid Body ─── */}
      <div
        ref={gridRef}
        className="overflow-y-auto overflow-x-hidden relative"
        style={{ maxHeight: "calc(100vh - 320px)" }}
      >
        <div
          className="grid relative"
          style={{ gridTemplateColumns: `64px repeat(7, 1fr)`, minHeight: HOURS.length * HOUR_HEIGHT }}
        >
          {/* Time labels column */}
          <div className="relative border-r border-border/30 bg-secondary/10">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute w-full flex items-start justify-end pr-3"
                style={{ top: (hour - HOUR_START) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
              >
                <span
                  className="text-muted-foreground/70 -mt-2 select-none"
                  style={{ fontSize: "11px", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                >
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map((d, colIdx) => {
            const dateStr = formatDateStr(d);
            const isToday = dateStr === todayStr;
            const dayOfWeek = d.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const dayEvents = getEventsForDate(dateStr).filter(ev => ev.type !== "deadline");

            // Overlap detection
            const positioned = dayEvents
              .map(ev => ({ ev, startMin: timeToMinutes(ev.startTime), endMin: timeToMinutes(ev.endTime) }))
              .sort((a, b) => a.startMin - b.startMin || (b.endMin - b.startMin) - (a.endMin - a.startMin));

            const columns: { ev: TrainingEvent; col: number; totalCols: number; startMin: number; endMin: number }[] = [];
            const active: typeof positioned = [];

            for (const item of positioned) {
              const stillActive = active.filter(a => a.endMin > item.startMin);
              active.length = 0;
              active.push(...stillActive, item);
              const usedCols = new Set(columns.filter(c => c.endMin > item.startMin && c.startMin < item.endMin).map(c => c.col));
              let col = 0;
              while (usedCols.has(col)) col++;
              columns.push({ ev: item.ev, col, totalCols: 1, startMin: item.startMin, endMin: item.endMin });
            }
            for (const c of columns) {
              const overlapping = columns.filter(o => o.startMin < c.endMin && o.endMin > c.startMin);
              const maxCol = Math.max(...overlapping.map(o => o.col)) + 1;
              for (const o of overlapping) o.totalCols = Math.max(o.totalCols, maxCol);
            }

            return (
              <div
                key={colIdx}
                className={`relative border-r border-border/20 last:border-r-0 ${isToday ? "bg-[#990803]/[0.015]" : isWeekend ? "bg-secondary/20" : ""}`}
              >
                {/* Hour grid lines */}
                {HOURS.map(hour => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-border/30"
                    style={{ top: (hour - HOUR_START) * HOUR_HEIGHT }}
                  />
                ))}
                {/* Half hour dashed lines */}
                {HOURS.map(hour => (
                  <div
                    key={`hh-${hour}`}
                    className="absolute w-full"
                    style={{
                      top: (hour - HOUR_START) * HOUR_HEIGHT + HOUR_HEIGHT / 2,
                      borderTop: "1px dashed rgba(0,0,0,0.04)",
                    }}
                  />
                ))}

                {/* ─── Event Cards (Staggered Overlap) ─── */}
                {columns.map(({ ev, col, totalCols }) => {
                  const startMin = timeToMinutes(ev.startTime);
                  const endMin = timeToMinutes(ev.endTime);
                  const top = ((startMin - HOUR_START * 60) / 60) * HOUR_HEIGHT;
                  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 36);
                  const es = getEventStyle(ev.color);

                  // Staggered overlap: each card stays wide, shifts right by indent
                  const isOverlapping = totalCols > 1;
                  const INDENT_PX = 26;
                  const leftPx = isOverlapping ? col * INDENT_PX + 3 : 3;
                  const rightPx = isOverlapping ? 4 + (totalCols - 1 - col) * 2 : 4;

                  const isTall = height >= 130;
                  const isMedium = height >= 70 && height < 130;
                  const isCompact = height >= 44 && height < 70;
                  const isTiny = height < 44;
                  const isHovered = hoveredId === ev.id;
                  const EvIcon = typeConfig[ev.type]?.icon || BookOpen;

                  return (
                    <div
                      key={ev.id}
                      className="absolute cursor-pointer transition-all duration-200"
                      style={{
                        top: top + 2,
                        height: height - 4,
                        left: leftPx,
                        right: rightPx,
                        zIndex: isHovered ? 50 : 10 + col,
                        transform: isHovered ? "translateY(-1px)" : undefined,
                        filter: isHovered
                          ? "drop-shadow(0 10px 28px rgba(0,0,0,0.20))"
                          : isOverlapping
                          ? "drop-shadow(0 2px 8px rgba(0,0,0,0.12))"
                          : "drop-shadow(0 1px 4px rgba(0,0,0,0.06))",
                      }}
                      onMouseEnter={() => setHoveredId(ev.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => onEventClick(ev)}
                    >
                      <div
                        className="h-full rounded-lg overflow-hidden relative"
                        style={{
                          background: `linear-gradient(145deg, ${es.bgFrom} 0%, ${es.bgTo} 100%)`,
                          borderLeft: `4px solid ${es.border}`,
                          boxShadow: isOverlapping
                            ? `inset 0 0 0 1px ${es.border}18, 0 1px 2px ${es.border}10`
                            : undefined,
                        }}
                      >
                        {/* Top accent */}
                        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${es.border}50, transparent 70%)` }} />

                        <div className="px-2 py-1.5 h-full flex flex-col overflow-hidden">
                          {/* Title */}
                          <div className="flex items-start gap-1.5 min-w-0">
                            {!isTiny && (
                              <div
                                className="rounded flex items-center justify-center shrink-0 mt-px"
                                style={{ background: es.iconBg, width: 17, height: 17 }}
                              >
                                <EvIcon className="w-2.5 h-2.5" style={{ color: es.border }} />
                              </div>
                            )}
                            <p
                              className={isTiny || isCompact ? "truncate" : "line-clamp-2"}
                              style={{
                                fontSize: isTiny ? "9px" : "11px",
                                fontWeight: 700,
                                color: es.text,
                                lineHeight: 1.3,
                              }}
                            >
                              {ev.title}
                            </p>
                          </div>

                          {/* Time */}
                          {!isTiny && (
                            <p className="truncate mt-0.5" style={{ fontSize: "9px", fontWeight: 500, color: es.subText, opacity: 0.65 }}>
                              {ev.startTime}–{ev.endTime}
                              {!isCompact && ev.location ? ` · ${ev.location.length > 18 ? ev.location.slice(0, 18) + "…" : ev.location}` : ""}
                            </p>
                          )}

                          {/* Spacer */}
                          {(isTall || isMedium) && <div className="flex-1 min-h-1" />}

                          {/* Bottom info */}
                          {(isTall || isMedium) && (
                            <div className="flex items-center justify-between gap-1">
                              <p className="truncate" style={{ fontSize: "9px", fontWeight: 500, color: es.subText, opacity: 0.55 }}>
                                {ev.instructor}
                              </p>
                              {ev.maxParticipants > 0 && (
                                <span
                                  className="shrink-0 px-1.5 py-px rounded-full"
                                  style={{ background: es.badge, fontSize: "8px", fontWeight: 700, color: es.badgeTxt }}
                                >
                                  {ev.currentParticipants}/{ev.maxParticipants}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Tall: description */}
                          {isTall && (
                            <p className="truncate mt-0.5" style={{ fontSize: "8.5px", color: es.subText, opacity: 0.4, fontStyle: "italic" }}>
                              {ev.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* ─── Current Time Indicator ─── */}
                {isToday && (
                  <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top: currentTimeY }}>
                    <div className="relative flex items-center">
                      <div
                        className="w-3 h-3 rounded-full shrink-0 -ml-1.5 shadow-md"
                        style={{ background: "#990803", boxShadow: "0 0 0 3px rgba(153,8,3,0.2)" }}
                      />
                      <div className="flex-1 h-[2px]" style={{ background: "linear-gradient(90deg, #990803 0%, #990803 70%, transparent 100%)" }} />
                    </div>
                    <span
                      className="absolute -top-1 -left-1 px-1 py-0.5 rounded text-white select-none"
                      style={{ fontSize: "7px", fontWeight: 700, background: "#990803", transform: "translateY(-100%)" }}
                    >
                      {String(currentHour).padStart(2, "0")}:{String(currentMinute).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════

type ViewMode = "week" | "month" | "list";

export function TrainingCalendar() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = React.useState<ViewMode>("week");
  const [currentYear, setCurrentYear] = React.useState(2026);
  const [currentMonth, setCurrentMonth] = React.useState(2);
  const [weekBaseDate, setWeekBaseDate] = React.useState(new Date(2026, 2, 12));
  const [selectedDate, setSelectedDate] = React.useState<string | null>("2026-03-13");
  const [selectedEvent, setSelectedEvent] = React.useState<TrainingEvent | null>(null);
  const [filterType, setFilterType] = React.useState("all");

  const todayStr = "2026-03-13";

  const weekDates = React.useMemo(() => getWeekDates(weekBaseDate), [weekBaseDate]);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const prevWeek = () => { const d = new Date(weekBaseDate); d.setDate(d.getDate() - 7); setWeekBaseDate(d); };
  const nextWeek = () => { const d = new Date(weekBaseDate); d.setDate(d.getDate() + 7); setWeekBaseDate(d); };
  const goToday = () => setWeekBaseDate(new Date(2026, 2, 13));

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); };

  const thisWeekEvents = weekDates.flatMap(d => getEventsForDate(formatDateStr(d)));
  const uniqueWeekEvents = [...new Map(thisWeekEvents.map(e => [e.id, e])).values()];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const formatDate = (day: number) => `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const filteredEvents = React.useMemo(() => {
    let events: TrainingEvent[] = viewMode === "week"
      ? uniqueWeekEvents
      : ALL_EVENTS.filter(ev => { const d = new Date(ev.startDate); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; });
    if (filterType !== "all") events = events.filter(ev => ev.type === filterType);
    return events.sort((a, b) => new Date(a.startDate + "T" + a.startTime).getTime() - new Date(b.startDate + "T" + b.startTime).getTime());
  }, [viewMode, filterType, currentMonth, currentYear, weekBaseDate]);

  const selectedDateEvents = selectedDate
    ? getEventsForDate(selectedDate).filter(ev => filterType === "all" || ev.type === filterType)
    : [];

  const weekHeaderText = `${String(weekStart.getDate()).padStart(2, "0")}/${String(weekStart.getMonth() + 1).padStart(2, "0")} — ${String(weekEnd.getDate()).padStart(2, "0")}/${String(weekEnd.getMonth() + 1).padStart(2, "0")}/${weekEnd.getFullYear()}`;

  return (
    <div className="space-y-5">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>Lịch Đào tạo</h1>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
            Quản lý lịch trình đào tạo, thi và sự kiện Tập đoàn Geleximco
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-secondary/50 rounded-xl p-0.5 border border-border/30">
            {([
              { id: "week" as const, icon: Columns3, label: "Tuần" },
              { id: "month" as const, icon: Grid3X3, label: "Tháng" },
              { id: "list" as const, icon: List, label: "Danh sách" },
            ]).map(v => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${viewMode === v.id ? "bg-[#990803] text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"}`}
                style={{ fontSize: "12px", fontWeight: viewMode === v.id ? 600 : 400 }}
              >
                <v.icon className="w-3.5 h-3.5" /> {v.label}
              </button>
            ))}
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2.5 bg-input-background rounded-xl border-0 text-foreground cursor-pointer"
            style={{ fontSize: "12px" }}
          >
            <option value="all">Tất cả loại</option>
            <option value="class">Lớp học</option>
            <option value="exam">Kỳ thi</option>
            <option value="workshop">Workshop</option>
            <option value="webinar">Webinar</option>
            <option value="deadline">Deadline</option>
          </select>
        </div>
      </div>

      {/* ─── Quick Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Sự kiện tuần này", value: uniqueWeekEvents.length, icon: CalendarIcon, color: "#990803" },
          { label: "Lớp học", value: uniqueWeekEvents.filter(e => e.type === "class").length, icon: BookOpen, color: "#2e86de" },
          { label: "Workshop", value: uniqueWeekEvents.filter(e => e.type === "workshop").length, icon: Wrench, color: "#27ae60" },
          { label: "Kỳ thi", value: uniqueWeekEvents.filter(e => e.type === "exam").length, icon: FileText, color: "#f39c12" },
          { label: "Webinar", value: uniqueWeekEvents.filter(e => e.type === "webinar" || e.type === "deadline").length, icon: Video, color: "#8b5cf6" },
        ].map(stat => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-3.5 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}12` }}>
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>{stat.value}</p>
                <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ WEEK VIEW ═══ */}
      {viewMode === "week" && (
        <div className="space-y-4">
          {/* Navigation bar */}
          <div className="flex items-center justify-between bg-card rounded-xl border border-border px-4 py-2.5">
            <div className="flex items-center gap-1">
              <button onClick={prevWeek} className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <h3 className="text-foreground px-3" style={{ fontSize: "15px", fontWeight: 600 }}>
                Tuần {weekHeaderText}
              </h3>
              <button onClick={nextWeek} className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={goToday}
                className="ml-3 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
                style={{ fontSize: "11px", fontWeight: 600 }}
              >
                Hôm nay
              </button>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {Object.entries(typeConfig).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setFilterType(filterType === key ? "all" : key)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all cursor-pointer ${filterType === key ? "ring-1 ring-current" : "opacity-70 hover:opacity-100"}`}
                  style={{ fontSize: "10px", color: val.color }}
                >
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: val.color }} />
                  <span style={{ fontWeight: 500 }}>{val.label}</span>
                </button>
              ))}
            </div>
          </div>

          <WeeklyTimeGrid weekDates={weekDates} todayStr={todayStr} onEventClick={setSelectedEvent} />
        </div>
      )}

      {/* ═══ MONTH VIEW ═══ */}
      {viewMode === "month" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
              <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>{MONTHS_VI[currentMonth]} {currentYear}</h3>
              <button onClick={nextMonth} className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(d => (
                <div key={d} className="text-center text-muted-foreground py-2" style={{ fontSize: "12px", fontWeight: 500 }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = formatDate(day);
                const events = getEventsForDate(dateStr);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square p-1 rounded-lg transition-all relative flex flex-col items-center cursor-pointer ${isSelected ? "bg-[#990803] text-white ring-2 ring-[#990803]/30" : isToday ? "bg-[#c8a84e]/20" : events.length > 0 ? "hover:bg-secondary/80 text-foreground" : "hover:bg-secondary/50 text-muted-foreground"}`}
                  >
                    <span className={isToday && !isSelected ? "w-6 h-6 rounded-full bg-[#c8a84e] text-[#3a1200] flex items-center justify-center" : ""} style={{ fontSize: "13px", fontWeight: isToday ? 600 : 400 }}>{day}</span>
                    {events.length > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {events.slice(0, 3).map(ev => <span key={ev.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? "white" : ev.color }} />)}
                        {events.length > 3 && <span className="text-[8px]" style={{ color: isSelected ? "white" : "#6b7280" }}>+{events.length - 3}</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border flex-wrap">
              {Object.entries(typeConfig).map(([key, val]) => (
                <span key={key} className="flex items-center gap-1.5" style={{ fontSize: "11px" }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: val.color }} />{val.label}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>
              {selectedDate ? new Date(selectedDate).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Chọn ngày để xem"}
            </h4>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map(event => {
                  const config = typeConfig[event.type];
                  const EventIcon = config.icon;
                  const es = getEventStyle(event.color);
                  return (
                    <div key={event.id} className="p-3.5 rounded-xl cursor-pointer hover:shadow-md transition-shadow" style={{ background: `linear-gradient(135deg, ${es.bgFrom}, ${es.bgTo})`, borderLeft: `4px solid ${es.border}` }} onClick={() => setSelectedEvent(event)}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ fontSize: "9px", fontWeight: 600, color: es.text, background: es.badge }}><EventIcon className="w-3 h-3" /> {config.label}</span>
                        <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{event.startTime} - {event.endTime}</span>
                      </div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: es.text }}>{event.title}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "10px" }}><MapPin className="w-3 h-3" /> {event.location.length > 25 ? event.location.slice(0, 25) + "..." : event.location}</span>
                        {event.maxParticipants > 0 && <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "10px" }}><Users className="w-3 h-3" /> {event.currentParticipants}/{event.maxParticipants}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8"><CalendarIcon className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" /><p className="text-muted-foreground" style={{ fontSize: "13px" }}>Không có sự kiện</p></div>
            )}
          </div>
        </div>
      )}

      {/* ═══ LIST VIEW ═══ */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => {
              const config = typeConfig[event.type];
              const EventIcon = config.icon;
              const es = getEventStyle(event.color);
              const evDate = new Date(event.startDate);
              return (
                <div key={event.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEvent(event)}>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${es.bgFrom}, ${es.bgTo})` }}>
                      <span style={{ fontSize: "18px", fontWeight: 700, color: es.text }}>{evDate.getDate()}</span>
                      <span style={{ fontSize: "9px", color: es.subText, opacity: 0.7 }}>T{evDate.getMonth() + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ fontSize: "10px", fontWeight: 600, color: es.text, background: es.badge }}><EventIcon className="w-3 h-3" /> {config.label}</span>
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{event.subsidiary}</span>
                      </div>
                      <h4 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{event.title}</h4>
                      <p className="text-muted-foreground mt-0.5 line-clamp-1" style={{ fontSize: "12px" }}>{event.description}</p>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}><Clock className="w-3 h-3" /> {event.startTime} - {event.endTime}</span>
                        <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}><MapPin className="w-3 h-3" /> {event.location.length > 35 ? event.location.slice(0, 35) + "..." : event.location}</span>
                        {event.maxParticipants > 0 && <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}><Users className="w-3 h-3" /> {event.currentParticipants}/{event.maxParticipants}</span>}
                        <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}><User className="w-3 h-3" /> {event.instructor}</span>
                      </div>
                    </div>
                    {event.maxParticipants > 0 && event.currentParticipants < event.maxParticipants && (
                      <button className="px-3.5 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors shrink-0 cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }} onClick={e => { e.stopPropagation(); import("sonner").then(m => m.toast.success("Đã đăng ký tham gia!")); }}>Đăng ký</button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16"><CalendarIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground" style={{ fontSize: "14px" }}>Không có sự kiện phù hợp</p></div>
          )}
        </div>
      )}

      {/* ═══ EVENT DETAIL MODAL ═══ */}
      {selectedEvent && (() => {
        const es = getEventStyle(selectedEvent.color);
        const EvIcon = typeConfig[selectedEvent.type]?.icon || BookOpen;
        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
            <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="relative p-6 text-white overflow-hidden" style={{ background: `linear-gradient(135deg, ${selectedEvent.color}, ${selectedEvent.color}cc)` }}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg" style={{ fontSize: "11px", fontWeight: 600 }}>
                      <EvIcon className="w-3.5 h-3.5" /> {typeConfig[selectedEvent.type].label}
                    </span>
                    <button onClick={() => setSelectedEvent(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
                  </div>
                  <h3 className="text-white" style={{ fontSize: "18px", fontWeight: 700 }}>{selectedEvent.title}</h3>
                  <p className="text-white/75 mt-1.5" style={{ fontSize: "13px" }}>{selectedEvent.description}</p>
                </div>
              </div>
              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: CalendarIcon, label: "Ngày", value: new Date(selectedEvent.startDate).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" }) },
                    { icon: Clock, label: "Thời gian", value: `${selectedEvent.startTime} – ${selectedEvent.endTime}` },
                    { icon: MapPin, label: "Địa điểm", value: selectedEvent.location },
                    { icon: User, label: "Giảng viên", value: selectedEvent.instructor },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0 mt-0.5"><item.icon className="w-4 h-4 text-muted-foreground" /></div>
                      <div><p className="text-muted-foreground" style={{ fontSize: "10px" }}>{item.label}</p><p className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{item.value}</p></div>
                    </div>
                  ))}
                </div>
                {selectedEvent.maxParticipants > 0 && (
                  <div className="bg-secondary/30 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Đã đăng ký</span>
                      <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{selectedEvent.currentParticipants}/{selectedEvent.maxParticipants} ({Math.round((selectedEvent.currentParticipants / selectedEvent.maxParticipants) * 100)}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${(selectedEvent.currentParticipants / selectedEvent.maxParticipants) * 100}%`, backgroundColor: selectedEvent.color }} /></div>
                  </div>
                )}
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={() => setSelectedEvent(null)} className="flex-1 px-4 py-2.5 border border-border rounded-xl hover:bg-secondary transition-colors cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>Đóng</button>
                  {selectedEvent.maxParticipants > 0 && selectedEvent.currentParticipants < selectedEvent.maxParticipants && (
                    <button className="flex-1 px-4 py-2.5 text-white rounded-xl hover:opacity-90 transition-colors cursor-pointer" style={{ fontSize: "13px", fontWeight: 600, backgroundColor: selectedEvent.color }} onClick={() => { import("sonner").then(m => m.toast.success(`Đã đăng ký: ${selectedEvent.title}`)); setSelectedEvent(null); }}>
                      Đăng ký tham gia
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}