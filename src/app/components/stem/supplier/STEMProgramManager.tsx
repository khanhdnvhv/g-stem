import { useState } from "react";
import {
  Puzzle, Plus, BookOpen, GraduationCap, Eye, Pencil, Info,
} from "lucide-react";
import { STEM_PROGRAMS, STEM_PROGRAM_LIST, lessons } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { toast } from "sonner";

/* ================================================================ */
/*  STEM PROGRAM MANAGER — CRUD 5 chương trình CT1-CT5               */
/* ================================================================ */

export function STEMProgramManager() {
  const [activeCode, setActiveCode] = useState<StemProgram>("CT1");
  const active = STEM_PROGRAMS[activeCode];
  const relatedLessons = lessons.filter((l) => l.programCode === activeCode);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Puzzle}
        title="Quản lý Chương trình STEM"
        subtitle="5 phân luồng chuẩn CT1–CT5 theo định hướng Bộ GD&ĐT, gắn kết với SGK"
        actions={
          <>
            <button
              onClick={() => toast.info("Mapping với SGK Kết nối Tri thức / Chân trời Sáng tạo")}
              className="flex items-center gap-1.5 px-3 py-2 border border-border bg-card rounded-lg hover:bg-secondary transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <BookOpen className="w-4 h-4" />
              Mapping SGK
            </button>
            <button
              onClick={() => toast.info("Thêm module học liệu mới cho chương trình hiện tại")}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#990803] text-white rounded-lg hover:bg-[#7a0602] transition-colors"
              style={{ fontSize: "13px", fontWeight: 500 }}
            >
              <Plus className="w-4 h-4" />
              Thêm module
            </button>
          </>
        }
      />

      {/* 5 Program cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {STEM_PROGRAM_LIST.map((p) => {
          const lessonCount = lessons.filter((l) => l.programCode === p.code).length;
          const isActive = p.code === activeCode;
          return (
            <button
              key={p.code}
              onClick={() => setActiveCode(p.code)}
              className={`bg-card rounded-xl border-2 p-4 text-left transition-all ${
                isActive ? "shadow-lg -translate-y-0.5" : "border-border hover:shadow-md"
              }`}
              style={{
                borderColor: isActive ? p.color : undefined,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-2 text-white"
                style={{ backgroundColor: p.color, fontSize: "14px", fontWeight: 700 }}
              >
                {p.code}
              </div>
              <h3 className="text-foreground" style={{ fontSize: "13px", fontWeight: 700 }}>
                {p.shortName}
              </h3>
              <p className="text-muted-foreground line-clamp-2 mt-1" style={{ fontSize: "11px" }}>
                {p.description}
              </p>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-muted-foreground" style={{ fontSize: "10px" }}>Bài giảng</span>
                <span className="text-foreground" style={{ fontSize: "14px", fontWeight: 700, color: p.color }}>
                  {lessonCount}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active program detail */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div
          className="p-5 text-white"
          style={{ background: `linear-gradient(135deg, ${active.color}, ${active.color}cc)` }}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm"
                  style={{ fontSize: "11px", fontWeight: 700 }}
                >
                  {active.code}
                </span>
                <h2 style={{ fontSize: "18px", fontWeight: 700 }}>{active.name}</h2>
              </div>
              <p className="opacity-90" style={{ fontSize: "13px", lineHeight: 1.6, maxWidth: "800px" }}>
                {active.description}
              </p>
            </div>
            <button
              onClick={() => toast.info(`Sửa thông tin chương trình ${active.code}`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors"
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              <Pencil className="w-3.5 h-3.5" />
              Sửa
            </button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <GraduationCap className="w-3.5 h-3.5" />
              CẤP HỌC HỖ TRỢ
            </div>
            <div className="flex flex-wrap gap-1.5">
              {active.supportedGrades.map((g) => (
                <span
                  key={g}
                  className="px-2 py-1 rounded-md bg-secondary text-foreground"
                  style={{ fontSize: "11px", fontWeight: 500 }}
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2 text-muted-foreground" style={{ fontSize: "11px", fontWeight: 600 }}>
              <BookOpen className="w-3.5 h-3.5" />
              BỘ MÔN ÁP DỤNG
            </div>
            <div className="flex flex-wrap gap-1.5">
              {active.supportedSubjects.map((s) => (
                <span
                  key={s}
                  className="px-2 py-1 rounded-md bg-secondary text-foreground"
                  style={{ fontSize: "11px", fontWeight: 500 }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lessons cho chương trình đang chọn */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ProgramBadge code={activeCode} size="md" />
            <h3 className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
              Bài giảng thuộc chương trình {active.shortName}
            </h3>
            <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
              ({relatedLessons.length})
            </span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {relatedLessons.slice(0, 8).map((l) => (
            <div key={l.id} className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors">
              <img src={l.thumbnail} alt={l.title} className="w-14 h-14 object-cover rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 500 }}>
                  {l.title}
                </p>
                <p className="text-muted-foreground line-clamp-1" style={{ fontSize: "11.5px" }}>
                  {l.description}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-muted-foreground" style={{ fontSize: "10.5px" }}>
                    {l.subject} · {l.gradeLevel}
                  </span>
                  {l.sgkMapping && (
                    <span className="px-1.5 py-0.5 rounded bg-[#2563eb]/10 text-[#2563eb]" style={{ fontSize: "10px" }}>
                      SGK: {l.sgkMapping}
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-secondary" style={{ fontSize: "10px" }}>
                    {l.durationMinutes} phút
                  </span>
                </div>
              </div>
              <button
                onClick={() => toast.info(`Xem bài ${l.title}`)}
                className="p-2 rounded-lg hover:bg-secondary"
                title="Xem trước"
              >
                <Eye className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
          {relatedLessons.length === 0 && (
            <div className="p-8 text-center text-muted-foreground" style={{ fontSize: "12px" }}>
              Chưa có bài giảng cho chương trình này.
            </div>
          )}
        </div>

        {relatedLessons.length > 8 && (
          <div className="p-3 border-t border-border text-center">
            <button className="text-[#990803] hover:underline" style={{ fontSize: "12px", fontWeight: 500 }}>
              Xem thêm {relatedLessons.length - 8} bài giảng
            </button>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-gradient-to-br from-[#c8a84e]/5 to-[#990803]/5 rounded-xl border border-border p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#990803] shrink-0 mt-0.5" />
        <div>
          <p className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
            Gắn kết với SGK Bộ GD&ĐT
          </p>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "12px", lineHeight: 1.6 }}>
            Mỗi bài giảng có thể được mapping với chương/bài cụ thể trong 3 bộ SGK hiện hành
            (Kết nối Tri thức, Chân trời Sáng tạo, Cánh Diều) để giáo viên dễ tích hợp vào
            tiết học chính khóa theo Thông tư 32/2020 và CV 1014.
          </p>
        </div>
      </div>
    </div>
  );
}

export default STEMProgramManager;
