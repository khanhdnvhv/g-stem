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
import { getUnreadCount } from "./notifications/mock-data";
import { GlobalSearch } from "./GlobalSearch";
import { useTheme } from "./ThemeContext";
import { toast } from "sonner";
import { getNavGroups } from "./stem/nav-groups";

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

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* ======== FULL-WIDTH HEADER ======== */}
      <header className="h-14 shrink-0 flex items-center px-3 lg:px-4 gap-3 z-50 border-b border-border bg-card">
        <button
          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-[#990803] transition-colors cursor-pointer hidden lg:flex items-center justify-center"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        <button className="lg:hidden p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-[#990803] transition-colors cursor-pointer flex items-center justify-center" onClick={() => setMobileOpen(true)}>
          <Menu className="w-5 h-5" />
        </button>

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

        <div className="w-px h-7 bg-border hidden lg:block ml-1" />

        {/* Tenant badge */}
        {user && tenantInfo && (
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
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
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

        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden bg-card border-r border-border ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
          style={{ width: mobileOpen ? 260 : sidebarWidth, top: mobileOpen ? 0 : undefined }}
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
  );
}
