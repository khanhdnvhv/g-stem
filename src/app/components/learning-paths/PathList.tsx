import { useState, useRef, useEffect } from "react";
import {
  Search, Filter, ChevronDown, BookOpen, Users, Clock, Star,
  MoreVertical, Edit3, Copy, Trash2, Eye, Archive, CheckCircle2,
  AlertCircle, Route, ArrowUpDown, Grid3X3, List, X, Save, RotateCcw,
  Calendar, Tag, MapPin, Award, Target, Layers,
} from "lucide-react";
import { mockPathsFull } from "./mock-data";
import { mockCourses } from "../mock-data";
import type { LearningPathFull } from "./types";
import { useConfirm } from "../ConfirmDialog";
import { EmptyState } from "../EmptyState";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Hoạt động", color: "#27ae60", bg: "#27ae6015" },
  draft: { label: "Bản nháp", color: "#f59e0b", bg: "#f59e0b15" },
  archived: { label: "Lưu trữ", color: "#6b7280", bg: "#6b728015" },
};

const LEVEL_COLORS: Record<string, string> = {
  "Cơ bản": "#2e86de",
  "Trung cấp": "#f59e0b",
  "Nâng cao": "#e74c3c",
  "Chuyên gia": "#8b5cf6",
};

export function PathList({ onSelectPath }: { onSelectPath?: (path: LearningPathFull) => void }) {
  const [paths, setPaths] = useState<LearningPathFull[]>(() => [...mockPathsFull]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [mandatoryFilter, setMandatoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"title" | "enrolledCount" | "completionRate" | "updatedAt">("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Modal states
  const [detailPath, setDetailPath] = useState<LearningPathFull | null>(null);
  const [editPath, setEditPath] = useState<LearningPathFull | null>(null);
  const [editForm, setEditForm] = useState<Partial<LearningPathFull>>({});
  const confirm = useConfirm();

  // Toast state
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "info" | "error" }[]>([]);
  const toastId = useRef(0);

  // Close action menu on outside click
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionMenuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActionMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [actionMenuOpen]);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // Actions
  const handleDuplicate = (path: LearningPathFull) => {
    const newPath: LearningPathFull = {
      ...path,
      id: `LP${Date.now()}`,
      title: `${path.title} (Bản sao)`,
      status: "draft",
      enrolledCount: 0,
      completionRate: 0,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setPaths(prev => [newPath, ...prev]);
    setActionMenuOpen(null);
    showToast(`Đã nhân bản "${path.title}" thành công`);
  };

  const handleArchive = (path: LearningPathFull) => {
    const newStatus = path.status === "archived" ? "active" : "archived";
    setPaths(prev => prev.map(p => p.id === path.id ? { ...p, status: newStatus, updatedAt: new Date().toISOString().split("T")[0] } : p));
    setActionMenuOpen(null);
    showToast(newStatus === "archived" ? `Đã lưu trữ "${path.title}"` : `Đã khôi phục "${path.title}"`);
  };

  const handleDelete = async (path: LearningPathFull) => {
    const extraMsg = path.enrolledCount > 0
      ? `\n\nLộ trình này có ${path.enrolledCount} học viên đang tham gia.`
      : "";
    const ok = await confirm({
      title: "Xác nhận xóa lộ trình",
      message: `Bạn có chắc chắn muốn xóa lộ trình "${path.title}"? Hành động này không thể hoàn tác.${extraMsg}`,
      confirmLabel: "Xóa lộ trình",
      variant: "danger",
    });
    if (ok) {
      setPaths(prev => prev.filter(p => p.id !== path.id));
      setSelectedPaths(prev => { const n = new Set(prev); n.delete(path.id); return n; });
      showToast(`Đã xóa "${path.title}"`, "info");
    }
  };

  const handleBulkArchive = () => {
    setPaths(prev => prev.map(p => selectedPaths.has(p.id) ? { ...p, status: "archived" as const, updatedAt: new Date().toISOString().split("T")[0] } : p));
    showToast(`Đã lưu trữ ${selectedPaths.size} lộ trình`);
    setSelectedPaths(new Set());
  };

  const handleBulkDelete = () => {
    setPaths(prev => prev.filter(p => !selectedPaths.has(p.id)));
    showToast(`Đã xóa ${selectedPaths.size} lộ trình`, "info");
    setSelectedPaths(new Set());
  };

  const handleOpenDetail = (path: LearningPathFull) => {
    setDetailPath(path);
    setActionMenuOpen(null);
    onSelectPath?.(path);
  };

  const handleOpenEdit = (path: LearningPathFull) => {
    setEditPath(path);
    setEditForm({ ...path });
    setActionMenuOpen(null);
  };

  const handleSaveEdit = () => {
    if (!editPath || !editForm) return;
    setPaths(prev => prev.map(p => p.id === editPath.id ? { ...p, ...editForm, updatedAt: new Date().toISOString().split("T")[0] } as LearningPathFull : p));
    showToast(`Đã cập nhật "${editForm.title || editPath.title}"`);
    setEditPath(null);
    setEditForm({});
  };

  const filtered = paths
    .filter(p => {
      const ms = search.toLowerCase();
      const matchSearch = !ms || p.title.toLowerCase().includes(ms) || p.category.toLowerCase().includes(ms) || p.subsidiary.toLowerCase().includes(ms);
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const matchLevel = levelFilter === "all" || p.level === levelFilter;
      const matchMandatory = mandatoryFilter === "all" || (mandatoryFilter === "yes" ? p.mandatory : !p.mandatory);
      return matchSearch && matchStatus && matchLevel && matchMandatory;
    })
    .sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortBy === "title") return a.title.localeCompare(b.title) * dir;
      if (sortBy === "enrolledCount") return (a.enrolledCount - b.enrolledCount) * dir;
      if (sortBy === "completionRate") return (a.completionRate - b.completionRate) * dir;
      return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
    });

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(field); setSortDir("desc"); }
  };

  const toggleSelect = (id: string) => {
    setSelectedPaths(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPaths.size === filtered.length) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(filtered.map(p => p.id)));
    }
  };

  return (
    <div className="space-y-4">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map(toast => (
          <div key={toast.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right ${
              toast.type === "success" ? "bg-green-50 border-green-200 text-green-800" :
              toast.type === "error" ? "bg-red-50 border-red-200 text-red-800" :
              "bg-blue-50 border-blue-200 text-blue-800"
            }`}
            style={{ fontSize: "13px", fontWeight: 500, minWidth: "280px" }}>
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> :
             toast.type === "error" ? <AlertCircle className="w-4 h-4 shrink-0" /> :
             <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.message}
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-auto cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {detailPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDetailPath(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#990803] to-[#b82020] p-6 rounded-t-2xl shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-white" style={{ fontSize: "10px", fontWeight: 600, background: LEVEL_COLORS[detailPath.level] || "#6b7280" }}>
                      {detailPath.level}
                    </span>
                    <span className="px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 500, color: STATUS_CONFIG[detailPath.status].color, background: "rgba(255,255,255,0.9)" }}>
                      {STATUS_CONFIG[detailPath.status].label}
                    </span>
                    {detailPath.mandatory && (
                      <span className="px-2 py-0.5 rounded bg-[#c8a84e] text-[#990803]" style={{ fontSize: "10px", fontWeight: 600 }}>Bắt buộc</span>
                    )}
                  </div>
                  <h2 className="text-white" style={{ fontSize: "20px", fontWeight: 700 }}>{detailPath.title}</h2>
                  <p className="text-white/70 mt-1" style={{ fontSize: "13px" }}>{detailPath.subsidiary} • {detailPath.department}</p>
                </div>
                <button onClick={() => setDetailPath(null)} className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <p className="text-muted-foreground" style={{ fontSize: "13px" }}>{detailPath.description}</p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: BookOpen, label: "Khóa học", value: detailPath.totalCourses },
                  { icon: Users, label: "Học viên", value: detailPath.enrolledCount.toLocaleString() },
                  { icon: Clock, label: "Thời lượng", value: detailPath.totalDuration },
                  { icon: Star, label: "Đánh giá", value: `${detailPath.avgRating}/5` },
                ].map((s, i) => (
                  <div key={i} className="bg-secondary/50 rounded-xl p-3 text-center">
                    <s.icon className="w-4 h-4 mx-auto text-[#990803] mb-1" />
                    <p className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>{s.value}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Tỷ lệ hoàn thành trung bình</span>
                  <span className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>{detailPath.completionRate}%</span>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#990803] to-[#c8a84e] transition-all" style={{ width: `${detailPath.completionRate}%` }} />
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
                  <Layers className="w-4 h-4 inline mr-1.5" />Cột mốc ({detailPath.milestones.length})
                </h3>
                <div className="space-y-2">
                  {detailPath.milestones.map((m, i) => {
                    const milestoneCourses = m.courseIds.map(cid => mockCourses.find(c => c.id === cid)).filter(Boolean);
                    return (
                      <div key={m.id} className="p-3 bg-secondary/30 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#990803] text-white flex items-center justify-center shrink-0" style={{ fontSize: "11px", fontWeight: 700 }}>{i + 1}</div>
                          <div className="flex-1">
                            <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>{m.title}</p>
                            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{m.description}</p>
                            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10px" }}>Yêu cầu hoàn thành: {m.requiredCompletionRate}%</p>
                          </div>
                        </div>
                        {/* Courses in this milestone */}
                        {milestoneCourses.length > 0 && (
                          <div className="mt-2 ml-10 space-y-1.5">
                            {milestoneCourses.map(course => course && (
                              <div key={course.id} className="flex items-center gap-2.5 p-2 bg-card rounded-lg border border-border/50">
                                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-secondary">
                                  <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{course.title}</p>
                                  <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: "10px" }}>
                                    <span>{course.instructor}</span>
                                    <span>•</span>
                                    <span>{course.duration}</span>
                                    <span>•</span>
                                    <span>{course.totalLessons} bài</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Star className="w-3 h-3 text-[#c8a84e]" />
                                  <span className="text-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>{course.rating}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* All Courses in this path */}
              <div>
                <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
                  <BookOpen className="w-4 h-4 inline mr-1.5" />Tất cả Khóa học ({detailPath.courseIds.length})
                </h3>
                <div className="space-y-2">
                  {detailPath.courseIds.map((cid, idx) => {
                    const course = mockCourses.find(c => c.id === cid);
                    if (!course) return null;
                    return (
                      <div key={course.id} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-secondary">
                          <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{course.title}</p>
                          <div className="flex items-center gap-2 text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
                            <span>{course.instructor}</span>
                            <span>•</span>
                            <span>{course.duration}</span>
                            <span>•</span>
                            <span>{course.totalLessons} bài học</span>
                            <span>•</span>
                            <span>{course.enrolledCount} học viên</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-[#c8a84e]" />
                            <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{course.rating}</span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-white mt-1 inline-block" style={{ fontSize: "9px", fontWeight: 500, background: LEVEL_COLORS[course.level] || "#6b7280" }}>
                            {course.level}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Target, label: "Vị trí mục tiêu", value: detailPath.targetPositions.join(", ") },
                  { icon: Calendar, label: "Thời gian ước tính", value: `${detailPath.estimatedWeeks} tuần` },
                  { icon: Award, label: "Chứng chỉ", value: detailPath.certificateOnCompletion ? "Có" : "Không" },
                  { icon: Calendar, label: "Hạn hoàn thành", value: detailPath.deadline || "Không giới hạn" },
                  { icon: MapPin, label: "Người tạo", value: detailPath.createdBy },
                  { icon: Calendar, label: "Ngày tạo", value: detailPath.createdAt },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 bg-secondary/30 rounded-lg">
                    <item.icon className="w-3.5 h-3.5 text-[#990803] shrink-0" />
                    <div>
                      <p className="text-muted-foreground" style={{ fontSize: "13px" }}>{item.label}</p>
                      <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 500 }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {detailPath.tags.map(t => (
                  <span key={t} className="px-2.5 py-1 bg-secondary rounded-lg text-muted-foreground" style={{ fontSize: "11px" }}>
                    <Tag className="w-3 h-3 inline mr-1" />{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer actions - fixed at bottom */}
            <div className="flex gap-2 p-5 border-t border-border shrink-0">
              <button onClick={() => { handleOpenEdit(detailPath); setDetailPath(null); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#990803] text-white rounded-xl hover:bg-[#990803]/90 transition-colors cursor-pointer"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <Edit3 className="w-4 h-4" /> Chỉnh sửa
              </button>
              <button onClick={() => { handleDuplicate(detailPath); setDetailPath(null); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 transition-colors cursor-pointer"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <Copy className="w-4 h-4" /> Nhân bản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditPath(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-foreground" style={{ fontSize: "17px", fontWeight: 700 }}>
                <Edit3 className="w-5 h-5 inline mr-2 text-[#990803]" />Chỉnh sửa Lộ trình
              </h2>
              <button onClick={() => setEditPath(null)} className="p-1.5 rounded-lg hover:bg-secondary cursor-pointer">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-muted-foreground block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Tên lộ trình *</label>
                <input type="text" value={editForm.title || ""} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none text-foreground" style={{ fontSize: "13px" }} />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Mô tả</label>
                <textarea value={editForm.description || ""} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none text-foreground resize-none" style={{ fontSize: "13px" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Cấp độ</label>
                  <select value={editForm.level || ""} onChange={e => setEditForm(f => ({ ...f, level: e.target.value as any }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground" style={{ fontSize: "13px" }}>
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Trung cấp">Trung cấp</option>
                    <option value="Nâng cao">Nâng cao</option>
                    <option value="Chuyên gia">Chuyên gia</option>
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Trạng thái</label>
                  <select value={editForm.status || ""} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as any }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 text-foreground" style={{ fontSize: "13px" }}>
                    <option value="active">Hoạt động</option>
                    <option value="draft">Bản nháp</option>
                    <option value="archived">Lưu trữ</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Danh mục</label>
                  <input type="text" value={editForm.category || ""} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none text-foreground" style={{ fontSize: "13px" }} />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Thời gian (tuần)</label>
                  <input type="number" value={editForm.estimatedWeeks || 0} onChange={e => setEditForm(f => ({ ...f, estimatedWeeks: +e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none text-foreground" style={{ fontSize: "13px" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Đơn vị</label>
                  <input type="text" value={editForm.subsidiary || ""} onChange={e => setEditForm(f => ({ ...f, subsidiary: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none text-foreground" style={{ fontSize: "13px" }} />
                </div>
                <div>
                  <label className="text-muted-foreground block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Phòng ban</label>
                  <input type="text" value={editForm.department || ""} onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none text-foreground" style={{ fontSize: "13px" }} />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Hạn hoàn thành</label>
                <input type="date" value={editForm.deadline || ""} onChange={e => setEditForm(f => ({ ...f, deadline: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-[#990803]/20 focus:outline-none text-foreground" style={{ fontSize: "13px" }} />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editForm.mandatory || false} onChange={e => setEditForm(f => ({ ...f, mandatory: e.target.checked }))}
                    className="accent-[#990803] w-4 h-4" />
                  <span className="text-foreground" style={{ fontSize: "13px" }}>Bắt buộc</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editForm.certificateOnCompletion || false} onChange={e => setEditForm(f => ({ ...f, certificateOnCompletion: e.target.checked }))}
                    className="accent-[#990803] w-4 h-4" />
                  <span className="text-foreground" style={{ fontSize: "13px" }}>Cấp chứng chỉ khi hoàn thành</span>
                </label>
              </div>

              {/* Course Management */}
              <div>
                <label className="text-muted-foreground block mb-2" style={{ fontSize: "12px", fontWeight: 500 }}>
                  <BookOpen className="w-3.5 h-3.5 inline mr-1" />Khóa học trong lộ trình ({(editForm.courseIds || []).length})
                </label>
                {/* Current courses */}
                <div className="space-y-1.5 mb-3">
                  {(editForm.courseIds || []).map((cid, idx) => {
                    const course = mockCourses.find(c => c.id === cid);
                    if (!course) return null;
                    return (
                      <div key={cid} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                        <span className="w-5 h-5 rounded bg-[#990803] text-white flex items-center justify-center shrink-0" style={{ fontSize: "10px", fontWeight: 600 }}>{idx + 1}</span>
                        <div className="w-7 h-7 rounded overflow-hidden shrink-0 bg-secondary">
                          <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{course.title}</p>
                          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{course.instructor} • {course.duration}</p>
                        </div>
                        <button onClick={() => {
                          const newIds = (editForm.courseIds || []).filter(id => id !== cid);
                          setEditForm(f => ({ ...f, courseIds: newIds, totalCourses: newIds.length }));
                        }} className="p-1 hover:bg-red-50 rounded cursor-pointer" title="Xóa khóa học">
                          <X className="w-3.5 h-3.5 text-red-400 hover:text-red-500" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                {/* Add course */}
                {mockCourses.filter(c => !(editForm.courseIds || []).includes(c.id)).length > 0 && (
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value) {
                        const newIds = [...(editForm.courseIds || []), e.target.value];
                        setEditForm(f => ({ ...f, courseIds: newIds, totalCourses: newIds.length }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-input-background rounded-lg border-0 text-muted-foreground" style={{ fontSize: "12px" }}>
                    <option value="">+ Thêm khóa học...</option>
                    {mockCourses.filter(c => !(editForm.courseIds || []).includes(c.id)).map(c => (
                      <option key={c.id} value={c.id}>{c.title} ({c.duration})</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-border">
              <button onClick={() => setEditPath(null)}
                className="flex-1 px-4 py-2.5 bg-secondary text-foreground rounded-xl hover:bg-secondary/80 transition-colors cursor-pointer"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                Hủy
              </button>
              <button onClick={handleSaveEdit}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#990803] text-white rounded-xl hover:bg-[#990803]/90 transition-colors cursor-pointer"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <Save className="w-4 h-4" /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Filters */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" placeholder="Tìm kiếm lộ trình, danh mục, đơn vị..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
              style={{ fontSize: "13px" }}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="draft">Bản nháp</option>
            <option value="archived">Lưu trữ</option>
          </select>
          <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
            className="px-3 py-2.5 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
            <option value="all">Tất cả cấp độ</option>
            <option value="Cơ bản">Cơ bản</option>
            <option value="Trung cấp">Trung cấp</option>
            <option value="Nâng cao">Nâng cao</option>
            <option value="Chuyên gia">Chuyên gia</option>
          </select>
          <select value={mandatoryFilter} onChange={e => setMandatoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-input-background rounded-lg border-0" style={{ fontSize: "13px" }}>
            <option value="all">Bắt buộc / Tự chọn</option>
            <option value="yes">Bắt buộc</option>
            <option value="no">Tự chọn</option>
          </select>
          <div className="flex gap-1">
            <button onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-lg transition-colors cursor-pointer ${viewMode === "grid" ? "bg-[#990803] text-white" : "bg-input-background text-muted-foreground"}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("table")}
              className={`p-2.5 rounded-lg transition-colors cursor-pointer ${viewMode === "table" ? "bg-[#990803] text-white" : "bg-input-background text-muted-foreground"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
        {selectedPaths.size > 0 && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
            <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Đã chọn {selectedPaths.size} lộ trình</span>
            <button onClick={() => { import("sonner").then(m => m.toast.success(`Đang phân công ${selectedPaths.size} lộ trình cho nhân sự...`)); }} className="px-3 py-1.5 bg-[#990803] text-white rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>Phân công hàng loạt</button>
            <button onClick={handleBulkArchive} className="px-3 py-1.5 bg-secondary text-foreground rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>Lưu trữ</button>
            <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>Xóa</button>
            <button onClick={() => setSelectedPaths(new Set())} className="text-muted-foreground hover:text-foreground cursor-pointer" style={{ fontSize: "12px" }}>Bỏ chọn</button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
          Hiển thị <span className="text-foreground" style={{ fontWeight: 600 }}>{filtered.length}</span> / {paths.length} lộ trình
        </p>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground" style={{ fontSize: "12px" }}>Sắp xếp:</span>
          {(["updatedAt", "enrolledCount", "completionRate", "title"] as const).map(field => {
            const labels: Record<string, string> = { updatedAt: "Mới nhất", enrolledCount: "Học viên", completionRate: "Hoàn thành", title: "Tên" };
            return (
              <button key={field} onClick={() => toggleSort(field)}
                className={`px-2 py-1 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${sortBy === field ? "bg-secondary text-foreground" : ""}`}
                style={{ fontSize: "11px" }}>
                {labels[field]} {sortBy === field && (sortDir === "asc" ? "↑" : "↓")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(path => {
            const sc = STATUS_CONFIG[path.status];
            return (
              <div key={path.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group relative">
                {/* Selection checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <input type="checkbox" checked={selectedPaths.has(path.id)}
                    onChange={() => toggleSelect(path.id)}
                    className="w-4 h-4 rounded border-white/50 accent-[#990803] cursor-pointer" />
                </div>
                {/* Header */}
                <div className="bg-gradient-to-r from-[#990803] to-[#b82020] p-4 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-white" style={{ fontSize: "10px", fontWeight: 600, background: LEVEL_COLORS[path.level] || "#6b7280" }}>
                        {path.level}
                      </span>
                      {path.mandatory && (
                        <span className="px-2 py-0.5 rounded bg-[#c8a84e] text-[#990803]" style={{ fontSize: "10px", fontWeight: 600 }}>
                          Bắt buộc
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 500, color: sc.color, background: "rgba(255,255,255,0.9)" }}>
                      {sc.label}
                    </span>
                  </div>
                  <h3 className="text-white mt-2.5 line-clamp-2" style={{ fontSize: "15px", fontWeight: 600 }}>{path.title}</h3>
                  <p className="text-white/50 mt-1 line-clamp-1" style={{ fontSize: "11px" }}>{path.subsidiary}</p>
                </div>
                {/* Body */}
                <div className="p-4">
                  <p className="text-muted-foreground line-clamp-2 mb-3" style={{ fontSize: "12px" }}>{path.description}</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 700 }}>{path.totalCourses}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Khóa học</p>
                    </div>
                    <div className="text-center">
                      <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 700 }}>{path.enrolledCount}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Học viên</p>
                    </div>
                    <div className="text-center">
                      <p className="text-foreground" style={{ fontSize: "15px", fontWeight: 700 }}>{path.estimatedWeeks}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Tuần</p>
                    </div>
                  </div>
                  {/* Milestones */}
                  <div className="mb-3">
                    <p className="text-muted-foreground mb-1.5" style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.5px" }}>CỘT MỐC ({path.milestones.length})</p>
                    <div className="flex gap-1">
                      {path.milestones.map((m, i) => (
                        <div key={m.id} className="flex-1 h-1.5 rounded-full bg-[#990803]" style={{ opacity: 0.4 + (i / path.milestones.length) * 0.6 }} />
                      ))}
                    </div>
                  </div>
                  {/* Progress */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Hoàn thành</span>
                    <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{path.completionRate}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#990803] to-[#c8a84e]" style={{ width: `${path.completionRate}%` }} />
                  </div>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {path.tags.slice(0, 3).map(t => (
                      <span key={t} className="px-2 py-0.5 bg-secondary rounded text-muted-foreground" style={{ fontSize: "10px" }}>{t}</span>
                    ))}
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenDetail(path)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer"
                      style={{ fontSize: "12px", fontWeight: 500 }}>
                      <Eye className="w-3.5 h-3.5" /> Chi tiết
                    </button>
                    <button onClick={() => handleOpenEdit(path)}
                      className="px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                      style={{ fontSize: "12px" }}>
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <div className="relative" ref={actionMenuOpen === path.id ? menuRef : null}>
                      <button onClick={() => setActionMenuOpen(actionMenuOpen === path.id ? null : path.id)}
                        className="px-2 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                      {actionMenuOpen === path.id && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-card rounded-lg border border-border shadow-lg py-1 z-20">
                          <button onClick={() => handleDuplicate(path)}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 transition-colors cursor-pointer text-foreground"
                            style={{ fontSize: "12px" }}>
                            <Copy className="w-3.5 h-3.5" /> Nhân bản
                          </button>
                          <button onClick={() => handleArchive(path)}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 transition-colors cursor-pointer text-foreground"
                            style={{ fontSize: "12px" }}>
                            {path.status === "archived" ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                            {path.status === "archived" ? "Khôi phục" : "Lưu trữ"}
                          </button>
                          <div className="border-t border-border my-1" />
                          <button onClick={() => { handleDelete(path); setActionMenuOpen(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 transition-colors cursor-pointer text-red-500"
                            style={{ fontSize: "12px" }}>
                            <Trash2 className="w-3.5 h-3.5" /> Xóa lộ trình
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="w-10 p-3">
                    <input type="checkbox" checked={selectedPaths.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll} className="accent-[#990803] cursor-pointer" />
                  </th>
                  {[
                    { key: "title", label: "Lộ trình" },
                    { key: "level", label: "Cấp độ" },
                    { key: "status", label: "Trạng thái" },
                    { key: "enrolledCount", label: "Học viên" },
                    { key: "completionRate", label: "Hoàn thành" },
                    { key: "updatedAt", label: "Cập nhật" },
                  ].map(col => (
                    <th key={col.key}
                      className="text-left py-3 px-3 text-muted-foreground cursor-pointer hover:text-foreground"
                      style={{ fontSize: "11px", fontWeight: 500 }}
                      onClick={() => toggleSort(col.key as any)}>
                      <div className="flex items-center gap-1">
                        {col.label}
                        {sortBy === col.key && <ArrowUpDown className="w-3 h-3" />}
                      </div>
                    </th>
                  ))}
                  <th className="w-24" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(path => {
                  const sc = STATUS_CONFIG[path.status];
                  return (
                    <tr key={path.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="p-3">
                        <input type="checkbox" checked={selectedPaths.has(path.id)}
                          onChange={() => toggleSelect(path.id)} className="accent-[#990803] cursor-pointer" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#990803] to-[#b82020] flex items-center justify-center">
                            <Route className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{path.title}</p>
                            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{path.subsidiary} • {path.totalCourses} khóa</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-white" style={{ fontSize: "10px", fontWeight: 500, background: LEVEL_COLORS[path.level] }}>
                          {path.level}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 500, color: sc.color, background: sc.bg }}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{path.enrolledCount}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[#990803]" style={{ width: `${path.completionRate}%` }} />
                          </div>
                          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{path.completionRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground" style={{ fontSize: "12px" }}>{path.updatedAt}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleOpenDetail(path)}
                            className="p-1.5 hover:bg-secondary rounded transition-colors cursor-pointer" title="Chi tiết">
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <button onClick={() => handleOpenEdit(path)}
                            className="p-1.5 hover:bg-secondary rounded transition-colors cursor-pointer" title="Chỉnh sửa">
                            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                          <div className="relative" ref={actionMenuOpen === path.id ? menuRef : null}>
                            <button onClick={() => setActionMenuOpen(actionMenuOpen === path.id ? null : path.id)}
                              className="p-1.5 hover:bg-secondary rounded transition-colors cursor-pointer">
                              <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                            {actionMenuOpen === path.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-card rounded-lg border border-border shadow-lg py-1 z-20">
                                <button onClick={() => handleDuplicate(path)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 transition-colors cursor-pointer text-foreground"
                                  style={{ fontSize: "12px" }}>
                                  <Copy className="w-3.5 h-3.5" /> Nhân bản
                                </button>
                                <button onClick={() => handleArchive(path)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 transition-colors cursor-pointer text-foreground"
                                  style={{ fontSize: "12px" }}>
                                  {path.status === "archived" ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                                  {path.status === "archived" ? "Khôi phục" : "Lưu trữ"}
                                </button>
                                <div className="border-t border-border my-1" />
                                <button onClick={() => { handleDelete(path); setActionMenuOpen(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 transition-colors cursor-pointer text-red-500"
                                  style={{ fontSize: "12px" }}>
                                  <Trash2 className="w-3.5 h-3.5" /> Xóa lộ trình
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <EmptyState
          variant={search ? "search" : "empty"}
          title="Không tìm thấy lộ trình"
          message={search ? `Không có kết quả cho "${search}"` : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"}
          action={search ? { label: "Xóa bộ lọc", onClick: () => { setSearch(""); setStatusFilter("all"); setLevelFilter("all"); setMandatoryFilter("all"); } } : undefined}
        />
      )}
    </div>
  );
}