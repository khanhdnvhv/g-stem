import { useState } from "react";
import {
  CalendarDays, Search, Plus, MapPin, Clock, Users, Video,
  Globe, Star, ChevronRight, Ticket, Filter, Eye, Share2,
  CheckCircle, XCircle, Calendar, ArrowRight, Building2,
  Mic, Monitor, Award, TrendingUp, Bell, Heart,
  ExternalLink, Tag, UserPlus, Download,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface TrainingEvent {
  id: string;
  title: string;
  description: string;
  type: "webinar" | "workshop" | "seminar" | "conference" | "bootcamp";
  format: "online" | "offline" | "hybrid";
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  organizerInitials: string;
  subsidiary: string;
  speakers: { name: string; title: string; initials: string }[];
  registered: number;
  maxCapacity: number;
  tags: string[];
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  featured: boolean;
  userRegistered: boolean;
  rating?: number;
  category: string;
  cost: string;
  certificate: boolean;
}

// ─── Mock Data ───
const EVENTS: TrainingEvent[] = [
  {
    id: "EV01", title: "Hội nghị Chuyển đổi Số Geleximco 2026",
    description: "Hội nghị thường niên về chiến lược chuyển đổi số toàn tập đoàn, xu hướng AI, Big Data, Cloud cho 14 đơn vị thành viên.",
    type: "conference", format: "hybrid", date: "20/03/2026", startTime: "08:30", endTime: "17:00",
    location: "Trung tâm Hội nghị Quốc gia + Zoom", organizer: "Nguyễn Văn Minh", organizerInitials: "NM", subsidiary: "VP Tập đoàn",
    speakers: [
      { name: "Nguyễn Văn Minh", title: "CTĐT Tập đoàn", initials: "NM" },
      { name: "Dr. Trần Hùng", title: "CTO Technology", initials: "TH" },
      { name: "Lê Quốc Vương", title: "CEO Geleximco Land", initials: "LV" },
    ],
    registered: 456, maxCapacity: 500, tags: ["Digital Transformation", "AI", "Strategy"],
    status: "upcoming", featured: true, userRegistered: true, category: "Công nghệ", cost: "Miễn phí", certificate: true,
  },
  {
    id: "EV02", title: "Workshop: Design Thinking cho BĐS",
    description: "Workshop thực hành Design Thinking áp dụng vào phát triển sản phẩm BĐS, trải nghiệm khách hàng.",
    type: "workshop", format: "offline", date: "22/03/2026", startTime: "09:00", endTime: "16:00",
    location: "VP Geleximco Land, Tầng 8", organizer: "Phạm Anh Tuấn", organizerInitials: "PT", subsidiary: "Geleximco Land",
    speakers: [
      { name: "Phạm Anh Tuấn", title: "Head of Marketing", initials: "PT" },
      { name: "Nguyễn Thị Hà", title: "UX Designer", initials: "NH" },
    ],
    registered: 28, maxCapacity: 30, tags: ["Design Thinking", "BĐS", "Innovation"],
    status: "upcoming", featured: false, userRegistered: false, category: "Kỹ năng mềm", cost: "500,000đ", certificate: true,
  },
  {
    id: "EV03", title: "Webinar: Phân tích Rủi ro Tín dụng 2026",
    description: "Cập nhật framework phân tích rủi ro tín dụng mới theo chuẩn Basel III+ dành cho ABBank.",
    type: "webinar", format: "online", date: "18/03/2026", startTime: "14:00", endTime: "16:00",
    location: "Microsoft Teams", organizer: "Trần Thị Hương", organizerInitials: "TH", subsidiary: "ABBank",
    speakers: [
      { name: "Trần Thị Hương", title: "VP Risk Management", initials: "TH" },
    ],
    registered: 89, maxCapacity: 200, tags: ["Risk", "Credit", "Basel III"],
    status: "upcoming", featured: false, userRegistered: true, category: "Tài chính", cost: "Miễn phí", certificate: false,
  },
  {
    id: "EV04", title: "Bootcamp: Kỹ năng Lãnh đạo Cấp trung",
    description: "Chương trình 3 ngày intensive dành cho quản lý cấp trung về leadership, coaching, decision making.",
    type: "bootcamp", format: "offline", date: "25/03/2026", startTime: "08:00", endTime: "17:00",
    location: "Resort Flamingo Đại Lải", organizer: "Đỗ Thanh Hương", organizerInitials: "TH", subsidiary: "VP Tập đoàn",
    speakers: [
      { name: "Đỗ Thanh Hương", title: "CHRO Tập đoàn", initials: "TH" },
      { name: "Prof. Nguyễn Quang", title: "Chuyên gia Leadership", initials: "NQ" },
    ],
    registered: 38, maxCapacity: 40, tags: ["Leadership", "Management", "Coaching"],
    status: "upcoming", featured: true, userRegistered: false, category: "Quản trị", cost: "2,000,000đ", certificate: true,
  },
  {
    id: "EV05", title: "Seminar: ESG & Phát triển Bền vững",
    description: "Seminar cập nhật xu hướng ESG toàn cầu và lộ trình triển khai tại Geleximco.",
    type: "seminar", format: "hybrid", date: "15/03/2026", startTime: "14:00", endTime: "17:00",
    location: "VP Tập đoàn + Zoom", organizer: "Lê Quốc Vương", organizerInitials: "LV", subsidiary: "VP Tập đoàn",
    speakers: [
      { name: "Lê Quốc Vương", title: "Director Strategy", initials: "LV" },
    ],
    registered: 120, maxCapacity: 150, tags: ["ESG", "Sustainability", "CSR"],
    status: "ongoing", featured: false, userRegistered: true, category: "Chiến lược", cost: "Miễn phí", certificate: false,
  },
  {
    id: "EV06", title: "Workshop: Excel Nâng cao cho Kế toán",
    description: "Hướng dẫn Power Query, Pivot Tables nâng cao, VBA automation cho bộ phận Kế toán.",
    type: "workshop", format: "online", date: "10/03/2026", startTime: "09:00", endTime: "12:00",
    location: "Google Meet", organizer: "Bùi Thị Hà", organizerInitials: "BH", subsidiary: "VP Tập đoàn",
    speakers: [
      { name: "Bùi Thị Hà", title: "Senior Accountant", initials: "BH" },
    ],
    registered: 65, maxCapacity: 80, tags: ["Excel", "VBA", "Kế toán"],
    status: "completed", featured: false, userRegistered: true, rating: 4.6, category: "Nghiệp vụ", cost: "Miễn phí", certificate: true,
  },
  {
    id: "EV07", title: "Webinar: An toàn Lao động — Mùa mưa bão",
    description: "Cập nhật quy trình ATLĐ mùa mưa bão cho các công trường xây dựng.",
    type: "webinar", format: "online", date: "05/03/2026", startTime: "10:00", endTime: "11:30",
    location: "Zoom", organizer: "Phạm Đức Mạnh", organizerInitials: "PM", subsidiary: "Xây dựng Geleximco",
    speakers: [
      { name: "Phạm Đức Mạnh", title: "HSE Manager", initials: "PM" },
    ],
    registered: 234, maxCapacity: 300, tags: ["ATLĐ", "Xây dựng", "Compliance"],
    status: "completed", featured: false, userRegistered: false, rating: 4.3, category: "An toàn", cost: "Miễn phí", certificate: false,
  },
  {
    id: "EV08", title: "Conference: Xu hướng BĐS Việt Nam 2026-2030",
    description: "Hội thảo chuyên sâu phân tích thị trường BĐS, pháp lý mới, và cơ hội đầu tư giai đoạn 2026-2030.",
    type: "conference", format: "offline", date: "02/04/2026", startTime: "08:00", endTime: "17:00",
    location: "Khách sạn Melia Hanoi", organizer: "Lê Quốc Vương", organizerInitials: "LV", subsidiary: "Geleximco Land",
    speakers: [
      { name: "Lê Quốc Vương", title: "CEO Geleximco Land", initials: "LV" },
      { name: "TS. Nguyễn Văn Đính", title: "Chủ tịch VARS", initials: "ND" },
    ],
    registered: 180, maxCapacity: 250, tags: ["BĐS", "Đầu tư", "Pháp lý"],
    status: "upcoming", featured: true, userRegistered: false, category: "Chuyên ngành", cost: "1,500,000đ", certificate: true,
  },
];

const TYPE_CONFIG = {
  webinar: { label: "Webinar", color: "#2563eb", bg: "#2563eb10", icon: Video },
  workshop: { label: "Workshop", color: "#16a34a", bg: "#16a34a10", icon: Monitor },
  seminar: { label: "Seminar", color: "#7c3aed", bg: "#7c3aed10", icon: Mic },
  conference: { label: "Hội nghị", color: "#990803", bg: "#99080310", icon: Globe },
  bootcamp: { label: "Bootcamp", color: "#ea580c", bg: "#ea580c10", icon: Award },
};

const FORMAT_CONFIG = {
  online: { label: "Trực tuyến", color: "#2563eb", icon: Video },
  offline: { label: "Trực tiếp", color: "#16a34a", icon: MapPin },
  hybrid: { label: "Kết hợp", color: "#7c3aed", icon: Globe },
};

const STATUS_CONFIG = {
  upcoming: { label: "Sắp diễn ra", color: "#2563eb", bg: "#2563eb10" },
  ongoing: { label: "Đang diễn ra", color: "#16a34a", bg: "#16a34a10" },
  completed: { label: "Đã kết thúc", color: "#6b7280", bg: "#6b728010" },
  cancelled: { label: "Đã hủy", color: "#ef4444", bg: "#ef444410" },
};

export function TrainingEvents() {
  const { user } = useAuth();
  const role = user?.role || "learner";
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [view, setView] = useState<"grid" | "timeline">("grid");
  const [events, setEvents] = useState(EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<TrainingEvent | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const toggleRegister = (id: string) => {
    setEvents(prev => prev.map(e =>
      e.id === id ? { ...e, userRegistered: !e.userRegistered, registered: e.userRegistered ? e.registered - 1 : e.registered + 1 } : e
    ));
  };

  const filtered = events.filter(e => {
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filterType !== "all" && e.type !== filterType) return false;
    if (filterStatus !== "all" && e.status !== filterStatus) return false;
    return true;
  });

  const featured = filtered.filter(e => e.featured && e.status === "upcoming");
  const ongoing = filtered.filter(e => e.status === "ongoing");
  const myRegistered = events.filter(e => e.userRegistered);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Sự kiện Đào tạo</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            {role === "admin" ? "Quản lý sự kiện, webinars, workshops toàn tập đoàn" :
             role === "instructor" ? "Tổ chức và quản lý sự kiện đào tạo" :
             "Khám phá và đăng ký sự kiện đào tạo hấp dẫn"}
          </p>
        </div>
        {(role === "admin" || role === "instructor") && (
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Tạo sự kiện
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Tổng sự kiện", value: events.length, icon: CalendarDays, color: "#990803", bg: "#990803" },
          { label: "Sắp diễn ra", value: events.filter(e => e.status === "upcoming").length, icon: Clock, color: "#2563eb", bg: "#2563eb" },
          { label: "Đang diễn ra", value: ongoing.length, icon: Video, color: "#16a34a", bg: "#16a34a" },
          { label: "Đã đăng ký", value: myRegistered.length, icon: Ticket, color: "#c8a84e", bg: "#c8a84e" },
          { label: "Tổng đăng ký", value: events.reduce((s, e) => s + e.registered, 0).toLocaleString(), icon: Users, color: "#7c3aed", bg: "#7c3aed" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.bg + "10" }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>{s.value}</p>
              <p className="text-gray-400" style={{ fontSize: "10px" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ongoing Events Banner */}
      {ongoing.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-transparent rounded-xl border border-green-100 p-4">
          <h3 className="text-green-700 mb-2 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Đang diễn ra
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {ongoing.map(e => (
              <div key={e.id} onClick={() => setSelectedEvent(e)} className="bg-white rounded-lg border border-green-200 p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: TYPE_CONFIG[e.type].bg }}>
                  {(() => { const I = TYPE_CONFIG[e.type].icon; return <I className="w-5 h-5" style={{ color: TYPE_CONFIG[e.type].color }} />; })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{e.title}</p>
                  <p className="text-gray-400" style={{ fontSize: "11px" }}>{e.startTime}-{e.endTime} • {e.location}</p>
                </div>
                <button onClick={() => { import("sonner").then(m => m.toast.success("Tham gia ngay!")); }} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer shrink-0" style={{ fontSize: "11px", fontWeight: 600 }}>
                  Tham gia ngay
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Events */}
      {featured.length > 0 && (
        <div>
          <h3 className="text-gray-600 mb-2 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Star className="w-4 h-4 text-[#c8a84e] fill-[#c8a84e]" /> Sự kiện Nổi bật
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {featured.map(e => {
              const tCfg = TYPE_CONFIG[e.type];
              const fCfg = FORMAT_CONFIG[e.format];
              const TypeIcon = tCfg.icon;
              const FormatIcon = fCfg.icon;
              const capacityPct = (e.registered / e.maxCapacity) * 100;
              return (
                <div key={e.id} onClick={() => setSelectedEvent(e)} className="bg-gradient-to-br from-[#990803]/5 to-white rounded-xl border border-[#990803]/15 p-4 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-[#c8a84e]/5 rounded-bl-[80px]" />
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: tCfg.color, backgroundColor: tCfg.bg }}>{tCfg.label}</span>
                    <span className="flex items-center gap-0.5" style={{ fontSize: "9px", color: fCfg.color }}><FormatIcon className="w-2.5 h-2.5" /> {fCfg.label}</span>
                    {e.certificate && <Award className="w-3 h-3 text-[#c8a84e]" />}
                  </div>
                  <h4 className="text-gray-800" style={{ fontSize: "15px", fontWeight: 700 }}>{e.title}</h4>
                  <p className="text-gray-400 mt-1 line-clamp-2" style={{ fontSize: "11px" }}>{e.description}</p>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-gray-500" style={{ fontSize: "11px" }}>
                      <Calendar className="w-3.5 h-3.5 text-[#990803]" /> {e.date} • {e.startTime}-{e.endTime}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500" style={{ fontSize: "11px" }}>
                      <MapPin className="w-3.5 h-3.5 text-[#990803]" /> {e.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <div className="flex -space-x-1">
                      {e.speakers.map((s, i) => (
                        <div key={i} className="w-5 h-5 rounded-full bg-[#990803] text-white flex items-center justify-center border border-white" style={{ fontSize: "6px", fontWeight: 700, zIndex: 3 - i }}>{s.initials}</div>
                      ))}
                    </div>
                    <span className="text-gray-400" style={{ fontSize: "10px" }}>{e.speakers.map(s => s.name).join(", ")}</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400" style={{ fontSize: "10px" }}>{e.registered}/{e.maxCapacity} đăng ký</span>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: capacityPct > 90 ? "#ef4444" : capacityPct > 70 ? "#ea580c" : "#16a34a" }}>{capacityPct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${capacityPct}%`, backgroundColor: capacityPct > 90 ? "#ef4444" : capacityPct > 70 ? "#ea580c" : "#16a34a" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm sự kiện..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả loại</option>
          {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="text-gray-400 ml-auto" style={{ fontSize: "11px" }}>{filtered.length} sự kiện</span>
      </div>

      {/* Event List */}
      <div className="space-y-2">
        {filtered.filter(e => !e.featured || e.status !== "upcoming").map(event => {
          const tCfg = TYPE_CONFIG[event.type];
          const fCfg = FORMAT_CONFIG[event.format];
          const stCfg = STATUS_CONFIG[event.status];
          const TypeIcon = tCfg.icon;
          const capacityPct = (event.registered / event.maxCapacity) * 100;
          return (
            <div key={event.id} onClick={() => setSelectedEvent(event)} className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tCfg.bg }}>
                  <TypeIcon className="w-6 h-6" style={{ color: tCfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: tCfg.color, backgroundColor: tCfg.bg }}>{tCfg.label}</span>
                    <span className="text-gray-400 flex items-center gap-0.5" style={{ fontSize: "9px" }}>
                      {(() => { const FI = fCfg.icon; return <FI className="w-2.5 h-2.5" />; })()} {fCfg.label}
                    </span>
                    {event.certificate && <Award className="w-3 h-3 text-[#c8a84e]" title="Có chứng chỉ" />}
                    {event.userRegistered && <CheckCircle className="w-3 h-3 text-green-500" title="Đã đăng ký" />}
                  </div>
                  <h4 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>{event.title}</h4>
                  <p className="text-gray-400 mt-0.5 line-clamp-1" style={{ fontSize: "12px" }}>{event.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-gray-400 flex-wrap" style={{ fontSize: "11px" }}>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.startTime}-{event.endTime}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {event.subsidiary}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-gray-500" style={{ fontSize: "11px", fontWeight: 500 }}>{event.cost}</span>
                  <div className="text-right">
                    <span className="text-gray-400" style={{ fontSize: "10px" }}>{event.registered}/{event.maxCapacity}</span>
                    <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden mt-0.5">
                      <div className="h-full rounded-full" style={{ width: `${capacityPct}%`, backgroundColor: capacityPct > 90 ? "#ef4444" : "#16a34a" }} />
                    </div>
                  </div>
                  {event.rating && (
                    <span className="flex items-center gap-0.5 text-[#c8a84e]" style={{ fontSize: "10px" }}>
                      <Star className="w-3 h-3 fill-[#c8a84e]" /> {event.rating}
                    </span>
                  )}
                  <div className="flex gap-1">
                    {event.tags.slice(0, 2).map(t => (
                      <span key={t} className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded" style={{ fontSize: "8px" }}>#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <CalendarDays className="w-12 h-12 text-gray-200 mx-auto" />
          <p className="text-gray-400 mt-2" style={{ fontSize: "13px" }}>Không tìm thấy sự kiện nào</p>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal event={selectedEvent} role={role} onClose={() => setSelectedEvent(null)} onToggleRegister={toggleRegister} />
      )}

      {/* Create Event Modal */}
      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ─── Event Detail Modal ───
function EventDetailModal({ event, role, onClose, onToggleRegister }: {
  event: TrainingEvent; role: string; onClose: () => void; onToggleRegister: (id: string) => void;
}) {
  const tCfg = TYPE_CONFIG[event.type];
  const fCfg = FORMAT_CONFIG[event.format];
  const stCfg = STATUS_CONFIG[event.status];
  const TypeIcon = tCfg.icon;
  const FormatIcon = fCfg.icon;
  const capacityPct = (event.registered / event.maxCapacity) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
            <span className="px-2 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: tCfg.color, backgroundColor: tCfg.bg }}>{tCfg.label}</span>
            <span className="flex items-center gap-0.5" style={{ fontSize: "10px", color: fCfg.color }}>
              <FormatIcon className="w-3 h-3" /> {fCfg.label}
            </span>
            {event.certificate && <span className="flex items-center gap-0.5 text-[#c8a84e]" style={{ fontSize: "10px" }}><Award className="w-3 h-3" /> Chứng chỉ</span>}
          </div>

          <h3 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>{event.title}</h3>
          <p className="text-gray-500 mt-1" style={{ fontSize: "13px" }}>{event.description}</p>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="p-2.5 bg-gray-50 rounded-lg flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#990803]" />
              <div>
                <p className="text-gray-400" style={{ fontSize: "9px" }}>Ngày</p>
                <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{event.date}</p>
              </div>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#990803]" />
              <div>
                <p className="text-gray-400" style={{ fontSize: "9px" }}>Thời gian</p>
                <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{event.startTime} - {event.endTime}</p>
              </div>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#990803]" />
              <div>
                <p className="text-gray-400" style={{ fontSize: "9px" }}>Địa điểm</p>
                <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{event.location}</p>
              </div>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#990803]" />
              <div>
                <p className="text-gray-400" style={{ fontSize: "9px" }}>Chi phí</p>
                <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{event.cost}</p>
              </div>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-gray-600" style={{ fontSize: "11px", fontWeight: 500 }}>Số lượng đăng ký</span>
              <span style={{ fontSize: "11px", fontWeight: 600, color: capacityPct > 90 ? "#ef4444" : "#16a34a" }}>{event.registered}/{event.maxCapacity} ({capacityPct.toFixed(0)}%)</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${capacityPct}%`, backgroundColor: capacityPct > 90 ? "#ef4444" : capacityPct > 70 ? "#ea580c" : "#16a34a" }} />
            </div>
          </div>

          {/* Speakers */}
          <div className="mt-4">
            <h4 className="text-gray-600 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Diễn giả</h4>
            <div className="space-y-2">
              {event.speakers.map((s, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#990803] text-white flex items-center justify-center" style={{ fontSize: "9px", fontWeight: 700 }}>{s.initials}</div>
                  <div>
                    <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 500 }}>{s.name}</p>
                    <p className="text-gray-400" style={{ fontSize: "10px" }}>{s.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {event.tags.map(t => <span key={t} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full border border-gray-100" style={{ fontSize: "10px" }}>#{t}</span>)}
          </div>

          {/* Rating for completed */}
          {event.rating && (
            <div className="mt-3 flex items-center gap-1.5">
              <span className="text-gray-500" style={{ fontSize: "12px" }}>Đánh giá:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4" style={{ color: i < Math.floor(event.rating!) ? "#c8a84e" : "#e5e7eb", fill: i < Math.floor(event.rating!) ? "#c8a84e" : "none" }} />
                ))}
              </div>
              <span className="text-[#c8a84e]" style={{ fontSize: "12px", fontWeight: 600 }}>{event.rating}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            {event.status === "upcoming" || event.status === "ongoing" ? (
              <>
                <button onClick={() => onToggleRegister(event.id)}
                  className={`flex-1 py-2.5 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 ${event.userRegistered ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-[#990803] text-white hover:bg-[#7a0602]"}`}
                  style={{ fontSize: "13px", fontWeight: 600 }}>
                  {event.userRegistered ? <><XCircle className="w-4 h-4" /> Hủy đăng ký</> : <><UserPlus className="w-4 h-4" /> Đăng ký tham gia</>}
                </button>
                {event.status === "ongoing" && event.userRegistered && (
                  <button onClick={() => { import("sonner").then(m => m.toast.success("Đang tham gia sự kiện...")); }} className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                    <Video className="w-4 h-4" /> Tham gia
                  </button>
                )}
              </>
            ) : event.status === "completed" && event.userRegistered && event.certificate ? (
              <button onClick={() => { import("sonner").then(m => m.toast.success("Đang tải chứng chỉ...")); }} className="flex-1 py-2.5 bg-[#c8a84e] text-white rounded-lg hover:bg-[#b8983e] cursor-pointer flex items-center justify-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                <Download className="w-4 h-4" /> Tải chứng chỉ
              </button>
            ) : null}
            <button onClick={() => { import("sonner").then(m => m.toast.success("Đã sao chép link chia sẻ!")); }} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "13px" }}>
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          <button onClick={onClose} className="w-full mt-2 py-2 text-gray-400 hover:bg-gray-50 rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Event Modal ───
function CreateEventModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <h3 className="text-gray-800 flex items-center gap-2" style={{ fontSize: "16px", fontWeight: 700 }}>
            <CalendarDays className="w-5 h-5 text-[#990803]" /> Tạo Sự kiện Đào tạo
          </h3>
          <div className="space-y-3 mt-4">
            <div>
              <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Tên sự kiện *</label>
              <input className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} placeholder="VD: Workshop Design Thinking..." />
            </div>
            <div>
              <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Mô tả</label>
              <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none resize-none" style={{ fontSize: "13px" }} rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Loại sự kiện</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Hình thức</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
                  {Object.entries(FORMAT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Số lượng tối đa</label>
                <input type="number" defaultValue={100} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none" style={{ fontSize: "13px" }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Ngày *</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }} />
              </div>
              <div>
                <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Bắt đầu</label>
                <input type="time" defaultValue="09:00" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none" style={{ fontSize: "12px" }} />
              </div>
              <div>
                <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Kết thúc</label>
                <input type="time" defaultValue="17:00" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none" style={{ fontSize: "12px" }} />
              </div>
            </div>
            <div>
              <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Địa điểm / Link</label>
              <input className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none" style={{ fontSize: "13px" }} placeholder="VD: VP Tập đoàn, Tầng 8 hoặc https://zoom.us/..." />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-[#990803] w-4 h-4" />
                <span className="text-gray-600" style={{ fontSize: "12px" }}>Cấp chứng chỉ tham dự</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-[#990803] w-4 h-4" />
                <span className="text-gray-600" style={{ fontSize: "12px" }}>Sự kiện nổi bật</span>
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
            <button onClick={() => { onClose(); import("sonner").then(m => m.toast.success("Đã tạo sự kiện đào tạo mới!")); }} className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer ml-auto" style={{ fontSize: "13px", fontWeight: 600 }}>Tạo sự kiện</button>
          </div>
        </div>
      </div>
    </div>
  );
}