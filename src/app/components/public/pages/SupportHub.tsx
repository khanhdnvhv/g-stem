import { Link } from "react-router";
import { Search, BookOpen, HelpCircle, MessageSquarePlus, Phone, ArrowRight } from "lucide-react";
import { HeroSection } from "../marketing/HeroSection";
import { Section, SectionHeading } from "../marketing/Section";
import { CTABanner } from "../marketing/CTABanner";
import { faqItems, kbArticles } from "../mock-data";

const SUPPORT_CHANNELS = [
  {
    icon: <HelpCircle className="size-6" />,
    title: "Câu hỏi thường gặp",
    description: "12 câu hỏi phổ biến về giải pháp, triển khai, học liệu và hợp đồng.",
    link: { to: "/support/faq", label: "Xem FAQ" },
    color: "bg-primary/10 text-primary",
  },
  {
    icon: <BookOpen className="size-6" />,
    title: "Knowledge Base",
    description: "Hướng dẫn chi tiết vận hành hệ thống, dạy học STEM và quản lý trường.",
    link: { to: "/support/kb", label: "Vào Knowledge Base" },
    color: "bg-accent/10 text-accent",
  },
  {
    icon: <MessageSquarePlus className="size-6" />,
    title: "Gửi yêu cầu hỗ trợ",
    description: "Không tìm thấy giải pháp? Gửi ticket và đội ngũ hỗ trợ sẽ phản hồi trong 4 giờ.",
    link: { to: "/support/ticket-new", label: "Tạo ticket" },
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    icon: <Phone className="size-6" />,
    title: "Hotline hỗ trợ",
    description: "1800 5688 (miễn phí) — Thứ 2–6, 8:00–17:30. Thứ 7, 8:00–12:00.",
    link: { to: "/contact", label: "Xem thêm thông tin" },
    color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
];

export function SupportHub() {
  return (
    <>
      <HeroSection
        variant="centered"
        eyebrow="Hỗ trợ"
        title={
          <>
            Trung tâm{" "}
            <span className="text-primary">Hỗ trợ</span>
          </>
        }
        subtitle="Tìm câu trả lời nhanh, đọc hướng dẫn chi tiết hoặc liên hệ đội ngũ hỗ trợ chuyên nghiệp."
        background="tint"
      />

      {/* Search placeholder */}
      <Section background="default" className="py-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi, hướng dẫn..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-base shadow-sm"
            />
          </div>
        </div>
      </Section>

      {/* Support Channels */}
      <Section background="default" className="pt-0">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SUPPORT_CHANNELS.map((channel) => (
            <div
              key={channel.title}
              className="bg-card border border-border rounded-xl p-6 flex flex-col"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${channel.color}`}>
                {channel.icon}
              </div>
              <h3 className="font-bold text-foreground mb-2">{channel.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
                {channel.description}
              </p>
              <Link
                to={channel.link.to}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2 transition-all"
              >
                {channel.link.label} <ArrowRight className="size-4" />
              </Link>
            </div>
          ))}
        </div>
      </Section>

      {/* Popular FAQ */}
      <Section background="muted">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <SectionHeading
              eyebrow="FAQ phổ biến"
              title="Câu hỏi hay gặp nhất"
              align="left"
              className="mb-6"
            />
            <ul className="space-y-3">
              {faqItems.slice(0, 5).map((item) => (
                <li key={item.id}>
                  <Link
                    to="/support/faq"
                    className="flex items-start gap-3 text-sm text-foreground hover:text-primary transition-colors group"
                  >
                    <HelpCircle className="size-4 text-primary shrink-0 mt-0.5" />
                    <span className="group-hover:underline underline-offset-2 leading-snug">
                      {item.question}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/support/faq"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
            >
              Xem tất cả FAQ <ArrowRight className="size-4" />
            </Link>
          </div>

          <div>
            <SectionHeading
              eyebrow="Hướng dẫn mới nhất"
              title="Knowledge Base"
              align="left"
              className="mb-6"
            />
            <ul className="space-y-3">
              {kbArticles.slice(0, 5).map((article) => (
                <li key={article.id}>
                  <Link
                    to={`/support/kb/${article.slug}`}
                    className="flex items-start gap-3 text-sm text-foreground hover:text-primary transition-colors group"
                  >
                    <BookOpen className="size-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="group-hover:underline underline-offset-2 leading-snug">
                        {article.title}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {article.category}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/support/kb"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
            >
              Vào Knowledge Base <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </Section>

      <CTABanner
        title="Cần hỗ trợ khẩn cấp?"
        description="Gọi hotline 1800 5688 (miễn phí) hoặc gửi ticket — đội ngũ hỗ trợ luôn sẵn sàng trong giờ làm việc."
        primaryAction={{ label: "Gửi ticket hỗ trợ", to: "/support/ticket-new" }}
        secondaryAction={{ label: "Xem FAQ", to: "/support/faq" }}
        variant="dark"
      />
    </>
  );
}
