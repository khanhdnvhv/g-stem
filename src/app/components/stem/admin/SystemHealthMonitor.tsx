import { useMemo } from "react";
import {
  Activity, Cpu, HardDrive, Zap, CheckCircle2, AlertTriangle,
  Server, Wifi,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  SYSTEM HEALTH MONITOR                                            */
/* ================================================================ */

interface Service {
  name: string;
  status: "operational" | "degraded" | "down";
  uptime: number;
  latencyMs: number;
  category: string;
}

const SERVICES: Service[] = [
  { name: "API Gateway",        status: "operational", uptime: 99.97, latencyMs: 45,  category: "Core" },
  { name: "Auth Service",       status: "operational", uptime: 99.99, latencyMs: 28,  category: "Core" },
  { name: "Data Lake",          status: "operational", uptime: 99.92, latencyMs: 120, category: "Data" },
  { name: "VNeID Connector",    status: "operational", uptime: 99.85, latencyMs: 180, category: "Integration" },
  { name: "NEdu Connector",     status: "degraded",    uptime: 98.50, latencyMs: 450, category: "Integration" },
  { name: "Notification Queue", status: "operational", uptime: 99.99, latencyMs: 15,  category: "Core" },
  { name: "Storage (S3)",       status: "operational", uptime: 100,   latencyMs: 50,  category: "Data" },
  { name: "AI-Buddy Engine",    status: "operational", uptime: 99.90, latencyMs: 320, category: "AI" },
  { name: "Video CDN",          status: "operational", uptime: 99.96, latencyMs: 65,  category: "Media" },
  { name: "Mobile Push",        status: "operational", uptime: 99.80, latencyMs: 95,  category: "Mobile" },
];

const STATUS_META = {
  operational: { label: "Hoạt động",  color: "#16a34a" },
  degraded:    { label: "Suy giảm",    color: "#f59e0b" },
  down:        { label: "Ngưng",       color: "#dc2626" },
};

export function SystemHealthMonitor() {
  const op = SERVICES.filter((s) => s.status === "operational").length;
  const deg = SERVICES.filter((s) => s.status === "degraded").length;
  const down = SERVICES.filter((s) => s.status === "down").length;

  const cpuData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}h`,
    cpu: 30 + Math.round(Math.sin(i / 2) * 15 + Math.random() * 10),
    memory: 60 + Math.round(Math.cos(i / 3) * 10 + Math.random() * 5),
  }));

  const apiCalls = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}h`,
    calls: 5000 + Math.round(Math.sin((i - 8) / 3) * 3000 + Math.random() * 1000),
  }));

  const avgLatency = Math.round(SERVICES.reduce((s, v) => s + v.latencyMs, 0) / SERVICES.length);
  const avgUptime = (SERVICES.reduce((s, v) => s + v.uptime, 0) / SERVICES.length).toFixed(2);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Activity}
        title="System Health Monitor"
        subtitle="Giám sát hiệu suất, uptime, latency của toàn bộ services trên Geleximco STEM Platform."
        accentColor="#e74c3c"
        actions={
          <button onClick={() => toast.info("Mở Grafana dashboard chi tiết")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Activity className="w-4 h-4" /> Grafana
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={CheckCircle2} label="Services hoạt động" value={`${op}/${SERVICES.length}`} color="#16a34a" />
        <KpiCard icon={AlertTriangle} label="Suy giảm" value={deg} color={deg > 0 ? "#f59e0b" : "#16a34a"} />
        <KpiCard icon={Activity} label="Uptime TB 30 ngày" value={`${avgUptime}%`} color="#7c3aed" />
        <KpiCard icon={Zap} label="Latency TB" value={`${avgLatency}ms`} color="#c8a84e" />
      </div>

      {/* Services list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Services Status</h3>
        </div>
        <table className="w-full">
          <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              <th className="px-4 py-2.5">Service</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Trạng thái</th>
              <th className="px-4 py-2.5 text-right">Uptime (30d)</th>
              <th className="px-4 py-2.5 text-right">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
            {SERVICES.map((s) => {
              const meta = STATUS_META[s.status];
              return (
                <tr key={s.name} className="hover:bg-secondary/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: meta.color }} />
                      <span style={{ fontWeight: 500 }}>{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>{s.category}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded" style={{
                      fontSize: "10.5px", fontWeight: 600,
                      color: meta.color, backgroundColor: meta.color + "15",
                    }}>
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right" style={{ fontWeight: 600 }}>{s.uptime}%</td>
                  <td className="px-4 py-3 text-right" style={{
                    fontWeight: 600,
                    color: s.latencyMs > 300 ? "#dc2626" : s.latencyMs > 150 ? "#f59e0b" : "#16a34a",
                  }}>
                    {s.latencyMs}ms
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CPU/Memory + API calls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Cpu className="w-4 h-4 inline mr-1.5" />
            CPU & Memory (24h)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={cpuData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="cpu" stroke="#e74c3c" strokeWidth={2} name="CPU %" dot={false} />
              <Line type="monotone" dataKey="memory" stroke="#7c3aed" strokeWidth={2} name="Memory %" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Wifi className="w-4 h-4 inline mr-1.5" />
            API calls theo giờ (24h)
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={apiCalls}>
              <defs>
                <linearGradient id="apiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v.toLocaleString()} calls`} />
              <Area type="monotone" dataKey="calls" stroke="#0891b2" fill="url(#apiGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resource */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "CPU toàn cluster", icon: Cpu, used: 42, total: 100, unit: "%" },
          { label: "Storage", icon: HardDrive, used: 12.4, total: 50, unit: "TB" },
          { label: "Bandwidth", icon: Zap, used: 380, total: 1000, unit: "Mbps" },
        ].map((r) => {
          const pct = Math.round((r.used / r.total) * 100);
          return (
            <div key={r.label} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <r.icon className="w-4 h-4 text-[#e74c3c]" />
                <span style={{ fontSize: "12.5px", fontWeight: 600 }}>{r.label}</span>
              </div>
              <p style={{ fontSize: "20px", fontWeight: 700 }}>
                {r.used}/{r.total} {r.unit}
              </p>
              <div className="h-2 bg-secondary rounded-full overflow-hidden mt-2">
                <div className="h-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct > 85 ? "#dc2626" : pct > 65 ? "#f59e0b" : "#16a34a",
                  }} />
              </div>
              <p className="text-muted-foreground mt-1" style={{ fontSize: "11px" }}>{pct}% sử dụng</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SystemHealthMonitor;
