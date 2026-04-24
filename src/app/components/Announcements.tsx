import { useState } from "react";
import {
  Megaphone,
  Pin,
  Search,
  Filter,
  Eye,
  Paperclip,
  AlertTriangle,
  Info,
  Wrench,
  Trophy,
  FileText,
  Calendar,
  Users,
  ChevronDown,
  X,
  Bell,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { mockAnnouncements } from "./mock-data";
import type { Announcement } from "./mock-data";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const priorityConfig: Record<Announcement["priority"], { label: string; color: string; bg: string }> = {
  high: { label: "Quan trọng", color: "#e74c3c", bg: "#e74c3c10" },
  medium: { label: "Bình thường", color: "#f39c12", bg: "#f39c1210" },
  low: { label: "Thấp", color: "#27ae60", bg: "#27ae6010" },
};

const categoryConfig: Record<Announcement["category"], { label: string; icon: typeof Info; color: string }> = {
  policy: { label: "Chính sách", icon: FileText, color: "#990803" },
  event: { label: "Sự kiện", icon: Calendar, color: "#2e86de" },
  update: { label: "Cập nhật", icon: Info, color: "#c8a84e" },
  achievement: { label: "Thành tích", icon: Trophy, color: "#27ae60" },
  maintenance: { label: "Bảo trì", icon: Wrench, color: "#f39c12" },
};

export function Announcements() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [readState, setReadState] = useState<Record<string, boolean>>(
    Object.fromEntries(mockAnnouncements.map((a) => [a.id, a.isRead]))
  );

  const filtered = mockAnnouncements
    .filter((a) => {
      const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === "all" || a.category === selectedCategory;
      const matchPriority = selectedPriority === "all" || a.priority === selectedPriority;
      return matchSearch && matchCategory && matchPriority;
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });

  const unreadCount = Object.values(readState).filter((v) => !v).length;
  const totalAnnouncements = mockAnnouncements.length;
  const pinnedCount = mockAnnouncements.filter((a) => a.isPinned).length;

  const handleOpenAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setReadState((prev) => ({ ...prev, [announcement.id]: true }));
  };

  const markAllAsRead = () => {
    setReadState(Object.fromEntries(mockAnnouncements.map((a) => [a.id, true])));
    toast.success("Đã đánh dấu tất cả thông báo đã đọc");
  };

  const isAdmin = user?.legacyRole === "admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-foreground">Thông báo Nội bộ</h1>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
            Cập nhật tin tức, chính sách và sự kiện từ tập đoàn
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg hover:bg-secondary transition-colors shrink-0"
            style={{ fontSize: "14px" }}
          >
            <CheckCircle2 className="w-4 h-4" /> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng thông báo", value: totalAnnouncements, icon: Megaphone, color: "#990803" },
          { label: "Chưa đọc", value: unreadCount, icon: Bell, color: "#e74c3c" },
          { label: "Đã ghim", value: pinnedCount, icon: Pin, color: "#c8a84e" },
          { label: "Tháng này", value: mockAnnouncements.filter((a) => new Date(a.publishDate).getMonth() === 2).length, icon: Calendar, color: "#2e86de" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}10` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="mt-3" style={{ fontSize: "24px", fontWeight: 700 }}>{stat.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-card rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:outline-none"
            style={{ fontSize: "13px" }}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2.5 bg-card rounded-lg border border-border text-foreground"
          style={{ fontSize: "13px" }}
        >
          <option value="all">Tất cả danh mục</option>
          {Object.entries(categoryConfig).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2.5 bg-card rounded-lg border border-border text-foreground"
          style={{ fontSize: "13px" }}
        >
          <option value="all">Tất cả mức độ</option>
          <option value="high">Quan trọng</option>
          <option value="medium">Bình thường</option>
          <option value="low">Thấp</option>
        </select>
      </div>

      {/* Announcements list */}
      <div className="space-y-3">
        {filtered.map((announcement) => {
          const priority = priorityConfig[announcement.priority];
          const category = categoryConfig[announcement.category];
          const CatIcon = category.icon;
          const isUnread = !readState[announcement.id];

          return (
            <div
              key={announcement.id}
              className={`bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer ${
                isUnread ? "border-l-4" : ""
              }`}
              style={isUnread ? { borderLeftColor: "#990803" } : {}}
              onClick={() => handleOpenAnnouncement(announcement)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${category.color}10` }}
                >
                  <CatIcon className="w-5 h-5" style={{ color: category.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Tags row */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{ fontSize: "11px", fontWeight: 500, color: category.color, backgroundColor: `${category.color}10` }}
                    >
                      {category.label}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded"
                      style={{ fontSize: "11px", fontWeight: 500, color: priority.color, backgroundColor: priority.bg }}
                    >
                      {priority.label}
                    </span>
                    {announcement.isPinned && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#c8a84e]/15 text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 500 }}>
                        <Pin className="w-3 h-3" /> Ghim
                      </span>
                    )}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#990803]" />
                    )}
                  </div>

                  {/* Title & summary */}
                  <h4 className="text-foreground">{announcement.title}</h4>
                  <p className="text-muted-foreground mt-0.5 line-clamp-2" style={{ fontSize: "13px" }}>
                    {announcement.summary}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center gap-4 mt-2.5 flex-wrap">
                    <span className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>
                      {announcement.author}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}>
                      <Clock className="w-3 h-3" />
                      {new Date(announcement.publishDate).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}>
                      <Users className="w-3 h-3" /> {announcement.targetAudience}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}>
                      <Eye className="w-3 h-3" /> {announcement.readCount} đã đọc
                    </span>
                    {announcement.attachments > 0 && (
                      <span className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px" }}>
                        <Paperclip className="w-3 h-3" /> {announcement.attachments} file
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Megaphone className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground" style={{ fontSize: "14px" }}>Không tìm thấy thông báo nào</p>
        </div>
      )}

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAnnouncement(null)}>
          <div className="bg-card rounded-xl shadow-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2.5 py-1 rounded"
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: categoryConfig[selectedAnnouncement.category].color,
                      backgroundColor: `${categoryConfig[selectedAnnouncement.category].color}10`,
                    }}
                  >
                    {categoryConfig[selectedAnnouncement.category].label}
                  </span>
                  <span
                    className="px-2.5 py-1 rounded"
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: priorityConfig[selectedAnnouncement.priority].color,
                      backgroundColor: priorityConfig[selectedAnnouncement.priority].bg,
                    }}
                  >
                    {priorityConfig[selectedAnnouncement.priority].label}
                  </span>
                </div>
                <button onClick={() => setSelectedAnnouncement(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <h2 className="text-foreground">{selectedAnnouncement.title}</h2>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#990803] flex items-center justify-center text-white" style={{ fontSize: "11px", fontWeight: 600 }}>
                    {selectedAnnouncement.author.split(" ").slice(-1)[0][0]}{selectedAnnouncement.author.split(" ").slice(-2)[0]?.[0] || ""}
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 500 }}>{selectedAnnouncement.author}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{selectedAnnouncement.authorRole}</p>
                  </div>
                </div>
                <span className="text-muted-foreground" style={{ fontSize: "12px" }}>
                  {new Date(selectedAnnouncement.publishDate).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="whitespace-pre-wrap text-foreground/90" style={{ fontSize: "14px", lineHeight: "1.8" }}>
                {selectedAnnouncement.content}
              </div>

              {/* Meta info */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Đối tượng</p>
                    <p style={{ fontSize: "13px", fontWeight: 500 }}>{selectedAnnouncement.targetAudience}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Đã đọc</p>
                    <p style={{ fontSize: "13px", fontWeight: 500 }}>{selectedAnnouncement.readCount} người</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Hiệu lực đến</p>
                    <p style={{ fontSize: "13px", fontWeight: 500 }}>
                      {new Date(selectedAnnouncement.expiryDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Đính kèm</p>
                    <p style={{ fontSize: "13px", fontWeight: 500 }}>
                      {selectedAnnouncement.attachments > 0 ? `${selectedAnnouncement.attachments} file` : "Không có"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attachments preview */}
              {selectedAnnouncement.attachments > 0 && (
                <div className="mt-4 space-y-2">
                  {Array.from({ length: selectedAnnouncement.attachments }).map((_, i) => (
                    <div key={i} onClick={() => { import("sonner").then(m => m.toast.success("Đang tải file đính kèm...")); }} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                      <FileText className="w-5 h-5 text-[#990803]" />
                      <div className="flex-1">
                        <p style={{ fontSize: "13px", fontWeight: 500 }}>
                          {selectedAnnouncement.title.replace(/[^a-zA-ZÀ-ỹ\s]/g, "").trim().substring(0, 30)}_{i + 1}.pdf
                        </p>
                        <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{(Math.random() * 5 + 0.5).toFixed(1)} MB</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); import("sonner").then(m => m.toast.success("Đang tải file đính kèm...")); }} className="text-[#990803] hover:underline cursor-pointer" style={{ fontSize: "12px" }}>Tải xuống</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button onClick={() => setSelectedAnnouncement(null)} className="px-5 py-2.5 border border-border rounded-lg hover:bg-secondary" style={{ fontSize: "14px" }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}