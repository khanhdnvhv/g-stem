import { Link, useParams } from "react-router";
import { Calendar, Clock, ArrowLeft, Tag } from "lucide-react";
import { Button } from "../../ui/button";
import { Section } from "../marketing/Section";
import { NewsCard } from "../marketing/NewsCard";
import { CTABanner } from "../marketing/CTABanner";
import { newsArticles } from "../mock-data";

export function NewsDetail() {
  const { slug } = useParams<{ slug: string }>();
  const article = newsArticles.find((a) => a.slug === slug);
  const related = newsArticles.filter((a) => a.slug !== slug).slice(0, 3);

  if (!article) {
    return (
      <Section background="default">
        <div className="text-center py-24">
          <h1 className="text-2xl font-bold text-foreground mb-4">Không tìm thấy bài viết</h1>
          <Button asChild variant="outline">
            <Link to="/news">
              <ArrowLeft className="size-4 mr-2" /> Quay lại danh sách tin
            </Link>
          </Button>
        </div>
      </Section>
    );
  }

  const date = new Date(article.publishedAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* Article Header */}
      <div className="bg-gradient-to-br from-secondary via-background to-accent/5 pt-12 pb-0">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
            <Link to="/news">
              <ArrowLeft className="size-4 mr-1" /> Tất cả tin tức
            </Link>
          </Button>
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="font-medium text-foreground">{article.author}</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" /> {date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" /> {article.readTime} phút đọc
            </span>
          </div>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-0">
        <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Article Body */}
      <Section background="default">
        <div className="max-w-[720px] mx-auto">
          <p className="text-lg text-muted-foreground leading-relaxed mb-6 border-l-4 border-primary pl-5 italic">
            {article.excerpt}
          </p>

          {article.body ? (
            <div className="prose prose-lg max-w-none text-foreground leading-relaxed">
              <p>{article.body}</p>
            </div>
          ) : (
            <div className="space-y-4 text-foreground leading-relaxed">
              <p>
                Geleximco STEM tiếp tục đẩy mạnh triển khai hệ sinh thái giáo dục STEM toàn quốc.
                Đội ngũ chuyên gia của chúng tôi đã và đang làm việc không ngừng nghỉ để mang lại
                giải pháp tốt nhất cho hàng nghìn trường học trên cả nước.
              </p>
              <p>
                Với hơn 500 trường đã triển khai và 45/63 tỉnh thành phủ sóng, Geleximco STEM đang
                trên đà trở thành nền tảng STEM số 1 Việt Nam. Các chương trình CT1-CT5 được thiết
                kế đồng bộ, đảm bảo tính liên tục từ Mầm non đến THPT Nghề.
              </p>
              <p>
                Trong năm học 2025-2026, chúng tôi đã ghi nhận tỷ lệ hài lòng đạt 98% từ các trường
                đã triển khai, với phản hồi tích cực về chất lượng học liệu, hỗ trợ kỹ thuật và
                chương trình đào tạo giáo viên.
              </p>
              <h3 className="text-xl font-bold text-foreground mt-8 mb-4">
                Những điểm nổi bật của đợt triển khai
              </h3>
              <ul className="space-y-2 list-none">
                {[
                  "Hoàn thành bàn giao đúng tiến độ cam kết trong hợp đồng",
                  "100% giáo viên tham gia đủ chương trình tập huấn",
                  "Tích hợp thành công với hệ thống VnEdu tại 80% trường",
                  "Học sinh đạt kết quả cao trong các bài kiểm tra STEM định kỳ",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

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
        </div>
      </Section>

      {/* Related Articles */}
      {related.length > 0 && (
        <Section background="muted">
          <h2 className="text-2xl font-bold text-foreground mb-8">Bài viết liên quan</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((a) => (
              <NewsCard key={a.id} article={a} variant="compact" />
            ))}
          </div>
        </Section>
      )}

      <CTABanner
        title="Muốn tìm hiểu thêm về Geleximco STEM?"
        description="Đội ngũ tư vấn sẵn sàng giải đáp mọi câu hỏi về giải pháp STEM cho trường bạn."
        primaryAction={{ label: "Liên hệ tư vấn", to: "/contact" }}
        secondaryAction={{ label: "Xem giải pháp", to: "/solutions" }}
        variant="primary"
      />
    </>
  );
}
