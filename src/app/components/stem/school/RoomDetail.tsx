import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  Layers, ArrowLeft, Monitor, Cpu, Calendar, Users,
  CheckCircle2, AlertTriangle, Wrench, MapPin, Clock,
  Settings2, ChevronRight, Zap, ClipboardList, History, ShieldAlert,
} from "lucide-react";
import {
  stemRooms,
  bookingsByRoom,
  type STEMRoom,
  type RoomBooking,
} from "../../mock-data/index";
import { ProgramBadge, TierBadge } from "../ui/badges";
import { PageHeader } from "../ui/PageHeader";
import { toast } from "@/app/lib/toast";

/* ================================================================ */
/*  ROOM DETAIL (School) — Chi tiết phòng STEM                       */
/* ================================================================ */

const STATUS_META: Record<
  STEMRoom["status"],
  { label: string; color: string; bg: string; Icon: typeof CheckCircle2 }
> = {
  active:      { label: "Hoạt động",       color: "#16a34a", bg: "#16a34a15", Icon: CheckCircle2 },
  maintenance: { label: "Đang bảo trì",    color: "#f59e0b", bg: "#f59e0b15", Icon: Wrench },
  inactive:    { label: "Không hoạt động", color: "#dc2626", bg: "#dc262615", Icon: AlertTriangle },
};

const BOOKING_STATUS_META: Record<
  RoomBooking["status"],
  { label: string; color: string; bg: string }
> = {
  approved:  { label: "Đã duyệt",  color: "#16a34a", bg: "#16a34a15" },
  pending:   { label: "Chờ duyệt", color: "#f59e0b", bg: "#f59e0b15" },
  cancelled: { label: "Đã hủy",   color: "#dc2626", bg: "#dc262615" },
};

/* ── BOM Static Data ── */
const BOM_ITEMS = [
  { no: 1,  item: "Bàn học sinh (module)",           contractQty: 15, actualQty: 15, status: "ok" },
  { no: 2,  item: "Ghế học sinh",                    contractQty: 30, actualQty: 28, status: "warning" },
  { no: 3,  item: "Màn hình tương tác",              contractQty: 1,  actualQty: 1,  status: "ok" },
  { no: 4,  item: "Máy tính giáo viên",              contractQty: 1,  actualQty: 1,  status: "ok" },
  { no: 5,  item: "Máy tính/Tablet học sinh",        contractQty: 15, actualQty: 14, status: "broken" },
  { no: 6,  item: "Bộ Kit Robotics",                 contractQty: 15, actualQty: 15, status: "ok" },
  { no: 7,  item: "Camera quan sát",                 contractQty: 2,  actualQty: 2,  status: "ok" },
  { no: 8,  item: "Điều hòa không khí",              contractQty: 2,  actualQty: 2,  status: "ok" },
  { no: 9,  item: "Tủ bảo quản thiết bị",            contractQty: 2,  actualQty: 2,  status: "ok" },
  { no: 10, item: "Bộ cảm biến/Sensor",              contractQty: 30, actualQty: 30, status: "ok" },
  { no: 11, item: "Máy in 3D",                       contractQty: 1,  actualQty: 0,  status: "broken" },
  { no: 12, item: "Router WiFi",                     contractQty: 2,  actualQty: 2,  status: "ok" },
  { no: 13, item: "Phần mềm license (embedded)",     contractQty: 15, actualQty: 15, status: "ok" },
  { no: 14, item: "Hệ thống chiếu sáng chuyên dụng", contractQty: 1,  actualQty: 1,  status: "ok" },
];

/* ── Usage History Static Data ── */
const USAGE_HISTORY = [
  { date: "19/05/2026", period: "T1-T2", class: "8A", teacher: "Phạm Anh Tuấn",   program: "CT2", hours: 1.5 },
  { date: "19/05/2026", period: "T3-T4", class: "9B", teacher: "Trần Văn Hùng",   program: "CT3", hours: 1.5 },
  { date: "18/05/2026", period: "T1-T2", class: "7C", teacher: "Nguyễn Thị Lan",  program: "CT1", hours: 1.5 },
  { date: "17/05/2026", period: "T5-T6", class: "8B", teacher: "Phạm Anh Tuấn",   program: "CT1", hours: 1.5 },
  { date: "16/05/2026", period: "T3-T4", class: "6A", teacher: "Lê Minh Trang",   program: "CT3", hours: 1.5 },
];

/* ── Warranty Mock Data ── */
const WARRANTY_MOCK = [
  { ticketNo: "WR-001", equipment: "Máy tính/Tablet #5",   issue: "Không khởi động được",       status: "in_repair",   date: "15/05/2026" },
  { ticketNo: "WR-002", equipment: "Máy in 3D",            issue: "Đầu in bị kẹt, cần thay thế", status: "waiting_ncc", date: "10/05/2026" },
  { ticketNo: "WR-003", equipment: "Ghế học sinh #12",     issue: "Gãy chân ghế",                status: "resolved",    date: "01/05/2026" },
];

const WARRANTY_STATUS_DISPLAY: Record<string, { label: string; color: string; bg: string }> = {
  in_repair:   { label: "Đang sửa",    color: "#f59e0b", bg: "#f59e0b15" },
  waiting_ncc: { label: "Chờ NCC",     color: "#7c3aed", bg: "#7c3aed15" },
  resolved:    { label: "Đã xử lý",   color: "#16a34a", bg: "#16a34a15" },
};

function BomStatusCell({ status }: { status: string }) {
  if (status === "ok") {
    return (
      <span className="inline-flex items-center gap-1" style={{ fontSize: "12px", color: "#16a34a", fontWeight: 600 }}>
        ✅ Tốt
      </span>
    );
  }
  if (status === "warning") {
    return (
      <span className="inline-flex items-center gap-1" style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 600 }}>
        ⚠️ Cần sửa
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1" style={{ fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>
      🔴 Đang bảo hành
    </span>
  );
}

export function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const room = stemRooms.find((r) => r.id === id);

  const [activeTab, setActiveTab] = useState<"bom" | "usage" | "warranty">("bom");

  if (!room) {
    return (
      <div className="space-y-5">
        <Link
          to="/school/rooms"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          style={{ fontSize: "13px" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách phòng
        </Link>
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-foreground" style={{ fontSize: "18px", fontWeight: 700 }}>
            Không tìm thấy phòng
          </h2>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>
            Phòng học với mã <code className="bg-secondary px-1 rounded">{id}</code> không tồn tại.
          </p>
          <Link
            to="/school/rooms"
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Về danh sách phòng
          </Link>
        </div>
      </div>
    );
  }

  const allBookings = bookingsByRoom(id ?? "");
  const bookings = allBookings.filter((b) => b.status === "approved").slice(0, 10);

  const statusMeta = STATUS_META[room.status];
  const StatusIcon = statusMeta.Icon;
  const equipPct =
    room.equipmentCount > 0
      ? Math.round((room.equipmentOkCount / room.equipmentCount) * 100)
      : 0;
  const equipColor = equipPct >= 90 ? "#16a34a" : equipPct >= 70 ? "#f59e0b" : "#dc2626";
  const brokenCount = room.equipmentCount - room.equipmentOkCount;

  // Stats
  const now = new Date("2026-05-18");
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const bookingsThisWeek = allBookings.filter((b) => {
    const d = new Date(b.date);
    return b.status === "approved" && d >= weekStart && d <= weekEnd;
  }).length;

  const thisMonthStr = now.toISOString().slice(0, 7);
  const bookingsThisMonth = allBookings.filter(
    (b) => b.status === "approved" && b.date.startsWith(thisMonthStr)
  ).length;

  // Same floor rooms
  const sameFloorRooms = stemRooms.filter(
    (r) => r.id !== room.id && r.floor === room.floor && r.building === room.building
  );

  return (
    <div className="space-y-5">
      {/* Back + Header */}
      <Link
        to="/school/rooms"
        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        style={{ fontSize: "13px" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách phòng
      </Link>

      <PageHeader
        icon={Layers}
        title={room.name}
        subtitle={room.description}
        accentColor="#990803"
        badge={
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md"
            style={{ fontSize: "11px", fontWeight: 600, color: statusMeta.color, backgroundColor: statusMeta.bg }}
          >
            <StatusIcon className="w-3 h-3" />
            {statusMeta.label}
          </span>
        }
        actions={
          <Link
            to="/school/rooms/booking"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90 transition-opacity"
            style={{ fontSize: "13px", fontWeight: 500 }}
          >
            <Zap className="w-4 h-4" />
            Đặt phòng này
          </Link>
        }
      />

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#2563eb] to-[#1e40af] rounded-xl p-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 style={{ fontSize: "20px", fontWeight: 700 }}>{room.name}</h2>
                <TierBadge tier={room.tier} size="sm" />
              </div>
              <p className="text-white/70 mt-0.5" style={{ fontSize: "12px" }}>
                Mã phòng: <strong className="text-white">{room.code}</strong>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { Icon: Users,   label: "Sức chứa",           value: `${room.capacity} HS` },
              { Icon: MapPin,  label: "Vị trí",             value: `${room.building}, T.${room.floor}` },
              { Icon: Monitor, label: "Thiết bị",           value: `${room.equipmentCount} bộ` },
              { Icon: Clock,   label: "Bảo trì gần nhất",   value: new Date(room.lastMaintenanceDate).toLocaleDateString("vi-VN") },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1 text-white/60 mb-1">
                  <Icon className="w-3.5 h-3.5" />
                  <span style={{ fontSize: "10px" }}>{label}</span>
                </div>
                <p className="text-white" style={{ fontSize: "14px", fontWeight: 700 }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3-Tab Navigation */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        {([
          { key: "bom",      label: "Thông tin & BOM",    Icon: ClipboardList },
          { key: "usage",    label: "Lịch sử sử dụng",    Icon: History },
          { key: "warranty", label: "Bảo hành & Sự cố",   Icon: ShieldAlert },
        ] as const).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={[
              "flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all",
              activeTab === key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Tab 1: Thông tin & BOM                                    */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "bom" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: col-span-2 */}
          <div className="lg:col-span-2 space-y-5">
            {/* Equipment Card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-4 h-4" style={{ color: "#2563eb" }} />
                <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
                  Trang thiết bị
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Tổng thiết bị",    value: room.equipmentCount,    color: "#2563eb" },
                  { label: "Hoạt động tốt",    value: room.equipmentOkCount,  color: "#16a34a" },
                  { label: "Hư hỏng / thiếu",  value: brokenCount,            color: brokenCount > 0 ? "#dc2626" : "#64748b" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-secondary/40 rounded-lg p-3 text-center">
                    <p style={{ fontSize: "22px", fontWeight: 700, color }}>{value}</p>
                    <p className="text-muted-foreground mt-0.5" style={{ fontSize: "10.5px" }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                    Tỉ lệ thiết bị hoạt động tốt
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: equipColor }}>
                    {equipPct}%
                  </span>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${equipPct}%`, backgroundColor: equipColor }}
                  />
                </div>
                <p className="text-muted-foreground mt-1" style={{ fontSize: "10.5px" }}>
                  Bảo trì lần cuối:{" "}
                  <strong className="text-foreground">
                    {new Date(room.lastMaintenanceDate).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>
                </p>
              </div>

              <div>
                <p className="text-muted-foreground mb-2" style={{ fontSize: "11px", fontWeight: 600 }}>
                  TÍNH NĂNG / THIẾT BỊ NỔI BẬT
                </p>
                <div className="flex flex-wrap gap-2">
                  {room.features.map((feat) => (
                    <span
                      key={feat}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2563eb10] rounded-lg"
                      style={{ fontSize: "11.5px", color: "#2563eb", fontWeight: 500 }}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Programs Card */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4" style={{ color: "#2563eb" }} />
                <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
                  Chương trình được dạy
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {room.programs.map((p) => (
                  <ProgramBadge key={p} code={p} size="md" showName />
                ))}
              </div>
            </div>

            {/* BOM Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                <ClipboardList className="w-4 h-4" style={{ color: "#2563eb" }} />
                <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
                  Bill of Materials (BOM)
                </h3>
                <span className="text-muted-foreground ml-auto" style={{ fontSize: "11.5px" }}>
                  {BOM_ITEMS.length} hạng mục
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                    <tr>
                      <th className="px-4 py-2.5 w-10">#</th>
                      <th className="px-4 py-2.5">Hạng mục</th>
                      <th className="px-4 py-2.5 text-center">Số lượng theo HĐ</th>
                      <th className="px-4 py-2.5 text-center">Số lượng thực tế</th>
                      <th className="px-4 py-2.5">Tình trạng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {BOM_ITEMS.map((row) => (
                      <tr key={row.no} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "12.5px" }}>
                          {row.no}
                        </td>
                        <td className="px-4 py-2.5 text-foreground" style={{ fontSize: "12.5px", fontWeight: 500 }}>
                          {row.item}
                        </td>
                        <td className="px-4 py-2.5 text-center text-foreground" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                          {row.contractQty}
                        </td>
                        <td className="px-4 py-2.5 text-center" style={{ fontSize: "12.5px", fontWeight: 600,
                          color: row.actualQty < row.contractQty ? "#dc2626" : "#16a34a" }}>
                          {row.actualQty}
                        </td>
                        <td className="px-4 py-2.5" style={{ fontSize: "12.5px" }}>
                          <BomStatusCell status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-border">
                <Link
                  to="/school/warranty"
                  style={{ fontSize: "12.5px", fontWeight: 600, color: "#dc2626" }}
                  className="hover:underline"
                >
                  Báo hỏng thiết bị →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Stats mini-cards */}
            <div className="space-y-3">
              {[
                {
                  Icon: Calendar,
                  label: "Lịch đặt trong tuần này",
                  value: bookingsThisWeek,
                  color: "#2563eb",
                  sub: "buổi đã duyệt",
                },
                {
                  Icon: Clock,
                  label: "Tổng buổi học tháng này",
                  value: bookingsThisMonth,
                  color: "#7c3aed",
                  sub: "buổi",
                },
              ].map(({ Icon, label, value, color, sub }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: color + "15" }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: "11.5px" }}>{label}</p>
                    <p style={{ fontSize: "22px", fontWeight: 700, lineHeight: 1.2 }}>
                      {value}{" "}
                      <span className="text-muted-foreground" style={{ fontSize: "12px", fontWeight: 400 }}>
                        {sub}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings2 className="w-4 h-4" style={{ color: "#2563eb" }} />
                <h3 className="text-foreground" style={{ fontSize: "13px", fontWeight: 700 }}>
                  Thao tác nhanh
                </h3>
              </div>
              <div className="space-y-2">
                <Link
                  to="/school/rooms/booking"
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-[#990803] text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ fontSize: "12.5px", fontWeight: 500 }}
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Đặt phòng
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => toast.warning(`Đã gửi báo hỏng thiết bị phòng ${room.name}`)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  style={{ fontSize: "12.5px", fontWeight: 500 }}
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Báo hỏng thiết bị
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => toast.info(`Yêu cầu bảo hành phòng ${room.name} đã được gửi`)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  style={{ fontSize: "12.5px", fontWeight: 500 }}
                >
                  <span className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#7c3aed]" />
                    Yêu cầu bảo hành
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => toast.info("Mở lịch đặt phòng đầy đủ")}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  style={{ fontSize: "12.5px", fontWeight: 500 }}
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#2563eb]" />
                    Xem lịch đặt phòng
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Same Floor Rooms */}
            {sameFloorRooms.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-foreground" style={{ fontSize: "13px", fontWeight: 700 }}>
                    Phòng cùng tầng
                  </h3>
                  <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                    {room.building} T.{room.floor}
                  </span>
                </div>
                <div className="space-y-2">
                  {sameFloorRooms.map((r) => {
                    const sm = STATUS_META[r.status];
                    const SIcon = sm.Icon;
                    return (
                      <Link
                        key={r.id}
                        to={`/school/rooms/${r.id}`}
                        className="flex items-center justify-between px-3 py-2 bg-secondary/40 rounded-lg hover:bg-secondary/70 transition-colors"
                      >
                        <div>
                          <p className="text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>
                            {r.name}
                          </p>
                          <span
                            className="inline-flex items-center gap-1"
                            style={{ fontSize: "10px", color: sm.color }}
                          >
                            <SIcon className="w-2.5 h-2.5" />
                            {sm.label}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Tab 2: Lịch sử sử dụng                                    */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "usage" && (
        <div className="space-y-4">
          {/* KPI banner */}
          <div className="bg-gradient-to-r from-[#2563eb]/5 to-[#7c3aed]/5 rounded-xl border border-border p-4 flex flex-wrap items-center gap-6">
            <div>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Tổng giờ tháng này</p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "#2563eb", lineHeight: 1.2 }}>
                12 <span className="text-muted-foreground" style={{ fontSize: "13px", fontWeight: 400 }}>giờ</span>
              </p>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Tỉ lệ lấp đầy</p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "#7c3aed", lineHeight: 1.2 }}>
                78<span className="text-muted-foreground" style={{ fontSize: "13px", fontWeight: 400 }}>%</span>
              </p>
            </div>
          </div>

          {/* Usage table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <History className="w-4 h-4" style={{ color: "#2563eb" }} />
              <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
                Lịch sử sử dụng phòng
              </h3>
              <span className="text-muted-foreground ml-auto" style={{ fontSize: "11.5px" }}>
                {USAGE_HISTORY.length} bản ghi gần nhất
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                  <tr>
                    <th className="px-4 py-2.5">Ngày</th>
                    <th className="px-4 py-2.5">Tiết</th>
                    <th className="px-4 py-2.5">Lớp</th>
                    <th className="px-4 py-2.5">Giáo viên</th>
                    <th className="px-4 py-2.5">Chương trình</th>
                    <th className="px-4 py-2.5 text-center">Số giờ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {USAGE_HISTORY.map((row, idx) => (
                    <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap" style={{ fontSize: "12.5px" }}>
                        {row.date}
                      </td>
                      <td className="px-4 py-2.5" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                        {row.period}
                      </td>
                      <td className="px-4 py-2.5" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                        {row.class}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap" style={{ fontSize: "12.5px" }}>
                        {row.teacher}
                      </td>
                      <td className="px-4 py-2.5">
                        <ProgramBadge code={row.program} size="xs" />
                      </td>
                      <td className="px-4 py-2.5 text-center" style={{ fontSize: "12.5px", fontWeight: 600, color: "#2563eb" }}>
                        {row.hours}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Tab 3: Bảo hành & Sự cố                                   */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "warranty" && (
        <div className="space-y-4">
          {/* Create new ticket link */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground" style={{ fontSize: "12.5px" }}>
              Danh sách phiếu bảo hành / sự cố liên quan đến phòng này.
            </p>
            <Link
              to="/school/warranty"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ fontSize: "12.5px", fontWeight: 600 }}
            >
              + Tạo yêu cầu bảo hành mới
            </Link>
          </div>

          {/* Warranty table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <ShieldAlert className="w-4 h-4" style={{ color: "#dc2626" }} />
              <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
                Phiếu bảo hành & Sự cố
              </h3>
              <span className="text-muted-foreground ml-auto" style={{ fontSize: "11.5px" }}>
                {WARRANTY_MOCK.length} phiếu
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50 text-left text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
                  <tr>
                    <th className="px-4 py-2.5">Mã phiếu</th>
                    <th className="px-4 py-2.5">Thiết bị</th>
                    <th className="px-4 py-2.5">Mô tả sự cố</th>
                    <th className="px-4 py-2.5">Trạng thái</th>
                    <th className="px-4 py-2.5">Ngày báo</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {WARRANTY_MOCK.map((row) => {
                    const wMeta = WARRANTY_STATUS_DISPLAY[row.status] ?? { label: row.status, color: "#64748b", bg: "#64748b15" };
                    return (
                      <tr key={row.ticketNo} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-4 py-2.5 font-mono" style={{ fontSize: "12px", fontWeight: 700, color: "#2563eb" }}>
                          {row.ticketNo}
                        </td>
                        <td className="px-4 py-2.5 text-foreground" style={{ fontSize: "12.5px", fontWeight: 600 }}>
                          {row.equipment}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground" style={{ fontSize: "12.5px" }}>
                          {row.issue}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-md"
                            style={{ fontSize: "10.5px", fontWeight: 600, color: wMeta.color, backgroundColor: wMeta.bg }}
                          >
                            {wMeta.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap" style={{ fontSize: "12px" }}>
                          {row.date}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <Link
                            to="/school/warranty"
                            className="text-[#2563eb] hover:underline"
                            style={{ fontSize: "12px", fontWeight: 500 }}
                          >
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bookings table (moved from main view) */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Calendar className="w-4 h-4" style={{ color: "#2563eb" }} />
              <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>
                Lịch đặt phòng gần đây
              </h3>
              <span className="text-muted-foreground ml-auto" style={{ fontSize: "11.5px" }}>
                {bookings.length} lịch gần nhất
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border">
                    {["Ngày", "Lớp", "Giáo viên", "Tiết", "CT", "Trạng thái"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-muted-foreground whitespace-nowrap"
                        style={{ fontSize: "10.5px", fontWeight: 600 }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
                        Chưa có lịch đặt phòng.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => {
                      const bMeta = BOOKING_STATUS_META[b.status];
                      return (
                        <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                          <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap" style={{ fontSize: "12px" }}>
                            {new Date(b.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                          </td>
                          <td className="px-4 py-2.5" style={{ fontSize: "12px", fontWeight: 500 }}>
                            {b.className}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap" style={{ fontSize: "12px" }}>
                            {b.teacherName}
                          </td>
                          <td className="px-4 py-2.5 text-center" style={{ fontSize: "12px", fontWeight: 600 }}>
                            Tiết {b.period}
                          </td>
                          <td className="px-4 py-2.5">
                            <ProgramBadge code={b.programCode} size="xs" />
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className="px-1.5 py-0.5 rounded-md"
                              style={{ fontSize: "10px", fontWeight: 600, color: bMeta.color, backgroundColor: bMeta.bg }}
                            >
                              {bMeta.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomDetail;
