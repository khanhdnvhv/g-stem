import { useState } from "react";
import {
  ShoppingBag, Smartphone, Send, Calculator,
  Boxes, Plus, Minus, Check, X,
} from "lucide-react";
import { stemPackages, tenantsByType } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { TierBadge } from "../ui/badges";
import { formatVND, formatVNDCompact } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  SALES APP — Chế độ "bán hàng" tối ưu cho mobile                  */
/*  Báo giá nhanh, tạo đơn trên điện thoại                           */
/* ================================================================ */

interface QuoteItem {
  packageId: string;
  quantity: number;
}

export function SalesApp() {
  const [selectedSchool, setSelectedSchool] = useState<string>(tenantsByType.school[0].id);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [discount, setDiscount] = useState(0);

  const addItem = (packageId: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.packageId === packageId);
      if (existing) return prev.map((i) =>
        i.packageId === packageId ? { ...i, quantity: i.quantity + 1 } : i
      );
      return [...prev, { packageId, quantity: 1 }];
    });
  };
  const removeItem = (packageId: string) => {
    setItems((prev) => prev.filter((i) => i.packageId !== packageId));
  };
  const updateQty = (packageId: string, qty: number) => {
    if (qty <= 0) { removeItem(packageId); return; }
    setItems((prev) => prev.map((i) => i.packageId === packageId ? { ...i, quantity: qty } : i));
  };

  const subtotal = items.reduce((s, it) => {
    const pkg = stemPackages.find((p) => p.id === it.packageId);
    return s + (pkg?.priceVND || 0) * it.quantity;
  }, 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const school = tenantsByType.school.find((s) => s.id === selectedSchool);

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <PageHeader
        icon={ShoppingBag}
        title="Sales App"
        subtitle="Báo giá nhanh, tạo đơn trên điện thoại cho nhân viên kinh doanh ngoài trường."
        badge={
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#c8a84e]/15 text-[#c8a84e] rounded-md" style={{ fontSize: "11px", fontWeight: 600 }}>
            <Smartphone className="w-3 h-3" />
            Chế độ mobile
          </span>
        }
      />

      {/* School select */}
      <div className="bg-card rounded-xl border border-border p-4">
        <label className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>KHÁCH HÀNG</label>
        <select
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
          className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none"
          style={{ fontSize: "13px" }}
        >
          {tenantsByType.school.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.province}</option>
          ))}
        </select>
        {school && (
          <p className="text-muted-foreground mt-2" style={{ fontSize: "11.5px" }}>
            {school.address || `${school.district}, ${school.province}`}
            {school.contactEmail && <> · {school.contactEmail}</>}
          </p>
        )}
      </div>

      {/* Packages quick-select */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
            <Boxes className="w-4 h-4 inline mr-1.5" />
            Chọn nhanh gói STEM
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {stemPackages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => addItem(pkg.id)}
              className="border border-border bg-secondary/30 rounded-lg p-3 text-left hover:shadow-md transition-all"
            >
              <TierBadge tier={pkg.tier} size="xs" />
              <p className="mt-2 text-foreground truncate" style={{ fontSize: "13px", fontWeight: 600 }}>
                {pkg.name}
              </p>
              <p className="text-[#990803] mt-1" style={{ fontSize: "14px", fontWeight: 700 }}>
                {formatVNDCompact(pkg.priceVND)}
              </p>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10px" }}>
                + Thêm vào báo giá
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Quote items */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
            Báo giá ({items.length} mục)
          </h3>
          {items.length > 0 && (
            <button
              onClick={() => setItems([])}
              className="text-muted-foreground hover:text-destructive flex items-center gap-1"
              style={{ fontSize: "12px" }}
            >
              <X className="w-3 h-3" /> Xóa hết
            </button>
          )}
        </div>
        <div className="divide-y divide-border">
          {items.length === 0 && (
            <div className="p-8 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
              Chọn gói STEM ở trên để bắt đầu báo giá.
            </div>
          )}
          {items.map((it) => {
            const pkg = stemPackages.find((p) => p.id === it.packageId)!;
            return (
              <div key={it.packageId} className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 500 }}>
                    {pkg.name}
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                    Đơn giá: {formatVND(pkg.priceVND)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(it.packageId, it.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-secondary hover:bg-secondary/70 flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center" style={{ fontSize: "14px", fontWeight: 700 }}>
                    {it.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(it.packageId, it.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-secondary hover:bg-secondary/70 flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[#990803] min-w-[100px] text-right" style={{ fontSize: "13px", fontWeight: 700 }}>
                  {formatVND(pkg.priceVND * it.quantity)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discount + total */}
      {items.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Calculator className="w-4 h-4 text-muted-foreground" />
            <label className="flex-1 text-muted-foreground" style={{ fontSize: "12px" }}>Chiết khấu (%)</label>
            <input
              type="number"
              min={0} max={50}
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Math.min(50, Number(e.target.value) || 0)))}
              className="w-20 px-3 py-1.5 bg-input-background border border-border rounded text-right"
              style={{ fontSize: "13px", fontWeight: 600 }}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between" style={{ fontSize: "13px" }}>
              <span className="text-muted-foreground">Tạm tính</span>
              <span>{formatVND(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex items-center justify-between" style={{ fontSize: "13px" }}>
                <span className="text-muted-foreground">Chiết khấu ({discount}%)</span>
                <span className="text-[#dc2626]">-{formatVND(discountAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span style={{ fontSize: "14px", fontWeight: 600 }}>Tổng cộng</span>
              <span className="text-[#990803]" style={{ fontSize: "20px", fontWeight: 800 }}>
                {formatVND(total)}
              </span>
            </div>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.info("Gửi báo giá qua email / Zalo")}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-card border border-border rounded-lg hover:bg-secondary transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Send className="w-4 h-4" />
            Gửi báo giá
          </button>
          <button
            onClick={() => toast.success(`Đã tạo đơn hàng cho ${school?.name}`)}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            <Check className="w-4 h-4" />
            Tạo đơn hàng
          </button>
        </div>
      )}
    </div>
  );
}

export default SalesApp;
