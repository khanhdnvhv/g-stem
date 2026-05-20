import { Check } from "lucide-react";
import { Link } from "react-router";
import { cn } from "../../ui/utils";
import { HeroSection } from "../marketing/HeroSection";
import { Section, SectionHeading } from "../marketing/Section";
import { CTABanner } from "../marketing/CTABanner";
import { solutionTiers } from "../mock-data";
import type { Tier, GradeLevel, Program } from "../mock-data";

const GRADE_LABELS: Record<GradeLevel, string> = {
  MN: "Mầm non",
  TH: "Tiểu học",
  THCS: "THCS",
  THPT: "THPT",
  LC: "Liên cấp",
  THPT_Nghe: "THPT Nghề",
};

const TIER_CONFIG: Record<Tier, { badgeBg: string; badgeText: string; tagLabel: string; eyebrow: string }> = {
  minimum: {
    badgeBg: "bg-secondary",
    badgeText: "text-foreground",
    tagLabel: "Gói Tối thiểu",
    eyebrow: "Khởi đầu STEM cho mọi trường",
  },
  basic: {
    badgeBg: "bg-primary",
    badgeText: "text-primary-foreground",
    tagLabel: "Gói Cơ bản · Phổ biến nhất",
    eyebrow: "Đầy đủ tính năng · Tối ưu chi phí",
  },
  advanced: {
    badgeBg: "bg-accent",
    badgeText: "text-sidebar-primary-foreground",
    tagLabel: "Gói Nâng cao · Cao cấp nhất",
    eyebrow: "Giải pháp toàn diện đẳng cấp quốc tế",
  },
};

interface SolutionDetailPageProps {
  tierId: Tier;
}

function SolutionDetailPage({ tierId }: SolutionDetailPageProps) {
  const tier = solutionTiers.find((t) => t.id === tierId)!;
  const cfg = TIER_CONFIG[tierId];

  return (
    <>
      <HeroSection
        variant="split"
        eyebrow={cfg.eyebrow}
        title={<span className="text-primary">{tier.name}</span>}
        subtitle={tier.description}
        primaryAction={{ label: "Đăng ký tư vấn", to: "/contact" }}
        secondaryAction={{ label: "Xem tất cả gói", to: "/solutions" }}
        background="tint"
        trustBadges={
          <span
            className={cn(
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold",
              cfg.badgeBg,
              cfg.badgeText
            )}
          >
            {cfg.tagLabel}
          </span>
        }
      />

      {/* Highlights */}
      <Section background="default">
        <SectionHeading
          eyebrow="Điểm nổi bật"
          title={`Tại sao chọn ${tier.name}?`}
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tier.highlights.map((h) => (
            <div
              key={h}
              className="bg-card border border-border rounded-xl p-5 flex gap-3 items-start"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Check className="size-4" />
              </div>
              <p className="text-sm font-medium text-foreground leading-snug">{h}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* BOM + Grades + Programs */}
      <Section background="muted">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6">
              Danh mục thiết bị &amp; học liệu
            </h3>
            <ul className="space-y-4">
              {tier.bomCategories.map((item, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-foreground leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-10">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Bậc học phù hợp</h3>
              <div className="flex flex-wrap gap-2">
                {tier.suitableFor.map((grade) => (
                  <span
                    key={grade}
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    {GRADE_LABELS[grade]}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Chương trình STEM hỗ trợ</h3>
              <div className="flex flex-wrap gap-2">
                {tier.programsSupported.map((prog: Program) => (
                  <Link
                    key={prog}
                    to={`/programs/${prog.toLowerCase()}`}
                    className="px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold hover:bg-accent hover:text-sidebar-primary-foreground transition-colors"
                  >
                    {prog}
                  </Link>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Nhấn vào tên chương trình để xem chi tiết nội dung và lộ trình học.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-sm font-semibold text-foreground mb-2">Cần tư vấn chi tiết hơn?</p>
              <p className="text-sm text-muted-foreground mb-4">
                Đội ngũ chuyên gia sẵn sàng khảo sát thực tế và đề xuất phương án tối ưu cho trường bạn.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Đăng ký tư vấn miễn phí →
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <CTABanner
        title={`Triển khai ${tier.name} cho trường bạn`}
        description="Đội ngũ tư vấn sẵn sàng khảo sát miễn phí và lên kế hoạch triển khai chi tiết trong vòng 48 giờ."
        primaryAction={{ label: "Đăng ký tư vấn ngay", to: "/contact" }}
        secondaryAction={{ label: "Tải brochure PDF", to: "/downloads" }}
        variant="primary"
      />
    </>
  );
}

export const SolutionMinimum = () => <SolutionDetailPage tierId="minimum" />;
export const SolutionBasic = () => <SolutionDetailPage tierId="basic" />;
export const SolutionAdvanced = () => <SolutionDetailPage tierId="advanced" />;
