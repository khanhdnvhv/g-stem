import type { ReactNode } from "react";
import { cn } from "../../ui/utils";

interface StatCardProps {
  value: string;
  unit?: string;
  label: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ value, unit, label, icon, className }: StatCardProps) {
  return (
    <div className={cn("text-center", className)}>
      {icon && (
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
      )}
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-4xl lg:text-5xl font-bold text-primary tracking-tight">{value}</span>
        {unit && <span className="text-2xl font-semibold text-primary/70">{unit}</span>}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
