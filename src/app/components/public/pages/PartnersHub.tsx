import { Link } from "react-router";
import { ArrowRight, Layers, BookOpen, Cpu } from "lucide-react";
import { HeroSection } from "../marketing/HeroSection";
import { Section, SectionHeading } from "../marketing/Section";
import { CTABanner } from "../marketing/CTABanner";
import { partners } from "../mock-data";

const PARTNER_ICONS = [
  <Layers className="size-6" />,
  <BookOpen className="size-6" />,
  <Cpu className="size-6" />,
];

const ECOSYSTEM_ROLES = [
  {
    slug: "geleximco-stem",
    color: "border-primary/30 bg-primary/5",
    iconColor: "bg-primary/10 text-primary",
    tag: "Nền tảng",
    tagBg: "bg-primary text-primary-foreground",
    position: "Platform owner & System integrator",
  },
  {
    slug: "ebd",
    color: "border-accent/30 bg-accent/5",
    iconColor: "bg-accent/10 text-accent",
    tag: "Học liệu",
    tagBg: "bg-accent text-sidebar-primary-foreground",
    position: "Content provider — Học liệu STEM chuẩn Bộ GD&ĐT",
  },
  {
    slug: "nexta",
    color: "border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10",
    iconColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    tag: "Thiết bị",
    tagBg: "bg-blue-600 text-white",
    position: "Hardware & Software — Robotics/AI/IoT",
  },
];

export function PartnersHub() {
  return (
    <>
      <HeroSection
        variant="centered"
        eyebrow="Hệ sinh thái đối tác"
        title={
          <>
            Ba trụ cột tạo nên{" "}
            <span className="text-primary">Geleximco STEM</span>
          </>
        }
        subtitle="Geleximco (nền tảng tổng thể) + EBD (học liệu chuẩn Bộ GD&ĐT) + Nexta (thiết bị Robotics/AI/IoT) — hội tụ thành hệ sinh thái STEM toàn diện nhất Việt Nam."
        primaryAction={{ label: "Liên hệ hợp tác", to: "/contact" }}
        background="tint"
      />

      {/* Ecosystem Visual */}
      <Section background="default">
        <SectionHeading
          eyebrow="Hệ sinh thái"
          title="Mỗi đối tác, một vai trò cốt lõi"
          subtitle="Ba đối tác chiến lược bổ trợ nhau, tạo ra giải pháp STEM không có khoảng trống."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {partners.map((partner, i) => {
            const eco = ECOSYSTEM_ROLES.find((e) => e.slug === partner.slug)!;
            return (
              <Link
                key={partner.id}
                to={`/partners/${partner.slug}`}
                className={`group rounded-2xl border p-6 lg:p-8 hover:shadow-lg hover:-translate-y-1 transition-all ${eco.color}`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${eco.iconColor}`}>
                    {PARTNER_ICONS[i]}
                  </div>
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${eco.tagBg}`}>
                      {eco.tag}
                    </span>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {partner.name}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
                  {eco.position}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                  {partner.description}
                </p>
                <ul className="space-y-1.5 mb-5">
                  {partner.contributions.slice(0, 3).map((c) => (
                    <li key={c} className="flex gap-2 items-start text-xs text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-current mt-1.5 shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  Tìm hiểu chi tiết <ArrowRight className="size-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* How they work together */}
      <Section background="muted">
        <SectionHeading
          eyebrow="Cơ chế phối hợp"
          title="Cùng tạo ra trải nghiệm STEM hoàn chỉnh"
        />
        <div className="max-w-3xl mx-auto">
          <div className="space-y-5">
            {[
              {
                step: "01",
                title: "Thiết kế giải pháp",
                body: "Geleximco khảo sát nhu cầu nhà trường, lựa chọn tier phòng STEM và chương trình CT phù hợp với bậc học và ngân sách.",
              },
              {
                step: "02",
                title: "EBD cung cấp học liệu",
                body: "NXB ĐH Sư Phạm cung cấp trọn bộ tài liệu CT1-CT3 chuẩn Bộ GD&ĐT, bao gồm giáo án, bài giảng PPTX, video và đề thi.",
              },
              {
                step: "03",
                title: "Nexta cung cấp thiết bị",
                body: "Nexta Technologies tích hợp bộ kit Robotics, thiết bị AI/IoT và phần mềm lập trình cho chương trình CT4, kèm hỗ trợ kỹ thuật.",
              },
              {
                step: "04",
                title: "Geleximco đồng hành vận hành",
                body: "Nền tảng số quản lý toàn bộ vòng đời: từ tập huấn GV, xếp TKB STEM, theo dõi tiến độ học sinh đến báo cáo CQQL.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-5 bg-card border border-border rounded-xl p-5">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <CTABanner
        title="Quan tâm đến hợp tác đối tác?"
        description="Geleximco STEM luôn mở rộng hệ sinh thái với các đơn vị cung cấp thiết bị, nội dung và phần mềm giáo dục chất lượng cao."
        primaryAction={{ label: "Liên hệ hợp tác", to: "/contact" }}
        secondaryAction={{ label: "Tìm hiểu giải pháp", to: "/solutions" }}
        variant="dark"
      />
    </>
  );
}
