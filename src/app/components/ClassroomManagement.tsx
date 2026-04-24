import React, { useState } from "react";
import { School, LayoutGrid, CalendarDays, CalendarPlus } from "lucide-react";
import { useAuth } from "./AuthContext";
import { ClassroomList } from "./classroom/ClassroomList";
import { SessionCalendar } from "./classroom/SessionCalendar";
import { AttendanceTracker } from "./classroom/AttendanceTracker";

type Tab = "rooms" | "calendar" | "booking";
type View = "rooms" | "calendar" | "booking" | "attendance";

export function ClassroomManagement() {
  const { user } = useAuth();
  const role = user?.role || "learner";
  const isAdmin = role === "admin";
  const isInstructor = role === "instructor";

  const [view, setView] = useState<View>("rooms");
  const [activeTab, setActiveTab] = useState<Tab>("rooms");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setView("attendance");
  };

  const handleBack = () => {
    setView(activeTab);
    setSelectedSessionId("");
  };

  const tabs: { id: Tab; label: string; icon: typeof LayoutGrid; show: boolean }[] = [
    { id: "rooms", label: "Phòng học & Phòng họp", icon: LayoutGrid, show: true },
    { id: "calendar", label: "Lịch Giảng dạy", icon: CalendarDays, show: true },
    { id: "booking", label: "Đặt phòng", icon: CalendarPlus, show: isAdmin || isInstructor },
  ];

  return (
    <div className="space-y-4">
      {view !== "attendance" && (
        <>
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <School className="w-6 h-6 text-[#990803]" />
              <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-foreground">
                Quản lý Phòng học & Lịch Giảng dạy
              </h1>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
              {isAdmin
                ? "Quản lý phòng học, phòng họp, lịch giảng dạy, phân bổ giảng viên và điểm danh"
                : isInstructor
                ? "Xem phòng học, lịch giảng dạy và điểm danh học viên"
                : "Xem thông tin phòng học và lịch học của bạn"}
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex gap-0.5">
              {tabs.filter(t => t.show).map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setView(tab.id); }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 transition-all cursor-pointer ${
                      isActive ? "border-[#990803] text-[#990803]" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                    style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400 }}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Content */}
      {view === "rooms" && <ClassroomList onSelectSession={handleSelectSession} />}
      {view === "calendar" && <SessionCalendar onSelectSession={handleSelectSession} />}
      {view === "booking" && <SessionCalendar onSelectSession={handleSelectSession} bookingMode />}
      {view === "attendance" && <AttendanceTracker sessionId={selectedSessionId} onBack={handleBack} />}
    </div>
  );
}
