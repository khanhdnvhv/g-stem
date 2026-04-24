import type { LucideIcon, ReactNode } from "react";

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  accentColor?: string;
}

/**
 * Header chuẩn cho mọi trang STEM Platform.
 */
export function PageHeader({
  icon: Icon, title, subtitle, badge, actions, accentColor = "#990803",
}: PageHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-4 border-b border-border">
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: accentColor + "15" }}
          >
            <Icon className="w-5 h-5" style={{ color: accentColor }} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-foreground" style={{ fontSize: "20px", fontWeight: 700 }}>
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: "13px" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
