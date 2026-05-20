import { Link } from "react-router";
import { Calendar, MapPin, Wifi, ExternalLink } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";
import { HeroSection } from "../marketing/HeroSection";
import { Section, SectionHeading } from "../marketing/Section";
import { CTABanner } from "../marketing/CTABanner";
import { events } from "../mock-data";

const TYPE_COLORS: Record<string, string> = {
  "Hội thảo": "bg-primary/10 text-primary",
  "Tập huấn": "bg-accent/10 text-accent",
  "Ngày hội STEM": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "Webinar": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const TODAY = new Date("2026-05-18");

function isUpcoming(startDate: string) {
  return new Date(startDate) >= TODAY;
}

export function Events() {
  const upcoming = events.filter((e) => isUpcoming(e.startDate));
  const past = events.filter((e) => !isUpcoming(e.startDate));

  return (
    <>
      <HeroSection
        variant="centered"
        eyebrow="Sự kiện"
        title={
          <>
            Sự kiện STEM{" "}
            <span className="text-primary">2026</span>
          </>
        }
        subtitle="Hội thảo, tập huấn giáo viên, ngày hội STEM và webinar — tất cả thông tin sự kiện từ Geleximco STEM."
        primaryAction={{ label: "Đăng ký tham dự", to: "/contact" }}
        background="tint"
      />

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <Section background="default">
          <SectionHeading
            eyebrow="Sắp diễn ra"
            title="Đừng bỏ lỡ các sự kiện sắp tới"
            align="left"
          />
          <div className="grid md:grid-cols-2 gap-6">
            {upcoming.map((event) => {
              const start = new Date(event.startDate).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              });
              const end = event.endDate
                ? new Date(event.endDate).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "long",
                  })
                : null;

              return (
                <div
                  key={event.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {event.thumbnail && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={event.thumbnail}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-semibold",
                          TYPE_COLORS[event.type] || "bg-secondary text-foreground"
                        )}
                      >
                        {event.type}
                      </span>
                      {event.online && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Wifi className="size-3" /> Online
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3 leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {event.description}
                    </p>
                    <div className="space-y-1.5 mb-5 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-4 text-primary shrink-0" />
                        <span>{start}{end && ` — ${end}`}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="size-4 text-primary shrink-0" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    {event.registerUrl && (
                      <Button asChild size="sm" className="w-full sm:w-auto">
                        <Link to={event.registerUrl}>Đăng ký tham dự</Link>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <Section background="muted">
          <SectionHeading
            eyebrow="Đã diễn ra"
            title="Sự kiện đã qua"
            align="left"
          />
          <div className="space-y-4">
            {past.map((event) => {
              const start = new Date(event.startDate).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              return (
                <div
                  key={event.id}
                  className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start opacity-80"
                >
                  {event.thumbnail && (
                    <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-secondary">
                      <img
                        src={event.thumbnail}
                        alt={event.title}
                        className="w-full h-full object-cover grayscale"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span
                      className={cn(
                        "inline-block px-2 py-0.5 rounded text-[10px] font-semibold mb-2",
                        TYPE_COLORS[event.type] || "bg-secondary text-foreground"
                      )}
                    >
                      {event.type}
                    </span>
                    <h4 className="text-sm font-semibold text-foreground mb-1">{event.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" /> {start}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" /> {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      <CTABanner
        title="Muốn tổ chức sự kiện STEM tại trường?"
        description="Geleximco hỗ trợ tổ chức ngày hội STEM, tập huấn và hội thảo theo yêu cầu của trường hoặc Sở GD&ĐT."
        primaryAction={{ label: "Liên hệ tổ chức sự kiện", to: "/contact" }}
        variant="primary"
      />
    </>
  );
}
