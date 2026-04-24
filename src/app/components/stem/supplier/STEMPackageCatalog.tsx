import { useState } from "react";
import { Link } from "react-router";
import {
  Boxes, Plus, Settings, PlayCircle, Check, Package,
  GraduationCap, Cpu, Image as ImageIcon, Eye, Pencil,
} from "lucide-react";
import { stemPackages, STEM_TIERS } from "../../mock-data/index";
import type { StemPackage, StemPackageTier } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { TierBadge, ProgramBadge } from "../ui/badges";
import { formatVND } from "../ui/format";
import { toast } from "sonner";

const TIER_ICON = {
  minimum:  Boxes,
  basic:    Package,
  advanced: Cpu,
};

function PackageCard({ pkg }: { pkg: StemPackage }) {
  const tier = STEM_TIERS[pkg.tier];
  const Icon = TIER_ICON[pkg.tier];
  const totalEquipmentVND = pkg.includedEquipment.reduce(
    (s, e) => s + e.quantity * e.unitPriceVND, 0
  );

  return (
    <div
      className="bg-card rounded-2xl border border-border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      <div
        className="h-36 relative"
        style={{
          background: `linear-gradient(135deg, ${tier.color}22, ${tier.color}08)`,
        }}
      >
        {pkg.thumbnails[0] ? (
          <img
            src={pkg.thumbnails[0]}
            alt={pkg.name}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Icon className="w-12 h-12" style={{ color: tier.color }} />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <TierBadge tier={pkg.tier} size="md" />
        </div>
        {pkg.demoVideoUrl && (
          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
            title="Xem video demo"
            onClick={() => toast.info(`Demo video gói ${pkg.name}`)}
          >
            <PlayCircle className="w-5 h-5 text-[#990803]" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>
            {pkg.name}
          </h3>
          <p className="text-muted-foreground mt-1 line-clamp-2" style={{ fontSize: "12px" }}>
            {pkg.description}
          </p>
        </div>

        {/* Programs supported */}
        <div className="flex flex-wrap gap-1">
          {pkg.supportedPrograms.map((p) => <ProgramBadge key={p} code={p} size="xs" />)}
        </div>

        {/* Grades */}
        <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "11px" }}>
          <GraduationCap className="w-3.5 h-3.5" />
          {pkg.supportedGrades.join(" · ")}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-border">
          <div>
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Thiết bị</p>
            <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              {pkg.includedEquipment.reduce((s, e) => s + e.quantity, 0)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Phần mềm</p>
            <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              {pkg.includedSoftware.length}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Ảnh/Video</p>
            <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              {pkg.thumbnails.length + (pkg.demoVideoUrl ? 1 : 0)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Giá tham khảo</p>
          <p className="text-[#990803]" style={{ fontSize: "18px", fontWeight: 700 }}>
            {formatVND(pkg.priceVND)}
          </p>
          <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10px" }}>
            Thiết bị: {formatVND(totalEquipmentVND)}
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <Link
            to={`/supplier/packages/${pkg.id}/configure`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            <Settings className="w-3.5 h-3.5" />
            Cấu hình
          </Link>
          <button
            onClick={() => toast.info(`Xem chi tiết gói ${pkg.name}`)}
            className="px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-1.5"
            style={{ fontSize: "12px", fontWeight: 500 }}
            title="Xem trước"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function STEMPackageCatalog() {
  const [filter, setFilter] = useState<"all" | StemPackageTier>("all");

  const filtered = filter === "all" ? stemPackages : stemPackages.filter((p) => p.tier === filter);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Boxes}
        title="Danh mục gói phòng học STEM"
        subtitle="Cấu hình và đóng gói các loại phòng học STEM (Tối thiểu · Cơ bản · Nâng cao) cho Mầm non → THPT Nghề"
        actions={
          <>
            <button
              onClick={() => toast.info("Phân quyền: Chỉ Supplier Admin được phép tạo gói")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Plus className="w-4 h-4" />
              Tạo gói mới
            </button>
            <button
              onClick={() => toast.info("Xuất danh mục gói ra PDF")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <ImageIcon className="w-4 h-4" />
              Xuất catalog
            </button>
          </>
        }
      />

      {/* Tier filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg border transition-colors ${
            filter === "all" ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"
          }`}
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          <Check className="w-3.5 h-3.5 inline mr-1" />
          Tất cả ({stemPackages.length})
        </button>
        {Object.values(STEM_TIERS).map((t) => (
          <button
            key={t.tier}
            onClick={() => setFilter(t.tier)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
              filter === t.tier ? "text-white" : "bg-card border-border hover:bg-secondary"
            }`}
            style={{
              fontSize: "12px", fontWeight: 500,
              ...(filter === t.tier ? { backgroundColor: t.color, borderColor: t.color } : {}),
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Grid 3 cards (hoặc grid khi lọc) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => <PackageCard key={p.id} pkg={p} />)}
      </div>

      {/* Khung thông tin thêm */}
      <div className="mt-6 bg-gradient-to-br from-[#990803]/5 to-[#c8a84e]/5 rounded-xl border border-border p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#990803]/10 flex items-center justify-center shrink-0">
            <Pencil className="w-5 h-5 text-[#990803]" />
          </div>
          <div>
            <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              Khai báo tham số động tiêu chí phòng STEM
            </h3>
            <p className="text-muted-foreground mt-1" style={{ fontSize: "12.5px", lineHeight: 1.6 }}>
              Nhà cung cấp có thể tùy chỉnh từng gói với 4 nhóm tham số:
              <strong className="text-foreground"> thiết kế cơ sở vật chất</strong>,
              <strong className="text-foreground"> thiết bị thông minh</strong>,
              <strong className="text-foreground"> nội thất chuyên dụng</strong>, và
              <strong className="text-foreground"> dịch vụ trang trí</strong>.
              Mỗi tham số được lưu dạng JSON để linh hoạt điều chỉnh theo yêu cầu riêng của từng trường hợp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default STEMPackageCatalog;
