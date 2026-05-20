import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  Package, ArrowLeft, Settings, Link2, Boxes, Cpu,
  School as SchoolIcon, CheckCircle2, AlertTriangle, Clock,
  XCircle, Trash2, Search, CalendarDays, MapPin, Users,
} from "lucide-react";
import {
  stemPackages, STEM_TIERS, tenantsByType,
  schoolPackages, schoolPackagesByPackage,
} from "../../mock-data/index";
import type { StemPackage, StemPackageTier, PackageStatus } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { TierBadge, ProgramBadge } from "../ui/badges";
import { formatVND } from "../ui/format";
import { toast } from "@/app/lib/toast";
import { useAuth } from "../../AuthContext";

/* ================================================================ */
/*  HELPERS                                                          */
/* ================================================================ */
const STATUS_META: Record<PackageStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  draft:             { label: "Nháp",        color: "#64748b", bg: "#f1f5f9", icon: Clock },
  waiting_approval:  { label: "Chờ duyệt",   color: "#f59e0b", bg: "#fef3c7", icon: Clock },
  active:            { label: "Active",       color: "#16a34a", bg: "#dcfce7", icon: CheckCircle2 },
  discontinued:      { label: "Ngừng bán",   color: "#dc2626", bg: "#fee2e2", icon: XCircle },
};

function StatusBadge({ status }: { status: PackageStatus }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
      style={{ backgroundColor: m.bg, color: m.color, fontSize: "12px", fontWeight: 600 }}
    >
      <Icon className="w-3.5 h-3.5" />
      {m.label}
    </span>
  );
}

/* ================================================================ */
/*  ASSIGN MODAL                                                     */
/* ================================================================ */
function SchoolPackageAssignModal({
  pkg,
  existingAssignments,
  onClose,
  onConfirm,
}: {
  pkg: StemPackage;
  existingAssignments: Array<{ schoolTenantId: string; status: string }>;
  onClose: () => void;
  onConfirm: (schoolId: string, startDate: string, notes: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(today);
  const [notes, setNotes] = useState("");

  /* Set trường đã gắn active — không cho gắn trùng */
  const assignedSchoolIds = new Set(
    existingAssignments.filter((a) => a.status === "active").map((a) => a.schoolTenantId),
  );

  const schools = tenantsByType.school.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedSchool = tenantsByType.school.find((s) => s.id === selected);

  /* Validation */
  const dateValid = startDate >= today;
  const schoolAlreadyAssigned = selected ? assignedSchoolIds.has(selected) : false;
  const canConfirm = !!selected && dateValid && !schoolAlreadyAssigned;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border border-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>Gắn gói cho trường</h2>
              <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>Gói: <strong>{pkg.name}</strong></p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-lg">
              <XCircle className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* School search */}
          <div>
            <label className="block text-muted-foreground mb-1.5" style={{ fontSize: "12px", fontWeight: 500 }}>
              Chọn trường *
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên trường hoặc mã trường..."
                className="w-full pl-9 pr-3 py-2 bg-input-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-[#990803]/30"
                style={{ fontSize: "13px" }}
              />
            </div>
            <div className="max-h-44 overflow-y-auto space-y-1 rounded-lg border border-border bg-secondary/30 p-1.5">
              {schools.length === 0 ? (
                <p className="text-center text-muted-foreground py-3" style={{ fontSize: "12px" }}>Không tìm thấy trường</p>
              ) : (
                schools.map((s) => {
                  const alreadyAssigned = assignedSchoolIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => !alreadyAssigned && setSelected(s.id)}
                      disabled={alreadyAssigned}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                        alreadyAssigned
                          ? "opacity-50 cursor-not-allowed"
                          : selected === s.id
                            ? "bg-[#990803]/10 border border-[#990803]/30"
                            : "hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <p style={{ fontSize: "13px", fontWeight: selected === s.id ? 600 : 400 }}>{s.name}</p>
                        {alreadyAssigned && (
                          <span className="px-1.5 py-0.5 bg-[#16a34a]/15 text-[#16a34a] rounded" style={{ fontSize: "9.5px", fontWeight: 600 }}>
                            Đã gắn
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground flex items-center gap-1" style={{ fontSize: "11px" }}>
                        <MapPin className="w-3 h-3" />
                        {s.district}, {s.province} · {s.code}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected school summary */}
          {selectedSchool && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#990803]/5 rounded-lg border border-[#990803]/20">
              <CheckCircle2 className="w-4 h-4 text-[#990803] shrink-0" />
              <div>
                <p className="text-[#990803]" style={{ fontSize: "12px", fontWeight: 600 }}>{selectedSchool.name}</p>
                <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{selectedSchool.province}</p>
              </div>
            </div>
          )}

          {/* Start date */}
          <div>
            <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>
              Ngày bắt đầu sử dụng *
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 bg-input-background border rounded-lg outline-none ${
                  dateValid ? "border-border" : "border-orange-400"
                }`}
                style={{ fontSize: "13px" }}
              />
            </div>
            {!dateValid && (
              <p className="text-orange-500 mt-1" style={{ fontSize: "11px" }}>
                Ngày bắt đầu không được ở quá khứ
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="VD: Triển khai đầu năm học, lắp đặt xong trước khai giảng..."
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none resize-none"
              style={{ fontSize: "13px" }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            Huỷ
          </button>
          <button
            disabled={!canConfirm}
            onClick={() => canConfirm && onConfirm(selected!, startDate, notes)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] disabled:opacity-40"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Link2 className="w-4 h-4" />
            Xác nhận Gắn gói
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  CONFIRM ACTION DIALOG — dùng cho Từ chối (có lý do) + Ngừng bán  */
/* ================================================================ */
function ConfirmActionDialog({
  open, title, message, confirmLabel, confirmColor,
  requireReason, reasonLabel, reasonPlaceholder, reasonMinLength = 10,
  onClose, onConfirm,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonMinLength?: number;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const reasonValid = !requireReason || reason.trim().length >= reasonMinLength;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border">
        <div className="px-5 py-4 border-b border-border">
          <h2 style={{ fontSize: "15px", fontWeight: 700 }}>{title}</h2>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-muted-foreground" style={{ fontSize: "12.5px", lineHeight: 1.5 }}>{message}</p>
          {requireReason && (
            <div>
              <label className="block text-muted-foreground mb-1" style={{ fontSize: "12px", fontWeight: 500 }}>
                {reasonLabel ?? "Lý do"} <span className="text-[#dc2626]">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder={reasonPlaceholder}
                className="w-full px-3 py-2 bg-input-background border border-border rounded-lg outline-none resize-none"
                style={{ fontSize: "12.5px" }}
              />
              {!reasonValid && reason.length > 0 && (
                <p className="text-[#dc2626] mt-1" style={{ fontSize: "11px" }}>
                  Cần tối thiểu {reasonMinLength} ký tự ({reason.trim().length}/{reasonMinLength})
                </p>
              )}
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <button onClick={onClose}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary"
            style={{ fontSize: "12.5px" }}>
            Hủy
          </button>
          <button
            disabled={!reasonValid}
            onClick={() => onConfirm(reason.trim())}
            className="px-4 py-1.5 text-white rounded-lg hover:opacity-90 disabled:opacity-40"
            style={{ fontSize: "12.5px", fontWeight: 600, backgroundColor: confirmColor }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================ */
/*  MAIN COMPONENT                                                   */
/* ================================================================ */
type DetailTab = "info" | "equipment" | "software" | "schools";

export function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const pkg = stemPackages.find((p) => p.id === id);

  const [tab, setTab] = useState<DetailTab>("info");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [localAssignments, setLocalAssignments] = useState(
    () => schoolPackagesByPackage(id ?? ""),
  );
  /* Vòng đời gói — status local */
  const [packageStatus, setPackageStatus] = useState<PackageStatus>(
    () => (stemPackages.find((p) => p.id === id)?.status ?? "active"),
  );
  const [rejectReason, setRejectReason] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<"reject" | "discontinue" | null>(null);

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

  const status = packageStatus;
  const tier = STEM_TIERS[pkg.tier as StemPackageTier];
  const equipCost = pkg.includedEquipment.reduce((s, e) => s + e.quantity * e.unitPriceVND, 0);
  const activeAssignments = localAssignments.filter((sp) => sp.status === "active");
  const isAdmin = user?.role === "supplier_admin";

  const handleAssignConfirm = (schoolId: string, startDate: string, notes: string) => {
    const school = tenantsByType.school.find((s) => s.id === schoolId);
    const newRecord = {
      id: `SP-NEW-${Date.now()}`,
      packageId: pkg.id,
      schoolTenantId: schoolId,
      assignedBy: user?.id ?? "U-SUP-01",
      startDate,
      notes,
      status: "active" as const,
      createdAt: new Date().toISOString(),
    };
    setLocalAssignments((prev) => [...prev, newRecord]);
    toast.success(`Đã gắn gói "${pkg.name}" cho ${school?.name ?? schoolId} từ ngày ${startDate}`);
    setShowAssignModal(false);
    setTab("schools");
  };

  /* ── Vòng đời gói ── */
  const handleSendForApproval = () => {
    setPackageStatus("waiting_approval");
    toast.success(`Đã gửi gói "${pkg.name}" để duyệt`);
  };

  const handleApprove = () => {
    setPackageStatus("active");
    setRejectReason(null);
    toast.success(`Đã duyệt gói "${pkg.name}" — gói đã được publish`);
  };

  const handleReject = (reason: string) => {
    setPackageStatus("draft");
    setRejectReason(reason);
    setActionDialog(null);
    toast.info(`Đã từ chối gói "${pkg.name}" — trả về Nháp để chỉnh sửa`);
  };

  const handleDiscontinue = () => {
    setPackageStatus("discontinued");
    setActionDialog(null);
    toast.info(`Đã ngừng bán gói "${pkg.name}"`);
  };

  const TABS: { id: DetailTab; label: string; icon: typeof Package }[] = [
    { id: "info",      label: "Thông tin",        icon: Package },
    { id: "equipment", label: `Thiết bị (${pkg.includedEquipment.length})`, icon: Boxes },
    { id: "software",  label: `Phần mềm (${pkg.includedSoftware.length})`,  icon: Cpu },
    { id: "schools",   label: `Trường đang dùng (${localAssignments.filter(sp => sp.status === "active").length})`, icon: SchoolIcon },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Package}
        accentColor={tier?.color}
        title={pkg.name}
        subtitle={pkg.description}
        badge={<StatusBadge status={status} />}
        actions={
          <>
            <Link
              to={`/supplier/packages/${pkg.id}/configure`}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Settings className="w-4 h-4" /> Sửa gói
            </Link>
            {status === "draft" && (
              <button onClick={handleSendForApproval}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#c8a84e] text-white rounded-lg hover:opacity-90"
                style={{ fontSize: "13px", fontWeight: 500 }}>
                <Clock className="w-4 h-4" /> Gửi duyệt
              </button>
            )}
            {status === "active" && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602]"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                <Link2 className="w-4 h-4" />
                + Gắn cho trường
              </button>
            )}
            {status === "waiting_approval" && isAdmin && (
              <div className="flex gap-1.5">
                <button onClick={handleApprove}
                  className="flex items-center gap-1 px-3 py-2 bg-[#16a34a] text-white rounded-lg hover:bg-[#15803d]"
                  style={{ fontSize: "13px", fontWeight: 500 }}>
                  <CheckCircle2 className="w-4 h-4" /> Duyệt
                </button>
                <button onClick={() => setActionDialog("reject")}
                  className="flex items-center gap-1 px-3 py-2 bg-destructive text-white rounded-lg hover:opacity-90"
                  style={{ fontSize: "13px", fontWeight: 500 }}>
                  <XCircle className="w-4 h-4" /> Từ chối
                </button>
              </div>
            )}
            {status === "waiting_approval" && !isAdmin && (
              <span className="flex items-center gap-1 px-3 py-2 text-muted-foreground" style={{ fontSize: "12px" }}>
                <Clock className="w-3.5 h-3.5" /> Đang chờ NCC Manager duyệt
              </span>
            )}
            {status === "active" && (
              <button onClick={() => setActionDialog("discontinue")}
                className="flex items-center gap-1 px-3 py-2 border border-border rounded-lg hover:bg-secondary text-muted-foreground"
                style={{ fontSize: "13px" }}>
                <Trash2 className="w-3.5 h-3.5" /> Ngừng bán
              </button>
            )}
          </>
        }
      />

      {/* Rejection note banner */}
      {status === "draft" && rejectReason && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-orange-700 dark:text-orange-300" style={{ fontSize: "12.5px", fontWeight: 600 }}>
              Gói bị từ chối duyệt — cần chỉnh sửa
            </p>
            <p className="text-orange-600 dark:text-orange-400 mt-0.5" style={{ fontSize: "11.5px", lineHeight: 1.5 }}>
              Lý do: {rejectReason}
            </p>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Giá tham khảo</p>
          <p className="text-[#990803]" style={{ fontSize: "18px", fontWeight: 700 }}>{formatVND(pkg.priceVND)}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Thiết bị</p>
          <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>
            {pkg.includedEquipment.reduce((s, e) => s + e.quantity, 0)} món
          </p>
          <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{formatVND(equipCost)}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Phần mềm</p>
          <p className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>{pkg.includedSoftware.length} ứng dụng</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Trường đang dùng</p>
          <p className="text-[#16a34a]" style={{ fontSize: "18px", fontWeight: 700 }}>{activeAssignments.length}</p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap ${
                  tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab: Thông tin */}
      {tab === "info" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h3 style={{ fontSize: "14px", fontWeight: 600 }}>Thông tin chung</h3>
              <div className="space-y-2" style={{ fontSize: "13px" }}>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loại gói</span>
                  <span className="font-medium">{pkg.packageType === "custom" ? "Custom" : "Template"}</span>
                </div>
                {tier && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tier</span>
                    <TierBadge tier={pkg.tier as StemPackageTier} size="sm" />
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trạng thái</span>
                  <StatusBadge status={status} />
                </div>
                {pkg.installationFeeVND !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí lắp đặt</span>
                    <span>{pkg.installationFeeVND > 0 ? formatVND(pkg.installationFeeVND) : "Miễn phí"}</span>
                  </div>
                )}
                {pkg.trainingDays !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tập huấn GV</span>
                    <span>{pkg.trainingDays} ngày</span>
                  </div>
                )}
                {pkg.warrantyMonths !== undefined && pkg.warrantyMonths > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bảo hành</span>
                    <span>{pkg.warrantyMonths} tháng</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Chương trình STEM</h3>
              <div className="flex flex-wrap gap-1.5">
                {pkg.supportedPrograms.map((c) => <ProgramBadge key={c} code={c} size="sm" />)}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {pkg.thumbnails[0] && (
              <img src={pkg.thumbnails[0]} alt={pkg.name}
                className="w-full h-40 object-cover rounded-xl border border-border" />
            )}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="mb-2" style={{ fontSize: "14px", fontWeight: 600 }}>Khối lớp mục tiêu</h3>
              <div className="flex flex-wrap gap-1.5">
                {pkg.supportedGrades.map((g) => (
                  <span key={g} className="flex items-center gap-1 px-2.5 py-1 bg-secondary rounded-lg text-foreground" style={{ fontSize: "12px" }}>
                    <Users className="w-3 h-3" /> {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Thiết bị */}
      {tab === "equipment" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {pkg.includedEquipment.length === 0 ? (
            <p className="text-center text-muted-foreground py-8" style={{ fontSize: "13px" }}>Gói này không có thiết bị vật lý.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-secondary/50 text-muted-foreground" style={{ fontSize: "11px" }}>
                <tr>
                  <th className="px-4 py-2.5 text-left">Thiết bị</th>
                  <th className="px-4 py-2.5 text-left">Danh mục</th>
                  <th className="px-4 py-2.5 text-right">SL</th>
                  <th className="px-4 py-2.5 text-right">Đơn giá</th>
                  <th className="px-4 py-2.5 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
                {pkg.includedEquipment.map((e, i) => (
                  <tr key={i} className="hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <p style={{ fontWeight: 500 }}>{e.name}</p>
                      {e.specs && <p className="text-muted-foreground" style={{ fontSize: "10.5px" }}>{e.specs}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{e.category}</td>
                    <td className="px-4 py-3 text-right">{e.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatVND(e.unitPriceVND)}</td>
                    <td className="px-4 py-3 text-right text-[#990803]" style={{ fontWeight: 600 }}>
                      {formatVND(e.quantity * e.unitPriceVND)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-secondary/30">
                  <td colSpan={4} className="px-4 py-2.5 text-right text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>TỔNG</td>
                  <td className="px-4 py-2.5 text-right text-[#990803]" style={{ fontSize: "14px", fontWeight: 700 }}>
                    {formatVND(equipCost)}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Phần mềm */}
      {tab === "software" && (
        <div className="space-y-2">
          {pkg.includedSoftware.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 bg-card rounded-xl border border-border" style={{ fontSize: "13px" }}>
              Gói này không có phần mềm đi kèm.
            </p>
          ) : (
            pkg.includedSoftware.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 bg-card rounded-xl border border-border">
                <Cpu className="w-4 h-4 text-[#7c3aed] shrink-0" />
                <div className="flex-1">
                  <p style={{ fontSize: "13px", fontWeight: 600 }}>{s.name}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "11px" }}>
                    v{s.version} · {s.licenseType} · {s.seats} seats
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-[#7c3aed]/10 text-[#7c3aed] rounded-full" style={{ fontSize: "11px" }}>
                  {s.licenseType}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Trường đang dùng */}
      {tab === "schools" && (
        <div className="space-y-3">
          {status === "active" && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602]"
                style={{ fontSize: "13px", fontWeight: 500 }}
              >
                <Link2 className="w-4 h-4" /> + Gắn cho trường mới
              </button>
            </div>
          )}
          {localAssignments.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-xl border border-dashed border-border">
              <SchoolIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Chưa có trường nào sử dụng gói này.</p>
              {status === "active" && (
                <button onClick={() => setShowAssignModal(true)}
                  className="mt-3 px-4 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602]"
                  style={{ fontSize: "13px", fontWeight: 500 }}>
                  Gắn gói đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-secondary/50 text-muted-foreground" style={{ fontSize: "11px" }}>
                  <tr>
                    <th className="px-4 py-2.5 text-left">Trường</th>
                    <th className="px-4 py-2.5 text-left">Tỉnh/TP</th>
                    <th className="px-4 py-2.5 text-left">Ngày bắt đầu</th>
                    <th className="px-4 py-2.5 text-left">Ghi chú</th>
                    <th className="px-4 py-2.5 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border" style={{ fontSize: "12.5px" }}>
                  {localAssignments.map((sp) => {
                    const school = tenantsByType.school.find((s) => s.id === sp.schoolTenantId);
                    return (
                      <tr key={sp.id} className="hover:bg-secondary/30">
                        <td className="px-4 py-3">
                          <p style={{ fontWeight: 500 }}>{school?.name ?? sp.schoolTenantId}</p>
                          <p className="font-mono text-muted-foreground" style={{ fontSize: "10.5px" }}>{school?.code}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <MapPin className="w-3 h-3 inline mr-0.5" />
                          {school?.province ?? "—"}
                        </td>
                        <td className="px-4 py-3">{sp.startDate}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-xs truncate" style={{ fontSize: "11.5px" }}>
                          {sp.notes ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {sp.status === "active" ? (
                            <span className="px-2 py-0.5 bg-[#16a34a]/15 text-[#16a34a] rounded-full" style={{ fontSize: "11px", fontWeight: 600 }}>Active</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-secondary text-muted-foreground rounded-full" style={{ fontSize: "11px" }}>{sp.status}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Assign modal */}
      {showAssignModal && (
        <SchoolPackageAssignModal
          pkg={pkg}
          existingAssignments={localAssignments}
          onClose={() => setShowAssignModal(false)}
          onConfirm={handleAssignConfirm}
        />
      )}

      {/* Từ chối — dialog có lý do */}
      <ConfirmActionDialog
        open={actionDialog === "reject"}
        title="Từ chối duyệt gói"
        message={`Gói "${pkg.name}" sẽ trả về trạng thái Nháp. NCC cần nhập lý do để bộ phận tạo gói chỉnh sửa.`}
        confirmLabel="Xác nhận từ chối"
        confirmColor="#dc2626"
        requireReason
        reasonLabel="Lý do từ chối"
        reasonPlaceholder="VD: Giá đề xuất thấp hơn floor price, thiếu thông tin bảo hành..."
        reasonMinLength={10}
        onClose={() => setActionDialog(null)}
        onConfirm={handleReject}
      />

      {/* Ngừng bán — dialog confirm */}
      <ConfirmActionDialog
        open={actionDialog === "discontinue"}
        title="Ngừng bán gói"
        message={`Gói "${pkg.name}" sẽ chuyển sang trạng thái Ngừng bán. Các trường đang dùng không bị ảnh hưởng, nhưng gói sẽ ẩn khỏi catalog.`}
        confirmLabel="Xác nhận ngừng bán"
        confirmColor="#dc2626"
        onClose={() => setActionDialog(null)}
        onConfirm={handleDiscontinue}
      />
    </div>
  );
}

export default PackageDetail;
