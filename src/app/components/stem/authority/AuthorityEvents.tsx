import { useState, useMemo } from "react";
import {
  CalendarDays, Plus, Search, Users, MapPin,
  CheckCircle2, Clock, CalendarCheck, XCircle, X,
} from "lucide-react";
import { SelectDown, PageHeader, KpiCard } from "./authority-ui";
import { toast } from "sonner";

const ACCENT = "#7c3aed";

type EventStatus = "upcoming" | "open" | "ended" | "cancelled";
type EventType = "stem-fair" | "workshop" | "training" | "conference" | "ceremony";

interface StemEvent {
  id:          string;
  title:       string;
  type:        EventType;
  status:      EventStatus;
  date:        string;
  location:    string;
  organizer:   string;
  audience:    string;
  capacity:    number;
  registered:  number;
  description: string;
}

const TYPE_CFG: Record<EventType, { label: string; color: string }> = {
  "stem-fair":   { label: "Ngày hội STEM",    color: "#7c3aed" },
  "workshop":    { label: "Hội thảo GD",      color: "#2563eb" },
  "training":    { label: "Tập huấn GV",      color: "#16a34a" },
  "conference":  { label: "Hội nghị",         color: "#c8a84e" },
  "ceremony":    { label: "Lễ trao giải",     color: "#dc2626" },
};

const STATUS_CFG: Record<EventStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  upcoming:  { label: "Sắp diễn ra",   color: "#2563eb", bg: "#eff6ff", icon: Clock },
  open:      { label: "Đang đăng ký",  color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2 },
  ended:     { label: "Đã kết thúc",   color: "#6b7280", bg: "#f9fafb", icon: CalendarCheck },
  cancelled: { label: "Đã hủy",        color: "#dc2626", bg: "#fef2f2", icon: XCircle },
};

const INITIAL_EVENTS: StemEvent[] = [
  {
    id: "E001", title: "Ngày hội STEM Quốc gia 2026", type: "stem-fair",
    status: "open", date: "2026-06-15", location: "Cung Văn hóa Lao động, Hà Nội",
    organizer: "Bộ GD&ĐT", audience: "Học sinh, Giáo viên, Phụ huynh toàn quốc",
    capacity: 5000, registered: 3240,
    description: "Sự kiện STEM lớn nhất năm — trưng bày dự án học sinh, thi đấu Robotics, hội thảo chuyên gia.",
  },
  {
    id: "E002", title: "Hội thảo Đổi mới Phương pháp Dạy học STEM", type: "workshop",
    status: "open", date: "2026-06-03", location: "Trường ĐH Sư phạm Hà Nội",
    organizer: "Bộ GD&ĐT phối hợp ĐH Sư phạm", audience: "Giáo viên STEM cấp THCS, THPT",
    capacity: 300, registered: 287,
    description: "Chia sẻ kinh nghiệm triển khai CT1–CT5, phương pháp PBL và đánh giá năng lực STEM.",
  },
  {
    id: "E003", title: "Tập huấn Giáo viên Cốt cán STEM Khu vực Phía Bắc", type: "training",
    status: "upcoming", date: "2026-06-20", location: "Hà Nội — Hình thức Hybrid",
    organizer: "Bộ GD&ĐT", audience: "200 Giáo viên cốt cán được chọn",
    capacity: 200, registered: 156,
    description: "Bồi dưỡng nâng cao nghiệp vụ cho đội ngũ GV cốt cán — người sẽ tập huấn lại tại trường.",
  },
  {
    id: "E004", title: "Hội nghị Tổng kết Năm học STEM 2025–2026", type: "conference",
    status: "upcoming", date: "2026-07-10", location: "Hội trường Bộ GD&ĐT, Hà Nội",
    organizer: "Bộ GD&ĐT", audience: "Lãnh đạo Sở GD&ĐT 63 tỉnh/thành",
    capacity: 150, registered: 130,
    description: "Đánh giá kết quả triển khai STEM năm học 2025–2026, định hướng năm học mới.",
  },
  {
    id: "E005", title: "Lễ trao giải Cuộc thi Sáng tạo STEM Học sinh 2026", type: "ceremony",
    status: "upcoming", date: "2026-06-28", location: "Nhà hát Lớn Hà Nội",
    organizer: "Bộ GD&ĐT & Geleximco STEM", audience: "Học sinh đoạt giải, Phụ huynh, Báo chí",
    capacity: 800, registered: 450,
    description: "Vinh danh 100 dự án STEM xuất sắc nhất toàn quốc — 3 hạng Nhất/Nhì/Ba và 10 giải Khuyến khích.",
  },
  {
    id: "E006", title: "Hội thảo Quốc tế Giáo dục STEM & AI", type: "workshop",
    status: "ended", date: "2026-05-10", location: "Trung tâm Hội nghị Quốc gia",
    organizer: "Bộ GD&ĐT & UNESCO", audience: "Chuyên gia GD trong và ngoài nước",
    capacity: 400, registered: 398,
    description: "Chia sẻ xu hướng tích hợp AI vào giảng dạy STEM — đã kết thúc thành công.",
  },
  {
    id: "E007", title: "Ngày hội Stem Miền Trung — Đà Nẵng", type: "stem-fair",
    status: "ended", date: "2026-04-20", location: "Cung Hữu nghị Đà Nẵng",
    organizer: "Sở GD&ĐT Đà Nẵng & Bộ GD&ĐT", audience: "Học sinh, GV khu vực miền Trung",
    capacity: 2000, registered: 1876,
    description: "Sự kiện STEM khu vực miền Trung — 45 trường tham gia, 120 dự án trưng bày.",
  },
];

interface NewEventForm {
  title: string; type: EventType; date: string;
  location: string; audience: string; capacity: string; description: string;
}

const EMPTY_FORM: NewEventForm = {
  title: "", type: "stem-fair", date: "", location: "", audience: "", capacity: "", description: "",
};

type FilterTab = "all" | EventStatus;

export function AuthorityEvents() {
  const [events, setEvents] = useState<StemEvent[]>(INITIAL_EVENTS);
  const [tab, setTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewEventForm>(EMPTY_FORM);

  const counts = {
    all:       events.length,
    upcoming:  events.filter(e => e.status === "upcoming").length,
    open:      events.filter(e => e.status === "open").length,
    ended:     events.filter(e => e.status === "ended").length,
    cancelled: events.filter(e => e.status === "cancelled").length,
  };

  const filtered = useMemo(() => events.filter((e) => {
    const matchTab    = tab === "all" || e.status === tab;
    const matchSearch = !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  }), [events, tab, search]);

  function handleCreate() {
    if (!form.title || !form.date || !form.location) {
      toast.warning("Vui lòng điền đầy đủ Tên, Ngày và Địa điểm");
      return;
    }
    const newEvent: StemEvent = {
      id: `E${String(events.length + 1).padStart(3, "0")}`,
      title: form.title, type: form.type,
      status: "upcoming", date: form.date,
      location: form.location, organizer: "Bộ GD&ĐT",
      audience: form.audience || "Tất cả đối tượng",
      capacity: Number(form.capacity) || 100,
      registered: 0, description: form.description,
    };
    setEvents((prev) => [newEvent, ...prev]);
    setShowModal(false);
    setForm(EMPTY_FORM);
    toast.success("Đã tạo sự kiện mới — thông báo sẽ gửi đến các Sở GD&ĐT");
  }

  const TABS: { id: FilterTab; label: string }[] = [
    { id: "all",       label: `Tất cả (${counts.all})` },
    { id: "open",      label: `Đang đăng ký (${counts.open})` },
    { id: "upcoming",  label: `Sắp diễn ra (${counts.upcoming})` },
    { id: "ended",     label: `Đã kết thúc (${counts.ended})` },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={CalendarDays}
        title="Tổ chức & Quản lý Sự kiện Giáo dục"
        subtitle="Lên kế hoạch, công bố và theo dõi đăng ký các sự kiện STEM cấp quốc gia và khu vực"
        accentColor={ACCENT}
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white hover:opacity-90"
            style={{ background: ACCENT, fontSize: "13px", fontWeight: 500 }}
          >
            <Plus className="w-4 h-4" /> Tạo sự kiện
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={CalendarDays}  label="Tổng sự kiện"    value={counts.all}      color={ACCENT} />
        <KpiCard icon={CheckCircle2}  label="Đang đăng ký"    value={counts.open}     color="#16a34a" subtitle="mở đăng ký" />
        <KpiCard icon={Clock}         label="Sắp diễn ra"     value={counts.upcoming} color="#2563eb" />
        <KpiCard icon={CalendarCheck} label="Đã kết thúc"     value={counts.ended}    color="#6b7280" />
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={tab === t.id
                ? { background: "#fff", color: ACCENT, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                : { color: "var(--muted-foreground)" }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm sự kiện, địa điểm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm w-60 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": ACCENT + "40" } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Event list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm bg-card border border-border rounded-xl">
            Không có sự kiện nào
          </div>
        )}
        {filtered.map((ev) => {
          const typeCfg   = TYPE_CFG[ev.type];
          const statusCfg = STATUS_CFG[ev.status];
          const StatusIcon = statusCfg.icon;
          const pct = Math.round((ev.registered / ev.capacity) * 100);
          return (
            <div key={ev.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                {/* Date badge */}
                <div className="flex-shrink-0 w-14 text-center">
                  <div className="rounded-xl overflow-hidden border border-border">
                    <div className="py-1 text-[10px] font-bold text-white" style={{ background: ACCENT }}>
                      {new Date(ev.date).toLocaleDateString("vi-VN", { month: "short" }).toUpperCase()}
                    </div>
                    <div className="py-1.5 text-lg font-bold text-gray-900 bg-white">
                      {new Date(ev.date).getDate()}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-white"
                          style={{ background: typeCfg.color }}>{typeCfg.label}</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ color: statusCfg.color, background: statusCfg.bg }}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{ev.title}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{ev.audience}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{ev.description}</p>

                  {/* Registration bar */}
                  {ev.status !== "ended" && ev.status !== "cancelled" && (
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                        <span>Đăng ký: <span className="font-semibold text-gray-700">{ev.registered.toLocaleString()}</span> / {ev.capacity.toLocaleString()}</span>
                        <span style={{ color: pct >= 90 ? "#dc2626" : ACCENT }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: pct >= 90 ? "#dc2626" : ACCENT }} />
                      </div>
                    </div>
                  )}

                  {ev.status === "ended" && (
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      Tổng tham dự: <span className="font-semibold text-gray-700">{ev.registered.toLocaleString()}</span> / {ev.capacity.toLocaleString()} người
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-gray-900">Tạo sự kiện mới</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Tên sự kiện *</label>
                <input type="text" value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="VD: Ngày hội STEM tỉnh Hà Nam 2026"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": ACCENT + "40" } as React.CSSProperties} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Loại sự kiện</label>
                  <SelectDown
                    value={form.type}
                    onChange={(v) => setForm(p => ({ ...p, type: v as EventType }))}
                    className="w-full"
                    options={Object.entries(TYPE_CFG).map(([k, v]) => ({ value: k, label: v.label }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Ngày tổ chức *</label>
                  <input type="date" value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Địa điểm *</label>
                <input type="text" value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="VD: Hội trường UBND tỉnh Hà Nam"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Đối tượng tham dự</label>
                  <input type="text" value={form.audience}
                    onChange={(e) => setForm((p) => ({ ...p, audience: e.target.value }))}
                    placeholder="VD: Giáo viên STEM toàn tỉnh"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Sức chứa tối đa</label>
                  <input type="number" value={form.capacity}
                    onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                    placeholder="500"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Mô tả ngắn</label>
                <textarea value={form.description} rows={2}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Mục tiêu và nội dung chính của sự kiện..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:outline-none resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted">
                Hủy
              </button>
              <button onClick={handleCreate}
                className="px-4 py-2 text-sm font-semibold rounded-lg text-white hover:opacity-90"
                style={{ background: ACCENT }}>
                Tạo sự kiện
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
