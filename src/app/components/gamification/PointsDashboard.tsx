import {
  TrendingUp, Zap, Flame, Trophy, Star, ArrowUp,
  ArrowDown, Minus,
} from "lucide-react";
import {
  USER_XP, XP_HISTORY, LEVEL_NAMES, LEVEL_THRESHOLDS,
  MINI_LEADERBOARD, getEarnedBadgesCount, getActiveChallengesCount,
  type LeaderboardEntry,
} from "./mock-data";

export function PointsDashboard() {
  const xp = USER_XP;
  const earnedBadges = getEarnedBadgesCount();
  const activeChallenges = getActiveChallengesCount();

  return (
    <div className="space-y-4">
      {/* Hero: Level + XP */}
      <div className="bg-gradient-to-r from-[#990803] to-[#7a0602] rounded-xl p-5 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10" style={{ fontSize: "100px" }}>🏆</div>
        <div className="flex items-center gap-5 relative z-10">
          <LevelRing level={xp.level} progress={Math.round((xp.currentLevelXP / xp.nextLevelXP) * 100)} />
          <div className="flex-1">
            <p className="text-white/60" style={{ fontSize: "11px" }}>Level {xp.level}</p>
            <h2 style={{ fontSize: "24px", fontWeight: 700 }}>{xp.levelName}</h2>
            <div className="flex items-center gap-1 mt-1">
              <div className="flex-1 max-w-xs h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-[#c8a84e] rounded-full transition-all" style={{ width: `${Math.round((xp.currentLevelXP / xp.nextLevelXP) * 100)}%` }} />
              </div>
              <span className="text-white/70 shrink-0" style={{ fontSize: "11px" }}>
                {xp.currentLevelXP.toLocaleString()} / {xp.nextLevelXP.toLocaleString()} XP
              </span>
            </div>
            <p className="text-white/50 mt-1" style={{ fontSize: "10px" }}>
              Còn {(xp.nextLevelXP - xp.currentLevelXP).toLocaleString()} XP để lên Level {xp.level + 1} — {LEVEL_NAMES[xp.level] || "???"}
            </p>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <p className="text-white/50" style={{ fontSize: "10px" }}>Tổng XP</p>
            <p style={{ fontSize: "28px", fontWeight: 700 }}>{xp.totalXP.toLocaleString()}</p>
            <p className="text-[#c8a84e]" style={{ fontSize: "11px", fontWeight: 600 }}>
              Xếp hạng #{xp.rank}/{xp.totalUsers.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <StatCard icon="🔥" label="Chuỗi ngày" value={`${xp.streakDays} ngày`} sub={`Kỷ lục: ${xp.longestStreak}`} color="#ea580c" />
        <StatCard icon="⚡" label="XP tuần này" value={xp.weeklyXP.toLocaleString()} sub="+18% so tuần trước" color="#2563eb" />
        <StatCard icon="📊" label="XP tháng" value={xp.monthlyXP.toLocaleString()} sub="Tháng 3/2026" color="#7c3aed" />
        <StatCard icon="🎖️" label="Huy hiệu" value={`${earnedBadges}/20`} sub={`${20 - earnedBadges} chưa mở`} color="#c8a84e" />
        <StatCard icon="🎯" label="Thử thách" value={activeChallenges.toString()} sub="đang tham gia" color="#16a34a" />
        <StatCard icon="💰" label="Điểm đổi thưởng" value={xp.availablePoints.toLocaleString()} sub="có thể sử dụng" color="#990803" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* XP Trend chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>XP 30 ngày gần nhất</h3>
          <XPTrendChart />
        </div>

        {/* Streak calendar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>
            🔥 Chuỗi {xp.streakDays} ngày liên tiếp
          </h3>
          <p className="text-gray-400 mb-3" style={{ fontSize: "11px" }}>Tiếp tục học hôm nay để giữ chuỗi!</p>
          <StreakCalendar streakDays={xp.streakDays} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Level map */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Bản đồ Level</h3>
          <LevelMap currentLevel={xp.level} totalXP={xp.totalXP} />
        </div>

        {/* Mini leaderboard */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Top 10 Toàn Tập đoàn</h3>
          <div className="space-y-1.5">
            {MINI_LEADERBOARD.map(entry => (
              <div
                key={entry.rank}
                className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors ${entry.rank <= 3 ? "bg-[#c8a84e]/5" : "hover:bg-gray-50"} ${entry.avatar === "NTK" ? "ring-1 ring-[#990803]/30 bg-[#990803]/5" : ""}`}
              >
                <span className={`w-5 text-center shrink-0 ${entry.rank <= 3 ? "text-[#c8a84e]" : "text-gray-400"}`} style={{ fontSize: "12px", fontWeight: 700 }}>
                  {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
                </span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0" style={{ fontSize: "9px", fontWeight: 700, background: entry.rank <= 3 ? "linear-gradient(145deg, #c8a84e, #a08638)" : "linear-gradient(145deg, #990803, #7a0602)" }}>
                  {entry.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{entry.name}</p>
                  <p className="text-gray-300" style={{ fontSize: "9px" }}>{entry.subsidiary} • Lv.{entry.level} • {entry.badges} 🎖️</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{entry.xp.toLocaleString()}</p>
                  <span className="text-gray-300" style={{ fontSize: "9px" }}>XP</span>
                </div>
                <span style={{ fontSize: "10px" }}>
                  {entry.trend === "up" ? "🔺" : entry.trend === "down" ? "🔻" : "➖"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span style={{ fontSize: "14px" }}>{icon}</span>
        <span className="text-gray-400" style={{ fontSize: "10px" }}>{label}</span>
      </div>
      <p style={{ fontSize: "20px", fontWeight: 700, color }}>{value}</p>
      <p className="text-gray-300 mt-0.5" style={{ fontSize: "10px" }}>{sub}</p>
    </div>
  );
}

function LevelRing({ level, progress }: { level: number; progress: number }) {
  const size = 90, cx = 45, cy = 45, r = 36, sw = 6;
  const circ = 2 * Math.PI * r;
  const filled = (progress / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={sw} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#c8a84e" strokeWidth={sw}
        strokeDasharray={`${filled} ${circ}`} transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap="round"
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" style={{ fontSize: "24px", fontWeight: 700 }}>{level}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.6)" style={{ fontSize: "9px" }}>LEVEL</text>
    </svg>
  );
}

function XPTrendChart() {
  const data = XP_HISTORY;
  const W = 600, H = 160, padL = 32, padR = 10, padT = 10, padB = 24;
  const chartW = W - padL - padR, chartH = H - padT - padB;
  const maxXP = Math.max(...data.map(d => d.xp));

  const points = data.map((d, i) => ({
    x: padL + (i / (data.length - 1)) * chartW,
    y: padT + chartH - (d.xp / maxXP) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padT + chartH} L ${points[0].x} ${padT + chartH} Z`;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = padT + chartH * (1 - pct);
        return (
          <g key={pct}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#f0f0f0" />
            <text x={padL - 4} y={y + 3} textAnchor="end" fill="#d1d5db" style={{ fontSize: "8px" }}>
              {Math.round(maxXP * pct)}
            </text>
          </g>
        );
      })}
      {/* Area */}
      <path d={areaPath} fill="url(#xpGrad)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="#990803" strokeWidth="2" />
      {/* Dots for weekends */}
      {points.filter((_, i) => i % 7 === 0).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#990803" stroke="white" strokeWidth="1.5" />
      ))}
      {/* X labels */}
      {data.filter((_, i) => i % 5 === 0).map((d, i) => {
        const idx = data.indexOf(d);
        return (
          <text key={i} x={points[idx].x} y={H - 4} textAnchor="middle" fill="#d1d5db" style={{ fontSize: "8px" }}>
            {d.date}
          </text>
        );
      })}
      <defs>
        <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#990803" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#990803" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function StreakCalendar({ streakDays }: { streakDays: number }) {
  // Show last 28 days (4 weeks)
  const cells = 28;
  const cols = 7;
  const rows = Math.ceil(cells / cols);
  const cellSize = 28, gap = 4;
  const W = cols * (cellSize + gap), H = rows * (cellSize + gap) + 16;
  const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Day labels */}
      {labels.map((l, i) => (
        <text key={l} x={i * (cellSize + gap) + cellSize / 2} y={10} textAnchor="middle" fill="#d1d5db" style={{ fontSize: "8px" }}>{l}</text>
      ))}
      {/* Cells */}
      {Array.from({ length: cells }, (_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = col * (cellSize + gap);
        const y = 16 + row * (cellSize + gap);
        const dayIndex = cells - i; // days ago
        const isStreak = dayIndex <= streakDays;
        const isToday = dayIndex === 1;

        return (
          <g key={i}>
            <rect
              x={x} y={y} width={cellSize} height={cellSize} rx="6"
              fill={isStreak ? "#ea580c" : "#f9fafb"}
              opacity={isStreak ? (0.4 + (streakDays - dayIndex) / streakDays * 0.6) : 1}
              stroke={isToday ? "#990803" : "transparent"}
              strokeWidth={isToday ? 2 : 0}
            />
            {isStreak && (
              <text x={x + cellSize / 2} y={y + cellSize / 2 + 1} textAnchor="middle" dominantBaseline="central" fill="white" style={{ fontSize: "10px" }}>
                🔥
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function LevelMap({ currentLevel, totalXP }: { currentLevel: number; totalXP: number }) {
  const W = 460, H = 180;
  const levels = LEVEL_NAMES.length;
  const stepW = (W - 40) / (levels - 1);

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Path */}
      {LEVEL_NAMES.map((_, i) => {
        if (i === 0) return null;
        const x1 = 20 + (i - 1) * stepW;
        const x2 = 20 + i * stepW;
        const y = 60;
        const passed = i < currentLevel;
        return (
          <line key={i} x1={x1} y1={y} x2={x2} y2={y}
            stroke={passed ? "#c8a84e" : "#e5e7eb"} strokeWidth="3" strokeLinecap="round"
          />
        );
      })}
      {/* Nodes */}
      {LEVEL_NAMES.map((name, i) => {
        const x = 20 + i * stepW;
        const y = 60;
        const isCurrent = i + 1 === currentLevel;
        const passed = i + 1 <= currentLevel;
        const r = isCurrent ? 14 : 10;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={r}
              fill={passed ? (isCurrent ? "#990803" : "#c8a84e") : "white"}
              stroke={passed ? (isCurrent ? "#990803" : "#c8a84e") : "#e5e7eb"}
              strokeWidth="2"
            />
            {passed && (
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fill="white" style={{ fontSize: isCurrent ? "11px" : "9px", fontWeight: 700 }}>
                {i + 1}
              </text>
            )}
            {!passed && (
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fill="#d1d5db" style={{ fontSize: "9px" }}>
                {i + 1}
              </text>
            )}
            {/* Label */}
            <text x={x} y={y + (isCurrent ? 28 : 24)} textAnchor="middle" fill={isCurrent ? "#990803" : passed ? "#c8a84e" : "#9ca3af"} style={{ fontSize: "8px", fontWeight: isCurrent ? 700 : 400 }}>
              {name}
            </text>
            {/* XP threshold */}
            <text x={x} y={y - (isCurrent ? 22 : 18)} textAnchor="middle" fill="#d1d5db" style={{ fontSize: "7px" }}>
              {(LEVEL_THRESHOLDS[i] || 0).toLocaleString()}
            </text>
            {/* Current marker */}
            {isCurrent && (
              <text x={x} y={y - 34} textAnchor="middle" fill="#990803" style={{ fontSize: "12px" }}>📍</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
