import { useState } from "react";
import { Clock, Users, Zap, Trophy, ArrowRight } from "lucide-react";
import {
  CHALLENGES, CHALLENGE_TYPE_CONFIG,
  type Challenge, type ChallengeType, type ChallengeStatus,
} from "./mock-data";

export function Challenges() {
  const [filter, setFilter] = useState<ChallengeStatus | "all">("all");

  const filtered = filter === "all" ? CHALLENGES : CHALLENGES.filter(c => c.status === filter);
  const active = CHALLENGES.filter(c => c.status === "active");
  const upcoming = CHALLENGES.filter(c => c.status === "upcoming");

  return (
    <div className="space-y-4">
      {/* Active challenges summary */}
      <div className="bg-gradient-to-r from-[#990803] to-[#7a0602] rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 600 }}>🎯 Thử thách Đang diễn ra</h3>
            <p className="text-white/60 mt-0.5" style={{ fontSize: "12px" }}>
              {active.length} thử thách hoạt động • {upcoming.length} sắp diễn ra
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/60" style={{ fontSize: "10px" }}>Tổng XP có thể nhận</p>
            <p className="text-[#c8a84e]" style={{ fontSize: "22px", fontWeight: 700 }}>
              {active.reduce((s, c) => s + c.xpReward, 0).toLocaleString()} XP
            </p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1">
        {[
          { id: "all" as const, label: "Tất cả", count: CHALLENGES.length },
          { id: "active" as ChallengeStatus, label: "Đang diễn ra", count: active.length },
          { id: "upcoming" as ChallengeStatus, label: "Sắp tới", count: upcoming.length },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
              filter === f.id ? "bg-[#990803] text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
            style={{ fontSize: "12px", fontWeight: filter === f.id ? 600 : 400 }}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Challenge cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(ch => <ChallengeCard key={ch.id} challenge={ch} />)}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p style={{ fontSize: "40px" }}>🎯</p>
          <p className="text-gray-400 mt-2" style={{ fontSize: "13px" }}>Không có thử thách nào</p>
        </div>
      )}
    </div>
  );
}

function ChallengeCard({ challenge: ch }: { challenge: Challenge }) {
  const tCfg = CHALLENGE_TYPE_CONFIG[ch.type];
  const progressPct = ch.target > 0 ? Math.min(Math.round((ch.progress / ch.target) * 100), 100) : 0;
  const isActive = ch.status === "active";
  const isUpcoming = ch.status === "upcoming";
  const isCompleted = progressPct >= 100;
  const [registered, setRegistered] = useState(false);
  const [claimed, setClaimed] = useState(false);

  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md ${
      isCompleted ? "border-green-200 bg-green-50/30" : isActive ? "border-gray-200" : "border-gray-100 opacity-75"
    }`}>
      <div className="h-1.5" style={{ backgroundColor: ch.color }} />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: ch.color + "15" }}>
            <span style={{ fontSize: "24px" }}>{ch.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-gray-700" style={{ fontSize: "14px", fontWeight: 600 }}>{ch.title}</h4>
              <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: tCfg.color, backgroundColor: tCfg.color + "12" }}>
                {tCfg.label}
              </span>
              {isCompleted && (
                <span className="px-1.5 py-0.5 rounded-full bg-green-50 text-green-600" style={{ fontSize: "9px", fontWeight: 600 }}>
                  ✓ Hoàn thành
                </span>
              )}
            </div>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: "12px" }}>{ch.description}</p>

            {/* Progress */}
            {isActive && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-500" style={{ fontSize: "11px" }}>
                    {ch.progress}/{ch.target} {ch.unit}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: isCompleted ? "#16a34a" : ch.color }}>
                    {progressPct}%
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: isCompleted ? "#16a34a" : ch.color }} />
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-3 mt-2.5 text-gray-400" style={{ fontSize: "10px" }}>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ch.startDate} — {ch.endDate}</span>
              {ch.participants > 0 && (
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ch.participants.toLocaleString()} người</span>
              )}
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#c8a84e]/10 rounded-full text-[#c8a84e]" style={{ fontSize: "10px", fontWeight: 600 }}>
                <Zap className="w-3 h-3" /> +{ch.xpReward} XP
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-[#990803]/10 rounded-full text-[#990803]" style={{ fontSize: "10px", fontWeight: 600 }}>
                <Trophy className="w-3 h-3" /> +{ch.pointReward} điểm
              </span>
            </div>
          </div>

          {/* Action */}
          {isUpcoming && !registered && (
            <button onClick={() => { setRegistered(true); import("sonner").then(m => m.toast.success("Đã đăng ký tham gia thử thách!")); }} className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg shrink-0 cursor-pointer hover:bg-gray-200" style={{ fontSize: "11px", fontWeight: 500 }}>
              Đăng ký
            </button>
          )}
          {isUpcoming && registered && (
            <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg shrink-0" style={{ fontSize: "11px", fontWeight: 500 }}>
              ✓ Đã đăng ký
            </span>
          )}
          {isActive && !isCompleted && (
            <button onClick={() => { import("sonner").then(m => m.toast.info("Đang mở thử thách...")); }} className="px-3 py-1.5 bg-[#990803] text-white rounded-lg shrink-0 cursor-pointer hover:bg-[#7a0602] flex items-center gap-1" style={{ fontSize: "11px", fontWeight: 500 }}>
              Tiếp tục <ArrowRight className="w-3 h-3" />
            </button>
          )}
          {isCompleted && !claimed && (
            <button onClick={() => { setClaimed(true); import("sonner").then(m => m.toast.success(`Đã nhận thưởng: +${ch.xpReward} XP, +${ch.pointReward} điểm!`)); }} className="px-3 py-1.5 bg-green-600 text-white rounded-lg shrink-0 cursor-pointer hover:bg-green-700" style={{ fontSize: "11px", fontWeight: 500 }}>
              Nhận thưởng
            </button>
          )}
          {isCompleted && claimed && (
            <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg shrink-0" style={{ fontSize: "11px", fontWeight: 500 }}>
              ✓ Đã nhận
            </span>
          )}
        </div>
      </div>
    </div>
  );
}