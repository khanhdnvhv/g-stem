import { Link, useParams } from "react-router";
import { ArrowLeft, Clock, Tag } from "lucide-react";
import { Button } from "../../ui/button";
import { Section } from "../marketing/Section";
import { CTABanner } from "../marketing/CTABanner";
import { kbArticles } from "../mock-data";

export function KBArticle() {
  const { slug } = useParams<{ slug: string }>();
  const article = kbArticles.find((a) => a.slug === slug);
  const related = kbArticles.filter((a) => a.slug !== slug && a.category === article?.category).slice(0, 3);

  if (!article) {
    return (
      <Section background="default">
        <div className="text-center py-24">
          <h1 className="text-2xl font-bold text-foreground mb-4">Không tìm thấy bài viết</h1>
          <Button asChild variant="outline">
            <Link to="/support/kb">
              <ArrowLeft className="size-4 mr-2" /> Quay lại Knowledge Base
            </Link>
          </Button>
        </div>
      </Section>
    );
  }

  const updated = new Date(article.lastUpdated).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="bg-gradient-to-br from-secondary via-background to-accent/5 pt-12 pb-10">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
            <Link to="/support/kb">
              <ArrowLeft className="size-4 mr-1" /> Knowledge Base
            </Link>
          </Button>
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            {article.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>Cập nhật: {updated}</span>
          </div>
        </div>
      </div>

      <Section background="default">
        <div className="max-w-[720px] mx-auto">
          <p className="text-base text-muted-foreground leading-relaxed mb-6 border-l-4 border-primary pl-5">
            {article.excerpt}
          </p>

          <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
            <p>{article.body}</p>
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center gap-2">
              <Tag className="size-4 text-muted-foreground" />
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-secondary text-xs font-medium text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Bài viết này có hữu ích không?</p>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-full border border-border text-sm text-foreground hover:bg-secondary transition-colors">
                👍 Có
              </button>
              <button className="px-4 py-1.5 rounded-full border border-border text-sm text-foreground hover:bg-secondary transition-colors">
                👎 Cần cải thiện
              </button>
            </div>
          </div>
        </div>
      </Section>

      {related.length > 0 && (
        <Section background="muted">
          <h2 className="text-xl font-bold text-foreground mb-6">Bài viết liên quan</h2>
          <div className="space-y-3 max-w-2xl">
            {related.map((a) => (
              <Link
                key={a.id}
                to={`/support/kb/${a.slug}`}
                className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl hover:shadow-sm transition-shadow group"
              >
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {a.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">{a.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <CTABanner
        title="Cần hỗ trợ thêm?"
        description="Nếu hướng dẫn chưa giải quyết được vấn đề của bạn, hãy gửi ticket để đội ngũ hỗ trợ can thiệp trực tiếp."
        primaryAction={{ label: "Gửi ticket hỗ trợ", to: "/support/ticket-new" }}
        secondaryAction={{ label: "Xem FAQ", to: "/support/faq" }}
        variant="dark"
      />
    </>
  );
}
