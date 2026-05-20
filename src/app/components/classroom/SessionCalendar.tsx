import { useState, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Clock, Users, MapPin, Plus, Edit,
  X, Check, Trash2, CalendarDays, List,
  User, Building2,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { useConfirm } from "../ConfirmDialog";
import { EmptyState } from "../EmptyState";
import { toast } from "@/app/lib/toast";
import {
  TRAINING_SESSIONS, CLASSROOMS, SESSION_STATUS_CONFIG,
  DAYS_OF_WEEK, WEEK_DATES, TIME_SLOTS,
  getRoomById,
  type TrainingSession, type SessionStatus,
} from "./mock-data";

interface SessionCalendarProps {
  onSelectSession: (sessionId: string) => void;
  bookingMode?: boolean;
}

export function SessionCalendar({ onSelectSession, bookingMode }: SessionCalendarProps) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const role = user?.role || "learner";
  const isAdmin = role === "admin";
  const isInstructor = role === "instructor";
  const canManage = isAdmin || isInstructor;

  const [sessions, setSessions] = useState<TrainingSession[]>(TRAINING_SESSIONS);
  const [viewMode, setViewMode] = useState<"week" | "agenda">(bookingMode ? "agenda" : "week");
  const [hoveredSession, setHoveredSession] = useState<string | null>(null);
  const [filterRoom, setFilterRoom] = useState("all");
  const [filterInstructor, setFilterInstructor] = useState("all");
  const [filterStatus, setFilterStatus] = useState<SessionStatus | "all">("all");
  const [filterSub, setFilterSub] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<TrainingSession | null>(null);
  const [detailSession, setDetailSession] = useState<TrainingSession | null>(null);

  // Form
  const emptyForm = {
    title: "", courseName: "", roomId: CLASSROOMS[0]?.id || "", instructorName: "",
    date: "13/03/2026", dayOfWeek: 5, startTime: "09:00", endTime: "12:00",
    maxCapacity: 40, color: "#990803", subsidiary: "VP Tập đoàn", notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  const instructors = useMemo(() => [...new Set(sessions.map(s => s.instructorName))], [sessions]);
  const subsidiaries = useMemo(() => [...new Set(sessions.map(s => s.subsidiary))], [sessions]);

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      if (filterRoom !== "all" && s.roomId !== filterRoom) return false;
      if (filterInstructor !== "all" && s.instructorName !== filterInstructor) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (filterSub !== "all" && s.subsidiary !== filterSub) return false;
      return true;
    });
  }, [sessions, filterRoom, filterInstructor, filterStatus, filterSub]);

  const activeSessions = filtered.filter(s => s.status !== "cancelled");
  const todaySessions = filtered.filter(s => s.dayOfWeek === 4 && s.status !== "cancelled");

  // ─── Actions ───
  const openCreate = (dayOfWeek?: number) => {
    setEditingSession(null);
    setForm({ ...emptyForm, dayOfWeek: dayOfWeek ?? 5 });
    setShowModal(true);
  };

  const openEdit = (session: TrainingSession) => {
    setEditingSession(session);
    setForm({
      title: session.title, courseName: session.courseName, roomId: session.roomId,
      instructorName: session.instructorName, date: session.date, dayOfWeek: session.dayOfWeek,
      startTime: session.startTime, endTime: session.endTime, maxCapacity: session.maxCapacity,
      color: session.color, subsidiary: session.subsidiary, notes: session.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) { toast.error("Vui lòng nhập tiêu đề buổi học"); return; }
    if (!form.instructorName.trim()) { toast.error("Vui lòng nhập tên giảng viên"); return; }

    // Conflict detection
    const conflicting = sessions.filter(s => {
      if (editingSession && s.id === editingSession.id) return false;
      if (s.status === "cancelled") return false;
      if (s.roomId !== form.roomId || s.dayOfWeek !== form.dayOfWeek) return false;
      const sStart = parseInt(s.startTime.replace(":", ""));
      const sEnd = parseInt(s.endTime.replace(":", ""));
      const fStart = parseInt(form.startTime.replace(":", ""));
      const fEnd = parseInt(form.endTime.replace(":", ""));
      return fStart < sEnd && fEnd > sStart;
    });

    if (conflicting.length > 0) {
      toast.error(`Trùng lịch! Phòng đã có buổi "${conflicting[0].title}" cùng thời gian.`);
      return;
    }

    const initials = form.instructorName.split(" ").map(w => w[0]).slice(-2).join("").toUpperCase();

    if (editingSession) {
      setSessions(prev => prev.map(s => s.id === editingSession.id ? {
        ...s, title: form.title, courseName: form.courseName, roomId: form.roomId,
        instructorName: form.instructorName, instructorAvatar: initials,
        date: form.date, dayOfWeek: form.dayOfWeek, startTime: form.startTime,
        endTime: form.endTime, maxCapacity: form.maxCapacity, color: form.color,
        subsidiary: form.subsidiary, notes: form.notes || undefined,
      } : s));
      toast.success("Đã cập nhật buổi học");
    } else {
      const newSession: TrainingSession = {
        id: `TS_${Date.now()}`, title: form.title, courseName: form.courseName,
        roomId: form.roomId, instructorName: form.instructorName, instructorAvatar: initials,
        date: form.date, dayOfWeek: form.dayOfWeek, startTime: form.startTime,
        endTime: form.endTime, status: "scheduled", enrolledCount: 0,
        maxCapacity: form.maxCapacity, color: form.color, subsidiary: form.subsidiary,
        notes: form.notes || undefined,
      };
      setSessions(prev => [...prev, newSession]);
      toast.success("Đã tạo buổi học mới");
    }
    setShowModal(false);
  };

  const handleCancel = async (session: TrainingSession) => {
    const ok = await confirm({
      title: "Hủy buổi học",
      message: `Hủy "${session.title}" (${session.date}, ${session.startTime}–${session.endTime})? ${session.enrolledCount > 0 ? `Có ${session.enrolledCount} học viên đã đăng ký.` : ""}`,
      confirmLabel: "Hủy buổi học",
      variant: "danger",
    });
    if (ok) {
      setSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: "cancelled" as SessionStatus, enrolledCount: 0 } : s));
      if (detailSession?.id === session.id) setDetailSession(prev => prev ? { ...prev, status: "cancelled" as SessionStatus } : null);
      toast.success("Đã hủy buổi học");
    }
  };

  const handleDelete = async (session: TrainingSession) => {
    const ok = await confirm({
      title: "Xóa buổi học",
      message: `Xóa vĩnh viễn "${session.title}"?`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setSessions(prev => prev.filter(s => s.id !== session.id));
      if (detailSession?.id === session.id) setDetailSession(null);
      toast.success("Đã xóa buổi học");
    }
  };

  // Calendar position calculation
  function getSessionPosition(session: TrainingSession) {
    const startHour = parseInt(session.startTime.split(":")[0]);
    const startMin = parseInt(session.startTime.split(":")[1]) || 0;
    const endHour = parseInt(session.endTime.split(":")[0]);
    const endMin = parseInt(session.endTime.split(":")[1]) || 0;
    const startSlot = startHour - 7;
    const duration = (endHour + endMin / 60) - (startHour + startMin / 60);
    return { startSlot, duration, startFraction: startMin / 60 };
  }

  const slotH = 56;
  const headerH = 44;
  const COLORS = ["#990803", "#c8a84e", "#2563eb", "#16a34a", "#7c3aed", "#ea580c", "#0891b2", "#d946ef", "#65a30d", "#f97316", "#dc2626"];
  const DAY_OPTIONS = [
    { value: 1, label: "Thứ 2 (09/03)" }, { value: 2, label: "Thứ 3 (10/03)" },
    { value: 3, label: "Thứ 4 (11/03)" }, { value: 4, label: "Thứ 5 (12/03)" },
    { value: 5, label: "Thứ 6 (13/03)" }, { value: 6, label: "Thứ 7 (14/03)" },
    { value: 0, label: "CN (15/03)" },
  ];

  // ─── Session Detail Panel ───
  if (detailSession) {
    const room = getRoomById(detailSession.roomId);
    const stCfg = SESSION_STATUS_CONFIG[detailSession.status];

    return (
      <div className="space-y-6">
        <button onClick={() => setDetailSession(null)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer" style={{ fontSize: "13px" }}>
          <ChevronLeft className="w-4 h-4" /> Quay lại lịch
        </button>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="h-2" style={{ backgroundColor: detailSession.color }} />
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: detailSession.color, fontSize: "16px", fontWeight: 700 }}>
                {detailSession.instructorAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-foreground">{detailSession.title}</h2>
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                </div>
                <p className="text-muted-foreground" style={{ fontSize: "14px" }}>Khóa: {detailSession.courseName}</p>
                {detailSession.notes && <p className="text-muted-foreground/60 mt-1 italic" style={{ fontSize: "12px" }}>💬 {detailSession.notes}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
              {[
                { label: "Ngày", value: `${DAYS_OF_WEEK[detailSession.dayOfWeek]}, ${detailSession.date}` },
                { label: "Thời gian", value: `${detailSession.startTime} — ${detailSession.endTime}` },
                { label: "Phòng", value: room?.name || "N/A" },
                { label: "Giảng viên", value: detailSession.instructorName },
                { label: "Đã đăng ký", value: `${detailSession.enrolledCount}/${detailSession.maxCapacity}` },
                { label: "Đơn vị", value: detailSession.subsidiary },
                { label: "Vị trí", value: room?.location || "N/A" },
                { label: "Loại phòng", value: room ? `${room.type === "virtual" ? "🌐 Ảo" : room.type === "hybrid" ? "🔄 Hybrid" : "🏢 Vật lý"}` : "N/A" },
              ].map(m => (
                <div key={m.label} className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{m.label}</p>
                  <p className="text-foreground mt-0.5" style={{ fontSize: "12px", fontWeight: 500 }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Capacity bar */}
            <div className="mt-5 p-4 bg-secondary/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>Tình trạng đăng ký</p>
                <span style={{ fontSize: "13px", fontWeight: 700, color: detailSession.enrolledCount >= detailSession.maxCapacity ? "#dc2626" : detailSession.enrolledCount >= detailSession.maxCapacity * 0.8 ? "#ea580c" : "#16a34a" }}>
                  {detailSession.enrolledCount}/{detailSession.maxCapacity}
                </span>
              </div>
              <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{
                  width: `${Math.min((detailSession.enrolledCount / detailSession.maxCapacity) * 100, 100)}%`,
                  backgroundColor: detailSession.enrolledCount >= detailSession.maxCapacity ? "#dc2626" : detailSession.enrolledCount >= detailSession.maxCapacity * 0.8 ? "#ea580c" : "#16a34a",
                }} />
              </div>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "10px" }}>
                {detailSession.maxCapacity - detailSession.enrolledCount > 0 ? `Còn ${detailSession.maxCapacity - detailSession.enrolledCount} chỗ` : "Đã đầy"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-5">
              {(detailSession.status === "scheduled" || detailSession.status === "in_progress") && (
                <button onClick={() => onSelectSession(detailSession.id)} className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
                  <Users className="w-4 h-4" /> Điểm danh
                </button>
              )}
              {canManage && detailSession.status === "scheduled" && (
                <>
                  <button onClick={() => openEdit(detailSession)} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-secondary cursor-pointer" style={{ fontSize: "13px" }}>
                    <Edit className="w-4 h-4" /> Chỉnh sửa
                  </button>
                  <button onClick={() => handleCancel(detailSession)} className="flex items-center gap-2 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer" style={{ fontSize: "13px" }}>
                    <X className="w-4 h-4" /> Hủy buổi học
                  </button>
                </>
              )}
              {isAdmin && detailSession.status === "cancelled" && (
                <button onClick={() => handleDelete(detailSession)} className="flex items-center gap-2 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer" style={{ fontSize: "13px" }}>
                  <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Week header */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>
              {bookingMode ? "📅 Đặt phòng & Lên lịch" : "Tuần 09/03 — 15/03/2026"}
            </h3>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
              {activeSessions.length} buổi học • {todaySessions.length} buổi hôm nay (Thứ 5, 12/03)
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)}
              className="px-2.5 py-1.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer focus:outline-none" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả phòng</option>
              {CLASSROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <select value={filterInstructor} onChange={e => setFilterInstructor(e.target.value)}
              className="px-2.5 py-1.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer focus:outline-none" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả GV</option>
              {instructors.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
              className="px-2.5 py-1.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer focus:outline-none" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả TT</option>
              {(Object.keys(SESSION_STATUS_CONFIG) as SessionStatus[]).map(s => <option key={s} value={s}>{SESSION_STATUS_CONFIG[s].label}</option>)}
            </select>
            <select value={filterSub} onChange={e => setFilterSub(e.target.value)}
              className="px-2.5 py-1.5 bg-input-background rounded-lg border-0 text-foreground cursor-pointer focus:outline-none" style={{ fontSize: "12px" }}>
              <option value="all">Tất cả ĐV</option>
              {subsidiaries.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button onClick={() => setViewMode("week")} className={`p-1.5 cursor-pointer ${viewMode === "week" ? "bg-[#990803] text-white" : "text-muted-foreground hover:bg-secondary"}`}><CalendarDays className="w-3.5 h-3.5" /></button>
              <button onClick={() => setViewMode("agenda")} className={`p-1.5 cursor-pointer ${viewMode === "agenda" ? "bg-[#990803] text-white" : "text-muted-foreground hover:bg-secondary"}`}><List className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
              <button onClick={() => toast.info("Chuyển sang tuần trước")} className="p-1.5 hover:bg-secondary cursor-pointer text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
              <span className="px-2 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Tuần này</span>
              <button onClick={() => toast.info("Chuyển sang tuần sau")} className="p-1.5 hover:bg-secondary cursor-pointer text-muted-foreground"><ChevronRight className="w-4 h-4" /></button>
            </div>
            {canManage && (
              <button onClick={() => openCreate()} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
                <Plus className="w-3.5 h-3.5" /> Tạo buổi học
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          {(["scheduled", "in_progress", "completed", "cancelled"] as const).map(st => {
            const cfg = SESSION_STATUS_CONFIG[st];
            return (
              <div key={st} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: cfg.color, opacity: 0.7 }} />
                <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{cfg.label}</span>
              </div>
            );
          })}
          <span className="text-muted-foreground ml-auto" style={{ fontSize: "10px" }}>{filtered.length} buổi</span>
        </div>
      </div>

      {/* Calendar Grid (Week view) */}
      {viewMode === "week" && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="relative border border-border rounded-lg overflow-hidden" style={{ minHeight: TIME_SLOTS.length * slotH + headerH }}>
            {/* Day headers */}
            <div className="flex border-b border-border bg-secondary/30 sticky top-0 z-10" style={{ height: headerH }}>
              <div className="shrink-0" style={{ width: 52 }} />
              {[1, 2, 3, 4, 5, 6, 0].map(dow => {
                const isToday = dow === 4;
                return (
                  <div key={dow} className={`flex-1 flex flex-col items-center justify-center border-l border-border ${isToday ? "bg-[#990803]/5" : ""}`}>
                    <span className={isToday ? "text-[#990803]" : "text-muted-foreground"} style={{ fontSize: "10px", fontWeight: 600 }}>{DAYS_OF_WEEK[dow]}</span>
                    <span className={isToday ? "text-[#990803]" : "text-foreground"} style={{ fontSize: "12px", fontWeight: isToday ? 700 : 500 }}>{WEEK_DATES[dow]}</span>
                  </div>
                );
              })}
            </div>

            {/* Time grid */}
            <div className="relative" style={{ height: TIME_SLOTS.length * slotH }}>
              {TIME_SLOTS.map((time, i) => (
                <div key={time} className="absolute left-0 flex items-start" style={{ top: i * slotH, width: "100%", height: slotH }}>
                  <div className="shrink-0 text-right pr-2 -mt-2" style={{ width: 52 }}>
                    <span className="text-muted-foreground/40" style={{ fontSize: "10px" }}>{time}</span>
                  </div>
                  <div className="flex-1 border-t border-border/30 h-full" />
                </div>
              ))}

              {/* Day columns */}
              <div className="absolute flex" style={{ left: 52, right: 0, top: 0, bottom: 0 }}>
                {[1, 2, 3, 4, 5, 6, 0].map(dow => {
                  const isToday = dow === 4;
                  return <div key={dow} className={`flex-1 border-l border-border/30 ${isToday ? "bg-[#990803]/3" : ""}`} />;
                })}
              </div>

              {/* Sessions */}
              {[1, 2, 3, 4, 5, 6, 0].map((dow, colIdx) => {
                const daySessions = filtered.filter(s => s.dayOfWeek === dow);
                return daySessions.map(session => {
                  const { startSlot, duration, startFraction } = getSessionPosition(session);
                  const room = getRoomById(session.roomId);
                  const stCfg = SESSION_STATUS_CONFIG[session.status];
                  const isHovered = hoveredSession === session.id;
                  const top = (startSlot + startFraction) * slotH;
                  const height = Math.max(duration * slotH - 2, 24);
                  const leftPct = (colIdx / 7) * 100;
                  const widthPct = 100 / 7;

                  return (
                    <div key={session.id}
                      className={`absolute rounded-lg cursor-pointer transition-all overflow-hidden ${isHovered ? "shadow-lg z-20 scale-[1.02]" : "z-10"}`}
                      style={{
                        top, left: `calc(52px + ${leftPct}% + 2px)`, width: `calc(${widthPct}% - 6px)`, height,
                        backgroundColor: session.status === "cancelled" ? "#f1f5f9" : session.color + "18",
                        borderLeft: `3px solid ${session.status === "cancelled" ? "#94a3b8" : session.color}`,
                      }}
                      onMouseEnter={() => setHoveredSession(session.id)}
                      onMouseLeave={() => setHoveredSession(null)}
                      onClick={() => setDetailSession(session)}
                    >
                      <div className="px-1.5 py-1 h-full flex flex-col gap-px overflow-hidden">
                        <p className={`truncate ${session.status === "cancelled" ? "line-through text-muted-foreground" : "text-foreground"}`} style={{ fontSize: "9px", fontWeight: 600, lineHeight: 1.2 }}>{session.title}</p>
                        {height > 32 && <p className="text-muted-foreground truncate" style={{ fontSize: "8px", lineHeight: 1.2 }}>{session.startTime}-{session.endTime} • {room?.name}</p>}
                        {height > 50 && <p className="text-muted-foreground/50 truncate mt-auto" style={{ fontSize: "8px", lineHeight: 1.2 }}>{session.instructorName} • {session.enrolledCount}/{session.maxCapacity}</p>}
                      </div>

                      {/* Hover tooltip */}
                      {isHovered && (
                        <div className="absolute left-full top-0 ml-2 w-52 bg-card rounded-xl shadow-xl border border-border p-3 z-30 pointer-events-none">
                          <div className="w-2 h-2 rounded-full mb-1.5" style={{ backgroundColor: stCfg.color }} />
                          <p className="text-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>{session.title}</p>
                          <div className="space-y-1 text-muted-foreground" style={{ fontSize: "10px" }}>
                            <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.startTime} — {session.endTime}</p>
                            <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {room?.name}</p>
                            <p className="flex items-center gap-1"><Users className="w-3 h-3" /> {session.enrolledCount}/{session.maxCapacity} học viên</p>
                            <p>👨‍🏫 {session.instructorName}</p>
                            {session.notes && <p className="text-muted-foreground/50 italic">💬 {session.notes}</p>}
                          </div>
                          <span className="mt-2 inline-block px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                        </div>
                      )}
                    </div>
                  );
                });
              })}

              {/* Current time indicator */}
              {(() => {
                const nowHour = 10, nowMin = 15;
                const top = ((nowHour - 7) + nowMin / 60) * slotH;
                const colIdx = 3;
                return (
                  <div className="absolute z-30 pointer-events-none" style={{ top, left: 52, right: 0 }}>
                    <div className="relative w-full">
                      <div className="absolute h-0.5 bg-[#dc2626]" style={{ left: `calc(${(colIdx / 7) * 100}%)`, width: `${100 / 7}%` }} />
                      <div className="absolute w-2 h-2 rounded-full bg-[#dc2626] -mt-[3px]" style={{ left: `calc(${(colIdx / 7) * 100}% - 3px)` }} />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Agenda view */}
      {viewMode === "agenda" && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 0].map(dow => {
            const daySessions = filtered.filter(s => s.dayOfWeek === dow).sort((a, b) => a.startTime.localeCompare(b.startTime));
            if (daySessions.length === 0) return null;
            const isToday = dow === 4;
            return (
              <div key={dow} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className={`px-4 py-2.5 border-b border-border flex items-center justify-between ${isToday ? "bg-[#990803]/5" : "bg-secondary/20"}`}>
                  <span className={`${isToday ? "text-[#990803]" : "text-foreground"}`} style={{ fontSize: "13px", fontWeight: 600 }}>
                    {isToday && "📅 "}{DAYS_OF_WEEK[dow]}, {WEEK_DATES[dow]}/03/2026
                    {isToday && <span className="ml-2 px-1.5 py-0.5 bg-[#990803] text-white rounded" style={{ fontSize: "9px" }}>HÔM NAY</span>}
                  </span>
                  <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{daySessions.length} buổi</span>
                </div>
                <div className="divide-y divide-border/30">
                  {daySessions.map(s => {
                    const room = getRoomById(s.roomId);
                    const stCfg = SESSION_STATUS_CONFIG[s.status];
                    return (
                      <div key={s.id} className="flex items-center gap-3 p-3 hover:bg-secondary/20 cursor-pointer transition-colors" onClick={() => setDetailSession(s)}>
                        <div className="w-1.5 h-12 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <div className="w-14 text-center shrink-0">
                          <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{s.startTime}</p>
                          <p className="text-muted-foreground/50" style={{ fontSize: "10px" }}>{s.endTime}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-foreground truncate ${s.status === "cancelled" ? "line-through opacity-50" : ""}`} style={{ fontSize: "13px", fontWeight: 500 }}>{s.title}</p>
                          <div className="flex items-center gap-3 text-muted-foreground mt-0.5 flex-wrap" style={{ fontSize: "11px" }}>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {room?.name}</span>
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {s.instructorName}</span>
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {s.enrolledCount}/{s.maxCapacity}</span>
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {s.subsidiary}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full shrink-0" style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                        {canManage && s.status === "scheduled" && (
                          <div className="flex gap-1 shrink-0">
                            <button onClick={e => { e.stopPropagation(); openEdit(s); }} className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer"><Edit className="w-3.5 h-3.5 text-muted-foreground" /></button>
                            <button onClick={e => { e.stopPropagation(); handleCancel(s); }} className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"><X className="w-3.5 h-3.5 text-red-400" /></button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <EmptyState variant="empty" title="Không có buổi học" message="Chưa có buổi học nào trong tuần này" action={canManage ? { label: "Tạo buổi học", onClick: () => openCreate() } : undefined} />
          )}
        </div>
      )}

      {/* Today's sessions (week view only) */}
      {viewMode === "week" && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>📅 Hôm nay — Thứ 5, 12/03/2026</h3>
          {todaySessions.length === 0 ? (
            <EmptyState variant="empty" title="Không có buổi học" message="Hôm nay không có buổi học nào" compact />
          ) : (
            <div className="space-y-2">
              {todaySessions.map(s => {
                const room = getRoomById(s.roomId);
                const stCfg = SESSION_STATUS_CONFIG[s.status];
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors" onClick={() => setDetailSession(s)}>
                    <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{s.title}</p>
                      <div className="flex items-center gap-3 text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.startTime}–{s.endTime}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {room?.name}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {s.enrolledCount}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full shrink-0" style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                    {(s.status === "scheduled" || s.status === "in_progress") && (
                      <button onClick={e => { e.stopPropagation(); onSelectSession(s.id); }}
                        className="px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer shrink-0" style={{ fontSize: "11px", fontWeight: 500 }}>
                        Điểm danh
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Session Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-[#990803]/5 to-transparent rounded-t-2xl">
              <div className="flex items-center gap-2">
                {editingSession ? <Edit className="w-5 h-5 text-[#990803]" /> : <Plus className="w-5 h-5 text-[#990803]" />}
                <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>{editingSession ? "Chỉnh sửa buổi học" : "Tạo buổi học mới"}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-secondary rounded-lg cursor-pointer"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Tiêu đề buổi học <span className="text-red-500">*</span></label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="VD: Leadership Workshop" className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Khóa học</label>
                  <input type="text" value={form.courseName} onChange={e => setForm(p => ({ ...p, courseName: e.target.value }))}
                    placeholder="VD: Kỹ năng Lãnh đạo" className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
                </div>
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Giảng viên <span className="text-red-500">*</span></label>
                  <input type="text" value={form.instructorName} onChange={e => setForm(p => ({ ...p, instructorName: e.target.value }))}
                    placeholder="VD: TS. Nguyễn Văn A" className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Phòng học</label>
                  <select value={form.roomId} onChange={e => setForm(p => ({ ...p, roomId: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none cursor-pointer" style={{ fontSize: "13px" }}>
                    {CLASSROOMS.map(r => <option key={r.id} value={r.id}>{r.name} ({r.capacity} chỗ)</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Ngày</label>
                  <select value={form.dayOfWeek} onChange={e => setForm(p => ({ ...p, dayOfWeek: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none cursor-pointer" style={{ fontSize: "13px" }}>
                    {DAY_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Bắt đầu</label>
                  <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
                </div>
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Kết thúc</label>
                  <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
                </div>
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Số chỗ</label>
                  <input type="number" value={form.maxCapacity} onChange={e => setForm(p => ({ ...p, maxCapacity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Đơn vị</label>
                  <input type="text" value={form.subsidiary} onChange={e => setForm(p => ({ ...p, subsidiary: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
                </div>
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Màu</label>
                  <div className="flex gap-1.5 mt-1">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                        className={`w-6 h-6 rounded-lg cursor-pointer ${form.color === c ? "ring-2 ring-offset-1 ring-[#990803] scale-110" : ""}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Ghi chú</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Ghi chú thêm..." className="w-full p-3 bg-input-background rounded-lg border border-border focus:outline-none" rows={2} style={{ fontSize: "13px", resize: "vertical" }} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
                <Check className="w-4 h-4" /> {editingSession ? "Cập nhật" : "Tạo buổi học"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}