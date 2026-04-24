import { useState } from "react";
import { ShoppingCart, Coins, Gift, Star, AlertCircle } from "lucide-react";
import {
  REWARDS, REWARD_CATEGORY_CONFIG, USER_XP,
  type Reward, type RewardCategory,
} from "./mock-data";

export function RewardsStore() {
  const [filterCat, setFilterCat] = useState<RewardCategory | "all">("all");
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [redeemed, setRedeemed] = useState<string[]>([]);

  const available = USER_XP.availablePoints;
  const filtered = filterCat === "all" ? REWARDS : REWARDS.filter(r => r.category === filterCat);

  const handleRedeem = (reward: Reward) => {
    setSelectedReward(reward);
    setShowConfirm(true);
  };

  const confirmRedeem = () => {
    if (selectedReward) {
      setRedeemed(prev => [...prev, selectedReward.id]);
    }
    setShowConfirm(false);
    setSelectedReward(null);
  };

  return (
    <div className="space-y-4">
      {/* Points balance */}
      <div className="bg-gradient-to-r from-[#c8a84e]/15 to-[#c8a84e]/5 rounded-xl border border-[#c8a84e]/20 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500" style={{ fontSize: "12px" }}>Điểm khả dụng</p>
            <p className="text-[#c8a84e] flex items-center gap-2" style={{ fontSize: "32px", fontWeight: 700 }}>
              <Coins className="w-7 h-7" />
              {available.toLocaleString()}
            </p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>
              Kiếm thêm điểm bằng cách hoàn thành khóa học và thử thách
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-4">
              {[
                { label: "Đã đổi tháng này", value: "1,200" },
                { label: "Tổng đã đổi", value: "8,500" },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-gray-700" style={{ fontSize: "18px", fontWeight: 600 }}>{s.value}</p>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterCat("all")}
          className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${filterCat === "all" ? "bg-[#990803] text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          style={{ fontSize: "12px", fontWeight: filterCat === "all" ? 600 : 400 }}
        >
          Tất cả
        </button>
        {(Object.keys(REWARD_CATEGORY_CONFIG) as RewardCategory[]).map(cat => {
          const cfg = REWARD_CATEGORY_CONFIG[cat];
          const count = REWARDS.filter(r => r.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors flex items-center gap-1 ${filterCat === cat ? "bg-[#990803] text-white" : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              style={{ fontSize: "12px", fontWeight: filterCat === cat ? 600 : 400 }}
            >
              {cfg.icon} {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Popular rewards */}
      {filterCat === "all" && (
        <div>
          <h3 className="text-gray-700 flex items-center gap-1.5 mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Star className="w-4 h-4 text-[#c8a84e]" /> Phổ biến
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {REWARDS.filter(r => r.popular).map(reward => (
              <RewardCard key={reward.id} reward={reward} available={available} redeemed={redeemed.includes(reward.id)} onRedeem={handleRedeem} />
            ))}
          </div>
        </div>
      )}

      {/* All rewards */}
      <div>
        {filterCat === "all" && (
          <h3 className="text-gray-700 mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>Tất cả phần thưởng</h3>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(reward => (
            <RewardCard key={reward.id} reward={reward} available={available} redeemed={redeemed.includes(reward.id)} onRedeem={handleRedeem} />
          ))}
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && selectedReward && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center" onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: "48px" }}>{selectedReward.icon}</span>
            <h3 className="text-gray-800 mt-2" style={{ fontSize: "16px", fontWeight: 600 }}>Xác nhận Đổi thưởng</h3>
            <p className="text-gray-500 mt-1" style={{ fontSize: "13px" }}>{selectedReward.name}</p>

            <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
              <span className="text-gray-500" style={{ fontSize: "12px" }}>Chi phí</span>
              <span className="text-[#c8a84e] flex items-center gap-1" style={{ fontSize: "18px", fontWeight: 700 }}>
                <Coins className="w-4 h-4" /> {selectedReward.pointCost.toLocaleString()}
              </span>
            </div>

            {available < selectedReward.pointCost && (
              <div className="mt-3 p-2 bg-red-50 rounded-lg flex items-center gap-2 text-red-600" style={{ fontSize: "11px" }}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                Bạn thiếu {(selectedReward.pointCost - available).toLocaleString()} điểm
              </div>
            )}

            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 cursor-pointer"
                style={{ fontSize: "13px" }}
              >
                Hủy
              </button>
              <button
                onClick={confirmRedeem}
                disabled={available < selectedReward.pointCost}
                className={`flex-1 py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 ${
                  available >= selectedReward.pointCost
                    ? "bg-[#990803] text-white hover:bg-[#7a0602]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                <ShoppingCart className="w-4 h-4" /> Đổi ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RewardCard({ reward, available, redeemed, onRedeem }: { reward: Reward; available: number; redeemed: boolean; onRedeem: (r: Reward) => void }) {
  const catCfg = REWARD_CATEGORY_CONFIG[reward.category];
  const canAfford = available >= reward.pointCost;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all ${redeemed ? "ring-2 ring-green-200" : ""}`}>
      {/* Color header */}
      <div className="h-20 relative flex items-center justify-center" style={{ backgroundColor: reward.image + "12" }}>
        <span style={{ fontSize: "40px" }}>{reward.icon}</span>
        {reward.popular && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#c8a84e] text-white rounded-full" style={{ fontSize: "8px", fontWeight: 700 }}>
            HOT
          </span>
        )}
        {redeemed && (
          <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center">
            <span className="px-3 py-1 bg-green-600 text-white rounded-full" style={{ fontSize: "11px", fontWeight: 700 }}>
              ✓ Đã đổi
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-gray-400" style={{ fontSize: "10px" }}>{catCfg.icon} {catCfg.label}</span>
          <span className="text-gray-300 ml-auto" style={{ fontSize: "9px" }}>Còn: {reward.stock}</span>
        </div>
        <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600 }}>{reward.name}</p>
        <p className="text-gray-400 mt-0.5 line-clamp-2" style={{ fontSize: "11px" }}>{reward.description}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="flex items-center gap-1 text-[#c8a84e]" style={{ fontSize: "15px", fontWeight: 700 }}>
            <Coins className="w-4 h-4" /> {reward.pointCost.toLocaleString()}
          </span>
          {!redeemed ? (
            <button
              onClick={() => onRedeem(reward)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${
                canAfford
                  ? "bg-[#990803] text-white hover:bg-[#7a0602]"
                  : "bg-gray-100 text-gray-400"
              }`}
              style={{ fontSize: "11px", fontWeight: 600 }}
            >
              <Gift className="w-3.5 h-3.5" /> Đổi
            </button>
          ) : (
            <span className="text-green-600" style={{ fontSize: "11px", fontWeight: 600 }}>✓ Đã đổi</span>
          )}
        </div>
      </div>
    </div>
  );
}
