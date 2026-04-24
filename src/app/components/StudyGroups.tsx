import { useState } from "react";
import {
  Users, Search, Plus, Video, MessageCircle, Calendar, Clock,
  Star, BookOpen, Target, UserPlus, Crown, Settings, Eye,
  ChevronRight, Globe, Lock, Flame, Award, TrendingUp,
  CheckCircle, Play, Mic, MicOff, MonitorUp, Hand,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface StudyGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  memberCount: number;
  maxMembers: number;
  leader: { name: string; initials: string; role: "admin" | "instructor" | "learner" };
  members: { name: string; initials: string; role: "admin" | "instructor" | "learner"; online: boolean }[];
  isPublic: boolean;
  joined: boolean;
  tags: string[];
  nextSession?: { date: string; time: string; topic: string };
  totalSessions: number;
  avgRating: number;
  created: string;
  activity: "active" | "moderate" | "new";
  linkedCourse?: string;
}

// ─── Mock Data ───
const GROUPS: StudyGroup[] = [
  {
    id: "SG01", name: "Marketing số Geleximco", description: "Nhóm học và trao đổi về Digital Marketing, SEO, Content dành cho nhân sự BĐS và Marketing.",
    topic: "Marketing & Truyền thông", memberCount: 24, maxMembers: 30,
    leader: { name: "Phạm Anh Tuấn", initials: "PT", role: "instructor" },
    members: [
      { name: "Phạm Anh Tuấn", initials: "PT", role: "instructor", online: true },
      { name: "Nguyễn Thị Hà", initials: "NH", role: "learner", online: true },
      { name: "Trần Văn Đức", initials: "TD", role: "learner", online: false },
      { name: "Lê Minh Anh", initials: "LA", role: "learner", online: true },
      { name: "Hoàng Đức Em", initials: "HE", role: "learner", online: false },
    ],
    isPublic: true, joined: true, tags: ["Marketing", "SEO", "Digital"],
    nextSession: { date: "14/03/2026", time: "14:00-15:30", topic: "TikTok Marketing cho BĐS" },
    totalSessions: 18, avgRating: 4.7, created: "01/01/2026", activity: "active", linkedCourse: "Marketing số & Truyền thông",
  },
  {
    id: "SG02", name: "Phân tích Tài chính ABBank", description: "Nhóm trao đổi kiến thức phân tích tài chính, tín dụng và quản trị rủi ro dành cho nhân viên ngân hàng.",
    topic: "Tài chính & Kế toán", memberCount: 15, maxMembers: 20,
    leader: { name: "Trần Thị Hương", initials: "TH", role: "instructor" },
    members: [
      { name: "Trần Thị Hương", initials: "TH", role: "instructor", online: true },
      { name: "Lê Hoàng Nam", initials: "LN", role: "learner", online: true },
      { name: "Phạm Thùy Linh", initials: "PL", role: "learner", online: false },
    ],
    isPublic: true, joined: true, tags: ["Tài chính", "Tín dụng", "Ngân hàng"],
    nextSession: { date: "15/03/2026", time: "09:00-10:30", topic: "Phân tích dòng tiền FCF nâng cao" },
    totalSessions: 12, avgRating: 4.5, created: "15/01/2026", activity: "active", linkedCourse: "Phân tích Tài chính DN",
  },
  {
    id: "SG03", name: "Lãnh đạo & Quản trị Cấp trung", description: "Nhóm dành cho quản lý cấp trung các đơn vị, trao đổi về kỹ năng lãnh đạo, ra quyết định.",
    topic: "Quản trị & Lãnh đạo", memberCount: 32, maxMembers: 40,
    leader: { name: "Nguyễn Văn Minh", initials: "NM", role: "admin" },
    members: [
      { name: "Nguyễn Văn Minh", initials: "NM", role: "admin", online: true },
      { name: "Lê Quốc Vương", initials: "LV", role: "instructor", online: false },
      { name: "Vũ Thị Phương", initials: "VP", role: "instructor", online: true },
    ],
    isPublic: false, joined: false, tags: ["Lãnh đạo", "Quản trị", "Cấp trung"],
    nextSession: { date: "16/03/2026", time: "16:00-17:30", topic: "Case Study: Quản lý xung đột" },
    totalSessions: 22, avgRating: 4.8, created: "01/11/2025", activity: "active",
  },
  {
    id: "SG04", name: "An toàn Lao động — Xây dựng", description: "Nhóm học tập và chia sẻ kinh nghiệm về ATVSLĐ tại các công trường xây dựng.",
    topic: "An toàn Lao động", memberCount: 18, maxMembers: 25,
    leader: { name: "Phạm Đức Mạnh", initials: "PM", role: "instructor" },
    members: [
      { name: "Phạm Đức Mạnh", initials: "PM", role: "instructor", online: false },
    ],
    isPublic: true, joined: false, tags: ["ATLĐ", "Xây dựng", "Compliance"],
    totalSessions: 8, avgRating: 4.3, created: "01/02/2026", activity: "moderate",
  },
  {
    id: "SG05", name: "ESG & Phát triển Bền vững", description: "Nhóm nghiên cứu xu hướng ESG, báo cáo bền vững và ứng dụng tại Geleximco.",
    topic: "ESG & Bền vững", memberCount: 10, maxMembers: 20,
    leader: { name: "Hoàng Đức Em", initials: "HE", role: "learner" },
    members: [
      { name: "Hoàng Đức Em", initials: "HE", role: "learner", online: true },
    ],
    isPublic: true, joined: false, tags: ["ESG", "Bền vững", "CSR"],
    totalSessions: 4, avgRating: 4.1, created: "01/03/2026", activity: "new",
  },
  {
    id: "SG06", name: "English for Business", description: "Nhóm luyện tiếng Anh thương mại, giao tiếp quốc tế dành cho nhân sự tập đoàn.",
    topic: "Kỹ năng mềm", memberCount: 28, maxMembers: 35,
    leader: { name: "Dương Thị Lan", initials: "DL", role: "instructor" },
    members: [
      { name: "Dương Thị Lan", initials: "DL", role: "instructor", online: true },
    ],
    isPublic: true, joined: false, tags: ["English", "Business", "Communication"],
    nextSession: { date: "13/03/2026", time: "12:00-13:00", topic: "Negotiation English" },
    totalSessions: 30, avgRating: 4.6, created: "15/09/2025", activity: "active",
  },
];

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  admin: { color: "#e74c3c", bg: "#e74c3c" },
  instructor: { color: "#c8a84e", bg: "#c8a84e" },
  learner: { color: "#2563eb", bg: "#2563eb" },
};

const ACTIVITY_CONFIG = {
  active: { label: "Hoạt động", color: "#16a34a", bg: "#16a34a10" },
  moderate: { label: "Vừa phải", color: "#c8a84e", bg: "#c8a84e10" },
  new: { label: "Mới tạo", color: "#2563eb", bg: "#2563eb10" },
};

export function StudyGroups() {
  const { user } = useAuth();
  const role = user?.role || "learner";
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "joined" | "public">("all");
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [groups, setGroups] = useState(GROUPS);
  const [showCreate, setShowCreate] = useState(false);
  const [showLiveRoom, setShowLiveRoom] = useState(false);

  const toggleJoin = (id: string) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, joined: !g.joined, memberCount: g.joined ? g.memberCount - 1 : g.memberCount + 1 } : g));
  };

  const filtered = groups.filter(g => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase()) && !g.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    if (filter === "joined" && !g.joined) return false;
    if (filter === "public" && !g.isPublic) return false;
    return true;
  });

  const myGroups = groups.filter(g => g.joined);
  const upcomingSessions = groups.filter(g => g.joined && g.nextSession).map(g => ({ group: g.name, ...g.nextSession! }));

  if (showLiveRoom) {
    return <LiveStudyRoom group={groups[0]} onLeave={() => setShowLiveRoom(false)} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Nhóm Học tập</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            {role === "admin" ? "Quản lý nhóm học tập toàn tập đoàn" :
             role === "instructor" ? "Tạo và dẫn dắt nhóm học cho học viên" :
             "Tham gia nhóm học tập cùng đồng nghiệp"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {myGroups.some(g => g.nextSession) && (
            <button onClick={() => setShowLiveRoom(true)} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer animate-pulse" style={{ fontSize: "12px", fontWeight: 500 }}>
              <Video className="w-4 h-4" /> Vào phòng học trực tuyến
            </button>
          )}
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Tạo nhóm mới
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#990803]/10 flex items-center justify-center"><Users className="w-4 h-4 text-[#990803]" /></div>
          <div><p className="text-[#990803]" style={{ fontSize: "18px", fontWeight: 700 }}>{groups.length}</p><p className="text-gray-400" style={{ fontSize: "10px" }}>Nhóm học</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-green-500" /></div>
          <div><p className="text-green-600" style={{ fontSize: "18px", fontWeight: 700 }}>{myGroups.length}</p><p className="text-gray-400" style={{ fontSize: "10px" }}>Đã tham gia</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><Calendar className="w-4 h-4 text-blue-500" /></div>
          <div><p className="text-blue-600" style={{ fontSize: "18px", fontWeight: 700 }}>{upcomingSessions.length}</p><p className="text-gray-400" style={{ fontSize: "10px" }}>Buổi học sắp tới</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#c8a84e]/10 flex items-center justify-center"><Star className="w-4 h-4 text-[#c8a84e]" /></div>
          <div><p className="text-[#c8a84e]" style={{ fontSize: "18px", fontWeight: 700 }}>4.5</p><p className="text-gray-400" style={{ fontSize: "10px" }}>Đánh giá TB</p></div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div className="bg-gradient-to-r from-[#990803]/5 to-transparent rounded-xl border border-[#990803]/10 p-4">
          <h3 className="text-gray-700 mb-2 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Calendar className="w-4 h-4 text-[#990803]" /> Buổi học sắp tới
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {upcomingSessions.map((s, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#990803]/10 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5 text-[#990803]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{s.topic}</p>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>{s.group} • {s.date} • {s.time}</p>
                </div>
                <button onClick={() => setShowLiveRoom(true)} className="px-2 py-1 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700 shrink-0" style={{ fontSize: "10px", fontWeight: 600 }}>Tham gia</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm nhóm học tập..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} />
        </div>
        {[
          { id: "all" as const, label: "Tất cả" },
          { id: "joined" as const, label: "Đã tham gia" },
          { id: "public" as const, label: "Công khai" },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-2 rounded-lg cursor-pointer ${filter === f.id ? "bg-[#990803] text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`} style={{ fontSize: "12px", fontWeight: filter === f.id ? 600 : 400 }}>
            {f.label}
          </button>
        ))}
        <span className="text-gray-400 ml-auto" style={{ fontSize: "11px" }}>{filtered.length} nhóm</span>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(group => {
          const actCfg = ACTIVITY_CONFIG[group.activity];
          const leaderClr = ROLE_COLORS[group.leader.role];
          return (
            <div key={group.id} onClick={() => setSelectedGroup(group)} className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: actCfg.color, backgroundColor: actCfg.bg }}>{actCfg.label}</span>
                  {!group.isPublic && <Lock className="w-3 h-3 text-gray-300" />}
                  {group.joined && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                </div>
                {group.linkedCourse && <BookOpen className="w-3.5 h-3.5 text-[#c8a84e]" title={`Liên kết: ${group.linkedCourse}`} />}
              </div>

              <h4 className="text-gray-800" style={{ fontSize: "14px", fontWeight: 600 }}>{group.name}</h4>
              <p className="text-gray-400 mt-0.5 line-clamp-2" style={{ fontSize: "11px" }}>{group.description}</p>

              {/* Leader */}
              <div className="flex items-center gap-2 mt-3">
                <div className="w-5 h-5 rounded-full text-white flex items-center justify-center" style={{ fontSize: "7px", fontWeight: 700, backgroundColor: leaderClr.bg }}>
                  {group.leader.initials}
                </div>
                <span className="text-gray-500" style={{ fontSize: "11px" }}>{group.leader.name}</span>
                <Crown className="w-3 h-3 text-[#c8a84e]" />
              </div>

              {/* Member avatars */}
              <div className="flex items-center gap-1 mt-2.5">
                <div className="flex -space-x-1.5">
                  {group.members.slice(0, 5).map((m, i) => (
                    <div key={i} className="w-6 h-6 rounded-full text-white flex items-center justify-center border-2 border-white" style={{ fontSize: "7px", fontWeight: 600, backgroundColor: ROLE_COLORS[m.role].bg, zIndex: 5 - i }}>
                      {m.initials}
                    </div>
                  ))}
                </div>
                {group.memberCount > 5 && (
                  <span className="text-gray-400" style={{ fontSize: "10px" }}>+{group.memberCount - 5}</span>
                )}
                <span className="text-gray-300 ml-auto" style={{ fontSize: "10px" }}>{group.memberCount}/{group.maxMembers}</span>
                <div className="h-1 w-12 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(group.memberCount / group.maxMembers) * 100}%`, backgroundColor: group.memberCount / group.maxMembers > 0.8 ? "#ea580c" : "#16a34a" }} />
                </div>
              </div>

              {/* Next session */}
              {group.nextSession && (
                <div className="mt-2.5 p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-1.5">
                    <Video className="w-3 h-3 text-green-600" />
                    <span className="text-green-700" style={{ fontSize: "10px", fontWeight: 600 }}>{group.nextSession.date} • {group.nextSession.time}</span>
                  </div>
                  <p className="text-green-600 mt-0.5" style={{ fontSize: "10px" }}>{group.nextSession.topic}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-400" style={{ fontSize: "10px" }}>
                  <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" /> {group.avgRating}</span>
                  <span>•</span>
                  <span>{group.totalSessions} buổi</span>
                </div>
                <div className="flex gap-1">
                  {group.tags.slice(0, 2).map(t => (
                    <span key={t} className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded" style={{ fontSize: "8px" }}>#{t}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-200 mx-auto" />
          <p className="text-gray-400 mt-2" style={{ fontSize: "13px" }}>Không tìm thấy nhóm nào</p>
        </div>
      )}

      {/* Group Detail Modal */}
      {selectedGroup && (
        <GroupDetailModal group={selectedGroup} role={role} onClose={() => setSelectedGroup(null)} onToggleJoin={toggleJoin} onStartLive={() => { setSelectedGroup(null); setShowLiveRoom(true); }} />
      )}

      {/* Create Modal */}
      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ─── Group Detail Modal ───
function GroupDetailModal({ group, role, onClose, onToggleJoin, onStartLive }: {
  group: StudyGroup; role: string; onClose: () => void; onToggleJoin: (id: string) => void; onStartLive: () => void;
}) {
  const actCfg = ACTIVITY_CONFIG[group.activity];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: actCfg.color, backgroundColor: actCfg.bg }}>{actCfg.label}</span>
            {group.isPublic ? <Globe className="w-3.5 h-3.5 text-green-500" /> : <Lock className="w-3.5 h-3.5 text-orange-500" />}
            <span className="text-gray-300" style={{ fontSize: "10px" }}>{group.isPublic ? "Công khai" : "Riêng tư"}</span>
          </div>
          <h3 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>{group.name}</h3>
          <p className="text-gray-500 mt-1" style={{ fontSize: "13px" }}>{group.description}</p>

          {group.linkedCourse && (
            <div className="mt-2 flex items-center gap-1.5 text-[#c8a84e]" style={{ fontSize: "11px" }}>
              <BookOpen className="w-3.5 h-3.5" /> Liên kết khóa: {group.linkedCourse}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-gray-700" style={{ fontSize: "16px", fontWeight: 700 }}>{group.memberCount}</p>
              <p className="text-gray-400" style={{ fontSize: "9px" }}>Thành viên</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-gray-700" style={{ fontSize: "16px", fontWeight: 700 }}>{group.totalSessions}</p>
              <p className="text-gray-400" style={{ fontSize: "9px" }}>Buổi học</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-[#c8a84e]" style={{ fontSize: "16px", fontWeight: 700 }}>{group.avgRating}</p>
              <p className="text-gray-400" style={{ fontSize: "9px" }}>Đánh giá</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-gray-700" style={{ fontSize: "16px", fontWeight: 700 }}>{group.created}</p>
              <p className="text-gray-400" style={{ fontSize: "9px" }}>Ngày tạo</p>
            </div>
          </div>

          {/* Next session */}
          {group.nextSession && (
            <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
              <p className="text-green-700 flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}><Video className="w-4 h-4" /> Buổi học tiếp theo</p>
              <p className="text-green-600 mt-1" style={{ fontSize: "13px", fontWeight: 500 }}>{group.nextSession.topic}</p>
              <p className="text-green-500 mt-0.5" style={{ fontSize: "11px" }}>{group.nextSession.date} • {group.nextSession.time}</p>
            </div>
          )}

          {/* Members */}
          <div className="mt-4">
            <h4 className="text-gray-600 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Thành viên ({group.memberCount})</h4>
            <div className="space-y-1.5">
              {group.members.map((m, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full text-white flex items-center justify-center" style={{ fontSize: "8px", fontWeight: 700, backgroundColor: ROLE_COLORS[m.role].bg }}>
                      {m.initials}
                    </div>
                    {m.online && <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />}
                  </div>
                  <span className="text-gray-600" style={{ fontSize: "12px" }}>{m.name}</span>
                  {i === 0 && <Crown className="w-3 h-3 text-[#c8a84e]" />}
                  {m.online && <span className="text-green-500" style={{ fontSize: "9px" }}>Online</span>}
                </div>
              ))}
              {group.memberCount > 5 && (
                <p className="text-gray-400 pl-9" style={{ fontSize: "11px" }}>+{group.memberCount - 5} thành viên khác</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            {group.joined ? (
              <>
                {group.nextSession && (
                  <button onClick={onStartLive} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer flex items-center justify-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                    <Video className="w-4 h-4" /> Vào phòng học
                  </button>
                )}
                <button onClick={() => onToggleJoin(group.id)} className="px-4 py-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 cursor-pointer" style={{ fontSize: "13px" }}>Rời nhóm</button>
              </>
            ) : (
              <button onClick={() => onToggleJoin(group.id)} className="flex-1 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center justify-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                <UserPlus className="w-4 h-4" /> Tham gia nhóm
              </button>
            )}
          </div>
          <button onClick={onClose} className="w-full mt-2 py-2 text-gray-400 hover:bg-gray-50 rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ─── Live Study Room ───
function LiveStudyRoom({ group, onLeave }: { group: StudyGroup; onLeave: () => void }) {
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [messages, setMessages] = useState([
    { sender: "Phạm Anh Tuấn", text: "Chào cả nhóm! Hôm nay mình sẽ thảo luận về TikTok Marketing.", time: "14:00" },
    { sender: "Nguyễn Thị Hà", text: "Dạ em sẵn sàng rồi ạ! 🙋‍♀️", time: "14:01" },
    { sender: "Lê Minh Anh", text: "Anh Tuấn ơi, slide hôm nay có gửi trước không ạ?", time: "14:02" },
  ]);
  const [newMsg, setNewMsg] = useState("");

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    setMessages(prev => [...prev, { sender: "Bạn", text: newMsg, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) }]);
    setNewMsg("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <h2 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>Phòng học trực tuyến</h2>
          <span className="text-gray-400" style={{ fontSize: "12px" }}>— {group.name}</span>
        </div>
        <button onClick={onLeave} className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>Rời phòng</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3" style={{ height: "calc(100vh - 250px)" }}>
        {/* Video area */}
        <div className="lg:col-span-3 bg-gray-900 rounded-xl overflow-hidden flex flex-col">
          {/* Main video grid */}
          <div className="flex-1 p-3 grid grid-cols-2 lg:grid-cols-3 gap-2">
            {group.members.slice(0, 6).map((m, i) => (
              <div key={i} className="bg-gray-800 rounded-xl flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-full text-white flex items-center justify-center" style={{ fontSize: "20px", fontWeight: 700, backgroundColor: ROLE_COLORS[m.role].bg + "90" }}>
                  {m.initials}
                </div>
                <span className="absolute bottom-2 left-2 text-white/80 bg-black/40 px-2 py-0.5 rounded" style={{ fontSize: "10px" }}>{m.name}</span>
                {i === 0 && <Crown className="absolute top-2 right-2 w-4 h-4 text-[#c8a84e]" />}
                {m.online && <div className="absolute top-2 left-2 w-2 h-2 bg-green-500 rounded-full" />}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="p-3 bg-gray-800 flex items-center justify-center gap-3">
            <button onClick={() => setMicOn(!micOn)} className={`p-3 rounded-full cursor-pointer ${micOn ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-red-500 text-white"}`}>
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button onClick={() => setCamOn(!camOn)} className={`p-3 rounded-full cursor-pointer ${camOn ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-red-500 text-white"}`}>
              {camOn ? <Video className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
            <button onClick={() => { import("sonner").then(m => m.toast.info("Đang chia sẻ màn hình...")); }} className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 cursor-pointer"><MonitorUp className="w-5 h-5" /></button>
            <button onClick={() => { import("sonner").then(m => m.toast.info("Đã giơ tay phát biểu!")); }} className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600 cursor-pointer"><Hand className="w-5 h-5" /></button>
            <button onClick={onLeave} className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 cursor-pointer"><Play className="w-5 h-5 rotate-180" /></button>
          </div>
        </div>

        {/* Chat sidebar */}
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <p className="text-gray-600" style={{ fontSize: "13px", fontWeight: 600 }}>💬 Chat nhóm</p>
            <p className="text-gray-400" style={{ fontSize: "10px" }}>{group.members.filter(m => m.online).length} đang online</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
            {messages.map((msg, i) => (
              <div key={i}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-gray-600" style={{ fontSize: "10px", fontWeight: 600 }}>{msg.sender}</span>
                  <span className="text-gray-300" style={{ fontSize: "8px" }}>{msg.time}</span>
                </div>
                <p className="text-gray-600 bg-gray-50 rounded-lg px-2.5 py-1.5" style={{ fontSize: "12px" }}>{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-gray-100 flex gap-1.5">
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Nhập tin nhắn..." className="flex-1 px-2.5 py-1.5 bg-gray-50 rounded-lg border-0 focus:outline-none" style={{ fontSize: "12px" }} />
            <button onClick={sendMsg} className="p-1.5 bg-[#990803] text-white rounded-lg cursor-pointer hover:bg-[#7a0602]"><MessageCircle className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Group Modal ───
function CreateGroupModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-5" onClick={e => e.stopPropagation()}>
        <h3 className="text-gray-800 flex items-center gap-2" style={{ fontSize: "16px", fontWeight: 700 }}>
          <Users className="w-5 h-5 text-[#990803]" /> Tạo nhóm Học tập mới
        </h3>
        <div className="space-y-3 mt-4">
          <div>
            <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Tên nhóm *</label>
            <input className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20" style={{ fontSize: "13px" }} placeholder="VD: Nhóm Marketing số Q2" />
          </div>
          <div>
            <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Mô tả</label>
            <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none resize-none" style={{ fontSize: "13px" }} rows={2} placeholder="Mô tả mục tiêu nhóm..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Chủ đề</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none cursor-pointer" style={{ fontSize: "12px" }}>
                <option>Marketing & Truyền thông</option><option>Tài chính & Kế toán</option><option>Công nghệ Thông tin</option><option>Kỹ năng mềm</option><option>Quản trị & Lãnh đạo</option>
              </select>
            </div>
            <div>
              <label className="text-gray-600 block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Số thành viên tối đa</label>
              <input type="number" defaultValue={20} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none" style={{ fontSize: "13px" }} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="visibility" defaultChecked className="accent-[#990803]" />
              <span className="text-gray-600 flex items-center gap-1" style={{ fontSize: "12px" }}><Globe className="w-3.5 h-3.5 text-green-500" /> Công khai</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="visibility" className="accent-[#990803]" />
              <span className="text-gray-600 flex items-center gap-1" style={{ fontSize: "12px" }}><Lock className="w-3.5 h-3.5 text-orange-500" /> Riêng tư</span>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "13px" }}>Hủy</button>
          <button onClick={() => { onClose(); import("sonner").then(m => m.toast.success("Đã tạo nhóm học tập mới!")); }} className="flex-1 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "13px", fontWeight: 600 }}>Tạo nhóm</button>
        </div>
      </div>
    </div>
  );
}