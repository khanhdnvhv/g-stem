import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  FileText, ArrowLeft, CheckCircle2, Clock, AlertTriangle,
  Download, Paperclip, Building2, Handshake, KeyRound,
  DollarSign, CalendarDays, ListChecks, Receipt, X, PenLine,
  PlayCircle, Ban,
} from "lucide-react";
import { tenants } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { TenantBadge } from "../ui/badges";
import { formatRelative, formatVND } from "../ui/format";
import { toast } from "@/app/lib/toast";
import { useOperations } from "@/app/lib/OperationsContext";
import { deriveLicenseStatus } from "../../mock-data/licenses";

/* ================================================================ */
/*  SUPPLIER CONTRACT DETAIL — Chi tiết Hợp đồng (store-driven)      */
/* ================================================================ */

const STATUS_META = {
  draft:      { label: "Bản nháp",        color: "#64748b" },
  signed:     { label: "Đã ký",           color: "#0891b2" },
  active:     { label: "Đang hiệu lực",   color: "#16a34a" },
  expired:    { label: "Hết hạn",         color: "#f59e0b" },
  terminated: { label: "Đã kết thúc",     color: "#dc2626" },
};

function tenantName(id: string) { return tenants.find((t) => t.id === id)?.name ?? id; }
function tenantType(id: string) { return tenants.find((t) => t.id === id)?.type; }

/* ── Dialog chấm dứt hợp đồng ── */
function TerminateDialog({ onClose, onConfirm }: {
  onClose: () => void; onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const valid = reason.trim().length >= 10;
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border">
          <h2 style={{ fontSize: "15px", fontWeight: 700 }}>Chấm dứt hợp đồng</h2>
        </div>
        <div className="px-5 py-4 space-y-2">
          <p className="text-muted-foreground" style={{ fontSize: "12.5px" }}>
            Hợp đồng sẽ chuyển "Đã kết thúc". License/bảo hành liên quan cần được rà soát.
          </p>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            placeholder="Lý do chấm dứt hợp đồng..."
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none resize-none"
            style={{ fontSize: "12.5px" }} />
          {reason.length > 0 && !valid && (
            <p className="text-orange-500" style={{ fontSize: "11px" }}>Lý do tối thiểu 10 ký tự</p>
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border bg-secondary/20">
          <button onClick={onClose}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary" style={{ fontSize: "12.5px" }}>
            Hủy
          </button>
          <button onClick={() => valid && onConfirm(reason.trim())} disabled={!valid}
            className="px-4 py-1.5 bg-destructive text-white rounded-lg hover:opacity-90 disabled:opacity-40"
            style={{ fontSize: "12.5px", fontWeight: 600 }}>
            Xác nhận chấm dứt
          </button>
        </div>
      </div>
    </div>
  );
}

export function SupplierContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    contracts, orders, licenses,
    signContract, activateContract, terminateContract,
    completeMilestone, issueLicensesForContract,
  } = useOperations();

  const [terminateOpen, setTerminateOpen] = useState(false);

  const contract = contracts.find((c) => c.id === id);

  if (!contract) {
    return (
      <div className="p-10 text-center space-y-3">
        <p className="text-muted-foreground">Không tìm thấy hợp đồng <strong>{id}</strong>.</p>
        <Link to="/supplier/contracts" className="text-[#990803] underline" style={{ fontSize: "13px" }}>
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const meta = STATUS_META[contract.status];
  const relatedOrders = orders.filter((o) => o.contractId === contract.id);
  const contractLicenses = licenses.filter((l) => l.contractId === contract.id);
  const doneMilestones = contract.milestones.filter((m) => m.done).length;

  /* Handlers */
  const handleSign = () => { signContract(contract.id); toast.success("Đã ký hợp đồng"); };
  const handleActivate = () => { activateContract(contract.id); toast.success("Hợp đồng đã có hiệu lực"); };
  const handleTerminate = (reason: string) => {
    terminateContract(contract.id, reason);
    toast.info("Đã chấm dứt hợp đồng");
    setTerminateOpen(false);
  };
  const handleIssueLicenses = () => {
    const issued = issueLicensesForContract(contract.id);
    if (issued.length === 0) {
      toast.error("Gói trong hợp đồng không có phần mềm để cấp license");
    } else {
      toast.success(`Đã cấp ${issued.length} license cho ${tenantName(contract.schoolId)}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2" style={{ fontSize: "12px" }}>
        <Link to="/supplier/contracts"
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-3.5 h-3.5" /> Danh sách Hợp đồng
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-mono text-foreground">{contract.contractNo}</span>
      </div>

      <PageHeader
        icon={FileText}
        title={contract.contractNo}
        subtitle={`${contract.signedAt ? "Ký " + formatRelative(contract.signedAt) : "Chưa ký"} · Giá trị ${formatVND(contract.totalVND)}`}
        accentColor="#990803"
        badge={
          <span className="px-2 py-0.5 rounded text-xs font-semibold"
            style={{ color: meta.color, backgroundColor: meta.color + "20" }}>
            {meta.label}
          </span>
        }
        actions={
          <>
            {contract.status === "draft" && (
              <button onClick={handleSign}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#0891b2] text-white rounded-lg hover:opacity-90"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <PenLine className="w-4 h-4" /> Ký hợp đồng
              </button>
            )}
            {contract.status === "signed" && (
              <button onClick={handleActivate}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#16a34a] text-white rounded-lg hover:bg-[#15803d]"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <PlayCircle className="w-4 h-4" /> Kích hoạt
              </button>
            )}
            {(contract.status === "signed" || contract.status === "active") && (
              <button onClick={() => setTerminateOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary text-muted-foreground"
                style={{ fontSize: "13px" }}>
                <Ban className="w-3.5 h-3.5" /> Chấm dứt
              </button>
            )}
            <button onClick={() => toast.info("Tải xuống hợp đồng PDF")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Tải PDF
            </button>
          </>
        }
      />

      {/* Banner lý do chấm dứt */}
      {contract.status === "terminated" && contract.terminationReason && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
          <Ban className="w-4 h-4 text-[#dc2626] shrink-0 mt-0.5" />
          <div>
            <p className="text-[#dc2626]" style={{ fontSize: "12.5px", fontWeight: 600 }}>Hợp đồng đã chấm dứt</p>
            <p className="text-red-600 dark:text-red-400 mt-0.5" style={{ fontSize: "11.5px" }}>
              Lý do: {contract.terminationReason}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Left col ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Parties — V1: 2 bên */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Các bên liên quan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { icon: Building2, label: "Nhà cung cấp", tenantId: contract.supplierId },
                { icon: Building2, label: "Trường học",   tenantId: contract.schoolId },
              ] as { icon: typeof Building2; label: string; tenantId: string }[]).map(({ icon: Icon, label, tenantId }) => (
                <div key={label} className="p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1 text-muted-foreground" style={{ fontSize: "10.5px" }}>
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {tenantType(tenantId) && <TenantBadge type={tenantType(tenantId)!} size="xs" />}
                    <span style={{ fontSize: "12.5px", fontWeight: 500 }}>{tenantName(tenantId)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones — có nút đánh dấu hoàn thành */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                <ListChecks className="w-4 h-4" /> Mốc thực hiện
              </h3>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#16a34a" }}>
                {doneMilestones}/{contract.milestones.length} hoàn thành
              </span>
            </div>
            <div className="space-y-2">
              {contract.milestones.map((m, i) => {
                const overdue = !m.done && new Date(m.dueAt) < new Date();
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${
                    m.done ? "bg-[#16a34a]/8 border border-[#16a34a]/20"
                    : overdue ? "bg-[#f59e0b]/8 border border-[#f59e0b]/20"
                    : "bg-secondary/30"
                  }`}>
                    {m.done
                      ? <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                      : overdue
                        ? <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0" />
                        : <Clock className="w-4 h-4 text-muted-foreground shrink-0" />}
                    <div className="flex-1">
                      <p style={{ fontSize: "13px", fontWeight: 500 }}>{m.title}</p>
                      <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                        Hạn: {formatRelative(m.dueAt)}
                        {overdue && <span className="ml-1 text-[#f59e0b] font-semibold">— Quá hạn</span>}
                      </p>
                    </div>
                    {m.done ? (
                      <span className="text-xs font-semibold shrink-0 text-[#16a34a]">Xong</span>
                    ) : (
                      <button onClick={() => { completeMilestone(contract.id, i); toast.success(`Hoàn thành: ${m.title}`); }}
                        className="px-2.5 py-1 border border-border rounded hover:bg-secondary shrink-0"
                        style={{ fontSize: "10.5px", fontWeight: 600 }}>
                        Đánh dấu xong
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* License đã cấp theo HĐ */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                <KeyRound className="w-4 h-4" /> License đã cấp ({contractLicenses.length})
              </h3>
              {contract.status === "active" && (
                <button onClick={handleIssueLicenses}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-[#7c3aed] text-white rounded hover:opacity-90"
                  style={{ fontSize: "11px", fontWeight: 600 }}>
                  <KeyRound className="w-3 h-3" /> Cấp license
                </button>
              )}
            </div>
            {contractLicenses.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground" style={{ fontSize: "11.5px" }}>
                {contract.status === "active"
                  ? "Chưa cấp license — bấm \"Cấp license\" để sinh theo gói."
                  : "Hợp đồng cần ở trạng thái \"Đang hiệu lực\" để cấp license."}
              </p>
            ) : (
              <div className="space-y-1.5">
                {contractLicenses.map((l) => {
                  const st = l.status ?? deriveLicenseStatus(l);
                  return (
                    <div key={l.id} className="flex items-center gap-2 px-2.5 py-2 bg-secondary/30 rounded-lg">
                      <KeyRound className="w-3.5 h-3.5 text-[#7c3aed] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{l.productName}</p>
                        <p className="text-muted-foreground font-mono" style={{ fontSize: "10px" }}>{l.licenseKey}</p>
                      </div>
                      <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{l.seats} seats</span>
                      <span className="px-1.5 py-0.5 rounded" style={{
                        fontSize: "9.5px", fontWeight: 600,
                        color: st === "revoked" ? "#dc2626" : st === "expired" ? "#f59e0b" : "#16a34a",
                        backgroundColor: (st === "revoked" ? "#dc2626" : st === "expired" ? "#f59e0b" : "#16a34a") + "15",
                      }}>
                        {st === "revoked" ? "Thu hồi" : st === "expired" ? "Hết hạn" : st === "expiring" ? "Sắp hết" : "Hiệu lực"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Related orders */}
          {relatedOrders.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="mb-3 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
                <Receipt className="w-4 h-4" /> Đơn hàng liên kết ({relatedOrders.length})
              </h3>
              <div className="space-y-2">
                {relatedOrders.map((o) => (
                  <button key={o.id} onClick={() => navigate("/supplier/orders")}
                    className="w-full flex items-center justify-between p-2.5 bg-secondary/30 rounded-lg hover:bg-secondary/60 transition-colors">
                    <span className="font-mono" style={{ fontSize: "12px", fontWeight: 600 }}>{o.orderNo}</span>
                    <span className="text-muted-foreground" style={{ fontSize: "11.5px" }}>{formatRelative(o.createdAt)}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#990803" }}>{formatVND(o.totalVND)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right col ── */}
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 style={{ fontSize: "13px", fontWeight: 600 }}>Tóm tắt</h3>
            {([
              { icon: CalendarDays, label: "Ngày ký",      value: contract.signedAt ? formatRelative(contract.signedAt) : "Chưa ký" },
              { icon: DollarSign,   label: "Giá trị HĐ",  value: formatVND(contract.totalVND) },
              { icon: ListChecks,   label: "Tiến độ mốc", value: `${doneMilestones}/${contract.milestones.length}` },
              { icon: KeyRound,     label: "License",     value: String(contractLicenses.length) },
              { icon: Receipt,      label: "Đơn hàng",    value: String(relatedOrders.length) },
            ] as { icon: typeof CalendarDays; label: string; value: string }[]).map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="flex-1 text-muted-foreground" style={{ fontSize: "12px" }}>{label}</span>
                <span style={{ fontSize: "12.5px", fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="mb-3 flex items-center gap-1.5" style={{ fontSize: "13px", fontWeight: 600 }}>
              <Paperclip className="w-4 h-4" /> Đính kèm ({contract.attachments.length})
            </h3>
            {contract.attachments.length === 0 ? (
              <p className="text-center py-3 text-muted-foreground" style={{ fontSize: "11px" }}>Chưa có file đính kèm</p>
            ) : (
              <div className="space-y-2">
                {contract.attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 bg-secondary/30 rounded-lg">
                    <FileText className="w-4 h-4 text-[#990803] shrink-0" />
                    <span className="flex-1 font-mono truncate" style={{ fontSize: "11px" }}>{a}</span>
                    <button onClick={() => toast.info(`Tải xuống: ${a}`)} className="p-1 hover:bg-secondary rounded">
                      <Download className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {terminateOpen && (
        <TerminateDialog onClose={() => setTerminateOpen(false)} onConfirm={handleTerminate} />
      )}
    </div>
  );
}

export default SupplierContractDetail;
