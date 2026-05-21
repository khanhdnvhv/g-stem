import { useState, useRef } from "react";
import { Sun, Moon, Bell, Shield, Sliders, User, Mail, Phone, Briefcase, Building2, MapPin, Eye, EyeOff, Camera, Save, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./authority-ui";

const TABS = [
  { key: "profile",       label: "Hồ sơ cá nhân", icon: User },
  { key: "notifications", label: "Thông báo",      icon: Bell },
  { key: "security",      label: "Bảo mật",        icon: Shield },
  { key: "preferences",   label: "Tùy chọn",       icon: Sliders },
] as const;
type Tab = typeof TABS[number]["key"];

export function AuthoritySettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);

  /* profile form */
  const [form, setForm] = useState({
    name:     user.name,
    email:    user.email,
    phone:    "",
    position: user.position,
    unit:     user.tenantName,
    province: user.province ?? "",
    bio:      "",
  });

  /* theme */
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const setTheme = (dark: boolean) => {
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  /* notifications */
  const [notifs, setNotifs] = useState({
    new_course:  true,
    deadline:    true,
    certificate: true,
    weekly:      false,
    system:      false,
    achievement: true,
  });
  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));

  /* password */
  const [showCurrent, setShowCurrent] = useState(false);
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

  /* avatar upload */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarSrc(url);
  };

  const InputField = ({
    label, icon: Icon, value, onChange, readOnly = false, placeholder = "", type = "text",
  }: {
    label: string; icon: React.ElementType; value: string;
    onChange?: (v: string) => void; readOnly?: boolean; placeholder?: string; type?: string;
  }) => (
    <div>
      <label className="flex items-center gap-1.5 text-muted-foreground mb-1.5"
        style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-3 py-2.5 rounded-lg border border-border outline-none transition-colors ${
          readOnly
            ? "bg-secondary/60 text-muted-foreground cursor-not-allowed"
            : "bg-background focus:border-[#990803] focus:ring-1 focus:ring-[#990803]/20"
        }`}
        style={{ fontSize: "13px" }}
      />
    </div>
  );

  return (
    <div className="space-y-0">
      {/* Page title */}
      <div className="mb-4">
        <h1 style={{ fontSize: "22px", fontWeight: 700 }}>Cài đặt</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
          Quản lý thông tin cá nhân và tuỳ chọn hệ thống
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-border mb-5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex items-center gap-2 px-5 py-3 transition-all cursor-pointer relative"
            style={{
              fontSize: "13px",
              fontWeight: activeTab === key ? 600 : 400,
              color: activeTab === key ? "#990803" : undefined,
            }}
          >
            <Icon className="w-4 h-4" />
            {label}
            {activeTab === key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ background: "#990803" }} />
            )}
          </button>
        ))}
      </div>

      {/* ── Hồ sơ cá nhân ── */}
      {activeTab === "profile" && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          {/* Avatar upload */}
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: "linear-gradient(145deg, #990803, #7a0602)" }}>
                {avatarSrc
                  ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  : user.initials}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: "#990803" }}
                title="Thay đổi ảnh"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p style={{ fontSize: "15px", fontWeight: 600 }}>{user.name}</p>
              <p className="text-muted-foreground" style={{ fontSize: "13px" }}>{user.position}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors cursor-pointer"
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                Tải ảnh lên
              </button>
            </div>
          </div>

          <div>
            <p style={{ fontSize: "14px", fontWeight: 600 }} className="mb-1">Thông tin cá nhân</p>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Cập nhật thông tin hiển thị của bạn</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="HỌ VÀ TÊN"        icon={User}      value={form.name}     onChange={(v) => setForm((p) => ({ ...p, name: v }))}     placeholder="Nhập họ và tên" />
            <InputField label="EMAIL"             icon={Mail}      value={form.email}    readOnly  placeholder="" />
            <InputField label="SỐ ĐIỆN THOẠI"    icon={Phone}     value={form.phone}    onChange={(v) => setForm((p) => ({ ...p, phone: v }))}    placeholder="Nhập số điện thoại" />
            <InputField label="CHỨC VỤ"           icon={Briefcase} value={form.position} readOnly  placeholder="" />
            <InputField label="ĐƠN VỊ CÔNG TÁC"  icon={Building2} value={form.unit}     readOnly  placeholder="" />
            <InputField label="TỈNH / THÀNH PHỐ" icon={MapPin}    value={form.province} readOnly  placeholder="" />
          </div>

          <div>
            <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>
              GIỚI THIỆU BẢN THÂN
            </label>
            <textarea
              rows={3}
              value={form.bio}
              placeholder="Viết vài dòng giới thiệu về bản thân..."
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background outline-none resize-none transition-colors focus:border-[#990803] focus:ring-1 focus:ring-[#990803]/20"
              style={{ fontSize: "13px" }}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <p className="text-muted-foreground/70" style={{ fontSize: "11px" }}>
              Trường màu xám được quản lý bởi hệ thống
            </p>
            <button
              onClick={() => toast.success("Đã lưu thông tin cá nhân")}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-white transition-opacity hover:opacity-90 cursor-pointer"
              style={{ fontSize: "13px", fontWeight: 600, background: "linear-gradient(135deg, #990803, #7a0602)" }}
            >
              <Save className="w-4 h-4" /> Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* ── Thông báo ── */}
      {activeTab === "notifications" && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-1">
          <div className="mb-4">
            <p style={{ fontSize: "15px", fontWeight: 600 }}>Cài đặt Thông báo</p>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Chọn loại thông báo bạn muốn nhận</p>
          </div>

          {([
            { key: "new_course",  label: "Khóa học mới",      desc: "Thông báo khi có khóa học mới phù hợp" },
            { key: "deadline",    label: "Deadline nhắc nhở",  desc: "Nhắc nhở trước khi deadline khóa học" },
            { key: "certificate", label: "Chứng chỉ hết hạn",  desc: "Cảnh báo chứng chỉ sắp hết hạn" },
            { key: "weekly",      label: "Báo cáo tuần",       desc: "Nhận báo cáo tổng hợp hàng tuần qua email" },
            { key: "system",      label: "Cập nhật hệ thống",  desc: "Thông báo về tính năng mới và bảo trì" },
            { key: "achievement", label: "Thành tích",         desc: "Thông báo khi đạt thành tích học tập mới" },
          ] as const).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3.5 border-b border-border/40 last:border-0">
              <div>
                <p style={{ fontSize: "13px", fontWeight: 500 }}>{label}</p>
                <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(key)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ml-8 ${notifs[key] ? "bg-[#990803]" : "bg-border"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifs[key] ? "translate-x-5" : ""}`} />
              </button>
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <button
              onClick={() => toast.success("Đã lưu cài đặt thông báo")}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-white transition-opacity hover:opacity-90 cursor-pointer"
              style={{ fontSize: "13px", fontWeight: 600, background: "linear-gradient(135deg, #990803, #7a0602)" }}
            >
              <Save className="w-4 h-4" /> Lưu cài đặt
            </button>
          </div>
        </div>
      )}

      {/* ── Bảo mật ── */}
      {activeTab === "security" && (
        <div className="space-y-4">
          {/* Password change */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="mb-1">
              <p style={{ fontSize: "15px", fontWeight: 600 }}>Bảo mật Tài khoản</p>
              <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Thay đổi mật khẩu và quản lý phiên đăng nhập</p>
            </div>

            <div>
              <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>
                MẬT KHẨU HIỆN TẠI
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={pwd.current}
                  placeholder="Nhập mật khẩu hiện tại"
                  onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-border bg-background outline-none transition-colors focus:border-[#990803] focus:ring-1 focus:ring-[#990803]/20"
                  style={{ fontSize: "13px" }}
                />
                <button
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>
                  MẬT KHẨU MỚI
                </label>
                <input
                  type="password"
                  value={pwd.next}
                  placeholder="Nhập mật khẩu mới"
                  onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background outline-none transition-colors focus:border-[#990803] focus:ring-1 focus:ring-[#990803]/20"
                  style={{ fontSize: "13px" }}
                />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>
                  XÁC NHẬN MẬT KHẨU
                </label>
                <input
                  type="password"
                  value={pwd.confirm}
                  placeholder="Nhập lại mật khẩu mới"
                  onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background outline-none transition-colors focus:border-[#990803] focus:ring-1 focus:ring-[#990803]/20"
                  style={{ fontSize: "13px" }}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => toast.info("Chức năng đổi mật khẩu không khả dụng trong chế độ demo")}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-white transition-opacity hover:opacity-90 cursor-pointer"
                style={{ fontSize: "13px", fontWeight: 600, background: "linear-gradient(135deg, #990803, #7a0602)" }}
              >
                <Shield className="w-4 h-4" /> Đổi mật khẩu
              </button>
            </div>
          </div>

          {/* 2FA */}
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600 }}>Xác thực 2 yếu tố (2FA)</p>
                <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Bảo vệ tài khoản bằng xác thực hai bước</p>
              </div>
              <button
                onClick={() => toast.info("Chức năng 2FA không khả dụng trong chế độ demo")}
                className="px-4 py-1.5 rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity"
                style={{ fontSize: "12px", fontWeight: 600, background: "#c8a84e" }}
              >
                Kích hoạt 2FA
              </button>
            </div>
          </div>

          {/* Sessions */}
          <div className="bg-card rounded-xl border border-border p-5">
            <p style={{ fontSize: "14px", fontWeight: 600 }} className="mb-1">Phiên đăng nhập</p>
            <p className="text-muted-foreground mb-4" style={{ fontSize: "12px" }}>Quản lý các thiết bị đang đăng nhập</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500 }}>
                    Chrome — Windows 11
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs"
                      style={{ background: "#16a34a15", color: "#16a34a", fontWeight: 600 }}>
                      Hiện tại
                    </span>
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Hà Nội, VN · Hiện tại</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500 }}>Safari — iPhone 15</p>
                  <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Hà Nội, VN · 2 giờ trước</p>
                </div>
                <button
                  onClick={() => toast.info("Đã đăng xuất phiên Safari")}
                  className="text-[#dc2626] hover:underline cursor-pointer"
                  style={{ fontSize: "12px", fontWeight: 500 }}
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tùy chọn ── */}
      {activeTab === "preferences" && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div>
            <p style={{ fontSize: "15px", fontWeight: 600 }}>Tuỳ chọn Hiển thị</p>
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Cá nhân hoá giao diện và trải nghiệm</p>
          </div>

          {/* Theme cards */}
          <div>
            <label className="block text-muted-foreground mb-3" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>
              GIAO DIỆN
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme(false)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                  !isDark ? "border-[#990803] bg-[#990803]/5" : "border-border hover:border-border/80 hover:bg-secondary/50"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${!isDark ? "bg-[#990803]/10" : "bg-secondary"}`}>
                  <Sun className="w-5 h-5" style={{ color: !isDark ? "#990803" : undefined }} />
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: !isDark ? "#990803" : undefined }}>Sáng</p>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Giao diện sáng mặc định</p>
                </div>
              </button>
              <button
                onClick={() => setTheme(true)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                  isDark ? "border-[#990803] bg-[#990803]/5" : "border-border hover:border-border/80 hover:bg-secondary/50"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? "bg-[#990803]/10" : "bg-secondary"}`}>
                  <Moon className="w-5 h-5" style={{ color: isDark ? "#990803" : undefined }} />
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#990803" : undefined }}>Tối</p>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Giao diện tối, giảm mỏi mắt</p>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "NGÔN NGỮ",                    options: ["Tiếng Việt", "English"],        defaultValue: "Tiếng Việt" },
              { label: "MÚI GIỜ",                     options: ["UTC+7 (Hà Nội, TP.HCM)"],      defaultValue: "UTC+7 (Hà Nội, TP.HCM)" },
              { label: "TRANG MẶC ĐỊNH KHI ĐĂNG NHẬP", options: ["Tổng quan", "Dashboard"],      defaultValue: "Tổng quan" },
              { label: "SỐ MỤC MỖI TRANG",             options: ["12", "24", "48"],              defaultValue: "12" },
            ].map(({ label, options, defaultValue }) => (
              <div key={label}>
                <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.06em" }}>
                  {label}
                </label>
                <select
                  defaultValue={defaultValue}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background outline-none transition-colors focus:border-[#990803] cursor-pointer"
                  style={{ fontSize: "13px" }}
                >
                  {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-border">
            <button
              onClick={() => toast.success("Đã lưu tuỳ chọn")}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-white transition-opacity hover:opacity-90 cursor-pointer"
              style={{ fontSize: "13px", fontWeight: 600, background: "linear-gradient(135deg, #990803, #7a0602)" }}
            >
              <Monitor className="w-4 h-4" /> Lưu tùy chọn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
