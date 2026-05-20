import { useState } from "react";
import {
  ShoppingBag, Check, ArrowRight, ArrowLeft,
  Boxes, FileText, CreditCard, Clock, CheckCircle2,
  GraduationCap, Cpu, Package,
} from "lucide-react";
import { stemPackages, STEM_TIERS, tenantsByType, FUNDING_SOURCES } from "../../mock-data/index";
import type { StemPackage } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { TierBadge, ProgramBadge } from "../ui/badges";
import { formatVND, formatVNDCompact } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  SCHOOL PURCHASE FLOW — wizard 4 bước mua gói STEM                */
/*  1. Chọn gói  →  2. Cấu hình  →  3. Thanh toán  →  4. Xác nhận    */
/* ================================================================ */

const STEPS = [
  { id: 1, label: "Chọn gói",     icon: Boxes },
  { id: 2, label: "Cấu hình",     icon: FileText },
  { id: 3, label: "Thanh toán",   icon: CreditCard },
  { id: 4, label: "Xác nhận",     icon: CheckCircle2 },
];

const TIER_ICON = { minimum: Boxes, basic: Package, advanced: Cpu };

export function SchoolPurchaseFlow() {
  const [step, setStep] = useState(1);
  const [selectedPkg, setSelectedPkg] = useState<StemPackage | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [fundingSource, setFundingSource] = useState<typeof FUNDING_SOURCES[number]>("Ngân sách");
  const [distributorId, setDistributorId] = useState(tenantsByType.distributor[0]?.id || "");
  const [note, setNote] = useState("");

  const distributors = tenantsByType.distributor;
  const total = selectedPkg ? selectedPkg.priceVND * quantity : 0;

  const canNext =
    (step === 1 && !!selectedPkg) ||
    (step === 2 && quantity > 0) ||
    (step === 3 && !!distributorId) ||
    step === 4;

  const handleSubmit = () => {
    toast.success(`Đã gửi yêu cầu đặt mua ${selectedPkg?.name} × ${quantity} đến ${distributors.find((d) => d.id === distributorId)?.name}`);
    setStep(1); setSelectedPkg(null); setQuantity(1); setNote("");
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        icon={ShoppingBag}
        title="Đặt mua gói STEM"
        subtitle="Xem, so sánh và đặt mua gói phòng học STEM từ nhà cung cấp Geleximco qua đại lý phân phối."
        accentColor="#2563eb"
      />

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = step === s.id;
          const done = step > s.id;
          return (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  done ? "bg-[#16a34a] text-white"
                  : active ? "bg-[#2563eb] text-white shadow-lg"
                  : "bg-secondary text-muted-foreground"
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`hidden sm:inline ${active ? "text-foreground font-semibold" : "text-muted-foreground"}`}
                style={{ fontSize: "12.5px" }}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${done ? "bg-[#16a34a]" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-card rounded-xl border border-border p-5 min-h-[400px]">
        {step === 1 && (
          <>
            <h2 className="text-foreground mb-4" style={{ fontSize: "16px", fontWeight: 700 }}>
              Bước 1: Chọn gói phòng STEM phù hợp
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {stemPackages.map((p) => {
                const tier = STEM_TIERS[p.tier];
                const TIcon = TIER_ICON[p.tier];
                const selected = selectedPkg?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPkg(p)}
                    className={`text-left bg-card border-2 rounded-xl overflow-hidden transition-all ${
                      selected ? "shadow-lg -translate-y-0.5" : "border-border hover:shadow-md"
                    }`}
                    style={{ borderColor: selected ? tier.color : undefined }}
                  >
                    <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${tier.color}22, ${tier.color}08)` }}>
                      {p.thumbnails[0] ? (
                        <img src={p.thumbnails[0]} alt={p.name} className="w-full h-full object-cover opacity-70" />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <TIcon className="w-10 h-10" style={{ color: tier.color }} />
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <TierBadge tier={p.tier} size="md" />
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#16a34a] flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>{p.name}</h3>
                      <p className="text-[#990803] mt-1" style={{ fontSize: "16px", fontWeight: 700 }}>
                        {formatVND(p.priceVND)}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.supportedPrograms.map((c) => <ProgramBadge key={c} code={c} size="xs" />)}
                      </div>
                      <p className="text-muted-foreground mt-2 line-clamp-2" style={{ fontSize: "11.5px" }}>
                        {p.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-muted-foreground" style={{ fontSize: "11px" }}>
                        <GraduationCap className="w-3 h-3" />
                        {p.supportedGrades.slice(0, 2).join(", ")}{p.supportedGrades.length > 2 && "..."}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && selectedPkg && (
          <>
            <h2 className="text-foreground mb-4" style={{ fontSize: "16px", fontWeight: 700 }}>
              Bước 2: Cấu hình đơn hàng
            </h2>
            <div className="space-y-4">
              <div className="bg-secondary/40 rounded-lg p-4 flex items-center gap-3">
                <TierBadge tier={selectedPkg.tier} size="md" />
                <div className="flex-1">
                  <p style={{ fontSize: "14px", fontWeight: 600 }}>{selectedPkg.name}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>
                    {formatVND(selectedPkg.priceVND)} / gói
                  </p>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>SỐ LƯỢNG</label>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg bg-secondary hover:bg-secondary/70 flex items-center justify-center">−</button>
                  <input
                    type="number" min={1} value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="w-20 px-3 py-2 text-center bg-input-background border border-border rounded-lg outline-none"
                    style={{ fontSize: "16px", fontWeight: 700 }}
                  />
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg bg-secondary hover:bg-secondary/70 flex items-center justify-center">+</button>
                  <span className="text-muted-foreground ml-2" style={{ fontSize: "12px" }}>phòng/gói</span>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>NGUỒN KINH PHÍ</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {FUNDING_SOURCES.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFundingSource(f)}
                      className={`px-3 py-2 rounded-lg border ${
                        fundingSource === f ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-card border-border hover:bg-secondary"
                      }`}
                      style={{ fontSize: "12px", fontWeight: 500 }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>GHI CHÚ (TÙY CHỌN)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: ưu tiên lắp đặt trước 15/8 để kịp năm học mới..."
                  className="w-full mt-1 px-3 py-2 bg-input-background border border-border rounded-lg outline-none resize-none"
                  rows={3}
                  style={{ fontSize: "12.5px" }}
                />
              </div>
            </div>
          </>
        )}

        {step === 3 && selectedPkg && (
          <>
            <h2 className="text-foreground mb-4" style={{ fontSize: "16px", fontWeight: 700 }}>
              Bước 3: Chọn đại lý môi giới & Phương thức thanh toán
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground" style={{ fontSize: "11.5px", fontWeight: 600 }}>ĐẠI LÝ PHÂN PHỐI</label>
                <div className="space-y-2 mt-1">
                  {distributors.map((d) => (
                    <label
                      key={d.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        distributorId === d.id ? "border-[#2563eb] bg-[#2563eb]/5" : "border-border hover:bg-secondary"
                      }`}
                    >
                      <input
                        type="radio" name="dist" checked={distributorId === d.id}
                        onChange={() => setDistributorId(d.id)} className="accent-[#2563eb]"
                      />
                      <div className="flex-1">
                        <p style={{ fontSize: "13px", fontWeight: 600 }}>{d.name}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                          Phạm vi: {d.coverageProvinces?.join(", ")}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-br from-[#c8a84e]/5 to-[#990803]/5 border border-border">
                <p className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>TỔNG ƯỚC TÍNH</p>
                <p className="text-[#990803] mt-1" style={{ fontSize: "28px", fontWeight: 800 }}>
                  {formatVND(total)}
                </p>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "11.5px" }}>
                  {quantity} × {selectedPkg.name} · nguồn {fundingSource}
                </p>
              </div>
            </div>
          </>
        )}

        {step === 4 && selectedPkg && (
          <>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#16a34a]/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#16a34a]" />
              </div>
              <h2 className="text-foreground mt-3" style={{ fontSize: "18px", fontWeight: 700 }}>
                Xác nhận đặt mua
              </h2>
              <p className="text-muted-foreground" style={{ fontSize: "13px" }}>
                Kiểm tra lại thông tin trước khi gửi yêu cầu đến đại lý.
              </p>
            </div>
            <div className="mt-5 space-y-3 max-w-md mx-auto">
              <Row label="Gói" value={selectedPkg.name} />
              <Row label="Số lượng" value={`${quantity} phòng`} />
              <Row label="Đại lý" value={distributors.find((d) => d.id === distributorId)?.name || "—"} />
              <Row label="Nguồn kinh phí" value={fundingSource} />
              {note && <Row label="Ghi chú" value={note} />}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span style={{ fontSize: "14px", fontWeight: 600 }}>Tổng</span>
                <span className="text-[#990803]" style={{ fontSize: "18px", fontWeight: 800 }}>{formatVND(total)}</span>
              </div>
            </div>
            <p className="text-muted-foreground mt-4 text-center" style={{ fontSize: "11.5px" }}>
              <Clock className="w-3 h-3 inline mr-1" />
              Đơn hàng sẽ qua đại lý → NCC → phê duyệt → triển khai trong 14-21 ngày.
            </p>
          </>
        )}
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between">
        <button
          disabled={step === 1}
          onClick={() => setStep(Math.max(1, step - 1))}
          className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg bg-card hover:bg-secondary disabled:opacity-40"
          style={{ fontSize: "13px", fontWeight: 500 }}
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        {step < 4 ? (
          <button
            disabled={!canNext}
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            Tiếp theo <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#16a34a] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Check className="w-4 h-4" /> Gửi yêu cầu đặt mua
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 p-2.5 bg-secondary/40 rounded-md">
      <span className="text-muted-foreground" style={{ fontSize: "12px" }}>{label}</span>
      <span className="text-foreground text-right" style={{ fontSize: "12.5px", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default SchoolPurchaseFlow;
