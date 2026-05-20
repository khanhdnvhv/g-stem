import { useState, useMemo } from "react";
import {
  School as SchoolIcon, Search, Download, MapPin,
  GraduationCap, Users, Boxes, DollarSign, Link2,
  ChevronDown, ChevronUp, CheckCircle2, Clock, Package,
} from "lucide-react";
import {
  tenantsByType, equipmentBySchool,
  schoolPackagesBySchool, stemPackages,
} from "../../mock-data/index";
import type { Tenant, Order, Contract } from "../../mock-data/index";
import { Link } from "react-router";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatVNDCompact, formatRelative } from "../ui/format";
import { toast } from "@/app/lib/toast";
import { useOperations } from "@/app/lib/OperationsContext";

/* ================================================================ */
/*  SCHOOLS DIRECTORY (Supplier view) — Danh bạ trường mua STEM     */
/* ================================================================ */

interface SchoolRow {
  tenant: Tenant;
  studentsEst: number;
  equipmentCount: number;
  activeContracts: number;
  totalSpendVND: number;
  lastOrderAt?: string;
  activePackages: number;
  packageNames: string[];
  contractStatuses: string[];
}

function buildData(orders: Order[], contracts: Contract[]): SchoolRow[] {
  return tenantsByType.school.map((t, i) => {
    const eq         = equipmentBySchool(t.id);
    const myOrders   = orders.filter((o) => o.fromTenantId === t.id);
    const myContracts = contracts.filter((c) => c.schoolId === t.id);
    const totalSpend = myContracts.reduce((s, c) => s + c.totalVND, 0);
    const last       = myOrders.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    const pkgs       = schoolPackagesBySchool(t.id);
    const activePkgs = pkgs.filter((p) => p.status === "active");
    const pkgNames   = activePkgs.map((sp) => {
      const pkg = stemPackages.find((p) => p.id === sp.packageId);
      return pkg?.name ?? sp.packageId;
    });
    return {
      tenant: t,
      studentsEst:      600 + (i * 73) % 1800,
      equipmentCount:   eq.length,
      activeContracts:  myContracts.filter((c) => c.status === "active").length,
      totalSpendVND:    totalSpend,
      lastOrderAt:      last?.createdAt,
      activePackages:   activePkgs.length,
      packageNames:     pkgNames,
      contractStatuses: myContracts.map((c) => c.status),
    };
  });
}

const CONTRACT_STATUS_META: Record<string, { label: string; color: string }> = {
  draft:      { label: "Nháp",      color: "#94a3b8" },
  signed:     { label: "Đã ký",     color: "#0891b2" },
  active:     { label: "Đang hiệu lực", color: "#16a34a" },
  expired:    { label: "Hết hạn",   color: "#f59e0b" },
  terminated: { label: "Đã chấm dứt", color: "#ef4444" },
};

export function SchoolsDirectoryNCC() {
  const { orders, contracts } = useOperations();
  const rows             = useMemo(() => buildData(orders, contracts), [orders, contracts]);
  const [search,         setSearch]         = useState("");
  const [provinceFilter, setProvinceFilter] = useState<string>("all");
  const [statusFilter,   setStatusFilter]   = useState<"all" | "active" | "inactive">("all");
  const [gradeFilter,    setGradeFilter]    = useState<string>("all");
  const [expandedId,     setExpandedId]     = useState<string | null>(null);

  const provinces = useMemo(() =>
    Array.from(new Set(rows.map((r) => r.tenant.province ?? ""))).filter(Boolean).sort(),
  [rows]);

  const gradeOptions = useMemo(() => {
    const all = new Set<string>();
    rows.forEach((r) => r.tenant.gradeLevels?.forEach((g) => all.add(g)));
    return Array.from(all).sort();
  }, [rows]);

  const filtered = useMemo(() => rows.filter((r) => {
    if (provinceFilter !== "all" && r.tenant.province !== provinceFilter) return false;
    if (statusFilter === "active"   && r.activeContracts === 0) return false;
    if (statusFilter === "inactive" && r.activeContracts > 0)   return false;
    if (gradeFilter !== "all" && !r.tenant.gradeLevels?.includes(gradeFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.tenant.name.toLowerCase().includes(q) && !r.tenant.code.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [rows, search, provinceFilter, statusFilter, gradeFilter]);

  const totalSpend     = rows.reduce((s, r) => s + r.totalSpendVND, 0);
  const activeCustomers = rows.filter((r) => r.activeContracts > 0).length;
  const totalStudents  = rows.reduce((s, r) => s + r.studentsEst, 0);

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-5">
      <PageHeader
        icon={SchoolIcon}
        title="Danh bạ Trường học"
        subtitle="Tất cả trường học đã mua gói STEM từ Geleximco — xem doanh thu, hợp đồng, thiết bị đã cấp."
        accentColor="#990803"
        actions={
          <button onClick={() => toast.success("Xuất Excel danh bạ trường")}
            className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={SchoolIcon} label="Trường khách hàng"   value={rows.length}                  color="#990803" subtitle={`${activeCustomers} đang active`} />
        <KpiCard icon={Users}      label="Học sinh thụ hưởng"  value={totalStudents.toLocaleString()} color="#2563eb" />
        <KpiCard icon={DollarSign} label="Doanh thu cộng dồn"  value={formatVNDCompact(totalSpend)}  color="#c8a84e" change="+18%" trend="up" />
        <KpiCard icon={MapPin}     label="Tỉnh/thành phủ"      value={provinces.length}               color="#16a34a" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm trường / mã..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }} />
        </div>

        <select value={provinceFilter} onChange={(e) => setProvinceFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả tỉnh/TP</option>
          {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}
          className="px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "12px" }}>
          <option value="all">Tất cả cấp học</option>
          {gradeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>

        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded transition-all ${statusFilter === s ? "bg-[#990803] text-white" : "hover:bg-secondary"}`}
              style={{ fontSize: "11px", fontWeight: 500 }}>
              {s === "all" ? "Tất cả" : s === "active" ? "Có HĐ active" : "Chưa active"}
            </button>
          ))}
        </div>

        <span className="text-muted-foreground ml-auto" style={{ fontSize: "12px" }}>
          {filtered.length}/{rows.length} trường
        </span>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
            <tr>
              <th className="px-4 py-2.5 w-6" />
              <th className="px-4 py-2.5">Trường</th>
              <th className="px-4 py-2.5">Địa bàn</th>
              <th className="px-4 py-2.5 text-right">Học sinh</th>
              <th className="px-4 py-2.5 text-right">Thiết bị</th>
              <th className="px-4 py-2.5 text-right">Gói STEM</th>
              <th className="px-4 py-2.5 text-right">Doanh thu</th>
              <th className="px-4 py-2.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
            {filtered.map((r) => {
              const isExpanded = expandedId === r.tenant.id;
              return (
                <>
                  <tr
                    key={r.tenant.id}
                    className={`hover:bg-secondary/30 transition-colors ${isExpanded ? "bg-secondary/20" : ""}`}
                  >
                    {/* Expand toggle */}
                    <td className="px-2 py-3 text-center">
                      <button
                        onClick={() => toggleExpand(r.tenant.id)}
                        className="p-0.5 rounded text-muted-foreground hover:text-foreground"
                      >
                        {isExpanded
                          ? <ChevronUp className="w-3.5 h-3.5" />
                          : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </td>

                    <td className="px-4 py-3">
                      <p style={{ fontWeight: 500 }}>{r.tenant.name}</p>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span className="font-mono text-muted-foreground" style={{ fontSize: "10.5px" }}>{r.tenant.code}</span>
                        {r.tenant.gradeLevels?.map((g) => (
                          <span key={g} className="px-1 py-0 bg-secondary text-muted-foreground rounded" style={{ fontSize: "9.5px" }}>{g}</span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground" style={{ fontSize: "11.5px" }}>
                      <MapPin className="w-3 h-3 inline mr-0.5" />
                      {r.tenant.district}, {r.tenant.province}
                    </td>

                    <td className="px-4 py-3 text-right">{r.studentsEst.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{r.equipmentCount}</td>

                    <td className="px-4 py-3 text-right">
                      {r.activePackages > 0 ? (
                        <span className="px-1.5 py-0.5 bg-[#990803]/10 text-[#990803] rounded" style={{ fontSize: "11px", fontWeight: 600 }}>
                          {r.activePackages} gói
                        </span>
                      ) : (
                        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Chưa có</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right text-[#990803]" style={{ fontWeight: 600 }}>
                      {formatVNDCompact(r.totalSpendVND)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/supplier/packages"
                        className="p-1.5 hover:bg-secondary rounded inline-flex"
                        title="Gắn gói STEM"
                      >
                        <Link2 className="w-4 h-4 text-[#990803]" />
                      </Link>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {isExpanded && (
                    <tr key={`${r.tenant.id}-detail`} className="bg-secondary/10">
                      <td colSpan={8} className="px-6 pb-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                          {/* Gói STEM */}
                          <div>
                            <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>
                              <Package className="w-3.5 h-3.5 inline mr-1" />GÓI STEM ĐANG DÙNG
                            </p>
                            {r.packageNames.length > 0 ? (
                              <div className="space-y-1">
                                {r.packageNames.map((name, i) => (
                                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#990803]/5 border border-[#990803]/15 rounded-lg">
                                    <CheckCircle2 className="w-3 h-3 text-[#16a34a] shrink-0" />
                                    <span style={{ fontSize: "11.5px", fontWeight: 500 }}>{name}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>Chưa có gói active</p>
                            )}
                          </div>

                          {/* Hợp đồng */}
                          <div>
                            <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>
                              <GraduationCap className="w-3.5 h-3.5 inline mr-1" />HỢP ĐỒNG
                            </p>
                            {r.contractStatuses.length > 0 ? (
                              <div className="space-y-1">
                                {r.contractStatuses.map((st, i) => {
                                  const m = CONTRACT_STATUS_META[st] ?? { label: st, color: "#64748b" };
                                  return (
                                    <div key={i} className="flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                                      <span style={{ fontSize: "11.5px", color: m.color, fontWeight: 500 }}>{m.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>Chưa có hợp đồng</p>
                            )}
                          </div>

                          {/* Hoạt động gần nhất */}
                          <div>
                            <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>
                              <Clock className="w-3.5 h-3.5 inline mr-1" />THÔNG TIN KHÁC
                            </p>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Đơn hàng gần nhất</span>
                                <span style={{ fontSize: "11px", fontWeight: 500 }}>
                                  {r.lastOrderAt ? formatRelative(r.lastOrderAt) : "—"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Thiết bị đã cấp</span>
                                <span style={{ fontSize: "11px", fontWeight: 500 }}>{r.equipmentCount} thiết bị</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Học sinh thụ hưởng</span>
                                <span style={{ fontSize: "11px", fontWeight: 500 }}>{r.studentsEst.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Tổng chi</span>
                                <span className="text-[#990803]" style={{ fontSize: "11px", fontWeight: 700 }}>{formatVNDCompact(r.totalSpendVND)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <SchoolIcon className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Không tìm thấy trường phù hợp</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SchoolsDirectoryNCC;
