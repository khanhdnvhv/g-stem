import { useState } from "react";
import { cn } from "../../ui/utils";
import { Section, SectionHeading } from "../marketing/Section";
import { NewsCard } from "../marketing/NewsCard";
import { CTABanner } from "../marketing/CTABanner";
import { HeroSection } from "../marketing/HeroSection";
import { newsArticles } from "../mock-data";

const CATEGORIES = ["Tất cả", "Triển khai", "Chính sách", "Nội dung", "Sự kiện", "Hướng dẫn"];

export function NewsList() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const featured = newsArticles.find((a) => a.featured);
  const filtered =
    activeCategory === "Tất cả"
      ? newsArticles
      : newsArticles.filter((a) => a.category === activeCategory);

  return (
    <>
      <HeroSection
        variant="centered"
        eyebrow="Tin tức & Cập nhật"
        title={
          <>
            Tin tức mới nhất từ{" "}
            <span className="text-primary">Geleximco STEM</span>
          </>
        }
        subtitle="Cập nhật triển khai, chính sách giáo dục, sự kiện STEM và hướng dẫn từ đội ngũ Geleximco STEM."
        background="tint"
      />

      {/* Featured article */}
      {featured && (
        <Section background="default">
          <SectionHeading eyebrow="Nổi bật" title="Tin tức được chú ý" align="left" />
          <NewsCard article={featured} variant="featured" />
        </Section>
      )}

      {/* Category Filter + Grid */}
      <Section background="muted">
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground border border-border hover:border-primary/50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            Không có bài viết trong danh mục này.
          </div>
        )}
      </Section>

      <CTABanner
        title="Muốn nhận tin tức STEM hằng tuần?"
        description="Đăng ký nhận bản tin để không bỏ lỡ các cập nhật mới nhất về chương trình, chính sách và sự kiện STEM."
        primaryAction={{ label: "Đăng ký nhận tin", to: "/contact" }}
        secondaryAction={{ label: "Xem tất cả sự kiện", to: "/events" }}
        variant="dark"
      />
    </>
  );
}
