import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  Settings, ArrowLeft, Save, Plus, X, Trash2, Search,
  Info, Boxes, Cpu, BookOpen, DollarSign, Eye,
  CheckCircle2, AlertTriangle, GraduationCap, Send,
  Package, FileText, UploadCloud, Edit, ChevronRight,
} from "lucide-react";
import {
  stemPackages, STEM_PROGRAMS, GRADE_LEVELS, STEM_TIERS,
  DEVICES, DEVICE_CATEGORIES,
  lessons, STUDIO_LESSONS,
} from "../../mock-data/index";
import type { StemPackage, StemProgram, StemPackageTier, PackageStatus, DeviceEntry, DraftCard } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { TierBadge, ProgramBadge } from "../ui/badges";
import { formatVND } from "../ui/format";
import { toast } from "@/app/lib/toast";
import { useAuth } from "../../AuthContext";

/* ================================================================ */
/*  TYPES                                                            */
/* ================================================================ */
interface EquipmentRow { name: string; category: string; qty: number; unitPrice: number; specs: string }
interface SoftwareRow  { name: string; version: string; qty: number; duration: "1yr" | "3yr" | "perpetual" }

interface PkgForm {
  name: string;
  packageType: "template" | "custom";
  tier: StemPackageTier | "";
  ctPrograms: StemProgram[];
  targetKhoi: string[];
  targetSchoolId: string;
  description: string;
  thumbnailUrl: string;
  equipment: EquipmentRow[];
  software: SoftwareRow[];
  contentLessonIds: string[];
  teacherDocUrls: string[];
  installationFeeVND: number;
  trainingDays: number;
  warrantyMonths: number;
  referencePriceVND: number;
  priceVisible: boolean;
}

const EMPTY_FORM: PkgForm = {
  name: "", packageType: "template", tier: "", ctPrograms: [], targetKhoi: [],
  targetSchoolId: "", description: "", thumbnailUrl: "",
  equipment: [], software: [],
  contentLessonIds: [], teacherDocUrls: [],
  installationFeeVND: 0, trainingDays: 1, warrantyMonths: 12,
  referencePriceVND: 0, priceVisible: true,
};

function pkgToForm(p: StemPackage): PkgForm {
  return {
    name: p.name,
    packageType: p.packageType ?? "template",
    tier: p.tier,
    ctPrograms: p.supportedPrograms,
    targetKhoi: p.supportedGrades,
    targetSchoolId: p.targetSchoolId ?? "",
    description: p.description,
    thumbnailUrl: p.thumbnails[0] ?? "",
    equipment: p.includedEquipment.map((e) => ({
      name: e.name, category: e.category, qty: e.quantity, unitPrice: e.unitPriceVND, specs: e.specs ?? "",
    })),
    software: p.includedSoftware.map((s) => ({
      name: s.name, version: s.version, qty: s.seats, duration: "1yr",
    })),
    contentLessonIds: p.contentLessonIds ?? [],
    teacherDocUrls: p.teacherDocUrls ?? [],
    installationFeeVND: p.installationFeeVND ?? 0,
    trainingDays: p.trainingDays ?? 1,
    warrantyMonths: p.warrantyMonths ?? 12,
    referencePriceVND: p.priceVND,
    priceVisible: true,
  };
}

/* ================================================================ */
/*  TAB CONFIG                                                       */
/* ================================================================ */
const TABS = [
  { id: 1 as const, label: "Thông tin",    icon: Info },
  { id: 2 as const, label: "Thiết bị",     icon: Boxes },
  { id: 3 as const, label: "Phần mềm",     icon: Cpu },
  { id: 4 as const, label: "Nội dung",     icon: BookOpen },
  { id: 5 as const, label: "Giá & DV",     icon: DollarSign },
  { id: 6 as const, label: "Xem trước",    icon: Eye },
];

const KHOI_LIST = ["Mầm non", "Tiểu học", "THCS", "THPT", "THPT Nghề"];
const DURATION_LABELS: Record<SoftwareRow["duration"], string> = {
  "1yr": "1 năm", "3yr": "3 năm", "perpetual": "Vĩnh viễn",
};

/* ================================================================ */
/*  VALIDATION                                                       */
/* ================================================================ */
function validateTab1(f: PkgForm) {
  return f.name.trim().length >= 3
    && f.ctPrograms.length > 0
    && f.targetKhoi.length > 0
    && f.description.trim().length >= 50;
}
function validateTab5(f: PkgForm) {
  return f.referencePriceVND > 0;
}

/* ================================================================ */
/*  TAB 1 — Thông tin cơ bản                                        */
/* ================================================================ */
function Tab1({ form, set }: { form: PkgForm; set: (f: PkgForm) => void }) {
  const up = (patch: Partial<PkgForm>) => set({ ...form, ...patch });
  const toggleCT = (c: StemProgram) =>
    up({ ctPrograms: form.ctPrograms.includes(c) ? form.ctPrograms.filter((x) => x !== c) : [...form.ctPrograms, c] });
  const toggleKhoi = (k: string) =>
    up({ targetKhoi: form.targetKhoi.includes(k) ? form.targetKhoi.filter((x) => x !== k) : [...form.targetKhoi, k] });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tên gói */}
        <div className="md:col-span-2">
          <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Tên gói *</label>
          <input
            value={form.name}
            onChange={(e) => up({ name: e.target.value })}
            placeholder="VD: Gói STEM Cơ bản v2 — Robotic + IoT"
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-[#990803]/30"
            style={{ fontSize: "14px" }}
          />
          {form.name.trim().length > 0 && form.name.trim().length < 3 && (
            <p className="text-orange-500 mt-1" style={{ fontSize: "11px" }}>Tối thiểu 3 ký tự</p>
          )}
        </div>

        {/* Loại gói */}
        <div>
          <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Loại gói *</label>
          <div className="flex gap-2">
            {(["template", "custom"] as const).map((t) => (
              <button
                key={t}
                onClick={() => up({ packageType: t })}
                className={`flex-1 py-2 px-3 rounded-lg border transition-all ${form.packageType === t ? "bg-[#990803] text-white border-[#990803]" : "border-border bg-card hover:bg-secondary"}`}
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                {t === "template" ? "📋 Template (Catalog)" : "🏫 Custom (1 trường)"}
              </button>
            ))}
          </div>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "11px" }}>
            {form.packageType === "template" ? "Hiển thị trong catalog, dùng cho nhiều trường." : "Chỉ 1 trường cụ thể thấy và sử dụng."}
          </p>
        </div>

        {/* Tier */}
        <div>
          <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Tier (tùy chọn)</label>
          <div className="flex gap-1.5 flex-wrap">
            {Object.values(STEM_TIERS).map((t) => (
              <button
                key={t.tier}
                onClick={() => up({ tier: form.tier === t.tier ? "" : t.tier })}
                className={`px-3 py-1.5 rounded-lg border transition-all ${form.tier === t.tier ? "text-white border-transparent" : "border-border bg-card hover:bg-secondary"}`}
                style={{ fontSize: "12px", fontWeight: 500, ...(form.tier === t.tier ? { backgroundColor: t.color } : {}) }}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CT Programs */}
      <div>
        <label className="block text-muted-foreground mb-2" style={{ fontSize: "12px" }}>
          Chương trình STEM hỗ trợ * (chọn ít nhất 1)
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.values(STEM_PROGRAMS).map((p) => {
            const active = form.ctPrograms.includes(p.code);
            return (
              <button
                key={p.code}
                onClick={() => toggleCT(p.code)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${active ? "text-white border-transparent" : "border-border bg-card hover:bg-secondary"}`}
                style={{ fontSize: "12px", fontWeight: 500, ...(active ? { backgroundColor: p.color } : {}) }}
              >
                {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>{p.code}</span>
                <span className="opacity-75">{p.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Khối lớp */}
      <div>
        <label className="block text-muted-foreground mb-2" style={{ fontSize: "12px" }}>
          Khối lớp mục tiêu * (chọn ít nhất 1)
        </label>
        <div className="flex flex-wrap gap-2">
          {KHOI_LIST.map((k) => {
            const active = form.targetKhoi.includes(k);
            return (
              <button
                key={k}
                onClick={() => toggleKhoi(k)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${active ? "bg-[#990803] text-white border-[#990803]" : "border-border bg-card hover:bg-secondary"}`}
                style={{ fontSize: "12px", fontWeight: 500 }}
              >
                {active && <CheckCircle2 className="w-3 h-3" />}
                <GraduationCap className="w-3.5 h-3.5" />
                {k}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mô tả */}
      <div>
        <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>
          Mô tả * <span className="ml-1">{form.description.trim().length}/50 ký tự tối thiểu</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => up({ description: e.target.value })}
          rows={4}
          placeholder="Mô tả tổng quan về gói: mục tiêu, đối tượng, điểm nổi bật..."
          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-[#990803]/30 resize-none"
          style={{ fontSize: "13px" }}
        />
        {form.description.trim().length > 0 && form.description.trim().length < 50 && (
          <p className="text-orange-500 mt-1" style={{ fontSize: "11px" }}>
            Cần thêm {50 - form.description.trim().length} ký tự nữa
          </p>
        )}
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>URL ảnh đại diện</label>
        <input
          value={form.thumbnailUrl}
          onChange={(e) => up({ thumbnailUrl: e.target.value })}
          placeholder="https://..."
          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
          style={{ fontSize: "13px" }}
        />
        {form.thumbnailUrl && (
          <img src={form.thumbnailUrl} alt="" className="mt-2 h-24 w-40 object-cover rounded-lg border border-border" />
        )}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TAB 2 — Thiết bị (BOM)                                          */
/* ================================================================ */
function Tab2({ form, set }: { form: PkgForm; set: (f: PkgForm) => void }) {
  const [draft, setDraft] = useState<EquipmentRow>({ name: "", category: "", qty: 1, unitPrice: 0, specs: "" });
  const [addMode, setAddMode] = useState<"picker" | "manual">("picker");
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerCat, setPickerCat] = useState("all");
  const [selections, setSelections] = useState<Record<string, number>>({}); // deviceId → qty

  const totalCost = useMemo(
    () => form.equipment.reduce((s, e) => s + e.qty * e.unitPrice, 0),
    [form.equipment],
  );

  const pickerDevices = useMemo(() => DEVICES.filter((d) => {
    if (!d.active) return false;
    if (pickerCat !== "all" && d.category !== pickerCat) return false;
    if (pickerSearch) {
      const q = pickerSearch.toLowerCase();
      return d.name.toLowerCase().includes(q) || d.sku.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q);
    }
    return true;
  }), [pickerSearch, pickerCat]);

  const removeRow = (i: number) =>
    set({ ...form, equipment: form.equipment.filter((_, idx) => idx !== i) });

  const toggleDevice = (d: DeviceEntry) => {
    setSelections((prev) => {
      if (prev[d.id] !== undefined) {
        const next = { ...prev };
        delete next[d.id];
        return next;
      }
      return { ...prev, [d.id]: 1 };
    });
  };

  const setDeviceQty = (id: string, qty: number) =>
    setSelections((prev) => ({ ...prev, [id]: Math.max(1, qty) }));

  const selectedCount = Object.keys(selections).length;
  const selectedTotal = useMemo(() =>
    Object.entries(selections).reduce((s, [id, qty]) => {
      const dev = DEVICES.find((d) => d.id === id);
      return s + (dev ? dev.unitPriceVND * qty : 0);
    }, 0),
  [selections]);

  const addAllFromPicker = () => {
    const toAdd = Object.entries(selections).map(([id, qty]) => {
      const dev = DEVICES.find((d) => d.id === id)!;
      return { name: dev.name, category: dev.category, qty, unitPrice: dev.unitPriceVND, specs: dev.specs };
    });
    if (toAdd.length === 0) return;
    set({ ...form, equipment: [...form.equipment, ...toAdd] });
    setSelections({});
    toast.success(`Đã thêm ${toAdd.length} thiết bị vào BOM`);
  };

  const addManual = () => {
    if (!draft.name.trim() || draft.qty < 1 || draft.unitPrice < 1) {
      toast.error("Điền đầy đủ: tên, số lượng, đơn giá");
      return;
    }
    set({ ...form, equipment: [...form.equipment, { ...draft }] });
    setDraft({ name: "", category: "", qty: 1, unitPrice: 0, specs: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>Danh sách thiết bị (BOM)</h3>
          <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Tab này không bắt buộc — bỏ qua nếu gói không có thiết bị vật lý.</p>
        </div>
        {totalCost > 0 && (
          <div className="text-right">
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Tổng chi phí thiết bị</p>
            <p className="text-[#990803]" style={{ fontSize: "18px", fontWeight: 700 }}>{formatVND(totalCost)}</p>
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Floor price tối thiểu: {formatVND(Math.ceil(totalCost * 1.15))}</p>
          </div>
        )}
      </div>

      {/* BOM table */}
      {form.equipment.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50 text-muted-foreground" style={{ fontSize: "11px" }}>
              <tr>
                <th className="px-3 py-2 text-left">Tên thiết bị</th>
                <th className="px-3 py-2 text-left">Danh mục</th>
                <th className="px-3 py-2 text-right">SL</th>
                <th className="px-3 py-2 text-right">Đơn giá</th>
                <th className="px-3 py-2 text-right">Thành tiền</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
              {form.equipment.map((e, i) => (
                <tr key={i} className="hover:bg-secondary/30">
                  <td className="px-3 py-2">
                    <p style={{ fontWeight: 500 }}>{e.name}</p>
                    {e.specs && <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{e.specs}</p>}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{e.category}</td>
                  <td className="px-3 py-2 text-right">{e.qty}</td>
                  <td className="px-3 py-2 text-right">{formatVND(e.unitPrice)}</td>
                  <td className="px-3 py-2 text-right text-[#990803]" style={{ fontWeight: 600 }}>
                    {formatVND(e.qty * e.unitPrice)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => removeRow(i)} className="p-1 hover:text-destructive text-muted-foreground">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-secondary/30">
                <td colSpan={4} className="px-3 py-2 text-right text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>TỔNG CHI PHÍ THIẾT BỊ</td>
                <td className="px-3 py-2 text-right text-[#990803]" style={{ fontSize: "14px", fontWeight: 700 }}>{formatVND(totalCost)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Add section */}
      <div className="bg-secondary/30 rounded-xl border border-border p-4 space-y-3">
        {/* Mode switcher */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>+ Thêm thiết bị</p>
          <div className="flex gap-1">
            {(["picker", "manual"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setAddMode(m); setSelections({}); }}
                className={`px-3 py-1 rounded-lg border transition-all ${addMode === m ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"}`}
                style={{ fontSize: "11px", fontWeight: 500 }}
              >
                {m === "picker" ? "Chọn từ danh mục" : "Nhập thủ công"}
              </button>
            ))}
          </div>
        </div>

        {addMode === "picker" ? (
          <div className="space-y-2.5">
            {/* Search + category filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Tìm tên / SKU / hãng..."
                  className="w-full pl-8 pr-3 py-1.5 bg-card border border-border rounded-lg outline-none"
                  style={{ fontSize: "12px" }}
                />
              </div>
              <select
                value={pickerCat}
                onChange={(e) => setPickerCat(e.target.value)}
                className="px-2.5 py-1.5 bg-card border border-border rounded-lg"
                style={{ fontSize: "11.5px" }}
              >
                <option value="all">Tất cả ({DEVICES.length})</option>
                {DEVICE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Device list — multi-select with inline qty */}
            <div className="max-h-56 overflow-y-auto rounded-lg border border-border bg-card divide-y divide-border">
              {pickerDevices.length === 0 ? (
                <p className="text-center py-6 text-muted-foreground" style={{ fontSize: "12px" }}>Không tìm thấy thiết bị</p>
              ) : pickerDevices.map((d) => {
                const isSelected = selections[d.id] !== undefined;
                const qty = selections[d.id] ?? 1;
                return (
                  <div
                    key={d.id}
                    onClick={() => toggleDevice(d)}
                    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer select-none transition-colors ${isSelected ? "bg-[#990803]/5" : "hover:bg-secondary/40"}`}
                  >
                    {/* Checkbox */}
                    <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all ${isSelected ? "border-[#990803] bg-[#990803]" : "border-border bg-card"}`}>
                      {isSelected && <span className="text-white leading-none" style={{ fontSize: "9px", fontWeight: 900 }}>✓</span>}
                    </div>

                    {/* Name + specs */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate" style={{ fontSize: "12.5px", fontWeight: isSelected ? 600 : 500 }}>{d.name}</p>
                      <p className="text-muted-foreground truncate" style={{ fontSize: "10.5px" }}>{d.brand} · {d.specs}</p>
                    </div>

                    {/* Category */}
                    <span className="px-1.5 py-0.5 bg-[#0891b2]/10 text-[#0891b2] rounded shrink-0" style={{ fontSize: "10px", fontWeight: 600 }}>{d.category}</span>

                    {/* Price */}
                    <p className="text-[#990803] shrink-0" style={{ fontSize: "12px", fontWeight: 700, minWidth: "76px", textAlign: "right" }}>{formatVND(d.unitPriceVND)}</p>

                    {/* Inline qty — only when selected */}
                    {isSelected ? (
                      <input
                        type="number" min={1} value={qty}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setDeviceQty(d.id, Number(e.target.value))}
                        className="w-14 px-1.5 py-1 bg-card border border-[#990803]/40 rounded text-center shrink-0"
                        style={{ fontSize: "12px" }}
                      />
                    ) : (
                      <div className="w-14 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary + add all button */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-3 px-3 py-2.5 bg-[#990803]/5 border border-[#990803]/20 rounded-lg">
                <div className="flex-1 min-w-0">
                  <span className="text-[#990803]" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    {selectedCount} thiết bị đã chọn
                  </span>
                  <span className="text-muted-foreground ml-2" style={{ fontSize: "11.5px" }}>
                    · Tổng: {formatVND(selectedTotal)}
                  </span>
                </div>
                <button
                  onClick={addAllFromPicker}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] shrink-0"
                  style={{ fontSize: "12px", fontWeight: 500 }}
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm {selectedCount} vào BOM
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Manual input fallback */
          <div className="space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Tên thiết bị *" className="px-3 py-2 bg-card border border-border rounded-lg col-span-2" style={{ fontSize: "12px" }} />
              <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                placeholder="Danh mục" className="px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }} />
              <input value={draft.specs} onChange={(e) => setDraft({ ...draft, specs: e.target.value })}
                placeholder="Thông số (tuỳ chọn)" className="px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }} />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 flex-1">
                <label className="text-muted-foreground shrink-0" style={{ fontSize: "11px" }}>SL</label>
                <input type="number" min={1} value={draft.qty} onChange={(e) => setDraft({ ...draft, qty: Number(e.target.value) })}
                  className="w-20 px-2 py-2 bg-card border border-border rounded-lg text-center" style={{ fontSize: "12px" }} />
              </div>
              <div className="flex items-center gap-1.5 flex-1">
                <label className="text-muted-foreground shrink-0" style={{ fontSize: "11px" }}>Đơn giá (VND)</label>
                <input type="number" min={0} value={draft.unitPrice || ""} onChange={(e) => setDraft({ ...draft, unitPrice: Number(e.target.value) })}
                  placeholder="0" className="flex-1 px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }} />
              </div>
              <button onClick={addManual}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602]"
                style={{ fontSize: "12px", fontWeight: 500 }}>
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TAB 3 — Phần mềm & License                                      */
/* ================================================================ */
function Tab3({ form, set }: { form: PkgForm; set: (f: PkgForm) => void }) {
  const [draft, setDraft] = useState<SoftwareRow>({ name: "", version: "1.0", qty: 30, duration: "1yr" });

  const addRow = () => {
    if (!draft.name.trim()) { toast.error("Nhập tên phần mềm"); return; }
    set({ ...form, software: [...form.software, { ...draft }] });
    setDraft({ name: "", version: "1.0", qty: 30, duration: "1yr" });
  };
  const removeRow = (i: number) => set({ ...form, software: form.software.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>Phần mềm & License</h3>
        <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Tab này không bắt buộc. License type luôn là <strong>per_user</strong> theo BR-04.</p>
      </div>

      {form.software.length > 0 && (
        <div className="space-y-2">
          {form.software.map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl border border-border">
              <Cpu className="w-4 h-4 text-[#7c3aed] shrink-0" />
              <div className="flex-1">
                <p style={{ fontSize: "13px", fontWeight: 500 }}>{s.name}</p>
                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                  v{s.version} · per_user · {s.qty} seats · {DURATION_LABELS[s.duration]}
                </p>
              </div>
              <button onClick={() => removeRow(i)} className="p-1 hover:text-destructive text-muted-foreground">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-secondary/30 rounded-xl border border-border p-4">
        <p className="text-muted-foreground mb-3" style={{ fontSize: "12px", fontWeight: 600 }}>+ Thêm phần mềm</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Tên phần mềm / ứng dụng *" className="px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }} />
          <input value={draft.version} onChange={(e) => setDraft({ ...draft, version: e.target.value })}
            placeholder="Phiên bản (VD: 2.1)" className="px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }} />
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-muted-foreground block mb-1" style={{ fontSize: "11px" }}>Số lượng seats</label>
            <input type="number" min={1} value={draft.qty} onChange={(e) => setDraft({ ...draft, qty: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }} />
          </div>
          <div className="flex-1">
            <label className="text-muted-foreground block mb-1" style={{ fontSize: "11px" }}>Thời hạn</label>
            <select value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value as SoftwareRow["duration"] })}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }}>
              <option value="1yr">1 năm</option>
              <option value="3yr">3 năm</option>
              <option value="perpetual">Vĩnh viễn</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-muted-foreground block mb-1" style={{ fontSize: "11px" }}>License type</label>
            <div className="px-3 py-2 bg-secondary rounded-lg text-muted-foreground" style={{ fontSize: "12px" }}>
              per_user (BR-04)
            </div>
          </div>
          <button onClick={addRow} className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602]"
            style={{ fontSize: "12px", fontWeight: 500 }}>
            <Plus className="w-3.5 h-3.5" /> Thêm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TAB 4 — Nội dung & Tài nguyên                                   */
/* ================================================================ */

type ResolvedLesson = {
  id: string; title: string; program: StemProgram; grade: string;
  duration: number; subject: string; source: "bank" | "studio"; thumbnail?: string;
  studioStatus?: "draft" | "review" | "published";
};

const STUDIO_STATUS_META = {
  draft:     { label: "Nháp",      bg: "#64748b20", text: "#64748b" },
  review:    { label: "Chờ duyệt", bg: "#f59e0b20", text: "#d97706" },
  published: { label: "Published", bg: "#16a34a15", text: "#16a34a" },
};

function Tab4({ form, set }: { form: PkgForm; set: (f: PkgForm) => void }) {
  /* ── Picker state ── */
  const [bankSearch, setBankSearch] = useState("");
  const [bankCtFilter, setBankCtFilter] = useState("all");
  const [bankSel, setBankSel] = useState<Set<string>>(new Set());
  const [studioSel, setStudioSel] = useState<Set<string>>(new Set());

  /* ── Teacher doc state ── */
  const [docUrl, setDocUrl] = useState("");

  /* ── Ngân hàng: lọc theo ctPrograms + search + CT tab ── */
  const bankLessons = useMemo(() => lessons.filter((l) => {
    if (form.ctPrograms.length > 0 && !form.ctPrograms.includes(l.programCode)) return false;
    if (bankCtFilter !== "all" && l.programCode !== bankCtFilter) return false;
    if (bankSearch) {
      const q = bankSearch.toLowerCase();
      return l.title.toLowerCase().includes(q) || l.subject.toLowerCase().includes(q);
    }
    return true;
  }), [form.ctPrograms, bankSearch, bankCtFilter]);

  /* ── Studio: TẤT CẢ bài (draft/review/published) + lọc theo ctPrograms ── */
  const studioLessons = useMemo(() => STUDIO_LESSONS.filter((d) =>
    form.ctPrograms.length === 0 || form.ctPrograms.includes(d.program)
  ), [form.ctPrograms]);

  /* ── Resolve IDs → tên bài + metadata ── */
  const resolvedSelected = useMemo((): ResolvedLesson[] =>
    form.contentLessonIds.map((id) => {
      const b = lessons.find((l) => l.id === id);
      if (b) return { id, title: b.title, program: b.programCode, grade: b.gradeLevel, duration: b.durationMinutes, subject: b.subject, source: "bank", thumbnail: b.thumbnail };
      const s = STUDIO_LESSONS.find((d) => d.id === id);
      if (s) return { id, title: s.title, program: s.program, grade: s.grade, duration: s.durationMinutes, subject: s.subject, source: "studio", studioStatus: s.status };
      return null;
    }).filter((x): x is ResolvedLesson => x !== null),
  [form.contentLessonIds]);

  /* ── Handlers ── */
  const toggleBank = (id: string) => setBankSel((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const toggleStudio = (id: string) => setStudioSel((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const addBank = () => {
    const toAdd = Array.from(bankSel).filter((id) => !form.contentLessonIds.includes(id));
    if (!toAdd.length) { setBankSel(new Set()); return; }
    set({ ...form, contentLessonIds: [...form.contentLessonIds, ...toAdd] });
    setBankSel(new Set());
    toast.success(`Đã thêm ${toAdd.length} bài giảng vào gói`);
  };
  const addStudio = () => {
    const toAdd = Array.from(studioSel).filter((id) => !form.contentLessonIds.includes(id));
    if (!toAdd.length) { setStudioSel(new Set()); return; }
    set({ ...form, contentLessonIds: [...form.contentLessonIds, ...toAdd] });
    setStudioSel(new Set());
    toast.success(`Đã thêm ${toAdd.length} bài từ Studio vào gói`);
  };
  const removeLesson = (id: string) =>
    set({ ...form, contentLessonIds: form.contentLessonIds.filter((x) => x !== id) });
  const addDoc = () => {
    if (!docUrl.trim()) return;
    set({ ...form, teacherDocUrls: [...form.teacherDocUrls, docUrl.trim()] });
    setDocUrl("");
  };
  const removeDoc = (i: number) =>
    set({ ...form, teacherDocUrls: form.teacherDocUrls.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>Nội dung & Tài nguyên</h3>
        <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
          Tab này không bắt buộc. Gắn bài giảng từ Ngân hàng hoặc Studio Biên soạn, và đính kèm tài liệu giáo viên.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── Bài giảng đã chọn (resolved) ── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {resolvedSelected.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border">
            <p style={{ fontSize: "13px", fontWeight: 600 }}>
              Bài giảng đã chọn
            </p>
            <span className="px-2 py-0.5 bg-[#990803] text-white rounded-full" style={{ fontSize: "10px", fontWeight: 700 }}>
              {resolvedSelected.length}
            </span>
          </div>
          <div className="divide-y divide-border">
            {resolvedSelected.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30">
                {item.thumbnail ? (
                  <img src={item.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-foreground" style={{ fontSize: "13px", fontWeight: 500 }}>{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <ProgramBadge code={item.program} size="xs" />
                    <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{item.grade}</span>
                    <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{item.duration}p</span>
                    <span
                      className="px-1.5 py-0.5 rounded"
                      style={{
                        fontSize: "9.5px", fontWeight: 600,
                        backgroundColor: item.source === "bank" ? "#0891b215" : "#7c3aed15",
                        color: item.source === "bank" ? "#0891b2" : "#7c3aed",
                      }}
                    >
                      {item.source === "bank" ? "Ngân hàng" : "Studio"}
                    </span>
                    {item.studioStatus && item.studioStatus !== "published" && (
                      <span
                        className="px-1.5 py-0.5 rounded"
                        style={{
                          fontSize: "9.5px", fontWeight: 600,
                          backgroundColor: STUDIO_STATUS_META[item.studioStatus].bg,
                          color: STUDIO_STATUS_META[item.studioStatus].text,
                        }}
                      >
                        {STUDIO_STATUS_META[item.studioStatus].label}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeLesson(item.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                  title="Gỡ bài giảng"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── Section A: Ngân hàng Nội dung ── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
          <BookOpen className="w-4 h-4 text-[#0891b2] shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 style={{ fontSize: "13px", fontWeight: 600 }}>Ngân hàng Nội dung</h4>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
              {lessons.length} bài giảng chuẩn CT1–CT5 — lọc theo chương trình bạn chọn ở Tab 1
            </p>
          </div>
          {form.ctPrograms.length > 0 && (
            <span className="text-muted-foreground shrink-0" style={{ fontSize: "11px" }}>
              {bankLessons.length} bài phù hợp
            </span>
          )}
        </div>

        <div className="p-4">
          {form.ctPrograms.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground" style={{ fontSize: "12px" }}>
              Chọn Chương trình STEM ở Tab 1 để lọc bài giảng phù hợp.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Search + CT filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    placeholder="Tìm tiêu đề, môn học..."
                    className="w-full pl-8 pr-3 py-1.5 bg-input-background border border-border rounded-lg outline-none"
                    style={{ fontSize: "12px" }}
                  />
                </div>
                <select
                  value={bankCtFilter}
                  onChange={(e) => setBankCtFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-card border border-border rounded-lg"
                  style={{ fontSize: "11.5px" }}
                >
                  <option value="all">Tất cả CT ({form.ctPrograms.length})</option>
                  {form.ctPrograms.map((c) => (
                    <option key={c} value={c}>{c} — {STEM_PROGRAMS[c].shortName}</option>
                  ))}
                </select>
              </div>

              {/* Lesson list */}
              <div className="max-h-56 overflow-y-auto rounded-lg border border-border bg-secondary/20 divide-y divide-border">
                {bankLessons.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground" style={{ fontSize: "12px" }}>
                    Không có bài phù hợp
                  </p>
                ) : bankLessons.map((l) => {
                  const isSel = bankSel.has(l.id);
                  const isAdded = form.contentLessonIds.includes(l.id);
                  return (
                    <div
                      key={l.id}
                      onClick={() => !isAdded && toggleBank(l.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 transition-colors select-none ${
                        isAdded ? "opacity-60 cursor-default" : `cursor-pointer ${isSel ? "bg-[#0891b2]/5" : "hover:bg-secondary/50"}`
                      }`}
                    >
                      {/* Checkbox */}
                      {isAdded ? (
                        <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                      ) : (
                        <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all ${isSel ? "border-[#0891b2] bg-[#0891b2]" : "border-border bg-card"}`}>
                          {isSel && <span className="text-white leading-none" style={{ fontSize: "9px", fontWeight: 900 }}>✓</span>}
                        </div>
                      )}
                      {/* Thumbnail */}
                      <img src={l.thumbnail} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="truncate" style={{ fontSize: "12.5px", fontWeight: isSel ? 600 : 500 }}>{l.title}</p>
                        <p className="text-muted-foreground truncate" style={{ fontSize: "10.5px" }}>{l.subject} · {l.gradeLevel}</p>
                      </div>
                      {/* Meta right */}
                      <div className="flex items-center gap-2 shrink-0">
                        <ProgramBadge code={l.programCode} size="xs" />
                        <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{l.durationMinutes}p</span>
                        {isAdded && (
                          <span className="text-[#16a34a]" style={{ fontSize: "10px", fontWeight: 600 }}>Đã thêm</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary + add button */}
              {bankSel.size > 0 && (
                <div className="flex items-center justify-between px-3 py-2.5 bg-[#0891b2]/5 border border-[#0891b2]/20 rounded-lg">
                  <span className="text-[#0891b2]" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    {bankSel.size} bài đã chọn
                  </span>
                  <button
                    onClick={addBank}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0891b2] text-white rounded-lg hover:bg-[#0779a0]"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm {bankSel.size} vào gói
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── Section B: Studio Biên soạn ── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
          <Edit className="w-4 h-4 text-[#7c3aed] shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 style={{ fontSize: "13px", fontWeight: 600 }}>Bài tự biên soạn — Studio</h4>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
              Toàn bộ pipeline Studio của bạn (nháp → chờ duyệt → published) — lọc theo chương trình
            </p>
          </div>
          <Link
            to="/supplier/content/authoring"
            className="flex items-center gap-0.5 text-[#7c3aed] hover:underline shrink-0 transition-opacity hover:opacity-80"
            style={{ fontSize: "11.5px", fontWeight: 500 }}
          >
            Soạn bài mới <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-4">
          {form.ctPrograms.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground" style={{ fontSize: "12px" }}>
              Chọn Chương trình STEM ở Tab 1 trước.
            </p>
          ) : studioLessons.length === 0 ? (
            <div className="flex items-start gap-3 py-5 px-4 rounded-xl border border-dashed bg-[#7c3aed]/5" style={{ borderColor: "#7c3aed40" }}>
              <Edit className="w-8 h-8 text-[#7c3aed]/25 shrink-0 mt-0.5" />
              <div>
                <p style={{ fontSize: "12.5px", fontWeight: 600 }}>
                  Chưa có bài giảng nào trong Studio cho {form.ctPrograms.join(", ")}
                </p>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "11.5px", lineHeight: 1.5 }}>
                  Vào Studio Biên soạn để tạo bài giảng mới — bài sẽ hiện ở đây ngay khi bắt đầu soạn.
                </p>
                <Link
                  to="/supplier/content/authoring"
                  className="inline-flex items-center gap-1 mt-2.5 text-[#7c3aed] hover:underline"
                  style={{ fontSize: "11.5px", fontWeight: 500 }}
                >
                  Vào Studio Biên soạn <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Studio lesson list — all statuses */}
              <div className="rounded-lg border border-border bg-secondary/20 divide-y divide-border">
                {studioLessons.map((d) => {
                  const isSel = studioSel.has(d.id);
                  const isAdded = form.contentLessonIds.includes(d.id);
                  const sm = STUDIO_STATUS_META[d.status];
                  return (
                    <div
                      key={d.id}
                      onClick={() => !isAdded && toggleStudio(d.id)}
                      className={`flex items-center gap-3 px-3 py-2.5 transition-colors select-none ${
                        isAdded ? "opacity-60 cursor-default" : `cursor-pointer ${isSel ? "bg-[#7c3aed]/5" : "hover:bg-secondary/50"}`
                      }`}
                    >
                      {/* Checkbox */}
                      {isAdded ? (
                        <CheckCircle2 className="w-4 h-4 text-[#16a34a] shrink-0" />
                      ) : (
                        <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all ${isSel ? "border-[#7c3aed] bg-[#7c3aed]" : "border-border bg-card"}`}>
                          {isSel && <span className="text-white leading-none" style={{ fontSize: "9px", fontWeight: 900 }}>✓</span>}
                        </div>
                      )}
                      {/* Phase progress bar (4 phases as mini color strip) */}
                      <div className="w-8 h-8 rounded overflow-hidden flex flex-col shrink-0 border border-border">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex-1"
                            style={{ backgroundColor: i < d.phasesComplete ? "#7c3aed" : "#e2e8f0" }}
                          />
                        ))}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="truncate" style={{ fontSize: "12.5px", fontWeight: isSel ? 600 : 500 }}>{d.title}</p>
                        <p className="text-muted-foreground truncate" style={{ fontSize: "10.5px" }}>{d.subject} · {d.grade}</p>
                      </div>
                      {/* Meta right */}
                      <div className="flex items-center gap-2 shrink-0">
                        <ProgramBadge code={d.program} size="xs" />
                        <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{d.durationMinutes}p</span>
                        <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9.5px", fontWeight: 600, backgroundColor: sm.bg, color: sm.text }}>
                          {sm.label}
                        </span>
                        {isAdded && (
                          <span className="text-[#16a34a]" style={{ fontSize: "10px", fontWeight: 600 }}>Đã thêm</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Draft warning */}
              {studioSel.size > 0 && Array.from(studioSel).some((id) => {
                const d = STUDIO_LESSONS.find((x) => x.id === id);
                return d && d.status !== "published";
              }) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#d97706] shrink-0" />
                  <p className="text-[#d97706]" style={{ fontSize: "11.5px" }}>
                    Có bài chưa publish — sẽ không hiển thị cho trường cho đến khi được duyệt.
                  </p>
                </div>
              )}

              {/* Summary + add button */}
              {studioSel.size > 0 && (
                <div className="flex items-center justify-between px-3 py-2.5 bg-[#7c3aed]/5 border border-[#7c3aed]/20 rounded-lg">
                  <span className="text-[#7c3aed]" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                    {studioSel.size} bài đã chọn
                  </span>
                  <button
                    onClick={addStudio}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9]"
                    style={{ fontSize: "12px", fontWeight: 500 }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm {studioSel.size} vào gói
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── Tài liệu Giáo viên ── */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <UploadCloud className="w-4 h-4 text-[#16a34a]" />
          <h4 style={{ fontSize: "13px", fontWeight: 600 }}>Tài liệu Giáo viên</h4>
        </div>
        {form.teacherDocUrls.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {form.teacherDocUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg">
                <FileText className="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                <span className="flex-1 truncate" style={{ fontSize: "11px" }}>{url}</span>
                <button onClick={() => removeDoc(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            placeholder="URL tài liệu (PDF / PPT / DOCX)..."
            onKeyDown={(e) => e.key === "Enter" && addDoc()}
            className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg"
            style={{ fontSize: "12px" }}
          />
          <button onClick={addDoc} className="px-3 py-2 bg-[#16a34a] text-white rounded-lg hover:bg-[#15803d]" style={{ fontSize: "12px" }}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => toast.info("Upload file tài liệu GV")}
          className="mt-2 w-full py-2 border border-dashed border-border rounded-lg text-muted-foreground hover:bg-secondary/50"
          style={{ fontSize: "12px" }}
        >
          <UploadCloud className="w-3.5 h-3.5 inline mr-1" /> Upload file
        </button>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  TAB 5 — Giá & Dịch vụ                                           */
/* ================================================================ */
function Tab5({ form, set }: { form: PkgForm; set: (f: PkgForm) => void }) {
  const up = (patch: Partial<PkgForm>) => set({ ...form, ...patch });
  const equipCost = form.equipment.reduce((s, e) => s + e.qty * e.unitPrice, 0);
  const floorPrice = Math.ceil(equipCost * 1.15);
  const floorOk = equipCost === 0 || form.referencePriceVND >= floorPrice;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>Định giá & Dịch vụ kèm theo</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Giá tham khảo */}
        <div className="md:col-span-2">
          <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Giá tham khảo (VND) *</label>
          <input
            type="number" min={0} value={form.referencePriceVND || ""}
            onChange={(e) => up({ referencePriceVND: Number(e.target.value) })}
            placeholder="0"
            className={`w-full px-3 py-2.5 bg-input-background border rounded-lg outline-none focus:ring-2 ${!floorOk ? "border-orange-400 focus:ring-orange-300" : "border-border focus:ring-[#990803]/30"}`}
            style={{ fontSize: "16px", fontWeight: 600 }}
          />
          {equipCost > 0 && (
            <div className={`mt-2 flex items-start gap-2 p-3 rounded-lg ${floorOk ? "bg-[#16a34a]/10" : "bg-orange-50 dark:bg-orange-900/20"}`}>
              {floorOk
                ? <CheckCircle2 className="w-4 h-4 text-[#16a34a] mt-0.5 shrink-0" />
                : <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
              }
              <div style={{ fontSize: "11.5px" }}>
                <p className={floorOk ? "text-[#16a34a]" : "text-orange-600"} style={{ fontWeight: 600 }}>
                  {floorOk ? "Floor price OK" : "Cảnh báo: Dưới floor price"}
                </p>
                <p className="text-muted-foreground">
                  Chi phí thiết bị: {formatVND(equipCost)} · Floor tối thiểu (×1.15): {formatVND(floorPrice)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Phí lắp đặt */}
        <div>
          <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Phí lắp đặt & nghiệm thu (VND)</label>
          <input type="number" min={0} value={form.installationFeeVND || ""}
            onChange={(e) => up({ installationFeeVND: Number(e.target.value) })}
            placeholder="0 = miễn phí"
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" style={{ fontSize: "13px" }} />
        </div>

        {/* Tập huấn GV */}
        <div>
          <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Số ngày tập huấn giáo viên</label>
          <input type="number" min={0} max={30} value={form.trainingDays}
            onChange={(e) => up({ trainingDays: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" style={{ fontSize: "13px" }} />
        </div>

        {/* Bảo hành */}
        <div>
          <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Thời hạn bảo hành thiết bị (tháng)</label>
          <select value={form.warrantyMonths} onChange={(e) => up({ warrantyMonths: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "13px" }}>
            {[0, 6, 12, 18, 24, 36, 48, 60].map((m) => (
              <option key={m} value={m}>{m === 0 ? "Không bảo hành" : `${m} tháng`}</option>
            ))}
          </select>
        </div>

        {/* Hiển thị giá */}
        <div>
          <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px" }}>Hiển thị giá cho trường</label>
          <div className="flex gap-2">
            {[true, false].map((v) => (
              <button key={String(v)} onClick={() => up({ priceVisible: v })}
                className={`flex-1 py-2 rounded-lg border transition-all ${form.priceVisible === v ? "bg-[#990803] text-white border-[#990803]" : "border-border bg-card hover:bg-secondary"}`}
                style={{ fontSize: "12px", fontWeight: 500 }}>
                {v ? "Hiển thị" : "Ẩn (nội bộ)"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      {form.referencePriceVND > 0 && (
        <div className="bg-gradient-to-br from-[#990803]/5 to-[#c8a84e]/5 rounded-xl border border-border p-4">
          <p className="text-foreground mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>Tổng kết chi phí gói</p>
          <div className="space-y-1.5" style={{ fontSize: "12px" }}>
            {equipCost > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Thiết bị</span><span>{formatVND(equipCost)}</span></div>}
            {form.installationFeeVND > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Lắp đặt</span><span>{formatVND(form.installationFeeVND)}</span></div>}
            {form.trainingDays > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tập huấn GV</span><span>{form.trainingDays} ngày (included)</span></div>}
            {form.warrantyMonths > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Bảo hành</span><span>{form.warrantyMonths} tháng (included)</span></div>}
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-foreground" style={{ fontWeight: 700 }}>Giá tham khảo</span>
              <span className="text-[#990803]" style={{ fontSize: "16px", fontWeight: 700 }}>{formatVND(form.referencePriceVND)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  TAB 6 — Xem trước & Publish                                     */
/* ================================================================ */
function Tab6({
  form, isNew, equipCost,
  onSaveDraft, onSubmit, onPublish, canPublish,
}: {
  form: PkgForm; isNew: boolean; equipCost: number;
  onSaveDraft: () => void; onSubmit: () => void; onPublish: () => void; canPublish: boolean;
}) {
  const t1ok = validateTab1(form);
  const t5ok = validateTab5(form);
  const floorOk = equipCost === 0 || form.referencePriceVND >= Math.ceil(equipCost * 1.15);

  const checks = [
    { ok: t1ok, label: "Tab 1: Thông tin cơ bản đầy đủ (tên, CT, khối, mô tả ≥50 ký tự)" },
    { ok: form.equipment.length > 0 || form.software.length > 0 || form.contentLessonIds.length > 0,
      label: "Tab 2/3/4: Có ít nhất 1 thành phần (thiết bị / phần mềm / nội dung)" },
    { ok: t5ok, label: "Tab 5: Giá tham khảo > 0" },
    { ok: floorOk, label: "Tab 5: Giá ≥ floor price (chi phí thiết bị × 1.15)" },
  ];
  const allOk = checks.every((c) => c.ok);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 600 }}>Xem trước & Publish</h3>
      </div>

      {/* Preview card */}
      <div className="max-w-xs">
        <div className="bg-card rounded-2xl border-2 border-[#990803]/20 overflow-hidden shadow-lg">
          <div className="h-28 relative" style={{ background: "linear-gradient(135deg, #99080322, #c8a84e11)" }}>
            {form.thumbnailUrl ? (
              <img src={form.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-80" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Package className="w-10 h-10 text-[#990803]/30" />
              </div>
            )}
            <div className="absolute top-2 left-2">
              {form.tier && <TierBadge tier={form.tier as StemPackageTier} size="sm" />}
            </div>
          </div>
          <div className="p-3 space-y-2">
            <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>{form.name || "(Chưa đặt tên)"}</p>
            <p className="text-muted-foreground line-clamp-2" style={{ fontSize: "11px" }}>{form.description || "(Chưa có mô tả)"}</p>
            <div className="flex flex-wrap gap-1">
              {form.ctPrograms.map((c) => <ProgramBadge key={c} code={c} size="xs" />)}
            </div>
            {form.referencePriceVND > 0 && (
              <p className="text-[#990803]" style={{ fontSize: "16px", fontWeight: 700 }}>{formatVND(form.referencePriceVND)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-foreground mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Checklist validation</p>
        <div className="space-y-2">
          {checks.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              {c.ok
                ? <CheckCircle2 className="w-4 h-4 text-[#16a34a] mt-0.5 shrink-0" />
                : <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
              }
              <p className={c.ok ? "text-foreground" : "text-orange-500"} style={{ fontSize: "12px" }}>{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onSaveDraft}
          className="flex items-center gap-1.5 px-4 py-2.5 border border-border bg-card rounded-lg hover:bg-secondary"
          style={{ fontSize: "13px", fontWeight: 500 }}
        >
          <Save className="w-4 h-4" />
          Lưu nháp
        </button>
        <button
          onClick={onSubmit}
          disabled={!allOk || !floorOk}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#c8a84e] text-white rounded-lg hover:bg-[#b8983e] disabled:opacity-40"
          style={{ fontSize: "13px", fontWeight: 500 }}
        >
          <Send className="w-4 h-4" />
          Gửi duyệt
        </button>
        {canPublish && (
          <button
            onClick={onPublish}
            disabled={!allOk || !floorOk}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#16a34a] text-white rounded-lg hover:bg-[#15803d] disabled:opacity-40"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Publish ngay
          </button>
        )}
      </div>
      {!allOk && (
        <p className="text-orange-500" style={{ fontSize: "12px" }}>
          Hoàn thành các mục còn thiếu trong checklist để có thể gửi duyệt.
        </p>
      )}
    </div>
  );
}

/* ================================================================ */
/*  MAIN COMPONENT                                                   */
/* ================================================================ */
export function STEMPackageConfigurator() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id || id === "new";
  const canPublish = user?.role === "supplier_admin";

  const found = isNew ? null : stemPackages.find((p) => p.id === id);
  const [form, setForm] = useState<PkgForm>(() => (found ? pkgToForm(found) : { ...EMPTY_FORM }));
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);

  const equipCost = useMemo(
    () => form.equipment.reduce((s, e) => s + e.qty * e.unitPrice, 0),
    [form.equipment],
  );
  const floorOk = equipCost === 0 || form.referencePriceVND >= Math.ceil(equipCost * 1.15);

  if (!isNew && !found) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không tìm thấy gói STEM có ID "{id}"</p>
        <Link to="/supplier/packages" className="text-[#990803] hover:underline mt-2 inline-block">← Về danh mục</Link>
      </div>
    );
  }

  const tabValid: Record<number, boolean> = {
    1: validateTab1(form),
    2: true,
    3: true,
    4: true,
    5: validateTab5(form) && floorOk,
    6: validateTab1(form) && validateTab5(form) && floorOk,
  };

  const handleSaveDraft = () => {
    toast.success(isNew ? "Đã tạo gói nháp mới" : `Đã lưu nháp "${form.name}"`);
    if (isNew) navigate("/supplier/packages");
  };
  const handleSubmit = () => {
    toast.success(`Đã gửi gói "${form.name}" để duyệt`);
    navigate("/supplier/packages");
  };
  const handlePublish = () => {
    toast.success(`Gói "${form.name}" đã được publish!`);
    navigate("/supplier/packages");
  };

  return (
    <div className="space-y-0">
      <PageHeader
        icon={Settings}
        title={isNew ? "Tạo gói mới" : form.name || "Cấu hình gói"}
        subtitle={isNew ? "Điền thông tin qua 6 bước để hoàn thiện gói STEM" : "Chỉnh sửa cấu hình gói STEM"}
        actions={
          <>
            <Link to="/supplier/packages"
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <ArrowLeft className="w-4 h-4" /> Về danh mục
            </Link>
            <button onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Save className="w-4 h-4" /> Lưu nháp
            </button>
          </>
        }
      />

      {/* Tab navigation */}
      <div className="border-b border-border bg-card">
        <div className="flex overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const valid = tabValid[t.id];
            const isActive = activeTab === t.id;
            const showDot = t.id < 6 && !valid && (form.name.length > 0 || form.equipment.length > 0);
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                  isActive ? "border-[#990803] text-[#990803]" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400 }}
              >
                <Icon className="w-4 h-4" />
                {t.id}. {t.label}
                {showDot && <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="pt-5">
        {activeTab === 1 && <Tab1 form={form} set={setForm} />}
        {activeTab === 2 && <Tab2 form={form} set={setForm} />}
        {activeTab === 3 && <Tab3 form={form} set={setForm} />}
        {activeTab === 4 && <Tab4 form={form} set={setForm} />}
        {activeTab === 5 && <Tab5 form={form} set={setForm} />}
        {activeTab === 6 && (
          <Tab6
            form={form} isNew={isNew} equipCost={equipCost}
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            onPublish={handlePublish}
            canPublish={canPublish}
          />
        )}
      </div>

      {/* Bottom nav */}
      <div className="flex justify-between pt-6 border-t border-border mt-6">
        <button
          disabled={activeTab === 1}
          onClick={() => setActiveTab((t) => Math.max(1, t - 1) as typeof activeTab)}
          className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-30"
          style={{ fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" /> Bước trước
        </button>
        {activeTab < 6 ? (
          <button
            onClick={() => setActiveTab((t) => Math.min(6, t + 1) as typeof activeTab)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602]"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            Bước tiếp theo <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px" }}>
              <Save className="w-4 h-4" /> Lưu nháp
            </button>
            <button onClick={handleSubmit} disabled={!tabValid[6]}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#c8a84e] text-white rounded-lg hover:bg-[#b8983e] disabled:opacity-40"
              style={{ fontSize: "13px", fontWeight: 500 }}>
              <Send className="w-4 h-4" /> Gửi duyệt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default STEMPackageConfigurator;
