import { useState, useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  LogOut, Bell, Search, Menu, X, Settings as SettingsIcon,
  HelpCircle, PanelLeftClose, PanelLeftOpen, ChevronRight, ChevronDown,
  Shield, User, Mail, Sun, Moon, Atom, GraduationCap,
} from "lucide-react";
import { mockNotifications } from "./mock-data";
import { useAuth, roleLabelsMap, tenantTypeLabelsMap } from "./AuthContext";
import { ChatbotPanel } from "./ChatbotPanel";
import { OperationsProvider } from "../lib/OperationsContext";
import { getUnreadCount } from "./notifications/mock-data";
import { GlobalSearch } from "./GlobalSearch";
import { useTheme } from "./ThemeContext";
import { toast } from "@/app/lib/toast";
import { getNavGroups } from "./stem/nav-groups";
import { useGradeLevel, GRADE_LEVEL_META, type GradeLevel } from "./GradeLevelContext";

// ── Emoji map cho student sidebar (Tiểu Học) ─────────────────────────────────
const STUDENT_NAV_EMOJI: Record<string, string> = {
  "/student/dashboard":    "🏠",
  "/student/schedule":     "📅",
  "/student/courses":      "📚",
  "/student/exercises":    "✏️",
  "/student/submit":       "📤",
  "/student/notebook":     "📓",
  "/student/forum":        "💬",
  "/student/achievements": "🏆",
  "/student/portfolio":    "🔬",
  "/shared/profile":       "👤",
  "/shared/notifications": "🔔",
  "/shared/settings":      "⚙️",
  "/shared/ai-buddy":      "🤖",
  "/shared/messages":      "✉️",
  "/shared/announcements": "📢",
};

/* ================================================================ */
/*  STUDENT SIDEBAR — chỉ dùng cho cấp Tiểu Học                     */
/*  White background, emoji icons, XP stats                         */
/* ================================================================ */
function StudentSidebar({
  collapsed, mobileOpen, onCloseMobile, user, navGroups,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  user: { name?: string; initials?: string; tenantName?: string } | null;
  navGroups: { title: string; items: { to: string; label: string; badge?: string }[] }[];
}) {
  const w = mobileOpen ? 260 : collapsed ? 72 : 220;
  const seen = new Set<string>();
  const allItems = navGroups.flatMap(g => g.items).filter(item => {
    if (seen.has(item.to)) return false;
    seen.add(item.to);
    return true;
  });

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      style={{ width: w, top: mobileOpen ? 0 : undefined, background: "#fff", borderRight: "1px solid #e5e7eb" }}
    >
      <style>{`
        .st-item { color: #6b7280; transition: background 0.15s, color 0.15s; }
        .st-item:hover { background: rgba(153,8,3,0.05) !important; color: #990803 !important; }
        .st-active { background: rgba(153,8,3,0.08) !important; color: #990803 !important; }
        .st-item:hover .st-icon { background: rgba(153,8,3,0.08) !important; }
      `}</style>

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 h-14 shrink-0" style={{ borderBottom: "1px solid #e5e7eb" }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#990803", letterSpacing: "0.04em" }}>GELEXIMCO <span style={{ color: "#c8a84e" }}>STEM</span></span>
        <button style={{ color: "#9ca3af" }} onClick={onCloseMobile} className="cursor-pointer p-1 hover:text-[#990803] transition-colors"><X className="w-5 h-5" /></button>
      </div>

      {/* XP + Streak mini stats */}
      {!collapsed && (
        <div style={{ margin: "16px 14px 4px", background: "#FFF8F8", borderRadius: 14, padding: "12px 14px", border: "1px solid rgba(153,8,3,0.1)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#990803", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, opacity: 0.65 }}>Kết quả của em</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ icon: "⚡", val: "285", label: "XP" }, { icon: "🔥", val: "7", label: "Ngày" }, { icon: "🏅", val: "18", label: "HCV" }].map(s => (
              <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 18 }}>{s.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#990803", lineHeight: 1.1 }}>{s.val}</div>
                <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, background: "rgba(153,8,3,0.08)", borderRadius: 99, height: 5, overflow: "hidden" }}>
            <div style={{ width: "71%", height: "100%", background: "linear-gradient(90deg,#990803,#c8a84e)", borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 4, textAlign: "right" }}>285 / 400 XP</div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2" style={{ scrollbarWidth: "thin" }}>
        {allItems.map(item => {
          const emoji = STUDENT_NAV_EMOJI[item.to] ?? "📌";
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl cursor-pointer mb-0.5 ${collapsed ? "justify-center py-3 px-0" : "px-3 py-2"} ${isActive ? "st-active" : "st-item"}`}
              style={{ background: "transparent" }}
            >
              {({ isActive }) => (<>
              <div className="st-icon" style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 19,
                background: isActive ? "rgba(153,8,3,0.1)" : "#f3f4f6",
                transition: "background 0.15s",
              }}>{emoji}</div>
              {!collapsed && (
                <>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 99, background: "rgba(153,8,3,0.1)", color: "#990803" }}>{item.badge}</span>
                  )}
                </>
              )}
              </>)}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer: user info */}
      <div style={{ padding: "12px 14px 14px", borderTop: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed ? "center" : "flex-start" }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, color: "#fff",
            background: "linear-gradient(135deg,#990803,#c8a84e)",
            boxShadow: "0 2px 8px rgba(153,8,3,0.25)",
          }}>{user?.initials || "?"}</div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Học sinh"}</div>
              <div style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.tenantName || ""}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ================================================================ */
/*  LAYOUT — Geleximco STEM Platform                                 */
/*  Sidebar theo 15 StemRole, header brand STEM, breadcrumb tiếng Việt */
/*  Ref: docs/STEM-Transformation-Plan.md §7                         */
/* ================================================================ */

// Breadcrumb mapping cho STEM namespaces
const breadcrumbMap: Record<string, string> = {
  supplier: "Nhà cung cấp",
  distributor: "Đại lý",
  school: "Trường học",
  authority: "Cơ quan Quản lý",
  teacher: "Giáo viên",
  student: "Học sinh",
  admin: "Quản trị Hệ thống",
  shared: "Chung",
  dashboard: "Dashboard",
  packages: "Gói phòng STEM",
  configure: "Cấu hình",
  programs: "Chương trình CT1–CT5",
  content: "Nội dung",
  authoring: "Studio Biên soạn",
  library: "Ngân hàng Nội dung",
  media: "Thư viện Media",
  exams: "Kỳ thi STEM",
  training: "Tập huấn",
  orders: "Đơn hàng",
  warranty: "Bảo hành",
  licenses: "License",
  software: "Bộ cài Phần mềm",
  schools: "Trường học",
  distributors: "Đại lý",
  revenue: "Doanh thu",
  analytics: "Phân tích",
  contracts: "Hợp đồng",
  inventory: "Kho ảo",
  commission: "Hoa hồng",
  customers: "Khách hàng",
  "customer-care": "Chăm sóc KH",
  "sales-app": "Sales App",
  purchase: "Mua sắm",
  equipment: "Thiết bị",
  teachers: "Giáo viên",
  students: "Học sinh",
  schedule: "Thời khóa biểu",
  reports: "Báo cáo",
  "equipment-compliance": "Tình trạng Thiết bị",
  procurement: "Chi phí Mua sắm",
  "data-sync": "Đồng bộ CSDL",
  catalogs: "Danh mục dùng chung",
  lessons: "Bài giảng",
  "lesson-plan-builder": "Soạn giáo án",
  resources: "Học liệu",
  classes: "Lớp phụ trách",
  grading: "Chấm điểm",
  "equipment-check": "Kiểm tra Thiết bị",
  achievements: "Thành tích",
  certificates: "Chứng chỉ",
  tenants: "Tenant",
  "tenant-onboarding": "Onboarding Tenant",
  users: "Người dùng",
  roles: "Vai trò",
  "dev-portal": "Dev Portal",
  "data-lake": "Data Lake",
  security: "Bảo mật",
  platform: "Nền tảng",
  audit: "Nhật ký",
  "system-health": "System Health",
  "cross-tenant-log": "Truy cập Chéo",
  profile: "Hồ sơ",
  settings: "Cài đặt",
  notifications: "Thông báo",
  messages: "Tin nhắn",
  announcements: "Bảng tin",
  "ai-buddy": "AI-Buddy",
  courses: "Khóa học",
  forum: "Diễn đàn",
  notebook: "Nhật ký học tập",
  portfolio: "Hồ sơ học tập",
  exercises: "Bài tập",
  submit: "Nộp bài",
  challenge: "STEM Challenge",
};

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const unreadCount = getUnreadCount();
  const location = useLocation();

  const navGroups = user ? getNavGroups(user.role) : [];
  const roleInfo = user ? roleLabelsMap[user.role] : null;
  const tenantInfo = user ? tenantTypeLabelsMap[user.tenantType] : null;

  // Student nav items (deduped)
  const studentNavItems = (() => {
    const seen = new Set<string>();
    return navGroups.flatMap(g => g.items).filter(item => {
      if (seen.has(item.to)) return false;
      seen.add(item.to);
      return true;
    });
  })();

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Breadcrumbs
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((seg, idx) => ({
    label: breadcrumbMap[seg] || seg,
    path: "/" + pathSegments.slice(0, idx + 1).join("/"),
  }));

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };
  const sidebarWidth = collapsed ? 72 : 260;

  const { theme, toggleTheme } = useTheme();
  const { level: gradeLevel, setLevel: setGradeLevel } = useGradeLevel();

  return (
    <OperationsProvider>
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* ======== FULL-WIDTH HEADER ======== */}
      <header className="h-14 shrink-0 flex items-center px-3 lg:px-4 gap-3 z-50 border-b border-border bg-card">

        {/* Sidebar toggle — hidden for students */}
        {user?.role !== "student" && (
          <button
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-[#990803] transition-colors cursor-pointer hidden lg:flex items-center justify-center"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
        )}

        {/* Mobile menu — hidden for students */}
        {user?.role !== "student" && (
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-[#990803] transition-colors cursor-pointer flex items-center justify-center" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ background: "linear-gradient(145deg, #990803, #7a0602)" }}>
            <Atom className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[#990803] tracking-wider" style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "0.08em" }}>
              GELEXIMCO <span style={{ color: "#c8a84e" }}>STEM</span>
            </span>
            <span className="text-muted-foreground hidden sm:block" style={{ fontSize: "10px" }}>
              Hệ sinh thái Giáo dục STEM
            </span>
          </div>
        </Link>

        <div className="w-px h-7 bg-border hidden lg:block mx-2" />

        {/* Student top nav — tất cả cấp học trừ Mầm Non (inline in header) */}
        {user?.role === "student" && gradeLevel !== "mamnon" && (
          <nav style={{ display: "flex", alignItems: "stretch", height: "100%" }}>
            <style>{`
              .stn-h { display:flex; align-items:center; padding:0 14px; font-size:13px; font-weight:500; color:#6b7280; border-bottom:2.5px solid transparent; white-space:nowrap; text-decoration:none; transition:color .15s,border-color .15s; cursor:pointer; }
              .stn-h:hover { color:#990803; border-bottom-color:rgba(153,8,3,0.3); background:rgba(153,8,3,0.03); }
              .stn-h-on { color:#990803 !important; border-bottom-color:#990803 !important; font-weight:700 !important; }
            `}</style>
            {studentNavItems.map(item => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `stn-h${isActive ? " stn-h-on" : ""}`}>
                {item.label}
                {item.badge && (
                  <span style={{ marginLeft: 5, fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 99, background: "#990803", color: "#fff" }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Tenant badge — non-students only */}
        {user?.role !== "student" && user && tenantInfo && (
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md border"
            style={{
              borderColor: tenantInfo.color + "40",
              backgroundColor: tenantInfo.color + "10",
              color: tenantInfo.color,
              fontSize: "11px",
              fontWeight: 600,
            }}
            title={`Tenant: ${user.tenantName}`}
          >
            <span style={{ fontSize: "10px", opacity: 0.85 }}>{tenantInfo.short}</span>
            <span className="text-foreground/80 font-normal max-w-[160px] truncate">{user.tenantName}</span>
          </div>
        )}

        {/* Search */}
        <div className="flex-1 ml-1">
          {user?.role !== "student" ? (
            <button
              onClick={() => setSearchOpen(true)}
              className="relative max-w-lg w-full flex items-center gap-2 pl-9 pr-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border transition-all text-left cursor-pointer"
              style={{ fontSize: "13px" }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground flex-1">Tìm kiếm trường, thiết bị, đơn hàng, bài giảng...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-card rounded border border-border text-muted-foreground" style={{ fontSize: "10px" }}>
                Ctrl+K
              </kbd>
            </button>
          ) : null}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Search icon — students only */}
          {user?.role === "student" && (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-[#990803] transition-colors hidden sm:flex cursor-pointer"
              title="Tìm kiếm (Ctrl+K)"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
          )}

          <div className="relative" ref={notifRef}>
            <button
              className={`relative p-2 rounded-lg transition-colors cursor-pointer ${showNotifications ? "bg-secondary text-[#990803]" : "hover:bg-secondary text-muted-foreground hover:text-[#990803]"}`}
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#e74c3c] text-white rounded-full flex items-center justify-center" style={{ fontSize: "9px", fontWeight: 700 }}>{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <span style={{ fontSize: "14px", fontWeight: 600 }}>Thông báo</span>
                  <span className="text-[#c8a84e]" style={{ fontSize: "12px", fontWeight: 500 }}>{unreadCount} mới</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {mockNotifications.map((notif) => (
                    <div key={notif.id} onClick={() => { toast.info(notif.title); setShowNotifications(false); }} className={`px-4 py-3 border-b border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors ${!notif.read ? "bg-primary/5" : ""}`}>
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.type === "deadline" ? "bg-[#e74c3c]" : notif.type === "warning" ? "bg-[#f39c12]" : notif.type === "success" ? "bg-[#27ae60]" : "bg-[#2e86de]"}`} />
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 500 }}>{notif.title}</p>
                          <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>{notif.message}</p>
                          <p className="text-muted-foreground/60 mt-1" style={{ fontSize: "11px" }}>{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-border text-center">
                  <Link to="/shared/notifications" className="text-[#c8a84e] hover:underline cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }} onClick={() => setShowNotifications(false)}>Xem tất cả thông báo</Link>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => toast.info("Trung tâm Hỗ trợ Geleximco STEM — Phím tắt: Ctrl+K để tìm kiếm")} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-[#990803] transition-colors hidden sm:flex cursor-pointer">
            <HelpCircle className="w-[18px] h-[18px]" />
          </button>

          <div className="w-px h-7 bg-border mx-1 hidden sm:block" />

          <div className="relative" ref={userMenuRef}>
            <button
              className={`flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg transition-colors cursor-pointer ${showUserMenu ? "bg-secondary" : "hover:bg-secondary"}`}
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ fontSize: "11px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}>
                {user?.initials || "?"}
              </div>
              <span className="hidden sm:block text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{user?.name?.split(" ").slice(-2).join(" ") || "Người dùng"}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-card rounded-xl shadow-xl border border-border z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-border">
                  <p style={{ fontSize: "13px", fontWeight: 500 }}>{user?.name}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {roleInfo && (
                      <span className="inline-block px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: roleInfo.color, backgroundColor: roleInfo.bg }}>{roleInfo.label}</span>
                    )}
                    {user?.vneidVerified && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 600, color: "#16a34a", backgroundColor: "#16a34a15" }}>
                        ✓ VNeID
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground/70 mt-1" style={{ fontSize: "10px" }}>{user?.tenantName}</p>
                </div>

                {/* Bộ chọn cấp học — chỉ hiện khi role là student */}
                {user?.role === "student" && (
                  <div className="px-3 py-3 border-b border-border">
                    <p className="text-muted-foreground mb-2" style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      🎓 Giao diện cấp học
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {(Object.entries(GRADE_LEVEL_META) as [GradeLevel, typeof GRADE_LEVEL_META[GradeLevel]][]).map(([key, m]) => {
                        const active = gradeLevel === key;
                        return (
                          <button
                            key={key}
                            onClick={() => { setGradeLevel(key); setShowUserMenu(false); navigate("/student/dashboard"); }}
                            style={{
                              padding: "8px 6px",
                              borderRadius: 10,
                              border: `2px solid ${active ? m.color : "var(--border)"}`,
                              background: active ? m.color : "transparent",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 2,
                              transition: "all 0.15s",
                            }}
                          >
                            <span style={{ fontSize: 18 }}>{m.emoji}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: active ? "#fff" : "var(--foreground)" }}>{m.label}</span>
                            <span style={{ fontSize: 9, color: active ? "rgba(255,255,255,0.8)" : "var(--muted-foreground)" }}>{m.age}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Link to="/shared/profile" className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-secondary text-left transition-colors" style={{ fontSize: "13px" }} onClick={() => setShowUserMenu(false)}>
                  <User className="w-4 h-4" /> Hồ sơ Cá nhân
                </Link>
                <Link to="/shared/messages" className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-secondary text-left transition-colors" style={{ fontSize: "13px" }} onClick={() => setShowUserMenu(false)}>
                  <Mail className="w-4 h-4" /> Tin nhắn
                </Link>
                <Link to="/shared/settings" className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-secondary text-left transition-colors" style={{ fontSize: "13px" }} onClick={() => setShowUserMenu(false)}>
                  <SettingsIcon className="w-4 h-4" /> Cài đặt
                </Link>
                {(user?.role === "teacher" || user?.role === "student") && (
                  <Link to="/shared/ai-buddy" className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-secondary text-left transition-colors" style={{ fontSize: "13px" }} onClick={() => setShowUserMenu(false)}>
                    <GraduationCap className="w-4 h-4" /> AI-Buddy
                  </Link>
                )}
                <div className="border-t border-border my-1" />
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-secondary text-left transition-colors"
                  style={{ fontSize: "13px" }}
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </div>
            )}
          </div>

          <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-[#990803] transition-colors hidden sm:flex cursor-pointer" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </header>

      {/* ======== BODY: SIDEBAR + CONTENT ======== */}
      <div className="flex flex-1 min-h-0">
        {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

        {/* Student sidebar đã được chuyển lên top nav — không render sidebar cho học sinh */}

        {/* Regular sidebar — non-students only */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden bg-card border-r border-border ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
          style={{
            width: mobileOpen ? 260 : sidebarWidth,
            top: mobileOpen ? 0 : undefined,
            display: user?.role === "student" ? "none" : undefined,
          }}
        >
          <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ background: "linear-gradient(145deg, #990803, #7a0602)" }}>
                <Atom className="w-4 h-4 text-white" />
              </div>
              <span className="text-[#990803] tracking-wider" style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "0.06em" }}>
                GELEXIMCO <span style={{ color: "#c8a84e" }}>STEM</span>
              </span>
            </div>
            <button className="text-muted-foreground hover:text-foreground p-1 cursor-pointer" onClick={() => setMobileOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role badge */}
          {user && roleInfo && (
            <div className={`mx-3 mt-3 mb-1 px-3 py-2 bg-secondary rounded-lg border border-border/50 ${collapsed ? "mx-2 px-0 flex justify-center" : ""}`}>
              <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
                <Shield className="w-3.5 h-3.5 text-[#990803] shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Vai trò:</span>
                    <span className="px-2 py-0.5 rounded-full truncate" style={{ fontSize: "10px", fontWeight: 600, color: roleInfo.color, backgroundColor: roleInfo.bg }}>{roleInfo.label}</span>
                  </>
                )}
              </div>
            </div>
          )}

          <nav className="flex-1 py-2 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
            {navGroups.map((group) => {
              const isGroupCollapsed = collapsedGroups[group.title] && !collapsed;
              return (
                <div key={group.title} className="mb-1">
                  {!collapsed ? (
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className="w-full flex items-center justify-between px-4 py-1.5 cursor-pointer hover:bg-secondary transition-colors"
                    >
                      <span className="text-muted-foreground uppercase tracking-wider" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em" }}>
                        {group.title}
                      </span>
                      <ChevronRight className={`w-3 h-3 text-muted-foreground/50 transition-transform ${isGroupCollapsed ? "" : "rotate-90"}`} />
                    </button>
                  ) : (
                    <div className="mx-3 my-1.5 border-t border-border/50" />
                  )}

                  {!isGroupCollapsed && (
                    <div className="px-2 space-y-0.5">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          title={collapsed ? item.label : undefined}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-lg transition-all duration-200 ${
                              collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2"
                            } ${
                              isActive
                                ? "bg-[#990803] text-white shadow-sm"
                                : "text-foreground/70 hover:bg-secondary hover:text-[#990803]"
                            }`
                          }
                          style={({ isActive }) => ({
                            fontSize: "13px",
                            fontWeight: isActive ? 600 : 400,
                            ...(isActive ? { boxShadow: "0 2px 8px rgba(153,8,3,0.2)" } : {}),
                          })}
                        >
                          <item.icon className="w-[18px] h-[18px] shrink-0" />
                          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                          {!collapsed && item.badge && (
                            <span
                              className="px-1.5 py-0.5 rounded-full bg-[#990803]/10 text-[#990803]"
                              style={{ fontSize: "10px", fontWeight: 600, lineHeight: 1.2 }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="px-2 pb-1 border-t border-border/50 pt-1">
            <NavLink
              to="/shared/settings"
              title={collapsed ? "Cài đặt" : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg transition-all duration-200 ${
                  collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2"
                } ${
                  isActive
                    ? "bg-[#990803] text-white shadow-sm"
                    : "text-foreground/70 hover:bg-secondary hover:text-[#990803]"
                }`
              }
              style={({ isActive }) => ({ fontSize: "13px", fontWeight: isActive ? 600 : 400 })}
            >
              <SettingsIcon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>Cài đặt</span>}
            </NavLink>
          </div>

          {/* Sidebar footer */}
          <div className={`p-3 border-t border-border/50 ${collapsed ? "flex justify-center" : ""}`}>
            <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-1"}`}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm shrink-0"
                style={{ fontSize: "11px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}
              >
                {user?.initials || "?"}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{user?.name || "Người dùng"}</p>
                  <p className="text-muted-foreground truncate" style={{ fontSize: "10px" }}>{user?.tenantName || ""}</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          {breadcrumbs.length > 0 && (
            <div className="px-4 lg:px-6 py-2 bg-card/50 border-b border-border/50 shrink-0">
              <nav className="flex items-center gap-1.5 flex-wrap" style={{ fontSize: "12px" }}>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">STEM Platform</Link>
                {breadcrumbs.map((crumb, idx) => (
                  <span key={crumb.path} className="flex items-center gap-1.5">
                    <span className="text-muted-foreground/40">/</span>
                    {idx === breadcrumbs.length - 1 ? (
                      <span className="text-foreground" style={{ fontWeight: 500 }}>{crumb.label}</span>
                    ) : (
                      <Link to={crumb.path} className="text-muted-foreground hover:text-foreground transition-colors">{crumb.label}</Link>
                    )}
                  </span>
                ))}
              </nav>
            </div>
          )}

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>

      <ChatbotPanel />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
    </OperationsProvider>
  );
}
