import { useState } from "react";
import {
  Plug, KeyRound, Webhook, BookOpen, Copy, RefreshCw,
  CheckCircle2, XCircle, Play, Activity, Plus,
} from "lucide-react";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  DEV PORTAL / API GATEWAY — cổng đối tác tích hợp                */
/* ================================================================ */

interface ApiEndpoint {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  category: string;
}

const ENDPOINTS: ApiEndpoint[] = [
  { method: "POST", path: "/api/auth/login",           description: "Xác thực bằng email/password", category: "Auth" },
  { method: "POST", path: "/api/auth/vneid",           description: "OAuth VNeID", category: "Auth" },
  { method: "GET",  path: "/api/packages",             description: "Lấy danh mục gói STEM", category: "Packages" },
  { method: "POST", path: "/api/packages",             description: "Tạo gói STEM mới", category: "Packages" },
  { method: "GET",  path: "/api/orders",               description: "Lấy danh sách đơn hàng", category: "Orders" },
  { method: "POST", path: "/api/orders",               description: "Tạo đơn hàng mới", category: "Orders" },
  { method: "PATCH", path: "/api/orders/:id/status",   description: "Cập nhật trạng thái đơn hàng", category: "Orders" },
  { method: "GET",  path: "/api/equipment",            description: "Lấy danh sách thiết bị", category: "Equipment" },
  { method: "POST", path: "/api/warranty-tickets",     description: "Tạo ticket bảo hành", category: "Warranty" },
  { method: "POST", path: "/api/licenses/distribute",  description: "Phân bổ license", category: "Licenses" },
  { method: "POST", path: "/api/data-sync/nedu",       description: "Sync CSDL ngành GD", category: "Data Sync" },
  { method: "POST", path: "/api/data-sync/vneid",      description: "Sync VNeID", category: "Data Sync" },
  { method: "POST", path: "/api/reports/ministry/export", description: "Xuất báo cáo Bộ GD&ĐT", category: "Reports" },
];

const WEBHOOKS = [
  { event: "order.created",          description: "Khi đơn hàng mới được tạo" },
  { event: "order.status_changed",   description: "Khi trạng thái đơn hàng thay đổi" },
  { event: "warranty.created",       description: "Khi ticket bảo hành mới" },
  { event: "warranty.resolved",      description: "Khi ticket được xử lý xong" },
  { event: "license.distributed",    description: "Khi license được phát" },
  { event: "license.revoked",        description: "Khi license bị thu hồi" },
  { event: "data-sync.completed",    description: "Khi phiên sync hoàn tất" },
];

const METHOD_COLOR: Record<ApiEndpoint["method"], string> = {
  GET:    "#16a34a",
  POST:   "#2563eb",
  PATCH:  "#c8a84e",
  DELETE: "#dc2626",
};

const API_KEYS = [
  { id: "AK-01", label: "Production — Geleximco STEM Core",  key: "gstem_prod_a8f2c4...d91e", lastUsed: "2 phút trước", calls24h: 147203, active: true },
  { id: "AK-02", label: "Đại lý Giáo dục ABC",                 key: "gstem_abc_29f8e1...b4a7",  lastUsed: "15 phút trước", calls24h: 48127, active: true },
  { id: "AK-03", label: "Sở GD&ĐT Hà Nội — Data Sync",         key: "gstem_hn_c4d8e6...f21a",   lastUsed: "1 giờ trước",  calls24h: 2103, active: true },
  { id: "AK-04", label: "ERP Internal Bridge",                  key: "gstem_erp_88a2f9...c3e5",  lastUsed: "3 ngày trước", calls24h: 0, active: false },
];

export function DevPortal() {
  const [tab, setTab] = useState<"endpoints" | "keys" | "webhooks" | "docs">("endpoints");
  const categories = Array.from(new Set(ENDPOINTS.map((e) => e.category)));

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Plug}
        title="Dev Portal — API Gateway"
        subtitle="Cổng giao tiếp mở cho đối tác tích hợp. Quản lý API keys, rate limits, webhooks và tài liệu OpenAPI."
        accentColor="#e74c3c"
        actions={
          <button onClick={() => toast.success("Tạo API key mới cho đối tác")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#e74c3c] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Tạo API key
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Plug} label="API endpoints" value={ENDPOINTS.length} color="#e74c3c" />
        <KpiCard icon={KeyRound} label="API keys active" value={API_KEYS.filter((k) => k.active).length} color="#16a34a" />
        <KpiCard icon={Activity} label="API calls/24h" value="284k" color="#2563eb" change="+12%" trend="up" />
        <KpiCard icon={Webhook} label="Webhook events" value={WEBHOOKS.length} color="#7c3aed" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 overflow-x-auto">
        {[
          { id: "endpoints", label: "Endpoints", icon: Plug },
          { id: "keys", label: "API Keys", icon: KeyRound },
          { id: "webhooks", label: "Webhooks", icon: Webhook },
          { id: "docs", label: "OpenAPI docs", icon: BookOpen },
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

      {tab === "endpoints" && (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 bg-secondary/40 border-b border-border">
                <span style={{ fontSize: "12.5px", fontWeight: 700 }}>{cat}</span>
              </div>
              <div className="divide-y divide-border">
                {ENDPOINTS.filter((e) => e.category === cat).map((e) => (
                  <div key={e.path} className="p-3 flex items-center gap-3 hover:bg-secondary/30">
                    <span className="px-2 py-0.5 rounded text-white shrink-0 font-mono" style={{
                      fontSize: "10px", fontWeight: 700,
                      backgroundColor: METHOD_COLOR[e.method],
                    }}>{e.method}</span>
                    <code style={{ fontSize: "12.5px", fontWeight: 500 }}>{e.path}</code>
                    <span className="text-muted-foreground flex-1" style={{ fontSize: "11.5px" }}>{e.description}</span>
                    <button onClick={() => toast.info(`Test endpoint ${e.method} ${e.path}`)}
                      className="p-1.5 hover:bg-secondary rounded" title="Thử nghiệm">
                      <Play className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "keys" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <tr>
                <th className="px-4 py-2.5">Nhãn</th>
                <th className="px-4 py-2.5">API Key</th>
                <th className="px-4 py-2.5">Calls 24h</th>
                <th className="px-4 py-2.5">Dùng gần nhất</th>
                <th className="px-4 py-2.5">Trạng thái</th>
                <th className="px-4 py-2.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
              {API_KEYS.map((k) => (
                <tr key={k.id} className="hover:bg-secondary/50">
                  <td className="px-4 py-3" style={{ fontWeight: 500 }}>{k.label}</td>
                  <td className="px-4 py-3 font-mono" style={{ fontSize: "11px" }}>
                    <span className="mr-2">{k.key}</span>
                    <button onClick={() => { navigator.clipboard?.writeText(k.key); toast.success("Đã copy"); }}
                      className="opacity-60 hover:opacity-100">
                      <Copy className="w-3 h-3 inline" />
                    </button>
                  </td>
                  <td className="px-4 py-3" style={{ fontWeight: 600 }}>{k.calls24h.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>{k.lastUsed}</td>
                  <td className="px-4 py-3">
                    {k.active ? (
                      <span className="inline-flex items-center gap-1 text-[#16a34a]" style={{ fontSize: "11px", fontWeight: 600 }}>
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                        <XCircle className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => toast.info(`Rotate key ${k.label}`)}
                      className="p-1.5 hover:bg-secondary rounded" title="Rotate">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "webhooks" && (
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {WEBHOOKS.map((w) => (
            <div key={w.event} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#7c3aed]/15 flex items-center justify-center shrink-0">
                <Webhook className="w-5 h-5 text-[#7c3aed]" />
              </div>
              <div className="flex-1">
                <code style={{ fontSize: "12.5px", fontWeight: 700 }}>{w.event}</code>
                <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>{w.description}</p>
              </div>
              <button onClick={() => toast.info(`Cấu hình webhook ${w.event}`)}
                className="px-3 py-1.5 border border-border rounded hover:bg-secondary"
                style={{ fontSize: "11.5px", fontWeight: 500 }}>
                Cấu hình
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "docs" && (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-[#e74c3c] mb-3" />
          <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Tài liệu OpenAPI 3.0</h3>
          <p className="text-muted-foreground mt-2" style={{ fontSize: "13px" }}>
            Tài liệu đầy đủ 14 endpoint + schema + authentication flow.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button onClick={() => toast.info("Mở Swagger UI")}
              className="px-4 py-2 bg-[#e74c3c] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              Mở Swagger UI
            </button>
            <button onClick={() => toast.info("Tải openapi.yaml")}
              className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              Tải openapi.yaml
            </button>
          </div>
        </div>
      )}

      {/* Rate limits */}
      <div className="bg-gradient-to-br from-[#e74c3c]/5 to-[#c8a84e]/5 rounded-xl border border-border p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>RATE LIMIT · READ</p>
          <p style={{ fontSize: "18px", fontWeight: 700 }}>600 req/min</p>
        </div>
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>RATE LIMIT · WRITE</p>
          <p style={{ fontSize: "18px", fontWeight: 700 }}>120 req/min</p>
        </div>
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>RATE LIMIT · BULK / EXPORT</p>
          <p style={{ fontSize: "18px", fontWeight: 700 }}>10 req/min</p>
        </div>
      </div>
    </div>
  );
}

export default DevPortal;
