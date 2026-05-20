import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Eye, EyeOff, ShieldCheck, Atom, Sparkles, Check,
  Factory, Handshake, School as SchoolIcon, Landmark, ArrowRight,
  Users, GraduationCap,
} from "lucide-react";
import {
  useAuth, demoAccounts, roleLabelsMap,
  getDefaultRouteForUser,
} from "./AuthContext";
import type { AuthUser, TenantType } from "./AuthContext";

/* ================================================================ */
/*  CONSTANTS                                                        */
/* ================================================================ */

const TENANT_TABS: { type: TenantType | "system"; label: string; icon: typeof Factory; color: string }[] = [
  { type: "supplier",    label: "Nhà CC",  icon: Factory,    color: "#990803" },
  { type: "distributor", label: "Đại lý",  icon: Handshake,  color: "#c8a84e" },
  { type: "school",      label: "Trường",  icon: SchoolIcon, color: "#2563eb" },
  { type: "authority",   label: "Sở/Bộ",  icon: Landmark,   color: "#7c3aed" },
];

const FLOATING_STATS = [
  { icon: SchoolIcon, value: "500+",  label: "Trường học kết nối" },
  { icon: Users,      value: "50K+",  label: "Giáo viên active"   },
  { icon: GraduationCap, value: "1M+", label: "Học sinh"          },
];

const PROGRAMS = [
  { code: "CT1", color: "#64748b" },
  { code: "CT2", color: "#0891b2" },
  { code: "CT3", color: "#7c3aed" },
  { code: "CT4", color: "#dc2626" },
  { code: "CT5", color: "#059669" },
];

/* ================================================================ */
/*  DEMO TILE                                                        */
/* ================================================================ */

function DemoTile({ account, onLogin }: { account: AuthUser; onLogin: (a: AuthUser) => void }) {
  const role = roleLabelsMap[account.role];
  return (
    <button
      onClick={() => onLogin(account)}
      className="group w-full text-left p-2.5 rounded-xl transition-all hover:shadow-sm bg-gray-50 hover:bg-white border border-transparent hover:border-[#990803]/15"
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
          style={{ background: "linear-gradient(145deg, #990803, #7a0602)", fontSize: "10px", fontWeight: 700 }}
        >
          {account.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 truncate text-[12px] font-semibold">{account.name}</p>
          <p className="text-gray-400 truncate text-[10px]">{account.position}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className="px-1.5 py-0.5 rounded text-[8.5px] font-bold"
            style={{ color: role.color, backgroundColor: role.bg }}
          >
            {role.label}
          </span>
          <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#990803] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </button>
  );
}

/* ================================================================ */
/*  LOGIN                                                            */
/* ================================================================ */

export function Login() {
  const navigate = useNavigate();
  const { login, loginAs, loginWithVneID, isAuthenticated, user } = useAuth();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPwd, setShowPwd]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [activeTab, setActiveTab]   = useState<TenantType | "system">("school");
  const [showDemo, setShowDemo]     = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) navigate(getDefaultRouteForUser(user), { replace: true });
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) setError(res.error || "Đăng nhập thất bại");
      setLoading(false);
    }, 350);
  };

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
    <div
      className="min-h-screen flex items-center justify-center p-4 lg:p-8"
      style={{ background: "linear-gradient(135deg, #e8e4df 0%, #dedad4 100%)" }}
    >
      {/* ── MAIN CARD ── */}
      <div
        className="w-full bg-white flex overflow-hidden"
        style={{
          maxWidth: 960,
          borderRadius: 32,
          boxShadow: "0 24px 64px rgba(0,0,0,0.13), 0 4px 20px rgba(0,0,0,0.07)",
          minHeight: 620,
        }}
      >

        {/* ══ LEFT — brand panel (inset card) ══ */}
        <div className="hidden lg:block lg:w-[42%] shrink-0 p-4">
          <div
            className="h-full flex flex-col relative overflow-hidden"
            style={{
              borderRadius: 20,
              background: "linear-gradient(155deg, #c41006 0%, #990803 45%, #620402 100%)",
              minHeight: 560,
            }}
          >
            {/* Decorative blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute rounded-full"
                style={{ width: 380, height: 380, top: -130, right: -130,
                  background: "radial-gradient(circle, rgba(200,168,78,0.22) 0%, transparent 70%)" }} />
              <div className="absolute rounded-full"
                style={{ width: 320, height: 320, bottom: -100, left: -100,
                  background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)" }} />
              <div className="absolute inset-0"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)",
                  backgroundSize: "32px 32px", opacity: 0.07,
                }} />
            </div>

            {/* Logo */}
            <div className="relative z-10 p-6 pb-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <Atom className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-extrabold tracking-widest text-sm leading-tight">
                    GELEXIMCO <span style={{ color: "#f2d878" }}>STEM</span>
                  </p>
                  <p className="text-white/45 leading-tight" style={{ fontSize: "9.5px" }}>
                    Hệ sinh thái Giáo dục STEM toàn diện
                  </p>
                </div>
              </div>
            </div>

            {/* Headline */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit mb-4"
                style={{ background: "rgba(200,168,78,0.18)", border: "1px solid rgba(200,168,78,0.32)" }}>
                <Sparkles className="w-2.5 h-2.5" style={{ color: "#f2d878" }} />
                <span className="font-semibold" style={{ fontSize: "9.5px", color: "#f2d878" }}>
                  Chuẩn Bộ GD&amp;ĐT · Thông tư 38/2023
                </span>
              </div>

              <h2
                className="text-white font-extrabold leading-[1.2] mb-3"
                style={{ fontSize: "clamp(22px, 2.2vw, 30px)" }}
              >
                Quản trị STEM<br />
                <span style={{ color: "#f2d878" }}>toàn diện</span> cho<br />
                giáo dục Việt Nam
              </h2>
              <p className="text-white/55 leading-relaxed" style={{ fontSize: "12.5px" }}>
                Kết nối nhà cung cấp, trường học, giáo viên &amp; học sinh trên cùng một nền tảng
              </p>

              {/* Programs row */}
              <div className="flex gap-1.5 mt-6">
                {PROGRAMS.map((p) => (
                  <div key={p.code} className="flex-1 flex items-center justify-center py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="text-white font-bold" style={{ fontSize: "9px" }}>{p.code}</span>
                    <div className="w-1.5 h-1.5 rounded-full ml-1" style={{ backgroundColor: p.color }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Floating stat cards */}
            <div className="relative z-10 px-5 pb-5 space-y-2">
              {FLOATING_STATS.map((s) => (
                <div key={s.label}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,255,255,0.14)" }}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base leading-tight">{s.value}</p>
                    <p className="text-white/55" style={{ fontSize: "10.5px" }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT — auth panel ══ */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 lg:px-14 overflow-y-auto">

          {/* Logo (centered) */}
          <div className="flex flex-col items-center mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-md"
              style={{ background: "linear-gradient(145deg, #990803, #7a0602)" }}
            >
              <Atom className="w-7 h-7 text-white" />
            </div>
            <span className="font-extrabold text-[#990803] tracking-widest text-sm">
              GELEXIMCO <span style={{ color: "#c8a84e" }}>STEM</span>
            </span>
          </div>

          {/* Welcome text */}
          <div className="text-center mb-7">
            <h1 className="text-[26px] font-bold text-gray-900 mb-1">Chào mừng trở lại</h1>
            <p className="text-gray-400 text-[13.5px]">Đăng nhập vào tài khoản của bạn</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-[360px] space-y-3">
            {/* Email */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Địa chỉ Email"
              autoComplete="email"
              className="w-full px-4 py-3.5 rounded-2xl text-[13.5px] text-gray-800 placeholder-gray-400 bg-gray-100 border-2 border-transparent outline-none transition-all focus:bg-white focus:border-[#990803]/30 focus:ring-0"
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                autoComplete="current-password"
                className="w-full px-4 py-3.5 pr-12 rounded-2xl text-[13.5px] text-gray-800 placeholder-gray-400 bg-gray-100 border-2 border-transparent outline-none transition-all focus:bg-white focus:border-[#990803]/30 focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Forgot */}
            <div className="flex justify-end">
              <button type="button" className="text-[12px] text-gray-400 hover:text-[#990803] transition-colors">
                Quên mật khẩu?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl" style={{ background: "#fff1f0", border: "1px solid #fca5a5" }}>
                <p className="text-[12px] text-red-600">{error}</p>
              </div>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-white rounded-2xl text-[15px] font-bold transition-all disabled:opacity-70 hover:opacity-90 active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #b30904 0%, #990803 60%, #7a0602 100%)",
                boxShadow: "0 6px 20px rgba(153,8,3,0.30)",
              }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {/* OR divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[11px] text-gray-300 font-medium">Hoặc đăng nhập bằng</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* VNeID — styled like social login button */}
            <button
              type="button"
              onClick={() => {
                const res = loginWithVneID();
                if (!res.success) setError(res.error || "Không thể kết nối VNeID");
              }}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl text-[13.5px] font-semibold transition-all hover:shadow-md active:scale-[0.99] border"
              style={{ color: "#15803d", background: "white", borderColor: "#d1fae5" }}
            >
              <ShieldCheck className="w-4 h-4" />
              Đăng nhập bằng VNeID
            </button>

            {/* Demo accounts toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDemo((s) => !s)}
                className="w-full text-center transition-colors"
                style={{ fontSize: "12px", color: "#9ca3af" }}
              >
                Chưa có tài khoản?{" "}
                <span
                  className="font-semibold hover:underline cursor-pointer"
                  style={{ color: "#990803" }}
                >
                  Dùng thử Demo {showDemo ? "▲" : "▼"}
                </span>
              </button>

              {showDemo && (
                <div
                  className="mt-3 overflow-hidden"
                  style={{ borderRadius: 16, border: "1px solid #f0f0f0" }}
                >
                  {/* Tabs */}
                  <div className="flex" style={{ borderBottom: "1px solid #f0f0f0" }}>
                    {TENANT_TABS.map((t) => {
                      const count = accountsByTab[t.type]?.length || 0;
                      const Icon = t.icon;
                      const active = activeTab === t.type;
                      return (
                        <button
                          key={t.type}
                          type="button"
                          onClick={() => setActiveTab(t.type)}
                          className="flex-1 flex items-center justify-center gap-1 py-2.5 transition-all"
                          style={{
                            fontSize: "10px", fontWeight: active ? 600 : 500,
                            color: active ? t.color : "#9ca3af",
                            background: active ? "white" : "#fafafa",
                            borderBottom: `2px solid ${active ? t.color : "transparent"}`,
                          }}
                        >
                          <Icon className="w-2.5 h-2.5" />
                          {t.label}
                          <span className="opacity-60">({count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Account list */}
                  <div className="p-2 space-y-1 max-h-[190px] overflow-y-auto bg-white">
                    {activeAccounts.map((a) => (
                      <DemoTile key={a.id} account={a} onLogin={loginAs} />
                    ))}
                    {activeAccounts.length === 0 && (
                      <p className="text-center text-gray-400 py-3" style={{ fontSize: "11px" }}>
                        Không có tài khoản demo.
                      </p>
                    )}
                  </div>

                  {/* Password hint */}
                  <div className="px-3 py-2 text-center" style={{ background: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
                    <p style={{ fontSize: "10px", color: "#9ca3af" }}>
                      Mật khẩu:{" "}
                      <code
                        className="font-mono px-1.5 py-0.5 rounded"
                        style={{ background: "#ebebeb", color: "#555", fontSize: "10px" }}
                      >
                        stem@123
                      </code>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Footer badges */}
          <div className="flex items-center gap-3 mt-8 flex-wrap justify-center">
            {[
              { icon: ShieldCheck, label: "TT 38/2023" },
              { icon: Check,       label: "VNeID Verified" },
              { icon: Check,       label: "ISO 27001" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-1 text-gray-300" style={{ fontSize: "10px" }}>
                <t.icon className="w-2.5 h-2.5 text-green-400" />
                {t.label}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
