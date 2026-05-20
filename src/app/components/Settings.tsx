import { useAuth, roleLabelsMap } from "./AuthContext";
import { useState } from "react";
import {
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Save,
  Camera,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { toast } from "@/app/lib/toast";
import { useTheme } from "./ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";

const tabs = [
  { id: "profile", label: "Hồ sơ cá nhân", icon: User },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "security", label: "Bảo mật", icon: Shield },
  { id: "preferences", label: "Tùy chọn", icon: Palette },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSave = () => {
    setSaved(true);
    toast.success("Đã lưu thay đổi thành công!");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground">Cài đặt</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "14px" }}>
          Quản lý thông tin cá nhân và tùy chọn hệ thống
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                activeTab === tab.id
                  ? "bg-[#990803]/10 text-[#990803]"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
              style={{ fontSize: "14px", fontWeight: activeTab === tab.id ? 500 : 400 }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h3 className="text-foreground">Hồ sơ Cá nhân</h3>

              {/* Avatar Section */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#990803] to-[#b82020] text-white flex items-center justify-center" style={{ fontSize: "24px", fontWeight: 700 }}>
                    {user?.initials || "?"}
                  </div>
                  <button onClick={() => toast.info("Tính năng thay đổi ảnh đại diện đang phát triển. Vui lòng liên hệ IT để cập nhật.")} className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#c8a84e] rounded-full flex items-center justify-center text-white shadow-md hover:bg-[#b89a40] transition-colors cursor-pointer">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <p style={{ fontSize: "16px", fontWeight: 600 }}>{user?.name || "Người dùng"}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "13px" }}>{user?.position || ""}</p>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>
                    {user?.department} • {user?.subsidiary}
                    {user?.role && roleLabelsMap[user.role] && (
                      <span className="ml-2 px-2 py-0.5 rounded-full" style={{ fontSize: "10px", fontWeight: 600, color: roleLabelsMap[user.role].color, backgroundColor: roleLabelsMap[user.role].bg }}>
                        {roleLabelsMap[user.role].label}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "13px" }}>Họ và tên</label>
                  <input type="text" defaultValue={user?.name || ""} className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none" style={{ fontSize: "14px" }} />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "13px" }}><Mail className="w-3.5 h-3.5 inline mr-1" />Email</label>
                  <input type="email" defaultValue={user?.email || ""} className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none" style={{ fontSize: "14px" }} />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "13px" }}><Phone className="w-3.5 h-3.5 inline mr-1" />Số điện thoại</label>
                  <input type="tel" defaultValue="0912 345 678" className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none" style={{ fontSize: "14px" }} />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "13px" }}><Briefcase className="w-3.5 h-3.5 inline mr-1" />Chức vụ</label>
                  <input type="text" defaultValue={user?.position || ""} className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none" style={{ fontSize: "14px" }} readOnly />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "13px" }}><Building2 className="w-3.5 h-3.5 inline mr-1" />Phòng ban</label>
                  <input type="text" defaultValue={user?.department || ""} className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none" style={{ fontSize: "14px" }} readOnly />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "13px" }}><Globe className="w-3.5 h-3.5 inline mr-1" />Công ty</label>
                  <input type="text" defaultValue={user?.subsidiary || ""} className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none" style={{ fontSize: "14px" }} readOnly />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "13px" }}>Giới thiệu bản thân</label>
                <textarea
                  defaultValue="Giám đốc Đào tạo tại Tập đoàn Geleximco, phụ trách triển khai và vận hành hệ thống LMS cho toàn tập đoàn. Kinh nghiệm 15+ năm trong lĩnh vực đào tạo doanh nghiệp."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                  style={{ fontSize: "14px" }}
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors"
                  style={{ fontSize: "14px" }}
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? "Đã lưu!" : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-5">
              <h3 className="text-foreground">Cài đặt Thông báo</h3>
              <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
                Chọn loại thông báo bạn muốn nhận
              </p>

              {[
                { label: "Khóa học mới", desc: "Thông báo khi có khóa học mới phù hợp", defaultChecked: true },
                { label: "Deadline nhắc nhở", desc: "Nhắc nhở trước khi deadline khóa học", defaultChecked: true },
                { label: "Chứng chỉ hết hạn", desc: "Cảnh báo chứng chỉ sắp hết hạn", defaultChecked: true },
                { label: "Báo cáo tuần", desc: "Nhận báo cáo tổng hợp hàng tuần qua email", defaultChecked: false },
                { label: "Cập nhật hệ thống", desc: "Thông báo về tính năng mới và bảo trì", defaultChecked: false },
                { label: "Thành tích", desc: "Thông báo khi đạt thành tích học tập mới", defaultChecked: true },
              ].map((item) => (
                <div key={item.label} className="flex items-start justify-between py-3 border-b border-border/50 last:border-0">
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 500 }}>{item.label}</p>
                    <p className="text-muted-foreground" style={{ fontSize: "12px" }}>{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input type="checkbox" className="sr-only peer" defaultChecked={item.defaultChecked} />
                    <div className="w-10 h-5 bg-secondary rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:shadow-sm after:transition-all peer-checked:bg-[#990803]"></div>
                  </label>
                </div>
              ))}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors"
                  style={{ fontSize: "14px" }}
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? "Đã lưu!" : "Lưu cài đặt"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h3 className="text-foreground">Bảo mật Tài khoản</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "13px" }}>Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none pr-10"
                      style={{ fontSize: "14px" }}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "13px" }}>Mật khẩu mới</label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    style={{ fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "13px" }}>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-3 py-2.5 bg-input-background rounded-lg border-0 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    style={{ fontSize: "14px" }}
                  />
                </div>
              </div>

              <div className="p-4 bg-secondary/50 rounded-lg">
                <p style={{ fontSize: "13px", fontWeight: 500 }}>Xác thực 2 yếu tố (2FA)</p>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>
                  Bảo vệ tài khoản bằng xác thực hai bước qua ứng dụng hoặc SMS
                </p>
                <button className="mt-3 px-4 py-2 bg-[#c8a84e] text-[#3a1200] rounded-lg hover:bg-[#b89a40] transition-colors cursor-pointer" style={{ fontSize: "13px", fontWeight: 500 }}
                  onClick={() => toast.success("Đã kích hoạt xác thực 2 yếu tố (2FA)! Vui lòng quét mã QR trên ứng dụng Authenticator.")}>
                  Kích hoạt 2FA
                </button>
              </div>

              <div className="p-4 bg-secondary/50 rounded-lg">
                <p style={{ fontSize: "13px", fontWeight: 500 }}>Phiên đăng nhập</p>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>
                  Quản lý các thiết bị đang đăng nhập vào tài khoản
                </p>
                <div className="mt-3 space-y-2">
                  {[
                    { device: "Chrome - Windows 11", location: "Hà Nội, VN", time: "Hiện tại", active: true },
                    { device: "Safari - iPhone 15", location: "Hà Nội, VN", time: "2 giờ trước", active: false },
                  ].map((session) => (
                    <div key={session.device} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border/50">
                      <div>
                        <p className="flex items-center gap-2" style={{ fontSize: "13px", fontWeight: 500 }}>
                          {session.device}
                          {session.active && (
                            <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded" style={{ fontSize: "10px", fontWeight: 500 }}>Hiện tại</span>
                          )}
                        </p>
                        <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{session.location} • {session.time}</p>
                      </div>
                      {!session.active && (
                        <button className="text-red-500 hover:text-red-600 cursor-pointer" style={{ fontSize: "12px" }}
                          onClick={() => toast.success(`Đã đăng xuất phiên "${session.device}"`)}>Đăng xuất</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors"
                  style={{ fontSize: "14px" }}
                >
                  {saved ? <Check className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  {saved ? "Đã cập nhật!" : "Đổi mật khẩu"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h3 className="text-foreground">Tùy chọn Hiển thị</h3>

              {/* Dark Mode Toggle */}
              <div>
                <label className="block text-muted-foreground mb-2" style={{ fontSize: "13px" }}>Giao diện</label>
                <div className="flex gap-3">
                  {([
                    { value: "light" as const, label: "Sáng", icon: Sun, desc: "Giao diện sáng mặc định" },
                    { value: "dark" as const, label: "Tối", icon: Moon, desc: "Giao diện tối, giảm mỏi mắt" },
                  ]).map((opt) => (
                    <button key={opt.value}
                      onClick={() => { setTheme(opt.value); toast.success(`Đã chuyển sang giao diện ${opt.label}`); }}
                      className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        theme === opt.value
                          ? "border-[#990803] bg-[#990803]/5"
                          : "border-border hover:border-[#990803]/30"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        theme === opt.value ? "bg-[#990803] text-white" : "bg-secondary text-muted-foreground"
                      }`}>
                        <opt.icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p style={{ fontSize: "14px", fontWeight: 500 }}>{opt.label}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "13px" }}>Ngôn ngữ</label>
                <select
                  defaultValue="vi"
                  className="w-full max-w-xs px-3 py-2.5 bg-input-background rounded-lg border-0"
                  style={{ fontSize: "14px" }}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "13px" }}>Múi giờ</label>
                <select
                  defaultValue="asia-hcm"
                  className="w-full max-w-xs px-3 py-2.5 bg-input-background rounded-lg border-0"
                  style={{ fontSize: "14px" }}
                >
                  <option value="asia-hcm">UTC+7 (Hà Nội, TP.HCM)</option>
                  <option value="asia-tokyo">UTC+9 (Tokyo)</option>
                  <option value="utc">UTC+0 (London)</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "13px" }}>Trang mặc định khi đăng nhập</label>
                <select
                  defaultValue="/"
                  className="w-full max-w-xs px-3 py-2.5 bg-input-background rounded-lg border-0"
                  style={{ fontSize: "14px" }}
                >
                  <option value="/">Tổng quan</option>
                  <option value="/my-learning">Học tập của tôi</option>
                  <option value="/courses">Danh mục khóa học</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "13px" }}>Số mục hiển thị trên mỗi trang</label>
                <select
                  defaultValue="12"
                  className="w-full max-w-xs px-3 py-2.5 bg-input-background rounded-lg border-0"
                  style={{ fontSize: "14px" }}
                >
                  <option value="8">8</option>
                  <option value="12">12</option>
                  <option value="24">24</option>
                  <option value="48">48</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors"
                  style={{ fontSize: "14px" }}
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? "Đã lưu!" : "Lưu tùy chọn"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}