import { useState } from "react";
import {
  Grid3x3, Users, Building2, Filter, Download, Search,
  ChevronRight, ArrowUp, ArrowDown, Eye, Star,
  Target, TrendingUp, AlertTriangle, CheckCircle,
  BarChart3, Layers, Zap, Award, Brain,
  Plus, Settings, RefreshCw, Info,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface Skill {
  id: string;
  name: string;
  category: string;
  level: "basic" | "intermediate" | "advanced" | "expert";
  criticality: "low" | "medium" | "high" | "critical";
}

interface SubsidiarySkill {
  subsidiaryId: string;
  subsidiaryName: string;
  shortName: string;
  logo: string;
  headcount: number;
  skills: Record<string, { current: number; target: number; gap: number; coverage: number }>;
}

interface SkillCategory {
  name: string;
  color: string;
  skills: string[];
}

// ─── Mock Data ───
const CATEGORIES: SkillCategory[] = [
  { name: "Quản lý", color: "#990803", skills: ["Lãnh đạo", "Quản lý DA", "Chiến lược", "Ra quyết định"] },
  { name: "Kỹ thuật", color: "#2563eb", skills: ["IT/Digital", "An toàn LĐ", "Kỹ thuật CN", "Data Analysis"] },
  { name: "Tài chính", color: "#16a34a", skills: ["Kế toán", "Phân tích TC", "Compliance", "Quản lý Rủi ro"] },
  { name: "Mềm", color: "#c8a84e", skills: ["Giao tiếp", "Teamwork", "Sáng tạo", "Tư duy phản biện"] },
  { name: "Chuyên ngành", color: "#7c3aed", skills: ["Bất động sản", "Ngân hàng", "Bảo hiểm", "Giáo dục"] },
];

const ALL_SKILLS = CATEGORIES.flatMap(c => c.skills);

const SUBSIDIARY_DATA: SubsidiarySkill[] = [
  {
    subsidiaryId: "S01", subsidiaryName: "VP Tập đoàn", shortName: "HQ", logo: "🏢", headcount: 450,
    skills: { "Lãnh đạo": { current: 82, target: 90, gap: -8, coverage: 88 }, "Quản lý DA": { current: 78, target: 85, gap: -7, coverage: 82 }, "Chiến lược": { current: 85, target: 90, gap: -5, coverage: 90 }, "Ra quyết định": { current: 80, target: 85, gap: -5, coverage: 86 }, "IT/Digital": { current: 72, target: 80, gap: -8, coverage: 75 }, "An toàn LĐ": { current: 65, target: 70, gap: -5, coverage: 70 }, "Kỹ thuật CN": { current: 45, target: 50, gap: -5, coverage: 50 }, "Data Analysis": { current: 68, target: 80, gap: -12, coverage: 72 }, "Kế toán": { current: 75, target: 80, gap: -5, coverage: 80 }, "Phân tích TC": { current: 80, target: 85, gap: -5, coverage: 85 }, "Compliance": { current: 88, target: 90, gap: -2, coverage: 92 }, "Quản lý Rủi ro": { current: 76, target: 85, gap: -9, coverage: 78 }, "Giao tiếp": { current: 82, target: 85, gap: -3, coverage: 88 }, "Teamwork": { current: 85, target: 85, gap: 0, coverage: 90 }, "Sáng tạo": { current: 70, target: 80, gap: -10, coverage: 72 }, "Tư duy phản biện": { current: 75, target: 82, gap: -7, coverage: 78 }, "Bất động sản": { current: 55, target: 60, gap: -5, coverage: 58 }, "Ngân hàng": { current: 60, target: 65, gap: -5, coverage: 62 }, "Bảo hiểm": { current: 50, target: 55, gap: -5, coverage: 52 }, "Giáo dục": { current: 40, target: 45, gap: -5, coverage: 42 } },
  },
  {
    subsidiaryId: "S02", subsidiaryName: "ABBank", shortName: "ABB", logo: "🏦", headcount: 2800,
    skills: { "Lãnh đạo": { current: 75, target: 85, gap: -10, coverage: 78 }, "Quản lý DA": { current: 70, target: 80, gap: -10, coverage: 72 }, "Chiến lược": { current: 72, target: 82, gap: -10, coverage: 75 }, "Ra quyết định": { current: 78, target: 85, gap: -7, coverage: 80 }, "IT/Digital": { current: 82, target: 90, gap: -8, coverage: 85 }, "An toàn LĐ": { current: 55, target: 60, gap: -5, coverage: 58 }, "Kỹ thuật CN": { current: 40, target: 45, gap: -5, coverage: 42 }, "Data Analysis": { current: 85, target: 90, gap: -5, coverage: 88 }, "Kế toán": { current: 90, target: 92, gap: -2, coverage: 95 }, "Phân tích TC": { current: 92, target: 95, gap: -3, coverage: 94 }, "Compliance": { current: 95, target: 98, gap: -3, coverage: 96 }, "Quản lý Rủi ro": { current: 88, target: 92, gap: -4, coverage: 90 }, "Giao tiếp": { current: 80, target: 85, gap: -5, coverage: 82 }, "Teamwork": { current: 78, target: 82, gap: -4, coverage: 80 }, "Sáng tạo": { current: 65, target: 75, gap: -10, coverage: 68 }, "Tư duy phản biện": { current: 72, target: 80, gap: -8, coverage: 75 }, "Bất động sản": { current: 35, target: 40, gap: -5, coverage: 38 }, "Ngân hàng": { current: 95, target: 98, gap: -3, coverage: 96 }, "Bảo hiểm": { current: 60, target: 70, gap: -10, coverage: 62 }, "Giáo dục": { current: 30, target: 35, gap: -5, coverage: 32 } },
  },
  {
    subsidiaryId: "S03", subsidiaryName: "BĐS KĐT", shortName: "BĐS", logo: "🏘️", headcount: 320,
    skills: { "Lãnh đạo": { current: 70, target: 80, gap: -10, coverage: 72 }, "Quản lý DA": { current: 85, target: 90, gap: -5, coverage: 88 }, "Chiến lược": { current: 68, target: 78, gap: -10, coverage: 70 }, "Ra quyết định": { current: 72, target: 80, gap: -8, coverage: 75 }, "IT/Digital": { current: 60, target: 72, gap: -12, coverage: 62 }, "An toàn LĐ": { current: 80, target: 85, gap: -5, coverage: 82 }, "Kỹ thuật CN": { current: 75, target: 80, gap: -5, coverage: 78 }, "Data Analysis": { current: 55, target: 68, gap: -13, coverage: 58 }, "Kế toán": { current: 70, target: 78, gap: -8, coverage: 72 }, "Phân tích TC": { current: 65, target: 75, gap: -10, coverage: 68 }, "Compliance": { current: 78, target: 85, gap: -7, coverage: 80 }, "Quản lý Rủi ro": { current: 72, target: 80, gap: -8, coverage: 75 }, "Giao tiếp": { current: 82, target: 85, gap: -3, coverage: 85 }, "Teamwork": { current: 80, target: 82, gap: -2, coverage: 82 }, "Sáng tạo": { current: 68, target: 75, gap: -7, coverage: 70 }, "Tư duy phản biện": { current: 65, target: 72, gap: -7, coverage: 68 }, "Bất động sản": { current: 92, target: 95, gap: -3, coverage: 94 }, "Ngân hàng": { current: 40, target: 45, gap: -5, coverage: 42 }, "Bảo hiểm": { current: 45, target: 50, gap: -5, coverage: 48 }, "Giáo dục": { current: 35, target: 40, gap: -5, coverage: 38 } },
  },
  {
    subsidiaryId: "S04", subsidiaryName: "Xi măng TL", shortName: "XM", logo: "🏭", headcount: 600,
    skills: { "Lãnh đạo": { current: 65, target: 75, gap: -10, coverage: 68 }, "Quản lý DA": { current: 60, target: 72, gap: -12, coverage: 62 }, "Chiến lược": { current: 55, target: 68, gap: -13, coverage: 58 }, "Ra quyết định": { current: 62, target: 72, gap: -10, coverage: 65 }, "IT/Digital": { current: 45, target: 60, gap: -15, coverage: 48 }, "An toàn LĐ": { current: 95, target: 98, gap: -3, coverage: 96 }, "Kỹ thuật CN": { current: 90, target: 95, gap: -5, coverage: 92 }, "Data Analysis": { current: 40, target: 55, gap: -15, coverage: 42 }, "Kế toán": { current: 65, target: 72, gap: -7, coverage: 68 }, "Phân tích TC": { current: 55, target: 65, gap: -10, coverage: 58 }, "Compliance": { current: 88, target: 92, gap: -4, coverage: 90 }, "Quản lý Rủi ro": { current: 82, target: 88, gap: -6, coverage: 85 }, "Giao tiếp": { current: 62, target: 72, gap: -10, coverage: 65 }, "Teamwork": { current: 75, target: 80, gap: -5, coverage: 78 }, "Sáng tạo": { current: 45, target: 58, gap: -13, coverage: 48 }, "Tư duy phản biện": { current: 50, target: 62, gap: -12, coverage: 52 }, "Bất động sản": { current: 30, target: 35, gap: -5, coverage: 32 }, "Ngân hàng": { current: 25, target: 30, gap: -5, coverage: 28 }, "Bảo hiểm": { current: 30, target: 35, gap: -5, coverage: 32 }, "Giáo dục": { current: 25, target: 30, gap: -5, coverage: 28 } },
  },
  {
    subsidiaryId: "S05", subsidiaryName: "Hanel", shortName: "HNL", logo: "💻", headcount: 420,
    skills: { "Lãnh đạo": { current: 72, target: 82, gap: -10, coverage: 75 }, "Quản lý DA": { current: 82, target: 88, gap: -6, coverage: 85 }, "Chiến lược": { current: 70, target: 80, gap: -10, coverage: 72 }, "Ra quyết định": { current: 75, target: 82, gap: -7, coverage: 78 }, "IT/Digital": { current: 92, target: 95, gap: -3, coverage: 94 }, "An toàn LĐ": { current: 60, target: 68, gap: -8, coverage: 62 }, "Kỹ thuật CN": { current: 88, target: 92, gap: -4, coverage: 90 }, "Data Analysis": { current: 85, target: 90, gap: -5, coverage: 88 }, "Kế toán": { current: 68, target: 75, gap: -7, coverage: 70 }, "Phân tích TC": { current: 72, target: 80, gap: -8, coverage: 75 }, "Compliance": { current: 75, target: 82, gap: -7, coverage: 78 }, "Quản lý Rủi ro": { current: 68, target: 78, gap: -10, coverage: 70 }, "Giao tiếp": { current: 78, target: 82, gap: -4, coverage: 80 }, "Teamwork": { current: 82, target: 85, gap: -3, coverage: 85 }, "Sáng tạo": { current: 80, target: 88, gap: -8, coverage: 82 }, "Tư duy phản biện": { current: 78, target: 85, gap: -7, coverage: 80 }, "Bất động sản": { current: 30, target: 35, gap: -5, coverage: 32 }, "Ngân hàng": { current: 35, target: 40, gap: -5, coverage: 38 }, "Bảo hiểm": { current: 30, target: 35, gap: -5, coverage: 32 }, "Giáo dục": { current: 45, target: 55, gap: -10, coverage: 48 } },
  },
  {
    subsidiaryId: "S06", subsidiaryName: "ABS", shortName: "ABS", logo: "📈", headcount: 280,
    skills: { "Lãnh đạo": { current: 74, target: 82, gap: -8, coverage: 76 }, "Quản lý DA": { current: 72, target: 80, gap: -8, coverage: 75 }, "Chiến lược": { current: 78, target: 85, gap: -7, coverage: 80 }, "Ra quyết định": { current: 80, target: 85, gap: -5, coverage: 82 }, "IT/Digital": { current: 78, target: 85, gap: -7, coverage: 80 }, "An toàn LĐ": { current: 55, target: 62, gap: -7, coverage: 58 }, "Kỹ thuật CN": { current: 42, target: 50, gap: -8, coverage: 45 }, "Data Analysis": { current: 88, target: 92, gap: -4, coverage: 90 }, "Kế toán": { current: 85, target: 88, gap: -3, coverage: 88 }, "Phân tích TC": { current: 90, target: 95, gap: -5, coverage: 92 }, "Compliance": { current: 92, target: 95, gap: -3, coverage: 94 }, "Quản lý Rủi ro": { current: 85, target: 90, gap: -5, coverage: 88 }, "Giao tiếp": { current: 75, target: 80, gap: -5, coverage: 78 }, "Teamwork": { current: 78, target: 82, gap: -4, coverage: 80 }, "Sáng tạo": { current: 62, target: 72, gap: -10, coverage: 65 }, "Tư duy phản biện": { current: 74, target: 80, gap: -6, coverage: 76 }, "Bất động sản": { current: 35, target: 40, gap: -5, coverage: 38 }, "Ngân hàng": { current: 72, target: 78, gap: -6, coverage: 75 }, "Bảo hiểm": { current: 55, target: 65, gap: -10, coverage: 58 }, "Giáo dục": { current: 30, target: 35, gap: -5, coverage: 32 } },
  },
];

function cellColor(val: number): string {
  if (val >= 85) return "#16a34a";
  if (val >= 70) return "#c8a84e";
  if (val >= 50) return "#ea580c";
  return "#ef4444";
}

function cellOpacity(val: number): number {
  return 0.15 + (val / 100) * 0.55;
}

export function SkillMatrix() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"matrix" | "gaps" | "radar" | "planning">("matrix");
  const [viewMode, setViewMode] = useState<"current" | "gap" | "coverage">("current");
  const [selectedCat, setSelectedCat] = useState<string>("all");

  const visibleSkills = selectedCat === "all"
    ? ALL_SKILLS
    : CATEGORIES.find(c => c.name === selectedCat)?.skills || [];

  const totalGap = SUBSIDIARY_DATA.reduce((sum, s) => {
    return sum + Object.values(s.skills).reduce((gs, sk) => gs + Math.abs(sk.gap), 0);
  }, 0);
  const avgCoverage = Math.round(
    SUBSIDIARY_DATA.reduce((sum, s) => sum + Object.values(s.skills).reduce((cs, sk) => cs + sk.coverage, 0) / ALL_SKILLS.length, 0) / SUBSIDIARY_DATA.length
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Grid3x3 className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">Skill Matrix</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Ma trận năng lực × đơn vị — 20 kỹ năng × {SUBSIDIARY_DATA.length} công ty thành viên × {SUBSIDIARY_DATA.reduce((s, d) => s + d.headcount, 0).toLocaleString()} nhân sự
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất Skill Matrix...")); }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đang cập nhật dữ liệu Skill Matrix...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <RefreshCw className="w-4 h-4" /> Cập nhật Dữ liệu
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Kỹ năng", value: ALL_SKILLS.length, icon: Layers, color: "#990803" },
          { label: "Đơn vị", value: SUBSIDIARY_DATA.length, icon: Building2, color: "#2563eb" },
          { label: "Coverage TB", value: `${avgCoverage}%`, icon: Target, color: avgCoverage >= 75 ? "#16a34a" : "#c8a84e" },
          { label: "Tổng Gap", value: totalGap, icon: AlertTriangle, color: "#ea580c" },
          { label: "Critical Gaps", value: SUBSIDIARY_DATA.reduce((s, d) => s + Object.values(d.skills).filter(sk => sk.gap <= -10).length, 0), icon: AlertTriangle, color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "10" }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: s.color }}>{s.value}</p>
              <p className="text-gray-400" style={{ fontSize: "9px" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0.5 border-b border-gray-200 overflow-x-auto">
        {([
          { id: "matrix", label: "Ma trận Heatmap", icon: Grid3x3 },
          { id: "gaps", label: "Gap Analysis", icon: AlertTriangle },
          { id: "radar", label: "Radar so sánh", icon: Target },
          { id: "planning", label: "Kế hoạch", icon: TrendingUp },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "matrix" && <MatrixTab data={SUBSIDIARY_DATA} categories={CATEGORIES} viewMode={viewMode} setViewMode={setViewMode} selectedCat={selectedCat} setSelectedCat={setSelectedCat} visibleSkills={visibleSkills} />}
      {tab === "gaps" && <GapsTab data={SUBSIDIARY_DATA} />}
      {tab === "radar" && <RadarTab data={SUBSIDIARY_DATA} categories={CATEGORIES} />}
      {tab === "planning" && <PlanningTab data={SUBSIDIARY_DATA} />}
    </div>
  );
}

// ─── Matrix Heatmap Tab ───
function MatrixTab({ data, categories, viewMode, setViewMode, selectedCat, setSelectedCat, visibleSkills }: {
  data: SubsidiarySkill[]; categories: SkillCategory[];
  viewMode: string; setViewMode: (v: "current" | "gap" | "coverage") => void;
  selectedCat: string; setSelectedCat: (c: string) => void;
  visibleSkills: string[];
}) {
  const cellW = 52, cellH = 30, headerH = 90, labelW = 60;
  const svgW = labelW + visibleSkills.length * (cellW + 2) + 10;
  const svgH = headerH + data.length * (cellH + 2) + 10;

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg p-0.5">
          {(["current", "gap", "coverage"] as const).map(v => (
            <button key={v} onClick={() => setViewMode(v)} className={`px-2.5 py-1 rounded cursor-pointer ${viewMode === v ? "bg-[#990803] text-white" : "text-gray-400 hover:bg-gray-50"}`} style={{ fontSize: "10px", fontWeight: viewMode === v ? 600 : 400 }}>
              {v === "current" ? "Hiện tại" : v === "gap" ? "Gap" : "Coverage"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setSelectedCat("all")} className={`px-2.5 py-1 rounded-lg border cursor-pointer ${selectedCat === "all" ? "border-[#990803] bg-[#990803]/10 text-[#990803]" : "border-gray-200 text-gray-400"}`} style={{ fontSize: "10px", fontWeight: selectedCat === "all" ? 600 : 400 }}>Tất cả</button>
          {categories.map(c => (
            <button key={c.name} onClick={() => setSelectedCat(c.name)} className={`px-2.5 py-1 rounded-lg border cursor-pointer ${selectedCat === c.name ? "border-current" : "border-gray-200"}`} style={{ fontSize: "10px", fontWeight: selectedCat === c.name ? 600 : 400, color: selectedCat === c.name ? c.color : "#9ca3af" }}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
        <svg width={svgW} height={svgH} className="min-w-full">
          {/* Column headers (skills) - rotated */}
          {visibleSkills.map((skill, si) => {
            const x = labelW + si * (cellW + 2) + cellW / 2;
            const catColor = categories.find(c => c.skills.includes(skill))?.color || "#6b7280";
            return (
              <g key={skill}>
                <rect x={labelW + si * (cellW + 2)} y={0} width={cellW} height={headerH - 2} rx="4" fill={catColor} opacity="0.06" />
                <text x={x} y={headerH - 6} textAnchor="end" fill={catColor} style={{ fontSize: "8px", fontWeight: 600 }} transform={`rotate(-45, ${x}, ${headerH - 6})`}>{skill}</text>
              </g>
            );
          })}

          {/* Rows (subsidiaries) */}
          {data.map((sub, ri) => {
            const y = headerH + ri * (cellH + 2);
            return (
              <g key={sub.subsidiaryId}>
                {/* Row label */}
                <text x={5} y={y + cellH / 2 + 1} dominantBaseline="central" fill="#374151" style={{ fontSize: "8px", fontWeight: 600 }}>{sub.logo} {sub.shortName}</text>
                {/* Cells */}
                {visibleSkills.map((skill, si) => {
                  const x = labelW + si * (cellW + 2);
                  const sk = sub.skills[skill];
                  if (!sk) return null;
                  const val = viewMode === "current" ? sk.current : viewMode === "gap" ? sk.gap : sk.coverage;
                  const displayVal = viewMode === "gap" ? `${val}` : `${val}`;
                  const color = viewMode === "gap"
                    ? (val >= -3 ? "#16a34a" : val >= -8 ? "#c8a84e" : "#ef4444")
                    : cellColor(val);
                  const op = viewMode === "gap"
                    ? (Math.abs(val) / 15 * 0.5 + 0.1)
                    : cellOpacity(val);
                  return (
                    <g key={`${sub.subsidiaryId}-${skill}`}>
                      <rect x={x} y={y} width={cellW} height={cellH} rx="4" fill={color} opacity={op} />
                      <text x={x + cellW / 2} y={y + cellH / 2} textAnchor="middle" dominantBaseline="central" fill={color} style={{ fontSize: "9px", fontWeight: 700 }}>
                        {displayVal}{viewMode !== "gap" ? "%" : ""}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Color legend */}
          <g transform={`translate(${labelW}, ${svgH - 18})`}>
            <text x="0" y="8" fill="#9ca3af" style={{ fontSize: "7px" }}>
              {viewMode === "gap" ? "Gap: " : ""}
            </text>
            {viewMode === "gap" ? (
              <>
                <rect x="30" y="0" width="20" height="12" rx="2" fill="#16a34a" opacity="0.4" />
                <text x="53" y="9" fill="#6b7280" style={{ fontSize: "6px" }}>≥-3</text>
                <rect x="70" y="0" width="20" height="12" rx="2" fill="#c8a84e" opacity="0.4" />
                <text x="93" y="9" fill="#6b7280" style={{ fontSize: "6px" }}>≥-8</text>
                <rect x="110" y="0" width="20" height="12" rx="2" fill="#ef4444" opacity="0.4" />
                <text x="133" y="9" fill="#6b7280" style={{ fontSize: "6px" }}>&lt;-8</text>
              </>
            ) : (
              <>
                <rect x="30" y="0" width="20" height="12" rx="2" fill="#ef4444" opacity="0.3" />
                <text x="53" y="9" fill="#6b7280" style={{ fontSize: "6px" }}>&lt;50</text>
                <rect x="70" y="0" width="20" height="12" rx="2" fill="#ea580c" opacity="0.4" />
                <text x="93" y="9" fill="#6b7280" style={{ fontSize: "6px" }}>50-69</text>
                <rect x="115" y="0" width="20" height="12" rx="2" fill="#c8a84e" opacity="0.4" />
                <text x="138" y="9" fill="#6b7280" style={{ fontSize: "6px" }}>70-84</text>
                <rect x="160" y="0" width="20" height="12" rx="2" fill="#16a34a" opacity="0.5" />
                <text x="183" y="9" fill="#6b7280" style={{ fontSize: "6px" }}>≥85</text>
              </>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}

// ─── Gap Analysis Tab ───
function GapsTab({ data }: { data: SubsidiarySkill[] }) {
  // Find top critical gaps
  const allGaps: { subsidiary: string; skill: string; gap: number; current: number; target: number }[] = [];
  data.forEach(sub => {
    Object.entries(sub.skills).forEach(([skill, sk]) => {
      if (sk.gap <= -8) {
        allGaps.push({ subsidiary: sub.shortName, skill, gap: sk.gap, current: sk.current, target: sk.target });
      }
    });
  });
  allGaps.sort((a, b) => a.gap - b.gap);

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Top Critical Skill Gaps (gap ≥ 8 điểm)</h3>
        <svg width="100%" height={Math.max(200, allGaps.length * 22 + 20)} viewBox={`0 0 600 ${Math.max(200, allGaps.length * 22 + 20)}`} preserveAspectRatio="xMidYMid meet">
          {allGaps.slice(0, 15).map((g, i) => {
            const y = 5 + i * 22;
            const barW = (Math.abs(g.gap) / 15) * 200;
            const color = g.gap <= -12 ? "#ef4444" : g.gap <= -10 ? "#ea580c" : "#c8a84e";
            return (
              <g key={`${g.subsidiary}-${g.skill}`}>
                <text x="5" y={y + 10} dominantBaseline="central" fill="#374151" style={{ fontSize: "8px", fontWeight: 500 }}>{g.subsidiary}</text>
                <text x="40" y={y + 10} dominantBaseline="central" fill="#6b7280" style={{ fontSize: "8px" }}>{g.skill}</text>
                <rect x="150" y={y} width={barW} height="18" rx="3" fill={color} opacity="0.45" />
                <text x={155 + barW} y={y + 10} dominantBaseline="central" fill={color} style={{ fontSize: "8px", fontWeight: 700 }}>{g.gap}</text>
                <text x="400" y={y + 10} dominantBaseline="central" fill="#9ca3af" style={{ fontSize: "7px" }}>
                  Hiện: {g.current}% → Mục tiêu: {g.target}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Gap by Category */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Gap trung bình theo Nhóm Kỹ năng</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {CATEGORIES.map(cat => {
            const avgGap = Math.round(data.reduce((sum, sub) => {
              return sum + cat.skills.reduce((gs, sk) => gs + Math.abs(sub.skills[sk]?.gap || 0), 0) / cat.skills.length;
            }, 0) / data.length);
            return (
              <div key={cat.name} className="p-3 rounded-xl border" style={{ borderColor: cat.color + "30", backgroundColor: cat.color + "05" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-gray-700" style={{ fontSize: "11px", fontWeight: 600 }}>{cat.name}</span>
                </div>
                <p style={{ fontSize: "22px", fontWeight: 700, color: avgGap > 8 ? "#ef4444" : avgGap > 5 ? "#c8a84e" : "#16a34a" }}>-{avgGap}</p>
                <p className="text-gray-400" style={{ fontSize: "9px" }}>Gap TB ({cat.skills.length} skills)</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Radar Tab ───
function RadarTab({ data, categories }: { data: SubsidiarySkill[]; categories: SkillCategory[] }) {
  const [sel1, setSel1] = useState(data[0].subsidiaryId);
  const [sel2, setSel2] = useState(data[1].subsidiaryId);
  const sub1 = data.find(d => d.subsidiaryId === sel1)!;
  const sub2 = data.find(d => d.subsidiaryId === sel2)!;

  // Use category averages for radar
  const catAvgs = (sub: SubsidiarySkill) => categories.map(cat => ({
    name: cat.name, color: cat.color,
    value: Math.round(cat.skills.reduce((s, sk) => s + (sub.skills[sk]?.current || 0), 0) / cat.skills.length),
  }));

  const avgs1 = catAvgs(sub1);
  const avgs2 = catAvgs(sub2);
  const n = avgs1.length;
  const cx = 160, cy = 120, r = 90;

  const getPoint = (i: number, val: number) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const dist = (val / 100) * r;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <select value={sel1} onChange={e => setSel1(e.target.value)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>
          {data.map(d => <option key={d.subsidiaryId} value={d.subsidiaryId}>{d.logo} {d.shortName}</option>)}
        </select>
        <span className="text-gray-300" style={{ fontSize: "11px" }}>vs</span>
        <select value={sel2} onChange={e => setSel2(e.target.value)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>
          {data.map(d => <option key={d.subsidiaryId} value={d.subsidiaryId}>{d.logo} {d.shortName}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>
          Radar so sánh: {sub1.logo} {sub1.shortName} vs {sub2.logo} {sub2.shortName}
        </h3>
        <svg width="100%" height="260" viewBox="0 0 320 260" preserveAspectRatio="xMidYMid meet">
          {/* Grid rings */}
          {[25, 50, 75, 100].map(lv => (
            <polygon key={lv}
              points={Array.from({ length: n }, (_, i) => getPoint(i, lv)).map(p => `${p.x},${p.y}`).join(" ")}
              fill="none" stroke="#e5e7eb" strokeWidth="0.5"
            />
          ))}
          {/* Axis lines */}
          {Array.from({ length: n }, (_, i) => {
            const p = getPoint(i, 100);
            return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#f3f4f6" strokeWidth="0.5" />;
          })}
          {/* Labels */}
          {avgs1.map((a, i) => {
            const p = getPoint(i, 112);
            return <text key={a.name} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fill={a.color} style={{ fontSize: "8px", fontWeight: 600 }}>{a.name}</text>;
          })}
          {/* Sub1 polygon */}
          <polygon
            points={avgs1.map((a, i) => getPoint(i, a.value)).map(p => `${p.x},${p.y}`).join(" ")}
            fill="#990803" fillOpacity="0.15" stroke="#990803" strokeWidth="1.5"
          />
          {avgs1.map((a, i) => {
            const p = getPoint(i, a.value);
            return <circle key={i} cx={p.x} cy={p.y} r="3" fill="#990803" />;
          })}
          {/* Sub2 polygon */}
          <polygon
            points={avgs2.map((a, i) => getPoint(i, a.value)).map(p => `${p.x},${p.y}`).join(" ")}
            fill="#2563eb" fillOpacity="0.1" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="4 2"
          />
          {avgs2.map((a, i) => {
            const p = getPoint(i, a.value);
            return <circle key={i} cx={p.x} cy={p.y} r="3" fill="#2563eb" />;
          })}
          {/* Legend */}
          <rect x="10" y="235" width="10" height="10" rx="2" fill="#990803" opacity="0.6" />
          <text x="24" y="243" fill="#374151" style={{ fontSize: "8px" }}>{sub1.logo} {sub1.shortName}</text>
          <rect x="100" y="235" width="10" height="10" rx="2" fill="#2563eb" opacity="0.6" />
          <text x="114" y="243" fill="#374151" style={{ fontSize: "8px" }}>{sub2.logo} {sub2.shortName}</text>
        </svg>

        {/* Comparison table */}
        <div className="mt-3 space-y-1">
          {avgs1.map((a, i) => {
            const v2 = avgs2[i].value;
            const diff = a.value - v2;
            return (
              <div key={a.name} className="flex items-center gap-2 py-1">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                <span className="text-gray-600 w-20" style={{ fontSize: "10px" }}>{a.name}</span>
                <span className="w-10 text-right" style={{ fontSize: "11px", fontWeight: 600, color: "#990803" }}>{a.value}</span>
                <span className="text-gray-300" style={{ fontSize: "10px" }}>vs</span>
                <span className="w-10 text-right" style={{ fontSize: "11px", fontWeight: 600, color: "#2563eb" }}>{v2}</span>
                <span className={`ml-2 ${diff > 0 ? "text-green-500" : diff < 0 ? "text-red-500" : "text-gray-400"}`} style={{ fontSize: "10px", fontWeight: 600 }}>
                  {diff > 0 ? "+" : ""}{diff}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Planning Tab ───
function PlanningTab({ data }: { data: SubsidiarySkill[] }) {
  const plans = [
    { skill: "IT/Digital", priority: "Cao", subsidiaries: ["XM", "BĐS"], gap: -14, action: "Triển khai lộ trình Digital Upskilling 6 tháng", budget: "450M VND", timeline: "Q2-Q3 2026", status: "Lên kế hoạch" },
    { skill: "Data Analysis", priority: "Cao", subsidiaries: ["XM", "BĐS"], gap: -14, action: "Khóa đào tạo Power BI + Python cơ bản", budget: "280M VND", timeline: "Q2 2026", status: "Đang duyệt" },
    { skill: "Sáng tạo", priority: "TB", subsidiaries: ["XM", "ABB", "ABS"], gap: -11, action: "Workshop Design Thinking + Innovation Lab", budget: "180M VND", timeline: "Q3 2026", status: "Lên kế hoạch" },
    { skill: "Lãnh đạo", priority: "Cao", subsidiaries: ["XM", "ABB"], gap: -10, action: "Chương trình Leadership 4.0 cho cấp trung", budget: "520M VND", timeline: "Q2-Q4 2026", status: "Đã duyệt" },
    { skill: "Tư duy phản biện", priority: "TB", subsidiaries: ["XM", "ABB"], gap: -10, action: "Critical Thinking Workshop series 8 buổi", budget: "120M VND", timeline: "Q3 2026", status: "Lên kế hoạch" },
    { skill: "Giao tiếp", priority: "Thấp", subsidiaries: ["XM"], gap: -10, action: "Kỹ năng Presentation + Thuyết phục", budget: "90M VND", timeline: "Q4 2026", status: "Backlog" },
  ];

  const statusColor: Record<string, string> = {
    "Đã duyệt": "#16a34a", "Đang duyệt": "#2563eb", "Lên kế hoạch": "#c8a84e", "Backlog": "#9ca3af",
  };

  const priorityColor: Record<string, string> = {
    "Cao": "#ef4444", "TB": "#c8a84e", "Thấp": "#6b7280",
  };

  return (
    <div className="space-y-3">
      <p className="text-gray-500" style={{ fontSize: "12px" }}>Kế hoạch phát triển năng lực dựa trên gap analysis</p>
      <div className="space-y-2">
        {plans.map((p, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#990803" + "10" }}>
                <Brain className="w-5 h-5 text-[#990803]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{p.skill}</h4>
                  <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 700, color: priorityColor[p.priority], backgroundColor: priorityColor[p.priority] + "10" }}>{p.priority}</span>
                  <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "8px", fontWeight: 600, color: statusColor[p.status], backgroundColor: statusColor[p.status] + "10" }}>{p.status}</span>
                </div>
                <p className="text-gray-600 mb-1" style={{ fontSize: "11px" }}>{p.action}</p>
                <div className="flex items-center gap-3 flex-wrap text-gray-400" style={{ fontSize: "10px" }}>
                  <span>📍 {p.subsidiaries.join(", ")}</span>
                  <span>📊 Gap: <span className="text-red-500" style={{ fontWeight: 600 }}>{p.gap}</span></span>
                  <span>💰 {p.budget}</span>
                  <span>📅 {p.timeline}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Tổng hợp Ngân sách Phát triển Năng lực</h3>
        <svg width="100%" height="80" viewBox="0 0 600 80" preserveAspectRatio="xMidYMid meet">
          {plans.map((p, i) => {
            const budget = parseInt(p.budget.replace(/[^0-9]/g, ""));
            const maxBudget = 520;
            const x = 10 + i * 98;
            const barH = (budget / maxBudget) * 45;
            const color = statusColor[p.status] || "#6b7280";
            return (
              <g key={i}>
                <rect x={x} y={50 - barH} width="78" height={barH} rx="4" fill={color} opacity="0.4" />
                <text x={x + 39} y={45 - barH} textAnchor="middle" fill={color} style={{ fontSize: "8px", fontWeight: 700 }}>{p.budget}</text>
                <text x={x + 39} y={65} textAnchor="middle" fill="#6b7280" style={{ fontSize: "6.5px" }}>{p.skill}</text>
              </g>
            );
          })}
        </svg>
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-100">
          <span className="text-gray-500" style={{ fontSize: "11px" }}>Tổng ngân sách đề xuất</span>
          <span className="text-[#990803]" style={{ fontSize: "14px", fontWeight: 700 }}>1,640M VND</span>
        </div>
      </div>
    </div>
  );
}