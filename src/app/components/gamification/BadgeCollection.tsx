import React from "react";
import {
  Search, Lock, CheckCircle, CheckCircle2, X, Pin, PinOff,
  Share2, Zap, ChevronRight, ChevronDown,
  Clock, Star, ArrowUpDown, LayoutGrid, List,
  CalendarDays, Target, Sparkles, Gift, BarChart3, Lightbulb,
  Award, Flame, ChevronUp, Crown, Shield, Eye,
} from "lucide-react";
import {
  BADGES, BADGE_RARITY_CONFIG, BADGE_CATEGORY_CONFIG,
  type Badge, type BadgeRarity, type BadgeCategory,
} from "./mock-data";
import { copyToClipboard } from "../../utils/clipboard";
import { useAuth } from "../AuthContext";
import { BadgeAdmin } from "./BadgeAdmin";

/* ============================================================ */
/*  TYPES & CONFIG                                               */
/* ============================================================ */

type ViewMode = "grid" | "list" | "timeline";
type SortBy = "name" | "rarity" | "xp" | "progress" | "date";
type EarnedFilter = "all" | "earned" | "locked" | "near";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "name", label: "Tên A-Z" },
  { value: "rarity", label: "Độ hiếm" },
  { value: "xp", label: "XP thưởng" },
  { value: "progress", label: "Tiến độ" },
  { value: "date", label: "Ngày đạt" },
];

const RARITY_ORDER: Record<BadgeRarity, number> = { common: 1, rare: 2, epic: 3, legendary: 4 };

/* Showcase default pins */
const DEFAULT_SHOWCASE = ["B18", "B05", "B01"];

/* Badge sets (collections that give bonus XP when completed) */
const BADGE_SETS = [
  { id: "SET1", name: "Bộ sưu tập Học tập", icon: "📚", badgeIds: ["B01", "B02", "B03", "B04"], bonusXP: 500, description: "Thu thập đầy đủ 4 huy hiệu Học tập" },
  { id: "SET2", name: "Bộ sưu tập Chuỗi ngày", icon: "🔥", badgeIds: ["B12", "B13", "B14", "B15"], bonusXP: 1000, description: "Hoàn thành toàn bộ thử thách chuỗi ngày" },
  { id: "SET3", name: "Bộ sưu tập Thi cử", icon: "📝", badgeIds: ["B05", "B06", "B07", "B08"], bonusXP: 800, description: "Chinh phục mọi thử thách thi cử" },
  { id: "SET4", name: "Bộ sưu tập Huyền thoại", icon: "👑", badgeIds: ["B04", "B08", "B15", "B18", "B20"], bonusXP: 2000, description: "Sở hữu toàn bộ huy hiệu Huyền thoại" },
];

/* Tips for locked badges */
const BADGE_TIPS: Record<string, string[]> = {
  B03: ["Bạn đã hoàn thành 32/50 khóa. Hãy tham gia khóa 'Kỹ năng Số' và 'ESG' để tăng tốc!", "Mỗi micro-learning cũng được tính. Xem danh sách khóa ngắn 15 phút."],
  B04: ["Hành trình 100 khóa cần kiên trì. Đặt mục tiêu 2 khóa/tuần để đạt trong 8 tháng.", "Tận dụng khóa offline để học mọi lúc mọi nơi."],
  B06: ["Đạt 90+ liên tiếp đòi hỏi ôn tập kỹ. Dùng tính năng Flashcard trong LMS.", "7/10 rồi! Chỉ còn 3 bài thi nữa là đạt."],
  B08: ["Focus vào các bài thi có trọng số cao. Ôn tập bằng ngân hàng đề thi.", "Sử dụng chế độ Practice Mode trước khi thi chính thức."],
  B10: ["Chia sẻ kinh nghiệm thực tế từ công việc — bài viết chất lượng dễ nhận like.", "Tương tác tích cực với bài viết của đồng nghiệp cũng giúp tăng visibility."],
  B11: ["Theo dõi mục 'Câu hỏi chưa trả lời' trên Diễn đàn. Trả lời nhanh = nhiều like hơn."],
  B13: ["Đặt nhắc nhở học mỗi ngày lúc 8:00 AM. Chỉ cần 10 phút cũng tính!", "Bạn đang ở ngày 12. Thêm 18 ngày nữa!"],
  B14: ["Tận dụng Offline Mode để duy trì streak khi đi công tác.", "Nghe Audio lesson cũng tính streak — thử podcast CEO chia sẻ tầm nhìn."],
  B15: ["Đây là thử thách cao nhất. Đặt mục tiêu micro — chỉ 5 phút/ngày để duy trì.", "Liên kết với Buddy để nhắc nhở lẫn nhau."],
  B20: ["Đăng ký làm mentor trên module Mentoring. Mỗi mentee hoàn thành onboard = 1 count.", "Bạn đã mentor thành công 3 người. Chỉ còn 7 nữa!"],
};

/* ============================================================ */
/*  BADGE COLLECTION — MAIN COMPONENT                           */
/* ============================================================ */

export function BadgeCollection() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [adminView, setAdminView] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState<BadgeCategory | "all">("all");
  const [filterRarity, setFilterRarity] = React.useState<BadgeRarity | "all">("all");
  const [showEarned, setShowEarned] = React.useState<EarnedFilter>("all");
  const [sortBy, setSortBy] = React.useState<SortBy>("rarity");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [selectedBadge, setSelectedBadge] = React.useState<Badge | null>(null);
  const [showcaseBadges, setShowcaseBadges] = React.useState<string[]>(DEFAULT_SHOWCASE);
  const [showSets, setShowSets] = React.useState(false);
  const [showNearSection, setShowNearSection] = React.useState(true);
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);
  const [celebratingId, setCelebratingId] = React.useState<string | null>(null);

  /* ── Toast helper ── */
  const showToast = React.useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  }, []);

  /* ── Computed ── */
  const earnedCount = BADGES.filter(b => b.earned).length;
  const totalXPEarned = BADGES.filter(b => b.earned).reduce((s, b) => s + b.xpReward, 0);
  const totalXPPossible = BADGES.reduce((s, b) => s + b.xpReward, 0);

  /* Near-unlock badges: locked, have progress >= 50% */
  const nearBadges = React.useMemo(() =>
    BADGES.filter(b => !b.earned && b.progress !== undefined && b.progress >= 40)
      .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0)),
  []);

  /* Recently earned — sorted by date descending */
  const recentlyEarned = React.useMemo(() =>
    BADGES.filter(b => b.earned && b.earnedDate)
      .sort((a, b) => {
        const parseDate = (d: string) => { const [dd, mm, yy] = d.split("/"); return new Date(+yy, +mm - 1, +dd).getTime(); };
        return parseDate(b.earnedDate!) - parseDate(a.earnedDate!);
      })
      .slice(0, 5),
  []);

  /* Category completion map */
  const categoryCompletion = React.useMemo(() => {
    const cats = Object.keys(BADGE_CATEGORY_CONFIG) as BadgeCategory[];
    return cats.map(cat => {
      const total = BADGES.filter(b => b.category === cat).length;
      const earned = BADGES.filter(b => b.category === cat && b.earned).length;
      return { cat, total, earned, pct: total > 0 ? Math.round((earned / total) * 100) : 0 };
    });
  }, []);

  /* Rarity distribution */
  const rarityDistribution = React.useMemo(() => {
    const rarities = Object.keys(BADGE_RARITY_CONFIG) as BadgeRarity[];
    return rarities.map(r => {
      const total = BADGES.filter(b => b.rarity === r).length;
      const earned = BADGES.filter(b => b.rarity === r && b.earned).length;
      return { rarity: r, total, earned, pct: total > 0 ? Math.round((earned / total) * 100) : 0 };
    });
  }, []);

  /* Filtered & sorted */
  const filtered = React.useMemo(() => {
    let result = BADGES.filter(b => {
      if (filterCategory !== "all" && b.category !== filterCategory) return false;
      if (filterRarity !== "all" && b.rarity !== filterRarity) return false;
      if (showEarned === "earned" && !b.earned) return false;
      if (showEarned === "locked" && b.earned) return false;
      if (showEarned === "near" && (!b.progress || b.progress < 40 || b.earned)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!b.name.toLowerCase().includes(q) && !b.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "name": cmp = a.name.localeCompare(b.name, "vi"); break;
        case "rarity": cmp = RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]; break;
        case "xp": cmp = a.xpReward - b.xpReward; break;
        case "progress": cmp = (a.progress ?? (a.earned ? 100 : 0)) - (b.progress ?? (b.earned ? 100 : 0)); break;
        case "date": {
          const p = (d?: string) => { if (!d) return 0; const [dd, mm, yy] = d.split("/"); return new Date(+yy, +mm - 1, +dd).getTime(); };
          cmp = p(a.earnedDate) - p(b.earnedDate);
          break;
        }
      }
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [filterCategory, filterRarity, showEarned, searchQuery, sortBy, sortAsc]);

  /* ── Showcase helpers ── */
  const toggleShowcase = React.useCallback((id: string) => {
    setShowcaseBadges(prev => {
      if (prev.includes(id)) { showToast("Đã gỡ khỏi Showcase"); return prev.filter(x => x !== id); }
      if (prev.length >= 5) { showToast("Tối đa 5 huy hiệu Showcase"); return prev; }
      showToast("Đã ghim vào Showcase");
      return [...prev, id];
    });
  }, [showToast]);

  /* ── Celebrate animation ── */
  const celebrate = React.useCallback((id: string) => {
    setCelebratingId(id);
    setTimeout(() => setCelebratingId(null), 1200);
  }, []);

  /* ── Share handler ── */
  const shareBadge = React.useCallback(async (badge: Badge) => {
    const text = `🏅 Tôi vừa đạt huy hiệu "${badge.name}" trên LMS Geleximco! ${badge.description} (+${badge.xpReward} XP)`;
    const ok = await copyToClipboard(text);
    showToast(ok ? "Đã sao chép để chia sẻ!" : "Không thể sao chép");
  }, [showToast]);

  /* ============================================================ */
  /*  RENDER                                                       */
  /* ============================================================ */

  return (
    <div className="space-y-5">
      {/* ─── ADMIN / LEARNER TOGGLE ─── */}
      {isAdmin && (
        <div className="flex items-center justify-between bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/5 rounded-xl border border-[#990803]/15 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#990803]" />
            <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>
              {adminView ? "Chế độ Quản trị" : "Chế độ Xem Học viên"}
            </span>
            <span className="text-gray-400" style={{ fontSize: "10px" }}>
              {adminView ? "CRUD, cấp phát, quy tắc, lịch sử" : "Xem như học viên thấy"}
            </span>
          </div>
          <button
            onClick={() => setAdminView(!adminView)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              adminView
                ? "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                : "bg-[#990803] text-white hover:bg-[#7a0602]"
            }`}
            style={{ fontSize: "11px", fontWeight: 600 }}
          >
            {adminView ? <><Eye className="w-3.5 h-3.5" />Xem như Học viên</> : <><Shield className="w-3.5 h-3.5" />Mở Quản trị</>}
          </button>
        </div>
      )}

      {/* ─── ADMIN VIEW ─── */}
      {isAdmin && adminView ? (
        <BadgeAdmin />
      ) : (
      <>
      {/* ─── 1. STAT CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Tổng huy hiệu", value: `${earnedCount}/${BADGES.length}`, sub: `${Math.round((earnedCount / BADGES.length) * 100)}% hoàn thành`, icon: Award, color: "#c8a84e" },
          { label: "XP từ huy hiệu", value: totalXPEarned.toLocaleString(), sub: `/ ${totalXPPossible.toLocaleString()} XP khả dụng`, icon: Zap, color: "#990803" },
          { label: "Gần đạt được", value: String(nearBadges.length), sub: `huy hiệu ≥40% tiến độ`, icon: Target, color: "#f97316" },
          { label: "Streak hiện tại", value: "12 ngày", sub: `Kỷ lục: 28 ngày`, icon: Flame, color: "#ef4444" },
          { label: "Bộ sưu tập", value: `${BADGE_SETS.filter(s => s.badgeIds.every(id => BADGES.find(b => b.id === id)?.earned)).length}/${BADGE_SETS.length}`, sub: "hoàn thành bộ sưu tập", icon: Crown, color: "#7c3aed" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3.5 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "12" }}>
                <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
              <span className="text-gray-400" style={{ fontSize: "10px", fontWeight: 500 }}>{s.label}</span>
            </div>
            <p className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>{s.value}</p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: "10px" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ─── 2. SHOWCASE (pinned badges) ─── */}
      {showcaseBadges.length > 0 && (
        <div className="bg-gradient-to-r from-[#c8a84e]/8 to-[#990803]/5 rounded-xl border border-[#c8a84e]/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#c8a84e]" />
              <h3 className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>Showcase — Huy hiệu Nổi bật</h3>
              <span className="text-gray-400" style={{ fontSize: "10px" }}>{showcaseBadges.length}/5</span>
            </div>
            <span className="text-gray-400" style={{ fontSize: "10px" }}>Ghim tối đa 5 huy hiệu yêu thích</span>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {showcaseBadges.map(id => {
              const badge = BADGES.find(b => b.id === id);
              if (!badge) return null;
              const rCfg = BADGE_RARITY_CONFIG[badge.rarity];
              return (
                <div key={id}
                  className="shrink-0 bg-white rounded-xl border p-3 text-center cursor-pointer hover:shadow-md transition-all group/sc relative"
                  style={{ borderColor: rCfg.border, minWidth: "100px" }}
                  onClick={() => setSelectedBadge(badge)}
                >
                  <button
                    className="absolute top-1.5 right-1.5 p-0.5 text-gray-300 hover:text-red-400 opacity-0 group-hover/sc:opacity-100 transition-opacity cursor-pointer"
                    onClick={e => { e.stopPropagation(); toggleShowcase(id); }}
                    title="Gỡ khỏi Showcase"
                  >
                    <PinOff className="w-3 h-3" />
                  </button>
                  {badge.rarity === "legendary" && (
                    <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background: `radial-gradient(circle at center, ${rCfg.color}15, transparent 70%)` }} />
                  )}
                  <span style={{ fontSize: "32px" }}>{badge.icon}</span>
                  <p className="text-gray-700 mt-1 truncate" style={{ fontSize: "11px", fontWeight: 600 }}>{badge.name}</p>
                  <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-full" style={{ fontSize: "8px", fontWeight: 700, color: rCfg.color, backgroundColor: rCfg.bg }}>
                    {rCfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 3. CATEGORY COMPLETION + RARITY DISTRIBUTION ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category completion */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
            <BarChart3 className="w-4 h-4 text-[#990803]" />Tiến độ theo Danh mục
          </h3>
          <div className="space-y-2.5">
            {categoryCompletion.map(cc => {
              const cfg = BADGE_CATEGORY_CONFIG[cc.cat];
              return (
                <div key={cc.cat} className="flex items-center gap-3">
                  <span style={{ fontSize: "16px", width: "24px", textAlign: "center" }}>{cfg.icon}</span>
                  <span className="text-gray-600 shrink-0" style={{ fontSize: "11px", fontWeight: 500, minWidth: "70px" }}>{cfg.label}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${cc.pct}%`, backgroundColor: cc.pct === 100 ? "#22c55e" : "#990803", opacity: 0.75 }} />
                  </div>
                  <span className="text-gray-500 shrink-0" style={{ fontSize: "10px", fontWeight: 600, minWidth: "36px", textAlign: "right" }}>
                    {cc.earned}/{cc.total}
                  </span>
                  {cc.pct === 100 && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rarity distribution — custom SVG donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Sparkles className="w-4 h-4 text-[#c8a84e]" />Phân bố Độ hiếm
          </h3>
          <div className="flex items-center gap-6">
            {/* SVG donut chart */}
            <div className="shrink-0">
              <svg width="110" height="110" viewBox="0 0 110 110">
                {(() => {
                  const cx = 55, cy = 55, r = 42;
                  const total = BADGES.length;
                  let cumAngle = -90;
                  return rarityDistribution.map(rd => {
                    const cfg = BADGE_RARITY_CONFIG[rd.rarity];
                    const angle = (rd.total / total) * 360;
                    const startAngle = cumAngle;
                    cumAngle += angle;
                    const endAngle = cumAngle;
                    const largeArc = angle > 180 ? 1 : 0;
                    const toRad = (a: number) => (a * Math.PI) / 180;
                    const x1 = cx + r * Math.cos(toRad(startAngle));
                    const y1 = cy + r * Math.sin(toRad(startAngle));
                    const x2 = cx + r * Math.cos(toRad(endAngle));
                    const y2 = cy + r * Math.sin(toRad(endAngle));
                    return (
                      <path
                        key={rd.rarity}
                        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={cfg.color}
                        opacity={0.7}
                        stroke="white"
                        strokeWidth="2"
                      />
                    );
                  });
                })()}
                <circle cx="55" cy="55" r="24" fill="white" />
                <text x="55" y="52" textAnchor="middle" fill="#374151" style={{ fontSize: "16px", fontWeight: 700 }}>{earnedCount}</text>
                <text x="55" y="66" textAnchor="middle" fill="#9ca3af" style={{ fontSize: "9px" }}>đã đạt</text>
              </svg>
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-2">
              {rarityDistribution.map(rd => {
                const cfg = BADGE_RARITY_CONFIG[rd.rarity];
                return (
                  <div key={rd.rarity} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: cfg.color, opacity: 0.7 }} />
                    <span className="text-gray-600 flex-1" style={{ fontSize: "11px", fontWeight: 500 }}>{cfg.label}</span>
                    <span className="text-gray-800" style={{ fontSize: "12px", fontWeight: 700, color: cfg.color }}>{rd.earned}</span>
                    <span className="text-gray-400" style={{ fontSize: "10px" }}>/ {rd.total}</span>
                    {/* mini progress */}
                    <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                      <div className="h-full rounded-full" style={{ width: `${rd.pct}%`, backgroundColor: cfg.color, opacity: 0.6 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. NEAR-UNLOCK SECTION ─── */}
      {nearBadges.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200/50 p-4">
          <button
            className="flex items-center justify-between w-full cursor-pointer"
            onClick={() => setShowNearSection(!showNearSection)}
          >
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-500" />
              <h3 className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>Sắp đạt được ({nearBadges.length})</h3>
              <span className="text-orange-500/60" style={{ fontSize: "10px" }}>≥ 40% tiến độ</span>
            </div>
            {showNearSection ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {showNearSection && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
              {nearBadges.map(badge => {
                const rCfg = BADGE_RARITY_CONFIG[badge.rarity];
                const tips = BADGE_TIPS[badge.id];
                return (
                  <div key={badge.id}
                    className="bg-white rounded-xl border border-orange-200/30 p-3 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setSelectedBadge(badge)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {/* SVG progress ring around icon */}
                        <svg width="48" height="48" viewBox="0 0 48 48" className="absolute inset-0">
                          <circle cx="24" cy="24" r="21" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                          <circle cx="24" cy="24" r="21" fill="none" stroke={rCfg.color} strokeWidth="3"
                            strokeDasharray={`${(badge.progress! / 100) * 131.95} 131.95`}
                            strokeLinecap="round" transform="rotate(-90 24 24)" opacity="0.7" />
                        </svg>
                        <div className="w-12 h-12 flex items-center justify-center">
                          <span style={{ fontSize: "22px" }}>{badge.icon}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{badge.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "8px", fontWeight: 700, color: rCfg.color, backgroundColor: rCfg.bg }}>{rCfg.label}</span>
                          <span className="text-gray-400" style={{ fontSize: "9px" }}>{badge.currentCount}/{badge.totalRequired}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${badge.progress}%`, backgroundColor: rCfg.color, opacity: 0.7 }} />
                          </div>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: rCfg.color }}>{badge.progress}%</span>
                        </div>
                      </div>
                    </div>
                    {tips && tips[0] && (
                      <div className="flex items-start gap-1.5 mt-2 p-2 bg-amber-50 rounded-lg">
                        <Lightbulb className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-amber-700" style={{ fontSize: "10px", lineHeight: 1.4 }}>{tips[0]}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── 5. BADGE SETS / COLLECTIONS ─── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <button
          className="flex items-center justify-between w-full cursor-pointer"
          onClick={() => setShowSets(!showSets)}
        >
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-[#7c3aed]" />
            <h3 className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>Bộ sưu tập ({BADGE_SETS.length})</h3>
            <span className="text-gray-400" style={{ fontSize: "10px" }}>Hoàn thành bộ để nhận bonus XP</span>
          </div>
          {showSets ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {showSets && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            {BADGE_SETS.map(set => {
              const setBadges = set.badgeIds.map(id => BADGES.find(b => b.id === id)!).filter(Boolean);
              const earnedInSet = setBadges.filter(b => b.earned).length;
              const isComplete = earnedInSet === setBadges.length;
              return (
                <div key={set.id} className={`rounded-xl border p-3.5 ${isComplete ? "border-green-200 bg-green-50/50" : "border-gray-200"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: "20px" }}>{set.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`truncate ${isComplete ? "text-green-700" : "text-gray-700"}`} style={{ fontSize: "12px", fontWeight: 600 }}>{set.name}</p>
                      <p className="text-gray-400 truncate" style={{ fontSize: "9px" }}>{set.description}</p>
                    </div>
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <span className="text-gray-400 shrink-0" style={{ fontSize: "10px", fontWeight: 600 }}>{earnedInSet}/{setBadges.length}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {setBadges.map(b => (
                      <div key={b.id}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform ${b.earned ? "" : "grayscale opacity-40"}`}
                        style={{ backgroundColor: b.earned ? BADGE_RARITY_CONFIG[b.rarity].bg : "#f3f4f6" }}
                        onClick={() => setSelectedBadge(b)}
                        title={b.name}
                      >
                        <span style={{ fontSize: "16px" }}>{b.icon}</span>
                      </div>
                    ))}
                    <div className="ml-auto flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#c8a84e]" />
                      <span className={`${isComplete ? "text-green-600" : "text-[#c8a84e]"}`} style={{ fontSize: "10px", fontWeight: 700 }}>
                        {isComplete ? "✓ Đã nhận" : `+${set.bonusXP} XP`}
                      </span>
                    </div>
                  </div>
                  {!isComplete && (
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                      <div className="h-full rounded-full bg-[#7c3aed]" style={{ width: `${(earnedInSet / setBadges.length) * 100}%`, opacity: 0.6 }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 6. RECENTLY EARNED ─── */}
      {recentlyEarned.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Clock className="w-4 h-4 text-[#2563eb]" />Huy hiệu Gần đây
          </h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {recentlyEarned.map((badge, idx) => {
              const rCfg = BADGE_RARITY_CONFIG[badge.rarity];
              return (
                <div key={badge.id}
                  className="shrink-0 flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => { setSelectedBadge(badge); celebrate(badge.id); }}
                >
                  <div className="relative">
                    {idx === 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                    <span style={{ fontSize: "24px" }}>{badge.icon}</span>
                  </div>
                  <div>
                    <p className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{badge.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-1 py-0.5 rounded" style={{ fontSize: "7px", fontWeight: 700, color: rCfg.color, backgroundColor: rCfg.bg }}>{rCfg.label}</span>
                      <span className="text-gray-400" style={{ fontSize: "9px" }}>{badge.earnedDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 7. FILTERS & TOOLBAR ─── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm huy hiệu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803]/30"
            style={{ fontSize: "12px" }}
          />
          {searchQuery && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-pointer" onClick={() => setSearchQuery("")}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Earned filter */}
        <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg overflow-hidden">
          {(["all", "earned", "locked", "near"] as EarnedFilter[]).map(s => (
            <button key={s}
              onClick={() => setShowEarned(s)}
              className={`px-2.5 py-1.5 cursor-pointer transition-colors ${showEarned === s ? "bg-[#990803] text-white" : "text-gray-500 hover:bg-gray-50"}`}
              style={{ fontSize: "10px", fontWeight: 500 }}
            >
              {s === "all" ? "Tất cả" : s === "earned" ? "Đã mở" : s === "locked" ? "Chưa mở" : "Sắp đạt"}
            </button>
          ))}
        </div>

        {/* Category */}
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as any)}
          className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none" style={{ fontSize: "11px" }}>
          <option value="all">Tất cả danh mục</option>
          {(Object.keys(BADGE_CATEGORY_CONFIG) as BadgeCategory[]).map(c => (
            <option key={c} value={c}>{BADGE_CATEGORY_CONFIG[c].icon} {BADGE_CATEGORY_CONFIG[c].label}</option>
          ))}
        </select>

        {/* Rarity */}
        <select value={filterRarity} onChange={e => setFilterRarity(e.target.value as any)}
          className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none" style={{ fontSize: "11px" }}>
          <option value="all">Tất cả độ hiếm</option>
          {(Object.keys(BADGE_RARITY_CONFIG) as BadgeRarity[]).map(r => (
            <option key={r} value={r}>{BADGE_RARITY_CONFIG[r].label}</option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1">
          <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)}
            className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none" style={{ fontSize: "11px" }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setSortAsc(!sortAsc)}
            className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer hover:bg-gray-50" title={sortAsc ? "Tăng dần" : "Giảm dần"}>
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View mode */}
        <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg overflow-hidden ml-auto">
          {([
            { mode: "grid" as ViewMode, icon: LayoutGrid },
            { mode: "list" as ViewMode, icon: List },
            { mode: "timeline" as ViewMode, icon: CalendarDays },
          ]).map(v => (
            <button key={v.mode}
              onClick={() => setViewMode(v.mode)}
              className={`p-1.5 cursor-pointer transition-colors ${viewMode === v.mode ? "bg-[#990803] text-white" : "text-gray-400 hover:bg-gray-50"}`}>
              <v.icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        <span className="text-gray-400" style={{ fontSize: "10px" }}>{filtered.length} huy hiệu</span>
      </div>

      {/* ─── 8. BADGE GRID / LIST / TIMELINE ─── */}
      {viewMode === "grid" && (
        filterCategory === "all" ? (
          (Object.keys(BADGE_CATEGORY_CONFIG) as BadgeCategory[]).map(cat => {
            const catBadges = filtered.filter(b => b.category === cat);
            if (catBadges.length === 0) return null;
            const catCfg = BADGE_CATEGORY_CONFIG[cat];
            const isExpanded = expandedCategory !== cat;
            return (
              <div key={cat}>
                <button
                  className="flex items-center gap-1.5 mb-2 cursor-pointer hover:text-[#990803] transition-colors"
                  onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
                >
                  <span style={{ fontSize: "14px" }}>{catCfg.icon}</span>
                  <h4 className="text-gray-600" style={{ fontSize: "13px", fontWeight: 600 }}>{catCfg.label}</h4>
                  <span className="text-gray-400" style={{ fontSize: "10px" }}>({catBadges.length})</span>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                </button>
                {isExpanded && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-4">
                    {catBadges.map(badge => (
                      <BadgeCard key={badge.id} badge={badge} onClick={() => setSelectedBadge(badge)}
                        isShowcased={showcaseBadges.includes(badge.id)}
                        isCelebrating={celebratingId === badge.id}
                        onCelebrate={celebrate}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map(badge => (
              <BadgeCard key={badge.id} badge={badge} onClick={() => setSelectedBadge(badge)}
                isShowcased={showcaseBadges.includes(badge.id)}
                isCelebrating={celebratingId === badge.id}
                onCelebrate={celebrate}
              />
            ))}
          </div>
        )
      )}

      {viewMode === "list" && (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtered.map(badge => (
            <BadgeListItem key={badge.id} badge={badge} onClick={() => setSelectedBadge(badge)}
              isShowcased={showcaseBadges.includes(badge.id)}
            />
          ))}
        </div>
      )}

      {viewMode === "timeline" && (
        <div className="space-y-0">
          {/* Earned badges sorted by date */}
          {filtered.filter(b => b.earned).length === 0 && filtered.filter(b => !b.earned).length === 0 && (
            <div className="text-center py-12">
              <p style={{ fontSize: "40px" }}>🎖️</p>
              <p className="text-gray-400 mt-2" style={{ fontSize: "13px" }}>Không tìm thấy huy hiệu nào</p>
            </div>
          )}
          {filtered.filter(b => b.earned).sort((a, b) => {
            const p = (d?: string) => { if (!d) return 0; const [dd, mm, yy] = d.split("/"); return new Date(+yy, +mm - 1, +dd).getTime(); };
            return p(b.earnedDate) - p(a.earnedDate);
          }).map((badge, idx) => {
            const rCfg = BADGE_RARITY_CONFIG[badge.rarity];
            const cCfg = BADGE_CATEGORY_CONFIG[badge.category];
            return (
              <div key={badge.id} className="flex items-stretch gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center w-8 shrink-0">
                  <div className="w-3 h-3 rounded-full border-2 shrink-0" style={{ borderColor: rCfg.color, backgroundColor: rCfg.color + "40" }} />
                  {idx < filtered.filter(b => b.earned).length - 1 && <div className="flex-1 w-0.5 bg-gray-200" />}
                </div>
                {/* Content */}
                <div className="pb-4 flex-1 cursor-pointer" onClick={() => setSelectedBadge(badge)}>
                  <p className="text-gray-400 mb-1" style={{ fontSize: "10px" }}>{badge.earnedDate}</p>
                  <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 hover:shadow-sm transition-shadow">
                    <span style={{ fontSize: "28px" }}>{badge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>{badge.name}</p>
                      <p className="text-gray-400 truncate" style={{ fontSize: "10px" }}>{badge.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "8px", fontWeight: 700, color: rCfg.color, backgroundColor: rCfg.bg }}>{rCfg.label}</span>
                      <span className="text-[#c8a84e]" style={{ fontSize: "10px", fontWeight: 600 }}>+{badge.xpReward} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {/* Locked badges at bottom */}
          {filtered.filter(b => !b.earned).length > 0 && (
            <div className="mt-4">
              <p className="text-gray-400 mb-2 flex items-center gap-1.5" style={{ fontSize: "11px", fontWeight: 600 }}>
                <Lock className="w-3.5 h-3.5" /> Chưa đạt ({filtered.filter(b => !b.earned).length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filtered.filter(b => !b.earned).map(badge => (
                  <BadgeCard key={badge.id} badge={badge} onClick={() => setSelectedBadge(badge)}
                    isShowcased={false} isCelebrating={false} onCelebrate={celebrate} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p style={{ fontSize: "40px" }}>🎖️</p>
          <p className="text-gray-400 mt-2" style={{ fontSize: "13px" }}>Không tìm thấy huy hiệu nào</p>
          {searchQuery && (
            <button className="mt-2 text-[#990803] hover:underline cursor-pointer" style={{ fontSize: "12px" }} onClick={() => setSearchQuery("")}>
              Xóa bộ lọc tìm kiếm
            </button>
          )}
        </div>
      )}

      {/* ─── BADGE DETAIL MODAL ─── */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
          isShowcased={showcaseBadges.includes(selectedBadge.id)}
          onToggleShowcase={() => toggleShowcase(selectedBadge.id)}
          onShare={() => shareBadge(selectedBadge)}
          tips={BADGE_TIPS[selectedBadge.id]}
          isCelebrating={celebratingId === selectedBadge.id}
          onCelebrate={() => celebrate(selectedBadge.id)}
        />
      )}

      {/* ─── TOAST ─── */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 bg-gray-900 text-white rounded-xl shadow-2xl flex items-center gap-2"
          style={{ fontSize: "13px", animation: "toastSlideUp 0.3s ease-out" }}>
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          {toastMsg}
        </div>
      )}

      {/* Inline styles for animations */}
      <style>{`
        @keyframes toastSlideUp { from { opacity:0; transform: translate(-50%, 20px); } to { opacity:1; transform: translate(-50%, 0); } }
        @keyframes badgeCelebrate {
          0% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.15) rotate(-5deg); }
          50% { transform: scale(1.2) rotate(5deg); }
          75% { transform: scale(1.1) rotate(-3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes confettiPop {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        .badge-celebrate { animation: badgeCelebrate 0.6s ease-out; }
        .confetti-pop { animation: confettiPop 0.8s ease-out forwards; }
      `}</style>
      </>
      )}
    </div>
  );
}


/* ============================================================ */
/*  BADGE CARD (Grid view)                                       */
/* ============================================================ */

function BadgeCard({ badge, onClick, isShowcased, isCelebrating, onCelebrate }: {
  badge: Badge; onClick: () => void; isShowcased: boolean;
  isCelebrating?: boolean; onCelebrate?: (id: string) => void;
}) {
  const rCfg = BADGE_RARITY_CONFIG[badge.rarity];

  return (
    <div
      onClick={() => { onClick(); if (badge.earned && onCelebrate) onCelebrate(badge.id); }}
      className={`relative bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md text-center ${
        badge.earned ? "hover:scale-[1.02]" : "opacity-70 hover:opacity-90"
      } ${isCelebrating ? "badge-celebrate" : ""}`}
      style={{ borderColor: badge.earned ? rCfg.border : "#e5e7eb" }}
    >
      {/* Showcase pin indicator */}
      {isShowcased && (
        <div className="absolute top-1.5 left-1.5">
          <Pin className="w-3 h-3 text-[#c8a84e]" />
        </div>
      )}

      {/* Rarity glow for legendary */}
      {badge.earned && badge.rarity === "legendary" && (
        <div className="absolute inset-0 rounded-xl opacity-20 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${rCfg.color}40, transparent 70%)` }} />
      )}

      {/* Celebrate confetti */}
      {isCelebrating && badge.earned && (
        <>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="absolute confetti-pop pointer-events-none" style={{
              top: "30%", left: `${20 + i * 12}%`,
              width: "6px", height: "6px", borderRadius: "50%",
              backgroundColor: ["#c8a84e", "#990803", "#22c55e", "#3b82f6", "#f97316", "#7c3aed"][i],
              animationDelay: `${i * 0.08}s`,
            }} />
          ))}
        </>
      )}

      {/* Icon */}
      <div className={`relative inline-block ${!badge.earned ? "grayscale" : ""}`}>
        <span style={{ fontSize: "36px" }}>{badge.icon}</span>
        {!badge.earned && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>

      {/* Name */}
      <p className="text-gray-700 mt-1 truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{badge.name}</p>

      {/* Rarity */}
      <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full" style={{ fontSize: "8px", fontWeight: 700, color: rCfg.color, backgroundColor: rCfg.bg }}>
        {rCfg.label}
      </span>

      {/* Progress or date */}
      {badge.earned ? (
        <p className="text-gray-300 mt-1" style={{ fontSize: "9px" }}>
          <CheckCircle className="w-3 h-3 inline text-green-500 mr-0.5" />
          {badge.earnedDate}
        </p>
      ) : badge.progress !== undefined ? (
        <div className="mt-1.5">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${badge.progress}%`, backgroundColor: rCfg.color, opacity: 0.6 }} />
          </div>
          <p className="text-gray-300 mt-0.5" style={{ fontSize: "8px" }}>{badge.currentCount}/{badge.totalRequired} • {badge.progress}%</p>
        </div>
      ) : null}

      {/* XP reward */}
      <p className="text-[#c8a84e] mt-1" style={{ fontSize: "9px", fontWeight: 600 }}>+{badge.xpReward} XP</p>
    </div>
  );
}


/* ============================================================ */
/*  BADGE LIST ITEM (List view)                                  */
/* ============================================================ */

function BadgeListItem({ badge, onClick, isShowcased }: { badge: Badge; onClick: () => void; isShowcased: boolean }) {
  const rCfg = BADGE_RARITY_CONFIG[badge.rarity];
  const cCfg = BADGE_CATEGORY_CONFIG[badge.category];

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer" onClick={onClick}>
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!badge.earned ? "grayscale opacity-50" : ""}`}
        style={{ backgroundColor: badge.earned ? rCfg.bg : "#f3f4f6" }}>
        <span style={{ fontSize: "22px" }}>{badge.icon}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={`truncate ${badge.earned ? "text-gray-700" : "text-gray-500"}`} style={{ fontSize: "13px", fontWeight: 600 }}>{badge.name}</p>
          {isShowcased && <Pin className="w-3 h-3 text-[#c8a84e] shrink-0" />}
        </div>
        <p className="text-gray-400 truncate" style={{ fontSize: "10px" }}>{badge.description}</p>
      </div>

      {/* Category */}
      <span className="text-gray-400 shrink-0 hidden sm:block" style={{ fontSize: "10px" }}>{cCfg.icon} {cCfg.label}</span>

      {/* Rarity */}
      <span className="px-1.5 py-0.5 rounded-full shrink-0" style={{ fontSize: "8px", fontWeight: 700, color: rCfg.color, backgroundColor: rCfg.bg }}>
        {rCfg.label}
      </span>

      {/* Progress / Status */}
      <div className="w-20 shrink-0">
        {badge.earned ? (
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span className="text-gray-400" style={{ fontSize: "9px" }}>{badge.earnedDate}</span>
          </div>
        ) : badge.progress !== undefined ? (
          <div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${badge.progress}%`, backgroundColor: rCfg.color, opacity: 0.6 }} />
            </div>
            <p className="text-gray-300 mt-0.5 text-right" style={{ fontSize: "8px" }}>{badge.progress}%</p>
          </div>
        ) : (
          <Lock className="w-3.5 h-3.5 text-gray-300" />
        )}
      </div>

      {/* XP */}
      <span className="text-[#c8a84e] shrink-0" style={{ fontSize: "10px", fontWeight: 600 }}>+{badge.xpReward}</span>
      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
    </div>
  );
}


/* ============================================================ */
/*  BADGE DETAIL MODAL (Enhanced)                                */
/* ============================================================ */

function BadgeDetailModal({ badge, onClose, isShowcased, onToggleShowcase, onShare, tips, isCelebrating, onCelebrate }: {
  badge: Badge; onClose: () => void; isShowcased: boolean;
  onToggleShowcase: () => void; onShare: () => void;
  tips?: string[]; isCelebrating?: boolean; onCelebrate: () => void;
}) {
  const rCfg = BADGE_RARITY_CONFIG[badge.rarity];
  const cCfg = BADGE_CATEGORY_CONFIG[badge.category];
  const [showTips, setShowTips] = React.useState(false);

  /* Find related badges (same category, exclude self) */
  const related = BADGES.filter(b => b.category === badge.category && b.id !== badge.id).slice(0, 4);

  /* Sets containing this badge */
  const badgeSets = BADGE_SETS.filter(s => s.badgeIds.includes(badge.id));

  /* Estimated time to unlock */
  const estimatedDays = React.useMemo(() => {
    if (badge.earned || !badge.progress || !badge.totalRequired || !badge.currentCount) return null;
    const remaining = badge.totalRequired - badge.currentCount;
    // rough estimate: assume ~1 progress unit per 3 days
    return Math.ceil(remaining * 3);
  }, [badge]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full relative overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Glow header */}
        <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${rCfg.color}25, ${rCfg.color}08)` }}>
          {badge.earned && badge.rarity === "legendary" && (
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${rCfg.color}30, transparent 70%)` }} />
          )}
          {/* Close button */}
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-white/80 rounded-full text-gray-500 hover:text-gray-700 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
          {/* Action buttons */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {badge.earned && (
              <>
                <button onClick={onToggleShowcase}
                  className={`p-1.5 rounded-full cursor-pointer transition-colors ${isShowcased ? "bg-[#c8a84e] text-white" : "bg-white/80 text-gray-500 hover:text-[#c8a84e]"}`}
                  title={isShowcased ? "Gỡ khỏi Showcase" : "Ghim vào Showcase"}
                >
                  {isShowcased ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
                <button onClick={onShare}
                  className="p-1.5 bg-white/80 rounded-full text-gray-500 hover:text-[#990803] cursor-pointer"
                  title="Chia sẻ huy hiệu"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Badge icon — overlapping header */}
        <div className="flex justify-center -mt-12 relative z-10">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg ${!badge.earned ? "grayscale opacity-50" : ""} ${isCelebrating ? "badge-celebrate" : ""}`}
            style={{ backgroundColor: badge.earned ? rCfg.bg : "#f3f4f6" }}
            onClick={() => { if (badge.earned) onCelebrate(); }}
          >
            <span style={{ fontSize: "40px" }}>{badge.icon}</span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-3 text-center">
          <h3 className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>{badge.name}</h3>
          <p className="text-gray-500 mt-1" style={{ fontSize: "13px" }}>{badge.description}</p>

          {/* Tags */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: rCfg.color, backgroundColor: rCfg.bg }}>
              {rCfg.label}
            </span>
            <span className="text-gray-400" style={{ fontSize: "10px" }}>{cCfg.icon} {cCfg.label}</span>
            {isShowcased && (
              <span className="flex items-center gap-0.5 text-[#c8a84e]" style={{ fontSize: "10px", fontWeight: 600 }}>
                <Pin className="w-3 h-3" /> Showcase
              </span>
            )}
          </div>

          {/* Requirement & XP */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl text-left">
            <p className="text-gray-500" style={{ fontSize: "11px" }}>
              <span style={{ fontWeight: 600 }}>Yêu cầu:</span> {badge.requirement}
            </p>
            <p className="text-[#c8a84e] mt-1" style={{ fontSize: "11px", fontWeight: 600 }}>
              Phần thưởng: +{badge.xpReward} XP
            </p>
            {estimatedDays && (
              <p className="text-gray-400 mt-1 flex items-center gap-1" style={{ fontSize: "10px" }}>
                <Clock className="w-3 h-3" />
                Ước tính đạt trong ~{estimatedDays} ngày nữa
              </p>
            )}
          </div>

          {/* Progress / Earned info */}
          {badge.earned ? (
            <div className="mt-4 p-3 bg-green-50 rounded-xl">
              <p className="text-green-600 flex items-center justify-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600 }}>
                <CheckCircle2 className="w-4 h-4" />
                Đã đạt ngày {badge.earnedDate}
              </p>
            </div>
          ) : badge.progress !== undefined ? (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-500" style={{ fontSize: "11px" }}>Tiến độ</span>
                <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{badge.currentCount}/{badge.totalRequired}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${badge.progress}%`, backgroundColor: rCfg.color }} />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-400" style={{ fontSize: "10px" }}>{badge.progress}% hoàn thành</span>
                <span className="text-gray-400" style={{ fontSize: "10px" }}>
                  Còn {(badge.totalRequired ?? 0) - (badge.currentCount ?? 0)} nữa
                </span>
              </div>
            </div>
          ) : null}

          {/* Tips to unlock */}
          {!badge.earned && tips && tips.length > 0 && (
            <div className="mt-4">
              <button
                className="flex items-center gap-1.5 text-amber-600 cursor-pointer hover:text-amber-700"
                style={{ fontSize: "11px", fontWeight: 600 }}
                onClick={() => setShowTips(!showTips)}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Gợi ý đạt huy hiệu ({tips.length})
                {showTips ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showTips && (
                <div className="mt-2 space-y-1.5">
                  {tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                      <span className="text-amber-500 shrink-0 mt-0.5" style={{ fontSize: "10px", fontWeight: 700 }}>{i + 1}.</span>
                      <p className="text-amber-700" style={{ fontSize: "10px", lineHeight: 1.5 }}>{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Badge sets containing this badge */}
          {badgeSets.length > 0 && (
            <div className="mt-4 p-3 bg-purple-50/50 rounded-xl text-left">
              <p className="text-gray-600 mb-2" style={{ fontSize: "10px", fontWeight: 600 }}>Thuộc Bộ sưu tập:</p>
              {badgeSets.map(set => {
                const setEarned = set.badgeIds.filter(id => BADGES.find(b => b.id === id)?.earned).length;
                return (
                  <div key={set.id} className="flex items-center gap-2 mb-1.5 last:mb-0">
                    <span style={{ fontSize: "14px" }}>{set.icon}</span>
                    <span className="text-gray-600 flex-1" style={{ fontSize: "10px", fontWeight: 500 }}>{set.name}</span>
                    <span className="text-gray-400" style={{ fontSize: "9px" }}>{setEarned}/{set.badgeIds.length}</span>
                    <span className="text-[#c8a84e]" style={{ fontSize: "9px", fontWeight: 600 }}>+{set.bonusXP} XP</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Related badges */}
          {related.length > 0 && (
            <div className="mt-4 text-left">
              <p className="text-gray-500 mb-2" style={{ fontSize: "10px", fontWeight: 600 }}>Huy hiệu liên quan:</p>
              <div className="flex items-center gap-2 overflow-x-auto">
                {related.map(b => {
                  const bRCfg = BADGE_RARITY_CONFIG[b.rarity];
                  return (
                    <div key={b.id} className={`shrink-0 w-14 text-center ${!b.earned ? "grayscale opacity-40" : ""}`}>
                      <div className="w-10 h-10 rounded-lg mx-auto flex items-center justify-center" style={{ backgroundColor: b.earned ? bRCfg.bg : "#f3f4f6" }}>
                        <span style={{ fontSize: "18px" }}>{b.icon}</span>
                      </div>
                      <p className="text-gray-500 mt-0.5 truncate" style={{ fontSize: "8px" }}>{b.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-5">
            {badge.earned && (
              <>
                <button onClick={onToggleShowcase}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isShowcased ? "bg-[#c8a84e]/10 text-[#c8a84e] border border-[#c8a84e]/30" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`} style={{ fontSize: "12px", fontWeight: 500 }}>
                  {isShowcased ? <><PinOff className="w-3.5 h-3.5" /> Gỡ Showcase</> : <><Pin className="w-3.5 h-3.5" /> Ghim Showcase</>}
                </button>
                <button onClick={onShare}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer"
                  style={{ fontSize: "12px", fontWeight: 500 }}>
                  <Share2 className="w-3.5 h-3.5" /> Chia sẻ
                </button>
              </>
            )}
            <button onClick={onClose}
              className={`${badge.earned ? "" : "flex-1"} px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer`}
              style={{ fontSize: "12px" }}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
