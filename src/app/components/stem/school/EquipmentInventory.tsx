import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Boxes, Search, Wrench, Eye, Download,
  Plus, Activity, Pencil, Trash2, X, Save, AlertTriangle,
} from "lucide-react";
import { equipmentBySchool, stemPackages, tenantsByType } from "../../mock-data/index";
import type { Equipment, EquipmentStatus } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { EquipmentStatusBadge, TierBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { formatDate, formatRelative } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  EQUIPMENT INVENTORY (School) — kiểm kê thiết bị STEM trường     */
/* ================================================================ */

const STATUS_LIST: EquipmentStatus[] = ["ok", "warning", "broken", "missing"];
const STATUS_LABELS: Record<EquipmentStatus, string> = {
  ok: "Hoạt động tốt",
  warning: "Cần kiểm tra",
  broken: "Hỏng",
  missing: "Thất lạc",
};
const ROOM_OPTIONS = ["Phòng STEM 1", "Phòng STEM 2", "Phòng STEM 3", "Phòng Robotic"];

interface EqForm {
  name: string;
  serial: string;
  category: string;
  location: string;
  status: EquipmentStatus;
  purchasedAt: string;
  warrantyEndsAt: string;
  packageId: string;
  usageHours: string;
}

const today = new Date().toISOString().split("T")[0];
const inThreeYears = new Date(Date.now() + 3 * 365 * 86400_000).toISOString().split("T")[0];

const BLANK_FORM: EqForm = {
  name: "",
  serial: "",
  category: "",
  location: ROOM_OPTIONS[0],
  status: "ok",
  purchasedAt: today,
  warrantyEndsAt: inThreeYears,
  packageId: "",
  usageHours: "0",
};

export function EquipmentInventory() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const [equipmentList, setEquipmentList] = useState<Equipment[]>(() => equipmentBySchool(tenantId));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");

  // View detail modal
  const [selected, setSelected] = useState<Equipment | null>(null);

  // Form modal (add / edit)
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [formTarget, setFormTarget] = useState<Equipment | null>(null);
  const [form, setForm] = useState<EqForm>(BLANK_FORM);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<Equipment | null>(null);

  const navigate = useNavigate();
  const categories = useMemo(
    () => Array.from(new Set(equipmentList.map((e) => e.category))),
    [equipmentList]
  );

  const filtered = equipmentList.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!e.name.toLowerCase().includes(s) && !e.serial.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const byStatus: Record<EquipmentStatus, number> = { ok: 0, warning: 0, broken: 0, missing: 0 };
  equipmentList.forEach((e) => { byStatus[e.status]++; });
  const compliance = Math.round((byStatus.ok / (equipmentList.length || 1)) * 100);

  // ── Form helpers ──
  function f(field: keyof EqForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function openAdd() {
    setForm(BLANK_FORM);
    setFormTarget(null);
    setFormMode("add");
  }

  function openEdit(eq: Equipment) {
    setForm({
      name: eq.name,
      serial: eq.serial,
      category: eq.category,
      location: eq.location,
      status: eq.status,
      purchasedAt: eq.purchasedAt.split("T")[0],
      warrantyEndsAt: eq.warrantyEndsAt.split("T")[0],
      packageId: eq.packageId ?? "",
      usageHours: String(eq.usageHours ?? 0),
    });
    setFormTarget(eq);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode(null);
    setFormTarget(null);
  }

  function handleSave() {
    if (!form.name.trim() || !form.serial.trim() || !form.category.trim()) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    if (formMode === "add") {
      const newEq: Equipment = {
        id: `EQ-NEW-${Date.now()}`,
        name: form.name.trim(),
        serial: form.serial.trim(),
        category: form.category.trim(),
        packageId: form.packageId || stemPackages[0]?.id || "",
        schoolId: tenantId,
        location: form.location,
        status: form.status,
        purchasedAt: form.purchasedAt + "T00:00:00Z",
        warrantyEndsAt: form.warrantyEndsAt + "T00:00:00Z",
        usageHours: parseInt(form.usageHours) || 0,
        qrCode: `https://stem.geleximco.vn/qr/EQ-${Date.now()}`,
      };
      setEquipmentList((prev) => [newEq, ...prev]);
      toast.success(`Đã thêm thiết bị "${newEq.name}"`);
    } else if (formMode === "edit" && formTarget) {
      setEquipmentList((prev) =>
        prev.map((eq) =>
          eq.id === formTarget.id
            ? {
                ...eq,
                name: form.name.trim(),
                serial: form.serial.trim(),
                category: form.category.trim(),
                location: form.location,
                status: form.status,
                purchasedAt: form.purchasedAt + "T00:00:00Z",
                warrantyEndsAt: form.warrantyEndsAt + "T00:00:00Z",
                packageId: form.packageId || eq.packageId,
                usageHours: parseInt(form.usageHours) || 0,
              }
            : eq
        )
      );
      toast.success(`Đã cập nhật thiết bị "${form.name.trim()}"`);
    }
    closeForm();
  }

  function handleDelete(eq: Equipment) {
    setEquipmentList((prev) => prev.filter((e) => e.id !== eq.id));
    toast.success(`Đã xóa thiết bị "${eq.name}"`);
    setDeleteConfirm(null);
    if (selected?.id === eq.id) setSelected(null);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Boxes}
        title="Quản lý Thiết bị STEM"
        subtitle="Theo dõi danh sách, số lượng, lịch sử sử dụng và đánh giá tình trạng thiết bị phòng lab STEM."
        accentColor="#990803"
        actions={
          <>
            <button
              onClick={() => toast.success("Xuất Excel kiểm kê theo phòng STEM")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Download className="w-4 h-4" />
              Xuất kiểm kê
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Plus className="w-4 h-4" />
              Thêm thiết bị
            </button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Boxes}    label="Tổng thiết bị"        value={equipmentList.length}          color="#2563eb" subtitle={`${compliance}% đạt chuẩn`} />
        <KpiCard icon={Activity} label="Hoạt động tốt"        value={byStatus.ok}                   color="#16a34a" />
        <KpiCard icon={Wrench}   label="Cần kiểm tra / Hỏng" value={byStatus.warning + byStatus.broken} color="#f59e0b" />
        <KpiCard icon={Wrench}   label="Thất lạc"             value={byStatus.missing}              color="#dc2626" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm thiết bị / serial..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-[#990803]"
            style={{ fontSize: "13px" }}
          />
        </div>
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-3 py-2 rounded-lg border ${statusFilter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          Tất cả ({equipmentList.length})
        </button>
        {STATUS_LIST.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-2 rounded-lg border ${statusFilter === st ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
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
                    <td className="px-4 py-3 font-medium">{eq.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 bg-secondary rounded" style={{ fontSize: "10.5px" }}>{eq.category}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{eq.location}</td>
                    <td className="px-4 py-3">{pkg && <TierBadge tier={pkg.tier} size="xs" />}</td>
                    <td className="px-4 py-3"><EquipmentStatusBadge status={eq.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>
                      {formatDate(eq.warrantyEndsAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelected(eq)} className="p-1.5 hover:bg-secondary rounded transition-colors" title="Xem chi tiết">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button onClick={() => openEdit(eq)} className="p-1.5 hover:bg-secondary rounded transition-colors" title="Chỉnh sửa">
                          <Pencil className="w-4 h-4 text-[#2563eb]" />
                        </button>
                        <button onClick={() => setDeleteConfirm(eq)} className="p-1.5 hover:bg-red-50 rounded transition-colors" title="Xóa">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                        {(eq.status === "broken" || eq.status === "missing") && (
                          <button
                            onClick={() => navigate(`/school/warranty?equipmentId=${eq.id}&name=${encodeURIComponent(eq.name)}&serial=${encodeURIComponent(eq.serial)}`)}
                            className="p-1.5 hover:bg-secondary rounded transition-colors"
                            title="Báo lỗi / yêu cầu bảo hành"
                          >
                            <Wrench className="w-4 h-4 text-[#dc2626]" />
                          </button>
                        )}
                      </div>
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

      {/* ── View Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-5 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <h2 style={{ fontSize: "16px", fontWeight: 700 }}>{selected.name}</h2>
                  <EquipmentStatusBadge status={selected.status} size="md" />
                </div>
                <p className="text-muted-foreground mt-0.5 font-mono" style={{ fontSize: "12px" }}>
                  {selected.id} · {selected.serial}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-secondary">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
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
              {selected.qrCode && (
                <div className="p-3 bg-secondary/40 rounded-lg">
                  <p className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>QR CODE</p>
                  <p className="font-mono text-[#2563eb] truncate" style={{ fontSize: "11px" }}>{selected.qrCode}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 pb-5">
              <button
                onClick={() => { setSelected(null); openEdit(selected); }}
                className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg hover:bg-secondary"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa
              </button>
              <button onClick={() => setSelected(null)} className="px-4 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90" style={{ fontSize: "13px", fontWeight: 500 }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Form Modal ── */}
      {formMode && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={closeForm}
        >
          <div
            className="bg-card rounded-2xl border border-border w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                {formMode === "add"
                  ? <Plus className="w-4 h-4 text-[#990803]" />
                  : <Pencil className="w-4 h-4 text-[#990803]" />}
                <h2 style={{ fontSize: "16px", fontWeight: 700 }}>
                  {formMode === "add" ? "Thêm mới Thiết bị" : "Chỉnh sửa Thiết bị"}
                </h2>
              </div>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-secondary">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 overflow-y-auto space-y-4">
              {/* Tên thiết bị */}
              <div>
                <label className="block text-foreground mb-1.5" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                  Tên thiết bị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => f("name", e.target.value)}
                  placeholder="VD: Bộ kit Arduino Mega 2560"
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg outline-none focus:border-[#990803]"
                  style={{ fontSize: "13px" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Mã serial */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    Mã Serial <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.serial}
                    onChange={(e) => f("serial", e.target.value)}
                    placeholder="VD: SN-001234"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg outline-none focus:border-[#990803] font-mono"
                    style={{ fontSize: "13px" }}
                  />
                </div>

                {/* Danh mục */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="category-list"
                    value={form.category}
                    onChange={(e) => f("category", e.target.value)}
                    placeholder="Chọn hoặc nhập danh mục"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg outline-none focus:border-[#990803]"
                    style={{ fontSize: "13px" }}
                  />
                  <datalist id="category-list">
                    {categories.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Vị trí / Phòng */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    Vị trí / Phòng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.location}
                    onChange={(e) => f("location", e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg outline-none focus:border-[#990803]"
                    style={{ fontSize: "13px" }}
                  >
                    {ROOM_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => f("status", e.target.value as EquipmentStatus)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg outline-none focus:border-[#990803]"
                    style={{ fontSize: "13px" }}
                  >
                    {STATUS_LIST.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Ngày mua */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    Ngày mua
                  </label>
                  <input
                    type="date"
                    value={form.purchasedAt}
                    onChange={(e) => f("purchasedAt", e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg outline-none focus:border-[#990803]"
                    style={{ fontSize: "13px" }}
                  />
                </div>

                {/* Bảo hành đến */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    Bảo hành đến
                  </label>
                  <input
                    type="date"
                    value={form.warrantyEndsAt}
                    onChange={(e) => f("warrantyEndsAt", e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg outline-none focus:border-[#990803]"
                    style={{ fontSize: "13px" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Gói STEM */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    Gói STEM
                  </label>
                  <select
                    value={form.packageId}
                    onChange={(e) => f("packageId", e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg outline-none focus:border-[#990803]"
                    style={{ fontSize: "13px" }}
                  >
                    <option value="">— Không chọn —</option>
                    {stemPackages.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Số giờ sử dụng */}
                <div>
                  <label className="block text-foreground mb-1.5" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    Số giờ sử dụng
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.usageHours}
                    onChange={(e) => f("usageHours", e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg outline-none focus:border-[#990803]"
                    style={{ fontSize: "13px" }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-secondary/20 shrink-0">
              <button
                onClick={closeForm}
                className="px-4 py-2.5 border border-border rounded-lg hover:bg-secondary transition-colors"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#990803] text-white rounded-lg hover:opacity-90"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                <Save className="w-4 h-4" />
                {formMode === "add" ? "Thêm thiết bị" : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-card rounded-2xl border border-border w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700 }}>Xác nhận xóa thiết bị</h3>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
                  Bạn có chắc muốn xóa thiết bị
                </p>
                <p className="font-semibold text-foreground mt-0.5" style={{ fontSize: "13px" }}>
                  "{deleteConfirm.name}"
                </p>
                <p className="font-mono text-muted-foreground mt-0.5" style={{ fontSize: "11.5px" }}>
                  Serial: {deleteConfirm.serial}
                </p>
                <p className="text-red-600 mt-2" style={{ fontSize: "12px" }}>
                  Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 pb-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-secondary transition-colors"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                <Trash2 className="w-4 h-4" /> Xóa thiết bị
              </button>
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
