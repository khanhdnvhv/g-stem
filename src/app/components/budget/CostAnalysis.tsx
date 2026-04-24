import {
  SUBSIDIARY_BUDGETS, COST_BREAKDOWN, COST_CATEGORY_CONFIG,
  TOTAL_ANNUAL_BUDGET, formatCurrency,
} from "./mock-data";

export function CostAnalysis() {
  const totalEmployees = SUBSIDIARY_BUDGETS.reduce((s, b) => s + b.employeeCount, 0);
  const totalSpent = SUBSIDIARY_BUDGETS.reduce((s, b) => s + b.spent, 0);
  const totalCourses = SUBSIDIARY_BUDGETS.reduce((s, b) => s + b.courseCount, 0);
  const avgPerEmployee = totalSpent / totalEmployees;
  const avgPerCourse = totalSpent / totalCourses;
  const budgetUtilization = (totalSpent / TOTAL_ANNUAL_BUDGET) * 100;

  // Per-employee cost by subsidiary
  const perEmployeeData = [...SUBSIDIARY_BUDGETS]
    .map(s => ({ ...s, perEmployee: s.spent / s.employeeCount }))
    .sort((a, b) => b.perEmployee - a.perEmployee);

  const maxPerEmp = Math.max(...perEmployeeData.map(d => d.perEmployee));

  // Efficiency metrics
  const efficiencyData = SUBSIDIARY_BUDGETS.map(s => ({
    ...s,
    utilization: (s.spent / s.allocated) * 100,
    costPerCourse: s.spent / Math.max(s.courseCount, 1),
  }));

  return (
    <div className="space-y-4">
      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Chi phí TB/Nhân viên", value: formatCurrency(Math.round(avgPerEmployee), true), sub: `${totalEmployees.toLocaleString()} nhân viên`, color: "#990803" },
          { label: "Chi phí TB/Khóa học", value: formatCurrency(Math.round(avgPerCourse), true), sub: `${totalCourses} khóa`, color: "#c8a84e" },
          { label: "Hiệu suất Sử dụng NS", value: `${budgetUtilization.toFixed(1)}%`, sub: `${formatCurrency(totalSpent, true)} / ${formatCurrency(TOTAL_ANNUAL_BUDGET, true)}`, color: "#2563eb" },
          { label: "ROI ước tính", value: "287%", sub: "Dựa trên tăng năng suất & giữ chân NV", color: "#16a34a" },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-gray-400 mb-1" style={{ fontSize: "11px" }}>{m.label}</p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: m.color }}>{m.value}</p>
            <p className="text-gray-300 mt-0.5" style={{ fontSize: "10px" }}>{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cost per employee chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>Chi phí / Nhân viên theo Đơn vị</h3>
          <p className="text-gray-400 mb-3" style={{ fontSize: "11px" }}>Đường đỏ = trung bình tập đoàn ({formatCurrency(Math.round(avgPerEmployee), true)})</p>
          <PerEmployeeChart data={perEmployeeData} max={maxPerEmp} avg={avgPerEmployee} />
        </div>

        {/* Cost structure donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Cơ cấu Chi phí (Donut)</h3>
          <CostDonut items={COST_BREAKDOWN} />
        </div>
      </div>

      {/* Efficiency Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 mb-1" style={{ fontSize: "14px", fontWeight: 600 }}>Ma trận Hiệu quả Đào tạo</h3>
        <p className="text-gray-400 mb-3" style={{ fontSize: "11px" }}>X: Tỷ lệ sử dụng ngân sách (%) — Y: Chi phí/Khóa học (triệu VNĐ) — Kích thước: Số nhân viên</p>
        <EfficiencyScatter data={efficiencyData} />
      </div>

      {/* ROI Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 mb-3" style={{ fontSize: "14px", fontWeight: 600 }}>Phân tích ROI Đào tạo</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { title: "Giảm Turnover", before: "18%", after: "12%", saving: "15.2 tỷ", desc: "Tiết kiệm chi phí tuyển dụng & onboarding", color: "#16a34a" },
            { title: "Tăng Năng suất", before: "72%", after: "89%", saving: "28.6 tỷ", desc: "Giá trị tăng năng suất lao động", color: "#2563eb" },
            { title: "Tăng Doanh thu", before: "100%", after: "112%", saving: "45.8 tỷ", desc: "Tác động đến doanh thu từ nâng cao năng lực", color: "#c8a84e" },
          ].map(roi => (
            <div key={roi.title} className="p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600 mb-2" style={{ fontSize: "13px", fontWeight: 600 }}>{roi.title}</p>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-center">
                  <p className="text-gray-400" style={{ fontSize: "9px" }}>Trước</p>
                  <p className="text-gray-500" style={{ fontSize: "18px", fontWeight: 700 }}>{roi.before}</p>
                </div>
                <div className="text-[#990803]" style={{ fontSize: "16px" }}>→</div>
                <div className="text-center">
                  <p className="text-gray-400" style={{ fontSize: "9px" }}>Sau</p>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: roi.color }}>{roi.after}</p>
                </div>
              </div>
              <div className="p-2 rounded-lg" style={{ backgroundColor: roi.color + "10" }}>
                <p style={{ fontSize: "16px", fontWeight: 700, color: roi.color }}>+{roi.saving}</p>
                <p className="text-gray-400" style={{ fontSize: "10px" }}>{roi.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center justify-between">
          <span className="text-green-700" style={{ fontSize: "14px", fontWeight: 600 }}>
            Tổng giá trị ROI ước tính
          </span>
          <span className="text-green-700" style={{ fontSize: "22px", fontWeight: 700 }}>
            89.6 tỷ VNĐ (287%)
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── SVG Charts ───

function PerEmployeeChart({ data, max, avg }: { data: (typeof SUBSIDIARY_BUDGETS[0] & { perEmployee: number })[]; max: number; avg: number }) {
  const W = 500, barH = 20, gap = 4;
  const H = data.length * (barH + gap) + 10;
  const labelW = 85, barAreaW = W - labelW - 60;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Average line */}
      {(() => {
        const x = labelW + (avg / max) * barAreaW;
        return (
          <g>
            <line x1={x} y1={0} x2={x} y2={H} stroke="#dc2626" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          </g>
        );
      })()}

      {data.map((d, i) => {
        const y = i * (barH + gap) + 5;
        const barW = (d.perEmployee / max) * barAreaW;
        const isAboveAvg = d.perEmployee > avg;
        return (
          <g key={d.id}>
            <text x="0" y={y + 13} fill="#6b7280" style={{ fontSize: "10px" }}>{d.shortName}</text>
            <rect x={labelW} y={y} width={barW} height={barH} rx="3" fill={d.color} opacity={isAboveAvg ? 0.85 : 0.5} />
            <text x={labelW + barW + 4} y={y + 13} fill="#374151" style={{ fontSize: "10px", fontWeight: 600 }}>
              {formatCurrency(Math.round(d.perEmployee), true)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CostDonut({ items }: { items: typeof COST_BREAKDOWN }) {
  const cx = 120, cy = 120, r = 80, sw = 30;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex flex-col items-center">
      <svg width="100%" height="240" viewBox="0 0 240 240" preserveAspectRatio="xMidYMid meet">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth={sw} />
        {items.map(item => {
          const cfg = COST_CATEGORY_CONFIG[item.category];
          const arc = (item.percentage / 100) * circumference;
          const el = (
            <circle
              key={item.id}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={cfg?.color || "#64748b"}
              strokeWidth={sw}
              strokeDasharray={`${arc} ${circumference - arc}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              opacity="0.8"
            />
          );
          offset += arc;
          return el;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#374151" style={{ fontSize: "16px", fontWeight: 700 }}>100%</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "9px" }}>Chi phí đào tạo</text>
      </svg>

      <div className="grid grid-cols-2 gap-2 mt-2 w-full">
        {items.map(item => {
          const cfg = COST_CATEGORY_CONFIG[item.category];
          return (
            <div key={item.id} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: cfg?.color }} />
              <span className="text-gray-500 truncate" style={{ fontSize: "10px" }}>{cfg?.icon} {item.label}</span>
              <span className="text-gray-400 ml-auto shrink-0" style={{ fontSize: "9px" }}>{item.percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EfficiencyScatter({ data }: { data: (typeof SUBSIDIARY_BUDGETS[0] & { utilization: number; costPerCourse: number })[] }) {
  const W = 560, H = 260, padL = 50, padR = 20, padT = 20, padB = 35;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxUtil = 100;
  const maxCost = Math.max(...data.map(d => d.costPerCourse));
  const maxEmp = Math.max(...data.map(d => d.employeeCount));

  const toX = (util: number) => padL + (util / maxUtil) * chartW;
  const toY = (cost: number) => padT + chartH - (cost / maxCost) * chartH;
  const toR = (emp: number) => 4 + (emp / maxEmp) * 12;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {/* Grid */}
      {[0, 25, 50, 75, 100].map(v => (
        <g key={`gx-${v}`}>
          <line x1={toX(v)} y1={padT} x2={toX(v)} y2={padT + chartH} stroke="#f0f0f0" strokeWidth="0.5" />
          <text x={toX(v)} y={H - 10} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "9px" }}>{v}%</text>
        </g>
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const v = maxCost * pct;
        return (
          <g key={`gy-${pct}`}>
            <line x1={padL} y1={toY(v)} x2={padL + chartW} y2={toY(v)} stroke="#f0f0f0" strokeWidth="0.5" />
            <text x={padL - 5} y={toY(v) + 3} textAnchor="end" fill="#9ca3af" style={{ fontSize: "9px" }}>
              {(v / 1_000_000).toFixed(0)}tr
            </text>
          </g>
        );
      })}

      {/* Quadrant labels */}
      <text x={padL + 10} y={padT + 12} fill="#dc2626" style={{ fontSize: "8px", opacity: 0.5 }}>Chi phí cao, Sử dụng thấp</text>
      <text x={padL + chartW - 5} y={padT + 12} textAnchor="end" fill="#f59e0b" style={{ fontSize: "8px", opacity: 0.5 }}>Chi phí cao, Sử dụng cao</text>
      <text x={padL + 10} y={padT + chartH - 5} fill="#64748b" style={{ fontSize: "8px", opacity: 0.5 }}>Chi phí thấp, Sử dụng thấp</text>
      <text x={padL + chartW - 5} y={padT + chartH - 5} textAnchor="end" fill="#16a34a" style={{ fontSize: "8px", opacity: 0.5 }}>Hiệu quả cao ✓</text>

      {/* Center lines */}
      <line x1={toX(50)} y1={padT} x2={toX(50)} y2={padT + chartH} stroke="#c8a84e" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.3" />
      <line x1={padL} y1={toY(maxCost * 0.5)} x2={padL + chartW} y2={toY(maxCost * 0.5)} stroke="#c8a84e" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.3" />

      {/* Data points */}
      {data.map(d => (
        <g key={d.id}>
          <circle
            cx={toX(d.utilization)}
            cy={toY(d.costPerCourse)}
            r={toR(d.employeeCount)}
            fill={d.color}
            opacity="0.6"
            stroke="white"
            strokeWidth="1.5"
          />
          <text
            x={toX(d.utilization)}
            y={toY(d.costPerCourse) - toR(d.employeeCount) - 3}
            textAnchor="middle"
            fill="#374151"
            style={{ fontSize: "8px", fontWeight: 500 }}
          >
            {d.shortName}
          </text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={padL + chartW / 2} y={H - 1} textAnchor="middle" fill="#6b7280" style={{ fontSize: "10px" }}>Tỷ lệ sử dụng NS (%)</text>
    </svg>
  );
}
