import { useState, type FormEvent } from "react";
import {
  Settings2, Bell, Link2, Shield, Save, Building2, Mail, Phone,
  Globe, ChevronRight, CheckCircle2, AlertTriangle, Eye, EyeOff, Users,
} from "lucide-react";
import { schoolProfileData } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { toast } from "@/app/lib/toast";
import { cn } from "../ui/utils";
import type { ElementType } from "react";

/* ================================================================ */
/*  SCHOOL SETTINGS — Cài đặt & cấu hình trường học                 */
/* ================================================================ */

type Section = "profile" | "notifications" | "integrations" | "security";

const SETTINGS_SECTIONS: Array<{ id: Section; label: string; icon: ElementType }> = [
  { id: "profile",       label: "Thông tin trường",         icon: Building2 },
  { id: "notifications", label: "Thông báo & Cảnh báo",     icon: Bell },
  { id: "integrations",  label: "Tích hợp hệ thống",        icon: Link2 },
  { id: "security",      label: "Bảo mật & Quyền truy cập", icon: Shield },
];

const NOTIF_ITEMS = [
  { key: "weekly_report",       label: "Báo cáo tuần",                      desc: "Nhận tổng hợp hoạt động STEM hàng tuần" },
  { key: "license_expiry",      label: "Cảnh báo hết hạn License",           desc: "30 ngày trước khi license hết hạn" },
  { key: "equipment_alert",     label: "Cảnh báo thiết bị hỏng",            desc: "Khi thiết bị phòng STEM được báo hỏng" },
  { key: "warranty_update",     label: "Cập nhật bảo hành",                  desc: "Khi trạng thái ticket bảo hành thay đổi" },
  { key: "stem_news",           label: "Tin tức STEM",                        desc: "Thông tin sự kiện, hội thảo và học liệu mới" },
  { key: "training_reminder",   label: "Nhắc nhở tập huấn",                  desc: "Khi GV chưa hoàn thành tập huấn theo yêu cầu" },
];

const LOGIN_HISTORY = [
  { time: "18/05/2026 08:12", device: "Chrome / Windows 11", ip: "203.113.45.22", ok: true },
  { time: "17/05/2026 14:35", device: "Safari / iPhone 15",  ip: "171.252.8.90",  ok: true },
  { time: "16/05/2026 09:01", device: "Chrome / Windows 11", ip: "203.113.45.22", ok: true },
  { time: "15/05/2026 17:48", device: "Firefox / macOS",     ip: "118.70.12.55",  ok: false },
  { time: "14/05/2026 08:30", device: "Chrome / Windows 11", ip: "203.113.45.22", ok: true },
];

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40",
        value ? "bg-primary" : "bg-border"
      )}
      aria-checked={value}
      role="switch"
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform",
          value ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

function FormField({
  label, id, type = "text", value, onChange, required = false,
}: {
  label: string; id: string; type?: string; value: string;
  onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground block mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
      />
    </div>
  );
}

export function SchoolSettings() {
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [saved, setSaved] = useState(false);

  // Profile form state
  const [schoolName, setSchoolName]         = useState(schoolProfileData.officialName);
  const [principalName, setPrincipalName]   = useState(schoolProfileData.principalName);
  const [principalEmail, setPrincipalEmail] = useState(schoolProfileData.principalEmail);
  const [principalPhone, setPrincipalPhone] = useState(schoolProfileData.principalPhone);
  const [address, setAddress]               = useState(schoolProfileData.address);
  const [website, setWebsite]               = useState("https://thcs-nguyendu.edu.vn");

  // Notification toggles
  const [notif, setNotif] = useState<Record<string, boolean>>({
    weekly_report:     true,
    license_expiry:    true,
    equipment_alert:   true,
    warranty_update:   true,
    stem_news:         true,
    training_reminder: true,
  });

  // Integrations
  const [lms,          setLms]         = useState(false);
  const [sms,          setSms]         = useState(true);
  const [emailDigest,  setEmailDigest] = useState(true);

  // Security
  const [twoFactor,       setTwoFactor]      = useState(false);
  const [sessionTimeout,  setSessionTimeout] = useState("8h");

  function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    const tenantId = user?.tenantType === "school" ? user.tenantId : "";
    try {
      localStorage.setItem(`gstem_school_profile_${tenantId}`, JSON.stringify({
        officialName: schoolName,
        principalName,
        principalEmail,
        principalPhone,
        address,
        website,
      }));
    } catch { /* ignore quota errors */ }
    setSaved(true);
    toast.success("Đã lưu thông tin trường");
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Settings2}
        title="Cài đặt Trường"
        subtitle="Quản lý cấu hình và tùy chỉnh cho trường học."
        accentColor="#990803"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        {/* Sidebar nav */}
        <nav className="bg-card border border-border rounded-xl p-2 space-y-0.5 lg:col-span-1">
          {SETTINGS_SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  activeSection === s.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {s.label}
                {activeSection !== s.id && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">

          {/* ── PROFILE ── */}
          {activeSection === "profile" && (
            <form onSubmit={handleProfileSubmit} className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Thông tin trường
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FormField label="Tên trường" id="schoolName" value={schoolName} onChange={setSchoolName} required />
                </div>
                <FormField label="Tên hiệu trưởng" id="principalName" value={principalName} onChange={setPrincipalName} required />
                <FormField label="Email hiệu trưởng" id="principalEmail" type="email" value={principalEmail} onChange={setPrincipalEmail} required />
                <FormField label="SĐT hiệu trưởng" id="principalPhone" type="tel" value={principalPhone} onChange={setPrincipalPhone} />
                <FormField label="Website" id="website" type="url" value={website} onChange={setWebsite} />
                <div className="sm:col-span-2">
                  <FormField label="Địa chỉ" id="address" value={address} onChange={setAddress} required />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Trường: <strong>{schoolProfileData.moetCode}</strong> · Tỉnh: {schoolProfileData.province}
                </p>
                <button
                  type="submit"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    saved
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? "Đã lưu!" : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeSection === "notifications" && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Thông báo & Cảnh báo
              </h3>

              <div className="divide-y divide-border">
                {NOTIF_ITEMS.map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3.5 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                      value={notif[item.key]}
                      onChange={() => setNotif((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  onClick={() => toast.success("Đã lưu cài đặt thông báo")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Lưu cài đặt
                </button>
              </div>
            </div>
          )}

          {/* ── INTEGRATIONS ── */}
          {activeSection === "integrations" && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                Tích hợp hệ thống
              </h3>

              <div className="space-y-3">
                {/* LMS */}
                <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Hệ thống LMS trường</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Kết nối với hệ thống quản lý học tập hiện có của trường
                    </p>
                  </div>
                  <Toggle value={lms} onChange={() => setLms((v) => !v)} />
                </div>

                {/* SMS */}
                <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Gửi SMS thông báo</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Gửi thông báo qua SMS đến phụ huynh và giáo viên
                    </p>
                  </div>
                  <Toggle value={sms} onChange={() => setSms((v) => !v)} />
                </div>

                {/* Email digest */}
                <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Email tổng hợp hàng ngày</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Email tóm tắt hoạt động STEM gửi đến BGH
                    </p>
                  </div>
                  <Toggle value={emailDigest} onChange={() => setEmailDigest((v) => !v)} />
                </div>

                {/* Google Classroom — coming soon */}
                <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-center justify-between gap-4 opacity-70">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">Google Classroom</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                          Sắp có
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Đồng bộ lịch học, bài tập và điểm số với Google Classroom
                      </p>
                    </div>
                  </div>
                  <Toggle value={false} onChange={() => {}} />
                </div>

                {/* Microsoft Teams — coming soon */}
                <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-center justify-between gap-4 opacity-70">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">Microsoft Teams</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                        Sắp có
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tích hợp cuộc họp, thông báo và tài liệu qua Microsoft Teams
                    </p>
                  </div>
                  <Toggle value={false} onChange={() => {}} />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  onClick={() => toast.success("Đã lưu cài đặt tích hợp")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Lưu cài đặt
                </button>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeSection === "security" && (
            <div className="space-y-4">
              {/* 2FA + timeout */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Bảo mật tài khoản
                </h3>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Xác thực 2 bước (2FA)</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tăng bảo mật với OTP gửi đến điện thoại hoặc email
                    </p>
                  </div>
                  <Toggle value={twoFactor} onChange={() => setTwoFactor((v) => !v)} />
                </div>

                {twoFactor && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-xs text-green-700">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Xác thực 2 bước đã được kích hoạt. OTP sẽ gửi đến {schoolProfileData.principalPhone}.
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Thời gian hết phiên đăng nhập
                    </label>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="4h">4 giờ</option>
                      <option value="8h">8 giờ</option>
                      <option value="12h">12 giờ</option>
                      <option value="24h">24 giờ</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Login history */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  Lịch sử đăng nhập gần đây
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        {["Thời gian", "Thiết bị", "Địa chỉ IP", "Trạng thái"].map((h) => (
                          <th key={h} className="text-left font-semibold text-muted-foreground pb-2 pr-4 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {LOGIN_HISTORY.map((row, i) => (
                        <tr key={i} className="hover:bg-muted/50 transition-colors">
                          <td className="py-2.5 pr-4 text-foreground whitespace-nowrap">{row.time}</td>
                          <td className="py-2.5 pr-4 text-foreground whitespace-nowrap">{row.device}</td>
                          <td className="py-2.5 pr-4 font-mono text-muted-foreground">{row.ip}</td>
                          <td className="py-2.5 pr-4">
                            {row.ok ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-3 h-3" /> Thành công
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-600">
                                <AlertTriangle className="w-3 h-3" /> Thất bại
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Hành động bảo mật</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => toast.info("Đã gửi email đặt lại mật khẩu đến " + schoolProfileData.principalEmail)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    Đặt lại mật khẩu
                  </button>
                  <button
                    onClick={() => toast.info("Đang xuất nhật ký truy cập...")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Xuất nhật ký truy cập
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => toast.success("Đã lưu cài đặt bảo mật")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Lưu cài đặt bảo mật
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
