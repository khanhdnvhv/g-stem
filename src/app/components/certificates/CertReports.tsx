import { useState, useMemo } from "react";
import {
  BarChart3, Download, Calendar, Filter, TrendingUp, TrendingDown,
  Building2, BookOpen, Award, Users, CheckCircle2, Clock,
  XCircle, RefreshCw, FileText, ArrowUpRight, Printer,
} from "lucide-react";
import { MOCK_CERT_RECORDS, SUBSIDIARY_CERT_STATS } from "./cert-mock-data";
import { CATEGORIES } from "../mock-data";

// ── Monthly data ──
const MONTHLY_DATA = [
  { month: "T08/25", issued: 35, expired: 5, revoked: 1, renewed: 3 },
  { month: "T09/25", issued: 42, expired: 8, revoked: 2, renewed: 5 },
  { month: "T10/25", issued: 48, expired: 6, revoked: 0, renewed: 4 },
  { month: "T11/25", issued: 58, expired: 12, revoked: 1, renewed: 8 },
  { month: "T12/25", issued: 67, expired: 10, revoked: 3, renewed: 6 },
  { month: "T01/26", issued: 89, expired: 15, revoked: 2, renewed: 12 },
  { month: "T02/26", issued: 75, expired: 8, revoked: 1, renewed: 9 },
  { month: "T03/26", issued: 34, expired: 4, revoked: 0, renewed: 3 },
];

// ── Category breakdown ──
const CATEGORY_STATS = [
  { name: "An toàn Lao động & Xây dựng", issued: 124, rate: 86, color: "#ef4444" },
  { name: "Kỹ năng Lãnh đạo & Quản trị", issued: 98, rate: 79, color: "#990803" },
  { name: "Tài chính & Kế toán", issued: 87, rate: 88, color: "#3b82f6" },
  { name: "CNTT & Chuyển đổi số", issued: 76, rate: 82, color: "#8b5cf6" },
  { name: "Ngân hàng & Tín dụng", issued: 68, rate: 91, color: "#22c55e" },
  { name: "Quản lý Chất lượng (ISO)", issued: 52, rate: 75, color: "#f59e0b" },
  { name: "Onboarding & Văn hóa", issued: 89, rate: 95, color: "#c8a84e" },
  { name: "Khác", issued: 48, rate: 80, color: "#6b7280" },
];

type DateRange = "3m" | "6m" | "12m" | "all";

export function CertReports() {
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [activeSection, setActiveSection] = useState<"overview" | "subsidiary" | "category">("overview");

  // Summary stats
  const summary = useMemo(() => {
    const total = MONTHLY_DATA.reduce((s, d) => s + d.issued, 0);
    const expired = MONTHLY_DATA.reduce((s, d) => s + d.expired, 0);
    const revoked = MONTHLY_DATA.reduce((s, d) => s + d.revoked, 0);
    const renewed = MONTHLY_DATA.reduce((s, d) => s + d.renewed, 0);
    const active = total - expired - revoked + renewed;
    const lastMonth = MONTHLY_DATA[MONTHLY_DATA.length - 1];
    const prevMonth = MONTHLY_DATA[MONTHLY_DATA.length - 2];
    const growth = prevMonth.issued ? Math.round(((lastMonth.issued - prevMonth.issued) / prevMonth.issued) * 100) : 0;
    return { total, expired, revoked, renewed, active, growth, lastMonthIssued: lastMonth.issued };
  }, []);

  const maxIssued = Math.max(...MONTHLY_DATA.map(d => d.issued));
  const chartW = 680;
  const chartH = 200;

  // Subsidiary chart max
  const maxSubCount = Math.max(...SUBSIDIARY_CERT_STATS.map(s => s.count));

  return (
    <div className="space-y-5">
      {/* Header with export */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-foreground" style={{ fontSize: "16px", fontWeight: 700 }}>Báo cáo Chứng chỉ</h3>
          <p className="text-muted-foreground" style={{ fontSize: "12px" }}>Phân tích toàn diện tình hình cấp phát, hiệu lực và gia hạn chứng chỉ Tập đoàn</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-secondary rounded-lg p-0.5">
            {([
              { value: "3m" as const, label: "3 tháng" },
              { value: "6m" as const, label: "6 tháng" },
              { value: "12m" as const, label: "12 tháng" },
              { value: "all" as const, label: "Tất cả" },
            ]).map(opt => (
              <button
                key={opt.value}
                onClick={() => setDateRange(opt.value)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${dateRange === opt.value ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                style={{ fontSize: "11px", fontWeight: dateRange === opt.value ? 600 : 400 }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất báo cáo Excel...")); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "12px" }}>
            <Download className="w-3.5 h-3.5" /> Excel
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất báo cáo PDF...")); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#990803] text-white rounded-lg hover:bg-[#990803]/90 transition-colors cursor-pointer" style={{ fontSize: "12px", fontWeight: 600 }}>
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {[
          { label: "Tổng đã cấp", value: summary.total, icon: Award, color: "#990803", suffix: "" },
          { label: "Đang hiệu lực", value: summary.active, icon: CheckCircle2, color: "#22c55e", suffix: "" },
          { label: "Đã hết hạn", value: summary.expired, icon: Clock, color: "#6b7280", suffix: "" },
          { label: "Thu hồi", value: summary.revoked, icon: XCircle, color: "#ef4444", suffix: "" },
          { label: "Gia hạn", value: summary.renewed, icon: RefreshCw, color: "#3b82f6", suffix: "" },
          { label: "Tăng trưởng", value: summary.growth, icon: summary.growth >= 0 ? TrendingUp : TrendingDown, color: summary.growth >= 0 ? "#22c55e" : "#ef4444", suffix: "%" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card rounded-xl border border-border p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${kpi.color}10` }}>
                <kpi.icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
              </div>
            </div>
            <p className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>
              {kpi.value}{kpi.suffix}
            </p>
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-secondary/30 rounded-xl p-1 border border-border">
        {([
          { id: "overview" as const, label: "Tổng quan xu hướng", icon: TrendingUp },
          { id: "subsidiary" as const, label: "Theo đơn vị", icon: Building2 },
          { id: "category" as const, label: "Theo danh mục", icon: BookOpen },
        ]).map(sec => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all cursor-pointer ${activeSection === sec.id ? "bg-card shadow-sm text-foreground border border-border" : "text-muted-foreground hover:text-foreground border border-transparent"}`}
            style={{ fontSize: "12px", fontWeight: activeSection === sec.id ? 600 : 400 }}
          >
            <sec.icon className="w-3.5 h-3.5" style={activeSection === sec.id ? { color: "#990803" } : {}} />
            {sec.label}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === "overview" && (
        <div className="space-y-5">
          {/* Trend Chart */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Xu hướng cấp / hết hạn / thu hồi / gia hạn</h4>
            <svg viewBox={`0 0 ${chartW} ${chartH + 50}`} className="w-full">
              {/* Grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                <g key={i}>
                  <line x1="40" y1={chartH * (1 - pct) + 5} x2={chartW} y2={chartH * (1 - pct) + 5} stroke="#e5e7eb" strokeWidth="0.5" />
                  <text x="0" y={chartH * (1 - pct) + 9} fill="#9ca3af" fontSize="9">{Math.round(maxIssued * pct)}</text>
                </g>
              ))}
              {/* Bars */}
              {MONTHLY_DATA.map((d, i) => {
                const barW = 18;
                const groupW = barW * 4 + 12;
                const gap = (chartW - 40 - groupW * MONTHLY_DATA.length) / (MONTHLY_DATA.length + 1);
                const x = 40 + gap + i * (groupW + gap);
                const hI = (d.issued / maxIssued) * (chartH - 15);
                const hE = (d.expired / maxIssued) * (chartH - 15);
                const hR = (d.revoked / maxIssued) * (chartH - 15);
                const hN = (d.renewed / maxIssued) * (chartH - 15);
                return (
                  <g key={i}>
                    <rect x={x} y={chartH + 5 - hI} width={barW} height={hI} rx="3" fill="#22c55e" opacity="0.85" />
                    <rect x={x + barW + 4} y={chartH + 5 - hE} width={barW} height={hE} rx="3" fill="#f59e0b" opacity="0.85" />
                    <rect x={x + (barW + 4) * 2} y={chartH + 5 - Math.max(hR, 2)} width={barW} height={Math.max(hR, 2)} rx="3" fill="#ef4444" opacity="0.85" />
                    <rect x={x + (barW + 4) * 3} y={chartH + 5 - hN} width={barW} height={hN} rx="3" fill="#3b82f6" opacity="0.85" />
                    {/* Value label on issued bar */}
                    <text x={x + barW / 2} y={chartH - hI - 2} textAnchor="middle" fill="#22c55e" fontSize="8" fontWeight="600">{d.issued}</text>
                    <text x={x + groupW / 2} y={chartH + 22} textAnchor="middle" fill="#6b7280" fontSize="8">{d.month}</text>
                  </g>
                );
              })}
            </svg>
            <div className="flex items-center justify-center gap-6 mt-3">
              {[
                { color: "#22c55e", label: "Đã cấp" },
                { color: "#f59e0b", label: "Hết hạn" },
                { color: "#ef4444", label: "Thu hồi" },
                { color: "#3b82f6", label: "Gia hạn" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: l.color }} />
                  <span className="text-muted-foreground" style={{ fontSize: "11px" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cumulative line chart */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Tổng tích lũy chứng chỉ đã cấp</h4>
            <svg viewBox="0 0 680 180" className="w-full">
              {/* Grid */}
              {[0, 150, 300, 450].map(v => (
                <g key={v}>
                  <line x1="35" y1={160 - (v / 450) * 140} x2="670" y2={160 - (v / 450) * 140} stroke="#e5e7eb" strokeWidth="0.5" />
                  <text x="0" y={164 - (v / 450) * 140} fill="#9ca3af" fontSize="9">{v}</text>
                </g>
              ))}
              {/* Area + line */}
              {(() => {
                let cum = 0;
                const points = MONTHLY_DATA.map((d, i) => {
                  cum += d.issued;
                  const x = 35 + (i / (MONTHLY_DATA.length - 1)) * 635;
                  const y = 160 - (cum / 500) * 140;
                  return { x, y, cum, month: d.month };
                });
                const areaPath = `M${points[0].x},160 ` + points.map(p => `L${p.x},${p.y}`).join(" ") + ` L${points[points.length - 1].x},160 Z`;
                const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
                return (
                  <>
                    <defs>
                      <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#990803" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#990803" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#cumGrad)" />
                    <path d={linePath} fill="none" stroke="#990803" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#990803" strokeWidth="2" />
                        <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#990803" fontSize="9" fontWeight="600">{p.cum}</text>
                        <text x={p.x} y="175" textAnchor="middle" fill="#9ca3af" fontSize="8">{p.month}</text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>

          {/* Data table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h4 className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>Chi tiết theo tháng</h4>
              <button onClick={() => { import("sonner").then(m => m.toast.info("Đang in báo cáo...")); }} className="flex items-center gap-1 px-2.5 py-1 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors cursor-pointer" style={{ fontSize: "10px" }}>
                <Printer className="w-3 h-3" /> In báo cáo
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Tháng</th>
                  <th className="text-right px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Đã cấp</th>
                  <th className="text-right px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Hết hạn</th>
                  <th className="text-right px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Thu hồi</th>
                  <th className="text-right px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Gia hạn</th>
                  <th className="text-right px-4 py-2.5 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 500 }}>Tích lũy</th>
                </tr>
              </thead>
              <tbody>
                {MONTHLY_DATA.map((d, i) => {
                  const cumulative = MONTHLY_DATA.slice(0, i + 1).reduce((s, x) => s + x.issued, 0);
                  return (
                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-2.5 text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{d.month}</td>
                      <td className="px-4 py-2.5 text-right text-green-600" style={{ fontSize: "12px", fontWeight: 600 }}>{d.issued}</td>
                      <td className="px-4 py-2.5 text-right text-amber-600" style={{ fontSize: "12px" }}>{d.expired}</td>
                      <td className="px-4 py-2.5 text-right text-red-500" style={{ fontSize: "12px" }}>{d.revoked}</td>
                      <td className="px-4 py-2.5 text-right text-blue-600" style={{ fontSize: "12px" }}>{d.renewed}</td>
                      <td className="px-4 py-2.5 text-right text-foreground" style={{ fontSize: "12px", fontWeight: 600 }}>{cumulative}</td>
                    </tr>
                  );
                })}
                {/* Total row */}
                <tr className="bg-secondary/30">
                  <td className="px-4 py-2.5 text-foreground" style={{ fontSize: "12px", fontWeight: 700 }}>Tổng</td>
                  <td className="px-4 py-2.5 text-right text-green-700" style={{ fontSize: "12px", fontWeight: 700 }}>{summary.total}</td>
                  <td className="px-4 py-2.5 text-right text-amber-700" style={{ fontSize: "12px", fontWeight: 700 }}>{summary.expired}</td>
                  <td className="px-4 py-2.5 text-right text-red-700" style={{ fontSize: "12px", fontWeight: 700 }}>{summary.revoked}</td>
                  <td className="px-4 py-2.5 text-right text-blue-700" style={{ fontSize: "12px", fontWeight: 700 }}>{summary.renewed}</td>
                  <td className="px-4 py-2.5 text-right text-foreground" style={{ fontSize: "12px", fontWeight: 700 }}>{summary.total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subsidiary Section */}
      {activeSection === "subsidiary" && (
        <div className="space-y-5">
          {/* Horizontal bar chart */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Số lượng chứng chỉ theo đơn vị thành viên</h4>
            <div className="space-y-3">
              {SUBSIDIARY_CERT_STATS.map((sub, i) => {
                const pct = Math.round((sub.count / maxSubCount) * 100);
                const colors = ["#990803", "#c8a84e", "#3b82f6", "#22c55e", "#8b5cf6", "#f59e0b", "#ef4444", "#6b7280"];
                const color = colors[i % colors.length];
                return (
                  <div key={sub.short} className="flex items-center gap-3">
                    <div className="w-28 shrink-0 text-right">
                      <span className="text-foreground" style={{ fontSize: "12px", fontWeight: 500 }}>{sub.short}</span>
                    </div>
                    <div className="flex-1 h-7 bg-gray-50 rounded-lg overflow-hidden relative">
                      <div className="h-full rounded-lg transition-all flex items-center px-2" style={{ width: `${pct}%`, background: `${color}20` }}>
                        <div className="h-full rounded-lg" style={{ width: "100%", background: color, opacity: 0.8 }} />
                      </div>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground" style={{ fontSize: "11px", fontWeight: 700 }}>{sub.count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subsidiary donut */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>Tỉ lệ phân bổ chứng chỉ</h4>
            <div className="flex items-center gap-8 flex-wrap">
              <svg viewBox="0 0 160 160" className="w-40 h-40 shrink-0">
                {(() => {
                  const total = SUBSIDIARY_CERT_STATS.reduce((s, d) => s + d.count, 0);
                  const colors = ["#990803", "#c8a84e", "#3b82f6", "#22c55e", "#8b5cf6", "#f59e0b", "#ef4444", "#6b7280"];
                  let cumAngle = -90;
                  return SUBSIDIARY_CERT_STATS.map((d, i) => {
                    const angle = (d.count / total) * 360;
                    const startRad = (cumAngle * Math.PI) / 180;
                    const endRad = ((cumAngle + angle) * Math.PI) / 180;
                    const largeArc = angle > 180 ? 1 : 0;
                    const r1 = 65, r2 = 38;
                    const x1 = 80 + r1 * Math.cos(startRad), y1 = 80 + r1 * Math.sin(startRad);
                    const x2 = 80 + r1 * Math.cos(endRad), y2 = 80 + r1 * Math.sin(endRad);
                    const ix1 = 80 + r2 * Math.cos(endRad), iy1 = 80 + r2 * Math.sin(endRad);
                    const ix2 = 80 + r2 * Math.cos(startRad), iy2 = 80 + r2 * Math.sin(startRad);
                    cumAngle += angle;
                    return (
                      <path key={i}
                        d={`M${x1},${y1} A${r1},${r1} 0 ${largeArc},1 ${x2},${y2} L${ix1},${iy1} A${r2},${r2} 0 ${largeArc},0 ${ix2},${iy2} Z`}
                        fill={colors[i % colors.length]} opacity="0.85"
                      />
                    );
                  });
                })()}
                <text x="80" y="77" textAnchor="middle" fill="#374151" fontSize="18" fontWeight="700">
                  {SUBSIDIARY_CERT_STATS.reduce((s, d) => s + d.count, 0)}
                </text>
                <text x="80" y="92" textAnchor="middle" fill="#9ca3af" fontSize="9">Tổng CC</text>
              </svg>
              <div className="flex-1 grid grid-cols-2 gap-2 min-w-[200px]">
                {SUBSIDIARY_CERT_STATS.map((sub, i) => {
                  const colors = ["#990803", "#c8a84e", "#3b82f6", "#22c55e", "#8b5cf6", "#f59e0b", "#ef4444", "#6b7280"];
                  const total = SUBSIDIARY_CERT_STATS.reduce((s, d) => s + d.count, 0);
                  return (
                    <div key={sub.short} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ background: colors[i % colors.length] }} />
                      <div className="min-w-0">
                        <p className="text-foreground truncate" style={{ fontSize: "11px", fontWeight: 500 }}>{sub.short}</p>
                        <p className="text-muted-foreground" style={{ fontSize: "9px" }}>{sub.count} ({Math.round((sub.count / total) * 100)}%)</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Section */}
      {activeSection === "category" && (
        <div className="space-y-5">
          {/* Category cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CATEGORY_STATS.map((cat, i) => (
              <div key={cat.name} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cat.color}15` }}>
                    <BookOpen className="w-5 h-5" style={{ color: cat.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 600 }}>{cat.name}</h5>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                        <strong className="text-foreground">{cat.issued}</strong> chứng chỉ đã cấp
                      </span>
                      <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
                        Tỉ lệ đạt: <strong style={{ color: cat.color }}>{cat.rate}%</strong>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${cat.rate}%`, background: cat.color, opacity: 0.8 }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p style={{ fontSize: "20px", fontWeight: 700, color: cat.color }}>{cat.rate}%</p>
                    <p className="text-muted-foreground" style={{ fontSize: "9px" }}>Tỉ lệ đạt</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Category bar chart comparison */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="text-foreground mb-4" style={{ fontSize: "14px", fontWeight: 600 }}>So sánh số lượng cấp theo danh mục</h4>
            <svg viewBox="0 0 680 220" className="w-full">
              {/* Grid */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const maxCat = Math.max(...CATEGORY_STATS.map(c => c.issued));
                return (
                  <g key={i}>
                    <line x1="40" y1={190 * (1 - pct) + 5} x2={670} y2={190 * (1 - pct) + 5} stroke="#e5e7eb" strokeWidth="0.5" />
                    <text x="0" y={190 * (1 - pct) + 9} fill="#9ca3af" fontSize="9">{Math.round(maxCat * pct)}</text>
                  </g>
                );
              })}
              {/* Bars */}
              {CATEGORY_STATS.map((cat, i) => {
                const maxCat = Math.max(...CATEGORY_STATS.map(c => c.issued));
                const barW = 50;
                const gap = (630 - barW * CATEGORY_STATS.length) / (CATEGORY_STATS.length + 1);
                const x = 40 + gap + i * (barW + gap);
                const h = (cat.issued / maxCat) * 175;
                return (
                  <g key={i}>
                    <rect x={x} y={195 - h} width={barW} height={h} rx="4" fill={cat.color} opacity="0.8" />
                    <text x={x + barW / 2} y={195 - h - 5} textAnchor="middle" fill={cat.color} fontSize="9" fontWeight="700">{cat.issued}</text>
                    <text x={x + barW / 2} y="210" textAnchor="middle" fill="#6b7280" fontSize="7">
                      {cat.name.length > 10 ? cat.name.slice(0, 10) + ".." : cat.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}