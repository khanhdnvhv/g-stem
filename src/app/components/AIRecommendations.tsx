import { useState } from "react";
import {
  Sparkles, Brain, Target, TrendingUp, BookOpen, Clock,
  Star, ChevronRight, RefreshCw, ThumbsUp, ThumbsDown,
  Eye, Award, Users, Zap, Lightbulb, BarChart3,
  CheckCircle, ArrowRight, Shield, Flame, Filter,
  Building2, MapPin, GraduationCap, Heart,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface Recommendation {
  id: string;
  courseTitle: string;
  courseDescription: string;
  category: string;
  duration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  matchScore: number;
  reason: string;
  reasonIcon: "skill-gap" | "trending" | "role-based" | "peer" | "compliance" | "career";
  tags: string[];
  enrolled: number;
  rating: number;
  instructor: string;
  instructorInitials: string;
  isNew: boolean;
  isTrending: boolean;
  saved: boolean;
  dismissed: boolean;
}

interface SkillGap {
  skill: string;
  current: number;
  target: number;
  priority: "high" | "medium" | "low";
  suggestedCourses: number;
}

interface LearningInsight {
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: typeof TrendingUp;
  color: string;
}

// ─── Mock Data ───
const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "REC01", courseTitle: "AI & Machine Learning cho Doanh nghiệp",
    courseDescription: "Ứng dụng AI/ML vào quy trình kinh doanh: chatbot, dự báo, phân tích dữ liệu tự động cho quản lý cấp trung.",
    category: "Công nghệ", duration: "16 giờ", difficulty: "intermediate", matchScore: 96,
    reason: "Phù hợp với lộ trình phát triển Digital Leadership của bạn", reasonIcon: "career",
    tags: ["AI", "ML", "Digital"], enrolled: 234, rating: 4.8, instructor: "Dr. Trần Hùng", instructorInitials: "TH",
    isNew: true, isTrending: true, saved: false, dismissed: false,
  },
  {
    id: "REC02", courseTitle: "Phân tích Dữ liệu với Python & Power BI",
    courseDescription: "Xây dựng dashboard, phân tích dữ liệu kinh doanh, tạo báo cáo tự động bằng Python và Power BI.",
    category: "Công nghệ", duration: "24 giờ", difficulty: "intermediate", matchScore: 93,
    reason: "Lấp khoảng cách kỹ năng Data Analytics trong IDP của bạn", reasonIcon: "skill-gap",
    tags: ["Python", "Power BI", "Data"], enrolled: 189, rating: 4.7, instructor: "Ngô Trung Kiên", instructorInitials: "NK",
    isNew: false, isTrending: true, saved: true, dismissed: false,
  },
  {
    id: "REC03", courseTitle: "Kỹ năng Đàm phán & Thương lượng Nâng cao",
    courseDescription: "Phương pháp đàm phán Harvard, kỹ thuật BATNA, xử lý xung đột trong đàm phán B2B.",
    category: "Kỹ năng mềm", duration: "8 giờ", difficulty: "advanced", matchScore: 91,
    reason: "87% quản lý cấp trung tại Geleximco đã hoàn thành khóa này", reasonIcon: "peer",
    tags: ["Đàm phán", "Negotiation", "B2B"], enrolled: 456, rating: 4.9, instructor: "Đỗ Thanh Hương", instructorInitials: "TH",
    isNew: false, isTrending: false, saved: false, dismissed: false,
  },
  {
    id: "REC04", courseTitle: "An toàn Thông tin Doanh nghiệp 2026",
    courseDescription: "Chính sách ATTT mới, phòng chống phishing, ransomware, bảo mật dữ liệu cá nhân theo PDPA.",
    category: "Compliance", duration: "4 giờ", difficulty: "beginner", matchScore: 89,
    reason: "Đào tạo bắt buộc — Hạn chót: 31/03/2026", reasonIcon: "compliance",
    tags: ["ATTT", "Compliance", "Security"], enrolled: 1230, rating: 4.2, instructor: "Ngô Trung Kiên", instructorInitials: "NK",
    isNew: false, isTrending: false, saved: false, dismissed: false,
  },
  {
    id: "REC05", courseTitle: "ESG & Báo cáo Phát triển Bền vững",
    courseDescription: "Framework GRI, SASB cho báo cáo ESG, carbon accounting, và chiến lược Net Zero.",
    category: "Chiến lược", duration: "12 giờ", difficulty: "intermediate", matchScore: 87,
    reason: "Xu hướng nổi bật: +280% đăng ký trong Q1/2026", reasonIcon: "trending",
    tags: ["ESG", "Sustainability", "GRI"], enrolled: 167, rating: 4.5, instructor: "Lê Quốc Vương", instructorInitials: "LV",
    isNew: true, isTrending: true, saved: false, dismissed: false,
  },
  {
    id: "REC06", courseTitle: "Quản lý Dự án Agile & Scrum Master",
    courseDescription: "Phương pháp Agile, Scrum framework, Kanban, và ứng dụng vào quản lý dự án BĐS, CNTT.",
    category: "Quản trị", duration: "20 giờ", difficulty: "intermediate", matchScore: 85,
    reason: "Phù hợp với vị trí Trưởng phòng của bạn tại Geleximco", reasonIcon: "role-based",
    tags: ["Agile", "Scrum", "PM"], enrolled: 312, rating: 4.6, instructor: "Phạm Anh Tuấn", instructorInitials: "PT",
    isNew: false, isTrending: false, saved: false, dismissed: false,
  },
  {
    id: "REC07", courseTitle: "Tài chính Doanh nghiệp cho Non-Finance Managers",
    courseDescription: "Đọc hiểu BCTC, phân tích tài chính cơ bản, quản lý ngân sách phòng ban hiệu quả.",
    category: "Tài chính", duration: "10 giờ", difficulty: "beginner", matchScore: 82,
    reason: "Lấp khoảng cách kỹ năng Financial Literacy trong đánh giá 360°", reasonIcon: "skill-gap",
    tags: ["Finance", "BCTC", "Budget"], enrolled: 567, rating: 4.4, instructor: "Trần Thị Hương", instructorInitials: "TH",
    isNew: false, isTrending: false, saved: false, dismissed: false,
  },
  {
    id: "REC08", courseTitle: "Public Speaking & Thuyết trình Chuyên nghiệp",
    courseDescription: "Kỹ năng thuyết trình trước đám đông, storytelling, xử lý Q&A, sử dụng slide hiệu quả.",
    category: "Kỹ năng mềm", duration: "6 giờ", difficulty: "beginner", matchScore: 79,
    reason: "92% peers cùng level đã hoàn thành", reasonIcon: "peer",
    tags: ["Speaking", "Presentation", "Soft skill"], enrolled: 890, rating: 4.7, instructor: "Dương Thị Lan", instructorInitials: "DL",
    isNew: false, isTrending: false, saved: false, dismissed: false,
  },
];

const SKILL_GAPS: SkillGap[] = [
  { skill: "Data Analytics", current: 45, target: 80, priority: "high", suggestedCourses: 3 },
  { skill: "Digital Leadership", current: 55, target: 85, priority: "high", suggestedCourses: 2 },
  { skill: "Financial Literacy", current: 60, target: 75, priority: "medium", suggestedCourses: 2 },
  { skill: "Project Management", current: 70, target: 85, priority: "medium", suggestedCourses: 1 },
  { skill: "Communication", current: 75, target: 85, priority: "low", suggestedCourses: 1 },
  { skill: "Strategic Thinking", current: 50, target: 80, priority: "high", suggestedCourses: 2 },
];

const REASON_ICONS: Record<string, { icon: typeof Target; label: string; color: string }> = {
  "skill-gap": { icon: Target, label: "Lấp khoảng cách kỹ năng", color: "#ef4444" },
  "trending": { icon: Flame, label: "Đang thịnh hành", color: "#ea580c" },
  "role-based": { icon: Shield, label: "Phù hợp vị trí", color: "#2563eb" },
  "peer": { icon: Users, label: "Đồng nghiệp đề xuất", color: "#7c3aed" },
  "compliance": { icon: Shield, label: "Bắt buộc", color: "#990803" },
  "career": { icon: TrendingUp, label: "Phát triển nghề nghiệp", color: "#16a34a" },
};

const DIFFICULTY_CONFIG = {
  beginner: { label: "Cơ bản", color: "#16a34a", bg: "#16a34a10" },
  intermediate: { label: "Trung cấp", color: "#2563eb", bg: "#2563eb10" },
  advanced: { label: "Nâng cao", color: "#990803", bg: "#99080310" },
};

export function AIRecommendations() {
  const { user } = useAuth();
  const role = user?.role || "learner";
  const [recs, setRecs] = useState(RECOMMENDATIONS);
  const [tab, setTab] = useState<"recommended" | "skills" | "insights">("recommended");
  const [filterReason, setFilterReason] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [enrolledRecs, setEnrolledRecs] = useState<Set<string>>(new Set());

  const activeRecs = recs.filter(r => !r.dismissed);
  const savedRecs = recs.filter(r => r.saved);

  const toggleSave = (id: string) => setRecs(prev => prev.map(r => r.id === id ? { ...r, saved: !r.saved } : r));
  const dismiss = (id: string) => setRecs(prev => prev.map(r => r.id === id ? { ...r, dismissed: true } : r));

  const enrollRec = (id: string) => {
    setEnrolledRecs(prev => new Set(prev).add(id));
    import("sonner").then(m => m.toast.success("Đã đăng ký khóa học được đề xuất!"));
  };

  const refresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  const filteredRecs = activeRecs.filter(r => filterReason === "all" || r.reasonIcon === filterReason);

  // AI Insights
  const insights: LearningInsight[] = [
    { label: "Giờ học Tuần này", value: "4.5h", change: "+1.2h", up: true, icon: Clock, color: "#990803" },
    { label: "Streak liên tục", value: "12 ngày", change: "+3", up: true, icon: Flame, color: "#ea580c" },
    { label: "Kỹ năng cải thiện", value: "3", change: "+1", up: true, icon: TrendingUp, color: "#16a34a" },
    { label: "Ranking Đơn vị", value: "#5/14", change: "↑2", up: true, icon: Award, color: "#c8a84e" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Gợi ý từ AI</h1>
              <p className="text-gray-500" style={{ fontSize: "11px" }}>Powered by Geleximco AI Engine</p>
            </div>
          </div>
        </div>
        <button onClick={refresh} className={`flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer ${isRefreshing ? "opacity-60" : ""}`} style={{ fontSize: "12px", fontWeight: 500 }}>
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} /> {isRefreshing ? "Đang phân tích..." : "Cập nhật Gợi ý"}
        </button>
      </div>

      {/* AI Summary Banner */}
      <div className="bg-gradient-to-r from-[#990803]/5 via-[#c8a84e]/5 to-transparent rounded-xl border border-[#990803]/10 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>Phân tích AI cho {user?.name || "bạn"}</p>
            <p className="text-gray-500 mt-0.5" style={{ fontSize: "12px" }}>
              Dựa trên hồ sơ IDP, lịch sử học tập, vị trí công việc và xu hướng đào tạo toàn tập đoàn,
              AI đề xuất <strong className="text-[#990803]">{activeRecs.length} khóa học</strong> phù hợp nhất.
              Ưu tiên cao nhất: <strong className="text-[#990803]">Data Analytics</strong> và <strong className="text-[#990803]">Digital Leadership</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {insights.map((ins, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: ins.color + "10" }}>
              <ins.icon className="w-4 h-4" style={{ color: ins.color }} />
            </div>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: ins.color }}>{ins.value}</p>
              <p className="text-gray-400" style={{ fontSize: "10px" }}>{ins.label}</p>
              <p className={`${ins.up ? "text-green-600" : "text-red-500"}`} style={{ fontSize: "9px" }}>{ins.up ? "↑" : "↓"} {ins.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200">
        {[
          { id: "recommended" as const, label: "Gợi ý cho bạn", count: activeRecs.length, icon: Sparkles },
          { id: "skills" as const, label: "Khoảng cách Kỹ năng", count: SKILL_GAPS.filter(s => s.priority === "high").length, icon: Target },
          { id: "insights" as const, label: "AI Insights", icon: Lightbulb },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {"count" in t && t.count !== undefined && <span className="px-1.5 py-0.5 bg-[#990803]/10 text-[#990803] rounded-full" style={{ fontSize: "10px" }}>{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === "recommended" && (
        <div className="space-y-3">
          {/* Filter by reason */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-gray-400" style={{ fontSize: "11px" }}>Lý do:</span>
            <button onClick={() => setFilterReason("all")} className={`px-2.5 py-1 rounded-full cursor-pointer ${filterReason === "all" ? "bg-[#990803] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`} style={{ fontSize: "10px", fontWeight: 500 }}>Tất cả</button>
            {Object.entries(REASON_ICONS).map(([k, v]) => (
              <button key={k} onClick={() => setFilterReason(k)} className={`px-2.5 py-1 rounded-full cursor-pointer flex items-center gap-1 ${filterReason === k ? "text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`} style={{ fontSize: "10px", fontWeight: 500, ...(filterReason === k ? { backgroundColor: v.color } : {}) }}>
                <v.icon className="w-2.5 h-2.5" /> {v.label}
              </button>
            ))}
          </div>

          {/* Recommendation Cards */}
          <div className="space-y-2">
            {filteredRecs.map((rec, idx) => {
              const reasonCfg = REASON_ICONS[rec.reasonIcon];
              const diffCfg = DIFFICULTY_CONFIG[rec.difficulty];
              const ReasonIcon = reasonCfg.icon;
              return (
                <div key={rec.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    {/* Match Score */}
                    <div className="shrink-0 text-center">
                      <div className="relative w-14 h-14">
                        <svg width="56" height="56" viewBox="0 0 56 56" className="rotate-[-90deg]">
                          <circle cx="28" cy="28" r="24" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                          <circle cx="28" cy="28" r="24" fill="none" stroke={rec.matchScore >= 90 ? "#16a34a" : rec.matchScore >= 80 ? "#c8a84e" : "#2563eb"} strokeWidth="4" strokeDasharray={`${(rec.matchScore / 100) * 150.8} 150.8`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span style={{ fontSize: "13px", fontWeight: 700, color: rec.matchScore >= 90 ? "#16a34a" : rec.matchScore >= 80 ? "#c8a84e" : "#2563eb" }}>{rec.matchScore}%</span>
                        </div>
                      </div>
                      <p className="text-gray-300 mt-0.5" style={{ fontSize: "8px" }}>Match</p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        {idx === 0 && <span className="px-1.5 py-0.5 bg-[#990803] text-white rounded" style={{ fontSize: "8px", fontWeight: 700 }}>🏆 #1 Đề xuất</span>}
                        {rec.isNew && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded" style={{ fontSize: "8px", fontWeight: 600 }}>Mới</span>}
                        {rec.isTrending && <span className="px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded flex items-center gap-0.5" style={{ fontSize: "8px", fontWeight: 600 }}><Flame className="w-2 h-2" /> Hot</span>}
                        <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: diffCfg.color, backgroundColor: diffCfg.bg }}>{diffCfg.label}</span>
                        <span className="text-gray-300" style={{ fontSize: "9px" }}>{rec.category}</span>
                      </div>
                      <h4 className="text-gray-800 hover:text-[#990803] cursor-pointer" style={{ fontSize: "14px", fontWeight: 600 }}>{rec.courseTitle}</h4>
                      <p className="text-gray-400 mt-0.5 line-clamp-1" style={{ fontSize: "12px" }}>{rec.courseDescription}</p>

                      {/* AI Reason */}
                      <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: reasonCfg.color + "08" }}>
                        <ReasonIcon className="w-3.5 h-3.5 shrink-0" style={{ color: reasonCfg.color }} />
                        <span style={{ fontSize: "11px", color: reasonCfg.color, fontWeight: 500 }}>{rec.reason}</span>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-gray-400 flex-wrap" style={{ fontSize: "11px" }}>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {rec.duration}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {rec.enrolled} học viên</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-[#c8a84e] fill-[#c8a84e]" /> {rec.rating}</span>
                        <span className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-[#990803] text-white flex items-center justify-center" style={{ fontSize: "6px", fontWeight: 700 }}>{rec.instructorInitials}</div>
                          {rec.instructor}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button onClick={() => toggleSave(rec.id)} className="p-1 cursor-pointer" title={rec.saved ? "Bỏ lưu" : "Lưu"}>
                        <Heart className={`w-4 h-4 ${rec.saved ? "text-red-500 fill-red-500" : "text-gray-200 hover:text-red-400"}`} />
                      </button>
                      {enrolledRecs.has(rec.id) ? (
                        <span className="px-3 py-1.5 bg-green-600 text-white rounded-lg flex items-center gap-1" style={{ fontSize: "11px", fontWeight: 600 }}>
                          <CheckCircle className="w-3 h-3" /> Đã đăng ký
                        </span>
                      ) : (
                        <button onClick={() => enrollRec(rec.id)} className="px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer flex items-center gap-1" style={{ fontSize: "11px", fontWeight: 600 }}>
                          <BookOpen className="w-3 h-3" /> Đăng ký
                        </button>
                      )}
                      <button onClick={() => dismiss(rec.id)} className="text-gray-300 hover:text-gray-500 cursor-pointer" style={{ fontSize: "10px" }}>
                        Ẩn gợi ý
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRecs.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-gray-200 mx-auto" />
              <p className="text-gray-400 mt-2" style={{ fontSize: "13px" }}>Không có gợi ý nào phù hợp</p>
            </div>
          )}
        </div>
      )}

      {tab === "skills" && (
        <div className="space-y-3">
          <p className="text-gray-500" style={{ fontSize: "12px" }}>AI phân tích từ IDP, đánh giá 360°, lịch sử học tập, và yêu cầu vị trí công việc của bạn.</p>

          {/* Radar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Bản đồ Kỹ năng</h3>
            <div className="flex justify-center">
              <svg width="320" height="300" viewBox="0 0 320 300">
                {/* Radar grid */}
                {[20, 40, 60, 80, 100].map(level => {
                  const r = (level / 100) * 120;
                  const pts = SKILL_GAPS.map((_, i) => {
                    const angle = (i / SKILL_GAPS.length) * Math.PI * 2 - Math.PI / 2;
                    return `${160 + r * Math.cos(angle)},${150 + r * Math.sin(angle)}`;
                  }).join(" ");
                  return <polygon key={level} points={pts} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />;
                })}
                {/* Axis lines */}
                {SKILL_GAPS.map((_, i) => {
                  const angle = (i / SKILL_GAPS.length) * Math.PI * 2 - Math.PI / 2;
                  return <line key={i} x1="160" y1="150" x2={160 + 120 * Math.cos(angle)} y2={150 + 120 * Math.sin(angle)} stroke="#e5e7eb" strokeWidth="0.5" />;
                })}
                {/* Target polygon */}
                <polygon points={SKILL_GAPS.map((s, i) => {
                  const angle = (i / SKILL_GAPS.length) * Math.PI * 2 - Math.PI / 2;
                  const r = (s.target / 100) * 120;
                  return `${160 + r * Math.cos(angle)},${150 + r * Math.sin(angle)}`;
                }).join(" ")} fill="#c8a84e" fillOpacity="0.1" stroke="#c8a84e" strokeWidth="1.5" strokeDasharray="4 2" />
                {/* Current polygon */}
                <polygon points={SKILL_GAPS.map((s, i) => {
                  const angle = (i / SKILL_GAPS.length) * Math.PI * 2 - Math.PI / 2;
                  const r = (s.current / 100) * 120;
                  return `${160 + r * Math.cos(angle)},${150 + r * Math.sin(angle)}`;
                }).join(" ")} fill="#990803" fillOpacity="0.15" stroke="#990803" strokeWidth="2" />
                {/* Dots + Labels */}
                {SKILL_GAPS.map((s, i) => {
                  const angle = (i / SKILL_GAPS.length) * Math.PI * 2 - Math.PI / 2;
                  const cR = (s.current / 100) * 120;
                  const labelR = 140;
                  return (
                    <g key={i}>
                      <circle cx={160 + cR * Math.cos(angle)} cy={150 + cR * Math.sin(angle)} r="4" fill="#990803" />
                      <text x={160 + labelR * Math.cos(angle)} y={150 + labelR * Math.sin(angle)} textAnchor="middle" dominantBaseline="central" fill="#6b7280" style={{ fontSize: "10px", fontWeight: 500 }}>{s.skill}</text>
                    </g>
                  );
                })}
                {/* Legend */}
                <rect x="60" y="285" width="12" height="3" rx="1.5" fill="#990803" />
                <text x="76" y="288" fill="#6b7280" style={{ fontSize: "9px" }}>Hiện tại</text>
                <rect x="140" y="285" width="12" height="3" rx="1.5" fill="#c8a84e" strokeDasharray="4 2" />
                <text x="156" y="288" fill="#6b7280" style={{ fontSize: "9px" }}>Mục tiêu</text>
              </svg>
            </div>
          </div>

          {/* Skill Gap List */}
          <div className="space-y-2">
            {SKILL_GAPS.sort((a, b) => (b.target - b.current) - (a.target - a.current)).map(gap => {
              const gapPct = gap.target - gap.current;
              const priorityColors = { high: "#ef4444", medium: "#ea580c", low: "#16a34a" };
              return (
                <div key={gap.skill} className="bg-white rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>{gap.skill}</span>
                      <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: priorityColors[gap.priority], backgroundColor: priorityColors[gap.priority] + "10" }}>
                        {gap.priority === "high" ? "Ưu tiên cao" : gap.priority === "medium" ? "Trung bình" : "Thấp"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400" style={{ fontSize: "11px" }}>
                      <span>Gap: <strong className="text-[#990803]">-{gapPct}%</strong></span>
                      <span>{gap.suggestedCourses} khóa gợi ý</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 shrink-0 w-16 text-right" style={{ fontSize: "10px" }}>{gap.current}%</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden relative">
                      <div className="h-full rounded-full bg-[#990803]" style={{ width: `${gap.current}%` }} />
                      <div className="absolute top-0 h-full border-l-2 border-dashed border-[#c8a84e]" style={{ left: `${gap.target}%` }} />
                    </div>
                    <span className="text-[#c8a84e] shrink-0 w-16" style={{ fontSize: "10px" }}>{gap.target}% ↑</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "insights" && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-600 mb-3 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
              <Lightbulb className="w-4 h-4 text-[#c8a84e]" /> AI Learning Insights
            </h3>
            <div className="space-y-3">
              {[
                { emoji: "🧠", title: "Phong cách Học tập", desc: "Bạn học hiệu quả nhất với format video ngắn (10-15 phút) + bài tập thực hành. Completion rate với video: 92% vs text: 67%." },
                { emoji: "⏰", title: "Thời gian Tối ưu", desc: "Dữ liệu cho thấy bạn tập trung tốt nhất vào 9:00-11:00 sáng và 14:00-16:00 chiều. Khuyến nghị sắp xếp học vào khung giờ này." },
                { emoji: "📈", title: "Tốc độ Tiến bộ", desc: "Bạn đang học nhanh hơn 78% peers cùng phòng ban. Có thể xem xét khóa nâng cao để thử thách bản thân." },
                { emoji: "🎯", title: "Dự báo Hoàn thành IDP", desc: "Với tốc độ hiện tại, bạn sẽ hoàn thành IDP 2026 vào tháng 10/2026. Tăng 1h/tuần sẽ hoàn thành trước tháng 8/2026." },
                { emoji: "🤝", title: "Cộng đồng Học tập", desc: "Bạn chưa tham gia nhóm học nào. Nghiên cứu cho thấy học nhóm tăng retention 35%. Gợi ý: Nhóm 'Marketing số Geleximco'." },
              ].map((ins, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-gray-700 flex items-center gap-2" style={{ fontSize: "12px", fontWeight: 600 }}>
                    <span style={{ fontSize: "16px" }}>{ins.emoji}</span> {ins.title}
                  </p>
                  <p className="text-gray-500 mt-1 ml-7" style={{ fontSize: "12px", lineHeight: 1.6 }}>{ins.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Learning Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Xu hướng Học tập 12 Tuần</h3>
            <WeeklyTrendChart />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Weekly Trend Chart ───
function WeeklyTrendChart() {
  const data = [2.5, 3.0, 4.2, 3.8, 5.1, 4.5, 3.2, 6.0, 5.5, 4.8, 5.2, 4.5];
  const labels = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];
  const W = 600, H = 160, pL = 35, pR = 10, pT = 10, pB = 25;
  const cW = W - pL - pR, cH = H - pT - pB;
  const maxV = Math.ceil(Math.max(...data));

  return (
    <svg width="100%" height="160" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[0, 2, 4, 6].map(v => {
        const y = pT + cH - (v / maxV) * cH;
        return (
          <g key={v}>
            <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#f3f4f6" strokeWidth="1" />
            <text x={pL - 4} y={y} textAnchor="end" dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "9px" }}>{v}h</text>
          </g>
        );
      })}
      {/* Area */}
      <defs>
        <linearGradient id="aiTrendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#990803" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#990803" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${pL},${pT + cH} ${data.map((v, i) => `L${pL + (i / (data.length - 1)) * cW},${pT + cH - (v / maxV) * cH}`).join(" ")} L${pL + cW},${pT + cH} Z`} fill="url(#aiTrendGrad)" />
      {/* Line */}
      <polyline points={data.map((v, i) => `${pL + (i / (data.length - 1)) * cW},${pT + cH - (v / maxV) * cH}`).join(" ")} fill="none" stroke="#990803" strokeWidth="2" strokeLinejoin="round" />
      {/* Dots + labels */}
      {data.map((v, i) => {
        const x = pL + (i / (data.length - 1)) * cW;
        const y = pT + cH - (v / maxV) * cH;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3" fill="#990803" />
            <text x={x} y={pT + cH + 14} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "8px" }}>{labels[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}