import { useState, useRef, useEffect } from "react";
import {
  Award, LayoutDashboard, Palette, Settings, FileText,
  Clock, Shield, BarChart3, ChevronLeft, ChevronRight,
  GraduationCap, CheckCircle2, History,
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { CertOverview } from "./certificates/CertOverview";
import { CertTemplateManager } from "./certificates/CertTemplateManager";
import { CertIssuedList } from "./certificates/CertIssuedList";
import { CertMyCollection } from "./certificates/CertMyCollection";
import { CertIssuanceConfig } from "./certificates/CertIssuanceConfig";
import { CertApprovalQueue } from "./certificates/CertApprovalQueue";
import { CertVerification } from "./certificates/CertVerification";
import { CertReports } from "./certificates/CertReports";
import { CertInstructorStats } from "./certificates/CertInstructorStats";
import { CertHistory } from "./certificates/CertHistory";

// ── Tab definitions per role ──
interface TabDef {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

function getTabsForRole(role: string): TabDef[] {
  switch (role) {
    case "admin":
      return [
        { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
        { id: "templates", label: "Quản lý Phôi", icon: Palette },
        { id: "config", label: "Cấu hình Cấp", icon: Settings },
        { id: "issued", label: "Đã cấp", icon: FileText },
        { id: "approvals", label: "Chờ Phê duyệt", icon: Clock, badge: "12" },
        { id: "verification", label: "Xác thực", icon: Shield },
        { id: "reports", label: "Báo cáo", icon: BarChart3 },
      ];
    case "instructor":
      return [
        { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
        { id: "issued", label: "CC Khóa học", icon: FileText },
        { id: "approvals", label: "Xác nhận Cấp", icon: CheckCircle2, badge: "4" },
        { id: "stats", label: "Thống kê", icon: BarChart3 },
      ];
    case "learner":
    default:
      return [
        { id: "my-certs", label: "Chứng chỉ của tôi", icon: GraduationCap },
        { id: "verification", label: "Xác thực", icon: Shield },
        { id: "history", label: "Lịch sử & Gia hạn", icon: History },
      ];
  }
}

export function Certificates() {
  const { user } = useAuth();
  const role = user?.role || "learner";
  const tabs = getTabsForRole(role);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && tabs.find(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeTab !== tabs[0].id) {
      url.searchParams.set("tab", activeTab);
    } else {
      url.searchParams.delete("tab");
    }
    window.history.replaceState({}, "", url.toString());
  }, [activeTab]);

  // Scroll handling
  const checkScroll = () => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const el = tabsRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      const ro = new ResizeObserver(checkScroll);
      ro.observe(el);
      return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
    }
  }, []);

  const scroll = (dir: "left" | "right") => {
    tabsRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const el = tabsRef.current;
    if (el) {
      const tabEl = el.querySelector(`[data-tab="${tabId}"]`);
      if (tabEl) {
        tabEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  };

  const isAdmin = role === "admin";
  const isInstructor = role === "instructor";
  const isLearner = role === "learner";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#990803] to-[#c8a84e] flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>
              {isAdmin ? "Quản lý Chứng chỉ" : isInstructor ? "Chứng chỉ Khóa học" : "Chứng chỉ của tôi"}
            </h1>
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
              {isAdmin ? "Quản lý phôi, cấu hình, cấp phát và xác thực chứng chỉ toàn Tập đoàn" :
               isInstructor ? "Theo dõi và xác nhận chứng chỉ liên quan đến khóa giảng dạy" :
               "Xem, tải và chia sẻ các chứng chỉ đào tạo của bạn"}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Scrollable */}
      <div className="relative">
        {canScrollLeft && (
          <button onClick={() => scroll("left")} className="absolute left-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-r from-card to-transparent cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
        <div ref={tabsRef} className="flex gap-1 overflow-x-auto scrollbar-hide bg-secondary/30 rounded-xl p-1 border border-border" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button key={tab.id} data-tab={tab.id} onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive ? "bg-card shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground hover:bg-card/50 border border-transparent"
                }`}
                style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400 }}>
                <Icon className="w-4 h-4" style={isActive ? { color: "#990803" } : {}} />
                {tab.label}
                {tab.badge && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1" style={{ fontSize: "10px", fontWeight: 700, background: isActive ? "#990803" : "#99080320", color: isActive ? "white" : "#990803" }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {canScrollRight && (
          <button onClick={() => scroll("right")} className="absolute right-0 top-0 bottom-0 z-10 w-8 flex items-center justify-center bg-gradient-to-l from-card to-transparent cursor-pointer">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && (isAdmin || isInstructor) && (
          <CertOverview onTabChange={handleTabChange} />
        )}
        {activeTab === "templates" && isAdmin && (
          <CertTemplateManager />
        )}
        {activeTab === "config" && isAdmin && (
          <CertIssuanceConfig />
        )}
        {activeTab === "issued" && (isAdmin || isInstructor) && (
          <CertIssuedList />
        )}
        {activeTab === "approvals" && (isAdmin || isInstructor) && (
          <CertApprovalQueue />
        )}
        {activeTab === "verification" && (
          <CertVerification />
        )}
        {activeTab === "reports" && isAdmin && (
          <CertReports />
        )}
        {activeTab === "stats" && isInstructor && (
          <CertInstructorStats />
        )}
        {activeTab === "my-certs" && isLearner && (
          <CertMyCollection />
        )}
        {activeTab === "history" && isLearner && (
          <CertHistory />
        )}
      </div>
    </div>
  );
}
