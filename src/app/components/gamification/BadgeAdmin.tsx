import React from "react";
import {
  Search, X, Plus, Edit3, Trash2, Award, History,
  Settings2, CheckCircle2, AlertTriangle,
  Download, Copy, BarChart3, Upload,
  Zap, Target, Crown, Gift, ArrowUpDown, Shield,
  UserCheck, UserMinus, TrendingUp, ToggleLeft, ToggleRight,
  RefreshCw, ChevronRight, ChevronLeft, Info, Bell,
  Building2, Calendar, Eye, EyeOff, Users, Clock,
  FileText, Sparkles, Send,
} from "lucide-react";
import {
  BADGES, BADGE_RARITY_CONFIG, BADGE_CATEGORY_CONFIG,
  type Badge, type BadgeRarity, type BadgeCategory,
} from "./mock-data";
import { SUBSIDIARIES, DEPARTMENTS } from "../mock-data";
import { useConfirm } from "../ConfirmDialog";

/* ============================================================ */
/*  TYPES & CONSTANTS                                            */
/* ============================================================ */

type AdminTab = "overview" | "badges" | "award" | "sets" | "rules" | "history";

const ADMIN_TABS: { key: AdminTab; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Tổng quan", icon: BarChart3 },
  { key: "badges", label: "Danh sách Huy hiệu", icon: Award },
  { key: "award", label: "Cấp phát / Thu hồi", icon: UserCheck },
  { key: "sets", label: "Bộ sưu tập", icon: Gift },
  { key: "rules", label: "Quy tắc & Tự động", icon: Settings2 },
  { key: "history", label: "Lịch sử Cấp phát", icon: History },
];

const ICON_OPTIONS = ["🎯", "📖", "📚", "🏛️", "💯", "⚔️", "🧠", "💎", "🔗", "🎤", "🌟", "🔥", "🌋", "🏔️", "👑", "🛡️", "🦺", "🚀", "🏢", "💛", "⭐", "🏅", "🎖️", "🏆", "💡", "🎓", "📝", "🤝", "💪", "🌈"];

/* Badge sets */
const INITIAL_SETS = [
  { id: "SET1", name: "Bộ sưu tập Học tập", icon: "📚", badgeIds: ["B01", "B02", "B03", "B04"], bonusXP: 500, description: "Thu thập đầy đủ 4 huy hiệu Học tập", active: true },
  { id: "SET2", name: "Bộ sưu tập Chuỗi ngày", icon: "🔥", badgeIds: ["B12", "B13", "B14", "B15"], bonusXP: 1000, description: "Hoàn thành toàn bộ thử thách chuỗi ngày", active: true },
  { id: "SET3", name: "Bộ sưu tập Thi cử", icon: "📝", badgeIds: ["B05", "B06", "B07", "B08"], bonusXP: 800, description: "Chinh phục mọi thử thách thi cử", active: true },
  { id: "SET4", name: "Bộ sưu tập Huyền thoại", icon: "👑", badgeIds: ["B04", "B08", "B15", "B18", "B20"], bonusXP: 2000, description: "Sở hữu toàn bộ huy hiệu Huyền thoại", active: true },
];

/* Mock rules */
const INITIAL_RULES = [
  { id: "R01", badgeId: "B01", trigger: "course_complete", condition: "count >= 1", autoAward: true, active: true, description: "Tự động cấp khi hoàn thành 1 khóa học" },
  { id: "R02", badgeId: "B02", trigger: "course_complete", condition: "count >= 10", autoAward: true, active: true, description: "Tự động cấp khi hoàn thành 10 khóa học" },
  { id: "R03", badgeId: "B05", trigger: "exam_score", condition: "score == 100", autoAward: true, active: true, description: "Đạt 100 điểm trong bất kỳ bài thi nào" },
  { id: "R04", badgeId: "B12", trigger: "login_streak", condition: "streak >= 7", autoAward: true, active: true, description: "Đăng nhập 7 ngày liên tiếp" },
  { id: "R05", badgeId: "B16", trigger: "compliance_complete", condition: "all_mandatory", autoAward: true, active: true, description: "Hoàn thành 100% đào tạo bắt buộc" },
  { id: "R06", badgeId: "B18", trigger: "manual", condition: "top_10_early", autoAward: false, active: true, description: "Cấp thủ công — Top 10 early adopters" },
  { id: "R07", badgeId: "B19", trigger: "event_attend", condition: "group_event", autoAward: true, active: false, description: "Tham gia sự kiện toàn tập đoàn (tạm tắt)" },
];

/* Mock award history */
const MOCK_NAMES = [
  "Nguyễn Văn An", "Trần Thị Bích", "Lê Minh Châu", "Phạm Hoàng Dũng",
  "Vũ Thị Hằng", "Đỗ Quang Huy", "Bùi Thanh Lâm", "Hoàng Thị Mai",
  "Ngô Đức Nam", "Đinh Thị Phương", "Lý Quốc Tuấn", "Trịnh Thị Uyên",
  "Phan Minh Việt", "Dương Thị Xuân", "Cao Văn Yên", "Hà Thị Zung",
];

const generateHistory = () => {
  const history: {
    id: string; employeeName: string; employeeId: string; badgeId: string;
    badgeName: string; action: "award" | "revoke"; date: string; by: string;
    method: "auto" | "manual"; subsidiary: string; department: string; reason?: string;
  }[] = [];
  const badges = BADGES;
  const actions: ("award" | "revoke")[] = ["award", "award", "award", "award", "revoke"];
  const methods: ("auto" | "manual")[] = ["auto", "auto", "auto", "manual"];
  for (let i = 0; i < 30; i++) {
    const badge = badges[i % badges.length];
    const isRevoke = actions[i % actions.length] === "revoke";
    history.push({
      id: `H${String(i + 1).padStart(3, "0")}`,
      employeeName: MOCK_NAMES[i % MOCK_NAMES.length],
      employeeId: `E${String(100 + i).padStart(4, "0")}`,
      badgeId: badge.id,
      badgeName: badge.name,
      action: isRevoke ? "revoke" : "award",
      date: `${String(14 - Math.floor(i / 3)).padStart(2, "0")}/03/2026`,
      by: isRevoke ? "Admin (Nguyễn Minh)" : (methods[i % methods.length] === "auto" ? "Hệ thống (Tự động)" : "Admin (Nguyễn Minh)"),
      method: methods[i % methods.length],
      subsidiary: SUBSIDIARIES[i % SUBSIDIARIES.length],
      department: DEPARTMENTS[i % DEPARTMENTS.length],
      reason: isRevoke ? "Vi phạm quy chế đào tạo" : undefined,
    });
  }
  return history;
};

/* Mock users for award section */
const generateMockUsers = () => {
  return MOCK_NAMES.map((name, i) => ({
    id: `E${String(100 + i).padStart(4, "0")}`,
    name,
    initials: name.split(" ").map(w => w[0]).join("").slice(-2),
    subsidiary: SUBSIDIARIES[i % SUBSIDIARIES.length],
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    badgeCount: Math.floor(Math.random() * 12) + 1,
    totalXP: Math.floor(Math.random() * 5000) + 500,
    badges: BADGES.filter((_, bi) => (bi + i) % 3 === 0).map(b => b.id),
  }));
};

/* Mock recent activity feed */
const RECENT_ACTIVITIES = [
  { id: "A01", type: "award" as const, user: "Trần Thị Bích", badge: "Bước đầu Tiên", time: "5 phút trước", method: "auto" as const },
  { id: "A02", type: "award" as const, user: "Lê Minh Châu", badge: "Tuân thủ Mẫu mực", time: "12 phút trước", method: "auto" as const },
  { id: "A03", type: "revoke" as const, user: "Phạm Hoàng Dũng", badge: "7 Ngày Không nghỉ", time: "28 phút trước", method: "manual" as const },
  { id: "A04", type: "award" as const, user: "Vũ Thị Hằng", badge: "Thủ khoa", time: "1 giờ trước", method: "auto" as const },
  { id: "A05", type: "award" as const, user: "Đỗ Quang Huy", badge: "Học giả Chăm chỉ", time: "1 giờ trước", method: "manual" as const },
  { id: "A06", type: "award" as const, user: "Bùi Thanh Lâm", badge: "An toàn Số 1", time: "2 giờ trước", method: "auto" as const },
  { id: "A07", type: "award" as const, user: "Hoàng Thị Mai", badge: "Nhà Tiên phong", time: "3 giờ trước", method: "manual" as const },
  { id: "A08", type: "revoke" as const, user: "Ngô Đức Nam", badge: "Geleximco Spirit", time: "4 giờ trước", method: "manual" as const },
];

/* Per-subsidiary badge stats */
const SUBSIDIARY_BADGE_STATS = SUBSIDIARIES.slice(0, 8).map((sub, i) => ({
  name: sub,
  shortName: sub.length > 20 ? sub.slice(0, 18) + "..." : sub,
  totalAwarded: [4520, 3210, 2850, 2400, 1980, 1650, 1320, 890][i] ?? 500,
  avgBadgesPerUser: [4.2, 3.8, 3.5, 3.1, 2.9, 2.6, 2.3, 1.8][i] ?? 2.0,
  completionRate: [78, 72, 68, 65, 60, 55, 50, 42][i] ?? 40,
}));

/* Quick award templates */
const AWARD_TEMPLATES = [
  { id: "T01", name: "Onboarding Complete", description: "Cấp bộ huy hiệu cho NV mới hoàn thành onboard", badgeIds: ["B01", "B09", "B17"], icon: "🎉" },
  { id: "T02", name: "Top Performer Q1", description: "Vinh danh top performer Quý 1/2026", badgeIds: ["B05", "B07", "B16"], icon: "🏆" },
  { id: "T03", name: "Compliance Champion", description: "NV hoàn thành 100% compliance đúng hạn", badgeIds: ["B16", "B17"], icon: "🛡️" },
  { id: "T04", name: "Community Leader", description: "NV tích cực đóng góp cộng đồng", badgeIds: ["B09", "B10", "B11"], icon: "🤝" },
];

/* ============================================================ */
/*  MAIN ADMIN COMPONENT                                         */
/* ============================================================ */

export function BadgeAdmin() {
  const [activeTab, setActiveTab] = React.useState<AdminTab>("overview");
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  const showToast = React.useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  }, []);

  return (
    <div className="space-y-4">
      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-gray-200">
        {ADMIN_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === tab.key
                ? "bg-[#990803] text-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            style={{ fontSize: "12px", fontWeight: activeTab === tab.key ? 600 : 500 }}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab showToast={showToast} />}
      {activeTab === "badges" && <BadgesTab showToast={showToast} />}
      {activeTab === "award" && <AwardTab showToast={showToast} />}
      {activeTab === "sets" && <SetsTab showToast={showToast} />}
      {activeTab === "rules" && <RulesTab showToast={showToast} />}
      {activeTab === "history" && <HistoryTab showToast={showToast} />}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 bg-gray-900 text-white rounded-xl shadow-2xl flex items-center gap-2"
          style={{ fontSize: "13px", animation: "toastSlideUp 0.3s ease-out" }}>
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          {toastMsg}
        </div>
      )}
      <style>{`@keyframes toastSlideUp { from { opacity:0; transform: translate(-50%, 20px); } to { opacity:1; transform: translate(-50%, 0); } }`}</style>
    </div>
  );
}


/* ============================================================ */
/*  TAB 1: OVERVIEW — Admin Dashboard                            */
/* ============================================================ */

function OverviewTab({ showToast }: { showToast: (msg: string) => void }) {
  const totalBadges = BADGES.length;
  const earnedTotal = BADGES.filter(b => b.earned).length;
  const totalXP = BADGES.reduce((s, b) => s + b.xpReward, 0);
  const earnedXP = BADGES.filter(b => b.earned).reduce((s, b) => s + b.xpReward, 0);
  const avgProgress = Math.round(BADGES.filter(b => !b.earned && b.progress).reduce((s, b) => s + (b.progress ?? 0), 0) / Math.max(1, BADGES.filter(b => !b.earned && b.progress).length));

  /* Per-category stats */
  const catStats = (Object.keys(BADGE_CATEGORY_CONFIG) as BadgeCategory[]).map(cat => {
    const catBadges = BADGES.filter(b => b.category === cat);
    return {
      cat,
      cfg: BADGE_CATEGORY_CONFIG[cat],
      total: catBadges.length,
      earned: catBadges.filter(b => b.earned).length,
      xp: catBadges.reduce((s, b) => s + b.xpReward, 0),
    };
  });

  /* Per-rarity stats */
  const rarityStats = (Object.keys(BADGE_RARITY_CONFIG) as BadgeRarity[]).map(r => {
    const rBadges = BADGES.filter(b => b.rarity === r);
    return {
      rarity: r,
      cfg: BADGE_RARITY_CONFIG[r],
      total: rBadges.length,
      earned: rBadges.filter(b => b.earned).length,
    };
  });

  /* Mock monthly award data */
  const monthlyData = [
    { month: "T10", awards: 120, revokes: 5 },
    { month: "T11", awards: 180, revokes: 8 },
    { month: "T12", awards: 250, revokes: 12 },
    { month: "T01", awards: 310, revokes: 15 },
    { month: "T02", awards: 420, revokes: 10 },
    { month: "T03", awards: 380, revokes: 7 },
  ];
  const maxAwards = Math.max(...monthlyData.map(d => d.awards));

  /* Top badges (most awarded) */
  const topBadges = [
    { badge: BADGES[0], count: 4520 },
    { badge: BADGES[11], count: 3180 },
    { badge: BADGES[4], count: 2860 },
    { badge: BADGES[16], count: 2340 },
    { badge: BADGES[8], count: 1950 },
  ];

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Tổng Huy hiệu", value: String(totalBadges), sub: `${(Object.keys(BADGE_CATEGORY_CONFIG)).length} danh mục`, icon: Award, color: "#990803" },
          { label: "Lượt Cấp phát", value: "14,280", sub: "tháng 3/2026", icon: UserCheck, color: "#22c55e" },
          { label: "Lượt Thu hồi", value: "57", sub: "tháng 3/2026", icon: UserMinus, color: "#ef4444" },
          { label: "Tổng XP phát", value: earnedXP.toLocaleString(), sub: `/ ${totalXP.toLocaleString()} XP khả dụng`, icon: Zap, color: "#c8a84e" },
          { label: "Quy tắc Active", value: `${INITIAL_RULES.filter(r => r.active).length}/${INITIAL_RULES.length}`, sub: "quy tắc tự động", icon: Settings2, color: "#7c3aed" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly award chart (SVG) */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
            <TrendingUp className="w-4 h-4 text-[#990803]" />Lượt Cấp phát theo Tháng
          </h3>
          <div className="space-y-2">
            {monthlyData.map(d => (
              <div key={d.month} className="flex items-center gap-2">
                <span className="text-gray-500 shrink-0" style={{ fontSize: "11px", fontWeight: 500, minWidth: "28px" }}>{d.month}</span>
                <div className="flex-1 h-5 bg-gray-50 rounded overflow-hidden relative">
                  <div className="h-full rounded bg-[#990803]/70 transition-all flex items-center" style={{ width: `${(d.awards / maxAwards) * 100}%` }}>
                    <span className="text-white px-1.5" style={{ fontSize: "9px", fontWeight: 600 }}>{d.awards}</span>
                  </div>
                </div>
                <span className="text-red-400 shrink-0" style={{ fontSize: "9px" }}>-{d.revokes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top badges awarded */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Crown className="w-4 h-4 text-[#c8a84e]" />Top Huy hiệu Được cấp Nhiều nhất
          </h3>
          <div className="space-y-2.5">
            {topBadges.map((tb, idx) => {
              const rCfg = BADGE_RARITY_CONFIG[tb.badge.rarity];
              return (
                <div key={tb.badge.id} className="flex items-center gap-3">
                  <span className="text-gray-300 shrink-0" style={{ fontSize: "12px", fontWeight: 700, minWidth: "16px" }}>#{idx + 1}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: rCfg.bg }}>
                    <span style={{ fontSize: "18px" }}>{tb.badge.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{tb.badge.name}</p>
                    <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "8px", fontWeight: 700, color: rCfg.color, backgroundColor: rCfg.bg }}>{rCfg.label}</span>
                  </div>
                  <span className="text-gray-800 shrink-0" style={{ fontSize: "13px", fontWeight: 700 }}>{tb.count.toLocaleString()}</span>
                  <span className="text-gray-400 shrink-0" style={{ fontSize: "9px" }}>lượt</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
            <BarChart3 className="w-4 h-4 text-[#990803]" />Phân bố theo Danh mục
          </h3>
          <div className="space-y-2.5">
            {catStats.map(cs => (
              <div key={cs.cat} className="flex items-center gap-3">
                <span style={{ fontSize: "16px", width: "24px", textAlign: "center" }}>{cs.cfg.icon}</span>
                <span className="text-gray-600 shrink-0" style={{ fontSize: "11px", fontWeight: 500, minWidth: "65px" }}>{cs.cfg.label}</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#990803]/60" style={{ width: `${(cs.total / totalBadges) * 100}%` }} />
                </div>
                <span className="text-gray-700 shrink-0" style={{ fontSize: "11px", fontWeight: 600 }}>{cs.total}</span>
                <span className="text-gray-400 shrink-0" style={{ fontSize: "9px" }}>huy hiệu</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rarity distribution - SVG pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Target className="w-4 h-4 text-[#c8a84e]" />Phân bố theo Độ hiếm
          </h3>
          <div className="flex items-center gap-6">
            <div className="shrink-0">
              <svg width="100" height="100" viewBox="0 0 100 100">
                {(() => {
                  const cx = 50, cy = 50, r = 40;
                  let cumAngle = -90;
                  return rarityStats.map(rd => {
                    const angle = (rd.total / totalBadges) * 360;
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
                      <path key={rd.rarity}
                        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={rd.cfg.color} opacity={0.7} stroke="white" strokeWidth="2" />
                    );
                  });
                })()}
                <circle cx="50" cy="50" r="22" fill="white" />
                <text x="50" y="48" textAnchor="middle" fill="#374151" style={{ fontSize: "14px", fontWeight: 700 }}>{totalBadges}</text>
                <text x="50" y="60" textAnchor="middle" fill="#9ca3af" style={{ fontSize: "8px" }}>huy hiệu</text>
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              {rarityStats.map(rd => (
                <div key={rd.rarity} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: rd.cfg.color, opacity: 0.7 }} />
                  <span className="text-gray-600 flex-1" style={{ fontSize: "11px", fontWeight: 500 }}>{rd.cfg.label}</span>
                  <span className="text-gray-800" style={{ fontSize: "12px", fontWeight: 700 }}>{rd.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Per-subsidiary badge distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Building2 className="w-4 h-4 text-[#990803]" />Huy hiệu theo Công ty Thành viên
          </h3>
          <div className="space-y-2">
            {SUBSIDIARY_BADGE_STATS.map(sub => {
              const maxVal = Math.max(...SUBSIDIARY_BADGE_STATS.map(s => s.totalAwarded));
              return (
                <div key={sub.name} className="flex items-center gap-2">
                  <span className="text-gray-500 shrink-0 truncate" style={{ fontSize: "9px", fontWeight: 500, minWidth: "90px", maxWidth: "90px" }} title={sub.name}>
                    {sub.shortName}
                  </span>
                  <div className="flex-1 h-4 bg-gray-50 rounded overflow-hidden relative">
                    <div className="h-full rounded transition-all flex items-center"
                      style={{ width: `${(sub.totalAwarded / maxVal) * 100}%`, background: `linear-gradient(90deg, #990803cc, #c8a84ecc)` }}>
                      {sub.totalAwarded > 1000 && (
                        <span className="text-white px-1" style={{ fontSize: "8px", fontWeight: 600 }}>{sub.totalAwarded.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  {sub.totalAwarded <= 1000 && (
                    <span className="text-gray-600 shrink-0" style={{ fontSize: "9px", fontWeight: 600 }}>{sub.totalAwarded}</span>
                  )}
                  <span className="text-gray-400 shrink-0" style={{ fontSize: "8px" }}>
                    TB {sub.avgBadgesPerUser}/người
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity feed */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
            <Clock className="w-4 h-4 text-[#2563eb]" />Hoạt động Gần đây
          </h3>
          <div className="space-y-2 max-h-[230px] overflow-y-auto">
            {RECENT_ACTIVITIES.map(act => (
              <div key={act.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  act.type === "award" ? "bg-green-50" : "bg-red-50"
                }`}>
                  {act.type === "award"
                    ? <UserCheck className="w-3 h-3 text-green-500" />
                    : <UserMinus className="w-3 h-3 text-red-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate" style={{ fontSize: "10px" }}>
                    <span style={{ fontWeight: 600 }}>{act.user}</span>
                    {act.type === "award" ? " đạt " : " bị thu hồi "}
                    <span style={{ fontWeight: 600 }}>{act.badge}</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-gray-400" style={{ fontSize: "8px" }}>{act.time}</span>
                    <span className={`px-1 py-0.5 rounded ${act.method === "auto" ? "bg-blue-50 text-blue-500" : "bg-amber-50 text-amber-500"}`}
                      style={{ fontSize: "7px", fontWeight: 600 }}>
                      {act.method === "auto" ? "Tự động" : "Thủ công"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/5 rounded-xl border border-[#990803]/10 p-4">
        <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
          <Sparkles className="w-4 h-4 text-[#c8a84e]" />Thao tác Nhanh
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: "Cấp phát hàng loạt", desc: "Chọn NV & huy hiệu", icon: Users, color: "#22c55e", action: () => showToast("Chuyển sang tab Cấp phát") },
            { label: "Tạo Huy hiệu mới", desc: "Thêm huy hiệu mới", icon: Plus, color: "#990803", action: () => showToast("Chuyển sang tab Danh sách") },
            { label: "Xuất Báo cáo", desc: "CSV tổng hợp toàn bộ", icon: Download, color: "#2563eb", action: () => showToast("Đã xuất báo cáo tổng hợp") },
            { label: "Kiểm tra Quy tắc", desc: "Chạy kiểm tra hệ thống", icon: RefreshCw, color: "#7c3aed", action: () => showToast("Đã kiểm tra 7 quy tắc — 6 active, 1 inactive") },
          ].map(qa => (
            <button key={qa.label} onClick={qa.action}
              className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-gray-200 hover:shadow-sm cursor-pointer transition-all text-left group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                style={{ backgroundColor: qa.color + "12" }}>
                <qa.icon className="w-4 h-4" style={{ color: qa.color }} />
              </div>
              <div>
                <p className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{qa.label}</p>
                <p className="text-gray-400" style={{ fontSize: "9px" }}>{qa.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ============================================================ */
/*  TAB 2: BADGES LIST — CRUD                                    */
/* ============================================================ */

function BadgesTab({ showToast }: { showToast: (msg: string) => void }) {
  const confirm = useConfirm();
  const [badges, setBadges] = React.useState<Badge[]>([...BADGES]);
  const [search, setSearch] = React.useState("");
  const [filterCat, setFilterCat] = React.useState<BadgeCategory | "all">("all");
  const [filterRarity, setFilterRarity] = React.useState<BadgeRarity | "all">("all");
  const [sortBy, setSortBy] = React.useState<"name" | "xp" | "rarity" | "category">("name");
  const [sortAsc, setSortAsc] = React.useState(true);
  const [editBadge, setEditBadge] = React.useState<Badge | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [disabledIds, setDisabledIds] = React.useState<string[]>([]);

  const filtered = React.useMemo(() => {
    let result = badges.filter(b => {
      if (filterCat !== "all" && b.category !== filterCat) return false;
      if (filterRarity !== "all" && b.rarity !== filterRarity) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!b.name.toLowerCase().includes(q) && !b.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "name": cmp = a.name.localeCompare(b.name, "vi"); break;
        case "xp": cmp = a.xpReward - b.xpReward; break;
        case "rarity": {
          const order: Record<BadgeRarity, number> = { common: 1, rare: 2, epic: 3, legendary: 4 };
          cmp = order[a.rarity] - order[b.rarity]; break;
        }
        case "category": cmp = a.category.localeCompare(b.category); break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [badges, search, filterCat, filterRarity, sortBy, sortAsc]);

  const handleDelete = React.useCallback(async (badge: Badge) => {
    const ok = await confirm({
      title: "Xóa huy hiệu",
      message: `Bạn có chắc muốn xóa huy hiệu "${badge.name}"? Hành động này không thể hoàn tác. Tất cả nhân viên đã nhận huy hiệu này sẽ bị thu hồi.`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setBadges(prev => prev.filter(b => b.id !== badge.id));
      showToast(`Đã xóa huy hiệu "${badge.name}"`);
    }
  }, [confirm, showToast]);

  const handleSave = React.useCallback((badge: Badge, isNew: boolean) => {
    if (isNew) {
      setBadges(prev => [...prev, badge]);
      showToast(`Đã tạo huy hiệu "${badge.name}"`);
    } else {
      setBadges(prev => prev.map(b => b.id === badge.id ? badge : b));
      showToast(`Đã cập nhật huy hiệu "${badge.name}"`);
    }
    setShowForm(false);
    setEditBadge(null);
  }, [showToast]);

  const handleDuplicate = React.useCallback((badge: Badge) => {
    const newBadge: Badge = {
      ...badge,
      id: `B${String(badges.length + 1).padStart(2, "0")}`,
      name: `${badge.name} (Bản sao)`,
      earned: false,
      earnedDate: undefined,
      progress: undefined,
      currentCount: undefined,
    };
    setBadges(prev => [...prev, newBadge]);
    showToast(`Đã nhân bản huy hiệu "${badge.name}"`);
  }, [badges.length, showToast]);

  const handleBulkDelete = React.useCallback(async () => {
    if (selectedIds.length === 0) return;
    const ok = await confirm({
      title: "Xóa hàng loạt",
      message: `Bạn có chắc muốn xóa ${selectedIds.length} huy hiệu đã chọn? Hành động này không thể hoàn tác.`,
      confirmLabel: "Xóa tất cả",
      variant: "danger",
    });
    if (ok) {
      setBadges(prev => prev.filter(b => !selectedIds.includes(b.id)));
      showToast(`Đã xóa ${selectedIds.length} huy hiệu`);
      setSelectedIds([]);
    }
  }, [selectedIds, confirm, showToast]);

  const toggleDisable = React.useCallback((id: string) => {
    setDisabledIds(prev => {
      const isDisabled = prev.includes(id);
      showToast(isDisabled ? "Đã kích hoạt huy hiệu" : "Đã vô hiệu hóa huy hiệu");
      return isDisabled ? prev.filter(x => x !== id) : [...prev, id];
    });
  }, [showToast]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(b => b.id));
  };

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { label: "Tổng", value: badges.length, color: "#374151" },
          { label: "Active", value: badges.length - disabledIds.length, color: "#22c55e" },
          { label: "Disabled", value: disabledIds.length, color: "#ef4444" },
          { label: "Common", value: badges.filter(b => b.rarity === "common").length, color: "#64748b" },
          { label: "Rare", value: badges.filter(b => b.rarity === "rare").length, color: "#2563eb" },
          { label: "Epic", value: badges.filter(b => b.rarity === "epic").length, color: "#7c3aed" },
          { label: "Legendary", value: badges.filter(b => b.rarity === "legendary").length, color: "#c8a84e" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-gray-500" style={{ fontSize: "10px" }}>{s.label}:</span>
            <span className="text-gray-700" style={{ fontSize: "10px", fontWeight: 700 }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-2.5 bg-[#990803]/5 rounded-xl border border-[#990803]/15">
          <CheckCircle2 className="w-4 h-4 text-[#990803]" />
          <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{selectedIds.length} đã chọn</span>
          <div className="flex items-center gap-1.5 ml-auto">
            <button onClick={handleBulkDelete}
              className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer" style={{ fontSize: "10px", fontWeight: 600 }}>
              <Trash2 className="w-3 h-3" />Xóa ({selectedIds.length})
            </button>
            <button onClick={() => {
              setDisabledIds(prev => {
                const toDisable = selectedIds.filter(id => !prev.includes(id));
                if (toDisable.length > 0) {
                  showToast(`Đã vô hiệu hóa ${toDisable.length} huy hiệu`);
                  return [...prev, ...toDisable];
                }
                const toEnable = selectedIds.filter(id => prev.includes(id));
                showToast(`Đã kích hoạt ${toEnable.length} huy hiệu`);
                return prev.filter(id => !selectedIds.includes(id));
              });
              setSelectedIds([]);
            }}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 cursor-pointer" style={{ fontSize: "10px", fontWeight: 600 }}>
              <EyeOff className="w-3 h-3" />Toggle Active
            </button>
            <button onClick={() => setSelectedIds([])}
              className="flex items-center gap-1 px-2.5 py-1 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 cursor-pointer" style={{ fontSize: "10px" }}>
              <X className="w-3 h-3" />Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" placeholder="Tìm theo tên hoặc ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#990803]/20 focus:border-[#990803]/30"
            style={{ fontSize: "12px" }} />
          {search && <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-pointer" onClick={() => setSearch("")}><X className="w-3.5 h-3.5" /></button>}
        </div>

        <select value={filterCat} onChange={e => setFilterCat(e.target.value as any)}
          className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none" style={{ fontSize: "11px" }}>
          <option value="all">Tất cả danh mục</option>
          {(Object.keys(BADGE_CATEGORY_CONFIG) as BadgeCategory[]).map(c => (
            <option key={c} value={c}>{BADGE_CATEGORY_CONFIG[c].icon} {BADGE_CATEGORY_CONFIG[c].label}</option>
          ))}
        </select>

        <select value={filterRarity} onChange={e => setFilterRarity(e.target.value as any)}
          className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none" style={{ fontSize: "11px" }}>
          <option value="all">Tất cả độ hiếm</option>
          {(Object.keys(BADGE_RARITY_CONFIG) as BadgeRarity[]).map(r => (
            <option key={r} value={r}>{BADGE_RARITY_CONFIG[r].label}</option>
          ))}
        </select>

        <div className="flex items-center gap-1">
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none" style={{ fontSize: "11px" }}>
            <option value="name">Tên</option>
            <option value="xp">XP</option>
            <option value="rarity">Độ hiếm</option>
            <option value="category">Danh mục</option>
          </select>
          <button onClick={() => setSortAsc(!sortAsc)}
            className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer hover:bg-gray-50">
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => showToast("Đã xuất file CSV (20 huy hiệu)")}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer" style={{ fontSize: "11px" }}>
            <Download className="w-3.5 h-3.5" />Xuất CSV
          </button>
          <button onClick={() => { setEditBadge(null); setShowForm(true); }}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "11px", fontWeight: 600 }}>
            <Plus className="w-3.5 h-3.5" />Tạo Huy hiệu
          </button>
        </div>

        <span className="text-gray-400" style={{ fontSize: "10px" }}>{filtered.length} huy hiệu</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2.5 w-8">
                  <input type="checkbox"
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    className="cursor-pointer accent-[#990803]" />
                </th>
                {["ID", "Huy hiệu", "Danh mục", "Độ hiếm", "XP", "Yêu cầu", "Trạng thái", "Thao tác"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(badge => {
                const rCfg = BADGE_RARITY_CONFIG[badge.rarity];
                const cCfg = BADGE_CATEGORY_CONFIG[badge.category];
                const isDisabled = disabledIds.includes(badge.id);
                return (
                  <tr key={badge.id} className={`hover:bg-gray-50/50 transition-colors ${isDisabled ? "opacity-50" : ""} ${selectedIds.includes(badge.id) ? "bg-[#990803]/5" : ""}`}>
                    <td className="px-3 py-2.5">
                      <input type="checkbox"
                        checked={selectedIds.includes(badge.id)}
                        onChange={() => setSelectedIds(prev => prev.includes(badge.id) ? prev.filter(x => x !== badge.id) : [...prev, badge.id])}
                        className="cursor-pointer accent-[#990803]" />
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-gray-400 font-mono" style={{ fontSize: "10px" }}>{badge.id}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: rCfg.bg }}>
                          <span style={{ fontSize: "18px" }}>{badge.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{badge.name}</p>
                          <p className="text-gray-400 truncate" style={{ fontSize: "9px" }}>{badge.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-gray-500" style={{ fontSize: "10px" }}>{cCfg.icon} {cCfg.label}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 700, color: rCfg.color, backgroundColor: rCfg.bg }}>
                        {rCfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 600 }}>+{badge.xpReward}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-gray-500 truncate max-w-[160px]" style={{ fontSize: "10px" }}>{badge.requirement}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        {isDisabled ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-50 text-red-500" style={{ fontSize: "9px", fontWeight: 600 }}>
                            <EyeOff className="w-3 h-3" />Vô hiệu
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${
                            badge.earned ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"
                          }`} style={{ fontSize: "9px", fontWeight: 600 }}>
                            {badge.earned ? <><CheckCircle2 className="w-3 h-3" />Active</> : "Active"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditBadge(badge); setShowForm(true); }}
                          className="p-1 text-gray-400 hover:text-[#990803] cursor-pointer rounded hover:bg-gray-100" title="Sửa">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toggleDisable(badge.id)}
                          className={`p-1 cursor-pointer rounded hover:bg-gray-100 ${isDisabled ? "text-red-400 hover:text-green-500" : "text-gray-400 hover:text-amber-500"}`}
                          title={isDisabled ? "Kích hoạt" : "Vô hiệu hóa"}>
                          {isDisabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => handleDuplicate(badge)}
                          className="p-1 text-gray-400 hover:text-blue-500 cursor-pointer rounded hover:bg-gray-100" title="Nhân bản">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(badge)}
                          className="p-1 text-gray-400 hover:text-red-500 cursor-pointer rounded hover:bg-gray-100" title="Xóa">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-10 h-10 text-gray-200 mx-auto" />
            <p className="text-gray-400 mt-2" style={{ fontSize: "13px" }}>Không tìm thấy huy hiệu nào</p>
          </div>
        )}
      </div>

      {/* Badge Form Modal */}
      {showForm && (
        <BadgeFormModal
          badge={editBadge}
          existingIds={badges.map(b => b.id)}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditBadge(null); }}
        />
      )}
    </div>
  );
}


/* ============================================================ */
/*  BADGE FORM MODAL — Create / Edit                             */
/* ============================================================ */

function BadgeFormModal({ badge, existingIds, onSave, onClose }: {
  badge: Badge | null; existingIds: string[];
  onSave: (badge: Badge, isNew: boolean) => void; onClose: () => void;
}) {
  const isNew = !badge;
  const [form, setForm] = React.useState<Badge>(badge ?? {
    id: `B${String(existingIds.length + 1).padStart(2, "0")}`,
    name: "",
    description: "",
    icon: "🏅",
    rarity: "common" as BadgeRarity,
    category: "learning" as BadgeCategory,
    xpReward: 100,
    requirement: "",
    earned: false,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [showIconPicker, setShowIconPicker] = React.useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Tên huy hiệu không được để trống";
    if (!form.description.trim()) e.description = "Mô tả không được để trống";
    if (!form.requirement.trim()) e.requirement = "Yêu cầu không được để trống";
    if (form.xpReward < 0) e.xpReward = "XP phải >= 0";
    if (isNew && existingIds.includes(form.id)) e.id = "ID đã tồn tại";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSave(form, isNew);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 700 }}>
            {isNew ? "Tạo Huy hiệu Mới" : `Sửa: ${badge!.name}`}
          </h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer rounded-full hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5">
          {/* Icon + Name row */}
          <div className="flex items-start gap-3">
            <div className="relative">
              <button onClick={() => setShowIconPicker(!showIconPicker)}
                className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#990803] flex items-center justify-center cursor-pointer transition-colors"
                title="Chọn icon">
                <span style={{ fontSize: "28px" }}>{form.icon}</span>
              </button>
              {showIconPicker && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-10 grid grid-cols-6 gap-1" style={{ width: "200px" }}>
                  {ICON_OPTIONS.map(ic => (
                    <button key={ic} onClick={() => { setForm(f => ({ ...f, icon: ic })); setShowIconPicker(false); }}
                      className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer hover:bg-gray-100 ${form.icon === ic ? "bg-[#990803]/10 ring-1 ring-[#990803]" : ""}`}>
                      <span style={{ fontSize: "16px" }}>{ic}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>ID</label>
                <input type="text" value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))}
                  disabled={!isNew}
                  className={`w-full px-2.5 py-1.5 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#990803]/20 ${isNew ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100 cursor-not-allowed"}`}
                  style={{ fontSize: "12px" }} />
                {errors.id && <p className="text-red-500 mt-0.5" style={{ fontSize: "10px" }}>{errors.id}</p>}
              </div>
              <div>
                <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Tên huy hiệu *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Huyền thoại Tri thức"
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                  style={{ fontSize: "12px" }} />
                {errors.name && <p className="text-red-500 mt-0.5" style={{ fontSize: "10px" }}>{errors.name}</p>}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Mô tả *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả huy hiệu..." rows={2}
              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#990803]/20 resize-none"
              style={{ fontSize: "12px" }} />
            {errors.description && <p className="text-red-500 mt-0.5" style={{ fontSize: "10px" }}>{errors.description}</p>}
          </div>

          {/* Category + Rarity row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Danh mục</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as BadgeCategory }))}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                style={{ fontSize: "12px" }}>
                {(Object.keys(BADGE_CATEGORY_CONFIG) as BadgeCategory[]).map(c => (
                  <option key={c} value={c}>{BADGE_CATEGORY_CONFIG[c].icon} {BADGE_CATEGORY_CONFIG[c].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Độ hiếm</label>
              <select value={form.rarity} onChange={e => setForm(f => ({ ...f, rarity: e.target.value as BadgeRarity }))}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                style={{ fontSize: "12px" }}>
                {(Object.keys(BADGE_RARITY_CONFIG) as BadgeRarity[]).map(r => (
                  <option key={r} value={r}>{BADGE_RARITY_CONFIG[r].label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* XP + Requirement */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>XP Thưởng</label>
              <input type="number" value={form.xpReward} onChange={e => setForm(f => ({ ...f, xpReward: Number(e.target.value) }))}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                style={{ fontSize: "12px" }} min={0} />
              {errors.xpReward && <p className="text-red-500 mt-0.5" style={{ fontSize: "10px" }}>{errors.xpReward}</p>}
            </div>
            <div className="col-span-2">
              <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Yêu cầu đạt *</label>
              <input type="text" value={form.requirement} onChange={e => setForm(f => ({ ...f, requirement: e.target.value }))}
                placeholder="VD: Hoàn thành 100 khóa học"
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                style={{ fontSize: "12px" }} />
              {errors.requirement && <p className="text-red-500 mt-0.5" style={{ fontSize: "10px" }}>{errors.requirement}</p>}
            </div>
          </div>

          {/* Total required + progress tracking */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Số lượng để đạt (tùy chọn)</label>
              <input type="number" value={form.totalRequired ?? ""} onChange={e => setForm(f => ({ ...f, totalRequired: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="VD: 100"
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#990803]/20"
                style={{ fontSize: "12px" }} min={1} />
              <p className="text-gray-400 mt-0.5" style={{ fontSize: "9px" }}>Để trống nếu không theo dõi tiến độ</p>
            </div>
            <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-100">
              <div className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-500" />
                <p className="text-amber-700" style={{ fontSize: "10px", fontWeight: 600 }}>Thông báo</p>
              </div>
              <p className="text-amber-600 mt-1" style={{ fontSize: "9px" }}>
                Khi huy hiệu được cấp, nhân viên sẽ nhận thông báo qua LMS và email (nếu đã cấu hình).
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-gray-400 mb-2" style={{ fontSize: "10px", fontWeight: 600 }}>Xem trước:</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: BADGE_RARITY_CONFIG[form.rarity].bg }}>
                <span style={{ fontSize: "24px" }}>{form.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>{form.name || "Tên huy hiệu"}</p>
                <p className="text-gray-400" style={{ fontSize: "10px" }}>{form.description || "Mô tả..."}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-1.5 py-0.5 rounded-full" style={{
                    fontSize: "8px", fontWeight: 700,
                    color: BADGE_RARITY_CONFIG[form.rarity].color,
                    backgroundColor: BADGE_RARITY_CONFIG[form.rarity].bg,
                  }}>{BADGE_RARITY_CONFIG[form.rarity].label}</span>
                  <span className="text-[#c8a84e]" style={{ fontSize: "9px", fontWeight: 600 }}>+{form.xpReward} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <button onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "12px" }}>
            Hủy
          </button>
          <button onClick={handleSubmit}
            className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>
            {isNew ? "Tạo Huy hiệu" : "Lưu Thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ============================================================ */
/*  TAB 3: AWARD / REVOKE                                        */
/* ============================================================ */

function AwardTab({ showToast }: { showToast: (msg: string) => void }) {
  const confirm = useConfirm();
  const [users] = React.useState(generateMockUsers);
  const [search, setSearch] = React.useState("");
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  const [selectedBadge, setSelectedBadge] = React.useState<string>("");
  const [actionType, setActionType] = React.useState<"award" | "revoke">("award");
  const [filterSub, setFilterSub] = React.useState("all");
  const [filterDept, setFilterDept] = React.useState("all");
  const [awardReason, setAwardReason] = React.useState("");
  const [showUserBadges, setShowUserBadges] = React.useState<string | null>(null);
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [sendNotification, setSendNotification] = React.useState(true);

  const filteredUsers = React.useMemo(() => {
    return users.filter(u => {
      if (filterSub !== "all" && u.subsidiary !== filterSub) return false;
      if (filterDept !== "all" && u.department !== filterDept) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!u.name.toLowerCase().includes(q) && !u.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [users, search, filterSub, filterDept]);

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedUsers.length === filteredUsers.length) setSelectedUsers([]);
    else setSelectedUsers(filteredUsers.map(u => u.id));
  };

  const handleAction = async () => {
    if (selectedUsers.length === 0) { showToast("Vui lòng chọn ít nhất 1 nhân viên"); return; }
    if (!selectedBadge) { showToast("Vui lòng chọn huy hiệu"); return; }
    const badge = BADGES.find(b => b.id === selectedBadge);
    if (!badge) return;

    const ok = await confirm({
      title: actionType === "award" ? "Cấp huy hiệu" : "Thu hồi huy hiệu",
      message: actionType === "award"
        ? `Cấp huy hiệu "${badge.name}" cho ${selectedUsers.length} nhân viên đã chọn?`
        : `Thu hồi huy hiệu "${badge.name}" từ ${selectedUsers.length} nhân viên đã chọn? Hành động này không thể hoàn tác.`,
      confirmLabel: actionType === "award" ? "Cấp phát" : "Thu hồi",
      variant: actionType === "revoke" ? "danger" : "warning",
    });
    if (ok) {
      showToast(`Đã ${actionType === "award" ? "cấp" : "thu hồi"} huy hiệu "${badge.name}" cho ${selectedUsers.length} nhân viên`);
      setSelectedUsers([]);
      setSelectedBadge("");
      setAwardReason("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Action panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 flex items-center gap-1.5 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
          <UserCheck className="w-4 h-4 text-[#990803]" />Cấp phát / Thu hồi Huy hiệu
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          {/* Action type */}
          <div>
            <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Thao tác</label>
            <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setActionType("award")}
                className={`flex-1 px-2.5 py-1.5 cursor-pointer transition-colors ${actionType === "award" ? "bg-green-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                style={{ fontSize: "11px", fontWeight: 500 }}>
                <UserCheck className="w-3 h-3 inline mr-1" />Cấp phát
              </button>
              <button onClick={() => setActionType("revoke")}
                className={`flex-1 px-2.5 py-1.5 cursor-pointer transition-colors ${actionType === "revoke" ? "bg-red-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
                style={{ fontSize: "11px", fontWeight: 500 }}>
                <UserMinus className="w-3 h-3 inline mr-1" />Thu hồi
              </button>
            </div>
          </div>

          {/* Badge selector */}
          <div>
            <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Huy hiệu</label>
            <select value={selectedBadge} onChange={e => setSelectedBadge(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 cursor-pointer focus:outline-none" style={{ fontSize: "11px" }}>
              <option value="">-- Chọn huy hiệu --</option>
              {BADGES.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name} (+{b.xpReward} XP)</option>)}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Lý do (tùy chọn)</label>
            <input type="text" value={awardReason} onChange={e => setAwardReason(e.target.value)}
              placeholder="Ghi chú lý do..."
              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder:text-gray-300 focus:outline-none" style={{ fontSize: "11px" }} />
          </div>

          {/* Execute */}
          <div className="flex items-end">
            <button onClick={handleAction}
              className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer ${
                actionType === "award" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"
              }`} style={{ fontSize: "11px", fontWeight: 600 }}>
              {actionType === "award" ? <UserCheck className="w-3.5 h-3.5" /> : <UserMinus className="w-3.5 h-3.5" />}
              {actionType === "award" ? "Cấp phát" : "Thu hồi"} ({selectedUsers.length})
            </button>
          </div>
        </div>

        {selectedBadge && (
          <div className="p-2.5 bg-gray-50 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: BADGE_RARITY_CONFIG[BADGES.find(b => b.id === selectedBadge)?.rarity ?? "common"].bg }}>
              <span style={{ fontSize: "22px" }}>{BADGES.find(b => b.id === selectedBadge)?.icon}</span>
            </div>
            <div>
              <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{BADGES.find(b => b.id === selectedBadge)?.name}</p>
              <p className="text-gray-400" style={{ fontSize: "10px" }}>{BADGES.find(b => b.id === selectedBadge)?.description}</p>
            </div>
            <span className="ml-auto text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 600 }}>+{BADGES.find(b => b.id === selectedBadge)?.xpReward} XP</span>
          </div>
        )}

        {/* Notification & Options */}
        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={sendNotification} onChange={e => setSendNotification(e.target.checked)} className="accent-[#990803]" />
            <Bell className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600" style={{ fontSize: "10px" }}>Gửi thông báo cho nhân viên</span>
          </label>
          <button onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1 text-[#990803] cursor-pointer hover:underline" style={{ fontSize: "10px", fontWeight: 600 }}>
            <FileText className="w-3 h-3" />{showTemplates ? "Ẩn Mẫu nhanh" : "Mẫu cấp phát nhanh"}
          </button>
        </div>
      </div>

      {/* Quick Templates */}
      {showTemplates && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {AWARD_TEMPLATES.map(tpl => {
            const tplBadges = tpl.badgeIds.map(id => BADGES.find(b => b.id === id)).filter(Boolean) as Badge[];
            return (
              <div key={tpl.id} className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ fontSize: "20px" }}>{tpl.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{tpl.name}</p>
                    <p className="text-gray-400" style={{ fontSize: "9px" }}>{tpl.description}</p>
                  </div>
                  <button onClick={() => {
                    showToast(`Đã áp dụng mẫu "${tpl.name}" — Chọn nhân viên rồi bấm Cấp phát`);
                  }}
                    className="flex items-center gap-1 px-2 py-1 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer shrink-0"
                    style={{ fontSize: "9px", fontWeight: 600 }}>
                    <Send className="w-3 h-3" />Áp dụng
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  {tplBadges.map(b => {
                    const rCfg = BADGE_RARITY_CONFIG[b.rarity];
                    return (
                      <div key={b.id} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: rCfg.bg }} title={b.name}>
                        <span style={{ fontSize: "14px" }}>{b.icon}</span>
                      </div>
                    );
                  })}
                  <span className="ml-auto text-[#c8a84e]" style={{ fontSize: "9px", fontWeight: 600 }}>
                    +{tplBadges.reduce((s, b) => s + b.xpReward, 0)} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* User list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-2 p-3 border-b border-gray-100">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Tìm nhân viên..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 placeholder:text-gray-300 focus:outline-none" style={{ fontSize: "11px" }} />
          </div>
          <select value={filterSub} onChange={e => setFilterSub(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none" style={{ fontSize: "10px" }}>
            <option value="all">Tất cả công ty</option>
            {SUBSIDIARIES.slice(0, 8).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none" style={{ fontSize: "10px" }}>
            <option value="all">Tất cả phòng ban</option>
            {DEPARTMENTS.slice(0, 12).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <span className="text-gray-400 ml-auto" style={{ fontSize: "10px" }}>{selectedUsers.length} đã chọn / {filteredUsers.length} nhân viên</span>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-3 py-2 w-8">
                  <input type="checkbox" checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={toggleAll} className="cursor-pointer accent-[#990803]" />
                </th>
                {["Nhân viên", "Đơn vị", "Phòng ban", "Huy hiệu", "XP", ""].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(user => (
                <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${selectedUsers.includes(user.id) ? "bg-[#990803]/5" : ""}`}>
                  <td className="px-3 py-2">
                    <input type="checkbox" checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)} className="cursor-pointer accent-[#990803]" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#990803]/10 flex items-center justify-center shrink-0">
                        <span className="text-[#990803]" style={{ fontSize: "9px", fontWeight: 700 }}>{user.initials}</span>
                      </div>
                      <div>
                        <p className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{user.name}</p>
                        <p className="text-gray-400" style={{ fontSize: "9px" }}>{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2"><span className="text-gray-500 truncate block max-w-[120px]" style={{ fontSize: "10px" }}>{user.subsidiary}</span></td>
                  <td className="px-3 py-2"><span className="text-gray-500" style={{ fontSize: "10px" }}>{user.department}</span></td>
                  <td className="px-3 py-2">
                    <button onClick={() => setShowUserBadges(showUserBadges === user.id ? null : user.id)}
                      className="text-[#990803] cursor-pointer hover:underline flex items-center gap-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>
                      <Award className="w-3 h-3" />{user.badgeCount}
                    </button>
                    {showUserBadges === user.id && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {user.badges.slice(0, 6).map(bId => {
                          const b = BADGES.find(x => x.id === bId);
                          if (!b) return null;
                          return (
                            <span key={bId} className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-gray-50 rounded" style={{ fontSize: "8px" }}>
                              {b.icon} {b.name}
                            </span>
                          );
                        })}
                        {user.badges.length > 6 && <span className="text-gray-400" style={{ fontSize: "8px" }}>+{user.badges.length - 6}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2"><span className="text-[#c8a84e]" style={{ fontSize: "10px", fontWeight: 600 }}>{user.totalXP.toLocaleString()}</span></td>
                  <td className="px-3 py-2">
                    <button onClick={() => { setSelectedUsers([user.id]); }}
                      className="text-gray-400 hover:text-[#990803] cursor-pointer" title="Chọn riêng">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


/* ============================================================ */
/*  TAB 4: SETS — Manage Badge Collections                       */
/* ============================================================ */

function SetsTab({ showToast }: { showToast: (msg: string) => void }) {
  const confirm = useConfirm();
  const [sets, setSets] = React.useState(INITIAL_SETS);
  const [editSet, setEditSet] = React.useState<typeof INITIAL_SETS[0] | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  const handleDelete = async (set: typeof INITIAL_SETS[0]) => {
    const ok = await confirm({
      title: "Xóa Bộ sưu tập",
      message: `Bạn có chắc muốn xóa bộ sưu tập "${set.name}"?`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setSets(prev => prev.filter(s => s.id !== set.id));
      showToast(`Đã xóa bộ sưu tập "${set.name}"`);
    }
  };

  const toggleActive = (id: string) => {
    setSets(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    const set = sets.find(s => s.id === id);
    showToast(`Đã ${set?.active ? "tắt" : "bật"} bộ sưu tập "${set?.name}"`);
  };

  const handleSave = (set: typeof INITIAL_SETS[0], isNew: boolean) => {
    if (isNew) {
      setSets(prev => [...prev, set]);
      showToast(`Đã tạo bộ sưu tập "${set.name}"`);
    } else {
      setSets(prev => prev.map(s => s.id === set.id ? set : s));
      showToast(`Đã cập nhật bộ sưu tập "${set.name}"`);
    }
    setShowForm(false);
    setEditSet(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-gray-500" style={{ fontSize: "12px" }}>Quản lý các bộ sưu tập huy hiệu — hoàn thành bộ để nhận bonus XP.</p>
        <button onClick={() => { setEditSet(null); setShowForm(true); }}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "11px", fontWeight: 600 }}>
          <Plus className="w-3.5 h-3.5" />Tạo Bộ sưu tập
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sets.map(set => {
          const setBadges = set.badgeIds.map(id => BADGES.find(b => b.id === id)).filter(Boolean) as Badge[];
          const earnedInSet = setBadges.filter(b => b.earned).length;
          const isComplete = earnedInSet === setBadges.length;
          return (
            <div key={set.id} className={`bg-white rounded-xl border p-4 ${set.active ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ fontSize: "24px" }}>{set.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-gray-700 truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{set.name}</p>
                    {isComplete && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                  </div>
                  <p className="text-gray-400 truncate" style={{ fontSize: "10px" }}>{set.description}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleActive(set.id)}
                    className="p-1 text-gray-400 hover:text-[#990803] cursor-pointer" title={set.active ? "Tắt" : "Bật"}>
                    {set.active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => { setEditSet(set); setShowForm(true); }}
                    className="p-1 text-gray-400 hover:text-blue-500 cursor-pointer" title="Sửa">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(set)}
                    className="p-1 text-gray-400 hover:text-red-500 cursor-pointer" title="Xóa">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Badges in set */}
              <div className="flex items-center gap-1.5 mb-2">
                {setBadges.map(b => {
                  const rCfg = BADGE_RARITY_CONFIG[b.rarity];
                  return (
                    <div key={b.id}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${b.earned ? "" : "grayscale opacity-40"}`}
                      style={{ backgroundColor: b.earned ? rCfg.bg : "#f3f4f6" }} title={b.name}>
                      <span style={{ fontSize: "16px" }}>{b.icon}</span>
                    </div>
                  );
                })}
                <div className="ml-auto flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#c8a84e]" />
                  <span className="text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 700 }}>+{set.bonusXP} XP</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(earnedInSet / setBadges.length) * 100}%`, backgroundColor: isComplete ? "#22c55e" : "#7c3aed", opacity: 0.6 }} />
                </div>
                <span className="text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>{earnedInSet}/{setBadges.length}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Set Form Modal */}
      {showForm && (
        <SetFormModal
          set={editSet}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditSet(null); }}
          existingIds={sets.map(s => s.id)}
        />
      )}
    </div>
  );
}

function SetFormModal({ set, onSave, onClose, existingIds }: {
  set: typeof INITIAL_SETS[0] | null;
  onSave: (set: typeof INITIAL_SETS[0], isNew: boolean) => void;
  onClose: () => void; existingIds: string[];
}) {
  const isNew = !set;
  const [form, setForm] = React.useState(set ?? {
    id: `SET${existingIds.length + 1}`,
    name: "",
    icon: "📦",
    badgeIds: [] as string[],
    bonusXP: 500,
    description: "",
    active: true,
  });

  const toggleBadge = (id: string) => {
    setForm(f => ({
      ...f,
      badgeIds: f.badgeIds.includes(id) ? f.badgeIds.filter(x => x !== id) : [...f.badgeIds, id],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 700 }}>
            {isNew ? "Tạo Bộ sưu tập Mới" : `Sửa: ${set!.name}`}
          </h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer rounded-full hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Tên bộ sưu tập</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none" style={{ fontSize: "12px" }} />
            </div>
            <div>
              <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Bonus XP</label>
              <input type="number" value={form.bonusXP} onChange={e => setForm(f => ({ ...f, bonusXP: Number(e.target.value) }))}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none" style={{ fontSize: "12px" }} min={0} />
            </div>
          </div>
          <div>
            <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Mô tả</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none" style={{ fontSize: "12px" }} />
          </div>

          {/* Badge selector */}
          <div>
            <label className="text-gray-500 block mb-1" style={{ fontSize: "10px", fontWeight: 600 }}>
              Chọn huy hiệu ({form.badgeIds.length} đã chọn)
            </label>
            <div className="grid grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto p-2 bg-gray-50 rounded-lg">
              {BADGES.map(b => {
                const isSelected = form.badgeIds.includes(b.id);
                const rCfg = BADGE_RARITY_CONFIG[b.rarity];
                return (
                  <button key={b.id} onClick={() => toggleBadge(b.id)}
                    className={`flex items-center gap-1.5 p-1.5 rounded-lg cursor-pointer transition-colors text-left ${
                      isSelected ? "bg-[#990803]/10 ring-1 ring-[#990803]/30" : "bg-white hover:bg-gray-100"
                    }`}>
                    <span style={{ fontSize: "14px" }}>{b.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-700 truncate" style={{ fontSize: "9px", fontWeight: 600 }}>{b.name}</p>
                      <span className="px-1 py-0.5 rounded" style={{ fontSize: "7px", fontWeight: 700, color: rCfg.color, backgroundColor: rCfg.bg }}>{rCfg.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "12px" }}>Hủy</button>
          <button onClick={() => { if (form.name && form.badgeIds.length > 0) onSave(form, isNew); }}
            className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>
            {isNew ? "Tạo" : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ============================================================ */
/*  TAB 5: RULES — Auto-award Configuration                     */
/* ============================================================ */

function RulesTab({ showToast }: { showToast: (msg: string) => void }) {
  const confirm = useConfirm();
  const [rules, setRules] = React.useState(INITIAL_RULES);
  const [showForm, setShowForm] = React.useState(false);
  const [editRule, setEditRule] = React.useState<typeof INITIAL_RULES[0] | null>(null);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    const rule = rules.find(r => r.id === id);
    showToast(`Đã ${rule?.active ? "tắt" : "bật"} quy tắc`);
  };

  const handleDelete = async (rule: typeof INITIAL_RULES[0]) => {
    const ok = await confirm({
      title: "Xóa Quy tắc",
      message: `Bạn có chắc muốn xóa quy tắc cho huy hiệu "${BADGES.find(b => b.id === rule.badgeId)?.name}"?`,
      confirmLabel: "Xóa",
      variant: "danger",
    });
    if (ok) {
      setRules(prev => prev.filter(r => r.id !== rule.id));
      showToast("Đã xóa quy tắc");
    }
  };

  const handleSave = (rule: typeof INITIAL_RULES[0], isNew: boolean) => {
    if (isNew) {
      setRules(prev => [...prev, rule]);
      showToast("Đã tạo quy tắc mới");
    } else {
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
      showToast("Đã cập nhật quy tắc");
    }
    setShowForm(false);
    setEditRule(null);
  };

  const triggerLabels: Record<string, string> = {
    course_complete: "Hoàn thành khóa học",
    exam_score: "Điểm bài thi",
    login_streak: "Chuỗi đăng nhập",
    compliance_complete: "Compliance",
    manual: "Thủ công",
    event_attend: "Tham gia sự kiện",
    social_interaction: "Tương tác XH",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500" style={{ fontSize: "12px" }}>Cấu hình quy tắc tự động cấp huy hiệu khi nhân viên đạt điều kiện.</p>
          <p className="text-gray-400 mt-0.5" style={{ fontSize: "10px" }}>
            <Info className="w-3 h-3 inline mr-0.5" />Quy tắc "Tự động" sẽ cấp huy hiệu ngay khi hệ thống detect điều kiện. Quy tắc "Thủ công" cần admin xác nhận.
          </p>
        </div>
        <button onClick={() => { setEditRule(null); setShowForm(true); }}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer shrink-0" style={{ fontSize: "11px", fontWeight: 600 }}>
          <Plus className="w-3.5 h-3.5" />Tạo Quy tắc
        </button>
      </div>

      {/* Rule stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Tổng quy tắc", value: rules.length, color: "#374151" },
          { label: "Đang hoạt động", value: rules.filter(r => r.active).length, color: "#22c55e" },
          { label: "Tự động", value: rules.filter(r => r.autoAward).length, color: "#2563eb" },
          { label: "Thủ công", value: rules.filter(r => !r.autoAward).length, color: "#c8a84e" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-gray-500" style={{ fontSize: "10px" }}>{s.label}:</span>
            <span className="text-gray-700" style={{ fontSize: "12px", fontWeight: 700 }}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2.5">
        {rules.map(rule => {
          const badge = BADGES.find(b => b.id === rule.badgeId);
          if (!badge) return null;
          const rCfg = BADGE_RARITY_CONFIG[badge.rarity];
          /* Mock trigger stats per rule */
          const triggerCount = Math.floor(Math.random() * 500) + 50;
          const lastTriggered = ["2 phút trước", "15 phút trước", "1 giờ trước", "3 giờ trước", "Hôm qua", "2 ngày trước", "Chưa trigger"][rules.indexOf(rule) % 7];
          return (
            <div key={rule.id} className={`bg-white rounded-xl border p-4 ${rule.active ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: rCfg.bg }}>
                  <span style={{ fontSize: "22px" }}>{badge.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{badge.name}</p>
                    <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "8px", fontWeight: 700, color: rCfg.color, backgroundColor: rCfg.bg }}>{rCfg.label}</span>
                    {rule.autoAward ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-green-50 text-green-600" style={{ fontSize: "8px", fontWeight: 600 }}>
                        <RefreshCw className="w-2.5 h-2.5 inline mr-0.5" />Tự động
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600" style={{ fontSize: "8px", fontWeight: 600 }}>
                        <Shield className="w-2.5 h-2.5 inline mr-0.5" />Thủ công
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>{rule.description}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-gray-500" style={{ fontSize: "9px" }}>
                      <span style={{ fontWeight: 600 }}>Trigger:</span> {triggerLabels[rule.trigger] ?? rule.trigger}
                    </span>
                    <span className="text-gray-500" style={{ fontSize: "9px" }}>
                      <span style={{ fontWeight: 600 }}>Điều kiện:</span> <code className="bg-gray-100 px-1 py-0.5 rounded">{rule.condition}</code>
                    </span>
                    <span className="text-gray-400" style={{ fontSize: "9px" }}>
                      <Clock className="w-3 h-3 inline mr-0.5" />Lần cuối: {lastTriggered}
                    </span>
                    <span className="text-gray-400" style={{ fontSize: "9px" }}>
                      Đã trigger: <span style={{ fontWeight: 600, color: "#374151" }}>{triggerCount}</span> lần
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => {
                    showToast(`Đang kiểm tra quy tắc "${badge.name}"... ${Math.floor(Math.random() * 20) + 5} NV đủ điều kiện`);
                  }}
                    className="p-1 text-gray-400 hover:text-green-500 cursor-pointer rounded hover:bg-gray-100" title="Test quy tắc">
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggleRule(rule.id)}
                    className="p-1 cursor-pointer" title={rule.active ? "Tắt" : "Bật"}>
                    {rule.active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                  </button>
                  <button onClick={() => { setEditRule(rule); setShowForm(true); }}
                    className="p-1 text-gray-400 hover:text-blue-500 cursor-pointer" title="Sửa">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(rule)}
                    className="p-1 text-gray-400 hover:text-red-500 cursor-pointer" title="Xóa">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rule Form Modal */}
      {showForm && (
        <RuleFormModal
          rule={editRule}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditRule(null); }}
          existingIds={rules.map(r => r.id)}
          triggerLabels={triggerLabels}
        />
      )}
    </div>
  );
}

function RuleFormModal({ rule, onSave, onClose, existingIds, triggerLabels }: {
  rule: typeof INITIAL_RULES[0] | null;
  onSave: (rule: typeof INITIAL_RULES[0], isNew: boolean) => void;
  onClose: () => void; existingIds: string[];
  triggerLabels: Record<string, string>;
}) {
  const isNew = !rule;
  const [form, setForm] = React.useState(rule ?? {
    id: `R${String(existingIds.length + 1).padStart(2, "0")}`,
    badgeId: BADGES[0].id,
    trigger: "course_complete",
    condition: "",
    autoAward: true,
    active: true,
    description: "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-gray-800" style={{ fontSize: "16px", fontWeight: 700 }}>{isNew ? "Tạo Quy tắc Mới" : "Sửa Quy tắc"}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer rounded-full hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Huy hiệu</label>
            <select value={form.badgeId} onChange={e => setForm(f => ({ ...f, badgeId: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 cursor-pointer focus:outline-none" style={{ fontSize: "11px" }}>
              {BADGES.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Trigger</label>
              <select value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 cursor-pointer focus:outline-none" style={{ fontSize: "11px" }}>
                {Object.entries(triggerLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Điều kiện</label>
              <input type="text" value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
                placeholder="VD: count >= 10"
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder:text-gray-300 focus:outline-none" style={{ fontSize: "11px" }} />
            </div>
          </div>
          <div>
            <label className="text-gray-500 block mb-0.5" style={{ fontSize: "10px", fontWeight: 600 }}>Mô tả</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none" style={{ fontSize: "11px" }} />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.autoAward} onChange={e => setForm(f => ({ ...f, autoAward: e.target.checked }))} className="accent-[#990803]" />
              <span className="text-gray-600" style={{ fontSize: "11px" }}>Tự động cấp (không cần admin xác nhận)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="accent-[#990803]" />
              <span className="text-gray-600" style={{ fontSize: "11px" }}>Kích hoạt</span>
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer" style={{ fontSize: "12px" }}>Hủy</button>
          <button onClick={() => { if (form.condition && form.description) onSave(form, isNew); }}
            className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>
            {isNew ? "Tạo" : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ============================================================ */
/*  TAB 6: HISTORY — Audit Log                                   */
/* ============================================================ */

function HistoryTab({ showToast }: { showToast: (msg: string) => void }) {
  const [history] = React.useState(generateHistory);
  const [search, setSearch] = React.useState("");
  const [filterAction, setFilterAction] = React.useState<"all" | "award" | "revoke">("all");
  const [filterMethod, setFilterMethod] = React.useState<"all" | "auto" | "manual">("all");
  const [filterBadge, setFilterBadge] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 15;

  const filtered = React.useMemo(() => {
    return history.filter(h => {
      if (filterAction !== "all" && h.action !== filterAction) return false;
      if (filterMethod !== "all" && h.method !== filterMethod) return false;
      if (filterBadge !== "all" && h.badgeId !== filterBadge) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!h.employeeName.toLowerCase().includes(q) && !h.badgeName.toLowerCase().includes(q) && !h.employeeId.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [history, search, filterAction, filterMethod, filterBadge]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  /* Summary stats */
  const totalAwards = history.filter(h => h.action === "award").length;
  const totalRevokes = history.filter(h => h.action === "revoke").length;
  const autoCount = history.filter(h => h.method === "auto").length;
  const manualCount = history.filter(h => h.method === "manual").length;

  return (
    <div className="space-y-3">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { label: "Tổng Cấp phát", value: totalAwards, icon: UserCheck, color: "#22c55e", bg: "bg-green-50" },
          { label: "Tổng Thu hồi", value: totalRevokes, icon: UserMinus, color: "#ef4444", bg: "bg-red-50" },
          { label: "Tự động", value: autoCount, icon: RefreshCw, color: "#2563eb", bg: "bg-blue-50" },
          { label: "Thủ công", value: manualCount, icon: Shield, color: "#c8a84e", bg: "bg-amber-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-3 flex items-center gap-2.5`}>
            <s.icon className="w-5 h-5 shrink-0" style={{ color: s.color }} />
            <div>
              <p className="text-gray-800" style={{ fontSize: "16px", fontWeight: 700 }}>{s.value}</p>
              <p className="text-gray-500" style={{ fontSize: "9px" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" placeholder="Tìm theo tên, ID, huy hiệu..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 placeholder:text-gray-300 focus:outline-none" style={{ fontSize: "11px" }} />
        </div>

        <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg overflow-hidden">
          {(["all", "award", "revoke"] as const).map(a => (
            <button key={a} onClick={() => { setFilterAction(a); setCurrentPage(1); }}
              className={`px-2.5 py-1.5 cursor-pointer transition-colors ${filterAction === a ? "bg-[#990803] text-white" : "text-gray-500 hover:bg-gray-50"}`}
              style={{ fontSize: "10px", fontWeight: 500 }}>
              {a === "all" ? "Tất cả" : a === "award" ? "Cấp phát" : "Thu hồi"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg overflow-hidden">
          {(["all", "auto", "manual"] as const).map(m => (
            <button key={m} onClick={() => { setFilterMethod(m); setCurrentPage(1); }}
              className={`px-2.5 py-1.5 cursor-pointer transition-colors ${filterMethod === m ? "bg-[#990803] text-white" : "text-gray-500 hover:bg-gray-50"}`}
              style={{ fontSize: "10px", fontWeight: 500 }}>
              {m === "all" ? "Tất cả" : m === "auto" ? "Tự động" : "Thủ công"}
            </button>
          ))}
        </div>

        <select value={filterBadge} onChange={e => { setFilterBadge(e.target.value); setCurrentPage(1); }}
          className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 cursor-pointer focus:outline-none" style={{ fontSize: "10px" }}>
          <option value="all">Tất cả huy hiệu</option>
          {BADGES.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
        </select>

        <button onClick={() => showToast(`Đã xuất file CSV (${filtered.length} bản ghi)`)}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer ml-auto" style={{ fontSize: "11px" }}>
          <Download className="w-3.5 h-3.5" />Xuất CSV
        </button>

        <span className="text-gray-400" style={{ fontSize: "10px" }}>{filtered.length} bản ghi</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["Thời gian", "Nhân viên", "Đơn vị", "Huy hiệu", "Thao tác", "Phương thức", "Thực hiện bởi", "Lý do"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-gray-500 whitespace-nowrap" style={{ fontSize: "10px", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map(h => {
                const badge = BADGES.find(b => b.id === h.badgeId);
                const rCfg = badge ? BADGE_RARITY_CONFIG[badge.rarity] : null;
                return (
                  <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-3 py-2.5">
                      <span className="text-gray-500 whitespace-nowrap" style={{ fontSize: "10px" }}>{h.date}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-500" style={{ fontSize: "8px", fontWeight: 700 }}>
                            {h.employeeName.split(" ").map(w => w[0]).join("").slice(-2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-gray-700 whitespace-nowrap" style={{ fontSize: "11px", fontWeight: 600 }}>{h.employeeName}</p>
                          <p className="text-gray-400" style={{ fontSize: "8px" }}>{h.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-gray-500 truncate block max-w-[100px]" style={{ fontSize: "9px" }}>{h.subsidiary}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      {badge && rCfg && (
                        <div className="flex items-center gap-1.5">
                          <span style={{ fontSize: "14px" }}>{badge.icon}</span>
                          <div>
                            <p className="text-gray-700 whitespace-nowrap" style={{ fontSize: "10px", fontWeight: 600 }}>{badge.name}</p>
                            <span className="px-1 py-0.5 rounded" style={{ fontSize: "7px", fontWeight: 700, color: rCfg.color, backgroundColor: rCfg.bg }}>{rCfg.label}</span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                        h.action === "award" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      }`} style={{ fontSize: "9px", fontWeight: 600 }}>
                        {h.action === "award" ? <><UserCheck className="w-3 h-3" />Cấp phát</> : <><UserMinus className="w-3 h-3" />Thu hồi</>}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
                        h.method === "auto" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                      }`} style={{ fontSize: "9px", fontWeight: 600 }}>
                        {h.method === "auto" ? <><RefreshCw className="w-2.5 h-2.5" />Tự động</> : <><Shield className="w-2.5 h-2.5" />Thủ công</>}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-gray-500 whitespace-nowrap" style={{ fontSize: "10px" }}>{h.by}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      {h.reason && <span className="text-red-400" style={{ fontSize: "9px" }}>{h.reason}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <History className="w-10 h-10 text-gray-200 mx-auto" />
            <p className="text-gray-400 mt-2" style={{ fontSize: "13px" }}>Không tìm thấy bản ghi nào</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-gray-400" style={{ fontSize: "10px" }}>
            Hiển thị {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} / {filtered.length} bản ghi
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg cursor-pointer transition-colors ${
                  currentPage === page ? "bg-[#990803] text-white" : "text-gray-500 hover:bg-gray-50"
                }`} style={{ fontSize: "11px", fontWeight: currentPage === page ? 600 : 400 }}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="p-1.5 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
