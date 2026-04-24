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

/**
 * KPI card tái sử dụng xuyên suốt STEM Platform.
 */
export function KpiCard({
  label, value, change, trend, icon: Icon,
  color = "#990803", onClick, subtitle,
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
              trend === "up" ? "bg-green-50 text-green-600"
              : trend === "down" ? "bg-red-50 text-red-500"
              : "bg-gray-50 text-gray-500"
            }`}
            style={{ fontSize: "12px", fontWeight: 500 }}
          >
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : null}
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
          <p className="text-muted-foreground/70 mt-0.5" style={{ fontSize: "11px" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
