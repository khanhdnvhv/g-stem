import { useState } from "react";
import { Bell, Settings, BarChart3 } from "lucide-react";
import { useAuth } from "./AuthContext";
import { NotificationList } from "./notifications/NotificationList";
import { NotificationPreferences } from "./notifications/NotificationPreferences";
import { getUnreadCount, MOCK_NOTIFICATIONS, CATEGORY_CONFIG, getCategoryList } from "./notifications/mock-data";

const TABS = [
  { id: "list", label: "Thông báo", icon: Bell },
  { id: "preferences", label: "Cài đặt", icon: Settings },
] as const;

type TabId = typeof TABS[number]["id"];

export function Notifications() {
  const { user } = useAuth();
  const isAdmin = user?.legacyRole === "admin";
  const [activeTab, setActiveTab] = useState<TabId>("list");

  const unreadCount = getUnreadCount();
  const totalCount = MOCK_NOTIFICATIONS.length;

  // Mini stats SVG
  const categoryData = getCategoryList().map(cat => ({
    category: cat,
    count: MOCK_NOTIFICATIONS.filter(n => n.category === cat).length,
    color: CATEGORY_CONFIG[cat].color,
    label: CATEGORY_CONFIG[cat].label,
  })).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...categoryData.map(d => d.count));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">
              Trung tâm Thông báo
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-[#990803] text-white rounded-full" style={{ fontSize: "11px", fontWeight: 700 }}>
                {unreadCount} mới
              </span>
            )}
          </div>
          <p className="text-gray-500" style={{ fontSize: "13px" }}>
            Quản lý tất cả thông báo từ các module LMS — chấm điểm, thi cử, khóa học, chứng chỉ, và hệ thống
          </p>
        </div>

        {/* Mini stats bar */}
        <div className="flex items-end gap-1" title="Phân bổ thông báo theo danh mục">
          {categoryData.slice(0, 8).map(d => (
            <div key={d.category} className="flex flex-col items-center gap-0.5">
              <div
                className="w-5 rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${Math.max(8, (d.count / maxCount) * 36)}px`,
                  backgroundColor: d.color,
                }}
                title={`${d.label}: ${d.count}`}
              />
              <span className="text-gray-300" style={{ fontSize: "7px" }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0.5">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-2.5 whitespace-nowrap border-b-2 transition-all cursor-pointer
                  ${isActive
                    ? "border-[#990803] text-[#990803]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
                style={{ fontSize: "13px", fontWeight: isActive ? 600 : 500 }}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === "list" && unreadCount > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full ${isActive ? "bg-[#990803] text-white" : "bg-gray-100 text-gray-600"}`}
                    style={{ fontSize: "10px", fontWeight: 700 }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "list" && <NotificationList isAdmin={isAdmin} />}
        {activeTab === "preferences" && <NotificationPreferences />}
      </div>
    </div>
  );
}
