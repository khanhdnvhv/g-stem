import { useState } from "react";
import { Link } from "react-router";
import {
  Boxes, Plus, PlayCircle, Package,
  GraduationCap, Cpu, Eye, Clock, CheckCircle2, XCircle,
  AlertTriangle, Search,
} from "lucide-react";
import { stemPackages, STEM_TIERS } from "../../mock-data/index";
import type { StemPackage, StemPackageTier, PackageStatus } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { tenantsByType } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { TierBadge, ProgramBadge } from "../ui/badges";
import { formatVND } from "../ui/format";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  STATUS META                                                      */
/* ================================================================ */
const STATUS_META: Record<PackageStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  draft:            { label: "Nháp",       color: "#64748b", icon: Clock },
  waiting_approval: { label: "Chờ duyệt",  color: "#f59e0b", icon: AlertTriangle },
  active:           { label: "Active",      color: "#16a34a", icon: CheckCircle2 },
  discontinued:     { label: "Ngừng bán",  color: "#dc2626", icon: XCircle },
};

type StatusFilter = "all" | PackageStatus;

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all",             label: "Tất cả" },
  { key: "active",          label: "Active" },
  { key: "draft",           label: "Nháp" },
  { key: "waiting_approval", label: "Chờ duyệt" },
  { key: "discontinued",    label: "Ngừng bán" },
];

/* ================================================================ */
/*  PACKAGE CARD                                                     */
/* ================================================================ */
function PackageCard({ pkg }: { pkg: StemPackage }) {
  const tier = pkg.tier ? STEM_TIERS[pkg.tier as StemPackageTier] : null;
  const status = pkg.status ?? "active";
  const sm = STATUS_META[status];
  const StatusIcon = sm.icon;
  const totalEquipVND = pkg.includedEquipment.reduce((s, e) => s + e.quantity * e.unitPriceVND, 0);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
      {/* Thumbnail */}
      <div
        className="h-36 relative"
        style={{ background: `linear-gradient(135deg, ${tier?.color ?? "#990803"}22, ${tier?.color ?? "#990803"}08)` }}
      >
        {pkg.thumbnails[0] ? (
          <img src={pkg.thumbnails[0]} alt={pkg.name} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-12 h-12" style={{ color: tier?.color ?? "#990803", opacity: 0.4 }} />
          </div>
        )}

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {tier && <TierBadge tier={pkg.tier as StemPackageTier} size="md" />}
        </div>

        {/* Status badge top-right */}
        <div
          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "rgba(0,0,0,0.55)", color: sm.color }}
        >
          <StatusIcon className="w-3 h-3" />
          <span style={{ fontSize: "10px", fontWeight: 600 }}>{sm.label}</span>
        </div>

        {pkg.demoVideoUrl && (
          <button
            className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
            title="Xem video demo"
            onClick={() => toast.info(`Demo video gói ${pkg.name}`)}
          >
            <PlayCircle className="w-4 h-4 text-[#990803]" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-foreground" style={{ fontSize: "15px", fontWeight: 700 }}>{pkg.name}</h3>
          <p className="text-muted-foreground mt-0.5 line-clamp-2" style={{ fontSize: "12px" }}>{pkg.description}</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {pkg.supportedPrograms.map((p) => <ProgramBadge key={p} code={p} size="xs" />)}
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground" style={{ fontSize: "11px" }}>
          <GraduationCap className="w-3.5 h-3.5" />
          {pkg.supportedGrades.join(" · ")}
        </div>

        <div className="grid grid-cols-3 gap-2 py-2 border-y border-border">
          <div>
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Thiết bị</p>
            <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              {pkg.includedEquipment.reduce((s, e) => s + e.quantity, 0)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Phần mềm</p>
            <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>{pkg.includedSoftware.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Bảo hành</p>
            <p className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
              {pkg.warrantyMonths ? `${pkg.warrantyMonths}th` : "—"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Giá tham khảo</p>
          <p className="text-[#990803]" style={{ fontSize: "18px", fontWeight: 700 }}>{formatVND(pkg.priceVND)}</p>
          {totalEquipVND > 0 && (
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>Thiết bị: {formatVND(totalEquipVND)}</p>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Link
            to={`/supplier/packages/${pkg.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            <Eye className="w-3.5 h-3.5" />
            Xem chi tiết
          </Link>
          <Link
            to={`/supplier/packages/${pkg.id}/configure`}
            className="px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-1"
            style={{ fontSize: "12px" }}
            title="Cấu hình"
          >
            <Boxes className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  MAIN COMPONENT                                                   */
/* ================================================================ */
export function STEMPackageCatalog() {
  const { user } = useAuth();
  const myTenantId = user?.tenantId ?? tenantsByType.supplier[0]?.id ?? "T-SUP-01";
  const myPackages = stemPackages.filter((p) => p.supplierTenantId === myTenantId);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = myPackages.filter((p) => {
    if (statusFilter !== "all" && (p.status ?? "active") !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Stats
  const counts = {
    active:          myPackages.filter((p) => (p.status ?? "active") === "active").length,
    draft:           myPackages.filter((p) => p.status === "draft").length,
    waiting_approval: myPackages.filter((p) => p.status === "waiting_approval").length,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Boxes}
        title="Danh mục gói phòng học STEM"
        subtitle="Tạo, cấu hình và quản lý vòng đời các gói STEM — từ nháp đến active."
        actions={
          <>
            <Link
              to="/supplier/packages/new"
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Plus className="w-4 h-4" />
              Tạo gói mới
            </Link>
            <button
              onClick={() => toast.info("Xuất danh mục gói ra PDF")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Cpu className="w-4 h-4" />
              Xuất catalog
            </button>
          </>
        }
      />

      {/* Quick stats */}
      {(counts.draft > 0 || counts.waiting_approval > 0) && (
        <div className="flex items-center gap-3 flex-wrap">
          {counts.active > 0 && (
            <span className="flex items-center gap-1 px-3 py-1.5 bg-[#16a34a]/10 text-[#16a34a] rounded-lg" style={{ fontSize: "12px", fontWeight: 600 }}>
              <CheckCircle2 className="w-3.5 h-3.5" /> {counts.active} Active
            </span>
          )}
          {counts.waiting_approval > 0 && (
            <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg" style={{ fontSize: "12px", fontWeight: 600 }}>
              <AlertTriangle className="w-3.5 h-3.5" /> {counts.waiting_approval} chờ duyệt
            </span>
          )}
          {counts.draft > 0 && (
            <span className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-muted-foreground rounded-lg" style={{ fontSize: "12px" }}>
              <Clock className="w-3.5 h-3.5" /> {counts.draft} nháp
            </span>
          )}
        </div>
      )}

      {/* Search + Status filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên gói..."
            className="w-full pl-9 pr-3 py-1.5 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "12.5px" }}
          />
        </div>
        {STATUS_TABS.map((t) => {
          const count = t.key === "all" ? myPackages.length : myPackages.filter((p) => (p.status ?? "active") === t.key).length;
          if (t.key !== "all" && count === 0) return null;
          return (
            <button
              key={t.key}
              onClick={() => setStatusFilter(t.key)}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                statusFilter === t.key ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"
              }`}
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground" style={{ fontSize: "14px" }}>Không có gói nào ở trạng thái này.</p>
          <Link to="/supplier/packages/new"
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602]"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Plus className="w-4 h-4" /> Tạo gói mới
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => <PackageCard key={p.id} pkg={p} />)}
        </div>
      )}
    </div>
  );
}

export default STEMPackageCatalog;
