import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Eye, EyeOff, Lock, Mail, LogIn, Atom, ShieldCheck,
  Bot, Database, IdCard, ArrowRight, Sparkles, Check,
  Factory, Handshake, School as SchoolIcon, Landmark,
  Shield,
} from "lucide-react";
import {
  useAuth, demoAccounts, roleLabelsMap, tenantTypeLabelsMap,
  getDefaultRouteForUser,
} from "./AuthContext";
import type { AuthUser, TenantType } from "./AuthContext";

/* ================================================================ */
/*  LOGIN — Geleximco STEM Platform (Modern / Compact)              */
/* ================================================================ */

const PROGRAMS = [
  { code: "CT1", short: "Tích hợp nội môn",     color: "#64748b" },
  { code: "CT2", short: "Liên môn",              color: "#0891b2" },
  { code: "CT3", short: "Đổi mới sáng tạo",      color: "#7c3aed" },
  { code: "CT4", short: "Robotic · AI",           color: "#dc2626" },
  { code: "CT5", short: "Nghiên cứu khoa học",   color: "#059669" },
];

const TENANT_TABS: { type: TenantType | "system"; label: string; icon: typeof Factory; color: string }[] = [
  { type: "supplier",    label: "Nhà cung cấp",  icon: Factory,    color: "#990803" },
  { type: "distributor", label: "Đại lý",         icon: Handshake,  color: "#c8a84e" },
  { type: "school",      label: "Trường học",    icon: SchoolIcon, color: "#2563eb" },
  { type: "authority",   label: "Sở/Bộ + System",icon: Landmark,   color: "#7c3aed" },
];

function MeshBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #fefcfa 0%, #fdf6ef 40%, #f9f0e8 70%, #fefcfa 100%)" }} />
      <div className="absolute w-[600px] h-[600px] rounded-full opacity-45"
        style={{
          top: "-20%", right: "-10%",
          background: "radial-gradient(circle, rgba(153,8,3,0.16) 0%, rgba(153,8,3,0.04) 40%, transparent 70%)",
          animation: "blobMove1 22s ease-in-out infinite",
        }} />
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-40"
        style={{
          bottom: "-15%", left: "-10%",
          background: "radial-gradient(circle, rgba(200,168,78,0.18) 0%, rgba(200,168,78,0.05) 40%, transparent 70%)",
          animation: "blobMove2 26s ease-in-out infinite",
        }} />
      <div className="absolute w-[450px] h-[450px] rounded-full opacity-25"
        style={{
          top: "45%", left: "55%", transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(44,99,213,0.1) 0%, transparent 60%)",
          animation: "blobMove3 19s ease-in-out infinite",
        }} />
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
    </div>
  );
}

function DemoTile({ account, onLogin }: { account: AuthUser; onLogin: (a: AuthUser) => void }) {
  const role = roleLabelsMap[account.role];
  return (
    <button
      onClick={() => onLogin(account)}
      className="group w-full text-left p-2.5 bg-white/80 hover:bg-white border border-border rounded-lg transition-all hover:shadow-md hover:border-[#990803]/40 hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
          style={{ fontSize: "11px", fontWeight: 700, background: "linear-gradient(145deg, #990803, #7a0602)" }}
        >
          {account.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground truncate" style={{ fontSize: "12.5px", fontWeight: 600 }}>
            {account.name}
          </p>
          <p className="text-muted-foreground truncate" style={{ fontSize: "10.5px" }}>
            {account.position}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="px-1.5 py-0.5 rounded" style={{
            fontSize: "9px", fontWeight: 700,
            color: role.color, backgroundColor: role.bg,
          }}>
            {role.label}
          </span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#990803] group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </button>
  );
}

export function Login() {
  const navigate = useNavigate();
  const { login, loginAs, loginWithVneID, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TenantType | "system">("school");

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDefaultRouteForUser(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      if (res.success) { /* redirect via effect */ }
      else setError(res.error || "Đăng nhập thất bại");
      setLoading(false);
    }, 350);
  };

  // Group demo accounts by tenant type (authority tab shows authority + system_admin)
  const accountsByTab = useMemo(() => {
    const map: Record<string, AuthUser[]> = { supplier: [], distributor: [], school: [], authority: [] };
    demoAccounts.forEach((a) => {
      if (a.role === "system_admin") map.authority.push(a);
      else map[a.tenantType]?.push(a);
    });
    return map;
  }, []);

  const activeAccounts = accountsByTab[activeTab] || [];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <style>{`
        @keyframes blobMove1 { 0%,100% { transform: translate(0,0) scale(1);} 33% { transform: translate(-40px,30px) scale(1.1);} 66% { transform: translate(30px,-25px) scale(0.95);} }
        @keyframes blobMove2 { 0%,100% { transform: translate(0,0) scale(1);} 50% { transform: translate(40px,-35px) scale(1.1);} }
        @keyframes blobMove3 { 0%,100% { transform: translate(-50%,-50%) scale(1);} 50% { transform: translate(-45%,-55%) scale(1.15);} }
      `}</style>
      <MeshBackground />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* ================ LEFT — HERO ================ */}
        <div className="lg:w-1/2 xl:w-[55%] flex flex-col justify-between p-6 lg:p-10 xl:p-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: "linear-gradient(145deg, #990803, #7a0602)" }}
            >
              <Atom className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[#990803] tracking-wider leading-tight" style={{ fontSize: "17px", fontWeight: 800, letterSpacing: "0.06em" }}>
                GELEXIMCO <span style={{ color: "#c8a84e" }}>STEM</span>
              </p>
              <p className="text-muted-foreground leading-tight" style={{ fontSize: "10.5px" }}>
                Hệ sinh thái Giáo dục STEM toàn diện
              </p>
            </div>
          </div>

          {/* Hero content */}
          <div className="max-w-xl py-6 lg:py-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/60 backdrop-blur-sm border border-[#990803]/20 mb-4">
              <Sparkles className="w-3 h-3 text-[#c8a84e]" />
              <span className="text-[#990803]" style={{ fontSize: "11px", fontWeight: 600 }}>
                Nền tảng Quản trị STEM chuẩn Bộ GD&ĐT
              </span>
            </div>

            <h1 className="text-foreground mb-3" style={{ fontSize: "clamp(28px, 3.5vw, 42px)", fontWeight: 800, lineHeight: 1.15 }}>
              Kết nối toàn diện<br />
              <span style={{
                background: "linear-gradient(135deg, #990803 0%, #c8a84e 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Hệ sinh thái STEM Việt Nam
              </span>
            </h1>

            <p className="text-muted-foreground mb-6" style={{ fontSize: "14px", lineHeight: 1.6 }}>
              Nền tảng SaaS đa khách thuê kết nối <strong className="text-foreground">Nhà cung cấp · Đại lý · Trường học · Sở/Bộ GD&ĐT · Giáo viên · Học sinh</strong> trên cùng một hạ tầng —
              triển khai 5 chương trình STEM chuẩn, đồng bộ CSDL quốc gia, định danh VNeID.
            </p>

            {/* 5 programs strip */}
            <div className="mb-6">
              <p className="text-muted-foreground mb-2" style={{ fontSize: "10.5px", fontWeight: 600, letterSpacing: "0.05em" }}>
                5 CHƯƠNG TRÌNH CHUẨN CT1 → CT5
              </p>
              <div className="flex items-center gap-1.5">
                {PROGRAMS.map((p) => (
                  <div key={p.code}
                    className="flex-1 bg-white/70 backdrop-blur-sm rounded-lg border border-border p-2 hover:shadow-md transition-all"
                    title={p.short}
                  >
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-white mb-1"
                      style={{ backgroundColor: p.color, fontSize: "10px", fontWeight: 700 }}>
                      {p.code}
                    </div>
                    <p className="text-foreground line-clamp-1" style={{ fontSize: "9.5px", fontWeight: 500 }}>
                      {p.short}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                { icon: Bot, label: "AI-Buddy trợ lý giảng dạy" },
                { icon: Database, label: 'Data Lake "Đúng – Đủ – Sạch – Sống"' },
                { icon: IdCard, label: "Tích hợp VNeID + CSDL Quốc gia" },
                { icon: Shield, label: "Multi-tenant, bảo mật ISO 27001" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-foreground/80" style={{ fontSize: "12px" }}>
                  <div className="w-6 h-6 rounded-md bg-[#990803]/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-3.5 h-3.5 text-[#990803]" />
                  </div>
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust bar */}
          <div className="hidden lg:flex items-center gap-4 flex-wrap">
            {[
              { icon: ShieldCheck, label: "Tuân thủ Thông tư 38/2023" },
              { icon: Check, label: "VNeID Verified" },
              { icon: Check, label: "ISO 27001" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "10.5px" }}>
                <t.icon className="w-3 h-3 text-[#16a34a]" />
                {t.label}
              </div>
            ))}
            <span className="ml-auto text-muted-foreground" style={{ fontSize: "10.5px" }}>
              © {new Date().getFullYear()} Geleximco · v1.0 Demo
            </span>
          </div>
        </div>

        {/* ================ RIGHT — AUTH CARD ================ */}
        <div className="lg:w-1/2 xl:w-[45%] flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md space-y-4">
            {/* Main login card */}
            <div className="bg-white/95 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl p-6 lg:p-7">
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shadow-sm"
                  style={{ background: "linear-gradient(145deg, #990803, #7a0602)" }}
                >
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-foreground leading-tight" style={{ fontSize: "16px", fontWeight: 700 }}>
                    Đăng nhập nền tảng STEM
                  </h2>
                  <p className="text-muted-foreground leading-tight" style={{ fontSize: "11px" }}>
                    Dùng tài khoản tổ chức hoặc VNeID
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-foreground block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@tenant.vn"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-border rounded-lg outline-none focus:ring-2 focus:ring-[#990803]/25 focus:border-[#990803] transition-all"
                      style={{ fontSize: "13px" }}
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-foreground block mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2.5 bg-white border border-border rounded-lg outline-none focus:ring-2 focus:ring-[#990803]/25 focus:border-[#990803] transition-all"
                      style={{ fontSize: "13px" }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-muted-foreground cursor-pointer" style={{ fontSize: "11.5px" }}>
                    <input type="checkbox" className="rounded accent-[#990803]" /> Ghi nhớ thiết bị
                  </label>
                  <button type="button" className="text-[#990803] hover:underline" style={{ fontSize: "11.5px" }}>
                    Quên mật khẩu?
                  </button>
                </div>

                {error && (
                  <div className="p-2 bg-[#d4183d]/10 border border-[#d4183d]/30 rounded-lg">
                    <p className="text-[#d4183d]" style={{ fontSize: "12px" }}>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-white rounded-lg transition-all disabled:opacity-70 hover:shadow-lg"
                  style={{
                    fontSize: "13.5px", fontWeight: 600,
                    background: "linear-gradient(145deg, #990803, #7a0602)",
                    boxShadow: "0 4px 12px rgba(153,8,3,0.25)",
                  }}
                >
                  <LogIn className="w-4 h-4" />
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>

              <div className="my-4 flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>HOẶC</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                onClick={() => {
                  const res = loginWithVneID();
                  if (!res.success) setError(res.error || "Không thể kết nối VNeID");
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#16a34a]/30 bg-[#16a34a]/5 text-[#16a34a] hover:bg-[#16a34a]/10 transition-colors"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                <ShieldCheck className="w-4 h-4" />
                Đăng nhập bằng VNeID
              </button>
            </div>

            {/* Demo accounts card (compact tabs) */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-md bg-[#c8a84e]/15 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-[#c8a84e]" />
                </div>
                <div>
                  <p className="text-foreground leading-tight" style={{ fontSize: "12.5px", fontWeight: 700 }}>
                    Khám phá bằng tài khoản demo
                  </p>
                  <p className="text-muted-foreground leading-tight" style={{ fontSize: "10.5px" }}>
                    Chọn phân hệ để dùng ngay · mật khẩu{" "}
                    <code className="px-1 bg-secondary rounded font-mono">stem@123</code>
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 mb-3 overflow-x-auto">
                {TENANT_TABS.map((t) => {
                  const count = accountsByTab[t.type]?.length || 0;
                  const Icon = t.icon;
                  const active = activeTab === t.type;
                  return (
                    <button
                      key={t.type}
                      onClick={() => setActiveTab(t.type)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-all whitespace-nowrap ${
                        active ? "text-white shadow-sm" : "bg-secondary/60 text-muted-foreground hover:bg-secondary"
                      }`}
                      style={{
                        fontSize: "11px", fontWeight: active ? 600 : 500,
                        ...(active ? { backgroundColor: t.color } : {}),
                      }}
                    >
                      <Icon className="w-3 h-3" />
                      {t.label}
                      <span className="opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Accounts list */}
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {activeAccounts.map((a) => (
                  <DemoTile key={a.id} account={a} onLogin={loginAs} />
                ))}
                {activeAccounts.length === 0 && (
                  <p className="text-center text-muted-foreground py-4" style={{ fontSize: "11.5px" }}>
                    Không có tài khoản demo trong phân hệ này.
                  </p>
                )}
              </div>
            </div>

            {/* Mobile trust bar */}
            <div className="lg:hidden flex items-center justify-center gap-3 flex-wrap pt-2">
              {[
                { icon: ShieldCheck, label: "TT 38/2023" },
                { icon: Check, label: "VNeID" },
                { icon: Check, label: "ISO 27001" },
              ].map((t) => (
                <div key={t.label} className="flex items-center gap-1 text-muted-foreground" style={{ fontSize: "10.5px" }}>
                  <t.icon className="w-3 h-3 text-[#16a34a]" />
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
