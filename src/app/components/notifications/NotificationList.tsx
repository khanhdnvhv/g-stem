import { useState, useMemo } from "react";
import {
  Search, Bell, BellOff, Check, CheckCheck, Trash2, Filter,
  PenTool, ClipboardCheck, BookOpen, Award, GitPullRequest,
  Heart, MessageCircle, Settings, Users, Trophy,
  ChevronDown, ExternalLink, Clock, AlertTriangle, Star,
  X, Archive,
} from "lucide-react";
import { Link } from "react-router";
import {
  MOCK_NOTIFICATIONS, CATEGORY_CONFIG, PRIORITY_CONFIG,
  type Notification, type NotificationCategory, type NotificationPriority,
  getCategoryList,
} from "./mock-data";
import { useConfirm } from "../ConfirmDialog";
import { EmptyState } from "../EmptyState";

// Category → Icon mapping
const CATEGORY_ICONS: Record<NotificationCategory, React.ElementType> = {
  grading: PenTool,
  exam: ClipboardCheck,
  course: BookOpen,
  certificate: Award,
  workflow: GitPullRequest,
  mentoring: Heart,
  forum: MessageCircle,
  system: Settings,
  hr: Users,
  achievement: Trophy,
};

interface NotificationListProps {
  isAdmin: boolean;
}

export function NotificationList({ isAdmin }: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<NotificationCategory | "all">("all");
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | "all">("all");
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const confirm = useConfirm();

  // Filtered list
  const filtered = useMemo(() => {
    return notifications.filter(n => {
      if (search) {
        const q = search.toLowerCase();
        if (!n.title.toLowerCase().includes(q) && !n.message.toLowerCase().includes(q)) return false;
      }
      if (filterCategory !== "all" && n.category !== filterCategory) return false;
      if (filterPriority !== "all" && n.priority !== filterPriority) return false;
      if (filterRead === "unread" && n.isRead) return false;
      if (filterRead === "read" && !n.isRead) return false;
      return true;
    });
  }, [notifications, search, filterCategory, filterPriority, filterRead]);

  // Stats
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const unreadByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    notifications.filter(n => !n.isRead).forEach(n => {
      map[n.category] = (map[n.category] || 0) + 1;
    });
    return map;
  }, [notifications]);

  // Actions
  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setSelectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const batchMarkRead = () => {
    setNotifications(prev => prev.map(n => selectedIds.has(n.id) ? { ...n, isRead: true } : n));
    setSelectedIds(new Set());
  };

  const batchDelete = async () => {
    const count = selectedIds.size;
    const ok = await confirm({
      title: `Xóa ${count} thông báo?`,
      message: `Bạn có chắc muốn xóa ${count} thông báo đã chọn? Hành động này không thể hoàn tác.`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setNotifications(prev => prev.filter(n => !selectedIds.has(n.id)));
      setSelectedIds(new Set());
      import("sonner").then(m => m.toast.success(`Đã xóa ${count} thông báo`));
    }
  };

  return (
    <div className="space-y-3">
      {/* Top bar: search + actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm thông báo..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
            style={{ fontSize: "13px" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 border rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${showFilters ? "border-[#990803] bg-[#990803]/5 text-[#990803]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            <Filter className="w-3.5 h-3.5" /> Bộ lọc
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-3 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center gap-1.5"
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              <CheckCheck className="w-3.5 h-3.5" /> Đọc tất cả ({unreadCount})
            </button>
          )}
        </div>
      </div>

      {/* Filters row */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none"
            style={{ fontSize: "12px" }}
          >
            <option value="all">Tất cả danh mục</option>
            {getCategoryList().map(cat => (
              <option key={cat} value={cat}>
                {CATEGORY_CONFIG[cat].label} {unreadByCategory[cat] ? `(${unreadByCategory[cat]})` : ""}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none"
            style={{ fontSize: "12px" }}
          >
            <option value="all">Tất cả độ ưu tiên</option>
            {(["urgent", "high", "normal", "low"] as NotificationPriority[]).map(p => (
              <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
            ))}
          </select>

          {/* Read filter */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {([
              { key: "all", label: "Tất cả" },
              { key: "unread", label: "Chưa đọc" },
              { key: "read", label: "Đã đọc" },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setFilterRead(f.key)}
                className={`px-2.5 py-1.5 cursor-pointer transition-colors ${filterRead === f.key ? "bg-[#990803] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                style={{ fontSize: "11px", fontWeight: filterRead === f.key ? 600 : 400 }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Clear filters */}
          {(filterCategory !== "all" || filterPriority !== "all" || filterRead !== "all") && (
            <button
              onClick={() => { setFilterCategory("all"); setFilterPriority("all"); setFilterRead("all"); }}
              className="px-2 py-1.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              style={{ fontSize: "11px" }}
            >
              <X className="w-3.5 h-3.5 inline mr-0.5" /> Xóa lọc
            </button>
          )}
        </div>
      )}

      {/* Batch actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-2.5 bg-[#990803]/5 border border-[#990803]/20 rounded-xl">
          <span className="text-[#990803]" style={{ fontSize: "12px", fontWeight: 600 }}>
            {selectedIds.size} đã chọn
          </span>
          <button onClick={batchMarkRead} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer flex items-center gap-1" style={{ fontSize: "11px" }}>
            <Check className="w-3 h-3" /> Đánh dấu đã đọc
          </button>
          <button onClick={batchDelete} className="px-2.5 py-1 bg-white border border-red-200 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer flex items-center gap-1" style={{ fontSize: "11px" }}>
            <Trash2 className="w-3 h-3" /> Xóa
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-gray-400 hover:text-gray-600 cursor-pointer" style={{ fontSize: "11px" }}>
            Bỏ chọn
          </button>
        </div>
      )}

      {/* Category chips (quick filter) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setFilterCategory("all")}
          className={`px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors ${filterCategory === "all" ? "bg-[#990803] text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"}`}
          style={{ fontSize: "11.5px", fontWeight: filterCategory === "all" ? 600 : 400 }}
        >
          Tất cả ({notifications.length})
        </button>
        {getCategoryList().map(cat => {
          const cfg = CATEGORY_CONFIG[cat];
          const count = notifications.filter(n => n.category === cat).length;
          const unread = unreadByCategory[cat] || 0;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${filterCategory === cat ? "text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"}`}
              style={{
                fontSize: "11.5px",
                fontWeight: filterCategory === cat ? 600 : 400,
                backgroundColor: filterCategory === cat ? cfg.color : undefined,
              }}
            >
              {cfg.label}
              {unread > 0 && (
                <span
                  className="px-1 py-0.5 rounded-full"
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    backgroundColor: filterCategory === cat ? "rgba(255,255,255,0.3)" : cfg.bg,
                    color: filterCategory === cat ? "white" : cfg.color,
                  }}
                >
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      <div className="space-y-1">
        {filtered.map(notif => {
          const catCfg = CATEGORY_CONFIG[notif.category];
          const priCfg = PRIORITY_CONFIG[notif.priority];
          const CatIcon = CATEGORY_ICONS[notif.category];
          const isSelected = selectedIds.has(notif.id);

          return (
            <div
              key={notif.id}
              className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                notif.isRead
                  ? "bg-white border-gray-100 hover:border-gray-200"
                  : "bg-blue-50/30 border-blue-100 hover:border-blue-200"
              } ${isSelected ? "ring-2 ring-[#990803]/30" : ""}`}
              onClick={() => !notif.isRead && markRead(notif.id)}
            >
              {/* Checkbox */}
              <div
                className="mt-0.5 shrink-0"
                onClick={e => { e.stopPropagation(); toggleSelect(notif.id); }}
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected ? "bg-[#990803] border-[#990803]" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
              </div>

              {/* Icon */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: catCfg.bg }}
              >
                <CatIcon className="w-4.5 h-4.5" style={{ color: catCfg.color, width: "18px", height: "18px" }} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  {/* Unread dot */}
                  {!notif.isRead && <div className="w-2 h-2 rounded-full bg-[#990803] shrink-0" />}

                  <span
                    className={notif.isRead ? "text-gray-600" : "text-gray-800"}
                    style={{ fontSize: "13.5px", fontWeight: notif.isRead ? 500 : 600 }}
                  >
                    {notif.title}
                  </span>

                  {/* Priority badge */}
                  {notif.priority !== "normal" && (
                    <span
                      className="px-1.5 py-0.5 rounded-full"
                      style={{
                        fontSize: "9px",
                        fontWeight: 600,
                        color: priCfg.color,
                        backgroundColor: priCfg.bg,
                      }}
                    >
                      {priCfg.label}
                    </span>
                  )}

                  {/* Category chip */}
                  <span
                    className="px-1.5 py-0.5 rounded-full"
                    style={{ fontSize: "9px", fontWeight: 500, color: catCfg.color, backgroundColor: catCfg.bg }}
                  >
                    {catCfg.label}
                  </span>
                </div>

                <p className="text-gray-500 line-clamp-2" style={{ fontSize: "12.5px", lineHeight: 1.5 }}>
                  {notif.message}
                </p>

                <div className="flex items-center gap-3 mt-1.5">
                  {/* Sender */}
                  {notif.sender && (
                    <span className="text-gray-400 flex items-center gap-1" style={{ fontSize: "11px" }}>
                      {notif.senderAvatar ? (
                        <span
                          className="w-4 h-4 rounded-full text-white flex items-center justify-center"
                          style={{ fontSize: "7px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}
                        >
                          {notif.senderAvatar}
                        </span>
                      ) : (
                        <Settings className="w-3 h-3" />
                      )}
                      {notif.sender}
                    </span>
                  )}

                  {/* Timestamp */}
                  <span className="text-gray-300 flex items-center gap-1" style={{ fontSize: "11px" }}>
                    <Clock className="w-3 h-3" /> {notif.timestamp}
                  </span>
                </div>
              </div>

              {/* Right: action + menu */}
              <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {notif.actionUrl && (
                  <Link
                    to={notif.actionUrl}
                    className="px-2.5 py-1 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors flex items-center gap-1"
                    style={{ fontSize: "11px", fontWeight: 500 }}
                    onClick={e => e.stopPropagation()}
                  >
                    {notif.actionLabel || "Xem"} <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                {!notif.isRead && (
                  <button
                    onClick={e => { e.stopPropagation(); markRead(notif.id); }}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    title="Đánh dấu đã đọc"
                  >
                    <Check className="w-3 h-3 text-gray-400" />
                  </button>
                )}
                <button
                  onClick={e => { e.stopPropagation(); deleteNotification(notif.id); }}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-red-50 cursor-pointer"
                  title="Xóa"
                >
                  <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <EmptyState
            variant={search || filterCategory !== "all" || filterPriority !== "all" || filterRead !== "all" ? "search" : "empty"}
            title={search || filterCategory !== "all" ? "Không tìm thấy thông báo nào phù hợp" : "Không có thông báo nào"}
            message={search ? `Không có kết quả cho "${search}"` : "Thử thay đổi bộ lọc để xem thông báo"}
            action={(search || filterCategory !== "all") ? { label: "Xóa bộ lọc", onClick: () => { setSearch(""); setFilterCategory("all"); setFilterPriority("all"); setFilterRead("all"); } } : undefined}
          />
        )}
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="text-center text-gray-300 py-2" style={{ fontSize: "11px" }}>
          Hiển thị {filtered.length}/{notifications.length} thông báo
          {unreadCount > 0 && ` • ${unreadCount} chưa đọc`}
        </div>
      )}
    </div>
  );
}