import type { ReactNode } from "react";
import { cn } from "../../ui/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  background?: "default" | "muted" | "primary" | "dark";
  id?: string;
}

const BG_CLASS = {
  default: "bg-background",
  muted: "bg-secondary",
  primary: "bg-primary text-primary-foreground",
  dark: "bg-sidebar text-sidebar-foreground",
};

export function Section({
  children,
  className,
  containerClassName,
  background = "default",
  id,
}: SectionProps) {
  return (
    <section id={id} className={cn("py-16 lg:py-24", BG_CLASS[background], className)}>
      <div className={cn("max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8", containerClassName)}>
        {children}
      </div>
    </section>
  );
}

interface SectionEyebrowProps {
  children: ReactNode;
  className?: string;
}
export function SectionEyebrow({ children, className }: SectionEyebrowProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider",
        className
      )}
    >
      <span className="w-8 h-px bg-primary" />
      {children}
    </div>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
}
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12 lg:mb-16",
        align === "center" ? "text-center max-w-3xl mx-auto" : "max-w-3xl",
        className
      )}
    >
      {eyebrow && (
        <div className={cn("mb-4", align === "center" && "flex justify-center")}>
          <SectionEyebrow>{eyebrow}</SectionEyebrow>
        </div>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
