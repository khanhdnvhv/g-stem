import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

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

type ColorScheme = "red" | "orange" | "purple" | "green" | "blue" | "yellow" | "cyan";

const schemes: Record<ColorScheme, {
  card: string; border: string; circle: string; icon: string; text: string;
  changeBg: string;
}> = {
  red:    { card: "from-white to-red-50",    border: "border-red-100",    circle: "bg-red-200/30",    icon: "from-red-500 to-red-600",       text: "text-red-600",    changeBg: "bg-red-50"    },
  orange: { card: "from-white to-orange-50", border: "border-orange-100", circle: "bg-orange-200/30", icon: "from-orange-500 to-orange-600", text: "text-orange-600", changeBg: "bg-orange-50" },
  purple: { card: "from-white to-purple-50", border: "border-purple-100", circle: "bg-purple-200/30", icon: "from-purple-500 to-purple-600", text: "text-purple-600", changeBg: "bg-purple-50" },
  green:  { card: "from-white to-green-50",  border: "border-green-100",  circle: "bg-green-200/30",  icon: "from-green-500 to-green-600",   text: "text-green-600",  changeBg: "bg-green-50"  },
  blue:   { card: "from-white to-blue-50",   border: "border-blue-100",   circle: "bg-blue-200/30",   icon: "from-blue-500 to-blue-600",     text: "text-blue-600",   changeBg: "bg-blue-50"   },
  yellow: { card: "from-white to-yellow-50", border: "border-yellow-100", circle: "bg-yellow-200/30", icon: "from-yellow-500 to-yellow-600", text: "text-yellow-600", changeBg: "bg-yellow-50" },
  cyan:   { card: "from-white to-cyan-50",   border: "border-cyan-100",   circle: "bg-cyan-200/30",   icon: "from-cyan-500 to-cyan-600",     text: "text-cyan-600",   changeBg: "bg-cyan-50"   },
};

const hexToScheme: Record<string, ColorScheme> = {
  "#990803": "red",   "#e74c3c": "red",   "#dc2626": "red",   "#ef4444": "red",
  "#f59e0b": "orange", "#f97316": "orange", "#ea580c": "orange",
  "#7c3aed": "purple", "#8b5cf6": "purple", "#6d28d9": "purple", "#9333ea": "purple",
  "#16a34a": "green",  "#22c55e": "green",  "#15803d": "green",  "#4ade80": "green",
  "#2563eb": "blue",   "#3b82f6": "blue",   "#1d4ed8": "blue",   "#0ea5e9": "blue",
  "#c8a84e": "yellow", "#eab308": "yellow", "#ca8a04": "yellow", "#f59e0b": "orange",
  "#0891b2": "cyan",   "#06b6d4": "cyan",   "#0e7490": "cyan",
};

function resolveScheme(color?: string): ColorScheme {
  if (!color) return "red";
  return hexToScheme[color.toLowerCase()] ?? "red";
}

export function KpiCard({
  label, value, change, trend, icon: Icon,
  color = "#990803", onClick, subtitle,
}: KpiCardProps) {
  const scheme = resolveScheme(color);
  const s = schemes[scheme];
  const isClickable = !!onClick;

  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-gradient-to-br ${s.card} border ${s.border} rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${isClickable ? "cursor-pointer" : ""}`}
    >
      {/* Animated background circle */}
      <div className={`absolute top-0 right-0 w-32 h-32 ${s.circle} rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`} />

      <div className="relative">
        {/* Icons row */}
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${s.icon} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>

          {change ? (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${s.changeBg} ${s.text}`} style={{ fontSize: "12px", fontWeight: 600 }}>
              <TrendIcon className="w-3 h-3" />
              {change}
            </div>
          ) : (
            <TrendIcon className={`w-5 h-5 ${s.text} opacity-40`} />
          )}
        </div>

        {/* Label */}
        <p className={`text-xs font-bold ${s.text} uppercase tracking-wider mb-1`}>{label}</p>

        {/* Value */}
        <p className="text-2xl font-bold text-gray-900">{value}</p>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
