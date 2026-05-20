import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, GraduationCap, Boxes, Lightbulb, Cpu, Microscope, BookOpen, Clock, Users } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";
import { HeroSection } from "../marketing/HeroSection";
import { Section, SectionHeading } from "../marketing/Section";
import { CTABanner } from "../marketing/CTABanner";
import { stemPrograms } from "../mock-data";
import type { GradeLevel } from "../mock-data";

const PROGRAM_ICONS = {
  CT1: <GraduationCap className="size-5" />,
  CT2: <Boxes className="size-5" />,
  CT3: <Lightbulb className="size-5" />,
  CT4: <Cpu className="size-5" />,
  CT5: <Microscope className="size-5" />,
};

const GRADE_LABELS: Record<GradeLevel, string> = {
  MN: "Mầm non",
  TH: "Tiểu học",
  THCS: "THCS",
  THPT: "THPT",
  LC: "Liên cấp",
  THPT_Nghe: "THPT Nghề",
};

const GUIDE_ITEMS = [
  {
    question: "Trường tiểu học muốn bắt đầu STEM từ chương trình chính khóa?",
    answer: "CT1 — Tích hợp nội môn",
    programId: "ct1",
    hint: "GV bộ môn dạy theo tư duy STEM trong tiết học thông thường.",
  },
  {
    question: "Trường THCS có nhiều giáo viên bộ môn khác nhau, muốn dạy chủ đề liên môn?",
    answer: "CT2 — Tích hợp liên môn",
    programId: "ct2",
    hint: "Nhóm 2-3 GV phối hợp dạy chủ đề chung, xếp tiết chuyên đề.",
  },
  {
    question: "Trường có buổi học thứ 2, muốn HS giải quyết vấn đề thực tế?",
    answer: "CT3 — Tăng cường đổi mới sáng tạo",
    programId: "ct3",
    hint: "Học project-based learning sau giờ chính khóa.",
  },
  {
    question: "Trường THCS/THPT muốn đưa Robotics, AI vào chương trình?",
    answer: "CT4 — Robotics / AI / IoT",
    programId: "ct4",
    hint: "Chương trình chuyên sâu, có thể xếp TKB hoặc CLB.",
  },
  {
    question: "Trường có học sinh năng khiếu, muốn thi NCKH cấp tỉnh/quốc gia?",
    answer: "CT5 — Trải nghiệm / NCKH",
    programId: "ct5",
    hint: "Dành cho CLB năng khiếu, hoạt động ngoại khóa.",
  },
];

export function ProgramsHub() {
  const [activeProgram, setActiveProgram] = useState(stemPrograms[0].id);
  const current = stemPrograms.find((p) => p.id === activeProgram)!;

  return (
    <>
      <HeroSection
        variant="centered"
        eyebrow="Chương trình giảng dạy"
        title={
          <>
            5 Chương trình STEM{" "}
            <span className="text-primary">chuẩn Bộ GD&amp;ĐT</span>
          </>
        }
        subtitle="Mapping chuẩn với SGK Bộ 'Kết nối tri thức với cuộc sống'. Phù hợp mọi bậc học từ Mầm non đến THPT Nghề, linh hoạt về hình thức tổ chức."
        primaryAction={{ label: "Tư vấn chương trình", to: "/contact" }}
        background="tint"
      />

      {/* Interactive Program Explorer */}
      <Section background="default">
        <SectionHeading
          eyebrow="Khám phá"
          title="Tìm hiểu từng chương trình"
          subtitle="Chọn chương trình để xem mô tả chi tiết, hình thức tổ chức và bài học mẫu."
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
              {PROGRAM_ICONS[p.id as keyof typeof PROGRAM_ICONS]}
              <span>{p.name} — {p.fullName}</span>
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 lg:p-10 shadow-sm">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                {current.name}
              </span>
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 leading-tight">
                {current.fullName}
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed mb-6">
                {current.description}
              </p>

              <dl className="space-y-3 text-sm mb-6">
                <div className="flex gap-3">
                  <dt className="font-semibold text-foreground min-w-[140px] flex items-center gap-2">
                    <Clock className="size-4 text-primary" /> Hình thức:
                  </dt>
                  <dd className="text-muted-foreground">{current.schedulingMode}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="font-semibold text-foreground min-w-[140px] flex items-center gap-2">
                    <Users className="size-4 text-primary" /> Người dạy:
                  </dt>
                  <dd className="text-muted-foreground">{current.teacherType}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="font-semibold text-foreground min-w-[140px] flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" /> Cấu trúc:
                  </dt>
                  <dd className="text-muted-foreground">{current.dimension}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-2 mb-6">
                {current.suitableGrades.map((grade) => (
                  <span
                    key={grade}
                    className="px-2.5 py-1 rounded-full bg-secondary text-xs font-medium text-foreground"
                  >
                    {GRADE_LABELS[grade]}
                  </span>
                ))}
                {current.sgkMapping && (
                  <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
                    Mapping SGK Kết nối tri thức
                  </span>
                )}
              </div>

              <Button asChild>
                <Link to={`/programs/${current.id.toLowerCase()}`}>
                  Xem chi tiết {current.name} <ArrowRight className="size-4 ml-2" />
                </Link>
              </Button>
            </div>

            {current.sampleLessons && (
              <div>
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                  Bài học mẫu
                </h4>
                <ul className="space-y-3">
                  {current.sampleLessons.map((lesson, i) => (
                    <li
                      key={i}
                      className="flex gap-3 items-start p-3 rounded-lg bg-secondary text-sm text-foreground"
                    >
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {lesson}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* All 5 Programs Grid */}
      <Section background="muted">
        <SectionHeading
          eyebrow="Tổng quan"
          title="5 chương trình — 1 hệ thống nhất quán"
          subtitle="Mỗi chương trình có vai trò và đối tượng riêng, nhưng cùng chia sẻ tài nguyên và dữ liệu trên một nền tảng."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stemPrograms.map((p) => (
            <Link
              key={p.id}
              to={`/programs/${p.id.toLowerCase()}`}
              className="group bg-card border border-border rounded-xl p-6 hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {PROGRAM_ICONS[p.id as keyof typeof PROGRAM_ICONS]}
                </div>
                <div>
                  <span className="text-xs font-bold text-primary">{p.name}</span>
                  <h3 className="text-sm font-semibold text-foreground leading-tight">{p.fullName}</h3>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                {p.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {p.suitableGrades.slice(0, 3).map((grade) => (
                  <span key={grade} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-muted-foreground">
                    {GRADE_LABELS[grade]}
                  </span>
                ))}
                {p.suitableGrades.length > 3 && (
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-muted-foreground">
                    +{p.suitableGrades.length - 3}
                  </span>
                )}
              </div>
            </Link>
          ))}
          {/* placeholder for 5th program to fill grid */}
        </div>
      </Section>

      {/* Guidance section */}
      <Section background="default">
        <SectionHeading
          eyebrow="Gợi ý lựa chọn"
          title="Chương trình nào phù hợp với trường bạn?"
          subtitle="Trả lời 1 câu hỏi để tìm chương trình tối ưu."
        />
        <div className="space-y-4 max-w-3xl mx-auto">
          {GUIDE_ITEMS.map((item) => (
            <div
              key={item.programId}
              className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{item.question}</p>
                <p className="text-xs text-muted-foreground/70">{item.hint}</p>
              </div>
              <Link
                to={`/programs/${item.programId}`}
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap"
              >
                {item.answer} <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </Section>

      <CTABanner
        title="Sẵn sàng triển khai chương trình STEM?"
        description="Liên hệ để được tư vấn chọn gói phòng STEM và chương trình phù hợp với bậc học, ngân sách của trường."
        primaryAction={{ label: "Đăng ký tư vấn", to: "/contact" }}
        secondaryAction={{ label: "Xem gói phòng STEM", to: "/solutions" }}
        variant="primary"
      />
    </>
  );
}
