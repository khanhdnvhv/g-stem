import { useState } from "react";
import { Gamepad2, BarChart3, Award, Target, Gift } from "lucide-react";
import { PointsDashboard } from "./gamification/PointsDashboard";
import { BadgeCollection } from "./gamification/BadgeCollection";
import { Challenges } from "./gamification/Challenges";
import { RewardsStore } from "./gamification/RewardsStore";

type Tab = "points" | "badges" | "challenges" | "rewards";

export function GamificationCenter() {
  const [activeTab, setActiveTab] = useState<Tab>("points");

  const tabs = [
    { id: "points" as Tab, label: "XP & Level", icon: BarChart3 },
    { id: "badges" as Tab, label: "Huy hiệu", icon: Award, badge: "10/20" },
    { id: "challenges" as Tab, label: "Thử thách", icon: Target, badge: "6" },
    { id: "rewards" as Tab, label: "Đổi thưởng", icon: Gift },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Gamepad2 className="w-6 h-6 text-[#990803]" />
          <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">
            Trung tâm Gamification
          </h1>
        </div>
        <p className="text-gray-500" style={{ fontSize: "13px" }}>
          Tích lũy XP, thu thập huy hiệu, hoàn thành thử thách và đổi phần thưởng hấp dẫn
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0.5">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
                  isActive ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400 }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full ${isActive ? "bg-[#990803]/10 text-[#990803]" : "bg-gray-100 text-gray-400"}`} style={{ fontSize: "10px", fontWeight: 600 }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === "points" && <PointsDashboard />}
      {activeTab === "badges" && <BadgeCollection />}
      {activeTab === "challenges" && <Challenges />}
      {activeTab === "rewards" && <RewardsStore />}
    </div>
  );
}
