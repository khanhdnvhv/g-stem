import { useState } from "react";
import { Link } from "react-router";
import { Search, ArrowRight, Clock } from "lucide-react";
import { cn } from "../../ui/utils";
import { HeroSection } from "../marketing/HeroSection";
import { Section, SectionHeading } from "../marketing/Section";
import { kbArticles } from "../mock-data";

const CATEGORIES = ["Tất cả", "Bắt đầu", "Vận hành", "Dạy học", "Tích hợp hệ thống", "Báo cáo", "Tài khoản"];

export function KBHub() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [query, setQuery] = useState("");

  const filtered = kbArticles.filter((a) => {
    const matchCat = activeCategory === "Tất cả" || a.category === activeCategory;
    const matchQuery =
      !query ||
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <>
      <HeroSection
        variant="centered"
        eyebrow="Knowledge Base"
        title={
          <>
            Hướng dẫn sử dụng{" "}
            <span className="text-primary">Geleximco STEM</span>
          </>
        }
        subtitle="Tài liệu hướng dẫn chi tiết cho quản trị viên trường, giáo viên và học sinh."
        background="tint"
      />

      <Section background="default">
        <SectionHeading
          eyebrow="Thư viện hướng dẫn"
          title="Tìm hướng dẫn bạn cần"
        />

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
            />
          </div>
        </div>

        {/* Category Filter */}
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

        {/* Articles Grid */}
        {filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((article) => {
              const updated = new Date(article.lastUpdated).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
              return (
                <Link
                  key={article.id}
                  to={`/support/kb/${article.slug}`}
                  className="group bg-card border border-border rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-secondary text-xs font-medium text-muted-foreground">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" /> {updated}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-1.5 transition-all">
                    Đọc hướng dẫn <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            Không tìm thấy bài viết phù hợp.
          </div>
        )}
      </Section>
    </>
  );
}
