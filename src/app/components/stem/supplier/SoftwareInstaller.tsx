import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Cpu, Download, Rocket, Clock, CheckCircle2, X,
  AlertTriangle, Package, Play, Pause, FileText, KeyRound, Info, Search,
} from "lucide-react";
import { tenants, equipment } from "../../mock-data/index";
import type { InstallCampaign, CampaignStatus } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatRelative } from "../ui/format";
import { toast } from "@/app/lib/toast";
import { useOperations } from "@/app/lib/OperationsContext";

/* ================================================================ */
/*  SOFTWARE INSTALLER — campaign cài đặt bộ cài (store)            */
/*  BR-OP-06: campaign phải gắn license hợp lệ + thiết bị mục tiêu  */
/* ================================================================ */

function tenantName(id: string) { return tenants.find((t) => t.id === id)?.name || id; }

/* Version mặc định gợi ý theo tên phần mềm */
const SOFTWARE_VERSION: Record<string, string> = {
  "Geleximco STEM Studio": "3.2.1",
  "Robotic Programming IDE": "2.5.0",
  "IoT Platform": "1.8.4",
  "Geleximco STEM Explorer": "4.0.2",
  "Geleximco STEM Tutor": "2.1.0",
};

const STATUS_META: Record<CampaignStatus, { label: string; color: string }> = {
  draft:     { label: "Bản nháp",         color: "#64748b" },
  running:   { label: "Đang chạy",        color: "#7c3aed" },
  paused:    { label: "Tạm dừng",         color: "#f59e0b" },
  completed: { label: "Hoàn tất",         color: "#16a34a" },
  failed:    { label: "Thất bại",         color: "#dc2626" },
};

/* ── Dialog tạo campaign ─────────────────────────────────────────── */
function CreateCampaignDialog({ onClose }: { onClose: () => void }) {
  const { contracts, licenses, createCampaign } = useOperations();
  const activeContracts = useMemo(
    () => contracts.filter((c) => c.status === "active"),
    [contracts],
  );

  const [contractId, setContractId] = useState("");
  const [licenseId, setLicenseId] = useState("");
  const [version, setVersion] = useState("");
  const [name, setName] = useState("");
  const [equipIds, setEquipIds] = useState<string[]>([]);

  const contract = contracts.find((c) => c.id === contractId);

  /* License của trường trong hợp đồng (ưu tiên license gắn đúng hợp đồng) */
  const contractLicenses = useMemo(() => {
    if (!contract) return [];
    return licenses.filter(
      (l) => (l.contractId === contractId || l.tenantId === contract.schoolId)
        && l.status !== "revoked",
    );
  }, [licenses, contract, contractId]);

  const license = licenses.find((l) => l.id === licenseId);

  /* Thiết bị của trường trong hợp đồng */
  const schoolEquipment = useMemo(() => {
    if (!contract) return [];
    return equipment.filter((e) => e.schoolId === contract.schoolId);
  }, [contract]);

  const resetDownstream = (cid: string) => {
    setContractId(cid);
    setLicenseId("");
    setEquipIds([]);
    setVersion("");
    setName("");
  };

  const pickLicense = (lid: string) => {
    setLicenseId(lid);
    const lic = licenses.find((l) => l.id === lid);
    if (lic) {
      setVersion(SOFTWARE_VERSION[lic.productName] ?? "1.0.0");
      if (contract) setName(`Triển khai ${lic.productName} — ${contract.contractNo}`);
    }
  };

  const toggleEquip = (id: string) =>
    setEquipIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const allEquipSelected = schoolEquipment.length > 0 && equipIds.length === schoolEquipment.length;
  const toggleAllEquip = () =>
    setEquipIds(allEquipSelected ? [] : schoolEquipment.map((e) => e.id));

  const canSubmit = !!contract && !!license && equipIds.length > 0 && name.trim().length > 0;

  const submit = () => {
    if (!canSubmit || !license) return;
    createCampaign({
      name: name.trim(),
      softwareName: license.productName,
      version: version.trim() || "1.0.0",
      contractId,
      licenseId,
      targetEquipmentIds: equipIds,
    });
    toast.success(`Đã tạo campaign — ${equipIds.length} thiết bị mục tiêu`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border">
          <Rocket className="w-5 h-5 text-[#990803]" />
          <h2 className="flex-1" style={{ fontSize: "15px", fontWeight: 700 }}>Tạo campaign cài đặt</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          {/* 1. Hợp đồng */}
          <div>
            <label className="block mb-1 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>
              1. Hợp đồng <span className="text-[#dc2626]">*</span>
            </label>
            {activeContracts.length === 0 ? (
              <p className="text-orange-500 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg" style={{ fontSize: "12px" }}>
                Chưa có hợp đồng nào ở trạng thái "Đang hiệu lực".
              </p>
            ) : (
              <select value={contractId} onChange={(e) => resetDownstream(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "13px" }}>
                <option value="">-- Chọn hợp đồng --</option>
                {activeContracts.map((c) => (
                  <option key={c.id} value={c.id}>{c.contractNo} · {tenantName(c.schoolId)}</option>
                ))}
              </select>
            )}
          </div>

          {/* 2. License */}
          {contract && (
            <div>
              <label className="block mb-1 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>
                2. License kích hoạt <span className="text-[#dc2626]">*</span>
              </label>
              {contractLicenses.length === 0 ? (
                <p className="text-orange-500 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg" style={{ fontSize: "12px" }}>
                  Hợp đồng chưa có license hợp lệ. Hãy cấp license trước (BR-OP-06).
                </p>
              ) : (
                <select value={licenseId} onChange={(e) => pickLicense(e.target.value)}
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "13px" }}>
                  <option value="">-- Chọn license --</option>
                  {contractLicenses.map((l) => (
                    <option key={l.id} value={l.id}>{l.productName} · {l.licenseKey}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* 3. Phiên bản + tên */}
          {license && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block mb-1 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>
                    Phiên bản
                  </label>
                  <input value={version} onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg font-mono" style={{ fontSize: "13px" }} />
                </div>
                <div className="col-span-2">
                  <label className="block mb-1 text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>
                    Tên campaign <span className="text-[#dc2626]">*</span>
                  </label>
                  <input value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-card border border-border rounded-lg" style={{ fontSize: "13px" }} />
                </div>
              </div>

              {/* 4. Thiết bị mục tiêu */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>
                    3. Thiết bị mục tiêu <span className="text-[#dc2626]">*</span>
                    <span className="ml-1 text-[#990803]">({equipIds.length})</span>
                  </label>
                  {schoolEquipment.length > 0 && (
                    <button onClick={toggleAllEquip} className="text-[#0891b2] hover:underline" style={{ fontSize: "11px" }}>
                      {allEquipSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                    </button>
                  )}
                </div>
                {schoolEquipment.length === 0 ? (
                  <p className="text-muted-foreground px-3 py-2 bg-secondary/40 rounded-lg" style={{ fontSize: "12px" }}>
                    Trường chưa có thiết bị nào trong hệ thống.
                  </p>
                ) : (
                  <div className="border border-border rounded-lg divide-y divide-border max-h-44 overflow-y-auto">
                    {schoolEquipment.map((e) => (
                      <label key={e.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-secondary/50 cursor-pointer">
                        <input type="checkbox" checked={equipIds.includes(e.id)}
                          onChange={() => toggleEquip(e.id)} className="accent-[#990803]" />
                        <span className="flex-1 truncate" style={{ fontSize: "12px" }}>{e.name}</span>
                        <span className="font-mono text-muted-foreground" style={{ fontSize: "10.5px" }}>{e.serial}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border bg-secondary/20">
          <button onClick={onClose}
            className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary" style={{ fontSize: "12.5px" }}>
            Hủy
          </button>
          <button onClick={submit} disabled={!canSubmit}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] disabled:opacity-40"
            style={{ fontSize: "12.5px", fontWeight: 600 }}>
            <Rocket className="w-3.5 h-3.5" /> Tạo campaign
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Hàng campaign ───────────────────────────────────────────────── */
function CampaignRow({ c, onAdvance, onPause, onGotoContract }: {
  c: InstallCampaign;
  onAdvance: (c: InstallCampaign) => void;
  onPause: (c: InstallCampaign) => void;
  onGotoContract: (id: string) => void;
}) {
  const { licenses } = useOperations();
  const meta = STATUS_META[c.status];
  const progress = c.targetCount > 0 ? Math.round((c.completedCount / c.targetCount) * 100) : 0;
  const license = c.licenseId ? licenses.find((l) => l.id === c.licenseId) : undefined;

  return (
    <div className="p-4 hover:bg-secondary/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: meta.color + "15" }}>
          <Package className="w-5 h-5" style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
              {c.softwareName}{" "}
              <span className="font-mono text-muted-foreground" style={{ fontSize: "11px" }}>v{c.version}</span>
            </p>
            <span className="px-2 py-0.5 rounded-md"
              style={{ fontSize: "10px", fontWeight: 600, color: meta.color, backgroundColor: meta.color + "15" }}>
              {meta.label}
            </span>
          </div>
          <p className="text-muted-foreground mt-0.5 truncate" style={{ fontSize: "11.5px" }}>
            {c.name} · tạo {formatRelative(c.createdAt)}
          </p>

          {/* Liên kết truy nguồn */}
          <div className="flex items-center gap-3 mt-1">
            {c.contractId && (
              <button onClick={() => onGotoContract(c.contractId!)}
                className="flex items-center gap-0.5 text-[#0891b2] hover:underline" style={{ fontSize: "10.5px" }}>
                <FileText className="w-3 h-3" /> {c.contractId}
              </button>
            )}
            {license && (
              <span className="flex items-center gap-0.5 text-muted-foreground" style={{ fontSize: "10.5px" }}>
                <KeyRound className="w-3 h-3" /> {license.licenseKey}
              </span>
            )}
          </div>

          {/* Tiến độ */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: meta.color }} />
            </div>
            <span className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500, whiteSpace: "nowrap" }}>
              {c.completedCount}/{c.targetCount} ({progress}%)
            </span>
          </div>
          {c.failedCount > 0 && (
            <p className="text-[#dc2626] mt-0.5" style={{ fontSize: "10.5px", fontWeight: 500 }}>
              {c.failedCount} thiết bị cài lỗi
            </p>
          )}
        </div>

        {/* Hành động theo trạng thái */}
        <div className="flex flex-col gap-1 shrink-0">
          {c.status === "draft" && (
            <button onClick={() => onAdvance(c)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#7c3aed] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "11px", fontWeight: 600 }}>
              <Play className="w-3 h-3" /> Khởi chạy
            </button>
          )}
          {c.status === "running" && (
            <>
              <button onClick={() => onAdvance(c)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#16a34a] text-white rounded-lg hover:opacity-90"
                style={{ fontSize: "11px", fontWeight: 600 }}>
                <CheckCircle2 className="w-3 h-3" /> Cập nhật
              </button>
              <button onClick={() => onPause(c)}
                className="flex items-center gap-1 px-2.5 py-1.5 border border-border rounded-lg hover:bg-secondary"
                style={{ fontSize: "11px", fontWeight: 500 }}>
                <Pause className="w-3 h-3" /> Tạm dừng
              </button>
            </>
          )}
          {c.status === "paused" && (
            <button onClick={() => onAdvance(c)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#7c3aed] text-white rounded-lg hover:opacity-90"
              style={{ fontSize: "11px", fontWeight: 600 }}>
              <Play className="w-3 h-3" /> Tiếp tục
            </button>
          )}
          {(c.status === "completed" || c.status === "failed") && (
            <button onClick={() => toast.info("Tải nhật ký cài đặt chi tiết")}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-border rounded-lg hover:bg-secondary"
              style={{ fontSize: "11px", fontWeight: 500 }}>
              <Download className="w-3 h-3" /> Nhật ký
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Trang chính ─────────────────────────────────────────────────── */
export function SoftwareInstaller() {
  const navigate = useNavigate();
  const { campaigns, advanceCampaign, pauseCampaign } = useOperations();

  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => campaigns.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.softwareName.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [campaigns, statusFilter, search]);

  const runningCount = campaigns.filter((c) => c.status === "running").length;
  const totalDevices = campaigns.reduce((s, c) => s + c.targetCount, 0);
  const completedDevices = campaigns.reduce((s, c) => s + c.completedCount, 0);
  const failedCount = campaigns.filter((c) => c.status === "failed").length;

  const handleAdvance = (c: InstallCampaign) => {
    advanceCampaign(c.id);
    if (c.status === "draft" || c.status === "paused") toast.success(`Campaign "${c.softwareName}" đang chạy`);
    else toast.info("Đã cập nhật tiến độ cài đặt");
  };
  const handlePause = (c: InstallCampaign) => {
    pauseCampaign(c.id);
    toast.warning(`Đã tạm dừng campaign "${c.softwareName}"`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Cpu}
        title="Cấp phát bộ cài phần mềm"
        subtitle="Tạo campaign cài đặt phần mềm STEM lên thiết bị theo hợp đồng — gắn license và theo dõi tiến độ."
        accentColor="#990803"
        actions={
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
            style={{ fontSize: "13px", fontWeight: 500 }}>
            <Rocket className="w-4 h-4" /> Tạo campaign
          </button>
        }
      />

      <div className="flex items-start gap-2.5 p-3 bg-[#0891b2]/8 border border-[#0891b2]/25 rounded-lg">
        <Info className="w-4 h-4 text-[#0891b2] shrink-0 mt-0.5" />
        <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
          <strong className="text-foreground">BR-OP-06:</strong> Mỗi campaign phải gắn một{" "}
          <strong>license hợp lệ</strong> và danh sách <strong>thiết bị mục tiêu</strong> thuộc trường trong hợp đồng.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Rocket} label="Campaign đang chạy" value={runningCount} color="#7c3aed" />
        <KpiCard icon={Cpu} label="Thiết bị mục tiêu" value={totalDevices.toLocaleString()} color="#0891b2" />
        <KpiCard icon={CheckCircle2} label="Đã cài đặt" value={completedDevices.toLocaleString()} color="#16a34a"
          subtitle={`${totalDevices > 0 ? Math.round((completedDevices / totalDevices) * 100) : 0}% hoàn thành`} />
        <KpiCard icon={AlertTriangle} label="Campaign thất bại" value={failedCount} color="#dc2626" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm campaign / phần mềm..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none" style={{ fontSize: "13px" }} />
        </div>
        {(["all", ...Object.keys(STATUS_META)] as Array<"all" | CampaignStatus>).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s as "all" | CampaignStatus)}
            className={`px-3 py-2 rounded-lg border ${
              statusFilter === s ? "bg-[#990803] text-white border-[#990803]" : "bg-card border-border hover:bg-secondary"
            }`}
            style={{ fontSize: "12px", fontWeight: 500 }}>
            {s === "all" ? "Tất cả" : STATUS_META[s as CampaignStatus].label}
          </button>
        ))}
      </div>

      {/* Danh sách campaign */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
            Campaign triển khai
          </h3>
          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
            {filtered.length} campaign
          </span>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((c) => (
            <CampaignRow key={c.id} c={c}
              onAdvance={handleAdvance}
              onPause={handlePause}
              onGotoContract={(id) => navigate(`/supplier/contracts/${id}`)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="p-10 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
              <Clock className="w-7 h-7 mx-auto mb-2 opacity-40" />
              Không có campaign phù hợp.
            </div>
          )}
        </div>
      </div>

      {createOpen && <CreateCampaignDialog onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

export default SoftwareInstaller;
