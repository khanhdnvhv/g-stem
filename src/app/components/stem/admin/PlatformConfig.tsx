import { useState } from "react";
import {
  Settings, Palette, PackagePlus, Upload, CheckCircle2,
  Download, Globe, Smartphone,
} from "lucide-react";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "sonner";

/* ================================================================ */
/*  PLATFORM CONFIG — branding / plugins / OTA updates              */
/* ================================================================ */

const PLUGINS = [
  { id: "ai-buddy",   name: "AI-Buddy Tutor",       version: "1.5.2", enabled: true,  category: "AI" },
  { id: "robotic",    name: "Robotic AI Suite",     version: "4.0.0", enabled: true,  category: "STEM" },
  { id: "vneid",      name: "VNeID Connector",      version: "2.1.0", enabled: true,  category: "Integration" },
  { id: "nedu",       name: "CSDL Ngành GD",        version: "3.0.1", enabled: true,  category: "Integration" },
  { id: "zalo-oa",    name: "Zalo OA Notification", version: "1.2.3", enabled: false, category: "Communication" },
  { id: "grade-book", name: "Advanced Gradebook",   version: "2.4.0", enabled: true,  category: "Education" },
  { id: "proctoring", name: "AI Exam Proctoring",   version: "1.0.8", enabled: false, category: "Exam" },
];

const UPDATES = [
  { version: "v3.4.2", channel: "stable",  releasedAt: "2026-04-15", notes: "Fix data sync race condition, AI-Buddy CT5 improvement" },
  { version: "v3.4.1", channel: "stable",  releasedAt: "2026-03-28", notes: "Security patch CVE-2026-1234" },
  { version: "v3.4.0", channel: "stable",  releasedAt: "2026-03-10", notes: "Dev Portal GA, webhook retry logic" },
  { version: "v3.5.0-rc1", channel: "beta", releasedAt: "2026-04-20", notes: "Next-gen AI-Buddy with GPT-4 integration (beta)" },
];

export function PlatformConfig() {
  const [tab, setTab] = useState<"branding" | "plugins" | "ota" | "mobile">("branding");
  const [primaryColor, setPrimaryColor] = useState("#990803");
  const [accentColor, setAccentColor] = useState("#c8a84e");
  const [platformName, setPlatformName] = useState("Geleximco STEM");

  const enabledPlugins = PLUGINS.filter((p) => p.enabled).length;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Settings}
        title="Cấu hình Nền tảng"
        subtitle="White-label branding, plugin ecosystem, OTA update và cấu hình mobile app."
        accentColor="#e74c3c"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Palette} label="Branding tenant" value="4 theme" color="#c8a84e" />
        <KpiCard icon={PackagePlus} label="Plugin đã kích hoạt" value={`${enabledPlugins}/${PLUGINS.length}`} color="#16a34a" />
        <KpiCard icon={Upload} label="Phiên bản hiện tại" value="v3.4.2" color="#7c3aed" />
        <KpiCard icon={Smartphone} label="Mobile app deploy" value="v2.1.0" color="#0891b2" />
      </div>

      <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 overflow-x-auto">
        {[
          { id: "branding", label: "Branding",     icon: Palette },
          { id: "plugins",  label: "Plugins",      icon: PackagePlus },
          { id: "ota",      label: "OTA Update",   icon: Upload },
          { id: "mobile",   label: "Mobile App",   icon: Smartphone },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
              tab === t.id ? "bg-[#e74c3c] text-white" : "hover:bg-secondary"
            }`}
            style={{ fontSize: "12.5px", fontWeight: tab === t.id ? 600 : 500 }}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "branding" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Brand mặc định (Master)</h3>
            <div>
              <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>TÊN NỀN TẢNG</label>
              <input value={platformName} onChange={(e) => setPlatformName(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
                style={{ fontSize: "13px" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>MÀU CHỦ ĐẠO</label>
                <div className="mt-1 flex gap-2">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-border cursor-pointer" />
                  <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg font-mono"
                    style={{ fontSize: "12px" }} />
                </div>
              </div>
              <div>
                <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>MÀU NHẤN</label>
                <div className="mt-1 flex gap-2">
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                    className="w-12 h-10 rounded-lg border border-border cursor-pointer" />
                  <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg font-mono"
                    style={{ fontSize: "12px" }} />
                </div>
              </div>
            </div>
            <button onClick={() => toast.success("Đã cập nhật branding master. Các tenant kế thừa sẽ được làm mới.")}
              className="w-full mt-2 px-4 py-2 bg-[#e74c3c] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              Lưu branding
            </button>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Preview</h3>
            <div className="p-4 rounded-lg border border-border"
              style={{ background: `linear-gradient(135deg, ${primaryColor}15, ${accentColor}10)` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
                  style={{ background: `linear-gradient(145deg, ${primaryColor}, ${primaryColor}cc)` }}>
                  <span style={{ fontWeight: 700 }}>G</span>
                </div>
                <p style={{ fontSize: "15px", fontWeight: 800, color: primaryColor }}>
                  {platformName.split(" ")[0]} <span style={{ color: accentColor }}>{platformName.split(" ").slice(1).join(" ")}</span>
                </p>
              </div>
              <button className="w-full px-3 py-2 rounded-lg text-white"
                style={{ fontSize: "13px", fontWeight: 500, backgroundColor: primaryColor }}>
                Primary button
              </button>
              <div className="mt-2 flex gap-2">
                <span className="flex-1 text-center px-2 py-1 rounded text-white"
                  style={{ fontSize: "11.5px", fontWeight: 600, backgroundColor: accentColor }}>
                  Accent tag
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "plugins" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PLUGINS.map((p) => (
            <div key={p.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#e74c3c]/15 flex items-center justify-center shrink-0">
                  <PackagePlus className="w-5 h-5 text-[#e74c3c]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p style={{ fontSize: "13px", fontWeight: 700 }}>{p.name}</p>
                    <span className="font-mono text-muted-foreground" style={{ fontSize: "10.5px" }}>v{p.version}</span>
                  </div>
                  <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11.5px" }}>
                    Category: {p.category}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded`} style={{
                      fontSize: "10.5px", fontWeight: 600,
                      color: p.enabled ? "#16a34a" : "#64748b",
                      backgroundColor: p.enabled ? "#16a34a15" : "#64748b15",
                    }}>
                      {p.enabled ? <><CheckCircle2 className="w-3 h-3" /> Đã kích hoạt</> : "Tạm tắt"}
                    </span>
                    <button onClick={() => toast.info(`${p.enabled ? "Tắt" : "Kích hoạt"} ${p.name}`)}
                      className="ml-auto text-[#e74c3c]" style={{ fontSize: "11.5px", fontWeight: 500 }}>
                      {p.enabled ? "Tắt" : "Kích hoạt"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "ota" && (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {UPDATES.map((u) => (
            <div key={u.version} className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: u.channel === "stable" ? "#16a34a15" : "#7c3aed15",
                  color: u.channel === "stable" ? "#16a34a" : "#7c3aed",
                }}>
                <Upload className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <code style={{ fontSize: "13px", fontWeight: 700 }}>{u.version}</code>
                  <span className="px-1.5 py-0.5 rounded" style={{
                    fontSize: "10px", fontWeight: 600,
                    color: u.channel === "stable" ? "#16a34a" : "#7c3aed",
                    backgroundColor: u.channel === "stable" ? "#16a34a15" : "#7c3aed15",
                  }}>
                    {u.channel.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
                    {u.releasedAt}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "12px" }}>{u.notes}</p>
              </div>
              <button onClick={() => toast.success(`Deploy ${u.version} lên toàn platform`)}
                className="px-3 py-1.5 bg-[#e74c3c] text-white rounded hover:opacity-90"
                style={{ fontSize: "11.5px", fontWeight: 500 }}>
                <Download className="w-3 h-3 inline mr-1" /> Deploy
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "mobile" && (
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-xl bg-[#e74c3c]/10 flex items-center justify-center">
              <Smartphone className="w-7 h-7 text-[#e74c3c]" />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Geleximco STEM Mobile</h3>
              <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>iOS 2.1.0 · Android 2.1.0 · React Native</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "App Store", value: "4.7 ★ (1.2k)", color: "#0891b2" },
              { label: "Play Store", value: "4.8 ★ (3.5k)", color: "#16a34a" },
              { label: "Downloads", value: "85k+", color: "#7c3aed" },
              { label: "MAU", value: "42k", color: "#c8a84e" },
            ].map((m) => (
              <div key={m.label} className="bg-secondary/40 rounded-lg p-3">
                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{m.label}</p>
                <p style={{ fontSize: "18px", fontWeight: 700, color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>
          <button onClick={() => toast.info("Mở panel cấu hình push notification, deep link, splash screen")}
            className="w-full mt-4 px-4 py-2 bg-[#e74c3c] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            Cấu hình Mobile App
          </button>
        </div>
      )}
    </div>
  );
}

export default PlatformConfig;
