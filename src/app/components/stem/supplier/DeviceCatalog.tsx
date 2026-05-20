import { useState, useMemo } from "react";
import {
  Cpu, Plus, Search, Pencil, Trash2, Package,
  Download, Tag, X, Save,
} from "lucide-react";
import { DEVICES, DEVICE_CATEGORIES } from "../../mock-data/index";
import type { DeviceEntry } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { formatVND } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  DEVICE CATALOG — Khai báo danh mục thiết bị STEM (Supplier)     */
/*  Dữ liệu nguồn cho cấu hình BOM trong STEMPackageConfigurator    */
/* ================================================================ */

/* ── Form dialog thêm/sửa thiết bị ── */
function DeviceFormDialog({
  device, onClose, onSave,
}: {
  device: DeviceEntry | null;   // null = thêm mới
  onClose: () => void;
  onSave: (d: DeviceEntry) => void;
}) {
  const isNew = !device;
  const [name, setName] = useState(device?.name ?? "");
  const [sku, setSku] = useState(device?.sku ?? "");
  const [brand, setBrand] = useState(device?.brand ?? "");
  const [category, setCategory] = useState(device?.category ?? DEVICE_CATEGORIES[0]);
  const [unitPriceVND, setUnitPriceVND] = useState(device?.unitPriceVND ?? 0);
  const [specs, setSpecs] = useState(device?.specs ?? "");
  const [active, setActive] = useState(device?.active ?? true);

  const nameValid = name.trim().length >= 3;
  const skuValid = sku.trim().length >= 2;
  const priceValid = unitPriceVND > 0;
  const formValid = nameValid && skuValid && priceValid;

  const handleSave = () => {
    if (!formValid) return;
    onSave({
      id: device?.id ?? `DV-NEW-${Date.now()}`,
      name: name.trim(), sku: sku.trim().toUpperCase(), brand: brand.trim(),
      category, unitPriceVND, specs: specs.trim(), active,
      inBomCount: device?.inBomCount ?? 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
          <Cpu className="w-5 h-5 text-[#990803]" />
          <h2 className="flex-1" style={{ fontSize: "15px", fontWeight: 700 }}>
            {isNew ? "Khai báo thiết bị mới" : "Sửa thiết bị"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
              Tên thiết bị <span className="text-[#990803]">*</span>
            </label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="VD: Arduino UNO R3"
              className={`w-full px-3 py-2 bg-input-background border rounded-lg outline-none ${
                !nameValid && name.length > 0 ? "border-orange-400" : "border-border"
              }`} style={{ fontSize: "13px" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                SKU <span className="text-[#990803]">*</span>
              </label>
              <input value={sku} onChange={(e) => setSku(e.target.value)}
                placeholder="VD: ARD-UNO-R3"
                className={`w-full px-3 py-2 bg-input-background border rounded-lg outline-none ${
                  !skuValid && sku.length > 0 ? "border-orange-400" : "border-border"
                }`} style={{ fontSize: "13px" }} />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>Hãng</label>
              <input value={brand} onChange={(e) => setBrand(e.target.value)}
                placeholder="VD: Arduino"
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none" style={{ fontSize: "13px" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>Danh mục</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "13px" }}>
                {DEVICE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>
                Đơn giá (VND) <span className="text-[#990803]">*</span>
              </label>
              <input type="number" min={0} value={unitPriceVND || ""}
                onChange={(e) => setUnitPriceVND(Number(e.target.value) || 0)}
                placeholder="0"
                className={`w-full px-3 py-2 bg-input-background border rounded-lg outline-none ${
                  !priceValid && unitPriceVND !== 0 ? "border-orange-400" : "border-border"
                }`} style={{ fontSize: "13px" }} />
            </div>
          </div>
          <div>
            <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 600 }}>Thông số</label>
            <textarea value={specs} onChange={(e) => setSpecs(e.target.value)}
              rows={2} placeholder="VD: Vi điều khiển ATmega328P, 14 chân digital..."
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none resize-none" style={{ fontSize: "12.5px" }} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4" />
            <span style={{ fontSize: "12.5px" }}>Đang hoạt động (hiển thị khi cấu hình BOM)</span>
          </label>
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border bg-secondary/20">
          <button onClick={onClose}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary" style={{ fontSize: "12.5px" }}>
            Hủy
          </button>
          <button onClick={handleSave} disabled={!formValid}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#990803] text-white rounded-lg hover:opacity-90 disabled:opacity-40"
            style={{ fontSize: "12.5px", fontWeight: 600 }}>
            <Save className="w-3.5 h-3.5" /> {isNew ? "Thêm thiết bị" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeviceCatalog() {
  const [devices, setDevices] = useState<DeviceEntry[]>(DEVICES);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DeviceEntry | null>(null);

  const usedCategories = useMemo(() => [...new Set(devices.map((d) => d.category))], [devices]);

  const filtered = useMemo(() => devices.filter((d) => {
    if (catFilter !== "all" && d.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !d.name.toLowerCase().includes(q) &&
        !d.sku.toLowerCase().includes(q) &&
        !d.brand.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  }), [devices, search, catFilter]);

  const totalValue = devices.reduce((s, d) => s + d.unitPriceVND, 0);
  const inBomCount = devices.filter((d) => d.inBomCount > 0).length;

  const handleSaveDevice = (d: DeviceEntry) => {
    setDevices((prev) => {
      const idx = prev.findIndex((x) => x.id === d.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = d;
        return next;
      }
      return [d, ...prev];
    });
    toast.success(editing ? `Đã lưu "${d.name}"` : `Đã thêm thiết bị "${d.name}"`);
    setFormOpen(false);
    setEditing(null);
  };

  const [deleteTarget, setDeleteTarget] = useState<DeviceEntry | null>(null);

  const requestDelete = (d: DeviceEntry) => {
    if (d.inBomCount > 0) {
      toast.error(`"${d.name}" đang dùng trong ${d.inBomCount} gói — không thể xóa`);
      return;
    }
    setDeleteTarget(d);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setDevices((prev) => prev.filter((x) => x.id !== deleteTarget.id));
    toast.info(`Đã xóa "${deleteTarget.name}"`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Cpu}
        title="Danh mục Thiết bị STEM"
        subtitle="Khai báo catalog thiết bị — nguồn dữ liệu chuẩn dùng khi cấu hình BOM gói phòng STEM."
        accentColor="#990803"
        actions={
          <>
            <button onClick={() => toast.info("Xuất danh mục thiết bị ra Excel")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Download className="w-4 h-4" /> Xuất Excel
            </button>
            <button onClick={() => { setEditing(null); setFormOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Plus className="w-4 h-4" /> Khai báo thiết bị
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Cpu}     label="Tổng thiết bị"        value={devices.length}   color="#990803" />
        <KpiCard icon={Tag}     label="Danh mục"             value={usedCategories.length} color="#0891b2" subtitle="loại" />
        <KpiCard icon={Package} label="Đang dùng trong BOM"  value={inBomCount}       color="#16a34a" />
        <KpiCard icon={Package} label="Tổng giá trị catalog" value={`${Math.round(totalValue / 1_000_000)}M`} color="#c8a84e" subtitle="VND" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên / SKU / hãng..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }} />
        </div>
        <button onClick={() => setCatFilter("all")}
          className={`px-3 py-2 rounded-lg border ${catFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
          style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả
        </button>
        {DEVICE_CATEGORIES.filter((c) => usedCategories.includes(c)).map((c) => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-3 py-2 rounded-lg border ${catFilter === c ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
            style={{ fontSize: "12px", fontWeight: 500 }}>
            {c}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <tr>
                <th className="px-4 py-2.5">SKU</th>
                <th className="px-4 py-2.5">Tên thiết bị</th>
                <th className="px-4 py-2.5">Danh mục</th>
                <th className="px-4 py-2.5">Hãng</th>
                <th className="px-4 py-2.5">Thông số</th>
                <th className="px-4 py-2.5 text-right">Đơn giá</th>
                <th className="px-4 py-2.5">Trong BOM</th>
                <th className="px-4 py-2.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-foreground"
                      style={{ fontSize: "11.5px", fontWeight: 600 }}>{d.sku}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: "13px", fontWeight: 500 }}>{d.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-[#0891b2]/10 text-[#0891b2] rounded"
                      style={{ fontSize: "10.5px", fontWeight: 600 }}>
                      {d.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground" style={{ fontSize: "12px" }}>{d.brand}</td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11px", maxWidth: "220px" }}>
                    <span className="line-clamp-2">{d.specs}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#990803]" style={{ fontSize: "13px", fontWeight: 700 }}>
                    {formatVND(d.unitPriceVND)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-1.5 py-0.5 rounded ${
                      d.inBomCount > 0
                        ? "bg-[#16a34a]/15 text-[#16a34a]"
                        : "bg-secondary text-muted-foreground"
                    }`} style={{ fontSize: "10.5px", fontWeight: 600 }}>
                      {d.inBomCount > 0 ? `${d.inBomCount} gói` : "Chưa dùng"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(d); setFormOpen(true); }}
                      className="p-1.5 hover:bg-secondary rounded mr-1" title="Sửa">
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button onClick={() => requestDelete(d)}
                      className="p-1.5 hover:bg-secondary rounded" title="Xóa">
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border text-muted-foreground" style={{ fontSize: "11.5px" }}>
          Hiển thị {filtered.length}/{devices.length} thiết bị
        </div>
      </div>

      {formOpen && (
        <DeviceFormDialog
          device={editing}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSave={handleSaveDevice}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa thiết bị"
        message="Thiết bị này sẽ bị xóa khỏi danh mục. Hành động không thể hoàn tác."
        itemName={deleteTarget ? `${deleteTarget.name} · ${deleteTarget.sku}` : undefined}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default DeviceCatalog;
