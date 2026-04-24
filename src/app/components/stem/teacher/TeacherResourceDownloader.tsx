import { useState } from "react";
import {
  FolderOpen, Search, Download, FileText, Video, Image as ImageIcon,
  BookOpen, Eye, Filter,
} from "lucide-react";
import { lessons, STEM_PROGRAMS } from "../../mock-data/index";
import type { StemProgram } from "../../mock-data/index";
import { PageHeader } from "../ui/PageHeader";
import { ProgramBadge } from "../ui/badges";
import { KpiCard } from "../ui/KpiCard";
import { toast } from "sonner";

/* ================================================================ */
/*  TEACHER RESOURCE DOWNLOADER — tải giáo án CT1-CT5               */
/* ================================================================ */

export function TeacherResourceDownloader() {
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<StemProgram | "all">("all");

  const filtered = lessons.filter((l) => {
    if (programFilter !== "all" && l.programCode !== programFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!l.title.toLowerCase().includes(s) && !l.subject.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <PageHeader
        icon={FolderOpen}
        title="Kho Học liệu & Giáo án"
        subtitle="Truy cập kho lưu trữ số của NCC để khai thác giáo án, tài liệu hướng dẫn giảng dạy chuyên biệt theo CT1–CT5."
        accentColor="#0891b2"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={BookOpen} label="Tổng bài giảng" value={lessons.length} color="#0891b2" />
        <KpiCard icon={FileText} label="Có mapping SGK" value={lessons.filter((l) => l.sgkMapping).length} color="#2563eb" />
        <KpiCard icon={Video} label="Đã xem/tải" value="12" color="#c8a84e" />
        <KpiCard icon={Download} label="Lượt tải tuần này" value={5} color="#16a34a" trend="up" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm bài giảng, bộ môn..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg outline-none"
            style={{ fontSize: "13px" }} />
        </div>
        <button onClick={() => setProgramFilter("all")}
          className={`px-3 py-2 rounded-lg border ${programFilter === "all" ? "bg-[#0891b2] text-white border-[#0891b2]" : "bg-card border-border hover:bg-secondary"}`}
          style={{ fontSize: "12px", fontWeight: 500 }}>
          Tất cả ({lessons.length})
        </button>
        {(Object.keys(STEM_PROGRAMS) as StemProgram[]).map((code) => {
          const p = STEM_PROGRAMS[code];
          const count = lessons.filter((l) => l.programCode === code).length;
          return (
            <button key={code} onClick={() => setProgramFilter(code)}
              className={`px-3 py-2 rounded-lg border ${programFilter === code ? "text-white border-transparent" : "bg-card border-border hover:bg-secondary"}`}
              style={{
                fontSize: "12px", fontWeight: 500,
                ...(programFilter === code ? { backgroundColor: p.color } : {}),
              }}>
              {code} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((l) => (
          <div key={l.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all">
            <div className="h-32 bg-secondary overflow-hidden relative">
              <img src={l.thumbnail} alt={l.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2">
                <ProgramBadge code={l.programCode} size="md" />
              </div>
              {l.sgkMapping && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 rounded text-[#2563eb]" style={{ fontSize: "10px", fontWeight: 700 }}>
                  SGK
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-foreground line-clamp-2" style={{ fontSize: "13px", fontWeight: 600 }}>{l.title}</h3>
              <p className="text-muted-foreground mt-1 line-clamp-2" style={{ fontSize: "11.5px" }}>{l.description}</p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap text-muted-foreground" style={{ fontSize: "10.5px" }}>
                <span className="px-1.5 py-0.5 bg-secondary rounded">{l.subject}</span>
                <span className="px-1.5 py-0.5 bg-secondary rounded">{l.gradeLevel}</span>
                <span className="px-1.5 py-0.5 bg-secondary rounded">{l.durationMinutes}p</span>
              </div>
              {l.sgkMapping && (
                <p className="text-[#2563eb] mt-1.5" style={{ fontSize: "11px" }}>
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  {l.sgkMapping}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => toast.info(`Xem trước bài ${l.title}`)}
                  className="flex-1 px-3 py-1.5 border border-border rounded hover:bg-secondary flex items-center justify-center gap-1"
                  style={{ fontSize: "11.5px", fontWeight: 500 }}
                >
                  <Eye className="w-3 h-3" /> Xem
                </button>
                <button
                  onClick={() => toast.success(`Đã tải ${l.title} về thiết bị`)}
                  className="flex-1 px-3 py-1.5 bg-[#0891b2] text-white rounded hover:opacity-90 flex items-center justify-center gap-1"
                  style={{ fontSize: "11.5px", fontWeight: 500 }}
                >
                  <Download className="w-3 h-3" /> Tải giáo án
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TeacherResourceDownloader;
