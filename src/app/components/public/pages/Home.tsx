import { Link } from "react-router";
import { ArrowRight, Boxes, GraduationCap, Building2, Cpu, Microscope, Award } from "lucide-react";
import { Button } from "../../ui/button";
import { HeroSection } from "../marketing/HeroSection";
import { Section, SectionHeading } from "../marketing/Section";
import { StatCard } from "../marketing/StatCard";
import { FeatureCard } from "../marketing/FeatureCard";
import { CTABanner } from "../marketing/CTABanner";
import { PartnerLogoCloud } from "../marketing/PartnerLogoCloud";
import { TestimonialCard } from "../marketing/TestimonialCard";
import { NewsCard } from "../marketing/NewsCard";
import {
  platformStats,
  trustedSchoolLogos,
  solutionTiers,
  stemPrograms,
  partners,
  testimonials,
  newsArticles,
} from "../mock-data";
import { useState } from "react";
import { cn } from "../../ui/utils";

const TIER_ICONS = {
  minimum: <Boxes className="size-6" />,
  basic: <Building2 className="size-6" />,
  advanced: <Award className="size-6" />,
};

const PROGRAM_ICONS = {
  CT1: <GraduationCap className="size-5" />,
  CT2: <Boxes className="size-5" />,
  CT3: <Cpu className="size-5" />,
  CT4: <Cpu className="size-5" />,
  CT5: <Microscope className="size-5" />,
};

export function Home() {
  const [activeProgram, setActiveProgram] = useState(stemPrograms[0].id);
  const currentProgram = stemPrograms.find((p) => p.id === activeProgram)!;
  const latestNews = newsArticles.slice(0, 3);

  return (
    <>
      {/* ───── HERO ───── */}
      <HeroSection
        variant="split"
        eyebrow="Giải pháp STEM tổng thể"
        title={
          <>
            Đồng hành cùng nhà trường xây dựng{" "}
            <span className="text-primary">phòng học STEM</span> đẳng cấp quốc tế
          </>
        }
        subtitle="Từ Mầm non đến THPT Nghề. Chuẩn Bộ GD&ĐT. Mapping với SGK Kết nối tri thức. Triển khai và đồng hành 5 năm."
        primaryAction={{ label: "Đăng ký tư vấn", to: "/contact" }}
        secondaryAction={{ label: "Tải brochure", to: "/downloads" }}
        imageUrl="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=85"
        imageAlt="Phòng học STEM hiện đại"
        background="tint"
      />

      {/* ───── TRUST BAR ───── */}
      <div className="bg-secondary/50 py-10 border-y border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <PartnerLogoCloud
            title="Đã triển khai tại"
            logos={trustedSchoolLogos}
          />
        </div>
      </div>

      {/* ───── STATS ───── */}
      <Section background="default">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {platformStats.map((stat) => (
            <StatCard key={stat.label} value={stat.value} unit={stat.unit} label={stat.label} />
          ))}
        </div>
      </Section>

      {/* ───── 3 SOLUTION TIERS ───── */}
      <Section background="muted">
        <SectionHeading
          eyebrow="3 gói Phòng STEM"
          title="Phù hợp với mọi quy mô và ngân sách"
          subtitle="Geleximco cung cấp 3 tier phòng STEM với mức đầu tư khác nhau, áp dụng cho cả 6 bậc học từ Mầm non đến THPT Nghề."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {solutionTiers.map((tier) => (
            <FeatureCard
              key={tier.id}
              icon={TIER_ICONS[tier.id]}
              title={tier.name}
              description={tier.description}
              badge={tier.tagline}
              link={{ label: "Tìm hiểu chi tiết", to: `/solutions/${tier.id}` }}
              variant={tier.id === "basic" ? "outline" : "elevated"}
            />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="ghost" size="lg">
            <Link to="/solutions">
              Xem chi tiết 3 gói phòng STEM <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* ───── 5 PROGRAMS — TAB INTERACTIVE ───── */}
      <Section background="default">
        <SectionHeading
          eyebrow="5 chương trình giảng dạy STEM"
          title="Chuẩn CT GDPT 2018 — Bộ Kết nối tri thức"
          subtitle="Mỗi chương trình được thiết kế cho mục đích sư phạm khác nhau, áp dụng cho các bậc học và nhóm giáo viên phù hợp."
        />
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {stemPrograms.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProgram(p.id)}
              className={cn(
                "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2",
                activeProgram === p.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-foreground hover:bg-secondary/70"
              )}
            >
              {PROGRAM_ICONS[p.id]}
              <span>
                {p.name} — {p.fullName}
              </span>
            </button>
          ))}
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 lg:p-10 shadow-sm">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                {currentProgram.name}
              </span>
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 leading-tight">
                {currentProgram.fullName}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-6">
                {currentProgram.description}
              </p>
              <dl className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <dt className="font-semibold text-foreground min-w-[120px]">Tổ chức:</dt>
                  <dd className="text-muted-foreground">{currentProgram.schedulingMode}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="font-semibold text-foreground min-w-[120px]">Người dạy:</dt>
                  <dd className="text-muted-foreground">{currentProgram.teacherType}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="font-semibold text-foreground min-w-[120px]">Cấu trúc:</dt>
                  <dd className="text-muted-foreground">{currentProgram.dimension}</dd>
                </div>
              </dl>
              <Button asChild className="mt-6">
                <Link to={`/programs/${currentProgram.id.toLowerCase()}`}>
                  Tìm hiểu chi tiết <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="bg-secondary rounded-xl aspect-video flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {PROGRAM_ICONS[currentProgram.id]}
                </div>
                <p className="text-sm">Ảnh minh họa {currentProgram.fullName}</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ───── PARTNERS ───── */}
      <Section background="muted">
        <SectionHeading
          eyebrow="Mạng lưới đối tác"
          title="Hệ sinh thái Geleximco STEM"
          subtitle="Cùng kết hợp năng lực của Geleximco (nền tảng), EBD (học liệu chuẩn) và Nexta (thiết bị Robotics/AI/IoT) để mang đến giải pháp toàn diện."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {partners.map((p) => (
            <Link
              key={p.id}
              to={`/partners/${p.slug}`}
              className="group bg-card border border-border rounded-xl p-6 lg:p-8 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={p.logoUrl}
                  alt={p.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{p.tagline}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                {p.description}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Xem chi tiết <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* ───── TESTIMONIALS ───── */}
      <Section background="default">
        <SectionHeading
          eyebrow="Câu chuyện thành công"
          title="Các trường nói gì về Geleximco STEM"
        />
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.id} testimonial={t} variant={i === 1 ? "highlight" : "default"} />
          ))}
        </div>
      </Section>

      {/* ───── LATEST NEWS ───── */}
      <Section background="muted">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <SectionHeading
            eyebrow="Tin tức mới nhất"
            title="Cập nhật từ Geleximco STEM"
            align="left"
            className="mb-0 max-w-2xl"
          />
          <Button asChild variant="outline">
            <Link to="/news">
              Xem tất cả <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {latestNews.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </Section>

      {/* ───── CTA BANNER ───── */}
      <CTABanner
        title="Bắt đầu hành trình STEM cho trường bạn"
        description="Đội ngũ tư vấn sẵn sàng khảo sát miễn phí và đưa ra giải pháp phù hợp với ngân sách & quy mô."
        primaryAction={{ label: "Đăng ký demo ngay", to: "/contact" }}
        secondaryAction={{ label: "Tải brochure PDF", to: "/downloads" }}
        variant="primary"
      />
    </>
  );
}
