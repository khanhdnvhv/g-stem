import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react";
import {
  SUBSIDIARY_BUDGETS, MONTHLY_SPENDING, COST_BREAKDOWN, ROI_METRICS,
  TOTAL_ANNUAL_BUDGET, COST_CATEGORY_CONFIG,
  formatCurrency, getTotalSpent, getTotalCommitted, getRemaining,
  getPendingRequestCount, getPendingRequestTotal,
} from "./mock-data";

export function BudgetOverview() {
  const totalSpent = getTotalSpent();
  const totalCommitted = getTotalCommitted();
  const remaining = getRemaining();
  const spentPct = Math.round((totalSpent / TOTAL_ANNUAL_BUDGET) * 100);
  const committedPct = Math.round((totalCommitted / TOTAL_ANNUAL_BUDGET) * 100);
  const pendingCount = getPendingRequestCount();
  const pendingTotal = getPendingRequestTotal();

  return (
    <div className="space-y-4">
      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ROI_METRICS.map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400" style={{ fontSize: "11px" }}>{m.label}</span>
              <span className={`flex items-center gap-0.5 ${m.trend === "up" ? "text-green-500" : m.trend === "down" ? "text-green-500" : "text-gray-400"}`} style={{ fontSize: "10px", fontWeight: 600 }}>
                {m.trend === "up" ? <TrendingUp className="w-3 h-3" /> : m.trend === "down" ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                {m.trendValue}
              </span>
            </div>
            <p style={{ fontSize: "24px", fontWeight: 700, color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Budget gauge + Spending trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Donut gauge */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Tổng ngân sách 2026</h3>
          <BudgetDonut
            total={TOTAL_ANNUAL_BUDGET}
            spent={totalSpent}
            committed={totalCommitted}
            remaining={remaining}
          />
          <div className="space-y-2 mt-3">
            <BudgetLegendRow label="Đã chi" value={formatCurrency(totalSpent, true)} pct={spentPct} color="#990803" />
            <BudgetLegendRow label="Đã cam kết" value={formatCurrency(totalCommitted, true)} pct={committedPct} color="#c8a84e" />
            <BudgetLegendRow label="Còn lại" value={formatCurrency(remaining, true)} pct={100 - spentPct - committedPct} color="#e5e7eb" />
          </div>
          {pendingCount > 0 && (
            <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-amber-700" style={{ fontSize: "11px" }}>
                {pendingCount} đề xuất chờ duyệt — {formatCurrency(pendingTotal, true)}
              </span>
            </div>
          )}
        </div>

        {/* Monthly trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Chi tiêu theo tháng (tỷ VNĐ)</h3>
          <MonthlyTrendChart data={MONTHLY_SPENDING} />
        </div>
      </div>

      {/* Cost breakdown + Top subsidiaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cost categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Cơ cấu Chi phí</h3>
          <CostBreakdownChart items={COST_BREAKDOWN} />
        </div>

        {/* Top spenders */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Chi tiêu theo Đơn vị</h3>
          <SubsidiarySpendChart />
        </div>
      </div>
    </div>
  );
}

// ─── Custom SVG Charts ───

function BudgetDonut({ total, spent, committed, remaining }: { total: number; spent: number; committed: number; remaining: number }) {
  const cx = 100, cy = 100, r = 70, sw = 20;
  const circumference = 2 * Math.PI * r;
  const spentArc = (spent / total) * circumference;
  const committedArc = (committed / total) * circumference;
  const remainArc = circumference - spentArc - committedArc;

  return (
    <svg width="100%" height="200" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
      {/* Background */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth={sw} />
      {/* Remaining */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={sw}
        strokeDasharray={`${remainArc} ${circumference}`}
        strokeDashoffset={0}
        transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap="round"
      />
      {/* Committed */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#c8a84e" strokeWidth={sw}
        strokeDasharray={`${committedArc} ${circumference}`}
        strokeDashoffset={-remainArc}
        transform={`rotate(-90 ${cx} ${cy})`}
        opacity="0.8"
      />
      {/* Spent */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#990803" strokeWidth={sw}
        strokeDasharray={`${spentArc} ${circumference}`}
        strokeDashoffset={-(remainArc + committedArc)}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {/* Center text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#374151" style={{ fontSize: "22px", fontWeight: 700 }}>
        {formatCurrency(total, true)}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "10px" }}>
        Tổng ngân sách
      </text>
    </svg>
  );
}

function BudgetLegendRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
      <span className="text-gray-500 flex-1" style={{ fontSize: "12px" }}>{label}</span>
      <span className="text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{value}</span>
      <span className="text-gray-400" style={{ fontSize: "10px" }}>({pct}%)</span>
    </div>
  );
}

function MonthlyTrendChart({ data }: { data: typeof MONTHLY_SPENDING }) {
  const W = 560, H = 180, padL = 40, padR = 10, padT = 10, padB = 30;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxVal = Math.max(...data.map(d => Math.max(d.planned, d.actual || 0)));
  const step = chartW / (data.length - 1);

  const toX = (i: number) => padL + i * step;
  const toY = (v: number) => padT + chartH - (v / maxVal) * chartH;

  const plannedPath = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.planned)}`).join(" ");
  const actualData = data.filter(d => d.actual > 0);
  const actualPath = actualData.map((d, i) => `${i === 0 ? "M" : "L"}${toX(data.indexOf(d))},${toY(d.actual)}`).join(" ");

  // Grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => maxVal * pct);

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Grid */}
      {gridLines.map(v => (
        <g key={v}>
          <line x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)} stroke="#f0f0f0" strokeWidth="0.5" />
          <text x={padL - 4} y={toY(v) + 3} textAnchor="end" fill="#9ca3af" style={{ fontSize: "9px" }}>
            {(v / 1_000_000_000).toFixed(1)}
          </text>
        </g>
      ))}

      {/* Area fill for planned */}
      <path d={`${plannedPath} L${toX(data.length - 1)},${padT + chartH} L${padL},${padT + chartH} Z`} fill="#2563eb" opacity="0.05" />

      {/* Planned line */}
      <path d={plannedPath} fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="6 3" opacity="0.5" />

      {/* Actual line */}
      {actualPath && (
        <>
          <path
            d={`${actualPath} L${toX(data.indexOf(actualData[actualData.length - 1]))},${padT + chartH} L${padL},${padT + chartH} Z`}
            fill="#990803" opacity="0.08"
          />
          <path d={actualPath} fill="none" stroke="#990803" strokeWidth="2.5" strokeLinecap="round" />
          {/* Dots */}
          {actualData.map((d, i) => (
            <circle key={i} cx={toX(data.indexOf(d))} cy={toY(d.actual)} r="3.5" fill="#990803" stroke="white" strokeWidth="2" />
          ))}
        </>
      )}

      {/* X labels */}
      {data.map((d, i) => (
        <text key={i} x={toX(i)} y={H - 8} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "10px" }}>
          {d.month}
        </text>
      ))}

      {/* Legend */}
      <line x1={W - 150} y1={8} x2={W - 130} y2={8} stroke="#2563eb" strokeWidth="2" strokeDasharray="4 2" />
      <text x={W - 126} y={11} fill="#6b7280" style={{ fontSize: "9px" }}>Kế hoạch</text>
      <line x1={W - 80} y1={8} x2={W - 60} y2={8} stroke="#990803" strokeWidth="2.5" />
      <text x={W - 56} y={11} fill="#6b7280" style={{ fontSize: "9px" }}>Thực tế</text>
    </svg>
  );
}

function CostBreakdownChart({ items }: { items: typeof COST_BREAKDOWN }) {
  const maxAmt = Math.max(...items.map(i => i.amount));

  return (
    <div className="space-y-2.5">
      {items.map(item => {
        const cfg = COST_CATEGORY_CONFIG[item.category];
        return (
          <div key={item.id}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="flex items-center gap-1.5">
                <span style={{ fontSize: "12px" }}>{cfg?.icon}</span>
                <span className="text-gray-600" style={{ fontSize: "12px" }}>{item.label}</span>
              </span>
              <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>
                {formatCurrency(item.amount, true)} ({item.percentage}%)
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(item.amount / maxAmt) * 100}%`, backgroundColor: cfg?.color || "#64748b" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SubsidiarySpendChart() {
  const sorted = [...SUBSIDIARY_BUDGETS].sort((a, b) => b.spent - a.spent).slice(0, 8);
  const maxSpent = Math.max(...sorted.map(s => s.allocated));
  const W = 280, barH = 22, gap = 6;
  const H = sorted.length * (barH + gap) + 10;
  const labelW = 85;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {sorted.map((s, i) => {
        const y = i * (barH + gap) + 5;
        const barW = ((W - labelW - 55) * s.allocated) / maxSpent;
        const spentW = ((W - labelW - 55) * s.spent) / maxSpent;
        const pct = Math.round((s.spent / s.allocated) * 100);
        return (
          <g key={s.id}>
            <text x="0" y={y + 14} fill="#6b7280" style={{ fontSize: "10px" }}>{s.shortName}</text>
            {/* Allocated bar (background) */}
            <rect x={labelW} y={y + 2} width={barW} height={barH - 4} rx="3" fill="#f0f0f0" />
            {/* Spent bar */}
            <rect x={labelW} y={y + 2} width={spentW} height={barH - 4} rx="3" fill={s.color} opacity="0.75" />
            {/* Percentage */}
            <text x={labelW + barW + 5} y={y + 14} fill={pct > 80 ? "#dc2626" : "#374151"} style={{ fontSize: "10px", fontWeight: 600 }}>
              {pct}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
