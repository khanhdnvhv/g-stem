import { ExternalLink, Check, School } from "lucide-react";
import { HeroSection } from "../marketing/HeroSection";
import { Section, SectionHeading } from "../marketing/Section";
import { CTABanner } from "../marketing/CTABanner";
import { partners } from "../mock-data";

interface PartnerDetailPageProps {
  slug: string;
}

function PartnerDetailPage({ slug }: PartnerDetailPageProps) {
  const partner = partners.find((p) => p.slug === slug)!;

  return (
    <>
      <HeroSection
        variant="split"
        eyebrow={partner.role}
        title={<span className="text-primary">{partner.name}</span>}
        subtitle={partner.description}
        primaryAction={{ label: "Liên hệ hợp tác", to: "/contact" }}
        secondaryAction={{ label: "Xem tất cả đối tác", to: "/partners" }}
        background="tint"
        trustBadges={
          partner.schoolsServed ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                <School className="size-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {partner.schoolsServed}+ trường đã triển khai
                </span>
              </div>
            </div>
          ) : undefined
        }
      />

      {/* Partner Logo + Role */}
      <Section background="default">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 items-start">
            <div className="md:col-span-2 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-secondary flex items-center justify-center mb-4 shadow-sm">
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">{partner.name}</h2>
              <p className="text-sm text-primary font-medium mb-3">{partner.role}</p>
              {partner.website && (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                  {partner.website.replace("https://", "")}
                </a>
              )}
            </div>

            <div className="md:col-span-3">
              <h3 className="text-xl font-bold text-foreground mb-5">
                Đóng góp vào hệ sinh thái Geleximco STEM
              </h3>
              <ul className="space-y-3">
                {partner.contributions.map((c) => (
                  <li key={c} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="size-3.5" />
                    </div>
                    <span className="text-foreground leading-snug">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Impact stats */}
      {partner.schoolsServed && (
        <Section background="muted">
          <div className="max-w-3xl mx-auto">
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-1">{partner.schoolsServed}+</div>
                <p className="text-sm text-muted-foreground">Trường đã triển khai</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-1">45</div>
                <p className="text-sm text-muted-foreground">Tỉnh/thành phủ sóng</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-1">98%</div>
                <p className="text-sm text-muted-foreground">Độ hài lòng của trường</p>
              </div>
            </div>
          </div>
        </Section>
      )}

      <CTABanner
        title={`Tìm hiểu thêm về ${partner.name}`}
        description="Liên hệ đội ngũ tư vấn Geleximco STEM để được giới thiệu chi tiết và nhận proposal phù hợp cho trường bạn."
        primaryAction={{ label: "Liên hệ ngay", to: "/contact" }}
        secondaryAction={{ label: "Xem giải pháp tổng thể", to: "/solutions" }}
        variant="primary"
      />
    </>
  );
}

export const PartnerGeleximco = () => <PartnerDetailPage slug="geleximco-stem" />;
export const PartnerEBD = () => <PartnerDetailPage slug="ebd" />;
export const PartnerNexta = () => <PartnerDetailPage slug="nexta" />;
