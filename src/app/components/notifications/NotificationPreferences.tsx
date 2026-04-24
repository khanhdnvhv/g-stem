import { useState } from "react";
import {
  Bell, Mail, Smartphone, Monitor, Save, CheckCircle,
  Volume2, VolumeX, Clock, Shield,
} from "lucide-react";
import {
  DEFAULT_PREFERENCES, CATEGORY_CONFIG,
  type NotificationPreference, type NotificationCategory,
} from "./mock-data";

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPreference[]>(DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietFrom, setQuietFrom] = useState("22:00");
  const [quietTo, setQuietTo] = useState("07:00");
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState<"daily" | "weekly">("daily");

  const togglePref = (category: NotificationCategory, channel: "email" | "push" | "inApp") => {
    setPrefs(prev => prev.map(p =>
      p.category === category ? { ...p, [channel]: !p[channel] } : p
    ));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const enableAll = () => {
    setPrefs(prev => prev.map(p => ({ ...p, email: true, push: true, inApp: true })));
  };

  const disableAll = (channel: "email" | "push" | "inApp") => {
    setPrefs(prev => prev.map(p => ({ ...p, [channel]: false })));
  };

  // Stats
  const emailCount = prefs.filter(p => p.email).length;
  const pushCount = prefs.filter(p => p.push).length;
  const inAppCount = prefs.filter(p => p.inApp).length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Email", count: emailCount, total: prefs.length, icon: Mail, color: "#2563eb" },
          { label: "Push", count: pushCount, total: prefs.length, icon: Smartphone, color: "#16a34a" },
          { label: "Trong app", count: inAppCount, total: prefs.length, icon: Monitor, color: "#990803" },
        ].map(ch => {
          const Icon = ch.icon;
          return (
            <div key={ch.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: ch.color + "12" }}>
                <Icon className="w-5 h-5" style={{ color: ch.color }} />
              </div>
              <div>
                <p className="text-gray-800" style={{ fontSize: "15px", fontWeight: 700 }}>{ch.count}/{ch.total}</p>
                <p className="text-gray-400" style={{ fontSize: "11px" }}>Kênh {ch.label}</p>
              </div>
              <div className="ml-auto">
                <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(ch.count / ch.total) * 100}%`, backgroundColor: ch.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preferences table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-gray-700" style={{ fontSize: "14px", fontWeight: 600 }}>Cài đặt theo danh mục</h3>
          <div className="flex items-center gap-2">
            <button onClick={enableAll} className="px-2.5 py-1 text-[#990803] border border-[#990803]/20 rounded-lg hover:bg-[#990803]/5 cursor-pointer" style={{ fontSize: "11px", fontWeight: 500 }}>
              Bật tất cả
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <div className="col-span-5 text-gray-400" style={{ fontSize: "11px", fontWeight: 500 }}>Danh mục</div>
          <div className="col-span-2 text-center text-gray-400 flex items-center justify-center gap-1" style={{ fontSize: "11px", fontWeight: 500 }}>
            <Mail className="w-3 h-3" /> Email
          </div>
          <div className="col-span-2 text-center text-gray-400 flex items-center justify-center gap-1" style={{ fontSize: "11px", fontWeight: 500 }}>
            <Smartphone className="w-3 h-3" /> Push
          </div>
          <div className="col-span-2 text-center text-gray-400 flex items-center justify-center gap-1" style={{ fontSize: "11px", fontWeight: 500 }}>
            <Monitor className="w-3 h-3" /> App
          </div>
          <div className="col-span-1" />
        </div>

        {/* Rows */}
        {prefs.map(pref => {
          const catCfg = CATEGORY_CONFIG[pref.category];
          return (
            <div key={pref.category} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 items-center">
              <div className="col-span-5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: catCfg.color }} />
                  <span className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>{pref.label}</span>
                </div>
                <p className="text-gray-400 ml-4 mt-0.5" style={{ fontSize: "10.5px" }}>{pref.description}</p>
              </div>
              {(["email", "push", "inApp"] as const).map(ch => (
                <div key={ch} className="col-span-2 flex justify-center">
                  <button
                    onClick={() => togglePref(pref.category, ch)}
                    className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${
                      pref[ch] ? "bg-[#990803]" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className="absolute w-4 h-4 rounded-full bg-white shadow-sm top-0.5 transition-all"
                      style={{ left: pref[ch] ? "22px" : "2px" }}
                    />
                  </button>
                </div>
              ))}
              <div className="col-span-1" />
            </div>
          );
        })}
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {quietHoursEnabled ? <Volume2 className="w-4 h-4 text-[#990803]" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            <h3 className="text-gray-700" style={{ fontSize: "14px", fontWeight: 600 }}>Giờ yên tĩnh</h3>
          </div>
          <button
            onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
            className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${
              quietHoursEnabled ? "bg-[#990803]" : "bg-gray-200"
            }`}
          >
            <div
              className="absolute w-4 h-4 rounded-full bg-white shadow-sm top-0.5 transition-all"
              style={{ left: quietHoursEnabled ? "22px" : "2px" }}
            />
          </button>
        </div>
        {quietHoursEnabled && (
          <div className="flex items-center gap-3 ml-6">
            <span className="text-gray-500" style={{ fontSize: "12px" }}>Từ</span>
            <input
              type="time"
              value={quietFrom}
              onChange={e => setQuietFrom(e.target.value)}
              className="px-2 py-1 border border-gray-200 rounded-lg text-gray-700 focus:outline-none"
              style={{ fontSize: "12px" }}
            />
            <span className="text-gray-500" style={{ fontSize: "12px" }}>đến</span>
            <input
              type="time"
              value={quietTo}
              onChange={e => setQuietTo(e.target.value)}
              className="px-2 py-1 border border-gray-200 rounded-lg text-gray-700 focus:outline-none"
              style={{ fontSize: "12px" }}
            />
            <span className="text-gray-400" style={{ fontSize: "11px" }}>Không gửi push trong khoảng này</span>
          </div>
        )}
      </div>

      {/* Digest */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#c8a84e]" />
            <h3 className="text-gray-700" style={{ fontSize: "14px", fontWeight: 600 }}>Email tổng hợp</h3>
          </div>
          <button
            onClick={() => setDigestEnabled(!digestEnabled)}
            className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${
              digestEnabled ? "bg-[#990803]" : "bg-gray-200"
            }`}
          >
            <div
              className="absolute w-4 h-4 rounded-full bg-white shadow-sm top-0.5 transition-all"
              style={{ left: digestEnabled ? "22px" : "2px" }}
            />
          </button>
        </div>
        {digestEnabled && (
          <div className="flex items-center gap-3 ml-6">
            <span className="text-gray-500" style={{ fontSize: "12px" }}>Tần suất:</span>
            {(["daily", "weekly"] as const).map(f => (
              <button
                key={f}
                onClick={() => setDigestFrequency(f)}
                className={`px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                  digestFrequency === f
                    ? "border-[#990803] bg-[#990803]/5 text-[#990803]"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
                style={{ fontSize: "12px", fontWeight: digestFrequency === f ? 600 : 400 }}
              >
                {f === "daily" ? "Hàng ngày" : "Hàng tuần"}
              </button>
            ))}
            <span className="text-gray-400" style={{ fontSize: "11px" }}>
              {digestFrequency === "daily" ? "Gửi lúc 08:00 mỗi sáng" : "Gửi vào thứ 2 hàng tuần"}
            </span>
          </div>
        )}
      </div>

      {/* DND Mode */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Shield className="w-4 h-4 text-purple-600" />
          <h3 className="text-purple-700" style={{ fontSize: "14px", fontWeight: 600 }}>Chế độ Không làm phiền</h3>
        </div>
        <p className="text-purple-500 mb-3" style={{ fontSize: "12px" }}>
          Khi bật, chỉ nhận thông báo khẩn cấp (urgent). Tất cả thông báo khác sẽ được gom lại và gửi khi tắt chế độ.
        </p>
        <button
          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer"
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          Bật Không làm phiền
        </button>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-[#990803] text-white rounded-xl hover:bg-[#7a0602] transition-colors cursor-pointer flex items-center gap-2"
          style={{ fontSize: "13px", fontWeight: 600 }}
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4" /> Đã lưu cài đặt
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Lưu cài đặt
            </>
          )}
        </button>
      </div>
    </div>
  );
}
