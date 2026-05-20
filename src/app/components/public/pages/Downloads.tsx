import { useState } from "react";
import type { ReactNode } from "react";
import { Download, FileText, FileSpreadsheet, File, Archive, FileType } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../ui/utils";
import { HeroSection } from "../marketing/HeroSection";
import { Section, SectionHeading } from "../marketing/Section";
import { CTABanner } from "../marketing/CTABanner";
import { downloads } from "../mock-data";
import type { DownloadItem } from "../mock-data";

const FILE_ICONS: Record<DownloadItem["fileType"], ReactNode> = {
  PDF: <FileText className="size-5 text-red-500" />,
  DOCX: <File className="size-5 text-blue-500" />,
  XLSX: <FileSpreadsheet className="size-5 text-green-600" />,
  PPTX: <FileType className="size-5 text-orange-500" />,
  ZIP: <Archive className="size-5 text-purple-500" />,
};

const CATEGORIES = ["Tất cả", "Tài liệu marketing", "Học liệu mẫu", "Hướng dẫn vận hành", "Biểu mẫu", "Báo cáo & Nghiên cứu"];

export function Downloads() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const filtered =
    activeCategory === "Tất cả"
      ? downloads
      : downloads.filter((d) => d.category === activeCategory);

  return (
    <>
      <HeroSection
        variant="centered"
        eyebrow="Tài nguyên"
        title={
          <>
            Tải tài liệu{" "}
            <span className="text-primary">Geleximco STEM</span>
          </>
        }
        subtitle="Brochure, học liệu mẫu, hướng dẫn vận hành, biểu mẫu và báo cáo — tất cả miễn phí cho trường và giáo viên."
        background="tint"
      />

      <Section background="default">
        <SectionHeading
          eyebrow="Thư viện tài liệu"
          title="Tất cả tài liệu miễn phí"
          subtitle="Chọn danh mục để lọc tài liệu phù hợp với nhu cầu của bạn."
        />

        <div className="flex flex-wrap gap-2 mb-10">
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

        <div className="space-y-3">
          {filtered.map((item) => {
            const updated = new Date(item.updatedAt).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
            return (
              <div
                key={item.id}
                className="bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  {FILE_ICONS[item.fileType]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground leading-snug">{item.title}</h3>
                    <span className="px-2 py-0.5 rounded bg-secondary text-[10px] font-semibold text-muted-foreground uppercase">
                      {item.fileType}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{item.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {item.targetAudience && <span>Dành cho: {item.targetAudience}</span>}
                    <span>{item.fileSize}</span>
                    <span>Cập nhật: {updated}</span>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <a href={item.url} download>
                    <Download className="size-4 mr-1.5" /> Tải xuống
                  </a>
                </Button>
              </div>
            );
          })}
        </div>
      </Section>

      <CTABanner
        title="Cần tài liệu theo yêu cầu đặc biệt?"
        description="Liên hệ đội ngũ tư vấn để nhận tài liệu tùy chỉnh theo bậc học, chương trình hoặc gói phòng STEM của trường bạn."
        primaryAction={{ label: "Liên hệ yêu cầu tài liệu", to: "/contact" }}
        variant="primary"
      />
    </>
  );
}
