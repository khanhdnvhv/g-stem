import { useState } from "react";
import { type Competency, COMPETENCY_CATEGORIES, LEVEL_LABELS } from "./mock-data";

interface CompetencyRadarProps {
  competencies: Competency[];
  size?: number;
  showLegend?: boolean;
}

export function CompetencyRadar({ competencies, size = 280, showLegend = true }: CompetencyRadarProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const n = competencies.length;
  if (n < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const levels = 5;
  const angleStep = (2 * Math.PI) / n;

  // Convert level to position
  const getPoint = (idx: number, level: number) => {
    const angle = -Math.PI / 2 + idx * angleStep;
    const r = (level / levels) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Build polygon paths
  const currentPath = competencies.map((c, i) => {
    const p = getPoint(i, c.currentLevel);
    return `${p.x},${p.y}`;
  }).join(" ");

  const targetPath = competencies.map((c, i) => {
    const p = getPoint(i, c.targetLevel);
    return `${p.x},${p.y}`;
  }).join(" ");

  // Gap analysis
  const totalGap = competencies.reduce((s, c) => s + (c.targetLevel - c.currentLevel), 0);
  const maxPossibleGap = competencies.length * 4;
  const gapPercentage = Math.round((totalGap / maxPossibleGap) * 100);

  return (
    <div>
      <svg
        width="100%"
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="radarCurrentFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#990803" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#990803" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="radarTargetFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c8a84e" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#c8a84e" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid lines (concentric polygons) */}
        {Array.from({ length: levels }, (_, lv) => {
          const path = Array.from({ length: n }, (_, i) => {
            const p = getPoint(i, lv + 1);
            return `${p.x},${p.y}`;
          }).join(" ");
          return (
            <polygon
              key={lv}
              points={path}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={lv === levels - 1 ? 1 : 0.5}
              strokeDasharray={lv < levels - 1 ? "2 2" : "none"}
            />
          );
        })}

        {/* Axis lines */}
        {competencies.map((_, i) => {
          const p = getPoint(i, levels);
          return (
            <line
              key={`axis-${i}`}
              x1={cx} y1={cy}
              x2={p.x} y2={p.y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Target polygon (background) */}
        <polygon
          points={targetPath}
          fill="url(#radarTargetFill)"
          stroke="#c8a84e"
          strokeWidth="1.5"
          strokeDasharray="6 3"
          opacity="0.8"
        />

        {/* Current polygon */}
        <polygon
          points={currentPath}
          fill="url(#radarCurrentFill)"
          stroke="#990803"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Data points (current) */}
        {competencies.map((c, i) => {
          const p = getPoint(i, c.currentLevel);
          const isHovered = hoveredIdx === i;
          return (
            <circle
              key={`pt-${i}`}
              cx={p.x} cy={p.y}
              r={isHovered ? 5 : 3.5}
              fill="#990803"
              stroke="white"
              strokeWidth="2"
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          );
        })}

        {/* Data points (target) */}
        {competencies.map((c, i) => {
          const p = getPoint(i, c.targetLevel);
          return (
            <circle
              key={`tgt-${i}`}
              cx={p.x} cy={p.y}
              r={2.5}
              fill="#c8a84e"
              stroke="white"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Labels */}
        {competencies.map((c, i) => {
          const angle = -Math.PI / 2 + i * angleStep;
          const labelR = maxR + 24;
          const x = cx + labelR * Math.cos(angle);
          const y = cy + labelR * Math.sin(angle);
          const catCfg = COMPETENCY_CATEGORIES[c.category];
          const isHovered = hoveredIdx === i;

          return (
            <g key={`lbl-${i}`}>
              <text
                x={x}
                y={y}
                textAnchor={
                  Math.abs(Math.cos(angle)) < 0.1 ? "middle" :
                  Math.cos(angle) > 0 ? "start" : "end"
                }
                dominantBaseline="central"
                fill={isHovered ? "#990803" : "#6b7280"}
                style={{ fontSize: isHovered ? "11px" : "10px", fontWeight: isHovered ? 600 : 400, transition: "all 0.2s" }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {c.name}
              </text>
              {/* Level indicator */}
              <text
                x={x}
                y={y + 13}
                textAnchor={
                  Math.abs(Math.cos(angle)) < 0.1 ? "middle" :
                  Math.cos(angle) > 0 ? "start" : "end"
                }
                fill={catCfg?.color || "#6b7280"}
                style={{ fontSize: "8px", fontWeight: 600 }}
              >
                {c.currentLevel}→{c.targetLevel}
              </text>
            </g>
          );
        })}

        {/* Center label */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#374151" style={{ fontSize: "14px", fontWeight: 700 }}>
          {Math.round(competencies.reduce((s, c) => s + c.currentLevel, 0) / n * 10) / 10}
        </text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "8px" }}>
          TB hiện tại
        </text>

        {/* Tooltip on hover */}
        {hoveredIdx !== null && (() => {
          const c = competencies[hoveredIdx];
          const p = getPoint(hoveredIdx, c.currentLevel);
          const catCfg = COMPETENCY_CATEGORIES[c.category];
          const tx = Math.min(Math.max(p.x, 60), size - 60);
          const ty = p.y > cy ? p.y - 45 : p.y + 15;
          return (
            <g>
              <rect x={tx - 55} y={ty} width="110" height="35" rx="6" fill="white" stroke="#e5e7eb" />
              <text x={tx} y={ty + 13} textAnchor="middle" fill="#374151" style={{ fontSize: "9px", fontWeight: 600 }}>
                {LEVEL_LABELS[c.currentLevel]} → {LEVEL_LABELS[c.targetLevel]}
              </text>
              <text x={tx} y={ty + 25} textAnchor="middle" fill={catCfg?.color || "#6b7280"} style={{ fontSize: "8px" }}>
                Gap: {c.targetLevel - c.currentLevel} cấp
              </text>
            </g>
          );
        })()}
      </svg>

      {/* Legend & Gap Summary */}
      {showLegend && (
        <div className="flex items-center justify-between mt-2 px-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-[#990803] rounded" />
              <span className="text-gray-500" style={{ fontSize: "10px" }}>Hiện tại</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-[#c8a84e] rounded" style={{ borderTop: "1px dashed #c8a84e" }} />
              <span className="text-gray-500" style={{ fontSize: "10px" }}>Mục tiêu</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400" style={{ fontSize: "10px" }}>Gap tổng:</span>
            <span
              className="px-1.5 py-0.5 rounded-full"
              style={{
                fontSize: "9px", fontWeight: 700,
                color: gapPercentage > 40 ? "#dc2626" : gapPercentage > 20 ? "#f59e0b" : "#16a34a",
                backgroundColor: gapPercentage > 40 ? "#dc262612" : gapPercentage > 20 ? "#f59e0b12" : "#16a34a12",
              }}
            >
              {gapPercentage}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
