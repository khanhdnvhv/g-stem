import { useState, useEffect } from "react";
import {
  Activity, Server, Cpu, HardDrive, Wifi, Clock,
  CheckCircle, AlertTriangle, XCircle, RefreshCw,
  BarChart3, TrendingUp, Users, Zap, Database,
  Globe, Shield, Eye, Settings, Bell,
  ArrowUp, ArrowDown, Monitor, Gauge,
  MemoryStick, Timer,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface ServiceStatus {
  id: string;
  name: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  uptime: number;
  responseTime: number;
  responseTimeTrend: number[];
  lastIncident: string;
  category: string;
}

interface Incident {
  id: string;
  title: string;
  service: string;
  severity: "critical" | "major" | "minor" | "info";
  status: "resolved" | "investigating" | "monitoring";
  startTime: string;
  endTime: string;
  description: string;
  affectedUsers: number;
}

// ─── Mock Data ───
const SERVICES: ServiceStatus[] = [
  { id: "S01", name: "LMS Web App", status: "operational", uptime: 99.97, responseTime: 128, responseTimeTrend: [135, 128, 142, 125, 130, 128, 122, 135, 128, 140, 132, 128], lastIncident: "28/02/2026", category: "Application" },
  { id: "S02", name: "API Gateway", status: "operational", uptime: 99.99, responseTime: 45, responseTimeTrend: [42, 48, 45, 43, 47, 45, 44, 46, 45, 42, 48, 45], lastIncident: "15/01/2026", category: "Infrastructure" },
  { id: "S03", name: "Database (PostgreSQL)", status: "operational", uptime: 99.98, responseTime: 12, responseTimeTrend: [10, 12, 11, 14, 12, 13, 12, 11, 12, 10, 15, 12], lastIncident: "20/02/2026", category: "Database" },
  { id: "S04", name: "File Storage (S3)", status: "operational", uptime: 99.99, responseTime: 85, responseTimeTrend: [80, 90, 85, 82, 88, 85, 84, 86, 85, 82, 90, 85], lastIncident: "01/01/2026", category: "Storage" },
  { id: "S05", name: "Video Streaming", status: "degraded", uptime: 99.82, responseTime: 320, responseTimeTrend: [180, 195, 200, 220, 250, 280, 310, 290, 300, 320, 315, 320], lastIncident: "12/03/2026", category: "Media" },
  { id: "S06", name: "Email Service", status: "operational", uptime: 99.95, responseTime: 210, responseTimeTrend: [200, 215, 210, 205, 220, 210, 208, 212, 210, 205, 218, 210], lastIncident: "05/03/2026", category: "Communication" },
  { id: "S07", name: "Push Notification", status: "operational", uptime: 99.94, responseTime: 95, responseTimeTrend: [90, 100, 95, 92, 98, 95, 94, 96, 95, 92, 100, 95], lastIncident: "10/03/2026", category: "Communication" },
  { id: "S08", name: "Auth / SSO", status: "operational", uptime: 99.99, responseTime: 35, responseTimeTrend: [30, 35, 32, 38, 35, 34, 36, 35, 33, 35, 38, 35], lastIncident: "01/12/2025", category: "Security" },
  { id: "S09", name: "AI Grading Engine", status: "operational", uptime: 99.90, responseTime: 850, responseTimeTrend: [800, 820, 850, 780, 900, 850, 830, 860, 850, 820, 880, 850], lastIncident: "08/03/2026", category: "AI" },
  { id: "S10", name: "SAP Integration", status: "maintenance", uptime: 99.85, responseTime: 0, responseTimeTrend: [450, 420, 480, 460, 440, 470, 0, 0, 0, 0, 0, 0], lastIncident: "12/03/2026", category: "Integration" },
  { id: "S11", name: "Redis Cache", status: "operational", uptime: 99.99, responseTime: 2, responseTimeTrend: [1, 2, 2, 1, 3, 2, 2, 1, 2, 2, 3, 2], lastIncident: "—", category: "Cache" },
  { id: "S12", name: "CDN", status: "operational", uptime: 99.98, responseTime: 22, responseTimeTrend: [18, 22, 20, 25, 22, 21, 23, 22, 20, 22, 25, 22], lastIncident: "15/02/2026", category: "Infrastructure" },
];

const INCIDENTS: Incident[] = [
  { id: "I01", title: "Video Streaming Latency cao", service: "Video Streaming", severity: "major", status: "investigating", startTime: "12/03/2026 09:30", endTime: "—", description: "Response time tăng >300ms do spike traffic từ 3 đơn vị training đồng thời.", affectedUsers: 450 },
  { id: "I02", title: "SAP Integration Maintenance", service: "SAP Integration", severity: "info", status: "monitoring", startTime: "12/03/2026 08:00", endTime: "12/03/2026 12:00", description: "Bảo trì nâng cấp SAP connector v3.2. Tạm dừng đồng bộ.", affectedUsers: 0 },
  { id: "I03", title: "Push Notification Delay", service: "Push Notification", severity: "minor", status: "resolved", startTime: "10/03/2026 14:00", endTime: "10/03/2026 14:45", description: "Delay 10-15 phút do queue overflow. Đã scale worker.", affectedUsers: 1200 },
  { id: "I04", title: "AI Grading Timeout", service: "AI Grading Engine", severity: "major", status: "resolved", startTime: "08/03/2026 10:00", endTime: "08/03/2026 11:30", description: "Timeout khi chấm batch 200+ bài. Đã tăng timeout và optimize model.", affectedUsers: 85 },
  { id: "I05", title: "Database Connection Pool", service: "Database (PostgreSQL)", severity: "critical", status: "resolved", startTime: "20/02/2026 03:00", endTime: "20/02/2026 03:25", description: "Connection pool exhausted do leaked connections. Hotfix deployed.", affectedUsers: 6610 },
  { id: "I06", title: "Email Delivery Failure", service: "Email Service", severity: "minor", status: "resolved", startTime: "05/03/2026 16:00", endTime: "05/03/2026 16:30", description: "SMTP relay issue. Switched to backup relay.", affectedUsers: 320 },
];

const STATUS_CFG = {
  operational: { label: "Hoạt động", color: "#16a34a", bg: "#16a34a10", icon: CheckCircle },
  degraded: { label: "Suy giảm", color: "#ea580c", bg: "#ea580c10", icon: AlertTriangle },
  outage: { label: "Gián đoạn", color: "#ef4444", bg: "#ef444410", icon: XCircle },
  maintenance: { label: "Bảo trì", color: "#2563eb", bg: "#2563eb10", icon: Settings },
};

const SEV_CFG = {
  critical: { label: "Nghiêm trọng", color: "#ef4444" },
  major: { label: "Cao", color: "#ea580c" },
  minor: { label: "Nhẹ", color: "#c8a84e" },
  info: { label: "Thông tin", color: "#2563eb" },
};

const INC_STATUS_CFG = {
  resolved: { label: "Đã xử lý", color: "#16a34a" },
  investigating: { label: "Đang xử lý", color: "#ef4444" },
  monitoring: { label: "Theo dõi", color: "#2563eb" },
};

export function SystemHealth() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"dashboard" | "services" | "incidents" | "metrics">("dashboard");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  const operational = SERVICES.filter(s => s.status === "operational").length;
  const degraded = SERVICES.filter(s => s.status === "degraded").length;
  const maintenance = SERVICES.filter(s => s.status === "maintenance").length;
  const avgUptime = +(SERVICES.reduce((s, sv) => s + sv.uptime, 0) / SERVICES.length).toFixed(2);
  const avgRT = Math.round(SERVICES.filter(s => s.responseTime > 0).reduce((s, sv) => s + sv.responseTime, 0) / SERVICES.filter(s => s.responseTime > 0).length);
  const activeIncidents = INCIDENTS.filter(i => i.status !== "resolved").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">System Health & Performance</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Giám sát hệ thống, dịch vụ, incidents và metrics realtime
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-600" style={{ fontSize: "11px", fontWeight: 600 }}>Live Monitoring</span>
          </div>
          <button onClick={() => { import("sonner").then(m => m.toast.info("Mở cấu hình Alert Rules...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Bell className="w-4 h-4" /> Alert Rules
          </button>
        </div>
      </div>

      {/* Overall Status Banner */}
      <div className={`rounded-xl p-4 flex items-center gap-3 ${degraded > 0 || maintenance > 0 ? "bg-gradient-to-r from-[#ea580c]/10 to-[#c8a84e]/10 border border-[#ea580c]/20" : "bg-gradient-to-r from-[#16a34a]/10 to-[#16a34a]/5 border border-[#16a34a]/20"}`}>
        {degraded > 0 || maintenance > 0 ? (
          <AlertTriangle className="w-6 h-6 text-[#ea580c]" />
        ) : (
          <CheckCircle className="w-6 h-6 text-[#16a34a]" />
        )}
        <div>
          <p className={degraded > 0 ? "text-[#ea580c]" : "text-[#16a34a]"} style={{ fontSize: "14px", fontWeight: 700 }}>
            {degraded > 0 ? `${degraded} dịch vụ suy giảm` : maintenance > 0 ? `${maintenance} dịch vụ đang bảo trì` : "Tất cả hệ thống hoạt động bình thường"}
          </p>
          <p className="text-gray-500" style={{ fontSize: "11px" }}>
            {operational}/{SERVICES.length} operational • Uptime TB: {avgUptime}% • RT TB: {avgRT}ms • {activeIncidents} incident đang xử lý
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Services OK", value: `${operational}/${SERVICES.length}`, icon: CheckCircle, color: "#16a34a" },
          { label: "Uptime TB", value: `${avgUptime}%`, icon: TrendingUp, color: "#990803" },
          { label: "Response Time TB", value: `${avgRT}ms`, icon: Timer, color: "#2563eb" },
          { label: "Active Incidents", value: activeIncidents, icon: AlertTriangle, color: activeIncidents > 0 ? "#ef4444" : "#16a34a" },
          { label: "CPU Load", value: "42%", icon: Cpu, color: "#7c3aed" },
          { label: "Memory", value: "68%", icon: MemoryStick, color: "#ea580c" },
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
          { id: "dashboard" as const, label: "Dashboard", icon: Monitor },
          { id: "services" as const, label: "Dịch vụ", icon: Server },
          { id: "incidents" as const, label: "Incidents", icon: AlertTriangle },
          { id: "metrics" as const, label: "Metrics", icon: BarChart3 },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <DashboardTab services={SERVICES} incidents={INCIDENTS} tick={tick} />}
      {tab === "services" && <ServicesTab services={SERVICES} />}
      {tab === "incidents" && <IncidentsTab incidents={INCIDENTS} />}
      {tab === "metrics" && <MetricsTab services={SERVICES} tick={tick} />}
    </div>
  );
}

// ─── Dashboard Tab ───
function DashboardTab({ services, incidents, tick }: { services: ServiceStatus[]; incidents: Incident[]; tick: number }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Response Time Sparklines */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Response Time (12 intervals)</h3>
          <div className="space-y-2">
            {services.filter(s => s.responseTime > 0).slice(0, 8).map(svc => {
              const maxRT = Math.max(...svc.responseTimeTrend);
              const minRT = Math.min(...svc.responseTimeTrend.filter(v => v > 0));
              const stCfg = STATUS_CFG[svc.status];
              return (
                <div key={svc.id} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stCfg.color }} />
                  <span className="w-28 text-gray-600 truncate shrink-0" style={{ fontSize: "10px" }}>{svc.name}</span>
                  <svg width="120" height="20" viewBox="0 0 120 20" className="shrink-0">
                    <polyline
                      points={svc.responseTimeTrend.map((v, i) => `${i * (120 / (svc.responseTimeTrend.length - 1))},${maxRT > 0 ? 18 - (v / maxRT) * 16 : 10}`).join(" ")}
                      fill="none" stroke={stCfg.color} strokeWidth="1.5" strokeLinejoin="round"
                    />
                  </svg>
                  <span className="w-12 text-right shrink-0" style={{ fontSize: "10px", fontWeight: 600, color: svc.responseTime > 500 ? "#ef4444" : svc.responseTime > 200 ? "#ea580c" : "#16a34a" }}>{svc.responseTime}ms</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Uptime Grid */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Uptime 30 ngày</h3>
          <UptimeHeatmap services={services} />
        </div>
      </div>

      {/* Active Incidents */}
      {incidents.filter(i => i.status !== "resolved").length > 0 && (
        <div className="bg-white rounded-xl border border-[#ef4444]/20 p-4">
          <h3 className="text-[#ef4444] mb-2 flex items-center gap-1" style={{ fontSize: "13px", fontWeight: 600 }}>
            <AlertTriangle className="w-3.5 h-3.5" /> Active Incidents
          </h3>
          {incidents.filter(i => i.status !== "resolved").map(inc => {
            const sevCfg = SEV_CFG[inc.severity];
            const incStCfg = INC_STATUS_CFG[inc.status];
            return (
              <div key={inc.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg mb-1.5">
                <div className="w-2 h-full min-h-[30px] rounded-full" style={{ backgroundColor: sevCfg.color }} />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{inc.title}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: sevCfg.color, backgroundColor: sevCfg.color + "10" }}>{sevCfg.label}</span>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: incStCfg.color, backgroundColor: incStCfg.color + "10" }}>{incStCfg.label}</span>
                  </div>
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>{inc.service} • Bắt đầu: {inc.startTime}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Server Resources */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Tài nguyên Server (Realtime)</h3>
        <ServerResourceChart tick={tick} />
      </div>
    </div>
  );
}

function UptimeHeatmap({ services }: { services: ServiceStatus[] }) {
  const days = 30;
  const svcs = services.slice(0, 8);
  const cellW = 11, cellH = 14, pL = 95, pT = 18;

  return (
    <svg width="100%" height={pT + svcs.length * (cellH + 2) + 5} viewBox={`0 0 ${pL + days * (cellW + 1) + 10} ${pT + svcs.length * (cellH + 2) + 5}`} preserveAspectRatio="xMidYMid meet">
      {[1, 5, 10, 15, 20, 25, 30].map(d => (
        <text key={d} x={pL + (d - 1) * (cellW + 1) + cellW / 2} y={12} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "6px" }}>D{d}</text>
      ))}
      {svcs.map((svc, si) => {
        const y = pT + si * (cellH + 2);
        return (
          <g key={svc.id}>
            <text x={pL - 5} y={y + cellH / 2 + 1} textAnchor="end" dominantBaseline="central" fill="#374151" style={{ fontSize: "7px" }}>{svc.name.slice(0, 14)}</text>
            {Array.from({ length: days }, (_, di) => {
              // Generate deterministic uptime status per day
              const seed = (svc.id.charCodeAt(1) + di * 7) % 100;
              const isDown = seed < 1;
              const isDegraded = seed < 3 && !isDown;
              const color = isDown ? "#ef4444" : isDegraded ? "#ea580c" : "#16a34a";
              const opacity = isDown ? 0.8 : isDegraded ? 0.6 : 0.3 + (seed / 100) * 0.4;
              return <rect key={di} x={pL + di * (cellW + 1)} y={y} width={cellW} height={cellH} rx="2" fill={color} opacity={opacity} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}

function ServerResourceChart({ tick }: { tick: number }) {
  // Simulated metrics
  const cpuData = Array.from({ length: 20 }, (_, i) => 35 + Math.sin((i + tick) * 0.5) * 12 + Math.random() * 5);
  const memData = Array.from({ length: 20 }, (_, i) => 60 + Math.sin((i + tick) * 0.3) * 8 + Math.random() * 3);
  const diskData = Array.from({ length: 20 }, (_, i) => 45 + i * 0.3);

  const maxVal = 100;
  const W = 520, H = 100, pL = 30, pR = 10, pT = 10, pB = 15;
  const chartW = W - pL - pR;
  const chartH = H - pT - pB;

  function pointsStr(data: number[]) {
    return data.map((v, i) => `${pL + (i / (data.length - 1)) * chartW},${pT + (1 - v / maxVal) * chartH}`).join(" ");
  }

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {[0, 25, 50, 75, 100].map(v => {
        const y = pT + (1 - v / maxVal) * chartH;
        return (
          <g key={v}>
            <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
            <text x={pL - 5} y={y} textAnchor="end" dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "7px" }}>{v}%</text>
          </g>
        );
      })}
      <polyline points={pointsStr(cpuData)} fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinejoin="round" />
      <polyline points={pointsStr(memData)} fill="none" stroke="#ea580c" strokeWidth="1.5" strokeLinejoin="round" />
      <polyline points={pointsStr(diskData)} fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="4 2" />

      <rect x={W - 80} y="5" width="8" height="8" rx="2" fill="#7c3aed" />
      <text x={W - 68} y="12" fill="#6b7280" style={{ fontSize: "7px" }}>CPU</text>
      <rect x={W - 80} y="18" width="8" height="8" rx="2" fill="#ea580c" />
      <text x={W - 68} y="25" fill="#6b7280" style={{ fontSize: "7px" }}>Memory</text>
      <rect x={W - 80} y="31" width="8" height="8" rx="2" fill="#2563eb" />
      <text x={W - 68} y="38" fill="#6b7280" style={{ fontSize: "7px" }}>Disk</text>
    </svg>
  );
}

// ─── Services Tab ───
function ServicesTab({ services }: { services: ServiceStatus[] }) {
  const categories = [...new Set(services.map(s => s.category))];
  return (
    <div className="space-y-3">
      {categories.map(cat => (
        <div key={cat}>
          <h3 className="text-gray-400 uppercase mb-1" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em" }}>{cat}</h3>
          {services.filter(s => s.category === cat).map(svc => {
            const stCfg = STATUS_CFG[svc.status];
            const StIcon = stCfg.icon;
            const rtColor = svc.responseTime > 500 ? "#ef4444" : svc.responseTime > 200 ? "#ea580c" : svc.responseTime > 0 ? "#16a34a" : "#6b7280";
            return (
              <div key={svc.id} className="bg-white rounded-xl border border-gray-200 p-4 mb-1.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stCfg.bg }}>
                    <StIcon className="w-5 h-5" style={{ color: stCfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{svc.name}</h4>
                      <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.bg }}>{stCfg.label}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400" style={{ fontSize: "10px" }}>
                      <span>Uptime: <strong style={{ color: svc.uptime >= 99.9 ? "#16a34a" : "#ea580c" }}>{svc.uptime}%</strong></span>
                      <span>Response: <strong style={{ color: rtColor }}>{svc.responseTime > 0 ? `${svc.responseTime}ms` : "N/A"}</strong></span>
                      <span>Incident cuối: {svc.lastIncident}</span>
                    </div>
                  </div>
                  {/* Mini sparkline */}
                  <svg width="80" height="24" viewBox="0 0 80 24" className="shrink-0">
                    {svc.responseTimeTrend.some(v => v > 0) && (
                      <polyline
                        points={svc.responseTimeTrend.map((v, i) => {
                          const maxV = Math.max(...svc.responseTimeTrend);
                          return `${i * (80 / (svc.responseTimeTrend.length - 1))},${maxV > 0 ? 22 - (v / maxV) * 20 : 12}`;
                        }).join(" ")}
                        fill="none" stroke={stCfg.color} strokeWidth="1.5" strokeLinejoin="round"
                      />
                    )}
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Incidents Tab ───
function IncidentsTab({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="space-y-2">
      <p className="text-gray-500 mb-1" style={{ fontSize: "12px" }}>{incidents.length} incidents • {incidents.filter(i => i.status !== "resolved").length} đang xử lý</p>
      {incidents.map(inc => {
        const sevCfg = SEV_CFG[inc.severity];
        const incStCfg = INC_STATUS_CFG[inc.status];
        return (
          <div key={inc.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-full min-h-[50px] rounded-full shrink-0" style={{ backgroundColor: sevCfg.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{inc.title}</h4>
                  <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: sevCfg.color, backgroundColor: sevCfg.color + "10" }}>{sevCfg.label}</span>
                  <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: incStCfg.color, backgroundColor: incStCfg.color + "10" }}>{incStCfg.label}</span>
                </div>
                <p className="text-gray-500 mb-1" style={{ fontSize: "11px" }}>{inc.description}</p>
                <div className="flex items-center gap-3 text-gray-400" style={{ fontSize: "10px" }}>
                  <span>🔧 {inc.service}</span>
                  <span>⏰ {inc.startTime}</span>
                  <span>→ {inc.endTime}</span>
                  {inc.affectedUsers > 0 && <span>👥 {inc.affectedUsers.toLocaleString()} users ảnh hưởng</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Metrics Tab ───
function MetricsTab({ services, tick }: { services: ServiceStatus[]; tick: number }) {
  // Request volume (simulated)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const reqVolume = hours.map(h => {
    if (h < 6) return 200 + Math.random() * 100;
    if (h < 9) return 800 + (h - 6) * 500;
    if (h < 12) return 2500 + Math.random() * 300;
    if (h < 14) return 2000 + Math.random() * 200;
    if (h < 17) return 2800 + Math.random() * 400;
    if (h < 20) return 1500 - (h - 17) * 300;
    return 400 + Math.random() * 100;
  });
  const maxReq = Math.max(...reqVolume);

  // Error rates
  const errRates = [
    { code: "2xx", count: 45200, pct: 98.2, color: "#16a34a" },
    { code: "3xx", count: 320, pct: 0.7, color: "#2563eb" },
    { code: "4xx", count: 410, pct: 0.9, color: "#c8a84e" },
    { code: "5xx", count: 92, pct: 0.2, color: "#ef4444" },
  ];

  return (
    <div className="space-y-3">
      {/* Request Volume */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Request Volume (24h)</h3>
        <svg width="100%" height="120" viewBox="0 0 580 120" preserveAspectRatio="xMidYMid meet">
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const y = 10 + (1 - r) * 80;
            return (
              <g key={i}>
                <line x1="30" y1={y} x2="560" y2={y} stroke="#f3f4f6" strokeWidth="0.5" />
                <text x="25" y={y} textAnchor="end" dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "7px" }}>{Math.round(maxReq * r)}</text>
              </g>
            );
          })}
          <defs>
            <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#990803" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#990803" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={`30,90 ${reqVolume.map((v, i) => `${30 + (i / 23) * 530},${10 + (1 - v / maxReq) * 80}`).join(" ")} 560,90`}
            fill="url(#reqGrad)"
          />
          <polyline
            points={reqVolume.map((v, i) => `${30 + (i / 23) * 530},${10 + (1 - v / maxReq) * 80}`).join(" ")}
            fill="none" stroke="#990803" strokeWidth="1.5" strokeLinejoin="round"
          />
          {hours.filter(h => h % 3 === 0).map(h => (
            <text key={h} x={30 + (h / 23) * 530} y={105} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "7px" }}>{h}:00</text>
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* HTTP Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>HTTP Status Distribution</h3>
          <div className="space-y-2">
            {errRates.map(er => (
              <div key={er.code} className="flex items-center gap-2">
                <span className="w-8 font-mono" style={{ fontSize: "11px", fontWeight: 700, color: er.color }}>{er.code}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${er.pct}%`, backgroundColor: er.color, opacity: 0.7 }} />
                </div>
                <span className="w-16 text-right text-gray-600" style={{ fontSize: "10px", fontWeight: 500 }}>{er.count.toLocaleString()}</span>
                <span className="w-10 text-right" style={{ fontSize: "10px", fontWeight: 700, color: er.color }}>{er.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Latency Percentiles */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Latency Percentiles (ms)</h3>
          <div className="space-y-2">
            {[
              { label: "p50", value: 85, color: "#16a34a" },
              { label: "p75", value: 145, color: "#c8a84e" },
              { label: "p90", value: 280, color: "#ea580c" },
              { label: "p95", value: 450, color: "#ef4444" },
              { label: "p99", value: 920, color: "#990803" },
            ].map(p => (
              <div key={p.label} className="flex items-center gap-2">
                <span className="w-8 font-mono text-gray-500" style={{ fontSize: "11px", fontWeight: 600 }}>{p.label}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min((p.value / 1000) * 100, 100)}%`, backgroundColor: p.color, opacity: 0.7 }} />
                </div>
                <span className="w-14 text-right" style={{ fontSize: "11px", fontWeight: 700, color: p.color }}>{p.value}ms</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Throughput by Service */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Throughput theo Dịch vụ (req/min)</h3>
        <svg width="100%" height="100" viewBox="0 0 600 100" preserveAspectRatio="xMidYMid meet">
          {[
            { name: "LMS Web", rpm: 450, color: "#990803" },
            { name: "API GW", rpm: 380, color: "#2563eb" },
            { name: "Auth", rpm: 120, color: "#16a34a" },
            { name: "Files", rpm: 85, color: "#7c3aed" },
            { name: "Video", rpm: 65, color: "#ea580c" },
            { name: "AI Engine", rpm: 25, color: "#c8a84e" },
          ].map((s, i) => {
            const x = 10 + i * 95;
            const barH = (s.rpm / 450) * 55;
            return (
              <g key={i}>
                <rect x={x} y={65 - barH} width="70" height={barH} rx="4" fill={s.color} opacity="0.5" />
                <text x={x + 35} y={60 - barH} textAnchor="middle" fill={s.color} style={{ fontSize: "8px", fontWeight: 700 }}>{s.rpm}</text>
                <text x={x + 35} y={78} textAnchor="middle" fill="#6b7280" style={{ fontSize: "7px" }}>{s.name}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}