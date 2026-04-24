import { useState } from "react";
import {
  Award, CheckCircle2, Clock, XCircle, TrendingUp, Download,
  AlertTriangle, Building2, Users, Target, BarChart3, ArrowUpRight,
  Shield, Sparkles, Calendar,
} from "lucide-react";
import { MOCK_CERT_RECORDS, MOCK_APPROVALS, MONTHLY_ISSUED, SUBSIDIARY_CERT_STATS } from "./cert-mock-data";
import { STATUS_CONFIG } from "./CertPreview";
import { useAuth } from "../AuthContext";

export function CertOverview({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const records = MOCK_CERT_RECORDS;
  const issued = records.filter(r => r.status === "issued").length;
  const pending = records.filter(r => r.status === "pending").length;
  const expired = records.filter(r => r.status === "expired").length;
  const revoked = records.filter(r => r.status === "revoked").length;
  const avgScore = Math.round(records.reduce((s, r) => s + r.score, 0) / (records.length || 1));
  const totalDownloads = records.reduce((s, r) => s + r.downloadCount, 0);
  const pendingApprovals = MOCK_APPROVALS.length;

  // Expiring soon (within 90 days)
  const now = new Date();
  const soon90 = new Date(now.getTime() + 90 * 86400000);
  const expiringSoon = records.filter(r => {
    const exp = new Date(r.expiryDate);
    return r.status === "issued" && exp > now && exp <= soon90;
  }).length;

  // Admin KPIs
  const adminKPIs = [
    { label: "Tổng chứng chỉ", value: records.length, icon: Award, color: "#990803", change: "+12" },
    { label: "Đã cấp", value: issued, icon: CheckCircle2, color: "#22c55e", change: "+8" },
    { label: "Chờ phê duyệt", value: pendingApprovals, icon: Clock, color: "#f59e0b", change: `${pendingApprovals}`, urgent: true },
    { label: "Sắp hết hạn", value: expiringSoon, icon: AlertTriangle, color: "#f97316", change: "90 ngày" },
    { label: "Đã hết hạn", value: expired, icon: XCircle, color: "#6b7280", change: "" },
    { label: "Thu hồi", value: revoked, icon: Shield, color: "#ef4444", change: "" },
    { label: "Điểm TB", value: `${avgScore}%`, icon: Target, color: "#c8a84e", change: "+2%" },
    { label: "Lượt tải", value: totalDownloads, icon: Download, color: "#3b82f6", change: "+24" },
  ];

  // Instructor KPIs - smaller set
  const instructorKPIs = [
    { label: "Chứng chỉ liên quan", value: 18, icon: Award, color: "#990803", change: "" },
    { label: "Chờ xác nhận", value: 4, icon: Clock, color: "#f59e0b", change: "", urgent: true },
    { label: "Tỷ lệ đạt CC", value: "82%", icon: TrendingUp, color: "#22c55e", change: "+3%" },
    { label: "Sắp hết hạn", value: 6, icon: AlertTriangle, color: "#f97316", change: "30 ngày" },
  ];

  const kpis = isAdmin ? adminKPIs : instructorKPIs;

  // Monthly chart data
  const maxMonthly = Math.max(...MONTHLY_ISSUED.map(m => m.count));
  const chartW = 520;
  const chartH = 180;
  const barW = 50;
  const gap = (chartW - barW * MONTHLY_ISSUED.length) / (MONTHLY_ISSUED.length + 1);

  // Subsidiary donut
  const total = SUBSIDIARY_CERT_STATS.reduce((s, x) => s + x.count, 0);
  const donutColors = ["#990803", "#c8a84e", "#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#6b7280"];

  let startAngle = 0;
  const donutPaths = SUBSIDIARY_CERT_STATS.map((item, i) => {
    const angle = (item.count / total) * 360;
    const endAngle = startAngle + angle;
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const r = 80;
    const ir = 50;
    const cx = 100;
    const cy = 100;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const x3 = cx + ir * Math.cos(endRad);
    const y3 = cy + ir * Math.sin(endRad);
    const x4 = cx + ir * Math.cos(startRad);
    const y4 = cy + ir * Math.sin(startRad);
    const large = angle > 180 ? 1 : 0;
    const path = `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${ir},${ir} 0 ${large} 0 ${x4},${y4} Z`;
    startAngle = endAngle;
    return { path, color: donutColors[i % donutColors.length], ...item };
  });

  // Top 5 courses with most certificates
  const topCourses = [
    { name: "An toàn Lao động trong XD & KK", count: 68, rate: 94 },
    { name: "Kỹ năng Lãnh đạo Quản lý CT", count: 52, rate: 88 },
    { name: "Phòng chống Rửa tiền (AML)", count: 48, rate: 91 },
    { name: "Quản trị Rủi ro & KSNB", count: 42, rate: 85 },
    { name: "Onboarding - Chào mừng TV mới", count: 38, rate: 97 },
  ];
  const maxCourse = Math.max(...topCourses.map(c => c.count));

  // Expiring alerts
  const expiringAlerts = [
    { group: "An toàn Lao động", count: 45, days: 30, subsidiary: "Khoáng sản Geleximco" },
    { group: "Phòng chống Rửa tiền", count: 28, days: 45, subsidiary: "ABBank" },
    { group: "ISO 9001:2015", count: 15, days: 60, subsidiary: "Xi măng Thăng Long" },
    { group: "Vận hành Nhà máy Điện", count: 8, days: 75, subsidiary: "Nhiệt điện Thăng Long" },
  ];

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className={`grid gap-3 ${isAdmin ? "grid-cols-2 lg:grid-cols-4 xl:grid-cols-8" : "grid-cols-2 lg:grid-cols-4"}`}>
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: `${kpi.color}12` }}>
                <kpi.icon className="w-4.5 h-4.5" style={{ color: kpi.color }} />
              </div>
              {(kpi as any).urgent && (
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75" style={{ background: kpi.color }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: kpi.color }} />
                </span>
              )}
            </div>
            <p className="text-foreground" style={{ fontSize: "22px", fontWeight: 800 }}>{kpi.value}</p>
            <p className="text-muted-foreground" style={{ fontSize: "11px" }}>{kpi.label}</p>
            {kpi.change && (
              <p className="mt-1" style={{ fontSize: "10px", color: kpi.color, fontWeight: 500 }}>{kpi.change}</p>
            )}
          </div>
        ))}
      </div>

      {/* Auto-issue info */}
      <div className="bg-gradient-to-r from-[#990803]/5 to-[#c8a84e]/5 rounded-xl border border-[#990803]/10 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#990803]/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#990803]" />
          </div>
          <div className="flex-1">
            <h3 className="text-[#990803]" style={{ fontSize: "13px", fontWeight: 700 }}>Hệ thống Chứng chỉ Tự động</h3>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "12px" }}>
              Tự động tạo chứng chỉ khi học viên đạt điều kiện. Hỗ trợ 4 mẫu phôi, QR xác thực, chữ ký số.
              {isAdmin && <> Hiện có <strong>{pendingApprovals} chứng chỉ</strong> chờ phê duyệt.</>}
            </p>
          </div>
          {isAdmin && pendingApprovals > 0 && (
            <button onClick={() => onTabChange("approvals")} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer shrink-0" style={{ fontSize: "12px", fontWeight: 600 }}>
              Duyệt ngay <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Issued Chart */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>Xu hướng cấp chứng chỉ</h3>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>6 tháng gần nhất</p>
            </div>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
          <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
              <g key={i}>
                <line x1="0" y1={chartH * (1 - pct)} x2={chartW} y2={chartH * (1 - pct)} stroke="#e5e7eb" strokeWidth="0.5" />
                <text x="0" y={chartH * (1 - pct) - 4} fill="#9ca3af" fontSize="9">{Math.round(maxMonthly * pct)}</text>
              </g>
            ))}
            {/* Bars */}
            {MONTHLY_ISSUED.map((item, i) => {
              const x = gap + i * (barW + gap);
              const barH = (item.count / maxMonthly) * (chartH - 10);
              return (
                <g key={i}>
                  <rect x={x} y={chartH - barH} width={barW} height={barH} rx="4" fill="#990803" opacity={0.8 + i * 0.03} />
                  <text x={x + barW / 2} y={chartH - barH - 6} textAnchor="middle" fill="#990803" fontSize="10" fontWeight="700">{item.count}</text>
                  <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fill="#6b7280" fontSize="9">{item.month}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Distribution by Subsidiary */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>Phân bổ theo Đơn vị</h3>
              <p className="text-muted-foreground" style={{ fontSize: "11px" }}>Tổng {total} chứng chỉ</p>
            </div>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-6">
            <svg viewBox="0 0 200 200" className="w-36 h-36 shrink-0">
              {donutPaths.map((d, i) => (
                <path key={i} d={d.path} fill={d.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
              ))}
              <text x="100" y="95" textAnchor="middle" fill="#374151" fontSize="22" fontWeight="800">{total}</text>
              <text x="100" y="112" textAnchor="middle" fill="#9ca3af" fontSize="9">chứng chỉ</text>
            </svg>
            <div className="flex-1 space-y-1.5">
              {donutPaths.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-muted-foreground flex-1 truncate" style={{ fontSize: "11px" }}>{d.short}</span>
                  <span className="text-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>{d.count}</span>
                  <span className="text-muted-foreground" style={{ fontSize: "10px" }}>({Math.round(d.count / total * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Courses */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>Top khóa đào tạo</h3>
            <span className="text-muted-foreground" style={{ fontSize: "11px" }}>Theo số chứng chỉ cấp</span>
          </div>
          <div className="space-y-3">
            {topCourses.map((course, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ fontSize: "10px", fontWeight: 700, background: i < 3 ? "#c8a84e20" : "#f3f4f6", color: i < 3 ? "#c8a84e" : "#9ca3af" }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 500 }}>{course.name}</p>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(course.count / maxCourse) * 100}%`, background: i === 0 ? "#990803" : i === 1 ? "#c8a84e" : "#94a3b8" }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 700 }}>{course.count}</p>
                  <p className="text-green-600" style={{ fontSize: "9px" }}>Đạt {course.rate}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring Alerts */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 700 }}>Cảnh báo sắp hết hạn</h3>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-600" style={{ fontSize: "10px", fontWeight: 600 }}>
                <AlertTriangle className="w-3 h-3" /> {expiringAlerts.reduce((s, a) => s + a.count, 0)} CC
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {expiringAlerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate" style={{ fontSize: "12px", fontWeight: 600 }}>{alert.group}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{alert.subsidiary} &bull; Còn {alert.days} ngày</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-orange-600" style={{ fontSize: "16px", fontWeight: 700 }}>{alert.count}</p>
                  <p className="text-muted-foreground" style={{ fontSize: "9px" }}>chứng chỉ</p>
                </div>
              </div>
            ))}
          </div>
          {isAdmin && (
            <button onClick={() => { import("sonner").then(m => m.toast.success("Đã gửi nhắc nhở gia hạn cho tất cả chứng chỉ sắp hết hạn!")); }} className="w-full mt-3 py-2 text-center text-[#990803] bg-[#990803]/5 rounded-lg hover:bg-[#990803]/10 transition-colors cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>
              Gửi nhắc nhở gia hạn hàng loạt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}