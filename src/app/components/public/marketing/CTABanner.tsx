import type { ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";

interface CTABannerProps {
  title: ReactNode;
  description?: ReactNode;
  primaryAction: { label: string; to: string };
  secondaryAction?: { label: string; to: string };
  variant?: "primary" | "accent" | "dark";
  className?: string;
}

const VARIANT_CLASS = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-sidebar-primary-foreground",
  dark: "bg-sidebar text-sidebar-foreground",
};

export function CTABanner({
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = "primary",
  className,
}: CTABannerProps) {
  return (
    <section className={cn("py-16 lg:py-20", className)}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            "rounded-2xl p-8 md:p-12 lg:p-16 text-center relative overflow-hidden",
            VARIANT_CLASS[variant]
          )}
        >
          {/* Decorative pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, currentColor 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-4 text-base md:text-lg opacity-90 leading-relaxed">{description}</p>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                size="lg"
                className={cn(
                  "h-12 px-6 text-base",
                  variant === "primary" && "bg-accent text-sidebar-primary-foreground hover:bg-accent/90",
                  variant === "accent" && "bg-primary text-primary-foreground hover:bg-primary/90",
                  variant === "dark" && "bg-accent text-sidebar-primary-foreground hover:bg-accent/90"
                )}
              >
                <Link to={primaryAction.to}>{primaryAction.label}</Link>
              </Button>
              {secondaryAction && (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base bg-transparent border-current hover:bg-white/10"
                >
                  <Link to={secondaryAction.to}>{secondaryAction.label}</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
