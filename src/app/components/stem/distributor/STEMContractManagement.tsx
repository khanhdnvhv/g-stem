import { useState } from "react";
import {
  FileText, Search, Plus, Eye, Paperclip, Calendar,
  CheckCircle2, Circle, DollarSign, Percent,
} from "lucide-react";
import { contracts, tenants } from "../../mock-data/index";
import type { Contract } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatVND, formatVNDCompact, formatDate } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  CONTRACT MANAGEMENT — Hợp đồng B2B đại lý ↔ trường              */
/* ================================================================ */

const STATUS_META: Record<Contract["status"], { label: string; color: string }> = {
  draft:       { label: "Nháp",        color: "#64748b" },
  signed:      { label: "Đã ký",       color: "#0891b2" },
  active:      { label: "Đang thực hiện", color: "#16a34a" },
  expired:     { label: "Hết hạn",     color: "#64748b" },
  terminated:  { label: "Chấm dứt",    color: "#dc2626" },
};

function schoolName(id: string) { return tenants.find((t) => t.id === id)?.name || id; }

function ContractRow({ c, onOpen }: { c: Contract; onOpen: () => void }) {
  const meta = STATUS_META[c.status];
  const done = c.milestones.filter((m) => m.done).length;
  const pct = Math.round((done / c.milestones.length) * 100);
  return (
    <tr className="hover:bg-secondary/50 transition-colors">
      <td className="px-4 py-3 font-mono" style={{ fontSize: "12px", fontWeight: 600 }}>{c.contractNo}</td>
      <td className="px-4 py-3">{schoolName(c.schoolId)}</td>
      <td className="px-4 py-3 text-[#990803]" style={{ fontWeight: 600 }}>{formatVNDCompact(c.totalVND)}</td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md" style={{
          fontSize: "10.5px", fontWeight: 600,
          color: "#c8a84e", backgroundColor: "#c8a84e15",
        }}>
          <Percent className="w-2.5 h-2.5" /> {c.commissionPct}%
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="px-2 py-0.5 rounded" style={{
          fontSize: "11px", fontWeight: 600,
          color: meta.color, backgroundColor: meta.color + "15",
        }}>
          {meta.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-[#16a34a]" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
            {done}/{c.milestones.length}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>{formatDate(c.signedAt)}</td>
      <td className="px-4 py-3 text-right">
        <button onClick={onOpen} className="p-1.5 hover:bg-secondary rounded" title="Xem chi tiết">
          <Eye className="w-4 h-4 text-muted-foreground" />
        </button>
      </td>
    </tr>
  );
}

function ContractDetailDialog({ c, onClose }: { c: Contract; onClose: () => void }) {
  const meta = STATUS_META[c.status];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <h2 style={{ fontSize: "17px", fontWeight: 700 }}>{c.contractNo}</h2>
            <span className="px-2 py-0.5 rounded" style={{
              fontSize: "11px", fontWeight: 600, color: meta.color, backgroundColor: meta.color + "15",
            }}>
              {meta.label}
            </span>
          </div>
          <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
            Ký ngày {formatDate(c.signedAt)} · Trường: {schoolName(c.schoolId)}
          </p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/40 rounded-lg p-3">
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Tổng giá trị</p>
              <p className="text-[#990803]" style={{ fontSize: "20px", fontWeight: 700 }}>{formatVND(c.totalVND)}</p>
            </div>
            <div className="bg-secondary/40 rounded-lg p-3">
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Hoa hồng</p>
              <p style={{ fontSize: "20px", fontWeight: 700, color: "#c8a84e" }}>{c.commissionPct}%</p>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                ≈ {formatVND(c.totalVND * (c.commissionPct || 0) / 100)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>TIẾN ĐỘ MILESTONE</p>
            <div className="space-y-1.5">
              {c.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-md">
                  {m.done ? (
                    <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className={m.done ? "text-muted-foreground line-through" : "text-foreground"} style={{ fontSize: "12.5px" }}>
                      {m.title}
                    </p>
                  </div>
                  <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                    <Calendar className="w-3 h-3 inline mr-1" />
                    {formatDate(m.dueAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {c.attachments.length > 0 && (
            <div>
              <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>ĐÍNH KÈM</p>
              {c.attachments.map((a, i) => (
                <a
                  key={i} href="#"
                  onClick={(e) => { e.preventDefault(); toast.info(`Tải ${a}`); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-secondary rounded-md hover:bg-secondary/70 mr-2"
                  style={{ fontSize: "12px" }}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  {a}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function STEMContractManagement() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Contract["status"] | "all">("all");
  const [selected, setSelected] = useState<Contract | null>(null);

  const myContracts = user?.tenantType === "distributor"
    ? contracts.filter((c) => c.distributorId === user.tenantId)
    : contracts;

  const filtered = myContracts.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!c.contractNo.toLowerCase().includes(s) && !schoolName(c.schoolId).toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const totalValue = myContracts.reduce((s, c) => s + c.totalVND, 0);
  const activeCount = myContracts.filter((c) => c.status === "active").length;
  const totalCommission = myContracts.reduce((s, c) => s + c.totalVND * (c.commissionPct || 0) / 100, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={FileText}
        title="Quản lý Hợp đồng STEM"
        subtitle="Lưu trữ, theo dõi tiến độ và điều khoản các hợp đồng B2B đã ký kết với khách hàng"
        actions={
          <button
            onClick={() => toast.success("Tạo hợp đồng mới từ template chuẩn")}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Plus className="w-4 h-4" />
            Tạo hợp đồng
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={FileText} label="Tổng hợp đồng" value={myContracts.length} color="#c8a84e" />
        <KpiCard icon={CheckCircle2} label="Đang thực hiện" value={activeCount} color="#16a34a" />
        <KpiCard icon={DollarSign} label="Tổng giá trị" value={formatVNDCompact(totalValue)} color="#990803" />
        <KpiCard icon={Percent} label="Hoa hồng dự kiến" value={formatVNDCompact(totalCommission)} color="#0891b2" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm hợp đồng / trường..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }}
          />
        </div>
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-2 rounded-lg border ${
            statusFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"
          }`}
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          Tất cả ({myContracts.length})
        </button>
        {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map((k) => {
          const count = myContracts.filter((c) => c.status === k).length;
          const meta = STATUS_META[k];
          return (
            <button
              key={k}
              onClick={() => setStatusFilter(k)}
              className={`px-3 py-2 rounded-lg border ${
                statusFilter === k ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"
              }`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(statusFilter === k ? { backgroundColor: meta.color } : {}),
              }}
            >
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <tr>
                <th className="px-4 py-2.5">Mã HĐ</th>
                <th className="px-4 py-2.5">Trường</th>
                <th className="px-4 py-2.5">Giá trị</th>
                <th className="px-4 py-2.5">Hoa hồng</th>
                <th className="px-4 py-2.5">Trạng thái</th>
                <th className="px-4 py-2.5">Tiến độ</th>
                <th className="px-4 py-2.5">Ký</th>
                <th className="px-4 py-2.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
              {filtered.map((c) => <ContractRow key={c.id} c={c} onOpen={() => setSelected(c)} />)}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
            Chưa có hợp đồng nào khớp điều kiện.
          </div>
        )}
      </div>

      {selected && <ContractDetailDialog c={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default STEMContractManagement;
