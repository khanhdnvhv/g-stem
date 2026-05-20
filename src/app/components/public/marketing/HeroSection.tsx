import type { ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";

interface HeroAction {
  label: string;
  to: string;
  variant?: "default" | "outline" | "ghost";
}

interface HeroSectionProps {
  variant?: "split" | "centered";
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  imageUrl?: string;
  imageAlt?: string;
  trustBadges?: ReactNode;
  background?: "default" | "primary" | "tint";
  className?: string;
}

const BG_CLASS = {
  default: "bg-background",
  primary: "bg-primary text-primary-foreground",
  tint: "bg-gradient-to-br from-secondary via-background to-accent/5",
};

export function HeroSection({
  variant = "split",
  eyebrow,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  imageUrl,
  imageAlt = "",
  trustBadges,
  background = "tint",
  className,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24",
        BG_CLASS[background],
        className
      )}
    >
      {/* Decorative dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {variant === "split" ? (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <HeroContent
                eyebrow={eyebrow}
                title={title}
                subtitle={subtitle}
                primaryAction={primaryAction}
                secondaryAction={secondaryAction}
                trustBadges={trustBadges}
                align="left"
              />
            </div>
            {imageUrl && (
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/5 rounded-2xl rotate-2" />
                <div className="absolute -inset-4 bg-accent/5 rounded-2xl -rotate-1" />
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  className="relative rounded-xl shadow-2xl w-full h-auto object-cover aspect-[4/3]"
                />
              </div>
            )}
          </div>
        ) : (
          <HeroContent
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
            trustBadges={trustBadges}
            align="center"
          />
        )}
      </div>
    </section>
  );
}

function HeroContent({
  eyebrow,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  trustBadges,
  align,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  trustBadges?: ReactNode;
  align: "left" | "center";
}) {
  return (
    <div className={cn(align === "center" && "max-w-3xl mx-auto text-center")}>
      {eyebrow && (
        <div className={cn("mb-5 inline-flex", align === "center" && "mx-auto")}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {eyebrow}
          </span>
        </div>
      )}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className={cn("mt-8 flex flex-wrap gap-3", align === "center" && "justify-center")}>
          {primaryAction && (
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-base h-12 px-6"
            >
              <Link to={primaryAction.to}>{primaryAction.label}</Link>
            </Button>
          )}
          {secondaryAction && (
            <Button
              asChild
              size="lg"
              variant={secondaryAction.variant || "outline"}
              className="text-base h-12 px-6"
            >
              <Link to={secondaryAction.to}>{secondaryAction.label}</Link>
            </Button>
          )}
        </div>
      )}
      {trustBadges && <div className="mt-10">{trustBadges}</div>}
    </div>
  );
}
