import { useState, useEffect, useMemo } from "react";
import { geoPath, geoIdentity } from "d3-geo";
import type { GeoPermissibleObjects } from "d3-geo";

/* ------------------------------------------------------------------ */
/*  Vietnam Province Choropleth — D3 geoIdentity + Highcharts GeoJSON  */
/* ------------------------------------------------------------------ */

const GEO_URL = "/vn-provinces.json";

// Map GeoJSON tên cũ (63 tỉnh) → tên tỉnh mới (34 tỉnh, hiệu lực 12/6/2025)
const GEO_TO_NEW: Record<string, string> = {
  // Miền Bắc
  "Hà Giang":          "Tuyên Quang",   // sáp nhập vào Tuyên Quang
  "Tuyên Quang":       "Tuyên Quang",
  "Cao Bằng":          "Cao Bằng",
  "Lai Chau":          "Lai Châu",
  "Lào Cai":           "Lào Cai",
  "Yên Bái":           "Lào Cai",       // sáp nhập vào Lào Cai
  "Bắc Kạn":           "Thái Nguyên",   // sáp nhập vào Thái Nguyên
  "Thái Nguyên":       "Thái Nguyên",
  "Điện Biên":         "Điện Biên",
  "Son La":            "Sơn La",
  "Lạng Sơn":          "Lạng Sơn",
  "Bắc Giang":         "Bắc Ninh",      // sáp nhập vào Bắc Ninh
  "Bắc Ninh":          "Bắc Ninh",
  "Quảng Ninh":        "Quảng Ninh",
  "Ha Noi":            "Hà Nội",
  "Haiphong":          "Hải Phòng",
  "Hải Dương":         "Hải Phòng",     // sáp nhập vào Hải Phòng
  "Hung Yen":          "Hưng Yên",
  "Thái Bình":         "Hưng Yên",      // sáp nhập vào Hưng Yên
  "Hòa Bình":          "Phú Thọ",       // sáp nhập vào Phú Thọ
  "Vĩnh Phúc":         "Phú Thọ",       // sáp nhập vào Phú Thọ
  "Phú Thọ":           "Phú Thọ",
  "Hà Nam":            "Ninh Bình",     // sáp nhập vào Ninh Bình
  "Ninh Bình":         "Ninh Bình",
  "Nam Định":          "Ninh Bình",     // sáp nhập vào Ninh Bình
  // Miền Trung
  "Thanh Hóa":         "Thanh Hóa",
  "Nghệ An":           "Nghệ An",
  "Ha Tinh":           "Hà Tĩnh",
  "Quảng Bình":        "Quảng Trị",     // sáp nhập vào Quảng Trị
  "Quảng Trị":         "Quảng Trị",
  "Huế":               "Huế",
  "Quàng Nam":         "Đà Nẵng",       // sáp nhập vào Đà Nẵng
  "Da Nang":           "Đà Nẵng",
  "Kon Tum":           "Quảng Ngãi",    // sáp nhập vào Quảng Ngãi
  "Quảng Ngãi":        "Quảng Ngãi",
  "Bình Định":         "Gia Lai",       // sáp nhập vào Gia Lai
  "Gia Lai":           "Gia Lai",
  "Phú Yên":           "Đắk Lắk",      // sáp nhập vào Đắk Lắk
  "Dak Lak":           "Đắk Lắk",
  "Khánh Hòa":         "Khánh Hòa",
  "Ninh Thuận":        "Khánh Hòa",    // sáp nhập vào Khánh Hòa
  "Đăk Nông":          "Lâm Đồng",     // sáp nhập vào Lâm Đồng
  "Lâm Đồng":          "Lâm Đồng",
  "Bình Thuận":        "Lâm Đồng",     // sáp nhập vào Lâm Đồng
  // Miền Nam
  "Bình Phước":        "Đồng Nai",     // sáp nhập vào Đồng Nai
  "Southeast":         "Đồng Nai",     // Đồng Nai trong GeoJSON
  "Long An":           "Tây Ninh",     // sáp nhập vào Tây Ninh
  "Tây Ninh":          "Tây Ninh",
  "Bình Dương":        "TP. Hồ Chí Minh",
  "Hồ Chí Minh city": "TP. Hồ Chí Minh",
  "Bà Rịa-Vũng Tàu":  "TP. Hồ Chí Minh",
  "Tiền Giang":        "Đồng Tháp",    // sáp nhập vào Đồng Tháp
  "Đồng Tháp":         "Đồng Tháp",
  "Kiên Giang":        "An Giang",     // sáp nhập vào An Giang
  "An Giang":          "An Giang",
  "Bến Tre":           "Vĩnh Long",    // sáp nhập vào Vĩnh Long
  "Vĩnh Long":         "Vĩnh Long",
  "Trà Vinh":          "Vĩnh Long",    // sáp nhập vào Vĩnh Long
  "Hau Giang":         "Cần Thơ",      // sáp nhập vào Cần Thơ
  "Can Tho":           "Cần Thơ",
  "Sóc Trăng":         "Cần Thơ",      // sáp nhập vào Cần Thơ (tên GeoJSON đúng)
  "Bắc Liêu":          "Cà Mau",       // Bạc Liêu (GeoJSON viết sai) → Cà Mau
  "Cà Mau":            "Cà Mau",
};

function normalizeName(raw: string): string {
  return GEO_TO_NEW[raw] ?? raw;
}

export interface ProvinceData {
  name: string;
  coverage: number;
  score: number;
}

interface VietnamChoroplethProps {
  data: ProvinceData[];
  selectedProvince: string;
  onSelectProvince: (name: string) => void;
}

function coverageFill(pct: number, selected: boolean, hovered: boolean): string {
  if (selected) return "#7c3aed";
  const base = pct >= 80 ? "#15803d"
    : pct >= 65 ? "#16a34a"
    : pct >= 55 ? "#4d7c0f"
    : pct >= 45 ? "#ca8a04"
    : pct >= 35 ? "#d97706"
    : "#dc2626";
  return hovered ? base + "cc" : base;
}

interface TooltipState {
  x: number; y: number;
  name: string; coverage: number; score: number;
}

const W = 340;
const H = 560;

interface GeoFeature {
  type: string;
  properties: Record<string, string>;
  geometry: GeoPermissibleObjects;
}

export function VietnamChoropleth({ data, selectedProvince, onSelectProvince }: VietnamChoroplethProps) {
  const [geojson, setGeojson]     = useState<{ features: GeoFeature[] } | null>(null);
  const [tooltip, setTooltip]     = useState<TooltipState | null>(null);
  const [hoveredName, setHovered] = useState<string | null>(null);

  useEffect(() => {
    fetch(GEO_URL)
      .then(r => r.json())
      .then(setGeojson)
      .catch(console.error);
  }, []);

  const dataMap = useMemo(
    () => new Map<string, ProvinceData>(data.map(d => [d.name, d])),
    [data]
  );

  const { pathFn } = useMemo(() => {
    if (!geojson) return { pathFn: null };
    const projection = geoIdentity()
      .reflectY(true)  // Highcharts Y axis is inverted vs SVG
      .fitSize([W, H], geojson as Parameters<typeof geoIdentity.prototype.fitSize>[1]);
    return { pathFn: geoPath(projection) };
  }, [geojson]);

  const above70    = data.filter(d => d.coverage >= 70).length;
  const below35    = data.filter(d => d.coverage < 35).length;
  const avgCoverage = Math.round(data.reduce((s, d) => s + d.coverage, 0) / data.length);

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 600 }}>
            Heatmap Bao phủ STEM — 63 Tỉnh/Thành phố
          </h3>
          <p className="text-muted-foreground mt-0.5" style={{ fontSize: "11px" }}>
            Click vào tỉnh để lọc toàn bộ dashboard theo tỉnh đó
          </p>
        </div>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground items-end">
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#15803d" }} />≥ 80% ({above70} tỉnh)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#4d7c0f" }} />55–79%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#ca8a04" }} />35–54%
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "#dc2626" }} />
              {"< 35%"} ({below35} tỉnh)
            </span>
          </div>
          <div>TB toàn quốc: <strong className="text-foreground">{avgCoverage}%</strong></div>
        </div>
      </div>

      {/* Map */}
      <div className="flex justify-center relative">
        {!geojson || !pathFn ? (
          <div className="flex items-center justify-center" style={{ width: W, height: H }}>
            <p className="text-muted-foreground" style={{ fontSize: "13px" }}>Đang tải bản đồ...</p>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: "100%", maxWidth: W + 80, height: "auto" }}
          >
            {geojson.features.map((feature, i) => {
              const rawName  = feature.properties.name;
              const vnName   = normalizeName(rawName);
              const pd       = dataMap.get(vnName);
              const isSelected = selectedProvince === vnName;
              const isHovered  = hoveredName === vnName;
              const fill = pd
                ? coverageFill(pd.coverage, isSelected, isHovered)
                : (isSelected ? "#7c3aed" : "#9ca3af");
              const d = pathFn(feature.geometry as GeoPermissibleObjects);
              if (!d) return null;
              return (
                <path
                  key={i}
                  d={d}
                  fill={fill}
                  stroke={isSelected ? "#7c3aed" : "#ffffff"}
                  strokeWidth={isSelected ? 1.5 : 0.4}
                  style={{ cursor: "pointer", transition: "fill 0.15s, opacity 0.15s", outline: "none" }}
                  opacity={isHovered && !isSelected ? 0.75 : 1}
                  onClick={() => onSelectProvince(isSelected ? "all" : vnName)}
                  onMouseEnter={(e) => {
                    setHovered(vnName);
                    if (pd) setTooltip({ x: e.clientX, y: e.clientY, name: vnName, coverage: pd.coverage, score: pd.score });
                  }}
                  onMouseMove={(e) => {
                    if (pd) setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null);
                  }}
                  onMouseLeave={() => { setHovered(null); setTooltip(null); }}
                />
              );
            })}
          </svg>
        )}

        {/* Tooltip */}
        {tooltip && (
          <div className="fixed z-50 pointer-events-none"
            style={{ left: tooltip.x + 12, top: tooltip.y - 10, transform: "translateY(-25%)" }}>
            <div className="bg-gray-900 text-white rounded-xl px-3 py-2.5 shadow-2xl border border-white/10"
              style={{ fontSize: "12px", minWidth: 170 }}>
              <div className="font-semibold mb-1.5">{tooltip.name}</div>
              <div className="space-y-0.5">
                <div className="flex justify-between gap-6">
                  <span className="text-gray-400">Bao phủ STEM</span>
                  <span className="font-bold" style={{ color: coverageFill(tooltip.coverage, false, false) }}>
                    {tooltip.coverage}%
                  </span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-gray-400">Điểm TB</span>
                  <span className="font-bold text-white">{tooltip.score.toFixed(1)}</span>
                </div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-white/10 text-[10px] text-gray-500">
                Click để lọc dashboard theo tỉnh
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gradient legend */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Thấp</span>
        <div className="flex-1 h-2 rounded-full" style={{
          background: "linear-gradient(to right, #dc2626, #d97706, #ca8a04, #4d7c0f, #16a34a, #15803d)"
        }} />
        <span className="text-[10px] text-muted-foreground">Cao</span>
      </div>
    </div>
  );
}
