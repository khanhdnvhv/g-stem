import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  Settings, ArrowLeft, Save, Plus, X, Boxes, Cpu, Sofa, Palette,
  GraduationCap, CheckCircle2, Package, DollarSign,
} from "lucide-react";
import { stemPackages, STEM_TIERS, STEM_PROGRAMS, GRADE_LEVELS } from "../../mock-data/index";
import type { StemPackage, StemProgram } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { TierBadge, ProgramBadge } from "../ui/badges";
import { formatVND } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  STEM PACKAGE CONFIGURATOR                                        */
/*  Khai báo tham số động cho gói: CSVC / thiết bị / nội thất / trang trí */
/* ================================================================ */

const PARAM_GROUPS = [
  { key: "infrastructure", label: "Thiết kế Cơ sở vật chất", icon: Package,  color: "#2563eb" },
  { key: "smartDevices",   label: "Thiết bị thông minh",     icon: Cpu,      color: "#7c3aed" },
  { key: "furniture",      label: "Nội thất chuyên dụng",    icon: Sofa,     color: "#0891b2" },
  { key: "decoration",     label: "Dịch vụ trang trí",       icon: Palette,  color: "#c8a84e" },
] as const;

type ParamKey = typeof PARAM_GROUPS[number]["key"];

function ParamGroupCard({
  group, items, onAdd, onRemove,
}: {
  group: typeof PARAM_GROUPS[number];
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (idx: number) => void;
}) {
  const [draft, setDraft] = useState("");
  const Icon = group.icon;
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: group.color + "15" }}
        >
          <Icon className="w-4 h-4" style={{ color: group.color }} />
        </div>
        <div>
          <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>{group.label}</h3>
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{items.length} tham số</p>
        </div>
      </div>

      <div className="space-y-1.5 mb-3 max-h-56 overflow-y-auto">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg group">
            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: group.color }} />
            <span className="flex-1 text-foreground" style={{ fontSize: "12px" }}>{it}</span>
            <button
              onClick={() => onRemove(idx)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-muted-foreground text-center py-4" style={{ fontSize: "11px" }}>
            Chưa có tham số. Thêm mới ở dưới.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Nhập tham số mới..."
          className="flex-1 px-3 py-1.5 bg-input-background border border-border rounded-lg outline-none focus:ring-2"
          style={{ fontSize: "12px" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onAdd(draft.trim());
              setDraft("");
            }
          }}
        />
        <button
          onClick={() => {
            if (draft.trim()) { onAdd(draft.trim()); setDraft(""); }
          }}
          className="px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors flex items-center gap-1"
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm
        </button>
      </div>
    </div>
  );
}

export function STEMPackageConfigurator() {
  const { id } = useParams<{ id: string }>();
  const found = stemPackages.find((p) => p.id === id);
  const [pkg, setPkg] = useState<StemPackage | null>(found ?? null);
  const [isDirty, setIsDirty] = useState(false);

  if (!pkg) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không tìm thấy gói STEM có ID "{id}"</p>
        <Link to="/supplier/packages" className="text-[#990803] hover:underline mt-2 inline-block">
          ← Về danh mục
        </Link>
      </div>
    );
  }

  const tier = STEM_TIERS[pkg.tier];
  const totalEquipVND = pkg.includedEquipment.reduce((s, e) => s + e.quantity * e.unitPriceVND, 0);

  const updateParam = (key: ParamKey, items: string[]) => {
    setPkg({ ...pkg, configuration: { ...pkg.configuration, [key]: items } });
    setIsDirty(true);
  };
  const addParam = (key: ParamKey, v: string) => updateParam(key, [...pkg.configuration[key], v]);
  const removeParam = (key: ParamKey, idx: number) =>
    updateParam(key, pkg.configuration[key].filter((_, i) => i !== idx));

  const toggleProgram = (code: StemProgram) => {
    const has = pkg.supportedPrograms.includes(code);
    const next = has
      ? pkg.supportedPrograms.filter((p) => p !== code)
      : [...pkg.supportedPrograms, code];
    setPkg({ ...pkg, supportedPrograms: next });
    setIsDirty(true);
  };
  const toggleGrade = (g: string) => {
    const has = pkg.supportedGrades.includes(g);
    const next = has
      ? pkg.supportedGrades.filter((x) => x !== g)
      : [...pkg.supportedGrades, g];
    setPkg({ ...pkg, supportedGrades: next });
    setIsDirty(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Settings}
        accentColor={tier.color}
        title={pkg.name}
        subtitle={`Cấu hình chi tiết gói ${tier.name} — tham số động 4 nhóm`}
        badge={<TierBadge tier={pkg.tier} size="md" />}
        actions={
          <>
            <Link
              to="/supplier/packages"
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <ArrowLeft className="w-4 h-4" />
              Về danh mục
            </Link>
            <button
              disabled={!isDirty}
              onClick={() => { toast.success(`Đã lưu cấu hình gói ${pkg.name}`); setIsDirty(false); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors disabled:opacity-50"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </button>
          </>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Giá tham khảo</p>
          <p className="text-[#990803]" style={{ fontSize: "18px", fontWeight: 700 }}>
            {formatVND(pkg.priceVND)}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Thiết bị</p>
          <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>
            {pkg.includedEquipment.reduce((s, e) => s + e.quantity, 0)} món
          </p>
          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
            {formatVND(totalEquipVND)}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Phần mềm</p>
          <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>
            {pkg.includedSoftware.length} ứng dụng
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Tham số động</p>
          <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>
            {Object.values(pkg.configuration).reduce((s, a) => s + a.length, 0)}
          </p>
        </div>
      </div>

      {/* Programs + Grades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-foreground mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>
            Chương trình hỗ trợ (CT1–CT5)
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(STEM_PROGRAMS).map((p) => {
              const active = pkg.supportedPrograms.includes(p.code);
              return (
                <button
                  key={p.code}
                  onClick={() => toggleProgram(p.code)}
                  className={`px-2.5 py-1.5 rounded-lg border transition-all ${
                    active ? "border-transparent text-white" : "border-border bg-card hover:bg-secondary"
                  }`}
                  style={{
                    fontSize: "12px", fontWeight: 500,
                    ...(active ? { backgroundColor: p.color } : {}),
                  }}
                  title={p.name}
                >
                  {active && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />}
                  {p.code} · {p.shortName}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-foreground mb-3 flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
            <GraduationCap className="w-4 h-4" />
            Cấp học hỗ trợ
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {GRADE_LEVELS.map((g) => {
              const active = pkg.supportedGrades.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGrade(g)}
                  className={`px-2 py-1 rounded-md border transition-all ${
                    active ? "bg-[#990803] text-white border-[#990803]" : "border-border bg-card hover:bg-secondary"
                  }`}
                  style={{ fontSize: "11px", fontWeight: 500 }}
                >
                  {active && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                  {g}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4 nhóm tham số động */}
      <div>
        <h2 className="text-foreground mb-3" style={{ fontSize: "16px", fontWeight: 700 }}>
          Tham số động 4 nhóm
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PARAM_GROUPS.map((g) => (
            <ParamGroupCard
              key={g.key}
              group={g}
              items={pkg.configuration[g.key]}
              onAdd={(v) => addParam(g.key, v)}
              onRemove={(idx) => removeParam(g.key, idx)}
            />
          ))}
        </div>
      </div>

      {/* Equipment + Software list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Boxes className="w-4 h-4" />
              Thiết bị kèm theo
            </h3>
            <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
              {pkg.includedEquipment.length} loại
            </span>
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {pkg.includedEquipment.map((e, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-secondary/40 rounded-lg">
                <div className="flex-1">
                  <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>
                    {e.name}
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
                    {e.category} · SL {e.quantity}
                  </p>
                </div>
                <span className="text-[#990803]" style={{ fontSize: "11px", fontWeight: 600 }}>
                  {formatVND(e.quantity * e.unitPriceVND)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-foreground flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
              <Cpu className="w-4 h-4" />
              Phần mềm & License
            </h3>
            <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
              {pkg.includedSoftware.length} ứng dụng
            </span>
          </div>
          <div className="space-y-1.5">
            {pkg.includedSoftware.map((s, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-secondary/40 rounded-lg">
                <div className="flex-1">
                  <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>
                    {s.name}
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
                    v{s.version} · {s.licenseType} · {s.seats || "không giới hạn"} seat
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default STEMPackageConfigurator;
