import { useState } from "react";
import { DollarSign, BarChart3, PieChart, FileText, TrendingUp } from "lucide-react";
import { useAuth } from "./AuthContext";
import { BudgetOverview } from "./budget/BudgetOverview";
import { BudgetAllocation } from "./budget/BudgetAllocation";
import { CostAnalysis } from "./budget/CostAnalysis";
import { BudgetRequests } from "./budget/BudgetRequests";
import { getPendingRequestCount } from "./budget/mock-data";

type Tab = "overview" | "allocation" | "cost" | "requests";

export function TrainingBudget() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const pendingCount = getPendingRequestCount();

  const tabs = [
    { id: "overview" as Tab, label: "Tổng quan", icon: BarChart3 },
    { id: "allocation" as Tab, label: "Phân bổ Ngân sách", icon: PieChart },
    { id: "cost" as Tab, label: "Phân tích Chi phí & ROI", icon: TrendingUp },
    { id: "requests" as Tab, label: "Đề xuất Ngân sách", icon: FileText, badge: pendingCount > 0 ? String(pendingCount) : undefined },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="w-6 h-6 text-[#990803]" />
          <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">
            Quản lý Ngân sách Đào tạo
          </h1>
        </div>
        <p className="text-gray-500" style={{ fontSize: "13px" }}>
          Theo dõi phân bổ, chi tiêu và hiệu quả đầu tư đào tạo toàn tập đoàn — Năm tài chính 2026
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0.5 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "border-[#990803] text-[#990803]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400 }}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600" style={{ fontSize: "10px", fontWeight: 700 }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === "overview" && <BudgetOverview />}
      {activeTab === "allocation" && <BudgetAllocation />}
      {activeTab === "cost" && <CostAnalysis />}
      {activeTab === "requests" && <BudgetRequests isAdmin={isAdmin} />}
    </div>
  );
}
