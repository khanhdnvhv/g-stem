import { Target, Heart, Gem } from "lucide-react";
import { HeroSection } from "../marketing/HeroSection";
import { Section, SectionHeading } from "../marketing/Section";
import { StatCard } from "../marketing/StatCard";
import { CTABanner } from "../marketing/CTABanner";
import { leadershipTeam, companyMilestones, platformStats } from "../mock-data";

const CORE_VALUES = [
  {
    icon: <Target className="size-7" />,
    title: "Sứ mệnh",
    body: "Mang giáo dục STEM chất lượng cao đến với mọi trường học Việt Nam, từ thành thị đến nông thôn, góp phần phát triển thế hệ trẻ sáng tạo và tư duy phản biện.",
  },
  {
    icon: <Heart className="size-7" />,
    title: "Tầm nhìn",
    body: "Trở thành nền tảng STEM toàn diện số 1 Việt Nam, kết nối hệ sinh thái nhà trường – giáo viên – học sinh – nhà xuất bản – nhà cung cấp thiết bị.",
  },
  {
    icon: <Gem className="size-7" />,
    title: "Giá trị cốt lõi",
    body: "Chất lượng chuẩn quốc gia · Đồng hành dài hạn · Minh bạch trong vận hành · Sáng tạo không ngừng · Vì học sinh Việt Nam.",
  },
];

export function About() {
  return (
    <>
      <HeroSection
        variant="centered"
        eyebrow="Về chúng tôi"
        title={
          <>
            Kiến tạo tương lai STEM
            <br />
            <span className="text-primary">cho trẻ em Việt Nam</span>
          </>
        }
        subtitle="Geleximco STEM là nền tảng giáo dục STEM toàn diện được phát triển bởi Tập đoàn Geleximco, đồng hành cùng hàng nghìn trường học trên toàn quốc."
        background="tint"
      />

      <Section background="default">
        <SectionHeading
          eyebrow="Định hướng"
          title="Sứ mệnh · Tầm nhìn · Giá trị"
          subtitle="Ba trụ cột định hướng mọi hoạt động của Geleximco STEM."
        />
        <div className="grid md:grid-cols-3 gap-6">
          {CORE_VALUES.map((v) => (
            <div key={v.title} className="bg-card border border-border rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                {v.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{v.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section background="muted">
        <SectionHeading
          eyebrow="Hành trình"
          title="Câu chuyện của chúng tôi"
          subtitle="Từ ý tưởng đến nền tảng STEM hàng đầu Việt Nam — hành trình không ngừng đổi mới."
        />
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-6">
            {companyMilestones.map((m) => (
              <div key={m.year} className="relative flex gap-6">
                <div className="relative flex-none w-12 flex items-start justify-center pt-3">
                  <div className="w-3 h-3 rounded-full bg-primary border-2 border-background z-10" />
                </div>
                <div className="bg-card border border-border rounded-xl p-5 flex-1 shadow-sm">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-bold mb-2">
                    {m.year}
                  </span>
                  <h4 className="text-base font-semibold text-foreground mb-1">{m.event}</h4>
                  {m.detail && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{m.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section background="default">
        <SectionHeading eyebrow="Tác động" title="Con số nói lên tất cả" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {platformStats.map((stat) => (
            <StatCard key={stat.label} value={stat.value} unit={stat.unit} label={stat.label} />
          ))}
        </div>
      </Section>

      <Section background="muted">
        <SectionHeading
          eyebrow="Đội ngũ"
          title="Ban lãnh đạo Geleximco STEM"
          subtitle="Các chuyên gia giáo dục và công nghệ hàng đầu, cùng chung tay xây dựng tương lai STEM Việt Nam."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leadershipTeam.map((member) => (
            <div
              key={member.name}
              className="bg-card border border-border rounded-xl p-6 flex gap-4 items-start"
            >
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-14 h-14 rounded-full object-cover shrink-0"
              />
              <div>
                <p className="font-semibold text-foreground">{member.name}</p>
                <p className="text-xs text-primary font-medium mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <CTABanner
        title="Cùng chúng tôi kiến tạo giáo dục STEM"
        description="Liên hệ đội ngũ tư vấn để nhận khảo sát miễn phí và lộ trình STEM phù hợp cho trường bạn."
        primaryAction={{ label: "Đăng ký tư vấn", to: "/contact" }}
        secondaryAction={{ label: "Xem giải pháp", to: "/solutions" }}
        variant="primary"
      />
    </>
  );
}
