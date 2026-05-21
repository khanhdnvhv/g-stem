/**
 * authority-ui.tsx — UI primitives dùng riêng cho module Cơ quan Quản lý.
 * File này hoàn toàn độc lập, không import từ bất kỳ file dùng chung nào.
 */
import {
  useState, useRef, useEffect, useMemo, useCallback, createContext, useContext,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, ChevronDown, Check, Search, AlertTriangle, Trash2, X, Info } from "lucide-react";

/* ================================================================ */
/*  FORMAT UTILITIES                                                  */
/* ================================================================ */

/** Format số tiền VND rút gọn: 1_250_000_000 → "1,25 tỷ" */
export function formatVNDCompact(amount: number): string {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "") + " tỷ";
  if (amount >= 1_000_000)     return (amount / 1_000_000).toFixed(1).replace(/\.?0+$/, "") + " triệu";
  if (amount >= 1_000)         return (amount / 1_000).toFixed(0) + "k";
  return amount.toString();
}

/** Format số lớn: 2_150_000 → "2,15 triệu" */
export function formatNumberCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + " triệu";
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.?0+$/, "") + "k";
  return n.toString();
}

/** Format giờ ngày: "14:32 — 24/04" */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${hh}:${mi} — ${dd}/${mm}`;
}

/** Format ngày tương đối: "Hôm nay 14:32", "Hôm qua", "3 ngày trước" */
export function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffD  = Math.floor(diffMs / 86400000);
  if (diffD === 0) {
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `Hôm nay ${hh}:${mi}`;
  }
  if (diffD === 1)   return "Hôm qua";
  if (diffD < 0)     return `Còn ${Math.abs(diffD)} ngày`;
  if (diffD < 30)    return `${diffD} ngày trước`;
  if (diffD < 365)   return `${Math.floor(diffD / 30)} tháng trước`;
  return `${Math.floor(diffD / 365)} năm trước`;
}

/** Format ngày ngắn: "24/04/2026" */
export function formatDate(iso: string): string {
  const d  = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/* ================================================================ */
/*  PAGE HEADER                                                       */
/* ================================================================ */

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  accentColor?: string;
}

export function PageHeader({
  icon: Icon, title, subtitle, badge, actions, accentColor = "#7c3aed",
}: PageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-4 border-b border-border">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: accentColor + "15" }}>
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>{title}</h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "13px" }}>{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

/* ================================================================ */
/*  KPI CARD                                                          */
/* ================================================================ */

export interface KpiCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "flat";
  icon: LucideIcon;
  color?: string;
  onClick?: () => void;
  subtitle?: string;
}

export function KpiCard({
  label, value, change, trend, icon: Icon,
  color = "#7c3aed", onClick, subtitle,
}: KpiCardProps) {
  const bg = color + "10";
  const isClickable = !!onClick;
  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-xl border border-border p-5 transition-all duration-200 ${
        isClickable ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
              trend === "up"   ? "bg-green-50 text-green-600"
              : trend === "down" ? "bg-red-50 text-red-500"
              : "bg-gray-50 text-gray-500"
            }`}
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            {trend === "up"   ? <TrendingUp className="w-3 h-3" />   : null}
            {trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
            {change}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-foreground" style={{ fontSize: "26px", fontWeight: 700, lineHeight: 1.2 }}>
          {value}
        </p>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "13px" }}>{label}</p>
        {subtitle && (
          <p className="text-muted-foreground/70 mt-0.5" style={{ fontSize: "11px" }}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/* ================================================================ */
/*  SELECT DOWN                                                       */
/* ================================================================ */

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectDownProps {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  label?: string;
}

export function SelectDown({
  value, onChange, options, className = "", disabled = false, searchable, label,
}: SelectDownProps) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const ref      = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSearchable = searchable ?? options.length > 6;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && isSearchable) setTimeout(() => inputRef.current?.focus(), 40);
    if (!open) setQuery("");
  }, [open, isSearchable]);

  const filtered = useMemo(
    () => isSearchable && query
      ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
      : options,
    [options, query, isSearchable]
  );

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border bg-card focus:outline-none transition-colors
          ${disabled ? "opacity-40 cursor-not-allowed" : "hover:border-violet-400"}`}
        style={{ fontSize: "12px" }}
      >
        {label && <span className="text-muted-foreground shrink-0">{label}:</span>}
        <span className="text-foreground font-medium truncate max-w-[140px]">{selected?.label ?? "—"}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !disabled && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-card border border-border rounded-xl shadow-lg flex flex-col"
          style={{ minWidth: "200px", maxWidth: "280px", maxHeight: "280px" }}>
          {isSearchable && (
            <div className="px-2 pt-2 pb-1.5 border-b border-border shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-400"
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-muted-foreground text-center">Không tìm thấy</p>
            ) : filtered.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                className="w-full flex items-center justify-between px-3 py-1.5 text-sm hover:bg-muted transition-colors text-left gap-2"
              >
                <span className="truncate" style={o.value === value ? { fontWeight: 600 } : {}}>{o.label}</span>
                {o.value === value && <Check className="w-3.5 h-3.5 text-violet-600 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================ */
/*  DATA QUALITY BADGE — Đúng · Đủ · Sạch · Sống                    */
/* ================================================================ */

const DQ_ITEMS = [
  { key: "dung" as const, label: "Đúng", color: "#16a34a", darkColor: "#22c55e" },
  { key: "du"   as const, label: "Đủ",   color: "#0891b2", darkColor: "#22d3ee" },
  { key: "sach" as const, label: "Sạch", color: "#7c3aed", darkColor: "#a78bfa" },
  { key: "song" as const, label: "Sống", color: "#f59e0b", darkColor: "#fbbf24" },
];

export function DataQualityBadge({
  quality4D,
  size = "sm",
}: {
  quality4D: { dung: boolean; du: boolean; sach: boolean; song: boolean };
  size?: "xs" | "sm" | "md";
}) {
  const fs = size === "xs" ? 9 : 10;
  return (
    <div className="inline-flex items-center gap-1">
      {DQ_ITEMS.map((it) => (
        <span
          key={it.key}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded"
          style={{
            fontSize: `${fs}px`,
            fontWeight: 600,
            color:           quality4D[it.key] ? it.color : "var(--muted-foreground)",
            backgroundColor: quality4D[it.key] ? it.color + "1a"   : "var(--secondary)",
            border: `1px solid ${quality4D[it.key] ? it.color : "transparent"}`,
            opacity: quality4D[it.key] ? 1 : 0.5,
          }}
        >
          {quality4D[it.key] ? "✓" : "○"} {it.label}
        </span>
      ))}
    </div>
  );
}

/* ================================================================ */
/*  AUTH HOOK — delegate to main project's AuthContext               */
/* ================================================================ */
export { useAuth } from "../../AuthContext";

/* ================================================================ */
/*  CONFIRM DIALOG                                                   */
/* ================================================================ */

type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  requireTyping?: string;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}

const VARIANT_CFG: Record<ConfirmVariant, { icon: typeof Trash2; iconColor: string; iconBg: string; btnColor: string; btnHover: string }> = {
  danger:  { icon: Trash2,         iconColor: "#dc2626", iconBg: "#fef2f2", btnColor: "#dc2626", btnHover: "#b91c1c" },
  warning: { icon: AlertTriangle,  iconColor: "#d97706", iconBg: "#fffbeb", btnColor: "#d97706", btnHover: "#b45309" },
  info:    { icon: Info,           iconColor: "#2563eb", iconBg: "#eff6ff", btnColor: "#2563eb", btnHover: "#1d4ed8" },
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);
  const [typingValue, setTypingValue] = useState("");

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
      setTypingValue("");
    });
  }, []);

  const handleClose = (confirmed: boolean) => {
    state?.resolve(confirmed);
    setState(null);
    setTypingValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") handleClose(false);
    if (e.key === "Enter" && !state?.requireTyping) handleClose(true);
    if (e.key === "Enter" && state?.requireTyping && typingValue === state.requireTyping) handleClose(true);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => handleClose(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => handleClose(false)} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="p-6">
              {(() => {
                const v = VARIANT_CFG[state.variant || "danger"];
                const VIcon = v.icon;
                return (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: v.iconBg }}>
                    <VIcon className="w-6 h-6" style={{ color: v.iconColor }} />
                  </div>
                );
              })()}
              <h3 className="text-center text-gray-900 mb-2" style={{ fontSize: "16px", fontWeight: 700 }}>{state.title}</h3>
              <p className="text-center text-gray-500 mb-4" style={{ fontSize: "13px", lineHeight: "1.6" }}>{state.message}</p>
              {state.requireTyping && (
                <div className="mb-4">
                  <p className="text-gray-500 mb-1.5" style={{ fontSize: "11px" }}>
                    Nhập <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-red-600" style={{ fontWeight: 600 }}>{state.requireTyping}</span> để xác nhận:
                  </p>
                  <input
                    autoFocus
                    value={typingValue}
                    onChange={e => setTypingValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                    style={{ fontSize: "13px" }}
                    placeholder={state.requireTyping}
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  style={{ fontSize: "13px", fontWeight: 500 }}
                >
                  {state.cancelLabel || "Hủy"}
                </button>
                <button
                  autoFocus={!state.requireTyping}
                  onClick={() => handleClose(true)}
                  disabled={!!state.requireTyping && typingValue !== state.requireTyping}
                  className="flex-1 px-4 py-2.5 text-white rounded-xl cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    backgroundColor: VARIANT_CFG[state.variant || "danger"].btnColor,
                  }}
                  onMouseEnter={e => {
                    if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = VARIANT_CFG[state.variant || "danger"].btnHover;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = VARIANT_CFG[state.variant || "danger"].btnColor;
                  }}
                >
                  {state.confirmLabel || "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
