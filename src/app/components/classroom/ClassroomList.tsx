import React, { useState, useMemo } from "react";
import {
  Search, Users, MapPin,
  LayoutGrid, List, Plus, Edit, Trash2,
  X, Check, ArrowLeft, Wrench, Eye,
  CheckCircle2, Clock,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { useConfirm } from "../ConfirmDialog";
import { EmptyState } from "../EmptyState";
import { toast } from "@/app/lib/toast";
import {
  CLASSROOMS, ROOM_TYPE_CONFIG, ROOM_STATUS_CONFIG,
  TRAINING_SESSIONS, EQUIPMENT_CATALOG, getRoomStats,
  type Classroom, type RoomType, type RoomStatus, type Equipment,
} from "./mock-data";

interface ClassroomListProps {
  onSelectSession: (sessionId: string) => void;
}

export function ClassroomList({ onSelectSession }: ClassroomListProps) {
  const { user } = useAuth();
  const confirm = useConfirm();
  const role = user?.role || "learner";
  const isAdmin = role === "admin";
  const isInstructor = role === "instructor";

  const [rooms, setRooms] = React.useState<Classroom[]>(CLASSROOMS);
  const [sessions] = React.useState(TRAINING_SESSIONS);
  const [search, setSearch] = React.useState("");
  const [filterType, setFilterType] = React.useState<RoomType | "all">("all");
  const [filterStatus, setFilterStatus] = React.useState<RoomStatus | "all">("all");
  const [filterSub, setFilterSub] = React.useState("all");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [selectedRoom, setSelectedRoom] = React.useState<Classroom | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState<Classroom | null>(null);

  // Form state
  const emptyForm = {
    name: "", type: "physical" as RoomType, location: "", subsidiary: "VP Tập đoàn",
    floor: "", capacity: 30, description: "", imageColor: "#990803",
    equipmentIds: [] as string[], hourlyRate: 0,
  };
  const [form, setForm] = React.useState(emptyForm);

  const subsidiaries = React.useMemo(() => [...new Set(rooms.map(r => r.subsidiary))], [rooms]);

  const stats = React.useMemo(() => ({
    total: rooms.length,
    physical: rooms.filter(r => r.type === "physical").length,
    virtual: rooms.filter(r => r.type === "virtual").length,
    hybrid: rooms.filter(r => r.type === "hybrid").length,
    available: rooms.filter(r => r.status === "available").length,
    totalCapacity: rooms.reduce((s, r) => s + r.capacity, 0),
    sessionsThisWeek: sessions.filter(s => s.status !== "cancelled").length,
    totalEnrolled: sessions.filter(s => s.status !== "cancelled").reduce((s, t) => s + t.enrolledCount, 0),
  }), [rooms, sessions]);

  const filtered = React.useMemo(() => {
    return rooms.filter(r => {
      if (search) {
        const q = search.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.location.toLowerCase().includes(q) && !r.subsidiary.toLowerCase().includes(q)) return false;
      }
      if (filterType !== "all" && r.type !== filterType) return false;
      if (filterStatus !== "all" && r.status !== filterStatus) return false;
      if (filterSub !== "all" && r.subsidiary !== filterSub) return false;
      return true;
    });
  }, [rooms, search, filterType, filterStatus, filterSub]);

  // ─── Actions ───
  const openCreate = () => {
    setEditingRoom(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (room: Classroom) => {
    setEditingRoom(room);
    setForm({
      name: room.name, type: room.type, location: room.location,
      subsidiary: room.subsidiary, floor: room.floor, capacity: room.capacity,
      description: room.description, imageColor: room.imageColor,
      equipmentIds: room.equipment.map(e => e.id), hourlyRate: room.hourlyRate || 0,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Vui lòng nhập tên phòng"); return; }
    const eqs = EQUIPMENT_CATALOG.filter(e => form.equipmentIds.includes(e.id));
    if (editingRoom) {
      setRooms(prev => prev.map(r => r.id === editingRoom.id ? {
        ...r, name: form.name, type: form.type, location: form.location,
        subsidiary: form.subsidiary, floor: form.floor, capacity: form.capacity,
        description: form.description, imageColor: form.imageColor,
        equipment: eqs, hourlyRate: form.hourlyRate || undefined,
      } : r));
      if (selectedRoom?.id === editingRoom.id) {
        setSelectedRoom(prev => prev ? {
          ...prev, name: form.name, type: form.type, location: form.location,
          subsidiary: form.subsidiary, floor: form.floor, capacity: form.capacity,
          description: form.description, imageColor: form.imageColor,
          equipment: eqs, hourlyRate: form.hourlyRate || undefined,
        } : null);
      }
      toast.success("Đã cập nhật phòng học");
    } else {
      const newRoom: Classroom = {
        id: `R_${Date.now()}`, name: form.name, type: form.type,
        location: form.location, subsidiary: form.subsidiary, floor: form.floor,
        capacity: form.capacity, equipment: eqs, status: "available",
        imageColor: form.imageColor, description: form.description,
        hourlyRate: form.hourlyRate || undefined,
      };
      setRooms(prev => [newRoom, ...prev]);
      toast.success("Đã tạo phòng học mới");
    }
    setShowModal(false);
  };

  const handleDelete = async (room: Classroom) => {
    const roomSessions = sessions.filter(s => s.roomId === room.id && s.status !== "cancelled");
    const ok = await confirm({
      title: "Xóa phòng học",
      message: `Bạn có chắc muốn xóa "${room.name}"?${roomSessions.length > 0 ? ` Phòng này đang có ${roomSessions.length} buổi học trong tuần.` : ""}`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setRooms(prev => prev.filter(r => r.id !== room.id));
      if (selectedRoom?.id === room.id) setSelectedRoom(null);
      toast.success("Đã xóa phòng học");
    }
  };

  const toggleStatus = (room: Classroom, newStatus: RoomStatus) => {
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: newStatus } : r));
    if (selectedRoom?.id === room.id) setSelectedRoom(prev => prev ? { ...prev, status: newStatus } : null);
    toast.success(`Đã chuyển trạng thái sang "${ROOM_STATUS_CONFIG[newStatus].label}"`);
  };

  const COLORS = ["#990803", "#c8a84e", "#2563eb", "#16a34a", "#7c3aed", "#ea580c", "#0891b2", "#d946ef", "#65a30d", "#f97316"];

  // ─── Detail View ───
  if (selectedRoom) {
    const tCfg = ROOM_TYPE_CONFIG[selectedRoom.type];
    const sCfg = ROOM_STATUS_CONFIG[selectedRoom.status];
    const roomSessions = sessions.filter(s => s.roomId === selectedRoom.id && s.status !== "cancelled");
    const upcomingSessions = roomSessions.filter(s => s.status === "scheduled" || s.status === "in_progress");
    const completedSessions = roomSessions.filter(s => s.status === "completed");
    const utilization = roomSessions.length > 0 ? Math.round((roomSessions.reduce((s, rs) => {
      const sh = parseInt(rs.startTime); const eh = parseInt(rs.endTime);
      return s + (eh - sh);
    }, 0) / (7 * 10)) * 100) : 0;

    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedRoom(null)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" style={{ fontSize: "13px" }}>
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách phòng
        </button>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="h-2" style={{ backgroundColor: selectedRoom.imageColor }} />
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: selectedRoom.imageColor, fontSize: "24px" }}>
                {tCfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-foreground">{selectedRoom.name}</h2>
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: sCfg.color, backgroundColor: sCfg.bg }}>{sCfg.label}</span>
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 500, color: tCfg.color, backgroundColor: tCfg.color + "12" }}>{tCfg.icon} {tCfg.label}</span>
                </div>
                <p className="text-muted-foreground" style={{ fontSize: "14px" }}>{selectedRoom.description}</p>
              </div>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
              {[
                { label: "Vị trí", value: selectedRoom.location },
                { label: "Tầng", value: selectedRoom.floor },
                { label: "Sức chứa", value: `${selectedRoom.capacity} chỗ` },
                { label: "Đơn vị", value: selectedRoom.subsidiary },
                { label: "Buổi học tuần này", value: `${roomSessions.length} buổi` },
                { label: "Sắp tới", value: `${upcomingSessions.length} buổi` },
                { label: "Hoàn thành", value: `${completedSessions.length} buổi` },
                { label: "Tỷ lệ sử dụng", value: `${utilization}%` },
              ].map(m => (
                <div key={m.label} className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{m.label}</p>
                  <p className="text-foreground mt-0.5" style={{ fontSize: "12px", fontWeight: 500 }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Equipment */}
            <div className="mt-5">
              <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Thiết bị</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedRoom.equipment.map(eq => (
                  <span key={eq.id} className="px-2.5 py-1 bg-secondary rounded-lg text-foreground flex items-center gap-1.5" style={{ fontSize: "11px" }}>
                    <span>{eq.icon}</span> {eq.name}
                  </span>
                ))}
                {selectedRoom.equipment.length === 0 && <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Không có thiết bị</span>}
              </div>
            </div>

            {/* Utilization bar */}
            <div className="mt-5 p-4 bg-secondary/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>Tỷ lệ sử dụng tuần này</p>
                <span style={{ fontSize: "14px", fontWeight: 700, color: utilization >= 70 ? "#16a34a" : utilization >= 40 ? "#c8a84e" : "#6b7280" }}>{utilization}%</span>
              </div>
              <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${utilization}%`, backgroundColor: utilization >= 70 ? "#16a34a" : utilization >= 40 ? "#c8a84e" : "#6b7280" }} />
              </div>
            </div>

            {/* Actions */}
            {(isAdmin || isInstructor) && (
              <div className="flex flex-wrap gap-2 mt-5">
                {isAdmin && (
                  <button onClick={() => openEdit(selectedRoom)} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-secondary cursor-pointer" style={{ fontSize: "13px" }}>
                    <Edit className="w-4 h-4" /> Chỉnh sửa
                  </button>
                )}
                {isAdmin && selectedRoom.status !== "maintenance" && (
                  <button onClick={() => toggleStatus(selectedRoom, "maintenance")} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-secondary cursor-pointer text-amber-600" style={{ fontSize: "13px" }}>
                    <Wrench className="w-4 h-4" /> Bảo trì
                  </button>
                )}
                {isAdmin && selectedRoom.status === "maintenance" && (
                  <button onClick={() => toggleStatus(selectedRoom, "available")} className="flex items-center gap-2 px-4 py-2.5 bg-[#16a34a] text-white rounded-lg hover:bg-[#16a34a]/90 cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
                    <CheckCircle2 className="w-4 h-4" /> Mở lại
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => handleDelete(selectedRoom)} className="flex items-center gap-2 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer" style={{ fontSize: "13px" }}>
                    <Trash2 className="w-4 h-4" /> Xóa
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sessions in this room */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Buổi học tại phòng này tuần này ({roomSessions.length})</h3>
          {roomSessions.length === 0 ? (
            <EmptyState variant="empty" title="Chưa có buổi học" message="Phòng này chưa có buổi học nào trong tuần" compact />
          ) : (
            <div className="space-y-2">
              {roomSessions.map(s => {
                const stCfg = { scheduled: { label: "Đã lên lịch", color: "#2563eb", bg: "#2563eb12" }, in_progress: { label: "Đang diễn ra", color: "#16a34a", bg: "#16a34a12" }, completed: { label: "Hoàn thành", color: "#64748b", bg: "#64748b12" }, cancelled: { label: "Đã hủy", color: "#dc2626", bg: "#dc262612" } }[s.status];
                return (
                  <div key={s.id} onClick={() => onSelectSession(s.id)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 cursor-pointer transition-colors">
                    <div className="w-1.5 h-10 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 500 }}>{s.title}</p>
                      <div className="flex items-center gap-3 text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.date} • {s.startTime}–{s.endTime}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {s.enrolledCount}/{s.maxCapacity}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full shrink-0" style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── List View ───
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Tổng phòng", value: stats.total, color: "#990803", sub: `${stats.physical} vật lý • ${stats.virtual} ảo • ${stats.hybrid} hybrid` },
          { label: "Sẵn sàng", value: stats.available, color: "#16a34a", sub: `/${stats.total} phòng` },
          { label: "Buổi học tuần này", value: stats.sessionsThisWeek, color: "#2563eb", sub: `${stats.totalEnrolled.toLocaleString()} học viên` },
          { label: "Tổng sức chứa", value: stats.totalCapacity.toLocaleString(), color: "#c8a84e", sub: "chỗ ngồi" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-3.5">
            <p style={{ fontSize: "22px", fontWeight: 700, color: s.color }}>{s.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>{s.label}</p>
            <p className="text-muted-foreground/50 mt-0.5" style={{ fontSize: "10px" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm phòng học, phòng họp..."
            className="w-full pl-9 pr-3 py-2 bg-input-background rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value as any)}
          className="px-3 py-2 bg-input-background rounded-lg border-0 text-foreground cursor-pointer focus:outline-none" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả loại</option>
          {(Object.keys(ROOM_TYPE_CONFIG) as RoomType[]).map(t => (
            <option key={t} value={t}>{ROOM_TYPE_CONFIG[t].icon} {ROOM_TYPE_CONFIG[t].label}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 bg-input-background rounded-lg border-0 text-foreground cursor-pointer focus:outline-none" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả trạng thái</option>
          {(Object.keys(ROOM_STATUS_CONFIG) as RoomStatus[]).map(s => (
            <option key={s} value={s}>{ROOM_STATUS_CONFIG[s].label}</option>
          ))}
        </select>
        <select value={filterSub} onChange={e => setFilterSub(e.target.value)}
          className="px-3 py-2 bg-input-background rounded-lg border-0 text-foreground cursor-pointer focus:outline-none" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả đơn vị</option>
          {subsidiaries.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex items-center border border-border rounded-lg overflow-hidden ml-auto">
          <button onClick={() => setViewMode("grid")} className={`p-2 cursor-pointer ${viewMode === "grid" ? "bg-[#990803] text-white" : "text-muted-foreground hover:bg-secondary"}`}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("list")} className={`p-2 cursor-pointer ${viewMode === "list" ? "bg-[#990803] text-white" : "text-muted-foreground hover:bg-secondary"}`}><List className="w-4 h-4" /></button>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Thêm phòng
          </button>
        )}
        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{filtered.length} phòng</span>
      </div>

      {/* Rooms */}
      {filtered.length === 0 ? (
        <EmptyState variant={search ? "search" : "empty"} title="Không tìm thấy phòng học" message={search ? `Không có kết quả cho "${search}"` : "Chưa có phòng học nào"}
          action={search ? { label: "Xóa bộ lọc", onClick: () => { setSearch(""); setFilterType("all"); setFilterStatus("all"); setFilterSub("all"); } } : isAdmin ? { label: "Thêm phòng mới", onClick: openCreate } : undefined} />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map(room => (
            <RoomCard key={room.id} room={room} sessions={sessions} isAdmin={isAdmin}
              onView={() => setSelectedRoom(room)} onEdit={() => openEdit(room)}
              onDelete={() => handleDelete(room)} onToggleStatus={toggleStatus}
              onSelectSession={onSelectSession} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>PHÒNG HỌC</th>
                <th className="text-center px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>LOẠI</th>
                <th className="text-left px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>VỊ TRÍ</th>
                <th className="text-center px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>SỨC CHỨA</th>
                <th className="text-center px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>TRẠNG THÁI</th>
                <th className="text-center px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>THIẾT BỊ</th>
                <th className="text-center px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>BUỔI HỌC</th>
                {isAdmin && <th className="text-center px-3 py-2.5 text-muted-foreground" style={{ fontSize: "10px", fontWeight: 600 }}>HÀNH ĐỘNG</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(room => {
                const tCfg = ROOM_TYPE_CONFIG[room.type];
                const sCfg = ROOM_STATUS_CONFIG[room.status];
                const sessionCount = sessions.filter(s => s.roomId === room.id && s.status !== "cancelled").length;
                return (
                  <tr key={room.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setSelectedRoom(room)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: room.imageColor, fontSize: "11px", fontWeight: 700 }}>
                          {tCfg.icon}
                        </div>
                        <div>
                          <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{room.name}</p>
                          <p className="text-muted-foreground/50" style={{ fontSize: "10px" }}>{room.subsidiary}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 500, color: tCfg.color, backgroundColor: tCfg.color + "12" }}>
                        {tCfg.label.split(" ").slice(-1)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground" style={{ fontSize: "12px" }}>{room.location}</td>
                    <td className="text-center px-3 py-3 text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{room.capacity}</td>
                    <td className="text-center px-3 py-3">
                      <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: sCfg.color, backgroundColor: sCfg.bg }}>{sCfg.label}</span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <div className="flex justify-center gap-0.5 flex-wrap">
                        {room.equipment.slice(0, 4).map(eq => <span key={eq.id} title={eq.name} style={{ fontSize: "12px" }}>{eq.icon}</span>)}
                        {room.equipment.length > 4 && <span className="text-muted-foreground" style={{ fontSize: "10px" }}>+{room.equipment.length - 4}</span>}
                      </div>
                    </td>
                    <td className="text-center px-3 py-3 text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{sessionCount}</td>
                    {isAdmin && (
                      <td className="text-center px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={e => { e.stopPropagation(); openEdit(room); }} className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer text-muted-foreground"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(room); }} className="p-1.5 rounded-lg hover:bg-red-50 cursor-pointer text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-[#990803]/5 to-transparent rounded-t-2xl">
              <div className="flex items-center gap-2">
                {editingRoom ? <Edit className="w-5 h-5 text-[#990803]" /> : <Plus className="w-5 h-5 text-[#990803]" />}
                <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>{editingRoom ? "Chỉnh sửa phòng học" : "Thêm phòng học mới"}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-secondary rounded-lg cursor-pointer"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Tên phòng <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="VD: Phòng Đào tạo B1" className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:ring-2 focus:ring-[#990803]/20 focus:outline-none" style={{ fontSize: "13px" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Loại phòng</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as RoomType }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none cursor-pointer" style={{ fontSize: "13px" }}>
                    {(Object.keys(ROOM_TYPE_CONFIG) as RoomType[]).map(t => <option key={t} value={t}>{ROOM_TYPE_CONFIG[t].icon} {ROOM_TYPE_CONFIG[t].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Sức chứa</label>
                  <input type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
                </div>
              </div>
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Vị trí</label>
                <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  placeholder="VD: Tòa nhà VP Tập đoàn, Tầng 5" className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Đơn vị</label>
                  <input type="text" value={form.subsidiary} onChange={e => setForm(p => ({ ...p, subsidiary: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
                </div>
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Tầng</label>
                  <input type="text" value={form.floor} onChange={e => setForm(p => ({ ...p, floor: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border border-border focus:outline-none" style={{ fontSize: "13px" }} />
                </div>
              </div>
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Mô tả</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Mô tả phòng học..." className="w-full p-3 bg-input-background rounded-lg border border-border focus:outline-none" rows={2} style={{ fontSize: "13px", resize: "vertical" }} />
              </div>
              {/* Equipment */}
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Thiết bị</label>
                <div className="flex flex-wrap gap-1.5">
                  {EQUIPMENT_CATALOG.map(eq => {
                    const selected = form.equipmentIds.includes(eq.id);
                    return (
                      <button key={eq.id} onClick={() => setForm(p => ({
                        ...p, equipmentIds: selected ? p.equipmentIds.filter(id => id !== eq.id) : [...p.equipmentIds, eq.id]
                      }))}
                        className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${selected ? "bg-[#990803]/10 text-[#990803] border border-[#990803]/20" : "bg-secondary text-muted-foreground border border-transparent hover:border-border"}`}
                        style={{ fontSize: "11px" }}>
                        {eq.icon} {eq.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Color */}
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>Màu nhận diện</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setForm(p => ({ ...p, imageColor: c }))}
                      className={`w-7 h-7 rounded-lg cursor-pointer transition-all ${form.imageColor === c ? "ring-2 ring-offset-2 ring-[#990803] scale-110" : "hover:scale-105"}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-secondary rounded-lg hover:bg-secondary/80 cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}>
                <Check className="w-4 h-4" /> {editingRoom ? "Cập nhật" : "Tạo phòng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Room Card ───
function RoomCard({ room, sessions, isAdmin, onView, onEdit, onDelete, onToggleStatus, onSelectSession }: {
  room: Classroom; sessions: typeof TRAINING_SESSIONS; isAdmin: boolean;
  onView: () => void; onEdit: () => void; onDelete: () => void;
  onToggleStatus: (room: Classroom, status: RoomStatus) => void;
  onSelectSession: (id: string) => void;
}) {
  const tCfg = ROOM_TYPE_CONFIG[room.type];
  const sCfg = ROOM_STATUS_CONFIG[room.status];
  const roomSessions = sessions.filter(s => s.roomId === room.id && s.status !== "cancelled");

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
      <div className="h-2" style={{ backgroundColor: room.imageColor }} />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onView}>
            <span style={{ fontSize: "20px" }}>{tCfg.icon}</span>
            <div>
              <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{room.name}</p>
              <p className="text-muted-foreground/50" style={{ fontSize: "11px" }}>{room.subsidiary}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="px-2 py-0.5 rounded-full shrink-0" style={{ fontSize: "9px", fontWeight: 600, color: sCfg.color, backgroundColor: sCfg.bg }}>{sCfg.label}</span>
            {isAdmin && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                <button onClick={e => { e.stopPropagation(); onEdit(); }} className="p-1 rounded hover:bg-secondary cursor-pointer"><Edit className="w-3 h-3 text-muted-foreground" /></button>
                <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1 rounded hover:bg-red-50 cursor-pointer"><Trash2 className="w-3 h-3 text-red-400" /></button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-muted-foreground mb-3" style={{ fontSize: "11px" }}>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {room.floor}</span>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {room.capacity} chỗ</span>
          {room.hourlyRate && <span className="text-[#c8a84e]">{(room.hourlyRate / 1000).toFixed(0)}k/h</span>}
        </div>

        {/* Equipment */}
        <div className="flex flex-wrap gap-1 mb-3">
          {room.equipment.slice(0, 5).map(eq => (
            <span key={eq.id} className="px-1.5 py-0.5 bg-secondary rounded text-muted-foreground border border-border/50" style={{ fontSize: "10px" }}>
              {eq.icon} {eq.name}
            </span>
          ))}
          {room.equipment.length > 5 && <span className="text-muted-foreground" style={{ fontSize: "10px" }}>+{room.equipment.length - 5}</span>}
        </div>

        {/* Status action */}
        {isAdmin && room.status === "maintenance" && (
          <button onClick={() => onToggleStatus(room, "available")}
            className="w-full py-1.5 bg-[#16a34a]/10 text-[#16a34a] rounded-lg hover:bg-[#16a34a]/20 cursor-pointer mb-2" style={{ fontSize: "11px", fontWeight: 500 }}>
            ✓ Mở lại sử dụng
          </button>
        )}

        {/* Upcoming sessions */}
        {roomSessions.length > 0 && (
          <div className="border-t border-border pt-2 mt-2">
            <p className="text-muted-foreground mb-1.5" style={{ fontSize: "9px", fontWeight: 600, textTransform: "uppercase" }}>BUỔI HỌC TUẦN NÀY</p>
            <div className="space-y-1">
              {roomSessions.slice(0, 2).map(s => (
                <div key={s.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-secondary/30 hover:bg-secondary/60 cursor-pointer transition-colors" onClick={() => onSelectSession(s.id)}>
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: s.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate" style={{ fontSize: "11px", fontWeight: 500 }}>{s.title}</p>
                    <p className="text-muted-foreground/50" style={{ fontSize: "9px" }}>{s.date} • {s.startTime}-{s.endTime}</p>
                  </div>
                  <span className="text-muted-foreground" style={{ fontSize: "10px" }}>{s.enrolledCount}/{s.maxCapacity}</span>
                </div>
              ))}
              {roomSessions.length > 2 && <p className="text-muted-foreground/50 text-center" style={{ fontSize: "9px" }}>+{roomSessions.length - 2} buổi khác</p>}
            </div>
          </div>
        )}

        {/* View detail button */}
        <button onClick={onView} className="w-full mt-2 py-1.5 text-[#990803] bg-[#990803]/5 rounded-lg hover:bg-[#990803]/10 cursor-pointer flex items-center justify-center gap-1.5" style={{ fontSize: "11px", fontWeight: 500 }}>
          <Eye className="w-3 h-3" /> Xem chi tiết
        </button>
      </div>
    </div>
  );
}
