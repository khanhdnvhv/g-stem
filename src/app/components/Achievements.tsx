import { useState } from "react";
import {
  Trophy, Star, Flame, Zap, Target, Award, BookOpen, Clock,
  Users, TrendingUp, Lock, CheckCircle2, Crown, Medal,
  Sparkles, Brain, Heart, MessageCircle, GraduationCap,
  Shield, Eye, Calendar, BarChart3, ChevronRight, Gift,
} from "lucide-react";
import { useAuth } from "./AuthContext";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "learning" | "social" | "mastery" | "milestone" | "special";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  xpReward: number;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedDate?: string;
  secret?: boolean;
}

interface XPLevel {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  color: string;
  perks: string[];
}

const XP_LEVELS: XPLevel[] = [
  { level: 1, title: "Tân binh", minXP: 0, maxXP: 500, color: "#94a3b8", perks: ["Truy cập khóa học cơ bản"] },
  { level: 2, title: "Học viên", minXP: 500, maxXP: 1500, color: "#22c55e", perks: ["Mở khóa Diễn đàn", "Badge profile"] },
  { level: 3, title: "Chuyên cần", minXP: 1500, maxXP: 3000, color: "#3b82f6", perks: ["Tải tài liệu offline", "Ưu tiên đăng ký"] },
  { level: 4, title: "Tinh nhuệ", minXP: 3000, maxXP: 5000, color: "#8b5cf6", perks: ["Mentoring access", "Custom avatar"] },
  { level: 5, title: "Chuyên gia", minXP: 5000, maxXP: 8000, color: "#c8a84e", perks: ["Đề xuất khóa học", "VIP support"] },
  { level: 6, title: "Bậc thầy", minXP: 8000, maxXP: 12000, color: "#f97316", perks: ["Contributor badge", "Early access"] },
  { level: 7, title: "Huyền thoại", minXP: 12000, maxXP: 20000, color: "#ef4444", perks: ["Instructor invitation", "Gold frame"] },
  { level: 8, title: "Tổng Tư lệnh", minXP: 20000, maxXP: 999999, color: "#990803", perks: ["All perks", "Exclusive events"] },
];

const rarityConfig = {
  common: { label: "Phổ thông", color: "#94a3b8", bg: "bg-gray-100", border: "border-gray-200" },
  uncommon: { label: "Không phổ biến", color: "#22c55e", bg: "bg-green-50", border: "border-green-200" },
  rare: { label: "Hiếm", color: "#3b82f6", bg: "bg-blue-50", border: "border-blue-200" },
  epic: { label: "Sử thi", color: "#8b5cf6", bg: "bg-purple-50", border: "border-purple-200" },
  legendary: { label: "Huyền thoại", color: "#c8a84e", bg: "bg-yellow-50", border: "border-yellow-200" },
};

const categoryConfig = {
  learning: { label: "Học tập", icon: BookOpen, color: "#2e86de" },
  social: { label: "Cộng đồng", icon: Users, color: "#27ae60" },
  mastery: { label: "Thành thạo", icon: Brain, color: "#8b5cf6" },
  milestone: { label: "Cột mốc", icon: Target, color: "#c8a84e" },
  special: { label: "Đặc biệt", icon: Sparkles, color: "#990803" },
};

const mockAchievements: Achievement[] = [
  // Learning
  { id: "A001", title: "Bước đầu tiên", description: "Hoàn thành bài học đầu tiên", icon: "🎯", category: "learning", rarity: "common", xpReward: 50, progress: 1, maxProgress: 1, unlocked: true, unlockedDate: "01/02/2026" },
  { id: "A002", title: "Chăm chỉ", description: "Hoàn thành 10 bài học", icon: "📚", category: "learning", rarity: "common", xpReward: 100, progress: 10, maxProgress: 10, unlocked: true, unlockedDate: "15/02/2026" },
  { id: "A003", title: "Học giả", description: "Hoàn thành 50 bài học", icon: "🎓", category: "learning", rarity: "uncommon", xpReward: 300, progress: 38, maxProgress: 50, unlocked: false },
  { id: "A004", title: "Bách khoa Toàn thư", description: "Hoàn thành khóa học ở 5 danh mục khác nhau", icon: "🌐", category: "learning", rarity: "rare", xpReward: 500, progress: 3, maxProgress: 5, unlocked: false },
  { id: "A005", title: "Tốc độ ánh sáng", description: "Hoàn thành 1 khóa học trong 24 giờ", icon: "⚡", category: "learning", rarity: "epic", xpReward: 800, progress: 0, maxProgress: 1, unlocked: false },

  // Social
  { id: "A006", title: "Tiên phong", description: "Đăng bài đầu tiên trên Diễn đàn", icon: "💬", category: "social", rarity: "common", xpReward: 50, progress: 1, maxProgress: 1, unlocked: true, unlockedDate: "05/02/2026" },
  { id: "A007", title: "Người giúp đỡ", description: "Trả lời 20 câu hỏi trên Diễn đàn", icon: "🤝", category: "social", rarity: "uncommon", xpReward: 200, progress: 12, maxProgress: 20, unlocked: false },
  { id: "A008", title: "Mentor của tháng", description: "Được vote là mentor tốt nhất", icon: "👨‍🏫", category: "social", rarity: "legendary", xpReward: 1500, progress: 0, maxProgress: 1, unlocked: false },

  // Mastery
  { id: "A009", title: "Hoàn hảo", description: "Đạt 100% trong 1 bài kiểm tra", icon: "💯", category: "mastery", rarity: "uncommon", xpReward: 200, progress: 1, maxProgress: 1, unlocked: true, unlockedDate: "20/02/2026" },
  { id: "A010", title: "Streaker", description: "Duy trì streak 30 ngày liên tiếp", icon: "🔥", category: "mastery", rarity: "rare", xpReward: 500, progress: 7, maxProgress: 30, unlocked: false },
  { id: "A011", title: "Night Owl", description: "Học lúc 2:00 AM", icon: "🦉", category: "mastery", rarity: "rare", xpReward: 300, progress: 0, maxProgress: 1, unlocked: false, secret: true },

  // Milestone
  { id: "A012", title: "100 giờ", description: "Tích lũy 100 giờ học", icon: "⏱️", category: "milestone", rarity: "rare", xpReward: 600, progress: 55, maxProgress: 100, unlocked: false },
  { id: "A013", title: "5 Chứng chỉ", description: "Nhận 5 chứng chỉ", icon: "🏆", category: "milestone", rarity: "epic", xpReward: 1000, progress: 5, maxProgress: 5, unlocked: true, unlockedDate: "07/03/2026" },
  { id: "A014", title: "Khóa học bắt buộc", description: "Hoàn thành tất cả khóa bắt buộc", icon: "✅", category: "milestone", rarity: "uncommon", xpReward: 400, progress: 1, maxProgress: 3, unlocked: false },

  // Special
  { id: "A015", title: "Geleximco Pioneer", description: "Tham gia LMS trong tuần đầu tiên", icon: "🚀", category: "special", rarity: "legendary", xpReward: 2000, progress: 1, maxProgress: 1, unlocked: true, unlockedDate: "01/01/2026" },
  { id: "A016", title: "Cross-unit Champion", description: "Hoàn thành khóa học từ 5 đơn vị khác nhau", icon: "🏢", category: "special", rarity: "epic", xpReward: 1200, progress: 2, maxProgress: 5, unlocked: false },
];

export function Achievements() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showSecrets, setShowSecrets] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  // Mock user stats
  const userXP = 3450;
  const currentLevel = XP_LEVELS.find((l) => userXP >= l.minXP && userXP < l.maxXP) || XP_LEVELS[0];
  const nextLevel = XP_LEVELS.find((l) => l.level === currentLevel.level + 1);
  const levelProgress = nextLevel ? ((userXP - currentLevel.minXP) / (nextLevel.minXP - currentLevel.minXP)) * 100 : 100;
  const unlockedCount = mockAchievements.filter((a) => a.unlocked).length;
  const totalCount = mockAchievements.length;
  const streak = 7;

  const filtered = mockAchievements.filter((a) => {
    if (selectedCategory !== "all" && a.category !== selectedCategory) return false;
    if (a.secret && !a.unlocked && !showSecrets) return false;
    return true;
  });

  const getAchievementIcon = (a: Achievement) => {
    if (a.secret && !a.unlocked) return "❓";
    return a.icon;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700 }}>Thành tích & Gamification</h1>
          <p className="text-gray-500 mt-1" style={{ fontSize: "13px" }}>
            Hệ thống điểm thưởng, huy hiệu và thành tích học tập cá nhân
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 rounded-lg">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-orange-700" style={{ fontSize: "13px", fontWeight: 600 }}>{streak} ngày streak</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-[#c8a84e]/10 rounded-lg">
            <Zap className="w-4 h-4 text-[#c8a84e]" />
            <span className="text-[#c8a84e]" style={{ fontSize: "13px", fontWeight: 600 }}>{userXP.toLocaleString()} XP</span>
          </div>
        </div>
      </div>

      {/* Level Progress Card */}
      <div className="bg-gradient-to-r from-[#990803] to-[#7a0602] rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center" style={{ backgroundColor: currentLevel.color }}>
                <span style={{ fontSize: "24px", fontWeight: 800 }}>{currentLevel.level}</span>
              </div>
              <div>
                <p className="text-white/60" style={{ fontSize: "11px", fontWeight: 500 }}>CẤP ĐỘ HIỆN TẠI</p>
                <h2 className="text-white" style={{ fontSize: "24px", fontWeight: 700 }}>{currentLevel.title}</h2>
                <p className="text-white/50" style={{ fontSize: "12px" }}>{userXP.toLocaleString()} / {(nextLevel?.minXP || currentLevel.maxXP).toLocaleString()} XP</p>
              </div>
            </div>
            <div className="text-right hidden lg:block">
              <p className="text-white/60" style={{ fontSize: "11px" }}>Cấp tiếp theo</p>
              <p className="text-white" style={{ fontSize: "16px", fontWeight: 600 }}>{nextLevel?.title || "MAX"}</p>
              {nextLevel && <p className="text-white/40" style={{ fontSize: "11px" }}>Cần thêm {(nextLevel.minXP - userXP).toLocaleString()} XP</p>}
            </div>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#c8a84e] to-[#f0d88a] rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
          </div>
          {/* Level perks */}
          <div className="flex flex-wrap gap-2 mt-3">
            {currentLevel.perks.map((perk) => (
              <span key={perk} className="flex items-center gap-1 px-2 py-0.5 bg-white/10 rounded-full text-white/80" style={{ fontSize: "10px" }}>
                <CheckCircle2 className="w-3 h-3" /> {perk}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Thành tích", value: `${unlockedCount}/${totalCount}`, icon: Trophy, color: "#c8a84e", sub: `${Math.round((unlockedCount / totalCount) * 100)}% hoàn thành` },
          { label: "Tổng XP", value: userXP.toLocaleString(), icon: Zap, color: "#990803", sub: `Level ${currentLevel.level}` },
          { label: "Streak hiện tại", value: `${streak} ngày`, icon: Flame, color: "#f97316", sub: "Kỷ lục: 45 ngày" },
          { label: "Giờ học tháng", value: "18.5h", icon: Clock, color: "#2e86de", sub: "Mục tiêu: 20h" },
          { label: "Xếp hạng", value: "#11", icon: Crown, color: "#8b5cf6", sub: "Toàn Tập đoàn" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              <span className="text-gray-500" style={{ fontSize: "11px" }}>{stat.label}</span>
            </div>
            <p className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>{stat.value}</p>
            <p className="text-gray-400" style={{ fontSize: "10px" }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* XP Level Roadmap */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-gray-800 mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Lộ trình Cấp độ</h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {XP_LEVELS.map((level, i) => {
            const isCurrentOrPast = userXP >= level.minXP;
            const isCurrent = level.level === currentLevel.level;
            return (
              <div key={level.level} className="flex items-center shrink-0">
                <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${isCurrent ? "bg-[#990803]/10 ring-2 ring-[#990803]/30" : isCurrentOrPast ? "bg-gray-50" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCurrentOrPast ? "" : "opacity-40"}`}
                    style={{ backgroundColor: isCurrentOrPast ? level.color : "transparent", borderColor: level.color, color: isCurrentOrPast ? "white" : level.color }}>
                    <span style={{ fontSize: "11px", fontWeight: 700 }}>{level.level}</span>
                  </div>
                  <span className={`${isCurrentOrPast ? "text-gray-700" : "text-gray-400"}`} style={{ fontSize: "9px", fontWeight: isCurrent ? 700 : 500 }}>{level.title}</span>
                  <span className="text-gray-400" style={{ fontSize: "8px" }}>{level.minXP.toLocaleString()}+</span>
                </div>
                {i < XP_LEVELS.length - 1 && (
                  <div className={`w-8 h-0.5 shrink-0 ${userXP >= XP_LEVELS[i + 1].minXP ? "bg-[#990803]" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement Categories Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${selectedCategory === "all" ? "bg-[#990803] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả ({totalCount})
        </button>
        {Object.entries(categoryConfig).map(([key, config]) => {
          const count = mockAchievements.filter((a) => a.category === key).length;
          const unl = mockAchievements.filter((a) => a.category === key && a.unlocked).length;
          return (
            <button key={key} onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${selectedCategory === key ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              style={{ fontSize: "12px", fontWeight: 500, backgroundColor: selectedCategory === key ? config.color : undefined }}>
              <config.icon className="w-3.5 h-3.5" /> {config.label} ({unl}/{count})
            </button>
          );
        })}
        <label className="flex items-center gap-1.5 ml-auto cursor-pointer">
          <input type="checkbox" checked={showSecrets} onChange={(e) => setShowSecrets(e.target.checked)} className="rounded accent-[#990803]" />
          <span className="text-gray-500" style={{ fontSize: "11px" }}>Hiện ẩn</span>
        </label>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((achievement) => {
          const rConf = rarityConfig[achievement.rarity];
          const cConf = categoryConfig[achievement.category];
          const isSecret = achievement.secret && !achievement.unlocked;
          const progressPct = (achievement.progress / achievement.maxProgress) * 100;

          return (
            <div key={achievement.id}
              className={`relative rounded-xl border p-4 transition-all hover:shadow-md cursor-pointer ${achievement.unlocked ? `${rConf.bg} ${rConf.border}` : "bg-white border-gray-200"} ${isSecret ? "opacity-70" : ""}`}
              onClick={() => setSelectedAchievement(achievement)}>
              {/* Rarity indicator */}
              <div className="absolute top-3 right-3">
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 700, color: rConf.color, backgroundColor: rConf.color + "15" }}>
                  {rConf.label}
                </span>
              </div>

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${achievement.unlocked ? "" : "grayscale opacity-50"}`}
                  style={{ backgroundColor: achievement.unlocked ? rConf.color + "15" : "#f3f4f6", fontSize: "24px" }}>
                  {getAchievementIcon(achievement)}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className={`${achievement.unlocked ? "text-gray-800" : "text-gray-500"}`} style={{ fontSize: "14px", fontWeight: 600 }}>
                    {isSecret ? "???" : achievement.title}
                  </h4>
                  <p className={`mt-0.5 ${achievement.unlocked ? "text-gray-500" : "text-gray-400"}`} style={{ fontSize: "11px", lineHeight: 1.4 }}>
                    {isSecret ? "Hoàn thành điều kiện ẩn để mở khóa" : achievement.description}
                  </p>

                  {/* Progress */}
                  {!achievement.unlocked && !isSecret && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400" style={{ fontSize: "10px" }}>{achievement.progress}/{achievement.maxProgress}</span>
                        <span className="text-gray-400" style={{ fontSize: "10px" }}>{Math.round(progressPct)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: cConf.color }} />
                      </div>
                    </div>
                  )}

                  {/* Unlocked info */}
                  {achievement.unlocked && (
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-green-600" style={{ fontSize: "10px", fontWeight: 500 }}>Mở khóa {achievement.unlockedDate}</span>
                    </div>
                  )}

                  {/* XP Reward */}
                  <div className="flex items-center gap-1 mt-1.5">
                    <Zap className="w-3 h-3" style={{ color: rConf.color }} />
                    <span style={{ fontSize: "10px", fontWeight: 600, color: rConf.color }}>+{achievement.xpReward} XP</span>
                  </div>
                </div>

                {/* Lock icon */}
                {!achievement.unlocked && (
                  <Lock className="w-4 h-4 text-gray-300 shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Challenges */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-800 flex items-center gap-2" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Sparkles className="w-4 h-4 text-[#c8a84e]" /> Thử thách Hàng ngày
          </h3>
          <span className="text-gray-400" style={{ fontSize: "11px" }}>Làm mới lúc 00:00</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: "Hoàn thành 2 bài học", xp: 50, progress: 1, max: 2, icon: BookOpen, color: "#2e86de" },
            { title: "Đạt 80%+ trong 1 quiz", xp: 100, progress: 0, max: 1, icon: Target, color: "#990803" },
            { title: "Tham gia Diễn đàn", xp: 30, progress: 1, max: 1, icon: MessageCircle, color: "#27ae60" },
          ].map((challenge) => {
            const done = challenge.progress >= challenge.max;
            return (
              <div key={challenge.title} className={`p-3 rounded-lg border ${done ? "border-green-200 bg-green-50" : "border-gray-200"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <challenge.icon className="w-4 h-4" style={{ color: done ? "#22c55e" : challenge.color }} />
                  <span className={done ? "text-green-700" : "text-gray-700"} style={{ fontSize: "12px", fontWeight: 500 }}>{challenge.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(challenge.progress / challenge.max) * 100}%`, backgroundColor: done ? "#22c55e" : challenge.color }} />
                  </div>
                  <span className={done ? "text-green-600" : "text-gray-400"} style={{ fontSize: "10px", fontWeight: 600 }}>{challenge.progress}/{challenge.max}</span>
                </div>
                <div className="flex items-center gap-1 mt-1.5">
                  <Zap className="w-3 h-3 text-[#c8a84e]" />
                  <span className="text-[#c8a84e]" style={{ fontSize: "10px", fontWeight: 600 }}>+{challenge.xp} XP</span>
                  {done && <CheckCircle2 className="w-3 h-3 text-green-500 ml-auto" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
