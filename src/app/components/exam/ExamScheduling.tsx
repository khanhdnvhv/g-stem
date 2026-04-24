import { useState, useMemo } from "react";
import {
  Calendar, Clock, Users, Building2, Search, Filter, Plus, Edit3, Trash2,
  Bell, BellRing, Send, CheckCircle2, XCircle, AlertCircle, ChevronDown,
  ChevronRight, ChevronLeft, MapPin, Monitor, Shield, Eye, Copy,
  MoreVertical, ArrowLeft, Download, Sparkles, Zap, Globe,
  CalendarDays, CalendarCheck, CalendarClock, CalendarX,
  Repeat, Target, BookOpen, ClipboardCheck, Mail, MessageSquare, Play,
} from "lucide-react";
import { MOCK_EXAMS } from "./types";
import { SUBSIDIARIES, DEPARTMENTS } from "../mock-data";

// ── Types ──
interface ExamSchedule {
  id: string;
  examId: string;
  examTitle: string;
  examType: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  room: string;
  capacity: number;
  enrolled: number;
  subsidiaries: string[];
  departments: string[];
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "postponed";
  proctoringEnabled: boolean;
  notificationsSent: boolean;
  reminderDays: number[];
  createdBy: string;
  notes: string;
  isRecurring: boolean;
  recurringPattern?: string;
}

interface Notification {
  id: string;
  scheduleId: string;
  type: "created" | "reminder" | "change" | "cancellation" | "start";
  sentAt: string;
  recipients: number;
  channel: "email" | "sms" | "push" | "all";
  status: "sent" | "pending" | "failed";
}

const STATUS_CONFIG = {
  scheduled: { label: "Đã lên lịch", color: "#3b82f6", bg: "#3b82f615", icon: CalendarClock },
  in_progress: { label: "Đang diễn ra", color: "#22c55e", bg: "#22c55e15", icon: CalendarCheck },
  completed: { label: "Hoàn thành", color: "#6b7280", bg: "#6b728015", icon: CalendarCheck },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "#ef444415", icon: CalendarX },
  postponed: { label: "Hoãn", color: "#f59e0b", bg: "#f59e0b15", icon: CalendarClock },
};

// ── Mock schedules ──
function generateMockSchedules(): ExamSchedule[] {
  const rooms = [
    "Phòng thi A1 - Tầng 5", "Phòng thi B2 - Tầng 3", "Hội trường chính",
    "Online - Zoom Room 1", "Online - MS Teams", "Phòng máy tính C1 - Tầng 7",
    "Phòng đào tạo D1", "Online - LMS Platform", "Phòng hội thảo E2 - Tầng 2",
  ];
  const statuses: ExamSchedule["status"][] = ["scheduled", "scheduled", "scheduled", "in_progress", "completed", "completed", "cancelled", "postponed", "scheduled"];
  const dates = [
    "2026-03-12", "2026-03-15", "2026-03-18", "2026-03-10", "2026-03-05",
    "2026-02-28", "2026-03-20", "2026-03-22", "2026-03-25", "2026-03-28",
    "2026-04-01", "2026-04-05", "2026-04-10", "2026-04-15", "2026-04-20",
  ];

  return dates.map((date, i) => ({
    id: `SCH-${String(i + 1).padStart(3, "0")}`,
    examId: MOCK_EXAMS[i % MOCK_EXAMS.length].id,
    examTitle: MOCK_EXAMS[i % MOCK_EXAMS.length].title,
    examType: MOCK_EXAMS[i % MOCK_EXAMS.length].type,
    scheduledDate: date,
    startTime: ["08:30", "09:00", "13:30", "14:00", "15:00"][i % 5],
    endTime: ["10:00", "10:30", "15:00", "15:30", "16:30"][i % 5],
    duration: MOCK_EXAMS[i % MOCK_EXAMS.length].duration,
    room: rooms[i % rooms.length],
    capacity: [50, 100, 200, 500, 150][i % 5],
    enrolled: [38, 85, 156, 342, 120][i % 5],
    subsidiaries: SUBSIDIARIES.slice(0, (i % 4) + 2),
    departments: DEPARTMENTS.slice(i % 5, (i % 5) + 3),
    status: statuses[i % statuses.length],
    proctoringEnabled: i % 3 === 0,
    notificationsSent: statuses[i % statuses.length] !== "scheduled" || Math.random() > 0.3,
    reminderDays: [7, 3, 1],
    createdBy: "Nguyễn Văn Minh",
    notes: i % 3 === 0 ? "Bài thi bắt buộc cho tất cả quản lý cấp trung" : "",
    isRecurring: i % 4 === 0,
    recurringPattern: i % 4 === 0 ? "Hàng quý" : undefined,
  }));
}

const MOCK_SCHEDULES = generateMockSchedules();
const MOCK_NOTIFICATIONS: Notification[] = MOCK_SCHEDULES.slice(0, 10).flatMap((s, i) => [
  { id: `NTF-${i}-1`, scheduleId: s.id, type: "created" as const, sentAt: new Date(Date.now() - (15 - i) * 86400000).toISOString(), recipients: s.enrolled, channel: "all" as const, status: "sent" as const },
  { id: `NTF-${i}-2`, scheduleId: s.id, type: "reminder" as const, sentAt: new Date(Date.now() - (8 - i) * 86400000).toISOString(), recipients: s.enrolled, channel: "email" as const, status: i < 7 ? "sent" as const : "pending" as const },
]);

// ── Calendar Component ──
function MiniCalendar({ schedules, selectedDate, onSelect }: { schedules: ExamSchedule[]; selectedDate: string; onSelect: (d: string) => void }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(selectedDate || "2026-03-10");
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const daysInMonth = new Date(currentMonth.year, currentMonth.month + 1, 0).getDate();
  const firstDay = new Date(currentMonth.year, currentMonth.month, 1).getDay();
  const monthName = new Date(currentMonth.year, currentMonth.month).toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  const scheduleDates = new Set(schedules.map(s => s.scheduledDate));

  const prevMonth = () => {
    setCurrentMonth(prev => prev.month === 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: prev.month - 1 });
  };
  const nextMonth = () => {
    setCurrentMonth(prev => prev.month === 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: prev.month + 1 });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <span className="text-gray-800 capitalize" style={{ fontSize: "13px", fontWeight: 600 }}>{monthName}</span>
        <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(d => (
          <div key={d} className="text-center text-gray-400 py-1" style={{ fontSize: "10px", fontWeight: 600 }}>{d}</div>
        ))}
        {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasSchedule = scheduleDates.has(dateStr);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === "2026-03-10";
          return (
            <button key={day} onClick={() => onSelect(dateStr)}
              className={`relative w-full aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                isSelected ? "bg-[#990803] text-white" :
                isToday ? "bg-[#990803]/10 text-[#990803]" :
                hasSchedule ? "bg-blue-50 text-blue-700 hover:bg-blue-100" :
                "text-gray-600 hover:bg-gray-50"
              }`} style={{ fontSize: "11px", fontWeight: isSelected || isToday ? 700 : 400 }}>
              {day}
              {hasSchedule && !isSelected && <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#990803]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Create/Edit Modal ──
function ScheduleFormModal({ schedule, onClose, onSave }: { schedule?: ExamSchedule | null; onClose: () => void; onSave: (s: Partial<ExamSchedule>) => void }) {
  const [form, setForm] = useState({
    examId: schedule?.examId || "",
    scheduledDate: schedule?.scheduledDate || "2026-03-20",
    startTime: schedule?.startTime || "09:00",
    room: schedule?.room || "",
    subsidiaries: schedule?.subsidiaries || [] as string[],
    departments: schedule?.departments || [] as string[],
    proctoringEnabled: schedule?.proctoringEnabled || false,
    reminderDays: schedule?.reminderDays || [7, 3, 1],
    notes: schedule?.notes || "",
    isRecurring: schedule?.isRecurring || false,
    recurringPattern: schedule?.recurringPattern || "Hàng quý",
    notifyOnCreate: true,
    notifyChannels: "all" as "email" | "sms" | "push" | "all",
  });
  const [showSubsidiaries, setShowSubsidiaries] = useState(false);
  const [showDepartments, setShowDepartments] = useState(false);

  const selectedExam = MOCK_EXAMS.find(e => e.id === form.examId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{schedule ? "Chỉnh sửa lịch thi" : "Lên lịch thi mới"}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer"><XCircle className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Exam selection */}
          <div>
            <label className="text-gray-700 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 600 }}>Chọn đề thi *</label>
            <select value={form.examId} onChange={e => setForm(f => ({ ...f, examId: e.target.value }))}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer" style={{ fontSize: "13px" }}>
              <option value="">-- Chọn đề thi --</option>
              {MOCK_EXAMS.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            {selectedExam && (
              <div className="mt-2 p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#990803]/10 flex items-center justify-center">
                  <ClipboardCheck className="w-4 h-4 text-[#990803]" />
                </div>
                <div>
                  <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{selectedExam.title}</p>
                  <p className="text-gray-400" style={{ fontSize: "11px" }}>{selectedExam.duration} phút &bull; {selectedExam.totalQuestions} câu &bull; {selectedExam.difficulty}</p>
                </div>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 600 }}>Ngày thi *</label>
              <input type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200" style={{ fontSize: "13px" }} />
            </div>
            <div>
              <label className="text-gray-700 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 600 }}>Giờ bắt đầu *</label>
              <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200" style={{ fontSize: "13px" }} />
            </div>
          </div>

          {/* Room */}
          <div>
            <label className="text-gray-700 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 600 }}>Phòng thi / Nền tảng</label>
            <input type="text" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
              placeholder="VD: Phòng thi A1 - Tầng 5 hoặc Online - Zoom"
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200" style={{ fontSize: "13px" }} />
          </div>

          {/* Subsidiaries */}
          <div>
            <label className="text-gray-700 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 600 }}>Công ty thành viên</label>
            <button onClick={() => setShowSubsidiaries(!showSubsidiaries)}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between cursor-pointer" style={{ fontSize: "13px" }}>
              <span className="text-gray-600">{form.subsidiaries.length > 0 ? `${form.subsidiaries.length} công ty đã chọn` : "Chọn công ty..."}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSubsidiaries ? "rotate-180" : ""}`} />
            </button>
            {showSubsidiaries && (
              <div className="mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 max-h-40 overflow-y-auto space-y-1">
                {SUBSIDIARIES.map(sub => (
                  <label key={sub} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer">
                    <input type="checkbox" checked={form.subsidiaries.includes(sub)}
                      onChange={e => setForm(f => ({ ...f, subsidiaries: e.target.checked ? [...f.subsidiaries, sub] : f.subsidiaries.filter(s => s !== sub) }))}
                      className="w-3.5 h-3.5 rounded accent-[#990803]" />
                    <span className="text-gray-600" style={{ fontSize: "12px" }}>{sub}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Departments */}
          <div>
            <label className="text-gray-700 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 600 }}>Phòng ban</label>
            <button onClick={() => setShowDepartments(!showDepartments)}
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between cursor-pointer" style={{ fontSize: "13px" }}>
              <span className="text-gray-600">{form.departments.length > 0 ? `${form.departments.length} phòng ban đã chọn` : "Chọn phòng ban..."}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDepartments ? "rotate-180" : ""}`} />
            </button>
            {showDepartments && (
              <div className="mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 max-h-40 overflow-y-auto space-y-1">
                {DEPARTMENTS.map(dep => (
                  <label key={dep} className="flex items-center gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer">
                    <input type="checkbox" checked={form.departments.includes(dep)}
                      onChange={e => setForm(f => ({ ...f, departments: e.target.checked ? [...f.departments, dep] : f.departments.filter(d => d !== dep) }))}
                      className="w-3.5 h-3.5 rounded accent-[#990803]" />
                    <span className="text-gray-600" style={{ fontSize: "12px" }}>{dep}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input type="checkbox" checked={form.proctoringEnabled} onChange={e => setForm(f => ({ ...f, proctoringEnabled: e.target.checked }))} className="w-4 h-4 rounded accent-[#990803]" />
              <div>
                <span className="text-gray-700 block" style={{ fontSize: "12px", fontWeight: 600 }}>Proctoring</span>
                <span className="text-gray-400" style={{ fontSize: "10px" }}>Bật giám sát webcam</span>
              </div>
            </label>
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input type="checkbox" checked={form.isRecurring} onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))} className="w-4 h-4 rounded accent-[#990803]" />
              <div>
                <span className="text-gray-700 block" style={{ fontSize: "12px", fontWeight: 600 }}>Lặp lại</span>
                <span className="text-gray-400" style={{ fontSize: "10px" }}>Thi định kỳ</span>
              </div>
            </label>
          </div>

          {form.isRecurring && (
            <div>
              <label className="text-gray-700 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 600 }}>Chu kỳ lặp</label>
              <select value={form.recurringPattern} onChange={e => setForm(f => ({ ...f, recurringPattern: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer" style={{ fontSize: "13px" }}>
                <option>Hàng tuần</option>
                <option>Hàng tháng</option>
                <option>Hàng quý</option>
                <option>Hàng năm</option>
              </select>
            </div>
          )}

          {/* Notification settings */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <BellRing className="w-4 h-4 text-amber-600" />
              <span className="text-amber-800" style={{ fontSize: "13px", fontWeight: 600 }}>Thông báo tự động</span>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.notifyOnCreate} onChange={e => setForm(f => ({ ...f, notifyOnCreate: e.target.checked }))} className="w-3.5 h-3.5 rounded accent-amber-600" />
                <span className="text-amber-700" style={{ fontSize: "12px" }}>Gửi thông báo khi tạo lịch</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-amber-700" style={{ fontSize: "12px" }}>Nhắc nhở trước:</span>
                {[7, 3, 1].map(day => (
                  <label key={day} className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" checked={form.reminderDays.includes(day)}
                      onChange={e => setForm(f => ({ ...f, reminderDays: e.target.checked ? [...f.reminderDays, day] : f.reminderDays.filter(d => d !== day) }))}
                      className="w-3 h-3 rounded accent-amber-600" />
                    <span className="text-amber-700" style={{ fontSize: "11px" }}>{day} ngày</span>
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-700" style={{ fontSize: "12px" }}>Kênh:</span>
                <select value={form.notifyChannels} onChange={e => setForm(f => ({ ...f, notifyChannels: e.target.value as any }))}
                  className="px-2 py-1 bg-white rounded-lg border border-amber-300 text-amber-700 cursor-pointer" style={{ fontSize: "11px" }}>
                  <option value="all">Tất cả (Email + Push + SMS)</option>
                  <option value="email">Email</option>
                  <option value="push">Push notification</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-gray-700 mb-1.5 block" style={{ fontSize: "12px", fontWeight: 600 }}>Ghi chú</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3} placeholder="Ghi chú thêm..."
              className="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 resize-none" style={{ fontSize: "13px" }} />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer" style={{ fontSize: "13px" }}>
            Hủy
          </button>
          <button onClick={() => { onSave(form); onClose(); }}
            className="px-5 py-2.5 bg-gradient-to-r from-[#990803] to-[#7a0602] text-white rounded-xl hover:shadow-lg hover:shadow-[#990803]/20 transition-all cursor-pointer"
            style={{ fontSize: "13px", fontWeight: 600 }}>
            {schedule ? "Cập nhật" : "Tạo lịch thi"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──
export function ExamScheduling() {
  const [schedules, setSchedules] = useState(MOCK_SCHEDULES);
  const [sentNotifications, setSentNotifications] = useState<Set<string>>(new Set());
  const handleSendNotification = (scheduleId: string, enrolled: number) => {
    setSentNotifications(prev => new Set(prev).add(scheduleId));
    import("sonner").then(m => m.toast.success(`Đã gửi thông báo cho ${enrolled} thí sinh!`));
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subsidiaryFilter, setSubsidiaryFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("2026-03-10");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ExamSchedule | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const filtered = useMemo(() => {
    return schedules.filter(s => {
      const matchSearch = s.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.room.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchSub = subsidiaryFilter === "all" || s.subsidiaries.includes(subsidiaryFilter);
      return matchSearch && matchStatus && matchSub;
    }).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [schedules, searchQuery, statusFilter, subsidiaryFilter]);

  const todaySchedules = filtered.filter(s => s.scheduledDate === selectedDate);
  const upcomingSchedules = filtered.filter(s => new Date(s.scheduledDate) >= new Date("2026-03-10"));

  const stats = useMemo(() => ({
    total: schedules.length,
    scheduled: schedules.filter(s => s.status === "scheduled").length,
    inProgress: schedules.filter(s => s.status === "in_progress").length,
    completed: schedules.filter(s => s.status === "completed").length,
    cancelled: schedules.filter(s => s.status === "cancelled").length,
    totalEnrolled: schedules.reduce((s, sch) => s + sch.enrolled, 0),
  }), [schedules]);

  // ── Notification Panel ──
  if (showNotifications) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-foreground">Lịch sử Thông báo</h2>
            <p className="text-gray-500" style={{ fontSize: "12px" }}>{MOCK_NOTIFICATIONS.length} thông báo đã gửi</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {MOCK_NOTIFICATIONS.map(n => {
            const schedule = schedules.find(s => s.id === n.scheduleId);
            const typeConfig = {
              created: { label: "Tạo lịch", color: "#3b82f6", icon: CalendarDays },
              reminder: { label: "Nhắc nhở", color: "#f59e0b", icon: BellRing },
              change: { label: "Thay đổi", color: "#8b5cf6", icon: Edit3 },
              cancellation: { label: "Hủy", color: "#ef4444", icon: CalendarX },
              start: { label: "Bắt đầu", color: "#22c55e", icon: Play },
            }[n.type] || { label: n.type, color: "#6b7280", icon: Bell };
            const NIcon = typeConfig.icon;
            return (
              <div key={n.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${typeConfig.color}15` }}>
                  <NIcon className="w-4 h-4" style={{ color: typeConfig.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-800" style={{ fontSize: "12px", fontWeight: 600 }}>{typeConfig.label}</span>
                    <span className={`px-1.5 py-0 rounded-full ${n.status === "sent" ? "bg-green-50 text-green-600" : n.status === "pending" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}
                      style={{ fontSize: "9px", fontWeight: 600 }}>{n.status === "sent" ? "Đã gửi" : n.status === "pending" ? "Chờ gửi" : "Lỗi"}</span>
                  </div>
                  <p className="text-gray-500 truncate" style={{ fontSize: "11px" }}>{schedule?.examTitle || "Đề thi"} &bull; {n.recipients} người nhận</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>{new Date(n.sentAt).toLocaleDateString("vi-VN")}</p>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>via {n.channel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Detail View ──
  if (selectedSchedule) {
    const s = selectedSchedule;
    const statusCfg = STATUS_CONFIG[s.status];
    const StatusIcon = statusCfg.icon;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedSchedule(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-foreground">{s.examTitle}</h2>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full" style={{ fontSize: "11px", fontWeight: 600, color: statusCfg.color, background: statusCfg.bg }}>
                <StatusIcon className="w-3 h-3" /> {statusCfg.label}
              </span>
            </div>
            <p className="text-gray-500" style={{ fontSize: "12px" }}>Mã: {s.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Thông tin lịch thi</h3>
            {[
              { icon: Calendar, label: "Ngày thi", value: new Date(s.scheduledDate).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }) },
              { icon: Clock, label: "Thời gian", value: `${s.startTime} - ${s.endTime} (${s.duration} phút)` },
              { icon: MapPin, label: "Phòng thi", value: s.room },
              { icon: Users, label: "Đã đăng ký", value: `${s.enrolled}/${s.capacity} học viên` },
              { icon: Shield, label: "Proctoring", value: s.proctoringEnabled ? "Bật" : "Tắt" },
              { icon: Repeat, label: "Lặp lại", value: s.isRecurring ? s.recurringPattern || "Có" : "Không" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-400" style={{ fontSize: "11px" }}>{item.label}</p>
                  <p className="text-gray-800" style={{ fontSize: "12px", fontWeight: 600 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Target audience */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 style={{ fontSize: "14px", fontWeight: 600 }} className="mb-3">Đối tượng thi</h3>
              <div className="mb-3">
                <p className="text-gray-500 mb-1.5" style={{ fontSize: "11px", fontWeight: 600 }}>Công ty thành viên</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.subsidiaries.map(sub => (
                    <span key={sub} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full" style={{ fontSize: "10px", fontWeight: 600 }}>{sub}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-gray-500 mb-1.5" style={{ fontSize: "11px", fontWeight: 600 }}>Phòng ban</p>
                <div className="flex flex-wrap gap-1.5">
                  {s.departments.map(dep => (
                    <span key={dep} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full" style={{ fontSize: "10px", fontWeight: 600 }}>{dep}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Thông báo</h3>
                <span className={`px-2 py-0.5 rounded-full ${s.notificationsSent ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}
                  style={{ fontSize: "10px", fontWeight: 600 }}>
                  {s.notificationsSent ? "Đã gửi" : "Chưa gửi"}
                </span>
              </div>
              <div className="space-y-2">
                {s.reminderDays.map(day => (
                  <div key={day} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <BellRing className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-gray-600" style={{ fontSize: "12px" }}>Nhắc nhở trước {day} ngày</span>
                  </div>
                ))}
              </div>
              {sentNotifications.has(s.id) ? (
                <div className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-xl" style={{ fontSize: "12px", fontWeight: 600 }}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã gửi thông báo
                </div>
              ) : (
                <button onClick={() => handleSendNotification(s.id, s.enrolled)} className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#990803]/10 text-[#990803] rounded-xl hover:bg-[#990803]/20 transition-colors cursor-pointer"
                  style={{ fontSize: "12px", fontWeight: 600 }}>
                  <Send className="w-3.5 h-3.5" /> Gửi thông báo ngay
                </button>
              )}
            </div>
          </div>
        </div>

        {s.notes && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <p className="text-amber-800" style={{ fontSize: "12px" }}><strong>Ghi chú:</strong> {s.notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Tổng lịch thi", value: stats.total, icon: CalendarDays, color: "#990803" },
          { label: "Đã lên lịch", value: stats.scheduled, icon: CalendarClock, color: "#3b82f6" },
          { label: "Đang diễn ra", value: stats.inProgress, icon: CalendarCheck, color: "#22c55e" },
          { label: "Hoàn thành", value: stats.completed, icon: CheckCircle2, color: "#6b7280" },
          { label: "Đã hủy", value: stats.cancelled, icon: CalendarX, color: "#ef4444" },
          { label: "Tổng thí sinh", value: stats.totalEnrolled.toLocaleString(), icon: Users, color: "#c8a84e" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3.5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${stat.color}12` }}>
                <stat.icon className="w-4.5 h-4.5" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-gray-800" style={{ fontSize: "22px", fontWeight: 800 }}>{stat.value}</p>
            <p className="text-gray-400" style={{ fontSize: "11px" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm đề thi, phòng thi..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#990803]/10 focus:outline-none"
              style={{ fontSize: "13px" }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Trạng thái</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={subsidiaryFilter} onChange={e => setSubsidiaryFilter(e.target.value)}
              className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-gray-600 cursor-pointer" style={{ fontSize: "12px" }}>
              <option value="all">Công ty</option>
              {SUBSIDIARIES.map(s => <option key={s} value={s}>{s.length > 25 ? s.slice(0, 25) + "..." : s}</option>)}
            </select>
            <button onClick={() => setShowNotifications(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors"
              style={{ fontSize: "12px", fontWeight: 500 }}>
              <Bell className="w-3.5 h-3.5" /> Thông báo
            </button>
            <button onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#990803] to-[#7a0602] text-white rounded-xl hover:shadow-lg hover:shadow-[#990803]/20 transition-all cursor-pointer"
              style={{ fontSize: "12px", fontWeight: 600 }}>
              <Plus className="w-3.5 h-3.5" /> Lên lịch mới
            </button>
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500" style={{ fontSize: "12px" }}>{filtered.length} lịch thi</p>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(["calendar", "list"] as const).map(v => (
            <button key={v} onClick={() => setViewMode(v)}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${viewMode === v ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`}
              style={{ fontSize: "11px", fontWeight: 500 }}>
              {v === "calendar" ? "Lịch" : "Danh sách"}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar view */}
      {viewMode === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <MiniCalendar schedules={filtered} selectedDate={selectedDate} onSelect={setSelectedDate} />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
                {selectedDate === "2026-03-10" ? "Hôm nay" : new Date(selectedDate).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })}
                <span className="text-gray-400 ml-2" style={{ fontSize: "12px", fontWeight: 400 }}>{todaySchedules.length} lịch thi</span>
              </h3>
              {todaySchedules.length === 0 ? (
                <div className="text-center py-10">
                  <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-gray-400" style={{ fontSize: "13px" }}>Không có lịch thi trong ngày này</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySchedules.map(s => {
                    const statusCfg = STATUS_CONFIG[s.status];
                    const StatusIcon = statusCfg.icon;
                    return (
                      <div key={s.id} onClick={() => setSelectedSchedule(s)}
                        className="p-4 rounded-xl border border-gray-200 hover:shadow-md hover:border-[#990803]/10 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: statusCfg.color, background: statusCfg.bg }}>
                                <StatusIcon className="w-3 h-3" /> {statusCfg.label}
                              </span>
                              {s.proctoringEnabled && <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full" style={{ fontSize: "10px", fontWeight: 600 }}>🛡 Proctored</span>}
                              {s.isRecurring && <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full" style={{ fontSize: "10px", fontWeight: 600 }}>🔄 {s.recurringPattern}</span>}
                            </div>
                            <h4 className="text-gray-800 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{s.examTitle}</h4>
                            <div className="flex items-center gap-3 mt-1.5 text-gray-500" style={{ fontSize: "11px" }}>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.startTime} - {s.endTime}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.room}</span>
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {s.enrolled}/{s.capacity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upcoming */}
              <div className="mt-6">
                <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
                  Sắp tới
                  <span className="text-gray-400 ml-2" style={{ fontSize: "12px", fontWeight: 400 }}>{upcomingSchedules.length} lịch</span>
                </h3>
                <div className="space-y-2">
                  {upcomingSchedules.slice(0, 5).map(s => {
                    const statusCfg = STATUS_CONFIG[s.status];
                    return (
                      <div key={s.id} onClick={() => setSelectedSchedule(s)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-10 text-center shrink-0">
                          <p className="text-[#990803]" style={{ fontSize: "16px", fontWeight: 800 }}>{new Date(s.scheduledDate).getDate()}</p>
                          <p className="text-gray-400" style={{ fontSize: "9px" }}>Th{new Date(s.scheduledDate).getMonth() + 1}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{s.examTitle}</p>
                          <p className="text-gray-400" style={{ fontSize: "11px" }}>{s.startTime} &bull; {s.room}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full shrink-0" style={{ fontSize: "10px", fontWeight: 600, color: statusCfg.color, background: statusCfg.bg }}>
                          {statusCfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map(s => {
            const statusCfg = STATUS_CONFIG[s.status];
            const StatusIcon = statusCfg.icon;
            return (
              <div key={s.id} onClick={() => setSelectedSchedule(s)}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-[#990803]/10 flex flex-col items-center justify-center shrink-0">
                  <p className="text-[#990803]" style={{ fontSize: "16px", fontWeight: 800 }}>{new Date(s.scheduledDate).getDate()}</p>
                  <p className="text-[#990803]/60" style={{ fontSize: "9px" }}>Th{new Date(s.scheduledDate).getMonth() + 1}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-gray-800 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{s.examTitle}</h4>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0" style={{ fontSize: "10px", fontWeight: 600, color: statusCfg.color, background: statusCfg.bg }}>
                      <StatusIcon className="w-3 h-3" /> {statusCfg.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500" style={{ fontSize: "11px" }}>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.startTime} - {s.endTime}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.room}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {s.enrolled}/{s.capacity}</span>
                    {s.proctoringEnabled && <span className="flex items-center gap-1 text-green-600"><Shield className="w-3 h-3" /> Proctored</span>}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {s.subsidiaries.slice(0, 3).map(sub => (
                      <span key={sub} className="px-1.5 py-0 bg-gray-100 text-gray-500 rounded" style={{ fontSize: "9px" }}>{sub.length > 20 ? sub.slice(0, 20) + "..." : sub}</span>
                    ))}
                    {s.subsidiaries.length > 3 && <span className="text-gray-400" style={{ fontSize: "9px" }}>+{s.subsidiaries.length - 3}</span>}
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {!s.notificationsSent && !sentNotifications.has(s.id) && (
                    <button onClick={e => { e.stopPropagation(); handleSendNotification(s.id, s.enrolled); }} className="p-2 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer" title="Gửi thông báo">
                      <Send className="w-3.5 h-3.5 text-amber-500" />
                    </button>
                  )}
                  {sentNotifications.has(s.id) && (
                    <div className="p-2" title="Đã gửi thông báo">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    </div>
                  )}
                  <button onClick={e => { e.stopPropagation(); setSelectedSchedule(s); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Chỉnh sửa">
                    <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <ScheduleFormModal onClose={() => setShowCreateModal(false)} onSave={() => {}} />
      )}
    </div>
  );
}