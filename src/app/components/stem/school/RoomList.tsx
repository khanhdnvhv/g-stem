import { useState } from "react";
import { Link } from "react-router";
import {
  Layers, Search, Plus, Settings2, CheckCircle2,
  AlertTriangle, Wrench, ChevronRight, Zap, Monitor,
} from "lucide-react";
import { roomsBySchool, tenantsByType, type STEMRoom } from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { TierBadge, ProgramBadge } from "../ui/badges";
import { cn } from "../ui/utils";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  ROOM LIST (School) — Quản lý phòng học STEM                      */
/* ================================================================ */

type StatusFilter = "all" | "active" | "maintenance" | "inactive";

const STATUS_META: Record<
  STEMRoom["status"],
  { label: string; color: string; bg: string; Icon: typeof CheckCircle2 }
> = {
  active:      { label: "Hoạt động",    color: "#16a34a", bg: "#16a34a15", Icon: CheckCircle2 },
  maintenance: { label: "Bảo trì",      color: "#f59e0b", bg: "#f59e0b15", Icon: Wrench },
  inactive:    { label: "Không hoạt động", color: "#dc2626", bg: "#dc262615", Icon: AlertTriangle },
};

export function RoomList() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;
  const rooms = roomsBySchool(tenantId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = rooms.filter((room) => {
    if (statusFilter !== "all" && room.status !== statusFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!room.name.toLowerCase().includes(s) && !room.code.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const totalEquipment = rooms.reduce((sum, r) => sum + r.equipmentCount, 0);
  const totalEquipOk = rooms.reduce((sum, r) => sum + r.equipmentOkCount, 0);
  const equipOkPct = totalEquipment > 0 ? Math.round((totalEquipOk / totalEquipment) * 100) : 0;
  const activeRooms = rooms.filter((r) => r.status === "active").length;
  const maintenanceRooms = rooms.filter((r) => r.status === "maintenance");

  const STATUS_TABS: Array<{ label: string; value: StatusFilter }> = [
    { label: "Tất cả", value: "all" },
    { label: "Hoạt động", value: "active" },
    { label: "Bảo trì", value: "maintenance" },
    { label: "Không hoạt động", value: "inactive" },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        icon={Layers}
        title="Phòng STEM"
        subtitle="Quản lý phòng học và thiết bị."
        accentColor="#2563eb"
        actions={
          <div className="flex items-center gap-2">
            <Link
              to="/school/rooms/booking"
              className="flex items-center gap-1.5 px-3 py-2 border border-[#2563eb] text-[#2563eb] rounded-lg hover:bg-[#2563eb] hover:text-white transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Zap className="w-4 h-4" />
              Đặt phòng
            </Link>
            <button
              onClick={() => toast.info("Tính năng thêm phòng đang phát triển")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Plus className="w-4 h-4" />
              Thêm phòng
            </button>
          </div>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Layers} label="Tổng số phòng" value={rooms.length} color="#2563eb" />
        <KpiCard
          icon={CheckCircle2}
          label="Phòng hoạt động"
          value={activeRooms}
          subtitle={`/ ${rooms.length} phòng`}
          color="#16a34a"
        />
        <KpiCard
          icon={Monitor}
          label="Tổng thiết bị"
          value={totalEquipment}
          color="#7c3aed"
        />
        <KpiCard
          icon={Settings2}
          label="Thiết bị hoạt động tốt"
          value={`${equipOkPct}%`}
          subtitle={`${totalEquipOk} / ${totalEquipment} thiết bị`}
          color={equipOkPct >= 90 ? "#16a34a" : equipOkPct >= 70 ? "#f59e0b" : "#dc2626"}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm phòng, mã phòng..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none focus:border-[#2563eb]"
            style={{ fontSize: "13px" }}
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg border transition-colors",
                statusFilter === tab.value
                  ? "bg-[#2563eb] text-white border-[#2563eb]"
                  : "bg-card border-border hover:bg-secondary text-foreground"
              )}
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              {tab.label}
              {tab.value !== "all" && (
                <span className="ml-1 opacity-70">
                  ({rooms.filter((r) => r.status === tab.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground" style={{ fontSize: "13px" }}>
          Không tìm thấy phòng nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((room) => {
            const statusMeta = STATUS_META[room.status];
            const StatusIcon = statusMeta.Icon;
            const equipPct = room.equipmentCount > 0
              ? Math.round((room.equipmentOkCount / room.equipmentCount) * 100)
              : 0;
            const equipColor = equipPct >= 90 ? "#16a34a" : equipPct >= 70 ? "#f59e0b" : "#dc2626";

            return (
              <div
                key={room.id}
                className={cn(
                  "bg-card border border-border rounded-xl p-5 flex flex-col gap-4",
                  room.status === "maintenance" && "border-amber-300/60 bg-amber-50/20 dark:bg-amber-950/10"
                )}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "#2563eb15" }}
                    >
                      <Layers className="w-5 h-5" style={{ color: "#2563eb" }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
                          {room.name}
                        </h3>
                        <span
                          className="px-1.5 py-0.5 rounded font-mono"
                          style={{ fontSize: "10px", fontWeight: 600, backgroundColor: "#64748b15", color: "#64748b" }}
                        >
                          {room.code}
                        </span>
                      </div>
                      <p className="text-muted-foreground truncate" style={{ fontSize: "11.5px" }}>
                        {room.building} · Tầng {room.floor} · {room.area}m²
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <TierBadge tier={room.tier} size="sm" />
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                      style={{ fontSize: "10px", fontWeight: 600, color: statusMeta.color, backgroundColor: statusMeta.bg }}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusMeta.label}
                    </span>
                  </div>
                </div>

                {/* Equipment Bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                      Thiết bị hoạt động tốt
                    </span>
                    <span style={{ fontSize: "11.5px", fontWeight: 600, color: equipColor }}>
                      {room.equipmentOkCount}/{room.equipmentCount} ({equipPct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${equipPct}%`, backgroundColor: equipColor }}
                    />
                  </div>
                </div>

                {/* Features */}
                {room.features.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {room.features.slice(0, 3).map((feat) => (
                      <span
                        key={feat}
                        className="px-2 py-0.5 bg-secondary rounded-md text-muted-foreground"
                        style={{ fontSize: "10.5px" }}
                      >
                        {feat}
                      </span>
                    ))}
                    {room.features.length > 3 && (
                      <span
                        className="px-2 py-0.5 bg-secondary rounded-md text-muted-foreground"
                        style={{ fontSize: "10.5px" }}
                      >
                        +{room.features.length - 3} tính năng
                      </span>
                    )}
                  </div>
                )}

                {/* Programs */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>Chương trình:</span>
                  {room.programs.map((p) => (
                    <ProgramBadge key={p} code={p} size="xs" />
                  ))}
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                    Sức chứa: <strong>{room.capacity}</strong> học sinh
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toast.info(`Đặt phòng ${room.name}`)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 text-[#2563eb] hover:bg-[#2563eb15] rounded-md transition-colors"
                      style={{ fontSize: "11.5px", fontWeight: 500 }}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Đặt phòng
                    </button>
                    <Link
                      to={`/school/rooms/${room.id}`}
                      className="inline-flex items-center gap-1 px-2 py-1.5 bg-[#2563eb15] text-[#2563eb] rounded-md hover:bg-[#2563eb] hover:text-white transition-colors"
                      style={{ fontSize: "11.5px", fontWeight: 500 }}
                    >
                      Chi tiết
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Maintenance Alert */}
      {maintenanceRooms.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Wrench className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 dark:text-amber-300" style={{ fontSize: "13px", fontWeight: 700 }}>
                {maintenanceRooms.length} phòng đang bảo trì
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {maintenanceRooms.map((room) => (
                  <div key={room.id} className="flex items-center gap-2">
                    <span className="text-amber-700 dark:text-amber-400" style={{ fontSize: "12.5px" }}>
                      • {room.name} ({room.code})
                    </span>
                    <span className="text-amber-600 dark:text-amber-500" style={{ fontSize: "11px" }}>
                      — Bảo trì lần cuối: {new Date(room.lastMaintenanceDate).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-amber-600 dark:text-amber-500" style={{ fontSize: "11.5px" }}>
                Liên hệ bộ phận kỹ thuật để cập nhật tiến độ bảo trì.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomList;
