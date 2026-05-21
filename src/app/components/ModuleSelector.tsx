import { useNavigate } from "react-router";
import {
  ShoppingBag,
  BookOpen,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Lock,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth, type StemRole } from "./AuthContext";

/* ------------------------------------------------------------------ */
/*  Module definitions                                                  */
/* ------------------------------------------------------------------ */

interface ModuleDef {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  actors: string[];
  getRoute: (role: StemRole) => string | null;
  status: "active" | "coming-soon";
}

const MODULES: ModuleDef[] = [
  {
    id: 1,
    title: "Module 1",
    subtitle: "Thương mại B2B, Vận hành & Logistics",
    description:
      "Quản lý toàn chu trình sản phẩm STEM — từ cấu hình gói phòng học, đặt hàng, giao nhận, kho ảo đến đối soát hoa hồng và bảo hành thiết bị.",
    icon: ShoppingBag,
    color: "#c8a84e",
    bgColor: "#c8a84e18",
    actors: ["Nhà cung cấp", "Đại lý", "Trường học"],
    getRoute: (role) => {
      if (role.startsWith("supplier")) return "/supplier/dashboard";
      if (role.startsWith("distributor")) return "/distributor/dashboard";
      if (role.startsWith("school")) return "/school/dashboard";
      return null;
    },
    status: "active",
  },
  {
    id: 2,
    title: "Module 2",
    subtitle: "Đào tạo, Học tập & Khảo thí",
    description:
      "Vận hành các tiết học STEM thực tế — quản lý 5 chương trình CT1–CT5, thời khóa biểu, giảng dạy, tài liệu tập huấn và kỳ thi STEM trực tuyến.",
    icon: BookOpen,
    color: "#2563eb",
    bgColor: "#2563eb18",
    actors: ["Nhà cung cấp", "Trường học", "Giáo viên", "Học sinh"],
    getRoute: (role) => {
      if (role === "supplier_content" || role === "supplier_admin") return "/supplier/programs";
      if (role.startsWith("school")) return "/school/stem-schedule";
      if (role === "teacher") return "/teacher/dashboard";
      if (role === "student") return "/student/dashboard";
      return null;
    },
    status: "active",
  },
  {
    id: 3,
    title: "Module 3",
    subtitle: "Giám sát, Báo cáo & Liên thông dữ liệu",
    description:
      "Bức tranh tổng quan toàn ngành — giám sát thiết bị, thống kê hiệu quả giảng dạy, kết xuất báo cáo chuẩn Bộ GD&ĐT và đồng bộ CSDL quốc gia, VNeID.",
    icon: BarChart3,
    color: "#7c3aed",
    bgColor: "#7c3aed18",
    actors: ["Cơ quan quản lý", "Nhà trường", "Nhà cung cấp"],
    getRoute: (role) => {
      if (role.startsWith("authority")) return "/authority/dashboard";
      if (role === "supplier_admin") return "/supplier/analytics";
      if (role.startsWith("school")) return "/school/reports";
      return null;
    },
    status: "coming-soon",
  },
  {
    id: 4,
    title: "Module 4",
    subtitle: "Quản trị Hệ thống & Nền tảng lõi",
    description:
      "Lớp móng kỹ thuật của toàn nền tảng — multi-tenancy, phân quyền RBAC, quản lý license, bảo mật SSL/SSO, API Gateway và giám sát Audit log.",
    icon: ShieldCheck,
    color: "#d4183d",
    bgColor: "#d4183d18",
    actors: ["Quản trị viên hệ thống", "Quản trị viên Trường học"],
    getRoute: (role) => {
      if (role === "system_admin") return "/admin/dashboard";
      if (role === "school_itadmin") return "/school/licenses";
      return null;
    },
    status: "coming-soon",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function ModuleSelector() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  if (!user) return null;

  const greeting = getGreeting();
  const firstName = user.name.split(" ").slice(-1)[0];

  function handleModuleClick(mod: ModuleDef) {
    const route = mod.getRoute(user!.role);
    if (route) navigate(route);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #fdf6f0 0%, #f5f0ff 50%, #f0f4ff 100%)" }}>

      {/* ── Top Navigation ── */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #990803, #d4183d)" }}
            >
              G
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">GELEXIMCO</span>
              <span className="font-bold text-sm ml-1" style={{ color: "#990803" }}>STEM</span>
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-default">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: "#990803" }}
              >
                {user.initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-gray-800 leading-none">{user.name}</p>
                <p className="text-[10px] text-gray-500 leading-none mt-0.5">{user.tenantName}</p>
              </div>
              <ChevronDown size={13} className="text-gray-400" />
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 hover:text-destructive hover:bg-destructive/8 transition-colors"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero section ── */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8 w-full">
        <p className="text-sm text-gray-500 mb-1">{greeting}</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Xin chào, <span style={{ color: "#990803" }}>{firstName}</span>!
        </h1>
        <p className="text-gray-500 text-base">
          Chọn phân hệ bạn muốn làm việc — hệ thống sẽ tự điều hướng theo vai trò của bạn.
        </p>
      </div>

      {/* ── Module grid ── */}
      <div className="max-w-6xl mx-auto px-6 pb-12 w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MODULES.map((mod) => {
            const route = mod.getRoute(user.role);
            const accessible = route !== null;
            const Icon = mod.icon;

            return (
              <button
                key={mod.id}
                onClick={() => handleModuleClick(mod)}
                disabled={!accessible}
                className={[
                  "group relative flex flex-col text-left rounded-2xl border p-6 transition-all duration-200 overflow-hidden",
                  accessible
                    ? "cursor-pointer hover:shadow-xl hover:-translate-y-1 bg-white border-gray-200 hover:border-transparent"
                    : "cursor-default bg-white/50 border-gray-200/60",
                ].join(" ")}
                style={
                  accessible
                    ? {
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      }
                    : undefined
                }
              >
                {/* Gradient overlay on hover */}
                {accessible && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${mod.bgColor}, transparent 60%)`,
                    }}
                  />
                )}

                {/* Colored left accent bar */}
                <div
                  className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full"
                  style={{
                    backgroundColor: accessible ? mod.color : "#d1d5db",
                  }}
                />

                {/* Top row */}
                <div className="flex items-start justify-between mb-5 pl-4 relative">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: accessible ? mod.bgColor : "#f3f4f6",
                    }}
                  >
                    <Icon
                      size={22}
                      style={{ color: accessible ? mod.color : "#9ca3af" }}
                    />
                  </div>

                  {mod.status === "coming-soon" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                      <Lock size={10} />
                      Sắp ra mắt
                    </span>
                  ) : accessible ? (
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: mod.bgColor, color: mod.color }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: mod.color }}
                      />
                      Hoạt động
                    </span>
                  ) : null}
                </div>

                {/* Text */}
                <div className="pl-4 flex-1 relative">
                  <p
                    className="text-[11px] font-bold tracking-widest uppercase mb-1.5"
                    style={{ color: accessible ? mod.color : "#9ca3af" }}
                  >
                    {mod.title}
                  </p>
                  <h3
                    className={[
                      "text-[17px] font-bold leading-snug mb-3",
                      accessible ? "text-gray-900" : "text-gray-400",
                    ].join(" ")}
                  >
                    {mod.subtitle}
                  </h3>
                  <p
                    className={[
                      "text-sm leading-relaxed mb-4",
                      accessible ? "text-gray-500" : "text-gray-400",
                    ].join(" ")}
                  >
                    {mod.description}
                  </p>

                  {/* Actor chips */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {mod.actors.map((actor) => (
                      <span
                        key={actor}
                        className={[
                          "text-[11px] px-2 py-0.5 rounded-full border",
                          accessible
                            ? "bg-gray-50 border-gray-200 text-gray-600"
                            : "bg-gray-50 border-gray-100 text-gray-400",
                        ].join(" ")}
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA row */}
                <div className="pl-4 relative">
                  {accessible ? (
                    <div
                      className="flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group-hover:gap-2.5"
                      style={{ color: mod.color }}
                    >
                      Vào module
                      <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Lock size={12} />
                      Không có quyền truy cập
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-10 flex items-center justify-center gap-4 text-[11px] text-gray-400">
          <span>Geleximco STEM · v1.0 Demo</span>
          <span className="w-px h-3 bg-gray-300" />
          <span>Tuân thủ Thông tư 38/2023</span>
          <span className="w-px h-3 bg-gray-300" />
          <span>VNeID Verified</span>
          <span className="w-px h-3 bg-gray-300" />
          <span>ISO 27001</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng ☀️";
  if (h < 18) return "Chào buổi chiều 🌤️";
  return "Chào buổi tối 🌙";
}
