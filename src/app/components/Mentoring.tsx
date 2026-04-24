import { useState } from "react";
import {
  Users, UserPlus, MessageCircle, Calendar, Star, Clock, Target,
  CheckCircle2, ChevronRight, Search, Filter, Award, TrendingUp,
  Video, BookOpen, BarChart3, Heart, Sparkles, ArrowRight, X,
  Mail, Phone, Building2, MapPin, Brain, Zap, Send, Plus,
} from "lucide-react";
import { useAuth } from "./AuthContext";

interface MentorProfile {
  id: string;
  name: string;
  initials: string;
  position: string;
  department: string;
  subsidiary: string;
  expertise: string[];
  yearsExp: number;
  rating: number;
  totalMentees: number;
  activeMentees: number;
  maxMentees: number;
  bio: string;
  availability: string;
  achievements: string[];
  sessionsDone: number;
}

interface MentoringPair {
  id: string;
  mentor: { name: string; initials: string; position: string; subsidiary: string };
  mentee: { name: string; initials: string; position: string; subsidiary: string };
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "pending";
  progress: number;
  sessions: number;
  goals: { text: string; completed: boolean }[];
  nextSession?: string;
}

interface MentoringSession {
  id: string;
  pairId: string;
  date: string;
  time: string;
  duration: string;
  type: "1on1" | "group" | "workshop";
  topic: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  rating?: number;
}

const mockMentors: MentorProfile[] = [
  { id: "MT001", name: "TS. Nguyễn Văn Hùng", initials: "NH", position: "Phó TGĐ Chiến lược", department: "Ban Giám đốc Tập đoàn", subsidiary: "Tập đoàn Geleximco", expertise: ["Chiến lược kinh doanh", "M&A", "Quản trị rủi ro"], yearsExp: 22, rating: 4.9, totalMentees: 15, activeMentees: 3, maxMentees: 5, bio: "22 năm kinh nghiệm quản trị cấp cao, từng dẫn dắt 3 thương vụ M&A lớn của Tập đoàn.", availability: "Thứ 3, Thứ 5 (14:00-17:00)", achievements: ["Top Mentor 2025", "15 mentee thành công"], sessionsDone: 128 },
  { id: "MT002", name: "ThS. Lê Thị Thu Hà", initials: "TH", position: "Giám đốc Khối QTRR", department: "Khối Quản trị Rủi ro", subsidiary: "Ngân hàng TMCP An Bình (ABBank)", expertise: ["Quản trị rủi ro", "Basel III/IV", "Tín dụng doanh nghiệp"], yearsExp: 18, rating: 4.8, totalMentees: 12, activeMentees: 4, maxMentees: 5, bio: "Chuyên gia QTRR hàng đầu ABBank, chứng chỉ FRM quốc tế.", availability: "Thứ 2, Thứ 4 (09:00-11:00)", achievements: ["FRM Certified", "Mentor xuất sắc Q4/2025"], sessionsDone: 96 },
  { id: "MT003", name: "KS. Trần Minh Đức", initials: "TĐ", position: "GĐ Kỹ thuật", department: "Ban Kỹ thuật - Vận hành", subsidiary: "Xi măng Thăng Long", expertise: ["Vận hành nhà máy", "An toàn lao động", "ISO 9001/14001"], yearsExp: 20, rating: 4.7, totalMentees: 10, activeMentees: 2, maxMentees: 4, bio: "20 năm kinh nghiệm vận hành nhà máy xi măng. Chuyên gia ISO hàng đầu.", availability: "Thứ 6 (14:00-16:00)", achievements: ["Zero-accident record 5 năm"], sessionsDone: 75 },
  { id: "MT004", name: "Phạm Anh Tuấn", initials: "PT", position: "Trưởng ban Marketing", department: "Ban Marketing BĐS", subsidiary: "BĐS Geleximco - KĐT An Khánh", expertise: ["Digital Marketing", "Brand Strategy", "Content Marketing"], yearsExp: 12, rating: 4.6, totalMentees: 8, activeMentees: 3, maxMentees: 4, bio: "Chuyên gia Digital Marketing BĐS, từng lead chiến dịch bán hàng 500 tỷ+.", availability: "Thứ 3 (10:00-12:00), Thứ 5 (15:00-17:00)", achievements: ["Marketing Innovation Award"], sessionsDone: 64 },
  { id: "MT005", name: "Vũ Đức Thắng", initials: "VT", position: "Trưởng ban Kỹ thuật", department: "Ban Kỹ thuật - Vận hành", subsidiary: "KCN Quang Minh", expertise: ["Hạ tầng KCN", "Quản lý dự án", "Green Building"], yearsExp: 15, rating: 4.5, totalMentees: 6, activeMentees: 2, maxMentees: 3, bio: "Dẫn dắt phát triển hạ tầng KCN Quang Minh, chuyên gia green building.", availability: "Thứ 4 (14:00-16:00)", achievements: ["PMP Certified"], sessionsDone: 48 },
];

const mockPairs: MentoringPair[] = [
  { id: "MP001", mentor: { name: "TS. Nguyễn Văn Hùng", initials: "NH", position: "Phó TGĐ Chiến lược", subsidiary: "Tập đoàn Geleximco" }, mentee: { name: "Đào Mạnh Kháng", initials: "DK", position: "Trưởng phòng TD", subsidiary: "ABBank" }, startDate: "01/01/2026", endDate: "30/06/2026", status: "active", progress: 65, sessions: 8, goals: [{ text: "Hoàn thành chứng chỉ CFA Level 1", completed: true }, { text: "Dẫn dắt dự án tái cấu trúc danh mục tín dụng", completed: false }, { text: "Phát triển kỹ năng thuyết trình cho BOD", completed: true }, { text: "Xây dựng team 10 người", completed: false }], nextSession: "12/03/2026 14:00" },
  { id: "MP002", mentor: { name: "ThS. Lê Thị Thu Hà", initials: "TH", position: "GĐ Khối QTRR", subsidiary: "ABBank" }, mentee: { name: "Lê Hoàng Nam", initials: "LN", position: "CV Phân tích Tín dụng", subsidiary: "ABBank" }, startDate: "15/01/2026", endDate: "15/07/2026", status: "active", progress: 40, sessions: 5, goals: [{ text: "Pass kỳ thi FRM Part 1", completed: false }, { text: "Thành thạo mô hình stress testing", completed: true }, { text: "Viết báo cáo rủi ro danh mục", completed: false }], nextSession: "11/03/2026 09:00" },
  { id: "MP003", mentor: { name: "Phạm Anh Tuấn", initials: "PT", position: "Trưởng ban Marketing", subsidiary: "BĐS An Khánh" }, mentee: { name: "Ngô Thị Mai", initials: "NM", position: "CV Marketing", subsidiary: "BĐS Lê Trọng Tấn" }, startDate: "01/02/2026", endDate: "31/07/2026", status: "active", progress: 30, sessions: 3, goals: [{ text: "Launch chiến dịch digital cho dự án mới", completed: false }, { text: "Đạt chứng chỉ Google Ads", completed: true }, { text: "Xây dựng marketing automation funnel", completed: false }], nextSession: "13/03/2026 15:00" },
  { id: "MP004", mentor: { name: "KS. Trần Minh Đức", initials: "TĐ", position: "GĐ Kỹ thuật", subsidiary: "Xi măng TL" }, mentee: { name: "Lê Văn Hải", initials: "LH", position: "Trưởng ca SX", subsidiary: "Khoáng sản GX" }, startDate: "01/09/2025", endDate: "28/02/2026", status: "completed", progress: 100, sessions: 12, goals: [{ text: "Đạt chứng chỉ An toàn lao động nâng cao", completed: true }, { text: "Giảm tai nạn lao động 50%", completed: true }, { text: "Triển khai ISO 45001 tại phân xưởng", completed: true }] },
];

const mockSessions: MentoringSession[] = [
  { id: "MS001", pairId: "MP001", date: "12/03/2026", time: "14:00", duration: "60 phút", type: "1on1", topic: "Review tiến độ dự án tái cấu trúc danh mục", status: "scheduled" },
  { id: "MS002", pairId: "MP002", date: "11/03/2026", time: "09:00", duration: "45 phút", type: "1on1", topic: "Ôn tập FRM Part 1 — Market Risk", status: "scheduled" },
  { id: "MS003", pairId: "MP003", date: "13/03/2026", time: "15:00", duration: "60 phút", type: "1on1", topic: "Review chiến dịch Google Ads Q1", status: "scheduled" },
  { id: "MS004", pairId: "MP001", date: "05/03/2026", time: "14:00", duration: "60 phút", type: "1on1", topic: "Kỹ năng thuyết trình trước BOD", status: "completed", notes: "Anh Kháng đã thuyết trình thành công dự án cho Ban TGĐ. Cần cải thiện thêm phần Q&A.", rating: 5 },
  { id: "MS005", pairId: "MP002", date: "04/03/2026", time: "09:00", duration: "45 phút", type: "1on1", topic: "Mô hình stress testing Basel III", status: "completed", notes: "Hoàn thành module stress testing. Nam nắm vững phương pháp VaR và Expected Shortfall.", rating: 4 },
];

export function Mentoring() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isInstructor = user?.role === "instructor";

  const [activeTab, setActiveTab] = useState<"overview" | "mentors" | "pairs" | "sessions">(isAdmin ? "overview" : "mentors");
  const [searchQ, setSearchQ] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestedMentors, setRequestedMentors] = useState<Set<string>>(new Set());
  const [showPairForm, setShowPairForm] = useState(false);
  const [joinedSessions, setJoinedSessions] = useState<Set<string>>(new Set());

  const tabs = [
    ...(isAdmin || isInstructor ? [{ key: "overview" as const, label: "Tổng quan", icon: BarChart3 }] : []),
    { key: "mentors" as const, label: "Danh sách Mentor", icon: Users },
    { key: "pairs" as const, label: "Cặp Mentoring", icon: Heart },
    { key: "sessions" as const, label: "Lịch họp", icon: Calendar },
  ];

  const kpiStats = [
    { label: "Cặp Mentor-Mentee", value: "127", sub: "Đang hoạt động", icon: Heart, color: "#990803" },
    { label: "Mentor đăng ký", value: "45", sub: "Từ 14 đơn vị", icon: Users, color: "#c8a84e" },
    { label: "Phiên đã hoàn thành", value: "1,240", sub: "+85 tháng này", icon: CheckCircle2, color: "#27ae60" },
    { label: "Tỷ lệ hài lòng", value: "94%", sub: "Mentee đánh giá", icon: Star, color: "#2e86de" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>Chương trình Mentoring</h1>
          <p className="text-gray-500 mt-1" style={{ fontSize: "13px" }}>
            Kết nối Mentor — Mentee xuyên đơn vị trong hệ sinh thái Geleximco
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <button onClick={() => setShowRequestForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer shadow-sm" style={{ fontSize: "13px", fontWeight: 500 }}>
              <UserPlus className="w-4 h-4" /> {isInstructor ? "Đăng ký làm Mentor" : "Tìm Mentor"}
            </button>
          )}
          {isAdmin && (
            <button onClick={() => { import("sonner").then(m => m.toast.info("Mở form ghép cặp mentor-mentee mới...")); }} className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer shadow-sm" style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Ghép cặp mới
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards (Admin/Instructor) */}
      {(isAdmin || isInstructor) && activeTab === "overview" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiStats.map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: kpi.color + "10" }}>
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
                <div>
                  <p className="text-gray-800" style={{ fontSize: "20px", fontWeight: 700 }}>{kpi.value}</p>
                  <p className="text-gray-500" style={{ fontSize: "11px" }}>{kpi.label}</p>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>{kpi.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md cursor-pointer transition-colors ${activeTab === tab.key ? "bg-white shadow-sm text-[#990803]" : "text-gray-500 hover:text-gray-700"}`}
            style={{ fontSize: "12px", fontWeight: 500 }}>
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Mentor Listing */}
      {activeTab === "mentors" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Tìm mentor theo tên, chuyên môn, đơn vị..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#990803]/30" style={{ fontSize: "13px" }} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockMentors.filter((m) => !searchQ || m.name.toLowerCase().includes(searchQ.toLowerCase()) || m.expertise.some((e) => e.toLowerCase().includes(searchQ.toLowerCase()))).map((mentor) => (
              <div key={mentor.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all hover:border-[#990803]/20 cursor-pointer" onClick={() => setSelectedMentor(mentor)}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#990803] to-[#c8a84e] text-white flex items-center justify-center shrink-0" style={{ fontSize: "16px", fontWeight: 700 }}>{mentor.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-gray-800" style={{ fontSize: "15px", fontWeight: 600 }}>{mentor.name}</h3>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 text-[#c8a84e] fill-[#c8a84e]" />
                        <span className="text-[#c8a84e]" style={{ fontSize: "12px", fontWeight: 600 }}>{mentor.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-500" style={{ fontSize: "12px" }}>{mentor.position}</p>
                    <p className="text-gray-400" style={{ fontSize: "11px" }}>{mentor.subsidiary}</p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {mentor.expertise.map((exp) => (
                        <span key={exp} className="px-2 py-0.5 bg-[#990803]/8 text-[#990803] rounded" style={{ fontSize: "10px", fontWeight: 500 }}>{exp}</span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: "11px" }}>
                        <Clock className="w-3 h-3" /> {mentor.yearsExp} năm KN
                      </span>
                      <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: "11px" }}>
                        <Users className="w-3 h-3" /> {mentor.activeMentees}/{mentor.maxMentees} mentee
                      </span>
                      <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: "11px" }}>
                        <CheckCircle2 className="w-3 h-3" /> {mentor.sessionsDone} phiên
                      </span>
                    </div>

                    {mentor.achievements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {mentor.achievements.map((ach) => (
                          <span key={ach} className="flex items-center gap-1 px-1.5 py-0.5 bg-[#c8a84e]/10 text-[#c8a84e] rounded" style={{ fontSize: "9px", fontWeight: 600 }}>
                            <Award className="w-2.5 h-2.5" /> {ach}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    {mentor.activeMentees < mentor.maxMentees ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg" style={{ fontSize: "10px", fontWeight: 600 }}>Còn slot</span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg" style={{ fontSize: "10px", fontWeight: 600 }}>Đã đầy</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentoring Pairs */}
      {activeTab === "pairs" && (
        <div className="space-y-4">
          {mockPairs.map((pair) => (
            <div key={pair.id} className={`bg-white rounded-xl border p-5 ${pair.status === "active" ? "border-green-200" : pair.status === "completed" ? "border-gray-200" : "border-yellow-200"}`}>
              <div className="flex items-center gap-4 mb-4">
                {/* Mentor */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#990803] to-[#7a0602] text-white flex items-center justify-center shrink-0" style={{ fontSize: "12px", fontWeight: 700 }}>{pair.mentor.initials}</div>
                  <div className="min-w-0">
                    <p className="text-gray-800 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{pair.mentor.name}</p>
                    <p className="text-gray-400 truncate" style={{ fontSize: "10px" }}>{pair.mentor.position} — {pair.mentor.subsidiary}</p>
                  </div>
                </div>
                {/* Arrow */}
                <div className="flex flex-col items-center shrink-0">
                  <ArrowRight className="w-5 h-5 text-[#c8a84e]" />
                  <span className={`px-2 py-0.5 rounded mt-1 ${pair.status === "active" ? "bg-green-100 text-green-700" : pair.status === "completed" ? "bg-gray-100 text-gray-500" : "bg-yellow-100 text-yellow-700"}`} style={{ fontSize: "9px", fontWeight: 600 }}>
                    {pair.status === "active" ? "Đang hoạt động" : pair.status === "completed" ? "Đã hoàn thành" : "Chờ duyệt"}
                  </span>
                </div>
                {/* Mentee */}
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
                  <div className="min-w-0">
                    <p className="text-gray-800 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{pair.mentee.name}</p>
                    <p className="text-gray-400 truncate" style={{ fontSize: "10px" }}>{pair.mentee.position} — {pair.mentee.subsidiary}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2e86de] to-[#1a5276] text-white flex items-center justify-center shrink-0" style={{ fontSize: "12px", fontWeight: 700 }}>{pair.mentee.initials}</div>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#990803] to-[#c8a84e] rounded-full transition-all" style={{ width: `${pair.progress}%` }} />
                </div>
                <span className="text-gray-600 shrink-0" style={{ fontSize: "12px", fontWeight: 600 }}>{pair.progress}%</span>
              </div>

              {/* Stats & Goals */}
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: "11px" }}><Calendar className="w-3 h-3" /> {pair.startDate} — {pair.endDate}</span>
                <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: "11px" }}><Video className="w-3 h-3" /> {pair.sessions} phiên</span>
                {pair.nextSession && <span className="flex items-center gap-1 text-[#990803]" style={{ fontSize: "11px", fontWeight: 500 }}><Clock className="w-3 h-3" /> Tiếp: {pair.nextSession}</span>}
              </div>

              {/* Goals */}
              <div className="space-y-1.5">
                <p className="text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>MỤC TIÊU</p>
                {pair.goals.map((goal, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${goal.completed ? "text-green-500" : "text-gray-300"}`} />
                    <span className={`${goal.completed ? "text-gray-500 line-through" : "text-gray-700"}`} style={{ fontSize: "12px" }}>{goal.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sessions */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Upcoming */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
                <Calendar className="w-4 h-4 text-[#990803]" /> Sắp tới
              </h3>
              <div className="space-y-3">
                {mockSessions.filter((s) => s.status === "scheduled").map((session) => {
                  const pair = mockPairs.find((p) => p.id === session.pairId);
                  return (
                    <div key={session.id} className="p-3 border border-gray-100 rounded-lg hover:border-[#990803]/20 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#990803]" style={{ fontSize: "12px", fontWeight: 600 }}>{session.date} — {session.time}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded" style={{ fontSize: "9px", fontWeight: 600 }}>{session.duration}</span>
                      </div>
                      <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>{session.topic}</p>
                      {pair && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <div className="w-5 h-5 rounded-full bg-[#990803] text-white flex items-center justify-center" style={{ fontSize: "7px", fontWeight: 700 }}>{pair.mentor.initials}</div>
                            <span className="text-gray-500" style={{ fontSize: "10px" }}>{pair.mentor.name}</span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-gray-300" />
                          <div className="flex items-center gap-1">
                            <div className="w-5 h-5 rounded-full bg-[#2e86de] text-white flex items-center justify-center" style={{ fontSize: "7px", fontWeight: 700 }}>{pair.mentee.initials}</div>
                            <span className="text-gray-500" style={{ fontSize: "10px" }}>{pair.mentee.name}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {joinedSessions.has(session.id) ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded" style={{ fontSize: "10px", fontWeight: 500 }}>
                            <CheckCircle2 className="w-3 h-3" /> Đã tham gia
                          </span>
                        ) : (
                          <button onClick={() => { setJoinedSessions(prev => new Set(prev).add(session.id)); import("sonner").then(m => m.toast.success("Đang tham gia phiên mentoring...")); }} className="flex items-center gap-1 px-2 py-1 bg-[#990803] text-white rounded cursor-pointer hover:bg-[#7a0602]" style={{ fontSize: "10px", fontWeight: 500 }}>
                            <Video className="w-3 h-3" /> Tham gia
                          </button>
                        )}
                        <button onClick={() => { import("sonner").then(m => m.toast.info("Mở tin nhắn với mentor...")); }} className="flex items-center gap-1 px-2 py-1 border border-gray-200 text-gray-500 rounded cursor-pointer hover:bg-gray-50" style={{ fontSize: "10px" }}>
                          <MessageCircle className="w-3 h-3" /> Nhắn tin
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Đã hoàn thành
              </h3>
              <div className="space-y-3">
                {mockSessions.filter((s) => s.status === "completed").map((session) => {
                  const pair = mockPairs.find((p) => p.id === session.pairId);
                  return (
                    <div key={session.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-500" style={{ fontSize: "12px", fontWeight: 500 }}>{session.date} — {session.time}</span>
                        {session.rating && (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: session.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>{session.topic}</p>
                      {session.notes && <p className="text-gray-500 mt-1" style={{ fontSize: "11px", lineHeight: 1.5, fontStyle: "italic" }}>"{session.notes}"</p>}
                      {pair && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-gray-400" style={{ fontSize: "10px" }}>{pair.mentor.name} → {pair.mentee.name}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview (Admin) */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cross-unit mentoring visualization */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-gray-800 mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Mentoring xuyên đơn vị</h3>
            <div className="space-y-3">
              {[
                { from: "Tập đoàn Geleximco", to: "ABBank", pairs: 18, color: "#990803" },
                { from: "ABBank", to: "ABS", pairs: 12, color: "#2e86de" },
                { from: "Xi măng Thăng Long", to: "Khoáng sản GX", pairs: 8, color: "#e67e22" },
                { from: "BĐS An Khánh", to: "BĐS Lê Trọng Tấn", pairs: 6, color: "#27ae60" },
                { from: "Nhiệt điện TL", to: "NL Tái tạo", pairs: 5, color: "#f39c12" },
              ].map((item) => (
                <div key={item.from + item.to} className="flex items-center gap-3">
                  <span className="text-gray-600 truncate" style={{ fontSize: "11px", width: "140px" }}>{item.from}</span>
                  <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
                  <span className="text-gray-600 truncate" style={{ fontSize: "11px", width: "140px" }}>{item.to}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(item.pairs / 18) * 100}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="text-gray-500 shrink-0" style={{ fontSize: "11px", fontWeight: 600 }}>{item.pairs}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mentor performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-gray-800 mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Top Mentor Q1/2026</h3>
            <div className="space-y-3">
              {mockMentors.slice(0, 4).map((mentor, i) => (
                <div key={mentor.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? "bg-[#c8a84e] text-white" : "bg-gray-100 text-gray-500"}`} style={{ fontSize: "10px", fontWeight: 700 }}>{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#990803] to-[#c8a84e] text-white flex items-center justify-center shrink-0" style={{ fontSize: "10px", fontWeight: 700 }}>{mentor.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{mentor.name}</p>
                    <p className="text-gray-400" style={{ fontSize: "10px" }}>{mentor.subsidiary}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" />
                      <span className="text-[#c8a84e]" style={{ fontSize: "12px", fontWeight: 600 }}>{mentor.rating}</span>
                    </div>
                    <p className="text-gray-400" style={{ fontSize: "9px" }}>{mentor.sessionsDone} phiên</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mentor Detail Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedMentor(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 600 }}>Hồ sơ Mentor</h3>
                <button onClick={() => setSelectedMentor(null)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#990803] to-[#c8a84e] text-white flex items-center justify-center" style={{ fontSize: "20px", fontWeight: 700 }}>{selectedMentor.initials}</div>
                <div>
                  <h4 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 600 }}>{selectedMentor.name}</h4>
                  <p className="text-gray-500" style={{ fontSize: "12px" }}>{selectedMentor.position}</p>
                  <p className="text-gray-400" style={{ fontSize: "11px" }}>{selectedMentor.subsidiary}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4" style={{ fontSize: "13px", lineHeight: 1.7 }}>{selectedMentor.bio}</p>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /><span className="text-gray-600" style={{ fontSize: "12px" }}>{selectedMentor.availability}</span></div>
                <div className="flex items-center gap-2"><Target className="w-4 h-4 text-gray-400" /><span className="text-gray-600" style={{ fontSize: "12px" }}>Chuyên môn: {selectedMentor.expertise.join(", ")}</span></div>
              </div>
              <button onClick={() => {
                setRequestedMentors(prev => new Set(prev).add(selectedMentor.id));
                setSelectedMentor(null);
                import("sonner").then(m => m.toast.success("Đã gửi yêu cầu mentoring thành công!"));
              }} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "14px", fontWeight: 500 }}>
                <Send className="w-4 h-4" /> {requestedMentors.has(selectedMentor.id) ? "Đã gửi yêu cầu ✓" : "Gửi yêu cầu Mentoring"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}