import { useState, useMemo } from "react";
import {
  ScrollText, Search, Download, User, Shield,
  Edit, Trash2, KeyRound, LogIn, FileText,
} from "lucide-react";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { TenantBadge } from "../ui/badges";
import { formatDateTime, formatRelative } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  AUDIT LOG — nhật ký hệ thống                                    */
/* ================================================================ */

interface LogEntry {
  id: string;
  at: string;
  userId: string;
  userName: string;
  tenantId: string;
  tenantType: "supplier" | "distributor" | "school" | "authority";
  action: "login" | "logout" | "create" | "update" | "delete" | "permission_change" | "license_issue" | "sync" | "export";
  resource: string;
  detail: string;
  ip: string;
  severity: "info" | "warning" | "critical";
}

function generateLogs(): LogEntry[] {
  const actions: LogEntry["action"][] = ["login", "create", "update", "delete", "permission_change", "license_issue", "sync", "export"];
  const resources = [
    "package:PKG-ADV", "order:ORD-2026-0018", "user:U-TCH-03",
    "license:LIC-00042", "tenant:T-SCH-07", "role:school_admin",
    "equipment:EQ-0120", "exam:EX-004", "report:RPT-2026-Q1",
  ];
  const users = [
    { id: "U-SUP-01", name: "Nguyễn Văn Minh", tenantId: "T-SUP-01", tenantType: "supplier" as const },
    { id: "U-DIS-01", name: "Trần Quang Dũng", tenantId: "T-DIS-01", tenantType: "distributor" as const },
    { id: "U-SCH-01", name: "Nguyễn Thị Lan",   tenantId: "T-SCH-01", tenantType: "school" as const },
    { id: "U-SYS-01", name: "Vũ Minh Khang",    tenantId: "T-SUP-01", tenantType: "supplier" as const },
    { id: "U-AUT-01", name: "Đỗ Thu Trang",     tenantId: "T-AUT-01", tenantType: "authority" as const },
  ];

  return Array.from({ length: 40 }, (_, i) => {
    const user = users[i % users.length];
    const action = actions[i % actions.length];
    const severity: LogEntry["severity"] =
      action === "delete" || action === "permission_change" ? "warning" :
      i % 23 === 0 ? "critical" : "info";
    return {
      id: `LOG-${String(i + 1).padStart(6, "0")}`,
      at: new Date(Date.now() - i * 3600_000 * (1 + Math.random())).toISOString(),
      userId: user.id,
      userName: user.name,
      tenantId: user.tenantId,
      tenantType: user.tenantType,
      action,
      resource: resources[i % resources.length],
      detail: `${action} trên ${resources[i % resources.length]}`,
      ip: `192.168.${10 + (i % 20)}.${100 + (i % 155)}`,
      severity,
    };
  });
}

const ACTION_META: Record<LogEntry["action"], { label: string; icon: typeof User; color: string }> = {
  login: { label: "Đăng nhập", icon: LogIn, color: "#0891b2" },
  logout: { label: "Đăng xuất", icon: LogIn, color: "#64748b" },
  create: { label: "Tạo mới", icon: Edit, color: "#16a34a" },
  update: { label: "Cập nhật", icon: Edit, color: "#c8a84e" },
  delete: { label: "Xóa", icon: Trash2, color: "#dc2626" },
  permission_change: { label: "Đổi quyền", icon: Shield, color: "#7c3aed" },
  license_issue: { label: "Phát license", icon: KeyRound, color: "#16a34a" },
  sync: { label: "Đồng bộ", icon: FileText, color: "#2563eb" },
  export: { label: "Xuất dữ liệu", icon: Download, color: "#c8a84e" },
};

const SEVERITY_COLOR: Record<LogEntry["severity"], string> = {
  info: "#64748b",
  warning: "#f59e0b",
  critical: "#dc2626",
};

export function AuditLogAdmin() {
  const [logs] = useState(generateLogs());
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<LogEntry["action"] | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<LogEntry["severity"] | "all">("all");

  const filtered = useMemo(() => logs.filter((l) => {
    if (actionFilter !== "all" && l.action !== actionFilter) return false;
    if (severityFilter !== "all" && l.severity !== severityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!l.userName.toLowerCase().includes(q) && !l.resource.toLowerCase().includes(q) &&
          !l.ip.includes(q)) return false;
    }
    return true;
  }), [logs, actionFilter, severityFilter, search]);

  const critical = logs.filter((l) => l.severity === "critical").length;
  const warning = logs.filter((l) => l.severity === "warning").length;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={ScrollText}
        title="Nhật ký Hệ thống (Audit Log)"
        subtitle="Ghi lại mọi thao tác trên Platform: login, CRUD, permission change, license, sync, export. Lưu 7 năm, không thể xóa."
        accentColor="#e74c3c"
        actions={
          <button onClick={() => toast.success("Xuất log theo dải ngày")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Xuất log
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={ScrollText} label="Log entries (24h)" value={logs.length} color="#e74c3c" />
        <KpiCard icon={Shield} label="Critical" value={critical} color="#dc2626" />
        <KpiCard icon={Shield} label="Warning" value={warning} color="#f59e0b" />
        <KpiCard icon={User} label="Unique users" value={new Set(logs.map((l) => l.userId)).size} color="#0891b2" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm user / resource / IP..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }} />
        </div>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value as any)}
          className="px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả action</option>
          {(Object.keys(ACTION_META) as Array<keyof typeof ACTION_META>).map((a) => (
            <option key={a} value={a}>{ACTION_META[a].label}</option>
          ))}
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as any)}
          className="px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả mức độ</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <tr>
                <th className="px-4 py-2.5">Thời điểm</th>
                <th className="px-4 py-2.5">User</th>
                <th className="px-4 py-2.5">Tenant</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Resource</th>
                <th className="px-4 py-2.5">IP</th>
                <th className="px-4 py-2.5">Mức độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" style={{ fontSize: "12px" }}>
              {filtered.slice(0, 40).map((l) => {
                const aMeta = ACTION_META[l.action];
                const AIcon = aMeta.icon;
                return (
                  <tr key={l.id} className="hover:bg-secondary/50">
                    <td className="px-4 py-2.5 text-muted-foreground font-mono" style={{ fontSize: "11px" }}>
                      <div>{formatDateTime(l.at)}</div>
                      <div className="text-muted-foreground" style={{ fontSize: "10px" }}>{formatRelative(l.at)}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <p style={{ fontWeight: 500 }}>{l.userName}</p>
                      <p className="font-mono text-muted-foreground" style={{ fontSize: "10.5px" }}>{l.userId}</p>
                    </td>
                    <td className="px-4 py-2.5"><TenantBadge type={l.tenantType} size="xs" /></td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded" style={{
                        fontSize: "10.5px", fontWeight: 600,
                        color: aMeta.color, backgroundColor: aMeta.color + "15",
                      }}>
                        <AIcon className="w-3 h-3" />
                        {aMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono" style={{ fontSize: "11px" }}>{l.resource}</td>
                    <td className="px-4 py-2.5 font-mono text-muted-foreground" style={{ fontSize: "11px" }}>{l.ip}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-1.5 py-0.5 rounded uppercase" style={{
                        fontSize: "10px", fontWeight: 700,
                        color: SEVERITY_COLOR[l.severity], backgroundColor: SEVERITY_COLOR[l.severity] + "15",
                      }}>
                        {l.severity}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 40 && (
          <div className="p-3 border-t border-border text-center text-muted-foreground" style={{ fontSize: "12px" }}>
            Hiển thị 40/{filtered.length}. Thu hẹp bộ lọc để xem hết.
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditLogAdmin;
