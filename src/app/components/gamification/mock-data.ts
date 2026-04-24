// ============================================================
// GAMIFICATION CENTER — Mock Data & Types
// Geleximco LMS — Points, Badges, Challenges, Rewards
// ============================================================

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";
export type BadgeCategory = "learning" | "exam" | "social" | "streak" | "special" | "compliance";
export type ChallengeStatus = "active" | "upcoming" | "completed" | "expired";
export type ChallengeType = "daily" | "weekly" | "monthly" | "special";
export type RewardCategory = "certificate" | "merchandise" | "privilege" | "training" | "gift";

export interface UserXP {
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  level: number;
  levelName: string;
  rank: number;
  totalUsers: number;
  streakDays: number;
  longestStreak: number;
  weeklyXP: number;
  monthlyXP: number;
  availablePoints: number; // điểm có thể đổi thưởng
}

export interface XPHistory {
  date: string;
  xp: number;
  source: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: BadgeCategory;
  xpReward: number;
  requirement: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;     // 0-100 nếu chưa earned
  totalRequired?: number;
  currentCount?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  status: ChallengeStatus;
  icon: string;
  xpReward: number;
  pointReward: number;
  startDate: string;
  endDate: string;
  progress: number;
  target: number;
  unit: string;
  participants: number;
  color: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: RewardCategory;
  pointCost: number;
  stock: number;
  image: string;        // color placeholder
  popular: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  subsidiary: string;
  xp: number;
  level: number;
  badges: number;
  avatar: string;
  trend: "up" | "down" | "same";
}

// ─── Configs ───

export const BADGE_RARITY_CONFIG: Record<BadgeRarity, { label: string; color: string; bg: string; border: string }> = {
  common:    { label: "Phổ thông", color: "#64748b", bg: "#64748b12", border: "#64748b30" },
  rare:      { label: "Hiếm",     color: "#2563eb", bg: "#2563eb12", border: "#2563eb30" },
  epic:      { label: "Sử thi",   color: "#7c3aed", bg: "#7c3aed12", border: "#7c3aed30" },
  legendary: { label: "Huyền thoại", color: "#c8a84e", bg: "#c8a84e15", border: "#c8a84e40" },
};

export const BADGE_CATEGORY_CONFIG: Record<BadgeCategory, { label: string; icon: string }> = {
  learning:   { label: "Học tập",      icon: "📚" },
  exam:       { label: "Thi cử",      icon: "📝" },
  social:     { label: "Cộng đồng",   icon: "🤝" },
  streak:     { label: "Chuỗi ngày",  icon: "🔥" },
  special:    { label: "Đặc biệt",    icon: "⭐" },
  compliance: { label: "Tuân thủ",    icon: "🛡️" },
};

export const CHALLENGE_TYPE_CONFIG: Record<ChallengeType, { label: string; color: string }> = {
  daily:   { label: "Hàng ngày",  color: "#16a34a" },
  weekly:  { label: "Hàng tuần",  color: "#2563eb" },
  monthly: { label: "Hàng tháng", color: "#7c3aed" },
  special: { label: "Đặc biệt",  color: "#c8a84e" },
};

export const REWARD_CATEGORY_CONFIG: Record<RewardCategory, { label: string; icon: string }> = {
  certificate:  { label: "Chứng chỉ",    icon: "🎓" },
  merchandise:  { label: "Quà tặng",     icon: "🎁" },
  privilege:    { label: "Đặc quyền",    icon: "👑" },
  training:     { label: "Đào tạo",      icon: "📖" },
  gift:         { label: "Voucher",       icon: "🎟️" },
};

export const LEVEL_NAMES = [
  "Tân binh", "Học viên", "Chuyên cần", "Tích cực", "Xuất sắc",
  "Chuyên gia", "Bậc thầy", "Huyền thoại", "Kim cương", "Geleximco Star",
];

export const LEVEL_THRESHOLDS = [0, 500, 1500, 3500, 7000, 12000, 20000, 35000, 55000, 80000];

// ─── Mock User XP ───

export const USER_XP: UserXP = {
  totalXP: 14_850,
  currentLevelXP: 14_850 - 12_000,
  nextLevelXP: 20_000 - 12_000,
  level: 6,
  levelName: "Bậc thầy",
  rank: 23,
  totalUsers: 6_610,
  streakDays: 12,
  longestStreak: 28,
  weeklyXP: 420,
  monthlyXP: 1_680,
  availablePoints: 3_250,
};

// ─── XP History (last 30 days) ───

export const XP_HISTORY: XPHistory[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 1, 11 + i); // Feb 11 -> Mar 12
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const sources = ["Hoàn thành bài học", "Đạt bài kiểm tra", "Tham gia diễn đàn", "Chuỗi ngày học", "Thử thách tuần"];
  return {
    date: `${day.toString().padStart(2, "0")}/${month.toString().padStart(2, "0")}`,
    xp: 20 + Math.floor(Math.sin(i * 0.7) * 30 + 50 + (i % 7 === 0 ? 80 : 0)),
    source: sources[i % sources.length],
  };
});

// ─── Badges ───

export const BADGES: Badge[] = [
  // Learning
  { id: "B01", name: "Bước đầu Tiên", description: "Hoàn thành khóa học đầu tiên", icon: "🎯", rarity: "common", category: "learning", xpReward: 50, requirement: "Hoàn thành 1 khóa học", earned: true, earnedDate: "15/01/2026" },
  { id: "B02", name: "Học giả Chăm chỉ", description: "Hoàn thành 10 khóa học", icon: "📖", rarity: "rare", category: "learning", xpReward: 200, requirement: "Hoàn thành 10 khóa học", earned: true, earnedDate: "28/02/2026" },
  { id: "B03", name: "Bách khoa Toàn thư", description: "Hoàn thành 50 khóa học", icon: "📚", rarity: "epic", category: "learning", xpReward: 500, requirement: "Hoàn thành 50 khóa học", earned: false, progress: 64, totalRequired: 50, currentCount: 32 },
  { id: "B04", name: "Huyền thoại Tri thức", description: "Hoàn thành 100 khóa học", icon: "🏛️", rarity: "legendary", category: "learning", xpReward: 1000, requirement: "Hoàn thành 100 khóa học", earned: false, progress: 32, totalRequired: 100, currentCount: 32 },

  // Exam
  { id: "B05", name: "Thủ khoa", description: "Đạt 100 điểm trong bài thi", icon: "💯", rarity: "rare", category: "exam", xpReward: 150, requirement: "Đạt điểm tuyệt đối 100/100", earned: true, earnedDate: "05/02/2026" },
  { id: "B06", name: "Bách chiến Bách thắng", description: "Đạt trên 90 điểm trong 10 bài thi liên tiếp", icon: "⚔️", rarity: "epic", category: "exam", xpReward: 400, requirement: "10 bài thi ≥90 liên tiếp", earned: false, progress: 70, totalRequired: 10, currentCount: 7 },
  { id: "B07", name: "Siêu trí nhớ", description: "Hoàn thành 5 bài thi trong 1 ngày", icon: "🧠", rarity: "rare", category: "exam", xpReward: 200, requirement: "5 bài thi/ngày", earned: true, earnedDate: "10/03/2026" },
  { id: "B08", name: "Kim cương Kiểm tra", description: "Đạt trên 95 điểm TB trong 20 bài thi", icon: "💎", rarity: "legendary", category: "exam", xpReward: 800, requirement: "TB ≥95 trong 20 bài", earned: false, progress: 45, totalRequired: 20, currentCount: 9 },

  // Social
  { id: "B09", name: "Người kết nối", description: "Nhận 5 mentor request", icon: "🔗", rarity: "common", category: "social", xpReward: 50, requirement: "5 mentor requests", earned: true, earnedDate: "20/01/2026" },
  { id: "B10", name: "Diễn giả Tài ba", description: "Tạo 20 bài đăng diễn đàn được 50+ lượt thích", icon: "🎤", rarity: "epic", category: "social", xpReward: 350, requirement: "20 bài viết 50+ likes", earned: false, progress: 35, totalRequired: 20, currentCount: 7 },
  { id: "B11", name: "Ngôi sao Giúp đỡ", description: "Trả lời 100 câu hỏi trên diễn đàn", icon: "🌟", rarity: "rare", category: "social", xpReward: 250, requirement: "Trả lời 100 câu hỏi", earned: false, progress: 58, totalRequired: 100, currentCount: 58 },

  // Streak
  { id: "B12", name: "7 Ngày Không nghỉ", description: "Học 7 ngày liên tiếp", icon: "🔥", rarity: "common", category: "streak", xpReward: 100, requirement: "Chuỗi 7 ngày", earned: true, earnedDate: "22/01/2026" },
  { id: "B13", name: "Tháng Liên tục", description: "Học 30 ngày liên tiếp", icon: "🌋", rarity: "rare", category: "streak", xpReward: 300, requirement: "Chuỗi 30 ngày", earned: false, progress: 40, totalRequired: 30, currentCount: 12 },
  { id: "B14", name: "Quý Bền bỉ", description: "Học 90 ngày liên tiếp", icon: "🏔️", rarity: "epic", category: "streak", xpReward: 600, requirement: "Chuỗi 90 ngày", earned: false, progress: 13, totalRequired: 90, currentCount: 12 },
  { id: "B15", name: "Chiến binh 365", description: "Học mỗi ngày trong 1 năm", icon: "👑", rarity: "legendary", category: "streak", xpReward: 2000, requirement: "Chuỗi 365 ngày", earned: false, progress: 3, totalRequired: 365, currentCount: 12 },

  // Compliance
  { id: "B16", name: "Tuân thủ Mẫu mực", description: "Hoàn thành tất cả đào tạo bắt buộc đúng hạn", icon: "🛡️", rarity: "rare", category: "compliance", xpReward: 200, requirement: "100% compliance đúng hạn", earned: true, earnedDate: "01/03/2026" },
  { id: "B17", name: "An toàn Số 1", description: "Đạt 100 điểm ATLĐ & PCCC", icon: "🦺", rarity: "common", category: "compliance", xpReward: 100, requirement: "100 điểm ATLĐ", earned: true, earnedDate: "15/02/2026" },

  // Special
  { id: "B18", name: "Nhà Tiên phong", description: "Nằm trong top 10 người dùng đầu tiên của LMS", icon: "🚀", rarity: "legendary", category: "special", xpReward: 500, requirement: "Top 10 early adopters", earned: true, earnedDate: "01/01/2026" },
  { id: "B19", name: "Geleximco Spirit", description: "Tham gia sự kiện đào tạo toàn tập đoàn", icon: "🏢", rarity: "epic", category: "special", xpReward: 300, requirement: "Sự kiện toàn tập đoàn", earned: true, earnedDate: "20/02/2026" },
  { id: "B20", name: "Mentor Vàng", description: "Mentor cho 10 nhân viên mới thành công", icon: "💛", rarity: "legendary", category: "special", xpReward: 1000, requirement: "Mentor 10 NV mới", earned: false, progress: 30, totalRequired: 10, currentCount: 3 },
];

// ─── Challenges ───

export const CHALLENGES: Challenge[] = [
  {
    id: "CH01", title: "Học mỗi ngày", description: "Hoàn thành ít nhất 1 bài học mỗi ngày",
    type: "daily", status: "active", icon: "📖", xpReward: 30, pointReward: 15,
    startDate: "12/03/2026", endDate: "12/03/2026", progress: 1, target: 1, unit: "bài học",
    participants: 3420, color: "#16a34a",
  },
  {
    id: "CH02", title: "Tuần Siêu tốc", description: "Hoàn thành 5 khóa học trong tuần này",
    type: "weekly", status: "active", icon: "⚡", xpReward: 200, pointReward: 100,
    startDate: "09/03/2026", endDate: "15/03/2026", progress: 3, target: 5, unit: "khóa học",
    participants: 1850, color: "#2563eb",
  },
  {
    id: "CH03", title: "Bậc thầy Kiểm tra", description: "Đạt ≥85 điểm trong 10 bài kiểm tra tháng 3",
    type: "monthly", status: "active", icon: "🎯", xpReward: 500, pointReward: 250,
    startDate: "01/03/2026", endDate: "31/03/2026", progress: 4, target: 10, unit: "bài thi ≥85đ",
    participants: 2200, color: "#7c3aed",
  },
  {
    id: "CH04", title: "Ngày Compliance", description: "Hoàn thành 1 khóa đào tạo bắt buộc hôm nay",
    type: "daily", status: "active", icon: "🛡️", xpReward: 50, pointReward: 25,
    startDate: "12/03/2026", endDate: "12/03/2026", progress: 0, target: 1, unit: "khóa bắt buộc",
    participants: 4100, color: "#dc2626",
  },
  {
    id: "CH05", title: "Diễn đàn Sôi động", description: "Đăng 3 bài và trả lời 5 câu hỏi trong tuần",
    type: "weekly", status: "active", icon: "💬", xpReward: 150, pointReward: 75,
    startDate: "09/03/2026", endDate: "15/03/2026", progress: 5, target: 8, unit: "bài + trả lời",
    participants: 980, color: "#ea580c",
  },
  {
    id: "CH06", title: "ESG Champion", description: "Hoàn thành module ESG & Phát triển Bền vững",
    type: "special", status: "active", icon: "🌱", xpReward: 300, pointReward: 150,
    startDate: "01/03/2026", endDate: "31/03/2026", progress: 60, target: 100, unit: "% hoàn thành",
    participants: 1500, color: "#16a34a",
  },
  {
    id: "CH07", title: "Sprint Tháng 4", description: "Đạt 2,000 XP trong tháng 4",
    type: "monthly", status: "upcoming", icon: "🏃", xpReward: 400, pointReward: 200,
    startDate: "01/04/2026", endDate: "30/04/2026", progress: 0, target: 2000, unit: "XP",
    participants: 0, color: "#0891b2",
  },
  {
    id: "CH08", title: "Hackathon Đào tạo", description: "Tạo 1 khóa học micro-learning hoàn chỉnh",
    type: "special", status: "upcoming", icon: "🏆", xpReward: 1000, pointReward: 500,
    startDate: "20/03/2026", endDate: "27/03/2026", progress: 0, target: 1, unit: "khóa học",
    participants: 0, color: "#c8a84e",
  },
];

// ─── Rewards Store ───

export const REWARDS: Reward[] = [
  { id: "RW01", name: "Chứng chỉ Digital — Excel Nâng cao", description: "Chứng chỉ kỹ năng Excel do Geleximco cấp", icon: "🎓", category: "certificate", pointCost: 500, stock: 999, image: "#2563eb", popular: true },
  { id: "RW02", name: "Áo Polo Geleximco Limited", description: "Áo polo phiên bản giới hạn in logo Geleximco", icon: "👔", category: "merchandise", pointCost: 1500, stock: 50, image: "#990803", popular: true },
  { id: "RW03", name: "Voucher Grab 100K", description: "Mã giảm giá Grab 100.000 VNĐ", icon: "🎟️", category: "gift", pointCost: 800, stock: 200, image: "#16a34a", popular: true },
  { id: "RW04", name: "Skip 1 bài Kiểm tra", description: "Quyền bỏ qua 1 bài kiểm tra không bắt buộc", icon: "⏭️", category: "privilege", pointCost: 2000, stock: 20, image: "#7c3aed", popular: false },
  { id: "RW05", name: "Khóa học Premium — AI/ML", description: "Truy cập khóa học AI/ML từ đối tác Coursera", icon: "🤖", category: "training", pointCost: 3000, stock: 30, image: "#0891b2", popular: true },
  { id: "RW06", name: "Bình giữ nhiệt Geleximco", description: "Bình giữ nhiệt cao cấp khắc tên cá nhân", icon: "☕", category: "merchandise", pointCost: 1000, stock: 100, image: "#c8a84e", popular: false },
  { id: "RW07", name: "Ngày nghỉ Thưởng", description: "1 ngày nghỉ phép thưởng (cần phê duyệt Manager)", icon: "🏖️", category: "privilege", pointCost: 5000, stock: 10, image: "#ea580c", popular: true },
  { id: "RW08", name: "Voucher Shopee 200K", description: "Mã giảm giá Shopee 200.000 VNĐ", icon: "🛒", category: "gift", pointCost: 1500, stock: 150, image: "#ee4d2d", popular: false },
  { id: "RW09", name: "Mentor 1-on-1 với C-Level", description: "30 phút mentor riêng với lãnh đạo cấp cao", icon: "👨‍💼", category: "privilege", pointCost: 4000, stock: 5, image: "#990803", popular: true },
  { id: "RW10", name: "Chứng chỉ PMP Mock Exam", description: "Truy cập bộ đề thi thử PMP đầy đủ", icon: "📋", category: "training", pointCost: 2500, stock: 50, image: "#f59e0b", popular: false },
];

// ─── Mini Leaderboard ───

export const MINI_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Nguyễn Minh Tuấn", subsidiary: "ABBank", xp: 28500, level: 8, badges: 16, avatar: "NMT", trend: "same" },
  { rank: 2, name: "Trần Thị Hương", subsidiary: "VP Tập đoàn", xp: 26200, level: 8, badges: 14, avatar: "TTH", trend: "up" },
  { rank: 3, name: "Lê Quốc Vương", subsidiary: "Geleximco Land", xp: 24800, level: 7, badges: 15, avatar: "LQV", trend: "up" },
  { rank: 4, name: "Phạm Đức Mạnh", subsidiary: "Construction", xp: 22100, level: 7, badges: 12, avatar: "PDM", trend: "down" },
  { rank: 5, name: "Vũ Thị Phương", subsidiary: "ABBank", xp: 20500, level: 7, badges: 13, avatar: "VTP", trend: "up" },
  { rank: 6, name: "Hoàng Đức Em", subsidiary: "Energy", xp: 19800, level: 6, badges: 11, avatar: "HDE", trend: "same" },
  { rank: 7, name: "Đỗ Thanh Hương", subsidiary: "Technology", xp: 18200, level: 6, badges: 10, avatar: "DTH", trend: "down" },
  { rank: 8, name: "Bùi Thị Hà", subsidiary: "Insurance", xp: 16400, level: 6, badges: 11, avatar: "BTH", trend: "up" },
  { rank: 9, name: "Ngô Trung Kiên", subsidiary: "VP Tập đoàn", xp: 15600, level: 6, badges: 9, avatar: "NTK", trend: "up" },
  { rank: 10, name: "Dương Thị Lan", subsidiary: "Hospitality", xp: 15100, level: 6, badges: 10, avatar: "DTL", trend: "down" },
];

// ─── Helpers ───

export function getLevelFromXP(xp: number): { level: number; name: string; progress: number } {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) { level = i + 1; break; }
  }
  const current = LEVEL_THRESHOLDS[level - 1] || 0;
  const next = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 30000;
  const progress = Math.round(((xp - current) / (next - current)) * 100);
  return { level, name: LEVEL_NAMES[level - 1] || "Tân binh", progress };
}

export function getEarnedBadgesCount(): number {
  return BADGES.filter(b => b.earned).length;
}

export function getActiveChallengesCount(): number {
  return CHALLENGES.filter(c => c.status === "active").length;
}
