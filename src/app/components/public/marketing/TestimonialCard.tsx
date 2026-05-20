import { Quote } from "lucide-react";
import type { Testimonial } from "../mock-data";
import { cn } from "../../ui/utils";

interface TestimonialCardProps {
  testimonial: Testimonial;
  variant?: "default" | "highlight";
  className?: string;
}

export function TestimonialCard({
  testimonial,
  variant = "default",
  className,
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-6 lg:p-8 relative",
        variant === "highlight"
          ? "bg-primary text-primary-foreground"
          : "bg-card border border-border",
        className
      )}
    >
      <Quote
        className={cn(
          "absolute top-4 right-4 size-8 opacity-20",
          variant === "highlight" ? "text-accent" : "text-primary"
        )}
      />
      <p
        className={cn(
          "text-base lg:text-lg leading-relaxed pr-8 italic",
          variant === "default" && "text-foreground"
        )}
      >
        "{testimonial.quote}"
      </p>
      <div className="mt-6 flex items-center gap-3">
        {testimonial.avatarUrl && (
          <img
            src={testimonial.avatarUrl}
            alt={testimonial.author}
            className="w-12 h-12 rounded-full object-cover bg-secondary"
          />
        )}
        <div>
          <p
            className={cn(
              "text-sm font-semibold",
              variant === "default" && "text-foreground"
            )}
          >
            {testimonial.author}
          </p>
          <p
            className={cn(
              "text-xs",
              variant === "highlight" ? "opacity-80" : "text-muted-foreground"
            )}
          >
            {testimonial.role} · {testimonial.school}
          </p>
        </div>
      </div>
    </div>
  );
}
