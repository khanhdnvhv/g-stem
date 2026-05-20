import { useState, useMemo } from "react";
import {
  ArrowLeft, Search, CheckCircle, XCircle, Clock,
  Users, Download, MapPin, User,
  Check, QrCode, Edit, X,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { useConfirm } from "../ConfirmDialog";
import { EmptyState } from "../EmptyState";
import { toast } from "@/app/lib/toast";
import {
  TRAINING_SESSIONS, SESSION_STATUS_CONFIG, ATTENDANCE_STATUS_CONFIG,
  getRoomById, getSessionAttendees,
  type TrainingSession, type AttendanceStatus, type Attendee,
} from "./mock-data";

interface AttendanceTrackerProps {
  sessionId: string;
  onBack: () => void;
}

export function AttendanceTracker({ sessionId, onBack }: AttendanceTrackerProps) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const role = user?.role || "learner";
  const isAdmin = role === "admin";
  const isInstructor = role === "instructor";
  const canManage = isAdmin || isInstructor;

  const session = TRAINING_SESSIONS.find(s => s.id === sessionId);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | "all">("all");
  const [attendees, setAttendees] = useState<Attendee[]>(() => getSessionAttendees(sessionId));
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showQR, setShowQR] = useState(false);

  const room = session ? getRoomById(session.roomId) : undefined;
  const stCfg = session ? SESSION_STATUS_CONFIG[session.status] : undefined;

  const filtered = useMemo(() => {
    return attendees.filter(a => {
      if (search) {
        const q = search.toLowerCase();
        if (!a.name.toLowerCase().includes(q) && !a.department.toLowerCase().includes(q) && !a.subsidiary.toLowerCase().includes(q)) return false;
      }
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      return true;
    });
  }, [attendees, search, filterStatus]);

  const statusCounts = attendees.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const attendanceRate = attendees.length > 0
    ? Math.round(((statusCounts["present"] || 0) + (statusCounts["late"] || 0)) / attendees.length * 100)
    : 0;

  const updateStatus = (attendeeId: string, newStatus: AttendanceStatus) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    setAttendees(prev => prev.map(a => a.id === attendeeId ? {
      ...a,
      status: newStatus,
      checkInTime: (newStatus === "present" || newStatus === "late") ? (a.checkInTime || timeStr) : undefined,
    } : a));
  };

  const markAllPresent = async () => {
    const absentCount = attendees.filter(a => a.status !== "present").length;
    if (absentCount === 0) { toast.info("Tất cả đã có mặt"); return; }
    const ok = await confirm({
      title: "Điểm danh tất cả",
      message: `Đánh dấu tất cả ${attendees.length} học viên là "Có mặt"?`,
      confirmLabel: "Điểm danh tất cả",
      variant: "info",
    });
    if (ok) {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      setAttendees(prev => prev.map(a => ({ ...a, status: "present" as AttendanceStatus, checkInTime: a.checkInTime || timeStr })));
      toast.success("Đã điểm danh tất cả!");
    }
  };

  const markAllAbsent = async () => {
    const ok = await confirm({
      title: "Đánh dấu tất cả vắng",
      message: `Đánh dấu tất cả ${attendees.length} học viên là "Vắng"?`,
      confirmLabel: "Xác nhận",
      variant: "warning",
    });
    if (ok) {
      setAttendees(prev => prev.map(a => ({ ...a, status: "absent" as AttendanceStatus, checkInTime: undefined })));
      toast.success("Đã đánh dấu tất cả vắng");
    }
  };

  const saveNote = (attendeeId: string) => {
    setAttendees(prev => prev.map(a => a.id === attendeeId ? { ...a, notes: noteText || undefined } : a));
    setEditingNote(null);
    toast.success("Đã lưu ghi chú");
  };

  const exportAttendance = () => {
    toast.success("Đang xuất bảng điểm danh...");
  };

  if (!session) return null;

  return (
    <div className="space-y-4">
      {/* Session header */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-start gap-3">
          <button onClick={onBack} className="p-2 rounded-lg border border-border hover:bg-secondary cursor-pointer mt-0.5">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div className="w-1.5 h-14 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: session.color }} />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>{session.title}</h2>
              {stCfg && <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground flex-wrap" style={{ fontSize: "11px" }}>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.date} • {session.startTime}–{session.endTime}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {room?.name}</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {session.instructorName}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {attendees.length} học viên</span>
            </div>
            {session.notes && <p className="text-muted-foreground/50 mt-1 italic" style={{ fontSize: "11px" }}>💬 {session.notes}</p>}
          </div>
          {canManage && (
            <button onClick={() => setShowQR(true)} className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg hover:bg-secondary cursor-pointer shrink-0" style={{ fontSize: "12px" }}>
              <QrCode className="w-4 h-4 text-muted-foreground" /> QR Check-in
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-card rounded-xl border border-border p-3.5">
          <p style={{ fontSize: "24px", fontWeight: 700, color: attendanceRate >= 80 ? "#16a34a" : attendanceRate >= 60 ? "#f59e0b" : "#dc2626" }}>{attendanceRate}%</p>
          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Tỷ lệ có mặt</p>
        </div>
        {(Object.keys(ATTENDANCE_STATUS_CONFIG) as AttendanceStatus[]).map(st => {
          const cfg = ATTENDANCE_STATUS_CONFIG[st];
          const count = statusCounts[st] || 0;
          return (
            <button key={st} onClick={() => setFilterStatus(filterStatus === st ? "all" : st)}
              className={`bg-card rounded-xl border p-3.5 text-left cursor-pointer transition-all ${filterStatus === st ? "border-[#990803] shadow-sm" : "border-border hover:border-border/80"}`}>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: "14px" }}>{cfg.icon}</span>
                <p style={{ fontSize: "20px", fontWeight: 700, color: cfg.color }}>{count}</p>
              </div>
              <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Attendance distribution bar */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-foreground mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>Phân bố Điểm danh</h3>
        <AttendanceBar counts={statusCounts} total={attendees.length} />
      </div>

      {/* Attendees table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm học viên..."
              className="w-full pl-9 pr-3 py-2 bg-input-background rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
          </div>
          {canManage && (
            <>
              <button onClick={markAllPresent} className="px-3 py-2 bg-[#16a34a] text-white rounded-lg hover:bg-[#16a34a]/90 cursor-pointer flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
                <CheckCircle className="w-3.5 h-3.5" /> Tất cả có mặt
              </button>
              <button onClick={markAllAbsent} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 cursor-pointer flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
                <XCircle className="w-3.5 h-3.5" /> Tất cả vắng
              </button>
            </>
          )}
          <button onClick={exportAttendance} className="px-3 py-2 border border-border rounded-lg text-muted-foreground hover:bg-secondary cursor-pointer flex items-center gap-1.5" style={{ fontSize: "12px" }}>
            <Download className="w-3.5 h-3.5" /> Xuất Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>STT</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>HỌC VIÊN</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>PHÒNG BAN</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>ĐƠN VỊ</th>
                <th className="text-center px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>TRẠNG THÁI</th>
                <th className="text-center px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>GIỜ VÀO</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>GHI CHÚ</th>
                {canManage && <th className="text-center px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>HÀNH ĐỘNG</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((att, idx) => {
                const atCfg = ATTENDANCE_STATUS_CONFIG[att.status];
                const isEditingThisNote = editingNote === att.id;
                return (
                  <tr key={att.id} className="border-b border-border/30 hover:bg-secondary/10 transition-colors">
                    <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "12px" }}>{idx + 1}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-muted-foreground" style={{ fontSize: "9px", fontWeight: 700 }}>
                          {att.name.split(" ").map(w => w[0]).slice(-2).join("")}
                        </div>
                        <span className="text-foreground" style={{ fontSize: "12.5px", fontWeight: 500 }}>{att.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground" style={{ fontSize: "12px" }}>{att.department}</td>
                    <td className="px-3 py-2.5 text-muted-foreground" style={{ fontSize: "12px" }}>{att.subsidiary}</td>
                    <td className="text-center px-3 py-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: atCfg.color, backgroundColor: atCfg.bg }}>
                        {atCfg.icon} {atCfg.label}
                      </span>
                    </td>
                    <td className="text-center px-3 py-2.5 text-muted-foreground" style={{ fontSize: "12px" }}>{att.checkInTime || "—"}</td>
                    <td className="px-3 py-2.5">
                      {isEditingThisNote ? (
                        <div className="flex items-center gap-1">
                          <input type="text" value={noteText} onChange={e => setNoteText(e.target.value)}
                            className="px-2 py-1 bg-input-background rounded border border-border focus:outline-none flex-1 min-w-[100px]" style={{ fontSize: "11px" }}
                            placeholder="Ghi chú..." autoFocus onKeyDown={e => { if (e.key === "Enter") saveNote(att.id); if (e.key === "Escape") setEditingNote(null); }} />
                          <button onClick={() => saveNote(att.id)} className="p-1 rounded hover:bg-secondary cursor-pointer"><Check className="w-3 h-3 text-[#16a34a]" /></button>
                          <button onClick={() => setEditingNote(null)} className="p-1 rounded hover:bg-secondary cursor-pointer"><X className="w-3 h-3 text-muted-foreground" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 group/note">
                          <span className="text-muted-foreground/60" style={{ fontSize: "11px" }}>{att.notes || "—"}</span>
                          {canManage && (
                            <button onClick={() => { setEditingNote(att.id); setNoteText(att.notes || ""); }}
                              className="p-0.5 rounded hover:bg-secondary cursor-pointer opacity-0 group-hover/note:opacity-100 transition-opacity">
                              <Edit className="w-3 h-3 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    {canManage && (
                      <td className="text-center px-3 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          {(["present", "late", "absent", "excused"] as AttendanceStatus[]).map(st => {
                            const c = ATTENDANCE_STATUS_CONFIG[st];
                            const isActive = att.status === st;
                            return (
                              <button key={st} onClick={() => updateStatus(att.id, st)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all ${isActive ? "ring-2 ring-offset-1" : "opacity-30 hover:opacity-70"}`}
                                style={{ backgroundColor: isActive ? c.bg : "transparent", color: c.color, ringColor: isActive ? c.color : "transparent" }}
                                title={c.label}>
                                <span style={{ fontSize: "11px" }}>{c.icon}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8">
            <EmptyState variant={search ? "search" : "empty"} title="Không tìm thấy học viên" message={search ? `Không có kết quả cho "${search}"` : "Chưa có học viên nào"} compact />
          </div>
        )}

        <div className="px-4 py-2.5 border-t border-border bg-secondary/10 flex items-center justify-between">
          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{filtered.length}/{attendees.length} học viên</span>
          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
            Có mặt: {(statusCounts["present"] || 0) + (statusCounts["late"] || 0)} • Vắng: {statusCounts["absent"] || 0} • Phép: {statusCounts["excused"] || 0}
          </span>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg cursor-pointer">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <QrCode className="w-10 h-10 text-[#990803] mx-auto mb-3" />
            <h3 className="text-foreground mb-1" style={{ fontSize: "16px", fontWeight: 600 }}>QR Check-in</h3>
            <p className="text-muted-foreground mb-4" style={{ fontSize: "12px" }}>{session.title}</p>

            {/* Mock QR code */}
            <div className="w-48 h-48 mx-auto bg-white border-2 border-border rounded-xl p-3 mb-4">
              <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-[2px]">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="rounded-[1px]" style={{
                    backgroundColor: [0,1,2,3,4,5,6,7,8,15,16,23,24,31,32,39,40,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,
                      9,10,14,17,22,25,30,33,38,41,46].includes(i)
                      ? "#990803"
                      : Math.random() > 0.5 ? "#990803" : "transparent",
                  }} />
                ))}
              </div>
            </div>

            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
              Quét mã QR để điểm danh • {session.date} • {session.startTime}–{session.endTime}
            </p>
            <p className="text-muted-foreground/50 mt-1" style={{ fontSize: "10px" }}>Mã hết hạn sau buổi học</p>

            <button onClick={() => { setShowQR(false); toast.success("Đã sao chép link check-in"); }}
              className="mt-4 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer w-full" style={{ fontSize: "13px", fontWeight: 500 }}>
              Sao chép link check-in
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Attendance Distribution Bar ───
function AttendanceBar({ counts, total }: { counts: Record<string, number>; total: number }) {
  const statuses: AttendanceStatus[] = ["present", "late", "excused", "absent"];
  return (
    <div>
      <div className="flex rounded-lg overflow-hidden h-7">
        {statuses.map(st => {
          const count = counts[st] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          if (pct === 0) return null;
          const cfg = ATTENDANCE_STATUS_CONFIG[st];
          return (
            <div key={st} className="flex items-center justify-center transition-all relative group"
              style={{ width: `${pct}%`, backgroundColor: cfg.color, opacity: 0.75 }}>
              {pct > 10 && <span className="text-white" style={{ fontSize: "10px", fontWeight: 700 }}>{count} ({Math.round(pct)}%)</span>}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-2">
        {statuses.map(st => {
          const count = counts[st] || 0;
          if (count === 0) return null;
          const cfg = ATTENDANCE_STATUS_CONFIG[st];
          return (
            <div key={st} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: cfg.color, opacity: 0.75 }} />
              <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{cfg.label}: {count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}