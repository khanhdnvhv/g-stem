import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router";
import {
  Route, Plus, ChevronLeft, ChevronRight,
  LayoutDashboard, List, Hammer, Send, BarChart3, Sparkles,
  BookOpen, Compass, Brain,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { PathOverview } from "./learning-paths/PathOverview";
import { PathList } from "./learning-paths/PathList";
import { PathBuilder } from "./learning-paths/PathBuilder";
import { PathAssignments } from "./learning-paths/PathAssignments";
import { PathAnalytics } from "./learning-paths/PathAnalytics";
import { PathTemplates } from "./learning-paths/PathTemplates";
import { LearnerMyPaths } from "./learning-paths/LearnerMyPaths";
import { LearnerExplore } from "./learning-paths/LearnerExplore";
import { LearnerAIRecommend } from "./learning-paths/LearnerAIRecommend";
import type { AdminTab, LearnerTab } from "./learning-paths/types";

type TabKey = AdminTab | LearnerTab;

interface TabDef {
  key: TabKey;
  label: string;
  icon: typeof Route;
}

function getAdminTabs(): TabDef[] {
  return [
    { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
    { key: "list", label: "Danh sách", icon: List },
    { key: "builder", label: "Tạo Lộ trình", icon: Hammer },
    { key: "assignments", label: "Phân công", icon: Send },
    { key: "analytics", label: "Phân tích", icon: BarChart3 },
    { key: "templates", label: "Templates", icon: Sparkles },
  ];
}

function getInstructorTabs(): TabDef[] {
  return [
    { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
    { key: "list", label: "Danh sách", icon: List },
    { key: "builder", label: "Đề xuất Lộ trình", icon: Hammer },
    { key: "analytics", label: "Phân tích", icon: BarChart3 },
    { key: "templates", label: "Templates", icon: Sparkles },
  ];
}

function getLearnerTabs(): TabDef[] {
  return [
    { key: "my-paths", label: "Lộ trình của tôi", icon: BookOpen },
    { key: "explore", label: "Khám phá", icon: Compass },
    { key: "ai-recommend", label: "AI Đề xuất", icon: Brain },
  ];
}

export function LearningPaths() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isAdmin = user?.role === "admin";
  const isInstructor = user?.role === "instructor";
  const isLearner = user?.role === "learner";

  const tabs = isAdmin ? getAdminTabs() : isInstructor ? getInstructorTabs() : getLearnerTabs();
  const defaultTab = isLearner ? "my-paths" : "overview";

  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  // Sync tab from URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabs.some(t => t.key === tabParam)) {
      setActiveTab(tabParam as TabKey);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    const d = isLearner ? "my-paths" : "overview";
    if (tab === d) {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  }, [setSearchParams, isLearner]);

  // Scroll indicators
  const updateScrollIndicators = useCallback(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    updateScrollIndicators();
    el.addEventListener("scroll", updateScrollIndicators);
    const ro = new ResizeObserver(updateScrollIndicators);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollIndicators);
      ro.disconnect();
    };
  }, [updateScrollIndicators]);

  const scrollTabs = (dir: "left" | "right") => {
    const el = tabScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const renderContent = () => {
    switch (activeTab) {
      // Admin/Instructor tabs
      case "overview":
        return <PathOverview onNavigateTab={handleTabChange} />;
      case "list":
        return <PathList />;
      case "builder":
        return <PathBuilder />;
      case "assignments":
        return <PathAssignments />;
      case "analytics":
        return <PathAnalytics />;
      case "templates":
        return <PathTemplates onUseTemplate={() => handleTabChange("builder")} />;
      // Learner tabs
      case "my-paths":
        return <LearnerMyPaths />;
      case "explore":
        return <LearnerExplore />;
      case "ai-recommend":
        return <LearnerAIRecommend />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-foreground flex items-center gap-2">
            <Route className="w-6 h-6 text-[#990803]" />
            {isAdmin ? "Quản lý Lộ trình Đào tạo" : isInstructor ? "Lộ trình Đào tạo" : "Lộ trình Học tập"}
          </h1>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
            {isAdmin
              ? "Xây dựng, quản lý và theo dõi các lộ trình đào tạo toàn Tập đoàn"
              : isInstructor
              ? "Quản lý và theo dõi lộ trình đào tạo liên quan"
              : "Theo dõi tiến trình học tập và khám phá lộ trình phù hợp"}
          </p>
        </div>
        {(isAdmin || isInstructor) && activeTab !== "builder" && (
          <button
            onClick={() => handleTabChange("builder")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors shrink-0 cursor-pointer"
            style={{ fontSize: "14px" }}
          >
            <Plus className="w-4 h-4" />
            {isAdmin ? "Tạo Lộ trình" : "Đề xuất Lộ trình"}
          </button>
        )}
      </div>

      {/* Tab Navigation - scrollable with chevrons */}
      <div className="relative">
        {/* Left chevron */}
        {canScrollLeft && (
          <button
            onClick={() => scrollTabs("left")}
            className="absolute left-0 top-0 bottom-0 z-10 flex items-center pl-1 pr-2 cursor-pointer"
            style={{ background: "linear-gradient(to right, var(--background) 60%, transparent)" }}
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        <div
          ref={tabScrollRef}
          className="flex gap-1 overflow-x-auto scrollbar-hide px-1"
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-[#990803] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                style={{ fontSize: "13px", fontWeight: isActive ? 600 : 500 }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right chevron */}
        {canScrollRight && (
          <button
            onClick={() => scrollTabs("right")}
            className="absolute right-0 top-0 bottom-0 z-10 flex items-center pr-1 pl-2 cursor-pointer"
            style={{ background: "linear-gradient(to left, var(--background) 60%, transparent)" }}
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Tab Content */}
      {renderContent()}
    </div>
  );
}
