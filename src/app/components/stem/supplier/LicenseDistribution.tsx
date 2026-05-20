import { useState } from "react";
import { useNavigate } from "react-router";
import {
  KeyRound, Search, Download, Plus, X, RefreshCw,
  CheckCircle2, AlertTriangle, Copy, Ban, Info, FileText,
} from "lucide-react";
import { tenants } from "../../mock-data/index";
import type { License, LicenseType } from "../../mock-data/index";
import { deriveLicenseStatus } from "../../mock-data/licenses";
import { PageHeader } from "../ui/PageHeader";
import { TenantBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { formatRelative } from "../ui/format";
import { toast } from "@/app/lib/toast";
import { useOperations } from "@/app/lib/OperationsContext";

/* ================================================================ */
/*  LICENSE DISTRIBUTION — phát/gia hạn/thu hồi license (store)      */
/* ================================================================ */

function tenantName(id: string) { return tenants.find((t) => t.id === id)?.name || id; }
function tenantType(id: string) { return tenants.find((t) => t.id === id)?.type; }

const LICENSE_TYPE_LABEL: Record<LicenseType, string> = {
  per_user: "Per user", per_device: "Per device", site: "Site",
};

/* ── Dialog cấp license — chọn hợp đồng active ── */
function IssueLicenseDialog({ onClose, onIssue }: {
  onClose: () => void;
  onIssue: (contractId: string) => void;
}) {
  const { contracts } = useOperations();
  const [contractId, setContractId] = useState("");
  const activeContracts = contracts.filter((c) => c.status === "active");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
          <KeyRound className="w-5 h-5 text-[#990803]" />
          <h2 className="flex-1" style={{ fontSize: "15px", fontWeight: 700 }}>Phát License theo hợp đồng</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-muted-foreground" style={{ fontSize: "12.5px", lineHeight: 1.5 }}>
            Chọn hợp đồng đang hiệu lực — hệ thống sinh license tự động theo phần mềm trong gói (bán tự động).
          </p>
          {activeContracts.length === 0 ? (
            <p className="text-orange-500 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg" style={{ fontSize: "12px" }}>
              Chưa có hợp đồng nào ở trạng thái "Đang hiệu lực".
            </p>
          ) : (
            <select value={contractId} onChange={(e) => setContractId(e.target.value)}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "13px" }}>
              <option value="">-- Chọn hợp đồng --</option>
              {activeContracts.map((c) => (
                <option key={c.id} value={c.id}>{c.contractNo} · {tenantName(c.schoolId)}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border bg-secondary/20">
          <button onClick={onClose}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary" style={{ fontSize: "12.5px" }}>
            Hủy
          </button>
          <button onClick={() => contractId && onIssue(contractId)} disabled={!contractId}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] disabled:opacity-40"
            style={{ fontSize: "12.5px", fontWeight: 600 }}>
            <KeyRound className="w-3.5 h-3.5" /> Cấp license
          </button>
        </div>
      </div>
    </div>
  );
}

function LicenseRow({ lic, onRenew, onRevoke, onGotoContract }: {
  lic: License;
  onRenew: (l: License) => void;
  onRevoke: (l: License) => void;
  onGotoContract: (contractId: string) => void;
}) {
  const t = tenants.find((t) => t.id === lic.tenantId);
  const st = lic.status ?? deriveLicenseStatus(lic);
  const isRevoked = st === "revoked";
  const seatsUsagePct = lic.seats > 0 ? Math.round((lic.seatsUsed / lic.seats) * 100) : 0;

  return (
    <tr className="hover:bg-secondary/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="font-mono" style={{ fontSize: "11.5px", fontWeight: 600 }}>{lic.licenseKey}</span>
          <button onClick={() => { navigator.clipboard?.writeText(lic.licenseKey); toast.success("Đã copy license key"); }}
            className="opacity-60 hover:opacity-100" title="Copy">
            <Copy className="w-3 h-3" />
          </button>
        </div>
        {lic.contractId && (
          <button onClick={() => onGotoContract(lic.contractId!)}
            className="flex items-center gap-0.5 text-[#0891b2] hover:underline mt-0.5" style={{ fontSize: "10px" }}>
            <FileText className="w-2.5 h-2.5" /> {lic.contractId}
          </button>
        )}
      </td>
      <td className="px-4 py-3" style={{ fontSize: "12.5px", fontWeight: 500 }}>{lic.productName}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {t && <TenantBadge type={t.type} size="xs" />}
          <span className="truncate max-w-[180px]" style={{ fontSize: "12px" }}>{tenantName(lic.tenantId)}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", fontWeight: 600, color: "#0891b2", backgroundColor: "#0891b215" }}>
          {LICENSE_TYPE_LABEL[lic.type]}
        </span>
      </td>
      <td className="px-4 py-3">
        {lic.seats > 0 ? (
          <div>
            <p style={{ fontSize: "12px", fontWeight: 500 }}>{lic.seatsUsed}/{lic.seats}</p>
            <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden mt-0.5">
              <div className="h-full" style={{
                width: `${seatsUsagePct}%`,
                backgroundColor: seatsUsagePct > 90 ? "#dc2626" : seatsUsagePct > 70 ? "#f59e0b" : "#16a34a",
              }} />
            </div>
          </div>
        ) : <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Không giới hạn</span>}
      </td>
      <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>
        {formatRelative(lic.expiresAt)}
      </td>
      <td className="px-4 py-3">
        {isRevoked ? (
          <span className="inline-flex items-center gap-1 text-[#dc2626]" style={{ fontSize: "11px", fontWeight: 600 }}>
            <Ban className="w-3 h-3" /> Đã thu hồi
          </span>
        ) : st === "expired" ? (
          <span className="inline-flex items-center gap-1 text-[#dc2626]" style={{ fontSize: "11px", fontWeight: 600 }}>
            <AlertTriangle className="w-3 h-3" /> Hết hạn
          </span>
        ) : st === "expiring" ? (
          <span className="inline-flex items-center gap-1 text-[#f59e0b]" style={{ fontSize: "11px", fontWeight: 600 }}>
            <AlertTriangle className="w-3 h-3" /> Sắp hết hạn
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[#16a34a]" style={{ fontSize: "11px", fontWeight: 600 }}>
            <CheckCircle2 className="w-3 h-3" /> Hoạt động
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={() => onRenew(lic)}
          className="p-1.5 hover:bg-secondary rounded" title="Gia hạn">
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        {!isRevoked && (
          <button onClick={() => onRevoke(lic)}
            className="p-1.5 hover:bg-secondary rounded ml-1" title="Thu hồi">
            <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        )}
      </td>
    </tr>
  );
}

export function LicenseDistribution() {
  const navigate = useNavigate();
  const { licenses, issueLicensesForContract, renewLicense, revokeLicense } = useOperations();

  const [search, setSearch] = useState("");
  const [tenantTypeFilter, setTenantTypeFilter] = useState<"all" | "school" | "distributor">("all");
  const [issueOpen, setIssueOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<License | null>(null);

  const filtered = licenses.filter((l) => {
    if (tenantTypeFilter !== "all" && tenantType(l.tenantId) !== tenantTypeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !l.licenseKey.toLowerCase().includes(s) &&
        !l.productName.toLowerCase().includes(s) &&
        !tenantName(l.tenantId).toLowerCase().includes(s)
      ) return false;
    }
    return true;
  });

  const statusOf = (l: License) => l.status ?? deriveLicenseStatus(l);
  const active = licenses.filter((l) => statusOf(l) !== "revoked").length;
  const totalSeats = licenses.reduce((s, l) => s + l.seats, 0);
  const usedSeats = licenses.reduce((s, l) => s + l.seatsUsed, 0);
  const expiringSoon = licenses.filter((l) => statusOf(l) === "expiring").length;
  const revokedCount = licenses.filter((l) => statusOf(l) === "revoked").length;

  /* Handlers */
  const handleIssue = (contractId: string) => {
    const issued = issueLicensesForContract(contractId);
    if (issued.length === 0) toast.error("Hợp đồng không có phần mềm để cấp license");
    else toast.success(`Đã cấp ${issued.length} license`);
    setIssueOpen(false);
  };
  const handleRenew = (l: License) => { renewLicense(l.id); toast.success(`Đã gia hạn ${l.licenseKey} thêm 1 năm`); };
  const handleRevoke = () => {
    if (!revokeTarget) return;
    revokeLicense(revokeTarget.id, "Thu hồi thủ công");
    toast.info(`Đã thu hồi ${revokeTarget.licenseKey}`);
    setRevokeTarget(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={KeyRound}
        title="Phát & Thu hồi License"
        subtitle="Phân bổ giấy phép phần mềm theo hợp đồng; quản lý vòng đời license."
        actions={
          <>
            <button onClick={() => setIssueOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602]"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Phát license
            </button>
            <button onClick={() => toast.info("Xuất danh sách license đang hoạt động")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
          </>
        }
      />

      <div className="flex items-start gap-2.5 p-3 bg-[#0891b2]/8 border border-[#0891b2]/25 rounded-lg">
        <Info className="w-4 h-4 text-[#0891b2] shrink-0 mt-0.5" />
        <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
          <strong className="text-foreground">V1 — BR-04:</strong> Nền tảng chỉ hỗ trợ loại license <strong>Per user</strong>.
          License được cấp <strong>bán tự động</strong> theo phần mềm trong gói của hợp đồng.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={KeyRound} label="License đang hoạt động" value={active.toLocaleString()} color="#16a34a" />
        <KpiCard icon={CheckCircle2} label="Seats đã sử dụng" value={`${usedSeats}/${totalSeats}`} color="#0891b2"
          subtitle={`${totalSeats > 0 ? Math.round((usedSeats / totalSeats) * 100) : 0}% utilization`} />
        <KpiCard icon={AlertTriangle} label="Sắp hết hạn (≤ 90 ngày)" value={expiringSoon} color="#f59e0b" />
        <KpiCard icon={Ban} label="Đã thu hồi" value={revokedCount} color="#64748b" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm license key / sản phẩm / tenant..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none" style={{ fontSize: "13px" }} />
        </div>
        {(["all", "school", "distributor"] as const).map((k) => (
          <button key={k} onClick={() => setTenantTypeFilter(k)}
            className={`px-3 py-2 rounded-lg border ${tenantTypeFilter === k ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
            style={{ fontSize: "12px", fontWeight: 500 }}>
            {k === "all" ? "Tất cả" : k === "school" ? "Trường" : "Đại lý"}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <tr>
                <th className="px-4 py-2.5">License key</th>
                <th className="px-4 py-2.5">Sản phẩm</th>
                <th className="px-4 py-2.5">Tenant</th>
                <th className="px-4 py-2.5">Loại</th>
                <th className="px-4 py-2.5">Seats</th>
                <th className="px-4 py-2.5">Hết hạn</th>
                <th className="px-4 py-2.5">Trạng thái</th>
                <th className="px-4 py-2.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.slice(0, 40).map((lic) => (
                <LicenseRow key={lic.id} lic={lic}
                  onRenew={handleRenew}
                  onRevoke={(l) => setRevokeTarget(l)}
                  onGotoContract={(cid) => navigate(`/supplier/contracts/${cid}`)}
                />
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 40 && (
          <div className="p-3 border-t border-border text-center text-muted-foreground" style={{ fontSize: "12px" }}>
            Hiển thị 40/{filtered.length}. Lọc thêm để thu hẹp kết quả.
          </div>
        )}
      </div>

      {issueOpen && (
        <IssueLicenseDialog onClose={() => setIssueOpen(false)} onIssue={handleIssue} />
      )}

      <ConfirmDialog
        open={!!revokeTarget}
        variant="danger"
        title="Thu hồi License"
        message="License sẽ bị thu hồi — phần mềm liên quan ngừng kích hoạt. Có thể gia hạn lại sau."
        itemName={revokeTarget ? `${revokeTarget.productName} · ${revokeTarget.licenseKey}` : undefined}
        confirmLabel="Thu hồi"
        onConfirm={handleRevoke}
        onClose={() => setRevokeTarget(null)}
      />
    </div>
  );
}

export default LicenseDistribution;
