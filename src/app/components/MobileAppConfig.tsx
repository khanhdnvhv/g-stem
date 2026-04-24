import { useState } from "react";
import {
  Smartphone, Settings, Bell, Layout, Palette, Shield,
  Download, Upload, Eye, Edit, Plus, Trash2,
  CheckCircle, XCircle, AlertTriangle, Clock, RefreshCw,
  Users, TrendingUp, BarChart3, Zap, Globe,
  Wifi, WifiOff, Battery, Signal, Monitor,
  Image, Type, ToggleLeft, Layers, Navigation,
  Send, MessageCircle, Star, Activity, Hash,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface AppVersion {
  id: string;
  version: string;
  platform: "ios" | "android" | "both";
  releaseDate: string;
  status: "live" | "beta" | "deprecated" | "pending";
  downloads: number;
  activeUsers: number;
  crashRate: number;
  rating: number;
  changes: string[];
}

interface PushTemplate {
  id: string;
  name: string;
  event: string;
  title: string;
  body: string;
  enabled: boolean;
  sent24h: number;
  openRate: number;
  category: "learning" | "deadline" | "social" | "system" | "achievement";
}

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  platforms: ("ios" | "android" | "web")[];
  rolloutPercent: number;
  lastUpdated: string;
}

// ─── Mock Data ───
const VERSIONS: AppVersion[] = [
  {
    id: "V01", version: "3.2.1", platform: "both", releaseDate: "10/03/2026",
    status: "live", downloads: 5420, activeUsers: 4850, crashRate: 0.12, rating: 4.7,
    changes: ["Cải thiện hiệu năng Offline Learning", "Sửa lỗi video player trên Android 14", "Thêm biometric login", "Tối ưu push notification delivery"],
  },
  {
    id: "V02", version: "3.3.0-beta", platform: "both", releaseDate: "11/03/2026",
    status: "beta", downloads: 320, activeUsers: 280, crashRate: 0.45, rating: 4.3,
    changes: ["Tính năng Study Groups mới", "Dark mode cải tiến", "Widget lộ trình trên màn hình chính", "Hỗ trợ Apple Watch complication"],
  },
  {
    id: "V03", version: "3.1.0", platform: "both", releaseDate: "15/02/2026",
    status: "deprecated", downloads: 5100, activeUsers: 890, crashRate: 0.18, rating: 4.5,
    changes: ["Gamification Center", "Certificate PDF viewer", "Calendar sync với Google Calendar"],
  },
  {
    id: "V04", version: "3.4.0", platform: "both", releaseDate: "—",
    status: "pending", downloads: 0, activeUsers: 0, crashRate: 0, rating: 0,
    changes: ["AI Chatbot GelBot tích hợp", "Offline exam support", "Tối ưu battery usage 30%", "Accessibility improvements (WCAG 2.1 AA)"],
  },
];

const PUSH_TEMPLATES: PushTemplate[] = [
  { id: "PT01", name: "Nhắc nhở Deadline", event: "deadline.approaching", title: "⏰ Sắp hết hạn!", body: "Khóa {{course_name}} hết hạn trong {{days}} ngày. Hoàn thành ngay!", enabled: true, sent24h: 245, openRate: 72, category: "deadline" },
  { id: "PT02", name: "Khóa học mới", event: "course.published", title: "📚 Khóa mới dành cho bạn", body: "{{course_name}} vừa được mở — phù hợp với lộ trình của bạn.", enabled: true, sent24h: 180, openRate: 58, category: "learning" },
  { id: "PT03", name: "Hoàn thành Bài thi", event: "exam.graded", title: "✅ Kết quả Bài thi", body: "Bạn đạt {{score}} điểm trong bài thi {{exam_name}}.", enabled: true, sent24h: 92, openRate: 85, category: "learning" },
  { id: "PT04", name: "Badge mới", event: "badge.earned", title: "🏆 Badge mới!", body: "Chúc mừng! Bạn nhận được badge \"{{badge_name}}\".", enabled: true, sent24h: 45, openRate: 78, category: "achievement" },
  { id: "PT05", name: "Tin nhắn mới", event: "message.received", title: "💬 Tin nhắn từ {{sender}}", body: "{{preview}}", enabled: true, sent24h: 320, openRate: 65, category: "social" },
  { id: "PT06", name: "Nhắc nhở Học tập", event: "learning.reminder", title: "📖 Đến giờ học rồi!", body: "Bạn chưa học hôm nay. Tiếp tục {{course_name}} nhé!", enabled: true, sent24h: 1250, openRate: 42, category: "learning" },
  { id: "PT07", name: "Bảo trì Hệ thống", event: "system.maintenance", title: "🔧 Bảo trì hệ thống", body: "LMS sẽ bảo trì từ {{start_time}} đến {{end_time}}.", enabled: false, sent24h: 0, openRate: 0, category: "system" },
  { id: "PT08", name: "Chứng chỉ Sẵn sàng", event: "cert.issued", title: "🎓 Chứng chỉ mới!", body: "Chứng chỉ {{cert_name}} đã sẵn sàng tải về.", enabled: true, sent24h: 28, openRate: 90, category: "achievement" },
];

const FEATURE_FLAGS: FeatureFlag[] = [
  { id: "FF01", name: "Dark Mode", key: "feature_dark_mode", description: "Chế độ tối cho ứng dụng", enabled: true, platforms: ["ios", "android"], rolloutPercent: 100, lastUpdated: "01/03/2026" },
  { id: "FF02", name: "Offline Exams", key: "feature_offline_exams", description: "Cho phép làm bài thi offline, sync khi có mạng", enabled: false, platforms: ["ios", "android"], rolloutPercent: 0, lastUpdated: "11/03/2026" },
  { id: "FF03", name: "Biometric Login", key: "feature_biometric", description: "Đăng nhập bằng vân tay/Face ID", enabled: true, platforms: ["ios", "android"], rolloutPercent: 95, lastUpdated: "05/03/2026" },
  { id: "FF04", name: "AI Chatbot", key: "feature_ai_chatbot", description: "GelBot AI tích hợp trong app", enabled: true, platforms: ["ios", "android", "web"], rolloutPercent: 50, lastUpdated: "10/03/2026" },
  { id: "FF05", name: "Video PiP", key: "feature_video_pip", description: "Picture-in-Picture cho video bài giảng", enabled: true, platforms: ["ios", "android"], rolloutPercent: 100, lastUpdated: "20/02/2026" },
  { id: "FF06", name: "Widget Home Screen", key: "feature_home_widget", description: "Widget tiến độ học trên màn hình chính", enabled: true, platforms: ["ios", "android"], rolloutPercent: 80, lastUpdated: "08/03/2026" },
  { id: "FF07", name: "Apple Watch", key: "feature_apple_watch", description: "Complication + notifications trên Apple Watch", enabled: false, platforms: ["ios"], rolloutPercent: 0, lastUpdated: "11/03/2026" },
  { id: "FF08", name: "Haptic Feedback", key: "feature_haptic", description: "Rung phản hồi khi hoàn thành bài học", enabled: true, platforms: ["ios", "android"], rolloutPercent: 100, lastUpdated: "15/02/2026" },
];

const STATUS_CFG = {
  live: { label: "Đang Live", color: "#16a34a", bg: "#16a34a10" },
  beta: { label: "Beta", color: "#2563eb", bg: "#2563eb10" },
  deprecated: { label: "Ngừng hỗ trợ", color: "#6b7280", bg: "#6b728010" },
  pending: { label: "Chờ phát hành", color: "#c8a84e", bg: "#c8a84e10" },
};

const CAT_COLORS: Record<string, string> = {
  learning: "#990803", deadline: "#ef4444", social: "#2563eb", system: "#6b7280", achievement: "#c8a84e",
};

export function MobileAppConfig() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"overview" | "versions" | "push" | "features" | "appearance">("overview");

  const liveVersion = VERSIONS.find(v => v.status === "live")!;
  const totalDownloads = VERSIONS.reduce((s, v) => s + v.downloads, 0);
  const totalActive = liveVersion.activeUsers;
  const enabledPush = PUSH_TEMPLATES.filter(p => p.enabled).length;
  const enabledFlags = FEATURE_FLAGS.filter(f => f.enabled).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Cấu hình Mobile App</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Quản lý phiên bản, push notifications, feature flags và giao diện ứng dụng di động
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-green-600" style={{ fontSize: "11px", fontWeight: 600 }}>v{liveVersion.version} Live</span>
          </div>
          <button onClick={() => { import("sonner").then(m => m.toast.info("Mở form phát hành phiên bản mới...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Upload className="w-4 h-4" /> Phát hành Mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Tổng Downloads", value: totalDownloads.toLocaleString(), icon: Download, color: "#990803" },
          { label: "Đang hoạt động", value: totalActive.toLocaleString(), icon: Users, color: "#16a34a" },
          { label: "Crash Rate", value: `${liveVersion.crashRate}%`, icon: AlertTriangle, color: liveVersion.crashRate < 0.5 ? "#16a34a" : "#ef4444" },
          { label: "Rating", value: liveVersion.rating.toFixed(1), icon: Star, color: "#c8a84e" },
          { label: "Push Templates", value: `${enabledPush}/${PUSH_TEMPLATES.length}`, icon: Bell, color: "#2563eb" },
          { label: "Feature Flags", value: `${enabledFlags}/${FEATURE_FLAGS.length}`, icon: ToggleLeft, color: "#7c3aed" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "10" }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: s.color }}>{s.value}</p>
              <p className="text-gray-400" style={{ fontSize: "9px" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200 overflow-x-auto">
        {[
          { id: "overview" as const, label: "Tổng quan", icon: BarChart3 },
          { id: "versions" as const, label: "Phiên bản", icon: Layers },
          { id: "push" as const, label: "Push Notifications", icon: Bell },
          { id: "features" as const, label: "Feature Flags", icon: ToggleLeft },
          { id: "appearance" as const, label: "Giao diện", icon: Palette },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab versions={VERSIONS} pushTemplates={PUSH_TEMPLATES} />}
      {tab === "versions" && <VersionsTab versions={VERSIONS} />}
      {tab === "push" && <PushTab templates={PUSH_TEMPLATES} />}
      {tab === "features" && <FeaturesTab flags={FEATURE_FLAGS} />}
      {tab === "appearance" && <AppearanceTab />}
    </div>
  );
}

// ─── Overview Tab ───
function OverviewTab({ versions, pushTemplates }: { versions: AppVersion[]; pushTemplates: PushTemplate[] }) {
  const dailyActive = [3200, 3400, 3100, 3600, 4200, 4500, 4850, 4600, 4900, 5100, 4800, 4700, 4850, 4920];
  const maxDA = Math.max(...dailyActive);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* DAU Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Daily Active Users (14 ngày)</h3>
          <svg width="100%" height="120" viewBox="0 0 520 120" preserveAspectRatio="xMidYMid meet">
            {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
              const y = 10 + (1 - r) * 85;
              return (
                <g key={i}>
                  <line x1="30" y1={y} x2="510" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
                  <text x="25" y={y} textAnchor="end" dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "7px" }}>{Math.round(maxDA * r)}</text>
                </g>
              );
            })}
            {/* Area */}
            <defs>
              <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#990803" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#990803" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon
              points={`30,95 ${dailyActive.map((v, i) => `${30 + (i / (dailyActive.length - 1)) * 480},${10 + (1 - v / maxDA) * 85}`).join(" ")} 510,95`}
              fill="url(#dauGrad)"
            />
            <polyline
              points={dailyActive.map((v, i) => `${30 + (i / (dailyActive.length - 1)) * 480},${10 + (1 - v / maxDA) * 85}`).join(" ")}
              fill="none" stroke="#990803" strokeWidth="2" strokeLinejoin="round"
            />
            {dailyActive.map((v, i) => {
              const x = 30 + (i / (dailyActive.length - 1)) * 480;
              const y = 10 + (1 - v / maxDA) * 85;
              return <circle key={i} cx={x} cy={y} r="2.5" fill="#990803" />;
            })}
            {dailyActive.map((_, i) => {
              if (i % 3 !== 0) return null;
              const x = 30 + (i / (dailyActive.length - 1)) * 480;
              return <text key={i} x={x} y={108} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "7px" }}>T{i + 1}</text>;
            })}
          </svg>
        </div>

        {/* Platform Split */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Phân bố Nền tảng</h3>
          <div className="flex items-center gap-6">
            <PlatformDonut ios={58} android={42} />
            <div className="flex-1 space-y-3">
              {[
                { label: "iOS", value: "58%", count: "2,813", color: "#2563eb", icon: "🍎" },
                { label: "Android", value: "42%", count: "2,037", color: "#16a34a", icon: "🤖" },
              ].map(p => (
                <div key={p.label} className="flex items-center gap-2">
                  <span style={{ fontSize: "18px" }}>{p.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-gray-600" style={{ fontSize: "12px", fontWeight: 500 }}>{p.label}</span>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: p.color }}>{p.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: p.value, backgroundColor: p.color }} />
                    </div>
                    <p className="text-gray-300 mt-0.5" style={{ fontSize: "9px" }}>{p.count} users</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Push Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Push Notification Performance (24h)</h3>
        <svg width="100%" height="100" viewBox="0 0 600 100" preserveAspectRatio="xMidYMid meet">
          {pushTemplates.filter(p => p.enabled && p.sent24h > 0).map((pt, i) => {
            const x = 20 + i * 80;
            const maxS = Math.max(...pushTemplates.map(p => p.sent24h));
            const barH = maxS > 0 ? (pt.sent24h / maxS) * 55 : 0;
            const catColor = CAT_COLORS[pt.category] || "#6b7280";
            return (
              <g key={pt.id}>
                <rect x={x} y={65 - barH} width="55" height={barH} rx="4" fill={catColor} opacity="0.7" />
                <text x={x + 27.5} y={60 - barH} textAnchor="middle" fill={catColor} style={{ fontSize: "8px", fontWeight: 700 }}>{pt.sent24h}</text>
                <text x={x + 27.5} y={78} textAnchor="middle" fill="#6b7280" style={{ fontSize: "6px" }}>{pt.name.slice(0, 12)}</text>
                <text x={x + 27.5} y={90} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "7px" }}>Open: {pt.openRate}%</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Device Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {[
          { label: "Avg. Session", value: "12m 35s", trend: "+8%", icon: Clock, color: "#990803" },
          { label: "Avg. Battery/Session", value: "2.1%", trend: "-15%", icon: Battery, color: "#16a34a" },
          { label: "Network: Offline Usage", value: "18%", trend: "+3%", icon: WifiOff, color: "#2563eb" },
        ].map((m, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.color + "10" }}>
              <m.icon className="w-5 h-5" style={{ color: m.color }} />
            </div>
            <div>
              <p className="text-gray-800" style={{ fontSize: "16px", fontWeight: 700 }}>{m.value}</p>
              <div className="flex items-center gap-1">
                <p className="text-gray-400" style={{ fontSize: "10px" }}>{m.label}</p>
                <span className={m.trend.startsWith("+") && m.label.includes("Battery") ? "text-red-500" : "text-green-500"} style={{ fontSize: "9px", fontWeight: 600 }}>{m.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlatformDonut({ ios, android }: { ios: number; android: number }) {
  const R = 35, C = Math.PI * 2 * R;
  const iosArc = (ios / 100) * C;
  const androidArc = (android / 100) * C;
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={R} fill="none" stroke="#16a34a" strokeWidth="10" strokeDasharray={`${androidArc} ${C - androidArc}`} strokeDashoffset={-iosArc} transform="rotate(-90 48 48)" />
        <circle cx="48" cy="48" r={R} fill="none" stroke="#2563eb" strokeWidth="10" strokeDasharray={`${iosArc} ${C - iosArc}`} transform="rotate(-90 48 48)" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-gray-800" style={{ fontSize: "14px", fontWeight: 700 }}>4,850</span>
        <span className="text-gray-400" style={{ fontSize: "8px" }}>Active</span>
      </div>
    </div>
  );
}

// ─── Versions Tab ───
function VersionsTab({ versions }: { versions: AppVersion[] }) {
  return (
    <div className="space-y-3">
      {versions.map(v => {
        const stCfg = STATUS_CFG[v.status];
        return (
          <div key={v.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: stCfg.bg }}>
                <Smartphone className="w-6 h-6" style={{ color: stCfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-gray-800 font-mono" style={{ fontSize: "16px", fontWeight: 700 }}>v{v.version}</span>
                  <span className="px-2 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                  <span className="px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded" style={{ fontSize: "9px" }}>
                    {v.platform === "both" ? "iOS + Android" : v.platform.toUpperCase()}
                  </span>
                  <span className="text-gray-300" style={{ fontSize: "10px" }}>{v.releaseDate}</span>
                </div>

                <div className="flex items-center gap-4 text-gray-400 mt-1" style={{ fontSize: "10px" }}>
                  {v.downloads > 0 && <span className="flex items-center gap-0.5"><Download className="w-2.5 h-2.5" /> {v.downloads.toLocaleString()} downloads</span>}
                  {v.activeUsers > 0 && <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" /> {v.activeUsers.toLocaleString()} active</span>}
                  {v.crashRate > 0 && <span className="flex items-center gap-0.5" style={{ color: v.crashRate < 0.3 ? "#16a34a" : "#ef4444" }}><AlertTriangle className="w-2.5 h-2.5" /> Crash: {v.crashRate}%</span>}
                  {v.rating > 0 && <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5" style={{ color: "#c8a84e" }} /> {v.rating}</span>}
                </div>

                <div className="mt-2 space-y-0.5">
                  {v.changes.map((ch, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-[#990803]" />
                      <span className="text-gray-500" style={{ fontSize: "11px" }}>{ch}</span>
                    </div>
                  ))}
                </div>
              </div>

              {v.status === "live" && (
                <div className="shrink-0 text-center">
                  <RatingStars rating={v.rating} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="text-center">
      <svg width="60" height="14" viewBox="0 0 60 14">
        {[0, 1, 2, 3, 4].map(i => {
          const fill = i < Math.floor(rating) ? "#c8a84e" : i < rating ? "#c8a84e80" : "#e5e7eb";
          return <polygon key={i} points={`${6 + i * 12},1 ${8 + i * 12},5 ${12 + i * 12},5 ${9 + i * 12},8 ${10 + i * 12},12 ${6 + i * 12},10 ${2 + i * 12},12 ${3 + i * 12},8 ${0 + i * 12},5 ${4 + i * 12},5`} fill={fill} />;
        })}
      </svg>
      <p className="text-gray-400 mt-0.5" style={{ fontSize: "9px" }}>{rating}/5.0</p>
    </div>
  );
}

// ─── Push Tab ───
function PushTab({ templates: initialTemplates }: { templates: PushTemplate[] }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const toggleTemplate = (id: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
    const t = templates.find(t => t.id === id);
    import("sonner").then(m => m.toast.success(`Đã ${t?.enabled ? "tắt" : "bật"} mẫu "${t?.name}"`));
  };
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-gray-500" style={{ fontSize: "12px" }}>Quản lý mẫu push notification</p>
        <button onClick={() => { import("sonner").then(m => m.toast.info("Mở form tạo mẫu notification...")); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#990803] text-white rounded-lg cursor-pointer" style={{ fontSize: "11px" }}>
          <Plus className="w-3 h-3" /> Tạo Mẫu
        </button>
      </div>
      {templates.map(pt => {
        const catColor = CAT_COLORS[pt.category] || "#6b7280";
        return (
          <div key={pt.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className={`w-2 h-full min-h-[40px] rounded-full shrink-0 ${pt.enabled ? "" : "opacity-30"}`} style={{ backgroundColor: catColor }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className={`text-gray-800 ${!pt.enabled ? "opacity-50" : ""}`} style={{ fontSize: "13px", fontWeight: 600 }}>{pt.name}</h4>
                  <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: catColor, backgroundColor: catColor + "10" }}>{pt.category}</span>
                  <span className={`px-1.5 py-0.5 rounded ${pt.enabled ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`} style={{ fontSize: "8px", fontWeight: 600 }}>
                    {pt.enabled ? "Bật" : "Tắt"}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 mt-1 mb-1">
                  <p className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{pt.title}</p>
                  <p className="text-gray-500" style={{ fontSize: "11px" }}>{pt.body}</p>
                </div>
                <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: "10px" }}>
                  <span className="font-mono text-gray-300">{pt.event}</span>
                  {pt.sent24h > 0 && <span>Gửi 24h: <strong className="text-gray-600">{pt.sent24h}</strong></span>}
                  {pt.openRate > 0 && <span>Open Rate: <strong style={{ color: pt.openRate >= 70 ? "#16a34a" : pt.openRate >= 50 ? "#ea580c" : "#ef4444" }}>{pt.openRate}%</strong></span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => { import("sonner").then(m => m.toast.info("Chỉnh sửa cấu hình màn hình...")); }} className="p-1.5 text-gray-300 hover:text-[#990803] cursor-pointer"><Edit className="w-3.5 h-3.5" /></button>
                <div onClick={() => toggleTemplate(pt.id)} className={`w-8 h-4 rounded-full cursor-pointer relative ${pt.enabled ? "bg-[#16a34a]" : "bg-gray-200"}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${pt.enabled ? "left-[18px]" : "left-0.5"}`} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Features Tab ───
function FeaturesTab({ flags: initialFlags }: { flags: FeatureFlag[] }) {
  const [flags, setFlags] = useState(initialFlags);
  const toggleFlag = (id: string) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    const f = flags.find(f => f.id === id);
    import("sonner").then(m => m.toast.success(`Đã ${f?.enabled ? "tắt" : "bật"} ${f?.name}`));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-gray-500" style={{ fontSize: "12px" }}>Bật/tắt tính năng và kiểm soát rollout</p>
        <button onClick={() => { import("sonner").then(m => m.toast.info("Mở form thêm Feature Flag...")); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#990803] text-white rounded-lg cursor-pointer" style={{ fontSize: "11px" }}>
          <Plus className="w-3 h-3" /> Thêm Flag
        </button>
      </div>
      {flags.map(ff => (
        <div key={ff.id} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ff.enabled ? "bg-[#16a34a]/10" : "bg-gray-50"}`}>
              <ToggleLeft className="w-5 h-5" style={{ color: ff.enabled ? "#16a34a" : "#9ca3af" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{ff.name}</h4>
                <span className="font-mono text-gray-300 px-1.5 py-0.5 bg-gray-50 rounded" style={{ fontSize: "9px" }}>{ff.key}</span>
              </div>
              <p className="text-gray-400" style={{ fontSize: "11px" }}>{ff.description}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1">
                  {ff.platforms.map(p => (
                    <span key={p} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded" style={{ fontSize: "8px", fontWeight: 500 }}>
                      {p === "ios" ? "🍎 iOS" : p === "android" ? "🤖 Android" : "🌐 Web"}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400" style={{ fontSize: "10px" }}>Rollout:</span>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${ff.rolloutPercent}%`, backgroundColor: ff.enabled ? "#16a34a" : "#9ca3af" }} />
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: ff.enabled ? "#16a34a" : "#9ca3af" }}>{ff.rolloutPercent}%</span>
                </div>
                <span className="text-gray-300" style={{ fontSize: "9px" }}>Cập nhật: {ff.lastUpdated}</span>
              </div>
            </div>
            <div onClick={() => toggleFlag(ff.id)} className={`w-10 h-5 rounded-full cursor-pointer relative shrink-0 ${ff.enabled ? "bg-[#16a34a]" : "bg-gray-200"}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${ff.enabled ? "left-[22px]" : "left-0.5"}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Appearance Tab ───
function AppearanceTab() {
  return (
    <div className="space-y-3">
      {/* Theme Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Theme & Branding</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Phone Mockup */}
          <div className="flex justify-center">
            <div className="w-48 h-80 bg-gray-900 rounded-[28px] p-2 shadow-xl relative">
              <div className="w-full h-full bg-white rounded-[20px] overflow-hidden flex flex-col">
                {/* Status bar */}
                <div className="h-6 bg-[#990803] flex items-center justify-between px-3">
                  <span className="text-white" style={{ fontSize: "7px" }}>09:41</span>
                  <div className="flex items-center gap-1">
                    <Signal className="w-2 h-2 text-white" />
                    <Wifi className="w-2 h-2 text-white" />
                    <Battery className="w-2 h-2 text-white" />
                  </div>
                </div>
                {/* Header */}
                <div className="bg-[#990803] px-3 py-2">
                  <p className="text-white" style={{ fontSize: "10px", fontWeight: 700 }}>GELEXIMCO LMS</p>
                  <p className="text-white/70" style={{ fontSize: "7px" }}>Xin chào, Nguyễn Văn A</p>
                </div>
                {/* Content */}
                <div className="flex-1 bg-gray-50 p-2 space-y-1.5">
                  <div className="bg-white rounded-lg p-1.5 shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-[#990803]/10" />
                      <span style={{ fontSize: "6px", fontWeight: 600 }}>Lãnh đạo 4.0</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#990803] rounded-full" style={{ width: "65%" }} />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-1.5 shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-[#c8a84e]/10" />
                      <span style={{ fontSize: "6px", fontWeight: 600 }}>Excel VBA</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#c8a84e] rounded-full" style={{ width: "82%" }} />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-1.5 shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-[#16a34a]/10" />
                      <span style={{ fontSize: "6px", fontWeight: 600 }}>ATLĐ Công trường</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#16a34a] rounded-full" style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>
                {/* Bottom nav */}
                <div className="h-8 bg-white border-t border-gray-100 flex items-center justify-around px-2">
                  {["🏠", "📚", "🎯", "🏆", "👤"].map((emoji, i) => (
                    <span key={i} style={{ fontSize: "10px", opacity: i === 0 ? 1 : 0.4 }}>{emoji}</span>
                  ))}
                </div>
              </div>
              {/* Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-900 rounded-b-2xl" />
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-3">
            <div>
              <p className="text-gray-500 mb-1.5" style={{ fontSize: "11px", fontWeight: 600 }}>Màu chủ đạo</p>
              <div className="flex items-center gap-2">
                {[
                  { name: "Đỏ đậm", color: "#990803" },
                  { name: "Vàng gold", color: "#c8a84e" },
                  { name: "Trắng", color: "#ffffff" },
                  { name: "Xám đậm", color: "#1f2937" },
                ].map(c => (
                  <div key={c.name} className="text-center">
                    <div onClick={() => { import("sonner").then(m => m.toast.info(`Chọn màu ${c.name} (${c.color})`)); }} className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm cursor-pointer" style={{ backgroundColor: c.color }} />
                    <p className="text-gray-400 mt-0.5" style={{ fontSize: "8px" }}>{c.name}</p>
                  </div>
                ))}
              </div>
            </div>
            {[
              { label: "App Icon Style", value: "Gradient Red" },
              { label: "Splash Screen", value: "Logo + Slogan" },
              { label: "Font chính", value: "Inter (System default)" },
              { label: "Kích thước chữ", value: "Dynamic Type (Hỗ trợ)" },
              { label: "Bottom Navigation", value: "5 tabs: Home, Courses, Goals, Achievements, Profile" },
              { label: "Animation Style", value: "Subtle (iOS Spring, Android Material)" },
            ].map((cfg, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-gray-500" style={{ fontSize: "11px" }}>{cfg.label}</span>
                <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 500 }}>{cfg.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}