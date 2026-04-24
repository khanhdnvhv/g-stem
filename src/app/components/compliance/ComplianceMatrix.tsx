import { useState, useMemo } from "react";
import { AlertTriangle, Clock, ChevronDown, ChevronUp, ArrowUpDown, Shield, TrendingUp } from "lucide-react";
import {
  COMPLIANCE_PROGRAMS, PROGRAM_TYPE_CONFIG,
  getComplianceMatrix,
  type SubsidiaryCompliance,
} from "./mock-data";

interface ComplianceMatrixProps {
  onSelectProgram: (id: string) => void;
}

/* ──── Helpers ──── */
function getRateStyle(rate: number) {
  if (rate >= 90) return { bg: "#dcfce7", text: "#15803d", ringColor: "#22c55e", label: "Tốt" };
  if (rate >= 80) return { bg: "#d1fae5", text: "#047857", ringColor: "#34d399", label: "Khá" };
  if (rate >= 70) return { bg: "#fef9c3", text: "#a16207", ringColor: "#facc15", label: "TB" };
  if (rate >= 60) return { bg: "#ffedd5", text: "#c2410c", ringColor: "#fb923c", label: "Yếu" };
  if (rate >= 50) return { bg: "#fee2e2", text: "#b91c1c", ringColor: "#f87171", label: "Kém" };
  return { bg: "#fecaca", text: "#991b1b", ringColor: "#ef4444", label: "Rủi ro" };
}

function getMiniDonut(rate: number, size: number = 32) {
  const r = (size - 4) / 2;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashArray = `${(rate / 100) * circumference} ${circumference}`;
  const style = getRateStyle(rate);
  return { r, cx, cy, circumference, dashArray, style, size };
}

export function ComplianceMatrix({ onSelectProgram }: ComplianceMatrixProps) {
  const matrix = useMemo(() => getComplianceMatrix(), []);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "rate">("rate");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const programs = COMPLIANCE_PROGRAMS;

  const sortedMatrix = useMemo(() => {
    const sorted = [...matrix];
    if (sortBy === "rate") sorted.sort((a, b) => sortAsc ? a.overallRate - b.overallRate : b.overallRate - a.overallRate);
    else sorted.sort((a, b) => sortAsc ? a.shortName.localeCompare(b.shortName, "vi") : b.shortName.localeCompare(a.shortName, "vi"));
    return sorted;
  }, [matrix, sortBy, sortAsc]);

  /* Column averages */
  const colAverages = useMemo(() => {
    return programs.map(p => {
      const rates = matrix.map(sub => sub.programs.find(pr => pr.programId === p.id)?.rate).filter(Boolean) as number[];
      return { id: p.id, avg: rates.length > 0 ? Math.round(rates.reduce((s, r) => s + r, 0) / rates.length) : 0 };
    });
  }, [matrix, programs]);

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-gray-800 flex items-center gap-1.5" style={{ fontSize: "15px", fontWeight: 700 }}>
              <Shield className="w-4.5 h-4.5 text-[#990803]" />
              Ma trận Tuân thủ
            </h3>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: "11px" }}>
              {matrix.length} đơn vị × {programs.length} chương trình bắt buộc — Click ô để xem chi tiết
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-gray-400" style={{ fontSize: "10px" }}>Sắp xếp:</span>
              <button
                onClick={() => { if (sortBy === "rate") setSortAsc(!sortAsc); else { setSortBy("rate"); setSortAsc(false); } }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors ${sortBy === "rate" ? "bg-[#990803]/10 text-[#990803]" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                style={{ fontSize: "10px", fontWeight: 600 }}
              >
                <TrendingUp className="w-3 h-3" />Tỷ lệ {sortBy === "rate" && (sortAsc ? "↑" : "↓")}
              </button>
              <button
                onClick={() => { if (sortBy === "name") setSortAsc(!sortAsc); else { setSortBy("name"); setSortAsc(true); } }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors ${sortBy === "name" ? "bg-[#990803]/10 text-[#990803]" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                style={{ fontSize: "10px", fontWeight: 600 }}
              >
                <ArrowUpDown className="w-3 h-3" />Tên {sortBy === "name" && (sortAsc ? "↑" : "↓")}
              </button>
            </div>
          </div>
        </div>

        {/* Color legend */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-400" style={{ fontSize: "10px", fontWeight: 500 }}>Mức tuân thủ:</span>
          {[
            { label: "≥90% Tốt", bg: "#dcfce7", text: "#15803d" },
            { label: "80-89% Khá", bg: "#d1fae5", text: "#047857" },
            { label: "70-79% TB", bg: "#fef9c3", text: "#a16207" },
            { label: "60-69% Yếu", bg: "#ffedd5", text: "#c2410c" },
            { label: "<60% Rủi ro", bg: "#fecaca", text: "#991b1b" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className="w-5 h-3.5 rounded" style={{ backgroundColor: s.bg, border: `1px solid ${s.text}20` }} />
              <span style={{ fontSize: "9px", fontWeight: 600, color: s.text }}>{s.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 ml-2">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span className="text-red-400" style={{ fontSize: "9px" }}>= có NV quá hạn</span>
          </div>
        </div>
      </div>

      {/* Matrix table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
          <table className="w-full" style={{ minWidth: "900px" }}>
            {/* Column headers */}
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 px-3 py-3 text-left border-b border-r border-gray-200" style={{ minWidth: "140px" }}>
                  <span className="text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>ĐƠN VỊ</span>
                </th>
                {programs.map(p => {
                  const tCfg = PROGRAM_TYPE_CONFIG[p.type];
                  const colAvg = colAverages.find(c => c.id === p.id);
                  const avgStyle = colAvg ? getRateStyle(colAvg.avg) : null;
                  return (
                    <th key={p.id} className="px-1 py-2 border-b border-gray-200 text-center" style={{ minWidth: "72px", maxWidth: "80px" }}>
                      <button
                        onClick={() => onSelectProgram(p.id)}
                        className="w-full flex flex-col items-center gap-0.5 cursor-pointer group hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
                      >
                        <span style={{ fontSize: "13px" }} title={p.name}>{tCfg.icon}</span>
                        <span className="text-gray-600 group-hover:text-[#990803] transition-colors truncate block w-full" style={{ fontSize: "9px", fontWeight: 600 }}>
                          {p.shortName}
                        </span>
                        {avgStyle && (
                          <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "8px", fontWeight: 700, color: avgStyle.text, backgroundColor: avgStyle.bg }}>
                            TB {colAvg!.avg}%
                          </span>
                        )}
                      </button>
                    </th>
                  );
                })}
                <th className="px-3 py-3 border-b border-l border-gray-200 text-center bg-gray-50" style={{ minWidth: "70px" }}>
                  <span className="text-gray-500" style={{ fontSize: "10px", fontWeight: 600 }}>TỔNG</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedMatrix.map((sub, sIdx) => {
                const isExpanded = expandedRow === sub.subsidiaryId;
                const overallStyle = getRateStyle(sub.overallRate);
                const donut = getMiniDonut(sub.overallRate, 34);
                const totalOverdue = sub.programs.reduce((s, p) => s + p.overdue, 0);
                const totalExpiring = sub.programs.reduce((s, p) => s + p.expiring, 0);

                const mainRow = (
                    <tr key={`row-${sub.subsidiaryId}`} className={`transition-colors ${sIdx % 2 === 0 ? "bg-white" : "bg-gray-50/40"} hover:bg-blue-50/30`}>
                      {/* Sticky row label */}
                      <td className={`sticky left-0 z-10 px-3 py-2.5 border-r border-gray-100 ${sIdx % 2 === 0 ? "bg-white" : "bg-gray-50/80"}`}>
                        <button
                          onClick={() => setExpandedRow(isExpanded ? null : sub.subsidiaryId)}
                          className="flex items-center gap-1.5 cursor-pointer w-full text-left group"
                        >
                          {isExpanded
                            ? <ChevronUp className="w-3 h-3 text-gray-400 shrink-0" />
                            : <ChevronDown className="w-3 h-3 text-gray-300 group-hover:text-gray-500 shrink-0" />
                          }
                          <div className="min-w-0 flex-1">
                            <p className="text-gray-700 truncate group-hover:text-[#990803] transition-colors" style={{ fontSize: "11px", fontWeight: 600 }}>
                              {sub.shortName}
                            </p>
                            {totalOverdue > 0 && (
                              <div className="flex items-center gap-0.5 mt-0.5">
                                <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                                <span className="text-red-400" style={{ fontSize: "8px", fontWeight: 600 }}>{totalOverdue} quá hạn</span>
                              </div>
                            )}
                          </div>
                        </button>
                      </td>

                      {/* Data cells */}
                      {programs.map(p => {
                        const prog = sub.programs.find(pr => pr.programId === p.id);
                        if (!prog) {
                          return (
                            <td key={p.id} className="px-1 py-1.5 text-center">
                              <div className="mx-auto w-full max-w-[68px] h-[52px] rounded-lg bg-gray-50 flex items-center justify-center">
                                <span className="text-gray-300" style={{ fontSize: "9px" }}>N/A</span>
                              </div>
                            </td>
                          );
                        }

                        const cellStyle = getRateStyle(prog.rate);
                        const cellKey = `${sub.subsidiaryId}-${p.id}`;
                        const isHovered = hoveredCell === cellKey;

                        return (
                          <td key={p.id} className="px-1 py-1.5 text-center relative">
                            <button
                              className="mx-auto w-full max-w-[68px] rounded-lg p-1.5 cursor-pointer transition-all group/cell relative"
                              style={{
                                backgroundColor: cellStyle.bg,
                                border: `1.5px solid ${isHovered ? cellStyle.text : cellStyle.text + "20"}`,
                                boxShadow: isHovered ? `0 2px 8px ${cellStyle.text}25` : "none",
                                transform: isHovered ? "scale(1.05)" : "scale(1)",
                              }}
                              onMouseEnter={() => setHoveredCell(cellKey)}
                              onMouseLeave={() => setHoveredCell(null)}
                              onClick={() => onSelectProgram(p.id)}
                            >
                              {/* Rate */}
                              <p style={{ fontSize: "15px", fontWeight: 800, color: cellStyle.text, lineHeight: 1.1 }}>
                                {prog.rate}%
                              </p>

                              {/* Compliance count */}
                              <p className="mt-0.5" style={{ fontSize: "8px", fontWeight: 500, color: cellStyle.text, opacity: 0.7 }}>
                                {prog.compliant}/{prog.required}
                              </p>

                              {/* Overdue indicator */}
                              {prog.overdue > 0 && (
                                <div className="flex items-center justify-center gap-0.5 mt-0.5">
                                  <AlertTriangle className="w-2.5 h-2.5" style={{ color: "#dc2626" }} />
                                  <span style={{ fontSize: "7px", fontWeight: 700, color: "#dc2626" }}>{prog.overdue}</span>
                                </div>
                              )}

                              {/* Expiring badge */}
                              {prog.expiring > 0 && prog.overdue === 0 && (
                                <div className="flex items-center justify-center gap-0.5 mt-0.5">
                                  <Clock className="w-2.5 h-2.5" style={{ color: "#d97706" }} />
                                  <span style={{ fontSize: "7px", fontWeight: 600, color: "#d97706" }}>{prog.expiring}</span>
                                </div>
                              )}

                              {/* Hover tooltip */}
                              {isHovered && (
                                <div
                                  className="absolute z-30 bg-white rounded-xl shadow-xl border border-gray-200 p-3 text-left"
                                  style={{ bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", width: "200px", pointerEvents: "none" }}
                                  onClick={e => e.stopPropagation()}
                                >
                                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-gray-200 rotate-45" />
                                  <p className="text-gray-800 mb-1.5" style={{ fontSize: "11px", fontWeight: 700 }}>{sub.shortName}</p>
                                  <p className="text-gray-500 mb-2" style={{ fontSize: "10px" }}>{p.name}</p>

                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-500" style={{ fontSize: "9px" }}>Tỷ lệ tuân thủ</span>
                                      <span style={{ fontSize: "12px", fontWeight: 800, color: cellStyle.text }}>{prog.rate}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full rounded-full transition-all" style={{ width: `${prog.rate}%`, backgroundColor: cellStyle.ringColor }} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1.5 border-t border-gray-100">
                                      <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                        <span className="text-gray-500" style={{ fontSize: "8px" }}>Tuân thủ: <b className="text-gray-700">{prog.compliant}</b></span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                        <span className="text-gray-500" style={{ fontSize: "8px" }}>Yêu cầu: <b className="text-gray-700">{prog.required}</b></span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        <span className="text-gray-500" style={{ fontSize: "8px" }}>Sắp hạn: <b className="text-amber-600">{prog.expiring}</b></span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                        <span className="text-gray-500" style={{ fontSize: "8px" }}>Quá hạn: <b className="text-red-600">{prog.overdue}</b></span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </button>
                          </td>
                        );
                      })}

                      {/* Overall rate — donut chart */}
                      <td className="px-2 py-1.5 text-center border-l border-gray-100">
                        <div className="flex items-center justify-center gap-1.5">
                          <svg width={donut.size} height={donut.size} className="shrink-0" style={{ transform: "rotate(-90deg)" }}>
                            <circle cx={donut.cx} cy={donut.cy} r={donut.r} fill="none" stroke="#f0f0f0" strokeWidth="3" />
                            <circle cx={donut.cx} cy={donut.cy} r={donut.r} fill="none"
                              stroke={donut.style.ringColor} strokeWidth="3"
                              strokeDasharray={donut.dashArray} strokeLinecap="round"
                              className="transition-all"
                            />
                          </svg>
                          <div className="text-center" style={{ marginLeft: "-28px" }}>
                            <p style={{ fontSize: "12px", fontWeight: 800, color: overallStyle.text }}>{sub.overallRate}%</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                );

                const detailRow = isExpanded ? (
                      <tr key={`detail-${sub.subsidiaryId}`}>
                        <td colSpan={programs.length + 2} className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-white rounded-lg border border-gray-200 p-2.5">
                              <p className="text-gray-400" style={{ fontSize: "9px", fontWeight: 600 }}>Tổng NV được yêu cầu</p>
                              <p className="text-gray-800 mt-0.5" style={{ fontSize: "16px", fontWeight: 700 }}>
                                {sub.programs.reduce((s, p) => s + p.required, 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg border border-green-200 p-2.5">
                              <p className="text-green-600" style={{ fontSize: "9px", fontWeight: 600 }}>Đã tuân thủ</p>
                              <p className="text-green-700 mt-0.5" style={{ fontSize: "16px", fontWeight: 700 }}>
                                {sub.programs.reduce((s, p) => s + p.compliant, 0).toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg border border-amber-200 p-2.5">
                              <p className="text-amber-600" style={{ fontSize: "9px", fontWeight: 600 }}>Sắp hết hạn</p>
                              <p className="text-amber-700 mt-0.5" style={{ fontSize: "16px", fontWeight: 700 }}>
                                {totalExpiring}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg border border-red-200 p-2.5">
                              <p className="text-red-500" style={{ fontSize: "9px", fontWeight: 600 }}>Quá hạn</p>
                              <p className="text-red-600 mt-0.5" style={{ fontSize: "16px", fontWeight: 700 }}>
                                {totalOverdue}
                              </p>
                            </div>
                          </div>

                          {/* Per-program mini bars */}
                          <div className="mt-3 space-y-1.5">
                            {sub.programs.map(prog => {
                              const p = programs.find(x => x.id === prog.programId);
                              if (!p) return null;
                              const pStyle = getRateStyle(prog.rate);
                              return (
                                <div key={prog.programId} className="flex items-center gap-2">
                                  <span className="text-gray-500 shrink-0" style={{ fontSize: "9px", fontWeight: 500, width: "80px" }}>
                                    {PROGRAM_TYPE_CONFIG[p.type].icon} {p.shortName}
                                  </span>
                                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all" style={{ width: `${prog.rate}%`, backgroundColor: pStyle.ringColor, opacity: 0.8 }} />
                                  </div>
                                  <span className="shrink-0" style={{ fontSize: "10px", fontWeight: 700, color: pStyle.text, width: "32px", textAlign: "right" }}>
                                    {prog.rate}%
                                  </span>
                                  {prog.overdue > 0 && (
                                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-50 text-red-500 shrink-0" style={{ fontSize: "8px", fontWeight: 600 }}>
                                      <AlertTriangle className="w-2.5 h-2.5" />{prog.overdue}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                ) : null;

                return detailRow ? [mainRow, detailRow] : [mainRow];
              })}

              {/* Column averages footer */}
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td className="sticky left-0 z-10 bg-gray-50 px-3 py-2.5 border-r border-gray-200">
                  <span className="text-gray-500" style={{ fontSize: "10px", fontWeight: 700 }}>TRUNG BÌNH</span>
                </td>
                {programs.map(p => {
                  const colAvg = colAverages.find(c => c.id === p.id);
                  const avg = colAvg?.avg ?? 0;
                  const avgStyle = getRateStyle(avg);
                  return (
                    <td key={p.id} className="px-1 py-2 text-center">
                      <div className="mx-auto rounded-lg py-1 px-2" style={{ backgroundColor: avgStyle.bg, border: `1px solid ${avgStyle.text}15`, maxWidth: "68px" }}>
                        <p style={{ fontSize: "13px", fontWeight: 800, color: avgStyle.text }}>{avg}%</p>
                      </div>
                    </td>
                  );
                })}
                <td className="px-2 py-2 text-center border-l border-gray-200">
                  {(() => {
                    const overall = Math.round(matrix.reduce((s, sub) => s + sub.overallRate, 0) / matrix.length);
                    const oStyle = getRateStyle(overall);
                    return (
                      <span className="px-2 py-1 rounded-full" style={{ fontSize: "12px", fontWeight: 800, color: oStyle.text, backgroundColor: oStyle.bg }}>
                        {overall}%
                      </span>
                    );
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Subsidiary ranking */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-700 mb-4 flex items-center gap-1.5" style={{ fontSize: "14px", fontWeight: 600 }}>
          <TrendingUp className="w-4 h-4 text-[#990803]" />
          Xếp hạng Tuân thủ theo Đơn vị
        </h3>
        <SubsidiaryRanking data={matrix} />
      </div>
    </div>
  );
}

/* ──── Subsidiary Ranking ──── */
function SubsidiaryRanking({ data }: { data: SubsidiaryCompliance[] }) {
  const sorted = [...data].sort((a, b) => b.overallRate - a.overallRate);

  return (
    <div className="space-y-2">
      {sorted.map((sub, i) => {
        const style = getRateStyle(sub.overallRate);
        const totalOverdue = sub.programs.reduce((s, p) => s + p.overdue, 0);
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;

        return (
          <div key={sub.subsidiaryId} className="flex items-center gap-3 group">
            {/* Rank */}
            <div className="w-7 text-center shrink-0">
              {medal ? (
                <span style={{ fontSize: "16px" }}>{medal}</span>
              ) : (
                <span className="text-gray-300" style={{ fontSize: "12px", fontWeight: 700 }}>#{i + 1}</span>
              )}
            </div>

            {/* Name */}
            <span className="text-gray-600 shrink-0 group-hover:text-gray-800 transition-colors" style={{ fontSize: "11px", fontWeight: 500, width: "120px" }}>
              {sub.shortName}
            </span>

            {/* Progress bar */}
            <div className="flex-1 h-6 bg-gray-100 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all flex items-center px-2"
                style={{
                  width: `${sub.overallRate}%`,
                  background: `linear-gradient(90deg, ${style.ringColor}cc, ${style.ringColor}90)`,
                  minWidth: sub.overallRate > 0 ? "30px" : "0",
                }}
              >
                {sub.overallRate >= 30 && (
                  <span className="text-white" style={{ fontSize: "10px", fontWeight: 700 }}>{sub.overallRate}%</span>
                )}
              </div>
            </div>

            {/* Rate badge */}
            {sub.overallRate < 30 && (
              <span style={{ fontSize: "11px", fontWeight: 700, color: style.text }}>{sub.overallRate}%</span>
            )}

            {/* Overdue badge */}
            {totalOverdue > 0 && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 shrink-0" style={{ fontSize: "9px", fontWeight: 600 }}>
                <AlertTriangle className="w-3 h-3" />{totalOverdue}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}