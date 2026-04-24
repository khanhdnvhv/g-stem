import { useState } from "react";
import {
  IdCard, Search, AlertTriangle, Eye, Download, ArrowRight,
} from "lucide-react";
import { tenants } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { TenantBadge } from "../ui/badges";
import { formatDateTime, formatRelative } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  CROSS-TENANT ACCESS LOG                                         */
/*  Nhật ký truy cập chéo giữa các tenant — tracking anomaly         */
/* ================================================================ */

interface CrossLog {
  id: string;
  at: string;
  userId: string;
  userName: string;
  fromTenantId: string;
  toTenantId: string;
  purpose: "read" | "write" | "admin_override" | "delegation";
  resource: string;
  ip: string;
  flagged: boolean;
}

function generateCrossLogs(): CrossLog[] {
  const users = [
    { id: "U-SYS-01", name: "Vũ Minh Khang" },
    { id: "U-SUP-01", name: "Nguyễn Văn Minh" },
    { id: "U-SUP-02", name: "Phạm Thị Hương" },
    { id: "U-AUT-01", name: "Đỗ Thu Trang" },
  ];
  const purposes: CrossLog["purpose"][] = ["read", "write", "admin_override", "delegation"];
  const resources = [
    "tenant:T-SCH-03/equipment", "tenant:T-SCH-07/licenses",
    "tenant:T-DIS-01/orders", "tenant:T-AUT-01/reports",
  ];

  return Array.from({ length: 18 }, (_, i) => {
    const u = users[i % users.length];
    const from = tenants[i % tenants.length];
    const to = tenants[(i + 3) % tenants.length];
    const purpose = purposes[i % purposes.length];
    return {
      id: `XTL-${String(i + 1).padStart(5, "0")}`,
      at: new Date(Date.now() - i * 86400_000 / 3).toISOString(),
      userId: u.id,
      userName: u.name,
      fromTenantId: from.id,
      toTenantId: to.id,
      purpose,
      resource: resources[i % resources.length],
      ip: `192.168.10.${100 + i}`,
      flagged: i % 7 === 0 || purpose === "admin_override",
    };
  });
}

const PURPOSE_META: Record<CrossLog["purpose"], { label: string; color: string }> = {
  read:            { label: "Chỉ đọc",        color: "#64748b" },
  write:           { label: "Ghi dữ liệu",     color: "#f59e0b" },
  admin_override:  { label: "Admin Override", color: "#dc2626" },
  delegation:      { label: "Ủy quyền",        color: "#7c3aed" },
};

export function CrossTenantAccessLog() {
  const [logs] = useState(generateCrossLogs());
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = logs.filter((l) => {
    if (showFlaggedOnly && !l.flagged) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!l.userName.toLowerCase().includes(q) && !l.resource.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const flaggedCount = logs.filter((l) => l.flagged).length;
  const uniqueUsers = new Set(logs.map((l) => l.userId)).size;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={IdCard}
        title="Nhật ký Truy cập Chéo tenant"
        subtitle="Theo dõi mọi thao tác vượt biên tenant — System Admin truy cập dữ liệu tenant khác, ủy quyền, override."
        accentColor="#e74c3c"
        actions={
          <button onClick={() => toast.success("Xuất nhật ký cross-tenant cho kiểm toán")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Xuất kiểm toán
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={IdCard} label="Truy cập chéo (30d)" value={logs.length} color="#e74c3c" />
        <KpiCard icon={AlertTriangle} label="Gắn cờ nghi vấn" value={flaggedCount} color="#dc2626" trend={flaggedCount > 3 ? "up" : "flat"} />
        <KpiCard icon={Eye} label="Users có cross access" value={uniqueUsers} color="#7c3aed" />
        <KpiCard icon={ArrowRight} label="Admin Override" value={logs.filter((l) => l.purpose === "admin_override").length} color="#dc2626" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm user / resource..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }} />
        </div>
        <label className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
          <input type="checkbox" checked={showFlaggedOnly} onChange={(e) => setShowFlaggedOnly(e.target.checked)}
            className="accent-[#dc2626]" />
          <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626]" />
          Chỉ hiển thị đã gắn cờ
        </label>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              <th className="px-4 py-2.5">Thời điểm</th>
              <th className="px-4 py-2.5">User</th>
              <th className="px-4 py-2.5">Từ tenant</th>
              <th className="px-4 py-2.5">→ Đến tenant</th>
              <th className="px-4 py-2.5">Mục đích</th>
              <th className="px-4 py-2.5">Resource</th>
              <th className="px-4 py-2.5">Cờ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border" style={{ fontSize: "12px" }}>
            {filtered.map((l) => {
              const from = tenants.find((t) => t.id === l.fromTenantId);
              const to = tenants.find((t) => t.id === l.toTenantId);
              const pMeta = PURPOSE_META[l.purpose];
              return (
                <tr key={l.id} className={`hover:bg-secondary/50 ${l.flagged ? "bg-[#dc2626]/5" : ""}`}>
                  <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px" }}>
                    <div>{formatDateTime(l.at)}</div>
                    <div style={{ fontSize: "10px" }}>{formatRelative(l.at)}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <p style={{ fontWeight: 500 }}>{l.userName}</p>
                    <p className="font-mono text-muted-foreground" style={{ fontSize: "10.5px" }}>{l.userId}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {from && <TenantBadge type={from.type} size="xs" />}
                      <span className="truncate max-w-[120px]" style={{ fontSize: "11.5px" }}>{from?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      {to && <TenantBadge type={to.type} size="xs" />}
                      <span className="truncate max-w-[120px]" style={{ fontSize: "11.5px" }}>{to?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-1.5 py-0.5 rounded" style={{
                      fontSize: "10.5px", fontWeight: 600,
                      color: pMeta.color, backgroundColor: pMeta.color + "15",
                    }}>
                      {pMeta.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono" style={{ fontSize: "11px" }}>{l.resource}</td>
                  <td className="px-4 py-2.5">
                    {l.flagged && (
                      <span className="inline-flex items-center gap-0.5 text-[#dc2626]" style={{ fontSize: "11px", fontWeight: 600 }}>
                        <AlertTriangle className="w-3 h-3" /> Cờ
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CrossTenantAccessLog;
