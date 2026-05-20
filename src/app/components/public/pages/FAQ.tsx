import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router";
import { cn } from "../../ui/utils";
import { HeroSection } from "../marketing/HeroSection";
import { Section, SectionHeading } from "../marketing/Section";
import { CTABanner } from "../marketing/CTABanner";
import { faqItems } from "../mock-data";

const CATEGORIES = ["Tất cả", "Tổng quan", "Triển khai", "Học liệu & Công nghệ", "Chi phí & Hợp đồng"];

export function FAQ() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [openId, setOpenId] = useState<string | null>(faqItems[0].id);

  const filtered =
    activeCategory === "Tất cả"
      ? faqItems
      : faqItems.filter((f) => f.category === activeCategory);

  return (
    <>
      <HeroSection
        variant="centered"
        eyebrow="Câu hỏi thường gặp"
        title={
          <>
            Giải đáp thắc mắc về{" "}
            <span className="text-primary">Geleximco STEM</span>
          </>
        }
        subtitle="Tổng hợp các câu hỏi phổ biến từ Hiệu trưởng, Giáo viên và cán bộ Sở/Phòng GD&ĐT."
        background="tint"
      />

      <Section background="default">
        <SectionHeading
          eyebrow="FAQ"
          title="Tìm câu trả lời bạn cần"
        />

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/70"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-semibold text-foreground text-sm leading-snug">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "size-5 text-muted-foreground shrink-0 transition-transform duration-200",
                    openId === item.id && "rotate-180"
                  )}
                />
              </button>
              {openId === item.id && (
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Không tìm thấy câu trả lời bạn cần?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/support/kb"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/70 transition-colors"
            >
              Tìm trong Knowledge Base
            </Link>
            <Link
              to="/support/ticket-new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Gửi câu hỏi cho chúng tôi
            </Link>
          </div>
        </div>
      </Section>

      <CTABanner
        title="Sẵn sàng triển khai STEM?"
        description="Đã có đầy đủ thông tin và muốn bắt đầu? Liên hệ để nhận tư vấn và báo giá."
        primaryAction={{ label: "Đăng ký tư vấn ngay", to: "/contact" }}
        secondaryAction={{ label: "Xem giải pháp", to: "/solutions" }}
        variant="primary"
      />
    </>
  );
}
