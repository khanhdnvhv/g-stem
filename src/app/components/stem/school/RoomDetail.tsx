import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  Layers, ArrowLeft, Monitor, Cpu, Calendar, Users,
  CheckCircle2, AlertTriangle, Wrench, MapPin, Clock,
  Settings2, ChevronRight, Zap,
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

export function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const room = stemRooms.find((r) => r.id === id);

  const [_activeTab, setActiveTab] = useState<"equipment" | "bookings">("equipment");

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
            className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90"
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
        accentColor="#2563eb"
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
            className="flex items-center gap-1.5 px-3 py-2 bg-[#2563eb] text-white rounded-lg hover:opacity-90 transition-opacity"
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
              { Icon: Users, label: "Sức chứa", value: `${room.capacity} HS` },
              { Icon: MapPin, label: "Vị trí", value: `${room.building}, T.${room.floor}` },
              { Icon: Monitor, label: "Thiết bị", value: `${room.equipmentCount} bộ` },
              { Icon: Clock, label: "Bảo trì gần nhất", value: new Date(room.lastMaintenanceDate).toLocaleDateString("vi-VN") },
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

      {/* Main Content Grid */}
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
                { label: "Tổng thiết bị", value: room.equipmentCount, color: "#2563eb" },
                { label: "Hoạt động tốt", value: room.equipmentOkCount, color: "#16a34a" },
                { label: "Hư hỏng / thiếu", value: brokenCount, color: brokenCount > 0 ? "#dc2626" : "#64748b" },
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

          {/* Recent Bookings Card */}
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
                className="w-full flex items-center justify-between px-3 py-2.5 bg-[#2563eb] text-white rounded-lg hover:opacity-90 transition-opacity"
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
    </div>
  );
}

export default RoomDetail;
