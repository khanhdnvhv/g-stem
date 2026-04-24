import { useState } from "react";
import {
  Cpu, Download, Upload, Rocket, Clock, CheckCircle2,
  AlertTriangle, Package, Plus,
} from "lucide-react";
import { tenantsByType, stemPackages } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { formatRelative } from "../ui/format";
import { toast } from "sonner";

/* ================================================================ */
/*  SOFTWARE INSTALLER — đẩy bộ cài xuống thiết bị theo campaign    */
/* ================================================================ */

interface InstallCampaign {
  id: string;
  name: string;
  productName: string;
  version: string;
  targetType: "tenant" | "package" | "device-group";
  targetName: string;
  targetCount: number;
  completedCount: number;
  status: "scheduled" | "running" | "done" | "partial" | "failed";
  startedAt: string;
  createdBy: string;
}

function generateCampaigns(): InstallCampaign[] {
  const products = [
    { name: "Geleximco STEM Studio", version: "3.2.1" },
    { name: "Robotic AI Suite",      version: "4.0.0" },
    { name: "AI-Buddy Tutor",        version: "1.5.2" },
    { name: "IoT Platform",          version: "2.0.5" },
    { name: "STEM Explorer",         version: "1.0.3" },
  ];
  const statuses: InstallCampaign["status"][] = ["done", "running", "scheduled", "partial", "failed", "done", "done"];
  const schools = tenantsByType.school;
  return products.flatMap((p, i) =>
    statuses.map((st, si) => {
      const school = schools[(i * 7 + si) % schools.length];
      const target = 30 + ((i + si) * 13) % 60;
      const completed = st === "done" ? target
        : st === "running" ? Math.floor(target * 0.6)
        : st === "partial" ? Math.floor(target * 0.7)
        : st === "failed" ? Math.floor(target * 0.2)
        : 0;
      return {
        id: `CAMP-${i}-${si}`,
        name: `Triển khai ${p.name} v${p.version} → ${school.name}`,
        productName: p.name,
        version: p.version,
        targetType: "tenant" as const,
        targetName: school.name,
        targetCount: target,
        completedCount: completed,
        status: st,
        startedAt: new Date(Date.now() - (si + 1) * 86400_000 * 3).toISOString(),
        createdBy: "U-SUP-WR-01",
      };
    })
  ).slice(0, 15);
}

const STATUS_META: Record<InstallCampaign["status"], { label: string; color: string }> = {
  scheduled: { label: "Đã lên lịch",   color: "#64748b" },
  running:   { label: "Đang chạy",     color: "#7c3aed" },
  done:      { label: "Hoàn tất",      color: "#16a34a" },
  partial:   { label: "Hoàn tất 1 phần", color: "#f59e0b" },
  failed:    { label: "Thất bại",      color: "#dc2626" },
};

export function SoftwareInstaller() {
  const [campaigns] = useState(generateCampaigns());

  const activeRunning = campaigns.filter((c) => c.status === "running").length;
  const totalDevices = campaigns.reduce((s, c) => s + c.targetCount, 0);
  const completed = campaigns.reduce((s, c) => s + c.completedCount, 0);
  const failedCampaigns = campaigns.filter((c) => c.status === "failed").length;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Cpu}
        title="Cấp phát bộ cài phần mềm"
        subtitle="Phân phối bộ cài đặt phần mềm STEM trực tiếp lên thiết bị theo campaign"
        actions={
          <>
            <button
              onClick={() => toast.success("Tạo campaign mới — chọn sản phẩm, phiên bản, target")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Rocket className="w-4 h-4" />
              Tạo campaign
            </button>
            <button
              onClick={() => toast.info("Upload bộ cài mới lên CDN")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Upload className="w-4 h-4" />
              Upload bộ cài
            </button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Rocket} label="Campaign đang chạy" value={activeRunning} color="#7c3aed" />
        <KpiCard icon={Cpu} label="Thiết bị mục tiêu" value={totalDevices.toLocaleString()} color="#0891b2" />
        <KpiCard icon={CheckCircle2} label="Đã cài đặt" value={completed.toLocaleString()} color="#16a34a" subtitle={`${Math.round((completed / totalDevices) * 100)}% hoàn thành`} />
        <KpiCard icon={AlertTriangle} label="Campaign thất bại" value={failedCampaigns} color="#dc2626" trend="down" />
      </div>

      {/* Campaigns list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
            Campaign triển khai gần đây
          </h3>
          <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
            {campaigns.length} campaign
          </span>
        </div>
        <div className="divide-y divide-border">
          {campaigns.map((c) => {
            const meta = STATUS_META[c.status];
            const progress = Math.round((c.completedCount / c.targetCount) * 100);
            return (
              <div key={c.id} className="p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: meta.color + "15" }}
                  >
                    <Package className="w-5 h-5" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
                        {c.productName} <span className="font-mono text-muted-foreground" style={{ fontSize: "11px" }}>v{c.version}</span>
                      </p>
                      <span
                        className="px-2 py-0.5 rounded-md"
                        style={{
                          fontSize: "10px", fontWeight: 600,
                          color: meta.color, backgroundColor: meta.color + "15",
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11.5px" }}>
                      Target: {c.targetName} · bắt đầu {formatRelative(c.startedAt)}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{ width: `${progress}%`, backgroundColor: meta.color }}
                        />
                      </div>
                      <span className="text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>
                        {c.completedCount}/{c.targetCount} ({progress}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {c.status === "running" && (
                      <button
                        onClick={() => toast.warning(`Dừng campaign ${c.productName}`)}
                        className="p-1.5 hover:bg-secondary rounded"
                        title="Dừng"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => toast.info(`Xem nhật ký chi tiết campaign`)}
                      className="p-1.5 hover:bg-secondary rounded"
                      title="Tải log"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SoftwareInstaller;
