import { useState, useMemo } from "react";
import {
  Boxes, Search, QrCode, Wrench, Eye, Download,
  Plus, Activity,
} from "lucide-react";
import { equipmentBySchool, stemPackages, tenantsByType } from "../../mock-data/index";
import type { Equipment, EquipmentStatus } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { EquipmentStatusBadge, TierBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatDate, formatRelative } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  EQUIPMENT INVENTORY (School) — kiểm kê thiết bị STEM trường     */
/* ================================================================ */

const STATUS_LIST: EquipmentStatus[] = ["ok", "warning", "broken", "missing"];

export function EquipmentInventory() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const equipment = useMemo(() => equipmentBySchool(tenantId), [tenantId]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [selected, setSelected] = useState<Equipment | null>(null);

  const categories = Array.from(new Set(equipment.map((e) => e.category)));

  const filtered = equipment.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!e.name.toLowerCase().includes(s) && !e.serial.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const byStatus: Record<EquipmentStatus, number> = { ok: 0, warning: 0, broken: 0, missing: 0 };
  equipment.forEach((e) => { byStatus[e.status]++; });

  const compliance = Math.round((byStatus.ok / (equipment.length || 1)) * 100);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Boxes}
        title="Quản lý Thiết bị STEM"
        subtitle="Theo dõi danh sách, số lượng, lịch sử sử dụng và đánh giá tình trạng thiết bị phòng lab STEM."
        accentColor="#2563eb"
        actions={
          <>
            <button
              onClick={() => toast.info("Quét QR để kiểm kê nhanh")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <QrCode className="w-4 h-4" />
              Quét QR
            </button>
            <button
              onClick={() => toast.success("Xuất Excel kiểm kê theo phòng STEM")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Download className="w-4 h-4" />
              Xuất kiểm kê
            </button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Boxes} label="Tổng thiết bị" value={equipment.length} color="#2563eb" subtitle={`${compliance}% đạt chuẩn`} />
        <KpiCard icon={Activity} label="Hoạt động tốt" value={byStatus.ok} color="#16a34a" />
        <KpiCard icon={Wrench} label="Cần kiểm tra / Hỏng" value={byStatus.warning + byStatus.broken} color="#f59e0b" />
        <KpiCard icon={Wrench} label="Thất lạc" value={byStatus.missing} color="#dc2626" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm thiết bị / serial..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }}
          />
        </div>
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-2 rounded-lg border ${
            statusFilter === "all" ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-card border-border hover:bg-secondary"
          }`}
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          Tất cả ({equipment.length})
        </button>
        {STATUS_LIST.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-2 rounded-lg border ${
              statusFilter === st ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-card border-border hover:bg-secondary"
            }`}
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            {st === "ok" ? "OK" : st === "warning" ? "Cảnh báo" : st === "broken" ? "Hỏng" : "Thất lạc"} ({byStatus[st]})
          </button>
        ))}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg outline-none"
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <tr>
                <th className="px-4 py-2.5">Mã / Serial</th>
                <th className="px-4 py-2.5">Tên thiết bị</th>
                <th className="px-4 py-2.5">Danh mục</th>
                <th className="px-4 py-2.5">Phòng</th>
                <th className="px-4 py-2.5">Gói</th>
                <th className="px-4 py-2.5">Trạng thái</th>
                <th className="px-4 py-2.5">Bảo hành đến</th>
                <th className="px-4 py-2.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
              {filtered.slice(0, 50).map((eq) => {
                const pkg = stemPackages.find((p) => p.id === eq.packageId);
                return (
                  <tr key={eq.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-mono" style={{ fontSize: "11.5px", fontWeight: 600 }}>{eq.id}</p>
                      <p className="font-mono text-muted-foreground" style={{ fontSize: "10.5px" }}>{eq.serial}</p>
                    </td>
                    <td className="px-4 py-3">{eq.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 bg-secondary rounded" style={{ fontSize: "10.5px" }}>{eq.category}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{eq.location}</td>
                    <td className="px-4 py-3">{pkg && <TierBadge tier={pkg.tier} size="xs" />}</td>
                    <td className="px-4 py-3"><EquipmentStatusBadge status={eq.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>
                      {formatDate(eq.warrantyEndsAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelected(eq)} className="p-1.5 hover:bg-secondary rounded" title="Chi tiết">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {(eq.status === "broken" || eq.status === "missing") && (
                        <button
                          onClick={() => toast.info(`Tạo ticket bảo hành cho ${eq.name}`)}
                          className="p-1.5 hover:bg-secondary rounded"
                          title="Báo lỗi / yêu cầu bảo hành"
                        >
                          <Wrench className="w-4 h-4 text-[#dc2626]" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && (
          <div className="p-3 border-t border-border text-center text-muted-foreground" style={{ fontSize: "12px" }}>
            Hiển thị 50/{filtered.length}. Thu hẹp bộ lọc để xem hết.
          </div>
        )}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
            Không có thiết bị khớp điều kiện.
          </div>
        )}
      </div>

      {/* Detail dialog */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 style={{ fontSize: "16px", fontWeight: 700 }}>{selected.name}</h2>
                <EquipmentStatusBadge status={selected.status} size="md" />
              </div>
              <p className="text-muted-foreground mt-0.5 font-mono" style={{ fontSize: "12px" }}>
                {selected.id} · {selected.serial}
              </p>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Row label="Danh mục" value={selected.category} />
                <Row label="Phòng" value={selected.location} />
                <Row label="Ngày mua" value={formatDate(selected.purchasedAt)} />
                <Row label="Bảo hành đến" value={formatDate(selected.warrantyEndsAt)} />
                <Row label="Giờ sử dụng" value={`${selected.usageHours || 0} giờ`} />
                <Row label="Kiểm tra gần nhất" value={selected.lastCheckedAt ? formatRelative(selected.lastCheckedAt) : "—"} />
              </div>
              <div className="p-3 bg-secondary/40 rounded-lg">
                <p className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>QR CODE</p>
                <p className="font-mono text-[#2563eb] truncate" style={{ fontSize: "11px" }}>{selected.qrCode}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary/40 rounded-md p-2">
      <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{label}</p>
      <p className="text-foreground" style={{ fontSize: "12.5px", fontWeight: 500 }}>{value}</p>
    </div>
  );
}

export default EquipmentInventory;
