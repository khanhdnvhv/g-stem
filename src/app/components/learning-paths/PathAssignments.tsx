import { useState } from "react";
import {
  Users, Building2, UserCheck, Briefcase, Plus, Search, Filter,
  ChevronDown, Clock, CheckCircle2, AlertCircle, MoreVertical,
  Send, Calendar, Target, Route, Edit3, Trash2, X, Eye,
} from "lucide-react";
import { mockAssignments, mockPathsFull } from "./mock-data";
import { SUBSIDIARIES, DEPARTMENTS } from "../mock-data";
import type { PathAssignment } from "./types";

const ASSIGN_TYPE_CONFIG: Record<string, { label: string; icon: typeof Users; color: string }> = {
  department: { label: "Phòng ban", icon: Briefcase, color: "#2e86de" },
  subsidiary: { label: "Đơn vị", icon: Building2, color: "#27ae60" },
  individual: { label: "Cá nhân", icon: UserCheck, color: "#8b5cf6" },
  position: { label: "Vị trí", icon: Users, color: "#f59e0b" },
};

export function PathAssignments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    pathId: "",
    assignType: "department" as "department" | "subsidiary" | "individual" | "position",
    targetName: "",
    deadline: "",
  });
  const [createdCount, setCreatedCount] = useState(0);

  const filtered = mockAssignments.filter(a => {
    const ms = search.toLowerCase();
    const matchSearch = !ms || a.pathTitle.toLowerCase().includes(ms) || a.assignedTo.name.toLowerCase().includes(ms);
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalEnrolled = filtered.reduce((s, a) => s + a.enrolledCount, 0);
  const totalCompleted = filtered.reduce((s, a) => s + a.completedCount, 0);
  const overallRate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Phân công Hoạt động", value: filtered.filter(a => a.status === "active").length, icon: Send, color: "#990803" },
          { label: "Tổng Ghi danh", value: totalEnrolled.toLocaleString(), icon: Users, color: "#2e86de" },
          { label: "Đã Hoàn thành", value: totalCompleted.toLocaleString(), icon: CheckCircle2, color: "#27ae60" },
          { label: "Tỷ lệ TB", value: `${overallRate}%`, icon: Target, color: "#c8a84e" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{s.label}</span>
            </div>
            <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 700 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Tìm kiếm phân công..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              style={{ fontSize: "13px" }} />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors shrink-0 cursor-pointer"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Tạo Phân công
          </button>
        </div>
      </div>

      {/* Assignment Cards */}
      <div className="space-y-3">
        {filtered.map(a => {
          const typeConfig = ASSIGN_TYPE_CONFIG[a.assignedTo.type];
          const pct = a.enrolledCount > 0 ? Math.round((a.completedCount / a.enrolledCount) * 100) : 0;
          const isOverdue = new Date(a.deadline) < new Date() && a.status === "active";
          const daysLeft = Math.ceil((new Date(a.deadline).getTime() - Date.now()) / 86400000);

          return (
            <div key={a.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${typeConfig.color}10` }}>
                  <typeConfig.icon className="w-6 h-6" style={{ color: typeConfig.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{a.pathTitle}</h4>
                        {a.status === "active" && (
                          <span className="px-2 py-0.5 rounded bg-green-50 text-green-700" style={{ fontSize: "10px", fontWeight: 500 }}>Đang hoạt động</span>
                        )}
                        {isOverdue && (
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700" style={{ fontSize: "10px", fontWeight: 500 }}>Quá hạn</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground" style={{ fontSize: "12px" }}>
                        <span className="flex items-center gap-1">
                          <typeConfig.icon className="w-3.5 h-3.5" />
                          {typeConfig.label}: <span className="text-foreground" style={{ fontWeight: 500 }}>{a.assignedTo.name}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Deadline: {a.deadline}
                        </span>
                        {daysLeft > 0 && !isOverdue && (
                          <span className={`${daysLeft <= 30 ? "text-yellow-600" : "text-muted-foreground"}`}>
                            Còn {daysLeft} ngày
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { import("sonner").then(m => m.toast.info(`Xem chi tiết phân công: ${a.employeeName}`)); }} className="p-1.5 hover:bg-secondary rounded-lg transition-colors cursor-pointer">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => { import("sonner").then(m => m.toast.info(`Chỉnh sửa phân công: ${a.employeeName}`)); }} className="p-1.5 hover:bg-secondary rounded-lg transition-colors cursor-pointer">
                        <Edit3 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-3 grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Ghi danh</span>
                        <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{a.enrolledCount}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#2e86de]" style={{ width: "100%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Hoàn thành</span>
                        <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{a.completedCount}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#27ae60]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Tỷ lệ</span>
                        <span className={`${pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-600"}`}
                          style={{ fontSize: "12px", fontWeight: 600 }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#990803] to-[#c8a84e]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                      Phân công bởi: <span className="text-foreground">{a.assignedBy}</span> • {a.assignedDate}
                    </span>
                    <div className="flex gap-1.5">
                      <button onClick={() => { import("sonner").then(m => m.toast.info(`Đã gửi nhắc nhở cho: ${a.assignedTo.name}`)); }} className="px-2.5 py-1 bg-secondary text-foreground rounded hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "11px" }}>
                        Nhắc nhở
                      </button>
                      <button onClick={() => { import("sonner").then(m => m.toast.success(`Đang xuất báo cáo: ${a.pathTitle}`)); }} className="px-2.5 py-1 bg-secondary text-foreground rounded hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "11px" }}>
                        Xuất báo cáo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>Tạo Phân công Mới</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 hover:bg-secondary rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-foreground block mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Chọn Lộ trình</label>
                <select value={newAssignment.pathId} onChange={e => setNewAssignment(p => ({ ...p, pathId: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
                  <option value="">-- Chọn lộ trình --</option>
                  {mockPathsFull.filter(p => p.status === "active").map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-foreground block mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Loại Phân công</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(ASSIGN_TYPE_CONFIG) as [string, typeof ASSIGN_TYPE_CONFIG[string]][]).map(([key, cfg]) => (
                    <button key={key} onClick={() => setNewAssignment(p => ({ ...p, assignType: key as any }))}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${newAssignment.assignType === key ? "border-[#990803] bg-[#990803]/5" : "border-border hover:border-[#990803]/30"}`}>
                      <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} />
                      <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{cfg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-foreground block mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Đối tượng</label>
                {newAssignment.assignType === "subsidiary" ? (
                  <select value={newAssignment.targetName} onChange={e => setNewAssignment(p => ({ ...p, targetName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
                    <option value="">-- Chọn đơn vị --</option>
                    {SUBSIDIARIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : newAssignment.assignType === "department" ? (
                  <select value={newAssignment.targetName} onChange={e => setNewAssignment(p => ({ ...p, targetName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
                    <option value="">-- Chọn phòng ban --</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : (
                  <input type="text" value={newAssignment.targetName}
                    onChange={e => setNewAssignment(p => ({ ...p, targetName: e.target.value }))}
                    placeholder={newAssignment.assignType === "individual" ? "Nhập tên nhân viên..." : "Nhập vị trí..."}
                    className="w-full px-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    style={{ fontSize: "13px" }} />
                )}
              </div>

              <div>
                <label className="text-foreground block mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>Hạn hoàn thành</label>
                <input type="date" value={newAssignment.deadline}
                  onChange={e => setNewAssignment(p => ({ ...p, deadline: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  style={{ fontSize: "13px" }} />
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-border">
              <button onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2.5 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                style={{ fontSize: "13px", fontWeight: 500 }}>Hủy</button>
              <button onClick={() => { setShowCreateModal(false); setCreatedCount(prev => prev + 1); import("sonner").then(m => m.toast.success("Đã tạo phân công mới thành công!")); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <Send className="w-4 h-4" /> Phân công
              </button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Send className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="mt-3 text-foreground" style={{ fontSize: "15px", fontWeight: 500 }}>Chưa có phân công nào</p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>Tạo phân công mới để bắt đầu</p>
        </div>
      )}
    </div>
  );
}