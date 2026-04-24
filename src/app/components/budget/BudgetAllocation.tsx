import { useState, useMemo } from "react";
import {
  Search, ArrowUpDown, Building2, Users, BookOpen,
  AlertTriangle, CheckCircle, TrendingUp,
} from "lucide-react";
import {
  SUBSIDIARY_BUDGETS, TOTAL_ANNUAL_BUDGET,
  formatCurrency, type SubsidiaryBudget,
} from "./mock-data";

type SortKey = "name" | "allocated" | "spent" | "remaining" | "utilization" | "perEmployee";
type SortDir = "asc" | "desc";

export function BudgetAllocation() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("allocated");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = useMemo(() => {
    let data = SUBSIDIARY_BUDGETS.filter(s => {
      if (!search) return true;
      return s.subsidiaryName.toLowerCase().includes(search.toLowerCase()) ||
             s.shortName.toLowerCase().includes(search.toLowerCase());
    });

    data.sort((a, b) => {
      let va: number, vb: number;
      switch (sortKey) {
        case "name": return sortDir === "asc" ? a.subsidiaryName.localeCompare(b.subsidiaryName) : b.subsidiaryName.localeCompare(a.subsidiaryName);
        case "allocated": va = a.allocated; vb = b.allocated; break;
        case "spent": va = a.spent; vb = b.spent; break;
        case "remaining": va = a.allocated - a.spent - a.committed; vb = b.allocated - b.spent - b.committed; break;
        case "utilization": va = a.spent / a.allocated; vb = b.spent / b.allocated; break;
        case "perEmployee": va = a.spent / a.employeeCount; vb = b.spent / b.employeeCount; break;
        default: va = a.allocated; vb = b.allocated;
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });

    return data;
  }, [search, sortKey, sortDir]);

  // Summary stats
  const totalAllocated = SUBSIDIARY_BUDGETS.reduce((s, b) => s + b.allocated, 0);
  const totalSpent = SUBSIDIARY_BUDGETS.reduce((s, b) => s + b.spent, 0);
  const totalEmployees = SUBSIDIARY_BUDGETS.reduce((s, b) => s + b.employeeCount, 0);
  const avgPerEmployee = Math.round(totalSpent / totalEmployees);

  const SortHeader = ({ label, sk, w }: { label: string; sk: SortKey; w?: string }) => (
    <button
      onClick={() => toggleSort(sk)}
      className="flex items-center gap-0.5 cursor-pointer hover:text-gray-700 transition-colors"
      style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", width: w }}
    >
      {label}
      <ArrowUpDown className={`w-2.5 h-2.5 ${sortKey === sk ? "text-[#990803]" : "text-gray-300"}`} />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat icon={Building2} label="Đơn vị" value="14" color="#990803" />
        <MiniStat icon={Users} label="Tổng nhân sự" value={totalEmployees.toLocaleString()} color="#2563eb" />
        <MiniStat icon={TrendingUp} label="Chi phí/Nhân viên" value={formatCurrency(avgPerEmployee, true)} color="#c8a84e" />
        <MiniStat icon={BookOpen} label="Tổng khóa học" value={SUBSIDIARY_BUDGETS.reduce((s, b) => s + b.courseCount, 0).toString()} color="#16a34a" />
      </div>

      {/* Search + Allocation Comparison Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700" style={{ fontSize: "14px", fontWeight: 600 }}>So sánh Phân bổ vs Chi tiêu</h3>
          <div className="relative w-60">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm đơn vị..."
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#990803]/20"
              style={{ fontSize: "12px" }}
            />
          </div>
        </div>

        {/* Grouped bar chart SVG */}
        <AllocationComparisonChart data={sorted} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3"><SortHeader label="Đơn vị" sk="name" /></th>
                <th className="text-right px-3 py-3"><SortHeader label="Phân bổ" sk="allocated" /></th>
                <th className="text-right px-3 py-3"><SortHeader label="Đã chi" sk="spent" /></th>
                <th className="text-right px-3 py-3"><SortHeader label="Còn lại" sk="remaining" /></th>
                <th className="text-center px-3 py-3"><SortHeader label="Sử dụng" sk="utilization" /></th>
                <th className="text-right px-3 py-3"><SortHeader label="Chi/NV" sk="perEmployee" /></th>
                <th className="text-center px-3 py-3 text-gray-400" style={{ fontSize: "10px", fontWeight: 600 }}>NHÂN SỰ</th>
                <th className="text-center px-3 py-3 text-gray-400" style={{ fontSize: "10px", fontWeight: 600 }}>KHÓA HỌC</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(sub => {
                const remaining = sub.allocated - sub.spent - sub.committed;
                const utilization = Math.round((sub.spent / sub.allocated) * 100);
                const perEmployee = Math.round(sub.spent / sub.employeeCount);
                const isSelected = selectedId === sub.id;
                const isOverBudget = (sub.spent + sub.committed) > sub.allocated;

                return (
                  <tr
                    key={sub.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${isSelected ? "bg-[#990803]/5" : ""}`}
                    onClick={() => setSelectedId(isSelected ? null : sub.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                        <div>
                          <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: 500 }}>{sub.shortName}</p>
                          <p className="text-gray-300 hidden lg:block" style={{ fontSize: "10px" }}>{sub.subsidiaryName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right px-3 py-3 text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>
                      {formatCurrency(sub.allocated, true)}
                    </td>
                    <td className="text-right px-3 py-3 text-gray-600" style={{ fontSize: "12px" }}>
                      {formatCurrency(sub.spent, true)}
                    </td>
                    <td className="text-right px-3 py-3" style={{ fontSize: "12px", fontWeight: 500, color: isOverBudget ? "#dc2626" : remaining < 200_000_000 ? "#f59e0b" : "#16a34a" }}>
                      {isOverBudget && <AlertTriangle className="w-3 h-3 inline mr-0.5" />}
                      {formatCurrency(remaining, true)}
                    </td>
                    <td className="text-center px-3 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-14 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(utilization, 100)}%`,
                              backgroundColor: utilization > 90 ? "#dc2626" : utilization > 70 ? "#f59e0b" : "#16a34a",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: utilization > 90 ? "#dc2626" : "#374151" }}>
                          {utilization}%
                        </span>
                      </div>
                    </td>
                    <td className="text-right px-3 py-3 text-gray-600" style={{ fontSize: "12px" }}>
                      {formatCurrency(perEmployee, true)}
                    </td>
                    <td className="text-center px-3 py-3 text-gray-500" style={{ fontSize: "12px" }}>
                      {sub.employeeCount.toLocaleString()}
                    </td>
                    <td className="text-center px-3 py-3 text-gray-500" style={{ fontSize: "12px" }}>
                      {sub.courseCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-300">
                <td className="px-4 py-3 text-gray-700" style={{ fontSize: "13px", fontWeight: 700 }}>TỔNG</td>
                <td className="text-right px-3 py-3 text-gray-800" style={{ fontSize: "12px", fontWeight: 700 }}>{formatCurrency(totalAllocated, true)}</td>
                <td className="text-right px-3 py-3 text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{formatCurrency(totalSpent, true)}</td>
                <td className="text-right px-3 py-3 text-green-600" style={{ fontSize: "12px", fontWeight: 600 }}>{formatCurrency(totalAllocated - totalSpent, true)}</td>
                <td className="text-center px-3 py-3 text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{Math.round((totalSpent / totalAllocated) * 100)}%</td>
                <td className="text-right px-3 py-3 text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{formatCurrency(avgPerEmployee, true)}</td>
                <td className="text-center px-3 py-3 text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{totalEmployees.toLocaleString()}</td>
                <td className="text-center px-3 py-3 text-gray-700" style={{ fontSize: "12px", fontWeight: 600 }}>{SUBSIDIARY_BUDGETS.reduce((s, b) => s + b.courseCount, 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───

function MiniStat({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "12" }}>
        <Icon className="w-4.5 h-4.5" style={{ color, width: "18px", height: "18px" }} />
      </div>
      <div>
        <p className="text-gray-800" style={{ fontSize: "18px", fontWeight: 700 }}>{value}</p>
        <p className="text-gray-400" style={{ fontSize: "10px" }}>{label}</p>
      </div>
    </div>
  );
}

function AllocationComparisonChart({ data }: { data: SubsidiaryBudget[] }) {
  const top = data.slice(0, 10);
  const maxVal = Math.max(...top.map(s => s.allocated));
  const W = 600, barH = 18, gap = 8;
  const H = top.length * (barH * 2 + gap + 8) + 20;
  const labelW = 90, barAreaW = W - labelW - 80;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      {top.map((s, i) => {
        const y = i * (barH * 2 + gap + 8) + 10;
        const allocW = (s.allocated / maxVal) * barAreaW;
        const spentW = (s.spent / maxVal) * barAreaW;
        const committedW = (s.committed / maxVal) * barAreaW;

        return (
          <g key={s.id}>
            <text x="0" y={y + 12} fill="#374151" style={{ fontSize: "11px", fontWeight: 500 }}>{s.shortName}</text>
            {/* Allocated bar */}
            <rect x={labelW} y={y} width={allocW} height={barH} rx="3" fill={s.color} opacity="0.15" />
            <rect x={labelW} y={y} width={spentW} height={barH} rx="3" fill={s.color} opacity="0.75" />
            <text x={labelW + allocW + 5} y={y + 12} fill="#6b7280" style={{ fontSize: "9px" }}>{formatCurrency(s.allocated, true)}</text>

            {/* Committed bar */}
            <rect x={labelW} y={y + barH + 2} width={committedW} height={barH - 6} rx="2" fill="#c8a84e" opacity="0.4" />
            <text x={labelW + committedW + 4} y={y + barH + 10} fill="#c8a84e" style={{ fontSize: "8px" }}>cam kết: {formatCurrency(s.committed, true)}</text>
          </g>
        );
      })}
    </svg>
  );
}
