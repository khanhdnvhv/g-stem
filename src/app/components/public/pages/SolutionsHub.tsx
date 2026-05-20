import { Link } from "react-router";
import { Check, Minus, Boxes, Building2, Award } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";
import { HeroSection } from "../marketing/HeroSection";
import { Section, SectionHeading } from "../marketing/Section";
import { CTABanner } from "../marketing/CTABanner";
import { solutionTiers } from "../mock-data";

const TIER_ICONS = {
  minimum: <Boxes className="size-6" />,
  basic: <Building2 className="size-6" />,
  advanced: <Award className="size-6" />,
};

const TIER_STYLES = {
  minimum: {
    ring: "border-border",
    badge: "bg-secondary text-foreground",
    badgeLabel: "Tối thiểu",
    recommend: false,
  },
  basic: {
    ring: "border-primary ring-2 ring-primary/20",
    badge: "bg-primary text-primary-foreground",
    badgeLabel: "Phổ biến nhất",
    recommend: true,
  },
  advanced: {
    ring: "border-accent/60",
    badge: "bg-accent text-sidebar-primary-foreground",
    badgeLabel: "Cao cấp nhất",
    recommend: false,
  },
};

const COMPARISON_ROWS = [
  {
    feature: "Số chỗ ngồi",
    minimum: "10–15 chỗ",
    basic: "25–30 chỗ",
    advanced: "35–40 chỗ",
  },
  {
    feature: "Bậc học phù hợp",
    minimum: "MN, TH, THCS",
    basic: "TH, THCS, THPT",
    advanced: "THCS – THPT Nghề",
  },
  {
    feature: "Chương trình STEM",
    minimum: "CT1, CT2",
    basic: "CT1 – CT4",
    advanced: "CT1 – CT5 (đầy đủ)",
  },
  {
    feature: "Smart Board",
    minimum: null,
    basic: "✓",
    advanced: "✓ (kích thước lớn + tablet)",
  },
  {
    feature: "Robotics / AI / IoT",
    minimum: null,
    basic: "Robotics cơ bản",
    advanced: "Đầy đủ CT4",
  },
  {
    feature: "Đồng hành sau triển khai",
    minimum: null,
    basic: "3 năm",
    advanced: "5 năm + bảo trì định kỳ",
  },
  {
    feature: "License phần mềm",
    minimum: "20 user",
    basic: "50 user",
    advanced: "Không giới hạn",
  },
  {
    feature: "Tập huấn giáo viên",
    minimum: "2 ngày",
    basic: "5 ngày",
    advanced: "10 ngày + GV cốt cán",
  },
];

type TierId = "minimum" | "basic" | "advanced";

function CompCell({ value }: { value: string | null }) {
  if (value === null) {
    return (
      <div className="flex justify-center">
        <Minus className="size-4 text-muted-foreground/40" />
      </div>
    );
  }
  if (value === "✓") {
    return (
      <div className="flex justify-center">
        <Check className="size-4 text-primary" />
      </div>
    );
  }
  return <span className="text-sm text-foreground">{value}</span>;
}

export function SolutionsHub() {
  return (
    <>
      <HeroSection
        variant="centered"
        eyebrow="Giải pháp phòng STEM"
        title={
          <>
            3 gói Phòng STEM{" "}
            <span className="text-primary">phù hợp mọi quy mô</span>
          </>
        }
        subtitle="Từ trường công ngân sách hạn chế đến trường chuyên cao cấp — Geleximco cung cấp 3 tier phòng STEM thiết kế riêng cho 6 bậc học."
        primaryAction={{ label: "Đăng ký tư vấn miễn phí", to: "/contact" }}
        secondaryAction={{ label: "Tải brochure PDF", to: "/downloads" }}
        background="tint"
      />

      {/* 3 Tier Cards */}
      <Section background="default">
        <SectionHeading
          eyebrow="3 gói phòng STEM"
          title="Chọn gói phù hợp với trường bạn"
          subtitle="Mỗi gói được thiết kế riêng theo quy mô, ngân sách và mục tiêu giáo dục của từng nhà trường."
        />
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {solutionTiers.map((tier) => {
            const style = TIER_STYLES[tier.id as TierId];
            return (
              <div
                key={tier.id}
                className={cn(
                  "relative bg-card border rounded-2xl p-8 flex flex-col transition-shadow hover:shadow-lg",
                  style.ring
                )}
              >
                {style.recommend && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold whitespace-nowrap shadow-sm">
                      Phổ biến nhất
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                      tier.id === "basic"
                        ? "bg-primary text-primary-foreground"
                        : tier.id === "advanced"
                        ? "bg-accent/20 text-accent"
                        : "bg-secondary text-foreground"
                    )}
                  >
                    {TIER_ICONS[tier.id as TierId]}
                  </div>
                  <span
                    className={cn(
                      "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3",
                      style.badge
                    )}
                  >
                    {style.badgeLabel}
                  </span>
                  <h3 className="text-xl font-bold text-foreground mb-2">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tier.description}</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {tier.highlights.map((h) => (
                    <li key={h} className="flex gap-2.5 items-start text-sm">
                      <Check className="size-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground">{h}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild variant={tier.id === "basic" ? "default" : "outline"} className="w-full">
                  <Link to={`/solutions/${tier.id}`}>Tìm hiểu chi tiết</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Comparison Table */}
      <Section background="muted">
        <SectionHeading
          eyebrow="So sánh tính năng"
          title="Gói nào phù hợp với trường bạn?"
        />
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-5 text-sm font-semibold text-muted-foreground w-1/4">
                  Tính năng
                </th>
                {solutionTiers.map((tier) => (
                  <th key={tier.id} className="p-5 text-center w-1/4">
                    <span
                      className={cn(
                        "inline-block px-3 py-1 rounded-full text-xs font-bold",
                        TIER_STYLES[tier.id as TierId].badge
                      )}
                    >
                      {tier.name.replace("Phòng STEM ", "")}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  className={cn("border-b border-border last:border-0", i % 2 === 0 && "bg-secondary/30")}
                >
                  <td className="p-5 text-sm font-medium text-foreground">{row.feature}</td>
                  <td className="p-5 text-center">
                    <CompCell value={row.minimum} />
                  </td>
                  <td className="p-5 text-center bg-primary/5">
                    <CompCell value={row.basic} />
                  </td>
                  <td className="p-5 text-center">
                    <CompCell value={row.advanced} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          * Thông số có thể thay đổi theo yêu cầu tùy chỉnh. Liên hệ tư vấn để được báo giá chính xác.
        </p>
      </Section>

      <CTABanner
        title="Không chắc gói nào phù hợp?"
        description="Đội ngũ tư vấn của chúng tôi sẵn sàng khảo sát miễn phí và đề xuất gói STEM tối ưu cho trường bạn."
        primaryAction={{ label: "Khảo sát miễn phí", to: "/contact" }}
        secondaryAction={{ label: "Tải brochure so sánh", to: "/downloads" }}
        variant="primary"
      />
    </>
  );
}
