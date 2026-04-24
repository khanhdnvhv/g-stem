import { useState } from "react";
import {
  Palette, Eye, Save, Settings, Monitor, Smartphone,
  Upload, Type, Image, Sun, Moon, Check, Copy,
  RefreshCw, Download, Building2, Globe, Lock,
  ChevronRight, Layers, Zap, Shield, Star,
  SquareStack, Layout, PaintBucket, Maximize2,
} from "lucide-react";
import { useAuth } from "./AuthContext";

// ─── Types ───
interface TenantBrand {
  id: string;
  tenantName: string;
  shortName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  loginBg: string;
  darkMode: boolean;
  customCss: boolean;
  favicon: string;
  headerStyle: "default" | "compact" | "branded";
  sidebarStyle: "dark" | "light" | "branded";
  lastUpdated: string;
  status: "active" | "draft" | "syncing";
}

interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  preview: string;
  usage: number;
}

// ─── Mock Data ───
const TENANT_BRANDS: TenantBrand[] = [
  { id: "TB01", tenantName: "Tập đoàn Geleximco", shortName: "VP Tập đoàn", logo: "🏢", primaryColor: "#990803", secondaryColor: "#c8a84e", accentColor: "#1a1a2e", fontFamily: "Inter", loginBg: "gradient", darkMode: true, customCss: true, favicon: "🏢", headerStyle: "branded", sidebarStyle: "dark", lastUpdated: "12/03/2026", status: "active" },
  { id: "TB02", tenantName: "ABBank", shortName: "ABBank", logo: "🏦", primaryColor: "#00529B", secondaryColor: "#e8f0fe", accentColor: "#ff6b00", fontFamily: "Roboto", loginBg: "image", darkMode: false, customCss: true, favicon: "🏦", headerStyle: "compact", sidebarStyle: "light", lastUpdated: "11/03/2026", status: "active" },
  { id: "TB03", tenantName: "BĐS KĐT", shortName: "BĐS KĐT", logo: "🏘️", primaryColor: "#2d5016", secondaryColor: "#e8f5e9", accentColor: "#ff9800", fontFamily: "Inter", loginBg: "gradient", darkMode: false, customCss: false, favicon: "🏘️", headerStyle: "default", sidebarStyle: "light", lastUpdated: "10/03/2026", status: "active" },
  { id: "TB04", tenantName: "Xi măng TL", shortName: "Xi măng TL", logo: "🏭", primaryColor: "#4a5568", secondaryColor: "#edf2f7", accentColor: "#e53e3e", fontFamily: "Inter", loginBg: "solid", darkMode: false, customCss: false, favicon: "🏭", headerStyle: "default", sidebarStyle: "dark", lastUpdated: "09/03/2026", status: "active" },
  { id: "TB05", tenantName: "Thủy điện XM", shortName: "Thủy điện", logo: "⚡", primaryColor: "#1a56db", secondaryColor: "#dbeafe", accentColor: "#059669", fontFamily: "Inter", loginBg: "gradient", darkMode: false, customCss: false, favicon: "⚡", headerStyle: "default", sidebarStyle: "light", lastUpdated: "08/03/2026", status: "active" },
  { id: "TB06", tenantName: "Hanel", shortName: "Hanel", logo: "💻", primaryColor: "#7c2d12", secondaryColor: "#fff7ed", accentColor: "#0ea5e9", fontFamily: "SF Pro", loginBg: "image", darkMode: true, customCss: true, favicon: "💻", headerStyle: "branded", sidebarStyle: "branded", lastUpdated: "11/03/2026", status: "active" },
  { id: "TB07", tenantName: "ABS", shortName: "ABS", logo: "📈", primaryColor: "#1e40af", secondaryColor: "#eff6ff", accentColor: "#d97706", fontFamily: "Roboto", loginBg: "gradient", darkMode: false, customCss: false, favicon: "📈", headerStyle: "compact", sidebarStyle: "light", lastUpdated: "07/03/2026", status: "active" },
  { id: "TB08", tenantName: "ABIC", shortName: "ABIC", logo: "🛡️", primaryColor: "#0369a1", secondaryColor: "#e0f2fe", accentColor: "#f59e0b", fontFamily: "Inter", loginBg: "solid", darkMode: false, customCss: false, favicon: "🛡️", headerStyle: "default", sidebarStyle: "light", lastUpdated: "06/03/2026", status: "active" },
  { id: "TB09", tenantName: "Giáo dục", shortName: "Giáo dục", logo: "🎓", primaryColor: "#7c3aed", secondaryColor: "#f5f3ff", accentColor: "#f43f5e", fontFamily: "Nunito", loginBg: "image", darkMode: true, customCss: true, favicon: "🎓", headerStyle: "branded", sidebarStyle: "branded", lastUpdated: "12/03/2026", status: "syncing" },
  { id: "TB10", tenantName: "Du lịch", shortName: "Du lịch", logo: "✈️", primaryColor: "#0d9488", secondaryColor: "#f0fdfa", accentColor: "#f97316", fontFamily: "Inter", loginBg: "gradient", darkMode: false, customCss: false, favicon: "✈️", headerStyle: "default", sidebarStyle: "light", lastUpdated: "—", status: "draft" },
];

const PRESETS: ThemePreset[] = [
  { id: "P01", name: "Geleximco Classic", primary: "#990803", secondary: "#c8a84e", accent: "#1a1a2e", preview: "🔴🟡", usage: 5 },
  { id: "P02", name: "Corporate Blue", primary: "#1e40af", secondary: "#dbeafe", accent: "#f59e0b", preview: "🔵🟡", usage: 3 },
  { id: "P03", name: "Nature Green", primary: "#166534", secondary: "#dcfce7", accent: "#ea580c", preview: "🟢🟠", usage: 2 },
  { id: "P04", name: "Tech Purple", primary: "#7c3aed", secondary: "#f5f3ff", accent: "#f43f5e", preview: "🟣🔴", usage: 2 },
  { id: "P05", name: "Finance Navy", primary: "#0c4a6e", secondary: "#e0f2fe", accent: "#d97706", preview: "🔵🟡", usage: 2 },
  { id: "P06", name: "Warm Earth", primary: "#78350f", secondary: "#fffbeb", accent: "#059669", preview: "🟤🟢", usage: 1 },
];

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  active: { label: "Đang dùng", color: "#16a34a" },
  draft: { label: "Nháp", color: "#c8a84e" },
  syncing: { label: "Đang đồng bộ", color: "#2563eb" },
};

export function WhiteLabelConfig() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"overview" | "editor" | "presets" | "preview">("overview");
  const [selectedBrand, setSelectedBrand] = useState<TenantBrand | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const activeBrands = TENANT_BRANDS.filter(b => b.status === "active").length;
  const customCssCount = TENANT_BRANDS.filter(b => b.customCss).length;
  const darkModeCount = TENANT_BRANDS.filter(b => b.darkMode).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-[#990803]" />
            <h1 style={{ fontSize: "22px", fontWeight: 700 }} className="text-gray-900">White-Label Configuration</h1>
          </div>
          <p className="text-gray-500 mt-0.5" style={{ fontSize: "13px" }}>
            Tùy biến branding, theme và giao diện cho từng đơn vị thành viên
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { import("sonner").then(m => m.toast.success("Đang xuất cấu hình tất cả đơn vị...")); }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <Download className="w-4 h-4" /> Export All
          </button>
          <button onClick={() => { import("sonner").then(m => m.toast.info("Đang đồng bộ theme tất cả đơn vị...")); }} className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] cursor-pointer" style={{ fontSize: "12px", fontWeight: 500 }}>
            <RefreshCw className="w-4 h-4" /> Đồng bộ tất cả
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Brands Active", value: `${activeBrands}/14`, icon: Palette, color: "#990803" },
          { label: "Custom CSS", value: customCssCount, icon: PaintBucket, color: "#7c3aed" },
          { label: "Dark Mode", value: darkModeCount, icon: Moon, color: "#1a1a2e" },
          { label: "Presets", value: PRESETS.length, icon: SquareStack, color: "#c8a84e" },
          { label: "Fonts", value: "4", icon: Type, color: "#2563eb" },
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
          { id: "overview", label: "Tổng quan", icon: Layers },
          { id: "editor", label: "Theme Editor", icon: Palette },
          { id: "presets", label: "Presets", icon: SquareStack },
          { id: "preview", label: "Preview", icon: Eye },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 whitespace-nowrap ${tab === t.id ? "border-[#990803] text-[#990803]" : "border-transparent text-gray-500 hover:text-gray-700"}`} style={{ fontSize: "13px", fontWeight: tab === t.id ? 600 : 400 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab brands={TENANT_BRANDS} onSelect={setSelectedBrand} />}
      {tab === "editor" && <EditorTab brands={TENANT_BRANDS} selectedBrand={selectedBrand} onSelect={setSelectedBrand} />}
      {tab === "presets" && <PresetsTab presets={PRESETS} />}
      {tab === "preview" && <PreviewTab brands={TENANT_BRANDS} device={previewDevice} setDevice={setPreviewDevice} />}
    </div>
  );
}

// ─── Overview Tab ───
function OverviewTab({ brands, onSelect }: { brands: TenantBrand[]; onSelect: (b: TenantBrand) => void }) {
  return (
    <div className="space-y-3">
      {/* Color Palette Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-gray-600 mb-3" style={{ fontSize: "13px", fontWeight: 600 }}>Palette các Đơn vị</h3>
        <svg width="100%" height="140" viewBox="0 0 700 140" preserveAspectRatio="xMidYMid meet">
          {brands.slice(0, 10).map((b, i) => {
            const x = 5 + i * 70;
            return (
              <g key={b.id}>
                {/* Primary color */}
                <rect x={x} y={5} width="60" height="35" rx="6" fill={b.primaryColor} />
                {/* Secondary color */}
                <rect x={x} y={44} width="28" height="22" rx="4" fill={b.secondaryColor} stroke="#e5e7eb" strokeWidth="0.5" />
                {/* Accent color */}
                <rect x={x + 32} y={44} width="28" height="22" rx="4" fill={b.accentColor} />
                {/* Logo + Name */}
                <text x={x + 30} y={80} textAnchor="middle" fill="#374151" style={{ fontSize: "7px", fontWeight: 600 }}>{b.logo} {b.shortName}</text>
                {/* Status dot */}
                <circle cx={x + 54} cy={12} r="3" fill={STATUS_CFG[b.status]?.color || "#9ca3af"} />
                {/* Font */}
                <text x={x + 30} y={92} textAnchor="middle" fill="#9ca3af" style={{ fontSize: "6px" }}>{b.fontFamily}</text>
                {/* Features */}
                <g>
                  {b.darkMode && <rect x={x} y={98} width="16" height="10" rx="3" fill="#1a1a2e" opacity="0.5" />}
                  {b.darkMode && <text x={x + 8} y={105} textAnchor="middle" fill="white" style={{ fontSize: "5px" }}>🌙</text>}
                  {b.customCss && <rect x={x + (b.darkMode ? 20 : 0)} y={98} width="16" height="10" rx="3" fill="#7c3aed" opacity="0.4" />}
                  {b.customCss && <text x={x + (b.darkMode ? 28 : 8)} y={105} textAnchor="middle" fill="white" style={{ fontSize: "5px" }}>CSS</text>}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Brands List */}
      <div className="space-y-2">
        {brands.map(b => {
          const stCfg = STATUS_CFG[b.status];
          return (
            <div key={b.id} onClick={() => onSelect(b)} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border-2" style={{ borderColor: b.primaryColor + "30", backgroundColor: b.primaryColor + "08" }}>
                  <span style={{ fontSize: "24px" }}>{b.logo}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h4 className="text-gray-800" style={{ fontSize: "13px", fontWeight: 600 }}>{b.tenantName}</h4>
                    <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "9px", fontWeight: 600, color: stCfg.color, backgroundColor: stCfg.color + "10" }}>{stCfg.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 flex-wrap" style={{ fontSize: "10px" }}>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: b.primaryColor }} />
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: b.secondaryColor, border: "1px solid #e5e7eb" }} />
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: b.accentColor }} />
                    </span>
                    <span>🔤 {b.fontFamily}</span>
                    <span>Header: {b.headerStyle}</span>
                    <span>Sidebar: {b.sidebarStyle}</span>
                    {b.darkMode && <span>🌙 Dark</span>}
                    {b.customCss && <span>🎨 Custom CSS</span>}
                    <span>📅 {b.lastUpdated}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Theme Editor Tab ───
function EditorTab({ brands, selectedBrand, onSelect }: { brands: TenantBrand[]; selectedBrand: TenantBrand | null; onSelect: (b: TenantBrand) => void }) {
  const brand = selectedBrand || brands[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* Tenant Selector */}
      <div className="space-y-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h4 className="text-gray-600 mb-2" style={{ fontSize: "12px", fontWeight: 600 }}>Chọn Đơn vị</h4>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {brands.map(b => (
              <button key={b.id} onClick={() => onSelect(b)} className={`w-full flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${brand.id === b.id ? "bg-[#990803]/10 border border-[#990803]/20" : "hover:bg-gray-50"}`}>
                <span style={{ fontSize: "16px" }}>{b.logo}</span>
                <span className="text-gray-700 truncate text-left" style={{ fontSize: "11px", fontWeight: brand.id === b.id ? 600 : 400 }}>{b.shortName}</span>
                <div className="w-3 h-3 rounded ml-auto shrink-0" style={{ backgroundColor: b.primaryColor }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Controls */}
      <div className="lg:col-span-2 space-y-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700" style={{ fontSize: "14px", fontWeight: 600 }}>{brand.logo} {brand.tenantName}</h3>
            <button onClick={() => { import("sonner").then(m => m.toast.success(`Đã lưu cấu hình theme cho ${brand.tenantName}`)); }} className="flex items-center gap-1 px-3 py-1.5 bg-[#990803] text-white rounded-lg cursor-pointer" style={{ fontSize: "11px" }}>
              <Save className="w-3 h-3" /> Lưu
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Colors */}
            <div>
              <h4 className="text-gray-500 uppercase mb-2" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em" }}>Màu sắc</h4>
              <div className="space-y-2">
                {[
                  { label: "Primary", value: brand.primaryColor, key: "primaryColor" },
                  { label: "Secondary", value: brand.secondaryColor, key: "secondaryColor" },
                  { label: "Accent", value: brand.accentColor, key: "accentColor" },
                ].map(c => (
                  <div key={c.key} className="flex items-center gap-2">
                    <div onClick={() => { import("sonner").then(m => m.toast.info(`Mở color picker cho ${c.label}...`)); }} className="w-8 h-8 rounded-lg border border-gray-200 shrink-0 cursor-pointer" style={{ backgroundColor: c.value }} />
                    <div className="flex-1">
                      <p className="text-gray-500" style={{ fontSize: "10px" }}>{c.label}</p>
                      <p className="font-mono text-gray-700" style={{ fontSize: "11px" }}>{c.value}</p>
                    </div>
                    <button onClick={() => { import("sonner").then(m => m.toast.success("Đã sao chép giá trị vào clipboard!")); }} className="p-1 text-gray-300 hover:text-gray-500 cursor-pointer"><Copy className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <h4 className="text-gray-500 uppercase mb-2" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em" }}>Typography</h4>
              <div className="space-y-2">
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <p className="text-gray-400" style={{ fontSize: "10px" }}>Font Family</p>
                  <p className="text-gray-700" style={{ fontSize: "13px", fontWeight: 600, fontFamily: brand.fontFamily }}>{brand.fontFamily}</p>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <p className="text-gray-400 mb-1" style={{ fontSize: "10px" }}>Preview</p>
                  <p style={{ fontFamily: brand.fontFamily, fontSize: "18px", fontWeight: 700, color: brand.primaryColor }}>Geleximco LMS</p>
                  <p style={{ fontFamily: brand.fontFamily, fontSize: "12px", color: "#6b7280" }}>Hệ thống Quản lý Đào tạo</p>
                </div>
              </div>
            </div>

            {/* Layout */}
            <div>
              <h4 className="text-gray-500 uppercase mb-2" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em" }}>Layout</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-gray-500" style={{ fontSize: "11px" }}>Header Style</span>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600" style={{ fontSize: "11px" }}>{brand.headerStyle}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-gray-500" style={{ fontSize: "11px" }}>Sidebar Style</span>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600" style={{ fontSize: "11px" }}>{brand.sidebarStyle}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-gray-500" style={{ fontSize: "11px" }}>Login Background</span>
                  <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600" style={{ fontSize: "11px" }}>{brand.loginBg}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-gray-500 uppercase mb-2" style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em" }}>Tính năng</h4>
              <div className="space-y-2">
                {[
                  { label: "Dark Mode", enabled: brand.darkMode, icon: Moon },
                  { label: "Custom CSS", enabled: brand.customCss, icon: PaintBucket },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                    <span className="flex items-center gap-1.5 text-gray-500" style={{ fontSize: "11px" }}><f.icon className="w-3 h-3" /> {f.label}</span>
                    <div onClick={() => { import("sonner").then(m => m.toast.success(`Đã ${f.enabled ? "tắt" : "bật"} ${f.label}`)); }} className={`w-9 h-5 rounded-full cursor-pointer relative ${f.enabled ? "bg-[#16a34a]" : "bg-gray-200"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${f.enabled ? "left-[18px]" : "left-0.5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Color Preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-gray-600 mb-3" style={{ fontSize: "12px", fontWeight: 600 }}>Live Preview — Component Samples</h4>
          <div className="flex flex-wrap gap-3">
            {/* Button samples */}
            <button className="px-3 py-1.5 text-white rounded-lg" style={{ backgroundColor: brand.primaryColor, fontSize: "11px" }}>Primary Button</button>
            <button className="px-3 py-1.5 rounded-lg border" style={{ borderColor: brand.primaryColor, color: brand.primaryColor, fontSize: "11px" }}>Outlined</button>
            <button className="px-3 py-1.5 text-white rounded-lg" style={{ backgroundColor: brand.accentColor, fontSize: "11px" }}>Accent</button>
            <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: brand.secondaryColor, color: brand.primaryColor, fontSize: "10px", fontWeight: 600 }}>Badge</span>
            <div className="px-3 py-1.5 rounded-lg border" style={{ borderColor: brand.primaryColor + "30", backgroundColor: brand.primaryColor + "08" }}>
              <span style={{ color: brand.primaryColor, fontSize: "11px" }}>Card Style</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: "72%", backgroundColor: brand.primaryColor }} />
            </div>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: "9px" }}>Progress bar sample — 72%</p>
          </div>
          {/* Nav sample */}
          <div className="mt-3 flex items-center gap-1 p-1 bg-gray-50 rounded-lg">
            {["Tổng quan", "Khóa học", "Kiểm tra"].map((n, i) => (
              <span key={n} className={`px-2.5 py-1 rounded`} style={{
                fontSize: "10px",
                fontWeight: i === 0 ? 600 : 400,
                backgroundColor: i === 0 ? brand.primaryColor : "transparent",
                color: i === 0 ? "white" : "#6b7280",
              }}>{n}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Presets Tab ───
function PresetsTab({ presets }: { presets: ThemePreset[] }) {
  return (
    <div className="space-y-3">
      <p className="text-gray-500" style={{ fontSize: "12px" }}>Áp dụng preset theme nhanh cho các đơn vị</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {presets.map(p => (
          <div key={p.id} onClick={() => { import("sonner").then(m => m.toast.success(`Đã áp dụng preset "${p.name}"`)); }} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer">
            {/* Color preview */}
            <div className="flex items-center gap-1 mb-3">
              <div className="flex-1 h-12 rounded-l-lg" style={{ backgroundColor: p.primary }} />
              <div className="flex-1 h-12" style={{ backgroundColor: p.secondary }} />
              <div className="flex-1 h-12 rounded-r-lg" style={{ backgroundColor: p.accent }} />
            </div>
            <h4 className="text-gray-800 mb-0.5" style={{ fontSize: "13px", fontWeight: 600 }}>{p.name}</h4>
            <div className="flex items-center gap-2 text-gray-400" style={{ fontSize: "10px" }}>
              <span className="font-mono">{p.primary}</span>
              <span className="font-mono">{p.secondary}</span>
              <span className="font-mono">{p.accent}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-300" style={{ fontSize: "9px" }}>{p.usage} đơn vị đang dùng</span>
              <button className="px-2 py-0.5 rounded text-white cursor-pointer" style={{ fontSize: "9px", backgroundColor: p.primary }}>Áp dụng</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Preview Tab ───
function PreviewTab({ brands, device, setDevice }: { brands: TenantBrand[]; device: "desktop" | "mobile"; setDevice: (d: "desktop" | "mobile") => void }) {
  const [previewBrand, setPreviewBrand] = useState(brands[0]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <select value={previewBrand.id} onChange={e => setPreviewBrand(brands.find(b => b.id === e.target.value) || brands[0])} className="px-3 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer" style={{ fontSize: "12px" }}>
          {brands.map(b => <option key={b.id} value={b.id}>{b.logo} {b.shortName}</option>)}
        </select>
        <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg p-0.5">
          <button onClick={() => setDevice("desktop")} className={`p-1.5 rounded cursor-pointer ${device === "desktop" ? "bg-[#990803]/10 text-[#990803]" : "text-gray-400"}`}><Monitor className="w-4 h-4" /></button>
          <button onClick={() => setDevice("mobile")} className={`p-1.5 rounded cursor-pointer ${device === "mobile" ? "bg-[#990803]/10 text-[#990803]" : "text-gray-400"}`}><Smartphone className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden mx-auto ${device === "mobile" ? "max-w-sm" : ""}`}>
        {/* Simulated Header */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b" style={{ backgroundColor: previewBrand.primaryColor }}>
          <span style={{ fontSize: "18px" }}>{previewBrand.logo}</span>
          <div>
            <span className="text-white" style={{ fontSize: "13px", fontWeight: 700 }}>{previewBrand.shortName}</span>
            <span className="text-white/60 ml-2" style={{ fontSize: "10px" }}>LMS</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20" />
            <div className="w-6 h-6 rounded-full bg-white/20" />
          </div>
        </div>

        <div className="flex">
          {/* Simulated Sidebar (desktop only) */}
          {device === "desktop" && (
            <div className="w-48 border-r border-gray-200 py-2 px-2 space-y-0.5 shrink-0" style={{ backgroundColor: previewBrand.sidebarStyle === "dark" ? "#1a1a2e" : previewBrand.sidebarStyle === "branded" ? previewBrand.primaryColor + "10" : "#ffffff" }}>
              {["Tổng quan", "Khóa học", "Kiểm tra", "Chứng chỉ", "Thông báo"].map((item, i) => {
                const isActive = i === 0;
                const sidebarDark = previewBrand.sidebarStyle === "dark";
                return (
                  <div key={item} className="flex items-center gap-2 px-2.5 py-2 rounded-lg" style={{
                    backgroundColor: isActive ? previewBrand.primaryColor : "transparent",
                    color: isActive ? "white" : sidebarDark ? "#9ca3af" : "#6b7280",
                    fontSize: "11px",
                    fontWeight: isActive ? 600 : 400,
                  }}>
                    <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: isActive ? "rgba(255,255,255,0.3)" : sidebarDark ? "#374151" : "#e5e7eb" }} />
                    {item}
                  </div>
                );
              })}
            </div>
          )}

          {/* Simulated Content */}
          <div className="flex-1 p-4 min-h-[300px]" style={{ backgroundColor: previewBrand.secondaryColor }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: previewBrand.primaryColor }}>Xin chào, Nguyễn Văn A 👋</h2>
            <p className="mt-1 mb-3" style={{ fontSize: "11px", color: "#6b7280" }}>Tiếp tục học tập hôm nay</p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: "Khóa đang học", value: "5" },
                { label: "Hoàn thành", value: "12" },
                { label: "Chứng chỉ", value: "3" },
                { label: "Điểm TB", value: "8.5" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-lg p-2.5 shadow-sm">
                  <p style={{ fontSize: "18px", fontWeight: 700, color: previewBrand.primaryColor }}>{s.value}</p>
                  <p style={{ fontSize: "9px", color: "#9ca3af" }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#374151" }}>Kỹ năng Lãnh đạo 4.0</p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
                <div className="h-full rounded-full" style={{ width: "65%", backgroundColor: previewBrand.primaryColor }} />
              </div>
              <p className="text-right mt-0.5" style={{ fontSize: "9px", color: previewBrand.primaryColor }}>65%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}