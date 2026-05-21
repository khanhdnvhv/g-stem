import { useState, useRef, useMemo } from "react";
import {
  LayoutTemplate, Plus, Download, Eye, GripVertical,
  BarChart3, Users, TrendingUp, FileText, CheckCircle2, Package,
  Calendar, X, RefreshCw, Save, FolderOpen, Trash2, ChevronDown, ChevronUp, Star,
} from "lucide-react";
import { PageHeader, SelectDown } from "./authority-ui";
import { toast } from "sonner";
import { useAuth, useConfirm } from "./authority-ui";
import { useRecentReports } from "./useRecentReports";
import { provinceSnapshots, procurementEntries } from "./authority-data";

const ACCENT = "#7c3aed";

/* ── Types ── */

interface MetricBlock {
  id: string;
  type: "kpi" | "bar" | "table" | "pie" | "trend";
  title: string;
  description: string;
  icon: typeof BarChart3;
  color: string;
}

type TimeRange = "month" | "quarter" | "year";

interface SavedConfig {
  id: string;
  name: string;
  blockIds: string[];
  timeRange: TimeRange;
  periodLabel: string;
  savedAt: string;
}

/* ── Mock-derived district/school data for Hà Nội ── */

const HN_DISTRICTS = [
  { name: "Hoàn Kiếm", pct: 97 },
  { name: "Ba Đình",   pct: 94 },
  { name: "Cầu Giấy",  pct: 95 },
  { name: "Đống Đa",   pct: 91 },
  { name: "Hai Bà Trưng", pct: 89 },
  { name: "Thanh Xuân", pct: 87 },
  { name: "Hoàng Mai", pct: 82 },
  { name: "Long Biên",  pct: 85 },
  { name: "Sóc Sơn",   pct: 71 },
  { name: "Ba Vì",     pct: 68 },
];

const NON_COMPLIANT = [
  { name: "THCS Sóc Sơn A",   district: "Sóc Sơn",  pct: 71 },
  { name: "THPT Ba Vì 2",     district: "Ba Vì",     pct: 68 },
  { name: "THCS Hoàng Mai 3", district: "Hoàng Mai", pct: 75 },
  { name: "THPT Đông Anh 2",  district: "Đông Anh",  pct: 73 },
  { name: "THCS Mê Linh B",   district: "Mê Linh",   pct: 69 },
];

const TOP_SCHOOLS = [
  { name: "THPT Chu Văn An",   district: "Tây Hồ",     tt38: 97, stem: 8.7 },
  { name: "THPT Hoàn Kiếm",    district: "Hoàn Kiếm",  tt38: 97, stem: 8.6 },
  { name: "THCS Cầu Giấy",     district: "Cầu Giấy",   tt38: 96, stem: 8.5 },
  { name: "THPT Nguyễn Trãi",  district: "Ba Đình",    tt38: 95, stem: 8.4 },
  { name: "THCS Đống Đa",      district: "Đống Đa",    tt38: 94, stem: 8.3 },
];

// Điểm STEM Hà Nội: HK1/2023 → HK2/2026 (8 học kỳ)
const TREND_VALUES = [7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.7, 7.8];
const TREND_LABELS = ["HK1/23", "HK2/23", "HK1/24", "HK2/24", "HK1/25", "HK2/25", "HK1/26", "HK2/26"];

const PIE_SEGMENTS = [
  { label: "CT1 – Tích hợp nội môn", pct: 32, color: ACCENT },
  { label: "CT2 – Liên môn",          pct: 25, color: "#f59e0b" },
  { label: "CT3 – Đổi mới sáng tạo",  pct: 20, color: "#10b981" },
  { label: "CT4 – Phòng Lab STEM",     pct: 13, color: "#3b82f6" },
  { label: "CT5 – Toàn diện",          pct: 10, color: "#e11d48" },
];

/* ── Fix 2: Time-aware data helpers ── */

function getDistrictData(range: TimeRange) {
  const base = range === "month" ? 2 : range === "year" ? -2 : 0;
  return HN_DISTRICTS.map((d, i) => {
    const delta = base === 0 ? 0 : base + (i % 3) - 1;
    return { ...d, pct: Math.min(100, Math.max(0, d.pct + delta)) };
  });
}

function getPieSegments(range: TimeRange) {
  if (range === "month") return [
    { label: "CT1 – Tích hợp nội môn", pct: 34, color: ACCENT },
    { label: "CT2 – Liên môn",          pct: 24, color: "#f59e0b" },
    { label: "CT3 – Đổi mới sáng tạo",  pct: 19, color: "#10b981" },
    { label: "CT4 – Phòng Lab STEM",     pct: 14, color: "#3b82f6" },
    { label: "CT5 – Toàn diện",          pct: 9,  color: "#e11d48" },
  ];
  if (range === "year") return [
    { label: "CT1 – Tích hợp nội môn", pct: 30, color: ACCENT },
    { label: "CT2 – Liên môn",          pct: 26, color: "#f59e0b" },
    { label: "CT3 – Đổi mới sáng tạo",  pct: 21, color: "#10b981" },
    { label: "CT4 – Phòng Lab STEM",     pct: 14, color: "#3b82f6" },
    { label: "CT5 – Toàn diện",          pct: 9,  color: "#e11d48" },
  ];
  return PIE_SEGMENTS;
}

function getTrendSlice(range: TimeRange) {
  if (range === "month")   return { values: TREND_VALUES.slice(-2), labels: TREND_LABELS.slice(-2) };
  if (range === "quarter") return { values: TREND_VALUES.slice(-4), labels: TREND_LABELS.slice(-4) };
  return { values: TREND_VALUES, labels: TREND_LABELS };
}

/* ── KPI computation từ dữ liệu thật ── */

const HN = provinceSnapshots.find(p => p.province === "Hà Nội")!;

function computeKPI(range: TimeRange): Record<string, { value: string; unit: string }> {
  const stemSchools    = Math.round(HN.schools * HN.stemCoveragePct / 100);
  const stemStudents   = Math.round(HN.students * HN.stemCoveragePct / 100);
  const trainedTeachers = Math.round(HN.teachers * 0.40);

  const hnEntries   = procurementEntries.filter(e => e.province === "Hà Nội" && e.year === 2026);
  const totalBudget = hnEntries.reduce((s, e) => s + e.amountVND, 0);
  const scaled      = range === "month" ? totalBudget / 12 : range === "quarter" ? totalBudget / 4 : totalBudget;

  const fmtBudget = scaled >= 1e12
    ? `${(scaled / 1e12).toFixed(1)}T₫`
    : `${Math.round(scaled / 1e9)}T₫`;

  const fmtStudents = stemStudents >= 1_000_000
    ? `${(stemStudents / 1_000_000).toFixed(2)}M`
    : stemStudents.toLocaleString("vi-VN");

  return {
    b1: { value: stemSchools.toLocaleString("vi-VN"),     unit: "trường STEM" },
    b3: { value: fmtBudget,                               unit: "tổng đầu tư" },
    b6: { value: fmtStudents,                             unit: "học sinh" },
    b8: { value: trainedTeachers.toLocaleString("vi-VN"), unit: "giáo viên" },
  };
}

/* ── localStorage helpers ── */

const SAVE_KEY       = "reportBuilderConfigs_v1";
const TEMPLATE_KEY   = "reportBuilderUserTemplates_v1";
const HIDDEN_SYS_KEY = "reportBuilderHiddenSys_v1";

interface UserTemplate {
  id: string;
  name: string;
  blockIds: string[];
  timeRange: TimeRange;
}

function loadConfigs(): SavedConfig[] {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) ?? "[]"); } catch { return []; }
}
function persistConfigs(configs: SavedConfig[]) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(configs)); } catch {}
}

function loadUserTemplates(): UserTemplate[] {
  try { return JSON.parse(localStorage.getItem(TEMPLATE_KEY) ?? "[]"); } catch { return []; }
}
function persistUserTemplates(tpls: UserTemplate[]) {
  try { localStorage.setItem(TEMPLATE_KEY, JSON.stringify(tpls)); } catch {}
}

function loadHiddenSys(): string[] {
  try { return JSON.parse(localStorage.getItem(HIDDEN_SYS_KEY) ?? "[]"); } catch { return []; }
}
function persistHiddenSys(ids: string[]) {
  try { localStorage.setItem(HIDDEN_SYS_KEY, JSON.stringify(ids)); } catch {}
}

/* ── PDF / Print export ── */

function buildPrintHTML(blocks: MetricBlock[], range: TimeRange, kpi: Record<string, { value: string; unit: string }>, periodLabel: string) {
  const date = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });

  const blockHtml = blocks.map((b, idx) => {
    const k         = kpi[b.id];
    const districts = getDistrictData(range);
    const pieSegs   = getPieSegments(range);
    const { values: tvs, labels: tls } = getTrendSlice(range);
    const tMax = Math.max(...tvs), tMin = Math.min(...tvs);

    let content = "";

    if (b.type === "kpi" && k) {
      content = `<div style="display:flex;align-items:flex-end;gap:12px;margin-top:8px">
        <span style="font-size:28px;font-weight:700;color:${b.color};line-height:1">${k.value}</span>
        <span style="font-size:11px;color:#9ca3af;margin-bottom:3px">${k.unit}</span>
      </div>`;
    } else if (b.type === "bar") {
      content = `<div style="margin-top:8px">${
        districts.slice(0, 6).map(d =>
          `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="font-size:10px;color:#9ca3af;width:90px;flex-shrink:0">${d.name}</span>
            <div style="flex:1;height:10px;background:#f3f4f6;border-radius:6px;overflow:hidden">
              <div style="width:${d.pct}%;height:100%;background:${b.color};border-radius:6px"></div>
            </div>
            <span style="font-size:10px;font-weight:600;color:#374151;width:28px;text-align:right">${d.pct}%</span>
          </div>`
        ).join("")
      }</div>`;
    } else if (b.type === "table") {
      const isNeg = b.id === "b4";
      const rows  = isNeg
        ? NON_COMPLIANT.map(r => `<tr>
            <td style="padding:4px 8px 4px 0;color:#374151">${r.name}</td>
            <td style="padding:4px 8px;color:#9ca3af">${r.district}</td>
            <td style="padding:4px 0;text-align:right;font-weight:600;color:#dc2626">${r.pct}%</td>
          </tr>`).join("")
        : TOP_SCHOOLS.map(r => `<tr>
            <td style="padding:4px 8px 4px 0;color:#374151">${r.name}</td>
            <td style="padding:4px 8px;color:#9ca3af">${r.district}</td>
            <td style="padding:4px 0;text-align:right;font-weight:600;color:#16a34a">${r.tt38}%</td>
          </tr>`).join("");
      content = `<table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:11px">
        <thead>
          <tr style="border-bottom:1px solid #e5e7eb;color:#9ca3af">
            <th style="text-align:left;padding:4px 8px 4px 0;font-weight:500">Trường</th>
            <th style="text-align:left;padding:4px 8px;font-weight:500">Quận/Huyện</th>
            <th style="text-align:right;padding:4px 0;font-weight:500">TT38</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
    } else if (b.type === "pie") {
      let cum = 0;
      const stops = pieSegs.map(s => {
        const start = cum; cum += s.pct;
        return `${s.color} ${start * 3.6}deg ${cum * 3.6}deg`;
      }).join(", ");
      const legend = pieSegs.map(s =>
        `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div style="width:10px;height:10px;border-radius:2px;background:${s.color};flex-shrink:0"></div>
          <span style="font-size:10px;color:#6b7280">${s.label}: <strong>${s.pct}%</strong></span>
        </div>`
      ).join("");
      content = `<div style="display:flex;align-items:center;gap:20px;margin-top:8px">
        <div style="width:64px;height:64px;border-radius:50%;background:conic-gradient(${stops});flex-shrink:0"></div>
        <div>${legend}</div>
      </div>`;
    } else if (b.type === "trend") {
      const bars = tvs.map((v, i) => {
        const h    = tMax === tMin ? 50 : Math.round(((v - tMin) / (tMax - tMin)) * 70 + 30);
        const isLast = i === tvs.length - 1;
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">
          <div style="width:100%;height:${h}%;background:${isLast ? b.color : b.color + "55"};border-radius:3px 3px 0 0"></div>
          <span style="font-size:8px;color:#9ca3af">${tls[i]}</span>
        </div>`;
      }).join("");
      content = `<div style="margin-top:8px">
        <div style="display:flex;align-items:flex-end;gap:4px;height:56px">${bars}</div>
        <div style="display:flex;justify-content:space-between;margin-top:4px">
          <span style="font-size:10px;color:#9ca3af">Xu hướng: ${tvs[0]} → ${tvs[tvs.length - 1]} điểm</span>
          <span style="font-size:10px;font-weight:600;color:${b.color}">${tvs[tvs.length - 1]} điểm</span>
        </div>
      </div>`;
    }

    return `<div style="border:1px solid #f3f4f6;border-radius:8px;overflow:hidden;break-inside:avoid">
      <div style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:#f9fafb;border-bottom:1px solid #f3f4f6">
        <div style="width:4px;height:16px;border-radius:2px;background:${b.color};flex-shrink:0"></div>
        <span style="font-size:11px;font-weight:600;color:#374151">${idx + 1}. ${b.title}</span>
      </div>
      <div style="padding:4px 16px 14px">${content}</div>
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Báo cáo STEM · ${periodLabel}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; margin: 0; background: #6b7280; }
    .page { background: #fff; max-width: 720px; margin: 32px auto; padding: 0; box-shadow: 0 4px 32px rgba(0,0,0,0.2); }
    .letterhead { border-bottom: 4px solid ${ACCENT}; padding: 32px 40px 20px; }
    .lh-row { display: flex; align-items: flex-start; justify-content: space-between; }
    .lh-meta { font-size: 9px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 3px; }
    .lh-org { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 2px; }
    .lh-sub { font-size: 12px; color: #6b7280; }
    .lh-logo { width: 52px; height: 52px; border-radius: 50%; border: 2px solid #e5e7eb; display: flex; align-items: center; justify-content: center; }
    .lh-logo span { font-size: 22px; font-weight: 900; color: ${ACCENT}; }
    .lh-title { text-align: center; margin-top: 20px; }
    .lh-title-label { font-size: 9px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.12em; }
    .lh-title-main { font-size: 17px; font-weight: 700; color: #111827; margin: 4px 0; }
    .lh-title-meta { font-size: 11px; color: #9ca3af; }
    .body { padding: 28px 40px; }
    .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .divider hr { flex: 1; border: none; border-top: 1px solid #e5e7eb; }
    .divider span { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; white-space: nowrap; }
    .blocks { display: flex; flex-direction: column; gap: 16px; }
    .footer { border-top: 1px solid #e5e7eb; margin: 0 40px; padding: 16px 0 28px; display: flex; justify-content: space-between; }
    .sig-label { font-size: 9px; color: #9ca3af; margin-bottom: 24px; }
    .sig-line { border-top: 1px solid #9ca3af; width: 120px; padding-top: 4px; font-size: 9px; color: #6b7280; text-align: center; }
    .page-num { text-align: center; padding-bottom: 16px; font-size: 9px; color: #d1d5db; }
    @media print {
      body { background: #fff; }
      .page { margin: 0; box-shadow: none; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="letterhead">
      <div class="lh-row">
        <div>
          <div class="lh-meta">Cộng hòa Xã hội Chủ nghĩa Việt Nam</div>
          <div class="lh-meta" style="margin-bottom:12px">Độc lập – Tự do – Hạnh phúc</div>
          <div class="lh-org">SỞ GIÁO DỤC VÀ ĐÀO TẠO HÀ NỘI</div>
          <div class="lh-sub">Chương trình Giáo dục STEM</div>
        </div>
        <div style="text-align:right">
          <div class="lh-logo"><span>G</span></div>
          <div style="font-size:9px;color:#9ca3af;margin-top:4px">Geleximco STEM</div>
        </div>
      </div>
      <div class="lh-title">
        <div class="lh-title-label">Báo cáo</div>
        <div class="lh-title-main">${periodLabel.toUpperCase()}</div>
        <div class="lh-title-meta">Kỳ báo cáo: ${periodLabel} &nbsp;·&nbsp; Ngày lập: ${date}</div>
      </div>
    </div>

    <div class="body">
      <div class="divider">
        <hr /><span>Các chỉ số báo cáo (${blocks.length})</span><hr />
      </div>
      <div class="blocks">${blockHtml}</div>
    </div>

    <div class="footer">
      <div>
        <div class="sig-label">Người lập báo cáo</div>
        <div class="sig-line">Ký và ghi rõ họ tên</div>
      </div>
      <div style="text-align:right">
        <div class="sig-label">Hà Nội, ${date}<br>Trưởng phòng Giáo dục STEM</div>
        <div class="sig-line" style="margin-left:auto">Ký, đóng dấu</div>
      </div>
    </div>
    <div class="page-num">— 1 —</div>
  </div>
</body>
</html>`;
}

/* ── Block library ── */

const AVAILABLE_BLOCKS: MetricBlock[] = [
  { id: "b1", type: "kpi",   title: "Tổng số trường STEM",          description: "KPI card — số trường đang triển khai",       icon: Users,        color: "#7c3aed" },
  { id: "b2", type: "bar",   title: "Tiến độ TT38 theo quận",       description: "Biểu đồ cột — tỉ lệ đạt chuẩn TT38",        icon: BarChart3,    color: "#2563eb" },
  { id: "b3", type: "kpi",   title: "Tổng ngân sách đầu tư",        description: "KPI card — ngân sách thiết bị + giấy phép",  icon: TrendingUp,   color: "#16a34a" },
  { id: "b4", type: "table", title: "Danh sách trường chưa đạt TT38", description: "Bảng chi tiết — ưu tiên hỗ trợ",           icon: FileText,     color: "#dc2626" },
  { id: "b5", type: "pie",   title: "Phân bố Chương trình CT1–CT5", description: "Biểu đồ tròn — cơ cấu chương trình STEM",   icon: Package,      color: "#d97706" },
  { id: "b6", type: "kpi",   title: "Số học sinh tham gia STEM",    description: "KPI card — học sinh đang học STEM",          icon: Users,        color: "#0891b2" },
  { id: "b7", type: "trend", title: "Xu hướng điểm số STEM",        description: "Biểu đồ đường — điểm STEM theo học kỳ",     icon: TrendingUp,   color: "#7c3aed" },
  { id: "b8", type: "kpi",   title: "Giáo viên được đào tạo",       description: "KPI card — số GV hoàn thành tập huấn",      icon: CheckCircle2, color: "#16a34a" },
  { id: "b9", type: "table", title: "Top 5 trường hiệu quả nhất",   description: "Bảng xếp hạng — điểm TT38 và STEM cao nhất", icon: BarChart3,   color: "#2563eb" },
];

const TEMPLATES = [
  { id: "t1", name: "Báo cáo Hàng tháng",   blocks: ["b1", "b3", "b6", "b8", "b2", "b5"] },
  { id: "t2", name: "Báo cáo TT38",          blocks: ["b1", "b2", "b4", "b9"] },
  { id: "t3", name: "Báo cáo Hiệu quả STEM", blocks: ["b6", "b7", "b8", "b9"] },
];

const BLOCK_PREVIEW: Record<MetricBlock["type"], string> = {
  kpi:   "bg-blue-50 border-blue-200",
  bar:   "bg-purple-50 border-purple-200",
  table: "bg-gray-50 border-gray-200",
  pie:   "bg-amber-50 border-amber-200",
  trend: "bg-green-50 border-green-200",
};

const TIME_LABELS: Record<TimeRange, string> = {
  month:   "Tháng",
  quarter: "Quý",
  year:    "Năm học",
};

const PERIOD_OPTIONS: Record<TimeRange, string[]> = {
  month:   ["T8/2025","T9/2025","T10/2025","T11/2025","T12/2025","T1/2026","T2/2026","T3/2026","T4/2026","T5/2026","T6/2026","T7/2026"],
  quarter: ["Q4/2025","Q1/2026","Q2/2026","Q3/2026"],
  year:    ["2023–2024","2024–2025","2025–2026"],
};

const DEFAULT_PERIOD: Record<TimeRange, string> = {
  month:   "T5/2026",
  quarter: "Q2/2026",
  year:    "2025–2026",
};

/* ── Sub-components ── */

function MiniPieChart({ color, timeRange }: { color: string; timeRange: TimeRange }) {
  const segs = getPieSegments(timeRange);
  let cum = 0;
  const stops = segs.map(s => {
    const start = cum; cum += s.pct;
    return `${s.color} ${start * 3.6}deg ${cum * 3.6}deg`;
  });
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full flex-shrink-0 mt-0.5"
        style={{ background: `conic-gradient(${stops.join(", ")})` }} />
      <div className="space-y-0.5 min-w-0">
        {segs.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="text-[10px] text-muted-foreground leading-tight truncate">
              {s.label.split("–")[0].trim()} <strong>{s.pct}%</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniSparkline({ color, timeRange }: { color: string; timeRange: TimeRange }) {
  const { values, labels } = getTrendSlice(timeRange);
  const max = Math.max(...values);
  const min = Math.min(...values);
  return (
    <div>
      <div className="flex items-end gap-0.5 h-8">
        {values.map((v, i) => {
          const h = max === min ? 50 : ((v - min) / (max - min)) * 70 + 30;
          const isLast = i === values.length - 1;
          return (
            <div key={i} className="flex-1 rounded-sm transition-all"
              style={{ height: `${h}%`, background: isLast ? color : color + "60" }} />
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground">{labels[0]}</span>
        <span className="text-[10px] font-semibold" style={{ color }}>
          {values[values.length - 1]} điểm
        </span>
      </div>
    </div>
  );
}

/* ── Fix 3: Visual Report Preview — A4 document simulation ── */

function PreviewBlockContent({
  block, kpi, timeRange,
}: {
  block: MetricBlock;
  kpi: Record<string, { value: string; unit: string }>;
  timeRange: TimeRange;
}) {
  const kpiData   = kpi[block.id];
  const districts = getDistrictData(timeRange);
  const pieSegs   = getPieSegments(timeRange);
  const { values: tvs, labels: tls } = getTrendSlice(timeRange);
  const tMax = Math.max(...tvs), tMin = Math.min(...tvs);

  if (block.type === "kpi" && kpiData) return (
    <div className="flex items-end gap-3 mt-2">
      <span className="text-3xl font-bold tracking-tight" style={{ color: block.color }}>{kpiData.value}</span>
      <span className="text-xs text-gray-500 mb-1">{kpiData.unit}</span>
    </div>
  );

  if (block.type === "bar") return (
    <div className="mt-2 space-y-2">
      {districts.slice(0, 6).map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 w-24 shrink-0">{d.name}</span>
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: block.color }} />
          </div>
          <span className="text-[10px] font-semibold text-gray-700 w-8 text-right">{d.pct}%</span>
        </div>
      ))}
    </div>
  );

  if (block.type === "table") {
    const isNeg = block.id === "b4";
    const rows  = isNeg
      ? NON_COMPLIANT
      : TOP_SCHOOLS.map(s => ({ name: s.name, district: s.district, pct: s.tt38 }));
    return (
      <table className="w-full mt-2 text-[11px] border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="text-left py-1 pr-2 font-medium">Trường</th>
            <th className="text-left py-1 pr-2 font-medium">Quận/Huyện</th>
            <th className="text-right py-1 font-medium">TT38</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td className="py-1 pr-2 text-gray-700">{r.name}</td>
              <td className="py-1 pr-2 text-gray-500">{r.district}</td>
              <td className={`py-1 text-right font-semibold ${isNeg ? "text-red-500" : "text-green-600"}`}>{r.pct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (block.type === "pie") {
    let cum = 0;
    const stops = pieSegs.map(s => {
      const start = cum; cum += s.pct;
      return `${s.color} ${start * 3.6}deg ${cum * 3.6}deg`;
    });
    return (
      <div className="flex items-center gap-5 mt-2">
        <div className="w-16 h-16 rounded-full shrink-0"
          style={{ background: `conic-gradient(${stops.join(", ")})` }} />
        <div className="space-y-1">
          {pieSegs.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
              <span className="text-[10px] text-gray-600">{s.label}: <strong>{s.pct}%</strong></span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "trend") return (
    <div className="mt-2">
      <div className="flex items-end gap-1 h-14">
        {tvs.map((v, i) => {
          const h = tMax === tMin ? 50 : ((v - tMin) / (tMax - tMin)) * 70 + 30;
          const isLast = i === tvs.length - 1;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full rounded-t" style={{ height: `${h}%`, background: isLast ? block.color : block.color + "55" }} />
              <span className="text-[8px] text-gray-400 rotate-0">{tls[i]}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">Xu hướng: {tvs[0]} → {tvs[tvs.length - 1]} điểm</span>
        <span className="text-[10px] font-semibold" style={{ color: block.color }}>{tvs[tvs.length - 1]} điểm</span>
      </div>
    </div>
  );

  return null;
}

function ReportPreview({
  blocks, timeRange, periodLabel, kpi, onClose,
}: {
  blocks: MetricBlock[];
  timeRange: TimeRange;
  periodLabel: string;
  kpi: Record<string, { value: string; unit: string }>;
  onClose: () => void;
}) {
  const date = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });

  return (
    /* Toolbar strip */
    <div className="rounded-xl overflow-hidden border border-gray-300 shadow-lg">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between bg-gray-700 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-gray-300 text-xs">Xem trước bản in — {periodLabel}</span>
        </div>
        <button onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* A4 page simulation */}
      <div className="bg-white overflow-auto max-h-[700px]">
        <div className="bg-white shadow-2xl mx-auto max-w-2xl" style={{ minHeight: "800px" }}>

          {/* Letterhead */}
          <div className="border-b-4 px-10 pt-8 pb-5" style={{ borderColor: ACCENT }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Cộng hòa Xã hội Chủ nghĩa Việt Nam</div>
                <div className="text-[10px] text-gray-400 mb-3">Độc lập – Tự do – Hạnh phúc</div>
                <div className="font-bold text-gray-800 text-base">SỞ GIÁO DỤC VÀ ĐÀO TẠO HÀ NỘI</div>
                <div className="text-sm text-gray-600 mt-0.5">Chương trình Giáo dục STEM</div>
              </div>
              <div className="text-right">
                <div className="w-14 h-14 rounded-full border-2 border-gray-200 flex items-center justify-center ml-auto mb-1">
                  <span className="text-xl font-black" style={{ color: ACCENT }}>G</span>
                </div>
                <div className="text-[10px] text-gray-400">Geleximco STEM</div>
              </div>
            </div>

            <div className="mt-5 text-center">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest">Báo cáo</div>
              <h1 className="text-lg font-bold text-gray-900 mt-1">
                {periodLabel.toUpperCase()}
              </h1>
              <div className="text-xs text-gray-500 mt-1">
                Kỳ báo cáo: {periodLabel} &nbsp;·&nbsp; Ngày lập: {date}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-10 py-7 space-y-6">
            {/* Section heading */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-[10px] uppercase tracking-widest text-gray-400">Các chỉ số báo cáo ({blocks.length})</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Blocks — full-width rows, each a section */}
            <div className="space-y-5">
              {blocks.map((block, idx) => {
                const Icon = block.icon;
                return (
                  <div key={block.id} className="border border-gray-100 rounded-lg overflow-hidden">
                    {/* Section title bar */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                      <div className="w-1 h-4 rounded-full" style={{ background: block.color }} />
                      <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: block.color + "18" }}>
                        <Icon className="w-3 h-3" style={{ color: block.color }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{idx + 1}. {block.title}</span>
                    </div>
                    {/* Section content */}
                    <div className="px-5 pb-4">
                      <PreviewBlockContent block={block} kpi={kpi} timeRange={timeRange} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 mx-10 mb-8 pt-4 flex items-start justify-between">
            <div>
              <div className="text-[10px] text-gray-400">Người lập báo cáo</div>
              <div className="mt-6 border-t border-gray-400 w-32 pt-1 text-[10px] text-gray-500 text-center">Ký và ghi rõ họ tên</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400">Hà Nội, {date}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">Trưởng phòng Giáo dục STEM</div>
              <div className="mt-6 border-t border-gray-400 w-32 pt-1 text-[10px] text-gray-500 text-center ml-auto">Ký, đóng dấu</div>
            </div>
          </div>

          {/* Page number */}
          <div className="text-center pb-4 text-[10px] text-gray-300">— 1 —</div>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */

export function AuthorityReportBuilder() {
  const { user } = useAuth();
  const confirm  = useConfirm();
  const { addReport } = useRecentReports(user?.id ?? "anon");

  const [canvasBlocks,    setCanvasBlocks]    = useState<MetricBlock[]>([]);
  const [timeRange,       setTimeRange]       = useState<TimeRange>("quarter");
  const [timePeriod,      setTimePeriod]      = useState<string>(DEFAULT_PERIOD["quarter"]);
  const [draggingId,      setDraggingId]      = useState<string | null>(null);
  const [showPreview,     setShowPreview]      = useState(false);
  const [savingName,      setSavingName]       = useState("");
  const [showSaveInput,   setShowSaveInput]    = useState(false);
  const [savedConfigs,    setSavedConfigs]     = useState<SavedConfig[]>(loadConfigs);
  const [showSaved,       setShowSaved]        = useState(false);
  const [userTemplates,   setUserTemplates]    = useState<UserTemplate[]>(loadUserTemplates);
  const [hiddenSysTpls,   setHiddenSysTpls]   = useState<string[]>(loadHiddenSys);
  const [openTplId,       setOpenTplId]        = useState<string | null>(null);

  const dragCanvasIdx = useRef<number | null>(null);

  const kpi = useMemo(() => computeKPI(timeRange), [timeRange]);

  /* ── Block ops ── */

  function addBlock(block: MetricBlock) {
    if (canvasBlocks.find(b => b.id === block.id)) {
      toast.info("Block này đã có trong báo cáo"); return;
    }
    setCanvasBlocks(prev => [...prev, block]);
  }

  function insertBlockAt(block: MetricBlock, idx: number) {
    if (canvasBlocks.find(b => b.id === block.id)) {
      toast.info("Block này đã có trong báo cáo"); return;
    }
    setCanvasBlocks(prev => {
      const next = [...prev];
      next.splice(idx, 0, block);
      return next;
    });
  }

  function removeBlock(id: string) {
    setCanvasBlocks(prev => prev.filter(b => b.id !== id));
  }

  async function applyTemplate(templateId: string) {
    const tpl = TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    if (canvasBlocks.length > 0) {
      const ok = await confirm({
        title: "Áp dụng mẫu mới?",
        message: `Báo cáo hiện tại sẽ bị xóa và thay bằng mẫu "${tpl.name}". Tiếp tục?`,
        confirmLabel: "Áp dụng",
        variant: "warning",
      });
      if (!ok) return;
    }
    const blocks = tpl.blocks.map(bid => AVAILABLE_BLOCKS.find(b => b.id === bid)).filter(Boolean) as MetricBlock[];
    setCanvasBlocks(blocks);
    toast.success(`Đã áp dụng mẫu "${tpl.name}"`);
  }

  async function applyUserTemplate(tpl: UserTemplate) {
    if (canvasBlocks.length > 0) {
      const ok = await confirm({
        title: "Áp dụng mẫu mới?",
        message: `Báo cáo hiện tại sẽ bị xóa và thay bằng mẫu "${tpl.name}". Tiếp tục?`,
        confirmLabel: "Áp dụng",
        variant: "warning",
      });
      if (!ok) return;
    }
    const blocks = tpl.blockIds.map(id => AVAILABLE_BLOCKS.find(b => b.id === id)).filter(Boolean) as MetricBlock[];
    setCanvasBlocks(blocks);
    setTimeRange(tpl.timeRange);
    setTimePeriod(DEFAULT_PERIOD[tpl.timeRange]);
    toast.success(`Đã áp dụng mẫu "${tpl.name}"`);
  }



  async function deleteUserTemplate(id: string) {
    const tpl = userTemplates.find(t => t.id === id);
    const ok = await confirm({
      title: "Xóa mẫu nhanh?",
      message: `Mẫu "${tpl?.name ?? ""}" sẽ bị xóa vĩnh viễn.`,
      confirmLabel: "Xóa",
      variant: "warning",
    });
    if (!ok) return;
    setUserTemplates(prev => {
      const updated = prev.filter(t => t.id !== id);
      persistUserTemplates(updated);
      return updated;
    });
    toast.success("Đã xóa mẫu nhanh");
  }

  async function hideSysTemplate(id: string) {
    const tpl = TEMPLATES.find(t => t.id === id);
    const ok = await confirm({
      title: "Xóa mẫu này?",
      message: `Mẫu "${tpl?.name}" sẽ bị ẩn. Có thể khôi phục qua nút "Khôi phục mặc định".`,
      confirmLabel: "Xóa",
      variant: "warning",
    });
    if (!ok) return;
    setHiddenSysTpls(prev => {
      const updated = [...prev, id];
      persistHiddenSys(updated);
      return updated;
    });
    toast.success(`Đã ẩn mẫu "${tpl?.name}"`);
  }

  function restoreSysTemplates() {
    setHiddenSysTpls([]);
    persistHiddenSys([]);
    toast.success("Đã khôi phục mẫu mặc định");
  }

  async function saveConfigAsTemplate(cfg: SavedConfig) {
    const alreadyExists = userTemplates.some(t => t.name === cfg.name);
    if (alreadyExists) {
      const ok = await confirm({
        title: "Ghi đè mẫu nhanh?",
        message: `Đã có mẫu nhanh tên "${cfg.name}". Ghi đè?`,
        confirmLabel: "Ghi đè",
        variant: "warning",
      });
      if (!ok) return;
    }
    const entry: UserTemplate = {
      id:        `TPL-${Date.now()}`,
      name:      cfg.name,
      blockIds:  cfg.blockIds,
      timeRange: cfg.timeRange,
    };
    setUserTemplates(prev => {
      const updated = [entry, ...prev.filter(t => t.name !== cfg.name)].slice(0, 10);
      persistUserTemplates(updated);
      return updated;
    });
    toast.success(`Đã lưu "${cfg.name}" thành mẫu nhanh`);
  }

  /* ── Library → canvas drag ── */

  function handleLibraryDragStart(id: string) {
    setDraggingId(id);
    dragCanvasIdx.current = null;
  }

  function handleDropOnCanvas() {
    if (!draggingId) return;
    const block = AVAILABLE_BLOCKS.find(b => b.id === draggingId);
    if (block) addBlock(block);
    setDraggingId(null);
  }

  /* ── Canvas reorder drag ── */

  function handleCanvasDragStart(idx: number) {
    dragCanvasIdx.current = idx;
    setDraggingId(null);
  }

  function handleCanvasDrop(targetIdx: number) {
    const fromIdx = dragCanvasIdx.current;
    if (fromIdx === null || fromIdx === targetIdx) return;
    setCanvasBlocks(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
    dragCanvasIdx.current = null;
  }

  /* ── Save ── */

  function saveReport() {
    const name = savingName.trim();
    if (!name) { toast.error("Nhập tên báo cáo"); return; }
    if (canvasBlocks.length === 0) { toast.error("Thêm ít nhất 1 block"); return; }

    const entry: SavedConfig = {
      id:          `CFG-${Date.now()}`,
      name,
      blockIds:    canvasBlocks.map(b => b.id),
      timeRange,
      periodLabel: timePeriod,
      savedAt:     new Date().toISOString(),
    };

    setSavedConfigs(prev => {
      const updated = [entry, ...prev.filter(c => c.name !== name)].slice(0, 20);
      persistConfigs(updated);
      return updated;
    });

    setSavingName("");
    setShowSaveInput(false);
    setShowSaved(true);
    toast.success(`Đã lưu "${name}"`);
  }

  function loadConfig(cfg: SavedConfig) {
    const blocks = cfg.blockIds
      .map(id => AVAILABLE_BLOCKS.find(b => b.id === id))
      .filter(Boolean) as MetricBlock[];
    setCanvasBlocks(blocks);
    setTimeRange(cfg.timeRange);
    setTimePeriod(cfg.periodLabel ?? DEFAULT_PERIOD[cfg.timeRange]);
    toast.success(`Đã tải "${cfg.name}"`);
  }

  function deleteConfig(id: string) {
    setSavedConfigs(prev => {
      const updated = prev.filter(c => c.id !== id);
      persistConfigs(updated);
      return updated;
    });
  }

  /* ── Export / Print ── */

  function exportReport() {
    if (canvasBlocks.length === 0) {
      toast.error("Thêm ít nhất 1 block vào báo cáo"); return;
    }

    const html = buildPrintHTML(canvasBlocks, timeRange, kpi, timePeriod);
    const win  = window.open("", "_blank", "width=900,height=700");
    if (!win) {
      toast.error("Trình duyệt chặn popup. Cho phép popup và thử lại."); return;
    }
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 400);

    addReport({
      name:         `Báo cáo ${timePeriod}`,
      templateCode: "CUSTOM",
      scope:        "province",
      period:       timePeriod,
    });

    toast.success("Đã mở hộp thoại xuất PDF");
  }

  /* ── Render ── */

  return (
    <div className="space-y-5">
      <PageHeader
        icon={LayoutTemplate}
        title="Report Builder"
        subtitle="Kéo & thả các block dữ liệu để tạo báo cáo theo nhu cầu"
        accentColor={ACCENT}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (canvasBlocks.length === 0) { toast.info("Thêm ít nhất 1 block để xem trước"); return; }
                setShowPreview(p => !p);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              <Eye className="w-4 h-4" /> Xem trước
            </button>
            <button
              onClick={() => { if (canvasBlocks.length === 0) { toast.info("Thêm ít nhất 1 block để lưu"); return; } setShowSaveInput(p => !p); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              <Save className="w-4 h-4" /> Lưu
            </button>
            <button
              onClick={exportReport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white hover:opacity-90 text-sm font-medium"
              style={{ background: ACCENT }}
            >
              <Download className="w-4 h-4" /> Xuất PDF
            </button>
          </div>
        }
      />

      {/* Toolbar */}
      {openTplId && <div className="fixed inset-0 z-40" onClick={() => setOpenTplId(null)} />}
      <div className="bg-card border border-border rounded-xl px-4 py-3 space-y-2.5">
        {/* Row 1: Templates */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium shrink-0">Mẫu nhanh:</span>

          {TEMPLATES.filter(t => !hiddenSysTpls.includes(t.id)).map(t => (
            <div key={t.id} className="relative z-50">
              <button
                onClick={() => setOpenTplId(openTplId === t.id ? null : t.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  openTplId === t.id
                    ? "border-purple-400 text-purple-700 bg-purple-50"
                    : "border-border hover:border-purple-400 hover:text-purple-700"
                }`}>
                {t.name}
              </button>
              {openTplId === t.id && (
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                  <button onClick={() => { setOpenTplId(null); applyTemplate(t.id); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors">
                    Áp dụng
                  </button>
                  <button onClick={() => { setOpenTplId(null); hideSysTemplate(t.id); }}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors border-t border-border">
                    Xóa mẫu
                  </button>
                </div>
              )}
            </div>
          ))}

          {hiddenSysTpls.length > 0 && (
            <button onClick={restoreSysTemplates}
              className="px-2.5 py-1.5 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-purple-400 hover:text-purple-700 transition-colors">
              Khôi phục mặc định
            </button>
          )}

          {userTemplates.map(t => (
            <div key={t.id} className="relative z-50">
              <button
                onClick={() => setOpenTplId(openTplId === t.id ? null : t.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  openTplId === t.id
                    ? "border-purple-400 text-purple-700 bg-purple-50"
                    : "border-border hover:border-purple-400 hover:text-purple-700"
                }`}>
                {t.name}
              </button>
              {openTplId === t.id && (
                <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[120px]">
                  <button onClick={() => { setOpenTplId(null); applyUserTemplate(t); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors">
                    Áp dụng
                  </button>
                  <button onClick={() => { setOpenTplId(null); deleteUserTemplate(t.id); }}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors border-t border-border">
                    Xóa mẫu
                  </button>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => { setCanvasBlocks([]); setShowPreview(false); toast.info("Đã xóa canvas"); }}
            className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-500 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Làm mới
          </button>
        </div>

        {/* Row 2: Time range + specific period */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground font-medium shrink-0">Thời gian:</span>
          <div className="flex gap-1 shrink-0">
            {(["month", "quarter", "year"] as TimeRange[]).map(t => (
              <button key={t} onClick={() => { setTimeRange(t); setTimePeriod(DEFAULT_PERIOD[t]); }}
                className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                style={timeRange === t
                  ? { background: ACCENT, color: "#fff" }
                  : { background: "var(--muted)", color: "var(--muted-foreground)" }}>
                {TIME_LABELS[t]}
              </button>
            ))}
          </div>
          <div className="w-px h-3.5 bg-border shrink-0" />
          <SelectDown
            value={timePeriod}
            onChange={setTimePeriod}
            options={PERIOD_OPTIONS[timeRange].map(p => ({ value: p, label: p }))}
            searchable
            className="w-36"
          />
        </div>
      </div>

      {/* Save name input */}
      {showSaveInput && (
        <div className="bg-card border border-purple-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Save className="w-4 h-4 flex-shrink-0" style={{ color: ACCENT }} />
          <input
            autoFocus
            value={savingName}
            onChange={e => setSavingName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") saveReport(); if (e.key === "Escape") { setShowSaveInput(false); setSavingName(""); } }}
            placeholder="Đặt tên báo cáo…"
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
          />
          <button onClick={saveReport}
            className="px-3 py-1.5 rounded-lg text-white text-xs font-medium"
            style={{ background: ACCENT }}>
            Lưu
          </button>
          <button onClick={() => { setShowSaveInput(false); setSavingName(""); }}
            className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Library */}
        <div className="col-span-12 md:col-span-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" style={{ color: ACCENT }} />
              Thư viện Block Dữ liệu
            </h3>
            <p className="text-xs text-muted-foreground mb-3">Kéo block vào vùng báo cáo hoặc nhấn để thêm</p>
            <div className="space-y-2">
              {AVAILABLE_BLOCKS.map(block => {
                const Icon  = block.icon;
                const added = canvasBlocks.some(b => b.id === block.id);
                return (
                  <div key={block.id} draggable
                    onDragStart={() => handleLibraryDragStart(block.id)}
                    onDragEnd={() => setDraggingId(null)}
                    onClick={() => addBlock(block)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all select-none ${
                      added
                        ? "opacity-40 cursor-not-allowed border-dashed border-gray-300"
                        : "hover:border-purple-400 border-border hover:bg-purple-50/50"
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: block.color + "15" }}>
                      <Icon className="w-4 h-4" style={{ color: block.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold leading-snug">{block.title}</div>
                      <div className="text-[11px] text-muted-foreground leading-snug">{block.description}</div>
                    </div>
                    {added && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 ml-auto mt-0.5" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="col-span-12 md:col-span-8 space-y-3">
          <div
            className="min-h-96 bg-card border-2 border-dashed border-border rounded-xl p-4 transition-colors"
            style={draggingId ? { borderColor: ACCENT, background: "#f5f3ff" } : {}}
            onDragOver={e => e.preventDefault()}
            onDrop={handleDropOnCanvas}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Báo cáo · {timePeriod}</h3>
              <span className="text-xs text-muted-foreground">{canvasBlocks.length} block</span>
            </div>

            {canvasBlocks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <LayoutTemplate className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Kéo block từ thư viện vào đây</p>
                <p className="text-xs text-muted-foreground mt-1">hoặc chọn mẫu nhanh từ thanh công cụ</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {canvasBlocks.map((block, idx) => {
                const Icon       = block.icon;
                const previewCls = BLOCK_PREVIEW[block.type];
                const kpiData    = kpi[block.id];

                return (
                  <div key={block.id} draggable
                    onDragStart={() => handleCanvasDragStart(idx)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.stopPropagation();
                      if (draggingId) {
                        const lib = AVAILABLE_BLOCKS.find(b => b.id === draggingId);
                        if (lib) insertBlockAt(lib, idx);
                        setDraggingId(null);
                      } else {
                        handleCanvasDrop(idx);
                      }
                    }}
                    className={`relative border rounded-xl p-4 ${previewCls} group cursor-grab active:cursor-grabbing`}
                  >
                    {/* Remove */}
                    <button onClick={() => removeBlock(block.id)}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/80 border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-300">
                      <X className="w-3 h-3 text-gray-500 hover:text-red-500" />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2 pr-5">
                      <GripVertical className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
                      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: block.color + "20" }}>
                        <Icon className="w-3.5 h-3.5" style={{ color: block.color }} />
                      </div>
                      <span className="text-xs font-semibold leading-tight">{block.title}</span>
                    </div>

                    {/* Content */}
                    {block.type === "kpi" && kpiData && (
                      <div>
                        <div className="text-2xl font-bold" style={{ color: block.color }}>{kpiData.value}</div>
                        <div className="text-[11px] text-muted-foreground">{kpiData.unit}</div>
                      </div>
                    )}

                    {block.type === "bar" && (
                      <div className="space-y-1.5">
                        {getDistrictData(timeRange).slice(0, 4).map((d, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="text-[10px] w-20 text-muted-foreground truncate">{d.name}</div>
                            <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${d.pct}%`, background: block.color }} />
                            </div>
                            <div className="text-[10px] text-muted-foreground w-7 text-right">{d.pct}%</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {block.type === "table" && (() => {
                      const rows = block.id === "b4" ? NON_COMPLIANT : TOP_SCHOOLS.map(s => ({ name: s.name, district: s.district, pct: s.tt38 }));
                      return (
                        <div className="text-[10px] text-muted-foreground space-y-0.5">
                          <div className="flex gap-2 font-medium border-b border-white/60 pb-0.5">
                            <span className="flex-1">Trường</span><span>TT38</span>
                          </div>
                          {rows.slice(0, 3).map((r, i) => (
                            <div key={i} className="flex gap-2">
                              <span className="flex-1 truncate">{r.name}</span>
                              <span className={`font-medium ${block.id === "b4" ? "text-red-500" : "text-green-600"}`}>
                                {"pct" in r ? r.pct : (r as typeof TOP_SCHOOLS[0]).tt38}%
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {block.type === "pie"   && <MiniPieChart color={block.color} timeRange={timeRange} />}
                    {block.type === "trend" && <MiniSparkline color={block.color} timeRange={timeRange} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fix 3: Visual preview */}
          {showPreview && canvasBlocks.length > 0 && (
            <ReportPreview
              blocks={canvasBlocks}
              timeRange={timeRange}
              periodLabel={timePeriod}
              kpi={kpi}
              onClose={() => setShowPreview(false)}
            />
          )}

          {/* Báo cáo đã lưu */}
          {savedConfigs.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setShowSaved(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" style={{ color: ACCENT }} />
                  Báo cáo đã lưu
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {savedConfigs.length}
                  </span>
                </div>
                {showSaved ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {showSaved && (
                <div className="border-t border-border divide-y divide-border">
                  {savedConfigs.map(cfg => (
                    <div key={cfg.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{cfg.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {cfg.blockIds.length} block · {cfg.periodLabel ?? TIME_LABELS[cfg.timeRange]} ·{" "}
                          {new Date(cfg.savedAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                      <button onClick={() => loadConfig(cfg)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-border hover:border-purple-400 hover:text-purple-700 transition-colors">
                        Tải
                      </button>
                      <button
                        onClick={() => saveConfigAsTemplate(cfg)}
                        title="Lưu thành mẫu nhanh"
                        className="p-1 rounded-lg hover:bg-amber-50 hover:text-amber-500 transition-colors text-muted-foreground">
                        <Star className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteConfig(cfg.id)}
                        className="p-1 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors text-muted-foreground">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
