import { useState } from "react";
import {
  BarChart3, TrendingUp, Calendar, Layers, Clock, DollarSign,
  Target, Download, ChevronDown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import {
  roomsBySchool, bookingsBySchool, tenantsByType,
  type STEMRoom, type RoomBooking,
} from "../../mock-data/index";
import { useAuth } from "../../AuthContext";
import { PageHeader } from "../ui/PageHeader";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "@/app/lib/toast";
import { cn } from "../ui/utils";

/* ================================================================ */
/*  ROOM ROI REPORT — Thống kê sử dụng phòng STEM & ROI             */
/* ================================================================ */

const INVESTMENT: Record<string, number> = {
  advanced: 680,
  basic: 420,
  minimal: 280,
};

const ROOM_COLORS = ["#2563eb", "#7c3aed", "#0891b2"];

const monthlyData = [
  { month: "Th.12/25", "P-STEM-01": 52, "P-STEM-02": 44, "P-ROBOT": 38 },
  { month: "Th.1/26",  "P-STEM-01": 34, "P-STEM-02": 30, "P-ROBOT": 26 },
  { month: "Th.2/26",  "P-STEM-01": 48, "P-STEM-02": 40, "P-ROBOT": 33 },
  { month: "Th.3/26",  "P-STEM-01": 61, "P-STEM-02": 53, "P-ROBOT": 47 },
  { month: "Th.4/26",  "P-STEM-01": 65, "P-STEM-02": 58, "P-ROBOT": 51 },
  { month: "Th.5/26",  "P-STEM-01": 42, "P-STEM-02": 35, "P-ROBOT": 31 },
];

type PeriodFilter = "month" | "semester" | "year";

function UtilBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold w-9 text-right" style={{ color }}>
        {value}%
      </span>
    </div>
  );
}

export function RoomROIReport() {
  const { user } = useAuth();
  const tenantId = user?.tenantType === "school" ? user.tenantId : tenantsByType.school[0].id;

  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("month");

  const rooms = roomsBySchool(tenantId);
  const bookings = bookingsBySchool(tenantId).filter((b) => b.status === "approved");

  const roomStats = rooms.map((r) => {
    const rBookings = bookings.filter((b) => b.roomId === r.id);
    const util = Math.min(Math.round((rBookings.length / 80) * 100), 95);
    const investment = INVESTMENT[r.tier] ?? 420;
    const roi = Math.round(util * 1.8);
    const roiLabel = roi >= 120 ? "Cao" : roi >= 80 ? "Trung bình" : "Thấp";
    const roiColor = roi >= 120 ? "text-green-600 bg-green-50" : roi >= 80 ? "text-blue-600 bg-blue-50" : "text-amber-600 bg-amber-50";
    return { ...r, totalSessions: rBookings.length, utilizationRate: util, estimatedROI: roi, investment, roiLabel, roiColor };
  });

  const avgUtil = Math.round(roomStats.reduce((s, r) => s + r.utilizationRate, 0) / (roomStats.length || 1));
  const totalSessions = roomStats.reduce((s, r) => s + r.totalSessions, 0);
  const totalHours = Math.round(totalSessions * 0.75);
  const savings = roomStats.length * 45;

  const barData = roomStats.map((r) => ({
    name: r.code,
    value: r.utilizationRate,
    color: r.utilizationRate >= 80 ? "#16a34a" : r.utilizationRate >= 60 ? "#2563eb" : "#f59e0b",
  }));

  const alertRooms = roomStats.filter((r) => r.utilizationRate < 50);

  const PERIOD_LABELS: Record<PeriodFilter, string> = {
    month: "Tháng này",
    semester: "Học kỳ 2",
    year: "Cả năm",
  };

  return (
    <div className="space-y-5">
      <PageHeader
        icon={BarChart3}
        title="Thống kê Sử dụng Phòng STEM"
        subtitle="Phân tích hiệu quả khai thác và ROI đầu tư cơ sở vật chất."
        accentColor="#2563eb"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden text-xs">
              {(["month", "semester", "year"] as PeriodFilter[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodFilter(p)}
                  className={cn(
                    "px-3 py-1.5 transition-colors",
                    periodFilter === p
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
            <button
              onClick={() => toast.info("Đang xuất báo cáo PDF...")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs hover:bg-muted transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Xuất báo cáo
            </button>
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={TrendingUp} label="Tỉ lệ sử dụng TB" value={`${avgUtil}%`} color="#2563eb" />
        <KpiCard icon={Calendar} label="Tổng tiết tháng này" value={totalSessions} color="#7c3aed" />
        <KpiCard icon={Clock} label="Giờ sử dụng" value={`${totalHours}h`} color="#0891b2" subtitle="45 phút/tiết" />
        <KpiCard icon={DollarSign} label="Tiết kiệm ước tính" value={`${savings}tr`} color="#16a34a" subtitle="so cơ sở vật lý thường" />
      </div>

      {/* Utilization bar chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          Tỉ lệ sử dụng theo phòng
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip formatter={(v) => [`${v}%`, "Tỉ lệ"]} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Progress bars legend */}
        <div className="mt-4 space-y-3">
          {roomStats.map((r, i) => (
            <div key={r.id} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-24 shrink-0">{r.code}</span>
              <div className="flex-1">
                <UtilBar
                  value={r.utilizationRate}
                  color={r.utilizationRate >= 80 ? "#16a34a" : r.utilizationRate >= 60 ? "#2563eb" : "#f59e0b"}
                />
              </div>
              <span className="text-xs text-muted-foreground w-20 shrink-0">{r.totalSessions} tiết</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly trend */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Xu hướng sử dụng theo tháng
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="P-STEM-01" name="Phòng STEM 1" fill={ROOM_COLORS[0]} radius={[3, 3, 0, 0]} barSize={14} />
            <Bar dataKey="P-STEM-02" name="Phòng STEM 2" fill={ROOM_COLORS[1]} radius={[3, 3, 0, 0]} barSize={14} />
            <Bar dataKey="P-ROBOT" name="Phòng Robotic" fill={ROOM_COLORS[2]} radius={[3, 3, 0, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ROI per room */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Phân tích ROI theo phòng
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {roomStats.map((r) => {
            const tierLabel: Record<string, string> = { advanced: "Nâng cao", basic: "Cơ bản", minimal: "Tối thiểu" };
            const tierColor: Record<string, string> = { advanced: "bg-blue-100 text-blue-700", basic: "bg-purple-100 text-purple-700", minimal: "bg-gray-100 text-gray-700" };
            return (
              <div key={r.id} className="border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.code}</p>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", tierColor[r.tier] ?? tierColor.basic)}>
                    {tierLabel[r.tier] ?? r.tier}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Đầu tư</p>
                    <p className="font-semibold text-foreground">{r.investment} triệu đ</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Số tiết</p>
                    <p className="font-semibold text-foreground">{r.totalSessions} tiết</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tỉ lệ</p>
                    <p className="font-semibold" style={{ color: r.utilizationRate >= 80 ? "#16a34a" : r.utilizationRate >= 60 ? "#2563eb" : "#f59e0b" }}>
                      {r.utilizationRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ROI</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", r.roiColor)}>
                      {r.roiLabel}
                    </span>
                  </div>
                </div>
                {r.utilizationRate < 60 && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                    Gợi ý: Tăng lịch sử dụng ngoài giờ hoặc mở CLB STEM để tăng hiệu suất.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert rooms */}
      {alertRooms.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Phòng cần chú ý — tỉ lệ sử dụng thấp dưới 50%
          </h3>
          <div className="space-y-2">
            {alertRooms.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-white rounded-lg border border-amber-200 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.name} ({r.code})</p>
                  <p className="text-xs text-muted-foreground">
                    Hiện tại {r.utilizationRate}% — Khuyến nghị: mở thêm lịch CLB, phân bổ lại tiết học
                  </p>
                </div>
                <span className="text-sm font-bold text-amber-600">{r.utilizationRate}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
