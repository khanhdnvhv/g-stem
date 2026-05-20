import type { ReactNode } from "react";
import { Link } from "react-router";
import { BookOpen, Clock, Users, Check, GraduationCap, Boxes, Lightbulb, Cpu, Microscope } from "lucide-react";
import { cn } from "../../ui/utils";
import { HeroSection } from "../marketing/HeroSection";
import { Section, SectionHeading } from "../marketing/Section";
import { CTABanner } from "../marketing/CTABanner";
import { stemPrograms } from "../mock-data";
import type { Program, GradeLevel } from "../mock-data";

const PROGRAM_ICONS: Record<Program, ReactNode> = {
  CT1: <GraduationCap className="size-8" />,
  CT2: <Boxes className="size-8" />,
  CT3: <Lightbulb className="size-8" />,
  CT4: <Cpu className="size-8" />,
  CT5: <Microscope className="size-8" />,
};

const GRADE_LABELS: Record<GradeLevel, string> = {
  MN: "Mầm non",
  TH: "Tiểu học",
  THCS: "THCS",
  THPT: "THPT",
  LC: "Liên cấp",
  THPT_Nghe: "THPT Nghề",
};

interface ProgramDetailPageProps {
  programId: Program;
}

function ProgramDetailPage({ programId }: ProgramDetailPageProps) {
  const program = stemPrograms.find((p) => p.id === programId)!;

  return (
    <>
      <HeroSection
        variant="split"
        eyebrow={program.tagline}
        title={
          <>
            <span className="text-primary">{program.name}</span>
            <br />
            {program.fullName}
          </>
        }
        subtitle={program.description}
        primaryAction={{ label: "Tư vấn triển khai", to: "/contact" }}
        secondaryAction={{ label: "Xem tất cả chương trình", to: "/programs" }}
        background="tint"
        trustBadges={
          <div className="flex flex-wrap gap-2">
            {program.sgkMapping && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                ✓ Mapping SGK Kết nối tri thức
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              Chuẩn Bộ GD&amp;ĐT
            </span>
          </div>
        }
      />

      {/* Key Facts */}
      <Section background="default">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Clock className="size-5" />
            </div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Hình thức tổ chức
            </h4>
            <p className="text-base font-semibold text-foreground">{program.schedulingMode}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Users className="size-5" />
            </div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Người dạy
            </h4>
            <p className="text-base font-semibold text-foreground">{program.teacherType}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
              <BookOpen className="size-5" />
            </div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Cấu trúc chương trình
            </h4>
            <p className="text-base font-semibold text-foreground">{program.dimension}</p>
          </div>
        </div>
      </Section>

      {/* Grades + Materials */}
      <Section background="muted">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-6">Bậc học áp dụng</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {program.suitableGrades.map((grade) => (
                <span
                  key={grade}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
                >
                  {GRADE_LABELS[grade]}
                </span>
              ))}
            </div>

            {program.sampleLessons && (
              <>
                <h3 className="text-xl font-bold text-foreground mb-4">Bài học mẫu</h3>
                <ul className="space-y-3">
                  {program.sampleLessons.map((lesson, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-foreground leading-snug">{lesson}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {program.materialTypes && (
            <div>
              <h3 className="text-xl font-bold text-foreground mb-6">Tài liệu &amp; học liệu đi kèm</h3>
              <ul className="space-y-3">
                {program.materialTypes.map((mat) => (
                  <li key={mat} className="flex gap-3 items-start">
                    <Check className="size-4 text-primary shrink-0 mt-1" />
                    <span className="text-foreground">{mat}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 p-5 bg-card border border-border rounded-xl">
                <p className="text-sm text-muted-foreground mb-3">
                  Muốn xem demo bài giảng và tài liệu mẫu của {program.name}?
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  Liên hệ để nhận demo miễn phí →
                </Link>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Other Programs */}
      <Section background="default">
        <SectionHeading
          eyebrow="Chương trình khác"
          title="Khám phá thêm các chương trình STEM"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stemPrograms
            .filter((p) => p.id !== programId)
            .map((p) => (
              <Link
                key={p.id}
                to={`/programs/${p.id.toLowerCase()}`}
                className={cn(
                  "group bg-card border border-border rounded-xl p-5 hover:shadow-md hover:-translate-y-1 transition-all"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {PROGRAM_ICONS[p.id]}
                </div>
                <span className="text-xs font-bold text-primary">{p.name}</span>
                <h4 className="text-sm font-semibold text-foreground leading-tight mt-0.5">
                  {p.fullName}
                </h4>
              </Link>
            ))}
        </div>
      </Section>

      <CTABanner
        title={`Triển khai ${program.name} tại trường bạn`}
        description="Đội ngũ chuyên gia sẵn sàng hỗ trợ từ tư vấn, tập huấn GV đến đồng hành trong suốt quá trình dạy học."
        primaryAction={{ label: "Đăng ký tư vấn ngay", to: "/contact" }}
        secondaryAction={{ label: "Xem gói phòng STEM", to: "/solutions" }}
        variant="primary"
      />
    </>
  );
}

export const ProgramCT1 = () => <ProgramDetailPage programId="CT1" />;
export const ProgramCT2 = () => <ProgramDetailPage programId="CT2" />;
export const ProgramCT3 = () => <ProgramDetailPage programId="CT3" />;
export const ProgramCT4 = () => <ProgramDetailPage programId="CT4" />;
export const ProgramCT5 = () => <ProgramDetailPage programId="CT5" />;
