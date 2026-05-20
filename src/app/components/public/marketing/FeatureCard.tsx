import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { cn } from "../../ui/utils";

interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  link?: { label: string; to: string };
  badge?: string;
  variant?: "default" | "elevated" | "outline";
  className?: string;
}

const VARIANT_CLASS = {
  default: "bg-card border border-border",
  elevated: "bg-card border border-border shadow-md hover:shadow-xl",
  outline: "border-2 border-primary/20 bg-card",
};

export function FeatureCard({
  icon,
  title,
  description,
  link,
  badge,
  variant = "elevated",
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-6 lg:p-8 transition-all hover:-translate-y-1 group",
        VARIANT_CLASS[variant],
        className
      )}
    >
      {badge && (
        <div className="mb-4">
          <span className="inline-block px-2.5 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-semibold uppercase tracking-wider">
            {badge}
          </span>
        </div>
      )}
      {icon && (
        <div className="w-12 h-12 mb-5 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-foreground mb-3 leading-snug">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      {link && (
        <Link
          to={link.to}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2 transition-all"
        >
          {link.label}
          <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
